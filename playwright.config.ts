import { defineConfig } from "@playwright/test"

const API_URL = process.env.API_URL || "http://localhost:8787"

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: API_URL,
    trace: "on-first-retry",
  },
})
