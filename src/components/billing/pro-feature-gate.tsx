"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Crown } from "lucide-react";
import { useSubscriptionStore } from "@/lib/stores/subscription-store";
import { UpgradeDialog } from "./upgrade-dialog";

interface ProFeatureGateProps {
  children: React.ReactNode;
  /** Short label shown on the overlay, e.g. "Wallpapers" */
  featureLabel?: string;
}

/**
 * Wraps a section of the dashboard and overlays a blurred lock + upgrade CTA
 * when the user is on the free tier. Pro users see children normally.
 */
export function ProFeatureGate({ children, featureLabel }: ProFeatureGateProps) {
  const isPro = useSubscriptionStore((s) => s.isPro);
  const t = useTranslations("billing");
  const [open, setOpen] = useState(false);

  if (isPro) return <>{children}</>;

  return (
    <div className="relative">
      {/* Render children but make non-interactive */}
      <div className="pointer-events-none select-none opacity-40 blur-[2px]" aria-hidden>
        {children}
      </div>

      {/* Overlay CTA */}
      <div className="absolute inset-0 flex items-center justify-center">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex flex-col items-center gap-2 rounded-2xl bg-white/90 backdrop-blur-sm border border-amber-200 px-6 py-5 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            <Crown className="size-3" />
            {t("proBadge")}
          </span>
          {featureLabel && (
            <p className="text-sm font-medium text-foreground">{featureLabel}</p>
          )}
          <p className="text-xs text-muted-foreground max-w-[200px] text-center">
            {t("upgradeToUnlock")}
          </p>
        </button>
      </div>

      <UpgradeDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
