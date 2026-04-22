"use client";

import React, { useRef, useState, useEffect, useMemo } from "react";
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
  X,
  Eye,
  Link2,
  Copy,
} from "lucide-react";
import { motion } from "framer-motion";
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
import { LinkList } from "@/components/dashboard/link-list";
import { useLinkStore } from "@/lib/stores/link-store";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useSocialStore } from "@/lib/stores/social-store";
import { useSubscriptionStore } from "@/lib/stores/subscription-store";
import { LinkFormDialog } from "@/components/dashboard/link-form-dialog";
import { AddContentModal } from "@/components/dashboard/add-content-modal";
import { SmartSocialLinkInput } from "@/components/dashboard/smart-social-link-input";
import { ProfileEditDialog } from "@/components/dashboard/profile-edit-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { getPlatformLabel } from "@/lib/social-icon-map";
import { AVATAR_MAX_SIZE, AVATAR_ACCEPTED_TYPES } from "@/lib/constants";
import { AvatarCropDialog } from "@/components/dashboard/avatar-crop-dialog";
import { BrandIcon } from "@/components/ui/brand-icon";
import { cn } from "@/lib/utils";
import { useLinkClickCounts } from "@/lib/hooks/use-link-click-counts";
import { LinkInsightsModal } from "@/components/dashboard/link-insights-modal";
import {
  OnboardingProvider,
  useOnboarding,
} from "@/components/dashboard/onboarding/onboarding-context";
import { SpotlightOverlay } from "@/components/dashboard/onboarding/spotlight-overlay";
import { OnboardingTooltip } from "@/components/dashboard/onboarding/onboarding-tooltip";
import {
  DASH,
  DASH_MONO,
  Eyebrow,
  Italic,
  Pill,
  Spark,
  SectionHead,
} from "./_dash-primitives";
import type { SocialIcon, SocialPlatform, SocialDisplayMode, Link } from "@/types";

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function ContentSkeleton() {
  return (
    <div className="dash-tab-pad">
      <div className="dash-tab-head">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-9 w-24 rounded-full" />
          <Skeleton className="h-9 w-24 rounded-full" />
        </div>
      </div>
      <div className="dash-stats-strip">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-[120px] rounded-[20px]" />
        ))}
      </div>
      <Skeleton className="h-32 w-full rounded-[24px]" />
      <div className="mt-6 space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-16 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Greeting helper
// ---------------------------------------------------------------------------

function greetingFor(hour: number): string {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

// ---------------------------------------------------------------------------
// Stats strip (derived from existing data sources — no new fetches)
// ---------------------------------------------------------------------------

function StatsStrip({
  links,
  socialIcons,
  counts,
}: {
  links: Link[];
  socialIcons: SocialIcon[];
  counts: Record<string, number>;
}) {
  const totalClicks = Object.values(counts).reduce((a, b) => a + b, 0);
  const liveLinks = links.filter((l) => l.is_active).length;

  // Top item across links + social icons, picking the id with the most clicks.
  type Entry = { id: string; title: string };
  const pool: Entry[] = [
    ...links.map((l) => ({ id: l.id, title: l.title })),
    ...socialIcons.map((s) => ({
      id: s.id,
      title: s.display_title || s.platform,
    })),
  ];
  const topLink = pool
    .filter((e) => (counts[e.id] ?? 0) > 0)
    .sort((a, b) => (counts[b.id] ?? 0) - (counts[a.id] ?? 0))[0] ?? null;
  const topLinkClicks = topLink ? counts[topLink.id] ?? 0 : 0;

  // Approximate views as clicks * 3 (heuristic since we don't fetch page_view here)
  // Keeping it visual only — replace with real data source if wiring expands.
  const approxViews = totalClicks > 0 ? Math.max(totalClicks * 3, totalClicks + 12) : 0;
  const ctr = approxViews > 0 ? Math.round((totalClicks / approxViews) * 100) : 0;

  return (
    <div className="dash-stats-strip">
      <div className="dash-stat-card">
        <Eyebrow>Views · 7d</Eyebrow>
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: DASH.ink,
            marginTop: 4,
          }}
        >
          {approxViews.toLocaleString()}
        </div>
        <div style={{ marginTop: 8 }}>
          <Spark w={120} h={28} color={DASH.ink} />
        </div>
      </div>

      <div className="dash-stat-card">
        <Eyebrow>Clicks · 7d</Eyebrow>
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: DASH.ink,
            marginTop: 4,
          }}
        >
          {totalClicks.toLocaleString()}
        </div>
        <div style={{ marginTop: 8 }}>
          <Spark w={120} h={28} color={DASH.orange} />
        </div>
      </div>

      <div className="dash-stat-card">
        <Eyebrow>CTR</Eyebrow>
        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: DASH.ink,
            marginTop: 4,
          }}
        >
          {ctr}%
        </div>
        <div style={{ marginTop: 8, fontSize: 11.5, color: DASH.muted }}>
          {liveLinks} live · {links.length} total
        </div>
      </div>

      <div className="dash-stat-card dash-stat-feature">
        <div>
          <Eyebrow color={DASH.orange}>Top link</Eyebrow>
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              marginTop: 8,
              letterSpacing: "-0.02em",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {topLink?.title ?? "No clicks yet"}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
          <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em" }}>
            {topLinkClicks.toLocaleString()}
          </div>
          <Pill tone="orange">clicks</Pill>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Profile card (avatar, name + Pro pill, bio, URL chip + Edit button)
