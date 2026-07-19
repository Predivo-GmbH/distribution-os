# Distribution-OS — Manual End-to-End Test Protocol

**Purpose:** Step-by-step guide for Roger to test the entire system as a real user would experience it. Each test case has a concrete action, expected result, and a pass/fail checkbox.

**URL:** https://distributionos.predivo.ch
**Password Gate:** `predivo2026`

---

## How to Use This Document

1. Open the production URL in an **incognito/private browser window** (clean state, no cached sessions).
2. Work through each section in order — they follow the natural user journey.
3. For each test, perform the action and check if the expected result matches what you see.
4. Mark PASS or FAIL. If FAIL, note what happened instead.
5. Some tests require waiting (AI generation takes 2-5s, emails take up to 60s).

---

## PHASE 1 — First Contact (Public Pages)

### 1.1 Password Gate
| # | Action | Expected Result | Pass/Fail |
|---|--------|----------------|-----------|
| 1 | Open https://distributionos.predivo.ch | "Early Access" gate appears, password input field focused | |
| 2 | Type `wrong` and press Enter | Error message "Incorrect code. Try again." Input clears. | |
| 3 | Type `predivo2026` and press Enter | Gate disappears, landing page loads | |
| 4 | Refresh the page | Landing page loads directly (no gate — session remembered) | |

### 1.2 Landing Page
| # | Action | Expected Result | Pass/Fail |
|---|--------|----------------|-----------|
| 5 | Scroll through the entire landing page | Hero section, animated stats, engine cards, testimonials, FAQ section all render. No broken images, no layout jumps. | |
| 6 | Click any FAQ item | Accordion expands/collapses smoothly | |
| 7 | Click "Get Started" in the hero or nav | Navigates to /signup | |
| 8 | Go back, click "Log In" in nav | Navigates to /login | |

### 1.3 Pricing Page
| # | Action | Expected Result | Pass/Fail |
|---|--------|----------------|-----------|
| 9 | Navigate to /pricing | 4 tier cards visible: Free ($0), Starter ($19), Growth ($49), Scale ($99). "Founding Member" badge visible. | |
| 10 | Click "Get Starter" (or any paid tier CTA) | Either: Stripe checkout page opens, OR error "Please log in first" (both acceptable for unauthenticated user) | |

---

## PHASE 2 — Account Creation

### 2.1 Sign Up
| # | Action | Expected Result | Pass/Fail |
|---|--------|----------------|-----------|
| 11 | Navigate to /signup | Email input form renders | |
| 12 | Enter your real email address and submit | Step 2 appears: 6-digit OTP input boxes. "Check your email" message shown. | |
| 13 | Check your email inbox (within 60s) | Email from "Distribution-OS" (NOT "ShipSolo") with a 6-digit code. Subject contains the code. | |
| 14 | Enter the 6-digit code (or paste it) | OTP boxes auto-advance. Step 3 appears: password setup. | |
| 15 | Enter a password (min 6 chars) and confirm | Account created. Redirected to /dashboard. Onboarding wizard starts. | |

### 2.2 Email Branding Check
| # | Action | Expected Result | Pass/Fail |
|---|--------|----------------|-----------|
| 16 | Open the verification email you received | Sender name: "Distribution-OS". No mention of "ShipSolo" anywhere in the email body, subject, or footer. | |

---

## PHASE 3 — Onboarding (First Mission)

### 3.1 Welcome
| # | Action | Expected Result | Pass/Fail |
|---|--------|----------------|-----------|
| 17 | Dashboard shows First Mission wizard | Step 1: Welcome screen with explanation of what Distribution-OS does. "Start First Mission" or "Next" button visible. | |
| 18 | Click Next | Step 2: Product Name + Description form | |

### 3.2 Product Setup (Step 2)
| # | Action | Expected Result | Pass/Fail |
|---|--------|----------------|-----------|
| 19 | Enter a product name, e.g. "My SaaS Tool" | Name field accepts input | |
| 20 | Enter a description, e.g. "A project management tool for remote teams" | Description field accepts input | |
| 21 | Click "AI Suggest — auto-fill description, stage & engines" | Loading spinner appears. After 2-5 seconds: description field updates with AI-generated text, stage auto-selects, engines auto-select. No error message. | |
| 22 | Verify the AI-generated content makes sense | Description is relevant to your product name. Stage is reasonable. Engine selections are logical. | |
| 23 | Click Next | Step 3: Stage Select | |

