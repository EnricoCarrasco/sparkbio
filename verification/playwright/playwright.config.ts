import { defineConfig, devices } from "@playwright/test";

/**
 * Point BASE_URL at a running dev server (http://localhost:3000) or a Vercel
 * preview deploy. Auth-dependent tests read TEST_EMAIL / TEST_PASSWORD from env
 * (use a throwaway account on a non-prod project).
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["html", { open: "never" }], ["list"]],
  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
