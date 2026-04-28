import type { Metadata } from 'next'
import { getCompanyProperties } from '@/lib/queries/properties'
import { getPropertyCompaniesWithLinks } from '@/lib/queries/property-companies'
import { EiendommerContent } from './EiendommerContent'

export const metadata: Metadata = {
  title: 'Eiendommer — Food Systems 2026',
  description: 'Selskapseiendommer, lokaler og leieforhold',
}

export default async function EiendommerPage() {
  const [properties, propertyCompanies] = await Promise.all([
    getCompanyProperties(),
    getPropertyCompaniesWithLinks(),
  ])

  const rows = properties.map(p => ({
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

  return <EiendommerContent properties={rows} propertyCompanies={propertyCompanies} />
}
