import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

describe('subsidy concentration math', () => {
  it('can be imported without fetching CSV data and computes known values', async () => {
    const logs: string[] = []
    const originalLog = console.log
    console.log = (...args: unknown[]) => logs.push(args.join(' '))
    try {
      const mod = await import(`../../scripts/analyze-subsidy-concentration?test=${Date.now()}`)
      await new Promise(resolve => setTimeout(resolve, 250))

      assert.deepEqual(logs, [])
      assert.equal(mod.gini([10, 10, 10, 10]), 0)
      assert.equal(+mod.gini([1, 2, 3, 4]).toFixed(4), 0.25)
      assert.equal(+mod.gini([1, 1, 1, 100]).toFixed(4), 0.7209)
      assert.equal(mod.topShare([100, 50, 25, 25], 25), 0.5)
      assert.deepEqual(mod.lorenzDeciles(Array(10).fill(1)), [
        0.1,
        0.2,
        0.3,
        0.4,
        0.5,
        0.6,
        0.7,
        0.8,
        0.9,
        1,
      ])
    } finally {
      console.log = originalLog
    }
  })
})
