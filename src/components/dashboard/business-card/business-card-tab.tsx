"use client";

import React, { useEffect, useRef } from "react";
import { Sparkles } from "lucide-react";
import { useBusinessCardStore } from "@/lib/stores/business-card-store";
import { useProfileStore } from "@/lib/stores/profile-store";
import { useSocialStore } from "@/lib/stores/social-store";
import { TemplateSelector } from "./template-selector";
import { CardEditor } from "./card-editor";
import { AiBackgroundGenerator } from "./ai-background-generator";
import { AiLogoGenerator } from "./ai-logo-generator";
import { CardPreview } from "./card-preview";
import { DownloadBar } from "./download-bar";

function PreviewHeader() {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Live Preview
      </span>
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-[10px] text-muted-foreground">Live</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
          <span className="text-[10px] text-muted-foreground">AI Assisted</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-[10px] text-muted-foreground">High DPI</span>
        </span>
      </div>
    </div>
  );
}

export function BusinessCardTab() {
  const cardRef = useRef<HTMLDivElement>(null);
  const profile = useProfileStore((s) => s.profile);
  const socialIcons = useSocialStore((s) => s.socialIcons);
  const initFromProfile = useBusinessCardStore((s) => s.initFromProfile);
  const loadFromSupabase = useBusinessCardStore((s) => s.loadFromSupabase);
  const loaded = useBusinessCardStore((s) => s.loaded);
  const username = useProfileStore((s) => s.profile?.username);

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

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">
            AI Business Card
          </h1>
          <Sparkles className="w-7 h-7 text-[#8B5CF6]" />
        </div>
        <p className="text-muted-foreground text-base">
          Create a professional card with your QR code
        </p>
      </div>

      {/* Mobile: Preview first (order-1), then editor. Desktop: side-by-side */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Preview — shows first on mobile (order), sticky sidebar on desktop */}
        <div className="order-first lg:order-last lg:col-span-5">
          <div className="lg:sticky lg:top-24 space-y-5">
            <PreviewHeader />
            <CardPreview cardRef={cardRef} />

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
                  <p className="text-sm font-semibold">Pro Tip</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Business cards with QR codes get 30% more engagement.
                    Try generating an AI background that matches your brand colors!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Left Column — Editor */}
        <div className="lg:col-span-7 space-y-6">
          <TemplateSelector />
          <CardEditor />
          <AiLogoGenerator />
          <AiBackgroundGenerator />
          <DownloadBar cardRef={cardRef} />
        </div>
      </div>
    </div>
  );
}
