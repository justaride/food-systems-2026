import { prisma } from '@/lib/db'

export async function getResearchPrompts(opts?: { category?: string }) {
  const { category } = opts ?? {}
  const where = {
    ...(category && { category }),
  }
  return prisma.researchPrompt.findMany({
    where,
    orderBy: { id: 'asc' },
  })
}
