'use client'

import Link from 'next/link'
import { useDeferredValue, useState } from 'react'
import { Card } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'
import { InternalBanner } from '@/components/ui/InternalBanner'
import { Glossary } from '@/components/ui/Glossary'

type ActorRow = {
  id: string
  slug: string
  name: string
  actorType: string
  country: string
  organizationType: string | null
  roleSummary: string
  currentRelevance: string | null
  website: string | null
  currentStance: string | null
  desiredStance: string | null
  specificAsk: string | null
  priorityTier: string | null
  owner: string | null
  nextStep: string | null
  powerScore: number | null
  interestScore: number | null
  themeTags: string[]
  company: {
    id: string
    name: string
    orgNr: string
    valueChainStage: string | null
    ownershipType: string | null
  } | null
  contacts: {
    id: string
    name: string
    role: string | null
    email: string | null
    organization: string | null
    note: string | null
  }[]
  _count: {
    documentRefs: number
    relationshipsFrom: number
    relationshipsTo: number
  }
}

const ACTOR_TYPE_LABELS: Record<string, string> = {
  company: 'Selskap',
  consulting: 'Raadgiver',
  'civil-society': 'Sivilsamfunn',
  department: 'Departement',
  funder: 'Finansiering',
  'industry-association': 'Bransje',
  network: 'Nettverk',
  'policy-process': 'Politisk prosess',
  'producer-organization': 'Produsent',
  'public-body': 'Forvaltningsorgan',
  'public-network': 'Regional aktor',
  regulator: 'Regulator',
  research: 'Forskning',
}

const STANCE_LABELS: Record<string, string> = {
  champion: 'Champion',
  supportive: 'Supportive',
  neutral: 'Neutral',
  skeptical: 'Skeptical',
  opposed: 'Opposed',
}

const PRIORITY_LABELS: Record<string, string> = {
  p1: 'P1',
  p2: 'P2',
  p3: 'P3',
}

const STANCE_STYLES: Record<string, string> = {
  champion: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  supportive: 'bg-sky-50 text-sky-700 border-sky-200',
  neutral: 'bg-stone-100 text-stone-600 border-stone-200',
  skeptical: 'bg-amber-50 text-amber-700 border-amber-200',
  opposed: 'bg-rose-50 text-rose-700 border-rose-200',
}

const PRIORITY_STYLES: Record<string, string> = {
  p1: 'bg-stone-900 text-white border-stone-900',
  p2: 'bg-stone-100 text-stone-700 border-stone-200',
  p3: 'bg-white text-stone-500 border-stone-200',
}

function isKeyPlayer(actor: ActorRow) {
  return (actor.powerScore ?? 0) >= 4 && (actor.interestScore ?? 0) >= 4
}

