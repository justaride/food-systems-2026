import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildBrregIndex,
  normalizeCompanyName,
  resolveEstablishment,
  type BrregEntity,
  type BrregUnit,
} from '../../../../src/lib/map/registers/brreg-match'
import { countByKommune, publishDecision } from '../../../../src/lib/map/registers/privacy'

// Synthetic register rows with invented names and org numbers.
const units: BrregUnit[] = [
  { orgNr: '900000001', name: 'Testfisk AS avd Prøvested', postnummer: '9990', parentOrgNr: '800000001', employees: 42, closed: false },
  { orgNr: '900000002', name: 'Dobbeltnavn', postnummer: '9991', parentOrgNr: '800000002', employees: 3, closed: false },
  { orgNr: '900000003', name: 'Dobbeltnavn', postnummer: '9991', parentOrgNr: '800000002', employees: 4, closed: false },
  { orgNr: '900000004', name: 'Nedlagt Slakteri', postnummer: '9992', parentOrgNr: '800000003', employees: null, closed: true },
  { orgNr: '900000005', name: 'Foreldreløs', postnummer: '9993', parentOrgNr: '800000099', employees: 1, closed: false },
]
const entities: BrregEntity[] = [
  { orgNr: '800000001', name: 'Testfisk AS', postnummer: '9990', orgForm: 'AS', employees: 120 },
  { orgNr: '800000002', name: 'Dobbeltnavn SA', postnummer: '9991', orgForm: 'SA', employees: 7 },
  { orgNr: '800000003', name: 'Nedlagt Slakteri', postnummer: '9992', orgForm: 'ENK', employees: null },
  { orgNr: '800000004', name: 'Gardsmat Prøve', postnummer: '9994', orgForm: 'ENK', employees: 0 },
]
const index = buildBrregIndex(units, entities)

describe('normalizeCompanyName', () => {
  it('ignores case, punctuation and legal-form suffixes', () => {
    assert.equal(normalizeCompanyName('TESTFISK A.S.'), normalizeCompanyName('Testfisk AS'))
  })
})

describe('resolveEstablishment', () => {
  it('resolves a sub-unit orgnr to its parent and keeps the site head count', () => {
    assert.deepEqual(resolveEstablishment(index, { name: 'x', postnummer: '9990', orgNr: '900000001' }), {
      status: 'resolved',
      method: 'orgnr',
      orgNr: '800000001',
      orgForm: 'AS',
      employees: 42,
    })
  })

  it('accepts a main-entity orgnr directly', () => {
    const result = resolveEstablishment(index, { name: 'x', postnummer: '9990', orgNr: '800000001' })
    assert.equal(result.status === 'resolved' && result.employees, 120)
  })

  it('reports an orgnr missing from Brreg', () => {
    assert.deepEqual(resolveEstablishment(index, { name: 'x', postnummer: '9990', orgNr: '111111111' }), {
      status: 'unresolved',
      reason: 'unknown-orgnr',
    })
  })

  it('matches a unique name within the postnummer', () => {
    const result = resolveEstablishment(index, { name: 'Testfisk AS avd. Prøvested', postnummer: '9990' })
    assert.equal(result.status === 'resolved' && result.method, 'name-unit')
  })

  it('leaves ambiguous names unresolved', () => {
    assert.deepEqual(resolveEstablishment(index, { name: 'Dobbeltnavn', postnummer: '9991' }), {
      status: 'unresolved',
      reason: 'ambiguous',
    })
  })

  it('skips closed sub-units and falls back to the main entity', () => {
    const result = resolveEstablishment(index, { name: 'Nedlagt slakteri', postnummer: '9992' })
    assert.equal(result.status === 'resolved' && result.method, 'name-entity')
  })

  it('reports a sub-unit whose parent is not in the entity file', () => {
    assert.deepEqual(resolveEstablishment(index, { name: 'Foreldreløs', postnummer: '9993' }), {
      status: 'unresolved',
      reason: 'unknown-parent',
    })
  })
})

describe('publishDecision', () => {
  it('publishes organisations as points', () => {
    const resolution = resolveEstablishment(index, { name: 'x', postnummer: '9990', orgNr: '800000001' })
    assert.deepEqual(publishDecision(resolution), { publish: 'point' })
  })

  it('never publishes a sole proprietorship as a point', () => {
    const resolution = resolveEstablishment(index, { name: 'Gardsmat Prøve', postnummer: '9994' })
    assert.deepEqual(publishDecision(resolution), { publish: 'kommune-count', reason: 'sole-proprietorship' })
  })

  it('counts unresolved establishments per kommune only', () => {
    assert.deepEqual(publishDecision({ status: 'unresolved', reason: 'not-found' }), {
      publish: 'kommune-count',
      reason: 'unresolved',
    })
    assert.deepEqual(countByKommune(['5599', '5501', '5599']), { '5501': 1, '5599': 2 })
  })
})
