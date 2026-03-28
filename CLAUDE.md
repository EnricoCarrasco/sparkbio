# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Viopage** (formerly Sparkbio) — a link-in-bio SaaS for creators (Linktree clone). Users sign up, add links, customize a theme, and share a public profile at `/{username}`.

## Commands

```bash
npm run dev      # Start dev server on port 3000
npm run build    # Production build (Turbopack)
npm run lint     # ESLint
```

No test framework is set up yet.

## Tech Stack

- **Next.js 16.2.0** (App Router, React 19, Turbopack)
- **Tailwind CSS v4** (CSS-based config in `globals.css`, no `tailwind.config.js`)
- **shadcn/ui** with `@base-ui/react` (not Radix — components use Base UI API)
- **Supabase** (PostgreSQL, Auth, Storage) — project ID: `lbouculyhpqcnmvyrofo`
- **Zustand** for client state (6 stores)
- **LemonSqueezy** for payments (Merchant of Record — handles chargebacks, tax)
- **next-intl** for i18n (EN + PT-BR, cookie-based locale, no URL prefixes)
- **Framer Motion** for animations
- **Recharts** for analytics charts
- **@dnd-kit** for drag-and-drop link reordering
- **Zod v4** for validation (import from `zod/v4`)

## Architecture

### Route Groups

```
src/app/
├── (auth)/          # Login, register, forgot/reset password, OAuth callback
├── (dashboard)/     # Single-page dashboard with tab switching (not route-based)
├── (marketing)/     # Landing page with navbar + footer
├── [username]/      # Public profile (SSR, ISR revalidate=60)
└── api/analytics/   # POST endpoint for page views and link clicks
```

### Critical: `[username]` vs i18n Conflict

The `[username]` dynamic segment sits at the root. We intentionally do NOT use `next-intl` middleware URL rewriting — it would rewrite `/` to `/en`, which the `[username]` route catches. Instead, locale is detected from a `locale` cookie or `Accept-Language` header in `src/i18n/request.ts`. The middleware (`src/middleware.ts`) only handles Supabase session refresh.

### Dashboard Architecture

The dashboard uses a **tab-based SPA pattern**, not route-based navigation. `useDashboardStore` controls `activeTab` (`content | design | analytics | settings`). The route pages (`dashboard/page.tsx`, `dashboard/appearance/page.tsx`, etc.) just set the active tab and render null — the actual layout in `(dashboard)/layout.tsx` renders the correct tab component.

Key dashboard components:
- `ContentTab` — profile editor + link list + social icon manager
- `DesignTab` — theme/wallpaper/buttons/fonts editor (sub-tabs)
- `PreviewPanel` — live iframe of the user's public profile page

### Supabase Setup

- **4 client helpers**: `client.ts` (browser), `server.ts` (server components), `admin.ts` (service_role for analytics inserts), `middleware.ts` (session refresh)
- **RPC**: `get_public_profile(p_username)` — single call returning profile + links + theme + social_icons + subscription
- **RLS**: Public read on profiles/links/themes/social_icons. Owner-only writes. Analytics: service_role insert, owner select.
- **Auth trigger**: `on_auth_user_created` auto-creates `profiles` + `themes` rows

### Zustand Stores

All in `src/lib/stores/`:
- `profile-store` — profile CRUD + avatar upload
- `link-store` — link CRUD + drag reorder
- `theme-store` — theme updates with **debounced auto-save** (500ms, saves full theme state)
- `social-store` — social icon CRUD
- `dashboard-store` — active tab/sub-tab navigation
- `subscription-store` — subscription state + `isPro` computed boolean

Theme store saves the entire theme object on debounce (not just the last changed field) to prevent lost updates during rapid changes.

### i18n

- Cookie-based, not URL-based. No locale in URLs.
- Messages in `src/messages/en.json` and `src/messages/pt-BR.json`
- `Accept-Language` parsed with quality scores for auto-detection
- `LanguageSwitcher` component sets a `locale` cookie and calls `router.refresh()`

### Fonts

- **Poppins** (`--font-sans`) — app-wide body font
- **Instrument Serif** (`--font-display`) — landing page display headlines only

## Key Patterns

- **shadcn/ui uses Base UI, not Radix.** `DialogTrigger`, `SheetTrigger` use `render` prop instead of `asChild`. `Select.onValueChange` receives `string | null`.
- **Tailwind v4** — theme tokens defined in `@theme inline {}` block in `globals.css`. No JS config file.
- **Zod v4** — import from `zod/v4`, not `zod`.
- **Public profile** uses ISR (`revalidate = 60`). Dashboard preview adds `?preview=1` to skip analytics tracking.
- **Analytics** uses `navigator.sendBeacon()` for non-blocking event recording. API route uses `createAdminClient()` (service_role) for inserts.

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXT_PUBLIC_SITE_URL
LEMONSQUEEZY_API_KEY
LEMONSQUEEZY_STORE_ID
LEMONSQUEEZY_WEBHOOK_SECRET
LEMONSQUEEZY_MONTHLY_VARIANT_ID
LEMONSQUEEZY_YEARLY_VARIANT_ID
```

## Database

6 tables: `profiles`, `links`, `themes`, `social_icons`, `analytics_events`, `subscriptions`. Migrations in `supabase/migrations/`. The `themes` table has both legacy fields (`button_style`, `bg_color`) and v2 design fields (`button_style_v2`, `button_corner`, `button_shadow`, `wallpaper_style`, etc.). The `subscriptions` table stores LemonSqueezy subscription state (one per user, service_role write only).
