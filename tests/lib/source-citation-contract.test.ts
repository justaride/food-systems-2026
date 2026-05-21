import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  hasDirectLocator,
  hasLocalEvidence,
  hasVerificationMetadata,
  validateSourceCitationInput,
} from '../../src/lib/citations/source-citation-contract'

describe('source citation contract', () => {
  it('recognizes direct locators across URL, archive, local file, and DB links', () => {
    assert.equal(hasDirectLocator({ url: 'https://example.com/report.pdf' }), true)
    assert.equal(hasDirectLocator({ archivedUrl: 'https://web.archive.org/example' }), true)
    assert.equal(hasDirectLocator({ localPath: 'research/evidence-pack/report.pdf' }), true)
    assert.equal(hasDirectLocator({ documentId: 'doc-1' }), true)
    assert.equal(hasDirectLocator({ sourceDocId: 'src-1' }), true)
    assert.equal(hasDirectLocator({ citationText: 'Årsrapport 2024' } as Parameters<typeof hasDirectLocator>[0]), false)
  })

  it('distinguishes local evidence from URL-only evidence', () => {
    assert.equal(hasLocalEvidence({ url: 'https://example.com/report.pdf' }), false)
    assert.equal(hasLocalEvidence({ localPath: 'research/evidence-pack/report.pdf' }), true)
    assert.equal(hasLocalEvidence({ documentId: 'doc-1' }), true)
    assert.equal(hasLocalEvidence({ sourceDocId: 'src-1' }), true)
    assert.equal(hasLocalEvidence({ fileHash: 'abc123' }), true)
  })

  it('recognizes verification metadata from access or verification timestamps', () => {
    assert.equal(hasVerificationMetadata({ accessedAt: '2026-05-20T00:00:00.000Z' }), true)
    assert.equal(hasVerificationMetadata({ verifiedAt: new Date('2026-05-20T00:00:00.000Z') }), true)
    assert.equal(hasVerificationMetadata({ verificationStatus: 'verified' }), true)
    assert.equal(hasVerificationMetadata({ verificationStatus: 'human_verified' }), true)
    assert.equal(hasVerificationMetadata({ verificationStatus: 'needs_review' }), false)
  })

  it('requires locator and verification metadata for citable_external', () => {
    assert.deepEqual(
      validateSourceCitationInput({
        citationText: 'Official report',
        citationReadiness: 'citable_external',
        url: 'https://example.com/report.pdf',
        accessedAt: '2026-05-20T00:00:00.000Z',
      }),
      [],
    )

    assert.deepEqual(
      validateSourceCitationInput({
        citationText: 'Official report',
        citationReadiness: 'citable_external',
      }).map(issue => issue.code),
      ['missing_direct_locator', 'missing_verification_metadata'],
    )
  })

  it('allows citable_with_note with locator even when page precision is missing', () => {
    assert.deepEqual(
      validateSourceCitationInput({
        citationText: 'Secondary report',
        citationReadiness: 'citable_with_note',
        url: 'https://example.com/secondary-report',
      }),
      [],
    )
  })

  it('keeps internal and blocked citations out of external validation requirements', () => {
    assert.deepEqual(
      validateSourceCitationInput({
        citationText: 'Internal synthesis',
        citationReadiness: 'internal_context',
      }),
      [],
    )
    assert.deepEqual(
      validateSourceCitationInput({
        citationText: 'Unresolved label',
        citationReadiness: 'blocked_unsourced',
      }),
      [],
    )
  })
})
