import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { analyticsEventSchema } from "@/lib/validators/analytics";
import { UAParser } from "ua-parser-js";

// In-memory rate limiter: IP -> last request timestamp (ms)
const rateLimitMap = new Map<string, number>();

// Prune the map every 5 minutes to prevent unbounded growth
setInterval(
  () => {
    const cutoff = Date.now() - 60_000;
    for (const [ip, ts] of rateLimitMap.entries()) {
      if (ts < cutoff) rateLimitMap.delete(ip);
    }
  },
  5 * 60 * 1000
);

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

export async function POST(request: NextRequest) {
  // --- Rate limiting ---
  const clientIp = getClientIp(request);
  const now = Date.now();
  const lastRequest = rateLimitMap.get(clientIp);

  if (lastRequest !== undefined && now - lastRequest < 1_000) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  rateLimitMap.set(clientIp, now);

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
  const supabase = createAdminClient();
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
