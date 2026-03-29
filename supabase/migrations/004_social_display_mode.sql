-- Add display mode to social icons: "icon" (small bubble) or "button" (full-width branded button)
ALTER TABLE public.social_icons
  ADD COLUMN display_mode TEXT NOT NULL DEFAULT 'icon' CHECK (display_mode IN ('icon', 'button', 'grid'));

-- Optional custom title for button mode (e.g., "Agende Sua Corrida Agora")
ALTER TABLE public.social_icons
  ADD COLUMN display_title TEXT;
