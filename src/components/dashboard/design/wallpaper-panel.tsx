"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Crown } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useThemeStore } from "@/lib/stores/theme-store";
import { PREMADE_GRADIENTS } from "@/lib/constants";
import { ColorInput } from "./color-input";
import { ProFeatureGate } from "@/components/billing/pro-feature-gate";
import { cn } from "@/lib/utils";
import type { WallpaperStyle } from "@/types";

interface WallpaperStyleCardProps {
  label: string;
  preview: React.ReactNode;
  isActive: boolean;
  onClick: () => void;
}

function WallpaperStyleCard({
  label,
  preview,
  isActive,
  onClick,
}: WallpaperStyleCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex flex-col items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35]"
    >
      <div
        className={cn(
          "relative w-full aspect-square rounded-xl overflow-hidden border-2 transition-all",
          isActive ? "border-[#43c88a]" : "border-transparent hover:border-border"
        )}
      >
        {preview}
      </div>
      <span className="text-[11px] text-center text-muted-foreground font-medium leading-tight">
        {label}
      </span>
    </button>
  );
}

export function WallpaperPanel() {
  const t = useTranslations("dashboard.design");
  const theme = useThemeStore((s) => s.theme);
  const updateTheme = useThemeStore((s) => s.updateTheme);

  if (!theme) return null;

  function handleStyleChange(style: WallpaperStyle) {
    if (style === "gradient") {
      updateTheme({
        wallpaper_style: style,
        bg_gradient_from: theme!.bg_gradient_from ?? theme!.bg_color,
        bg_gradient_to: theme!.bg_gradient_to ?? "#FFFFFF",
        bg_gradient_direction: theme!.bg_gradient_direction ?? "to bottom",
      });
    } else if (style === "fill") {
      updateTheme({
        wallpaper_style: style,
        bg_gradient_from: null,
        bg_gradient_to: null,
        bg_gradient_direction: null,
      });
    } else {
      updateTheme({ wallpaper_style: style });
    }
  }

  const activeStyle = theme.wallpaper_style ?? "fill";

  const wallpaperCards: { value: WallpaperStyle; label: string; preview: React.ReactNode }[] = [
    {
      value: "fill",
      label: t("fill"),
      preview: (
        <div
          className="w-full h-full"
          style={{ backgroundColor: theme.bg_color || "#111111" }}
        />
      ),
    },
    {
      value: "gradient",
      label: t("gradientLabel"),
      preview: (
        <div
          className="w-full h-full"
          style={{
            background: `linear-gradient(to bottom, ${theme.bg_gradient_from ?? "#3d1f6e"}, ${theme.bg_gradient_to ?? "#1a0836"})`,
          }}
        />
      ),
    },
    {
      value: "blur",
      label: t("blur"),
      preview: (
        <div className="w-full h-full bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 relative overflow-hidden">
          <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-slate-500/60 blur-md" />
          <div className="absolute bottom-2 right-2 w-10 h-10 rounded-full bg-slate-600/50 blur-lg" />
        </div>
      ),
    },
    {
      value: "pattern",
      label: t("pattern"),
      preview: (
        <div
          className="w-full h-full bg-slate-900"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "8px 8px",
          }}
        />
      ),
    },
  ];

  return (
    <ProFeatureGate featureLabel={t("wallpaperStyle")}>
      <div className="space-y-6">
        {/* Wallpaper style grid */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">{t("wallpaperStyle")}</h3>
          <div className="grid grid-cols-4 gap-2.5">
            {wallpaperCards.map((card) => (
              <WallpaperStyleCard
                key={card.value}
                label={card.label}
                preview={card.preview}
                isActive={activeStyle === card.value}
                onClick={() => handleStyleChange(card.value)}
              />
            ))}
          </div>
        </div>

        {/* Fill: background color picker */}
        {activeStyle === "fill" && (
          <ColorInput
            id="wallpaper-bg"
            label={t("bgColor")}
            value={theme.bg_color}
            onChange={(v) => updateTheme({ bg_color: v })}
          />
        )}

        {/* Gradient controls */}
        {activeStyle === "gradient" && (
          <>
            {/* Gradient style toggle */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">{t("gradientStyle")}</h3>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => updateTheme({ wallpaper_gradient_style: "custom" })}
                  className={cn(
                    "flex-1 py-2.5 rounded-full text-sm font-medium transition-all",
                    theme.wallpaper_gradient_style !== "premade"
                      ? "border-2 border-foreground bg-white shadow-sm text-foreground"
                      : "border border-border bg-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t("custom")}
                </button>
                <button
                  type="button"
                  onClick={() => updateTheme({ wallpaper_gradient_style: "premade" })}
                  className={cn(
                    "flex-1 py-2.5 rounded-full text-sm font-medium transition-all",
                    theme.wallpaper_gradient_style === "premade"
                      ? "border-2 border-foreground bg-white shadow-sm text-foreground"
                      : "border border-border bg-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t("premade")}
                </button>
              </div>
            </div>

            {/* Custom: from/to color pickers */}
            {theme.wallpaper_gradient_style !== "premade" && (
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
                <div
                  className="w-full h-8 rounded-lg border border-border"
                  style={{
                    background: `linear-gradient(${theme.bg_gradient_direction ?? "to bottom"}, ${theme.bg_gradient_from ?? theme.bg_color}, ${theme.bg_gradient_to ?? "#FFFFFF"})`,
                  }}
                />
              </div>
            )}

            {/* Pre-made gradient swatches */}
            {theme.wallpaper_gradient_style === "premade" && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground">{t("gradientSwatches")}</h3>
                <div className="grid grid-cols-6 gap-2.5">
                  {PREMADE_GRADIENTS.map((g) => {
                    const isActive = theme.wallpaper_gradient_preset === g.name;
                    return (
                      <button
                        key={g.name}
                        type="button"
                        title={g.name}
                        onClick={() => {
                          updateTheme({
                            wallpaper_gradient_preset: g.name,
                            bg_gradient_from: g.from,
                            bg_gradient_to: g.to,
                            bg_gradient_direction: theme.bg_gradient_direction ?? "to bottom",
                          });
                        }}
                        className={cn(
                          "w-full aspect-square rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35]",
                          isActive
                            ? "ring-2 ring-offset-2 ring-foreground scale-110 shadow-md"
                            : "hover:scale-105"
                        )}
                        style={{
                          background: `linear-gradient(135deg, ${g.from}, ${g.to})`,
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* Animate toggle */}
        <div className="flex items-center justify-between py-0.5">
          <span className="text-sm font-medium text-foreground">{t("animate")}</span>
          <Switch
            checked={theme.wallpaper_animate}
            onCheckedChange={(v) => updateTheme({ wallpaper_animate: v })}
          />
        </div>

        {/* Noise toggle */}
        <div className="flex items-center justify-between py-0.5">
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-foreground">{t("noise")}</p>
            <p className="text-xs text-muted-foreground">{t("noiseDesc")}</p>
          </div>
          <Switch
            checked={theme.wallpaper_noise}
            onCheckedChange={(v) => updateTheme({ wallpaper_noise: v })}
          />
        </div>
      </div>
    </ProFeatureGate>
  );
}
