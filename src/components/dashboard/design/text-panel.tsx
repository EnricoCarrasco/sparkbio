"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Crown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useThemeStore } from "@/lib/stores/theme-store";
import { useSubscriptionStore } from "@/lib/stores/subscription-store";
import { THEME_FONTS } from "@/lib/constants";
import { Eyebrow } from "@/components/dashboard/_dash-primitives";
import { ColorInput } from "./color-input";
import { ToggleGroup } from "./toggle-group";
import type { TitleSize } from "@/types";

/** Fonts available on the free tier */
const FREE_FONTS = ["Inter", "Poppins", "DM Sans"];

/** True when the given font value is no longer in THEME_FONTS (dropped in an update). */
function isLegacyFont(value: string | null | undefined): boolean {
  if (!value) return false;
  return !THEME_FONTS.some((f) => f.value === value);
}

export function TextPanel() {
  const t = useTranslations("dashboard.design");
  const tBilling = useTranslations("billing");
  const theme = useThemeStore((s) => s.theme);
  const updateTheme = useThemeStore((s) => s.updateTheme);
  const isPro = useSubscriptionStore((s) => s.isPro);

  if (!theme) return null;

  // Build the page-font option list, appending the current value as a legacy
  // entry when it was removed from THEME_FONTS in a later update.
  const pageLegacy = isLegacyFont(theme.font_family);
  const pageFontOptions: { value: string; label: string; legacy?: boolean }[] = [
    ...THEME_FONTS.map((f) => ({ value: f.value, label: f.label })),
    ...(pageLegacy
      ? [{ value: theme.font_family, label: `${theme.font_family} (legacy)`, legacy: true }]
      : []),
  ];

  // Same for the title font (Pro-only section).
  const titleLegacyValue = theme.title_font && isLegacyFont(theme.title_font) ? theme.title_font : null;
  const titleFontOptions: { value: string; label: string; legacy?: boolean }[] = [
    ...THEME_FONTS.map((f) => ({ value: f.value, label: f.label })),
    ...(titleLegacyValue
      ? [{ value: titleLegacyValue, label: `${titleLegacyValue} (legacy)`, legacy: true }]
      : []),
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* ── Page Font ── */}
      <div className="dash-panel">
        <Eyebrow>{t("pageFont")}</Eyebrow>
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 14 }}>
          <Select
            value={theme.font_family}
            onValueChange={(v) => {
              if (!v) return;
              updateTheme({ font_family: v });
            }}
          >
            <SelectTrigger id="page-font" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {pageFontOptions.map((font) => {
                const locked =
                  !isPro && !font.legacy && !FREE_FONTS.includes(font.value);
                return (
                  <SelectItem key={font.value} value={font.value}>
                    <span
                      className="flex items-center gap-2"
                      style={{ fontFamily: font.value }}
                    >
                      {font.label}
                      {locked && <Crown className="size-3 text-amber-500" />}
                    </span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          {/* Font preview */}
          <div
            style={{
              background: "var(--dash-cream)",
              border: "1px solid var(--dash-line)",
              borderRadius: 14,
              padding: "18px 20px",
            }}
          >
            <p
              style={{
                fontFamily: theme.font_family,
                fontSize: 17,
                color: "var(--dash-ink)",
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              The quick brown fox jumps over the lazy dog
            </p>
          </div>

          {!isPro && (
            <p
              style={{
                fontSize: 12,
                color: "#B45309",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                margin: 0,
              }}
            >
              <Crown className="size-3.5" />
              {tBilling("proOnlyFonts")}
            </p>
          )}
        </div>
      </div>

      {/* ── Title Font ── */}
      <div className="dash-panel">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Eyebrow>{t("titleFont")}</Eyebrow>
          {!isPro && <Crown className="size-3 text-amber-500" />}
        </div>
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 14 }}>
          <Select
            value={theme.title_font ?? "__inherit__"}
            onValueChange={(v) => {
              if (v)
                updateTheme({ title_font: v === "__inherit__" ? null : v });
            }}
          >
            <SelectTrigger id="title-font" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__inherit__">{t("inheritFont")}</SelectItem>
              {titleFontOptions.map((font) => (
                <SelectItem key={font.value} value={font.value}>
                  <span
                    className="flex items-center gap-2"
                    style={{ fontFamily: font.value }}
                  >
                    {font.label}
                    {!isPro && !font.legacy && (
                      <Crown className="size-3 text-amber-500" />
                    )}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Title font preview */}
          <div
            style={{
              background: "var(--dash-cream)",
              border: "1px solid var(--dash-line)",
              borderRadius: 14,
              padding: "18px 20px",
            }}
          >
            <p
              style={{
                fontFamily: theme.title_font ?? theme.font_family,
                fontSize: 17,
                color: "var(--dash-ink)",
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              The quick brown fox jumps over the lazy dog
            </p>
          </div>
        </div>
      </div>

      {/* ── Text Colors ── */}
      <div className="dash-panel">
        <Eyebrow>{t("pageTextColor")}</Eyebrow>
        <div
          style={{
            marginTop: 12,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 14,
          }}
        >
          <ColorInput
            id="text-color"
            label={t("pageTextColor")}
            value={theme.text_color}
            onChange={(v) => updateTheme({ text_color: v })}
          />
          <ColorInput
            id="title-text-color"
            label={t("titleColor")}
            value={theme.title_color ?? theme.text_color}
            onChange={(v) => updateTheme({ title_color: v })}
          />
        </div>
      </div>

      {/* ── Title Size ── */}
      <div className="dash-panel">
        <Eyebrow>{t("titleSizeLabel")}</Eyebrow>
        <div style={{ marginTop: 12 }}>
          <ToggleGroup
            options={[
              { value: "small" as TitleSize, label: t("small") },
              { value: "large" as TitleSize, label: t("large") },
            ]}
            value={theme.title_size}
            onChange={(v) => updateTheme({ title_size: v })}
          />
        </div>
      </div>
    </div>
  );
}
