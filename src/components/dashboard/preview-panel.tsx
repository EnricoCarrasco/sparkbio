"use client";

import React from "react";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useLinkStore } from "@/lib/stores/link-store";
import { useThemeStore } from "@/lib/stores/theme-store";
import { useSocialStore } from "@/lib/stores/social-store";
import { getIconForPlatform } from "@/lib/social-icon-map";
import type { ButtonStyle } from "@/types";

function buttonRadius(style: ButtonStyle): string {
  switch (style) {
    case "pill":
      return "9999px";
    case "rounded":
      return "12px";
    case "sharp":
      return "0";
    case "outline":
      return "12px";
    case "shadow":
      return "12px";
    default:
      return "12px";
  }
}

function buttonExtraStyle(
  style: ButtonStyle,
  buttonColor: string
): React.CSSProperties {
  if (style === "outline") {
    return {
      backgroundColor: "transparent",
      border: `2px solid ${buttonColor}`,
    };
  }
  if (style === "shadow") {
    return {
      boxShadow: `rgba(0,0,0,0.2) 0px 4px 8px`,
    };
  }
  return {};
}

export function PreviewPanel() {
  const profile = useProfileStore((s) => s.profile);
  const links = useLinkStore((s) => s.links);
  const theme = useThemeStore((s) => s.theme);
  const socialIcons = useSocialStore((s) => s.socialIcons);

  const bgColor = theme?.bg_color ?? "#FAFAFA";
  const textColor = theme?.text_color ?? "#1E1E2E";
  const buttonColor = theme?.button_color ?? "#FF6B35";
  const buttonTextColor = theme?.button_text_color ?? "#FFFFFF";
  const buttonStyle: ButtonStyle = theme?.button_style ?? "pill";
  const fontFamily = theme?.font_family ?? "Inter";

  const activeLinks = links.filter((l) => l.is_active);
  const activeSocialIcons = socialIcons
    .filter((s) => s.is_active)
    .sort((a, b) => a.position - b.position);

  const pageBackground: React.CSSProperties =
    theme?.bg_gradient_from && theme?.bg_gradient_to
      ? {
          background: `linear-gradient(${
            theme.bg_gradient_direction ?? "to bottom"
          }, ${theme.bg_gradient_from}, ${theme.bg_gradient_to})`,
        }
      : { backgroundColor: bgColor };

  const initials = (profile?.display_name || profile?.username || "?")
    .slice(0, 2)
    .toUpperCase();

  // Google Fonts link for the preview
  const fontUrl = fontFamily !== "Inter"
    ? `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@400;600;700&display=swap`
    : null;

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="px-4 py-3 border-b border-border shrink-0">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Live Preview
        </p>
      </div>

      {/* Load custom font if not Inter */}
      {fontUrl && (
        // eslint-disable-next-line @next/next/no-css-tags
        <link rel="stylesheet" href={fontUrl} />
      )}

      {/* Phone frame wrapper */}
      <div className="flex-1 flex items-start justify-center py-6 px-4 overflow-y-auto">
        <div className="relative w-[220px] shrink-0">
          {/* Phone bezel */}
          <div className="rounded-[2.5rem] border-[6px] border-[#1E1E2E] shadow-xl overflow-hidden">
            {/* Notch */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-5 bg-[#1E1E2E] rounded-b-2xl z-10" />

            {/* Screen */}
            <div
              className="overflow-y-auto"
              style={{
                ...pageBackground,
                fontFamily: `'${fontFamily}', sans-serif`,
                minHeight: "420px",
                maxHeight: "420px",
              }}
            >
              <div className="flex flex-col items-center px-4 pb-6 pt-8">
                {/* Avatar */}
                <div className="mt-2 mb-3">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.display_name ?? profile.username}
                      className="size-14 rounded-full object-cover ring-2 ring-white/20"
                    />
                  ) : (
                    <div
                      className="size-14 rounded-full flex items-center justify-center text-sm font-semibold ring-2 ring-white/20"
                      style={{
                        backgroundColor: `${buttonColor}22`,
                        color: buttonColor,
                      }}
                    >
                      {initials}
                    </div>
                  )}
                </div>

                {/* Display name */}
                {(profile?.display_name || profile?.username) && (
                  <p
                    className="text-sm font-bold text-center leading-tight"
                    style={{ color: textColor }}
                  >
                    {profile?.display_name || profile?.username}
                  </p>
                )}

                {/* Bio */}
                {profile?.bio && (
                  <p
                    className="text-[10px] text-center mt-1 mb-1 leading-relaxed opacity-70 line-clamp-3 max-w-[180px]"
                    style={{ color: textColor }}
                  >
                    {profile.bio}
                  </p>
                )}

                {/* Social Icons */}
                {activeSocialIcons.length > 0 && (
                  <div className="flex items-center gap-2.5 mt-2 mb-1">
                    {activeSocialIcons.map((icon) => {
                      const Icon = getIconForPlatform(icon.platform);
                      return (
                        <div
                          key={icon.id}
                          className="opacity-70 hover:opacity-100 transition-opacity"
                          style={{ color: textColor }}
                        >
                          <Icon className="size-3.5" />
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Links */}
                <div className="w-full space-y-2 mt-3">
                  {activeLinks.length === 0 && (
                    <p
                      className="text-[10px] text-center opacity-50"
                      style={{ color: textColor }}
                    >
                      No active links yet
                    </p>
                  )}
                  {activeLinks.map((link) => {
                    const extraStyle = buttonExtraStyle(buttonStyle, buttonColor);
                    return (
                      <div
                        key={link.id}
                        className="w-full px-3 py-2.5 text-center cursor-default select-none transition-all"
                        style={{
                          backgroundColor:
                            buttonStyle === "outline"
                              ? "transparent"
                              : buttonColor,
                          color:
                            buttonStyle === "outline"
                              ? buttonColor
                              : buttonTextColor,
                          borderRadius: buttonRadius(buttonStyle),
                          fontSize: "10px",
                          fontWeight: 600,
                          ...extraStyle,
                        }}
                      >
                        {link.title}
                      </div>
                    );
                  })}
                </div>

                {/* Sparkbio branding */}
                <div className="mt-4 opacity-30">
                  <p className="text-[8px] font-medium" style={{ color: textColor }}>
                    sparkbio
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Home indicator bar */}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-10 h-1 rounded-full bg-[#1E1E2E]/40" />
        </div>
      </div>
    </div>
  );
}
