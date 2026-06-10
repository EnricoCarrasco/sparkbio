import { test, expect } from "@playwright/test";

/**
 * The /api/links/fetch-icon endpoint takes a user-supplied URL. The Critical
 * finding: SSRF via redirect-following + DNS rebinding to internal targets
 * (cloud metadata 169.254.169.254, loopback, RFC1918). These tests assert the
 * server refuses to fetch internal targets.
 *
 * Note: this endpoint may require auth. If it returns 401, the test passes the
 * "not reachable unauthenticated" assertion; run authenticated for full cover.
 */

const INTERNAL_TARGETS = [
  "http://169.254.169.254/latest/meta-data/",
  "http://127.0.0.1/",
  "http://localhost/",
  "http://0.0.0.0/",
  "http://10.0.0.1/",
  "http://192.168.0.1/",
  "http://[::1]/",
  "http://metadata.google.internal/",
];

test.describe("fetch-icon SSRF guard", () => {
  for (const target of INTERNAL_TARGETS) {
    test(`rejects internal target ${target}`, async ({ request }) => {
      const res = await request.post("/api/links/fetch-icon", {
        data: { url: target },
        failOnStatusCode: false,
      });
      // Must NOT 200 with fetched internal content.
      expect(
        res.status(),
        `expected rejection for ${target}, got ${res.status()}`
      ).not.toBe(200);
      expect([400, 401, 403, 422]).toContain(res.status());
    });
  }

  test("rejects non-http schemes", async ({ request }) => {
    for (const url of ["file:///etc/passwd", "gopher://127.0.0.1", "ftp://x"]) {
      const res = await request.post("/api/links/fetch-icon", {
        data: { url },
        failOnStatusCode: false,
      });
      expect(res.status(), url).not.toBe(200);
    }
  });

  // Redirect-to-internal: requires a public host you control that 302s to an
  // internal IP. Wire EXTERNAL_REDIRECTOR to enable. Skipped otherwise.
  test("rejects redirect to internal", async ({ request }) => {
    const redirector = process.env.EXTERNAL_REDIRECTOR;
    test.skip(!redirector, "set EXTERNAL_REDIRECTOR=https://your-302-to-169.254");
    const res = await request.post("/api/links/fetch-icon", {
      data: { url: redirector },
      failOnStatusCode: false,
    });
    expect(res.status()).not.toBe(200);
  });
});
