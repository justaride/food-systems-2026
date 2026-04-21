import { getInsights } from '@/lib/queries/insights'
import { prisma } from '@/lib/db'
import { loadDownloadBacklog, summarizeBacklog } from '@/lib/queries/download-backlog'
import { ForskningsrunderContent } from './ForskningsrunderContent'

const RESEARCH_ROUND_SOURCE_IDS = [
  'src-127', 'src-128', 'src-129', 'src-130', 'src-131', 'src-132', 'src-133', 'src-134', 'src-135', 'src-136',
  'src-137', 'src-138', 'src-139', 'src-140', 'src-141', 'src-142', 'src-143', 'src-144', 'src-145', 'src-146',
  'src-147', 'src-148', 'src-149', 'src-150', 'src-151', 'src-152', 'src-153',
]

export default async function ForskningsrunderPage() {
  const backlogRows = loadDownloadBacklog('download-backlog-2026-04-20.csv')
  const backlogSummary = summarizeBacklog(backlogRows)

  const konkurserBacklogRows = loadDownloadBacklog('download-backlog-sirkular-konkurser-2026-04-20.csv')
  const konkurserBacklogSummary = summarizeBacklog(konkurserBacklogRows)

  const [insights, reports, sources, actors, companies, konkurserActors] = await Promise.all([
    getInsights({ tag: 'forskningsrunde-2026-04-20' }),
    prisma.report.findMany({
      where: { tags: { has: 'forskningsrunde-2026-04-20' } },
      orderBy: { year: 'desc' },
    }),
    prisma.sourceDoc.findMany({
      where: { id: { in: RESEARCH_ROUND_SOURCE_IDS } },
      orderBy: { id: 'asc' },
    }),
    prisma.actor.findMany({
      where: { themeTags: { has: 'forskningsrunde-2026-04-20' } },
      orderBy: { name: 'asc' },
    }),
    prisma.company.findMany({
      where: {
        OR: [
          { valueChainStage: 'property' },
          { metadata: { path: ['channel'], equals: 'subscription' } },
        ],
      },
      orderBy: { name: 'asc' },
    }),
    prisma.actor.findMany({
      where: { themeTags: { has: 'sirkulaer-konkurser-2026' } },
      orderBy: { name: 'asc' },
    }),
  ])

  return (
    <ForskningsrunderContent
      insights={insights}
      reports={reports}
      sources={sources}
      actors={actors}
      companyCount={companies.length}
      backlogRows={backlogRows}
      backlogSummary={backlogSummary}
      konkurserBacklogRows={konkurserBacklogRows}
      konkurserBacklogSummary={konkurserBacklogSummary}
      konkurserActors={konkurserActors}
    />
  )
}
