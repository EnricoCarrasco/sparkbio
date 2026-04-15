"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Crown } from "lucide-react";
import { useThemeStore } from "@/lib/stores/theme-store";
import { useSubscriptionStore } from "@/lib/stores/subscription-store";
import { ColorInput } from "./color-input";
import { ToggleGroup } from "./toggle-group";
import { cn } from "@/lib/utils";
import type { ButtonStyleV2, ButtonCorner, ButtonShadow, LinkGap, ButtonFontSize } from "@/types";

export function ButtonsPanel() {
  const t = useTranslations("dashboard.design");
  const tBilling = useTranslations("billing");
  const theme = useThemeStore((s) => s.theme);
  const updateTheme = useThemeStore((s) => s.updateTheme);
  const isPro = useSubscriptionStore((s) => s.isPro);

  if (!theme) return null;

  const btnColor = theme.button_color;
  const btnTextColor = theme.button_text_color;

  // Free users can select any button style — their public page strips Pro
  // fields server-side. Crown badges still mark Pro-only options as a cue.
  function handleStyleChange(v: ButtonStyleV2) {
    updateTheme({ button_style_v2: v });
  }

  function handleCornerChange(v: ButtonCorner) {
    updateTheme({ button_corner: v });
  }

  function handleShadowChange(v: ButtonShadow) {
    updateTheme({ button_shadow: v });
  }

  /* ── Style preview builder ── */
  function getButtonPreviewStyle(style: ButtonStyleV2): React.CSSProperties {
    switch (style) {
      case "solid":
        return { backgroundColor: btnColor, color: btnTextColor };
      case "glass":
        return {
          backgroundColor: `${btnColor}33`,
          color: btnColor,
          borderWidth: "1px",
          borderColor: `${btnColor}66`,
          backdropFilter: "blur(4px)",
        };
      case "outline":
        return {
          backgroundColor: "transparent",
          color: btnColor,
          borderWidth: "2px",
          borderColor: btnColor,
        };
    }
  }

  /* ── Corner radius value map ── */
  const cornerRadiusMap: Record<ButtonCorner, string> = {
    square: "0px",
    round: "8px",
    rounder: "16px",
    full: "999px",
  };

  /* ── Shadow value map ── */
  const shadowMap: Record<ButtonShadow, string> = {
    none: "none",
    soft: "0 2px 8px rgba(0,0,0,0.10)",
    strong: "0 4px 16px rgba(0,0,0,0.22)",
    hard: "4px 4px 0 rgba(0,0,0,0.80)",
  };

  /* ── Style card data ── */
  const styleCards: { value: ButtonStyleV2; label: string; proOnly: boolean }[] = [
    { value: "solid", label: t("solid"), proOnly: false },
    { value: "glass", label: t("glass"), proOnly: true },
    { value: "outline", label: t("outline"), proOnly: true },
  ];

  /* ── Corner options ── */
  const cornerOptions: { value: ButtonCorner; label: string; proOnly: boolean }[] = [
    { value: "square", label: t("square"), proOnly: true },
    { value: "round", label: t("round"), proOnly: false },
    { value: "rounder", label: t("rounder"), proOnly: true },
    { value: "full", label: t("fullRound"), proOnly: false },
  ];

  /* ── Shadow options ── */
  const shadowOptions: { value: ButtonShadow; label: string; proOnly: boolean }[] = [
    { value: "none", label: t("noShadow"), proOnly: false },
    { value: "soft", label: t("soft"), proOnly: true },
    { value: "strong", label: t("strong"), proOnly: true },
    { value: "hard", label: t("hard"), proOnly: true },
  ];

  /* ── Spacing options ── */
  const spacingOptions: { value: LinkGap; label: string; gap: string }[] = [
    { value: "compact", label: t("compact"), gap: "4px" },
    { value: "normal", label: t("normal"), gap: "8px" },
    { value: "relaxed", label: t("relaxed"), gap: "14px" },
  ];

  return (
    <div className="space-y-8">
      {/* ─── Button Style — 3 large cards ─── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-zinc-900">{t("buttonStyleLabel")}</h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {styleCards.map((card) => {
            const isSelected = theme.button_style_v2 === card.value;
            return (
              <button
                key={card.value}
                type="button"
                onClick={() => handleStyleChange(card.value)}
                className={cn(
                  "relative p-6 rounded-2xl border transition-all text-left",
                  isSelected
                    ? "border-2 border-[#FF6B35] bg-orange-50/50"
                    : "border border-zinc-100 bg-white hover:border-zinc-200"
                )}
              >
                {/* Pro crown badge */}
                {card.proOnly && !isPro && (
                  <Crown className="absolute top-3 right-3 size-4 text-amber-400" />
                )}

                {/* Button preview */}
                <div
                  className="w-full h-12 rounded-lg flex items-center justify-center text-sm font-semibold transition-all"
                  style={{
                    ...getButtonPreviewStyle(card.value),
                    borderRadius: cornerRadiusMap[theme.button_corner],
                  }}
                >
                  {card.label}
                </div>

                {/* Label */}
                <p
                  className={cn(
                    "text-xs font-medium text-center mt-3",
                    isSelected ? "text-[#FF6B35]" : "text-zinc-500"
                  )}
                >
                  {card.label}
                </p>
              </button>
            );
          })}
        </div>
        {!isPro && (
          <p className="text-xs text-amber-600 flex items-center gap-1 mt-3">
            <Crown className="size-3" />
            {tBilling("proOnlyStyles")}
          </p>
        )}
      </section>

      {/* ─── Corner Radius + Button Colors — 2-col grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Corner Radius */}
        <section className="bg-white p-6 rounded-2xl border border-zinc-100">
          <h2 className="text-lg font-bold text-zinc-900 mb-6">{t("cornerRadius")}</h2>
          <div className="grid grid-cols-4 gap-3">
            {cornerOptions.map((opt) => {
              const isSelected = theme.button_corner === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleCornerChange(opt.value)}
                  className={cn(
                    "relative aspect-[4/3] rounded-xl border-2 transition-all flex items-center justify-center",
                    isSelected
                      ? "border-[#FF6B35] bg-orange-50/50"
                      : "border-zinc-100 bg-zinc-50 hover:border-zinc-200"
                  )}
                >
                  {opt.proOnly && !isPro && (
                    <Crown className="absolute top-1 right-1 size-3 text-amber-400" />
                  )}
                  <div
                    className="w-3/4 h-1/2 transition-all"
                    style={{
                      borderRadius: cornerRadiusMap[opt.value],
                      backgroundColor: isSelected ? btnColor : "#a1a1aa",
                    }}
                  />
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-4 gap-3 mt-2">
            {cornerOptions.map((opt) => (
              <p
                key={opt.value}
                className={cn(
                  "text-[10px] font-medium text-center",
                  theme.button_corner === opt.value ? "text-[#FF6B35]" : "text-zinc-400"
                )}
              >
                {opt.label}
              </p>
            ))}
          </div>
        </section>

        {/* Button Colors */}
        <section className="bg-white p-6 rounded-2xl border border-zinc-100">
          <h2 className="text-lg font-bold text-zinc-900 mb-6">{t("buttonColor")}</h2>
          <div className="space-y-5">
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
        </section>
      </div>

      {/* ─── Shadow + Spacing — 2-col grid ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Button Shadow */}
        <section className="bg-white p-6 rounded-2xl border border-zinc-100">
          <h2 className="text-lg font-bold text-zinc-900 mb-6">{t("buttonShadow")}</h2>
          <div className="grid grid-cols-2 gap-3">
            {shadowOptions.map((opt) => {
              const isSelected = theme.button_shadow === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleShadowChange(opt.value)}
                  className={cn(
                    "relative p-4 rounded-xl border-2 transition-all",
                    isSelected
                      ? "border-[#FF6B35] bg-orange-50/50"
                      : "border-zinc-100 bg-white hover:border-zinc-200"
                  )}
                >
                  {opt.proOnly && !isPro && (
                    <Crown className="absolute top-2 right-2 size-3 text-amber-400" />
                  )}
                  <div
                    className="w-full h-10 rounded-lg flex items-center justify-center text-xs font-semibold transition-all"
                    style={{
                      backgroundColor: isSelected ? btnColor : "#f4f4f5",
                      color: isSelected ? btnTextColor : "#71717a",
                      boxShadow: shadowMap[opt.value],
                      borderRadius: cornerRadiusMap[theme.button_corner],
                    }}
                  >
                    {opt.label}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Link Spacing */}
        <section className="bg-white p-6 rounded-2xl border border-zinc-100">
          <h2 className="text-lg font-bold text-zinc-900 mb-6">{t("linkSpacing")}</h2>
          <div className="grid grid-cols-3 gap-3">
            {spacingOptions.map((opt) => {
              const isSelected = theme.link_gap === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => updateTheme({ link_gap: opt.value })}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all flex flex-col items-center justify-center",
                    isSelected
                      ? "border-[#FF6B35] bg-orange-50/50"
                      : "border-zinc-100 bg-white hover:border-zinc-200"
                  )}
                >
                  {/* Stacked bars preview */}
                  <div className="w-full flex flex-col items-center" style={{ gap: opt.gap }}>
                    <div
                      className="w-full h-2.5 rounded-full"
                      style={{ backgroundColor: isSelected ? btnColor : "#d4d4d8" }}
                    />
                    <div
                      className="w-full h-2.5 rounded-full"
                      style={{ backgroundColor: isSelected ? btnColor : "#d4d4d8" }}
                    />
                    <div
                      className="w-full h-2.5 rounded-full"
                      style={{ backgroundColor: isSelected ? btnColor : "#d4d4d8" }}
                    />
                  </div>
                  <p
                    className={cn(
                      "text-[10px] font-medium mt-3",
                      isSelected ? "text-[#FF6B35]" : "text-zinc-400"
                    )}
                  >
                    {opt.label}
                  </p>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* ─── Text Size ─── */}
      <section className="bg-white p-6 rounded-2xl border border-zinc-100">
        <h2 className="text-lg font-bold text-zinc-900 mb-4">{t("buttonTextSize")}</h2>
        <ToggleGroup
          options={[
            { value: "small" as ButtonFontSize, label: t("small") },
            { value: "medium" as ButtonFontSize, label: t("medium") },
            { value: "large" as ButtonFontSize, label: t("large") },
          ]}
          value={theme.button_font_size}
          onChange={(v) => updateTheme({ button_font_size: v })}
        />
      </section>
    </div>
  );
}
