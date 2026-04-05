"use client"

import { CreditCard, QrCode, ReceiptText } from "lucide-react"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import type { ReferralPayout, ReferralPayoutStatus, PayoutMethod } from "@/types/database"

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

const statusStyles: Record<ReferralPayoutStatus, string> = {
  requested: "bg-amber-50 text-amber-700 border-amber-200",
  processing: "bg-orange-50 text-orange-700 border-orange-200",
  completed: "bg-green-50 text-green-700 border-green-200",
  failed: "bg-red-50 text-red-700 border-red-200",
}

const statusI18nKeys: Record<ReferralPayoutStatus, string> = {
  requested: "statusRequested",
  processing: "statusProcessing",
  completed: "statusCompleted",
  failed: "statusFailed",
}

const methodConfig: Record<
  PayoutMethod,
  { label: string; icon: React.ElementType }
> = {
  paypal: { label: "PayPal", icon: CreditCard },
  pix: { label: "Pix", icon: QrCode },
}

function StatusBadge({ status, t }: { status: ReferralPayoutStatus; t: (key: string) => string }) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
        statusStyles[status],
      ].join(" ")}
    >
      {t(statusI18nKeys[status])}
    </span>
  )
}

function MethodCell({ method }: { method: PayoutMethod }) {
  const config = methodConfig[method]
  const Icon = config.icon
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-gray-600">
      <Icon className="h-3.5 w-3.5 text-gray-400 shrink-0" />
      {config.label}
    </span>
  )
}

export function PayoutHistoryTable({ payouts }: PayoutHistoryTableProps) {
  const t = useTranslations("referral")
  return (
    <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2.5 border-b border-gray-100 px-6 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50">
          <ReceiptText className="h-4 w-4 text-purple-500" />
        </div>
        <h2
          className="text-base font-semibold text-gray-900"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {t("payoutHistory")}
        </h2>
      </div>

      {payouts.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-14">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-100">
            <ReceiptText className="h-5 w-5 text-gray-400" />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">{t("noPayouts")}</p>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {payouts.map((payout, index) => (
                  <motion.tr
                    key={payout.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.05 }}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="whitespace-nowrap px-6 py-3.5 text-sm text-gray-500">
                      {formatDate(payout.created_at)}
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5">
                      <span
                        className="text-sm font-semibold text-gray-900 tabular-nums"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                      >
                        {formatCents(payout.amount_cents)}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5">
                      <MethodCell method={payout.payout_method} />
                    </td>
                    <td className="whitespace-nowrap px-6 py-3.5">
                      <StatusBadge status={payout.status} t={t} />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile card list */}
          <div className="flex flex-col divide-y divide-gray-100 sm:hidden">
            {payouts.map((payout, index) => (
              <motion.div
                key={payout.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
                className="flex items-center justify-between px-5 py-4"
              >
                <div className="flex flex-col gap-1">
                  <span
                    className="text-sm font-semibold text-gray-900 tabular-nums"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    {formatCents(payout.amount_cents)}
                  </span>
                  <div className="flex items-center gap-2">
                    <MethodCell method={payout.payout_method} />
                    <span className="text-xs text-gray-400">
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
