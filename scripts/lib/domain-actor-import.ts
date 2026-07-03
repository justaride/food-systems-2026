export type DomainActorCsvRow = {
  node_id: string
  name: string
  node_type: string
  domain: string
  subdomain: string
  country: string
  description: string
  key_people: string
  scale_metric_year: string
  org_nr: string
  locator_url: string
  sourceClass: string
  verificationStatus: string
  confidence: string
  accessedAt: string
  notes: string
}

export type CompanyLink = {
  id: string
  orgNr: string | null
  name: string
}

export type ExistingActorLink = {
  id: string
  slug: string
  themeTags: string[]
  name?: string
  country?: string
  companyId?: string | null
}

const ACTOR_TYPE_BY_NODE_TYPE: Record<string, string> = {
  organisasjon: 'organization',
  nettverk: 'network',
  gaard: 'farm',
  institusjon: 'institution',
  prosjekt: 'project',
  ordning: 'public-scheme',
}

export function normalizeOrgNr(value: string): string {
  return value.replace(/\D/g, '')
}

export function mapActorType(nodeType: string): string {
  return ACTOR_TYPE_BY_NODE_TYPE[nodeType] ?? 'organization'
}

export function websiteFrom(locator: string): string | null {
  if (!locator) return null
  try {
    const host = new URL(locator).hostname
    // Brreg-API-lokatorer er kildehenvisning, ikke aktørens hjemmeside.
    if (host === 'data.brreg.no') return null
    return locator
  } catch {
    return null
  }
}

export function parseAccessedAt(value: string): Date | null {
  if (!value) return null
  const d = new Date(`${value}T00:00:00Z`)
  return Number.isNaN(d.getTime()) ? null : d
}

export function nodeMetadata(
  row: DomainActorCsvRow,
  datasetTag: string,
): Record<string, unknown> {
  const orgNr = normalizeOrgNr(row.org_nr)
  return {
    dataset: datasetTag,
    nodeType: row.node_type,
    domain: row.domain,
    subdomain: row.subdomain ?? null,
    geo: row.country || 'NO',
    sourceClass: row.sourceClass || null,
    verificationStatus: row.verificationStatus || null,
    confidence: row.confidence || null,
    locatorUrl: row.locator_url || null,
    accessedAt: row.accessedAt || null,
    orgNr: orgNr || null,
    keyPeople: row.key_people || null,
    scaleMetricYear: row.scale_metric_year || null,
  }
}

export function buildThemeTags(row: DomainActorCsvRow, datasetTag: string): string[] {
  return [
    'domene:' + row.domain,
    row.subdomain ? 'subdomene:' + row.subdomain : null,
    datasetTag,
  ].filter(Boolean) as string[]
}

export function buildActorImportData(
  row: DomainActorCsvRow,
  options: { datasetTag: string; company?: CompanyLink | null },
) {
  return {
    slug: row.node_id,
    name: row.name,
    actorType: mapActorType(row.node_type),
    country: row.country || 'NO',
    roleSummary: row.description || row.name,
    website: websiteFrom(row.locator_url),
    themeTags: buildThemeTags(row, options.datasetTag),
    notes: row.notes || null,
    verificationStatus: row.verificationStatus || null,
    lastVerifiedAt: parseAccessedAt(row.accessedAt),
    metadata: nodeMetadata(row, options.datasetTag),
    companyId: options.company?.id ?? null,
  }
}

export function chooseActorTarget(
  row: DomainActorCsvRow,
  lookups: {
    existingBySlug: Map<string, ExistingActorLink>
    companyByOrgNr: Map<string, CompanyLink>
    existingByCompanyId: Map<string, ExistingActorLink>
    existingByCountryName?: Map<string, ExistingActorLink>
  },
): ExistingActorLink | null {
  const orgNr = normalizeOrgNr(row.org_nr)
  const company = orgNr ? lookups.companyByOrgNr.get(orgNr) : null
  if (company) {
    const actorForCompany = lookups.existingByCompanyId.get(company.id)
      if (actorForCompany) return actorForCompany
  }
  const actorForSlug = lookups.existingBySlug.get(row.node_id)
  if (actorForSlug) return actorForSlug
  const countryNameKey = `${row.country || 'NO'}\x00${row.name}`
  return lookups.existingByCountryName?.get(countryNameKey) ?? null
}
