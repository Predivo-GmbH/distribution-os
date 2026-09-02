# Sprint 0 — SaaS Compatibility Audit: Unified Fix Plan

**Date:** 2026-04-28
**Status:** Audit COMPLETE — Implementation next
**Total Issues:** 60+ across 8 domains
**CRITICAL:** 10 | HIGH: 12 | MEDIUM: 20+ | LOW: 10+

---

## Priority Tiers

### Tier 1 — CRITICAL (blocks SaaS launch, security risks)

| # | Domain | Issue | File | Fix Summary |
|---|--------|-------|------|-------------|
| 1 | Auth | SignUp step 3 calls `signUp()` on existing user — broken flow | `app/src/pages/SignUp.tsx:51-66` | Use `updatePassword()` after OTP verification |
| 2 | Auth | `handle_new_user()` trigger not idempotent — fails on retry | `supabase/migrations/20260318000000_initial.sql:142-152` | Add `ON CONFLICT (user_id) DO NOTHING` |
| 3 | Multi-tenancy | UPDATE without user_id scope (products) | `app/src/lib/supabase-storage.ts:91,97` | Add `.eq('user_id', uid)` to all UPDATE queries |
| 4 | Multi-tenancy | UPDATE without user_id scope (week_scores) | `app/src/lib/supabase-storage.ts:145,150` | Add `.eq('user_id', uid)` |
| 5 | Multi-tenancy | DELETE without user_id scope (products) | `app/src/lib/supabase-storage.ts:261` | Add `.eq('user_id', uid)` |
| 6 | Multi-tenancy | DELETE without user_id scope (week_scores) | `app/src/lib/supabase-storage.ts:270,275` | Add `.eq('user_id', uid)` |
| 7 | API Keys | Direct browser-to-Anthropic with exposed key | `app/src/lib/ai/worker-base.ts:100-107` | Deploy `call-ai` edge function proxy |
| 8 | API Keys | API key stored in plaintext localStorage | `app/src/lib/ai/config.ts:21-33` | Store encrypted in DB via edge function |
| 9 | Storage | ID divergence (local UUID vs server UUID) | `app/src/lib/supabase-storage.ts` (ADD_PRODUCT) | Use server-generated UUID, update local state |
| 10 | Storage | Fire-and-forget silently drops writes | `app/src/lib/supabase-storage.ts` | Add sync queue with retry |

---

### Tier 2 — HIGH (broken UX, security gaps)

| # | Domain | Issue | File | Fix Summary |
|---|--------|-------|------|-------------|
| 11 | Auth | Auth bypass if Supabase env vars missing in prod | `app/src/App.tsx:24-33` | Block app in production mode without Supabase |
| 12 | Auth | No logout button anywhere in UI | `app/src/components/settings/GeneralTab.tsx` | Add Sign Out button |
| 13 | Auth | Silent token expiry on backgrounded tabs | `app/src/lib/supabase-storage.ts:16-20` | Add session refresh in `getUserId()` |
| 14 | Tier Gating | No `useSubscription` hook — tier never loaded | NEW: `app/src/hooks/useSubscription.ts` | Create hook reading from user_preferences |
| 15 | Tier Gating | No server-side enforcement on products INSERT | NEW migration | Add `check_product_limit()` trigger |
| 16 | Tier Gating | No server-side enforcement on AI generation | NEW migration | Add `check_ai_generation_limit()` trigger |
| 17 | Tier Gating | Pricing page shows $0/$19, not $29/$99/$199 | `app/src/pages/Pricing.tsx:92-93` | Rewrite for 3-tier model |
| 18 | API Keys | `anthropic-dangerous-direct-browser-access` header | `app/src/lib/ai/worker-base.ts:106` | Delete after edge proxy deployed |
| 19 | Scheduler | Browser-only — dies when tab closes | `app/src/hooks/useScheduler.ts` | Migrate to pg_cron + Edge Functions |
| 20 | Hardcoded | PasswordGate with hardcoded `(value retired 2026-09-02 - each app now has its own, see that app's docs/Credentials.txt)` | `app/src/components/shared/PasswordGate.tsx:7` | Add env-var toggle, remove for prod |
| 21 | Hardcoded | `.env` with live credentials committed | `app/.env` | Add to .gitignore, use CI secrets |
| 22 | Storage | No conflict resolution (last-write-wins) | `app/src/lib/supabase-storage.ts` | Add `updated_at` timestamp comparison |

---

### Tier 3 — MEDIUM (functionality gaps, config issues)

