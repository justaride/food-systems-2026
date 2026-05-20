import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  deriveCitationReadiness,
  deriveVerificationStatus,
  explainCitationReadiness,
  mergeReadinessForCompositeClaim,
} from '../../src/lib/citations/citation-readiness'

describe('citation readiness derivation', () => {
  it('marks verified primary sources with direct locators as externally citable', () => {
    assert.equal(
      deriveCitationReadiness({
        sourceClass: 'primary',
        url: 'https://example.com/official-report.pdf',
        accessedAt: '2026-05-20T00:00:00.000Z',
      }),
      'citable_external',
    )
  })

  it('marks secondary sources without page precision as citable with note', () => {
    assert.equal(
      deriveCitationReadiness({
        sourceClass: 'secondary',
        url: 'https://example.com/analysis',
        accessedAt: '2026-05-20T00:00:00.000Z',
      }),
      'citable_with_note',
    )
  })

  it('keeps direct locators externally usable with a note when verification metadata is missing', () => {
    assert.equal(
      deriveCitationReadiness({
        sourceClass: 'primary',
        url: 'https://example.com/official-source',
      }),
      'citable_with_note',
    )
  })

  it('re-derives explicitly blocked legacy verified registry snapshots as external citations', () => {
    assert.equal(
      deriveCitationReadiness({
        citationReadiness: 'blocked_unsourced',
        sourceClass: 'registry_snapshot',
        verificationStatus: 'machine_verified',
        url: 'https://data.brreg.no/enhetsregisteret/api/enheter/819731322/roller',
        localPath: 'research/evidence-pack/bronnoysund-role-snapshots/819731322-roles-2026-05-18.json',
      }),
      'citable_external',
    )
  })

  it('keeps internal synthesis without linked sources internal-only', () => {
    assert.equal(
      deriveCitationReadiness({
        sourceClass: 'internal_synthesis',
        citationText: 'Internal synthesis note',
      }),
      'internal_context',
    )
    assert.equal(
      deriveCitationReadiness({
        sourceClass: 'synthesis',
        citationText: 'Legacy synthesis note',
      }),
      'internal_context',
    )
  })

  it('blocks label-only sources by default', () => {
    assert.equal(
      deriveCitationReadiness({
        citationText: 'Estimat basert på bransjedata',
        sourceClass: 'unknown',
      }),
      'blocked_unsourced',
    )
  })

  it('normalizes legacy verification statuses into the new status set', () => {
    assert.equal(deriveVerificationStatus({ verificationStatus: 'human_verified' }), 'verified')
    assert.equal(deriveVerificationStatus({ verificationStatus: 'machine_verified' }), 'verified')
    assert.equal(deriveVerificationStatus({ verificationStatus: 'disputed' }), 'failed')
    assert.equal(deriveVerificationStatus({ verificationStatus: 'unverified' }), 'needs_review')
    assert.equal(deriveVerificationStatus({ verifiedAt: '2026-05-20T00:00:00.000Z' }), 'verified')
  })

  it('explains blocking and citable outcomes', () => {
    assert.match(
      explainCitationReadiness({ citationText: 'Label only' }),
      /blocked_unsourced.*missing direct locator/i,
    )
    assert.match(
      explainCitationReadiness({
        sourceClass: 'primary',
        url: 'https://example.com/report.pdf',
        verifiedAt: '2026-05-20T00:00:00.000Z',
      }),
      /citable_external/i,
    )
  })

  it('merges composite claims by the weakest required citation', () => {
    assert.equal(
      mergeReadinessForCompositeClaim([
        { citationReadiness: 'citable_external' },
        { citationReadiness: 'citable_with_note' },
        { citationReadiness: 'internal_context' },
      ]),
      'internal_context',
    )
    assert.equal(mergeReadinessForCompositeClaim([]), 'blocked_unsourced')
  })
})
