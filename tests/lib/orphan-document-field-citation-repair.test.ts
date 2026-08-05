import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import {
  ORPHAN_DOCUMENT_FIELD_CITATION_MANIFEST_PATH,
  PINNED_ORPHAN_DOCUMENT_FIELD_CITATION_MANIFEST_SHA256,
  buildOrphanDocumentFieldCitationRepairPlan,
  loadOrphanDocumentFieldCitationManifest,
  orphanDocumentFieldCitationPlanContract,
  orphanDocumentFieldCitationPlanSha256,
  orphanDocumentFieldCitationSha256,
  validateOrphanDocumentFieldCitationManifest,
  type OrphanDocumentFieldCitationInspection,
} from '../../src/lib/citations/orphan-document-field-citation-repair'
import {
  ORPHAN_DOCUMENT_FIELD_CITATION_DISPOSITION_APPLY_ENABLED,
  PINNED_ORPHAN_DOCUMENT_FIELD_CITATION_DISPOSITION_SHA256,
  buildOrphanDocumentFieldCitationDispositionPlan,
  loadOrphanDocumentFieldCitationDisposition,
  orphanDocumentFieldCitationDispositionPlanContract,
  orphanDocumentFieldCitationDispositionPlanSha256,
  validateOrphanDocumentFieldCitationDisposition,
  type OrphanDocumentFieldCitationDispositionInspection,
} from '../../src/lib/citations/orphan-document-field-citation-disposition'

const manifest = loadOrphanDocumentFieldCitationManifest()
const disposition = loadOrphanDocumentFieldCitationDisposition()

function beforeRepairInspection(): OrphanDocumentFieldCitationInspection {
  const all = [...manifest.safeTargets, ...manifest.unresolvedTargets]
  return {
    orphanFieldCitationIds: all.map(target => target.expectedFieldCitation.id),
    fieldCitations: structuredClone(all.map(target => target.expectedFieldCitation)),
    sourceCitations: structuredClone(all.map(target => target.expectedSourceCitation)),
    targetDocuments: structuredClone(
      manifest.safeTargets.map(target => target.expectedTargetDocumentIdentity),
    ),
    presentOldDocumentIds: [],
    targetTupleFieldCitations: [],
  }
}

function afterRepairInspection(): OrphanDocumentFieldCitationInspection {
  const inspection = beforeRepairInspection()
  inspection.fieldCitations = inspection.fieldCitations.map(row => {
    const target = manifest.safeTargets.find(candidate => candidate.expectedFieldCitation.id === row.id)
    return target ? { ...row, entityId: target.targetDocumentId } : row
  })
  inspection.orphanFieldCitationIds = manifest.unresolvedTargets.map(
    target => target.expectedFieldCitation.id,
  )
  inspection.targetTupleFieldCitations = manifest.safeTargets.map(target => ({
    id: target.expectedFieldCitation.id,
    citationId: target.expectedFieldCitation.citationId,
    entityType: 'Document',
    entityId: target.targetDocumentId,
    fieldPath: target.expectedFieldCitation.fieldPath,
  }))
  return inspection
}

function beforeDispositionInspection(): OrphanDocumentFieldCitationDispositionInspection {
  return {
    orphanFieldCitationIds: [...manifest.safeTargets, ...manifest.unresolvedTargets]
      .map(target => target.expectedFieldCitation.id),
    fieldCitations: structuredClone(
      disposition.targets.flatMap(target => target.expectedAllFieldCitationsForSourceCitation),
    ),
    sourceCitations: structuredClone(
      disposition.targets.map(target => target.expectedSourceCitationToPreserve),
    ),
    parallelDocuments: structuredClone(
      disposition.targets.flatMap(target => target.expectedParallelValidDocumentIdentity ?? []),
    ),
    presentOldDocumentIds: [],
    consumerCounts: Object.fromEntries(
      disposition.targets.map(target => [
        target.sourceCitationIdToPreserve,
        structuredClone(target.expectedSourceConsumerCounts),
      ]),
    ),
  }
}

