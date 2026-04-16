import type { SocialPlatform } from "@/types";

export const RESERVED_USERNAMES = [
  "admin",
  "api",
  "app",
  "auth",
  "blog",
  "callback",
  "dashboard",
  "docs",
  "help",
  "login",
  "logout",
  "pricing",
  "privacy",
  "register",
  "reset-password",
  "forgot-password",
  "settings",
  "signup",
  "support",
  "terms",
  "about",
  "contact",
  "earn",
  "features",
  "home",
  "profile",
  "search",
  "status",
  "legal",
  "sparkbio",
  "www",
  "mail",
  "ftp",
  "static",
  "assets",
  "cdn",
  "images",
  "public",
  "en",
  "pt-br",
] as const;

export const USERNAME_REGEX = /^[a-z0-9][a-z0-9-]{1,28}[a-z0-9]$/;

export const SOCIAL_PLATFORMS: {
  platform: SocialPlatform;
  label: string;
  urlPrefix: string;
  icon: string;
}[] = [
  { platform: "instagram", label: "Instagram", urlPrefix: "https://instagram.com/", icon: "instagram" },
  { platform: "tiktok", label: "TikTok", urlPrefix: "https://tiktok.com/@", icon: "music-2" },
  { platform: "youtube", label: "YouTube", urlPrefix: "https://youtube.com/", icon: "youtube" },
  { platform: "x", label: "X (Twitter)", urlPrefix: "https://x.com/", icon: "twitter" },
  { platform: "facebook", label: "Facebook", urlPrefix: "https://facebook.com/", icon: "facebook" },
  { platform: "linkedin", label: "LinkedIn", urlPrefix: "https://linkedin.com/in/", icon: "linkedin" },
  { platform: "github", label: "GitHub", urlPrefix: "https://github.com/", icon: "github" },
  { platform: "twitch", label: "Twitch", urlPrefix: "https://twitch.tv/", icon: "twitch" },
  { platform: "snapchat", label: "Snapchat", urlPrefix: "https://snapchat.com/add/", icon: "ghost" },
  { platform: "pinterest", label: "Pinterest", urlPrefix: "https://pinterest.com/", icon: "palette" },
  { platform: "spotify", label: "Spotify", urlPrefix: "https://open.spotify.com/", icon: "music" },
  { platform: "soundcloud", label: "SoundCloud", urlPrefix: "https://soundcloud.com/", icon: "cloud" },
  { platform: "discord", label: "Discord", urlPrefix: "https://discord.gg/", icon: "message-circle" },
  { platform: "telegram", label: "Telegram", urlPrefix: "https://t.me/", icon: "send" },
  { platform: "whatsapp", label: "WhatsApp", urlPrefix: "https://wa.me/", icon: "phone" },
  { platform: "email", label: "Email", urlPrefix: "mailto:", icon: "mail" },
  { platform: "website", label: "Website", urlPrefix: "", icon: "globe" },
  { platform: "pix", label: "Pix", urlPrefix: "", icon: "qr-code" },
];

export const PLATFORM_BRAND_COLORS: Record<
  import("@/types").SocialPlatform,
  { bg: string; text: string }
> = {
  whatsapp: { bg: "#25D366", text: "#fff" },
  instagram: { bg: "linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)", text: "#fff" },
  tiktok: { bg: "#000000", text: "#fff" },
  youtube: { bg: "#FF0000", text: "#fff" },
  x: { bg: "#000000", text: "#fff" },
  facebook: { bg: "#1877F2", text: "#fff" },
  linkedin: { bg: "#0A66C2", text: "#fff" },
  github: { bg: "#333333", text: "#fff" },
  twitch: { bg: "#9146FF", text: "#fff" },
  snapchat: { bg: "#FFFC00", text: "#000" },
  pinterest: { bg: "#E60023", text: "#fff" },
  spotify: { bg: "#1DB954", text: "#fff" },
  soundcloud: { bg: "#FF5500", text: "#fff" },
  discord: { bg: "#5865F2", text: "#fff" },
  telegram: { bg: "#26A5E4", text: "#fff" },
  email: { bg: "#EA4335", text: "#fff" },
  website: { bg: "#333333", text: "#fff" },
  pix: { bg: "#4BB8A9", text: "#fff" },
};

