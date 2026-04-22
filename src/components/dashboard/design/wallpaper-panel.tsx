"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Crown } from "lucide-react";
import { useThemeStore } from "@/lib/stores/theme-store";
import { useSubscriptionStore } from "@/lib/stores/subscription-store";
import { PREMADE_GRADIENTS } from "@/lib/constants";
import { Eyebrow } from "@/components/dashboard/_dash-primitives";
import { ColorInput } from "./color-input";
import type { WallpaperStyle } from "@/types";

interface WallpaperStyleCardProps {
  label: string;
  preview: React.ReactNode;
  isActive: boolean;
  showCrown?: boolean;
  onClick: () => void;
}

function WallpaperStyleCard({
  label,
  preview,
  isActive,
  showCrown,
  onClick,
}: WallpaperStyleCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        borderRadius: 16,
        padding: 0,
        background: "var(--dash-panel)",
        border: `1px solid ${isActive ? "var(--dash-orange)" : "var(--dash-line)"}`,
        boxShadow: isActive ? "0 0 0 3px var(--dash-orange-tint)" : "none",
        cursor: "pointer",
        transition: "all 0.15s",
        textAlign: "left",
      }}
    >
      {showCrown && (
        <span
          style={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 10,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 22,
            height: 22,
            borderRadius: 999,
            background: "rgba(255,255,255,0.95)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
          }}
        >
          <Crown className="size-3 text-amber-500" />
        </span>
      )}
      <div
        style={{
          position: "relative",
          width: "100%",
          minHeight: 110,
          aspectRatio: "3 / 4",
          overflow: "hidden",
        }}
      >
        {preview}
      </div>
      <div
        style={{
          padding: "10px 10px 10px",
          textAlign: "center",
          background: "var(--dash-panel-2)",
          borderTop: "1px solid var(--dash-line)",
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: "-0.005em",
            color: isActive ? "var(--dash-orange-deep)" : "var(--dash-muted)",
          }}
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
  const isPro = useSubscriptionStore((s) => s.isPro);

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
          style={{ width: "100%", height: "100%", background: theme.bg_color || "#111" }}
        />
      ),
    },
    {
      value: "gradient",
      label: t("gradientLabel"),
      preview: (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: `linear-gradient(to bottom, ${theme.bg_gradient_from ?? "#3d1f6e"}, ${theme.bg_gradient_to ?? "#1a0836"})`,
          }}
        />
      ),
    },
    {
      value: "blur",
      label: t("blur"),
      preview: (
        <div
          style={{
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(135deg, #334155 0%, #1E293B 50%, #0F172A 100%)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 8,
              left: 8,
              width: 32,
              height: 32,
              borderRadius: 999,
              background: "rgba(100,116,139,0.6)",
              filter: "blur(10px)",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: 8,
              right: 8,
              width: 40,
              height: 40,
              borderRadius: 999,
              background: "rgba(71,85,105,0.55)",
              filter: "blur(14px)",
            }}
          />
        </div>
      ),
    },
    {
      value: "pattern",
      label: t("pattern"),
      preview: (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "#0F172A",
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)",
            backgroundSize: "8px 8px",
          }}
        />
      ),
    },
  ];

  const animateOn = theme.wallpaper_animate;
  const noiseOn = theme.wallpaper_noise;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Wallpaper Style */}
      <div className="dash-panel">
        <Eyebrow>{t("wallpaperStyle")}</Eyebrow>
        <div
          style={{
            marginTop: 12,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
            gap: 12,
          }}
        >
          {wallpaperCards.map((card) => (
            <WallpaperStyleCard
              key={card.value}
              label={card.label}
              preview={card.preview}
              isActive={activeStyle === card.value}
              showCrown={!isPro && card.value !== "fill"}
              onClick={() => handleStyleChange(card.value)}
            />
          ))}
        </div>
      </div>

      {/* Fill: background color picker */}
      {activeStyle === "fill" && (
        <div className="dash-panel">
          <Eyebrow>{t("bgColor")}</Eyebrow>
          <div style={{ marginTop: 12 }}>
            <ColorInput
              id="wallpaper-bg"
              label={t("bgColor")}
              value={theme.bg_color}
              onChange={(v) => updateTheme({ bg_color: v })}
            />
          </div>
        </div>
      )}

      {/* Gradient controls */}
      {activeStyle === "gradient" && (
        <div className="dash-panel">
          <Eyebrow>{t("gradientStyle")}</Eyebrow>

          {/* Custom / Premade chip toggle */}
          <div
            className="chip-row"
            style={{
              display: "flex",
              gap: 8,
              flexWrap: "wrap",
              marginTop: 12,
              marginBottom: 16,
            }}
          >
            <button
              type="button"
              onClick={() => updateTheme({ wallpaper_gradient_style: "custom" })}
              className={`dash-chip${theme.wallpaper_gradient_style !== "premade" ? " active" : ""}`}
            >
              {t("custom")}
            </button>
            <button
              type="button"
              onClick={() => updateTheme({ wallpaper_gradient_style: "premade" })}
              className={`dash-chip${theme.wallpaper_gradient_style === "premade" ? " active" : ""}`}
            >
              {t("premade")}
            </button>
          </div>

          {/* Custom: from/to color pickers + preview bar */}
          {theme.wallpaper_gradient_style !== "premade" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: 14,
                }}
              >
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
                style={{
                  width: "100%",
                  height: 48,
                  borderRadius: 12,
                  border: "1px solid var(--dash-line)",
                  boxShadow: "inset 0 2px 6px rgba(0,0,0,0.06)",
                  background: `linear-gradient(${theme.bg_gradient_direction ?? "to bottom"}, ${theme.bg_gradient_from ?? theme.bg_color}, ${theme.bg_gradient_to ?? "#FFFFFF"})`,
                }}
              />
            </div>
          )}

          {/* Pre-made gradient swatches */}
          {theme.wallpaper_gradient_style === "premade" && (
            <div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--dash-muted)",
                  fontWeight: 500,
                  marginBottom: 10,
                }}
              >
                {t("gradientSwatches")}
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(40px, 1fr))",
                  gap: 10,
                }}
              >
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
                          bg_gradient_direction:
                            theme.bg_gradient_direction ?? "to bottom",
                        });
                      }}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 999,
                        background: `linear-gradient(135deg, ${g.from}, ${g.to})`,
                        border: 0,
                        cursor: "pointer",
                        boxShadow: isActive
                          ? "0 0 0 3px var(--dash-ink), 0 0 0 5px var(--dash-panel)"
                          : "0 1px 2px rgba(0,0,0,0.1)",
                        transform: isActive ? "scale(1.08)" : "scale(1)",
                        transition: "all 0.15s",
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Effects (animate / noise toggles) */}
      <div className="dash-panel">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Eyebrow>{t("animate")}</Eyebrow>
          {!isPro && <Crown className="size-3 text-amber-500" />}
        </div>

        <div style={{ marginTop: 6 }}>
          <label className="dash-toggle-row">
            <span style={{ fontWeight: 500 }}>{t("animate")}</span>
            <span className="dash-switch" data-on={animateOn}>
              <input
                type="checkbox"
                checked={animateOn}
                onChange={(e) =>
                  updateTheme({ wallpaper_animate: e.target.checked })
                }
                style={{ display: "none" }}
              />
              <span className="dash-switch-track">
                <span className="dash-switch-thumb" />
              </span>
            </span>
          </label>

          <label className="dash-toggle-row">
            <span>
              <div style={{ fontWeight: 500 }}>{t("noise")}</div>
              <div
                style={{
                  fontSize: 12,
                  color: "var(--dash-muted)",
                  marginTop: 3,
                  fontWeight: 400,
                }}
              >
                {t("noiseDesc")}
              </div>
            </span>
            <span className="dash-switch" data-on={noiseOn}>
              <input
                type="checkbox"
                checked={noiseOn}
                onChange={(e) =>
                  updateTheme({ wallpaper_noise: e.target.checked })
                }
                style={{ display: "none" }}
              />
              <span className="dash-switch-track">
                <span className="dash-switch-thumb" />
              </span>
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
