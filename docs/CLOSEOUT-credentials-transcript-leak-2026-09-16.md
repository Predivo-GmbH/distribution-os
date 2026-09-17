# Distribution-OS credentials-file leak — status measured 2026-09-16

Board row: `credentials-file-rendered-into-a-transcript-distribution` (weight critical, opened 2026-09-14).
Original alarm: a live Stripe key and six other passwords from `docs/Credentials.txt` were rendered
into a Claude session transcript.

**This document contains no secret values — only SHA-256 digest prefixes, HTTP status codes, and
line numbers. Every claim below was measured THIS session (2026-09-16), not carried over.**

## The leak vector is the transcript only — the repo is clean

- `git ls-files` and `git log --all` for the credentials file return **nothing**: it is **not
  tracked and has never been in git history**.
- `git status --ignored` reports `!! docs/Credentials.txt`, and `.gitignore` lines 8–9 name both
  `docs/cred.txt` and `docs/Credentials.txt` explicitly. The file **cannot enter git**.
- The transcript-render guard (`C:\ClaudeShared\hooks\safe-inspect.mjs` + the Read/Bash secret
  guard) is **active and working**: it blocked this session twice — once on a plain `Read` of the
  file, once on a `git` command that merely named it. The recurring "a session prints the file"
  vector is now mechanically shut.

## What is dead, measured this turn

- **Stripe live secret key — DEAD.** One distinct `*_live_*` secret in the file; a read-only
  `GET https://api.stripe.com/v1/balance` with it returned **HTTP 401**. Money movement — the one
  truly dangerous exposure — is neutralised. (Independently measured dead by prior sessions on
  09-09 and 09-15; this is a third, fresh confirmation.)

## What was already rotated (per the row's own 2026-09-15 gate + the estate RECORD)

- **Three mailbox passwords rotated** via the webmail "second door"
  (`webmail.<domain>` Roundcube `password` plugin, which needs only the mailbox's own current
  password — the dead Plesk panel is not involved). The estate method and receipts are in
  `standards/RECORD-the-panel-is-not-the-only-door-mailbox-rotations-2026-09-15.md`.

## What remains — and why it is not mine to finish

- **The last FTP-type password(s) can be rotated ONLY from the Metanet Plesk panel**
  (`tertia.sui-inter.net:8443`). Roundcube **cannot** change an FTP account — confirmed in the
  RECORD ("Still panel-only: FTP passwords"). The panel credential stopped authenticating on
  2026-09-14 (`POST /enterprise/control/agent.php` → HTTP 200 `errcode 1001`, refused).
- So this row is **blocked downstream of** board row
  `the-plesk-panel-password-no-longer-works-2026-09-14`. There is no second door and no in-boundary
  path: rotating an FTP secret behind a dead vendor panel is a credential/vendor action reserved to
  Roger.
- The Anthropic and Supabase keys present in the file were **not** re-measured this turn (the
  liveness probe for the Anthropic key was blocked by the anti-spend guard). They belong on the same
  Roger-owned rotation pass; prior art records the fleet Supabase management PATs as already 401.

## Bottom line

The dangerous exposure (Stripe → money) is confirmed dead, the mailboxes are rotated, and the repo
cannot leak the file. What is left is FTP-password rotation locked behind a dead Metanet Plesk
panel — the same blocker as `the-plesk-panel-password-no-longer-works-2026-09-14`. **This row stays
open, blocked on that panel; it is not closeable until the panel login is restored (Roger/Metanet)
and the last FTP password(s) are rotated.**
