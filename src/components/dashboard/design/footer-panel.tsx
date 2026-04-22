"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Crown, DollarSign, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useThemeStore } from "@/lib/stores/theme-store";
import { useSubscriptionStore } from "@/lib/stores/subscription-store";
import { UpgradeButton } from "@/components/billing/upgrade-button";
import { Eyebrow } from "@/components/dashboard/_dash-primitives";

export function FooterPanel() {
  const t = useTranslations("dashboard.design");
  const theme = useThemeStore((s) => s.theme);
  const updateTheme = useThemeStore((s) => s.updateTheme);
  const isPro = useSubscriptionStore((s) => s.isPro);
  const [showConfirm, setShowConfirm] = useState(false);

  if (!theme) return null;

  function handleToggle(checked: boolean) {
    if (checked) {
      setShowConfirm(true);
    } else {
      updateTheme({ hide_footer: false });
    }
  }

  function confirmHide() {
    updateTheme({ hide_footer: true });
    setShowConfirm(false);
  }

  const on = theme.hide_footer;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="dash-panel">
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Eyebrow>{t("footerSection")}</Eyebrow>
          {!isPro && <Crown className="size-3 text-amber-500" />}
        </div>

        <div style={{ marginTop: 10 }}>
          {isPro ? (
            <label
              className="dash-toggle-row"
              style={{ padding: "14px 0", borderBottom: 0 }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "var(--dash-ink)" }}>
                  {t("hideFooter")}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--dash-muted)",
                    marginTop: 3,
                    lineHeight: 1.4,
                  }}
                >
                  {t("hideFooterDesc")}
                </div>
              </div>
              <span className="dash-switch" data-on={on}>
                <input
                  type="checkbox"
                  checked={on}
                  onChange={(e) => handleToggle(e.target.checked)}
                  style={{ display: "none" }}
                />
                <span className="dash-switch-track">
                  <span className="dash-switch-thumb" />
                </span>
              </span>
            </label>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                padding: "14px 0",
              }}
            >
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "var(--dash-ink)" }}>
                  {t("hideFooter")}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "var(--dash-muted)",
                    marginTop: 3,
                    lineHeight: 1.4,
                  }}
                >
                  {t("hideFooterDesc")}
                </div>
              </div>
              <UpgradeButton />
            </div>
          )}
        </div>
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
        className="dash-panel"
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 14,
          background: "#F0FDF4",
          borderColor: "#BBF7D0",
          textDecoration: "none",
          transition: "background 0.15s",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            flexShrink: 0,
            borderRadius: 10,
            background: "#DCFCE7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <DollarSign className="h-4 w-4" style={{ color: "#16A34A" }} />
        </div>
        <div>
          <p style={{ fontSize: 14, fontWeight: 600, color: "#166534", margin: 0 }}>
            {t("earnCommissionTitle")}
          </p>
          <p
            style={{
              fontSize: 12,
              color: "#15803D",
              marginTop: 4,
              lineHeight: 1.5,
            }}
          >
            {t("earnCommissionDesc")}
          </p>
        </div>
      </Link>
    </div>
  );
}
