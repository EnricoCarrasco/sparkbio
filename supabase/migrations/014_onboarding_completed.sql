-- ============================================================================
-- Migration 014: Add has_completed_onboarding flag to profiles
-- Prevents onboarding tour from re-triggering across devices/reloads.
-- ============================================================================

-- 1. Add the column
ALTER TABLE public.profiles
  ADD COLUMN has_completed_onboarding BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Backfill: mark users as completed if they have any content,
--    or if their account is older than 1 day (conservative — they've had time to see it)
UPDATE public.profiles p
SET has_completed_onboarding = TRUE
WHERE EXISTS (SELECT 1 FROM public.links WHERE user_id = p.id)
   OR EXISTS (SELECT 1 FROM public.social_icons WHERE user_id = p.id)
   OR p.created_at < NOW() - INTERVAL '1 day';
