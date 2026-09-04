import test from 'node:test'
import assert from 'node:assert/strict'
import {
  formatSpineNumber,
  isHoleQuality,
  shapeFlowMatrix,
  shapeIndicatorMatrix,
  scoreboardCounts,
  summarizeActivitySignals,
  toDisplayCell,
  truncateHoleReason,
} from '../../src/lib/nordic-spine'

test('isHoleQuality treats null and unknown as holes', () => {
  assert.equal(isHoleQuality('unknown', null), true)
  assert.equal(isHoleQuality('measured', null), true)
  assert.equal(isHoleQuality('measured', 451000), false)
  assert.equal(isHoleQuality('unknown', 0), true)
})

test('truncateHoleReason fails closed with default and ellipsis', () => {
  assert.match(truncateHoleReason(null), /True-C hole/)
  const long = 'x'.repeat(100)
  const out = truncateHoleReason(long, 40)
  assert.ok(out.endsWith('…'))
  assert.ok(out.length <= 40)
})

test('toDisplayCell renders value vs hole chips', () => {
  const value = toDisplayCell({
    value: 96.6,
    unit: 'percent',
    year: 2024,
    quality: 'modelled',
  })
  assert.equal(value.kind, 'value')
  if (value.kind === 'value') {
    assert.match(value.text, /96/)
    assert.match(value.meta, /2024/)
  }

  const hole = toDisplayCell({
    value: null,
    unit: 'percent',
    year: 2024,
    quality: 'unknown',
    holeReason: 'IS retailer margin panel incomplete (e.g. Samkaup missing operating margin)',
  })
  assert.equal(hole.kind, 'hole')
  if (hole.kind === 'hole') {
    assert.equal(hole.text, 'Hole 2024')
    assert.match(hole.reason, /Samkaup/)
  }
})

test('shapeIndicatorMatrix builds country columns with holes', () => {
  const matrix = shapeIndicatorMatrix(
    [
      { country: 'NO', indicatorId: 'hhi', year: 2024, value: 3327, unit: 'index', quality: 'measured' },
      { country: 'FI', indicatorId: 'margin_top3', year: 2024, value: null, unit: 'percent', quality: 'unknown', holeReason: 'Fewer than 3 retailer margin rows for 2024' },
    ],
    ['hhi', 'margin_top3'],
  )
  assert.equal(matrix.length, 2)
  assert.equal(matrix[0]!.cells.NO.kind, 'value')
  assert.equal(matrix[0]!.cells.SE.kind, 'missing')
  assert.equal(matrix[1]!.cells.FI.kind, 'hole')
})

test('shapeFlowMatrix keeps 5×4 edge order and unknown holes', () => {
  const matrix = shapeFlowMatrix(
    [
      {
        country: 'NO',
        year: 2024,
        substance: 'mass',
        fromNode: 'aquaculture_site',
        toNode: 'sludge_generated',
        quantity: null,
        unit: 't',
        quality: 'unknown',
        holeReason: 'No measured sludge',
      },
      {
        country: 'NO',
        year: 2024,
        substance: 'mass',
        fromNode: 'household_municipal_waste',
        toNode: 'collection',
        quantity: 451000,
        unit: 't',
        quality: 'measured',
      },
    ],
    [
      { fromNode: 'aquaculture_site', toNode: 'sludge_generated' },
      { fromNode: 'household_municipal_waste', toNode: 'collection' },
    ],
  )
  assert.equal(matrix[0]!.cells.NO.kind, 'hole')
  assert.equal(matrix[1]!.cells.NO.kind, 'value')
  if (matrix[1]!.cells.NO.kind === 'value') {
    assert.match(matrix[1]!.cells.NO.text, /451/)
  }
})

test('shapeFlowMatrix preserves the requested substance for same-year edges', () => {
  const matrix = shapeFlowMatrix(
    [
      {
        country: 'NO',
        year: 2024,
        substance: 'N',
        fromNode: 'digestate',
        toNode: 'land_application',
        quantity: 15,
        unit: 't N',
        quality: 'measured',
      },
      {
        country: 'NO',
        year: 2024,
        substance: 'mass',
        fromNode: 'digestate',
        toNode: 'land_application',
        quantity: 451000,
        unit: 't',
        quality: 'measured',
      },
    ],
    [{ substance: 'mass', fromNode: 'digestate', toNode: 'land_application' }],
  )

  assert.equal(matrix[0]?.substance, 'mass')
  assert.equal(matrix[0]?.cells.NO.kind, 'value')
  if (matrix[0]?.cells.NO.kind === 'value') {
    assert.equal(matrix[0].cells.NO.text, '451 000 t')
  }
})

test('summarizeActivitySignals keeps only the current pass and latest year', () => {
  const summary = summarizeActivitySignals([
    {
      entityId: 'site-a',
      year: 2023,
      value: 90,
      metadata: { pass: 'nordic-activity-aqua-no-2026-09-04' },
    },
    {
      entityId: 'site-a',
      year: 2024,
      value: 100,
      metadata: { pass: 'nordic-activity-aqua-no-2026-09-04' },
    },
    {
      entityId: 'site-b',
      year: 2024,
      value: 200,
      metadata: { pass: 'nordic-activity-aqua-no-2026-09-04' },
    },
    {
      entityId: 'site-a',
      year: 2024,
      value: 125,
      metadata: { pass: 'nordic-activity-aqua-no-2026-09-04' },
    },
    {
      entityId: 'site-other-pass',
      year: 2024,
      value: 999,
      metadata: { pass: 'another-pass' },
    },
  ])

  assert.deepEqual(summary, { count: 2, sumMtb: 325, year: 2024 })
})

test('scoreboardCounts and formatSpineNumber', () => {
  assert.deepEqual(
    scoreboardCounts([
      { value: 1, quality: 'measured' },
      { value: null, quality: 'unknown' },
      { value: 0, quality: 'unknown' },
    ]),
    { filled: 1, holes: 2, total: 3 },
  )
  assert.equal(formatSpineNumber(451000, 't'), '451\u00a0000 t')
})
