-- ============================================================
-- VIOPAGE — Phase 17: Stripe Integration (LemonSqueezy → Stripe)
-- Migration: 017_stripe_integration.sql
-- Applied: 2026-04-18
-- ============================================================
-- After LemonSqueezy banned the account, migrate to Stripe.
-- Additive migration:
--   - Makes LS columns nullable (so Stripe rows can exist without them)
--   - Adds stripe_* columns
--   - Adds provider discriminator ('lemonsqueezy' | 'stripe')
-- The old LS webhook still works for any in-flight events, and existing
-- data is untouched. New subscriptions always come in as provider='stripe'.
-- ============================================================


-- Make LS columns nullable (was NOT NULL for LS rows)
ALTER TABLE public.subscriptions
  ALTER COLUMN lemonsqueezy_subscription_id DROP NOT NULL,
  ALTER COLUMN lemonsqueezy_customer_id     DROP NOT NULL,
  ALTER COLUMN lemonsqueezy_variant_id      DROP NOT NULL;

-- Add Stripe columns
ALTER TABLE public.subscriptions
  ADD COLUMN stripe_subscription_id TEXT UNIQUE,
  ADD COLUMN stripe_customer_id     TEXT,
  ADD COLUMN stripe_price_id        TEXT,
  ADD COLUMN stripe_updated_at      TIMESTAMPTZ,
  ADD COLUMN provider               TEXT NOT NULL DEFAULT 'lemonsqueezy'
    CHECK (provider IN ('lemonsqueezy', 'stripe'));

CREATE INDEX idx_subscriptions_stripe_subscription_id
  ON public.subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_stripe_customer_id
  ON public.subscriptions(stripe_customer_id);

COMMENT ON COLUMN public.subscriptions.stripe_subscription_id IS
  'Stripe subscription ID (sub_...) when provider=stripe';
COMMENT ON COLUMN public.subscriptions.stripe_customer_id IS
  'Stripe customer ID (cus_...) - reused across subscriptions for the same user';
COMMENT ON COLUMN public.subscriptions.stripe_price_id IS
  'Current Stripe price ID (price_...) - used for referral commission calc';
COMMENT ON COLUMN public.subscriptions.stripe_updated_at IS
  'Authoritative event timestamp for ordering guard (from webhook event.created)';
COMMENT ON COLUMN public.subscriptions.provider IS
  'Which payment provider this subscription is from. Discriminator for the dual-provider period.';
