import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { buildAddressIndex, geocode, type AddressRow } from '../../../../src/lib/map/registers/geocode'
import { geocodeAddressLines, selectWholesaleUnit } from '../../../../src/lib/map/registers/wholesale'

// Synthetic register rows with invented names.
const unit = (naceCode: string, name = 'Prøvegrossist AS avd Lager', employees: number | null = 20, closed = false) => ({
  naceCode,
  name,
  employees,
  closed,
})
const generalParent = { name: 'Prøvelogistikk AS', naceCode: '52.100' }

describe('selectWholesaleUnit', () => {
  it('keeps active food wholesale sites from 20 employees', () => {
    assert.deepEqual(selectWholesaleUnit(unit('46.390'), null), {
      include: true,
      group: 'wholesale',
      reason: 'food-wholesale',
    })
    assert.deepEqual(selectWholesaleUnit(unit('46.390', undefined, 19), null), { include: false, reason: 'too-small' })
    assert.deepEqual(selectWholesaleUnit(unit('46.390', undefined, null), null), { include: false, reason: 'too-small' })
  })

  it('drops closed units and other NACE codes', () => {
    assert.deepEqual(selectWholesaleUnit(unit('46.310', undefined, 50, true), null), { include: false, reason: 'closed' })
    assert.deepEqual(selectWholesaleUnit(unit('46.490', undefined, 50), null), { include: false, reason: 'other-nace' })
  })

  it('excludes tobacco wholesale', () => {
    assert.deepEqual(selectWholesaleUnit(unit('46.350', undefined, 50), null), { include: false, reason: 'tobacco' })
  })

  it('keeps warehousing only for a food parent or a food-storage name', () => {
    assert.deepEqual(selectWholesaleUnit(unit('52.100', 'Prøvelager AS'), { name: 'Prøvebakeri AS', naceCode: '10.710' }), {
      include: true,
      group: 'warehousing',
      reason: 'food-parent',
    })
    assert.equal(selectWholesaleUnit(unit('52.100', 'Prøve Fryseterminal AS'), generalParent).include, true)
    assert.equal(selectWholesaleUnit(unit('52.100', 'Prøvelager avd Kjøl'), generalParent).include, true)
    assert.equal(selectWholesaleUnit(unit('52.100', 'Prøvelager'), { name: 'Prøve Cold Storage AS', naceCode: '52.100' }).include, true)
    assert.deepEqual(selectWholesaleUnit(unit('52.100', 'Prøvelager AS'), generalParent), {
      include: false,
      reason: 'non-food-warehousing',
    })
  })

  it('matches food words only as whole words or prefixes', () => {
    assert.equal(selectWholesaleUnit(unit('52.100', 'Prøve Materiallager AS'), generalParent).include, false)
    assert.equal(selectWholesaleUnit(unit('52.100', 'Prøve Automatlager AS'), generalParent).include, false)
    assert.equal(selectWholesaleUnit(unit('52.100', 'Prøve Mat og Lager AS'), generalParent).include, true)
  })
})

describe('geocodeAddressLines', () => {
  const rows: AddressRow[] = [
    { postnummer: '9990', kommunenummer: '9901', adressenavn: 'Prøvevegen', nummer: '12', bokstav: '', adressetilleggsnavn: '', lat: 60.5, lon: 10.5 },
    { postnummer: '9990', kommunenummer: '9901', adressenavn: 'Andrevegen', nummer: '1', bokstav: '', adressetilleggsnavn: '', lat: 60.7, lon: 10.7 },
  ]
  const index = buildAddressIndex(rows)
  const line = (address: string, postnummer: string) => geocode(index, address, postnummer)

  it('uses the line that holds the street address', () => {
    const hit = geocodeAddressLines('Prøvebygget\nPrøvevegen 12', '9990', line)
    assert.deepEqual(hit, { coordinates: [10.5, 60.5], precision: 'address', kommunenummer: '9901' })
    assert.equal(geocodeAddressLines('Prøvebygget, Prøvevegen 12', '9990', line)?.precision, 'address')
  })

  it('falls back to the postnummer centroid when no line matches', () => {
    assert.equal(geocodeAddressLines('Ukjent 5', '9990', line)?.precision, 'postnummer')
    assert.equal(geocodeAddressLines('', '9990', line)?.precision, 'postnummer')
  })

  it('returns null for an unknown postnummer', () => {
    assert.equal(geocodeAddressLines('Prøvevegen 12', '1111', line), null)
  })
})
