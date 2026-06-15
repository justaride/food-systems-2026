import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

// Speiler tests/scripts/analyze-board-interlocks.test.ts: importerer det
// DB-baserte skriptet UTEN at main() kjører (pathToFileURL-guard), og tester
// den rene, eksporterte kjernen (arg-parsing, dekningsmatematikk, snapshot-indeks).
describe('extend-board-coverage-brreg', () => {
  it('kan importeres uten å kjøre den DB-baserte CLI-en', async () => {
    const logs: string[] = []
    const originalLog = console.log
    console.log = (...args: unknown[]) => logs.push(args.join(' '))
    try {
      const mod = await import(`../../scripts/extend-board-coverage-brreg?test=${Date.now()}`)
      await new Promise(resolve => setTimeout(resolve, 250))
      assert.deepEqual(logs, [])

      // ---- parseArgs ----
      assert.deepEqual(mod.parseArgs([]), {
        sectors: ['inputs', 'seafood', 'production'],
        dryRun: false,
        limit: null,
        includeCovered: false,
        includeResigned: false,
        snapshotIn: null,
        snapshotOut: null,
      })
      const parsed = mod.parseArgs(['--dry-run', '--sectors=inputs,seafood', '--limit=5', '--include-covered', '--snapshot-in=foo.json'])
      assert.equal(parsed.dryRun, true)
      assert.deepEqual(parsed.sectors, ['inputs', 'seafood'])
      assert.equal(parsed.limit, 5)
      assert.equal(parsed.includeCovered, true)
      assert.equal(parsed.snapshotIn, 'foo.json')
      assert.throws(() => mod.parseArgs(['--bogus']), /Ukjent argument/)
      assert.throws(() => mod.parseArgs(['--limit=0']), /Ugyldig --limit/)

      // ---- summarizeCoverage (dekningsmatematikk) ----
      const cov = mod.summarizeCoverage(275, 129, [
        { sector: 'inputs', companies: 13, withBoard: 13 },
        { sector: 'seafood', companies: 21, withBoard: 18 },
      ])
      assert.equal(cov.universe, 275)
      assert.equal(cov.companiesWithBoard, 129)
      assert.equal(cov.pct, 0.4691) // 129/275
      assert.equal(cov.bySector[0].pct, 1) // 13/13
      assert.equal(cov.bySector[1].pct, 0.8571) // 18/21
      // Tom nevner gir 0, ikke NaN.
      assert.equal(mod.summarizeCoverage(0, 0, []).pct, 0)

      // ---- indexSnapshot ----
      const idx = mod.indexSnapshot({
        companies: [
          { orgNr: '911610744', boardMembers: [{ personName: 'A B', role: 'styremedlem', personKey: 'a-b' }] },
          { orgNr: 'bad', notBoard: true },
        ],
      })
      assert.equal(idx.size, 1)
      assert.equal(idx.get('911610744')?.length, 1)
      assert.equal(mod.indexSnapshot({}).size, 0)
      assert.equal(mod.indexSnapshot(null).size, 0)
    } finally {
      console.log = originalLog
    }
  })
})
