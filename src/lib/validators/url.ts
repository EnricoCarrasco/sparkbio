/**
 * URL-scheme whitelist shared by link + social-icon + business-card validators.
 *
 * Public profiles render user-supplied URLs as href attributes. Without this
 * gate a creator could save `javascript:alert(1)` or `data:text/html,...` and
 * weaponize their profile against visitors. The list below is everything a
 * creator could legitimately want to link to.
 */
export const ALLOWED_URL_PROTOCOLS = new Set([
  "http:",
  "https:",
  "mailto:",
  "tel:",
  "sms:",
]);

export function isSafeUrl(raw: string): boolean {
  try {
    const parsed = new URL(raw);
    return ALLOWED_URL_PROTOCOLS.has(parsed.protocol);
  } catch {
    return false;
  }
}
