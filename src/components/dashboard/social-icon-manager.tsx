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
  onUrlChange: (id: string, url: string) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

function ActiveIconRow({
  icon,
  onUrlChange,
  onToggle,
  onDelete,
}: ActiveIconRowProps) {
  const platformEntry = SOCIAL_PLATFORMS.find(
    (p) => p.platform === icon.platform
  );
  const label = platformEntry?.label ?? icon.platform;

  const [localUrl, setLocalUrl] = useState(icon.url);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleUrlSave = useCallback(
    (newUrl: string) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        onUrlChange(icon.id, newUrl);
      }, 600);
    },
    [icon.id, onUrlChange]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newUrl = e.target.value;
    setLocalUrl(newUrl);
    scheduleUrlSave(newUrl);
  };

  const handleBlur = () => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    onUrlChange(icon.id, localUrl);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      (e.target as HTMLInputElement).blur();
    }
  };

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
      </div>

      {/* URL input */}
      <Input
        value={localUrl}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={getPlatformUrlPrefix(icon.platform) || "https://"}
        aria-label={`${label} URL`}
        className="h-9 text-sm"
        style={{ flex: 1, minWidth: 200 }}
      />

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

interface InactivePlatformButtonProps {
  platform: SocialPlatform;
  label: string;
  iconName: string;
  onAdd: (platform: SocialPlatform) => void;
}

function InactivePlatformButton({
  platform,
  label,
  iconName,
  onAdd,
}: InactivePlatformButtonProps) {
  return (
    <motion.button
      type="button"
      onClick={() => onAdd(platform)}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      aria-label={`Add ${label}`}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: "12px 8px",
        borderRadius: 14,
        background: DASH.panel,
        border: `1px solid ${DASH.line}`,
        color: DASH.muted,
        cursor: "pointer",
        transition: "all 0.12s",
      }}
      className="hover:!bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
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

  const activePlatforms = new Set(socialIcons.map((i) => i.platform));

  const availablePlatforms = SOCIAL_PLATFORMS.filter(
    (p) => !activePlatforms.has(p.platform)
  );

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
          Add the profiles you want to show as icons on your page.
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
                    onUrlChange={handleUrlChange}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                  />
                ))}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Separator between active and available */}
      {sortedIcons.length > 0 && availablePlatforms.length > 0 && (
        <div style={{ height: 1, background: DASH.line }} />
      )}

      {/* Available platforms grid */}
      {availablePlatforms.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <SectionHead label="Add platform" />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(88px, 1fr))",
              gap: 8,
            }}
          >
            <AnimatePresence mode="popLayout">
              {availablePlatforms.map((p) => (
                <motion.div
                  key={p.platform}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                >
                  <InactivePlatformButton
                    platform={p.platform}
                    label={p.label}
                    iconName={p.icon}
                    onAdd={handleAdd}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Empty state */}
      {sortedIcons.length === 0 && availablePlatforms.length === 0 && (
        <p style={{ fontSize: 13, color: DASH.muted, textAlign: "center", padding: "8px 0" }}>
          All platforms have been added.
        </p>
      )}
    </div>
  );
}
