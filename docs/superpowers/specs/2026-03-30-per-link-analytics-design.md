# Per-Link Click Analytics

## Context

Users can already see aggregate analytics in the Analytics tab (total views, top links, devices, countries). But there's no way to see per-link performance directly from the Content tab where links are managed. Linktree shows a click count on each link card and opens a detailed insights modal when clicked. We want the same for Viopage.

**No database changes required** — `analytics_events` already stores `link_id`, `device`, `country`, `referrer`, `browser`, and `created_at` on every click.

## Feature Summary

| Part | Description |
|------|-------------|
| Click count badge | Orange pill on each link card showing total lifetime clicks |
| Link Insights modal | Detailed breakdown: clicks over time, traffic sources, locations, devices |

## Part 1: Click Count Badge on Link Cards

### Behavior

- Replace the placeholder BarChart3 icon button in `link-card.tsx` (line 190-198) with a clickable **click count badge**
- Badge text: `"{count} clicks"` (or `"1 click"` singular)
- Visual states:
  - **Has clicks (> 0)**: warm orange tint background (`bg-orange-50`), orange border, orange text
  - **Zero clicks**: neutral gray (`bg-slate-50`), gray border, muted text
- On hover: badge highlights (filled orange for > 0, slightly darker gray for 0)
- On click: opens the Link Insights modal

### Data Fetching

Create a hook `useLinkClickCounts` in `src/lib/hooks/use-link-click-counts.ts`:

```typescript
interface LinkClickCounts {
  counts: Record<string, number>; // { [linkId]: totalClicks }
  loading: boolean;
}
```

**Query strategy**: Fetch all `link_click` events for this user (just `link_id` column) and count per link_id in JS. This matches the existing client-side pattern used by the Analytics tab.

```typescript
const { data } = await supabase
  .from("analytics_events")
  .select("link_id")
  .eq("profile_id", userId)
  .eq("event_type", "link_click")
  .not("link_id", "is", null);

// Count in JS
const counts: Record<string, number> = {};
for (const row of data ?? []) {
  counts[row.link_id!] = (counts[row.link_id!] ?? 0) + 1;
}
```

The hook lives in the `LinkList` component and passes counts down to each `LinkCard` via props.

### Props Change

```typescript
// link-card.tsx
interface LinkCardProps {
  link: Link;
  clickCount: number;    // NEW
  onOpenInsights: (linkId: string) => void;  // NEW
}
```

## Part 2: Link Insights Modal

### Component

New file: `src/components/dashboard/link-insights-modal.tsx`

### Modal Container

- **Mobile (< 640px)**: Full-screen drawer/sheet sliding up from bottom (use `Sheet` from shadcn)
- **Tablet/Desktop (>= 640px)**: Centered `Dialog` modal, max-width 520px
- Uses the existing `Dialog`/`Sheet` components from shadcn/ui

### Header

- Link title (bold, 14px)
- Truncated URL below (muted, 12px)
- Close button (X) on the right

### Date Range

Three pill buttons: **7 days** (default) | **30 days** | **All time**

Matches the existing Analytics tab's date range options for consistent UX.

### Sections (in order)

#### 1. Clicks Over Time

- **Chart**: Bar chart using Recharts `BarChart` (matching existing chart style with `BRAND_ORANGE`)
- X-axis: dates (formatted as "MMM d")
- Y-axis: click count (integers)
- Below chart: summary row showing "Total Clicks" with Lifetime count and period count side by side
- **Empty state**: "No clicks in this period" message (reuse `EmptyChart` pattern from `analytics-charts.tsx`)

**Data processing**: New function `groupClicksByDay(events)` in `process.ts` — same logic as `groupByDay` but filters for `link_click` instead of `page_view`.

#### 2. Traffic Sources

- Ranked list (1, 2, 3...) of referrer domains
- Each row: rank number, source name, click count, CTR percentage
- Uses `extractDomain()` from `process.ts` (already exists, needs to be exported — currently private) to parse referrer URLs
- "Direct" for null referrers
- Top 10

**Data processing**: Reuse existing `topReferrers()` function, but only pass events for the specific link.

#### 3. Locations

