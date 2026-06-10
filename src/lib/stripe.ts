import Stripe from "stripe";

// Server-only: never import from client code.
//
// Lazily instantiated: constructing `new Stripe(undefined!)` at module-load
// throws ("Neither apiKey nor config.authenticator provided"), which crashed
// `next build` page-data collection for any route importing this module when
// STRIPE_SECRET_KEY wasn't present in the build env. A Proxy defers creation
// until first property access (i.e. an actual request), so importing the module
// is always safe and the env var is only required at runtime.
let _stripe: Stripe | null = null;
function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    _stripe = new Stripe(key, {
      apiVersion: "2026-03-25.dahlia",
      typescript: true,
      appInfo: { name: "Viopage", version: "1.0.0" },
    });
  }
  return _stripe;
}

export const stripe = new Proxy({} as Stripe, {
  get(_target, prop, receiver) {
    return Reflect.get(getStripe(), prop, receiver);
  },
});

// Price IDs per (interval, region). Filled from Phase 1 MCP output.
export const PRICE_IDS = {
  monthly: {
    default: process.env.STRIPE_PRICE_MONTHLY_EUR!,
    BR: process.env.STRIPE_PRICE_MONTHLY_BRL!,
  },
  yearly: {
    default: process.env.STRIPE_PRICE_YEARLY_EUR!,
    BR: process.env.STRIPE_PRICE_YEARLY_BRL!,
  },
} as const;

export type BillingInterval = "monthly" | "yearly";
export type Region = "default" | "BR";

// Map Stripe subscription status → our internal enum.
// Returns null for statuses we don't track (incomplete / incomplete_expired).
export function mapStripeStatus(
  s: Stripe.Subscription.Status
): "on_trial" | "active" | "past_due" | "cancelled" | "expired" | "paused" | null {
  switch (s) {
    case "trialing":
      return "on_trial";
    case "active":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
      return "cancelled";
    case "unpaid":
      return "expired";
    case "paused":
      return "paused";
    case "incomplete":
    case "incomplete_expired":
      return null;
    default:
      return null;
  }
}

// In Stripe API 2026-03-25.dahlia, `current_period_end` moved from Subscription
// to SubscriptionItem. Prefer the first item (our subs always have exactly one).
export function getCurrentPeriodEnd(sub: Stripe.Subscription): number | null {
  const item = sub.items?.data?.[0];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fromItem = (item as any)?.current_period_end as number | undefined;
  if (typeof fromItem === "number") return fromItem;
  // Fallback in case old events still have it at the top level
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const legacy = (sub as any).current_period_end as number | undefined;
  return typeof legacy === "number" ? legacy : null;
}
