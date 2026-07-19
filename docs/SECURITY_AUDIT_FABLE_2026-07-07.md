# Distribution-OS — Adversarial Security & Cost-Abuse Audit

**Date:** 2026-07-07
**Auditor:** Fable 5 (Claude Code agent), adversarial backend review
**Scope:** `supabase/functions/**`, `supabase/migrations/**`, `_shared/tier-map.ts`
**Method:** static read of shipped code. No source changed, nothing deployed.
**Attacker goals modeled:** (a) free unlimited LLM calls on our Anthropic key, (b) unpaid access to paid tiers, (c) other-user data access.

---

## TL;DR verdict

- **JWT signature verified in call-ai / ai-proxy? NO.** Both authenticate by base64-decoding `payload.sub`/`payload.exp` with **zero signature check** (`call-ai/index.ts:24-36`, `ai-proxy/index.ts:21-30`). The other functions that *do* it correctly (`stripe-checkout/index.ts:24`, `stripe-portal/index.ts:23`) prove the team knows how — the decode path was a deliberate "avoid auth API rate limits" shortcut (comment `call-ai/index.ts:18`).
- **Stripe webhook: signature IS verified** (`stripe-webhook/index.ts:37`) and grants are idempotent state-sets — this part is sound.
- **RLS: sound.** Every key table is RLS-enabled with `auth.uid() = user_id`; anon cannot read. Cross-user data access is NOT possible via RLS — only via the service-role edge path under a forged token (see H1).
- **Worst finding: C1** — forgeable auth on the Anthropic proxy. Whether it is *remotely* exploitable today hinges on the Supabase gateway `verify_jwt` flag, which is **not reproducible from the repo** (no `config.toml` committed) and which the team's own plan (`docs/SPRINT_0_FIX_PLAN.md:53`, item #24) intended to set to **`false`** — the exact setting that turns C1 into a live, unauthenticated key-drain.

---

## Severity counts

| Severity | Count | Items |
|---|---|---|
| CRITICAL | 2 | C1, C2 |
| HIGH | 3 | H1, H2, H3 |
| MEDIUM | 3 | M1, M2, M3 |
| LOW | 3 | L1, L2, L3 |

---

## SHIP-BLOCKER vs HARDENING

**Ship-blockers (fix before this stays live):** C1, C2, H1 (same root as C1), H3.
**Hardening (should fix, not gating):** H2, M1, M2, M3, L1, L2, L3.

---

## PROVEN findings (verified in shipped code)

### C1 — CRITICAL — Anthropic proxy authenticates with an UNVERIFIED JWT (forged-token bypass → key drain) — *ship-blocker*
**Status:** PROVEN in code. End-to-end remote exploitability = SUSPECTED (depends on gateway `verify_jwt`, see M2).

`call-ai/index.ts:24-36`:
```ts
const token = authHeader.replace('Bearer ', '')
const payload = JSON.parse(atob(token.split('.')[1]))   // DECODE ONLY — no signature check
userId = payload.sub
if (payload.exp && payload.exp * 1000 < Date.now()) { ... 401 }
```
`ai-proxy/index.ts:21-30` is identical. There is **no** `crypto.subtle.verify`, no call to `supabase.auth.getUser()`, no JWT-secret HMAC anywhere in these two functions. `atob(token.split('.')[1])` reads the middle segment of *any* string shaped like `x.y.z`.