### 3.3 Stage Select (Step 3)
| # | Action | Expected Result | Pass/Fail |
|---|--------|----------------|-----------|
| 24 | See 4 stage options: Pre-Launch, Early, Active, Scaling | All 4 radio buttons visible with descriptions | |
| 25 | Click a different stage than AI suggested | Selection changes, previous deselects | |
| 26 | Click Next | Step 4: Engine Select | |

### 3.4 Engine Select (Step 4)
| # | Action | Expected Result | Pass/Fail |
|---|--------|----------------|-----------|
| 27 | See 6 engines: Push, Pull, Product, Partnerships, Paid, Bridge | All 6 engine cards visible with descriptions | |
| 28 | Select a primary engine (click one) | Card highlights as primary | |
| 29 | Toggle 1-2 secondary engines | Cards highlight differently from primary | |
| 30 | Click Next | Step 5: Mission Briefing | |

### 3.5 Mission Briefing & Launch (Step 5)
| # | Action | Expected Result | Pass/Fail |
|---|--------|----------------|-----------|
| 31 | Review summary: product name, description, stage, engines | All selections from previous steps shown correctly | |
| 32 | Click "Launch" or "Create Product" | Product created. Welcome Modal appears OR redirected to Dashboard. | |
| 33 | Dismiss welcome modal if shown | Dashboard loads with your product visible | |

---

## PHASE 4 — Dashboard (Command Center)

### 4.1 Task Generation
| # | Action | Expected Result | Pass/Fail |
|---|--------|----------------|-----------|
| 34 | Dashboard shows "Command Center" heading | Weekly tasks visible, grouped by engine. Week date range shown at top. | |
| 35 | Count the tasks | Tasks match the engines you selected (e.g., Push engine → push-related tasks) | |
| 36 | Check a task checkbox | Task marked as complete. Progress bar updates. | |
| 37 | Uncheck the same task | Task unmarked. Progress bar reverts. | |

### 4.2 Search & Filter
| # | Action | Expected Result | Pass/Fail |
|---|--------|----------------|-----------|
| 38 | Type a keyword in the search/filter box | Tasks filter in real-time to show only matching ones | |
| 39 | Clear search | All tasks visible again | |

### 4.3 AI Generate from Dashboard
| # | Action | Expected Result | Pass/Fail |
|---|--------|----------------|-----------|
| 40 | Find a task with a "Generate" or AI button | Button visible next to task | |
| 41 | Click the Generate button | Loading state. After 3-10s: content generated and saved. Either shows inline result or notification that it's in Inbox. | |
| 42 | Navigate to /inbox | The generated content appears as a pending artifact | |

---

## PHASE 5 — Inbox (Content Review)

### 5.1 Artifact Management
| # | Action | Expected Result | Pass/Fail |
|---|--------|----------------|-----------|
| 43 | Inbox shows at least 1 pending artifact from step 41 | Artifact card with title, engine badge, "pending" status | |
| 44 | Click to expand the artifact | Full generated content visible | |
| 45 | Click "Approve" | Status changes to "approved". Approved timestamp shown. | |
| 46 | Generate another artifact (go back to Dashboard, generate another task) | Second artifact appears in Inbox | |
| 47 | Click "Edit" on the new artifact | Inline textarea appears with the content. Edit the text. | |
| 48 | Save/approve the edited artifact | Edited content saved. Status updated. | |
| 49 | Generate a third artifact | Third artifact appears | |
| 50 | Click "Dismiss" on it | Status changes to "dismissed" | |
| 51 | Click "Delete" on the dismissed artifact | Artifact removed permanently from list | |

### 5.2 Filters
| # | Action | Expected Result | Pass/Fail |
|---|--------|----------------|-----------|
| 52 | Use the status filter dropdown (pending/approved/dismissed) | List filters to show only matching artifacts | |
| 53 | Use the engine filter dropdown | List filters by engine | |
| 54 | Use the product filter dropdown | List filters by product | |
| 55 | Reset all filters | All artifacts visible | |

---

## PHASE 6 — Products Page

