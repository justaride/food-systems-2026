import {
  compareCitationReadiness,
  normalizeCitationReadiness,
  type CitationReadinessLevel,
} from './citation-status'
import {
  hasDirectLocator,
  hasVerificationMetadata,
  type SourceCitationInput,
} from './source-citation-contract'

export type DerivedVerificationStatus = 'verified' | 'partially_verified' | 'needs_review' | 'failed'

function normalizedSourceClass(input: SourceCitationInput) {
  return String(input.sourceClass ?? 'unknown').trim()
}

export function isInternalSourceClass(sourceClass: string) {
  return ['internal_primary', 'internal_synthesis', 'synthesis', 'internal_construct'].includes(sourceClass)
}

function isPrimaryLikeSourceClass(sourceClass: string) {
  return ['primary', 'dataset', 'registry_snapshot'].includes(sourceClass)
}

export function deriveVerificationStatus(input: SourceCitationInput): DerivedVerificationStatus {
  const status = String(input.verificationStatus ?? '').trim()

  if (['verified', 'human_verified', 'machine_verified'].includes(status)) return 'verified'
  if (status === 'partially_verified') return 'partially_verified'
  if (['failed', 'disputed', 'rejected'].includes(status)) return 'failed'
  if (input.verifiedAt) return 'verified'

  return 'needs_review'
}

export function deriveCitationReadiness(input: SourceCitationInput): CitationReadinessLevel {
  const sourceClass = normalizedSourceClass(input)
  if (['legacy_unsourced'].includes(sourceClass)) return 'blocked_unsourced'
  if (sourceClass === 'unknown') return 'blocked_unsourced'
  if (isInternalSourceClass(sourceClass)) return 'internal_context'
  if (!hasDirectLocator(input)) return 'blocked_unsourced'

  const evidenceMaximum: CitationReadinessLevel = !hasVerificationMetadata(input)
    ? 'citable_with_note'
    : isPrimaryLikeSourceClass(sourceClass)
      ? 'citable_external'
      : 'citable_with_note'

  const explicitReadiness = normalizeCitationReadiness(input.citationReadiness)
  if (input.citationReadiness && explicitReadiness !== 'blocked_unsourced') {
    // Stored readiness may preserve a deliberate downgrade, but it can never
    // upgrade beyond what source class, locator, and verification metadata
    // support. Explicitly blocked rows are re-derived by refresh workflows.
    return compareCitationReadiness(explicitReadiness, evidenceMaximum) < 0
      ? explicitReadiness
      : evidenceMaximum
  }

  return evidenceMaximum
}

export function explainCitationReadiness(input: SourceCitationInput) {
  const readiness = deriveCitationReadiness(input)
  const sourceClass = normalizedSourceClass(input)

  if (!hasDirectLocator(input) && !isInternalSourceClass(sourceClass)) {
    return `${readiness}: missing direct locator`
  }

  if (
    readiness === 'citable_with_note' &&
    hasDirectLocator(input) &&
    !hasVerificationMetadata(input)
  ) {
    return `${readiness}: direct locator present; verification metadata missing`
  }

  if (readiness === 'internal_context') {
    return sourceClass === 'internal_primary'
      ? `${readiness}: internal primary evidence is documentary but not approved for external citation`
      : `${readiness}: internal synthesis or construct is not independent documentary evidence`
  }

  if (readiness === 'citable_with_note') {
    return `${readiness}: usable only with source or method caveat`
  }

  return `${readiness}: external citation requirements satisfied`
}

export function mergeReadinessForCompositeClaim(citations: SourceCitationInput[]) {
  if (citations.length === 0) return 'blocked_unsourced'

  const readinessLevels = citations.map(citation => {
    const carriesEvidenceContract = [
      citation.sourceClass,
      citation.url,
      citation.archivedUrl,
      citation.localPath,
      citation.documentId,
      citation.sourceDocId,
      citation.accessedAt,
      citation.verifiedAt,
      citation.verificationStatus,
    ].some(value => value !== undefined && value !== null && value !== '')

    return carriesEvidenceContract
      ? deriveCitationReadiness(citation)
      : normalizeCitationReadiness(citation.citationReadiness)
  })

  return readinessLevels
    .slice(1)
    .reduce<CitationReadinessLevel>(
      (weakest, readiness) =>
        compareCitationReadiness(readiness, weakest) < 0 ? readiness : weakest,
      readinessLevels[0],
    )
}