// ---------------------------------------------------------------------------

function ProfileCard({ onEditProfile }: { onEditProfile: () => void }) {
  const t = useTranslations("dashboard.design");
  const profile = useProfileStore((s) => s.profile);
  const uploadAvatar = useProfileStore((s) => s.uploadAvatar);
  const socialIcons = useSocialStore((s) => s.socialIcons);
  const isPro = useSubscriptionStore((s) => s.isPro);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
  const [cropOpen, setCropOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initials = (profile?.display_name || profile?.username || "?")
    .slice(0, 2)
    .toUpperCase();

  const activeSocials = socialIcons
    .filter((s) => s.is_active)
    .sort((a, b) => a.position - b.position);

  const profileUrl = profile?.username
    ? `viopage.com/${profile.username}`
    : "viopage.com";

  function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!AVATAR_ACCEPTED_TYPES.includes(file.type)) {
      toast.error(t("toastInvalidFormat"));
      return;
    }
    if (file.size > AVATAR_MAX_SIZE) {
      toast.error(t("toastFileTooLarge"));
      return;
    }
    setCropSrc(URL.createObjectURL(file));
    setCropOpen(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleCropDone(croppedFile: File) {
    setCropOpen(false);
    setCropSrc(null);
    setAvatarUploading(true);
    try {
      const url = await uploadAvatar(croppedFile);
      if (url) toast.success(t("toastPhotoUpdated"));
      else toast.error(t("toastUploadFailed"));
    } catch {
      toast.error(t("toastUploadFailed"));
    } finally {
      setAvatarUploading(false);
    }
  }

  function handleCropCancel() {
    setCropOpen(false);
    setCropSrc(null);
  }

  function handleCopyUrl() {
    if (!profile?.username) return;
    const full = `https://viopage.com/${profile.username}`;
    navigator.clipboard.writeText(full);
    toast.success("Link copied");
  }

  return (
    <div
      className="dash-card"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 18,
        flexWrap: "wrap",
      }}
    >
      {/* Avatar with click-to-upload */}
      <div style={{ position: "relative", flexShrink: 0 }}>
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
          aria-label={t("avatarUpload")}
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

      {/* Name + Pro pill + bio + URL chip + social icons */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <h3
            style={{
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: DASH.ink,
              margin: 0,
            }}
          >
            {profile?.display_name || profile?.username || "Your name"}
          </h3>
          {isPro && <Pill tone="orange">Pro</Pill>}
        </div>

        {profile?.bio ? (
          <p
            style={{
              margin: 0,
              fontSize: 13.5,
              color: DASH.muted,
              lineHeight: 1.5,
              maxWidth: "56ch",
            }}
          >
            {profile.bio}
          </p>
        ) : (
          <button
            type="button"
            onClick={onEditProfile}
            style={{
              fontSize: 13.5,
              color: DASH.muted,
              fontStyle: "italic",
              background: "transparent",
              border: 0,
              padding: 0,
              textAlign: "left",
              cursor: "pointer",
            }}
          >
            + Add a short bio
          </button>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={handleCopyUrl}
            className="dash-url-chip"
            aria-label="Copy page URL"
            style={{ border: 0, cursor: "pointer" }}
          >
            <Link2 size={12} style={{ color: DASH.muted }} />
            {profileUrl}
            <Copy size={11} style={{ color: DASH.muted, marginLeft: 2 }} />
          </button>
          <button
            type="button"
            onClick={onEditProfile}
            className="dash-btn-ghost"
            style={{ padding: "8px 14px", fontSize: 12.5 }}
          >
            <Pencil size={13} />
            Edit profile
          </button>
        </div>

        {/* Social icons row */}
        {activeSocials.length > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
            {activeSocials.slice(0, 6).map((icon) => (
              <SocialIconBubble key={icon.id} icon={icon} />
            ))}
            {activeSocials.length > 6 && (
              <span style={{ fontSize: 11, color: DASH.muted, fontWeight: 600 }}>
                +{activeSocials.length - 6}
              </span>
            )}
          </div>
        )}
      </div>

      <AvatarCropDialog
        open={cropOpen}
        imageSrc={cropSrc}
        onCropDone={handleCropDone}
        onCancel={handleCropCancel}
      />
    </div>
  );
}

function SocialIconBubble({ icon }: { icon: SocialIcon }) {
  return (
    <BrandIcon
      platform={icon.platform}
      size={26}
      iconSize={13}
      rounded="rounded-full"
      className="transition-transform hover:scale-110 cursor-default"
    />
  );
}

// ---------------------------------------------------------------------------
// Add link bar (dashed) with quick-add chips
// ---------------------------------------------------------------------------

function AddLinkBar({
  onOpenFull,
  onQuickAdd,
  buttonRef,
}: {
  onOpenFull: () => void;
  onQuickAdd: (platform: SocialPlatform) => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const t = useTranslations("dashboard.design");

  const quickAdds: Array<{ platform: SocialPlatform; label: string }> = [
    { platform: "instagram", label: "Instagram" },
    { platform: "spotify", label: "Spotify" },
    { platform: "youtube", label: "YouTube" },
    { platform: "tiktok", label: "TikTok" },
    { platform: "whatsapp", label: "WhatsApp" },
  ];

  return (
    <div className="dash-add-bar">
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 10,
          background: DASH.orangeTint,
          color: DASH.orangeDeep,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <Plus size={16} strokeWidth={2.5} />
      </div>

      <input
        type="text"
        placeholder="Paste a URL or search a platform…"
        readOnly
        onClick={onOpenFull}
        style={{
          flex: 1,
          minWidth: 160,
          background: "transparent",
          border: 0,
          outline: "none",
          fontSize: 13.5,
          color: DASH.ink,
          fontFamily: DASH_MONO,
          cursor: "pointer",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        {quickAdds.map((q) => (
          <button
            key={q.platform}
            type="button"
            className="dash-chip"
            onClick={() => onQuickAdd(q.platform)}
          >
            {q.label}
          </button>
        ))}
      </div>

      <button
        ref={buttonRef}
        type="button"
        onClick={onOpenFull}
        className="dash-btn-primary"
        style={{ padding: "9px 16px", fontSize: 13 }}
      >
        <Plus size={14} strokeWidth={2.5} />
        {t("addLink")}
      </button>
    </div>
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
  const tDesign = useTranslations("dashboard.design");
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
      toast.success(tDesign("toastUrlUpdated"));
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
        "dash-panel",
        isDragging && "shadow-lg opacity-80 z-50"
      )}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {/* Drag handle */}
        <button
          type="button"
          className="touch-none"
          aria-label="Drag to reorder"
          style={{
            cursor: "grab",
            color: DASH.muted,
            opacity: 0.55,
            background: "transparent",
            border: 0,
            padding: 0,
            display: "inline-flex",
            alignItems: "center",
            flexShrink: 0,
          }}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </button>

        {/* Platform icon */}
        <BrandIcon platform={icon.platform} size={36} iconSize={18} />

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <p
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 600,
                letterSpacing: "-0.01em",
                color: DASH.ink,
              }}
            >
              {label}
            </p>
            <Pill tone="cream" style={{ fontSize: 10, padding: "2px 8px" }}>
              {icon.display_mode === "button"
                ? tSmart("displayButton")
                : icon.display_mode === "grid"
                  ? tSmart("displayGrid")
                  : tSmart("displayIcon")}
            </Pill>
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
              autoFocus
              style={{
                width: "100%",
                marginTop: 4,
                padding: "6px 10px",
                fontSize: 12,
                background: DASH.cream,
                border: `1px solid ${DASH.line}`,
                borderRadius: 8,
                outline: "none",
                color: DASH.ink,
                fontFamily: DASH_MONO,
              }}
            />
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  color: DASH.muted,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  fontFamily: DASH_MONO,
                }}
              >
                {truncateUrl(icon.url)}
              </p>
              <button
                type="button"
                onClick={() => setEditing(true)}
                aria-label="Edit URL"
                style={{
                  background: "transparent",
                  border: 0,
                  color: DASH.muted,
                  opacity: 0.6,
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                <Pencil size={11} />
              </button>
            </div>
          )}
        </div>

        {/* Switch */}
        <button
          type="button"
          className="dash-switch"
          data-on={icon.is_active}
          onClick={() => toggleSocialIcon(icon.id)}
          aria-label={icon.is_active ? tLinks("active") : tLinks("inactive")}
          aria-pressed={icon.is_active}
        >
          <span className="dash-switch-track">
            <span className="dash-switch-thumb" />
          </span>
        </button>
      </div>

      {/* Display mode toggle + title */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <Eyebrow>{tSmart("displayAs")}</Eyebrow>
          <div className="dash-seg" style={{ display: "inline-flex" }}>
            <button
              type="button"
              onClick={() => handleDisplayModeChange("icon")}
              className={cn("dash-seg-btn", icon.display_mode === "icon" && "active")}
              style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
            >
              <Circle className="size-3" />
              {tSmart("displayIcon")}
            </button>
            <button
              type="button"
              onClick={() => handleDisplayModeChange("button")}
              className={cn("dash-seg-btn", icon.display_mode === "button" && "active")}
              style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
            >
              <RectangleHorizontal className="size-3" />
              {tSmart("displayButton")}
            </button>
            <button
              type="button"
              onClick={() => handleDisplayModeChange("grid")}
              className={cn("dash-seg-btn", icon.display_mode === "grid" && "active")}
              style={{ display: "inline-flex", alignItems: "center", gap: 4 }}
            >
              <LayoutGrid className="size-3" />
              {tSmart("displayGrid")}
            </button>
          </div>
        </div>

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
            style={{
              width: "100%",
              padding: "8px 12px",
              fontSize: 13,
              background: DASH.cream,
              border: `1px solid ${DASH.line}`,
              borderRadius: 10,
              outline: "none",
              color: DASH.ink,
            }}
          />
        )}
      </div>

      {/* Bottom action bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: 12,
          paddingTop: 10,
          borderTop: `1px solid ${DASH.line}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <a
            href={icon.url}
            target="_blank"
            rel="noopener noreferrer"
            className="dash-icon-btn"
            aria-label="Open link"
          >
            <ExternalLink className="size-3.5" />
          </a>
          <button
            type="button"
            onClick={() => onOpenInsights(icon.id)}
            className="dash-chip"
            title={tLinks("insights")}
            style={{
              padding: "5px 10px",
              fontSize: 11.5,
              background: clickCount > 0 ? DASH.orangeTint : DASH.cream,
              color: clickCount > 0 ? DASH.orangeDeep : DASH.ink,
            }}
          >
            <BarChart3 className="size-3" />
            {clickCount === 1
              ? tLinks("clickSingular")
              : clickCount === 0
                ? tLinks("clicksZero")
                : tLinks("clicks", { count: clickCount })}
          </button>
        </div>
        <button
          type="button"
          className="dash-icon-btn danger"
          onClick={async () => {
            await deleteSocialIcon(icon.id);
            toast.success(tDesign("toastSocialRemoved"));
          }}
          aria-label={tLinks("delete")}
        >
          <Trash2 className="size-3.5" />
        </button>
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
      <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 10 }}>
        <SectionHead
          icon={<Share2 className="size-3.5" />}
          label={tLinks("socialLinks")}
        />
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sorted.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
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
  const profile = useProfileStore((s) => s.profile);
  const links = useLinkStore((s) => s.links);
  const socialIcons = useSocialStore((s) => s.socialIcons);

  // Wait for profile hydration
  if (!profile) {
    return <ContentSkeleton />;
  }

  const shouldOnboard =
    !profile.has_completed_onboarding &&
    links.length === 0 &&
    socialIcons.length === 0;

  return (
    <OnboardingProvider initialStep={shouldOnboard ? "add-button" : null}>
      <ContentTabInner />
    </OnboardingProvider>
  );
}

function ContentTabInner() {
  const tOnboarding = useTranslations("onboarding");
  const { step, setStep, dismiss } = useOnboarding();
  const profile = useProfileStore((s) => s.profile);
  const updateProfile = useProfileStore((s) => s.updateProfile);
  const links = useLinkStore((s) => s.links);
  const { counts } = useLinkClickCounts();

  // Persist onboarding completion
  const markCompleted = React.useCallback(() => {
    updateProfile({ has_completed_onboarding: true });
  }, [updateProfile]);

  const completeAndDismiss = React.useCallback(() => {
    markCompleted();
    dismiss();
  }, [markCompleted, dismiss]);

  // Modal states
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [linkFormOpen, setLinkFormOpen] = useState(false);
  const [smartInputOpen, setSmartInputOpen] = useState(false);
  const [smartInputPlatform, setSmartInputPlatform] =
    useState<SocialPlatform | null>(null);
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  // Lazy load ShareModal to match existing pattern
  const ShareModal = React.useMemo(
    () =>
      React.lazy(() =>
        import("@/components/dashboard/share-modal").then((m) => ({
          default: m.ShareModal,
        }))
      ),
    []
  );

  // Ref for spotlight target
  const addButtonRef = useRef<HTMLButtonElement>(null);

  const socialIcons = useSocialStore((s) => s.socialIcons);
  const prevCountRef = useRef(socialIcons.length + links.length);

  useEffect(() => {
    const currentCount = socialIcons.length + links.length;
    if (
      prevCountRef.current === 0 &&
      currentCount > 0 &&
      step === "smart-input-hint"
    ) {
      setShowCelebration(true);
      markCompleted();
      const timer = setTimeout(() => {
        setShowCelebration(false);
        setStep("share-nudge");
      }, 1800);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = currentCount;
  }, [socialIcons.length, links.length, step, setStep, markCompleted]);

  const greeting = useMemo(
    () => greetingFor(new Date().getHours()),
    []
  );

  const firstName = (profile?.display_name || profile?.username || "there")
    .split(" ")[0];

  const liveLinks = links.filter((l) => l.is_active).length;

  function handleQuickAdd(platform: SocialPlatform) {
    setSmartInputPlatform(platform);
    setSmartInputOpen(true);
    setAddModalOpen(false);
    if (step === "whatsapp-hint") setStep("smart-input-hint");
  }

  return (
    <div className="dash-tab-pad">
      {/* Header */}
      <div className="dash-tab-head">
        <div>
          <Eyebrow>Your page</Eyebrow>
          <h1 className="dash-page-title">
            {greeting}, <Italic>{firstName}</Italic>.
          </h1>
          <p className="dash-page-sub">
            Here&apos;s how your page is doing. Tweak anything — it updates live on the right.
          </p>
        </div>
        <div
          className="head-actions"
          style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
        >
          <a
            href={profile?.username ? `/${profile.username}?preview=1` : "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="dash-btn-ghost"
          >
            <Eye size={14} />
            Preview
          </a>
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className="dash-btn-primary"
          >
            <Share2 size={14} />
            Share
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <StatsStrip links={links} socialIcons={socialIcons} counts={counts} />

      {/* Profile card */}
      <ProfileCard onEditProfile={() => setProfileEditOpen(true)} />

      {/* Your links */}
      <div style={{ marginTop: 24, marginBottom: 10 }}>
        <SectionHead
          icon={<Link2 className="size-3.5" />}
          label={`Your links (${liveLinks} live)`}
        />
      </div>

      {/* Add link bar */}
      <AddLinkBar
        onOpenFull={() => {
          setAddModalOpen(true);
          if (step === "add-button") setStep("whatsapp-hint");
        }}
        onQuickAdd={handleQuickAdd}
        buttonRef={addButtonRef}
      />

      {/* Social icons management section */}
      <SocialIconsList />

      {/* Link list (drag-and-drop cards) */}
      <LinkList />

      {/* Share nudge banner */}
      {step === "share-nudge" && <ShareNudgeBanner onDismiss={completeAndDismiss} />}

      {/* ── Modals ── */}

      <AddContentModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onOpenLinkForm={() => setLinkFormOpen(true)}
        onOpenSmartInput={(platform) => {
          setSmartInputPlatform(platform);
          setSmartInputOpen(true);
          if (step === "whatsapp-hint") setStep("smart-input-hint");
        }}
        onboardingStep={step}
      />

      <LinkFormDialog open={linkFormOpen} onOpenChange={setLinkFormOpen} />

      <SmartSocialLinkInput
        open={smartInputOpen}
        onOpenChange={setSmartInputOpen}
        platform={smartInputPlatform}
        onBack={() => setAddModalOpen(true)}
        onboardingStep={step}
      />

      <ProfileEditDialog
        open={profileEditOpen}
        onOpenChange={setProfileEditOpen}
      />

      {profile?.username && (
        <React.Suspense fallback={null}>
          <ShareModal
            open={shareOpen}
            onOpenChange={setShareOpen}
            username={profile.username}
          />
        </React.Suspense>
      )}

      {/* Onboarding spotlight on Add button */}
      <SpotlightOverlay
        targetRef={addButtonRef}
        visible={step === "add-button"}
      />
      <OnboardingTooltip
        targetRef={addButtonRef}
        visible={step === "add-button"}
        position="bottom"
        title={tOnboarding("addLinkTitle")}
        description={tOnboarding("addLinkDescription")}
        currentStep={1}
        totalSteps={4}
        onDismiss={completeAndDismiss}
      />

      {/* Celebration overlay */}
      {showCelebration && <CelebrationOverlay title={tOnboarding("celebrationTitle")} />}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Celebration animation (shown after first link is added)
// ---------------------------------------------------------------------------

function CelebrationOverlay({ title }: { title: string }) {
  const particles = Array.from({ length: 8 }).map((_, i) => ({
    id: i,
    x: (Math.random() - 0.5) * 200,
    y: -(Math.random() * 120 + 40),
    color: ["#FF6B35", "#E8501A", "#FBBF24", "#34D399", "#60A5FA", "#A78BFA", "#F472B6", "#FB923C"][i],
  }));

  return (
    <div className="fixed inset-0 z-[47] flex items-center justify-center pointer-events-none">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        className="flex flex-col items-center gap-2"
      >
        <div className="size-16 rounded-full bg-[#FF6B35] flex items-center justify-center">
          <motion.svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <motion.path d="M5 12l5 5L19 7" />
          </motion.svg>
        </div>
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-sm font-semibold text-foreground"
        >
          {title}
        </motion.p>
      </motion.div>

      {/* Confetti particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute size-2.5 rounded-full"
          style={{ backgroundColor: p.color }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.5 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Mobile share nudge banner (shown on mobile after adding first link)
// ---------------------------------------------------------------------------

function ShareNudgeBanner({ onDismiss }: { onDismiss: () => void }) {
  const tOnboarding = useTranslations("onboarding");
  const [shareOpen, setShareOpen] = useState(false);
  const profile = useProfileStore((s) => s.profile);

  const ShareModal = React.lazy(
    () => import("@/components/dashboard/share-modal").then((m) => ({ default: m.ShareModal }))
  );

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl border border-[#FF6B35]/20 bg-[#FF6B35]/5 p-4"
        style={{ marginTop: 16 }}
      >
        <button
          type="button"
          onClick={onDismiss}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-black/5 transition-colors"
        >
          <X className="size-3.5 text-muted-foreground" />
        </button>
        <p className="text-sm font-semibold text-foreground pr-6">
          {tOnboarding("shareTitle")}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {tOnboarding("shareDescription")}
        </p>
        <button
          type="button"
          onClick={() => setShareOpen(true)}
          className="mt-3 flex items-center gap-2 px-4 py-2 rounded-full bg-[#FF6B35] text-white text-xs font-semibold hover:opacity-90 transition-opacity active:scale-[0.98]"
        >
          <Share2 className="size-3.5" />
          {tOnboarding("shareCta")}
        </button>
      </motion.div>

      {profile?.username && (
        <React.Suspense fallback={null}>
          <ShareModal
            open={shareOpen}
            onOpenChange={(open) => {
              setShareOpen(open);
              if (!open) onDismiss();
            }}
            username={profile.username}
          />
        </React.Suspense>
      )}
    </>
  );
}
