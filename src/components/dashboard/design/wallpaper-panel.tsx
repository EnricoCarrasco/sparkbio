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
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-2xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-2",
        isActive
          ? "border-2 border-[#FF6B35] bg-orange-50/50 shadow-sm"
          : "border border-zinc-100 bg-white hover:border-zinc-200 hover:shadow-sm"
      )}
    >
      <div className="relative w-full min-h-[120px] aspect-[3/4] overflow-hidden">
        {preview}
      </div>
      <div className="px-2 py-2.5 text-center">
        <span
          className={cn(
            "text-xs font-semibold tracking-wide transition-colors",
            isActive ? "text-[#FF6B35]" : "text-zinc-500 group-hover:text-zinc-700"
          )}
        >
          {label}
        </span>
      </div>
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

  const wallpaperCards: {
    value: WallpaperStyle;
    label: string;
    preview: React.ReactNode;
  }[] = [
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
        {/* Wallpaper Style */}
        <section>
          <h2 className="text-lg font-bold text-zinc-900 mb-4">
            {t("wallpaperStyle")}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
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
        </section>

        {/* Fill: background color picker */}
        {activeStyle === "fill" && (
          <section className="bg-white p-6 rounded-2xl border border-zinc-100">
            <h2 className="text-lg font-bold text-zinc-900 mb-6">
              {t("bgColor")}
            </h2>
            <ColorInput
              id="wallpaper-bg"
              label={t("bgColor")}
              value={theme.bg_color}
              onChange={(v) => updateTheme({ bg_color: v })}
            />
          </section>
        )}

        {/* Gradient controls */}
        {activeStyle === "gradient" && (
          <section className="bg-white p-6 rounded-2xl border border-zinc-100">
            <h2 className="text-lg font-bold text-zinc-900 mb-6">
              {t("gradientStyle")}
            </h2>

            {/* Custom / Premade toggle */}
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() =>
                  updateTheme({ wallpaper_gradient_style: "custom" })
                }
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
                onClick={() =>
                  updateTheme({ wallpaper_gradient_style: "premade" })
                }
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

            {/* Custom: from/to color pickers + preview bar */}
            {theme.wallpaper_gradient_style !== "premade" && (
              <div className="space-y-5">
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
                  className="w-full h-12 rounded-xl border border-zinc-100 shadow-inner"
                  style={{
                    background: `linear-gradient(${theme.bg_gradient_direction ?? "to bottom"}, ${theme.bg_gradient_from ?? theme.bg_color}, ${theme.bg_gradient_to ?? "#FFFFFF"})`,
                  }}
                />
              </div>
            )}

            {/* Pre-made gradient swatches */}
            {theme.wallpaper_gradient_style === "premade" && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-zinc-700">
                  {t("gradientSwatches")}
                </h3>
                <div className="grid grid-cols-5 sm:grid-cols-6 gap-3">
                  {PREMADE_GRADIENTS.map((g) => {
                    const isActive =
                      theme.wallpaper_gradient_preset === g.name;
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
                            bg_gradient_direction:
                              theme.bg_gradient_direction ?? "to bottom",
                          });
                        }}
                        className={cn(
                          "size-10 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35]",
                          isActive
                            ? "ring-2 ring-offset-2 ring-foreground scale-110 shadow-md"
                            : "hover:scale-105 hover:shadow-sm"
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
          </section>
        )}

        {/* Effects */}
        <section className="bg-white p-6 rounded-2xl border border-zinc-100">
          <h2 className="text-lg font-bold text-zinc-900 mb-4">
            {t("animate")}
          </h2>
          <div className="space-y-3">
            {/* Animate toggle */}
            <div className="flex items-center justify-between rounded-xl bg-zinc-50 border border-zinc-100 p-4">
              <span className="text-sm font-medium text-zinc-900">
                {t("animate")}
              </span>
              <Switch
                checked={theme.wallpaper_animate}
                onCheckedChange={(v) =>
                  updateTheme({ wallpaper_animate: v })
                }
              />
            </div>

            {/* Noise toggle */}
            <div className="flex items-center justify-between rounded-xl bg-zinc-50 border border-zinc-100 p-4">
              <div className="space-y-0.5">
                <p className="text-sm font-medium text-zinc-900">
                  {t("noise")}
                </p>
                <p className="text-xs text-zinc-500">{t("noiseDesc")}</p>
              </div>
              <Switch
                checked={theme.wallpaper_noise}
                onCheckedChange={(v) =>
                  updateTheme({ wallpaper_noise: v })
                }
              />
            </div>
          </div>
        </section>
      </div>
    </ProFeatureGate>
  );
}
