# Earn with Viopage — Referral/Affiliate System Design Spec

## Context

Viopage users have a footer CTA on their public profiles linking to viopage.com. Currently this generates zero value for users. This feature turns every Viopage user into a referral partner: when visitors click their footer link (or a shareable referral link) and eventually subscribe to Pro, the referrer earns a 20% one-time commission paid via PayPal or Pix.

**Branch:** `feature/earn-with-viopage` (new branch off main)

---

## Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Architecture | Custom-built (not LemonSqueezy affiliates) | LS requires manual vetting, external portal, no auto-enroll API |
| Commission | 20% one-time | Simple accounting, lower long-term cost |
| Hold period | 30 days | Industry standard, covers chargebacks/refunds |
| Payout method | PayPal + Pix | International + Brazilian coverage |
| Minimum payout | $10 | Standard threshold |
| Eligibility | All users (free + Pro) | Maximizes growth; free users already show footer |
| Attribution | First-touch, 30-day cookie | Server-set HTTP-only cookie for Safari ITP compliance |
| Referral link format | `viopage.com/?ref=username` | Simple query param, works with existing marketing pages |

---

## Database Schema (Migration 009)

### 1. New columns on `profiles`

```sql
ALTER TABLE profiles ADD COLUMN referral_code TEXT UNIQUE;
ALTER TABLE profiles ADD COLUMN referred_by UUID REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE profiles ADD CONSTRAINT no_self_referral CHECK (referred_by != id);

-- Backfill existing users
UPDATE profiles SET referral_code = username WHERE referral_code IS NULL;
```

Update `handle_new_user()` trigger to set `referral_code = v_candidate` on insert.

Add immutability trigger:
```sql
CREATE OR REPLACE FUNCTION public.prevent_referred_by_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.referred_by IS NOT NULL AND NEW.referred_by IS DISTINCT FROM OLD.referred_by THEN
    RAISE EXCEPTION 'referred_by is immutable once set';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_profiles_referred_by_immutable
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_referred_by_change();
```

### 2. `referral_events` table

Tracks the funnel: click -> signup -> conversion.

```sql
CREATE TABLE referral_events (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id   UUID REFERENCES profiles(id) ON DELETE SET NULL,
  event_type    TEXT NOT NULL CHECK (event_type IN ('click', 'signup', 'conversion')),
  referral_code TEXT NOT NULL,
  ip_hash       TEXT,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_referral_events_referrer_created
  ON referral_events(referrer_id, created_at DESC);
CREATE INDEX idx_referral_events_dedup
  ON referral_events(referral_code, ip_hash, created_at DESC)
  WHERE event_type = 'click';
```

**RLS:** service_role insert. Owner read (`auth.uid() = referrer_id`).

### 3. `referral_earnings` table

One row per conversion. Tracks commission lifecycle.

```sql
CREATE TABLE referral_earnings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  amount_cents    INTEGER NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'available', 'paid', 'cancelled')),
  hold_until      TIMESTAMPTZ NOT NULL,
  payout_id       UUID REFERENCES referral_payouts(id) ON DELETE SET NULL,
  paid_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_referral_earnings_referrer ON referral_earnings(referrer_id, status);
CREATE INDEX idx_referral_earnings_hold ON referral_earnings(hold_until) WHERE status = 'pending';
CREATE INDEX idx_referral_earnings_payout ON referral_earnings(payout_id) WHERE payout_id IS NOT NULL;
```

**RLS:** service_role insert/update. Owner read (`auth.uid() = referrer_id`).

Trigger: `update_updated_at_column()` (reuse existing function).

### 4. `referral_payouts` table (created BEFORE `referral_earnings` in migration since earnings has FK to payouts)

Groups earnings into payout batches.

```sql
CREATE TABLE referral_payouts (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount_cents      INTEGER NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'USD',
  payout_method     TEXT NOT NULL CHECK (payout_method IN ('paypal', 'pix')),
  payout_destination TEXT,
  status            TEXT NOT NULL DEFAULT 'requested'
                      CHECK (status IN ('requested', 'processing', 'completed', 'failed')),
  admin_notes       TEXT,
  processed_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_referral_payouts_status
  ON referral_payouts(status, created_at DESC)
  WHERE status IN ('requested', 'processing');
```

**RLS:** service_role insert/update. Owner read (`auth.uid() = referrer_id`).

---

## Referral Tracking Flow

### Step 1: Click

**Source A — Footer CTA:** `profile-page.tsx` footer href becomes `viopage.com/?ref={referral_code}`. `onClick` fires `sendBeacon('/api/referral/click', { referral_code })`.

**Source B — Shareable link:** Users copy `viopage.com/?ref=username` from the Earn tab dashboard.

### Step 2: Landing page capture

