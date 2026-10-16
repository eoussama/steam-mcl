import process from "node:process";

import { defineConfig, devices } from "@playwright/test";



const PORT = 3200;

/**
 * End-to-end tests against the production build, run `pnpm test:e2e` to build and test. Steam is mocked at the network level, see `e2e/fixtures/steam.ts`,
 * so no API key is needed. Runs in Edge by default, set `PLAYWRIGHT_CHANNEL` to use another installed browser.
 */
export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  // Each worker runs a browser against one local server, more than a few starve it.
  workers: process.env.CI ? 2 : 4,
  expect: { timeout: 10_000 },
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    channel: process.env.PLAYWRIGHT_CHANNEL ?? "msedge",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Edge"], channel: process.env.PLAYWRIGHT_CHANNEL ?? "msedge" } },
    { name: "mobile", use: { ...devices["Pixel 7"], channel: process.env.PLAYWRIGHT_CHANNEL ?? "msedge" }, grep: /@mobile/ },
  ],
  webServer: {
    command: "pnpm start",
    url: `http://localhost:${PORT}`,
    env: { PORT: String(PORT) },
    reuseExistingServer: false,
    timeout: 180_000,
  },
});
