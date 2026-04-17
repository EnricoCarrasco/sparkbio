-- ============================================================
-- VIOPAGE — Phase 18: Drop LemonSqueezy columns
-- Migration: 018_drop_lemonsqueezy_columns.sql
-- Applied: 2026-04-18
-- ============================================================
-- Full migration to Stripe is complete. LS columns are no longer
-- used. rotaexecutiva (the last remaining LS subscriber) was moved
-- to is_complimentary_pro; viopage already had it. All LS-origin
-- subscription rows are deleted.
-- ============================================================


-- 1. Delete stale LS-only subscription rows (users retain access via
--    is_complimentary_pro set on their profiles row).
DELETE FROM public.subscriptions
WHERE provider = 'lemonsqueezy';


-- 2. Drop indexes on LS subscription id if any
DROP INDEX IF EXISTS idx_subscriptions_lemonsqueezy_subscription_id;


-- 3. Drop LS + deprecated columns
ALTER TABLE public.subscriptions
  DROP COLUMN IF EXISTS lemonsqueezy_subscription_id,
  DROP COLUMN IF EXISTS lemonsqueezy_customer_id,
  DROP COLUMN IF EXISTS lemonsqueezy_variant_id,
  DROP COLUMN IF EXISTS ls_updated_at,
  DROP COLUMN IF EXISTS update_payment_url,
  DROP COLUMN IF EXISTS customer_portal_url,
  DROP COLUMN IF EXISTS provider;


-- 4. Make stripe_subscription_id + stripe_customer_id NOT NULL going
--    forward. Every row from this point comes from the Stripe webhook
--    which always sets both.
ALTER TABLE public.subscriptions
  ALTER COLUMN stripe_subscription_id SET NOT NULL,
  ALTER COLUMN stripe_customer_id SET NOT NULL;
