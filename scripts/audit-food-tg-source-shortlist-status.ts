import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const ROOT = process.cwd()
const SHORTLIST_PATH = path.join(ROOT, 'docs/project/mandates/source-shortlist-food-tg.md')
const OUT_MD = path.join(ROOT, 'docs/project/mandates/source-shortlist-food-tg-db-status-2026-04-29.md')
const OUT_CSV = path.join(ROOT, 'docs/project/mandates/source-shortlist-food-tg-db-status-2026-04-29.csv')

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

type ShortlistEntry = {
  id: string
  reference: string
  quality: string
  tags: string
  note: string
}

type DbHit = {
  layer: 'Document' | 'Report' | 'SourceDoc' | 'Thesis'
  id: string
  title: string
  documentId: string | null
  filePath?: string | null
  url?: string | null
  match: string
}

type StatusRow = ShortlistEntry & {
  localPaths: string[]
  localExists: string
  urls: string[]
  dbHits: DbHit[]
  status: string
  gate: string
  nextAction: string
  manualCheck: boolean
}

function splitMarkdownRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim())
}

function parseShortlist(text: string): ShortlistEntry[] {
  const entries: ShortlistEntry[] = []
  for (const line of text.split('\n')) {
    if (!line.startsWith('| SRC-')) continue
    const cols = splitMarkdownRow(line)
    if (cols.length < 5) continue
    entries.push({
      id: cols[0],
      reference: cols[1],
      quality: cols[2],
      tags: cols[3],
      note: cols[4],
    })
  }
  return entries
}

function parseManualChecks(text: string): Set<string> {
  const manual = new Set<string>()
  const start = text.indexOf('## Kilder som krever manuell sjekk')
  if (start < 0) return manual
  const section = text.slice(start)
  for (const line of section.split('\n')) {
    if (!line.startsWith('| SRC-')) continue
    const [idCell] = splitMarkdownRow(line)
    for (const id of idCell.match(/SRC-[A-Z]+-\d{3}/g) ?? []) {
      manual.add(id)
    }
    const range = idCell.match(/(SRC-[A-Z]+-)(\d{3})\s+til\s+SRC-[A-Z]+-(\d{3})/)
    if (range) {
      const prefix = range[1]
      const from = Number(range[2])
      const to = Number(range[3])
      for (let n = from; n <= to; n += 1) manual.add(`${prefix}${String(n).padStart(3, '0')}`)
    }
  }
  return manual
}

function cleanUrl(url: string): string {
  return url
    .replace(/[),.;]+$/g, '')
    .replace(/\/$/, '')
    .trim()
}

function normalizeUrl(url: string | null | undefined): string {
  if (!url) return ''
  try {
    const parsed = new URL(cleanUrl(url))
    parsed.hash = ''
    return parsed.toString().replace(/\/$/, '').toLowerCase()
  } catch {
    return cleanUrl(url).replace(/\/$/, '').toLowerCase()
  }
}

function extractUrls(text: string): string[] {
  const urls = text.match(/https?:\/\/[^\s`,]+/g) ?? []
  return [...new Set(urls.map(cleanUrl))]
}

function extractLocalPaths(text: string): string[] {
  const paths = new Set<string>()
  const researchRefs = text.match(/research\/[^\s`,)]+/g) ?? []
  const srcRefs = text.match(/src\/[^\s`,)]+/g) ?? []
  const docsRefs = text.match(/docs\/[^\s`,)]+/g) ?? []
  for (const ref of [...researchRefs, ...srcRefs, ...docsRefs]) {
    paths.add(ref.replace(/[),.;]+$/g, ''))
  }
  return [...paths]
}

function existsLabel(localPaths: string[]): string {
  if (localPaths.length === 0) return ''
  return localPaths
    .map((p) => `${p}:${fs.existsSync(path.join(ROOT, p)) ? 'yes' : 'no'}`)
    .join('; ')
}

