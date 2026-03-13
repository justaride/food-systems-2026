import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import * as fs from 'fs'
import * as path from 'path'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const RESEARCH_DIR = path.resolve(__dirname, '../research')

function walkDir(dir: string): string[] {
  const results: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...walkDir(fullPath))
    } else if (entry.name.endsWith('.md')) {
      results.push(fullPath)
    }
  }
  return results
}

function extractTitle(content: string): string {
  const match = content.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : 'Untitled'
}

function extractCategory(relPath: string): { category: string; subcategory: string | null } {
  const parts = relPath.split(path.sep)
  if (parts[0] === 'bibliotek' && parts.length > 1) {
    return { category: 'bibliotek', subcategory: parts[1] }
  }
  if (parts[0] === 'data' || parts[0] === 'brocode-kart') {
    return { category: 'data', subcategory: parts[1] ?? null }
  }
  return { category: parts[0] ?? 'research', subcategory: parts[1] ?? null }
}

function extractCountry(relPath: string): string | null {
  const lower = relPath.toLowerCase()
  if (lower.includes('norden') || lower.includes('nordisk')) return 'nordic'
  if (lower.includes('/no/') || lower.includes('norge')) return 'no'
  if (lower.includes('/se/') || lower.includes('sverige')) return 'se'
  if (lower.includes('/dk/') || lower.includes('danmark')) return 'dk'
  if (lower.includes('/fi/') || lower.includes('finland')) return 'fi'
  if (lower.includes('/is/') || lower.includes('island')) return 'is'
  return null
}

function slugify(filePath: string): string {
  return filePath
    .replace(/\.md$/, '')
    .replace(/[^a-zA-Z0-9-_/]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
}

function extractDocumentType(relPath: string, content: string): string {
  const lower = relPath.toLowerCase()
  if (lower.includes('masteroppgaver')) return 'thesis'
  if (lower.includes('nou') || lower.includes('stortingsdok')) return 'policy'
  if (lower.includes('arsrapporter')) return 'annual-report'
  if (lower.includes('konkurransetilsynet') || lower.includes('dagligvaretilsynet')) return 'regulatory'
  if (lower.includes('konsulentrapporter')) return 'consulting-report'
  if (lower.includes('akademia') || lower.includes('nhh-food') || lower.includes('sifo')) return 'academic'
  if (lower.includes('tenketanker')) return 'think-tank'
  if (lower.includes('juridisk')) return 'legal'
  if (lower.includes('bransje')) return 'industry'
  if (lower.includes('sirkularitet')) return 'circular-economy'
  if (lower.includes('verdikjede')) return 'value-chain'
  if (lower.includes('data') || lower.includes('brocode')) return 'dataset'
  return 'research'
}

async function main() {
  console.log('Importing research documents...\n')

  const files = walkDir(RESEARCH_DIR)
  console.log(`Found ${files.length} markdown files in research/\n`)

  let imported = 0
  let skipped = 0

  for (const filePath of files) {
    const relPath = path.relative(RESEARCH_DIR, filePath)
    const content = fs.readFileSync(filePath, 'utf-8')
    const title = extractTitle(content)
    const { category, subcategory } = extractCategory(relPath)
    const country = extractCountry(relPath)
    const slug = slugify(relPath)
    const wordCount = content.split(/\s+/).length
    const documentType = extractDocumentType(relPath, content)
    const filename = path.basename(filePath, '.md')

    try {
      await prisma.document.upsert({
        where: { filePath: relPath },
        update: {
          title,
          category,
          subcategory,
          country,
          content,
          wordCount,
          documentType,
          slug,
        },
        create: {
          slug,
          filePath: relPath,
          title,
          category,
          subcategory,
          country,
          content,
          wordCount,
          documentType,
          tags: [category, subcategory, country, documentType].filter(Boolean) as string[],
        },
      })

      const matchingSource = await prisma.sourceDoc.findFirst({
        where: {
          filename: { contains: filename },
          documentId: null,
        },
      })
      if (matchingSource) {
        await prisma.sourceDoc.update({
          where: { id: matchingSource.id },
          data: { documentId: (await prisma.document.findUnique({ where: { filePath: relPath } }))!.id },
        })
        console.log(`  Linked ${filename} → SourceDoc ${matchingSource.id}`)
      }

      const matchingThesis = await prisma.thesis.findFirst({
        where: {
          id: { contains: filename },
          documentId: null,
        },
      })
      if (matchingThesis) {
        await prisma.thesis.update({
          where: { id: matchingThesis.id },
          data: { documentId: (await prisma.document.findUnique({ where: { filePath: relPath } }))!.id },
        })
        console.log(`  Linked ${filename} → Thesis ${matchingThesis.id}`)
      }

      imported++
    } catch (err) {
      console.error(`  Failed: ${relPath}`, err)
      skipped++
    }
  }

  console.log(`\nDone: ${imported} imported, ${skipped} skipped`)
}

main()
  .catch((e) => {
    console.error('Import failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
