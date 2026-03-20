"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useThemeStore } from "@/lib/stores/theme-store";
import { THEME_FONTS } from "@/lib/constants";
import { ColorInput } from "./color-input";
import { ToggleGroup } from "./toggle-group";
import type { TitleSize } from "@/types";

export function TextPanel() {
  const t = useTranslations("dashboard.design");
  const theme = useThemeStore((s) => s.theme);
  const updateTheme = useThemeStore((s) => s.updateTheme);

  if (!theme) return null;

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-foreground">{t("textSection")}</h3>

      {/* Page font */}
      <div className="space-y-1.5">
        <Label htmlFor="page-font">{t("pageFont")}</Label>
        <Select
          value={theme.font_family}
          onValueChange={(v) => { if (v) updateTheme({ font_family: v }); }}
        >
          <SelectTrigger id="page-font" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {THEME_FONTS.map((font) => (
              <SelectItem key={font.value} value={font.value}>
                <span style={{ fontFamily: font.value }}>{font.label}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p
          className="text-sm text-muted-foreground mt-2 truncate"
          style={{ fontFamily: theme.font_family }}
        >
          The quick brown fox jumps over the lazy dog
        </p>
      </div>

      {/* Page text color */}
      <ColorInput
        id="text-color"
        label={t("pageTextColor")}
        value={theme.text_color}
        onChange={(v) => updateTheme({ text_color: v })}
      />

      {/* Alt title font */}
      <div className="flex items-center justify-between">
        <Label>{t("altTitleFont")}</Label>
        <Switch
          checked={theme.title_font_alt}
          onCheckedChange={(v) => updateTheme({ title_font_alt: v })}
        />
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
    </div>
  );
}
