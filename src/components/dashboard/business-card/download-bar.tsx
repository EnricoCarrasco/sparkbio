"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { toPng } from "html-to-image";
import { Download, Save, Loader2 } from "lucide-react";
import { useBusinessCardStore } from "@/lib/stores/business-card-store";
import { useProfileStore } from "@/lib/stores/profile-store";
import { toast } from "sonner";

interface DownloadBarProps {
  cardRef: React.RefObject<HTMLDivElement | null>;
}

export function DownloadBar({ cardRef }: DownloadBarProps) {
  const t = useTranslations("dashboard.businessCard");
  const downloading = useBusinessCardStore((s) => s.downloading);
  const setDownloading = useBusinessCardStore((s) => s.setDownloading);
  const username = useProfileStore((s) => s.profile?.username);

  async function handleDownload() {
    if (!cardRef.current) {
      toast.error(t("toastCardNotReady"));
      return;
    }

    setDownloading(true);
    try {
      const el = cardRef.current;

      // Wait for all images inside the card to finish loading before capture.
      // This prevents html-to-image from encountering broken/mid-loading images
      // which would reject with a DOM Event and crash React reconciliation.
      const images = el.querySelectorAll("img");
      await Promise.all(
        Array.from(images).map((img) =>
          img.complete
            ? Promise.resolve()
            : new Promise<void>((resolve) => {
                img.onload = () => resolve();
                img.onerror = () => resolve();
              })
        )
      );

      // Use html-to-image's style option to override transforms on its internal
      // clone instead of mutating the live DOM. This avoids the 700ms CSS
      // transition causing a mid-animation capture.
      const dataUrl = await toPng(el, {
        pixelRatio: 3, // 3x for crisp print-quality export (1800×1125)
        width: 600,
        height: 375,
        style: {
          transform: "none",
          transformOrigin: "top left",
          transition: "none",
        },
      });

      // Create download link
      const link = document.createElement("a");
      link.download = `viopage-card-${username || "card"}.png`;
      link.href = dataUrl;
      link.click();

      toast.success(t("toastCardDownloaded"));
    } catch (error) {
      console.error("Download error:", error);
      toast.error(t("toastDownloadError"));
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
      >
        <Download className="w-4 h-4" />
        {t("downloadCardPng")}
      </button>
      <div className="flex-1" />
      <button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
        className="h-11 px-6 rounded-xl bg-[#FF6B35] text-white text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#e55a2b] disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-xl shadow-[#FF6B35]/25 hover:scale-[1.02] active:scale-[0.98]"
      >
        {downloading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            {t("exporting")}
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            {t("saveAndExport")}
          </>
        )}
      </button>
    </div>
  );
}
