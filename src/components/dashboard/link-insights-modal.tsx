"use client";

import React, { useCallback, useEffect, useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { subDays } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Smartphone, Tablet, Monitor } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { processLinkAnalytics } from "@/lib/analytics/process";
import type { AnalyticsEvent, Link } from "@/types/database";
import type { ProcessedLinkAnalytics } from "@/lib/analytics/process";

// ─── Brand tokens (match analytics-charts.tsx) ──────────────────────────────

const BRAND_ORANGE = "#FF6B35";

// ─── Types ───────────────────────────────────────────────────────────────────

type DateRange = "7d" | "30d" | "all";

interface LinkInsightsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  link: Link | null;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function countryCodeToFlag(code: string): string {
  if (!code || code === "Unknown" || code.length !== 2) return "🌍";
  return String.fromCodePoint(
    ...code
      .toUpperCase()
      .split("")
      .map((c) => 0x1f1e6 + c.charCodeAt(0) - 65)
  );
}

function countryCodeToName(code: string, locale = "en"): string {
  if (!code || code === "Unknown") return "Unknown";
  try {
    const names = new Intl.DisplayNames([locale], { type: "region" });
    return names.of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
}

function getDateThreshold(range: DateRange): Date | null {
  if (range === "7d") return subDays(new Date(), 7);
  if (range === "30d") return subDays(new Date(), 30);
  return null;
}

const DEVICE_ICONS: Record<string, React.ElementType> = {
  Mobile: Smartphone,
  Tablet: Tablet,
  Desktop: Monitor,
};

// ─── Custom tooltip (matches analytics-charts.tsx) ───────────────────────────

interface TooltipPayloadEntry {
  name: string;
  value: number;
  color?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}

function ChartTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2 shadow-md text-xs">
      {label && <p className="font-medium text-foreground mb-1">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color ?? BRAND_ORANGE }}>
          {entry.value} {entry.value === 1 ? "click" : "clicks"}
        </p>
      ))}
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export function LinkInsightsModal({
  open,
  onOpenChange,
  link,
}: LinkInsightsModalProps) {
  const t = useTranslations("dashboard.links");
  const [range, setRange] = useState<DateRange>("7d");
  const [allEvents, setAllEvents] = useState<AnalyticsEvent[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch all events for this link when modal opens
  useEffect(() => {
    if (!open || !link) return;

    async function fetchEvents() {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("analytics_events")
        .select("*")
        .eq("link_id", link!.id)
        .eq("event_type", "link_click")
        .order("created_at", { ascending: false });

      setAllEvents(data ?? []);
      setLoading(false);
    }

    fetchEvents();
  }, [open, link]);

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (nextOpen) setRange("7d");
      onOpenChange(nextOpen);
    },
    [onOpenChange]
  );

  // Process data based on selected date range
  const analytics: ProcessedLinkAnalytics | null = useMemo(() => {
    if (allEvents.length === 0 && !loading) {
      return processLinkAnalytics([], allEvents.length);
    }
    if (allEvents.length === 0) return null;

    const threshold = getDateThreshold(range);
    const periodEvents = threshold
      ? allEvents.filter((e) => new Date(e.created_at) >= threshold)
      : allEvents;

    return processLinkAnalytics(periodEvents, allEvents.length);
  }, [allEvents, range, loading]);

  if (!link) return null;

  const rangeLabel =
    range === "7d"
      ? t("lastNDays", { count: 7 })
      : range === "30d"
        ? t("lastNDays", { count: 30 })
        : t("allTime");

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="bottom"
        showCloseButton
        className="mx-auto max-h-[85vh] w-full rounded-t-2xl sm:max-w-[520px]"
      >
        <SheetHeader className="pb-0">
          <SheetTitle className="text-sm font-semibold truncate pr-8">
            {link.title}
          </SheetTitle>
          <SheetDescription className="text-xs truncate">
            {link.url}
          </SheetDescription>
        </SheetHeader>

        <div className="overflow-y-auto flex-1 px-4 pb-4 space-y-6">
          {/* ── Insights title + date range pills ── */}
          <div>
            <h3 className="text-base font-bold text-foreground mb-3">
              {t("insights")}
            </h3>
            <div className="flex gap-1.5">
              {(["7d", "30d", "all"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors",
                    range === r
                      ? "bg-foreground text-background border-foreground"
                      : "bg-white text-muted-foreground border-border hover:border-foreground/30"
                  )}
                >
                  {r === "7d"
                    ? t("lastNDays", { count: 7 })
                    : r === "30d"
                      ? t("lastNDays", { count: 30 })
                      : t("allTime")}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <LoadingSkeleton />
          ) : (
            analytics && (
              <>
                {/* ── Clicks over time ── */}
                <Section title={t("clicksOverTime")}>
                  {analytics.clicksOverTime.length === 0 ? (
                    <EmptyState message={t("noClicks")} />
                  ) : (
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart
                        data={analytics.clicksOverTime}
                        margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#E5E7EB"
                          horizontal
                          vertical={false}
                        />
                        <XAxis
                          dataKey="date"
                          tick={{ fontSize: 10, fill: "#94A3B8" }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 10, fill: "#94A3B8" }}
                          axisLine={false}
                          tickLine={false}
                          allowDecimals={false}
                        />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar
                          dataKey="count"
                          fill={BRAND_ORANGE}
                          radius={[4, 4, 0, 0]}
                          maxBarSize={32}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  )}

                  {/* Summary row */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
                    <span className="text-sm font-medium text-muted-foreground">
                      {t("totalClicks")}
                    </span>
                    <div className="flex gap-6">
                      <div className="text-center">
                        <span className="block text-[11px] text-muted-foreground">
                          {t("lifetime")}
                        </span>
                        <span className="text-sm font-bold tabular-nums">
                          {analytics.lifetimeClicks}
                        </span>
                      </div>
                      <div className="text-center">
                        <span className="block text-[11px] text-muted-foreground">
                          {rangeLabel}
                        </span>
                        <span className="text-sm font-bold tabular-nums">
                          {analytics.totalClicks}
                        </span>
                      </div>
                    </div>
                  </div>
                </Section>

                {/* ── Traffic Sources ── */}
                <Section title={t("trafficSources")}>
                  {analytics.trafficSources.length === 0 ? (
                    <EmptyState message={t("noClicks")} />
                  ) : (
                    <StatList
                      rows={analytics.trafficSources.map((s, i) => ({
                        rank: i + 1,
                        label: s.referrer === "Direct" ? t("direct") : s.referrer,
                        count: s.count,
                        total: analytics.totalClicks,
                      }))}
                    />
                  )}
                  <DateRangeNote label={rangeLabel} />
                </Section>

                {/* ── Locations ── */}
                <Section title={t("locations")}>
                  {analytics.locations.length === 0 ? (
                    <EmptyState message={t("noClicks")} />
                  ) : (
                    <StatList
                      rows={analytics.locations.map((loc, i) => ({
                        rank: i + 1,
                        icon: countryCodeToFlag(loc.country),
                        label:
                          loc.country === "Unknown"
                            ? t("unknown")
                            : countryCodeToName(loc.country),
                        count: loc.count,
                        total: analytics.totalClicks,
                      }))}
                    />
                  )}
                  <DateRangeNote label={rangeLabel} />
                </Section>

                {/* ── Devices ── */}
                <Section title={t("devices")}>
                  {analytics.devices.length === 0 ? (
                    <EmptyState message={t("noClicks")} />
                  ) : (
                    <StatList
                      rows={analytics.devices.map((d, i) => {
                        const Icon = DEVICE_ICONS[d.name] ?? Monitor;
                        return {
                          rank: i + 1,
                          iconElement: (
                            <Icon className="size-4 text-muted-foreground" />
                          ),
                          label: d.name,
                          count: d.value,
                          total: analytics.totalClicks,
                        };
                      })}
                    />
                  )}
                  <DateRangeNote label={rangeLabel} />
                </Section>
              </>
            )
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-foreground mb-3">{title}</h4>
      {children}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-[80px] rounded-lg bg-muted/30">
      <p className="text-xs text-muted-foreground">{message}</p>
    </div>
  );
}

