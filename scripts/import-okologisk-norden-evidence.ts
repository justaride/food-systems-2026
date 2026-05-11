// Importerer extracted text-content fra research/evidence-pack/okologisk-norden-2026-04-29
// til Document-tabellen, basert på document_manifest.csv.
//
// Filter: kun quality_flag som indikerer reell sitérbar substans:
//   ok, key_policy_extracted, sector_estimate, sector_public_meals_source,
//   private_certifier_report, historical_indicator
//
// Hopper over: metadata, index_only, supporting (rein navigasjons-kontekst),
// entity_decode_noise, event_not_data_report.
//
// Idempotent: bruker filePath som unique key. Eksisterende Documents oppdateres ikke.
//
// Bruk:
//   npx tsx scripts/import-okologisk-norden-evidence.ts            (live)
//   npx tsx scripts/import-okologisk-norden-evidence.ts --dry-run  (preview)

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const REPO = '/Users/gabrielboen/Documents/Food Systems 2026'
const EVIDENCE_PACK = join(REPO, 'research/evidence-pack/okologisk-norden-2026-04-29')
const MANIFEST = join(EVIDENCE_PACK, 'exports/document_manifest.csv')

const IMPORT_QUALITY_FLAGS = new Set([
  'ok',
  'key_policy_extracted',
  'sector_estimate',
  'sector_public_meals_source',
  'private_certifier_report',
  'historical_indicator',
  'key_indicators_extracted',
])

const SOURCE_TYPE_TO_DOC_TYPE: Record<string, string> = {
  authority_report: 'policy-report',
  control_report: 'regulatory',
  authority_press_page: 'policy',
  organization_report: 'report',
  benchmark_report: 'report',
  industry_report: 'industry',
  market_report: 'industry',
  statistical_report: 'dataset',
  government_strategy: 'strategy',
  research_paper: 'research',
  certifier_register: 'dataset',
}

type Row = {
  country: string
  source_name: string
  source_type: string
  owner: string
  url: string
  local_original_path: string
  local_text_path: string
  format: string
  download_status: string
  extraction_status: string
  analysis_status: string
  quality_flag: string
  notes: string
}

function parseCsv(text: string): Row[] {
  const lines = text.split('\n').filter(l => l.trim().length > 0)
  const rows: Row[] = []
  for (let i = 1; i < lines.length; i++) {
    const fields: string[] = []
    let cur = ''
    let inQuote = false
    for (const ch of lines[i]) {
      if (ch === '"') { inQuote = !inQuote; continue }
      if (ch === ',' && !inQuote) { fields.push(cur); cur = ''; continue }
      cur += ch
    }
    fields.push(cur)
    if (fields.length < 13) continue
    rows.push({
      country: fields[0],
      source_name: fields[1],
      source_type: fields[2],
      owner: fields[3],
      url: fields[4],
      local_original_path: fields[5],
      local_text_path: fields[6],
      format: fields[7],
      download_status: fields[8],
      extraction_status: fields[9],
      analysis_status: fields[10],
      quality_flag: fields[11],
      notes: fields[12],
    })
  }
  return rows
}

function extractYearFromTitle(title: string): number | null {
  const matches = title.match(/(20[1-3]\d)/g)
  if (!matches) return null
  return Math.max(...matches.map(Number))
}

function buildSlug(filename: string): string {
  return filename
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-z0-9-]/gi, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
}

function buildTags(row: Row): string[] {
  const tags = new Set<string>(['okologisk', 'evidence-pack', 'norden', row.country.toLowerCase()])
  if (row.source_type) tags.add(row.source_type.replace(/_/g, '-'))
  if (row.quality_flag === 'key_policy_extracted') tags.add('policy')
  if (row.source_type.includes('certifier')) tags.add('sertifisering')
  if (row.source_type.includes('authority')) tags.add('myndighet')
  return [...tags]
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const dryRun = process.argv.includes('--dry-run')
  const rows = parseCsv(readFileSync(MANIFEST, 'utf-8'))
  const eligible = rows.filter(r =>
    IMPORT_QUALITY_FLAGS.has(r.quality_flag) &&
    r.local_text_path && r.local_text_path.endsWith('.txt')
  )

  console.log(`Manifest rows: ${rows.length}`)
  console.log(`Eligible (quality_flag + .txt): ${eligible.length}`)
  if (dryRun) console.log('(DRY RUN)')
  console.log('')

  let inserted = 0
  let skipped = 0
  let missing = 0
  for (const row of eligible) {
    const textPath = join(EVIDENCE_PACK, row.local_text_path)
    if (!existsSync(textPath)) {
      console.log(`  MISSING: ${row.local_text_path}`)
      missing++
      continue
    }
    const content = readFileSync(textPath, 'utf-8')
    const wordCount = content.split(/\s+/).filter(Boolean).length

    if (wordCount < 100) {
      console.log(`  SKIP (too short, ${wordCount} words): ${row.source_name}`)
      skipped++
      continue
    }

    const filename = row.local_text_path.split('/').pop()!
    const slug = buildSlug(filename)
    const filePath = `research/evidence-pack/okologisk-norden-2026-04-29/${row.local_text_path}`
    const year = extractYearFromTitle(row.source_name)
    const docType = SOURCE_TYPE_TO_DOC_TYPE[row.source_type] ?? 'report'

    if (dryRun) {
      console.log(`  WOULD INSERT [${row.country}/${docType}/y=${year ?? '?'}]: ${row.source_name} (${wordCount} words)`)
      inserted++
      continue
    }

    try {
      await prisma.document.create({
        data: {
          slug,
          filePath,
          title: row.source_name,
          author: row.owner || null,
          year,
          documentType: docType,
          category: 'evidence-pack',
          subcategory: 'okologisk-norden',
          country: row.country, // Already uppercase ISO + 'Nordic'
          content,
          summary: row.notes.slice(0, 500) || null,
          url: row.url || null,
          wordCount,
          tags: buildTags(row),
          metadata: {
            sourceType: row.source_type,
            qualityFlag: row.quality_flag,
            extractionStatus: row.extraction_status,
            owner: row.owner,
            originalPath: row.local_original_path,
            importBatch: 'okologisk-norden-2026-05-11',
          },
        },
      })
      console.log(`  INSERT [${row.country}/${docType}]: ${row.source_name}`)
      inserted++
    } catch (e: unknown) {
      const err = e as { code?: string; message?: string }
      if (err.code === 'P2002') {
        console.log(`  EXISTS (slug/filePath): ${row.source_name}`)
        skipped++
      } else {
        console.log(`  ERROR on ${row.source_name}: ${err.message}`)
        skipped++
      }
    }
  }

  console.log(`\nDone. inserted=${inserted} skipped=${skipped} missing=${missing}`)
  await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(1) })
