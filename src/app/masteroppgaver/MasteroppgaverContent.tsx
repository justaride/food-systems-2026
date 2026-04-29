'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/Card'
import { FilterChips } from '@/components/ui/FilterChips'
import { EmptyState } from '@/components/ui/EmptyState'

type ThesisRow = {
  id: string
  authors: string
  institution: string
  year: number
  title: string
  titleNo: string | null
  url: string
  synthesis: string
  keyFindings: string[]
  tags: string[]
  takeaways: string[]
  method: string | null
  awardWinning: boolean
  degree: string
  documentId: string | null
}

type ThesisTheme =
  | 'konsentrasjon' | 'makt' | 'etableringshindringer'
  | 'regulering' | 'verdikjede' | 'prising' | 'emv' | 'nordisk'
  | 'matsvinn' | 'sirkulaer' | 'offentlig-innkjop' | 'atferd' | 'emballasje' | 'okologi'
  | 'beredskap' | 'digital' | 'selvforsyning' | 'klima' | 'protein' | 'logistikk'

const themeLabels: Record<ThesisTheme, string> = {
  konsentrasjon: 'Konsentrasjon',
  makt: 'Makt',
  etableringshindringer: 'Etableringshindringer',
  regulering: 'Regulering',
  verdikjede: 'Verdikjede',
  prising: 'Prising',
  emv: 'EMV',
  nordisk: 'Nordisk',
  matsvinn: 'Matsvinn',
  sirkulaer: 'Sirkulaer',
  'offentlig-innkjop': 'Offentlig innkjop',
  atferd: 'Atferd',
  emballasje: 'Emballasje',
  okologi: 'Okologi',
  beredskap: 'Beredskap',
  digital: 'Digital',
  selvforsyning: 'Selvforsyning',
  klima: 'Klima',
  protein: 'Proteinskifte',
  logistikk: 'Logistikk',
}

const THEME_COLORS: Record<ThesisTheme, string> = {
  konsentrasjon: 'bg-red-50 text-red-700 border-red-200',
  makt: 'bg-orange-50 text-orange-700 border-orange-200',
  etableringshindringer: 'bg-amber-50 text-amber-700 border-amber-200',
  regulering: 'bg-violet-50 text-violet-700 border-violet-200',
  verdikjede: 'bg-blue-50 text-blue-700 border-blue-200',
  prising: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  emv: 'bg-pink-50 text-pink-700 border-pink-200',
  nordisk: 'bg-sky-50 text-sky-700 border-sky-200',
  matsvinn: 'bg-lime-50 text-lime-700 border-lime-200',
  sirkulaer: 'bg-teal-50 text-teal-700 border-teal-200',
  'offentlig-innkjop': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  atferd: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  emballasje: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
  okologi: 'bg-green-50 text-green-700 border-green-200',
  beredskap: 'bg-rose-50 text-rose-700 border-rose-200',
  digital: 'bg-cyan-50 text-cyan-700 border-cyan-200',
  selvforsyning: 'bg-stone-50 text-stone-700 border-stone-200',
  klima: 'bg-slate-50 text-slate-700 border-slate-200',
  protein: 'bg-purple-50 text-purple-700 border-purple-200',
  logistikk: 'bg-zinc-50 text-zinc-700 border-zinc-200',
}

