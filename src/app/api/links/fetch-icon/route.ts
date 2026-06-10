import { NextRequest, NextResponse } from "next/server";
import { lookup } from "node:dns/promises";
import * as Sentry from "@sentry/nextjs";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSafeUrl } from "@/lib/validators/url";
import { LINK_ICON_MAX_SIZE, LINK_ICON_ACCEPTED_TYPES } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Route: POST /api/links/fetch-icon   (json: { url })
//
// Best-effort: fetch the page, find its best icon (apple-touch-icon / og:image
// / <link rel=icon>, falling back to Google's favicon service), download it,
// re-host it into the `link-icons` bucket, and return OUR public URL. For
// Play Store / App Store URLs, og:image IS the app icon. Returns
// { iconUrl: null } on any miss so it never blocks link creation.
//
// SSRF-guarded: only http/https + standard ports, hostname + DNS-resolved IPs
// are checked against private/loopback/link-local ranges.
// ---------------------------------------------------------------------------

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FETCH_TIMEOUT_MS = 8000;
// Large enough to reach meta tags on heavy pages — e.g. the Play Store store
// page is ~1.1MB and places <title>/og:image near the very end.
const MAX_HTML_BYTES = 1_500_000;
const UA = "Mozilla/5.0 (compatible; ViopageBot/1.0; +https://viopage.com)";

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

function isPrivateIp(ip: string): boolean {
  if (ip.includes(":")) {
    const v = ip.toLowerCase();
    if (v === "::1" || v === "::") return true;
    if (v.startsWith("fe80") || v.startsWith("fc") || v.startsWith("fd")) return true;
    const m = v.match(/::ffff:(\d+\.\d+\.\d+\.\d+)/);
    if (m) return isPrivateIp(m[1]);
    return false;
  }
  const p = ip.split(".").map(Number);
  if (p.length !== 4 || p.some((n) => Number.isNaN(n) || n < 0 || n > 255)) return true; // malformed → block
  const [a, b] = p;
  if (a === 0 || a === 10 || a === 127) return true;
  if (a === 169 && b === 254) return true; // link-local incl. 169.254.169.254 metadata
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
  if (a >= 224) return true; // multicast / reserved
  return false;
}

async function assertPublicHost(urlStr: string): Promise<URL> {
  const u = new URL(urlStr);
  if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error("blocked_scheme");
  if (u.port && u.port !== "80" && u.port !== "443") throw new Error("blocked_port");
  // URL.hostname keeps IPv6 brackets (e.g. "[::1]"); strip them so the literal
  // IP checks and DNS lookup see the bare address.
  const host = u.hostname.toLowerCase().replace(/^\[|\]$/g, "");
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) {
    throw new Error("blocked_host");
  }
  if (/^[\d.]+$/.test(host) || host.includes(":")) {
    if (isPrivateIp(host)) throw new Error("blocked_ip");
  }
  let results: { address: string }[];
  try {
    results = await lookup(host, { all: true });
  } catch {
    throw new Error("dns_failed");
  }
  if (!results.length) throw new Error("dns_empty");
  for (const r of results) {
    if (isPrivateIp(r.address)) throw new Error("blocked_resolved_ip");
  }
  return u;
}

const MAX_REDIRECTS = 5;

// SSRF-safe fetch: follows redirects MANUALLY, re-running the private-IP/host
// guard on every hop. `fetch(redirect:"follow")` would transparently chase a
// 30x to http://169.254.169.254/ or http://127.0.0.1/ AFTER the initial host
// passed validation — so we must re-validate each Location ourselves.
async function timedFetch(url: string, init?: RequestInit): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    let current = url;
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      // Google's favicon service is a fixed, trusted host; skip the guard for it
      // (its hostname is allowlisted by the caller) but still validate any other.
      if (!current.startsWith("https://www.google.com/s2/favicons")) {
        await assertPublicHost(current);
      }
      const res = await fetch(current, {
        ...init,
        signal: ctrl.signal,
        redirect: "manual",
        headers: { "User-Agent": UA, ...(init?.headers ?? {}) },
      });
      if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get("location");
        if (!loc) return res;
        const next = absUrl(loc, current);
        if (!next) throw new Error("blocked_redirect");
        current = next;
        continue;
      }
      return res;
    }
    throw new Error("too_many_redirects");
  } finally {
    clearTimeout(timer);
  }
}

