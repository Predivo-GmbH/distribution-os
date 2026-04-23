# Distribution OS — Feature Registry

This document tracks all implemented features, their routes, components, and test coverage.

---

## Public Pages

### F-001: Landing Page
- **Status:** implemented
- **Route:** /
- **Description:** Marketing landing page with hero, 6 engine descriptions, how-it-works steps, and CTA sections
- **Components:** `src/pages/Landing.tsx`, `src/components/shared/Logo.tsx`
- **Test Files:**
  - Unit: `src/pages/__tests__/Landing.test.tsx`
  - E2E: `e2e/smoke.spec.ts`
  - A11y: `e2e/accessibility.spec.ts`

### F-002: Pricing Page
- **Status:** implemented
- **Route:** /pricing
- **Description:** Free vs Pro plan comparison with feature matrix and CTA links
- **Components:** `src/pages/Pricing.tsx`
- **Test Files:**
  - Unit: `src/pages/__tests__/Pricing.test.tsx`
  - E2E: `e2e/smoke.spec.ts`
  - A11y: `e2e/accessibility.spec.ts`

### F-003: Login Page
- **Status:** implemented
- **Route:** /login
- **Description:** Email/password login form with error handling and navigation to signup/reset
- **Components:** `src/pages/Login.tsx`, `src/hooks/useAuth.ts`
- **Test Files:**
  - Unit: `src/pages/__tests__/Login.test.tsx`
  - E2E: `e2e/smoke.spec.ts`
  - A11y: `e2e/accessibility.spec.ts`

### F-004: Sign Up Page
- **Status:** implemented
- **Route:** /signup
- **Description:** Multi-step sign up flow: email -> OTP verification -> optional password
- **Components:** `src/pages/SignUp.tsx`, `src/hooks/useAuth.ts`
- **Test Files:**
  - Unit: `src/pages/__tests__/SignUp.test.tsx`
  - E2E: `e2e/smoke.spec.ts`
  - A11y: `e2e/accessibility.spec.ts`

### F-005: Reset Password Page
- **Status:** implemented
- **Route:** /reset-password
- **Description:** Password reset request form and password update form (via recovery link)
- **Components:** `src/pages/ResetPassword.tsx`, `src/hooks/useAuth.ts`
- **Test Files:**
  - Unit: `src/pages/__tests__/ResetPassword.test.tsx`
  - E2E: `e2e/smoke.spec.ts`

---

## Authentication & Access Control

### F-006: Password Gate
- **Status:** implemented
- **Route:** (wraps entire app)
- **Description:** Pre-launch access gate using SHA-256 hashed password. Stores session in sessionStorage.
- **Components:** `src/components/shared/PasswordGate.tsx`
- **Test Files:**
  - Unit: `src/components/shared/__tests__/PasswordGate.test.tsx`
  - E2E: `e2e/features.spec.ts`

### F-007: Auth Hook
- **Status:** implemented
- **Route:** (global)
- **Description:** useAuth hook providing signIn, signUp, sendOtp, verifyOtp, resetPassword, updatePassword, signOut
- **Components:** `src/hooks/useAuth.ts`, `src/lib/supabase.ts`, `src/lib/supabase-config.ts`
- **Test Files:**
  - Unit: `src/pages/__tests__/Login.test.tsx`

---

## Core App Features

### F-008: Dashboard / Command Center
- **Status:** implemented
- **Route:** /dashboard
- **Description:** Weekly task board with per-engine metric cards, task completion, search filtering, and inbox summary
- **Components:** `src/components/dashboard/Dashboard.tsx`, `src/components/shared/GenerateButton.tsx`, `src/components/shared/IntelligencePanel.tsx`
- **Test Files:**
  - E2E: `e2e/smoke.spec.ts`, `e2e/features.spec.ts`
  - A11y: `e2e/accessibility.spec.ts`

### F-009: Products List
- **Status:** implemented
- **Route:** /products
- **Description:** Grid of product cards showing name, stage, engine badges, and task progress. Add Product modal.
- **Components:** `src/components/products/ProductsList.tsx`, `src/components/shared/AddProductModal.tsx`
- **Test Files:**
  - Unit: `src/components/shared/__tests__/AddProductModal.test.tsx`
  - E2E: `e2e/smoke.spec.ts`, `e2e/features.spec.ts`
  - A11y: `e2e/accessibility.spec.ts`

### F-010: Product Detail View
- **Status:** implemented
- **Route:** /products/:id
- **Description:** Single product view with stage recommendation, tasks grouped by engine, breadcrumb navigation
- **Components:** `src/components/products/ProductView.tsx`
- **Test Files:**
  - E2E: `e2e/smoke.spec.ts`, `e2e/features.spec.ts`

