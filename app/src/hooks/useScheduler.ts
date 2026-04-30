/* ============================================================
   useScheduler — Runs the automation scheduler on an interval
   Checks every 60 seconds for due workers and executes them.
   ============================================================ */

import { useEffect, useRef } from 'react'
import type { Product, WorkerType } from '@/types'
import { schedulerTick } from '@/lib/ai/scheduler'
import { runFullWeekly } from '@/lib/ai/linkedin-director'
import { runEmailSequenceWriter, runLeadMagnetGenerator, runWaitlistCopyWriter, runContentPerformanceAnalyst } from '@/lib/ai/push-workers'
import { runSEOContentWriter, runKeywordResearch, runSearchConsoleOptimizer, runBacklinkOutreach } from '@/lib/ai/pull-workers'
import { runConnectorResearch, runOutreachWriter, runFollowUpCheck, runDemoScript, runPerformanceBrief } from '@/lib/ai/bridge-workers'
import { runKeywordStrategy, runAdCopyGenerator, runLandingPageCopy, runROASAnalyst } from '@/lib/ai/search-workers'
import { runPartnerResearch, runPitchPackage, runImprovementPrioritizer } from '@/lib/ai/equity-workers'
import { runWeeklyDiagnostician, runMessagingClarity, runStageTransitionAdvisor } from '@/lib/ai/persistence-workers'

const TICK_INTERVAL = 60_000 // Check every 60 seconds

type WorkerResult = { success: boolean; error?: string }

function extractResult(result: { success: boolean; error?: string } | { success: boolean; content: string; noAction: boolean }): WorkerResult {
  return { success: result.success, error: 'error' in result ? result.error : undefined }
}

export async function executeWorker(workerType: WorkerType, product: Product): Promise<WorkerResult> {
  switch (workerType) {
    // Push engine
    case 'linkedin-director': {
      const r = await runFullWeekly(product)
      return { success: r.ideas.success, error: r.ideas.error }
    }
    case 'email-sequence-writer': return extractResult(await runEmailSequenceWriter(product))
    case 'lead-magnet-generator': return extractResult(await runLeadMagnetGenerator(product))
    case 'waitlist-copy-writer': return extractResult(await runWaitlistCopyWriter(product))
    case 'content-performance-analyst': return extractResult(await runContentPerformanceAnalyst(product))

    // Pull engine
    case 'seo-content-writer': return extractResult(await runSEOContentWriter(product))
    case 'keyword-research': return extractResult(await runKeywordResearch(product))
    case 'search-console-optimizer': return extractResult(await runSearchConsoleOptimizer(product))
    case 'backlink-outreach': return extractResult(await runBacklinkOutreach(product))

    // Bridge engine
    case 'connector-research': return extractResult(await runConnectorResearch(product))
    case 'personalized-outreach': return extractResult(await runOutreachWriter(product))
    case 'follow-up-sequence': return extractResult(await runFollowUpCheck(product))
    case 'demo-script-generator': return extractResult(await runDemoScript(product))
    case 'connector-performance': return extractResult(await runPerformanceBrief(product))

    // Search engine
    case 'keyword-strategy': return extractResult(await runKeywordStrategy(product))
    case 'ad-copy-generator': return extractResult(await runAdCopyGenerator(product))
    case 'landing-page-copy': return extractResult(await runLandingPageCopy(product))
    case 'roas-analyst': return extractResult(await runROASAnalyst(product))

    // Equity engine
    case 'partner-research': return extractResult(await runPartnerResearch(product))
    case 'pitch-package': return extractResult(await runPitchPackage(product))
    case 'improvement-prioritizer': return extractResult(await runImprovementPrioritizer(product))

    // Persistence engine
    case 'weekly-diagnostician': return extractResult(await runWeeklyDiagnostician(product))
    case 'messaging-clarity': return extractResult(await runMessagingClarity(product))
    case 'stage-transition-advisor': return extractResult(await runStageTransitionAdvisor(product))

    default:
      return { success: false, error: `Worker type not yet schedulable: ${workerType}` }
  }
}

export function useScheduler(products: Product[]) {
  const productsRef = useRef(products)

  useEffect(() => {
    productsRef.current = products
  })

  useEffect(() => {
    // Run immediately on mount
    schedulerTick(productsRef.current, executeWorker)

    // Then check every 60 seconds
    const interval = setInterval(() => {
      schedulerTick(productsRef.current, executeWorker)
    }, TICK_INTERVAL)

    return () => clearInterval(interval)
  }, [])
}
