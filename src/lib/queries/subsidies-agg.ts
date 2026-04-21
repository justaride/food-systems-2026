import { prisma } from '@/lib/db'

export async function getSubsidiesByKommune(subsidyType = 'produksjonstilskudd') {
  const rows = await prisma.subsidy.groupBy({
    by: ['kommuneNr'],
    where: { subsidyType, kommuneNr: { not: null } },
    _sum: { amountNok: true },
    _count: true,
  })

  return rows
    .map(r => ({
      kommuneNr: r.kommuneNr!,
      recipientCount: r._count,
      totalNok: Number(r._sum.amountNok ?? 0),
    }))
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

export async function getTopSubsidyRecipients(
  subsidyType = 'produksjonstilskudd',
  limit = 50
) {
  const rows = await prisma.subsidy.groupBy({
    by: ['companyId'],
    where: { subsidyType },
    _sum: { amountNok: true },
    _count: true,
    orderBy: { _sum: { amountNok: 'desc' } },
    take: limit,
  })

  const companies = await prisma.company.findMany({
    where: { id: { in: rows.map(r => r.companyId) } },
    select: { id: true, name: true, orgNr: true, metadata: true, valueChainStage: true },
  })
  const byId = new Map(companies.map(c => [c.id, c]))

  return rows.map(r => {
    const c = byId.get(r.companyId)
    const meta = (c?.metadata as Record<string, unknown> | null | undefined) ?? null
    const kommuneNr = meta && typeof meta === 'object' ? (meta['kommuneNr'] as string | undefined) ?? (meta['komnr'] as string | undefined) ?? null : null
    return {
      companyId: r.companyId,
      name: c?.name ?? 'Ukjent',
      orgNr: c?.orgNr ?? '',
      valueChainStage: c?.valueChainStage ?? null,
      kommuneNr,
      schemeCount: r._count,
      totalNok: Number(r._sum.amountNok ?? 0),
    }
  })
}

export type TopRecipientRow = Awaited<ReturnType<typeof getTopSubsidyRecipients>>[number]

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
