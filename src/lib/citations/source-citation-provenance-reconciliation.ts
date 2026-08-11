import { deriveCitationReadiness } from './citation-readiness'
import {
  compareCitationReadiness,
  normalizeCitationReadiness,
  type CitationReadinessLevel,
} from './citation-status'
import {
  normalizedSourceDocProvenance,
  sourceClassForSourceDocProvenance,
} from './source-doc-provenance'
import type { SourceDocProvenanceType } from '../types'

export const SOURCE_CITATION_PROVENANCE_PLAN_VERSION = 1

export type ReviewedSourceDocProvenance = {
  id: string
  provenanceType: Exclude<SourceDocProvenanceType, 'unknown'>
}

export const REVIEWED_SOURCE_DOC_PROVENANCE_REGISTRY_EXPECTED_COUNT = 197

export type ReviewedSourceDocProvenanceRegistryGroup = {
  name: string
  expectedCount: number
  rows: readonly ReviewedSourceDocProvenance[]
}

export function buildReviewedSourceDocProvenanceRegistry(
  groups: readonly ReviewedSourceDocProvenanceRegistryGroup[],
) {
  const seenGroupNames = new Set<string>()
  const byId = new Map<
    string,
    ReviewedSourceDocProvenance & { reviewedGroup: string }
  >()

  for (const group of groups) {
    if (!group.name.trim() || seenGroupNames.has(group.name)) {
      throw new Error(
        `Reviewed SourceDoc provenance registry has an invalid or duplicate group: ${group.name || '<missing>'}`,
      )
    }
    seenGroupNames.add(group.name)
    if (
      group.rows.length !== group.expectedCount ||
      new Set(group.rows.map((row) => row.id)).size !== group.rows.length
    ) {
      throw new Error(
        `Reviewed SourceDoc provenance group ${group.name} must contain exactly ${group.expectedCount} unique rows`,
      )
    }

    for (const row of group.rows) {
      if (!row.id.trim() || normalizedSourceDocProvenance(row.provenanceType) === 'unknown') {
        throw new Error(
          `Reviewed SourceDoc provenance group ${group.name} contains an invalid row: ${row.id || '<missing>'}`,
        )
      }
      const existing = byId.get(row.id)
      if (existing) {
        throw new Error(
          `Reviewed SourceDoc provenance registry overlaps at ${row.id}: ${existing.reviewedGroup}, ${group.name}`,
        )
      }
      byId.set(row.id, { ...row, reviewedGroup: group.name })
    }
  }

  if (byId.size !== REVIEWED_SOURCE_DOC_PROVENANCE_REGISTRY_EXPECTED_COUNT) {
    throw new Error(
      `Reviewed SourceDoc provenance registry must contain exactly ${REVIEWED_SOURCE_DOC_PROVENANCE_REGISTRY_EXPECTED_COUNT} unique rows`,
    )
  }

  return [...byId.values()]
    .sort((left, right) =>
      left.id.localeCompare(right.id, undefined, { numeric: true }),
    )
    .map(({ reviewedGroup: _reviewedGroup, ...row }) => row)
}

export type SourceDocProvenanceSnapshot = {
  id: string
  provenanceType?: unknown
  url?: string | null
  archivedUrl?: string | null
  documentId?: string | null
  accessedAt?: Date | string | null
}

export type SourceDocFieldCitationSnapshot = {
  id: string
  entityType: string
  entityId: string
}

export type SourceCitationProvenanceSnapshot = {
  id: string
  sourceDocId?: string | null
  sourceClass?: unknown
  citationReadiness?: unknown
  verificationStatus?: unknown
  citationText?: string | null
  url?: string | null
  archivedUrl?: string | null
  localPath?: string | null
  documentId?: string | null
  accessedAt?: Date | string | null
  verifiedAt?: Date | string | null
  updatedAt?: Date | string | null
  fieldCitationCount?: number
  fieldCitations?: SourceDocFieldCitationSnapshot[]
}

export type SourceCitationProvenanceConflictCode =
  | 'duplicate_reviewed_source_id'
  | 'duplicate_source_doc_id'
  | 'duplicate_source_citation_id'
  | 'missing_reviewed_source_doc'
  | 'reviewed_provenance_drift'
  | 'unreviewed_non_unknown_provenance'
  | 'citation_without_source_doc_link'
  | 'ambiguous_source_doc_link'
  | 'missing_linked_source_doc'
  | 'missing_citation_updated_at'

export type SourceCitationProvenanceConflict = {
  code: SourceCitationProvenanceConflictCode
  sourceDocId?: string
  citationId?: string
  detail: string
}

