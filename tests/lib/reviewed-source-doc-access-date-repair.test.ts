import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { reports } from '../../prisma/seed-data/reports'
import { sources } from '../../prisma/seed-data/sources'
import { buildAcademicSourceQualityRepairQueue } from '../../scripts/audit-academic-source-quality'
import {
  PINNED_CURRENT_RECONCILED_ACCESS_ROWS_SHA256,
  PINNED_PRE_RECONCILIATION_ACCESS_ROWS_SHA256,
  PINNED_PRE_RECONCILIATION_QUEUE_GENERATED_AT,
  PINNED_SOURCE_DOC_ACCESS_DATE_MANIFEST_SHA256,
  PINNED_SOURCE_DOC_ORIGINAL_QUEUE_GENERATED_AT,
  REVIEWED_SOURCE_DOC_ACCESS_DATE,
  REVIEWED_SOURCE_DOC_ACCESS_DATE_INSPECTION_IDS,
  REVIEWED_SOURCE_DOC_ACCESS_DATE_TARGETS,
  REVIEWED_SOURCE_DOC_ACCESS_ROWS,
  REVIEWED_SOURCE_DOC_LINKED_DOCUMENT_UPDATES,
  UNRESOLVED_SOURCE_DOC_ACCESS_ROWS,
  buildSourceDocAccessDateRepairPlan,
  normalizeSourceDocSeedSnapshot,
  sourceDocAccessDateRepairPlanSha256,
  validateSourceDocAccessReviewQueue,
  validateSourceDocAccessDateManifest,
  validateSourceDocAccessDateSeedRows,
  type LinkedSourceDocDocumentSnapshot,
  type SourceDocAccessReviewQueue,
  type SourceDocDatabaseSnapshot,
} from '../../scripts/repair-reviewed-source-doc-access-dates'
import {
  PINNED_REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_MANIFEST_SHA256,
  REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_IDS,
  REVIEWED_SOURCE_DOC_IDENTITY_REPAIRS,
  type PortableSourceDocIdentitySnapshot,
} from '../../src/lib/citations/reviewed-source-doc-identity-repair'
import { REVIEWED_REPORT_PROVENANCE_CORRECTION_MANIFEST } from '../../src/lib/citations/reviewed-report-provenance-corrections'
import type { SourceDoc } from '../../src/lib/types'

function sourceDocFromIdentitySnapshot(
  snapshot: PortableSourceDocIdentitySnapshot,
): SourceDoc {
  const row: SourceDoc = {
    id: snapshot.id,
    filename: snapshot.filename,
    type: snapshot.sourceType as SourceDoc['type'],
    description: snapshot.description,
    relevance: snapshot.relevance,
    isDuplicate: snapshot.isDuplicate,
    provenanceType: snapshot.provenanceType,
  }
  const record = row as unknown as Record<string, unknown>
  for (const field of [
    'title',
    'author',
    'year',
    'url',
    'doi',
    'publisher',
    'accessedAt',
    'archivedUrl',
  ] as const) {
    const value = snapshot[field]
    if (value !== null) record[field] = value
  }
  return row
}

function identityDatabaseSnapshots(
  state: 'historical' | 'post_identity',
): SourceDocDatabaseSnapshot[] {
  return REVIEWED_SOURCE_DOC_IDENTITY_REPAIRS.map((repair) => {
    const snapshot =
      state === 'historical' ? repair.before : repair.after
    return {
      id: snapshot.id,
      filename: snapshot.filename,
      title: snapshot.title,
      author: snapshot.author,
      year: snapshot.year == null ? null : String(snapshot.year),
      sourceType: snapshot.sourceType,
      description: snapshot.description,
      relevance: snapshot.relevance,
      url: snapshot.url,
      isDuplicate: snapshot.isDuplicate,
      doi: snapshot.doi,
      publisher: snapshot.publisher,
      provenanceType: snapshot.provenanceType,
      accessedAt:
        snapshot.accessedAt === null
          ? null
          : new Date(`${snapshot.accessedAt}T00:00:00.000Z`).toISOString(),
      archivedUrl: snapshot.archivedUrl,
      documentId: `document-${snapshot.id}`,
    }
  })
}

