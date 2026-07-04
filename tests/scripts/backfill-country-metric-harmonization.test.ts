import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

describe('backfill-country-metric-harmonization', () => {
  it('plans method metadata and derived margins without running the DB-backed CLI on import', async () => {
    const logs: string[] = []
    const originalLog = console.log
    console.log = (...args: unknown[]) => logs.push(args.join(' '))
    try {
      const mod = await import(`../../scripts/backfill-country-metric-harmonization?test=${Date.now()}`)
      await new Promise(resolve => setTimeout(resolve, 150))
      assert.deepEqual(logs, [])

      assert.equal(mod.parseApplyMode([]), false)
      assert.equal(mod.parseApplyMode(['--apply']), true)
      assert.throws(() => mod.parseApplyMode(['--apply', '--dry-run']), /either --apply or --dry-run/)

      assert.equal(
        mod.methodLabelForMetric('selfSufficiency', 'Kalorier'),
        'caloric_self_sufficiency_percent_national_method',
      )
      assert.equal(
        mod.methodLabelForMetric('selfSufficiency', 'Fisk og sjomat'),
        'seafood_or_fish_self_sufficiency_percent_not_feed_adjusted',
      )
      assert.equal(
        mod.methodLabelForMetric('hhi', 'Dagligvare'),
        'derived_hhi_sum_of_squared_retailer_turnover_shares',
      )
      assert.equal(mod.sourceQuality('est. industry label'), 'estimate_label')
      assert.equal(mod.sourceQuality('beregnet fra retailer shares'), 'derived')
      assert.equal(mod.sourceQuality('official annual report'), 'source_label')

      const metadata = mod.buildCountryMetricMethodMetadata({
        id: 'cm-1',
        country: 'SE',
        metricType: 'hhi',
        category: 'Retail',
        year: '2025',
        source: 'beregnet from retailer shares',
        metadata: { sourceQuality: 'reviewed', methodScope: 'existing_scope' },
      })
      assert.deepEqual(metadata, {
        sourceQuality: 'reviewed',
        methodScope: 'existing_scope',
        methodLabel: 'derived_hhi_sum_of_squared_retailer_turnover_shares',
        harmonizationPass: 'country-metric-harmonization-2026-07-02',
      })

      const margin = mod.buildDerivedMarginMetricData(
        {
          country: 'SE',
          companyName: 'Axfood AB',
          year: 2025,
          sourceUrl: 'https://example.test/annual-report',
        },
        {
          revenueNok: 1000,
          operatingResult: 123.45,
          operatingMargin: null,
          source: 'Annual report',
          verificationStatus: 'human_verified',
          company: { name: 'Axfood AB', orgNr: 'SE-556542-5353', country: 'SE' },
        },
      )
      assert.equal(margin.skipped, null)
      assert.equal(margin.data?.value, 12.35)
      assert.equal(margin.data?.metadata.operatingMarginSource, 'calculated_from_revenue_and_operating_result')

      const explicit = mod.buildDerivedMarginMetricData(
        {
          country: 'DK',
          companyName: 'Salling Group A/S',
          year: 2025,
          sourceUrl: 'https://example.test/key-figures',
        },
        {
          revenueNok: 1000,
          operatingResult: 1,
          operatingMargin: 3.9,
          source: null,
          verificationStatus: null,
          company: { name: 'Salling Group A/S', orgNr: 'DK-35954716', country: 'DK' },
        },
      )
      assert.equal(explicit.data?.value, 3.9)
      assert.equal(explicit.data?.source, 'CompanyFinancial derived margin')
      assert.equal(explicit.data?.metadata.operatingMarginSource, 'companyFinancial.operatingMargin')

      const missing = mod.findMethodLabelGaps([
        { country: 'NO', metricType: 'hhi', category: 'Retail', year: '2024', source: 'x', metadata: metadata },
        { country: 'NO', metricType: 'margin', category: 'Retail', year: '2024', source: 'x', metadata: {} },
      ])
      assert.equal(missing.length, 1)
    } finally {
      console.log = originalLog
    }
  })
})
