"use client"

import { useState } from "react"
import { ClipboardCopy, Check, Link2 } from "lucide-react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { motion, AnimatePresence } from "framer-motion"
import { DASH, DASH_MONO, Eyebrow } from "@/components/dashboard/_dash-primitives"

interface ReferralLinkSectionProps {
  referralCode: string | null
}

export function ReferralLinkSection({ referralCode }: ReferralLinkSectionProps) {
  const t = useTranslations("referral")
  const [copied, setCopied] = useState(false)

  const referralUrl = referralCode
    ? `https://viopage.com/?ref=${referralCode}`
    : null

  async function handleCopy() {
    if (!referralUrl) return
    try {
      await navigator.clipboard.writeText(referralUrl)
      setCopied(true)
      toast.success(t("linkCopied"))
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error("Failed to copy link")
    }
  }

  return (
    <div className="dash-panel" style={{ marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
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
          <Link2 className="h-4 w-4" />
        </span>
        <Eyebrow>{t("yourLink")}</Eyebrow>
      </div>

      {referralUrl ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div
            className="dash-field-input"
            style={{ flex: 1, minWidth: 200, padding: "10px 14px" }}
          >
            <p
              style={{
                margin: 0,
                fontFamily: DASH_MONO,
                fontSize: 13,
                color: DASH.ink,
                userSelect: "all",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                width: "100%",
              }}
            >
              {referralUrl}
            </p>
          </div>

          <motion.button
            onClick={handleCopy}
            whileTap={{ scale: 0.96 }}
            className="dash-btn-primary"
            aria-label="Copy referral link"
            style={{
              background: copied ? "#16a34a" : DASH.ink,
              transition: "background 0.3s ease",
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.span
                  key="check"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.15 }}
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <Check className="h-3.5 w-3.5" />
                  {t("linkCopied")}
                </motion.span>
              ) : (
                <motion.span
                  key="copy"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.15 }}
                  style={{ display: "flex", alignItems: "center", gap: 6 }}
                >
                  <ClipboardCopy className="h-3.5 w-3.5" />
                  {t("copyLink")}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      ) : (
        <div
          style={{
            borderRadius: 12,
            border: `1px dashed ${DASH.lineStrong}`,
            background: DASH.cream,
            padding: "12px 14px",
            color: DASH.muted,
            fontStyle: "italic",
            fontSize: 13,
          }}
        >
          {t("loading")}
        </div>
      )}

      <p style={{ marginTop: 12, fontSize: 13, color: DASH.muted, lineHeight: 1.5 }}>
        {t("shareNote")}
      </p>
    </div>
  )
}
