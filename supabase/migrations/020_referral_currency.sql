-- ============================================================
-- 020_referral_currency.sql
-- ============================================================
-- Referral earnings were computed from EUR base prices regardless of which
-- currency the subscriber actually paid in. BRL subscribers generated
-- referral rows with EUR-base commissions stored in the same integer column
-- as EUR rows, making payout aggregation incorrect.
--
-- This migration adds a `currency` column to `referral_earnings` so each row
-- explicitly tracks what currency its `amount_cents` is denominated in, and
-- matches the shape of `referral_payouts` (which already has `currency`).
-- Defaults to 'EUR' since all existing rows were written using EUR-base math.
-- ============================================================

ALTER TABLE public.referral_earnings
  ADD COLUMN currency TEXT NOT NULL DEFAULT 'EUR'
    CHECK (currency IN ('EUR', 'BRL'));

CREATE INDEX idx_referral_earnings_currency
  ON public.referral_earnings(currency);

COMMENT ON COLUMN public.referral_earnings.currency IS
  'Currency of amount_cents. EUR = EUR-priced sub, BRL = BRL-priced sub.';
