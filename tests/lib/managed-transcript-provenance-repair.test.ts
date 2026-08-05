import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import {
  MANAGED_TRANSCRIPT_PROVENANCE_TARGET,
  PINNED_MANAGED_TRANSCRIPT_SOURCE_DOC_IDS_SHA256,
  buildManagedTranscriptProvenanceRepairPlan,
  sha256ManagedTranscriptJson,
  validateManagedTranscriptSourceDocIds,
  type ManagedTranscriptProvenanceRepairInput,
} from '../../src/lib/citations/managed-transcript-provenance-repair'

const MANAGED_IDS = [
  'src-yt--TkOU0IeVq0',
  'src-yt-6kP1Kfmzm9w',
  'src-yt-8JZSIH4WC5A',
  'src-yt-BOQZvBG_LBw',
  'src-yt-EMeYsB6Vk2Y',
  'src-yt-SgltfUW8Ymg',
  'src-yt-UPYj1SNHYdw',
  'src-yt-USSkCfpjGbM',
  'src-yt-W2VaX150Uw8',
  'src-yt-XcV4bZe0J_I',
  'src-yt-aPzdVR0eaI4',
  'src-yt-blx_7Jwq0Nc',
  'src-yt-cvT_rOtTDBo',
  'src-yt-fc50NCdLhL4',
  'src-yt-hALbwiwHdOM',
  'src-yt-n1qF1TRh2d0',
  'src-yt-nvb9MJdwIzA',
].sort()

function fixture(): ManagedTranscriptProvenanceRepairInput {
  const createdAt = new Date('2026-07-19T00:00:00.000Z')
  const sourceDocs = MANAGED_IDS.map((id, index) => {
    const videoId = id.slice('src-yt-'.length)
    const filename = `${String(index + 1).padStart(2, '0')}-${videoId}.txt`
    return {
      id,
      filename,
      title: `Transcript ${index + 1}`,
      author: 'Landbruk Arena',
      year: null,
      sourceType: 'transkripsjon',
      description: `YouTube video transcript from Landbruk Arena: Transcript ${index + 1}`,
      relevance: 'Primary source - video transcript of Norwegian agricultural content',
      url: `https://www.youtube.com/watch?v=${videoId}`,
      isDuplicate: false,
      doi: null,
      publisher: null,
      provenanceType: 'unknown',
      accessedAt: null,
      archivedUrl: null,
      documentId: `doc-${index + 1}`,
    }
  })
  const documents = sourceDocs.map((sourceDoc, index) => ({
    id: sourceDoc.documentId!,
    filePath: `landbrukarena_transcripts/${sourceDoc.filename}`,
    title: sourceDoc.title!,
    author: sourceDoc.author,
    documentType: 'transcript',
    category: 'landbrukarena-transcripts',
    url: sourceDoc.url,
    metadata: {
      videoId: sourceDoc.id.slice('src-yt-'.length),
      sourceScript: 'import-transcripts.ts',
      availabilityStatus: index < 3 ? 'transcript_fragment_unusable' : 'fulltext',
    },
    createdAt,
    updatedAt: createdAt,
  }))
  const sourceCitations = sourceDocs.flatMap((sourceDoc, index) => {
    const shared = {
      sourceClass: 'unknown',
      citationReadiness: 'blocked_unsourced',
      title: sourceDoc.title,
      publisher: null,
      author: sourceDoc.author,
      year: null,
      archivedUrl: null,
      localPath: null,
      fileHash: null,
      contentHash: null,
      hashAlgorithm: 'sha256',
      pageRef: null,
      quote: null,
      accessedAt: null,
      captureMethod: 'backfill',
      verifiedAt: null,
      verifiedBy: null,
      confidence: null,
      notes: null,
      createdAt,
      updatedAt: createdAt,
    }
    return [
      {
        ...shared,
        id: `citation-document-${index + 1}`,
        verificationStatus: 'needs_review',
        citationText: `Transcript document ${index + 1}`,
        url: null,
        documentId: sourceDoc.documentId,
        sourceDocId: sourceDoc.id,
      },
      {
        ...shared,
        id: `citation-url-${index + 1}`,
        verificationStatus: 'machine_verified',
        citationText: `Transcript URL ${index + 1}`,
        url: sourceDoc.url,
        documentId: null,
        sourceDocId: null,
      },
    ]
  })
  const fieldCitations = sourceDocs.flatMap((sourceDoc, index) => [
    {
      id: `field-document-${index + 1}`,
      citationId: `citation-document-${index + 1}`,
      entityType: 'SourceDoc',
      entityId: sourceDoc.id,
      fieldPath: 'documentId',
      claimText: null,
      confidence: null,
      createdAt,
    },
    {
      id: `field-url-${index + 1}`,
      citationId: `citation-url-${index + 1}`,
      entityType: 'SourceDoc',
      entityId: sourceDoc.id,
      fieldPath: 'url',
      claimText: null,
      confidence: null,
      createdAt,
    },
  ])
  const libraryAnalysisRecords = sourceDocs.map((sourceDoc, index) => ({
    id: `library-${index + 1}`,
    sourceKind: 'document',
    sourceKey: `document:${sourceDoc.documentId}`,
    documentId: sourceDoc.documentId,
    sourceDocId: sourceDoc.id,
    canonicalPath: `research/${sourceDoc.filename}`,
    title: sourceDoc.title!,
    status: index < 3 ? 'blocked' : 'ai_draft',
    usageRule: index < 3 ? 'do_not_use_for_claims' : 'internal_background',
    reviewStatus: 'not_required',
    citationReadiness: 'blocked_unsourced',
    analysisTier: 'triage_card',
    aiCard: null,
    aiSummary: null,
    keyFindings: [],
    claimCandidates: null,
    projectImplications: [],
    gaps: null,
    controlLinks: null,
    riskFlags: [],
    contentHash: null,
    wordCount: 100,
    processedAt: null,
    reviewedAt: null,
    reviewer: null,
    createdAt,
    updatedAt: createdAt,
  }))
  return { sourceDocs, documents, sourceCitations, fieldCitations, libraryAnalysisRecords }
}

