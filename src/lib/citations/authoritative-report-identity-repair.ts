import { createHash } from 'node:crypto'

export const AUTHORITATIVE_REPORT_IDENTITY_IDS = [
  'konkurransetilsynet-dagligvare-2025',
  'konkurrensverket-etablering-2026',
  'konkurrensverket-lonsamhet-2025',
  'livsmedelsforetagen-resiliens-2025',
  'livsmedelsverket-skolor-2025',
  'luke-food-waste-diary-2025',
  'miljostyrelsen-madspild-2025',
] as const

export const AUTHORITATIVE_LINKED_DOCUMENT_REPORT_IDS = [
  'konkurransetilsynet-dagligvare-2025',
  'livsmedelsforetagen-resiliens-2025',
  'livsmedelsverket-skolor-2025',
  'luke-food-waste-diary-2025',
  'miljostyrelsen-madspild-2025',
] as const

export const AUTHORITATIVE_REPORT_PORTABLE_FIELDS = [
  'title',
  'fullTitle',
  'author',
  'institution',
  'date',
  'year',
  'sourceUrl',
  'reportCategory',
  'country',
  'keyFindings',
  'recommendations',
  'relevance',
  'tags',
  'doi',
  'isbn',
  'issn',
  'publisher',
  'provenanceType',
  'supportingSources',
  'accessedAt',
] as const

export const AUTHORITATIVE_REPORT_MUTATED_FIELDS = [
  'title',
  'fullTitle',
  'author',
  'institution',
  'date',
  'sourceUrl',
  'reportCategory',
  'doi',
  'isbn',
  'issn',
  'publisher',
  'provenanceType',
  'supportingSources',
  'accessedAt',
] as const

export const AUTHORITATIVE_DOCUMENT_PORTABLE_FIELDS = [
  'slug',
  'filePath',
  'title',
  'author',
  'year',
  'documentType',
  'category',
  'subcategory',
  'country',
  'contentSha256',
  'summary',
  'url',
  'accessedAt',
  'archivedUrl',
  'wordCount',
  'tags',
  'metadata',
] as const

export const AUTHORITATIVE_DOCUMENT_MUTATED_FIELDS = [
  'title',
  'author',
  'documentType',
  'contentSha256',
  'url',
  'accessedAt',
  'wordCount',
  'metadata',
] as const

export type AuthoritativeReportIdentityId =
  (typeof AUTHORITATIVE_REPORT_IDENTITY_IDS)[number]
export type AuthoritativeLinkedDocumentReportId =
  (typeof AUTHORITATIVE_LINKED_DOCUMENT_REPORT_IDS)[number]
export type AuthoritativeReportPortableField =
  (typeof AUTHORITATIVE_REPORT_PORTABLE_FIELDS)[number]
export type AuthoritativeReportMutatedField =
  (typeof AUTHORITATIVE_REPORT_MUTATED_FIELDS)[number]
export type AuthoritativeDocumentPortableField =
  (typeof AUTHORITATIVE_DOCUMENT_PORTABLE_FIELDS)[number]
export type AuthoritativeDocumentMutatedField =
  (typeof AUTHORITATIVE_DOCUMENT_MUTATED_FIELDS)[number]

export type CanonicalJsonValue =
  | null
  | boolean
  | number
  | string
  | CanonicalJsonValue[]
  | { [key: string]: CanonicalJsonValue }

export type AuthoritativeReportSeedInput = {
  id: string
  title: string
  fullTitle?: string | null
  author?: string | null
  institution?: string | null
  date?: string | null
  year?: number | null
  sourceUrl?: string | null
  reportCategory: string
  country?: string | null
  keyFindings: string[]
  recommendations: string[]
  relevance: string
  tags: string[]
  doi?: string | null
  isbn?: string | null
  issn?: string | null
  publisher?: string | null
  provenanceType?: string | null
  supportingSources?: unknown
  accessedAt?: Date | string | null
}

export type AuthoritativeReportPortableSnapshot = {
  id: AuthoritativeReportIdentityId
  title: string
  fullTitle: string | null
  author: string | null
  institution: string | null
  date: string | null
  year: number | null
  sourceUrl: string | null
  reportCategory: string
  country: string
  keyFindings: string[]
  recommendations: string[]
  relevance: string
  tags: string[]
  doi: string | null
  isbn: string | null
  issn: string | null
  publisher: string | null
  provenanceType: string | null
  supportingSources: CanonicalJsonValue
  accessedAt: string | null
}

export type AuthoritativeReportDatabaseSnapshot = Omit<
  AuthoritativeReportPortableSnapshot,
  'id' | 'supportingSources' | 'accessedAt'
> & {
  id: string
  supportingSources: unknown
  accessedAt: Date | string | null
  documentId: string | null
}

export type AuthoritativeReportFullSnapshot = AuthoritativeReportPortableSnapshot & {
  documentId: string | null
}

export type AuthoritativeDocumentPortableSnapshot = {
  reportId: AuthoritativeLinkedDocumentReportId
  slug: string
  filePath: string | null
  title: string
  author: string | null
  year: number | null
  documentType: string | null
  category: string | null
  subcategory: string | null
  country: string | null
  contentSha256: string
  summary: string | null
  url: string | null
  accessedAt: string | null
  archivedUrl: string | null
  wordCount: number
  tags: string[]
  metadata: CanonicalJsonValue
}

export type AuthoritativeDocumentDatabaseSnapshot = Omit<
  AuthoritativeDocumentPortableSnapshot,
  'reportId' | 'contentSha256' | 'metadata' | 'accessedAt'
> & {
  id: string
  reportId: string
  content: string
  metadata: unknown
  accessedAt: Date | string | null
  createdAt: Date | string
  updatedAt: Date | string
}

export type AuthoritativeDocumentFullSnapshot = AuthoritativeDocumentPortableSnapshot & {
  id: string
  createdAt: string
  updatedAt: string
}

export type AuthoritativePortableTarget = {
  id: AuthoritativeReportIdentityId
  sourceNature:
    | 'official_primary'
    | 'advocacy_position'
    | 'peer_reviewed'
    | 'commissioned_report'
  before: AuthoritativeReportPortableSnapshot
  after: AuthoritativeReportPortableSnapshot
  beforePortableSha256: string
  afterPortableSha256: string
  changedFields: AuthoritativeReportMutatedField[]
}

export type AuthoritativeDocumentPortableTarget = {
  reportId: AuthoritativeLinkedDocumentReportId
  before: AuthoritativeDocumentPortableSnapshot
  after: AuthoritativeDocumentPortableSnapshot
  beforePortableSha256: string
  afterPortableSha256: string
  changedFields: AuthoritativeDocumentMutatedField[]
}

export type AuthoritativeReportPlannedUpdate = AuthoritativePortableTarget & {
  beforeFull: AuthoritativeReportFullSnapshot
  afterFull: AuthoritativeReportFullSnapshot
  beforeFullRowSha256: string
  afterFullRowSha256: string
}

export type AuthoritativeDocumentPlannedUpdate = AuthoritativeDocumentPortableTarget & {
  beforeFull: AuthoritativeDocumentFullSnapshot
  afterFull: AuthoritativeDocumentFullSnapshot
  beforeFullRowSha256: string
  afterFullRowSha256: string
}

export type AuthoritativeIdentityRepairConflict = {
  entity: 'Report' | 'Document'
  key: string
  code:
    | 'missing_row'
    | 'duplicate_snapshot'
    | 'unexpected_full_row_snapshot'
    | 'unexpected_document_link'
  changedFields: string[]
  detail: string
  currentRowSha256: string | null
}

