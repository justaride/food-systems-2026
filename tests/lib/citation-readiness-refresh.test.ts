import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { buildCitationReadinessRefreshPlan } from '../../src/lib/citations/citation-readiness-refresh'

describe('citation readiness refresh planning', () => {
  it('re-derives blocked source citations from existing locator metadata only', () => {
    const plan = buildCitationReadinessRefreshPlan([
      {
        id: 'registry-verified',
        citationText: 'BRREG registry snapshot',
        citationReadiness: 'blocked_unsourced',
        sourceClass: 'registry_snapshot',
        verificationStatus: 'machine_verified',
        url: 'https://data.brreg.no/enhetsregisteret/api/enheter/819731322/roller',
        localPath: 'research/evidence-pack/bronnoysund-role-snapshots/819731322-roles-2026-05-18.json',
      },
      {
        id: 'primary-with-url',
        citationText: 'Official report URL',
        citationReadiness: 'blocked_unsourced',
        sourceClass: 'primary',
        verificationStatus: 'needs_review',
        url: 'https://example.com/report.pdf',
      },
      {
        id: 'internal',
        citationText: 'Internal synthesis note',
        citationReadiness: 'internal_context',
        sourceClass: 'internal_synthesis',
        verificationStatus: 'needs_review',
      },
      {
        id: 'label-only',
        citationText: 'Label only source',
        citationReadiness: 'blocked_unsourced',
        sourceClass: 'unknown',
        verificationStatus: 'needs_review',
      },
      {
        id: 'missing-local-only',
        citationText: 'Missing local-only file',
        citationReadiness: 'citable_with_note',
        sourceClass: 'primary',
        verificationStatus: 'needs_review',
        localPath: 'research/evidence-pack/missing.pdf',
      },
      {
        id: 'missing-local-with-url',
        citationText: 'Missing local archive with URL fallback',
        citationReadiness: 'citable_external',
        sourceClass: 'primary',
        verificationStatus: 'verified',
        url: 'https://example.com/source',
        localPath: 'research/evidence-pack/missing.json',
      },
    ])

    assert.deepEqual(
      plan.updates.map(update => ({
        id: update.id,
        from: update.fromReadiness,
        to: update.toReadiness,
      })),
      [
        { id: 'registry-verified', from: 'blocked_unsourced', to: 'citable_external' },
        { id: 'primary-with-url', from: 'blocked_unsourced', to: 'citable_with_note' },
      ],
    )
    assert.deepEqual(plan.countsByTransition, {
      'blocked_unsourced -> citable_external': 1,
      'blocked_unsourced -> citable_with_note': 1,
    })
    assert.equal(plan.skippedUnchanged, 4)
  })

  it('downgrades missing local-only external citations to internal context', () => {
    const plan = buildCitationReadinessRefreshPlan(
      [
        {
          id: 'missing-local-only',
          citationText: 'Missing local-only file',
          citationReadiness: 'citable_with_note',
          sourceClass: 'primary',
          verificationStatus: 'needs_review',
          localPath: 'research/evidence-pack/missing.pdf',
        },
        {
          id: 'missing-local-with-url',
          citationText: 'Missing local archive with URL fallback',
          citationReadiness: 'citable_external',
          sourceClass: 'primary',
          verificationStatus: 'verified',
          url: 'https://example.com/source',
          localPath: 'research/evidence-pack/missing.json',
        },
      ],
      { localPathExists: () => false },
    )

    assert.deepEqual(
      plan.updates.map(update => ({
        id: update.id,
        from: update.fromReadiness,
        to: update.toReadiness,
      })),
      [{ id: 'missing-local-only', from: 'citable_with_note', to: 'internal_context' }],
    )
  })
})
