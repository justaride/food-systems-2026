import type { CoverageProfile, TemporalCoverage } from './types'

export type ChipTone = 'neutral' | 'good' | 'warn' | 'bad'
export type Chip = { label: string; tone: ChipTone; title?: string }
export type CoverageBadgeModel = { temporal: Chip; geo: Chip; verification: Chip }

function temporalChip(t: TemporalCoverage): Chip {
  switch (t.kind) {
    case 'snapshot':
      return { label: `${t.year} · øyeblikksbilde`, tone: 'warn', title: 'Enkeltår — ikke en tidsserie' }
    case 'multi_year':
      return { label: `${t.years[0]}–${t.years[t.years.length - 1]} · flere år`, tone: 'neutral' }
    case 'time_series':
      return { label: `${t.from}–${t.to} · tidsserie`, tone: 'good' }
    case 'unknown':
      return { label: 'ukjent periode', tone: 'bad' }
  }
}

export function coverageBadgeModel(profile: CoverageProfile): CoverageBadgeModel {
  const g = profile.geographic
  const geo: Chip = g.noAsNordicProxy
    ? { label: 'NO → nordisk ⚠', tone: 'bad', title: 'Kun norske data presentert som nordisk' }
    : g.countries.length >= 5
      ? { label: `Norden (${g.countries.length})`, tone: 'good' }
      : { label: g.countries.join('/') || 'ukjent', tone: g.countries.length <= 1 ? 'warn' : 'neutral' }

  const v = profile.verification
  const verification: Chip =
    v.total === 0
      ? {
          label: 'ikke sporet',
          tone: 'neutral',
          title: 'Verifisering spores ikke for dette datasettet (0 rader).',
        }
      : {
          label: `${v.humanVerifiedPct}% verifisert`,
          tone: v.rollup === 'human_grade' ? 'good' : 'warn',
          title: `Andel poster en person har kvalitetssjekket: ${v.humanVerified} av ${v.total}.`,
        }

  return { temporal: temporalChip(profile.temporal), geo, verification }
}
