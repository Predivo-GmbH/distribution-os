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
}

export function useAISuggest(): UseAISuggestReturn {
  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // AI is available when either Supabase proxy or local API key is configured
  const available = isSupabaseConfigured || isAIConfigured()

  const analyze = useCallback(async (name: string, description?: string) => {
    if (!name.trim()) return null

    setLoading(true)
    setError(null)

    try {
      const result = await analyzeProduct(name.trim(), description?.trim() || undefined)
      if (result) {
        setAnalysis(result)
      } else {
        setError('Could not analyze product. Try again.')
      }
      return result
    } catch {
      setError('AI analysis failed. Try again.')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { analysis, loading, error, analyze, available }
}
