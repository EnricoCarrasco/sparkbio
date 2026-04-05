"use client";

import React, { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Camera, Crown, ImagePlus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useThemeStore } from "@/lib/stores/theme-store";
import { useSubscriptionStore } from "@/lib/stores/subscription-store";
import { UpgradeDialog } from "@/components/billing/upgrade-dialog";
import { AVATAR_MAX_SIZE, AVATAR_ACCEPTED_TYPES, HERO_MAX_SIZE, HERO_ACCEPTED_TYPES } from "@/lib/constants";
import { ToggleGroup } from "./toggle-group";
import { ColorInput } from "./color-input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { ProfileLayout, TitleSize, TitleStyle, AvatarShape, AvatarBorder } from "@/types";

// ---------------------------------------------------------------------------
// Visual shape picker — shows actual shape previews instead of text buttons
// ---------------------------------------------------------------------------

function ShapePicker({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string; className: string }[];
}) {
  return (
    <div className="flex gap-3">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "flex flex-col items-center gap-1.5 group transition-all",
          )}
        >
          <div
            className={cn(
              "size-12 bg-gradient-to-br from-[#FF6B35] to-[#E8501A] transition-all",
              opt.className,
              value === opt.value
                ? "ring-2 ring-[#FF6B35] ring-offset-2 scale-105"
                : "opacity-40 hover:opacity-70 hover:scale-105"
            )}
          />
          <span className={cn(
            "text-[10px] font-medium transition-colors",
            value === opt.value ? "text-foreground" : "text-muted-foreground"
          )}>
            {opt.label}
          </span>
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Visual border picker — shows actual border style previews
// ---------------------------------------------------------------------------