function databaseSnapshots(
  state: 'before' | 'after',
  identityState: 'historical' | 'post_identity' = 'post_identity',
): SourceDocDatabaseSnapshot[] {
  return [
    ...REVIEWED_SOURCE_DOC_ACCESS_DATE_TARGETS.map((target) => {
      const seedRow = sources.find((row) => row.id === target.id)
      assert.ok(seedRow)
      return {
        ...normalizeSourceDocSeedSnapshot(seedRow),
        url: state === 'before' ? target.urlBefore : target.urlAfter,
        accessedAt:
          state === 'before'
            ? null
            : new Date(`${target.accessDate}T00:00:00.000Z`).toISOString(),
        documentId: `document-${target.id}`,
      }
    }),
    ...identityDatabaseSnapshots(identityState),
  ]
}

function documentSnapshots(
  state: 'before' | 'after',
): LinkedSourceDocDocumentSnapshot[] {
  return REVIEWED_SOURCE_DOC_LINKED_DOCUMENT_UPDATES.map((disposition) => ({
    sourceDocId: disposition.sourceDocId,
    id: `document-${disposition.sourceDocId}`,
    slug: `document-${disposition.sourceDocId}`,
    filePath: `research/${disposition.sourceDocId}.md`,
    title: `Document mirror ${disposition.sourceDocId}`,
    author: 'Reviewed author',
    year: 2025,
    documentType: 'report',
    category: 'research',
    subcategory: 'source-review',
    country: 'NO',
    content: `Pinned content ${disposition.sourceDocId}`,
    summary: 'Pinned summary',
    url: state === 'before' ? disposition.urlBefore : disposition.urlAfter,
    accessedAt:
      state === 'before'
        ? null
        : new Date(`${disposition.accessDate}T00:00:00.000Z`).toISOString(),
    archivedUrl: null,
    wordCount: 3,
    tags: ['reviewed'],
    metadata: { sourceDocId: disposition.sourceDocId },
    createdAt: '2026-07-19T10:00:00.000Z',
    updatedAt: '2026-07-19T10:00:00.000Z',
  }))
}

function historicalTransitionQueue(): SourceDocAccessReviewQueue {
  const reportSnapshots = REVIEWED_REPORT_PROVENANCE_CORRECTION_MANIFEST.map(
    (correction) => {
      const report = reports.find((row) => row.id === correction.id)
      assert.ok(report)
      return { report, provenanceType: report.provenanceType }
    },
  )
  const sourceSnapshots = REVIEWED_SOURCE_DOC_IDENTITY_REPAIRS.map((repair) => {
    const index = sources.findIndex((row) => row.id === repair.id)
    assert.notEqual(index, -1)
    return { index, row: sources[index]! }
  })

  try {
    for (const correction of REVIEWED_REPORT_PROVENANCE_CORRECTION_MANIFEST) {
      const report = reports.find((row) => row.id === correction.id)
      assert.ok(report)
      report.provenanceType = correction.expectedCurrentType
    }
    for (const repair of REVIEWED_SOURCE_DOC_IDENTITY_REPAIRS) {
      const index = sources.findIndex((row) => row.id === repair.id)
      assert.notEqual(index, -1)
      sources[index] = sourceDocFromIdentitySnapshot(repair.before)
    }

    const queue = buildAcademicSourceQualityRepairQueue(
      PINNED_PRE_RECONCILIATION_QUEUE_GENERATED_AT,
    )
    return {
      generatedAt: queue.generatedAt,
      accessDateReviewRows: queue.accessDateReviewRows,
    }
  } finally {
    for (const snapshot of reportSnapshots) {
      snapshot.report.provenanceType = snapshot.provenanceType
    }
    for (const snapshot of sourceSnapshots) {
      sources[snapshot.index] = snapshot.row
    }
  }
}

