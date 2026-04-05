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
// GET /api/admin/stats
// Returns overview dashboard metrics for the Viopage admin panel.
// ---------------------------------------------------------------------------

export async function GET(): Promise<NextResponse> {
  // --- Admin auth guard ---
  const { isAdmin } = await getAdminUser();
  if (!isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  // --- Run all independent queries in parallel ---
  const [
    usersResult,
    proResult,
    pendingPayoutsResult,
    liabilityResult,
    activeReferrersResult,
    eventsResult,
    earningsResult,
    recentEventsResult,
    topReferrerProfilesResult,
  ] = await Promise.all([
    // 1. Total users
    supabase.from("profiles").select("id", { count: "exact", head: true }),

    // 2. Pro subscribers
    supabase
      .from("subscriptions")
      .select("id", { count: "exact", head: true })
      .in("status", ["active", "on_trial"]),

    // 3. Pending payouts (count + sum)
    supabase
      .from("referral_payouts")
      .select("amount_cents")
      .eq("status", "requested"),

    // 4a. Liability: sum of pending + available earnings
    supabase
      .from("referral_earnings")
      .select("amount_cents")
      .in("status", ["pending", "available"]),

    // 4b. Active referrers (distinct referrer_ids with non-cancelled earnings)
    supabase
      .from("referral_earnings")
      .select("referrer_id")
      .neq("status", "cancelled"),

    // 4c. All referral events for funnel counts + monthly breakdown
    supabase
      .from("referral_events")
      .select("event_type, referrer_id, created_at"),

    // 5. Earnings per referrer for top-5 aggregation
    supabase
      .from("referral_earnings")
      .select("referrer_id, amount_cents")
      .neq("status", "cancelled"),

    // 6. Recent activity: last 5 events with referrer username
    supabase
      .from("referral_events")
      .select("event_type, referrer_id, created_at, profiles!referral_events_referrer_id_fkey(username)")
      .order("created_at", { ascending: false })
      .limit(5),

    // 7. All profiles (for username lookup in top referrers)
    supabase.from("profiles").select("id, username"),
  ]);

  // --- Log and surface DB errors ---
  const errors = [
    usersResult.error,
    proResult.error,
    pendingPayoutsResult.error,
    liabilityResult.error,
    activeReferrersResult.error,
    eventsResult.error,
    earningsResult.error,
    recentEventsResult.error,
    topReferrerProfilesResult.error,
  ].filter(Boolean);

  if (errors.length > 0) {
    console.error("[admin/stats] query errors:", errors.map((e) => e?.message));
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  // ---------------------------------------------------------------------------
  // Aggregate: pending payouts
  // ---------------------------------------------------------------------------
  const pendingPayoutRows = pendingPayoutsResult.data ?? [];
  const pendingPayoutCount = pendingPayoutRows.length;
  const pendingPayoutAmount = pendingPayoutRows.reduce(
    (sum, row) => sum + (row.amount_cents ?? 0),
    0
  );

  // ---------------------------------------------------------------------------
  // Aggregate: referral health
  // ---------------------------------------------------------------------------
  const liabilityRows = liabilityResult.data ?? [];
  const liability = liabilityRows.reduce(
    (sum, row) => sum + (row.amount_cents ?? 0),
    0
  );

  const activeReferrerRows = (activeReferrersResult.data ?? []) as ReferralEarningRow[];
  const activeReferrerSet = new Set(activeReferrerRows.map((r) => r.referrer_id));
  const activeReferrers = activeReferrerSet.size;

  const allEvents = (eventsResult.data ?? []) as ReferralEventRow[];
  let clickCount = 0;
  let signupCount = 0;
  let conversionCount = 0;

  for (const evt of allEvents) {
    if (evt.event_type === "click") clickCount++;
    else if (evt.event_type === "signup") signupCount++;
    else if (evt.event_type === "conversion") conversionCount++;
  }

  const convRate = signupCount > 0 ? conversionCount / signupCount : 0;

  const earningRows = (earningsResult.data ?? []) as ReferralEarningRow[];
  const totalEarnings = earningRows.reduce(
    (sum, row) => sum + (row.amount_cents ?? 0),
    0
  );
  const avgEarnings = activeReferrers > 0 ? totalEarnings / activeReferrers : 0;

  // ---------------------------------------------------------------------------
  // Aggregate: recent activity (last 5 events)
  // ---------------------------------------------------------------------------
  type RecentEventRow = {
    event_type: string;
    referrer_id: string;
    created_at: string;
    profiles?: { username?: string } | null;
  };

  const recentActivity = ((recentEventsResult.data ?? []) as RecentEventRow[]).map(
    (row) => {
      const username = row.profiles?.username ?? row.referrer_id;
      const typeLabel =
        row.event_type === "click"
          ? "Link click"
          : row.event_type === "signup"
          ? "New signup"
          : "Conversion";
      return {
        type: row.event_type,
        description: `${typeLabel} via @${username}`,
        timestamp: row.created_at,
      };
    }
  );

  // ---------------------------------------------------------------------------
  // Aggregate: top 5 referrers by conversion count
  // ---------------------------------------------------------------------------
  const profileMap = new Map<string, string>(
    ((topReferrerProfilesResult.data ?? []) as ProfileRow[]).map((p) => [
      p.id,
      p.username,
    ])
  );

  // Build per-referrer event counts
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

  // Build per-referrer earnings sums
  const referrerEarningsMap = new Map<string, number>();
  for (const row of earningRows) {
    referrerEarningsMap.set(
      row.referrer_id,
      (referrerEarningsMap.get(row.referrer_id) ?? 0) + row.amount_cents
    );
  }

  const topReferrers = Array.from(referrerEventMap.entries())
    .map(([referrerId, counts]) => ({
      username: profileMap.get(referrerId) ?? referrerId,
      clicks: counts.clicks,
      signups: counts.signups,
      conversions: counts.conversions,
      earnings: referrerEarningsMap.get(referrerId) ?? 0,
    }))
    .sort((a, b) => b.conversions - a.conversions)
    .slice(0, 5);

  // ---------------------------------------------------------------------------
  // Aggregate: monthly conversions (last 6 calendar months)
  // ---------------------------------------------------------------------------
  const now = new Date();
  const monthlyConversionsMap = new Map<string, number>();

  // Pre-populate the last 6 months (including current) with 0
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyConversionsMap.set(key, 0);
  }

  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  for (const evt of allEvents) {
    if (evt.event_type !== "conversion") continue;
    const eventDate = new Date(evt.created_at);
    if (eventDate < sixMonthsAgo) continue;
    const key = `${eventDate.getFullYear()}-${String(
      eventDate.getMonth() + 1
    ).padStart(2, "0")}`;
    if (monthlyConversionsMap.has(key)) {
      monthlyConversionsMap.set(key, (monthlyConversionsMap.get(key) ?? 0) + 1);
    }
  }

  const monthlyConversions = Array.from(monthlyConversionsMap.entries()).map(
    ([month, count]) => ({ month, count })
  );

  // ---------------------------------------------------------------------------
  // Build response
  // ---------------------------------------------------------------------------
  const totalUsers = usersResult.count ?? 0;
  const proSubscribers = proResult.count ?? 0;
  const monthlyRevenue = proSubscribers * 9 * 100; // cents, rough estimate

  return NextResponse.json({
    totalUsers,
    proSubscribers,
    monthlyRevenue,
    pendingPayouts: {
      amount: pendingPayoutAmount,
      count: pendingPayoutCount,
    },
    referralHealth: {
      liability,
      activeReferrers,
      convRate,
      avgEarnings,
    },
    recentActivity,
    topReferrers,
    monthlyConversions,
  });
}
