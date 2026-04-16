-- Default theme for new users: Cosmic Violet animated gradient
ALTER TABLE public.themes ALTER COLUMN bg_color SET DEFAULT '#0F0F23';
ALTER TABLE public.themes ALTER COLUMN bg_gradient_from SET DEFAULT '#4A00E0';
ALTER TABLE public.themes ALTER COLUMN bg_gradient_to SET DEFAULT '#00D2FF';
ALTER TABLE public.themes ALTER COLUMN bg_gradient_direction SET DEFAULT '135deg';
ALTER TABLE public.themes ALTER COLUMN text_color SET DEFAULT '#FFFFFF';
ALTER TABLE public.themes ALTER COLUMN button_color SET DEFAULT '#FFFFFF';
ALTER TABLE public.themes ALTER COLUMN button_text_color SET DEFAULT '#0F0F23';
ALTER TABLE public.themes ALTER COLUMN button_style SET DEFAULT 'rounded';
ALTER TABLE public.themes ALTER COLUMN button_style_v2 SET DEFAULT 'solid';
ALTER TABLE public.themes ALTER COLUMN button_corner SET DEFAULT 'round';
ALTER TABLE public.themes ALTER COLUMN button_shadow SET DEFAULT 'none';
ALTER TABLE public.themes ALTER COLUMN font_family SET DEFAULT 'Space Grotesk';
ALTER TABLE public.themes ALTER COLUMN wallpaper_style SET DEFAULT 'gradient';
ALTER TABLE public.themes ALTER COLUMN wallpaper_gradient_style SET DEFAULT 'custom';
ALTER TABLE public.themes ALTER COLUMN wallpaper_animate SET DEFAULT true;
ALTER TABLE public.themes ALTER COLUMN wallpaper_noise SET DEFAULT true;
ALTER TABLE public.themes ALTER COLUMN avatar_shape SET DEFAULT 'circle';
ALTER TABLE public.themes ALTER COLUMN avatar_border SET DEFAULT 'subtle';
