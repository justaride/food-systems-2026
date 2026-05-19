const LANDDIR_OPEN_DATA_RAW =
  'https://raw.githubusercontent.com/LandbruksdirektoratetGIT/opendata/refs/heads/main/datasets'

const BRREG_ENHETSREGISTERET_API = 'https://data.brreg.no/enhetsregisteret/api'
const FISKERIDIR_PUB_AQUA_API = 'https://api.fiskeridir.no/pub-aqua/api/v1'
const FISKERIDIR_AQUA_PORTAL_API = 'https://api.fiskeridir.no/aqua-portal-api-public/api/v1'
const SSB_EXTERNAL_TRADE_08801_API = 'https://data.ssb.no/api/v0/en/table/08801/'
const SCB_IMPORTS_EXPORTS_CN_API =
  'https://api.scb.se/OV0104/v1/doris/en/ssd/HA/HA0201/HA0201B/ImpExpKNTotMan'
const STATBANK_SITC2R4_TABLEINFO_API =
  'https://api.statbank.dk/v1/tableinfo?lang=en&id=SITC2R4'
const STATISTICS_ICELAND_UTA06201_API =
  'https://px.hagstofa.is/pxen/api/v1/en/Efnahagur/utanrikisverslun/1_voruvidskipti/01_voruskipti/UTA06201.px'
const MATSENTRALEN_ANNUAL_REPORT_URL =
  'https://www.matsentralen.no/rapporter/arsrapport-matsentralen-norge'
const BRANSJEAVTALEN_MAIN_REPORT_URL =
  'https://www.regjeringen.no/no/dokumentarkiv/regjeringen-solberg/aktuelt-regjeringen-solberg/kld/nyheter/2017/avtale-om-a-redusere-matsvinn/id2558931/'
const AUSTEVOLL_ANNUAL_REPORT_2024_URL =
  'https://auss.no/media/1627/auss-annual-report-2024-250430.pdf'
const MOWI_ANNUAL_REPORT_2024_URL =
  'https://mowi.com/wp-content/uploads/2025/03/Mowi-Integrated-Annual-Report-2024.pdf'
const SALMAR_ANNUAL_REPORT_2024_URL =
  'https://ml-eu.globenewswire.com/Resource/Download/1da20c9a-09bb-4d58-8e81-72f7942be36f'
const LEROY_ANNUAL_REPORT_2024_URL =
  'https://web-prod.leroyseafood.com/globalassets/02--documents/english/annual-reports/lsg-annual-report-2024.pdf'
const YARA_ANNUAL_REPORT_2024_URL =
  'https://www.yara.com/siteassets/investors/057-reports-and-presentations/annual-reports/2024/yara-integrated-report-2024.pdf'
const ORKLA_ANNUAL_REPORT_2024_URL =
  'https://www.orkla.com/files/Documents/Governance/AGM2025/ENG/Orkla-Annual-Report-2024.pdf'
const NORTURA_ANNUAL_REPORT_2024_URL =
  'https://www.nortura.no/attachments/Annual-report/Nortura_annual_report_2024.pdf'
const TINE_ANNUAL_REPORT_2024_URL =
  'https://www.tine.no/om-tine/finansiell-informasjon/_/attachment/inline/9cea416b-a20a-4626-96ed-65bce2a82685%3A31abe1fe90c6862b897357ca6350a74a6e6b38b1/TINE%20%C3%85rsrapport%202024.pdf'
const FELLESKJOPET_ANNUAL_REPORT_2024_URL =
  'https://fka.felleskjopet.no/globalassets/medlem/arsrapporter/aarsrapport_felleskjoepet_2024.pdf'
const AXFOOD_CITY_GROSS_APPROVAL_URL =
  'https://www.axfood.com/newsroom/press-releases/2024/10/axfoods-acquisition-of-city-gross-approved-by-the-swedish-competition-authority/'
const MOWI_NOVA_SEA_GLOBENEWSWIRE_URL =
  'https://www.globenewswire.com/news-release/2025/01/30/3017704/0/en/Mowi-increases-ownership-of-Nova-Sea-from-49-to-95.html'
const SALMAR_NTS_SETTLEMENT_URL =
  'https://www.salmar.no/en/news/settlement-of-mandatory-tender-offer-for-nts-complete/'
const ORKLA_OFI_RHONE_COMPLETION_URL =
  'https://www.orkla.com/media/press-releases/2024/partnership-with-rhone-completed/'
const ORKLA_LILLEBORG_SALE_URL =
  'https://www.orkla.com/media/press-releases/2024/orkla-selger-lilleborg/'
const MOWI_CONTACT_URL = 'https://mowi.com/no/kontakt/'
const MOWI_CERTIFICATION_TABLE_2023_URL =
  'https://mowi.com/en/wp-content/uploads/2024/09/Mowi_Certification_Table_2023.pdf'
const SALMAR_OPERATING_AREAS_URL =
  'https://www.salmar.no/en/about-salmar/salmars-operating-areas/'
const SKRETTING_CONTACT_URL = 'https://www.skretting.com/no/dette-er-skretting/kontakt/'
const YARA_CONTACT_URL = 'https://www.yara.com/contact-us/'
const YARA_NORWAY_OPERATIONS_URL = 'https://www.yara.no/om-yara/yara-i-norge/'
const BAMA_ANNUAL_REPORT_2024_URL =
  'https://www.bama.no/siteassets/bama/arsrapport/2024/bama-2024-no.pdf'
