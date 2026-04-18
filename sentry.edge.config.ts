// Sentry SDK init for the Edge runtime (middleware, route handlers using edge runtime).
// Loaded by instrumentation.ts when process.env.NEXT_RUNTIME === "edge".
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 0,
  enabled: process.env.NODE_ENV === "production",
  environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV,
  ignoreErrors: ["AbortError"],
});
