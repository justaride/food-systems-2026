import { prisma } from '@/lib/db'

export async function getSources(opts?: {
  type?: string
  excludeDuplicates?: boolean
}) {
  const { type, excludeDuplicates = true } = opts ?? {}
  const where = {
    ...(type && { sourceType: type }),
    ...(excludeDuplicates && { isDuplicate: false }),
  }
  return prisma.sourceDoc.findMany({
    where,
    include: {
      document: { select: { id: true, slug: true, title: true } },
    },
    orderBy: { id: 'asc' },
  })
}
