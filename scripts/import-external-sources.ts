import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { sources } from '../prisma/seed-data/sources'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const DIRECT_LINK_OVERRIDES: Record<string, string> = {
  'src-51': 'bibliotek/bransje/organisasjoner/merkevarer-historie',
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function mapSourceType(type: string): string {
  switch (type) {
    case 'forskning': return 'academic'
    case 'rapport': return 'report'
    case 'datasett': return 'dataset'
    case 'analyse': return 'analysis'
    case 'initiativ': return 'initiative'
    default: return 'research'
  }
}

function extractCountry(description: string, title: string): string | null {
  const text = (description + ' ' + title).toLowerCase()
  if (text.includes('nordisk') || text.includes('nordic') || text.includes('norden')) return 'nordic'
  if (text.includes('norsk') || text.includes('norge') || text.includes('norwegian')) return 'no'
  if (text.includes('svensk') || text.includes('sverige') || text.includes('swedish')) return 'se'
  if (text.includes('dansk') || text.includes('danmark') || text.includes('danish')) return 'dk'
  if (text.includes('finsk') || text.includes('finland') || text.includes('finnish')) return 'fi'
  if (text.includes('island') || text.includes('iceland')) return 'is'
  if (text.includes('eu ') || text.includes('european')) return 'eu'
  return null
}

function buildContent(src: typeof sources[number]): string {
  const lines: string[] = [
    `# ${src.title}`,
    '',
    `**${src.author}** (${src.year})`,
    '',
    `## Beskrivelse`,
    src.description,
    '',
    `## Relevans`,
    src.relevance,
    '',
    '## Metadata',
    `- Kilde-ID: ${src.id}`,
    `- Type: ${src.type}`,
    `- Filnavn: ${src.filename}`,
  ]

  if (src.url) {
    lines.push(`- URL: ${src.url}`)
  }

  lines.push(
    '',
    '---',
    '*Ekstern kilde — fulltekst ikke importert. Metadata fra kilderegisteret.*'
  )

  return lines.join('\n')
}

async function main() {
  console.log('Importing external source documents...\n')

  const unlinked = await prisma.sourceDoc.findMany({
    where: { documentId: null },
    select: { id: true, filename: true, title: true, url: true },
  })

  console.log(`${unlinked.length} unlinked SourceDocs found\n`)

  let imported = 0
  let directLinked = 0
  let skipped = 0

  for (const src of unlinked) {
    const overrideSlug = DIRECT_LINK_OVERRIDES[src.id]
    if (overrideSlug) {
      const existingDoc = await prisma.document.findFirst({
        where: { slug: overrideSlug },
        select: { id: true, slug: true },
      })
      if (existingDoc) {
        const alreadyClaimed = await prisma.sourceDoc.findFirst({
          where: { documentId: existingDoc.id },
        })
        if (!alreadyClaimed) {
          await prisma.sourceDoc.update({
            where: { id: src.id },
            data: { documentId: existingDoc.id },
          })
          console.log(`  DIRECT-LINKED ${src.id} → Doc[${existingDoc.slug}]`)
          directLinked++
          continue
        }
      }
    }

    const sourceData = sources.find(s => s.id === src.id)
    if (!sourceData) {
      console.log(`  SKIP ${src.id} — not found in sources.ts`)
      skipped++
      continue
    }

    const slug = `external-${slugify(sourceData.filename.replace(/\.(md|pdf)$/, ''))}`
    const filePath = `external/${sourceData.filename}`
    const content = buildContent(sourceData)
    const documentType = mapSourceType(sourceData.type)
    const country = extractCountry(sourceData.description, sourceData.title)

    const tags = [
      'external-source',
      sourceData.type,
      documentType,
      country,
    ].filter(Boolean) as string[]

    try {
      const doc = await prisma.document.upsert({
        where: { filePath },
        update: {
          title: sourceData.title,
          author: sourceData.author,
          year: sourceData.year,
          category: 'external',
          subcategory: sourceData.type,
          country,
          content,
          summary: sourceData.description,
          wordCount: content.split(/\s+/).filter(Boolean).length,
          documentType,
          slug,
          tags,
          url: sourceData.url ?? null,
          metadata: {
            canonicalFileType: 'external',
            availabilityStatus: 'metadata-only',
            sourceDocId: sourceData.id,
            relevance: sourceData.relevance,
          },
        },
        create: {
          slug,
          filePath,
          title: sourceData.title,
          author: sourceData.author,
          year: sourceData.year,
          category: 'external',
          subcategory: sourceData.type,
          country,
          content,
          summary: sourceData.description,
          wordCount: content.split(/\s+/).filter(Boolean).length,
          documentType,
          tags,
          url: sourceData.url ?? null,
          metadata: {
            canonicalFileType: 'external',
            availabilityStatus: 'metadata-only',
            sourceDocId: sourceData.id,
            relevance: sourceData.relevance,
          },
        },
      })

      await prisma.sourceDoc.update({
        where: { id: src.id },
        data: { documentId: doc.id },
      })

      console.log(`  IMPORTED ${src.id} → Doc[${slug}]`)
      imported++
    } catch (err) {
      console.error(`  FAILED ${src.id}: ${err}`)
      skipped++
    }
  }

  console.log(`\nDone: ${imported} imported, ${directLinked} direct-linked, ${skipped} skipped`)

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
