import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, dirname, join, relative } from 'node:path'
import postcss from 'postcss'

export { buildM2DraftSections } from './obsidian-vault-m2'
export type { M2DraftSection } from './obsidian-vault-m2'

const NOTES_MARKER = '## Notater'

const REQUIRED_FRONTMATTER = ['type', 'status', 'kilde', 'siterbarhet'] as const
const REVIEW_PATH_PREFIXES = [
  'Food Systems Obsidian/',
  '0 Kart/',
  '10 Innsiktskart/',
  '11 Maktkart/',
  '12 Kilder/',
  'content/',
  'data/vault-export/',
  'docs/',
  'research/',
] as const
const REQUIRED_GRAPH_COLOR_GROUPS = [
  { query: 'path:"0 Kart"', rgb: 4605510 },
  { query: 'path:"1 Oversikt og navigasjon"', rgb: 4605510 },
  { query: 'path:"2 Intern"', rgb: 4605510 },
  { query: 'path:"3 Selskap og eierskap"', rgb: 6333946 },
  { query: 'path:"4 Matsystem"', rgb: 1409085 },
  { query: 'path:"5 Produsenter og støtte"', rgb: 1409085 },
  { query: 'path:"6 Nordisk"', rgb: 8141549 },
  { query: 'path:"7 Kunnskap"', rgb: 14362487 },
  { query: 'path:"8 Bibliotek"', rgb: 3342336 },
  { query: 'path:"9 Datafundament"', rgb: 3342336 },
  { query: 'path:"10 Innsiktskart/Ledd"', rgb: 1409085 },
  { query: 'path:"10 Innsiktskart/Aktører"', rgb: 1920728 },
  { query: 'path:"10 Innsiktskart/Stakeholders"', rgb: 6333946 },
  { query: 'path:"10 Innsiktskart/Innsikter"', rgb: 14362487 },
  { query: 'path:"10 Innsiktskart/Looper"', rgb: 561586 },
  { query: 'path:"10 Innsiktskart/Gaps"', rgb: 15357964 },
  { query: 'path:"10 Innsiktskart/Norden"', rgb: 8141549 },
  { query: 'path:"11 Maktkart/Selskaper"', rgb: 6333946 },
  { query: 'path:"11 Maktkart/Personer"', rgb: 13273604 },
  { query: 'path:"12 Kilder"', rgb: 3342336 },
] as const
const DATAVIEW_QUERY_TYPES = new Set(['TABLE', 'LIST', 'TASK', 'CALENDAR'])
const REQUIRED_OBSIDIAN_PLUGIN_RECOMMENDATIONS = ['Dataview', 'Breadcrumbs', 'Minimal Theme Settings'] as const
const REQUIRED_OBSIDIAN_PRESENTATION_PLUGIN_ALTERNATIVES = ['Juggl', '3D Graph'] as const
const REQUIRED_OBSIDIAN_M3_SETUP_TEXT = [
  '## Presentasjonsvisninger',
  'Beviskjeden',
  'Styrenettverket (kjerne)',
  'Sirkularitetsloopene per R-nivå',
  '## Eksport til leveranser',
  'docs/miro-kart-kunnskapsgrunnlag-blueprint.md',
  '## Visnings-QA',
  'Kunnskapskart.canvas',
  'Verdikjedekart.canvas',
  'Maktkart.canvas',
  'NorgesGruppen ASA.canvas',
] as const
const CORE_GRAPH_FILTER = [
  '-path:"0 Kart/Konsern"',
  '-path:"0 Kart/Kunnskapskart.canvas"',
  '-path:"0 Kart/Maktkart.canvas"',
  '-path:"0 Kart/Oppsett.md"',
  '-path:"0 Kart/Temakart"',
  '-path:"0 Kart/Verdikjedekart.canvas"',
  '-path:"1 Oversikt og navigasjon"',
  '-path:"2 Intern"',
  '-path:"3 Selskap og eierskap"',
  '-path:"4 Matsystem"',
  '-path:"5 Produsenter og støtte"',
  '-path:"6 Nordisk"',
  '-path:"7 Kunnskap"',
  '-path:"8 Bibliotek"',
  '-path:"9 Datafundament"',
  '-path:"10 Innsiktskart/Stakeholders"',
  '-path:"Selskaper/Register"',
  '-path:"Personer/Register"',
  '-path:"12 Kilder"',
].join(' ')
const RESTRICTED_FLAT_VAULT_FOLDERS = [
  { relPath: join('10 Innsiktskart', 'Looper'), allowedSubfolders: new Set<string>() },
  { relPath: join('10 Innsiktskart', 'Gaps'), allowedSubfolders: new Set<string>() },
  { relPath: join('10 Innsiktskart', 'Innsikter'), allowedSubfolders: new Set<string>() },
  { relPath: join('11 Maktkart', 'Selskaper'), allowedSubfolders: new Set(['Register']) },
  { relPath: join('11 Maktkart', 'Personer'), allowedSubfolders: new Set(['Register']) },
] as const
const INSIGHT_CANDIDATE_GATE_PATH = 'docs/project/plans/obsidian-i27-kandidatgodkjenning-2026-07-02.md'
const INSIGHT_CANDIDATE_GATE_STATUS = 'krever menneskelig godkjenning for generering'
const VK5_MASTERPLAN_PATH = 'docs/project/plans/obsidian-kunnskapskart-masterplan-2026-07-02.md'
const VK5_REVIEW_PROTOCOL_PATH = 'docs/project/plans/obsidian-kunnskapskart-vk5-review-protokoll-2026-07-02.md'
const VK5_REVIEW_STATUS_PATH = 'docs/project/plans/obsidian-kunnskapskart-vk5-review-status-2026-07-02.md'
const VK5_COMPLETION_AUDIT_PATH = 'docs/project/plans/obsidian-kunnskapskart-completion-audit-2026-07-02.md'
const VK5_ARCHIVED_MASTERPLAN_PATH = 'docs/project/plans/archive/obsidian-kunnskapskart-masterplan-2026-07-02.md'
const VK5_ARCHIVED_COMPLETION_AUDIT_PATH =
  'docs/project/plans/archive/obsidian-kunnskapskart-completion-audit-2026-07-02.md'
const REQUIRED_MASTERPLAN_FRONTMATTER = {
  status: 'Handover-klar for Codex',
  eier: 'Gabriel',
  dato: '2026-07-02',
  arbeidsflate: 'Food Systems Obsidian/ (vault i repo-roten)',
  bruksregel:
    'Internt arbeidskart. Alle tall/claims i vaulten er gjengitt fra research-syntesen; ekstern bruk krever claim-lock/siterbarhets-gate (.claude/source-attribution-policy.md).',
} as const
const REQUIRED_MASTERPLAN_CLAIM_LOCK_POLICY_TARGET = '.claude/source-attribution-policy.md'
const REQUIRED_MASTERPLAN_RELATED_FILES = [
  'scripts/obsidian-vault/build_vault.py',
  'scripts/obsidian-vault/build_innsiktskart.py',
  'scripts/obsidian-vault/build_maktkart.py',
  'docs/miro-kart-kunnskapsgrunnlag-blueprint.md',
  'docs/project/analysis/food-tg-ap1-styreoverlapp-funn-2026-06-14.md',
] as const
const REQUIRED_MASTERPLAN_SECTIONS = [
  '## 0. Goal-prompt (lim inn i Codex)',
  '## 1. Nåsituasjon (per 2026-07-02)',
  '## 2. Målbilde: «det fullstendige kartet»',
  '## 3. Arbeidspakker',
  '### VK-0 — Sync-infrastruktur (teknisk fundament, gjør først)',
  '### VK-1 — Komplett selskaps- og eierskapslag (krever DB)',
  '### VK-2 — Innsikts- og kildelag komplett',
  '### VK-3 — Grafisk løft',
  '### VK-4 — Datainnsamling (mates av kartet, utføres som research-missions)',
  '### VK-5 — Gjennomgang (menneske + Claude, etter Codex-leveransen)',
  '## 4. Rekkefølge og avhengigheter',
  '## 5. Vernede invarianter (gjelder alle faser)',
] as const
const REQUIRED_MASTERPLAN_CONTRACT_TEXT = [
  '**Akseptanse:** `npm run vault:sync && npm run vault:check` er grønn og en diff-kjøring mot dagens vault viser kun forventede endringer (frontmatter-normalisering).',
  '**Akseptanse:** antall noter/kanter stemmer med eksport-JSON (skriv tallene i sync-loggen); `vault:check` grønn; stikkprøve mot `npm run db:audit`-tall.',
  '**Akseptanse:** hver innsiktsnote har minst én kildenote-lenke; ingen innsikt uten `siterbarhet`-felt.',
  '**Akseptanse:** skjermbilde-gjennomgang med Gabriel/Cathrine; Dataview-spørringer returnerer uten feil; CSS validerer i Obsidian 1.5+.',
  '**Akseptanse:** hver gap-node i vaulten har enten data eller en lenket mission; konsern-coverage `qualityScore` uendret eller bedre etter re-import + `npm run db:audit` grønn.',
  '1. Menneskelig innhold under `## Notater` overlever alltid sync.',
  '2. Vault-endringer rører aldri app-kode, DB eller committede dataartefakter (enveis: repo → vault; unntak: `data/vault-export/` som er sync-input).',
  '3. Alle datagenererte noter bærer kilde-referanse og siterbarhets-markering.',
  '4. `vault:check` grønn før hver fase merges.',
  '5. Personnoter beholder AP-1-bruksregelen ordrett.',
] as const
const REQUIRED_INSIGHT_CANDIDATE_GATE_FRONTMATTER_LINKS = {
  plan: VK5_MASTERPLAN_PATH,
  vk5_review_protokoll: VK5_REVIEW_PROTOCOL_PATH,
} as const
const REQUIRED_INSIGHT_CANDIDATE_STOP_TEXT = [
  '## Ikke generer ennå',
  'Ingen I27+-noter skal opprettes før denne listen er godkjent.',
  'Kandidater som inneholder tall, aktørnavn eller årsaksspråk skal gjennom claim-lock før ekstern bruk.',
  'Etter godkjenning skal hver ny innsiktsnote ha minst én kildenote-lenke og eksplisitt `siterbarhet`.',
] as const
const REQUIRED_REVIEW_PACKAGE_FRONTMATTER_LINKS = {
  [VK5_REVIEW_STATUS_PATH]: {
    plan: VK5_MASTERPLAN_PATH,
    completion_audit: VK5_COMPLETION_AUDIT_PATH,
    vk5_review_protokoll: VK5_REVIEW_PROTOCOL_PATH,
  },
  [VK5_COMPLETION_AUDIT_PATH]: {
    plan: VK5_MASTERPLAN_PATH,
    statusnotat: VK5_REVIEW_STATUS_PATH,
    vk5_review_protokoll: VK5_REVIEW_PROTOCOL_PATH,
  },
} as const
const REQUIRED_REVIEW_PACKAGE_FRONTMATTER_STATUSES = {
  [VK5_REVIEW_STATUS_PATH]: 'klar-for-menneskelig-review',
  [VK5_COMPLETION_AUDIT_PATH]: 'repo-lokalt-klart-ikke-mal-complete',
} as const
const REVIEW_PACKAGE_DUPLICATED_REQUIREMENT_PHRASES = [
  'masterplanens obligatoriske frontmatter',
  'komplett VK-5-reviewradsett',
  'closeout-port som nekter `fullfort`',
] as const
const REVIEW_PACKAGE_CANONICAL_REQUIREMENT_POINTER =
  `Kanonisk VK-5-kravliste: \`${VK5_REVIEW_PROTOCOL_PATH}\``
