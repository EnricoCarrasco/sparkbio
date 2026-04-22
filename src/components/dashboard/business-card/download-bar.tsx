"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { toPng } from "html-to-image";
import { Download, Loader2, ArrowRight } from "lucide-react";
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
    <div
      className="dash-panel"
      style={{
        background:
          "linear-gradient(135deg, var(--dash-cream-2), var(--dash-cream))",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 14,
          flexWrap: "wrap",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: "var(--dash-ink)" }}>
            Export your card
          </div>
          <div
            style={{
              fontSize: 12,
              color: "var(--dash-muted)",
              marginTop: 2,
              letterSpacing: "0.01em",
            }}
          >
            Print-ready at 300 dpi · 85 × 55 mm with 3 mm bleed
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="dash-btn-ghost"
            style={{
              padding: "8px 14px",
              fontSize: 13,
              opacity: downloading ? 0.55 : 1,
              cursor: downloading ? "not-allowed" : "pointer",
            }}
          >
            {downloading ? (
              <Loader2
                style={{ width: 14, height: 14 }}
                className="animate-spin"
              />
            ) : (
              <Download style={{ width: 14, height: 14 }} />
            )}
            PNG
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="dash-btn-ghost"
            style={{
              padding: "8px 14px",
              fontSize: 13,
              opacity: downloading ? 0.55 : 1,
              cursor: downloading ? "not-allowed" : "pointer",
            }}
            title="Coming soon"
          >
            PDF
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="dash-btn-primary"
            style={{
              padding: "8px 16px",
              fontSize: 13,
              background: "var(--dash-orange)",
              boxShadow: "0 10px 24px rgba(255,107,53,0.25)",
              opacity: downloading ? 0.55 : 1,
              cursor: downloading ? "not-allowed" : "pointer",
            }}
          >
            {downloading ? (
              <>
                <Loader2
                  style={{ width: 14, height: 14 }}
                  className="animate-spin"
                />
                {t("exporting")}
              </>
            ) : (
              <>
                {t("saveAndExport")}
                <ArrowRight style={{ width: 14, height: 14 }} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