function afterDispositionInspection(): OrphanDocumentFieldCitationDispositionInspection {
  const inspection = beforeDispositionInspection()
  const deleted = new Set(disposition.targets.map(target => target.fieldCitationId))
  inspection.fieldCitations = inspection.fieldCitations.filter(row => !deleted.has(row.id))
  inspection.orphanFieldCitationIds = manifest.safeTargets.map(
    target => target.expectedFieldCitation.id,
  )
  inspection.consumerCounts = Object.fromEntries(
    disposition.targets.map(target => [target.sourceCitationIdToPreserve, {
      ...target.expectedSourceConsumerCounts,
      fieldCitations: target.expectedAfterState.remainingFieldCitationIds.length,
    }]),
  )
  return inspection
}

describe('orphan Document FieldCitation ID-churn repair', () => {
  it('pins the complete 32-row inventory, 27 safe identities, five quarantined rows, and full snapshots', () => {
    assert.equal(
      ORPHAN_DOCUMENT_FIELD_CITATION_MANIFEST_PATH,
      'research/_status/orphan-document-field-citation-repair-manifest-2026-07-20.json',
    )
    assert.equal(
      orphanDocumentFieldCitationSha256(manifest),
      PINNED_ORPHAN_DOCUMENT_FIELD_CITATION_MANIFEST_SHA256,
    )
    assert.equal(
      PINNED_ORPHAN_DOCUMENT_FIELD_CITATION_MANIFEST_SHA256,
      'ae8740e68d2cd2c9c88483af01b8e3c9407c956b7bd6dc94e7eed90c88dabd49',
    )
    assert.equal(validateOrphanDocumentFieldCitationManifest(manifest), manifest)
    assert.equal(manifest.expectedOrphanInventoryCount, 32)
    assert.equal(manifest.safeTargets.length, 27)
    assert.equal(manifest.unresolvedTargets.length, 5)
    assert.deepEqual(
      Object.fromEntries(
        [...new Set(manifest.safeTargets.map(target => target.proofKind))]
          .map(kind => [kind, manifest.safeTargets.filter(target => target.proofKind === kind).length]),
      ),
      {
        exact_local_path_and_title: 4,
        source_citation_document_binding: 1,
        derived_download_path_and_title: 22,
      },
    )
    assert.deepEqual(
      manifest.unresolvedTargets.map(target => target.expectedFieldCitation.id),
      [
        'cmpdafmb102s1sxvmj1p65d1r',
        'cmpdafmb202tesxvm6b0oc1ma',
        'cmpdafmb202w3sxvm3jxu67ss',
        'cmpdafmb202ygsxvmoqiuw0rk',
        'cmpdafmb3035zsxvmwp3x2g3o',
      ],
    )
    for (const target of [...manifest.safeTargets, ...manifest.unresolvedTargets]) {
      assert.deepEqual(Object.keys(target.expectedFieldCitation).sort(), [
        'citationId', 'claimText', 'confidence', 'createdAt', 'entityId', 'entityType',
        'fieldPath', 'id',
      ])
      assert.equal(Object.keys(target.expectedSourceCitation).length, 27)
      assert.equal(target.expectedFieldCitation.entityId, target.oldDocumentIdMustBeMissing)
      assert.equal(target.expectedFieldCitation.citationId, target.expectedSourceCitation.id)
    }
  })

  it('builds the exact conflict-free 27-row pending plan and stable current plan hash', () => {
    const plan = buildOrphanDocumentFieldCitationRepairPlan(
      beforeRepairInspection(),
      manifest,
    )
    assert.deepEqual(plan.summary, {
      inventory: 32,
      safe: 27,
      pending: 27,
      alreadyApplied: 0,
      unresolved: 5,
      conflicts: 0,
    })
    assert.equal(
      orphanDocumentFieldCitationPlanSha256(plan),
      'ecc4078280961b251077a9600efc796fab00fb3423d5c9cea80cd067a8effd9f',
    )
    assert.equal(orphanDocumentFieldCitationPlanContract(plan).updates.length, 27)
  })

  it('is idempotent after all 27 safe entityId changes while preserving the five orphans', () => {
    const plan = buildOrphanDocumentFieldCitationRepairPlan(
      afterRepairInspection(),
      manifest,
    )
    assert.deepEqual(plan.summary, {
      inventory: 32,
      safe: 27,
      pending: 0,
      alreadyApplied: 27,
      unresolved: 5,
      conflicts: 0,
    })
    assert.equal(plan.observedOrphanFieldCitationIds.length, 5)
  })

  it('fails closed on any pinned row, dependency, target, collision, old-ID, or inventory drift', () => {
    const fieldDrift = beforeRepairInspection()
    fieldDrift.fieldCitations[0]!.fieldPath = 'unreviewed'
    assert.ok(buildOrphanDocumentFieldCitationRepairPlan(fieldDrift, manifest).conflicts.some(
      conflict => conflict.code === 'field_citation_snapshot_drift',
    ))

    const citationDrift = beforeRepairInspection()
    citationDrift.sourceCitations[0]!.notes = 'unreviewed'
    assert.ok(buildOrphanDocumentFieldCitationRepairPlan(citationDrift, manifest).conflicts.some(
      conflict => conflict.code === 'source_citation_snapshot_drift',
    ))

    const targetDrift = beforeRepairInspection()
    targetDrift.targetDocuments[0]!.title = 'unreviewed'
    assert.ok(buildOrphanDocumentFieldCitationRepairPlan(targetDrift, manifest).conflicts.some(
      conflict => conflict.code === 'target_document_identity_drift',
    ))

    const collision = beforeRepairInspection()
    const target = manifest.safeTargets[0]!
    collision.targetTupleFieldCitations.push({
      id: 'unexpected-collision',
      citationId: target.expectedFieldCitation.citationId,
      entityType: 'Document',
      entityId: target.targetDocumentId,
      fieldPath: target.expectedFieldCitation.fieldPath,
    })
    assert.ok(buildOrphanDocumentFieldCitationRepairPlan(collision, manifest).conflicts.some(
      conflict => conflict.code === 'target_tuple_collision',
    ))

    const oldPresent = beforeRepairInspection()
    oldPresent.presentOldDocumentIds.push(target.oldDocumentIdMustBeMissing)
    assert.ok(buildOrphanDocumentFieldCitationRepairPlan(oldPresent, manifest).conflicts.some(
      conflict => conflict.code === 'old_document_present',
    ))

    const inventoryDrift = beforeRepairInspection()
    inventoryDrift.orphanFieldCitationIds.push('unexpected-orphan')
    assert.ok(buildOrphanDocumentFieldCitationRepairPlan(inventoryDrift, manifest).conflicts.some(
      conflict => conflict.code === 'orphan_inventory_drift',
    ))
  })

  it('requires a reviewed plan, full CAS, locks, and one Serializable entityId-only transaction', () => {
    const source = readFileSync('scripts/repair-orphan-document-field-citations.ts', 'utf8')
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
      scripts?: Record<string, string>
    }
    assert.equal(
      packageJson.scripts?.['repair:orphan-document-field-citations'],
      'tsx scripts/repair-orphan-document-field-citations.ts',
    )
    assert.match(source, /--apply requires --ack=\$\{APPLY_ACK\}/)
    assert.match(source, /--plan-sha256=<64 lowercase hex>/)
    assert.match(source, /pg_advisory_xact_lock/)
    assert.match(source, /FROM "FieldCitation"[\s\S]*FOR UPDATE/)
    assert.match(source, /FROM "SourceCitation"[\s\S]*FOR SHARE/)
    assert.match(source, /FROM "Document"[\s\S]*FOR SHARE/)
    assert.match(source, /fieldCitationCasWhere\(target\.expectedFieldCitation\)/)
    assert.match(source, /data: \{ entityId: target\.targetDocumentId \}/)
    assert.match(source, /afterPlan\.updates\.length > 0/)
    assert.match(source, /isolationLevel: 'Serializable'/)
    assert.match(source, /zero rows were committed/)
    assert.doesNotMatch(source, /deleteMany|createMany|upsert/)
  })
})

