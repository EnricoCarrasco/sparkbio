"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Crown, Sparkles } from "lucide-react";
import { useBusinessCardStore } from "@/lib/stores/business-card-store";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useSocialStore } from "@/lib/stores/social-store";
import { useSubscriptionStore } from "@/lib/stores/subscription-store";
import { UpgradeDialog } from "@/components/billing/upgrade-dialog";
import { TemplateSelector } from "./template-selector";
import { CardEditor } from "./card-editor";
import { AiBackgroundGenerator } from "./ai-background-generator";
import { AiLogoGenerator } from "./ai-logo-generator";
import { CardPreview } from "./card-preview";
import { DownloadBar } from "./download-bar";

function PreviewHeader() {
  const t = useTranslations("dashboard.businessCard");
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {t("livePreview")}
      </span>
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] text-muted-foreground">{t("live")}</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
          <span className="text-[10px] text-muted-foreground">{t("aiAssisted")}</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-[10px] text-muted-foreground">{t("highDpi")}</span>
        </span>
      </div>
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

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">
            {t("title")}
          </h1>
          <Sparkles className="w-7 h-7 text-[#8B5CF6]" />
        </div>
        <p className="text-muted-foreground text-base">
          {t("subtitle")}
        </p>
      </div>

      {/* Mobile: Preview first (order-1), then editor. Desktop: side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Preview — shows first on mobile (order), sticky sidebar on desktop */}
        <div className="order-first lg:order-last lg:col-span-5">
          <div className="lg:sticky lg:top-24 space-y-5">
            <PreviewHeader />
            <CardPreview cardRef={cardRef} demoMode={!isPro} />

            {username && (
              <p className="text-xs text-muted-foreground text-center">
                {siteUrl}/{username}
              </p>
            )}

            {/* Pro Tip (desktop only) */}
            <div className="hidden lg:block rounded-2xl p-5 bg-[#FF6B35]/5 border border-[#FF6B35]/10">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#FF6B35]/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4 text-[#FF6B35]" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{t("proTip")}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t("proTipDescription")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Left Column — Editor */}
        <div className="lg:col-span-7 space-y-6">
          {isPro ? (
            <>
              <TemplateSelector />
              <CardEditor />
              <AiLogoGenerator />
              <AiBackgroundGenerator />
              <DownloadBar cardRef={cardRef} />
            </>
          ) : (
            <div className="relative">
              {/* Blurred editor preview */}
              <div className="pointer-events-none select-none opacity-30 blur-[3px]">
                <TemplateSelector />
                <CardEditor />
              </div>

              {/* Upgrade overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white rounded-2xl shadow-xl border border-zinc-100 p-8 max-w-sm mx-4 text-center">
                  <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-[#FF6B35]/10 mb-4">
                    <Crown className="size-7 text-[#FF6B35]" />
                  </div>
                  <h3 className="text-xl font-bold text-zinc-900 mb-2">
                    {t("title")}
                  </h3>
                  <p className="text-sm text-zinc-500 mb-6 leading-relaxed">
                    {t("upgradeDescription")}
                  </p>
                  <button
                    type="button"
                    onClick={() => setUpgradeOpen(true)}
                    className="w-full flex items-center justify-center gap-2 bg-[#FF6B35] hover:bg-[#e85a24] text-white font-bold py-3.5 px-6 rounded-full shadow-lg shadow-orange-100 transition-all active:scale-[0.98]"
                  >
                    <Crown className="size-4" />
                    {t("upgradeToPro")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </div>
  );
}
