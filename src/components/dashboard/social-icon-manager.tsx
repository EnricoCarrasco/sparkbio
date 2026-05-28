"use client";

import React, { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus, Globe } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SOCIAL_PLATFORMS } from "@/lib/constants";
import {
  LUCIDE_ICON_MAP,
  getPlatformUrlPrefix,
} from "@/lib/social-icon-map";
import { useSocialStore } from "@/lib/stores/social-store";
import type { SocialIcon, SocialPlatform } from "@/types";
import { DASH, Eyebrow, SectionHead } from "./_dash-primitives";

function renderPlatformIcon(
  iconName: string | undefined,
  props: {
    size: number;
    strokeWidth?: number;
    className?: string;
  }
) {
  const Icon = (iconName ? LUCIDE_ICON_MAP[iconName] : undefined) ?? Globe;
  return React.createElement(Icon, props);
}

// ---------------------------------------------------------------------------
// Active platform row – shown at the top for each platform already saved
// ---------------------------------------------------------------------------

interface ActiveIconRowProps {
  icon: SocialIcon;
  // Pass the platform count so we know whether to show the "Label" field
  // automatically (a creator with 2+ Instagrams needs labels to tell them apart).
  sameTypeCount: number;
  onUrlChange: (id: string, url: string) => void;
  onTitleChange: (id: string, title: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

function ActiveIconRow({
  icon,
  sameTypeCount,
  onUrlChange,
  onTitleChange,
  onToggle,
  onDelete,
}: ActiveIconRowProps) {
  const platformEntry = SOCIAL_PLATFORMS.find(
    (p) => p.platform === icon.platform
  );
  const label = platformEntry?.label ?? icon.platform;

  const [localUrl, setLocalUrl] = useState(icon.url);
  const [localTitle, setLocalTitle] = useState(icon.display_title ?? "");
  const urlSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleUrlSave = useCallback(
    (newUrl: string) => {
      if (urlSaveTimerRef.current) clearTimeout(urlSaveTimerRef.current);
      urlSaveTimerRef.current = setTimeout(() => {
        onUrlChange(icon.id, newUrl);
      }, 600);
    },
    [icon.id, onUrlChange]
  );

  const scheduleTitleSave = useCallback(
    (newTitle: string) => {
      if (titleSaveTimerRef.current) clearTimeout(titleSaveTimerRef.current);
      titleSaveTimerRef.current = setTimeout(() => {
        onTitleChange(icon.id, newTitle);
      }, 600);
    },
    [icon.id, onTitleChange]
  );

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setLocalUrl(newUrl);
    scheduleUrlSave(newUrl);
  };

  const handleUrlBlur = () => {
    if (urlSaveTimerRef.current) clearTimeout(urlSaveTimerRef.current);
    onUrlChange(icon.id, localUrl);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setLocalTitle(newTitle);
    scheduleTitleSave(newTitle);
  };

  const handleTitleBlur = () => {
    if (titleSaveTimerRef.current) clearTimeout(titleSaveTimerRef.current);
    onTitleChange(icon.id, localTitle);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

  // Show the Label input when there are 2+ of this platform OR the user has
  // already set one (so deleting all-but-one doesn't make their label vanish).
  const showLabel = sameTypeCount >= 2 || !!icon.display_title;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="dash-link-row"
      style={{ padding: "12px 14px", flexWrap: "wrap" }}
    >
      {/* Icon + label */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 140 }}>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            background: icon.is_active ? DASH.ink : DASH.cream2,
            color: icon.is_active ? "#fff" : DASH.muted,
          }}
        >
          {renderPlatformIcon(platformEntry?.icon, {
            size: 16,
            strokeWidth: 1.75,
          })}
        </div>
        <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: DASH.ink,
              letterSpacing: "-0.01em",
            }}
          >
            {label}
          </span>
          {showLabel && icon.display_title && (
            <span
              style={{
                fontSize: 11,
                color: DASH.muted,
                marginTop: 1,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: 120,
              }}
            >
              {icon.display_title}
            </span>
          )}
        </div>
      </div>

      {/* URL + optional Label inputs */}
      <div style={{ flex: 1, minWidth: 200, display: "flex", flexDirection: "column", gap: 6 }}>
        <Input
          value={localUrl}
          onChange={handleUrlChange}
          onBlur={handleUrlBlur}
          onKeyDown={handleKeyDown}
          placeholder={getPlatformUrlPrefix(icon.platform) || "https://"}
          aria-label={`${label} URL`}
          className="h-9 text-sm"
        />
        {showLabel && (
          <Input
            value={localTitle}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyDown={handleKeyDown}
            placeholder={`Label · e.g. ${
              icon.platform === "instagram"
                ? "Personal"
                : icon.platform === "whatsapp"
                  ? "Sales"
                  : "Studio"
            }`}
            maxLength={32}
            aria-label={`${label} label`}
            className="h-8 text-xs"
          />
        )}
      </div>

      {/* Toggle + delete */}
      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginLeft: "auto" }}>
        <button
          type="button"
          className="dash-switch"
          data-on={icon.is_active}
          onClick={() => onToggle(icon.id)}
          aria-label={`Toggle ${label}`}
          aria-pressed={icon.is_active}
        >
          <span className="dash-switch-track">
            <span className="dash-switch-thumb" />
          </span>
        </button>
        <button
          type="button"
          className="dash-icon-btn danger"
          onClick={() => onDelete(icon.id)}
          aria-label={`Remove ${label}`}
        >
          <Trash2 size={15} />
        </button>
      </div>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Inactive platform button – shown in the grid for platforms not yet added
