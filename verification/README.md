# Verification suite (run locally)

This folder holds checks the cloud review agent could **not** run because it
lacked credentials (the Supabase MCP token here is read-limited, and there is
no browser). Run these on your machine to confirm the live deployment matches
the code, and to catch regressions from the security fixes.

## 1. Live Supabase checks (`supabase-checks.sql`)

Run via the Supabase SQL editor **or** the Supabase MCP (`execute_sql`) with a
credentialed token. These verify the things the code review flagged as
"can't confirm without live DB access":

- the `enforce_profile_column_protection` trigger is actually **enabled** on
  `profiles` (the privileged-column protection from migration 024),
- no rogue rows already self-granted `is_complimentary_pro = true`,
- every `SECURITY DEFINER` function has a pinned `search_path`,
- `get_public_profile` does not return PII columns,
- RLS is enabled on every public table.

Also run the Supabase advisors (security + performance):

```
# via Supabase MCP
get_advisors(type="security")
get_advisors(type="performance")
```

Fix anything they report. The "Function Search Path Mutable" and "RLS
disabled" findings are the ones that matter most.

## 2. Playwright E2E (`playwright/`)

Smoke + security tests for the flows the review touched: auth, link CRUD,
public profile XSS, the SSRF-hardened icon fetcher, analytics spoofing, and
pro-gating. See `playwright/README.md`.

```bash
cd verification/playwright
npm install
npx playwright install
# point at local dev or a preview deploy:
BASE_URL=http://localhost:3000 npx playwright test
```

## 3. Manual checklist (`MANUAL-CHECKLIST.md`)

Things that need a human (real Stripe test card, a second account, etc.).
