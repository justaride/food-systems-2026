import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

type Candidate = Record<string, string>

const candidatePath = resolve(
  process.cwd(),
  'research/bibliotek/media/media-source-candidates-2026-04-29.csv',
)

const expectedHeaders = [
  'id',
  'priority',
  'status',
  'country',
  'theme',
  'source_type',
  'outlet',
  'title',
  'year',
  'url',
  'capture_method',
  'poison_pill_risk',
  'coding_target',
  'next_action',
  'notes',
]

const allowedPriorities = new Set(['P1', 'P2', 'P3', 'WATCH'])
const allowedCountries = new Set(['no', 'se', 'dk', 'fi', 'is', 'nordic'])
const allowedThemes = new Set([
  'beredskap',
  'prispress',
  'markedsmakt',
  'sirkularitet',
  'innovasjon',
  'regulering',
])
const allowedStatuses = new Set([
  'already_in_corpus',
  'candidate_fetch',
  'candidate_manual',
  'existing_backlog',
  'watch_2026',
])

function parseCsv(text: string) {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    const next = text[index + 1]

    if (char === '"' && inQuotes && next === '"') {
      cell += '"'
      index += 1
      continue
    }

    if (char === '"') {
      inQuotes = !inQuotes
      continue
    }

    if (char === ',' && !inQuotes) {
      row.push(cell)
      cell = ''
      continue
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') index += 1
      row.push(cell)
      if (row.some(value => value.trim().length > 0)) rows.push(row)
      row = []
      cell = ''
      continue
    }

    cell += char
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell)
    if (row.some(value => value.trim().length > 0)) rows.push(row)
  }

  return rows
}

function groupCount(rows: Candidate[], key: keyof Candidate) {
  const counts = new Map<string, number>()
  for (const row of rows) {
    const value = row[key] || '(blank)'
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }
  return [...counts.entries()].sort((left, right) => left[0].localeCompare(right[0]))
}

function printCounts(label: string, rows: [string, number][]) {
  console.log(`\n${label}`)
  console.log('-'.repeat(label.length))
  for (const [key, count] of rows) {
    console.log(`${key}: ${count}`)
  }
}

function pass(message: string) {
  console.log(`OK   ${message}`)
}

function warn(message: string) {
  console.log(`WARN ${message}`)
}

function fail(message: string) {
  console.log(`FAIL ${message}`)
}

const csv = readFileSync(candidatePath, 'utf8')
const [headers, ...rawRows] = parseCsv(csv)

if (!headers) {
  throw new Error(`No CSV headers found in ${candidatePath}`)
}

const candidates = rawRows.map(row =>
  Object.fromEntries(headers.map((header, index) => [header, row[index] ?? ''])),
) as Candidate[]

console.log('Media source candidate audit')
console.log('============================')
console.log(candidatePath)
console.log(`Rows: ${candidates.length}`)

console.log('\nGate checks')
console.log('-----------')

if (JSON.stringify(headers) === JSON.stringify(expectedHeaders)) {
  pass('CSV headers match expected schema')
} else {
  fail(`CSV headers differ from expected schema: ${headers.join(', ')}`)
}

const ids = new Map<string, number>()
const urls = new Map<string, number>()
for (const row of candidates) {
  ids.set(row.id, (ids.get(row.id) ?? 0) + 1)
  urls.set(row.url, (urls.get(row.url) ?? 0) + 1)
}

const duplicateIds = [...ids.entries()].filter(([, count]) => count > 1)
const duplicateUrls = [...urls.entries()].filter(([url, count]) => url && count > 1)

if (duplicateIds.length === 0) pass('No duplicate ids')
else fail(`Duplicate ids: ${duplicateIds.map(([id]) => id).join(', ')}`)

if (duplicateUrls.length === 0) pass('No duplicate URLs')
else fail(`Duplicate URLs: ${duplicateUrls.map(([url]) => url).join(', ')}`)

const invalidRows = candidates.filter(row => {
  const validUrl = row.url.startsWith('https://') || row.url.startsWith('http://')
  return (
    !allowedPriorities.has(row.priority) ||
    !allowedStatuses.has(row.status) ||
    !allowedCountries.has(row.country) ||
    !allowedThemes.has(row.theme) ||
    !validUrl
  )
})

if (invalidRows.length === 0) {
  pass('All rows use allowed priority/status/country/theme values and URL format')
} else {
  fail(`Rows with invalid controlled values: ${invalidRows.map(row => row.id).join(', ')}`)
}

for (const country of ['no', 'se', 'dk', 'fi', 'is']) {
  const count = candidates.filter(row => row.country === country).length
  if (count >= 7) pass(`${country}: ${count} candidates`)
  else warn(`${country}: only ${count} candidates`)
}

const p1Fetchable = candidates.filter(
  row => row.priority === 'P1' && row.status === 'candidate_fetch',
)
if (p1Fetchable.length >= 10) {
  pass(`P1 fetch queue has ${p1Fetchable.length} rows`)
} else {
  warn(`P1 fetch queue is small: ${p1Fetchable.length} rows`)
}

const highPaywall = candidates.filter(row => row.poison_pill_risk === 'high_paywall')
if (highPaywall.every(row => row.status === 'candidate_manual' || row.status === 'watch_2026')) {
  pass(`High-paywall rows are manual/watch only (${highPaywall.length})`)
} else {
  warn('Some high-paywall rows are not manual/watch only')
}

printCounts('By country', groupCount(candidates, 'country'))
printCounts('By status', groupCount(candidates, 'status'))
printCounts('By priority', groupCount(candidates, 'priority'))
printCounts('By theme', groupCount(candidates, 'theme'))
printCounts('By poison risk', groupCount(candidates, 'poison_pill_risk'))

console.log('\nNext fetch queue')
console.log('----------------')
for (const row of p1Fetchable.slice(0, 20)) {
  console.log(`${row.id} | ${row.country} | ${row.theme} | ${row.title}`)
}
