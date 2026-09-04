import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  verifyNordicSpineProductionSnapshot,
  type NordicSpineExpectedSnapshot,
  type NordicSpineProductionSnapshot,
} from '../../src/lib/nordic-spine-production-verifier'

function validSnapshot(): NordicSpineProductionSnapshot {
  return {
    cells: [
      { id: 'retail-concentration', status: 'frozen' },
      { id: 'seafood-residue-flow', status: 'frozen' },
      { id: 'food-waste-digestate', status: 'frozen' },
    ],
    indicators: Array.from({ length: 37 }, (_, index) => ({
      id: `indicator-row-${index}`,
      cellId: 'retail-concentration',
      country: ['NO', 'SE', 'DK', 'FI', 'IS'][index % 5]!,
      indicatorId: `indicator-${index}`,
      year: 2024,
      value: index < 34 ? index + 1 : null,
      unit: 'percent',
      methodId: 'retail-test-v1',
      quality: index < 34 ? 'measured' : 'unknown',
      holeReason: index < 34 ? null : 'True-C hole',
      partnerStatus: 'internal',
      metadata: { pass: 'nordic-c1-retail-concentration-2026-09-04' },
    })),
    flows: [
      ...Array.from({ length: 20 }, (_, index) => ({
        id: `c2-row-${index}`,
        cellId: 'seafood-residue-flow',
        country: ['NO', 'SE', 'DK', 'FI', 'IS'][index % 5]!,
        year: 2024,
        substance: 'mass',
        fromNode: `c2-from-${Math.floor(index / 5)}`,
        toNode: `c2-to-${Math.floor(index / 5)}`,
        quantity: null,
        unit: 't',
        quality: 'unknown',
        systemBoundary: 'C2 test boundary',
        holeReason: 'True-C hole',
        metadata: { pass: 'nordic-c2-seafood-residue-2026-09-04' },
      })),
      ...Array.from({ length: 20 }, (_, index) => ({
        id: `c3-row-${index}`,
        cellId: 'food-waste-digestate',
        country: ['NO', 'SE', 'DK', 'FI', 'IS'][index % 5]!,
        year: 2024,
        substance: 'mass',
        fromNode: `c3-from-${Math.floor(index / 5)}`,
        toNode: `c3-to-${Math.floor(index / 5)}`,
        quantity: index < 2 ? 451000 + index : null,
        unit: 't',
        quality: index < 2 ? 'measured' : 'unknown',
        systemBoundary: 'C3 test boundary',
        holeReason: index < 2 ? null : 'True-C hole',
        metadata: { pass: 'nordic-c3-food-waste-digestate-2026-09-04' },
      })),
    ],
    activities: Array.from({ length: 250 }, (_, index) => ({
      id: `activity-row-${index}`,
      entityType: 'site',
      entityId: `site-${index}`,
      domain: 'seafood',
      signalType: 'licensed_capacity_mtb',
      year: 2024,
      value: index === 249 ? 988229 : 1,
      unit: 't',
      confidence: 'high',
      source: 'fiskeridir',
      metadata: { pass: 'nordic-activity-aqua-no-2026-09-04' },
    })),
  }
}

function expectedFrom(snapshot: NordicSpineProductionSnapshot): NordicSpineExpectedSnapshot {
  return {
    cells: snapshot.cells.map(row => ({ ...row })),
    indicators: snapshot.indicators.map(({ id: _id, ...row }) => row),
    flows: snapshot.flows.map(({ id: _id, ...row }) => row),
    activities: snapshot.activities.map(({ id: _id, ...row }) => row),
  }
}

describe('Nordic spine production verifier', () => {
  it('accepts the exact internal pass-scoped production state and emits a stable fingerprint', () => {
    const original = validSnapshot()
    const expected = expectedFrom(original)
    const first = verifyNordicSpineProductionSnapshot(original, expected)
    const reordered = validSnapshot()
    reordered.indicators.reverse()
    reordered.flows.reverse()
    reordered.activities.reverse()
    const second = verifyNordicSpineProductionSnapshot(reordered, expected)

    assert.deepEqual(first.counts, {
      c1: { filled: 34, holes: 3, total: 37 },
      c2: { filled: 0, holes: 20, total: 20 },
      c3: { filled: 2, holes: 18, total: 20 },
      activity: { count: 250, sum: 988478 },
    })
    assert.match(first.fingerprint, /^[a-f0-9]{64}$/)
    assert.equal(first.fingerprint, second.fingerprint)
  })

  it('rejects a duplicate logical flow key even when the total row count stays exact', () => {
    const snapshot = validSnapshot()
    snapshot.flows[1] = { ...snapshot.flows[0]!, id: 'different-database-id' }

    assert.throws(
      () => verifyNordicSpineProductionSnapshot(snapshot, expectedFrom(validSnapshot())),
      /duplicate C2 logical key/,
    )
  })

  it('rejects authority drift on an otherwise complete C1 row set', () => {
    const snapshot = validSnapshot()
    snapshot.indicators[0] = { ...snapshot.indicators[0]!, partnerStatus: 'reviewed' }

    assert.throws(
      () => verifyNordicSpineProductionSnapshot(snapshot, expectedFrom(validSnapshot())),
      /C1 rows must remain internal/,
    )
  })

  it('rejects a missing activity signal and an incorrect capacity sum', () => {
    const missing = validSnapshot()
    missing.activities.pop()
    assert.throws(
      () => verifyNordicSpineProductionSnapshot(missing, expectedFrom(validSnapshot())),
      /ActivitySignal.*250.*249/,
    )

    const wrongSum = validSnapshot()
    wrongSum.activities[0] = { ...wrongSum.activities[0]!, value: 2 }
    assert.throws(
      () => verifyNordicSpineProductionSnapshot(wrongSum, expectedFrom(validSnapshot())),
      /ActivitySignal sum expected 988478, found 988479/,
    )
  })

  it('rejects a same-count replacement of one intended logical key', () => {
    const actual = validSnapshot()
    actual.indicators[0] = { ...actual.indicators[0]!, indicatorId: 'unplanned-replacement' }

    assert.throws(
      () => verifyNordicSpineProductionSnapshot(actual, expectedFrom(validSnapshot())),
      /C1 persisted rows differ from the current plan/,
    )
  })

  it('rejects drift in mutable flow and activity fields', () => {
    const flowDrift = validSnapshot()
    flowDrift.flows[0] = { ...flowDrift.flows[0]!, systemBoundary: 'Changed C2 boundary' }
    assert.throws(
      () => verifyNordicSpineProductionSnapshot(flowDrift, expectedFrom(validSnapshot())),
      /C2 persisted rows differ from the current plan/,
    )

    const activityDrift = validSnapshot()
    activityDrift.activities[0] = { ...activityDrift.activities[0]!, source: 'changed-source' }
    assert.throws(
      () => verifyNordicSpineProductionSnapshot(activityDrift, expectedFrom(validSnapshot())),
      /ActivitySignal persisted rows differ from the current plan/,
    )
  })

  it('fingerprints every mutable semantic field written by the backfills', () => {
    const baseline = validSnapshot()
    const first = verifyNordicSpineProductionSnapshot(baseline, expectedFrom(baseline))

    const changed = validSnapshot()
    changed.flows[0] = { ...changed.flows[0]!, systemBoundary: 'Changed C2 boundary' }
    changed.activities[0] = { ...changed.activities[0]!, source: 'changed-source' }
    const second = verifyNordicSpineProductionSnapshot(changed, expectedFrom(changed))

    assert.notEqual(first.fingerprint, second.fingerprint)
  })
})
