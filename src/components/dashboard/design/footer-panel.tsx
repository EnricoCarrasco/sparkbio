"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Crown, DollarSign, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useThemeStore } from "@/lib/stores/theme-store";
import { useSubscriptionStore } from "@/lib/stores/subscription-store";
import { UpgradeButton } from "@/components/billing/upgrade-button";

export function FooterPanel() {
  const t = useTranslations("dashboard.design");
  const theme = useThemeStore((s) => s.theme);
  const updateTheme = useThemeStore((s) => s.updateTheme);
  const isPro = useSubscriptionStore((s) => s.isPro);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!theme) return null;

  function handleToggle(checked: boolean) {
    if (checked) {
      // Turning ON hide_footer — show confirmation popup
      setShowConfirm(true);
    } else {
      // Turning OFF hide_footer (showing footer again) — no confirmation needed
      updateTheme({ hide_footer: false });
    }
  }

  function confirmHide() {
    updateTheme({ hide_footer: true });
    setShowConfirm(false);
  }

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
            onCheckedChange={handleToggle}
          />
        ) : (
          <UpgradeButton />
        )}
      </div>

      {/* Confirmation popup when hiding footer */}
      <AnimatePresence>
        {showConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              onClick={() => setShowConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.2 }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl ring-1 ring-gray-100"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900">
                    {t("hideFooterConfirmTitle")}
                  </h3>
                  <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">
                    {t("hideFooterConfirmDesc")}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mt-5">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => setShowConfirm(false)}
                >
                  {t("hideFooterKeep")}
                </Button>
                <Button
                  size="sm"
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                  onClick={confirmHide}
                >
                  {t("hideFooterConfirm")}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

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
