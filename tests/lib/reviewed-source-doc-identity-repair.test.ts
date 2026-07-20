import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { sources } from '../../prisma/seed-data/sources'
import type { SourceDoc } from '../../src/lib/types'
import {
  PINNED_REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_MANIFEST_SHA256,
  REVIEWED_SOURCE_DOC_IDENTITY_ALLOWED_FIELDS,
  REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_ACCESS_DATE,
  REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_IDS,
  REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_MANIFEST_SHA256,
  REVIEWED_SOURCE_DOC_IDENTITY_REPAIRS,
  applyReviewedSourceDocIdentityRepairsToSeed,
  buildReviewedSourceDocIdentityRepairPlan,
  normalizePortableSourceDocIdentitySnapshot,
  validateReviewedSourceDocIdentityRepairManifest,
  type PortableSourceDocIdentitySnapshot,
} from '../../src/lib/citations/reviewed-source-doc-identity-repair'
import { SOURCE_DOC_BIBLIOGRAPHIC_REPAIR_IDS } from '../../src/lib/citations/source-doc-bibliographic-repair'
import { SOURCE_DOC_METADATA_REPAIR_IDS } from '../../src/lib/citations/source-doc-metadata-repair'

function sourceDocFromSnapshot(
  snapshot: PortableSourceDocIdentitySnapshot,
): SourceDoc {
  const result: SourceDoc = {
    id: snapshot.id,
    filename: snapshot.filename,
    type: snapshot.sourceType as SourceDoc['type'],
    description: snapshot.description,
    relevance: snapshot.relevance,
    isDuplicate: snapshot.isDuplicate,
    provenanceType: snapshot.provenanceType,
  }
  const record = result as unknown as Record<string, unknown>
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
  return result
}

function beforeRows() {
  return REVIEWED_SOURCE_DOC_IDENTITY_REPAIRS.map((repair) =>
    sourceDocFromSnapshot(repair.before),
  )
}

