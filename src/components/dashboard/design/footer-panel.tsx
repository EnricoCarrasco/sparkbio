"use client";

import React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Crown, DollarSign } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useThemeStore } from "@/lib/stores/theme-store";
import { useSubscriptionStore } from "@/lib/stores/subscription-store";
import { UpgradeButton } from "@/components/billing/upgrade-button";

export function FooterPanel() {
  const t = useTranslations("dashboard.design");
  const theme = useThemeStore((s) => s.theme);
  const updateTheme = useThemeStore((s) => s.updateTheme);
  const isPro = useSubscriptionStore((s) => s.isPro);

  if (!theme) return null;

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-foreground">{t("footerSection")}</h3>

      <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-orange-50">
        <div className="space-y-0.5">
          <Label className="text-sm font-medium flex items-center gap-1.5">
            {t("hideFooter")}
            {!isPro && <Crown className="size-3.5 text-amber-500" />}
          </Label>
          <p className="text-xs text-muted-foreground">{t("hideFooterDesc")}</p>
        </div>
        {isPro ? (
          <Switch
            checked={theme.hide_footer}
            onCheckedChange={(v) => updateTheme({ hide_footer: v })}
          />
        ) : (
          <UpgradeButton />
        )}
      </div>

      {/* Earn commission motivation */}
      <Link
        href="/earn"
        className="flex items-start gap-3 p-4 rounded-xl border border-green-200 bg-green-50 hover:bg-green-100 transition-colors cursor-pointer"
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100">
          <DollarSign className="h-4 w-4 text-green-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-green-800">
            {t("earnCommissionTitle")}
          </p>
          <p className="text-xs text-green-600 mt-0.5">
            {t("earnCommissionDesc")}
          </p>
        </div>
      </Link>
    </div>
  );
}
