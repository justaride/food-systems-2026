import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

describe('analyze-node-concentration', () => {
  it('computes HHI and node concentration without running the DB-backed CLI', async () => {
    const logs: string[] = []
    const originalLog = console.log
    console.log = (...args: unknown[]) => logs.push(args.join(' '))
    try {
      const mod = await import(`../../scripts/analyze-node-concentration?test=${Date.now()}`)
      await new Promise(resolve => setTimeout(resolve, 250))
      assert.deepEqual(logs, [])

      assert.equal(mod.hhi([25, 25, 25, 25]), 2500)
      assert.equal(mod.hhi([100]), 10000)
      assert.equal(mod.topNShare([600, 300, 100], 1), 0.6)
      assert.equal(mod.topNShare([600, 300, 100], 3), 1)

      const result = mod.computeNodeConcentration([
        { id: 'a', name: 'Retail Coop AS', node: 'retail', ownershipType: 'cooperative', revenueNok: 600, shareholders: [{ pct: 100, type: 'cooperative', controlling: true }] },
        { id: 'b', name: 'Retail Family AS', node: 'retail', ownershipType: 'family', revenueNok: 300, shareholders: [{ pct: 60, type: 'family', controlling: true }, { pct: 40, type: 'family', controlling: false }] },
        { id: 'c', name: 'Retail Small AS', node: 'retail', ownershipType: 'family', revenueNok: 100, shareholders: [] },
        { id: 'd', name: 'Inputs Split AS', node: 'inputs', ownershipType: 'foreign', revenueNok: 50, shareholders: [{ pct: 50, type: 'foreign', controlling: false }, { pct: 50, type: 'foreign', controlling: false }] },
        { id: 'e', name: 'Inputs NoRev AS', node: 'inputs', ownershipType: 'foreign', revenueNok: null, shareholders: [{ pct: 100, type: 'foreign', controlling: true }] },
      ])

      const retail = result.nodes.find((n: { node: string }) => n.node === 'retail')
      const inputs = result.nodes.find((n: { node: string }) => n.node === 'inputs')

      assert.equal(result.nodes[0].node, 'inputs')
      assert.equal(retail.revenueHHI, 4600)
      assert.equal(retail.top1RevShare, 0.6)
      assert.equal(retail.top3RevShare, 1)
      assert.equal(retail.controllingPrevalence, 0.67)
      assert.equal(retail.medianOwnerHHI, 7600)
      assert.deepEqual(retail.ownershipTypeMix, { cooperative: 1, family: 2 })
      assert.equal(inputs.revenueHHI, 10000)
      assert.equal(inputs.revenueCoverage, 0.5)
      assert.deepEqual(result.totals, { companies: 5, nodes: 2, withRevenue: 4, withShareholders: 4 })
    } finally {
      console.log = originalLog
    }
  })
})
