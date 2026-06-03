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

  const admin = createAdminClient();

  // --- Guard: refuse if a payout is already awaiting processing ---
  // Defends against double-click / retry. The atomic claim below is the real
  // protection against paying the same earnings twice.
  const { data: pending, error: pendingError } = await admin
    .from("referral_payouts")
    .select("id")
    .eq("referrer_id", user.id)
    .in("status", ["requested", "processing"])
    .limit(1);

  if (pendingError) {
    console.error("[referral/payout] pending check error:", pendingError.message);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }
  if (pending && pending.length > 0) {
    return NextResponse.json(
      { ok: false, error: "payout_already_pending" },
      { status: 409 }
    );
  }

  // --- Tally unclaimed available earnings, grouped by currency ---
  // EUR and BRL earnings must NOT be summed together or paid in a single
  // arbitrary currency. Create one payout per currency that meets the minimum.
  const { data: rows, error: earningsError } = await admin
    .from("referral_earnings")
    .select("amount_cents, currency")
    .eq("referrer_id", user.id)
    .eq("status", "available")
    .is("payout_id", null);

  if (earningsError) {
    console.error("[referral/payout] earnings query error:", earningsError.message);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }

  const byCurrency = new Map<string, number>();
  for (const row of rows ?? []) {
    const cur = row.currency ?? "EUR";
    byCurrency.set(cur, (byCurrency.get(cur) ?? 0) + row.amount_cents);
  }

  const eligibleCurrencies = [...byCurrency.entries()]
    .filter(([, cents]) => cents >= REFERRAL_MIN_PAYOUT_CENTS)
    .map(([cur]) => cur);

  if (eligibleCurrencies.length === 0) {
    const total = [...byCurrency.values()].reduce((a, b) => a + b, 0);
    return NextResponse.json(
      { ok: false, error: "minimum_not_met", availableCents: total, minimumCents: REFERRAL_MIN_PAYOUT_CENTS },
      { status: 400 }
    );
  }

  // --- Create one payout per eligible currency, claiming earnings atomically ---
  const created: { payout_id: string; currency: string; amount_cents: number }[] = [];

  for (const currency of eligibleCurrencies) {
    const { data: payout, error: payoutInsertError } = await admin
      .from("referral_payouts")
      .insert({
        referrer_id: user.id,
        amount_cents: 0, // set after we know what we actually claimed
        currency,
        payout_method: method,
        payout_destination: destination,
        status: "requested",
      })
      .select("id")
      .single();

    if (payoutInsertError || !payout) {
      console.error("[referral/payout] payout insert error:", payoutInsertError?.message);
      continue;
    }

    // Atomic claim: only rows still unclaimed (payout_id IS NULL) of this
    // currency. If a concurrent request already grabbed them we claim 0 and
    // void this empty payout — the same earnings can never be paid twice.
    const { data: claimed, error: claimError } = await admin
      .from("referral_earnings")
      .update({ payout_id: payout.id })
      .eq("referrer_id", user.id)
      .eq("status", "available")
      .eq("currency", currency)
      .is("payout_id", null)
      .select("amount_cents");

    if (claimError) {
      console.error("[referral/payout] earnings claim error:", claimError.message);
      await admin.from("referral_payouts").delete().eq("id", payout.id);
      continue;
    }

    const claimedCents = (claimed ?? []).reduce((sum, r) => sum + r.amount_cents, 0);
    if (claimedCents <= 0) {
      await admin.from("referral_payouts").delete().eq("id", payout.id);
      continue;
    }

    await admin
      .from("referral_payouts")
      .update({ amount_cents: claimedCents })
      .eq("id", payout.id);

    created.push({ payout_id: payout.id, currency, amount_cents: claimedCents });
  }

  if (created.length === 0) {
    return NextResponse.json({ ok: false, error: "nothing_claimed" }, { status: 409 });
  }

  return NextResponse.json({
    ok: true,
    payout_id: created[0].payout_id, // backward-compat for single-payout callers
    payouts: created,
  });
}
