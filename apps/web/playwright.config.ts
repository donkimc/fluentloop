import { defineConfig, devices } from "@playwright/test";

const port = 3100;

export default defineConfig({
  testDir: "./e2e",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "retain-on-failure",
    // Optional: point at an already-installed Chromium instead of Playwright's download.
    ...(process.env.PLAYWRIGHT_CHROMIUM_PATH && {
      launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH },
    }),
  },
  // Mobile-first: learners use phones.
  projects: [{ name: "mobile-chrome", use: { ...devices["Pixel 7"] } }],
  webServer: {
    command: `pnpm start --port ${port}`,
    url: `http://localhost:${port}/api/health`,
    reuseExistingServer: !process.env.CI,
  },
});
