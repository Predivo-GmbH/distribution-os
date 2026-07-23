# Distribution-OS — Complete Product Plan

**Date:** 2026-04-28 (revised)
**Status:** Approved — ready for build
**Base:** Distribution-OS (existing codebase at C:\Business\Internal Projects\Distribution-OS)
**Concept:** Evolve Distribution-OS into a full end-to-end SaaS for solo technical founders

---

## Product Vision

The only tool that covers the complete solo founder journey in one place:
**Idea → Validation → Offer → Brand → Distribution → Proposals → Daily Ops → Audit**

Built on the existing Distribution-OS codebase (24 AI workers, 6 distribution engines, scheduler, inbox, knowledge base). 34 features at launch, 12 deferred to v2.

---

## Feature Groups (v1 — 34 features)

### Group A — Core Distribution Engine (4 features, ALREADY BUILT)

| # | Feature | Description | Status |
|---|---|---|---|
| A1 | **6 Distribution Engines** | Pull/Push/Bridge/Search/Equity/Persistence with engine picker, task scoring, weekly tracking | EXISTS |
| A2 | **24 AI Workers** | Browser-to-Anthropic API calls using `callAI()` pattern | EXISTS |
| A3 | **Weekly Scorecard** | Score tracking per week with history | EXISTS |
| A4 | **Product Management** | CRUD with stage tracking, multi-product | EXISTS |

---

### Group B — Business Lifecycle Phases (6 features, NEW)

| # | Feature | Route | Description |
|---|---|---|---|
| B1 | **Idea Validator** | `/validate` | 3-agent team: market research + competitor analysis + distribution feasibility. Outputs "Winning Idea Brief" with MRR potential, go/no-go. Auto-populates Knowledge Base. |
| B2 | **Offer Builder** | `/brief` | 2-agent team: product brief (name, persona, 3 MVP features) + offer design (3-tier pricing, irresistible hook, objection busters). Feeds Knowledge Base. |
| B3 | **Launch Checklist** | `/setup` | Step-by-step wizard: domain, Supabase, SMTP, Stripe, CI/CD, env vars, AI keys. Tracks completion. Generates `.env.local` template. |
| B5 | **Content Engine** | (within `/dashboard`) | 3-agent team: written posts, video scripts, outreach DMs. 7-day content calendars using customer pain language from Knowledge Base. |
| B6 | **Proposal Generator** | `/proposals` | Paste sales call transcript → tailored proposal + objection handling + follow-up sequence (48h email + day 5 nudge). Export PDF/MD. |
| B7 | **Daily Dashboard** | `/dashboard` | Morning market pulse, today's build focus, content queue, outreach pipeline. The daily-use retention surface. |

**Deferred:** B4 (Sprint Planner) — users plan sprints in their own tools.

---

### Group C — Design Pipeline (4 features, NEW — revised, no Recraft/Stitch)

| # | Feature | Description |
|---|---|---|
| C1 | **Brand Scraper** | User inputs 1-5 reference URLs → Firecrawl API extracts colors, fonts, spacing, components, tone, personality. |
| C4 | **Token Extractor** | Generates `design-tokens.json` (colors light+dark, typography scale, spacing, radius, shadows) from brand scrape + user preferences. |
| C5 | **Brand Book Builder** | Generates standalone HTML brand book (8 sections) from tokens + user-uploaded logo + product brief. Styled in the brand's own design language. |
| C7 | **Design Consistency Check** | Validates tokens + brand book are coherent, flags inconsistencies, ensures all required assets are present. |

**Pipeline flow:** C1 (scrape) → C4 (tokens) → C5 (brand book) → C7 (consistency check)

**What this does NOT do:**
- No logo generation (user uploads their own)
- No mockup generation (user uses their own design tool)
- No screen generation (user builds in Bolt/Lovable/Cursor)
- No application code generation

**Removed:** C2 (Recraft logo), C3 (Stitch mockups), C6 (screen generation)

---

### Group E — 8-Domain Audit Framework (10 features, NEW)

Full-mode audit with repo connection. User connects their GitHub repo, Distribution-OS runs 8 parallel audit agents and delivers a scored report.

