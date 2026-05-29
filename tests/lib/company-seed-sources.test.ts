import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

describe('company seed source corrections', () => {
  it('keeps City Gross as a structured Axfood subsidiary with verified 2025 key figures', () => {
    const source = readFileSync('scripts/import-company-data.ts', 'utf8')
    const cityGrossIndex = source.indexOf("name: 'City Gross Sverige AB'")
    const cityGrossBlock = cityGrossIndex >= 0 ? source.slice(cityGrossIndex, cityGrossIndex + 1200) : ''

    assert.ok(cityGrossBlock, 'expected a City Gross seed block')
    assert.match(cityGrossBlock, /orgNr: 'SE-556597-2451'/)
    assert.match(cityGrossBlock, /employees: 1871/)
    assert.match(cityGrossBlock, /ownershipType: 'listed'/)
    assert.match(cityGrossBlock, /naceDescription: 'Detaljhandel med livsmedel'/)
    assert.match(cityGrossBlock, /year: 2025, revenueNok: 8898, operatingResult: -192, operatingMargin: -2\.2, groupEmployees: 1871/)
    assert.match(cityGrossBlock, /source: 'Axfood City Gross key figures 2025/)
  })

  it('keeps Oda shareholder seed on the checked direct shareholder row', () => {
    const source = readFileSync('scripts/import-company-data.ts', 'utf8')
    const odaIndex = source.indexOf("name: 'Oda'")
    const odaBlock = odaIndex >= 0 ? source.slice(odaIndex, odaIndex + 900) : ''

    assert.ok(odaBlock, 'expected an Oda seed block')
    assert.match(odaBlock, /name: 'AGP Advokater AS'/)
    assert.doesNotMatch(odaBlock, /Oda Midco AS \/ Softbank, Kinnevik m\.fl\./)
  })

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

  it('keeps historical Norwegian food-waste seeds on checked report figures', () => {
    const source = readFileSync('scripts/import-market-metrics.ts', 'utf8')
    const foodWasteIndex = source.indexOf('Food waste by sector')
    const foodWasteBlock =
      foodWasteIndex >= 0 ? source.slice(foodWasteIndex, foodWasteIndex + 5200) : ''

    assert.ok(foodWasteBlock, 'expected Norwegian food-waste seed block')
    assert.match(
      source,
      /FORMAT_2016_FOOD_WASTE_REPORT_URL\s*=\s*'https:\/\/www\.matvett\.no\/uploads\/documents\/ForMat-rapport-2016\.-Sluttrapport\.pdf'/,
    )
    assert.match(
      source,
      /MATVETT_2018_FOOD_WASTE_REPORT_URL\s*=\s*'https:\/\/www\.matvett\.no\/uploads\/documents\/OR\.28\.18-Edible-food-waste-in-Norway-Report-on-key-figures-2015-2017\.pdf'/,
    )
    assert.match(
      foodWasteBlock,
      /category: 'Husholdninger', value: 217480, unit: 'tonn', year: '2015', source: FORMAT_2016_FOOD_WASTE_REPORT_URL/,
    )
    assert.match(
      foodWasteBlock,
      /category: 'Dagligvare', value: 60177, unit: 'tonn', year: '2015', source: FORMAT_2016_FOOD_WASTE_REPORT_URL/,
    )
    assert.match(
      foodWasteBlock,
      /category: 'Grossist', value: 3067, unit: 'tonn', year: '2015', source: FORMAT_2016_FOOD_WASTE_REPORT_URL/,
    )
    assert.match(
      foodWasteBlock,
      /category: 'Totalt', value: 355000, unit: 'tonn', year: '2015', source: FORMAT_2016_FOOD_WASTE_REPORT_URL/,
    )
    assert.match(
      foodWasteBlock,
      /category: 'Totalt', value: 68\.7, unit: 'kg\/capita', year: '2015', source: FORMAT_2016_FOOD_WASTE_REPORT_URL/,
    )
    assert.match(
      foodWasteBlock,
      /category: 'Husholdninger', value: 224004, unit: 'tonn', year: '2017', source: MATVETT_2018_FOOD_WASTE_REPORT_URL/,
    )
    assert.match(
      foodWasteBlock,
      /category: 'Dagligvare', value: 51212, unit: 'tonn', year: '2017', source: MATVETT_2018_FOOD_WASTE_REPORT_URL/,
    )
    assert.match(
      foodWasteBlock,
      /category: 'Servering', value: 9578, unit: 'tonn', year: '2017', source: MATVETT_2018_FOOD_WASTE_REPORT_URL/,
    )
    assert.match(
      foodWasteBlock,
      /category: 'Totalt', value: 385000, unit: 'tonn', year: '2017', source: MATVETT_2018_FOOD_WASTE_REPORT_URL/,
    )
    assert.match(
      foodWasteBlock,
      /category: 'Totalt', value: 73, unit: 'kg\/capita', year: '2017', source: MATVETT_2018_FOOD_WASTE_REPORT_URL/,
    )
    assert.doesNotMatch(foodWasteBlock, /year: '2015', source: 'ForMat 2016'/)
    assert.doesNotMatch(foodWasteBlock, /year: '2017', source: 'Matvett\/SSB 2018'/)
    assert.doesNotMatch(foodWasteBlock, /year: '2017', source: 'Matvett\/Eurostat 2018'/)
    assert.doesNotMatch(foodWasteBlock, /category: 'Jordbruk', value: 1[45]000/)
  })
})