function normPath(value: string | null | undefined): string {
  return (value ?? '').replace(/^\.\//, '').replace(/\\/g, '/')
}

function pathCandidates(p: string): Set<string> {
  const out = new Set<string>()
  const normalized = normPath(p)
  out.add(normalized)
  if (normalized.startsWith('research/')) out.add(normalized.slice('research/'.length))
  else out.add(`research/${normalized}`)
  out.add(path.basename(normalized))
  return out
}

function textKey(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\p{Letter}\p{Number}]+/gu, ' ')
    .trim()
}

function distinctiveTokens(value: string): string[] {
  const stop = new Set([
    'research',
    'https',
    'www',
    'pdf',
    'html',
    'primar',
    'sekundaer',
    'rapport',
    'source',
    'kilde',
    'norge',
    'nordic',
    'food',
    'mat',
    'og',
    'om',
    'the',
    'for',
    'with',
    'from',
    '2024',
    '2025',
    '2026',
  ])
  return [...new Set(textKey(value).split(/\s+/).filter((t) => t.length >= 5 && !stop.has(t)))].slice(0, 8)
}

function rowText(entry: ShortlistEntry): string {
  return `${entry.reference} ${entry.note}`
}

function csvEscape(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

function mdCell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\n/g, ' ')
}

function shortTitle(value: string): string {
  return value.length > 84 ? `${value.slice(0, 81)}...` : value
}

function hitLabel(hit: DbHit): string {
  const doc = hit.documentId ? ` -> Doc:${hit.documentId}` : ''
  return `${hit.layer}:${hit.id}${doc} (${shortTitle(hit.title)}) [${hit.match}]`
}