export type AuthoritativeIdentityObservedState = {
  entity: 'Report' | 'Document'
  key: string
  state: 'pending' | 'already_applied' | 'conflict'
  rowId: string | null
  currentFullRowSha256: string | null
}

export type AuthoritativeReportIdentityRepairPlan = {
  version: 1
  targetManifestSha256: string
  preservedDependencyStateSha256: string
  reportUpdates: AuthoritativeReportPlannedUpdate[]
  documentUpdates: AuthoritativeDocumentPlannedUpdate[]
  alreadyAppliedReportIds: AuthoritativeReportIdentityId[]
  alreadyAppliedDocumentReportIds: AuthoritativeLinkedDocumentReportId[]
  observed: AuthoritativeIdentityObservedState[]
  conflicts: AuthoritativeIdentityRepairConflict[]
  summary: {
    totalReports: number
    totalDocuments: number
    pendingReportUpdates: number
    pendingDocumentUpdates: number
    alreadyAppliedReports: number
    alreadyAppliedDocuments: number
    conflicts: number
  }
}

export const AUTHORITATIVE_REPORT_SOURCE_NATURE: Readonly<Record<
  AuthoritativeReportIdentityId,
  AuthoritativePortableTarget['sourceNature']
>> = {
  'konkurransetilsynet-dagligvare-2025': 'official_primary',
  'konkurrensverket-etablering-2026': 'official_primary',
  'konkurrensverket-lonsamhet-2025': 'official_primary',
  'livsmedelsforetagen-resiliens-2025': 'advocacy_position',
  'livsmedelsverket-skolor-2025': 'official_primary',
  'luke-food-waste-diary-2025': 'peer_reviewed',
  'miljostyrelsen-madspild-2025': 'commissioned_report',
}

type IdentitySnapshot = Pick<
  AuthoritativeReportPortableSnapshot,
  | 'title'
  | 'fullTitle'
  | 'author'
  | 'institution'
  | 'date'
  | 'year'
  | 'sourceUrl'
  | 'reportCategory'
  | 'country'
  | 'doi'
  | 'isbn'
  | 'issn'
  | 'publisher'
  | 'provenanceType'
  | 'supportingSources'
  | 'accessedAt'
>

const BEFORE_IDENTITY_BY_REPORT_ID: Readonly<Record<
  AuthoritativeReportIdentityId,
  IdentitySnapshot
>> = {
  'konkurransetilsynet-dagligvare-2025': {
    title: 'Dagligvarerapporten 2025',
    fullTitle: 'Konkurransetilsynets Dagligvarerapport 2025',
    author: 'Konkurransetilsynet',
    institution: 'Konkurransetilsynet',
    date: '2026-04-20',
    year: 2026,
    sourceUrl: 'https://konkurransetilsynet.no/dagligvarerapporten-2025/',
    reportCategory: 'offentlig',
    country: 'NO',
    doi: null,
    isbn: null,
    issn: null,
    publisher: 'Konkurransetilsynet',
    provenanceType: null,
    supportingSources: null,
    accessedAt: null,
  },
  'konkurrensverket-etablering-2026': {
    title: 'Etablering av dagligvarubutiker',
    fullTitle: 'Hinder för etablering av dagligvarubutiker (Rapportering april 2026)',
    author: 'Konkurrensverket',
    institution: 'Konkurrensverket',
    date: null,
    year: 2026,
    sourceUrl: 'https://www.konkurrensverket.se/rapporter/etablering-av-dagligvarubutiker/',
    reportCategory: 'offentlig',
    country: 'SE',
    doi: null,
    isbn: null,
    issn: null,
    publisher: 'Konkurrensverket',
    provenanceType: null,
    supportingSources: null,
    accessedAt: null,
  },
  'konkurrensverket-lonsamhet-2025': {
    title: 'Lönsamhet i livsmedelskedjan',
    fullTitle: 'Lönsamhet i livsmedelskedjan (Rapport 2025:3)',
    author: 'Konkurrensverket',
    institution: 'Konkurrensverket',
    date: null,
    year: 2025,
    sourceUrl: 'https://www.konkurrensverket.se/rapporter/lonsamhet-i-livsmedelskedjan/',
    reportCategory: 'offentlig',
    country: 'SE',
    doi: '10.5281/zenodo.kkv.lonsamhet-2025',
    isbn: null,
    issn: null,
    publisher: 'Konkurrensverket',
    provenanceType: null,
    supportingSources: null,
    accessedAt: null,
  },
  'livsmedelsforetagen-resiliens-2025': {
    title: 'Recept för resiliens',
    fullTitle: 'Recept för resiliens – Lönsamhet och robusthet i svensk livsmedelsförsörjning under kris',
    author: 'Livsmedelsföretagen',
    institution: 'Livsmedelsföretagen / MSB',
    date: null,
    year: 2025,
    sourceUrl: 'https://www.livsmedelsforetagen.se/recept-for-resiliens/',
    reportCategory: 'bransje',
    country: 'SE',
    doi: '10.5281/zenodo.lf.resiliens-2025',
    isbn: null,
    issn: null,
    publisher: 'Livsmedelsföretagen',
    provenanceType: null,
    supportingSources: null,
    accessedAt: null,
  },
  'livsmedelsverket-skolor-2025': {
    title: 'Matsvinn i kommunala förskolor och skolor',
    fullTitle: 'Kartläggning av matsvinn i kommunala förskolor och skolor i Sverige (L 2025 nr 07)',
    author: 'Livsmedelsverket Sverige',
    institution: 'Livsmedelsverket Sverige',
    date: null,
    year: 2025,
    sourceUrl: 'https://www.livsmedelsverket.se/om-oss/press/matsvinn-i-skolor/',
    reportCategory: 'offentlig',
    country: 'SE',
    doi: null,
    isbn: null,
    issn: null,
    publisher: 'Livsmedelsverket',
    provenanceType: null,
    supportingSources: null,
    accessedAt: null,
  },
  'luke-food-waste-diary-2025': {
    title: 'Tackling the challenges of food waste diary studies',
    fullTitle: 'Tackling the challenges of food waste diary studies – Testing strategies with Finnish data',
    author: 'Luonnonvarakeskus (Luke)',
    institution: 'Luke (Natural Resources Institute Finland)',
    date: null,
    year: 2025,
    sourceUrl: 'https://www.luke.fi/en/news/tackling-the-challenges-of-food-waste-diary-studies/',
    reportCategory: 'akademia',
    country: 'FI',
    doi: '10.1016/j.wasman.2025.03.012',
    isbn: null,
    issn: null,
    publisher: 'Natural Resources Institute Finland',
    provenanceType: null,
    supportingSources: null,
    accessedAt: null,
  },
  'miljostyrelsen-madspild-2025': {
    title: 'Kortlægning af madaffald og madspild 2023',
    fullTitle: 'Kortlægning af madaffald og madspild i detailhandel og anden fødevaredistribution i Danmark',
    author: 'Miljøstyrelsen Danmark',
    institution: 'Miljøstyrelsen Danmark',
    date: '2025-05-15',
    year: 2025,
    sourceUrl: 'https://mst.dk/service/nyheder/nyhedsarkiv/2025/maj/ny-kortlaegning-af-madaffald/',
    reportCategory: 'offentlig',
    country: 'DK',
    doi: '10.5281/zenodo.mst.madspild-2023',
    isbn: null,
    issn: null,
    publisher: 'Miljøstyrelsen',
    provenanceType: null,
    supportingSources: null,
    accessedAt: null,
  },
}

const DOCUMENT_BEFORE_BY_REPORT_ID: Readonly<Record<
  AuthoritativeLinkedDocumentReportId,
  AuthoritativeDocumentPortableSnapshot
