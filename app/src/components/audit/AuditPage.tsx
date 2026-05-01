import { useState } from 'react'
import type { AppState } from '@/types'
import { PageMeta } from '@/components/shared/PageMeta'
import { APP_NAME } from '@/lib/app-config'
import { Loader2, Sparkles, Shield, Search, Zap, Code, Eye, Paintbrush, Smartphone, Monitor, Copy, Download } from 'lucide-react'
import {
  runSecurityAudit, runSEOAudit, runPerformanceAudit, runCodeQualityAudit,
  runAccessibilityAudit, runUIConsistencyAudit, runResponsiveAudit, runMobileVisualAudit,
} from '@/lib/ai'
import type { Product } from '@/types'

type Domain = 'security' | 'seo' | 'performance' | 'code-quality' | 'accessibility' | 'ui-consistency' | 'responsive' | 'mobile-visual'

interface DomainDef {
  key: Domain
  label: string
  icon: React.ElementType
  maxPts: string
  run: (product: Product, ctx: string) => ReturnType<typeof runSecurityAudit>
}

const DOMAINS: DomainDef[] = [
  { key: 'security', label: 'Security', icon: Shield, maxPts: '25pts', run: runSecurityAudit },
  { key: 'seo', label: 'SEO', icon: Search, maxPts: '20pts', run: runSEOAudit },
  { key: 'performance', label: 'Performance', icon: Zap, maxPts: '20pts', run: runPerformanceAudit },
  { key: 'code-quality', label: 'Code Quality', icon: Code, maxPts: '20pts', run: runCodeQualityAudit },
  { key: 'accessibility', label: 'Accessibility', icon: Eye, maxPts: '15pts', run: runAccessibilityAudit },
  { key: 'ui-consistency', label: 'UI Consistency', icon: Paintbrush, maxPts: 'bonus', run: runUIConsistencyAudit },
  { key: 'responsive', label: 'Responsive', icon: Smartphone, maxPts: 'bonus', run: runResponsiveAudit },
  { key: 'mobile-visual', label: 'Mobile Visual', icon: Monitor, maxPts: 'bonus', run: runMobileVisualAudit },
]

