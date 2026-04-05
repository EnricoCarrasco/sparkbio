import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { processReferralConversion, cancelPendingReferralEarnings } from "@/lib/referral";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type LemonSqueezyStatus =
  | "on_trial"
  | "active"
  | "paused"
  | "past_due"
  | "cancelled"
  | "expired";

interface LemonSqueezyAttributes {
  customer_id: number | string;
  variant_id: number | string;
  renews_at: string | null;
  trial_ends_at: string | null;
  ends_at: string | null;
  status: string;
  urls?: {
    update_payment_method?: string;
    customer_portal?: string;
  };
}

interface LemonSqueezyPayload {
  meta: {
    event_name: string;
    custom_data?: {
      user_id?: string;
    };
  };
  data: {
    id: string | number;
    attributes: LemonSqueezyAttributes;
  };
}

// ---------------------------------------------------------------------------
// Status mapping
// LemonSqueezy statuses: on_trial, active, paused, past_due, cancelled, expired
// We map 1-to-1; anything unrecognised falls through to the early return below.
// ---------------------------------------------------------------------------

const VALID_STATUSES = new Set<LemonSqueezyStatus>([
  "on_trial",
  "active",
  "paused",
  "past_due",
  "cancelled",
  "expired",
]);

function mapStatus(raw: string): LemonSqueezyStatus | null {
  const normalised = raw.toLowerCase().replace(/-/g, "_");
  if (VALID_STATUSES.has(normalised as LemonSqueezyStatus)) {
    return normalised as LemonSqueezyStatus;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Signature verification
// ---------------------------------------------------------------------------

/**
 * Verify the X-Signature header sent by LemonSqueezy.
 * Uses crypto.timingSafeEqual to prevent timing-based attacks.
 * Returns true only when the signature is present, correctly sized, and matches.
 */
function verifySignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return false;

  const hmac = crypto
    .createHmac("sha256", secret)
    .update(rawBody, "utf8")
    .digest("hex");

  // Both buffers must be the same length for timingSafeEqual
  try {
    const a = Buffer.from(hmac, "hex");
    const b = Buffer.from(signatureHeader, "hex");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Read raw body as text first — we need it both for signature verification
  // and for JSON parsing. Parsing with request.json() would consume the stream.
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    console.error("[webhook] failed to read request body");
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  // --- Signature verification (must happen before any processing) ---
  const signature = request.headers.get("x-signature");
  if (!verifySignature(rawBody, signature)) {
    console.error("[webhook] invalid or missing signature");
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // --- Parse JSON payload ---
  let payload: LemonSqueezyPayload;
  try {
    payload = JSON.parse(rawBody) as LemonSqueezyPayload;
  } catch {
    console.error("[webhook] invalid JSON in verified payload");
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const eventName = payload?.meta?.event_name;
  const subscriptionId = payload?.data?.id;
  const attributes = payload?.data?.attributes;
  const userId = payload?.meta?.custom_data?.user_id;

  // --- Validate required fields ---
  if (!userId || typeof userId !== "string" || userId.trim() === "") {
    console.error("[webhook] missing user_id in custom_data for event:", eventName);
    return NextResponse.json({ error: "missing_user_id" }, { status: 400 });
  }

  if (!subscriptionId || !attributes) {
    console.error("[webhook] malformed payload for event:", eventName);
    return NextResponse.json({ error: "malformed_payload" }, { status: 400 });
  }

  // --- Map status ---
  const status = mapStatus(attributes.status ?? "");
  if (!status) {
    // Unrecognised status — acknowledge receipt so LemonSqueezy does not retry,
    // but log for investigation.
    console.error(
      "[webhook] unrecognised subscription status:",
      attributes.status,
      "| event:",
      eventName
    );
    return NextResponse.json({ ok: true, warning: "unknown_status" });
  }

  const supabase = createAdminClient();

  // --- Upsert subscription record ---
  const { error: upsertError } = await supabase
    .from("subscriptions")
    .upsert(
      {
        user_id: userId,
        lemonsqueezy_subscription_id: String(subscriptionId),
        lemonsqueezy_customer_id: String(attributes.customer_id),
        lemonsqueezy_variant_id: String(attributes.variant_id),
        status,
        current_period_end: attributes.renews_at ?? null,
        trial_ends_at: attributes.trial_ends_at ?? null,
        cancel_at: attributes.ends_at ?? null,
        update_payment_url: attributes.urls?.update_payment_method ?? null,
        customer_portal_url: attributes.urls?.customer_portal ?? null,
      },
      { onConflict: "lemonsqueezy_subscription_id" }
    );

  if (upsertError) {
    console.error("[webhook] subscription upsert error:", upsertError.message);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  // --- Referral conversion tracking (on trial or active — 30-day hold covers trial cancellations) ---
  if (status === "active" || status === "on_trial") {
    await processReferralConversion(
      userId,
      String(subscriptionId),
      String(attributes.variant_id)
    );
  }
  if (status === "cancelled" || status === "expired") {
    await cancelPendingReferralEarnings(String(subscriptionId));
  }

  // --- On cancellation / expiry: remove premium perks ---
  // Reset hide_footer so the Viopage footer is shown again on the public profile.
  if (status === "cancelled" || status === "expired") {
    const { error: themeError } = await supabase
      .from("themes")
      .update({ hide_footer: false })
      .eq("user_id", userId);

    if (themeError) {
      // Non-fatal: the subscription row is already correct. Log and continue.
      console.error(
        "[webhook] failed to reset hide_footer for user:",
        userId,
        "|",
        themeError.message
      );
    }
  }

  return NextResponse.json({ ok: true });
}
