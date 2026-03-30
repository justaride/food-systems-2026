import { prisma } from '@/lib/db'
import { communications as fallbackCommunications } from '@/lib/data/communications'
import { isPrismaDataUnavailable } from './prisma-errors'

export async function getCommunications(opts?: { type?: string }) {
  const { type } = opts ?? {}
  const where = {
    ...(type && { commType: type }),
  }
  try {
    return await prisma.communication.findMany({
      where,
      orderBy: { date: 'desc' },
    })
  } catch (error) {
    if (!isPrismaDataUnavailable(error)) throw error
    console.warn('[communications-query] Falling back to static communication data', error)
    return fallbackCommunications
      .filter(item => !type || item.type === type)
      .map(item => ({
        id: item.id,
        title: item.title,
        summary: item.summary,
        commType: item.type,
        sender: item.from,
        recipients: Array.isArray(item.to) ? item.to : [item.to],
        date: item.date,
        tags: item.tags ?? [],
      }))
  }
}
