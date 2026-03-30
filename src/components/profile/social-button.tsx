"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { SOCIAL_PLATFORMS, PLATFORM_BRAND_COLORS } from "@/lib/constants";
import { getBrandIconPath } from "@/lib/brand-icons";
import type { SocialIcon, Theme } from "@/types";

function getCornerRadius(corner: string): string {
  switch (corner) {
    case "square": return "0";
    case "round": return "8px";
    case "rounder": return "16px";
    case "full": return "999px";
    default: return "8px";
  }
}

function getShadow(shadow: string): string {
  switch (shadow) {
    case "soft": return "0 2px 4px rgba(0,0,0,0.1)";
    case "strong": return "0 4px 12px rgba(0,0,0,0.2)";
    case "hard": return "4px 4px 0 rgba(0,0,0,0.8)";
    default: return "none";
  }
}

interface SocialButtonProps {
  icon: SocialIcon;
  profileId: string;
  theme: Theme;
  index: number;
}

export function SocialButton({ icon, profileId, theme, index }: SocialButtonProps) {
  const { button_color, button_text_color, button_style_v2, button_corner, button_shadow } = theme;
  const brand = PLATFORM_BRAND_COLORS[icon.platform];
  const iconPath = getBrandIconPath(icon.platform);
  const platformLabel = SOCIAL_PLATFORMS.find((p) => p.platform === icon.platform)?.label ?? icon.platform;
  const title = icon.display_title || platformLabel;

  const borderRadius = getCornerRadius(button_corner);
  const boxShadow = getShadow(button_shadow);

  const outerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: "100%",
    minHeight: "56px",
    padding: "10px 20px",
    fontSize: "15px",
    fontWeight: 600,
    letterSpacing: "0.01em",
    cursor: "pointer",
    textDecoration: "none",
    transition: "opacity 0.15s ease",
    lineHeight: 1.4,
    wordBreak: "break-word",
    borderRadius,
    boxShadow,
  };

  switch (button_style_v2) {
    case "glass":
      outerStyle.backgroundColor = `${button_color}33`;
      outerStyle.color = button_color;
      outerStyle.border = `1px solid ${button_color}66`;
      outerStyle.backdropFilter = "blur(12px)";
      break;
    case "outline":
      outerStyle.backgroundColor = "transparent";
      outerStyle.color = button_color;
      outerStyle.border = `2px solid ${button_color}`;
      break;
    case "solid":
    default:
      outerStyle.backgroundColor = button_color;
      outerStyle.color = button_text_color;
      outerStyle.border = "none";
      break;
  }

  function handleClick() {
    const payload = JSON.stringify({
      profile_id: profileId,
      link_id: icon.id,
      event_type: "link_click",
      referrer: typeof document !== "undefined" ? document.referrer || undefined : undefined,
    });

    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/analytics",
        new Blob([payload], { type: "application/json" })
      );
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        ease: "easeOut",
        delay: 0.2 + index * 0.06,
      }}
      className="w-full"
    >
      <motion.a
        href={icon.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={title}
        style={outerStyle}
        onClick={handleClick}
        whileHover={{ scale: 1.02, opacity: 0.92 }}
        whileTap={{ scale: 0.97, opacity: 0.85 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
      >
        {/* Brand icon square */}
        <div
          className="size-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: brand.bg }}
        >
          <Image
            src={iconPath}
            alt={platformLabel}
            width={16}
            height={16}
            className={brand.text === "#fff" ? "brightness-0 invert" : "brightness-0"}
          />
        </div>

        {/* Title text */}
        <span className="flex-1 text-center pr-8">{title}</span>
      </motion.a>
    </motion.div>
  );
}
