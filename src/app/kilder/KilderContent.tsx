'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { BacklogRound, SourceDownloadStatus } from '@/lib/queries/download-backlog'
import { CoverageOverview } from '@/components/coverage/CoverageOverview'
import { InternalBanner } from '@/components/ui/InternalBanner'

export type SourceRow = {
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
  origin: 'db' | 'document' | 'backlog'
  downloadStatus: SourceDownloadStatus
  researchRound: BacklogRound | null
  backlogTheme: string | null
  backlogPriority: string | null
  backlogTargetPath: string | null
  matchedBy: 'url' | 'filename' | 'target-basename' | 'title' | null
}

type RoundOption = {
  id: BacklogRound
  label: string
  count: number
}

const typeLabels: Record<string, string> = {
  alle: 'Alle kilder',
  nou: 'NOU-er',
  rapport: 'Rapporter',
  masteroppgave: 'Masteroppgaver',
  statistikk: 'Statistikk',
  lovverk: 'Lovverk',
  analyse: 'Analyser',
  'årsrapport': 'Årsrapporter',
  soknad: 'Søknader',
  notat: 'Notater',
  transkripsjon: 'Samtaler',
  strategi: 'Strategidok.',
  epost: 'E-poster',
  arbeidsdok: 'Arbeidsdok.',
  datasett: 'Datasett',
  forskning: 'Forskning',
  initiativ: 'Initiativ',
}

const statusUi: Record<
  SourceDownloadStatus,
  {
    label: string
    shortLabel: string
    dotClassName: string
    countClassName: string
    activeClassName: string
    inactiveClassName: string
  }
> = {
  downloaded: {
    label: 'Nedlastet lokalt',
    shortLabel: 'Nedlastet',
    dotClassName: 'bg-emerald-500',
    countClassName: 'text-emerald-800',
    activeClassName: 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200',
    inactiveClassName: 'border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50',
  },
  exa_fetched: {
    label: 'Hentet med Exa',
    shortLabel: 'Exa-hentet',
    dotClassName: 'bg-sky-500',
    countClassName: 'text-sky-800',
    activeClassName: 'border-sky-500 bg-sky-50 ring-2 ring-sky-200',
    inactiveClassName: 'border-sky-200 bg-sky-50/40 hover:bg-sky-50',
  },
  requires_manual: {
    label: 'Krever manuell nedlasting',
    shortLabel: 'Manuell',
    dotClassName: 'bg-violet-500',
    countClassName: 'text-violet-800',
    activeClassName: 'border-violet-500 bg-violet-50 ring-2 ring-violet-200',
    inactiveClassName: 'border-violet-200 bg-violet-50/40 hover:bg-violet-50',
  },
  url_only: {
    label: 'Kun URL registrert',
    shortLabel: 'Kun URL',
    dotClassName: 'bg-amber-500',
    countClassName: 'text-amber-800',
    activeClassName: 'border-amber-500 bg-amber-50 ring-2 ring-amber-200',
    inactiveClassName: 'border-amber-200 bg-amber-50/40 hover:bg-amber-50',
  },
  missing_metadata_only: {
    label: 'Mangler metadata',
    shortLabel: 'Mangler metadata',
    dotClassName: 'bg-rose-500',
    countClassName: 'text-rose-800',
    activeClassName: 'border-rose-500 bg-rose-50 ring-2 ring-rose-200',
    inactiveClassName: 'border-rose-200 bg-rose-50/40 hover:bg-rose-50',
  },
  untracked: {
    label: 'Ikke sporet i backlog',
    shortLabel: 'Ikke i backlog',
    dotClassName: 'bg-stone-300',
    countClassName: 'text-stone-800',
    activeClassName: 'border-stone-500 bg-stone-50 ring-2 ring-stone-300',
    inactiveClassName: 'border-stone-200 bg-stone-50/40 hover:bg-stone-50',
  },
}

const sourceDownloadStatuses = Object.keys(statusUi) as SourceDownloadStatus[]

function statusDot(status: SourceDownloadStatus): { className: string; label: string } {
  const config = statusUi[status] ?? statusUi.untracked
  return { className: config.dotClassName, label: config.label }
}

