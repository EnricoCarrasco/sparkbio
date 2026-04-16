-- ============================================================
-- VIOPAGE — Migration 017: Webhook ordering guard + complimentary Pro
-- ============================================================
-- Two additive changes:
--
--   1. subscriptions.ls_updated_at — captures data.attributes.updated_at
--      from every LemonSqueezy webhook. The webhook handler uses this to
--      reject stale out-of-order events (prevents the bug where an old
--      subscription's trailing cancellation event overwrites newer state
--      belonging to a resubscription, pause/unpause flap, or a delivery
--      retry).
--
--   2. profiles.is_complimentary_pro — admin-granted lifetime Pro flag
--      that's independent of LemonSqueezy state. Used for owner/team/
--      support grants. isSubscriptionActive() short-circuits to true
--      when this is set.
--
-- Also extends get_public_profile() to expose is_complimentary_pro so
-- SSR public pages can enforce Pro-only theme fields for complimentary
-- users.
-- ============================================================


-- ============================================================
-- SECTION 1: subscriptions.ls_updated_at
-- ============================================================

ALTER TABLE public.subscriptions
  ADD COLUMN ls_updated_at TIMESTAMPTZ;

COMMENT ON COLUMN public.subscriptions.ls_updated_at IS
  'data.attributes.updated_at from the LemonSqueezy event payload. Used by the webhook to reject stale out-of-order events.';

-- Backfill from our own updated_at so the guard has a starting value
-- for rows created before this migration. Any event arriving post-deploy
-- will carry a real LS timestamp which will be newer.
UPDATE public.subscriptions SET ls_updated_at = updated_at WHERE ls_updated_at IS NULL;


-- ============================================================
-- SECTION 2: profiles.is_complimentary_pro
-- ============================================================

ALTER TABLE public.profiles
  ADD COLUMN is_complimentary_pro BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.profiles.is_complimentary_pro IS
  'When true, grants lifetime Pro access regardless of subscription state. Set manually via SQL for owner/team/support grants.';

-- Grant viopage (owner account) complimentary Pro
UPDATE public.profiles SET is_complimentary_pro = true WHERE username = 'viopage';


-- ============================================================
-- SECTION 3: get_public_profile RPC — expose is_complimentary_pro
-- ============================================================
-- Preserves the existing `profile` and `subscription` fields exactly;
-- only adds a new top-level `is_complimentary_pro` field.

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
      WHERE l.user_id = p.id AND l.is_active = true
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
      WHERE si.user_id = p.id AND si.is_active = true
    ),
    'subscription', (
      SELECT json_build_object(
        'status', s.status,
        'current_period_end', s.current_period_end,
        'trial_ends_at', s.trial_ends_at
      )
      FROM public.subscriptions s
      WHERE s.user_id = p.id AND s.status IN ('on_trial', 'active')
      LIMIT 1
    ),
    'is_complimentary_pro', p.is_complimentary_pro
  )
  INTO v_result
  FROM public.profiles p
  WHERE p.username = p_username;

  RETURN v_result;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_profile(TEXT) TO anon, authenticated;
