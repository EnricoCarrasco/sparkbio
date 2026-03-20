"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { ImageIcon, Video, Crown } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useThemeStore } from "@/lib/stores/theme-store";
import { PREMADE_GRADIENTS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { WallpaperStyle } from "@/types";

/** Small pro badge shown in top-right corner of locked options */
function ProBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-amber-400 flex items-center justify-center shadow-sm",
        className
      )}
    >
      <Crown className="size-2.5 text-white" strokeWidth={2.5} />
    </span>
  );
}

interface WallpaperStyleCardProps {
  value: WallpaperStyle | "image" | "video";
  label: string;
  preview: React.ReactNode;
  isActive: boolean;
  isPro?: boolean;
  onClick: () => void;
}

function WallpaperStyleCard({
  label,
  preview,
  isActive,
  isPro,
  onClick,
}: WallpaperStyleCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35]"
      )}
    >
      <div
        className={cn(
          "relative w-full aspect-square rounded-xl overflow-hidden border-2 transition-all",
          isActive ? "border-[#43c88a]" : "border-transparent hover:border-border"
        )}
      >
        {preview}
        {isPro && <ProBadge />}
      </div>
      <span className="text-[11px] text-center text-muted-foreground font-medium leading-tight">
        {label}
      </span>
    </button>
  );
}

interface GradientStylePillProps {
  label: string;
  isActive: boolean;
  isPro?: boolean;
  onClick: () => void;
}

function GradientStylePill({ label, isActive, isPro, onClick }: GradientStylePillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex-1 py-2.5 rounded-full text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35]",
        isActive
          ? "border-2 border-foreground bg-white shadow-sm text-foreground"
          : "border border-border bg-transparent text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
      {isPro && (
        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 flex items-center justify-center shadow-sm">
          <Crown className="size-2 text-white" strokeWidth={2.5} />
        </span>
      )}
    </button>
  );
}

export function WallpaperPanel() {
  const t = useTranslations("dashboard.design");
  const theme = useThemeStore((s) => s.theme);
  const updateTheme = useThemeStore((s) => s.updateTheme);

  if (!theme) return null;

  const wallpaperStyles: {
    value: WallpaperStyle | "image" | "video";
    label: string;
    isPro?: boolean;
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
          <div className="absolute inset-0 backdrop-blur-sm" />
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
    {
      value: "image",
      label: "Image",
      isPro: true,
      preview: (
        <div className="w-full h-full bg-[#f3f3f3] flex items-center justify-center">
          <ImageIcon className="size-6 text-muted-foreground/50" />
        </div>
      ),
    },
    {
      value: "video",
      label: "Video",
      isPro: true,
      preview: (
        <div className="w-full h-full bg-[#f3f3f3] flex items-center justify-center">
          <Video className="size-6 text-muted-foreground/50" />
        </div>
      ),
    },
  ];

  const isGradient = theme.wallpaper_style === "gradient";

  return (
    <div className="space-y-6">
      {/* Wallpaper style heading + grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Wallpaper style</h3>
        <div className="grid grid-cols-3 gap-2.5">
          {wallpaperStyles.map((style) => {
            const isRealStyle =
              style.value === "fill" ||
              style.value === "gradient" ||
              style.value === "blur" ||
              style.value === "pattern";
            const isActive = isRealStyle && theme.wallpaper_style === style.value;

            return (
              <WallpaperStyleCard
                key={style.value}
                value={style.value}
                label={style.label}
                preview={style.preview}
                isActive={isActive}
                isPro={style.isPro}
                onClick={() => {
                  if (!isRealStyle) return;
                  const v = style.value as WallpaperStyle;
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
            );
          })}
        </div>
      </div>

      {/* Gradient-specific controls */}
      {isGradient && (
        <>
          {/* Gradient style toggle */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">Gradient style</h3>
            <div className="flex gap-2">
              <GradientStylePill
                label={t("custom")}
                isActive={theme.wallpaper_gradient_style !== "premade"}
                onClick={() => updateTheme({ wallpaper_gradient_style: "custom" })}
              />
              <GradientStylePill
                label={t("premade")}
                isActive={theme.wallpaper_gradient_style === "premade"}
                isPro
                onClick={() => updateTheme({ wallpaper_gradient_style: "premade" })}
              />
            </div>
          </div>

          {/* Gradient swatches */}
          {theme.wallpaper_gradient_style === "premade" ? (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Gradient</h3>
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
          ) : (
            /* Custom gradient: from/to color pickers would go here (not changing that component) */
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-foreground">Gradient</h3>
              <div className="grid grid-cols-6 gap-2.5">
                {PREMADE_GRADIENTS.map((g) => {
                  const isActive =
                    theme.bg_gradient_from === g.from && theme.bg_gradient_to === g.to;
                  return (
                    <button
                      key={g.name}
                      type="button"
                      title={g.name}
                      onClick={() => {
                        updateTheme({
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
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-foreground">{t("animate")}</span>
          <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-amber-400 shadow-sm">
            <Crown className="size-2.5 text-white" strokeWidth={2.5} />
          </span>
        </div>
        <Switch
          checked={theme.wallpaper_animate}
          onCheckedChange={(v) => updateTheme({ wallpaper_animate: v })}
        />
      </div>

      {/* Noise toggle */}
      <div className="flex items-center justify-between py-0.5">
        <div className="space-y-0.5">
          <p className="text-sm font-medium text-foreground">{t("noise")}</p>
          <p className="text-xs text-muted-foreground">Add a subtle grain texture</p>
        </div>
        <Switch
          checked={theme.wallpaper_noise}
          onCheckedChange={(v) => updateTheme({ wallpaper_noise: v })}
        />
      </div>
    </div>
  );
}
