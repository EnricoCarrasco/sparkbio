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

  return (
    <motion.div
      className={`flex flex-col items-center gap-4 text-center ${isHero ? "pt-4 pb-2" : ""}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
    >
      {/* Avatar */}
      <motion.div
        className={`relative shrink-0 rounded-full overflow-hidden ring-2 ring-white/20 ${
          isHero ? "size-32 md:size-[160px]" : "size-24 md:size-[120px]"
        }`}
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
            sizes={isHero ? "(max-width: 768px) 128px, 160px" : "(max-width: 768px) 96px, 120px"}
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
        style={{ color: titleColor }}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
      >
        {displayName}
      </motion.h1>

      {/* Bio */}
      {profile.bio && (
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
