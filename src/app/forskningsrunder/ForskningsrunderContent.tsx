'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { SourceChip } from '@/components/ui/SourceChip'
import { EmptyState } from '@/components/ui/EmptyState'
import type {
  BacklogRow,
  BacklogRound,
  BacklogSummary,
  SourceDownloadStatus,
} from '@/lib/queries/download-backlog'

type BacklogStatusFilter = Exclude<SourceDownloadStatus, 'untracked'>

type InsightRow = {
  id: string
  title: string
  description: string
  insightType: string
  source: string
  phaseId: string | null
  tags: string[]
  url: string | null
  date: string
  sourceRefs: Array<{
    id: string
    label: string
    url: string | null
    note: string | null
    sourceDocId: string | null
  }>
}

type ReportRow = {
  id: string
  title: string
  institution: string | null
  year: number | null
  country: string
  keyFindings: string[]
  tags: string[]
  reportCategory: string
}

type SourceRow = {
  id: string
  filename: string
  title: string | null
  author: string | null
  year: string | null
  description: string
  relevance: string
}

type ActorRow = {
  id: string
  slug: string
  name: string
  actorType: string
  country: string
  roleSummary: string
  priorityTier: string | null
  themeTags: string[]
}

type ThemeBucket = {
  id: string
  label: string
  description: string
  tagFilters: string[]
  emoji?: string
  accent: string
}

export type ResearchRoundSnapshot = {
  id: BacklogRound
  label: string
  summary: BacklogSummary
  matchedSourceCount: number
  backlogOnlyCount: number
  detailHref: string
}

const themes: ThemeBucket[] = [
  {
    id: 'eiendom',
    label: 'Eiendomsmakt',
    description: 'Servitutter, eksklusive leieavtaler, internleie, sale-leaseback som konkurransebarriere.',
    tagFilters: ['eiendom', 'servitutter', 'internleie', 'Reitan', 'REBUS', 'Johannson'],
    accent: 'border-l-4 border-l-amber-400',
  },
  {
    id: 'makt-fryktkultur',
    label: 'Makt og fryktkultur',
    description: 'Lov om god handelsskikk, handhevingsgap, leverandoerrapportering og nordisk komparativ.',
    tagFilters: ['fryktkultur', 'handheving', 'UTP', 'Dagligvaretilsynet', 'Konkurransetilsynet', 'muntlige-avtaler', 'varsler'],
    accent: 'border-l-4 border-l-rose-400',
  },
  {
    id: 'horeca',
    label: 'HORECA og offentlige maaltider',
    description: '5,5 millioner nordiske offentlige maaltider/dag. Kontraktsarkitektur og grossistkonsentrasjon.',
    tagFilters: ['HORECA', 'offentlige-maaltider', 'innkjoep', 'offentlige-innkjoep', 'klimavekt', 'skolemaaltid', 'grossist', 'Kespro', 'Martin-Servera', 'ASKO'],
    accent: 'border-l-4 border-l-emerald-400',
  },
  {
    id: 'alt-distribusjon',
    label: 'Alternative distribusjonskanaler',
    description: 'REKO, D2C, maaltidskasser, kooperativer, overskuddsmat-plattformer.',
    tagFilters: ['alternative-distribusjon', 'REKO', 'subscription', 'D2C', 'Cheffelo', 'Aarstiderne', 'Matsmart', 'maaltidskasse', 'lokalmat'],
    accent: 'border-l-4 border-l-blue-400',
  },
  {
    id: 'etableringsbarrierer',
    label: 'Etableringsbarrierer og failed entrants',
    description: 'Nordiske dagligvarecase som mislyktes og 7-dimensjonal barrieremodell.',
    tagFilters: ['etableringsbarrierer', 'failed-entrants', 'Lidl', 'ICA', 'Mathem', 'Coop.dk', 'Irma', 'online-grocery', 'Mathem', 'Oda', 'Axfood', 'Dagab', 'rekonstruksjon'],
    accent: 'border-l-4 border-l-stone-400',
  },
  {
    id: 'benchmarks',
    label: 'Benchmark-case for matsystemomstilling',
    description: 'Nordiske og internasjonale case som har flyttet praksis, policy eller kapital.',
    tagFilters: ['benchmark', 'Too-Good-To-Go', 'Plantefonden', 'Koebenhavn', 'PNAE', 'Arla', 'Soer-Korea', 'Frankrike', 'PAYT', 'plantebasert', 'transformasjon', 'policy-design'],
    accent: 'border-l-4 border-l-violet-400',
  },
  {
    id: 'framstillinger',
    label: 'Framstillinger og media',
    description: 'Norsk offentlig diskurs 2020-2026. Narrative poler: beredskap og kjoepekraft.',
    tagFilters: ['media-framing', 'beredskap', 'kjoepekraft', 'diskursanalyse', 'hvitbok'],
    accent: 'border-l-4 border-l-sky-400',
  },
  {
    id: 'sirkularitet',
    label: 'Norsk sirkulaer matinnovasjon',
    description: 'Biogass, tare, plantebasert, vertikalt landbruk, CSA.',
    tagFilters: ['sirkulaer', 'biogass', 'tare', 'plantebasert', 'vertikalt-landbruk', 'CSA'],
    accent: 'border-l-4 border-l-lime-400',
  },
  {
    id: 'regulering',
    label: 'Regulatorisk tidslinje og metodikk',
    description: '8 regulatoriske ankerpunkter 2024-2026. STROBE+GRADE-rammeverk for evidensregister.',
    tagFilters: ['regulering', 'tidslinje', 'policy-events', 'metodikk', 'STROBE', 'GRADE', 'evidens'],
    accent: 'border-l-4 border-l-indigo-400',
  },
]

