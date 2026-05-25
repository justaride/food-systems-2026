import { prisma } from '@/lib/db'
import { financialAmountToNok } from '@/lib/queries/financial-units'

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
