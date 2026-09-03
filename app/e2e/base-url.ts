/**
 * WHERE THE TESTS POINT - and why this file exists rather than a `||` fallback.
 *
 * Until 2026-09-01 e2e/critical-path.spec.ts began with
 *
 *     const BASE_URL = process.env.BASE_URL || 'https://distributionos.predivo.ch'
 *
 * and the ONE workflow line that sets `BASE_URL` (deploy-staging.yml) is on a different step, the
 * one that runs the staging smoke specs. Nothing set it for the step that runs critical-path, so
 * for that spec the fallback WON on every run, with three consequences at once, none of which is
 * visible in a test result:
 *
 *   1. A change that breaks the app still passes, because the tests never load the change.
 *   2. A bad minute on the live site turns the gate red and blames an innocent commit.
 *   3. Every push drove a real browser through the real live site.
 *
 * That near-miss is worth keeping: a grep for the variable name finds a setter in this repository
 * and it still does not help this spec. The question is never "is it set somewhere", it is "is it
 * set on the step that runs THIS file".
 *
 * The rule now: the address comes from the thing being tested, and when there is no address the
 * suite REFUSES TO START. A gate that cannot run must fail - never skip, never guess, and never
 * quietly choose production.
 *
 * Full account: standards/PROMPT_fleet_e2e_tests_default_to_the_live_website.md
 */

/** The dev-server port `playwright.config.ts` starts its `webServer` on. */
const DEFAULT_PORT = '5183'

/**
 * The address under test.
 *
 * - `BASE_URL` set     -> use it. This is how CI, or a staging run, says what it built.
 * - not set, and local -> the dev server `playwright.config.ts` starts for us. That IS the code
 *                         under test, so it is a legitimate default OFF a build machine.
 * - not set, and CI    -> throw. In CI a missing address means the workflow forgot to say what it
 *                         built, and the honest outcome is a red gate, not a silent test of the
 *                         live site.
 *
 * There is deliberately no branch that can produce a public hostname.
 */
export function resolveBaseUrl(): string {
  const explicit = process.env.BASE_URL?.trim()
  if (explicit) return explicit.replace(/\/+$/, '')

  if (process.env.CI) {
    throw new Error(
      'BASE_URL is not set. This suite tests whatever address it is handed, and it must never ' +
        'fall back to the live public site - doing so meant CI was testing production instead of ' +
        'the change. Set BASE_URL on the step that runs this spec, pointing at the build it made ' +
        '(for the local harness: http://localhost:' + DEFAULT_PORT + ').',
    )
  }

  return `http://localhost:${process.env.E2E_PORT || DEFAULT_PORT}`
}

/** The address the tests are pointed at, resolved once at load time so a mistake fails immediately. */
export const BASE_URL = resolveBaseUrl()
