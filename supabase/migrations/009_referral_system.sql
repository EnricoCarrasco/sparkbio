-- ============================================================================
-- Migration 009: Referral/Affiliate System
-- Adds referral tracking for "Earn with Viopage" feature
-- ============================================================================

-- 1. Add referral columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN referral_code TEXT UNIQUE,
  ADD COLUMN referred_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

ALTER TABLE public.profiles
  ADD CONSTRAINT no_self_referral CHECK (referred_by != id);

-- Backfill existing users with their username as referral code
UPDATE public.profiles SET referral_code = username WHERE referral_code IS NULL;

-- 2. Immutability trigger for referred_by (can be set once from NULL, never changed)
CREATE OR REPLACE FUNCTION public.prevent_referred_by_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.referred_by IS NOT NULL AND NEW.referred_by IS DISTINCT FROM OLD.referred_by THEN
    RAISE EXCEPTION 'referred_by is immutable once set';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_referred_by_immutable
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_referred_by_change();

-- 3. Update handle_new_user() to set referral_code on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_username     TEXT;
  v_display_name TEXT;
  v_base         TEXT;
  v_suffix       TEXT;
  v_candidate    TEXT;
  v_exists       BOOLEAN;
  v_attempts     INTEGER := 0;
BEGIN
  v_display_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name'
  );

  v_base := lower(split_part(NEW.email, '@', 1));
  v_base := regexp_replace(v_base, '[^a-z0-9-]', '-', 'g');
  v_base := regexp_replace(v_base, '-{2,}', '-', 'g');
  v_base := regexp_replace(v_base, '^-+|-+$', '', 'g');
  v_base := left(v_base, 25);

  IF length(v_base) < 1 THEN
    v_base := 'user';
  END IF;

  LOOP
    IF v_attempts = 0 THEN
      v_candidate := v_base;
    ELSE
      v_suffix    := lower(substring(md5(random()::text) FROM 1 FOR 4));
      v_candidate := v_base || '-' || v_suffix;
    END IF;

    IF length(v_candidate) < 3 THEN
      v_candidate := v_candidate || '-' || lower(substring(md5(random()::text) FROM 1 FOR 3));
    END IF;

    SELECT EXISTS (
      SELECT 1 FROM public.profiles WHERE username = v_candidate
    ) INTO v_exists;

    EXIT WHEN NOT v_exists;

    v_attempts := v_attempts + 1;
    IF v_attempts > 10 THEN
      v_candidate := 'user-' || lower(substring(md5(random()::text) FROM 1 FOR 8));
      EXIT;
    END IF;
  END LOOP;

  INSERT INTO public.profiles (id, username, display_name, referral_code)
  VALUES (NEW.id, v_candidate, v_display_name, v_candidate);

  INSERT INTO public.themes (user_id)
  VALUES (NEW.id);

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user failed for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

-- 4. Create referral_payouts table (BEFORE referral_earnings due to FK)
CREATE TABLE public.referral_payouts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount_cents      INTEGER NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'USD',
  payout_method     TEXT NOT NULL CHECK (payout_method IN ('paypal', 'pix')),
  payout_destination TEXT,
  status            TEXT NOT NULL DEFAULT 'requested'
                      CHECK (status IN ('requested', 'processing', 'completed', 'failed')),
  admin_notes       TEXT,
  processed_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.referral_payouts IS 'Payout batches for referral commissions';

CREATE INDEX idx_referral_payouts_referrer ON public.referral_payouts(referrer_id);
CREATE INDEX idx_referral_payouts_status
  ON public.referral_payouts(status, created_at DESC)
  WHERE status IN ('requested', 'processing');

CREATE TRIGGER trg_referral_payouts_updated_at
  BEFORE UPDATE ON public.referral_payouts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5. Create referral_earnings table
CREATE TABLE public.referral_earnings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id     UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  subscription_id UUID NOT NULL REFERENCES public.subscriptions(id) ON DELETE CASCADE,
  amount_cents    INTEGER NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'available', 'paid', 'cancelled')),
  hold_until      TIMESTAMPTZ NOT NULL,
  payout_id       UUID REFERENCES public.referral_payouts(id) ON DELETE SET NULL,
  paid_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.referral_earnings IS 'Individual referral commissions with hold period';

CREATE INDEX idx_referral_earnings_referrer ON public.referral_earnings(referrer_id, status);
CREATE INDEX idx_referral_earnings_hold
  ON public.referral_earnings(hold_until)
  WHERE status = 'pending';
CREATE INDEX idx_referral_earnings_payout
  ON public.referral_earnings(payout_id)
  WHERE payout_id IS NOT NULL;

CREATE TRIGGER trg_referral_earnings_updated_at
  BEFORE UPDATE ON public.referral_earnings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Create referral_events table
CREATE TABLE public.referral_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id   UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  event_type    TEXT NOT NULL CHECK (event_type IN ('click', 'signup', 'conversion')),
  referral_code TEXT NOT NULL,
  ip_hash       TEXT,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.referral_events IS 'Referral funnel events: click, signup, conversion';

CREATE INDEX idx_referral_events_referrer_created
  ON public.referral_events(referrer_id, created_at DESC);
CREATE INDEX idx_referral_events_dedup
  ON public.referral_events(referral_code, ip_hash, created_at DESC)
  WHERE event_type = 'click';

-- 7. RLS policies

ALTER TABLE public.referral_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_events ENABLE ROW LEVEL SECURITY;

-- referral_payouts: service_role write, owner read
CREATE POLICY "referral_payouts: owner read"
  ON public.referral_payouts FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "referral_payouts: service_role insert"
  ON public.referral_payouts FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "referral_payouts: service_role update"
  ON public.referral_payouts FOR UPDATE
  USING (auth.role() = 'service_role');

-- referral_earnings: service_role write, owner read
CREATE POLICY "referral_earnings: owner read"
  ON public.referral_earnings FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "referral_earnings: service_role insert"
  ON public.referral_earnings FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "referral_earnings: service_role update"
  ON public.referral_earnings FOR UPDATE
  USING (auth.role() = 'service_role');

-- referral_events: service_role insert, owner read
CREATE POLICY "referral_events: owner read"
  ON public.referral_events FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "referral_events: service_role insert"
  ON public.referral_events FOR INSERT
  WITH CHECK (auth.role() = 'service_role');
