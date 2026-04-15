"use client";

import React, { useState } from "react";
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
import { UpgradeDialog } from "@/components/billing/upgrade-dialog";
import { THEME_FONTS } from "@/lib/constants";
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
  const [upgradeOpen, setUpgradeOpen] = useState(false);

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
    <div className="space-y-6">
      {/* ── Page Font ── */}
      <section className="bg-white p-6 rounded-2xl border border-zinc-100">
        <h2 className="text-lg font-bold text-zinc-900 mb-6">
          {t("pageFont")}
        </h2>

        <div className="space-y-4">
          <Select
            value={theme.font_family}
            onValueChange={(v) => {
              if (!v) return;
              // Legacy fonts are their current selection — always allowed.
              const legacy = isLegacyFont(v);
              if (!isPro && !legacy && !FREE_FONTS.includes(v)) {
                setUpgradeOpen(true);
                return;
              }
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
          <div className="bg-zinc-50 rounded-xl p-5 border border-zinc-100">
            <p
              className="text-lg text-zinc-700 leading-relaxed"
              style={{ fontFamily: theme.font_family }}
            >
              The quick brown fox jumps over the lazy dog
            </p>
          </div>

          {!isPro && (
            <p className="text-xs text-amber-600 flex items-center gap-1.5">
              <Crown className="size-3.5" />
              {tBilling("proOnlyFonts")}
            </p>
          )}
        </div>
      </section>

      {/* ── Title Font ── */}
      <section className="bg-white p-6 rounded-2xl border border-zinc-100">
        <h2 className="text-lg font-bold text-zinc-900 mb-6 flex items-center gap-2">
          {t("titleFont")}
          {!isPro && <Crown className="size-4 text-amber-500" />}
        </h2>

        {isPro ? (
          <div className="space-y-4">
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
                <SelectItem value="__inherit__">
                  {t("inheritFont")}
                </SelectItem>
                {titleFontOptions.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    <span style={{ fontFamily: font.value }}>
                      {font.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Title font preview */}
            <div className="bg-zinc-50 rounded-xl p-5 border border-zinc-100">
              <p
                className="text-lg text-zinc-700 leading-relaxed"
                style={{
                  fontFamily: theme.title_font ?? theme.font_family,
                }}
              >
                The quick brown fox jumps over the lazy dog
              </p>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setUpgradeOpen(true)}
            className="w-full flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-500 hover:bg-zinc-100 transition-colors"
          >
            <span>{t("inheritFont")}</span>
            <Crown className="size-3.5 text-amber-500" />
          </button>
        )}
      </section>

      {/* ── Colors ── */}
      <section className="bg-white p-6 rounded-2xl border border-zinc-100">
        <h2 className="text-lg font-bold text-zinc-900 mb-6">
          {t("pageTextColor")}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
      </section>

      {/* ── Title Size ── */}
      <section className="bg-white p-6 rounded-2xl border border-zinc-100">
        <h2 className="text-lg font-bold text-zinc-900 mb-4">
          {t("titleSizeLabel")}
        </h2>

        <ToggleGroup
          options={[
            { value: "small" as TitleSize, label: t("small") },
            { value: "large" as TitleSize, label: t("large") },
          ]}
          value={theme.title_size}
          onChange={(v) => updateTheme({ title_size: v })}
        />
      </section>

      <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </div>
  );
}
