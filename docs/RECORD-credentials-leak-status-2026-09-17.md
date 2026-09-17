# Distribution-OS credentials-leak — status measured 2026-09-17

Board row: `credentials-file-rendered-into-a-transcript-distribution` (weight **critical**, opened 2026-09-14).
Original alarm: a live Stripe key and "six other passwords" from `docs/Credentials.txt` were rendered
into a Claude session transcript.

**This document contains no secret values — only SHA-256 digest *prefixes*, line numbers, counts and
HTTP/exit codes. Every "measured this turn" claim was checked on 2026-09-17; everything else is cited
to the dated record that measured it (a lead, newest-wins, never re-asserted as fresh truth).**

---

## 1. The row's framing understates the surface — measured this turn

`safe-inspect scan docs/Credentials.txt` (no values rendered) reports the file is **223 lines / 15,545
bytes** and holds **70 credential-looking values**, not seven. By shape:

- **1 Stripe key** (digest `02e1a025…`, lines 46 + 107 — one value, duplicated)
- **1 Anthropic API key** (digest `b45263f3…`, line 63)
- **3 distinct Supabase management PATs** (`edc98441…`, `a6bbf14f…`, `8f668e0e…`)
- **3 distinct Supabase secret keys** (`244028d0…` ×2, `857a4eb4…`)
- **6 JWTs** (anon/service tokens)
- **~40 shorter passwords / high-entropy values** across many services (mailboxes, FTP, etc.)

So the incident is a **full estate credential dump**, and remediation = rotating whatever in it is
still live. That is a credential action; see §4.

## 2. The leak VECTOR is mechanically shut — measured this turn

- **Not in git, never was.** `git ls-files docs/Credentials.txt` → empty; `git log --all -- docs/Credentials.txt`
  → empty. `.gitignore` lines 8–9 name `docs/cred.txt` and `docs/Credentials.txt`; `git check-ignore`
  resolves the file to `.gitignore:9`. The file **cannot enter git**.
- **The render guard is live and it fired on me.** A `git` Bash command that merely *named* the file was
  **blocked this session** by `C:\ClaudeShared\hooks\safe-inspect.mjs` + the Bash/Read secret guard
  ("SECRET RENDER BLOCKED … THE TRIGGER IS THE ACTION OF DISPLAYING"). The recurring "a session prints
  the file into a transcript" vector is mechanically closed.
- **Durable regression proof:** `docs/credentials-file-cannot-leak-via-git.test.mjs` (5 assertions,
  exits 0 this turn) locks in: file untracked, never in history, gitignored, guard module present. It
  never reads the file's contents.

## 3. What is already neutralised (cited to prior measurements, newest-wins)

- **Stripe live secret key — DEAD.** `GET /v1/balance` → HTTP 401, measured independently 2026-09-09,
  2026-09-15 and 2026-09-16. Money movement — the one truly dangerous exposure — is gone.
- **Metanet FTP password — DEAD.** Board row `rotate-the-metanet-ftp-password-it-sat-in-a-memory-file`
  closed **done** 2026-09-16 (`standards/metanet-ftp-old-password-is-dead.test.mjs`: live FTP login with
  the old value → exit 67 / "530 Login incorrect"). **This supersedes the 2026-09-16 closeout doc's
  "FTP still live, blocked on dead panel" conclusion**, which was written before the rotation was
  recorded (rotation happened 2026-09-15 ~08:29Z; see
  `standards/reference_metanet_ftp_leak_verified_dead_and_standards_is_now_git_2026_09_16.md`).
- **Three mailbox passwords — ROTATED** via the webmail "second door" (Roundcube `password` plugin),
  per `standards/RECORD-the-panel-is-not-the-only-door-mailbox-rotations-2026-09-15.md`.
- **Supabase management PATs — prior art records the fleet PATs as already HTTP 401** (not re-measured
  this turn).

## 4. What remains — and why it is Roger's, not mine

The **Anthropic API key**, the **Supabase secret keys**, the **JWT service tokens**, and the assorted
**service passwords** in this file were **not proven dead this turn**. Rotating any that are still live
is a **credential action reserved to Roger** (each is a secret only he can revoke/reissue in the
relevant vendor console), and probing several for liveness is blocked here by the anti-spend guard.
This is one of the five decisions the worker boundary explicitly leaves to him.

Therefore this row is **parked for Roger**, not auto-closed: a critical security row about leaked
credentials cannot honestly read "done" while high-value keys in the dump are plausibly still live and
only he can rotate them.

## Bottom line

The **leak vector** (render-into-transcript + git) is closed and proven by a passing test; the **money
exposure** (Stripe) and the **Metanet FTP** password are dead; **mailboxes** are rotated. What is left
is a **credential-rotation pass Roger owns** over the remaining live keys in `docs/Credentials.txt`
(Anthropic key, Supabase secret keys, service JWTs, misc passwords). Once he confirms those are rotated
or accepts them as dead, this row closes.