| # | Action | Expected Result | Pass/Fail |
|---|--------|----------------|-----------|
| 56 | Navigate to /products | Product card visible with name, stage badge, description, engine badges | |
| 57 | Click the product card | Product detail page: name, stage, engines, task list grouped by engine | |
| 58 | Go back to /products. Click "Add Product" button | Modal opens with empty form fields | |
| 59 | Fill in name, description, pick stage + engines, submit | New product created. Appears in product list. | |
| 60 | Click "Edit" on the new product | Modal opens with pre-filled values from the product | |
| 61 | Change the description and save | Product updated with new description | |

**Note:** Free tier limits to 1 product. If you see "Free plan allows only 1 product. Upgrade to continue." — that's the tier enforcement working correctly. Skip to Phase 7.

---

## PHASE 7 — Knowledge Base & Settings

### 7.1 Knowledge Base
| # | Action | Expected Result | Pass/Fail |
|---|--------|----------------|-----------|
| 62 | Navigate to /settings → Knowledge Base tab | Product selector at top. 4 sections: Voice Examples, ICP Definition, Positioning, Tone. "Not set up" badge if empty. | |
| 63 | Select your product in the dropdown | Form loads (empty or with data if AI populated it) | |
| 64 | Add a Voice Example: type text, press Enter/Add | Example appears as a tag/pill. Can add multiple. | |
| 65 | Remove a voice example (click X) | Example removed from list | |
| 66 | Fill in ICP Definition: Who, Pain, Tried Before, Desired Outcome, Online Hangouts | All 5 fields accept text. Auto-saves (no explicit save button, or save confirms). | |
| 67 | Fill in Positioning: One-liner, 3 Benefits, Competitor, Switch Reason | All fields accept text | |
| 68 | Adjust Tone: Formality, Technicality, Boldness, Length Preference | Slider/radio changes persist | |

### 7.2 AI Configuration
| # | Action | Expected Result | Pass/Fail |
|---|--------|----------------|-----------|
| 69 | Click "AI Configuration" tab | API key input field visible. Model selector (Sonnet/Haiku/Opus). | |
| 70 | Enter your Anthropic API key (or a test key) | Field accepts input. Show/hide toggle works. | |
| 71 | Click Save | Confirmation message. Key persisted (refresh page, key still there). | |
| 72 | Change model selector | Selection changes and persists | |

### 7.3 Integrations
| # | Action | Expected Result | Pass/Fail |
|---|--------|----------------|-----------|
| 73 | Click "Integrations" tab | 4 cards: LinkedIn, Google Search Console, Google Ads, Email. All show "Not connected". | |
| 74 | Enter a test token in any integration | Token field accepts input. Auto-publish toggle available. | |

### 7.4 Scheduler
| # | Action | Expected Result | Pass/Fail |
|---|--------|----------------|-----------|
| 75 | Click "Scheduler" tab | Master enable/disable toggle. Worker schedule list with cadence badges. | |
| 76 | Toggle master scheduler on/off | Toggle state changes | |
| 77 | Click "Save Schedule" | "Saved" confirmation appears | |

### 7.5 General Settings
| # | Action | Expected Result | Pass/Fail |
|---|--------|----------------|-----------|
| 78 | Click "General" tab | Dark Mode toggle, Week Starts On selector, Export Data, Reset All Data, Sign Out | |
| 79 | Toggle Dark Mode | UI switches to dark theme immediately | |
| 80 | Toggle back to Light Mode | UI switches back | |
| 81 | Change "Week Starts On" to Sunday | Selection persists after refresh | |
| 82 | Click "Export Data" | JSON file downloads with your products, tasks, settings | |

---

## PHASE 8 — AI-Powered Pages

**Important:** Each of these pages calls the `call-ai` edge function. If AI Suggest worked in Phase 3, these should all work. Each generation takes 3-10 seconds.

### 8.1 Idea Validation (/validate)
| # | Action | Expected Result | Pass/Fail |
|---|--------|----------------|-----------|
| 83 | Navigate to /validate | Product selector + 3 worker panels: Market Researcher, Competitor Analyst, Distribution Specialist | |
| 84 | Select your product, click "Run" on Market Researcher | Loading state → AI-generated market research appears in the panel (3-10s) | |
| 85 | Run Competitor Analyst | AI-generated competitor analysis appears | |
| 86 | Run Distribution Specialist | AI-generated distribution strategy appears | |

