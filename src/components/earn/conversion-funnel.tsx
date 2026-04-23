"use client"

import { ArrowRight, ArrowDown, MousePointer2, UserPlus, Zap } from "lucide-react"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import type { ReferralStats } from "@/types/database"
import { DASH, Eyebrow } from "@/components/dashboard/_dash-primitives"

interface ConversionFunnelProps {
  stats: ReferralStats | null
}

function safeRate(numerator: number, denominator: number): string {
  if (!denominator) return "0.0%"
  return `${((numerator / denominator) * 100).toFixed(1)}%`
}

interface FunnelStep {
  label: string
  count: number
  icon: React.ElementType
}

export function ConversionFunnel({ stats }: ConversionFunnelProps) {
  const t = useTranslations("referral")
  const clicks = stats?.clickCount ?? 0
  const signups = stats?.signupCount ?? 0
  const conversions = stats?.conversionCount ?? 0
  const maxCount = Math.max(clicks, 1)

  const steps: FunnelStep[] = [
    { label: t("clicks"), count: clicks, icon: MousePointer2 },
    { label: t("signups"), count: signups, icon: UserPlus },
    { label: t("conversions"), count: conversions, icon: Zap },
  ]

  const rates = [safeRate(signups, clicks), safeRate(conversions, signups)]

  return (
    <div className="dash-panel" style={{ marginBottom: 16 }}>
      <div style={{ marginBottom: 16 }}>
        <Eyebrow>{t("funnel")}</Eyebrow>
      </div>

      <div
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2"
      >
        {steps.map((step, index) => {
          const Icon = step.icon
          const barWidth = `${Math.round((step.count / maxCount) * 100)}%`

          return (
            <div
              key={step.label}
              style={{ flex: 1 }}
              className="flex flex-col sm:flex-row sm:items-center sm:gap-2"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                style={{
                  flex: 1,
                  borderRadius: 14,
                  background: DASH.cream,
                  border: `1px solid ${DASH.line}`,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 10,
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
                      background: DASH.orangeTint,
                      color: DASH.orangeDeep,
                    }}
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  <Eyebrow color={DASH.muted}>{step.label}</Eyebrow>
                </div>

                <div
                  style={{
                    fontSize: 26,
                    fontWeight: 700,
                    letterSpacing: "-0.02em",
                    color: DASH.ink,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  {step.count.toLocaleString()}
                </div>

                <div className="dash-bar-bg" style={{ marginTop: 12 }}>
                  <motion.div
                    className="dash-bar-fill"
                    initial={{ width: 0 }}
                    animate={{ width: barWidth }}
                    transition={{
                      duration: 0.6,
                      delay: 0.2 + index * 0.1,
                      ease: "easeOut",
                    }}
                  />
                </div>
              </motion.div>

              {index < steps.length - 1 && (
                <div
                  style={{ gap: 4 }}
                  className="flex items-center justify-center py-1.5 sm:flex-col sm:py-0"
                >
                  <ArrowDown
                    className="h-3.5 w-3.5 sm:hidden"
                    style={{ color: DASH.muted, opacity: 0.6 }}
                  />
                  <ArrowRight
                    className="hidden h-3.5 w-3.5 sm:block"
                    style={{ color: DASH.muted, opacity: 0.6 }}
                  />
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 600,
                      color: DASH.muted,
                      fontVariantNumeric: "tabular-nums",
                      letterSpacing: "0.02em",
                    }}
                  >
                    {rates[index]}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
