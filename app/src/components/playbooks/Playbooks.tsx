import { useState } from 'react'
import type { AppState, Engine } from '@/types'
import { ENGINE_META } from '@/types'
import { PageMeta } from '@/components/shared/PageMeta'
import { APP_NAME } from '@/lib/app-config'
import { Loader2, Sparkles, Compass, Copy } from 'lucide-react'
import { runEngineAdvisor, runEnginePlaybook } from '@/lib/ai'

const ENGINES: Engine[] = ['pull', 'push', 'bridge', 'search', 'equity', 'persistence']

export function Playbooks({ state }: { state: AppState }) {
  const [productId, setProductId] = useState(state.products[0]?.id ?? '')
  const [advisorResult, setAdvisorResult] = useState('')
  const [advisorLoading, setAdvisorLoading] = useState(false)
  const [advisorError, setAdvisorError] = useState('')
  const [playbookResults, setPlaybookResults] = useState<Record<Engine, string>>({
    pull: '', push: '', bridge: '', search: '', equity: '', persistence: '',
  })
  const [playbookLoading, setPlaybookLoading] = useState<Record<Engine, boolean>>({
    pull: false, push: false, bridge: false, search: false, equity: false, persistence: false,
  })
  const [playbookErrors, setPlaybookErrors] = useState<Record<Engine, string>>({
    pull: '', push: '', bridge: '', search: '', equity: '', persistence: '',
  })
  const [expandedEngine, setExpandedEngine] = useState<Engine | null>(null)

  const product = state.products.find(p => p.id === productId)

  async function getAdvice() {
    if (!product) return
    setAdvisorLoading(true)
    setAdvisorError('')
    try {
      const result = await runEngineAdvisor(product)
      if (result.success) setAdvisorResult(result.content)
      else setAdvisorError(result.error || 'Failed')
    } catch (err) {
      setAdvisorError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setAdvisorLoading(false)
    }
  }

  async function generatePlaybook(engine: Engine) {
    if (!product) return
    setPlaybookLoading(prev => ({ ...prev, [engine]: true }))
    setPlaybookErrors(prev => ({ ...prev, [engine]: '' }))
    try {
      const result = await runEnginePlaybook(product, engine)
      if (result.success) setPlaybookResults(prev => ({ ...prev, [engine]: result.content }))
      else setPlaybookErrors(prev => ({ ...prev, [engine]: result.error || 'Failed' }))
    } catch (err) {
      setPlaybookErrors(prev => ({ ...prev, [engine]: err instanceof Error ? err.message : 'Unknown error' }))
    } finally {
      setPlaybookLoading(prev => ({ ...prev, [engine]: false }))
    }
  }

  if (state.products.length === 0) {
    return (
      <div className="space-y-6">
        <PageMeta title={`Playbooks — ${APP_NAME}`} noindex />
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-ink)] tracking-tight">Engine Playbooks</h1>
        <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-2xl p-8 sm:p-12 text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-indigo-500/[0.08] flex items-center justify-center mb-4">
            <Compass size={24} className="text-indigo-400" />
          </div>
          <h3 className="text-base font-semibold text-[var(--color-ink)] mb-1">No product yet</h3>
          <p className="text-sm text-[var(--color-ink-muted)] max-w-sm mx-auto">
            Playbooks generate step-by-step distribution guides tailored to your product. Add your first product to get started.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageMeta title={`Playbooks — ${APP_NAME}`} noindex />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-ink)] tracking-tight">Engine Playbooks</h1>
          <p className="text-sm text-[var(--color-ink-muted)] mt-1">Get a recommendation on which engine to start, then generate step-by-step execution guides.</p>
        </div>
        {state.products.length > 1 && (
          <select
            value={productId}
            onChange={e => setProductId(e.target.value)}
            className="px-3 py-2 min-h-[44px] rounded-xl border border-[var(--color-edge)] bg-[var(--color-surface)] text-base md:text-sm text-[var(--color-ink)]"
          >
            {state.products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        )}
      </div>

      {/* Engine Advisor */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-[var(--color-edge)]">
          <div className="flex items-center gap-2">
            <Compass size={16} className="text-[var(--color-accent-text)]" />
            <h2 className="text-sm font-semibold text-[var(--color-ink)]">Engine Advisor</h2>
          </div>
          <button
            onClick={getAdvice}
            disabled={advisorLoading || !product}
            className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-xl text-xs font-medium bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] hover:bg-[var(--color-btn-primary-hover)] transition-colors disabled:opacity-50"
          >
            {advisorLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            {advisorLoading ? 'Analyzing...' : advisorResult ? 'Re-analyze' : 'Get Recommendation'}
          </button>
        </div>
        <div className="p-4 sm:p-5">
          {advisorError && (
            <div className="mb-3 p-3 rounded-lg bg-[var(--color-error-bg)] border border-[var(--color-error)]/20 text-sm text-[var(--color-error)]">{advisorError}</div>
          )}
          {advisorResult ? (
            <div className="prose prose-sm max-w-none text-[var(--color-ink-body)] whitespace-pre-wrap">{advisorResult}</div>
          ) : !advisorLoading ? (
            <p className="text-sm text-[var(--color-ink-muted)] italic">AI will analyze your product and recommend the best distribution engine to start with.</p>
          ) : (
            <div className="flex items-center gap-2 text-sm text-[var(--color-ink-muted)]">
              <Loader2 size={14} className="animate-spin" />
              Analyzing your product...
            </div>
          )}
        </div>
      </div>

      {/* Engine Playbooks Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ENGINES.map(engine => {
          const meta = ENGINE_META[engine]
          const hasResult = !!playbookResults[engine]
          const isLoading = playbookLoading[engine]
          const isExpanded = expandedEngine === engine

          return (
            <div key={engine} className={`bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-2xl overflow-hidden ${isExpanded ? 'sm:col-span-2 lg:col-span-3' : ''}`}>
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: meta.color }} />
                  <span className="text-sm font-semibold text-[var(--color-ink)]">{meta.label}</span>
                  {hasResult && (
                    <button
                      onClick={() => setExpandedEngine(isExpanded ? null : engine)}
                      className="min-h-[44px] inline-flex items-center px-2 text-xs text-[var(--color-accent-text)] hover:underline"
                    >
                      {isExpanded ? 'Collapse' : 'Expand'}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {hasResult && (
                    <button
                      onClick={() => navigator.clipboard.writeText(playbookResults[engine])}
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-colors"
                    >
                      <Copy size={12} />
                    </button>
                  )}
                  <button
                    onClick={() => generatePlaybook(engine)}
                    disabled={isLoading || !product}
                    className="inline-flex items-center gap-1 px-3 py-1.5 min-h-[44px] rounded-xl text-xs font-medium bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] hover:bg-[var(--color-btn-primary-hover)] transition-colors disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    {isLoading ? '...' : hasResult ? 'Redo' : 'Generate'}
                  </button>
                </div>
              </div>
              {playbookErrors[engine] && (
                <div className="mx-4 mb-3 p-3 rounded-lg bg-[var(--color-error-bg)] border border-[var(--color-error)]/20 text-sm text-[var(--color-error)]">{playbookErrors[engine]}</div>
              )}
              {hasResult && isExpanded && (
                <div className="px-4 pb-4 max-h-[500px] overflow-y-auto">
                  <div className="prose prose-sm max-w-none text-[var(--color-ink-body)] whitespace-pre-wrap">{playbookResults[engine]}</div>
                </div>
              )}
              {hasResult && !isExpanded && (
                <div className="px-4 pb-3">
                  <p className="text-xs text-[var(--color-ink-muted)]">Playbook generated. Click Expand to view.</p>
                </div>
              )}
              {isLoading && (
                <div className="px-4 pb-3 flex items-center gap-2 text-sm text-[var(--color-ink-muted)]">
                  <Loader2 size={14} className="animate-spin" />
                  Generating playbook...
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
