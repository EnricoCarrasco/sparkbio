"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Loader2, CreditCard, QrCode, Wallet } from "lucide-react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import type { PayoutMethod } from "@/types/database"
import {
  DASH,
  DASH_SANS,
  Eyebrow,
} from "@/components/dashboard/_dash-primitives"

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

  const methodOptions: {
    value: PayoutMethod
    label: string
    sublabel: string
    icon: React.ElementType
  }[] = [
    { value: "paypal", label: "PayPal", sublabel: "Fast & global", icon: CreditCard },
    { value: "pix", label: "Pix", sublabel: "Brazil only", icon: QrCode },
  ]

  return (
    <>
      <motion.button
        onClick={handleOpen}
        whileTap={{ scale: 0.97 }}
        disabled={!canRequest}
        className="dash-btn-primary"
        style={{ opacity: canRequest ? 1 : 0.4, cursor: canRequest ? "pointer" : "not-allowed" }}
      >
        <Wallet className="h-4 w-4" />
        {t("requestPayout")}
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40"
              style={{
                background: "rgba(17,17,19,0.4)",
                backdropFilter: "blur(4px)",
              }}
              onClick={handleClose}
            />
            <motion.div
              key="dialog"
              initial={{ opacity: 0, scale: 0.95, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2"
              style={{
                background: DASH.panel,
                border: `1px solid ${DASH.line}`,
                borderRadius: 20,
                padding: 24,
                boxShadow: "0 30px 60px rgba(17,17,19,.2)",
                fontFamily: DASH_SANS,
              }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="payout-dialog-title"
            >
              <button
                onClick={handleClose}
                disabled={loading}
                aria-label="Close"
                style={{
                  position: "absolute",
                  right: 14,
                  top: 14,
                  width: 28,
                  height: 28,
                  borderRadius: 999,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: DASH.muted,
                  background: "transparent",
                  border: 0,
                  cursor: "pointer",
                }}
              >
                <X className="h-4 w-4" />
              </button>

              <h2
                id="payout-dialog-title"
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: DASH.ink,
                  letterSpacing: "-0.02em",
                  margin: 0,
                }}
              >
                {t("requestPayout")}
              </h2>

              <div
                style={{
                  marginTop: 14,
                  marginBottom: 18,
                  borderRadius: 14,
                  background: DASH.orangeTint,
                  border: "1px solid rgba(255,107,53,.18)",
                  padding: "12px 16px",
                }}
              >
                <div style={{ marginBottom: 2 }}>
                  <Eyebrow>{t("available")}</Eyebrow>
                </div>
                <div
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: DASH.orangeDeep,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {formattedAmount}
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                style={{ display: "flex", flexDirection: "column", gap: 16 }}
              >
                <div>
                  <div style={{ marginBottom: 8 }}>
                    <Eyebrow color={DASH.muted}>{t("payoutMethod")}</Eyebrow>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 8,
                    }}
                  >
                    {methodOptions.map((opt) => {
                      const Icon = opt.icon
                      const selected = method === opt.value
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setMethod(opt.value)}
                          style={{
                            position: "relative",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                            gap: 4,
                            borderRadius: 14,
                            border: selected
                              ? `2px solid ${DASH.orange}`
                              : `1px solid ${DASH.line}`,
                            padding: 12,
                            textAlign: "left",
                            background: selected ? DASH.orangeTint : DASH.cream,
                            cursor: "pointer",
                            transition: "all .15s",
                          }}
                        >
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: 26,
                              height: 26,
                              borderRadius: 8,
                              background: selected ? "#fff" : DASH.panel,
                              color: selected ? DASH.orangeDeep : DASH.muted,
                            }}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </span>
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: selected ? DASH.orangeDeep : DASH.ink,
                            }}
                          >
                            {opt.label}
                          </span>
                          <span style={{ fontSize: 11, color: DASH.muted }}>
                            {opt.sublabel}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="payout-destination"
                    style={{ display: "block", marginBottom: 6 }}
                  >
                    <Eyebrow color={DASH.muted}>
                      {method === "paypal" ? t("paypalEmail") : t("pixKey")}
                    </Eyebrow>
                  </label>
                  <div className="dash-field-input">
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
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={loading}
                    className="dash-btn-ghost"
                    style={{ flex: 1, justifyContent: "center" }}
                  >
                    {t("cancel")}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="dash-btn-primary"
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      background: DASH.orange,
                      opacity: loading ? 0.7 : 1,
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
