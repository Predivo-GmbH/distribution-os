import { useState } from 'react'
import type { AppState } from '@/types'
import { PageMeta } from '@/components/shared/PageMeta'
import { APP_NAME } from '@/lib/app-config'
import { Loader2, Sparkles, FileText, DollarSign } from 'lucide-react'
import { runProductDefiner, runOfferDesigner } from '@/lib/ai'

type Section = 'product' | 'offer'

const SECTIONS = [
  { key: 'product' as Section, label: 'Product Brief', icon: FileText, run: runProductDefiner, desc: 'Define your product: name, persona, MVP features, and positioning.' },
  { key: 'offer' as Section, label: 'Offer Design', icon: DollarSign, run: runOfferDesigner, desc: 'Design pricing tiers, irresistible hook, objection busters, and launch offer.' },
] as const

export function OfferBuilder({ state }: { state: AppState }) {
  const [productId, setProductId] = useState(state.products[0]?.id ?? '')
  const [results, setResults] = useState<Record<Section, string>>({ product: '', offer: '' })
  const [loading, setLoading] = useState<Record<Section, boolean>>({ product: false, offer: false })
  const [errors, setErrors] = useState<Record<Section, string>>({ product: '', offer: '' })

  const product = state.products.find(p => p.id === productId)

  async function generate(section: Section) {
    if (!product) return
    setLoading(prev => ({ ...prev, [section]: true }))
    setErrors(prev => ({ ...prev, [section]: '' }))
    try {
      const runner = SECTIONS.find(s => s.key === section)!.run
      const result = await runner(product)
      if (result.success) {
        setResults(prev => ({ ...prev, [section]: result.content }))
      } else {
        setErrors(prev => ({ ...prev, [section]: result.error || 'Generation failed' }))
      }
    } catch (err) {
      setErrors(prev => ({ ...prev, [section]: err instanceof Error ? err.message : 'Unknown error' }))
    } finally {
      setLoading(prev => ({ ...prev, [section]: false }))
    }
  }

  if (state.products.length === 0) {
    return (
      <div className="space-y-6">
        <PageMeta title={`Brief — ${APP_NAME}`} noindex />
        <h1 className="text-2xl font-semibold text-[var(--color-ink)] tracking-tight">Offer Builder</h1>
        <div className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-xl p-6 text-center">
          <p className="text-sm text-[var(--color-ink-muted)]">Add a product first to build your offer.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageMeta title={`Brief — ${APP_NAME}`} noindex />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-ink)] tracking-tight">Offer Builder</h1>
          <p className="text-sm text-[var(--color-ink-muted)] mt-1">Define your product and design an irresistible offer.</p>
        </div>
        {state.products.length > 1 && (
          <select value={productId} onChange={e => setProductId(e.target.value)} className="px-3 py-2 min-h-[44px] rounded-lg border border-[var(--color-edge)] bg-[var(--color-surface)] text-sm text-[var(--color-ink)]">
            {state.products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        )}
      </div>

      {SECTIONS.map(({ key, label, icon: Icon, desc }) => (
        <div key={key} className="bg-[var(--color-surface)] border border-[var(--color-edge)] rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-[var(--color-edge)]">
            <div className="flex items-center gap-2">
              <Icon size={16} className="text-[var(--color-accent-text)]" />
              <h2 className="text-sm font-semibold text-[var(--color-ink)]">{label}</h2>
            </div>
            <button
              onClick={() => generate(key)}
              disabled={loading[key] || !product}
              className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-lg text-xs font-medium bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] hover:bg-[var(--color-btn-primary-hover)] transition-colors disabled:opacity-50"
            >
              {loading[key] ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              {loading[key] ? 'Generating...' : results[key] ? 'Regenerate' : 'Generate'}
            </button>
          </div>
          <div className="p-4 sm:p-5">
            {errors[key] && (
              <div className="mb-3 p-3 rounded-lg bg-[var(--color-error-bg)] border border-[var(--color-error)]/20 text-sm text-[var(--color-error)]">{errors[key]}</div>
            )}
            {results[key] ? (
              <div className="prose prose-sm max-w-none text-[var(--color-ink-body)] whitespace-pre-wrap">{results[key]}</div>
            ) : !loading[key] ? (
              <p className="text-sm text-[var(--color-ink-muted)] italic">{desc}</p>
            ) : (
              <div className="flex items-center gap-2 text-sm text-[var(--color-ink-muted)]">
                <Loader2 size={14} className="animate-spin" />
                Running {label.toLowerCase()} agent...
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
