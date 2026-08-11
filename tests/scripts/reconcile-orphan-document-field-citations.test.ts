import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  chooseReplacement,
  resolveReplacementCohorts,
  type ReplacementDecision,
} from '../../scripts/reconcile-orphan-document-field-citations'

const documents = [
  { id: 'doc-a', slug: 'a', filePath: 'a.md', url: 'https://example.test/shared' },
  { id: 'doc-b', slug: 'b', filePath: 'b.md', url: 'https://example.test/shared' },
  { id: 'doc-c', slug: 'c', filePath: 'c.md', url: 'https://example.test/unique' },
]

describe('orphan Document FieldCitation replacement classification', () => {
  it('prefers a valid SourceCitation.documentId', () => {
    assert.deepEqual(
      chooseReplacement({ sourceDocumentId: 'doc-b', localPath: 'a.md', url: null }, documents),
      { kind: 'replace', replacementId: 'doc-b', basis: 'source_document_id' },
    )
  })

  it('uses an exact local path even when the URL is shared', () => {
    assert.deepEqual(
      chooseReplacement({ sourceDocumentId: null, localPath: 'a.md', url: 'https://example.test/shared' }, documents),
      { kind: 'replace', replacementId: 'doc-a', basis: 'local_path' },
    )
  })

  it('uses only an unambiguous URL match', () => {
    assert.deepEqual(
      chooseReplacement({ sourceDocumentId: null, localPath: null, url: 'https://example.test/unique' }, documents),
      { kind: 'replace', replacementId: 'doc-c', basis: 'url' },
    )
    assert.deepEqual(
      chooseReplacement({ sourceDocumentId: null, localPath: null, url: 'https://example.test/shared' }, documents),
      { kind: 'conflict', reason: 'url matches 2 Documents' },
    )
  })

  it('keeps an unmatched source in the reviewed disposition path', () => {
    assert.deepEqual(
      chooseReplacement({ sourceDocumentId: null, localPath: 'gone.md', url: null }, documents),
      { kind: 'unresolved', reason: 'no_current_document_match' },
    )
  })

  it('inherits an exact match only within the same historical Document cohort', () => {
    const decisions = resolveReplacementCohorts(
      [
        { id: 'path-binding', entityId: 'old-document' },
        { id: 'url-binding', entityId: 'old-document' },
        { id: 'unrelated', entityId: 'another-document' },
      ],
      new Map<string, ReplacementDecision>([
        ['path-binding', { kind: 'replace', replacementId: 'doc-a', basis: 'local_path' }],
        ['url-binding', { kind: 'conflict', reason: 'url matches 2 Documents' }],
        ['unrelated', { kind: 'unresolved', reason: 'no_current_document_match' }],
      ]),
    )
    assert.deepEqual(decisions.get('url-binding'), {
      kind: 'replace',
      replacementId: 'doc-a',
      basis: 'same_missing_document_cohort',
    })
    assert.deepEqual(decisions.get('unrelated'), {
      kind: 'unresolved',
      reason: 'no_current_document_match',
    })
  })

  it('fails closed when one historical Document maps to different replacements', () => {
    const decisions = resolveReplacementCohorts(
      [
        { id: 'one', entityId: 'old-document' },
        { id: 'two', entityId: 'old-document' },
      ],
      new Map<string, ReplacementDecision>([
        ['one', { kind: 'replace', replacementId: 'doc-a', basis: 'local_path' }],
        ['two', { kind: 'replace', replacementId: 'doc-b', basis: 'url' }],
      ]),
    )
    assert.deepEqual(decisions.get('one'), {
      kind: 'conflict',
      reason: 'same missing Document maps to 2 current Documents',
    })
    assert.deepEqual(decisions.get('two'), decisions.get('one'))
  })
})
