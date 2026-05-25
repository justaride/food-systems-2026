import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { prisma } from '@/lib/db'
import { financialAmountToNok } from '@/lib/queries/financial-units'
import type { KonsernFinancialsAggregate, KonsernBoardMember, KonsernSubsidies, KonsernProperties, KonsernRelationships } from '@/lib/queries/konsern'
import { getKonsernFinancials, getKonsernBoard, getKonsernSubsidies, getKonsernProperties, getKonsernRelationships } from '@/lib/queries/konsern'

export type KonsernConfig = {
  slug: string
  expectsMaActivity: boolean
}

export const KONSERN_REGISTRY: Record<string, KonsernConfig> = {
  '819731322': { slug: 'norgesgruppen', expectsMaActivity: true },
  '914526647': { slug: 'reitan-retail', expectsMaActivity: true },
  '936560288': { slug: 'coop',          expectsMaActivity: false },
  '910747711': { slug: 'orkla',         expectsMaActivity: true },
  '914224314': { slug: 'bama',          expectsMaActivity: false },
  '929228723': { slug: 'asko',          expectsMaActivity: false },
  '947942638': { slug: 'tine',          expectsMaActivity: false },
  '938752648': { slug: 'nortura',       expectsMaActivity: false },
  '964118191': { slug: 'mowi',          expectsMaActivity: true },
  '960514718': { slug: 'salmar',        expectsMaActivity: true },
  '975350940': { slug: 'leroy',         expectsMaActivity: true },
  '911608103': { slug: 'felleskjopet',  expectsMaActivity: false },
  '929975200': { slug: 'austevoll',     expectsMaActivity: true },
  '982254604': { slug: 'rema1000-norge', expectsMaActivity: false },
}

const SLUG_TO_ORGNR: Record<string, string> = Object.fromEntries(
  Object.entries(KONSERN_REGISTRY).map(([orgNr, cfg]) => [cfg.slug, orgNr])
)

export function slugForOrgNr(orgNr: string): string | null {
  return KONSERN_REGISTRY[orgNr]?.slug ?? null
}

export function orgNrForSlug(slug: string): string | null {
  return SLUG_TO_ORGNR[slug] ?? null
}

export function isKnownKonsernRoot(orgNr: string): boolean {
  return orgNr in KONSERN_REGISTRY
}

type OwnershipNode = {
  id: string
  name: string
  orgNr: string
  ownershipType: string | null
  valueChainStage: string | null
  latestFinancialYear?: number | null
  latestRevenueNok?: number | null
  latestOperatingResultNok?: number | null
  latestOperatingMargin?: number | null
  subsidyTotalNok?: number
  latestYearSubsidyNok?: number
  latestYearSubsidyCount?: number
  isSynthetic?: boolean
}

type OwnershipEdge = {
  parentId: string
  childId: string
  ownershipPct: number | null
  ownershipType: string
}

export type OwnershipTree = {
  rootId: string
  rootName: string
  nodes: OwnershipNode[]
  edges: OwnershipEdge[]
  financialSummary: {
    companyCount: number
    companiesWithFinancials: number
    companiesWithSubsidy: number
    totalRevenueNok: number
    totalOperatingResultNok: number
    weightedOperatingMargin: number | null
    totalSubsidyNok: number
    yearMatchedSubsidyNok: number
    companiesWithYearMatchedSubsidy: number
    yearMatchedSubsidySharePct: number | null
  }
}

export type OwnershipMapData = {
  trees: OwnershipTree[]
  totalCompanies: number
  totalRelationships: number
}

