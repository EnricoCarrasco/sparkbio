"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { useThemeStore } from "@/lib/stores/theme-store";
import { ColorInput } from "./color-input";
import { VisualOptionPicker } from "./visual-option-picker";
import { ToggleGroup } from "./toggle-group";
import type { ButtonStyleV2, ButtonCorner, ButtonShadow, LinkGap, ButtonFontSize } from "@/types";

export function ButtonsPanel() {
  const t = useTranslations("dashboard.design");
  const theme = useThemeStore((s) => s.theme);
  const updateTheme = useThemeStore((s) => s.updateTheme);

  if (!theme) return null;

  const btnColor = theme.button_color;

  const styleOptions: { value: ButtonStyleV2; label: string; preview: React.ReactNode }[] = [
    {
      value: "solid",
      label: t("solid"),
      preview: (
        <div
          className="w-full py-1.5 text-[9px] font-semibold text-center text-white rounded-md"
          style={{ backgroundColor: btnColor }}
        >
          Aa
        </div>
      ),
    },
    {
      value: "glass",
      label: t("glass"),
      preview: (
        <div
          className="w-full py-1.5 text-[9px] font-semibold text-center rounded-md border"
          style={{
            backgroundColor: `${btnColor}33`,
            color: btnColor,
            borderColor: `${btnColor}66`,
            backdropFilter: "blur(4px)",
          }}
        >
          Aa
        </div>
      ),
    },
    {
      value: "outline",
      label: t("outline"),
      preview: (
        <div
          className="w-full py-1.5 text-[9px] font-semibold text-center rounded-md border-2 bg-transparent"
          style={{ borderColor: btnColor, color: btnColor }}
        >
          Aa
        </div>
      ),
    },
  ];

  const cornerOptions: { value: ButtonCorner; label: string; preview: React.ReactNode }[] = [
    {
      value: "square",
      label: t("square"),
      preview: <div className="w-10 h-6 border-2 border-muted-foreground" style={{ borderRadius: "0" }} />,
    },
    {
      value: "round",
      label: t("round"),
      preview: <div className="w-10 h-6 border-2 border-muted-foreground" style={{ borderRadius: "8px" }} />,
    },
    {
      value: "rounder",
      label: t("rounder"),
      preview: <div className="w-10 h-6 border-2 border-muted-foreground" style={{ borderRadius: "16px" }} />,
    },
    {
      value: "full",
      label: t("fullRound"),
      preview: <div className="w-10 h-6 border-2 border-muted-foreground" style={{ borderRadius: "999px" }} />,
    },
  ];

  const shadowOptions: { value: ButtonShadow; label: string; preview: React.ReactNode }[] = [
    {
      value: "none",
      label: t("noShadow"),
      preview: <div className="w-10 h-6 rounded-md bg-muted-foreground/20" />,
    },
    {
      value: "soft",
      label: t("soft"),
      preview: <div className="w-10 h-6 rounded-md bg-muted-foreground/20" style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }} />,
    },
    {
      value: "strong",
      label: t("strong"),
      preview: <div className="w-10 h-6 rounded-md bg-muted-foreground/20" style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }} />,
    },
    {
      value: "hard",
      label: t("hard"),
      preview: <div className="w-10 h-6 rounded-md bg-muted-foreground/20" style={{ boxShadow: "4px 4px 0 rgba(0,0,0,0.8)" }} />,
    },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-foreground">{t("buttonsSection")}</h3>

      {/* Button style */}
      <div className="space-y-2">
        <Label>{t("buttonStyleLabel")}</Label>
        <VisualOptionPicker
          options={styleOptions}
          value={theme.button_style_v2}
          onChange={(v) => updateTheme({ button_style_v2: v })}
          columns={3}
        />
      </div>

      {/* Corner roundness */}
      <div className="space-y-2">
        <Label>{t("cornerRadius")}</Label>
        <VisualOptionPicker
          options={cornerOptions}
          value={theme.button_corner}
          onChange={(v) => updateTheme({ button_corner: v })}
        />
      </div>

      {/* Button shadow */}
      <div className="space-y-2">
        <Label>{t("buttonShadow")}</Label>
        <VisualOptionPicker
          options={shadowOptions}
          value={theme.button_shadow}
          onChange={(v) => updateTheme({ button_shadow: v })}
        />
      </div>

      {/* Link spacing */}
      <div className="space-y-2">
        <Label>{t("linkSpacing")}</Label>
        <ToggleGroup
          options={[
            { value: "compact" as LinkGap, label: t("compact") },
            { value: "normal" as LinkGap, label: t("normal") },
            { value: "relaxed" as LinkGap, label: t("relaxed") },
          ]}
          value={theme.link_gap}
          onChange={(v) => updateTheme({ link_gap: v })}
        />
      </div>

      {/* Button text size */}
      <div className="space-y-2">
        <Label>{t("buttonTextSize")}</Label>
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

      {/* Button color */}
      <ColorInput
        id="btn-color"
        label={t("buttonColor")}
        value={theme.button_color}
        onChange={(v) => updateTheme({ button_color: v })}
      />

      {/* Button text color */}
      <ColorInput
        id="btn-text-color"
        label={t("buttonTextColor")}
        value={theme.button_text_color}
        onChange={(v) => updateTheme({ button_text_color: v })}
      />
    </div>
  );
}
