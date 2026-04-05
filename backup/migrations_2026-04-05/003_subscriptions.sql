-- ============================================================
-- SPARKBIO MVP — Phase 3: Subscription System
-- Migration: 003_subscriptions.sql
-- Applied: 2026-03-25
-- ============================================================
-- Broken into logical sections:
--   1. subscriptions Table
--   2. Indexes
--   3. updated_at Trigger
--   4. Row Level Security Policies
--   5. RPC: get_public_profile (updated to include subscription field)
-- ============================================================


-- ============================================================
-- SECTION 1: subscriptions Table
-- ============================================================

CREATE TABLE public.subscriptions (
  id                           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                      UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  lemonsqueezy_subscription_id TEXT UNIQUE NOT NULL,
  lemonsqueezy_customer_id     TEXT NOT NULL,
  lemonsqueezy_variant_id      TEXT NOT NULL,
  status                       TEXT NOT NULL DEFAULT 'active'
                                 CHECK (status IN ('on_trial','active','paused','past_due','cancelled','expired')),
  current_period_end           TIMESTAMPTZ,
  trial_ends_at                TIMESTAMPTZ,
  cancel_at                    TIMESTAMPTZ,
  update_payment_url           TEXT,
  customer_portal_url          TEXT,
  created_at                   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                   TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.subscriptions IS 'LemonSqueezy subscription state for each user';


-- ============================================================
-- SECTION 2: Indexes
-- ============================================================

CREATE INDEX idx_subscriptions_user_id
  ON public.subscriptions(user_id);

CREATE INDEX idx_subscriptions_lemonsqueezy_subscription_id
  ON public.subscriptions(lemonsqueezy_subscription_id);


-- ============================================================
-- SECTION 3: updated_at Trigger
-- ============================================================

CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ============================================================
-- SECTION 4: Row Level Security
-- ============================================================

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own subscription row
CREATE POLICY "subscriptions: owner read"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Only service_role can insert (called from webhook handler)
CREATE POLICY "subscriptions: service_role insert"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Only service_role can update (called from webhook handler)
CREATE POLICY "subscriptions: service_role update"
  ON public.subscriptions FOR UPDATE
  USING (auth.role() = 'service_role');

-- Only service_role can delete (e.g. on full account wipe)
CREATE POLICY "subscriptions: service_role delete"
  ON public.subscriptions FOR DELETE
  USING (auth.role() = 'service_role');


-- ============================================================
-- SECTION 5: RPC — get_public_profile (updated)
-- Adds a `subscription` field with status + current_period_end
-- for users with an active or trialing subscription; NULL for
-- free users. Callers use this to gate pro-only profile features.
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_public_profile(p_username TEXT)
RETURNS JSON
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'profile', row_to_json(p.*),
    'links', (
      SELECT json_agg(l.* ORDER BY l.position ASC)
      FROM public.links l
      WHERE l.user_id = p.id
        AND l.is_active = true
    ),
    'theme', (
      SELECT row_to_json(t.*)
      FROM public.themes t
      WHERE t.user_id = p.id
      LIMIT 1
    ),
    'social_icons', (
      SELECT json_agg(si.* ORDER BY si.position ASC)
      FROM public.social_icons si
      WHERE si.user_id = p.id
        AND si.is_active = true
    ),
    'subscription', (
      SELECT json_build_object(
        'status', s.status,
        'current_period_end', s.current_period_end
      )
      FROM public.subscriptions s
      WHERE s.user_id = p.id
        AND s.status IN ('on_trial', 'active')
      LIMIT 1
    )
  )
  INTO v_result
  FROM public.profiles p
  WHERE p.username = p_username;

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.get_public_profile(TEXT) IS
  'Returns the full public profile payload (profile, active links, theme, active social icons, subscription) for a given username as a single JSON object. Returns NULL if username not found. The subscription field is non-null only for users with an active or on_trial subscription.';

GRANT EXECUTE ON FUNCTION public.get_public_profile(TEXT) TO anon, authenticated;
