"use client";

import React, { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Plus,
  Camera,
  Trash2,
  Pencil,
  Share2,
  ExternalLink,
  Circle,
  RectangleHorizontal,
  LayoutGrid,
  BarChart3,
  GripVertical,
} from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toast } from "sonner";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { LinkList } from "@/components/dashboard/link-list";
import { useLinkStore } from "@/lib/stores/link-store";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useSocialStore } from "@/lib/stores/social-store";
import { LinkFormDialog } from "@/components/dashboard/link-form-dialog";
import { AddContentModal } from "@/components/dashboard/add-content-modal";
import { SmartSocialLinkInput } from "@/components/dashboard/smart-social-link-input";
import { ProfileEditDialog } from "@/components/dashboard/profile-edit-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { getIconForPlatform, getPlatformLabel } from "@/lib/social-icon-map";
import { AVATAR_MAX_SIZE, AVATAR_ACCEPTED_TYPES } from "@/lib/constants";
import { BrandIcon } from "@/components/ui/brand-icon";
import { cn } from "@/lib/utils";
import { useLinkClickCounts } from "@/lib/hooks/use-link-click-counts";
import { LinkInsightsModal } from "@/components/dashboard/link-insights-modal";
import type { SocialIcon, SocialPlatform, SocialDisplayMode, Link } from "@/types";

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

function CompactProfileHeader({ onEditProfile }: { onEditProfile: () => void }) {
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

      {/* Name + bio (clickable to edit) + social icons */}
      <div className="flex-1 min-w-0 pt-1">
        <button
          type="button"
          onClick={onEditProfile}
          className="text-left w-full group"
        >
          <h2 className="text-base font-bold text-foreground leading-tight truncate group-hover:text-primary transition-colors cursor-pointer">
            {profile?.display_name || profile?.username || "Your Name"}
          </h2>
          {profile?.bio ? (
            <p className="text-sm text-muted-foreground leading-snug mt-0.5 line-clamp-2 group-hover:text-foreground/70 transition-colors cursor-pointer">
              {profile.bio}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground/40 leading-snug mt-0.5 italic cursor-pointer">
              + Add bio
            </p>
          )}
        </button>

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
  return (
    <BrandIcon
      platform={icon.platform}
      size={28}
      iconSize={14}
      rounded="rounded-full"
      className="transition-transform hover:scale-110 cursor-default"
    />
  );
}

// ---------------------------------------------------------------------------
// Social icon card (editable row in the social links section)
// ---------------------------------------------------------------------------

