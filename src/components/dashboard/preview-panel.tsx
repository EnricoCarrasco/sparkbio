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
import { Eyebrow } from "./_dash-primitives";

export function PreviewPanel() {
  const t = useTranslations("dashboard.preview");
  const theme = useThemeStore((s) => s.theme);
  const isPro = useSubscriptionStore((s) => s.isPro);
  const [mode, setMode] = useState<PreviewMode>("preview");
  const { iframeSrc, refreshKey, username } = usePreviewIframe(mode);
  const [shareOpen, setShareOpen] = useState(false);

  const proCount = theme ? countPreviewedProCategories(theme).count : 0;
  const showToggle = !isPro && proCount > 0;

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
    if (mode === "live" && !isPro) {
      setMode("preview");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [proFingerprint]);

  useEffect(() => {
    if (!showToggle && mode === "live") {
      setMode("preview");
    }
  }, [showToggle, mode]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        padding: "18px 16px 24px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
      >
        <Eyebrow>{t("livePreview")}</Eyebrow>
        {username && (
          <a
            href={`/${username}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              fontSize: 11,
              color: "var(--dash-orange-deep)",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            {t("openFullPage")} ↗
          </a>
        )}
      </div>

      <PreviewBanner />

      {showToggle && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <div
            role="tablist"
            aria-label={t("modeToggleLabel")}
            className="dash-seg"
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === "preview"}
              onClick={() => setMode("preview")}
              className={`dash-seg-btn ${mode === "preview" ? "active" : ""}`}
            >
              {t("modePreview")}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "live"}
              onClick={() => setMode("live")}
              className={`dash-seg-btn ${mode === "live" ? "active" : ""}`}
            >
              {t("modeLive")}
            </button>
          </div>
        </div>
      )}

      {/* Share URL pill */}
      {username && (
        <button
          type="button"
          onClick={() => setShareOpen(true)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 14px",
            borderRadius: 999,
            background: "#fff",
            border: "1px solid var(--dash-line)",
            marginBottom: 14,
            cursor: "pointer",
            width: "100%",
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "var(--dash-ink)",
              flex: 1,
              textAlign: "left",
            }}
          >
            viopage.com/<b>{username}</b>
          </span>
          <Share2 className="size-4" style={{ color: "var(--dash-muted)" }} />
        </button>
      )}

      {showToggle && (
        <p
          style={{
            fontSize: 11,
            fontWeight: 500,
            textAlign: "center",
            color: mode === "preview" ? "#b45309" : "#15803d",
            marginBottom: 10,
            marginTop: -6,
          }}
        >
          {mode === "preview" ? t("modePreviewDesc") : t("modeLiveDesc")}
        </p>
      )}

      {/* Phone frame */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "relative",
            width: 260,
            borderRadius: 44,
            padding: 8,
            background: "#111",
            boxShadow: "0 20px 40px rgba(17,17,19,.18)",
          }}
        >
          {/* Notch */}
          <div
            style={{
              position: "absolute",
              top: 14,
              left: "50%",
              transform: "translateX(-50%)",
              width: 86,
              height: 22,
              background: "#000",
              borderRadius: 999,
              zIndex: 2,
            }}
          />
          <div
            style={{
              width: "100%",
              aspectRatio: "9 / 19",
              borderRadius: 36,
              overflow: "hidden",
              background: "#fff",
            }}
          >
            {iframeSrc ? (
              <iframe
                key={`${mode}-${refreshKey}`}
                src={iframeSrc}
                title="Profile preview"
                className="w-full h-full border-0"
                style={{
                  transform: "scale(0.72)",
                  transformOrigin: "top left",
                  width: "138.9%",
                  height: "138.9%",
                }}
                sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
              />
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  fontSize: 12,
                  color: "var(--dash-muted)",
                }}
              >
                {t("loading")}
              </div>
            )}
          </div>
        </div>
      </div>

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