| # | Feature | Weight | Description |
|---|---|---|---|
| E1 | **Security Audit** | 25pts | npm vulns, .gitignore, security headers, CORS, XSS, RLS, SMTP |
| E2 | **SEO Audit** | 20pts | robots.txt, sitemap, meta descriptions, JSON-LD, Open Graph |
| E3 | **Performance Audit** | 20pts | Bundle size, code splitting, image optimization, lazy loading |
| E4 | **Code Quality Audit** | 20pts | Build errors, ESLint, TypeScript strict, dead code, DRY |
| E5 | **Accessibility Audit** | 15pts | WCAG 2.1 AA, skip-to-content, ARIA, focus trap, contrast |
| E6 | **UI Consistency Audit** | bonus | Design token adherence, cross-page consistency |
| E7 | **Responsive Audit** | bonus | Touch targets, breakpoints, overflow, mobile nav |
| E8 | **Mobile Visual Audit** | bonus | Rendered screenshots at 375/390/768/1024px |
| E9 | **Fix Loop** | — | Iterative guided remediation with re-scoring after fixes |
| E10 | **Audit Report** | — | Exportable HTML/PDF report with scores, findings, fix recommendations |

**Route:** `/audit`
**Trigger:** Manual ("Run Audit" button) or automatic (after deploy via webhook)
**Retention value:** Users re-audit after every deploy cycle

---

### Group G — Site Analysis (2 features, NEW)

| # | Feature | Description |
|---|---|---|
| G2 | **Site Analyzer** | User inputs any URL → AI reverse-engineers design thinking, conversion psychology, UX patterns. Great for competitive analysis. |
| G3 | **Website Audit** | Quick-score any website against 17-item conversion checklist (first impression, nav, content, conversion, technical). |

**Route:** `/analyze`

**Deferred:** G1 (Pattern Library — content exists but low leverage to productize), G4 (Analysis Template — too generic)

---

### Group H — Engine Execution Playbooks (7 features, NEW)

Step-by-step execution guides that make the 6 distribution engines actionable. Each playbook generates concrete tasks.

| # | Feature | Engine | Description |
|---|---|---|---|
| H1 | **Engine Advisor** | All | AI recommends which engine to start based on user's niche, resources, timeline |
| H2 | **Pull Playbook** | Pull | SEO keyword research, comparison pages, programmatic SEO, LLM visibility |
| H3 | **Push Playbook** | Push | Waitlist building, edu selling, content pillars, launch psychology |
| H4 | **Bridge Playbook** | Bridge | Connector finding, outreach templates, partnership structuring |
| H5 | **Search Playbook** | Search | Google Ads campaign structure, keyword research, paid strategy |
| H6 | **Equity Playbook** | Equity | Partner deals, ownership trades, deal tracking |
| H7 | **Persistence Playbook** | Persistence | Iteration cycles, failure analysis, momentum maintenance |

**Route:** Integrated into each engine's detail view (existing `/products/:id` engine tabs)

---

### Group I — Scheduling & Automation (3 features, NEW)

| # | Feature | Description |
|---|---|---|
| I1 | **Daily Routine Scheduler** | Customizable 4-block daily routine: Market Pulse → Build → Content → Outreach. AI-powered task suggestions per block. |
| I2 | **Weekly Automations** | Recurring weekly tasks: marketing refresh, business review, competitor check. AI auto-executes on schedule. |
| I3 | **Activity Monitor** | Real-time monitoring of deploys, content posts, pipeline status. Notification feed. |

**Route:** `/schedule` + integrated into dashboard

---

## Deferred to v2 (12 features)

| Group | Features | Reason |
|---|---|---|
| **D** (Code Quality & Reviews) | D1 Code Review, D2 Design Review, D3 Security Review, D4 Build Health, D5 Plan Generator, D6 Learning Loop | Developer tooling — competes with CodeRabbit/Snyk/SonarQube. Not core to founder workflow. |
| **F** (Testing Framework) | F1 CI Pipeline Builder, F2 Feature Registry, F3 Coverage Gate, F4 Production Gate Monitor | Dev tooling — target users (Bolt/Lovable/Cursor founders) don't set up CI themselves. |
| **B4** (Sprint Planner) | Sprint planning | Users already have Linear/Notion. Not Distribution-OS's job. |
| **G1** (Pattern Library) | Searchable UI patterns | Content exists but low leverage. Users can find hero examples elsewhere. |
| **G4** (Analysis Template) | Structured analysis format | Too generic to justify as paid feature. |