### F-011: Settings
- **Status:** implemented
- **Route:** /settings
- **Description:** Tabbed settings panel: Products, Knowledge Base, AI Config, Integrations, Scheduler, Tasks, Metrics, General
- **Components:** `src/components/settings/Settings.tsx`, `src/components/settings/GeneralTab.tsx`, `src/components/settings/ProductsTab.tsx`, `src/components/settings/KnowledgeBaseTab.tsx`, `src/components/settings/AIConfigTab.tsx`, `src/components/settings/IntegrationsTab.tsx`, `src/components/settings/SchedulerTab.tsx`, `src/components/settings/TasksTab.tsx`, `src/components/settings/MetricsTab.tsx`
- **Test Files:**
  - E2E: `e2e/smoke.spec.ts`, `e2e/features.spec.ts`
  - A11y: `e2e/accessibility.spec.ts`

### F-012: Briefing Room
- **Status:** implemented
- **Route:** /briefing
- **Description:** Reference guide with Overview, Engines (expandable cards), Stages (stepper), Scoring, and Workflow/Glossary tabs
- **Components:** `src/components/briefing/BriefingRoom.tsx`, `src/components/shared/Tooltip.tsx`
- **Test Files:**
  - Unit: `src/components/shared/__tests__/Tooltip.test.tsx`
  - E2E: `e2e/smoke.spec.ts`, `e2e/features.spec.ts`
  - A11y: `e2e/accessibility.spec.ts`

### F-013: Inbox (Artifact Review)
- **Status:** implemented
- **Route:** /inbox
- **Description:** AI-generated artifact inbox with status filters, product/engine filters, approve/edit/regenerate/dismiss actions
- **Components:** `src/components/inbox/Inbox.tsx`
- **Test Files:**
  - E2E: `e2e/smoke.spec.ts`, `e2e/features.spec.ts`
  - A11y: `e2e/accessibility.spec.ts`

---

## Onboarding

### F-014: First Mission (Onboarding)
- **Status:** implemented
- **Route:** /dashboard (conditional)
- **Description:** 5-step onboarding wizard: Welcome -> Product Name -> Stage Select -> Engine Select -> Mission Briefing
- **Components:** `src/components/onboarding/FirstMission.tsx`, `src/components/onboarding/steps/Welcome.tsx`, `src/components/onboarding/steps/ProductName.tsx`, `src/components/onboarding/steps/StageSelect.tsx`, `src/components/onboarding/steps/EngineSelect.tsx`, `src/components/onboarding/steps/MissionBriefing.tsx`
- **Test Files:**
  - Unit: `src/hooks/__tests__/useOnboardingState.test.ts`

### F-015: Setup Sprint
- **Status:** implemented
- **Route:** /dashboard (conditional)
- **Description:** Post-first-mission setup sprint guiding users through initial configuration
- **Components:** `src/components/onboarding/SetupSprint.tsx`
- **Test Files:**
  - Unit: `src/hooks/__tests__/useOnboardingState.test.ts`

---

## Data Layer

### F-016: localStorage Data Layer
- **Status:** implemented
- **Route:** (global)
- **Description:** Full CRUD for products, tasks, preferences, inbox artifacts, and knowledge base via localStorage with Supabase sync
- **Components:** `src/lib/storage.ts`
- **Test Files:**
  - Unit: `src/lib/__tests__/storage.test.ts`

### F-017: Supabase Data Layer
- **Status:** implemented
- **Route:** (global)
- **Description:** Cloud persistence via Supabase for products, tasks, preferences, inbox artifacts, and knowledge bases
- **Components:** `src/lib/supabase-storage.ts`, `src/lib/supabase.ts`, `src/lib/supabase-config.ts`
- **Test Files:**
  - Unit: `src/test/setup.ts`

### F-018: App State Management
- **Status:** implemented
- **Route:** (global)
- **Description:** useReducer-based state management with actions: ADD_PRODUCT, UPDATE_PRODUCT, REMOVE_PRODUCT, SET_TASKS, TOGGLE_TASK, ARCHIVE_WEEK, IMPORT/RESET_STATE
- **Components:** `src/hooks/useAppState.ts`
- **Test Files:**
  - Unit: `src/hooks/__tests__/useOnboardingState.test.ts` (partial)

### F-019: User Preferences
- **Status:** implemented
- **Route:** (global)
- **Description:** Dark mode toggle and week start day preference with localStorage + Supabase sync
- **Components:** `src/hooks/usePreferences.ts`
- **Test Files:**
  - Unit: `src/hooks/__tests__/usePreferences.test.ts`

---

## AI System

