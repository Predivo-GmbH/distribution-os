# The functionality gate was blind on production deploys — two diff defects, both fixed

**Row:** `signal-Distribution-OS:0f58487:functionality-gate-diffs-`
**Date:** 2026-09-17
**Repo:** Distribution-OS · branch `fix/functionality-gate-diffs` (off `origin/master`)

## What was wrong

The "nothing new ships untested" gate (installed 2026-09-17, commit `0f58487`, wired into
`.github/workflows/deploy.yml` as a **BLOCKING** step) had two faults that, together, made it a
guaranteed no-op on the exact event it was built to guard — a production deploy. Both were still
present on `origin/master` (the later `5f5aaa8` "path fixed" only fixed the script's *own* URL→path
conversion for spaces, a different bug).

### Bug 1 — empty range on every production deploy
`defaultRange()` in `app/scripts/check-new-functionality-registered.mjs` returned
`` `${base}...HEAD` `` for the first of `origin/main`, `origin/master`, `main`, `master` that
resolved. On a production deploy the checkout **is** master, so `master...HEAD` compares a commit
against itself — an **empty range**. The gate saw zero changes and passed everything.

### Bug 2 — every changed file skipped (app/ path join)
The recogniser (`app/scripts/recognise-functionality.mjs`) runs from `app/` with `ROOT = <repo>/app`,
but `git diff` prints paths relative to the **repo root** (`app/src/Foo.tsx`). The code did
`join(ROOT, 'app/src/Foo.tsx')` → `<repo>/app/app/src/Foo.tsx`, which never exists, so `existsSync`
was always false and **every changed file was silently skipped**.

### Reproduced live (before the fix)
A throwaway repo where a commit adds a brand-new `<Route path="/reports">`:
- `recognise --diff master...HEAD` (what a master deploy computes) → `total: 0`
- `recognise --diff HEAD~1...HEAD` (a *real* non-empty range) → still `total: 0` (app/ double-join)

A gate that just gained a new page reported **nothing** either way.

## The fix

1. **`recognise-functionality.mjs`** — `git diff` now runs with `--relative`, which both strips the
   `app/` prefix and scopes the diff to this product's subtree. A changed `app/src/Foo.tsx` arrives
   as `src/Foo.tsx` and `join(ROOT, …)` resolves correctly.
2. **`check-new-functionality-registered.mjs`** — `defaultRange()` now skips any candidate base that
   resolves to the same commit as `HEAD` (an empty range is useless), honours an explicit
   `FUNCTIONALITY_GATE_BASE` env (so the deploy workflow can pass the last-deployed production sha
   for full multi-commit coverage), and falls back to `HEAD~1...HEAD` — never empty. The CLI body is
   now guarded by `IS_CLI` so `defaultRange` can be unit-imported without running the gate.

## Proof

`app/scripts/functionality-gate-diffs.test.mjs` — a hermetic suite that builds throwaway git repos
(with `master == HEAD`, the production-deploy condition) and drives the **real** scripts. 5/5 checks,
exit 0:
- Bug 1: `defaultRange` yields a non-empty range when `master == HEAD`.
- Bug 1: `FUNCTIONALITY_GATE_BASE` sets the baseline.
- Bug 2: the recogniser resolves changed `app/` files (evidence `src/App.tsx:1`, no double-join).
- E2E: an unregistered new functionality is **refused** on a master deploy (both fixes together).
- E2E: the same change **passes** once it has a row and a real test file (the gate is not always-red).

## Scope note
The gate step lives in `deploy.yml` on the gate branch, not yet on `origin/master`; this fix repairs
the scripts on master so that whenever the wiring merges, the gate actually inspects the change. The
proof here is the test suite (internal work), not a live deploy.
