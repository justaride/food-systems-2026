import 'dotenv/config'
import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { KONSERN_REGISTRY } from '../src/lib/queries/ownership'
import { computeQualityScore } from './lib/konsern-coverage-scoring'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

type CoverageEntry = {
  slug: string
  rootCompanyId: string
  rootName: string
  rootOrgNr: string
  ownershipType: string | null
  controllingOwner: { name: string; pct: number | null; source: string | null } | null
  qualityScore: number
  metrics: {
    treeSize: number
    childrenWithLatestFinancial: number
    childrenWithoutFinancial: number
    childrenWithBoardMembers: number
    childrenWithoutBoardMembers: number
    ownershipEdgesWithSource: number
    ownershipEdgesWithoutSource: number
    propertyCount: number
    relationshipCount: number
    maEventCount: number
    maEventsWithDealValue: number
    daysSinceBrregRefresh: number | null
  }
  gaps: string[]
}

async function gatherTreeIds(rootId: string): Promise<string[]> {
  const ids = new Set<string>([rootId])
  let frontier = [rootId]
  while (frontier.length > 0) {
    const children = await prisma.companyOwnership.findMany({
      where: { parentCompanyId: { in: frontier } },
      select: { childCompanyId: true },
    })
    const nextFrontier: string[] = []
    for (const c of children) {
      if (!ids.has(c.childCompanyId)) {
        ids.add(c.childCompanyId)
        nextFrontier.push(c.childCompanyId)
      }
    }
    frontier = nextFrontier
  }
  return [...ids]
}

async function buildEntry(orgNr: string, cfg: { slug: string; expectsMaActivity: boolean }): Promise<CoverageEntry | null> {
  const root = await prisma.company.findUnique({ where: { orgNr } })
  if (!root) return null

  const treeIds = await gatherTreeIds(root.id)
  const childIds = treeIds.filter(id => id !== root.id)
  const ownershipEdges = await prisma.companyOwnership.findMany({
    where: { parentCompanyId: { in: treeIds } },
    select: { source: true, ownershipType: true, metadata: true, effectiveFrom: true },
  })
  const controllingShareholder = await prisma.shareholder.findFirst({
    where: { companyId: root.id, isControlling: true },
    select: { name: true, ownershipPct: true, source: true },
  })

  const currentYear = new Date().getFullYear()
  const latestYear = currentYear - 1
  const financials = await prisma.companyFinancial.findMany({
    where: { companyId: { in: childIds }, year: latestYear },
    select: { companyId: true },
  })
  const childrenWithLatestFinancial = new Set(financials.map(f => f.companyId)).size

  const boardMembers = await prisma.boardMember.findMany({
    where: { companyId: { in: childIds } },
    select: { companyId: true },
  })
  const childrenWithBoardMembers = new Set(boardMembers.map(b => b.companyId)).size

  const propertyCount = await prisma.companyProperty.count({ where: { companyId: { in: treeIds } } })
  const relationshipCount = await prisma.businessRelationship.count({
    where: { OR: [{ fromCompanyId: { in: treeIds } }, { toCompanyId: { in: treeIds } }] },
  })

  const maEvents = ownershipEdges.filter(e => {
    const meta = (e.metadata ?? {}) as Record<string, unknown>
    return typeof meta.dealType === 'string'
  })
  const maEventsWithDealValue = maEvents.filter(e => {
    const meta = (e.metadata ?? {}) as Record<string, unknown>
    return typeof meta.dealValue === 'number' || typeof meta.dealValue === 'string'
  }).length

  const daysSinceBrregRefresh = root.lastBrregRefreshAt
    ? Math.floor((Date.now() - root.lastBrregRefreshAt.getTime()) / (1000 * 60 * 60 * 24))
    : null

  const ownershipEdgesWithSource = ownershipEdges.filter(e => e.source && e.source.length > 0).length
  const ownershipEdgesWithoutSource = ownershipEdges.length - ownershipEdgesWithSource

  const qualityScore = computeQualityScore({
    hasControllingOwner: !!controllingShareholder,
    ownershipEdgesWithSource,
    ownershipEdgesTotal: ownershipEdges.length,
    childrenWithLatestFinancial,
    childrenTotal: childIds.length,
    propertyCount,
    relationshipCount,
    daysSinceBrregRefresh,
    maEventCount: maEvents.length,
    expectsMaActivity: cfg.expectsMaActivity,
  })

  const gaps: string[] = []
  if (!controllingShareholder) gaps.push('Mangler kontrollerende eier på rotnode')
  if (ownershipEdgesWithoutSource > 0) gaps.push(`${ownershipEdgesWithoutSource} ownership-kanter uten source`)
  const childrenWithoutFinancial = childIds.length - childrenWithLatestFinancial
  if (childrenWithoutFinancial > 0) gaps.push(`${childrenWithoutFinancial} datterselskap uten siste års regnskap`)
  const childrenWithoutBoardMembers = childIds.length - childrenWithBoardMembers
  if (childrenWithoutBoardMembers > 0) gaps.push(`${childrenWithoutBoardMembers} datterselskap uten styremedlemmer`)
  if (daysSinceBrregRefresh === null) gaps.push('Aldri Brreg-refreshet')
  else if (daysSinceBrregRefresh >= 90) gaps.push(`Brreg-refresh ${daysSinceBrregRefresh} dager gammel`)
  if (cfg.expectsMaActivity && maEvents.length === 0) gaps.push('Forventer M&A-aktivitet, ingen events registrert')

  return {
    slug: cfg.slug,
    rootCompanyId: root.id,
    rootName: root.name,
    rootOrgNr: root.orgNr ?? '',
    ownershipType: ownershipEdges[0]?.ownershipType ?? null,
    controllingOwner: controllingShareholder
      ? { name: controllingShareholder.name, pct: controllingShareholder.ownershipPct, source: controllingShareholder.source }
      : null,
    qualityScore,
    metrics: {
      treeSize: treeIds.length,
      childrenWithLatestFinancial,
      childrenWithoutFinancial,
      childrenWithBoardMembers,
      childrenWithoutBoardMembers,
      ownershipEdgesWithSource,
      ownershipEdgesWithoutSource,
      propertyCount,
      relationshipCount,
      maEventCount: maEvents.length,
      maEventsWithDealValue,
      daysSinceBrregRefresh,
    },
    gaps,
  }
}

