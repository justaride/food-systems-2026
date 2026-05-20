import type { CitationReadinessLevel } from './citation-status'
import { normalizeCitationReadiness } from './citation-status'

export type CitationLocator = {
  url?: string | null
  archivedUrl?: string | null
  localPath?: string | null
  documentId?: string | null
  sourceDocId?: string | null
  fileHash?: string | null
}

export type SourceCitationInput = CitationLocator & {
  citationText?: string | null
  sourceClass?: unknown
  citationReadiness?: unknown
  verificationStatus?: unknown
  accessedAt?: Date | string | null
  verifiedAt?: Date | string | null
  pageRef?: string | null
}

export type FieldCitationInput = {
  citationId?: string | null
  entityType?: string | null
  entityId?: string | null
  fieldPath?: string | null
  claimText?: string | null
  confidence?: number | null
}

export type CitationValidationIssue = {
  code:
    | 'missing_direct_locator'
    | 'missing_verification_metadata'
    | 'missing_citation_text'
  message: string
}

function hasText(value: unknown) {
  return typeof value === 'string' ? value.trim().length > 0 : value != null
}

export function hasDirectLocator(input: CitationLocator) {
  return (
    hasText(input.url) ||
    hasText(input.archivedUrl) ||
    hasText(input.localPath) ||
    hasText(input.documentId) ||
    hasText(input.sourceDocId)
  )
}

export function hasLocalEvidence(input: CitationLocator) {
  return (
    hasText(input.localPath) ||
    hasText(input.documentId) ||
    hasText(input.sourceDocId) ||
    hasText(input.fileHash)
  )
}

export function hasVerificationMetadata(input: SourceCitationInput) {
  if (hasText(input.accessedAt) || hasText(input.verifiedAt)) return true

  return ['verified', 'partially_verified', 'human_verified', 'machine_verified'].includes(
    String(input.verificationStatus ?? '').trim(),
  )
}

export function validateSourceCitationInput(input: SourceCitationInput) {
  const issues: CitationValidationIssue[] = []
  const readiness = normalizeCitationReadiness(input.citationReadiness)

  if (
    (readiness === 'citable_external' || readiness === 'citable_with_note') &&
    !hasDirectLocator(input)
  ) {
    issues.push({
      code: 'missing_direct_locator',
      message:
        'External-ready citations require url, archivedUrl, localPath, documentId, or sourceDocId.',
    })
  }

  if (readiness === 'citable_external' && !hasVerificationMetadata(input)) {
    issues.push({
      code: 'missing_verification_metadata',
      message: 'citable_external requires accessedAt, verifiedAt, or verified status metadata.',
    })
  }

  if (
    (readiness === 'citable_external' || readiness === 'citable_with_note') &&
    !hasText(input.citationText)
  ) {
    issues.push({
      code: 'missing_citation_text',
      message: 'External-ready citations require citationText.',
    })
  }

  return issues
}

export type { CitationReadinessLevel }
