// Sentry SDK init for the Node.js runtime (API routes, server components, webhooks).
// Loaded by instrumentation.ts when process.env.NEXT_RUNTIME === "nodejs".
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Keep us comfortably inside the free-tier 10k spans/mo budget while still
  // getting a useful sample of traces in production.
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,

  // Only emit events in prod + preview; local dev should stay out of the feed.
  enabled: process.env.NODE_ENV === "production",

  // Tag every event with which Vercel environment it came from so we can
  // filter "this only happens in preview" vs real production noise.
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,

  // Keep the default integrations. Add Supabase / Stripe HTTP breadcrumbs
  // automatically via the built-in http integration.

  // Noise that says nothing about our app.
  ignoreErrors: [
    "AbortError",
    "ResizeObserver loop limit exceeded",
    "ResizeObserver loop completed with undelivered notifications",
  ],

  // Strip anything that could leak user secrets before shipping the event.
  beforeSend(event) {
    scrubSecrets(event);
    return event;
  },
});

// Shared scrubber used by all three runtimes.
function scrubSecrets(event: Sentry.ErrorEvent) {
  const SENSITIVE_KEYS = new Set([
    "password",
    "password_confirmation",
    "token",
    "access_token",
    "refresh_token",
    "authorization",
    "cookie",
    "set-cookie",
    "card",
    "cvc",
    "cvv",
    "stripe_secret_key",
    "stripe_webhook_secret",
    "supabase_service_role_key",
    "sentry_auth_token",
  ]);

  const redact = (obj: Record<string, unknown> | undefined) => {
    if (!obj) return;
    for (const key of Object.keys(obj)) {
      if (SENSITIVE_KEYS.has(key.toLowerCase())) {
        obj[key] = "[redacted]";
      }
    }
  };

  redact(event.request?.headers as Record<string, unknown> | undefined);
  redact(event.request?.cookies as Record<string, unknown> | undefined);
  if (event.request && typeof event.request.data === "object" && event.request.data !== null) {
    redact(event.request.data as Record<string, unknown>);
  }
  redact(event.extra as Record<string, unknown> | undefined);
}
