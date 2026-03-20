"use client";

import { motion } from "framer-motion";
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
  type LucideIcon,
} from "lucide-react";
import { SOCIAL_PLATFORMS } from "@/lib/constants";
import type { SocialIcon, SocialPlatform } from "@/types";

interface SocialIconsBarProps {
  socialIcons: SocialIcon[];
  textColor: string;
}

// Map from the icon string in SOCIAL_PLATFORMS to the actual Lucide component
const LUCIDE_ICON_MAP: Record<string, LucideIcon> = {
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
};

function getIconForPlatform(platform: SocialPlatform): LucideIcon {
  const entry = SOCIAL_PLATFORMS.find((p) => p.platform === platform);
  if (!entry) return Globe;
  return LUCIDE_ICON_MAP[entry.icon] ?? Globe;
}

function getPlatformLabel(platform: SocialPlatform): string {
  return SOCIAL_PLATFORMS.find((p) => p.platform === platform)?.label ?? platform;
}

export function SocialIconsBar({ socialIcons, textColor }: SocialIconsBarProps) {
  const activeIcons = socialIcons
    .filter((icon) => icon.is_active)
    .sort((a, b) => a.position - b.position);

  if (activeIcons.length === 0) return null;

  return (
    <motion.div
      className="flex flex-row flex-wrap items-center justify-center gap-4"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: 0.5 }}
    >
      {activeIcons.map((icon, i) => {
        const IconComponent = getIconForPlatform(icon.platform);
        const label = getPlatformLabel(icon.platform);

        return (
          <motion.a
            key={icon.id}
            href={icon.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            title={label}
            style={{ color: textColor }}
            className="opacity-70 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 rounded"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.7, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut", delay: 0.55 + i * 0.04 }}
            whileHover={{ scale: 1.15, opacity: 1 }}
            whileTap={{ scale: 0.92 }}
          >
            <IconComponent size={24} strokeWidth={1.75} />
          </motion.a>
        );
      })}
    </motion.div>
  );
}
