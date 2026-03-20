"use client";

import React, { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SOCIAL_PLATFORMS } from "@/lib/constants";
import {
  getIconForPlatform,
  getPlatformUrlPrefix,
} from "@/lib/social-icon-map";
import { useSocialStore } from "@/lib/stores/social-store";
import type { SocialIcon, SocialPlatform } from "@/types";
import { cn } from "@/lib/utils";

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
  const IconComponent = getIconForPlatform(icon.platform);
  const platformEntry = SOCIAL_PLATFORMS.find(
    (p) => p.platform === icon.platform
  );
  const label = platformEntry?.label ?? icon.platform;

  // Local URL state so the input feels responsive while debouncing saves
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
      className="flex flex-col gap-2 p-3 rounded-xl border border-border bg-white sm:flex-row sm:items-center sm:gap-3"
    >
      {/* Top row on mobile: icon + label + toggle + delete */}
      <div className="flex items-center gap-2.5 sm:w-32 sm:shrink-0">
        <div
          className={cn(
            "flex items-center justify-center size-8 rounded-lg shrink-0",
            icon.is_active
              ? "bg-foreground text-white"
              : "bg-muted text-muted-foreground"
          )}
        >
          <IconComponent size={16} strokeWidth={1.75} />
        </div>
        <span className="text-sm font-medium text-foreground truncate flex-1">
          {label}
        </span>

        {/* On mobile, show toggle + delete inline with the label */}
        <div className="flex items-center gap-2 sm:hidden ml-auto shrink-0">
          <Switch
            checked={icon.is_active}
            onCheckedChange={() => onToggle(icon.id)}
            aria-label={`Toggle ${label}`}
          />
          <Button
            variant="ghost"
            size="icon"
            className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
            onClick={() => onDelete(icon.id)}
            aria-label={`Remove ${label}`}
          >
            <Trash2 size={15} />
          </Button>
        </div>
      </div>

      {/* URL input — full width on mobile, flex-1 on desktop */}
      <Input
        value={localUrl}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        placeholder={getPlatformUrlPrefix(icon.platform) || "https://"}
        className="h-8 text-sm w-full sm:flex-1"
        aria-label={`${label} URL`}
      />

      {/* Toggle + delete — desktop only */}
      <div className="hidden sm:flex items-center gap-2 shrink-0">
        <Switch
          checked={icon.is_active}
          onCheckedChange={() => onToggle(icon.id)}
          aria-label={`Toggle ${label}`}
        />
        <Button
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(icon.id)}
          aria-label={`Remove ${label}`}
        >
          <Trash2 size={15} />
        </Button>
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
  onAdd,
}: InactivePlatformButtonProps) {
  const IconComponent = getIconForPlatform(platform);

  return (
    <motion.button
      type="button"
      onClick={() => onAdd(platform)}
      className={cn(
        "flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border border-border bg-white",
        "text-muted-foreground hover:text-foreground hover:border-foreground/30 hover:bg-muted/40",
        "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      )}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.15, ease: "easeOut" }}
      aria-label={`Add ${label}`}
    >
      <IconComponent size={20} strokeWidth={1.75} />
      <span className="text-[11px] font-medium leading-tight text-center">
        {label}
      </span>
      <Plus
        size={12}
        className="text-muted-foreground opacity-60"
        strokeWidth={2}
      />
    </motion.button>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function SocialIconManager() {
  const { socialIcons, addSocialIcon, updateSocialIcon, deleteSocialIcon, toggleSocialIcon } =
    useSocialStore();

  // Build a Set of platforms already configured by the user
  const activePlatforms = new Set(socialIcons.map((i) => i.platform));

  // Platforms NOT yet added by the user
  const availablePlatforms = SOCIAL_PLATFORMS.filter(
    (p) => !activePlatforms.has(p.platform)
  );

  // Sort existing icons by position
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
    <div className="space-y-4">
      {/* Section header */}
      <div>
        <h2 className="text-base font-semibold text-foreground">
          Social Icons
        </h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Add social profile links that appear as icons on your page.
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
            className="space-y-2"
          >
            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Your Icons
            </Label>
            <div className="space-y-2">
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
        <Separator />
      )}

      {/* Available platforms grid */}
      {availablePlatforms.length > 0 && (
        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Add Platform
          </Label>
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
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
        <p className="text-sm text-muted-foreground text-center py-4">
          All platforms have been added.
        </p>
      )}
    </div>
  );
}
