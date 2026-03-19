# Predivo Distribution OS
### Implementation Spec — AI Automation Layer
*Handoff document for Claude Code | Version 2.0 | Predivo GmbH | 2026*

---

## Context for Claude Code

The base product (v1) is already built and live. It covers:

- Product registry (register products with stage, engine assignments, color)
- Weekly dashboard (tasks surfaced per engine assignment, checked off, tracked)
- Per-product task view with stage-specific recommendations
- Engine reference view
- Roadmap view
- Settings and configuration
- Local persistence via `window.storage`

**This document describes only what needs to be added or changed.** Do not rebuild what exists. The goal is to layer AI generation, analysis, and automation on top of the current implementation as quickly as possible, targeting full autonomous operation from the moment setup is complete.

---

## The Target State

The system should operate like a fully staffed distribution function running autonomously. Once configured, the founder's weekly interaction is:

1. Open the OS on Monday morning
2. Review AI-generated artifacts from the weekend run (posts, pages, outreach, ad copy)
3. Approve, edit, or redirect each item
4. Close it

Everything else — generation, scheduling, publishing, optimization, follow-up — runs without intervention. The founder is a director, not an executor.

---

## What Needs to Be Built

There are four additions required on top of the existing v1 implementation:

1. **Knowledge Base** — one-time setup that gives the AI the context it needs to generate on-brand output
2. **AI Generation Layer** — per-engine AI workers that produce artifacts for each weekly task
3. **Integration Layer** — connections to external services that enable autonomous publishing and data import
4. **Automation Scheduler** — the scheduling system that runs everything on a defined cadence without manual triggering

These are described in full below.

---

## 1. Knowledge Base

The knowledge base is the foundation of all AI generation. Without it, AI output is generic. With it, AI output matches the founder's voice, understands the ICP deeply, and improves with every interaction.

### Setup Screen

Add a one-time setup flow triggered on first launch (or accessible from Settings). The setup screen collects the following, per product:

**Voice Examples**
The user pastes 10–15 examples of their own writing — LinkedIn posts they have published, emails they have sent, landing page copy they have written. If no examples exist yet, the user pastes 10–15 posts from creators whose style they want to emulate. These are stored as the voice reference for all AI generation tied to this product.

**ICP Definition**
A structured form collecting:
- Who the customer is (job title, company type, company size)
- The primary pain they are trying to solve
- What they have already tried that has not worked
- What outcome they are paying for
- Where they hang out online (LinkedIn, specific subreddits, communities, newsletters)

**Product Positioning**
- One-sentence description of what the product does
- Three specific benefits in the customer's language (not features)
- The primary competitor or alternative the customer is currently using
- The reason a customer should switch

**Tone Parameters**
A simple set of toggles: formal vs. conversational, technical vs. accessible, bold vs. measured, short-form vs. long-form preference. These constrain the AI generation style globally for this product.

### Knowledge Base Storage

Store knowledge base data in `window.storage` under `kb:{productId}`. Structure:

```
{
  voiceExamples: string[],
  icp: { who, pain, triedBefore, desiredOutcome, hangoutsOnline },
  positioning: { oneLiner, benefits: string[], competitor, switchReason },
  tone: { formality, technicality, boldness, lengthPreference },
  approvedArtifacts: { type, content, editedFrom, approvedAt }[]
}
```