- Ranked list with country flag emoji + country name
- Each row: flag, rank + country name, click count, CTR percentage
- Top 10
- Country code → flag emoji conversion: `String.fromCodePoint(...code.split('').map(c => 0x1F1E6 + c.charCodeAt(0) - 65))`
- Country code → name: use `Intl.DisplayNames` API (built into browsers)

**Data processing**: Reuse existing `topCountries()` function, filtered to this link's events.

#### 4. Devices

- Three rows: Mobile, Tablet, Desktop (with device icons from Lucide: `Smartphone`, `Tablet`, `Monitor`)
- Each row: icon, rank + device name, click count, CTR percentage

**Data processing**: Reuse existing `deviceBreakdown()` function, filtered to this link's events.

### CTR Calculation

For traffic sources, locations, and devices within the modal, CTR = `(section_clicks / total_link_clicks) * 100`. This shows the percentage share of each source/location/device relative to total clicks for this link.

### Date Range Note

Below each section: small muted text "Date Range: {selected range}" (e.g., "Date Range: 7 days").

### Data Fetching

When the modal opens, fetch events for the specific link:

```sql
SELECT * FROM analytics_events
WHERE link_id = $linkId
  AND event_type = 'link_click'
  AND created_at >= $dateThreshold  -- optional, based on selected range
```

Also fetch all-time count separately for the summary row (lifetime vs period).

Create a new function in `process.ts`:

```typescript
interface ProcessedLinkAnalytics {
  totalClicks: number;
  lifetimeClicks: number;
  clicksOverTime: DayCount[];
  trafficSources: ReferrerCount[];
  locations: CountryCount[];
  devices: DeviceCount[];
}

export function processLinkAnalytics(
  periodEvents: AnalyticsEvent[],
  lifetimeCount: number
): ProcessedLinkAnalytics
```

This reuses the existing processor functions internally.

## Responsive Design (Stitch)

Use Stitch MCP to generate screen designs for the insights modal at three breakpoints before implementation:
- Mobile (375px) — bottom sheet, full width
- Tablet (768px) — centered modal, 480px
- Desktop (1280px) — centered modal, 520px

## i18n Keys

Add to both `en.json` and `pt-BR.json` under `dashboard.links`:

```json
{
  "dashboard": {
    "links": {
      "clicks": "{count} clicks",
      "clickSingular": "1 click",
      "clicksZero": "0 clicks",
      "insights": "Insights",
      "clicksOverTime": "Clicks",
      "totalClicks": "Total Clicks",
      "lifetime": "Lifetime",
      "lastNDays": "Last {count} days",
      "allTime": "All time",
      "trafficSources": "Traffic Sources",
      "locations": "Locations",
      "devices": "Devices",
      "dateRange": "Date Range: {range}",
      "noClicks": "No clicks in this period",
      "direct": "Direct",
      "unknown": "Unknown",
      "clickRate": "{rate}% Click rate",
    }
  }
}
```

## Files to Create/Modify

| File | Action | Description |
|------|--------|-------------|
| `src/components/dashboard/link-insights-modal.tsx` | Create | The insights modal with chart + sections |
| `src/lib/hooks/use-link-click-counts.ts` | Create | Hook to fetch bulk click counts for all links |
| `src/lib/analytics/process.ts` | Modify | Add `processLinkAnalytics()` + `groupClicksByDay()` |
| `src/components/dashboard/link-card.tsx` | Modify | Replace BarChart3 button with click count badge, add modal trigger |
| `src/components/dashboard/link-list.tsx` | Modify | Fetch click counts via hook, pass to LinkCard |
| `src/messages/en.json` | Modify | Add i18n keys |
| `src/messages/pt-BR.json` | Modify | Add Portuguese translations |

## Verification

1. **Click counts display**: Create test link, visit public profile, click link, return to dashboard — badge should show "1 click"
2. **Insights modal**: Click the badge, verify all 4 sections render with correct data
3. **Date range**: Switch between 7d/30d/all in the modal, verify chart and lists update
4. **Responsive**: Test modal on mobile (375px), tablet (768px), desktop (1280px) — should be sheet on mobile, centered dialog on larger screens
5. **Zero state**: Link with no clicks shows gray badge, modal shows empty states
6. **i18n**: Switch to PT-BR locale, verify all strings translate
