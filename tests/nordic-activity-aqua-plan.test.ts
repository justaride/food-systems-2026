import test from 'node:test'
import assert from 'node:assert/strict'
import {
  planAquaNoActivitySignals,
  SIGNAL_TYPE,
  AQUA_PASS,
} from '../scripts/backfill-nordic-activity-signals-aqua-no.ts'

test('planAquaNoActivitySignals includes TN/MTB and excludes STK/DA', () => {
  const planned = planAquaNoActivitySignals([
    {
      id: 'tn-1',
      country: 'NO',
      capacityTonnes: 3120,
      capacityUnit: 'TN',
      licenseStatus: 'aktiv',
      licenseIssuedYear: null,
      source: 'fiskeridir',
    },
    {
      id: 'mtb-1',
      country: 'NO',
      capacityTonnes: 1000,
      capacityUnit: 'MTB',
      licenseStatus: 'aktiv',
      licenseIssuedYear: 2020,
      source: null,
    },
    {
      id: 'stk-1',
      country: 'NO',
      capacityTonnes: 50000,
      capacityUnit: 'STK',
      licenseStatus: 'aktiv',
      licenseIssuedYear: null,
      source: 'fiskeridir',
    },
    {
      id: 'da-1',
      country: 'NO',
      capacityTonnes: 10,
      capacityUnit: 'DA',
      licenseStatus: 'aktiv',
      licenseIssuedYear: null,
      source: 'fiskeridir',
    },
    {
      id: 'se-1',
      country: 'SE',
      capacityTonnes: 100,
      capacityUnit: 'TN',
      licenseStatus: 'aktiv',
      licenseIssuedYear: null,
      source: 'x',
    },
  ])

  assert.equal(planned.length, 2)
  assert.ok(planned.every((p) => p.signalType === SIGNAL_TYPE))
  assert.ok(planned.every((p) => p.domain === 'seafood'))
  assert.ok(planned.every((p) => p.unit === 't'))
  assert.ok(planned.every((p) => p.metadata.pass === AQUA_PASS))
  assert.deepEqual(
    planned.map((p) => p.entityId).sort(),
    ['mtb-1', 'tn-1'],
  )
  const mtb = planned.find((p) => p.entityId === 'mtb-1')
  assert.equal(mtb?.year, 2020)
  assert.equal(mtb?.source, 'fiskeridir')
})

test('planAquaNoActivitySignals prefers active status when present', () => {
  const planned = planAquaNoActivitySignals([
    {
      id: 'active',
      country: 'NO',
      capacityTonnes: 100,
      capacityUnit: 'TN',
      licenseStatus: 'aktiv',
      licenseIssuedYear: null,
      source: 'fiskeridir',
    },
    {
      id: 'paused',
      country: 'NO',
      capacityTonnes: 200,
      capacityUnit: 'TN',
      licenseStatus: 'paused',
      licenseIssuedYear: null,
      source: 'fiskeridir',
    },
  ])
  assert.equal(planned.length, 1)
  assert.equal(planned[0]?.entityId, 'active')
})
