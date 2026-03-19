/* ============================================================
   Task → Worker Mapping
   Maps task title patterns to the AI worker that can generate
   content for that task. Used to show "Generate" buttons.
   ============================================================ */

import type { Engine, WorkerType } from '@/types'

interface TaskWorkerMapping {
  pattern: RegExp
  engine: Engine
  workerType: WorkerType
  label: string
}

export const TASK_WORKER_MAPPINGS: TaskWorkerMapping[] = [
  // Push engine
  { pattern: /linkedin|thought leadership/i, engine: 'push', workerType: 'linkedin-director', label: 'Generate LinkedIn Posts' },
  { pattern: /blog post|weekly.*post|building in public/i, engine: 'push', workerType: 'linkedin-director', label: 'Generate Content' },
  { pattern: /email sequence|welcome email/i, engine: 'push', workerType: 'email-sequence-writer', label: 'Generate Email Sequence' },
  { pattern: /cold outreach|personal DMs/i, engine: 'push', workerType: 'personalized-outreach', label: 'Generate Outreach' },

  // Pull engine
  { pattern: /comparison page|SEO.*blog|pillar page/i, engine: 'pull', workerType: 'seo-content-writer', label: 'Generate SEO Content' },
  { pattern: /keyword/i, engine: 'pull', workerType: 'keyword-research', label: 'Generate Keyword Brief' },
  { pattern: /backlink/i, engine: 'pull', workerType: 'backlink-outreach', label: 'Generate Outreach Draft' },

  // Bridge engine
  { pattern: /integration partner|co-marketing|partner/i, engine: 'bridge', workerType: 'connector-research', label: 'Research Connectors' },

  // Search engine
  { pattern: /google ads|test campaign/i, engine: 'search', workerType: 'ad-copy-generator', label: 'Generate Ad Copy' },
  { pattern: /landing page.*conversion/i, engine: 'search', workerType: 'landing-page-copy', label: 'Generate Landing Page' },

  // Equity engine
  { pattern: /brand voice/i, engine: 'equity', workerType: 'messaging-clarity', label: 'Analyze Messaging' },
  { pattern: /community discussion/i, engine: 'equity', workerType: 'connector-research', label: 'Research Communities' },

  // Persistence engine
  { pattern: /onboarding email|newsletter|product update/i, engine: 'persistence', workerType: 'email-sequence-writer', label: 'Generate Emails' },
]

export function getWorkerForTask(taskTitle: string, taskEngine: Engine): TaskWorkerMapping | null {
  return TASK_WORKER_MAPPINGS.find(m => m.pattern.test(taskTitle) && m.engine === taskEngine) ?? null
}