/** Share targets for individual links on the public profile */
export const LINK_SHARE_TARGETS = [
  {
    key: "copy",
    label: "Copy link",
    icon: null,
    bg: "#6B7280",
    makeUrl: null,
  },
  {
    key: "x",
    label: "X",
    icon: "/icons/social/x.svg",
    bg: "#000000",
    makeUrl: (url: string) =>
      `https://x.com/intent/tweet?url=${encodeURIComponent(url)}`,
  },
  {
    key: "facebook",
    label: "Facebook",
    icon: "/icons/social/facebook.svg",
    bg: "#1877F2",
    makeUrl: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  },
  {
    key: "whatsapp",
    label: "WhatsApp",
    icon: "/icons/social/whatsapp.svg",
    bg: "#25D366",
    makeUrl: (url: string) =>
      `https://wa.me/?text=${encodeURIComponent(url)}`,
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    icon: "/icons/social/linkedin.svg",
    bg: "#0A66C2",
    makeUrl: (url: string) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
  },
  {
    key: "telegram",
    label: "Telegram",
    icon: "/icons/social/telegram.svg",
    bg: "#26A5E4",
    makeUrl: (url: string) =>
      `https://t.me/share/url?url=${encodeURIComponent(url)}`,
  },
] as const;

export const THEME_FONTS = [
  // Free tier
  { value: "Inter", label: "Inter" },
  { value: "Poppins", label: "Poppins" },
  { value: "DM Sans", label: "DM Sans" },
  // Pro — modern sans
  { value: "Space Grotesk", label: "Space Grotesk" },
  { value: "Manrope", label: "Manrope" },
  { value: "Plus Jakarta Sans", label: "Plus Jakarta Sans" },
  { value: "Bricolage Grotesque", label: "Bricolage Grotesque" },
  // Pro — editorial serifs
  { value: "Playfair Display", label: "Playfair Display" },
  { value: "Fraunces", label: "Fraunces" },
  { value: "Instrument Serif", label: "Instrument Serif" },
  { value: "Cormorant Garamond", label: "Cormorant Garamond" },
  { value: "Newsreader", label: "Newsreader" },
  // Pro — expressive / personality
  { value: "Caveat", label: "Caveat" },
  { value: "Space Mono", label: "Space Mono" },
  { value: "IBM Plex Mono", label: "IBM Plex Mono" },
] as const;

// ── Basic themes (Free tier) ────────────────────────────────────────────────
// Clean, solid-color themes with standard button styles. No gradients, glass,
// shadows, or advanced layout — those are reserved for premium.

export const THEME_PRESETS_BASIC = [
  {
    name: "Viopage Default",
    bg_color: "#FAFAFA",
    text_color: "#1E1E2E",
    button_color: "#FF6B35",
    button_text_color: "#FFFFFF",
    button_style: "pill" as const,
    button_style_v2: "solid" as const,
    button_corner: "full" as const,
    button_shadow: "none" as const,
    font_family: "Inter",
    avatar_shape: "circle" as const,
    avatar_border: "subtle" as const,
    link_gap: "normal" as const,
    title_font: null,
    hide_bio: false,
    button_font_size: "medium" as const,
  },
  {
    name: "Midnight",
    bg_color: "#0F0F23",
    text_color: "#E8E8E8",
    button_color: "#6366F1",
    button_text_color: "#FFFFFF",
    button_style: "rounded" as const,
    button_style_v2: "solid" as const,
    button_corner: "round" as const,
    button_shadow: "none" as const,
    font_family: "Space Grotesk",
    avatar_shape: "rounded" as const,
    avatar_border: "none" as const,
    link_gap: "normal" as const,
    title_font: null,
    hide_bio: false,
    button_font_size: "medium" as const,
  },
  {
    name: "Ocean Breeze",
    bg_color: "#E0F7FA",
    text_color: "#004D40",
    button_color: "#00897B",
    button_text_color: "#FFFFFF",
    button_style: "pill" as const,
    button_style_v2: "solid" as const,
    button_corner: "full" as const,
    button_shadow: "none" as const,
    font_family: "Poppins",
    avatar_shape: "circle" as const,
    avatar_border: "solid" as const,
    link_gap: "normal" as const,
    title_font: null,
    hide_bio: false,
    button_font_size: "medium" as const,
  },
  {
    name: "Sunset",
    bg_color: "#FFF3E0",
    text_color: "#BF360C",
    button_color: "#FF5722",
    button_text_color: "#FFFFFF",
    button_style: "rounded" as const,
    button_style_v2: "solid" as const,
    button_corner: "round" as const,
    button_shadow: "none" as const,
    font_family: "Montserrat",
    avatar_shape: "circle" as const,
    avatar_border: "subtle" as const,
    link_gap: "normal" as const,
    title_font: null,
    hide_bio: false,
    button_font_size: "medium" as const,
  },
  {
    name: "Minimal",
    bg_color: "#FFFFFF",
    text_color: "#111111",
    button_color: "#111111",
    button_text_color: "#FFFFFF",
    button_style: "sharp" as const,
    button_style_v2: "solid" as const,
    button_corner: "square" as const,
    button_shadow: "none" as const,
    font_family: "Inter",
    avatar_shape: "square" as const,
    avatar_border: "none" as const,
    link_gap: "compact" as const,
    title_font: null,
    hide_bio: false,
    button_font_size: "medium" as const,
  },
  {
    name: "Cream",
    bg_color: "#FFFDE7",
    text_color: "#3E2723",
    button_color: "#795548",
    button_text_color: "#FFFFFF",
    button_style: "rounded" as const,
    button_style_v2: "solid" as const,
    button_corner: "round" as const,
    button_shadow: "none" as const,
    font_family: "Manrope",
    avatar_shape: "circle" as const,
    avatar_border: "subtle" as const,
    link_gap: "normal" as const,
    title_font: null,
    hide_bio: false,
    button_font_size: "medium" as const,
  },
  {
    name: "Sportpoeder",
    bg_color: "#3B6FF0",
    text_color: "#FFFFFF",
    button_color: "#FFFFFF",
    button_text_color: "#1E285F",
    button_style: "rounded" as const,
    button_style_v2: "solid" as const,
    button_corner: "round" as const,
    button_shadow: "none" as const,
    font_family: "Montserrat",
    avatar_shape: "rounded" as const,
    avatar_border: "none" as const,
    link_gap: "normal" as const,
    title_font: null,
    hide_bio: false,
    button_font_size: "medium" as const,
  },
] as const;