**Exploit steps (if the Supabase gateway is NOT verifying JWTs — i.e. `verify_jwt = false`, which is the team's stated intent):**
1. Craft `header.payload.sig` where `payload = {"sub":"<any-uuid>","exp":<far-future>}`. Signature is never checked — put anything in `sig`.
2. `POST /functions/v1/call-ai` (or `/ai-proxy`) with `Authorization: Bearer <forged>` and a body `{model, messages, max_tokens}`.
3. The function bills `ANTHROPIC_API_KEY` (`call-ai/index.ts:79,102-116`). Pick a UUID that maps to a `scale`/paid `user_preferences` row (or any row that doesn't exist → falls back to `free` tier's 25-run quota, then rotate UUIDs) → effectively unlimited calls on our key.

**Contrast (the correct pattern already in the repo):** `stripe-checkout/index.ts:24` and `stripe-portal/index.ts:23` use `admin.auth.getUser(token)`, which validates the signature against the project JWT secret.

**Fix:** Verify the JWT before trusting `sub`. Either (a) call `getSupabaseAdmin().auth.getUser(token)` like the Stripe functions do, or (b) HMAC-verify against the project JWT secret with `crypto.subtle`. Do NOT rely on the gateway alone — verify in-function so the security does not depend on an undocumented deploy flag. The "avoid rate limits" rationale (`call-ai/index.ts:18`) does not justify a forgeable auth boundary in front of a paid API key.

---

### C2 — CRITICAL — `ai-proxy` has ZERO tier/quota enforcement (any authenticated caller = unlimited paid LLM) — *ship-blocker*
**Status:** PROVEN in code. Live iff `ai-proxy` is deployed (SUSPECTED — the frontend now calls only `call-ai`, per `app/src/lib/ai/worker-base.ts:179`; `ai-proxy` is an orphan that is still in the functions tree and therefore almost certainly still deployed/callable).

`ai-proxy/index.ts` runs **no** DB query — no `user_preferences` tier lookup, no `ai_usage` quota count (compare `call-ai/index.ts:47-76` which does). After the decode-only "auth" it forwards straight to Anthropic on `ANTHROPIC_API_KEY` (`ai-proxy/index.ts:42-50`).

**Exploit:** Even *without* forging (C1), any logged-in **free** user's real token decodes fine here and gets **unlimited** calls, bypassing the `call-ai` monthly quota entirely. With forging (C1) it is fully unauthenticated. `model` and `max_tokens` are client-supplied (`ai-proxy/index.ts:32`) with no allowlist → attacker selects the most expensive model + max `max_tokens` for maximum cost per call.

**Fix:** Delete `ai-proxy` if it is dead code (frontend no longer uses it), or bring it to parity with `call-ai` (verified JWT + tier + quota + model allowlist). Confirm it is undeployed: `supabase functions list`.

---

### C1/C2 amplifier — client-controlled `model` and `max_tokens`, no allowlist
`call-ai/index.ts:40,97-99,112` and `ai-proxy/index.ts:32,49`: the caller picks the model (`config.model` from the browser, `worker-base.ts:181`) and `max_tokens`. No server-side allowlist or cap. An attacker requests the priciest model with `max_tokens: 4096`+ per call, multiplying the cost of C1/C2. **Fix:** server-side allowlist of permitted model families and a hard `max_tokens` ceiling per tier.

---

### H1 — HIGH — Service-role queries keyed by the forgeable `userId` → cross-user data access — *ship-blocker (same root as C1)*
**Status:** PROVEN code path; realized only when C1 is exploitable.

`call-ai` runs every query through the **service-role** admin client (`getSupabaseAdmin()`, `call-ai/index.ts:38`), which bypasses RLS, filtered only by `userId` taken from the unverified token:
- `call-ai/index.ts:80-88` reads `user_api_keys.api_key` for that `userId` → **a forged `sub` = read any victim's stored Anthropic BYOK key** (and then bill *their* key, `:86-87`).
- `call-ai/index.ts:47-53` reads the victim's `subscription_tier` → inherit their paid tier.

This is the only cross-user data path in the backend (RLS itself is sound — see "RLS verdict"). It exists purely because the identity (`userId`) is unverified. **Fix:** same as C1 — verify the token; then service-role + `userId` is safe.

---

### H2 — HIGH — BYOK Anthropic keys stored in PLAINTEXT (despite "encrypted" claim) — *hardening*
`supabase/migrations/20260428000001_api_keys_and_usage.sql:3-9`: comment says *"Secure API key storage (BYOK)"* / *"encrypted BYOK storage"* but the column is `api_key TEXT NOT NULL` — cleartext. `call-ai/index.ts:80-88` reads it in the clear. Any DB dump, backup leak, log capture, or the H1 path exposes users' live Anthropic keys. **Fix:** encrypt at rest (pgcrypto/`vault`) or store a reference to Supabase Vault; never return the raw key outside the function.

---

### H3 — HIGH — Hardcoded shared cron secret committed in source — *ship-blocker (rotate)*
`supabase/functions/_shared/log-usage.ts:24`:
```ts
const CRON_SECRET = 'sync-usage-cron-1b101455280a2e66341baf24b4cfe7e3'
```
A live bearer secret is committed to the repo (and shipped to every deployed function bundle). It authorizes writes to the cross-project BackOffice `log-api-usage` endpoint (`:23,50-52`). Anyone with repo/bundle access can forge usage/cost records across all projects sharing this secret. **Fix:** move to `Deno.env.get('BACKOFFICE_CRON_SECRET')`, rotate the secret (a rotation runbook exists per memory `reference_shared_backoffice_cron_secret`), and purge from git history.

---

### M1 — MEDIUM — Auth-email webhook signature check is CONDITIONAL (skippable) — *hardening*
`supabase/functions/send-auth-email/index.ts:233`:
```ts
if (signature && !(await verifySignature(body, signature))) { ...401 }
```
Verification runs only *if the attacker chooses to send* the `x-supabase-webhook-signature` header. **Omit the header entirely and the check is skipped**, then the function sends fully attacker-controlled HTML email to any `payload.user.email` (`:245-252`) from your branded domain. Enables phishing/spam from `distributionos.predivo.ch` and SMTP-quota abuse. The file's own header comment (`:6`) says *"Must verify the webhook signature."* **Fix:** hard-require the signature — reject when the header is absent (`if (!signature || !(await verifySignature(...))) return 401`).

---

### M2 — MEDIUM — No `config.toml` committed → edge-function security settings unmanaged & non-reproducible — *hardening (but gates C1's real-world severity)*
There is **no `supabase/config.toml`** in the repo (verified: file absent; `grep verify_jwt` finds only the plan doc). Consequently the per-function `verify_jwt` state is not in version control and cannot be reproduced or reviewed. `docs/SPRINT_0_FIX_PLAN.md:53` (item #24) explicitly plans to set `verify_jwt = false` — precisely the setting that makes C1 a remote, unauthenticated key-drain. **Fix:** commit `config.toml`; keep `verify_jwt = true` (default) for all functions *except* `stripe-webhook` and `send-auth-email` (which do their own signature checks and legitimately need `verify_jwt = false`); never disable it for `call-ai`/`ai-proxy`. And fix C1 in-function regardless, so security does not depend on this flag.

---

### M3 — MEDIUM/LOW — Error responses leak a wildcard CORS origin — *hardening*
The top-level `catch` in both `call-ai/index.ts:156-159` and `ai-proxy/index.ts:61-65` returns `Access-Control-Allow-Origin: *`, inconsistent with the allowlist used on the success path (`_shared/cors.ts:9-19`). Low impact (no credentials mode), but sloppy. **Fix:** route error responses through `createJsonResponse(req, ...)` too.

---

## Positive / verified-sound

### Stripe webhook — signature verified, grants idempotent — SOUND
`stripe-webhook/index.ts:37` uses `stripe.webhooks.constructEventAsync(body, signature, webhookSecret)` — a raw-body HMAC verify; `webhookSecret` is required at boot (`:8-9`). Entitlement grants are **idempotent state-sets** (`UPDATE ... subscription_tier = <tier> WHERE stripe_customer_id = ...`, `:54-63,73-82,90-99`) — not increments — so replaying an event just re-writes the same tier. Tier is resolved from the *Stripe-side* price IDs (`resolveTier`, `:14-20`), never from client input. This is the correct pattern. (See L1/L2 for minor hardening.)

### RLS — SOUND (no anon or cross-user read on key tables)
All key tables enable RLS and scope every policy to `auth.uid() = user_id`:
- `products`, `tasks`, `week_records`, `user_preferences` — `20260318000000_initial.sql:73-116`
- `inbox_artifacts`, `knowledge_bases` — `20260326000000_inbox_and_knowledge_base.sql:74-95`
- `user_api_keys` (`FOR ALL USING auth.uid() = user_id`) and `ai_usage` (SELECT own only; no user INSERT — writes are service-role only) — `20260428000001_api_keys_and_usage.sql:11-37`

An anon caller has `auth.uid() = null`, so no policy matches → **anon reads nothing**. User A cannot read User B's rows through the data API. The only cross-user exposure is H1, which is an edge-function service-role issue, not an RLS gap.

### Tier/quota not client-forgeable (except via identity)
Tier comes from the DB `user_preferences.subscription_tier` (`call-ai/index.ts:47-53`), never from the request body; quota is a server-side `count(*)` over `ai_usage` (`:59-64`). These are only compromised through the forged *identity* (C1/H1), not by client-supplied tier/quota fields.

---

## LOW / defense-in-depth

- **L1 — Stripe webhook has no explicit idempotency ledger.** Safe today because grants are idempotent state-sets, but adding a processed-`event.id` table would harden against future non-idempotent handlers. *hardening.*
- **L2 — Silent no-op on unmatched customer.** `checkout.session.completed` / `subscription.updated` update `WHERE stripe_customer_id = ...` with no row-count assertion (`stripe-webhook/index.ts:54-63,73-82`); a mismatched customer silently grants nothing and returns 200. Add a matched-row check + alert. *hardening.*
- **L3 — Decode path checks only `exp`.** No `aud`/`iss`/`role` validation (`call-ai/index.ts:27-33`); once C1 is fixed by real verification this is moot, but a `role !== 'anon'`/`aud` check is good hygiene. *hardening.*

---

## PROVEN vs SUSPECTED summary

| # | Finding | Proven from code? | What is SUSPECTED |
|---|---|---|---|
| C1 | Decode-only JWT auth on call-ai & ai-proxy | **PROVEN** | Remote unauthenticated exploitability depends on deployed gateway `verify_jwt` (not in repo) |
| C2 | ai-proxy has no quota/tier at all | **PROVEN** | Whether ai-proxy is still deployed/live |
| H1 | Service-role queries keyed by forgeable userId | **PROVEN** (code path) | Only realized when C1 is exploitable |
| H2 | BYOK keys stored plaintext | **PROVEN** | — |
| H3 | Hardcoded cron secret in source | **PROVEN** | — |
| M1 | Auth-email signature check skippable | **PROVEN** | — |
| M2 | No config.toml / verify_jwt unmanaged | **PROVEN** (absence) | Actual deployed flag value |
| Stripe webhook verified + idempotent | **PROVEN** | — |
| RLS sound / no anon or cross-user read | **PROVEN** | — |

---

## Recommended remediation order

1. **C1 + H1** — add real JWT signature verification to `call-ai` (and delete or harden `ai-proxy` = **C2**). One fix closes the drain and the cross-user path.
2. **C2** — confirm `ai-proxy` is undeployed or remove it.
3. **H3** — rotate + env-var the BackOffice cron secret; purge from history.
4. **M2** — commit `config.toml` with `verify_jwt` correctly set per function.
5. **M1** — make the auth-email signature mandatory.
6. **H2** — encrypt BYOK keys at rest.
7. Hardening: model/`max_tokens` allowlist, M3 CORS, L1/L2/L3.
