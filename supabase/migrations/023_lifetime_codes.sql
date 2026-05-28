-- ============================================================================
-- 023_lifetime_codes.sql
-- ============================================================================
-- Single-use "lifetime Pro" / Ambassador codes that the founder hand-delivers
-- to influencers via DM. Each code carries the influencer's handle so the
-- redemption page can greet them by name, an optional commission-rate override
-- so ambassadors earn boosted recurring commissions (e.g. 30% vs the default
-- 20%), and a locale so the page renders in EN or PT-BR.
--
-- Integrates with the existing affiliate program: every user already has a
-- referral_code from signup, so granting Ambassador = flip is_complimentary_pro
-- + set commission_bps_override. Their existing /earn dashboard "just works".
-- ============================================================================

-- 1. Defensive: ensure `is_complimentary_pro` exists.
--    Referenced by src/lib/constants.ts (isSubscriptionActive) but its CREATE
--    is missing from prior migrations (see 018's comment — it was added
--    outside migrations historically). This makes the schema reproducible.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_complimentary_pro BOOLEAN NOT NULL DEFAULT false;

-- 2. Per-user commission override (in basis points: 3000 = 30%).
--    NULL = use REFERRAL_COMMISSION_PERCENT default. Set when an ambassador
--    redeems a code that carries a commission_bps value.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS commission_bps_override INTEGER
  CHECK (commission_bps_override IS NULL OR (commission_bps_override BETWEEN 0 AND 10000));

COMMENT ON COLUMN public.profiles.commission_bps_override IS
  'Per-user referral commission rate override in basis points (3000 = 30%). NULL falls back to REFERRAL_COMMISSION_PERCENT.';

-- 3. lifetime_codes table
CREATE TABLE public.lifetime_codes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            TEXT UNIQUE NOT NULL,
  -- Influencer's @handle (no leading @). Shown on redemption page greeting.
  handle          TEXT,
  -- Internal admin notes; never shown to the influencer.
  notes           TEXT,
  -- Language the redemption page renders in.
  locale          TEXT NOT NULL DEFAULT 'en'
                  CHECK (locale IN ('en', 'pt-BR')),
  -- Optional commission override (basis points). NULL = default 20%.
  commission_bps  INTEGER
                  CHECK (commission_bps IS NULL OR (commission_bps BETWEEN 0 AND 10000)),
  -- How many times the redemption page was visited. Useful to spot
  -- "clicked but didn't redeem" outreach follow-ups.
  view_count      INTEGER NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'redeemed', 'revoked')),
  created_by      UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  redeemed_by     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  redeemed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.lifetime_codes IS
  'Single-use ambassador invitation codes. Redemption grants lifetime Pro and optional boosted commission.';

CREATE INDEX idx_lifetime_codes_status ON public.lifetime_codes(status);
CREATE INDEX idx_lifetime_codes_redeemer ON public.lifetime_codes(redeemed_by);
CREATE INDEX idx_lifetime_codes_created_at ON public.lifetime_codes(created_at DESC);

-- 4. RLS — no client policies for INSERT/UPDATE/DELETE.
--    Admin UI uses createAdminClient() (service_role). The redemption RPC is
--    SECURITY DEFINER and does its own row-locking. Public users cannot
--    enumerate codes by guessing.
ALTER TABLE public.lifetime_codes ENABLE ROW LEVEL SECURITY;

-- A redeemer can see their own redeemed code (for a future "view my invite"
-- screen if we ever build one). Not strictly required by current code paths.
CREATE POLICY "redeemer can see own"
  ON public.lifetime_codes
  FOR SELECT TO authenticated
  USING (redeemed_by = auth.uid());

