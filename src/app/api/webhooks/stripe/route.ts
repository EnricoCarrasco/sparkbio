import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import Stripe from "stripe";
import { stripe, mapStripeStatus, getCurrentPeriodEnd } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { processReferralConversion, cancelPendingReferralEarnings } from "@/lib/referral";

// ---------------------------------------------------------------------------
// Route: POST /api/webhooks/stripe
// Handles all Stripe webhook events for subscription lifecycle.
//
// Events subscribed to (set up via `stripe listen --events ...` locally,
// or via Dashboard → Webhooks → Add endpoint for production):
//   - customer.subscription.created
//   - customer.subscription.updated
//   - customer.subscription.deleted
//   - invoice.paid                (defensive period rollover confirmation)
//   - invoice.payment_failed      (past_due)
//   - checkout.session.completed  (mainly for analytics / referral fallback)
// ---------------------------------------------------------------------------

export const runtime = "nodejs"; // Stripe needs Node crypto

async function readRawBody(request: NextRequest): Promise<string> {
  // Stripe signature verification requires the raw body bytes, not a parsed
  // JSON object. request.text() gives us the raw UTF-8 body.
  return await request.text();
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let rawBody: string;
  try {
    rawBody = await readRawBody(request);
  } catch {
    console.error("[webhook] failed to read request body");
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    console.error("[webhook] missing stripe-signature header");
    return NextResponse.json({ error: "missing_signature" }, { status: 401 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[webhook] invalid signature:", msg);
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Dispatch on event type
  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscription(sub, event);
        break;
      }
      case "invoice.paid": {
        // When an invoice is paid, the subscription.updated event also fires.
        // We rely on that for status. This handler is a defensive no-op today.
        break;
      }
      case "invoice.payment_failed": {
        // subscription.updated with past_due will fire alongside this; no-op.
        break;
      }
      case "checkout.session.completed": {
        // The subscription.created event is the authoritative one.
        // We don't write any state here — just log for observability.
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("[webhook] checkout.session.completed", {
          sessionId: session.id,
          userId: session.client_reference_id ?? session.metadata?.user_id,
          subscriptionId: session.subscription,
        });
        break;
      }
      default:
        // Unhandled event — log and acknowledge so Stripe doesn't retry.
        console.log("[webhook] unhandled event:", event.type);
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[webhook] handler error:", event.type, msg);
    return NextResponse.json({ error: "handler_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

// ---------------------------------------------------------------------------
// Subscription lifecycle
// ---------------------------------------------------------------------------

async function handleSubscription(
  sub: Stripe.Subscription,
  event: Stripe.Event
): Promise<void> {
  // user_id was attached via subscription_data.metadata when the checkout
  // session was created. Fall back to customer metadata if somehow missing.
  let userId = sub.metadata?.user_id;

  if (!userId && sub.customer && typeof sub.customer === "string") {
    try {
      const customer = await stripe.customers.retrieve(sub.customer);
      if (!customer.deleted) {
        userId = (customer as Stripe.Customer).metadata?.user_id;
      }
    } catch (err) {
      console.error("[webhook] could not retrieve customer for user_id lookup:", err);
    }
  }

  if (!userId) {
    console.error(
      "[webhook] no user_id in subscription metadata or customer metadata:",
      sub.id
    );
    return;
  }

  const mapped = mapStripeStatus(sub.status);
  if (!mapped) {
    console.log(
      "[webhook] skipping subscription in transient state:",
      sub.status,
      sub.id
    );
    return;
  }

  const supabase = createAdminClient();

  // Ordering guard: event.created is a monotonic Stripe-side timestamp.
  // If we already stored a newer event for this user, ignore this one.
  const incomingAt = new Date(event.created * 1000).toISOString();

  const { data: current } = await supabase
    .from("subscriptions")
    .select("stripe_subscription_id, stripe_updated_at")
    .eq("user_id", userId)
    .maybeSingle();

  if (current?.stripe_updated_at) {
    const stored = new Date(current.stripe_updated_at).getTime();
    const incoming = new Date(incomingAt).getTime();
    if (Number.isFinite(incoming) && Number.isFinite(stored) && incoming < stored) {
      console.warn("[webhook] ignoring stale event", {
        userId,
        event: event.type,
        incomingSubId: sub.id,
        currentSubId: current.stripe_subscription_id,
        incomingAt,
        storedAt: current.stripe_updated_at,
      });
      return;
    }
  }

  // Extract subscription fields (handle API 2026-03-25 period migration)
  const periodEndUnix = getCurrentPeriodEnd(sub);
  const priceId = sub.items.data[0]?.price.id ?? null;
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;

  const { error: upsertError } = await supabase
    .from("subscriptions")
    .upsert(
      {
        user_id: userId,
        stripe_subscription_id: sub.id,
        stripe_customer_id: customerId,
        stripe_price_id: priceId,
        status: mapped,
        current_period_end: periodEndUnix
          ? new Date(periodEndUnix * 1000).toISOString()
          : null,
        trial_ends_at: sub.trial_end ? new Date(sub.trial_end * 1000).toISOString() : null,
        cancel_at: sub.cancel_at ? new Date(sub.cancel_at * 1000).toISOString() : null,
        stripe_updated_at: incomingAt,
      },
      { onConflict: "user_id" }
    );

  if (upsertError) {
    console.error("[webhook] subscription upsert error:", upsertError.message);
    throw new Error(upsertError.message);
  }

  // Background work: referral accounting + premium perk reset
  after(async () => {
    try {
      if (mapped === "active" || mapped === "on_trial") {
        await processReferralConversion(userId, sub.id, priceId ?? "");
      }
      if (mapped === "cancelled" || mapped === "expired") {
        await cancelPendingReferralEarnings(sub.id);
        const supa = createAdminClient();
        const { error: themeError } = await supa
          .from("themes")
          .update({ hide_footer: false })
          .eq("user_id", userId);
        if (themeError) {
          console.error(
            "[webhook] failed to reset hide_footer for user:",
            userId,
            "|",
            themeError.message
          );
        }
      }
    } catch (err) {
      console.error("[webhook] background task error:", err);
    }
  });
}