>> = {
  'konkurransetilsynet-dagligvare-2025': {
    reportId: 'konkurransetilsynet-dagligvare-2025',
    slug: 'report-konkurransetilsynet-dagligvare-2025',
    filePath: 'research/report-konkurransetilsynet-dagligvare-2025.md',
    title: 'Dagligvarerapporten 2025',
    author: 'Konkurransetilsynet',
    year: 2026,
    documentType: 'offentlig',
    category: 'bibliotek',
    subcategory: 'reports',
    country: 'NO',
    contentSha256: '49e3b537c855a132fe8f7f2c9eaab653afa6211f918118124a7f403c446568a7',
    summary: 'Ekstremt viktig oppdatering for 2026. Dokumenterer den institusjonelle sammenslåingen av Dagligvaretilsynet og Konkurransetilsynet, samt den empiriske effekten av servitutt-forbudet i det norske markedet.',
    url: 'https://konkurransetilsynet.no/dagligvarerapporten-2025/',
    accessedAt: null,
    archivedUrl: null,
    wordCount: 166,
    tags: ['konkurranse', 'markedskonsentrasjon', 'eiendom', 'regulering', 'handelsskikk', 'prising', 'report', 'offentlig'],
    metadata: {
      generatedFrom: 'prisma/seed-data/reports.ts',
      provenanceType: null,
      reportCategory: 'offentlig',
      reportId: 'konkurransetilsynet-dagligvare-2025',
    },
  },
  'livsmedelsforetagen-resiliens-2025': {
    reportId: 'livsmedelsforetagen-resiliens-2025',
    slug: 'report-livsmedelsforetagen-resiliens-2025',
    filePath: 'research/report-livsmedelsforetagen-resiliens-2025.md',
    title: 'Recept för resiliens',
    author: 'Livsmedelsföretagen',
    year: 2025,
    documentType: 'bransje',
    category: 'bibliotek',
    subcategory: 'reports',
    country: 'SE',
    contentSha256: 'e550c8c945b9a78ffa536dcb8b0ef1dcd8f7f4e826ed8e69c53f296384ee2408',
    summary: 'Brobygger mellom konkurranseforhold og nasjonal beredskap. Understreker at en svekket bondestand direkte truer totalforsvaret, et argument som er høyst overførbart til den norske beredskapsdebatten.',
    url: 'https://www.livsmedelsforetagen.se/recept-for-resiliens/',
    accessedAt: null,
    archivedUrl: null,
    wordCount: 155,
    tags: ['beredskap', 'selvforsyning', 'Sverige', 'logistikk', 'jordbruk', 'report', 'bransje'],
    metadata: {
      generatedFrom: 'prisma/seed-data/reports.ts',
      provenanceType: null,
      reportCategory: 'bransje',
      reportId: 'livsmedelsforetagen-resiliens-2025',
    },
  },
  'livsmedelsverket-skolor-2025': {
    reportId: 'livsmedelsverket-skolor-2025',
    slug: 'report-livsmedelsverket-skolor-2025',
    filePath: 'research/report-livsmedelsverket-skolor-2025.md',
    title: 'Matsvinn i kommunala förskolor och skolor',
    author: 'Livsmedelsverket Sverige',
    year: 2025,
    documentType: 'offentlig',
    category: 'bibliotek',
    subcategory: 'reports',
    country: 'SE',
    contentSha256: 'd34e22e2bd41f1012d75032259a03c00161106a57047b5fc7b196cf725aeceb3',
    summary: 'Svensk referansecase på sirkulære tiltak i offentlig storkjøkkendrift. Gir praktiske tall og strategisk retning for sirkulære matsystemer.',
    url: 'https://www.livsmedelsverket.se/om-oss/press/matsvinn-i-skolor/',
    accessedAt: null,
    archivedUrl: null,
    wordCount: 150,
    tags: ['matsvinn', 'offentlig-innkjop', 'Sverige', 'barnehager', 'skoler', 'handlingsplan', 'report', 'offentlig'],
    metadata: {
      generatedFrom: 'prisma/seed-data/reports.ts',
      provenanceType: null,
      reportCategory: 'offentlig',
      reportId: 'livsmedelsverket-skolor-2025',
    },
  },
  'luke-food-waste-diary-2025': {
    reportId: 'luke-food-waste-diary-2025',
    slug: 'report-luke-food-waste-diary-2025',
    filePath: 'research/report-luke-food-waste-diary-2025.md',
    title: 'Tackling the challenges of food waste diary studies',
    author: 'Luonnonvarakeskus (Luke)',
    year: 2025,
    documentType: 'akademia',
    category: 'bibliotek',
    subcategory: 'reports',
    country: 'FI',
    contentSha256: '2a419bf553d9987ae683e6d2eb40e40f23eb6caa2771d07f573f6997a661acad',
    summary: 'Finsk kjernebidrag innen sirkulær matmetodikk. Nyttig for å forstå målefeil og underrapportering i husholdningssvinn, noe som styrker dataresiliensen i våre egne analyser.',
    url: 'https://www.luke.fi/en/news/tackling-the-challenges-of-food-waste-diary-studies/',
    accessedAt: null,
    archivedUrl: null,
    wordCount: 154,
    tags: ['matsvinn', 'Finland', 'metodikk', 'atferd', 'sirkulaer', 'report', 'akademia'],
    metadata: {
      generatedFrom: 'prisma/seed-data/reports.ts',
      provenanceType: null,
      reportCategory: 'akademia',
      reportId: 'luke-food-waste-diary-2025',
    },
  },
  'miljostyrelsen-madspild-2025': {
    reportId: 'miljostyrelsen-madspild-2025',
    slug: 'report-miljostyrelsen-madspild-2025',
    filePath: 'research/report-miljostyrelsen-madspild-2025.md',
    title: 'Kortlægning af madaffald og madspild 2023',
    author: 'Miljøstyrelsen Danmark',
    year: 2025,
    documentType: 'offentlig',
    category: 'bibliotek',
    subcategory: 'reports',
    country: 'DK',
    contentSha256: '1db9e3e20235e41748158f961b4a1336f9ab868c882fc6b598ee913584061e9c',
    summary: 'Gir det nyeste kvantitative sammenligningsgrunnlaget for dansk dagligvaresvinn, og viser at systematisk arbeid i butikkene gir reelle resultater på tross av forsyningskjede-utfordringer.',
    url: 'https://mst.dk/service/nyheder/nyhedsarkiv/2025/maj/ny-kortlaegning-af-madaffald/',
    accessedAt: null,
    archivedUrl: null,
    wordCount: 173,
    tags: ['matsvinn', 'Danmark', 'detailhandel', 'EU-regulering', 'sirkulaer', 'report', 'offentlig'],
    metadata: {
      generatedFrom: 'prisma/seed-data/reports.ts',
      provenanceType: null,
      reportCategory: 'offentlig',
      reportId: 'miljostyrelsen-madspild-2025',
    },
  },
}

const UNVERIFIED_SYNTHESIS_WARNING =
  '> **Kildebruk:** Identitetsmetadata ble korrigert mot offisiell kilde 2026-07-19. Relevans, hovedfunn og anbefalinger nedenfor er eldre intern syntese som ikke er kildeverifisert eller klar for ekstern sitering.'

export const AUTHORITATIVE_DOCUMENT_AFTER_CONTENT_BY_REPORT_ID: Readonly<Record<
  AuthoritativeLinkedDocumentReportId,
  string
