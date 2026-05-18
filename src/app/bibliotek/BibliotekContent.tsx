'use client'

import { useState, useMemo, useCallback, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'

type DocumentRow = {
  id: string
  slug: string
  title: string
  author: string | null
  year: number | null
  category: string | null
  subcategory: string | null
  country: string | null
  documentType: string | null
  summary: string | null
  wordCount: number
  tags: string[]
}

type RelatedDoc = { id: string; title: string; slug: string }
type DocumentRef = { to?: RelatedDoc; from?: RelatedDoc }

type ExpandedDocument = DocumentRow & {
  content: string
  url: string | null
  refsFrom: DocumentRef[]
  refsTo: DocumentRef[]
}

type SearchMode = 'local' | 'fts' | 'semantic'

type SearchWarning = {
  code: 'semantic-unavailable' | 'semantic-error'
  message: string
}

type ApiSearchResult = {
  type: string
  id: string
  title: string
  excerpt: string
  url?: string | null
  tags?: string[]
  relevance?: number
}

type SearchApiResponse = {
  results?: ApiSearchResult[]
  warnings?: SearchWarning[]
  executedMode?: 'keyword' | 'semantic' | 'hybrid'
  fallback?: boolean
  error?: string
}

const MODE_LABELS: Record<SearchMode, string> = {
  local: 'Rask',
  fts: 'FTS',
  semantic: 'Semantisk',
}

const MODE_DESCRIPTIONS: Record<SearchMode, string> = {
  local: 'Filtrer pre-lastede dokumenter på tittel/forfatter/sammendrag/tags',
  fts: 'Postgres fulltekst-rangert søk i hele dokumentinnholdet',
  semantic: 'Vektor-likhet via OpenAI embeddings (faller tilbake til FTS hvis ikke klart)',
}

function highlightText(text: string, query: string) {
  if (!query.trim()) return text
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'))
  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase()
      ? <mark key={i} className="bg-yellow-200 text-yellow-900 rounded-sm px-0.5">{part}</mark>
      : part
  )
}

function uniqueSorted(values: (string | null | undefined)[]): string[] {
  return [...new Set(values.filter((v): v is string => !!v))].sort()
}

function formatWordCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k ord`
  return `${n} ord`
}

export function BibliotekContent({ documents }: { documents: DocumentRow[] }) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('alle')
  const [categoryFilter, setCategoryFilter] = useState('alle')
  const [countryFilter, setCountryFilter] = useState('alle')
  const [searchMode, setSearchMode] = useState<SearchMode>('local')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [loadedDocs, setLoadedDocs] = useState<Map<string, ExpandedDocument>>(new Map())
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set())

  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(undefined)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // API search state (only populated when searchMode !== 'local')
  const [apiResults, setApiResults] = useState<ApiSearchResult[]>([])
  const [apiWarnings, setApiWarnings] = useState<SearchWarning[]>([])
  const [apiExecutedMode, setApiExecutedMode] = useState<string | null>(null)
  const [apiLoading, setApiLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  const handleSearch = useCallback((value: string) => {
    setSearch(value)
    if (searchTimeout.current) clearTimeout(searchTimeout.current)
    searchTimeout.current = setTimeout(() => setDebouncedSearch(value), 200)
  }, [])

  // Server-side search effect: only when in fts/semantic mode with a real query
  useEffect(() => {
    if (searchMode === 'local') {
      setApiResults([])
      setApiWarnings([])
      setApiExecutedMode(null)
      setApiError(null)
      return
    }
    if (debouncedSearch.trim().length < 2) {
      setApiResults([])
      setApiWarnings([])
      setApiExecutedMode(null)
      setApiError(null)
      return
    }
    const requestedApiMode = searchMode === 'fts' ? 'keyword' : 'semantic'
    let cancelled = false
    setApiLoading(true)
    setApiError(null)
    fetch(`/api/search?q=${encodeURIComponent(debouncedSearch)}&limit=50&mode=${requestedApiMode}`)
      .then(async (res) => {
        const data = (await res.json()) as SearchApiResponse
        if (!res.ok) throw new Error(data.error ?? 'Søk er utilgjengelig akkurat nå')
        if (cancelled) return
        // Filter to document results only — /bibliotek viser ikke aktører/selskaper
        const docResults = (data.results ?? []).filter((r) => r.type === 'document')
        setApiResults(docResults)
        setApiWarnings(data.warnings ?? [])
        setApiExecutedMode(data.executedMode ?? null)
      })
      .catch((err) => {
        if (cancelled) return
        setApiResults([])
        setApiWarnings([])
        setApiExecutedMode(null)
        setApiError(err instanceof Error ? err.message : 'Søk er utilgjengelig akkurat nå')
      })
      .finally(() => {
        if (!cancelled) setApiLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [debouncedSearch, searchMode])

  const types = useMemo(() => uniqueSorted(documents.map(d => d.documentType)), [documents])
  const categories = useMemo(() => uniqueSorted(documents.map(d => d.category)), [documents])
  const countries = useMemo(() => uniqueSorted(documents.map(d => d.country)), [documents])

  const filtered = useMemo(() => {
    const q = debouncedSearch.toLowerCase()
    return documents.filter(d => {
      if (typeFilter !== 'alle' && d.documentType !== typeFilter) return false
      if (categoryFilter !== 'alle' && d.category !== categoryFilter) return false
      if (countryFilter !== 'alle' && d.country !== countryFilter) return false
      if (q) {
        const searchable = [d.title, d.author, d.summary, ...d.tags].filter(Boolean).join(' ').toLowerCase()
        if (!searchable.includes(q)) return false
      }
      return true
    })
  }, [documents, debouncedSearch, typeFilter, categoryFilter, countryFilter])

  const totalWords = useMemo(() => documents.reduce((sum, d) => sum + d.wordCount, 0), [documents])

  const toggleExpand = useCallback(async (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        return next
      }
      next.add(id)
      return next
    })

    if (!loadedDocs.has(id) && !loadingIds.has(id)) {
      setLoadingIds(prev => new Set(prev).add(id))
      try {
        const res = await fetch(`/api/documents/${id}`)
        if (res.ok) {
          const doc = await res.json()
          setLoadedDocs(prev => new Map(prev).set(id, doc))
        }
      } finally {
        setLoadingIds(prev => {
          const next = new Set(prev)
          next.delete(id)
          return next
        })
      }
    }
  }, [loadedDocs, loadingIds])

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Bibliotek</h1>
          <p className="text-xs uppercase tracking-wider text-stone-500 mt-0.5 font-medium">
            Dokumentleser — fulltekst og søk i nedlastede dokumenter
          </p>
          <p className="text-sm text-stone-400 mt-1">
            {documents.length} forskningsdokumenter · {formatWordCount(totalWords)} totalt
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <input
          type="text"
          value={search}
          onChange={e => handleSearch(e.target.value)}
          placeholder={searchMode === 'local' ? 'Sok i dokumenter...' : 'Sok i hele dokumentinnholdet...'}
          className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg bg-white text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-stone-300"
        />

        <div className="flex gap-2 flex-wrap items-center">
          <div className="inline-flex rounded-lg border border-stone-200 bg-white p-0.5" role="group" aria-label="Søkemodus">
            {(['local', 'fts', 'semantic'] as SearchMode[]).map((m) => {
              const active = searchMode === m
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSearchMode(m)}
                  title={MODE_DESCRIPTIONS[m]}
                  className={`text-xs px-2.5 py-1 rounded-md transition-colors ${
                    active
                      ? 'bg-stone-900 text-white'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                  aria-pressed={active}
                >
                  {MODE_LABELS[m]}
                </button>
              )
            })}
          </div>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            disabled={searchMode !== 'local'}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-300 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <option value="alle">Type: Alle</option>
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            disabled={searchMode !== 'local'}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-300 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <option value="alle">Kategori: Alle</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          <select
            value={countryFilter}
            onChange={e => setCountryFilter(e.target.value)}
            disabled={searchMode !== 'local'}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-300 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <option value="alle">Land: Alle</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {searchMode !== 'local' && apiWarnings.length > 0 && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
            {apiWarnings.map((w, i) => (
              <p key={i}>{w.message}</p>
            ))}
          </div>
        )}
        {searchMode !== 'local' && apiError && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">
            {apiError}
          </div>
        )}
      </div>

      {searchMode !== 'local' ? (
        <ApiResultsView
          query={debouncedSearch}
          results={apiResults}
          loading={apiLoading}
          executedMode={apiExecutedMode}
          requestedMode={searchMode}
        />
      ) : filtered.length === 0 ? (
        <EmptyState message="Ingen dokumenter matcher filteret" />
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-stone-400">{filtered.length} dokumenter</p>
          {filtered.map(doc => {
            const isExpanded = expandedIds.has(doc.id)
            const loaded = loadedDocs.get(doc.id)
            const isLoading = loadingIds.has(doc.id)

            return (
              <Card key={doc.id} className="!p-0">
                <button
                  type="button"
                  className="w-full text-left px-4 py-3 flex items-start gap-3"
                  onClick={() => toggleExpand(doc.id)}
                >
                  <svg
                    className={`w-3.5 h-3.5 text-stone-400 shrink-0 mt-1 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-stone-800 truncate">
                      {debouncedSearch ? highlightText(doc.title, debouncedSearch) : doc.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-400">
                      {doc.author && <span>{doc.author}</span>}
                      {doc.author && doc.year && <span>·</span>}
                      {doc.year && <span>{doc.year}</span>}
                      {(doc.author || doc.year) && doc.documentType && <span>·</span>}
                      {doc.documentType && <span>{doc.documentType}</span>}
                    </div>
                    {doc.tags.length > 0 && (
                      <div className="flex gap-1 mt-1.5 flex-wrap">
                        {doc.tags.map((tag, index) => (
                          <span
                            key={`${doc.id}-${tag}-${index}`}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-500 border border-stone-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <span className="text-xs text-stone-400 shrink-0 mt-1">
                    {formatWordCount(doc.wordCount)}
                  </span>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-stone-100">
                    {isLoading && (
                      <div className="py-6 text-center text-sm text-stone-400">
                        Laster innhold...
                      </div>
                    )}

                    {loaded && (
                      <div className="mt-3 space-y-4">
                        {loaded.summary && (
                          <div>
                            <p className="text-xs font-medium text-stone-500 mb-1">Sammendrag</p>
                            <p className="text-sm text-stone-700 leading-relaxed">{loaded.summary}</p>
                          </div>
                        )}

                        <div>
                          <p className="text-xs font-medium text-stone-500 mb-1">Fulltekst</p>
                          <div className="max-h-96 overflow-y-auto rounded-lg bg-stone-50 border border-stone-200 p-3">
                            <pre className="text-sm text-stone-700 whitespace-pre-wrap font-sans leading-relaxed">
                              {debouncedSearch
                                ? highlightText(loaded.content, debouncedSearch)
                                : loaded.content}
                            </pre>
                          </div>
                        </div>

                        {(loaded.refsFrom.length > 0 || loaded.refsTo.length > 0) && (
                          <div>
                            <p className="text-xs font-medium text-stone-500 mb-1.5">Relaterte dokumenter</p>
                            <div className="flex gap-1.5 flex-wrap">
                              {loaded.refsFrom.map(ref => ref.to && (
                                <Link
                                  key={ref.to.id}
                                  href={`/bibliotek/${ref.to.slug}`}
                                  className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                                >
                                  {ref.to.title}
                                </Link>
                              ))}
                              {loaded.refsTo.map(ref => ref.from && (
                                <Link
                                  key={ref.from.id}
                                  href={`/bibliotek/${ref.from.slug}`}
                                  className="text-xs px-2 py-1 rounded bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 transition-colors"
                                >
                                  {ref.from.title}
                                </Link>
                              ))}
                            </div>
                          </div>
                        )}

                        {loaded.url && (
                          <div className="pt-1">
                            <a
                              href={loaded.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-stone-400 hover:text-stone-600 underline underline-offset-2"
                            >
                              Apne kilde &rarr;
                            </a>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

type ApiResultsViewProps = {
  query: string
  results: ApiSearchResult[]
  loading: boolean
  executedMode: string | null
  requestedMode: SearchMode
}

function ApiResultsView({ query, results, loading, executedMode, requestedMode }: ApiResultsViewProps) {
  if (query.trim().length < 2) {
    return (
      <EmptyState message="Skriv minst 2 tegn for å søke serverside" />
    )
  }
  if (loading) {
    return (
      <div className="py-8 text-center text-sm text-stone-400">Søker...</div>
    )
  }
  if (results.length === 0) {
    return (
      <EmptyState message={`Ingen dokumenter matcher "${query}"`} />
    )
  }
  const wasFallback = requestedMode === 'semantic' && executedMode !== 'semantic'
  return (
    <div className="space-y-2">
      <p className="text-xs text-stone-400">
        {results.length} dokumenter
        {executedMode && <span> · søkemodus: <span className="font-medium text-stone-600">{executedMode}</span>{wasFallback && <span className="text-amber-600"> (fallback)</span>}</span>}
      </p>
      {results.map((r) => (
        <Card key={r.id} className="!p-0">
          <Link
            href={r.url ?? '#'}
            className="block px-4 py-3 hover:bg-stone-50 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-stone-800">{r.title}</h3>
                {r.excerpt && (
                  <p className="text-xs text-stone-500 mt-1 leading-relaxed line-clamp-3">
                    {r.excerpt}
                  </p>
                )}
                {r.tags && r.tags.length > 0 && (
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {r.tags.slice(0, 6).map((tag, i) => (
                      <span
                        key={`${r.id}-${tag}-${i}`}
                        className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-500 border border-stone-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {typeof r.relevance === 'number' && (
                <span className="text-xs text-stone-400 shrink-0 mt-1" title="Relevans (1.0 = perfekt match)">
                  {r.relevance.toFixed(2)}
                </span>
              )}
            </div>
          </Link>
        </Card>
      ))}
    </div>
  )
}
