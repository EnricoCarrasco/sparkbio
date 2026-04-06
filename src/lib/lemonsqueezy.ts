import { lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js";

export function initLemonSqueezy() {
  lemonSqueezySetup({
    apiKey: process.env.LEMONSQUEEZY_API_KEY!,
    onError: (error) => console.error("[lemonsqueezy]", error),
  });
}

export const VARIANT_IDS = {
  monthly: {
    default: process.env.LEMONSQUEEZY_MONTHLY_VARIANT_ID!,
    BR: process.env.LEMONSQUEEZY_MONTHLY_BR_VARIANT_ID!,
  },
  yearly: {
    default: process.env.LEMONSQUEEZY_YEARLY_VARIANT_ID!,
    BR: process.env.LEMONSQUEEZY_YEARLY_BR_VARIANT_ID!,
  },
} as const;

export const STORE_ID = process.env.LEMONSQUEEZY_STORE_ID!;
