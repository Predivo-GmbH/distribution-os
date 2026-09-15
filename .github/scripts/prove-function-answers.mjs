#!/usr/bin/env node
/**
 * prove-function-answers.mjs — the ONE place that reads .github/staging-cannot-prove.json.
 *
 * WHY THIS EXISTS (2026-09-15). The "Prove the function answers" step in
 * .github/workflows/deploy-edge-functions.yml probes every just-deployed function with an
 * unauthenticated POST and accepts a wide range of codes as alive (2xx, and the 4xx a live
 * function legitimately returns to a bad probe). Production holds 32 Distribution-OS
 * edge-function secrets; staging holds 14 (measured 2026-09-14, `gh api /v1/projects/<ref>/secrets`
 * on both refs — names only). A function that reads a required secret at MODULE level throws on
 * cold start and 500s on EVERY request, this health-ping included — on staging that is an
 * ENVIRONMENT GAP, not a code defect, and the same deploy answers fine on production, which holds
 * the secret. stripe-webhook did exactly this in run 34905661399. The probe could not tell the
 * two apart, so a healthy deploy went red — exactly the class of gate its own comment warns
 * against: "a gate that goes red on a healthy deploy is a gate people learn to scroll past".
 *
 * classify() is the fix, as a single pure function with four rules that cannot be bent by editing
 * the declaration file:
 *   1. PRODUCTION IS NEVER EXEMPT. The production branch below never looks at the declaration at
 *      all — not "ignores it", structurally cannot reach it. A 5xx on production fails, full stop.
 *   2. A 404 fails everywhere, declared or not. 404 means "not deployed", which has nothing to do
 *      with a missing secret and is never something to wave through.
 *   3. On staging, ONLY a genuine 5xx (500-599) from a DECLARED function is NOT_PROVEN. Anything
 *      else not-alive (000 = no answer at all, a network-level failure) still FAILs even when
 *      declared — the exemption covers exactly the failure mode it was written for (a clean
 *      module-load throw), not "any bad outcome on staging".
 *   4. A declared function that answers normally is called out as possibly-stale, so an exemption
 *      that is no longer needed gets noticed instead of carried forever.
 *
 * Run directly for one function:
 *   node .github/scripts/prove-function-answers.mjs --target staging --function stripe-webhook --code 500
 * Exit code: 0 = alive (proven), 1 = fail (must redden the deploy), 2 = not proven (declared,
 * loud, does not redden the deploy). See EXIT_CODE below — the workflow step matches on these.
 *
 * Tested by the pure-logic suite alongside this file: prove-function-answers.test.mjs.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'

// THE EXACT ACCEPT-LIST FROM THE STEP'S OWN COMMENT, UNCHANGED. 2xx, or one of the named 4xx a
// live function legitimately returns to a probe it doesn't recognise (401 for auth, 400 for
// validation, and so on). Everything else — including 404 and every 5xx — is "not alive" and
// falls through to the rules below.
const ALIVE_4XX = new Set(['400', '401', '403', '405', '409', '422', '429'])

export function isAliveCode(code) {
  const c = String(code)
  return /^2\d\d$/.test(c) || ALIVE_4XX.has(c)
}

/** True for a genuine HTTP 5xx — the ONLY failure mode a module-level `throw` on cold start
 *  produces. Deliberately narrower than "not alive": 000 (curl's sentinel for no answer at all —
 *  DNS, TLS, timeout, connection refused) is a different, more serious failure than "the function
 *  booted, ran its own code, and that code threw a clean error" and must not be waved through
 *  just because the function's name happens to be in the declaration file. */
export function isServerErrorCode(code) {
  return /^5\d\d$/.test(String(code))
}

/** The declared entry for a function, or null. Never throws on a malformed/empty declaration —
 *  an exemption file that fails to load must never turn into "nothing is exempt AND nothing
 *  fails", so callers decide what an absent declaration means, not this helper. */
export function findEntry(declaration, fn) {
  const entries = declaration && Array.isArray(declaration.entries) ? declaration.entries : []
  return entries.find((e) => e.function === fn) ?? null
}