const REVIEW_PACKAGE_CANONICAL_NOTE_COUNT_POINTER = 'Notetall kilde: `npm run vault:sync` og `npm run vault:check`'
const REVIEW_PACKAGE_CANONICAL_DB_UNIVERSE_POINTER = 'DB-univers kilde: `data/vault-export/manifest.json`'
const REQUIRED_INSIGHT_CANDIDATE_IDS = Array.from({ length: 12 }, (_, index) => `I${index + 27}`)
const ALLOWED_INSIGHT_CANDIDATE_STATUSES = new Set([
  'til godkjenning',
  'godkjenn',
  'godkjenn med endring',
  'dropp',
  'parkert',
])
const ALLOWED_REVIEW_PROTOCOL_STATUSES = new Set([
  'ikke sjekket',
  'ikke sjekket i review',
  'ikke besluttet',
  'godkjent',
  'godkjent med endring',
  'parkert',
  'parkert med beslutning',
])
const ALLOWED_REVIEW_PROTOCOL_I27_DECISIONS = new Set([
  'ikke besluttet',
  'godkjenn',
  'godkjenn med endring',
  'dropp',
  'parkert',
])
const ALLOWED_REVIEW_PROTOCOL_DECISIONS = new Set([
  'ikke besluttet',
  'godkjent',
  'godkjent med endring',
  'godkjenn',
  'godkjenn med endring',
  'dropp',
  'parkert',
  'parkert med beslutning',
])
const REVIEW_PROTOCOL_CLOSEOUT_STATUSES = new Set(['fullfort', 'fullført', 'ferdig', 'lukket'])
const ALLOWED_REVIEW_PROTOCOL_FRONTMATTER_STATUSES = new Set([
  'klar-for-gjennomgang-ikke-utfort',
  ...REVIEW_PROTOCOL_CLOSEOUT_STATUSES,
])
const UNRESOLVED_REVIEW_PROTOCOL_STATUSES = new Set(['ikke sjekket', 'ikke sjekket i review', 'ikke besluttet'])
const UNRESOLVED_REVIEW_PROTOCOL_DECISIONS = new Set(['ikke besluttet'])
const REQUIRED_REVIEW_PROTOCOL_SECTIONS = [
  '## 1. Diff-gjennomgang og kilde-JSON',
  '## 2. Graf-visning i Obsidian',
  '## 3. Canvas-kvalitet',
  '## 4. Dataview og dynamiske MOC-er',
  '## 5. I27+ kandidatport',
  '## 6. Siterbarhetsstikkprover',
  '## 7. Beslutninger for app/whitepaper',
  '## 8. Neste datainnsamlingsrunde',
  '## Sluttstatus for VK-5',
] as const
const REQUIRED_REVIEW_PROTOCOL_DECISION_BLOCKS = [
  'Beslutning etter diff-gjennomgang:',
  'Beslutning etter graf-review:',
  'Beslutning etter canvas-review:',
  'Beslutning etter Dataview-review:',
  'Beslutning etter I27+-review:',
  'Beslutning etter siterbarhetsreview:',
] as const
const REQUIRED_REVIEW_PROTOCOL_DECISION_OPTIONS = [
  'Godkjent',
  'Godkjent med endringer',
  'Parkert - krever ny sync/datarevisjon',
  'Godkjent',
  'Juster colorGroups/filtre',
  'Parkert - krever ny grafstrategi',
  'Godkjent',
  'Godkjent med liste over konkrete canvas-endringer',
  'Parkert - krever layoutpass',
  'Godkjent',
  'Juster Dataview-sporringer',
  'Parkert - plugin/oppsett mangler',
  'Kandidatlisten er godkjent/redigert og kan genereres',
  'Kandidatlisten er parkert; ingen I27+-noter genereres',
  'Godkjent for intern bruk',
  'Krever claim-lock for valgte noter',
  'Parkert for ny kilde-/siterbarhetsrunde',
] as const
const REQUIRED_REVIEW_PROTOCOL_CLOSEOUT_ITEMS = [
  'Alle seksjonene over har beslutning.',
  'Eventuelle endringer fra reviewen er gjort i repo/vault.',
  '`npm run vault:sync && npm run vault:check` er gronn etter endringene.',
  'Denne protokollen oppdateres med endelig status.',
] as const
const REQUIRED_REVIEW_PROTOCOL_ROWS = [
  'Repo-integritet',
  'Review-preflight',
  'Diff-forstaelse',
  'Obsidian apner vault',
  'Plugins',
  '`11 Maktkart/Selskaper/NorgesGruppen ASA.md`',
  '`11 Maktkart/Eierskapsregisteret.md`',
  '`11 Maktkart/Personregister.md`',
  '`11 Maktkart/Selskapsregister.md`',
  '`11 Maktkart/Selskaper/Selskapsmappe-register.md`',
  '`12 Kilder/Møte- og transkriptregister.md`',
  'Standardgraf',
  'Farger',
  'Hull',
  'Stoy',
  'Maktlag',
  '`0 Kart/Kunnskapskart.canvas`',
  '`0 Kart/Verdikjedekart.canvas`',
  '`0 Kart/Maktkart.canvas`',
  '`0 Kart/Temakart/Sirkularitet.canvas`',
  '`0 Kart/Temakart/Norden.canvas`',
  '`0 Kart/Konsern/NorgesGruppen ASA.canvas`',
  '`0 Kart/Konsern/Coop Norge SA.canvas`',
  '`0 Kart/Konsern/Orkla ASA.canvas`',
  '`0 Kart/Konsern/Mowi ASA.canvas`',
  '`0 Kart/Konsern/Kesko Oyj.canvas`',
  '`0 Kart/HUB – Kunnskapsdatabasen.md`',
  '`10 Innsiktskart/Innsiktskartet.md`',
  '`11 Maktkart/Maktkartet.md`',
  'Klyngenoter `1` til `8`',
  '`10 Innsiktskart/Innsikter/I01 Triopolet – 93,4 % av butikkene.md`',
  '`10 Innsiktskart/Innsikter/I26 Gaps som krever menneskelig input.md`',
  '`10 Innsiktskart/Gaps/Gap-register.md`',
  '`12 Kilder/Kilde – narrativ-struktur.md`',
  '`11 Maktkart/Personregister.md`',
  'Vault-graf til `/graf`',
  'Temacanvas Sirkularitet som figur',
  'Temacanvas Norden som figur',
  'Konsern-canvas som intern analysefigur',
  'Gap-register som research-backlog',
  'Styredata-dekning for 13 konserntrær',
  'Brreg-refresh for aldri-refreshede konsern',
  'M&A-events for NG-treet',
  'Stakeholder-utfylling fra skeletons',
  'Norske sirkularitets-gaps',
] as const

export type VaultFrontmatter = {
  type: string
  status: string
  kilde: string
  siterbarhet: string
  [key: string]: string | number | boolean
}

export type GeneratedNoteInput = {
  title: string
  frontmatter: VaultFrontmatter
  body: string[]
}

export type VaultIssue = {
  file: string
  message: string
}

const M2_SELF_CONTAINED_INSIGHT_REQUIREMENTS = new Map<string, string[]>([
  [
    'I27 Styreoverlappet peker på smale broer',
    ['555 styreverv', '32 interlockere', '11 tverrsektorielle broer', '98 av 275'],
  ],
  [
    'I31 Krysseie må leses som kontrollbaner',
    ['19 tverrsektorielle kontrollører', '39 selskaper', '183 av 275', '67 %'],
  ],
  [
    'I34 Fem fokusområder gjør kartet handlingsrettet',
    ['11/12', '10/12', 'Importert fôr', 'Matsvinn', 'Strukturell konkurranse'],
  ],
  [
    'I36 Næringsgjenvinning er et prioritert gap',
    ['66 000 tonn nitrogen', '14 000 tonn fosfor', 'omtrent to prosent', '218 000 tonn'],
  ],
  ['I37 Maktkartet må leses gjennom fire linser', ['AP-3', 'AP-1', 'AP-2', 'AP-5', '183 av 275']],
  [
    'I38 Objective-function skiller beslutning fra publisering',
    ['Sett II', 'Resiliens/forsyningssikkerhet', 'Sirkularitet/ressurseffektivitet', 'Bondeøkonomi/distrikt'],
  ],
])

type InsightCandidateApprovalRow = {
  title: string
  sourceBasis: string
  rationale: string
  status: string
}

type VaultExportCompanyReviewRow = {
  id?: string
  name: string
  orgNr?: string
  valueChainStage?: string | null
  classification?: string | null
  legalForm?: string | null
}

type VaultExportOwnershipReviewRow = {
  parentCompanyId?: string
  parentName: string
  childCompanyId?: string
  childName: string
  ownershipPct: number | null
  ownershipType?: string | null
  source?: string | null
}

type VaultExportBoardReviewRow = {
  companyId?: string
  companyName: string
  personName: string
  personKey: string
  role: string
}

type VaultExportManifestReview = {
  counts?: {
    companies?: number
    ownershipEdges?: number
    boardMembers?: number
    businessRelationships?: number
    properties?: number
  }
}

export type VaultValidationOptions = {
  requirePresentationAssets?: boolean
  requireGapMissions?: boolean
  requireVaultExport?: boolean
  requireNoOrphans?: boolean
  allowedOrphanPaths?: string[]
  requirePersonUsageRule?: boolean
  requireMetadataOnlySources?: boolean
  requireInsightCandidateGate?: boolean
}

export type ReviewPreflightOptions = {
  vaultDirName?: string
}

export type VaultExportArtifactsInput = {
  manifest: {
    generatedAt: string
    source: string
    counts: {
      companies: number
      ownershipEdges: number
      boardMembers: number
      businessRelationships: number
      properties: number
    }
  }
  companies: Array<{
    id: string
    name: string
    orgNr: string
    legalForm: string | null
    country: string
    valueChainStage: string | null
    classification: string | null
    naceCode: string | null
    naceDescription: string | null
    isResearchConstruct: boolean
  }>
  ownershipEdges: Array<{
    id: string
    parentCompanyId: string
    parentName: string
    childCompanyId: string
    childName: string
    ownershipPct: number | null
    ownershipType: string | null
    source: string | null
  }>
  boardMembers: Array<{
    id: string
    companyId: string
    personName: string
    personKey: string
    role: string
    source: string | null
    verificationStatus: string | null
    companyName: string
  }>
  businessRelationships: Array<{
    id: string
    fromCompanyId: string
    toCompanyId: string
    relationshipType: string
    description: string | null
    sector: string | null
    estimatedValue: number | null
    source: string | null
    verificationStatus: string | null
    fromCompanyName: string
    toCompanyName: string
  }>
  properties: Array<{
    id: string
    companyId: string
    tenantCompanyId: string | null
    propertyType: string
    address: string | null
    municipality: string | null
    county: string | null
    country: string
    lat: number | null
    lng: number | null
    sqMeters: number | null
    selfLeased: boolean
    source: string | null
    companyName: string
    tenantCompanyName: string | null
  }>
  ownershipForest: Array<OwnershipForestNode>
  coreCompanyIds?: string[]
  coreCompanyNames?: string[]
  corePersonNames?: string[]
}

export type OwnershipForestNode = {
  id: string
  name: string
  orgNr: string
  ownershipPct: number | null
  children: OwnershipForestNode[]
}

export type VaultExportArtifact = {
  path: string
  content: string
}

export type RegisterArtifactInput = {
  title: string
  path: string
  source: string
  type: string
  intro: string
  items: Array<{ title: string; target?: string; detail?: string }>
  links: string[]
}

export type MeetingTranscriptSource = {
  sourcePath: string
  kind: 'meeting' | 'transcript'
  byteLength: number
  preview?: string
}

export type StakeholderSeedRow = {
  actor: string
  actorType: string
  whyRelevantForMapping: string
  priority: string
  suggestedAsk: string
  sourceBasis: string
}

export function buildGraphSettings(): string {
  return `${JSON.stringify(
    {
      'collapse-filter': true,
      search: CORE_GRAPH_FILTER,
      showTags: false,
      showAttachments: false,
      hideUnresolved: false,
      showOrphans: false,
      'collapse-color-groups': true,
      colorGroups: REQUIRED_GRAPH_COLOR_GROUPS.map((group) => ({
        query: group.query,
        color: { a: 1, rgb: group.rgb },
      })),
      'collapse-display': true,
      showArrow: false,
      textFadeMultiplier: 0,
      nodeSizeMultiplier: 1,
      lineSizeMultiplier: 1,
      'collapse-forces': true,
      centerStrength: 0.518713248970312,
      repelStrength: 10,
      linkStrength: 1,
      linkDistance: 250,
      scale: 0.8321681732056168,
      close: true,
    },
    null,
    2,
  )}\n`
}

export function noteFileName(name: string): string {
  return `${name.replace(/\//g, '-')}.md`
}

function formatFrontmatterValue(value: string | number | boolean): string {
  if (value === '') {
    return '""'
  }

  return String(value)
}

export function buildGeneratedNote(input: GeneratedNoteInput): string {
  const frontmatter = Object.entries(input.frontmatter).map(([key, value]) => `${key}: ${formatFrontmatterValue(value)}`)
  return [
    '---',
    ...frontmatter,
    '---',
    '',
    `# ${input.title}`,
    '',
    ...input.body,
    '',
    NOTES_MARKER,
    '',
    '_Utvikles gjennom prosjektet._',
    '',
  ].join('\n')
}

export function mergeGeneratedNote(generated: string, existing?: string): string {
  const generatedHead = splitAtNotes(generated).head
  const existingParts = existing ? splitAtNotes(existing) : null

  if (!existingParts?.tail) {
    return `${trimTrailingNewlines(generatedHead)}\n${NOTES_MARKER}\n\n_Utvikles gjennom prosjektet._\n`
  }

  return `${trimTrailingNewlines(generatedHead)}\n${existingParts.tail}`
}

export function applyManagedSection(source: string, heading: string, body: string[]): string {
  const parts = splitAtNotes(source)
  const section = `${heading}\n\n${body.join('\n')}\n`
  const cleanedHead = removeManagedBody(parts.head, body)
  const replaced = replaceSection(cleanedHead, heading, section)
  const head = replaced ?? `${trimTrailingNewlines(removeSection(cleanedHead, heading))}\n\n${section}`

  return `${trimTrailingNewlines(head)}\n${parts.tail ?? `${NOTES_MARKER}\n\n_Utvikles gjennom prosjektet._\n`}`
}

