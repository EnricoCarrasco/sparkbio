import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { referralClickSchema } from "@/lib/validators/referral";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";

// 1 request per second per IP
const limiter = createRateLimiter(1_000, 1);

export async function POST(request: NextRequest) {
  // --- Rate limiting ---
  const clientIp = getClientIp(request);
  if (limiter(clientIp).limited) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  // --- Parse body ---
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  // --- Validate with Zod ---
  const parsed = referralClickSchema.safeParse(body);
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
    // Return ok:true to prevent referral code enumeration
    return NextResponse.json({ ok: true });
  }

  // --- Hash the client IP (never store raw IPs) ---
  const ipHash = createHash("sha256").update(clientIp).digest("hex");

  // --- Dedup: silently drop repeat clicks from same IP within 24h ---
  const cutoff24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { data: existing } = await supabase
    .from("referral_events")
    .select("id")
    .eq("referral_code", referral_code)
    .eq("ip_hash", ipHash)
    .eq("event_type", "click")
    .gte("created_at", cutoff24h)
    .limit(1)
    .maybeSingle();

  if (existing) {
    return NextResponse.json({ ok: true });
  }

  // --- Insert click event ---
  const userAgent = request.headers.get("user-agent") ?? null;

  const { error: insertError } = await supabase.from("referral_events").insert({
    referrer_id: referrer.id,
    event_type: "click",
    referral_code,
    ip_hash: ipHash,
    user_agent: userAgent,
  });

  if (insertError) {
    console.error("[referral/click] insert error:", insertError.message);
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
