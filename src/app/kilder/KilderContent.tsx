'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'

type SourceRow = {
  id: string
  filename: string
  title: string | null
  author: string | null
  year: string | number | null
  sourceType: string
  description: string
  relevance: string
  url: string | null
  isDuplicate: boolean
  document: { id: string; slug: string; title: string } | null
}

const typeLabels: Record<string, string> = {
  alle: 'Alle kilder',
  nou: 'NOU-er',
  rapport: 'Rapporter',
  masteroppgave: 'Masteroppgaver',
  statistikk: 'Statistikk',
  lovverk: 'Lovverk',
  analyse: 'Analyser',
  '\u00e5rsrapport': '\u00c5rsrapporter',
  soknad: 'S\u00f8knader',
  notat: 'Notater',
  transkripsjon: 'Samtaler',
  strategi: 'Strategidok.',
  epost: 'E-poster',
  arbeidsdok: 'Arbeidsdok.',
}

export function KilderContent({ sources }: { sources: SourceRow[] }) {
  const [filter, setFilter] = useState<string>('alle')
  const [search, setSearch] = useState('')

  const filteredSources = sources.filter(src => {
    const matchesFilter = filter === 'alle' || src.sourceType === filter
    const matchesSearch =
      src.title?.toLowerCase().includes(search.toLowerCase()) ||
      src.filename.toLowerCase().includes(search.toLowerCase()) ||
      src.author?.toLowerCase().includes(search.toLowerCase()) ||
      src.description.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  const stats = {
    total: sources.length,
    nou: sources.filter(s => s.sourceType === 'nou').length,
    rapport: sources.filter(s => s.sourceType === 'rapport').length,
    analyse: sources.filter(s => s.sourceType === 'analyse').length,
    lovverk: sources.filter(s => s.sourceType === 'lovverk').length,
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Kunnskapsgrunnlag</h1>
          <p className="text-stone-500 mt-2 max-w-2xl">
            Systematisk kartlegging av underlag for Food Systems 2026.
            Inkluderer offentlige utredninger, markedstall, juridiske vedtak og akademisk forskning.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white px-4 py-2 rounded-lg border border-stone-200 shadow-sm">
            <div className="text-xs text-stone-400 uppercase font-bold tracking-wider">Total</div>
            <div className="text-xl font-bold text-stone-900">{stats.total}</div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg border border-stone-200 shadow-sm">
            <div className="text-xs text-emerald-600 uppercase font-bold tracking-wider">NOU</div>
            <div className="text-xl font-bold text-stone-900">{stats.nou}</div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg border border-stone-200 shadow-sm">
            <div className="text-xs text-blue-600 uppercase font-bold tracking-wider">Rapporter</div>
            <div className="text-xl font-bold text-stone-900">{stats.rapport}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center bg-stone-50 p-4 rounded-xl border border-stone-200">
        <div className="w-full md:w-64">
          <input
            type="text"
            placeholder="S\u00f8k i kilder..."
            className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(typeLabels).map(([key, label]) => {
            const count = key === 'alle' ? sources.length : sources.filter(s => s.sourceType === key).length
            if (count === 0 && key !== 'alle') return null

            return (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filter === key
                    ? 'bg-stone-900 text-white shadow-md'
                    : 'bg-white text-stone-600 border border-stone-200 hover:border-stone-300'
                }`}
              >
                {label} ({count})
              </button>
            )
          })}
        </div>
      </div>

      {filter === 'nou' || filter === 'analyse' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSources.map(src => (
            <Card key={src.id} className="p-6 hover:shadow-lg transition-shadow border-t-4 border-t-emerald-500">
              <div className="flex justify-between items-start mb-4">
                <StatusBadge status={src.sourceType} />
                <span className="text-xs font-bold text-stone-400">{src.year}</span>
              </div>
              <h3 className="font-bold text-stone-900 leading-tight mb-2 h-12 overflow-hidden line-clamp-2">
                {src.title || src.filename}
              </h3>
              <p className="text-xs text-stone-500 mb-4 line-clamp-3">
                {src.description}
              </p>
              <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
                <span className="text-[10px] font-mono text-stone-400 uppercase">{src.author}</span>
                {src.url && (
                  <a
                    href={src.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-600 text-xs font-bold hover:underline"
                  >
                    \u00c5pne kilde \u2192
                  </a>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200">
                  <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Kilde / Tittel</th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Utgiver / \u00c5r</th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Beskrivelse</th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider text-right">Lenke</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredSources.map(src => (
                  <tr key={src.id} className={`hover:bg-stone-50/50 transition-colors ${src.isDuplicate ? 'opacity-40' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="font-bold text-stone-900 text-sm truncate max-w-xs" title={src.title || src.filename}>
                        {src.title || src.filename}
                      </div>
                      <div className="text-[10px] font-mono text-stone-400">{src.filename}</div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={src.sourceType} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-stone-700">{src.author || '\u2014'}</div>
                      <div className="text-xs text-stone-400">{src.year}</div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-stone-500 line-clamp-2 max-w-md">{src.description}</p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {src.url ? (
                        <a
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-stone-100 text-stone-600 hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      ) : (
                        <span className="text-stone-300">\u2014</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {filteredSources.length === 0 && (
        <div className="text-center py-20 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200">
          <div className="text-stone-400 mb-2">Ingen kilder matchet s\u00f8ket ditt.</div>
          <button onClick={() => {setFilter('alle'); setSearch('')}} className="text-emerald-600 font-bold hover:underline">Nullstill alle filtre</button>
        </div>
      )}
    </div>
  )
}