export function buildMeetingTranscriptArtifacts(sources: MeetingTranscriptSource[]): {
  files: VaultExportArtifact[]
  summary: { meetings: number; transcripts: number }
  summaryLine: string
} {
  const sortedSources = [...sources].sort((a, b) => a.sourcePath.localeCompare(b.sourcePath, 'nb'))
  const files = sortedSources.map((source) => {
    const title = sourceTitle(source.sourcePath)
    const isMeeting = source.kind === 'meeting'
    const body = [
      `> ${isMeeting ? 'Møtekilde' : 'Transkriptkilde'} · metadata-only · Del av [[Møte- og transkriptregister]]`,
      '',
      '## Metadata',
      '',
      `- Kildesti: \`${source.sourcePath}\``,
      `- Type: ${isMeeting ? 'møte' : 'transkript'}`,
      `- Filstorrelse: ${source.byteLength} bytes`,
      '',
      '## Sammendragslenke',
      '',
      `- Se originalfilen: \`${source.sourcePath}\``,
      '',
      '## Bruksregel',
      '',
      '- Vault-noten kopierer ikke fulltekst; bruk originalfilen for sitat, kontekst og claim-lock.',
      '',
      '## Koblinger',
      '',
      '- [[Møte- og transkriptregister]]',
      '- [[Møter]]',
    ]

    return {
      path: join('12 Kilder', isMeeting ? 'Møter' : 'Transkripter', noteFileName(title)),
      content: buildGeneratedNote({
        title,
        frontmatter: {
          type: 'mote',
          status: 'generert',
          kilde: source.sourcePath,
          siterbarhet: 'intern',
        },
        body,
      }),
    }
  })
  const meetings = sortedSources.filter((source) => source.kind === 'meeting').length
  const transcripts = sortedSources.filter((source) => source.kind === 'transcript').length

  files.push({
    path: join('12 Kilder', 'Møte- og transkriptregister.md'),
    content: buildGeneratedNote({
      title: 'Møte- og transkriptregister',
      frontmatter: {
        type: 'mote',
        status: 'generert',
        kilde: 'docs/meetings; research/landbrukarena_transcripts',
        siterbarhet: 'intern',
      },
      body: [
        '> Metadata-register for møter og transkripter. Fulltekst holdes i originalfilene.',
        '',
        '## Omfang',
        '',
        `- Møter: ${meetings}`,
        `- Transkripter: ${transcripts}`,
        '',
        '## Møter',
        '',
        ...listOrPlaceholder(
          sortedSources.filter((source) => source.kind === 'meeting'),
          (source) => `- [[${sourceTitle(source.sourcePath)}]] — \`${source.sourcePath}\``,
        ),
        '',
        '## Transkripter',
        '',
        ...listOrPlaceholder(
          sortedSources.filter((source) => source.kind === 'transcript'),
          (source) => `- [[${sourceTitle(source.sourcePath)}]] — \`${source.sourcePath}\``,
        ),
        '',
        '## Koblinger',
        '',
        '- [[Kilder]]',
        '- [[Møter]]',
      ],
    }),
  })

  return {
    files,
    summary: { meetings, transcripts },
    summaryLine: `vault:sync source-notes meetings=${meetings} transcripts=${transcripts}`,
  }
}

export function buildStakeholderArtifacts(
  rows: StakeholderSeedRow[],
  actorNoteTitles: Set<string>,
  actorNoteAliases = new Map<string, string>(),
): {
  files: VaultExportArtifact[]
  summary: { stakeholders: number; linkedActorNotes: number }
  summaryLine: string
} {
  const sortedRows = [...rows].sort((a, b) => a.actor.localeCompare(b.actor, 'nb'))
  const files: VaultExportArtifact[] = []
  let linkedActorNotes = 0

  for (const row of sortedRows) {
    const stakeholderTitle = `Stakeholder – ${row.actor}`
    const actorNoteTitle = actorNoteTitleFor(row.actor, actorNoteTitles, actorNoteAliases)
    if (actorNoteTitle) linkedActorNotes += 1

    files.push({
      path: join('10 Innsiktskart', 'Stakeholders', noteFileName(stakeholderTitle)),
      content: buildGeneratedNote({
        title: stakeholderTitle,
        frontmatter: {
          type: 'aktor',
          status: 'utkast',
          kilde: 'research/interviews/landbrukarena-aktor-seed-2026-03-19.csv',
          siterbarhet: 'intern',
          ask: cleanFrontmatterValue(row.suggestedAsk),
          prioritet: cleanFrontmatterValue(row.priority),
          relasjon: cleanFrontmatterValue(row.actorType),
        },
        body: [
          '> Stakeholder-skeleton fra Landbrukarena aktørseed · ikke claim-klar uten videre research.',
          '',
          '## Hvorfor relevant',
          '',
          row.whyRelevantForMapping,
          '',
          '## Foreslått ask',
          '',
          row.suggestedAsk,
          '',
          '## Kildebasis',
          '',
          `- ${row.sourceBasis}`,
          '- `research/interviews/landbrukarena-aktor-seed-2026-03-19.csv`',
          '',
          '## Koblinger',
          '',
          actorNoteTitle
            ? `- Aktørnote: ${wikiLinkForTitle(actorNoteTitle, row.actor)}`
            : '- Aktørnote: ikke opprettet i vaulten',
          '- [[I26 Gaps som krever menneskelig input]]',
          '- [[Stakeholder-register]]',
        ],
      }),
    })
  }

  files.push({
    path: join('10 Innsiktskart', 'Stakeholders', 'Stakeholder-register.md'),
    content: buildGeneratedNote({
      title: 'Stakeholder-register',
      frontmatter: {
        type: 'aktor',
        status: 'utkast',
        kilde: 'research/interviews/landbrukarena-aktor-seed-2026-03-19.csv',
        siterbarhet: 'intern',
      },
      body: [
        '> Register over stakeholder-skeletons som må fylles med intervjuer, kilder og menneskelig prioritering.',
        '',
        '## Omfang',
        '',
        `- Stakeholders: ${sortedRows.length}`,
        `- Koblet til eksisterende aktørnoter: ${linkedActorNotes}`,
        '',
        '## Stakeholders',
        '',
        ...listOrPlaceholder(
          sortedRows,
          (row) => `- [[Stakeholder – ${row.actor}]] — ${row.priority} · ${row.actorType}`,
        ),
        '',
        '## Koblinger',
        '',
        '- [[I26 Gaps som krever menneskelig input]]',
        '- [[Aktører]]',
      ],
    }),
  })

  return {
    files,
    summary: { stakeholders: sortedRows.length, linkedActorNotes },
    summaryLine: `vault:sync stakeholders stakeholders=${sortedRows.length} linkedActorNotes=${linkedActorNotes}`,
  }
}

export function buildRegisterArtifact(input: RegisterArtifactInput): VaultExportArtifact {
  const sortedItems = [...input.items].sort((a, b) => a.title.localeCompare(b.title, 'nb'))
  return {
    path: input.path,
    content: buildGeneratedNote({
      title: input.title,
      frontmatter: {
        type: input.type,
        status: 'generert',
        kilde: input.source,
        siterbarhet: 'intern',
      },
      body: [
        `> ${input.intro}`,
        '',
        '## Omfang',
        '',
        `- Noder: ${sortedItems.length}`,
        '',
        '## Noder',
        '',
        ...listOrPlaceholder(
          sortedItems,
          (item) =>
            `- ${item.target ? wikiLinkForTarget(item.target, item.title) : wikiLinkForTitle(item.title)}${item.detail ? ` — ${item.detail}` : ''}`,
        ),
        '',
        '## Koblinger',
        '',
        ...listOrPlaceholder(input.links, (link) => `- ${wikiLinkForTitle(link)}`),
      ],
    }),
  }
}

export function buildVaultExportArtifacts(input: VaultExportArtifactsInput): {
  files: VaultExportArtifact[]
  summary: {
    companies: number
    ownershipEdges: number
    boardMembers: number
    businessRelationships: number
    properties: number
    personNotes: number
    concernCanvases: number
  }
  summaryLine: string
} {
  const files: VaultExportArtifact[] = []
  const companiesById = new Map(input.companies.map((company) => [company.id, company]))
  const companyTitleById = buildCompanyNoteTitleIndex(input.companies)
  const companyLink = (companyId: string, fallback: string) => {
    const company = companiesById.get(companyId)
    const targetTitle = companyTitleById.get(companyId) ?? fallback
    return wikiLinkForTitle(targetTitle, company?.name ?? fallback)
  }
  const ownershipByParent = groupBy(input.ownershipEdges, (edge) => edge.parentCompanyId)
  const ownershipByChild = groupBy(input.ownershipEdges, (edge) => edge.childCompanyId)
  const boardByCompany = groupBy(input.boardMembers, (member) => member.companyId)
  const relationshipsFrom = groupBy(input.businessRelationships, (relationship) => relationship.fromCompanyId)
  const relationshipsTo = groupBy(input.businessRelationships, (relationship) => relationship.toCompanyId)
  const propertiesByCompany = groupBy(input.properties, (property) => property.companyId)
  const forestByRoot = new Map(input.ownershipForest.map((root) => [root.id, root]))
  const companyTierById = buildCompanyTierIndex(input)
  const corePersonNames = new Set(input.corePersonNames ?? [])

  for (const company of input.companies) {
    const parents = ownershipByChild.get(company.id) ?? []
    const children = ownershipByParent.get(company.id) ?? []
    const roles = boardByCompany.get(company.id) ?? []
    const outbound = relationshipsFrom.get(company.id) ?? []
    const inbound = relationshipsTo.get(company.id) ?? []
    const properties = propertiesByCompany.get(company.id) ?? []
    const forest = forestByRoot.get(company.id)
    const tier = companyTierById.get(company.id) ?? 'periferi'
    const ownershipLines = [
      ...parents.map((edge) => `- Eier: ${companyLink(edge.parentCompanyId, edge.parentName)} — ${formatPct(edge.ownershipPct)} (${edge.ownershipType ?? 'ukjent'})`),
      ...children.map((edge) => `- ${companyLink(edge.childCompanyId, edge.childName)} — ${formatPct(edge.ownershipPct)} (${edge.ownershipType ?? 'ukjent'})`),
    ]
    const supplyChainLines = [
      ...outbound.map((relationship) => `- ${relationship.relationshipType} → ${companyLink(relationship.toCompanyId, relationship.toCompanyName)}${relationship.description ? ` — ${relationship.description}` : ''}`),
      ...inbound.map((relationship) => `- ${companyLink(relationship.fromCompanyId, relationship.fromCompanyName)} → ${relationship.relationshipType}${relationship.description ? ` — ${relationship.description}` : ''}`),
    ]
    const body = [
      '> DB-generert selskapsnode · Del av [[Maktkartet]]',
      '',
      '## Basisdata',
      '',
      `- Orgnr: ${company.orgNr}`,
      `- Land: ${company.country}`,
      `- Verdikjedeledd: ${company.valueChainStage ?? 'ukjent'}`,
      `- Klassifisering: ${company.classification ?? 'ukjent'}`,
      `- NACE: ${formatNullable(company.naceCode)}${company.naceDescription ? ` — ${company.naceDescription}` : ''}`,
      `- Research-konstrukt: ${company.isResearchConstruct ? 'ja' : 'nei'}`,
      '',
      '## Eierskap',
      '',
      ...listOrPlaceholderLines(ownershipLines),
      '',
      ...(forest && forest.children.length > 0
        ? ['## Konserntre', '', ...renderForest(forest.children, 0, companyTitleById), '']
        : []),
      '## Styreverv',
      '',
      ...listOrPlaceholder(roles, (member) => `- ${member.personName} — ${member.role}`),
      '',
      '## Forsyningskjede',
      '',
      ...listOrPlaceholderLines(supplyChainLines),
      '',
      '## Eiendom',
      '',
      ...listOrPlaceholder(properties, (property) => `- ${property.propertyType}: ${[property.address, property.municipality].filter(Boolean).join(', ') || property.country}${property.sqMeters ? ` (${property.sqMeters} m2)` : ''}`),
      '',
      '## Koblinger',
      '',
      '- [[Maktkartet]]',
      '- [[Eierskapsregisteret]]',
    ]

    files.push({
      path: companyNotePath(companyTitleById.get(company.id) ?? company.name, tier),
      content: buildGeneratedNote({
        title: company.name,
        frontmatter: {
          type: 'aktor',
          status: 'generert',
          kilde: 'data/vault-export/companies.json',
          siterbarhet: 'intern',
          orgnr: company.orgNr,
          tier,
        },
        body,
      }),
    })
  }

  files.push({
    path: join('11 Maktkart', 'Selskapsregister.md'),
    content: buildGeneratedNote({
      title: 'Selskapsregister',
      frontmatter: {
        type: 'aktor',
        status: 'generert',
        kilde: 'data/vault-export/companies.json',
        siterbarhet: 'intern',
      },
      body: [
        '> DB-generert register over alle selskapsnoder i vault-exporten · Del av [[Maktkartet]]',
        '',
        '## Omfang',
        '',
        `- Selskaper: ${input.manifest.counts.companies}`,
        '',
        '## Selskaper',
        '',
        ...listOrPlaceholder(
          [...input.companies].sort((a, b) => a.name.localeCompare(b.name, 'nb')),
          (company) => {
            const title = companyTitleById.get(company.id) ?? company.name
            const stage = company.valueChainStage ?? 'ukjent'
            const classification = company.classification ?? company.legalForm ?? 'ukjent'
            return `- ${wikiLinkForTitle(title, company.name)} — ${stage} · ${classification} · ${company.orgNr}`
          },
        ),
        '',
        '## Koblinger',
        '',
        '- [[Maktkartet]]',
        '- [[Eierskapsregisteret]]',
        '- [[Prisma-database]]',
      ],
    }),
  })

  files.push({
    path: join('11 Maktkart', 'Eierskapsregisteret.md'),
    content: buildGeneratedNote({
      title: 'Eierskapsregisteret',
      frontmatter: {
        type: 'seksjon',
        status: 'generert',
        kilde: 'data/vault-export/ownership-edges.json',
        siterbarhet: 'intern',
      },
      body: [
        '> DB-generert register over eierskapskanter · Del av [[Maktkartet]]',
        '',
        '## Omfang',
        '',
        `- Selskaper: ${input.manifest.counts.companies}`,
        `- Eierskapskanter: ${input.manifest.counts.ownershipEdges}`,
        '',
        '## Kanter',
        '',
        ...listOrPlaceholder(
          input.ownershipEdges,
          (edge) =>
            `- ${companyLink(edge.parentCompanyId, edge.parentName)} → ${companyLink(edge.childCompanyId, edge.childName)} — ${formatPct(edge.ownershipPct)} (${edge.ownershipType ?? 'ukjent'})${edge.source ? ` · kilde: ${edge.source}` : ''}`,
        ),
        '',
        '## Koblinger',
        '',
        '- [[Maktkartet]]',
        '- [[Prisma-database]]',
      ],
    }),
  })

  const rolesByPerson = groupBy(input.boardMembers, (member) => member.personKey)
  const interlockers = [...rolesByPerson.values()]
    .filter((roles) => roles.length >= 2)
    .sort((a, b) => b.length - a.length || a[0].personName.localeCompare(b[0].personName, 'nb'))

  files.push({
    path: join('11 Maktkart', 'Personregister.md'),
    content: buildGeneratedNote({
      title: 'Personregister',
      frontmatter: {
        type: 'person',
        status: 'generert',
        kilde: 'data/vault-export/board-members.json',
        siterbarhet: 'intern',
      },
      body: [
        '> DB-generert register over interlockere med minst to styreverv.',
        '',
        '## Interlockere',
        '',
        ...listOrPlaceholder(interlockers, (roles) => `- [[${roles[0].personName}]] — ${roles.length} verv`),
        '',
        AP1_USAGE_RULE,
        '',
        '## Koblinger',
        '',
        '- [[Maktkartet]]',
      ],
    }),
  })

  for (const roles of interlockers) {
    const personName = roles[0].personName
    const tier = personTier(roles, corePersonNames)
    files.push({
      path: personNotePath(personName, tier),
      content: buildGeneratedNote({
        title: personName,
        frontmatter: {
          type: 'person',
          status: 'generert',
          kilde: 'data/vault-export/board-members.json',
          siterbarhet: 'intern',
          verv: roles.length,
          tier,
        },
        body: [
          `> Styrenettverk · ${roles.length} verv · Del av [[Maktkartet]]`,
          '',
          '## Styreverv',
          '',
          ...roles
            .sort((a, b) => a.companyName.localeCompare(b.companyName, 'nb'))
            .map((role) => `- ${companyLink(role.companyId, role.companyName)} — ${role.role}`),
          '',
          AP1_USAGE_RULE,
          '',
          'Kilde: `data/vault-export/board-members.json`',
        ],
      }),
    })
  }

  const concernRoots = input.ownershipForest.filter((root) => root.children.length > 0)
  for (const root of concernRoots) {
    files.push({
      path: join('0 Kart', 'Konsern', `${noteFileName(companyTitleById.get(root.id) ?? root.name).replace(/\.md$/, '')}.canvas`),
      content: `${JSON.stringify(buildConcernCanvas(root, companyTitleById, companyTierById), null, 2)}\n`,
    })
  }

  const summary = {
    companies: input.companies.length,
    ownershipEdges: input.ownershipEdges.length,
    boardMembers: input.boardMembers.length,
    businessRelationships: input.businessRelationships.length,
    properties: input.properties.length,
    personNotes: interlockers.length,
    concernCanvases: concernRoots.length,
  }
  const summaryLine = [
    'vault:sync export',
    `companies=${summary.companies}`,
    `ownershipEdges=${summary.ownershipEdges}`,
    `boardMembers=${summary.boardMembers}`,
    `businessRelationships=${summary.businessRelationships}`,
    `properties=${summary.properties}`,
    `personNotes=${summary.personNotes}`,
    `concernCanvases=${summary.concernCanvases}`,
  ].join(' ')

  return { files, summary, summaryLine }
}

