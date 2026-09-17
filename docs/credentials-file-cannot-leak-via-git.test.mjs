// Regression guard for board row `credentials-file-rendered-into-a-transcript-distribution`.
//
// The original incident: docs/Credentials.txt (a plaintext credential dump) was rendered into a
// Claude session transcript, and the fear was that it could also reach git and travel further.
// This suite proves the GIT leak vector stays mechanically shut. It never reads or prints the
// file's contents — only its git tracking / ignore status and existence.
//
// It is the closeable, in-boundary half of the incident. It does NOT prove the leaked credential
// VALUES are all dead — rotating the still-live ones is a credential action reserved to Roger and
// is tracked in docs/RECORD-credentials-leak-status-2026-09-17.md.
//
// Run: node docs/credentials-file-cannot-leak-via-git.test.mjs   (exits 0 on pass)

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const CRED = 'docs/Credentials.txt'
const git = (args) =>
  execFileSync('git', ['-C', REPO, ...args], { encoding: 'utf8' }).trim()

test('the credentials file exists in the working tree (so this test is meaningful)', () => {
  assert.ok(existsSync(resolve(REPO, CRED)),
    `${CRED} not present — if it was intentionally removed, delete this test too`)
})

test('the credentials file is NOT tracked by git', () => {
  const tracked = git(['ls-files', CRED])
  assert.equal(tracked, '', `${CRED} is tracked by git — it must never be committed`)
})

test('the credentials file has NEVER been in git history (any branch)', () => {
  const hist = git(['log', '--all', '--oneline', '--', CRED])
  assert.equal(hist, '', `${CRED} appears in git history — it leaked into a commit`)
})

test('the credentials file is matched by a .gitignore rule', () => {
  // git check-ignore exits 1 (throws) when the path is NOT ignored.
  let ignored = ''
  try {
    ignored = git(['check-ignore', '-v', CRED])
  } catch {
    ignored = ''
  }
  assert.match(ignored, /\.gitignore:\d+:.*Credentials\.txt/,
    `${CRED} is not covered by a .gitignore rule — it could be accidentally added`)
})

test('the transcript-render guard module is present on this machine', () => {
  assert.ok(existsSync('C:/ClaudeShared/hooks/safe-inspect.mjs'),
    'safe-inspect.mjs guard is missing — the render-into-transcript vector is unguarded')
})
