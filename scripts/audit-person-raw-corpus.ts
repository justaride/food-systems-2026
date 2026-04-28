import 'dotenv/config'
import { promises as fs } from 'fs'
import path from 'path'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const ROOT = process.cwd()
const OUT_MD = path.join(ROOT, 'docs', 'project', 'mandates', 'personer-rakorpus-pass-food-tg-2026-04-28.md')
const OUT_JSON = path.join(ROOT, 'research', '_status', 'person-korpus-kandidater-2026-04-28.json')
const OUT_CSV = path.join(ROOT, 'research', '_status', 'person-korpus-kandidater-2026-04-28.csv')

const SOURCE_DIRS = [
  'docs/meetings',
  'docs/project/mandates',
  'research',
]

const GENERATED_OUTPUTS = new Set([
  OUT_MD,
  OUT_JSON,
  OUT_CSV,
  path.join(ROOT, 'docs', 'project', 'mandates', 'personer-underlagskontroll-food-tg-2026-04-28.md'),
  path.join(ROOT, 'research', '_status', 'personer-underlagskontroll-2026-04-28.json'),
  path.join(ROOT, 'research', 'COMPANY-EXTRACTION-AUDIT.md'),
  path.join(ROOT, 'research', 'company-extraction-audit.json'),
  path.join(ROOT, 'research', 'company-extraction-candidates.csv'),
].map(file => path.resolve(file)))

const SOURCE_EXTENSIONS = new Set(['.md', '.txt', '.csv', '.json', '.jsonl'])
const MAX_TEXT_FILE_BYTES = 2_000_000
const MAX_CONTEXTS_PER_CANDIDATE = 6

const NAME_TOKEN = String.raw`[A-ZÆØÅÄÖÜÉÈÁÀÓÒÍÌÚÙÇ][\p{L}\p{M}'.’:]*`
const NAME_PARTICLE = String.raw`(?:de|De|del|Del|da|Da|van|Van|von|Von|af|Af|bin|Bin|al|Al|el|El)`
const PERSON_NAME_RE = new RegExp(
  String.raw`\b${NAME_TOKEN}(?:[-\s]+(?:${NAME_PARTICLE}|${NAME_TOKEN})){1,4}\b`,
  'gu',
)

const LEGAL_SUFFIX_RE =
  /\b(?:as|asa|sa|ba|ans|da|nuf|ab|kb|hb|a\/s|aps|oyj|oy|ky|hf|ehf|ltd|limited|inc|corp|corporation|gmbh|ag|plc|llc|bv|nv)\.?$/i

const ROLE_CONTEXT_RE =
  /\b(?:ceo|cfo|coo|cto|leder|direktor|adm\.?\s*dir|konsernsjef|styreleder|styremedlem|nestleder|grunder|grunnlegger|founder|co-founder|professor|forsker|statsrad|minister|ordforer|sekretariat|kontakt|chair|director|manager|head of|president|partner|advisor|senior|chief|programleder|prosjektleder|utvalgsleder)\b/i

const SOURCE_STRENGTH_RE =
  /\b(?:nokkelperson|nøkkelperson|kontaktperson|personkatalog|participants|deltakere|styre|board|leadership|management|grunder|founder|ceo|professor)\b/i

const COMPANY_OR_ORG_WORDS = new Set([
  'as', 'asa', 'sa', 'ab', 'oy', 'oyj', 'aps', 'a/s', 'hf', 'ehf', 'ltd', 'inc', 'gmbh', 'ag',
  'group', 'gruppen', 'foundation', 'stiftelsen', 'university', 'universitet', 'department',
  'directorate', 'direktoratet', 'ministry', 'departementet', 'council', 'radet', 'rådet',
  'institute', 'institutt', 'institutet', 'agency', 'authority', 'tilsynet', 'kommune',
  'kommunen', 'nordic', 'nordisk', 'norge', 'norway', 'sweden', 'sverige', 'danmark',
  'denmark', 'finland', 'iceland', 'island', 'food', 'systems', 'system', 'transition',
  'group', 'research', 'report', 'rapport', 'analysis', 'analyse', 'matrix', 'evidence',
  'claim', 'source', 'brief', 'dossier', 'project', 'prosjekt', 'mandate', 'mandat',
  'status', 'roadmap', 'insight', 'pack', 'workshop', 'meeting', 'mote', 'møte',
  'policy', 'governance', 'market', 'data', 'table', 'figure', 'chapter', 'del',
  'sustainability', 'assessment', 'management', 'results', 'result', 'quarter',
  'waste', 'environmental', 'footprint', 'technology', 'customs', 'thesis',
  'review', 'microsoft', 'word', 'speaker', 'foods', 'aquaculture', 'economics',
  'eiendom', 'centre', 'center', 'resilience', 'feed', 'urban', 'diets',
  'customs', 'journal', 'volume', 'vol', 'src', 'ev', 'cl', 'api', 'title',
  'sekretariat',
])

