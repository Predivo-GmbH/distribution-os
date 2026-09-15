import { defineConfig, devices } from '@playwright/test'

// When E2E_STAGING_URL is set the suite runs against the LIVE staging
// deployment (basic-auth protected, no local dev server) instead of a
// local vite instance. Used by deploy-staging.yml's e2e-staging job.
const stagingUrl = process.env.E2E_STAGING_URL

// The local dev-server port was hardcoded to 5183, and --strictPort was missing. That is safe on
// GitHub's throwaway runners - one VM per job - but our self-hosted host runs ~24 runners for 14
// repositories inside ONE network namespace, so a port is a fleet-wide resource. Without
// --strictPort Vite slides quietly to 5184 while Playwright keeps polling 5183 and the run tests
// whatever else is listening there - exactly the failure Valrano hit on 2026-08-31, where a whole
// suite ran against another product and still mostly passed. CI now takes a free port from the OS
// (E2E_PORT, set by the workflow); 5183 stays the local default. See deploy-standard.md RULE 3.
const PORT = process.env.E2E_PORT || '5183'
const LOCAL_BASE_URL = `http://localhost:${PORT}`

export default defineConfig({
  testDir: './e2e',
  // PINNED OFF test-results/ ITSELF, DELIBERATELY. The reporter above sweeps outputDir whole at
  // onEnd, and test-results/ in this fleet also holds json reports that CI steps read after the
  // suite and screenshots specs write themselves. Nesting keeps the sweep unconditional and
  // still confined to what Playwright wrote.
  outputDir: 'test-results/artifacts',
  // The heavy v11 hardened gates live in e2e/staging/ and run ONLY via
  // playwright.v11-gates.config.ts (needs DIST_MGMT_TOKEN + a real staging login).
  // Keep them out of the deploy gauntlet / any bare `npx playwright test`.
  testIgnore: ['**/staging/**'],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  // THE STRIPPER RUNS FIRST, AND THAT ORDER IS LOAD-BEARING. Reporters are called in array
  // order and share one TestResult, so removing an attachment here is what the reporter after
  // it sees - and the base reporter prints `Error Context: <path>` straight out of that array.
  // Registering it after would delete the file and still publish its path into the job log.
  // Playwright writes that error context - an ARIA snapshot of the signed-in page, form-field
  // contents included - for any test that ends with errors, gated on nothing but
  // `errors.length > 0`; no `use:` switch reaches it, and a FLAKY test is enough. See
  // e2e/strip-runner-artifacts.reporter.ts for the whole reasoning.
  reporter: [['./e2e/strip-runner-artifacts.reporter.ts'], ['html']],
  use: {
    baseURL: stagingUrl ?? LOCAL_BASE_URL,
    // NOTHING IS RECORDED WHEN THIS SUITE FAILS (2026-09-15). A trace records what was typed
    // and a screenshot photographs the form it was typed into, and both are written to a
    // SELF-HOSTED runner that 19 repositories share and then uploaded as a CI artifact. The
    // fleet rule is that a secret is never rendered anywhere, and a debugging convenience is
    // not an exception to it. Debug by reading the assertion, or locally with a throwaway
    // account - never by turning these back on in CI.
    //
    // THESE THREE SWITCHES DO NOT CLOSE THE FOURTH CHANNEL. Playwright writes
    // test-results/<test>/error-context.md - an ARIA snapshot of the page, i.e. the signed-in
    // application including the contents of form fields - for any test that ends with errors,
    // gated on nothing but `errors.length > 0`. There is no `use:` option for it. It is removed
    // by the reporter registered above; drop that and this suite starts leaving photographs of
    // a signed-in page on a runner 19 repositories share.
    trace: 'off',
    screenshot: 'off',
    video: 'off',
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
          command: `npx vite --mode test --port ${PORT} --strictPort`,
          // url is pinned to the SAME port the server was told to bind, so a failure to bind
          // times out loudly instead of testing something else that answers there.
          url: LOCAL_BASE_URL,
          // !CI: locally, reusing a dev server you already have running is a convenience.
          // On CI it is the bug above - never reuse whatever happens to hold the port.
          reuseExistingServer: !process.env.CI,
          timeout: 30000,
        },
      }),
})
