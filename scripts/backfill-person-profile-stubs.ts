// Create stub PersonProfile rows for board members that have no profile.
//
// Critical analysis (PR #83) flagged that ~30% of board members lack any
// PersonProfile. Empty profiles make styreoverlapp analysis a name graph
// rather than a person graph.
//
// This script does NOT fabricate biography, linkedIn, photo, etc. It only
// creates stubs with:
//   - name (from BoardMember.personName, picked from most recent/most common)
//   - personKey (from BoardMember.personKey)
//   - roles (aggregated from all BoardMember rows for this personKey)
//   - tags = ['stub']
//   - metadata.needsEnrichment = true
//
// Future research populates biography / linkedInUrl / photoUrl / affiliations.
//
// Dry-run by default. Pass --apply to write.
// Idempotent: only creates profiles for personKeys that don't have one.

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

type RoleEntry = {
  companyId: string
  companyName: string
  role: string
  fromYear: number | null
  toYear: number | null
}

async function main() {
  const { apply } = parseArgs(process.argv.slice(2))
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  const prisma = new PrismaClient({ adapter })

  console.log(`Mode: ${apply ? 'APPLY' : 'dry-run (pass --apply to write)'}\n`)

  // Find personKeys that appear in BoardMember but not in PersonProfile.
  const orphanKeys = await prisma.$queryRaw<Array<{ personKey: string }>>`
    SELECT DISTINCT bm."personKey"
    FROM "BoardMember" bm
    LEFT JOIN "PersonProfile" pp ON pp."personKey" = bm."personKey"
    WHERE pp."personKey" IS NULL
    ORDER BY bm."personKey"
  `

  console.log(`Orphan personKeys (in BoardMember, no PersonProfile): ${orphanKeys.length}\n`)

  let created = 0
  for (const { personKey } of orphanKeys) {
    // Fetch all BoardMember rows for this person, with company info
    const memberships = await prisma.boardMember.findMany({
      where: { personKey },
      select: {
        personName: true,
        role: true,
        companyId: true,
        effectiveFrom: true,
        effectiveTo: true,
        company: { select: { name: true } },
      },
      orderBy: { effectiveFrom: 'desc' },
    })

    if (memberships.length === 0) continue

    // Pick the most common name spelling for personName (handles minor variations)
    const nameCounts = new Map<string, number>()
    for (const m of memberships) {
      nameCounts.set(m.personName, (nameCounts.get(m.personName) ?? 0) + 1)
    }
    const name = [...nameCounts.entries()].sort((a, b) => b[1] - a[1])[0][0]

    const roles: RoleEntry[] = memberships.map(m => ({
      companyId: m.companyId,
      companyName: m.company?.name ?? '(unknown)',
      role: m.role,
      fromYear: m.effectiveFrom?.getFullYear() ?? null,
      toYear: m.effectiveTo?.getFullYear() ?? null,
    }))

    if (apply) {
      await prisma.personProfile.create({
        data: {
          name,
          personKey,
          roles: roles as unknown as object[],
          tags: ['stub'],
          affiliations: [],
          metadata: { needsEnrichment: true, source: 'BoardMember stub backfill 2026-05-26' },
        },
      })
    }
    created++
    if (created % 25 === 0) {
      console.log(`  ${created} / ${orphanKeys.length} processed`)
    }
  }

  console.log(`\n── Summary ────────────────────`)
  console.log(`  Stub PersonProfiles ${apply ? 'created' : 'would create'}: ${created}`)
  if (!apply) console.log(`\n  Re-run with --apply to write.`)
}

main().then(() => process.exit(0)).catch(e => {
  console.error('FATAL:', (e as Error).message)
  process.exit(1)
})
