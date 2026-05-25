import 'dotenv/config'
import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'
import { reports } from '../prisma/seed-data/reports'
import { theses } from '../prisma/seed-data/theses'
import { parseCsvRecords } from '../src/lib/csv'
import {
  collectDatabaseUrlRows,
  collectTypedUrlRows,
  type Protocol,
  type SourceType,
  type UrlRow,
} from '../src/lib/source-url-inventory'

function csvEscape(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

function loadKiPriority(root: string): Map<string, number> {
  const map = new Map<string, number>()
  const path = join(root, 'research', 'KI-PRIORITY.csv')
  let raw: string
  try {
    raw = readFileSync(path, 'utf-8')
  } catch {
    return map
  }
  for (const row of parseCsvRecords(raw)) {
    const id = row.id
    const score = parseFloat(row.score)
    if (!Number.isNaN(score)) map.set(id, score)
  }
  return map
}

async function collectDbRows(priorityMap: Map<string, number>): Promise<UrlRow[]> {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.warn('DATABASE_URL is not set; skipping DB-backed Document/SourceDoc URL inventory')
    return []
  }

  const adapter = new PrismaPg({ connectionString })
  const prisma = new PrismaClient({ adapter })

  try {
    const [documents, sourceDocs] = await Promise.all([
      prisma.document.findMany({
        where: { url: { not: null } },
        select: { id: true, slug: true, url: true },
      }),
      prisma.sourceDoc.findMany({
        where: { url: { not: null } },
        select: { id: true, url: true },
      }),
    ])

    return collectDatabaseUrlRows({ documents, sourceDocs, priorityMap })
  } finally {
    await prisma.$disconnect()
  }
}

async function collectRows(priorityMap: Map<string, number>, includeDb: boolean): Promise<UrlRow[]> {
  const rows = collectTypedUrlRows({ reports, theses, priorityMap })
  if (!includeDb) return rows

  const dbRows = await collectDbRows(priorityMap)
  return [...rows, ...dbRows]
}