const LEADING_NOISE_WORDS = new Set([
  'og', 'eller', 'for', 'med', 'uten', 'fra', 'til', 'av', 'pa', 'på', 'i', 'the', 'a', 'an',
  'this', 'that', 'source', 'kilde', 'case', 'rapport', 'report',
])

const PERSON_FALSE_POSITIVE_PHRASES = new Set([
  'Food Transition Group',
  'Nordic Food Systems',
  'Food Research Process',
  'Transition Groups',
  'Evidence Matrix',
  'Claim Register',
  'Source Shortlist',
  'Decision Memo',
  'Insight Pack',
  'Primary Check Queue',
  'Actor Validation Pack',
  'Food TG',
  'Natural State',
  'Oslo Innovasjon',
  'Nordic Innovation',
  'Horizon Europe',
  'Farm To Fork',
  'Too Good To Go',
  'Stop Spild Af Mad',
  'Sustainability Assessment',
  'Fourth-Quarter Results',
  'Waste Management',
  'Green Queen',
  'EAT-Lancet',
  'Stockholm Resilience Centre',
  'Thesis. Review',
  'Hooked Foods',
  'Series B',
  'Billund Aquaculture',
  'SRC-B',
  'Reitan Eiendom',
  'Oslo Economics',
  'Jenfelder Au',
  'Impact Loop',
  'Environmental Footprint',
  'Finnish Customs',
  'Mowi Feed',
  'Axel Johnson',
  'Holistic Management',
  'Les Mousquetaires',
  'Shifting Urban Diets',
  'SLU Uppsala',
])

type SourceHit = {
  sourceId: string
  title: string
  kind: 'file' | 'actorContact' | 'meetingParticipant'
}

type ContextHit = {
  sourceId: string
  title: string
  context: string
}

type CandidateStatus =
  | 'on_person_page'
  | 'actor_contact_only'
  | 'meeting_participant_only'
  | 'missing_candidate'

type Candidate = {
  key: string
  looseKey: string
  shortKey: string
  displayName: string
  variants: Map<string, number>
  mentions: number
  sourceHits: Map<string, SourceHit>
  contexts: ContextHit[]
  contextScore: number
  status: CandidateStatus
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'KNOWN'
  action: string
}

function normalizeText(value: string): string {
  return value
    .replace(/[ÆÄ]/g, 'A')
    .replace(/[æä]/g, 'a')
    .replace(/[ØÖÓÒÔ]/g, 'O')
    .replace(/[øöóòô]/g, 'o')
    .replace(/[ÅÁÀÂ]/g, 'A')
    .replace(/[åáàâ]/g, 'a')
    .replace(/[Ü]/g, 'U')
    .replace(/[ü]/g, 'u')
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u2013\u2014]/g, '-')
}