// ---------------------------------------------------------------------------

interface PlatformButtonProps {
  platform: SocialPlatform;
  label: string;
  iconName: string;
  // How many of this platform the user has already added. Renders a count chip
  // in the corner when > 0. The tile is always clickable so users can keep
  // adding more of the same platform.
  count: number;
  onAdd: (platform: SocialPlatform) => void;
}

function PlatformButton({
  platform,
  label,
  iconName,
  count,
  onAdd,
}: PlatformButtonProps) {
  const isAdded = count > 0;
  return (
    <motion.button
      type="button"
      onClick={() => onAdd(platform)}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      aria-label={isAdded ? `Add another ${label} (${count} added)` : `Add ${label}`}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: "12px 8px",
        borderRadius: 14,
        background: DASH.panel,
        border: `1px solid ${isAdded ? DASH.lineStrong : DASH.line}`,
        color: DASH.muted,
        cursor: "pointer",
        transition: "all 0.12s",
      }}
      className="hover:!bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* Count chip — top-right corner when this platform already has rows */}
      {isAdded && (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            minWidth: 18,
            height: 18,
            padding: "0 5px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: DASH.orange,
            color: "#fff",
            fontSize: 10,
            fontWeight: 700,
            borderRadius: 999,
            lineHeight: 1,
            boxShadow: "0 1px 4px rgba(255,107,53,.4)",
          }}
        >
          {count}
        </span>
      )}
      {renderPlatformIcon(iconName, { size: 20, strokeWidth: 1.75 })}
      <span
        style={{
          fontSize: 11,
          fontWeight: 600,
          lineHeight: 1.2,
          textAlign: "center",
          color: DASH.ink,
          letterSpacing: "-0.01em",
        }}
      >
        {label}
      </span>
      <Plus size={12} strokeWidth={2} style={{ color: DASH.orange }} />
    </motion.button>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function SocialIconManager() {
  const { socialIcons, addSocialIcon, updateSocialIcon, deleteSocialIcon, toggleSocialIcon } =
    useSocialStore();

  // Count rows per platform — drives both the picker chips and the per-row
  // "show label input" logic. Creators can now add multiple Instagrams,
  // multiple Pix keys, multiple WhatsApps, etc.
  const platformCounts = socialIcons.reduce<Record<string, number>>((acc, i) => {
    acc[i.platform] = (acc[i.platform] ?? 0) + 1;
    return acc;
  }, {});

  const sortedIcons = [...socialIcons].sort((a, b) => a.position - b.position);

  const handleAdd = useCallback(
    async (platform: SocialPlatform) => {
      const urlPrefix = getPlatformUrlPrefix(platform);
      await addSocialIcon(platform, urlPrefix);
    },
    [addSocialIcon]
  );

  const handleUrlChange = useCallback(
    async (id: string, url: string) => {
      await updateSocialIcon(id, { url });
    },
    [updateSocialIcon]
  );

  const handleTitleChange = useCallback(
    async (id: string, title: string) => {
      const trimmed = title.trim();
      await updateSocialIcon(id, { display_title: trimmed.length > 0 ? trimmed : null });
    },
    [updateSocialIcon]
  );

  const handleToggle = useCallback(
    async (id: string) => {
      await toggleSocialIcon(id);
    },
    [toggleSocialIcon]
  );

  const handleDelete = useCallback(
    async (id: string) => {
      await deleteSocialIcon(id);
    },
    [deleteSocialIcon]
  );

  return (
    <div className="dash-panel" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Section header */}
      <div>
        <Eyebrow>Profile footer</Eyebrow>
        <h2
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: DASH.ink,
            margin: "6px 0 2px",
            letterSpacing: "-0.02em",
          }}
        >
          Social icons
        </h2>
        <p style={{ fontSize: 13, color: DASH.muted, margin: 0 }}>
          Add the profiles you want to show as icons on your page. Need two Instagrams or three Pix keys? Just tap the tile again.
        </p>
      </div>

      {/* Active / configured icons */}
      <AnimatePresence mode="popLayout">
        {sortedIcons.length > 0 && (
          <motion.div
            key="active-section"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: "flex", flexDirection: "column", gap: 8 }}
          >
            <SectionHead label="Your icons" />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <AnimatePresence mode="popLayout">
                {sortedIcons.map((icon) => (
                  <ActiveIconRow
                    key={icon.id}
                    icon={icon}
                    sameTypeCount={platformCounts[icon.platform] ?? 1}
                    onUrlChange={handleUrlChange}
                    onTitleChange={handleTitleChange}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Separator between active and the platform grid */}
      {sortedIcons.length > 0 && (
        <div style={{ height: 1, background: DASH.line }} />
      )}

      {/* Available platforms grid — ALWAYS shows every platform now, with a
          count chip on tiles that have already been added. */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <SectionHead label="Add platform" />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))",
            gap: 8,
          }}
        >
          {SOCIAL_PLATFORMS.map((p) => (
            <PlatformButton
              key={p.platform}
              platform={p.platform}
              label={p.label}
              iconName={p.icon}
              count={platformCounts[p.platform] ?? 0}
              onAdd={handleAdd}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
