"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  Crown,
  TrendingUp,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
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
  accentClass: string;
  iconBgClass: string;
}

function KpiCard({
  label,
  value,
  sub,
  icon: Icon,
  accentClass,
  iconBgClass,
}: KpiCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-start gap-4 shadow-sm">
      <div className={cn("flex items-center justify-center rounded-xl size-11 shrink-0", iconBgClass)}>
        <Icon className={cn("size-5", accentClass)} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-400 tracking-wide">{label}</p>
        <p className="text-2xl font-semibold text-[#1E1E2E] tracking-tight mt-0.5">
          {value}
        </p>
        {sub && (
          <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
        )}
      </div>
    </div>
  );
}

// Custom Recharts tooltip
interface TooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function ChartTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-lg px-3 py-2 shadow-sm text-xs">
      <p className="text-gray-500">{label}</p>
      <p className="font-semibold text-[#FF6B35]">{payload[0].value} conversions</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

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

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="h-7 w-44 bg-gray-100 rounded animate-pulse" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-100 p-5 h-72 animate-pulse" />
          <div className="bg-white rounded-xl border border-gray-100 p-5 h-72 animate-pulse" />
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-5 h-52 animate-pulse" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <p className="text-sm text-gray-500">Failed to load stats. Refresh to try again.</p>
      </div>
    );
  }

  const conversionRate =
    stats.totalUsers > 0
      ? ((stats.proSubscribers / stats.totalUsers) * 100).toFixed(1)
      : "0.0";

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

      {/* Page heading */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-[#1E1E2E]">
          Overview
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Platform health at a glance
        </p>
      </div>

      {/* ── ROW 1: KPI Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          accentClass="text-gray-500"
          iconBgClass="bg-gray-50"
        />
        <KpiCard
          label="Pro Subscribers"
          value={stats.proSubscribers.toLocaleString()}
          sub={`${conversionRate}% conversion`}
          icon={Crown}
          accentClass="text-blue-500"
          iconBgClass="bg-blue-50"
        />
        <KpiCard
          label="Monthly Revenue"
          value={formatCents(stats.monthlyRevenue)}
          icon={TrendingUp}
          accentClass="text-green-500"
          iconBgClass="bg-green-50"
        />
        <KpiCard
          label="Pending Payouts"
          value={formatCents(stats.pendingPayouts.amount)}
          sub={`${stats.pendingPayouts.count} request${stats.pendingPayouts.count === 1 ? "" : "s"}`}
          icon={AlertCircle}
          accentClass="text-[#FF6B35]"
          iconBgClass="bg-orange-50"
        />
      </div>

      {/* ── ROW 2: Referral Health + Recent Activity ──────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Referral program health */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-5">
          <h2 className="text-sm font-semibold text-[#1E1E2E] tracking-tight">
            Referral Program Health
          </h2>

          {/* 4 mini-stats */}
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "Liability",
                value: formatCents(stats.referralHealth.liability),
              },
              {
                label: "Active Referrers",
                value: stats.referralHealth.activeReferrers.toLocaleString(),
              },
              {
                label: "Conv. Rate",
                value: `${stats.referralHealth.convRate.toFixed(1)}%`,
              },
              {
                label: "Avg. Earnings",
                value: formatCents(stats.referralHealth.avgEarnings),
              },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-lg bg-gray-50 px-3 py-2.5"
              >
                <p className="text-[10px] font-medium text-gray-400 tracking-wide">
                  {label}
                </p>
                <p className="text-base font-semibold text-[#1E1E2E] mt-0.5">
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* Monthly conversions chart */}
          <div className="flex-1 min-h-[120px]">
            <p className="text-[10px] font-medium text-gray-400 tracking-wide mb-2">
              Monthly Conversions
            </p>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart
                data={stats.monthlyConversions}
                margin={{ top: 4, right: 4, left: -28, bottom: 0 }}
              >
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: "#9CA3AF" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#FF6B35"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: "#FF6B35", strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent activity */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
          <h2 className="text-sm font-semibold text-[#1E1E2E] tracking-tight">
            Recent Activity
          </h2>
          <ul className="flex flex-col gap-3">
            {stats.recentActivity.slice(0, 5).map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                {/* Avatar circle */}
                <div className="size-8 rounded-full bg-orange-50 text-[#FF6B35] flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5">
                  {item.type.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#1E1E2E] leading-snug">
                    {item.description}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {formatRelativeTime(item.timestamp)}
                  </p>
                </div>
              </li>
            ))}
            {stats.recentActivity.length === 0 && (
              <li className="text-sm text-gray-400 py-4 text-center">
                No recent activity
              </li>
            )}
          </ul>
        </div>
      </div>

      {/* ── ROW 3: Top Referrers table ───────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-[#1E1E2E] tracking-tight mb-4">
          Top Referrers
        </h2>
        <div className="overflow-x-auto -mx-5 px-5">
          <table className="w-full text-sm min-w-[480px]">
            <thead>
              <tr className="border-b border-gray-100">
                {["User", "Clicks", "Signups", "Conversions", "Earnings"].map(
                  (h) => (
                    <th
                      key={h}
                      className="pb-3 text-left text-[11px] font-semibold text-gray-400 tracking-wide"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {stats.topReferrers.slice(0, 5).map((row, i) => (
                <tr
                  key={row.username}
                  className="border-b border-gray-50 last:border-0"
                >
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2.5">
                      <div className="size-7 rounded-full bg-purple-50 text-[#8B5CF6] flex items-center justify-center text-xs font-semibold shrink-0">
                        {getInitial(row.username)}
                      </div>
                      <span className="font-medium text-[#1E1E2E]">
                        {row.username}
                      </span>
                      {i === 0 && (
                        <span className="text-[10px] font-semibold text-[#FF6B35] bg-orange-50 px-1.5 py-0.5 rounded-full">
                          #1
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-gray-600">
                    {row.clicks.toLocaleString()}
                  </td>
                  <td className="py-3 pr-4 text-gray-600">
                    {row.signups.toLocaleString()}
                  </td>
                  <td className="py-3 pr-4">
                    <span className="font-medium text-[#1E1E2E]">
                      {row.conversions.toLocaleString()}
                    </span>
                  </td>
                  <td className="py-3 font-semibold text-green-600">
                    {formatCents(row.earnings)}
                  </td>
                </tr>
              ))}
              {stats.topReferrers.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-sm text-gray-400"
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