-- ============================================================================
-- 5. RPC: redeem_lifetime_code(p_code) — atomic, race-safe redemption.
--    Called from the redemption page after auth succeeds (either email/password
--    or after the OAuth callback).
-- ============================================================================
CREATE OR REPLACE FUNCTION public.redeem_lifetime_code(p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id  UUID := auth.uid();
  v_code     public.lifetime_codes;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  -- Lock the row for the rest of the txn so concurrent redemptions can't both
  -- succeed.
  SELECT * INTO v_code
  FROM public.lifetime_codes
  WHERE upper(code) = upper(p_code)
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_found');
  END IF;

  IF v_code.status <> 'active' THEN
    -- 'redeemed' or 'revoked' — caller renders the appropriate fallback view.
    RETURN jsonb_build_object('ok', false, 'error', v_code.status);
  END IF;

  -- Mark the code consumed.
  UPDATE public.lifetime_codes
  SET status      = 'redeemed',
      redeemed_by = v_user_id,
      redeemed_at = now()
  WHERE id = v_code.id;

  -- Grant lifetime Pro + apply the optional commission override.
  -- COALESCE preserves an existing override if the redeemed code doesn't carry
  -- one (e.g. ambassador who already had a custom rate redeems a "plain"
  -- lifetime code from a different campaign).
  UPDATE public.profiles
  SET is_complimentary_pro    = true,
      commission_bps_override = COALESCE(v_code.commission_bps, commission_bps_override)
  WHERE id = v_user_id;

  RETURN jsonb_build_object(
    'ok', true,
    'handle', v_code.handle,
    'locale', v_code.locale,
    'commission_bps', COALESCE(v_code.commission_bps, 2000)
  );
END $$;

REVOKE EXECUTE ON FUNCTION public.redeem_lifetime_code(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.redeem_lifetime_code(TEXT) TO authenticated;

-- ============================================================================
-- 6. RPC: increment_lifetime_code_view(p_code) — public, no auth.
--    Fires on each /redeem/[code] page render so the admin sees which links
--    got clicked but didn't redeem.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.increment_lifetime_code_view(p_code TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  UPDATE public.lifetime_codes
  SET view_count = view_count + 1
  WHERE upper(code) = upper(p_code)
    AND status IN ('active', 'redeemed');
END $$;

REVOKE EXECUTE ON FUNCTION public.increment_lifetime_code_view(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_lifetime_code_view(TEXT) TO anon, authenticated;

-- ============================================================================
-- 7. RPC: get_lifetime_code_info(p_code) — public, no auth, returns the
--    info needed to render the redemption page (handle, locale, status, code).
--    Never returns commission_bps or notes — those are admin-only.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_lifetime_code_info(p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
DECLARE
  v_row public.lifetime_codes;
BEGIN
  SELECT * INTO v_row
  FROM public.lifetime_codes
  WHERE upper(code) = upper(p_code);

  IF NOT FOUND THEN
    RETURN jsonb_build_object('found', false);
  END IF;

  RETURN jsonb_build_object(
    'found',  true,
    'code',   v_row.code,
    'handle', v_row.handle,
    'locale', v_row.locale,
    'status', v_row.status
  );
END $$;

REVOKE EXECUTE ON FUNCTION public.get_lifetime_code_info(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_lifetime_code_info(TEXT) TO anon, authenticated;

-- ============================================================================
-- 8. RPC: get_ambassadors_summary() — admin-only aggregation for the
--    /admin/ambassadors analytics dashboard.
--    Joins lifetime_codes + profiles + referral_events (counted) +
--    referral_earnings (summed per status & currency).
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_ambassadors_summary()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT COALESCE(jsonb_agg(row_data ORDER BY (row_data->>'redeemed_at') DESC), '[]'::jsonb)
  INTO v_result
  FROM (
    SELECT jsonb_build_object(
      'user_id',           lc.redeemed_by,
      'code',              lc.code,
      'handle',            lc.handle,
      'locale',            lc.locale,
      'commission_bps',    COALESCE(p.commission_bps_override, 2000),
      'is_active',         p.is_complimentary_pro,
      'redeemed_at',       lc.redeemed_at,
      'view_count',        lc.view_count,
      'username',          p.username,
      'display_name',      p.display_name,
      'referral_code',     p.referral_code,
      'clicks',            (
        SELECT count(*) FROM public.referral_events re
        WHERE re.referrer_id = lc.redeemed_by AND re.event_type = 'click'
      ),
      'signups',           (
        SELECT count(*) FROM public.referral_events re
        WHERE re.referrer_id = lc.redeemed_by AND re.event_type = 'signup'
      ),
      'conversions',       (
        SELECT count(*) FROM public.referral_events re
        WHERE re.referrer_id = lc.redeemed_by AND re.event_type = 'conversion'
      ),
      'earnings',          (
        SELECT COALESCE(jsonb_agg(jsonb_build_object(
          'status',   status,
          'currency', currency,
          'cents',    total
        )), '[]'::jsonb)
        FROM (
          SELECT status, currency, sum(amount_cents)::INTEGER AS total
          FROM public.referral_earnings
          WHERE referrer_id = lc.redeemed_by
          GROUP BY status, currency
        ) e
      )
    ) AS row_data
    FROM public.lifetime_codes lc
    LEFT JOIN public.profiles p ON p.id = lc.redeemed_by
    WHERE lc.status = 'redeemed'
      AND lc.redeemed_by IS NOT NULL
  ) sub;

  RETURN COALESCE(v_result, '[]'::jsonb);
END $$;

-- Supabase auto-grants EXECUTE to anon + authenticated for any function in
-- `public` schema. REVOKE FROM PUBLIC doesn't remove those explicit grants —
-- we have to revoke from each role individually to prevent leakage via the
-- /rest/v1/rpc endpoint.
REVOKE EXECUTE ON FUNCTION public.get_ambassadors_summary() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_ambassadors_summary() TO service_role;

-- ============================================================================
-- 9. RPC: get_ambassador_detail(p_user_id) — admin-only per-ambassador
--    detail data: recent events timeline + earnings + payouts.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.get_ambassador_detail(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'profile', (
      SELECT jsonb_build_object(
        'id',                      p.id,
        'username',                p.username,
        'display_name',            p.display_name,
        'referral_code',           p.referral_code,
        'is_complimentary_pro',    p.is_complimentary_pro,
        'commission_bps_override', p.commission_bps_override
      )
      FROM public.profiles p WHERE p.id = p_user_id
    ),
    'code', (
      SELECT jsonb_build_object(
        'code',        lc.code,
        'handle',      lc.handle,
        'locale',      lc.locale,
        'notes',       lc.notes,
        'view_count',  lc.view_count,
        'redeemed_at', lc.redeemed_at
      )
      FROM public.lifetime_codes lc
      WHERE lc.redeemed_by = p_user_id
      ORDER BY lc.redeemed_at DESC NULLS LAST
      LIMIT 1
    ),
    'events', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'event_type', event_type,
        'created_at', created_at
      ) ORDER BY created_at DESC), '[]'::jsonb)
      FROM (
        SELECT event_type, created_at
        FROM public.referral_events
        WHERE referrer_id = p_user_id
        ORDER BY created_at DESC
        LIMIT 100
      ) e
    ),
    'earnings', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'status',   status,
        'currency', currency,
        'cents',    total
      )), '[]'::jsonb)
      FROM (
        SELECT status, currency, sum(amount_cents)::INTEGER AS total
        FROM public.referral_earnings
        WHERE referrer_id = p_user_id
        GROUP BY status, currency
      ) e
    ),
    'payouts', (
      SELECT COALESCE(jsonb_agg(jsonb_build_object(
        'id',           id,
        'status',       status,
        'method',       payout_method,
        'amount_cents', amount_cents,
        'currency',     currency,
        'requested_at', created_at,
        'processed_at', processed_at
      ) ORDER BY created_at DESC), '[]'::jsonb)
      FROM public.referral_payouts
      WHERE referrer_id = p_user_id
    )
  ) INTO v_result;

  RETURN v_result;
END $$;

-- Same lockdown as get_ambassadors_summary — service_role only.
REVOKE EXECUTE ON FUNCTION public.get_ambassador_detail(UUID) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_ambassador_detail(UUID) TO service_role;
