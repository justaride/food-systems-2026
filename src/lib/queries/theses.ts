import { isQuarantinedSource } from '@/lib/source-quarantine'
import { prisma } from '@/lib/db'

export async function getTheses(opts?: { tag?: string }) {
  const { tag } = opts ?? {}
  const where = {
    ...(tag && { tags: { has: tag } }),
  }
  const records = await prisma.thesis.findMany({
    where,
    orderBy: { year: 'desc' },
  })
  return records.filter(record => !isQuarantinedSource(record))
}
