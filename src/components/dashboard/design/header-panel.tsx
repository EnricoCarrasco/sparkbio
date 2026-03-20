"use client";

import React, { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Camera } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useThemeStore } from "@/lib/stores/theme-store";
import { AVATAR_MAX_SIZE, AVATAR_ACCEPTED_TYPES } from "@/lib/constants";
import { ToggleGroup } from "./toggle-group";
import { ColorInput } from "./color-input";
import { Switch } from "@/components/ui/switch";
import type { ProfileLayout, TitleSize, TitleStyle } from "@/types";

export function HeaderPanel() {
  const t = useTranslations("dashboard.design");
  const profile = useProfileStore((s) => s.profile);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const uploadAvatar = useProfileStore((s) => s.uploadAvatar);
  const theme = useThemeStore((s) => s.theme);
  const updateTheme = useThemeStore((s) => s.updateTheme);

  const [avatarUploading, setAvatarUploading] = useState(false);
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
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-foreground">{t("header")}</h3>

      {/* Profile image */}
      <div className="space-y-2">
        <Label>{t("profileImage")}</Label>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="size-16">
              <AvatarImage
                src={profile?.avatar_url ?? undefined}
                alt={profile?.display_name ?? "Avatar"}
              />
              <AvatarFallback className="text-sm">{initials}</AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={avatarUploading}
              className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 hover:opacity-100 transition-opacity"
            >
              <Camera className="size-4 text-white" />
            </button>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarUploading}
          >
            {avatarUploading ? "Uploading..." : t("editImage")}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept={AVATAR_ACCEPTED_TYPES.join(",")}
            className="sr-only"
            onChange={handleAvatarChange}
          />
        </div>
      </div>

      {/* Profile layout */}
      <div className="space-y-2">
        <Label>{t("profileLayout")}</Label>
        <ToggleGroup
          options={[
            { value: "classic" as ProfileLayout, label: t("classic") },
            { value: "hero" as ProfileLayout, label: t("hero") },
          ]}
          value={theme.profile_layout}
          onChange={(v) => updateTheme({ profile_layout: v })}
        />
      </div>

      {/* Title (display name) */}
      <div className="space-y-1.5">
        <Label htmlFor="header-title">{t("title")}</Label>
        <Input
          id="header-title"
          value={profile?.display_name ?? ""}
          onChange={(e) => updateProfile({ display_name: e.target.value.trim() || null })}
          placeholder="Your name"
          maxLength={100}
        />
      </div>

      {/* Title style */}
      <div className="space-y-2">
        <Label>{t("titleStyle")}</Label>
        <ToggleGroup
          options={[
            { value: "text" as TitleStyle, label: t("textStyle") },
            { value: "logo" as TitleStyle, label: t("logoStyle") },
          ]}
          value={theme.title_style}
          onChange={(v) => updateTheme({ title_style: v })}
        />
      </div>

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
        id="title-color"
        label={t("titleColor")}
        value={theme.title_color ?? theme.text_color}
        onChange={(v) => updateTheme({ title_color: v })}
      />
    </div>
  );
}