>> = {
  'konkurransetilsynet-dagligvare-2025': [
    '# Dagligvarerapport 2025',
    UNVERIFIED_SYNTHESIS_WARNING,
    '*Full tittel: Konkurransetilsynets Dagligvarerapport 2025*',
    '- **Forfatter:** Konkurransetilsynet',
    '- **Institusjon:** Konkurransetilsynet',
    '- **År:** 2026',
    '- **Dato:** 2026-04-29',
    '- **Kategori:** KONKURRANSETILSYN',
    '- **Utgiver:** Konkurransetilsynet',
    '- **Proveniens:** external_report',
    '- **URL:** https://konkurransetilsynet.no/wp-content/uploads/2026/04/Dagligvarerapport-2025.pdf',
    '## Relevans (Relevance)',
    'Ekstremt viktig oppdatering for 2026. Dokumenterer den institusjonelle sammenslåingen av Dagligvaretilsynet og Konkurransetilsynet, samt den empiriske effekten av servitutt-forbudet i det norske markedet.',
    '## Hovedfunn (Key Findings)',
    '- Klar reduksjon i eksklusive leieavtaler og negative servitutter på eiendom, noe som styrker etableringskonkurransen.',
    '- Det norske markedet forblir sterkt konsentrert mellom de tre store paraplyaktørene (NorgesGruppen, Coop, Rema 1000) med stabile markedsandeler.',
    '- Innkjøpsprisforskjellene er betydelig redusert siden 2017, men NorgesGruppen oppnår fortsatt lavere priser enn konkurrentene.',
    '- Dagligvaretilsynet legges ned pr 30. april 2026, og ansvaret for god handelsskikk overføres to Konkurransetilsynet for å oppnå faglige synergier.',
    '- Det registreres store lokale variasjoner i konkurransetrykk og butikketablering til tross for nasjonal stabilitet.',
    '## Anbefalinger (Recommendations)',
    '- Fortsette disiplinerende tilsyn med eiendommer og leiekontrakter for å forhindre konkurransebegrensning.',
    '- Integrere god handelsskikk-håndhevelse tett med det generelle konkurransepolitiske arbeidet.',
  ].join('\n'),
  'livsmedelsforetagen-resiliens-2025': [
    '# Recept för resiliens',
    UNVERIFIED_SYNTHESIS_WARNING,
    '*Full tittel: Recept för resiliens*',
    '- **Forfatter:** Livsmedelsföretagen',
    '- **Institusjon:** Livsmedelsföretagen',
    '- **År:** 2025',
    '- **Dato:** 2025-03-07',
    '- **Kategori:** BRANSJE',
    '- **Utgiver:** Livsmedelsföretagen',
    '- **Proveniens:** external_report',
    '- **URL:** https://www.livsmedelsforetagen.se/nyheter/recept-for-resiliens-10-atgarder-for-att-starka-sveriges-livsmedelsberedskap/',
    '## Relevans (Relevance)',
    'Brobygger mellom konkurranseforhold og nasjonal beredskap. Understreker at en svekket bondestand direkte truer totalforsvaret, et argument som er høyst overførbart til den norske beredskapsdebatten.',
    '## Hovedfunn (Key Findings)',
    '- Økonomisk lønnsomhet i alle ledd av den innenlandske dagligvarekjeden er selve forutsetningen for robust beredskap under krise.',
    '- Sveriges økte beredskapsbevilgninger (over 1 milliard SEK i 2026) må rettes mot kornlagring, drivstoff og insatsvarer for primærprodusenter.',
    '- Nøkkelen til resiliens ligger i å sikre stabil energitilgang, rent vann og logistikk-redundans for foredlingsleddet under langvarig krise.',
    '## Anbefalinger (Recommendations)',
    '- Etablere strategiske beredskapsavtaler mellom staten og private grossister.',
    '- Styrke den økonomiske lønnsomheten for primærprodusenter for å forhindre gårdsnedleggelser som svekker nasjonal selvforsyning.',
  ].join('\n'),
  'livsmedelsverket-skolor-2025': [
    '# L 2025 nr 07: Matsvinn i kommunala förskolor och skolor – Kartläggning av matsvinnet 2024',
    UNVERIFIED_SYNTHESIS_WARNING,
    '*Full tittel: L 2025 nr 07: Matsvinn i kommunala förskolor och skolor – Kartläggning av matsvinnet 2024*',
    '- **Forfatter:** Karin Fritz och Per Jonsson',
    '- **Institusjon:** Livsmedelsverket',
    '- **År:** 2025',
    '- **Kategori:** OFFENTLIG',
    '- **Utgiver:** Livsmedelsverket',
    '- **ISSN:** 1104-7089',
    '- **Proveniens:** external_report',
    '- **URL:** https://www.livsmedelsverket.se/om-oss/publikationer/artiklar/2025/l-2025-nr-07-matsvinn-i-kommunala-forskolor-och-skolor/',
    '## Relevans (Relevance)',
    'Svensk referansecase på sirkulære tiltak i offentlig storkjøkkendrift. Gir praktiske tall og strategisk retning for sirkulære matsystemer.',
    '## Hovedfunn (Key Findings)',
    '- Kartleggingen viser en svak nedgang i matsvinn per porsjon i offentlige barnehager og skoler fra 2022 til 2024.',
    '- Bruk av mer nøyaktige målemetoder gjør det utfordrende å fastslå en entydig trend grunnet svingninger i deltakende kommuner.',
    '- Lanserer den nye svenske handlingsplanen "Fler gör mer" (2026–2030) for å halvere svinnet innen 2030.',
    '- Offentlige måltider representerer et enormt potensial for systematisk volumreduksjon genom menyplanlegging.',
    '## Anbefalinger (Recommendations)',
    '- Innføre obligatorisk ukentlig måling i alle kommunale kjøkken.',
    '- Integrere svinnreduksjon som fast post i kommunale anbudskrav.',
  ].join('\n'),
  'luke-food-waste-diary-2025': [
    '# Tackling the challenges of food waste diary studies — Testing strategies with Finnish data',
    UNVERIFIED_SYNTHESIS_WARNING,
    '*Full tittel: Tackling the challenges of food waste diary studies — Testing strategies with Finnish data*',
    '- **Forfatter:** Hanna Hartikainen, Joel Kostensalo, Inkeri Riipi',
    '- **Institusjon:** Natural Resources Institute Finland (Luke)',
    '- **År:** 2025',
    '- **Kategori:** AKADEMIA',
    '- **Utgiver:** Elsevier',
    '- **DOI:** 10.1016/j.wasman.2025.114844',
    '- **ISSN:** 0956-053X',
    '- **Proveniens:** external_article',
    '- **URL:** https://jukuri.luke.fi/items/a68528ed-14ce-4a0a-9dcb-1a1d1a777cdf/full',
    '## Relevans (Relevance)',
    'Finsk kjernebidrag innen sirkulær matmetodikk. Nyttig for å forstå målefeil og underrapportering i husholdningssvinn, noe som styrker dataresiliensen i våre egne analyser.',
    '## Hovedfunn (Key Findings)',
    '- Validerer nøyaktigheten av dagbokstudier (diary studies) brukt til å kartlegge matsvinn på befolkningsnivå i Finland.',
    '- Metodiske utfordringer som underrapportering og registrerings-tretthet kan minimeres ved hjelp av målrettede oppfølgingsstrategier.',
    '- Studien danner det tekniske fundamentet for verifisering og måling innen det helsinkiske "Food Waste Ecosystem (2023–2026)".',
    '## Anbefalinger (Recommendations)',
    '- Implementere dynamiske, digitale dagbokgrensesnitt for å øke svarprosenten blant yngre forbrukere.',
    '- Kombinere dagbokstudier med direkte avfallsveiing i utvalgte pilotområder.',
  ].join('\n'),
  'miljostyrelsen-madspild-2025': [
    '# Madaffald i detailhandel og anden fødevaredistribution 2023',
    UNVERIFIED_SYNTHESIS_WARNING,
    '*Full tittel: Madaffald i detailhandel og anden fødevaredistribution 2023 (Miljøprojekt nr. 2304)*',
    '- **Forfatter:** Norion Consult',
    '- **Institusjon:** Miljøstyrelsen',
    '- **År:** 2025',
    '- **Dato:** 2025-05-06',
    '- **Kategori:** KONSULENTRAPPORT',
    '- **Utgiver:** Miljøstyrelsen',
    '- **ISBN:** 978-87-7564-001-0',
    '- **Proveniens:** external_report',
    '- **URL:** https://mst.dk/publikationer/2025/maj/kortlaegning-af-madaffald-i-detailhandel-og-anden-foedevaredistribution-for-2023',
    '## Relevans (Relevance)',
    'Gir det nyeste kvantitative sammenligningsgrunnlaget for dansk dagligvaresvinn, og viser at systematisk arbeid i butikkene gir reelle resultater på tross av forsyningskjede-utfordringer.',
    '## Hovedfunn (Key Findings)',
    '- Total mængde madaffald i detailhandel og fødevaredistribution opgjort til 107 676 tons i 2023, hvoraf 103 906 tons var rent madspild.',
    '- En nominel stigning fra 2019-kortlægningen skyldes primært forbedret datagrundlag, nye brancher (f.eks. servicestationer) og ændrede sorteringsskøn.',
    '- Supermarkeder, discountbutikker og traditionelle købmænd har isoleret set oplevet et reelt fald i mængden af madaffald fra 2019 till 2023.',
    '- Etablerer baselineregistrering for de bindende EU-reduktionsmål for 2030 (30 % reduktion i forhold til gennemsnittet for 2021-2023).',
    '## Anbefalinger (Recommendations)',
    '- Fokusere målrettet på andre led av kæden (restauranter, catering og husholdninger) for å accelerere svinnreduktionen.',
    '- Rull ut Fødevareministeriets kommende Madspildsstrategi 2.0.',
  ].join('\n'),
}

