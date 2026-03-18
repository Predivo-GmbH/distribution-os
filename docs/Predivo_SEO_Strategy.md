# Predivo SEO Strategy Plan
### Pull Engine Execution — predivo.ch

---

## Current State

- **Site:** predivo.ch — 5 pages (home, about, contact, imprint, privacy)
- **SEO foundation:** Zero. No blog, no product pages, no comparison content, no backlinks strategy
- **Tech:** JS-rendered (potential crawlability issue — needs SSR/prerendering for Google)
- **Business model:** SaaS portfolio (BelegPilot, ReplyFlow, SignalForge, Distribution OS) + custom AI/software development
- **Market:** Swiss B2B, German-speaking Switzerland (DACH region)
- **Language:** German primary, English secondary

---

## Strategic Framework

Following the Pull Engine playbook: focus **100% on transactional, intent-based keywords**. No informational/how-to content — AI tools are absorbing that traffic in 2026.

### Two SEO Pillars

| Pillar | Target | Revenue Path |
|---|---|---|
| **SaaS Products** | Founders & SMBs searching for specific tools | Direct SaaS signups |
| **Agency Services** | Swiss businesses searching for AI/software development | Inbound leads for custom projects |

---

## Pillar 1: SaaS Product SEO

### 1.1 Product Landing Pages (Priority: Immediate)

Create a dedicated, SEO-optimized landing page for each product under predivo.ch:

| Page | Target Keywords (DE) | Target Keywords (EN) |
|---|---|---|
| `/products/belegpilot` | Belegverarbeitung Software, Buchhaltung automatisieren, Belege scannen Software Schweiz | Receipt processing software, automated bookkeeping Switzerland |
| `/products/replyflow` | Kundenkommunikation automatisieren, AI Antwort-Tool, Support Automatisierung | AI customer reply tool, automated support responses |
| `/products/signalforge` | Marktanalyse Tool, AI Signale erkennen, Wettbewerbsanalyse Software | Market signal detection, competitive intelligence tool |
| `/products/distribution-os` | SaaS Distribution Tool, Marketing Planung Solo Founder, Vertriebsplanung Software | SaaS distribution planner, solo founder marketing tool |

**Page structure for each:**
- H1: Clear value proposition with primary keyword
- Hero: Problem → Solution → CTA (free trial / waitlist)
- Features section with keyword-rich subheadings
- Social proof / metrics
- FAQ section (structured data for rich snippets)
- Clear CTA at bottom

### 1.2 Comparison & Alternative Pages (Priority: Month 1–2)

High-converting, bottom-of-funnel content. Create for each product with identifiable competitors:

**BelegPilot:**
- `/vergleich/belegpilot-vs-bexio` — Bexio is dominant in Swiss SMB accounting
- `/vergleich/belegpilot-vs-abacus` — Abacus is enterprise standard in CH
- `/vergleich/belegpilot-vs-run-my-accounts` — Swiss competitor
- `/vergleich/belegpilot-alternative` — Catch-all alternative page

**ReplyFlow:**
- `/vergleich/replyflow-vs-intercom`
- `/vergleich/replyflow-vs-zendesk`
- `/vergleich/replyflow-vs-freshdesk`
- `/vergleich/replyflow-alternative`

**General pattern:** `predivo.ch/vergleich/[product]-vs-[competitor]`

**Page template:**
- H1: "[Product] vs [Competitor] — Vergleich 2026"
- Side-by-side feature comparison table
- Pricing comparison
- Use case fit (who should choose what)
- Migration/switch CTA

### 1.3 Programmatic SEO Pages (Priority: Month 2–3)

One page per use case / workflow / industry vertical:

**BelegPilot examples:**
- `/belegpilot/fuer-treuhänder` (for fiduciaries)
- `/belegpilot/fuer-freelancer`
- `/belegpilot/fuer-gastronomie` (restaurants)
- `/belegpilot/fuer-handwerker` (tradespeople)
- `/belegpilot/fuer-startups`

