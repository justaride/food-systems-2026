import 'dotenv/config'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import {
  buildSourceCoverageGapRows,
  formatSourceCoverageGapRowsCsv,
  type SourceCoverageCompany,
  type SourceCoveragePersonProfileRole,
} from '../src/lib/source-coverage-gaps'
import {
  buildPersonProfileRoleFieldPath,
  type PersonProfileRole,
} from '../src/lib/person-profile-role-citations'

type CliOptions = {
  outputPath: string
  stdout: boolean
}

function parseArgs(argv: string[]): CliOptions {
  const options: CliOptions = {
    outputPath: `research/source-coverage-gaps-${new Date().toISOString().slice(0, 10)}.csv`,
    stdout: false,
  }

  for (const arg of argv) {
    if (arg === '--stdout') {
      options.stdout = true
      continue
    }
    if (arg.startsWith('--output=')) {
      options.outputPath = arg.slice('--output='.length)
      continue
    }
    throw new Error(`Unknown argument: ${arg}`)
  }

  return options
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
  })

  try {
    const [boardMembers, shareholders, profiles, companies, fieldCitations] = await Promise.all([
      prisma.boardMember.findMany({
        select: {
          id: true,
          personName: true,
          personKey: true,
          role: true,
          company: { select: companySelect },
        },
        orderBy: [{ companyId: 'asc' }, { personName: 'asc' }, { role: 'asc' }, { id: 'asc' }],
      }),
      prisma.shareholder.findMany({
        select: {
          id: true,
          name: true,
          ownershipPct: true,
          company: { select: companySelect },
        },
        orderBy: [{ companyId: 'asc' }, { name: 'asc' }, { id: 'asc' }],
      }),
      prisma.personProfile.findMany({
        select: {
          id: true,
          name: true,
          personKey: true,
          roles: true,
        },
        orderBy: [{ personKey: 'asc' }, { id: 'asc' }],
      }),
      prisma.company.findMany({
        select: companySelect,
      }),
      prisma.fieldCitation.findMany({
        select: {
          entityType: true,
          entityId: true,
          fieldPath: true,
        },
        orderBy: [{ entityType: 'asc' }, { entityId: 'asc' }, { fieldPath: 'asc' }],
      }),
    ])

    const companiesById = new Map(companies.map(company => [company.id, normalizeCompany(company)]))
    const personProfileRoles = profiles.flatMap(profile => normalizeRoles(profile.roles).map(role => {
      const company = role.companyId ? companiesById.get(role.companyId) ?? null : null
      return {
        profileId: profile.id,
        profileName: profile.name,
        personKey: profile.personKey,
        role: role.role,
        fieldPath: buildPersonProfileRoleFieldPath(role),
        company,
        companyId: role.companyId,
        companyName: role.companyName,
      } satisfies SourceCoveragePersonProfileRole
    }))

    const rows = buildSourceCoverageGapRows({
      boardMembers: boardMembers.map(row => ({
        id: row.id,
        personName: row.personName,
        personKey: row.personKey,
        role: row.role,
        company: normalizeCompany(row.company),
      })),
      shareholders: shareholders.map(row => ({
        id: row.id,
        name: row.name,
        ownershipPct: row.ownershipPct?.toString() ?? null,
        company: normalizeCompany(row.company),
      })),
      personProfileRoles,
      fieldCitations,
    })

    const csv = formatSourceCoverageGapRowsCsv(rows)
    const byType = rows.reduce<Record<string, number>>((acc, row) => {
      acc[row.entityType] = (acc[row.entityType] ?? 0) + 1
      return acc
    }, {})

    if (options.stdout) {
      process.stdout.write(csv)
    } else {
      const absolutePath = resolve(options.outputPath)
      mkdirSync(dirname(absolutePath), { recursive: true })
      writeFileSync(absolutePath, csv, 'utf8')
      console.log(`Wrote ${rows.length} source coverage gap row(s) to ${options.outputPath}`)
    }

    const log = options.stdout ? console.error : console.log
    for (const [entityType, count] of Object.entries(byType).sort()) {
      log(`  ${entityType}: ${count}`)
    }
  } finally {
    await prisma.$disconnect()
  }
}

const companySelect = {
  id: true,
  name: true,
  country: true,
  orgNr: true,
  registrySource: true,
  orgNrFormat: true,
} as const

function normalizeCompany(company: SourceCoverageCompany): SourceCoverageCompany {
  return {
    id: company.id,
    name: company.name,
    country: company.country,
    orgNr: company.orgNr,
    registrySource: company.registrySource,
    orgNrFormat: company.orgNrFormat,
  }
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
  console.error('Source coverage gap export failed:', error)
  process.exit(1)
})