function normalizePersonKey(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z ]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function loosePersonKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/[øöóòô]/g, 'o')
    .replace(/[åáàâä]/g, 'a')
    .replace(/æ/g, 'ae')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/oe/g, 'o')
    .replace(/aa/g, 'a')
    .replace(/[^a-z ]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

function shortNameKey(name: string): string {
  const words = name
    .split(/[\s-]+/)
    .map(word => word.replace(/^[^\p{L}]+|[^\p{L}]+$/gu, ''))
    .filter(word => word && !/^[A-Z]\.?$/.test(word))

  if (words.length < 2) return normalizePersonKey(name)
  return loosePersonKey(`${words[0]} ${words[words.length - 1]}`)
}

function cleanNameCandidate(value: string): string | null {
  let cleaned = value
    .replace(/\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/[`*_#>|]/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/^[\s"'([{]+|[\s"')\]}.,;:!?]+$/g, '')
    .trim()

  cleaned = cleaned
    .replace(/^(?:Dr\.?|Prof\.?|Professor|CEO|COO|CFO|CTO|Founder|Co-Founder|Chief Executive Officer)\s+/i, '')
    .replace(/\s+(?:Nettredakt(?:oer|ør)?|Redaktoer|Redaktør|CEO|COO|CFO|CTO)$/i, '')
    .trim()

  cleaned = cleaned
    .split(/\s+/)
    .filter(token => !LEADING_NOISE_WORDS.has(token.toLowerCase()))
    .join(' ')
    .trim()

  if (PERSON_FALSE_POSITIVE_PHRASES.has(cleaned)) return null
  if (cleaned.length < 5 || cleaned.length > 80) return null
  if (/\d/.test(cleaned)) return null
  if (/[.]/.test(cleaned) && !/^Dr\./i.test(value)) return null
  if (/^[A-Z]{2,}(?:[-\s][A-Z])?$/.test(cleaned)) return null
  if (LEGAL_SUFFIX_RE.test(cleaned)) return null

  const words = cleaned.split(/[\s-]+/).filter(Boolean)
  if (words.length < 2 || words.length > 5) return null
  if (words.some(word => word.length === 1 && !/^[A-Z]\.?$/.test(word))) return null

  const normalizedWords = words.map(word => normalizeText(word).toLowerCase().replace(/[^a-z/]/g, ''))
  const orgWordCount = normalizedWords.filter(word => COMPANY_OR_ORG_WORDS.has(word)).length
  if (orgWordCount > 0) return null

  if (normalizedWords.some(word => word.length <= 1)) return null
  if (normalizedWords.some(word => ['hva', 'de', 'ok', 'ogs', 'men', 'bare', 'norden', 'jeg'].includes(word))) return null

  const upperWords = words.filter(word => /^[A-ZÆØÅÄÖÜÉÈÁÀÓÒÍÌÚÙÇ]{2,}$/.test(word)).length
  if (upperWords >= Math.max(2, words.length - 1)) return null

  return cleaned
}

function contextFor(text: string, index: number, length: number) {
  const start = Math.max(0, index - 160)
  const end = Math.min(text.length, index + length + 160)
  return text
    .slice(start, end)
    .replace(/\s+/g, ' ')
    .trim()
}

function csvEscape(value: unknown): string {
  const s = String(value ?? '')
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function addCandidate(
  candidates: Map<string, Candidate>,
  name: string,
  sourceHit: SourceHit,
  context: string,
  count = 1,
) {
  const key = normalizePersonKey(name)
  const looseKey = loosePersonKey(name)
  const shortKey = shortNameKey(name)
  if (!key) return

  const score = ROLE_CONTEXT_RE.test(context) ? 2 : SOURCE_STRENGTH_RE.test(context) ? 1 : 0
  const existing = candidates.get(key) ?? candidates.get(looseKey) ?? [...candidates.values()].find(candidate => candidate.shortKey === shortKey)

  if (existing) {
    existing.mentions += count
    existing.sourceHits.set(sourceHit.sourceId, sourceHit)
    existing.variants.set(name, (existing.variants.get(name) ?? 0) + count)
    existing.contextScore += score
    if (existing.contexts.length < MAX_CONTEXTS_PER_CANDIDATE) {
      existing.contexts.push({ sourceId: sourceHit.sourceId, title: sourceHit.title, context })
    }
    if (name.length > existing.displayName.length) existing.displayName = name
    return
  }

  candidates.set(key, {
    key,
    looseKey,
    shortKey,
    displayName: name,
    variants: new Map([[name, count]]),
    mentions: count,
    sourceHits: new Map([[sourceHit.sourceId, sourceHit]]),
    contexts: [{ sourceId: sourceHit.sourceId, title: sourceHit.title, context }],
    contextScore: score,
    status: 'missing_candidate',
    priority: 'LOW',
    action: 'manual_review',
  })
}

function extractFromText(text: string, sourceHit: SourceHit, candidates: Map<string, Candidate>) {
  const matches = text.matchAll(PERSON_NAME_RE)
  for (const match of matches) {
    if (typeof match.index !== 'number') continue
    const cleaned = cleanNameCandidate(match[0])
    if (!cleaned) continue
    const context = contextFor(text, match.index, match[0].length)
    const hasStrongContext = ROLE_CONTEXT_RE.test(context) || SOURCE_STRENGTH_RE.test(context)
    if (!hasStrongContext && sourceHit.kind === 'file') continue
    addCandidate(candidates, cleaned, sourceHit, context)
  }
}

async function walkFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => [])
  const files: string[] = []

  for (const entry of entries) {
    if (entry.name.startsWith('.')) continue
    if (['node_modules', '.next', 'pdf-downloads-20-04-26', '_status', '_plans', 'data', '__pycache__'].includes(entry.name)) {
      continue
    }

    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...await walkFiles(full))
    } else if (entry.isFile() && SOURCE_EXTENSIONS.has(path.extname(entry.name))) {
      if (!GENERATED_OUTPUTS.has(path.resolve(full))) files.push(full)
    }
  }

  return files
}

async function readLocalCorpus(candidates: Map<string, Candidate>) {
  let scanned = 0
  let skippedLarge = 0

  for (const dir of SOURCE_DIRS.map((sourceDir) => path.join(ROOT, sourceDir))) {
    const files = await walkFiles(dir)
    for (const file of files) {
      const stat = await fs.stat(file)
      if (stat.size > MAX_TEXT_FILE_BYTES) {
        skippedLarge++
        continue
      }

      const rel = path.relative(ROOT, file)
      const text = await fs.readFile(file, 'utf8').catch(() => '')
      if (!text.trim()) continue
      extractFromText(text, { sourceId: `file:${rel}`, title: rel, kind: 'file' }, candidates)
      scanned++
    }
  }

  return { scanned, skippedLarge }
}

function rankCandidate(candidate: Candidate) {
  const sourceCount = candidate.sourceHits.size
  const roleScore = Math.min(candidate.contextScore, 12)
  const mentionScore = Math.min(candidate.mentions, 12)
  const structuredScore =
    candidate.status === 'actor_contact_only' ? 18 :
    candidate.status === 'meeting_participant_only' ? 10 :
    0

  return sourceCount * 3 + roleScore * 2 + mentionScore + structuredScore
}

function classifyCandidates(
  candidates: Map<string, Candidate>,
  pageKeys: Set<string>,
  pageLooseKeys: Set<string>,
  pageShortKeys: Set<string>,
  pageLooseNames: Set<string>,
  actorContactKeys: Set<string>,
  actorContactLooseKeys: Set<string>,
  actorContactShortKeys: Set<string>,
  actorContactLooseNames: Set<string>,
  meetingKeys: Set<string>,
  meetingLooseKeys: Set<string>,
  meetingShortKeys: Set<string>,
  meetingLooseNames: Set<string>,
) {
  for (const candidate of candidates.values()) {
    const pagePrefixMatch = [...pageLooseNames].some(name => name.startsWith(`${candidate.looseKey}-`))
    const actorPrefixMatch = [...actorContactLooseNames].some(name => name.startsWith(`${candidate.looseKey}-`))
    const meetingPrefixMatch = [...meetingLooseNames].some(name => name.startsWith(`${candidate.looseKey}-`))

    const isOnPage = pageKeys.has(candidate.key) || pageLooseKeys.has(candidate.looseKey) || pageShortKeys.has(candidate.shortKey) || pagePrefixMatch
    const isActorContact = actorContactKeys.has(candidate.key) || actorContactLooseKeys.has(candidate.looseKey) || actorContactShortKeys.has(candidate.shortKey) || actorPrefixMatch
    const isMeetingParticipant = meetingKeys.has(candidate.key) || meetingLooseKeys.has(candidate.looseKey) || meetingShortKeys.has(candidate.shortKey) || meetingPrefixMatch

    if (isOnPage) candidate.status = 'on_person_page'
    else if (isActorContact) candidate.status = 'actor_contact_only'
    else if (isMeetingParticipant) candidate.status = 'meeting_participant_only'
    else candidate.status = 'missing_candidate'

    const score = rankCandidate(candidate)

    if (candidate.status === 'on_person_page') {
      candidate.priority = 'KNOWN'
      candidate.action = 'already_covered'
    } else if (candidate.status === 'actor_contact_only') {
      candidate.priority = 'HIGH'
      candidate.action = 'decide_promote_to_person_profile_or_keep_actor_contact'
    } else if (candidate.status === 'meeting_participant_only') {
      candidate.priority = 'MEDIUM'
      candidate.action = 'decide_if_internal_participant_should_be_profiled'
    } else if (score >= 18 || (candidate.sourceHits.size >= 3 && candidate.contextScore >= 2)) {
      candidate.priority = 'HIGH'
      candidate.action = 'manual_validate_then_promote'
    } else if (score >= 10) {
      candidate.priority = 'MEDIUM'
      candidate.action = 'manual_review'
    } else {
      candidate.priority = 'LOW'
      candidate.action = 'park_or_ignore_until_confirmed'
    }
  }
}

function table(rows: Array<Array<string | number>>) {
  const [header, ...body] = rows
  const separator = header.map(() => '---')
  return [header, separator, ...body].map(row => `| ${row.join(' | ')} |`).join('\n')
}

function compactSources(candidate: Candidate, limit = 4) {
  return [...candidate.sourceHits.values()]
    .slice(0, limit)
    .map(hit => hit.title.replace(/^research\//, 'research/').replace(/^docs\//, 'docs/'))
    .join('; ')
}

function topContext(candidate: Candidate) {
  const best = candidate.contexts.find(hit => ROLE_CONTEXT_RE.test(hit.context)) ?? candidate.contexts[0]
  return best?.context.replace(/\|/g, '/').slice(0, 220) ?? ''
}

async function main() {
  const candidates = new Map<string, Candidate>()

  const [
    profiles,
    boardMembers,
    actorContacts,
    meetings,
  ] = await Promise.all([
    prisma.personProfile.findMany({ select: { name: true, personKey: true } }),
    prisma.boardMember.findMany({ select: { personName: true, personKey: true } }),
    prisma.actorContact.findMany({ select: { id: true, name: true, role: true, organization: true, actorId: true } }),
    prisma.meeting.findMany({ select: { id: true, title: true, participants: true } }),
  ])

  const pageKeys = new Set([
    ...profiles.map(profile => profile.personKey),
    ...boardMembers.map(member => member.personKey),
  ])
  const pageLooseKeys = new Set([
    ...profiles.map(profile => loosePersonKey(profile.name)),
    ...boardMembers.map(member => loosePersonKey(member.personName)),
  ])
  const pageLooseNames = pageLooseKeys
  const pageShortKeys = new Set([
    ...profiles.map(profile => shortNameKey(profile.name)),
    ...boardMembers.map(member => shortNameKey(member.personName)),
  ])

  const actorContactNames = actorContacts
    .map(contact => ({
      name: contact.name.trim(),
      role: contact.role,
      organization: contact.organization,
      sourceId: `actorContact:${contact.id}`,
    }))
    .filter(contact => contact.name)
    .filter(contact => !/\bsekretariat\b/i.test(contact.name))

  const actorContactKeys = new Set(actorContactNames.map(contact => normalizePersonKey(contact.name)))
  const actorContactLooseKeys = new Set(actorContactNames.map(contact => loosePersonKey(contact.name)))
  const actorContactLooseNames = actorContactLooseKeys
  const actorContactShortKeys = new Set(actorContactNames.map(contact => shortNameKey(contact.name)))

  const meetingParticipantNames = meetings.flatMap(meeting =>
    meeting.participants
      .map(name => name.trim())
      .filter(Boolean)
      .map(name => ({
        name,
        sourceId: `meeting:${meeting.id}`,
        title: meeting.title,
      })),
  )

  const meetingKeys = new Set(meetingParticipantNames.map(participant => normalizePersonKey(participant.name)))
  const meetingLooseKeys = new Set(meetingParticipantNames.map(participant => loosePersonKey(participant.name)))
  const meetingLooseNames = meetingLooseKeys
  const meetingShortKeys = new Set(meetingParticipantNames.map(participant => shortNameKey(participant.name)))

  for (const contact of actorContactNames) {
    addCandidate(
      candidates,
      contact.name,
      { sourceId: contact.sourceId, title: contact.organization ?? 'ActorContact', kind: 'actorContact' },
      [contact.role, contact.organization].filter(Boolean).join(' - '),
      3,
    )
  }

  for (const participant of meetingParticipantNames) {
    addCandidate(
      candidates,
      participant.name,
      { sourceId: participant.sourceId, title: participant.title, kind: 'meetingParticipant' },
      `Meeting participant: ${participant.title}`,
      2,
    )
  }

  const corpusStats = await readLocalCorpus(candidates)
  classifyCandidates(
    candidates,
    pageKeys,
    pageLooseKeys,
    pageShortKeys,
    pageLooseNames,
    actorContactKeys,
    actorContactLooseKeys,
    actorContactShortKeys,
    actorContactLooseNames,
    meetingKeys,
    meetingLooseKeys,
    meetingShortKeys,
    meetingLooseNames,
  )

  const allCandidates = [...candidates.values()].sort((a, b) => {
    const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2, KNOWN: 3 }
    const byPriority = priorityOrder[a.priority] - priorityOrder[b.priority]
    if (byPriority !== 0) return byPriority
    return rankCandidate(b) - rankCandidate(a)
  })

  const needsReview = allCandidates.filter(candidate => candidate.status !== 'on_person_page')
  const highPriority = needsReview.filter(candidate => candidate.priority === 'HIGH')
  const mediumPriority = needsReview.filter(candidate => candidate.priority === 'MEDIUM')
  const lowPriority = needsReview.filter(candidate => candidate.priority === 'LOW')
  const known = allCandidates.filter(candidate => candidate.status === 'on_person_page')
  const actorOnly = needsReview.filter(candidate => candidate.status === 'actor_contact_only')
  const meetingOnly = needsReview.filter(candidate => candidate.status === 'meeting_participant_only')

  await fs.mkdir(path.dirname(OUT_MD), { recursive: true })
  await fs.mkdir(path.dirname(OUT_JSON), { recursive: true })

  const jsonPayload = {
    generatedAt: new Date().toISOString(),
    corpusStats,
    dbCounts: {
      personPageKeys: pageKeys.size,
      personProfiles: profiles.length,
      boardMembers: boardMembers.length,
      actorContacts: actorContacts.length,
      meetings: meetings.length,
    },
    summary: {
      totalCandidates: allCandidates.length,
      knownOnPersonPage: known.length,
      needsReview: needsReview.length,
      highPriority: highPriority.length,
      mediumPriority: mediumPriority.length,
      lowPriority: lowPriority.length,
      actorContactOnly: actorOnly.length,
      meetingParticipantOnly: meetingOnly.length,
    },
    candidates: allCandidates.map(candidate => ({
      priority: candidate.priority,
      status: candidate.status,
      action: candidate.action,
      name: candidate.displayName,
      key: candidate.key,
      looseKey: candidate.looseKey,
      shortKey: candidate.shortKey,
      mentions: candidate.mentions,
      sources: candidate.sourceHits.size,
      score: rankCandidate(candidate),
      contextScore: candidate.contextScore,
      variants: [...candidate.variants.entries()].sort((a, b) => b[1] - a[1]),
      sourceHits: [...candidate.sourceHits.values()],
      contexts: candidate.contexts,
    })),
  }

  await fs.writeFile(OUT_JSON, `${JSON.stringify(jsonPayload, null, 2)}\n`)

  const csvRows = [
    ['priority', 'status', 'action', 'name', 'key', 'mentions', 'sources', 'score', 'context', 'source_examples'],
    ...needsReview.map(candidate => [
      candidate.priority,
      candidate.status,
      candidate.action,
      candidate.displayName,
      candidate.key,
      candidate.mentions,
      candidate.sourceHits.size,
      rankCandidate(candidate),
      topContext(candidate),
      compactSources(candidate, 6),
    ]),
  ]
  await fs.writeFile(OUT_CSV, `${csvRows.map(row => row.map(csvEscape).join(',')).join('\n')}\n`)

  const topRows = highPriority.slice(0, 35).map(candidate => [
    candidate.priority,
    candidate.status,
    candidate.displayName,
    candidate.mentions,
    candidate.sourceHits.size,
    rankCandidate(candidate),
    compactSources(candidate, 3),
  ])

  const actorRows = actorOnly.slice(0, 20).map(candidate => [
    candidate.displayName,
    candidate.mentions,
    compactSources(candidate, 3),
    candidate.action,
  ])

  const mediumRows = mediumPriority.slice(0, 25).map(candidate => [
    candidate.displayName,
    candidate.status,
    candidate.mentions,
    candidate.sourceHits.size,
    compactSources(candidate, 2),
  ])

  const report = `---
tittel: "Personer råkorpus-pass - Food TG"
status: Utført internt
eier: Gabriel
sist_oppdatert: 2026-04-28
neste_handling: Valider HIGH-kandidater manuelt mot kildekontekst og promoter bare bekreftede personer til PersonProfile eller ActorContact.
relaterte_filer:
  - scripts/audit-person-raw-corpus.ts
  - research/_status/person-korpus-kandidater-2026-04-28.json
  - research/_status/person-korpus-kandidater-2026-04-28.csv
  - docs/project/mandates/personer-underlagskontroll-food-tg-2026-04-28.md
---

# Personer råkorpus-pass - Food TG

> Auto-generert av \`scripts/audit-person-raw-corpus.ts\`. Dette er en kandidat-/triageliste, ikke en importliste.

## Konklusjon

Råkorpuspasset skannet \`${corpusStats.scanned}\` tekstfiler fra \`docs/meetings\`, \`docs/project/mandates\` og \`research\` mot eksisterende \`/personer\`-grunnlag. Scriptet fant \`${allCandidates.length}\` personnavn-kandidater med rolle-/kontaktkontekst. \`${known.length}\` matcher allerede personsiden, mens \`${needsReview.length}\` må vurderes før eventuell strukturering.

Viktig: dette er regex-/kontekstbasert NER-light. Kandidater må bekreftes mot kilde før de blir fakta i databasen.

## Status

${table([
    ['Kategori', 'Antall', 'Bruk'],
    ['Allerede på /personer', known.length, 'Ingen import'],
    ['Trenger vurdering', needsReview.length, 'Kandidatko'],
    ['HIGH', highPriority.length, 'Valider først'],
    ['MEDIUM', mediumPriority.length, 'Valider etter HIGH'],
    ['LOW', lowPriority.length, 'Parker til senere'],
    ['ActorContact, ikke /personer', actorOnly.length, 'Avklar modellskille'],
    ['Meeting participant, ikke /personer', meetingOnly.length, 'Avklar om relevant personprofil'],
  ])}

## Toppkandidater

${topRows.length > 0 ? table([
    ['Prioritet', 'Status', 'Navn', 'Mentions', 'Kilder', 'Score', 'Kildeeksempler'],
    ...topRows,
  ]) : 'Ingen HIGH-kandidater.'}

## ActorContact uten /personer-profil

${actorRows.length > 0 ? table([
    ['Navn', 'Mentions', 'Kildeeksempler', 'Handling'],
    ...actorRows,
  ]) : 'Ingen ActorContact-only kandidater.'}

## Medium-kandidater

${mediumRows.length > 0 ? table([
    ['Navn', 'Status', 'Mentions', 'Kilder', 'Kildeeksempler'],
    ...mediumRows,
  ]) : 'Ingen MEDIUM-kandidater.'}

## Bruksregler

1. Ikke importer kandidater automatisk.
2. For HIGH: åpne kildekontekst i JSON/CSV, bekreft at navnet er en person og at rollen er relevant for Food TG.
3. Hvis personen er aktørkontakt: vurder \`ActorContact\` først, \`PersonProfile\` bare hvis rollen skal inn i person-/interlocking-katalogen.
4. Hvis personen er møte-/intern deltaker: promoter bare hvis personen skal ha ekstern eller operativ rolle i underlaget.
5. Etter manuell validering: oppdater importscript eller seeddata, kjør personimport og deretter \`scripts/audit-person-underlag.ts\` på nytt.
`

  await fs.writeFile(OUT_MD, report)

  console.log('Person råkorpus-pass')
  console.log(`Scanned files: ${corpusStats.scanned}, skipped large: ${corpusStats.skippedLarge}`)
  console.log(`Candidates: ${allCandidates.length}; known: ${known.length}; review: ${needsReview.length}`)
  console.log(`Priority: HIGH ${highPriority.length}, MEDIUM ${mediumPriority.length}, LOW ${lowPriority.length}`)
  console.log(`Wrote ${path.relative(ROOT, OUT_MD)}`)
  console.log(`Wrote ${path.relative(ROOT, OUT_JSON)}`)
  console.log(`Wrote ${path.relative(ROOT, OUT_CSV)}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
