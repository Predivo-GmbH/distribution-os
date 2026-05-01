import { useState, useEffect } from 'react'
import type { AppState, WorkerType } from '@/types'
import { PageMeta } from '@/components/shared/PageMeta'
import { APP_NAME } from '@/lib/app-config'
import { loadInbox, loadKnowledgeBase, saveKnowledgeBase } from '@/lib/storage'
import { Loader2, Sparkles, FileText, DollarSign } from 'lucide-react'
import { runProductDefiner, runOfferDesigner, parseKBExtract } from '@/lib/ai'
import type { KBExtract } from '@/lib/ai'

type Section = 'product' | 'offer'

const SECTION_WORKER_MAP: Record<Section, WorkerType> = {
  product: 'product-definer',
  offer: 'offer-designer',
}

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

  // Merge extracted KB fields into the existing Knowledge Base (only fills empty fields)
  function mergeKBExtract(extract: KBExtract) {
    if (!product) return
    const kb = loadKnowledgeBase(product.id)
    let changed = false

    if (extract.icp_who && !kb.icp.who) { kb.icp.who = extract.icp_who; changed = true }
    if (extract.icp_pain && !kb.icp.pain) { kb.icp.pain = extract.icp_pain; changed = true }
    if (extract.icp_tried_before && !kb.icp.triedBefore) { kb.icp.triedBefore = extract.icp_tried_before; changed = true }
    if (extract.icp_desired_outcome && !kb.icp.desiredOutcome) { kb.icp.desiredOutcome = extract.icp_desired_outcome; changed = true }
    if (extract.icp_hangouts && !kb.icp.hangoutsOnline) { kb.icp.hangoutsOnline = extract.icp_hangouts; changed = true }

    if (extract.positioning_oneliner && !kb.positioning.oneLiner) { kb.positioning.oneLiner = extract.positioning_oneliner; changed = true }
    if (extract.positioning_competitor && !kb.positioning.competitor) { kb.positioning.competitor = extract.positioning_competitor; changed = true }
    if (extract.positioning_switch_reason && !kb.positioning.switchReason) { kb.positioning.switchReason = extract.positioning_switch_reason; changed = true }

    const benefits = [extract.positioning_benefit_1, extract.positioning_benefit_2, extract.positioning_benefit_3]
    for (let i = 0; i < 3; i++) {
      if (benefits[i] && !kb.positioning.benefits[i]) {
        kb.positioning.benefits[i] = benefits[i]!
        changed = true
      }
    }

    if (changed) saveKnowledgeBase(product.id, kb)
  }

  // Load existing artifacts on mount / product change
  useEffect(() => {
    if (!productId) return
    const inbox = loadInbox()
    const loaded: Partial<Record<Section, string>> = {}
    for (const section of ['product', 'offer'] as Section[]) {
      const workerType = SECTION_WORKER_MAP[section]
      const artifact = inbox.find(a => a.productId === productId && a.workerType === workerType)
      if (artifact) loaded[section] = artifact.editedContent || artifact.content
    }
    setResults(prev => ({ ...prev, ...loaded }))
  }, [productId])

  async function generate(section: Section) {
    if (!product) return
    setLoading(prev => ({ ...prev, [section]: true }))
    setErrors(prev => ({ ...prev, [section]: '' }))
    try {
      const runner = SECTIONS.find(s => s.key === section)!.run
      const result = await runner(product)
      if (result.success) {
        const { clean, extract } = parseKBExtract(result.content)
        setResults(prev => ({ ...prev, [section]: clean }))
        mergeKBExtract(extract)
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
              className="inline-flex items-center gap-1.5 px-4 py-2 min-h-[44px] rounded-lg text-xs font-medium bg-[var(--color-btn-primary-bg)] text-[var(--color-btn-primary-text)] hover:bg-[var(--color-btn-primary-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
