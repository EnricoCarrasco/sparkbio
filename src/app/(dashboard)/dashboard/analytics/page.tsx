"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { BarChart3, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

import { createClient } from "@/lib/supabase/client";
import {
  processAnalytics,
  allLinkClicks,
  type ProcessedAnalytics,
  type LinkClick,
} from "@/lib/analytics/process";
import { AnalyticsCharts } from "@/components/dashboard/analytics-charts";
import { useDashboardStore } from "@/lib/stores/dashboard-store";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AnalyticsEvent, Link } from "@/types/database";

// ─── Types ────────────────────────────────────────────────────────────────────

type TimeRange = "7d" | "30d" | "all";

// ─── Skeleton loader ──────────────────────────────────────────────────────────

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading analytics">
      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-white p-6 space-y-3"
          >
            <div className="flex items-start gap-4">
              <Skeleton className="size-10 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-7 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Line chart */}
      <div className="rounded-xl border border-border bg-white p-6 space-y-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-[280px] w-full rounded-lg" />
      </div>

      {/* Bar + Pie */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-white p-6 space-y-4"
          >
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-[240px] w-full rounded-lg" />
          </div>
        ))}
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-border bg-white p-6 space-y-3"
          >
            <Skeleton className="h-5 w-28" />
            {[0, 1, 2, 3, 4].map((j) => (
              <div key={j} className="flex items-center justify-between py-1">
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
      className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-white py-20 px-6 text-center"
    >
      <div
        className="flex size-16 items-center justify-center rounded-2xl mb-4"
        style={{ backgroundColor: "#FF6B3518" }}
      >
        <BarChart3 className="size-8" style={{ color: "#FF6B35" }} />
      </div>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground max-w-sm">
        {description}
      </p>
    </motion.div>
  );
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
  const selectedLinkId = useDashboardStore((s) => s.selectedLinkId);
  const setSelectedLinkId = useDashboardStore((s) => s.setSelectedLinkId);

  const fetchAnalytics = useCallback(async (range: TimeRange) => {
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      // Get the authenticated user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("Unable to load analytics. Please sign in again.");
        return;
      }

      // Build the events query with optional date filter
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
      ] = await Promise.all([
        eventsQuery,
        supabase.from("links").select("id, title").eq("user_id", user.id),
      ]);

      if (eventsError) throw eventsError;
      if (linksError) throw linksError;

      const rawEvents = (events ?? []) as AnalyticsEvent[];
      const rawLinks = (links ?? []) as Pick<Link, "id" | "title">[];

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

  // Clear selected link when leaving the page
  useEffect(() => {
    return () => setSelectedLinkId(null);
  }, [setSelectedLinkId]);

  function handleRangeChange(value: string) {
    setTimeRange(value as TimeRange);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">{t("title")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t("timeRange")}:{" "}
            <span className="font-medium text-foreground">
              {timeRange === "7d"
                ? t("last7days")
                : timeRange === "30d"
                  ? t("last30days")
                  : t("allTime")}
            </span>
          </p>
        </div>

        {/* Time range selector */}
        <Tabs
          defaultValue="7d"
          value={timeRange}
          onValueChange={handleRangeChange}
        >
          <TabsList>
            <TabsTrigger value="7d">{t("last7days")}</TabsTrigger>
            <TabsTrigger value="30d">{t("last30days")}</TabsTrigger>
            <TabsTrigger value="all">{t("allTime")}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Content area */}
      {loading ? (
        <AnalyticsSkeleton />
      ) : error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive font-medium">{error}</p>
          <button
            onClick={() => fetchAnalytics(timeRange)}
            className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className="size-3" />
            Try again
          </button>
        </div>
      ) : !hasEvents ? (
        <EmptyState title={t("noData")} description={t("noDataDesc")} />
      ) : analytics ? (
        <motion.div
          key={timeRange}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
        >
          <AnalyticsCharts
            data={analytics}
            allLinks={allLinksData}
            rawEvents={rawEvents}
            initialSelectedLinkId={selectedLinkId}
          />
        </motion.div>
      ) : null}
    </div>
  );
}
