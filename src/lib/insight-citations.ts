export type InsightCitationInput = {
  source: string
  sourceLabel?: string | null
  primaryCitationId?: string | null
}

export type NormalizedInsightCitationFields = {
  source: string
  sourceLabel: string
  primaryCitationId: string | null
}

export function normalizeInsightCitationFields(
  input: InsightCitationInput,
): NormalizedInsightCitationFields {
  return {
    source: input.source,
    sourceLabel: input.sourceLabel?.trim() || input.source,
    primaryCitationId: input.primaryCitationId?.trim() || null,
  }
}
