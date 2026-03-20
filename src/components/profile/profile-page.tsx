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
  } = theme;

  const hasGradient = bg_gradient_from && bg_gradient_to;

  if (hasGradient) {
    const direction = bg_gradient_direction ?? "to bottom";
    return {
      background: `linear-gradient(${direction}, ${bg_gradient_from}, ${bg_gradient_to})`,
    };
  }

  return { backgroundColor: bg_color };
}

export function ProfilePage({ data }: ProfilePageProps) {
  const { profile, links, theme, social_icons } = data;

  const backgroundStyle = useMemo(() => buildBackgroundStyle(theme), [theme]);

  // Apply CSS custom properties to :root so child components can reference them
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
      // Clean up custom properties on unmount to avoid leaking into other pages
      root.style.removeProperty("--profile-bg");
      root.style.removeProperty("--profile-text");
      root.style.removeProperty("--btn-color");
      root.style.removeProperty("--btn-text-color");
      root.style.removeProperty("--profile-gradient-from");
      root.style.removeProperty("--profile-gradient-to");
      root.style.removeProperty("--profile-gradient-dir");
    };
  }, [theme]);

  const activeLinks = links
    .filter((link) => link.is_active)
    .sort((a, b) => a.position - b.position);

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center"
      style={{
        ...backgroundStyle,
        fontFamily: theme.font_family ? `'${theme.font_family}', sans-serif` : undefined,
      }}
    >
      {/* Non-rendering analytics tracker */}
      <AnalyticsTracker profileId={profile.id} />

      {/* Centered content column */}
      <main className="w-full max-w-[680px] mx-auto flex flex-col items-center gap-6 px-4 py-12 md:py-16">
        {/* Profile header: avatar + name + bio */}
        <ProfileHeader profile={profile} textColor={theme.text_color} />

        {/* Social icons row — shown above links if present */}
        {social_icons.length > 0 && (
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
        <a
          href="https://sparkbio.co"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 text-xs font-medium tracking-wide opacity-40 hover:opacity-70 transition-opacity"
          style={{ color: theme.text_color }}
        >
          Made with Sparkbio
        </a>
      </main>
    </div>
  );
}
