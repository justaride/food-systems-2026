import { getSources } from '@/lib/queries/sources'
import { getInsights } from '@/lib/queries/insights'
import { prisma } from '@/lib/db'
import {
  BACKLOG_ROUNDS,
  backlogOnlyRows,
  buildBacklogIndex,
  loadDownloadBacklog,
  matchSourceToBacklog,
  summarizeBacklog,
  type BacklogRound,
} from '@/lib/queries/download-backlog'
import { ForskningsrunderContent, type ResearchRoundSnapshot } from './ForskningsrunderContent'

const PRIMARY_RESEARCH_ROUND: BacklogRound = '2026-04-20'
const KONKURS_RESEARCH_ROUND: BacklogRound = 'sirkular-konkurser-2026-04-20'

export default async function ForskningsrunderPage() {
  const roundInventories = BACKLOG_ROUNDS.map((round) => {
    const rows = loadDownloadBacklog(round.file)
    return {
      id: round.id,
      label: round.label,
      rows,
      summary: summarizeBacklog(rows),
    }
  })

  const backlogRows =
    roundInventories.find((round) => round.id === PRIMARY_RESEARCH_ROUND)?.rows ?? []
  const backlogSummary =
    roundInventories.find((round) => round.id === PRIMARY_RESEARCH_ROUND)?.summary ??
    summarizeBacklog([])

  const konkurserBacklogRows =
    roundInventories.find((round) => round.id === KONKURS_RESEARCH_ROUND)?.rows ?? []
  const konkurserBacklogSummary =
    roundInventories.find((round) => round.id === KONKURS_RESEARCH_ROUND)?.summary ??
    summarizeBacklog([])

  const [insights, reports, allSources, actors, companies, konkurserActors] = await Promise.all([
    getInsights({ tag: 'forskningsrunde-2026-04-20' }),
    prisma.report.findMany({
      where: { tags: { has: 'forskningsrunde-2026-04-20' } },
      orderBy: { year: 'desc' },
    }),
    getSources(),
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

  const backlogIndex = buildBacklogIndex(
    ...roundInventories.map((round) => ({
      round: round.id,
      rows: round.rows,
    })),
  )

  const matchedSources = allSources.map((source) => ({
    source,
    match: matchSourceToBacklog(
      {
        filename: source.filename,
        url: source.url,
        title: source.title,
      },
      backlogIndex,
    ),
  }))

  const matchedSourceCounts = matchedSources.reduce<Partial<Record<BacklogRound, number>>>(
    (counts, entry) => {
      if (!entry.match.researchRound) return counts
      counts[entry.match.researchRound] = (counts[entry.match.researchRound] ?? 0) + 1
      return counts
    },
    {},
  )

  const backlogOnlyCounts = backlogOnlyRows(backlogIndex).reduce<Partial<Record<BacklogRound, number>>>(
    (counts, entry) => {
      counts[entry.round] = (counts[entry.round] ?? 0) + 1
      return counts
    },
    {},
  )

  const sources = matchedSources
    .filter((entry) => entry.match.researchRound === PRIMARY_RESEARCH_ROUND)
    .map(({ source }) => ({
      id: source.id,
      filename: source.filename,
      title: source.title,
      author: source.author,
      year: source.year,
      description: source.description,
      relevance: source.relevance,
    }))

  const roundSnapshots: ResearchRoundSnapshot[] = roundInventories.map((round) => ({
    id: round.id,
    label: round.label,
    summary: round.summary,
    matchedSourceCount: matchedSourceCounts[round.id] ?? 0,
    backlogOnlyCount: backlogOnlyCounts[round.id] ?? 0,
    detailHref: `/kilder?round=${encodeURIComponent(round.id)}`,
  }))

  return (
    <ForskningsrunderContent
      roundSnapshots={roundSnapshots}
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
