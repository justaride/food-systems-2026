import { prisma } from '@/lib/db'

export async function getCommunications(opts?: { type?: string }) {
  const { type } = opts ?? {}
  const where = {
    ...(type && { commType: type }),
  }
  return prisma.communication.findMany({
    where,
    orderBy: { date: 'desc' },
  })
}
