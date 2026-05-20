import { normalizeCitationReadiness, type CitationReadinessLevel } from './citation-status'
import { deriveVerificationStatus } from './citation-readiness'
import { hasDirectLocator, hasVerificationMetadata } from './source-citation-contract'

export type CitationAuditIssueCode =
  | 'missing_direct_locator'
  | 'missing_local_file'
  | 'missing_external_access_date'
  | 'stale_local_path'
  | 'missing_entity_link'
  | 'missing_claim_text'
  | 'external_ready_not_verified'

export type CitationAuditIssue = {
  code: CitationAuditIssueCode
  severity: 'blocking' | 'warning'
  message: string
  citationId?: string
  fieldCitationId?: string
  entityType?: string
  entityId?: string
  fieldPath?: string | null
}

export type AuditableSourceCitation = {
  id: string
  citationText?: string | null
  citationReadiness?: string | null
  verificationStatus?: string | null
  url?: string | null
  archivedUrl?: string | null
  localPath?: string | null
  documentId?: string | null
  sourceDocId?: string | null
  accessedAt?: Date | string | null
  verifiedAt?: Date | string | null
}

export type AuditableFieldCitation = {
  id: string
  citationId: string
  entityType: string
  entityId: string
  fieldPath?: string | null
  claimText?: string | null
}

export type CitationAuditOptions = {
  localPathExists?: (localPath: string) => boolean
  entityExists?: (entityType: string, entityId: string) => boolean
}

export type CitationCoverageInput = {
  sourceCitations: AuditableSourceCitation[]
  fieldCitations: AuditableFieldCitation[]
}

export type CitationAuditSummary = {
  sourceCitationTotal: number
  fieldCitationTotal: number
  readinessCounts: Record<CitationReadinessLevel, number>
  issues: CitationAuditIssue[]
  externalBlockingIssues: number
}

function hasText(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0
}

function hasNonLocalLocator(citation: AuditableSourceCitation) {
  return (
    hasText(citation.url) ||
    hasText(citation.archivedUrl) ||
    hasText(citation.documentId) ||
    hasText(citation.sourceDocId)
  )
}

function isExternallyReady(readiness: CitationReadinessLevel) {
  return readiness === 'citable_external' || readiness === 'citable_with_note'
}

function issue(input: CitationAuditIssue): CitationAuditIssue {
  return input
}

export function auditSourceCitation(
  citation: AuditableSourceCitation,
  options: CitationAuditOptions = {},
): CitationAuditIssue[] {
  const issues: CitationAuditIssue[] = []
  const readiness = normalizeCitationReadiness(citation.citationReadiness)
  const externalReady = isExternallyReady(readiness)

  const hasLocator = hasDirectLocator(citation)

  if (externalReady && !hasLocator) {
    issues.push(
      issue({
        code: 'missing_direct_locator',
        severity: 'blocking',
        citationId: citation.id,
        message: `SourceCitation ${citation.id} is external-ready but has no direct locator.`,
      }),
    )
  }

  if (externalReady && hasLocator && !hasVerificationMetadata(citation)) {
    issues.push(
      issue({
        code: 'missing_external_access_date',
        severity: readiness === 'citable_external' ? 'blocking' : 'warning',
        citationId: citation.id,
        message: `SourceCitation ${citation.id} is external-ready but lacks accessedAt or verifiedAt metadata.`,
      }),
    )
  }

  if (readiness === 'citable_external' && deriveVerificationStatus(citation) !== 'verified') {
    issues.push(
      issue({
        code: 'external_ready_not_verified',
        severity: 'blocking',
        citationId: citation.id,
        message: `SourceCitation ${citation.id} is citable_external but verificationStatus is not verified.`,
      }),
    )
  }

  if (citation.localPath && options.localPathExists && !options.localPathExists(citation.localPath)) {
    const localPathIsOnlyLocator = !hasNonLocalLocator(citation)
    issues.push(
      issue({
        code: 'missing_local_file',
        severity: externalReady && localPathIsOnlyLocator ? 'blocking' : 'warning',
        citationId: citation.id,
        message: `SourceCitation ${citation.id} cites a local path that does not resolve: ${citation.localPath}`,
      }),
    )
  }

  return issues
}