### 8.2 Offer Builder (/brief)
| # | Action | Expected Result | Pass/Fail |
|---|--------|----------------|-----------|
| 87 | Navigate to /brief | Product selector + Product Definer and Offer Designer workers | |
| 88 | Run Product Definer | AI-generated product definition appears | |
| 89 | Run Offer Designer | AI-generated offer design appears | |

### 8.3 Engine Playbooks (/playbooks)
| # | Action | Expected Result | Pass/Fail |
|---|--------|----------------|-----------|
| 90 | Navigate to /playbooks | Product selector + "Get Advice" button + per-engine playbook generators | |
| 91 | Click "Get Advice" | Engine Advisor AI runs → recommendation text appears | |
| 92 | Generate a playbook for one of your engines | AI-generated playbook appears. Can expand/collapse. | |

### 8.4 Proposals & Content (/proposals)
| # | Action | Expected Result | Pass/Fail |
|---|--------|----------------|-----------|
| 93 | Navigate to /proposals | 4 tabs: Proposal, Content Calendar, Video Scripts, Outreach DMs | |
| 94 | Proposal tab: paste any text (pretend it's a sales transcript), click Generate | AI-generated proposal appears | |
| 95 | Content Calendar tab: click Generate | 7-day content calendar appears | |
| 96 | Video Scripts tab: click Generate | Short/medium/long video scripts appear | |
| 97 | Outreach DMs tab: click Generate | LinkedIn/Twitter/Email sequence appears | |
| 98 | Click Copy or Download on any result | Content copied to clipboard / file downloads | |

### 8.5 Design Build Kit (/build-kit)
| # | Action | Expected Result | Pass/Fail |
|---|--------|----------------|-----------|
| 99 | Navigate to /build-kit | 5-step wizard | |
| 100 | Step 1: Add a reference URL (any website) | URL appears in list. Can add up to 5. Can remove. | |
| 101 | Step 2: Run Brand Analyzer | AI analysis result appears | |
| 102 | Step 3: Run Token Extractor | Design tokens generated | |
| 103 | Step 4: Run Brand Book Generator | 17-section brand book generated | |
| 104 | Step 5: Run Consistency Checker | Alignment report generated | |

### 8.6 8-Domain Audit (/audit)
| # | Action | Expected Result | Pass/Fail |
|---|--------|----------------|-----------|
| 105 | Navigate to /audit | Product selector + repo context textarea + 8 domain panels | |
| 106 | Optionally enter project context, then click "Run Full Audit" | All 8 domains run in parallel. Results appear in expandable panels. Takes 15-30s. | |
| 107 | Click "Export" | Combined audit report downloads as text file | |

### 8.7 Site Analysis (/analyze)
| # | Action | Expected Result | Pass/Fail |
|---|--------|----------------|-----------|
| 108 | Navigate to /analyze | URL input + 2 tabs: Deep Analysis, Quick Score | |
| 109 | Enter any website URL, run Deep Analysis | AI reverse-engineers the site. Result appears. | |
| 110 | Switch to Quick Score tab, run | 17-item conversion checklist audit appears | |

---

## PHASE 9 — Schedule & Operations

| # | Action | Expected Result | Pass/Fail |
|---|--------|----------------|-----------|
| 111 | Navigate to /schedule | 3 tabs: Daily Routine, Weekly Automations, Activity Monitor | |
| 112 | Daily Routine tab: expand a time block | 4 blocks (Market Pulse, Build, Content, Outreach) with tasks inside | |
| 113 | Weekly Automations tab | Shows scheduled workers from your scheduler config | |
| 114 | Activity Monitor tab | Shows recent worker run records (may be empty if no runs yet) | |

---

## PHASE 10 — Launch Checklist & Briefing Room

| # | Action | Expected Result | Pass/Fail |
|---|--------|----------------|-----------|
| 115 | Navigate to /setup | 7 categories with progress bar | |
| 116 | Check a few items | Checkmarks persist. Progress bar updates. | |
| 117 | Collapse/expand a category | Accordion works | |
| 118 | Navigate to /briefing | 5 tabs: Overview, Engines, Stages, Scoring, Workflow & Glossary | |
| 119 | Click through all 5 tabs | Each tab loads content. Engine cards expand. Stage panels show details. | |

---

## PHASE 11 — Stripe Billing

| # | Action | Expected Result | Pass/Fail |
|---|--------|----------------|-----------|
| 120 | Navigate to /pricing (while logged in) | 4 tier cards. Your current tier highlighted. | |
| 121 | Click upgrade button on a paid tier | Stripe checkout page opens (real Stripe, use test card `4242 4242 4242 4242` if in test mode, or cancel if live mode) | |
| 122 | Cancel and go back | Returns to app without error | |

---

## PHASE 12 — Auth Flows

### 12.1 Sign Out & Back In
| # | Action | Expected Result | Pass/Fail |
|---|--------|----------------|-----------|
| 123 | Go to Settings → General → Sign Out | Session cleared. Redirected to /login. | |
| 124 | Try accessing /dashboard directly | Redirected to /login | |
| 125 | Log in with email + password (from step 15) | Login succeeds. Dashboard loads with your product and tasks still there. | |

### 12.2 Password Reset
| # | Action | Expected Result | Pass/Fail |
|---|--------|----------------|-----------|
| 126 | Sign out. Go to /reset-password | Email form renders | |
| 127 | Enter your email and submit | "Check your email" message | |
| 128 | Check email inbox | Reset email from "Distribution-OS" with a link. No "ShipSolo" branding. | |
| 129 | Click the link, set new password | Password updated. Can log in with new password. | |

### 12.3 OTP Login
| # | Action | Expected Result | Pass/Fail |
|---|--------|----------------|-----------|
| 130 | On /login, switch to "Email Code" tab | OTP email input form | |
| 131 | Enter email, submit | 6-digit OTP input appears. Check email for code. | |
| 132 | Enter code | Login succeeds. Dashboard loads. | |

---

## PHASE 13 — Data Persistence Check

| # | Action | Expected Result | Pass/Fail |
|---|--------|----------------|-----------|
| 133 | After completing phases above, close the browser entirely | — | |
| 134 | Reopen browser, go to distributionos.predivo.ch, log in | All your data is still there: product, tasks, inbox artifacts, knowledge base, settings | |
| 135 | Check task completion states | Tasks you checked/unchecked are in the correct state | |
| 136 | Check inbox artifacts | Approved/dismissed/deleted states persisted | |
| 137 | Check knowledge base | ICP, positioning, tone, voice examples all saved | |

---

## PHASE 14 — Edge Cases & Error Handling

| # | Action | Expected Result | Pass/Fail |
|---|--------|----------------|-----------|
| 138 | Try to add a product with empty name | Validation error prevents submission | |
| 139 | Navigate to a non-existent route like /nonexistent | Redirects to /dashboard (not a 404 or blank page) | |
| 140 | Open browser console (F12), navigate through the app | No red console errors on any page | |
| 141 | Resize browser to mobile width (375px) | Layout adjusts. Sidebar collapses. All content accessible. | |
| 142 | Try Reset All Data (Settings → General) | Confirmation dialog appears. If confirmed: all products, tasks, artifacts cleared. Dashboard shows onboarding again. | |

---

## Results Summary

| Phase | Tests | Passed | Failed |
|-------|-------|--------|--------|
| 1. First Contact | 1-10 | /10 | |
| 2. Account Creation | 11-16 | /6 | |
| 3. Onboarding | 17-33 | /17 | |
| 4. Dashboard | 34-42 | /9 | |
| 5. Inbox | 43-55 | /13 | |
| 6. Products | 56-61 | /6 | |
| 7. Settings | 62-82 | /21 | |
| 8. AI Pages | 83-110 | /28 | |
| 9. Schedule & Ops | 111-114 | /4 | |
| 10. Checklist & Briefing | 115-119 | /5 | |
| 11. Stripe | 120-122 | /3 | |
| 12. Auth Flows | 123-132 | /10 | |
| 13. Data Persistence | 133-137 | /5 | |
| 14. Edge Cases | 138-142 | /5 | |
| **TOTAL** | **142** | **/142** | |

---

## Notes

- **Free tier limits:** 1 product, 3 AI runs/month. If you hit limits, that's the tier enforcement working. Upgrade via Stripe or ask me to set your tier to `pro` in the database.
- **AI generation speed:** Each AI call takes 3-10 seconds. Full audit (8 domains parallel) takes 15-30 seconds.
- **Offline-first architecture:** Data saves to localStorage immediately and syncs to Supabase in the background. If Supabase is temporarily unreachable, the app still works locally.
- **BYOK (Bring Your Own Key):** If you enter your own Anthropic API key in Settings → AI Configuration, AI calls use your key directly instead of the shared edge function quota.
