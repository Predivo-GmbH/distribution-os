/* ============================================================
   AI Workers — Public API
   ============================================================ */

// Config
export { loadAIConfig, saveAIConfig, isAIConfigured } from './config'
export type { AIConfig } from './config'

// Worker base
export { buildSystemPrompt, callAI, runWorker } from './worker-base'
export type { AICallResult, WorkerRunOptions } from './worker-base'

// LinkedIn Director (Push — flagship)
export { generateIdeas, generatePosts, generateCalendar, runFullWeekly } from './linkedin-director'
export type { LinkedInDirectorResult } from './linkedin-director'

// Push engine workers
export { runEmailSequenceWriter, runLeadMagnetGenerator, runWaitlistCopyWriter, runContentPerformanceAnalyst } from './push-workers'

// Pull engine workers
export { runSEOContentWriter, runKeywordResearch, runSearchConsoleOptimizer, runBacklinkOutreach } from './pull-workers'

// Bridge engine workers
export { runConnectorResearch, runOutreachWriter, runFollowUpCheck, runDemoScript, runPerformanceBrief } from './bridge-workers'

// Search engine workers
export { runKeywordStrategy, runAdCopyGenerator, runLandingPageCopy, runROASAnalyst } from './search-workers'

// Equity engine workers
export { runPartnerResearch, runPitchPackage, runImprovementPrioritizer } from './equity-workers'

// Persistence engine workers
export { runWeeklyDiagnostician, runMessagingClarity, runStageTransitionAdvisor } from './persistence-workers'

// Connector CRM
export { loadConnectorCRM, saveConnectorCRM, addConnector, updateConnector, removeConnector } from './connector-crm'
export type { Connector, ConnectorStatus } from './connector-crm'

// Scheduler
export { loadSchedulerConfig, saveSchedulerConfig, schedulerTick, getNextRunTime, loadRunRecords, DAY_LABELS } from './scheduler'
export type { SchedulerConfig, WorkerSchedule, ScheduleCadence, WorkerRunRecord } from './scheduler'

// Integrations
export { loadIntegrations, saveIntegrations, publishToLinkedIn, publishEmailSequence } from './integrations'
export type { IntegrationConfig } from './integrations'

// Task-worker mapping
export { getWorkerForTask } from './task-worker-map'
