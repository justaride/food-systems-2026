'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'

type SourceDownloadStatus = 'downloaded' | 'url_only' | 'missing_metadata_only' | 'untracked'

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
  downloadStatus: SourceDownloadStatus
  researchRound: '2026-03-18' | '2026-04-20' | null
  backlogTheme: string | null
  backlogPriority: string | null
  backlogTargetPath: string | null
  matchedBy: 'url' | 'filename' | 'target-basename' | 'title' | null
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

const statusLabels: Record<SourceDownloadStatus | 'all', string> = {
  all: 'Alle statuser',
  downloaded: 'Nedlastet',
  url_only: 'Kun URL',
  missing_metadata_only: 'Mangler metadata',
  untracked: 'Ikke sporet',
}

function statusDot(status: SourceDownloadStatus): { className: string; label: string } {
  switch (status) {
    case 'downloaded':
      return { className: 'bg-emerald-500', label: 'Nedlastet lokalt' }
    case 'url_only':
      return { className: 'bg-amber-500', label: 'Kun URL registrert' }
    case 'missing_metadata_only':
      return { className: 'bg-rose-500', label: 'Mangler metadata' }
    case 'untracked':
      return { className: 'bg-stone-300', label: 'Ikke sporet i backlog' }
  }
}

export function KilderContent({ sources }: { sources: SourceRow[] }) {
  const [filter, setFilter] = useState<string>('alle')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<SourceDownloadStatus | 'all'>('all')
  const [roundFilter, setRoundFilter] = useState<'all' | '2026-03-18' | '2026-04-20'>('all')

  const filteredSources = sources.filter((src) => {
    const matchesType = filter === 'alle' || src.sourceType === filter
    const matchesStatus = statusFilter === 'all' || src.downloadStatus === statusFilter
    const matchesRound =
      roundFilter === 'all' ||
      src.researchRound === roundFilter ||
      (roundFilter === '2026-04-20' && src.id >= 'src-127' && src.id <= 'src-153')
    const matchesSearch =
      src.title?.toLowerCase().includes(search.toLowerCase()) ||
      src.filename.toLowerCase().includes(search.toLowerCase()) ||
      src.author?.toLowerCase().includes(search.toLowerCase()) ||
      src.description.toLowerCase().includes(search.toLowerCase())
    return matchesType && matchesStatus && matchesRound && matchesSearch
  })

  const statusStats = {
    downloaded: sources.filter((s) => s.downloadStatus === 'downloaded').length,
    urlOnly: sources.filter((s) => s.downloadStatus === 'url_only').length,
    missingMetadata: sources.filter((s) => s.downloadStatus === 'missing_metadata_only').length,
    untracked: sources.filter((s) => s.downloadStatus === 'untracked').length,
  }

  const stats = {
    total: sources.length,
    nou: sources.filter((s) => s.sourceType === 'nou').length,
    rapport: sources.filter((s) => s.sourceType === 'rapport').length,
    analyse: sources.filter((s) => s.sourceType === 'analyse').length,
    lovverk: sources.filter((s) => s.sourceType === 'lovverk').length,
  }

  const researchRoundCount = sources.filter(
    (s) => s.id >= 'src-127' && s.id <= 'src-153',
  ).length

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Kunnskapsgrunnlag</h1>
          <p className="text-stone-500 mt-2 max-w-2xl">
            Systematisk kartlegging av underlag for Food Systems 2026. Inkluderer offentlige
            utredninger, markedstall, juridiske vedtak og akademisk forskning. Nedlastningsstatus
            spores via backlog-CSVer i <code className="text-xs bg-stone-100 px-1 rounded">research/evidence-pack/</code>.
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

      {/* Research round banner */}
      {researchRoundCount > 0 && (
        <Link
          href="/forskningsrunder"
          className="block rounded-xl border border-blue-200 bg-blue-50/60 p-4 hover:bg-blue-50 transition-colors"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-blue-900">
                Forskningsrunde 20. april 2026 — Food Research Process
              </div>
              <div className="text-xs text-blue-700 mt-0.5">
                {researchRoundCount} kilder registrert i denne runden. Se full nedlastingsstatus og temastruktur på /forskningsrunder.
              </div>
            </div>
            <div className="text-xs text-blue-700 font-medium shrink-0">Aapne runden →</div>
          </div>
        </Link>
      )}

      {/* Download status panel */}
      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-stone-800">Nedlastingsstatus paa tvers av alle kilder</h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Matcher via URL, filnavn eller tittel mot backlog-CSVer (mars + april 2026).
            </p>
          </div>
          <button
            onClick={() => setStatusFilter('all')}
            className="text-xs text-emerald-600 hover:underline"
          >
            Nullstill
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <button
            onClick={() => setStatusFilter(statusFilter === 'downloaded' ? 'all' : 'downloaded')}
            className={`text-left rounded-lg border p-3 transition-colors ${
              statusFilter === 'downloaded'
                ? 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200'
                : 'border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <div className="text-lg font-bold text-emerald-800">{statusStats.downloaded}</div>
            </div>
            <div className="text-[11px] text-emerald-700 mt-0.5">Nedlastet lokalt</div>
          </button>
          <button
            onClick={() => setStatusFilter(statusFilter === 'url_only' ? 'all' : 'url_only')}
            className={`text-left rounded-lg border p-3 transition-colors ${
              statusFilter === 'url_only'
                ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200'
                : 'border-amber-200 bg-amber-50/40 hover:bg-amber-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <div className="text-lg font-bold text-amber-800">{statusStats.urlOnly}</div>
            </div>
            <div className="text-[11px] text-amber-700 mt-0.5">Kun URL</div>
          </button>
          <button
            onClick={() =>
              setStatusFilter(statusFilter === 'missing_metadata_only' ? 'all' : 'missing_metadata_only')
            }
            className={`text-left rounded-lg border p-3 transition-colors ${
              statusFilter === 'missing_metadata_only'
                ? 'border-rose-500 bg-rose-50 ring-2 ring-rose-200'
                : 'border-rose-200 bg-rose-50/40 hover:bg-rose-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span>
              <div className="text-lg font-bold text-rose-800">{statusStats.missingMetadata}</div>
            </div>
            <div className="text-[11px] text-rose-700 mt-0.5">Mangler metadata</div>
          </button>
          <button
            onClick={() => setStatusFilter(statusFilter === 'untracked' ? 'all' : 'untracked')}
            className={`text-left rounded-lg border p-3 transition-colors ${
              statusFilter === 'untracked'
                ? 'border-stone-500 bg-stone-50 ring-2 ring-stone-300'
                : 'border-stone-200 bg-stone-50/40 hover:bg-stone-50'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-stone-400"></span>
              <div className="text-lg font-bold text-stone-800">{statusStats.untracked}</div>
            </div>
            <div className="text-[11px] text-stone-600 mt-0.5">Ikke i backlog</div>
          </button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-stone-500">Runde:</span>
          {(['all', '2026-03-18', '2026-04-20'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoundFilter(r)}
              className={`px-2 py-0.5 rounded-full border ${
                roundFilter === r
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
              }`}
            >
              {r === 'all' ? 'Alle' : `Runde ${r}`}
            </button>
          ))}
        </div>
      </div>

      {/* Type filter + search */}
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
            const count = key === 'alle' ? sources.length : sources.filter((s) => s.sourceType === key).length
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

      {/* Status legend */}
      <div className="flex items-center gap-4 text-xs text-stone-600">
        <span className="font-semibold">Status:</span>
        {(Object.keys(statusLabels) as (SourceDownloadStatus | 'all')[]).map((s) => {
          if (s === 'all') return null
          const dot = statusDot(s)
          return (
            <span key={s} className="inline-flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${dot.className}`} />
              {statusLabels[s]}
            </span>
          )
        })}
      </div>

      {filter === 'nou' || filter === 'analyse' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSources.map((src) => {
            const dot = statusDot(src.downloadStatus)
            return (
              <Card
                key={src.id}
                className="p-6 hover:shadow-lg transition-shadow border-t-4 border-t-emerald-500"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={src.sourceType} />
                    <span
                      className={`w-2 h-2 rounded-full ${dot.className}`}
                      title={dot.label}
                    />
                  </div>
                  <span className="text-xs font-bold text-stone-400">{src.year}</span>
                </div>
                <h3 className="font-bold text-stone-900 leading-tight mb-2 h-12 overflow-hidden line-clamp-2">
                  {src.title || src.filename}
                </h3>
                <p className="text-xs text-stone-500 mb-4 line-clamp-3">{src.description}</p>
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
            )
          })}
        </div>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200">
                  <th className="px-3 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider w-8"></th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Kilde / Tittel</th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Utgiver / \u00c5r</th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">Beskrivelse</th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider text-right">Lenke</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredSources.map((src) => {
                  const dot = statusDot(src.downloadStatus)
                  return (
                    <tr
                      key={src.id}
                      className={`hover:bg-stone-50/50 transition-colors ${src.isDuplicate ? 'opacity-40' : ''}`}
                    >
                      <td className="px-3 py-4 align-top">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${dot.className}`}
                          title={dot.label + (src.researchRound ? ` (runde ${src.researchRound})` : '')}
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className="font-bold text-stone-900 text-sm truncate max-w-xs"
                          title={src.title || src.filename}
                        >
                          {src.title || src.filename}
                        </div>
                        <div className="text-[10px] font-mono text-stone-400">{src.filename}</div>
                        {src.researchRound && (
                          <div className="text-[10px] text-blue-600 mt-0.5">
                            Runde {src.researchRound}
                            {src.backlogTheme ? ` · ${src.backlogTheme}` : ''}
                          </div>
                        )}
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
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </a>
                        ) : (
                          <span className="text-stone-300">\u2014</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {filteredSources.length === 0 && (
        <div className="text-center py-20 bg-stone-50 rounded-2xl border-2 border-dashed border-stone-200">
          <div className="text-stone-400 mb-2">Ingen kilder matchet s\u00f8ket ditt.</div>
          <button
            onClick={() => {
              setFilter('alle')
              setSearch('')
              setStatusFilter('all')
              setRoundFilter('all')
            }}
            className="text-emerald-600 font-bold hover:underline"
          >
            Nullstill alle filtre
          </button>
        </div>
      )}
    </div>
  )
}