function DateRangeNote({ label }: { label: string }) {
  const t = useTranslations("dashboard.links");
  return (
    <p className="text-[11px] text-muted-foreground text-center mt-2">
      {t("dateRange", { range: label })}
    </p>
  );
}

interface StatRow {
  rank: number;
  icon?: string;
  iconElement?: React.ReactNode;
  label: string;
  count: number;
  total: number;
}

function StatList({ rows }: { rows: StatRow[] }) {
  return (
    <div>
      {rows.map((row) => {
        const pct = row.total > 0 ? Math.round((row.count / row.total) * 100) : 0;
        return (
          <div
            key={`${row.rank}-${row.label}`}
            className="flex items-center justify-between py-2.5 border-b border-border/30 last:border-0"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {row.icon && <span className="text-base">{row.icon}</span>}
              {row.iconElement}
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-foreground truncate">
                  {row.rank}. {row.label}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {row.count} {row.count === 1 ? "Click" : "Clicks"} &nbsp;{" "}
                  {pct}% Click rate
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-[160px] rounded-lg bg-muted/40" />
      <div className="space-y-3">
        <div className="h-4 w-32 rounded bg-muted/40" />
        <div className="h-12 rounded bg-muted/40" />
        <div className="h-12 rounded bg-muted/40" />
      </div>
      <div className="space-y-3">
        <div className="h-4 w-24 rounded bg-muted/40" />
        <div className="h-12 rounded bg-muted/40" />
        <div className="h-12 rounded bg-muted/40" />
      </div>
    </div>
  );
}
