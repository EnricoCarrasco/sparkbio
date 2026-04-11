-- Change default theme for new users from light/white to Midnight
ALTER TABLE public.themes ALTER COLUMN bg_color SET DEFAULT '#0F0F23';
ALTER TABLE public.themes ALTER COLUMN text_color SET DEFAULT '#E8E8E8';
ALTER TABLE public.themes ALTER COLUMN button_color SET DEFAULT '#6366F1';
ALTER TABLE public.themes ALTER COLUMN button_style SET DEFAULT 'rounded';
ALTER TABLE public.themes ALTER COLUMN font_family SET DEFAULT 'Space Grotesk';
ALTER TABLE public.themes ALTER COLUMN avatar_shape SET DEFAULT 'rounded';
ALTER TABLE public.themes ALTER COLUMN avatar_border SET DEFAULT 'none';
