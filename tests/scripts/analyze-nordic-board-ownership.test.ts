import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

describe('analyze-nordic-board-ownership', () => {
  it('builds the scoped read-only audit without running the DB-backed CLI on import', async () => {
    const logs: string[] = []
    const originalLog = console.log
    console.log = (...args: unknown[]) => logs.push(args.join(' '))
    try {
      const mod = await import(`../../scripts/analyze-nordic-board-ownership?test=${Date.now()}`)
      await new Promise(resolve => setTimeout(resolve, 250))
      assert.deepEqual(logs, [])

      assert.deepEqual(mod.parseCountries([]), ['SE', 'DK', 'FI', 'IS'])
      assert.deepEqual(mod.parseCountries(['--countries=se, dk,,fi']), ['SE', 'DK', 'FI'])
      assert.equal(mod.parseOutputPath(['--out=research/_status/custom.json']), 'research/_status/custom.json')

      const result = mod.buildNordicBoardOwnershipAudit({
        generatedAt: '2026-07-02T00:00:00.000Z',
        countries: ['SE', 'DK'],
        scopedCompanyUniverse: 3,
        scopedCompanies: [
          { id: 'se-retail', name: 'SE Retail AB', country: 'SE', valueChainStage: 'retail' },
          { id: 'dk-inputs', name: 'DK Inputs A/S', country: 'DK', valueChainStage: 'inputs' },
          { id: 'dk-processing', name: 'DK Processing A/S', country: 'DK', valueChainStage: 'processing' },
        ],
        boardRows: [
          {
            personKey: 'nordic-bridge',
            personName: 'Nordic Bridge',
            role: 'chair',
            company: { id: 'se-retail', name: 'SE Retail AB', country: 'SE', valueChainStage: 'retail' },
          },
          {
            personKey: 'nordic-bridge',
            personName: 'Nordic Bridge',
            role: 'director',
            company: { id: 'dk-inputs', name: 'DK Inputs A/S', country: 'DK', valueChainStage: 'inputs' },
          },
        ],
        ownershipRows: [
          {
            ownershipPct: 100,
            ownershipType: 'subsidiary',
            parentCompany: { id: 'se-retail', name: 'SE Retail AB', country: 'SE', valueChainStage: 'retail' },
            childCompany: { id: 'dk-processing', name: 'DK Processing A/S', country: 'DK', valueChainStage: 'processing' },
          },
        ],
      })

      assert.equal(result.generatedAt, '2026-07-02T00:00:00.000Z')
      assert.deepEqual(result.countries, ['SE', 'DK'])
      assert.equal(result.boardInterlocks.totals.boardCompanyCoverage, 0.6667)
      assert.deepEqual(result.boardInterlocks.topBridges.map((person: { name: string }) => person.name), [
        'Nordic Bridge',
      ])
      assert.equal(result.ownershipControl.totals.controllingEdges, 1)
      assert.deepEqual(
        result.ownershipControl.crossSectorControllers.map((company: { name: string }) => company.name),
        ['SE Retail AB (SE)'],
      )
    } finally {
      console.log = originalLog
    }
  })
})