export type SourceCitationProvenanceUpdateReason =
  | 'unknown_fail_closed'
  | 'source_class_mismatch'
  | 'readiness_overclaim'

export type SourceCitationProvenanceUpdate = {
  citationId: string
  sourceDocId: string
  provenanceType: SourceDocProvenanceType
  reviewedSource: boolean
  expectedUpdatedAt: string
  expectedDirectSourceDocId: string | null
  expectedSourceClass: string
  expectedCitationReadiness: CitationReadinessLevel
  targetSourceClass: string
  targetCitationReadiness: CitationReadinessLevel
  readinessCeiling: CitationReadinessLevel
  sourceDocFieldCitationIds: string[]
  fieldCitationCount: number
  reasons: SourceCitationProvenanceUpdateReason[]
}

export type SourceCitationProvenancePlanSummary = {
  sourceDocsScanned: number
  reviewedSourceDocsExpected: number
  reviewedSourceDocsPresent: number
  linkedUnknownSourceDocs: number
  sourceCitationsScanned: number
  sourceDocFieldCitationsScanned: number
  allFieldCitationsScanned: number
  updates: number
  unchanged: number
  sourceClassChanges: number
  readinessDowngrades: number
  unknownFailClosedCitationUpdates: number
  reviewedCitationUpdates: number
  impactedSourceDocFieldCitations: number
  impactedFieldCitations: number
  conflicts: number
  byProvenance: Record<string, number>
  byProvenanceSourceDocFieldCitations: Record<string, number>
  byTransition: Record<string, number>
}

export type SourceCitationProvenanceReconciliationPlan = {
  version: typeof SOURCE_CITATION_PROVENANCE_PLAN_VERSION
  updates: SourceCitationProvenanceUpdate[]
  conflicts: SourceCitationProvenanceConflict[]
  summary: SourceCitationProvenancePlanSummary
}

function text(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function isoDate(value: Date | string | null | undefined) {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.valueOf()) ? null : date.toISOString()
}

function increment(counts: Record<string, number>, key: string) {
  counts[key] = (counts[key] ?? 0) + 1
}

function sourceDocLinkIds(citation: SourceCitationProvenanceSnapshot) {
  return [...new Set([
    text(citation.sourceDocId),
    ...(citation.fieldCitations ?? [])
      .filter(field => field.entityType === 'SourceDoc')
      .map(field => text(field.entityId)),
  ].filter((id): id is string => Boolean(id)))].sort()
}

function sourceDocFieldCitationIds(citation: SourceCitationProvenanceSnapshot) {
  return [...new Set((citation.fieldCitations ?? [])
    .filter(field => field.entityType === 'SourceDoc')
    .map(field => field.id))].sort()
}

function lowerReadiness(
  current: CitationReadinessLevel,
  ceiling: CitationReadinessLevel,
) {
  return compareCitationReadiness(current, ceiling) <= 0 ? current : ceiling
}

function readinessCeiling(
  citation: SourceCitationProvenanceSnapshot,
  sourceDoc: SourceDocProvenanceSnapshot,
  targetSourceClass: string,
) {
  // sourceDocId is an internal relation, not an independently inspectable
  // public locator. Use the citation locator plus the SourceDoc's documentary
  // locator and access metadata when calculating the evidence ceiling.
  return deriveCitationReadiness({
    citationText: citation.citationText,
    sourceClass: targetSourceClass,
    verificationStatus: citation.verificationStatus,
    url: text(citation.url) ?? text(sourceDoc.url),
    archivedUrl: text(citation.archivedUrl) ?? text(sourceDoc.archivedUrl),
    localPath: text(citation.localPath),
    documentId: text(citation.documentId) ?? text(sourceDoc.documentId),
    accessedAt: citation.accessedAt ?? sourceDoc.accessedAt,
    verifiedAt: citation.verifiedAt,
  })
}

function conflictSortKey(conflict: SourceCitationProvenanceConflict) {
  return [conflict.sourceDocId ?? '', conflict.citationId ?? '', conflict.code, conflict.detail].join('|')
}

