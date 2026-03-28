"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Crown } from "lucide-react";
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

      <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-white">
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
    </div>
  );
}
