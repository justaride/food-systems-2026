import { Card } from '@/components/ui/Card'
import { SourceChip } from '@/components/ui/SourceChip'
import { ExpandableSources } from '@/components/ui/ExpandableSources'
import { COUNTRY_LIST } from '@/lib/config/countries'
import {
  mediaInternalSources,
  mediaScanGuidance,
  mediaYears,
} from '@/lib/data/media-landscape'
import {
  getMediaCountryProfiles,
  getMediaEntries,
  getMediaOutlets,
  getMediaThemes,
  getMediaTimeline,
} from '@/lib/queries/media'
import type { SourceRef } from '@/lib/types'

type MediaFocusLevel = 'lav' | 'middels' | 'hoy' | 'kritisk'

type MediaTriggerMoment = {
  year: number
  label: string
  sources?: SourceRef[]
}

type CountryCardProfile = {
  id: string
  name: string
  iso: string
  dominantNarrative: string
  summary: string
  strongestPeriod: string
  keyQuestion: string
  yearlySignal: number[]
  focusLevels: Record<string, MediaFocusLevel>
  triggerMoments: MediaTriggerMoment[]
  sources: SourceRef[] | null
}

type ThemeItem = {
  id: string
  name: string
  description: string
  sources: SourceRef[] | null
}

type CorpusCodingItem = {
  primaryTheme: string
  secondaryThemes: string[]
  tone: string
  frame: string
  geography: string
  actorTargets: string[]
  confidence: number
  triggerLabel: string | null
  evidenceNote: string | null
}

type CorpusEntryItem = {
  id: string
  country: string
  publishedYear: number
  publishedMonth: number | null
  publishedDay: number | null
  datePrecision: string
  title: string
  summary: string
  url: string | null
  recordType: string
  verificationLevel: string
  triggerLabel: string | null
  sourceRefs: SourceRef[] | null
  outlet: {
    id: string
    name: string
    country: string
    outletType: string
    url: string | null
  }
  sourceDoc: {
    id: string
    title: string | null
    url: string | null
  } | null
  codings: CorpusCodingItem[]
}

type CountryCoverageRow = {
  code: string
  name: string
  entryCount: number
  outletCount: number
  primaryCount: number
  themeCount: number
  latestLabel: string
  status: 'mangler' | 'tynn' | 'arbeidsklar'
}

const focusWeight: Record<MediaFocusLevel, number> = {
  lav: 1,
  middels: 2,
  hoy: 3,
  kritisk: 4,
}

const focusLabel: Record<MediaFocusLevel, string> = {
  lav: 'Lav',
  middels: 'Middels',
  hoy: 'Hoy',
  kritisk: 'Kritisk',
}

const focusClassName: Record<MediaFocusLevel, string> = {
  lav: 'bg-stone-100 text-stone-600 border border-stone-200',
  middels: 'bg-sky-50 text-sky-700 border border-sky-200',
  hoy: 'bg-amber-50 text-amber-700 border border-amber-200',
  kritisk: 'bg-rose-50 text-rose-700 border border-rose-200',
}

const countryAccentClass: Record<string, string> = {
  NO: 'from-emerald-500 via-emerald-400 to-emerald-200',
  SE: 'from-sky-500 via-sky-400 to-sky-200',
  DK: 'from-amber-500 via-amber-400 to-amber-200',
  FI: 'from-stone-700 via-stone-500 to-stone-300',
  IS: 'from-indigo-500 via-indigo-400 to-cyan-200',
}

const toneClassName: Record<string, string> = {
  kritisk: 'bg-rose-50 text-rose-700 border border-rose-200',
  analytisk: 'bg-sky-50 text-sky-700 border border-sky-200',
  policy: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
}

const verificationClassName: Record<string, string> = {
  primary: 'bg-stone-900 text-white border border-stone-900',
  secondary: 'bg-stone-100 text-stone-600 border border-stone-200',
}

