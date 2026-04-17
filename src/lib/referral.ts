import { createAdminClient } from "@/lib/supabase/admin";
import {
  REFERRAL_COMMISSION_PERCENT,
  REFERRAL_HOLD_DAYS,
  PLANS,
} from "@/lib/constants";

/**
 * Called from the Stripe webhook on a successful subscription payment.
 * Idempotent: safe to call multiple times for the same subscriptionId.
 * Never throws — errors are logged and swallowed so the webhook can still return 200.
 *
 * `priceId` is the Stripe price ID — we match against env vars to determine
 * monthly vs yearly commission.
 */
export async function processReferralConversion(
  userId: string,
  subscriptionId: string,
  priceId: string,
): Promise<void> {
  try {
    const supabase = createAdminClient();

    // 1. Look up whether this user was referred by someone.
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("referred_by")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("[referral] Failed to fetch profile for userId:", userId, profileError);
      return;
    }

    if (!profile?.referred_by) {
      // Not a referred user — nothing to do.
      return;
    }

    const referrerId: string = profile.referred_by;

    // 2. Idempotency guard: skip if we already recorded earnings for this subscription.
    const { data: existing, error: existingError } = await supabase
      .from("referral_earnings")
      .select("id")
      .eq("subscription_id", subscriptionId)
      .maybeSingle();

    if (existingError) {
      console.error("[referral] Failed to check existing earnings for subscriptionId:", subscriptionId, existingError);
      return;
    }

    if (existing) {
      console.log("[referral] Earnings already recorded for subscriptionId:", subscriptionId, "— skipping.");
      return;
    }

    // 3. Determine commission amount based on which Stripe price triggered the conversion.
    const monthlyIds = new Set(
      [
        process.env.STRIPE_PRICE_MONTHLY_EUR,
        process.env.STRIPE_PRICE_MONTHLY_BRL,
      ].filter(Boolean) as string[],
    );
    const yearlyIds = new Set(
      [
        process.env.STRIPE_PRICE_YEARLY_EUR,
        process.env.STRIPE_PRICE_YEARLY_BRL,
      ].filter(Boolean) as string[],
    );

    let amountCents: number;
    if (yearlyIds.has(priceId)) {
      amountCents = Math.round(
        (PLANS.pro.yearlyTotal * 100 * REFERRAL_COMMISSION_PERCENT) / 100,
      );
    } else if (monthlyIds.has(priceId)) {
      amountCents = Math.round(
        (PLANS.pro.monthlyPrice * 100 * REFERRAL_COMMISSION_PERCENT) / 100,
      );
    } else {
      // Unknown price — fall back to monthly commission as a safe default.
      console.warn(
        "[referral] Unknown price ID:",
        priceId,
        "— falling back to monthly commission.",
      );
      amountCents = Math.round(
        (PLANS.pro.monthlyPrice * 100 * REFERRAL_COMMISSION_PERCENT) / 100,
      );
    }

    // 4. Calculate the hold date after which the earning becomes payable.
    const holdUntil = new Date();
    holdUntil.setDate(holdUntil.getDate() + REFERRAL_HOLD_DAYS);

    // 5. Insert the pending earning record.
    const { error: earningError } = await supabase
      .from("referral_earnings")
      .insert({
        referrer_id: referrerId,
        referred_id: userId,
        subscription_id: subscriptionId,
        amount_cents: amountCents,
        status: "pending",
        hold_until: holdUntil.toISOString(),
      });

    if (earningError) {
      console.error("[referral] Failed to insert referral_earnings:", earningError);
      return;
    }

    // 6. Look up the referrer's referral_code so we can record it on the event.
    const { data: referrerProfile, error: referrerError } = await supabase
      .from("profiles")
      .select("referral_code")
      .eq("id", referrerId)
      .single();

    if (referrerError) {
      console.error("[referral] Failed to fetch referrer profile for referrerId:", referrerId, referrerError);
      // Not fatal — still record the event without the code.
    }

    // 7. Record the conversion event.
    const { error: eventError } = await supabase
      .from("referral_events")
      .insert({
        referrer_id: referrerId,
        referred_id: userId,
        event_type: "conversion",
        referral_code: referrerProfile?.referral_code ?? null,
      });

    if (eventError) {
      console.error("[referral] Failed to insert referral_events:", eventError);
      return;
    }

    console.log(
      `[referral] Conversion recorded: referrer=${referrerId}, referred=${userId}, amount=${amountCents} cents, holdUntil=${holdUntil.toISOString()}`,
    );
  } catch (err) {
    console.error("[referral] Unexpected error in processReferralConversion:", err);
  }
}

/**
 * Called from the Stripe webhook on a subscription cancellation or refund.
 * Voids any pending (not yet paid out) earnings tied to the cancelled subscription.
 * Never throws — errors are logged and swallowed so the webhook can still return 200.
 */
export async function cancelPendingReferralEarnings(
  subscriptionId: string,
): Promise<void> {
  try {
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("referral_earnings")
      .update({ status: "cancelled" })
      .eq("subscription_id", subscriptionId)
      .in("status", ["pending", "available"])
      .select("id");

    if (error) {
      console.error(
        "[referral] Failed to cancel pending earnings for subscriptionId:",
        subscriptionId,
        error,
      );
      return;
    }

    const cancelledCount = data?.length ?? 0;
    console.log(
      `[referral] Cancelled ${cancelledCount} pending earning(s) for subscriptionId: ${subscriptionId}`,
    );
  } catch (err) {
    console.error("[referral] Unexpected error in cancelPendingReferralEarnings:", err);
  }
}
