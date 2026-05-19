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
        applicationNo: 'SP-2026-002449',
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
      null,
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

    assert.equal(
      resolveCompanyFinancialSourceLocator(
        {
          source: 'Estimat basert på bransjedata',
          year: 2024,
          company: { orgNr: '988044113' },
        },
        new Set(),
      ),
      null,
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
            'Coop Sverige/KF Årsredovisning 2024. ~SEK 48.3B (combined coops), 1 SEK ≈ 1.00 NOK. SEK 2.7B operating loss.',
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
  })

  it('resolves shareholder rows backed by verified acquisition and transaction announcements', () => {
    assert.equal(
      resolveShareholderSourceLocator(
        {
          name: 'Axfood AB (100% etter oppkjøp)',
          ownershipPct: 100,
          company: { orgNr: 'SE-556448-4498' },
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
      null,
    )

    assert.equal(
      resolveCompanyPropertySourceLocator({
        source: 'asko.no (ASKO Nordvest)',
        company: { orgNr: '929228723' },
      }),
      null,
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
        source: 'icagruppen.se (Huvudkontor)',
        company: { orgNr: 'SE-556048-2837' },
      }),
      null,
    )

    assert.equal(
      resolveCompanyPropertySourceLocator({
        source: 'kesko.fi (Pääkonttori)',
        company: { orgNr: 'FI-0110456-8' },
      }),
      null,
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
          childCompany: { orgNr: 'SE-556448-4498' },
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
      null,
    )
  })
})
