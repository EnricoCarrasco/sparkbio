// Sentry SDK init for the browser bundle.
// Next.js 15.3+ auto-loads this file on every client render.
// https://nextjs.org/docs/app/api-reference/file-conventions/instrumentation-client
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Keep trace volume modest to stay inside the free-tier span budget.
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,

  // Only emit events in prod + preview; local dev should stay out of the feed.
  enabled: process.env.NODE_ENV === "production",

  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,

  // Browser noise not worth paging on.
  ignoreErrors: [
    "AbortError",
    "Failed to fetch",
    "Load failed",
    "NetworkError when attempting to fetch resource",
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed with undelivered notifications",
    "Non-Error promise rejection captured",
    // Chrome/Safari extensions poking at window.
    /extension\//i,
    /chrome-extension:/i,
  ],

  // We don't enable session replay — it balloons the bundle and has PII
  // implications we haven't fully worked out. Errors are enough for now.

  // Drop anything that could leak user secrets.
  beforeSend(event) {
    // Strip password / token fields from form data if the error bubbled up
    // from a fetch with a request body.
    if (event.request?.data && typeof event.request.data === "object") {
      const data = event.request.data as Record<string, unknown>;
      for (const key of Object.keys(data)) {
        if (/password|token|secret|card|cvc|cvv/i.test(key)) {
          data[key] = "[redacted]";
        }
      }
    }
    return event;
  },
});

// Required export: Sentry hooks into Next.js navigation events.
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
