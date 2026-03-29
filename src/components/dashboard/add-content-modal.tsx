"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Search,
  Lightbulb,
  ShoppingCart,
  Heart,
  PlayCircle,
  Contact,
  CalendarDays,
  FileText,
  MoreHorizontal,
  Grid2X2,
  Link2,
  Tag,
  ClipboardList,
  ChevronRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { SOCIAL_PLATFORMS } from "@/lib/constants";
import { getPlatformLabel } from "@/lib/social-icon-map";
import { BrandIcon } from "@/components/ui/brand-icon";
import type { SocialPlatform } from "@/types";

type Category =
  | "suggested"
  | "commerce"
  | "social"
  | "media"
  | "contact"
  | "events"
  | "text";

const CATEGORIES: { key: Category; icon: React.ElementType }[] = [
  { key: "suggested", icon: Lightbulb },
  { key: "commerce", icon: ShoppingCart },
  { key: "social", icon: Heart },
  { key: "media", icon: PlayCircle },
  { key: "contact", icon: Contact },
  { key: "events", icon: CalendarDays },
  { key: "text", icon: FileText },
];

const PLATFORM_CATEGORIES: Record<Category, SocialPlatform[]> = {
  suggested: [
    "instagram",
    "tiktok",
    "youtube",
    "spotify",
    "whatsapp",
    "x",
  ],
  commerce: [],
  social: [
    "instagram",
    "tiktok",
    "x",
    "facebook",
    "snapchat",
    "linkedin",
    "pinterest",
    "discord",
  ],
  media: ["youtube", "spotify", "soundcloud", "twitch"],
  contact: ["whatsapp", "telegram", "email", "website"],
  events: [],
  text: [],
};

const PLATFORM_DESCRIPTIONS: Partial<Record<SocialPlatform, string>> = {
  instagram: "Display your posts and reels",
  tiktok: "Share your TikToks on your Viopage",
  youtube: "Share YouTube videos on your Viopage",
  spotify: "Share your latest or favorite music",
  whatsapp: "Let visitors message you directly",
  x: "Share your tweets and threads",
  facebook: "Connect your Facebook page",
  linkedin: "Share your professional profile",
  github: "Showcase your repositories",
  twitch: "Share your live streams",
  snapchat: "Connect on Snapchat",
  pinterest: "Share your pins and boards",
  soundcloud: "Share your tracks and mixes",
  discord: "Invite visitors to your server",
  telegram: "Let visitors reach you on Telegram",
  email: "Let visitors email you directly",
  website: "Link to your website",
};

interface AddContentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenLinkForm: () => void;
  onOpenSmartInput: (platform: SocialPlatform) => void;
}

export function AddContentModal({
  open,
  onOpenChange,
  onOpenLinkForm,
  onOpenSmartInput,
}: AddContentModalProps) {
  const t = useTranslations("dashboard.addModal");
  const [activeCategory, setActiveCategory] = useState<Category>("suggested");
  const [search, setSearch] = useState("");

  const platforms = PLATFORM_CATEGORIES[activeCategory] || [];

  const filteredPlatforms = search.trim()
    ? SOCIAL_PLATFORMS.filter((p) =>
        p.label.toLowerCase().includes(search.toLowerCase())
      ).map((p) => p.platform)
    : platforms;

  function handlePlatformClick(platform: SocialPlatform) {
    onOpenChange(false);
    // Small delay to allow the close animation
    setTimeout(() => onOpenSmartInput(platform), 150);
  }

  function handleLinkClick() {
    onOpenChange(false);
    setTimeout(() => onOpenLinkForm(), 150);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 gap-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-0">
          <DialogTitle className="text-lg font-bold">{t("title")}</DialogTitle>
        </DialogHeader>

        {/* Search bar */}
        <div className="px-6 py-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full h-12 pl-11 pr-4 rounded-full border-2 border-dashed border-border bg-muted/30 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
            />
          </div>
        </div>

        <div className="border-t" />

        {/* Two-column: categories + content */}
        <div className="flex min-h-[400px] max-h-[500px]">
          {/* Left sidebar - categories */}
          <div className="w-[180px] border-r py-3 px-2 shrink-0">
            {CATEGORIES.map(({ key, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setActiveCategory(key);
                  setSearch("");
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
                  activeCategory === key && !search
                    ? "bg-foreground/5 text-foreground font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <Icon className="size-4 shrink-0" />
                {t(key)}
              </button>
            ))}
            <button
              type="button"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors text-left"
            >
              <MoreHorizontal className="size-4 shrink-0" />
              {t("viewAll")}
            </button>
          </div>

          {/* Right content */}
          <div className="flex-1 overflow-y-auto py-4 px-5">
            {/* Type cards */}
            <div className="grid grid-cols-4 gap-2 mb-5">
              {[
                {
                  key: "collection" as const,
                  icon: Grid2X2,
                  onClick: () => {},
                  disabled: true,
                },
                {
                  key: "link" as const,
                  icon: Link2,
                  onClick: handleLinkClick,
                  disabled: false,
                },
                {
                  key: "product" as const,
                  icon: Tag,
                  onClick: () => {},
                  disabled: true,
                },
                {
                  key: "form" as const,
                  icon: ClipboardList,
                  onClick: () => {},
                  disabled: true,
                },
              ].map(({ key, icon: Icon, onClick, disabled }) => (
                <button
                  key={key}
                  type="button"
                  onClick={onClick}
                  disabled={disabled}
                  className={cn(
                    "flex flex-col items-start justify-between p-3 h-[76px] rounded-lg border bg-muted/30 transition-all text-left",
                    disabled
                      ? "opacity-50 cursor-not-allowed"
                      : "hover:bg-muted/60 hover:border-foreground/20 cursor-pointer"
                  )}
                >
                  <span className="text-xs font-semibold text-foreground">
                    {t(key)}
                  </span>
                  <Icon className="size-5 text-muted-foreground" />
                </button>
              ))}
            </div>

            {/* Section label */}
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              {search ? "Results" : t(activeCategory)}
            </p>

            {/* Platform list */}
            <div className="space-y-1">
              {filteredPlatforms.length === 0 && (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  {activeCategory === "commerce" || activeCategory === "events" || activeCategory === "text"
                    ? t("collection") + " — " + "Coming soon"
                    : "No results found"}
                </p>
              )}
              {filteredPlatforms.map((platform) => {
                const label = getPlatformLabel(platform);
                const desc = PLATFORM_DESCRIPTIONS[platform] || "";
                return (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => handlePlatformClick(platform)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <BrandIcon platform={platform} size={40} iconSize={20} rounded="rounded-xl" />
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-semibold text-foreground">
                        {label}
                      </p>
                      {desc && (
                        <p className="text-xs text-muted-foreground truncate">
                          {desc}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="size-4 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