export function authoritativeDocumentAfterContent(reportId: AuthoritativeLinkedDocumentReportId) {
  return AUTHORITATIVE_DOCUMENT_AFTER_CONTENT_BY_REPORT_ID[reportId]
}

export const PINNED_AUTHORITATIVE_REPORT_BEFORE_SHA256 =
  '6a60a19c8b53cf5eeae549746102727b954b481d29f523f126469ab29063fcaa'
export const PINNED_AUTHORITATIVE_REPORT_AFTER_SHA256 =
  '9a98d16df8813265708bc36af08e3488e01d3cadade0c8a852049f009cfa262e'
export const PINNED_AUTHORITATIVE_DOCUMENT_BEFORE_SHA256 =
  'f6a96eb918e2e10e9ed07b80829169db6b33175b247b426037b9a09dbb07597a'
export const PINNED_AUTHORITATIVE_DOCUMENT_AFTER_SHA256 =
  'ca91d59c013d049d19fd9ee148977bc566d83bea054a747a9b398524869abf24'
export const PINNED_AUTHORITATIVE_IDENTITY_MANIFEST_SHA256 =
  '8420bd7c70ea5dd9304612b5176e2a75b41d6ecfc4d74a061de603f2a1c5caba'

function compareIds(left: { id?: string; reportId?: string }, right: { id?: string; reportId?: string }) {
  return (left.id ?? left.reportId ?? '').localeCompare(right.id ?? right.reportId ?? '')
}

function nullableText(value: unknown) {
  return typeof value === 'string' ? value : null
}

function requiredText(value: unknown, field: string, id: string) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`Authoritative identity ${id} is missing ${field}`)
  }
  return value
}

function stringArray(value: unknown, field: string, id: string) {
  if (!Array.isArray(value) || value.some(item => typeof item !== 'string')) {
    throw new Error(`Authoritative identity ${id} has invalid ${field}`)
  }
  return [...value] as string[]
}

function countWords(value: string) {
  return value.split(/\s+/).filter(Boolean).length
}

function optionalYear(value: unknown, id: string) {
  if (value == null) return null
  if (!Number.isInteger(value)) throw new Error(`Authoritative identity ${id} has invalid year`)
  return value as number
}

function isoDate(value: Date | string | null | undefined, field: string, id: string) {
  if (value == null) return null
  const parsed = value instanceof Date
    ? value
    : /^\d{4}-\d{2}-\d{2}$/.test(value)
      ? new Date(`${value}T00:00:00.000Z`)
      : new Date(value)
  if (Number.isNaN(parsed.valueOf())) throw new Error(`Authoritative identity ${id} has invalid ${field}`)
  return parsed.toISOString()
}

export function canonicalizeAuthoritativeIdentityJson(value: unknown): CanonicalJsonValue {
  if (value === null || value === undefined) return null
  if (typeof value === 'string' || typeof value === 'boolean') return value
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('Authoritative identity JSON contains a non-finite number')
    return value
  }
  if (value instanceof Date) return value.toISOString()
  if (Array.isArray(value)) return value.map(canonicalizeAuthoritativeIdentityJson)
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    return Object.fromEntries(
      Object.keys(record).sort().map(key => [key, canonicalizeAuthoritativeIdentityJson(record[key])]),
    )
  }
  throw new Error(`Authoritative identity JSON contains unsupported value type: ${typeof value}`)
}

export function sha256AuthoritativeIdentityJson(value: unknown) {
  return createHash('sha256')
    .update(JSON.stringify(canonicalizeAuthoritativeIdentityJson(value)))
    .digest('hex')
}

function normalizeSeedAfter(seed: AuthoritativeReportSeedInput): AuthoritativeReportPortableSnapshot {
  if (!AUTHORITATIVE_REPORT_IDENTITY_IDS.includes(seed.id as AuthoritativeReportIdentityId)) {
    throw new Error(`Unexpected authoritative Report id: ${seed.id}`)
  }
  const id = seed.id as AuthoritativeReportIdentityId
  return {
    id,
    title: requiredText(seed.title, 'title', id),
    fullTitle: nullableText(seed.fullTitle),
    author: nullableText(seed.author),
    institution: nullableText(seed.institution),
    date: nullableText(seed.date),
    year: optionalYear(seed.year, id),
    sourceUrl: nullableText(seed.sourceUrl),
    reportCategory: requiredText(seed.reportCategory, 'reportCategory', id),
    country: nullableText(seed.country) ?? 'NO',
    keyFindings: stringArray(seed.keyFindings, 'keyFindings', id),
    recommendations: stringArray(seed.recommendations, 'recommendations', id),
    relevance: requiredText(seed.relevance, 'relevance', id),
    tags: stringArray(seed.tags, 'tags', id),
    doi: nullableText(seed.doi),
    isbn: nullableText(seed.isbn),
    issn: nullableText(seed.issn),
    publisher: nullableText(seed.publisher),
    provenanceType: nullableText(seed.provenanceType),
    supportingSources: canonicalizeAuthoritativeIdentityJson(seed.supportingSources),
    accessedAt: isoDate(seed.accessedAt, 'accessedAt', id),
  }
}

