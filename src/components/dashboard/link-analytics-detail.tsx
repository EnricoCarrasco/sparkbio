"use client";

import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { MousePointerClick, CalendarDays, TrendingUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  linkClicksOverTime,
  linkDeviceBreakdown,
  linkReferrers,
  linkCountries,
} from "@/lib/analytics/process";
import type { AnalyticsEvent } from "@/types/database";

const BRAND_ORANGE = "#FF6B35";
const BRAND_DARK = "#1E1E2E";
const BRAND_SLATE = "#94A3B8";
const PIE_COLORS = [BRAND_ORANGE, BRAND_DARK, BRAND_SLATE];

interface TooltipPayloadEntry {
  name: string;
  value: number;
  color?: string;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadEntry[];
  label?: string;
}

function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border bg-background px-3 py-2 shadow-md text-xs">
      {label && <p className="font-medium text-foreground mb-1">{label}</p>}
      {payload.map((entry, i) => (
        <p key={i} style={{ color: entry.color ?? BRAND_ORANGE }}>
          {entry.value}
        </p>
      ))}
    </div>
  );
}

interface LinkAnalyticsDetailProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  linkId: string;
  linkTitle: string;
  totalClicks: number;
  events: AnalyticsEvent[];
}

export function LinkAnalyticsDetail({
  open,
  onOpenChange,
  linkId,
  linkTitle,
  totalClicks,
  events,
}: LinkAnalyticsDetailProps) {
  const t = useTranslations("dashboard.analytics");

  const clicksOverTime = useMemo(
    () => linkClicksOverTime(events, linkId),
    [events, linkId]
  );
  const devices = useMemo(
    () => linkDeviceBreakdown(events, linkId),
    [events, linkId]
  );
  const referrers = useMemo(
    () => linkReferrers(events, linkId),
    [events, linkId]
  );
  const countries = useMemo(
    () => linkCountries(events, linkId),
    [events, linkId]
  );

  const activeDays = clicksOverTime.length;
  const peakDay = clicksOverTime.reduce<{ date: string; count: number } | null>(
    (max, d) => (!max || d.count > max.count ? d : max),
    null
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="truncate">{linkTitle}</DialogTitle>
          <p className="text-xs text-muted-foreground">{t("linkDetail")}</p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Summary row */}
          <div className="grid grid-cols-3 gap-3">
            <SummaryMini
              icon={MousePointerClick}
              label={t("clicks")}
              value={totalClicks}
            />
            <SummaryMini
              icon={CalendarDays}
              label={t("activeDays")}
              value={activeDays}
            />
            <SummaryMini
              icon={TrendingUp}
              label={t("peakDay")}
              value={peakDay?.date ?? "—"}
            />
          </div>

          {/* Clicks over time */}
          {clicksOverTime.length > 0 && (
            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold">
                  {t("clicksOverTime")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart
                    data={clicksOverTime}
                    margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
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
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke={BRAND_ORANGE}
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 3, fill: BRAND_ORANGE }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Devices + Countries row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Devices pie chart */}
            {devices.length > 0 && (
              <Card className="bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold">
                    {t("devices")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={devices}
                        cx="50%"
                        cy="45%"
                        innerRadius={35}
                        outerRadius={60}
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
                        iconSize={6}
                        formatter={(value: string) => (
                          <span className="text-[10px] text-foreground">
                            {value}
                          </span>
                        )}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Countries */}
            {countries.length > 0 && (
              <Card className="bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs font-semibold">
                    {t("countries")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MiniDataTable
                    rows={countries.map((c) => ({
                      label: c.country,
                      count: c.count,
                    }))}
                    total={totalClicks}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Referrers */}
          {referrers.length > 0 && (
            <Card className="bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold">
                  {t("referrers")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <MiniDataTable
                  rows={referrers.map((r) => ({
                    label: r.referrer,
                    count: r.count,
                  }))}
                  total={totalClicks}
                />
              </CardContent>
            </Card>
          )}

          {/* Empty state */}
          {totalClicks === 0 && (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <MousePointerClick
                className="size-8 mb-2"
                style={{ color: BRAND_ORANGE }}
              />
              <p className="text-sm text-muted-foreground">{t("noClicks")}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SummaryMini({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg border border-border bg-white p-3 text-center">
      <Icon
        className="size-4 mx-auto mb-1"
        style={{ color: BRAND_ORANGE }}
      />
      <p className="text-lg font-bold text-foreground leading-none">{value}</p>
      <p className="text-[10px] text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

interface MiniDataTableRow {
  label: string;
  count: number;
}

function MiniDataTable({
  rows,
  total,
}: {
  rows: MiniDataTableRow[];
  total: number;
}) {
  return (
    <div className="space-y-0">
      {rows.slice(0, 5).map((row, i) => {
        const pct = total > 0 ? Math.round((row.count / total) * 100) : 0;
        return (
          <div
            key={i}
            className="flex items-center justify-between py-1.5 border-b border-border last:border-0"
          >
            <span
              className="text-xs text-foreground truncate max-w-[120px]"
              title={row.label}
            >
              {row.label}
            </span>
            <div className="flex items-center gap-2 shrink-0 ml-3">
              <div className="hidden sm:block h-1 w-12 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max(pct, 3)}%`,
                    backgroundColor: BRAND_ORANGE,
                  }}
                />
              </div>
              <span className="text-xs font-medium text-foreground tabular-nums">
                {row.count}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
