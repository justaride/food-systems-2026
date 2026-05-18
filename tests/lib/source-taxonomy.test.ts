import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  classifyLegacySource,
  findNewActionNeededSourceRows,
  formatSourceTaxonomyCsv,
  makeSourceTaxonomyRows,
  normalizeSourceValue,
  type SourceTaxonomyRow,
  type SourceFieldSummary,
} from '../../src/lib/source-taxonomy'

describe('source taxonomy helpers', () => {
  it('normalizes whitespace and empty values before grouping', () => {
    assert.equal(normalizeSourceValue('  Broennoysund   / offentligdata MCP 2026-03  '), 'Broennoysund / offentligdata MCP 2026-03')
    assert.equal(normalizeSourceValue(null), '')
  })

  it('classifies resolvable locator values separately from legacy source labels', () => {
    assert.equal(classifyLegacySource('https://data.brreg.no/enhetsregisteret/api/enheter/999999999').className, 'has_url')
    assert.equal(classifyLegacySource('10.1234/example.doi').className, 'has_doi')
    assert.equal(classifyLegacySource('research/evidence-pack/brreg/999999999.json').className, 'local_path_or_file')
  })

  it('flags vague source labels and bare domains as action-needed legacy sources', () => {
    assert.deepEqual(classifyLegacySource('web research 2026-03'), {
      className: 'vague_research',
      needsAction: true,
      reason: 'Vague research/manual label without a resolvable locator',
    })
    assert.deepEqual(classifyLegacySource('asko.no (Sentrallager)'), {
      className: 'domain_only',
      needsAction: true,
      reason: 'Bare domain or domain label without a source URL',
    })
    assert.equal(classifyLegacySource('Broennoysund / offentligdata MCP 2026-03').className, 'registry_label_without_locator')
  })

  it('emits sorted CSV-ready rows with source-class counts', () => {
    const summaries: SourceFieldSummary[] = [
      { model: 'CompanyFinancial', field: 'source', value: 'web research 2026-03', count: 3 },
      { model: 'CompanyProperty', field: 'source', value: 'asko.no (Sentrallager)', count: 1 },
      { model: 'CountryMetric', field: 'source', value: 'https://www.ssb.no/table/123', count: 2 },
    ]

    assert.deepEqual(makeSourceTaxonomyRows(summaries).map(row => ({
      model: row.model,
      value: row.sourceValue,
      count: row.recordCount,
      className: row.className,
      needsAction: row.needsAction,
    })), [
      {
        model: 'CompanyFinancial',
        value: 'web research 2026-03',
        count: 3,
        className: 'vague_research',
        needsAction: 'yes',
      },
      {
        model: 'CompanyProperty',
        value: 'asko.no (Sentrallager)',
        count: 1,
        className: 'domain_only',
        needsAction: 'yes',
      },
      {
        model: 'CountryMetric',
        value: 'https://www.ssb.no/table/123',
        count: 2,
        className: 'has_url',
        needsAction: 'no',
      },
    ])
  })

  it('formats taxonomy rows as escaped CSV with stable headers', () => {
    const csv = formatSourceTaxonomyCsv([
      {
        rowType: 'source_value',
        model: 'CompanyProperty',
        field: 'source',
        sourceValue: 'asko.no (lager, Oslo)',
        recordCount: 1,
        className: 'domain_only',
        needsAction: 'yes',
        reason: 'Bare domain or domain label without a source URL',
      },
    ])

    assert.equal(csv, [
      'row_type,model,field,source_value,record_count,class_name,needs_action,reason',
      'source_value,CompanyProperty,source,"asko.no (lager, Oslo)",1,domain_only,yes,Bare domain or domain label without a source URL',
      '',
    ].join('\n'))
  })

  it('returns only action-needed rows missing from the baseline', () => {
    const legacyRow: SourceTaxonomyRow = {
      rowType: 'source_value',
      model: 'CompanyFinancial',
      field: 'source',
      sourceValue: 'web research 2026-03',
      recordCount: 3,
      className: 'vague_research',
      needsAction: 'yes',
      reason: 'Vague research/manual label without a resolvable locator',
    }
    const newRow: SourceTaxonomyRow = {
      rowType: 'source_value',
      model: 'CompanyProperty',
      field: 'source',
      sourceValue: 'asko.no (Sentrallager)',
      recordCount: 1,
      className: 'domain_only',
      needsAction: 'yes',
      reason: 'Bare domain or domain label without a source URL',
    }

    assert.deepEqual(findNewActionNeededSourceRows([legacyRow, newRow], formatSourceTaxonomyCsv([legacyRow])), [newRow])
  })

  it('returns no new action-needed rows when current findings are already baselined', () => {
    const legacyRow: SourceTaxonomyRow = {
      rowType: 'source_value',
      model: 'CompanyFinancial',
      field: 'source',
      sourceValue: 'web research 2026-03',
      recordCount: 3,
      className: 'vague_research',
      needsAction: 'yes',
      reason: 'Vague research/manual label without a resolvable locator',
    }

    assert.deepEqual(findNewActionNeededSourceRows([legacyRow], formatSourceTaxonomyCsv([legacyRow])), [])
  })
})
