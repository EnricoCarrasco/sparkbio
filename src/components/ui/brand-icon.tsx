"use client";

import Image from "next/image";
import { PLATFORM_BRAND_COLORS } from "@/lib/constants";
import { getBrandIconPath } from "@/lib/brand-icons";
import { cn } from "@/lib/utils";
import type { SocialPlatform } from "@/types";

interface BrandIconProps {
  platform: SocialPlatform;
  /** Size in px — applies to the outer container. Default 36. */
  size?: number;
  /** Icon size in px inside the container. Default 18. */
  iconSize?: number;
  /** Border radius class. Default "rounded-lg". */
  rounded?: string;
  className?: string;
}

/**
 * Renders a platform's official brand SVG logo inside a brand-colored container.
 * The SVG is white (via CSS filter) on the brand color background.
 */
export function BrandIcon({
  platform,
  size = 36,
  iconSize = 18,
  rounded = "rounded-lg",
  className,
}: BrandIconProps) {
  const brand = PLATFORM_BRAND_COLORS[platform];
  const iconPath = getBrandIconPath(platform);

  return (
    <div
      className={cn(
        "flex items-center justify-center shrink-0",
        rounded,
        className
      )}
      style={{
        width: size,
        height: size,
        background: brand.bg,
      }}
    >
      <Image
        src={iconPath}
        alt={platform}
        width={iconSize}
        height={iconSize}
        className={cn(
          // Invert to white for most platforms, keep dark for Snapchat
          brand.text === "#fff" ? "brightness-0 invert" : "brightness-0"
        )}
      />
    </div>
  );
}