function absUrl(href: string, base: string): string | null {
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

function pickIcon(html: string, baseUrl: string): { candidates: string[]; title: string | null } {
  const candidates: string[] = [];
  const push = (h?: string | null) => {
    if (!h) return;
    const a = absUrl(h, baseUrl);
    if (a && /^https?:/i.test(a) && !candidates.includes(a)) candidates.push(a);
  };

  // 1) apple-touch-icon (best square app-style icon)
  for (const m of html.matchAll(/<link[^>]+rel=["'][^"']*apple-touch-icon[^"']*["'][^>]*>/gi)) {
    push(m[0].match(/href=["']([^"']+)["']/i)?.[1]);
  }
  // 2) og:image / twitter:image (app icon on store pages)
  for (const m of html.matchAll(
    /<meta[^>]+(?:property|name)=["'](?:og:image(?::url)?|twitter:image)["'][^>]*>/gi
  )) {
    push(m[0].match(/content=["']([^"']+)["']/i)?.[1]);
  }
  // 3) any rel containing "icon"
  for (const m of html.matchAll(/<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]*>/gi)) {
    push(m[0].match(/href=["']([^"']+)["']/i)?.[1]);
  }

  let title: string | null = null;
  const ogt = html.match(
    /<meta[^>]+(?:property|name)=["'](?:og:title|twitter:title)["'][^>]*content=["']([^"']+)["']/i
  );
  if (ogt) title = ogt[1];
  else {
    const t = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (t) title = t[1].trim();
  }

  return { candidates, title };
}

// Download a single icon candidate, validate it, and re-host it into the
// link-icons bucket. Returns our public URL, or null on any failure.
async function rehostIcon(candidate: string, userId: string): Promise<string | null> {
  try {
    const isGoogleFavicon = candidate.startsWith("https://www.google.com/s2/favicons");
    if (!isGoogleFavicon) await assertPublicHost(candidate);

    const res = await timedFetch(candidate, { headers: { Accept: "image/*" } });
    if (!res.ok) return null;
    const ctype = (res.headers.get("content-type") ?? "").split(";")[0].trim().toLowerCase();
    if (!LINK_ICON_ACCEPTED_TYPES.includes(ctype)) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength === 0 || buf.byteLength > LINK_ICON_MAX_SIZE) return null;

    const ext = EXT_BY_TYPE[ctype] ?? "png";
    const filePath = `${userId}/${crypto.randomUUID()}.${ext}`;
    const admin = createAdminClient();
    const { error } = await admin.storage
      .from("link-icons")
      .upload(filePath, buf, { upsert: true, contentType: ctype });
    if (error) {
      Sentry.captureException(error, { tags: { area: "fetch-icon-rehost", bucket: "link-icons" } });
      return null;
    }
    const {
      data: { publicUrl },
    } = admin.storage.from("link-icons").getPublicUrl(filePath);
    return publicUrl;
  } catch {
    return null;
  }
}

async function readLimited(res: Response): Promise<string> {
  const reader = res.body?.getReader();
  if (!reader) return (await res.text()).slice(0, MAX_HTML_BYTES);
  const decoder = new TextDecoder();
  let html = "";
  let received = 0;
  while (received < MAX_HTML_BYTES) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.byteLength;
    html += decoder.decode(value, { stream: true });
  }
  try {
    await reader.cancel();
  } catch {
    /* noop */
  }
  return html;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let body: { url?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_body" }, { status: 400 });
  }
  const url = typeof body.url === "string" ? body.url.trim() : "";
  if (!url || !isSafeUrl(url) || !/^https?:/i.test(url)) {
    return NextResponse.json({ error: "invalid_url" }, { status: 400 });
  }

  let candidates: string[] = [];
  let title: string | null = null;
  let host = "";

  // ── 1. Fetch the page + parse for icon candidates (best-effort) ──
  try {
    const pageUrl = await assertPublicHost(url);
    host = pageUrl.hostname;
    const res = await timedFetch(pageUrl.toString(), { headers: { Accept: "text/html,*/*" } });
    if (res.ok) {
      const html = await readLimited(res);
      const picked = pickIcon(html, pageUrl.toString());
      candidates = picked.candidates;
      title = picked.title;
    }
  } catch (e) {
    if (e instanceof Error && e.message.startsWith("blocked")) {
      return NextResponse.json({ error: "blocked_host" }, { status: 422 });
    }
    // network/DNS failure → still try the favicon fallback below
  }

  // ── 2. Always append the Google favicon service as a final fallback ──
  if (!host) {
    try {
      host = new URL(url).hostname;
    } catch {
      /* noop */
    }
  }
  if (host) {
    candidates.push(
      `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`
    );
  }

  // ── 3. Try each candidate in priority order; return the first that re-hosts ──
  for (const candidate of candidates) {
    const iconUrl = await rehostIcon(candidate, user.id);
    if (iconUrl) return NextResponse.json({ iconUrl, title });
  }
  return NextResponse.json({ iconUrl: null, title });
}
