# Admin Dashboard — Design Spec

## Context

Viopage needs an admin dashboard to monitor the referral program, review payout requests, detect fraud, and see platform KPIs. Access is restricted to team members via email whitelist.

## Decisions

| Decision | Choice |
|----------|--------|
| Location | `/admin` route group in the same app |
| Auth | `ADMIN_EMAILS` env var (comma-separated) |
| Pages | 3: Overview, Payouts, Referrals |
| Theme | Light — matches Viopage (#FAFAFA bg, white sidebar, #FF6B35 orange) |
| First admin | enricocarrasconetwork@gmail.com |

## Design Reference

Stitch screen: `projects/12376984642385734193/screens/104dac7dc0454499bd8a9412a3cbc962`
Layout: same structure but with Viopage light theme colors instead of dark sidebar.

## Route Structure

```
src/app/(admin)/
├── layout.tsx         — sidebar + admin auth check
├── admin/
│   └── page.tsx       — overview dashboard
├── admin/payouts/
│   └── page.tsx       — payout review
└── admin/referrals/
    └── page.tsx       — referral monitoring
```

## Admin Auth

- Env var: `ADMIN_EMAILS=enricocarrasconetwork@gmail.com`
- Check: logged-in user's email against the list
- Non-admins redirected to `/dashboard`
- Uses `createClient()` server-side to get user, then checks email

## Page 1: `/admin` — Overview

**KPI Cards (4):**
- Total Users (count from profiles)
- Pro Subscribers (count from subscriptions where status in active/on_trial)
- Monthly Revenue (Pro subscribers x plan price)
- Pending Payouts (sum of requested payouts + count)

**Referral Program Health:**
- Commission liability (sum of pending + available earnings)
- Active referrers (distinct referrer_ids in earnings)
- Conversion rate (conversions / signups)
- Avg earnings per referrer

**Recent Activity Feed:**
- Latest referral events + payout requests, 5 items

**Top Referrers Table:**
- User, Clicks, Signups, Conversions, Earnings — top 5

## Page 2: `/admin/payouts` — Payout Review

**Tabs:** Pending | Processing | Completed | Rejected

**Per payout request:**
- Referrer username, amount, method, destination (masked)
- Verification checks: subscription active, different IPs, user has content
- Actions: Approve, Reject (with reason), Mark as Paid

**Payout History:** Table with all past payouts

## Page 3: `/admin/referrals` — Monitoring

**Funnel:** Total clicks → signups → conversions
**Fraud Alerts:** Same-IP referrals, velocity spikes
**Top Referrers Leaderboard:** Full table
**Earnings Timeline:** Monthly commission chart (Recharts)

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/admin/stats` | GET | KPI data for overview |
| `/api/admin/payouts` | GET | List payouts with filters |
| `/api/admin/payouts/[id]` | PATCH | Update payout status (approve/reject/complete) |
| `/api/admin/referrals` | GET | Referral monitoring data |

All admin API routes check `ADMIN_EMAILS` before processing.

## New Files

- `src/app/(admin)/layout.tsx` — admin layout with light sidebar
- `src/app/(admin)/admin/page.tsx` — overview
- `src/app/(admin)/admin/payouts/page.tsx` — payout review
- `src/app/(admin)/admin/referrals/page.tsx` — monitoring
- `src/app/api/admin/stats/route.ts`
- `src/app/api/admin/payouts/route.ts`
- `src/app/api/admin/payouts/[id]/route.ts`
- `src/app/api/admin/referrals/route.ts`
- `src/lib/admin.ts` — admin auth helper

## New Env Var

```
ADMIN_EMAILS=enricocarrasconetwork@gmail.com
```

## Security Fixes (bundled)

Also fixing the critical security issues from the audit:
- CRIT-1: Authenticate `/api/referral/signup` endpoint
- CRIT-2: Atomic payout via Supabase RPC (prevent double-spend)
- HIGH-4: Cancel both `pending` AND `available` earnings on refund
- MED-3: Only create commission on `active` status (not `on_trial`)
