import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright configuration for E2E testing of Chrome Extension
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Chrome extensions can only run one instance at a time
  reporter: 'html',
  use: {
    trace: 'on-first-retry',
    headless: false, // Extensions need headful mode
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Launch Chrome with extension loaded
        args: [
          `--disable-extensions-except=${process.cwd()}/dist`,
          `--load-extension=${process.cwd()}/dist`,
        ],
      },
    },
  ],
})
