import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import {
  REVIEWED_SOURCE_DOC_PROVENANCE_REGISTRY_EXPECTED_COUNT,
  buildReviewedSourceDocProvenanceRegistry,
  buildSourceCitationProvenanceReconciliationPlan,
  sourceCitationProvenancePlanContract,
  type ReviewedSourceDocProvenance,
  type SourceCitationProvenanceSnapshot,
  type SourceDocProvenanceSnapshot,
} from '../../src/lib/citations/source-citation-provenance-reconciliation'
import { REVIEWED_PROVENANCE_COMPLETION_MANIFEST } from '../../src/lib/citations/reviewed-provenance-completion'
import { reviewedSourceManifest } from '../../scripts/reconcile-source-citation-provenance'

const UPDATED_AT = '2026-07-19T12:00:00.000Z'

function citation(
  overrides: Partial<SourceCitationProvenanceSnapshot> & Pick<SourceCitationProvenanceSnapshot, 'id'>,
): SourceCitationProvenanceSnapshot {
  return {
    sourceClass: 'primary',
    citationReadiness: 'citable_with_note',
    verificationStatus: 'needs_review',
    citationText: 'Reviewed source',
    updatedAt: UPDATED_AT,
    fieldCitationCount: 1,
    fieldCitations: [],
    ...overrides,
  }
}

function reviewed(
  id: string,
  provenanceType: ReviewedSourceDocProvenance['provenanceType'],
): ReviewedSourceDocProvenance {
  return { id, provenanceType }
}

