# Design: `/test` — Pre-Ship Verification Skill

## Context

Every session where we ship a feature ends the same way: "is this actually
going to work when the user hits it?" Our recent grace-period work proved
out a specific methodology — matrix-first planning, DB-state simulation via
MCP, tiered verification (curl → DB → Playwright), unique-marker grep —
that catches bugs faster than traditional unit tests and without any test
framework setup.

This design turns that methodology into a single command: **`/test`**.
Typing `/test` at any point reads what you just built, plans the
verification matrix, runs it end-to-end, and reports pass/fail with
evidence. No test files written, no CI setup, no ongoing maintenance — pure
pre-ship verification.

Closest existing skills (`vercel:verification`,
`superpowers:verification-before-completion`) cover adjacent concerns
(single-flow data-path tracing; discipline around evidence-before-claims)
but neither codifies the matrix + tiered-verification + DB-MCP
methodology. `/test` fills that gap.

---

## Goals

1. **Fast**: a full matrix run on a typical feature completes in under 3
   minutes. Stream results as each cell completes.
2. **Low-setup**: no test framework, no config files, no CI integration
   required. The skill works against a running dev server + MCP-reachable
   DB.
3. **Evidence-first**: every pass/fail claim is backed by a command output
   quote. No "should work" — only "did work, output was X".
4. **Safe**: refuses to run against production. Auto-detects target
   environment from the URL and bails if the hostname looks live.
5. **Deterministic**: resets state between scenarios. Same run, same input
   → same output.

## Non-goals (v1)

- Writing persistent test files for CI — a separate `/test-suite` skill can
  layer on later if/when the project adopts Vitest or Playwright Test.
- Unit testing (pure functions). Those are fine to add later, but not the
  `/test` problem. This skill is about user-facing behavior end-to-end.
- Load / stress / perf testing — out of scope.
- Auto-applying fixes when a cell fails. The skill *proposes* fixes with
  evidence; the user approves or declines.

---

## How `/test` runs (flow)

```
1. READ CHANGES
   git diff main...HEAD (fallback: uncommitted diff if on main)
   Group changes by touched area (route, store, component, migration, etc.)

2. INFER MATRIX
   For each touched area, enumerate the state space that matters:
   - Subscription statuses × (future / past end dates)
   - Auth states (logged in / out / other user)
   - Role / tier (free / Pro / owner / admin)
   - Feature flags / boolean columns (hide_footer, is_active, etc.)
   - Locale (EN / PT-BR) when i18n strings changed
   Print the matrix to the user BEFORE running. They can say "skip row 3"
   or "add scenario for X" before execution starts.

3. PICK VERIFICATION TIER PER SCENARIO
   Tier 1 (curl + grep): server-rendered HTML, meta tags, redirects
   Tier 2 (MCP DB query): verify writes landed, verify RPC output
   Tier 3 (Playwright): client-side UI, auth-gated pages, modals,
          interactions, mobile viewport, CSS reveals
   Each scenario auto-tiers to its lowest sufficient tier.

4. SANITY CHECK (happy path first, fail-fast)
   Run the baseline scenario ("should just work") before edge cases.
   If baseline fails: STOP. Report. Ask for fix approval.
   No point testing lapse behavior if the page doesn't render.

5. BLAST THROUGH EDGE CASES (streaming)
   Run remaining scenarios in parallel where safe (read-only curls),
   serial where state mutations conflict. Stream each result:
     [✓] 1/11 active paid, 12d left
     [✓] 2/11 on_trial, 5d left
     [✗] 3/11 cancelled mid-trial, 5d left  ← fail, see details below
   User can Ctrl-C to abort.

6. RETRY FLAKES ONCE
   If a scenario fails but another scenario with similar setup passed,
   retry once before reporting. Filters transient hiccups.

7. REPORT
   Matrix table (pass/fail per cell), grouped failure clusters,
   evidence quotes, proposed fixes (inline diffs).
   Summary line: "10/11 pass — 1 failure in lapse handling".

8. ON FAILURE: PROPOSE FIX, DON'T AUTO-APPLY
   For each failure cluster, infer likely root cause from the diff and
   the evidence. Show a proposed patch as an inline diff. Wait for user
   approval before editing.
```