async function main() {
  const entries: CoverageEntry[] = []
  const missing: string[] = []
  for (const [orgNr, cfg] of Object.entries(KONSERN_REGISTRY)) {
    const entry = await buildEntry(orgNr, cfg)
    if (entry) entries.push(entry)
    else missing.push(`${cfg.slug} (${orgNr})`)
  }

  // Also report orphan roots (not in registry)
  const allRoots: any = await prisma.$queryRaw`
    SELECT DISTINCT c.id, c."orgNr", c.name
    FROM "Company" c
    WHERE c.id IN (SELECT DISTINCT "parentCompanyId" FROM "CompanyOwnership")
    AND c.id NOT IN (SELECT DISTINCT "childCompanyId" FROM "CompanyOwnership")
  `
  const orphans = allRoots.filter((r: any) => !Object.keys(KONSERN_REGISTRY).includes(r.orgNr))

  const out = {
    generatedAt: new Date().toISOString(),
    entries: entries.sort((a, b) => a.qualityScore - b.qualityScore),
    missingFromData: missing,
    orphanRoots: orphans.map((r: any) => ({ id: r.id, orgNr: r.orgNr, name: r.name })),
  }

  const path = join(process.cwd(), 'data/konsern-coverage.json')
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, JSON.stringify(out, null, 2))
  console.log(`Wrote ${path}`)
  console.log(`  ${entries.length} konserner med data; ${missing.length} registry-entries mangler i DB`)
  console.log(`  ${orphans.length} orphan rotnoder (ikke i registry)`)
}

main().finally(() => prisma.$disconnect())
