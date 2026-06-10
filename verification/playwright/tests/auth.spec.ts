import { test, expect } from "@playwright/test";

/**
 * Auth gating + open-redirect defense on the OAuth callback.
 */

test.describe("auth gating", () => {
  test("dashboard redirects to login when unauthenticated", async ({ page }) => {
    const res = await page.goto("/dashboard", { waitUntil: "domcontentloaded" });
    expect(page.url()).toContain("/login");
    expect(res?.status()).toBeLessThan(500);
  });

  test("OAuth callback rejects external next redirect", async ({ request }) => {
    // No valid code → it redirects to /login?error=auth, but crucially must
    // never bounce to an external origin even if `next` is hostile.
    const res = await request.get(
      "/auth/callback?next=https://evil.example.com",
      { maxRedirects: 0, failOnStatusCode: false }
    );
    const location = res.headers()["location"] ?? "";
    expect(location).not.toContain("evil.example.com");
  });

  test("OAuth callback rejects protocol-relative next", async ({ request }) => {
    const res = await request.get("/auth/callback?next=//evil.example.com", {
      maxRedirects: 0,
      failOnStatusCode: false,
    });
    const location = res.headers()["location"] ?? "";
    expect(location).not.toContain("evil.example.com");
  });
});
