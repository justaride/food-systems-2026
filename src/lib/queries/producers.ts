import { prisma } from '@/lib/db'
import { isPrismaDataUnavailable } from './prisma-errors'

export type ProducerListRow = {
  id: string
  orgNr: string
  name: string
  country: string
  municipality: string | null
  subsidyCount: number
  deliveryCount: number
}

export async function getProducerCount(): Promise<number> {
  try {
    return await prisma.producer.count()
  } catch (error) {
    if (isPrismaDataUnavailable(error)) return 0
    throw error
  }
}

export async function getProducers(opts?: { take?: number; skip?: number; search?: string }): Promise<ProducerListRow[]> {
  const { take = 100, skip = 0, search } = opts ?? {}
  try {
    const rows = await prisma.producer.findMany({
      where: search
        ? { OR: [{ name: { contains: search, mode: 'insensitive' } }, { orgNr: { contains: search } }] }
        : undefined,
      orderBy: { name: 'asc' },
      take,
      skip,
      include: { _count: { select: { subsidies: true, deliveries: true } } },
    })
    return rows.map(r => ({
      id: r.id, orgNr: r.orgNr, name: r.name, country: r.country, municipality: r.municipality,
      subsidyCount: r._count.subsidies, deliveryCount: r._count.deliveries,
    }))
  } catch (error) {
    if (isPrismaDataUnavailable(error)) return []
    throw error
  }
}
