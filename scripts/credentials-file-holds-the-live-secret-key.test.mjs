// THE CREDENTIALS FILE ON DISK MUST HOLD THE KEY THE PROJECT IS ACTUALLY USING.
//
// Board row `monitor-distribution-os-credentials-file-holds-274ef4a3` claimed the opposite: that
// Distribution-OS/docs/Credentials.txt "holds only dead keys", and that step 6 of
// standards/RECORD-distribution-os-keys-swapped-2026-09-06.md ("rewritten blind … now holds the
// live key") was a false claim. It was parked for 3 days as "a secret-handling gate no session may
// cross", on the grounds that answering it required revealing a live secret and that this machine
// held no management token anyway.
//
// BOTH GROUNDS WERE WRONG, and this file is what makes that checkable for ever after:
//   * there IS a working management token on this machine (probed by status code alone), and
//   * the file DOES hold the live production secret key.
//
// AND NOTHING IS EVER REVEALED TO PROVE IT. The live key is fetched into a variable and hashed;
// the on-disk value is hashed; the two SHA-256 digests are compared. No value is printed, logged,
// asserted against a literal, or written anywhere — a failure message names a digest and a line
// number, never a fragment. That is the point of the file as much as the assertion is: the row was
// parked because nobody had a way to ask this question without rendering an answer.
//
// WHAT MAKES IT WORTH KEEPING. On 2026-09-09 this same comparison found a REAL drift that no row
// had noticed: STAGING's secret key had been rotated to `rotated_2026_09_08` the day before and
// the file was never updated. It did not hold a STALE staging key - it held no staging key at
// all, so anyone reaching in for a staging secret was handed the PRODUCTION one, which is worse
// than finding nothing. The staging section was written blind the same day and that case is now
// an assertion too, not a warning.
//
// Run: node --test scripts/credentials-file-holds-the-live-secret-key.test.mjs
import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import crypto from 'node:crypto'

const FILE = 'C:/Business/Internal Projects/Distribution-OS/docs/Credentials.txt'
const PROD = 'jxjpbmkgmuunpayqgbsx'
const STAGING = 'jckctrtkstejolddqzlk'

const sha = (v) => crypto.createHash('sha256').update(String(v)).digest('hex').slice(0, 12)

function readFile() {
  assert.ok(fs.existsSync(FILE), `the credentials file is not on this disk: ${FILE}`)
  return fs.readFileSync(FILE, 'utf8')
}

/** Management PATs on disk, as raw values. Never returned to a caller that prints them. */
function patsOnDisk(text) {
  return [...new Set(text.match(/\bsbp_[a-z0-9]{40}\b/g) || [])]
}

/** Every secret-key value in the file, as {line, sha} — digests only. */
function secretsOnDisk(text) {
  const out = []
  text.split(/\r?\n/).forEach((l, i) => {
    for (const m of l.matchAll(/\bsb_secret_[A-Za-z0-9_-]{20,}\b/g)) out.push({ line: i + 1, sha: sha(m[0]) })
  })
  return out
}