export function normalizeAuthoritativeReportDatabaseSnapshot(
  row: AuthoritativeReportDatabaseSnapshot,
): AuthoritativeReportFullSnapshot {
  if (!AUTHORITATIVE_REPORT_IDENTITY_IDS.includes(row.id as AuthoritativeReportIdentityId)) {
    throw new Error(`Unexpected authoritative database Report id: ${row.id}`)
  }
  const id = row.id as AuthoritativeReportIdentityId
  return {
    id,
    title: requiredText(row.title, 'title', id),
    fullTitle: nullableText(row.fullTitle),
    author: nullableText(row.author),
    institution: nullableText(row.institution),
    date: nullableText(row.date),
    year: optionalYear(row.year, id),
    sourceUrl: nullableText(row.sourceUrl),
    reportCategory: requiredText(row.reportCategory, 'reportCategory', id),
    country: requiredText(row.country, 'country', id),
    keyFindings: stringArray(row.keyFindings, 'keyFindings', id),
    recommendations: stringArray(row.recommendations, 'recommendations', id),
    relevance: requiredText(row.relevance, 'relevance', id),
    tags: stringArray(row.tags, 'tags', id),
    doi: nullableText(row.doi),
    isbn: nullableText(row.isbn),
    issn: nullableText(row.issn),
    publisher: nullableText(row.publisher),
    provenanceType: nullableText(row.provenanceType),
    supportingSources: canonicalizeAuthoritativeIdentityJson(row.supportingSources),
    accessedAt: isoDate(row.accessedAt, 'accessedAt', id),
    documentId: nullableText(row.documentId),
  }
}

export function normalizeAuthoritativeDocumentDatabaseSnapshot(
  row: AuthoritativeDocumentDatabaseSnapshot,
): AuthoritativeDocumentFullSnapshot {
  if (!AUTHORITATIVE_LINKED_DOCUMENT_REPORT_IDS.includes(row.reportId as AuthoritativeLinkedDocumentReportId)) {
    throw new Error(`Unexpected authoritative Document report id: ${row.reportId}`)
  }
  const reportId = row.reportId as AuthoritativeLinkedDocumentReportId
  return {
    reportId,
    id: requiredText(row.id, 'id', reportId),
    slug: requiredText(row.slug, 'slug', reportId),
    filePath: nullableText(row.filePath),
    title: requiredText(row.title, 'title', reportId),
    author: nullableText(row.author),
    year: optionalYear(row.year, reportId),
    documentType: nullableText(row.documentType),
    category: nullableText(row.category),
    subcategory: nullableText(row.subcategory),
    country: nullableText(row.country),
    contentSha256: createHash('sha256').update(row.content).digest('hex'),
    summary: nullableText(row.summary),
    url: nullableText(row.url),
    accessedAt: isoDate(row.accessedAt, 'accessedAt', reportId),
    archivedUrl: nullableText(row.archivedUrl),
    wordCount: Number.isInteger(row.wordCount) ? row.wordCount : (() => { throw new Error(`Invalid wordCount for ${reportId}`) })(),
    tags: stringArray(row.tags, 'tags', reportId),
    metadata: canonicalizeAuthoritativeIdentityJson(row.metadata),
    createdAt: isoDate(row.createdAt, 'createdAt', reportId)!,
    updatedAt: isoDate(row.updatedAt, 'updatedAt', reportId)!,
  }
}

function reportPortable(full: AuthoritativeReportFullSnapshot): AuthoritativeReportPortableSnapshot {
  const { documentId: _documentId, ...portable } = full
  return portable
}

function documentPortable(full: AuthoritativeDocumentFullSnapshot): AuthoritativeDocumentPortableSnapshot {
  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, ...portable } = full
  return portable
}

function changedPortableFields<T extends Record<string, unknown>>(
  fields: readonly string[],
  before: T,
  after: T,
) {
  return fields.filter(field =>
    JSON.stringify(canonicalizeAuthoritativeIdentityJson(before[field])) !==
      JSON.stringify(canonicalizeAuthoritativeIdentityJson(after[field])),
  )
}

export function authoritativeIdentitySnapshotContract(
  seedReports: readonly AuthoritativeReportSeedInput[],
) {
  const expectedIds = new Set<string>(AUTHORITATIVE_REPORT_IDENTITY_IDS)
  const matching = seedReports.filter(report => expectedIds.has(report.id))
  if (
    matching.length !== AUTHORITATIVE_REPORT_IDENTITY_IDS.length ||
    new Set(matching.map(report => report.id)).size !== AUTHORITATIVE_REPORT_IDENTITY_IDS.length
  ) {
    throw new Error('Authoritative identity repair requires exactly seven unique reviewed seed rows')
  }

  const reportAfter = matching.map(normalizeSeedAfter).sort(compareIds)
  const reportBefore = reportAfter.map(row => ({
    ...row,
    ...BEFORE_IDENTITY_BY_REPORT_ID[row.id],
  })).sort(compareIds)

  const reportTargets = reportAfter.map(after => {
    const before = reportBefore.find(row => row.id === after.id)!
    const changed = changedPortableFields(
      AUTHORITATIVE_REPORT_PORTABLE_FIELDS,
      before as unknown as Record<string, unknown>,
      after as unknown as Record<string, unknown>,
    )
    const forbidden = changed.filter(field =>
      !AUTHORITATIVE_REPORT_MUTATED_FIELDS.includes(field as AuthoritativeReportMutatedField),
    )
    if (forbidden.length > 0) {
      throw new Error(`Authoritative Report ${after.id} changes forbidden fields: ${forbidden.join(', ')}`)
    }
    return {
      id: after.id,
      sourceNature: AUTHORITATIVE_REPORT_SOURCE_NATURE[after.id],
      before,
      after,
      beforePortableSha256: sha256AuthoritativeIdentityJson(before),
      afterPortableSha256: sha256AuthoritativeIdentityJson(after),
      changedFields: changed as AuthoritativeReportMutatedField[],
    } satisfies AuthoritativePortableTarget
  })

  const documentBefore = AUTHORITATIVE_LINKED_DOCUMENT_REPORT_IDS
    .map(reportId => DOCUMENT_BEFORE_BY_REPORT_ID[reportId])
    .sort(compareIds)
  const documentAfter = documentBefore.map(before => {
    const report = reportAfter.find(row => row.id === before.reportId)!
    const content = authoritativeDocumentAfterContent(before.reportId)
    return {
      ...before,
      title: report.title,
      author: report.author,
      year: report.year,
      documentType: report.reportCategory,
      contentSha256: createHash('sha256').update(content).digest('hex'),
      url: report.sourceUrl,
      accessedAt: report.accessedAt,
      wordCount: countWords(content),
      metadata: canonicalizeAuthoritativeIdentityJson({
        generatedFrom: 'prisma/seed-data/reports.ts',
        provenanceType: report.provenanceType,
        reportCategory: report.reportCategory,
        reportId: report.id,
      }),
    }
  }).sort(compareIds)

  const documentTargets = documentAfter.map(after => {
    const before = documentBefore.find(row => row.reportId === after.reportId)!
    const changed = changedPortableFields(
      AUTHORITATIVE_DOCUMENT_PORTABLE_FIELDS,
      before as unknown as Record<string, unknown>,
      after as unknown as Record<string, unknown>,
    )
    const forbidden = changed.filter(field =>
      !AUTHORITATIVE_DOCUMENT_MUTATED_FIELDS.includes(field as AuthoritativeDocumentMutatedField),
    )
    if (forbidden.length > 0) {
      throw new Error(`Authoritative Document ${after.reportId} changes forbidden fields: ${forbidden.join(', ')}`)
    }
    return {
      reportId: after.reportId,
      before,
      after,
      beforePortableSha256: sha256AuthoritativeIdentityJson(before),
      afterPortableSha256: sha256AuthoritativeIdentityJson(after),
      changedFields: changed as AuthoritativeDocumentMutatedField[],
    } satisfies AuthoritativeDocumentPortableTarget
  })

  const reportBeforeSha256 = sha256AuthoritativeIdentityJson(reportBefore)
  const reportAfterSha256 = sha256AuthoritativeIdentityJson(reportAfter)
  const documentBeforeSha256 = sha256AuthoritativeIdentityJson(documentBefore)
  const documentAfterSha256 = sha256AuthoritativeIdentityJson(documentAfter)
  const manifest = {
    version: 1,
    reportIds: AUTHORITATIVE_REPORT_IDENTITY_IDS,
    linkedDocumentReportIds: AUTHORITATIVE_LINKED_DOCUMENT_REPORT_IDS,
    reportPortableFields: AUTHORITATIVE_REPORT_PORTABLE_FIELDS,
    reportMutatedFields: AUTHORITATIVE_REPORT_MUTATED_FIELDS,
    documentPortableFields: AUTHORITATIVE_DOCUMENT_PORTABLE_FIELDS,
    documentMutatedFields: AUTHORITATIVE_DOCUMENT_MUTATED_FIELDS,
    sourceNature: AUTHORITATIVE_REPORT_SOURCE_NATURE,
    reportBefore,
    reportAfter,
    documentBefore,
    documentAfter,
  }
  const manifestSha256 = sha256AuthoritativeIdentityJson(manifest)

  return {
    reportBefore,
    reportAfter,
    documentBefore,
    documentAfter,
    reportTargets,
    documentTargets,
    reportBeforeSha256,
    reportAfterSha256,
    documentBeforeSha256,
    documentAfterSha256,
    manifestSha256,
  }
}

