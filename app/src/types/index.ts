/* ============================================================
   Distribution OS — Core Types
   ============================================================ */

export type ProductStage = 'pre-launch' | 'early' | 'active' | 'scaling'

export type Engine = 'pull' | 'push' | 'bridge' | 'search' | 'equity' | 'persistence'

export interface Product {
  id: string
  name: string
  description: string
  stage: ProductStage
  primaryEngine: Engine
  secondaryEngines: Engine[]
  color: string
  revenue?: number
  createdAt: string
  updatedAt: string
}

export type SubscriptionTier = 'free' | 'starter' | 'growth' | 'scale' | 'pro'

export interface UserPreferences {
  darkMode: boolean
  weekStartDay: 'monday' | 'sunday' | 'saturday'
  subscriptionTier: SubscriptionTier
}

export interface Task {
  id: string
  productId: string
  engine: Engine
  title: string
  description?: string
  score: number
  completed: boolean
  weekId: string
}

export interface WeekRecord {
  id: string // e.g. "2026-W11"
  startDate: string
  endDate: string
  tasks: Task[]
  completedAt?: string
}

export interface AppState {
  products: Product[]
  currentWeekId: string
  tasks: Task[]
  weekHistory: WeekRecord[]
}

/* ============================================================
   Inbox Types — AI-Generated Artifact Review
   ============================================================ */

export type ArtifactStatus = 'pending' | 'approved' | 'scheduled' | 'published' | 'regenerating' | 'dismissed'

export type WorkerType =
  | 'seo-content-writer' | 'keyword-research' | 'search-console-optimizer' | 'backlink-outreach'
  | 'linkedin-director' | 'email-sequence-writer' | 'lead-magnet-generator' | 'waitlist-copy-writer' | 'content-performance-analyst'
  | 'connector-research' | 'personalized-outreach' | 'demo-script-generator' | 'follow-up-sequence' | 'connector-performance'
  | 'keyword-strategy' | 'ad-copy-generator' | 'landing-page-copy' | 'roas-analyst'
  | 'partner-research' | 'pitch-package' | 'improvement-prioritizer'
  | 'weekly-diagnostician' | 'messaging-clarity' | 'stage-transition-advisor'
  | 'market-researcher' | 'competitor-analyst' | 'distribution-specialist'
  | 'product-definer' | 'offer-designer'
  | 'brand-analyzer' | 'token-extractor' | 'brand-book-generator' | 'consistency-checker'
  | 'proposal-writer' | 'content-writer' | 'video-script-writer' | 'outreach-dm-writer'
  | 'engine-advisor' | 'engine-playbook'
  | 'audit-security' | 'audit-seo' | 'audit-performance' | 'audit-code-quality'
  | 'audit-accessibility' | 'audit-ui-consistency' | 'audit-responsive' | 'audit-mobile-visual'
  | 'site-analyzer' | 'website-audit'

export const WORKER_ENGINE_MAP: Record<WorkerType, Engine> = {
  'seo-content-writer': 'pull', 'keyword-research': 'pull', 'search-console-optimizer': 'pull', 'backlink-outreach': 'pull',
  'linkedin-director': 'push', 'email-sequence-writer': 'push', 'lead-magnet-generator': 'push', 'waitlist-copy-writer': 'push', 'content-performance-analyst': 'push',
  'connector-research': 'bridge', 'personalized-outreach': 'bridge', 'demo-script-generator': 'bridge', 'follow-up-sequence': 'bridge', 'connector-performance': 'bridge',
  'keyword-strategy': 'search', 'ad-copy-generator': 'search', 'landing-page-copy': 'search', 'roas-analyst': 'search',
  'partner-research': 'equity', 'pitch-package': 'equity', 'improvement-prioritizer': 'equity',
  'weekly-diagnostician': 'persistence', 'messaging-clarity': 'persistence', 'stage-transition-advisor': 'persistence',
  'market-researcher': 'search', 'competitor-analyst': 'search', 'distribution-specialist': 'search',
  'product-definer': 'push', 'offer-designer': 'push',
  'brand-analyzer': 'push', 'token-extractor': 'push', 'brand-book-generator': 'push', 'consistency-checker': 'push',
  'proposal-writer': 'bridge', 'content-writer': 'push', 'video-script-writer': 'push', 'outreach-dm-writer': 'bridge',
  'engine-advisor': 'persistence', 'engine-playbook': 'persistence',
  'audit-security': 'persistence', 'audit-seo': 'pull', 'audit-performance': 'persistence', 'audit-code-quality': 'persistence',
  'audit-accessibility': 'persistence', 'audit-ui-consistency': 'persistence', 'audit-responsive': 'persistence', 'audit-mobile-visual': 'persistence',
  'site-analyzer': 'pull', 'website-audit': 'pull',
}