const DAGROFA_2024_RESULT_URL =
  'https://www.dagrofa.dk/artikel/dagrofa-overgaar-igen-sig-selv-med-bedste-driftsindtjening-i-nyere-tid/'
const S_GROUP_2024_FINANCIAL_RESULTS_URL =
  'https://s-ryhma.fi/en/news/s-groups-investments-in-finland-nearly-eur-1-billi/7chnW0iL7yorOogGzyYcSa'
const SALLING_GROUP_CONTACT_URL = 'https://www.sallinggroup.com/kontakt/'
const COOP_DANMARK_CONTACT_URL = 'https://coop.dk/kontakt/'
const REMA1000_DANMARK_CONTACT_URL = 'https://rema1000.dk/kontakt/'
const DAGROFA_CONTACT_URL = 'https://www.dagrofa.dk/kontakt-os/'
const S_GROUP_PARTNER_SUPPLIER_REGISTER_URL =
  'https://tietosuoja.s-ryhma.fi/en/s-group-retail-trade-partner-and-supplier-register'
const HAGAR_ABOUT_URL = 'https://www.hagar.is/en/about-hagar/'
const FESTI_HOME_URL = 'https://www.festi.is/en'
const ASKO_AGDER_URL = 'https://asko.no/kontakt-oss/vare-asko-selskap/asko-agder-as/'
const ASKO_HEDMARK_URL = 'https://asko.no/kontakt-oss/vare-asko-selskap/asko-hedmark-as/'
const ASKO_MIDT_NORGE_URL =
  'https://asko.no/kontakt-oss/vare-asko-selskap/asko-midt-norge-as/'
const ASKO_MOLDE_URL = 'https://asko.no/kontakt-oss/vare-asko-selskap/asko-molde-as/'
const ASKO_NORD_URL = 'https://asko.no/kontakt-oss/vare-asko-selskap/asko-nord-as/'
const ASKO_OSLOFJORD_URL = 'https://asko.no/kontakt-oss/vare-asko-selskap/asko-oslofjord-as/'
const ASKO_OST_URL = 'https://asko.no/kontakt-oss/vare-asko-selskap/asko-ost-as/'
const ASKO_ROGALAND_URL =
  'https://asko.no/kontakt-oss/vare-asko-selskap/asko-rogaland-as/'
const ASKO_SENTRALLAGER_TRANSPORT_URL =
  'https://asko.no/kontakt-oss/vare-asko-selskap/asko-sentrallager-og-transport-as/'
const ASKO_VEST_URL = 'https://asko.no/kontakt-oss/vare-asko-selskap/asko-vest-as/'

type SubsidySourceRow = {
  source?: string | null
  subsidyType?: string | null
  year?: number | null
}

type DeliveryVolumeSourceRow = {
  source?: string | null
  commodity?: string | null
  year?: number | null
}

type AquacultureSiteSourceRow = {
  source?: string | null
  localityNumber?: string | null
}

type AquacultureApplicationSourceRow = {
  source?: string | null
  applicantOrgNr?: string | null
}

type CountryMetricSourceRow = {
  source?: string | null
  metadata?: unknown
}

type CompanyFinancialSourceRow = {
  source?: string | null
  year?: number | null
  company?: {
    orgNr?: string | null
  } | null
}

type CompanyOwnershipSourceRow = {
  source?: string | null
  parentCompany?: {
    orgNr?: string | null
  } | null
  childCompany?: {
    orgNr?: string | null
  } | null
}

type CompanyPropertySourceRow = {
  source?: string | null
  company?: {
    orgNr?: string | null
  } | null
}

type BusinessRelationshipSourceRow = {
  source?: string | null
  fromCompany?: {
    orgNr?: string | null
  } | null
  toCompany?: {
    orgNr?: string | null
  } | null
}

type ShareholderSourceRow = {
  name?: string | null
  ownershipPct?: number | string | { toString(): string } | null
  company?: {
    orgNr?: string | null
  } | null
}

type ReportSourceUrlMap = Pick<Map<string, string | null | undefined>, 'get'>
type DocumentRefSet = Pick<Set<string>, 'has'>

const COMPANY_FINANCIAL_ANNUAL_REPORT_REFS: Record<string, string> = {
  '819731322:2024': 'evidence-pack/arsrapporter/norgesgruppen-2024',
  '936560288:2024': 'evidence-pack/arsrapporter/coop-norge-2024',
  '914526647:2024': 'evidence-pack/arsrapporter/reitan-retail-2024',
  'SE-556048-2837:2024': 'evidence-pack/arsrapporter/ica-gruppen-annual-report-2024',
  'SE-556542-5353:2024': 'evidence-pack/arsrapporter/axfood-annual-report-2024',
  'DK-35954716:2024': 'evidence-pack/arsrapporter/salling-group-2024',
  'DK-26259495:2024': 'evidence-pack/arsrapporter/coop-danmark-2024',
  'FI-0110456-8:2024': 'evidence-pack/arsrapporter/kesko-annual-report-2024',
  'IS-670203-2120:2024': 'evidence-pack/arsrapporter/hagar-2024-25',
}

