import 'dotenv/config'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { buildBarekraftDocumentCitation } from './lib/barekraft-citations'
import { upsertWithCitation } from './lib/import-helpers'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const FILE_MAP: { sourceId: string; file: string; dir: 'barekraft' | 'circular-cities' }[] = [
  { sourceId: 'src-110', file: 'SEC-MAT-01-Regulering-og-Matsvinn.md', dir: 'barekraft' },
  { sourceId: 'src-111', file: 'SEC-MAT-02-Sirkulaere-Prosesser-og-Biooekonomi.md', dir: 'barekraft' },
  { sourceId: 'src-112', file: 'SEC-MAT-03-Emballasje-og-PPWR.md', dir: 'barekraft' },
  { sourceId: 'src-113', file: 'SEC-MAT-REG-01-Matsvinn-Detaljert-Lovverk.md', dir: 'barekraft' },
  { sourceId: 'src-114', file: 'SEC-MAT-REG-02-Emballasje-i-Matsektoren-Detalj.md', dir: 'barekraft' },
  { sourceId: 'src-115', file: 'SEC-MAT-REG-03-Danmark-CO2-Avgift-Landbruk.md', dir: 'barekraft' },
  { sourceId: 'src-116', file: 'SEC-MAT-KOST-01-Nordisk-Kosthold-og-Beredskap.md', dir: 'barekraft' },
  { sourceId: 'src-117', file: 'SEC-MAT-TEK-01-Fremtidens-Matteknologi.md', dir: 'barekraft' },
  { sourceId: 'src-118', file: 'SEC-MAT-TEK-02-Biotech-og-Fremtidens-Proteiner-Detalj.md', dir: 'barekraft' },
  { sourceId: 'src-119', file: 'SEC-MAT-PROD-01-Nordisk-Havbruk-og-For.md', dir: 'barekraft' },
  { sourceId: 'src-120', file: 'SEC-MAT-PROD-02-Regenerativt-Landbruk-Norden.md', dir: 'barekraft' },
  { sourceId: 'src-121', file: 'SEC-MAT-PROD-03-Blå-Bioøkonomi-Teknisk-Detalj.md', dir: 'barekraft' },
  { sourceId: 'src-122', file: 'SA-02-mat-og-biomasse.md', dir: 'circular-cities' },
]

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/ä/g, 'a')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function extractCountry(content: string): string | null {
  const lower = content.toLowerCase()
  const nordicCount = (lower.match(/nordisk|nordic|norden/g) || []).length
  const noCount = (lower.match(/\bnorge\b|\bnorsk\b/g) || []).length
  const dkCount = (lower.match(/\bdanmark\b|\bdansk\b/g) || []).length
  const seCount = (lower.match(/\bsverige\b|\bsvensk\b/g) || []).length

  if (nordicCount > noCount && nordicCount > dkCount) return 'nordic'
  if (dkCount > noCount * 2) return 'dk'
  if (seCount > noCount * 2) return 'se'
  return 'nordic'
}

function extractTags(sourceId: string, content: string): string[] {
  const tags = ['external-source', 'barekraft-kartlegging', 'analyse']

  if (sourceId === 'src-122') {
    tags.push('circular-cities', 'mat-og-biomasse', 'sektoranalyse')
  }

  const lower = content.toLowerCase()
  if (lower.includes('matsvinn')) tags.push('matsvinn')
  if (lower.includes('biogass')) tags.push('biogass')
  if (lower.includes('emballasje') || lower.includes('ppwr')) tags.push('emballasje')
  if (lower.includes('co2-avgift') || lower.includes('karbonavgift')) tags.push('co2-avgift')
  if (lower.includes('havbruk') || lower.includes('akvakultur')) tags.push('havbruk')
  if (lower.includes('regenerativ')) tags.push('regenerativt-landbruk')
  if (lower.includes('bioøkonomi') || lower.includes('biookonomi')) tags.push('biookonomi')
  if (lower.includes('protein')) tags.push('proteiner')
  if (lower.includes('kosthold') || lower.includes('ernæring')) tags.push('kosthold')
  if (lower.includes('beredskap')) tags.push('matberedskap')
  if (lower.includes('tang') || lower.includes('tare')) tags.push('tang-tare')

  return [...new Set(tags)]
}

async function main() {
  console.log('Importing Bærekraft Kartlegging + Circular Cities sources...\n')

  let imported = 0
  let skipped = 0

  for (const entry of FILE_MAP) {
    const filePath = join(process.cwd(), 'research', 'external', entry.dir, entry.file)

    if (!existsSync(filePath)) {
      console.log(`  SKIP ${entry.sourceId}: file not found at ${filePath}`)
      skipped++
      continue
    }

    const content = readFileSync(filePath, 'utf-8')
    const wordCount = content.split(/\s+/).filter(Boolean).length

    const sourceDoc = await prisma.sourceDoc.findUnique({ where: { id: entry.sourceId } })
    if (!sourceDoc) {
      console.log(`  SKIP ${entry.sourceId}: SourceDoc not found in DB (run import-ts-data first)`)
      skipped++
      continue
    }

    const slug = `barekraft-${slugify(entry.file.replace(/\.md$/, ''))}`
    const docFilePath = `research/external/${entry.dir}/${entry.file}`
    const country = extractCountry(content)
    const tags = extractTags(entry.sourceId, content)
    const citation = buildBarekraftDocumentCitation(sourceDoc, docFilePath)

    const doc = await upsertWithCitation(prisma, 'Document', db => db.document.upsert({
      where: { filePath: docFilePath },
      update: {
        slug,
        title: sourceDoc.title ?? entry.file.replace(/\.md$/, ''),
        author: sourceDoc.author ?? 'Bærekraft Kartlegging Prosjekt',
        year: sourceDoc.year ? Number(sourceDoc.year) : 2025,
        documentType: 'analysis',
        category: 'external',
        subcategory: entry.dir === 'circular-cities' ? 'circular-cities' : 'barekraft-kartlegging',
        country,
        content,
        summary: sourceDoc.description,
        wordCount,
        tags,
        metadata: {
          sourceDocId: entry.sourceId,
          importedFrom: entry.dir,
          originalFilename: entry.file,
          availabilityStatus: 'full-text',
        },
      },
      create: {
        slug,
        filePath: docFilePath,
        title: sourceDoc.title ?? entry.file.replace(/\.md$/, ''),
        author: sourceDoc.author ?? 'Bærekraft Kartlegging Prosjekt',
        year: sourceDoc.year ? Number(sourceDoc.year) : 2025,
        documentType: 'analysis',
        category: 'external',
        subcategory: entry.dir === 'circular-cities' ? 'circular-cities' : 'barekraft-kartlegging',
        country,
        content,
        summary: sourceDoc.description,
        wordCount,
        tags,
        metadata: {
          sourceDocId: entry.sourceId,
          importedFrom: entry.dir,
          originalFilename: entry.file,
          availabilityStatus: 'full-text',
        },
      },
    }), citation)

    await prisma.sourceDoc.update({
      where: { id: entry.sourceId },
      data: { documentId: doc.id },
    })

    console.log(`  IMPORTED ${entry.sourceId} → Doc[${slug}] (${wordCount} words)`)
    imported++
  }

  console.log(`\nDone: ${imported} imported, ${skipped} skipped`)

  const total = await prisma.sourceDoc.count()
  const linked = await prisma.sourceDoc.count({ where: { documentId: { not: null } } })
  console.log(`SourceDoc coverage: ${linked}/${total} (${(100 * linked / total).toFixed(1)}%)`)
}

main()
  .catch((e) => {
    console.error('Import failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