export function MasteroppgaverContent({ theses }: { theses: ThesisRow[] }) {
  const [degreeFilter, setDegreeFilter] = useState('alle')
  const [themeFilter, setThemeFilter] = useState('alle')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  const masterCount = theses.filter(t => t.degree === 'master').length
  const phdCount = theses.filter(t => t.degree === 'phd').length
  const institutionCount = new Set(theses.map(t => t.institution)).size
  const documentLinkedCount = theses.filter(t => Boolean(t.documentId)).length
  const missingDocumentCount = theses.length - documentLinkedCount
  const analysisReadyCount = theses.filter(t =>
    Boolean(t.synthesis?.trim()) &&
    t.keyFindings.length > 0 &&
    t.takeaways.length > 0 &&
    Boolean(t.method?.trim())
  ).length

  const years = theses.map(t => t.year).filter(y => Number.isFinite(y))
  const yearMin = years.length ? Math.min(...years) : null
  const yearMax = years.length ? Math.max(...years) : null

  const themeCounts = new Map<string, number>()
  theses.forEach(t => t.tags.forEach(tag => {
    themeCounts.set(tag, (themeCounts.get(tag) ?? 0) + 1)
  }))
  const topThemes = [...themeCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
  const focusThemes = topThemes
    .filter(([theme]) => theme !== 'nordisk')
    .slice(0, 4)
    .map(([theme]) => themeLabels[theme as ThesisTheme] ?? theme.toLowerCase())

  const institutionCounts = new Map<string, number>()
  theses.forEach(t => {
    institutionCounts.set(t.institution, (institutionCounts.get(t.institution) ?? 0) + 1)
  })
  const topInstitutions = [...institutionCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  const degreeFilters = [
    { label: `Alle (${theses.length})`, value: 'alle' },
    { label: `Master (${masterCount})`, value: 'master' },
    { label: `PhD (${phdCount})`, value: 'phd' },
  ]

  const afterDegree = theses.filter(t =>
    degreeFilter === 'alle' || t.degree === degreeFilter
  )

  const activeThemes = new Set(afterDegree.flatMap(t => t.tags))
  const themeFilters = [
    { label: 'Alle temaer', value: 'alle' },
    ...Object.entries(themeLabels)
      .filter(([value]) => activeThemes.has(value))
      .map(([value, label]) => {
        const count = afterDegree.filter(t => t.tags.includes(value)).length
        return { label: `${label} (${count})`, value }
      }),
  ]

  const filtered = afterDegree.filter(t =>
    themeFilter === 'alle' || t.tags.includes(themeFilter)
  )

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Akademia</h1>
        <p className="text-xs uppercase tracking-wider text-stone-500 mt-0.5 font-medium">
          Nordisk avhandlings- og forskningslag for Food TG
        </p>
      </div>

      {theses.length > 0 && (
        <Card>
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="bg-stone-50 px-4 py-3 rounded-lg border border-stone-200">
                <div className="text-xs uppercase tracking-wider text-stone-400">Registrert</div>
                <div className="text-2xl font-bold text-stone-900">{theses.length}</div>
                <div className="text-xs text-stone-500 mt-0.5">{masterCount} master {'·'} {phdCount} PhD</div>
              </div>
              <div className="bg-stone-50 px-4 py-3 rounded-lg border border-stone-200">
                <div className="text-xs uppercase tracking-wider text-stone-400">Analyseklare</div>
                <div className="text-2xl font-bold text-stone-900">{analysisReadyCount}</div>
                <div className="text-xs text-stone-500 mt-0.5">med syntese, funn og uttak</div>
              </div>
              <div className="bg-stone-50 px-4 py-3 rounded-lg border border-stone-200">
                <div className="text-xs uppercase tracking-wider text-stone-400">Dokumentkoblet</div>
                <div className="text-2xl font-bold text-stone-900">{documentLinkedCount}</div>
                <div className="text-xs text-stone-500 mt-0.5">
                  {missingDocumentCount === 0 ? 'alle har documentId' : `${missingDocumentCount} gjenstar`}
                </div>
              </div>
              <div className="bg-stone-50 px-4 py-3 rounded-lg border border-stone-200">
                <div className="text-xs uppercase tracking-wider text-stone-400">Tidsrom</div>
                <div className="text-2xl font-bold text-stone-900">
                  {yearMin !== null && yearMax !== null ? `${yearMin}${'–'}${yearMax}` : '—'}
                </div>
                <div className="text-xs text-stone-500 mt-0.5">{institutionCount} institusjoner</div>
              </div>
            </div>

            <div className="border-t border-stone-200 pt-4">
              <p className="text-xs uppercase tracking-wider text-stone-500 mb-2 font-medium">Overordnet status</p>
              <div className="grid gap-4 lg:grid-cols-3">
                <div>
                  <p className="text-sm font-semibold text-stone-900">Dataen er strukturert, men ikke helt lukket</p>
                  <p className="text-sm text-stone-700 leading-relaxed mt-1">
                    Alle registrerte arbeider har kortsyntese, nokkelfunn, uttak og metode. Det som fortsatt gjenstar
                    i datalaget er hovedsakelig dokumentkobling for {missingDocumentCount} rader og kontroll av noen
                    PDF-/arkivhull.
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-900">Innsikten peker mot B og C</p>
                  <p className="text-sm text-stone-700 leading-relaxed mt-1">
                    Tyngden ligger i {focusThemes.length ? focusThemes.join(', ') : 'matsvinn, verdikjede og marked'}.
                    Det gjor akademialaget sterkest som evidensbank for matsvinn/sidestroemmer, adoption,
                    offentlig innkjop, governance og markedsmakt som skaleringsbarriere.
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-stone-900">Brukes som intern beslutningsstotte</p>
                  <p className="text-sm text-stone-700 leading-relaxed mt-1">
                    Avhandlingene kan brukes til a prioritere claims og valideringsspor. Funn som skal ut i dialog
                    eller eksterne leveranser bor fortsatt holdes pa intern status til primaerkilde- eller
                    aktoervalidering er gjort.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-wider text-stone-500 mb-1.5 font-medium">Mest forskede temaer</p>
                <div className="flex flex-wrap gap-1.5">
                  {topThemes.map(([theme, count]) => (
                    <span
                      key={theme}
                      className={`text-[11px] px-2 py-0.5 rounded border ${THEME_COLORS[theme as ThesisTheme] ?? 'bg-stone-50 text-stone-500 border-stone-200'}`}
                    >
                      {themeLabels[theme as ThesisTheme] ?? theme} <span className="opacity-60">({count})</span>
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-stone-500 mb-1.5 font-medium">Toneangivende institusjoner</p>
                <div className="flex flex-wrap gap-1.5">
                  {topInstitutions.map(([inst, count]) => (
                    <span
                      key={inst}
                      className="text-[11px] px-2 py-0.5 rounded bg-stone-50 text-stone-700 border border-stone-200"
                    >
                      {inst} <span className="opacity-60">({count})</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="space-y-2">
        <FilterChips items={degreeFilters} defaultValue="alle" onChange={(v) => { setDegreeFilter(v); setThemeFilter('alle') }} />
        <FilterChips items={themeFilters} defaultValue="alle" onChange={setThemeFilter} />
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="Ingen avhandlinger med dette filteret" />
      ) : (
        <div className="space-y-3">
          {filtered.map(thesis => {
            const isExpanded = expandedIds.has(thesis.id)

            return (
              <Card key={thesis.id} className="!p-0">
                <button
                  type="button"
                  className="w-full text-left px-4 py-3 flex items-start gap-3"
                  onClick={() => toggleExpand(thesis.id)}
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
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold text-stone-800 truncate">
                        {thesis.titleNo || thesis.title}
                      </h3>
                      {thesis.degree === 'phd' && (
                        <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-200 font-medium">
                          PhD
                        </span>
                      )}
                      {thesis.awardWinning && (
                        <span className="shrink-0 text-[10px] px-1.5 py-0.5 rounded bg-yellow-50 text-yellow-700 border border-yellow-200 font-medium">
                          Prisvinnende
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-stone-400">
                      <span>{thesis.authors}</span>
                      <span>·</span>
                      <span>{thesis.institution}</span>
                      <span>·</span>
                      <span>{thesis.year}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end max-w-[200px]">
                    {thesis.tags.map(tag => (
                      <span
                        key={tag}
                        className={`text-[10px] px-1.5 py-0.5 rounded border ${THEME_COLORS[tag as ThesisTheme] ?? 'bg-stone-50 text-stone-500 border-stone-200'}`}
                      >
                        {themeLabels[tag as ThesisTheme] ?? tag}
                      </span>
                    ))}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t border-stone-100">
                    <div className="mt-3 space-y-4">
                      <div>
                        <p className="text-xs font-medium text-stone-500 mb-1">Syntese</p>
                        <p className="text-sm text-stone-700 leading-relaxed">{thesis.synthesis}</p>
                      </div>

                      {thesis.method && (
                        <div>
                          <p className="text-xs font-medium text-stone-500 mb-1">Metode</p>
                          <p className="text-sm text-stone-600">{thesis.method}</p>
                        </div>
                      )}

                      <div>
                        <p className="text-xs font-medium text-stone-500 mb-1.5">Nokkelfunn</p>
                        <ul className="space-y-1">
                          {thesis.keyFindings.map((finding, i) => (
                            <li key={i} className="text-sm text-stone-600 flex gap-2">
                              <span className="text-stone-300 shrink-0">{'\u2014'}</span>
                              <span>{finding}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                        <p className="text-xs font-medium text-emerald-700 mb-1.5">Uttak for videre prosesser</p>
                        <ul className="space-y-1">
                          {thesis.takeaways.map((takeaway, i) => (
                            <li key={i} className="text-sm text-emerald-800 flex gap-2">
                              <span className="text-emerald-400 shrink-0">{'\u2192'}</span>
                              <span>{takeaway}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {thesis.url && (
                        <div className="pt-1">
                          <a
                            href={thesis.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-stone-400 hover:text-stone-600 underline underline-offset-2"
                          >
                            Les fulltext {'\u2192'}
                          </a>
                        </div>
                      )}
                    </div>
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
