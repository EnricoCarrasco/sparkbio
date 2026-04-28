-- ============================================================
-- 020_relax_url_scheme_for_pix.sql
-- ============================================================
-- Pix stores a raw key (CPF / phone / email / EVP UUID), not a URL.
-- It's never rendered as href — the public profile shows it as plain
-- text and copies to clipboard — so no XSS risk. Allow non-URL `url`
-- for platform = 'pix' only; keep the URL-scheme guard from migration
-- 019 for every other platform.
-- ============================================================

ALTER TABLE public.social_icons DROP CONSTRAINT social_icons_url_scheme_ok;

ALTER TABLE public.social_icons
  ADD CONSTRAINT social_icons_url_scheme_ok
  CHECK (
    platform = 'pix'
    OR url ~* '^(https?|mailto|tel|sms):'
  );
