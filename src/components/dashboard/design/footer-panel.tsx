"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useThemeStore } from "@/lib/stores/theme-store";

export function FooterPanel() {
  const t = useTranslations("dashboard.design");
  const theme = useThemeStore((s) => s.theme);
  const updateTheme = useThemeStore((s) => s.updateTheme);

  if (!theme) return null;

  return (
    <div className="space-y-6">
      <h3 className="text-sm font-semibold text-foreground">{t("footerSection")}</h3>

      <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-white">
        <div className="space-y-0.5">
          <Label className="text-sm font-medium">{t("hideFooter")}</Label>
          <p className="text-xs text-muted-foreground">{t("hideFooterDesc")}</p>
        </div>
        <Switch
          checked={theme.hide_footer}
          onCheckedChange={(v) => updateTheme({ hide_footer: v })}
        />
      </div>
    </div>
  );
}
