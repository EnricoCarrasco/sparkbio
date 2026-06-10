-- ============================================================================
-- 028_security_hardening.sql
--
-- Closes three gaps found in the security review:
--   1. Pix social-icon values could carry an executable scheme (stored XSS in
--      grid render mode). Migration 022 exempted Pix from URL-scheme checks
--      entirely; re-tighten so Pix is still blocked from javascript:/data:/etc.
--   2. Reserved usernames were enforced ONLY in client JS — a raw anon-key
--      UPDATE could squat `admin`, `api`, `redeem`, ... . Enforce at the DB.
--   3. referral_earnings could be double-credited by a webhook race (no unique
--      key on subscription_id).
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Pix may skip the URL whitelist, but never an executable scheme.
-- ----------------------------------------------------------------------------
ALTER TABLE public.social_icons DROP CONSTRAINT IF EXISTS social_icons_url_scheme_ok;

ALTER TABLE public.social_icons
  ADD CONSTRAINT social_icons_url_scheme_ok
  CHECK (
    (
      platform = 'pix'
      AND url !~* '^\s*(javascript|data|vbscript|file):'
    )
    OR url ~* '^(https?|mailto|tel|sms):'
  );

-- ----------------------------------------------------------------------------
-- 2. Reserved-username guard at the DB layer (keep the JS list for UX).
--    Runs for everyone; admins/service_role rarely set usernames and can be
--    added to an exception if ever needed. Case-insensitive.
-- ----------------------------------------------------------------------------
create or replace function public.enforce_reserved_username()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  reserved text[] := array[
    'admin','api','app','auth','blog','callback','dashboard','docs','help',
    'login','logout','pricing','privacy','register','reset-password',
    'forgot-password','settings','signup','support','terms','about','contact',
    'earn','features','home','profile','search','status','legal','sparkbio',
    'www','mail','ftp','static','assets','cdn','images','public','en','pt-br',
    'redeem','trial','preview','sitemap','robots','manifest','monitoring','card'
  ];
begin
  if new.username is not null
     and (tg_op = 'INSERT' or new.username is distinct from old.username)
     and lower(new.username) = any (reserved) then
    raise exception 'Username "%" is reserved', new.username;
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_reserved_username on public.profiles;
create trigger enforce_reserved_username
  before insert or update of username on public.profiles
  for each row execute function public.enforce_reserved_username();

-- ----------------------------------------------------------------------------
-- 3. Prevent duplicate referral earnings for the same subscription.
--    Partial unique index (subscription_id may be NULL for non-subscription
--    earnings / manual adjustments).
-- ----------------------------------------------------------------------------
CREATE UNIQUE INDEX IF NOT EXISTS referral_earnings_subscription_id_uniq
  ON public.referral_earnings (subscription_id)
  WHERE subscription_id IS NOT NULL;
