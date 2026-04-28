import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname } from 'path'

const INPUT_CSV = 'research/_status/person-high-priority-review-2026-04-28.csv'
const OUT_MD = 'docs/project/mandates/personer-high-priority-decision-preflight-2026-04-28.md'
const OUT_JSON = 'research/_status/person-high-priority-decision-preflight-2026-04-28.json'

const ALLOWED_DECISIONS = new Set([
  '',
  'add_person_profile',
  'add_actor_contact',
  'add_both',
  'keep_actor_contact',
  'exclude',
  'needs_source_check',
  'defer',
])

const IMPORT_DECISIONS = new Set(['add_person_profile', 'add_actor_contact', 'add_both'])

type ReviewRow = {
  decision: string
  name: string
  key: string
  status: string
  suggested_bucket: string
  suggested_import_target: string
  reason: string
  mentions: string
  sources: string
  score: string
  context_score: string
  evidence: string
  source_examples: string
  notes: string
}

type RowIssue = {
  key: string
  name: string
  severity: 'WARN' | 'ERROR'
  issue: string
}

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

function csvRows() {
  return parseCsv(readFileSync(INPUT_CSV, 'utf8')) as ReviewRow[]
}

function countBy(items: string[]) {
  return items.reduce<Record<string, number>>((acc, item) => {
    acc[item] = (acc[item] ?? 0) + 1
    return acc
  }, {})
}

function mdEscape(value: unknown) {
  return String(value ?? '')
    .replace(/\|/g, '/')
    .replace(/\s+/g, ' ')
    .trim()
}

function table(rows: Array<Array<string | number>>) {
  const [header, ...body] = rows
  const separator = header.map(() => '---')
  return [header, separator, ...body].map(row => `| ${row.join(' | ')} |`).join('\n')
}

function validateRow(row: ReviewRow): RowIssue[] {
  const issues: RowIssue[] = []
  const decision = row.decision.trim()

  if (!ALLOWED_DECISIONS.has(decision)) {
    issues.push({
      key: row.key,
      name: row.name,
      severity: 'ERROR',
      issue: `Ugyldig decision: ${decision}`,
    })
    return issues
  }

  if (!decision) return issues

  if (decision === 'keep_actor_contact' && row.status !== 'actor_contact_only') {
    issues.push({
      key: row.key,
      name: row.name,
      severity: 'WARN',
      issue: '`keep_actor_contact` brukes normalt bare når status er `actor_contact_only`.',
    })
  }

  if (decision === 'add_actor_contact' && row.status === 'actor_contact_only') {
    issues.push({
      key: row.key,
      name: row.name,
      severity: 'WARN',
      issue: 'Raden er allerede `actor_contact_only`; bruk heller `keep_actor_contact` eller `add_both`.',
    })
  }

  if (IMPORT_DECISIONS.has(decision) && row.suggested_import_target === 'Exclude') {
    issues.push({
      key: row.key,
      name: row.name,
      severity: 'WARN',
      issue: 'Importbeslutning mot en rad som er foreslått ekskludert.',
    })
  }

  if ((decision === 'exclude' || decision === 'needs_source_check') && !row.notes.trim()) {
    issues.push({
      key: row.key,
      name: row.name,
      severity: 'WARN',
      issue: '`exclude` og `needs_source_check` bør ha kort begrunnelse i `notes`.',
    })
  }

  return issues
}