async function main(): Promise<void> {
  const includeDb = !process.argv.slice(2).includes('--no-db')
  const root = process.cwd()
  const priorityMap = loadKiPriority(root)
  const rows = await collectRows(priorityMap, includeDb)

  // CSV (one row per URL occurrence — same URL may appear multiple times)
  const csvLines = [
    'url,source_type,source_id,source_priority,domain,protocol',
    ...rows.map((r) =>
      [
        csvEscape(r.url),
        r.source_type,
        r.source_id,
        r.source_priority !== null ? r.source_priority.toFixed(1) : '',
        r.domain,
        r.protocol,
      ].join(','),
    ),
  ]
  writeFileSync(
    join(root, 'research', 'URL-INVENTORY.csv'),
    csvLines.join('\n') + '\n',
  )

  // Aggregations for the .md summary
  const totalUrls = rows.length
  const unique = new Set(rows.map((r) => r.url))
  const totalUnique = unique.size

  const byType = new Map<SourceType, number>()
  for (const r of rows) byType.set(r.source_type, (byType.get(r.source_type) ?? 0) + 1)

  const byProto = new Map<Protocol, number>()
  for (const r of rows) byProto.set(r.protocol, (byProto.get(r.protocol) ?? 0) + 1)

  const domainCount = new Map<string, number>()
  for (const r of rows) domainCount.set(r.domain, (domainCount.get(r.domain) ?? 0) + 1)
  const topDomains = [...domainCount.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 30)

  const highPriority = rows.filter(
    (r) => r.source_priority !== null && r.source_priority >= 4.0,
  )
  const lowOrUnknown = rows.length - highPriority.length

  // Top-priority unique URL examples (one per source_id)
  const topExamplesById = new Map<string, UrlRow>()
  for (const r of rows) {
    if (r.source_priority !== null && r.source_priority >= 4.5) {
      if (!topExamplesById.has(r.source_id)) topExamplesById.set(r.source_id, r)
    }
  }
  const topExamples = [...topExamplesById.values()]
    .sort((a, b) => (b.source_priority ?? 0) - (a.source_priority ?? 0))
    .slice(0, 10)

  const sourceTypeOrder: SourceType[] = [
    'report_canonical',
    'report_supporting',
    'thesis',
    'sourcedoc',
    'document',
  ]
  const protocolOrder: Protocol[] = ['https', 'http', 'other']

  const mdLines = [
    '# URL Inventory — Food Systems 2026',
    '',
    '> Auto-generert av `scripts/inventory-urls.ts` — ikke rediger manuelt.',
    `> Generert: ${new Date().toISOString()}`,
    `> Totalt: **${totalUrls}** URL-forekomster, **${totalUnique}** unike URL-er`,
    '',
    '## Distribusjon per source_type',
    '',
    '| source_type | antall |',
    '|---|---:|',
    ...sourceTypeOrder.map(
      (t) => `| ${t} | ${byType.get(t) ?? 0} |`,
    ),
    '',
    '## Distribusjon per protocol',
    '',
    '| protocol | antall |',
    '|---|---:|',
    ...protocolOrder.map(
      (p) => `| ${p} | ${byProto.get(p) ?? 0} |`,
    ),
    '',
    '## Topp 30 domener',
    '',
    '| # | domain | antall |',
    '|---:|---|---:|',
    ...topDomains.map(([d, n], i) => `| ${i + 1} | ${d} | ${n} |`),
    '',
    '## KI-prioritet',
    '',
    '| Klasse | antall |',
    '|---|---:|',
    `| URL-forekomster med priority >= 4.0 | ${highPriority.length} |`,
    `| URL-forekomster med priority < 4.0 eller ukjent | ${lowOrUnknown} |`,
    '',
    '## Eksempler — topp-prioritet (>= 4.5)',
    '',
    '| priority | source_type | source_id | domain | url |',
    '|---|---|---|---|---|',
    ...topExamples.map(
      (r) =>
        `| ${r.source_priority?.toFixed(1) ?? ''} | ${r.source_type} | ${r.source_id} | ${r.domain} | ${r.url} |`,
    ),
    '',
    '## Notater',
    '',
    '- `Report.sourceUrl` (kanonisk) og `Report.supportingSources[].url` er hentet fra `prisma/seed-data/reports.ts`.',
    '- `Thesis.url` er hentet fra `prisma/seed-data/theses.ts`.',
    '- `SourceDoc.url` og `Document.url` er hentet fra databasen når `DATABASE_URL` er satt. Bruk `npm run inventory-urls -- --no-db` for typed seed-data-only inventar.',
    '- Kolonnen `source_priority` er slått opp i `research/KI-PRIORITY.csv`. Tom hvis ingen treff.',
    '- Ingen HTTP-spørringer kjøres her; rens av status håndteres av `scripts/check-urls.ts`.',
  ]
  writeFileSync(
    join(root, 'research', 'URL-INVENTORY.md'),
    mdLines.join('\n') + '\n',
  )

  console.log(`URL inventory complete: ${totalUrls} URL occurrences, ${totalUnique} unique`)
  console.log('  By source_type:')
  for (const t of sourceTypeOrder) {
    const n = byType.get(t) ?? 0
    if (n > 0) console.log(`    ${t}: ${n}`)
  }
  console.log('  By protocol:')
  for (const p of protocolOrder) {
    const n = byProto.get(p) ?? 0
    if (n > 0) console.log(`    ${p}: ${n}`)
  }
  console.log(`  priority >= 4.0: ${highPriority.length}`)
  console.log(`  priority < 4.0 or unknown: ${lowOrUnknown}`)
  console.log('')
  console.log('Output: research/URL-INVENTORY.csv + research/URL-INVENTORY.md')
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
