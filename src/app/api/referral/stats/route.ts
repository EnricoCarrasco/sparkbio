import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(_request: NextRequest) {
  // --- Authenticate ---
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  // --- Fetch earnings aggregates ---
  // Run earnings, events, payouts, and profile queries in parallel
  const [earningsResult, eventsResult, payoutsResult, profileResult] = await Promise.all([
    supabase
      .from("referral_earnings")
      .select("amount_cents, status, hold_until")
      .eq("referrer_id", user.id),

    supabase
      .from("referral_events")
      .select("event_type")
      .eq("referrer_id", user.id),

    supabase
      .from("referral_payouts")
      .select("id, amount_cents, payout_method, payout_destination, status, created_at")
      .eq("referrer_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20),

    supabase
      .from("profiles")
      .select("referral_code, payout_method, payout_destination")
      .eq("id", user.id)
      .single(),
  ]);

  if (earningsResult.error) {
    console.error("[referral/stats] earnings query error:", earningsResult.error.message);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }

  if (eventsResult.error) {
    console.error("[referral/stats] events query error:", eventsResult.error.message);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }

  if (payoutsResult.error) {
    console.error("[referral/stats] payouts query error:", payoutsResult.error.message);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }

  if (profileResult.error) {
    console.error("[referral/stats] profile query error:", profileResult.error.message);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }

  // --- Aggregate earnings ---
  const earnings = earningsResult.data ?? [];

  let totalEarnedCents = 0;
  let pendingCents = 0;
  let availableCents = 0;
  let paidOutCents = 0;
  let nearestHoldDate: string | null = null;

  for (const row of earnings) {
    if (row.status !== "cancelled") {
      totalEarnedCents += row.amount_cents;
    }
    if (row.status === "pending") {
      pendingCents += row.amount_cents;
      if (row.hold_until) {
        if (!nearestHoldDate || row.hold_until < nearestHoldDate) {
          nearestHoldDate = row.hold_until;
        }
      }
    } else if (row.status === "available") {
      availableCents += row.amount_cents;
    } else if (row.status === "paid") {
      paidOutCents += row.amount_cents;
    }
  }

  // --- Aggregate event counts ---
  const events = eventsResult.data ?? [];
  let clickCount = 0;
  let signupCount = 0;
  let conversionCount = 0;

  for (const row of events) {
    if (row.event_type === "click") clickCount++;
    else if (row.event_type === "signup") signupCount++;
    else if (row.event_type === "conversion") conversionCount++;
  }

  return NextResponse.json({
    ok: true,
    referralCode: profileResult.data?.referral_code ?? null,
    payoutMethod: profileResult.data?.payout_method ?? null,
    payoutDestination: profileResult.data?.payout_destination ?? null,
    stats: {
      totalEarnedCents,
      pendingCents,
      availableCents,
      paidOutCents,
      nearestHoldDate,
      clickCount,
      signupCount,
      conversionCount,
    },
    payouts: payoutsResult.data ?? [],
  });
}