function assertPinnedTargetContract(
  reportTargets: readonly AuthoritativePortableTarget[],
  documentTargets: readonly AuthoritativeDocumentPortableTarget[],
) {
  const reportBefore = [...reportTargets].sort(compareIds).map(target => target.before)
  const reportAfter = [...reportTargets].sort(compareIds).map(target => target.after)
  const documentBefore = [...documentTargets].sort(compareIds).map(target => target.before)
  const documentAfter = [...documentTargets].sort(compareIds).map(target => target.after)
  const manifest = {
    version: 1,
    reportIds: AUTHORITATIVE_REPORT_IDENTITY_IDS,
    linkedDocumentReportIds: AUTHORITATIVE_LINKED_DOCUMENT_REPORT_IDS,
    reportPortableFields: AUTHORITATIVE_REPORT_PORTABLE_FIELDS,
    reportMutatedFields: AUTHORITATIVE_REPORT_MUTATED_FIELDS,
    documentPortableFields: AUTHORITATIVE_DOCUMENT_PORTABLE_FIELDS,
    documentMutatedFields: AUTHORITATIVE_DOCUMENT_MUTATED_FIELDS,
    sourceNature: AUTHORITATIVE_REPORT_SOURCE_NATURE,
    reportBefore,
    reportAfter,
    documentBefore,
    documentAfter,
  }
  if (
    sha256AuthoritativeIdentityJson(reportBefore) !== PINNED_AUTHORITATIVE_REPORT_BEFORE_SHA256 ||
    sha256AuthoritativeIdentityJson(reportAfter) !== PINNED_AUTHORITATIVE_REPORT_AFTER_SHA256 ||
    sha256AuthoritativeIdentityJson(documentBefore) !== PINNED_AUTHORITATIVE_DOCUMENT_BEFORE_SHA256 ||
    sha256AuthoritativeIdentityJson(documentAfter) !== PINNED_AUTHORITATIVE_DOCUMENT_AFTER_SHA256 ||
    sha256AuthoritativeIdentityJson(manifest) !== PINNED_AUTHORITATIVE_IDENTITY_MANIFEST_SHA256
  ) {
    throw new Error('Authoritative identity targets drifted from pinned portable before/after snapshots')
  }
}

export function buildReviewedAuthoritativeIdentityTargets(
  seedReports: readonly AuthoritativeReportSeedInput[],
) {
  const contract = authoritativeIdentitySnapshotContract(seedReports)
  if (
    contract.reportBeforeSha256 !== PINNED_AUTHORITATIVE_REPORT_BEFORE_SHA256 ||
    contract.reportAfterSha256 !== PINNED_AUTHORITATIVE_REPORT_AFTER_SHA256 ||
    contract.documentBeforeSha256 !== PINNED_AUTHORITATIVE_DOCUMENT_BEFORE_SHA256 ||
    contract.documentAfterSha256 !== PINNED_AUTHORITATIVE_DOCUMENT_AFTER_SHA256 ||
    contract.manifestSha256 !== PINNED_AUTHORITATIVE_IDENTITY_MANIFEST_SHA256
  ) {
    throw new Error('Authoritative identity seed values drifted from pinned portable snapshots')
  }
  return {
    reportTargets: contract.reportTargets,
    documentTargets: contract.documentTargets,
  }
}

