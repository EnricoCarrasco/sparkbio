import Stripe from "stripe";

// Server-only: never import from client code.
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-03-25.dahlia",
  typescript: true,
  appInfo: {
    name: "Viopage",
    version: "1.0.0",
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
