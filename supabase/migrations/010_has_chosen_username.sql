-- ============================================================================
-- Migration 010: Add has_chosen_username flag to profiles
-- Enables username selection dialog for OAuth signups
-- ============================================================================

-- 1. Add the column
ALTER TABLE public.profiles
  ADD COLUMN has_chosen_username BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Backfill all existing users as having chosen their username
UPDATE public.profiles SET has_chosen_username = TRUE;

-- 3. Recreate handle_new_user() to set has_chosen_username based on signup method
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  v_username        TEXT;
  v_display_name    TEXT;
  v_base            TEXT;
  v_suffix          TEXT;
  v_candidate       TEXT;
  v_exists          BOOLEAN;
  v_attempts        INTEGER := 0;
  v_has_chosen      BOOLEAN;
BEGIN
  v_display_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name'
  );

  -- If email signup passed a username in metadata, mark as chosen
  v_has_chosen := (NEW.raw_user_meta_data->>'username') IS NOT NULL;

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

  INSERT INTO public.profiles (id, username, display_name, referral_code, has_chosen_username)
  VALUES (NEW.id, v_candidate, v_display_name, v_candidate, v_has_chosen);

  INSERT INTO public.themes (user_id)
  VALUES (NEW.id);

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'handle_new_user failed for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;
