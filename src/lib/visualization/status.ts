import type { EvidenceStatus, ResearchEvidenceStatus } from './types'

type EvidenceStatusConfig = {
  label: string
  shortLabel: string
  description: string
  className: string
}

type ResearchEvidenceStatusConfig = {
  label: string
  shortLabel: string
  description: string
  className: string
  kiUsage: 'cite_directly' | 'cite_with_underlying_sources' | 'warn_user' | 'background_only' | 'exclude'
}

export const evidenceStatusOrder: EvidenceStatus[] = ['observed', 'estimated', 'proxy', 'illustrative']

export const evidenceStatusConfig: Record<EvidenceStatus, EvidenceStatusConfig> = {
  observed: {
    label: 'Observert',
    shortLabel: 'Observed',
    description: 'Direkte observert eller importert data.',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  },
  estimated: {
    label: 'Estimert',
    shortLabel: 'Estimated',
    description: 'Beregnet med stabil metode og eksplisitte forbehold.',
    className: 'border-sky-200 bg-sky-50 text-sky-700',
  },
  proxy: {
    label: 'Proxy',
    shortLabel: 'Proxy',
    description: 'Indirekte indikator som ikke er en direkte måling av fenomenet.',
    className: 'border-amber-200 bg-amber-50 text-amber-800',
  },
  illustrative: {
    label: 'Illustrativ',
    shortLabel: 'Illustrative',
    description: 'Pedagogisk modell eller forklaringslag, ikke beslutningsdata.',
    className: 'border-rose-200 bg-rose-50 text-rose-700',
  },
}

export function getEvidenceStatusConfig(status: EvidenceStatus): EvidenceStatusConfig {
  return evidenceStatusConfig[status]
}

export const researchEvidenceStatusOrder: ResearchEvidenceStatus[] = [
  'validated',
  'primary_snapshot',
  'proxy_model',
  'local_research_needs_primary_check',
  'missing',
]

export const researchEvidenceStatusConfig: Record<ResearchEvidenceStatus, ResearchEvidenceStatusConfig> = {
  validated: {
    label: 'Validert',
    shortLabel: 'Validated',
    description: 'Primaerkilde med locator. Kan siteres direkte i ekstern publikasjon.',
    className: 'border-emerald-200 bg-emerald-50 text-emerald-800',
    kiUsage: 'cite_directly',
  },
  primary_snapshot: {
    label: 'Primærsnapshot',
    shortLabel: 'Primary snapshot',
    description: 'Primaerkilde med metodeforbehold. Kan brukes i rapport med underliggende kildehenvisning.',
    className: 'border-sky-200 bg-sky-50 text-sky-800',
    kiUsage: 'cite_with_underlying_sources',
  },
  proxy_model: {
    label: 'Proxy/modell',
    shortLabel: 'Proxy model',
    description: 'Modellert eller indirekte indikator. Kan brukes analytisk, men ikke som observert fakta.',
    className: 'border-amber-200 bg-amber-50 text-amber-800',
    kiUsage: 'warn_user',
  },
  local_research_needs_primary_check: {
    label: 'Trenger primærsjekk',
    shortLabel: 'Needs check',
    description: 'Intern hypotese eller arbeidsgrunnlag. Skal ikke brukes som primaerbevis foer ekstern kilde er bekreftet.',
    className: 'border-orange-200 bg-orange-50 text-orange-800',
    kiUsage: 'background_only',
  },
  missing: {
    label: 'Mangler',
    shortLabel: 'Missing',
    description: 'Ingen kilde tilgjengelig. Skal vises som gap, ikke fylles med antakelser.',
    className: 'border-rose-200 bg-rose-50 text-rose-800',
    kiUsage: 'exclude',
  },
}

export function getResearchEvidenceStatusConfig(status: ResearchEvidenceStatus): ResearchEvidenceStatusConfig {
  return researchEvidenceStatusConfig[status]
}
