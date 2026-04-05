import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { referralPayoutSchema } from "@/lib/validators/referral";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = referralPayoutSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "validation_failed" }, { status: 400 });
  }

  const { method, destination } = parsed.data;

  const { error } = await supabase
    .from("profiles")
    .update({
      payout_method: method,
      payout_destination: destination,
    })
    .eq("id", user.id);

  if (error) {
    console.error("[referral/payout-settings] update error:", error.message);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
