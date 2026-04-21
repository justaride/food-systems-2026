import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const sites = await prisma.aquacultureSite.findMany({
    where: { lat: { not: null }, lng: { not: null } },
    include: {
      company: { select: { id: true, name: true, orgNr: true } },
    },
  })

  const result = sites.map(s => {
    const placement = (s.placement ?? '').toLowerCase()
    const water = (s.waterType ?? '').toLowerCase()
    const speciesLower = s.species.map(x => x.toLowerCase())
    let productionType: 'matfisk' | 'settefisk' | 'stamfisk' | 'shellfish' | 'seaweed' | 'other' = 'matfisk'
    if (speciesLower.some(v => v.includes('skjell') || v.includes('skalldyr'))) {
      productionType = 'shellfish'
    } else if (speciesLower.some(v => v.includes('tang') || v.includes('tare'))) {
      productionType = 'seaweed'
    } else if (water.includes('fresh') || placement.includes('land')) {
      productionType = 'settefisk'
    }
    const mappedPlacement: 'sea' | 'land' = placement.includes('land') ? 'land' : 'sea'
    return {
      id: Number(s.localityNumber) || 0,
      name: s.siteName ?? `Lokalitet ${s.localityNumber}`,
      status: s.licenseStatus ?? 'aktiv',
      capacity: s.capacityTonnes ? Number(s.capacityTonnes) : 0,
      capacityUnit: s.capacityUnit ?? 'MTB',
      placement: mappedPlacement,
      waterType: s.waterType ?? 'saltvann',
      county: s.county ?? '',
      municipality: s.municipality ?? '',
      species: s.species,
      productionType,
      coordinates: [s.lng!, s.lat!] as [number, number],
      // extra DB fields exposed for richer UI
      companyId: s.company.id,
      companyName: s.company.name,
      orgNr: s.company.orgNr,
    }
  })

  return NextResponse.json(result)
}
