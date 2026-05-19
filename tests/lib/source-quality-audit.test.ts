import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import {
  classifySourceLocator,
  summarizeSourceRows,
} from '../../src/lib/source-quality-audit'

describe('source quality audit helpers', () => {
  it('classifies direct locators separately from label-only source text', () => {
    assert.equal(classifySourceLocator(null), 'missing')
    assert.equal(classifySourceLocator('   '), 'missing')
    assert.equal(classifySourceLocator('https://data.brreg.no/enhetsregisteret'), 'direct_locator')
    assert.equal(classifySourceLocator('doi:10.1002/gch2.202300265'), 'direct_locator')
    assert.equal(classifySourceLocator('10.6027/nord2024-007'), 'direct_locator')
    assert.equal(classifySourceLocator('Landbruksdirektoratet'), 'label_only')
  })

  it('summarizes source rows into missing, direct locator and label-only counts', () => {
    const summary = summarizeSourceRows('CompanyFinancial', [
      { id: '1', source: 'https://annual.example/report.pdf' },
      { id: '2', source: 'Årsrapport 2024' },
      { id: '3', source: null },
    ])

    assert.deepEqual(summary, {
      label: 'CompanyFinancial',
      total: 3,
      directLocator: 1,
      resolvedLocator: 0,
      labelOnly: 1,
      missing: 1,
      examples: {
        labelOnly: ['2: Årsrapport 2024'],
        missing: ['3'],
      },
    })
  })

  it('counts label text with a verified resolver URL separately from unresolved labels', () => {
    const summary = summarizeSourceRows('Subsidy', [
      {
        id: 'prodtil-2025-971238860-arealtilskudd',
        source: 'Landbruksdirektoratet',
        resolvedLocator:
          'https://raw.githubusercontent.com/LandbruksdirektoratetGIT/opendata/refs/heads/main/datasets/produksjon-og-avlosertilskudd/2025/dataset.csv',
      },
      { id: 'manual-1', source: 'Årsrapport 2024' },
    ])

    assert.equal(summary.directLocator, 0)
    assert.equal(summary.resolvedLocator, 1)
    assert.equal(summary.labelOnly, 1)
    assert.deepEqual(summary.examples.labelOnly, ['manual-1: Årsrapport 2024'])
  })

  it('passes country metric row context into the strict source audit resolver', () => {
    const source = readFileSync('scripts/verify-data-integrity.ts', 'utf8')
    const countryMetricSelectIndex = source.indexOf('prisma.countryMetric.findMany')
    const countryMetricSelectBlock =
      countryMetricSelectIndex >= 0 ? source.slice(countryMetricSelectIndex, countryMetricSelectIndex + 320) : ''

    assert.ok(countryMetricSelectBlock)
    for (const field of ['id', 'country', 'metricType', 'category', 'year', 'source', 'metadata']) {
      assert.match(countryMetricSelectBlock, new RegExp(`${field}:\\s*true`))
    }
  })
})
