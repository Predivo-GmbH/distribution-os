import { useState } from 'react'
import type { AppState } from '@/types'
import { PageMeta } from '@/components/shared/PageMeta'
import { APP_NAME } from '@/lib/app-config'
import { Loader2, Sparkles, Globe, ClipboardList, Copy, Download } from 'lucide-react'
import { runSiteAnalyzer, runWebsiteAudit } from '@/lib/ai'

type Tab = 'analyze' | 'audit'

export function AnalyzePage({ state }: { state: AppState }) {
  const [productId, setProductId] = useState(state.products[0]?.id ?? '')
  const [url, setUrl] = useState('')
  const [activeTab, setActiveTab] = useState<Tab>('analyze')
  const [results, setResults] = useState<Record<Tab, string>>({ analyze: '', audit: '' })
  const [loading, setLoading] = useState<Record<Tab, boolean>>({ analyze: false, audit: false })
  const [errors, setErrors] = useState<Record<Tab, string>>({ analyze: '', audit: '' })

  const product = state.products.find(p => p.id === productId)

  async function run(tab: Tab) {
    if (!product || !url.trim()) {
      setErrors(prev => ({ ...prev, [tab]: 'Enter a URL to analyze.' }))
      return
    }
    setLoading(prev => ({ ...prev, [tab]: true }))
    setErrors(prev => ({ ...prev, [tab]: '' }))
    try {
      const result = tab === 'analyze'
        ? await runSiteAnalyzer(product, url)
        : await runWebsiteAudit(product, url)
      if (result.success) setResults(prev => ({ ...prev, [tab]: result.content }))
      else setErrors(prev => ({ ...prev, [tab]: result.error || 'Analysis failed' }))
    } catch (err) {
      setErrors(prev => ({ ...prev, [tab]: err instanceof Error ? err.message : 'Unknown error' }))
    } finally {
      setLoading(prev => ({ ...prev, [tab]: false }))
    }
  }

  if (state.products.length === 0) {
    return (
      <div className="space-y-6">
        <PageMeta title={`Analyze — ${APP_NAME}`} noindex />
        <h1 className="text-2xl font-semibold text-[var(--color-ink)] tracking-tight">Site Analysis</h1>
        <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-xl p-6 text-center">
          <p className="text-sm text-[var(--color-ink-muted)]">Add a product first to analyze sites.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageMeta title={`Analyze — ${APP_NAME}`} noindex />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-ink)] tracking-tight">Site Analysis</h1>
          <p className="text-sm text-[var(--color-ink-muted)] mt-1">Reverse-engineer any website or score it against a conversion checklist.</p>
        </div>
        {state.products.length > 1 && (
          <select
            value={productId}
            onChange={e => setProductId(e.target.value)}
            className="px-3 py-2 min-h-[44px] rounded-lg border border-[var(--color-edge)] bg-[var(--color-surface)] text-sm text-[var(--color-ink)]"
          >
            {state.products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        )}
      </div>

      {/* URL input */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-xl p-4 sm:p-5">
        <label className="block text-xs font-medium text-[var(--color-ink-muted)] mb-2">Website URL</label>
        <input
          type="url"
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://competitor.com"
          className="w-full px-3 py-2 min-h-[44px] rounded-lg border border-[var(--color-edge)] bg-[var(--color-surface)] text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)]"
        />
      </div>

      {/* Tabs */}
      <div className="flex gap-1">
        <button
          onClick={() => setActiveTab('analyze')}
          className={`inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'analyze' ? 'bg-[var(--color-accent-light)] text-[var(--color-accent-text)]' : 'text-[var(--color-ink-body)] hover:bg-[var(--color-surface-hover)]'
          }`}
        >
          <Globe size={14} />
          Deep Analysis
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'audit' ? 'bg-[var(--color-accent-light)] text-[var(--color-accent-text)]' : 'text-[var(--color-ink-body)] hover:bg-[var(--color-surface-hover)]'
          }`}
        >
          <ClipboardList size={14} />
          Quick Score
        </button>
      </div>

      {/* Content */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-[var(--color-edge)]">
          <h2 className="text-sm font-semibold text-[var(--color-ink)]">
            {activeTab === 'analyze' ? 'Site Deep Analysis' : 'Conversion Score (17 items)'}
          </h2>
          <div className="flex items-center gap-2">
            {results[activeTab] && (
              <>
                <button
                  onClick={() => navigator.clipboard.writeText(results[activeTab])}
                  className="inline-flex items-center gap-1 px-3 py-1.5 min-h-[44px] rounded-lg text-xs font-medium border border-[var(--color-edge)] text-[var(--color-ink-body)] hover:bg-[var(--color-surface-hover)] transition-colors"
                >
                  <Copy size={12} /> Copy
                </button>
                <button
                  onClick={() => {
                    const blob = new Blob([results[activeTab]], { type: 'text/plain' })
                    const u = URL.createObjectURL(blob)
                    const a = document.createElement('a')
                    a.href = u; a.download = `${activeTab}-${url.replace(/https?:\/\//, '').replace(/\//g, '-')}.md`
                    a.click(); URL.revokeObjectURL(u)
                  }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 min-h-[44px] rounded-lg text-xs font-medium border border-[var(--color-edge)] text-[var(--color-ink-body)] hover:bg-[var(--color-surface-hover)] transition-colors"
                >
                  <Download size={12} /> Download
                </button>
              </>
            )}
            <button
              onClick={() => run(activeTab)}
              disabled={loading[activeTab] || !product || !url.trim()}
              className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-lg text-xs font-medium bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] hover:bg-[var(--color-btn-primary-hover)] transition-colors disabled:opacity-50"
            >
              {loading[activeTab] ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              {loading[activeTab] ? 'Analyzing...' : results[activeTab] ? 'Re-analyze' : 'Analyze'}
            </button>
          </div>
        </div>
        <div className="p-4 sm:p-5">
          {errors[activeTab] && (
            <div className="mb-3 p-3 rounded-lg bg-[var(--color-error-bg)] border border-[var(--color-error)]/20 text-sm text-[var(--color-error)]">{errors[activeTab]}</div>
          )}
          {results[activeTab] ? (
            <div className="prose prose-sm max-w-none text-[var(--color-ink-body)] whitespace-pre-wrap max-h-[600px] overflow-y-auto">{results[activeTab]}</div>
          ) : !loading[activeTab] ? (
            <p className="text-sm text-[var(--color-ink-muted)] italic">
              {activeTab === 'analyze'
                ? 'Enter a URL above and click Analyze to reverse-engineer the site design, conversion psychology, and UX patterns.'
                : 'Enter a URL above and click Analyze to score the site against a 17-item conversion checklist.'}
            </p>
          ) : (
            <div className="flex items-center gap-2 text-sm text-[var(--color-ink-muted)]">
              <Loader2 size={14} className="animate-spin" />
              Analyzing {url}...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
