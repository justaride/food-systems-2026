import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  CITATION_READINESS_LEVELS,
  compareCitationReadiness,
  isBlockedForExternalUse,
  isExternallyCitable,
  normalizeCitationReadiness,
} from '../../src/lib/citations/citation-status'

describe('citation readiness status helpers', () => {
  it('exports the canonical readiness levels in plan order', () => {
    assert.deepEqual(CITATION_READINESS_LEVELS, [
      'citable_external',
      'citable_with_note',
      'internal_context',
      'blocked_unsourced',
    ])
  })

  it('allows only citable readiness levels for external use', () => {
    assert.equal(isExternallyCitable('citable_external'), true)
    assert.equal(isExternallyCitable('citable_with_note'), true)
    assert.equal(isExternallyCitable('internal_context'), false)
    assert.equal(isExternallyCitable('blocked_unsourced'), false)
  })

  it('blocks internal and unsourced levels from external use', () => {
    assert.equal(isBlockedForExternalUse('citable_external'), false)
    assert.equal(isBlockedForExternalUse('citable_with_note'), false)
    assert.equal(isBlockedForExternalUse('internal_context'), true)
    assert.equal(isBlockedForExternalUse('blocked_unsourced'), true)
  })

  it('normalizes unknown, empty, and null-like values to blocked_unsourced', () => {
    assert.equal(normalizeCitationReadiness('citable_external'), 'citable_external')
    assert.equal(normalizeCitationReadiness(' Citable-With-Note '), 'citable_with_note')
    assert.equal(normalizeCitationReadiness(''), 'blocked_unsourced')
    assert.equal(normalizeCitationReadiness('needs-primary-check'), 'blocked_unsourced')
    assert.equal(normalizeCitationReadiness(null), 'blocked_unsourced')
    assert.equal(normalizeCitationReadiness(undefined), 'blocked_unsourced')
  })

  it('compares readiness levels by external-use strength', () => {
    assert.equal(compareCitationReadiness('internal_context', 'internal_context'), 0)
    assert.ok(compareCitationReadiness('citable_external', 'citable_with_note') > 0)
    assert.ok(compareCitationReadiness('citable_with_note', 'internal_context') > 0)
    assert.ok(compareCitationReadiness('blocked_unsourced', 'internal_context') < 0)
    assert.ok(compareCitationReadiness('unknown', 'citable_external') < 0)
  })
})
