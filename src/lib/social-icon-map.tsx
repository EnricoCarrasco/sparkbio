import {
  Instagram,
  Music2,
  Youtube,
  Twitter,
  Facebook,
  Linkedin,
  Github,
  Twitch,
  Ghost,
  Palette,
  Music,
  Cloud,
  MessageCircle,
  Send,
  Phone,
  Mail,
  Globe,
  QrCode,
  type LucideIcon,
} from "lucide-react";
import { SOCIAL_PLATFORMS } from "@/lib/constants";
import type { SocialPlatform } from "@/types";

/**
 * Maps the icon string from SOCIAL_PLATFORMS to the corresponding Lucide component.
 */
export const LUCIDE_ICON_MAP: Record<string, LucideIcon> = {
  instagram: Instagram,
  "music-2": Music2,
  youtube: Youtube,
  twitter: Twitter,
  facebook: Facebook,
  linkedin: Linkedin,
  github: Github,
  twitch: Twitch,
  ghost: Ghost,
  palette: Palette,
  music: Music,
  cloud: Cloud,
  "message-circle": MessageCircle,
  send: Send,
  phone: Phone,
  mail: Mail,
  globe: Globe,
  "qr-code": QrCode,
};

/**
 * Returns the Lucide icon component for a given SocialPlatform.
 * Falls back to Globe if the platform is not found.
 */
export function getIconForPlatform(platform: SocialPlatform): LucideIcon {
  const entry = SOCIAL_PLATFORMS.find((p) => p.platform === platform);
  if (!entry) return Globe;
  return LUCIDE_ICON_MAP[entry.icon] ?? Globe;
}

/**
 * Returns the human-readable label for a given SocialPlatform.
 */
export function getPlatformLabel(platform: SocialPlatform): string {
  return SOCIAL_PLATFORMS.find((p) => p.platform === platform)?.label ?? platform;
}

/**
 * Returns the URL prefix for a given SocialPlatform.
 */
export function getPlatformUrlPrefix(platform: SocialPlatform): string {
  return SOCIAL_PLATFORMS.find((p) => p.platform === platform)?.urlPrefix ?? "";
}
