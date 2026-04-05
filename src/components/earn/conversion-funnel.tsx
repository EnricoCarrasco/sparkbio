"use client"

import { ArrowRight, ArrowDown, MousePointer2, UserPlus, Zap } from "lucide-react"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import type { ReferralStats } from "@/types/database"

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
  iconBg: string
  iconColor: string
  valueBg: string
  valueColor: string
  barColor: string
}

export function ConversionFunnel({ stats }: ConversionFunnelProps) {
  const t = useTranslations("referral")
  const clicks = stats?.clickCount ?? 0
  const signups = stats?.signupCount ?? 0
  const conversions = stats?.conversionCount ?? 0
  const maxCount = Math.max(clicks, 1)

  const steps: FunnelStep[] = [
    {
      label: t("clicks"),
      count: clicks,
      icon: MousePointer2,
      iconBg: "bg-gray-100",
      iconColor: "text-gray-500",
      valueBg: "bg-gray-50",
      valueColor: "text-gray-700",
      barColor: "bg-gray-300",
    },
    {
      label: t("signups"),
      count: signups,
      icon: UserPlus,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-500",
      valueBg: "bg-orange-50",
      valueColor: "text-orange-700",
      barColor: "bg-orange-400",
    },
    {
      label: t("conversions"),
      count: conversions,
      icon: Zap,
      iconBg: "bg-green-50",
      iconColor: "text-green-500",
      valueBg: "bg-green-50",
      valueColor: "text-green-700",
      barColor: "bg-green-400",
    },
  ]

  const rates = [
    safeRate(signups, clicks),
    safeRate(conversions, signups),
  ]

  return (
    <div className="rounded-xl bg-white border border-gray-100 p-6 shadow-sm">
      {/* Header */}
      <h2
        className="mb-5 text-base font-semibold text-gray-900"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
      >
        {t("funnel")}
      </h2>

      {/* Desktop: horizontal row; mobile: vertical stack */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-2">
        {steps.map((step, index) => {
          const Icon = step.icon
          const barWidth = `${Math.round((step.count / maxCount) * 100)}%`

          return (
            <div key={step.label} className="flex flex-1 flex-col sm:flex-row sm:items-center sm:gap-2">
              {/* Step card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex-1 rounded-xl border border-gray-100 bg-gray-50 p-4"
              >
                {/* Icon + label */}
                <div className="mb-3 flex items-center gap-2">
                  <div
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-lg ${step.iconBg}`}
                  >
                    <Icon className={`h-3.5 w-3.5 ${step.iconColor}`} />
                  </div>
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {step.label}
                  </span>
                </div>

                {/* Count */}
                <p
                  className="text-2xl font-bold text-gray-900 tabular-nums"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  {step.count.toLocaleString()}
                </p>

                {/* Mini bar */}
                <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
                  <motion.div
                    className={`h-full rounded-full ${step.barColor}`}
                    initial={{ width: 0 }}
                    animate={{ width: barWidth }}
                    transition={{ duration: 0.6, delay: 0.2 + index * 0.1, ease: "easeOut" }}
                  />
                </div>
              </motion.div>

              {/* Arrow + rate connector (not after last step) */}
              {index < steps.length - 1 && (
                <div className="flex flex-row items-center justify-center gap-1 py-1 sm:flex-col sm:py-0">
                  {/* Mobile: arrow down; Desktop: arrow right */}
                  <ArrowDown className="h-3.5 w-3.5 text-gray-300 sm:hidden" />
                  <ArrowRight className="hidden h-3.5 w-3.5 text-gray-300 sm:block" />
                  <span className="text-[10px] font-semibold text-gray-400 tabular-nums">
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
