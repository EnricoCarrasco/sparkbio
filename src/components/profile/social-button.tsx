"use client";

import { useState } from "react";
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

function getShadow(shadow: string, color: string): string {
  switch (shadow) {
    case "soft": return `0 2px 8px ${color}20, 0 1px 3px ${color}15`;
    case "strong": return `0 4px 16px ${color}30, 0 2px 6px ${color}20`;
    case "hard": return `3px 3px 0 ${color}40`;
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
  const [copied, setCopied] = useState(false);
  const isPix = icon.platform === "pix";
  const isInIframe = typeof window !== "undefined" && window.self !== window.top;
  const { button_color, button_text_color, button_style_v2, button_corner, button_shadow } = theme;
  const brand = PLATFORM_BRAND_COLORS[icon.platform];
  const iconPath = getBrandIconPath(icon.platform);
  const platformLabel = SOCIAL_PLATFORMS.find((p) => p.platform === icon.platform)?.label ?? icon.platform;
  const title = icon.display_title || platformLabel;

  const borderRadius = getCornerRadius(button_corner);
  const boxShadow = getShadow(button_shadow, button_color);

  const outerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    width: "100%",
    minHeight: "56px",
    padding: "12px 20px",
    fontSize: ({ small: "13px", medium: "15px", large: "17px" })[theme.button_font_size] ?? "15px",
    fontWeight: 600,
    letterSpacing: "0.02em",
    cursor: "pointer",
    textDecoration: "none",
    transition: "all 0.2s ease",
    lineHeight: 1.4,
    wordBreak: "break-word",
    borderRadius,
    boxShadow,
  };

  switch (button_style_v2) {
    case "glass":
      outerStyle.backgroundColor = `${button_color}22`;
      outerStyle.color = button_color;
      outerStyle.border = `1px solid ${button_color}44`;
      outerStyle.backdropFilter = "blur(16px) saturate(1.5)";
      break;
    case "outline":
      outerStyle.backgroundColor = "transparent";
      outerStyle.color = button_color;
      outerStyle.border = `1.5px solid ${button_color}`;
      break;
    case "solid":
    default:
      outerStyle.backgroundColor = button_color;
      outerStyle.color = button_text_color;
      outerStyle.border = "none";
      break;
  }

  function fireAnalytics() {
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

  async function handlePixCopy() {
    fireAnalytics();
    try {
      await navigator.clipboard.writeText(icon.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for sandboxed iframes or unsupported clipboard API
      const textarea = document.createElement("textarea");
      textarea.value = icon.url;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const innerContent = (
    <>
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
      <span className="flex-1 text-center pr-8">
        {isPix && copied ? "Copied!" : title}
      </span>
    </>
  );

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
      {isPix ? (
        <motion.button
          type="button"
          aria-label={title}
          style={outerStyle}
          onClick={handlePixCopy}
          whileHover={{ scale: 1.015, y: -1 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {innerContent}
        </motion.button>
      ) : (
        <motion.a
          href={icon.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={title}
          style={outerStyle}
          onClick={isInIframe ? (e: React.MouseEvent) => { e.preventDefault(); window.open(icon.url, "_blank", "noopener,noreferrer"); } : fireAnalytics}
          whileHover={{ scale: 1.015, y: -1 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
          {innerContent}
        </motion.a>
      )}
    </motion.div>
  );
}
