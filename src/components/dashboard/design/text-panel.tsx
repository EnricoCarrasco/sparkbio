"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Crown } from "lucide-react";
import { Label } from "@/components/ui/label";
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

export function TextPanel() {
  const t = useTranslations("dashboard.design");
  const tBilling = useTranslations("billing");
  const theme = useThemeStore((s) => s.theme);
  const updateTheme = useThemeStore((s) => s.updateTheme);
  const isPro = useSubscriptionStore((s) => s.isPro);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  if (!theme) return null;

  const availableFonts = isPro
    ? THEME_FONTS
    : THEME_FONTS.map((f) => ({ ...f, locked: !FREE_FONTS.includes(f.value) }));

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-foreground">{t("textSection")}</h3>

      {/* Page font — free users get 3, Pro gets all 10 */}
      <div className="space-y-1.5">
        <Label htmlFor="page-font">{t("pageFont")}</Label>
        <Select
          value={theme.font_family}
          onValueChange={(v) => {
            if (!v) return;
            if (!isPro && !FREE_FONTS.includes(v)) {
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
            {THEME_FONTS.map((font) => {
              const locked = !isPro && !FREE_FONTS.includes(font.value);
              return (
                <SelectItem key={font.value} value={font.value}>
                  <span className="flex items-center gap-2" style={{ fontFamily: font.value }}>
                    {font.label}
                    {locked && <Crown className="size-3 text-amber-500" />}
                  </span>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <p
          className="text-sm text-muted-foreground mt-2 truncate"
          style={{ fontFamily: theme.font_family }}
        >
          The quick brown fox jumps over the lazy dog
        </p>
        {!isPro && (
          <p className="text-[10px] text-amber-600 flex items-center gap-1">
            <Crown className="size-3" />
            {tBilling("proOnlyFonts")}
          </p>
        )}
      </div>

      {/* Page text color */}
      <ColorInput
        id="text-color"
        label={t("pageTextColor")}
        value={theme.text_color}
        onChange={(v) => updateTheme({ text_color: v })}
      />

      {/* Title font — Pro only */}
      <div className="space-y-1.5">
        <Label htmlFor="title-font" className="flex items-center gap-1.5">
          {t("titleFont")}
          {!isPro && <Crown className="size-3.5 text-amber-500" />}
        </Label>
        {isPro ? (
          <Select
            value={theme.title_font ?? "__inherit__"}
            onValueChange={(v) => {
              if (v) updateTheme({ title_font: v === "__inherit__" ? null : v });
            }}
          >
            <SelectTrigger id="title-font" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__inherit__">{t("inheritFont")}</SelectItem>
              {THEME_FONTS.map((font) => (
                <SelectItem key={font.value} value={font.value}>
                  <span style={{ fontFamily: font.value }}>{font.label}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <button
            type="button"
            onClick={() => setUpgradeOpen(true)}
            className="w-full flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50 transition-colors"
          >
            <span>{t("inheritFont")}</span>
            <Crown className="size-3.5 text-amber-500" />
          </button>
        )}
      </div>

      {/* Title color */}
      <ColorInput
        id="title-text-color"
        label={t("titleColor")}
        value={theme.title_color ?? theme.text_color}
        onChange={(v) => updateTheme({ title_color: v })}
      />

      {/* Title size */}
      <div className="space-y-2">
        <Label>{t("titleSizeLabel")}</Label>
        <ToggleGroup
          options={[
            { value: "small" as TitleSize, label: t("small") },
            { value: "large" as TitleSize, label: t("large") },
          ]}
          value={theme.title_size}
          onChange={(v) => updateTheme({ title_size: v })}
        />
      </div>

      <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </div>
  );
}
