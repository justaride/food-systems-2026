// Backfill SourceCitation.accessedAt from verifiedAt where missing.
//
// Heuristic: if a citation has been verified at some date, the verifier
// necessarily accessed it at that date (or earlier). For rows missing
// accessedAt, we backfill it to verifiedAt. This is conservative — it does
// not invent dates for rows that have neither signal.
//
// Dry-run by default. Pass --apply to write changes.
//
// Critical analysis (PR #83): accessedAt coverage on SourceCitation was 3%
// (71 of 2698). This script lifts an additional ~95 rows where verifiedAt
// is the cleanest available signal.

import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

function parseArgs(argv: string[]): { apply: boolean } {
  const allowed = new Set(['--apply'])
  for (const arg of argv) {
    if (!allowed.has(arg)) throw new Error(`Unknown argument: ${arg}`)
  }
  return { apply: argv.includes('--apply') }
}

async function main() {
  const { apply } = parseArgs(process.argv.slice(2))
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  const prisma = new PrismaClient({ adapter })

  const candidates = await prisma.sourceCitation.findMany({
    where: { accessedAt: null, verifiedAt: { not: null } },
    select: { id: true, verifiedAt: true },
  })

  console.log(`Candidates (verifiedAt set, accessedAt null): ${candidates.length}`)
  console.log(`Mode: ${apply ? 'APPLY' : 'dry-run (pass --apply to write)'}\n`)

  if (apply) {
    for (const row of candidates) {
      await prisma.sourceCitation.update({
        where: { id: row.id },
        data: { accessedAt: row.verifiedAt },
      })
    }
    console.log(`Wrote accessedAt = verifiedAt on ${candidates.length} rows.`)
  } else {
    console.log(`Would write accessedAt = verifiedAt on ${candidates.length} rows.`)
    console.log(`Re-run with --apply to commit.`)
  }
}

main().then(() => process.exit(0)).catch(e => {
  console.error('FATAL:', (e as Error).message)
  process.exit(1)
})
