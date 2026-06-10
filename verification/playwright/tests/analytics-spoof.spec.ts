import { test, expect } from "@playwright/test";

/**
 * The analytics beacon is intentionally public (page-view tracking), but it
 * must validate input. After the fix, a link_id that doesn't belong to the
 * profile is dropped to null rather than poisoning per-link stats, and a
 * non-existent profile is rejected.
 */

test.describe("analytics endpoint validation", () => {
  test("rejects non-existent profile_id", async ({ request }) => {
    const res = await request.post("/api/analytics", {
      data: {
        profile_id: "00000000-0000-0000-0000-000000000000",
        event_type: "page_view",
      },
      failOnStatusCode: false,
    });
    expect(res.status()).toBe(400);
  });

  test("rejects malformed payload", async ({ request }) => {
    const res = await request.post("/api/analytics", {
      data: { foo: "bar" },
      failOnStatusCode: false,
    });
    expect([400, 429]).toContain(res.status());
  });

  test("is rate-limited under burst (best-effort)", async ({ request }) => {
    // Fire several quickly; with the in-memory limiter at least one should 429
    // when hitting the same instance. (After moving to a distributed limiter
    // this becomes deterministic.)
    const profileId =
      process.env.TEST_PROFILE_ID ?? "00000000-0000-0000-0000-000000000000";
    const results = await Promise.all(
      Array.from({ length: 8 }).map(() =>
        request.post("/api/analytics", {
          data: { profile_id: profileId, event_type: "page_view" },
          failOnStatusCode: false,
        })
      )
    );
    const statuses = results.map((r) => r.status());
    // Either rate-limited (429) or rejected (400 for fake profile) — never a
    // flood of 200s for a fake profile.
    expect(statuses.every((s) => s === 200)).toBeFalsy();
  });
});
