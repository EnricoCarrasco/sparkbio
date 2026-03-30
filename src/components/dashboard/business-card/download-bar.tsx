"use client";

import React from "react";
import { toPng } from "html-to-image";
import { Download, Save, Loader2 } from "lucide-react";
import { useBusinessCardStore } from "@/lib/stores/business-card-store";
import { useProfileStore } from "@/lib/stores/profile-store";
import { toast } from "sonner";

interface DownloadBarProps {
  cardRef: React.RefObject<HTMLDivElement | null>;
}

export function DownloadBar({ cardRef }: DownloadBarProps) {
  const downloading = useBusinessCardStore((s) => s.downloading);
  const setDownloading = useBusinessCardStore((s) => s.setDownloading);
  const username = useProfileStore((s) => s.profile?.username);

  async function handleDownload() {
    if (!cardRef.current) {
      toast.error("Card preview not ready");
      return;
    }

    setDownloading(true);
    try {
      // Temporarily remove the CSS scale transform so we capture at full 600px size
      const el = cardRef.current;
      const origTransform = el.style.transform;
      const origTransformOrigin = el.style.transformOrigin;
      el.style.transform = "none";
      el.style.transformOrigin = "";

      const dataUrl = await toPng(el, {
        pixelRatio: 3, // 3x for crisp print-quality export (1800×1125)
        cacheBust: true,
      });

      // Restore original transform
      el.style.transform = origTransform;
      el.style.transformOrigin = origTransformOrigin;

      // Create download link
      const link = document.createElement("a");
      link.download = `viopage-card-${username || "card"}.png`;
      link.href = dataUrl;
      link.click();

      toast.success("Card downloaded!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download card. Please try again.");
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
        Download Card (PNG)
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
            Exporting...
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            Save and Export
          </>
        )}
      </button>
    </div>
  );
}
