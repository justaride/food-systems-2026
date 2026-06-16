import { prisma } from '@/lib/db'
import { financialAmountToNok } from '@/lib/queries/financial-units'

// ─── Section 6: Tilskudd inn ──────────────────────────────────────────────────

export type KonsernSubsidies = {
  perYear: Array<{ year: number; totalNok: number }>   // last 5 years
  topSchemes: Array<{ scheme: string; totalNok: number; count: number }>  // top 5
  topRecipients: Array<{ companyId: string; companyName: string; totalNok: number }>  // top 5 companies only
  totalNok: number
  rowCount: number
  producerCount: number  // number of unique producers linked via DeliveryVolume
}

/**
 * Derive the set of producer IDs that deliver to any company in the given tree.
 * ANY-relationship semantics: a producer delivering to one company in the tree
 * is included. A producer can belong to multiple konserner (transparent overlap).
 */
export async function getProducerIdsForKonsern(treeIds: string[]): Promise<string[]> {
  if (treeIds.length === 0) return []
  const deliveries = await prisma.deliveryVolume.findMany({
    where: { buyerId: { in: treeIds }, supplierProducerId: { not: null } },
    select: { supplierProducerId: true },
  })
  return [...new Set(
    deliveries.map(d => d.supplierProducerId).filter((id): id is string => id !== null)
  )]
}

export async function getKonsernSubsidies(treeIds: string[]): Promise<KonsernSubsidies> {
  if (treeIds.length === 0) {
    return { perYear: [], topSchemes: [], topRecipients: [], totalNok: 0, rowCount: 0, producerCount: 0 }
  }

  const producerIds = await getProducerIdsForKonsern(treeIds)

  const subsidies = await prisma.subsidy.findMany({
    where: {
      OR: [
        { companyId: { in: treeIds } },
        ...(producerIds.length > 0 ? [{ producerId: { in: producerIds } }] : []),
      ],
    },
    select: { companyId: true, producerId: true, scheme: true, subsidyType: true, amountNok: true, year: true },
  })

  if (subsidies.length === 0) {
    return { perYear: [], topSchemes: [], topRecipients: [], totalNok: 0, rowCount: 0, producerCount: producerIds.length }
  }

  const currentYear = new Date().getFullYear()
  const latestYear = currentYear - 1
  const earliestYear = latestYear - 4

  // Per-year aggregation (last 5 years)
  const yearMap = new Map<number, number>()
  for (const s of subsidies) {
    if (s.year == null) continue
    if (s.year < earliestYear || s.year > latestYear) continue
    const amt = s.amountNok != null ? Number(s.amountNok) : 0
    yearMap.set(s.year, (yearMap.get(s.year) ?? 0) + amt)
  }
  const perYear = Array.from(yearMap.entries())
    .map(([year, totalNok]) => ({ year, totalNok }))
    .sort((a, b) => b.year - a.year)

  // Top schemes
  const schemeMap = new Map<string, { totalNok: number; count: number }>()
  for (const s of subsidies) {
    const key = s.scheme ?? s.subsidyType ?? 'Ukjent'
    const amt = s.amountNok != null ? Number(s.amountNok) : 0
    const existing = schemeMap.get(key) ?? { totalNok: 0, count: 0 }
    schemeMap.set(key, { totalNok: existing.totalNok + amt, count: existing.count + 1 })
  }
  const topSchemes = Array.from(schemeMap.entries())
    .map(([scheme, { totalNok, count }]) => ({ scheme, totalNok, count }))
    .sort((a, b) => b.totalNok - a.totalNok)
    .slice(0, 5)

  // Top recipients
  const recipientMap = new Map<string, number>()
  for (const s of subsidies) {
    if (!s.companyId) continue
    const amt = s.amountNok != null ? Number(s.amountNok) : 0
    recipientMap.set(s.companyId, (recipientMap.get(s.companyId) ?? 0) + amt)
  }

  const companyIds = Array.from(recipientMap.keys())
  const companies = companyIds.length > 0
    ? await prisma.company.findMany({
        where: { id: { in: companyIds } },
        select: { id: true, name: true },
      })
    : []
  const companyNameById = new Map(companies.map(c => [c.id, c.name]))

  const topRecipients = Array.from(recipientMap.entries())
    .map(([companyId, totalNok]) => ({
      companyId,
      companyName: companyNameById.get(companyId) ?? companyId,
      totalNok,
    }))
    .sort((a, b) => b.totalNok - a.totalNok)
    .slice(0, 5)

  const totalNok = subsidies.reduce((sum, s) => sum + (s.amountNok != null ? Number(s.amountNok) : 0), 0)

  return { perYear, topSchemes, topRecipients, totalNok, rowCount: subsidies.length, producerCount: producerIds.length }
}

// ─── Section 7: Eiendommer ────────────────────────────────────────────────────

export type KonsernProperties = {
  totalCount: number
  totalAreaSqm: number | null
  perMunicipality: Array<{
    municipality: string
    count: number
    areaSqm: number | null
    types: string[]
  }>
}

