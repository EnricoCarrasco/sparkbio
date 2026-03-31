"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { PLATFORM_BRAND_COLORS } from "@/lib/constants";
import { getBrandIconPath } from "@/lib/brand-icons";
import { getPlatformLabel } from "@/lib/social-icon-map";
import type { SocialIcon } from "@/types";

interface SocialGridProps {
  icons: SocialIcon[];
}

/**
 * Renders social icons in a responsive grid of large brand-colored circles.
 * Icons scale to fill available width:
 *  - 1 icon: single large circle centered
 *  - 2 icons: 2 columns
 *  - 3+ icons: 3 columns
 * Each circle scales proportionally to the container width.
 */
export function SocialGrid({ icons }: SocialGridProps) {
  if (icons.length === 0) return null;

  const sorted = [...icons].sort((a, b) => a.position - b.position);

  // Determine columns based on count
  const cols = sorted.length === 1 ? 1 : sorted.length === 2 ? 2 : 3;

  return (
    <motion.div
      className="w-full"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: 0.4 }}
    >
      <div
        className="grid gap-3 w-full mx-auto"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          maxWidth: cols === 1 ? "120px" : cols === 2 ? "260px" : "100%",
        }}
      >
        {sorted.map((icon, i) => (
          <GridIcon key={icon.id} icon={icon} index={i} totalCount={sorted.length} />
        ))}
      </div>
    </motion.div>
  );
}

function GridIcon({
  icon,
  index,
  totalCount,
}: {
  icon: SocialIcon;
  index: number;
  totalCount: number;
}) {
  const brand = PLATFORM_BRAND_COLORS[icon.platform];
  const iconPath = getBrandIconPath(icon.platform);
  const label = getPlatformLabel(icon.platform);
  const isPreview = typeof window !== "undefined" && new URLSearchParams(window.location.search).has("preview");

  // Icon size scales: fewer icons = bigger icons
  // With 1: icon is ~100px. With 2: ~90px. With 3+: auto-fill the column
  const iconSizeFactor = totalCount <= 2 ? 0.55 : 0.45;

  return (
    <motion.a
      href={isPreview ? undefined : icon.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={isPreview ? (e: React.MouseEvent) => e.preventDefault() : undefined}
      aria-label={label}
      title={label}
      className="aspect-square rounded-full flex items-center justify-center w-full transition-transform"
      style={{ background: brand.bg }}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.3,
        ease: "easeOut",
        delay: 0.45 + index * 0.05,
      }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
    >
      <Image
        src={iconPath}
        alt={label}
        width={64}
        height={64}
        className={`${brand.text === "#fff" ? "brightness-0 invert" : "brightness-0"}`}
        style={{
          width: `${iconSizeFactor * 100}%`,
          height: `${iconSizeFactor * 100}%`,
          objectFit: "contain",
        }}
      />
    </motion.a>
  );
}
