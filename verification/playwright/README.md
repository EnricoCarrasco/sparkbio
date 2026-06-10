# Playwright verification

E2E + security regression tests covering the flows touched by the security
review. Run against local dev or a preview deploy — **never production**
(some tests create data).

## Setup

```bash
cd verification/playwright
npm install
npx playwright install chromium
```

## Env

| var | purpose |
|-----|---------|
| `BASE_URL` | app under test (default `http://localhost:3000`) |
| `TEST_EMAIL` / `TEST_PASSWORD` | a throwaway account for auth-gated tests |
| `TEST_USERNAME` | that account's public username (for profile tests) |

## Run

```bash
BASE_URL=http://localhost:3000 \
TEST_EMAIL=qa@example.com TEST_PASSWORD=... TEST_USERNAME=qauser \
npx playwright test
```

## What's covered

- `public-profile.spec.ts` — public page renders, no `javascript:`/`data:` link
  hrefs leak through (XSS), reserved usernames 404, PII not present in HTML/JSON.
- `ssrf-fetch-icon.spec.ts` — `/api/links/fetch-icon` rejects internal/loopback
  targets and redirect-to-internal (the Critical SSRF fix).
- `analytics-spoof.spec.ts` — analytics endpoint validates profile/link and is
  rate-limited; can't inflate arbitrary profiles.
- `auth.spec.ts` — login/redirect gating, OAuth `next` open-redirect is blocked.
- `links-crud.spec.ts` — (auth) add/edit/reorder/delete links persist correctly.
- `pro-gating.spec.ts` — (auth, free account) pro-only fields are stripped on
  the public page even if forced into the DB.

Tests skip themselves with a clear message if their required env vars are
missing, so the SSRF/analytics/public tests run with just `BASE_URL`.
