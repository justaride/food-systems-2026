import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

function source(path: string): string {
  return readFileSync(path, 'utf8')
}

describe('financial year labels', () => {
  it('/selskap forwards latest financial year into revenue display', () => {
    const page = source('src/app/selskap/page.tsx')
    const content = source('src/app/selskap/SelskaperContent.tsx')

    assert.match(page, /latestFinancialYear:\s*c\.financials\[0\]\?\.year\s*\?\?\s*null/)
    assert.match(content, /latestFinancialYear:\s*number\s*\|\s*null/)
    assert.match(
      content,
      /formatRevenueDisplay\(\s*c\.revenueNok,\s*c\.hasFinancialRow,\s*undefined,\s*c\.latestFinancialYear\s*\)/s,
    )
  })

  it('/selskap detail labels latest accounting summary amounts with their year', () => {
    const detail = source('src/app/selskap/[id]/page.tsx')

    assert.match(detail, /formatNokBillionsWithYear\(latestRevenueNok,\s*latestFinancial\.year\)/)
    assert.match(detail, /formatNokMillionsWithYear\(latestOperatingResultNok,\s*latestFinancial\.year\)/)
    assert.match(detail, /formatNokMillionsWithYear\(latestEbitdaNok,\s*latestFinancial\.year\)/)
  })

  it('/okonomi labels latest and aggregated revenue vintages', () => {
    const content = source('src/app/okonomi/OkonomiContent.tsx')

    assert.match(content, /const latestRevenueYearLabel = formatYearRange\(/)
    assert.match(content, /formatNokMillionsWithYear\(latestTotalRevenue,\s*latestRevenueYearLabel\)/)
    assert.match(content, /formatNokMillionsWithYear\(rev,\s*year\)/)
    assert.match(content, /formatNokMillionsWithYear\(opRes,\s*year\)/)
    assert.match(content, /yearLabel:\s*formatYearRange\(row\.years\)/)
    assert.match(content, /formatNokMillionsWithYear\(summary\.totalRevenueNok,\s*summary\.yearLabel\)/)
  })

  it('/eierskap labels aggregate revenue vintages and uses latest per-company financial rows', () => {
    const ownership = source('src/lib/queries/ownership.ts')
    const index = source('src/app/eierskap/EierskapContent.tsx')
    const dossier = source('src/app/eierskap/[slug]/KonsernDossier.tsx')
    const section4 = source('src/app/eierskap/[slug]/sections/Section4Economy.tsx')

    assert.doesNotMatch(ownership, /year:\s*currentYear\s*-\s*1/)
    assert.match(ownership, /latestFinancialByCompany\(/)
    assert.match(ownership, /totalRevenueYearLabel/)
    assert.match(index, /fmtRevenue\(k\.totalRevenue,\s*k\.totalRevenueYearLabel\)/)
    assert.match(dossier, /fmtRevenueMNok\(metrics\.totalRevenue,\s*metrics\.totalRevenueYearLabel\)/)
    assert.match(section4, /fmtMnokWithYear\(child\.revenueNok,\s*child\.year\)/)
  })
})
