/**
 * WS3 scoped audit: board interlocks and ownership control for non-Norwegian
 * Nordic companies (SE/DK/FI/IS).
 *
 * This is a read-only DB audit. It reuses the AP-1/AP-5 pure compute functions,
 * filters the DB read to the non-Norwegian Nordic scope, and writes a review
 * JSON only when run as a CLI.
 */

import 'dotenv/config'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { pathToFileURL } from 'node:url'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { computeInterlocks, type Seat } from './analyze-board-interlocks'
import { computeCrossHoldings, type CompanyNode, type OwnershipEdge } from './analyze-cross-holdings'

export const DEFAULT_NORDIC_SCOPE_COUNTRIES = ['SE', 'DK', 'FI', 'IS'] as const
export const DEFAULT_NORDIC_BOARD_OWNERSHIP_OUT =
  'research/_status/nordic-board-ownership-audit-2026-07-02.json'

type ScopedCompany = {
  id: string
  name: string
  country: string | null
  valueChainStage: string | null
}

type ScopedBoardRow = {
  personKey: string
  personName: string
  role: string | null
  company: ScopedCompany
}

type ScopedOwnershipRow = {
  ownershipPct: number | { toString(): string } | null
  ownershipType: string
  parentCompany: ScopedCompany
  childCompany: ScopedCompany
}

export type NordicBoardOwnershipAuditInput = {
  generatedAt?: string
  countries: string[]
  boardRows: ScopedBoardRow[]
  scopedCompanyUniverse: number
  ownershipRows: ScopedOwnershipRow[]
  scopedCompanies: ScopedCompany[]
}

export function parseCountries(argv: string[] = process.argv.slice(2)): string[] {
  const arg = argv.find((value) => value.startsWith('--countries='))
  if (!arg) return [...DEFAULT_NORDIC_SCOPE_COUNTRIES]
  return arg
    .slice('--countries='.length)
    .split(',')
    .map((country) => country.trim().toUpperCase())
    .filter(Boolean)
}

export function parseOutputPath(argv: string[] = process.argv.slice(2)): string {
  const arg = argv.find((value) => value.startsWith('--out='))
  return arg?.slice('--out='.length) ?? DEFAULT_NORDIC_BOARD_OWNERSHIP_OUT
}

export function buildNordicBoardOwnershipAudit(input: NordicBoardOwnershipAuditInput) {
  const boardSeats: Seat[] = input.boardRows.map((row) => ({
    personKey: row.personKey,
    personName: row.personName,
    role: row.role,
    companyId: row.company.id,
    companyName: row.company.name,
    sector: row.company.valueChainStage,
  }))

  const companiesById = new Map<string, CompanyNode>()
  for (const company of input.scopedCompanies) {
    companiesById.set(company.id, {
      id: company.id,
      name: `${company.name} (${company.country ?? 'unknown'})`,
      sector: company.valueChainStage,
    })
  }

  const ownershipEdges: OwnershipEdge[] = input.ownershipRows.map((row) => {
    for (const company of [row.parentCompany, row.childCompany]) {
      if (!companiesById.has(company.id)) {
        companiesById.set(company.id, {
          id: company.id,
          name: `${company.name} (${company.country ?? 'unknown'})`,
          sector: company.valueChainStage,
        })
      }
    }

    return {
      parentId: row.parentCompany.id,
      childId: row.childCompany.id,
      pct: row.ownershipPct === null ? null : Number(row.ownershipPct),
      type: row.ownershipType,
    }
  })

  return {
    generatedAt: input.generatedAt ?? new Date().toISOString(),
    countries: input.countries,
    source:
      'internal DB scoped to non-Norwegian Nordic companies; ownership edges include parent/child edges touching scoped companies',
    boardInterlocks: computeInterlocks(boardSeats, {
      companyUniverse: input.scopedCompanyUniverse,
    }),
    ownershipControl: computeCrossHoldings(ownershipEdges, [...companiesById.values()]),
    caveats: [
      'Board interlocks are structural positions, not evidence of coordination, intent or unlawful conduct.',
      'Ownership control is defined as subsidiary or ownershipPct >= 50; minority/JV rows are not treated as control.',
      'Coverage is limited by imported Company, BoardMember and CompanyOwnership rows in the local DB.',
    ],
  }
}

export async function runNordicBoardOwnershipAudit(argv: string[] = process.argv.slice(2)) {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required')

  const countries = parseCountries(argv)
  const out = parseOutputPath(argv)
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter })

  try {
    const [boardRows, scopedCompanyUniverse, ownershipRows, scopedCompanies] = await Promise.all([
      prisma.boardMember.findMany({
        where: {
          company: { country: { in: countries } },
        },
        select: {
          personKey: true,
          personName: true,
          role: true,
          company: {
            select: { id: true, name: true, country: true, valueChainStage: true },
          },
        },
      }),
      prisma.company.count({ where: { country: { in: countries } } }),
      prisma.companyOwnership.findMany({
        where: {
          OR: [
            { parentCompany: { country: { in: countries } } },
            { childCompany: { country: { in: countries } } },
          ],
        },
        select: {
          ownershipPct: true,
          ownershipType: true,
          parentCompany: { select: { id: true, name: true, country: true, valueChainStage: true } },
          childCompany: { select: { id: true, name: true, country: true, valueChainStage: true } },
        },
      }),
      prisma.company.findMany({
        where: { country: { in: countries } },
        select: { id: true, name: true, country: true, valueChainStage: true },
      }),
    ])

    const result = buildNordicBoardOwnershipAudit({
      countries,
      boardRows,
      scopedCompanyUniverse,
      ownershipRows,
      scopedCompanies,
    })

    mkdirSync(dirname(out), { recursive: true })
    writeFileSync(out, `${JSON.stringify(result, null, 2)}\n`)

    const summary = {
      out,
      countries,
      board: result.boardInterlocks.totals,
      ownership: result.ownershipControl.totals,
    }
    console.log(JSON.stringify(summary, null, 2))
    return summary
  } finally {
    await prisma.$disconnect()
  }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isMain) {
  runNordicBoardOwnershipAudit().catch((error) => {
    console.error('[nordic-board-ownership] failed:', error)
    process.exit(1)
  })
}
