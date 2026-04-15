"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Eye, X, Share2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShareModal } from "@/components/dashboard/share-modal";
import { PreviewBanner } from "@/components/dashboard/preview-banner";
import {
  usePreviewIframe,
  type PreviewMode,
} from "@/lib/hooks/use-preview-iframe";
import { useThemeStore } from "@/lib/stores/theme-store";
import { useSubscriptionStore } from "@/lib/stores/subscription-store";
import { countPreviewedProCategories } from "@/lib/pro-fields";
import { cn } from "@/lib/utils";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://viopage.com";

export function MobilePreviewFAB() {
  const t = useTranslations("dashboard.preview");
  const theme = useThemeStore((s) => s.theme);
  const isPro = useSubscriptionStore((s) => s.isPro);
  const [mode, setMode] = useState<PreviewMode>("preview");
  const { iframeSrc, refreshKey, username } = usePreviewIframe(mode);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const proCount = theme ? countPreviewedProCategories(theme).count : 0;
  const showToggle = !isPro && proCount > 0;

  // Snap back to Pro view when any Pro setting changes while viewing Public,
  // so the creator actually sees the change they just made.
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

  useEffect(() => {
    if (mode === "live" && !isPro) setMode("preview");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proFingerprint]);

  useEffect(() => {
    if (!showToggle && mode === "live") setMode("preview");
  }, [showToggle, mode]);

  const displayUrl = username
    ? `${SITE_URL}/${username}`.replace(/^https?:\/\//, "")
    : "";

  return (
    <>
      {/* Floating Action Button — mobile only */}
      <button
        type="button"
        onClick={() => setSheetOpen(true)}
        aria-label={t("livePreview")}
        className="fixed z-40 lg:hidden size-14 rounded-full bg-[#FF6B35] text-white shadow-lg shadow-[#FF6B35]/25 flex items-center justify-center active:scale-95 transition-transform"
        style={{ bottom: "calc(2rem + env(safe-area-inset-bottom, 0px))", right: "1.25rem" }}
      >
        <Eye className="size-6" />
      </button>

      {/* Bottom sheet with preview */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="rounded-t-2xl p-0 gap-0 flex flex-col"
          style={{ height: "92dvh", maxHeight: "92dvh" }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1 shrink-0">
            <div className="h-1 w-10 rounded-full bg-[#d1d5db]" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 shrink-0">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setSheetOpen(false)}
            >
              <X className="size-4" />
            </Button>
            <SheetTitle className="text-sm font-semibold">
              {t("livePreview")}
            </SheetTitle>
            {/* Spacer for centering */}
            <div className="size-8" />
          </div>

          {/* Pro-preview banner — free creators previewing Pro features */}
          <PreviewBanner />

          {/* Pro / Public toggle — free creators with active Pro previews */}
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
                      : "text-zinc-500"
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
                      : "text-zinc-500"
                  )}
                >
                  {t("modeLive")}
                </button>
              </div>
            </div>
          )}

          {/* Tappable URL bar — opens Share modal */}
          {username && (
            <div className="px-4 pt-3 pb-1 shrink-0 space-y-1">
              <button
                type="button"
                onClick={() => setShareOpen(true)}
                className="w-full flex items-center gap-2.5 rounded-full border border-border bg-[#F5F5F5] px-4 py-2.5 transition-colors hover:bg-[#EBEBEB] active:bg-[#E0E0E0]"
              >
                <span className="flex-1 text-sm text-[#1b1b1d] font-medium truncate text-left">
                  {displayUrl}
                </span>
                <Share2 className="size-4 text-[#999] shrink-0" />
              </button>
              {showToggle && (
                <p
                  className={cn(
                    "text-[11px] font-medium text-center",
                    mode === "preview" ? "text-amber-700" : "text-emerald-700"
                  )}
                >
                  {mode === "preview" ? t("modePreviewDesc") : t("modeLiveDesc")}
                </p>
              )}
            </div>
          )}

          {/* Iframe preview — full size, no phone bezel */}
          <div className="flex-1 min-h-0 overflow-hidden bg-white mx-3 mb-3 rounded-xl border border-border">
            {iframeSrc ? (
              <iframe
                key={`${mode}-${refreshKey}`}
                src={iframeSrc}
                title="Profile preview"
                className="w-full h-full border-0"
                sandbox="allow-scripts allow-same-origin allow-popups"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
                {t("loading")}
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Share modal — opened from URL bar */}
      {username && (
        <ShareModal
          open={shareOpen}
          onOpenChange={setShareOpen}
          username={username}
        />
      )}
    </>
  );
}
