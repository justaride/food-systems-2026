import { createHash } from 'node:crypto'
import { assessCitationUse } from '@/lib/citations/external-citation-policy'
import { isQuarantinedSource } from '@/lib/source-quarantine'

export const EMBEDDING_MODEL = 'text-embedding-3-small'
export const EMBEDDING_DIMENSIONS = 1536
export const MAX_EMBEDDING_INPUT_CHARS = 8000
export const MAX_EMBEDDING_PILOT_SIZE = 20

const externallyProcessableProvenance = new Set([
  'official_primary',
  'external_primary',
  'external_publication',
  'external_report',
  'external_article',
  'peer_reviewed',
  'commissioned_report',
  'corporate_self_report',
  'advocacy_position',
])

export type EmbeddingCandidate = {
  id: string; slug: string; title: string; content: string; documentType: string | null
  embeddingPresent: boolean
  sourceDoc: { id: string; provenanceType: string } | null
  sourceCitations: Array<{
    sourceDocId: string | null; sourceClass: string; citationReadiness: string
    verificationStatus: string; url: string | null; archivedUrl: string | null
    accessedAt: Date | string | null
  }>
}

export type EmbeddingPlanRow = {
  id: string; slug: string; contentSha256: string; inputChars: number
  eligibility: 'eligible' | 'rejected'; reason: string
}

export function embeddingInput(candidate: Pick<EmbeddingCandidate, 'title' | 'content'>) {
  return `${candidate.title}\n\n${candidate.content}`
}

export function sha256(value: string) {
  return createHash('sha256').update(value, 'utf8').digest('hex')
}

export function planCandidate(candidate: EmbeddingCandidate): EmbeddingPlanRow {
  const input = embeddingInput(candidate)
  let reason = 'eligible_for_bounded_retrieval_pilot_only'
  if (candidate.embeddingPresent) reason = 'embedding_already_present'
  else if (isQuarantinedSource(candidate)) reason = 'quarantined_source'
  else if (!candidate.title.trim() || !candidate.content.trim()) reason = 'empty_title_or_content'
  else if (input.length > MAX_EMBEDDING_INPUT_CHARS) reason = 'input_too_long_no_truncation'
  else if (!candidate.sourceDoc) reason = 'missing_source_identity'
  else if (!externallyProcessableProvenance.has(candidate.sourceDoc.provenanceType)) reason = 'source_provenance_not_approved_for_external_processing'
  else if (!candidate.sourceCitations.some(citation => (
    citation.sourceDocId === candidate.sourceDoc?.id &&
    assessCitationUse(citation, 'external').allowedForAnswer
  ))) reason = 'missing_qualified_source_citation'

  return {
    id: candidate.id,
    slug: candidate.slug,
    contentSha256: sha256(input),
    inputChars: input.length,
    eligibility: reason === 'eligible_for_bounded_retrieval_pilot_only' ? 'eligible' : 'rejected',
    reason,
  }
}

export function assertBoundedSelection(ids: string[], limit: number | null) {
  if (ids.length === 0 && limit === null) throw new Error('Specify --id/--ids or --limit for a bounded pilot')
  if (limit !== null && (!Number.isInteger(limit) || limit < 1 || limit > MAX_EMBEDDING_PILOT_SIZE)) {
    throw new Error(`--limit must be an integer from 1 to ${MAX_EMBEDDING_PILOT_SIZE}`)
  }
  if (ids.length > MAX_EMBEDDING_PILOT_SIZE) throw new Error(`At most ${MAX_EMBEDDING_PILOT_SIZE} document IDs are allowed`)
}