const COMPANY_FINANCIAL_ANNUAL_REPORT_URLS: Record<string, string> = {
  '929975200:2024': AUSTEVOLL_ANNUAL_REPORT_2024_URL,
  '964118191:2024': MOWI_ANNUAL_REPORT_2024_URL,
  '960514718:2024': SALMAR_ANNUAL_REPORT_2024_URL,
  '975350940:2024': LEROY_ANNUAL_REPORT_2024_URL,
  '986228608:2024': YARA_ANNUAL_REPORT_2024_URL,
  '910747711:2024': ORKLA_ANNUAL_REPORT_2024_URL,
  '938752648:2024': NORTURA_ANNUAL_REPORT_2024_URL,
  '947942638:2024': TINE_ANNUAL_REPORT_2024_URL,
  '911608103:2024': FELLESKJOPET_ANNUAL_REPORT_2024_URL,
}

const COMPANY_FINANCIAL_OFFICIAL_RESULT_LOCATORS: Array<{
  orgNr: string
  year: number
  sourceTokens: string[]
  url: string
}> = [
  {
    orgNr: 'DK-38714295',
    year: 2024,
    sourceTokens: ['dagrofa', 'corporate', 'presentation', '2024'],
    url: DAGROFA_2024_RESULT_URL,
  },
  {
    orgNr: 'FI-0116323-9',
    year: 2024,
    sourceTokens: ['sok', 'financial', 'statements', 'bulletin', '2024'],
    url: S_GROUP_2024_FINANCIAL_RESULTS_URL,
  },
]

const SHAREHOLDER_ANNUAL_REPORT_REFS: Record<string, string> = {
  '819731322': 'evidence-pack/arsrapporter/norgesgruppen-2024',
  '936560288': 'evidence-pack/arsrapporter/coop-norge-2024',
  '914526647': 'evidence-pack/arsrapporter/reitan-retail-2024',
  'SE-556048-2837': 'evidence-pack/arsrapporter/ica-gruppen-annual-report-2024',
  'SE-556542-5353': 'evidence-pack/arsrapporter/axfood-annual-report-2024',
  'DK-35954716': 'evidence-pack/arsrapporter/salling-group-2024',
  'DK-26259495': 'evidence-pack/arsrapporter/coop-danmark-2024',
  'FI-0110456-8': 'evidence-pack/arsrapporter/kesko-annual-report-2024',
  'IS-670203-2120': 'evidence-pack/arsrapporter/hagar-2024-25',
}

const SHAREHOLDER_ANNUAL_REPORT_URLS: Record<string, string> = {
  '929975200': AUSTEVOLL_ANNUAL_REPORT_2024_URL,
  '964118191': MOWI_ANNUAL_REPORT_2024_URL,
  '960514718': SALMAR_ANNUAL_REPORT_2024_URL,
  '975350940': LEROY_ANNUAL_REPORT_2024_URL,
  '986228608': YARA_ANNUAL_REPORT_2024_URL,
  '910747711': ORKLA_ANNUAL_REPORT_2024_URL,
  '938752648': NORTURA_ANNUAL_REPORT_2024_URL,
  '947942638': TINE_ANNUAL_REPORT_2024_URL,
  '911608103': FELLESKJOPET_ANNUAL_REPORT_2024_URL,
}