function sourceTitle(sourcePath: string): string {
  return basename(sourcePath).replace(/\.(md|txt|html)$/i, '')
}

export function validateVault(
  vaultPath: string,
  options: VaultValidationOptions = {},
): { issues: VaultIssue[] } {
  const issues: VaultIssue[] = []
  const markdownFiles = walkFiles(vaultPath, (file) => file.endsWith('.md'))
  const canvasFiles = walkFiles(vaultPath, (file) => file.endsWith('.canvas'))
  const noteTypes = new Map<string, string>()
  for (const file of markdownFiles) {
    noteTypes.set(basename(file, '.md'), parseFrontmatter(readFileSync(file, 'utf8')).frontmatter.type ?? '')
  }
  const linkTargets = new Set([
    ...markdownFiles.map((file) => basename(file, '.md')),
    ...markdownFiles.map((file) => relative(vaultPath, file).replace(/\.md$/i, '')),
    ...walkFiles(vaultPath, () => true).map((file) => basename(file)),
    ...walkFiles(vaultPath, () => true).map((file) => relative(vaultPath, file)),
  ])

  for (const file of markdownFiles) {
    const source = readFileSync(file, 'utf8')
    const rel = relative(vaultPath, file)
    const parsed = parseFrontmatter(source)

    for (const field of REQUIRED_FRONTMATTER) {
      if (!parsed.frontmatter[field]) {
        issues.push({ file: rel, message: `missing frontmatter field ${field}` })
      }
    }

    if (!source.includes(`\n${NOTES_MARKER}\n`) && !source.startsWith(`${NOTES_MARKER}\n`)) {
      issues.push({ file: rel, message: `missing ${NOTES_MARKER} section` })
    }

    for (const link of extractWikiLinks(source)) {
      if (!linkTargets.has(link)) {
        issues.push({ file: rel, message: `broken wikilink [[${link}]]` })
      }
    }

    validateDataviewFromPaths(vaultPath, rel, source, issues)

    if (parsed.frontmatter.type === 'innsikt') {
      const hasSourceNoteLink = extractWikiLinks(source).some((link) => noteTypes.get(link) === 'kilde')
      if (!hasSourceNoteLink) {
        issues.push({ file: rel, message: 'insight note must link at least one source note' })
      }
      validateM2SelfContainedInsightNote(rel, source, issues)
    }

    if (
      options.requireGapMissions &&
      parsed.frontmatter.type === 'gap' &&
      inferTitle(source, rel).startsWith('Gap –')
    ) {
      const mission = parsed.frontmatter.mission
      if (!mission && !source.includes('research/RESEARCH-MISSIONS.md')) {
        issues.push({ file: rel, message: 'gap note must reference a research mission' })
      }
    }

    if (
      options.requirePersonUsageRule &&
      parsed.frontmatter.type === 'person' &&
      (rel === join('11 Maktkart', 'Personregister.md') || rel.startsWith(join('11 Maktkart', 'Personer') + '/')) &&
      !source.includes(AP1_USAGE_RULE)
    ) {
      issues.push({ file: rel, message: 'person note must preserve AP-1 usage rule' })
    }

    if (
      options.requireMetadataOnlySources &&
      parsed.frontmatter.type === 'mote' &&
      (rel.startsWith(join('12 Kilder', 'Møter') + '/') ||
        rel.startsWith(join('12 Kilder', 'Transkripter') + '/')) &&
      (!source.includes('metadata-only') || !source.includes('Vault-noten kopierer ikke fulltekst'))
    ) {
      issues.push({ file: rel, message: 'source note must stay metadata-only' })
    }
  }

  for (const file of canvasFiles) {
    const rel = relative(vaultPath, file)
    try {
      const parsed = JSON.parse(readFileSync(file, 'utf8')) as { nodes?: unknown; edges?: unknown }
      if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
        issues.push({ file: rel, message: 'canvas must contain nodes and edges arrays' })
      }
      if (Array.isArray(parsed.nodes)) {
        validateCanvasFileTargets(vaultPath, rel, parsed.nodes, issues)
        validateCanvasNodeOverlaps(rel, parsed.nodes, issues)
      }
      if (Array.isArray(parsed.nodes) && Array.isArray(parsed.edges)) {
        validateCanvasEdgeTargets(rel, parsed.nodes, parsed.edges, issues)
      }
    } catch {
      issues.push({ file: rel, message: 'invalid canvas JSON' })
    }
  }

  if (options.requirePresentationAssets) {
    const cssSnippetPath = '.obsidian/snippets/kunnskapskart.css'
    for (const asset of [
      '0 Kart/Oppsett.md',
      '.obsidian/graph.json',
      cssSnippetPath,
      '0 Kart/Temakart/Sirkularitet.canvas',
      '0 Kart/Temakart/Norden.canvas',
    ]) {
      if (!existsSync(join(vaultPath, asset))) {
        issues.push({ file: asset, message: `missing presentation asset ${asset}` })
      }
    }
    validateCssSnippet(vaultPath, cssSnippetPath, issues)
    validateObsidianSetupNote(vaultPath, issues)
    validateGraphColorGroups(vaultPath, issues)
  }

  validateVaultRootHygiene(vaultPath, issues)
  validateFlatManagedFolders(vaultPath, issues)

  if (options.requireVaultExport) {
    const manifestPath = join(dirname(vaultPath), 'data', 'vault-export', 'manifest.json')
    if (!existsSync(manifestPath)) {
      issues.push({ file: 'data/vault-export/manifest.json', message: 'missing vault export manifest' })
    } else {
      const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
        counts?: { companies?: number }
      }
      const expectedCompanies = manifest.counts?.companies
      if (typeof expectedCompanies === 'number') {
        const dbCompanyNotes = markdownFiles.filter((file) => {
          if (!relative(vaultPath, file).startsWith(join('11 Maktkart', 'Selskaper') + '/')) return false
          const parsed = parseFrontmatter(readFileSync(file, 'utf8'))
          return parsed.frontmatter.kilde === 'data/vault-export/companies.json'
        }).length
        if (dbCompanyNotes !== expectedCompanies) {
          issues.push({
            file: 'data/vault-export/manifest.json',
            message: `expected ${expectedCompanies} DB company notes, found ${dbCompanyNotes}`,
          })
        }
      }
    }
  }

  if (options.requireNoOrphans) {
    validateNoOrphans(vaultPath, markdownFiles, issues, new Set(options.allowedOrphanPaths ?? []))
  }

  if (options.requireInsightCandidateGate) {
    validatePendingInsightCandidateGate(vaultPath, markdownFiles, issues)
  }

  return { issues }
}

function validateM2SelfContainedInsightNote(rel: string, source: string, issues: VaultIssue[]) {
  if (!rel.startsWith(join('10 Innsiktskart', 'Innsikter') + '/')) return

  const requiredSnippets = M2_SELF_CONTAINED_INSIGHT_REQUIREMENTS.get(inferTitle(source, rel))
  if (!requiredSnippets) return

  if (!/^## Tallgrunnlag og forbehold$/m.test(source)) {
    issues.push({ file: rel, message: 'M2 insight note must include ## Tallgrunnlag og forbehold' })
  }

  for (const snippet of requiredSnippets) {
    if (!source.includes(snippet)) {
      issues.push({ file: rel, message: `M2 insight note is missing required evidence text: ${snippet}` })
    }
  }
}

const AP1_USAGE_RULE =
  '⚠️ _Bruksregel (fra AP-1): «makt» betyr strukturell posisjon i styregrafen, ikke intensjon, samordning eller ulovlighet. Personnavn er offentlige rolledata, men aktørspesifikke formuleringer går gjennom claim-lock/PCQ før ekstern bruk._'

function groupBy<T>(items: T[], keyFor: (item: T) => string): Map<string, T[]> {
  const groups = new Map<string, T[]>()
  for (const item of items) {
    const key = keyFor(item)
    const group = groups.get(key) ?? []
    group.push(item)
    groups.set(key, group)
  }
  return groups
}

function formatNullable(value: string | null): string {
  return value ?? 'ukjent'
}

function formatPct(value: number | null): string {
  return value == null ? 'ukjent %' : `${Number.isInteger(value) ? value : value.toFixed(2)} %`
}

function listOrPlaceholder<T>(items: T[], render: (item: T) => string): string[] {
  if (items.length === 0) return ['- Ingen registrert i eksporten.']
  return items.map(render)
}

function listOrPlaceholderLines(lines: string[]): string[] {
  return lines.length === 0 ? ['- Ingen registrert i eksporten.'] : lines
}

function companyNotePath(title: string, tier: 'kjerne' | 'periferi'): string {
  return tier === 'periferi'
    ? join('11 Maktkart', 'Selskaper', 'Register', noteFileName(title))
    : join('11 Maktkart', 'Selskaper', noteFileName(title))
}

function personNotePath(title: string, tier: 'kjerne' | 'periferi'): string {
  return tier === 'periferi'
    ? join('11 Maktkart', 'Personer', 'Register', noteFileName(title))
    : join('11 Maktkart', 'Personer', noteFileName(title))
}

function buildCompanyTierIndex(input: VaultExportArtifactsInput): Map<string, 'kjerne' | 'periferi'> {
  const coreCompanyIds = new Set(input.coreCompanyIds ?? [])
  const coreCompanyNames = new Set(input.coreCompanyNames ?? [])
  const relationshipCompanyIds = new Set(
    input.businessRelationships.flatMap((relationship) => [relationship.fromCompanyId, relationship.toCompanyId]),
  )

  const tiers = new Map<string, 'kjerne' | 'periferi'>()
  for (const company of input.companies) {
    const isCore =
      coreCompanyIds.has(company.id) ||
      coreCompanyNames.has(company.name) ||
      (company.isResearchConstruct && relationshipCompanyIds.has(company.id))

    tiers.set(company.id, isCore ? 'kjerne' : 'periferi')
  }

  return tiers
}

