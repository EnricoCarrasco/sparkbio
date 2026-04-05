"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Loader2, CreditCard, QrCode, Wallet } from "lucide-react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import type { PayoutMethod } from "@/types/database"

interface PayoutRequestDialogProps {
  availableCents: number
  onSubmit: (method: PayoutMethod, destination: string) => Promise<void>
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

export function PayoutRequestDialog({
  availableCents,
  onSubmit,
}: PayoutRequestDialogProps) {
  const t = useTranslations("referral")
  const [open, setOpen] = useState(false)
  const [method, setMethod] = useState<PayoutMethod>("paypal")
  const [destination, setDestination] = useState("")
  const [loading, setLoading] = useState(false)

  const formattedAmount = formatCents(availableCents)
  const canRequest = availableCents > 0

  function handleOpen() {
    if (!canRequest) return
    setMethod("paypal")
    setDestination("")
    setOpen(true)
  }

  function handleClose() {
    if (loading) return
    setOpen(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!destination.trim()) {
      toast.error(t("minimumNotMet"))
      return
    }
    setLoading(true)
    try {
      await onSubmit(method, destination.trim())
      toast.success(t("payoutSuccess"))
      setOpen(false)
    } catch {
      toast.error("Failed to submit payout request. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const methodOptions: { value: PayoutMethod; label: string; sublabel: string; icon: React.ElementType }[] = [
    {
      value: "paypal",
      label: "PayPal",
      sublabel: "Fast & global",
      icon: CreditCard,
    },
    {
      value: "pix",
      label: "Pix",
      sublabel: "Brazil only",
      icon: QrCode,
    },
  ]

  return (
    <>
      {/* Trigger button */}
      <motion.button
        onClick={handleOpen}
        whileTap={{ scale: 0.97 }}
        disabled={!canRequest}
        className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          background: "linear-gradient(135deg, #FF6B35 0%, #f95f00 100%)",
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}
      >
        <Wallet className="h-4 w-4" />
        {t("requestPayout")}
      </motion.button>

      {/* Modal backdrop + card */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              onClick={handleClose}
            />

            {/* Dialog card */}
            <motion.div
              key="dialog"
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-xl ring-1 ring-gray-100"
              role="dialog"
              aria-modal="true"
              aria-labelledby="payout-dialog-title"
            >
              {/* Close button */}
              <button
                onClick={handleClose}
                disabled={loading}
                className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 disabled:opacity-50"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Title */}
              <h2
                id="payout-dialog-title"
                className="text-lg font-bold text-gray-900"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                {t("requestPayout")}
              </h2>

              {/* Available balance display */}
              <div className="mt-3 mb-5 rounded-xl bg-orange-50 px-4 py-3 border border-orange-100">
                <p className="text-xs text-orange-600 mb-0.5">{t("available")}</p>
                <p
                  className="text-2xl font-bold text-orange-700 tabular-nums"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {formattedAmount}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {/* Method radio cards */}
                <div>
                  <p className="mb-2 text-sm font-medium text-gray-700">
                    {t("payoutMethod")}
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {methodOptions.map((opt) => {
                      const Icon = opt.icon
                      const selected = method === opt.value
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setMethod(opt.value)}
                          className={[
                            "relative flex flex-col items-start gap-1 rounded-xl border-2 p-3 text-left transition-all",
                            selected
                              ? "border-orange-400 bg-orange-50"
                              : "border-gray-200 bg-white hover:border-gray-300",
                          ].join(" ")}
                        >
                          <div
                            className={[
                              "flex h-7 w-7 items-center justify-center rounded-lg",
                              selected ? "bg-orange-100" : "bg-gray-100",
                            ].join(" ")}
                          >
                            <Icon
                              className={[
                                "h-3.5 w-3.5",
                                selected ? "text-orange-500" : "text-gray-400",
                              ].join(" ")}
                            />
                          </div>
                          <span
                            className={[
                              "text-sm font-semibold",
                              selected ? "text-orange-700" : "text-gray-700",
                            ].join(" ")}
                          >
                            {opt.label}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {opt.sublabel}
                          </span>
                          {/* Selected indicator dot */}
                          {selected && (
                            <div className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-orange-400" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Destination input */}
                <div>
                  <label
                    htmlFor="payout-destination"
                    className="mb-1.5 block text-sm font-medium text-gray-700"
                  >
                    {method === "paypal" ? t("paypalEmail") : t("pixKey")}
                  </label>
                  <input
                    id="payout-destination"
                    type={method === "paypal" ? "email" : "text"}
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder={
                      method === "paypal"
                        ? "your@email.com"
                        : "CPF, e-mail, phone, or random key"
                    }
                    required
                    disabled={loading}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-orange-300 focus:bg-white focus:ring-2 focus:ring-orange-100 disabled:opacity-60"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    className="flex-1 rounded-lg border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50 disabled:opacity-50"
                  >
                    {t("cancel")}
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity disabled:opacity-70"
                    style={{
                      background: "linear-gradient(135deg, #FF6B35 0%, #f95f00 100%)",
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                    }}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        {t("statusProcessing")}...
                      </>
                    ) : (
                      `${t("confirmPayout")} ${formattedAmount}`
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
