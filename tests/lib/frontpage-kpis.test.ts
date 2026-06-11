import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  FOOD_SYSTEM_KPIS,
  SELF_SUFFICIENCY_REFERENCE,
} from '@/lib/data/forside-kpis'

describe('frontpage sourced KPIs', () => {
  it('gives every homepage KPI source metadata and KPI boundary fields', () => {
    assert.equal(FOOD_SYSTEM_KPIS.length, 4)

    for (const kpi of FOOD_SYSTEM_KPIS) {
      assert.ok(kpi.current, `${kpi.id} has a current value`)
      assert.ok(kpi.source.label, `${kpi.id} has a source label`)
      assert.ok(kpi.source.year, `${kpi.id} has a source year`)
      assert.ok(kpi.source.href, `${kpi.id} has a source link`)
      assert.ok(kpi.source.lastVerified, `${kpi.id} has lastVerified`)

      assert.ok(kpi.definition, `${kpi.id} has a definition`)
      assert.ok(kpi.unit, `${kpi.id} has a unit`)
      assert.ok(kpi.geography, `${kpi.id} has a geography`)
      assert.ok(kpi.dataOwner, `${kpi.id} has a data owner`)
      assert.ok(kpi.frequency, `${kpi.id} has a frequency`)
      assert.ok(kpi.baseline, `${kpi.id} has a baseline`)
      assert.ok(kpi.systemBoundary, `${kpi.id} has a system boundary`)
    }
  })

  it('uses the claim-locked NIBIO 2024 self-sufficiency definition', () => {
    assert.equal(SELF_SUFFICIENCY_REFERENCE.valuePct, 41.3)
    assert.equal(SELF_SUFFICIENCY_REFERENCE.feedCorrectedPct, 34.9)
    assert.equal(SELF_SUFFICIENCY_REFERENCE.ratio, 0.413)
    assert.equal(SELF_SUFFICIENCY_REFERENCE.source.sourceId, 'SRC-BASE-006')
    assert.equal(SELF_SUFFICIENCY_REFERENCE.claimGate, 'CL-C-015')

    const selfSufficiencyKpi = FOOD_SYSTEM_KPIS.find(kpi => kpi.id === 'selvforsyning')
    assert.ok(selfSufficiencyKpi)
    assert.equal(selfSufficiencyKpi.current, '41,3%')
    assert.equal(selfSufficiencyKpi.secondary, '34,9% forkorrigert')
    assert.equal(selfSufficiencyKpi.target, '50%')
  })
})
