import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  assertExternalCitationReadiness,
  canUseExternally,
  filterExternalRecords,
  summarizeExternalExclusions,
} from '../../src/lib/citations/citable-record-filter'

describe('citable record filter', () => {
  it('fails closed when a record has no citation array', () => {
    assert.equal(canUseExternally({ id: 'missing-citations' }), false)
    assert.throws(
      () => assertExternalCitationReadiness([{ id: 'missing-citations' }], 'public export'),
      /public export.*missing-citations.*missing citations/i,
    )
  })

  it('excludes blocked and internal citations from external outputs', () => {
    assert.equal(
      canUseExternally({
        id: 'blocked',
        citations: [{ citationReadiness: 'blocked_unsourced', citationText: 'Label only' }],
      }),
      false,
    )
    assert.equal(
      canUseExternally({
        id: 'internal',
        citations: [{ citationReadiness: 'internal_context', citationText: 'Internal synthesis' }],
      }),
      false,
    )
  })

  it('allows citable_with_note only when a note is available', () => {
    assert.equal(
      canUseExternally({
        id: 'missing-note',
        citations: [{ citationReadiness: 'citable_with_note', citationText: 'Secondary source' }],
      }),
      false,
    )
    assert.equal(
      canUseExternally({
        id: 'with-note',
        citations: [
          {
            citationReadiness: 'citable_with_note',
            citationText: 'Secondary source',
            note: 'Use with method caveat.',
          },
        ],
      }),
      true,
    )
  })

  it('filters externally usable records and summarizes exclusions', () => {
    const records = [
      {
        id: 'ready',
        citations: [{ citationReadiness: 'citable_external', citationText: 'Official report' }],
      },
      {
        id: 'blocked',
        citations: [{ citationReadiness: 'blocked_unsourced', citationText: 'Label only' }],
      },
      {
        id: 'internal',
        citations: [{ citationReadiness: 'internal_context', citationText: 'Internal synthesis' }],
      },
      { id: 'missing-citations' },
    ]

    assert.deepEqual(filterExternalRecords(records).map(record => record.id), ['ready'])
    assert.deepEqual(summarizeExternalExclusions(records), {
      total: 4,
      usable: 1,
      excluded: 3,
      byReason: {
        blocked_unsourced: 1,
        internal_context: 1,
        missing_citations: 1,
      },
    })
  })
})
