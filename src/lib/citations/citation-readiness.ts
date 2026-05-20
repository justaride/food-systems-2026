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

function isInternalSourceClass(sourceClass: string) {
  return ['internal_synthesis', 'synthesis', 'internal_construct'].includes(sourceClass)
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
  const explicitReadiness = normalizeCitationReadiness(input.citationReadiness)
  if (input.citationReadiness && explicitReadiness !== 'blocked_unsourced') return explicitReadiness

  const sourceClass = normalizedSourceClass(input)
  if (['legacy_unsourced'].includes(sourceClass)) return 'blocked_unsourced'
  if (isInternalSourceClass(sourceClass)) return 'internal_context'
  if (!hasDirectLocator(input)) return 'blocked_unsourced'
  if (!hasVerificationMetadata(input)) return 'citable_with_note'

  if (isPrimaryLikeSourceClass(sourceClass)) return 'citable_external'
  if (sourceClass === 'secondary') return 'citable_with_note'

  return 'citable_with_note'
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
    return `${readiness}: internal synthesis is not documentary evidence`
  }

  if (readiness === 'citable_with_note') {
    return `${readiness}: usable only with source or method caveat`
  }

  return `${readiness}: external citation requirements satisfied`
}

export function mergeReadinessForCompositeClaim(citations: SourceCitationInput[]) {
  if (citations.length === 0) return 'blocked_unsourced'

  const readinessLevels = citations.map(citation =>
    citation.citationReadiness
      ? normalizeCitationReadiness(citation.citationReadiness)
      : deriveCitationReadiness(citation),
  )

  return readinessLevels
    .slice(1)
    .reduce<CitationReadinessLevel>(
      (weakest, readiness) =>
        compareCitationReadiness(readiness, weakest) < 0 ? readiness : weakest,
      readinessLevels[0],
    )
}
