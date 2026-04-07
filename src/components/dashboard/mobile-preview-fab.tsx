"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Eye, X, Share2 } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ShareModal } from "@/components/dashboard/share-modal";
import { usePreviewIframe } from "@/lib/hooks/use-preview-iframe";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://viopage.com";

export function MobilePreviewFAB() {
  const t = useTranslations("dashboard.preview");
  const { iframeSrc, refreshKey, username } = usePreviewIframe();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

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

          {/* Tappable URL bar — opens Share modal */}
          {username && (
            <div className="px-4 pb-3 shrink-0">
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
            </div>
          )}

          {/* Iframe preview — full size, no phone bezel */}
          <div className="flex-1 min-h-0 overflow-hidden bg-white mx-3 mb-3 rounded-xl border border-border">
            {iframeSrc ? (
              <iframe
                key={refreshKey}
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
