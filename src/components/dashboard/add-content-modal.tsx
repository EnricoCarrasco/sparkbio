"use client";

import React, { useState, useMemo } from "react";
import { useTranslations, useLocale } from "next-intl";
import {
  Search,
  Lightbulb,
  Heart,
  PlayCircle,
  Contact,
  Banknote,
  Link2,
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

type Category = "suggested" | "social" | "media" | "contact" | "payment";

const BASE_CATEGORIES: { key: Category; icon: React.ElementType }[] = [
  { key: "suggested", icon: Lightbulb },
  { key: "social", icon: Heart },
  { key: "media", icon: PlayCircle },
  { key: "contact", icon: Contact },
];

const PAYMENT_CATEGORY: { key: Category; icon: React.ElementType } = {
  key: "payment", icon: Banknote,
};

const PLATFORM_CATEGORIES: Record<Category, SocialPlatform[]> = {
  suggested: [
    "instagram",
    "tiktok",
    "youtube",
    "spotify",
    "whatsapp",
    "x",
  ],
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
  payment: ["pix"],
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
  pix: "Accept Pix payments",
};

const PLATFORM_DESCRIPTIONS_PTBR: Partial<Record<SocialPlatform, string>> = {
  pix: "Receba pagamentos via Pix",
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
  const locale = useLocale();
  const [activeCategory, setActiveCategory] = useState<Category>("suggested");
  const [search, setSearch] = useState("");

  // Show Payment category only for PT-BR locale
  const categories = useMemo(() => {
    if (locale === "pt-BR") {
      return [...BASE_CATEGORIES, PAYMENT_CATEGORY];
    }
    return BASE_CATEGORIES;
  }, [locale]);

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
      <DialogContent className="!top-auto md:!top-1/2 !left-0 md:!left-1/2 !bottom-0 md:!bottom-auto !translate-x-0 md:!-translate-x-1/2 !translate-y-0 md:!-translate-y-1/2 !max-w-full md:!max-w-2xl !rounded-b-none md:!rounded-b-xl rounded-t-2xl p-0 gap-0 overflow-hidden max-h-[85dvh] md:max-h-none [&>*]:min-w-0">
        {/* Header */}
        <DialogHeader className="px-5 md:px-6 pt-4 md:pt-5 pb-0">
          <DialogTitle className="text-lg font-bold">{t("title")}</DialogTitle>
        </DialogHeader>

        {/* Search bar */}
        <div className="px-5 md:px-6 py-3 md:py-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="w-full h-11 md:h-12 pl-11 pr-4 rounded-full border-2 border-dashed border-border bg-muted/30 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-foreground/30 transition-colors"
            />
          </div>
        </div>

        {/* Mobile: horizontal category chips */}
        <div className="md:hidden relative pb-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar px-5">
            {categories.map(({ key, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  setActiveCategory(key);
                  setSearch("");
                }}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors shrink-0",
                  activeCategory === key && !search
                    ? "bg-[#8B5CF6] text-white"
                    : "bg-muted/50 text-muted-foreground"
                )}
              >
                <Icon className="size-3.5" />
                {t(key)}
              </button>
            ))}
            {/* Spacer so last chip isn't flush with edge */}
            <div className="shrink-0 w-1" aria-hidden="true" />
          </div>
          {/* Right fade to indicate scrollability */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-3 w-6 bg-gradient-to-l from-background to-transparent" />
        </div>

        <div className="border-t" />

        {/* Two-column on desktop, single column on mobile */}
        <div className="flex flex-col md:flex-row min-h-0 md:min-h-[400px] md:max-h-[500px] overflow-hidden">
          {/* Left sidebar - categories (desktop only) */}
          <div className="hidden md:block w-[180px] border-r py-3 px-2 shrink-0">
            {categories.map(({ key, icon: Icon }) => (
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
          </div>

          {/* Right content */}
          <div className="flex-1 min-w-0 overflow-x-hidden overflow-y-auto py-3 px-4 md:py-4 md:px-5">
            {/* Add custom link button */}
            <button
              type="button"
              onClick={handleLinkClick}
              className="w-full flex items-center gap-3 px-4 py-3 mb-4 md:mb-5 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/15 transition-colors"
            >
              <Link2 className="size-4 text-[#8B5CF6]" />
              <span className="text-sm font-semibold text-[#8B5CF6]">
                {t("link")}
              </span>
              <ChevronRight className="size-4 text-[#8B5CF6]/40 ml-auto" />
            </button>

            {/* Section label */}
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              {search ? "Results" : t(activeCategory)}
            </p>

            {/* Platform list */}
            <div className="space-y-0.5 md:space-y-1">
              {filteredPlatforms.length === 0 && (
                <p className="text-sm text-muted-foreground py-6 text-center">
                  No results found
                </p>
              )}
              {filteredPlatforms.map((platform) => {
                const label = getPlatformLabel(platform);
                const desc = (locale === "pt-BR" ? PLATFORM_DESCRIPTIONS_PTBR[platform] : undefined)
                  ?? PLATFORM_DESCRIPTIONS[platform] ?? "";
                return (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => handlePlatformClick(platform)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-muted/50 active:bg-muted/60 transition-colors group"
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