### F-020: AI Configuration
- **Status:** implemented
- **Route:** /settings (AI Config tab)
- **Description:** API key, model, max tokens, and proxy URL configuration stored in localStorage
- **Components:** `src/lib/ai/config.ts`, `src/components/settings/AIConfigTab.tsx`
- **Test Files:**
  - Unit: `src/lib/ai/__tests__/config.test.ts`

### F-021: Task Template System
- **Status:** implemented
- **Route:** (global)
- **Description:** 26 task templates across 6 engines and 4 stages. Stage x Engine matrix for weekly task generation.
- **Components:** `src/data/task-templates.ts`
- **Test Files:**
  - Unit: `src/data/__tests__/task-templates.test.ts`

### F-022: Automation Scheduler
- **Status:** implemented
- **Route:** (background)
- **Description:** 60-second interval scheduler that runs AI workers for due tasks
- **Components:** `src/hooks/useScheduler.ts`, `src/lib/ai/scheduler.ts`
- **Test Files:**
  - E2E: `e2e/smoke.spec.ts`

### F-023: AI Workers
- **Status:** implemented
- **Route:** (background)
- **Description:** 24 specialized AI workers across 6 engines: Pull (4), Push (5), Bridge (5), Search (4), Equity (3), Persistence (3)
- **Components:** `src/lib/ai/pull-workers.ts`, `src/lib/ai/push-workers.ts`, `src/lib/ai/bridge-workers.ts`, `src/lib/ai/search-workers.ts`, `src/lib/ai/equity-workers.ts`, `src/lib/ai/persistence-workers.ts`, `src/lib/ai/linkedin-director.ts`, `src/lib/ai/worker-base.ts`
- **Test Files:**
  - Unit: `src/lib/ai/__tests__/config.test.ts`

---

## UI Components

### F-024: App Layout (Sidebar)
- **Status:** implemented
- **Route:** (authenticated shell)
- **Description:** Responsive sidebar with nav items, engine indicators, briefing badge, and mobile hamburger drawer
- **Components:** `src/components/layout/AppLayout.tsx`
- **Test Files:**
  - E2E: `e2e/features.spec.ts`

### F-025: Button Component
- **Status:** implemented
- **Route:** (global)
- **Description:** CVA-based button with primary/destructive/ghost variants and sm/md/lg/full sizes
- **Components:** `src/components/ui/Button.tsx`
- **Test Files:**
  - Unit: `src/components/ui/__tests__/Button.test.tsx`

### F-026: Input Component
- **Status:** implemented
- **Route:** (global)
- **Description:** Styled input with consistent border, focus ring, and 44px minimum height
- **Components:** `src/components/ui/Input.tsx`
- **Test Files:**
  - Unit: `src/components/ui/__tests__/Input.test.tsx`

### F-027: Loading Spinner
- **Status:** implemented
- **Route:** (global)
- **Description:** Accessible loading spinner with role="status" and sr-only text, optional fullPage mode
- **Components:** `src/components/shared/LoadingSpinner.tsx`
- **Test Files:**
  - Unit: `src/components/shared/__tests__/LoadingSpinner.test.tsx`

### F-028: Logo
- **Status:** implemented
- **Route:** (global)
- **Description:** Scalable 3-bar growth icon with configurable size
- **Components:** `src/components/shared/Logo.tsx`
- **Test Files:**
  - Unit: `src/components/shared/__tests__/Logo.test.tsx`

### F-029: Intelligence Panel
- **Status:** implemented
- **Route:** (multiple pages)
- **Description:** Collapsible info panel with localStorage persistence for collapsed state
- **Components:** `src/components/shared/IntelligencePanel.tsx`
- **Test Files:**
  - Unit: `src/components/shared/__tests__/IntelligencePanel.test.tsx`

### F-030: Tooltip
- **Status:** implemented
- **Route:** /briefing
- **Description:** Hover/click tooltip with 200ms delay, keyboard accessible
- **Components:** `src/components/shared/Tooltip.tsx`
- **Test Files:**
  - Unit: `src/components/shared/__tests__/Tooltip.test.tsx`

### F-031: Page Meta (SEO)
- **Status:** implemented
- **Route:** (multiple pages)
- **Description:** react-helmet-async wrapper for title, description, canonical, noindex
- **Components:** `src/components/shared/PageMeta.tsx`
- **Test Files:**
  - Unit: `src/components/shared/__tests__/PageMeta.test.tsx`

### F-032: Utility (cn)
- **Status:** implemented
- **Route:** (global)
- **Description:** clsx + tailwind-merge utility for conditional className merging
- **Components:** `src/lib/utils.ts`
- **Test Files:**
  - Unit: `src/lib/__tests__/utils.test.ts`
