"use client";

import React, { useState } from "react";
import { DollarSign, CreditCard, QrCode, Check, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { useReferralStore } from "@/lib/stores/referral-store";
import { REFERRAL_MIN_PAYOUT_CENTS } from "@/lib/constants";
import { ReferralLinkSection } from "@/components/earn/referral-link-section";
import { EarnOverviewCards } from "@/components/earn/earn-overview-cards";
import { ConversionFunnel } from "@/components/earn/conversion-funnel";
import { PayoutHistoryTable } from "@/components/earn/payout-history-table";
import type { PayoutMethod } from "@/types/database";
import {
  DASH,
  Eyebrow,
  Italic,
} from "@/components/dashboard/_dash-primitives";

function EarnPageSkeleton() {
  return (
    <div className="dash-tab-pad">
      <div className="dash-tab-head">
        <div>
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-10 w-80 mt-3" />
          <Skeleton className="h-4 w-96 mt-3" />
        </div>
      </div>
      <Skeleton className="h-28 w-full rounded-xl mb-4" />
      <div className="dash-stats-strip" style={{ marginBottom: 16 }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-48 w-full rounded-xl mb-4" />
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
  const canRequestPayout =
    hasPayoutSettings &&
    (stats?.availableCents ?? 0) >= REFERRAL_MIN_PAYOUT_CENTS;

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
    <div className="dash-tab-pad">
      <div className="dash-tab-head">
        <div>
          <Eyebrow>{t("pageTitle")}</Eyebrow>
          <h1 className="dash-page-title">
            Earn with <Italic>Viopage</Italic>.
          </h1>
          <p className="dash-page-sub">{t("pageSubtitle")}</p>
        </div>
      </div>

      <ReferralLinkSection referralCode={referralCode} />

      <EarnOverviewCards stats={stats} />

      <ConversionFunnel stats={stats} />

      {/* Payout settings */}
      <section className="dash-panel" style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
          <Eyebrow>{t("payoutSettings")}</Eyebrow>
          {hasPayoutSettings && !editingPayout ? (
            <button
              type="button"
              onClick={() => {
                setMethod(payoutMethod!);
                setDestination(payoutDestination!);
                setEditingPayout(true);
              }}
              className="dash-btn-ghost"
            >
              {t("editSettings")}
            </button>
          ) : null}
        </div>

        {hasPayoutSettings && !editingPayout ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {payoutMethod === "paypal" ? (
              <CreditCard className="h-5 w-5" style={{ color: DASH.muted }} />
            ) : (
              <QrCode className="h-5 w-5" style={{ color: DASH.muted }} />
            )}
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: DASH.ink, margin: 0 }}>
                {payoutMethod === "paypal" ? "PayPal" : "Pix"}
              </p>
              <p style={{ fontSize: 13, color: DASH.muted, margin: 0 }}>
                {payoutDestination!.slice(0, 3)}***{payoutDestination!.slice(-4)}
              </p>
            </div>
            <Check className="h-4 w-4" style={{ color: "#16a34a" }} />
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {(["paypal", "pix"] as const).map((m) => {
                const selected = method === m;
                const Icon = m === "paypal" ? CreditCard : QrCode;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMethod(m)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      borderRadius: 14,
                      border: selected ? `2px solid ${DASH.orange}` : `1px solid ${DASH.line}`,
                      padding: 12,
                      textAlign: "left",
                      background: selected ? DASH.orangeTint : DASH.cream,
                      cursor: "pointer",
                      transition: "all .15s",
                    }}
                  >
                    <Icon className="h-4 w-4" style={{ color: selected ? DASH.orangeDeep : DASH.muted }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: selected ? DASH.orangeDeep : DASH.ink }}>
                      {m === "paypal" ? "PayPal" : "Pix"}
                    </span>
                  </button>
                );
              })}
            </div>
            <div>
              <div style={{ marginBottom: 6 }}>
                <Eyebrow color={DASH.muted}>
                  {method === "paypal" ? t("paypalEmail") : t("pixKey")}
                </Eyebrow>
              </div>
              <div className="dash-field-input">
                <input
                  type={method === "paypal" ? "email" : "text"}
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder={
                    method === "paypal"
                      ? "your@email.com"
                      : "CPF, e-mail, phone, or random key"
                  }
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              {hasPayoutSettings && (
                <button
                  type="button"
                  className="dash-btn-ghost"
                  onClick={() => setEditingPayout(false)}
                >
                  {t("cancel")}
                </button>
              )}
              <button
                type="button"
                className="dash-btn-primary"
                disabled={!destination.trim() || savingSettings}
                onClick={handleSaveSettings}
                style={{
                  background: DASH.orange,
                  opacity: !destination.trim() || savingSettings ? 0.6 : 1,
                }}
              >
                {savingSettings ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  t("saveSettings")
                )}
              </button>
            </div>
          </div>
        )}
      </section>

      {/* Payout request + history */}
      <section>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
            marginBottom: 14,
          }}
        >
          <Eyebrow>{t("payoutHistory")}</Eyebrow>
          <button
            type="button"
            onClick={handleRequestPayout}
            disabled={!canRequestPayout || requestingPayout}
            className="dash-btn-primary"
            style={{
              background: DASH.orange,
              opacity: !canRequestPayout || requestingPayout ? 0.5 : 1,
              cursor: !canRequestPayout ? "not-allowed" : "pointer",
            }}
          >
            {requestingPayout ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <DollarSign className="h-4 w-4" />
            )}
            {t("requestPayout")}
          </button>
        </div>

        {!hasPayoutSettings && (
          <div
            style={{
              fontSize: 13,
              color: "#b45309",
              background: "#fff7ed",
              borderRadius: 12,
              padding: "10px 14px",
              border: "1px solid #fed7aa",
              marginBottom: 12,
            }}
          >
            {t("setupPayoutFirst")}
          </div>
        )}

        <p style={{ fontSize: 11.5, color: DASH.muted, margin: "0 0 12px" }}>
          {t("minimumPayout", { amount: minPayoutFormatted })}
        </p>

        <PayoutHistoryTable payouts={payouts} />
      </section>
    </div>
  );
}
