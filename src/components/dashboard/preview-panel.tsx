"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Share2 } from "lucide-react";
import { usePreviewIframe, type PreviewMode } from "@/lib/hooks/use-preview-iframe";
import { ShareModal } from "@/components/dashboard/share-modal";
import { PreviewBanner } from "@/components/dashboard/preview-banner";
import { useThemeStore } from "@/lib/stores/theme-store";
import { useSubscriptionStore } from "@/lib/stores/subscription-store";
import { countPreviewedProCategories } from "@/lib/pro-fields";
import { cn } from "@/lib/utils";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://viopage.com";

export function PreviewPanel() {
  const t = useTranslations("dashboard.preview");
  const theme = useThemeStore((s) => s.theme);
  const isPro = useSubscriptionStore((s) => s.isPro);
  const [mode, setMode] = useState<PreviewMode>("preview");
  const { iframeSrc, refreshKey, username } = usePreviewIframe(mode);
  const [shareOpen, setShareOpen] = useState(false);

  // Count of Pro categories currently configured on the theme. The toggle
  // only makes sense when there's a difference between Preview and Live.
  const proCount = theme ? countPreviewedProCategories(theme).count : 0;
  const showToggle = !isPro && proCount > 0;

  // Fingerprint of every Pro-relevant field. Changes whenever the creator
  // tweaks ANY Pro setting — not just when the category count changes.
  const proFingerprint = useMemo(() => {
    if (!theme) return "";
    return [
      theme.wallpaper_style,
      theme.bg_gradient_from,
      theme.bg_gradient_to,
      theme.bg_gradient_direction,
      theme.wallpaper_animate,
      theme.wallpaper_noise,
      theme.button_style_v2,
      theme.button_corner,
      theme.button_shadow,
      theme.button_font_size,
      theme.link_gap,
      theme.font_family,
      theme.title_font,
      theme.avatar_border,
      theme.hide_footer,
    ].join("|");
  }, [theme]);

  // When the creator tweaks any Pro setting while viewing Live, snap back to
  // Preview so they can actually see the change they just made.
  useEffect(() => {
    if (mode === "live" && !isPro) {
      setMode("preview");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proFingerprint]);

  // If the creator upgrades or drops to zero Pro features, the toggle
  // disappears — reset to Preview so the next render is consistent.
  useEffect(() => {
    if (!showToggle && mode === "live") {
      setMode("preview");
    }
  }, [showToggle, mode]);

  const displayUrl = username
    ? `${SITE_URL}/${username}`.replace(/^https?:\/\//, "")
    : "";

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="px-4 py-3 border-b border-border shrink-0 flex items-center justify-between">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {t("livePreview")}
        </p>
        {username && (
          <a
            href={`/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-[#FF6B35] hover:underline font-medium"
          >
            {t("openFullPage")}
          </a>
        )}
      </div>

      {/* Pro-preview banner — free creators only, when Pro features are active */}
      <PreviewBanner />

      {/* Preview / Live toggle — only for free creators with Pro features set */}
      {showToggle && (
        <div className="px-4 pt-3 shrink-0 flex justify-center">
          <div
            role="tablist"
            aria-label={t("modeToggleLabel")}
            className="inline-flex items-center rounded-full bg-zinc-100 p-0.5 text-[11px] font-semibold"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === "preview"}
              onClick={() => setMode("preview")}
              className={cn(
                "rounded-full px-3 py-1 transition-all",
                mode === "preview"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              {t("modePreview")}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "live"}
              onClick={() => setMode("live")}
              className={cn(
                "rounded-full px-3 py-1 transition-all",
                mode === "live"
                  ? "bg-white text-zinc-900 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              {t("modeLive")}
            </button>
          </div>
        </div>
      )}

      {/* Share URL bar */}
      {username && (
        <div className="px-4 pt-3 shrink-0 space-y-1">
          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className="w-full flex items-center gap-2.5 rounded-full border border-border bg-[#F5F5F5] dark:bg-[#1a1a1a] px-4 py-2.5 transition-colors hover:bg-[#EBEBEB] dark:hover:bg-[#252525] active:bg-[#E0E0E0] dark:active:bg-[#333]"
          >
            <span className="flex-1 text-sm text-[#1b1b1d] dark:text-white font-medium truncate text-left">
              {displayUrl}
            </span>
            <Share2 className="size-4 text-[#999] shrink-0" />
          </button>
          {showToggle && (
            <p
              className={cn(
                "text-[11px] font-medium text-center transition-colors",
                mode === "preview" ? "text-amber-700" : "text-emerald-700"
              )}
            >
              {mode === "preview" ? t("modePreviewDesc") : t("modeLiveDesc")}
            </p>
          )}
        </div>
      )}

      {/* Phone frame wrapper */}
      <div className="flex-1 flex items-start justify-center py-8 px-4 overflow-y-auto">
        <div className="relative w-[300px] shrink-0">
          {/* Phone bezel — iPhone-style */}
          <div className="rounded-[3rem] border-[6px] border-[#1a1a1a] bg-[#1a1a1a] shadow-2xl overflow-hidden">
            {/* Dynamic Island / Notch */}
            <div className="relative h-8 bg-[#1a1a1a] flex items-center justify-center z-10">
              <div className="w-20 h-5 bg-[#0a0a0a] rounded-full" />
            </div>

            {/* Screen — real iframe */}
            <div
              className="bg-white"
              style={{ height: "600px", overflow: "hidden" }}
            >
              {iframeSrc ? (
                <iframe
                  key={`${mode}-${refreshKey}`}
                  src={iframeSrc}
                  title="Profile preview"
                  className="w-full h-full border-0"
                  style={{
                    transform: "scale(0.75)",
                    transformOrigin: "top left",
                    width: "133.33%",
                    height: "133.33%",
                  }}
                  sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                  {t("loading")}
                </div>
              )}
            </div>

            {/* Home indicator */}
            <div className="h-6 bg-[#1a1a1a] flex items-center justify-center">
              <div className="w-24 h-1 rounded-full bg-white/30" />
            </div>
          </div>
        </div>
      </div>

      {/* Share modal */}
      {username && (
        <ShareModal
          open={shareOpen}
          onOpenChange={setShareOpen}
          username={username}
        />
      )}
    </div>
  );
}
