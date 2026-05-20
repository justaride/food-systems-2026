export const CITATION_READINESS_LEVELS = [
  'citable_external',
  'citable_with_note',
  'internal_context',
  'blocked_unsourced',
] as const

export type CitationReadinessLevel = (typeof CITATION_READINESS_LEVELS)[number]

const CITATION_READINESS_STRENGTH = [
  'blocked_unsourced',
  'internal_context',
  'citable_with_note',
  'citable_external',
] as const

const CITATION_READINESS_RANK = new Map<CitationReadinessLevel, number>(
  CITATION_READINESS_STRENGTH.map((level, index) => [level, index]),
)

export function normalizeCitationReadiness(input: unknown): CitationReadinessLevel {
  if (typeof input !== 'string') return 'blocked_unsourced'

  const normalized = input.trim().toLowerCase().replaceAll('-', '_')
  if (CITATION_READINESS_RANK.has(normalized as CitationReadinessLevel)) {
    return normalized as CitationReadinessLevel
  }

  return 'blocked_unsourced'
}

export function isExternallyCitable(input: unknown) {
  const level = normalizeCitationReadiness(input)
  return level === 'citable_external' || level === 'citable_with_note'
}

export function isBlockedForExternalUse(input: unknown) {
  return !isExternallyCitable(input)
}

export function compareCitationReadiness(a: unknown, b: unknown) {
  const levelA = normalizeCitationReadiness(a)
  const levelB = normalizeCitationReadiness(b)

  return CITATION_READINESS_RANK.get(levelA)! - CITATION_READINESS_RANK.get(levelB)!
}