const VERIFIED_SHAREHOLDER_SOURCE_LOCATORS: Array<{
  orgNr: string
  nameTokens: string[]
  ownershipPct: number
  locator: string
}> = [
  {
    orgNr: '819731322',
    nameTokens: ['joh', 'johannson'],
    ownershipPct: 74.4,
    locator: `document:${SHAREHOLDER_ANNUAL_REPORT_REFS['819731322']}`,
  },
  {
    orgNr: '936560288',
    nameTokens: ['samvirkelagene'],
    ownershipPct: 100,
    locator: `document:${SHAREHOLDER_ANNUAL_REPORT_REFS['936560288']}`,
  },
  {
    orgNr: '914526647',
    nameTokens: ['reitan'],
    ownershipPct: 100,
    locator: `document:${SHAREHOLDER_ANNUAL_REPORT_REFS['914526647']}`,
  },
  {
    orgNr: 'SE-556048-2837',
    nameTokens: ['ica-handlarnas', 'forbund'],
    ownershipPct: 87,
    locator: `document:${SHAREHOLDER_ANNUAL_REPORT_REFS['SE-556048-2837']}`,
  },
  {
    orgNr: 'SE-556048-2837',
    nameTokens: ['amf', 'pensionsforsakring'],
    ownershipPct: 13,
    locator: `document:${SHAREHOLDER_ANNUAL_REPORT_REFS['SE-556048-2837']}`,
  },
  {
    orgNr: 'SE-556542-5353',
    nameTokens: ['axel', 'johnson'],
    ownershipPct: 50.1,
    locator: `document:${SHAREHOLDER_ANNUAL_REPORT_REFS['SE-556542-5353']}`,
  },
  {
    orgNr: 'SE-556542-5353',
    nameTokens: ['swedbank', 'robur'],
    ownershipPct: 5.2,
    locator: `document:${SHAREHOLDER_ANNUAL_REPORT_REFS['SE-556542-5353']}`,
  },
  {
    orgNr: 'SE-556542-5353',
    nameTokens: ['handelsbanken', 'fonder'],
    ownershipPct: 3.1,
    locator: `document:${SHAREHOLDER_ANNUAL_REPORT_REFS['SE-556542-5353']}`,
  },
  {
    orgNr: 'DK-35954716',
    nameTokens: ['kobmand', 'herman', 'sallings', 'fond'],
    ownershipPct: 100,
    locator: `document:${SHAREHOLDER_ANNUAL_REPORT_REFS['DK-35954716']}`,
  },
  {
    orgNr: 'DK-26259495',
    nameTokens: ['coop', 'amba'],
    ownershipPct: 100,
    locator: `document:${SHAREHOLDER_ANNUAL_REPORT_REFS['DK-26259495']}`,
  },
  {
    orgNr: 'FI-0110456-8',
    nameTokens: ['k-kauppiasliitto'],
    ownershipPct: 7.5,
    locator: `document:${SHAREHOLDER_ANNUAL_REPORT_REFS['FI-0110456-8']}`,
  },
  {
    orgNr: 'FI-0110456-8',
    nameTokens: ['ilmarinen'],
    ownershipPct: 3.8,
    locator: `document:${SHAREHOLDER_ANNUAL_REPORT_REFS['FI-0110456-8']}`,
  },
  {
    orgNr: 'FI-0110456-8',
    nameTokens: ['varma'],
    ownershipPct: 2.5,
    locator: `document:${SHAREHOLDER_ANNUAL_REPORT_REFS['FI-0110456-8']}`,
  },
  {
    orgNr: 'IS-670203-2120',
    nameTokens: ['fjarfesting'],
    ownershipPct: 29.9,
    locator: `document:${SHAREHOLDER_ANNUAL_REPORT_REFS['IS-670203-2120']}`,
  },
  {
    orgNr: 'IS-670203-2120',
    nameTokens: ['lifeyrissjodur', 'verzlunarmanna'],
    ownershipPct: 12,
    locator: `document:${SHAREHOLDER_ANNUAL_REPORT_REFS['IS-670203-2120']}`,
  },
  {
    orgNr: '929975200',
    nameTokens: ['laco'],
    ownershipPct: 52.7,
    locator: SHAREHOLDER_ANNUAL_REPORT_URLS['929975200'],
  },
  {
    orgNr: '964118191',
    nameTokens: ['john', 'fredriksen'],
    ownershipPct: 14.4,
    locator: SHAREHOLDER_ANNUAL_REPORT_URLS['964118191'],
  },
  {
    orgNr: '960514718',
    nameTokens: ['gustav', 'witzoe'],
    ownershipPct: 41.3,
    locator: SHAREHOLDER_ANNUAL_REPORT_URLS['960514718'],
  },
  {
    orgNr: '975350940',
    nameTokens: ['austevoll', 'seafood'],
    ownershipPct: 52.7,
    locator: SHAREHOLDER_ANNUAL_REPORT_URLS['975350940'],
  },
  {
    orgNr: '986228608',
    nameTokens: ['den', 'norske', 'stat'],
    ownershipPct: 36.2,
    locator: SHAREHOLDER_ANNUAL_REPORT_URLS['986228608'],
  },
  {
    orgNr: '910747711',
    nameTokens: ['stein', 'erik', 'hagen'],
    ownershipPct: 25.1,
    locator: SHAREHOLDER_ANNUAL_REPORT_URLS['910747711'],
  },
  {
    orgNr: '938752648',
    nameTokens: ['17', '000', 'bonder'],
    ownershipPct: 100,
    locator: SHAREHOLDER_ANNUAL_REPORT_URLS['938752648'],
  },
  {
    orgNr: '947942638',
    nameTokens: ['8', '600', 'melkebonder'],
    ownershipPct: 100,
    locator: SHAREHOLDER_ANNUAL_REPORT_URLS['947942638'],
  },
  {
    orgNr: '911608103',
    nameTokens: ['42', '000', 'bondemedlemmer'],
    ownershipPct: 100,
    locator: SHAREHOLDER_ANNUAL_REPORT_URLS['911608103'],
  },
  {
    orgNr: '914224314',
    nameTokens: ['norgesgruppen'],
    ownershipPct: 46,
    locator: BAMA_ANNUAL_REPORT_2024_URL,
  },
  {
    orgNr: '914224314',
    nameTokens: ['as', 'banan'],
    ownershipPct: 34,
    locator: BAMA_ANNUAL_REPORT_2024_URL,
  },
  {
    orgNr: '914224314',
    nameTokens: ['rema', 'industrier'],
    ownershipPct: 20,
    locator: BAMA_ANNUAL_REPORT_2024_URL,
  },
  {
    orgNr: '929228723',
    nameTokens: ['norgesgruppen'],
    ownershipPct: 100,
    locator: `document:${SHAREHOLDER_ANNUAL_REPORT_REFS['819731322']}`,
  },
  {
    orgNr: 'SE-556448-4498',
    nameTokens: ['axfood'],
    ownershipPct: 100,
    locator: AXFOOD_CITY_GROSS_APPROVAL_URL,
  },
  {
    orgNr: '961056268',
    nameTokens: ['mowi'],
    ownershipPct: 95,
    locator: MOWI_NOVA_SEA_GLOBENEWSWIRE_URL,
  },
  {
    orgNr: '952587687',
    nameTokens: ['salmar'],
    ownershipPct: 100,
    locator: SALMAR_NTS_SETTLEMENT_URL,
  },
  {
    orgNr: '911161419',
    nameTokens: ['orkla'],
    ownershipPct: 60,
    locator: ORKLA_OFI_RHONE_COMPLETION_URL,
  },
  {
    orgNr: '911161419',
    nameTokens: ['rhone', 'capital'],
    ownershipPct: 40,
    locator: ORKLA_OFI_RHONE_COMPLETION_URL,
  },
  {
    orgNr: '925745855',
    nameTokens: ['solenis'],
    ownershipPct: 100,
    locator: ORKLA_LILLEBORG_SALE_URL,
  },
]

