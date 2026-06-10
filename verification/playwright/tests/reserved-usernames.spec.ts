import { test, expect } from "@playwright/test";

/**
 * Reserved usernames must not resolve to a public profile. After migration 028
 * they're also blocked at the DB layer (can't be squatted via the anon key).
 * This test only checks the public-facing behavior; the DB guard is verified by
 * supabase-checks.sql block 9.
 */

const RESERVED = [
  "admin",
  "api",
  "dashboard",
  "login",
  "register",
  "redeem",
  "earn",
  "trial",
  "preview",
  "settings",
  "blog",
];

test.describe("reserved usernames", () => {
  for (const name of RESERVED) {
    test(`/${name} is not a public profile`, async ({ page }) => {
      const res = await page.goto(`/${name}`, { waitUntil: "domcontentloaded" });
      const status = res?.status() ?? 0;
      if (status === 200) {
        const isProfile = await page
          .locator('[data-testid="public-profile"]')
          .count();
        expect(isProfile, `/${name} rendered as a profile page`).toBe(0);
      } else {
        expect(status).toBeGreaterThanOrEqual(300);
      }
    });
  }
});
