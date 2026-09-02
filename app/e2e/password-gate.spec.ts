import { test, expect } from '@playwright/test'
import { unlockGate } from './helpers'

/**
 * The live access code must NEVER be a literal in this file. Commit b3a2c8c put it
 * here in plain text; the value was burned by that single commit and had to be
 * rotated (f45cf25). It now lives in exactly two places: the GitHub repo secret
 * DISTOS_GATE_PASSWORD, and the gitignored docs/Credentials.txt.
 *
 * It must also never survive in a CI ARTEFACT. A failing Playwright test writes an
 * accessibility snapshot (error-context.md) holding field values, and a retried one
 * writes a trace recording the verbatim arguments to fill(); test.yml uploads
 * app/playwright-report/ on failure and GitHub keeps it for days. So this file:
 *   1. turns trace/screenshot/video OFF for these tests, and
 *   2. blanks the field in a `finally` the instant the form is submitted, BEFORE
 *      any assertion that could fail with the secret still in the DOM.
 * Rule 1 is not sufficient on its own — error-context.md is written regardless of
 * the trace setting. Rule 2 is the control that actually holds.
 */
test.use({ trace: 'off', screenshot: 'off', video: 'off' })

/** The live access code, or a loud failure. Never a silent empty-string default. */
function gatePassword(): string {
  const value = process.env.DISTOS_GATE_PASSWORD
  if (!value) {
    throw new Error(
      'DISTOS_GATE_PASSWORD is not set, so the access gate cannot be exercised.\n' +
        'Set it from the GitHub repo secret of the same name (CI), or from the\n' +
        'gitignored docs/Credentials.txt (locally). Do NOT hard-code the access\n' +
        'code in this file — doing so burns it and forces another rotation.'
    )
  }
  return value
}

test.describe('Password Gate', () => {
  test('shows gate when not authenticated', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Early Access')).toBeVisible()
    await expect(page.getByPlaceholder('Access code')).toBeVisible()
  })

  test('rejects incorrect password', async ({ page }) => {
    await page.goto('/')
    await page.getByPlaceholder('Access code').fill('wrongpassword')
    await page.getByRole('button', { name: 'Enter' }).click()
    await expect(page.getByText('Incorrect code')).toBeVisible()
  })

  test('accepts correct password and shows app', async ({ page }) => {
    const password = gatePassword()
    await page.goto('/')
    const field = page.getByPlaceholder('Access code')

    try {
      await field.fill(password)
      await page.getByRole('button', { name: 'Enter' }).click()
    } finally {
      // Blank the field before any assertion can fail with the code still in the
      // DOM. On the success path the gate unmounts and this throws — which is the
      // outcome we want, so it is swallowed deliberately.
      //
      // The short explicit timeout is load-bearing. Without it, fill() waits out the
      // WHOLE remaining test budget for an element that has correctly gone away, and
      // the assertion below then fails for lack of time — a green control that turns
      // the test red for the wrong reason.
      await field.fill('', { timeout: 2000 }).catch(() => {})
    }

    // After gate, should see landing page
    await expect(page.getByText('Distribution-OS', { exact: true }).first()).toBeVisible()
  })

  test('bypasses gate when session key is set', async ({ page }) => {
    await unlockGate(page)
    await page.goto('/')
    await expect(page.getByText('Early Access')).not.toBeVisible()
  })
})
