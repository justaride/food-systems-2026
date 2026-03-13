import { prisma } from '@/lib/db'

export async function getMeetings() {
  return prisma.meeting.findMany({
    include: {
      sourceRefs: { select: { id: true, label: true, url: true, note: true } },
    },
    orderBy: { id: 'asc' },
  })
}
