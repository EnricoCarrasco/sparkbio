import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

// ---------------------------------------------------------------------------
// GET /api/admin/payouts?status=requested
// Returns payout records filtered by status, joined with referrer username.
// ---------------------------------------------------------------------------

const VALID_STATUSES = new Set(["requested", "processing", "completed", "failed"]);

export async function GET(request: NextRequest): Promise<NextResponse> {
  // --- Admin auth guard ---
  const { isAdmin } = await getAdminUser();
  if (!isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // --- Validate status param ---
  const rawStatus = request.nextUrl.searchParams.get("status") ?? "requested";
  if (!VALID_STATUSES.has(rawStatus)) {
    return NextResponse.json({ error: "invalid_status" }, { status: 400 });
  }
  const status = rawStatus;

  const supabase = createAdminClient();

  // --- Query payouts joined with profiles for referrer username ---
  const { data, error } = await supabase
    .from("referral_payouts")
    .select(
      "id, referrer_id, amount_cents, payout_method, payout_destination, status, created_at, profiles!referral_payouts_referrer_id_fkey(username)"
    )
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("[admin/payouts] query error:", error.message);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  // --- Flatten referrer username out of nested profiles object ---
  type RawPayout = {
    id: string;
    referrer_id: string;
    amount_cents: number;
    payout_method: string;
    payout_destination: string | null;
    status: string;
    created_at: string;
    profiles?: { username?: string } | null;
  };

  const payouts = ((data ?? []) as RawPayout[]).map((row) => ({
    id: row.id,
    referrer_id: row.referrer_id,
    referrer_username: row.profiles?.username ?? null,
    amount_cents: row.amount_cents,
    payout_method: row.payout_method,
    payout_destination: row.payout_destination,
    status: row.status,
    created_at: row.created_at,
  }));

  return NextResponse.json({ payouts });
}
