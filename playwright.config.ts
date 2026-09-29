import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',                  // Tells Playwright where to look for .spec.ts files
  fullyParallel: true,               // Runs tests in parallel
  retries: process.env.CI ? 2 : 0,   // Retries failed tests on CI pipelines
  use: {
    baseURL: 'http://localhost:4321', // Base URL for page.goto('/')
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    },
  ],
  // Automatically boots your Astro preview server before running tests
  webServer: {
    command: 'npm run build && npm run preview',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
  },
});