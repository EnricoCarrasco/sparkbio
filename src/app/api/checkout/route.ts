import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createClient } from "@/lib/supabase/server";
import { stripe, PRICE_IDS, type BillingInterval, type Region } from "@/lib/stripe";

// ---------------------------------------------------------------------------
// Route: POST /api/checkout
// Creates a Stripe Checkout Session in EMBEDDED ui_mode.
// Returns { clientSecret, sessionId } for the frontend to mount with
// <EmbeddedCheckoutProvider clientSecret={...}>.
// ---------------------------------------------------------------------------

function isValidInterval(value: unknown): value is BillingInterval {
  return value === "monthly" || value === "yearly";
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  // --- Authentication ---
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // --- Parse and validate body ---
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const interval =
    body !== null && typeof body === "object" && "interval" in body
      ? (body as Record<string, unknown>).interval
      : undefined;

  if (!isValidInterval(interval)) {
    return NextResponse.json(
      { error: "invalid_interval", message: "interval must be 'monthly' or 'yearly'" },
      { status: 400 }
    );
  }

  // --- Geo-pricing routing ---
  // Trust ONLY Vercel's IP-based header — never client input. On any request
  // where the header is missing (local dev, non-Vercel edge), default to the
  // EUR region so the caller can't cheat their way into BRL pricing by POSTing
  // `{ country: "BR" }`.
  const headerCountry = request.headers.get("x-vercel-ip-country");
  const region: Region = headerCountry === "BR" ? "BR" : "default";

  const priceId = PRICE_IDS[interval][region];
  if (!priceId) {
    return NextResponse.json(
      { error: "price_not_configured", region, interval },
      { status: 500 }
    );
  }

  // --- Trial-abuse guard: one trial per user ---
  // If the user has EVER had a subscription (any status), skip the trial.
  // This blocks the "cancel-and-resubscribe to refresh the trial" loop.
  const { data: priorSubscription } = await supabase
    .from("subscriptions")
    .select("id, stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();
  const skipTrial = priorSubscription !== null;

  // --- Find or create Stripe customer ---
  // Reuse stripe_customer_id if we've ever created one for this user.
  // Otherwise, look up by email (idempotent) or create a fresh one.
  let customerId: string | null = priorSubscription?.stripe_customer_id ?? null;

  if (!customerId && user.email) {
    // Check if Stripe already has a customer with this email (e.g. leftover from
    // a previous checkout that didn't complete).
    const existing = await stripe.customers.list({ email: user.email, limit: 1 });
    customerId = existing.data[0]?.id ?? null;

    if (customerId) {
      // Make sure the user_id metadata is set on the existing customer
      await stripe.customers.update(customerId, {
        metadata: { user_id: user.id },
      });
    }
  }

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
      metadata: { user_id: user.id },
    });
    customerId = customer.id;
  }

  // --- Create the embedded checkout session ---
  const origin = new URL(request.url).origin;

  try {
    const session = await stripe.checkout.sessions.create({
      // Stripe API 2026-03-25.dahlia renamed 'embedded' → 'embedded_page'
      ui_mode: "embedded_page",
      mode: "subscription",
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      subscription_data: {
        trial_period_days: skipTrial ? undefined : 7,
        metadata: {
          user_id: user.id,
          region,
          interval,
        },
      },
      client_reference_id: user.id,
      metadata: {
        user_id: user.id,
        region,
        interval,
      },
      // After embedded checkout completes, Stripe redirects the iframe to this URL.
      // We use the ?session_id={CHECKOUT_SESSION_ID} template so the dashboard
      // shell can pick up the session ID if we ever need it.
      return_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}&upgraded=1`,
      allow_promotion_codes: true,
      automatic_tax: { enabled: false },
    });

    if (!session.client_secret) {
      console.error("[checkout] session created but no client_secret returned");
      return NextResponse.json({ error: "no_client_secret" }, { status: 500 });
    }

    return NextResponse.json({
      clientSecret: session.client_secret,
      sessionId: session.id,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[checkout] createCheckoutSession error:", msg);
    Sentry.captureException(err, {
      tags: { surface: "checkout", region, interval },
      user: { id: user.id, email: user.email ?? undefined },
    });
    return NextResponse.json({ error: "checkout_failed", message: msg }, { status: 500 });
  }
}
