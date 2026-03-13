'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'

type SearchResult = {
  type: 'document' | 'insight' | 'source' | 'thesis' | 'company'
  id: string
  title: string
  excerpt: string
  url?: string | null
  tags?: string[]
}

const TYPE_LABELS: Record<string, string> = {
  document: 'Dokument',
  insight: 'Innsikt',
  source: 'Kilde',
  thesis: 'Masteroppgave',
  company: 'Selskap',
}

const TYPE_COLORS: Record<string, string> = {
  document: 'bg-blue-50 text-blue-700 border-blue-200',
  insight: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  source: 'bg-amber-50 text-amber-700 border-amber-200',
  thesis: 'bg-violet-50 text-violet-700 border-violet-200',
  company: 'bg-rose-50 text-rose-700 border-rose-200',
}

type SearchMode = 'keyword' | 'semantic' | 'hybrid'

const MODE_LABELS: Record<SearchMode, string> = {
  keyword: 'Nøkkelord',
  semantic: 'Semantisk',
  hybrid: 'Hybrid',
}

export function SokContent() {
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<SearchMode>('keyword')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const search = useCallback(async (q: string, m: SearchMode) => {
    if (q.trim().length < 2) {
      setResults([])
      setHasSearched(false)
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}&limit=50&mode=${m}`)
      const data = await res.json()
      setResults(data.results ?? [])
      setHasSearched(true)
    } catch {
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => search(query, mode), 300)
    return () => clearTimeout(timer)
  }, [query, mode, search])

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    if (!acc[r.type]) acc[r.type] = []
    acc[r.type].push(r)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Sok</h1>
        <p className="text-sm text-stone-400 mt-1">Sok pa tvers av dokumenter, innsikt, kilder og selskaper</p>
      </div>

      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Sok etter noe..."
          className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm bg-white"
          autoFocus
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-stone-300 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        )}
      </div>

      <div className="flex gap-1 bg-white rounded-lg border border-stone-200 p-1 w-fit">
        {(['keyword', 'semantic', 'hybrid'] as const).map(m => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              mode === m
                ? 'bg-emerald-50 text-emerald-700'
                : 'text-stone-500 hover:bg-stone-50 hover:text-stone-700'
            }`}
          >
            {MODE_LABELS[m]}
          </button>
        ))}
      </div>

      {hasSearched && results.length === 0 && (
        <EmptyState message={`Ingen resultater for "${query}"`} />
      )}

      {Object.entries(grouped).map(([type, items]) => (
        <div key={type}>
          <h2 className="text-xs uppercase tracking-wider text-stone-400 mb-2 px-1">
            {TYPE_LABELS[type] ?? type} ({items.length})
          </h2>
          <div className="space-y-2">
            {items.map(item => (
              <Card key={`${item.type}-${item.id}`} className="!p-4">
                <div className="flex items-center gap-2 mb-1">
                  {item.url ? (
                    <a href={item.url} className="text-sm font-semibold text-stone-800 hover:text-emerald-700">
                      {item.title}
                    </a>
                  ) : (
                    <span className="text-sm font-semibold text-stone-800">{item.title}</span>
                  )}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded border ${TYPE_COLORS[item.type]}`}>
                    {TYPE_LABELS[item.type]}
                  </span>
                </div>
                <p className="text-xs text-stone-500 line-clamp-2">{item.excerpt}</p>
                {item.tags && item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.tags.slice(0, 5).map(tag => (
                      <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-500 border border-stone-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