const coverageClassName: Record<CountryCoverageRow['status'], string> = {
  mangler: 'bg-rose-50 text-rose-700 border border-rose-200',
  tynn: 'bg-amber-50 text-amber-700 border border-amber-200',
  arbeidsklar: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
}

const coverageLabel: Record<CountryCoverageRow['status'], string> = {
  mangler: 'Mangler',
  tynn: 'Tynn',
  arbeidsklar: 'Arbeidsklar',
}

const monthLabel = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des']

function formatPublicationLabel(entry: Pick<CorpusEntryItem, 'publishedYear' | 'publishedMonth' | 'publishedDay' | 'datePrecision'>) {
  if (entry.datePrecision === 'day' && entry.publishedMonth && entry.publishedDay) {
    return `${String(entry.publishedDay).padStart(2, '0')}. ${monthLabel[entry.publishedMonth]} ${entry.publishedYear}`
  }
  if (entry.datePrecision === 'month' && entry.publishedMonth) {
    return `${monthLabel[entry.publishedMonth]} ${entry.publishedYear}`
  }
  return String(entry.publishedYear)
}

function formatCountMap(items: Map<string, number>, formatter?: (value: string) => string) {
  return [...items.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([value, count]) => `${formatter ? formatter(value) : value}: ${count}`)
}