function BorderPicker({
  value,
  onChange,
  isPro,
  onUpgrade,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  isPro: boolean;
  onUpgrade: () => void;
  options: { value: string; label: string; style: string; proOnly?: boolean }[];
}) {
  return (
    <div className="flex flex-wrap gap-2.5">
      {options.map((opt) => {
        const locked = opt.proOnly && !isPro;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              if (locked) { onUpgrade(); return; }
              onChange(opt.value);
            }}
            className={cn(
              "relative flex flex-col items-center gap-1.5 transition-all",
            )}
          >
            <div
              className={cn(
                "size-10 rounded-full bg-gradient-to-br from-[#FF6B35]/80 to-[#E8501A]/80 transition-all",
                opt.style,
                value === opt.value
                  ? "ring-2 ring-[#FF6B35] ring-offset-2 scale-110"
                  : "opacity-50 hover:opacity-80 hover:scale-105"
              )}
            />
            <span className={cn(
              "text-[10px] font-medium transition-colors flex items-center gap-0.5",
              value === opt.value ? "text-foreground" : "text-muted-foreground"
            )}>
              {opt.label}
              {locked && <Crown className="size-2.5 text-amber-500" />}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// HeaderPanel — Stitch design language
// ---------------------------------------------------------------------------

export function HeaderPanel() {
  const t = useTranslations("dashboard.design");
  const profile = useProfileStore((s) => s.profile);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const uploadAvatar = useProfileStore((s) => s.uploadAvatar);
  const theme = useThemeStore((s) => s.theme);
  const updateTheme = useThemeStore((s) => s.updateTheme);
  const uploadHeroImage = useThemeStore((s) => s.uploadHeroImage);
  const removeHeroImage = useThemeStore((s) => s.removeHeroImage);
  const isPro = useSubscriptionStore((s) => s.isPro);

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [heroUploading, setHeroUploading] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const heroInputRef = useRef<HTMLInputElement>(null);

  if (!theme) return null;

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!AVATAR_ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Please upload a JPEG, PNG, WebP, or GIF image");
      return;
    }
    if (file.size > AVATAR_MAX_SIZE) {
      toast.error("Image must be smaller than 2MB");
      return;
    }
    setAvatarUploading(true);
    try {
      const url = await uploadAvatar(file);
      if (url) toast.success("Photo updated");
      else toast.error("Failed to upload photo");
    } catch {
      toast.error("Failed to upload photo");
    } finally {
      setAvatarUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleHeroChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!HERO_ACCEPTED_TYPES.includes(file.type)) {
      toast.error("Please upload a JPEG, PNG, or WebP image");
      return;
    }
    if (file.size > HERO_MAX_SIZE) {
      toast.error("Image must be smaller than 5MB");
      return;
    }
    setHeroUploading(true);
    try {
      const url = await uploadHeroImage(file);
      if (url) toast.success("Hero image updated");
      else toast.error("Failed to upload hero image");
    } catch {
      toast.error("Failed to upload hero image");
    } finally {
      setHeroUploading(false);
      if (heroInputRef.current) heroInputRef.current.value = "";
    }
  }

  async function handleHeroRemove() {
    await removeHeroImage();
    toast.success("Hero image removed");
  }

  const initials = (profile?.display_name || profile?.username || "?")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6">

      {/* ── Profile Image ── */}
      <section className="bg-white p-6 rounded-2xl border border-zinc-100">
        <h2 className="text-lg font-bold text-zinc-900 mb-6">{t("profileImage")}</h2>

        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <Avatar className="size-20 ring-2 ring-white shadow-md">
              <AvatarImage
                src={profile?.avatar_url ?? undefined}
                alt={profile?.display_name ?? "Avatar"}
              />
              <AvatarFallback className="text-lg bg-gradient-to-br from-[#FF6B35] to-[#E8501A] text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <Camera className="size-5 text-white" />
            </button>
          </div>
          <div className="flex-1 space-y-2">
            <p className="text-sm font-medium text-zinc-900">{t("editImage")}</p>
            <p className="text-xs text-zinc-500">{t("profileImageDesc") || "JPEG, PNG, WebP or GIF. Max 2MB."}</p>
            <Button
              type="button"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="gap-1.5 text-white font-semibold"
              style={{ background: "linear-gradient(135deg, #FF6B35, #E8501A)" }}
            >
              <Camera className="size-3.5" />
              {avatarUploading ? t("uploading") : t("editImage")}
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={AVATAR_ACCEPTED_TYPES.join(",")}
            className="sr-only"
            onChange={handleAvatarChange}
          />
        </div>

        {/* Avatar shape */}
        <div className="space-y-2.5 pt-5 mt-5 border-t border-zinc-100">
          <p className="text-xs font-medium text-zinc-500">{t("avatarShape")}</p>
          <ShapePicker
            value={theme.avatar_shape}
            onChange={(v) => updateTheme({ avatar_shape: v as AvatarShape })}
            options={[
              { value: "circle", label: t("circle"), className: "rounded-full" },
              { value: "rounded", label: t("rounded"), className: "rounded-xl" },
              { value: "square", label: t("square"), className: "rounded-sm" },
            ]}
          />
        </div>

        {/* Avatar border */}
        <div className="space-y-2.5 pt-5 mt-5 border-t border-zinc-100">
          <p className="text-xs font-medium text-zinc-500">{t("avatarBorder")}</p>
          <BorderPicker
            value={theme.avatar_border}
            onChange={(v) => updateTheme({ avatar_border: v as AvatarBorder })}
            isPro={isPro}
            onUpgrade={() => setUpgradeOpen(true)}
            options={[
              { value: "none", label: t("noneBorder"), style: "" },
              { value: "subtle", label: t("subtle"), style: "ring-1 ring-black/10" },
              { value: "solid", label: t("solidBorder"), style: "ring-2 ring-black/20" },
              { value: "thick", label: t("thick"), style: "ring-[3px] ring-black/30", proOnly: true },
              { value: "glow", label: t("glow"), style: "shadow-[0_0_12px_rgba(255,107,53,0.5)]", proOnly: true },
            ]}
          />
        </div>
      </section>

      {/* ── Layout ── */}
      <section className="bg-white p-6 rounded-2xl border border-zinc-100">
        <h2 className="text-lg font-bold text-zinc-900 mb-6">{t("profileLayout")}</h2>

        <div className="grid grid-cols-2 gap-3">
          {/* Classic layout preview — centered avatar, name, bio, links */}
          <button
            type="button"
            onClick={() => updateTheme({ profile_layout: "classic" as ProfileLayout })}
            className={cn(
              "relative rounded-xl border-2 p-3 transition-all text-left",
              theme.profile_layout === "classic"
                ? "border-[#FF6B35] bg-orange-50/50 shadow-sm"
                : "border-border hover:border-[#FF6B35]/40"
            )}
          >
            <div className="flex flex-col items-center gap-1.5 py-2">
              <div className="size-8 rounded-full bg-[#FF6B35]/20" />
              <div className="h-1.5 w-12 rounded-full bg-zinc-300" />
              <div className="h-1 w-16 rounded-full bg-zinc-200" />
              <div className="w-full space-y-1.5 mt-2">
                <div className="h-3 w-full rounded-full bg-zinc-200/80" />
                <div className="h-3 w-full rounded-full bg-zinc-200/60" />
                <div className="h-3 w-full rounded-full bg-zinc-200/40" />
              </div>
            </div>
            <p className={cn(
              "text-[11px] font-medium mt-2 text-center",
              theme.profile_layout === "classic" ? "text-[#FF6B35]" : "text-muted-foreground"
            )}>
              {t("classic")}
            </p>
          </button>

          {/* Hero layout preview — large banner, overlapping avatar, bold header */}
          <button
            type="button"
            onClick={() => {
              if (!isPro) { setUpgradeOpen(true); return; }
              updateTheme({ profile_layout: "hero" as ProfileLayout });
            }}
            className={cn(
              "relative rounded-xl border-2 p-3 transition-all text-left overflow-hidden",
              theme.profile_layout === "hero"
                ? "border-[#FF6B35] bg-orange-50/50 shadow-sm"
                : "border-border hover:border-[#FF6B35]/40"
            )}
          >
            <div className="flex flex-col items-center">
              {/* Banner area */}
              <div className="w-full h-10 rounded-lg bg-gradient-to-br from-[#FF6B35]/30 to-[#8B5CF6]/20 -mx-1" />
              {/* Overlapping avatar */}
              <div className="size-9 rounded-full bg-[#FF6B35]/25 -mt-5 ring-[3px] ring-white shadow-sm" />
              <div className="h-2 w-14 rounded-full bg-zinc-300 mt-1.5" />
              <div className="h-1 w-10 rounded-full bg-zinc-200 mt-1" />
              <div className="w-full space-y-1.5 mt-2">
                <div className="h-3 w-full rounded-full bg-zinc-200/80" />
                <div className="h-3 w-full rounded-full bg-zinc-200/60" />
              </div>
            </div>
            <p className={cn(
              "text-[11px] font-medium mt-2 text-center flex items-center justify-center gap-1",
              theme.profile_layout === "hero" ? "text-[#FF6B35]" : "text-muted-foreground"
            )}>
              {t("hero")}
              {!isPro && <Crown className="size-3 text-amber-500" />}
            </p>
          </button>
        </div>
      </section>

      {/* ── Hero Image (only when hero layout selected) ── */}
      {theme.profile_layout === "hero" && (
        <section className="bg-white p-6 rounded-2xl border border-zinc-100">
          <h2 className="text-lg font-bold text-zinc-900 mb-4">{t("heroImage")}</h2>

          {theme.hero_image_url ? (
            <div className="space-y-3">
              <div className="relative w-full aspect-[2/1] rounded-xl overflow-hidden bg-zinc-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={theme.hero_image_url}
                  alt="Hero"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => heroInputRef.current?.click()}
                  disabled={heroUploading}
                  className="flex-1 gap-1.5 text-white font-semibold"
                  style={{ background: "linear-gradient(135deg, #FF6B35, #E8501A)" }}
                >
                  <ImagePlus className="size-3.5" />
                  {heroUploading ? t("uploading") : t("uploadHeroImage")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={handleHeroRemove}
                  disabled={heroUploading}
                  className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="size-3.5" />
                  {t("removeHeroImage")}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => heroInputRef.current?.click()}
                disabled={heroUploading}
                className="w-full aspect-[2/1] rounded-xl border-2 border-dashed border-zinc-200 hover:border-[#FF6B35]/40 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer"
              >
                <ImagePlus className="size-8 text-zinc-300" />
                <span className="text-sm font-medium text-zinc-400">
                  {heroUploading ? t("uploading") : t("uploadHeroImage")}
                </span>
                <span className="text-xs text-zinc-400">{t("heroImageDesc")}</span>
              </button>
            </div>
          )}

          <input
            ref={heroInputRef}
            type="file"
            accept={HERO_ACCEPTED_TYPES.join(",")}
            className="sr-only"
            onChange={handleHeroChange}
          />
        </section>
      )}

      {/* ── Title & Display ── */}
      <section className="bg-white p-6 rounded-2xl border border-zinc-100">
        <h2 className="text-lg font-bold text-zinc-900 mb-6">{t("title")}</h2>

        <div className="space-y-5">
          {/* Display name input */}
          <div className="space-y-1.5">
            <Input
              id="header-title"
              value={profile?.display_name ?? ""}
              onChange={(e) => updateProfile({ display_name: e.target.value.trim() || null })}
              placeholder={t("yourName")}
              maxLength={100}
              className="bg-white border-zinc-200 focus-visible:ring-[#FF6B35]/30"
            />
          </div>

          {/* Title style */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-zinc-500">{t("titleStyle")}</p>
            <ToggleGroup
              options={[
                { value: "text" as TitleStyle, label: t("textStyle") },
                { value: "logo" as TitleStyle, label: !isPro ? `${t("logoStyle")} ✦` : t("logoStyle") },
              ]}
              value={theme.title_style}
              onChange={(v) => {
                if (v === "logo" && !isPro) { setUpgradeOpen(true); return; }
                updateTheme({ title_style: v });
              }}
            />
          </div>

          {/* Title size */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-zinc-500">{t("titleSizeLabel")}</p>
            <ToggleGroup
              options={[
                { value: "small" as TitleSize, label: t("small") },
                { value: "large" as TitleSize, label: t("large") },
              ]}
              value={theme.title_size}
              onChange={(v) => updateTheme({ title_size: v })}
            />
          </div>

          {/* Title color */}
          <ColorInput
            id="title-color"
            label={t("titleColor")}
            value={theme.title_color ?? theme.text_color}
            onChange={(v) => updateTheme({ title_color: v })}
          />
        </div>
      </section>

      {/* ── Visibility ── */}
      <section className="bg-white p-6 rounded-2xl border border-zinc-100">
        <h2 className="text-lg font-bold text-zinc-900 mb-4">{t("visibility") || "Visibility"}</h2>

        <div className="flex items-center justify-between rounded-xl bg-zinc-50 border border-zinc-100 p-4">
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-zinc-900">{t("hideBio")}</p>
            <p className="text-xs text-zinc-500">{t("hideBioDesc")}</p>
          </div>
          <Switch
            checked={theme.hide_bio}
            onCheckedChange={(v) => updateTheme({ hide_bio: v })}
          />
        </div>
      </section>

      <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </div>
  );
}
