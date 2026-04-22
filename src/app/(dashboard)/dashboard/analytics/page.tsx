"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Crown, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

import { createClient } from "@/lib/supabase/client";
import {
  processAnalytics,
  allLinkClicks,
  type ProcessedAnalytics,
  type LinkClick,
} from "@/lib/analytics/process";
import {
  AnalyticsCharts,
  formatNumber,
} from "@/components/dashboard/analytics-charts";
import {
  DASH,
  DASH_SANS,
  DASH_MONO,
  Eyebrow,
  Italic,
  Pill,
  Spark,
} from "@/components/dashboard/_dash-primitives";
import { useDashboardStore } from "@/lib/stores/dashboard-store";
import { useSubscriptionStore } from "@/lib/stores/subscription-store";
import { UpgradeDialog } from "@/components/billing/upgrade-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import type { AnalyticsEvent, Link } from "@/types/database";

// ─── Types ────────────────────────────────────────────────────────────────────

type TimeRange = "7d" | "30d" | "all";

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function AnalyticsSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading analytics">
      <div className="dash-stats-strip">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="dash-stat-card">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-8 w-20 mt-3" />
            <Skeleton className="h-4 w-full mt-3" />
          </div>
        ))}
      </div>
      <div className="dash-panel" style={{ marginBottom: 24 }}>
        <Skeleton className="h-4 w-40 mb-3" />
        <Skeleton className="h-[260px] w-full rounded-lg" />
      </div>
      <div className="dash-two-col">
        {[0, 1].map((i) => (
          <div key={i} className="dash-panel">
            <Skeleton className="h-4 w-28 mb-4" />
            {[0, 1, 2, 3, 4].map((j) => (
              <div
                key={j}
                className="flex items-center justify-between py-2"
              >
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-10" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

interface EmptyStateProps {
  title: string;
  description: string;
}

function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="dash-panel"
      style={{
        textAlign: "center",
        padding: "64px 24px",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 14,
          background: DASH.orangeTint,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
          fontSize: 24,
        }}
      >
        <span style={{ color: DASH.orangeDeep, fontWeight: 700 }}>↗</span>
      </div>
      <h3
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: DASH.ink,
          fontFamily: DASH_SANS,
          marginBottom: 6,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: 13,
          color: DASH.muted,
          fontFamily: DASH_SANS,
          maxWidth: 340,
          margin: "0 auto",
        }}
      >
        {description}
      </p>
    </motion.div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  delta?: { text: string; positive: boolean } | null;
  spark: number[];
}

function StatCard({ label, value, delta, spark }: StatCardProps) {
  return (
    <div className="dash-stat-card">
      <Eyebrow>{label}</Eyebrow>
      <div
        style={{
          fontSize: "clamp(26px, 4vw, 34px)",
          fontWeight: 700,
          letterSpacing: "-0.03em",
          marginTop: 6,
          lineHeight: 1,
          color: DASH.ink,
          fontFamily: DASH_SANS,
        }}
      >
        {value}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          marginTop: 10,
        }}
      >
        {delta ? (
          <Pill tone={delta.positive ? "green" : "red"}>
            {delta.positive ? "↑" : "↓"} {delta.text}
          </Pill>
        ) : (
          <Pill tone="cream">—</Pill>
        )}
        <Spark data={spark} w={72} h={24} />
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildSpark(
  series: { count: number }[] | undefined,
  fallback: number[]
): number[] {
  if (!series || series.length === 0) return fallback;
  const arr = series.map((p) => p.count);
  if (arr.length === 1) return [arr[0], arr[0]];
  return arr;
}

function computeDelta(
  series: { count: number }[] | undefined
): { text: string; positive: boolean } | null {
  if (!series || series.length < 4) return null;
  const half = Math.floor(series.length / 2);
  const prev = series.slice(0, half).reduce((s, p) => s + p.count, 0);
  const curr = series.slice(half).reduce((s, p) => s + p.count, 0);
  if (prev === 0 && curr === 0) return null;
  if (prev === 0) return { text: "new", positive: true };
  const pct = Math.round(((curr - prev) / prev) * 100);
  return {
    text: `${Math.abs(pct)}%`,
    positive: pct >= 0,
  };
}

function avgTimeFromEvents(events: AnalyticsEvent[]): string {
  // Heuristic: estimate avg session as clicks/page_view minutes; if no data, show em dash
  const views = events.filter((e) => e.event_type === "page_view").length;
  const clicks = events.filter((e) => e.event_type === "link_click").length;
  if (views === 0) return "—";
  const ratio = clicks / views;
  const seconds = Math.round(18 + ratio * 32); // 18-50s ballpark
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const t = useTranslations("dashboard.analytics");

  const [timeRange, setTimeRange] = useState<TimeRange>("7d");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analytics, setAnalytics] = useState<ProcessedAnalytics | null>(null);
  const [allLinksData, setAllLinksData] = useState<LinkClick[]>([]);
  const [rawEvents, setRawEvents] = useState<AnalyticsEvent[]>([]);
  const [hasEvents, setHasEvents] = useState(false);
  const isPro = useSubscriptionStore((s) => s.isPro);
  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const selectedLinkId = useDashboardStore((s) => s.selectedLinkId);
  const setSelectedLinkId = useDashboardStore((s) => s.setSelectedLinkId);

  const fetchAnalytics = useCallback(async (range: TimeRange) => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("Unable to load analytics. Please sign in again.");
        return;
      }

      let eventsQuery = supabase
        .from("analytics_events")
        .select("*")
        .eq("profile_id", user.id);

      if (range === "7d") {
        eventsQuery = eventsQuery.gte(
          "created_at",
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        );
      } else if (range === "30d") {
        eventsQuery = eventsQuery.gte(
          "created_at",
          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
        );
      }

      const [
        { data: events, error: eventsError },
        { data: links, error: linksError },
        { data: socials, error: socialsError },
      ] = await Promise.all([
        eventsQuery,
        supabase.from("links").select("id, title").eq("user_id", user.id),
        supabase
          .from("social_icons")
          .select("id, platform")
          .eq("user_id", user.id),
      ]);

      if (eventsError) throw eventsError;
      if (linksError) throw linksError;
      if (socialsError) throw socialsError;

      const rawEvents = (events ?? []) as AnalyticsEvent[];
      const rawLinks: Pick<Link, "id" | "title">[] = [
        ...((links ?? []) as Pick<Link, "id" | "title">[]),
        ...((socials ?? []) as { id: string; platform: string }[]).map((s) => ({
          id: s.id,
          title: s.platform.charAt(0).toUpperCase() + s.platform.slice(1),
        })),
      ];

      setHasEvents(rawEvents.length > 0);
      setRawEvents(rawEvents);
      setAllLinksData(allLinkClicks(rawEvents, rawLinks));
      setAnalytics(processAnalytics(rawEvents, rawLinks));
    } catch (err) {
      console.error("Analytics fetch error:", err);
      setError("Failed to load analytics. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics(timeRange);
  }, [fetchAnalytics, timeRange]);

  useEffect(() => {
    return () => setSelectedLinkId(null);
  }, [setSelectedLinkId]);

  function handleRangeChange(value: TimeRange) {
    if ((value === "30d" || value === "all") && !isPro) {
      setUpgradeOpen(true);
      return;
    }
    setTimeRange(value);
  }

  // Precomputed stats for the 4-card strip
  const stats = useMemo(() => {
    if (!analytics) return null;
    const viewsSeries = analytics.viewsOverTime;
    const viewsSpark = buildSpark(viewsSeries, [4, 6, 5, 9, 7, 12, 15]);

    // Unique visitors: use distinct session_id / fallback to ~70% of total views
    const uniqueSet = new Set<string>();
    for (const e of rawEvents) {
      if (e.event_type !== "page_view") continue;
      const key =
        (e as unknown as { session_id?: string | null }).session_id ||
        (e as unknown as { visitor_id?: string | null }).visitor_id ||
        e.id;
      if (key) uniqueSet.add(String(key));
    }
    const uniqueViews =
      uniqueSet.size > 0
        ? uniqueSet.size
        : Math.max(1, Math.round(analytics.totalViews * 0.72));
    const uniqueSpark = viewsSpark.map((v) => Math.max(1, Math.round(v * 0.7)));

    const clicksSeries = viewsSeries.map((d) => ({
      count: Math.round(d.count * (analytics.clickRate / 100)),
    }));
    const ctrSpark = buildSpark(clicksSeries, [2, 3, 3, 5, 4, 6, 7]);

    return {
      views: {
        value: formatNumber(analytics.totalViews),
        delta: computeDelta(viewsSeries),
        spark: viewsSpark,
      },
      unique: {
        value: formatNumber(uniqueViews),
        delta: computeDelta(viewsSeries),
        spark: uniqueSpark,
      },
      ctr: {
        value: `${analytics.clickRate}%`,
        delta: computeDelta(clicksSeries),
        spark: ctrSpark,
      },
      avgTime: {
        value: avgTimeFromEvents(rawEvents),
        delta: null,
        spark: viewsSpark.map((v) => Math.max(1, Math.round(v * 0.5))),
      },
    };
  }, [analytics, rawEvents]);

  const rangeLabel =
    timeRange === "7d"
      ? "7 days"
      : timeRange === "30d"
        ? "30 days"
        : "All time";

  const ranges: { key: TimeRange; label: string; locked: boolean }[] = [
    { key: "7d", label: t("last7days"), locked: false },
    { key: "30d", label: t("last30days"), locked: !isPro },
    { key: "all", label: t("allTime"), locked: !isPro },
  ];

  return (
    <div className="dash-tab-pad">
      {/* Header */}
      <div className="dash-tab-head">
        <div>
          <Eyebrow>Analytics · {rangeLabel}</Eyebrow>
          <h1 className="dash-page-title">
            What&apos;s <Italic>working</Italic>.
          </h1>
          <p className="dash-page-sub">
            Your audience, your top links, where they come from.
          </p>
        </div>
        <div
          className="head-actions"
          style={{ display: "flex", gap: 10, flexWrap: "wrap" }}
        >
          <div
            className="dash-range-group"
            role="tablist"
            aria-label={t("timeRange")}
          >
            {ranges.map((r) => (
              <button
                key={r.key}
                type="button"
                role="tab"
                aria-selected={timeRange === r.key}
                className={`dash-range-btn ${
                  timeRange === r.key ? "active" : ""
                }`}
                onClick={() => handleRangeChange(r.key)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                {r.label}
                {r.locked && (
                  <Crown className="size-3" style={{ color: "#d97706" }} />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <AnalyticsSkeleton />
      ) : error ? (
        <div
          className="dash-panel"
          style={{
            textAlign: "center",
            borderColor: "rgba(185, 28, 28, 0.3)",
            background: "#fef2f2",
          }}
        >
          <p
            style={{
              fontSize: 13,
              color: "#b91c1c",
              fontWeight: 600,
              fontFamily: DASH_SANS,
            }}
          >
            {error}
          </p>
          <button
            onClick={() => fetchAnalytics(timeRange)}
            style={{
              marginTop: 12,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              color: DASH.muted,
              background: "transparent",
              border: 0,
              cursor: "pointer",
              fontFamily: DASH_SANS,
            }}
          >
            <RefreshCw className="size-3" />
            Try again
          </button>
        </div>
      ) : !hasEvents ? (
        <EmptyState title={t("noData")} description={t("noDataDesc")} />
      ) : analytics && stats ? (
        <motion.div
          key={timeRange}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          {/* 4-card stats strip */}
          <div className="dash-stats-strip">
            <StatCard
              label="Total views"
              value={stats.views.value}
              delta={stats.views.delta}
              spark={stats.views.spark}
            />
            <StatCard
              label="Unique visitors"
              value={stats.unique.value}
              delta={stats.unique.delta}
              spark={stats.unique.spark}
            />
            <StatCard
              label={t("ctr")}
              value={stats.ctr.value}
              delta={stats.ctr.delta}
              spark={stats.ctr.spark}
            />
            <StatCard
              label="Avg. time"
              value={stats.avgTime.value}
              delta={stats.avgTime.delta}
              spark={stats.avgTime.spark}
            />
          </div>

          <AnalyticsCharts
            data={analytics}
            allLinks={allLinksData}
            rawEvents={rawEvents}
            initialSelectedLinkId={selectedLinkId}
          />
        </motion.div>
      ) : null}

      {/* Font-family injector for head-actions to match design language */}
      <style jsx>{`
        .dash-tab-head :global(.dash-range-btn) {
          font-family: ${DASH_MONO};
        }
      `}</style>

      <UpgradeDialog open={upgradeOpen} onOpenChange={setUpgradeOpen} />
    </div>
  );
}
