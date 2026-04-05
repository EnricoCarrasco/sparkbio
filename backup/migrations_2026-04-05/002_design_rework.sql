-- Phase 1: Design Rework Migration
-- Adds new columns to themes table for decomposed button styles,
-- profile header options, wallpaper effects, and footer toggle.

-- Profile header
ALTER TABLE themes ADD COLUMN profile_layout TEXT NOT NULL DEFAULT 'classic' CHECK (profile_layout IN ('classic', 'hero'));
ALTER TABLE themes ADD COLUMN title_style TEXT NOT NULL DEFAULT 'text' CHECK (title_style IN ('text', 'logo'));
ALTER TABLE themes ADD COLUMN title_size TEXT NOT NULL DEFAULT 'small' CHECK (title_size IN ('small', 'large'));
ALTER TABLE themes ADD COLUMN title_font_alt BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE themes ADD COLUMN title_color TEXT;

-- Wallpaper
ALTER TABLE themes ADD COLUMN wallpaper_style TEXT NOT NULL DEFAULT 'fill' CHECK (wallpaper_style IN ('fill', 'gradient', 'blur', 'pattern'));
ALTER TABLE themes ADD COLUMN wallpaper_gradient_style TEXT NOT NULL DEFAULT 'custom' CHECK (wallpaper_gradient_style IN ('custom', 'premade'));
ALTER TABLE themes ADD COLUMN wallpaper_gradient_preset TEXT;
ALTER TABLE themes ADD COLUMN wallpaper_animate BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE themes ADD COLUMN wallpaper_noise BOOLEAN NOT NULL DEFAULT false;

-- Button decomposition (new v2 fields, old button_style kept for backward compat)
ALTER TABLE themes ADD COLUMN button_style_v2 TEXT NOT NULL DEFAULT 'solid' CHECK (button_style_v2 IN ('solid', 'glass', 'outline'));
ALTER TABLE themes ADD COLUMN button_corner TEXT NOT NULL DEFAULT 'round' CHECK (button_corner IN ('square', 'round', 'rounder', 'full'));
ALTER TABLE themes ADD COLUMN button_shadow TEXT NOT NULL DEFAULT 'none' CHECK (button_shadow IN ('none', 'soft', 'strong', 'hard'));

-- Footer
ALTER TABLE themes ADD COLUMN hide_footer BOOLEAN NOT NULL DEFAULT false;

-- Data migration: populate new button fields from old button_style
UPDATE themes SET
  button_style_v2 = CASE button_style
    WHEN 'pill' THEN 'solid'
    WHEN 'rounded' THEN 'solid'
    WHEN 'sharp' THEN 'solid'
    WHEN 'outline' THEN 'outline'
    WHEN 'shadow' THEN 'solid'
    ELSE 'solid'
  END,
  button_corner = CASE button_style
    WHEN 'pill' THEN 'full'
    WHEN 'rounded' THEN 'round'
    WHEN 'sharp' THEN 'square'
    WHEN 'outline' THEN 'round'
    WHEN 'shadow' THEN 'round'
    ELSE 'round'
  END,
  button_shadow = CASE button_style
    WHEN 'shadow' THEN 'hard'
    ELSE 'none'
  END;
