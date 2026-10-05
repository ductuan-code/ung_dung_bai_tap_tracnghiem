import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  use: {
    baseURL: "http://localhost:5173",
    channel: process.env.PLAYWRIGHT_CHANNEL || "msedge",
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
    screenshot: "only-on-failure",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:5173",
    reuseExistingServer: false,
  },
});
