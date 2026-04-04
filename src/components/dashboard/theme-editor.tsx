"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useThemeStore } from "@/lib/stores/theme-store";
import { THEME_FONTS, THEME_PRESETS } from "@/lib/constants";
import type { ButtonStyle, Theme } from "@/types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ColorInputProps {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** A native color picker paired with a hex text input. */
function ColorInput({ id, label, value, onChange }: ColorInputProps) {
  // Ensure the value is always a valid 6-digit hex for the color input
  const safeColor = /^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000";

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-3">
        <label className="relative cursor-pointer shrink-0">
          <input
            type="color"
            value={safeColor}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            aria-label={label}
          />
          <div
            className="w-10 h-10 rounded-lg border border-border shadow-sm transition-transform hover:scale-105"
            style={{ backgroundColor: safeColor }}
          />
        </label>
        <Input
          id={id}
          value={value}
          onChange={(e) => {
            const v = e.target.value;
            // Allow free typing; only update store when it looks like a valid hex
            onChange(v);
          }}
          className="w-28 font-mono text-sm"
          maxLength={7}
          placeholder="#000000"
        />
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Button style preview labels and style maps
// ---------------------------------------------------------------------------

const BUTTON_STYLES: { value: ButtonStyle; label: string }[] = [
  { value: "pill", label: "Pill" },
  { value: "rounded", label: "Rounded" },
  { value: "sharp", label: "Sharp" },
  { value: "outline", label: "Outline" },
  { value: "shadow", label: "Shadow" },
];

function buttonPreviewStyle(
  style: ButtonStyle,
  buttonColor: string,
  isSelected: boolean
): React.CSSProperties {
  const radius =
    style === "pill"
      ? "9999px"
      : style === "sharp"
        ? "0"
        : "6px";

  if (style === "outline") {
    return {
      borderRadius: radius,
      border: `2px solid ${isSelected ? buttonColor : "#94a3b8"}`,
      backgroundColor: "transparent",
      color: isSelected ? buttonColor : "#64748b",
    };
  }

  if (style === "shadow") {
    return {
      borderRadius: radius,
      border: `2px solid ${isSelected ? buttonColor : "#94a3b8"}`,
      backgroundColor: isSelected ? buttonColor : "#f1f5f9",
      color: isSelected ? "#fff" : "#64748b",
      boxShadow: `3px 3px 0px ${isSelected ? buttonColor : "#94a3b8"}`,
    };
  }

  return {
    borderRadius: radius,
    backgroundColor: isSelected ? buttonColor : "#f1f5f9",
    color: isSelected ? "#fff" : "#64748b",
    border: "2px solid transparent",
  };
}

// ---------------------------------------------------------------------------
// Preset card mini-preview
// ---------------------------------------------------------------------------

interface PresetCardProps {
  preset: (typeof THEME_PRESETS)[number];
  isActive: boolean;
  onClick: () => void;
}

function PresetCard({ preset, isActive, onClick }: PresetCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      aria-label={`Apply ${preset.name} theme`}
      className={cn(
        "relative flex flex-col items-start rounded-xl border-2 overflow-hidden text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-2",
        isActive
          ? "border-[#FF6B35] shadow-md shadow-[#FF6B35]/20"
          : "border-border hover:border-[#FF6B35]/50 hover:shadow-sm"
      )}
    >
      {/* Color swatch area */}
      <div
        className="w-full h-14"
        style={{ backgroundColor: preset.bg_color }}
      >
        {/* Small button preview dot */}
        <div className="flex items-center justify-center h-full gap-1.5 px-2">
          <div
            className="h-4 flex-1 max-w-[40px]"
            style={{
              backgroundColor: preset.button_color,
              borderRadius:
                preset.button_style === "pill"
                  ? "9999px"
                  : preset.button_style === "sharp"
                    ? "0"
                    : "4px",
            }}
          />
          <div
            className="h-4 flex-1 max-w-[40px]"
            style={{
              backgroundColor: preset.button_color,
              borderRadius:
                preset.button_style === "pill"
                  ? "9999px"
                  : preset.button_style === "sharp"
                    ? "0"
                    : "4px",
            }}
          />
        </div>
      </div>

      {/* Label row */}
      <div className="w-full px-2 py-1.5 bg-white border-t border-border">
        <p className="text-[10px] font-semibold text-foreground truncate leading-tight">
          {preset.name}
        </p>
        <p className="text-[9px] text-muted-foreground truncate leading-tight mt-0.5">
          {preset.font_family}
        </p>
      </div>

      {/* Active checkmark badge */}
      {isActive && (
        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#FF6B35] flex items-center justify-center shadow-sm">
          <Check className="size-2.5 text-white" strokeWidth={3} />
        </div>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Section card wrapper
// ---------------------------------------------------------------------------

interface SectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

function Section({ title, description, children }: SectionProps) {
  return (
    <div className="p-5 border border-border rounded-xl bg-white space-y-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns true if the current theme matches a preset exactly (ignoring id/user_id/gradient fields). */
function getActivePresetName(theme: Theme | null): string | null {
  if (!theme) return null;
  for (const preset of THEME_PRESETS) {
    if (
      theme.bg_color === preset.bg_color &&
      theme.text_color === preset.text_color &&
      theme.button_color === preset.button_color &&
      theme.button_text_color === preset.button_text_color &&
      theme.button_style === preset.button_style &&
      theme.font_family === preset.font_family
    ) {
      return preset.name;
    }
  }
  return null;
}

const GRADIENT_DIRECTIONS = [
  { value: "to bottom", label: "Top to Bottom" },
  { value: "to right", label: "Left to Right" },
  { value: "to bottom right", label: "Diagonal (↘)" },
  { value: "to top", label: "Bottom to Top" },
] as const;

// ---------------------------------------------------------------------------
// Main ThemeEditor
// ---------------------------------------------------------------------------

export function ThemeEditor() {
  const t = useTranslations("dashboard.appearance");
  const theme = useThemeStore((s) => s.theme);
  const updateTheme = useThemeStore((s) => s.updateTheme);

  // Determine whether we are in gradient mode based on current theme values
  const isGradientMode =
    Boolean(theme?.bg_gradient_from) && Boolean(theme?.bg_gradient_to);

  const activePresetName = getActivePresetName(theme);

  // Guard: theme might still be null if network is slow (layout fetches, but
  // the appearance page can be navigated to before it resolves).
  if (!theme) return null;

  // -------------------------------------------------------------------
  // Update helpers
  // -------------------------------------------------------------------

  function handleBgColorChange(value: string) {
    updateTheme({ bg_color: value });
  }

  function handleGradientFromChange(value: string) {
    updateTheme({ bg_gradient_from: value });
  }

  function handleGradientToChange(value: string) {
    updateTheme({ bg_gradient_to: value });
  }

  function handleGradientDirectionChange(value: string | null) {
    if (value) updateTheme({ bg_gradient_direction: value });
  }

  function handleSwitchToSolid() {
    // Clear gradient fields when switching to solid
    updateTheme({
      bg_gradient_from: null,
      bg_gradient_to: null,
      bg_gradient_direction: null,
    });
  }

  function handleSwitchToGradient() {
    if (!theme) return;
    // Seed gradient with current bg color if not already set
    const from = theme.bg_gradient_from ?? theme.bg_color;
    const to = theme.bg_gradient_to ?? "#FFFFFF";
    updateTheme({
      bg_gradient_from: from,
      bg_gradient_to: to,
      bg_gradient_direction: theme.bg_gradient_direction ?? "to bottom",
    });
  }

  function handleButtonColorChange(value: string) {
    updateTheme({ button_color: value });
  }

  function handleButtonTextColorChange(value: string) {
    updateTheme({ button_text_color: value });
  }

  function handleButtonStyleChange(style: ButtonStyle) {
    updateTheme({ button_style: style });
  }

  function handleFontFamilyChange(value: string | null) {
    if (!value) return;
    updateTheme({ font_family: value });
  }

  function handleTextColorChange(value: string) {
    updateTheme({ text_color: value });
  }

  function handlePresetApply(preset: (typeof THEME_PRESETS)[number]) {
    updateTheme({
      bg_color: preset.bg_color,
      text_color: preset.text_color,
      button_color: preset.button_color,
      button_text_color: preset.button_text_color,
      button_style: preset.button_style,
      button_style_v2: preset.button_style_v2,
      button_corner: preset.button_corner,
      button_shadow: preset.button_shadow,
      font_family: preset.font_family,
      avatar_shape: preset.avatar_shape,
      avatar_border: preset.avatar_border,
      link_gap: preset.link_gap,
      title_font: preset.title_font,
      hide_bio: preset.hide_bio,
      button_font_size: preset.button_font_size ?? "medium",
      // Reset customizations that shouldn't persist across presets
      title_color: null,
      bg_gradient_from: null,
      bg_gradient_to: null,
      bg_gradient_direction: null,
    });
  }

  // -------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      {/* Page title */}
      <h1 className="text-xl font-bold text-foreground">{t("title")}</h1>

      {/* ---------------------------------------------------------------- */}
      {/* 1. Background section                                            */}
      {/* ---------------------------------------------------------------- */}
      <Section title={t("background")}>
        <Tabs
          defaultValue={isGradientMode ? "gradient" : "solid"}
          onValueChange={(value) => {
            if (value === "solid") handleSwitchToSolid();
            else handleSwitchToGradient();
          }}
        >
          <TabsList className="w-full">
            <TabsTrigger value="solid" className="flex-1">
              {t("solid")}
            </TabsTrigger>
            <TabsTrigger value="gradient" className="flex-1">
              {t("gradient")}
            </TabsTrigger>
          </TabsList>

          {/* Solid tab */}
          <TabsContent value="solid" className="pt-3">
            <ColorInput
              id="bg-color"
              label={t("background")}
              value={theme.bg_color}
              onChange={handleBgColorChange}
            />
          </TabsContent>

          {/* Gradient tab */}
          <TabsContent value="gradient" className="pt-3 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <ColorInput
                id="bg-gradient-from"
                label="From"
                value={theme.bg_gradient_from ?? theme.bg_color}
                onChange={handleGradientFromChange}
              />
              <ColorInput
                id="bg-gradient-to"
                label="To"
                value={theme.bg_gradient_to ?? "#FFFFFF"}
                onChange={handleGradientToChange}
              />
            </div>

            {/* Gradient preview strip */}
            <div
              className="w-full h-8 rounded-lg border border-border shadow-sm"
              style={{
                background: `linear-gradient(${
                  theme.bg_gradient_direction ?? "to bottom"
                }, ${theme.bg_gradient_from ?? theme.bg_color}, ${
                  theme.bg_gradient_to ?? "#FFFFFF"
                })`,
              }}
              aria-hidden="true"
            />

            {/* Direction select */}
            <div className="space-y-1.5">
              <Label htmlFor="gradient-direction">Direction</Label>
              <Select
                value={theme.bg_gradient_direction ?? "to bottom"}
                onValueChange={handleGradientDirectionChange}
              >
                <SelectTrigger id="gradient-direction" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GRADIENT_DIRECTIONS.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>
      </Section>

      {/* ---------------------------------------------------------------- */}
      {/* 2. Buttons section                                               */}
      {/* ---------------------------------------------------------------- */}
      <Section title={t("buttons")}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <ColorInput
            id="button-color"
            label={t("buttonColor")}
            value={theme.button_color}
            onChange={handleButtonColorChange}
          />
          <ColorInput
            id="button-text-color"
            label={t("buttonTextColor")}
            value={theme.button_text_color}
            onChange={handleButtonTextColorChange}
          />
        </div>

        {/* Button style picker */}
        <div className="space-y-2">
          <Label>{t("buttonStyle")}</Label>
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
            {BUTTON_STYLES.map(({ value, label }) => {
              const isSelected = theme.button_style === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleButtonStyleChange(value)}
                  aria-pressed={isSelected}
                  aria-label={`${label} button style`}
                  className={cn(
                    "flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all duration-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-1",
                    isSelected
                      ? "border-[#FF6B35] bg-[#FF6B35]/5"
                      : "border-border hover:border-[#FF6B35]/40 hover:bg-muted/30"
                  )}
                >
                  {/* Mini button preview */}
                  <div
                    className="w-full py-1.5 text-[9px] font-semibold text-center leading-none select-none transition-all"
                    style={buttonPreviewStyle(value, theme.button_color, isSelected)}
                  >
                    Aa
                  </div>
                  <span
                    className={cn(
                      "text-[9px] font-medium leading-none",
                      isSelected ? "text-[#FF6B35]" : "text-muted-foreground"
                    )}
                  >
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      {/* 3. Fonts section                                                 */}
      {/* ---------------------------------------------------------------- */}
      <Section title={t("fonts")}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <Label htmlFor="font-family">{t("fontFamily")}</Label>
            <Select
              value={theme.font_family}
              onValueChange={handleFontFamilyChange}
            >
              <SelectTrigger id="font-family" className="w-full">
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

            {/* Font preview */}
            <p
              className="text-sm text-muted-foreground mt-2 truncate"
              style={{ fontFamily: theme.font_family }}
            >
              The quick brown fox jumps over the lazy dog
            </p>
          </div>

          <ColorInput
            id="text-color"
            label={t("textColor")}
            value={theme.text_color}
            onChange={handleTextColorChange}
          />
        </div>
      </Section>

      {/* ---------------------------------------------------------------- */}
      {/* 4. Theme presets section                                         */}
      {/* ---------------------------------------------------------------- */}
      <Section title={t("presets")} description={t("presetsDesc")}>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
          {THEME_PRESETS.map((preset) => (
            <PresetCard
              key={preset.name}
              preset={preset}
              isActive={activePresetName === preset.name}
              onClick={() => handlePresetApply(preset)}
            />
          ))}
        </div>
      </Section>
    </div>
  );
}
