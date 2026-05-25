import type { Metadata } from 'next'
import { getCompanyProperties } from '@/lib/queries/properties'
import { getPropertyCompaniesWithLinks } from '@/lib/queries/property-companies'
import { getKonsernTreeIds } from '@/lib/queries/ownership'
import { KONSERN_REGISTRY, orgNrForSlug } from '@/lib/queries/ownership'
import { EiendommerContent } from './EiendommerContent'

export const metadata: Metadata = {
  title: 'Eiendommer — Food Systems 2026',
  description: 'Selskapseiendommer, lokaler og leieforhold',
}

export default async function EiendommerPage({
  searchParams,
}: {
  searchParams: Promise<{ konsern?: string }>
}) {
  const params = await searchParams
  const konsernSlug = params.konsern ?? null

  const [properties, propertyCompanies] = await Promise.all([
    getCompanyProperties(),
    getPropertyCompaniesWithLinks(),
  ])

  // Resolve konsern filter if a slug was provided
  let konsernFilter: { slug: string; name: string; treeIds: Set<string> } | null = null
  let konsernNotFound = false
  if (konsernSlug) {
    const treeIds = await getKonsernTreeIds(konsernSlug)
    if (treeIds === null) {
      konsernNotFound = true
    } else {
      const orgNr = orgNrForSlug(konsernSlug)!
      // Find a display name from the properties or fall back to the slug
      const treeIdSet = new Set(treeIds)
      const matchedProperty = properties.find(p => treeIdSet.has(p.company.id))
      // Derive name from KONSERN_REGISTRY slug (capitalize slug segments)
      const displayName = matchedProperty?.company.name
        ?? KONSERN_REGISTRY[orgNr]?.slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
        ?? konsernSlug
      konsernFilter = { slug: konsernSlug, name: displayName, treeIds: treeIdSet }
    }
  }

  const allRows = properties.map(p => ({
    id: p.id,
    propertyType: p.propertyType,
    address: p.address,
    municipality: p.municipality,
    county: p.county,
    country: p.country,
    sqMeters: p.sqMeters,
    selfLeased: p.selfLeased,
    acquiredYear: p.acquiredYear,
    source: p.source,
    company: {
      id: p.company.id,
      name: p.company.name,
    },
    tenantCompany: p.tenantCompany
      ? { id: p.tenantCompany.id, name: p.tenantCompany.name }
      : null,
  }))

  const rows = konsernFilter
    ? allRows.filter(r => konsernFilter!.treeIds.has(r.company.id))
    : allRows

  return (
    <EiendommerContent
      properties={rows}
      propertyCompanies={propertyCompanies}
      konsernFilter={konsernFilter ? { slug: konsernFilter.slug, name: konsernFilter.name } : null}
      konsernNotFound={konsernNotFound}
    />
  )
}
