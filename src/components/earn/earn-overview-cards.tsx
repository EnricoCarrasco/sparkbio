"use client"

import { DollarSign, Clock, Wallet, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"
import type { ReferralStats } from "@/types/database"
import { DASH, Eyebrow, Pill } from "@/components/dashboard/_dash-primitives"

interface EarnOverviewCardsProps {
  stats: ReferralStats | null
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

interface StatCard {
  key: string
  label: string
  value: string
  icon: React.ElementType
  subtext?: string | null
  feature?: boolean
}

export function EarnOverviewCards({ stats }: EarnOverviewCardsProps) {
  const t = useTranslations("referral")
  const cards: StatCard[] = [
    {
      key: "total",
      label: t("totalEarned"),
      value: formatCents(stats?.totalEarnedCents ?? 0),
      icon: DollarSign,
    },
    {
      key: "pending",
      label: t("pending"),
      value: formatCents(stats?.pendingCents ?? 0),
      icon: Clock,
      subtext: (stats?.pendingCents ?? 0) > 0 ? t("pendingHint") : null,
    },
    {
      key: "available",
      label: t("available"),
      value: formatCents(stats?.availableCents ?? 0),
      icon: Wallet,
      feature: true,
    },
    {
      key: "paid",
      label: t("paidOut"),
      value: formatCents(stats?.paidOutCents ?? 0),
      icon: CheckCircle,
    },
  ]

  return (
    <div className="dash-stats-strip" style={{ marginBottom: 16 }}>
      {cards.map((card, index) => {
        const Icon = card.icon
        const feature = card.feature
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.07 }}
            className={`dash-stat-card ${feature ? "dash-stat-feature" : ""}`}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <Eyebrow
                color={feature ? "rgba(255,255,255,.7)" : DASH.orangeDeep}
              >
                {card.label}
              </Eyebrow>
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 28,
                  height: 28,
                  borderRadius: 9,
                  background: feature
                    ? "rgba(255,255,255,.1)"
                    : DASH.orangeTint,
                  color: feature ? "#fff" : DASH.orangeDeep,
                }}
              >
                <Icon className="h-4 w-4" />
              </span>
            </div>
            <div
              style={{
                fontSize: "clamp(26px, 4vw, 32px)",
                fontWeight: 700,
                letterSpacing: "-0.03em",
                marginTop: 10,
                lineHeight: 1,
                color: feature ? "#fff" : DASH.ink,
              }}
            >
              {card.value}
            </div>
            {card.subtext ? (
              <div style={{ marginTop: 10 }}>
                <Pill tone="orange">{card.subtext}</Pill>
              </div>
            ) : null}
          </motion.div>
        )
      })}
    </div>
  )
}