function personTier(
  roles: VaultExportArtifactsInput['boardMembers'],
  corePersonNames: Set<string>,
): 'kjerne' | 'periferi' {
  return corePersonNames.has(roles[0]?.personName ?? '') ? 'kjerne' : 'periferi'
}

function renderForest(nodes: OwnershipForestNode[], depth: number, companyTitleById = new Map<string, string>()): string[] {
  const lines: string[] = []
  for (const node of nodes) {
    lines.push(`${'  '.repeat(depth)}- ${wikiLinkForTitle(companyTitleById.get(node.id) ?? node.name, node.name)} (${formatPct(node.ownershipPct)})`)
    lines.push(...renderForest(node.children, depth + 1, companyTitleById))
  }
  return lines
}

function wikiLinkForTitle(title: string, display = title): string {
  const target = noteFileName(title).replace(/\.md$/, '')
  return target === display ? `[[${display}]]` : `[[${target}|${display}]]`
}

function wikiLinkForTarget(target: string, display: string): string {
  return target === display ? `[[${display}]]` : `[[${target}|${display}]]`
}

function actorNoteTitleFor(
  actor: string,
  actorNoteTitles: Set<string>,
  actorNoteAliases: Map<string, string>,
): string | null {
  const alias = actorNoteAliases.get(actor)
  if (alias && actorNoteTitles.has(alias)) return alias
  return actorNoteTitles.has(actor) ? actor : null
}

function cleanFrontmatterValue(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

function validateCssSnippet(vaultPath: string, cssSnippetPath: string, issues: VaultIssue[]) {
  const absolutePath = join(vaultPath, cssSnippetPath)
  if (!existsSync(absolutePath)) return

  try {
    postcss.parse(readFileSync(absolutePath, 'utf8'), { from: absolutePath })
  } catch (error) {
    const message = error instanceof Error ? error.message.split('\n')[0] : 'unknown parse error'
    issues.push({ file: cssSnippetPath, message: `invalid CSS snippet: ${message}` })
  }
}

function validateObsidianSetupNote(vaultPath: string, issues: VaultIssue[]) {
  const setupPath = '0 Kart/Oppsett.md'
  const absolutePath = join(vaultPath, setupPath)
  if (!existsSync(absolutePath)) return

  const source = readFileSync(absolutePath, 'utf8')
  for (const plugin of REQUIRED_OBSIDIAN_PLUGIN_RECOMMENDATIONS) {
    if (!source.includes(plugin)) {
      issues.push({
        file: setupPath,
        message: `missing required Obsidian plugin recommendation ${plugin}`,
      })
    }
  }

  if (!REQUIRED_OBSIDIAN_PRESENTATION_PLUGIN_ALTERNATIVES.some((plugin) => source.includes(plugin))) {
    issues.push({
      file: setupPath,
      message: `missing required Obsidian presentation plugin recommendation ${REQUIRED_OBSIDIAN_PRESENTATION_PLUGIN_ALTERNATIVES.join(' or ')}`,
    })
  }

  for (const requiredText of REQUIRED_OBSIDIAN_M3_SETUP_TEXT) {
    if (!source.includes(requiredText)) {
      issues.push({
        file: setupPath,
        message: `missing M3 setup text ${requiredText}`,
      })
    }
  }
}

function validateGraphColorGroups(vaultPath: string, issues: VaultIssue[]) {
  const graphPath = join(vaultPath, '.obsidian', 'graph.json')
  if (!existsSync(graphPath)) return

  try {
    const graph = JSON.parse(readFileSync(graphPath, 'utf8')) as {
      colorGroups?: Array<{ query?: unknown }>
    }
    const queries = new Set((graph.colorGroups ?? []).map((group) => group.query).filter(Boolean))
    for (const query of queries) {
      if (typeof query !== 'string') continue
      const pathTarget = query.match(/^path:"([^"]+)"$/)?.[1]
      if (pathTarget && !existsSync(join(vaultPath, pathTarget))) {
        issues.push({
          file: '.obsidian/graph.json',
          message: `graph color group targets missing vault folder ${pathTarget}`,
        })
      }
    }
    for (const group of REQUIRED_GRAPH_COLOR_GROUPS) {
      if (!queries.has(group.query)) {
        issues.push({
          file: '.obsidian/graph.json',
          message: `missing graph color group ${group.query}`,
        })
      }
    }
  } catch {
    issues.push({ file: '.obsidian/graph.json', message: 'invalid graph JSON' })
  }
}

function validateVaultRootHygiene(vaultPath: string, issues: VaultIssue[]) {
  for (const file of walkFiles(vaultPath, (candidate) => candidate.endsWith('.md'))) {
    const rel = relative(vaultPath, file)
    if (rel.includes('/')) continue
    const name = basename(file)
    if (/^Untitled/i.test(name) || /^\d{4}-\d{2}-\d{2}\.md$/.test(name)) {
      issues.push({ file: rel, message: 'loose workspace note is not allowed in vault root' })
    }
  }
}

function validateFlatManagedFolders(vaultPath: string, issues: VaultIssue[]) {
  for (const folder of RESTRICTED_FLAT_VAULT_FOLDERS) {
    const absoluteRoot = join(vaultPath, folder.relPath)
    if (!existsSync(absoluteRoot)) continue
    for (const file of walkFiles(absoluteRoot, (candidate) => candidate.endsWith('.md'))) {
      const relFromRoot = relative(absoluteRoot, file)
      const parts = relFromRoot.split('/')
      if (parts.length <= 1) continue
      if (parts.length === 2 && folder.allowedSubfolders.has(parts[0])) continue
      issues.push({
        file: relative(vaultPath, file),
        message: `managed folder ${folder.relPath} must stay flat${folder.allowedSubfolders.size > 0 ? ' except allowed Register folder' : ''}`,
      })
    }
  }
}

function validateNoOrphans(
  vaultPath: string,
  markdownFiles: string[],
  issues: VaultIssue[],
  allowedOrphanPaths: Set<string>,
) {
  const targetToRelPaths = new Map<string, string[]>()
  const inboundCounts = new Map<string, number>()

  for (const file of markdownFiles) {
    const rel = relative(vaultPath, file)
    inboundCounts.set(rel, 0)
    for (const target of [basename(file, '.md'), rel.replace(/\.md$/i, '')]) {
      const paths = targetToRelPaths.get(target) ?? []
      paths.push(rel)
      targetToRelPaths.set(target, paths)
    }
  }

  for (const file of markdownFiles) {
    const sourceRel = relative(vaultPath, file)
    const source = readFileSync(file, 'utf8')
    for (const link of extractWikiLinks(source)) {
      for (const targetRel of targetToRelPaths.get(link) ?? []) {
        if (targetRel !== sourceRel) {
          inboundCounts.set(targetRel, (inboundCounts.get(targetRel) ?? 0) + 1)
        }
      }
    }
  }

  for (const [rel, count] of inboundCounts.entries()) {
    if (count === 0 && !allowedOrphanPaths.has(rel)) {
      issues.push({ file: rel, message: 'orphan note has no inbound links' })
    }
  }
}

function validatePendingInsightCandidateGate(vaultPath: string, markdownFiles: string[], issues: VaultIssue[]) {
  const candidatePath = join(dirname(vaultPath), INSIGHT_CANDIDATE_GATE_PATH)
  if (!existsSync(candidatePath)) {
    issues.push({
      file: INSIGHT_CANDIDATE_GATE_PATH,
      message: 'missing I27+ candidate approval gate',
    })
    return
  }

  const pendingIds = parsePendingInsightCandidateIds(readFileSync(candidatePath, 'utf8'))
  if (pendingIds.size === 0) return

  for (const file of markdownFiles) {
    const rel = relative(vaultPath, file)
    if (!rel.startsWith(join('10 Innsiktskart', 'Innsikter') + '/')) continue
    const title = basename(file, '.md')
    const pendingId = [...pendingIds].find((id) => new RegExp(`^${escapeRegExp(id)}(?:\\b|\\s)`).test(title))
    if (pendingId) {
      issues.push({
        file: rel,
        message: `pending insight candidate ${pendingId} must not be generated before approval`,
      })
    }
  }
}

function validateCanvasFileTargets(vaultPath: string, canvasRelPath: string, nodes: unknown[], issues: VaultIssue[]) {
  for (const node of nodes) {
    if (!node || typeof node !== 'object') continue
    const record = node as Record<string, unknown>
    if (record.type !== 'file' || typeof record.file !== 'string') continue
    if (!existsSync(join(vaultPath, record.file))) {
      issues.push({
        file: canvasRelPath,
        message: `canvas file node targets missing file ${record.file}`,
      })
    }
  }
}

function validateCanvasNodeOverlaps(canvasRelPath: string, nodes: unknown[], issues: VaultIssue[]) {
  const rects: Array<{ id: string; x: number; y: number; width: number; height: number }> = []

  for (const [index, node] of nodes.entries()) {
    if (!node || typeof node !== 'object') continue
    const record = node as Record<string, unknown>
    if (record.type === 'group') continue
    if (
      typeof record.x !== 'number' ||
      typeof record.y !== 'number' ||
      typeof record.width !== 'number' ||
      typeof record.height !== 'number'
    ) {
      continue
    }
    if (record.width <= 0 || record.height <= 0) continue
    rects.push({
      id: typeof record.id === 'string' ? record.id : `node-${index}`,
      x: record.x,
      y: record.y,
      width: record.width,
      height: record.height,
    })
  }

  for (let index = 0; index < rects.length; index += 1) {
    for (let otherIndex = index + 1; otherIndex < rects.length; otherIndex += 1) {
      const first = rects[index]
      const second = rects[otherIndex]
      const overlapWidth = Math.min(first.x + first.width, second.x + second.width) - Math.max(first.x, second.x)
      const overlapHeight = Math.min(first.y + first.height, second.y + second.height) - Math.max(first.y, second.y)
      if (overlapWidth > 0 && overlapHeight > 0) {
        issues.push({
          file: canvasRelPath,
          message: `canvas nodes overlap ${first.id} and ${second.id} (${formatCanvasOverlap(overlapWidth)}x${formatCanvasOverlap(overlapHeight)})`,
        })
      }
    }
  }
}

function validateCanvasEdgeTargets(canvasRelPath: string, nodes: unknown[], edges: unknown[], issues: VaultIssue[]) {
  const nodeIds = new Set<string>()
  for (const node of nodes) {
    if (!node || typeof node !== 'object') continue
    const id = (node as Record<string, unknown>).id
    if (typeof id === 'string') nodeIds.add(id)
  }

  for (const [index, edge] of edges.entries()) {
    if (!edge || typeof edge !== 'object') continue
    const record = edge as Record<string, unknown>
    const id = typeof record.id === 'string' ? record.id : `edge-${index}`
    for (const field of ['fromNode', 'toNode'] as const) {
      const target = record[field]
      if (typeof target === 'string' && !nodeIds.has(target)) {
        issues.push({
          file: canvasRelPath,
          message: `canvas edge ${id} targets missing node ${target}`,
        })
      }
    }
  }
}

function formatCanvasOverlap(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(2)
}

function validateDataviewFromPaths(vaultPath: string, noteRelPath: string, source: string, issues: VaultIssue[]) {
  const blocks = extractDataviewBlocks(source, noteRelPath, issues)
  validateDataviewQueryTypes(noteRelPath, blocks, issues)
  for (const folder of extractDataviewFromFolders(blocks)) {
    if (!existsSync(join(vaultPath, folder))) {
      issues.push({
        file: noteRelPath,
        message: `Dataview FROM targets missing vault folder ${folder}`,
      })
    }
  }
}

function extractDataviewFromFolders(blocks: string[]): string[] {
  const folders = new Set<string>()
  for (const block of blocks) {
    for (const from of block.matchAll(/\bFROM\s+"([^"]+)"/gi)) {
      const folder = from[1].trim()
      if (folder) {
        folders.add(folder)
      }
    }
  }
  return [...folders]
}

function extractDataviewBlocks(source: string, noteRelPath: string, issues: VaultIssue[]): string[] {
  const blocks: string[] = []
  const lines = source.split('\n')
  for (let index = 0; index < lines.length; index += 1) {
    if (lines[index].trim().toLocaleLowerCase('nb') !== '```dataview') continue

    const blockLines: string[] = []
    let closed = false
    for (let cursor = index + 1; cursor < lines.length; cursor += 1) {
      if (lines[cursor].trim() === '```') {
        index = cursor
        closed = true
        break
      }
      blockLines.push(lines[cursor])
    }

    if (closed) {
      blocks.push(blockLines.join('\n'))
    } else {
      issues.push({ file: noteRelPath, message: 'Dataview block is missing closing fence' })
      break
    }
  }
  return blocks
}

function validateDataviewQueryTypes(noteRelPath: string, blocks: string[], issues: VaultIssue[]) {
  for (const block of blocks) {
    const firstStatement = block
      .split('\n')
      .map((line) => line.trim())
      .find((line) => line && !line.startsWith('//'))
    if (!firstStatement) {
      issues.push({ file: noteRelPath, message: 'Dataview block is empty' })
      continue
    }

    const queryType = firstStatement.split(/\s+/, 1)[0]?.toLocaleUpperCase('nb')
    if (!DATAVIEW_QUERY_TYPES.has(queryType)) {
      issues.push({ file: noteRelPath, message: 'Dataview block is missing query type' })
    }
  }
}

