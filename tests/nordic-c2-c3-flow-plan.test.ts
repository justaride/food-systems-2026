import test from 'node:test'
import assert from 'node:assert/strict'
import {
  planC2Flows,
  planC3Flows,
  C2_CELL_ID,
  C3_CELL_ID,
  COUNTRIES,
} from '../scripts/backfill-nordic-c2-c3-flow-skeletons.ts'

test('planC2Flows emits 5x4 unknown mass holes and never fills quantity', () => {
  const planned = planC2Flows({
    noCapacityContext: { siteCount: 250, sumTonnes: 988478, capacityUnit: 'TN/MTB' },
  })
  assert.equal(planned.length, 20)
  assert.ok(planned.every((p) => p.cellId === C2_CELL_ID))
  assert.ok(planned.every((p) => p.substance === 'mass'))
  assert.ok(planned.every((p) => p.unit === 't'))
  assert.ok(planned.every((p) => p.quality === 'unknown'))
  assert.ok(planned.every((p) => p.quantity == null))
  assert.ok(planned.every((p) => p.holeReason && p.holeReason.includes('True-C')))
  for (const c of COUNTRIES) {
    assert.equal(planned.filter((p) => p.country === c).length, 4)
  }
  const noMeta = planned.find((p) => p.country === 'NO')?.metadata.noLicensedCapacityContext as
    | { sumTonnes: number }
    | undefined
  assert.equal(noMeta?.sumTonnes, 988478)
  const seMeta = planned.find((p) => p.country === 'SE')?.metadata.noLicensedCapacityContext
  assert.equal(seMeta, undefined)
})

test('planC3Flows fills NO Totalt and SE retail+consumer; leaves DK hole; ignores per-capita', () => {
  const planned = planC3Flows([
    {
      country: 'NO',
      metricType: 'foodWaste',
      category: 'Totalt',
      value: 451000,
      unit: 'tonn',
      year: '2024',
      source: 'Matvett',
      metadata: null,
    },
    {
      country: 'NO',
      metricType: 'foodWastePerCapita',
      category: 'Totalt',
      value: 82,
      unit: 'kg/capita',
      year: '2024',
      source: 'Matvett',
      metadata: null,
    },
    {
      country: 'SE',
      metricType: 'foodWaste',
      category: 'retailAndConsumerStageTotal',
      value: 880000,
      unit: 'tonnes',
      year: '2024',
      source: 'Naturvardsverket',
      metadata: null,
    },
    {
      country: 'DK',
      metricType: 'foodWastePerCapita',
      category: 'Totalt',
      value: 79,
      unit: 'kg/capita',
      year: '2020',
      source: 'x',
      metadata: null,
    },
  ])

  assert.equal(planned.length, 20)
  assert.ok(planned.every((p) => p.cellId === C3_CELL_ID))

  const noEdge1 = planned.find(
    (p) =>
      p.country === 'NO' &&
      p.fromNode === 'household_municipal_waste' &&
      p.toNode === 'collection',
  )
  assert.equal(noEdge1?.quantity, 451000)
  assert.equal(noEdge1?.quality, 'measured')
  assert.equal(noEdge1?.year, 2024)

  const seEdge1 = planned.find(
    (p) =>
      p.country === 'SE' &&
      p.fromNode === 'household_municipal_waste' &&
      p.toNode === 'collection',
  )
  assert.equal(seEdge1?.quantity, 880000)
  assert.equal(seEdge1?.quality, 'measured')
  assert.ok(seEdge1?.holeReason?.includes('retail+consumer'))

  const dkEdge1 = planned.find(
    (p) =>
      p.country === 'DK' &&
      p.fromNode === 'household_municipal_waste' &&
      p.toNode === 'collection',
  )
  assert.equal(dkEdge1?.quantity, null)
  assert.equal(dkEdge1?.quality, 'unknown')
  assert.ok(dkEdge1?.holeReason?.includes('foodWastePerCapita'))

  const noDigestate = planned.find(
    (p) => p.country === 'NO' && p.fromNode === 'digestate' && p.toNode === 'land_application',
  )
  assert.equal(noDigestate?.quantity, null)
  assert.equal(noDigestate?.quality, 'unknown')
})
