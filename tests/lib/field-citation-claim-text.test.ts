import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { buildCompanyNaceClaimText } from '../../src/lib/citations/field-citation-claim-text'

describe('field citation claim text helpers', () => {
  it('builds concise claim text for company NACE descriptions', () => {
    assert.equal(
      buildCompanyNaceClaimText({
        name: 'NorgesGruppen ASA',
        naceCode: '47.110',
        naceDescription:
          'Detaljhandel med bredt vareutvalg med hovedvekt på nærings- og nytelsesmidler',
      }),
      'NorgesGruppen ASA NACE 47.110: Detaljhandel med bredt vareutvalg med hovedvekt på nærings- og nytelsesmidler',
    )
  })

  it('returns null when a company has no NACE description to cite', () => {
    assert.equal(
      buildCompanyNaceClaimText({
        name: 'NorgesGruppen ASA',
        naceCode: '47.110',
        naceDescription: null,
      }),
      null,
    )
  })
})
