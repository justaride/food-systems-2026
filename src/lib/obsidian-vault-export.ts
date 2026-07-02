export type DbCompanyRow = {
  id: string
  name: string
  orgNr: string
  legalForm: string | null
  country: string
  ownershipType: string | null
  valueChainStage: string | null
  naceCode: string | null
  naceDescription: string | null
  isResearchConstruct: boolean
}

export type DbOwnershipRow = {
  id?: string
  parentCompanyId: string
  childCompanyId: string
  ownershipPct: unknown
  ownershipType?: string
  source?: string | null
}

export type DbBoardMemberRow = {
  id: string
  companyId: string
  personName: string
  personKey: string
  role: string
  source: string | null
  verificationStatus: string | null
}

export type DbBusinessRelationshipRow = {
  id: string
  fromCompanyId: string
  toCompanyId: string
  relationshipType: string
  description: string | null
  sector: string | null
  estimatedValue: unknown
  source: string | null
  verificationStatus: string | null
}

export type DbPropertyRow = {
  id: string
  companyId: string
  tenantCompanyId: string | null
  propertyType: string
  address: string | null
  municipality: string | null
  county: string | null
  country: string
  lat: number | null
  lng: number | null
  sqMeters: unknown
  selfLeased: boolean
  source: string | null
}

export type VaultExportInput = {
  generatedAt: string
  companies: DbCompanyRow[]
  ownershipEdges: DbOwnershipRow[]
  boardMembers: DbBoardMemberRow[]
  businessRelationships: DbBusinessRelationshipRow[]
  properties: DbPropertyRow[]
}

export type OwnershipForestNode = {
  id: string
  name: string
  orgNr: string
  ownershipPct: number | null
  children: OwnershipForestNode[]
}

export function toNumberOrNull(value: unknown): number | null {
  if (value == null) return null
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value === 'bigint') return Number(value)
  if (typeof value === 'object' && 'toString' in value) {
    const parsed = Number(String(value))
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

export function buildOwnershipForest(
  companies: Array<{ id: string; name: string; orgNr: string }>,
  edges: Array<{ parentCompanyId: string; childCompanyId: string; ownershipPct: unknown }>,
): OwnershipForestNode[] {
  const byId = new Map(companies.map((company) => [company.id, company]))
  const childrenByParent = new Map<string, typeof edges>()
  const childIds = new Set<string>()

  for (const edge of edges) {
    const siblings = childrenByParent.get(edge.parentCompanyId) ?? []
    siblings.push(edge)
    childrenByParent.set(edge.parentCompanyId, siblings)
    childIds.add(edge.childCompanyId)
  }

  const roots = companies
    .filter((company) => !childIds.has(company.id))
    .sort((a, b) => a.name.localeCompare(b.name, 'nb'))

  const build = (companyId: string, ownershipPct: number | null, seen: Set<string>): OwnershipForestNode | null => {
    const company = byId.get(companyId)
    if (!company || seen.has(companyId)) return null

    const nextSeen = new Set(seen)
    nextSeen.add(companyId)

    return {
      id: company.id,
      name: company.name,
      orgNr: company.orgNr,
      ownershipPct,
      children: (childrenByParent.get(companyId) ?? [])
        .map((edge) => build(edge.childCompanyId, toNumberOrNull(edge.ownershipPct), nextSeen))
        .filter((node): node is OwnershipForestNode => node != null)
        .sort((a, b) => a.name.localeCompare(b.name, 'nb')),
    }
  }

  return roots
    .map((company) => build(company.id, null, new Set()))
    .filter((node): node is OwnershipForestNode => node != null)
}

export function buildVaultExportSnapshot(input: VaultExportInput) {
  const companyById = new Map(input.companies.map((company) => [company.id, company]))
  const displayCompany = (id: string) => companyById.get(id)?.name ?? id

  const companies = [...input.companies]
    .sort((a, b) => a.orgNr.localeCompare(b.orgNr, 'nb'))
    .map((company) => ({
      id: company.id,
      name: company.name,
      orgNr: company.orgNr,
      legalForm: company.legalForm,
      country: company.country,
      valueChainStage: company.valueChainStage,
      classification: company.ownershipType ?? company.legalForm ?? 'ukjent',
      naceCode: company.naceCode,
      naceDescription: company.naceDescription,
      isResearchConstruct: company.isResearchConstruct,
    }))

  const ownershipEdges = [...input.ownershipEdges]
    .sort((a, b) => displayCompany(a.parentCompanyId).localeCompare(displayCompany(b.parentCompanyId), 'nb'))
    .map((edge) => ({
      id: edge.id ?? `${edge.parentCompanyId}:${edge.childCompanyId}`,
      parentCompanyId: edge.parentCompanyId,
      parentName: displayCompany(edge.parentCompanyId),
      childCompanyId: edge.childCompanyId,
      childName: displayCompany(edge.childCompanyId),
      ownershipPct: toNumberOrNull(edge.ownershipPct),
      ownershipType: edge.ownershipType ?? null,
      source: edge.source ?? null,
    }))

  const boardMembers = [...input.boardMembers]
    .sort((a, b) => a.personName.localeCompare(b.personName, 'nb'))
    .map((member) => ({
      ...member,
      companyName: displayCompany(member.companyId),
    }))

  const businessRelationships = [...input.businessRelationships]
    .sort((a, b) => displayCompany(a.fromCompanyId).localeCompare(displayCompany(b.fromCompanyId), 'nb'))
    .map((relationship) => ({
      ...relationship,
      fromCompanyName: displayCompany(relationship.fromCompanyId),
      toCompanyName: displayCompany(relationship.toCompanyId),
      estimatedValue: toNumberOrNull(relationship.estimatedValue),
    }))

  const properties = [...input.properties]
    .sort((a, b) => displayCompany(a.companyId).localeCompare(displayCompany(b.companyId), 'nb'))
    .map((property) => ({
      ...property,
      companyName: displayCompany(property.companyId),
      tenantCompanyName: property.tenantCompanyId ? displayCompany(property.tenantCompanyId) : null,
      sqMeters: toNumberOrNull(property.sqMeters),
    }))

  return {
    manifest: {
      generatedAt: input.generatedAt,
      source: 'scripts/obsidian-vault/export-db.ts',
      counts: {
        companies: companies.length,
        ownershipEdges: ownershipEdges.length,
        boardMembers: boardMembers.length,
        businessRelationships: businessRelationships.length,
        properties: properties.length,
      },
    },
    companies,
    ownershipEdges,
    boardMembers,
    businessRelationships,
    properties,
    ownershipForest: buildOwnershipForest(companies, ownershipEdges),
  }
}