describe('reviewed quarantined FieldCitation disposition', () => {
  it('pins five exact machine-locator deletions behind explicit apply gates', () => {
    assert.equal(ORPHAN_DOCUMENT_FIELD_CITATION_DISPOSITION_APPLY_ENABLED, true)
    assert.equal(
      orphanDocumentFieldCitationSha256(disposition),
      PINNED_ORPHAN_DOCUMENT_FIELD_CITATION_DISPOSITION_SHA256,
    )
    assert.equal(
      PINNED_ORPHAN_DOCUMENT_FIELD_CITATION_DISPOSITION_SHA256,
      '73f16cd2f67e76e4a4b5996953dcd21c9e51d5ed2ac98f49cbb51cc9e252cb4a',
    )
    assert.equal(
      validateOrphanDocumentFieldCitationDisposition(disposition, manifest),
      disposition,
    )
    assert.equal(disposition.targets.length, 5)
    assert.equal(
      disposition.targets.filter(target => target.expectedParallelValidFieldCitation).length,
      2,
    )
    assert.equal(
      disposition.targets.filter(target => !target.expectedParallelValidFieldCitation).length,
      3,
    )
    for (const target of disposition.targets) {
      assert.equal(target.expectedFieldCitation.claimText, null)
      assert.equal(target.expectedFieldCitation.confidence, null)
      assert.ok(['filePath', 'url'].includes(target.expectedFieldCitation.fieldPath!))
      assert.equal(
        target.expectedSourceCitationToPreserve.captureMethod,
        'backfill-existing-locators',
      )
      assert.deepEqual(
        {
          insightPrimaryCitations: target.expectedSourceConsumerCounts.insightPrimaryCitations,
          producerPrimaryCitations: target.expectedSourceConsumerCounts.producerPrimaryCitations,
          evidenceAppraisalReviewBasisCitations:
            target.expectedSourceConsumerCounts.evidenceAppraisalReviewBasisCitations,
        },
        {
          insightPrimaryCitations: 0,
          producerPrimaryCitations: 0,
          evidenceAppraisalReviewBasisCitations: 0,
        },
      )
    }
  })

  it('builds the exact reviewed five-row plan and preserves five SourceCitations', () => {
    const plan = buildOrphanDocumentFieldCitationDispositionPlan(
      beforeDispositionInspection(),
      disposition,
      manifest,
    )
    assert.deepEqual(plan.summary, {
      total: 5,
      pendingDeletion: 5,
      alreadyDisposed: 0,
      sourceCitationsPreserved: 5,
      singletonSourceCitationsAfterDeletion: 3,
      parallelBindingsPreserved: 2,
      conflicts: 0,
    })
    assert.equal(plan.applyEnabled, true)
    assert.equal(
      orphanDocumentFieldCitationDispositionPlanSha256(plan),
      'ba512fc97cfee68ca5aaa497414eae7afebb2e8cd4f521f5c5c30cf2fa770b94',
    )
    assert.equal(orphanDocumentFieldCitationDispositionPlanContract(plan).deletions.length, 5)
  })

  it('is idempotent after disposition and preserves parallel bindings and all SourceCitations', () => {
    const plan = buildOrphanDocumentFieldCitationDispositionPlan(
      afterDispositionInspection(),
      disposition,
      manifest,
    )
    assert.deepEqual(plan.summary, {
      total: 5,
      pendingDeletion: 0,
      alreadyDisposed: 5,
      sourceCitationsPreserved: 5,
      singletonSourceCitationsAfterDeletion: 3,
      parallelBindingsPreserved: 2,
      conflicts: 0,
    })
    assert.equal(
      orphanDocumentFieldCitationDispositionPlanSha256(plan),
      '1f8de350bb5b775df06478403260de7696a8e4a1ac0b6348e1a2ea8d33f2463e',
    )
  })

  it('fails closed on preservation dependency or consumer drift', () => {
    const dependencyDrift = beforeDispositionInspection()
    dependencyDrift.fieldCitations.find(row =>
      row.id === disposition.targets[2]!.expectedParallelValidFieldCitation!.id
    )!.fieldPath = 'unreviewed'
    assert.ok(buildOrphanDocumentFieldCitationDispositionPlan(
      dependencyDrift,
      disposition,
      manifest,
    ).conflicts.some(conflict => conflict.code === 'citation_field_dependencies_drift'))

    const consumerDrift = beforeDispositionInspection()
    consumerDrift.consumerCounts[disposition.targets[0]!.sourceCitationIdToPreserve]!
      .insightPrimaryCitations = 1
    assert.ok(buildOrphanDocumentFieldCitationDispositionPlan(
      consumerDrift,
      disposition,
      manifest,
    ).conflicts.some(conflict => conflict.code === 'source_consumer_counts_drift'))
  })

  it('fails closed on a mixed partial disposition but remains idempotent when all five are absent', () => {
    const partial = beforeDispositionInspection()
    const first = disposition.targets[0]!
    partial.fieldCitations = partial.fieldCitations.filter(row => row.id !== first.fieldCitationId)
    partial.orphanFieldCitationIds = partial.orphanFieldCitationIds.filter(
      id => id !== first.fieldCitationId,
    )
    partial.consumerCounts[first.sourceCitationIdToPreserve]!.fieldCitations -= 1
    const plan = buildOrphanDocumentFieldCitationDispositionPlan(
      partial,
      disposition,
      manifest,
    )
    assert.equal(plan.summary.pendingDeletion, 4)
    assert.equal(plan.summary.alreadyDisposed, 1)
    assert.ok(plan.conflicts.some(
      conflict => conflict.code === 'mixed_partial_disposition',
    ))
  })

  it('gates apply behind full preservation locks, full CAS, ACK, and plan hash', () => {
    const source = readFileSync(
      'scripts/plan-quarantined-orphan-field-citation-disposition.ts',
      'utf8',
    )
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
      scripts?: Record<string, string>
    }
    assert.equal(
      packageJson.scripts?.['plan:orphan-document-field-citation-disposition'],
      'tsx scripts/plan-quarantined-orphan-field-citation-disposition.ts',
    )
    assert.equal(
      packageJson.scripts?.['repair:orphan-document-field-citation-disposition'],
      'tsx scripts/plan-quarantined-orphan-field-citation-disposition.ts',
    )
    assert.match(
      source,
      /const APPLY_ACK = 'DELETE_REVIEWED_CORRUPT_ORPHAN_FIELD_CITATIONS_PRESERVE_SOURCES'/,
    )
    assert.match(source, /--apply requires --ack=\$\{APPLY_ACK\}/)
    assert.match(source, /--plan-sha256=<64 lowercase hex>/)
    assert.match(source, /pg_advisory_xact_lock/)
    assert.match(source, /FROM "SourceCitation"[\s\S]*FOR SHARE/)
    assert.match(source, /FROM "FieldCitation"[\s\S]*FOR UPDATE/)
    assert.match(source, /FROM "Insight"[\s\S]*FOR SHARE/)
    assert.match(source, /FROM "Producer"[\s\S]*FOR SHARE/)
    assert.match(source, /FROM "EvidenceAppraisal"[\s\S]*FOR SHARE/)
    assert.match(source, /fieldCitationCasWhere\(target\.expectedFieldCitation\)/)
    assert.match(source, /fieldCitation\.deleteMany/)
    assert.match(source, /afterPlan\.alreadyDisposedIds\.length/)
    assert.match(source, /isolationLevel: 'Serializable'/)
    assert.match(source, /zero rows were deleted/)
    assert.doesNotMatch(source, /sourceCitation\.(delete|deleteMany|update|updateMany)/)
  })
})
