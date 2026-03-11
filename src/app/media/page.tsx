'use client'

import { Card } from '@/components/ui/Card'
import { SourceChip } from '@/components/ui/SourceChip'
import { ExpandableSources } from '@/components/ui/ExpandableSources'
import {
  mediaCountryProfiles,
  mediaInternalSources,
  mediaScanGuidance,
  mediaThemes,
  mediaTimeline,
  mediaYears,
  type MediaCountryProfile,
  type MediaFocusLevel,
} from '@/lib/data/media-landscape'

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

function CountryCard({ profile }: { profile: MediaCountryProfile }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-5 shadow-sm shadow-stone-900/[0.03]">
      <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${countryAccentClass[profile.iso]}`} />

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
          {mediaThemes.map(theme => {
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
              <div key={`${profile.id}-${moment.year}`}>
                <div className="flex gap-3 text-sm text-stone-600">
                  <span className="font-mono text-stone-400">{moment.year}</span>
                  <span>{moment.label}</span>
                </div>
                {moment.sources && moment.sources.length > 0 && (
                  <div className="ml-12 mt-1 flex flex-wrap gap-1.5">
                    {moment.sources.map(source => (
                      <SourceChip key={source.label} source={source} />
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

export default function MediaPage() {
  const strongestCountry = [...mediaCountryProfiles]
    .sort(
      (left, right) =>
        right.yearlySignal.reduce((sum, value) => sum + value, 0) -
        left.yearlySignal.reduce((sum, value) => sum + value, 0),
    )[0]

  const topThemes = [...mediaThemes]
    .map(theme => ({
      name: theme.name,
      score: mediaCountryProfiles.reduce(
        (sum, profile) => sum + focusWeight[profile.focusLevels[theme.id]],
        0,
      ),
    }))
    .sort((left, right) => right.score - left.score)
    .slice(0, 2)
    .map(theme => theme.name)

  const peakYears = mediaTimeline
    .filter(entry => entry.intensity >= 4)
    .map(entry => entry.year)

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
            Egen dashboardside for a lese hvordan matsystemene har blitt omtalt i offentligheten:
            hvilke land som har hatt hoyest trykk, hvilke diskusjoner som dominerer, og hvor
            fokus har flyttet seg fra klima og innovasjon til prispress, markedsmakt og
            beredskap.
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-500">
            Dette er en kvalitativ narrativprofil bygget fra interne researchnotater. Den skal
            brukes som arbeidskart og kalibreres mot faktiske mediesok og artikkeltreff i neste
            fase.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Card className="border-emerald-200/80 bg-emerald-50/60">
          <p className="text-xs uppercase tracking-wider text-emerald-700/70">Dekning</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-950">{mediaCountryProfiles.length} land</p>
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <Card title="Nordisk narrativpuls 2016-2025">
          <div className="space-y-4">
            {mediaTimeline.map(entry => (
              <div key={entry.year} className="flex gap-4 items-start">
                <div className="shrink-0 w-20 pt-0.5">
                  <span className="text-sm font-mono font-medium text-stone-900">{entry.year}</span>
                  <div className="flex gap-1 mt-1.5">
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
                <div className="flex-1 min-w-0 pb-4 border-b border-stone-100 last:border-0">
                  <p className="text-sm font-medium text-stone-800">{entry.label}</p>
                  <p className="mt-1 text-xs leading-5 text-stone-500">{entry.note}</p>
                  {entry.sources && entry.sources.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {entry.sources.map(source => (
                        <SourceChip key={source.label} source={source} />
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
            {mediaThemes.map(theme => (
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
          {mediaCountryProfiles.map(profile => (
            <CountryCard key={profile.id} profile={profile} />
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
                  {mediaThemes.map(theme => (
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
                {mediaCountryProfiles.map(profile => (
                  <tr key={profile.id} className="border-b border-stone-100 last:border-0">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-stone-400">{profile.iso}</span>
                        <span className="font-medium text-stone-800">{profile.name}</span>
                      </div>
                    </td>
                    {mediaThemes.map(theme => {
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
