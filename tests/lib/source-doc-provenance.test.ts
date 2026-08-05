import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  knownSourceDocProvenance,
  normalizedSourceDocProvenance,
  sourceClassForSourceDocProvenance,
  sourceDocIsInternalEvidence,
  sourceDocNeedsPublicLocator,
} from '../../src/lib/citations/source-doc-provenance'

describe('SourceDoc provenance policy', () => {
  it('keeps unknown values fail-closed', () => {
    assert.equal(normalizedSourceDocProvenance(undefined), 'unknown')
    assert.equal(normalizedSourceDocProvenance('invented'), 'unknown')
    assert.equal(knownSourceDocProvenance('unknown'), null)
    assert.equal(sourceClassForSourceDocProvenance('unknown'), 'unknown')
    assert.equal(sourceDocNeedsPublicLocator({ provenanceType: 'unknown' }), false)
  })

  it('separates public-locator evidence from internal evidence', () => {
    assert.equal(sourceDocNeedsPublicLocator({ provenanceType: 'official_primary' }), true)
    assert.equal(sourceDocNeedsPublicLocator({ provenanceType: 'commissioned_report' }), true)
    assert.equal(sourceDocIsInternalEvidence({ provenanceType: 'internal_primary' }), true)
    assert.equal(sourceDocIsInternalEvidence({ provenanceType: 'duplicate' }), true)
    assert.equal(sourceClassForSourceDocProvenance('official_primary'), 'primary')
    assert.equal(sourceClassForSourceDocProvenance('peer_reviewed'), 'secondary')
    assert.equal(sourceClassForSourceDocProvenance('internal_primary'), 'internal_primary')
    assert.equal(sourceClassForSourceDocProvenance('duplicate'), 'legacy_unsourced')
  })
})
