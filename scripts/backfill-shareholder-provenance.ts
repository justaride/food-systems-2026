import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { resolveShareholderSourceLocator } from '../src/lib/row-source-locators'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

function provenanceFields(locator: string, verifiedAt: Date) {
  if (locator.startsWith('document:')) {
    return {
      source: locator,
      sourceUrl: null,
      verifiedAt,
    }
  }

  return {
    source: 'Aksjonærdata: årsrapport 2024',
    sourceUrl: locator,
    verifiedAt,
  }
}

async function main() {
  const documents = await prisma.document.findMany({
    select: { id: true, slug: true },
  })
  const documentRefs = new Set(
    documents.flatMap((document) => [document.id, document.slug].filter(Boolean) as string[]),
  )

  const shareholders = await prisma.shareholder.findMany({
    select: {
      id: true,
      name: true,
      ownershipPct: true,
      source: true,
      sourceUrl: true,
      company: { select: { orgNr: true, name: true } },
    },
    orderBy: { name: 'asc' },
  })

  const verifiedAt = new Date()
  let updated = 0
  let alreadyCurrent = 0
  let unresolved = 0

  for (const shareholder of shareholders) {
    const locator = resolveShareholderSourceLocator(shareholder, documentRefs)
    if (!locator) {
      unresolved += 1
      continue
    }

    const fields = provenanceFields(locator, verifiedAt)
    if (shareholder.source === fields.source && shareholder.sourceUrl === fields.sourceUrl) {
      alreadyCurrent += 1
      continue
    }

    await prisma.shareholder.update({
      where: { id: shareholder.id },
      data: fields,
    })
    updated += 1
    console.log(`  updated ${shareholder.company.name}: ${shareholder.name} -> ${locator}`)
  }

  console.log(
    `Shareholder provenance backfill complete: ${updated} updated, ` +
      `${alreadyCurrent} already current, ${unresolved} unresolved`,
  )
}

main()
  .catch((error) => {
    console.error('Shareholder provenance backfill failed:', error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
