"use client"

import { CreditCard, QrCode, ReceiptText } from "lucide-react"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import type { ReferralPayout, ReferralPayoutStatus, PayoutMethod } from "@/types/database"
import { DASH, Eyebrow, Pill } from "@/components/dashboard/_dash-primitives"

interface PayoutHistoryTableProps {
  payouts: ReferralPayout[]
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

const statusTone: Record<ReferralPayoutStatus, "orange" | "cream" | "green" | "red"> = {
  requested: "orange",
  processing: "cream",
  completed: "green",
  failed: "red",
}

const statusI18nKeys: Record<ReferralPayoutStatus, string> = {
  requested: "statusRequested",
  processing: "statusProcessing",
  completed: "statusCompleted",
  failed: "statusFailed",
}

const methodConfig: Record<PayoutMethod, { label: string; icon: React.ElementType }> = {
  paypal: { label: "PayPal", icon: CreditCard },
  pix: { label: "Pix", icon: QrCode },
}

function StatusBadge({ status, t }: { status: ReferralPayoutStatus; t: (key: string) => string }) {
  return <Pill tone={statusTone[status]}>{t(statusI18nKeys[status])}</Pill>
}

function MethodCell({ method }: { method: PayoutMethod }) {
  const config = methodConfig[method]
  const Icon = config.icon
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: 13,
        color: DASH.muted,
      }}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {config.label}
    </span>
  )
}

export function PayoutHistoryTable({ payouts }: PayoutHistoryTableProps) {
  const t = useTranslations("referral")
  return (
    <div className="dash-panel" style={{ padding: 0, marginBottom: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "18px 22px",
          borderBottom: `1px solid ${DASH.line}`,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            borderRadius: 10,
            background: DASH.orangeTint,
            color: DASH.orangeDeep,
          }}
        >
          <ReceiptText className="h-4 w-4" />
        </span>
        <Eyebrow>{t("payoutHistory")}</Eyebrow>
      </div>

      {payouts.length === 0 ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            padding: "42px 24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 48,
              height: 48,
              borderRadius: 16,
              background: DASH.cream,
            }}
          >
            <ReceiptText className="h-5 w-5" style={{ color: DASH.muted }} />
          </div>
          <p style={{ fontSize: 13, fontWeight: 500, color: DASH.muted }}>
            {t("noPayouts")}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block" style={{ overflowX: "auto" }}>
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((payout, index) => (
                  <motion.tr
                    key={payout.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.05 }}
                  >
                    <td className="td-muted" style={{ whiteSpace: "nowrap" }}>
                      {formatDate(payout.created_at)}
                    </td>
                    <td className="td-num" style={{ whiteSpace: "nowrap" }}>
                      {formatCents(payout.amount_cents)}
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <MethodCell method={payout.payout_method} />
                    </td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <StatusBadge status={payout.status} t={t} />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile list */}
          <div className="flex flex-col sm:hidden">
            {payouts.map((payout, index) => (
              <motion.div
                key={payout.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 20px",
                  borderTop: `1px solid ${DASH.line}`,
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span
                    style={{
                      fontSize: 14,
                      fontWeight: 700,
                      color: DASH.ink,
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {formatCents(payout.amount_cents)}
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <MethodCell method={payout.payout_method} />
                    <span style={{ fontSize: 11, color: DASH.muted }}>
                      {formatDate(payout.created_at)}
                    </span>
                  </div>
                </div>
                <StatusBadge status={payout.status} t={t} />
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