// ── Premium themes (Pro tier) ───────────────────────────────────────────────
// Visually elevated themes using glass buttons, shadows, glow borders,
// gradients, custom title fonts, and refined palettes that feel premium.

export const THEME_PRESETS_PREMIUM = [
  {
    name: "Rose Gold",
    bg_color: "#FDF2F8",
    text_color: "#831843",
    button_color: "#EC4899",
    button_text_color: "#FFFFFF",
    button_style: "pill" as const,
    button_style_v2: "glass" as const,
    button_corner: "full" as const,
    button_shadow: "soft" as const,
    font_family: "DM Sans",
    avatar_shape: "circle" as const,
    avatar_border: "glow" as const,
    link_gap: "relaxed" as const,
    title_font: "Fraunces",
    hide_bio: false,
    button_font_size: "medium" as const,
  },
  {
    name: "Lavender Dream",
    bg_color: "#F3E5F5",
    text_color: "#4A148C",
    button_color: "#9C27B0",
    button_text_color: "#FFFFFF",
    button_style: "shadow" as const,
    button_style_v2: "solid" as const,
    button_corner: "rounder" as const,
    button_shadow: "hard" as const,
    font_family: "Nunito",
    avatar_shape: "circle" as const,
    avatar_border: "thick" as const,
    link_gap: "normal" as const,
    title_font: null,
    hide_bio: false,
    button_font_size: "medium" as const,
  },
  {
    name: "Neon Nights",
    bg_color: "#1A1A2E",
    text_color: "#EAEAEA",
    button_color: "#E94560",
    button_text_color: "#FFFFFF",
    button_style: "pill" as const,
    button_style_v2: "glass" as const,
    button_corner: "full" as const,
    button_shadow: "soft" as const,
    font_family: "Space Grotesk",
    avatar_shape: "rounded" as const,
    avatar_border: "glow" as const,
    link_gap: "normal" as const,
    title_font: null,
    hide_bio: false,
    button_font_size: "medium" as const,
  },
  {
    name: "Emerald",
    bg_color: "#F1F8E9",
    text_color: "#1B5E20",
    button_color: "#2E7D32",
    button_text_color: "#FFFFFF",
    button_style: "rounded" as const,
    button_style_v2: "solid" as const,
    button_corner: "round" as const,
    button_shadow: "soft" as const,
    font_family: "DM Sans",
    avatar_shape: "rounded" as const,
    avatar_border: "solid" as const,
    link_gap: "normal" as const,
    title_font: null,
    hide_bio: false,
    button_font_size: "medium" as const,
  },
  {
    name: "Electric Blue",
    bg_color: "#E3F2FD",
    text_color: "#0D47A1",
    button_color: "#2196F3",
    button_text_color: "#FFFFFF",
    button_style: "pill" as const,
    button_style_v2: "glass" as const,
    button_corner: "full" as const,
    button_shadow: "soft" as const,
    font_family: "Outfit",
    avatar_shape: "circle" as const,
    avatar_border: "solid" as const,
    link_gap: "normal" as const,
    title_font: null,
    hide_bio: false,
    button_font_size: "medium" as const,
  },
  {
    name: "Charcoal",
    bg_color: "#263238",
    text_color: "#CFD8DC",
    button_color: "#FF9800",
    button_text_color: "#263238",
    button_style: "rounded" as const,
    button_style_v2: "solid" as const,
    button_corner: "round" as const,
    button_shadow: "strong" as const,
    font_family: "Manrope",
    avatar_shape: "rounded" as const,
    avatar_border: "solid" as const,
    link_gap: "normal" as const,
    title_font: null,
    hide_bio: false,
    button_font_size: "medium" as const,
  },
  {
    name: "Noir Elegance",
    bg_color: "#0A0A0A",
    text_color: "#F5F5F5",
    button_color: "#D4AF37",
    button_text_color: "#0A0A0A",
    button_style: "pill" as const,
    button_style_v2: "solid" as const,
    button_corner: "full" as const,
    button_shadow: "soft" as const,
    font_family: "Playfair Display",
    avatar_shape: "circle" as const,
    avatar_border: "glow" as const,
    link_gap: "relaxed" as const,
    title_font: "Playfair Display",
    hide_bio: false,
    button_font_size: "large" as const,
  },
  {
    name: "Sakura",
    bg_color: "#FFF0F5",
    text_color: "#5D1A38",
    button_color: "#C2185B",
    button_text_color: "#FFFFFF",
    button_style: "pill" as const,
    button_style_v2: "outline" as const,
    button_corner: "full" as const,
    button_shadow: "none" as const,
    font_family: "Nunito",
    avatar_shape: "circle" as const,
    avatar_border: "subtle" as const,
    link_gap: "relaxed" as const,
    title_font: null,
    hide_bio: false,
    button_font_size: "medium" as const,
  },
  {
    name: "Arctic",
    bg_color: "#F0F4F8",
    text_color: "#1A237E",
    button_color: "#3F51B5",
    button_text_color: "#FFFFFF",
    button_style: "rounded" as const,
    button_style_v2: "glass" as const,
    button_corner: "rounder" as const,
    button_shadow: "soft" as const,
    font_family: "DM Sans",
    avatar_shape: "rounded" as const,
    avatar_border: "subtle" as const,
    link_gap: "normal" as const,
    title_font: null,
    hide_bio: false,
    button_font_size: "medium" as const,
  },
  {
    name: "Ember Glow",
    bg_color: "#1C1412",
    text_color: "#FFE0B2",
    button_color: "#FF5722",
    button_text_color: "#FFFFFF",
    button_style: "rounded" as const,
    button_style_v2: "solid" as const,
    button_corner: "round" as const,
    button_shadow: "strong" as const,
    font_family: "Montserrat",
    avatar_shape: "rounded" as const,
    avatar_border: "glow" as const,
    link_gap: "normal" as const,
    title_font: "Montserrat",
    hide_bio: false,
    button_font_size: "medium" as const,
  },
  {
    name: "Honey",
    bg_color: "#FFF8E1",
    text_color: "#4E342E",
    button_color: "#F9A825",
    button_text_color: "#4E342E",
    button_style: "rounded" as const,
    button_style_v2: "solid" as const,
    button_corner: "rounder" as const,
    button_shadow: "soft" as const,
    font_family: "Outfit",
    avatar_shape: "circle" as const,
    avatar_border: "solid" as const,
    link_gap: "relaxed" as const,
    title_font: "Fraunces",
    hide_bio: false,
    button_font_size: "medium" as const,
  },
  {
    name: "Cyberpunk",
    bg_color: "#0D0221",
    text_color: "#00FF9F",
    button_color: "#FF00FF",
    button_text_color: "#FFFFFF",
    button_style: "sharp" as const,
    button_style_v2: "solid" as const,
    button_corner: "square" as const,
    button_shadow: "hard" as const,
    font_family: "Space Grotesk",
    avatar_shape: "square" as const,
    avatar_border: "glow" as const,
    link_gap: "compact" as const,
    title_font: "Space Grotesk",
    hide_bio: false,
    button_font_size: "small" as const,
  },
  {
    name: "Blush",
    bg_color: "#FFF5F5",
    text_color: "#4A2032",
    button_color: "#E57373",
    button_text_color: "#FFFFFF",
    button_style: "pill" as const,
    button_style_v2: "glass" as const,
    button_corner: "rounder" as const,
    button_shadow: "soft" as const,
    font_family: "Poppins",
    avatar_shape: "circle" as const,
    avatar_border: "thick" as const,
    link_gap: "relaxed" as const,
    title_font: null,
    hide_bio: false,
    button_font_size: "medium" as const,
  },
  {
    name: "Monochrome",
    bg_color: "#1A1A1A",
    text_color: "#E0E0E0",
    button_color: "#FFFFFF",
    button_text_color: "#1A1A1A",
    button_style: "rounded" as const,
    button_style_v2: "outline" as const,
    button_corner: "round" as const,
    button_shadow: "none" as const,
    font_family: "Inter",
    avatar_shape: "square" as const,
    avatar_border: "subtle" as const,
    link_gap: "compact" as const,
    title_font: null,
    hide_bio: false,
    button_font_size: "medium" as const,
  },
] as const;

