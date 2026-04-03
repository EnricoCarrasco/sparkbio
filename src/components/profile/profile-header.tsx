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

  // Hero layout — banner with overlapping avatar
  if (isHero) {
    const bannerColor = theme?.button_color ?? "#FF6B35";
    return (
      <motion.div
        className="flex flex-col items-center text-center -mx-4 md:-mx-6"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
      >
        {/* Banner area */}
        <motion.div
          className="w-full h-28 md:h-36 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${bannerColor}90, ${bannerColor}40)`,
            borderRadius: "0 0 24px 24px",
          }}
          initial={{ opacity: 0, scaleY: 0.8 }}
          animate={{ opacity: 1, scaleY: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-10" style={{
            backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 30%, white 1px, transparent 1px)",
            backgroundSize: "40px 40px, 60px 60px",
          }} />
        </motion.div>

        {/* Overlapping avatar */}
        <motion.div
          className={`relative shrink-0 ${avatarRadius} overflow-hidden size-28 md:size-32 -mt-14 md:-mt-16`}
          style={{ ...avatarBorderStyle, boxShadow: `0 0 0 4px white${avatarBorderStyle.boxShadow ? `, ${avatarBorderStyle.boxShadow}` : ""}, 0 4px 20px rgba(0,0,0,0.1)` }}
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
              sizes="(max-width: 768px) 112px, 128px"
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

        {/* Name + bio below avatar */}
        <div className="px-4 mt-3 space-y-2 pb-2">
          <motion.h1
            className={`${titleSize} font-bold leading-tight tracking-tight`}
            style={{ color: titleColor, fontFamily: titleFontFamily }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
          >
            {displayName}
          </motion.h1>

          {profile.bio && !theme?.hide_bio && (
            <motion.p
              className="text-sm leading-relaxed max-w-xs mx-auto line-clamp-3"
              style={{ color: textColor, opacity: 0.8 }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 0.8, y: 0 }}
              transition={{ duration: 0.4, ease: "easeOut", delay: 0.15 }}
            >
              {profile.bio}
            </motion.p>
          )}
        </div>
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
