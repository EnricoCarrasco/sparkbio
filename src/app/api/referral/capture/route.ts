import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { referralCaptureSchema } from "@/lib/validators/referral";

export async function POST(request: NextRequest) {
  // --- Parse body ---
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  // --- Validate with Zod ---
  const parsed = referralCaptureSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "validation_failed" }, { status: 400 });
  }

  const { referral_code } = parsed.data;
  const supabase = createAdminClient();

  // --- Verify referral_code exists in profiles ---
  const { data: referrer, error: referrerError } = await supabase
    .from("profiles")
    .select("id")
    .eq("referral_code", referral_code)
    .single();

  if (referrerError || !referrer) {
    console.error("[referral/capture] lookup failed:", { referral_code, error: referrerError?.message, referrer });
    return NextResponse.json({ ok: false, error: "invalid_referral_code" }, { status: 400 });
  }

  // --- Set HTTP-only referral cookie on the response ---
  const response = NextResponse.json({ ok: true });

  response.cookies.set("viopage_ref", referral_code, {
    maxAge: 2592000, // 30 days
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return response;
}
