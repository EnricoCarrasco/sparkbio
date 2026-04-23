"use client";

import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import {
  DASH,
  DASH_SERIF,
  Eyebrow,
  Italic,
  Pill,
} from "@/components/dashboard/_dash-primitives";

interface ReferralLeaderboardRow {
  username: string;
  clicks: number;
  signups: number;
  conversions: number;
  earnings: number;
}

interface EarningsMonth {
  month: string;
  amount: number;
}

interface AdminReferralsData {
  funnel: {
    clicks: number;
    signups: number;
    conversions: number;
  };
  referrers: ReferralLeaderboardRow[];
  monthlyEarnings: EarningsMonth[];
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function getInitial(username: string): string {
  return username.charAt(0).toUpperCase();
}

function conversionRate(num: number, denom: number): string {
  if (denom === 0) return "0%";
  return `${((num / denom) * 100).toFixed(1)}%`;
}

interface TooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function EarningsTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: DASH.panel,
        border: `1px solid ${DASH.line}`,
        borderRadius: 10,
        padding: "8px 12px",
        fontSize: 12,
        boxShadow: "0 4px 12px rgba(17,17,19,.08)",
      }}
    >
      <p style={{ color: DASH.muted, margin: 0 }}>{label}</p>
      <p style={{ color: DASH.orangeDeep, fontWeight: 700, margin: 0 }}>
        {formatCents(payload[0].value)}
      </p>
    </div>
  );
}

export default function AdminReferralsPage() {
  const [data, setData] = useState<AdminReferralsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/referrals");
        if (!res.ok) throw new Error("fetch failed");
        const json = await res.json();
        setData(json);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="dash-tab-pad">
        <div className="h-7 w-44 bg-gray-100 rounded animate-pulse mb-6" />
        <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="dash-panel animate-pulse" style={{ flex: 1, height: 120 }} />
          ))}
        </div>
        <div className="dash-panel animate-pulse" style={{ height: 260 }} />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="dash-tab-pad">
        <p style={{ fontSize: 13, color: DASH.muted }}>
          Failed to load referral data. Refresh to try again.
        </p>
      </div>
    );
  }

  const {
    funnel,
    referrers: leaderboard,
    monthlyEarnings: earningsTimeline,
  } = data;

  return (
    <div className="dash-tab-pad">
      <div className="dash-tab-head">
        <div>
          <Eyebrow>Referrals</Eyebrow>
          <h1 className="dash-page-title">
            Program <Italic>health</Italic>.
          </h1>
          <p className="dash-page-sub">
            Full referral funnel and leaderboard.
          </p>
        </div>
      </div>

      {/* Funnel */}
      <section style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 14 }}>
          <Eyebrow>Conversion funnel</Eyebrow>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
          <FunnelBox label="Clicks" value={funnel.clicks.toLocaleString()} />
          <FunnelArrow />
          <FunnelBox
            label="Signups"
            value={funnel.signups.toLocaleString()}
            sub={`${conversionRate(funnel.signups, funnel.clicks)} of clicks`}
          />
          <FunnelArrow />
          <FunnelBox
            label="Conversions"
            value={funnel.conversions.toLocaleString()}
            sub={`${conversionRate(funnel.conversions, funnel.signups)} of signups`}
            accent
          />
        </div>
      </section>

      {/* Leaderboard */}
      <section style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 14 }}>
          <Eyebrow>All referrers</Eyebrow>
        </div>
        <div className="dash-table-wrap">
          <div style={{ overflowX: "auto" }}>
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>User</th>
                  <th className="td-right">Clicks</th>
                  <th className="td-right">Signups</th>
                  <th className="td-right">Conversions</th>
                  <th className="td-right">Conv. rate</th>
                  <th className="td-right">Earnings</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((row, i) => (
                  <tr key={row.username}>
                    <td>
                      <span
                        style={{
                          fontFamily: DASH_SERIF,
                          fontStyle: "italic",
                          fontSize: 20,
                          color: DASH.muted,
                        }}
                      >
                        {i + 1}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 999,
                            background: "#8B5CF6",
                            color: "#fff",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 11,
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {getInitial(row.username)}
                        </div>
                        <span style={{ fontWeight: 600, color: DASH.ink }}>
                          {row.username}
                        </span>
                      </div>
                    </td>
                    <td className="td-right td-num td-muted">
                      {row.clicks.toLocaleString()}
                    </td>
                    <td className="td-right td-num td-muted">
                      {row.signups.toLocaleString()}
                    </td>
                    <td className="td-right td-num">
                      {row.conversions.toLocaleString()}
                    </td>
                    <td className="td-right td-muted" style={{ fontSize: 12.5 }}>
                      {conversionRate(row.conversions, row.clicks)}
                    </td>
                    <td className="td-right">
                      <Pill tone="green">{formatCents(row.earnings)}</Pill>
                    </td>
                  </tr>
                ))}
                {leaderboard.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      style={{
                        textAlign: "center",
                        padding: "48px 0",
                        fontSize: 13,
                        color: DASH.muted,
                      }}
                    >
                      No referrers yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Earnings timeline */}
      <section>
        <div style={{ marginBottom: 14 }}>
          <Eyebrow>Earnings timeline</Eyebrow>
          <span
            style={{
              marginLeft: 8,
              fontSize: 11,
              color: DASH.muted,
              fontWeight: 500,
            }}
          >
            (last 6 months · total commission paid)
          </span>
        </div>
        <div className="dash-panel">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={earningsTimeline}
              margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={DASH.line}
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: DASH.muted }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: DASH.muted }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 100).toFixed(0)}`}
              />
              <Tooltip content={<EarningsTooltip />} />
              <Line
                type="monotone"
                dataKey="amount"
                stroke={DASH.orange}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: DASH.orange, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

function FunnelBox({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className="dash-panel"
      style={{
        flex: 1,
        textAlign: "center",
        margin: 0,
        padding: "20px 16px",
      }}
    >
      <Eyebrow color={DASH.muted}>{label}</Eyebrow>
      <div
        style={{
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: "-0.03em",
          color: accent ? DASH.orange : DASH.ink,
          marginTop: 8,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {value}
      </div>
      {sub && (
        <p style={{ fontSize: 11.5, color: DASH.muted, marginTop: 4 }}>
          {sub}
        </p>
      )}
    </div>
  );
}

function FunnelArrow() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 4px",
        color: DASH.muted,
        opacity: 0.6,
      }}
    >
      <ArrowRight
        className="size-4 hidden sm:block"
        strokeWidth={1.5}
      />
      <ArrowRight
        className="size-4 sm:hidden rotate-90"
        strokeWidth={1.5}
      />
    </div>
  );
}
