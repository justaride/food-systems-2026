import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  PINNED_ORPHAN_DOCUMENT_FIELD_CITATION_MANIFEST_SHA256,
  canonicalJson,
  orphanDocumentFieldCitationSha256,
  validateOrphanDocumentFieldCitationManifest,
  type OrphanDocumentFieldCitationManifest,
  type SerializedDocumentIdentity,
  type SerializedFieldCitationSnapshot,
  type SerializedSourceCitationSnapshot,
} from './orphan-document-field-citation-repair'

export const ORPHAN_DOCUMENT_FIELD_CITATION_DISPOSITION_PATH =
  'research/_status/orphan-document-field-citation-disposition-plan-2026-07-20.json'

export const ORPHAN_DOCUMENT_FIELD_CITATION_DISPOSITION_SCOPE =
  'quarantined-orphan-document-field-citation-disposition-2026-07-20'

export const PINNED_ORPHAN_DOCUMENT_FIELD_CITATION_DISPOSITION_SHA256 =
  '73f16cd2f67e76e4a4b5996953dcd21c9e51d5ed2ac98f49cbb51cc9e252cb4a'

// Apply is enabled by the reviewed contract, but remains unreachable without
// the separate exact ACK and current dry-run plan SHA-256.
export const ORPHAN_DOCUMENT_FIELD_CITATION_DISPOSITION_APPLY_ENABLED = true

export type OrphanDocumentFieldCitationDispositionTarget = {
  fieldCitationId: string
  sourceCitationIdToPreserve: string
  reasonCode: string
  reason: string
  dispositionRationale: string
  oldDocumentIdMustBeMissing: string
  expectedFieldCitation: SerializedFieldCitationSnapshot
  expectedSourceCitationToPreserve: SerializedSourceCitationSnapshot
  expectedAllFieldCitationsForSourceCitation: SerializedFieldCitationSnapshot[]
  expectedParallelValidFieldCitation: SerializedFieldCitationSnapshot | null
  expectedParallelValidDocumentIdentity: SerializedDocumentIdentity | null
  expectedSourceConsumerCounts: SourceCitationConsumerCounts
  expectedAfterState: {
    fieldCitationDeleted: true
    sourceCitationPreserved: true
    remainingFieldCitationIds: string[]
    nonFieldCitationConsumerCountsPreservedAtZero: true
  }
}

export type OrphanDocumentFieldCitationDisposition = {
  version: 1
  scope: string
  applyEnabled: true
  operation: 'delete_exact_corrupt_field_citation_only_preserve_source_citation'
  baseRepairManifestSha256: string
  decisionBoundary: string
  targets: OrphanDocumentFieldCitationDispositionTarget[]
}

export type SourceCitationConsumerCounts = {
  fieldCitations: number
  insightPrimaryCitations: number
  producerPrimaryCitations: number
  evidenceAppraisalReviewBasisCitations: number
}

export type OrphanDocumentFieldCitationDispositionInspection = {
  orphanFieldCitationIds: string[]
  fieldCitations: SerializedFieldCitationSnapshot[]
  sourceCitations: SerializedSourceCitationSnapshot[]
  parallelDocuments: SerializedDocumentIdentity[]
  presentOldDocumentIds: string[]
  consumerCounts: Record<string, SourceCitationConsumerCounts>
}

export type OrphanDocumentFieldCitationDispositionConflict = {
  id: string
  code:
    | 'target_field_citation_snapshot_drift'
    | 'source_citation_snapshot_drift'
    | 'citation_field_dependencies_drift'
    | 'source_consumer_counts_drift'
    | 'old_document_present'
    | 'parallel_document_identity_drift'
    | 'orphan_inventory_drift'
    | 'mixed_partial_disposition'
  detail: string
}