function bucketInsightsByTheme(insights: InsightRow[]): Array<{ theme: ThemeBucket; insights: InsightRow[] }> {
  const assigned = new Set<string>()
  const buckets = themes.map((theme) => {
    const filtered = insights.filter((ins) => {
      if (assigned.has(ins.id)) return false
      const hasMatch = ins.tags.some((t) => theme.tagFilters.some((f) => t.toLowerCase().includes(f.toLowerCase())))
      if (hasMatch) {
        assigned.add(ins.id)
        return true
      }
      return false
    })
    return { theme, insights: filtered }
  })
  return buckets
}

const KEY_NUMBERS: Array<{ value: string; label: string; source: string }> = [
  { value: '350+', label: 'registrerte negative servitutter', source: 'Konkurransetilsynet 2023' },
  { value: 'NOK 168m', label: 'NG internleie til naerstaaende (2024)', source: 'NG registreringsdokument 2025' },
  { value: '0', label: 'vedtak om lovbrudd siden Dagligvaretilsynet ble etablert', source: 'Dagligvaretilsynet aarsrapport 2024' },
  { value: '5,5M', label: 'offentlige maaltider per dag i Norden', source: 'Nordisk Raad / NORD' },
  { value: '87,8%', label: 'oekologisk i Koebenhavns 70k maaltider/dag', source: 'Koebenhavns Madhus' },
  { value: 'DKK 394m', label: 'Plantefonden committed 2023-2025', source: 'Plantefonden' },
  { value: 'SEK 1,188 mrd', label: 'Cheffelo nordisk omsetning 2025', source: 'Cheffelo Q4 2025' },
  { value: '30. apr 2026', label: 'handheving flyttes til Konkurransetilsynet', source: 'Forskrift 2026-04-17-601' },
]

const THEME_LABELS: Record<string, string> = {
  'research-round': 'Egne dybderapporter',
  eiendom: 'Eiendomsmakt',
  enforcement: 'Handheving / fryktkultur',
  beredskap: 'Beredskap / framstillinger',
  'alt-distribusjon': 'Alternative kanaler',
  horeca: 'HORECA og offentlig maaltid',
  'failed-entrants': 'Failed entrants',
  benchmark: 'Benchmark-case',
}

const backlogStatusFilters: BacklogStatusFilter[] = [
  'downloaded',
  'exa_fetched',
  'requires_manual',
  'url_only',
  'missing_metadata_only',
]

