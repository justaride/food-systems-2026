import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import version from '@/generated/version.json'

export const dynamic = 'force-dynamic'
export const revalidate = 0

type PageStatus = { ok: boolean; minRequired: number; actual: number }

export async function GET() {
  const [
    subsidiesAll,
    subsidiesProduksjon,
    aquacultureSites,
    aquacultureApplications,
    fishHealthObservations,
    deliveryVolumes,
    businessRelationships,
    landbruksregisterCompanies,
  ] = await Promise.all([
    prisma.subsidy.count(),
    prisma.subsidy.count({ where: { subsidyType: 'produksjonstilskudd' } }),
    prisma.aquacultureSite.count(),
    prisma.aquacultureApplication.count(),
    prisma.fishHealthObservation.count(),
    prisma.deliveryVolume.count(),
    prisma.businessRelationship.count(),
    prisma.company.count({
      where: { metadata: { path: ['source'], equals: 'Landbruksregisteret' } },
    }),
  ])

  const pages: Record<string, PageStatus> = {
    subsidier: {
      ok: subsidiesProduksjon >= 100,
      minRequired: 100,
      actual: subsidiesProduksjon,
    },
    havbruk: {
      ok: aquacultureSites >= 100,
      minRequired: 100,
      actual: aquacultureSites,
    },
    forsyningskjede: {
      ok: deliveryVolumes >= 1,
      minRequired: 1,
      actual: deliveryVolumes,
    },
  }

  const allOk = Object.values(pages).every(p => p.ok)

  return NextResponse.json(
    {
      ok: allOk,
      checkedAt: new Date().toISOString(),
      version,
      tables: {
        subsidiesAll,
        subsidiesProduksjon,
        aquacultureSites,
        aquacultureApplications,
        fishHealthObservations,
        deliveryVolumes,
        businessRelationships,
        landbruksregisterCompanies,
      },
      pages,
    },
    { status: allOk ? 200 : 503 }
  )
}