describe('managed transcript provenance-only repair', () => {
  it('pins the exact 17-row manifest-derived identity set', () => {
    assert.deepEqual(validateManagedTranscriptSourceDocIds(MANAGED_IDS), MANAGED_IDS)
    assert.equal(sha256ManagedTranscriptJson(MANAGED_IDS), PINNED_MANAGED_TRANSCRIPT_SOURCE_DOC_IDS_SHA256)
    assert.throws(
      () => validateManagedTranscriptSourceDocIds(MANAGED_IDS.slice(1)),
      /exactly 17 unique/,
    )
    assert.throws(
      () => validateManagedTranscriptSourceDocIds([...MANAGED_IDS.slice(0, -1), 'src-yt-drift']),
      /drifted from the reviewed manifest/,
    )
  })

  it('plans provenance-only updates while preserving all fail-closed gates', () => {
    const plan = buildManagedTranscriptProvenanceRepairPlan(MANAGED_IDS, fixture())
    assert.equal(plan.conflicts.length, 0)
    assert.equal(plan.summary.total, 17)
    assert.equal(plan.summary.pending, 17)
    assert.equal(plan.summary.alreadyApplied, 0)
    assert.equal(plan.summary.citationGateChanges, 0)
    assert.equal(plan.summary.libraryPolicyChanges, 0)
    assert.equal(plan.updates.every(row => row.targetProvenanceType === MANAGED_TRANSCRIPT_PROVENANCE_TARGET), true)
    assert.deepEqual(plan.lockSet.sourceDocIds, MANAGED_IDS)
    assert.equal(plan.lockSet.documentIds.length, 17)
    assert.equal(plan.lockSet.sourceCitationIds.length, 34)
    assert.equal(plan.lockSet.fieldCitationIds.length, 34)
    assert.equal(plan.lockSet.libraryAnalysisRecordIds.length, 17)
  })

  it('is idempotent once all SourceDocs have the reviewed internal provenance', () => {
    const input = fixture()
    for (const row of input.sourceDocs) row.provenanceType = MANAGED_TRANSCRIPT_PROVENANCE_TARGET
    const plan = buildManagedTranscriptProvenanceRepairPlan(MANAGED_IDS, input)
    assert.equal(plan.conflicts.length, 0)
    assert.equal(plan.updates.length, 0)
    assert.deepEqual(plan.alreadyAppliedIds, MANAGED_IDS)
  })

  it('fails closed on identity, citation, or library-policy drift', () => {
    const input = fixture()
    input.sourceDocs[0]!.sourceType = 'rapport'
    input.sourceCitations[1]!.sourceClass = 'internal_primary'
    input.libraryAnalysisRecords[2]!.usageRule = 'citable_external'
    const plan = buildManagedTranscriptProvenanceRepairPlan(MANAGED_IDS, input)
    assert.equal(plan.conflicts.some(row => row.code === 'source_doc_identity_invalid'), true)
    assert.equal(plan.conflicts.some(row => row.code === 'source_citation_binding_invalid'), true)
    assert.equal(plan.conflicts.some(row => row.code === 'library_analysis_binding_invalid'), true)
    assert.equal(plan.conflicts.some(row => row.code === 'library_analysis_batch_invalid'), true)
  })

  it('requires a reviewed plan digest, strong acknowledgement, locks, CAS, and Serializable isolation', () => {
    const source = readFileSync('scripts/repair-managed-transcript-provenance.ts', 'utf8')
    assert.match(source, /APPLY_REVIEWED_MANAGED_TRANSCRIPT_PROVENANCE/)
    assert.match(source, /--plan-sha256=<64 lowercase hex>/)
    assert.match(source, /pg_advisory_xact_lock/)
    assert.match(source, /FOR UPDATE/)
    assert.match(source, /FOR SHARE/)
    assert.match(source, /sourceDocCasWhere/)
    assert.match(source, /isolationLevel: 'Serializable'/)
    assert.match(source, /preservedDependencyStateSha256/)
    assert.doesNotMatch(source, /transaction\.sourceCitation\.(?:update|updateMany|delete|deleteMany|create|createMany)/)
    assert.doesNotMatch(source, /transaction\.libraryAnalysisRecord\.(?:update|updateMany|delete|deleteMany|create|createMany)/)
  })

  it('makes future transcript imports explicitly internal without changing citation code', () => {
    const source = readFileSync('scripts/import-transcripts.ts', 'utf8')
    assert.equal(source.match(/provenanceType: 'internal_primary'/g)?.length, 2)
    assert.doesNotMatch(source, /sourceCitation\.(?:update|updateMany|upsert|create)/)
  })
})