**Template:** `predivo.ch/[product]/fuer-[vertical]`

Each page: 400–600 words, specific pain points for that vertical, relevant features highlighted, vertical-specific CTA.

### 1.4 Free Ungated Tool (Priority: Month 2–3)

Build one free tool per product that requires no login:

| Product | Free Tool Idea | Target Search |
|---|---|---|
| BelegPilot | Free receipt/Beleg scanner (upload → structured data) | "Beleg scannen kostenlos", "Quittung digitalisieren" |
| ReplyFlow | Free email tone analyzer / reply generator | "Email Antwort Generator", "professionelle Antwort schreiben" |
| SignalForge | Free competitor mention tracker (limited) | "Wettbewerber beobachten kostenlos" |

**Conversion flow:** Free tool → results page → "Want more? Sign up for [Product]" with 15–20% target conversion rate.

---

## Pillar 2: Agency/Dev Shop SEO

### 2.1 Service Pages (Priority: Month 1)

| Page | Target Keywords |
|---|---|
| `/services` | Softwareentwicklung Schweiz, AI Entwicklung Schweiz |
| `/services/ai-development` | KI Entwicklung, AI Integration Unternehmen, AI Beratung Schweiz |
| `/services/web-applications` | Web App Entwicklung Schweiz, Webapplikation erstellen lassen |
| `/services/automation` | Prozessautomatisierung, Workflow Automatisierung Schweiz |

### 2.2 Industry-Specific Service Pages (Priority: Month 2–3)

- `/services/ai-fuer-finanzbranche`
- `/services/ai-fuer-immobilien`
- `/services/ai-fuer-gesundheitswesen`
- `/services/ai-fuer-treuhand`

### 2.3 Case Studies / Showcase (Priority: Month 3+)

- `/projekte/[project-name]` — Each completed project as a case study
- Structured as: Challenge → Solution → Results → Tech stack
- Target: "[industry] software Beispiel", "AI Projekt Schweiz"

---

## Technical SEO Foundation

### Critical Fixes (Before Any Content)

1. **Server-Side Rendering (SSR) or Prerendering**
   - Current JS-only rendering is a crawlability risk
   - Implement SSR (Next.js / Nuxt) or prerendering service
   - Google can render JS but delays indexing significantly

2. **Meta Tags on Every Page**
   - Unique title tag (50–60 chars) with primary keyword
   - Meta description (150–160 chars) with CTA
   - Open Graph tags for social sharing
   - Canonical URLs

3. **Structured Data (Schema.org)**
   - Organization schema ✅ (already exists)
   - Add: Product schema on each product page
   - Add: FAQPage schema on pages with FAQ sections
   - Add: LocalBusiness schema (Swiss location = local SEO advantage)
   - Add: BreadcrumbList schema

4. **Sitemap & Robots.txt**
   - Dynamic sitemap.xml that auto-updates with new pages
   - Proper robots.txt allowing all content pages

5. **Core Web Vitals**
   - LCP < 2.5s, FID < 100ms, CLS < 0.1
   - Image optimization (WebP, lazy loading)
   - Font optimization (preload Inter, JetBrains Mono)

6. **URL Structure**
   - Clean, keyword-rich URLs in German
   - Consistent hierarchy: `/products/`, `/vergleich/`, `/services/`, `/projekte/`

7. **hreflang Tags**
   - `de-CH` as primary
   - `en` as secondary (if English versions are created)

---

## Swiss Local SEO

Predivo has a significant advantage: physical Swiss presence. Leverage this:

1. **Google Business Profile** — Claim and optimize for "Softwareentwicklung Küssnacht am Rigi" / "AI Unternehmen Schwyz"
2. **Swiss Directories** — List on local.ch, search.ch, zefix.ch, startupch.ch
3. **"Schweiz" / "Swiss" Keywords** — Include in every service page. Swiss businesses strongly prefer local providers for software development
4. **Swiss trust signals** — Display Swiss address, CH phone number, Handelsregister entry prominently

