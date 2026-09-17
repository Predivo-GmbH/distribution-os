/**
 * prove-function-answers.test.mjs — pure-logic guard for the classifier behind the
 * "Prove the function answers" step in .github/workflows/deploy-edge-functions.yml.
 *
 * WHAT THIS PROTECTS. Distribution-OS production holds 32 edge-function secrets; staging holds
 * 14 (measured 2026-09-14, `gh api /v1/projects/<ref>/secrets` on both refs — names only, no
 * value was read or printed). stripe-webhook reads STRIPE_WEBHOOK_SECRET at MODULE level and
 * throws if it is absent, so it 500s on cold start for EVERY request on staging, this health-ping
 * included — and the deploy workflow's own probe step went red on exactly that (run
 * 34905661399) while production, which holds the secret, answered fine. The probe's accept-list
 * is wide on purpose ("a gate that goes red on a healthy deploy is a gate people learn to scroll
 * past") but a 5xx caused by a genuinely missing secret was still failing the gate, because
 * nothing could tell "the code is broken" apart from "this environment was never given the
 * secret".
 *
 * classify() is that distinction, as a pure function with no network and no CI dependency, so
 * every rule below is checked on every push — not just the next time someone deploys to staging.
 *
 * No dependencies, no network: same convention as supabase/functions/_shared/smtp-retry.test.mjs.
 * Run: node --experimental-strip-types .github/scripts/prove-function-answers.test.mjs
 */
import { fileURLToPath } from 'node:url'
import { classify, isAliveCode, isServerErrorCode, findEntry, loadDeclaration, EXIT_CODE } from './prove-function-answers.mjs'

let pass = 0, fail = 0
const check = (name, cond) => { cond ? (pass++, console.log('  ok   ' + name)) : (fail++, console.log('  FAIL ' + name)) }

const DECLARATION = {
  entries: [
    {
      function: 'stripe-webhook',
      secrets: ['STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'],
      reason: 'module-level throw, test fixture',
      since: '2026-09-15',
    },
  ],
}

// -- isAliveCode / isServerErrorCode: the existing wide accept-list, unchanged ------------------
check('2xx is alive', isAliveCode('200') && isAliveCode('204') && isAliveCode('299'))
check('the named 4xx codes are alive', ['400', '401', '403', '405', '409', '422', '429'].every(isAliveCode))
check('an UNlisted 4xx (e.g. 418) is NOT alive', !isAliveCode('418'))
check('404 is NOT alive', !isAliveCode('404'))
check('500 is NOT alive', !isAliveCode('500'))
check('000 (no answer at all) is NOT alive', !isAliveCode('000'))
check('isServerErrorCode is true for 500-599 only', isServerErrorCode('500') && isServerErrorCode('599') && !isServerErrorCode('404') && !isServerErrorCode('000') && !isServerErrorCode('200'))

// == REQUIRED TEST 1: production is NEVER exempt ================================================
{
  const r = classify({ target: 'production', fn: 'stripe-webhook', code: '500', declaration: DECLARATION })
  check('DEFECT-GUARD: production 5xx on a DECLARED function still FAILs the gate', r.verdict === 'FAIL')
}
{
  // Same fixture, only the target changes, so the ONLY variable under test is "production".
  // If this ever returns NOT_PROVEN, the exemption has leaked into the one place it must never
  // reach.
  const staging = classify({ target: 'staging', fn: 'stripe-webhook', code: '500', declaration: DECLARATION })
  const prod = classify({ target: 'production', fn: 'stripe-webhook', code: '500', declaration: DECLARATION })
  check('the SAME declared function + SAME 5xx diverges only on target: staging=NOT_PROVEN, production=FAIL',
    staging.verdict === 'NOT_PROVEN' && prod.verdict === 'FAIL')
  check('production carries no "entry" on its result — it never looked the function up', !prod.entry)
}
{
  // A 5xx code that is not literally "500" (e.g. a gateway 503) must still fail on production.
  const r = classify({ target: 'production', fn: 'stripe-webhook', code: '503', declaration: DECLARATION })
  check('production FAILs on 503 too, not just 500', r.verdict === 'FAIL')
}

// == REQUIRED TEST 2: a declared function's 5xx on staging does not fail the gate, but IS reported ==
{
  const r = classify({ target: 'staging', fn: 'stripe-webhook', code: '500', declaration: DECLARATION })
  check('declared function + 5xx on staging => NOT_PROVEN, not FAIL', r.verdict === 'NOT_PROVEN')
  check('NOT_PROVEN is a DIFFERENT exit code from both ALIVE and FAIL (so the step can "not fail but still report")',
    EXIT_CODE.NOT_PROVEN !== EXIT_CODE.ALIVE && EXIT_CODE.NOT_PROVEN !== EXIT_CODE.FAIL)
  check('the reported message names every missing secret', r.message.includes('STRIPE_SECRET_KEY') && r.message.includes('STRIPE_WEBHOOK_SECRET'))
  check('the reported message says "NOT PROVEN" literally, so it is greppable in the CI log', r.message.includes('NOT PROVEN'))
  check('the reported message says which environment is short the secret', r.message.includes('this environment holds no'))
}

