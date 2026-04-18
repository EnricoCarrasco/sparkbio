import * as Sentry from "@sentry/nextjs";
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

    // 3. Determine commission amount based on which Stripe price triggered the
    //    conversion. Identify both the interval (monthly / yearly) AND the
    //    currency (EUR / BRL) so a BRL subscriber generates a BRL-denominated
    //    earning rather than being flattened into EUR math.
    const priceIdMap: Record<
      string,
      { interval: "monthly" | "yearly"; currency: "EUR" | "BRL" }
    > = {};
    if (process.env.STRIPE_PRICE_MONTHLY_EUR) {
      priceIdMap[process.env.STRIPE_PRICE_MONTHLY_EUR] = {
        interval: "monthly",
        currency: "EUR",
      };
    }
    if (process.env.STRIPE_PRICE_YEARLY_EUR) {
      priceIdMap[process.env.STRIPE_PRICE_YEARLY_EUR] = {
        interval: "yearly",
        currency: "EUR",
      };
    }
    if (process.env.STRIPE_PRICE_MONTHLY_BRL) {
      priceIdMap[process.env.STRIPE_PRICE_MONTHLY_BRL] = {
        interval: "monthly",
        currency: "BRL",
      };
    }
    if (process.env.STRIPE_PRICE_YEARLY_BRL) {
      priceIdMap[process.env.STRIPE_PRICE_YEARLY_BRL] = {
        interval: "yearly",
        currency: "BRL",
      };
    }

    const matched = priceIdMap[priceId];
    let amountCents: number;
    let currency: "EUR" | "BRL";

    if (matched) {
      const basePrice =
        matched.currency === "BRL"
          ? matched.interval === "yearly"
            ? PLANS.pro.br.yearlyTotal
            : PLANS.pro.br.monthlyPrice
          : matched.interval === "yearly"
            ? PLANS.pro.yearlyTotal
            : PLANS.pro.monthlyPrice;
      amountCents = Math.round(
        (basePrice * 100 * REFERRAL_COMMISSION_PERCENT) / 100,
      );
      currency = matched.currency;
    } else {
      // Unknown price — fall back to monthly EUR commission as a safe default.
      console.warn(
        "[referral] Unknown price ID:",
        priceId,
        "— falling back to monthly EUR commission.",
      );
      amountCents = Math.round(
        (PLANS.pro.monthlyPrice * 100 * REFERRAL_COMMISSION_PERCENT) / 100,
      );
      currency = "EUR";
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
        currency,
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
      `[referral] Conversion recorded: referrer=${referrerId}, referred=${userId}, amount=${amountCents} ${currency} cents, holdUntil=${holdUntil.toISOString()}`,
    );
  } catch (err) {
    console.error("[referral] Unexpected error in processReferralConversion:", err);
    Sentry.captureException(err, {
      tags: { surface: "referral", op: "process-conversion" },
      extra: { userId, subscriptionId, priceId },
    });
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
    Sentry.captureException(err, {
      tags: { surface: "referral", op: "cancel-earnings" },
      extra: { subscriptionId },
    });
  }
}