function parsePendingInsightCandidateIds(source: string): Set<string> {
  const pendingIds = new Set<string>()
  for (const line of source.split('\n')) {
    const cells = line
      .split('|')
      .map((cell) => cell.trim())
      .filter(Boolean)
    if (cells.length < 5) continue
    const id = cells[0]
    const status = cells[cells.length - 1].toLocaleLowerCase('nb')
    if (/^I\d{2,}$/.test(id) && status === 'til godkjenning') {
      pendingIds.add(id)
    }
  }
  return pendingIds
}

function buildCompanyNoteTitleIndex(
  companies: VaultExportArtifactsInput['companies'],
): Map<string, string> {
  const groups = groupBy(companies, (company) => company.name.trim().toLocaleLowerCase('nb'))
  const titles = new Map<string, string>()
  for (const group of groups.values()) {
    for (const company of group) {
      titles.set(company.id, group.length > 1 ? `${company.name} (${company.orgNr})` : company.name)
    }
  }
  return titles
}

function buildConcernCanvas(
  root: OwnershipForestNode,
  companyTitleById: Map<string, string>,
  companyTierById: Map<string, 'kjerne' | 'periferi'>,
): { nodes: unknown[]; edges: unknown[] } {
  const nodes: Array<Record<string, unknown>> = []
  const edges: Array<Record<string, unknown>> = []
  let nextRow = 0
  const visit = (node: OwnershipForestNode, depth: number, parentId?: string) => {
    const nodeId = node.id
    const row = nextRow
    nextRow += 1
    nodes.push({
      id: nodeId,
      type: 'file',
      file: companyNotePath(companyTitleById.get(node.id) ?? node.name, companyTierById.get(node.id) ?? 'kjerne'),
      x: depth * 360,
      y: row * 160,
      width: 260,
      height: 90,
    })
    if (parentId) {
      edges.push({
        id: `${parentId}-${nodeId}`,
        fromNode: parentId,
        toNode: nodeId,
        label: formatPct(node.ownershipPct),
      })
    }
    node.children.forEach((child) => visit(child, depth + 1, nodeId))
  }
  visit(root, 0)
  return { nodes, edges }
}

export function normalizeExistingNote(source: string, relPath: string): string {
  const parsed = parseFrontmatter(source)
  const frontmatter = { ...parsed.frontmatter }
  if (frontmatter.tags === '') {
    delete frontmatter.tags
  }
  const bodyWithoutFrontmatter = parsed.body.trimStart()
  const parts = splitAtNotes(bodyWithoutFrontmatter)
  const title = inferTitle(parts.head, relPath)
  const generated = buildGeneratedNote({
    title,
    frontmatter: {
      ...frontmatter,
      type: String(frontmatter.type ?? inferType(relPath, title)),
      status: String(frontmatter.status ?? 'generert'),
      kilde: String(frontmatter.kilde ?? 'scripts/obsidian-vault/sync.ts'),
      siterbarhet: String(frontmatter.siterbarhet ?? 'intern'),
    },
    body: stripTitle(parts.head),
  })

  return mergeGeneratedNote(generated, bodyWithoutFrontmatter)
}

export function validateReferencedPaths(
  repoRoot: string,
  documentPaths: string[],
  options: ReviewPreflightOptions = {},
): { issues: VaultIssue[] } {
  const vaultDirName = options.vaultDirName ?? 'Food Systems Obsidian'
  const issues: VaultIssue[] = []

  for (const documentPath of documentPaths) {
    const absoluteDocumentPath = join(repoRoot, documentPath)
    if (!existsSync(absoluteDocumentPath)) {
      issues.push({ file: documentPath, message: 'missing review document' })
      continue
    }

    const source = readFileSync(absoluteDocumentPath, 'utf8')
    for (const referencedPath of extractBacktickPathReferences(source)) {
      const candidates = referencedPath.startsWith(`${vaultDirName}/`)
        ? [join(repoRoot, referencedPath)]
        : [join(repoRoot, referencedPath), join(repoRoot, vaultDirName, referencedPath)]

      if (!candidates.some((candidate) => existsSync(candidate))) {
        issues.push({
          file: documentPath,
          message: `missing referenced repo/vault path \`${referencedPath}\``,
        })
      }
    }
  }

  return { issues }
}

export function validateReviewSamples(repoRoot: string, options: ReviewPreflightOptions = {}): { issues: VaultIssue[] } {
  const vaultDirName = options.vaultDirName ?? 'Food Systems Obsidian'
  const issues: VaultIssue[] = []
  const manifest = readReviewJson<VaultExportManifestReview>(repoRoot, 'data/vault-export/manifest.json', issues)
  const companies = readReviewJson<VaultExportCompanyReviewRow[]>(repoRoot, 'data/vault-export/companies.json', issues)
  const ownershipEdges = readReviewJson<VaultExportOwnershipReviewRow[]>(
    repoRoot,
    'data/vault-export/ownership-edges.json',
    issues,
  )
  const boardMembers = readReviewJson<VaultExportBoardReviewRow[]>(
    repoRoot,
    'data/vault-export/board-members.json',
    issues,
  )

  const norgesGruppen = companies?.find((company) => company.name === 'NorgesGruppen ASA')
  const norgesGruppenNotePath = join(vaultDirName, '11 Maktkart', 'Selskaper', 'NorgesGruppen ASA.md')
  const norgesGruppenNote = readReviewText(repoRoot, norgesGruppenNotePath, issues)
  if (norgesGruppen && norgesGruppenNote) {
    requireReviewText(
      norgesGruppenNotePath,
      norgesGruppenNote,
      norgesGruppen.orgNr ?? '',
      'missing sampled orgnr 819731322 from data/vault-export/companies.json',
      issues,
    )
    const childEdges =
      ownershipEdges?.filter(
        (edge) =>
          (norgesGruppen.id && edge.parentCompanyId === norgesGruppen.id) || edge.parentName === norgesGruppen.name,
      ) ?? []
    for (const edge of childEdges) {
      requireReviewText(
        norgesGruppenNotePath,
        norgesGruppenNote,
        edge.childName,
        `missing sampled ownership child ${edge.childName} from data/vault-export/ownership-edges.json`,
        issues,
      )
      requireReviewText(
        norgesGruppenNotePath,
        norgesGruppenNote,
        formatPct(edge.ownershipPct),
        `missing sampled ownership percentage for ${edge.childName} from data/vault-export/ownership-edges.json`,
        issues,
      )
      if (edge.ownershipType) {
        requireReviewText(
          norgesGruppenNotePath,
          norgesGruppenNote,
          edge.ownershipType,
          `missing sampled ownership type for ${edge.childName} from data/vault-export/ownership-edges.json`,
          issues,
        )
      }
    }
    const companyBoardMembers =
      boardMembers?.filter(
        (member) =>
          (norgesGruppen.id && member.companyId === norgesGruppen.id) || member.companyName === norgesGruppen.name,
      ) ?? []
    for (const member of companyBoardMembers) {
      requireReviewText(
        norgesGruppenNotePath,
        norgesGruppenNote,
        member.personName,
        `missing sampled board member ${member.personName} from data/vault-export/board-members.json`,
        issues,
      )
      requireReviewText(
        norgesGruppenNotePath,
        norgesGruppenNote,
        member.role,
        `missing sampled board role ${member.role} for ${member.personName} from data/vault-export/board-members.json`,
        issues,
      )
    }
  } else if (companies) {
    issues.push({
      file: norgesGruppenNotePath,
      message: 'missing sampled company NorgesGruppen ASA from data/vault-export/companies.json or vault note',
    })
  }

  const ownershipRegisterPath = join(vaultDirName, '11 Maktkart', 'Eierskapsregisteret.md')
  const ownershipRegister = readReviewText(repoRoot, ownershipRegisterPath, issues)
  if (ownershipRegister && manifest?.counts) {
    requireReviewText(
      ownershipRegisterPath,
      ownershipRegister,
      `- Selskaper: ${manifest.counts.companies}`,
      'missing manifest company count in ownership register',
      issues,
    )
    requireReviewText(
      ownershipRegisterPath,
      ownershipRegister,
      `- Eierskapskanter: ${manifest.counts.ownershipEdges}`,
      'missing manifest ownership edge count in ownership register',
      issues,
    )
  }
  if (ownershipRegister && ownershipEdges) {
    for (const edge of ownershipEdges) {
      requireReviewText(
        ownershipRegisterPath,
        ownershipRegister,
        edge.parentName,
        `missing ownership edge parent ${edge.parentName} from data/vault-export/ownership-edges.json`,
        issues,
      )
      requireReviewText(
        ownershipRegisterPath,
        ownershipRegister,
        edge.childName,
        `missing ownership edge child ${edge.childName} from data/vault-export/ownership-edges.json`,
        issues,
      )
      requireReviewText(
        ownershipRegisterPath,
        ownershipRegister,
        formatPct(edge.ownershipPct),
        `missing ownership edge percentage for ${edge.parentName} -> ${edge.childName}`,
        issues,
      )
    }
  }

  const companyRegisterPath = join(vaultDirName, '11 Maktkart', 'Selskapsregister.md')
  const companyRegister = readReviewText(repoRoot, companyRegisterPath, issues)
  if (companyRegister && manifest?.counts) {
    requireReviewText(
      companyRegisterPath,
      companyRegister,
      `- Selskaper: ${manifest.counts.companies}`,
      'missing manifest company count in company register',
      issues,
    )
  }
  if (companyRegister && companies) {
    for (const company of companies) {
      requireReviewText(
        companyRegisterPath,
        companyRegister,
        company.name,
        `missing company register entry ${company.name} from data/vault-export/companies.json`,
        issues,
      )
      requireReviewText(
        companyRegisterPath,
        companyRegister,
        company.orgNr ?? '',
        `missing company register orgnr for ${company.name} from data/vault-export/companies.json`,
        issues,
      )
    }
  }

  const companyFolderRegisterPath = join(vaultDirName, '11 Maktkart', 'Selskaper', 'Selskapsmappe-register.md')
  const companyFolderRegister = readReviewText(repoRoot, companyFolderRegisterPath, issues)
  if (companyFolderRegister && companies) {
    for (const company of companies) {
      requireReviewText(
        companyFolderRegisterPath,
        companyFolderRegister,
        company.name,
        `missing company folder register entry ${company.name}`,
        issues,
      )
    }
  }

  const personRegisterPath = join(vaultDirName, '11 Maktkart', 'Personregister.md')
  const personRegister = readReviewText(repoRoot, personRegisterPath, issues)
  if (personRegister) {
    requireReviewText(personRegisterPath, personRegister, AP1_USAGE_RULE, 'missing AP-1 usage rule in person register', issues)
  }
  if (personRegister && boardMembers) {
    const rolesByPerson = groupBy(boardMembers, (member) => member.personKey)
    for (const roles of rolesByPerson.values()) {
      if (roles.length < 2) continue
      const personName = roles[0].personName
      requireReviewText(
        personRegisterPath,
        personRegister,
        personName,
        `missing interlocker ${personName} from data/vault-export/board-members.json`,
        issues,
      )
      requireReviewText(
        personRegisterPath,
        personRegister,
        `${roles.length} verv`,
        `missing interlocker role count for ${personName}`,
        issues,
      )
    }
  }

  const meetingRegisterPath = join(vaultDirName, '12 Kilder', 'Møte- og transkriptregister.md')
  const meetingRegister = readReviewText(repoRoot, meetingRegisterPath, issues)
  if (meetingRegister) {
    requireReviewText(
      meetingRegisterPath,
      meetingRegister,
      'Fulltekst holdes i originalfilene',
      'missing metadata-only fulltext boundary in meeting/transcript register',
      issues,
    )
    for (const referencedPath of extractBacktickPathReferences(meetingRegister)) {
      if (!existsSync(join(repoRoot, referencedPath))) {
        issues.push({
          file: meetingRegisterPath,
          message: `missing meeting/transcript source path \`${referencedPath}\``,
        })
      }
    }
  }

  return { issues }
}

