import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const targetComponents = [
  'src/app/selskap/SelskaperContent.tsx',
  'src/app/eiendommer/EiendommerContent.tsx',
  'src/app/havbruk/HavbrukContent.tsx',
  'src/app/produsenter/ProdusenterContent.tsx',
  'src/app/okonomi/OkonomiContent.tsx',
]

function readSource(path: string) {
  return readFileSync(join(process.cwd(), path), 'utf8')
}

describe('missing-data integration', () => {
  it('uses the shared MissingValue primitive on every target list surface', () => {
    for (const componentPath of targetComponents) {
      const source = readSource(componentPath)
      assert.match(source, /MissingValue/, `${componentPath} should render standardized missing values`)
    }
  })

  it('keeps true zero producer counts visible instead of converting them to missing dashes', () => {
    const source = readSource('src/app/produsenter/ProdusenterContent.tsx')

    assert.doesNotMatch(source, /subsidyCount > 0 \?/)
    assert.doesNotMatch(source, /deliveryCount > 0 \?/)
    assert.match(source, /subsidyCount\.toLocaleString/)
    assert.match(source, /deliveryCount\.toLocaleString/)
  })

  it('adds per-row coverage badges on the company list', () => {
    const source = readSource('src/app/selskap/SelskaperContent.tsx')

    assert.match(source, /CoveragePill/)
    assert.match(source, /Finans/)
    assert.match(source, /Styre/)
    assert.match(source, /Eierskap/)
  })

  it('documents aggregate coverage on company and economy surfaces', () => {
    const companies = readSource('src/app/selskap/SelskaperContent.tsx')
    const economy = readSource('src/app/okonomi/OkonomiContent.tsx')

    assert.match(companies, /formatCoverageFootnote/)
    assert.match(economy, /formatCoverageFootnote/)
    assert.match(economy, /sortNullableNumberDesc/)
  })
})
