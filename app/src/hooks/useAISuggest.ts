import { useState, useCallback } from 'react'
import { analyzeProduct, type ProductAnalysis } from '@/lib/ai/product-analyzer'
import { isSupabaseConfigured } from '@/lib/supabase'
import { isAIConfigured } from '@/lib/ai/config'

interface UseAISuggestReturn {
  analysis: ProductAnalysis | null
  loading: boolean
  error: string | null
  analyze: (name: string, description?: string) => Promise<ProductAnalysis | null>
  available: boolean
  usageNote: string
}

export function useAISuggest(): UseAISuggestReturn {
  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // AI is available when either Supabase proxy or local API key is configured
  const available = isSupabaseConfigured || isAIConfigured()

  const usageNote = 'Uses 1 of your monthly AI credits'

  const analyze = useCallback(async (name: string, description?: string) => {
    if (!name.trim()) return null

    setError(null)
    setLoading(true)

    try {
      const result = await analyzeProduct(name.trim(), description?.trim() || undefined)
      if (result) {
        setAnalysis(result)
      } else {
        setError('AI analysis returned no results. The service may be temporarily unavailable — try again in a moment.')
      }
      return result
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'AI analysis failed'
      setError(msg.includes('API key') ? msg : `AI analysis failed: ${msg}`)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { analysis, loading, error, analyze, available, usageNote }
}
