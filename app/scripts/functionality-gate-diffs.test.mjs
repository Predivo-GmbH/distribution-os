#!/usr/bin/env node
/**
 * FINISH-TEST for the functionality gate's two diff defects (row
 * signal-Distribution-OS:0f58487:functionality-gate-diffs-).
 *
 * The BLOCKING "nothing new ships untested" gate had two faults that together made it a guaranteed
 * no-op on the exact event it was installed to guard — a production deploy:
 *
 *   BUG 1 (empty range). defaultRange() returned `${base}...HEAD` for the first of origin/main /
 *   origin/master / main / master that resolved. On a master deploy the checkout IS master, so the
 *   range is a commit compared against itself — empty. The gate saw zero changes and passed
 *   everything.
 *
 *   BUG 2 (app/ path join). The recogniser runs from app/ with ROOT = app/, but `git diff` prints
 *   paths relative to the repo root (app/src/Foo.tsx). join(ROOT, 'app/src/Foo.tsx') became
 *   app/app/src/Foo.tsx, which never exists, so every changed file was silently skipped.
 *
 * This suite builds throwaway git repos and drives the REAL scripts. Each check asserts the fixed
 * behaviour and would fail against the pre-fix code. Run: `node functionality-gate-diffs.test.mjs`.
 */

import { execFileSync } from 'child_process'
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import assert from 'node:assert/strict'
import { fileURLToPath } from 'url'

const HERE = fileURLToPath(new URL('.', import.meta.url))
const CHECK = join(HERE, 'check-new-functionality-registered.mjs')
const RECOGNISE = join(HERE, 'recognise-functionality.mjs')
const { defaultRange } = await import('./check-new-functionality-registered.mjs')

let passed = 0
const ok = (name) => { console.log(`  ok  ${name}`); passed++ }

function git(cwd, ...a) { execFileSync('git', a, { cwd, stdio: ['ignore', 'pipe', 'ignore'] }) }

/** A fresh repo with an app/ subtree. `registered` = the new route gets a row + a real test file. */
function makeRepo({ registered }) {
  const root = mkdtempSync(join(tmpdir(), 'dosgate-'))
  const app = join(root, 'app')
  mkdirSync(join(app, 'src'), { recursive: true })
  mkdirSync(join(app, 'docs'), { recursive: true })
  mkdirSync(join(app, 'e2e'), { recursive: true })
  git(root, 'init', '-q', '-b', 'master')
  git(root, 'config', 'user.email', 't@t')
  git(root, 'config', 'user.name', 't')
  git(root, 'config', 'core.autocrlf', 'false')
  writeFileSync(join(app, 'src', 'App.tsx'), 'export default function App(){return null}\n')
  let features = '# Features\n\n### F-001: See the home screen\n- **Test Files:** E2E: `e2e/home.spec.ts`\n'
  if (registered) {
    features += '\n### F-002: Open the reports page\n- **Status:** tested\n- **Test Files:** E2E: `e2e/reports.spec.ts`\n'
    writeFileSync(join(app, 'e2e', 'reports.spec.ts'), 'test\n')
  }
  writeFileSync(join(app, 'docs', 'FEATURES.md'), features)
  writeFileSync(join(app, 'e2e', 'home.spec.ts'), 'test\n')
  git(root, 'add', '-A'); git(root, 'commit', '-qm', 'baseline')
  // the change under test: a brand-new route (a thing a user can newly do)
  writeFileSync(join(app, 'src', 'App.tsx'),
    'export default function App(){return <Route path="/reports" element={<R/>}/> }\n')
  git(root, 'add', '-A'); git(root, 'commit', '-qm', 'add reports route')
  // master == HEAD: this is exactly the state a production deploy of master runs in
  const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf-8' }).trim()
  const master = execFileSync('git', ['rev-parse', 'master'], { cwd: root, encoding: 'utf-8' }).trim()
  assert.equal(head, master, 'fixture precondition: master must equal HEAD')
  return { root, app }
}

function runCheck(app, extraEnv = {}) {
  try {
    const stdout = execFileSync(process.execPath, [CHECK], {
      cwd: app, encoding: 'utf-8', env: { ...process.env, ...extraEnv },
    })
    return { code: 0, out: stdout }
  } catch (e) {
    return { code: e.status ?? 1, out: (e.stdout || '') + (e.stderr || '') }
  }
}

