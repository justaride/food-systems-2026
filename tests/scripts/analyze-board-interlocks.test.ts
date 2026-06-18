import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

describe('computeInterlocks', () => {
  it('can be imported without running the DB-backed CLI', async () => {
    const logs: string[] = []
    const originalLog = console.log
    console.log = (...args: unknown[]) => logs.push(args.join(' '))
    try {
      const mod = await import(`../../scripts/analyze-board-interlocks?test=${Date.now()}`)
      await new Promise(resolve => setTimeout(resolve, 250))

      assert.deepEqual(logs, [])

      const result = mod.computeInterlocks([
        { personKey: 'ola-bridge', personName: 'Ola Bridge', role: 'styreleder', companyId: 'inputs-1', companyName: 'Inputs AS', sector: 'inputs' },
        { personKey: 'ola-bridge', personName: 'Ola Bridge', role: 'styremedlem', companyId: 'retail-1', companyName: 'Retail AS', sector: 'retail' },
        { personKey: 'kari-same-sector', personName: 'Kari Same', role: 'styremedlem', companyId: 'seafood-1', companyName: 'Seafood One AS', sector: 'seafood' },
        { personKey: 'kari-same-sector', personName: 'Kari Same', role: 'styremedlem', companyId: 'seafood-2', companyName: 'Seafood Two AS', sector: 'seafood' },
        { personKey: 'per-single', personName: 'Per Single', role: 'styremedlem', companyId: 'processing-1', companyName: 'Processing AS', sector: 'processing' },
      ], { companyUniverse: 6 })

      assert.deepEqual({
        totals: result.totals,
        bridgeNames: result.topBridges.map((person: { name: string }) => person.name),
        sectorPairBridges: result.sectorPairBridges,
        inputsDegree: result.topCompaniesByInterlockDegree.find((company: { company: string; interlockDegree: number }) => company.company === 'Inputs AS')?.interlockDegree,
      }, {
        totals: {
          seats: 5,
          distinctPersons: 3,
          distinctCompanies: 5,
          companyUniverse: 6,
          boardCompanyCoverage: 0.8333,
          companiesWithSector: 5,
          boardCompaniesWithSectorCoverage: 1,
          interlockers: 2,
          crossSectorBridges: 1,
        },
        bridgeNames: ['Ola Bridge'],
        sectorPairBridges: [{ pair: 'inputs ↔ retail', count: 1 }],
        inputsDegree: 1,
      })
    } finally {
      console.log = originalLog
    }
  })
})
