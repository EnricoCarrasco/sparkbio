"use client";

import React, { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Camera, Crown, User, LayoutTemplate, Type, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useThemeStore } from "@/lib/stores/theme-store";
import { useSubscriptionStore } from "@/lib/stores/subscription-store";
import { UpgradeDialog } from "@/components/billing/upgrade-dialog";
import { AVATAR_MAX_SIZE, AVATAR_ACCEPTED_TYPES } from "@/lib/constants";
import { ToggleGroup } from "./toggle-group";
import { ColorInput } from "./color-input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type { ProfileLayout, TitleSize, TitleStyle, AvatarShape, AvatarBorder } from "@/types";

// ---------------------------------------------------------------------------
// Section card wrapper — matches the ContentTab visual language
// ---------------------------------------------------------------------------

function SectionCard({
  icon,
  title,
  children,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-border/60 shadow-sm overflow-hidden", className)}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border/40">
        <span className="text-muted-foreground">{icon}</span>
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {title}
        </h4>
      </div>
      <div className="p-4 space-y-4">
        {children}
      </div>
    </div>
  );
}

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
// HeaderPanel — redesigned with visual cards and previews
// ---------------------------------------------------------------------------

export function HeaderPanel() {
  const t = useTranslations("dashboard.design");
  const profile = useProfileStore((s) => s.profile);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const uploadAvatar = useProfileStore((s) => s.uploadAvatar);
  const theme = useThemeStore((s) => s.theme);
  const updateTheme = useThemeStore((s) => s.updateTheme);
  const isPro = useSubscriptionStore((s) => s.isPro);

  const [avatarUploading, setAvatarUploading] = useState(false);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const initials = (profile?.display_name || profile?.username || "?")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-4">

      {/* ── Profile Image Card ── */}
      <SectionCard
        icon={<Camera className="size-4" />}
        title={t("profileImage")}
        className="bg-orange-50/50"
      >
        <div className="flex items-center gap-4">
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
            <p className="text-sm font-medium text-foreground">{t("editImage")}</p>
            <p className="text-xs text-muted-foreground">{t("profileImageDesc") || "JPEG, PNG, WebP or GIF. Max 2MB."}</p>
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

        {/* Avatar shape — visual shape previews */}
        <div className="space-y-2.5 pt-2 border-t border-border/40">
          <p className="text-xs font-medium text-muted-foreground">{t("avatarShape")}</p>
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

        {/* Avatar border — visual border previews */}
        <div className="space-y-2.5 pt-2 border-t border-border/40">
          <p className="text-xs font-medium text-muted-foreground">{t("avatarBorder")}</p>
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
      </SectionCard>

      {/* ── Layout Card ── */}
      <SectionCard
        icon={<LayoutTemplate className="size-4" />}
        title={t("profileLayout")}
        className="bg-white"
      >
        <div className="grid grid-cols-2 gap-3">
          {/* Classic layout preview */}
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
            <div className="flex flex-col items-center gap-1.5">
              <div className="size-6 rounded-full bg-muted" />
              <div className="h-1.5 w-10 rounded bg-muted" />
              <div className="h-1 w-14 rounded bg-muted/60" />
              <div className="w-full space-y-1 mt-1">
                <div className="h-2.5 w-full rounded-full bg-muted/80" />
                <div className="h-2.5 w-full rounded-full bg-muted/60" />
              </div>
            </div>
            <p className={cn(
              "text-[11px] font-medium mt-2 text-center",
              theme.profile_layout === "classic" ? "text-[#FF6B35]" : "text-muted-foreground"
            )}>
              {t("classic")}
            </p>
          </button>

          {/* Hero layout preview */}
          <button
            type="button"
            onClick={() => {
              if (!isPro) { setUpgradeOpen(true); return; }
              updateTheme({ profile_layout: "hero" as ProfileLayout });
            }}
            className={cn(
              "relative rounded-xl border-2 p-3 transition-all text-left",
              theme.profile_layout === "hero"
                ? "border-[#FF6B35] bg-orange-50/50 shadow-sm"
                : "border-border hover:border-[#FF6B35]/40"
            )}
          >
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-full h-6 rounded bg-muted/80" />
              <div className="size-5 rounded-full bg-muted -mt-3 ring-2 ring-white" />
              <div className="h-1.5 w-10 rounded bg-muted" />
              <div className="w-full space-y-1 mt-0.5">
                <div className="h-2.5 w-full rounded-full bg-muted/80" />
                <div className="h-2.5 w-full rounded-full bg-muted/60" />
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
      </SectionCard>

      {/* ── Title & Display Card ── */}
      <SectionCard
        icon={<Type className="size-4" />}
        title={t("title")}
        className="bg-orange-50/30"
      >
        {/* Display name input */}
        <div className="space-y-1.5">
          <Input
            id="header-title"
            value={profile?.display_name ?? ""}
            onChange={(e) => updateProfile({ display_name: e.target.value.trim() || null })}
            placeholder={t("yourName")}
            maxLength={100}
            className="bg-white border-border/60 focus-visible:ring-[#FF6B35]/30"
          />
        </div>

        {/* Title style */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">{t("titleStyle")}</p>
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
          <p className="text-xs font-medium text-muted-foreground">{t("titleSizeLabel")}</p>
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
      </SectionCard>

      {/* ── Visibility Card ── */}
      <SectionCard
        icon={<EyeOff className="size-4" />}
        title={t("visibility") || "Visibility"}
        className="bg-white"
      >
        <div className="flex items-center justify-between rounded-xl bg-orange-50 border border-border/40 p-3.5">
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-foreground">{t("hideBio")}</p>
            <p className="text-xs text-muted-foreground">{t("hideBioDesc")}</p>
          </div>
          <Switch
            checked={theme.hide_bio}
            onCheckedChange={(v) => updateTheme({ hide_bio: v })}
          />
        </div>
      </SectionCard>

      <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </div>
  );
}
