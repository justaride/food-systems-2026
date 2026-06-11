import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import {
  MissingValue,
  formatCoverageFootnote,
  sortNullableNumberDesc,
} from '../../src/components/ui/MissingValue'

describe('MissingValue', () => {
  it('renders a standard dash with tooltip semantics for missing data', () => {
    const markup = renderToStaticMarkup(
      React.createElement(MissingValue, { reason: 'not_collected' }),
    )

    assert.match(markup, />—</)
    assert.match(markup, /title="Ikke innhentet"/)
    assert.match(markup, /aria-label="Ikke innhentet"/)
  })

  it('can explain missing financial rows without treating them as zero', () => {
    const markup = renderToStaticMarkup(
      React.createElement(MissingValue, {
        reason: 'no_financial_row',
        label: 'Mangler regnskap',
      }),
    )

    assert.match(markup, />Mangler regnskap</)
    assert.match(markup, /Ingen regnskapsrad er innhentet/)
  })
})

describe('missing-data helpers', () => {
  it('sorts numeric values descending while keeping null rows last and true zero above missing', () => {
    const rows = [
      { name: 'missing', value: null },
      { name: 'zero', value: 0 },
      { name: 'high', value: 100 },
    ]

    rows.sort((a, b) => sortNullableNumberDesc(a.value, b.value))

    assert.deepEqual(rows.map(row => row.name), ['high', 'zero', 'missing'])
  })

  it('formats aggregate coverage footnotes with X of Y denominator language', () => {
    assert.equal(
      formatCoverageFootnote('Samlet omsetning', 46, 127, 'selskaper'),
      'Samlet omsetning basert på 46 av 127 selskaper med data.',
    )
  })
})