function renderMarkdown(rows: ReviewRow[], issues: RowIssue[]) {
  const decisionCounts = countBy(rows.map(row => row.decision.trim() || '<blank>'))
  const readyPersonProfiles = rows.filter(row => ['add_person_profile', 'add_both'].includes(row.decision.trim()))
  const readyActorContacts = rows.filter(row => ['add_actor_contact', 'add_both'].includes(row.decision.trim()))
  const blankRows = rows.filter(row => !row.decision.trim())
  const errors = issues.filter(issue => issue.severity === 'ERROR')
  const warnings = issues.filter(issue => issue.severity === 'WARN')
  const ready = errors.length === 0 && blankRows.length === 0

  const summaryRows = [
    ['Metrikk', 'Verdi'],
    ['Input', INPUT_CSV],
    ['Rader', rows.length],
    ['Blanke decisions', blankRows.length],
    ['Ugyldige decisions', errors.length],
    ['Varsler', warnings.length],
    ['Klar for importbatch', ready ? 'JA' : 'NEI'],
    ['PersonProfile-rader klare', readyPersonProfiles.length],
    ['ActorContact-rader klare', readyActorContacts.length],
  ]

  const decisionRows = [
    ['Decision', 'Antall'],
    ...Object.entries(decisionCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([decision, count]) => [decision, String(count)]),
  ]

  const issueRows = [
    ['Severity', 'Navn', 'Issue'],
    ...issues.map(issue => [issue.severity, mdEscape(issue.name), mdEscape(issue.issue)]),
  ]

  const importRows = [
    ['Decision', 'Navn', 'Mål', 'Kildeeksempler'],
    ...rows
      .filter(row => IMPORT_DECISIONS.has(row.decision.trim()))
      .map(row => [
        row.decision.trim(),
        mdEscape(row.name),
        row.suggested_import_target,
        mdEscape(row.source_examples).slice(0, 180),
      ]),
  ]

  return [
    '# Personer: decision preflight',
    '',
    'Denne rapporten validerer `decision`-kolonnen før import. Den skriver ikke til databasen.',
    '',
    '## Oppsummering',
    '',
    table(summaryRows),
    '',
    '## Decision-fordeling',
    '',
    table(decisionRows),
    '',
    '## Importkandidater',
    '',
    importRows.length > 1 ? table(importRows) : 'Ingen rader er besluttet for import ennå.',
    '',
    '## Varsler og Feil',
    '',
    issueRows.length > 1 ? table(issueRows) : 'Ingen feil eller varsler.',
    '',
  ].join('\n')
}

function main() {
  const rows = csvRows()
  const issues = rows.flatMap(validateRow)
  const errors = issues.filter(issue => issue.severity === 'ERROR')
  const blankRows = rows.filter(row => !row.decision.trim())
  const readyPersonProfiles = rows.filter(row => ['add_person_profile', 'add_both'].includes(row.decision.trim()))
  const readyActorContacts = rows.filter(row => ['add_actor_contact', 'add_both'].includes(row.decision.trim()))

  const result = {
    generatedAt: new Date().toISOString(),
    input: INPUT_CSV,
    allowedDecisions: [...ALLOWED_DECISIONS].filter(Boolean),
    readyForImportBatch: errors.length === 0 && blankRows.length === 0,
    summary: {
      rows: rows.length,
      blankDecisions: blankRows.length,
      invalidDecisions: errors.length,
      warnings: issues.length - errors.length,
      readyPersonProfileRows: readyPersonProfiles.length,
      readyActorContactRows: readyActorContacts.length,
    },
    decisionCounts: countBy(rows.map(row => row.decision.trim() || '<blank>')),
    readyPersonProfiles: readyPersonProfiles.map(row => ({ key: row.key, name: row.name, decision: row.decision })),
    readyActorContacts: readyActorContacts.map(row => ({ key: row.key, name: row.name, decision: row.decision })),
    issues,
  }

  mkdirSync(dirname(OUT_MD), { recursive: true })
  mkdirSync(dirname(OUT_JSON), { recursive: true })
  writeFileSync(OUT_MD, renderMarkdown(rows, issues))
  writeFileSync(OUT_JSON, `${JSON.stringify(result, null, 2)}\n`)

  console.log(`Wrote ${OUT_MD}`)
  console.log(`Wrote ${OUT_JSON}`)
  console.log(`Rows: ${rows.length}`)
  console.log(`Blank decisions: ${blankRows.length}`)
  console.log(`Invalid decisions: ${errors.length}`)
  console.log(`Ready for importbatch: ${result.readyForImportBatch ? 'yes' : 'no'}`)

  if (errors.length > 0) process.exitCode = 1
}

main()