// ── Combined presets (backward compatibility) ───────────────────────────────
export const THEME_PRESETS = [...THEME_PRESETS_BASIC, ...THEME_PRESETS_PREMIUM] as const;

export const PREMADE_GRADIENTS = [
  { name: "Sunset", from: "#FF512F", to: "#DD2476" },
  { name: "Ocean", from: "#2E3192", to: "#1BFFFF" },
  { name: "Peach", from: "#FFDEE9", to: "#B5FFFC" },
  { name: "Lavender", from: "#C471F5", to: "#FA71CD" },
  { name: "Mint", from: "#0BAB64", to: "#3BB78F" },
  { name: "Dusk", from: "#2C3E50", to: "#FD746C" },
  { name: "Cotton Candy", from: "#E8CBC0", to: "#636FA4" },
  { name: "Aurora", from: "#00C9FF", to: "#92FE9D" },
  { name: "Ember", from: "#F7971E", to: "#FFD200" },
] as const;

export const AVATAR_MAX_SIZE = 2 * 1024 * 1024; // 2MB
export const AVATAR_ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export const HERO_MAX_SIZE = 5 * 1024 * 1024; // 5MB
export const HERO_ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const PLANS = {
  free: {
    name: "Free",
    price: 0,
  },
  pro: {
    name: "Pro",
    monthlyPrice: 9,
    yearlyPrice: 7,
    yearlyTotal: 84,
    trialDays: 7,
    br: {
      monthlyPrice: 25,
      yearlyPrice: 18,
      yearlyTotal: 219,
    },
  },
} as const;

