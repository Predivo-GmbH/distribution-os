# Rotate the four Distribution-OS Supabase keys printed into a transcript (2026-09-02)

Board item: `four-distribution-os-keys-were-printed-into-a-chat-and-n`
Canonical procedure this runbook obeys (do **not** copy it here): `C:\Business\Internal Projects\standards\credential-rotation-standard.md` — especially §3g (compare consumers by **digest**, never by reading a secret back) and the "delivery over acceptance" note.

**This runbook is diagnosis + procedure only. It stops at Roger's desk on purpose.** The swap itself needs a Supabase dashboard sign-in and disables/creates live keys that live scheduled jobs use, so **when it happens is Roger's call**, not an agent's. Nothing below was executed.

---

## What happened (measured, not assumed)

On 2026-09-02 a read-only diagnosis subagent — explicitly told never to print a secret — rendered four Distribution-OS keys in full out of `docs/Credentials.txt`: the **service-role key**, the **anon key**, the **publishable key**, the **secret key**. It self-reported and stopped.

The lesson recorded on the board is **not** "instruct the subagent harder." The parent's own conclusion: delegating credential-adjacent work at all was the mistake. An instruction is not a control. Credential-touching work stays with the agent that owns the rule, or is done by a mechanism that *cannot* print — a count, a digest, or a pipe from a variable straight to its destination.

## Containment — re-verified 2026-09-05, not trusted from the 09-02 note

| Claim (09-02) | Re-check (09-05) | Result |
|---|---|---|
| Not in any git repo | `git ls-files docs/Credentials.txt` → empty | ✔ not tracked |
| Nothing committed | `git log --all -- docs/Credentials.txt docs/cred.txt` → empty | ✔ never committed on any branch |
| — | `.gitignore` lines 8–9 ignore `docs/cred.txt` + `docs/Credentials.txt` | ✔ cannot be committed by accident |
| Subagent output 0 bytes, temp dir, parent never read it | (as reported 09-02; nothing published downstream) | unchanged |

**Realistic exposure = the transcript, not a published file.** Same shape as the ReplyFlow / SignalScore service-role leaks already on the board. There is no history to rewrite and no public artifact to scrub.

## Scope — which of the four actually need rotating

Rotate for the sake of the risk, not for symmetry.

| Leaked key | Kind | Rotate? | Why |
|---|---|---|---|
| **service-role** | legacy `service_role` JWT | **YES** | Bypasses row-level security entirely. The one that matters most. |
| **secret key** | new `sb_secret_…` | **YES** | Privileged; full DB access. Operationally this is `SB_SECRET_KEY`. |
| anon key | legacy anon JWT | **no** | Ships inside the website bundle by design; RLS-protected. `gitleaks.yml:5` says so explicitly. |
| publishable key | new `sb_publishable_…` | **no** | Same — public by design, ships in the client. |

Rotating anon/publishable would force a client rebuild + redeploy and a new GitHub/edge secret for zero security gain. Leave them.

## Consumer inventory of the two privileged keys (enumerated 2026-09-05)

The privileged key is read in code at `supabase/functions/_shared/supabaseAdmin.ts:11` and `_shared/error-log.ts:34` as:
`Deno.env.get('SB_SECRET_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')`
The comment there records the migration: **the new `SB_SECRET_KEY` is preferred; the auto-injected `SUPABASE_SERVICE_ROLE_KEY` stops working once legacy API keys are disabled on the project.**

So the privileged key lives in exactly two places you control:

1. **Supabase Edge Function secret `SB_SECRET_KEY`** (the `sb_secret_…` value).
   - Consumed by every admin edge function: `call-ai`, `save-api-key`, `send-auth-email`, `stripe-checkout`, `stripe-portal`, `stripe-webhook`.
   - Managed in the Supabase dashboard (Project → Edge Functions → Secrets) or `supabase secrets set`. **Not** a GitHub secret.
2. **GitHub repo secret `SUPABASE_SECRET_KEY`** on `Arivioo/distribution-os` (set 2026-06-12).
   - Consumed only by CI: `.github/workflows/test.yml:137` maps it to `SUPABASE_SERVICE_ROLE_KEY` for the test job.

The **legacy `service_role` JWT** has no *named* consumer to update — it is only the auto-injected fallback in the two files above. Its "fix" is to disable legacy API keys on the project once `SB_SECRET_KEY` is proven to be the sole live path (the code already prefers it).

