import { prisma } from '@/lib/db'
import type { ResearchPromptStatus } from '@/lib/types'

const DEFAULT_VISIBLE_STATUSES: ResearchPromptStatus[] = ['aktiv', 'delvis']

export async function getResearchPrompts(opts?: { category?: string; statuses?: ResearchPromptStatus[] }) {
  const { category, statuses = DEFAULT_VISIBLE_STATUSES } = opts ?? {}
  const where = {
    ...(category && { category }),
    ...(statuses.length > 0 && { status: { in: statuses } }),
  }
  return prisma.researchPrompt.findMany({
    where,
    orderBy: [{ status: 'asc' }, { id: 'asc' }],
  })
}
