import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

describe('company seed source corrections', () => {
  it('anchors Yara Green Ammonia Porsgrunn subsidy to the Enova source row', () => {
    const source = readFileSync('scripts/import-company-data.ts', 'utf8')
    const projectIndex = source.indexOf("project: 'Grønn ammoniakk Porsgrunn'")
    const match = projectIndex >= 0 ? [source.slice(projectIndex - 100, projectIndex + 500)] : null

    assert.ok(match, 'expected a seed row for Yara Green Ammonia Porsgrunn')
    assert.match(match[0], /subsidyType: 'Enova teknologiportefølje'/)
    assert.match(match[0], /amountNok: 283250000/)
    assert.match(
      match[0],
      /source:\s*'https:\/\/www\.mynewsdesk\.com\/no\/enova-sf\/pressreleases\/yara-vil-bruke-groent-hydrogen-i-gjoedselproduksjonen-i-porsgrunn-faar-inntil-283-millioner-i-stoette-fra-enova-3151659'/,
    )
  })

  it('keeps Norwegian 2020-2024 retailer share seeds aligned with the direct KT source table', () => {
    const source = readFileSync('scripts/import-market-metrics.ts', 'utf8')

    assert.match(
      source,
      /NO_RETAILER_SHARE_2020_2024_SOURCE_URL\s*=\s*'https:\/\/konkurransetilsynet\.no\/wp-content\/uploads\/2025\/04\/Konkurransetilsynets-Dagligvarerapport-2024-25-1\.pdf'/,
    )
    assert.match(
      source,
      /category: 'Coop', value: 29\.7, unit: '%', year: '2021', source: 'Konkurransetilsynet 2022', metadata: noRetailerShareMetadata/,
    )
    assert.match(
      source,
      /category: 'NorgesGruppen', value: 43\.3, unit: '%', year: '2022', source: 'Konkurransetilsynet 2023', metadata: noRetailerShareMetadata/,
    )
    assert.match(
      source,
      /category: 'REMA 1000', value: 23\.9, unit: '%', year: '2023', source: 'Konkurransetilsynet 2024', metadata: noRetailerShareMetadata/,
    )
    assert.match(
      source,
      /category: 'NorgesGruppen', value: 43\.5, unit: '%', year: '2024', source: 'Konkurransetilsynet 2025', metadata: noRetailerShareMetadata/,
    )
  })

  it('anchors Finland 2024 retailer share and HHI seeds to the direct PTY source page', () => {
    const source = readFileSync('scripts/import-market-metrics.ts', 'utf8')

    assert.match(
      source,
      /FI_RETAILER_SHARE_2024_SOURCE_URL\s*=\s*'https:\/\/www\.pty\.fi\/en\/finnish-grocery-trade\/'/,
    )
    assert.match(
      source,
      /category: 'S Group', value: 48\.8, unit: '%', year: '2024', source: 'PTY\/NielsenIQ 2025', metadata: fiRetailerShare2024Metadata/,
    )
    assert.match(
      source,
      /category: 'K Group \(Kesko\)', value: 33\.7, unit: '%', year: '2024', source: 'PTY\/NielsenIQ 2025', metadata: fiRetailerShare2024Metadata/,
    )
    assert.match(
      source,
      /category: 'Lidl FI', value: 9\.4, unit: '%', year: '2024', source: 'PTY\/NielsenIQ 2025', metadata: fiRetailerShare2024Metadata/,
    )
    assert.match(
      source,
      /country: 'fi', metricType: 'hhi', category: 'dagligvare', value: 3671, unit: 'index', year: '2024', source: 'Beregnet fra markedsandeler', subtitle: '48\.8² \+ 33\.7² \+ 9\.4² \+ 8\.1²', metadata: fiRetailerShare2024Metadata/,
    )
  })
})