function needsClaimText(fieldCitation: AuditableFieldCitation) {
  const entityType = fieldCitation.entityType.toLowerCase()
  const fieldPath = fieldCitation.fieldPath?.toLowerCase() ?? ''

  if (fieldPath.includes('keyfindings')) return true
  if (fieldPath.includes('recommendations')) return true
  if (fieldPath.includes('description')) return true
  if (fieldPath.includes('summary')) return true
  if (entityType === 'report' && fieldPath.includes('relevance')) return true

  return false
}

export function auditFieldCitation(
  fieldCitation: AuditableFieldCitation,
  options: CitationAuditOptions = {},
): CitationAuditIssue[] {
  const issues: CitationAuditIssue[] = []

  if (options.entityExists && !options.entityExists(fieldCitation.entityType, fieldCitation.entityId)) {
    issues.push(
      issue({
        code: 'missing_entity_link',
        severity: 'blocking',
        fieldCitationId: fieldCitation.id,
        entityType: fieldCitation.entityType,
        entityId: fieldCitation.entityId,
        fieldPath: fieldCitation.fieldPath,
        message: `FieldCitation ${fieldCitation.id} points at a missing entity.`,
      }),
    )
  }

  if (needsClaimText(fieldCitation) && !hasText(fieldCitation.claimText)) {
    issues.push(
      issue({
        code: 'missing_claim_text',
        severity: 'blocking',
        fieldCitationId: fieldCitation.id,
        entityType: fieldCitation.entityType,
        entityId: fieldCitation.entityId,
        fieldPath: fieldCitation.fieldPath,
        message: `FieldCitation ${fieldCitation.id} needs claimText for narrative/report use.`,
      }),
    )
  }

  return issues
}

export function auditCitationCoverage(
  records: CitationCoverageInput,
  options: CitationAuditOptions = {},
): CitationAuditSummary {
  const readinessCounts: Record<CitationReadinessLevel, number> = {
    citable_external: 0,
    citable_with_note: 0,
    internal_context: 0,
    blocked_unsourced: 0,
  }
  const issues: CitationAuditIssue[] = []

  for (const citation of records.sourceCitations) {
    const readiness = normalizeCitationReadiness(citation.citationReadiness)
    readinessCounts[readiness] += 1

    const citationIssues = auditSourceCitation(citation, options)
    issues.push(...citationIssues)

    if (readiness === 'blocked_unsourced') {
      issues.push(
        issue({
          code: 'missing_direct_locator',
          severity: 'warning',
          citationId: citation.id,
          message: `SourceCitation ${citation.id} is blocked_unsourced and cannot be used externally.`,
        }),
      )
    }
  }

  for (const fieldCitation of records.fieldCitations) {
    issues.push(...auditFieldCitation(fieldCitation, options))
  }

  return {
    sourceCitationTotal: records.sourceCitations.length,
    fieldCitationTotal: records.fieldCitations.length,
    readinessCounts,
    issues,
    externalBlockingIssues: issues.filter((auditIssue) => auditIssue.severity === 'blocking')
      .length,
  }
}

export function formatCitationAuditSummary(summary: CitationAuditSummary) {
  return [
    'Citation Coverage',
    `  SourceCitation total: ${summary.sourceCitationTotal}`,
    `  citable_external: ${summary.readinessCounts.citable_external}`,
    `  citable_with_note: ${summary.readinessCounts.citable_with_note}`,
    `  internal_context: ${summary.readinessCounts.internal_context}`,
    `  blocked_unsourced: ${summary.readinessCounts.blocked_unsourced}`,
    `  FieldCitation total: ${summary.fieldCitationTotal}`,
    `  External blocking issues: ${summary.externalBlockingIssues}`,
  ].join('\n')
}
