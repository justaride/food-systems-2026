import 'dotenv/config'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import {
  buildCitationReadinessRefreshPlan,
  formatCitationReadinessRefreshCsv,
} from '../src/lib/citations/citation-readiness-refresh'
import { candidateLocalFilePaths } from '../src/lib/local-file-locator'

const OUTPUT_PATH = 'research/citation-readiness-refresh-preview-2026-05-20.csv'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

function parseArgs(argv: string[]) {
  const allowed = new Set(['--apply'])
  for (const arg of argv) {
    if (!allowed.has(arg)) throw new Error(`Unknown argument: ${arg}`)
  }

  return { apply: argv.includes('--apply') }
}

function localPathExists(localPath: string) {
  return candidateLocalFilePaths(localPath).some(path => existsSync(path))
}

async function main() {
  const { apply } = parseArgs(process.argv.slice(2))
  const citations = await prisma.sourceCitation.findMany({
    select: {
      id: true,
      citationText: true,
      citationReadiness: true,
      sourceClass: true,
      verificationStatus: true,
      url: true,
      archivedUrl: true,
      localPath: true,
      documentId: true,
      sourceDocId: true,
      accessedAt: true,
      verifiedAt: true,
    },
  })

  const plan = buildCitationReadinessRefreshPlan(citations, { localPathExists })

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true })
  writeFileSync(OUTPUT_PATH, formatCitationReadinessRefreshCsv(plan.updates))

  if (apply) {
    for (const update of plan.updates) {
      await prisma.sourceCitation.update({
        where: { id: update.id },
        data: { citationReadiness: update.toReadiness as never },
      })
    }
  }

  console.log(`Preview path: ${OUTPUT_PATH}`)
  console.log(`SourceCitation rows scanned: ${citations.length}`)
  console.log(`Rows to update: ${plan.updates.length}`)
  console.log(`Skipped unchanged: ${plan.skippedUnchanged}`)
  for (const [transition, count] of Object.entries(plan.countsByTransition).sort()) {
    console.log(`${transition}: ${count}`)
  }
  console.log(`Applied: ${apply ? 'yes' : 'no'}`)
}

main()
  .catch((error) => {
    console.error('Source citation readiness refresh failed:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
