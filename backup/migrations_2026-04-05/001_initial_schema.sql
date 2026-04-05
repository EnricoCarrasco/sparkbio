-- ============================================================
-- SPARKBIO MVP — Phase 1: Initial Schema
-- Migration: 001_initial_schema.sql
-- Applied: 2026-03-20
-- ============================================================
-- Broken into logical sections:
--   1. Core Tables
--   2. Indexes
--   3. updated_at Trigger
--   4. Auth User Trigger (auto-provision profile + theme)
--   5. Row Level Security Policies
--   6. RPC: get_public_profile
--   7. Storage: avatars bucket + policies
-- ============================================================


-- ============================================================
-- SECTION 1: Core Tables
-- ============================================================

-- PROFILES (extends auth.users)
CREATE TABLE public.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username     TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio          TEXT,
  avatar_url   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT username_format CHECK (username ~ '^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$')
);

COMMENT ON TABLE public.profiles IS 'Public profile data for each Sparkbio user';
COMMENT ON COLUMN public.profiles.username IS 'URL-safe slug, 3-30 chars, lowercase alphanumeric + hyphens';

-- LINKS
CREATE TABLE public.links (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  url           TEXT NOT NULL,
  thumbnail_url TEXT,
  position      INTEGER NOT NULL DEFAULT 0,
  is_active     BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.links IS 'User-created links shown on their public profile page';

-- THEMES (one per user)
CREATE TABLE public.themes (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  bg_color                TEXT NOT NULL DEFAULT '#FAFAFA',
  bg_gradient_from        TEXT,
  bg_gradient_to          TEXT,
  bg_gradient_direction   TEXT NOT NULL DEFAULT 'to bottom',
  text_color              TEXT NOT NULL DEFAULT '#1E1E2E',
  button_color            TEXT NOT NULL DEFAULT '#FF6B35',
  button_text_color       TEXT NOT NULL DEFAULT '#FFFFFF',
  button_style            TEXT NOT NULL DEFAULT 'pill'
                            CHECK (button_style IN ('rounded','pill','sharp','outline','shadow')),
  font_family             TEXT NOT NULL DEFAULT 'Inter'
);

COMMENT ON TABLE public.themes IS 'Visual theme configuration for each user profile page';

-- SOCIAL ICONS
CREATE TABLE public.social_icons (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  platform   TEXT NOT NULL CHECK (platform IN (
               'instagram','tiktok','youtube','x','facebook','linkedin',
               'github','twitch','snapchat','pinterest','spotify',
               'soundcloud','discord','telegram','whatsapp','email','website'
             )),
  url        TEXT NOT NULL,
  position   INTEGER NOT NULL DEFAULT 0,
  is_active  BOOLEAN NOT NULL DEFAULT true
);

COMMENT ON TABLE public.social_icons IS 'Social media icon links shown on user profile pages';

-- ANALYTICS EVENTS (append-only)
CREATE TABLE public.analytics_events (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  link_id    UUID REFERENCES public.links(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('page_view','link_click')),
  referrer   TEXT,
  country    TEXT,
  city       TEXT,
  device     TEXT,
  browser    TEXT,
  os         TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.analytics_events IS 'Append-only event log for page views and link clicks';


-- ============================================================
-- SECTION 2: Indexes
-- ============================================================

CREATE INDEX idx_profiles_username      ON public.profiles(username);
CREATE INDEX idx_links_user_id          ON public.links(user_id);
CREATE INDEX idx_links_position         ON public.links(user_id, position);
CREATE INDEX idx_social_icons_user_id   ON public.social_icons(user_id);
CREATE INDEX idx_analytics_profile_id   ON public.analytics_events(profile_id);
CREATE INDEX idx_analytics_created_at   ON public.analytics_events(created_at);
CREATE INDEX idx_analytics_event_type   ON public.analytics_events(event_type);


-- ============================================================
-- SECTION 3: updated_at Trigger
-- ============================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.update_updated_at_column() IS
  'Automatically sets updated_at to now() on every row update';

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_links_updated_at
  BEFORE UPDATE ON public.links
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_themes_updated_at
  BEFORE UPDATE ON public.themes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ============================================================
-- SECTION 4: Auth User Trigger
-- Auto-provisions a profile + default theme on new user signup
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
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
  -- Derive display name from metadata (Google OAuth or manual signup)
  v_display_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'name'
  );

  -- Derive a base username from the email local-part:
  -- strip @domain, lowercase, replace non-alphanumeric with hyphens,
  -- collapse consecutive hyphens, trim leading/trailing hyphens, truncate to 25 chars
  v_base := lower(split_part(NEW.email, '@', 1));
  v_base := regexp_replace(v_base, '[^a-z0-9-]', '-', 'g');
  v_base := regexp_replace(v_base, '-{2,}', '-', 'g');
  v_base := regexp_replace(v_base, '^-+|-+$', '', 'g');
  v_base := left(v_base, 25);

  -- Fall back to 'user' if base is empty
  IF length(v_base) < 1 THEN
    v_base := 'user';
  END IF;

  -- Find a unique username: try base first, then base-<random4>
  LOOP
    IF v_attempts = 0 THEN
      v_candidate := v_base;
    ELSE
      v_suffix    := lower(substring(md5(random()::text) FROM 1 FOR 4));
      v_candidate := v_base || '-' || v_suffix;
    END IF;

    -- Enforce minimum 3-char length required by the CHECK constraint
    IF length(v_candidate) < 3 THEN
      v_candidate := v_candidate || '-' || lower(substring(md5(random()::text) FROM 1 FOR 3));
    END IF;

    SELECT EXISTS (
      SELECT 1 FROM public.profiles WHERE username = v_candidate
    ) INTO v_exists;

    EXIT WHEN NOT v_exists;

    v_attempts := v_attempts + 1;
    IF v_attempts > 10 THEN
      -- Last-resort: fully random 8-char handle
      v_candidate := 'user-' || lower(substring(md5(random()::text) FROM 1 FOR 8));
      EXIT;
    END IF;
  END LOOP;

  -- Insert profile row
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (NEW.id, v_candidate, v_display_name);

  -- Insert default theme row
  INSERT INTO public.themes (user_id)
  VALUES (NEW.id);

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Never block sign-up due to trigger failure; log and continue
    RAISE WARNING 'handle_new_user failed for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS
  'Provisions a profiles row and default themes row for every new auth.users entry';

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- SECTION 5: Row Level Security
-- ============================================================

-- PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: public read"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "profiles: owner update"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- LINKS
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "links: public read"
  ON public.links FOR SELECT
  USING (true);

CREATE POLICY "links: owner insert"
  ON public.links FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "links: owner update"
  ON public.links FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "links: owner delete"
  ON public.links FOR DELETE
  USING (auth.uid() = user_id);

-- THEMES
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "themes: public read"
  ON public.themes FOR SELECT
  USING (true);

CREATE POLICY "themes: owner update"
  ON public.themes FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- SOCIAL ICONS
ALTER TABLE public.social_icons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "social_icons: public read"
  ON public.social_icons FOR SELECT
  USING (true);

CREATE POLICY "social_icons: owner insert"
  ON public.social_icons FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "social_icons: owner update"
  ON public.social_icons FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "social_icons: owner delete"
  ON public.social_icons FOR DELETE
  USING (auth.uid() = user_id);

-- ANALYTICS EVENTS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Only service_role can insert (called from server-side / edge function)
CREATE POLICY "analytics: service_role insert"
  ON public.analytics_events FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- Users can only read their own analytics
CREATE POLICY "analytics: owner read"
  ON public.analytics_events FOR SELECT
  USING (auth.uid() = profile_id);


-- ============================================================
-- SECTION 6: RPC — get_public_profile
-- Returns full public profile payload as a single JSON object
-- ============================================================

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
      WHERE l.user_id = p.id
        AND l.is_active = true
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
      WHERE si.user_id = p.id
        AND si.is_active = true
    )
  )
  INTO v_result
  FROM public.profiles p
  WHERE p.username = p_username;

  RETURN v_result;
END;
$$;

COMMENT ON FUNCTION public.get_public_profile(TEXT) IS
  'Returns the full public profile payload (profile, active links, theme, active social icons) for a given username as a single JSON object. Returns NULL if username not found.';

GRANT EXECUTE ON FUNCTION public.get_public_profile(TEXT) TO anon, authenticated;


-- ============================================================
-- SECTION 7: Storage — avatars bucket
-- ============================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152,  -- 2MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public             = EXCLUDED.public,
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Anyone can read/download avatars
CREATE POLICY "avatars: public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- Authenticated users can upload only under their own user-id prefix
CREATE POLICY "avatars: owner insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can update only their own avatars
CREATE POLICY "avatars: owner update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Authenticated users can delete only their own avatars
CREATE POLICY "avatars: owner delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
