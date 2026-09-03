#!/usr/bin/env node
/**
 * RUN EVERY GUARD SUITE IN THIS REPO - the list is DISCOVERED, never typed.
 *
 * WHY THIS EXISTS (2026-09-03).
 *
 *     A GUARD NOBODY EXECUTES IS NOT COVERAGE. IT IS THE APPEARANCE OF COVERAGE.
 *
 * Measured in THIS repo on 2026-09-03: supabase/functions/_shared/smtp-retry.test.mjs - 13
 * checks, every one of them passing - had never been executed by CI. Not once, in its whole life.
 *
 * It was not skipped and nobody excluded it. It was simply unreachable. This repo's only vitest
 * config is app/vitest.config.ts, whose `include` is 'src/**' relative to app/, so it cannot see
 * anything under supabase/ - and the workflows run `npm run test:coverage` / `npx vitest run` with
 * working-directory: app, which is that same config. A file two directory levels outside the only
 * runner that exists is invisible by construction, and being invisible looked exactly like being
 * green.
 *
 * What was dark: the guard against the mail failure that hit this fleet's other copy of the same
 * SMTP client in production (Sentry SIGNALSCORE-2, "Connection timeout", 2026-08-29). It proves
 * the retry rides out a stalled connection, and - the part that actually matters - that it does
 * NOT retry a rejected login, a rejected recipient, or an ESOCKET that could double-send a
 * customer's mail. Thirteen assertions about when NOT to resend somebody's auth email, checked by
 * nobody.
 *
 * The defect is not that somebody forgot to add it to a list. It is that a list existed at all.
 * Every guard added from here on is picked up by EXISTING, and nobody has to edit this file or a
 * workflow.
 *
 * ABSENCE IS NOT SUCCESS. If discovery matches nothing, that is a failure, not a pass - otherwise
 * a moved directory silently switches the whole suite off while still printing green, which is
 * the exact class of bug this script exists to end.
 *
 * TWO MODES:
 *
 *   node scripts/run-guards.mjs          every OFFLINE suite. Pure logic, no network, no
 *                                        credentials, no node_modules. Safe on every push, and
 *                                        the only mode wired today because every suite here is
 *                                        offline.
 *   node scripts/run-guards.mjs --live   only *.prod.test.mjs / *.live.test.mjs - suites that
 *                                        probe real deployed projects over the network. There are
 *                                        none in this repo today. If you add one, wire this mode
 *                                        into a workflow on the promotion path: until you do, the
 *                                        OFFLINE run above FAILS and names the file. A carve-out
 *                                        that nothing on the other side executes is just a skip
 *                                        list, and this script refuses to be one.
 *
 * Run from anywhere: paths are resolved from this file, not from the working directory.
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join, relative, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawnSync } from 'node:child_process'

// Derived from THIS FILE, never from process.cwd(). Most steps in this repo's workflows set
// `working-directory: app`; a discovery rooted at the working directory would find nothing there
// and - before the absence check below - report a triumphant pass over zero suites.
const ROOT = dirname(dirname(fileURLToPath(import.meta.url)))
const SKIP_DIRS = new Set([
  'node_modules', '.git', 'dist', 'build', 'coverage', 'playwright-report',
  '.vite', 'test-results',
])
const LIVE = /\.(live|prod)\.test\.mjs$/
const relOf = (f) => relative(ROOT, f).split('\\').join('/')

const LIVE_MODE = process.argv.includes('--live')

function discover(dir, out = []) {
  let entries
  try { entries = readdirSync(dir, { withFileTypes: true }) } catch { return out }
  for (const e of entries) {
    if (e.name.startsWith('.') && e.name !== '.github') continue
    const full = join(dir, e.name)
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue
      discover(full, out)
    } else if (e.name.endsWith('.test.mjs')) {
      out.push(full)
    }
  }
  return out
}

const all = discover(ROOT).sort()
const liveSuites = all.filter((f) => LIVE.test(f))
const offlineSuites = all.filter((f) => !LIVE.test(f))
const suites = LIVE_MODE ? liveSuites : offlineSuites

if (all.length === 0) {
  console.error('::error::run-guards found NO *.test.mjs anywhere. Absence is not success - either the')
  console.error('         pattern changed or the suites moved. Refusing to report a pass.')
  process.exit(1)
}
if (suites.length === 0) {
  const what = LIVE_MODE ? 'live-probe' : 'offline'
  console.error(`::error::run-guards found ${all.length} suite(s) but NONE of them ${what}. Nothing was proven,`)
  console.error('         so this is a failure, not a pass.')
  process.exit(1)
}

// THE CARVE-OUT CANNOT BECOME A HIDING PLACE. Excluding live probes from the everyday run is only
// legitimate while something, somewhere, still runs them. So the offline run reads the workflows
// and checks that --live is actually wired. Add a *.prod.test.mjs without wiring the live step and
// this goes red on the next push, naming the file - instead of the file going dark, which is
// precisely how smtp-retry.test.mjs stayed unrun for its entire life.
if (!LIVE_MODE && liveSuites.length) {
  const wfDir = join(ROOT, '.github', 'workflows')
  let wired = false
  try {
    for (const f of readdirSync(wfDir)) {
      if (!/\.ya?ml$/.test(f)) continue
      if (/run-guards\.mjs[^\n]*--live/.test(readFileSync(join(wfDir, f), 'utf-8'))) { wired = true; break }
    }
  } catch { /* no workflows directory: fall through to the failure below */ }
  if (!wired) {
    console.error(`::error::${liveSuites.length} live-probe suite(s) are carved out of this run, but no workflow in`)
    console.error('         .github/workflows invokes `run-guards.mjs --live`, so NOTHING runs them. Wire the')
    console.error('         live step, or the carve-out is just a skip list. Carved out here:')
    for (const f of liveSuites) console.error(`           - ${relOf(f)}`)
    process.exit(1)
  }
}

