import { prisma } from '@/lib/db'

export async function getTheses(opts?: { tag?: string }) {
  const { tag } = opts ?? {}
  const where = {
    ...(tag && { tags: { has: tag } }),
  }
  return prisma.thesis.findMany({
    where,
    orderBy: { year: 'desc' },
  })
}
