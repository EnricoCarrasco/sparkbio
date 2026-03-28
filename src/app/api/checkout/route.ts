import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { initLemonSqueezy, VARIANT_IDS, STORE_ID } from "@/lib/lemonsqueezy";
import { createCheckout } from "@lemonsqueezy/lemonsqueezy.js";

// Only the two billing intervals the frontend can request
type BillingInterval = "monthly" | "yearly";

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

  // --- Resolve variant ID ---
  const variantId = VARIANT_IDS[interval];
  if (!variantId) {
    // Environment variable not configured
    return NextResponse.json(
      { error: "variant_not_configured" },
      { status: 400 }
    );
  }

  // --- Initialise LemonSqueezy SDK ---
  initLemonSqueezy();

  // --- Create checkout session ---
  const { data, error } = await createCheckout(STORE_ID, variantId, {
    checkoutData: {
      email: user.email,
      custom: {
        // Passed back to our webhook via payload.meta.custom_data.user_id
        // so we can link the subscription to the correct Supabase user.
        user_id: user.id,
      },
    },
    productOptions: {
      redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?upgraded=1`,
    },
  });

  if (error) {
    console.error("[checkout] createCheckout error:", error);
    return NextResponse.json({ error: "checkout_failed" }, { status: 500 });
  }

  const url = data?.data?.attributes?.url;
  if (!url) {
    console.error("[checkout] no checkout URL returned from LemonSqueezy");
    return NextResponse.json({ error: "no_checkout_url" }, { status: 500 });
  }

  return NextResponse.json({ url });
}