---

## Safety gates (hard requirements)

The skill MUST refuse to run when:

- `NEXT_PUBLIC_SITE_URL` resolves to a production-looking hostname
  (`viopage.com`, `*.viopage.com`) AND no explicit override flag given.
- The target DB points at a production project and `DANGEROUSLY_TEST_PROD`
  isn't set in the env.
- No dev server is responding on the expected port (prompt to start one).
- Uncommitted changes exist AND the user is running against a shared
  preview/staging environment (only local should see uncommitted state).

Refusal output: a clear message explaining which gate fired and how to
override, never silent bailout.

---

## Matrix inference (heuristics)

Mapping from touched areas to matrix dimensions. These are starting points
— the skill prints the matrix and invites edits before running.

| Touched area | Matrix dimensions added |
|---|---|
| `subscriptions` table / `isSubscriptionActive` | status × (period end in past / future), all 6 statuses |
| Auth / session / middleware | logged in / logged out / wrong user |
| RLS policy change | owner / non-owner / anonymous |
| Theme / design panel | free user / Pro user / grace user |
| i18n messages file | EN render + PT-BR render for the affected keys |
| New migration | pre-migration state / post-migration state |
| Webhook route | signature valid / invalid / missing |
| Route handler with `searchParams` | each param value + absent |
| Route handler with `cookies()` | authenticated / unauthenticated |
| UI component with conditional render | each branch of the condition |
| Feature flag addition | flag on / off |

The skill reads the actual diff to see which of these apply. For complex
diffs, groups related matrices so the user doesn't get a 200-row table.

---

## Reporting format

Terminal output structured in four blocks:

```
# /test report — feature/pro-preview-unlock

## Baseline sanity ✓
Happy path: free user, no Pro features, public profile renders.
  Tier 1 curl → ✓ (matches free fallback palette)

## Matrix (streamed)
| # | Scenario                          | Tier | Result |
|---|-----------------------------------|------|--------|
| 1 | on_trial, 5d left                 | 1    | ✓      |
| 2 | cancelled mid-trial, 5d grace     | 1    | ✓      |
| 3 | cancelled, trial expired          | 1    | ✓      |
| 4 | past_due, retry window active     | 1    | ✓      |
| 5 | paused (future end)               | 1    | ✓      |
| 6 | dashboard banner on lapse         | 3    | ✓      |
| 7 | Restore button preserves snapshot | 2+3  | ✗ FAIL |

## Failures (1)
### Cell #7 — Restore button preserves snapshot
Expected: theme bg_color = snapshot bg_color (#FFEB3B)
Observed: theme bg_color = #FAFAFA (Viopage Default)
Evidence: DB query result after restore, see logs/test-run-09-12.json
Likely cause: `restorePreProSnapshot` spread order — the PRO_FIELDS_RESET
  override is running AFTER the snapshot spread, zeroing the colors.
Proposed fix:
```diff
- ...theme.pre_pro_snapshot,
- ...PRO_FIELDS_RESET,
+ ...PRO_FIELDS_RESET,
+ ...theme.pre_pro_snapshot,
```
Apply this fix? [y/N]

## Summary
10/11 pass (91%). 1 failure in restore flow.
```

---

## File structure

```
~/.claude/skills/test/
  SKILL.md           # trigger config + the matrix-verification methodology
  templates/
    matrix-auth.md           # reusable matrix for auth-touched changes
    matrix-subscription.md   # reusable matrix for subscription-touched changes
    matrix-theme.md          # reusable matrix for theme-touched changes
  examples/
    grace-period-run.md      # verbatim transcript of our grace-period test
```

The `templates/` directory holds base matrices for recurring feature types.
The skill picks the relevant templates based on the diff and Claude
augments them with scenario-specific cases.

---

## Integration with existing skills

