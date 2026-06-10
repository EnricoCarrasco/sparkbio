import { test, expect } from "@playwright/test";

/**
 * Public profile rendering: no XSS via link hrefs, reserved usernames don't
 * resolve to a profile, and no PII leaks into the HTML.
 */

test.describe("public profile", () => {
  test("reserved usernames do not render a profile", async ({ page }) => {
    for (const u of ["api", "admin", "dashboard", "login", "redeem"]) {
      const res = await page.goto(`/${u}`, { waitUntil: "domcontentloaded" });
      // Either a 404 or a redirect to a real app route — never a profile page.
      // A profile page would contain the link-list container; assert it's absent
      // OR the status is not 200.
      const status = res?.status() ?? 0;
      if (status === 200) {
        const isProfile = await page
          .locator('[data-testid="public-profile"]')
          .count();
        expect(isProfile, `"${u}" rendered as a profile`).toBe(0);
      }
    }
  });

  test("no javascript:/data: hrefs in rendered links", async ({ page }) => {
    const username = process.env.TEST_USERNAME;
    test.skip(!username, "set TEST_USERNAME to a profile with links");
    await page.goto(`/${username}`, { waitUntil: "networkidle" });
    const hrefs = await page.locator("a[href]").evaluateAll((els) =>
      els.map((e) => (e as HTMLAnchorElement).getAttribute("href") ?? "")
    );
    for (const href of hrefs) {
      expect(href.trim().toLowerCase()).not.toMatch(/^javascript:/);
      expect(href.trim().toLowerCase()).not.toMatch(/^data:/);
      expect(href.trim().toLowerCase()).not.toMatch(/^vbscript:/);
    }
  });

  test("public profile HTML contains no payout/email PII", async ({ page }) => {
    const username = process.env.TEST_USERNAME;
    test.skip(!username, "set TEST_USERNAME");
    await page.goto(`/${username}`, { waitUntil: "domcontentloaded" });
    const html = (await page.content()).toLowerCase();
    // Heuristics — adjust to your test account's real payout value.
    expect(html).not.toContain("payout_destination");
    expect(html).not.toContain("commission_bps_override");
    expect(html).not.toContain("@gmail.com"); // no raw emails embedded
  });
});