---

## Feature Gating by Tier

| Feature | Starter ($29/mo) | Growth ($99/mo) | Scale ($199/mo) |
|---------|-----------------|-----------------|-----------------|
| B1: Idea Validation | 2/month | 5/month | Unlimited |
| B2: Offer Builder | 2/month | 5/month | Unlimited |
| B3: Launch Checklist | Yes | Yes | Yes |
| C1-C7: Design Pipeline | Brand scrape only | Full pipeline | Full pipeline |
| A1-A4: Distribution Engines (6) | Read-only playbooks | Full interactive + AI workers | Full + unlimited runs |
| A2: Marketing Content (24 workers) | 5 runs/month | 25 runs/month | Unlimited |
| B6: Proposal Generator | No | 3/month | Unlimited |
| B5: Content Engine | No | 5 calendars/month | Unlimited |
| B7: Daily Dashboard | Basic (no AI) | Full AI-powered | Full + cross-project |
| E1-E10: 8-Domain Audit | 1 audit/month (summary) | 3 audits/month (full report) | Unlimited + webhooks |
| G2-G3: Site Analysis | 3 analyses/month | 10/month | Unlimited |
| H1-H7: Engine Playbooks | Read-only | Interactive + task generation | Full + AI execution |
| I1-I3: Scheduling | Manual daily routine | Weekly automations | Full auto-execution |
| Active projects | 2 | 5 | Unlimited |
| Inbox & artifact review | Yes | Yes | Yes |
| Knowledge Base | Yes | Yes | Yes |
| Connector CRM | No | Yes | Yes |
| Cross-project analytics | No | No | Yes |
| Export | PDF only | PDF + MD | Full API access |

---

## Build Order (Sprint 0 + 10 Sprints)

### Sprint 0: SaaS Compatibility Audit — CRITICAL
**Must complete before any new feature work.**

| Domain | What to Fix |
|--------|------------|
| 1. Authentication | Supabase Auth mandatory for all routes. Remove PasswordGate for production. |
| 2. Multi-tenancy | Every DB query scoped to `auth.uid()`. RLS on all tables. No cross-user leakage. |
| 3. Storage Layer | Supabase = primary source of truth. localStorage = cache only. |
| 4. Subscription Gating | Stripe integration. Every feature gate-checked against tier. Run-count enforcement. |
| 5. API Key Security | Per-user BYOK keys + platform quota. Keys never exposed client-side. Move to edge function proxy. |
| 6. Scheduler | Evaluate browser-only vs. server-side. Acceptable for SaaS if clearly communicated. |
| 7. Hardcoded Values | Remove all internal references (company names, domains, API endpoints). |
| 8. Landing Page | Replace with conversion-optimized landing page (see Sprint 10). |

---

### Sprint 1: Idea Validation Pipeline (B1)
- 3 new workers: Market Researcher, Competitor Analyst, Distribution Specialist
- New page: `/validate`
- Output stored per-project, auto-populates Knowledge Base
- **Effort:** Medium

### Sprint 2: Offer Builder (B2)
- 2 new workers: Product Definer, Offer Designer
- New page: `/brief`
- Feeds Knowledge Base with positioning, pricing, objections
- **Effort:** Medium

### Sprint 3: Launch Checklist (B3)
- No new workers (UI + credential storage only)
- New page: `/setup`
- Step-by-step wizard, encrypted credential store, `.env.local` generation
- **Effort:** Light

### Sprint 4: Design Pipeline (C1, C4, C5, C7)
- 4 new workers: Brand Analyzer (Firecrawl), Token Extractor, Brand Book Generator, Consistency Checker
- New page: `/build-kit`
- Outputs: `design-tokens.json`, `brand-book.html`, consistency report
- Logo upload (user provides own)
- **Effort:** Medium