async function main() {
  if (!fs.existsSync(SHORTLIST_PATH)) throw new Error(`Missing shortlist: ${SHORTLIST_PATH}`)
  const text = fs.readFileSync(SHORTLIST_PATH, 'utf-8')
  const entries = parseShortlist(text)
  const manualChecks = parseManualChecks(text)

  const [documents, reports, sourceDocs, theses] = await Promise.all([
    prisma.document.findMany({
      select: {
        id: true,
        title: true,
        filePath: true,
        url: true,
        report: { select: { id: true } },
        sourceDoc: { select: { id: true } },
        thesis: { select: { id: true } },
      },
    }),
    prisma.report.findMany({
      select: { id: true, title: true, fullTitle: true, sourceUrl: true, documentId: true },
    }),
    prisma.sourceDoc.findMany({
      select: { id: true, filename: true, title: true, url: true, documentId: true },
    }),
    prisma.thesis.findMany({
      select: { id: true, title: true, url: true, documentId: true },
    }),
  ])

  const byPath = new Map<string, DbHit[]>()
  const byUrl = new Map<string, DbHit[]>()
  const allHits: DbHit[] = []

  function addPath(key: string | null | undefined, hit: DbHit) {
    const normalized = normPath(key)
    if (!normalized) return
    for (const candidate of pathCandidates(normalized)) {
      const arr = byPath.get(candidate) ?? []
      arr.push(hit)
      byPath.set(candidate, arr)
    }
  }

  function addUrl(key: string | null | undefined, hit: DbHit) {
    const normalized = normalizeUrl(key)
    if (!normalized) return
    const arr = byUrl.get(normalized) ?? []
    arr.push(hit)
    byUrl.set(normalized, arr)
  }

  for (const d of documents) {
    const hit: DbHit = {
      layer: 'Document',
      id: d.id,
      title: d.title,
      documentId: d.id,
      filePath: d.filePath,
      url: d.url,
      match: 'document-index',
    }
    allHits.push(hit)
    addPath(d.filePath, hit)
    addUrl(d.url, hit)
  }

  for (const r of reports) {
    const hit: DbHit = {
      layer: 'Report',
      id: r.id,
      title: r.fullTitle ?? r.title,
      documentId: r.documentId,
      url: r.sourceUrl,
      match: 'report-index',
    }
    allHits.push(hit)
    addUrl(r.sourceUrl, hit)
  }

  for (const s of sourceDocs) {
    const hit: DbHit = {
      layer: 'SourceDoc',
      id: s.id,
      title: s.title ?? s.filename,
      documentId: s.documentId,
      filePath: s.filename,
      url: s.url,
      match: 'sourcedoc-index',
    }
    allHits.push(hit)
    addPath(s.filename, hit)
    addUrl(s.url, hit)
  }

  for (const t of theses) {
    const hit: DbHit = {
      layer: 'Thesis',
      id: t.id,
      title: t.title,
      documentId: t.documentId,
      url: t.url,
      match: 'thesis-index',
    }
    allHits.push(hit)
    addUrl(t.url, hit)
  }

  function findDbHits(entry: ShortlistEntry, localPaths: string[], urls: string[]): DbHit[] {
    const hits = new Map<string, DbHit>()
    for (const localPath of localPaths) {
      for (const candidate of pathCandidates(localPath)) {
        for (const hit of byPath.get(candidate) ?? []) {
          hits.set(`${hit.layer}:${hit.id}`, { ...hit, match: `path:${candidate}` })
        }
      }
    }
    for (const url of urls) {
      const normalized = normalizeUrl(url)
      for (const hit of byUrl.get(normalized) ?? []) {
        hits.set(`${hit.layer}:${hit.id}`, { ...hit, match: 'url:exact' })
      }
    }

    const thesisIds = rowText(entry).match(/`([a-z0-9-]+-\d{4})`/g) ?? []
    for (const quoted of thesisIds) {
      const id = quoted.replace(/`/g, '')
      const thesis = theses.find((t) => t.id === id)
      if (thesis) {
        hits.set(`Thesis:${thesis.id}`, {
          layer: 'Thesis',
          id: thesis.id,
          title: thesis.title,
          documentId: thesis.documentId,
          url: thesis.url,
          match: 'thesis-id',
        })
      }
    }

    if (hits.size === 0) {
      const tokens = distinctiveTokens(rowText(entry))
      if (tokens.length >= 2) {
        for (const hit of allHits) {
          const haystack = textKey(`${hit.title} ${hit.url ?? ''} ${hit.filePath ?? ''}`)
          const score = tokens.filter((token) => haystack.includes(token)).length
          if (score >= Math.min(3, tokens.length)) {
            hits.set(`${hit.layer}:${hit.id}`, { ...hit, match: `fuzzy:${score}` })
          }
        }
      }
    }

    return [...hits.values()].sort((a, b) => `${a.layer}:${a.id}`.localeCompare(`${b.layer}:${b.id}`))
  }

  function classify(entry: ShortlistEntry, localPaths: string[], urls: string[], dbHits: DbHit[], manualCheck: boolean) {
    const anyLocal = localPaths.some((p) => fs.existsSync(path.join(ROOT, p)))
    const hasLocalRefs = localPaths.length > 0
    const hasSrcRef = localPaths.some((p) => p.startsWith('src/'))
    const hasDocument = dbHits.some((hit) => hit.layer === 'Document' || hit.documentId)
    const hasTypedDb = dbHits.some((hit) => ['Report', 'SourceDoc', 'Thesis'].includes(hit.layer))
    const hasDbLinked = dbHits.some((hit) => hit.documentId)
    const onlyFuzzyHits = dbHits.length > 0 && dbHits.every((hit) => hit.match.startsWith('fuzzy:'))
    const quality = entry.quality.toLowerCase()

    let status = 'needs-primary-check'
    if (onlyFuzzyHits) status = 'db-candidate-review'
    else if (hasDbLinked || (hasDocument && hasTypedDb)) status = 'db-linked'
    else if (dbHits.length > 0) status = 'db-record-only'
    else if (hasSrcRef) status = 'static-only'
    else if (anyLocal) status = 'repo-only'
    else if (hasLocalRefs) status = 'missing-local'
    else if (urls.length > 0) status = 'external-only'

    let gate = 'needs-primary-check'
    if (quality.includes('uvalidert')) gate = 'internal-only'
    else if (quality.includes('intern')) gate = 'internal-synthesis'
    else if (manualCheck) gate = 'requires-manual-check'
    else if (status === 'db-linked' && (quality.includes('prim') || quality.includes('sek'))) gate = 'external-ready-candidate'

    let nextAction = 'Primærsjekk før ekstern bruk.'
    if (status === 'db-linked' && gate === 'external-ready-candidate') {
      nextAction = 'Kan brukes som kandidat i evidence matrix; legg på sidetall/claim-ID.'
    } else if (status === 'db-linked') {
      nextAction = 'DB-lenke finnes; behold manuell sjekk/forbehold fra shortlist.'
    } else if (status === 'db-record-only') {
      nextAction = 'Koble DB-rad til Document/PDF eller marker som URL-only kilde.'
    } else if (status === 'db-candidate-review') {
      nextAction = 'Kontroller fuzzy DB-treff manuelt før raden regnes som DB-lenket.'
    } else if (status === 'repo-only') {
      nextAction = 'Importer eller lenk lokal fil til Document/SourceDoc/Report.'
    } else if (status === 'static-only') {
      nextAction = 'Behold som strukturert repo-data; ikke bruk som ekstern kilde.'
    } else if (status === 'external-only') {
      nextAction = 'Last ned/speil primærkilde eller opprett SourceDoc før tung bruk.'
    } else if (status === 'missing-local') {
      nextAction = 'Avklar om filen er flyttet, mangler, eller kun er backlog-referanse.'
    }

    return { status, gate, nextAction }
  }

  const rows: StatusRow[] = entries.map((entry) => {
    const fullText = rowText(entry)
    const localPaths = extractLocalPaths(fullText)
    const urls = extractUrls(fullText)
    const dbHits = findDbHits(entry, localPaths, urls)
    const manualCheck = manualChecks.has(entry.id)
    const { status, gate, nextAction } = classify(entry, localPaths, urls, dbHits, manualCheck)
    return {
      ...entry,
      localPaths,
      localExists: existsLabel(localPaths),
      urls,
      dbHits,
      status,
      gate,
      nextAction,
      manualCheck,
    }
  })

  const statusCounts = new Map<string, number>()
  const gateCounts = new Map<string, number>()
  for (const row of rows) {
    statusCounts.set(row.status, (statusCounts.get(row.status) ?? 0) + 1)
    gateCounts.set(row.gate, (gateCounts.get(row.gate) ?? 0) + 1)
  }

  const csv = [
    [
      'id',
      'quality',
      'tags',
      'status',
      'gate',
      'manual_check',
      'local_paths',
      'local_exists',
      'urls',
      'db_hits',
      'next_action',
      'reference',
      'note',
    ].join(','),
    ...rows.map((row) =>
      [
        row.id,
        row.quality,
        row.tags,
        row.status,
        row.gate,
        String(row.manualCheck),
        row.localPaths.join('; '),
        row.localExists,
        row.urls.join('; '),
        row.dbHits.map(hitLabel).join('; '),
        row.nextAction,
        row.reference,
        row.note,
      ]
        .map(csvEscape)
        .join(','),
    ),
  ].join('\n')

  const linkedRows = rows.filter((row) => row.status === 'db-linked')
  const actionRows = rows.filter((row) => row.status !== 'db-linked')
  const priorityRows = rows.filter((row) =>
    ['primær', 'primær/sekundær', 'sekundær'].includes(row.quality) && row.status !== 'db-linked',
  )

  const md = [
    '---',
    'tittel: Food TG source shortlist DB-status',
    'status: Utført internt',
    'eier: Gabriel',
    'sist_oppdatert: 2026-04-29',
    'kilde: docs/project/mandates/source-shortlist-food-tg.md',
    'generert_av: scripts/audit-food-tg-source-shortlist-status.ts',
    '---',
    '',
    '# Food TG source shortlist DB-status',
    '',
    'Maskinell kryssing av shortlisten mot lokale filer og DB-lagene `Document`, `Report`, `SourceDoc` og `Thesis`. Dette er en operativ ryddestatus, ikke ekstern validering.',
    '',
    '## Sammendrag',
    '',
    `- Shortlist-rader kontrollert: ${rows.length}`,
    `- DB-lenket: ${linkedRows.length}`,
    `- Krever import/lenking/avklaring: ${actionRows.length}`,
    `- Primær/sekundær-rader som ikke er DB-lenket: ${priorityRows.length}`,
    `- CSV-detaljer: \`docs/project/mandates/${path.basename(OUT_CSV)}\``,
    '',
    '## Statusfordeling',
    '',
    '| Status | Antall |',
    '|---|---:|',
    ...[...statusCounts.entries()].sort().map(([status, count]) => `| ${status} | ${count} |`),
    '',
    '## Gatefordeling',
    '',
    '| Gate | Antall |',
    '|---|---:|',
    ...[...gateCounts.entries()].sort().map(([gate, count]) => `| ${gate} | ${count} |`),
    '',
    '## Prioritert oppryddingskø',
    '',
    '| ID | Kvalitet | Status | Gate | DB-treff | Neste handling |',
    '|---|---|---|---|---|---|',
    ...priorityRows.map((row) => {
      const dbHits = row.dbHits.map(hitLabel).join('<br>') || ''
      return `| ${row.id} | ${row.quality} | ${row.status} | ${row.gate} | ${mdCell(dbHits)} | ${row.nextAction} |`
    }),
    '',
    '## Full status',
    '',
    '| ID | Kvalitet | Status | Gate | DB-treff | Lokalt | Neste handling |',
    '|---|---|---|---|---|---|---|',
    ...rows.map((row) => {
      const dbHits = row.dbHits.map(hitLabel).join('<br>') || ''
      const local = row.localExists || (row.urls.length ? 'url-only' : '')
      return `| ${row.id} | ${row.quality} | ${row.status} | ${row.gate} | ${mdCell(dbHits)} | ${mdCell(local)} | ${row.nextAction} |`
    }),
    '',
    '## Statusdefinisjoner',
    '',
    '- `db-linked`: funnet med koblet `Document` via `Report`, `SourceDoc`, `Thesis` eller direkte `Document`.',
    '- `db-record-only`: funnet i DB som rad/URL/tittel, men uten dokumentkobling.',
    '- `db-candidate-review`: bare fuzzy-treff i DB; må kontrolleres manuelt før den teller som DB-lenket.',
    '- `repo-only`: lokal `research/`-fil finnes, men ingen DB-kobling ble funnet.',
    '- `static-only`: peker til `src/lib/data/...` eller annen strukturert repo-data, ikke ekstern kilde.',
    '- `external-only`: URL i shortlist, men ikke funnet som DB-koblet kilde.',
    '- `missing-local`: shortlist peker til lokal filsti som ikke finnes i arbeidsområdet.',
    '- `needs-primary-check`: ikke tilstrekkelig grunnlag for ekstern bruk uten manuell primærsjekk.',
    '',
  ].join('\n')

  fs.writeFileSync(OUT_CSV, `${csv}\n`)
  fs.writeFileSync(OUT_MD, md)

  console.log(
    JSON.stringify(
      {
        entries: rows.length,
        statusCounts: Object.fromEntries([...statusCounts.entries()].sort()),
        gateCounts: Object.fromEntries([...gateCounts.entries()].sort()),
        priorityRows: priorityRows.length,
        outMd: path.relative(ROOT, OUT_MD),
        outCsv: path.relative(ROOT, OUT_CSV),
      },
      null,
      2,
    ),
  )
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
