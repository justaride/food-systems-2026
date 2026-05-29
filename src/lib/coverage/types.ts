export type TemporalCoverage =
  | { kind: 'snapshot'; year: number }
  | { kind: 'multi_year'; years: number[] }
  | { kind: 'time_series'; from: number; to: number; cadence: 'monthly' | 'yearly' }
  | { kind: 'unknown' }

export type GeographicScope = {
  countries: string[]
  presentedAs: 'no' | 'nordic'
  noAsNordicProxy: boolean
}

export type VerificationRollup = 'human_grade' | 'machine_grade' | 'needs_review' | 'mixed'

export type VerificationCoverage = {
  total: number
  humanVerified: number
  machineVerified: number
  needsReview: number
  humanVerifiedPct: number
  rollup: VerificationRollup
}

export type CoverageProfile = {
  datasetId: string
  label: string
  temporal: TemporalCoverage
  geographic: GeographicScope
  verification: VerificationCoverage
  sourceClass?: string // speiler Prisma SourceClass
  computedAt: string
  computedEnv: 'prod' | 'local'
}

export type AssertedScope = {
  datasetId: string
  geo?: 'no' | 'nordic'
  temporal?: 'point' | 'trend'
  verified?: boolean
}

export type CoverageClaim = {
  ref: string
  assertedScope: AssertedScope
}

export type DatasetSpec = {
  id: string
  label: string
  model: 'subsidy' | 'deliveryVolume' | 'companyFinancial' | 'countryMetric'
  presentedAs: 'no' | 'nordic'
  fixedCountries?: string[] // for modeller uten meningsfull country-kolonne
  metricType?: string // filter for countryMetric
}
