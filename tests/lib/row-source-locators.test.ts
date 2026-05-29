import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  resolveAquacultureApplicationSourceLocator,
  resolveAquacultureSiteSourceLocator,
  resolveBusinessRelationshipSourceLocator,
  resolveCompanyFinancialSourceLocator,
  resolveCompanyOwnershipSourceLocator,
  resolveCompanyPropertySourceLocator,
  resolveCountryMetricSourceLocator,
  resolveDeliveryVolumeSourceLocator,
  resolveShareholderSourceLocator,
  resolveSubsidySourceLocator,
} from '../../src/lib/row-source-locators'

describe('row source locators', () => {
  it('resolves production subsidy rows to the official Landbruksdirektoratet CSV for the row year', () => {
    assert.equal(
      resolveSubsidySourceLocator({
        source: 'Landbruksdirektoratet',
        subsidyType: 'produksjonstilskudd',
        year: 2025,
      }),
      'https://raw.githubusercontent.com/LandbruksdirektoratetGIT/opendata/refs/heads/main/datasets/produksjon-og-avlosertilskudd/2025/dataset.csv',
    )
  })

  it('resolves delivery volume rows to the official dataset for the commodity and year', () => {
    assert.equal(
      resolveDeliveryVolumeSourceLocator({
        source: 'Landbruksdirektoratet',
        commodity: 'melk-ku',
        year: 2024,
      }),
      'https://raw.githubusercontent.com/LandbruksdirektoratetGIT/opendata/refs/heads/main/datasets/leveransedata-melk/2024/dataset.csv',
    )
    assert.equal(
      resolveDeliveryVolumeSourceLocator({
        source: 'Landbruksdirektoratet',
        commodity: 'korn-hvete',
        year: 2024,
      }),
      'https://raw.githubusercontent.com/LandbruksdirektoratetGIT/opendata/refs/heads/main/datasets/leveransedata-korn/2024-2025/dataset.csv',
    )
  })

  it('resolves aquaculture rows to the public Fiskeridirektoratet APIs used by the importers', () => {
    assert.equal(
      resolveAquacultureSiteSourceLocator({
        source: 'Fiskeridirektoratet pub-aqua',
        localityNumber: '10077',
      }),
      'https://api.fiskeridir.no/pub-aqua/api/v1/sites/10077',
    )
    assert.equal(
      resolveAquacultureApplicationSourceLocator({
        source: 'Fiskeridirektoratet aqua-portal',
        applicantOrgNr: '964118191',
      }),
      'https://api.fiskeridir.no/aqua-portal-api-public/api/v1/applications?applicantOrganisationNumber=964118191&page=0&size=50&sort=createdAt,desc',
    )
  })

  it('resolves country metric rows through reportId metadata when the report has a source URL', () => {
    assert.equal(
      resolveCountryMetricSourceLocator(
        {
          source: 'NORMO 2025',
          metadata: { reportId: 'normo-2025-nordic-monitoring' },
        },
        new Map([
          [
            'normo-2025-nordic-monitoring',
            'https://pub.norden.org/nord2025-007/nord2025-007.pdf',
          ],
        ]),
      ),
      'https://pub.norden.org/nord2025-007/nord2025-007.pdf',
    )
  })

  it('resolves country metric rows through direct sourceUrl metadata and exact official source labels', () => {
    assert.equal(
      resolveCountryMetricSourceLocator(
        {
          source: 'Eurostat ORG_CROPAR',
          metadata: {
            sourceUrl: 'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/org_cropar',
          },
        },
        new Map(),
      ),
      'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/org_cropar',
    )

    assert.equal(
      resolveCountryMetricSourceLocator(
        {
          source: 'Konkurransetilsynet 2025',
        },
        new Map(),
      ),
      'https://konkurransetilsynet.no/wp-content/uploads/2025/04/Konkurransetilsynets-Dagligvarerapport-2024-25.pdf',
    )

    assert.equal(
      resolveCountryMetricSourceLocator(
        {
          source: 'Konkurrence- og Forbrugerstyrelsen 2025',
        },
        new Map(),
      ),
      'https://kfst.dk/konkurrenceforhold/afgoerelser/afgoerelser-paa-konkurrenceomraadet/raads-og-styrelsesafgoerelser/2025/20250326-salling-group-dele-af-coop-danmark',
    )

    assert.equal(
      resolveCountryMetricSourceLocator(
        {
          source: 'Konkurrensverket 2025',
        },
        new Map(),
      ),
      'https://www.konkurrensverket.se/konkurrens/samlad-kunskap-om-konkurrens/genomlysning-av-livsmedelsbranschen/',
    )
  })

  it('resolves country metric rows through checked internal derivation and source artifacts', () => {
    assert.equal(
      resolveCountryMetricSourceLocator(
        { source: 'Beregnet fra markedsandeler' },
        new Map(),
      ),
      'source:derived-country-metric-market-shares',
    )

    assert.equal(
      resolveCountryMetricSourceLocator(
        { source: 'Totalkalkylen/SSB' },
        new Map(),
      ),
      'document:data/ssb/totalkalkylen-2024',
    )

    assert.equal(
      resolveCountryMetricSourceLocator(
        { source: 'Totalkalkylen/SSB est.' },
        new Map(),
      ),
      'document:data/ssb/totalkalkylen-2024',
    )
  })

  it('resolves checked country metric labels to imported report documents and official statistics pages', () => {
    assert.equal(
      resolveCountryMetricSourceLocator(
        { source: 'PTY/Päivittäistavarakauppa ry markkina-analyysi 2024' },
        new Map(),
      ),
      'document:evidence-pack/nordisk/pty-finnish-grocery-trade-statistics-2024',
    )

    assert.equal(
      resolveCountryMetricSourceLocator(
        { source: 'Regjeringen R15-2023 / NielsenIQ' },
        new Map(),
      ),
      'document:evidence-pack/offentlig/emv-kartlegging-2023',
    )

    assert.equal(
      resolveCountryMetricSourceLocator(
        { country: 'FI', metricType: 'retailerShare', source: 'PTY/NielsenIQ 2023' },
        new Map(),
      ),
      'https://www.pty.fi/wp-content/uploads/2023/06/Paivittaistavarakauppa-ry-2023_EN.pdf',
    )

    assert.equal(
      resolveCountryMetricSourceLocator(
        { country: 'FI', metricType: 'privateLabel', source: 'PTY/NielsenIQ est.' },
        new Map(),
      ),
      'source:blocked-unsourced/country-metric-estimate',
    )

    assert.equal(
      resolveCountryMetricSourceLocator(
        { source: 'SSB Arealstatistikk' },
        new Map(),
      ),
      'https://www.ssb.no/jord-skog-jakt-og-fiskeri/jordbruk/statistikk/gardsbruk-jordbruksareal-og-husdyr',
    )

    assert.equal(
      resolveCountryMetricSourceLocator(
        { country: 'NO', metricType: 'foodWaste', source: 'Matvett/SSB 2023' },
        new Map(),
      ),
      'https://www.matvett.no/uploads/documents/Slik-var-matsvinnaret-2023.pdf',
    )

    assert.equal(
      resolveCountryMetricSourceLocator(
        { country: 'NO', metricType: 'foodWaste', source: 'Matvett/SSB 2021' },
        new Map(),
      ),
      'https://www.matvett.no/uploads/documents/OR.36.21-Sektorrapport-for-matbransjen-offentlig-sektor-og-husholdningsleddet.pdf',
    )

    assert.equal(
      resolveCountryMetricSourceLocator(
        { country: 'NO', metricType: 'foodWastePerCapita', source: 'Matvett 2025 est.' },
        new Map(),
      ),
      'https://www.matvett.no/uploads/documents/Slik-var-matsvinnaret-2025.pdf',
    )

    assert.equal(
      resolveCountryMetricSourceLocator(
        { country: 'NO', metricType: 'foodWaste', source: 'ForMat 2016' },
        new Map(),
      ),
      null,
    )
  })

  it('resolves checked Nordic food-waste per-capita labels to Eurostat env_wasfw', () => {
    assert.equal(
      resolveCountryMetricSourceLocator(
        { country: 'FI', metricType: 'foodWastePerCapita', source: 'LUKE/Eurostat 2021' },
        new Map(),
      ),
      'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/env_wasfw',
    )

    assert.equal(
      resolveCountryMetricSourceLocator(
        { country: 'FI', metricType: 'foodWastePerCapita', source: 'LUKE/Eurostat 2023' },
        new Map(),
      ),
      'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/env_wasfw',
    )

    assert.equal(
      resolveCountryMetricSourceLocator(
        {
          country: 'IS',
          metricType: 'foodWastePerCapita',
          source: 'Umhverfisstofnun/Eurostat 2021',
        },
        new Map(),
      ),
      'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/env_wasfw',
    )

    assert.equal(
      resolveCountryMetricSourceLocator(
        {
          country: 'IS',
          metricType: 'foodWastePerCapita',
          source: 'Umhverfisstofnun/Eurostat 2023',
        },
        new Map(),
      ),
      'https://ec.europa.eu/eurostat/api/dissemination/statistics/1.0/data/env_wasfw',
    )

    assert.equal(
      resolveCountryMetricSourceLocator(
        { country: 'IS', metricType: 'foodWastePerCapita', source: 'Umhverfisstofnun 2025 est.' },
        new Map(),
      ),
      'source:blocked-unsourced/country-metric-estimate',
    )
  })

  it('resolves country metric partner-trade refetch labels only to live official statistics APIs', () => {
    assert.equal(
      resolveCountryMetricSourceLocator(
        {
          source: 'SSB 08801 partner refetch',
        },
        new Map(),
      ),
      'https://data.ssb.no/api/v0/en/table/08801/',
    )

    assert.equal(
      resolveCountryMetricSourceLocator(
        {
          source: 'SCB ImpTotalKNAr partner refetch',
        },
        new Map(),
      ),
      'https://api.scb.se/OV0104/v1/doris/en/ssd/HA/HA0201/HA0201B/ImpExpKNTotMan',
    )

    assert.equal(
      resolveCountryMetricSourceLocator(
        {
          source: 'StatBank SITC2R4 partner refetch',
        },
        new Map(),
      ),
      'https://api.statbank.dk/v1/tableinfo?lang=en&id=SITC2R4',
    )

    assert.equal(
      resolveCountryMetricSourceLocator(
        {
          source: 'Statistics Iceland UTA06201 partner extract',
        },
        new Map(),
      ),
      'https://px.hagstofa.is/pxen/api/v1/en/Efnahagur/utanrikisverslun/1_voruvidskipti/01_voruskipti/UTA06201.px',
    )

    assert.equal(
      resolveCountryMetricSourceLocator(
        {
          source: 'Luke agri-food foreign trade partner refetch',
        },
        new Map(),
      ),
      'https://statdb.luke.fi/PXWeb/api/v1/en/LUKE/maa/05%20Maataloustuotteiden%20ulkomaankauppa/Luke_maa_Ukaup_kk.px',
    )
  })

  it('resolves metric-scoped country labels without over-mapping shared labels', () => {
    assert.equal(
      resolveCountryMetricSourceLocator(
        {
          country: 'SE',
          metricType: 'foodWastePerCapita',
          source: 'Naturvårdsverket 2023',
        },
        new Map(),
      ),
      'https://www.naturvardsverket.se/data-och-statistik/avfall/avfall-mat/',
    )

    assert.equal(
      resolveCountryMetricSourceLocator(
        {
          country: 'SE',
          metricType: 'ghgEmissions',
          source: 'Naturvårdsverket 2023',
        },
        new Map(),
      ),
      'source:blocked-unsourced/country-metric-unverified-label',
    )
  })

  it('resolves remaining strict-source country metric labels to existing official locators or blocked internal markers', () => {
    assert.equal(
      resolveCountryMetricSourceLocator(
        { country: 'FI', metricType: 'selfSufficiency', source: 'Luke/Ruokavirasto' },
        new Map(),
      ),
      'https://statdb.luke.fi/PXWeb/api/v1/en/LUKE/maa/02%20Ravintotase/02_Ravintotase.px',
    )

    assert.equal(
      resolveCountryMetricSourceLocator(
        { country: 'IS', metricType: 'retailerShare', source: 'Samkeppniseftirlitið 2025' },
        new Map(),
      ),
      'https://www.samkeppni.is/urlausnir/skyrslur/4-2025/',
    )

    assert.equal(
      resolveCountryMetricSourceLocator(
        { country: 'NO', metricType: 'hhiCategory', source: 'Konkurransetilsynet/bransjeanalyse' },
        new Map(),
      ),
      'https://konkurransetilsynet.no/wp-content/uploads/2025/04/Konkurransetilsynets-Dagligvarerapport-2024-25.pdf',
    )

    assert.equal(
      resolveCountryMetricSourceLocator(
        { country: 'NO', metricType: 'margin', source: 'Årsrapporter 2024, Konkurransetilsynet verdikjedestudie' },
        new Map(),
      ),
      'source:derived-country-metric-margin-annual-reports-ktil',
    )

    assert.equal(
      resolveCountryMetricSourceLocator(
        { country: 'NO', metricType: 'privateLabel', source: 'NielsenIQ/bransjeanalyse est.' },
        new Map(),
      ),
      'source:blocked-unsourced/country-metric-estimate',
    )

    assert.equal(
      resolveCountryMetricSourceLocator(
        { country: 'DK', metricType: 'selfSufficiency', source: 'Danmarks Statistik/Landbrug & Fødevarer' },
        new Map(),
      ),
      'source:blocked-unsourced/country-metric-unverified-label',
    )
  })

  it('resolves company financial rows to imported annual-report documents only when the document exists', () => {
    assert.equal(
      resolveCompanyFinancialSourceLocator(
        {
          source: 'Årsrapport 2024',
          year: 2024,
          company: { orgNr: '819731322' },
        },
        new Set(['evidence-pack/arsrapporter/norgesgruppen-2024']),
      ),
      'document:evidence-pack/arsrapporter/norgesgruppen-2024',
    )

    assert.equal(
      resolveCompanyFinancialSourceLocator(
        {
          source: 'Annual Report 2024',
          year: 2024,
          company: { orgNr: 'DK-35954716' },
        },
        new Set(['evidence-pack/arsrapporter/salling-group-2024']),
      ),
      'document:evidence-pack/arsrapporter/salling-group-2024',
    )

    assert.equal(
      resolveCompanyFinancialSourceLocator(
        {
          source: 'Årsresultat 2024',
          year: 2024,
          company: { orgNr: '936560288' },
        },
        new Set(['evidence-pack/arsrapporter/coop-norge-2024']),
      ),
      'document:evidence-pack/arsrapporter/coop-norge-2024',
    )

    assert.equal(
      resolveCompanyFinancialSourceLocator(
        {
          source: 'Årsrapport 2024',
          year: 2024,
          company: { orgNr: '819731322' },
        },
        new Set(),
      ),
      null,
    )
  })

  it('resolves company financial rows to verified official annual-report URLs when no document is imported', () => {
    assert.equal(
      resolveCompanyFinancialSourceLocator(
        {
          source: 'Austevoll Seafood Årsrapport 2024',
          year: 2024,
          company: { orgNr: '929975200' },
        },
        new Set(),
      ),
      'https://auss.no/media/1627/auss-annual-report-2024-250430.pdf',
    )

    assert.equal(
      resolveCompanyFinancialSourceLocator(
        {
          source: 'Austevoll Seafood Årsrapport 2022',
          year: 2022,
          company: { orgNr: '929975200' },
        },
        new Set(),
      ),
      'https://www.auss.no/investor/news/annual-report-2022/',
    )

    assert.equal(
      resolveCompanyFinancialSourceLocator(
        {
          source: 'Austevoll Seafood Årsrapport 2023',
          year: 2023,
          company: { orgNr: '929975200' },
        },
        new Set(),
      ),
      'https://www.auss.no/media/1569/annual-report-2023-austevoll-seafood-asa.pdf',
    )

    assert.equal(
      resolveCompanyFinancialSourceLocator(
        {
          source: 'Årsrapport 2024 (EUR 5 599M, kurs ~11.4)',
          year: 2024,
          company: { orgNr: '964118191' },
        },
        new Set(),
      ),
      'https://mowi.com/wp-content/uploads/2025/03/Mowi-Integrated-Annual-Report-2024.pdf',
    )

    assert.equal(
      resolveCompanyFinancialSourceLocator(
        {
          source: 'Årsrapport 2020 (EUR 3 760M, kurs ~10.7)',
          year: 2020,
          company: { orgNr: '964118191' },
        },
        new Set(),
      ),
      'https://mowi.com/wp-content/uploads/2021/03/Mowi_Integrated_Annual_Report_2020.pdf',
    )

    assert.equal(
      resolveCompanyFinancialSourceLocator(
        {
          source: 'Årsrapport 2021 (EUR 4 630M, kurs ~10.2)',
          year: 2021,
          company: { orgNr: '964118191' },
        },
        new Set(),
      ),
      'https://mowi.com/wp-content/uploads/2022/03/Mowi_Annual_Report_2021.pdf',
    )

    assert.equal(
      resolveCompanyFinancialSourceLocator(
        {
          source: 'Årsrapport 2022 (EUR 5 478M, kurs ~10.1)',
          year: 2022,
          company: { orgNr: '964118191' },
        },
        new Set(),
      ),
      'https://mowi.com/wp-content/uploads/2023/03/Mowi-Integrated-Annual-Report-2022.pdf',
    )

    assert.equal(
      resolveCompanyFinancialSourceLocator(
        {
          source: 'Årsrapport 2023 (EUR 5 500M, kurs ~11.4)',
          year: 2023,
          company: { orgNr: '964118191' },
        },
        new Set(),
      ),
      'https://mowi.com/wp-content/uploads/2024/03/Mowi_Integrated_Annual_Report_2023.pdf',
    )

    assert.equal(
      resolveCompanyFinancialSourceLocator(
        {
          source: 'Årsrapport 2024',
          year: 2024,
          company: { orgNr: '960514718' },
        },
        new Set(),
      ),
      'https://ml-eu.globenewswire.com/Resource/Download/1da20c9a-09bb-4d58-8e81-72f7942be36f',
    )

    assert.equal(
      resolveCompanyFinancialSourceLocator(
        {
          source: 'Axfood Årsredovisning 2020. SEK 53.5B, 1 SEK ≈ 0.97 NOK',
          year: 2020,
          company: { orgNr: 'SE-556542-5353' },
        },
        new Set(),
      ),
      'https://www.axfood.com/investors/reports-and-presentations/annual-and-sustainability-report-2020/',
    )

    assert.equal(
      resolveCompanyFinancialSourceLocator(
        {
          source: 'Axfood Årsredovisning 2021. SEK 55.8B, 1 SEK ≈ 0.97 NOK',
          year: 2021,
          company: { orgNr: 'SE-556542-5353' },
        },
        new Set(),
      ),
      'https://www.axfood.com/investors/reports-and-presentations/annual-and-sustainability-report-2021/',
    )

    assert.equal(
      resolveCompanyFinancialSourceLocator(
        {
          source: 'Axfood Årsredovisning 2022. SEK 63.0B, 1 SEK ≈ 0.98 NOK',
          year: 2022,
          company: { orgNr: 'SE-556542-5353' },
        },
        new Set(),
      ),
      'https://www.axfood.com/investors/reports-and-presentations/annual-and-sustainability-report-2022/',
    )

    assert.equal(
      resolveCompanyFinancialSourceLocator(
        {
          source: 'Axfood Årsredovisning 2023. SEK 67.4B, 1 SEK ≈ 1.00 NOK',
          year: 2023,
          company: { orgNr: 'SE-556542-5353' },
        },
        new Set(),
      ),
      'https://www.axfood.com/newsroom/press-releases/2024/02/axfood-publishes-annual-and-sustainability-report-2023/',
    )

    assert.equal(
      resolveCompanyFinancialSourceLocator(
        {
          source: 'Årsrapport 2024',
          year: 2024,
          company: { orgNr: '975350940' },
        },
        new Set(),
      ),
      'https://web-prod.leroyseafood.com/globalassets/02--documents/english/annual-reports/lsg-annual-report-2024.pdf',
    )

    assert.equal(
      resolveCompanyFinancialSourceLocator(
        {
          source: 'Årsrapport 2024',
          year: 2024,
          company: { orgNr: '986228608' },
        },
        new Set(),
      ),
      'https://www.yara.com/siteassets/investors/057-reports-and-presentations/annual-reports/2024/yara-integrated-report-2024.pdf',
    )

    assert.equal(
      resolveCompanyFinancialSourceLocator(
        {
          source: 'Årsrapport 2020 (USD 11.6B, kurs ~9.4)',
          year: 2020,
          company: { orgNr: '986228608' },
        },
        new Set(),
      ),
      'https://www.yara.com/investor-relations/reports-and-presentations-2020/',
    )

    assert.equal(
      resolveCompanyFinancialSourceLocator(
        {
          source: 'Årsrapport 2021 (USD 16.6B, kurs ~8.6)',
          year: 2021,
          company: { orgNr: '986228608' },
        },
        new Set(),
      ),
      'https://www.yara.com/siteassets/investors/057-reports-and-presentations/annual-reports/2021/yara-integrated-report-2021.pdf',
    )

    assert.equal(
      resolveCompanyFinancialSourceLocator(
        {
          source: 'Årsrapport 2022 (USD 24.1B, kurs ~9.6)',
          year: 2022,
          company: { orgNr: '986228608' },
        },
        new Set(),
      ),
      'https://www.yara.com/siteassets/investors/057-reports-and-presentations/annual-reports/2022/yara-integrated-report-2022.pdf',
    )

    assert.equal(
      resolveCompanyFinancialSourceLocator(
        {
          source: 'Årsrapport 2023 (USD 15.6B, kurs ~10.5)',
          year: 2023,
          company: { orgNr: '986228608' },
        },
        new Set(),
      ),
      'https://www.yara.com/siteassets/investors/057-reports-and-presentations/annual-reports/2023/yara-integrated-report-2023.pdf',
    )

    assert.equal(
      resolveCompanyFinancialSourceLocator(
        {
          source: 'Årsrapport 2024',
          year: 2024,
          company: { orgNr: '910747711' },
        },
        new Set(),
      ),
      'https://www.orkla.com/files/Documents/Governance/AGM2025/ENG/Orkla-Annual-Report-2024.pdf',
    )

    assert.equal(
      resolveCompanyFinancialSourceLocator(
        {
          source: 'Årsrapport 2024',
          year: 2024,
          company: { orgNr: '938752648' },
        },
        new Set(),
      ),
      'https://www.nortura.no/attachments/Annual-report/Nortura_annual_report_2024.pdf',
    )

    assert.equal(
      resolveCompanyFinancialSourceLocator(
        {
          source: 'Årsrapport 2024',
          year: 2024,
          company: { orgNr: '947942638' },
        },
        new Set(),
      ),
      'https://www.tine.no/om-tine/finansiell-informasjon/_/attachment/inline/9cea416b-a20a-4626-96ed-65bce2a82685%3A31abe1fe90c6862b897357ca6350a74a6e6b38b1/TINE%20%C3%85rsrapport%202024.pdf',
    )

    assert.equal(
      resolveCompanyFinancialSourceLocator(
        {
          source: 'Årsrapport 2024',
          year: 2024,
          company: { orgNr: '911608103' },
        },
        new Set(),
      ),
      'https://fka.felleskjopet.no/globalassets/medlem/arsrapporter/aarsrapport_felleskjoepet_2024.pdf',
    )

    const verifiedHistoricalAnnualReports = [
      [
        '819731322',
        2020,
        'https://www.norgesgruppen.no/globalassets/finansiell-informasjon/rapporter/2020/ars-og-barekraftsrapport-2020.pdf',
      ],
      [
        '819731322',
        2021,
        'https://www.norgesgruppen.no/globalassets/ars--og-barekraftsrapport-2021.pdf',
      ],
      [
        '819731322',
        2022,
        'https://www.norgesgruppen.no/globalassets/finansiell-informasjon/rapporter/2022/ng_ars--og-barekraftsrapport-2022.pdf',
      ],
      [
        '819731322',
        2023,
        'https://www.norgesgruppen.no/globalassets/finansiell-informasjon/rapporter/2023/ng_ars--og-barekraftsrapport-2023.pdf',
      ],
      [
        '936560288',
        2021,
        'https://assets.eu.ctfassets.net/69zmfo9ko3qk/dCzTFsTdMXSAgcHdKHJ9c/143eaf54260f63660f714fbb9d641c54/coop-norge-sa-aarsrapport-2021-lr.pdf',
      ],
      [
        '936560288',
        2022,
        'https://assets.eu.ctfassets.net/69zmfo9ko3qk/6ZLRYO8MV7IK5HADZG7bN7/be730e1b3a9872797555b5f5fbd81771/coop-norge-sa_arsrapport-2022_oppslag_lr-v2.pdf',
      ],
      [
        '936560288',
        2023,
        'https://downloads.eu.ctfassets.net/69zmfo9ko3qk/67AGJoXNUZbqoJNBklCYpd/af08885290d41fbc969f1b0379e797a4/Coop_Norge_%C3%85rs_og_b%C3%A6rekraftsrapport_2023_h%C3%B8ytoppl%C3%B8selig.pdf',
      ],
      [
        '914526647',
        2021,
        'https://cdn.sanity.io/files/z1voeyrb/production/8606344eb9c9bca94a349ef88b28414346964b40.pdf',
      ],
      [
        '914526647',
        2022,
        'https://cdn.sanity.io/files/z1voeyrb/production/4468c7db7ad29d4b695400c9cc27e756c5d1a545.pdf',
      ],
      [
        '914526647',
        2023,
        'https://cdn.sanity.io/files/z1voeyrb/production/ed33530339030204bf8f8e6e768645581b9dd2c0.pdf',
      ],
      [
        '910747711',
        2020,
        'https://www.orkla.com/media/press-releases/2021/orklas-annual-report-2020/',
      ],
      [
        '910747711',
        2021,
        'https://www.orkla.com/media/press-releases/2022/orklas-annual-report-now-published-2022-03-25/',
      ],
      [
        '910747711',
        2022,
        'https://www.orkla.com/media/press-releases/2023/orklas-annual-report-2022/',
      ],
      [
        '910747711',
        2023,
        'https://www.orkla.com/media/press-releases/2024/orklas-annual-report-2023/',
      ],
      [
        '938752648',
        2020,
        'https://www.nortura.no/attachments/%C3%85rsmeldinger/Nortura_arsmelding_2020.pdf',
      ],
      [
        '938752648',
        2021,
        'https://www.nortura.no/attachments/%C3%85rsmeldinger/Nortura-arsmelding-2021.pdf',
      ],
      [
        '938752648',
        2022,
        'https://www.nortura.no/attachments/%C3%85rsmeldinger/Nortura-arsmelding-2022.pdf',
      ],
      [
        '938752648',
        2023,
        'https://www.nortura.no/attachments/%C3%85rsmeldinger/Nortura_aarsmelding_2023.pdf',
      ],
      ['947942638', 2020, 'https://www.tine.no/om-tine/finansiell-informasjon'],
      ['947942638', 2021, 'https://www.tine.no/om-tine/finansiell-informasjon'],
      ['947942638', 2022, 'https://www.tine.no/om-tine/finansiell-informasjon'],
      ['947942638', 2023, 'https://www.tine.no/om-tine/finansiell-informasjon'],
      ['911608103', 2020, 'https://fka.felleskjopet.no/presse/arsrapporter/'],
      ['911608103', 2021, 'https://fka.felleskjopet.no/presse/arsrapporter/'],
      ['911608103', 2022, 'https://fka.felleskjopet.no/presse/arsrapporter/'],
      ['911608103', 2023, 'https://fka.felleskjopet.no/presse/arsrapporter/'],
      [
        '914224314',
        2020,
        'https://www.bama.no/siteassets/bama/om-bama/arsrapport/bama_arsrapport_2020_web.pdf',
      ],
      [
        '914224314',
        2021,
        'https://www.bama.no/siteassets/bama/om-bama/arsrapport/bama-arsrapport-2021.pdf',
      ],
      [
        '914224314',
        2022,
        'https://www.bama.no/siteassets/bama/om-bama/arsrapport/bama_aarsrapport_2022_no_.pdf',
      ],
      [
        '914224314',
        2023,
        'https://www.bama.no/siteassets/bama/om-bama/arsrapport/2023/2023_bama_aarsrapport_.pdf',
      ],
      ['960514718', 2020, 'https://www.salmar.no/en/investor/annual-reports/'],
      ['960514718', 2021, 'https://www.salmar.no/en/investor/annual-reports/'],
      ['960514718', 2022, 'https://www.salmar.no/en/investor/annual-reports/'],
      ['960514718', 2023, 'https://www.salmar.no/en/investor/annual-reports/'],
      [
        '975350940',
        2020,
        'https://www.leroyseafood.com/globalassets/02--documents/english/annual-reports/annual-report-2020.pdf',
      ],
      [
        '975350940',
        2021,
        'https://www.leroyseafood.com/globalassets/02--documents/rapporter/arsrapporter/arsrapport-2021/leroy-annual-report-eng-2021.pdf',
      ],
      [
        '975350940',
        2022,
        'https://www.leroyseafood.com/globalassets/02--documents/english/annual-reports/leroy-annual-report-22-pdf240523.pdf',
      ],
      [
        '975350940',
        2023,
        'https://www.leroyseafood.com/globalassets/02--documents/english/annual-reports/annual-report-2023/',
      ],
    ] as const

    for (const [orgNr, year, expected] of verifiedHistoricalAnnualReports) {
      assert.equal(
        resolveCompanyFinancialSourceLocator(
          {
            source: `Årsrapport ${year}`,
            year,
            company: { orgNr },
          },
          new Set(),
        ),
        expected,
      )
    }

    const verifiedNordicAnnualReports = [
      ['DK-26259495', 2020, 'Coop Danmark Årsrapport 2020', 'https://coop.dk/kontakt/pressekontakt/arsrapporter/'],
      ['DK-26259495', 2021, 'Coop Danmark Årsrapport 2021', 'https://coop.dk/kontakt/pressekontakt/arsrapporter/'],
      ['DK-26259495', 2022, 'Coop Danmark Årsrapport 2022', 'https://coop.dk/kontakt/pressekontakt/arsrapporter/'],
      ['DK-26259495', 2023, 'Coop Danmark Årsrapport 2023', 'https://coop.dk/kontakt/pressekontakt/arsrapporter/'],
      ['SE-702001-3469', 2020, 'Coop Sverige/KF Årsredovisning 2020', 'https://kf.se/verksamhetsberattelse/'],
      ['SE-702001-3469', 2021, 'Coop Sverige/KF Årsredovisning 2021', 'https://kf.se/verksamhetsberattelse/'],
      ['SE-702001-3469', 2022, 'Coop Sverige/KF Årsredovisning 2022', 'https://kf.se/verksamhetsberattelse/'],
      ['SE-702001-3469', 2023, 'Coop Sverige/KF Årsredovisning 2023', 'https://kf.se/verksamhetsberattelse/'],
      ['SE-702001-3469', 2024, 'Coop Sverige/KF Årsredovisning 2024', 'https://kf.se/verksamhetsberattelse/'],
      ['DK-38714295', 2020, 'Dagrofa Årsrapport 2020', 'https://www.dagrofa.dk/om-dagrofa/aarsrapporter/'],
      ['DK-38714295', 2021, 'Dagrofa Årsrapport 2021', 'https://www.dagrofa.dk/om-dagrofa/aarsrapporter/'],
      ['DK-38714295', 2022, 'Dagrofa Årsrapport 2022', 'https://www.dagrofa.dk/om-dagrofa/aarsrapporter/'],
      ['DK-38714295', 2023, 'Dagrofa Årsrapport 2023', 'https://www.dagrofa.dk/om-dagrofa/aarsrapporter/'],
      ['IS-670203-2120', 2020, 'Hagar hf Ársreikningur 2020', 'https://www.hagar.is/en/investors/overview/'],
      ['IS-670203-2120', 2021, 'Hagar hf Ársreikningur 2021', 'https://www.hagar.is/en/investors/overview/'],
      ['IS-670203-2120', 2022, 'Hagar hf Ársreikningur 2022', 'https://www.hagar.is/en/investors/overview/'],
      ['IS-670203-2120', 2023, 'Hagar hf Ársreikningur 2023', 'https://www.hagar.is/en/investors/overview/'],
      ['SE-556048-2837', 2020, 'ICA Gruppen Årsrapport 2020', 'https://report.icagruppen.se/sv/ar2020'],
      ['SE-556048-2837', 2021, 'ICA Gruppen Årsrapport 2021', 'https://report.icagruppen.se/sv/ar2021'],
      ['SE-556048-2837', 2022, 'ICA Gruppen Årsrapport 2022', 'https://report.icagruppen.se/sv/ar2022'],
      ['SE-556048-2837', 2023, 'ICA Gruppen Årsrapport 2023', 'https://report.icagruppen.se/sv/ar2023'],
      [
        'FI-0110456-8',
        2020,
        'Kesko vuosikertomus 2020',
        'https://www.kesko.fi/en/investor/financial-information-and-publications/Annual-reports/',
      ],
      [
        'FI-0110456-8',
        2021,
        'Kesko vuosikertomus 2021',
        'https://www.kesko.fi/en/investor/financial-information-and-publications/Annual-reports/',
      ],
      [
        'FI-0110456-8',
        2022,
        'Kesko vuosikertomus 2022',
        'https://www.kesko.fi/en/investor/financial-information-and-publications/Annual-reports/',
      ],
      [
        'FI-0110456-8',
        2023,
        'Kesko vuosikertomus 2023',
        'https://www.kesko.fi/en/investor/financial-information-and-publications/Annual-reports/',
      ],
      [
        '989278835',
        2020,
        'Nofima Årsrapport 2020',
        'https://nofima.no/wp-content/uploads/2021/06/Nofima-AS-Arsmelding-2020-inkl-revisjonsberetning.pdf',
      ],
      [
        '989278835',
        2021,
        'Nofima Årsrapport 2021',
        'https://nofima.no/wp-content/uploads/2022/06/Nofima_AS_Arsmelding_2021-signert-inkl-revisjonsberetning.pdf',
      ],
      [
        '989278835',
        2022,
        'Nofima Årsrapport 2022',
        'https://nofima.no/wp-content/uploads/2023/06/Nofima_AS_Arsmelding_2022-signert-inkl-revisjonsberetning.pdf',
      ],
      [
        '989278835',
        2023,
        'Nofima Årsrapport 2023',
        'https://nofima.no/wp-content/uploads/2024/06/Nofima_AS_Arsmelding_2023-signert-inkl-revisjonsberetning.pdf',
      ],
      ['DK-35954716', 2020, 'Salling Group Årsrapport 2020', 'https://sallinggroup.com/en/publications'],
      ['DK-35954716', 2021, 'Salling Group Årsrapport 2021', 'https://sallinggroup.com/en/publications'],
      ['DK-35954716', 2022, 'Salling Group Årsrapport 2022', 'https://sallinggroup.com/en/publications'],
      ['DK-35954716', 2023, 'Salling Group Årsrapport 2023', 'https://sallinggroup.com/en/publications'],
      [
        'FI-0116323-9',
        2020,
        'SOK tilinpäätös 2020',
        'https://s-ryhma.fi/en/news/record-figures-in-supermarket-trade-helped-s-group/7twxdtvvCTZNVAqtlbWY5X',
      ],
      [
        'FI-0116323-9',
        2021,
        'SOK tilinpäätös 2021',
        'https://s-ryhma.fi/en/news/s-group-achieve-a-strong-profit-and-record-high-in/2GrOYx1rzOolcQ0a0VSpnm',
      ],
      [
        'FI-0116323-9',
        2022,
        'SOK tilinpäätös 2022',
        'https://s-ryhma.fi/en/news/recovery-of-hotels-and-restaurants-strengthened-s-/2ETcfbSRHZwoQaL6Yuj00f',
      ],
      [
        'FI-0116323-9',
        2023,
        'SOK tilinpäätös 2023',
        'https://s-ryhma.fi/en/news/co-op-membership-is-highly-attractive-s-groups-ope/7zX99GAIfxYlQv18PJbKhh',
      ],
    ] as const

    for (const [orgNr, year, source, expected] of verifiedNordicAnnualReports) {
      assert.equal(
        resolveCompanyFinancialSourceLocator(
          {
            source,
            year,
            company: { orgNr },
          },
          new Set(),
        ),
        expected,
      )
    }

    assert.equal(
      resolveCompanyFinancialSourceLocator(
        {
          source: 'Årsrapport 2020',
          year: 2020,
          company: { orgNr: '914526647' },
        },
        new Set(),
      ),
      'https://api.reitan.no/app/uploads/2021/10/Arsrapport_2020_digital_fil.pdf',
    )

    assert.equal(
      resolveCompanyFinancialSourceLocator(
        {
          source: 'Årsrapport 2020',
          year: 2020,
          company: { orgNr: '936560288' },
        },
        new Set(),
      ),
      'https://downloads.eu.ctfassets.net/69zmfo9ko3qk/7hZTKuzlxvTcHJ7cD4yDaz/ac9854bb7f9d55ad5a7add45a5a5d67f/Coop_aarsrapport_2020.pdf',
    )

    assert.equal(
      resolveCompanyFinancialSourceLocator(
        {
          source: 'Estimat basert på bransjedata',
          year: 2024,
          company: { orgNr: '988044113' },
        },
        new Set(),
      ),
      'source:blocked-unsourced/company-financial-estimate',
    )
  })

  it('marks unresolved company financial source labels as blocked internal provenance', () => {
    assert.equal(
      resolveCompanyFinancialSourceLocator(
        {
          source: 'Estimat. EUR ~1.99B, 1 EUR ≈ 11.5 NOK. Statista/Lidl Finland.',
          year: 2024,
          company: { orgNr: 'FI-1615492-7' },
        },
        new Set(),
      ),
      'source:blocked-unsourced/company-financial-estimate',
    )

    assert.equal(
      resolveCompanyFinancialSourceLocator(
        {
          source: 'Årsrapport 2024',
          year: 2024,
          company: { orgNr: '929228723' },
        },
        new Set(),
      ),
      'source:blocked-unsourced/company-financial-unverified-annual-report',
    )
  })

  it('resolves company financial rows to official result pages only for verified publisher-year labels', () => {
    assert.equal(
      resolveCompanyFinancialSourceLocator(
        {
          source: 'Dagrofa Corporate Presentation 2024. DKK ~20B, 1 DKK ≈ 1.55 NOK',
          year: 2024,
          company: { orgNr: 'DK-38714295' },
        },
        new Set(),
      ),
      'https://www.dagrofa.dk/artikel/dagrofa-overgaar-igen-sig-selv-med-bedste-driftsindtjening-i-nyere-tid/',
    )

    assert.equal(
      resolveCompanyFinancialSourceLocator(
        {
          source: 'SOK Financial Statements Bulletin 2024. EUR 14.3B (retail sales), 1 EUR ≈ 11.5 NOK',
          year: 2024,
          company: { orgNr: 'FI-0116323-9' },
        },
        new Set(),
      ),
      'https://s-ryhma.fi/en/news/s-groups-investments-in-finland-nearly-eur-1-billi/7chnW0iL7yorOogGzyYcSa',
    )

    assert.equal(
      resolveCompanyFinancialSourceLocator(
        {
          source:
            'Axfood City Gross key figures 2025. SEK 8,898M net sales; SEK -192M operating profit; 1 SEK ≈ 1.00 NOK',
          year: 2025,
          company: { orgNr: 'SE-556597-2451' },
        },
        new Set(),
      ),
      'https://www.axfood.com/about-axfood/the-axfood-family/city-gross/',
    )

    assert.equal(
      resolveCompanyFinancialSourceLocator(
        {
          source: 'Regnskap 2024',
          year: 2024,
          company: { orgNr: '815664582' },
        },
        new Set(),
      ),
      'https://data.brreg.no/regnskapsregisteret/regnskap/815664582?regnskapsaar=2024',
    )

    assert.equal(
      resolveCompanyFinancialSourceLocator(
        {
          source: 'Proff.no 2023',
          year: 2022,
          company: { orgNr: '815664582' },
        },
        new Set(),
      ),
      'https://data.brreg.no/regnskapsregisteret/regnskap/815664582?regnskapsaar=2022',
    )

    assert.equal(
      resolveCompanyFinancialSourceLocator(
        {
          source:
            'Coop Sverige/KF Årsredovisning 2024. ~SEK 48.3B (combined coops), 1 SEK ≈ 1.00 NOK. SEK 2.7B operating loss.',
          year: 2024,
          company: { orgNr: 'SE-702001-3469' },
        },
        new Set(),
      ),
      'https://kf.se/verksamhetsberattelse/',
    )

    assert.equal(
      resolveCompanyFinancialSourceLocator(
        {
          source: 'Regnskap 2024',
          year: 2024,
          company: { orgNr: 'SE-702001-3469' },
        },
        new Set(),
      ),
      null,
    )
  })

  it('resolves shareholder rows only to verified annual reports or imported annual-report documents', () => {
    const documentRefs = new Set([
      'evidence-pack/arsrapporter/axfood-annual-report-2024',
      'evidence-pack/arsrapporter/coop-norge-2024',
      'evidence-pack/arsrapporter/kesko-annual-report-2024',
    ])

    assert.equal(
      resolveShareholderSourceLocator(
        {
          name: 'Axel Johnson AB',
          ownershipPct: 50.1,
          company: { orgNr: 'SE-556542-5353' },
        },
        documentRefs,
      ),
      'document:evidence-pack/arsrapporter/axfood-annual-report-2024',
    )

    assert.equal(
      resolveShareholderSourceLocator(
        {
          name: 'Ilmarinen Mutual Pension Insurance',
          ownershipPct: 3.8,
          company: { orgNr: 'FI-0110456-8' },
        },
        documentRefs,
      ),
      'document:evidence-pack/arsrapporter/kesko-annual-report-2024',
    )

    assert.equal(
      resolveShareholderSourceLocator(
        {
          name: 'Samvirkelagene (1,9 mill. medlemmer)',
          ownershipPct: 100,
          company: { orgNr: '936560288' },
        },
        documentRefs,
      ),
      'document:evidence-pack/arsrapporter/coop-norge-2024',
    )

    assert.equal(
      resolveShareholderSourceLocator(
        {
          name: 'John Fredriksen',
          ownershipPct: 14.4,
          company: { orgNr: '964118191' },
        },
        documentRefs,
      ),
      'https://mowi.com/wp-content/uploads/2025/03/Mowi-Integrated-Annual-Report-2024.pdf',
    )

    assert.equal(
      resolveShareholderSourceLocator(
        {
          name: 'Den norske stat',
          ownershipPct: 36.2,
          company: { orgNr: '986228608' },
        },
        documentRefs,
      ),
      'https://www.yara.com/siteassets/investors/057-reports-and-presentations/annual-reports/2024/yara-integrated-report-2024.pdf',
    )

    assert.equal(
      resolveShareholderSourceLocator(
        {
          name: '42 000 bondemedlemmer',
          ownershipPct: 100,
          company: { orgNr: '911608103' },
        },
        documentRefs,
      ),
      'https://fka.felleskjopet.no/globalassets/medlem/arsrapporter/aarsrapport_felleskjoepet_2024.pdf',
    )

    assert.equal(
      resolveShareholderSourceLocator(
        {
          name: 'Lífeyrissjóður verzlunarmanna',
          ownershipPct: 12,
          company: { orgNr: 'IS-670203-2120' },
        },
        new Set(['evidence-pack/arsrapporter/hagar-2024-25']),
      ),
      'document:evidence-pack/arsrapporter/hagar-2024-25',
    )
  })

  it('keeps shareholder rows unresolved when the annual-report evidence has not been checked', () => {
    const documentRefs = new Set([
      'evidence-pack/arsrapporter/axfood-annual-report-2024',
      'evidence-pack/arsrapporter/coop-norge-2024',
      'evidence-pack/arsrapporter/kesko-annual-report-2024',
      'evidence-pack/arsrapporter/norgesgruppen-2024',
    ])

    assert.equal(
      resolveShareholderSourceLocator(
        {
          name: 'NorgesGruppen',
          ownershipPct: 46,
          company: { orgNr: '914224314' },
        },
        documentRefs,
      ),
      'https://www.bama.no/siteassets/bama/arsrapport/2024/bama-2024-no.pdf',
    )

    assert.equal(
      resolveShareholderSourceLocator(
        {
          name: 'REMA Industrier AS',
          ownershipPct: 20,
          company: { orgNr: '914224314' },
        },
        documentRefs,
      ),
      'https://www.bama.no/siteassets/bama/arsrapport/2024/bama-2024-no.pdf',
    )

    assert.equal(
      resolveShareholderSourceLocator(
        {
          name: 'AS Banan',
          ownershipPct: 34,
          company: { orgNr: '914224314' },
        },
        documentRefs,
      ),
      'https://www.bama.no/siteassets/bama/arsrapport/2024/bama-2024-no.pdf',
    )

    assert.equal(
      resolveShareholderSourceLocator(
        {
          name: 'NorgesGruppen ASA (100%)',
          ownershipPct: 100,
          company: { orgNr: '929228723' },
        },
        documentRefs,
      ),
      'document:evidence-pack/arsrapporter/norgesgruppen-2024',
    )

    assert.equal(
      resolveShareholderSourceLocator(
        {
          name: 'Eignarhaldsfélagið Fasteign hf',
          ownershipPct: 34,
          company: { orgNr: 'IS-540206-2010' },
        },
        documentRefs,
      ),
      null,
    )

    assert.equal(
      resolveShareholderSourceLocator(
        {
          name: 'Too Good To Go ApS (Danmark)',
          ownershipPct: 100,
          company: { orgNr: '917203261' },
        },
        documentRefs,
      ),
      null,
    )

    assert.equal(
      resolveShareholderSourceLocator(
        {
          name: 'Oda Midco AS / Softbank, Kinnevik m.fl.',
          ownershipPct: 100,
          company: { orgNr: '932256134' },
        },
        documentRefs,
      ),
      null,
    )
  })

  it('resolves shareholder rows backed by verified acquisition and transaction announcements', () => {
    assert.equal(
      resolveShareholderSourceLocator(
        {
          name: 'Axfood AB (100% etter oppkjøp)',
          ownershipPct: 100,
          company: { orgNr: 'SE-556597-2451' },
        },
        new Set(),
      ),
      'https://www.axfood.com/newsroom/press-releases/2024/10/axfoods-acquisition-of-city-gross-approved-by-the-swedish-competition-authority/',
    )

    assert.equal(
      resolveShareholderSourceLocator(
        {
          name: 'Mowi ASA',
          ownershipPct: 95,
          company: { orgNr: '961056268' },
        },
        new Set(),
      ),
      'https://www.globenewswire.com/news-release/2025/01/30/3017704/0/en/Mowi-increases-ownership-of-Nova-Sea-from-49-to-95.html',
    )

    assert.equal(
      resolveShareholderSourceLocator(
        {
          name: 'SalMar ASA (100% etter fusjon)',
          ownershipPct: 100,
          company: { orgNr: '952587687' },
        },
        new Set(),
      ),
      'https://www.salmar.no/en/news/settlement-of-mandatory-tender-offer-for-nts-complete/',
    )

    assert.equal(
      resolveShareholderSourceLocator(
        {
          name: 'Rhône Capital',
          ownershipPct: 40,
          company: { orgNr: '911161419' },
        },
        new Set(),
      ),
      'https://www.orkla.com/media/press-releases/2024/partnership-with-rhone-completed/',
    )

    assert.equal(
      resolveShareholderSourceLocator(
        {
          name: 'Solenis International LLC',
          ownershipPct: 100,
          company: { orgNr: '925745855' },
        },
        new Set(),
      ),
      'https://www.orkla.com/media/press-releases/2024/orkla-selger-lilleborg/',
    )
  })

  it('resolves subsidiary and cooperative ownership rows backed by checked group sources', () => {
    const documentRefs = new Set([
      'evidence-pack/arsrapporter/coop-danmark-2024',
      'evidence-pack/arsrapporter/norgesgruppen-2024',
      'evidence-pack/arsrapporter/reitan-retail-2024',
    ])

    assert.equal(
      resolveShareholderSourceLocator(
        {
          name: 'Coop amba (2 mill. medlemmer)',
          ownershipPct: 100,
          company: { orgNr: 'DK-26259495' },
        },
        documentRefs,
      ),
      'document:evidence-pack/arsrapporter/coop-danmark-2024',
    )

    assert.equal(
      resolveShareholderSourceLocator(
        {
          name: 'Reitan Retail AS (Norge)',
          ownershipPct: 100,
          company: { orgNr: 'DK-14705627' },
        },
        documentRefs,
      ),
      'document:evidence-pack/arsrapporter/reitan-retail-2024',
    )

    assert.equal(
      resolveShareholderSourceLocator(
        {
          name: 'NorgesGruppen ASA',
          ownershipPct: 100,
          company: { orgNr: '885316522' },
        },
        documentRefs,
      ),
      'document:evidence-pack/arsrapporter/norgesgruppen-2024',
    )

    assert.equal(
      resolveShareholderSourceLocator(
        {
          name: 'Osuuskaupat (2,7 mill. medlemmer)',
          ownershipPct: 100,
          company: { orgNr: 'FI-0116323-9' },
        },
        documentRefs,
      ),
      'https://s-ryhma.fi/en/about-us/cooperative-activities-and-co-op-membership',
    )

    const verifiedDirectOwnershipRows = [
      [
        '937843860',
        'BioMar Group A/S (Schouw & Co., Danmark)',
        100,
        'https://www.biomar.com/our-story/our-structure/our-board',
      ],
      [
        '961922976',
        'Cermaq Group AS (Mitsubishi Corp.)',
        100,
        'https://www.cermaq.no/om-cermaq',
      ],
      [
        'SE-702001-3469',
        'Kooperativa Förbundet (KF) / 26 konsumentföreningar',
        100,
        'https://kf.se/verksamhetsberattelse/',
      ],
      [
        'DK-38714295',
        'NorgesGruppen ASA (Norge)',
        48.9,
        'https://www.dagrofa.dk/wp-content/uploads/2025/03/DAGROFA_AaRSRAPPORT_2024.pdf',
      ],
      [
        'DK-38714295',
        'KFI Erhvervsdrivende Fond',
        42.5,
        'https://www.dagrofa.dk/wp-content/uploads/2025/03/DAGROFA_AaRSRAPPORT_2024.pdf',
      ],
      [
        'DK-38714295',
        'Selvstændige købmænd',
        8.6,
        'https://www.dagrofa.dk/wp-content/uploads/2025/03/DAGROFA_AaRSRAPPORT_2024.pdf',
      ],
      [
        '945958405',
        'Over 1000 norske grøntprodusenter',
        100,
        'https://gartnerhallen.no/en/om-gartnerhallen/',
      ],
      [
        '937070632',
        'Grilstad Holding AS',
        100,
        'https://www.proff.no/aksjon%C3%A6rer/-/grilstad-as/937070632',
      ],
      [
        '910629085',
        'Lantmännen ek för',
        100,
        'https://api.gleif.org/api/v1/lei-records/529900FDLL01IKOSGX88/direct-parent',
      ],
      [
        '917203261',
        'Too Good To Go Holding ApS (Danmark)',
        100,
        'https://regnskaber.cvrapi.dk/xhtml/99653573/amNsb3VkczovLzAzLzBhLzM1Lzc5LzEyLzQ2NTMtNGMwYi05YjEzLWU2ZjVmNmQwYWQ4Mg.pdf',
      ],
      [
        '932256134',
        'AGP Advokater AS',
        100,
        'https://www.proff.no/aksjon%C3%A6rer/bedrift/oda-group-as/932256134',
      ],
      [
        '989278835',
        'Nærings- og fiskeridepartementet',
        56.8,
        'https://nofima.no/wp-content/uploads/2025/06/Redegjorelse-for-aktsomhetsvurd.-etter-apenhetsloven-for-2024.pdf',
      ],
      [
        '989278835',
        'Stiftelsen for landbruksforskning',
        33.2,
        'https://nofima.no/wp-content/uploads/2025/06/Redegjorelse-for-aktsomhetsvurd.-etter-apenhetsloven-for-2024.pdf',
      ],
      [
        '988597627',
        'Den norske stat v/Nærings- og fiskeridepartementet',
        100,
        'https://www.seafood.no/om-norges-sjomatrad/arsmeldinger-generalforsamling-og-vedtekter/arsmelding-2024/arsberetning/virksomheten/',
      ],
      [
        '988044113',
        'Nutreco/SHV Holdings (Nederland)',
        100,
        'https://www.skretting.com/no/dette-er-skretting/',
      ],
      [
        '913344162',
        'O. Kavli og Knut Kavlis Allmennyttige Fond',
        100,
        'https://www.kavli.no/om-kavli/apenhetsloven',
      ],
      [
        '997898397',
        'NHO Mat og Drikke / Bransjeaktører',
        100,
        'https://www.dlf.no/matvett/',
      ],
      [
        'SE-969697-6594',
        'Schwarz Group (Lidl Stiftung & Co. KG, Tyskland)',
        100,
        'https://gruppe.schwarz/en/who-we-are',
      ],
      [
        'FI-1615492-7',
        'Schwarz Group (Lidl Stiftung & Co. KG, Tyskland)',
        100,
        'https://gruppe.schwarz/en/who-we-are',
      ],
      [
        'IS-571298-3769',
        'Drangar hf (SKEL fjárfestingafélag / Orkan)',
        100,
        'https://skel.is/en/news/interim-financial-statement-h1-2025',
      ],
      [
        'IS-540206-2010',
        'Lífeyrissjóður starfsmanna ríkisins',
        12.9,
        'https://cdn.prod.website-files.com/67925c8eeba76aedbef33d30/67c5c9e3dcfeda989b2c5edd_Festi%20hf%20-%20A%CC%81rsreikningur%202024.pdf',
      ],
      [
        'IS-540206-2010',
        'Lífeyrissjóður verzlunarmanna',
        12.5,
        'https://cdn.prod.website-files.com/67925c8eeba76aedbef33d30/67c5c9e3dcfeda989b2c5edd_Festi%20hf%20-%20A%CC%81rsreikningur%202024.pdf',
      ],
    ] as const

    for (const [orgNr, name, ownershipPct, expected] of verifiedDirectOwnershipRows) {
      assert.equal(
        resolveShareholderSourceLocator(
          {
            name,
            ownershipPct,
            company: { orgNr },
          },
          documentRefs,
        ),
        expected,
      )
    }
  })

  it('resolves Bronnoysund property rows to official company and subunit API endpoints', () => {
    assert.equal(
      resolveCompanyPropertySourceLocator({
        source: 'Brønnøysund',
        company: { orgNr: '819731322' },
      }),
      'https://data.brreg.no/enhetsregisteret/api/enheter/819731322',
    )

    assert.equal(
      resolveCompanyPropertySourceLocator({
        source: 'Brønnøysund underenheter',
        company: { orgNr: '936560288' },
      }),
      'https://data.brreg.no/enhetsregisteret/api/underenheter?overordnetEnhet=936560288',
    )

    assert.equal(
      resolveCompanyPropertySourceLocator({
        source: 'mowi.com (Ulvan)',
        company: { orgNr: '964118191' },
      }),
      'https://mowi.com/en/wp-content/uploads/2024/09/Mowi_Certification_Table_2023.pdf',
    )

    assert.equal(
      resolveCompanyPropertySourceLocator({
        source: 'mowi.com (Hovedkontor Bergen)',
        company: { orgNr: '964118191' },
      }),
      'https://mowi.com/no/kontakt/',
    )

    assert.equal(
      resolveCompanyPropertySourceLocator({
        source: 'salmar.no (InnovaMar)',
        company: { orgNr: '960514718' },
      }),
      'https://www.salmar.no/en/about-salmar/salmars-operating-areas/',
    )

    assert.equal(
      resolveCompanyPropertySourceLocator({
        source: 'skretting.com (Averøy fôrfabrikk)',
        company: { orgNr: '988044113' },
      }),
      'https://www.skretting.com/no/dette-er-skretting/kontakt/',
    )

    assert.equal(
      resolveCompanyPropertySourceLocator({
        source: 'yara.com (Global Headquarters)',
        company: { orgNr: '986228608' },
      }),
      'https://www.yara.com/contact-us/',
    )

    assert.equal(
      resolveCompanyPropertySourceLocator({
        source: 'yara.com (Porsgrunn fabrikk)',
        company: { orgNr: '986228608' },
      }),
      'https://www.yara.no/om-yara/yara-i-norge/',
    )

    assert.equal(
      resolveCompanyPropertySourceLocator({
        source: 'sallinggroup.com (Hovedkontor)',
        company: { orgNr: 'DK-35954716' },
      }),
      'https://www.sallinggroup.com/kontakt/',
    )

    assert.equal(
      resolveCompanyPropertySourceLocator({
        source: 'coop.dk (Hovedkontor)',
        company: { orgNr: 'DK-26259495' },
      }),
      'https://coop.dk/kontakt/',
    )

    assert.equal(
      resolveCompanyPropertySourceLocator({
        source: 'rema1000.dk (Hovedkontor)',
        company: { orgNr: 'DK-14705627' },
      }),
      'https://rema1000.dk/kontakt/',
    )

    assert.equal(
      resolveCompanyPropertySourceLocator({
        source: 'dagrofa.dk (Hovedkontor)',
        company: { orgNr: 'DK-38714295' },
      }),
      'https://www.dagrofa.dk/kontakt-os/',
    )

    assert.equal(
      resolveCompanyPropertySourceLocator({
        source: 'asko.no (ASKO Midt-Norge)',
        company: { orgNr: '929228723' },
      }),
      'https://asko.no/kontakt-oss/vare-asko-selskap/asko-midt-norge-as/',
    )

    assert.equal(
      resolveCompanyPropertySourceLocator({
        source: 'asko.no (ASKO Sør)',
        company: { orgNr: '929228723' },
      }),
      'https://asko.no/kontakt-oss/vare-asko-selskap/asko-agder-as/',
    )

    assert.equal(
      resolveCompanyPropertySourceLocator({
        source: 'asko.no (ASKO Hedmark)',
        company: { orgNr: '929228723' },
      }),
      'https://asko.no/kontakt-oss/vare-asko-selskap/asko-hedmark-as/',
    )

    assert.equal(
      resolveCompanyPropertySourceLocator({
        source: 'asko.no (ASKO Oslofjord)',
        company: { orgNr: '929228723' },
      }),
      'https://asko.no/kontakt-oss/vare-asko-selskap/asko-oslofjord-as/',
    )

    assert.equal(
      resolveCompanyPropertySourceLocator({
        source: 'asko.no (ASKO Drammen)',
        company: { orgNr: '929228723' },
      }),
      'https://asko.no/kontakt-oss/',
    )

    assert.equal(
      resolveCompanyPropertySourceLocator({
        source: 'asko.no (ASKO Nordvest)',
        company: { orgNr: '929228723' },
      }),
      'https://asko.no/kontakt-oss/',
    )

    assert.equal(
      resolveCompanyPropertySourceLocator({
        source: 's-ryhma.fi (Pääkonttori)',
        company: { orgNr: 'FI-0116323-9' },
      }),
      'https://tietosuoja.s-ryhma.fi/en/s-group-retail-trade-partner-and-supplier-register',
    )

    assert.equal(
      resolveCompanyPropertySourceLocator({
        source: 'hagar.is (Höfuðstöðvar)',
        company: { orgNr: 'IS-670203-2120' },
      }),
      'https://www.hagar.is/en/about-hagar/',
    )

    assert.equal(
      resolveCompanyPropertySourceLocator({
        source: 'festi.is (Höfuðstöðvar)',
        company: { orgNr: 'IS-540206-2010' },
      }),
      'https://www.festi.is/en',
    )

    assert.equal(
      resolveCompanyPropertySourceLocator({
        source: 'felleskjopet.no (Kambo fôrfabrikk)',
        company: { orgNr: '911608103' },
      }),
      'https://data.brreg.no/enhetsregisteret/api/underenheter?overordnetEnhet=911608103',
    )

    assert.equal(
      resolveCompanyPropertySourceLocator({
        source: 'BioMar.com (Avaldsnes fôrfabrikk)',
        company: { orgNr: '937843860' },
      }),
      'https://data.brreg.no/enhetsregisteret/api/underenheter?overordnetEnhet=937843860',
    )

    assert.equal(
      resolveCompanyPropertySourceLocator({
        source: 'grilstad.no (Brumunddal)',
        company: { orgNr: '937070632' },
      }),
      'https://data.brreg.no/enhetsregisteret/api/underenheter?overordnetEnhet=937070632',
    )

    assert.equal(
      resolveCompanyPropertySourceLocator({
        source: 'proff.no (Orkanger)',
        company: { orgNr: '980411133' },
      }),
      'https://data.brreg.no/enhetsregisteret/api/underenheter?overordnetEnhet=980411133',
    )

    assert.equal(
      resolveCompanyPropertySourceLocator({
        source: 'proff.no (Distribunal Bergen, Hylkje)',
        company: { orgNr: '894759372' },
      }),
      'https://data.brreg.no/enhetsregisteret/api/underenheter?overordnetEnhet=894759372',
    )

    assert.equal(
      resolveCompanyPropertySourceLocator({
        source: 'proff.no (Moss fabrikk)',
        company: { orgNr: '910629085' },
      }),
      'https://data.brreg.no/enhetsregisteret/api/underenheter?overordnetEnhet=910629085',
    )

    assert.equal(
      resolveCompanyPropertySourceLocator({
        source: 'bama.no (Liertoppen hovedterminal)',
        company: { orgNr: '914224314' },
      }),
      'https://www.bama.no/siteassets/bama/arsrapport/2024/bama-2024-no.pdf',
    )

    assert.equal(
      resolveCompanyPropertySourceLocator({
        source: 'bama.no (Regionterminal Bergen)',
        company: { orgNr: '914224314' },
      }),
      'https://www.bama.no/siteassets/bama/arsrapport/2024/bama-2024-no.pdf',
    )

    assert.equal(
      resolveCompanyPropertySourceLocator({
        source: 'asko.no (ASKO Drammen)',
        company: { orgNr: '929228723' },
      }),
      'https://asko.no/kontakt-oss/',
    )

    assert.equal(
      resolveCompanyPropertySourceLocator({
        source: 'proff.no (Distribunal Tromsø)',
        company: { orgNr: '894759372' },
      }),
      'https://data.brreg.no/enhetsregisteret/api/underenheter?overordnetEnhet=894759372',
    )

    assert.equal(
      resolveCompanyPropertySourceLocator({
        source: 'leroy.no (Stord prosessering)',
        company: { orgNr: '975350940' },
      }),
      'https://www.leroyseafood.com/en/about-us/about-leroy/',
    )

    assert.equal(
      resolveCompanyPropertySourceLocator({
        source: 'icagruppen.se (Huvudkontor)',
        company: { orgNr: 'SE-556048-2837' },
      }),
      'https://www.icagruppen.se/en/contact/?google=true',
    )

    assert.equal(
      resolveCompanyPropertySourceLocator({
        source: 'axfood.se (Huvudkontor)',
        company: { orgNr: 'SE-556542-5353' },
      }),
      'https://www.axfood.com/contact/',
    )

    assert.equal(
      resolveCompanyPropertySourceLocator({
        source: 'coop.se (Huvudkontor)',
        company: { orgNr: 'SE-702001-3469' },
      }),
      'https://suppliernetwork.coop.se/contact-us',
    )

    assert.equal(
      resolveCompanyPropertySourceLocator({
        source: 'lidl.se (Svenskt huvudkontor)',
        company: { orgNr: 'SE-969697-6594' },
      }),
      'https://www.lidl.se/c/bolagsinformation/s10017035',
    )

    assert.equal(
      resolveCompanyPropertySourceLocator({
        source: 'kesko.fi (Pääkonttori)',
        company: { orgNr: 'FI-0110456-8' },
      }),
      'https://www.kesko.fi/en/company/contacts/kesko-corporation/',
    )

    assert.equal(
      resolveCompanyPropertySourceLocator({
        source: 'lidl.fi (Pääkonttori)',
        company: { orgNr: 'FI-1615492-7' },
      }),
      'https://www.lidl.fi/c/lidl-konsernin-yhteystiedot/',
    )

    assert.equal(
      resolveCompanyPropertySourceLocator({
        source: 'samkaup.is (Höfuðstöðvar)',
        company: { orgNr: 'IS-571298-3769' },
      }),
      'https://www.samkaup.is/hafa-samband/',
    )

    assert.equal(
      resolveCompanyPropertySourceLocator({
        source: 'orkla.no (Stabburet Rygge)',
        company: { orgNr: '910747711' },
      }),
      'https://orklafoods.no/orklas-fabrikker/',
    )

    assert.equal(
      resolveCompanyPropertySourceLocator({
        source: 'orkla.no (Hovedkontor)',
        company: { orgNr: '910747711' },
      }),
      'https://www.orkla.no/kontakt-oss/',
    )

    assert.equal(
      resolveCompanyPropertySourceLocator({
        source: 'reitanretail.no (Hovedkontor)',
        company: { orgNr: '914526647' },
      }),
      'https://www.reitanretail.no/en/about',
    )
  })

  it('resolves company ownership rows through direct annual reports and transaction announcements', () => {
    assert.equal(
      resolveCompanyOwnershipSourceLocator(
        {
          source: 'Reitan Retail årsrapport 2024',
          parentCompany: { orgNr: '914526647' },
          childCompany: { orgNr: 'DK-14705627' },
        },
        new Set(['evidence-pack/arsrapporter/reitan-retail-2024']),
      ),
      'document:evidence-pack/arsrapporter/reitan-retail-2024',
    )

    assert.equal(
      resolveCompanyOwnershipSourceLocator(
        {
          source: 'Mowi Borsmeld. jan 2025 / GlobeNewswire',
          parentCompany: { orgNr: '964118191' },
          childCompany: { orgNr: '974353021' },
        },
        new Set(),
      ),
      'https://www.globenewswire.com/news-release/2025/01/30/3017704/0/en/Mowi-increases-ownership-of-Nova-Sea-from-49-to-95.html',
    )

    assert.equal(
      resolveCompanyOwnershipSourceLocator(
        {
          source: 'Axfood Pressrelease 2024-10-29',
          parentCompany: { orgNr: 'SE-556542-5353' },
          childCompany: { orgNr: 'SE-556597-2451' },
        },
        new Set(),
      ),
      'https://www.axfood.com/newsroom/press-releases/2024/10/axfoods-acquisition-of-city-gross-approved-by-the-swedish-competition-authority/',
    )

    assert.equal(
      resolveCompanyOwnershipSourceLocator(
        {
          source: 'Brønnøysund',
          parentCompany: { orgNr: '819731322' },
          childCompany: { orgNr: '929228723' },
        },
        new Set(['evidence-pack/arsrapporter/norgesgruppen-2024']),
      ),
      'document:evidence-pack/arsrapporter/norgesgruppen-2024',
    )

    assert.equal(
      resolveCompanyOwnershipSourceLocator(
        {
          source: 'NorgesGruppen Credit Report 2025 / Dagrofa corporate presentation',
          parentCompany: { orgNr: '819731322' },
          childCompany: { orgNr: 'DK-38714295' },
        },
        new Set(['evidence-pack/arsrapporter/norgesgruppen-2024']),
      ),
      'document:evidence-pack/arsrapporter/norgesgruppen-2024',
    )

    assert.equal(
      resolveCompanyOwnershipSourceLocator(
        {
          source: 'Brønnøysund/Årsrapport',
          parentCompany: { orgNr: '819731322' },
          childCompany: { orgNr: '914224314' },
        },
        new Set(),
      ),
      'https://www.bama.no/siteassets/bama/arsrapport/2024/bama-2024-no.pdf',
    )

    assert.equal(
      resolveCompanyOwnershipSourceLocator(
        {
          source: 'Brønnøysund',
          parentCompany: { orgNr: '819731322' },
          childCompany: { orgNr: '986352325' },
        },
        new Set(),
      ),
      null,
    )
  })

  it('resolves business relationship rows through direct annual-report documents and report URLs', () => {
    assert.equal(
      resolveBusinessRelationshipSourceLocator(
        {
          source: 'Årsrapport 2024',
          fromCompany: { orgNr: '929228723' },
          toCompany: { orgNr: '819731322' },
        },
        new Set(['evidence-pack/arsrapporter/norgesgruppen-2024']),
        new Map(),
      ),
      'document:evidence-pack/arsrapporter/norgesgruppen-2024',
    )

    assert.equal(
      resolveBusinessRelationshipSourceLocator(
        {
          source: 'Konkurrensverket Rapport 2024:5',
          fromCompany: { orgNr: 'SE-556542-5353' },
          toCompany: { orgNr: 'SE-556048-2837' },
        },
        new Set(),
        new Map([
          [
            'se-konkurrensverket-2024-5',
            'https://www.konkurrensverket.se/informationsmaterial/rapportlista/konkurrensverkets-genomlysning-av-livsmedelsbranschen-20232024/',
          ],
        ]),
      ),
      'https://www.konkurrensverket.se/informationsmaterial/rapportlista/konkurrensverkets-genomlysning-av-livsmedelsbranschen-20232024/',
    )

    assert.equal(
      resolveBusinessRelationshipSourceLocator(
        {
          source: 'Matsentralen Årsrapport 2024',
          fromCompany: { orgNr: '919702974' },
          toCompany: { orgNr: '819731322' },
        },
        new Set(),
        new Map(),
      ),
      'https://www.matsentralen.no/rapporter/arsrapport-matsentralen-norge',
    )

    assert.equal(
      resolveBusinessRelationshipSourceLocator(
        {
          source: 'Bransjeavtalen 2017-2030',
          fromCompany: { orgNr: '997898397' },
          toCompany: { orgNr: '819731322' },
        },
        new Set(),
        new Map(),
      ),
      'https://www.regjeringen.no/no/dokumentarkiv/regjeringen-solberg/aktuelt-regjeringen-solberg/kld/nyheter/2017/avtale-om-a-redusere-matsvinn/id2558931/',
    )

    assert.equal(
      resolveBusinessRelationshipSourceLocator(
        {
          source: 'TGTG Partnerliste 2024',
          fromCompany: { orgNr: '917203261' },
          toCompany: { orgNr: '819731322' },
        },
        new Set(),
        new Map(),
      ),
      'source:blocked-unsourced/business-relationship-unverified-label',
    )
  })

  it('resolves business relationship rows through checked company-specific reports', () => {
    const documentRefs = new Set([
      'evidence-pack/arsrapporter/norgesgruppen-2024',
      'evidence-pack/arsrapporter/reitan-retail-2024',
    ])

    assert.equal(
      resolveBusinessRelationshipSourceLocator(
        {
          source: 'BAMA/NorgesGruppen',
          fromCompany: { orgNr: '914224314' },
          toCompany: { orgNr: '819731322' },
        },
        documentRefs,
        new Map(),
      ),
      'https://www.bama.no/siteassets/bama/arsrapport/2024/bama-2024-no.pdf',
    )

    assert.equal(
      resolveBusinessRelationshipSourceLocator(
        {
          source: 'NorgesGruppen/Dagrofa samarbeidsavtale',
          fromCompany: { orgNr: '819731322' },
          toCompany: { orgNr: 'DK-38714295' },
        },
        documentRefs,
        new Map(),
      ),
      'document:evidence-pack/arsrapporter/norgesgruppen-2024',
    )

    assert.equal(
      resolveBusinessRelationshipSourceLocator(
        {
          source: 'Reitan årsrapport',
          fromCompany: { orgNr: '894759372' },
          toCompany: { orgNr: '914526647' },
        },
        documentRefs,
        new Map(),
      ),
      'document:evidence-pack/arsrapporter/reitan-retail-2024',
    )

    assert.equal(
      resolveBusinessRelationshipSourceLocator(
        {
          source: 'Felleskjøpet',
          fromCompany: { orgNr: '911608103' },
          toCompany: { orgNr: '938752648' },
        },
        documentRefs,
        new Map(),
      ),
      'https://fka.felleskjopet.no/globalassets/medlem/arsrapporter/aarsrapport_felleskjoepet_2024.pdf',
    )

    assert.equal(
      resolveBusinessRelationshipSourceLocator(
        {
          source: 'gartnerhallen.no',
          fromCompany: { orgNr: '945958405' },
          toCompany: { orgNr: '914224314' },
        },
        documentRefs,
        new Map(),
      ),
      'https://gartnerhallen.no/nb/tema/markedsbalansering-i-grontmarkedet/',
    )

    assert.equal(
      resolveBusinessRelationshipSourceLocator(
        {
          source: 'gartnerhallen.no',
          fromCompany: { orgNr: '945958405' },
          toCompany: { orgNr: '936560288' },
        },
        documentRefs,
        new Map(),
      ),
      null,
    )
  })

  it('resolves or blocks remaining strict-source business relationship labels', () => {
    assert.equal(
      resolveBusinessRelationshipSourceLocator(
        {
          source: 'KKV FCCA 2024 / PTY',
          fromCompany: { orgNr: 'FI-0116323-9' },
          toCompany: { orgNr: 'FI-0110456-8' },
        },
        new Set(),
        new Map([
          [
            'kkv-fi-4a-dominans',
            'https://www.kkv.fi/en/facts-and-advice/competition-affairs/abuse-of-dominant-position/maaraava-markkina-asema-paivittaistavarakaupassa/',
          ],
        ]),
      ),
      'https://www.kkv.fi/en/facts-and-advice/competition-affairs/abuse-of-dominant-position/maaraava-markkina-asema-paivittaistavarakaupassa/',
    )

    assert.equal(
      resolveBusinessRelationshipSourceLocator(
        {
          source: 'Bransjedata',
          fromCompany: { orgNr: '947942638' },
          toCompany: { orgNr: '819731322' },
        },
        new Set(),
        new Map(),
      ),
      'source:blocked-unsourced/business-relationship-unverified-label',
    )

    assert.equal(
      resolveBusinessRelationshipSourceLocator(
        {
          source: 'Mowi Industry Handbook',
          fromCompany: { orgNr: '988044113' },
          toCompany: { orgNr: '964118191' },
        },
        new Set(),
        new Map(),
      ),
      'source:blocked-unsourced/business-relationship-unverified-label',
    )
  })
})
