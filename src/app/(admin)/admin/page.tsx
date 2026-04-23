"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  Crown,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  DASH,
  DASH_SERIF,
  Eyebrow,
  Italic,
  Pill,
} from "@/components/dashboard/_dash-primitives";

interface AdminStats {
  totalUsers: number;
  proSubscribers: number;
  monthlyRevenue: number;
  pendingPayouts: { amount: number; count: number };
  referralHealth: {
    liability: number;
    activeReferrers: number;
    convRate: number;
    avgEarnings: number;
  };
  recentActivity: { type: string; description: string; timestamp: string }[];
  topReferrers: {
    username: string;
    clicks: number;
    signups: number;
    conversions: number;
    earnings: number;
  }[];
  monthlyConversions: { month: string; count: number }[];
}

function formatCents(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

function getInitial(username: string): string {
  return username.charAt(0).toUpperCase();
}

function SkeletonCard() {
  return (
    <div className="dash-stat-card animate-pulse">
      <div className="h-3 w-20 bg-gray-100 rounded mb-3" />
      <div className="h-7 w-28 bg-gray-100 rounded mb-2" />
      <div className="h-3 w-16 bg-gray-100 rounded" />
    </div>
  );
}

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  feature?: boolean;
}

function KpiCard({ label, value, sub, icon: Icon, feature }: KpiCardProps) {
  return (
    <div className={`dash-stat-card ${feature ? "dash-stat-feature" : ""}`}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <Eyebrow color={feature ? "rgba(255,255,255,.7)" : DASH.orangeDeep}>
          {label}
        </Eyebrow>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 28,
            height: 28,
            borderRadius: 9,
            background: feature ? "rgba(255,255,255,.1)" : DASH.orangeTint,
            color: feature ? "#fff" : DASH.orangeDeep,
          }}
        >
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <div
        style={{
          fontSize: "clamp(24px, 3.6vw, 30px)",
          fontWeight: 700,
          letterSpacing: "-0.03em",
          marginTop: 8,
          lineHeight: 1,
          color: feature ? "#fff" : DASH.ink,
        }}
      >
        {value}
      </div>
      {sub && (
        <div
          style={{
            fontSize: 12,
            color: feature ? "rgba(255,255,255,.7)" : DASH.muted,
            marginTop: 6,
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

interface TooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function ChartTooltip({ active, payload, label }: TooltipProps) {
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
        {payload[0].value} conversions
      </p>
    </div>
  );
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats");
        if (!res.ok) throw new Error("fetch failed");
        const data = await res.json();
        setStats(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="dash-tab-pad">
        <div className="h-7 w-44 bg-gray-100 rounded animate-pulse mb-6" />
        <div className="dash-stats-strip">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="dash-tab-pad">
        <p style={{ fontSize: 13, color: DASH.muted }}>
          Failed to load stats. Refresh to try again.
        </p>
      </div>
    );
  }

  const conversionRate =
    stats.totalUsers > 0
      ? ((stats.proSubscribers / stats.totalUsers) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="dash-tab-pad">
      <div className="dash-tab-head">
        <div>
          <Eyebrow>Admin</Eyebrow>
          <h1 className="dash-page-title">
            Platform <Italic>overview</Italic>.
          </h1>
          <p className="dash-page-sub">Platform health at a glance.</p>
        </div>
      </div>

      <div className="dash-stats-strip" style={{ marginBottom: 16 }}>
        <KpiCard
          label="Total users"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
        />
        <KpiCard
          label="Pro subscribers"
          value={stats.proSubscribers.toLocaleString()}
          sub={`${conversionRate}% conversion`}
          icon={Crown}
        />
        <KpiCard
          label="Monthly revenue"
          value={formatCents(stats.monthlyRevenue)}
          icon={TrendingUp}
          feature
        />
        <KpiCard
          label="Pending payouts"
          value={formatCents(stats.pendingPayouts.amount)}
          sub={`${stats.pendingPayouts.count} request${stats.pendingPayouts.count === 1 ? "" : "s"}`}
          icon={AlertCircle}
        />
      </div>

      <div className="dash-two-col">
        {/* Referral health */}
        <div className="dash-panel">
          <Eyebrow>Referral program health</Eyebrow>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              marginTop: 14,
            }}
          >
            {[
              { label: "Liability", value: formatCents(stats.referralHealth.liability) },
              { label: "Active referrers", value: stats.referralHealth.activeReferrers.toLocaleString() },
              { label: "Conv. rate", value: `${stats.referralHealth.convRate.toFixed(1)}%` },
              { label: "Avg. earnings", value: formatCents(stats.referralHealth.avgEarnings) },
            ].map(({ label, value }) => (
              <div
                key={label}
                style={{
                  borderRadius: 12,
                  background: DASH.cream,
                  border: `1px solid ${DASH.line}`,
                  padding: "10px 12px",
                }}
              >
                <Eyebrow color={DASH.muted}>{label}</Eyebrow>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: DASH.ink,
                    marginTop: 4,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16 }}>
            <Eyebrow color={DASH.muted}>Monthly conversions</Eyebrow>
            <div style={{ height: 130, marginTop: 8 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={stats.monthlyConversions}
                  margin={{ top: 4, right: 4, left: -28, bottom: 0 }}
                >
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: DASH.muted }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip content={<ChartTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke={DASH.orange}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: DASH.orange, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <div className="dash-panel">
          <Eyebrow>Recent activity</Eyebrow>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: "14px 0 0",
              display: "flex",
              flexDirection: "column",
              gap: 12,
            }}
          >
            {stats.recentActivity.slice(0, 5).map((item, i) => (
              <li key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 999,
                    background: DASH.orangeTint,
                    color: DASH.orangeDeep,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: 700,
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  {item.type.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13.5, color: DASH.ink, margin: 0, lineHeight: 1.4 }}>
                    {item.description}
                  </p>
                  <p style={{ fontSize: 11, color: DASH.muted, margin: "2px 0 0" }}>
                    {formatRelativeTime(item.timestamp)}
                  </p>
                </div>
              </li>
            ))}
            {stats.recentActivity.length === 0 && (
              <li
                style={{
                  fontSize: 13,
                  color: DASH.muted,
                  padding: "16px 0",
                  textAlign: "center",
                }}
              >
                No recent activity
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* Top referrers */}
      <div className="dash-table-wrap" style={{ marginTop: 16 }}>
        <div
          style={{
            padding: "18px 22px",
            borderBottom: `1px solid ${DASH.line}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Eyebrow>Top referrers</Eyebrow>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table className="dash-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>User</th>
                <th className="td-right">Clicks</th>
                <th className="td-right">Signups</th>
                <th className="td-right">Conversions</th>
                <th className="td-right">Earnings</th>
              </tr>
            </thead>
            <tbody>
              {stats.topReferrers.slice(0, 5).map((row, i) => (
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
                      {i === 0 && <Pill tone="orange">#1</Pill>}
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
                  <td className="td-right">
                    <Pill tone="green">{formatCents(row.earnings)}</Pill>
                  </td>
                </tr>
              ))}
              {stats.topReferrers.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      textAlign: "center",
                      padding: "32px 0",
                      fontSize: 13,
                      color: DASH.muted,
                    }}
                  >
                    No referral data yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
