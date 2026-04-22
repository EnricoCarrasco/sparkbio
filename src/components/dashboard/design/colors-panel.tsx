"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { useThemeStore } from "@/lib/stores/theme-store";
import { Eyebrow } from "@/components/dashboard/_dash-primitives";
import { ColorInput } from "./color-input";

export function ColorsPanel() {
  const t = useTranslations("dashboard.design");
  const theme = useThemeStore((s) => s.theme);
  const updateTheme = useThemeStore((s) => s.updateTheme);

  if (!theme) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="dash-panel">
        <Eyebrow>{t("colorsSection")}</Eyebrow>
        <p
          style={{
            fontSize: 13,
            color: "var(--dash-muted)",
            margin: "6px 0 16px",
            lineHeight: 1.5,
          }}
        >
          {t("colorsDesc")}
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 14,
          }}
        >
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
      </div>
    </div>
  );
}
