import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { referralPayoutSchema } from "@/lib/validators/referral";
import { REFERRAL_MIN_PAYOUT_CENTS } from "@/lib/constants";

export async function POST(request: NextRequest) {
  // --- Authenticate ---
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  // --- Parse body ---
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  // --- Validate with Zod ---
  const parsed = referralPayoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "validation_failed" }, { status: 400 });
  }

  const { method, destination } = parsed.data;

  // --- Check available balance (read via server client — RLS allows owner reads) ---
  const { data: availableRows, error: earningsError } = await supabase
    .from("referral_earnings")
    .select("amount_cents")
    .eq("referrer_id", user.id)
    .eq("status", "available");

  if (earningsError) {
    console.error("[referral/payout] earnings query error:", earningsError.message);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }

  const availableCents = (availableRows ?? []).reduce(
    (sum, row) => sum + row.amount_cents,
    0
  );

  if (availableCents < REFERRAL_MIN_PAYOUT_CENTS) {
    return NextResponse.json(
      { ok: false, error: "minimum_not_met", availableCents, minimumCents: REFERRAL_MIN_PAYOUT_CENTS },
      { status: 400 }
    );
  }

  // --- Write payout record and update earnings (service_role) ---
  const admin = createAdminClient();

  const { data: payout, error: payoutInsertError } = await admin
    .from("referral_payouts")
    .insert({
      referrer_id: user.id,
      amount_cents: availableCents,
      payout_method: method,
      payout_destination: destination,
      status: "requested",
    })
    .select("id")
    .single();

  if (payoutInsertError || !payout) {
    console.error("[referral/payout] payout insert error:", payoutInsertError?.message);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }

  // --- Link earnings rows to the new payout ---
  const { error: updateError } = await admin
    .from("referral_earnings")
    .update({ payout_id: payout.id })
    .eq("referrer_id", user.id)
    .eq("status", "available");

  if (updateError) {
    console.error("[referral/payout] earnings update error:", updateError.message);
    // Payout row exists — log the failure but don't leave the caller hanging
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, payout_id: payout.id });
}
