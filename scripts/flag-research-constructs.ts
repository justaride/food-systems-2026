import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { classifyCompanyRegistryStatus } from '../src/lib/company-registry-classification'

type Args = {
  apply: boolean
}

type Change = {
  id: string
  name: string
  orgNr: string
  country: string
  isResearchConstruct: boolean
  orgNrFormat: string
  registrySource: string | null
  nextIsResearchConstruct: boolean
  nextOrgNrFormat: string
  nextRegistrySource: string | null
}

function parseArgs(argv: string[]): Args {
  let apply = false

  for (const arg of argv) {
    if (arg === '--apply') {
      apply = true
      continue
    }
    if (arg === '--dry-run') continue
    throw new Error(`Unknown argument: ${arg}`)
  }

  return { apply }
}

async function main() {
  const { apply } = parseArgs(process.argv.slice(2))
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  const prisma = new PrismaClient({ adapter })

  try {
    const companies = await prisma.company.findMany({
      select: {
        id: true,
        name: true,
        orgNr: true,
        country: true,
        isResearchConstruct: true,
        orgNrFormat: true,
        registrySource: true,
      },
      orderBy: { orgNr: 'asc' },
    })

    const changes: Change[] = []
    const counts = new Map<string, number>()

    for (const company of companies) {
      const next = classifyCompanyRegistryStatus(company.orgNr, company.country)
      counts.set(next.orgNrFormat, (counts.get(next.orgNrFormat) ?? 0) + 1)

      if (
        company.isResearchConstruct !== next.isResearchConstruct ||
        company.orgNrFormat !== next.orgNrFormat ||
        company.registrySource !== next.registrySource
      ) {
        changes.push({
          ...company,
          nextIsResearchConstruct: next.isResearchConstruct,
          nextOrgNrFormat: next.orgNrFormat,
          nextRegistrySource: next.registrySource,
        })
      }
    }

    console.log(apply ? 'Research construct flagging: APPLY' : 'Research construct flagging: DRY RUN')
    console.log(`Companies scanned: ${companies.length}`)
    console.log(`Changes needed: ${changes.length}`)
    console.log('Target classification counts:')
    for (const [format, count] of [...counts.entries()].sort(([a], [b]) => a.localeCompare(b))) {
      console.log(`  ${format}: ${count}`)
    }

    if (changes.length > 0) {
      console.log('\nFirst changes:')
      for (const change of changes.slice(0, 50)) {
        console.log(
          `  ${change.orgNr} ${change.name}: ` +
          `${change.orgNrFormat}/${change.isResearchConstruct}/${change.registrySource ?? 'null'} -> ` +
          `${change.nextOrgNrFormat}/${change.nextIsResearchConstruct}/${change.nextRegistrySource ?? 'null'}`,
        )
      }
    }

    if (!apply) return

    for (const change of changes) {
      await prisma.company.update({
        where: { id: change.id },
        data: {
          isResearchConstruct: change.nextIsResearchConstruct,
          orgNrFormat: change.nextOrgNrFormat,
          registrySource: change.nextRegistrySource,
        },
      })
    }

    console.log(`\nApplied ${changes.length} company registry classification update(s)`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(error => {
  console.error('Research construct flagging failed:', error)
  process.exit(1)
})
