import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { normalizeInsightCitationFields } from '../../src/lib/insight-citations'

describe('insight citation helpers', () => {
  it('keeps the legacy source while deriving a structured display label', () => {
    assert.deepEqual(
      normalizeInsightCitationFields({
        source: 'Forskningsbibliotek',
      }),
      {
        source: 'Forskningsbibliotek',
        sourceLabel: 'Forskningsbibliotek',
        primaryCitationId: null,
      },
    )
  })

  it('preserves explicit structured citation fields', () => {
    assert.deepEqual(
      normalizeInsightCitationFields({
        source: 'legacy-import-id',
        sourceLabel: 'NIBIO selvforsyningsgrad',
        primaryCitationId: 'cit-nibio-2026',
      }),
      {
        source: 'legacy-import-id',
        sourceLabel: 'NIBIO selvforsyningsgrad',
        primaryCitationId: 'cit-nibio-2026',
      },
    )
  })
})
