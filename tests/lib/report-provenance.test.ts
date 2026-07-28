import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  applyReportProvenanceCitationCeiling,
  knownReportProvenance,
  normalizedReportProvenance,
  reportIsInternalEvidence,
  reportNeedsPublicLocator,
  reportProvenanceCitationCeiling,
} from '../../src/lib/citations/report-provenance'

describe('Report provenance policy', () => {
  it('keeps unknown values fail-closed', () => {
    assert.equal(normalizedReportProvenance(undefined), 'unknown')
    assert.equal(normalizedReportProvenance('invented'), 'unknown')
    assert.equal(knownReportProvenance(null), null)
    assert.equal(reportNeedsPublicLocator({ provenanceType: 'unknown' }), false)
  })

  it('separates external works from internal, composite, and blocked records', () => {
    assert.equal(reportNeedsPublicLocator({ provenanceType: 'external_report' }), true)
    assert.equal(reportNeedsPublicLocator({ provenanceType: 'external_article' }), true)
    assert.equal(reportIsInternalEvidence({ provenanceType: 'internal_synthesis' }), true)
    assert.equal(reportIsInternalEvidence({ provenanceType: 'internal_register' }), true)
    assert.equal(reportIsInternalEvidence({ provenanceType: 'composite_source' }), true)
    assert.equal(reportIsInternalEvidence({ provenanceType: 'blocked_source' }), true)
  })

  it('applies a fail-closed row-level citation ceiling without creating a composite exception', () => {
    assert.equal(
      reportProvenanceCitationCeiling({ provenanceType: 'unexpected_value' }),
      'blocked_unsourced',
    )
    assert.equal(reportProvenanceCitationCeiling({}), null)
    assert.equal(reportProvenanceCitationCeiling({ provenanceType: 'blocked_source' }), 'blocked_unsourced')
    for (const provenanceType of ['internal_synthesis', 'internal_register', 'composite_source']) {
      assert.equal(reportProvenanceCitationCeiling({ provenanceType }), 'internal_context')
      assert.equal(applyReportProvenanceCitationCeiling({ provenanceType }, 'citable_external'), 'internal_context')
    }
    assert.equal(
      applyReportProvenanceCitationCeiling({ provenanceType: 'blocked_source' }, 'citable_external'),
      'blocked_unsourced',
    )
    assert.equal(
      applyReportProvenanceCitationCeiling({ provenanceType: 'internal_synthesis' }, 'blocked_unsourced'),
      'blocked_unsourced',
    )
    assert.equal(reportProvenanceCitationCeiling({ provenanceType: 'external_report' }), null)
  })
})
