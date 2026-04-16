"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { MoreHorizontal } from "lucide-react";
import type { Link, Theme } from "@/types";
import { ShareLinkSheet } from "./share-link-sheet";

interface ProfileLinkProps {
  link: Link;
  profileId: string;
  theme: Theme;
  index: number;
  username: string;
  referralCode: string | null;
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

function getShadow(shadow: string, color: string): string {
  switch (shadow) {
    case "soft": return `0 2px 8px ${color}20, 0 1px 3px ${color}15`;
    case "strong": return `0 4px 16px ${color}30, 0 2px 6px ${color}20`;
    case "hard": return `3px 3px 0 ${color}40`;
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
    padding: "14px 24px",
    fontSize: fontSizeMap[button_font_size] ?? "15px",
    fontWeight: 600,
    letterSpacing: "0.02em",
    cursor: "pointer",
    textDecoration: "none",
    transition: "all 0.2s ease",
    lineHeight: 1.4,
    textAlign: "center",
    wordBreak: "break-word",
    borderRadius: getCornerRadius(button_corner),
    boxShadow: getShadow(button_shadow, button_color),
  };

  // Use new v2 style if available, fall back to legacy
  const styleV2 = button_style_v2;

  switch (styleV2) {
    case "glass":
      return {
        ...base,
        backgroundColor: `${button_color}22`,
        color: button_color,
        border: `1px solid ${button_color}44`,
        backdropFilter: "blur(16px) saturate(1.5)",
        WebkitBackdropFilter: "blur(16px) saturate(1.5)",
      };
    case "outline":
      return {
        ...base,
        backgroundColor: "transparent",
        color: button_color,
        border: `1.5px solid ${button_color}`,
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

export function ProfileLink({ link, profileId, theme, index, username, referralCode }: ProfileLinkProps) {
  const [shareOpen, setShareOpen] = useState(false);
  const styles = getLinkStyles(theme);
  const isInIframe = typeof window !== "undefined" && window.self !== window.top;

  const ellipsisColor = theme.button_style_v2 === "solid"
    ? theme.button_text_color
    : theme.button_color;

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    // In dashboard preview iframe, open in parent window instead of inside the iframe
    if (isInIframe) {
      e.preventDefault();
      window.open(link.url, "_blank", "noopener,noreferrer");
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
      className="w-full relative"
    >
      <motion.a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ ...styles, paddingRight: "48px" }}
        onClick={handleClick}
        whileHover={{ scale: 1.015, y: -1 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {link.title}
      </motion.a>

      {/* Share ellipsis button */}
      <button
        type="button"
        aria-label="Share link"
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full transition-opacity hover:opacity-100"
        style={{ color: ellipsisColor, opacity: 0.5 }}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShareOpen(true);
        }}
      >
        <MoreHorizontal className="w-5 h-5" />
      </button>

      <ShareLinkSheet
        open={shareOpen}
        onOpenChange={setShareOpen}
        linkTitle={link.title}
        linkUrl={link.url}
        thumbnailUrl={link.thumbnail_url}
        username={username}
        referralCode={referralCode}
      />
    </motion.div>
  );
}