### Sprint 5: Proposal Generator + Content Engine (B5, B6)
- 4 new workers: Proposal Writer + Content Writer + Video Script + Outreach DM
- New page: `/proposals`
- Content Engine integrated into dashboard
- **Effort:** Medium

### Sprint 6: Engine Playbooks + Engine Advisor (H1-H7)
- 1 new worker: Engine Advisor (recommends starting engine)
- 6 playbook views (integrated into engine tabs)
- Task generation from playbook steps
- **Effort:** Medium

### Sprint 7: 8-Domain Audit (E1-E10)
- New page: `/audit`
- GitHub repo connection (OAuth or token)
- 8 parallel audit workers
- Scored report generation (HTML/PDF export)
- Fix loop with re-scoring
- **Effort:** Heavy

### Sprint 8: Scheduling & Daily Ops (I1-I3, B7)
- New page: `/schedule`
- Daily routine scheduler (4 blocks)
- Weekly automation runner
- Activity monitor feed
- Enhanced daily dashboard with AI
- **Effort:** Medium

### Sprint 9: Site Analysis + Stripe + Tier Gating (G2, G3)
- New page: `/analyze`
- Site Analyzer worker (URL → design/conversion analysis)
- Website Audit worker (17-item scoring)
- Stripe integration: checkout, webhooks, billing portal
- All tier gates enforced
- **Effort:** Medium-Heavy

### Sprint 10: Rebrand + Landing Page + Polish
- Rename to Distribution-OS (or keep Distribution OS — decision here)
- Conversion-optimized landing page (10 sections)
- Responsive polish across all pages
- Founding member badge + urgency counter
- **Effort:** Medium

---

## New Pages (v1)

```
Sidebar:
  Validate        ← Sprint 1 (B1)
  Brief           ← Sprint 2 (B2)
  Setup           ← Sprint 3 (B3)
  Build Kit       ← Sprint 4 (C1/C4/C5/C7)
  ─────────────
  Dashboard       ← EXISTS (enhanced Sprint 8)
  Inbox           ← EXISTS
  Products        ← EXISTS (playbooks added Sprint 6)
  Proposals       ← Sprint 5 (B6)
  Analyze         ← Sprint 9 (G2/G3)
  Audit           ← Sprint 7 (E1-E10)
  Schedule        ← Sprint 8 (I1-I3)
  ─────────────
  Briefing        ← EXISTS
  Settings        ← EXISTS
```

---

## Worker Count

| Category | Count | Source |
|---|---|---|
| Existing (Distribution-OS) | 24 | Pull 4, Push 5, Bridge 5, Search 4, Equity 3, Persistence 3 |
| Phase 1 (Idea Validation) | 3 | Market, Competitor, Distribution |
| Phase 2 (Offer Builder) | 2 | Product Definer, Offer Designer |
| Design Pipeline | 4 | Brand Analyzer, Token Extractor, Brand Book, Consistency |
| Content Engine | 3 | Writer, Video Script, Outreach DM |
| Proposal | 1 | Proposal Writer |
| Engine Advisor | 1 | Recommends starting engine |
| Audit | 8 | One per domain |
| Site Analysis | 2 | Site Analyzer, Website Audit |
| Scheduling | 0 | UI/automation only, uses existing workers |
| **TOTAL** | **48** | |

---

## What's NOT in Scope (v1)

- No logo generation (no Recraft)
- No mockup/screen generation (no Stitch)
- No application code generation (user uses Bolt/Lovable/Cursor)
- No test infrastructure generation
- No team/collaboration features (single-user only)
- No community/marketplace
- No mobile app
- No code review tooling (v2)
- No CI/CD generation (v2)

---

## Tech Stack

- **Frontend:** React 19 + Vite 8 + TypeScript + Tailwind 4 + shadcn/ui
- **Backend:** Supabase (Auth, Postgres, RLS, Edge Functions, Storage)
- **AI:** Anthropic Claude API (browser-side via BYOK or platform proxy)
- **Payments:** Stripe (checkout, webhooks, billing portal)
- **Brand Scraping:** Firecrawl API
- **Deploy:** GitHub Actions → Metanet FTP
- **Domain:** TBD (distributionos.predivo.ch during development, final domain at Sprint 10)

---

*Predivo GmbH — 2026-04-28*