// == REQUIRED TEST 3: an UNdeclared function's 5xx still fails on staging =======================
{
  const r = classify({ target: 'staging', fn: 'some-other-function', code: '500', declaration: DECLARATION })
  check('undeclared function + 5xx on staging still FAILs', r.verdict === 'FAIL')
}
{
  const r = classify({ target: 'staging', fn: 'some-other-function', code: '000', declaration: DECLARATION })
  check('undeclared function + no answer at all (000) still FAILs on staging', r.verdict === 'FAIL')
}
{
  // Narrow-exemption guard: even a DECLARED function does not get waved through on 000. The
  // declaration covers "the function booted and its own code threw" (a clean 5xx), not "nothing
  // answered at all", which is a different and more serious failure mode.
  const r = classify({ target: 'staging', fn: 'stripe-webhook', code: '000', declaration: DECLARATION })
  check('DEFECT-GUARD: declared function + 000 on staging still FAILs (the exemption does not cover "no answer at all")', r.verdict === 'FAIL')
}

// == REQUIRED TEST 4: a 404 fails everywhere, even for a declared function ======================
{
  const onStaging = classify({ target: 'staging', fn: 'stripe-webhook', code: '404', declaration: DECLARATION })
  const onProd = classify({ target: 'production', fn: 'stripe-webhook', code: '404', declaration: DECLARATION })
  const undeclared = classify({ target: 'staging', fn: 'some-other-function', code: '404', declaration: DECLARATION })
  check('404 FAILs on staging even for a DECLARED function', onStaging.verdict === 'FAIL')
  check('404 FAILs on production', onProd.verdict === 'FAIL')
  check('404 FAILs for an undeclared function', undeclared.verdict === 'FAIL')
  check('the 404 message says "not deployed", not anything about a secret', /not deployed/.test(onStaging.message) && !/STRIPE/.test(onStaging.message))
}

// -- a declared function answering normally is called out as a possibly-stale exemption ---------
{
  const r = classify({ target: 'staging', fn: 'stripe-webhook', code: '400', declaration: DECLARATION })
  check('declared function answering normally on staging is just ALIVE', r.verdict === 'ALIVE')
  check('...and the message flags the exemption as possibly no longer needed', /may no longer be needed/i.test(r.message))
}
{
  // Same code, undeclared function: must NOT get the "may no longer be needed" note — that
  // sentence is only true of something that WAS declared in the first place.
  const r = classify({ target: 'staging', fn: 'some-other-function', code: '400', declaration: DECLARATION })
  check('an ordinary alive answer for an UNdeclared function carries no stale-exemption note',
    r.verdict === 'ALIVE' && !/may no longer be needed/i.test(r.message))
}
{
  // Production never gets the "may no longer be needed" framing either — that language is
  // specifically about a staging exemption, and production is never exempt from anything.
  const r = classify({ target: 'production', fn: 'stripe-webhook', code: '400', declaration: DECLARATION })
  check('production answering normally is just ALIVE, with no exemption language at all',
    r.verdict === 'ALIVE' && !/may no longer be needed/i.test(r.message) && !r.entry)
}

// -- findEntry / declaration shape ---------------------------------------------------------------
check('findEntry matches by function name', findEntry(DECLARATION, 'stripe-webhook')?.function === 'stripe-webhook')
check('findEntry returns null for a name not in the file', findEntry(DECLARATION, 'nope') === null)
check('findEntry survives a declaration with no entries key at all', findEntry({}, 'stripe-webhook') === null)
check('findEntry survives a null declaration', findEntry(null, 'stripe-webhook') === null)

// -- the REAL declaration file in this repo must parse and every entry must be well-formed -------
{
  const real = loadDeclaration(fileURLToPath(new URL('../staging-cannot-prove.json', import.meta.url)))
  check('the real .github/staging-cannot-prove.json parses with an entries array', Array.isArray(real.entries))
  check('every real entry has function/secrets/reason/since, all non-empty', real.entries.every((e) =>
    typeof e.function === 'string' && e.function.length > 0 &&
    Array.isArray(e.secrets) && e.secrets.length > 0 &&
    typeof e.reason === 'string' && e.reason.length > 0 &&
    typeof e.since === 'string' && e.since.length > 0))
  check('no two real entries declare the same function twice', new Set(real.entries.map((e) => e.function)).size === real.entries.length)
}

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
