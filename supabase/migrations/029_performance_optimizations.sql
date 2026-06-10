-- ============================================================================
-- 029_performance_optimizations.sql
--
-- Performance pass driven by the Supabase advisors + pg_stat review:
--   1. New `card-assets` storage bucket — business-card logos / AI images move
--      out of profiles.business_card_settings (they were stored as base64 in
--      JSONB; one profile carried a 585 kB logo that get_public_profile
--      shipped to every visitor). Uploads are server-side only (service_role),
--      so no owner policies are needed; public read works via the
--      /object/public/ URL path which bypasses storage RLS (see migration 021).
--   2. RLS initplan: wrap auth.uid()/auth.role() in (select ...) so the value
--      is computed once per query instead of once per row.
--   3. Drop a duplicate index, add indexes the code actually queries by
--      (analytics_events.link_id) and covering indexes for flagged FKs.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. card-assets bucket
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'card-assets',
  'card-assets',
  true,
  5242880,  -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public             = EXCLUDED.public,
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ----------------------------------------------------------------------------
-- 2. RLS initplan: (select auth.uid()) is evaluated once per statement;
--    bare auth.uid() re-evaluates per row.
-- ----------------------------------------------------------------------------
ALTER POLICY "analytics: owner read" ON public.analytics_events
  USING ((select auth.uid()) = profile_id);
ALTER POLICY "analytics: service_role insert" ON public.analytics_events
  WITH CHECK ((select auth.role()) = 'service_role');

ALTER POLICY "redeemer can see own" ON public.lifetime_codes
  USING (redeemed_by = (select auth.uid()));

ALTER POLICY "links: owner insert" ON public.links
  WITH CHECK ((select auth.uid()) = user_id);
ALTER POLICY "links: owner update" ON public.links
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);
ALTER POLICY "links: owner delete" ON public.links
  USING ((select auth.uid()) = user_id);

ALTER POLICY "profiles: owner update" ON public.profiles
  USING ((select auth.uid()) = id)
  WITH CHECK ((select auth.uid()) = id);

ALTER POLICY "referral_earnings: owner read" ON public.referral_earnings
  USING ((select auth.uid()) = referrer_id);
ALTER POLICY "referral_earnings: service_role insert" ON public.referral_earnings
  WITH CHECK ((select auth.role()) = 'service_role');
ALTER POLICY "referral_earnings: service_role update" ON public.referral_earnings
  USING ((select auth.role()) = 'service_role');

ALTER POLICY "referral_events: owner read" ON public.referral_events
  USING ((select auth.uid()) = referrer_id);
ALTER POLICY "referral_events: service_role insert" ON public.referral_events
  WITH CHECK ((select auth.role()) = 'service_role');

ALTER POLICY "referral_payouts: owner read" ON public.referral_payouts
  USING ((select auth.uid()) = referrer_id);
ALTER POLICY "referral_payouts: service_role insert" ON public.referral_payouts
  WITH CHECK ((select auth.role()) = 'service_role');
ALTER POLICY "referral_payouts: service_role update" ON public.referral_payouts
  USING ((select auth.role()) = 'service_role');

ALTER POLICY "social_icons: owner insert" ON public.social_icons
  WITH CHECK ((select auth.uid()) = user_id);
ALTER POLICY "social_icons: owner update" ON public.social_icons
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);
ALTER POLICY "social_icons: owner delete" ON public.social_icons
  USING ((select auth.uid()) = user_id);

ALTER POLICY "subscriptions: owner read" ON public.subscriptions
  USING ((select auth.uid()) = user_id);
ALTER POLICY "subscriptions: service_role insert" ON public.subscriptions
  WITH CHECK ((select auth.role()) = 'service_role');
ALTER POLICY "subscriptions: service_role update" ON public.subscriptions
  USING ((select auth.role()) = 'service_role');
ALTER POLICY "subscriptions: service_role delete" ON public.subscriptions
  USING ((select auth.role()) = 'service_role');

ALTER POLICY "themes: owner update" ON public.themes
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

-- ----------------------------------------------------------------------------
-- 3. Index hygiene
-- ----------------------------------------------------------------------------
-- idx_analytics_created_at and idx_analytics_events_created_at are identical.
DROP INDEX IF EXISTS public.idx_analytics_events_created_at;

-- link-insights modal + click-count hook filter analytics_events by link_id.
CREATE INDEX IF NOT EXISTS idx_analytics_link_id
  ON public.analytics_events (link_id)
  WHERE link_id IS NOT NULL;

-- Covering indexes for FKs flagged by the advisor (cheap, helps cascades/joins).
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by
  ON public.profiles (referred_by)
  WHERE referred_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_referral_earnings_referred_id
  ON public.referral_earnings (referred_id);
CREATE INDEX IF NOT EXISTS idx_referral_events_referred_id
  ON public.referral_events (referred_id);
CREATE INDEX IF NOT EXISTS idx_lifetime_codes_created_by
  ON public.lifetime_codes (created_by);
