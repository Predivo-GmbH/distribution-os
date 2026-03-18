# Phase 2A — Product Brief: LaunchReady

> Completed: 10 March 2026

## App Name Options

1. **LaunchReady** — clear, action-oriented, implies "your site is ready to be found"
2. **SitePulse** — monitoring angle, implies ongoing health checks
3. **GoLiveKit** — the toolkit you need when you go live

**Recommended: LaunchReady** — it answers the exact question users are asking: "Is my website ready?"

## One-Line Description

Paste your URL, get a full post-launch audit with copy-paste fix code and guided setup for Google — in 60 seconds.

## Target Persona

**Primary:** "First-time launcher" — freelancer, small business owner, indie maker, agency client who just got a website delivered. Non-technical or semi-technical. Budget: $0-50/mo for tools. Platform: any (not WordPress-only).

**Secondary:** "Web developer finishing a client project" — knows SEO basics but wants a fast, automated checklist to ensure nothing is missed before handoff. Would pay for white-label PDF reports.

## Core Problem Solved

You launched your website. Now Google doesn't know it exists. You Google your own business name — nothing. You know "SEO" matters but every tool is either $140/mo and overwhelming, or free and useless (just scores, no fixes). You need someone to tell you exactly what's wrong and give you the code to fix it.

## MVP Features (exactly 3)

### Feature 1: Instant Audit Engine
User pastes a URL. The app crawls the site (all pages linked from homepage) and checks:
- Per-page meta tags (title, description, canonical, OG, Twitter Card)
- Sitemap.xml existence + quality (lastmod, changefreq, all pages included)
- Robots.txt existence + correctness
- JSON-LD structured data (Organization, LocalBusiness, or appropriate type)
- Lighthouse scores (Performance, Accessibility, Best Practices, SEO)
- OG image accessibility + dimensions (1200x630)
- Heading hierarchy (h1 → h2 → h3, no skips)
- Image alt text coverage
- HTTPS + security headers
- Mobile responsiveness (viewport meta)
- Page load speed (Core Web Vitals)

**Output:** A scored dashboard (0-100 overall) with pass/fail per check, grouped by category.

### Feature 2: AI Fix Generator
For every failed check, the app generates:
- **Copy-paste code** — the exact HTML, JSON-LD, XML, or config to add/replace
- **Plain-English explanation** — what this fix does and why it matters (1-2 sentences)
- **Where to put it** — "Paste this in your `<head>` tag" or "Save this as `sitemap.xml` in your root folder"

Examples of generated fixes:
- Missing meta description → generates `<meta name="description" content="...">` with AI-written description based on page content
- No sitemap → generates complete `sitemap.xml` with all discovered pages, lastmod, changefreq
- No JSON-LD → generates Organization or LocalBusiness schema from page content (company name, address, contact)
- Bad OG tags → generates complete OG tag set with AI-written descriptions
- Missing robots.txt → generates standard robots.txt with sitemap reference

**AI provider:** Claude API — generates descriptions, structured data, and fix recommendations from crawled page content.

### Feature 3: Guided Action Center
For tasks that can't be automated with code, the app provides step-by-step walkthroughs with screenshots:
- **Google Search Console setup** — verify domain, submit sitemap, request indexing for each URL
- **Google Business Profile creation** — pre-filled fields from crawled site data (business name, address, description)
- **Social sharing verification** — direct links to Facebook Sharing Debugger, LinkedIn Post Inspector, with expected results shown
- **Analytics setup** — GA4 measurement ID placement guide

Each guided task has a "Mark as done" checkbox. Progress persists.

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Frontend | React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui | Predivo's exact stack — maximum build velocity |
| Backend | FastAPI (Python 3.12) | SignalForge's stack — Playwright runs natively in Python for headless crawling |
| Database | Supabase (PostgreSQL + Auth + Storage) | Free tier for MVP, built-in auth, real-time subscriptions for audit progress |
| Headless browser | Playwright (Python) | Crawl pages, run Lighthouse, capture screenshots, extract meta tags |
| AI | Claude API (claude-sonnet-4-5-20250514) | Generate meta descriptions, structured data, fix recommendations from page content |
| Hosting | Metanet (Swiss hosting, FTP deploy) | Same infrastructure as Predivo — zero-downtime FTP mirror via GitHub Actions |
| Payments | Stripe | Checkout + customer portal + webhooks |
| Queue | Redis + Celery (or Railway background workers) | Audit jobs take 30-60s, need async processing |

## Scope Guard — What This Is NOT

- NOT an ongoing SEO rank tracker (no keyword position monitoring)
- NOT a backlink analyzer (no link building features)
- NOT a content optimization tool (no "write better blog posts" features)
- NOT WordPress-only (platform-agnostic, works with any website)
- NOT an agency dashboard (no multi-client management in MVP)
- NOT a site builder or CMS

This is a **post-launch audit + fix tool**. It answers ONE question: "Is my website ready to be found by Google?" and fixes everything that isn't.

## Architecture (High-Level)

```
User pastes URL
    ↓
Frontend (Next.js on Metanet)
    ↓ POST /api/audits
Backend (FastAPI on Railway)
    ↓ Queue audit job
Worker (Playwright + Lighthouse)
    ↓ Crawl site, run checks
    ↓ Store results in Supabase
    ↓ Call Claude API for fix generation
    ↓ WebSocket/polling → frontend updates
Results Dashboard
    ↓
    ├── Scored checklist (pass/fail per check)
    ├── AI-generated fix code (copy button per fix)
    └── Guided action center (step-by-step walkthroughs)
```

## Key Technical Decisions

1. **Playwright over Puppeteer** — Python-native, better cross-browser support, built-in Lighthouse integration via CDP
2. **Supabase over custom auth** — free tier covers MVP, auth + DB + storage in one, realtime for audit progress
3. **Claude Sonnet over GPT** — better at structured output (JSON-LD, HTML), lower cost than Opus, sufficient quality for meta descriptions
4. **Async audit processing** — audits take 30-60s, must not block the request. Queue job, poll/WebSocket for progress.
5. **Platform-agnostic** — crawl the rendered HTML, don't care about the CMS. Works for React SPAs, WordPress, Wix, Squarespace, static sites, anything.
