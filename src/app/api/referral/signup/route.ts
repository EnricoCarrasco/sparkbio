import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { referralCaptureSchema } from "@/lib/validators/referral";

export async function POST(request: NextRequest) {
  // --- Authenticate: derive user_id from session (CRIT-1 fix) ---
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }
  const user_id = user.id;

  // --- Parse body (only needs referral_code, not user_id) ---
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = referralCaptureSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "validation_failed" }, { status: 400 });
  }

  const { referral_code } = parsed.data;
  const supabase = createAdminClient();

  // --- Look up referrer by referral_code ---
  const { data: referrer, error: referrerError } = await supabase
    .from("profiles")
    .select("id")
    .eq("referral_code", referral_code)
    .single();

  if (referrerError || !referrer) {
    return NextResponse.json({ ok: false, error: "invalid_referral_code" }, { status: 400 });
  }

  // --- Block self-referral ---
  if (referrer.id === user_id) {
    return NextResponse.json({ ok: false, error: "self_referral_not_allowed" }, { status: 400 });
  }

  // --- Idempotency: check if user already has a referrer set ---
  const { data: userProfile, error: profileError } = await supabase
    .from("profiles")
    .select("referred_by")
    .eq("id", user_id)
    .single();

  if (profileError) {
    console.error("[referral/signup] profile lookup error:", profileError.message);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }

  if (userProfile?.referred_by) {
    // Already attributed — return success silently
    return NextResponse.json({ ok: true });
  }

  // --- Attribute referral: update user profile ---
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ referred_by: referrer.id })
    .eq("id", user_id);

  if (updateError) {
    console.error("[referral/signup] profile update error:", updateError.message);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }

  // --- Record signup event ---
  const { error: eventError } = await supabase.from("referral_events").insert({
    referrer_id: referrer.id,
    referred_id: user_id,
    event_type: "signup",
    referral_code,
  });

  if (eventError) {
    console.error("[referral/signup] event insert error:", eventError.message);
    // Profile update already succeeded — log but don't fail the request
  }

  // --- Clear the referral cookie ---
  const response = NextResponse.json({ ok: true });

  response.cookies.set("viopage_ref", "", {
    maxAge: 0,
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
