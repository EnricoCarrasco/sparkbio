"use client";

import React, { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  linkClicksOverTime,
  linkDeviceBreakdown,
  linkReferrers,
  linkCountries,
} from "@/lib/analytics/process";
import {
  DASH,
  DASH_SANS,
  DASH_SERIF,
  DASH_MONO,
  Eyebrow,
  Pill,
  BrandDot,
} from "@/components/dashboard/_dash-primitives";
import type { AnalyticsEvent } from "@/types/database";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

// ─── Mini area chart ─────────────────────────────────────────────────────────

function MiniAreaChart({
  data,
  height = 140,
}: {
  data: { date: string; count: number }[];
  height?: number;
}) {
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [w, setW] = React.useState(420);

  React.useEffect(() => {
    if (!ref.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setW(Math.max(240, entry.contentRect.width));
      }
    });
    ro.observe(ref.current);
    return () => ro.disconnect();
  }, []);

  const pad = { l: 28, r: 8, t: 8, b: 20 };
  const h = height;

  if (!data || data.length === 0) {
    return (
      <div
        ref={ref}
        style={{
          height: h,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: DASH.muted,
          fontFamily: DASH_SANS,
          fontSize: 12,
        }}
      >
        No data
      </div>
    );
  }

  const series = data.length === 1 ? [...data, ...data] : data;
  const maxV = Math.max(1, ...series.map((p) => p.count));
  const innerW = Math.max(1, w - pad.l - pad.r);
  const innerH = Math.max(1, h - pad.t - pad.b);
  const step = series.length > 1 ? innerW / (series.length - 1) : 0;

  const pts = series.map((p, i) => {
    const x = pad.l + i * step;
    const y = pad.t + innerH - (p.count / maxV) * innerH;
    return [x, y] as [number, number];
  });

  const linePath = pts
    .map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
    .join(" ");
  const areaPath =
    `M${pts[0][0].toFixed(1)} ${(pad.t + innerH).toFixed(1)} ` +
    pts.map((p) => `L${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ") +
    ` L${pts[pts.length - 1][0].toFixed(1)} ${(pad.t + innerH).toFixed(1)} Z`;

  const tickCount = Math.min(5, series.length);
  const tickIdxs =
    tickCount <= 1
      ? [0]
      : Array.from({ length: tickCount }, (_, i) =>
          Math.round((i * (series.length - 1)) / (tickCount - 1))
        );

  return (
    <div ref={ref} style={{ width: "100%" }}>
      <svg
        width="100%"
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        style={{ display: "block", overflow: "visible" }}
      >
        <defs>
          <linearGradient id="miniChartFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={DASH.orange} stopOpacity="0.3" />
            <stop offset="100%" stopColor={DASH.orange} stopOpacity="0" />
          </linearGradient>
        </defs>
        <line
          x1={pad.l}
          x2={w - pad.r}
          y1={pad.t + innerH}
          y2={pad.t + innerH}
          stroke={DASH.line}
        />
        <path d={areaPath} fill="url(#miniChartFill)" />
        <path
          d={linePath}
          fill="none"
          stroke={DASH.orange}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {tickIdxs.map((i) => (
          <text
            key={i}
            x={pts[i][0]}
            y={h - 4}
            fontSize="9"
            fill={DASH.muted}
            textAnchor="middle"
            fontFamily={DASH_MONO}
          >
            {series[i].date}
          </text>
        ))}
      </svg>
    </div>
  );
}

// ─── Main dialog ─────────────────────────────────────────────────────────────

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

  const deviceTotal = devices.reduce((s, d) => s + d.value, 0) || 1;
  const deviceColors: Record<string, string> = {
    Mobile: DASH.orange,
    Desktop: DASH.ink,
    Tablet: DASH.cream3,
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-lg max-h-[85vh] overflow-y-auto"
        style={{
          background: DASH.panel,
          border: `1px solid ${DASH.line}`,
          fontFamily: DASH_SANS,
        }}
      >
        <DialogHeader>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <BrandDot brand={linkTitle} size={40} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <Eyebrow>{t("linkDetail")}</Eyebrow>
              <DialogTitle
                className="truncate"
                style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: DASH.ink,
                  fontFamily: DASH_SANS,
                  letterSpacing: "-0.02em",
                  marginTop: 2,
                }}
              >
                {linkTitle}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Summary row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 10,
            }}
          >
            <SummaryMini label={t("clicks")} value={formatNumber(totalClicks)} />
            <SummaryMini label={t("activeDays")} value={String(activeDays)} />
            <SummaryMini
              label={t("peakDay")}
              value={peakDay?.date ?? "—"}
              small
            />
          </div>

          {/* Clicks over time */}
          {clicksOverTime.length > 0 && (
            <div className="dash-panel" style={{ padding: 16 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <Eyebrow>{t("clicksOverTime")}</Eyebrow>
                <Pill tone="cream">{totalClicks} total</Pill>
              </div>
              <MiniAreaChart data={clicksOverTime} height={140} />
            </div>
          )}

          {/* Devices + Countries */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            {devices.length > 0 && (
              <div className="dash-panel" style={{ padding: 16 }}>
                <Eyebrow>{t("devices")}</Eyebrow>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 10,
                    marginTop: 12,
                  }}
                >
                  {devices.map((d) => {
                    const pct = Math.round((d.value / deviceTotal) * 100);
                    return (
                      <div key={d.name}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 8,
                              fontSize: 12,
                              fontWeight: 600,
                              color: DASH.ink,
                            }}
                          >
                            <span
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: 2,
                                background: deviceColors[d.name] ?? DASH.muted,
                              }}
                            />
                            {d.name}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              color: DASH.muted,
                              fontFamily: DASH_MONO,
                            }}
                          >
                            {pct}%
                          </span>
                        </div>
                        <div className="dash-bar-bg">
                          <div
                            className="dash-bar-fill"
                            style={{ width: `${Math.max(pct, 2)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {countries.length > 0 && (
              <div className="dash-panel" style={{ padding: 16 }}>
                <Eyebrow>{t("countries")}</Eyebrow>
                <MiniList
                  rows={countries.map((c) => ({
                    label: c.country,
                    count: c.count,
                  }))}
                  total={totalClicks}
                />
              </div>
            )}
          </div>

          {/* Referrers */}
          {referrers.length > 0 && (
            <div className="dash-panel" style={{ padding: 16 }}>
              <Eyebrow>{t("referrers")}</Eyebrow>
              <MiniList
                rows={referrers.map((r) => ({
                  label: r.referrer,
                  count: r.count,
                }))}
                total={totalClicks}
              />
            </div>
          )}

          {/* Empty state */}
          {totalClicks === 0 && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "36px 16px",
                textAlign: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  fontFamily: DASH_SERIF,
                  fontStyle: "italic",
                  fontSize: 28,
                  color: DASH.orange,
                }}
              >
                quiet
              </div>
              <p
                style={{
                  fontSize: 13,
                  color: DASH.muted,
                  fontFamily: DASH_SANS,
                }}
              >
                {t("noClicks")}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SummaryMini({
  label,
  value,
  small = false,
}: {
  label: string;
  value: string;
  small?: boolean;
}) {
  return (
    <div
      style={{
        background: DASH.cream,
        border: `1px solid ${DASH.line}`,
        borderRadius: 14,
        padding: "10px 12px",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontSize: small ? 14 : 20,
          fontWeight: 700,
          color: DASH.ink,
          fontFamily: DASH_SANS,
          letterSpacing: "-0.02em",
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: 10,
          color: DASH.muted,
          fontFamily: DASH_MONO,
          textTransform: "uppercase",
          letterSpacing: ".12em",
          marginTop: 4,
          fontWeight: 600,
        }}
      >
        {label}
      </div>
    </div>
  );
}

interface MiniListRow {
  label: string;
  count: number;
}

function MiniList({ rows, total }: { rows: MiniListRow[]; total: number }) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 10,
        marginTop: 12,
      }}
    >
      {rows.slice(0, 5).map((row, i) => {
        const pct = total > 0 ? Math.round((row.count / total) * 100) : 0;
        return (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: 6,
                }}
              >
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: DASH.ink,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontFamily: DASH_SANS,
                  }}
                  title={row.label}
                >
                  {row.label}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: DASH.ink,
                    fontVariantNumeric: "tabular-nums",
                    fontFamily: DASH_SANS,
                  }}
                >
                  {row.count}
                </span>
              </div>
              <div className="dash-bar-bg">
                <div
                  className="dash-bar-fill"
                  style={{ width: `${Math.max(pct, 2)}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