const COUNTRY_METRIC_SOURCE_LABEL_LOCATORS: Record<string, string> = {
  'SSB 08801 partner refetch': SSB_EXTERNAL_TRADE_08801_API,
  'SCB ImpTotalKNAr partner refetch': SCB_IMPORTS_EXPORTS_CN_API,
  'StatBank SITC2R4 partner refetch': STATBANK_SITC2R4_TABLEINFO_API,
  'Statistics Iceland UTA06201 partner extract': STATISTICS_ICELAND_UTA06201_API,
  'Konkurransetilsynet 2025':
    'https://konkurransetilsynet.no/wp-content/uploads/2025/04/Konkurransetilsynets-Dagligvarerapport-2024-25.pdf',
  'Konkurrence- og Forbrugerstyrelsen 2025':
    'https://kfst.dk/konkurrenceforhold/afgoerelser/afgoerelser-paa-konkurrenceomraadet/raads-og-styrelsesafgoerelser/2025/20250326-salling-group-dele-af-coop-danmark',
  'Konkurrensverket 2025':
    'https://www.konkurrensverket.se/konkurrens/samlad-kunskap-om-konkurrens/genomlysning-av-livsmedelsbranschen/',
}

function bronnoysundSubunitUrl(orgNr: string): string {
  return `${BRREG_ENHETSREGISTERET_API}/underenheter?overordnetEnhet=${encodeURIComponent(orgNr)}`
}

const OFFICIAL_COMPANY_PROPERTY_LOCATORS: Array<{
  orgNr: string
  sourceTokens: string[]
  url: string
}> = [
  {
    orgNr: 'DK-35954716',
    sourceTokens: ['sallinggroup.com', 'hovedkontor'],
    url: SALLING_GROUP_CONTACT_URL,
  },
  {
    orgNr: 'DK-26259495',
    sourceTokens: ['coop.dk', 'hovedkontor'],
    url: COOP_DANMARK_CONTACT_URL,
  },
  {
    orgNr: 'DK-14705627',
    sourceTokens: ['rema1000.dk', 'hovedkontor'],
    url: REMA1000_DANMARK_CONTACT_URL,
  },
  {
    orgNr: 'DK-38714295',
    sourceTokens: ['dagrofa.dk', 'hovedkontor'],
    url: DAGROFA_CONTACT_URL,
  },
  {
    orgNr: 'FI-0116323-9',
    sourceTokens: ['s-ryhma.fi', 'paakonttori'],
    url: S_GROUP_PARTNER_SUPPLIER_REGISTER_URL,
  },
  {
    orgNr: 'IS-670203-2120',
    sourceTokens: ['hagar.is'],
    url: HAGAR_ABOUT_URL,
  },
  {
    orgNr: 'IS-540206-2010',
    sourceTokens: ['festi.is'],
    url: FESTI_HOME_URL,
  },
  {
    orgNr: '914224314',
    sourceTokens: ['bama.no', 'liertoppen'],
    url: BAMA_ANNUAL_REPORT_2024_URL,
  },
  {
    orgNr: '929228723',
    sourceTokens: ['asko.no', 'sentrallager'],
    url: ASKO_SENTRALLAGER_TRANSPORT_URL,
  },
  {
    orgNr: '929228723',
    sourceTokens: ['asko.no', 'asko ost)'],
    url: ASKO_OST_URL,
  },
  {
    orgNr: '929228723',
    sourceTokens: ['asko.no', 'asko vest)'],
    url: ASKO_VEST_URL,
  },
  {
    orgNr: '929228723',
    sourceTokens: ['asko.no', 'asko midt-norge)'],
    url: ASKO_MIDT_NORGE_URL,
  },
  {
    orgNr: '929228723',
    sourceTokens: ['asko.no', 'asko hedmark)'],
    url: ASKO_HEDMARK_URL,
  },
  {
    orgNr: '929228723',
    sourceTokens: ['asko.no', 'asko oslofjord)'],
    url: ASKO_OSLOFJORD_URL,
  },
  {
    orgNr: '929228723',
    sourceTokens: ['asko.no', 'asko nord)'],
    url: ASKO_NORD_URL,
  },
  {
    orgNr: '929228723',
    sourceTokens: ['asko.no', 'asko rogaland)'],
    url: ASKO_ROGALAND_URL,
  },
  {
    orgNr: '929228723',
    sourceTokens: ['asko.no', 'asko sor)'],
    url: ASKO_AGDER_URL,
  },
  {
    orgNr: '929228723',
    sourceTokens: ['asko.no', 'asko molde)'],
    url: ASKO_MOLDE_URL,
  },
  {
    orgNr: '911608103',
    sourceTokens: ['felleskjopet.no', 'kambo'],
    url: bronnoysundSubunitUrl('911608103'),
  },
  {
    orgNr: '911608103',
    sourceTokens: ['felleskjopet.no', 'steinkjer'],
    url: bronnoysundSubunitUrl('911608103'),
  },
  {
    orgNr: '911608103',
    sourceTokens: ['felleskjopet.no', 'vaksdal'],
    url: bronnoysundSubunitUrl('911608103'),
  },
  {
    orgNr: '937843860',
    sourceTokens: ['biomar.com', 'avaldsnes'],
    url: bronnoysundSubunitUrl('937843860'),
  },
  {
    orgNr: '937843860',
    sourceTokens: ['biomar.com', 'myre'],
    url: bronnoysundSubunitUrl('937843860'),
  },
  {
    orgNr: '937070632',
    sourceTokens: ['grilstad.no', 'brumunddal'],
    url: bronnoysundSubunitUrl('937070632'),
  },
  {
    orgNr: '937070632',
    sourceTokens: ['grilstad.no', 'ranheim'],
    url: bronnoysundSubunitUrl('937070632'),
  },
  {
    orgNr: '937070632',
    sourceTokens: ['grilstad.no', 'stavanger'],
    url: bronnoysundSubunitUrl('937070632'),
  },
  {
    orgNr: '937070632',
    sourceTokens: ['grilstad.no', 'stranda'],
    url: bronnoysundSubunitUrl('937070632'),
  },
  {
    orgNr: '980411133',
    sourceTokens: ['proff.no', 'orkanger'],
    url: bronnoysundSubunitUrl('980411133'),
  },
  {
    orgNr: '980411133',
    sourceTokens: ['proff.no', 'storen'],
    url: bronnoysundSubunitUrl('980411133'),
  },
  {
    orgNr: '894759372',
    sourceTokens: ['proff.no', 'distribunal', 'bergen'],
    url: bronnoysundSubunitUrl('894759372'),
  },
  {
    orgNr: '894759372',
    sourceTokens: ['proff.no', 'distribunal', 'ostlandet'],
    url: bronnoysundSubunitUrl('894759372'),
  },
  {
    orgNr: '894759372',
    sourceTokens: ['proff.no', 'distribunal', 'stavanger'],
    url: bronnoysundSubunitUrl('894759372'),
  },
  {
    orgNr: '894759372',
    sourceTokens: ['proff.no', 'distribunal', 'trondheim'],
    url: bronnoysundSubunitUrl('894759372'),
  },
  {
    orgNr: '910629085',
    sourceTokens: ['proff.no', 'moss'],
    url: bronnoysundSubunitUrl('910629085'),
  },
  {
    orgNr: '910629085',
    sourceTokens: ['proff.no', 'oslo'],
    url: bronnoysundSubunitUrl('910629085'),
  },
]

