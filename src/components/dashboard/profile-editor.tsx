"use client";

import React, { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Camera, User } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "@/components/ui/avatar";
import { useProfileStore } from "@/lib/stores/profile-store";
import { AVATAR_MAX_SIZE, AVATAR_ACCEPTED_TYPES } from "@/lib/constants";

const BIO_MAX_LENGTH = 300;

export function ProfileEditor() {
  const t = useTranslations("dashboard.profile");
  const profile = useProfileStore((s) => s.profile);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const uploadAvatar = useProfileStore((s) => s.uploadAvatar);

  const [displayName, setDisplayName] = useState(
    profile?.display_name ?? ""
  );
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Keep local state in sync if profile changes externally (initial load)
  React.useEffect(() => {
    setDisplayName(profile?.display_name ?? "");
    setBio(profile?.bio ?? "");
  }, [profile?.id]);

  async function handleSave() {
    setSaving(true);
    try {
      await updateProfile({
        display_name: displayName.trim() || null,
        bio: bio.trim() || null,
      });
      toast.success("Profile saved");
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

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
      if (url) {
        toast.success("Photo updated");
      } else {
        toast.error("Failed to upload photo");
      }
    } catch {
      toast.error("Failed to upload photo");
    } finally {
      setAvatarUploading(false);
      // Reset input so the same file can be re-selected after an error
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  const initials = (profile?.display_name || profile?.username || "?")
    .slice(0, 2)
    .toUpperCase();

  const bioRemaining = BIO_MAX_LENGTH - bio.length;

  return (
    <div className="p-6 border border-border rounded-xl bg-white space-y-5">
      <h2 className="text-base font-semibold text-foreground">{t("title")}</h2>

      {/* Avatar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative">
          <Avatar
            className="size-20"
            style={
              { "--avatar-size": "5rem" } as React.CSSProperties
            }
          >
            <AvatarImage
              src={profile?.avatar_url ?? undefined}
              alt={profile?.display_name ?? profile?.username ?? "Avatar"}
            />
            <AvatarFallback className="text-lg">{initials}</AvatarFallback>
          </Avatar>

          {/* Upload overlay button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarUploading}
            aria-label={t("avatarUpload")}
            className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 hover:opacity-100 focus-visible:opacity-100 transition-opacity disabled:cursor-not-allowed"
          >
            <Camera className="size-5 text-white" />
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-foreground">
            {t("avatar")}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarUploading}
          >
            {avatarUploading ? "Uploading…" : t("avatarUpload")}
          </Button>
          <span className="text-xs text-muted-foreground">
            JPEG, PNG, WebP or GIF · max 2 MB
          </span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={AVATAR_ACCEPTED_TYPES.join(",")}
          className="sr-only"
          onChange={handleAvatarChange}
        />
      </div>

      {/* Display name */}
      <div className="space-y-1.5">
        <Label htmlFor="display-name">{t("displayName")}</Label>
        <Input
          id="display-name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder={t("displayNamePlaceholder")}
          maxLength={100}
        />
      </div>

      {/* Bio */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor="bio">{t("bio")}</Label>
          <span
            className={`text-xs tabular-nums ${
              bioRemaining < 20
                ? "text-destructive"
                : "text-muted-foreground"
            }`}
          >
            {bioRemaining}
          </span>
        </div>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value.slice(0, BIO_MAX_LENGTH))}
          placeholder={t("bioPlaceholder")}
          rows={3}
          className="resize-none"
        />
      </div>

      <Button
        onClick={handleSave}
        disabled={saving}
        className="bg-[#FF6B35] hover:bg-[#e55a25] text-white border-transparent"
      >
        {saving ? "Saving…" : t("save")}
      </Button>
    </div>
  );
}