- `superpowers:verification-before-completion` stays in force — `/test`
  *satisfies* its "evidence before claims" rule. Before `/test`, claims
  about work being complete are forbidden. After `/test` passes, the
  report IS the evidence.
- `vercel:verification` covers deployed-Vercel specifics (logs, drains,
  env vars). `/test` stays local-first; if the user runs `/test` against a
  preview URL, it delegates runtime-log checks to `vercel:verification`
  via the `chainTo` mechanism.
- `superpowers:systematic-debugging` fires when a matrix cell fails with
  an unexpected error (not just wrong output) — hands off to systematic
  debugging for root-cause analysis.

---

## Triggering

Primary: user types `/test` as a slash command in Claude Code.

Implicit trigger phrases the skill also listens for:
- "test everything", "test it all", "run all the tests"
- "before we merge", "before we ship", "before going live"
- "is this actually working", "verify this works"

Skip conditions (won't auto-fire):
- No diff vs main (nothing to test)
- Only docs/markdown changes (doc edits don't need matrix testing)
- Current branch is main with no uncommitted changes

---

## Example: the grace-period run we just did, re-done via `/test`

```
> /test

Reading diff vs main... 47 files changed, mostly src/lib/constants.ts
(isSubscriptionActive), src/lib/stores/subscription-store.ts, subscription
RPC, PublicSubscription type, and the [username]/page.tsx server filter.

Inferred matrix:
  Subscription statuses (6) × period end position (2) = 12 scenarios
  + Dashboard banner rendering (3 scenarios for PT-BR locale since
    messages/pt-BR.json changed)
  + RPC grace inclusion (1 scenario)
  Total: 16 cells. Baseline: "no subscription, free profile render".

Run? [y/N/edit]: y

Baseline sanity ✓ (120ms)
  [✓]  1/16  active paid, 12d left in cycle                        (curl)
  [✓]  2/16  on_trial, 5d left                                     (curl)
  [✓]  3/16  cancelled mid-trial, 5d grace                         (curl)
  [✓]  4/16  cancelled mid-trial, trial expired                    (curl)
  [✓]  5/16  paid cancelled, 10d paid time left                    (curl)
  [✓]  6/16  paid cancelled, cycle ended                           (curl)
  [✓]  7/16  past_due, 3d retry window                             (curl)
  [✓]  8/16  past_due, retry exhausted                             (curl)
  [✓]  9/16  paused (even w/ future date)                          (curl)
  [✓] 10/16  expired (even w/ future date)                         (curl)
  [✓] 11/16  no subscription                                       (curl)
  [✓] 12/16  dashboard banner shows "Sua assinatura Pro encerrou"  (playwright, PT-BR)
  [✓] 13/16  dashboard banner NOT shown for grace-period cancel    (playwright)
  [✓] 14/16  dashboard toggle visible for lapsed with Pro fields   (playwright)
  [✓] 15/16  RPC returns cancelled/past_due subs                   (MCP DB)
  [✓] 16/16  PublicSubscription type includes trial_ends_at        (static)

16/16 pass. Safe to merge.
```

---

## Verification (of the skill itself)

Before shipping the skill:

1. Run `/test` against the current `feature/pro-preview-unlock` branch —
   verify it would have caught the bugs we hit during development (OAuth
   redirect hardcode, premium theme color leak, restore-button-hidden-
   when-no-snapshot).
2. Run `/test` against a clean main branch — verify skip condition
   ("nothing to test") fires.
3. Run `/test` against a branch with only docs changes — verify skip
   condition fires.
4. Run `/test` against a branch with a deliberate bug — verify failure
   reporting + fix proposal format.
5. Run `/test` pointing at `https://viopage.com` — verify production gate
   refuses to run.

---

## Out of scope (explicit)

- CI integration
- Test-file generation (Vitest, Playwright Test, etc.)
- Visual regression (screenshot diffing)
- Perf / load testing
- Mutation testing / coverage reports
- Multi-user concurrency testing
- Mocking / stubbing (the skill flips real DB state via MCP instead)
