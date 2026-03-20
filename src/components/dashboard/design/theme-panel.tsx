"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/lib/stores/theme-store";
import { THEME_PRESETS } from "@/lib/constants";
import type { Theme } from "@/types";

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

interface PresetCardProps {
  preset: (typeof THEME_PRESETS)[number];
  isActive: boolean;
  onClick: () => void;
}

function PresetCard({ preset, isActive, onClick }: PresetCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      aria-label={`Apply ${preset.name} theme`}
      className={cn(
        "relative flex flex-col items-start rounded-xl border-2 overflow-hidden text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-2",
        isActive
          ? "border-[#FF6B35] shadow-md shadow-[#FF6B35]/20"
          : "border-border hover:border-[#FF6B35]/50 hover:shadow-sm"
      )}
    >
      <div
        className="w-full h-14"
        style={{ backgroundColor: preset.bg_color }}
      >
        <div className="flex items-center justify-center h-full gap-1.5 px-2">
          <div
            className="h-4 flex-1 max-w-[40px]"
            style={{
              backgroundColor: preset.button_color,
              borderRadius:
                preset.button_corner === "full"
                  ? "9999px"
                  : preset.button_corner === "square"
                    ? "0"
                    : "4px",
            }}
          />
          <div
            className="h-4 flex-1 max-w-[40px]"
            style={{
              backgroundColor: preset.button_color,
              borderRadius:
                preset.button_corner === "full"
                  ? "9999px"
                  : preset.button_corner === "square"
                    ? "0"
                    : "4px",
            }}
          />
        </div>
      </div>
      <div className="w-full px-2 py-1.5 bg-white border-t border-border">
        <p className="text-[10px] font-semibold text-foreground truncate leading-tight">
          {preset.name}
        </p>
        <p className="text-[9px] text-muted-foreground truncate leading-tight mt-0.5">
          {preset.font_family}
        </p>
      </div>
      {isActive && (
        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#FF6B35] flex items-center justify-center shadow-sm">
          <Check className="size-2.5 text-white" strokeWidth={3} />
        </div>
      )}
    </button>
  );
}

export function ThemePanel() {
  const t = useTranslations("dashboard.design");
  const theme = useThemeStore((s) => s.theme);
  const updateTheme = useThemeStore((s) => s.updateTheme);

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
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-foreground">{t("themes")}</h3>
      <p className="text-xs text-muted-foreground">{t("themesDesc")}</p>
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
        {THEME_PRESETS.map((preset) => (
          <PresetCard
            key={preset.name}
            preset={preset}
            isActive={activePresetName === preset.name}
            onClick={() => handlePresetApply(preset)}
          />
        ))}
      </div>
    </div>
  );
}
