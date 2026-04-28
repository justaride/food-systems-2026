import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname } from 'path'

const INPUT_PATH = 'research/_status/person-korpus-kandidater-2026-04-28.json'
const OUT_MD = 'docs/project/mandates/personer-high-priority-review-2026-04-28.md'
const OUT_CSV = 'research/_status/person-high-priority-review-2026-04-28.csv'

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

type Candidate = {
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | 'KNOWN'
  status: 'on_person_page' | 'actor_contact_only' | 'meeting_participant_only' | 'missing_candidate'
  action: string
  name: string
  key: string
  mentions: number
  sources: number
  score: number
  contextScore: number
  variants: Array<[string, number]>
  sourceHits: SourceHit[]
  contexts: ContextHit[]
}

type CandidateFile = {
  generatedAt: string
  summary: {
    totalCandidates: number
    knownOnPersonPage: number
    needsReview: number
    highPriority: number
    mediumPriority: number
    lowPriority: number
    actorContactOnly: number
    meetingParticipantOnly: number
  }
  candidates: Candidate[]
}

type Recommendation = {
  bucket:
    | 'ADD_ACTOR_CONTACT_REVIEW_PROFILE_SCOPE'
    | 'KEEP_ACTOR_CONTACT'
    | 'REVIEW_ACADEMIC_PROFILE'
    | 'REVIEW_ECOSYSTEM_PERSON_PROFILE'
    | 'REVIEW_POLICY_PROFILE'
    | 'REVIEW_PROJECT_PARTNER_PROFILE'
    | 'EXCLUDE_SOURCE_FOOTER_NOISE'
    | 'MANUAL_SOURCE_REVIEW'
  reason: string
  importTarget: 'ActorContact' | 'PersonProfile' | 'ActorContact_or_PersonProfile' | 'Exclude' | 'Undecided'
}

type ExistingDecision = {
  decision: string
  notes: string
}

const DECISION_VALUES = [
  'add_person_profile',
  'add_actor_contact',
  'add_both',
  'keep_actor_contact',
  'exclude',
  'needs_source_check',
  'defer',
]

function parseCsv(text: string): Array<Record<string, string>> {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let index = 0; index < text.length; index++) {
    const char = text[index]
    const next = text[index + 1]

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"'
        index++
      } else if (char === '"') {
        inQuotes = false
      } else {
        field += char
      }
      continue
    }

    if (char === '"') {
      inQuotes = true
    } else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (char !== '\r') {
      field += char
    }
  }

  if (field || row.length > 0) {
    row.push(field)
    rows.push(row)
  }

  const [header, ...body] = rows.filter(csvRow => csvRow.some(value => value.trim()))
  if (!header) return []

  return body.map(csvRow =>
    Object.fromEntries(header.map((column, index) => [column, csvRow[index] ?? ''])),
  )
}

function loadExistingDecisions() {
  const decisions = new Map<string, ExistingDecision>()
  if (!existsSync(OUT_CSV)) return decisions

  for (const row of parseCsv(readFileSync(OUT_CSV, 'utf8'))) {
    const key = row.key?.trim()
    if (!key) continue
    decisions.set(key, {
      decision: row.decision?.trim() ?? '',
      notes: row.notes?.trim() ?? '',
    })
  }

  return decisions
}