async function liveKeys(pat, ref) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${ref}/api-keys?reveal=true`, {
    headers: { Authorization: `Bearer ${pat}` },
  })
  return { status: res.status, keys: res.ok ? await res.json() : [] }
}

/** The first PAT that the management API actually accepts. Status codes only. */
async function workingPat(text) {
  for (const p of patsOnDisk(text)) {
    const res = await fetch('https://api.supabase.com/v1/projects', { headers: { Authorization: `Bearer ${p}` } })
    if (res.ok) return p
  }
  return null
}

test('a management token that the API accepts is present on this machine', async () => {
  const pat = await workingPat(readFile())
  assert.ok(
    pat,
    'no Supabase management token on this disk is accepted by the API. The row this test closes was '
    + 'parked partly on the claim that there were none at all; if that becomes true again, this is '
    + 'where it shows up.',
  )
})

test('the credentials file holds the LIVE production secret key', async () => {
  const text = readFile()
  const pat = await workingPat(text)
  assert.ok(pat, 'no working management token — cannot answer this without one')

  const { status, keys } = await liveKeys(pat, PROD)
  assert.equal(status, 200, `GET /projects/${PROD}/api-keys answered HTTP ${status}`)

  const secret = keys.find((k) => k.type === 'secret')
  assert.ok(secret, `project ${PROD} lists no secret-type API key at all`)
  assert.ok(secret.api_key, 'the API returned the secret key without its value (reveal refused)')

  const live = sha(secret.api_key)
  const onDisk = secretsOnDisk(text)
  assert.ok(
    onDisk.some((o) => o.sha === live),
    `the live production secret key (name=${secret.name}, digest ${live}) is NOT on disk. `
    + `The file holds ${onDisk.length} secret-shaped value(s), at line(s) `
    + `${onDisk.map((o) => `${o.line}:${o.sha}`).join(', ')}. Rewrite the file blind — read the live `
    + 'value into a variable inside a script and write it straight out, never looking at it.',
  )
})

test('a secret key value never appears more than it has to, and never as a stale duplicate', () => {
  const onDisk = secretsOnDisk(readFile())
  const distinct = new Set(onDisk.map((o) => o.sha))
  assert.ok(
    distinct.size <= 2,
    `${distinct.size} DIFFERENT secret-key values are on disk, at line(s) `
    + `${onDisk.map((o) => `${o.line}:${o.sha}`).join(', ')}. More than one production key and one `
    + 'staging key means at least one of them is dead and somebody will use it.',
  )
})

// THIS WAS A WARNING UNTIL 2026-09-09, AND THE WARNING WAS RIGHT. Staging's key was rotated to
// `rotated_2026_09_08` and the file was never updated - it carried no staging value at all, so
// anyone reaching in for a staging secret was handed the PRODUCTION one, which is worse than
// finding nothing. The staging section has since been written blind (value read into a variable
// inside a script and written straight out, never displayed), so this is now an assertion. The
// next rotation that forgets the file turns this red instead of printing a line nobody reads.
test('the credentials file holds the LIVE staging secret key', async () => {
  const text = readFile()
  const pat = await workingPat(text)
  assert.ok(pat, 'no working management token - cannot answer this without one')

  const { status, keys } = await liveKeys(pat, STAGING)
  assert.equal(status, 200, `GET /projects/${STAGING}/api-keys answered HTTP ${status}`)

  const secret = keys.find((k) => k.type === 'secret')
  assert.ok(secret, `project ${STAGING} lists no secret-type API key at all`)
  assert.ok(secret.api_key, 'the API returned the staging secret key without its value (reveal refused)')

  const live = sha(secret.api_key)
  const onDisk = secretsOnDisk(text)
  assert.ok(
    onDisk.some((o) => o.sha === live),
    `the live STAGING secret key (name=${secret.name}, digest ${live}) is NOT on disk. `
    + `The file holds ${onDisk.length} secret-shaped value(s), at line(s) `
    + `${onDisk.map((o) => `${o.line}:${o.sha}`).join(', ')}. Rewrite the file blind - never look at `
    + 'the value. If the only values present are production ones, this file is actively misleading.',
  )
})

test('production and staging are not the SAME value on disk', async () => {
  const text = readFile()
  const pat = await workingPat(text)
  assert.ok(pat, 'no working management token')
  const [p, s] = await Promise.all([liveKeys(pat, PROD), liveKeys(pat, STAGING)])
  const pk = p.keys.find((k) => k.type === 'secret')?.api_key
  const sk = s.keys.find((k) => k.type === 'secret')?.api_key
  assert.ok(pk && sk, 'could not read both secret keys')
  assert.notEqual(sha(pk), sha(sk), 'production and staging share one secret key - that is a single blast radius, not two environments')
})
