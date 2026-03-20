"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useThemeStore } from "@/lib/stores/theme-store";
import { PREMADE_GRADIENTS } from "@/lib/constants";
import { ColorInput } from "./color-input";
import { ToggleGroup } from "./toggle-group";
import { VisualOptionPicker } from "./visual-option-picker";
import { cn } from "@/lib/utils";
import type { WallpaperStyle } from "@/types";

const GRADIENT_DIRECTIONS = [
  { value: "to bottom", label: "Top to Bottom" },
  { value: "to right", label: "Left to Right" },
  { value: "to bottom right", label: "Diagonal" },
  { value: "to top", label: "Bottom to Top" },
] as const;

export function WallpaperPanel() {
  const t = useTranslations("dashboard.design");
  const theme = useThemeStore((s) => s.theme);
  const updateTheme = useThemeStore((s) => s.updateTheme);

  if (!theme) return null;

  const wallpaperOptions: { value: WallpaperStyle; label: string; preview: React.ReactNode }[] = [
    {
      value: "fill",
      label: t("fill"),
      preview: (
        <div className="w-full h-8 rounded-md" style={{ backgroundColor: theme.bg_color }} />
      ),
    },
    {
      value: "gradient",
      label: t("gradientLabel"),
      preview: (
        <div
          className="w-full h-8 rounded-md"
          style={{
            background: `linear-gradient(to bottom, ${theme.bg_gradient_from ?? theme.bg_color}, ${theme.bg_gradient_to ?? "#FFFFFF"})`,
          }}
        />
      ),
    },
    {
      value: "blur",
      label: t("blur"),
      preview: (
        <div className="w-full h-8 rounded-md bg-gradient-to-br from-purple-200 to-blue-200 blur-[2px]" />
      ),
    },
    {
      value: "pattern",
      label: t("pattern"),
      preview: (
        <div className="w-full h-8 rounded-md bg-muted" style={{ backgroundImage: "radial-gradient(circle, #ccc 1px, transparent 1px)", backgroundSize: "6px 6px" }} />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-foreground">{t("wallpaper")}</h3>

      {/* Wallpaper style */}
      <VisualOptionPicker
        options={wallpaperOptions}
        value={theme.wallpaper_style}
        onChange={(v) => {
          updateTheme({ wallpaper_style: v });
          if (v === "gradient" && !theme.bg_gradient_from) {
            updateTheme({
              bg_gradient_from: theme.bg_color,
              bg_gradient_to: "#FFFFFF",
              bg_gradient_direction: "to bottom",
            });
          }
          if (v === "fill") {
            updateTheme({
              bg_gradient_from: null,
              bg_gradient_to: null,
              bg_gradient_direction: null,
            });
          }
        }}
      />

      {/* Fill: bg color */}
      {theme.wallpaper_style === "fill" && (
        <ColorInput
          id="wallpaper-bg"
          label={t("bgColor")}
          value={theme.bg_color}
          onChange={(v) => updateTheme({ bg_color: v })}
        />
      )}

      {/* Gradient controls */}
      {theme.wallpaper_style === "gradient" && (
        <div className="space-y-4">
          <ToggleGroup
            options={[
              { value: "custom" as const, label: t("custom") },
              { value: "premade" as const, label: t("premade") },
            ]}
            value={theme.wallpaper_gradient_style}
            onChange={(v) => updateTheme({ wallpaper_gradient_style: v })}
          />

          {theme.wallpaper_gradient_style === "custom" ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <ColorInput
                  id="gradient-from"
                  label="From"
                  value={theme.bg_gradient_from ?? theme.bg_color}
                  onChange={(v) => updateTheme({ bg_gradient_from: v })}
                />
                <ColorInput
                  id="gradient-to"
                  label="To"
                  value={theme.bg_gradient_to ?? "#FFFFFF"}
                  onChange={(v) => updateTheme({ bg_gradient_to: v })}
                />
              </div>
              {/* Gradient preview */}
              <div
                className="w-full h-8 rounded-lg border border-border"
                style={{
                  background: `linear-gradient(${theme.bg_gradient_direction ?? "to bottom"}, ${theme.bg_gradient_from ?? theme.bg_color}, ${theme.bg_gradient_to ?? "#FFFFFF"})`,
                }}
              />
              {/* Direction */}
              <div className="space-y-1.5">
                <Label>Direction</Label>
                <Select
                  value={theme.bg_gradient_direction ?? "to bottom"}
                  onValueChange={(v) => updateTheme({ bg_gradient_direction: v })}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {GRADIENT_DIRECTIONS.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {PREMADE_GRADIENTS.map((g) => {
                const isActive = theme.wallpaper_gradient_preset === g.name;
                return (
                  <button
                    key={g.name}
                    type="button"
                    onClick={() => {
                      updateTheme({
                        wallpaper_gradient_preset: g.name,
                        bg_gradient_from: g.from,
                        bg_gradient_to: g.to,
                        bg_gradient_direction: theme.bg_gradient_direction ?? "to bottom",
                      });
                    }}
                    className={cn(
                      "flex flex-col items-center gap-1.5",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35]"
                    )}
                  >
                    <div
                      className={cn(
                        "w-12 h-12 rounded-full border-2 transition-all",
                        isActive
                          ? "border-[#FF6B35] scale-110 shadow-md"
                          : "border-border hover:border-[#FF6B35]/50"
                      )}
                      style={{
                        background: `linear-gradient(135deg, ${g.from}, ${g.to})`,
                      }}
                    />
                    <span className="text-[10px] text-muted-foreground font-medium">
                      {g.name}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Animate toggle */}
      <div className="flex items-center justify-between">
        <Label>{t("animate")}</Label>
        <Switch
          checked={theme.wallpaper_animate}
          onCheckedChange={(v) => updateTheme({ wallpaper_animate: v })}
        />
      </div>

      {/* Noise toggle */}
      <div className="flex items-center justify-between">
        <Label>{t("noise")}</Label>
        <Switch
          checked={theme.wallpaper_noise}
          onCheckedChange={(v) => updateTheme({ wallpaper_noise: v })}
        />
      </div>
    </div>
  );
}
