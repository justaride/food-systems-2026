import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { sources } from '../../prisma/seed-data/sources'
import {
  PINNED_SOURCE_DOC_BIBLIOGRAPHIC_MANIFEST_SHA256,
  REVIEWED_SOURCE_DOC_BIBLIOGRAPHIC_REPAIRS,
  SOURCE_CITATION_BIBLIOGRAPHIC_MUTABLE_FIELDS,
  SOURCE_DOC_BIBLIOGRAPHIC_MUTABLE_FIELDS,
  SOURCE_DOC_BIBLIOGRAPHIC_REPAIR_IDS,
  buildSourceDocBibliographicRepairPlan,
  classifySourceCitationBibliographicSnapshot,
  classifySourceDocBibliographicSnapshot,
  sha256SourceDocBibliographicJson,
  sourceDocBibliographicManifestContract,
  sourceDocBibliographicRepairPlanContract,
  validateReviewedSourceDocBibliographicRepairs,
  validateSourceDocBibliographicSeedTargets,
  type SourceCitationBibliographicSnapshot,
  type SourceDocBibliographicSnapshot,
} from '../../src/lib/citations/source-doc-bibliographic-repair'

function beforeRows(): {
  sourceDocs: SourceDocBibliographicSnapshot[]
  citations: SourceCitationBibliographicSnapshot[]
} {
  return {
    sourceDocs: structuredClone(
      REVIEWED_SOURCE_DOC_BIBLIOGRAPHIC_REPAIRS.map(repair => repair.before.sourceDoc),
    ),
    citations: structuredClone(
      REVIEWED_SOURCE_DOC_BIBLIOGRAPHIC_REPAIRS.map(repair => repair.before.citation),
    ),
  }
}

function afterRows(updatedAt = '2026-07-19T20:00:00.000Z'): {
  sourceDocs: SourceDocBibliographicSnapshot[]
  citations: SourceCitationBibliographicSnapshot[]
} {
  return {
    sourceDocs: structuredClone(
      REVIEWED_SOURCE_DOC_BIBLIOGRAPHIC_REPAIRS.map(repair => repair.after.sourceDoc),
    ),
    citations: structuredClone(
      REVIEWED_SOURCE_DOC_BIBLIOGRAPHIC_REPAIRS.map(repair => ({
        ...repair.after.citation,
        updatedAt,
      })),
    ),
  }
}