| # | Domain | Issue | Fix Summary |
|---|--------|-------|-------------|
| 23 | Auth | PasswordGate needs env-var toggle | Add `VITE_PASSWORD_GATE_DISABLED` check |
| 24 | Auth | Edge functions should disable built-in JWT verification | Add `verify_jwt = false` to config.toml |
| 25 | Multi-tenancy | Global localStorage keys (7 locations) | Implement `scopedKey(userId, key)` helper |
| 26 | Tier Gating | `loadUserPreferences()` ignores subscription_tier | Return tier from existing DB column |
| 27 | Tier Gating | `UserPreferences` type missing subscription fields | Add `subscriptionTier` to interface |
| 28 | Tier Gating | `AddProductModal` has no product count gate | Add tier check in `handleSubmit` |
| 29 | Tier Gating | `GenerateButton` has no tier check | Add tier prop and gate |
| 30 | Tier Gating | No "Upgrade" CTA wired to Stripe Checkout | Create `useCheckout` hook |
| 31 | API Keys | Integration tokens (LinkedIn, Google) in localStorage | Move to encrypted DB columns |
| 32 | API Keys | CSP allows direct Anthropic API access | Remove from `connect-src` after proxy |
| 33 | API Keys | No usage tracking / quota enforcement | Create `ai_usage` table |
| 34 | Hardcoded | `distributionos.predivo.ch` in 15+ places | Extract to `VITE_APP_URL` env var |
| 35 | Hardcoded | "Prodiva GmbH" typo in 3 footers | Create `app-config.ts` with constants |
| 36 | Hardcoded | "Distribution OS" brand name in 50+ places | Extract to `APP_CONFIG.appName` |
| 37 | Storage | KB/onboarding localStorage-only (never syncs) | Add Supabase tables + sync |
| 38 | Storage | weekHistory never syncs to server | Add server persistence |
| 39 | Storage | `getUserId()` makes network call every operation | Cache user ID in memory |
| 40 | Scheduler | Config/runs stored only in localStorage | Create `scheduler_config` + `scheduler_runs` tables |

---

### Tier 4 — LOW (polish, future-proofing)

| # | Domain | Issue | Fix Summary |
|---|--------|-------|-------------|
| 41 | Landing | Only 4 sections (need 10 for conversion) | Sprint 10 work |
| 42 | Landing | Pricing shows wrong tiers | Align with Sprint 9 Stripe work |
| 43 | Landing | No analytics | Add after launch |
| 44 | Hardcoded | Design tokens schema URL points to non-existent URL | Remove or host |
| 45 | Hardcoded | Deploy.yml has hardcoded FTP path | Parameterize with `${{ vars.FTP_REMOTE_PATH }}` |

---

## Implementation Order

### Phase 1: Security (CRITICAL items 1-10)

**Batch A — Auth fixes (items 1, 2):**
- Fix SignUp.tsx to use `updatePassword()` after OTP
- New migration: make `handle_new_user()` idempotent

**Batch B — Multi-tenancy (items 3-6):**
- Add `.eq('user_id', uid)` to all 6 UPDATE/DELETE operations in supabase-storage.ts

**Batch C — API Key Security (items 7-8):**
- Deploy `call-ai` edge function (proxy to Anthropic)
- Create `user_api_keys` table (encrypted BYOK storage)
- Remove `anthropic-dangerous-direct-browser-access` header
- Update `worker-base.ts` to call edge function instead of direct API

**Batch D — Storage reliability (items 9-10):**
- Fix ID divergence: use server UUID, update local state on response
- Add sync queue with retry for failed writes

### Phase 2: UX & Gating (HIGH items 11-22)

**Batch E — Auth UX (items 11-13):**
- Add production guard in App.tsx
- Add Sign Out button
- Add session refresh in getUserId()

**Batch F — Tier Gating (items 14-17):**
- Create `useSubscription` hook
- Add server-side triggers (product limit, AI limit)
- Update Pricing page to 3-tier

**Batch G — Scheduler migration (item 19):**
- Create `scheduler_config` + `scheduler_runs` tables
- Deploy `scheduler-tick` + `run-worker` edge functions
- Enable pg_cron
- Delete `useScheduler` hook

**Batch H — Hardcoded cleanup (items 20-21):**
- Add PasswordGate env-var toggle
- Fix .gitignore for .env

### Phase 3: Config & Polish (MEDIUM + LOW)

- Create `app-config.ts` central config
- Extract all hardcoded domains to env vars
- Fix brand name typo
- Scope localStorage keys
- Wire Stripe Checkout CTA
- Add AI usage tracking

---

## New Files Required

| File | Purpose |
|------|---------|
| `supabase/functions/call-ai/index.ts` | Anthropic API proxy (BYOK + platform key) |
| `supabase/functions/save-api-key/index.ts` | Store encrypted BYOK key |
| `supabase/functions/scheduler-tick/index.ts` | pg_cron orchestrator |
| `supabase/functions/run-worker/index.ts` | Generic worker executor |
| `app/src/hooks/useSubscription.ts` | Tier state hook |
| `app/src/hooks/useCheckout.ts` | Stripe checkout trigger |
| `app/src/lib/app-config.ts` | Central app constants |
| `supabase/migrations/xxx_fix_handle_new_user.sql` | Idempotent trigger |
| `supabase/migrations/xxx_user_api_keys.sql` | Encrypted key storage |
| `supabase/migrations/xxx_ai_usage.sql` | Usage tracking |
| `supabase/migrations/xxx_product_limit_rls.sql` | Server-side tier enforcement |
| `supabase/migrations/xxx_scheduler_tables.sql` | Scheduler config + runs |

---

## Effort Estimate

| Phase | Effort | Dependencies |
|-------|--------|--------------|
| Phase 1 (Security) | 2-3 days | None — start immediately |
| Phase 2 (UX & Gating) | 2-3 days | Phase 1 complete |
| Phase 3 (Config & Polish) | 1-2 days | Phase 2 complete |
| **Total Sprint 0** | **5-8 days** | |

---

*Generated 2026-04-28 from 8-domain parallel audit*