/**
 * A repo whose master carries THREE commits since the last deploy:
 *   A (baseline, registered)  ->  B (adds an UNTESTED new route)  ->  C (docs only)
 * master == HEAD == C, exactly a production deploy of several commits at once. Returns the
 * baseline sha A, which a real deploy would resolve as FUNCTIONALITY_GATE_BASE.
 */
function makeMultiCommitRepo() {
  const root = mkdtempSync(join(tmpdir(), 'dosgate-multi-'))
  const app = join(root, 'app')
  mkdirSync(join(app, 'src'), { recursive: true })
  mkdirSync(join(app, 'docs'), { recursive: true })
  mkdirSync(join(app, 'e2e'), { recursive: true })
  git(root, 'init', '-q', '-b', 'master')
  git(root, 'config', 'user.email', 't@t')
  git(root, 'config', 'user.name', 't')
  git(root, 'config', 'core.autocrlf', 'false')
  // A — baseline: one registered+tested route
  writeFileSync(join(app, 'src', 'App.tsx'), 'export default function App(){return null}\n')
  writeFileSync(join(app, 'docs', 'FEATURES.md'),
    '# Features\n\n### F-001: See the home screen\n- **Test Files:** E2E: `e2e/home.spec.ts`\n')
  writeFileSync(join(app, 'e2e', 'home.spec.ts'), 'test\n')
  git(root, 'add', '-A'); git(root, 'commit', '-qm', 'A baseline')
  const base = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf-8' }).trim()
  // B — a brand-new route with NO row and NO test (the thing the gate must catch)
  writeFileSync(join(app, 'src', 'App.tsx'),
    'export default function App(){return <Route path="/reports" element={<R/>}/> }\n')
  git(root, 'add', '-A'); git(root, 'commit', '-qm', 'B add reports route (untested)')
  // C — docs only, on top: nothing new for the gate to see in THIS commit
  writeFileSync(join(app, 'docs', 'FEATURES.md'),
    '# Features\n\n### F-001: See the home screen\n- **Test Files:** E2E: `e2e/home.spec.ts`\n\n<!-- changelog note -->\n')
  git(root, 'add', '-A'); git(root, 'commit', '-qm', 'C docs note')
  const head = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf-8' }).trim()
  const master = execFileSync('git', ['rev-parse', 'master'], { cwd: root, encoding: 'utf-8' }).trim()
  assert.equal(head, master, 'fixture precondition: master must equal HEAD')
  return { root, app, base }
}

console.log('functionality-gate-diffs.test.mjs')

// ── BUG 1: defaultRange never yields an empty range on a master deploy ────────────────────────
{
  const { root } = makeRepo({ registered: false })
  // the pre-fix range: master...HEAD, which is EMPTY here (documents the bug)
  const emptyDiff = execFileSync('git', ['diff', '--name-only', 'master...HEAD'], { cwd: root, encoding: 'utf-8' }).trim()
  assert.equal(emptyDiff, '', 'precondition: master...HEAD is empty when master == HEAD')
  const range = defaultRange(join(root, 'app'))
  assert.notEqual(range, 'master...HEAD', 'defaultRange must not return the empty master...HEAD')
  assert.notEqual(range, 'origin/master...HEAD')
  const chosenDiff = execFileSync('git', ['diff', '--name-only', range], { cwd: join(root, 'app'), encoding: 'utf-8' }).trim()
  assert.ok(chosenDiff.length > 0, `defaultRange (${range}) must select a non-empty diff, got empty`)
  rmSync(root, { recursive: true, force: true })
  ok('BUG 1 — defaultRange yields a non-empty range when master == HEAD (production deploy)')
}

// ── BUG 1 (env): an explicit production baseline is honoured ──────────────────────────────────
{
  const { root } = makeRepo({ registered: false })
  const base = execFileSync('git', ['rev-parse', 'HEAD~1'], { cwd: root, encoding: 'utf-8' }).trim()
  process.env.FUNCTIONALITY_GATE_BASE = base
  const range = defaultRange(join(root, 'app'))
  delete process.env.FUNCTIONALITY_GATE_BASE
  assert.equal(range, `${base}...HEAD`, 'FUNCTIONALITY_GATE_BASE must be used as the base')
  rmSync(root, { recursive: true, force: true })
  ok('BUG 1 — FUNCTIONALITY_GATE_BASE sets the production baseline')
}

