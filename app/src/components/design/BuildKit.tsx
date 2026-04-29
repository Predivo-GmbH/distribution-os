import { useState } from 'react'
import type { AppState } from '@/types'
import { PageMeta } from '@/components/shared/PageMeta'
import { APP_NAME } from '@/lib/app-config'
import { Loader2, Sparkles, Globe, Palette, BookOpen, ShieldCheck, Plus, X, ChevronRight, Download, Copy } from 'lucide-react'
import { runBrandAnalyzer, runTokenExtractor, runBrandBookGenerator, runConsistencyChecker } from '@/lib/ai'
import type { Product } from '@/types'

type Step = 'urls' | 'analyze' | 'tokens' | 'brand-book' | 'consistency'

const STEPS: { key: Step; label: string; icon: React.ElementType }[] = [
  { key: 'urls', label: 'Reference URLs', icon: Globe },
  { key: 'analyze', label: 'Brand Analysis', icon: Palette },
  { key: 'tokens', label: 'Design Tokens', icon: Palette },
  { key: 'brand-book', label: 'Brand Book', icon: BookOpen },
  { key: 'consistency', label: 'Consistency Check', icon: ShieldCheck },
]

export function BuildKit({ state }: { state: AppState }) {
  const [productId, setProductId] = useState(state.products[0]?.id ?? '')
  const [urls, setUrls] = useState<string[]>([''])
  const [currentStep, setCurrentStep] = useState<Step>('urls')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Pipeline results
  const [brandAnalysis, setBrandAnalysis] = useState('')
  const [designTokens, setDesignTokens] = useState('')
  const [brandBook, setBrandBook] = useState('')
  const [consistencyReport, setConsistencyReport] = useState('')

  const product = state.products.find(p => p.id === productId)
  const stepIndex = STEPS.findIndex(s => s.key === currentStep)

  function addUrl() {
    if (urls.length < 5) setUrls(prev => [...prev, ''])
  }

  function removeUrl(index: number) {
    setUrls(prev => prev.filter((_, i) => i !== index))
  }

  function updateUrl(index: number, value: string) {
    setUrls(prev => prev.map((u, i) => i === index ? value : u))
  }

  async function runStep(step: Step) {
    if (!product) return
    setLoading(true)
    setError('')

    try {
      switch (step) {
        case 'analyze': {
          const validUrls = urls.filter(u => u.trim())
          if (validUrls.length === 0) {
            setError('Add at least one reference URL.')
            break
          }
          const result = await runBrandAnalyzer(product, validUrls)
          if (result.success) {
            setBrandAnalysis(result.content)
            setCurrentStep('tokens')
          } else {
            setError(result.error || 'Brand analysis failed')
          }
          break
        }
        case 'tokens': {
          const result = await runTokenExtractor(product, brandAnalysis)
          if (result.success) {
            setDesignTokens(result.content)
            setCurrentStep('brand-book')
          } else {
            setError(result.error || 'Token extraction failed')
          }
          break
        }
        case 'brand-book': {
          const result = await runBrandBookGenerator(product, designTokens, brandAnalysis)
          if (result.success) {
            setBrandBook(result.content)
            setCurrentStep('consistency')
          } else {
            setError(result.error || 'Brand book generation failed')
          }
          break
        }
        case 'consistency': {
          const result = await runConsistencyChecker(product, designTokens, brandBook)
          if (result.success) {
            setConsistencyReport(result.content)
          } else {
            setError(result.error || 'Consistency check failed')
          }
          break
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text)
  }

  function downloadAsFile(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  if (state.products.length === 0) {
    return (
      <div className="space-y-6">
        <PageMeta title={`Build Kit — ${APP_NAME}`} noindex />
        <h1 className="text-2xl font-semibold text-[var(--color-ink)] tracking-tight">Design Build Kit</h1>
        <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-xl p-6 text-center">
          <p className="text-sm text-[var(--color-ink-muted)]">Add a product first to run the design pipeline.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageMeta title={`Build Kit — ${APP_NAME}`} noindex />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-ink)] tracking-tight">Design Build Kit</h1>
          <p className="text-sm text-[var(--color-ink-muted)] mt-1">Generate your brand foundation: tokens, brand book, and consistency report.</p>
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

      {/* Step indicator */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {STEPS.map(({ key, label, icon: Icon }, i) => {
          const isActive = key === currentStep
          const isCompleted = i < stepIndex
          return (
            <div key={key} className="flex items-center gap-1 shrink-0">
              {i > 0 && <ChevronRight size={12} className="text-[var(--color-ink-muted)]" />}
              <button
                onClick={() => isCompleted && setCurrentStep(key)}
                disabled={!isCompleted && !isActive}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-[var(--color-accent-light)] text-[var(--color-accent-text)]'
                    : isCompleted
                      ? 'bg-[var(--color-surface-hover)] text-[var(--color-ink-body)] cursor-pointer hover:bg-[var(--color-edge)]'
                      : 'text-[var(--color-ink-muted)] opacity-50 cursor-not-allowed'
                }`}
              >
                <Icon size={12} />
                {label}
              </button>
            </div>
          )
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 rounded-lg bg-[var(--color-error-bg)] border border-[var(--color-error)]/20 text-sm text-[var(--color-error)]">{error}</div>
      )}

      {/* Step: URL Input */}
      {currentStep === 'urls' && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-xl p-4 sm:p-5 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-[var(--color-ink)] mb-1">Reference URLs</h2>
            <p className="text-xs text-[var(--color-ink-muted)]">Add 1-5 websites that represent the visual direction you want. These will be analyzed for colors, fonts, spacing, and tone.</p>
          </div>
          <div className="space-y-2">
            {urls.map((url, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="url"
                  value={url}
                  onChange={e => updateUrl(i, e.target.value)}
                  placeholder="https://example.com"
                  className="flex-1 px-3 py-2 min-h-[44px] rounded-lg border border-[var(--color-edge)] bg-[var(--color-surface)] text-sm text-[var(--color-ink)] placeholder:text-[var(--color-ink-muted)]"
                />
                {urls.length > 1 && (
                  <button
                    onClick={() => removeUrl(i)}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-hover)] transition-colors"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between">
            {urls.length < 5 && (
              <button
                onClick={addUrl}
                className="inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-lg text-xs font-medium border border-[var(--color-edge)] text-[var(--color-ink-body)] hover:bg-[var(--color-surface-hover)] transition-colors"
              >
                <Plus size={12} />
                Add URL
              </button>
            )}
            <button
              onClick={() => runStep('analyze')}
              disabled={loading || !product || urls.every(u => !u.trim())}
              className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-lg text-xs font-medium bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] hover:bg-[var(--color-btn-primary-hover)] transition-colors disabled:opacity-50 ml-auto"
            >
              {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              {loading ? 'Analyzing...' : 'Analyze Brand'}
            </button>
          </div>
        </div>
      )}

      {/* Step: Brand Analysis Result */}
      {currentStep === 'analyze' && brandAnalysis && (
        <ResultCard
          title="Brand Analysis"
          content={brandAnalysis}
          loading={loading}
          onNext={() => runStep('tokens')}
          nextLabel="Extract Tokens"
          onCopy={() => copyToClipboard(brandAnalysis)}
        />
      )}

      {/* Step: Design Tokens Result */}
      {currentStep === 'tokens' && designTokens && (
        <ResultCard
          title="Design Tokens"
          content={designTokens}
          loading={loading}
          onNext={() => runStep('brand-book')}
          nextLabel="Generate Brand Book"
          onCopy={() => copyToClipboard(designTokens)}
          onDownload={() => downloadAsFile(designTokens, 'design-tokens.json')}
        />
      )}

      {/* Step: Brand Book Result */}
      {currentStep === 'brand-book' && brandBook && (
        <ResultCard
          title="Brand Book"
          content={brandBook}
          loading={loading}
          onNext={() => runStep('consistency')}
          nextLabel="Run Consistency Check"
          onCopy={() => copyToClipboard(brandBook)}
          onDownload={() => downloadAsFile(brandBook, 'brand-book.md')}
        />
      )}

      {/* Step: Consistency Report */}
      {currentStep === 'consistency' && consistencyReport && (
        <ResultCard
          title="Consistency Report"
          content={consistencyReport}
          loading={false}
          onCopy={() => copyToClipboard(consistencyReport)}
        />
      )}

      {/* Loading overlay for intermediate steps */}
      {loading && currentStep !== 'urls' && (
        <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-xl p-6 flex items-center justify-center gap-3">
          <Loader2 size={16} className="animate-spin text-[var(--color-accent-text)]" />
          <span className="text-sm text-[var(--color-ink-muted)]">
            {currentStep === 'analyze' && 'Analyzing brand patterns...'}
            {currentStep === 'tokens' && 'Extracting design tokens...'}
            {currentStep === 'brand-book' && 'Generating brand book...'}
            {currentStep === 'consistency' && 'Running consistency check...'}
          </span>
        </div>
      )}
    </div>
  )
}

function ResultCard({
  title,
  content,
  loading,
  onNext,
  nextLabel,
  onCopy,
  onDownload,
}: {
  title: string
  content: string
  loading: boolean
  onNext?: () => void
  nextLabel?: string
  onCopy: () => void
  onDownload?: () => void
}) {
  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-[var(--color-edge)]">
        <h2 className="text-sm font-semibold text-[var(--color-ink)]">{title}</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onCopy}
            className="inline-flex items-center gap-1 px-3 py-1.5 min-h-[44px] rounded-lg text-xs font-medium border border-[var(--color-edge)] text-[var(--color-ink-body)] hover:bg-[var(--color-surface-hover)] transition-colors"
          >
            <Copy size={12} />
            Copy
          </button>
          {onDownload && (
            <button
              onClick={onDownload}
              className="inline-flex items-center gap-1 px-3 py-1.5 min-h-[44px] rounded-lg text-xs font-medium border border-[var(--color-edge)] text-[var(--color-ink-body)] hover:bg-[var(--color-surface-hover)] transition-colors"
            >
              <Download size={12} />
              Download
            </button>
          )}
          {onNext && (
            <button
              onClick={onNext}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-lg text-xs font-medium bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] hover:bg-[var(--color-btn-primary-hover)] transition-colors disabled:opacity-50"
            >
              {loading ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              {loading ? 'Processing...' : nextLabel}
            </button>
          )}
        </div>
      </div>
      <div className="p-4 sm:p-5 max-h-[600px] overflow-y-auto">
        <div className="prose prose-sm max-w-none text-[var(--color-ink-body)] whitespace-pre-wrap">{content}</div>
      </div>
    </div>
  )
}
