-- ============================================================================
-- Viopage — live database verification
-- Run in Supabase SQL editor or via Supabase MCP execute_sql (credentialed).
-- Each block prints PASS/FAIL-ish output. Investigate anything unexpected.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. CRITICAL: is the privileged-column protection trigger (migration 024)
--    actually enabled on profiles? tgenabled should be 'O' (enabled).
-- ----------------------------------------------------------------------------
SELECT tgname,
       tgenabled,
       CASE tgenabled WHEN 'O' THEN 'ENABLED'
                      WHEN 'D' THEN 'DISABLED (!!)'
                      ELSE tgenabled END AS state
FROM pg_trigger
WHERE tgrelid = 'public.profiles'::regclass
  AND NOT tgisinternal
ORDER BY tgname;

-- ----------------------------------------------------------------------------
-- 2. CRITICAL: has anyone already self-granted complimentary Pro?
--    Expect ONLY accounts you intentionally comped / redeemed lifetime codes.
-- ----------------------------------------------------------------------------
SELECT id, username, is_complimentary_pro, commission_bps_override, created_at
FROM public.profiles
WHERE is_complimentary_pro = true
   OR commission_bps_override IS NOT NULL
ORDER BY created_at DESC;

-- ----------------------------------------------------------------------------
-- 3. Every SECURITY DEFINER function must pin search_path (migration 026).
--    Any row returned here is a hijack risk -> needs `SET search_path`.
-- ----------------------------------------------------------------------------
SELECT n.nspname AS schema,
       p.proname AS function,
       p.prosecdef AS security_definer,
       p.proconfig AS config
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.prosecdef = true
  AND (p.proconfig IS NULL
       OR NOT EXISTS (
         SELECT 1 FROM unnest(p.proconfig) c WHERE c LIKE 'search_path=%'
       ))
ORDER BY p.proname;

-- ----------------------------------------------------------------------------
-- 4. RLS must be enabled on every public table.
--    relrowsecurity = true expected for all app tables.
-- ----------------------------------------------------------------------------
SELECT c.relname AS table_name,
       c.relrowsecurity AS rls_enabled,
       c.relforcerowsecurity AS rls_forced
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
ORDER BY c.relrowsecurity, c.relname;

-- ----------------------------------------------------------------------------
-- 5. get_public_profile must NOT return PII. Call it for a real username and
--    eyeball the JSON: there should be NO payout_destination, payout_method,
--    commission_bps_override, referred_by, payout_*, email, etc.
--    Replace 'some_real_username' below.
-- ----------------------------------------------------------------------------
-- SELECT public.get_public_profile('some_real_username');

-- ----------------------------------------------------------------------------
-- 6. Referral integrity: any duplicate earnings per subscription? (race bug)
--    Expect ZERO rows. If rows appear, the dedupe / unique constraint is
--    missing and affiliates were double-credited.
-- ----------------------------------------------------------------------------
SELECT subscription_id, count(*) AS n
FROM public.referral_earnings
WHERE subscription_id IS NOT NULL
GROUP BY subscription_id
HAVING count(*) > 1
ORDER BY n DESC;

-- ----------------------------------------------------------------------------
-- 7. Referral integrity: negative or absurd earning amounts?  Expect ZERO.
-- ----------------------------------------------------------------------------
SELECT id, referrer_id, amount_cents, currency, status, created_at
FROM public.referral_earnings
WHERE amount_cents <= 0 OR amount_cents > 100000   -- > ~$1000 single earning
ORDER BY created_at DESC;

-- ----------------------------------------------------------------------------
-- 8. Self-referral: anyone who referred themselves?  Expect ZERO rows.
-- ----------------------------------------------------------------------------
SELECT p.id, p.username, p.referred_by
FROM public.profiles p
WHERE p.referred_by = p.id;

-- ----------------------------------------------------------------------------
-- 9. Reserved usernames squatted at the DB layer?  Expect ZERO rows.
--    (Add any new reserved words you protect in code.)
-- ----------------------------------------------------------------------------
SELECT id, username
FROM public.profiles
WHERE lower(username) IN (
  'en','pt-br','api','admin','dashboard','login','register','redeem',
  'blog','about','terms','privacy','earn','monitoring','sitemap','robots',
  'www','app','mail','support','help','settings','auth','static','assets'
);

-- ----------------------------------------------------------------------------
-- 10. Storage buckets: confirm public flag + that no public LIST policy exists
--     (migration 021/027 dropped listing). Eyeball the policy list.
-- ----------------------------------------------------------------------------
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
ORDER BY name;

SELECT polname, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY polname;