export function buildAuthoritativeIdentityRepairPlan(
  reportRows: readonly AuthoritativeReportDatabaseSnapshot[],
  documentRows: readonly AuthoritativeDocumentDatabaseSnapshot[],
  reportTargets: readonly AuthoritativePortableTarget[],
  documentTargets: readonly AuthoritativeDocumentPortableTarget[],
  preservedDependencyStateSha256: string,
): AuthoritativeReportIdentityRepairPlan {
  assertPinnedTargetContract(reportTargets, documentTargets)
  if (!/^[a-f0-9]{64}$/.test(preservedDependencyStateSha256)) {
    throw new Error('Authoritative identity repair requires a 64-character dependency SHA-256')
  }

  const reportsById = new Map<string, AuthoritativeReportDatabaseSnapshot[]>()
  for (const row of reportRows) reportsById.set(row.id, [...(reportsById.get(row.id) ?? []), row])
  const documentsByReportId = new Map<string, AuthoritativeDocumentDatabaseSnapshot[]>()
  for (const row of documentRows) {
    documentsByReportId.set(row.reportId, [...(documentsByReportId.get(row.reportId) ?? []), row])
  }

  const reportUpdates: AuthoritativeReportPlannedUpdate[] = []
  const documentUpdates: AuthoritativeDocumentPlannedUpdate[] = []
  const alreadyAppliedReportIds: AuthoritativeReportIdentityId[] = []
  const alreadyAppliedDocumentReportIds: AuthoritativeLinkedDocumentReportId[] = []
  const observed: AuthoritativeIdentityObservedState[] = []
  const conflicts: AuthoritativeIdentityRepairConflict[] = []
  const normalizedReports = new Map<AuthoritativeReportIdentityId, AuthoritativeReportFullSnapshot>()

  for (const target of [...reportTargets].sort(compareIds)) {
    const matching = reportsById.get(target.id) ?? []
    if (matching.length !== 1) {
      conflicts.push({
        entity: 'Report',
        key: target.id,
        code: matching.length === 0 ? 'missing_row' : 'duplicate_snapshot',
        changedFields: [...AUTHORITATIVE_REPORT_PORTABLE_FIELDS],
        detail: `Expected exactly one Report snapshot but received ${matching.length}.`,
        currentRowSha256: null,
      })
      observed.push({ entity: 'Report', key: target.id, state: 'conflict', rowId: target.id, currentFullRowSha256: null })
      continue
    }
    const currentFull = normalizeAuthoritativeReportDatabaseSnapshot(matching[0]!)
    normalizedReports.set(target.id, currentFull)
    const currentPortable = reportPortable(currentFull)
    const portableSha256 = sha256AuthoritativeIdentityJson(currentPortable)
    const fullSha256 = sha256AuthoritativeIdentityJson(currentFull)
    const expectsDocument = AUTHORITATIVE_LINKED_DOCUMENT_REPORT_IDS.includes(target.id as AuthoritativeLinkedDocumentReportId)
    if ((expectsDocument && !currentFull.documentId) || (!expectsDocument && currentFull.documentId)) {
      conflicts.push({
        entity: 'Report',
        key: target.id,
        code: 'unexpected_document_link',
        changedFields: ['documentId'],
        detail: expectsDocument
          ? 'The reviewed mirrored Document link is missing.'
          : 'An unreviewed Document link appeared for a Report whose portable contract expects no mirror.',
        currentRowSha256: fullSha256,
      })
      observed.push({ entity: 'Report', key: target.id, state: 'conflict', rowId: target.id, currentFullRowSha256: fullSha256 })
      continue
    }
    if (portableSha256 === target.beforePortableSha256) {
      const afterFull = { ...target.after, documentId: currentFull.documentId }
      reportUpdates.push({
        ...target,
        beforeFull: currentFull,
        afterFull,
        beforeFullRowSha256: fullSha256,
        afterFullRowSha256: sha256AuthoritativeIdentityJson(afterFull),
      })
      observed.push({ entity: 'Report', key: target.id, state: 'pending', rowId: target.id, currentFullRowSha256: fullSha256 })
      continue
    }
    if (portableSha256 === target.afterPortableSha256) {
      alreadyAppliedReportIds.push(target.id)
      observed.push({ entity: 'Report', key: target.id, state: 'already_applied', rowId: target.id, currentFullRowSha256: fullSha256 })
      continue
    }
    const differences = changedPortableFields(
      AUTHORITATIVE_REPORT_PORTABLE_FIELDS,
      currentPortable as unknown as Record<string, unknown>,
      target.after as unknown as Record<string, unknown>,
    )
    conflicts.push({
      entity: 'Report',
      key: target.id,
      code: 'unexpected_full_row_snapshot',
      changedFields: differences,
      detail: 'The Report matches neither the pinned portable before snapshot nor the pinned portable after snapshot.',
      currentRowSha256: fullSha256,
    })
    observed.push({ entity: 'Report', key: target.id, state: 'conflict', rowId: target.id, currentFullRowSha256: fullSha256 })
  }

  for (const target of [...documentTargets].sort(compareIds)) {
    const matching = documentsByReportId.get(target.reportId) ?? []
    const linkedReport = normalizedReports.get(target.reportId)
    if (matching.length !== 1 || !linkedReport?.documentId) {
      conflicts.push({
        entity: 'Document',
        key: target.reportId,
        code: matching.length === 0 ? 'missing_row' : 'duplicate_snapshot',
        changedFields: [...AUTHORITATIVE_DOCUMENT_PORTABLE_FIELDS],
        detail: `Expected exactly one linked mirrored Document snapshot but received ${matching.length}.`,
        currentRowSha256: null,
      })
      observed.push({ entity: 'Document', key: target.reportId, state: 'conflict', rowId: null, currentFullRowSha256: null })
      continue
    }
    const currentFull = normalizeAuthoritativeDocumentDatabaseSnapshot(matching[0]!)
    const fullSha256 = sha256AuthoritativeIdentityJson(currentFull)
    if (currentFull.id !== linkedReport.documentId) {
      conflicts.push({
        entity: 'Document',
        key: target.reportId,
        code: 'unexpected_document_link',
        changedFields: ['id', 'documentId'],
        detail: 'The mirrored Document snapshot does not match Report.documentId.',
        currentRowSha256: fullSha256,
      })
      observed.push({ entity: 'Document', key: target.reportId, state: 'conflict', rowId: currentFull.id, currentFullRowSha256: fullSha256 })
      continue
    }
    const currentPortable = documentPortable(currentFull)
    const portableSha256 = sha256AuthoritativeIdentityJson(currentPortable)
    if (portableSha256 === target.beforePortableSha256) {
      const afterFull = {
        ...target.after,
        id: currentFull.id,
        createdAt: currentFull.createdAt,
        updatedAt: currentFull.updatedAt,
      }
      documentUpdates.push({
        ...target,
        beforeFull: currentFull,
        afterFull,
        beforeFullRowSha256: fullSha256,
        afterFullRowSha256: sha256AuthoritativeIdentityJson(afterFull),
      })
      observed.push({ entity: 'Document', key: target.reportId, state: 'pending', rowId: currentFull.id, currentFullRowSha256: fullSha256 })
      continue
    }
    if (portableSha256 === target.afterPortableSha256) {
      alreadyAppliedDocumentReportIds.push(target.reportId)
      observed.push({ entity: 'Document', key: target.reportId, state: 'already_applied', rowId: currentFull.id, currentFullRowSha256: fullSha256 })
      continue
    }
    const differences = changedPortableFields(
      AUTHORITATIVE_DOCUMENT_PORTABLE_FIELDS,
      currentPortable as unknown as Record<string, unknown>,
      target.after as unknown as Record<string, unknown>,
    )
    conflicts.push({
      entity: 'Document',
      key: target.reportId,
      code: 'unexpected_full_row_snapshot',
      changedFields: differences,
      detail: 'The Document matches neither the pinned portable before snapshot nor the pinned portable after snapshot.',
      currentRowSha256: fullSha256,
    })
    observed.push({ entity: 'Document', key: target.reportId, state: 'conflict', rowId: currentFull.id, currentFullRowSha256: fullSha256 })
  }

  return {
    version: 1,
    targetManifestSha256: PINNED_AUTHORITATIVE_IDENTITY_MANIFEST_SHA256,
    preservedDependencyStateSha256,
    reportUpdates,
    documentUpdates,
    alreadyAppliedReportIds,
    alreadyAppliedDocumentReportIds,
    observed,
    conflicts,
    summary: {
      totalReports: reportTargets.length,
      totalDocuments: documentTargets.length,
      pendingReportUpdates: reportUpdates.length,
      pendingDocumentUpdates: documentUpdates.length,
      alreadyAppliedReports: alreadyAppliedReportIds.length,
      alreadyAppliedDocuments: alreadyAppliedDocumentReportIds.length,
      conflicts: conflicts.length,
    },
  }
}

export function authoritativeIdentityRepairPlanContract(plan: AuthoritativeReportIdentityRepairPlan) {
  return {
    version: plan.version,
    targetManifestSha256: plan.targetManifestSha256,
    preservedDependencyStateSha256: plan.preservedDependencyStateSha256,
    reportUpdates: plan.reportUpdates.map(update => ({
      id: update.id,
      sourceNature: update.sourceNature,
      changedFields: update.changedFields,
      beforePortableSha256: update.beforePortableSha256,
      afterPortableSha256: update.afterPortableSha256,
      beforeFullRowSha256: update.beforeFullRowSha256,
      afterFullRowSha256: update.afterFullRowSha256,
      before: update.beforeFull,
      after: update.afterFull,
    })),
    documentUpdates: plan.documentUpdates.map(update => ({
      reportId: update.reportId,
      changedFields: update.changedFields,
      beforePortableSha256: update.beforePortableSha256,
      afterPortableSha256: update.afterPortableSha256,
      beforeFullRowSha256: update.beforeFullRowSha256,
      afterFullRowSha256: update.afterFullRowSha256,
      before: update.beforeFull,
      after: update.afterFull,
    })),
    alreadyAppliedReportIds: plan.alreadyAppliedReportIds,
    alreadyAppliedDocumentReportIds: plan.alreadyAppliedDocumentReportIds,
    observed: plan.observed,
    conflicts: plan.conflicts,
    summary: plan.summary,
  }
}

export function authoritativeIdentityRepairPlanSha256(plan: AuthoritativeReportIdentityRepairPlan) {
  return sha256AuthoritativeIdentityJson(authoritativeIdentityRepairPlanContract(plan))
}
