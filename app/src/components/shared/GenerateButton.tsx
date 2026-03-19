import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import type { Product, Engine, Task } from '@/types'
import { isAIConfigured } from '@/lib/ai/config'
import { getWorkerForTask } from '@/lib/ai/task-worker-map'
import { runWorker } from '@/lib/ai/worker-base'
import { runFullWeekly } from '@/lib/ai/linkedin-director'
import { loadInbox } from '@/lib/storage'

interface Props {
  task: Task
  product: Product
}

export function GenerateButton({ task, product }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  const mapping = getWorkerForTask(task.title, task.engine)
  if (!mapping) return null
  if (!isAIConfigured()) return null

  // Check if there's already a pending artifact for this task
  const hasPending = loadInbox().some(
    a => a.productId === product.id && a.workerType === mapping.workerType && a.status === 'pending'
  )

  async function handleGenerate(e: React.MouseEvent) {
    e.stopPropagation()
    setLoading(true)
    setError(null)

    try {
      if (mapping!.workerType === 'linkedin-director') {
        const result = await runFullWeekly(product)
        if (!result.ideas.success) {
          setError(result.ideas.error || 'Generation failed')
        } else {
          setDone(true)
          setTimeout(() => setDone(false), 3000)
        }
      } else {
        const result = await runWorker({
          product,
          engine: mapping!.engine,
          workerType: mapping!.workerType,
          taskTitle: task.title,
          userPrompt: buildGenericPrompt(task, mapping!.engine),
        })
        if (!result.success) {
          setError(result.error || 'Generation failed')
        } else {
          setDone(true)
          setTimeout(() => setDone(false), 3000)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  if (done) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium text-[var(--color-success)] bg-[var(--color-success)]/10">
        <Sparkles size={10} /> In Inbox
      </span>
    )
  }

  if (hasPending) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium text-[var(--color-accent-text)] bg-[var(--color-accent-light)]">
        <Sparkles size={10} /> Pending
      </span>
    )
  }

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium text-[var(--color-accent-text)] hover:bg-[var(--color-accent-light)] transition-colors disabled:opacity-50"
        title={mapping.label}
      >
        {loading ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
        {loading ? 'Generating...' : 'Generate'}
      </button>
      {error && (
        <span className="text-[10px] text-[var(--color-error)] max-w-[120px] truncate" title={error}>
          {error}
        </span>
      )}
    </div>
  )
}

function buildGenericPrompt(task: Task, engine: Engine): string {
  return `Complete the following distribution task by generating the required content artifact:

Task: ${task.title}
Engine: ${engine}

Generate complete, ready-to-use output. Do not provide outlines or summaries — produce the actual content that can be reviewed and used immediately.

Be specific, actionable, and on-brand based on the knowledge base context provided.`
}
