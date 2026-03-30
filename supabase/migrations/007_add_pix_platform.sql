-- Add 'pix' to the social_icons platform CHECK constraint
ALTER TABLE public.social_icons DROP CONSTRAINT social_icons_platform_check;
ALTER TABLE public.social_icons ADD CONSTRAINT social_icons_platform_check
  CHECK (platform = ANY (ARRAY[
    'instagram'::text, 'tiktok'::text, 'youtube'::text, 'x'::text,
    'facebook'::text, 'linkedin'::text, 'github'::text, 'twitch'::text,
    'snapchat'::text, 'pinterest'::text, 'spotify'::text, 'soundcloud'::text,
    'discord'::text, 'telegram'::text, 'whatsapp'::text, 'email'::text,
    'website'::text, 'pix'::text
  ]));
