"use client";

import { motion } from "framer-motion";
import type { Link, Theme } from "@/types";

interface ProfileLinkProps {
  link: Link;
  profileId: string;
  theme: Theme;
  index: number;
}

function getLinkStyles(theme: Theme): React.CSSProperties {
  const { button_color, button_text_color, button_style } = theme;

  const base: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    minHeight: "56px",
    padding: "12px 24px",
    fontSize: "15px",
    fontWeight: 600,
    letterSpacing: "0.01em",
    cursor: "pointer",
    border: "none",
    textDecoration: "none",
    transition: "opacity 0.15s ease",
    lineHeight: 1.4,
    textAlign: "center",
    wordBreak: "break-word",
  };

  switch (button_style) {
    case "pill":
      return {
        ...base,
        borderRadius: "999px",
        backgroundColor: button_color,
        color: button_text_color,
      };
    case "sharp":
      return {
        ...base,
        borderRadius: "0",
        backgroundColor: button_color,
        color: button_text_color,
      };
    case "outline":
      return {
        ...base,
        borderRadius: "12px",
        backgroundColor: "transparent",
        color: button_color,
        border: `2px solid ${button_color}`,
      };
    case "shadow":
      return {
        ...base,
        borderRadius: "12px",
        backgroundColor: button_color,
        color: button_text_color,
        boxShadow: "rgba(0, 0, 0, 0.2) 0px 4px 8px",
      };
    case "rounded":
    default:
      return {
        ...base,
        borderRadius: "12px",
        backgroundColor: button_color,
        color: button_text_color,
      };
  }
}

export function ProfileLink({ link, profileId, theme, index }: ProfileLinkProps) {
  const styles = getLinkStyles(theme);

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    // Fire analytics beacon non-blocking BEFORE navigating
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

    // If the browser blocks window.open from the anchor's default behaviour,
    // ensure we open the tab. The href already handles it, but we add a guard.
    // We do NOT call e.preventDefault() so the browser's native target=_blank works.
    void e; // suppress lint unused-variable
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
