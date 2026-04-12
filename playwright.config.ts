import { defineConfig, devices } from "@playwright/test";

const host = "127.0.0.1";
const port = 3000;
const baseURL = `http://${host}:${port}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  webServer: {
    command: process.env.CI
      ? `npm run build && npm run start -- --hostname ${host} --port ${port}`
      : `npm run dev -- --hostname ${host} --port ${port}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    url: `${baseURL}/api/health`,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
