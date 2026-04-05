import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { createAdminClient } from "@/lib/supabase/admin";

// ---------------------------------------------------------------------------
// Valid status transition table for payout lifecycle:
//   requested  → processing  (admin approves)
//   requested  → failed      (admin rejects)
//   processing → completed   (admin marks paid)
//   processing → failed      (admin rejects mid-processing)
// ---------------------------------------------------------------------------

const VALID_TRANSITIONS: Record<string, Set<string>> = {
  requested: new Set(["processing", "failed"]),
  processing: new Set(["completed", "failed"]),
};

// ---------------------------------------------------------------------------
// PATCH /api/admin/payouts/[id]
// Updates payout status with side-effects on linked referral_earnings rows.
// ---------------------------------------------------------------------------

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  // --- Admin auth guard ---
  const { isAdmin } = await getAdminUser();
  if (!isAdmin) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // --- Extract dynamic route param (Next.js 15+: params is a Promise) ---
  const { id } = await params;

  // Basic UUID shape validation to prevent injection via path segment
  const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!UUID_RE.test(id)) {
    return NextResponse.json({ error: "invalid_id" }, { status: 400 });
  }

  // --- Parse body ---
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  if (
    typeof body !== "object" ||
    body === null ||
    typeof (body as Record<string, unknown>).status !== "string"
  ) {
    return NextResponse.json({ error: "missing_status" }, { status: 400 });
  }

  const newStatus = (body as Record<string, string>).status;

  const supabase = createAdminClient();

  // --- Fetch current payout to validate the transition ---
  const { data: existing, error: fetchError } = await supabase
    .from("referral_payouts")
    .select("id, status")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    if (fetchError?.code === "PGRST116") {
      return NextResponse.json({ error: "not_found" }, { status: 404 });
    }
    console.error("[admin/payouts/[id]] fetch error:", fetchError?.message);
    return NextResponse.json({ error: "db_error" }, { status: 500 });
  }

  const currentStatus: string = existing.status;

  // --- Guard: reject invalid transitions ---
  const allowedNext = VALID_TRANSITIONS[currentStatus];
  if (!allowedNext || !allowedNext.has(newStatus)) {
    return NextResponse.json(
      {
        error: "invalid_transition",
        detail: `Cannot move payout from '${currentStatus}' to '${newStatus}'`,
      },
      { status: 422 }
    );
  }

  // ---------------------------------------------------------------------------
  // Apply transition
  // ---------------------------------------------------------------------------

  if (newStatus === "completed") {
    // Mark payout completed and set processed_at
    const { error: payoutError } = await supabase
      .from("referral_payouts")
      .update({ status: "completed", processed_at: new Date().toISOString() })
      .eq("id", id);

    if (payoutError) {
      console.error("[admin/payouts/[id]] payout update error:", payoutError.message);
      return NextResponse.json({ error: "db_error" }, { status: 500 });
    }

    // Mark all linked earnings as paid
    const { error: earningsError } = await supabase
      .from("referral_earnings")
      .update({ status: "paid", paid_at: new Date().toISOString() })
      .eq("payout_id", id);

    if (earningsError) {
      console.error(
        "[admin/payouts/[id]] earnings paid update error:",
        earningsError.message
      );
      return NextResponse.json({ error: "db_error" }, { status: 500 });
    }
  } else if (newStatus === "failed") {
    // Mark payout failed
    const { error: payoutError } = await supabase
      .from("referral_payouts")
      .update({ status: "failed" })
      .eq("id", id);

    if (payoutError) {
      console.error("[admin/payouts/[id]] payout fail error:", payoutError.message);
      return NextResponse.json({ error: "db_error" }, { status: 500 });
    }

    // Return linked earnings to 'available' and clear payout_id so they can
    // be included in a future payout batch.
    const { error: earningsError } = await supabase
      .from("referral_earnings")
      .update({ status: "available", payout_id: null })
      .eq("payout_id", id);

    if (earningsError) {
      console.error(
        "[admin/payouts/[id]] earnings revert error:",
        earningsError.message
      );
      return NextResponse.json({ error: "db_error" }, { status: 500 });
    }
  } else {
    // newStatus === "processing" — simple status update, no side-effects
    const { error: payoutError } = await supabase
      .from("referral_payouts")
      .update({ status: newStatus })
      .eq("id", id);

    if (payoutError) {
      console.error("[admin/payouts/[id]] payout status update error:", payoutError.message);
      return NextResponse.json({ error: "db_error" }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
