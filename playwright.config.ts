import { defineConfig, devices } from "@playwright/test";

const appPort = Number(process.env.PORT ?? 3000);
const mockPort = Number(process.env.MOCK_GITHUB_PORT ?? 4010);

export default defineConfig({
  testDir: "./src/e2e",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: `http://127.0.0.1:${appPort}`,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],
  webServer: [
    {
      command: `node --import tsx src/e2e/mock-github-server.ts`,
      url: `http://127.0.0.1:${mockPort}/health`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: `node ./node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port ${appPort}`,
      url: `http://127.0.0.1:${appPort}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        GITHUB_API_BASE_URL: `http://127.0.0.1:${mockPort}`,
      },
    },
  ],
});
