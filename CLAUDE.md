# Distribution-OS

End-to-end distribution SaaS for solo technical founders (formerly "ShipSolo"; that name is dead, do not use it). Public product at `distributionos.predivo.ch`.

## Stack
React + TypeScript + Vite + Tailwind + shadcn/ui + Supabase (Postgres / Auth / Deno edge functions) + Stripe. Repo: `Arivioo/distribution-os`, default branch `master`. **The app lives in the `app/` subfolder** (build output `app/dist`), unlike most fleet repos.

## Dev
- Install: `cd app && npm install`
- Dev server: `cd app && npm run dev`
- Before pushing: from `app/`, `npm run lint` && `npm run test:coverage` && `npm run build`.

## Deploy (two-branch staging-first, Metanet FTP, NEVER Vercel)
Canonical deploy standard: `C:\Business\Internal Projects\standards\deploy-standard.md`.
- **`staging` branch -> `deploy-staging.yml`** deploys `staging.distributionos.predivo.ch` (self-healing htpasswd from `STAGING_HTPASSWD_LINE`, in-app PasswordGate disabled on staging builds) and runs the `e2e-staging` Playwright gate. Full E2E suite in `app/e2e/`.
- **`master` -> `deploy.yml`** deploys PRODUCTION `distributionos.predivo.ch` after `lint` + `test:coverage` + `build` (site-id guard prevents wrong-target FTP).
- Flow: land changes on `staging` first, verify green on `staging.distributionos.predivo.ch`, then merge to `master` for prod. Keep `staging` and `master` reconciled (they can drift).
- Staging Supabase project is separate from prod (secrets `STAGING_VITE_SUPABASE_*`).

## How we work (canonical, do not duplicate here)
- A-to-Z workflow: `C:\Business\Templates\1-Person AI Business Playbook\docs\ONE_PERSON_AI_BUSINESS_WORKFLOW.md`
- Design pipeline: `C:\Business\Templates\project-starter\docs\DESIGN_PIPELINE.md`; product spec: `docs/Predivo_Distribution_OS_Spec_v2_ClaudeCode.md`
- Audit/QC: `C:\Business\Audits\audit-framework.md`
- Operating doctrine, gates, boundaries: global `~/.claude/CLAUDE.md` + the Pre-Action Checklist.
- Human QA gate: after any UI change, Playwright (desktop + mobile) + console + screenshot before "done".

## Project-specific
- Early-Access gate was disabled in production 2026-08-02 (component/tests remain; re-enable by flipping the line in `deploy.yml`).
- Keep `docs/FEATURE_REGISTRY.md` + `app/e2e/` specs in sync with features.
