"use client";

import React, { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Plus,
  Sparkles,
  FolderPlus,
  Archive,
  ChevronRight,
  Camera,
} from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LinkList } from "@/components/dashboard/link-list";
import { useLinkStore } from "@/lib/stores/link-store";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useSocialStore } from "@/lib/stores/social-store";
import { LinkFormDialog } from "@/components/dashboard/link-form-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { getIconForPlatform } from "@/lib/social-icon-map";
import { AVATAR_MAX_SIZE, AVATAR_ACCEPTED_TYPES } from "@/lib/constants";
import type { SocialIcon } from "@/types";

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function ContentSkeleton() {
  return (
    <div className="max-w-[680px] mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center gap-6">
        <Skeleton className="h-5 w-12" />
        <Skeleton className="h-5 w-10" />
        <div className="ml-auto flex gap-2">
          <Skeleton className="h-8 w-24 rounded-full" />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Skeleton className="size-16 rounded-full" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
      </div>
      <Skeleton className="h-12 w-full rounded-full" />
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Compact profile header (Linktree-style inline)
// ---------------------------------------------------------------------------

function CompactProfileHeader() {
  const profile = useProfileStore((s) => s.profile);
  const uploadAvatar = useProfileStore((s) => s.uploadAvatar);
  const socialIcons = useSocialStore((s) => s.socialIcons);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = (profile?.display_name || profile?.username || "?")
    .slice(0, 2)
    .toUpperCase();

  const activeSocials = socialIcons
    .filter((s) => s.is_active)
    .sort((a, b) => a.position - b.position);

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

  return (
    <div className="flex items-start gap-4">
      {/* Avatar with click-to-upload */}
      <div className="relative shrink-0">
        <Avatar className="size-[72px]">
          <AvatarImage
            src={profile?.avatar_url ?? undefined}
            alt={profile?.display_name ?? "Avatar"}
          />
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={avatarUploading}
          className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
        >
          <Camera className="size-4 text-white" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={AVATAR_ACCEPTED_TYPES.join(",")}
          className="sr-only"
          onChange={handleAvatarChange}
        />
      </div>

      {/* Name + bio + social icons */}
      <div className="flex-1 min-w-0 pt-1">
        <h2 className="text-base font-bold text-foreground leading-tight truncate">
          {profile?.display_name || profile?.username || "Your Name"}
        </h2>
        {profile?.bio && (
          <p className="text-sm text-muted-foreground leading-snug mt-0.5 line-clamp-2">
            {profile.bio}
          </p>
        )}

        {/* Social icons row */}
        {activeSocials.length > 0 && (
          <div className="flex items-center gap-1.5 mt-2">
            {activeSocials.slice(0, 5).map((icon) => (
              <SocialIconBubble key={icon.id} icon={icon} />
            ))}
            {activeSocials.length > 5 && (
              <span className="text-[11px] text-muted-foreground font-medium">
                +{activeSocials.length - 5}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function SocialIconBubble({ icon }: { icon: SocialIcon }) {
  const IconComponent = getIconForPlatform(icon.platform);
  return (
    <div className="flex items-center justify-center size-7 rounded-full bg-muted text-muted-foreground hover:bg-foreground hover:text-white transition-colors cursor-default">
      <IconComponent size={13} strokeWidth={2} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main content tab
// ---------------------------------------------------------------------------

export function ContentTab() {
  const t = useTranslations("dashboard.design");
  const tLinks = useTranslations("dashboard.links");
  const profileLoading = useProfileStore((s) => s.loading);
  const linksLoading = useLinkStore((s) => s.loading);
  const socialLoading = useSocialStore((s) => s.loading);

  const [addOpen, setAddOpen] = useState(false);

  const isLoading = profileLoading || linksLoading || socialLoading;

  if (isLoading) {
    return <ContentSkeleton />;
  }

  return (
    <div className="max-w-[680px] mx-auto px-4 py-6 space-y-5">
      {/* ── Top bar: Links tab + Enhance button ── */}
      <div className="flex items-center">
        <div className="flex items-center gap-5">
          <button
            type="button"
            className="text-base font-bold text-foreground border-b-2 border-foreground pb-0.5"
          >
            {t("linksTab")}
          </button>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full gap-1.5 text-xs font-medium"
          >
            <Sparkles className="size-3.5" />
            {t("enhance")}
          </Button>
        </div>
      </div>

      {/* ── Compact profile section ── */}
      <CompactProfileHeader />

      {/* ── Big purple "+ Add" button ── */}
      <button
        type="button"
        onClick={() => setAddOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
        style={{
          background: "linear-gradient(135deg, #8B5CF6, #7C3AED)",
        }}
      >
        <Plus className="size-4" strokeWidth={2.5} />
        {t("addLink")}
      </button>

      {/* ── Add collection + View archive row ── */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full gap-1.5 text-xs font-medium text-muted-foreground"
        >
          <FolderPlus className="size-3.5" />
          {t("addCollection")}
        </Button>
        <button
          type="button"
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <Archive className="size-3.5" />
          {t("viewArchive")}
          <ChevronRight className="size-3" />
        </button>
      </div>

      {/* ── Link list (drag-and-drop cards) ── */}
      <LinkList />

      {/* Add link dialog */}
      <LinkFormDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
