import { prisma } from '@/lib/db'

export async function getPropertiesGeoJSON() {
  const properties = await prisma.companyProperty.findMany({
    where: { lat: { not: null }, lng: { not: null } },
    include: {
      company: { select: { name: true, id: true } },
      tenantCompany: { select: { name: true } },
    },
  })

  return {
    type: 'FeatureCollection' as const,
    features: properties.map(p => ({
      type: 'Feature' as const,
      geometry: {
        type: 'Point' as const,
        coordinates: [p.lng!, p.lat!],
      },
      properties: {
        id: p.id,
        companyId: p.company.id,
        companyName: p.company.name,
        propertyType: p.propertyType,
        address: p.address,
        municipality: p.municipality,
        sqMeters: p.sqMeters,
        selfLeased: p.selfLeased,
        tenantName: p.tenantCompany?.name ?? null,
      },
    })),
  }
}