function statusBadge(status: string) {
  if (status === 'downloaded') return 'bg-emerald-50 text-emerald-700 border-emerald-200'
  if (status === 'exa_fetched') return 'bg-sky-50 text-sky-700 border-sky-200'
  if (status === 'requires_manual') return 'bg-purple-50 text-purple-700 border-purple-200'
  if (status === 'url_only') return 'bg-amber-50 text-amber-700 border-amber-200'
  if (status === 'missing_metadata_only') return 'bg-rose-50 text-rose-700 border-rose-200'
  return 'bg-stone-50 text-stone-600 border-stone-200'
}

function statusLabel(status: string): string {
  if (status === 'downloaded') return 'Nedlastet'
  if (status === 'exa_fetched') return 'Exa-hentet'
  if (status === 'requires_manual') return 'Manuell'
  if (status === 'url_only') return 'Kun URL'
  if (status === 'missing_metadata_only') return 'Mangler metadata'
  return status
}

export function ForskningsrunderContent({
  roundSnapshots,
  insights,
  reports,
  sources,
  actors,
  companyCount,
  backlogRows,
  backlogSummary,
  konkurserBacklogRows,
  konkurserBacklogSummary,
  konkurserActors,
}: {
  roundSnapshots: ResearchRoundSnapshot[]
  insights: InsightRow[]
  reports: ReportRow[]
  sources: SourceRow[]
  actors: ActorRow[]
  companyCount: number
  backlogRows: BacklogRow[]
  backlogSummary: BacklogSummary
  konkurserBacklogRows: BacklogRow[]
  konkurserBacklogSummary: BacklogSummary
  konkurserActors: ActorRow[]
}) {
  const [expandedTheme, setExpandedTheme] = useState<string | null>(null)
  const [backlogFilter, setBacklogFilter] = useState<'all' | BacklogStatusFilter>('all')
  const [backlogTheme, setBacklogTheme] = useState<string>('all')
  const buckets = bucketInsightsByTheme(insights)
  const unbucketed = insights.filter((i) => !buckets.some((b) => b.insights.some((x) => x.id === i.id)))

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold text-stone-900">Forskningsrunde 20. april 2026</h1>
          <span className="badge-blue">Food Research Process</span>
        </div>
        <p className="text-sm text-stone-500 leading-relaxed">
          Ni dybderapporter + samlerapport fra Food Research Process levert 20. april 2026. Dekker eiendomsmakt,
          fryktkultur og handheving, HORECA/offentlige maaltider, alternative distribusjonskanaler, nordiske
          failed entrants, internasjonale benchmark-case, norsk offentlighet og sirkulaer matinnovasjon.
          Rapportene er konvertert til markdown og registrert i biblioteket; metodikk (STROBE+GRADE) er
          innarbeidet i evidensnotat-rammeverket.
        </p>
      </div>

      <Card title="Aktive forskningsrunder" className="!p-4">
        <p className="text-xs text-stone-500 leading-relaxed mb-3">
          Nye backlog-runder blir synlige her sa snart CSV-ene ligger i{' '}
          <code className="text-[10px] bg-stone-100 px-1 rounded">research/evidence-pack/</code>.
          Den detaljerte temagjennomgangen lenger ned er fortsatt knyttet til 20. april-runden.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {roundSnapshots.map((round) => {
            const downloadPct =
              round.summary.total > 0
                ? Math.round((round.summary.downloaded / round.summary.total) * 100)
                : 0

            return (
              <Link
                key={round.id}
                href={round.detailHref}
                className="rounded-xl border border-stone-200 bg-white p-4 hover:bg-stone-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-stone-800">{round.label}</h3>
                      {round.id === '2026-04-20' && (
                        <span className="badge-blue">Detaljseksjon under</span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 mt-1">
                      {round.summary.total} backlog-kilder · {round.matchedSourceCount} registrerte i databasen
                    </p>
                  </div>
                  <div className="text-xs font-semibold text-emerald-700 shrink-0">
                    {downloadPct}% nedlastet
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2">
                    <div className="font-semibold text-emerald-800">{round.summary.downloaded}</div>
                    <div className="text-emerald-700/80">Nedlastet</div>
                  </div>
                  <div className="rounded-lg bg-amber-50 border border-amber-200 p-2">
                    <div className="font-semibold text-amber-800">{round.summary.urlOnly}</div>
                    <div className="text-amber-700/80">Kun URL</div>
                  </div>
                  <div className="rounded-lg bg-blue-50 border border-blue-200 p-2">
                    <div className="font-semibold text-blue-800">{round.matchedSourceCount}</div>
                    <div className="text-blue-700/80">DB-kilder</div>
                  </div>
                  <div className="rounded-lg bg-stone-50 border border-stone-200 p-2">
                    <div className="font-semibold text-stone-800">{round.backlogOnlyCount}</div>
                    <div className="text-stone-600">Backlog-only</div>
                  </div>
                </div>

                <div className="mt-3 text-xs text-emerald-700 font-medium">
                  Aapne filtrert kildevisning →
                </div>
              </Link>
            )
          })}
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {KEY_NUMBERS.map((n) => (
          <div key={n.label} className="card">
            <div className="text-xl font-bold text-stone-900">{n.value}</div>
            <div className="text-xs text-stone-600 mt-1 leading-snug">{n.label}</div>
            <div className="text-[10px] text-stone-400 mt-1.5">{n.source}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="card">
          <div className="text-2xl font-bold text-stone-900">{insights.length}</div>
          <div className="text-xs text-stone-500 mt-1">nye innsikter registrert</div>
        </div>
        <div className="card">
          <div className="text-2xl font-bold text-stone-900">{sources.length}</div>
          <div className="text-xs text-stone-500 mt-1">kilder / forskningsdokumenter</div>
        </div>
        <div className="card">
          <div className="text-2xl font-bold text-stone-900">{reports.length}</div>
          <div className="text-xs text-stone-500 mt-1">rapporter registrert</div>
        </div>
        <div className="card">
          <div className="text-2xl font-bold text-stone-900">{actors.length}</div>
          <div className="text-xs text-stone-500 mt-1">nye aktoerer kartlagt</div>
        </div>
      </div>

      <Card title="Kildeinventar — nedlastingsstatus" className="!p-4">
        <p className="text-xs text-stone-500 leading-relaxed mb-3">
          Sporer alle {backlogSummary.total} underliggende kilder sitert i forskningsrunden.
          Basis: <code className="text-[10px] bg-stone-100 px-1 rounded">research/evidence-pack/download-backlog-2026-04-20.csv</code>.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2 mb-4">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <div className="text-lg font-bold text-emerald-800">{backlogSummary.downloaded}</div>
            <div className="text-[11px] text-emerald-700 mt-0.5">Nedlastet lokalt</div>
          </div>
          <div className="rounded-lg border border-sky-200 bg-sky-50 p-3">
            <div className="text-lg font-bold text-sky-800">{backlogSummary.exaFetched}</div>
            <div className="text-[11px] text-sky-700 mt-0.5">Exa-hentet</div>
          </div>
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-3">
            <div className="text-lg font-bold text-purple-800">{backlogSummary.requiresManual}</div>
            <div className="text-[11px] text-purple-700 mt-0.5">Manuell kontroll</div>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <div className="text-lg font-bold text-amber-800">{backlogSummary.urlOnly}</div>
            <div className="text-[11px] text-amber-700 mt-0.5">Kun URL (maa lastes)</div>
          </div>
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
            <div className="text-lg font-bold text-rose-800">{backlogSummary.missingMetadata}</div>
            <div className="text-[11px] text-rose-700 mt-0.5">Metadata mangler</div>
          </div>
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
            <div className="text-lg font-bold text-stone-800">{backlogSummary.total}</div>
            <div className="text-[11px] text-stone-600 mt-0.5">Totalt kartlagt</div>
          </div>
        </div>

        <div className="mb-3">
          <div className="text-xs font-semibold text-stone-600 mb-1.5">Status per tema</div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-stone-500 border-b border-stone-200">
                  <th className="text-left py-1.5 pr-2 font-medium">Tema</th>
                  <th className="text-right py-1.5 px-2 font-medium text-emerald-700">Ned.</th>
                  <th className="text-right py-1.5 px-2 font-medium text-sky-700">Exa</th>
                  <th className="text-right py-1.5 px-2 font-medium text-purple-700">Man.</th>
                  <th className="text-right py-1.5 px-2 font-medium text-amber-700">URL</th>
                  <th className="text-right py-1.5 px-2 font-medium text-rose-700">Mangler</th>
                  <th className="text-right py-1.5 pl-2 font-medium">Totalt</th>
                  <th className="text-left py-1.5 pl-3 font-medium">Fremdrift</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(backlogSummary.byTheme).map(([theme, stats]) => {
                  const pct = stats.total > 0 ? Math.round((stats.downloaded / stats.total) * 100) : 0
                  return (
                    <tr key={theme} className="border-b border-stone-100">
                      <td className="py-1.5 pr-2 text-stone-700">{THEME_LABELS[theme] ?? theme}</td>
                      <td className="py-1.5 px-2 text-right text-emerald-700">{stats.downloaded}</td>
                      <td className="py-1.5 px-2 text-right text-sky-700">{stats.exaFetched}</td>
                      <td className="py-1.5 px-2 text-right text-purple-700">{stats.requiresManual}</td>
                      <td className="py-1.5 px-2 text-right text-amber-700">{stats.urlOnly}</td>
                      <td className="py-1.5 px-2 text-right text-rose-700">{stats.missingMetadata}</td>
                      <td className="py-1.5 pl-2 text-right text-stone-600">{stats.total}</td>
                      <td className="py-1.5 pl-3 w-32">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] text-stone-500 tabular-nums w-8 text-right">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
          <span className="text-stone-500">Filter:</span>
          {(['all', ...backlogStatusFilters] as const).map((f) => (
            <button
              key={f}
              onClick={() => setBacklogFilter(f)}
              className={`px-2 py-0.5 rounded-full border ${
                backlogFilter === f
                  ? 'bg-stone-900 text-white border-stone-900'
                  : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
              }`}
            >
              {f === 'all' ? 'Alle' : statusLabel(f)}
            </button>
          ))}
          <span className="text-stone-300">·</span>
          <select
            value={backlogTheme}
            onChange={(e) => setBacklogTheme(e.target.value)}
            className="text-xs border border-stone-200 rounded px-2 py-0.5 bg-white text-stone-600"
          >
            <option value="all">Alle temaer</option>
            {Object.keys(backlogSummary.byTheme).map((t) => (
              <option key={t} value={t}>
                {THEME_LABELS[t] ?? t}
              </option>
            ))}
          </select>
        </div>

        <div className="max-h-96 overflow-y-auto border border-stone-100 rounded-lg">
          <table className="w-full text-xs">
            <thead className="bg-stone-50 sticky top-0">
              <tr className="text-stone-500">
                <th className="text-left py-2 pl-3 pr-2 font-medium">Kilde</th>
                <th className="text-left py-2 px-2 font-medium">Land</th>
                <th className="text-left py-2 px-2 font-medium">Aar</th>
                <th className="text-left py-2 px-2 font-medium">Status</th>
                <th className="text-left py-2 pl-2 pr-3 font-medium">Aksjon</th>
              </tr>
            </thead>
            <tbody>
              {backlogRows
                .filter((r) => backlogFilter === 'all' || r.status === backlogFilter)
                .filter((r) => backlogTheme === 'all' || r.theme === backlogTheme)
                .map((r, idx) => (
                  <tr key={`${r.targetPath}-${idx}`} className="border-t border-stone-100 hover:bg-stone-50">
                    <td className="py-2 pl-3 pr-2">
                      {r.url ? (
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-stone-800 hover:text-emerald-700 font-medium"
                        >
                          {r.title}
                        </a>
                      ) : (
                        <span className="text-stone-800 font-medium">{r.title}</span>
                      )}
                      <div className="text-[10px] text-stone-400 mt-0.5">
                        {r.institution} · {r.priority} · {r.theme}
                      </div>
                    </td>
                    <td className="py-2 px-2 text-stone-500">{r.country}</td>
                    <td className="py-2 px-2 text-stone-500">{r.year}</td>
                    <td className="py-2 px-2">
                      <span className={`inline-block px-1.5 py-0.5 rounded border text-[10px] ${statusBadge(r.status)}`}>
                        {statusLabel(r.status)}
                      </span>
                    </td>
                    <td className="py-2 pl-2 pr-3 text-[10px] text-stone-500 max-w-[240px] truncate" title={r.nextAction}>
                      {r.nextAction}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 text-[11px] text-stone-500 leading-relaxed">
          <strong>Neste steg for full kontroll:</strong> url_only-kilder trenger systematisk nedlastning til{' '}
          <code className="text-[10px] bg-stone-100 px-1 rounded">research/evidence-pack/[tema]/</code>. Oppdater
          deretter status fra <code className="text-[10px] bg-stone-100 px-1 rounded">url_only</code> til{' '}
          <code className="text-[10px] bg-stone-100 px-1 rounded">downloaded</code> i CSV-filen. Exa-hentede og
          manuelle rader maa vurderes separat foer de regnes som lokalt sikret. Metadata-only-rader krever
          kildesoek for aa lokalisere faktisk URL.
        </div>
      </Card>

      <Card title="Dokumenter i forskningsrunden">
        {sources.length === 0 ? (
          <p className="text-sm text-stone-500">Ingen dokumenter registrert enda.</p>
        ) : (
          <ul className="space-y-2">
            {sources.map((s) => (
              <li key={s.id} className="flex items-start gap-3 text-sm border-l-2 border-stone-200 pl-3">
                <div>
                  <div className="font-medium text-stone-800">{s.title ?? s.filename}</div>
                  <div className="text-xs text-stone-500 mt-0.5">{s.description}</div>
                  <div className="text-[10px] text-stone-400 mt-0.5">Relevans: {s.relevance}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {buckets.map(({ theme, insights: themeInsights }) => (
        <Card key={theme.id} className={`!p-4 ${theme.accent}`}>
          <button
            type="button"
            onClick={() => setExpandedTheme(expandedTheme === theme.id ? null : theme.id)}
            className="w-full text-left"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-stone-800">{theme.label}</h3>
                <p className="text-xs text-stone-500 mt-0.5">{theme.description}</p>
              </div>
              <div className="text-xs text-stone-500 shrink-0 mt-0.5">
                {themeInsights.length} innsikter {expandedTheme === theme.id ? '▲' : '▼'}
              </div>
            </div>
          </button>

          {expandedTheme === theme.id && themeInsights.length > 0 && (
            <div className="mt-4 space-y-3">
              {themeInsights.map((item) => (
                <div key={item.id} className="rounded-lg border border-stone-100 bg-stone-50/50 p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-stone-800">{item.title}</h4>
                    <StatusBadge status={item.insightType} />
                  </div>
                  <p className="text-sm text-stone-600 leading-relaxed">{item.description}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                    {item.sourceRefs?.length ? (
                      item.sourceRefs.map((s) => (
                        <SourceChip
                          key={s.label}
                          source={{ label: s.label, url: s.url ?? undefined, note: s.note ?? undefined }}
                        />
                      ))
                    ) : (
                      <span className="text-stone-400">Kilde: {item.source}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      ))}

      {unbucketed.length > 0 && (
        <Card title="Andre innsikter fra forskningsrunden" className="!p-4">
          <div className="space-y-3">
            {unbucketed.map((item) => (
              <div key={item.id} className="rounded-lg border border-stone-100 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-semibold text-stone-800">{item.title}</h4>
                  <StatusBadge status={item.insightType} />
                </div>
                <p className="text-sm text-stone-600 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card title="Nye aktoerer i forskningsrunden">
        {actors.length === 0 ? (
          <EmptyState message="Ingen nye aktoerer enna" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {actors.map((a) => (
              <Link
                key={a.id}
                href={`/aktorer#${a.slug}`}
                className="rounded-lg border border-stone-100 p-3 hover:bg-stone-50 transition-colors block"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-stone-800">{a.name}</div>
                    <div className="text-xs text-stone-500 mt-0.5">
                      {a.actorType} · {a.country.toUpperCase()}
                      {a.priorityTier ? ` · ${a.priorityTier.toUpperCase()}` : ''}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-stone-600 mt-2 line-clamp-3">{a.roleSummary}</p>
              </Link>
            ))}
          </div>
        )}
      </Card>

      <Card title="Rapporter registrert">
        {reports.length === 0 ? (
          <EmptyState message="Ingen rapporter registrert enda" />
        ) : (
          <ul className="space-y-2">
            {reports.map((r) => (
              <li key={r.id} className="border-l-2 border-stone-200 pl-3">
                <div className="text-sm font-medium text-stone-800">{r.title}</div>
                <div className="text-xs text-stone-500 mt-0.5">
                  {r.institution ?? 'Ukjent'} · {r.year ?? '—'} · {r.country}
                </div>
                {r.keyFindings.length > 0 && (
                  <ul className="text-xs text-stone-600 mt-1 space-y-0.5 list-disc list-inside">
                    {r.keyFindings.slice(0, 3).map((k, i) => (
                      <li key={i}>{k}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Selskapsdata fra forskningsrunden" className="!p-4">
        <p className="text-sm text-stone-600">
          Forskningsrunden har tilfoert {companyCount} selskaper innenfor eiendomsgrener og alternative
          distribusjonskanaler. Full selskapsimport inkluderer ogsaa foodservice-grossister, failed
          entrants og benchmark-organisasjoner. Kjor <code className="text-xs bg-stone-100 px-1 rounded">npm run db:import:research-20260420</code> for aa laste selskaper, eierskap,
          eiendommer og forretningsrelasjoner.
        </p>
        <div className="mt-3 flex gap-2 flex-wrap">
          <Link href="/selskap" className="text-xs text-emerald-700 underline">Selskaper →</Link>
          <Link href="/eierskap" className="text-xs text-emerald-700 underline">Eierstrukturer →</Link>
          <Link href="/forsyningskjede" className="text-xs text-emerald-700 underline">Forsyningskjede →</Link>
          <Link href="/sirkularitet" className="text-xs text-emerald-700 underline">Sirkularitet →</Link>
        </div>
      </Card>

      {/* ═══ Sirkulær-konkurser spor ═══ */}
      <div className="pt-2 border-t border-stone-200">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-xl font-bold text-stone-900">Spor: Sirkulær-konkurser 2023-2026</h2>
          <span className="badge-red">Subagent-driven</span>
        </div>
        <p className="text-sm text-stone-500 leading-relaxed mb-4">
          Research-spor som dokumenterer nordiske sirkulær-mat-konkurser og pivots 2023-2026.
          Utgangspunkt: Restaurant Rest (Oslo, Michelin Green Star zero-waste, konkurs sept 2024) og
          Enorm Biofactory (DK insekt-protein, konkurs 30.10.2025). Utvidet med 8 andre caser fra
          subagent-research. Mønster: &ldquo;valley of death&rdquo; mellom FoU-finansiering og skalaproduksjon,
          forsterket av energikrisen 2022 og VC-retrett fra alt-protein.
        </p>
      </div>

      <Card title="Kildeinventar — sirkulær-konkurser" className="!p-4">
        <p className="text-xs text-stone-500 leading-relaxed mb-3">
          Sporer {konkurserBacklogSummary.total} kilder til sirkulær-konkurs-casene.
          Basis: <code className="text-[10px] bg-stone-100 px-1 rounded">research/evidence-pack/download-backlog-sirkular-konkurser-2026-04-20.csv</code>.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2 mb-3">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <div className="text-lg font-bold text-emerald-800">{konkurserBacklogSummary.downloaded}</div>
            <div className="text-[11px] text-emerald-700 mt-0.5">Nedlastet</div>
          </div>
          <div className="rounded-lg border border-sky-200 bg-sky-50 p-3">
            <div className="text-lg font-bold text-sky-800">{konkurserBacklogSummary.exaFetched}</div>
            <div className="text-[11px] text-sky-700 mt-0.5">Exa-hentet</div>
          </div>
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-3">
            <div className="text-lg font-bold text-purple-800">{konkurserBacklogSummary.requiresManual}</div>
            <div className="text-[11px] text-purple-700 mt-0.5">Manuell</div>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <div className="text-lg font-bold text-amber-800">{konkurserBacklogSummary.urlOnly}</div>
            <div className="text-[11px] text-amber-700 mt-0.5">Kun URL</div>
          </div>
          <div className="rounded-lg border border-rose-200 bg-rose-50 p-3">
            <div className="text-lg font-bold text-rose-800">{konkurserBacklogSummary.missingMetadata}</div>
            <div className="text-[11px] text-rose-700 mt-0.5">Mangler metadata</div>
          </div>
          <div className="rounded-lg border border-stone-200 bg-stone-50 p-3">
            <div className="text-lg font-bold text-stone-800">{konkurserBacklogSummary.total}</div>
            <div className="text-[11px] text-stone-600 mt-0.5">Totalt</div>
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto border border-stone-100 rounded-lg">
          <table className="w-full text-xs">
            <thead className="bg-stone-50 sticky top-0">
              <tr className="text-stone-500">
                <th className="text-left py-2 pl-3 pr-2 font-medium">Kilde</th>
                <th className="text-left py-2 px-2 font-medium">Land</th>
                <th className="text-left py-2 px-2 font-medium">Type</th>
                <th className="text-left py-2 px-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {konkurserBacklogRows.map((r, idx) => (
                <tr key={`konkurser-${idx}`} className="border-t border-stone-100 hover:bg-stone-50">
                  <td className="py-2 pl-3 pr-2">
                    {r.url ? (
                      <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-stone-800 hover:text-emerald-700 font-medium">
                        {r.title}
                      </a>
                    ) : (
                      <span className="text-stone-800 font-medium">{r.title}</span>
                    )}
                    <div className="text-[10px] text-stone-400 mt-0.5">{r.institution} · {r.priority}</div>
                  </td>
                  <td className="py-2 px-2 text-stone-500">{r.country}</td>
                  <td className="py-2 px-2 text-stone-500">{r.docType}</td>
                  <td className="py-2 px-2">
                    <span className={`inline-block px-1.5 py-0.5 rounded border text-[10px] ${statusBadge(r.status)}`}>
                      {statusLabel(r.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Konkurs-aktoerer kartlagt">
        {konkurserActors.length === 0 ? (
          <EmptyState message="Ingen aktoerer enda. Kjoer db:import:ts for aa laste seed-data." />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {konkurserActors.map((a) => (
              <Link
                key={a.id}
                href={`/aktorer#${a.slug}`}
                className="rounded-lg border border-stone-100 p-3 hover:bg-stone-50 transition-colors block"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-sm font-semibold text-stone-800">{a.name}</div>
                    <div className="text-xs text-stone-500 mt-0.5">
                      {a.actorType} · {a.country.toUpperCase()}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-stone-600 mt-2 line-clamp-3">{a.roleSummary}</p>
              </Link>
            ))}
          </div>
        )}
      </Card>

      <Card title="Tverrgaaende moenstre — sirkulaer-konkurser" className="!p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="rounded-lg bg-stone-50 p-3 border-l-4 border-l-amber-400">
            <div className="font-semibold text-stone-800 mb-1">Kapital-catch-22</div>
            <p className="text-stone-600 leading-relaxed">
              Detaljister (Salling, NorgesGruppen, ICA) vil ikke committe offtake-volumer uten bevist skala.
              Investorer finansierer ikke CapEx uten contracted offtake. Rammer Mycorena, Enorm, Stockeld,
              Hooked, DUG likt.
            </p>
          </div>
          <div className="rounded-lg bg-stone-50 p-3 border-l-4 border-l-rose-400">
            <div className="font-semibold text-stone-800 mb-1">Energikrise-eksponering</div>
            <p className="text-stone-600 leading-relaxed">
              Strom-intensiv teknologi + kaldt klima rammer insekt og vertikalt landbruk uforholdsmessig
              hardt. Infarm, Ljusgårda, Ÿnsect har alle sitert energikrise 2022-2023 som utloesende faktor.
            </p>
          </div>
          <div className="rounded-lg bg-stone-50 p-3 border-l-4 border-l-emerald-400">
            <div className="font-semibold text-stone-800 mb-1">Overlevende modell: plattform</div>
            <p className="text-stone-600 leading-relaxed">
              Too Good To Go, Matsmart/Motatos, Karma skaleret uten fysisk CapEx og med eksisterende
              retail-nettverk. Unit economics = robuste.
            </p>
          </div>
          <div className="rounded-lg bg-stone-50 p-3 border-l-4 border-l-violet-400">
            <div className="font-semibold text-stone-800 mb-1">TINE + Rest-paradokset</div>
            <p className="text-stone-600 leading-relaxed">
              Selv 33,4% industrielt eierskap fra Norges stoerste meierisamvirke kunne ikke redde
              Restaurant Rest. Peker mot strukturelle problemer heller enn kapitalmangel.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
