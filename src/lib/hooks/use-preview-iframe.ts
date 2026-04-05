"use client";

import { useEffect, useState } from "react";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useLinkStore } from "@/lib/stores/link-store";
import { useThemeStore } from "@/lib/stores/theme-store";
import { useSocialStore } from "@/lib/stores/social-store";

/**
 * Shared hook for live preview iframe — subscribes to all relevant stores
 * and returns a debounced iframe src that refreshes when data changes.
 */
export function usePreviewIframe() {
  const profile = useProfileStore((s) => s.profile);
  const links = useLinkStore((s) => s.links);
  const theme = useThemeStore((s) => s.theme);
  const socialIcons = useSocialStore((s) => s.socialIcons);

  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRefreshKey((k) => k + 1);
    }, 800);
    return () => clearTimeout(timer);
  }, [
    profile?.display_name,
    profile?.bio,
    profile?.avatar_url,
    links,
    theme?.bg_color,
    theme?.bg_gradient_from,
    theme?.bg_gradient_to,
    theme?.bg_gradient_direction,
    theme?.text_color,
    theme?.button_color,
    theme?.button_text_color,
    theme?.button_style,
    theme?.button_style_v2,
    theme?.button_corner,
    theme?.button_shadow,
    theme?.font_family,
    theme?.profile_layout,
    theme?.title_style,
    theme?.title_size,
    theme?.title_font_alt,
    theme?.title_color,
    theme?.wallpaper_style,
    theme?.wallpaper_gradient_style,
    theme?.wallpaper_gradient_preset,
    theme?.wallpaper_animate,
    theme?.wallpaper_noise,
    theme?.hide_footer,
    theme?.avatar_shape,
    theme?.avatar_border,
    theme?.link_gap,
    theme?.title_font,
    theme?.hide_bio,
    theme?.button_font_size,
    theme?.hero_image_url,
    socialIcons,
  ]);

  const username = profile?.username;
  const iframeSrc = username ? `/${username}?preview=1&t=${refreshKey}` : null;

  return { iframeSrc, refreshKey, username };
}
