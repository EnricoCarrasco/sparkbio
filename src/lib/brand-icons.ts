import type { SocialPlatform } from "@/types";

/**
 * Maps each social platform to its Simple Icons SVG file in /public/icons/social/.
 * These are the official brand logos — use inside brand-colored containers.
 */
const BRAND_ICON_MAP: Record<SocialPlatform, string> = {
  whatsapp: "/icons/social/whatsapp.svg",
  instagram: "/icons/social/instagram.svg",
  tiktok: "/icons/social/tiktok.svg",
  youtube: "/icons/social/youtube.svg",
  x: "/icons/social/x.svg",
  facebook: "/icons/social/facebook.svg",
  linkedin: "/icons/social/linkedin.svg",
  github: "/icons/social/github.svg",
  twitch: "/icons/social/twitch.svg",
  snapchat: "/icons/social/snapchat.svg",
  pinterest: "/icons/social/pinterest.svg",
  spotify: "/icons/social/spotify.svg",
  soundcloud: "/icons/social/soundcloud.svg",
  discord: "/icons/social/discord.svg",
  telegram: "/icons/social/telegram.svg",
  email: "/icons/social/gmail.svg",
  website: "/icons/social/googlechrome.svg",
  pix: "/icons/social/pix.png",
};

export function getBrandIconPath(platform: SocialPlatform): string {
  return BRAND_ICON_MAP[platform] || "/icons/social/googlechrome.svg";
}