// ── BUG 2: the recogniser SEES a changed app/ file (path join no longer doubles app/) ─────────
{
  const { root, app } = makeRepo({ registered: false })
  const out = execFileSync(process.execPath,
    [RECOGNISE, '--root', app, '--diff', 'HEAD~1...HEAD', '--json'], { cwd: app, encoding: 'utf-8' })
  const rep = JSON.parse(out)
  assert.equal(rep.total, 1, `recogniser must see the 1 changed functionality, saw ${rep.total}`)
  assert.equal(rep.items[0].kind, 'route')
  assert.match(rep.items[0].evidence[0], /^src\/App\.tsx:/, 'evidence path must be app/-relative, not doubled')
  rmSync(root, { recursive: true, force: true })
  ok('BUG 2 — recogniser resolves changed app/ files (no app/app/ double-join)')
}

// ── END TO END: unregistered new functionality is REFUSED on a master deploy ──────────────────
{
  const { root, app } = makeRepo({ registered: false })
  const r = runCheck(app) // no --diff -> exercises defaultRange (bug 1) + recogniser (bug 2)
  assert.equal(r.code, 1, `gate must REFUSE an untested new functionality, exit was ${r.code}\n${r.out}`)
  assert.match(r.out, /Open the page at \/reports/, 'refusal must name the new route it caught')
  assert.match(r.out, /REFUSED/)
  rmSync(root, { recursive: true, force: true })
  ok('E2E — gate refuses an unregistered new functionality on a master deploy (both fixes together)')
}

// ── END TO END: the same change PASSES once it has a row and a test (gate is not always-red) ───
{
  const { root, app } = makeRepo({ registered: true })
  const r = runCheck(app)
  assert.equal(r.code, 0, `gate must PASS when the new functionality is registered+tested, exit was ${r.code}\n${r.out}`)
  rmSync(root, { recursive: true, force: true })
  ok('E2E — gate passes when the new functionality has a row and a real test file')
}

// ── ROW signal-Distribution-OS:c62755a — the gate must span ALL commits since the last deploy ─
// The tip-only fallback (HEAD~1...HEAD) misses any untested functionality that arrived in an
// earlier commit of a multi-commit promotion. Prove the gap AND prove the baseline closes it.
{
  const { root, app, base } = makeMultiCommitRepo()
  // The bug, made visible: with NO baseline the gate diffs HEAD~1...HEAD = the docs-only commit C,
  // sees nothing, and PASSES an untested route that shipped one commit earlier.
  const blind = runCheck(app, { FUNCTIONALITY_GATE_BASE: '' })
  assert.equal(blind.code, 0,
    `precondition: tip-only (HEAD~1...HEAD) must MISS the earlier untested route, exit ${blind.code}\n${blind.out}`)
  // The fix: FUNCTIONALITY_GATE_BASE = the last-deployed sha -> `base...HEAD` spans B and C.
  const seen = runCheck(app, { FUNCTIONALITY_GATE_BASE: base })
  assert.equal(seen.code, 1,
    `gate with the production baseline must CATCH the untested route from an earlier commit, exit ${seen.code}\n${seen.out}`)
  assert.match(seen.out, /Open the page at \/reports/, 'refusal must name the route that shipped unchecked')
  rmSync(root, { recursive: true, force: true })
  ok('ROW c62755a — FUNCTIONALITY_GATE_BASE makes the gate span every commit since the last deploy, not just the tip')
}

// ── ROW signal-Distribution-OS:c62755a — deploy.yml actually WIRES the baseline (the whole gap) ─
// defaultRange already honours FUNCTIONALITY_GATE_BASE; the defect was that the production deploy
// workflow never set it and checked out shallow. Assert the workflow now does both, in order.
{
  const deployYml = join(HERE, '..', '..', '.github', 'workflows', 'deploy.yml')
  const yml = readFileSync(deployYml, 'utf-8')
  // The deploy job runs the gate; find that step and require full history + a baseline write BEFORE it.
  const gateAt = yml.indexOf('check-new-functionality-registered.mjs')
  assert.ok(gateAt > 0, 'deploy.yml must run the functionality gate')
  const before = yml.slice(0, gateAt)
  assert.match(before, /fetch-depth:\s*0/,
    'the deploy checkout must fetch full history (fetch-depth: 0) so ancestor resolution works')
  assert.match(before, /FUNCTIONALITY_GATE_BASE=.*>>\s*"?\$GITHUB_ENV"?/,
    'deploy.yml must write FUNCTIONALITY_GATE_BASE to $GITHUB_ENV before the gate runs')
  ok('ROW c62755a — deploy.yml checks out full history and sets FUNCTIONALITY_GATE_BASE before the gate')
}

console.log(`\n${passed}/7 checks passed`)
assert.equal(passed, 7)
