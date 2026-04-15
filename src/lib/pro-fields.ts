import type { Theme } from "@/types";

/** Fonts available on the free tier. Anything outside this list is Pro. */
export const FREE_FONTS = ["Inter", "Poppins", "DM Sans"];

/** Free-tier allowed values per multi-valued theme field. */
const FREE_BUTTON_STYLES_V2 = new Set(["solid"]);
const FREE_BUTTON_CORNERS = new Set(["round", "full"]);
const FREE_BUTTON_SHADOWS = new Set(["none"]);
const FREE_BUTTON_FONT_SIZES = new Set(["small", "medium"]);
const FREE_LINK_GAPS = new Set(["compact", "normal"]);
const FREE_AVATAR_BORDERS = new Set(["none", "subtle", "solid"]);

/**
 * Returns a copy of the theme with every Pro-only field replaced by its
 * free-tier fallback. Used server-side on the public profile page to hide
 * aspirational Pro settings from visitors until the creator upgrades.
 *
 * Base color fields (bg_color, text_color, etc.) are never stripped —
 * creators can already pick any color on the free tier.
 */
export function stripProFields(theme: Theme): Theme {
  return {
    ...theme,
    // Wallpaper (entire block is Pro)
    wallpaper_style: "fill",
    bg_gradient_from: null,
    bg_gradient_to: null,
    bg_gradient_direction: null,
    wallpaper_gradient_style: "custom",
    wallpaper_gradient_preset: null,
    wallpaper_animate: false,
    wallpaper_noise: false,
    // Buttons — only clamp Pro values, leave free values alone
    button_style_v2: FREE_BUTTON_STYLES_V2.has(theme.button_style_v2)
      ? theme.button_style_v2
      : "solid",
    button_corner: FREE_BUTTON_CORNERS.has(theme.button_corner)
      ? theme.button_corner
      : "round",
    button_shadow: FREE_BUTTON_SHADOWS.has(theme.button_shadow)
      ? theme.button_shadow
      : "none",
    button_font_size: FREE_BUTTON_FONT_SIZES.has(theme.button_font_size)
      ? theme.button_font_size
      : "medium",
    link_gap: FREE_LINK_GAPS.has(theme.link_gap) ? theme.link_gap : "normal",
    // Fonts — clamp page font, clear title font
    font_family: FREE_FONTS.includes(theme.font_family)
      ? theme.font_family
      : "Inter",
    title_font: null,
    // Avatar
    avatar_border: FREE_AVATAR_BORDERS.has(theme.avatar_border)
      ? theme.avatar_border
      : "solid",
    // Footer
    hide_footer: false,
  };
}

/** Categories of Pro features. Used for the "Previewing N Pro features" banner. */
export type ProCategory = "wallpaper" | "fonts" | "buttons" | "avatar" | "layout";

/**
 * Counts distinct Pro-feature categories active on a theme. Counting by
 * category (not raw field count) prevents inflated numbers when a single
 * premium preset touches multiple coupled fields at once.
 */
export function countPreviewedProCategories(theme: Theme): {
  count: number;
  categories: ProCategory[];
} {
  const categories: ProCategory[] = [];

  // Wallpaper
  if (
    (theme.wallpaper_style && theme.wallpaper_style !== "fill") ||
    theme.bg_gradient_from ||
    theme.bg_gradient_to ||
    theme.wallpaper_animate ||
    theme.wallpaper_noise
  ) {
    categories.push("wallpaper");
  }

  // Fonts
  if (!FREE_FONTS.includes(theme.font_family) || theme.title_font) {
    categories.push("fonts");
  }

  // Buttons
  if (
    !FREE_BUTTON_STYLES_V2.has(theme.button_style_v2) ||
    !FREE_BUTTON_CORNERS.has(theme.button_corner) ||
    !FREE_BUTTON_SHADOWS.has(theme.button_shadow) ||
    !FREE_BUTTON_FONT_SIZES.has(theme.button_font_size)
  ) {
    categories.push("buttons");
  }

  // Avatar
  if (!FREE_AVATAR_BORDERS.has(theme.avatar_border)) {
    categories.push("avatar");
  }

  // Layout
  if (!FREE_LINK_GAPS.has(theme.link_gap) || theme.hide_footer) {
    categories.push("layout");
  }

  return { count: categories.length, categories };
}

/** True when a subscription status indicates a past active state that has ended. */
export function hasLapsedSubscription(status?: string | null): boolean {
  if (!status) return false;
  return ["expired", "cancelled", "past_due", "paused"].includes(status);
}