New `<ReferralCapture />` client component in `(marketing)/layout.tsx`:
1. Reads `?ref=` from URL params
2. Calls `POST /api/referral/capture` with the ref code — this endpoint validates the code exists and sets the `viopage_ref` HTTP-only cookie (30-day max-age, SameSite=Lax, Path=/) via `Set-Cookie` response header
3. Also stores in localStorage as fallback for client-side reads
4. First-touch: does NOT overwrite existing cookie < 30 days old

**New route:** `/api/referral/capture` — validates ref code, sets HTTP-only cookie server-side. Returns `{ ok: true }`.

### Step 3: Signup attribution

**Email/password** (`register/page.tsx`): After successful signup, reads `viopage_ref` cookie, calls `POST /api/referral/signup { referral_code, user_id }`.

**Google OAuth** (`google-oauth-button.tsx`): Passes ref code in OAuth `redirectTo` URL as `?ref=CODE`.

**OAuth callback** (`auth/callback/route.ts`): Reads `ref` from searchParams + cookie. Sets `profiles.referred_by`, inserts signup event.

### Step 4: Conversion

**LemonSqueezy webhook** (`webhooks/lemonsqueezy/route.ts`):
- On `status = active|on_trial`: check `profiles.referred_by`. If set, calculate 20% of payment, create `referral_earnings` row (status: pending, hold_until: now + 30 days). Insert conversion event.
- On `status = cancelled|expired` within hold: set pending earnings to cancelled.

Extracted to helper: `src/lib/referral.ts` → `processReferralConversion()`, `cancelPendingReferralEarnings()`.

### Step 5: Hold promotion

**Vercel Cron** (`/api/cron/referral-hold`, daily at midnight UTC):
```sql
UPDATE referral_earnings SET status = 'available', updated_at = now()
WHERE status = 'pending' AND hold_until <= now();
```

### Step 6: Payout

User requests payout from Earn tab (min $10). Admin reviews + manually sends via PayPal/Pix. Updates status to completed.

---

## Commission Calculation

| Plan | Price | Commission (20%) |
|------|-------|-------------------|
| Monthly | $9/mo | $1.80 one-time |
| Yearly | $84/yr | $16.80 one-time |

Commission is calculated on the first payment only (one-time, not recurring).

Constants in `src/lib/constants.ts`:
```typescript
export const REFERRAL_COMMISSION_PERCENT = 20;
export const REFERRAL_HOLD_DAYS = 30;
export const REFERRAL_MIN_PAYOUT_CENTS = 1000; // $10
```

---

## Dashboard UI — Standalone Earn Page

### Architecture: Separate Route Group (NOT a sub-tab)

The Earn dashboard is a **standalone page** at `/earn` with its own route group `(earn)/` and layout — NOT a sub-tab inside ContentTab.

**Desktop:** Own left sidebar with: Dashboard (overview), Earnings, (back to) My Links, Settings, Help
**Mobile:** Bottom navigation: Links, Analytics, Earnings, Settings

Stitch designs approved:
- Desktop: `screens/9c9e6a7f56f14db986a5b6477e359a78`
- Mobile: `screens/c3862db3ff9745e2aabb564e65be65c4`

### Route structure

```
src/app/(earn)/
├── layout.tsx    — own sidebar + mobile bottom nav (no phone preview)
└── earn/
    └── page.tsx  — main earn dashboard
```

### Component hierarchy

```
src/components/earn/
├── earn-sidebar.tsx          — Desktop left sidebar navigation
├── earn-mobile-nav.tsx       — Mobile bottom navigation
├── earn-overview-cards.tsx   — 4 stat cards (2x2 grid)
├── referral-link-section.tsx — Copyable referral URL
├── conversion-funnel.tsx     — Clicks → Signups → Conversions
├── payout-request-dialog.tsx — PayPal/Pix selection dialog
└── payout-history-table.tsx  — Table of past payouts
```

### Sections (top to bottom):

1. **Referral Link** — `viopage.com/?ref=username` with copy button + toast
2. **Earnings Overview** — 4 cards: Total Earned (green), Pending (orange), Available (blue), Paid Out (gray)
3. **Conversion Funnel** — 3-step: Clicks → Signups → Pro Conversions with conversion rates
4. **Request Payout** — Orange gradient button (enabled when available >= $10)
5. **Payout History** — Table: Date, Amount, Method, Status (badge)

### Navigation from main dashboard
- Add "Earn" icon to existing dashboard sidebar (`sidebar.tsx`) linking to `/earn`

### Zustand store

New `src/lib/stores/referral-store.ts`:

```typescript
interface ReferralStats {
  totalEarnedCents: number;
  pendingCents: number;
  availableCents: number;
  paidOutCents: number;
  clickCount: number;
  signupCount: number;
  conversionCount: number;
  nearestHoldDate: string | null;
}

interface ReferralState {
  stats: ReferralStats | null;
  payouts: ReferralPayout[];
  referralCode: string | null;
  loading: boolean;
  fetchReferralData: () => Promise<void>;
  requestPayout: (method: string, destination: string) => Promise<boolean>;
}
```

---

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/referral/click` | POST | Track footer/link clicks (sendBeacon, deduped by IP hash per 24h) |
| `/api/referral/capture` | POST | Validate ref code + set HTTP-only cookie (called by ReferralCapture) |
| `/api/referral/signup` | POST | Attribute referral on registration (idempotent) |
| `/api/referral/stats` | GET | Fetch earnings, funnel counts, payouts (authenticated) |
| `/api/referral/payout` | POST | Request payout (authenticated, min $10) |
| `/api/cron/referral-hold` | GET | Daily: promote pending → available (CRON_SECRET protected) |

All insert/update operations use `createAdminClient()` (service_role). Rate limiting follows existing `/api/analytics` pattern.

---

## Integration Points (Files Modified)

| File | Change |
|------|--------|
| `src/components/profile/profile-page.tsx` | Footer href → `?ref={referral_code}` + sendBeacon click |
| `src/app/(marketing)/layout.tsx` | Add `<ReferralCapture />` component |
| `src/app/(auth)/register/page.tsx` | Read ref cookie, call `/api/referral/signup` |
| `src/components/auth/google-oauth-button.tsx` | Pass ref code through OAuth redirect |
| `src/app/(auth)/auth/callback/route.ts` | Attribute referral after OAuth signup |
| `src/app/api/webhooks/lemonsqueezy/route.ts` | Conversion + cancellation tracking |
| `src/lib/stores/dashboard-store.ts` | Add `ContentSubTab` type + state |
| `src/components/dashboard/content-tab.tsx` | Sub-tab UI, render `<EarnTab />` |
| `src/types/database.ts` | Add `referral_code`, `referred_by` to Profile type |
| `src/lib/constants.ts` | Referral commission constants |
| `src/messages/en.json` | `"referral"` namespace |
| `src/messages/pt-BR.json` | `"referral"` namespace (Portuguese) |

## New Files (12)

| File | Purpose |
|------|---------|
| `supabase/migrations/009_referral_system.sql` | Full migration |
| `src/lib/referral.ts` | Helper functions |
| `src/lib/stores/referral-store.ts` | Zustand store |
| `src/app/api/referral/click/route.ts` | Click tracking |
| `src/app/api/referral/capture/route.ts` | Cookie capture |
| `src/app/api/referral/signup/route.ts` | Signup attribution |
| `src/app/api/referral/stats/route.ts` | Stats aggregation |
| `src/app/api/referral/payout/route.ts` | Payout request |
| `src/app/api/cron/referral-hold/route.ts` | Daily cron |
| `src/components/marketing/referral-capture.tsx` | Cookie capture |
| `src/components/dashboard/earn/earn-tab.tsx` | Main earn component |
| `src/components/dashboard/earn/*.tsx` | Sub-components (5 files) |

## New Environment Variables

```
CRON_SECRET  — For Vercel cron job authentication
```

---

## Fraud Prevention

1. **Self-referral:** DB constraint `CHECK (referred_by != id)` + server-side user ID comparison
2. **Click inflation:** IP hash + referral_code dedup per 24 hours
3. **Cookie manipulation:** Server-set HTTP-only cookie (not JS-accessible)
4. **referred_by tampering:** Immutability trigger prevents changes after initial set
5. **Duplicate conversions:** Idempotency check on `subscription_id` before inserting earnings
6. **Refund abuse:** 30-day hold; cancellation within hold voids commission

---

## i18n

New `"referral"` namespace in both message files. Key strings:
- Tab label: "Earn with Viopage" / "Ganhe com Viopage"
- Copy link, share note, stat labels, payout labels, status badges
- Empty states

---

## Verification

1. **Migration:** Apply 009 via Supabase CLI, verify tables + indexes + RLS
2. **Referral capture:** Visit `/?ref=testcode`, verify cookie is set (30-day, HTTP-only)
3. **Signup attribution:** Register new account with ref cookie, verify `referred_by` is set
4. **OAuth flow:** Sign up via Google with `?ref=` in redirect, verify attribution
5. **Conversion:** Trigger test webhook, verify `referral_earnings` row created
6. **Hold promotion:** Manually set `hold_until` to past, run cron, verify status change
7. **Dashboard:** Navigate to Earn tab, verify stats render correctly
8. **Payout:** Request payout, verify `referral_payouts` row + earnings status update
9. **Self-referral:** Attempt self-referral, verify rejection
10. **Click dedup:** Send duplicate clicks, verify only 1 recorded per 24h window