function isLandbruksdirektoratet(source: string | null | undefined): boolean {
  return source?.trim() === 'Landbruksdirektoratet'
}

function isFiskeridirektoratetPubAqua(source: string | null | undefined): boolean {
  return source?.trim() === 'Fiskeridirektoratet pub-aqua'
}

function isFiskeridirektoratetAquaPortal(source: string | null | undefined): boolean {
  return source?.trim() === 'Fiskeridirektoratet aqua-portal'
}

function normalizeSourceText(source: string): string {
  return source
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ø/g, 'o')
    .replace(/æ/g, 'ae')
    .replace(/ð/g, 'd')
    .replace(/þ/g, 'th')
}

function looksLikeAnnualReportSource(source: string | null | undefined): boolean {
  if (!source?.trim()) return false

  const normalized = normalizeSourceText(source)
  return [
    'rapport',
    'report',
    'arsresultat',
    'arsredovisning',
    'arsreikningur',
    'tilinpaatos',
    'vuosikertomus',
  ].some((token) => normalized.includes(token))
}

function isNorwegianOrgNumber(orgNr: string): boolean {
  return /^\d{9}$/.test(orgNr)
}

function isBronnoysundSource(source: string | null | undefined): boolean {
  if (!source?.trim()) return false
  return normalizeSourceText(source).includes('bronnoysund')
}

function isBronnoysundSubunitSource(source: string | null | undefined): boolean {
  if (!source?.trim()) return false
  return isBronnoysundSource(source) && normalizeSourceText(source).includes('underenhet')
}

function yearFromSource(source: string | null | undefined): number | null {
  const match = source?.match(/\b(20\d{2})\b/)
  return match ? Number(match[1]) : null
}

function annualReportDocumentRefForOrgYear(
  orgNr: string | null | undefined,
  year: number | null,
): string | null {
  const normalizedOrgNr = orgNr?.trim()
  if (!normalizedOrgNr || !year) return null
  return COMPANY_FINANCIAL_ANNUAL_REPORT_REFS[`${normalizedOrgNr}:${year}`] ?? null
}

function officialCompanyFinancialResultUrlForRow(row: CompanyFinancialSourceRow): string | null {
  const orgNr = row.company?.orgNr?.trim()
  const source = row.source?.trim()
  if (!orgNr || !row.year || !source) return null

  const normalized = normalizeSourceText(source)
  const locator = COMPANY_FINANCIAL_OFFICIAL_RESULT_LOCATORS.find((candidate) => {
    return (
      candidate.orgNr === orgNr &&
      candidate.year === row.year &&
      candidate.sourceTokens.every((token) => normalized.includes(token))
    )
  })

  return locator?.url ?? null
}

function numberFromOwnershipPct(
  ownershipPct: ShareholderSourceRow['ownershipPct'],
): number | null {
  if (ownershipPct === null || ownershipPct === undefined) return null
  if (typeof ownershipPct === 'number') return ownershipPct
  const parsed = Number(ownershipPct.toString())
  return Number.isFinite(parsed) ? parsed : null
}

function locatorRequiresDocumentRef(locator: string): string | null {
  return locator.startsWith('document:') ? locator.slice('document:'.length) : null
}

function documentRefIsAvailable(locator: string, documentRefs: DocumentRefSet): boolean {
  const documentRef = locatorRequiresDocumentRef(locator)
  return !documentRef || documentRefs.has(documentRef)
}

export function productionSubsidyDatasetUrl(year: number): string {
  return `${LANDDIR_OPEN_DATA_RAW}/produksjon-og-avlosertilskudd/${year}/dataset.csv`
}