The `approvedArtifacts` array grows over time as the founder approves AI output. Each approved artifact (with its original AI version and the founder's edits) becomes a new training example that improves future generation. This is the compounding mechanism.

---

## 2. AI Generation Layer

Each distribution engine gets a dedicated AI worker. Workers are invoked either manually (from a task in the dashboard) or automatically (by the scheduler). All workers use the Anthropic API via the existing Claude integration pattern.

### Shared API Call Pattern

All AI workers follow this structure:

```javascript
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1000,
    system: buildSystemPrompt(product, engine, kb),
    messages: [{ role: "user", content: taskPrompt }]
  })
});
```

The system prompt is assembled from: the knowledge base (voice examples, ICP, positioning, tone), the product context (name, stage, engine assignments), and the engine context (what this engine does, what good output looks like). This is rebuilt fresh for each invocation so it always reflects current knowledge base state.

### AI Review Interface

Every AI-generated artifact enters an **Inbox** before it is scheduled or published. The Inbox is a new view in the navigation (add between Dashboard and Products). It shows:

- All pending artifacts awaiting review, grouped by product and engine
- For each artifact: the generated content, which task it fulfills, which product it belongs to, and when it was generated
- Three actions per artifact: **Approve** (enters the execution queue), **Edit then Approve** (inline editor opens, founder edits, then approves), **Regenerate** (AI produces a new version with an optional direction note from the founder)

When the founder edits before approving, the original and edited versions are both stored in `approvedArtifacts`. The diff between them becomes the learning signal for future generations.

---

### Pull Engine Workers

**SEO Content Writer**
- **Trigger:** Weekly, for each Pull engine task "Publish 1 SEO/comparison page"
- **Input:** Target keyword (user provides or selected from keyword brief), product context, knowledge base
- **Output:** Complete SEO page — H1, introduction, body sections, comparison table if relevant, CTA, meta title, meta description, suggested internal links
- **Review:** Founder checks factual accuracy and approves. No structural rewriting expected — only fact correction and specificity additions.

**Keyword Research Brief**
- **Trigger:** Weekly, automatic
- **Input:** Product category, ICP definition, existing keyword list from storage
- **Output:** Prioritized list of 10 keywords — keyword phrase, estimated monthly searches, difficulty signal (low/medium/high), recommended content type, and one-line rationale for each
- **Review:** Founder selects which keywords to pursue this week. Selected keywords are queued for the SEO Content Writer.

**Search Console Optimizer**
- **Trigger:** Weekly, after Search Console data import
- **Input:** Search Console CSV export (user uploads), current page titles and descriptions
- **Output:** List of pages with high impressions but CTR below 3%, with 2 alternative title + description options for each
- **Review:** Founder selects the preferred option per page. Changes are exported as a formatted update list.

**Backlink Outreach Drafter**
- **Trigger:** Manual (from Bridge engine task) or weekly batch
- **Input:** Target domain URL (user provides), product context, ICP
- **Output:** Personalized outreach email — references the target site's specific content, explains relevance, makes a clear low-friction ask
- **Review:** Founder checks personalization accuracy and sends.

---

### Push Engine Workers

**LinkedIn Director** *(flagship AI feature — runs on full weekly schedule)*
- **Trigger:** Every Sunday at 08:00, automatic
- **Input:** Knowledge base (voice examples, ICP, positioning), recent post performance data if available, current product stage
- **Output (Phase 1 — Ideation):** 12 LinkedIn post ideas, each with: topic, hook angle, content type (educational/storytelling/lead-gen), and estimated engagement rationale. AI evaluates ideas internally before presenting — only the top 12 surface.
- **Output (Phase 2 — Post Writing):** For each idea selected by the founder (or all 12 if auto-approved), two variations: short-form (under 150 words) and long-form (200–400 words). Formatted for LinkedIn: short paragraphs, line breaks every 1–2 sentences, no bullet-heavy structure unless the content demands it.
- **Output (Phase 3 — Posting Calendar):** A 7-day schedule with recommended posting times, sequence rationale (educational early week → storytelling mid-week → lead-gen end of week), and fallback times if primary slots are missed.
- **Output (Phase 4 — Delivery):** On approval, posts are scheduled via LinkedIn API. Auto-publish at scheduled times. 30-minute override window: a notification is surfaced in the Inbox 30 minutes before each post goes live. If no action is taken, it publishes automatically.

**Email Sequence Writer**
- **Trigger:** Manual (when Push engine is activated for a product) or when stage changes to Pre-launch
- **Input:** Product context, ICP, launch timeline (user provides target launch date)
- **Output:** Complete 10-email pre-launch sequence — each email written for its position in the arc: problem definition, amplification, solution introduction, social proof, objection handling (×2), urgency, scarcity, launch, post-launch follow-up. Subject lines included.
- **Review:** Founder reads each email, adds personal anecdotes and specific examples, approves. Entire sequence scheduled for delivery at defined intervals.

**Lead Magnet Generator**
- **Trigger:** Manual (from Push engine task "Add 1 lead magnet")
- **Input:** ICP pain point selected by founder from a generated list, product context, tone parameters
- **Output:** Complete lead magnet document — not an outline, the actual content. Checklist, framework guide, or reference sheet depending on the format best suited to the pain point. Formatted and ready to deliver.
- **Review:** Founder checks accuracy and approves. Exported as a shareable document.

**Waitlist Page Copy Writer**
- **Trigger:** Manual (when a product moves to Pre-launch stage)
- **Input:** Product positioning, ICP definition, tone parameters
- **Output:** Complete landing page copy — headline, subheadline, three benefit blocks, social proof placeholders with guidance on what proof to add, FAQ (3–5 questions derived from the ICP's likely objections), and CTA. Two headline variants provided for testing.
- **Review:** Founder edits for specificity and approves.

**Content Performance Analyst**
- **Trigger:** Weekly, after LinkedIn data import (or manual refresh)
- **Input:** Recent post performance data (impressions, engagement rate, follower growth per post)
- **Output:** Pattern analysis brief — best-performing hooks, best-performing content types, best-performing posting days/times, and 3 specific recommendations for the coming week's content. Fed automatically into the LinkedIn Director's next run.
- **Review:** Read-only. Founder notes are optional.

---

### Bridge Engine Workers

**Connector Research Agent**
- **Trigger:** Weekly, automatic
- **Input:** ICP definition, product category, previously identified connectors (to avoid duplicates)
- **Output:** Ranked shortlist of 5 new connector candidates — name, platform, audience description, estimated audience size, why they are a fit, and a link to their profile. Uses web browsing to gather current data.
- **Review:** Founder selects which candidates to pursue. Selected candidates move to the outreach queue.

**Personalized Outreach Writer**
- **Trigger:** Automatic when a connector candidate is approved from research, or manual
- **Input:** Connector's profile URL or pasted profile content, product context, ICP
- **Output:** Initial outreach message + 2-step follow-up sequence. Initial message references the connector's specific recent content and frames the product as directly valuable to their audience. No generic pitching.
- **Review:** Founder checks personalization accuracy, adds any personal context, approves and sends.

**Custom Demo Script Generator**
- **Trigger:** Manual (when preparing for a connector conversation)
- **Input:** Connector's audience profile, product feature list, ICP
- **Output:** Demo script tailored to this specific connector's audience — highlights the features most relevant to them, uses the language their audience uses, anticipates the objections specific to this audience type
- **Review:** Founder uses as a guide; adapts in conversation.

**Follow-up Sequence Manager**
- **Trigger:** Automatic, daily check against connector pipeline status
- **Input:** Connector pipeline data (stored in a lightweight CRM added to the Bridge engine section — see CRM note below), last contact date, conversation status
- **Output:** Draft follow-up message for each connector that has gone past the follow-up threshold (configurable, default 5 days), contextually written based on where the conversation stands
- **Review:** Founder approves and sends each follow-up.

**Connector CRM (new sub-feature)**
Add a lightweight contact tracker within the Bridge engine view. Fields per connector: name, platform, audience size estimate, outreach status (identified / contacted / responded / active / dormant), last contact date, commission rate, notes. This data feeds the Follow-up Sequence Manager and the Connector Performance Brief.

**Connector Performance Brief**
- **Trigger:** Weekly, automatic
- **Input:** Connector CRM data, affiliate revenue data (user inputs manually or imports)
- **Output:** One-page brief — which connectors are active and producing, which are dormant, which have never converted, recommended actions for each category (re-engage dormant with new angle, increase commission for top performer, replace consistently inactive)
- **Review:** Founder reads and acts on recommendations.

---

### Search Engine Workers

**Keyword Strategy Brief**
- **Trigger:** Weekly, automatic
- **Input:** Product category, ICP, existing keyword tracking data, competitor domain (optional)
- **Output:** Prioritized action list — top 5 keywords to target this week, recommended content type, estimated ranking timeline, and one competitor currently ranking for each keyword
- **Review:** Founder selects keywords. Selected keywords queue in SEO Content Writer.

**Ad Copy Generator**
- **Trigger:** Weekly, automatic for active Google Ads campaigns; manual for new campaigns
- **Input:** Target keyword, landing page URL, ICP, current best-performing ad (if exists)
- **Output:** 3–5 Google Ads variations — each testing a different value proposition angle (outcome-focused, speed-focused, specificity-focused, pain-focused, competitor-contrast). Includes headline 1, headline 2, headline 3, description 1, description 2 per variation.
- **Review:** Founder selects 2–3 variations to run. Launches via Google Ads.

**Landing Page Copy Writer**
- **Trigger:** Manual (when targeting a new keyword cluster)
- **Input:** Target keyword, ICP, product positioning
- **Output:** Complete conversion-optimized landing page — headline tightly matched to search intent, subheadline, 3 benefit blocks, objection-handling section, social proof framework, CTA. Two headline variants for testing.
- **Review:** Founder edits for product-specific accuracy and publishes.

**ROAS Analyst**
- **Trigger:** Weekly, after Google Ads data import
- **Input:** Google Ads performance CSV (user uploads) — keyword, clicks, conversions, cost, revenue
- **Output:** Budget reallocation recommendation — scale these keywords (positive ROAS above target), pause these (negative ROAS or zero conversions over 2+ weeks), add these negative keywords (identified from search term report patterns), and a one-line summary of overall campaign health
- **Review:** Founder reviews recommendations and implements changes in Google Ads.

---

### Equity Engine Workers

**Partner Research Agent**
- **Trigger:** Manual (when Equity engine is activated for a product)
- **Input:** ICP definition, product category, product stage
- **Output:** Shortlist of 8–10 potential distribution partners — companies, coaching programs, communities, newsletters, or complementary SaaS tools. For each: estimated audience size, evidence of audience quality, relevance score, and a brief on why this partner's audience is a fit
- **Review:** Founder selects top 3 to approach.

**Pitch Package Generator**
- **Trigger:** Manual (when a partner is selected for outreach)
- **Input:** Partner profile, audience characteristics, product context, ICP
- **Output:** Complete pitch package — outreach message (zero-risk framing), one-page partnership overview, demo walkthrough script tailored to their audience, suggested deal structure based on estimated audience size
- **Review:** Founder personalizes the framing, adds any relationship context, sends.

**Post-Partnership Improvement Prioritizer**
- **Trigger:** Daily, once a partner is active
- **Input:** User feedback from the past 24 hours (support messages pasted or imported), current open issues
- **Output:** Single most important improvement to ship today, with rationale based on frequency and severity of mentions
- **Review:** Founder uses as the daily shipping priority.

---

### Persistence Engine Workers

**Weekly Diagnostician**
- **Trigger:** Every Sunday evening, automatic
- **Input:** Week completion data across all products, task completion rates by engine, historical completion trends
- **Output:** Diagnostic brief — which products are falling behind and why (specific failure pattern identified: momentum loss, wrong engine, messaging problem, or timing), and one specific actionable fix per at-risk product for the coming week
- **Review:** Read and act. Delivered Sunday evening so Monday starts with clarity.

**Messaging Clarity Analyzer**
- **Trigger:** Manual (from Persistence engine task or Settings)
- **Input:** Landing page copy (user pastes), ICP definition
- **Output:** Analysis of where the message is unclear, where it likely confuses the ICP, and where value is not articulated in customer language. Generates specific rewrite suggestions for the 2–3 weakest sections. Simulates five ICP-profile readers explaining the page back — the gap between their interpretation and intent is the messaging failure.
- **Review:** Founder implements suggested rewrites.

**Stage Transition Advisor**
- **Trigger:** Automatic, monitors weekly — fires when leading indicators suggest a stage transition is warranted
- **Input:** Completion rates, revenue inputs, channel performance signals, time in current stage
- **Output:** Transition recommendation — which stage to move to, which engine assignments to change, which tasks to add and deprioritize, what the new strategic goal should be
- **Review:** Founder confirms or defers the transition. If confirmed, Settings update automatically.

---

## 3. Integration Layer

These integrations enable autonomous publishing and data import. All are optional — the system degrades gracefully if an integration is not configured (AI still generates the artifact; the founder publishes manually).

### LinkedIn Integration
- **Purpose:** Auto-publish scheduled posts from the LinkedIn Director
- **Implementation:** OAuth connection to LinkedIn API. Store access token in `window.storage` under `integrations:linkedin`
- **Scope needed:** `w_member_social` (post on behalf of member)
- **Fallback:** If not connected, posts are formatted and copied to clipboard for manual publishing

### Google Search Console Integration
- **Purpose:** Import impressions/CTR data for the Search Console Optimizer
- **Implementation:** OAuth connection to Google Search Console API. Weekly data pull on scheduler run.
- **Fallback:** User uploads CSV export manually

### Google Ads Integration
- **Purpose:** Import campaign performance data for the ROAS Analyst
- **Implementation:** Google Ads API connection or CSV upload interface
- **Fallback:** User uploads CSV export manually

### Email Service Integration
- **Purpose:** Schedule and send the pre-launch email sequence generated by the Email Sequence Writer
- **Implementation:** API connection to the user's email service (Resend, Loops, Postmark — user selects). Sequences are uploaded via API on approval.
- **Fallback:** Sequences are exported as formatted text for manual upload

---

## 4. Automation Scheduler

The scheduler is the mechanism that transforms the system from manual to automatic. It runs workers on defined cadences without requiring the founder to trigger anything.

### Scheduler Architecture

Add a scheduler configuration panel in Settings. The user sets:
- Which workers run automatically vs. require manual trigger
- The cadence for each automatic worker (daily, weekly, day of week, time of day)
- Whether generated artifacts auto-approve after a defined period with no review (configurable, default off)

Store scheduler configuration in `window.storage` under `scheduler:config`.

### Default Schedule

| Worker | Default Cadence | Day/Time |
|---|---|---|
| LinkedIn Director | Weekly | Sunday 08:00 |
| Keyword Research Brief | Weekly | Sunday 08:00 |
| Connector Research Agent | Weekly | Sunday 08:00 |
| Weekly Diagnostician | Weekly | Sunday 20:00 |
| Content Performance Analyst | Weekly | Saturday 20:00 |
| ROAS Analyst | Weekly | Monday 07:00 (after weekend data) |
| Connector Performance Brief | Weekly | Monday 07:00 |
| Stage Transition Advisor | Weekly | Sunday 20:00 |
| Follow-up Sequence Manager | Daily | 09:00 |
| Post-Partnership Improvement Prioritizer | Daily | 08:00 |
| Search Console Optimizer | Weekly | Monday 07:00 |

### Scheduler Implementation

Use `setInterval` checks against stored next-run timestamps. On each check, compare current time to scheduled run times and invoke workers that are due. Store last-run and next-run timestamps per worker in `window.storage` under `scheduler:runs`.

For the LinkedIn Director specifically: the Sunday 08:00 run generates and queues to the Inbox. Posts scheduled for the week auto-publish at their configured times via LinkedIn API. The 30-minute override window surfaces the post in the Inbox with a countdown — if no action is taken, it publishes.

---

## Setup Sprint

The setup sprint is a one-time flow that takes the system from installed to fully autonomous in under an hour. It should be surfaced as a guided onboarding when no knowledge base exists.

**Step 1 — Products (5 minutes)**
Register each product: name, description, stage, primary and secondary engines. This already exists in Settings — no change needed.

**Step 2 — Knowledge Base per product (20 minutes)**
For each product: paste voice examples, complete ICP form, complete positioning form, set tone parameters.

**Step 3 — Integrations (15 minutes)**
Connect LinkedIn, Google Search Console, Google Ads, and email service. Each connection is a single OAuth flow. Skip any that are not yet relevant.

**Step 4 — Scheduler (5 minutes)**
Review default schedule. Adjust any timing preferences. Enable auto-publish for LinkedIn (on/off toggle, can be changed at any time).

**Step 5 — First Run (immediate)**
Trigger the first manual run of all weekly workers. Review the Inbox. Approve, edit, or redirect the first batch of generated artifacts. This calibrates the knowledge base with the first round of approved output.

After the setup sprint, the system runs autonomously. The founder's weekly interaction from this point forward is: open Inbox, review and approve the week's generated artifacts, close it.

---

## The Inbox (New View)

Add Inbox between Dashboard and Products in the navigation. This is the central review interface for all AI-generated artifacts.

**Inbox structure:**
- Grouped by product, then by engine
- Each artifact shows: type, content preview, full content on expand, which task it fulfills, generated timestamp
- Status: Pending Review / Approved / Scheduled / Published / Regenerating
- Actions: Approve / Edit + Approve / Regenerate (with optional direction note) / Dismiss
- Filter by product, engine, status, or date

**Inbox badge on nav:** Shows count of items pending review so the founder always knows at a glance whether attention is needed.

**Auto-approve threshold (optional):** The founder can set a confidence threshold per worker — if the AI's self-assessed quality score exceeds the threshold, the artifact auto-approves without review. Starts off by default; can be enabled once the founder trusts the output quality.

---

## Changes to Existing Views

### Dashboard
Add an Inbox summary card: "X items pending review across Y products." Links to Inbox.

Add a weekly automation status: which workers ran this week, which are scheduled next, last run time for each.

### Per-Product Task View
Each task that has an AI worker associated with it gets a "Generate" button. Clicking it invokes the relevant worker immediately and routes output to the Inbox. Tasks with pending Inbox items show a badge indicator.

### Settings
Add three new sections:
- Knowledge Base (per product)
- Integrations (LinkedIn, Google, email service)
- Scheduler (cadence configuration, auto-approve settings)

---

## What Does Not Change

The existing v1 structure — product registry, weekly task list, engine reference, roadmap, completion tracking, point system, local storage — remains exactly as built. Nothing is removed. The AI layer is additive.

---

## Build Priority Order

If building incrementally, prioritize in this order to get maximum automation impact earliest:

1. **Knowledge Base setup flow** — everything depends on this; build first
2. **Inbox view** — the review interface for all AI output; needed before any workers are useful
3. **LinkedIn Director** — highest-impact single worker; automates the most time-consuming Push engine task
4. **Connector Research + Outreach Writer** — fastest path to Bridge engine revenue
5. **Scheduler** — makes everything automatic rather than manually triggered
6. **LinkedIn Integration** — enables auto-publish; completes the LinkedIn Director loop
7. **SEO Content Writer + Keyword Brief** — completes the Pull engine automation
8. **Ad Copy Generator + ROAS Analyst** — completes the Search engine automation
9. **Email Sequence Writer** — completes the Push engine automation
10. **All remaining workers** — in any order after the above

Items 1–5 get the system to meaningful automation. Items 6–10 complete it.

---

*Predivo GmbH — 2026 | Handoff to Claude Code*
