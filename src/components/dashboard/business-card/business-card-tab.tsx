"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Crown, Sparkles } from "lucide-react";
import { useBusinessCardStore } from "@/lib/stores/business-card-store";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useSocialStore } from "@/lib/stores/social-store";
import { useSubscriptionStore } from "@/lib/stores/subscription-store";
import { UpgradeDialog } from "@/components/billing/upgrade-dialog";
import {
  DASH_MONO,
  Eyebrow,
  Italic,
} from "@/components/dashboard/_dash-primitives";
import { TemplateSelector } from "./template-selector";
import { CardEditor } from "./card-editor";
import { AiBackgroundGenerator } from "./ai-background-generator";
import { AiLogoGenerator } from "./ai-logo-generator";
import { CardPreview } from "./card-preview";
import { DownloadBar } from "./download-bar";

function PreviewBadges() {
  const t = useTranslations("dashboard.businessCard");
  const badge: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    fontSize: 10,
    letterSpacing: "0.04em",
    color: "var(--dash-muted)",
    fontWeight: 500,
  };
  const dot = (bg: string, pulse = false): React.CSSProperties => ({
    width: 6,
    height: 6,
    borderRadius: 999,
    background: bg,
    boxShadow: pulse ? `0 0 0 3px ${bg}22` : undefined,
  });
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      <span style={badge}>
        <span style={dot("#16a34a", true)} />
        {t("live")}
      </span>
      <span style={badge}>
        <span style={dot("#8B5CF6")} />
        {t("aiAssisted")}
      </span>
      <span style={badge}>
        <span style={dot("#3b82f6")} />
        {t("highDpi")}
      </span>
    </div>
  );
}

export function BusinessCardTab() {
  const t = useTranslations("dashboard.businessCard");
  const cardRef = useRef<HTMLDivElement>(null);
  const profile = useProfileStore((s) => s.profile);
  const socialIcons = useSocialStore((s) => s.socialIcons);
  const initFromProfile = useBusinessCardStore((s) => s.initFromProfile);
  const loadFromSupabase = useBusinessCardStore((s) => s.loadFromSupabase);
  const flushSave = useBusinessCardStore((s) => s.flushSave);
  const loaded = useBusinessCardStore((s) => s.loaded);
  const username = useProfileStore((s) => s.profile?.username);

  const isPro = useSubscriptionStore((s) => s.isPro);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://viopage.com";

  // Load saved card settings from Supabase on mount
  useEffect(() => {
    if (profile && !loaded) {
      loadFromSupabase(profile.id);
    }
  }, [profile, loaded, loadFromSupabase]);

  // Auto-populate empty fields from profile data
  useEffect(() => {
    if (profile && socialIcons && loaded) {
      initFromProfile(profile, socialIcons);
    }
  }, [profile, socialIcons, loaded, initFromProfile]);

  // Flush any pending debounced save when the user navigates away or the tab unmounts.
  // Without this, an edit made <500ms before leaving is silently lost.
  useEffect(() => {
    const onHide = () => {
      void flushSave();
    };
    window.addEventListener("pagehide", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
      void flushSave();
    };
  }, [flushSave]);

  const cleanUrl = siteUrl.replace(/^https?:\/\//, "");

  return (
    <div className="dash-tab-pad">
      {/* Editorial tab header */}
      <div className="dash-tab-head">
        <div>
          <Eyebrow>Business card studio</Eyebrow>
          <h1
            className="dash-page-title"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
              margin: "6px 0",
            }}
          >
            <span>
              AI Business <Italic>Card</Italic>
            </span>
            <Sparkles style={{ color: "#8B5CF6", width: 26, height: 26 }} />
          </h1>
          <p className="dash-page-sub">
            Create a professional card with your QR code. AI-generated logos, custom
            backgrounds, print-ready export.
          </p>
        </div>
      </div>

      {/* Responsive two-column grid.
          Desktop: editor 1fr + preview 420px. Mobile: single column, preview on top. */}
      <div
        className="bc-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 420px",
          gap: 28,
          alignItems: "flex-start",
        }}
      >
        {/* Editor column */}
        <div
          className="bc-editor-col"
          style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}
        >
          {isPro ? (
            <>
              <TemplateSelector />
              <CardEditor />
              <AiLogoGenerator />
              <AiBackgroundGenerator />
              <DownloadBar cardRef={cardRef} />
            </>
          ) : (
            <div style={{ position: "relative" }}>
              {/* Blurred editor preview */}
              <div
                style={{
                  pointerEvents: "none",
                  userSelect: "none",
                  opacity: 0.3,
                  filter: "blur(3px)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 16,
                }}
              >
                <TemplateSelector />
                <CardEditor />
              </div>

              {/* Upgrade overlay */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div
                  className="dash-panel"
                  style={{
                    maxWidth: 360,
                    textAlign: "center",
                    padding: 28,
                    boxShadow: "0 18px 40px rgba(17,17,19,0.10)",
                  }}
                >
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      background: "var(--dash-orange-tint)",
                      color: "var(--dash-orange)",
                      marginBottom: 14,
                    }}
                  >
                    <Crown style={{ width: 28, height: 28 }} />
                  </div>
                  <h3
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: "var(--dash-ink)",
                      margin: "0 0 8px",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {t("title")}
                  </h3>
                  <p
                    style={{
                      fontSize: 13,
                      color: "var(--dash-muted)",
                      lineHeight: 1.5,
                      margin: "0 0 20px",
                    }}
                  >
                    {t("upgradeDescription")}
                  </p>
                  <button
                    type="button"
                    onClick={() => setUpgradeOpen(true)}
                    className="dash-btn-primary"
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      background: "var(--dash-orange)",
                      boxShadow: "0 10px 24px rgba(255,107,53,0.25)",
                    }}
                  >
                    <Crown style={{ width: 16, height: 16 }} />
                    {t("upgradeToPro")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Preview column (sticky on desktop) */}
        <div
          className="bc-preview-col"
          style={{ position: "relative", minWidth: 0 }}
        >
          <div
            style={{
              position: "sticky",
              top: 20,
              display: "flex",
              flexDirection: "column",
              gap: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 8,
              }}
            >
              <Eyebrow>{t("livePreview")}</Eyebrow>
              <PreviewBadges />
            </div>

            <CardPreview cardRef={cardRef} demoMode={!isPro} />

            {username && (
              <p
                style={{
                  textAlign: "center",
                  fontSize: 11,
                  color: "var(--dash-muted)",
                  fontFamily: DASH_MONO,
                  margin: 0,
                  letterSpacing: "0.02em",
                }}
              >
                {cleanUrl}/{username}
              </p>
            )}

            {/* Pro Tip box */}
            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
                padding: 14,
                borderRadius: 14,
                background: "var(--dash-orange-tint)",
                border: "1px solid rgba(255,107,53,0.15)",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 8,
                  background: "rgba(255,107,53,0.18)",
                  color: "var(--dash-orange)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Sparkles style={{ width: 14, height: 14 }} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: "var(--dash-ink)" }}>
                  {t("proTip")}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--dash-muted)",
                    marginTop: 2,
                    lineHeight: 1.5,
                  }}
                >
                  {t("proTipDescription")}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Responsive override: stack editor/preview, show preview first on small screens */}
      <style jsx>{`
        @media (max-width: 1000px) {
          :global(.bc-grid) {
            grid-template-columns: minmax(0, 1fr) !important;
            gap: 20px !important;
          }
          :global(.bc-preview-col) {
            order: -1;
          }
          :global(.bc-preview-col > div) {
            position: static !important;
          }
        }
      `}</style>

      <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </div>
  );
}