describe('SourceCitation provenance reconciliation planning', () => {
  it('composes the complete overlap-free reviewed SourceDoc registry', () => {
    const registry = reviewedSourceManifest()
    assert.equal(
      registry.length,
      REVIEWED_SOURCE_DOC_PROVENANCE_REGISTRY_EXPECTED_COUNT,
    )
    assert.equal(new Set(registry.map(row => row.id)).size, registry.length)
    assert.equal(
      registry.filter(row => row.id.startsWith('src-yt-')).length,
      17,
    )
    for (const entry of REVIEWED_PROVENANCE_COMPLETION_MANIFEST.filter(
      row => row.entity === 'SourceDoc',
    )) {
      assert.deepEqual(
        registry.find(row => row.id === entry.id),
        { id: entry.id, provenanceType: entry.targetType },
      )
    }

    assert.throws(
      () =>
        buildReviewedSourceDocProvenanceRegistry([
          {
            name: 'first',
            expectedCount: 1,
            rows: [reviewed('src-overlap', 'official_primary')],
          },
          {
            name: 'second',
            expectedCount: 1,
            rows: [reviewed('src-overlap', 'official_primary')],
          },
        ]),
      /registry overlaps at src-overlap/,
    )
  })

  it('maps every new completion source without an unreviewed-provenance conflict', () => {
    const completion = REVIEWED_PROVENANCE_COMPLETION_MANIFEST.filter(
      row => row.entity === 'SourceDoc',
    )
    const sourceDocs = completion.map(row => ({
      id: row.id,
      provenanceType: row.targetType,
    }))
    const citations = completion.map(row =>
      citation({
        id: `citation-${row.id}`,
        sourceDocId: row.id,
        sourceClass: 'unknown',
        citationReadiness: 'blocked_unsourced',
      }),
    )
    const plan = buildSourceCitationProvenanceReconciliationPlan(
      sourceDocs,
      citations,
      completion.map(row => ({
        id: row.id,
        provenanceType: row.targetType,
      })),
    )

    assert.equal(plan.conflicts.length, 0)
    assert.equal(plan.updates.length, 25)
    assert.deepEqual(plan.summary.byTransition, {
      'unknown/blocked_unsourced -> internal_primary/blocked_unsourced': 3,
      'unknown/blocked_unsourced -> internal_synthesis/blocked_unsourced': 4,
      'unknown/blocked_unsourced -> primary/blocked_unsourced': 4,
      'unknown/blocked_unsourced -> secondary/blocked_unsourced': 14,
    })
    assert.ok(
      plan.updates.every(
        update => update.targetCitationReadiness === 'blocked_unsourced',
      ),
    )
  })

  it('fails unknown SourceDocs closed through direct and FieldCitation links', () => {
    const sourceDocs: SourceDocProvenanceSnapshot[] = [
      { id: 'src-unknown-a', provenanceType: 'unknown', url: 'https://example.test/a' },
      { id: 'src-unknown-b', provenanceType: 'unknown' },
    ]
    const plan = buildSourceCitationProvenanceReconciliationPlan(sourceDocs, [
      citation({
        id: 'citation-direct',
        sourceDocId: 'src-unknown-a',
        fieldCitationCount: 2,
        fieldCitations: [{ id: 'field-direct', entityType: 'SourceDoc', entityId: 'src-unknown-a' }],
      }),
      citation({
        id: 'citation-field-only',
        sourceClass: 'unknown',
        citationReadiness: 'citable_with_note',
        fieldCitations: [{ id: 'field-only', entityType: 'SourceDoc', entityId: 'src-unknown-b' }],
      }),
    ], [])

    assert.equal(plan.conflicts.length, 0)
    assert.equal(plan.updates.length, 2)
    assert.ok(plan.updates.every(update => update.targetSourceClass === 'unknown'))
    assert.ok(plan.updates.every(update => update.targetCitationReadiness === 'blocked_unsourced'))
    assert.ok(plan.updates.every(update => update.reasons.includes('unknown_fail_closed')))
    assert.equal(plan.summary.linkedUnknownSourceDocs, 2)
    assert.equal(plan.summary.unknownFailClosedCitationUpdates, 2)
    assert.equal(plan.summary.impactedSourceDocFieldCitations, 2)
    assert.equal(plan.summary.impactedFieldCitations, 3)
    assert.equal(plan.summary.byProvenanceSourceDocFieldCitations.unknown, 2)
  })

  it('maps reviewed provenance and only downgrades readiness', () => {
    const sourceDocs: SourceDocProvenanceSnapshot[] = [
      {
        id: 'src-official',
        provenanceType: 'official_primary',
        url: 'https://example.test/official',
        accessedAt: '2026-07-19',
      },
      {
        id: 'src-commissioned',
        provenanceType: 'commissioned_report',
        url: 'https://example.test/commissioned',
        accessedAt: '2026-07-19',
      },
      { id: 'src-internal', provenanceType: 'internal_primary' },
    ]
    const reviewedSources = [
      reviewed('src-official', 'official_primary'),
      reviewed('src-commissioned', 'commissioned_report'),
      reviewed('src-internal', 'internal_primary'),
    ]
    const plan = buildSourceCitationProvenanceReconciliationPlan(sourceDocs, [
      citation({
        id: 'citation-official',
        sourceDocId: 'src-official',
        citationReadiness: 'citable_with_note',
      }),
      citation({
        id: 'citation-commissioned',
        sourceDocId: 'src-commissioned',
        sourceClass: 'primary',
        citationReadiness: 'citable_external',
      }),
      citation({
        id: 'citation-internal',
        sourceDocId: 'src-internal',
        citationReadiness: 'citable_with_note',
      }),
    ], reviewedSources)

    assert.equal(plan.conflicts.length, 0)
    assert.equal(plan.updates.length, 2)
    assert.equal(plan.summary.unchanged, 1)
    assert.equal(plan.summary.reviewedCitationUpdates, 2)

    const commissioned = plan.updates.find(update => update.citationId === 'citation-commissioned')!
    assert.equal(commissioned.targetSourceClass, 'secondary')
    assert.equal(commissioned.readinessCeiling, 'citable_with_note')
    assert.equal(commissioned.targetCitationReadiness, 'citable_with_note')

    const internal = plan.updates.find(update => update.citationId === 'citation-internal')!
    assert.equal(internal.targetSourceClass, 'internal_primary')
    assert.equal(internal.targetCitationReadiness, 'internal_context')

    assert.equal(plan.updates.some(update =>
      update.expectedCitationReadiness === 'citable_with_note' &&
      update.targetCitationReadiness === 'citable_external'
    ), false)
  })

  it('does not treat sourceDocId alone as an external documentary locator', () => {
    const plan = buildSourceCitationProvenanceReconciliationPlan(
      [{ id: 'src-official', provenanceType: 'official_primary' }],
      [citation({
        id: 'citation-link-only',
        sourceDocId: 'src-official',
        citationReadiness: 'citable_external',
        verificationStatus: 'machine_verified',
      })],
      [reviewed('src-official', 'official_primary')],
    )

    assert.equal(plan.updates[0]?.readinessCeiling, 'blocked_unsourced')
    assert.equal(plan.updates[0]?.targetCitationReadiness, 'blocked_unsourced')
  })

  it('preserves an existing stricter blocked state while correcting source class', () => {
    const plan = buildSourceCitationProvenanceReconciliationPlan(
      [{ id: 'src-internal', provenanceType: 'internal_synthesis' }],
      [citation({
        id: 'citation-internal',
        sourceDocId: 'src-internal',
        citationReadiness: 'blocked_unsourced',
      })],
      [reviewed('src-internal', 'internal_synthesis')],
    )

    assert.equal(plan.updates[0]?.targetSourceClass, 'internal_synthesis')
    assert.equal(plan.updates[0]?.readinessCeiling, 'internal_context')
    assert.equal(plan.updates[0]?.targetCitationReadiness, 'blocked_unsourced')
    assert.deepEqual(plan.updates[0]?.reasons, ['source_class_mismatch'])
  })

  it('fails closed on ambiguous links and provenance outside the reviewed manifest', () => {
    const plan = buildSourceCitationProvenanceReconciliationPlan(
      [
        { id: 'src-a', provenanceType: 'unknown' },
        { id: 'src-b', provenanceType: 'unknown' },
        { id: 'src-unreviewed', provenanceType: 'official_primary' },
      ],
      [
        citation({
          id: 'citation-ambiguous',
          sourceDocId: 'src-a',
          fieldCitations: [{ id: 'field-b', entityType: 'SourceDoc', entityId: 'src-b' }],
        }),
        citation({ id: 'citation-unreviewed', sourceDocId: 'src-unreviewed' }),
      ],
      [],
    )

    assert.deepEqual(
      plan.conflicts.map(conflict => conflict.code).sort(),
      ['ambiguous_source_doc_link', 'unreviewed_non_unknown_provenance'],
    )
    assert.equal(plan.updates.length, 0)
  })

  it('fails closed when a reviewed SourceDoc is missing or its provenance drifts', () => {
    const plan = buildSourceCitationProvenanceReconciliationPlan(
      [{ id: 'src-drifted', provenanceType: 'unknown' }],
      [],
      [
        reviewed('src-drifted', 'official_primary'),
        reviewed('src-missing', 'peer_reviewed'),
      ],
    )

    assert.deepEqual(
      plan.conflicts.map(conflict => conflict.code).sort(),
      ['missing_reviewed_source_doc', 'reviewed_provenance_drift'],
    )
  })

  it('produces a deterministic sorted CAS contract', () => {
    const sourceDocs = [
      { id: 'src-2', provenanceType: 'unknown' },
      { id: 'src-1', provenanceType: 'unknown' },
    ]
    const citations = [
      citation({ id: 'citation-2', sourceDocId: 'src-2' }),
      citation({ id: 'citation-1', sourceDocId: 'src-1' }),
    ]
    const forward = buildSourceCitationProvenanceReconciliationPlan(sourceDocs, citations, [])
    const reverse = buildSourceCitationProvenanceReconciliationPlan(
      [...sourceDocs].reverse(),
      [...citations].reverse(),
      [],
    )

    assert.deepEqual(sourceCitationProvenancePlanContract(forward), sourceCitationProvenancePlanContract(reverse))
    assert.deepEqual(forward.updates.map(update => update.sourceDocId), ['src-1', 'src-2'])
    assert.ok(forward.updates.every(update => update.expectedUpdatedAt === UPDATED_AT))
  })

  it('requires reviewed plan hash, locks, CAS, and one Serializable transaction', () => {
    const source = readFileSync('scripts/reconcile-source-citation-provenance.ts', 'utf8')
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
      scripts?: Record<string, string>
    }
    assert.equal(
      packageJson.scripts?.['repair:source-citation-provenance'],
      'tsx scripts/reconcile-source-citation-provenance.ts',
    )
    assert.match(source, /--apply requires --ack=\$\{APPLY_ACK\}/)
    assert.match(source, /--plan-sha256=<64 lowercase hex>/)
    assert.match(source, /pg_advisory_xact_lock/)
    assert.match(source, /FROM "SourceDoc"[\s\S]*FOR SHARE/)
    assert.match(source, /FROM "SourceCitation"[\s\S]*FOR UPDATE/)
    assert.match(source, /FROM "FieldCitation"[\s\S]*FOR SHARE/)
    assert.match(source, /inspectSourceCitationProvenance\(transaction, reviewedSources\)/)
    assert.match(source, /transaction\.sourceCitation\.updateMany/)
    assert.match(source, /updatedAt: new Date\(update\.expectedUpdatedAt\)/)
    assert.match(source, /isolationLevel: 'Serializable'/)
    assert.match(source, /zero rows were committed/)
    assert.doesNotMatch(source, /deleteMany|createMany|upsert/)
  })
})