export type OrphanDocumentFieldCitationDispositionPlan = {
  version: 1
  dispositionSha256: string
  applyEnabled: true
  deletions: OrphanDocumentFieldCitationDispositionTarget[]
  alreadyDisposedIds: string[]
  conflicts: OrphanDocumentFieldCitationDispositionConflict[]
  summary: {
    total: number
    pendingDeletion: number
    alreadyDisposed: number
    sourceCitationsPreserved: number
    singletonSourceCitationsAfterDeletion: number
    parallelBindingsPreserved: number
    conflicts: number
  }
}

export function loadOrphanDocumentFieldCitationDisposition(
  root = process.cwd(),
): OrphanDocumentFieldCitationDisposition {
  return JSON.parse(
    readFileSync(join(root, ORPHAN_DOCUMENT_FIELD_CITATION_DISPOSITION_PATH), 'utf8'),
  ) as OrphanDocumentFieldCitationDisposition
}

export function validateOrphanDocumentFieldCitationDisposition(
  disposition: OrphanDocumentFieldCitationDisposition,
  baseManifest: OrphanDocumentFieldCitationManifest,
) {
  validateOrphanDocumentFieldCitationManifest(baseManifest)
  if (
    disposition.version !== 1 ||
    disposition.scope !== ORPHAN_DOCUMENT_FIELD_CITATION_DISPOSITION_SCOPE ||
    disposition.operation !== 'delete_exact_corrupt_field_citation_only_preserve_source_citation' ||
    disposition.applyEnabled !== true ||
    disposition.baseRepairManifestSha256 !==
      PINNED_ORPHAN_DOCUMENT_FIELD_CITATION_MANIFEST_SHA256
  ) {
    throw new Error('Quarantined orphan FieldCitation disposition contract drifted')
  }
  if (
    orphanDocumentFieldCitationSha256(disposition) !==
    PINNED_ORPHAN_DOCUMENT_FIELD_CITATION_DISPOSITION_SHA256
  ) {
    throw new Error('Quarantined orphan FieldCitation disposition drifted from pinned SHA-256')
  }
  if (disposition.targets.length !== 5) {
    throw new Error('Quarantined orphan FieldCitation disposition must contain exactly five rows')
  }

  const unresolved = new Map(
    baseManifest.unresolvedTargets.map(target => [target.expectedFieldCitation.id, target]),
  )
  for (const target of disposition.targets) {
    const base = unresolved.get(target.fieldCitationId)
    if (!base) throw new Error(`Disposition target is not quarantined: ${target.fieldCitationId}`)
    if (
      !canonicalEqual(target.expectedFieldCitation, base.expectedFieldCitation) ||
      !canonicalEqual(target.expectedSourceCitationToPreserve, base.expectedSourceCitation) ||
      target.sourceCitationIdToPreserve !== base.expectedSourceCitation.id ||
      target.oldDocumentIdMustBeMissing !== base.oldDocumentIdMustBeMissing
    ) {
      throw new Error(`Disposition before-snapshot drifted for ${target.fieldCitationId}`)
    }
    if (
      target.expectedFieldCitation.claimText !== null ||
      target.expectedFieldCitation.confidence !== null ||
      !['filePath', 'url'].includes(target.expectedFieldCitation.fieldPath ?? '') ||
      target.expectedSourceCitationToPreserve.captureMethod !== 'backfill-existing-locators'
    ) {
      throw new Error(`Disposition is not limited to machine locator rows: ${target.fieldCitationId}`)
    }
    const dependencyIds = target.expectedAllFieldCitationsForSourceCitation.map(row => row.id)
    if (!dependencyIds.includes(target.fieldCitationId)) {
      throw new Error(`Disposition dependency snapshot omitted target ${target.fieldCitationId}`)
    }
    const remainingIds = dependencyIds.filter(id => id !== target.fieldCitationId).sort()
    if (!canonicalEqual(remainingIds, [...target.expectedAfterState.remainingFieldCitationIds].sort())) {
      throw new Error(`Disposition after-state dependencies drifted for ${target.fieldCitationId}`)
    }
    const parallel = target.expectedParallelValidFieldCitation
    const parallelDocument = target.expectedParallelValidDocumentIdentity
    if ((parallel == null) !== (parallelDocument == null)) {
      throw new Error(`Disposition parallel binding proof is incomplete for ${target.fieldCitationId}`)
    }
    if (
      parallel &&
      (
        !remainingIds.includes(parallel.id) ||
        parallel.entityId !== parallelDocument!.id ||
        parallel.entityType !== 'Document'
      )
    ) {
      throw new Error(`Disposition parallel binding proof drifted for ${target.fieldCitationId}`)
    }
  }
  return disposition
}

