import type { GeographicScope, TemporalCoverage, VerificationCoverage, VerificationRollup } from './types'

export const NORDIC_SET = ['NO', 'SE', 'DK', 'FI', 'IS'] as const

export function coversNordic(countries: string[]): boolean {
  const set = new Set(countries.map((c) => c.toUpperCase()))
  return NORDIC_SET.every((c) => set.has(c))
}

export function classifyTemporal(years: number[], dominanceThreshold = 0.95): TemporalCoverage {
  const valid = years.filter((y) => Number.isFinite(y))
  if (valid.length === 0) return { kind: 'unknown' }

  const counts = new Map<number, number>()
  for (const y of valid) counts.set(y, (counts.get(y) ?? 0) + 1)
  const uniq = [...counts.keys()].sort((a, b) => a - b)

  if (uniq.length === 1) return { kind: 'snapshot', year: uniq[0] }

  const [domYear, domCount] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]
  if (domCount / valid.length >= dominanceThreshold) return { kind: 'snapshot', year: domYear }

  const span = uniq[uniq.length - 1] - uniq[0] + 1
  if (span === uniq.length && uniq.length >= 5) {
    return { kind: 'time_series', from: uniq[0], to: uniq[uniq.length - 1], cadence: 'yearly' }
  }
  return { kind: 'multi_year', years: uniq }
}

export function deriveGeographicScope(countries: string[], presentedAs: 'no' | 'nordic'): GeographicScope {
  const uniq = [...new Set(countries.map((c) => c.toUpperCase()))].sort()
  return {
    countries: uniq,
    presentedAs,
    noAsNordicProxy: presentedAs === 'nordic' && !coversNordic(uniq),
  }
}

export type VerificationCounts = {
  verified: number
  humanVerified: number
  machineVerified: number
  needsReview: number
  total: number
}

export function bucketVerification(statusCounts: Record<string, number>): VerificationCounts {
  let verified = 0
  let humanVerified = 0
  let machineVerified = 0
  let needsReview = 0
  let total = 0
  for (const [status, n] of Object.entries(statusCounts)) {
    total += n
    const s = (status ?? '').toLowerCase()
    if (s === 'verified') verified += n
    else if (s === 'human_verified') humanVerified += n
    else if (s === 'machine_verified') machineVerified += n
    else needsReview += n
  }
  return { verified, humanVerified, machineVerified, needsReview, total }
}

export function rollupVerification(counts: VerificationCounts, humanGradeThreshold = 0.8): VerificationCoverage {
  const humanVerified = counts.verified + counts.humanVerified
  const pct = counts.total > 0 ? humanVerified / counts.total : 0
  let rollup: VerificationRollup
  if (counts.total === 0) rollup = 'needs_review'
  else if (pct >= humanGradeThreshold) rollup = 'human_grade'
  else if (counts.machineVerified / counts.total >= 0.5) rollup = 'machine_grade'
  else if (counts.needsReview / counts.total >= 0.5) rollup = 'needs_review'
  else rollup = 'mixed'
  return {
    total: counts.total,
    humanVerified,
    machineVerified: counts.machineVerified,
    needsReview: counts.needsReview,
    humanVerifiedPct: Math.round(pct * 1000) / 10,
    rollup,
  }
}