// ── Referral system ─────────────────────────────────────────────────────────

export const REFERRAL_COMMISSION_PERCENT = 20;
export const REFERRAL_HOLD_DAYS = 30;
export const REFERRAL_MIN_PAYOUT_CENTS = 2000; // $20.00

// ── Subscription helpers ─────────────────────────────────────────────────────

export const ACTIVE_SUBSCRIPTION_STATUSES = ["on_trial", "active"] as const;

/** Statuses where the creator has signaled "stop billing me" but is still
 *  inside the paid or trial window. We keep them on Pro until that window
 *  ends — matches LemonSqueezy's native behavior and standard SaaS UX. */
const GRACE_STATUSES = new Set(["cancelled", "past_due"]);

type SubscriptionShape = {
  status?: string | null;
  current_period_end?: string | null;
  trial_ends_at?: string | null;
} | null | undefined;

/** True when the creator currently has Pro access. Accepts either a raw
 *  status string (legacy callers) or a subscription object — the latter
 *  enables grace-period handling for cancelled / past_due subscriptions
 *  whose paid or trial period hasn't ended yet. */
export function isSubscriptionActive(
  subOrStatus?: string | SubscriptionShape,
): boolean {
  if (!subOrStatus) return false;

  const sub: SubscriptionShape =
    typeof subOrStatus === "string" ? { status: subOrStatus } : subOrStatus;

  const status = sub?.status ?? null;
  if (!status) return false;

  if (
    ACTIVE_SUBSCRIPTION_STATUSES.includes(
      status as (typeof ACTIVE_SUBSCRIPTION_STATUSES)[number],
    )
  ) {
    return true;
  }

  // Grace period: cancelled or past_due + still inside the paid/trial window
  if (GRACE_STATUSES.has(status)) {
    const candidates = [sub?.trial_ends_at, sub?.current_period_end].filter(
      Boolean,
    ) as string[];
    const now = Date.now();
    return candidates.some((iso) => {
      const t = new Date(iso).getTime();
      return Number.isFinite(t) && t > now;
    });
  }

  return false;
}
