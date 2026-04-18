-- ============================================================
-- 019_restrict_url_schemes.sql
-- ============================================================
-- Defense in depth for XSS via dangerous URL schemes.
--
-- Public profiles render user-supplied URLs as href attributes. Client-side
-- Zod + store guards reject `javascript:`, `data:`, `vbscript:`, but an
-- attacker with a Supabase anon key could still write them directly via the
-- RLS-allowed INSERT policy. This CHECK constraint closes the hole at the DB.
--
-- Allowed: http, https, mailto, tel, sms (matches ALLOWED_URL_PROTOCOLS in
-- src/lib/validators/url.ts).
-- ============================================================

ALTER TABLE public.links
  ADD CONSTRAINT links_url_scheme_ok
  CHECK (url ~* '^(https?|mailto|tel|sms):');

ALTER TABLE public.social_icons
  ADD CONSTRAINT social_icons_url_scheme_ok
  CHECK (url ~* '^(https?|mailto|tel|sms):');
