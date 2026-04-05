import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReferralEventRow {
  event_type: string;
  referrer_id: string;
  created_at: string;
}

interface ReferralEarningRow {
  referrer_id: string;
  amount_cents: number;
}

interface ProfileRow {
  id: string;
  username: string;
}

// ---------------------------------------------------------------------------
// GET /api/admin/referrals
// Returns funnel totals, full referrer leaderboard, and monthly earnings.
// ---------------------------------------------------------------------------

export async function GET(): Promise<NextResponse> {
  // --- Admin auth guard ---
  const { isAdmin } = await getAdminUser();
  if (!isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // --- Run all queries in parallel ---
  const [eventsResult, earningsResult, profilesResult] = await Promise.all([
    // All referral events for funnel + per-referrer breakdown
    supabase
      .from("referral_events")
      .select("event_type, referrer_id, created_at"),

    // All non-cancelled earnings for per-referrer totals + monthly chart
    supabase
      .from("referral_earnings")
      .select("referrer_id, amount_cents, created_at")
      .neq("status", "cancelled"),

    // All profiles for username resolution
    supabase.from("profiles").select("id, username"),
  ]);

  // --- Surface DB errors ---
  const errors = [eventsResult.error, earningsResult.error, profilesResult.error].filter(
    Boolean
  );
  if (errors.length > 0) {
    console.error("[admin/referrals] query errors:", errors.map((e) => e?.message));
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  // ---------------------------------------------------------------------------
  // Aggregate: overall funnel
  // ---------------------------------------------------------------------------
  const allEvents = (eventsResult.data ?? []) as ReferralEventRow[];
  let totalClicks = 0;
  let totalSignups = 0;
  let totalConversions = 0;

  for (const evt of allEvents) {
    if (evt.event_type === "click") totalClicks++;
    else if (evt.event_type === "signup") totalSignups++;
    else if (evt.event_type === "conversion") totalConversions++;
  }

  // ---------------------------------------------------------------------------
  // Aggregate: per-referrer leaderboard
  // ---------------------------------------------------------------------------
  const profileMap = new Map<string, string>(
    ((profilesResult.data ?? []) as ProfileRow[]).map((p) => [p.id, p.username])
  );

  const referrerEventMap = new Map<
    string,
    { clicks: number; signups: number; conversions: number }
  >();

  for (const evt of allEvents) {
    if (!referrerEventMap.has(evt.referrer_id)) {
      referrerEventMap.set(evt.referrer_id, {
        clicks: 0,
        signups: 0,
        conversions: 0,
      });
    }
    const entry = referrerEventMap.get(evt.referrer_id)!;
    if (evt.event_type === "click") entry.clicks++;
    else if (evt.event_type === "signup") entry.signups++;
    else if (evt.event_type === "conversion") entry.conversions++;
  }

  const earningRows = (earningsResult.data ?? []) as (ReferralEarningRow & {
    created_at: string;
  })[];
  const referrerEarningsMap = new Map<string, number>();
  for (const row of earningRows) {
    referrerEarningsMap.set(
      row.referrer_id,
      (referrerEarningsMap.get(row.referrer_id) ?? 0) + row.amount_cents
    );
  }

  // Ensure any referrer with earnings but no events also appears in the list
  for (const row of earningRows) {
    if (!referrerEventMap.has(row.referrer_id)) {
      referrerEventMap.set(row.referrer_id, {
        clicks: 0,
        signups: 0,
        conversions: 0,
      });
    }
  }

  const referrers = Array.from(referrerEventMap.entries())
    .map(([referrerId, counts]) => ({
      username: profileMap.get(referrerId) ?? referrerId,
      clicks: counts.clicks,
      signups: counts.signups,
      conversions: counts.conversions,
      earnings: referrerEarningsMap.get(referrerId) ?? 0,
    }))
    .sort((a, b) => b.conversions - a.conversions);

  // ---------------------------------------------------------------------------
  // Aggregate: monthly earnings (last 6 calendar months)
  // ---------------------------------------------------------------------------
  const now = new Date();
  const monthlyEarningsMap = new Map<string, number>();

  // Pre-populate last 6 months (including current) with 0
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyEarningsMap.set(key, 0);
  }

  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  for (const row of earningRows) {
    const rowDate = new Date(row.created_at);
    if (rowDate < sixMonthsAgo) continue;
    const key = `${rowDate.getFullYear()}-${String(rowDate.getMonth() + 1).padStart(2, "0")}`;
    if (monthlyEarningsMap.has(key)) {
      monthlyEarningsMap.set(
        key,
        (monthlyEarningsMap.get(key) ?? 0) + row.amount_cents
      );
    }
  }

  const monthlyEarnings = Array.from(monthlyEarningsMap.entries()).map(
    ([month, amount]) => ({ month, amount })
  );

  // ---------------------------------------------------------------------------
  // Build response
  // ---------------------------------------------------------------------------
  return NextResponse.json({
    funnel: {
      clicks: totalClicks,
      signups: totalSignups,
      conversions: totalConversions,
    },
    referrers,
    monthlyEarnings,
  });
}
