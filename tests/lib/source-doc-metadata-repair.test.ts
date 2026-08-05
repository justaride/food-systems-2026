import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { sources } from '../../prisma/seed-data/sources'
import {
  PINNED_SOURCE_DOC_METADATA_AFTER_BATCH_SHA256,
  PINNED_SOURCE_DOC_METADATA_BEFORE_BATCH_SHA256,
  PINNED_SOURCE_DOC_METADATA_BEFORE_ROW_SHA256,
  PINNED_SOURCE_DOC_METADATA_IDENTITY_SHA256,
  SOURCE_DOC_METADATA_FIELDS,
  SOURCE_DOC_METADATA_REPAIR_IDS,
  buildReviewedSourceDocMetadataTargets,
  buildSourceDocMetadataRepairPlan,
  changedSourceDocMetadataFields,
  classifySourceDocMetadataSnapshot,
  sha256Json,
  sourceDocMetadataRepairPlanContract,
  sourceDocMetadataRow,
  type SourceDocMetadataDatabaseSnapshot,
  type SourceDocMetadataSeedInput,
  type SourceDocMetadataValues,
} from '../../src/lib/citations/source-doc-metadata-repair'

function reviewedAfterDatabaseRows(): SourceDocMetadataDatabaseSnapshot[] {
  return buildReviewedSourceDocMetadataTargets(sources).map(target => ({
    id: target.id,
    ...target.metadata,
    ...target.identity,
    accessedAt: target.identity.accessedAt,
    documentId: null,
  }))
}