export function KilderContent({
  sources,
  rounds,
  dbCount,
  documentCount,
  backlogOnlyCount,
  initialRoundFilter = 'all',
}: {
  sources: SourceRow[]
  rounds: RoundOption[]
  dbCount: number
  documentCount: number
  backlogOnlyCount: number
  initialRoundFilter?: 'all' | BacklogRound
}) {
  const [filter, setFilter] = useState<string>('alle')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<SourceDownloadStatus | 'all'>('all')
  const [roundFilter, setRoundFilter] = useState<'all' | BacklogRound>(initialRoundFilter)
  const [originFilter, setOriginFilter] = useState<'all' | 'db' | 'document' | 'backlog'>('all')

  const filteredSources = sources.filter((src) => {
    const matchesType = filter === 'alle' || src.sourceType === filter
    const matchesStatus = statusFilter === 'all' || src.downloadStatus === statusFilter
    const matchesRound = roundFilter === 'all' || src.researchRound === roundFilter
    const matchesOrigin = originFilter === 'all' || src.origin === originFilter
    const q = search.toLowerCase()
    const matchesSearch =
      !q ||
      src.title?.toLowerCase().includes(q) ||
      src.filename.toLowerCase().includes(q) ||
      src.author?.toLowerCase().includes(q) ||
      src.description.toLowerCase().includes(q) ||
      src.backlogTheme?.toLowerCase().includes(q)
    return matchesType && matchesStatus && matchesRound && matchesOrigin && matchesSearch
  })

  const statusStats = Object.fromEntries(
    sourceDownloadStatuses.map((status) => [
      status,
      sources.filter((s) => s.downloadStatus === status).length,
    ]),
  ) as Record<SourceDownloadStatus, number>

  const stats = {
    total: sources.length,
    nou: sources.filter((s) => s.sourceType === 'nou').length,
    rapport: sources.filter((s) => s.sourceType === 'rapport').length,
    analyse: sources.filter((s) => s.sourceType === 'analyse').length,
    lovverk: sources.filter((s) => s.sourceType === 'lovverk').length,
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <InternalBanner note="Kilderegister og nedlastings-/kurasjonsstatus — internt arbeidsgrunnlag, ikke ferdig formidling. Tall og status kan endres." />
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Kunnskapsgrunnlag</h1>
          <p className="text-xs uppercase tracking-wider text-stone-500 mt-1 font-medium">
            Kilderegister — alle kilder som ligger til grunn for analysene
          </p>
          <p className="text-stone-500 mt-2 max-w-2xl">
            Full kildeoversikt for Food Systems 2026. Inkluderer både sporede kilder i databasen
            ({dbCount}), dokumenter i biblioteket uten egen kilderegistrering ({documentCount}) og
            backlog-kilder fra {rounds.length} forskningsrunder ({backlogOnlyCount} uregistrerte).
            Nedlastingsstatus spores internt.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="bg-white px-4 py-2 rounded-lg border border-stone-200 shadow-sm">
            <div className="text-xs text-stone-400 uppercase font-bold tracking-wider">Total</div>
            <div className="text-xl font-bold text-stone-900">{stats.total}</div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg border border-stone-200 shadow-sm">
            <div className="text-xs text-emerald-600 uppercase font-bold tracking-wider">Database</div>
            <div className="text-xl font-bold text-stone-900">{dbCount}</div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg border border-stone-200 shadow-sm">
            <div className="text-xs text-sky-600 uppercase font-bold tracking-wider">Dokument</div>
            <div className="text-xl font-bold text-stone-900">{documentCount}</div>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg border border-stone-200 shadow-sm">
            <div className="text-xs text-amber-600 uppercase font-bold tracking-wider">Backlog-only</div>
            <div className="text-xl font-bold text-stone-900">{backlogOnlyCount}</div>
          </div>
        </div>
      </div>

      <CoverageOverview />

      {/* Research rounds banner */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4">
        <div className="text-sm font-semibold text-blue-900 mb-2">Forskningsrunder</div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setRoundFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
              roundFilter === 'all'
                ? 'bg-blue-900 text-white border-blue-900'
                : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-100'
            }`}
          >
            Alle runder ({sources.filter((s) => s.researchRound !== null).length})
          </button>
          {rounds.map((r) => (
            <button
              key={r.id}
              onClick={() => setRoundFilter(roundFilter === r.id ? 'all' : r.id)}
              className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                roundFilter === r.id
                  ? 'bg-blue-900 text-white border-blue-900'
                  : 'bg-white text-blue-700 border-blue-200 hover:bg-blue-100'
              }`}
            >
              {r.label} ({r.count})
            </button>
          ))}
        </div>
        <Link
          href="/forskningsrunder"
          className="mt-3 inline-block text-xs text-blue-700 font-medium hover:underline"
        >
          Se full nedlastingsstatus og temastruktur på /forskningsrunder →
        </Link>
      </div>

      {/* Download status panel */}
      <div className="rounded-xl border border-stone-200 bg-white p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm font-semibold text-stone-800">
              Nedlastingsstatus på tvers av alle kilder
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Matcher via URL, filnavn eller tittel mot alle 6 backlog-CSVer.
            </p>
          </div>
          <button
            onClick={() => setStatusFilter('all')}
            className="text-xs text-emerald-600 hover:underline"
          >
            Nullstill
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {sourceDownloadStatuses.map((status) => {
            const config = statusUi[status]
            return (
              <button
                key={status}
                onClick={() => setStatusFilter(statusFilter === status ? 'all' : status)}
                className={`text-left rounded-lg border p-3 transition-colors ${
                  statusFilter === status ? config.activeClassName : config.inactiveClassName
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${config.dotClassName}`}></span>
                  <div className={`text-lg font-bold ${config.countClassName}`}>
                    {statusStats[status]}
                  </div>
                </div>
                <div className="text-[11px] text-stone-700 mt-0.5">{config.shortLabel}</div>
              </button>
            )
          })}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-stone-500">Opprinnelse:</span>
          {(['all', 'db', 'document', 'backlog'] as const).map((o) => (
            <button
              key={o}
              onClick={() => setOriginFilter(o)}
              className={`px-2 py-0.5 rounded-full border ${
                originFilter === o
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
              }`}
            >
              {o === 'all'
                ? `Alle (${sources.length})`
                : o === 'db'
                  ? `Database (${dbCount})`
                  : o === 'document'
                    ? `Dokument (${documentCount})`
                  : `Backlog-only (${backlogOnlyCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Type filter + search */}
      <div className="flex flex-col md:flex-row gap-4 items-center bg-stone-50 p-4 rounded-xl border border-stone-200">
        <div className="w-full md:w-64">
          <input
            type="text"
            placeholder="Søk i kilder..."
            className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.entries(typeLabels).map(([key, label]) => {
            const count =
              key === 'alle' ? sources.length : sources.filter((s) => s.sourceType === key).length
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
      <div className="flex items-center gap-4 text-xs text-stone-600 flex-wrap">
        <span className="font-semibold">Status:</span>
        {sourceDownloadStatuses.map((s) => {
          const dot = statusDot(s)
          return (
            <span key={s} className="inline-flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${dot.className}`} />
              {statusUi[s].shortLabel}
            </span>
          )
        })}
        <span className="ml-4 inline-flex items-center gap-1.5 text-stone-500">
          <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 text-[10px] font-semibold">
            DOKUMENT
          </span>
          = hentet direkte fra biblioteket, men ikke registrert i kilderegisteret ennå
        </span>
        <span className="inline-flex items-center gap-1.5 text-stone-500">
          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold">
            BACKLOG
          </span>
          = kilde fra research-backlog, ikke registrert i database ennå
        </span>
      </div>

      {filter === 'nou' || filter === 'analyse' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSources.map((src) => {
            const dot = statusDot(src.downloadStatus)
            return (
              <Card
                key={src.id}
                className={`p-6 hover:shadow-lg transition-shadow border-t-4 ${
                  src.origin === 'backlog'
                    ? 'border-t-amber-500'
                    : src.origin === 'document'
                      ? 'border-t-sky-500'
                      : 'border-t-emerald-500'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <StatusBadge status={src.sourceType} />
                    <span
                      className={`w-2 h-2 rounded-full ${dot.className}`}
                      title={dot.label}
                    />
                    {src.origin === 'backlog' && (
                      <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-semibold">
                        BACKLOG
                      </span>
                    )}
                    {src.origin === 'document' && (
                      <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 text-[10px] font-semibold">
                        DOKUMENT
                      </span>
                    )}
                  </div>
                  <span className="text-xs font-bold text-stone-400">{src.year}</span>
                </div>
                <h3 className="font-bold text-stone-900 leading-tight mb-2 h-12 overflow-hidden line-clamp-2">
                  {src.title || src.filename}
                </h3>
                <p className="text-xs text-stone-500 mb-4 line-clamp-3">{src.description}</p>
                <div className="pt-4 border-t border-stone-100 flex justify-between items-center gap-2">
                  <span className="text-[10px] font-mono text-stone-400 uppercase">{src.author}</span>
                  <div className="flex items-center gap-3 text-xs font-bold">
                    {src.document?.slug && (
                      <Link
                        href={`/bibliotek/${src.document.slug}`}
                        className="text-sky-700 hover:underline"
                      >
                        Bibliotek →
                      </Link>
                    )}
                    {src.url && (
                      <a
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:underline"
                      >
                        Åpne kilde →
                      </a>
                    )}
                  </div>
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
                  <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">
                    Kilde / Tittel
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">
                    Utgiver / År
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider">
                    Beskrivelse
                  </th>
                  <th className="px-6 py-4 text-xs font-bold text-stone-400 uppercase tracking-wider text-right">
                    Lenke
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredSources.map((src) => {
                  const dot = statusDot(src.downloadStatus)
                  return (
                    <tr
                      key={src.id}
                      className={`hover:bg-stone-50/50 transition-colors ${
                        src.isDuplicate ? 'opacity-40' : ''
                      } ${
                        src.origin === 'backlog'
                          ? 'bg-amber-50/30'
                          : src.origin === 'document'
                            ? 'bg-sky-50/30'
                            : ''
                      }`}
                    >
                      <td className="px-3 py-4 align-top">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${dot.className}`}
                          title={
                            dot.label +
                            (src.researchRound ? ` (runde ${src.researchRound})` : '')
                          }
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div
                          className="font-bold text-stone-900 text-sm truncate max-w-xs flex items-center gap-2"
                          title={src.title || src.filename}
                        >
                          {src.title || src.filename}
                          {src.origin === 'backlog' && (
                            <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-semibold shrink-0">
                              BACKLOG
                            </span>
                          )}
                          {src.origin === 'document' && (
                            <span className="px-1.5 py-0.5 rounded bg-sky-100 text-sky-800 text-[9px] font-semibold shrink-0">
                              DOKUMENT
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-stone-400">{src.filename}</div>
                        {src.researchRound && (
                          <div className="text-[10px] text-blue-600 mt-0.5">
                            Runde {src.researchRound}
                            {src.backlogTheme ? ` · ${src.backlogTheme}` : ''}
                            {src.backlogPriority ? ` · ${src.backlogPriority}` : ''}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={src.sourceType} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-stone-700">{src.author || '—'}</div>
                        <div className="text-xs text-stone-400">{src.year}</div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs text-stone-500 line-clamp-2 max-w-md">
                          {src.description}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {src.document?.slug && (
                            <Link
                              href={`/bibliotek/${src.document.slug}`}
                              className="inline-flex items-center rounded-full bg-sky-50 px-3 py-1 text-[11px] font-semibold text-sky-700 hover:bg-sky-100"
                            >
                              Bibliotek
                            </Link>
                          )}
                          {src.url && (
                            <a
                              href={src.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-stone-100 text-stone-600 hover:bg-emerald-100 hover:text-emerald-700 transition-colors"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                            </a>
                          )}
                          {!src.url && !src.document?.slug && <span className="text-stone-300">—</span>}
                        </div>
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
          <div className="text-stone-400 mb-2">Ingen kilder matchet søket ditt.</div>
          <button
            onClick={() => {
              setFilter('alle')
              setSearch('')
              setStatusFilter('all')
              setRoundFilter('all')
              setOriginFilter('all')
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
