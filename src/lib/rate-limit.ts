/**
 * Simple in-memory rate limiter factory.
 * Acceptable for launch — Vercel provides DDoS protection on all plans.
 * Upgrade to Redis/Upstash when scaling beyond single-instance.
 */
export function createRateLimiter(windowMs: number, maxRequests: number) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  // Prune expired entries every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, val] of hits.entries()) {
      if (val.resetAt < now) hits.delete(key);
    }
  }, 5 * 60 * 1000);

  return function check(key: string): { limited: boolean } {
    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || entry.resetAt < now) {
      hits.set(key, { count: 1, resetAt: now + windowMs });
      return { limited: false };
    }

    entry.count++;
    return { limited: entry.count > maxRequests };
  };
}

/** Extract client IP from request headers (Vercel / Cloudflare / fallback). */
export function getClientIp(request: Request): string {
  const headers = request.headers;
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    headers.get("x-real-ip") ??
    "unknown"
  );
}
