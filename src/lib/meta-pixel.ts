// Meta (Facebook) Pixel utility — direct fbq calls, no GTM.
// The base Pixel code is loaded in src/app/layout.tsx.

type FbqFn = (command: string, eventName: string, params?: Record<string, unknown>) => void;

declare global {
  interface Window {
    fbq?: FbqFn;
    _fbq?: FbqFn;
  }
}

function fbq(command: string, eventName: string, params?: Record<string, unknown>) {
  if (typeof window === "undefined" || typeof window.fbq !== "function") return;
  window.fbq(command, eventName, params);
}

/** Fire a PageView. Called on SPA navigation (initial load is handled by the inline base code). */
export function trackPageView() {
  fbq("track", "PageView");
}

/** Fire CompleteRegistration for new sign-ups. */
export function trackRegistration() {
  fbq("track", "CompleteRegistration");
}

/** Fire ViewContent when a public profile is visited. */
export function trackViewContent(contentId: string) {
  fbq("track", "ViewContent", {
    content_ids: [contentId],
    content_type: "product",
  });
}

/** Fire Lead event (placeholder for future marketing forms). */
export function trackLead() {
  fbq("track", "Lead");
}
