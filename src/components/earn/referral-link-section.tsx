"use client"

import { useState } from "react"
import { ClipboardCopy, Check, Link2 } from "lucide-react"
import { toast } from "sonner"
import { useTranslations } from "next-intl"
import { motion, AnimatePresence } from "framer-motion"

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
    <div className="rounded-xl bg-white border border-gray-100 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50">
          <Link2 className="h-4 w-4 text-orange-500" />
        </div>
        <h2
          className="text-base font-semibold text-gray-900"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {t("yourLink")}
        </h2>
      </div>

      {/* URL row */}
      {referralUrl ? (
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5">
            <p className="truncate text-sm font-mono text-gray-600 select-all">
              {referralUrl}
            </p>
          </div>

          <motion.button
            onClick={handleCopy}
            whileTap={{ scale: 0.96 }}
            className="relative flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
            style={{
              background: copied
                ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
                : "linear-gradient(135deg, #FF6B35 0%, #f95f00 100%)",
              transition: "background 0.3s ease",
            }}
            aria-label="Copy referral link"
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.span
                  key="check"
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.6 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center gap-1.5"
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
                  className="flex items-center gap-1.5"
                >
                  <ClipboardCopy className="h-3.5 w-3.5" />
                  {t("copyLink")}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-2.5">
          <p className="text-sm text-gray-400 italic">
            {t("loading")}
          </p>
        </div>
      )}

      {/* Subtitle */}
      <p className="mt-3 text-sm text-gray-500 leading-relaxed">
        {t("shareNote")}
      </p>
    </div>
  )
}
