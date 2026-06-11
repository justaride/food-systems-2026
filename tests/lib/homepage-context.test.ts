import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

function readSource(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

describe('G-13 homepage context and source cards', () => {
  it('places one compact system model on the homepage instead of adding a prototype block', () => {
    const page = readSource('src/app/page.tsx')

    assert.match(page, /Slik henger systemet sammen/)
    assert.match(page, /systemmodell/i)
    assert.match(page, /href="\/metodikk"|href: '\/metodikk'/)
    assert.match(page, /href="\/verdikjede"|href: '\/verdikjede'/)
    assert.doesNotMatch(page, /Ny prototype|Matflyt Norge/)
  })

  it('keeps homepage KPIs visibly source-card based on the G-06 KPI structure', () => {
    const page = readSource('src/app/page.tsx')
    const kpiCard = readSource('src/components/ui/KpiCard.tsx')

    assert.match(page, /FOOD_SYSTEM_KPIS\.map/)
    assert.match(kpiCard, /Kildekort/)
    assert.match(kpiCard, /Kildeår/)
    assert.match(kpiCard, /Sist verifisert/)
    assert.match(kpiCard, /Systemgrense/)
  })

  it('renders dates for recent insights on the homepage', () => {
    const page = readSource('src/app/page.tsx')

    assert.match(page, /formatInsightDate/)
    assert.match(page, /item\.date/)
    assert.match(page, /Dato:/)
  })
})
