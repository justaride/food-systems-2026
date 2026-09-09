import assert from 'node:assert/strict'
import test from 'node:test'
import {
  MAX_EMBEDDING_INPUT_CHARS,
  assertBoundedSelection,
  planCandidate,
  type EmbeddingCandidate,
} from '../../src/lib/embedding-job'

function citation(overrides: Partial<EmbeddingCandidate['sourceCitations'][number]> = {}) {
  return {
    sourceDocId: 'src-1',
    sourceClass: 'primary',
    citationReadiness: 'citable_external',
    verificationStatus: 'verified',
    url: 'https://example.test/source',
    archivedUrl: null,
    accessedAt: '2026-09-09T00:00:00.000Z',
    ...overrides,
  }
}

function candidate(overrides: Partial<EmbeddingCandidate> = {}): EmbeddingCandidate {
  return {
    id: 'doc-1',
    slug: 'source',
    title: 'Source',
    content: 'Qualified source text',
    documentType: 'report',
    embeddingPresent: false,
    sourceDoc: { id: 'src-1', provenanceType: 'external_primary' },
    sourceCitations: [citation()],
    ...overrides,
  }
}

test('selection must be explicit and pilot-sized', () => {
  assert.throws(() => assertBoundedSelection([], null), /bounded pilot/)
  assert.throws(() => assertBoundedSelection([], 21), /1 to 20/)
  assert.doesNotThrow(() => assertBoundedSelection(['doc-1'], null))
})

test('long content is rejected rather than truncated', () => {
  const row = planCandidate(candidate({ content: 'x'.repeat(MAX_EMBEDDING_INPUT_CHARS) }))
  assert.equal(row.eligibility, 'rejected')
  assert.equal(row.reason, 'input_too_long_no_truncation')
  assert.ok(row.inputChars > MAX_EMBEDDING_INPUT_CHARS)
})

test('private, unknown and composite source identities fail closed', () => {
  assert.equal(
    planCandidate(candidate({ sourceDoc: { id: 'src-1', provenanceType: 'internal_primary' } })).reason,
    'source_provenance_not_approved_for_external_processing',
  )
  assert.equal(
    planCandidate(candidate({ sourceDoc: { id: 'src-1', provenanceType: 'unknown' } })).reason,
    'source_provenance_not_approved_for_external_processing',
  )
  assert.equal(
    planCandidate(candidate({ sourceDoc: { id: 'src-1', provenanceType: 'composite_source' } })).reason,
    'source_provenance_not_approved_for_external_processing',
  )
  assert.equal(planCandidate(candidate({ documentType: 'quarantined_synthetic' })).reason, 'quarantined_source')
})

test('a qualified citation must be public, verified and bound to the candidate SourceDoc', () => {
  assert.equal(
    planCandidate(candidate({ sourceCitations: [citation({ sourceDocId: 'src-other' })] })).reason,
    'missing_qualified_source_citation',
  )
  assert.equal(
    planCandidate(candidate({ sourceCitations: [citation({ citationReadiness: 'citable_with_note' })] })).reason,
    'missing_qualified_source_citation',
  )
  assert.equal(
    planCandidate(candidate({ sourceCitations: [citation({ url: 'file:///private/source.pdf' })] })).reason,
    'missing_qualified_source_citation',
  )
  assert.equal(
    planCandidate(candidate({ sourceCitations: [citation({ verificationStatus: 'partially_verified' })] })).reason,
    'missing_qualified_source_citation',
  )
})

test('content hash changes with exact content', () => {
  assert.notEqual(
    planCandidate(candidate()).contentSha256,
    planCandidate(candidate({ content: 'Changed source text' })).contentSha256,
  )
})
