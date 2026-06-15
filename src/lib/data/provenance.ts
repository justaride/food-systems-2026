import { navGroups } from './nav'

export type ProvenanceSourceKind = 'db' | 'artifact' | 'manual' | 'api'

export type ProvenanceSource = {
  kind: ProvenanceSourceKind
  label: string
  detail?: string
  artifactId?: 'konsern-coverage' | 'chart-metrics' | 'value-chain'
}

export type FallbackCondition =
  | 'always'
  | 'communications-empty'
  | 'meetings-error'
  | 'project-core-error'

export type RouteFallback = {
  note: string
  consequence: string
  condition?: FallbackCondition
  tone?: 'warn' | 'danger'
}

export type RouteProvenance = {
  route: string
  title: string
  sources: ProvenanceSource[]
  fallback?: RouteFallback
}

const source = (kind: ProvenanceSourceKind, label: string, detail?: string, artifactId?: ProvenanceSource['artifactId']): ProvenanceSource => ({
  kind,
  label,
  ...(detail ? { detail } : {}),
  ...(artifactId ? { artifactId } : {}),
})

export const routeProvenance: RouteProvenance[] = [
  {
    route: '/',
    title: 'Oversikt',
    sources: [
      source('db', 'Phase', 'prosjektfaser og status'),
      source('db', 'TeamMember', 'rolle- og teamoversikt'),
      source('db', 'KPI', 'målepunkter for plattformløftet'),
      source('db', 'TenStep', 'ti-stegs arbeidsplan'),
      source('db', 'EvidenceDoc', 'evidenspakker'),
      source('db', 'Application', 'søknads- og finansieringsspor'),
      source('db', 'Insight', 'kuraterte prosjektinnsikter'),
    ],
    fallback: {
      condition: 'project-core-error',
      note: 'Ved prosjektkjerne-feil brukes statisk prosjektgrunnlag fra src/lib/data.',
      consequence: 'Oversikten kan fortsatt forklare arbeidet, men fase, KPI og innsikt er ikke bekreftet mot live tabeller.',
      tone: 'warn',
    },
  },
  {
    route: '/sok',
    title: 'Søk',
    sources: [
      source('db', 'Document', 'dokumentmetadata og tekstutdrag'),
      source('db', 'SourceDoc', 'kilderegister og kildefiler'),
      source('db', 'Report', 'rapportarkiv'),
      source('api', 'Søkespørring', 'semantisk søk når indeks er tilgjengelig'),
    ],
    fallback: {
      condition: 'always',
      note: 'Semantisk søk kan falle tilbake til nøkkelord når indeks eller vektorlag ikke er tilgjengelig.',
      consequence: 'Resultatene kan bli mer bokstavelige og bør leses som treffliste, ikke full semantisk dekning.',
      tone: 'warn',
    },
  },
  {
    route: '/team',
    title: 'Team',
    sources: [
      source('db', 'TeamMember', 'teammedlemmer, roller og arbeidsstrømmer'),
      source('manual', 'src/lib/data/team.ts', 'lokal fallback for rollebeskrivelser'),
    ],
  },
  {
    route: '/moter',
    title: 'Møter',
    sources: [
      source('db', 'Meeting', 'møter, datoer og oppfølgingspunkter'),
      source('manual', 'src/lib/data/meetings.ts', 'lokale møtenotater ved spørringsfeil'),
    ],
    fallback: {
      condition: 'meetings-error',
      note: 'Møtesiden bruker fallback fra lokale møtenotater når Meeting-spørringen feiler.',
      consequence: 'Møtebildet kan være operativt nyttig, men er ikke en komplett DB-lesning av møteloggen.',
      tone: 'warn',
    },
  },
  {
    route: '/kommunikasjon',
    title: 'Kommunikasjon',
    sources: [
      source('db', 'Communication', 'korrespondanse og kommunikasjonslogg'),
      source('db', 'Document', 'tilknyttede dokumenter'),
      source('manual', 'src/lib/data/communications.ts', 'arbeidsmelding når kommunikasjonsrader mangler'),
    ],
    fallback: {
      condition: 'communications-empty',
      note: 'Tom Communication-tabell gir fallback til arbeidsmelding på kommunikasjonssiden.',
      consequence: 'Siden dokumenterer at flaten ikke er ferdig lastet, og kan ikke brukes som komplett korrespondansebevis.',
      tone: 'danger',
    },
  },
  {
    route: '/datastatus',
    title: 'Datastatus',
    sources: [
      source('api', '/api/data-status', 'tabelltellinger, feltdeling og fallback-gaps'),
      source('artifact', 'data/konsern-coverage.json', 'konsern-dekningsaudit', 'konsern-coverage'),
      source('artifact', 'chart-metrics.json', 'nordiske metrikkartefakter', 'chart-metrics'),
      source('artifact', 'value-chain.json', 'verdikjede-artefakter', 'value-chain'),
    ],
  },
  {
    route: '/casestatus',
    title: 'Casestatus',
    sources: [
      source('manual', 'src/lib/data/casestatus.ts', 'syv caseankre, modenhet, blokkere og neste handling'),
      source('manual', 'docs/project/mandates/food-tg-0906-sprintboard-go-no-go-2026-06-10.md', 'sprintboard og go/no-go-retning'),
      source('manual', 'docs/project/mandates/primary-check-queue-food-tg-v0.1.md', 'primærsjekk-kø og åpne datagap'),
      source('manual', 'docs/project/mandates/food-tg-claim-lock-table-2026-05.md', 'claim-lock og ikke-si-regler'),
    ],
  },
  {
    route: '/mandat',
    title: 'Mandat',
    sources: [
      source('manual', 'food-tg-mandate.ts', 'vedlikeholdt mandatgrunnlag'),
      source('db', 'Document', 'støttende mandatdokumenter der de finnes'),
    ],
  },
  {
    route: '/metodikk',
    title: 'Metodikk',
    sources: [
      source('manual', 'Metodikk-innhold', 'lokale metodefiler og arbeidsprosedyrer'),
      source('db', 'EvidenceDoc', 'metodeevidens og prosessbelegg'),
    ],
  },
  {
    route: '/tidslinje',
    title: 'Tidslinje',
    sources: [
      source('db', 'Phase', 'prosjektfaser og milepæler'),
      source('db', 'Application', 'søknadsfrister og programspor'),
    ],
  },
  {
    route: '/selskap',
    title: 'Selskaper',
    sources: [
      source('db', 'Company', 'organisasjonsnummer, navn og bransjemetadata'),
      source('db', 'CompanyFinancial', 'regnskapsrader og ansatte'),
      source('db', 'Shareholder', 'aksjonærer og kontrollerende eier'),
      source('db', 'BoardMember', 'styre- og rolledata'),
      source('db', 'CompanyOwnership', 'konsern- og eierrelasjoner'),
    ],
  },
  {
    route: '/eierskap',
    title: 'Eierskap',
    sources: [
      source('db', 'CompanyOwnership', 'eierkanter og konsernrelasjoner'),
      source('db', 'Company', 'selskap og organisasjonsnummer'),
      source('db', 'CompanyFinancial', 'økonomisk størrelse'),
      source('db', 'Shareholder', 'aksjonærlister'),
      source('db', 'CompanyProperty', 'eiendomsrelasjoner'),
      source('db', 'BusinessRelationship', 'verdikjede- og kontraktsrelasjoner'),
      source('artifact', 'data/konsern-coverage.json', 'konsern-dekningsaudit', 'konsern-coverage'),
    ],
  },
  {
    route: '/styremedlemmer',
    title: 'Styremedlemmer',
    sources: [
      source('db', 'BoardMember', 'roller og styreverv'),
      source('db', 'PersonProfile', 'personprofiler og koblinger'),
    ],
  },
  {
    route: '/personer',
    title: 'Personer',
    sources: [
      source('db', 'PersonProfile', 'personprofiler'),
      source('db', 'BoardMember', 'rolle- og styrekoblinger'),
    ],
  },
  {
    route: '/eiendommer',
    title: 'Eiendommer',
    sources: [
      source('db', 'CompanyProperty', 'eiendommer, areal og ervervsår'),
      source('db', 'Company', 'selskapstilknytning og org.nr.'),
    ],
  },
  {
    route: '/verdikjede',
    title: 'Verdikjede',
    sources: [
      source('artifact', 'value-chain.json', 'landvise verdikjede-filer', 'value-chain'),
      source('db', 'BusinessRelationship', 'relasjoner mellom aktører'),
      source('db', 'DeliveryVolume', 'leveransevolumer der de er lastet'),
    ],
  },
  {
    route: '/forsyningskjede',
    title: 'Forsyningskjede',
    sources: [
      source('db', 'BusinessRelationship', 'kjøper, selger og relasjonstype'),
      source('db', 'DeliveryVolume', 'leveransevolumer'),
      source('artifact', 'value-chain.json', 'verdikjede-artefakter', 'value-chain'),
    ],
  },
  {
    route: '/havbruk',
    title: 'Havbruk',
    sources: [
      source('db', 'AquacultureSite', 'lokaliteter og kapasitet'),
      source('db', 'AquacultureApplication', 'søknader og tillatelser'),
      source('db', 'FishHealthObservation', 'fiskehelseobservasjoner der de er lastet'),
    ],
  },
  {
    route: '/sirkularitet',
    title: 'Sirkularitet',
    sources: [
      source('manual', 'Sirkularitetsdatasett', 'lokale sirkularitetsfiler og casegrunnlag'),
      source('db', 'BusinessRelationship', 'relasjoner som brukes i sirkulære strømmer'),
      source('artifact', 'chart-metrics.json', 'nordiske sammenligningsmål', 'chart-metrics'),
    ],
  },
  {
    route: '/okonomi',
    title: 'Økonomi',
    sources: [
      source('db', 'CompanyFinancial', 'regnskapsrader og økonomiske nøkkeltall'),
      source('db', 'CountryMetric', 'landvise økonomi- og matsystemmål'),
      source('db', 'Subsidy', 'tilskuddsdata'),
    ],
  },
  {
    route: '/produsenter',
    title: 'Produsenter',
    sources: [
      source('db', 'Producer', 'produsentregister og produksjonstyper'),
      source('db', 'Subsidy', 'produksjonstilskudd'),
      source('db', 'DeliveryVolume', 'leveransevolumer'),
    ],
  },
  {
    route: '/subsidier',
    title: 'Subsidier',
    sources: [
      source('db', 'Subsidy', 'tilskuddsmottakere og beløp'),
      source('db', 'Producer', 'produsentkoblinger'),
      source('db', 'Company', 'selskapskoblinger der org.nr. finnes'),
    ],
  },
  {
    route: '/sammenligning',
    title: 'Sammenligning',
    sources: [
      source('artifact', 'chart-metrics.json', 'nordiske metrikker', 'chart-metrics'),
      source('artifact', 'value-chain.json', 'landvise verdikjede-data', 'value-chain'),
      source('db', 'CountryMetric', 'sammenligningsindikatorer'),
    ],
  },
  {
    route: '/politikk',
    title: 'Politikk',
    sources: [
      source('manual', 'Policy-datasett', 'kuraterte politikk- og reguleringsfiler'),
      source('db', 'Document', 'policydokumenter og rapportgrunnlag'),
    ],
  },
  {
    route: '/kart',
    title: 'Kart',
    sources: [
      source('artifact', 'chart-metrics.json', 'landvise kartmetrikker', 'chart-metrics'),
      source('manual', 'Kommuner og butikker', 'lokale kart- og geodatafiler'),
      source('db', 'Company', 'selskap med geografiske metadata'),
    ],
  },
  {
    route: '/media',
    title: 'Media',
    sources: [
      source('manual', 'Media landscape', 'kuraterte mediekilder og observasjoner'),
      source('db', 'Document', 'mediedokumenter og kildebelegg'),
    ],
  },
  {
    route: '/innsikt',
    title: 'Innsikt',
    sources: [
      source('db', 'Insight', 'kuraterte innsikter'),
      source('db', 'Document', 'dokumentgrunnlag'),
      source('db', 'SourceDoc', 'kilderegister og kildefiler'),
    ],
  },
  {
    route: '/forskningsrunder',
    title: 'Forskningsrunder',
    sources: [
      source('db', 'Document', 'forskningsnotater og dokumenter'),
      source('db', 'SourceDoc', 'kildegrunnlag'),
      source('manual', 'research intake files', 'import- og rundegrunnlag'),
    ],
  },
  {
    route: '/masteroppgaver',
    title: 'Masteroppgaver',
    sources: [
      source('db', 'Thesis', 'oppgavekandidater og metadata'),
      source('db', 'Document', 'oppgaver og tilhørende dokumentbelegg'),
    ],
  },
  {
    route: '/graf',
    title: 'Graf',
    sources: [
      source('db', 'Company', 'selskap som grafnoder'),
      source('db', 'Actor', 'aktører som grafnoder'),
      source('db', 'Document', 'dokumentnoder'),
      source('db', 'PersonProfile', 'personnoder'),
      source('db', 'BusinessRelationship', 'relasjonskanter'),
      source('db', 'BoardMember', 'rollekanter'),
    ],
  },
  {
    route: '/aktorer',
    title: 'Aktører',
    sources: [
      source('db', 'Actor', 'aktører og kategorier'),
      source('db', 'ActorRelationship', 'aktørrelasjoner'),
      source('db', 'Company', 'selskapstilknytning'),
      source('db', 'Document', 'dokumentbelegg'),
    ],
  },
  {
    route: '/rapporter',
    title: 'Rapporter',
    sources: [
      source('db', 'Report', 'rapportmetadata og publiseringsstatus'),
      source('db', 'Document', 'rapportdokumenter og vedlegg'),
    ],
  },
  {
    route: '/hvitbok',
    title: 'Hvitbok',
    sources: [
      source('manual', 'content/hvitbok', 'hvitbok-kapitler og utkast'),
      source('db', 'Document', 'kilde- og rapportbelegg'),
    ],
  },
  {
    route: '/bibliotek',
    title: 'Bibliotek',
    sources: [
      source('db', 'Document', 'bibliotekdokumenter'),
      source('db', 'SourceDoc', 'kildeposter'),
      source('db', 'Thesis', 'akademiske arbeider'),
      source('db', 'Report', 'rapporter'),
    ],
  },
  {
    route: '/kilder',
    title: 'Kilder',
    sources: [
      source('db', 'SourceDoc', 'kilderegisterposter'),
      source('db', 'Document', 'dokumentkoblinger'),
      source('db', 'SourceCitation', 'siteringer og belegg'),
    ],
  },
]

const configuredRoutes = new Set(routeProvenance.map(item => item.route))
const navRoutes = navGroups.flatMap(group => group.items.map(item => item.href))
const missingNavRoutes = navRoutes.filter(route => !configuredRoutes.has(route))

if (missingNavRoutes.length > 0) {
  throw new Error(`Missing route provenance for ${missingNavRoutes.join(', ')}`)
}

export function findRouteProvenance(pathname: string): RouteProvenance | null {
  const normalizedPath = pathname.split('?')[0]?.replace(/\/$/, '') || '/'
  const exact = routeProvenance.find(item => item.route === normalizedPath)
  if (exact) return exact

  return [...routeProvenance]
    .filter(item => item.route !== '/' && normalizedPath.startsWith(`${item.route}/`))
    .sort((a, b) => b.route.length - a.route.length)[0] ?? null
}