Not in scope: `SUPABASE_ANON_KEY`, `VITE_SUPABASE_ANON_KEY` (public), `STAGING_VITE_SUPABASE_*` (the **staging** Supabase project is a *separate* project — the leak was prod keys), `SUPABASE_ACCESS_TOKEN` (management PAT, already rotated 2026-08-29).

> Before the swap, run one wider check so a cross-repo consumer can't be missed silently (this is how Cockpit's morning report broke on 09-03): for each org repo, `gh secret list` and look for any secret naming the Distribution-OS project.
>
> **CORRECTION 2026-09-06 — this check was run and it found nothing because it looked at nothing.** The obvious way to write it, `gh repo list Arivioo`, returns **zero repos**: `Arivioo` is a redirect alias, not a real account (`gh api orgs/Arivioo/repos` -> 404, `users/Arivioo/repos` -> empty). Every *direct* `-R Arivioo/<repo>` call still follows the redirect and works, so nothing looks broken — the loop just iterates an empty list and reports a clean bill of health. The real owner is `Predivo-GmbH` (27 repos). Enumerate what the token can actually see:
>
> ```sh
> for r in $(gh api "user/repos?per_page=100&affiliation=owner,collaborator,organization_member" -q '.[].full_name'); do
>   out=$(gh secret list -R "$r" 2>/dev/null | grep -iE "distributionos|DIST_|SUPABASE_SECRET")
>   [ -n "$out" ] && { echo "[$r]"; echo "$out"; }
> done
> ```
>
> Run correctly on 2026-09-06 this returns **two** consumers, not one:
> `Predivo-GmbH/distribution-os` (`SUPABASE_SECRET_KEY`) **and `Predivo-GmbH/production-monitor` (`DISTRIBUTIONOS_SERVICE_ROLE_KEY`, set 2026-07-23)**.
> The swap ran at 16:39Z on 2026-09-06 and updated only the first. The monitor's key was revoked underneath it and the hourly production watch went red on Distribution-OS at 16:38Z and 17:05Z with `Failed to create test user: Unregistered API key` — the missed consumer surfacing exactly where step 5 predicts it. Restored 17:28:53Z from the same project's `rotated_2026_09_06` secret key, 200-verified before setting. **Any sweep in any runbook that enumerates repos by the `Arivioo` name is reporting on an empty list — fix it there too.**

## The swap — order matters (a revoked key that something still uses fails **silently**)

Run at a time **Roger picks** (live scheduled jobs use these keys). Never let a key value touch a command line, a chat message, or a printed file — read it from the dashboard straight into `gh secret set --body -` via stdin, or paste it only into the dashboard field.

1. **Create replacements, keep the old ones alive.** In the Supabase dashboard, create a new `sb_secret_…` secret key (and, if legacy keys are still enabled, prepare to rotate the legacy service_role). Do **not** disable anything yet.
2. **Update every consumer from the dashboard value:**
   - `SB_SECRET_KEY` edge-function secret → new value.
   - `gh secret set SUPABASE_SECRET_KEY --repo Arivioo/distribution-os` (value piped from a variable, never echoed).
3. **Verify BEFORE revoking.** Dispatch what exercises the key: `deploy-edge-functions.yml` (or re-run `test.yml`), confirm green; and confirm the product still signs a user in (`send-auth-email` path) on `distributionos.predivo.ch`. Use §3g digest-compare to prove each consumer now holds the *same* new value without printing it.
4. **Revoke the old keys** — disable the old `sb_secret_…`, and disable legacy API keys on the project so the old service_role JWT dies.
5. **Verify AGAIN afterwards.** This is when a missed consumer surfaces. Re-dispatch the edge-function deploy + a sign-in.

## Why this parks instead of closing itself

There is no honest production_ref: no deploy ships from writing this doc, no live URL changes, no watch flips green, and no test file proves a key rotation. The three actions that finish it — create keys, update secrets from those values, disable the old keys — each require a **Supabase dashboard sign-in** and each disables a key that live scheduled jobs use. Both are Roger's alone.

**The one decision for Roger:** say when to run the swap (steps 1–5 above, ~15 min, one dashboard session). Until then the leaked keys stay live — inert unless the transcript is exfiltrated, but the service-role key bypasses RLS, so it is real, not nothing.