console.log(LIVE_MODE
  ? `run-guards --live: ${suites.length} live-probe suite(s) (these talk to real deployed projects)`
  : `run-guards: ${suites.length} offline suite(s) discovered`)

let passed = 0
const failures = []

for (const file of suites) {
  const rel = relOf(file)
  const res = spawnSync(process.execPath, ['--experimental-strip-types', file], {
    cwd: ROOT,
    stdio: ['ignore', 'pipe', 'pipe'],
    encoding: 'utf-8',
    timeout: 120_000,
  })
  if (res.status === 0) {
    passed++
    console.log(`  ok    ${rel}`)
  } else {
    failures.push({ rel, out: `${res.stdout || ''}${res.stderr || ''}`.trim() })
    console.log(`  FAIL  ${rel}`)
  }
}

// -- THE BASELINE THAT CAN ONLY SHRINK ----------------------------------------------------------
// The list is built so a failure cannot be hidden behind it:
//   - a suite NOT on the list that fails   -> FAIL. New breakage is caught the moment it appears.
//   - a suite ON the list that now PASSES  -> FAIL, telling you to delete the entry.
//   - discovery matching nothing           -> FAIL. Absence is not success.
//
// That middle rule is the one that matters: fixing a suite FORCES its removal from the list, so
// the list can never quietly become permanent silence. It can only ever get smaller. A "known
// failures" file without that rule is just a skip list wearing a better name.
let baseline = { entries: [] }
try {
  baseline = JSON.parse(readFileSync(new URL('./guards-known-failing.json', import.meta.url), 'utf-8'))
} catch { /* no baseline file = every failure counts, which is the stricter default */ }

const known = new Map((baseline.entries || []).map((e) => [e.file, e]))
const newBreakage = failures.filter((f) => !known.has(f.rel))

// An entry may declare WHERE it fails, with "env": "ci", for a suite that passes on a developer
// machine and fails only on the runner. Without this the shrink-only rule below would fire locally
// the moment such a suite was listed - punishing an honest entry. It still bites where it matters:
// in CI, whose verdict is the one that blocks a deploy.
const IN_CI = Boolean(process.env.CI || process.env.GITHUB_ACTIONS)
const enforcedHere = (e) => !e.env || e.env === 'any' || (e.env === 'ci' && IN_CI)
const fixedButStillListed = suites
  .map(relOf)
  .filter((r) => known.has(r) && enforcedHere(known.get(r)) && !failures.some((f) => f.rel === r))

console.log(`\nran ${suites.length} guard suite(s): ${passed} passed, ${failures.length} failed`)
if (!LIVE_MODE && liveSuites.length) {
  console.log(`(${liveSuites.length} live-probe suite(s) not run here - a named carve-out, not a silent skip, and`)
  console.log(' this run already verified that a workflow really does invoke them via --live.)')
}

if (known.size) {
  console.log(`\n${known.size} suite(s) on the known-failing baseline (this list may only SHRINK):`)
  for (const e of known.values()) console.log(`  - ${e.file}  (listed ${e.since}) - ${e.reason}`)
}

for (const f of newBreakage) {
  const tail = f.out.split('\n').slice(-25).join('\n')
  console.log(`\n----- ${f.rel} -----\n${tail}`)
  console.log(`::error::guard suite failed and is NOT on the known-failing baseline: ${f.rel}`)
}
for (const r of fixedButStillListed) {
  console.log(`::error::${r} now PASSES but is still on the known-failing baseline. Delete its entry from scripts/guards-known-failing.json - the list must shrink when something is fixed.`)
}

const bad = newBreakage.length + fixedButStillListed.length
if (bad === 0 && failures.length) {
  console.log(`\n(${failures.length} failure(s), every one already on the baseline. No NEW breakage.)`)
}
process.exit(bad ? 1 : 0)
