/**
 * Triggers on-demand revalidation of the user's public profile page.
 * Called from Zustand stores after successful saves so the public page
 * reflects changes immediately instead of waiting up to 60s (ISR).
 *
 * Fire-and-forget — errors are logged but don't block the caller.
 */
export function triggerRevalidation() {
  fetch("/api/revalidate", { method: "POST" }).catch((err) => {
    console.error("[revalidate] failed:", err);
  });
}
