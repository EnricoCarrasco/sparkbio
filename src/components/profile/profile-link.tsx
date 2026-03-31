"use client";

import { motion } from "framer-motion";
import type { Link, Theme } from "@/types";

interface ProfileLinkProps {
  link: Link;
  profileId: string;
  theme: Theme;
  index: number;
}

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

function getLinkStyles(theme: Theme): React.CSSProperties {
  const { button_color, button_text_color, button_style_v2, button_corner, button_shadow, button_font_size } = theme;

  const fontSizeMap = { small: "13px", medium: "15px", large: "17px" };

  const base: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    minHeight: "56px",
    padding: "12px 24px",
    fontSize: fontSizeMap[button_font_size] ?? "15px",
    fontWeight: 600,
    letterSpacing: "0.01em",
    cursor: "pointer",
    textDecoration: "none",
    transition: "opacity 0.15s ease",
    lineHeight: 1.4,
    textAlign: "center",
    wordBreak: "break-word",
    borderRadius: getCornerRadius(button_corner),
    boxShadow: getShadow(button_shadow),
  };

  // Use new v2 style if available, fall back to legacy
  const styleV2 = button_style_v2;

  switch (styleV2) {
    case "glass":
      return {
        ...base,
        backgroundColor: `${button_color}33`,
        color: button_color,
        border: `1px solid ${button_color}66`,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      };
    case "outline":
      return {
        ...base,
        backgroundColor: "transparent",
        color: button_color,
        border: `2px solid ${button_color}`,
      };
    case "solid":
    default:
      return {
        ...base,
        backgroundColor: button_color,
        color: button_text_color,
        border: "none",
      };
  }
}

export function ProfileLink({ link, profileId, theme, index }: ProfileLinkProps) {
  const styles = getLinkStyles(theme);
  const isPreview = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("preview");

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    // In preview mode (dashboard iframe), don't navigate — just show the click animation
    if (isPreview) {
      e.preventDefault();
      return;
    }

    const payload = JSON.stringify({
      profile_id: profileId,
      link_id: link.id,
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
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        style={styles}
        onClick={handleClick}
        whileHover={{ scale: 1.02, opacity: 0.92 }}
        whileTap={{ scale: 0.97, opacity: 0.85 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
      >
        {link.title}
      </motion.a>
    </motion.div>
  );
}
