# RECORD — "Distribution-OS staging has no payment or AI keys, so its gates cannot test either"

- **Row:** `distribution-os-staging-has-no-stripe-or-ai-secrets` (opened 2026-09-14)
- **Closed:** 2026-09-16, by a worker session (internal tool — Distribution-OS — is a worker's to decide, not Roger's gate)
- **Finish-test (machine-checkable):** `.github/scripts/prove-function-answers.test.mjs` — 34 passed / 0 failed, exit 0, plain `node` (no flags), no network, no CI dependency.

## What the row claimed
Distribution-OS **staging** holds no Stripe secret and no paid AI key, so staging's gates
cannot exercise the payment or AI paths.

## What is actually true, measured 2026-09-16
The claim is correct as a statement of fact — and it is **by design**, not a bug. Three
distinct questions were tangled inside it; each is now resolved and the resolution is landed
on `origin/master` (which is `origin/HEAD`), the main copy.

### 1. The only real defect — the staging deploy gate reddened on a secret it was never given — is FIXED
`stripe-webhook`, `stripe-checkout`, `stripe-portal` read `STRIPE_SECRET_KEY` /
`STRIPE_WEBHOOK_SECRET` at **module scope** and throw on cold start when absent, so they
500 on every request on staging (which holds neither; production holds both and answers
fine). The "Prove the function answers" health-ping in `deploy-edge-functions.yml` could not
tell that environment gap apart from a real regression and went red on a healthy staging
deploy (run 34905661399).

Fixed by PR #7 (commit `2eb3f7d`, on `origin/master`):
- `.github/scripts/prove-function-answers.mjs` — a pure `classify()` with four rules that no
  declaration can bend: **production is never exempt**; a 404 fails everywhere; on staging
  only a genuine 5xx from a **declared** function is `NOT_PROVEN` (loud, but does not redden);
  a declared function that starts answering normally is flagged as a possibly-stale exemption.
- `.github/staging-cannot-prove.json` — the declared, dated, reviewed exemption list. Exactly
  three entries (the three Stripe functions above) — the only functions that throw at module
  scope. Every AI-key / BYOK read is lazy, behind an `Authorization` check the unauthenticated
  probe never passes, so those functions already answer 401 on staging regardless and were
  never failing this gate.
- `.github/scripts/prove-function-answers.test.mjs` — 34 pure-logic assertions, run on every
  push, that also parse the real declaration file and check every entry is well-formed.

This is CI config: it is effective the moment it is on `master`. It needs no production deploy
and serves no customers, so there is nothing to promote.

### 2. Paid AI keys on staging — SETTLED "no" by a standing rule, not re-asked here
Roger's standing rule, 2026-08-29: the Anthropic key is only for what a **customer** triggers
inside a product; staging serves no customers, and a staging AI key was measured with non-zero
daily cost against a ceiling of zero. So the AI call path is permanently un-provable end-to-end
on staging **by policy, not by bug**. Recorded under `standing_decisions` in
`staging-cannot-prove.json`. Changing this would be changing what a rule means — Roger's, and
not in question.

### 3. The payment and AI paths ARE tested in CI — just not on staging
`app/e2e/critical-path.spec.ts` (Tier 2: `stripe-checkout` returns a checkout URL or the
expected 400, `stripe-webhook` rejects unsigned requests, `call-ai` writes to `ai_usage`) runs
in `.github/workflows/test.yml` on every push/PR to `master`, against the **real backend**
which holds the keys. Staging deliberately runs only the frontend smoke + public-page specs
(zero backend calls) so a staging deploy never writes to any database. Coverage of payment and
AI is not missing from the product's gates; it lives on the environment that holds the keys.

## The one genuinely-open item — and why it is not a blocker, and not mine to action
Provisioning **Stripe TEST-MODE** keys (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, the three
price IDs) directly onto the staging Supabase project (`jckctrtkstejolddqzlk`) would let staging
exercise the Stripe path end-to-end. It costs nothing per use. It is recorded as an **OPEN
recommendation** in `staging-cannot-prove.json` and was deliberately **not actioned**: minting a
key and writing it into a payment integration's function environment is a credential act, which
is Roger's. It is a recommendation, not a gate — the deploy gate is honest and green without it.
When/if those keys are provisioned by hand, delete the three exemption entries one at a time as
each function stops throwing.

## Why this closes as a worker's call
Distribution-OS is an internal tool; per the standing boundary, promoting/closing internal-tool
work is the worker's. The real defect is fixed and on `master`; the AI-key question is settled by
Roger's own rule; the payment/AI paths are covered by `test.yml`; the only residual is an
optional credential recommendation already recorded for him. Nothing here spends money, sends
anything outside, deletes anything of his, changes what a rule means, or needs a second factor.

## Proofs
- Finish-test: `.github/scripts/prove-function-answers.test.mjs` → 34 passed / 0 failed (exit 0).
- Fix landed: commit `2eb3f7d` "Stop the staging deploy gate reddening on a secret it was never given (#7)" on `origin/master`.
- Coverage: `.github/workflows/test.yml` runs `critical-path.spec.ts` (Stripe + ai_usage) against the real backend.
