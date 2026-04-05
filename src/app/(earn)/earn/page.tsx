"use client";

import React, { useState } from "react";
import { DollarSign, CreditCard, QrCode, Settings2, Check, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useReferralStore } from "@/lib/stores/referral-store";
import { REFERRAL_MIN_PAYOUT_CENTS } from "@/lib/constants";
import { ReferralLinkSection } from "@/components/earn/referral-link-section";
import { EarnOverviewCards } from "@/components/earn/earn-overview-cards";
import { ConversionFunnel } from "@/components/earn/conversion-funnel";
import { PayoutHistoryTable } from "@/components/earn/payout-history-table";
import type { PayoutMethod } from "@/types/database";

function EarnPageSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Page title */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Referral link section */}
      <Skeleton className="h-24 w-full rounded-xl" />

      {/* Overview cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>

      {/* Conversion funnel */}
      <Skeleton className="h-48 w-full rounded-xl" />

      {/* Payout */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-9 w-32 rounded-lg" />
      </div>

      {/* Payout history */}
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}

export default function EarnPage() {
  const stats = useReferralStore((s) => s.stats);
  const payouts = useReferralStore((s) => s.payouts);
  const referralCode = useReferralStore((s) => s.referralCode);
  const payoutMethod = useReferralStore((s) => s.payoutMethod);
  const payoutDestination = useReferralStore((s) => s.payoutDestination);
  const loading = useReferralStore((s) => s.loading);
  const savePayoutSettings = useReferralStore((s) => s.savePayoutSettings);
  const requestPayout = useReferralStore((s) => s.requestPayout);
  const t = useTranslations("referral");

  const [editingPayout, setEditingPayout] = useState(false);
  const [method, setMethod] = useState<PayoutMethod>(payoutMethod ?? "paypal");
  const [destination, setDestination] = useState(payoutDestination ?? "");
  const [savingSettings, setSavingSettings] = useState(false);
  const [requestingPayout, setRequestingPayout] = useState(false);

  const minPayoutFormatted = `$${(REFERRAL_MIN_PAYOUT_CENTS / 100).toFixed(2)}`;
  const hasPayoutSettings = !!payoutMethod && !!payoutDestination;
  const canRequestPayout = hasPayoutSettings && (stats?.availableCents ?? 0) >= REFERRAL_MIN_PAYOUT_CENTS;

  async function handleSaveSettings() {
    if (!destination.trim()) return;
    setSavingSettings(true);
    const ok = await savePayoutSettings(method, destination.trim());
    setSavingSettings(false);
    if (ok) {
      toast.success(t("payoutSettingsSaved"));
      setEditingPayout(false);
    } else {
      toast.error("Failed to save settings");
    }
  }

  async function handleRequestPayout() {
    setRequestingPayout(true);
    const ok = await requestPayout();
    setRequestingPayout(false);
    if (ok) {
      toast.success(t("payoutSuccess"));
    } else {
      toast.error(t("minimumNotMet"));
    }
  }

  if (loading) {
    return <EarnPageSkeleton />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-semibold text-[#1E1E2E] tracking-[-0.02em]">
          {t("pageTitle")}
        </h1>
        <p className="mt-1.5 text-sm text-[#6b7280] leading-relaxed">
          {t("pageSubtitle")}
        </p>
      </div>

      {/* Referral link */}
      <ReferralLinkSection referralCode={referralCode} />

      {/* Earnings cards */}
      <EarnOverviewCards stats={stats} />

      {/* Funnel */}
      <ConversionFunnel stats={stats} />

      {/* Payment Settings */}
      <section className="rounded-xl bg-white border border-gray-100 p-6 shadow-sm">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
            <Settings2 className="h-4 w-4 text-blue-500" />
          </div>
          <h2 className="text-base font-semibold text-gray-900">
            {t("payoutSettings")}
          </h2>
        </div>

        {hasPayoutSettings && !editingPayout ? (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {payoutMethod === "paypal" ? (
                <CreditCard className="h-5 w-5 text-gray-400" />
              ) : (
                <QrCode className="h-5 w-5 text-gray-400" />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {payoutMethod === "paypal" ? "PayPal" : "Pix"}
                </p>
                <p className="text-sm text-gray-500">
                  {payoutDestination!.slice(0, 3)}***{payoutDestination!.slice(-4)}
                </p>
              </div>
              <Check className="h-4 w-4 text-green-500" />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setMethod(payoutMethod!);
                setDestination(payoutDestination!);
                setEditingPayout(true);
              }}
            >
              {t("editSettings")}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              {(["paypal", "pix"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`flex items-center gap-2 rounded-xl border-2 p-3 text-left transition-all ${
                    method === m
                      ? "border-orange-400 bg-orange-50"
                      : "border-gray-200 bg-white hover:border-gray-300"
                  }`}
                >
                  {m === "paypal" ? (
                    <CreditCard className={`h-4 w-4 ${method === m ? "text-orange-500" : "text-gray-400"}`} />
                  ) : (
                    <QrCode className={`h-4 w-4 ${method === m ? "text-orange-500" : "text-gray-400"}`} />
                  )}
                  <span className={`text-sm font-medium ${method === m ? "text-orange-700" : "text-gray-700"}`}>
                    {m === "paypal" ? "PayPal" : "Pix"}
                  </span>
                </button>
              ))}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                {method === "paypal" ? t("paypalEmail") : t("pixKey")}
              </label>
              <input
                type={method === "paypal" ? "email" : "text"}
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder={method === "paypal" ? "your@email.com" : "CPF, e-mail, phone, or random key"}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-100"
              />
            </div>
            <div className="flex gap-2">
              {hasPayoutSettings && (
                <Button variant="outline" size="sm" onClick={() => setEditingPayout(false)}>
                  {t("cancel")}
                </Button>
              )}
              <Button
                size="sm"
                disabled={!destination.trim() || savingSettings}
                onClick={handleSaveSettings}
                className="bg-[#FF6B35] hover:bg-[#e55a25] text-white"
              >
                {savingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : t("saveSettings")}
              </Button>
            </div>
          </div>
        )}
      </section>

      {/* Payout section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground">
            {t("payoutHistory")}
          </h2>

          <Button
            onClick={handleRequestPayout}
            disabled={!canRequestPayout || requestingPayout}
            className="gap-2 bg-[#FF6B35] hover:bg-[#e55a25] text-white"
            size="sm"
          >
            {requestingPayout ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <DollarSign className="size-4" strokeWidth={2} />
            )}
            {t("requestPayout")}
          </Button>
        </div>

        {!hasPayoutSettings && (
          <p className="text-sm text-amber-600 bg-amber-50 rounded-lg px-4 py-2.5 border border-amber-100">
            {t("setupPayoutFirst")}
          </p>
        )}

        <p className="text-xs text-gray-400">
          {t("minimumPayout", { amount: minPayoutFormatted })}
        </p>

        <PayoutHistoryTable payouts={payouts} />
      </section>
    </div>
  );
}
