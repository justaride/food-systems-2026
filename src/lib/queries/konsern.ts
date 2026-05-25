import { prisma } from '@/lib/db'
import { financialAmountToNok } from '@/lib/queries/financial-units'

// ─── Section 4: Aggregert økonomi ────────────────────────────────────────────

export type KonsernFinancialsAggregate = {
  perYear: Array<{
    year: number
    totalRevenueNok: number | null
    totalEbitdaNok: number | null
    totalEmployees: number | null
  }>
  topRevenueChildren: Array<{
    companyId: string
    companyName: string
    revenueNok: number | null
  }>
  childrenWithoutLatestFinancial: Array<{
    companyId: string
    companyName: string
  }>
}

export async function getKonsernFinancials(treeIds: string[]): Promise<KonsernFinancialsAggregate> {
  if (treeIds.length === 0) {
    return { perYear: [], topRevenueChildren: [], childrenWithoutLatestFinancial: [] }
  }

  const currentYear = new Date().getFullYear()
  const latestYear = currentYear - 1
  const earliestYear = latestYear - 4  // 5 years back

  const [financials, companies] = await Promise.all([
    prisma.companyFinancial.findMany({
      where: {
        companyId: { in: treeIds },
        year: { gte: earliestYear, lte: latestYear },
      },
      select: {
        companyId: true,
        year: true,
        revenueNok: true,
        ebitda: true,
        groupEmployees: true,
        source: true,
      },
    }),
    prisma.company.findMany({
      where: { id: { in: treeIds } },
      select: { id: true, name: true },
    }),
  ])

  const companyNameById = new Map(companies.map(c => [c.id, c.name]))

  // Aggregate per year
  const yearMap = new Map<number, { totalRevenueNok: number | null; totalEbitdaNok: number | null; totalEmployees: number | null }>()
  for (const f of financials) {
    const rev = financialAmountToNok(f.revenueNok, f.source)
    const ebitda = financialAmountToNok(f.ebitda, f.source)
    const employees = f.groupEmployees != null ? f.groupEmployees : null
    const existing = yearMap.get(f.year) ?? { totalRevenueNok: null, totalEbitdaNok: null, totalEmployees: null }
    yearMap.set(f.year, {
      totalRevenueNok: rev != null ? (existing.totalRevenueNok ?? 0) + rev : existing.totalRevenueNok,
      totalEbitdaNok: ebitda != null ? (existing.totalEbitdaNok ?? 0) + ebitda : existing.totalEbitdaNok,
      totalEmployees: employees != null ? (existing.totalEmployees ?? 0) + employees : existing.totalEmployees,
    })
  }

  const perYear = Array.from(yearMap.entries())
    .map(([year, agg]) => ({ year, ...agg }))
    .sort((a, b) => b.year - a.year)  // newest first

  // Top 5 by latest year revenue
  const latestFinancials = financials.filter(f => f.year === latestYear)
  const revenueByCompany = new Map<string, number>()
  for (const f of latestFinancials) {
    const rev = financialAmountToNok(f.revenueNok, f.source)
    if (rev != null) {
      revenueByCompany.set(f.companyId, (revenueByCompany.get(f.companyId) ?? 0) + rev)
    }
  }

  const topRevenueChildren = Array.from(revenueByCompany.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([companyId, revenueNok]) => ({
      companyId,
      companyName: companyNameById.get(companyId) ?? companyId,
      revenueNok,
    }))

  // Companies without latest year financials
  const companiesWithLatest = new Set(latestFinancials.map(f => f.companyId))
  const childrenWithoutLatestFinancial = treeIds
    .filter(id => !companiesWithLatest.has(id))
    .map(id => ({
      companyId: id,
      companyName: companyNameById.get(id) ?? id,
    }))

  return { perYear, topRevenueChildren, childrenWithoutLatestFinancial }
}

// ─── Section 5: Styre & interlocks ───────────────────────────────────────────

export type KonsernBoardMember = {
  personKey: string
  personName: string
  konsernCompanies: Array<{ companyId: string; companyName: string; role: string | null }>
  internalInterlock: boolean   // sits in >= 2 companies in this konsern
  externalInterlock: boolean   // sits in companies outside this konsern
  externalCount: number        // how many other companies outside this konsern
  hasProfile: boolean          // is there a PersonProfile?
}

export async function getKonsernBoard(treeIds: string[]): Promise<KonsernBoardMember[]> {
  if (treeIds.length === 0) return []

  const treeIdSet = new Set(treeIds)

  // 1. Fetch all BoardMember rows for companies in the tree
  const boardMembers = await prisma.boardMember.findMany({
    where: { companyId: { in: treeIds } },
    select: {
      personKey: true,
      personName: true,
      companyId: true,
      role: true,
      company: { select: { name: true } },
    },
    orderBy: [{ personKey: 'asc' }, { companyId: 'asc' }],
  })

  if (boardMembers.length === 0) return []

  // Group by personKey — collapse multiple roles in the same company
  // Map: personKey -> Map<companyId, { companyName, roles[] }>
  const personMap = new Map<string, { personName: string; companies: Map<string, { companyName: string; roles: string[] }> }>()

  for (const bm of boardMembers) {
    if (!personMap.has(bm.personKey)) {
      personMap.set(bm.personKey, { personName: bm.personName, companies: new Map() })
    }
    const person = personMap.get(bm.personKey)!
    if (!person.companies.has(bm.companyId)) {
      person.companies.set(bm.companyId, { companyName: bm.company.name, roles: [] })
    }
    const comp = person.companies.get(bm.companyId)!
    if (bm.role && !comp.roles.includes(bm.role)) {
      comp.roles.push(bm.role)
    }
  }

  const allPersonKeys = Array.from(personMap.keys())

  // 2. Count external board memberships (outside this konsern)
  const externalCounts = await prisma.boardMember.groupBy({
    by: ['personKey'],
    where: {
      personKey: { in: allPersonKeys },
      companyId: { notIn: treeIds },
    },
    _count: { companyId: true },
  })
  const externalCountMap = new Map(externalCounts.map(r => [r.personKey, r._count.companyId]))

  // 3. PersonProfile lookup
  const profiles = await prisma.personProfile.findMany({
    where: { personKey: { in: allPersonKeys } },
    select: { personKey: true },
  })
  const profileSet = new Set(profiles.map(p => p.personKey))

  // 4. Build result array
  const result: KonsernBoardMember[] = []
  for (const [personKey, data] of personMap) {
    const konsernCompanies = Array.from(data.companies.entries()).map(([companyId, info]) => ({
      companyId,
      companyName: info.companyName,
      role: info.roles.length > 0 ? info.roles.join(', ') : null,
    }))

    const externalCount = externalCountMap.get(personKey) ?? 0

    result.push({
      personKey,
      personName: data.personName,
      konsernCompanies,
      internalInterlock: konsernCompanies.length >= 2,
      externalInterlock: externalCount > 0,
      externalCount,
      hasProfile: profileSet.has(personKey),
    })
  }

  // Sort by number of konsern companies desc (most interlocked first)
  result.sort((a, b) => b.konsernCompanies.length - a.konsernCompanies.length)

  return result
}
