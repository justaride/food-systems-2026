import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import path from 'node:path'
import { getSammenligningData } from '@/lib/queries/sammenligning'

const root = process.cwd()

function read(relPath: string) {
  return readFileSync(path.join(root, relPath), 'utf-8')
}

describe('G-06 sourced KPI integration', () => {
  it('keeps homepage KPIs outside page.tsx and Norway map config on the shared self-sufficiency reference', () => {
    const pageSource = read('src/app/page.tsx')
    const norwayConfigSource = read('src/lib/config/countries/no.ts')

    assert.match(pageSource, /@\/lib\/data\/forside-kpis/)
    assert.doesNotMatch(pageSource, /const FOOD_SYSTEM_KPIS/)

    assert.match(norwayConfigSource, /SELF_SUFFICIENCY_REFERENCE/)
    assert.doesNotMatch(norwayConfigSource, /selfSufficiency:\s*0\.45/)
    assert.doesNotMatch(norwayConfigSource, /45%\)/)
  })

  it('removes legacy self-sufficiency 44/45 variants from rendered app source files', () => {
    const scannedFiles = [
      'src/app/page.tsx',
      'src/app/sammenligning/SammenligningContent.tsx',
      'src/lib/config/countries/no.ts',
      'src/lib/data/country-chart-data.ts',
    ]

    for (const relPath of scannedFiles) {
      const source = read(relPath)
      assert.doesNotMatch(source, /\b44\s?%/, `${relPath} contains legacy 44 percent text`)
      assert.doesNotMatch(source, /\b45\s?%/, `${relPath} contains legacy 45 percent text`)
      assert.doesNotMatch(source, /\b0\.45\b/, `${relPath} contains legacy 0.45 ratio`)
    }
  })

  it('renders comparison prose from data and attaches source notes to quantitative narratives', () => {
    const comparisonSource = read('src/app/sammenligning/SammenligningContent.tsx')

    assert.doesNotMatch(comparisonSource, /HHI rundt 3445/)
    assert.doesNotMatch(comparisonSource, /Danmarks 2157/)
    assert.doesNotMatch(comparisonSource, /Danmark ligger rundt ~300 %/)
    assert.match(comparisonSource, /sourceNote=/)
    assert.match(comparisonSource, /formatComparisonSourceNote/)
  })

  it('reads Finland grain reserve months from the source data structure', async () => {
    const data = await getSammenligningData()
    const fiReserveMeta = data.countries.fi?.meta.preparedness.grainReserveMonths

    assert.equal(data.countries.fi?.preparedness.grainReserveMonths, 9)
    assert.ok(fiReserveMeta?.sources.some(source => /HVK|Luke/.test(source)))
    assert.equal(fiReserveMeta?.year, 2024)
  })
})
