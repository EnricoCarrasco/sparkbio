import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { stripe } from "@/lib/stripe";

// ---------------------------------------------------------------------------
// Route: POST /api/portal
// Creates a Stripe Billing Portal session for the authenticated user.
// The portal lets them cancel, update payment method, view invoices, etc.
// Returns { url } for client-side redirect.
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: sub } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!sub?.stripe_customer_id) {
    return NextResponse.json(
      { error: "no_stripe_customer", message: "No Stripe subscription found for this user" },
      { status: 404 }
    );
  }

  try {
    const portal = await stripe.billingPortal.sessions.create({
      customer: sub.stripe_customer_id,
      return_url: `${new URL(request.url).origin}/dashboard/settings`,
    });
    return NextResponse.json({ url: portal.url });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[portal] create session error:", msg);
    // Most common cause: Billing Portal not configured in Dashboard.
    // Surface a clearer hint to the user/logs.
    return NextResponse.json(
      {
        error: "portal_not_configured",
        message:
          "Stripe Billing Portal is not configured. Activate it at Stripe Dashboard → Settings → Billing → Customer portal.",
      },
      { status: 500 }
    );
  }
}
