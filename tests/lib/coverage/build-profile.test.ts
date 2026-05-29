import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { buildProfile, type RawDatasetData } from '../../../src/lib/coverage/build-profile'
import type { DatasetSpec } from '../../../src/lib/coverage/types'

const spec: DatasetSpec = { id: 'produksjonstilskudd', label: 'Tilskudd', model: 'subsidy', presentedAs: 'nordic', fixedCountries: ['NO'] }

describe('buildProfile', () => {
  it('composes temporal/geographic/verification from raw rows', () => {
    const raw: RawDatasetData = {
      years: [...Array(99).fill(2025), 2022],
      countries: ['NO'],
      verificationStatusCounts: { needs_review: 90, machine_verified: 10 },
    }
    const p = buildProfile(spec, raw, '2026-05-29T00:00:00.000Z', 'prod')
    assert.deepEqual(p.temporal, { kind: 'snapshot', year: 2025 })
    assert.equal(p.geographic.noAsNordicProxy, true)
    assert.equal(p.verification.rollup, 'needs_review')
    assert.equal(p.computedEnv, 'prod')
    assert.equal(p.datasetId, 'produksjonstilskudd')
  })
})
