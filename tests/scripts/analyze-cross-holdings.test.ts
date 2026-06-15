import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

describe('analyze-cross-holdings', () => {
  it('traces transitive control and cross-sector owners without running the DB-backed CLI', async () => {
    const logs: string[] = []
    const originalLog = console.log
    console.log = (...args: unknown[]) => logs.push(args.join(' '))
    try {
      const mod = await import(`../../scripts/analyze-cross-holdings?test=${Date.now()}`)
      await new Promise(resolve => setTimeout(resolve, 250))
      assert.deepEqual(logs, [])

      assert.equal(mod.isControlEdge({ parentId: 'h', childId: 'a', pct: null, type: 'subsidiary' }), true)
      assert.equal(mod.isControlEdge({ parentId: 'b', childId: 'c', pct: 80, type: 'minority-stake' }), true)
      assert.equal(mod.isControlEdge({ parentId: 'x', childId: 'y', pct: 10, type: 'minority-stake' }), false)

      const companies = [
        { id: 'h', name: 'Holding AS', sector: null },
        { id: 'a', name: 'Retail AS', sector: 'retail' },
        { id: 'b', name: 'Processing AS', sector: 'processing' },
        { id: 'c', name: 'Inputs AS', sector: 'inputs' },
        { id: 'x', name: 'Minority Parent AS', sector: 'retail' },
        { id: 'y', name: 'Seafood AS', sector: 'seafood' },
      ]
      const edges = [
        { parentId: 'h', childId: 'a', pct: 100, type: 'subsidiary' },
        { parentId: 'h', childId: 'b', pct: 100, type: 'subsidiary' },
        { parentId: 'b', childId: 'c', pct: 80, type: 'minority-stake' },
        { parentId: 'x', childId: 'y', pct: 10, type: 'minority-stake' },
      ]

      const result = mod.computeCrossHoldings(edges, companies)

      assert.deepEqual(result.totals, {
        companies: 6,
        ownershipEdges: 4,
        controllingEdges: 3,
        companiesInGraph: 6,
        controllers: 2,
        ultimateControllers: 1,
        crossSectorControllers: 2,
      })
      assert.deepEqual(result.crossSectorControllers.map((c: { name: string }) => c.name), ['Holding AS', 'Processing AS'])
      const holding = result.crossSectorControllers.find((c: { name: string }) => c.name === 'Holding AS')
      assert.deepEqual(holding.sectors, ['inputs', 'processing', 'retail'])
      assert.equal(holding.isUltimate, true)
      assert.equal(holding.controlledCount, 3)
      assert.deepEqual(result.sectorPairControl, [
        { pair: 'inputs ↔ processing', count: 2 },
        { pair: 'inputs ↔ retail', count: 1 },
        { pair: 'processing ↔ retail', count: 1 },
      ])
    } finally {
      console.log = originalLog
    }
  })
})
