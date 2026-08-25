import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

describe('import-nordic-financials-2025', () => {
  it('plans curated 2025 rows without running the DB-backed CLI on import', async () => {
    const logs: string[] = []
    const originalLog = console.log
    console.log = (...args: unknown[]) => logs.push(args.join(' '))
    try {
      const mod = await import(`../../scripts/import-nordic-financials-2025?test=${Date.now()}`)
      await new Promise(resolve => setTimeout(resolve, 150))
      assert.deepEqual(logs, [])

      assert.equal(mod.parseApplyMode([]), false)
      assert.equal(mod.parseApplyMode(['--dry-run']), false)
      assert.equal(mod.parseApplyMode(['--apply']), true)
      assert.throws(() => mod.parseApplyMode(['--apply', '--dry-run']), /either --apply or --dry-run/)

      const companies = mod.NORDIC_FINANCIAL_2025_ROWS.map((row: { orgNr: string }, index: number) => ({
        id: `company-${index}`,
        name: `Company ${index}`,
        orgNr: row.orgNr,
      }))
      const plan = mod.buildNordicFinancial2025Plan(companies, [
        { companyId: 'company-0', year: 2025 },
        { companyId: 'company-3', year: 2025 },
      ])

      assert.deepEqual(plan.totals, {
        rows: 6,
        planned: 6,
        missingCompanies: 0,
        creates: 4,
        updates: 2,
      })
      assert.deepEqual(
        plan.planned.filter((row: { action: string }) => row.action === 'update').map(
          (row: { row: { orgNr: string } }) => row.row.orgNr,
        ),
        ['SE-556048-2837', 'DK-35954716'],
      )

      const data = mod.companyFinancialDataForRow(mod.NORDIC_FINANCIAL_2025_ROWS[0])
      // Radene står i MNOK, kolonnen er rå NOK. Uten konverteringen her ville
      // en ny kjøring gjeninnført MNOK i et normalisert korpus.
      assert.equal(mod.NORDIC_FINANCIAL_2025_ROWS[0].revenueNok, 150781.97)
      assert.equal(data.revenueNok, 150_781_970_000)
      assert.equal(data.operatingResult, mod.NORDIC_FINANCIAL_2025_ROWS[0].operatingResult * 1_000_000)
      assert.equal(data.verificationStatus, 'human_verified')
      assert.equal(data.verifiedAt.toISOString(), '2026-07-02T00:00:00.000Z')
      assert.equal(data.reportingCurrency, 'SEK')
      assert.match(data.fxRateSource, /Norges Bank/)

      const missing = mod.buildNordicFinancial2025Plan(companies.slice(0, -1))
      assert.deepEqual(missing.missingCompanyOrgNrs, ['DK-14705627'])
    } finally {
      console.log = originalLog
    }
  })
})
