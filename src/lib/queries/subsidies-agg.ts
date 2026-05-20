import { prisma } from '@/lib/db'
import municipalitiesJson from '../../../public/data/food-systems/no/municipalities.json'

type MunicipalityMeta = {
  code: string
  name: string
  population: number
  area: number
}

const municipalities = municipalitiesJson as unknown as Record<string, MunicipalityMeta | undefined>

function asMetadataRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as Record<string, unknown>
}

function metadataString(meta: Record<string, unknown> | null, key: string): string | null {
  const value = meta?.[key]
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export async function getSubsidiesByKommune(subsidyType = 'produksjonstilskudd') {
  const rows = await prisma.subsidy.groupBy({
    by: ['kommuneNr', 'producerId'],
    where: { subsidyType, kommuneNr: { not: null }, producerId: { not: null } },
    _sum: { amountNok: true },
    _count: true,
  })

  const byKommune = new Map<string, { totalNok: number; recipientCount: number; rowCount: number }>()

  for (const row of rows) {
    if (!row.kommuneNr) continue
    const current = byKommune.get(row.kommuneNr) ?? { totalNok: 0, recipientCount: 0, rowCount: 0 }
    current.totalNok += Number(row._sum.amountNok ?? 0)
    current.recipientCount += 1
    current.rowCount += row._count
    byKommune.set(row.kommuneNr, current)
  }

  return Array.from(byKommune.entries())
    .map(([kommuneNr, row]) => {
      const meta = municipalities[kommuneNr]
      const population = meta?.population ?? null
      const areaKm2 = meta?.area ?? null

      return {
        kommuneNr,
        kommuneName: meta?.name ?? null,
        recipientCount: row.recipientCount,
        rowCount: row.rowCount,
        totalNok: row.totalNok,
        population,
        areaKm2,
        nokPerRecipient: row.recipientCount > 0 ? row.totalNok / row.recipientCount : null,
        nokPerInhabitant: population && population > 0 ? row.totalNok / population : null,
        nokPerKm2: areaKm2 && areaKm2 > 0 ? row.totalNok / areaKm2 : null,
      }
    })
    .filter(r => r.totalNok > 0)
    .sort((a, b) => b.totalNok - a.totalNok)
}

export type KommuneSubsidyRow = Awaited<ReturnType<typeof getSubsidiesByKommune>>[number]

export async function getSubsidiesByScheme(subsidyType = 'produksjonstilskudd') {
  const rows = await prisma.subsidy.groupBy({
    by: ['scheme'],
    where: { subsidyType, scheme: { not: null } },
    _sum: { amountNok: true },
    _count: true,
  })

  return rows
    .map(r => ({
      scheme: r.scheme!,
      recipientCount: r._count,
      totalNok: Number(r._sum.amountNok ?? 0),
    }))
    .sort((a, b) => b.totalNok - a.totalNok)
}

export type SchemeRow = Awaited<ReturnType<typeof getSubsidiesByScheme>>[number]

export async function getSubsidiesBySchemeAndStage(subsidyType = 'produksjonstilskudd') {
  // All producer-subsidy recipients are a single stage ('produsent').
  // We group by scheme and sum across all producers per scheme.
  const rows = await prisma.subsidy.groupBy({
    by: ['scheme', 'producerId'],
    where: { subsidyType, scheme: { not: null }, producerId: { not: null } },
    _sum: { amountNok: true },
    _count: true,
  })

  const STAGE = 'produsent'

  const cells = new Map<string, {
    scheme: string
    stage: string
    totalNok: number
    recipientCount: number
    rowCount: number
  }>()
  const schemeTotals = new Map<string, number>()

  for (const row of rows) {
    if (!row.scheme) continue
    const totalNok = Number(row._sum.amountNok ?? 0)
    const key = `${row.scheme}::${STAGE}`
    const cell = cells.get(key) ?? {
      scheme: row.scheme,
      stage: STAGE,
      totalNok: 0,
      recipientCount: 0,
      rowCount: 0,
    }
    cell.totalNok += totalNok
    cell.recipientCount += 1
    cell.rowCount += row._count
    cells.set(key, cell)
    schemeTotals.set(row.scheme, (schemeTotals.get(row.scheme) ?? 0) + totalNok)
  }

  const schemes = Array.from(schemeTotals.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([scheme]) => scheme)

  return {
    schemes,
    stages: [STAGE],
    cells: Array.from(cells.values()).sort((a, b) => b.totalNok - a.totalNok),
    maxNok: Math.max(0, ...Array.from(cells.values()).map(cell => cell.totalNok)),
  }
}

export type SchemeStageHeatmap = Awaited<ReturnType<typeof getSubsidiesBySchemeAndStage>>

export async function getSubsidyStageCoverage(subsidyType = 'produksjonstilskudd') {
  // All producer-subsidy recipients are a single stage ('produsent').
  const rows = await prisma.subsidy.groupBy({
    by: ['producerId'],
    where: { subsidyType, producerId: { not: null } },
    _sum: { amountNok: true },
    _count: true,
  })

  const STAGE = 'produsent'
  const totalNok = rows.reduce((sum, row) => sum + Number(row._sum.amountNok ?? 0), 0)
  const totalRows = rows.reduce((sum, row) => sum + row._count, 0)

  const stageRows = [
    {
      stage: STAGE,
      recipientCount: rows.length,
      rowCount: totalRows,
      totalNok,
    },
  ]

  return {
    subsidyType,
    totalRecipients: rows.length,
    totalRows,
    totalNok,
    stages: stageRows,
  }
}

export type SubsidyStageCoverage = Awaited<ReturnType<typeof getSubsidyStageCoverage>>

export async function getTopSubsidyRecipients(
  subsidyType = 'produksjonstilskudd',
  limit = 50
) {
  const rows = await prisma.subsidy.groupBy({
    by: ['producerId'],
    where: { subsidyType, producerId: { not: null } },
    _sum: { amountNok: true },
    _count: true,
    orderBy: { _sum: { amountNok: 'desc' } },
    take: limit,
  })

  const producerIds = rows.map(r => r.producerId).filter((x): x is string => x !== null)

  const producers = producerIds.length
    ? await prisma.producer.findMany({
        where: { id: { in: producerIds } },
        select: {
          id: true,
          name: true,
          orgNr: true,
          municipality: true,
          metadata: true,
          _count: {
            select: {
              subsidies: true,
              deliveries: true,
            },
          },
        },
      })
    : []
  const byId = new Map(producers.map(p => [p.id, p]))

  const deliveryRows = await prisma.deliveryVolume.findMany({
    where: { supplierProducerId: { in: producerIds } },
    select: {
      supplierProducerId: true,
      commodity: true,
    },
  })
  const deliveryByProducer = new Map<string, { rowCount: number; commodities: Set<string> }>()
  for (const delivery of deliveryRows) {
    if (!delivery.supplierProducerId) continue
    const current = deliveryByProducer.get(delivery.supplierProducerId) ?? {
      rowCount: 0,
      commodities: new Set<string>(),
    }
    current.rowCount += 1
    current.commodities.add(delivery.commodity)
    deliveryByProducer.set(delivery.supplierProducerId, current)
  }

  return rows.map(r => {
    const id = r.producerId ?? ''
    const p = byId.get(id)
    const meta = asMetadataRecord(p?.metadata)
    const kommuneNr = metadataString(meta, 'kommuneNr') ?? metadataString(meta, 'komnr')
    const matrikkel = metadataString(meta, 'matrikkel')
    const parentOrgNr = metadataString(meta, 'parentOrgNr')
    const source = metadataString(meta, 'source')
    const delivery = deliveryByProducer.get(id)

    return {
      producerId: id,
      name: p?.name ?? 'Ukjent',
      orgNr: p?.orgNr ?? '',
      municipality: p?.municipality ?? null,
      kommuneNr,
      landbruksregisterSource: source === 'Landbruksregisteret',
      matrikkel,
      parentOrgNr,
      hasCoordinates: meta?.coords != null,
      deliveryRowCount: delivery?.rowCount ?? 0,
      deliveryCommodityCount: delivery?.commodities.size ?? 0,
      subsidyCount: p?._count.subsidies ?? 0,
      schemeCount: r._count,
      totalNok: Number(r._sum.amountNok ?? 0),
    }
  })
}

export type TopRecipientRow = Awaited<ReturnType<typeof getTopSubsidyRecipients>>[number]

export type SubsidyDistributionPoint = {
  populationPct: number
  amountPct: number
}

export type SubsidyDistribution = {
  subsidyType: string
  recipientCount: number
  totalNok: number
  meanNok: number
  medianNok: number
  gini: number
  top1Count: number
  top1Nok: number
  top1Pct: number
  top10Count: number
  top10Nok: number
  top10Pct: number
  lorenz: SubsidyDistributionPoint[]
}

function sum(values: number[]): number {
  return values.reduce((acc, value) => acc + value, 0)
}

function median(sortedAsc: number[]): number {
  if (sortedAsc.length === 0) return 0
  const mid = Math.floor(sortedAsc.length / 2)
  if (sortedAsc.length % 2 === 1) return sortedAsc[mid]
  return (sortedAsc[mid - 1] + sortedAsc[mid]) / 2
}

function giniCoefficient(sortedAsc: number[], total: number): number {
  const n = sortedAsc.length
  if (n === 0 || total <= 0) return 0

  const weighted = sortedAsc.reduce((acc, value, index) => acc + (index + 1) * value, 0)
  return (2 * weighted) / (n * total) - (n + 1) / n
}

function lorenzPoints(sortedAsc: number[], total: number): SubsidyDistributionPoint[] {
  if (sortedAsc.length === 0 || total <= 0) {
    return [{ populationPct: 0, amountPct: 0 }]
  }

  const prefix: number[] = [0]
  for (const value of sortedAsc) prefix.push(prefix[prefix.length - 1] + value)

  const points: SubsidyDistributionPoint[] = [{ populationPct: 0, amountPct: 0 }]
  for (let bucket = 1; bucket <= 20; bucket++) {
    const cutoff = Math.min(sortedAsc.length, Math.round((bucket / 20) * sortedAsc.length))
    points.push({
      populationPct: bucket * 5,
      amountPct: (prefix[cutoff] / total) * 100,
    })
  }
  return points
}

export async function getSubsidyDistribution(
  subsidyType = 'produksjonstilskudd'
): Promise<SubsidyDistribution> {
  const rows = await prisma.subsidy.groupBy({
    by: ['producerId'],
    where: { subsidyType, producerId: { not: null } },
    _sum: { amountNok: true },
    orderBy: { _sum: { amountNok: 'desc' } },
  })

  const amountsDesc = rows
    .map(r => Number(r._sum.amountNok ?? 0))
    .filter(amount => amount > 0)
  const amountsAsc = [...amountsDesc].sort((a, b) => a - b)
  const totalNok = sum(amountsDesc)
  const recipientCount = amountsDesc.length
  const top1Count = recipientCount > 0 ? Math.max(1, Math.ceil(recipientCount * 0.01)) : 0
  const top10Count = recipientCount > 0 ? Math.max(1, Math.ceil(recipientCount * 0.10)) : 0
  const top1Nok = sum(amountsDesc.slice(0, top1Count))
  const top10Nok = sum(amountsDesc.slice(0, top10Count))

  return {
    subsidyType,
    recipientCount,
    totalNok,
    meanNok: recipientCount > 0 ? totalNok / recipientCount : 0,
    medianNok: median(amountsAsc),
    gini: giniCoefficient(amountsAsc, totalNok),
    top1Count,
    top1Nok,
    top1Pct: totalNok > 0 ? (top1Nok / totalNok) * 100 : 0,
    top10Count,
    top10Nok,
    top10Pct: totalNok > 0 ? (top10Nok / totalNok) * 100 : 0,
    lorenz: lorenzPoints(amountsAsc, totalNok),
  }
}

export async function getSubsidyTotals() {
  const [total, byType] = await Promise.all([
    prisma.subsidy.aggregate({ _sum: { amountNok: true }, _count: true }),
    prisma.subsidy.groupBy({
      by: ['subsidyType'],
      _sum: { amountNok: true },
      _count: true,
    }),
  ])
  return {
    totalNok: Number(total._sum.amountNok ?? 0),
    totalRows: total._count,
    byType: byType.map(b => ({
      subsidyType: b.subsidyType,
      totalNok: Number(b._sum.amountNok ?? 0),
      count: b._count,
    })),
  }
}