function SocialIconCard({
  icon,
  clickCount,
  onOpenInsights,
}: {
  icon: SocialIcon;
  clickCount: number;
  onOpenInsights: (id: string) => void;
}) {
  const tSmart = useTranslations("dashboard.smartInput");
  const tLinks = useTranslations("dashboard.links");
  const toggleSocialIcon = useSocialStore((s) => s.toggleSocialIcon);
  const deleteSocialIcon = useSocialStore((s) => s.deleteSocialIcon);
  const updateSocialIcon = useSocialStore((s) => s.updateSocialIcon);
  const [editing, setEditing] = useState(false);
  const [urlValue, setUrlValue] = useState(icon.url);
  const [titleValue, setTitleValue] = useState(icon.display_title || "");

  const label = getPlatformLabel(icon.platform);

  function truncateUrl(url: string): string {
    try {
      const { host, pathname } = new URL(url);
      const path =
        pathname.length > 25 ? pathname.slice(0, 25) + "..." : pathname;
      return `${host}${path}`;
    } catch {
      return url.length > 40 ? url.slice(0, 40) + "..." : url;
    }
  }

  async function handleSaveUrl() {
    if (urlValue.trim() && urlValue !== icon.url) {
      await updateSocialIcon(icon.id, { url: urlValue.trim() });
      toast.success("URL updated");
    }
    setEditing(false);
  }

  async function handleDisplayModeChange(mode: SocialDisplayMode) {
    await updateSocialIcon(icon.id, { display_mode: mode });
  }

  async function handleSaveTitle() {
    const newTitle = titleValue.trim() || null;
    if (newTitle !== icon.display_title) {
      await updateSocialIcon(icon.id, { display_title: newTitle });
    }
  }

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: icon.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-2xl bg-white border border-border/60 shadow-sm",
        isDragging && "shadow-lg opacity-80 z-50"
      )}
    >
      <div className="flex items-center gap-3 p-3.5">
        {/* Drag handle */}
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing touch-none text-muted-foreground/40 hover:text-muted-foreground transition-colors shrink-0 -ml-1"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>

        {/* Platform icon with brand colors */}
        <BrandIcon platform={icon.platform} size={36} iconSize={18} />

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-foreground">{label}</p>
            {/* Display mode indicator */}
            <span className="text-[10px] font-medium text-muted-foreground bg-muted rounded px-1.5 py-0.5">
              {icon.display_mode === "button"
                ? tSmart("displayButton")
                : icon.display_mode === "grid"
                  ? tSmart("displayGrid")
                  : tSmart("displayIcon")}
            </span>
          </div>
          {editing ? (
            <input
              type="text"
              value={urlValue}
              onChange={(e) => setUrlValue(e.target.value)}
              onBlur={handleSaveUrl}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveUrl();
                if (e.key === "Escape") {
                  setUrlValue(icon.url);
                  setEditing(false);
                }
              }}
              className="w-full text-xs text-muted-foreground bg-muted/50 rounded px-2 py-1 mt-0.5 outline-none focus:ring-1 focus:ring-primary/30"
              autoFocus
            />
          ) : (
            <div className="flex items-center gap-1 mt-0.5">
              <p className="text-xs text-muted-foreground truncate">
                {truncateUrl(icon.url)}
              </p>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="shrink-0 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              >
                <Pencil className="size-2.5" />
              </button>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <Switch
            checked={icon.is_active}
            onCheckedChange={() => toggleSocialIcon(icon.id)}
          />
        </div>
      </div>

      {/* Display mode toggle + title */}
      <div className="px-3.5 pb-2.5 space-y-2">
        {/* Display mode toggle */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            {tSmart("displayAs")}
          </span>
          <div className="flex rounded-md border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => handleDisplayModeChange("icon")}
              className={cn(
                "flex items-center gap-1 px-2 py-1 text-[10px] font-medium transition-colors",
                icon.display_mode === "icon"
                  ? "bg-foreground text-white"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <Circle className="size-3" />
              {tSmart("displayIcon")}
            </button>
            <button
              type="button"
              onClick={() => handleDisplayModeChange("button")}
              className={cn(
                "flex items-center gap-1 px-2 py-1 text-[10px] font-medium transition-colors",
                icon.display_mode === "button"
                  ? "bg-foreground text-white"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <RectangleHorizontal className="size-3" />
              {tSmart("displayButton")}
            </button>
            <button
              type="button"
              onClick={() => handleDisplayModeChange("grid")}
              className={cn(
                "flex items-center gap-1 px-2 py-1 text-[10px] font-medium transition-colors",
                icon.display_mode === "grid"
                  ? "bg-foreground text-white"
                  : "text-muted-foreground hover:bg-muted"
              )}
            >
              <LayoutGrid className="size-3" />
              {tSmart("displayGrid")}
            </button>
          </div>
        </div>

        {/* Button title input (only when button mode) */}
        {icon.display_mode === "button" && (
          <input
            type="text"
            value={titleValue}
            onChange={(e) => setTitleValue(e.target.value)}
            onBlur={handleSaveTitle}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSaveTitle();
            }}
            placeholder={label}
            className="w-full text-xs text-foreground bg-muted/40 border border-border/50 rounded-lg px-3 py-1.5 outline-none focus:ring-1 focus:ring-primary/30 placeholder:text-muted-foreground/50"
          />
        )}
      </div>

      {/* Bottom action bar */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-t border-border/40">
        <div className="flex items-center gap-1">
          <a
            href={icon.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground/40 hover:text-muted-foreground transition-colors p-1"
          >
            <ExternalLink className="size-3.5" />
          </a>
          <button
            type="button"
            onClick={() => onOpenInsights(icon.id)}
            className={cn(
              "inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-colors",
              clickCount > 0
                ? "bg-orange-50 border-orange-300 text-orange-600 hover:bg-[#FF6B35] hover:text-white hover:border-[#FF6B35]"
                : "bg-slate-50 border-slate-200 text-muted-foreground hover:bg-slate-100 hover:border-slate-300"
            )}
            title={tSmart("displayIcon")}
          >
            <BarChart3 className="size-3" />
            {clickCount === 1
              ? tLinks("clickSingular")
              : clickCount === 0
                ? tLinks("clicksZero")
                : tLinks("clicks", { count: clickCount })}
          </button>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={async () => {
            await deleteSocialIcon(icon.id);
            toast.success("Social link removed");
          }}
          className="size-7 text-muted-foreground/40 hover:text-destructive"
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Social icons list section
// ---------------------------------------------------------------------------

function SocialIconsList() {
  const socialIcons = useSocialStore((s) => s.socialIcons);
  const reorderSocialIcons = useSocialStore((s) => s.reorderSocialIcons);
  const tLinks = useTranslations("dashboard.links");
  const { counts } = useLinkClickCounts();

  // Insights modal state
  const [insightsOpen, setInsightsOpen] = useState(false);
  const [selectedIconId, setSelectedIconId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderSocialIcons(String(active.id), String(over.id));
    }
  }

  // Build a Link-shaped object for the modal (it expects a Link)
  const selectedIcon = selectedIconId
    ? socialIcons.find((i) => i.id === selectedIconId)
    : null;
  const selectedLink: Link | null = selectedIcon
    ? {
        id: selectedIcon.id,
        user_id: selectedIcon.user_id,
        title: getPlatformLabel(selectedIcon.platform),
        url: selectedIcon.url,
        thumbnail_url: null,
        position: selectedIcon.position,
        is_active: selectedIcon.is_active,
        created_at: "",
        updated_at: "",
      }
    : null;

  function handleOpenInsights(iconId: string) {
    setSelectedIconId(iconId);
    setInsightsOpen(true);
  }

  if (socialIcons.length === 0) return null;

  const sorted = [...socialIcons].sort((a, b) => a.position - b.position);

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Share2 className="size-3.5 text-muted-foreground" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {tLinks("socialLinks")}
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sorted.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {sorted.map((icon) => (
                <SocialIconCard
                  key={icon.id}
                  icon={icon}
                  clickCount={counts[icon.id] ?? 0}
                  onOpenInsights={handleOpenInsights}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </div>

      <LinkInsightsModal
        open={insightsOpen}
        onOpenChange={setInsightsOpen}
        link={selectedLink}
      />
    </>
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

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [linkFormOpen, setLinkFormOpen] = useState(false);
  const [smartInputOpen, setSmartInputOpen] = useState(false);
  const [smartInputPlatform, setSmartInputPlatform] =
    useState<SocialPlatform | null>(null);
  const [profileEditOpen, setProfileEditOpen] = useState(false);

  const isLoading = profileLoading || linksLoading || socialLoading;

  if (isLoading) {
    return <ContentSkeleton />;
  }

  return (
    <div className="max-w-[680px] mx-auto px-4 py-6 space-y-5">
      {/* ── Top bar: Links tab ── */}
      <div className="flex items-center">
        <div className="flex items-center gap-5">
          <button
            type="button"
            className="text-base font-bold text-foreground border-b-2 border-foreground pb-0.5"
          >
            {t("linksTab")}
          </button>
        </div>
      </div>

      {/* ── Compact profile section (click name/bio to edit) ── */}
      <CompactProfileHeader onEditProfile={() => setProfileEditOpen(true)} />

      {/* ── Big purple "+ Add" button ── */}
      <button
        type="button"
        onClick={() => setAddModalOpen(true)}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full text-white font-semibold text-sm transition-all hover:opacity-90 active:scale-[0.98]"
        style={{
          background: "linear-gradient(135deg, #8B5CF6, #7C3AED)",
        }}
      >
        <Plus className="size-4" strokeWidth={2.5} />
        {t("addLink")}
      </button>

      {/* ── Social icons management section ── */}
      <SocialIconsList />

      {/* ── Link list (drag-and-drop cards) ── */}
      <LinkList />

      {/* ── Modals ── */}

      {/* Add content modal (the popup with categories + platforms) */}
      <AddContentModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onOpenLinkForm={() => setLinkFormOpen(true)}
        onOpenSmartInput={(platform) => {
          setSmartInputPlatform(platform);
          setSmartInputOpen(true);
        }}
      />

      {/* Standard link form dialog */}
      <LinkFormDialog open={linkFormOpen} onOpenChange={setLinkFormOpen} />

      {/* Smart social link input */}
      <SmartSocialLinkInput
        open={smartInputOpen}
        onOpenChange={setSmartInputOpen}
        platform={smartInputPlatform}
        onBack={() => setAddModalOpen(true)}
      />

      {/* Profile title/bio edit dialog */}
      <ProfileEditDialog
        open={profileEditOpen}
        onOpenChange={setProfileEditOpen}
      />
    </div>
  );
}
