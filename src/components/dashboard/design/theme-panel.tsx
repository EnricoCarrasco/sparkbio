"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Pencil, Crown } from "lucide-react";
import { useThemeStore } from "@/lib/stores/theme-store";
import { useSubscriptionStore } from "@/lib/stores/subscription-store";
import { THEME_PRESETS_BASIC, THEME_PRESETS_PREMIUM, THEME_PRESETS } from "@/lib/constants";
import { Eyebrow } from "@/components/dashboard/_dash-primitives";
import type { Theme } from "@/types";

type ThemeCatalogTab = "basic" | "premium";

function getActivePresetName(theme: Theme | null): string | null {
  if (!theme) return null;
  for (const preset of THEME_PRESETS) {
    if (
      theme.bg_color === preset.bg_color &&
      theme.text_color === preset.text_color &&
      theme.button_color === preset.button_color &&
      theme.button_text_color === preset.button_text_color &&
      theme.font_family === preset.font_family
    ) {
      return preset.name;
    }
  }
  return null;
}

function getButtonRadius(corner: string): string {
  switch (corner) {
    case "full":
      return "9999px";
    case "rounder":
      return "10px";
    case "round":
      return "6px";
    case "square":
    default:
      return "0px";
  }
}

interface PresetCardProps {
  preset: (typeof THEME_PRESETS)[number];
  isActive: boolean;
  isCustom?: boolean;
  showCrown?: boolean;
  onClick: () => void;
}

function PresetCard({ preset, isActive, isCustom, showCrown, onClick }: PresetCardProps) {
  const btnRadius = getButtonRadius(preset.button_corner);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      aria-label={`Apply ${preset.name} theme`}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        textAlign: "left",
        padding: 10,
        borderRadius: 16,
        background: "var(--dash-panel)",
        border: `1px solid ${isActive ? "var(--dash-orange)" : "var(--dash-line)"}`,
        boxShadow: isActive ? "0 0 0 3px var(--dash-orange-tint)" : "none",
        cursor: "pointer",
        transition: "all 0.15s",
      }}
    >
      {showCrown && (
        <span
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 2,
            width: 18,
            height: 18,
            borderRadius: 999,
            background: "#FBBF24",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
        >
          <Crown className="size-2.5 text-white" strokeWidth={2.5} />
        </span>
      )}
      {/* Mini preview box */}
      <div
        style={{
          borderRadius: 12,
          padding: "16px 10px 12px",
          minHeight: 120,
          background: preset.bg_color,
          border: "1px solid var(--dash-line)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Avatar dot + Aa sample */}
        {isCustom ? (
          <Pencil
            className="size-5"
            style={{ color: preset.text_color }}
            strokeWidth={1.5}
          />
        ) : (
          <div
            style={{
              fontFamily: preset.font_family,
              color: preset.text_color,
              fontSize: 22,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              lineHeight: 1,
            }}
          >
            Aa
          </div>
        )}

        {/* 2 mini button bars at the bottom */}
        <div
          style={{
            width: "100%",
            display: "flex",
            flexDirection: "column",
            gap: 5,
            marginTop: 12,
          }}
        >
          {[1, 0.6].map((opacity, i) => (
            <div
              key={i}
              style={{
                width: "100%",
                height: 10,
                background:
                  preset.button_style_v2 === "outline"
                    ? "transparent"
                    : preset.button_color,
                border:
                  preset.button_style_v2 === "outline"
                    ? `1.5px solid ${preset.button_color}`
                    : "none",
                borderRadius: btnRadius,
                opacity,
              }}
            />
          ))}
        </div>
      </div>

      {/* Name + accent dot */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 4px 2px",
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: isActive ? 700 : 600,
            color: "var(--dash-ink)",
            letterSpacing: "-0.005em",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            maxWidth: "80%",
          }}
        >
          {preset.name}
        </span>
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: 999,
            background: preset.button_color,
            border: "1px solid rgba(0,0,0,0.08)",
            flexShrink: 0,
          }}
        />
      </div>
    </button>
  );
}