describe('reviewed SourceDoc metadata repair', () => {
  it('pins exactly 14 reviewed seed targets and all snapshot hashes', () => {
    const targets = buildReviewedSourceDocMetadataTargets(sources)
    assert.equal(targets.length, 14)
    assert.deepEqual(targets.map(target => target.id), [...SOURCE_DOC_METADATA_REPAIR_IDS])
    assert.equal(Object.keys(PINNED_SOURCE_DOC_METADATA_BEFORE_ROW_SHA256).length, 14)
    assert.match(PINNED_SOURCE_DOC_METADATA_BEFORE_BATCH_SHA256, /^[a-f0-9]{64}$/)
    assert.match(PINNED_SOURCE_DOC_METADATA_AFTER_BATCH_SHA256, /^[a-f0-9]{64}$/)
    assert.match(PINNED_SOURCE_DOC_METADATA_IDENTITY_SHA256, /^[a-f0-9]{64}$/)

    const src38 = targets.find(target => target.id === 'src-38')!
    assert.equal(src38.metadata.author, 'Tommy Staahl Gabrielsen & Bjørn Olav Johansen')
    assert.equal(src38.metadata.year, '2015')
    assert.equal(src38.metadata.sourceType, 'forskning')
    assert.equal(src38.metadata.publisher, 'Elsevier / International Journal of Industrial Organization')

    const src48 = targets.find(target => target.id === 'src-48')!
    assert.equal(src48.metadata.sourceType, 'posisjonsnotat')
    assert.equal(src48.identity.provenanceType, 'advocacy_position')
  })

  it('rejects reviewed seed drift instead of silently changing the after-contract', () => {
    const drifted = structuredClone(sources) as SourceDocMetadataSeedInput[]
    const target = drifted.find(source => source.id === 'src-35')!
    target.description = 'Unreviewed replacement'
    assert.throws(
      () => buildReviewedSourceDocMetadataTargets(drifted),
      /seed values drifted from the pinned after-snapshot/,
    )
  })

  it('classifies only an exact pinned before or reviewed after row', () => {
    const before: SourceDocMetadataValues = {
      author: 'Old author',
      year: '2024',
      sourceType: 'rapport',
      description: 'Old description',
      relevance: 'Old relevance',
      publisher: null,
    }
    const after: SourceDocMetadataValues = {
      ...before,
      author: 'Reviewed author',
      publisher: 'Reviewed publisher',
    }
    const beforeHash = sha256Json(sourceDocMetadataRow('src-test', before))

    assert.equal(classifySourceDocMetadataSnapshot('src-test', before, after, beforeHash), 'pending')
    assert.equal(classifySourceDocMetadataSnapshot('src-test', after, after, beforeHash), 'applied')
    assert.equal(classifySourceDocMetadataSnapshot(
      'src-test',
      { ...before, description: 'Partial operator edit' },
      after,
      beforeHash,
    ), 'conflict')
    assert.deepEqual(changedSourceDocMetadataFields(before, after), ['author', 'publisher'])
  })

  it('is idempotent for the complete reviewed after-snapshot', () => {
    const targets = buildReviewedSourceDocMetadataTargets(sources)
    const plan = buildSourceDocMetadataRepairPlan(reviewedAfterDatabaseRows(), targets)

    assert.equal(plan.conflicts.length, 0)
    assert.equal(plan.updates.length, 0)
    assert.equal(plan.alreadyAppliedIds.length, 14)
    assert.equal(plan.currentMetadataBatchSha256, PINNED_SOURCE_DOC_METADATA_AFTER_BATCH_SHA256)
  })

  it('fails closed on protected identity or partial metadata drift', () => {
    const targets = buildReviewedSourceDocMetadataTargets(sources)
    const identityDrift = reviewedAfterDatabaseRows()
    identityDrift.find(row => row.id === 'src-35')!.title = 'Changed title'
    const identityPlan = buildSourceDocMetadataRepairPlan(identityDrift, targets)
    assert.deepEqual(
      identityPlan.conflicts.map(conflict => ({ id: conflict.id, code: conflict.code })),
      [{ id: 'src-35', code: 'protected_identity_drift' }],
    )

    const metadataDrift = reviewedAfterDatabaseRows()
    metadataDrift.find(row => row.id === 'src-38')!.description = 'Partial metadata edit'
    const metadataPlan = buildSourceDocMetadataRepairPlan(metadataDrift, targets)
    assert.deepEqual(
      metadataPlan.conflicts.map(conflict => ({ id: conflict.id, code: conflict.code })),
      [{ id: 'src-38', code: 'metadata_snapshot_drift' }],
    )
  })

  it('keeps the plan contract deterministic across database row order', () => {
    const targets = buildReviewedSourceDocMetadataTargets(sources)
    const rows = reviewedAfterDatabaseRows()
    const forward = buildSourceDocMetadataRepairPlan(rows, targets)
    const reverse = buildSourceDocMetadataRepairPlan([...rows].reverse(), [...targets].reverse())
    assert.deepEqual(
      sourceDocMetadataRepairPlanContract(forward),
      sourceDocMetadataRepairPlanContract(reverse),
    )
  })

  it('limits writes to six fields behind plan hash, locks, CAS, and Serializable rollback', () => {
    assert.deepEqual(SOURCE_DOC_METADATA_FIELDS, [
      'author',
      'year',
      'sourceType',
      'description',
      'relevance',
      'publisher',
    ])
    const source = readFileSync('scripts/repair-source-doc-metadata.ts', 'utf8')
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
      scripts?: Record<string, string>
    }
    assert.equal(
      packageJson.scripts?.['repair:source-doc-metadata'],
      'tsx scripts/repair-source-doc-metadata.ts',
    )
    assert.match(source, /--apply requires --ack=\$\{APPLY_ACK\}/)
    assert.match(source, /--plan-sha256=<64 lowercase hex>/)
    assert.match(source, /pg_advisory_xact_lock/)
    assert.match(source, /FROM "SourceDoc"[\s\S]*FOR UPDATE/)
    assert.match(source, /inspectSourceDocMetadata\(transaction, targets\)/)
    assert.match(source, /transaction\.sourceDoc\.updateMany/)
    assert.match(source, /isolationLevel: 'Serializable'/)
    assert.match(source, /zero rows were committed/)
    assert.doesNotMatch(source, /deleteMany|createMany|upsert/)

    const dataBlock = source.match(/data: \{([\s\S]*?)\n          \},\n        \}\)/)?.[1] ?? ''
    for (const field of SOURCE_DOC_METADATA_FIELDS) assert.match(dataBlock, new RegExp(`${field}:`))
    for (const protectedField of ['title', 'url', 'doi', 'accessedAt', 'archivedUrl', 'provenanceType']) {
      assert.doesNotMatch(dataBlock, new RegExp(`${protectedField}:`))
    }
  })
})