export function validateInsightCandidateApprovalGate(repoRoot: string): { issues: VaultIssue[] } {
  const issues: VaultIssue[] = []
  const absolutePath = join(repoRoot, INSIGHT_CANDIDATE_GATE_PATH)
  if (!existsSync(absolutePath)) {
    issues.push({
      file: INSIGHT_CANDIDATE_GATE_PATH,
      message: 'missing I27+ candidate approval gate',
    })
    return { issues }
  }

  const source = readFileSync(absolutePath, 'utf8')
  const frontmatter = parseFrontmatter(source).frontmatter
  const rows = parseInsightCandidateRows(source)
  for (const [id, row] of rows.entries()) {
    if (!row.title) {
      issues.push({
        file: INSIGHT_CANDIDATE_GATE_PATH,
        message: `missing I27+ candidate title for ${id}`,
      })
    }
    if (!row.sourceBasis) {
      issues.push({
        file: INSIGHT_CANDIDATE_GATE_PATH,
        message: `missing I27+ candidate source basis for ${id}`,
      })
    } else if (extractBacktickPathReferences(row.sourceBasis).length === 0) {
      issues.push({
        file: INSIGHT_CANDIDATE_GATE_PATH,
        message: `missing I27+ candidate source path for ${id}`,
      })
    }
    if (!row.rationale) {
      issues.push({
        file: INSIGHT_CANDIDATE_GATE_PATH,
        message: `missing I27+ candidate rationale for ${id}`,
      })
    }
    if (!ALLOWED_INSIGHT_CANDIDATE_STATUSES.has(row.status)) {
      issues.push({
        file: INSIGHT_CANDIDATE_GATE_PATH,
        message: `invalid I27+ candidate status for ${id}: ${row.status}`,
      })
    }
  }

  for (const id of REQUIRED_INSIGHT_CANDIDATE_IDS) {
    if (!rows.has(id)) {
      issues.push({
        file: INSIGHT_CANDIDATE_GATE_PATH,
        message: `missing I27+ candidate approval row ${id}`,
      })
    }
  }

  if (issues.length === 0 && frontmatter.status !== INSIGHT_CANDIDATE_GATE_STATUS) {
    issues.push({
      file: INSIGHT_CANDIDATE_GATE_PATH,
      message: `invalid I27+ candidate approval frontmatter status: ${frontmatter.status ?? ''}`,
    })
  }
  if (issues.length === 0) {
    for (const [field, expectedPath] of Object.entries(REQUIRED_INSIGHT_CANDIDATE_GATE_FRONTMATTER_LINKS)) {
      if (frontmatter[field] !== expectedPath) {
        issues.push({
          file: INSIGHT_CANDIDATE_GATE_PATH,
          message: `missing I27+ candidate approval frontmatter ${field}: ${expectedPath}`,
        })
      }
    }
  }
  if (issues.length === 0) {
    for (const requiredText of REQUIRED_INSIGHT_CANDIDATE_STOP_TEXT) {
      if (!source.includes(requiredText)) {
        issues.push({
          file: INSIGHT_CANDIDATE_GATE_PATH,
          message: `missing I27+ candidate approval stop text: ${requiredText}`,
        })
      }
    }
  }
  if (issues.length === 0) {
    for (const [field, expectedPath] of Object.entries(REQUIRED_INSIGHT_CANDIDATE_GATE_FRONTMATTER_LINKS)) {
      if (!existsSync(join(repoRoot, expectedPath))) {
        issues.push({
          file: INSIGHT_CANDIDATE_GATE_PATH,
          message: `missing I27+ candidate approval frontmatter target ${field}: ${expectedPath}`,
        })
      }
    }
  }

  return { issues }
}

export function validateReviewProtocolDecisionGate(repoRoot: string): { issues: VaultIssue[] } {
  const issues: VaultIssue[] = []
  const absolutePath = join(repoRoot, VK5_REVIEW_PROTOCOL_PATH)
  if (!existsSync(absolutePath)) {
    issues.push({
      file: VK5_REVIEW_PROTOCOL_PATH,
      message: 'missing VK-5 review protocol',
    })
    return { issues }
  }

  const source = readFileSync(absolutePath, 'utf8')
  const protocolFrontmatter = parseFrontmatter(source).frontmatter
  const protocolStatus = normalizeTableCell(protocolFrontmatter.status ?? '')
  const requiresResolvedReviewRows = REVIEW_PROTOCOL_CLOSEOUT_STATUSES.has(protocolStatus)
  if (!ALLOWED_REVIEW_PROTOCOL_FRONTMATTER_STATUSES.has(protocolStatus)) {
    issues.push({
      file: VK5_REVIEW_PROTOCOL_PATH,
      message: `invalid VK-5 review protocol frontmatter status: ${protocolStatus}`,
    })
  }

  for (const section of REQUIRED_REVIEW_PROTOCOL_SECTIONS) {
    if (!source.includes(section)) {
      issues.push({
        file: VK5_REVIEW_PROTOCOL_PATH,
        message: `missing VK-5 review protocol section ${section}`,
      })
    }
  }

  const reviewCandidateRows = new Set<string>()
  const reviewProtocolRowCounts = new Map<string, number>()
  for (const row of parseMarkdownTableRows(source)) {
    const id = row.cells[0]?.trim()
    if (id) {
      reviewProtocolRowCounts.set(id, (reviewProtocolRowCounts.get(id) ?? 0) + 1)
    }

    const statusIndex = row.headers.findIndex((header) => normalizeTableCell(header) === 'status')
    if (statusIndex >= 0 && row.cells[statusIndex]) {
      const status = normalizeTableCell(row.cells[statusIndex])
      if (status && !ALLOWED_REVIEW_PROTOCOL_STATUSES.has(status)) {
        issues.push({
          file: VK5_REVIEW_PROTOCOL_PATH,
          message: `invalid VK-5 review status for ${row.cells[0]}: ${status}`,
        })
      }
      if (requiresResolvedReviewRows && UNRESOLVED_REVIEW_PROTOCOL_STATUSES.has(status)) {
        issues.push({
          file: VK5_REVIEW_PROTOCOL_PATH,
          message: `VK-5 review protocol cannot be marked ${protocolStatus} with unresolved review status for ${row.cells[0]}: ${status}`,
        })
      }
    }

    const decisionIndex = row.headers.findIndex((header) => normalizeTableCell(header) === 'beslutning')
    if (decisionIndex >= 0 && row.cells[decisionIndex]) {
      const decision = normalizeTableCell(row.cells[decisionIndex])
      if (/^I\d{2,}$/.test(id)) {
        reviewCandidateRows.add(id)
        if (decision && !ALLOWED_REVIEW_PROTOCOL_I27_DECISIONS.has(decision)) {
          issues.push({
            file: VK5_REVIEW_PROTOCOL_PATH,
            message: `invalid I27+ review decision for ${id}: ${decision}`,
          })
        }
      } else if (decision && !ALLOWED_REVIEW_PROTOCOL_DECISIONS.has(decision)) {
        issues.push({
          file: VK5_REVIEW_PROTOCOL_PATH,
          message: `invalid VK-5 review decision for ${id}: ${decision}`,
        })
      }
      if (requiresResolvedReviewRows && UNRESOLVED_REVIEW_PROTOCOL_DECISIONS.has(decision)) {
        issues.push({
          file: VK5_REVIEW_PROTOCOL_PATH,
          message: `VK-5 review protocol cannot be marked ${protocolStatus} with unresolved review decision for ${id}: ${decision}`,
        })
      }
    }
  }

  for (const id of REQUIRED_INSIGHT_CANDIDATE_IDS) {
    if (!reviewCandidateRows.has(id)) {
      issues.push({
        file: VK5_REVIEW_PROTOCOL_PATH,
        message: `missing VK-5 I27+ review row ${id}`,
      })
    }
  }

  if (issues.length === 0) {
    const requiredReviewProtocolRowCounts = new Map<string, number>()
    for (const row of REQUIRED_REVIEW_PROTOCOL_ROWS) {
      requiredReviewProtocolRowCounts.set(row, (requiredReviewProtocolRowCounts.get(row) ?? 0) + 1)
    }

    for (const [row, requiredCount] of requiredReviewProtocolRowCounts.entries()) {
      const actualCount = reviewProtocolRowCounts.get(row) ?? 0
      if (actualCount === 0) {
        issues.push({
          file: VK5_REVIEW_PROTOCOL_PATH,
          message: `missing VK-5 review protocol row ${row}`,
        })
      } else if (actualCount < requiredCount) {
        issues.push({
          file: VK5_REVIEW_PROTOCOL_PATH,
          message: `missing VK-5 review protocol row ${row} occurrence ${actualCount + 1}`,
        })
      }
    }
  }

  if (issues.length === 0) {
    for (const decisionBlock of REQUIRED_REVIEW_PROTOCOL_DECISION_BLOCKS) {
      if (!source.includes(decisionBlock)) {
        issues.push({
          file: VK5_REVIEW_PROTOCOL_PATH,
          message: `missing VK-5 review decision block ${decisionBlock}`,
        })
      }
    }
  }

  if (issues.length === 0) {
    const decisionOptionCounts = new Map<string, number>()
    for (const option of extractCheckboxOptions(source)) {
      decisionOptionCounts.set(option, (decisionOptionCounts.get(option) ?? 0) + 1)
    }

    const requiredDecisionOptionCounts = new Map<string, number>()
    for (const option of REQUIRED_REVIEW_PROTOCOL_DECISION_OPTIONS) {
      requiredDecisionOptionCounts.set(option, (requiredDecisionOptionCounts.get(option) ?? 0) + 1)
    }

    for (const [option, requiredCount] of requiredDecisionOptionCounts.entries()) {
      const actualCount = decisionOptionCounts.get(option) ?? 0
      if (actualCount === 0) {
        issues.push({
          file: VK5_REVIEW_PROTOCOL_PATH,
          message: `missing VK-5 review decision option ${option}`,
        })
      } else if (actualCount < requiredCount) {
        issues.push({
          file: VK5_REVIEW_PROTOCOL_PATH,
          message: `missing VK-5 review decision option ${option} occurrence ${actualCount + 1}`,
        })
      }
    }
  }

  if (issues.length === 0) {
    for (const item of REQUIRED_REVIEW_PROTOCOL_CLOSEOUT_ITEMS) {
      if (!source.includes(item)) {
        issues.push({
          file: VK5_REVIEW_PROTOCOL_PATH,
          message: `missing VK-5 review closeout item ${item}`,
        })
      }
    }
  }

  if (issues.length === 0) {
    if (protocolFrontmatter.plan !== VK5_MASTERPLAN_PATH) {
      issues.push({
        file: VK5_REVIEW_PROTOCOL_PATH,
        message: `missing VK-5 review protocol frontmatter plan: ${VK5_MASTERPLAN_PATH}`,
      })
    }
    if (protocolFrontmatter.completion_audit !== VK5_COMPLETION_AUDIT_PATH) {
      issues.push({
        file: VK5_REVIEW_PROTOCOL_PATH,
        message: `missing VK-5 review protocol frontmatter completion_audit: ${VK5_COMPLETION_AUDIT_PATH}`,
      })
    }
  }
  if (issues.length === 0) {
    const requiredProtocolTargets = {
      plan: VK5_MASTERPLAN_PATH,
      completion_audit: VK5_COMPLETION_AUDIT_PATH,
    } as const
    for (const [field, expectedPath] of Object.entries(requiredProtocolTargets)) {
      if (!existsSync(join(repoRoot, expectedPath))) {
        issues.push({
          file: VK5_REVIEW_PROTOCOL_PATH,
          message: `missing VK-5 review protocol frontmatter target ${field}: ${expectedPath}`,
        })
      }
    }
  }

  return { issues }
}

export function validateReviewCloseout(repoRoot: string): { issues: VaultIssue[] } {
  const issues = [...validateReviewProtocolDecisionGate(repoRoot).issues]
  const absolutePath = join(repoRoot, VK5_REVIEW_PROTOCOL_PATH)
  if (!existsSync(absolutePath)) {
    return { issues }
  }

  const protocolFrontmatter = parseFrontmatter(readFileSync(absolutePath, 'utf8')).frontmatter
  const protocolStatus = normalizeTableCell(protocolFrontmatter.status ?? '')
  if (!REVIEW_PROTOCOL_CLOSEOUT_STATUSES.has(protocolStatus)) {
    issues.push({
      file: VK5_REVIEW_PROTOCOL_PATH,
      message:
        'VK-5 review closeout requires protocol frontmatter status fullfort/fullført/ferdig/lukket after human Obsidian review',
    })
  }

  return { issues }
}

export function validateReviewPackageFrontmatterLinks(repoRoot: string): { issues: VaultIssue[] } {
  const issues: VaultIssue[] = []
  let hasStructuralIssue = false

  for (const [documentPath, requiredLinks] of Object.entries(REQUIRED_REVIEW_PACKAGE_FRONTMATTER_LINKS)) {
    const absolutePath = join(repoRoot, documentPath)
    if (!existsSync(absolutePath)) {
      issues.push({
        file: documentPath,
        message: 'missing review package document',
      })
      hasStructuralIssue = true
      continue
    }

    const frontmatter = parseFrontmatter(readFileSync(absolutePath, 'utf8')).frontmatter
    const source = readFileSync(absolutePath, 'utf8')
    const requiredStatus =
      REQUIRED_REVIEW_PACKAGE_FRONTMATTER_STATUSES[
        documentPath as keyof typeof REQUIRED_REVIEW_PACKAGE_FRONTMATTER_STATUSES
      ]
    if (requiredStatus && frontmatter.status !== requiredStatus) {
      issues.push({
        file: documentPath,
        message: `invalid review package frontmatter status: ${frontmatter.status ?? ''}`,
      })
      hasStructuralIssue = true
    }
    for (const [field, expectedPath] of Object.entries(requiredLinks)) {
      if (frontmatter[field] !== expectedPath) {
        issues.push({
          file: documentPath,
          message: `missing review package frontmatter ${field}: ${expectedPath}`,
        })
        hasStructuralIssue = true
      }
    }
    if (REVIEW_PACKAGE_DUPLICATED_REQUIREMENT_PHRASES.some((phrase) => source.includes(phrase))) {
      issues.push({
        file: documentPath,
        message: `move duplicated VK-5 review requirement checklist text to ${VK5_REVIEW_PROTOCOL_PATH}`,
      })
      continue
    }
    if (!source.includes(REVIEW_PACKAGE_CANONICAL_REQUIREMENT_POINTER)) {
      issues.push({
        file: documentPath,
        message: 'missing canonical VK-5 requirement-list pointer',
      })
    }
    if (!source.includes(REVIEW_PACKAGE_CANONICAL_NOTE_COUNT_POINTER)) {
      issues.push({
        file: documentPath,
        message: 'missing canonical note-count source pointer',
      })
    }
    if (!source.includes(REVIEW_PACKAGE_CANONICAL_DB_UNIVERSE_POINTER)) {
      issues.push({
        file: documentPath,
        message: 'missing canonical DB-universe source pointer',
      })
    }
  }

  if (!hasStructuralIssue) {
    for (const [documentPath, requiredLinks] of Object.entries(REQUIRED_REVIEW_PACKAGE_FRONTMATTER_LINKS)) {
      for (const [field, expectedPath] of Object.entries(requiredLinks)) {
        if (!existsSync(join(repoRoot, expectedPath))) {
          issues.push({
            file: documentPath,
            message: `missing review package frontmatter target ${field}: ${expectedPath}`,
          })
          hasStructuralIssue = true
        }
      }
    }
  }

  if (!hasStructuralIssue) {
    const archiveTargets = [
      {
        path: VK5_ARCHIVED_MASTERPLAN_PATH,
        message: 'missing archived V2 masterplan',
      },
      {
        path: VK5_ARCHIVED_COMPLETION_AUDIT_PATH,
        message: 'missing archived V2 completion audit',
      },
    ] as const
    for (const target of archiveTargets) {
      if (!existsSync(join(repoRoot, target.path))) {
        issues.push({
          file: target.path,
          message: target.message,
        })
      }
    }
  }

  return { issues }
}