export function ThemePanel() {
  const t = useTranslations("dashboard.design");
  const theme = useThemeStore((s) => s.theme);
  const updateTheme = useThemeStore((s) => s.updateTheme);
  const isPro = useSubscriptionStore((s) => s.isPro);
  const [catalogTab, setCatalogTab] = useState<ThemeCatalogTab>("basic");

  if (!theme) return null;

  const activePresetName = getActivePresetName(theme);

  function handlePresetApply(preset: (typeof THEME_PRESETS)[number]) {
    const p = preset as (typeof THEME_PRESETS)[number] & Partial<Theme>;

    updateTheme({
      bg_color: preset.bg_color,
      text_color: preset.text_color,
      button_color: preset.button_color,
      button_text_color: preset.button_text_color,
      button_style: preset.button_style,
      button_style_v2: preset.button_style_v2,
      button_corner: preset.button_corner,
      button_shadow: preset.button_shadow,
      font_family: preset.font_family,
      avatar_shape: preset.avatar_shape,
      avatar_border: preset.avatar_border,
      link_gap: preset.link_gap,
      title_font: preset.title_font,
      hide_bio: preset.hide_bio,
      button_font_size: preset.button_font_size ?? "medium",
      title_color: p.title_color ?? null,
      title_size: p.title_size ?? "small",
      wallpaper_style: p.wallpaper_style ?? "fill",
      wallpaper_animate: p.wallpaper_animate ?? false,
      wallpaper_noise: p.wallpaper_noise ?? false,
      bg_gradient_from: p.bg_gradient_from ?? null,
      bg_gradient_to: p.bg_gradient_to ?? null,
      bg_gradient_direction: p.bg_gradient_direction ?? null,
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Basic / Premium chip toggle */}
      <div
        className="chip-row"
        style={{ display: "flex", gap: 8, flexWrap: "wrap" }}
      >
        {(["basic", "premium"] as ThemeCatalogTab[]).map((tab) => {
          const isActive = catalogTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setCatalogTab(tab)}
              className={`dash-chip${isActive ? " active" : ""}`}
              style={{ textTransform: "capitalize" }}
            >
              <span>{tab === "basic" ? t("basicThemes") : t("premiumThemes")}</span>
              {tab === "premium" && !isPro && (
                <Crown
                  className="size-3"
                  style={{ color: isActive ? "#FBBF24" : "#F59E0B" }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Theme preset grid */}
      <div className="dash-panel">
        <Eyebrow>
          {catalogTab === "basic" ? t("basicThemes") : t("premiumThemes")}
        </Eyebrow>
        <div
          style={{
            marginTop: 14,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: 14,
          }}
        >
          {catalogTab === "basic" ? (
            <>
              {/* "Custom" card — first slot */}
              <button
                type="button"
                aria-label="Custom theme"
                style={{
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  textAlign: "left",
                  padding: 10,
                  borderRadius: 16,
                  background: "var(--dash-panel)",
                  border: `1px solid ${!activePresetName ? "var(--dash-orange)" : "var(--dash-line)"}`,
                  boxShadow: !activePresetName
                    ? "0 0 0 3px var(--dash-orange-tint)"
                    : "none",
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <div
                  style={{
                    borderRadius: 12,
                    padding: "16px 10px 12px",
                    minHeight: 120,
                    background: theme.bg_color,
                    border: "1px solid var(--dash-line)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Pencil
                    className="size-5"
                    style={{ color: theme.text_color }}
                    strokeWidth={1.5}
                  />
                  <div
                    style={{
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                      gap: 5,
                      marginTop: 12,
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        height: 10,
                        background: theme.button_color,
                        borderRadius: getButtonRadius(theme.button_corner),
                      }}
                    />
                    <div
                      style={{
                        width: "100%",
                        height: 10,
                        background: theme.button_color,
                        borderRadius: getButtonRadius(theme.button_corner),
                        opacity: 0.6,
                      }}
                    />
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 4px 2px",
                  }}
                >
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: !activePresetName ? 700 : 600,
                      color: "var(--dash-ink)",
                    }}
                  >
                    {t("customTheme")}
                  </span>
                  <span
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: 999,
                      background: theme.button_color,
                      border: "1px solid rgba(0,0,0,0.08)",
                    }}
                  />
                </div>
              </button>

              {THEME_PRESETS_BASIC.map((preset) => (
                <PresetCard
                  key={preset.name}
                  preset={preset}
                  isActive={activePresetName === preset.name}
                  onClick={() => handlePresetApply(preset)}
                />
              ))}
            </>
          ) : (
            THEME_PRESETS_PREMIUM.map((preset) => (
              <PresetCard
                key={preset.name}
                preset={preset}
                isActive={activePresetName === preset.name}
                showCrown={!isPro}
                onClick={() => handlePresetApply(preset)}
              />
            ))
          )}
        </div>

        {catalogTab === "basic" && (
          <p
            style={{
              fontSize: 12,
              color: "var(--dash-muted)",
              marginTop: 14,
              lineHeight: 1.5,
            }}
          >
            {t("themesDesc")}
          </p>
        )}
        {catalogTab === "premium" && !isPro && (
          <p
            style={{
              fontSize: 12,
              color: "var(--dash-muted)",
              marginTop: 14,
              lineHeight: 1.5,
            }}
          >
            {t("premiumThemesDesc")}
          </p>
        )}
      </div>
    </div>
  );
}