---

## Backlink Strategy

### Month 1–2: Foundation Links
- Swiss business directories (local.ch, search.ch, startupticker.ch)
- Tech community profiles (GitHub org, Product Hunt)
- Industry-specific tool directories (G2, Capterra — list each SaaS product)

### Month 2–4: Outreach Links
- Guest posts on Swiss tech blogs (startupticker.ch, swissinfo.ch tech section)
- Partner with Swiss startup communities for cross-linking
- DACH SaaS communities and newsletters

### Month 4+: Content-Driven Links
- Free tools naturally attract backlinks
- Comparison pages get linked from "best X" roundup articles
- Case studies get shared by project partners

---

## Content Calendar — First 12 Weeks

| Week | Action | Pages |
|---|---|---|
| 1–2 | Technical SEO fixes (SSR, meta, schema) | 0 new |
| 3–4 | Product landing pages | 4 pages |
| 5–6 | Service pages | 4 pages |
| 7–8 | First batch comparison pages (BelegPilot) | 4 pages |
| 9–10 | Programmatic vertical pages (BelegPilot) | 5 pages |
| 11–12 | Free tool launch + comparison pages (ReplyFlow) | 1 tool + 4 pages |
| **Total by Week 12** | | **~22 pages + 1 free tool** |

### Month 4–6: Expand
- Comparison pages for remaining products
- More vertical pages
- Second free tool
- Begin case studies
- Target: 40–50 total pages

### Month 6–12: Compound
- Continue programmatic pages at 2–3/week
- Optimize existing pages based on Search Console data
- Build backlinks to top-performing pages
- Target: 80–100 total pages

---

## KPIs & Measurement

| Metric | Month 3 | Month 6 | Month 12 |
|---|---|---|---|
| Indexed pages | 25+ | 50+ | 100+ |
| Organic impressions/month | 1,000 | 10,000 | 50,000+ |
| Organic clicks/month | 50 | 500 | 3,000+ |
| Keywords ranking top 20 | 20 | 80 | 200+ |
| Organic signups/month | 5 | 30 | 100+ |
| Organic leads (agency)/month | 2 | 10 | 25+ |

### Tools
- **Google Search Console** — Track impressions, clicks, rankings (free)
- **Google Analytics 4** — Track conversions and user behavior (free)
- **Ahrefs or SEMrush** — Keyword research, competitor monitoring, backlink tracking (~$99/mo)

---

## LLM Visibility (Bonus Channel)

All SEO work above simultaneously improves visibility in AI-generated responses (ChatGPT, Claude, Perplexity). Additional actions:

1. Ensure product pages have clear, structured descriptions that LLMs can extract
2. Build brand mentions across forums, directories, and review sites
3. Publish on platforms LLMs index: GitHub, Product Hunt, Reddit (r/SaaS, r/Switzerland)
4. Structured FAQ sections are especially valuable for LLM citation

---

## Priority Summary

```
IMMEDIATE (Week 1–2):
├── Fix SSR/prerendering for crawlability
├── Add meta tags, schema markup
└── Set up Google Search Console + Analytics

MONTH 1 (Week 3–6):
├── 4 product landing pages
├── 4 service pages
├── Google Business Profile
└── Swiss directory listings

MONTH 2 (Week 7–10):
├── 8+ comparison/alternative pages
├── 5+ vertical programmatic pages
└── Begin backlink outreach

MONTH 3 (Week 11–12):
├── First free ungated tool
├── Continue page expansion
└── Optimize based on Search Console data

MONTH 4–12:
├── Scale to 80–100 pages
├── Second and third free tools
├── Case studies
└── Ongoing optimization and backlink building
```

---

*Based on the Predivo Distribution Playbook — Pull Engine*
*Predivo GmbH — 2026*