export async function getKonsernProperties(treeIds: string[]): Promise<KonsernProperties> {
  if (treeIds.length === 0) {
    return { totalCount: 0, totalAreaSqm: null, perMunicipality: [] }
  }

  const properties = await prisma.companyProperty.findMany({
    where: { companyId: { in: treeIds } },
    select: { municipality: true, propertyType: true, sqMeters: true },
  })

  if (properties.length === 0) {
    return { totalCount: 0, totalAreaSqm: null, perMunicipality: [] }
  }

  // Group by municipality (case-insensitive normalisation)
  const municipalityMap = new Map<string, { count: number; areaSqm: number | null; types: Set<string>; rawKey: string }>()
  for (const p of properties) {
    const rawKey = p.municipality?.trim() ?? 'Ukjent'
    const normKey = rawKey.toLowerCase()
    const existing = municipalityMap.get(normKey)
    if (existing) {
      existing.count += 1
      if (p.sqMeters != null) {
        existing.areaSqm = (existing.areaSqm ?? 0) + p.sqMeters
      }
      if (p.propertyType) existing.types.add(p.propertyType)
    } else {
      municipalityMap.set(normKey, {
        rawKey,
        count: 1,
        areaSqm: p.sqMeters != null ? p.sqMeters : null,
        types: new Set(p.propertyType ? [p.propertyType] : []),
      })
    }
  }

  const perMunicipality = Array.from(municipalityMap.values())
    .map(({ rawKey, count, areaSqm, types }) => ({
      municipality: rawKey,
      count,
      areaSqm,
      types: Array.from(types),
    }))
    .sort((a, b) => b.count - a.count)

  const totalAreaSqm = properties.reduce<number | null>((sum, p) => {
    if (p.sqMeters == null) return sum
    return (sum ?? 0) + p.sqMeters
  }, null)

  return { totalCount: properties.length, totalAreaSqm, perMunicipality }
}

// ─── Section 8: Forretningsrelasjoner ────────────────────────────────────────

export type KonsernRelationships = {
  outgoingExternal: Array<{
    counterpartyName: string
    counterpartyId: string | null
    relationshipType: string
    description: string | null
  }>
  incomingExternal: Array<{
    counterpartyName: string
    counterpartyId: string | null
    relationshipType: string
    description: string | null
  }>
  intraKonsern: Array<{
    fromCompanyName: string
    toCompanyName: string
    relationshipType: string
    description: string | null
  }>
}

export async function getKonsernRelationships(treeIds: string[]): Promise<KonsernRelationships> {
  if (treeIds.length === 0) {
    return { outgoingExternal: [], incomingExternal: [], intraKonsern: [] }
  }

  const treeIdSet = new Set(treeIds)

  const relationships = await prisma.businessRelationship.findMany({
    where: {
      OR: [
        { fromCompanyId: { in: treeIds } },
        { toCompanyId: { in: treeIds } },
      ],
    },
    include: {
      fromCompany: { select: { name: true } },
      toCompany: { select: { name: true } },
    },
  })

  const outgoingExternal: KonsernRelationships['outgoingExternal'] = []
  const incomingExternal: KonsernRelationships['incomingExternal'] = []
  const intraKonsern: KonsernRelationships['intraKonsern'] = []

  for (const rel of relationships) {
    const fromInTree = treeIdSet.has(rel.fromCompanyId)
    const toInTree = treeIdSet.has(rel.toCompanyId)

    if (fromInTree && toInTree) {
      intraKonsern.push({
        fromCompanyName: rel.fromCompany.name,
        toCompanyName: rel.toCompany.name,
        relationshipType: rel.relationshipType,
        description: rel.description,
      })
    } else if (fromInTree && !toInTree) {
      outgoingExternal.push({
        counterpartyName: rel.toCompany.name,
        counterpartyId: rel.toCompanyId,
        relationshipType: rel.relationshipType,
        description: rel.description,
      })
    } else if (!fromInTree && toInTree) {
      incomingExternal.push({
        counterpartyName: rel.fromCompany.name,
        counterpartyId: rel.fromCompanyId,
        relationshipType: rel.relationshipType,
        description: rel.description,
      })
    }
  }

  return { outgoingExternal, incomingExternal, intraKonsern }
}

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

  // Latest available record per company (newest year each has filed), not a
  // single fixed year — filings lag, so most are at last year while a few
  // already have current-year numbers.
  const latestByCompany = new Map<string, (typeof financials)[number]>()
  for (const f of [...financials].sort((a, b) => b.year - a.year)) {
    if (!latestByCompany.has(f.companyId)) latestByCompany.set(f.companyId, f)
  }

  // Top 5 by latest revenue
  const revenueByCompany = new Map<string, number>()
  for (const f of latestByCompany.values()) {
    const rev = financialAmountToNok(f.revenueNok, f.source)
    if (rev != null) {
      revenueByCompany.set(f.companyId, rev)
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

  // Companies without any recent financials
  const childrenWithoutLatestFinancial = treeIds
    .filter(id => !latestByCompany.has(id))
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
