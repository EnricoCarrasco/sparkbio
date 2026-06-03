-- Block normal (authenticated) users from self-granting Pro, boosting their
-- referral commission, or forging referral attribution by writing protected
-- profile columns directly via the Supabase client.
-- IMPORTANT: SECURITY INVOKER (default) so current_user reflects the caller's
-- role. service_role (webhook/admin/signup) and SECURITY DEFINER functions
-- (redeem_lifetime_code) run as a non-'authenticated' role and bypass this.
create or replace function public.enforce_profile_column_protection()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user = 'authenticated' then
    if new.is_complimentary_pro   is distinct from old.is_complimentary_pro
       or new.commission_bps_override is distinct from old.commission_bps_override
       or new.referred_by         is distinct from old.referred_by then
      raise exception 'Modifying a protected profile column (is_complimentary_pro / commission_bps_override / referred_by) is not allowed';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists enforce_profile_column_protection on public.profiles;
create trigger enforce_profile_column_protection
  before update on public.profiles
  for each row execute function public.enforce_profile_column_protection();
