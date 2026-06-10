# Viopage — Security & Functionality Review

Full review of the app (auth, links, profiles, affiliate/referral, payments,
uploads, DB/RLS, API routes). Each item shows **status**:

- ✅ **Fixed** in this branch (`claude/security-functionality-review-3ok3ny`)
- 🔶 **Migration written** — committed in `supabase/migrations/`, must be applied
- 📋 **Deferred** — documented here + in `MANUAL-CHECKLIST.md`, needs your machine
  (Stripe test mode, Redis, DB access, or a judgement call)

---

## CRITICAL

### C1 — SSRF in `/api/links/fetch-icon` (redirect + DNS rebinding) ✅ Fixed
`src/app/api/links/fetch-icon/route.ts`. The host/IP allowlist validated the
initial URL but `fetch(redirect:"follow")` then chased 30x redirects to
internal targets (`169.254.169.254` cloud metadata, `127.0.0.1`, RFC1918)
without re-validation. **Fix:** `timedFetch` now follows redirects **manually**,
re-running `assertPublicHost` on every hop (max 5).
**Residual:** DNS-rebinding (TOCTOU between the validation lookup and fetch's own
resolution) is narrowed but not fully closed — see `MANUAL-CHECKLIST.md` for the
connect-time IP-pinning hardening if you want belt-and-suspenders. Test:
`verification/playwright/tests/ssrf-fetch-icon.spec.ts`.

### C2 — Stored XSS via Pix social icon in "grid" mode ✅ Fixed + 🔶 migration
`src/components/profile/social-grid.tsx`. Pix `url` is a raw payment key that
skips URL-scheme validation (migration 022). `GridIcon` rendered it in an
`<a href>`, so a Pix entry of `javascript:...` in grid mode executed script on
visitors. **Fix (3 layers):**
- `GridIcon` now renders Pix as a copy-to-clipboard `<button>` (like the other
  renderers), never an anchor.
- `social-store` rejects any dangerous scheme even for Pix (`hasDangerousScheme`).
- Migration **028** tightens the DB CHECK so Pix can't store `javascript:`/
  `data:`/`vbscript:`/`file:`.

### C3 — `is_complimentary_pro` columns added outside migration history 📋 Verify
`supabase/migrations/023` admits the Pro/commission columns were created
"outside migrations historically". There may have been a window where the
column existed **before** the protection trigger (migration 024), during which a
user could self-grant Pro. **Action (your machine, DB access):** run
`verification/supabase-checks.sql` blocks 1 & 2 — confirm the
`enforce_profile_column_protection` trigger is ENABLED and no unexpected rows
have `is_complimentary_pro = true`.

---

## HIGH

### H1 — Reserved usernames enforced only in client JS ✅ Fixed + 🔶 migration
A raw anon-key `UPDATE profiles SET username='admin'` bypassed the React-only
blocklist. **Fix:** migration **028** adds an `enforce_reserved_username`
trigger; also added missing names (`trial`, `preview`, `sitemap`, `robots`,
`manifest`, `monitoring`, `card`) to `RESERVED_USERNAMES`.

### H2 — Subscription grace period over-grants free Pro 📋 Deferred (money logic)
`src/lib/constants.ts` `GRACE_STATUSES` + webhook. On a failed renewal Stripe
has already rolled `current_period_end` to the new **unpaid** period, so
`isSubscriptionActive` grants up to ~1 month (monthly) or ~12 months (yearly) of
free Pro. **Fix (test in Stripe test mode):** track "paid through" by handling
`invoice.paid` and storing the invoice's line period, or cap `past_due`/
`cancelled` grace to a fixed window (e.g. 14 days from `stripe_updated_at`).
Full snippet in `STRIPE-REVIEW.md`.