function csvEscape(value: unknown): string {
  const s = String(value ?? '')
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

function mdEscape(value: unknown): string {
  return String(value ?? '')
    .replace(/\|/g, '/')
    .replace(/\s+/g, ' ')
    .trim()
}

function truncate(value: string, maxLength: number) {
  if (value.length <= maxLength) return value
  return `${value.slice(0, maxLength - 1).trimEnd()}...`
}

function compactEvidence(candidate: Candidate, maxLength = 260) {
  const bestContext =
    candidate.contexts.find(hit => /ceo|founder|gründer|leder|professor|minister|partner|styre|director|head of|utvalgsleder/i.test(hit.context))
    ?? candidate.contexts[0]

  return truncate(mdEscape(bestContext?.context ?? ''), maxLength)
}

function compactSources(candidate: Candidate, limit = 4) {
  return candidate.sourceHits
    .slice(0, limit)
    .map(hit => hit.title)
    .join('; ')
}

function allContext(candidate: Candidate) {
  return [
    candidate.name,
    candidate.action,
    candidate.status,
    ...candidate.contexts.map(hit => hit.context),
    ...candidate.sourceHits.map(hit => hit.title),
  ].join(' ').toLowerCase()
}

function recommend(candidate: Candidate): Recommendation {
  const text = allContext(candidate)

  if (/ansvarlig redakt|nettredakt|sentralbord|kontakt oss/.test(text)) {
    return {
      bucket: 'EXCLUDE_SOURCE_FOOTER_NOISE',
      importTarget: 'Exclude',
      reason: 'Treffet ser ut som redaksjonell footer/kildeeier, ikke en matsystem- eller selskapsrolle.',
    }
  }

  if (candidate.status === 'actor_contact_only') {
    if (/intern/.test(text)) {
      return {
        bucket: 'KEEP_ACTOR_CONTACT',
        importTarget: 'ActorContact',
        reason: 'Finnes allerede som kontakt/intern rolle; promoter bare hvis personen skal være ekstern profil.',
      }
    }

    if (/\bstatsr(?:a|å)d\b|\bminister\b|matsystemutvalget|stortinget|\bn(?:o|ø)u\b/.test(text)) {
      return {
        bucket: 'REVIEW_POLICY_PROFILE',
        importTarget: 'ActorContact_or_PersonProfile',
        reason: 'Finnes som ActorContact og har politikk-/utvalgskontekst som kan være relevant for personkatalogen.',
      }
    }

    if (/utvalgsleder|statsr[aå]d|minister|professor|ceo|co-founder|founder|gr[uü]nd|cluster manager|director|head of|leder/.test(text)) {
      return {
        bucket: 'REVIEW_ECOSYSTEM_PERSON_PROFILE',
        importTarget: 'ActorContact_or_PersonProfile',
        reason: 'Finnes som ActorContact og har leder-/ekspertkontekst som kan være relevant for personkatalogen.',
      }
    }

    return {
      bucket: 'KEEP_ACTOR_CONTACT',
      importTarget: 'ActorContact',
      reason: 'Finnes allerede som ActorContact; trenger scope-beslutning før personprofil.',
    }
  }

  if (/project partner|steering committee|wp-ledere|cradlenet|ldcluster|lifestyle and design cluster/.test(text)) {
    return {
      bucket: 'REVIEW_PROJECT_PARTNER_PROFILE',
      importTarget: 'ActorContact_or_PersonProfile',
      reason: 'Partner-/styringskontekst i prosjektunderlag; bør verifiseres som kontakt og vurderes for profil.',
    }
  }

  if (/ceo|founder|co-founder|gr[uü]nder|styremedlem|board|director|chief|cluster manager|head of/.test(text)) {
    return {
      bucket: 'REVIEW_ECOSYSTEM_PERSON_PROFILE',
      importTarget: 'PersonProfile',
      reason: 'Leder-/gründer-/styringskontekst i matsystemrelatert virksomhet; må valideres mot kilde.',
    }
  }

  if (/\bprofessor\b|\bforsker\b|research professor|\buniversity\b|\buniversitet\b|\bnhh\b|\bnmbu\b|\bslu\b|\bsyke\b|\bvtt\b|\bdtu\b|\blut\b|research scientist/.test(text)) {
    return {
      bucket: 'REVIEW_ACADEMIC_PROFILE',
      importTarget: 'PersonProfile',
      reason: 'Akademisk eller forskningsbasert ekspertkontekst; kandidat for profil hvis kunnskapsaktører er innenfor scope.',
    }
  }

  if (/\bstatsr(?:a|å)d\b|\bminister\b|matsystemutvalget|stortinget|\bn(?:o|ø)u\b/.test(text)) {
    return {
      bucket: 'REVIEW_POLICY_PROFILE',
      importTarget: 'ActorContact_or_PersonProfile',
      reason: 'Politikk-/utvalgskontekst; bør inn hvis personkatalogen dekker policy-aktører.',
    }
  }

  if (/leder/.test(text)) {
    return {
      bucket: 'REVIEW_ECOSYSTEM_PERSON_PROFILE',
      importTarget: 'PersonProfile',
      reason: 'Leder-/gründer-/styringskontekst i matsystemrelatert virksomhet; må valideres mot kilde.',
    }
  }

  if (candidate.status === 'missing_candidate') {
    return {
      bucket: 'ADD_ACTOR_CONTACT_REVIEW_PROFILE_SCOPE',
      importTarget: 'ActorContact_or_PersonProfile',
      reason: 'Manglende kandidat med flere treff; legg bare inn etter kildevalidering og scope-beslutning.',
    }
  }

  return {
    bucket: 'MANUAL_SOURCE_REVIEW',
    importTarget: 'Undecided',
    reason: 'Konteksten er ikke tydelig nok til automatisk anbefaling.',
  }
}

function table(rows: string[][]) {
  const [header, ...body] = rows
  const separator = header.map(() => '---')
  return [header, separator, ...body].map(row => `| ${row.join(' | ')} |`).join('\n')
}

function countBy<T extends string>(items: T[]) {
  return items.reduce<Record<string, number>>((acc, item) => {
    acc[item] = (acc[item] ?? 0) + 1
    return acc
  }, {})
}

function renderMarkdown(
  input: CandidateFile,
  highCandidates: Candidate[],
  existingDecisions: Map<string, ExistingDecision>,
) {
  const recommendations = new Map(highCandidates.map(candidate => [candidate.key, recommend(candidate)]))
  const byBucket = countBy(highCandidates.map(candidate => recommendations.get(candidate.key)!.bucket))
  const byTarget = countBy(highCandidates.map(candidate => recommendations.get(candidate.key)!.importTarget))

  const summaryRows = [
    ['Metrikk', 'Verdi'],
    ['Generert fra', INPUT_PATH],
    ['Korpus generert', input.generatedAt],
    ['HIGH-kandidater', String(highCandidates.length)],
    ['ActorContact-only blant HIGH', String(highCandidates.filter(candidate => candidate.status === 'actor_contact_only').length)],
    ['Missing candidate blant HIGH', String(highCandidates.filter(candidate => candidate.status === 'missing_candidate').length)],
  ]

  const bucketRows = [
    ['Anbefalt bøtte', 'Antall'],
    ...Object.entries(byBucket).sort((a, b) => b[1] - a[1]).map(([bucket, count]) => [bucket, String(count)]),
  ]

  const targetRows = [
    ['Mulig importmål', 'Antall'],
    ...Object.entries(byTarget).sort((a, b) => b[1] - a[1]).map(([target, count]) => [target, String(count)]),
  ]

  const triageRows = [
    ['Beslutning', 'Navn', 'Status', 'Anbefaling', 'Mål', 'Treff', 'Kilder', 'Evidens'],
    ...highCandidates.map(candidate => {
      const recommendation = recommendations.get(candidate.key)!
      const decision = existingDecisions.get(candidate.key)?.decision
      return [
        decision || '[ ]',
        mdEscape(candidate.name),
        candidate.status,
        recommendation.bucket,
        recommendation.importTarget,
        String(candidate.mentions),
        String(candidate.sources),
        compactEvidence(candidate, 170),
      ]
    }),
  ]

  const detailSections = highCandidates.map((candidate, index) => {
    const recommendation = recommendations.get(candidate.key)!
    const sourceList = candidate.sourceHits
      .map(hit => `- ${hit.kind}: ${hit.title}`)
      .join('\n')
    const contextList = candidate.contexts
      .slice(0, 4)
      .map(hit => `- ${hit.title}: ${truncate(mdEscape(hit.context), 360)}`)
      .join('\n')

    return [
      `### ${index + 1}. ${candidate.name}`,
      '',
      `- Status: ${candidate.status}`,
      `- Foreslått bøtte: ${recommendation.bucket}`,
      `- Mulig importmål: ${recommendation.importTarget}`,
      `- Begrunnelse: ${recommendation.reason}`,
      `- Score: ${candidate.score}; mentions: ${candidate.mentions}; sources: ${candidate.sources}; contextScore: ${candidate.contextScore}`,
      `- Varianter: ${candidate.variants.map(([variant, count]) => `${variant} (${count})`).join(', ')}`,
      '',
      'Kilder:',
      sourceList,
      '',
      'Kontekstutdrag:',
      contextList,
    ].join('\n')
  })

  return [
    '# Personer: HIGH-kandidater for manuell review',
    '',
    `Dato: 2026-04-28`,
    '',
    'Dette er en triagefil for de 33 høyest prioriterte personkandidatene fra råkorpus-passet. Den er ikke en importliste. Hver kandidat må valideres mot kilde og scope før `PersonProfile` eller `ActorContact` oppdateres.',
    '',
    '## Arbeidsregler',
    '',
    '- Bruk `PersonProfile` bare når personen faktisk skal være del av person-/interlocking-katalogen eller økosystemprofilene.',
    '- Bruk `ActorContact` når personen primært er kontakt, prosjektpartner, møteperson eller intern ressurs.',
    '- Ekskluder kildefootere, redaktørnavn, rapportmetadata og andre treff som ikke beskriver en relevant personrolle.',
    '- Ikke importer kandidater automatisk fra denne filen.',
    '- Generatoren bevarer eksisterende `decision` og `notes` i CSV-en når den kjøres på nytt.',
    '',
    'Gyldige beslutningsverdier: `add_person_profile`, `add_actor_contact`, `add_both`, `keep_actor_contact`, `exclude`, `needs_source_check`, `defer`.',
    '',
    '## Oppsummering',
    '',
    table(summaryRows),
    '',
    '## Anbefalte Bøtter',
    '',
    table(bucketRows),
    '',
    '## Mulige Importmål',
    '',
    table(targetRows),
    '',
    '## Reviewtabell',
    '',
    table(triageRows),
    '',
    '## Detaljer',
    '',
    ...detailSections,
    '',
  ].join('\n')
}

function renderCsv(highCandidates: Candidate[], existingDecisions: Map<string, ExistingDecision>) {
  const header = [
    'decision',
    'name',
    'key',
    'status',
    'suggested_bucket',
    'suggested_import_target',
    'reason',
    'mentions',
    'sources',
    'score',
    'context_score',
    'evidence',
    'source_examples',
    'notes',
  ]

  const rows = highCandidates.map(candidate => {
    const recommendation = recommend(candidate)
    const existing = existingDecisions.get(candidate.key)
    return [
      existing?.decision ?? '',
      candidate.name,
      candidate.key,
      candidate.status,
      recommendation.bucket,
      recommendation.importTarget,
      recommendation.reason,
      candidate.mentions,
      candidate.sources,
      candidate.score,
      candidate.contextScore,
      compactEvidence(candidate, 360),
      compactSources(candidate, 8),
      existing?.notes ?? '',
    ].map(csvEscape)
  })

  return [header, ...rows].map(row => row.join(',')).join('\n')
}

function main() {
  const input = JSON.parse(readFileSync(INPUT_PATH, 'utf8')) as CandidateFile
  const existingDecisions = loadExistingDecisions()
  const highCandidates = input.candidates
    .filter(candidate => candidate.priority === 'HIGH')
    .sort((a, b) => b.score - a.score || b.sources - a.sources || a.name.localeCompare(b.name, 'nb'))

  mkdirSync(dirname(OUT_MD), { recursive: true })
  mkdirSync(dirname(OUT_CSV), { recursive: true })
  writeFileSync(OUT_MD, renderMarkdown(input, highCandidates, existingDecisions))
  writeFileSync(OUT_CSV, `${renderCsv(highCandidates, existingDecisions)}\n`)

  const byBucket = countBy(highCandidates.map(candidate => recommend(candidate).bucket))
  const preservedDecisions = highCandidates.filter(candidate => existingDecisions.get(candidate.key)?.decision).length
  console.log(`Wrote ${OUT_MD}`)
  console.log(`Wrote ${OUT_CSV}`)
  console.log(`HIGH candidates: ${highCandidates.length}`)
  console.log(`Preserved decisions: ${preservedDecisions}`)
  console.log(`Allowed decisions: ${DECISION_VALUES.join(', ')}`)
  console.log(JSON.stringify(byBucket, null, 2))
}

main()
