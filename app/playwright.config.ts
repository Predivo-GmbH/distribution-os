import { defineConfig, devices } from '@playwright/test'

// When E2E_STAGING_URL is set the suite runs against the LIVE staging
// deployment (basic-auth protected, no local dev server) instead of a
// local vite instance. Used by deploy-staging.yml's e2e-staging job.
const stagingUrl = process.env.E2E_STAGING_URL

export default defineConfig({
  testDir: './e2e',
  // The heavy v11 hardened gates live in e2e/staging/ and run ONLY via
  // playwright.v11-gates.config.ts (needs DIST_MGMT_TOKEN + a real staging login).
  // Keep them out of the deploy gauntlet / any bare `npx playwright test`.
  testIgnore: ['**/staging/**'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: 'html',
  use: {
    baseURL: stagingUrl ?? 'http://localhost:5183',
    trace: 'on-first-retry',
    ...(stagingUrl
      ? {
          httpCredentials: {
            username: process.env.E2E_STAGING_USER ?? 'staging',
            password: process.env.E2E_STAGING_PASS ?? '',
          },
        }
      : {}),
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'a11y',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /accessibility\.spec\.ts/,
    },
  ],
  ...(stagingUrl
    ? {}
    : {
        webServer: {
          command: 'npx vite --mode test --port 5183',
          url: 'http://localhost:5183',
          reuseExistingServer: !process.env.CI,
          timeout: 30000,
        },
      }),
})
