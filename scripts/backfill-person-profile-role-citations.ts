import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import {
  buildPersonProfileRoleCitationPlans,
  type CitedBoardMemberRole,
  type PersonProfileRole,
  type PersonProfileRoleProfile,
} from './lib/person-profile-role-citations'
import { ensureFieldCitation } from './lib/import-helpers'

type CliOptions = {
  apply: boolean
}

function parseArgs(argv: string[]): CliOptions {
  const options = { apply: false }

  for (const arg of argv) {
    if (arg === '--apply') {
      options.apply = true
      continue
    }
    if (arg === '--dry-run') {
      options.apply = false
      continue
    }
    throw new Error(`Unknown argument: ${arg}`)
  }

  return options
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  const prisma = new PrismaClient({ adapter })

  console.log(`PersonProfile role citation backfill: ${options.apply ? 'APPLY' : 'DRY RUN'}`)

  try {
    const [profiles, boardMembers, boardFieldCitations] = await Promise.all([
      prisma.personProfile.findMany({
        select: {
          id: true,
          personKey: true,
          roles: true,
        },
        orderBy: { personKey: 'asc' },
      }),
      prisma.boardMember.findMany({
        where: {
          verificationStatus: { in: ['machine_verified', 'human_verified'] },
        },
        select: {
          id: true,
          personKey: true,
          role: true,
          companyId: true,
          company: {
            select: { name: true },
          },
        },
      }),
      prisma.fieldCitation.findMany({
        where: { entityType: 'BoardMember' },
        select: {
          entityId: true,
          citationId: true,
          fieldPath: true,
        },
        orderBy: [{ fieldPath: 'asc' }, { citationId: 'asc' }],
      }),
    ])

    const preferredCitationByBoardMember = selectPreferredBoardMemberCitations(boardFieldCitations)
    const citedBoardRows: CitedBoardMemberRole[] = boardMembers
      .map(member => {
        const citationId = preferredCitationByBoardMember.get(member.id)
        if (!citationId) return null
        return {
          id: member.id,
          personKey: member.personKey,
          companyId: member.companyId,
          companyName: member.company.name,
          role: member.role,
          citationId,
        }
      })
      .filter((row): row is CitedBoardMemberRole => row !== null)

    const profileRows: PersonProfileRoleProfile[] = profiles.map(profile => ({
      id: profile.id,
      personKey: profile.personKey,
      roles: normalizeRoles(profile.roles),
    }))

    const result = buildPersonProfileRoleCitationPlans(profileRows, citedBoardRows)

    if (options.apply) {
      for (const plan of result.plans) {
        await ensureFieldCitation(prisma, plan.citationId, 'PersonProfile', plan.profileId, plan.fieldPath)
      }
    }

    const skippedByReason = result.skipped.reduce<Record<string, number>>((acc, skipped) => {
      acc[skipped.reason] = (acc[skipped.reason] ?? 0) + 1
      return acc
    }, {})

    console.log(`Profiles read: ${profileRows.length}`)
    console.log(`Cited BoardMember rows available: ${citedBoardRows.length}`)
    console.log(`${options.apply ? 'Created/confirmed' : 'Would create'} PersonProfile role FieldCitation rows: ${result.plans.length}`)
    console.log(`Skipped roles: ${result.skipped.length}`)
    for (const [reason, count] of Object.entries(skippedByReason).sort()) {
      console.log(`  ${reason}: ${count}`)
    }
  } finally {
    await prisma.$disconnect()
  }
}

function selectPreferredBoardMemberCitations(
  rows: Array<{ entityId: string; citationId: string; fieldPath: string | null }>,
): Map<string, string> {
  const preferred = new Map<string, string>()
  const fallback = new Map<string, string>()

  for (const row of rows) {
    if (!fallback.has(row.entityId)) fallback.set(row.entityId, row.citationId)
    if (row.fieldPath === 'role' && !preferred.has(row.entityId)) {
      preferred.set(row.entityId, row.citationId)
    }
  }

  for (const [entityId, citationId] of fallback) {
    if (!preferred.has(entityId)) preferred.set(entityId, citationId)
  }

  return preferred
}

function normalizeRoles(value: unknown): PersonProfileRole[] {
  if (!Array.isArray(value)) return []

  return value
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
    .map(item => ({
      companyId: typeof item.companyId === 'string' ? item.companyId : null,
      companyName: typeof item.companyName === 'string' ? item.companyName : null,
      role: typeof item.role === 'string' ? item.role : null,
      fromYear: typeof item.fromYear === 'number' ? item.fromYear : null,
      toYear: typeof item.toYear === 'number' ? item.toYear : null,
    }))
}

main().catch((error) => {
  console.error('PersonProfile role citation backfill failed:', error)
  process.exit(1)
})
