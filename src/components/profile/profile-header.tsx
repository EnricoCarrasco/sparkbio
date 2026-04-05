"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import type { Profile, Theme } from "@/types";

interface ProfileHeaderProps {
  profile: Profile;
  textColor: string;
  theme?: Theme;
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function ProfileHeader({ profile, textColor, theme }: ProfileHeaderProps) {
  const displayName = profile.display_name ?? profile.username;
  const initials = getInitials(displayName);

  const isHero = theme?.profile_layout === "hero";
  const titleSize = theme?.title_size === "large" ? "text-3xl md:text-4xl" : "text-2xl";
  const titleColor = theme?.title_color ?? textColor;

  // Avatar shape
  const avatarRadius =
    theme?.avatar_shape === "square" ? "rounded-none" :
    theme?.avatar_shape === "rounded" ? "rounded-2xl" :
    "rounded-full";

  // Avatar border
  const avatarBorderStyle = (() => {
    const border = theme?.avatar_border ?? "subtle";
    const accentColor = theme?.button_color ?? "#FFFFFF";
    switch (border) {
      case "none": return {};
      case "subtle": return { boxShadow: `0 0 0 2px rgba(255,255,255,0.2)` };
      case "solid": return { boxShadow: `0 0 0 2px ${accentColor}` };
      case "thick": return { boxShadow: `0 0 0 4px ${accentColor}` };
      case "glow": return { boxShadow: `0 0 16px 4px ${accentColor}66` };
      default: return {};
    }
  })();

  // Title font
  const titleFontFamily = theme?.title_font
    ? `'${theme.title_font}', sans-serif`
    : undefined;

  // Hero layout — avatar + name + bio, then large hero image below
  if (isHero) {
    const heroImageUrl = theme?.hero_image_url;
    const bannerColor = theme?.button_color ?? "#FF6B35";

    return (
      <motion.div
        className="flex flex-col items-center text-center w-full"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        {/* Avatar */}
        <motion.div
          className={`relative shrink-0 ${avatarRadius} overflow-hidden size-24 md:size-28`}
          style={avatarBorderStyle}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.05 }}
        >
          {profile.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={displayName}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 96px, 112px"
              priority
            />
          ) : (
            <div
              className="flex size-full items-center justify-center text-2xl font-semibold"
              style={{ backgroundColor: "rgba(0,0,0,0.12)", color: textColor }}
            >
              {initials}
            </div>
          )}
        </motion.div>

        {/* Name */}
        <motion.h1
          className={`${titleSize} font-bold leading-tight tracking-tight mt-3`}
          style={{ color: titleColor, fontFamily: titleFontFamily }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
        >
          {displayName}
        </motion.h1>

        {/* Bio */}
        {profile.bio && !theme?.hide_bio && (
          <motion.p
            className="text-sm leading-relaxed max-w-xs mx-auto line-clamp-3 mt-2"
            style={{ color: textColor, opacity: 0.8 }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 0.8, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.15 }}
          >
            {profile.bio}
          </motion.p>
        )}

        {/* Hero image */}
        <motion.div
          className="w-full mt-5 rounded-2xl overflow-hidden"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut", delay: 0.2 }}
        >
          {heroImageUrl ? (
            <div className="relative w-full aspect-[5/2] max-h-[150px] overflow-hidden rounded-2xl">
              <Image
                src={heroImageUrl}
                alt={`${displayName} hero`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 680px"
                unoptimized
              />
            </div>
          ) : (
            <div
              className="w-full aspect-[3/1] rounded-2xl relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${bannerColor}90, ${bannerColor}40)`,
              }}
            >
              <div className="absolute inset-0 opacity-10" style={{
                backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 30%, white 1px, transparent 1px)",
                backgroundSize: "40px 40px, 60px 60px",
              }} />
            </div>
          )}
        </motion.div>
      </motion.div>
    );
  }

  // Classic layout — centered avatar + name + bio
  return (
    <motion.div
      className="flex flex-col items-center gap-4 text-center"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      {/* Avatar */}
      <motion.div
        className={`relative shrink-0 ${avatarRadius} overflow-hidden size-24 md:size-[120px]`}
        style={avatarBorderStyle}
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.05 }}
      >
        {profile.avatar_url ? (
          <Image
            src={profile.avatar_url}
            alt={displayName}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 96px, 120px"
            priority
          />
        ) : (
          <div
            className="flex size-full items-center justify-center text-2xl font-semibold"
            style={{
              backgroundColor: "rgba(0,0,0,0.12)",
              color: textColor,
            }}
          >
            {initials}
          </div>
        )}
      </motion.div>

      {/* Display name */}
      <motion.h1
        className={`${titleSize} font-bold leading-tight tracking-tight`}
        style={{ color: titleColor, fontFamily: titleFontFamily }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
      >
        {displayName}
      </motion.h1>

      {/* Bio */}
      {profile.bio && !theme?.hide_bio && (
        <motion.p
          className="text-sm leading-relaxed max-w-xs line-clamp-3"
          style={{ color: textColor, opacity: 0.8 }}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 0.8, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut", delay: 0.15 }}
        >
          {profile.bio}
        </motion.p>
      )}
    </motion.div>
  );
}
