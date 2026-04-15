"use client";

import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Crown, RotateCcw, Sparkles } from "lucide-react";
import { useThemeStore } from "@/lib/stores/theme-store";
import { useSubscriptionStore } from "@/lib/stores/subscription-store";
import { UpgradeDialog } from "@/components/billing/upgrade-dialog";
import {
  countPreviewedProCategories,
  hasLapsedSubscription,
} from "@/lib/pro-fields";

/**
 * Surfaces Pro-only customizations a free user is "aspirationally" previewing
 * in their dashboard. Lives above the preview iframe and invites an upgrade
 * without blocking the creator's experimentation.
 *
 * Renders nothing for Pro users on an active plan.
 */
export function PreviewBanner() {
  const t = useTranslations("dashboard.preview");
  const theme = useThemeStore((s) => s.theme);
  const restorePreProSnapshot = useThemeStore((s) => s.restorePreProSnapshot);
  const isPro = useSubscriptionStore((s) => s.isPro);
  const subscription = useSubscriptionStore((s) => s.subscription);
  const [upgradeOpen, setUpgradeOpen] = useState(false);

  if (!theme) return null;

  // Lapse state wins over "previewing" — if they WERE Pro and lost it, the
  // page has just silently degraded, and that's the story worth telling.
  if (!isPro && hasLapsedSubscription(subscription?.status)) {
    return (
      <>
        <button
          type="button"
          onClick={() => setUpgradeOpen(true)}
          className="mx-4 mt-3 flex w-auto items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-left transition-colors hover:bg-rose-100"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-rose-100">
            <Crown className="size-4 text-rose-600" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-xs font-semibold text-rose-900">
              {t("subscriptionEndedTitle")}
            </span>
            <span className="block text-[11px] text-rose-700">
              {t("subscriptionEndedDesc")}
            </span>
          </span>
          <span className="shrink-0 rounded-full bg-rose-600 px-3 py-1 text-[11px] font-semibold text-white">
            {t("renewCta")}
          </span>
        </button>
        <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
      </>
    );
  }

  if (isPro) return null;

  const { count } = countPreviewedProCategories(theme);
  if (count === 0) return null;
  // Restore is always offered when Pro features are active — the store falls
  // back to the public-page strip if no snapshot was captured.

  return (
    <>
      <div className="mx-4 mt-3 space-y-1.5">
        <button
          type="button"
          onClick={() => setUpgradeOpen(true)}
          className="flex w-full items-center gap-3 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-2.5 text-left transition-all hover:border-amber-300 hover:shadow-sm"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-100">
            <Sparkles className="size-4 text-amber-600" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-xs font-semibold text-amber-900">
              {t("previewingCount", { count })}
            </span>
            <span className="block text-[11px] text-amber-700">
              {t("upgradeToMakeLive")}
            </span>
          </span>
          <span className="shrink-0 rounded-full bg-amber-600 px-3 py-1 text-[11px] font-semibold text-white">
            {t("upgradeCta")}
          </span>
        </button>
        <button
          type="button"
          onClick={() => restorePreProSnapshot()}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-800"
        >
          <RotateCcw className="size-3" />
          {t("restorePrePro")}
        </button>
      </div>
      <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </>
  );
}
