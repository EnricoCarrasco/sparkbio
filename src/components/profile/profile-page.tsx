"use client";

import { useEffect, useMemo } from "react";
import type { PublicProfile } from "@/types";
import { ProfileHeader } from "./profile-header";
import { ProfileLink } from "./profile-link";
import { SocialIconsBar } from "./social-icons-bar";
import { SocialButton } from "./social-button";
import { SocialGrid } from "./social-grid";
import { AnalyticsTracker } from "./analytics-tracker";
import { AddToHomeButton } from "./add-to-home-button";
import { useTranslations } from "next-intl";

interface ProfilePageProps {
  data: PublicProfile;
  /** Skip analytics tracking — used by internal /preview/* marketing routes. */
  preview?: boolean;
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
      // Static base — the animated blurred layer renders as a separate div
      return {
        backgroundColor: bg_gradient_from,
      };
    }

    return { background: `linear-gradient(${direction}, ${bg_gradient_from}, ${bg_gradient_to})` };
  }

  return { backgroundColor: bg_color };
}

function buildGoogleFontsUrl(theme: PublicProfile["theme"]): string | null {
  const families = new Set<string>();
  if (theme.font_family) families.add(theme.font_family);
  if (theme.title_font) families.add(theme.title_font);
  if (families.size === 0) return null;
  const params = [...families]
    .map((f) => `family=${f.replace(/ /g, "+")}:wght@300;400;500;600;700`)
    .join("&");
  return `https://fonts.googleapis.com/css2?${params}&display=swap`;
}

export function ProfilePage({ data, preview = false }: ProfilePageProps) {
  const { profile, links, theme, social_icons } = data;
  const t = useTranslations("publicProfile");

  const backgroundStyle = useMemo(() => buildBackgroundStyle(theme), [theme]);
  const fontsUrl = useMemo(() => buildGoogleFontsUrl(theme), [theme]);

  useEffect(() => {
    if (!fontsUrl) return;
    const existing = document.querySelector(`link[href="${fontsUrl}"]`);
    if (existing) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = fontsUrl;
    document.head.appendChild(link);
  }, [fontsUrl]);

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

  // Split social icons by display mode
  const activeSocialIcons = (social_icons ?? []).filter((s) => s.is_active);
  const bubbleIcons = activeSocialIcons.filter((s) => s.display_mode === "icon");
  const gridIcons = activeSocialIcons.filter((s) => s.display_mode === "grid");
  const buttonIcons = activeSocialIcons.filter((s) => s.display_mode === "button");

  // hide_footer is stripped server-side for non-Pro visitors (see
  // lib/pro-fields.ts). The owner preview route passes it through. Either
  // way, reading theme.hide_footer directly here is correct.
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

      {/* Animated rotating gradient background layer */}
      {theme.wallpaper_animate && theme.bg_gradient_from && theme.bg_gradient_to && (
        <>
          <div
            className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
            aria-hidden="true"
          >
            <div
              style={{
                position: "absolute",
                inset: "-20%",
                background: `conic-gradient(from var(--gradient-angle, 0deg), ${theme.bg_gradient_from} 0%, ${theme.bg_gradient_to} 25%, ${theme.bg_gradient_from} 50%, ${theme.bg_gradient_to} 75%, ${theme.bg_gradient_from} 100%)`,
                filter: "blur(80px)",
                animation: "gradientRotate 12s linear infinite",
              }}
            />
          </div>
          <style>{`
            @property --gradient-angle {
              syntax: "<angle>";
              initial-value: 0deg;
              inherits: false;
            }
            @keyframes gradientRotate {
              from { --gradient-angle: 0deg; }
              to { --gradient-angle: 360deg; }
            }
          `}</style>
        </>
      )}

      {/* Non-rendering analytics tracker */}
      {!preview && <AnalyticsTracker profileId={profile.id} username={profile.username} />}

      {/* Content column — content centers vertically when sparse, footer stays at bottom */}
      <main className="w-full max-w-[480px] mx-auto flex flex-col items-center px-4 relative z-10 flex-1">
        {/* Add to Home Screen button (mobile only) */}
        <AddToHomeButton bgColor={theme.bg_color} />

        {/* Content wrapper — centers vertically when space is available */}
        <div className="flex-1 w-full flex flex-col items-center justify-center gap-6 py-12 md:py-16">
          {/* Profile header */}
          <ProfileHeader profile={profile} textColor={theme.text_color} theme={theme} />

          {/* Social icons row (icon-mode only) */}
          {bubbleIcons.length > 0 && (
            <SocialIconsBar socialIcons={bubbleIcons} textColor={theme.text_color} />
          )}

          {/* Grid-mode social icons — large brand circles */}
          {gridIcons.length > 0 && (
            <SocialGrid icons={gridIcons} />
          )}

          {/* Link buttons + button-mode social icons */}
          {(activeLinks.length > 0 || buttonIcons.length > 0) && (
            <div className={`w-full flex flex-col ${
              theme.link_gap === "compact" ? "gap-2" :
              theme.link_gap === "relaxed" ? "gap-5" :
              "gap-3"
            }`}>
              {/* Button-mode social icons first */}
              {buttonIcons
                .sort((a, b) => a.position - b.position)
                .map((si, index) => (
                  <SocialButton
                    key={si.id}
                    icon={si}
                    profileId={profile.id}
                    theme={theme}
                    index={index}
                    username={profile.username}
                    referralCode={profile.referral_code}
                  />
                ))}
              {/* Regular links */}
              {activeLinks.map((link, index) => (
                <ProfileLink
                  key={link.id}
                  link={link}
                  profileId={profile.id}
                  theme={theme}
                  index={buttonIcons.length + index}
                  username={profile.username}
                  referralCode={profile.referral_code}
                />
              ))}
            </div>
          )}
        </div>

        {/* Viopage branding CTA — pinned at bottom, includes referral code */}
        {showFooter && (
          <a
            href={`${process.env.NEXT_PUBLIC_SITE_URL ?? "https://viopage.com"}/?ref=${profile.referral_code ?? profile.username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mb-4 inline-flex items-center justify-center rounded-full bg-[#FF6B35] px-5 py-2.5 text-white shadow-md hover:shadow-lg hover:brightness-110 active:scale-[0.98] transition-all max-w-full whitespace-nowrap"
            onClick={() => {
              const code = profile.referral_code ?? profile.username;
              navigator.sendBeacon(
                "/api/referral/click",
                new Blob([JSON.stringify({ referral_code: code })], { type: "application/json" })
              );
            }}
          >
            <span className="text-[13px] sm:text-sm font-semibold truncate">
              {t("joinCta", { username: profile.username })}
            </span>
          </a>
        )}
      </main>
    </div>
  );
}
