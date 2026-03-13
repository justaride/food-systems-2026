import { prisma } from '@/lib/db'

export async function getInsights(opts?: {
  type?: string
  phaseId?: string
  tag?: string
  limit?: number
}) {
  const { type, phaseId, tag, limit } = opts ?? {}
  const where = {
    ...(type && { insightType: type }),
    ...(phaseId && { phaseId }),
    ...(tag && { tags: { has: tag } }),
  }
  return prisma.insight.findMany({
    where,
    include: {
      sourceRefs: { select: { id: true, label: true, url: true, note: true, sourceDocId: true } },
    },
    orderBy: { date: 'desc' },
    ...(limit && { take: limit }),
  })
}
