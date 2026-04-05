"use client"

import { DollarSign, Clock, Wallet, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import type { ReferralStats } from "@/types/database"

interface EarnOverviewCardsProps {
  stats: ReferralStats | null
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

interface StatCard {
  label: string
  value: string
  icon: React.ElementType
  iconBg: string
  iconColor: string
  accentColor: string
  subtext?: string | null
}

export function EarnOverviewCards({ stats }: EarnOverviewCardsProps) {
  const t = useTranslations("referral")
  const cards: StatCard[] = [
    {
      label: t("totalEarned"),
      value: formatCents(stats?.totalEarnedCents ?? 0),
      icon: DollarSign,
      iconBg: "bg-green-50",
      iconColor: "text-green-500",
      accentColor: "text-green-600",
    },
    {
      label: t("pending"),
      value: formatCents(stats?.pendingCents ?? 0),
      icon: Clock,
      iconBg: "bg-orange-50",
      iconColor: "text-orange-500",
      accentColor: "text-orange-600",
      subtext:
        (stats?.pendingCents ?? 0) > 0 ? t("pendingHint") : null,
    },
    {
      label: t("available"),
      value: formatCents(stats?.availableCents ?? 0),
      icon: Wallet,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
      accentColor: "text-blue-600",
    },
    {
      label: t("paidOut"),
      value: formatCents(stats?.paidOutCents ?? 0),
      icon: CheckCircle,
      iconBg: "bg-gray-100",
      iconColor: "text-gray-400",
      accentColor: "text-gray-500",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.07 }}
            className="rounded-xl bg-white border border-gray-100 p-5 shadow-sm"
          >
            {/* Icon */}
            <div
              className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${card.iconBg} mb-3`}
            >
              <Icon className={`h-4.5 w-4.5 ${card.iconColor}`} />
            </div>

            {/* Amount */}
            <p
              className={`text-2xl font-bold tracking-tight ${card.accentColor}`}
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              {card.value}
            </p>

            {/* Label row */}
            <div className="mt-1 flex items-center gap-2">
              <p className="text-sm text-gray-500">{card.label}</p>
              {card.subtext && (
                <span className="rounded-full bg-orange-50 px-1.5 py-0.5 text-[10px] font-medium text-orange-500">
                  {card.subtext}
                </span>
              )}
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
