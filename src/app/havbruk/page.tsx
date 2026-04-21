import type { Metadata } from 'next'
import {
  getAquacultureSites,
  getAquacultureApplications,
  getAquacultureStats,
} from '@/lib/queries/aquaculture'
import { HavbrukContent } from './HavbrukContent'

export const metadata: Metadata = {
  title: 'Havbruk — Food Systems 2026',
  description: 'Havbrukslokaliteter og konsesjonssøknader fra Fiskeridirektoratet',
}

export default async function HavbrukPage() {
  const [sites, applications, stats] = await Promise.all([
    getAquacultureSites(),
    getAquacultureApplications(),
    getAquacultureStats(),
  ])

  const siteRows = sites.map(s => ({
    id: s.id,
    localityNumber: s.localityNumber,
    siteName: s.siteName,
    municipality: s.municipality,
    municipalityNo: s.municipalityNo,
    county: s.county,
    lat: s.lat,
    lng: s.lng,
    licenseStatus: s.licenseStatus,
    placement: s.placement,
    capacityTonnes: s.capacityTonnes ? Number(s.capacityTonnes) : null,
    species: s.species,
    company: s.company,
  }))

  const appRows = applications.map(a => ({
    id: a.id,
    applicationNo: a.applicationNo,
    applicantName: a.applicantName,
    applicantOrgNr: a.applicantOrgNr,
    applicationType: a.applicationType,
    title: a.title,
    status: a.status,
    result: a.result,
    createdAt: a.createdAt ? a.createdAt.toISOString() : null,
    evaluationFinishedAt: a.evaluationFinishedAt
      ? a.evaluationFinishedAt.toISOString()
      : null,
    company: a.company,
  }))

  const companyStats = stats.byCompany
    .map(b => ({
      companyId: b.companyId,
      siteCount: b._count,
      capacityTonnes: b._sum.capacityTonnes ? Number(b._sum.capacityTonnes) : 0,
    }))
    .sort((a, b) => b.capacityTonnes - a.capacityTonnes)

  return (
    <HavbrukContent
      sites={siteRows}
      applications={appRows}
      totalSites={stats.totalSites}
      totalCapacityTonnes={stats.totalCapacityTonnes}
      totalApplications={stats.totalApplications}
      companyStats={companyStats}
    />
  )
}
