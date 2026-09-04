import test from 'node:test'
import assert from 'node:assert/strict'
import { planC1Indicators } from '../scripts/backfill-nordic-c1-retail-concentration'

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

test('planC1Indicators keeps derived HHI modelled with source method metadata', () => {
  const planned = planC1Indicators([
    {
      country: 'NO',
      metricType: 'hhi',
      category: 'dagligvare',
      value: 3327,
      unit: 'index',
      year: '2024',
      source: 'Beregnet fra markedsandeler',
      metadata: {
        methodLabel: 'derived_hhi_sum_of_squared_retailer_turnover_shares',
        sourceUrl: 'https://example.test/market-shares',
      },
    },
  ])

  const hhi = planned.find((p) => p.country === 'NO' && p.indicatorId === 'hhi')
  assert.equal(hhi?.quality, 'modelled')
  assert.deepEqual(hhi?.metadata.sourceMetadata, {
    methodLabel: 'derived_hhi_sum_of_squared_retailer_turnover_shares',
    sourceUrl: 'https://example.test/market-shares',
  })
})

test('planC1Indicators keeps derived margin rows modelled with source method metadata', () => {
  const sourceMetadata = {
    methodLabel: 'calculated_operating_margin',
    sourceUrl: 'https://example.test/annual-report',
  }
  const planned = planC1Indicators([
    {
      country: 'NO',
      metricType: 'margin',
      category: 'Test Retailer',
      value: 4.2,
      unit: '%',
      year: '2024',
      source: 'Annual report calculation',
      metadata: sourceMetadata,
    },
  ])

  for (const indicatorId of ['margin_top1', 'margin_banner_test-retailer']) {
    const margin = planned.find((row) => row.country === 'NO' && row.indicatorId === indicatorId)
    assert.equal(margin?.quality, 'modelled')
    assert.deepEqual(margin?.metadata.sourceMetadata, sourceMetadata)
  }
})

test('planC1Indicators keeps explicitly unreviewed internal margins at unknown quality', () => {
  const planned = planC1Indicators([
    {
      country: 'FI',
      metricType: 'margin',
      category: 'SOK (S Group)',
      value: 3.5,
      unit: '%',
      year: '2024',
      source: 'SOK Financial Statements Bulletin 2024',
      metadata: { sourceQuality: 'unverified_internal_financial' },
    },
  ])

  const margin = planned.find(row => row.country === 'FI' && row.indicatorId === 'margin_top1')
  assert.equal(margin?.value, 3.5)
  assert.equal(margin?.quality, 'unknown')
})