export function buildSourceCitationProvenanceReconciliationPlan(
  sourceDocs: SourceDocProvenanceSnapshot[],
  citations: SourceCitationProvenanceSnapshot[],
  reviewedSources: ReviewedSourceDocProvenance[],
): SourceCitationProvenanceReconciliationPlan {
  const conflicts: SourceCitationProvenanceConflict[] = []
  const reviewedById = new Map<string, ReviewedSourceDocProvenance>()
  for (const reviewed of [...reviewedSources].sort((left, right) => left.id.localeCompare(right.id))) {
    if (reviewedById.has(reviewed.id)) {
      conflicts.push({
        code: 'duplicate_reviewed_source_id',
        sourceDocId: reviewed.id,
        detail: `Reviewed SourceDoc manifest repeats ${reviewed.id}`,
      })
      continue
    }
    reviewedById.set(reviewed.id, reviewed)
  }

  const sourceDocById = new Map<string, SourceDocProvenanceSnapshot>()
  for (const sourceDoc of [...sourceDocs].sort((left, right) => left.id.localeCompare(right.id))) {
    if (sourceDocById.has(sourceDoc.id)) {
      conflicts.push({
        code: 'duplicate_source_doc_id',
        sourceDocId: sourceDoc.id,
        detail: `Database SourceDoc snapshot repeats ${sourceDoc.id}`,
      })
      continue
    }
    sourceDocById.set(sourceDoc.id, sourceDoc)
  }

  for (const reviewed of reviewedById.values()) {
    const sourceDoc = sourceDocById.get(reviewed.id)
    if (!sourceDoc) {
      conflicts.push({
        code: 'missing_reviewed_source_doc',
        sourceDocId: reviewed.id,
        detail: `Reviewed SourceDoc is absent: ${reviewed.id}`,
      })
      continue
    }
    if (normalizedSourceDocProvenance(sourceDoc.provenanceType) !== reviewed.provenanceType) {
      conflicts.push({
        code: 'reviewed_provenance_drift',
        sourceDocId: reviewed.id,
        detail: `Reviewed provenance drifted for ${reviewed.id}`,
      })
    }
  }

  const updates: SourceCitationProvenanceUpdate[] = []
  const seenCitationIds = new Set<string>()
  let unchanged = 0
  let sourceCitationsScanned = 0
  let sourceDocFieldCitationsScanned = 0
  let allFieldCitationsScanned = 0
  const linkedUnknownSourceIds = new Set<string>()
  const byProvenance: Record<string, number> = {}
  const byProvenanceSourceDocFieldCitations: Record<string, number> = {}
  const byTransition: Record<string, number> = {}

  for (const citation of [...citations].sort((left, right) => left.id.localeCompare(right.id))) {
    sourceCitationsScanned += 1
    const linkedFieldIds = sourceDocFieldCitationIds(citation)
    sourceDocFieldCitationsScanned += linkedFieldIds.length
    allFieldCitationsScanned += Math.max(citation.fieldCitationCount ?? 0, linkedFieldIds.length)

    if (seenCitationIds.has(citation.id)) {
      conflicts.push({
        code: 'duplicate_source_citation_id',
        citationId: citation.id,
        detail: `Database SourceCitation snapshot repeats ${citation.id}`,
      })
      continue
    }
    seenCitationIds.add(citation.id)

    const linkedSourceDocIds = sourceDocLinkIds(citation)
    if (linkedSourceDocIds.length === 0) {
      conflicts.push({
        code: 'citation_without_source_doc_link',
        citationId: citation.id,
        detail: `SourceCitation has no direct or FieldCitation SourceDoc link: ${citation.id}`,
      })
      continue
    }
    if (linkedSourceDocIds.length !== 1) {
      conflicts.push({
        code: 'ambiguous_source_doc_link',
        citationId: citation.id,
        detail: `SourceCitation links multiple SourceDocs: ${citation.id} -> ${linkedSourceDocIds.join(', ')}`,
      })
      continue
    }

    const sourceDocId = linkedSourceDocIds[0]!
    const sourceDoc = sourceDocById.get(sourceDocId)
    if (!sourceDoc) {
      conflicts.push({
        code: 'missing_linked_source_doc',
        sourceDocId,
        citationId: citation.id,
        detail: `Linked SourceDoc is absent: ${citation.id} -> ${sourceDocId}`,
      })
      continue
    }

    const provenanceType = normalizedSourceDocProvenance(sourceDoc.provenanceType)
    const reviewed = reviewedById.get(sourceDocId)
    if (!reviewed && provenanceType !== 'unknown') {
      conflicts.push({
        code: 'unreviewed_non_unknown_provenance',
        sourceDocId,
        citationId: citation.id,
        detail: `Non-unknown provenance is outside the reviewed manifest: ${sourceDocId}`,
      })
      continue
    }
    if (reviewed && provenanceType !== reviewed.provenanceType) {
      // The source-level conflict was already recorded. Do not derive a write
      // from the drifted row.
      continue
    }

    increment(byProvenance, provenanceType)
    byProvenanceSourceDocFieldCitations[provenanceType] =
      (byProvenanceSourceDocFieldCitations[provenanceType] ?? 0) + linkedFieldIds.length
    if (provenanceType === 'unknown') linkedUnknownSourceIds.add(sourceDocId)

    const targetSourceClass = sourceClassForSourceDocProvenance(provenanceType)
    const currentSourceClass = text(citation.sourceClass) ?? 'unknown'
    const currentReadiness = normalizeCitationReadiness(citation.citationReadiness)
    const ceiling = readinessCeiling(citation, sourceDoc, targetSourceClass)
    const targetReadiness = lowerReadiness(currentReadiness, ceiling)
    const reasons: SourceCitationProvenanceUpdateReason[] = []

    if (
      provenanceType === 'unknown' &&
      (currentSourceClass !== 'unknown' || currentReadiness !== 'blocked_unsourced')
    ) {
      reasons.push('unknown_fail_closed')
    }
    if (currentSourceClass !== targetSourceClass) reasons.push('source_class_mismatch')
    if (currentReadiness !== targetReadiness) reasons.push('readiness_overclaim')

    if (reasons.length === 0) {
      unchanged += 1
      continue
    }

    const expectedUpdatedAt = isoDate(citation.updatedAt)
    if (!expectedUpdatedAt) {
      conflicts.push({
        code: 'missing_citation_updated_at',
        sourceDocId,
        citationId: citation.id,
        detail: `SourceCitation CAS snapshot lacks updatedAt: ${citation.id}`,
      })
      continue
    }

    const transition = `${currentSourceClass}/${currentReadiness} -> ${targetSourceClass}/${targetReadiness}`
    increment(byTransition, transition)
    updates.push({
      citationId: citation.id,
      sourceDocId,
      provenanceType,
      reviewedSource: Boolean(reviewed),
      expectedUpdatedAt,
      expectedDirectSourceDocId: text(citation.sourceDocId),
      expectedSourceClass: currentSourceClass,
      expectedCitationReadiness: currentReadiness,
      targetSourceClass,
      targetCitationReadiness: targetReadiness,
      readinessCeiling: ceiling,
      sourceDocFieldCitationIds: linkedFieldIds,
      fieldCitationCount: Math.max(citation.fieldCitationCount ?? 0, linkedFieldIds.length),
      reasons,
    })
  }

  const sortedUpdates = updates.sort((left, right) =>
    left.sourceDocId.localeCompare(right.sourceDocId, undefined, { numeric: true }) ||
    left.citationId.localeCompare(right.citationId),
  )
  const sortedConflicts = conflicts.sort((left, right) =>
    conflictSortKey(left).localeCompare(conflictSortKey(right)),
  )

  return {
    version: SOURCE_CITATION_PROVENANCE_PLAN_VERSION,
    updates: sortedUpdates,
    conflicts: sortedConflicts,
    summary: {
      sourceDocsScanned: sourceDocById.size,
      reviewedSourceDocsExpected: reviewedById.size,
      reviewedSourceDocsPresent: [...reviewedById.keys()].filter(id => sourceDocById.has(id)).length,
      linkedUnknownSourceDocs: linkedUnknownSourceIds.size,
      sourceCitationsScanned,
      sourceDocFieldCitationsScanned,
      allFieldCitationsScanned,
      updates: sortedUpdates.length,
      unchanged,
      sourceClassChanges: sortedUpdates.filter(update => update.expectedSourceClass !== update.targetSourceClass).length,
      readinessDowngrades: sortedUpdates.filter(update => update.expectedCitationReadiness !== update.targetCitationReadiness).length,
      unknownFailClosedCitationUpdates: sortedUpdates.filter(update => update.reasons.includes('unknown_fail_closed')).length,
      reviewedCitationUpdates: sortedUpdates.filter(update => update.reviewedSource).length,
      impactedSourceDocFieldCitations: sortedUpdates.reduce((sum, update) => sum + update.sourceDocFieldCitationIds.length, 0),
      impactedFieldCitations: sortedUpdates.reduce((sum, update) => sum + update.fieldCitationCount, 0),
      conflicts: sortedConflicts.length,
      byProvenance: Object.fromEntries(Object.entries(byProvenance).sort()),
      byProvenanceSourceDocFieldCitations: Object.fromEntries(
        Object.entries(byProvenanceSourceDocFieldCitations).sort(),
      ),
      byTransition: Object.fromEntries(Object.entries(byTransition).sort()),
    },
  }
}

export function sourceCitationProvenancePlanContract(
  plan: SourceCitationProvenanceReconciliationPlan,
) {
  return {
    version: plan.version,
    conflicts: plan.conflicts,
    updates: plan.updates,
  }
}