function canonicalEqual(left: unknown, right: unknown) {
  return canonicalJson(left) === canonicalJson(right)
}

function exactRowSet(
  actual: SerializedFieldCitationSnapshot[],
  expected: SerializedFieldCitationSnapshot[],
) {
  return canonicalEqual(
    [...actual].sort((left, right) => left.id.localeCompare(right.id)),
    [...expected].sort((left, right) => left.id.localeCompare(right.id)),
  )
}

export function buildOrphanDocumentFieldCitationDispositionPlan(
  inspection: OrphanDocumentFieldCitationDispositionInspection,
  dispositionInput: OrphanDocumentFieldCitationDisposition,
  baseManifest: OrphanDocumentFieldCitationManifest,
): OrphanDocumentFieldCitationDispositionPlan {
  const disposition = validateOrphanDocumentFieldCitationDisposition(
    dispositionInput,
    baseManifest,
  )
  const deletions: OrphanDocumentFieldCitationDispositionTarget[] = []
  const alreadyDisposedIds: string[] = []
  const conflicts: OrphanDocumentFieldCitationDispositionConflict[] = []

  for (const target of disposition.targets) {
    const id = target.fieldCitationId
    const targetRows = inspection.fieldCitations.filter(row => row.id === id)
    if (targetRows.length === 0) {
      alreadyDisposedIds.push(id)
    } else if (
      targetRows.length === 1 &&
      canonicalEqual(targetRows[0], target.expectedFieldCitation)
    ) {
      deletions.push(target)
    } else {
      conflicts.push({
        id,
        code: 'target_field_citation_snapshot_drift',
        detail: `Expected exact before-row or absent after-row; found ${targetRows.length} non-matching row(s).`,
      })
    }

    const citations = inspection.sourceCitations.filter(
      row => row.id === target.sourceCitationIdToPreserve,
    )
    if (
      citations.length !== 1 ||
      !canonicalEqual(citations[0], target.expectedSourceCitationToPreserve)
    ) {
      conflicts.push({
        id,
        code: 'source_citation_snapshot_drift',
        detail: 'The full SourceCitation row that must be preserved is missing or drifted.',
      })
    }

    const actualDependencies = inspection.fieldCitations.filter(
      row => row.citationId === target.sourceCitationIdToPreserve,
    )
    const expectedDependencies = targetRows.length === 0
      ? target.expectedAllFieldCitationsForSourceCitation.filter(row => row.id !== id)
      : target.expectedAllFieldCitationsForSourceCitation
    if (!exactRowSet(actualDependencies, expectedDependencies)) {
      conflicts.push({
        id,
        code: 'citation_field_dependencies_drift',
        detail: 'Full FieldCitation dependency set for the preserved SourceCitation drifted.',
      })
    }

    const counts = inspection.consumerCounts[target.sourceCitationIdToPreserve]
    const expectedCounts = {
      ...target.expectedSourceConsumerCounts,
      fieldCitations: expectedDependencies.length,
    }
    if (!counts || !canonicalEqual(counts, expectedCounts)) {
      conflicts.push({
        id,
        code: 'source_consumer_counts_drift',
        detail: 'SourceCitation consumer counts drifted from the exact preservation contract.',
      })
    }
    if (inspection.presentOldDocumentIds.includes(target.oldDocumentIdMustBeMissing)) {
      conflicts.push({
        id,
        code: 'old_document_present',
        detail: `Old Document ${target.oldDocumentIdMustBeMissing} unexpectedly exists.`,
      })
    }

    if (target.expectedParallelValidDocumentIdentity) {
      const documents = inspection.parallelDocuments.filter(
        document => document.id === target.expectedParallelValidDocumentIdentity!.id,
      )
      if (
        documents.length !== 1 ||
        !canonicalEqual(documents[0], target.expectedParallelValidDocumentIdentity)
      ) {
        conflicts.push({
          id,
          code: 'parallel_document_identity_drift',
          detail: 'The valid parallel Document binding to preserve is missing or drifted.',
        })
      }
    }
  }

  const baseIds = new Set(
    [...baseManifest.safeTargets, ...baseManifest.unresolvedTargets]
      .map(target => target.expectedFieldCitation.id),
  )
  const unexpectedOrphans = inspection.orphanFieldCitationIds.filter(id => !baseIds.has(id))
  const expectedQuarantinedOrphans = deletions.map(target => target.fieldCitationId).sort()
  const observedQuarantinedOrphans = inspection.orphanFieldCitationIds
    .filter(id => disposition.targets.some(target => target.fieldCitationId === id))
    .sort()
  if (
    unexpectedOrphans.length > 0 ||
    !canonicalEqual(expectedQuarantinedOrphans, observedQuarantinedOrphans)
  ) {
    conflicts.push({
      id: 'inventory',
      code: 'orphan_inventory_drift',
      detail: `Unexpected orphan IDs: ${unexpectedOrphans.join(', ') || 'none'}; ` +
        `expected quarantined orphans: ${expectedQuarantinedOrphans.join(', ')}; ` +
        `observed: ${observedQuarantinedOrphans.join(', ')}.`,
    })
  }

  if (deletions.length > 0 && alreadyDisposedIds.length > 0) {
    conflicts.push({
      id: 'disposition-state',
      code: 'mixed_partial_disposition',
      detail:
        `Mixed partial state is not an authorized repair checkpoint: ` +
        `${deletions.length} target(s) remain and ${alreadyDisposedIds.length} are absent. ` +
        `Restore/reconcile the exact reviewed state before retrying.`,
    })
  }

  return {
    version: 1,
    dispositionSha256: PINNED_ORPHAN_DOCUMENT_FIELD_CITATION_DISPOSITION_SHA256,
    applyEnabled: true,
    deletions,
    alreadyDisposedIds: alreadyDisposedIds.sort(),
    conflicts,
    summary: {
      total: disposition.targets.length,
      pendingDeletion: deletions.length,
      alreadyDisposed: alreadyDisposedIds.length,
      sourceCitationsPreserved: disposition.targets.length,
      singletonSourceCitationsAfterDeletion: disposition.targets.filter(
        target => target.expectedAfterState.remainingFieldCitationIds.length === 0,
      ).length,
      parallelBindingsPreserved: disposition.targets.filter(
        target => target.expectedAfterState.remainingFieldCitationIds.length > 0,
      ).length,
      conflicts: conflicts.length,
    },
  }
}

export function orphanDocumentFieldCitationDispositionPlanContract(
  plan: OrphanDocumentFieldCitationDispositionPlan,
) {
  return {
    version: plan.version,
    dispositionSha256: plan.dispositionSha256,
    applyEnabled: plan.applyEnabled,
    deletions: plan.deletions.map(target => ({
      fieldCitationId: target.fieldCitationId,
      sourceCitationIdToPreserve: target.sourceCitationIdToPreserve,
      oldDocumentIdMustBeMissing: target.oldDocumentIdMustBeMissing,
      expectedRemainingFieldCitationIds: target.expectedAfterState.remainingFieldCitationIds,
    })),
    alreadyDisposedIds: plan.alreadyDisposedIds,
    conflicts: plan.conflicts,
    summary: plan.summary,
  }
}

export function orphanDocumentFieldCitationDispositionPlanSha256(
  plan: OrphanDocumentFieldCitationDispositionPlan,
) {
  return orphanDocumentFieldCitationSha256(
    orphanDocumentFieldCitationDispositionPlanContract(plan),
  )
}
