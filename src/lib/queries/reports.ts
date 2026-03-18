import { prisma } from '@/lib/db'

export async function getReports(opts?: { category?: string; country?: string; tag?: string }) {
  const { category, country, tag } = opts ?? {}
  const where = {
    ...(category && { reportCategory: category }),
    ...(country && { country }),
    ...(tag && { tags: { has: tag } }),
  }
  return prisma.report.findMany({
    where,
    orderBy: [{ year: 'desc' }, { title: 'asc' }],
  })
}
