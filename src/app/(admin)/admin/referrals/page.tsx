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

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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
  // API returns { clicks, signups, conversions } (not prefixed with "total")
  funnel: {
    clicks: number;
    signups: number;
    conversions: number;
  };
  // API returns "referrers", not "leaderboard"
  referrers: ReferralLeaderboardRow[];
  // API returns "monthlyEarnings" with { month, amount }
  monthlyEarnings: EarningsMonth[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Recharts custom tooltip
// ---------------------------------------------------------------------------

interface TooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}

function EarningsTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-lg px-3 py-2 shadow-sm text-xs">
      <p className="text-gray-500">{label}</p>
      <p className="font-semibold text-[#8B5CF6]">{formatCents(payload[0].value)}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

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

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <div className="h-7 w-44 bg-gray-100 rounded animate-pulse" />
        <div className="flex gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex-1 h-28 bg-white rounded-xl border border-gray-100 animate-pulse" />
          ))}
        </div>
        <div className="bg-white rounded-xl border border-gray-100 h-64 animate-pulse" />
        <div className="bg-white rounded-xl border border-gray-100 h-64 animate-pulse" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <p className="text-sm text-gray-400">Failed to load referral data. Refresh to try again.</p>
      </div>
    );
  }

  const { funnel, referrers: leaderboard, monthlyEarnings: earningsTimeline } = data;

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-8">

      {/* Page heading */}
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-[#1E1E2E]">
          Referrals
        </h1>
        <p className="text-sm text-gray-400 mt-0.5">
          Full referral funnel and leaderboard
        </p>
      </div>

      {/* ── Section 1: Funnel ────────────────────────────────────────────── */}
      <section>
        <h2 className="text-sm font-semibold text-[#1E1E2E] mb-4 tracking-tight">
          Conversion Funnel
        </h2>
        <div className="flex flex-col sm:flex-row items-stretch gap-0">
          {/* Clicks */}
          <div className="flex-1 bg-white rounded-xl sm:rounded-r-none border border-gray-100 shadow-sm p-5 text-center">
            <p className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase mb-1">
              Clicks
            </p>
            <p className="text-3xl font-semibold text-[#1E1E2E]">
              {funnel.clicks.toLocaleString()}
            </p>
          </div>

          {/* Arrow */}
          <div className="hidden sm:flex items-center justify-center px-1 text-gray-300 bg-white border-t border-b border-gray-100 shadow-sm">
            <ArrowRight className="size-4" strokeWidth={1.5} />
          </div>
          <div className="flex sm:hidden items-center justify-center h-6 text-gray-300">
            <ArrowRight className="size-4 rotate-90" strokeWidth={1.5} />
          </div>

          {/* Signups */}
          <div className="flex-1 bg-white sm:rounded-none border sm:border-x-0 border-gray-100 shadow-sm p-5 text-center">
            <p className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase mb-1">
              Signups
            </p>
            <p className="text-3xl font-semibold text-[#1E1E2E]">
              {funnel.signups.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {conversionRate(funnel.signups, funnel.clicks)} of clicks
            </p>
          </div>

          {/* Arrow */}
          <div className="hidden sm:flex items-center justify-center px-1 text-gray-300 bg-white border-t border-b border-gray-100 shadow-sm">
            <ArrowRight className="size-4" strokeWidth={1.5} />
          </div>
          <div className="flex sm:hidden items-center justify-center h-6 text-gray-300">
            <ArrowRight className="size-4 rotate-90" strokeWidth={1.5} />
          </div>

          {/* Conversions */}
          <div className="flex-1 bg-white rounded-xl sm:rounded-l-none border border-gray-100 shadow-sm p-5 text-center">
            <p className="text-[11px] font-semibold tracking-wider text-gray-400 uppercase mb-1">
              Conversions
            </p>
            <p className="text-3xl font-semibold text-[#FF6B35]">
              {funnel.conversions.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              {conversionRate(funnel.conversions, funnel.signups)} of signups
            </p>
          </div>
        </div>
      </section>

      {/* ── Section 2: Full leaderboard ──────────────────────────────────── */}
      <section>
        <h2 className="text-sm font-semibold text-[#1E1E2E] mb-4 tracking-tight">
          All Referrers
        </h2>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="border-b border-gray-100">
                  {["Rank", "User", "Clicks", "Signups", "Conversions", "Conv. Rate", "Earnings"].map(
                    (h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left text-[11px] font-semibold text-gray-400 tracking-wide first:pl-5 last:pr-5"
                      >
                        {h}
                      </th>
                    )
                  )}
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((row, i) => (
                  <tr
                    key={row.username}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="px-4 py-3 pl-5 text-xs font-semibold text-gray-400">
                      #{i + 1}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="size-7 rounded-full bg-purple-50 text-[#8B5CF6] flex items-center justify-center text-xs font-semibold shrink-0">
                          {getInitial(row.username)}
                        </div>
                        <span className="font-medium text-[#1E1E2E]">
                          {row.username}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {row.clicks.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {row.signups.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-medium text-[#1E1E2E]">
                      {row.conversions.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {conversionRate(row.conversions, row.clicks)}
                    </td>
                    <td className="px-4 py-3 pr-5 font-semibold text-green-600">
                      {formatCents(row.earnings)}
                    </td>
                  </tr>
                ))}
                {leaderboard.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center text-sm text-gray-400"
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

      {/* ── Section 3: Earnings timeline ─────────────────────────────────── */}
      <section>
        <h2 className="text-sm font-semibold text-[#1E1E2E] mb-4 tracking-tight">
          Earnings Timeline
          <span className="ml-2 text-[11px] font-normal text-gray-400">
            (last 6 months — total commission paid out)
          </span>
        </h2>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart
              data={earningsTimeline}
              margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#9CA3AF" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 100).toFixed(0)}`}
              />
              <Tooltip content={<EarningsTooltip />} />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#8B5CF6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#8B5CF6", strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}
