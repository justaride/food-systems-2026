import 'dotenv/config'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import {
  buildBronnoysundRolesCitation,
  buildBronnoysundRolesSnapshotPath,
  buildBronnoysundRolesUrl,
  findMatchingBronnoysundRole,
  sha256Hex,
  stableJson,
  type BronnoysundRolesSnapshot,
} from './lib/bronnoysund-citations'
import { upsertWithCitation } from './lib/import-helpers'

const DEFAULT_HEADERS = {
  Accept: 'application/json',
  'User-Agent': 'food-systems-2026-bronnoysund-role-citation-backfill/0.1.0',
}

type CliOptions = {
  apply: boolean
  limit: number
  orgNrs: string[] | null
  accessedAt: string
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    apply: false,
    limit: 10,
    orgNrs: null,
    accessedAt: new Date().toISOString().slice(0, 10),
  }

  for (const arg of argv) {
    if (arg === '--apply') {
      options.apply = true
      continue
    }
    if (arg === '--dry-run') {
      options.apply = false
      continue
    }
    if (arg.startsWith('--limit=')) {
      const limit = Number(arg.slice('--limit='.length))
      if (!Number.isInteger(limit) || limit <= 0) throw new Error(`Invalid --limit value: ${arg}`)
      options.limit = limit
      continue
    }
    if (arg.startsWith('--orgnr=')) {
      const orgNrs = arg
        .slice('--orgnr='.length)
        .split(',')
        .map(value => value.trim())
        .filter(Boolean)
      if (orgNrs.length === 0) throw new Error('Expected one or more comma-separated org numbers after --orgnr=')
      options.orgNrs = orgNrs
      continue
    }
    if (arg.startsWith('--accessed-at=')) {
      const accessedAt = arg.slice('--accessed-at='.length)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(accessedAt)) {
        throw new Error(`Invalid --accessed-at value: ${arg}. Expected YYYY-MM-DD.`)
      }
      options.accessedAt = accessedAt
      continue
    }

    throw new Error(`Unknown argument: ${arg}`)
  }

  return options
}

async function fetchBronnoysundRoles(orgNr: string): Promise<BronnoysundRolesSnapshot> {
  const response = await fetch(buildBronnoysundRolesUrl(orgNr), { headers: DEFAULT_HEADERS })
  if (!response.ok) {
    const body = await response.text()
    throw new Error(`Brønnøysund roles ${response.status} for ${orgNr}: ${body.slice(0, 300)}`)
  }

  return await response.json() as BronnoysundRolesSnapshot
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  const prisma = new PrismaClient({ adapter })
  const verifiedAt = new Date(`${options.accessedAt}T00:00:00.000Z`)

  console.log(`Brønnøysund role citation backfill: ${options.apply ? 'APPLY' : 'DRY RUN'}`)
  console.log(`Limit: ${options.limit}`)
  console.log(`Accessed at: ${options.accessedAt}`)

  try {
    const companies = await prisma.company.findMany({
      where: options.orgNrs
        ? { orgNr: { in: options.orgNrs } }
        : { orgNr: { not: { contains: '-' } }, orgNrFormat: 'bronnoysund' },
      orderBy: { orgNr: 'asc' },
      take: options.limit,
      select: {
        id: true,
        name: true,
        orgNr: true,
        boardMembers: {
          select: {
            id: true,
            personName: true,
            role: true,
          },
        },
      },
    })

    let processed = 0
    let matched = 0
    let unmatched = 0
    let failed = 0

    for (const company of companies) {
      try {
        const snapshot = await fetchBronnoysundRoles(company.orgNr)
        const json = stableJson(snapshot)
        const contentHash = sha256Hex(json)
        const localPath = buildBronnoysundRolesSnapshotPath(company.orgNr, options.accessedAt)
        const citation = buildBronnoysundRolesCitation({
          orgNr: company.orgNr,
          name: company.name,
          accessedAt: options.accessedAt,
          localPath,
          contentHash,
        })
        const matchedMembers = []
        const unmatchedMembers = []

        for (const member of company.boardMembers) {
          const roleMatch = findMatchingBronnoysundRole(snapshot, member)
          if (roleMatch) {
            matchedMembers.push({ member, roleMatch })
          } else {
            unmatchedMembers.push(member)
          }
        }

        if (options.apply && matchedMembers.length > 0) {
          const absoluteSnapshotPath = join(process.cwd(), localPath)
          mkdirSync(dirname(absoluteSnapshotPath), { recursive: true })
          writeFileSync(absoluteSnapshotPath, json)

          for (const { member } of matchedMembers) {
            await upsertWithCitation(
              prisma,
              'BoardMember',
              db => db.boardMember.update({
                where: { id: member.id },
                data: {
                  verifiedAt,
                  verificationStatus: 'machine_verified',
                },
                select: { id: true },
              }),
              citation,
              [null, 'personName', 'role', 'verifiedAt', 'verificationStatus'],
            )
          }
        }

        console.log(
          `  ${options.apply ? 'UPDATED' : 'WOULD UPDATE'} ${company.orgNr} ${company.name}: `
          + `${matchedMembers.length}/${company.boardMembers.length} BoardMember match(es)`,
        )
        if (unmatchedMembers.length > 0) {
          console.log(`    unmatched: ${unmatchedMembers.map(member => `${member.personName} (${member.role})`).join('; ')}`)
        }

        processed++
        matched += matchedMembers.length
        unmatched += unmatchedMembers.length
      } catch (error) {
        failed++
        console.error(`  FAILED ${company.orgNr} ${company.name}:`, error instanceof Error ? error.message : error)
      }
    }

    console.log(`\nDone: ${processed} processed, ${matched} matched, ${unmatched} unmatched, ${failed} failed`)
    if (failed > 0) process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error('Role citation backfill failed:', error)
  process.exit(1)
})
