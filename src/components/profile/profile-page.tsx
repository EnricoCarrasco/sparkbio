"use client";

import { useEffect, useMemo } from "react";
import type { PublicProfile } from "@/types";
import { ProfileHeader } from "./profile-header";
import { ProfileLink } from "./profile-link";
import { SocialIconsBar } from "./social-icons-bar";
import { AnalyticsTracker } from "./analytics-tracker";

interface ProfilePageProps {
  data: PublicProfile;
}

function buildBackgroundStyle(theme: PublicProfile["theme"]): React.CSSProperties {
  const {
    bg_color,
    bg_gradient_from,
    bg_gradient_to,
    bg_gradient_direction,
    wallpaper_animate,
  } = theme;

  const hasGradient = bg_gradient_from && bg_gradient_to;

  if (hasGradient) {
    const direction = bg_gradient_direction ?? "to bottom";

    if (wallpaper_animate) {
      // Repeat colors so background-position shift creates a visible cycle
      const animatedGradient = `linear-gradient(${direction}, ${bg_gradient_from}, ${bg_gradient_to}, ${bg_gradient_from})`;
      return {
        background: animatedGradient,
        backgroundSize: "100% 400%",
        animation: "gradientShift 8s ease infinite",
      };
    }

    return { background: `linear-gradient(${direction}, ${bg_gradient_from}, ${bg_gradient_to})` };
  }

  return { backgroundColor: bg_color };
}

export function ProfilePage({ data }: ProfilePageProps) {
  const { profile, links, theme, social_icons } = data;

  const backgroundStyle = useMemo(() => buildBackgroundStyle(theme), [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--profile-bg", theme.bg_color);
    root.style.setProperty("--profile-text", theme.text_color);
    root.style.setProperty("--btn-color", theme.button_color);
    root.style.setProperty("--btn-text-color", theme.button_text_color);

    if (theme.bg_gradient_from) {
      root.style.setProperty("--profile-gradient-from", theme.bg_gradient_from);
    }
    if (theme.bg_gradient_to) {
      root.style.setProperty("--profile-gradient-to", theme.bg_gradient_to);
    }
    if (theme.bg_gradient_direction) {
      root.style.setProperty("--profile-gradient-dir", theme.bg_gradient_direction);
    }

    return () => {
      root.style.removeProperty("--profile-bg");
      root.style.removeProperty("--profile-text");
      root.style.removeProperty("--btn-color");
      root.style.removeProperty("--btn-text-color");
      root.style.removeProperty("--profile-gradient-from");
      root.style.removeProperty("--profile-gradient-to");
      root.style.removeProperty("--profile-gradient-dir");
    };
  }, [theme]);

  const activeLinks = (links ?? [])
    .filter((link) => link.is_active)
    .sort((a, b) => a.position - b.position);

  const showFooter = !theme.hide_footer;

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center relative"
      style={{
        ...backgroundStyle,
        fontFamily: theme.font_family ? `'${theme.font_family}', sans-serif` : undefined,
      }}
    >
      {/* Noise overlay */}
      {theme.wallpaper_noise && (
        <div
          className="absolute inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "256px 256px",
          }}
        />
      )}

      {/* Gradient animation keyframes */}
      {theme.wallpaper_animate && (
        <style>{`
          @keyframes gradientShift {
            0% { background-position: 0% 0%; }
            50% { background-position: 0% 100%; }
            100% { background-position: 0% 0%; }
          }
        `}</style>
      )}

      {/* Non-rendering analytics tracker */}
      <AnalyticsTracker profileId={profile.id} />

      {/* Centered content column */}
      <main className="w-full max-w-[680px] mx-auto flex flex-col items-center gap-6 px-4 py-12 md:py-16 relative z-10">
        {/* Profile header */}
        <ProfileHeader profile={profile} textColor={theme.text_color} theme={theme} />

        {/* Social icons row */}
        {(social_icons ?? []).length > 0 && (
          <SocialIconsBar socialIcons={social_icons} textColor={theme.text_color} />
        )}

        {/* Link buttons */}
        {activeLinks.length > 0 && (
          <div className="w-full flex flex-col gap-3">
            {activeLinks.map((link, index) => (
              <ProfileLink
                key={link.id}
                link={link}
                profileId={profile.id}
                theme={theme}
                index={index}
              />
            ))}
          </div>
        )}

        {/* Sparkbio branding footer */}
        {showFooter && (
          <a
            href="https://sparkbio.co"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 text-xs font-medium tracking-wide opacity-40 hover:opacity-70 transition-opacity"
            style={{ color: theme.text_color }}
          >
            Made with Sparkbio
          </a>
        )}
      </main>
    </div>
  );
}