export async function getOwnershipMap(): Promise<OwnershipMapData> {
  const [ownerships, companies] = await Promise.all([
    prisma.companyOwnership.findMany({
      include: {
        parentCompany: { select: { id: true, name: true, orgNr: true, ownershipType: true, valueChainStage: true } },
        childCompany: { select: { id: true, name: true, orgNr: true, ownershipType: true, valueChainStage: true } },
      },
    }),
    prisma.company.findMany({
      where: {
        OR: [
          { parentOf: { some: {} } },
          { childOf: { some: {} } },
        ],
      },
      select: {
        id: true, name: true, orgNr: true, ownershipType: true, valueChainStage: true,
        shareholders: { where: { isControlling: true }, select: { name: true, ownershipPct: true } },
        financials: {
          orderBy: { year: 'desc' },
          take: 1,
          select: { year: true, revenueNok: true, operatingResult: true, operatingMargin: true, source: true },
        },
      },
    }),
  ])
  const subsidyRows = companies.length > 0
    ? await prisma.subsidy.groupBy({
        by: ['companyId'],
        where: { companyId: { in: companies.map(company => company.id) } },
        _sum: { amountNok: true },
      })
    : []
  const subsidyYearRows = companies.length > 0
    ? await prisma.subsidy.groupBy({
        by: ['companyId', 'year'],
        where: {
          companyId: { in: companies.map(company => company.id) },
          year: { not: null },
        },
        _sum: { amountNok: true },
        _count: { _all: true },
      })
    : []
  const subsidiesByCompany = new Map(
    subsidyRows.map(row => [row.companyId, Number(row._sum.amountNok ?? 0)])
  )
  const subsidiesByCompanyYear = new Map<string, { amountNok: number; count: number }>()
  for (const row of subsidyYearRows) {
    if (row.year == null) continue
    subsidiesByCompanyYear.set(`${row.companyId}:${row.year}`, {
      amountNok: Number(row._sum.amountNok ?? 0),
      count: row._count._all,
    })
  }

  const childToParent = new Map<string, string>()
  for (const o of ownerships) {
    childToParent.set(o.childCompanyId, o.parentCompanyId)
  }

  const roots = new Set<string>()
  for (const o of ownerships) {
    let parent = o.parentCompanyId
    while (childToParent.has(parent)) {
      parent = childToParent.get(parent)!
    }
    roots.add(parent)
  }

  const trees: OwnershipTree[] = []
  for (const rootId of roots) {
    const company = companies.find(c => c.id === rootId)
    if (!company) continue

    const treeNodes: OwnershipNode[] = []
    const treeEdges: OwnershipEdge[] = []
    const visited = new Set<string>()

    const controllingShareholder = company.shareholders[0]
    if (controllingShareholder) {
      const syntheticId = `shareholder-${rootId}`
      treeNodes.push({
        id: syntheticId,
        name: `${controllingShareholder.name} ${controllingShareholder.ownershipPct ? Number(controllingShareholder.ownershipPct) + '%' : ''}`,
        orgNr: '',
        ownershipType: null,
        valueChainStage: null,
        isSynthetic: true,
      })
      treeEdges.push({
        parentId: syntheticId,
        childId: rootId,
        ownershipPct: controllingShareholder.ownershipPct ? Number(controllingShareholder.ownershipPct) : null,
        ownershipType: 'subsidiary',
      })
    }

    const queue = [rootId]
    while (queue.length > 0) {
      const current = queue.shift()!
      if (visited.has(current)) continue
      visited.add(current)

      const comp = companies.find(c => c.id === current)
      if (comp) {
        const latestFinancial = comp.financials[0]
        const latestFinancialYear = latestFinancial?.year ?? null
        const latestYearSubsidy = latestFinancialYear != null
          ? subsidiesByCompanyYear.get(`${comp.id}:${latestFinancialYear}`)
          : undefined
        treeNodes.push({
          id: comp.id,
          name: comp.name,
          orgNr: comp.orgNr,
          ownershipType: comp.ownershipType,
          valueChainStage: comp.valueChainStage,
          latestFinancialYear,
          latestRevenueNok: financialAmountToNok(latestFinancial?.revenueNok, latestFinancial?.source),
          latestOperatingResultNok: financialAmountToNok(latestFinancial?.operatingResult, latestFinancial?.source),
          latestOperatingMargin: latestFinancial?.operatingMargin != null ? Number(latestFinancial.operatingMargin) : null,
          subsidyTotalNok: subsidiesByCompany.get(comp.id) ?? 0,
          latestYearSubsidyNok: latestYearSubsidy?.amountNok ?? 0,
          latestYearSubsidyCount: latestYearSubsidy?.count ?? 0,
        })
      }

      const children = ownerships.filter(o => o.parentCompanyId === current)
      for (const child of children) {
        treeEdges.push({
          parentId: current,
          childId: child.childCompanyId,
          ownershipPct: child.ownershipPct,
          ownershipType: child.ownershipType,
        })
        queue.push(child.childCompanyId)
      }
    }

    const companyNodes = treeNodes.filter(node => !node.isSynthetic)
    const totalRevenueNok = companyNodes.reduce((sum, node) => sum + (node.latestRevenueNok ?? 0), 0)
    const totalOperatingResultNok = companyNodes.reduce((sum, node) => sum + (node.latestOperatingResultNok ?? 0), 0)
    const totalSubsidyNok = companyNodes.reduce((sum, node) => sum + (node.subsidyTotalNok ?? 0), 0)
    const yearMatchedSubsidyNok = companyNodes.reduce((sum, node) => sum + (node.latestYearSubsidyNok ?? 0), 0)

    trees.push({
      rootId: controllingShareholder ? `shareholder-${rootId}` : rootId,
      rootName: company.name,
      nodes: treeNodes,
      edges: treeEdges,
      financialSummary: {
        companyCount: companyNodes.length,
        companiesWithFinancials: companyNodes.filter(node => node.latestRevenueNok != null).length,
        companiesWithSubsidy: companyNodes.filter(node => (node.subsidyTotalNok ?? 0) > 0).length,
        totalRevenueNok,
        totalOperatingResultNok,
        weightedOperatingMargin: totalRevenueNok > 0 ? (totalOperatingResultNok / totalRevenueNok) * 100 : null,
        totalSubsidyNok,
        yearMatchedSubsidyNok,
        companiesWithYearMatchedSubsidy: companyNodes.filter(node => (node.latestYearSubsidyNok ?? 0) > 0).length,
        yearMatchedSubsidySharePct: totalRevenueNok > 0 ? (yearMatchedSubsidyNok / totalRevenueNok) * 100 : null,
      },
    })
  }

  return {
    trees: trees.sort((a, b) => b.nodes.length - a.nodes.length),
    totalCompanies: new Set(ownerships.flatMap(o => [o.parentCompanyId, o.childCompanyId])).size,
    totalRelationships: ownerships.length,
  }
}

