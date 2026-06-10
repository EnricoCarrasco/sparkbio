# Manual checklist — run on your machine

Things that need DB access, Stripe test mode, Redis, a second account, or a
human judgement call. Grouped by what they unblock.

## A. Confirm live DB matches the code (Supabase MCP / SQL editor)

Run `verification/supabase-checks.sql`. Critical ones:
- [ ] Block 1: `enforce_profile_column_protection` trigger is **ENABLED**.
- [ ] Block 2: no unexpected `is_complimentary_pro = true` rows (covers C3).
- [ ] Block 3: every SECURITY DEFINER function pins `search_path`.
- [ ] Block 4: RLS enabled on every public table.
- [ ] Block 6/7/8: no duplicate / negative / self-referral earnings.
- [ ] Run `get_advisors(type:"security")` and `get_advisors(type:"performance")`
      and resolve anything reported.

## B. Apply the new migration

- [ ] Apply `supabase/migrations/028_security_hardening.sql` (Pix scheme CHECK,
      reserved-username trigger, referral unique index). Apply **before/with**
      the code deploy so behavior is consistent. After applying, re-run
      `supabase-checks.sql` block 9 (no reserved usernames squatted).

## C. Run the E2E suite

- [ ] `cd verification/playwright && npm install && npx playwright install chromium`
- [ ] `BASE_URL=<dev-or-preview> npx playwright test`
- [ ] Manually confirm the Pix-grid XSS fix: add a Pix social icon, set display
      mode to "grid", view the public page — it must render a **copy button**,
      not a link, and copy the key on click.

## D. Stripe test-mode flows (see STRIPE-REVIEW.md for fixes)

- [ ] New checkout → `subscription.created` → DB row `active`/`on_trial`, Pro on.
- [ ] Failed renewal (test card `4000000000000341`) → verify the user does **not**
      keep Pro for the whole unpaid period (validates the H2 grace fix once applied).
- [ ] Cancel via portal → `subscription.deleted` → Pro off, `hide_footer` reset,
      pending referral earnings voided.
- [ ] Full refund → sub cancelled. Partial refund → access retained.
- [ ] Replay a webhook event (Stripe CLI `stripe events resend <id>`) → no double
      side-effects (validates M5 dedupe once added).
- [ ] Referral: complete a paid conversion → exactly one `referral_earnings` row;
      replay events → still one (validates M7 unique index).
- [ ] Decide on **VAT/Stripe Tax** (STRIPE-REVIEW.md #5).

## E. Deferred hardening (pick up as follow-ups)

- [ ] **H4 distributed rate limiter:** add Upstash Redis (`@upstash/ratelimit`)
      or a Supabase counter table; replace `src/lib/rate-limit.ts`'s in-memory
      Map; derive IP from `x-vercel-forwarded-for`. Apply to analytics,
      business-card generate-*, and checkout.
- [ ] **H5 upload magic-byte sniffing:** add `file-type`, detect real bytes in
      the three upload routes + fetch-icon rehost, set `contentType` from the
      detected type, reject mismatches.
- [ ] **M1 store error propagation:** extend the boolean-return pattern (done for
      `updateProfile`) to `link-store.updateLink` and
      `social-store.updateSocialIcon`, and have their callers
      (`link-form-dialog.tsx`, social editors) `toast.error` on `false`.
- [ ] **M4 get_public_profile allowlist:** replace the denylist with an explicit
      `json_build_object(...)` of only public columns. Verify with the
      `public-profile` Playwright test that the page still renders. Sketch:
      ```sql
      -- inside get_public_profile, replace the to_jsonb(p) - '...' expression
      -- with json_build_object enumerating ONLY: id, username, display_name,
      -- bio, avatar_url, hero_image_url, business_card_settings (if public),
      -- has_chosen_username, and the theme/links/socials joins. Do NOT include
      -- referred_by, referral_code, payout_*, commission_*, is_complimentary_pro
      -- (except as a derived boolean if the public page needs "is pro").
      ```
- [ ] **H2 / H3 / M5 Stripe money logic:** implement per STRIPE-REVIEW.md and
      test in Stripe test mode before deploying.
- [ ] **C1 residual DNS-rebinding:** if you want full SSRF closure, resolve the
      host yourself, pin the validated IP, and connect to that IP with the
      original Host header (or use an http agent `lookup` callback that
      re-checks each resolved address at connect time).
- [ ] **L6:** strip inbound `x-locale-override` in `proxy.ts`.
- [ ] **L7:** renumber one of the duplicate `013_*.sql` migrations.
- [ ] **Remaining lint:** the ~10 React-compiler errors in `content-tab.tsx`,
      `language-switcher.tsx`, `add-to-home-button.tsx` (build passes; fix when
      touching those files).
- [ ] **npm audit:** run a careful `npm audit fix` (no `--force`) for the
      transitive build-tooling advisories + full regression.
