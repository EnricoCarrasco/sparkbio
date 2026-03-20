"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useThemeStore } from "@/lib/stores/theme-store";
import { ColorInput } from "./color-input";

export function ColorsPanel() {
  const t = useTranslations("dashboard.design");
  const theme = useThemeStore((s) => s.theme);
  const updateTheme = useThemeStore((s) => s.updateTheme);

  if (!theme) return null;

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-foreground">{t("colorsSection")}</h3>
      <p className="text-xs text-muted-foreground">{t("colorsDesc")}</p>

      <ColorInput
        id="colors-btn"
        label={t("buttonColor")}
        value={theme.button_color}
        onChange={(v) => updateTheme({ button_color: v })}
      />

      <ColorInput
        id="colors-btn-text"
        label={t("buttonTextColor")}
        value={theme.button_text_color}
        onChange={(v) => updateTheme({ button_text_color: v })}
      />

      <ColorInput
        id="colors-page-text"
        label={t("pageTextColor")}
        value={theme.text_color}
        onChange={(v) => updateTheme({ text_color: v })}
      />

      <ColorInput
        id="colors-title"
        label={t("titleColor")}
        value={theme.title_color ?? theme.text_color}
        onChange={(v) => updateTheme({ title_color: v })}
      />
    </div>
  );
}