describe('reviewed SLU SourceDoc/SourceCitation bibliographic repair', () => {
  it('pins the two exact reviewed records, their old database snapshots, and the manifest hash', () => {
    const repairs = validateReviewedSourceDocBibliographicRepairs()
    assert.equal(repairs.length, 2)
    assert.deepEqual(repairs.map(repair => repair.sourceDocId), [...SOURCE_DOC_BIBLIOGRAPHIC_REPAIR_IDS])
    assert.equal(
      sha256SourceDocBibliographicJson(sourceDocBibliographicManifestContract()),
      PINNED_SOURCE_DOC_BIBLIOGRAPHIC_MANIFEST_SHA256,
    )
    assert.equal(
      PINNED_SOURCE_DOC_BIBLIOGRAPHIC_MANIFEST_SHA256,
      '8dcf53a4a30a19e3e09055445349c9e44fa268ac500ec0b515a7da01d439f821',
    )

    const eriksson = repairs[0]!
    assert.equal(eriksson.before.sourceDoc.author, 'Mattias Eriksson (SLU)')
    assert.equal(eriksson.before.sourceDoc.url, null)
    assert.equal(
      eriksson.after.sourceDoc.title,
      'Supermarket food waste: prevention and management with the focus on reduced waste for reduced carbon footprint',
    )
    assert.equal(eriksson.after.sourceDoc.author, 'Mattias Eriksson')
    assert.equal(eriksson.after.sourceDoc.url, 'https://res.slu.se/id/publ/68633')

    const sundin = repairs[1]!
    assert.equal(sundin.before.sourceDoc.author, 'Nils Sundin (SLU)')
    assert.equal(sundin.before.sourceDoc.doi, '10.54612/a.2fjqatdg6h')
    assert.equal(sundin.after.sourceDoc.author, 'Niina Sundin')
    assert.equal(
      sundin.after.sourceDoc.title,
      'Sustainability of food waste prevention through food consumption',
    )
    assert.equal(sundin.after.sourceDoc.url, 'https://res.slu.se/id/publ/128772')

    for (const repair of repairs) {
      assert.equal(repair.after.sourceDoc.publisher, 'Swedish University of Agricultural Sciences')
      assert.equal(repair.after.sourceDoc.provenanceType, 'external_publication')
      assert.equal(repair.after.sourceDoc.accessedAt, '2026-07-19T00:00:00.000Z')
      assert.equal(repair.after.citation.title, repair.after.sourceDoc.title)
      assert.equal(repair.after.citation.author, repair.after.sourceDoc.author)
      assert.equal(repair.after.citation.publisher, repair.after.sourceDoc.publisher)
      assert.equal(repair.after.citation.url, repair.after.sourceDoc.url)
      assert.equal(repair.after.citation.accessedAt, repair.after.sourceDoc.accessedAt)
      assert.equal(
        repair.after.citation.citationText,
        `SourceDoc linked document: ${repair.after.sourceDoc.title}`,
      )
      assert.equal(repair.after.citation.sourceClass, 'secondary')
      assert.equal(repair.after.citation.citationReadiness, 'citable_with_note')
    }
    assert.equal(validateSourceDocBibliographicSeedTargets(sources), true)

    const driftedSeed = structuredClone(sources)
    driftedSeed.find(source => source.id === 'src-89')!.author = 'Unreviewed author'
    assert.throws(
      () => validateSourceDocBibliographicSeedTargets(driftedSeed),
      /seed bibliographic target drifted for src-89/,
    )
  })

  it('limits the reviewed changes while preserving verification, claim, file, hash, and DOI semantics', () => {
    assert.deepEqual(SOURCE_DOC_BIBLIOGRAPHIC_MUTABLE_FIELDS, [
      'title', 'author', 'url', 'publisher', 'provenanceType', 'accessedAt',
    ])
    assert.deepEqual(SOURCE_CITATION_BIBLIOGRAPHIC_MUTABLE_FIELDS, [
      'sourceClass', 'citationReadiness', 'citationText', 'title', 'publisher',
      'author', 'year', 'url', 'accessedAt',
    ])

    for (const repair of REVIEWED_SOURCE_DOC_BIBLIOGRAPHIC_REPAIRS) {
      assert.equal(repair.after.sourceDoc.doi, repair.before.sourceDoc.doi)
      for (const field of [
        'verificationStatus', 'archivedUrl', 'localPath', 'fileHash', 'contentHash',
        'hashAlgorithm', 'pageRef', 'quote', 'captureMethod', 'verifiedAt', 'verifiedBy',
        'confidence', 'notes', 'documentId', 'sourceDocId', 'createdAt', 'fieldCitations',
      ] as const) {
        assert.deepEqual(repair.after.citation[field], repair.before.citation[field])
      }
    }
  })

  it('builds a deterministic two-pair pending plan only from the exact pinned before-state', () => {
    const rows = beforeRows()
    const plan = buildSourceDocBibliographicRepairPlan(rows.sourceDocs, rows.citations)
    assert.deepEqual(plan.summary, { total: 2, pending: 2, alreadyApplied: 0, conflicts: 0 })
    assert.deepEqual(plan.updates.map(update => update.sourceDocId), ['src-88', 'src-89'])
    assert.ok(plan.updates.every(update => update.expectedCitation.updatedAt === '2026-07-19T19:37:35.477Z'))

    const reverse = buildSourceDocBibliographicRepairPlan(
      [...rows.sourceDocs].reverse(),
      [...rows.citations].reverse(),
    )
    assert.deepEqual(
      sourceDocBibliographicRepairPlanContract(plan),
      sourceDocBibliographicRepairPlanContract(reverse),
    )
  })

  it('is idempotent for the complete after-state regardless of the system-generated citation updatedAt', () => {
    const rows = afterRows()
    const plan = buildSourceDocBibliographicRepairPlan(rows.sourceDocs, rows.citations)
    assert.deepEqual(plan.summary, { total: 2, pending: 0, alreadyApplied: 2, conflicts: 0 })
    assert.deepEqual(plan.alreadyAppliedIds, ['src-88', 'src-89'])

    const repair = REVIEWED_SOURCE_DOC_BIBLIOGRAPHIC_REPAIRS[0]!
    assert.equal(classifySourceDocBibliographicSnapshot(
      repair.after.sourceDoc,
      repair,
    ), 'applied')
    assert.equal(classifySourceCitationBibliographicSnapshot(
      { ...repair.after.citation, updatedAt: '2030-01-01T00:00:00.000Z' },
      repair,
    ), 'applied')
  })

  it('fails closed on updatedAt drift, preserved evidence drift, partial state, and ambiguous bindings', () => {
    const updatedAtDrift = beforeRows()
    updatedAtDrift.citations[0]!.updatedAt = '2026-07-19T19:37:35.478Z'
    const updatedAtPlan = buildSourceDocBibliographicRepairPlan(
      updatedAtDrift.sourceDocs,
      updatedAtDrift.citations,
    )
    assert.ok(updatedAtPlan.conflicts.some(conflict =>
      conflict.sourceDocId === 'src-88' && conflict.code === 'source_citation_snapshot_drift'))

    const evidenceDrift = beforeRows()
    evidenceDrift.citations[1]!.quote = 'Unreviewed claim text'
    const evidencePlan = buildSourceDocBibliographicRepairPlan(
      evidenceDrift.sourceDocs,
      evidenceDrift.citations,
    )
    assert.ok(evidencePlan.conflicts.some(conflict =>
      conflict.sourceDocId === 'src-89' && conflict.code === 'source_citation_snapshot_drift'))

    const partial = beforeRows()
    partial.sourceDocs[0] = structuredClone(REVIEWED_SOURCE_DOC_BIBLIOGRAPHIC_REPAIRS[0]!.after.sourceDoc)
    const partialPlan = buildSourceDocBibliographicRepairPlan(partial.sourceDocs, partial.citations)
    assert.ok(partialPlan.conflicts.some(conflict =>
      conflict.sourceDocId === 'src-88' && conflict.code === 'partial_application'))

    const ambiguous = beforeRows()
    ambiguous.citations.push({ ...structuredClone(ambiguous.citations[0]!), id: 'unexpected-citation' })
    const ambiguousPlan = buildSourceDocBibliographicRepairPlan(
      ambiguous.sourceDocs,
      ambiguous.citations,
    )
    assert.ok(ambiguousPlan.conflicts.some(conflict =>
      conflict.sourceDocId === 'src-88' && conflict.code === 'ambiguous_source_citation'))

    const indirectAmbiguous = beforeRows()
    indirectAmbiguous.citations.push({
      ...structuredClone(indirectAmbiguous.citations[0]!),
      id: 'indirect-citation',
      sourceDocId: null,
      fieldCitations: [{
        ...structuredClone(indirectAmbiguous.citations[0]!.fieldCitations[0]!),
        id: 'indirect-field-citation',
        citationId: 'indirect-citation',
      }],
    })
    const indirectPlan = buildSourceDocBibliographicRepairPlan(
      indirectAmbiguous.sourceDocs,
      indirectAmbiguous.citations,
    )
    assert.ok(indirectPlan.conflicts.some(conflict =>
      conflict.sourceDocId === 'src-88' && conflict.code === 'ambiguous_source_citation'))
  })

  it('requires reviewed plan acknowledgement, row locks, full CAS, and one Serializable transaction', () => {
    const source = readFileSync('scripts/repair-source-doc-bibliography.ts', 'utf8')
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
      scripts?: Record<string, string>
    }
    assert.equal(
      packageJson.scripts?.['repair:source-doc-bibliography'],
      'tsx scripts/repair-source-doc-bibliography.ts',
    )
    assert.match(source, /--apply requires --ack=\$\{APPLY_ACK\}/)
    assert.match(source, /--plan-sha256=<64 lowercase hex>/)
    assert.match(source, /pg_advisory_xact_lock/)
    assert.match(source, /FROM "SourceDoc"[\s\S]*FOR UPDATE/)
    assert.match(source, /FROM "SourceCitation"[\s\S]*FOR UPDATE/)
    assert.match(source, /FROM "FieldCitation"[\s\S]*FOR SHARE/)
    assert.match(source, /inspectSourceDocBibliography\(transaction\)/)
    assert.match(source, /sourceDocCasWhere\(update\.expectedSourceDoc\)/)
    assert.match(source, /sourceCitationCasWhere\(update\.expectedCitation\)/)
    assert.match(source, /updatedAt: new Date\(expected\.updatedAt\)/)
    assert.match(source, /afterPlan\.updates\.length > 0/)
    assert.match(source, /isolationLevel: 'Serializable'/)
    assert.match(source, /zero rows were committed/)
    assert.doesNotMatch(source, /deleteMany|createMany|upsert/)

    const citationCas = source.match(
      /function sourceCitationCasWhere\([\s\S]*?\n}\n\nasync function findCasPreflightMismatches/,
    )?.[0] ?? ''
    for (const field of [
      'sourceClass', 'citationReadiness', 'verificationStatus', 'citationText', 'title',
      'publisher', 'author', 'year', 'url', 'archivedUrl', 'localPath', 'fileHash',
      'contentHash', 'hashAlgorithm', 'pageRef', 'quote', 'accessedAt', 'captureMethod',
      'verifiedAt', 'verifiedBy', 'confidence', 'notes', 'documentId', 'sourceDocId',
      'createdAt', 'updatedAt',
    ]) {
      assert.match(citationCas, new RegExp(`${field}:`), `citation CAS must include ${field}`)
    }
  })
})
