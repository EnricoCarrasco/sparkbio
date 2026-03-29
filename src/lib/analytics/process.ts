import { format, parseISO, startOfDay } from "date-fns";
import type { AnalyticsEvent, Link } from "@/types/database";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DayCount {
  date: string; // "MMM d" formatted
  count: number;
}

export interface LinkClick {
  id: string;
  title: string;
  count: number;
}

export interface DeviceCount {
  name: string;
  value: number;
}

export interface ReferrerCount {
  referrer: string;
  count: number;
}

export interface CountryCount {
  country: string;
  count: number;
}

export interface ProcessedAnalytics {
  totalViews: number;
  totalClicks: number;
  clickRate: number;
  viewsOverTime: DayCount[];
  topLinks: LinkClick[];
  devices: DeviceCount[];
  topReferrers: ReferrerCount[];
  topCountries: CountryCount[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Extracts the domain from a referrer URL string.
 * Falls back to the raw string when parsing fails.
 */
function extractDomain(referrer: string | null): string {
  if (!referrer) return "Direct";
  try {
    const url = new URL(
      referrer.startsWith("http") ? referrer : `https://${referrer}`
    );
    return url.hostname.replace(/^www\./, "");
  } catch {
    return referrer.slice(0, 40);
  }
}

// ─── Processors ───────────────────────────────────────────────────────────────

/**
 * Groups page_view events by calendar day and returns an array sorted
 * chronologically, ready for the Recharts LineChart.
 */
export function groupByDay(events: AnalyticsEvent[]): DayCount[] {
  const pageViews = events.filter((e) => e.event_type === "page_view");

  const counts: Record<string, number> = {};
  for (const event of pageViews) {
    const day = format(startOfDay(parseISO(event.created_at)), "yyyy-MM-dd");
    counts[day] = (counts[day] ?? 0) + 1;
  }

  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([isoDate, count]) => ({
      date: format(parseISO(isoDate), "MMM d"),
      count,
    }));
}

/**
 * Counts link_click events per link_id, joins with the links array for titles,
 * and returns the top 5 sorted by click count descending.
 */
export function topLinkClicks(
  events: AnalyticsEvent[],
  links: Pick<Link, "id" | "title">[]
): LinkClick[] {
  const clicks = events.filter((e) => e.event_type === "link_click");

  const counts: Record<string, number> = {};
  for (const event of clicks) {
    if (!event.link_id) continue;
    counts[event.link_id] = (counts[event.link_id] ?? 0) + 1;
  }

  const linkMap = new Map(links.map((l) => [l.id, l.title]));

  return Object.entries(counts)
    .map(([id, count]) => ({
      id,
      title: linkMap.get(id) ?? "Unknown link",
      count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

/**
 * Counts events (all types) by device category for the pie chart.
 * Normalises device strings to "Desktop", "Mobile", or "Tablet".
 */
export function deviceBreakdown(events: AnalyticsEvent[]): DeviceCount[] {
  const counts: Record<string, number> = {};

  for (const event of events) {
    const raw = (event.device ?? "").toLowerCase();
    let device = "Desktop";
    if (raw.includes("mobile") || raw.includes("phone")) {
      device = "Mobile";
    } else if (raw.includes("tablet") || raw.includes("ipad")) {
      device = "Tablet";
    }
    counts[device] = (counts[device] ?? 0) + 1;
  }

  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

/**
 * Counts events by referrer domain and returns the top 10 sorted by count.
 */
export function topReferrers(events: AnalyticsEvent[]): ReferrerCount[] {
  const counts: Record<string, number> = {};

  for (const event of events) {
    const domain = extractDomain(event.referrer);
    counts[domain] = (counts[domain] ?? 0) + 1;
  }

  return Object.entries(counts)
    .map(([referrer, count]) => ({ referrer, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

/**
 * Counts events by country code and returns the top 10 sorted by count.
 */
export function topCountries(events: AnalyticsEvent[]): CountryCount[] {
  const counts: Record<string, number> = {};

  for (const event of events) {
    const country = event.country ?? "Unknown";
    counts[country] = (counts[country] ?? 0) + 1;
  }

  return Object.entries(counts)
    .map(([country, count]) => ({ country, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

/**
 * Counts link_click events per link_id, joins with the links array for titles,
 * and returns ALL links sorted by click count descending (including zero-click links).
 */
export function allLinkClicks(
  events: AnalyticsEvent[],
  links: Pick<Link, "id" | "title">[]
): LinkClick[] {
  const clicks = events.filter((e) => e.event_type === "link_click");

  const counts: Record<string, number> = {};
  for (const event of clicks) {
    if (!event.link_id) continue;
    counts[event.link_id] = (counts[event.link_id] ?? 0) + 1;
  }

  return links
    .map((l) => ({
      id: l.id,
      title: l.title,
      count: counts[l.id] ?? 0,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Groups link_click events for a specific link by calendar day,
 * returning a sorted array for line charts.
 */
export function linkClicksOverTime(
  events: AnalyticsEvent[],
  linkId: string
): DayCount[] {
  const clicks = events.filter(
    (e) => e.event_type === "link_click" && e.link_id === linkId
  );

  const counts: Record<string, number> = {};
  for (const event of clicks) {
    const day = format(startOfDay(parseISO(event.created_at)), "yyyy-MM-dd");
    counts[day] = (counts[day] ?? 0) + 1;
  }

  return Object.entries(counts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([isoDate, count]) => ({
      date: format(parseISO(isoDate), "MMM d"),
      count,
    }));
}

/**
 * Device breakdown filtered to a single link's click events.
 */
export function linkDeviceBreakdown(
  events: AnalyticsEvent[],
  linkId: string
): DeviceCount[] {
  const clicks = events.filter(
    (e) => e.event_type === "link_click" && e.link_id === linkId
  );
  return deviceBreakdown(clicks);
}

/**
 * Referrers filtered to a single link's click events.
 */
export function linkReferrers(
  events: AnalyticsEvent[],
  linkId: string
): ReferrerCount[] {
  const clicks = events.filter(
    (e) => e.event_type === "link_click" && e.link_id === linkId
  );
  return topReferrers(clicks);
}

/**
 * Countries filtered to a single link's click events.
 */
export function linkCountries(
  events: AnalyticsEvent[],
  linkId: string
): CountryCount[] {
  const clicks = events.filter(
    (e) => e.event_type === "link_click" && e.link_id === linkId
  );
  return topCountries(clicks);
}

/**
 * Runs all processors over the raw events and links and returns a single
 * ProcessedAnalytics object for the charts component.
 */
export function processAnalytics(
  events: AnalyticsEvent[],
  links: Pick<Link, "id" | "title">[]
): ProcessedAnalytics {
  const totalViews = events.filter((e) => e.event_type === "page_view").length;
  const totalClicks = events.filter((e) => e.event_type === "link_click").length;
  const clickRate =
    totalViews > 0 ? Math.round((totalClicks / totalViews) * 100 * 10) / 10 : 0;

  return {
    totalViews,
    totalClicks,
    clickRate,
    viewsOverTime: groupByDay(events),
    topLinks: topLinkClicks(events, links),
    devices: deviceBreakdown(events),
    topReferrers: topReferrers(events),
    topCountries: topCountries(events),
  };
}
