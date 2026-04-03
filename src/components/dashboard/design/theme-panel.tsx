"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Pencil, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/lib/stores/theme-store";
import { useSubscriptionStore } from "@/lib/stores/subscription-store";
import { THEME_PRESETS_BASIC, THEME_PRESETS_PREMIUM, THEME_PRESETS } from "@/lib/constants";
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
  isPro?: boolean;
  onClick: () => void;
}

function PresetCard({ preset, isActive, isCustom, isPro, onClick }: PresetCardProps) {
  const btnRadius = getButtonRadius(preset.button_corner);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      aria-label={`Apply ${preset.name} theme`}
      className={cn(
        "relative flex flex-col items-stretch rounded-xl overflow-hidden text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-2",
        isActive
          ? "ring-2 ring-foreground shadow-sm"
          : "ring-1 ring-border hover:ring-foreground/30 hover:shadow-sm"
      )}
    >
      {/* Card body — mini profile preview */}
      <div
        className="w-full flex-1 flex flex-col items-center justify-between p-2.5 pt-3"
        style={{
          backgroundColor: preset.bg_color,
          minHeight: "100px",
        }}
      >
        {/* Aa typography sample or pencil icon for custom */}
        {isCustom ? (
          <div className="flex-1 flex items-center justify-center">
            <Pencil
              className="size-5"
              style={{ color: preset.text_color }}
              strokeWidth={1.5}
            />
          </div>
        ) : (
          <div
            className="flex-1 flex items-center justify-center text-xl font-bold leading-none"
            style={{
              color: preset.text_color,
              fontFamily: preset.font_family,
            }}
          >
            Aa
          </div>
        )}

        {/* Mini button bar at the bottom */}
        <div className="w-full space-y-1 mt-2">
          <div
            className="w-full h-3"
            style={{
              backgroundColor:
                preset.button_style_v2 === "outline"
                  ? "transparent"
                  : preset.button_color,
              borderRadius: btnRadius,
              border:
                preset.button_style_v2 === "outline"
                  ? `1.5px solid ${preset.button_color}`
                  : "none",
            }}
          />
          <div
            className="w-full h-3"
            style={{
              backgroundColor:
                preset.button_style_v2 === "outline"
                  ? "transparent"
                  : preset.button_color,
              borderRadius: btnRadius,
              border:
                preset.button_style_v2 === "outline"
                  ? `1.5px solid ${preset.button_color}`
                  : "none",
              opacity: 0.6,
            }}
          />
        </div>
      </div>

      {/* Card label */}
      <div className="px-2 py-1.5 bg-white border-t border-border/60 text-center">
        <p
          className={cn(
            "text-[10px] font-medium text-foreground truncate leading-tight",
            isActive && "font-semibold"
          )}
        >
          {preset.name}
        </p>
      </div>

      {/* Pro badge */}
      {isPro && (
        <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center shadow-sm">
          <Crown className="size-2.5 text-white" strokeWidth={2.5} />
        </span>
      )}
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
      bg_gradient_from: null,
      bg_gradient_to: null,
      bg_gradient_direction: null,
    });
  }

  return (
    <div className="space-y-4">
      {/* Basic / Premium tab bar */}
      <div className="flex gap-5 border-b border-border">
        {(["basic", "premium"] as ThemeCatalogTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setCatalogTab(tab)}
            className={cn(
              "pb-2.5 text-sm font-medium transition-colors capitalize focus-visible:outline-none flex items-center gap-1.5",
              catalogTab === tab
                ? "text-foreground border-b-2 border-foreground"
                : "text-muted-foreground hover:text-foreground border-b-2 border-transparent"
            )}
          >
            {tab === "basic" ? t("basicThemes") : t("premiumThemes")}
            {tab === "premium" && !isPro && (
              <Crown className="size-3.5 text-amber-500" strokeWidth={2} />
            )}
          </button>
        ))}
      </div>

      {/* Theme preset grid */}
      <div>
        {catalogTab === "basic" ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
            {/* "Custom" card — first slot */}
            <button
              type="button"
              aria-label="Custom theme"
              className={cn(
                "relative flex flex-col items-stretch rounded-xl overflow-hidden text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-2",
                !activePresetName
                  ? "ring-2 ring-foreground shadow-sm"
                  : "ring-1 ring-border hover:ring-foreground/30 hover:shadow-sm"
              )}
            >
              <div
                className="w-full flex-1 flex flex-col items-center justify-between p-2.5 pt-3"
                style={{ backgroundColor: theme.bg_color, minHeight: "100px" }}
              >
                <div className="flex-1 flex items-center justify-center">
                  <Pencil
                    className="size-5"
                    style={{ color: theme.text_color }}
                    strokeWidth={1.5}
                  />
                </div>
                <div className="w-full space-y-1 mt-2">
                  <div
                    className="w-full h-3"
                    style={{
                      backgroundColor: theme.button_color,
                      borderRadius: getButtonRadius(theme.button_corner),
                    }}
                  />
                  <div
                    className="w-full h-3"
                    style={{
                      backgroundColor: theme.button_color,
                      borderRadius: getButtonRadius(theme.button_corner),
                      opacity: 0.6,
                    }}
                  />
                </div>
              </div>
              <div className="px-2 py-1.5 bg-white border-t border-border/60 text-center">
                <p
                  className={cn(
                    "text-[10px] font-medium text-foreground truncate leading-tight",
                    !activePresetName && "font-semibold"
                  )}
                >
                  {t("customTheme")}
                </p>
              </div>
            </button>

            {/* Basic preset cards */}
            {THEME_PRESETS_BASIC.map((preset) => (
              <PresetCard
                key={preset.name}
                preset={preset}
                isActive={activePresetName === preset.name}
                onClick={() => handlePresetApply(preset)}
              />
            ))}
          </div>
        ) : (
          /* Premium tab — Pro users can apply, free users see locked cards */
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
            {THEME_PRESETS_PREMIUM.map((preset) => (
              <PresetCard
                key={preset.name}
                preset={preset}
                isActive={activePresetName === preset.name}
                isPro={!isPro}
                onClick={() => {
                  if (isPro) {
                    handlePresetApply(preset);
                  }
                  // Non-pro users: click is no-op, card shows Pro badge
                }}
              />
            ))}
          </div>
        )}
      </div>

      {catalogTab === "basic" && (
        <p className="text-xs text-muted-foreground">
          {t("themesDesc")}
        </p>
      )}
      {catalogTab === "premium" && !isPro && (
        <p className="text-xs text-muted-foreground">
          {t("premiumThemesDesc")}
        </p>
      )}
    </div>
  );
}
