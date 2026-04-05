-- Migration: Design Customization (Tier 1 + button font size)
-- Adds avatar shape, avatar border, link gap, title font, hide bio, and button font size

ALTER TABLE public.themes
  ADD COLUMN avatar_shape text NOT NULL DEFAULT 'circle'
    CHECK (avatar_shape IN ('circle', 'rounded', 'square')),
  ADD COLUMN avatar_border text NOT NULL DEFAULT 'subtle'
    CHECK (avatar_border IN ('none', 'subtle', 'solid', 'thick', 'glow')),
  ADD COLUMN link_gap text NOT NULL DEFAULT 'normal'
    CHECK (link_gap IN ('compact', 'normal', 'relaxed')),
  ADD COLUMN title_font text DEFAULT NULL,
  ADD COLUMN hide_bio boolean NOT NULL DEFAULT false,
  ADD COLUMN button_font_size text NOT NULL DEFAULT 'medium'
    CHECK (button_font_size IN ('small', 'medium', 'large'));
