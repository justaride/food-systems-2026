export type KonsernAuditInput = {
  hasControllingOwner: boolean
  ownershipEdgesWithSource: number
  ownershipEdgesTotal: number
  childrenWithLatestFinancial: number
  childrenTotal: number
  propertyCount: number
  relationshipCount: number
  daysSinceBrregRefresh: number | null
  maEventCount: number
  expectsMaActivity: boolean
}

export function computeQualityScore(input: KonsernAuditInput): number {
  let score = 0
  if (input.hasControllingOwner) score += 2
  if (input.ownershipEdgesTotal > 0 && input.ownershipEdgesWithSource === input.ownershipEdgesTotal) score += 2
  if (input.childrenTotal > 0 && input.childrenWithLatestFinancial === input.childrenTotal) score += 2
  if (input.propertyCount >= 1) score += 1
  if (input.relationshipCount >= 1) score += 1
  if (input.daysSinceBrregRefresh !== null && input.daysSinceBrregRefresh < 90) score += 1
  if (input.maEventCount >= 1 || !input.expectsMaActivity) score += 1
  return score
}