export function deliveryVolumeDatasetUrl(commodity: string, year: number): string | null {
  if (commodity === 'melk-ku' || commodity === 'melk-geit') {
    return `${LANDDIR_OPEN_DATA_RAW}/leveransedata-melk/${year}/dataset.csv`
  }

  if (commodity === 'egg') {
    return `${LANDDIR_OPEN_DATA_RAW}/leveransedata-egg/${year}/dataset.csv`
  }

  if (commodity.startsWith('korn-') || commodity === 'oljefro') {
    return `${LANDDIR_OPEN_DATA_RAW}/leveransedata-korn/${year}-${year + 1}/dataset.csv`
  }

  if (commodity.startsWith('slakt-') || commodity === 'ull') {
    return `${LANDDIR_OPEN_DATA_RAW}/leveransedata-slakt/${year}/dataset.csv`
  }

  return null
}

export function resolveSubsidySourceLocator(row: SubsidySourceRow): string | null {
  if (!isLandbruksdirektoratet(row.source)) return null
  if (row.subsidyType !== 'produksjonstilskudd') return null
  if (!row.year) return null

  return productionSubsidyDatasetUrl(row.year)
}

export function resolveDeliveryVolumeSourceLocator(row: DeliveryVolumeSourceRow): string | null {
  if (!isLandbruksdirektoratet(row.source)) return null
  if (!row.commodity || !row.year) return null

  return deliveryVolumeDatasetUrl(row.commodity, row.year)
}

export function resolveAquacultureSiteSourceLocator(row: AquacultureSiteSourceRow): string | null {
  if (!isFiskeridirektoratetPubAqua(row.source)) return null
  if (!row.localityNumber) return null

  return `${FISKERIDIR_PUB_AQUA_API}/sites/${encodeURIComponent(row.localityNumber)}`
}

export function resolveAquacultureApplicationSourceLocator(
  row: AquacultureApplicationSourceRow,
): string | null {
  if (!isFiskeridirektoratetAquaPortal(row.source)) return null
  if (!row.applicantOrgNr) return null

  return (
    `${FISKERIDIR_AQUA_PORTAL_API}/applications?` +
    `applicantOrganisationNumber=${encodeURIComponent(row.applicantOrgNr)}` +
    '&page=0&size=50&sort=createdAt,desc'
  )
}

export function resolveCountryMetricSourceLocator(
  row: CountryMetricSourceRow,
  reportSourceUrlById: ReportSourceUrlMap,
): string | null {
  const metadata = row.metadata
  if (metadata && typeof metadata === 'object' && !Array.isArray(metadata)) {
    const sourceUrl = (metadata as Record<string, unknown>).sourceUrl
    if (typeof sourceUrl === 'string' && sourceUrl.trim()) return sourceUrl.trim()

    const reportId = (metadata as Record<string, unknown>).reportId
    if (typeof reportId === 'string' && reportId.trim()) {
      const sourceUrl = reportSourceUrlById.get(reportId)?.trim()
      if (sourceUrl) return sourceUrl
    }
  }

  const source = row.source?.trim()
  return source ? (COUNTRY_METRIC_SOURCE_LABEL_LOCATORS[source] ?? null) : null
}

export function resolveCompanyFinancialSourceLocator(
  row: CompanyFinancialSourceRow,
  documentRefs: DocumentRefSet,
): string | null {
  const orgNr = row.company?.orgNr?.trim()
  if (!orgNr || !row.year) return null

  const officialResultsUrl = officialCompanyFinancialResultUrlForRow(row)
  if (officialResultsUrl) return officialResultsUrl

  if (!looksLikeAnnualReportSource(row.source)) return null

  const documentRef = annualReportDocumentRefForOrgYear(orgNr, row.year)
  if (documentRef && documentRefs.has(documentRef)) return `document:${documentRef}`

  return COMPANY_FINANCIAL_ANNUAL_REPORT_URLS[`${orgNr}:${row.year}`] ?? null
}

export function resolveCompanyOwnershipSourceLocator(
  row: CompanyOwnershipSourceRow,
  documentRefs: DocumentRefSet,
): string | null {
  const source = row.source?.trim()
  if (!source) return null

  const normalized = normalizeSourceText(source)

  if (looksLikeAnnualReportSource(source)) {
    const year = yearFromSource(source)
    const orgCandidates = [row.parentCompany?.orgNr, row.childCompany?.orgNr]

    for (const orgNr of orgCandidates) {
      const documentRef = annualReportDocumentRefForOrgYear(orgNr, year)
      if (documentRef && documentRefs.has(documentRef)) {
        return `document:${documentRef}`
      }
    }

    if (normalized.includes('austevoll') && year === 2024) {
      return AUSTEVOLL_ANNUAL_REPORT_2024_URL
    }
  }

  if (normalized.includes('axfood') && normalized.includes('pressrelease')) {
    return AXFOOD_CITY_GROSS_APPROVAL_URL
  }

  if (normalized.includes('mowi') && (normalized.includes('globenewswire') || normalized.includes('borsmeld'))) {
    return MOWI_NOVA_SEA_GLOBENEWSWIRE_URL
  }

  if (normalized.includes('salmar') && normalized.includes('borsmeld')) {
    return SALMAR_NTS_SETTLEMENT_URL
  }

  if (normalized.includes('orkla') && normalized.includes('2024-04-17')) {
    return ORKLA_OFI_RHONE_COMPLETION_URL
  }

  if (normalized.includes('orkla') && normalized.includes('2024-06')) {
    return ORKLA_LILLEBORG_SALE_URL
  }

  if (
    normalized.includes('bronnoysund') &&
    row.parentCompany?.orgNr === '819731322' &&
    row.childCompany?.orgNr === '929228723'
  ) {
    const documentRef = SHAREHOLDER_ANNUAL_REPORT_REFS['819731322']
    if (documentRefs.has(documentRef)) return `document:${documentRef}`
  }

  if (
    normalized.includes('bronnoysund') &&
    normalized.includes('arsrapport') &&
    row.parentCompany?.orgNr === '819731322' &&
    row.childCompany?.orgNr === '914224314'
  ) {
    return BAMA_ANNUAL_REPORT_2024_URL
  }

  if (
    normalized.includes('norgesgruppen') &&
    normalized.includes('dagrofa') &&
    row.parentCompany?.orgNr === '819731322' &&
    row.childCompany?.orgNr === 'DK-38714295'
  ) {
    const documentRef = SHAREHOLDER_ANNUAL_REPORT_REFS['819731322']
    if (documentRefs.has(documentRef)) return `document:${documentRef}`
  }

  return null
}