export function AuditPage({ state }: { state: AppState }) {
  const [productId, setProductId] = useState(state.products[0]?.id ?? '')
  const [repoContext, setRepoContext] = useState('')
  const [results, setResults] = useState<Record<Domain, string>>({
    security: '', seo: '', performance: '', 'code-quality': '',
    accessibility: '', 'ui-consistency': '', responsive: '', 'mobile-visual': '',
  })
  const [loading, setLoading] = useState<Record<Domain, boolean>>({
    security: false, seo: false, performance: false, 'code-quality': false,
    accessibility: false, 'ui-consistency': false, responsive: false, 'mobile-visual': false,
  })
  const [errors, setErrors] = useState<Record<Domain, string>>({
    security: '', seo: '', performance: '', 'code-quality': '',
    accessibility: '', 'ui-consistency': '', responsive: '', 'mobile-visual': '',
  })
  const [expandedDomain, setExpandedDomain] = useState<Domain | null>(null)

  const product = state.products.find(p => p.id === productId)

  async function runSingleAudit(domain: DomainDef) {
    if (!product) return
    setLoading(prev => ({ ...prev, [domain.key]: true }))
    setErrors(prev => ({ ...prev, [domain.key]: '' }))
    try {
      const result = await domain.run(product, repoContext || 'No additional repo context provided.')
      if (result.success) setResults(prev => ({ ...prev, [domain.key]: result.content }))
      else setErrors(prev => ({ ...prev, [domain.key]: result.error || 'Audit failed' }))
    } catch (err) {
      setErrors(prev => ({ ...prev, [domain.key]: err instanceof Error ? err.message : 'Unknown error' }))
    } finally {
      setLoading(prev => ({ ...prev, [domain.key]: false }))
    }
  }

  async function runAllAudits() {
    if (!product) return
    await Promise.all(DOMAINS.map(domain => runSingleAudit(domain)))
  }

  const completedCount = Object.values(results).filter(Boolean).length
  const isAnyLoading = Object.values(loading).some(Boolean)

  function exportReport() {
    const report = DOMAINS.map(d => {
      if (!results[d.key]) return ''
      return `# ${d.label} Audit (${d.maxPts})\n\n${results[d.key]}\n\n---\n`
    }).filter(Boolean).join('\n')

    const blob = new Blob([`# ${product?.name || 'Product'} — 8-Domain Audit Report\n\n${report}`], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-report-${product?.name || 'product'}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (state.products.length === 0) {
    return (
      <div className="space-y-6">
        <PageMeta title={`Audit — ${APP_NAME}`} noindex />
        <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-ink)] tracking-tight">8-Domain Audit</h1>
        <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-2xl p-6 text-center">
          <p className="text-sm text-[var(--color-ink-muted)]">Add a product first to run an audit.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageMeta title={`Audit — ${APP_NAME}`} noindex />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-ink)] tracking-tight">8-Domain Audit</h1>
          <p className="text-sm text-[var(--color-ink-muted)] mt-1">Run parallel audits across security, SEO, performance, code quality, and more.</p>
        </div>
        <div className="flex items-center gap-2">
          {state.products.length > 1 && (
            <select
              value={productId}
              onChange={e => setProductId(e.target.value)}
              className="px-3 py-2 min-h-[44px] rounded-xl border border-[var(--color-edge)] bg-[var(--color-surface)] text-base md:text-sm text-[var(--color-ink)]"
            >
              {state.products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          )}
          {completedCount > 0 && (
            <button
              onClick={exportReport}
              className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-lg text-xs font-medium border border-[var(--color-edge)] text-[var(--color-ink-body)] hover:bg-[var(--color-surface-hover)] transition-colors"
            >
              <Download size={12} />
              Export Report
            </button>
          )}
        </div>
      </div>

      {/* Repo context input */}
      <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-2xl p-4 sm:p-5">
        <label className="block text-xs font-medium text-[var(--color-ink-muted)] mb-2">Project Context (optional)</label>
        <textarea
          value={repoContext}
          onChange={e => setRepoContext(e.target.value)}
          placeholder="Paste your tech stack, folder structure, package.json, or any relevant project info here..."
          rows={4}
          className="w-full px-3 py-2 rounded-lg border border-[var(--color-edge)] bg-[var(--color-surface)] text-base md:text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)] resize-y"
        />
        <div className="mt-3 flex justify-end">
          <button
            onClick={runAllAudits}
            disabled={isAnyLoading || !product}
            className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-xl text-xs font-medium bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] hover:bg-[var(--color-btn-primary-hover)] transition-colors disabled:opacity-50"
          >
            {isAnyLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            {isAnyLoading ? `Running (${completedCount}/8)...` : 'Run Full Audit'}
          </button>
        </div>
      </div>

      {/* Progress */}
      {completedCount > 0 && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[var(--color-ink)]">{completedCount} of 8 domains completed</span>
          </div>
          <div className="h-2 rounded-full bg-[var(--color-surface-hover)] overflow-hidden">
            <div className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-300" style={{ width: `${(completedCount / 8) * 100}%` }} />
          </div>
        </div>
      )}

      {/* Domain cards */}
      <div className="grid gap-3 sm:grid-cols-2">
        {DOMAINS.map(domain => {
          const hasResult = !!results[domain.key]
          const isLoading = loading[domain.key]
          const isExpanded = expandedDomain === domain.key
          const Icon = domain.icon

          return (
            <div key={domain.key} className={`bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-2xl overflow-hidden ${isExpanded ? 'sm:col-span-2' : ''}`}>
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <Icon size={14} className="text-[var(--color-accent-text)]" />
                  <span className="text-sm font-semibold text-[var(--color-ink)]">{domain.label}</span>
                  <span className="text-xs text-[var(--color-ink-muted)]">{domain.maxPts}</span>
                  {hasResult && (
                    <button onClick={() => setExpandedDomain(isExpanded ? null : domain.key)} className="min-h-[44px] inline-flex items-center px-2 text-xs text-[var(--color-accent-text)] hover:underline">
                      {isExpanded ? 'Collapse' : 'View'}
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {hasResult && (
                    <button onClick={() => navigator.clipboard.writeText(results[domain.key])} className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)]">
                      <Copy size={12} />
                    </button>
                  )}
                  <button
                    onClick={() => runSingleAudit(domain)}
                    disabled={isLoading || !product}
                    className="inline-flex items-center gap-1 px-3 py-1.5 min-h-[44px] rounded-xl text-xs font-medium bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] hover:bg-[var(--color-btn-primary-hover)] transition-colors disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    {isLoading ? '...' : hasResult ? 'Redo' : 'Run'}
                  </button>
                </div>
              </div>
              {errors[domain.key] && (
                <div className="mx-4 mb-3 p-2 rounded-lg bg-[var(--color-error-bg)] border border-[var(--color-error)]/20 text-xs text-[var(--color-error)]">{errors[domain.key]}</div>
              )}
              {isLoading && (
                <div className="px-4 pb-3 flex items-center gap-2 text-xs text-[var(--color-ink-muted)]">
                  <Loader2 size={12} className="animate-spin" />
                  Auditing...
                </div>
              )}
              {hasResult && isExpanded && (
                <div className="px-4 pb-4 border-t border-[var(--color-edge)] pt-3 max-h-[500px] overflow-y-auto">
                  <div className="prose prose-sm max-w-none text-[var(--color-ink-body)] whitespace-pre-wrap">{results[domain.key]}</div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