export function validateMasterplanFrontmatterLinks(repoRoot: string): { issues: VaultIssue[] } {
  const issues: VaultIssue[] = []
  const absolutePath = join(repoRoot, VK5_MASTERPLAN_PATH)
  if (!existsSync(absolutePath)) {
    issues.push({
      file: VK5_MASTERPLAN_PATH,
      message: 'missing masterplan document',
    })
    return { issues }
  }

  const source = readFileSync(absolutePath, 'utf8')
  const frontmatter = parseFrontmatter(source).frontmatter
  const relatedFiles = extractFrontmatterList(source, 'relaterte_filer')
  if (relatedFiles.length === 0) {
    issues.push({
      file: VK5_MASTERPLAN_PATH,
      message: 'missing masterplan related files',
    })
    return { issues }
  }

  for (const relatedFile of relatedFiles) {
    if (!existsSync(join(repoRoot, relatedFile))) {
      issues.push({
        file: VK5_MASTERPLAN_PATH,
        message: `missing masterplan related file: ${relatedFile}`,
      })
    }
  }

  if (issues.length === 0) {
    for (const requiredFile of REQUIRED_MASTERPLAN_RELATED_FILES) {
      if (!relatedFiles.includes(requiredFile)) {
        issues.push({
          file: VK5_MASTERPLAN_PATH,
          message: `missing required masterplan related file entry: ${requiredFile}`,
        })
      }
    }
  }

  if (issues.length === 0) {
    for (const [field, expectedValue] of Object.entries(REQUIRED_MASTERPLAN_FRONTMATTER)) {
      if (frontmatter[field] !== expectedValue) {
        issues.push({
          file: VK5_MASTERPLAN_PATH,
          message: `invalid masterplan frontmatter ${field}: ${expectedValue}`,
        })
      }
    }
  }

  if (issues.length === 0) {
    for (const section of REQUIRED_MASTERPLAN_SECTIONS) {
      if (!source.includes(section)) {
        issues.push({
          file: VK5_MASTERPLAN_PATH,
          message: `missing masterplan section: ${section}`,
        })
      }
    }
  }

  if (issues.length === 0) {
    for (const text of REQUIRED_MASTERPLAN_CONTRACT_TEXT) {
      if (!source.includes(text)) {
        issues.push({
          file: VK5_MASTERPLAN_PATH,
          message: `missing masterplan contract text: ${text}`,
        })
      }
    }
  }

  if (issues.length === 0 && !existsSync(join(repoRoot, REQUIRED_MASTERPLAN_CLAIM_LOCK_POLICY_TARGET))) {
    issues.push({
      file: VK5_MASTERPLAN_PATH,
      message: `missing masterplan claim-lock policy target: ${REQUIRED_MASTERPLAN_CLAIM_LOCK_POLICY_TARGET}`,
    })
  }

  return { issues }
}

function parseInsightCandidateRows(source: string): Map<string, InsightCandidateApprovalRow> {
  const rows = new Map<string, InsightCandidateApprovalRow>()
  let headers: string[] | null = null
  let expectingSeparator = false

  for (const line of source.split('\n')) {
    if (!line.trim().startsWith('|')) {
      headers = null
      expectingSeparator = false
      continue
    }

    const cells = parseMarkdownTableCellsPreservingEmpty(line)
    if (cells.length === 0) continue

    if (!headers) {
      headers = cells
      expectingSeparator = true
      continue
    }

    if (expectingSeparator && cells.every((cell) => /^:?-{3,}:?$/.test(cell.trim()))) {
      expectingSeparator = false
      continue
    }

    if (expectingSeparator) continue

    const idIndex = headers.findIndex((header) => ['foreslått id', 'id'].includes(normalizeTableCell(header)))
    const titleIndex = headers.findIndex((header) => normalizeTableCell(header) === 'arbeidstittel')
    const sourceIndex = headers.findIndex((header) => normalizeTableCell(header) === 'kildegrunnlag')
    const rationaleIndex = headers.findIndex((header) => normalizeTableCell(header) === 'hvorfor kandidat')
    const statusIndex = headers.findIndex((header) => normalizeTableCell(header) === 'status')
    if (idIndex < 0 || titleIndex < 0 || sourceIndex < 0 || rationaleIndex < 0 || statusIndex < 0) continue

    const id = cells[idIndex]?.trim()
    if (/^I\d{2,}$/.test(id)) {
      rows.set(id, {
        title: cells[titleIndex]?.trim() ?? '',
        sourceBasis: cells[sourceIndex]?.trim() ?? '',
        rationale: cells[rationaleIndex]?.trim() ?? '',
        status: normalizeTableCell(cells[statusIndex] ?? ''),
      })
    }
  }
  return rows
}

function parseMarkdownTableRows(source: string): Array<{ headers: string[]; cells: string[] }> {
  const rows: Array<{ headers: string[]; cells: string[] }> = []
  let headers: string[] | null = null
  let expectingSeparator = false

  for (const line of source.split('\n')) {
    if (!line.trim().startsWith('|')) {
      headers = null
      expectingSeparator = false
      continue
    }

    const cells = parseMarkdownTableCells(line)
    if (cells.length === 0) continue

    if (!headers) {
      headers = cells
      expectingSeparator = true
      continue
    }

    if (expectingSeparator && cells.every((cell) => /^:?-{3,}:?$/.test(cell.trim()))) {
      expectingSeparator = false
      continue
    }

    if (!expectingSeparator) {
      rows.push({ headers, cells })
    }
  }

  return rows
}

function parseMarkdownTableCells(line: string): string[] {
  return line
    .split('|')
    .map((cell) => cell.trim())
    .filter(Boolean)
}

function parseMarkdownTableCellsPreservingEmpty(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim())
}

function normalizeTableCell(value: string): string {
  return value.trim().toLocaleLowerCase('nb')
}

function splitAtNotes(source: string): { head: string; tail: string | null } {
  const markerPattern = new RegExp(`(^|\\n)${escapeRegExp(NOTES_MARKER)}\\n`)
  const match = markerPattern.exec(source)

  if (!match) {
    return { head: source, tail: null }
  }

  const markerStart = match.index + match[1].length
  return {
    head: source.slice(0, markerStart),
    tail: source.slice(markerStart),
  }
}

function parseFrontmatter(source: string): { frontmatter: Record<string, string>; body: string } {
  if (!source.startsWith('---\n')) {
    return { frontmatter: {}, body: source }
  }

  const end = source.indexOf('\n---\n', 4)
  if (end === -1) {
    return { frontmatter: {}, body: source }
  }

  const frontmatterSource = source.slice(4, end)
  const frontmatter: Record<string, string> = {}

  for (const line of frontmatterSource.split('\n')) {
    const match = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(line)
    if (match) {
      frontmatter[match[1]] = match[2].replace(/^"|"$/g, '')
    }
  }

  return { frontmatter, body: source.slice(end + 5) }
}

function readReviewText(repoRoot: string, file: string, issues: VaultIssue[]): string | null {
  const absolutePath = join(repoRoot, file)
  if (!existsSync(absolutePath)) {
    issues.push({ file, message: 'missing VK-5 review sample file' })
    return null
  }

  return readFileSync(absolutePath, 'utf8')
}

function readReviewJson<T>(repoRoot: string, file: string, issues: VaultIssue[]): T | null {
  const source = readReviewText(repoRoot, file, issues)
  if (source === null) return null

  try {
    return JSON.parse(source) as T
  } catch (error) {
    issues.push({
      file,
      message: `invalid JSON for VK-5 review sample: ${error instanceof Error ? error.message : String(error)}`,
    })
    return null
  }
}

function requireReviewText(
  file: string,
  source: string,
  expected: string,
  message: string,
  issues: VaultIssue[],
): void {
  if (expected && !source.includes(expected)) {
    issues.push({ file, message })
  }
}

function extractBacktickPathReferences(source: string): string[] {
  return [...source.matchAll(/`([^`]+)`/g)]
    .map((match) => match[1].trim())
    .filter((value) => REVIEW_PATH_PREFIXES.some((prefix) => value.startsWith(prefix)))
}

function extractFrontmatterList(source: string, key: string): string[] {
  if (!source.startsWith('---\n')) {
    return []
  }

  const end = source.indexOf('\n---\n', 4)
  if (end === -1) {
    return []
  }

  const lines = source.slice(4, end).split('\n')
  const list: string[] = []
  let inTargetList = false
  for (const line of lines) {
    if (!inTargetList) {
      inTargetList = new RegExp(`^${key}:\\s*$`).test(line)
      continue
    }

    const itemMatch = /^\s+-\s+(.+?)\s*$/.exec(line)
    if (itemMatch) {
      list.push(itemMatch[1].replace(/^"|"$/g, ''))
      continue
    }
    if (/^[A-Za-z0-9_-]+:/.test(line)) {
      break
    }
  }

  return list
}

function extractCheckboxOptions(source: string): string[] {
  return [...source.matchAll(/^- \[ \] (.+)$/gm)].map((match) => match[1].trim())
}

function extractWikiLinks(source: string): string[] {
  return [...source.matchAll(/\[\[([^\]|\#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]/g)].map((match) =>
    match[1].trim(),
  )
}

function inferTitle(source: string, relPath: string): string {
  const heading = /^#\s+(.+)$/m.exec(source)
  return heading?.[1].trim() ?? basename(relPath, '.md')
}

function stripTitle(source: string): string[] {
  return source
    .replace(/^#\s+.+\n?/, '')
    .trim()
    .split('\n')
    .filter((line, index, lines) => line !== '' || index !== 0 || lines.length === 1)
}

function removeSection(source: string, heading: string): string {
  const headingPattern = escapeRegExp(heading)
  const pattern = new RegExp(`\\n?${headingPattern}\\n[\\s\\S]*?(?=\\n## [^\\n]+\\n|\\n${escapeRegExp(NOTES_MARKER)}\\n|$)`)
  return source.replace(pattern, '')
}

function replaceSection(source: string, heading: string, section: string): string | null {
  const headingPattern = escapeRegExp(heading)
  const pattern = new RegExp(`(^|\\n)${headingPattern}\\n[\\s\\S]*?(?=\\n## [^\\n]+\\n|\\n${escapeRegExp(NOTES_MARKER)}\\n|$)`)
  const match = pattern.exec(source)
  if (!match) return null

  const leadingNewline = match[1] ?? ''
  const replacement = `${leadingNewline}${trimTrailingNewlines(section)}\n`
  return `${source.slice(0, match.index)}${replacement}${source.slice(match.index + match[0].length)}`
}

function removeManagedBody(source: string, body: string[]): string {
  const block = body.join('\n')
  let result = source

  for (const candidate of [`\n\n${block}\n`, `\n${block}\n`]) {
    while (result.includes(candidate)) {
      result = result.replace(candidate, '\n')
    }
  }

  return result
}

function inferType(relPath: string, title: string): string {
  if (title.startsWith('Klynge ')) return 'klynge'
  if (relPath.includes('/Ledd/')) return 'ledd'
  if (relPath.includes('/Aktører/')) return 'aktor'
  if (relPath.includes('/Innsikter/')) return 'innsikt'
  if (relPath.includes('/Looper/')) return 'loop'
  if (relPath.includes('/Gaps/')) return 'gap'
  if (relPath.includes('/Norden/')) return 'norden'
  if (relPath.includes('/Personer/')) return 'person'
  if (relPath.includes('/Kilder/') || title === 'Kilder') return 'kilde'
  if (relPath.includes('Møter') || title === 'Møter') return 'mote'
  if (relPath.startsWith('9 Datafundament/')) return 'datafundament'
  if (relPath.startsWith('0 Kart/') || title.includes('kartet') || title.startsWith('HUB')) return 'hub'
  return 'seksjon'
}

function walkFiles(root: string, predicate: (file: string) => boolean): string[] {
  if (!existsSync(root)) return []

  const results: string[] = []
  for (const entry of readdirSync(root)) {
    const fullPath = join(root, entry)
    const stats = statSync(fullPath)
    if (stats.isDirectory()) {
      if (entry === '.obsidian') {
        results.push(...walkFiles(fullPath, predicate))
      } else {
        results.push(...walkFiles(fullPath, predicate))
      }
    } else if (predicate(fullPath)) {
      results.push(fullPath)
    }
  }
  return results
}

function trimTrailingNewlines(source: string): string {
  return source.replace(/\n+$/g, '')
}

function escapeRegExp(source: string): string {
  return source.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}
