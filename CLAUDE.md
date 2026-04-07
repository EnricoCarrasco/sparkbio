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
- **next-intl** for i18n translations only (EN + PT-BR). Locale routing via custom `proxy.ts` rewrite — NOT next-intl middleware
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

### `[username]` Route vs Locale Prefixes

The `[username]` dynamic segment sits at the root. To prevent collisions, `"pt-br"` and `"en"` are in `RESERVED_USERNAMES` (`src/lib/constants.ts`). `src/proxy.ts` handles locale routing: requests to `/pt-BR` or `/pt-BR/*` are rewritten to the root path with an `x-locale-override: pt-BR` header, which `src/i18n/request.ts` reads to load Portuguese translations. For all other routes, the proxy runs Supabase `updateSession()` to refresh auth cookies and handle dashboard/auth redirects. We do NOT use next-intl's `createMiddleware` — it rewrites `/` to `/en` which conflicts with the `[username]` catch-all.

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

### i18n (Hybrid: Custom Proxy + next-intl for translations only)

- **next-intl is used ONLY for translations** (`useTranslations`, `getMessages`, message files). We do NOT use next-intl's routing/middleware — it conflicts with the `[username]` catch-all.
- **Locale routing is handled by `src/proxy.ts`**: rewrites `/pt-BR/*` to `/*` with an `x-locale-override` header. Supabase session refresh runs on all other routes.
- **`src/i18n/request.ts`** detects locale in this order: `x-locale-override` header → `locale` cookie → `Accept-Language` header → default `en`.
- **Marketing pages**: English at root (`/`), Portuguese at `/pt-BR/`. hrefLang tags on marketing pages link both versions for Google.
- **Dashboard/Auth**: Cookie-based locale. Language switcher sets `locale` cookie + `router.refresh()`.
- **Language switcher on marketing**: Uses `window.location.href` to navigate to `/pt-BR` or `/` (NOT next-intl's router — that would navigate to `/en` which 404s).
- Messages in `src/messages/en.json` and `src/messages/pt-BR.json`

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

## Tools

- **rembg** — AI background removal CLI (U2Net). Usage: `rembg i input.jpg output.png`. Installed via pipx.
- **nano-banana** — AI image generation CLI (Gemini). Usage: `nano-banana "prompt" -s 2K -m pro`. Supports `-t` for transparent, `-r` for reference images.

## Reference: Claude Cookbooks

The `claude-cookbooks-main/` folder contains the official Anthropic Claude Cookbooks (gitignored). When implementing Claude API features, AI SDK integrations, or agent patterns, always check this folder first for canonical examples and best practices before relying on training data.