function normalizeLabel(value: string) {
  return value
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function SignalBars({ values }: { values: number[] }) {
  return (
    <div className="flex items-end gap-1.5">
      {values.map((value, index) => (
        <div key={mediaYears[index]} className="flex flex-col items-center gap-1">
          <div className="flex h-16 w-4 items-end rounded-full bg-stone-100 p-[2px]">
            <div
              className="w-full rounded-full bg-gradient-to-t from-stone-800 via-amber-400 to-emerald-400"
              style={{ height: `${value * 18}%` }}
            />
          </div>
          <span className="text-[10px] text-stone-400">{String(mediaYears[index]).slice(2)}</span>
        </div>
      ))}
    </div>
  )
}

function CountryCard({ profile, themes }: { profile: CountryCardProfile; themes: ThemeItem[] }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 shadow-sm shadow-stone-900/[0.03]">
      <div
        className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${
          countryAccentClass[profile.iso] ?? 'from-stone-500 via-stone-400 to-stone-200'
        }`}
      />

      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-[0.18em] text-stone-400">{profile.iso}</span>
            <span className="text-[11px] text-stone-400">Sterkest {profile.strongestPeriod}</span>
          </div>
          <h3 className="mt-2 text-lg font-semibold text-stone-900">{profile.name}</h3>
          <p className="mt-1 text-sm text-stone-500">{profile.dominantNarrative}</p>
        </div>
        <div className="rounded-full border border-stone-200 bg-stone-50 px-3 py-1 text-xs font-medium text-stone-600">
          {profile.yearlySignal.reduce((sum, value) => sum + value, 0)} signal
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-stone-600">{profile.summary}</p>

      <div className="mt-5 rounded-2xl border border-stone-200 bg-stone-50/70 p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs uppercase tracking-[0.18em] text-stone-400">Narrativkurve 2016-2025</span>
          <span className="text-xs text-stone-500">Kvalitativt signalniva</span>
        </div>
        <SignalBars values={profile.yearlySignal} />
      </div>

      <div className="mt-5">
        <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Hva mediene egentlig sporer</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {themes.map(theme => {
            const level = profile.focusLevels[theme.id]
            return (
              <span key={theme.id} className={`badge ${focusClassName[level]}`}>
                {theme.name}: {focusLabel[level]}
              </span>
            )
          })}
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Kjernespaersmaal</p>
          <p className="mt-2 text-sm leading-6 text-stone-700">{profile.keyQuestion}</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Viktige triggere</p>
          <div className="mt-2 space-y-2">
            {profile.triggerMoments.map(moment => (
              <div key={`${profile.id}-${moment.year}-${moment.label}`}>
                <div className="flex gap-3 text-sm text-stone-600">
                  <span className="font-mono text-stone-400">{moment.year}</span>
                  <span>{moment.label}</span>
                </div>
                {moment.sources && moment.sources.length > 0 && (
                  <div className="ml-12 mt-1 flex flex-wrap gap-1.5">
                    {moment.sources.map(source => (
                      <SourceChip key={`${moment.year}-${source.label}`} source={source} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {profile.sources && profile.sources.length > 0 && (
        <div className="mt-5 border-t border-stone-100 pt-4">
          <ExpandableSources sources={profile.sources} label="profilkilder" />
        </div>
      )}
    </div>
  )
}

function CorpusEntryCard({ entry, themes }: { entry: CorpusEntryItem; themes: ThemeItem[] }) {
  const coding = entry.codings[0]
  const primaryThemeName = coding
    ? themes.find(theme => theme.id === coding.primaryTheme)?.name ?? normalizeLabel(coding.primaryTheme)
    : null

  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4">
      <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-stone-400">
        <span>{entry.country.toUpperCase()}</span>
        <span>{formatPublicationLabel(entry)}</span>
        <span>{normalizeLabel(entry.recordType)}</span>
      </div>

      <div className="mt-2 flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold leading-6 text-stone-900">
            {entry.url ? (
              <a href={entry.url} target="_blank" rel="noopener noreferrer" className="hover:text-stone-700">
                {entry.title}
              </a>
            ) : (
              entry.title
            )}
          </h3>
          <p className="mt-1 text-xs text-stone-500">{entry.outlet.name}</p>
        </div>
        <span className={`badge ${verificationClassName[entry.verificationLevel] ?? verificationClassName.secondary}`}>
          {entry.verificationLevel === 'primary' ? 'Primaer' : 'Sekundaer'}
        </span>
      </div>

      <p className="mt-3 text-sm leading-6 text-stone-600">{entry.summary}</p>

      {coding && (
        <div className="mt-3 flex flex-wrap gap-2">
          {primaryThemeName && <span className="badge badge-blue">{primaryThemeName}</span>}
          <span className={`badge ${toneClassName[coding.tone] ?? focusClassName.middels}`}>{normalizeLabel(coding.tone)}</span>
          <span className="badge badge-neutral">{normalizeLabel(coding.frame)}</span>
          <span className="badge badge-neutral">{normalizeLabel(coding.geography)}</span>
          <span className="badge badge-neutral">Confidence {coding.confidence}/5</span>
        </div>
      )}

      {coding?.evidenceNote && (
        <p className="mt-3 text-xs leading-5 text-stone-500">{coding.evidenceNote}</p>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        <SourceChip
          source={{
            label: entry.outlet.name,
            url: entry.outlet.url ?? undefined,
            note: normalizeLabel(entry.outlet.outletType),
          }}
        />
        {entry.sourceDoc && (
          <SourceChip
            source={{
              sourceId: entry.sourceDoc.id,
              label: entry.sourceDoc.title ?? entry.sourceDoc.id,
              url: entry.sourceDoc.url ?? undefined,
            }}
          />
        )}
      </div>

      {entry.sourceRefs && entry.sourceRefs.length > 0 && (
        <ExpandableSources sources={entry.sourceRefs} label="evidenskilder" />
      )}
    </div>
  )
}

export default async function MediaPage() {
  const [themes, timeline, countryProfiles, outlets, entries] = await Promise.all([
    getMediaThemes(),
    getMediaTimeline(),
    getMediaCountryProfiles(),
    getMediaOutlets(),
    getMediaEntries(),
  ])

  const typedThemes: ThemeItem[] = themes.map(theme => ({
    id: theme.id,
    name: theme.name,
    description: theme.description,
    sources: theme.sources as SourceRef[] | null,
  }))

  const typedProfiles: CountryCardProfile[] = countryProfiles.map(profile => ({
    id: profile.id,
    name: profile.name,
    iso: profile.iso,
    dominantNarrative: profile.dominantNarrative,
    summary: profile.summary,
    strongestPeriod: profile.strongestPeriod,
    keyQuestion: profile.keyQuestion,
    yearlySignal: profile.yearlySignal,
    focusLevels: profile.focusLevels as Record<string, MediaFocusLevel>,
    triggerMoments: profile.triggerMoments as unknown as MediaTriggerMoment[],
    sources: profile.sources as SourceRef[] | null,
  }))

  const typedTimeline = timeline.map(entry => ({
    ...entry,
    sources: entry.sources as SourceRef[] | null,
  }))

  const typedEntries: CorpusEntryItem[] = entries.map(entry => ({
    id: entry.id,
    country: entry.country,
    publishedYear: entry.publishedYear,
    publishedMonth: entry.publishedMonth,
    publishedDay: entry.publishedDay,
    datePrecision: entry.datePrecision,
    title: entry.title,
    summary: entry.summary,
    url: entry.url,
    recordType: entry.recordType,
    verificationLevel: entry.verificationLevel,
    triggerLabel: entry.triggerLabel,
    sourceRefs: entry.sourceRefs as SourceRef[] | null,
    outlet: {
      id: entry.outlet.id,
      name: entry.outlet.name,
      country: entry.outlet.country,
      outletType: entry.outlet.outletType,
      url: entry.outlet.url,
    },
    sourceDoc: entry.sourceDoc
      ? {
          id: entry.sourceDoc.id,
          title: entry.sourceDoc.title,
          url: entry.sourceDoc.url,
        }
      : null,
    codings: entry.codings.map(coding => ({
      primaryTheme: coding.primaryTheme,
      secondaryThemes: coding.secondaryThemes,
      tone: coding.tone,
      frame: coding.frame,
      geography: coding.geography,
      actorTargets: coding.actorTargets,
      confidence: coding.confidence,
      triggerLabel: coding.triggerLabel,
      evidenceNote: coding.evidenceNote,
    })),
  }))

  const strongestCountry = [...typedProfiles]
    .sort(
      (left, right) =>
        right.yearlySignal.reduce((sum, value) => sum + value, 0) -
        left.yearlySignal.reduce((sum, value) => sum + value, 0),
    )[0]

  const topThemes = [...typedThemes]
    .map(theme => ({
      name: theme.name,
      score: typedProfiles.reduce(
        (sum, profile) => sum + focusWeight[profile.focusLevels[theme.id]],
        0,
      ),
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, 2)
    .map(theme => theme.name)

  const peakYears = typedTimeline
    .filter(entry => entry.intensity >= 4)
    .map(entry => entry.year)

  const themeCountMap = new Map<string, number>()
  const toneCountMap = new Map<string, number>()
  const outletTypeCountMap = new Map<string, number>()

  for (const outlet of outlets) {
    outletTypeCountMap.set(
      outlet.outletType,
      (outletTypeCountMap.get(outlet.outletType) ?? 0) + 1,
    )
  }

  for (const entry of typedEntries) {
    for (const coding of entry.codings) {
      themeCountMap.set(coding.primaryTheme, (themeCountMap.get(coding.primaryTheme) ?? 0) + 1)
      toneCountMap.set(coding.tone, (toneCountMap.get(coding.tone) ?? 0) + 1)
    }
  }

  const entryYears = new Set(typedEntries.map(entry => entry.publishedYear))
  const missingHistoricalYears = mediaYears.filter(year => !entryYears.has(year))
  const primaryVerifiedCount = typedEntries.filter(entry => entry.verificationLevel === 'primary').length
  const primaryVerifiedShare = typedEntries.length > 0
    ? Math.round((primaryVerifiedCount / typedEntries.length) * 100)
    : 0

  const coverageRows: CountryCoverageRow[] = COUNTRY_LIST.map(country => {
    const countryEntries = typedEntries.filter(entry => entry.country === country.code)
    const uniqueOutlets = new Set(countryEntries.map(entry => entry.outlet.id))
    const uniqueThemes = new Set(countryEntries.flatMap(entry => entry.codings.map(coding => coding.primaryTheme)))
    const primaryCount = countryEntries.filter(entry => entry.verificationLevel === 'primary').length
    const latestEntry = countryEntries[0]
    const status: CountryCoverageRow['status'] =
      countryEntries.length === 0 ? 'mangler' : countryEntries.length >= 3 ? 'arbeidsklar' : 'tynn'

    return {
      code: country.code,
      name: country.name,
      entryCount: countryEntries.length,
      outletCount: uniqueOutlets.size,
      primaryCount,
      themeCount: uniqueThemes.size,
      latestLabel: latestEntry ? formatPublicationLabel(latestEntry) : 'Ingen',
      status,
    }
  })

  const thinnestCountry = [...coverageRows].sort((left, right) => left.entryCount - right.entryCount)[0]
  const undercoveredCountries = coverageRows.filter(row => row.entryCount < 3)

  const missingPrimaryThemes = typedThemes
    .filter(theme => !themeCountMap.has(theme.id))
    .map(theme => theme.name)

  const latestCorpusEntries = typedEntries.slice(0, 6)

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-[28px] border border-stone-200 bg-[linear-gradient(135deg,rgba(250,250,249,1)_0%,rgba(245,245,244,1)_48%,rgba(236,253,245,1)_100%)] p-6 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.12),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(245,158,11,0.12),transparent_36%)]" />
        <div className="absolute -right-10 top-8 h-40 w-40 rounded-full border border-white/60 bg-white/40 blur-2xl" />

        <div className="relative max-w-4xl">
          <p className="text-xs uppercase tracking-[0.26em] text-stone-400">Media og narrativkart</p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight text-stone-900 sm:text-4xl">
            Medieoversikt for matsystemene per land, historisk spor 2016-2025
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-6 text-stone-600 sm:text-base">
            Siden leser fortsatt narrativer pa tvers av land, men viser na ogsaa et eget
            evidenskorpus med kodede treff, outlet-typer og verifikasjonsnivaa. Dermed blir det
            tydelig hva som er syntese, og hva som faktisk er granularisert materiale.
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-500">
            Den kvalitative profilen under er fortsatt et arbeidskart. Korpuset under viser
            startpunktet for en mer etterproevbar medieanalyse med land, aar, tema, tone og
            triggerlogikk.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="border-emerald-200/80 bg-emerald-50/60">
          <p className="text-xs uppercase tracking-wider text-emerald-700/70">Dekning</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-950">{typedProfiles.length} land</p>
          <p className="mt-1 text-xs text-emerald-800/70">Nordiske profiler med egne narrativspor</p>
        </Card>

        <Card className="border-stone-200 bg-white/90">
          <p className="text-xs uppercase tracking-wider text-stone-400">Tidsrom</p>
          <p className="mt-2 text-2xl font-semibold text-stone-900">
            {mediaYears[0]}-{mediaYears[mediaYears.length - 1]}
          </p>
          <p className="mt-1 text-xs text-stone-500">Bare hele historiske aar, ikke delvis 2026</p>
        </Card>

        <Card className="border-amber-200/80 bg-amber-50/60">
          <p className="text-xs uppercase tracking-wider text-amber-700/70">Tyngste spor</p>
          <p className="mt-2 text-lg font-semibold text-amber-950">{topThemes.join(' + ')}</p>
          <p className="mt-1 text-xs text-amber-800/70">Narrativer som gar igjen pa tvers av land</p>
        </Card>

        <Card className="border-sky-200/80 bg-sky-50/70">
          <p className="text-xs uppercase tracking-wider text-sky-700/70">Stoerst trykk</p>
          <p className="mt-2 text-2xl font-semibold text-sky-950">{strongestCountry?.name}</p>
          <p className="mt-1 text-xs text-sky-800/70">
            Mest sammenhengende diskusjonstrykk i perioden {peakYears[0]}-{peakYears[peakYears.length - 1]}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="border-stone-200 bg-white">
          <p className="text-xs uppercase tracking-wider text-stone-400">Granulert korpus</p>
          <p className="mt-2 text-2xl font-semibold text-stone-900">{typedEntries.length}</p>
          <p className="mt-1 text-xs text-stone-500">Kodede media entries i v2-laget</p>
        </Card>

        <Card className="border-stone-200 bg-white">
          <p className="text-xs uppercase tracking-wider text-stone-400">Outlets</p>
          <p className="mt-2 text-2xl font-semibold text-stone-900">{outlets.length}</p>
          <p className="mt-1 text-xs text-stone-500">Kilder fordelt pa myndighet, analyse og marked</p>
        </Card>

        <Card className="border-stone-200 bg-white">
          <p className="text-xs uppercase tracking-wider text-stone-400">Primaerandel</p>
          <p className="mt-2 text-2xl font-semibold text-stone-900">{primaryVerifiedShare}%</p>
          <p className="mt-1 text-xs text-stone-500">{primaryVerifiedCount} av {typedEntries.length} entries er primaerkilder</p>
        </Card>

        <Card className="border-stone-200 bg-white">
          <p className="text-xs uppercase tracking-wider text-stone-400">Tynnest dekning</p>
          <p className="mt-2 text-2xl font-semibold text-stone-900">{thinnestCountry?.name}</p>
          <p className="mt-1 text-xs text-stone-500">{thinnestCountry?.entryCount ?? 0} kodede entries akkurat na</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card title="Media evidence corpus v2">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="py-3 pr-4 text-left text-xs font-medium uppercase tracking-[0.18em] text-stone-400">Land</th>
                  <th className="py-3 pr-4 text-left text-xs font-medium uppercase tracking-[0.18em] text-stone-400">Entries</th>
                  <th className="py-3 pr-4 text-left text-xs font-medium uppercase tracking-[0.18em] text-stone-400">Outlets</th>
                  <th className="py-3 pr-4 text-left text-xs font-medium uppercase tracking-[0.18em] text-stone-400">Temaer</th>
                  <th className="py-3 pr-4 text-left text-xs font-medium uppercase tracking-[0.18em] text-stone-400">Primaer</th>
                  <th className="py-3 pr-4 text-left text-xs font-medium uppercase tracking-[0.18em] text-stone-400">Siste</th>
                  <th className="py-3 pr-0 text-left text-xs font-medium uppercase tracking-[0.18em] text-stone-400">Status</th>
                </tr>
              </thead>
              <tbody>
                {coverageRows.map(row => (
                  <tr key={row.code} className="border-b border-stone-100 last:border-0">
                    <td className="py-3 pr-4 font-medium text-stone-800">{row.name}</td>
                    <td className="py-3 pr-4 text-stone-600">{row.entryCount}</td>
                    <td className="py-3 pr-4 text-stone-600">{row.outletCount}</td>
                    <td className="py-3 pr-4 text-stone-600">{row.themeCount}</td>
                    <td className="py-3 pr-4 text-stone-600">{row.primaryCount}</td>
                    <td className="py-3 pr-4 text-stone-600">{row.latestLabel}</td>
                    <td className="py-3 pr-0">
                      <span className={`badge ${coverageClassName[row.status]}`}>{coverageLabel[row.status]}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Granularitetsgap">
          <div className="space-y-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Aar uten korpusdekning</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                {missingHistoricalYears.length > 0 ? missingHistoricalYears.join(', ') : 'Ingen hull i 2016-2025-vinduet'}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Temaer uten primaerkoding</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                {missingPrimaryThemes.length > 0 ? missingPrimaryThemes.join(', ') : 'Alle hovedtemaer er representert'}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Neste prioritering</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {undercoveredCountries.map(country => (
                  <span key={country.code} className={`badge ${coverageClassName[country.status]}`}>
                    {country.name}: {country.entryCount} entries
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Outletmix</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                {formatCountMap(outletTypeCountMap, normalizeLabel).join(' | ')}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Tonekoding</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                {formatCountMap(toneCountMap, normalizeLabel).join(' | ')}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card title="Siste kodede entries">
          <div className="space-y-4">
            {latestCorpusEntries.map(entry => (
              <CorpusEntryCard key={entry.id} entry={entry} themes={typedThemes} />
            ))}
          </div>
        </Card>

        <Card title="Hva v2 gir">
          <div className="space-y-4">
            <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4">
              <p className="text-sm font-semibold text-stone-800">Etterproevbar kobling mellom narrativ og evidens</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Hver entry kan spores til outlet, kilde, publiseringspresisjon, koding og verifikasjonsnivaa.
              </p>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4">
              <p className="text-sm font-semibold text-stone-800">Mer granular tidsserie</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Modellen skiller aar, maaned og dag, slik at vi kan bygge kvartals- og hendelsesspor uten a late som alle datoer er like presise.
              </p>
            </div>

            <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4">
              <p className="text-sm font-semibold text-stone-800">Bedre sammenligning pa tvers av land</p>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                Samme koding brukes na ogsaa for Island, slik at mediaflaten ikke lenger bryter med resten av nordisk datastruktur.
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Card title="Nordisk narrativpuls 2016-2025">
          <div className="space-y-4">
            {typedTimeline.map(entry => (
              <div key={entry.year} className="flex items-start gap-4">
                <div className="w-20 shrink-0 pt-0.5">
                  <span className="text-sm font-mono font-medium text-stone-900">{entry.year}</span>
                  <div className="mt-1.5 flex gap-1">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <span
                        key={`${entry.year}-${index}`}
                        className={`h-1.5 w-3 rounded-full ${
                          index < entry.intensity ? 'bg-emerald-500' : 'bg-stone-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="min-w-0 flex-1 border-b border-stone-100 pb-4 last:border-0">
                  <p className="text-sm font-medium text-stone-800">{entry.label}</p>
                  <p className="mt-1 text-xs leading-5 text-stone-500">{entry.note}</p>
                  {entry.sources && entry.sources.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {entry.sources.map(source => (
                        <SourceChip key={`${entry.year}-${source.label}`} source={source} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Hva som skal spores">
          <div className="space-y-4">
            {typedThemes.map(theme => (
              <div key={theme.id} className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4">
                <p className="text-sm font-semibold text-stone-800">{theme.name}</p>
                <p className="mt-1 text-sm leading-6 text-stone-500">{theme.description}</p>
                {theme.sources && theme.sources.length > 0 && (
                  <ExpandableSources sources={theme.sources} />
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Landprofiler">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          {typedProfiles.map(profile => (
            <CountryCard key={profile.id} profile={profile} themes={typedThemes} />
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card title="Fokusmatrise per land">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-stone-200">
                  <th className="py-3 pr-4 text-left text-xs font-medium uppercase tracking-[0.18em] text-stone-400">
                    Land
                  </th>
                  {typedThemes.map(theme => (
                    <th
                      key={theme.id}
                      className="py-3 pr-3 text-left text-xs font-medium uppercase tracking-[0.18em] text-stone-400"
                    >
                      {theme.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {typedProfiles.map(profile => (
                  <tr key={profile.id} className="border-b border-stone-100 last:border-0">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-stone-400">{profile.iso}</span>
                        <span className="font-medium text-stone-800">{profile.name}</span>
                      </div>
                    </td>
                    {typedThemes.map(theme => {
                      const level = profile.focusLevels[theme.id]
                      return (
                        <td key={`${profile.id}-${theme.id}`} className="py-3 pr-3">
                          <span className={`badge ${focusClassName[level]}`}>{focusLabel[level]}</span>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Metode og neste steg">
          <div className="space-y-5">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Bruk denne siden slik</p>
              <div className="mt-3 space-y-3">
                {mediaScanGuidance.map(item => (
                  <div key={item} className="flex gap-3 rounded-2xl border border-stone-200 bg-stone-50/70 p-4">
                    <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500" />
                    <p className="text-sm leading-6 text-stone-600">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-stone-400">Internt kildegrunnlag</p>
              <div className="mt-3 space-y-2">
                {mediaInternalSources.map(source => (
                  <div
                    key={source}
                    className="rounded-xl border border-stone-200 bg-white px-3 py-2 text-xs font-mono text-stone-500"
                  >
                    {source}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
