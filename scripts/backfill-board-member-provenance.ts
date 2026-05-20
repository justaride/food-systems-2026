import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import {
  resolveBoardMemberAnnualReportSourceLocator,
  resolveBoardMemberSourceLabel,
} from '../src/lib/board-member-provenance'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

function parseArgs(argv: string[]): { dryRun: boolean } {
  const allowed = new Set(['--dry-run'])
  for (const arg of argv) {
    if (!allowed.has(arg)) throw new Error(`Unknown argument: ${arg}`)
  }

  return { dryRun: argv.includes('--dry-run') }
}

function provenanceFields(locator: string, verifiedAt: Date) {
  if (locator.startsWith('document:')) {
    return {
      source: locator,
      sourceUrl: null,
      verifiedAt,
    }
  }

  return {
    source: resolveBoardMemberSourceLabel(locator),
    sourceUrl: locator,
    verifiedAt,
  }
}

async function main() {
  const { dryRun } = parseArgs(process.argv.slice(2))
  console.log(`Backfilling board-member annual-report provenance${dryRun ? ' (dry run)' : ''}`)

  const documents = await prisma.document.findMany({ select: { id: true, slug: true } })
  const documentRefs = new Set(
    documents.flatMap((document) => [document.id, document.slug].filter(Boolean) as string[]),
  )

  const boardMembers = await prisma.boardMember.findMany({
    where: {
      source: null,
      sourceUrl: null,
      verifiedAt: null,
    },
    select: {
      id: true,
      personName: true,
      role: true,
      company: { select: { name: true, orgNr: true } },
    },
    orderBy: [{ company: { name: 'asc' } }, { personName: 'asc' }],
  })

  const verifiedAt = new Date()
  let updated = 0
  let unresolved = 0

  for (const boardMember of boardMembers) {
    const locator = resolveBoardMemberAnnualReportSourceLocator(boardMember, documentRefs)
    if (!locator) {
      unresolved += 1
      continue
    }

    console.log(
      `  ${boardMember.company.name}: ${boardMember.personName} (${boardMember.role}) -> ${locator}`,
    )

    if (!dryRun) {
      await prisma.boardMember.update({
        where: { id: boardMember.id },
        data: provenanceFields(locator, verifiedAt),
      })
    }

    updated += 1
  }

  console.log(
    `${dryRun ? 'Would update' : 'Updated'} ${updated} board-member row(s); ` +
      `${unresolved} unresolved`,
  )
}

main()
  .catch((error) => {
    console.error('Board-member provenance backfill failed:', error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
