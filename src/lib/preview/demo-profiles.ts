/**
 * Demo profiles for the internal `/preview/[theme]` marketing routes.
 * Pulls the 3 hero premium presets (Modernist / Executive / Electric)
 * directly from `THEME_PRESETS_PREMIUM` so visuals stay in sync with the
 * dashboard catalog.
 *
 * Consumed by `src/app/preview/[theme]/page.tsx`.
 */
import type {
  PublicProfile,
  Theme,
  Profile,
  Link,
  SocialIcon,
  SocialPlatform,
  SocialDisplayMode,
} from "@/types/database";
import { THEME_PRESETS_PREMIUM } from "@/lib/constants";

const NOW = "2026-04-17T00:00:00.000Z";

type PremiumPreset = (typeof THEME_PRESETS_PREMIUM)[number];

function getPreset(name: string): PremiumPreset {
  const preset = THEME_PRESETS_PREMIUM.find((p) => p.name === name);
  if (!preset) {
    throw new Error(`Theme preset "${name}" not found in THEME_PRESETS_PREMIUM`);
  }
  return preset;
}

// ── Helpers ─────────────────────────────────────────────────────────────────

function buildDemoTheme(preset: PremiumPreset, themeId: string, userId: string): Theme {
  return {
    id: themeId,
    user_id: userId,
    profile_layout: "classic",
    title_style: "text",
    title_size: "large",
    title_font_alt: false,
    title_color: null,
    wallpaper_gradient_style: "premade",
    wallpaper_gradient_preset: null,
    hide_footer: false,
    hero_image_url: null,
    pre_pro_snapshot: null,
    bg_gradient_from: null,
    bg_gradient_to: null,
    bg_gradient_direction: null,
    wallpaper_style: "fill",
    wallpaper_animate: false,
    wallpaper_noise: false,
    ...preset,
  } as Theme;
}

function demoProfile(
  args: { id: string; username: string; display_name: string; bio: string; avatar_url: string }
): Profile {
  return {
    id: args.id,
    username: args.username,
    display_name: args.display_name,
    bio: args.bio,
    avatar_url: args.avatar_url,
    business_card_settings: null,
    referral_code: args.username,
    referred_by: null,
    payout_method: null,
    payout_destination: null,
    has_chosen_username: true,
    has_completed_onboarding: true,
    is_complimentary_pro: true,
    created_at: NOW,
    updated_at: NOW,
  };
}

function demoLink(userId: string, position: number, title: string, url: string): Link {
  return {
    id: `${userId}-link-${position}`,
    user_id: userId,
    title,
    url,
    thumbnail_url: null,
    position,
    is_active: true,
    created_at: NOW,
    updated_at: NOW,
  };
}

function demoSocial(
  userId: string,
  position: number,
  platform: SocialPlatform,
  url: string,
  display_mode: SocialDisplayMode = "icon"
): SocialIcon {
  return {
    id: `${userId}-social-${platform}`,
    user_id: userId,
    platform,
    url,
    position,
    is_active: true,
    display_mode,
    display_title: null,
  };
}

// ── Demo profiles ───────────────────────────────────────────────────────────

export type DemoThemeSlug = "modernist" | "executive" | "electric";

const MODERNIST_USER_ID = "demo-juno-marsh";
const EXECUTIVE_USER_ID = "demo-studio-kael";
const ELECTRIC_USER_ID = "demo-nova";

export const DEMO_PROFILES: Record<DemoThemeSlug, PublicProfile> = {
  modernist: {
    profile: demoProfile({
      id: MODERNIST_USER_ID,
      username: "junomarsh",
      display_name: "Juno Marsh",
      bio: "Photographer · Amsterdam",
      avatar_url: "/avatars/juno-marsh.jpeg",
    }),
    theme: buildDemoTheme(getPreset("Modernist"), "demo-theme-modernist", MODERNIST_USER_ID),
    links: [
      demoLink(MODERNIST_USER_ID, 0, "Latest Work", "https://example.com/latest"),
      demoLink(MODERNIST_USER_ID, 1, "Portfolio 2026", "https://example.com/portfolio"),
      demoLink(MODERNIST_USER_ID, 2, "Book a Session", "https://example.com/book"),
      demoLink(MODERNIST_USER_ID, 3, "Instagram", "https://instagram.com/junomarsh"),
      demoLink(MODERNIST_USER_ID, 4, "Print Shop", "https://example.com/prints"),
    ],
    social_icons: [
      demoSocial(MODERNIST_USER_ID, 0, "instagram", "https://instagram.com/junomarsh"),
      demoSocial(MODERNIST_USER_ID, 1, "website", "https://example.com"),
    ],
    subscription: null,
    is_complimentary_pro: true,
  },
  executive: {
    profile: demoProfile({
      id: EXECUTIVE_USER_ID,
      username: "studiokael",
      display_name: "Studio Kael",
      bio: "Brand & product design",
      avatar_url: "/avatars/studio-kael.jpeg",
    }),
    theme: buildDemoTheme(getPreset("Executive"), "demo-theme-executive", EXECUTIVE_USER_ID),
    links: [
      demoLink(EXECUTIVE_USER_ID, 0, "Selected Work", "https://example.com/work"),
      demoLink(EXECUTIVE_USER_ID, 1, "Case Studies", "https://example.com/cases"),
      demoLink(EXECUTIVE_USER_ID, 2, "About", "https://example.com/about"),
      demoLink(EXECUTIVE_USER_ID, 3, "Read.cv", "https://read.cv/studiokael"),
      demoLink(EXECUTIVE_USER_ID, 4, "Email me", "mailto:hello@studiokael.com"),
    ],
    social_icons: [
      demoSocial(EXECUTIVE_USER_ID, 0, "x", "https://x.com/studiokael"),
      demoSocial(EXECUTIVE_USER_ID, 1, "linkedin", "https://linkedin.com/in/studiokael"),
    ],
    subscription: null,
    is_complimentary_pro: true,
  },
  electric: {
    profile: demoProfile({
      id: ELECTRIC_USER_ID,
      username: "nova",
      display_name: "NOVA",
      bio: "New single out now",
      avatar_url: "/avatars/nova.jpeg",
    }),
    theme: buildDemoTheme(getPreset("Electric"), "demo-theme-electric", ELECTRIC_USER_ID),
    links: [
      demoLink(ELECTRIC_USER_ID, 0, "New Single — Undertow", "https://example.com/undertow"),
      demoLink(ELECTRIC_USER_ID, 1, "Tour Dates 2026", "https://example.com/tour"),
      demoLink(ELECTRIC_USER_ID, 2, "Spotify", "https://open.spotify.com/artist/nova"),
      demoLink(ELECTRIC_USER_ID, 3, "Apple Music", "https://music.apple.com/artist/nova"),
      demoLink(ELECTRIC_USER_ID, 4, "Merch", "https://example.com/merch"),
    ],
    social_icons: [
      demoSocial(ELECTRIC_USER_ID, 0, "instagram", "https://instagram.com/nova"),
      demoSocial(ELECTRIC_USER_ID, 1, "tiktok", "https://tiktok.com/@nova"),
      demoSocial(ELECTRIC_USER_ID, 2, "spotify", "https://open.spotify.com/artist/nova"),
    ],
    subscription: null,
    is_complimentary_pro: true,
  },
};
