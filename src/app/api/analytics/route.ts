import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { analyticsEventSchema } from "@/lib/validators/analytics";
import { UAParser } from "ua-parser-js";
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
  const parsed = analyticsEventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "validation_failed" }, { status: 400 });
  }

  const { profile_id, link_id, event_type, referrer } = parsed.data;

  // --- Verify profile exists (prevents analytics for non-existent profiles) ---
  const supabase = createAdminClient();
  const { data: profileExists } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", profile_id)
    .single();

  if (!profileExists) {
    return NextResponse.json({ ok: false, error: "not_found" }, { status: 400 });
  }

  // --- Parse user agent ---
  // UAParser v2 is a plain function, not a constructor
  const ua = request.headers.get("user-agent") ?? "";
  const uaResult = UAParser(ua);

  const device = uaResult.device.type ?? "desktop";
  const browser = uaResult.browser.name ?? null;
  const os = uaResult.os.name ?? null;

  // --- Geo headers (Vercel / Cloudflare) ---
  const country =
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry") ??
    null;

  const rawCity = request.headers.get("x-vercel-ip-city") ?? null;
  // Vercel URL-encodes the city name
  const city = rawCity ? decodeURIComponent(rawCity) : null;

  // --- Insert into Supabase ---
  const { error } = await supabase.from("analytics_events").insert({
    profile_id,
    link_id: link_id ?? null,
    event_type,
    referrer: referrer ?? null,
    country,
    city,
    device,
    browser,
    os,
  });

  if (error) {
    console.error("[analytics] insert error:", error.message);
    // Still return ok:false to avoid leaking DB errors to the client
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