export async function getCompanyTreeIds(): Promise<Set<string>> {
  const ownerships = await prisma.companyOwnership.findMany({
    select: { parentCompanyId: true, childCompanyId: true },
  })
  return new Set(ownerships.flatMap(o => [o.parentCompanyId, o.childCompanyId]))
}

type KonsernIndexRow = {
  slug: string
  rootCompanyId: string
  rootName: string
  qualityScore: number
  treeSize: number
  totalRevenue: number | null
  maEventsCount: number
  daysSinceBrregRefresh: number | null
  controllingOwner: { name: string; pct: number | null } | null
  ownershipType: string | null
  gaps: string[]
}

let coverageCache: ReturnType<typeof JSON.parse> | null = null
function loadCoverage() {
  if (!coverageCache) {
    const path = join(process.cwd(), 'data/konsern-coverage.json')
    coverageCache = JSON.parse(readFileSync(path, 'utf-8'))
  }
  return coverageCache
}

export async function getKonsernIndex(): Promise<KonsernIndexRow[]> {
  const coverage = loadCoverage()
  const rows: KonsernIndexRow[] = []
  for (const entry of coverage.entries) {
    const treeIds = await gatherTreeIds(entry.rootCompanyId)
    const currentYear = new Date().getFullYear()
    const financials = await prisma.companyFinancial.findMany({
      where: { companyId: { in: treeIds }, year: currentYear - 1 },
      select: { revenueNok: true, source: true },
    })
    const totalRevenue = financials.reduce<number | null>(
      (acc, f) => {
        const nok = financialAmountToNok(f.revenueNok, f.source)
        return nok != null ? (acc ?? 0) + nok : acc
      },
      null,
    )
    rows.push({
      slug: entry.slug,
      rootCompanyId: entry.rootCompanyId,
      rootName: entry.rootName,
      qualityScore: entry.qualityScore,
      treeSize: entry.metrics.treeSize,
      totalRevenue,
      maEventsCount: entry.metrics.maEventCount,
      daysSinceBrregRefresh: entry.metrics.daysSinceBrregRefresh,
      controllingOwner: entry.controllingOwner ? {
        name: entry.controllingOwner.name,
        pct: entry.controllingOwner.pct != null ? parseFloat(entry.controllingOwner.pct) : null,
      } : null,
      ownershipType: entry.ownershipType,
      gaps: entry.gaps,
    })
  }
  return rows.sort((a, b) => a.qualityScore - b.qualityScore)
}

// ─── Konsern Dossier ─────────────────────────────────────────────────────────