export const WORKER_LABELS: Record<WorkerType, string> = {
  'seo-content-writer': 'SEO Content Writer', 'keyword-research': 'Keyword Research', 'search-console-optimizer': 'Search Console Optimizer', 'backlink-outreach': 'Backlink Outreach',
  'linkedin-director': 'LinkedIn Director', 'email-sequence-writer': 'Email Sequence Writer', 'lead-magnet-generator': 'Lead Magnet Generator', 'waitlist-copy-writer': 'Waitlist Page Copy', 'content-performance-analyst': 'Content Performance Analyst',
  'connector-research': 'Connector Research', 'personalized-outreach': 'Personalized Outreach', 'demo-script-generator': 'Demo Script Generator', 'follow-up-sequence': 'Follow-up Sequence', 'connector-performance': 'Connector Performance',
  'keyword-strategy': 'Keyword Strategy', 'ad-copy-generator': 'Ad Copy Generator', 'landing-page-copy': 'Landing Page Copy', 'roas-analyst': 'ROAS Analyst',
  'partner-research': 'Partner Research', 'pitch-package': 'Pitch Package', 'improvement-prioritizer': 'Improvement Prioritizer',
  'weekly-diagnostician': 'Weekly Diagnostician', 'messaging-clarity': 'Messaging Clarity', 'stage-transition-advisor': 'Stage Transition Advisor',
  'market-researcher': 'Market Researcher', 'competitor-analyst': 'Competitor Analyst', 'distribution-specialist': 'Distribution Specialist',
  'product-definer': 'Product Definer', 'offer-designer': 'Offer Designer',
  'brand-analyzer': 'Brand Analyzer', 'token-extractor': 'Token Extractor', 'brand-book-generator': 'Brand Book Generator', 'consistency-checker': 'Consistency Checker',
  'proposal-writer': 'Proposal Writer', 'content-writer': 'Content Writer', 'video-script-writer': 'Video Script Writer', 'outreach-dm-writer': 'Outreach DM Writer',
  'engine-advisor': 'Engine Advisor', 'engine-playbook': 'Engine Playbook',
  'audit-security': 'Security Audit', 'audit-seo': 'SEO Audit', 'audit-performance': 'Performance Audit', 'audit-code-quality': 'Code Quality Audit',
  'audit-accessibility': 'Accessibility Audit', 'audit-ui-consistency': 'UI Consistency Audit', 'audit-responsive': 'Responsive Audit', 'audit-mobile-visual': 'Mobile Visual Audit',
  'site-analyzer': 'Site Analyzer', 'website-audit': 'Website Audit',
}

export interface InboxArtifact {
  id: string
  productId: string
  engine: Engine
  workerType: WorkerType
  taskTitle: string
  status: ArtifactStatus
  content: string
  editedContent?: string
  directionNote?: string
  generatedAt: string
  approvedAt?: string
  scheduledFor?: string
  publishedAt?: string
}

/* ============================================================
   Knowledge Base Types — AI Generation Context
   ============================================================ */

export interface KnowledgeBaseICP {
  who: string
  pain: string
  triedBefore: string
  desiredOutcome: string
  hangoutsOnline: string
}

export interface KnowledgeBasePositioning {
  oneLiner: string
  benefits: [string, string, string]
  competitor: string
  switchReason: string
}

export interface KnowledgeBaseTone {
  formality: 'formal' | 'conversational'
  technicality: 'technical' | 'accessible'
  boldness: 'bold' | 'measured'
  lengthPreference: 'short-form' | 'long-form'
}

export interface ApprovedArtifact {
  type: string
  content: string
  editedFrom: string
  approvedAt: string
}

export interface KnowledgeBase {
  voiceExamples: string[]
  icp: KnowledgeBaseICP
  positioning: KnowledgeBasePositioning
  tone: KnowledgeBaseTone
  approvedArtifacts: ApprovedArtifact[]
}

export function defaultKnowledgeBase(): KnowledgeBase {
  return {
    voiceExamples: [],
    icp: { who: '', pain: '', triedBefore: '', desiredOutcome: '', hangoutsOnline: '' },
    positioning: { oneLiner: '', benefits: ['', '', ''], competitor: '', switchReason: '' },
    tone: { formality: 'conversational', technicality: 'accessible', boldness: 'bold', lengthPreference: 'short-form' },
    approvedArtifacts: [],
  }
}

export const ENGINE_META: Record<Engine, { label: string; color: string; lightBg: string }> = {
  pull:        { label: 'Pull',        color: 'var(--color-engine-pull)',        lightBg: 'var(--color-engine-pull-light)' },
  push:        { label: 'Push',        color: 'var(--color-engine-push)',        lightBg: 'var(--color-engine-push-light)' },
  bridge:      { label: 'Bridge',      color: 'var(--color-engine-bridge)',      lightBg: 'var(--color-engine-bridge-light)' },
  search:      { label: 'Search',      color: 'var(--color-engine-search)',      lightBg: 'var(--color-engine-search-light)' },
  equity:      { label: 'Equity',      color: 'var(--color-engine-equity)',      lightBg: 'var(--color-engine-equity-light)' },
  persistence: { label: 'Persistence', color: 'var(--color-engine-persistence)', lightBg: 'var(--color-engine-persistence-light)' },
}
