import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { resolve } from 'node:path'

describe('import-nordic-financials-2025', () => {
  it('keeps the create-only write and exact readback in a bounded transaction', () => {
    const source = readFileSync(resolve(process.cwd(), 'scripts/import-nordic-financials-2025.ts'), 'utf8')
    assert.match(source, /refusing Nordic 2025 financial apply unless all six rows are absent/)
    assert.match(source, /prisma\.\$transaction\(async \(transaction\) =>/)
    assert.match(source, /transaction\.companyFinancial\.create/)
    assert.match(source, /assertPersistedNordicFinancial2025Rows/)
    assert.match(source, /\}, \{ maxWait: 20_000, timeout: 120_000 \}\)/)
  })

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

      const companies = mod.NORDIC_FINANCIAL_2025_ROWS.map((row: { orgNr: string; expectedCompanyName: string }, index: number) => ({
        id: `company-${index}`,
        name: row.expectedCompanyName,
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
        identityMismatches: 0,
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
      assert.equal(data.verificationStatus, null)
      assert.equal(data.verifiedAt, null)
      assert.equal(data.reportingCurrency, 'SEK')
      assert.match(data.fxRateSource, /Norges Bank/)
      assert.match(mod.NORDIC_FINANCIAL_2025_ROWS[0].expectedSourceLocator, /^https:\/\//)

      const expected = plan.planned[0]
      mod.assertPersistedNordicFinancial2025Rows([expected], [
        {
          year: expected.row.year,
          company: { orgNr: expected.row.orgNr },
          ...mod.companyFinancialDataForRow(expected.row),
        },
      ])
      assert.throws(
        () =>
          mod.assertPersistedNordicFinancial2025Rows([expected], [
            {
              year: expected.row.year,
              company: { orgNr: expected.row.orgNr },
              ...mod.companyFinancialDataForRow(expected.row),
              operatingMargin: 99,
            },
          ]),
        /differ from the exact plan/,
      )

      const missing = mod.buildNordicFinancial2025Plan(companies.slice(0, -1))
      assert.deepEqual(missing.missingCompanyOrgNrs, ['DK-14705627'])

      const wrongIdentity = mod.buildNordicFinancial2025Plan([
        { ...companies[0], name: 'Wrong company' },
        ...companies.slice(1),
      ])
      assert.equal(wrongIdentity.totals.identityMismatches, 1)
      assert.match(wrongIdentity.companyIdentityMismatches[0], /SE-556048-2837/)
    } finally {
      console.log = originalLog
    }
  })
})
