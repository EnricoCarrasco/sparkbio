"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Crown } from "lucide-react";
import { useThemeStore } from "@/lib/stores/theme-store";
import { useSubscriptionStore } from "@/lib/stores/subscription-store";
import { Eyebrow } from "@/components/dashboard/_dash-primitives";
import { ColorInput } from "./color-input";
import { ToggleGroup } from "./toggle-group";
import type {
  ButtonStyleV2,
  ButtonCorner,
  ButtonShadow,
  LinkGap,
  ButtonFontSize,
} from "@/types";

export function ButtonsPanel() {
  const t = useTranslations("dashboard.design");
  const tBilling = useTranslations("billing");
  const theme = useThemeStore((s) => s.theme);
  const updateTheme = useThemeStore((s) => s.updateTheme);
  const isPro = useSubscriptionStore((s) => s.isPro);

  if (!theme) return null;

  const btnColor = theme.button_color;
  const btnTextColor = theme.button_text_color;

  function handleStyleChange(v: ButtonStyleV2) {
    updateTheme({ button_style_v2: v });
  }

  function handleCornerChange(v: ButtonCorner) {
    updateTheme({ button_corner: v });
  }

  function handleShadowChange(v: ButtonShadow) {
    updateTheme({ button_shadow: v });
  }

  const cornerRadiusMap: Record<ButtonCorner, string> = {
    square: "0px",
    round: "8px",
    rounder: "16px",
    full: "999px",
  };

  const shadowMap: Record<ButtonShadow, string> = {
    none: "none",
    soft: "0 2px 8px rgba(0,0,0,0.10)",
    strong: "0 4px 16px rgba(0,0,0,0.22)",
    hard: "4px 4px 0 rgba(0,0,0,0.80)",
  };

  function buttonFillStyle(style: ButtonStyleV2): React.CSSProperties {
    switch (style) {
      case "solid":
        return { backgroundColor: btnColor, color: btnTextColor };
      case "glass":
        return {
          backgroundColor: `${btnColor}33`,
          color: btnColor,
          border: `1px solid ${btnColor}66`,
          backdropFilter: "blur(4px)",
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          color: btnColor,
          border: `2px solid ${btnColor}`,
        };
    }
  }

  const styleOptions: { value: ButtonStyleV2; label: string; proOnly: boolean }[] = [
    { value: "solid", label: t("solid"), proOnly: false },
    { value: "glass", label: t("glass"), proOnly: true },
    { value: "outline", label: t("outline"), proOnly: true },
  ];

  const cornerOptions: { value: ButtonCorner; label: string; proOnly: boolean }[] = [
    { value: "square", label: t("square"), proOnly: true },
    { value: "round", label: t("round"), proOnly: false },
    { value: "rounder", label: t("rounder"), proOnly: true },
    { value: "full", label: t("fullRound"), proOnly: false },
  ];

  const shadowOptions: { value: ButtonShadow; label: string; proOnly: boolean }[] = [
    { value: "none", label: t("noShadow"), proOnly: false },
    { value: "soft", label: t("soft"), proOnly: true },
    { value: "strong", label: t("strong"), proOnly: true },
    { value: "hard", label: t("hard"), proOnly: true },
  ];

  const spacingOptions: { value: LinkGap; label: string; gap: string }[] = [
    { value: "compact", label: t("compact"), gap: "4px" },
    { value: "normal", label: t("normal"), gap: "8px" },
    { value: "relaxed", label: t("relaxed"), gap: "14px" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* ─── Button Style — chip row with inline preview ─── */}
      <div className="dash-panel">
        <Eyebrow>{t("buttonStyleLabel")}</Eyebrow>
        <div
          className="chip-row"
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            marginTop: 12,
          }}
        >
          {styleOptions.map((opt) => {
            const isActive = theme.button_style_v2 === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleStyleChange(opt.value)}
                className={`dash-chip${isActive ? " active" : ""}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "6px 12px 6px 6px",
                  borderRadius: 999,
                }}
              >
                {/* Inline mini preview of the style */}
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 54,
                    height: 24,
                    fontSize: 10,
                    fontWeight: 700,
                    borderRadius: cornerRadiusMap[theme.button_corner],
                    ...buttonFillStyle(opt.value),
                  }}
                >
                  Aa
                </span>
                <span>{opt.label}</span>
                {opt.proOnly && !isPro && (
                  <Crown
                    className="size-3"
                    style={{
                      color: isActive ? "#FBBF24" : "#F59E0B",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
        {!isPro && (
          <p
            style={{
              fontSize: 12,
              color: "#B45309",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginTop: 12,
            }}
          >
            <Crown className="size-3" />
            {tBilling("proOnlyStyles")}
          </p>
        )}
      </div>

      {/* ─── Corner Radius ─── */}
      <div className="dash-panel">
        <Eyebrow>{t("cornerRadius")}</Eyebrow>
        <div
          className="chip-row"
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            marginTop: 12,
          }}
        >
          {cornerOptions.map((opt) => {
            const isActive = theme.button_corner === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleCornerChange(opt.value)}
                className={`dash-chip${isActive ? " active" : ""}`}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "6px 12px 6px 6px",
                  borderRadius: 999,
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    width: 36,
                    height: 18,
                    background: isActive ? btnColor : "var(--dash-cream-3)",
                    borderRadius: cornerRadiusMap[opt.value],
                    transition: "all 0.15s",
                  }}
                />
                <span>{opt.label}</span>
                {opt.proOnly && !isPro && (
                  <Crown
                    className="size-3"
                    style={{ color: isActive ? "#FBBF24" : "#F59E0B" }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Button Shadow ─── */}
      <div className="dash-panel">
        <Eyebrow>{t("buttonShadow")}</Eyebrow>
        <div
          style={{
            marginTop: 12,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
            gap: 10,
          }}
        >
          {shadowOptions.map((opt) => {
            const isActive = theme.button_shadow === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleShadowChange(opt.value)}
                style={{
                  position: "relative",
                  padding: "14px 10px 12px",
                  borderRadius: 14,
                  background: isActive
                    ? "var(--dash-orange-tint)"
                    : "var(--dash-panel-2)",
                  border: `1px solid ${isActive ? "var(--dash-orange)" : "var(--dash-line)"}`,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                {opt.proOnly && !isPro && (
                  <Crown
                    className="size-3 text-amber-500"
                    style={{ position: "absolute", top: 6, right: 6 }}
                  />
                )}
                <div
                  style={{
                    width: "100%",
                    height: 32,
                    borderRadius: cornerRadiusMap[theme.button_corner],
                    background: isActive ? btnColor : "#E5E7EB",
                    color: isActive ? btnTextColor : "#6B7280",
                    fontSize: 11,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: shadowMap[opt.value],
                    transition: "all 0.15s",
                  }}
                >
                  {opt.label}
                </div>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    textAlign: "center",
                    marginTop: 10,
                    color: isActive ? "var(--dash-orange-deep)" : "var(--dash-muted)",
                  }}
                >
                  {opt.label}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Button Colors ─── */}
      <div className="dash-panel">
        <Eyebrow>{t("buttonColor")}</Eyebrow>
        <div
          style={{
            marginTop: 12,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 14,
          }}
        >
          <ColorInput
            id="btn-color"
            label={t("buttonColor")}
            value={theme.button_color}
            onChange={(v) => updateTheme({ button_color: v })}
          />
          <ColorInput
            id="btn-text-color"
            label={t("buttonTextColor")}
            value={theme.button_text_color}
            onChange={(v) => updateTheme({ button_text_color: v })}
          />
        </div>
      </div>

      {/* ─── Link Spacing ─── */}
      <div className="dash-panel">
        <Eyebrow>{t("linkSpacing")}</Eyebrow>
        <div
          style={{
            marginTop: 12,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))",
            gap: 10,
          }}
        >
          {spacingOptions.map((opt) => {
            const isActive = theme.link_gap === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => updateTheme({ link_gap: opt.value })}
                style={{
                  padding: "14px 10px",
                  borderRadius: 14,
                  background: isActive
                    ? "var(--dash-orange-tint)"
                    : "var(--dash-panel-2)",
                  border: `1px solid ${isActive ? "var(--dash-orange)" : "var(--dash-line)"}`,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 12,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    gap: opt.gap,
                  }}
                >
                  <div
                    style={{
                      width: "100%",
                      height: 8,
                      borderRadius: 999,
                      background: isActive ? btnColor : "#D1D5DB",
                    }}
                  />
                  <div
                    style={{
                      width: "100%",
                      height: 8,
                      borderRadius: 999,
                      background: isActive ? btnColor : "#D1D5DB",
                    }}
                  />
                  <div
                    style={{
                      width: "100%",
                      height: 8,
                      borderRadius: 999,
                      background: isActive ? btnColor : "#D1D5DB",
                    }}
                  />
                </div>
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: isActive ? "var(--dash-orange-deep)" : "var(--dash-muted)",
                  }}
                >
                  {opt.label}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Text Size ─── */}
      <div className="dash-panel">
        <Eyebrow>{t("buttonTextSize")}</Eyebrow>
        <div style={{ marginTop: 12 }}>
          <ToggleGroup
            options={[
              { value: "small" as ButtonFontSize, label: t("small") },
              { value: "medium" as ButtonFontSize, label: t("medium") },
              { value: "large" as ButtonFontSize, label: t("large") },
            ]}
            value={theme.button_font_size}
            onChange={(v) => updateTheme({ button_font_size: v })}
          />
        </div>
      </div>
    </div>
  );
}
