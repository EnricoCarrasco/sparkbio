"use client";

import React from "react";
import { useTranslations } from "next-intl";
import { LinkAnalyticsDetail } from "@/components/dashboard/link-analytics-detail";
import {
  DASH,
  DASH_SANS,
  DASH_SERIF,
  DASH_MONO,
  Eyebrow,
  Pill,
  BrandDot,
} from "@/components/dashboard/_dash-primitives";
import type { ProcessedAnalytics, LinkClick } from "@/lib/analytics/process";
import type { AnalyticsEvent } from "@/types/database";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

// ─── Gradient area chart ─────────────────────────────────────────────────────

interface BigChartProps {
  data: { date: string; count: number }[];
  width?: number;
  height?: number;
}

function BigChart({ data, height = 260 }: BigChartProps) {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [w, setW] = React.useState(640);

  React.useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setW(Math.max(280, entry.contentRect.width));
      }
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const [hoverIdx, setHoverIdx] = React.useState<number | null>(null);

  const h = height;
  const pad = { l: 36, r: 12, t: 16, b: 28 };

  const isEmpty = !data || data.length === 0;
  const series = isEmpty
    ? []
    : data.length === 1
      ? [...data, ...data]
      : data;
  const maxV = Math.max(1, ...series.map((p) => p.count));
  const minV = 0;
  const innerW = Math.max(1, w - pad.l - pad.r);
  const innerH = Math.max(1, h - pad.t - pad.b);
  const step = series.length > 1 ? innerW / (series.length - 1) : 0;

  const pts = series.map((p, i) => {
    const x = pad.l + i * step;
    const y =
      pad.t + innerH - ((p.count - minV) / (maxV - minV || 1)) * innerH;
    return [x, y] as [number, number];
  });

  if (isEmpty) {
    return (
      <div
        ref={containerRef}
        style={{
          height: h,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: DASH.muted,
          fontFamily: DASH_SANS,
          fontSize: 13,
        }}
      >
        No data yet
      </div>
    );
  }

  const linePath = pts
    .map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
    .join(" ");
  const areaPath =
    `M${pts[0][0].toFixed(1)} ${(pad.t + innerH).toFixed(1)} ` +
    pts
      .map((p) => `L${p[0].toFixed(1)} ${p[1].toFixed(1)}`)
      .join(" ") +
    ` L${pts[pts.length - 1][0].toFixed(1)} ${(pad.t + innerH).toFixed(1)} Z`;

  // Y gridlines (4 rows)
  const gridRows = 4;
  const gridLines = Array.from({ length: gridRows + 1 }, (_, i) => {
    const y = pad.t + (innerH * i) / gridRows;
    const v = Math.round(maxV - (maxV * i) / gridRows);
    return { y, v };
  });

  // X tick labels: show ~5 evenly
  const tickCount = Math.min(6, series.length);
  const tickIdxs =
    tickCount <= 1
      ? [0]
      : Array.from({ length: tickCount }, (_, i) =>
          Math.round((i * (series.length - 1)) / (tickCount - 1))
        );

  function onMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * w;
    if (x < pad.l || x > w - pad.r) {
      setHoverIdx(null);
      return;
    }
    const relX = x - pad.l;
    const idx = Math.min(
      series.length - 1,
      Math.max(0, Math.round(relX / (step || 1)))
    );
    setHoverIdx(idx);
  }

  return (
    <div ref={containerRef} style={{ width: "100%", position: "relative" }}>
      <svg
        width="100%"
        height={h}
        viewBox={`0 0 ${w} ${h}`}
        style={{ display: "block", overflow: "visible" }}
        onMouseMove={onMove}
        onMouseLeave={() => setHoverIdx(null)}
        role="img"
        aria-label="Views over time chart"
      >
        <defs>
          <linearGradient id="bigChartFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={DASH.orange} stopOpacity="0.32" />
            <stop offset="100%" stopColor={DASH.orange} stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Gridlines */}
        {gridLines.map((g, i) => (
          <g key={i}>
            <line
              x1={pad.l}
              x2={w - pad.r}
              y1={g.y}
              y2={g.y}
              stroke={DASH.line}
              strokeDasharray="3 4"
            />
            <text
              x={pad.l - 8}
              y={g.y + 3}
              fontSize="10"
              fill={DASH.muted}
              textAnchor="end"
              fontFamily={DASH_MONO}
            >
              {formatNumber(g.v)}
            </text>
          </g>
        ))}

        {/* Area + line */}
        <path d={areaPath} fill="url(#bigChartFill)" />
        <path
          d={linePath}
          fill="none"
          stroke={DASH.orange}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Ticks */}
        {tickIdxs.map((i) => (
          <text
            key={i}
            x={pts[i][0]}
            y={h - 8}
            fontSize="10"
            fill={DASH.muted}
            textAnchor="middle"
            fontFamily={DASH_MONO}
          >
            {series[i].date}
          </text>
        ))}

        {/* Hover indicator */}
        {hoverIdx !== null && pts[hoverIdx] && (
          <>
            <line
              x1={pts[hoverIdx][0]}
              x2={pts[hoverIdx][0]}
              y1={pad.t}
              y2={pad.t + innerH}
              stroke={DASH.ink}
              strokeOpacity="0.15"
              strokeDasharray="2 3"
            />
            <circle
              cx={pts[hoverIdx][0]}
              cy={pts[hoverIdx][1]}
              r={5}
              fill="#fff"
              stroke={DASH.orange}
              strokeWidth="2"
            />
          </>
        )}
      </svg>

      {hoverIdx !== null && pts[hoverIdx] && (
        <div
          style={{
            position: "absolute",
            left: Math.min(
              Math.max(pts[hoverIdx][0] - 60, 4),
              Math.max(4, w - 124)
            ),
            top: Math.max(0, pts[hoverIdx][1] - 54),
            pointerEvents: "none",
            background: DASH.ink,
            color: "#fff",
            padding: "6px 10px",
            borderRadius: 10,
            fontFamily: DASH_SANS,
            fontSize: 11,
            fontWeight: 500,
            whiteSpace: "nowrap",
            boxShadow: "0 4px 12px rgba(0,0,0,.18)",
          }}
        >
          <div style={{ opacity: 0.7, fontSize: 10, marginBottom: 2 }}>
            {series[hoverIdx].date}
          </div>
          <div style={{ fontWeight: 600 }}>
            {formatNumber(series[hoverIdx].count)} views
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Donut chart for device split ────────────────────────────────────────────

interface DonutSlice {
  label: string;
  value: number;
  color: string;
}

function DonutChart({ slices, size = 160 }: { slices: DonutSlice[]; size?: number }) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const R = size / 2;
  const r = R - 18;
  const inner = r - 20;

  // Precompute cumulative offsets without reassigning in map
  const offsets: number[] = [];
  {
    let running = 0;
    for (const s of slices) {
      offsets.push(running);
      running += s.value;
    }
  }

  const arcs = slices.map((s, i) => {
    const startVal = offsets[i];
    const endVal = offsets[i] + s.value;
    const start = (startVal / total) * Math.PI * 2 - Math.PI / 2;
    const end = (endVal / total) * Math.PI * 2 - Math.PI / 2;
    const large = end - start > Math.PI ? 1 : 0;
    const x1 = R + Math.cos(start) * r;
    const y1 = R + Math.sin(start) * r;
    const x2 = R + Math.cos(end) * r;
    const y2 = R + Math.sin(end) * r;
    const x3 = R + Math.cos(end) * inner;
    const y3 = R + Math.sin(end) * inner;
    const x4 = R + Math.cos(start) * inner;
    const y4 = R + Math.sin(start) * inner;
    const d = `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${inner} ${inner} 0 ${large} 0 ${x4} ${y4} Z`;
    return { d, color: s.color, label: s.label, value: s.value };
  });

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: "block" }}>
      {arcs.map((a, i) => (
        <path key={i} d={a.d} fill={a.color} />
      ))}
      <circle cx={R} cy={R} r={inner - 1} fill={DASH.panel} />
      <text
        x={R}
        y={R - 4}
        textAnchor="middle"
        fontSize="10"
        fill={DASH.muted}
        fontFamily={DASH_MONO}
        letterSpacing=".14em"
      >
        TOTAL
      </text>
      <text
        x={R}
        y={R + 14}
        textAnchor="middle"
        fontSize="18"
        fontWeight={700}
        fill={DASH.ink}
        fontFamily={DASH_SANS}
      >
        {formatNumber(total)}
      </text>
    </svg>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

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

  // Device slice colors
  const deviceColorMap: Record<string, string> = {
    Mobile: DASH.orange,
    Desktop: DASH.ink,
    Tablet: DASH.cream3,
  };
  const deviceTotal = devices.reduce((s, d) => s + d.value, 0) || 1;
  const deviceSlices: DonutSlice[] = devices.map((d) => ({
    label: d.name,
    value: d.value,
    color: deviceColorMap[d.name] ?? DASH.muted,
  }));

  // Referrer colors (stable palette)
  const refColors = [DASH.orange, DASH.ink, "#7C3AED", "#0EA5E9", "#16A34A", DASH.muted];

  return (
    <>
      {/* Big chart panel */}
      <div className="dash-panel" style={{ marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <Eyebrow>{t("viewsOverTime")}</Eyebrow>
            <div
              style={{
                fontSize: 20,
                fontWeight: 700,
                marginTop: 4,
                letterSpacing: "-0.02em",
                color: DASH.ink,
                fontFamily: DASH_SANS,
              }}
            >
              {formatNumber(totalViews)} views
            </div>
          </div>
          <Pill tone="orange">
            {totalClicks} clicks · {clickRate}% CTR
          </Pill>
        </div>
        <BigChart data={viewsOverTime} />
      </div>

      {/* Top links + Countries */}
      <div className="dash-two-col">
        {/* Top links */}
        <div className="dash-panel">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <Eyebrow>{t("topLinks")}</Eyebrow>
            {allLinks.length > 5 && (
              <button
                type="button"
                onClick={() => {
                  document
                    .getElementById("analytics-all-links")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
                style={{
                  fontSize: 12,
                  color: "var(--dash-orange-deep)",
                  fontWeight: 600,
                  background: "transparent",
                  border: 0,
                  cursor: "pointer",
                  fontFamily: DASH_SANS,
                }}
              >
                View all →
              </button>
            )}
          </div>

          {topLinks.length === 0 ? (
            <EmptyRow label="No link clicks yet" />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {topLinks.slice(0, 5).map((link, i) => {
                const pct =
                  totalClicks > 0
                    ? Math.round((link.count / totalClicks) * 100)
                    : 0;
                return (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => handleLinkClick(link)}
                    style={{
                      background: "transparent",
                      border: 0,
                      padding: 0,
                      textAlign: "left",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      fontFamily: DASH_SANS,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: DASH_SERIF,
                        fontStyle: "italic",
                        fontSize: 20,
                        color: DASH.orangeDeep,
                        width: 24,
                        flexShrink: 0,
                        lineHeight: 1,
                      }}
                    >
                      {i + 1}
                    </span>
                    <BrandDot brand={link.title} size={32} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          color: DASH.ink,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={link.title}
                      >
                        {link.title}
                      </div>
                      <div className="dash-bar-bg">
                        <div
                          className="dash-bar-fill"
                          style={{ width: `${Math.max(pct, 2)}%` }}
                        />
                      </div>
                    </div>
                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: DASH.ink,
                        fontVariantNumeric: "tabular-nums",
                        flexShrink: 0,
                      }}
                    >
                      {link.count}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Countries */}
        <div className="dash-panel">
          <Eyebrow>{t("countries")}</Eyebrow>
          <div style={{ marginTop: 14 }}>
            {topCountries.length === 0 ? (
              <EmptyRow label="No location data yet" />
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {topCountries.slice(0, 6).map((c) => {
                  const pct =
                    totalViews > 0
                      ? Math.round((c.count / totalViews) * 100)
                      : 0;
                  return (
                    <div
                      key={c.country}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        fontFamily: DASH_SANS,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "baseline",
                            gap: 8,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: DASH.ink,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={c.country}
                          >
                            {c.country}
                          </span>
                          <span
                            style={{
                              fontSize: 11,
                              color: DASH.muted,
                              fontFamily: DASH_MONO,
                              flexShrink: 0,
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
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: DASH.ink,
                          fontVariantNumeric: "tabular-nums",
                          flexShrink: 0,
                          width: 32,
                          textAlign: "right",
                        }}
                      >
                        {c.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Devices donut + Referrers */}
      <div className="dash-two-col">
        {/* Device split */}
        <div className="dash-panel">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <Eyebrow>{t("devices")}</Eyebrow>
          </div>
          {devices.length === 0 ? (
            <EmptyRow label="No device data yet" />
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                flexWrap: "wrap",
              }}
            >
              <DonutChart slices={deviceSlices} size={160} />
              <div
                style={{
                  flex: 1,
                  minWidth: 140,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                  fontFamily: DASH_SANS,
                }}
              >
                {deviceSlices.map((s) => {
                  const pct = Math.round((s.value / deviceTotal) * 100);
                  return (
                    <div
                      key={s.label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: 3,
                          background: s.color,
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          flex: 1,
                          fontSize: 13,
                          fontWeight: 600,
                          color: DASH.ink,
                        }}
                      >
                        {s.label}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: DASH.ink,
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Referrers */}
        <div className="dash-panel">
          <Eyebrow>{t("referrers")}</Eyebrow>
          <div style={{ marginTop: 14 }}>
            {topReferrers.length === 0 ? (
              <EmptyRow label="No referrer data yet" />
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {topReferrers.slice(0, 6).map((r, i) => {
                  const pct =
                    totalViews > 0
                      ? Math.round((r.count / totalViews) * 100)
                      : 0;
                  return (
                    <div
                      key={r.referrer}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        fontFamily: DASH_SANS,
                      }}
                    >
                      <span
                        style={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          background: refColors[i % refColors.length],
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          flex: 1,
                          fontSize: 13,
                          fontWeight: 600,
                          color: DASH.ink,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={r.referrer}
                      >
                        {r.referrer}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: DASH.muted,
                          fontFamily: DASH_MONO,
                          flexShrink: 0,
                        }}
                      >
                        {pct}%
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: DASH.ink,
                          fontVariantNumeric: "tabular-nums",
                          flexShrink: 0,
                          width: 32,
                          textAlign: "right",
                        }}
                      >
                        {r.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* All links performance list */}
      {allLinks.length > 0 && (
        <div
          id="analytics-all-links"
          className="dash-panel"
          style={{ marginTop: 16 }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
            }}
          >
            <Eyebrow>{t("linkPerformance")}</Eyebrow>
            <Pill tone="cream">{allLinks.length} total</Pill>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
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
                  style={{
                    background: "transparent",
                    border: 0,
                    borderBottom: `1px solid ${DASH.line}`,
                    padding: "12px 2px",
                    textAlign: "left",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    fontFamily: DASH_SANS,
                  }}
                >
                  <span
                    style={{
                      fontFamily: DASH_SERIF,
                      fontStyle: "italic",
                      fontSize: 16,
                      color: DASH.muted,
                      width: 22,
                      flexShrink: 0,
                      lineHeight: 1,
                    }}
                  >
                    {i + 1}
                  </span>
                  <BrandDot brand={link.title} size={28} />
                  <span
                    style={{
                      flex: 1,
                      fontSize: 13,
                      fontWeight: 600,
                      color: DASH.ink,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={link.title}
                  >
                    {link.title}
                  </span>
                  <div
                    className="dash-bar-bg"
                    style={{
                      width: 80,
                      flexShrink: 0,
                      marginTop: 0,
                    }}
                  >
                    <div
                      className="dash-bar-fill"
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: DASH.ink,
                      fontVariantNumeric: "tabular-nums",
                      flexShrink: 0,
                      width: 40,
                      textAlign: "right",
                    }}
                  >
                    {link.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
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
    </>
  );
}

// Re-exported helpers for external use on the page
export { formatNumber };

// ─── Sub-components ──────────────────────────────────────────────────────────

function EmptyRow({ label }: { label: string }) {
  return (
    <div
      style={{
        padding: "18px 0",
        textAlign: "center",
        fontSize: 13,
        color: DASH.muted,
        fontFamily: DASH_SANS,
      }}
    >
      {label}
    </div>
  );
}