### H3 — Referral commission booked at trial start → farmable 📋 Deferred (money logic)
`src/app/api/webhooks/stripe/route.ts` fires `processReferralConversion` on
`on_trial`. A ring of accounts referring each other and starting trials that
never pay still accrues payable commission after the 30-day hold (self-referral
to *your own* account is blocked, but cross-account rings are not).
**Fix:** record the earning on `invoice.paid` (first real payment) instead of
trial start, and also void earnings when a sub goes long-term `past_due`.
See `STRIPE-REVIEW.md`.

### H4 — In-memory rate limiter is a no-op on Vercel 📋 Deferred (needs Redis)
`src/lib/rate-limit.ts` uses a per-process `Map`; serverless instances don't
share it and recycle constantly, so analytics flooding and Replicate
cost-abuse limits are effectively bypassed (also `x-forwarded-for` is
spoofable). **Fix:** move to Upstash Redis (`@upstash/ratelimit`) or a Supabase
table with atomic upsert; derive IP from `x-vercel-forwarded-for`. Steps in
`MANUAL-CHECKLIST.md`.

### H5 — Uploads trust client-supplied MIME (no magic-byte check) 📋 Deferred
`src/app/api/upload/{avatar,hero,link-icon}` and fetch-icon rehost validate
`file.type` / upstream `content-type`, not actual bytes. Buckets are public, so
mislabeled/polyglot content can be hosted under your storage domain. (SVG is
correctly excluded everywhere, so direct SVG-XSS isn't possible.)
**Fix:** sniff magic bytes server-side (`file-type`) and set `contentType` from
the detected type. Path keys are derived from `user.id` — no traversal/overwrite
(verified OK).

---

## MEDIUM

### M1 — Stores report false success on save failure ✅ Partially fixed
`profile-store.updateProfile` now returns a success boolean; the username-change
flow in settings branches on it (a race that trips the UNIQUE constraint now
shows "username taken" instead of a false "updated"). 📋 The same pattern should
be extended to `link-store.updateLink` and `social-store.updateSocialIcon`
callers (lower visibility — listed in `MANUAL-CHECKLIST.md`).

### M2 — Theme edits lost on fast navigation ✅ Fixed
`theme-store` now exposes `flushSave()`, wired to `pagehide`/unmount in
`design-tab.tsx` (same pattern the business-card tab already used). An edit made
<500ms before leaving is no longer dropped.

### M3 — Analytics events spoofable / mis-attributed ✅ Partially fixed
`/api/analytics` now validates that `link_id` belongs to the `profile_id` (across
both `links` and `social_icons`) before insert, so events can't be attributed to
a foreign link. 📋 Full anti-spoofing (per-profile caps, signed beacon token)
deferred — depends on H4 (distributed limiter).

### M4 — `get_public_profile` uses a PII denylist 📋 Deferred (DB, careful)
Migration 025 strips payout PII via subtraction (`to_jsonb(p) - 'payout_…'`).
The real PII (payout_destination/method, commission override) IS stripped, but
the denylist leaks any *future* PII column by default, plus `referred_by`.
**Fix:** convert to an allowlist (`json_build_object(...)`). Risky to get the
column list wrong (would break the public page), so do it with DB access +
the Playwright `public-profile` test. Ready migration in `MANUAL-CHECKLIST.md`.

### M5 — Webhook idempotency / ordering is non-atomic 📋 Deferred
No `event.id` dedupe table; the ordering guard is read-then-write (1s
granularity). Replays/out-of-order events can win. **Fix:** dedupe table keyed
on `event.id`, or re-fetch the subscription from Stripe and write that
authoritative state. See `STRIPE-REVIEW.md`.

### M6 — Lifetime codes used `Math.random()` ✅ Fixed
`src/app/(admin)/admin/lifetime-codes/actions.ts` now uses
`crypto.randomInt` (CSPRNG) — these codes are bearer tokens for lifetime Pro +
boosted commission.

### M7 — Duplicate referral earnings on webhook race ✅ Fixed (migration 028)
`referral_earnings` had no unique key on `subscription_id`; the `created` +
`updated` events at checkout could both insert. Migration **028** adds a partial
unique index, making the existing check-then-insert race-safe (the losing thread
errors at insert and returns before double-crediting).

### M8 — OAuth lifetime redemption "celebrated" on failure ✅ Fixed
`auth/callback` now only redirects to the welcome screen when redemption
actually succeeded; on failure it returns to `/redeem/[code]?error=redeem_failed`.

---

## LOW

- **L1 — OAuth `next` open-redirect** ✅ Fixed: `auth/callback` now rejects
  absolute / `//`-prefixed `next` values.
- **L2 — CSP allows `'unsafe-inline'` scripts** 📋 `next.config.ts`. Weakens XSS
  defense; move to nonce/hash if feasible (GTM/Stripe make this fiddly).
- **L3 — Theme color/font values not validated** 📋 Injected into inline styles
  (set via CSSOM so no breakout; worst case an external `url()`). Add hex/rgb/
  allowlist validation at the store for cleanliness.
- **L4 — `handle_new_user` swallows errors** 📋 Could create auth users with no
  profile row; pipe failures to Sentry / add a reconciliation job.
- **L5 — Eager Stripe client init** ✅ Fixed: `src/lib/stripe.ts` is now lazy
  (Proxy), so importing it never throws and `next build` no longer crashes when
  `STRIPE_SECRET_KEY` is absent.
- **L6 — `x-locale-override` not stripped from inbound requests** 📋 `proxy.ts`
  only sets it; a client can send it directly to force locale (no privilege
  impact). Strip inbound copies.
- **L7 — Duplicate migration number `013`** 📋 Two `013_*.sql` files; renumber
  one for reproducibility.

---

## Dependency / build / lint

- ✅ **Next.js** bumped 16.2.0 → **16.2.9** (clears the High DoS + middleware/
  proxy-bypass advisories).
- ✅ **next-intl** bumped 4.8.3 → **4.13.0** (clears open-redirect + prototype-
  pollution advisories; neither affected us — custom routing, no precompile —
  but cleared anyway).
- 📋 ~10 remaining `npm audit` advisories are all transitive **build-tooling**
  deps (picomatch, hono, fast-uri, ws, ip-address, brace-expansion,
  path-to-regexp, icu-minify) with no app-runtime exposure. Resolve with a
  careful `npm audit fix` + full regression; avoid `--force`.
- ✅ Fixed real lint **bugs**: missing React `key`s in `social-icons-bar.tsx`;
  `Math.random()` during render in `upgrade-dialog.tsx` (hydration risk);
  `<a href="/earn">` → `next/link` (full-reload) in content-tab + dashboard-shell.
- 📋 ~10 lint errors remain — pre-existing React-compiler nits in
  `content-tab.tsx` (create-component-in-render at 268/424, impure at 1252/1253),
  a `language-switcher` false positive (event handler), and a `setState`-in-
  effect in `add-to-home-button.tsx`. Build passes; fix opportunistically.

---

## Verified OK (no action)

- Non-Pix link/social `href` XSS — blocked at Zod + store + DB CHECK (migration
  019); `javascript:`/`data:` rejected.
- display_name / bio / titles — rendered as React text (auto-escaped).
- JSON-LD — escaped via `safeJsonLdString`.
- Webhook signature verification, refund + dispute handling — correct.
- Checkout — price IDs are server-side only; client can't choose price/currency.
- Portal — looks up the caller's own `stripe_customer_id` (no cross-user access).
- Referral signup/payout — `user_id` from session (IDOR-safe), self-referral
  blocked, payouts claimed atomically (no double-spend).
- Storage upload keys derived from `user.id` — no path traversal / overwrite.
- Admin routes — gated by `ADMIN_EMAILS` against the verified session email.
- Cron — timing-safe `CRON_SECRET` comparison, required.
- Pro gating — enforced server-side (`requireProUser`) + public page strips Pro
  fields; client gating is UX-only (correct).
</content>
