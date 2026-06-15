import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import {
  BRREG_SEED_BOARD_SOURCE_LABEL,
  selectUnverifiedSeedBoardMemberIdsForPruning,
} from '../src/lib/brreg-board-member-provenance'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

function parseArgs(argv: string[]): { dryRun: boolean } {
  const allowed = new Set(['--dry-run'])
  for (const arg of argv) {
    if (!allowed.has(arg)) throw new Error(`Unknown argument: ${arg}`)
  }
  return { dryRun: argv.includes('--dry-run') }
}

async function main() {
  const { dryRun } = parseArgs(process.argv.slice(2))
  console.log(`Pruning unverified Norwegian seed board-member rows${dryRun ? ' (dry run)' : ''}`)

  const companies = await prisma.company.findMany({
    where: {
      country: 'NO',
      boardMembers: {
        some: {
          OR: [
            { source: null },
            { sourceUrl: null },
            { verifiedAt: null },
            { source: BRREG_SEED_BOARD_SOURCE_LABEL },
          ],
        },
      },
    },
    select: {
      name: true,
      orgNr: true,
      boardMembers: {
        select: {
          id: true,
          personName: true,
          personKey: true,
          role: true,
          source: true,
          sourceUrl: true,
          verifiedAt: true,
        },
      },
    },
    orderBy: { name: 'asc' },
  })

  let pruned = 0
  for (const company of companies) {
    const ids = selectUnverifiedSeedBoardMemberIdsForPruning(company.boardMembers)
    if (ids.length === 0) continue

    const byId = new Map(company.boardMembers.map((member) => [member.id, member]))
    console.log(`  ${company.name} (${company.orgNr}): ${ids.length} row(s)`)
    for (const id of ids) {
      const member = byId.get(id)
      if (!member) continue
      console.log(`    ${member.personName} (${member.role})`)
    }

    if (!dryRun) {
      await prisma.boardMember.deleteMany({ where: { id: { in: ids } } })
    }
    pruned += ids.length
  }

  console.log(`${dryRun ? 'Would prune' : 'Pruned'} ${pruned} unverified board-member row(s)`)
}

main()
  .catch((error) => {
    console.error('Board-member provenance pruning failed:', error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
