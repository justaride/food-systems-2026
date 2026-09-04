import test from 'node:test'
import assert from 'node:assert/strict'
import { planC1Indicators } from '../scripts/backfill-nordic-c1-retail-concentration.ts'

test('planC1Indicators derives CR3 and leaves IS margin holes', () => {
  const planned = planC1Indicators([
    { country: 'NO', metricType: 'hhi', category: 'dagligvare', value: 3327, unit: 'index', year: '2024', source: 't', metadata: null },
    { country: 'NO', metricType: 'retailerShare', category: 'NorgesGruppen', value: 43.5, unit: '%', year: '2024', source: 't', metadata: null },
    { country: 'NO', metricType: 'retailerShare', category: 'Coop', value: 29.2, unit: '%', year: '2024', source: 't', metadata: null },
    { country: 'NO', metricType: 'retailerShare', category: 'REMA 1000', value: 23.9, unit: '%', year: '2024', source: 't', metadata: null },
    { country: 'NO', metricType: 'retailerShare', category: 'Andre', value: 3.3, unit: '%', year: '2024', source: 't', metadata: null },
    { country: 'IS', metricType: 'hhi', category: 'dagligvare', value: 2378, unit: 'index', year: '2024', source: 't', metadata: null },
    { country: 'IS', metricType: 'retailerShare', category: 'Hagar', value: 31.5, unit: '%', year: '2024', source: 't', metadata: null },
    { country: 'IS', metricType: 'retailerShare', category: 'Samkaup', value: 26.5, unit: '%', year: '2024', source: 't', metadata: null },
    { country: 'IS', metricType: 'retailerShare', category: 'Festi', value: 18.5, unit: '%', year: '2024', source: 't', metadata: null },
    { country: 'IS', metricType: 'margin', category: 'Hagar hf', value: 5.79, unit: '%', year: '2024', source: 't', metadata: null },
  ])
  const noCr3 = planned.find((p) => p.country === 'NO' && p.indicatorId === 'cr3')
  assert.equal(noCr3?.value, 96.6)
  assert.equal(noCr3?.quality, 'modelled')
  const isTop2 = planned.find((p) => p.country === 'IS' && p.indicatorId === 'margin_top2')
  assert.equal(isTop2?.value, null)
  assert.equal(isTop2?.quality, 'unknown')
})