describe('reviewed SourceDoc work-level access-date repair', () => {
  it('pins all 57 queue rows while restricting mutation to 48 verified works', () => {
    validateSourceDocAccessDateManifest()
    validateSourceDocAccessDateSeedRows(sources)

    assert.match(
      PINNED_SOURCE_DOC_ACCESS_DATE_MANIFEST_SHA256,
      /^[a-f0-9]{64}$/,
    )
    assert.equal(REVIEWED_SOURCE_DOC_ACCESS_ROWS.length, 57)
    assert.equal(REVIEWED_SOURCE_DOC_ACCESS_DATE_TARGETS.length, 48)
    assert.equal(UNRESOLVED_SOURCE_DOC_ACCESS_ROWS.length, 9)
    assert.equal(REVIEWED_SOURCE_DOC_ACCESS_DATE_INSPECTION_IDS.length, 51)
    assert.equal(
      new Set(REVIEWED_SOURCE_DOC_ACCESS_DATE_INSPECTION_IDS).size,
      51,
    )
    assert.deepEqual(
      REVIEWED_SOURCE_DOC_LINKED_DOCUMENT_UPDATES.map((row) => row.sourceDocId),
      ['src-137', 'src-148', 'src-149', 'src-173', 'src-80'],
    )
    assert.deepEqual(
      Object.fromEntries(
        [
          'exact_verified',
          'locator_repair_verified',
          'generic_or_misbound_unresolved',
          'bot_only_unverified',
          'dead_unresolved',
        ].map((classification) => [
          classification,
          REVIEWED_SOURCE_DOC_ACCESS_ROWS.filter(
            (row) => row.classification === classification,
          ).length,
        ]),
      ),
      {
        exact_verified: 37,
        locator_repair_verified: 11,
        generic_or_misbound_unresolved: 7,
        bot_only_unverified: 0,
        dead_unresolved: 2,
      },
    )
    assert.deepEqual(
      REVIEWED_SOURCE_DOC_ACCESS_ROWS.filter(
        (row) => row.classification === 'locator_repair_verified',
      )
        .map((row) => row.id)
        .sort(),
      [
        'src-137',
        'src-142',
        'src-148',
        'src-149',
        'src-15',
        'src-151',
        'src-164',
        'src-173',
        'src-26',
        'src-80',
        'src-94',
      ].sort(),
    )
    assert.deepEqual(
      UNRESOLVED_SOURCE_DOC_ACCESS_ROWS.map((row) => row.id).sort(),
      [
        'src-143',
        'src-152',
        'src-16',
        'src-17',
        'src-18',
        'src-24',
        'src-54',
        'src-74',
        'src-97',
      ].sort(),
    )
    assert.deepEqual(
      UNRESOLVED_SOURCE_DOC_ACCESS_ROWS.filter(
        (row) =>
          !REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_IDS.includes(
            row.id as (typeof REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_IDS)[number],
          ),
      )
        .map((row) => row.id)
        .sort(),
      ['src-152', 'src-17', 'src-18', 'src-54', 'src-74', 'src-97'].sort(),
    )
  })

  it('accepts only exact original, transition, or current reconciled queues', () => {
    const nextAction =
      'Open the authoritative work-level locator, verify the named work, and record the actual access date.'
    const originalRows = REVIEWED_SOURCE_DOC_ACCESS_ROWS.map(row => ({
      set: 'SourceDoc' as const,
      id: row.id,
      title: row.title,
      url: row.urlBefore,
      nextAction,
    }))
    const originalIds = REVIEWED_SOURCE_DOC_ACCESS_ROWS.map(row => row.id)
    assert.equal(
      validateSourceDocAccessReviewQueue(
        {
          generatedAt: PINNED_SOURCE_DOC_ORIGINAL_QUEUE_GENERATED_AT,
          accessDateReviewRows: originalRows,
        },
        originalIds,
      ).mode,
      'original_scope',
    )

    const obsoleteNineRowResidual = originalRows.filter(row =>
      UNRESOLVED_SOURCE_DOC_ACCESS_ROWS.some(
        unresolved => unresolved.id === row.id,
      ),
    )
    assert.throws(() =>
      validateSourceDocAccessReviewQueue(
        {
          generatedAt: '2026-07-20T00:47:07.400Z',
          accessDateReviewRows: obsoleteNineRowResidual,
        },
        originalIds,
      ),
    )

    const transitionQueue = historicalTransitionQueue()
    const transitionState = validateSourceDocAccessReviewQueue(
      transitionQueue,
      originalIds,
    )
    assert.equal(transitionState.mode, 'pre_reconciliation_residual')
    assert.equal(transitionQueue.accessDateReviewRows.length, 38)
    assert.equal(transitionState.rows.length, 23)
    assert.equal(
      transitionState.accessDateRowsSha256,
      PINNED_PRE_RECONCILIATION_ACCESS_ROWS_SHA256,
    )

    const checkedInQueue = JSON.parse(
      readFileSync(
        'research/_status/academic-source-quality-repair-queue.json',
        'utf8',
      ),
    ) as SourceDocAccessReviewQueue
    const checkedInState = validateSourceDocAccessReviewQueue(
      checkedInQueue,
      originalIds,
    )
    assert.equal(checkedInState.mode, 'current_reconciled_residual')
    assert.equal(checkedInQueue.accessDateReviewRows.length, 29)
    assert.equal(checkedInState.rows.length, 20)
    assert.equal(
      checkedInState.accessDateRowsSha256,
      PINNED_CURRENT_RECONCILED_ACCESS_ROWS_SHA256,
    )

    const currentAudit = buildAcademicSourceQualityRepairQueue(
      '2026-07-20T02:00:00.000Z',
    )
    const currentQueue: SourceDocAccessReviewQueue = {
      generatedAt: currentAudit.generatedAt,
      accessDateReviewRows: currentAudit.accessDateReviewRows,
    }
    const currentState = validateSourceDocAccessReviewQueue(
      currentQueue,
      originalIds,
    )
    assert.equal(currentState.mode, 'current_reconciled_residual')
    assert.equal(currentAudit.accessDateReviewRows.length, 29)
    assert.equal(currentState.rows.length, 20)
    assert.equal(
      currentState.accessDateRowsSha256,
      PINNED_CURRENT_RECONCILED_ACCESS_ROWS_SHA256,
    )
    assert.ok(
      REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_IDS.every(
        (id) => !currentState.rows.some((row) => row.id === id),
      ),
    )

    const oldIdentityHybrid = [
      ...currentQueue.accessDateReviewRows,
      ...transitionQueue.accessDateReviewRows.filter(
        (row) =>
          row.set === 'SourceDoc' &&
          'id' in row &&
          typeof row.id === 'string' &&
          REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_IDS.includes(
            row.id as (typeof REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_IDS)[number],
          ),
      ),
    ]
    assert.throws(() =>
      validateSourceDocAccessReviewQueue(
        {
          ...currentQueue,
          accessDateReviewRows: oldIdentityHybrid,
        },
        originalIds,
      ),
    )

    const contentDrift = currentAudit.accessDateReviewRows.map((row, index) =>
      index === 0 ? { ...row, title: `${row.title} drift` } : row,
    )
    assert.throws(() =>
      validateSourceDocAccessReviewQueue(
        {
          ...currentQueue,
          accessDateReviewRows: contentDrift,
        },
        originalIds,
      ),
    )
    assert.throws(() =>
      validateSourceDocAccessReviewQueue(
        {
          ...currentQueue,
          accessDateReviewRows: currentQueue.accessDateReviewRows.slice(1),
        },
        originalIds,
      ),
    )
    assert.throws(() =>
      validateSourceDocAccessReviewQueue(
        {
          ...currentQueue,
          accessDateReviewRows: [
            ...currentQueue.accessDateReviewRows,
            {
              set: 'SourceDoc',
              id: 'src-unknown',
              title: 'Unknown',
              url: 'https://example.com/unknown',
              nextAction,
            },
          ],
        },
        originalIds,
      ),
    )
  })

  it('preserves the historical seed contract while overlaying three exact identities', () => {
    for (const target of REVIEWED_SOURCE_DOC_ACCESS_DATE_TARGETS) {
      const seedRow = sources.find((row) => row.id === target.id)
      assert.ok(seedRow)
      assert.equal(seedRow.url, target.urlAfter)
      assert.equal(seedRow.accessedAt, REVIEWED_SOURCE_DOC_ACCESS_DATE)
    }
    for (const unresolved of UNRESOLVED_SOURCE_DOC_ACCESS_ROWS.filter(
      (row) =>
        !REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_IDS.includes(
          row.id as (typeof REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_IDS)[number],
        ),
    )) {
      const seedRow = sources.find((row) => row.id === unresolved.id)
      assert.ok(seedRow)
      assert.equal(seedRow.url, unresolved.urlBefore)
      assert.equal(seedRow.accessedAt, undefined)
    }

    for (const repair of REVIEWED_SOURCE_DOC_IDENTITY_REPAIRS) {
      const seedRow = sources.find((row) => row.id === repair.id)
      assert.ok(seedRow)
      assert.deepEqual(
        normalizeSourceDocSeedSnapshot(seedRow),
        normalizeSourceDocSeedSnapshot(
          sourceDocFromIdentitySnapshot(repair.after),
        ),
      )
    }

    const historicalSeeds = sources.map((row) => {
      const repair = REVIEWED_SOURCE_DOC_IDENTITY_REPAIRS.find(
        (candidate) => candidate.id === row.id,
      )
      return repair ? sourceDocFromIdentitySnapshot(repair.before) : row
    })
    validateSourceDocAccessDateSeedRows(historicalSeeds)

    const hybridSeeds = [...sources]
    const src24Index = hybridSeeds.findIndex((row) => row.id === 'src-24')
    hybridSeeds[src24Index] = {
      ...hybridSeeds[src24Index]!,
      url: REVIEWED_SOURCE_DOC_IDENTITY_REPAIRS.find(
        (repair) => repair.id === 'src-24',
      )!.before.url!,
    }
    assert.throws(
      () => validateSourceDocAccessDateSeedRows(hybridSeeds),
      /matches neither exact historical nor post-identity snapshot: src-24/,
    )
  })

  it('builds a deterministic full-row 48-update plan', () => {
    const plan = buildSourceDocAccessDateRepairPlan(
      databaseSnapshots('before'),
      documentSnapshots('before'),
    )
    assert.deepEqual(plan.summary, {
      total: 48,
      pending: 48,
      alreadyApplied: 0,
      identityCompatible: 3,
      linkedDocumentPending: 5,
      linkedDocumentAlreadyApplied: 0,
      conflicts: 0,
    })
    assert.equal(
      plan.identityManifestSha256,
      PINNED_REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_MANIFEST_SHA256,
    )
    assert.deepEqual(
      plan.identityStates.map((row) => [row.id, row.state]),
      REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_IDS.map((id) => [
        id,
        'post_identity',
      ]),
    )
    assert.equal(plan.linkedDocumentUpdates.length, 5)
    assert.ok(
      plan.linkedDocumentUpdates.every(
        (update) =>
          update.beforeSnapshot.url !== null &&
          update.beforeSnapshot.url ===
            REVIEWED_SOURCE_DOC_LINKED_DOCUMENT_UPDATES.find(
              (row) => row.sourceDocId === update.sourceDocId,
            )?.urlBefore,
      ),
    )
    assert.ok(
      plan.updates.every(
        (update) =>
          /^[a-f0-9]{64}$/.test(update.beforeSha256) &&
          /^[a-f0-9]{64}$/.test(update.afterSha256) &&
          update.beforeSha256 !== update.afterSha256,
      ),
    )
    assert.equal(
      sourceDocAccessDateRepairPlanSha256(plan),
      sourceDocAccessDateRepairPlanSha256(plan),
    )
  })

  it('is idempotent after all reviewed dates and locator repairs are present', () => {
    const plan = buildSourceDocAccessDateRepairPlan(
      databaseSnapshots('after'),
      documentSnapshots('after'),
    )
    assert.deepEqual(plan.summary, {
      total: 48,
      pending: 0,
      alreadyApplied: 48,
      identityCompatible: 3,
      linkedDocumentPending: 0,
      linkedDocumentAlreadyApplied: 5,
      conflicts: 0,
    })
    assert.equal(plan.updates.length, 0)
  })

  it('accepts both exact identity states and rejects every partial or drifted state', () => {
    const historicalRows = databaseSnapshots('after', 'historical')
    const historicalPlan = buildSourceDocAccessDateRepairPlan(
      historicalRows,
      documentSnapshots('after'),
    )
    assert.equal(historicalPlan.conflicts.length, 0)
    assert.deepEqual(
      historicalPlan.identityStates.map((row) => [row.id, row.state]),
      REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_IDS.map((id) => [
        id,
        'historical_post_access_pre_identity',
      ]),
    )

    const postIdentityPlan = buildSourceDocAccessDateRepairPlan(
      databaseSnapshots('after', 'post_identity'),
      documentSnapshots('after'),
    )
    assert.equal(postIdentityPlan.conflicts.length, 0)
    assert.deepEqual(
      postIdentityPlan.identityStates.map((row) => [row.id, row.state]),
      REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_IDS.map((id) => [
        id,
        'post_identity',
      ]),
    )

    const hybrid = databaseSnapshots('after', 'historical')
    const src24Index = hybrid.findIndex((row) => row.id === 'src-24')
    hybrid[src24Index] = {
      ...hybrid[src24Index]!,
      title: REVIEWED_SOURCE_DOC_IDENTITY_REPAIRS.find(
        (repair) => repair.id === 'src-24',
      )!.after.title,
    }
    assert.match(
      buildSourceDocAccessDateRepairPlan(
        hybrid,
        documentSnapshots('after'),
      ).conflicts.find((row) => row.id === 'src-24')?.detail ?? '',
      /matches neither exact historical nor post-identity snapshot[\s\S]*title/,
    )

    const locatorDrift = databaseSnapshots('after', 'post_identity')
    const src143Index = locatorDrift.findIndex((row) => row.id === 'src-143')
    locatorDrift[src143Index] = {
      ...locatorDrift[src143Index]!,
      url: 'https://example.com/unreviewed.pdf',
    }
    assert.match(
      buildSourceDocAccessDateRepairPlan(
        locatorDrift,
        documentSnapshots('after'),
      ).conflicts.find((row) => row.id === 'src-143')?.detail ?? '',
      /url/,
    )

    const metadataDrift = databaseSnapshots('after', 'post_identity')
    const src16Index = metadataDrift.findIndex((row) => row.id === 'src-16')
    metadataDrift[src16Index] = {
      ...metadataDrift[src16Index]!,
      description: `${metadataDrift[src16Index]!.description} drift`,
    }
    assert.match(
      buildSourceDocAccessDateRepairPlan(
        metadataDrift,
        documentSnapshots('after'),
      ).conflicts.find((row) => row.id === 'src-16')?.detail ?? '',
      /description/,
    )

    const missing = databaseSnapshots('after', 'post_identity').filter(
      (row) => row.id !== 'src-16',
    )
    assert.match(
      buildSourceDocAccessDateRepairPlan(
        missing,
        documentSnapshots('after'),
      ).conflicts.find((row) => row.id === 'src-16')?.detail ?? '',
      /found 0/,
    )

    const duplicate = databaseSnapshots('after', 'post_identity')
    duplicate.push({ ...duplicate.find((row) => row.id === 'src-143')! })
    assert.match(
      buildSourceDocAccessDateRepairPlan(
        duplicate,
        documentSnapshots('after'),
      ).conflicts.find((row) => row.id === 'src-143')?.detail ?? '',
      /found 2/,
    )
  })

  it('fails closed on missing, full-row drift, partial repairs, or prior dates', () => {
    assert.equal(
      buildSourceDocAccessDateRepairPlan(
        databaseSnapshots('before').slice(1),
        documentSnapshots('before'),
      ).conflicts.length,
      1,
    )

    const contentDrift = databaseSnapshots('before')
    contentDrift[0] = {
      ...contentDrift[0]!,
      description: `${contentDrift[0]!.description} unreviewed`,
    }
    assert.match(
      buildSourceDocAccessDateRepairPlan(
        contentDrift,
        documentSnapshots('before'),
      ).conflicts[0]?.detail ?? '',
      /description/,
    )

    const partial = databaseSnapshots('before')
    const repairIndex = REVIEWED_SOURCE_DOC_ACCESS_DATE_TARGETS.findIndex(
      (target) => target.id === 'src-15',
    )
    partial[repairIndex] = {
      ...partial[repairIndex]!,
      url: REVIEWED_SOURCE_DOC_ACCESS_DATE_TARGETS[repairIndex]!.urlAfter,
    }
    assert.match(
      buildSourceDocAccessDateRepairPlan(
        partial,
        documentSnapshots('before'),
      ).conflicts.find((conflict) => conflict.id === 'src-15')?.detail ?? '',
      /url/,
    )

    const previouslyDated = databaseSnapshots('before')
    previouslyDated[2] = {
      ...previouslyDated[2]!,
      accessedAt: '2026-07-18T00:00:00.000Z',
    }
    assert.match(
      buildSourceDocAccessDateRepairPlan(
        previouslyDated,
        documentSnapshots('before'),
      ).conflicts[0]?.detail ?? '',
      /accessedAt/,
    )
  })

  it('updates only exact old-URL mirrors and queues null, mismatched, or missing Documents', () => {
    const nullUrl = documentSnapshots('before')
    nullUrl[0] = { ...nullUrl[0]!, url: null }
    const nullPlan = buildSourceDocAccessDateRepairPlan(
      databaseSnapshots('before'),
      nullUrl,
    )
    assert.match(
      nullPlan.conflicts.find((row) => row.id === 'Document:src-137')?.detail ??
        '',
      /null and unrelated URLs are never filled or changed/,
    )
    assert.equal(nullPlan.linkedDocumentUpdates.length, 4)

    const mismatched = documentSnapshots('before')
    mismatched[1] = { ...mismatched[1]!, url: 'https://example.com/unrelated' }
    assert.match(
      buildSourceDocAccessDateRepairPlan(
        databaseSnapshots('before'),
        mismatched,
      ).conflicts.find((row) => row.id === 'Document:src-148')?.detail ?? '',
      /unrelated URLs are never filled or changed/,
    )

    const missing = documentSnapshots('before').slice(1)
    assert.match(
      buildSourceDocAccessDateRepairPlan(
        databaseSnapshots('before'),
        missing,
      ).conflicts.find((row) => row.id === 'Document:src-137')?.detail ?? '',
      /exactly one directly linked Document/,
    )

    const withUnrelated = [
      ...documentSnapshots('before'),
      {
        ...documentSnapshots('before')[0]!,
        sourceDocId: 'src-unrelated',
        id: 'document-unrelated',
        slug: 'document-unrelated',
        url: 'https://example.com/unchanged',
      },
    ]
    const scopedPlan = buildSourceDocAccessDateRepairPlan(
      databaseSnapshots('before'),
      withUnrelated,
    )
    assert.equal(scopedPlan.linkedDocumentUpdates.length, 5)
    assert.equal(scopedPlan.conflicts.length, 0)
  })

  it('binds relationship, identity state, and identity manifest into the plan SHA', () => {
    const initial = databaseSnapshots('before')
    const changedRelationship = databaseSnapshots('before')
    changedRelationship[0] = {
      ...changedRelationship[0]!,
      documentId: 'different-document',
    }
    const initialPlan = buildSourceDocAccessDateRepairPlan(
      initial,
      documentSnapshots('before'),
    )
    const changedRelationshipPlan = buildSourceDocAccessDateRepairPlan(
      changedRelationship,
      documentSnapshots('before'),
    )
    assert.equal(
      initialPlan.identityManifestSha256,
      PINNED_REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_MANIFEST_SHA256,
    )
    assert.notEqual(
      sourceDocAccessDateRepairPlanSha256(initialPlan),
      sourceDocAccessDateRepairPlanSha256(
        changedRelationshipPlan,
      ),
    )
    assert.notEqual(
      sourceDocAccessDateRepairPlanSha256(initialPlan),
      sourceDocAccessDateRepairPlanSha256({
        ...initialPlan,
        identityManifestSha256: '0'.repeat(64),
      }),
    )
    assert.notEqual(
      sourceDocAccessDateRepairPlanSha256(
        buildSourceDocAccessDateRepairPlan(
          databaseSnapshots('before', 'historical'),
          documentSnapshots('before'),
        ),
      ),
      sourceDocAccessDateRepairPlanSha256(initialPlan),
    )
  })

  it('keeps apply behind plan ACK, locks, Serializable, and full-field CAS', () => {
    const runner = readFileSync(
      'scripts/repair-reviewed-source-doc-access-dates.ts',
      'utf8',
    )
    const importer = readFileSync('scripts/import-ts-data.ts', 'utf8')
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
      scripts: Record<string, string>
    }
    assert.equal(
      packageJson.scripts['repair:reviewed-source-doc-access-dates'],
      'tsx scripts/repair-reviewed-source-doc-access-dates.ts',
    )
    assert.match(runner, /--apply requires --ack=\$\{APPLY_ACK\}/)
    assert.match(runner, /--plan-sha256=<64 lowercase hex>/)
    assert.match(runner, /pg_advisory_xact_lock/)
    assert.match(runner, /FOR UPDATE/)
    assert.match(runner, /REVIEWED_SOURCE_DOC_ACCESS_DATE_INSPECTION_IDS/)
    assert.match(
      runner,
      /PINNED_REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_MANIFEST_SHA256/,
    )
    assert.match(runner, /updateMany/)
    assert.equal(runner.match(/transaction\.sourceDoc\.updateMany/g)?.length, 1)
    assert.match(runner, /description: row\.description/)
    assert.match(runner, /provenanceType: row\.provenanceType/)
    assert.match(runner, /documentId: row\.documentId/)
    assert.match(runner, /transaction\.document\.updateMany/)
    assert.match(runner, /fullDocumentSnapshotWhere\(update\.beforeSnapshot\)/)
    assert.match(runner, /document\.url === disposition\.urlBefore/)
    assert.match(runner, /document\.accessedAt === null/)
    assert.match(runner, /FOR UPDATE OF d/)
    assert.match(runner, /isolationLevel: 'Serializable'/)
    assert.doesNotMatch(runner, /sourceCitation\.(?:update|updateMany)/)
    assert.doesNotMatch(importer, /prisma\.sourceDoc\.findUnique\(/)
    assert.match(
      importer,
      /guardedSeedAccessMetadata[\s\S]*seedAccessDate: s\.accessedAt/,
    )
    assert.match(
      importer,
      /prisma\.sourceDoc\.updateMany\(\{[\s\S]*where: \{ id: s\.id, accessedAt: null \}[\s\S]*url: s\.url \?\? null/,
    )
  })

  it('publishes an exhaustive receipt with exact guarded apply proof', () => {
    const receipt = readFileSync(
      'research/_status/source-doc-access-date-review-receipt-2026-07-20.md',
      'utf8',
    )
    const ledger = receipt
      .split('## Complete 57-row disposition ledger')[1]
      ?.split('## Guarded seed and database path')[0]
    assert.ok(ledger)
    assert.equal(ledger.match(/^\| `src-/gmu)?.length, 57)
    assert.match(receipt, /Database result: \*\*APPLIED\*\*/)
    assert.match(
      receipt,
      /88c073487ee47eac4911e38970bd9253a05afc44f0aeb5c01404c30e601dee14/,
    )
    assert.match(
      receipt,
      /8dda224865c7ae347f502513f58da32936705e5df214b2de366a25e419a4d01e/,
    )
    assert.match(receipt, /0 pending, 48\/48 SourceDoc and 5\/5 linked Document/)
    assert.match(
      receipt,
      new RegExp(PINNED_SOURCE_DOC_ACCESS_DATE_MANIFEST_SHA256),
    )
  })
})