export function loadDeclaration(path) {
  const text = readFileSync(path, 'utf-8')
  const json = JSON.parse(text)
  if (!Array.isArray(json.entries)) {
    throw new Error(`${path}: "entries" must be an array`)
  }
  return json
}

export const EXIT_CODE = { ALIVE: 0, FAIL: 1, NOT_PROVEN: 2 }

/**
 * The single decision point. Returns { verdict: 'ALIVE' | 'NOT_PROVEN' | 'FAIL', message, entry? }.
 *
 * @param {{ target: 'staging' | 'production', fn: string, code: string | number, declaration: { entries: Array } }} args
 */
export function classify({ target, fn, code, declaration }) {
  const c = String(code)
  const entry = findEntry(declaration, fn)

  if (isAliveCode(c)) {
    if (entry && target === 'staging') {
      return {
        verdict: 'ALIVE',
        entry,
        message: `${fn} -> HTTP ${c} (answering normally on staging — the declared exemption for `
          + `${entry.secrets.join(', ')} may no longer be needed; review its entry in `
          + '.github/staging-cannot-prove.json)',
      }
    }
    return { verdict: 'ALIVE', message: `${fn} -> HTTP ${c}` }
  }

  // RULE 2: a 404 means "not deployed". That is a real deploy failure on every target, for a
  // declared function exactly as much as an undeclared one — a missing secret cannot explain it.
  if (c === '404') {
    return {
      verdict: 'FAIL',
      message: `${fn} did not answer after deploy (HTTP 404) — the function is not deployed. `
        + 'That is a real deploy failure and has nothing to do with secrets.',
    }
  }

  // RULE 1: PRODUCTION IS NEVER EXEMPT. This branch is reached before the declaration is ever
  // consulted for a verdict — production fails on any non-alive, non-404 code unconditionally,
  // no matter what .github/staging-cannot-prove.json says or who edited it.
  if (target === 'production') {
    return { verdict: 'FAIL', message: `${fn} did not answer after deploy (HTTP ${c}).` }
  }

  // RULE 3: staging, a genuine 5xx, and the function is declared -> NOT PROVEN, not a failure.
  if (target === 'staging' && entry && isServerErrorCode(c)) {
    return {
      verdict: 'NOT_PROVEN',
      entry,
      message: `${fn} -> HTTP ${c}: NOT PROVEN — this environment holds no `
        + `${entry.secrets.join(', ')} (${entry.reason})`,
    }
  }

  // Undeclared function, or a non-5xx/non-alive code (000) even for a declared one: fails.
  return { verdict: 'FAIL', message: `${fn} did not answer after deploy (HTTP ${c}).` }
}

// ---- CLI -----------------------------------------------------------------------------------
function parseArgs(argv) {
  const get = (name) => {
    const i = argv.indexOf(`--${name}`)
    return i === -1 ? undefined : argv[i + 1]
  }
  return { target: get('target'), fn: get('function'), code: get('code'), declPath: get('declaration') }
}

function main() {
  const { target, fn, code, declPath } = parseArgs(process.argv.slice(2))
  if (!target || !fn || code === undefined) {
    console.error(
      'usage: prove-function-answers.mjs --target <staging|production> --function <name> '
      + '--code <http-code> [--declaration <path>]',
    )
    process.exit(1)
  }

  const path = declPath ?? fileURLToPath(new URL('../staging-cannot-prove.json', import.meta.url))
  let declaration
  try {
    declaration = loadDeclaration(path)
  } catch (e) {
    // An exemption file that cannot be read must fail LOUD, never fail open. Falling back to
    // "no declarations" here would silently turn every declared function into a hard failure on
    // staging too — which is at least safe (never hides a real problem) but the breakage should
    // be visible for what it is: a broken declaration file, not a broken function.
    console.error(`::error::could not read ${path}: ${e.message}`)
    process.exit(EXIT_CODE.FAIL)
  }

  const result = classify({ target, fn, code, declaration })
  console.log(result.message)
  process.exit(EXIT_CODE[result.verdict])
}

// Run only when executed directly (`node prove-function-answers.mjs ...`), never on import —
// pathToFileURL/fileURLToPath (not a hand-built `file://` string) so this compares correctly on
// both the Windows dev box this was written on and the Linux CI runner it ships to.
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
