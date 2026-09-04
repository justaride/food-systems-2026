import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { resolve } from 'node:path'

describe('repair-nordic-margin-financial-units', () => {
  it('keeps exact updates and persisted readback in one bounded transaction', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'scripts/repair-nordic-margin-financial-units.ts'),
      'utf8',
    )
    assert.match(source, /prisma\.\$transaction\(async \(transaction\) =>/)
    assert.match(source, /transaction\.companyFinancial\.update/)
    assert.match(source, /assertPersistedNordicMarginUnitRows/)
    assert.match(source, /\}, \{ maxWait: 20_000, timeout: 120_000 \}\)/)
  })

  it('plans nine source-bound unit repairs and corrects Hagar from native ISK figures', async () => {
    const logs: string[] = []
    const originalLog = console.log
    console.log = (...args: unknown[]) => logs.push(args.join(' '))
    try {
      const mod = await import(`../../scripts/repair-nordic-margin-financial-units?test=${Date.now()}`)
      await new Promise(resolve => setTimeout(resolve, 150))
      assert.deepEqual(logs, [])

      assert.equal(mod.parseApplyMode([]), false)
      assert.equal(mod.parseApplyMode(['--apply']), true)
      assert.throws(() => mod.parseApplyMode(['--apply', '--dry-run']), /either --apply or --dry-run/)

      assert.equal(mod.NORDIC_MARGIN_UNIT_TARGETS.length, 9)
      const hagar = mod.NORDIC_MARGIN_UNIT_TARGETS.find(
        (target: { orgNr: string }) => target.orgNr === 'IS-670203-2120',
      )
      assert.ok(hagar)
      assert.equal(hagar.finalData.revenueNok, 14168.89)
      assert.equal(hagar.finalData.operatingResult, 819.37)
      assert.equal(hagar.finalData.operatingMargin, 5.78)
      assert.equal(hagar.finalData.ebitda, 1157.92)
      assert.equal(hagar.finalData.fiscalYearLabel, '2024/25')
      assert.equal(hagar.finalData.unitScale, 1_000_000)
      assert.match(hagar.finalData.source, /ISK 180342m sales; ISK 10429m EBIT/)

      const companies = mod.NORDIC_MARGIN_UNIT_TARGETS.map(
        (target: { orgNr: string; expectedCompanyName: string }, index: number) => ({
          id: `company-${index}`,
          name: target.expectedCompanyName,
          orgNr: target.orgNr,
        }),
      )
      const financials = mod.NORDIC_MARGIN_UNIT_TARGETS.map(
        (target: { orgNr: string; year: number; expectedCurrentData: Record<string, unknown> }) => ({
          id: `financial-${target.orgNr}`,
          year: target.year,
          companyId: companies.find((company: { orgNr: string }) => company.orgNr === target.orgNr)!.id,
          ...target.expectedCurrentData,
        }),
      )
      const plan = mod.buildNordicMarginUnitRepairPlan(companies, financials)
      assert.deepEqual(plan.totals, {
        targets: 9,
        eligible: 9,
        updates: 9,
        unchanged: 0,
        missingCompanies: 0,
        missingFinancials: 0,
        identityMismatches: 0,
        contractMismatches: 0,
      })

      const finalRows = plan.planned.map((item: { financial: Record<string, unknown>; target: { finalData: Record<string, unknown> } }) => ({
        ...item.financial,
        ...item.target.finalData,
      }))
      mod.assertPersistedNordicMarginUnitRows(plan.planned, finalRows)
      assert.throws(
        () => mod.assertPersistedNordicMarginUnitRows(plan.planned, [
          ...finalRows.slice(0, -1),
          { ...finalRows.at(-1), unitScale: 1 },
        ]),
        /persisted Nordic margin unit rows differ from the exact plan/,
      )

      const idempotent = mod.buildNordicMarginUnitRepairPlan(companies, finalRows)
      assert.equal(idempotent.totals.updates, 0)
      assert.equal(idempotent.totals.unchanged, 9)

      const drifted = financials.map((row: Record<string, unknown>, index: number) =>
        index === 0 ? { ...row, operatingMargin: 99 } : row,
      )
      const rejected = mod.buildNordicMarginUnitRepairPlan(companies, drifted)
      assert.equal(rejected.totals.contractMismatches, 1)
      assert.equal(rejected.totals.eligible, 8)
    } finally {
      console.log = originalLog
    }
  })
})
