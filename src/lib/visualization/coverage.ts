export type CoverageLevel = 'complete' | 'partial' | 'staging' | 'unknown'

export type CoverageSummary = {
  level: CoverageLevel
  label: string
  note: string
}

export const coverageLevelClassName: Record<CoverageLevel, string> = {
  complete: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  partial: 'border-sky-200 bg-sky-50 text-sky-700',
  staging: 'border-amber-200 bg-amber-50 text-amber-800',
  unknown: 'border-stone-200 bg-stone-50 text-stone-600',
}
