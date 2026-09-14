import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { buildAddressIndex, geocode, normalizeAddress, type AddressRow } from '../../../../src/lib/map/registers/geocode'

function row(extra: Partial<AddressRow>): AddressRow {
  return {
    postnummer: '9990',
    kommunenummer: '5599',
    adressenavn: '',
    nummer: '',
    bokstav: '',
    adressetilleggsnavn: '',
    lat: 70,
    lon: 25,
    ...extra,
  }
}

// Synthetic addresses in an invented postnummer; no real establishments.
const index = buildAddressIndex([
  row({ adressenavn: 'Testgata', nummer: '12', lat: 70.1, lon: 25.1 }),
  row({ adressenavn: 'Testgata', nummer: '14', bokstav: 'B', lat: 70.2, lon: 25.2 }),
  row({ adressetilleggsnavn: 'Prøvegården', lat: 70.3, lon: 25.3 }),
  row({ adressenavn: 'Kaivegen', nummer: '1', lat: 70.6, lon: 25.6, kommunenummer: '5598' }),
])

describe('normalizeAddress', () => {
  it('expands a standalone "gt." and joins a house-number letter', () => {
    assert.equal(normalizeAddress('Test gt. 14 B'), 'test gate 14b')
  })
})

describe('geocode', () => {
  it('returns the exact address point for street, number and postnummer', () => {
    assert.deepEqual(geocode(index, 'Testgata 12', '9990'), {
      coordinates: [25.1, 70.1],
      precision: 'address',
      kommunenummer: '5599',
    })
  })

  it('matches a house-number letter and ignores trailing unit details', () => {
    assert.equal(geocode(index, 'Testgata 14 B, 2. etasje', '9990')?.precision, 'address')
  })

  it('falls back to a named place in the same postnummer', () => {
    assert.equal(geocode(index, 'Prøvegården', '9990')?.precision, 'place-name')
  })

  it('falls back to the postnummer centroid and its majority kommune', () => {
    const result = geocode(index, 'Ukjentvegen 7', '9990')
    assert.equal(result?.precision, 'postnummer')
    assert.equal(result?.kommunenummer, '5599')
    assert.ok(Math.abs((result?.coordinates[1] ?? 0) - 70.3) < 1e-9)
  })

  it('pads a three-digit postnummer', () => {
    const padded = buildAddressIndex([row({ postnummer: '0150', adressenavn: 'Testgata', nummer: '1' })])
    assert.equal(geocode(padded, 'Testgata 1', '150')?.precision, 'address')
  })

  it('returns null for an unknown postnummer', () => {
    assert.equal(geocode(index, 'Testgata 12', '1234'), null)
  })
})
