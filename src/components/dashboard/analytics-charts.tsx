"use client";

import React from "react";
import { useTranslations } from "next-intl";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import {
  Eye,
  MousePointerClick,
  TrendingUp,
  BarChart3,
  ChevronRight,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LinkAnalyticsDetail } from "@/components/dashboard/link-analytics-detail";
import type { ProcessedAnalytics, LinkClick } from "@/lib/analytics/process";
import type { AnalyticsEvent } from "@/types/database";

// ─── Brand tokens ─────────────────────────────────────────────────────────────

const BRAND_ORANGE = "#FF6B35";
const BRAND_DARK = "#1E1E2E";
const BRAND_SLATE = "#94A3B8";

const PIE_COLORS = [BRAND_ORANGE, BRAND_DARK, BRAND_SLATE];

// ─── Custom tooltip ───────────────────────────────────────────────────────────

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
      {label && (
        <p className="font-medium text-foreground mb-1">{label}</p>
      )}
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color ?? BRAND_ORANGE }}>
          {entry.value}
        </p>
      ))}
    </div>
  );
}

// ─── Summary card ─────────────────────────────────────────────────────────────

interface SummaryCardProps {
  icon: React.ElementType;
  label: string;
  value: string | number;
  iconColor?: string;
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  iconColor = BRAND_ORANGE,
}: SummaryCardProps) {
  return (
    <Card className="bg-white">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${iconColor}18` }}
          >
            <Icon className="size-5" style={{ color: iconColor }} />
          </div>
          <div className="min-w-0">
            <p className="text-2xl font-bold text-foreground leading-none">
              {value}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface AnalyticsChartsProps {
  data: ProcessedAnalytics;
  allLinks?: LinkClick[];
  rawEvents?: AnalyticsEvent[];
  initialSelectedLinkId?: string | null;
}

export function AnalyticsCharts({
  data,
  allLinks = [],
  rawEvents = [],
  initialSelectedLinkId,
}: AnalyticsChartsProps) {
  const t = useTranslations("dashboard.analytics");
  const [selectedLink, setSelectedLink] = React.useState<LinkClick | null>(
    null
  );
  const [detailOpen, setDetailOpen] = React.useState(false);

  // Open detail for initially selected link (from Content tab navigation)
  React.useEffect(() => {
    if (initialSelectedLinkId && allLinks.length > 0) {
      const link = allLinks.find((l) => l.id === initialSelectedLinkId);
      if (link) {
        setSelectedLink(link);
        setDetailOpen(true);
      }
    }
  }, [initialSelectedLinkId, allLinks]);

  function handleLinkClick(link: LinkClick) {
    setSelectedLink(link);
    setDetailOpen(true);
  }

  const {
    totalViews,
    totalClicks,
    clickRate,
    viewsOverTime,
    topLinks,
    devices,
    topReferrers,
    topCountries,
  } = data;

  return (
    <div className="space-y-6">
      {/* ── Summary cards ── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <SummaryCard icon={Eye} label={t("views")} value={totalViews} />
        <SummaryCard
          icon={MousePointerClick}
          label={t("clicks")}
          value={totalClicks}
        />
        <SummaryCard
          icon={TrendingUp}
          label={t("ctr")}
          value={`${clickRate}%`}
        />
      </div>

      {/* ── Views over time ── */}
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Eye className="size-4" style={{ color: BRAND_ORANGE }} />
            {t("viewsOverTime")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {viewsOverTime.length === 0 ? (
            <EmptyChart />
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart
                data={viewsOverTime}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#94A3B8" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#94A3B8" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke={BRAND_ORANGE}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: BRAND_ORANGE }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* ── Top links + Devices ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top links bar chart */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <BarChart3 className="size-4" style={{ color: BRAND_ORANGE }} />
              {t("topLinks")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topLinks.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart
                  data={topLinks}
                  layout="vertical"
                  margin={{ top: 0, right: 4, left: 4, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E5E7EB"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: "#94A3B8" }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="title"
                    width={90}
                    tick={{ fontSize: 11, fill: "#64748B" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v: string) =>
                      v.length > 16 ? `${v.slice(0, 14)}…` : v
                    }
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar
                    dataKey="count"
                    fill={BRAND_ORANGE}
                    radius={[0, 4, 4, 0]}
                    maxBarSize={28}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Devices pie chart */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <DeviceIcon className="size-4" style={{ color: BRAND_ORANGE }} />
              {t("devices")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {devices.length === 0 ? (
              <EmptyChart />
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={devices}
                    cx="50%"
                    cy="45%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {devices.map((_, index) => (
                      <Cell
                        key={index}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value: string) => (
                      <span className="text-xs text-foreground">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Referrers + Countries tables ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Top referrers */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              {t("referrers")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topReferrers.length === 0 ? (
              <EmptyChart />
            ) : (
              <DataTable
                rows={topReferrers.map((r) => ({
                  label: r.referrer,
                  count: r.count,
                }))}
                total={totalViews}
              />
            )}
          </CardContent>
        </Card>

        {/* Top countries */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">
              {t("countries")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {topCountries.length === 0 ? (
              <EmptyChart />
            ) : (
              <DataTable
                rows={topCountries.map((c) => ({
                  label: c.country,
                  count: c.count,
                }))}
                total={totalViews}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Link Performance ── */}
      {allLinks.length > 0 && (
        <Card className="bg-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <MousePointerClick
                className="size-4"
                style={{ color: BRAND_ORANGE }}
              />
              {t("linkPerformance")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-0">
              {allLinks.map((link, i) => {
                const pct =
                  totalClicks > 0
                    ? Math.round((link.count / totalClicks) * 100)
                    : 0;
                return (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => handleLinkClick(link)}
                    className="flex items-center justify-between w-full py-2.5 border-b border-border last:border-0 hover:bg-muted/30 rounded-md px-2 -mx-2 transition-colors text-left"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="shrink-0 text-xs font-medium text-muted-foreground w-4 text-right">
                        {i + 1}
                      </span>
                      <span
                        className="text-sm text-foreground truncate max-w-[200px]"
                        title={link.title}
                      >
                        {link.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <div className="hidden sm:block h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.max(pct, 2)}%`,
                            backgroundColor: BRAND_ORANGE,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-foreground tabular-nums">
                        {link.count}
                      </span>
                      <ChevronRight className="size-3.5 text-muted-foreground/50" />
                    </div>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Link detail modal */}
      {selectedLink && (
        <LinkAnalyticsDetail
          open={detailOpen}
          onOpenChange={(open) => {
            setDetailOpen(open);
            if (!open) setSelectedLink(null);
          }}
          linkId={selectedLink.id}
          linkTitle={selectedLink.title}
          totalClicks={selectedLink.count}
          events={rawEvents}
        />
      )}
    </div>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function EmptyChart() {
  return (
    <div className="flex h-[120px] items-center justify-center">
      <p className="text-sm text-muted-foreground">No data</p>
    </div>
  );
}

interface DataTableRow {
  label: string;
  count: number;
}

interface DataTableProps {
  rows: DataTableRow[];
  total: number;
}

function DataTable({ rows, total }: DataTableProps) {
  return (
    <div className="space-y-0">
      {rows.map((row, i) => {
        const pct = total > 0 ? Math.round((row.count / total) * 100) : 0;
        return (
          <div
            key={i}
            className="flex items-center justify-between py-2.5 border-b border-border last:border-0"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="shrink-0 text-xs font-medium text-muted-foreground w-4 text-right">
                {i + 1}
              </span>
              <span
                className="text-sm text-foreground truncate max-w-[160px]"
                title={row.label}
              >
                {row.label}
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0 ml-4">
              {/* Mini progress bar */}
              <div className="hidden sm:block h-1.5 w-20 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max(pct, 2)}%`,
                    backgroundColor: BRAND_ORANGE,
                  }}
                />
              </div>
              <span className="text-sm font-medium text-foreground tabular-nums">
                {row.count}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Inline SVG icon for device (monitor/phone hybrid) since lucide has Monitor
function DeviceIcon({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}