export function resolveShareholderSourceLocator(
  row: ShareholderSourceRow,
  documentRefs: DocumentRefSet,
): string | null {
  const orgNr = row.company?.orgNr?.trim()
  const name = row.name?.trim()
  const ownershipPct = numberFromOwnershipPct(row.ownershipPct)
  if (!orgNr || !name || ownershipPct === null) return null

  const normalizedName = normalizeSourceText(name)
  const locator = VERIFIED_SHAREHOLDER_SOURCE_LOCATORS.find((candidate) => {
    return (
      candidate.orgNr === orgNr &&
      Math.abs(candidate.ownershipPct - ownershipPct) < 0.01 &&
      candidate.nameTokens.every((token) => normalizedName.includes(token))
    )
  })

  if (!locator) return null
  return documentRefIsAvailable(locator.locator, documentRefs) ? locator.locator : null
}

export function resolveCompanyPropertySourceLocator(row: CompanyPropertySourceRow): string | null {
  const orgNr = row.company?.orgNr?.trim()
  const source = row.source?.trim()
  if (!source) return null

  if (orgNr && isNorwegianOrgNumber(orgNr) && isBronnoysundSource(source)) {
    if (isBronnoysundSubunitSource(source)) {
      return bronnoysundSubunitUrl(orgNr)
    }

    return `${BRREG_ENHETSREGISTERET_API}/enheter/${encodeURIComponent(orgNr)}`
  }

  const normalized = normalizeSourceText(source)

  if (normalized.includes('mowi.com')) {
    if (normalized.includes('hovedkontor bergen')) return MOWI_CONTACT_URL

    if (
      normalized.includes('eggesbones') ||
      normalized.includes('ulvan') ||
      normalized.includes('ryfisk')
    ) {
      return MOWI_CERTIFICATION_TABLE_2023_URL
    }
  }

  if (
    normalized.includes('salmar.no') &&
    (normalized.includes('innovamar') || normalized.includes('vikenco'))
  ) {
    return SALMAR_OPERATING_AREAS_URL
  }

  if (
    normalized.includes('skretting.com') &&
    (normalized.includes('averoy') ||
      normalized.includes('stavanger') ||
      normalized.includes('stokmarknes'))
  ) {
    return SKRETTING_CONTACT_URL
  }

  if (normalized.includes('yara.com')) {
    if (normalized.includes('global headquarters')) return YARA_CONTACT_URL
    if (normalized.includes('porsgrunn')) return YARA_NORWAY_OPERATIONS_URL
  }

  if (orgNr) {
    const officialLocator = OFFICIAL_COMPANY_PROPERTY_LOCATORS.find((locator) => {
      return (
        locator.orgNr === orgNr &&
        locator.sourceTokens.every((token) => normalized.includes(token))
      )
    })
    if (officialLocator) return officialLocator.url
  }

  return null
}

export function resolveBusinessRelationshipSourceLocator(
  row: BusinessRelationshipSourceRow,
  documentRefs: DocumentRefSet,
  reportSourceUrlById: ReportSourceUrlMap,
): string | null {
  const source = row.source?.trim()
  if (!source) return null

  if (looksLikeAnnualReportSource(source)) {
    const year = yearFromSource(source)
    const orgCandidates = [row.fromCompany?.orgNr, row.toCompany?.orgNr]

    for (const orgNr of orgCandidates) {
      const documentRef = annualReportDocumentRefForOrgYear(orgNr, year)
      if (documentRef && documentRefs.has(documentRef)) {
        return `document:${documentRef}`
      }
    }
  }

  const normalized = normalizeSourceText(source)
  if (normalized.includes('matsentralen') && looksLikeAnnualReportSource(source)) {
    return MATSENTRALEN_ANNUAL_REPORT_URL
  }

  if (normalized.includes('bransjeavtalen')) {
    return BRANSJEAVTALEN_MAIN_REPORT_URL
  }

  if (normalized.includes('konkurrensverket') && normalized.includes('2024:5')) {
    return reportSourceUrlById.get('se-konkurrensverket-2024-5')?.trim() || null
  }

  if (normalized.includes('kfst') && normalized.includes('2025')) {
    return reportSourceUrlById.get('dk-salling-coop-decision-2025')?.trim() || null
  }

  return null
}
