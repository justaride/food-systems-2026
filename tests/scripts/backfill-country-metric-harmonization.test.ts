import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { resolve } from 'node:path'

describe('backfill-country-metric-harmonization', () => {
  it('keeps all production writes and exact readback checks in one transaction', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'scripts/backfill-country-metric-harmonization.ts'),
      'utf8',
    )
    const transactionStart = source.indexOf('prisma.$transaction(async (transaction) =>')
    const transactionEnd = source.indexOf(
      '\n      }, { maxWait: 20_000, timeout: 120_000 })',
      transactionStart,
    )
    assert.ok(transactionStart > -1, 'apply must open a transaction')
    assert.ok(transactionEnd > transactionStart, 'apply transaction must close after its work')

    const transactionBody = source.slice(transactionStart, transactionEnd)
    assert.match(transactionBody, /transaction\.countryMetric\.upsert/)
    assert.match(transactionBody, /transaction\.countryMetric\.update/)
    assert.match(transactionBody, /assertPersistedDerivedMarginRows/)
    assert.match(transactionBody, /CountryMetric methodLabel missing/)
    assert.match(
      source.slice(transactionStart),
      /\}, \{ maxWait: 20_000, timeout: 120_000 \}\)/,
      'production transaction must have bounded, tunnel-safe wait and execution timeouts',
    )
  })

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
          orgNr: 'SE-556542-5353',
          year: 2025,
          expectedSourceLocator: 'https://example.test/annual-report',
          expectedSource: 'Annual report',
          expectedVerificationStatus: 'human_verified',
          expectedVerifiedAt: '2026-07-02T00:00:00.000Z',
          expectedMargin: 12.35,
        },
        {
          revenueNok: 1000,
          operatingResult: 123.45,
          operatingMargin: null,
          source: 'Annual report',
          verificationStatus: 'human_verified',
          verifiedAt: new Date('2026-07-02T00:00:00.000Z'),
          company: { name: 'Axfood AB', orgNr: 'SE-556542-5353', country: 'SE' },
        },
        'https://example.test/annual-report',
      )
      assert.equal(margin.skipped, null)
      assert.equal(margin.data?.value, 12.35)
      assert.equal(margin.data?.metadata.operatingMarginSource, 'calculated_from_revenue_and_operating_result')

      const explicit = mod.buildDerivedMarginMetricData(
        {
          country: 'DK',
          companyName: 'Salling Group A/S',
          orgNr: 'DK-35954716',
          year: 2025,
          expectedSourceLocator: 'https://example.test/key-figures',
          expectedSource: 'Salling source',
          expectedVerificationStatus: null,
          expectedVerifiedAt: null,
          expectedMargin: 3.9,
        },
        {
          revenueNok: 1000,
          operatingResult: 1,
          operatingMargin: 3.9,
          source: 'Salling source',
          verificationStatus: null,
          verifiedAt: null,
          company: { name: 'Salling Group A/S', orgNr: 'DK-35954716', country: 'DK' },
        },
        'https://example.test/key-figures',
      )
      assert.equal(explicit.data?.value, 3.9)
      assert.equal(explicit.data?.source, 'Salling source')
      assert.equal(explicit.data?.metadata.operatingMarginSource, 'companyFinancial.operatingMargin')
      assert.equal(explicit.data?.metadata.sourceQuality, 'unverified_internal_financial')

      for (const [label, financial] of [
        [
          'organization number',
          {
            revenueNok: 1000,
            operatingResult: 123.45,
            operatingMargin: null,
            source: 'Annual report',
            verificationStatus: 'human_verified',
            verifiedAt: new Date('2026-07-02T00:00:00.000Z'),
            company: { name: 'Axfood AB', orgNr: 'wrong-org', country: 'SE' },
          },
        ],
        [
          'source',
          {
            revenueNok: 1000,
            operatingResult: 123.45,
            operatingMargin: null,
            source: 'Wrong source',
            verificationStatus: 'human_verified',
            verifiedAt: new Date('2026-07-02T00:00:00.000Z'),
            company: { name: 'Axfood AB', orgNr: 'SE-556542-5353', country: 'SE' },
          },
        ],
        [
          'verification',
          {
            revenueNok: 1000,
            operatingResult: 123.45,
            operatingMargin: null,
            source: 'Annual report',
            verificationStatus: null,
            verifiedAt: null,
            company: { name: 'Axfood AB', orgNr: 'SE-556542-5353', country: 'SE' },
          },
        ],
        [
          'margin',
          {
            revenueNok: 1000,
            operatingResult: 120,
            operatingMargin: null,
            source: 'Annual report',
            verificationStatus: 'human_verified',
            verifiedAt: new Date('2026-07-02T00:00:00.000Z'),
            company: { name: 'Axfood AB', orgNr: 'SE-556542-5353', country: 'SE' },
          },
        ],
      ] as const) {
        const rejected = mod.buildDerivedMarginMetricData(
          {
            country: 'SE',
            companyName: 'Axfood AB',
            orgNr: 'SE-556542-5353',
            year: 2025,
            expectedSourceLocator: 'https://example.test/annual-report',
            expectedSource: 'Annual report',
            expectedVerificationStatus: 'human_verified',
            expectedVerifiedAt: '2026-07-02T00:00:00.000Z',
            expectedMargin: 12.35,
          },
          financial,
          'https://example.test/annual-report',
        )
        assert.equal(rejected.data, null)
        assert.match(rejected.skipped ?? '', new RegExp(label))
      }

      const locatorRejected = mod.buildDerivedMarginMetricData(
        {
          country: 'SE',
          companyName: 'Axfood AB',
          orgNr: 'SE-556542-5353',
          year: 2025,
          expectedSourceLocator: 'https://example.test/annual-report',
          expectedSource: 'Annual report',
          expectedVerificationStatus: 'human_verified',
          expectedVerifiedAt: '2026-07-02T00:00:00.000Z',
          expectedMargin: 12.35,
        },
        {
          revenueNok: 1000,
          operatingResult: 123.45,
          operatingMargin: null,
          source: 'Annual report',
          verificationStatus: 'human_verified',
          verifiedAt: new Date('2026-07-02T00:00:00.000Z'),
          company: { name: 'Axfood AB', orgNr: 'SE-556542-5353', country: 'SE' },
        },
        'https://wrong.example/annual-report',
      )
      assert.equal(locatorRejected.data, null)
      assert.match(locatorRejected.skipped ?? '', /source locator contract mismatch/)

      const expectedPersisted = margin.data!
      mod.assertPersistedDerivedMarginRows([expectedPersisted], [
        { ...expectedPersisted, id: 'country-metric-1' },
      ])
      assert.throws(
        () =>
          mod.assertPersistedDerivedMarginRows([expectedPersisted], [
            {
              ...expectedPersisted,
              id: 'country-metric-1',
              metadata: { ...expectedPersisted.metadata, sourceQuality: 'drifted' },
            },
          ]),
        /persisted derived margin rows differ from the exact plan/,
      )

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