export type MaEvent = {
  childCompanyId: string
  childName: string
  effectiveFrom: string | null  // ISO string for client serialization
  dealType: string | null
  dealValue: string | null  // normalized to string for display
  source: string | null
  notes: string | null
}

export type KonsernDossierData = {
  slug: string
  root: { id: string; name: string; orgNr: string }
  ownershipType: string | null
  controllingOwner: { name: string; pct: number | null; source: string | null } | null
  metrics: {
    treeSize: number
    totalRevenue: number | null    // NOK aggregate latest year
    totalEmployees: number | null  // aggregate latest year (groupEmployees sum)
    daysSinceBrregRefresh: number | null
  }
  coverage: {
    qualityScore: number
    gaps: string[]
    metrics: unknown
  }
  tree: OwnershipTree
  maEvents: MaEvent[]
  financials: KonsernFinancialsAggregate
  board: KonsernBoardMember[]
  subsidies: KonsernSubsidies
  properties: KonsernProperties
  relationships: KonsernRelationships
}

export async function getKonsernDossier(slug: string): Promise<KonsernDossierData | null> {
  const orgNr = orgNrForSlug(slug)
  if (!orgNr) return null

  const coverage = loadCoverage()
  const entry = coverage.entries.find((e: { slug: string }) => e.slug === slug)
  if (!entry) return null

  const rootCompany = await prisma.company.findUnique({
    where: { orgNr },
    select: { id: true, name: true, orgNr: true, lastBrregRefreshAt: true, ownershipType: true },
  })
  if (!rootCompany) return null

  const treeIds = await gatherTreeIds(rootCompany.id)
  const currentYear = new Date().getFullYear()

  // Fetch financials, ownerships, and section 4-8 data in parallel
  const [financials, ownerships, treeCompanies, konsernFinancials, konsernBoard, konsernSubsidies, konsernProperties, konsernRelationships] = await Promise.all([
    prisma.companyFinancial.findMany({
      where: { companyId: { in: treeIds }, year: currentYear - 1 },
      select: { companyId: true, revenueNok: true, source: true, groupEmployees: true, operatingResult: true, operatingMargin: true, year: true },
    }),
    prisma.companyOwnership.findMany({
      where: { parentCompanyId: { in: treeIds } },
      select: {
        parentCompanyId: true,
        childCompanyId: true,
        ownershipPct: true,
        ownershipType: true,
        effectiveFrom: true,
        metadata: true,
        childCompany: { select: { name: true } },
      },
    }),
    prisma.company.findMany({
      where: { id: { in: treeIds } },
      select: {
        id: true, name: true, orgNr: true, ownershipType: true, valueChainStage: true,
        shareholders: { where: { isControlling: true }, select: { name: true, ownershipPct: true } },
      },
    }),
    getKonsernFinancials(treeIds),
    getKonsernBoard(treeIds),
    getKonsernSubsidies(treeIds),
    getKonsernProperties(treeIds),
    getKonsernRelationships(treeIds),
  ])

  const totalRevenue = financials.reduce<number | null>((acc, f) => {
    const nok = financialAmountToNok(f.revenueNok, f.source)
    return nok != null ? (acc ?? 0) + nok : acc
  }, null)

  const totalEmployees = financials.reduce<number | null>((acc, f) => {
    return f.groupEmployees != null ? (acc ?? 0) + f.groupEmployees : acc
  }, null)

  const controllingOwner = entry.controllingOwner
    ? {
        name: entry.controllingOwner.name as string,
        pct: entry.controllingOwner.pct != null ? parseFloat(entry.controllingOwner.pct as string) : null,
        source: (entry.controllingOwner.source ?? null) as string | null,
      }
    : null

  // ─── Build OwnershipTree for this konsern ──────────────────────────────────
  const financialsByCompany = new Map(financials.map(f => [f.companyId, f]))
  const treeNodes: OwnershipNode[] = []
  const treeEdges: OwnershipEdge[] = []

  // Add synthetic controlling-owner node if applicable
  const rootTreeCompany = treeCompanies.find(c => c.id === rootCompany.id)
  const controllingShareholder = rootTreeCompany?.shareholders[0]
  if (controllingShareholder) {
    const syntheticId = `shareholder-${rootCompany.id}`
    treeNodes.push({
      id: syntheticId,
      name: `${controllingShareholder.name}${controllingShareholder.ownershipPct ? ` ${Number(controllingShareholder.ownershipPct)}%` : ''}`,
      orgNr: '',
      ownershipType: null,
      valueChainStage: null,
      isSynthetic: true,
    })
    treeEdges.push({
      parentId: syntheticId,
      childId: rootCompany.id,
      ownershipPct: controllingShareholder.ownershipPct ? Number(controllingShareholder.ownershipPct) : null,
      ownershipType: 'subsidiary',
    })
  }

  for (const comp of treeCompanies) {
    const f = financialsByCompany.get(comp.id)
    treeNodes.push({
      id: comp.id,
      name: comp.name,
      orgNr: comp.orgNr,
      ownershipType: comp.ownershipType,
      valueChainStage: comp.valueChainStage,
      latestFinancialYear: f?.year ?? null,
      latestRevenueNok: f ? financialAmountToNok(f.revenueNok, f.source) : null,
      latestOperatingResultNok: f ? financialAmountToNok(f.operatingResult, f.source) : null,
      latestOperatingMargin: f?.operatingMargin != null ? Number(f.operatingMargin) : null,
    })
  }

  for (const edge of ownerships) {
    treeEdges.push({
      parentId: edge.parentCompanyId,
      childId: edge.childCompanyId,
      ownershipPct: edge.ownershipPct,
      ownershipType: edge.ownershipType,
    })
  }

  const tree: OwnershipTree = {
    rootId: controllingShareholder ? `shareholder-${rootCompany.id}` : rootCompany.id,
    rootName: rootCompany.name,
    nodes: treeNodes,
    edges: treeEdges,
    financialSummary: {
      companyCount: treeCompanies.length,
      companiesWithFinancials: treeCompanies.filter(c => financialsByCompany.has(c.id)).length,
      companiesWithSubsidy: 0,
      totalRevenueNok: totalRevenue ?? 0,
      totalOperatingResultNok: 0,
      weightedOperatingMargin: null,
      totalSubsidyNok: 0,
      yearMatchedSubsidyNok: 0,
      companiesWithYearMatchedSubsidy: 0,
      yearMatchedSubsidySharePct: null,
    },
  }

  // ─── Build M&A events ─────────────────────────────────────────────────────
  const maEvents: MaEvent[] = ownerships
    .filter(e => {
      const meta = (e.metadata ?? {}) as Record<string, unknown>
      return typeof meta.dealType === 'string'
    })
    .map(e => {
      const meta = e.metadata as Record<string, unknown>
      return {
        childCompanyId: e.childCompanyId,
        childName: e.childCompany.name,
        effectiveFrom: e.effectiveFrom ? e.effectiveFrom.toISOString() : null,
        dealType: typeof meta.dealType === 'string' ? meta.dealType : null,
        dealValue: meta.dealValue == null ? null : String(meta.dealValue),
        source: typeof meta.source === 'string' ? meta.source : null,
        notes: typeof meta.notes === 'string' ? meta.notes : null,
      }
    })
    .sort((a, b) => {
      if (a.effectiveFrom === null && b.effectiveFrom === null) return 0
      if (a.effectiveFrom === null) return 1   // undated last
      if (b.effectiveFrom === null) return -1
      return b.effectiveFrom.localeCompare(a.effectiveFrom) // newest first
    })

  return {
    slug: entry.slug,
    root: {
      id: rootCompany.id,
      name: rootCompany.name,
      orgNr: rootCompany.orgNr,
    },
    ownershipType: rootCompany.ownershipType,
    controllingOwner,
    metrics: {
      treeSize: entry.metrics.treeSize as number,
      totalRevenue,
      totalEmployees,
      daysSinceBrregRefresh: (entry.metrics.daysSinceBrregRefresh ?? null) as number | null,
    },
    coverage: {
      qualityScore: entry.qualityScore as number,
      gaps: entry.gaps as string[],
      metrics: entry.metrics,
    },
    tree,
    maEvents,
    financials: konsernFinancials,
    board: konsernBoard,
    subsidies: konsernSubsidies,
    properties: konsernProperties,
    relationships: konsernRelationships,
  }
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
      if (!ids.has(c.childCompanyId)) { ids.add(c.childCompanyId); nextFrontier.push(c.childCompanyId) }
    }
    frontier = nextFrontier
  }
  return [...ids]
}