export function AktorerContent({ actors }: { actors: ActorRow[] }) {
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('alle')
  const [priorityFilter, setPriorityFilter] = useState('alle')
  const [stanceFilter, setStanceFilter] = useState('alle')
  const [themeFilter, setThemeFilter] = useState('alle')
  const deferredQuery = useDeferredValue(query)

  const actorTypes = [...new Set(actors.map(actor => actor.actorType))].sort()
  const stances = [...new Set(actors.map(actor => actor.currentStance).filter(Boolean))].sort() as string[]
  const allThemeTags = [...new Set(actors.flatMap(a => a.themeTags ?? []))].sort()

  const filteredActors = actors.filter(actor => {
    if (typeFilter !== 'alle' && actor.actorType !== typeFilter) return false
    if (priorityFilter !== 'alle' && actor.priorityTier !== priorityFilter) return false
    if (stanceFilter !== 'alle' && actor.currentStance !== stanceFilter) return false
    if (themeFilter !== 'alle' && !actor.themeTags?.includes(themeFilter)) return false

    if (!deferredQuery.trim()) return true

    const haystack = [
      actor.name,
      actor.roleSummary,
      actor.currentRelevance ?? '',
      actor.specificAsk ?? '',
      actor.nextStep ?? '',
      actor.company?.name ?? '',
      ...actor.themeTags,
    ].join(' ').toLowerCase()

    return haystack.includes(deferredQuery.toLowerCase())
  })

  const stats = {
    total: actors.length,
    p1: actors.filter(actor => actor.priorityTier === 'p1').length,
    keyPlayers: actors.filter(isKeyPlayer).length,
    withAsks: actors.filter(actor => Boolean(actor.specificAsk)).length,
  }

  const quadrants = {
    keyPlayers: actors.filter(actor => (actor.powerScore ?? 0) >= 4 && (actor.interestScore ?? 0) >= 4).length,
    keepSatisfied: actors.filter(actor => (actor.powerScore ?? 0) >= 4 && (actor.interestScore ?? 0) < 4).length,
    keepInformed: actors.filter(actor => (actor.powerScore ?? 0) < 4 && (actor.interestScore ?? 0) >= 4).length,
    monitor: actors.filter(actor => (actor.powerScore ?? 0) < 4 && (actor.interestScore ?? 0) < 4).length,
  }

  const topKeyPlayersPool = themeFilter !== 'alle'
    ? actors.filter(actor => actor.themeTags?.includes(themeFilter))
    : actors
  const topKeyPlayers = [...topKeyPlayersPool]
    .map(actor => ({ actor, score: (actor.powerScore ?? 0) * (actor.interestScore ?? 0) }))
    .filter(entry => entry.score > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      return a.actor.name.localeCompare(b.actor.name, 'no')
    })
    .slice(0, 10)

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      <InternalBanner note="Intern interessent-/påvirkningsanalyse: stance, makt/interesse-score og «asks» er teamets arbeidsvurderinger, ikke eksterne fakta." />
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Aktørkart</h1>
          <p className="text-stone-500 mt-2 max-w-3xl">
            Prioritert aktøroversikt for TG-mobilisering. Kombinerer rolle, stance, power/interesse,
            konkrete asks og neste steg med dokumentgrunnlag og relasjoner.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="bg-white px-4 py-3 rounded-lg border border-stone-200 shadow-sm">
            <div className="text-xs uppercase tracking-wider text-stone-400">Aktører</div>
            <div className="text-2xl font-bold text-stone-900">{stats.total}</div>
          </div>
          <div className="bg-white px-4 py-3 rounded-lg border border-stone-200 shadow-sm">
            <div className="text-xs uppercase tracking-wider text-stone-400">P1</div>
            <div className="text-2xl font-bold text-stone-900">{stats.p1}</div>
          </div>
          <div className="bg-white px-4 py-3 rounded-lg border border-stone-200 shadow-sm">
            <div className="text-xs uppercase tracking-wider text-stone-400">Key players</div>
            <div className="text-2xl font-bold text-stone-900">{stats.keyPlayers}</div>
          </div>
          <div className="bg-white px-4 py-3 rounded-lg border border-stone-200 shadow-sm">
            <div className="text-xs uppercase tracking-wider text-stone-400">Med ask</div>
            <div className="text-2xl font-bold text-stone-900">{stats.withAsks}</div>
          </div>
        </div>
      </div>

      <Glossary category="status" title="Statusforklaringer" />

      <Card>
        <div className="grid gap-4 lg:grid-cols-[1.4fr,1fr]">
          <div className="space-y-3">
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Søk etter aktør, tema eller ask..."
              className="w-full px-4 py-3 rounded-xl border border-stone-200 bg-white text-sm text-stone-800 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <div className="flex flex-wrap gap-2">
              <select
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-300"
              >
                <option value="alle">Type: Alle</option>
                {actorTypes.map(type => (
                  <option key={type} value={type}>
                    {ACTOR_TYPE_LABELS[type] ?? type}
                  </option>
                ))}
              </select>
              <select
                value={priorityFilter}
                onChange={(event) => setPriorityFilter(event.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-300"
              >
                <option value="alle">Prioritet: Alle</option>
                {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <select
                value={stanceFilter}
                onChange={(event) => setStanceFilter(event.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-300"
              >
                <option value="alle">Stance: Alle</option>
                {stances.map(stance => (
                  <option key={stance} value={stance}>
                    {STANCE_LABELS[stance] ?? stance}
                  </option>
                ))}
              </select>
              <select
                value={themeFilter}
                onChange={(event) => setThemeFilter(event.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white text-stone-600 focus:outline-none focus:ring-2 focus:ring-stone-300"
              >
                <option value="alle">Tema: Alle</option>
                {allThemeTags.map(tag => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-3">
              <div className="text-[11px] uppercase tracking-wider text-stone-400">Key players</div>
              <div className="mt-1 text-xl font-bold text-stone-900">{quadrants.keyPlayers}</div>
              <div className="text-xs text-stone-500">Hoy makt, hoy interesse</div>
            </div>
            <div className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-3">
              <div className="text-[11px] uppercase tracking-wider text-stone-400">Keep satisfied</div>
              <div className="mt-1 text-xl font-bold text-stone-900">{quadrants.keepSatisfied}</div>
              <div className="text-xs text-stone-500">Hoy makt, lavere interesse</div>
            </div>
            <div className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-3">
              <div className="text-[11px] uppercase tracking-wider text-stone-400">Keep informed</div>
              <div className="mt-1 text-xl font-bold text-stone-900">{quadrants.keepInformed}</div>
              <div className="text-xs text-stone-500">Lavere makt, hoy interesse</div>
            </div>
            <div className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-3">
              <div className="text-[11px] uppercase tracking-wider text-stone-400">Monitor</div>
              <div className="mt-1 text-xl font-bold text-stone-900">{quadrants.monitor}</div>
              <div className="text-xs text-stone-500">Lavere makt, lavere interesse</div>
            </div>
          </div>
        </div>
      </Card>

      {topKeyPlayers.length > 0 && (
        <Card>
          <div className="flex items-baseline justify-between gap-3 mb-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-stone-700">
                Top 10 Key Players
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                {themeFilter !== 'alle'
                  ? `Innen tema "${themeFilter}" · rangert etter makt × interesse`
                  : 'Samlet · rangert etter makt × interesse'}
              </p>
            </div>
            <div className="text-[10px] uppercase tracking-wider text-stone-400">
              {topKeyPlayersPool.length} aktorer i utvalget
            </div>
          </div>
          <ol className="grid gap-1.5 md:grid-cols-2">
            {topKeyPlayers.map((entry, index) => {
              const { actor, score } = entry
              return (
                <li
                  key={actor.id}
                  className="flex items-center gap-2.5 rounded-lg border border-stone-200 bg-white px-2.5 py-1.5 hover:border-emerald-300 transition-colors"
                >
                  <span className="w-6 shrink-0 text-center text-xs font-semibold text-stone-400 tabular-nums">
                    {index + 1}
                  </span>
                  <Link
                    href={`/aktorer/${actor.slug}`}
                    className="flex-1 min-w-0 text-sm font-medium text-stone-900 hover:text-emerald-700 truncate"
                  >
                    {actor.name}
                  </Link>
                  <span className="shrink-0 text-[11px] tabular-nums text-stone-500">
                    {actor.powerScore ?? 0}×{actor.interestScore ?? 0}={score}
                  </span>
                  {actor.themeTags[0] && (
                    <span className="hidden sm:inline shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200 max-w-[7rem] truncate">
                      {actor.themeTags[0]}
                    </span>
                  )}
                </li>
              )
            })}
          </ol>
        </Card>
      )}

      {filteredActors.length === 0 ? (
        <EmptyState message="Ingen aktorer matcher filteret" />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredActors.map(actor => (
            <Card key={actor.id} className="!p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Link href={`/aktorer/${actor.slug}`} className="text-lg font-semibold text-stone-900 hover:text-emerald-700">
                      {actor.name}
                    </Link>
                    {actor.priorityTier && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${PRIORITY_STYLES[actor.priorityTier] ?? PRIORITY_STYLES.p3}`}>
                        {PRIORITY_LABELS[actor.priorityTier] ?? actor.priorityTier}
                      </span>
                    )}
                    {actor.currentStance && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${STANCE_STYLES[actor.currentStance] ?? STANCE_STYLES.neutral}`}>
                        {STANCE_LABELS[actor.currentStance] ?? actor.currentStance}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs uppercase tracking-wider text-stone-400">
                    {ACTOR_TYPE_LABELS[actor.actorType] ?? actor.actorType}
                    {actor.organizationType ? ` · ${actor.organizationType}` : ''}
                  </p>
                </div>

                <div className="text-right text-xs text-stone-500 shrink-0">
                  <div>Makt {actor.powerScore ?? '—'}/5</div>
                  <div>Interesse {actor.interestScore ?? '—'}/5</div>
                </div>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-stone-700">{actor.roleSummary}</p>

              {actor.currentRelevance && (
                <p className="mt-3 text-sm text-stone-600">
                  <span className="font-medium text-stone-700">Hvorfor nå:</span> {actor.currentRelevance}
                </p>
              )}

              {actor.specificAsk && (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/60 px-3 py-3">
                  <div className="text-[11px] uppercase tracking-wider text-emerald-700">Specific ask</div>
                  <p className="mt-1 text-sm text-emerald-900">{actor.specificAsk}</p>
                </div>
              )}

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-3">
                  <div className="text-[11px] uppercase tracking-wider text-stone-400">Neste steg</div>
                  <p className="mt-1 text-sm text-stone-700">{actor.nextStep ?? 'Ikke satt ennå.'}</p>
                </div>
                <div className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-3">
                  <div className="text-[11px] uppercase tracking-wider text-stone-400">Ansvar</div>
                  <p className="mt-1 text-sm text-stone-700">{actor.owner ?? 'Ikke satt'}</p>
                  <p className="mt-2 text-xs text-stone-500">
                    {actor._count.documentRefs} dokumentkoblinger · {actor._count.relationshipsFrom + actor._count.relationshipsTo} relasjoner
                  </p>
                </div>
              </div>

              {(actor.themeTags.length > 0 || actor.company) && (
                <div className="mt-4 space-y-2">
                  {actor.themeTags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {actor.themeTags.map(tag => (
                        <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 border border-stone-200">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {actor.company && (
                    <div className="text-xs text-stone-500">
                      Koblet selskap:{' '}
                      <Link href={`/selskap/${actor.company.id}`} className="font-medium text-rose-700 hover:underline">
                        {actor.company.name}
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
