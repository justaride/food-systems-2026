import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { coverageBadgeModel } from '../../../src/lib/coverage/badge-model'
import type { CoverageProfile } from '../../../src/lib/coverage/types'

function profile(overrides: Partial<CoverageProfile> = {}): CoverageProfile {
  return {
    datasetId: 'x',
    label: 'X',
    temporal: { kind: 'snapshot', year: 2025 },
    geographic: { countries: ['NO'], presentedAs: 'nordic', noAsNordicProxy: true },
    verification: { total: 100, humanVerified: 5, machineVerified: 90, needsReview: 5, humanVerifiedPct: 5, rollup: 'machine_grade' },
    computedAt: '2026-05-29T00:00:00.000Z',
    computedEnv: 'local',
    ...overrides,
  }
}

describe('coverageBadgeModel', () => {
  it('snapshot + NO-as-nordic proxy + low verification → warn/bad/warn', () => {
    const m = coverageBadgeModel(profile())
    assert.equal(m.temporal.tone, 'warn')
    assert.equal(m.geo.tone, 'bad')
    assert.match(m.geo.label, /NO → nordisk/)
    assert.equal(m.verification.tone, 'warn')
  })
  it('time_series + full nordic + human_grade → good/good/good', () => {
    const m = coverageBadgeModel(
      profile({
        temporal: { kind: 'time_series', from: 2015, to: 2026, cadence: 'yearly' },
        geographic: { countries: ['NO', 'SE', 'DK', 'FI', 'IS'], presentedAs: 'nordic', noAsNordicProxy: false },
        verification: { total: 100, humanVerified: 90, machineVerified: 5, needsReview: 5, humanVerifiedPct: 90, rollup: 'human_grade' },
      }),
    )
    assert.equal(m.temporal.tone, 'good')
    assert.equal(m.geo.tone, 'good')
    assert.equal(m.verification.tone, 'good')
  })
})