describe('reviewed three-row SourceDoc identity seed repair', () => {
  it('pins one immutable evidence-bound manifest for the exact three targets', () => {
    assert.equal(validateReviewedSourceDocIdentityRepairManifest().length, 3)
    assert.deepEqual(REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_IDS, [
      'src-16',
      'src-24',
      'src-143',
    ])
    assert.deepEqual(REVIEWED_SOURCE_DOC_IDENTITY_ALLOWED_FIELDS, [
      'title',
      'author',
      'year',
      'url',
      'publisher',
      'accessedAt',
    ])
    assert.equal(
      REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_MANIFEST_SHA256,
      PINNED_REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_MANIFEST_SHA256,
    )
    assert.equal(
      REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_MANIFEST_SHA256,
      '1396f3ad134459afa40076556d24c466c8b90e9c40017c1ba3a74ae998e6ae7c',
    )
    assert.ok(Object.isFrozen(REVIEWED_SOURCE_DOC_IDENTITY_REPAIRS))
    assert.ok(
      REVIEWED_SOURCE_DOC_IDENTITY_REPAIRS.every(
        (repair) =>
          Object.isFrozen(repair) &&
          Object.isFrozen(repair.mutatedFields) &&
          Object.isFrozen(repair.before) &&
          Object.isFrozen(repair.after) &&
          Object.isFrozen(repair.evidence) &&
          repair.evidence.reviewBasis.trim().length > 0,
      ),
    )

    const artifact = REVIEWED_SOURCE_DOC_IDENTITY_REPAIRS.find(
      (repair) => repair.id === 'src-143',
    )!
    assert.equal(
      artifact.evidence.artifactSha256,
      '136b85c19ed2d652dcafd854c29898b97635dfe9ff2a0f734a6f7345cef4b761',
    )
    assert.equal(
      artifact.evidence.locator,
      'https://www.ruokavirasto.fi/globalassets/etmv/etmv-toimintakertomus-2024.pdf',
    )
    assert.equal(
      artifact.evidence.artifactAvailability,
      'canonical_checkout_only',
    )
  })

  it('materializes the exact reviewed identities in the outermost seed view', () => {
    const targets = Object.fromEntries(
      sources
        .filter((row) =>
          REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_IDS.includes(
            row.id as (typeof REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_IDS)[number],
          ),
        )
        .map((row) => [row.id, row]),
    )
    assert.deepEqual(
      {
        title: targets['src-16']?.title,
        author: targets['src-16']?.author,
        year: targets['src-16']?.year,
        url: targets['src-16']?.url,
        publisher: targets['src-16']?.publisher,
        provenanceType: targets['src-16']?.provenanceType,
        accessedAt: targets['src-16']?.accessedAt,
      },
      {
        title: 'Matsikkerhet og beredskap på landbruksområdet',
        author: 'Riksrevisjonen',
        year: 2023,
        url: 'https://www.riksrevisjonen.no/rapporter-mappe/no-2023-2024/matsikkerhet-og-beredskap-pa-landbruksomradet/',
        publisher: undefined,
        provenanceType: 'official_primary',
        accessedAt: REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_ACCESS_DATE,
      },
    )
    assert.deepEqual(
      {
        title: targets['src-24']?.title,
        author: targets['src-24']?.author,
        year: targets['src-24']?.year,
        url: targets['src-24']?.url,
        publisher: targets['src-24']?.publisher,
        provenanceType: targets['src-24']?.provenanceType,
        accessedAt: targets['src-24']?.accessedAt,
      },
      {
        title: 'Competition Act 948/2011, Section 4a',
        author: 'Finland',
        year: 2013,
        url: 'https://www.finlex.fi/en/legislation/2011/948',
        publisher: 'Finlex',
        provenanceType: 'official_primary',
        accessedAt: REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_ACCESS_DATE,
      },
    )
    assert.deepEqual(
      {
        title: targets['src-143']?.title,
        author: targets['src-143']?.author,
        year: targets['src-143']?.year,
        url: targets['src-143']?.url,
        publisher: targets['src-143']?.publisher,
        provenanceType: targets['src-143']?.provenanceType,
        accessedAt: targets['src-143']?.accessedAt,
      },
      {
        title: 'Elintarvikemarkkinavaltuutetun toimintakertomus 2024',
        author: 'Ruokavirasto / Finnish Food Market Ombudsman',
        year: 2024,
        url: 'https://www.ruokavirasto.fi/globalassets/etmv/etmv-toimintakertomus-2024.pdf',
        publisher: 'Ruokavirasto',
        provenanceType: 'official_primary',
        accessedAt: REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_ACCESS_DATE,
      },
    )
  })

  it('applies exact before snapshots atomically and is idempotent', () => {
    const before = beforeRows()
    assert.deepEqual(buildReviewedSourceDocIdentityRepairPlan(before).summary, {
      total: 3,
      pending: 3,
      alreadyApplied: 0,
      conflicts: 0,
    })

    const applied = applyReviewedSourceDocIdentityRepairsToSeed(before)
    assert.deepEqual(
      applied.map(normalizePortableSourceDocIdentitySnapshot),
      REVIEWED_SOURCE_DOC_IDENTITY_REPAIRS.map((repair) => repair.after),
    )
    assert.deepEqual(buildReviewedSourceDocIdentityRepairPlan(applied).summary, {
      total: 3,
      pending: 0,
      alreadyApplied: 3,
      conflicts: 0,
    })

    const reapplied = applyReviewedSourceDocIdentityRepairsToSeed(applied)
    assert.deepEqual(reapplied, applied)
    assert.ok(reapplied.every((row, index) => row === applied[index]))
  })

  it('fails closed on missing, duplicate, hybrid, and protected-field drift', () => {
    const before = beforeRows()
    assert.throws(
      () => applyReviewedSourceDocIdentityRepairsToSeed(before.slice(1)),
      /src-16:missing_row/,
    )
    assert.throws(
      () =>
        applyReviewedSourceDocIdentityRepairsToSeed([
          ...before,
          { ...before[0]! },
        ]),
      /src-16:duplicate_row/,
    )

    const src24Index = before.findIndex((row) => row.id === 'src-24')
    const src24After = REVIEWED_SOURCE_DOC_IDENTITY_REPAIRS.find(
      (repair) => repair.id === 'src-24',
    )!.after
    const hybrid = [...before]
    hybrid[src24Index] = {
      ...hybrid[src24Index]!,
      title: src24After.title ?? undefined,
    }
    assert.ok(
      buildReviewedSourceDocIdentityRepairPlan(hybrid).conflicts.some(
        (conflict) =>
          conflict.id === 'src-24' && conflict.code === 'hybrid_snapshot',
      ),
    )
    assert.throws(
      () => applyReviewedSourceDocIdentityRepairsToSeed(hybrid),
      /src-24:hybrid_snapshot/,
    )

    const protectedDrift = [...before]
    protectedDrift[src24Index] = {
      ...protectedDrift[src24Index]!,
      relevance: 'Unreviewed relevance rewrite',
    }
    assert.throws(
      () => applyReviewedSourceDocIdentityRepairsToSeed(protectedDrift),
      /src-24:protected_field_drift/,
    )
  })

  it('preserves every non-target row and every non-mutated target field', () => {
    const nonTarget: SourceDoc = {
      id: 'src-control',
      filename: 'control.md',
      title: 'Control',
      author: 'Control author',
      year: 2026,
      type: 'rapport',
      description: 'Control description',
      relevance: 'Control relevance',
      url: 'https://example.com/control',
      publisher: 'Control publisher',
      provenanceType: 'external_publication',
      accessedAt: '2026-07-19',
    }
    const before = beforeRows()
    const applied = applyReviewedSourceDocIdentityRepairsToSeed([
      nonTarget,
      ...before,
    ])
    assert.equal(applied[0], nonTarget)

    for (const repair of REVIEWED_SOURCE_DOC_IDENTITY_REPAIRS) {
      const row = applied.find((candidate) => candidate.id === repair.id)!
      const actual = normalizePortableSourceDocIdentitySnapshot(row)
      for (const field of [
        'filename',
        'sourceType',
        'description',
        'relevance',
        'isDuplicate',
        'doi',
        'provenanceType',
        'archivedUrl',
      ] as const) {
        assert.equal(actual[field], repair.before[field], `${repair.id}:${field}`)
      }
    }
  })

  it('rejects overlap with other identity or metadata repair scopes', () => {
    const otherRepairIds = [
      ...SOURCE_DOC_BIBLIOGRAPHIC_REPAIR_IDS,
      ...SOURCE_DOC_METADATA_REPAIR_IDS,
    ]
    assert.ok(
      REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_IDS.every(
        (id) => !otherRepairIds.includes(id as never),
      ),
    )
    assert.throws(
      () =>
        validateReviewedSourceDocIdentityRepairManifest(
          REVIEWED_SOURCE_DOC_IDENTITY_REPAIRS,
          [...otherRepairIds, 'src-24'],
        ),
      /overlaps another identity or metadata repair: src-24/,
    )
  })
})
