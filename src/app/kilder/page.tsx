import { getSources } from '@/lib/queries/sources'
import {
  loadDownloadBacklog,
  buildBacklogIndex,
  matchSourceToBacklog,
  backlogOnlyRows,
  BACKLOG_ROUNDS,
  type BacklogRound,
  type SourceDownloadStatus,
} from '@/lib/queries/download-backlog'
import { KilderContent, type SourceRow } from './KilderContent'

const BACKLOG_THEME_TO_TYPE: Record<string, string> = {
  'annual-reports': 'årsrapport',
  'market-power': 'rapport',
  competition: 'rapport',
  'research-round': 'analyse',
  'sirkular-konkurser': 'rapport',
  matsvinn: 'rapport',
  akvakultur: 'rapport',
  eiendom: 'rapport',
  policy: 'rapport',
  regulation: 'lovverk',
}

function mapBacklogToType(theme: string, docType: string): string {
  if (BACKLOG_THEME_TO_TYPE[theme]) return BACKLOG_THEME_TO_TYPE[theme]
  if (docType.includes('annual')) return 'årsrapport'
  if (docType.includes('thesis') || docType.includes('master')) return 'masteroppgave'
  if (docType.includes('nou')) return 'nou'
  if (docType.includes('law') || docType.includes('legal')) return 'lovverk'
  if (docType.includes('statistikk') || docType.includes('statistic')) return 'statistikk'
  if (docType.includes('analysis') || docType.includes('analyse')) return 'analyse'
  return 'rapport'
}

export default async function KilderPage() {
  const sources = await getSources()

  const backlogsPerRound = BACKLOG_ROUNDS.map((r) => ({
    round: r.id,
    rows: loadDownloadBacklog(r.file),
  }))
  const backlogIndex = buildBacklogIndex(...backlogsPerRound)

  const enrichedFromDb: SourceRow[] = sources.map((src) => {
    const match = matchSourceToBacklog(
      {
        filename: src.filename,
        url: src.url,
        title: src.title,
      },
      backlogIndex,
    )
    return {
      id: src.id,
      filename: src.filename,
      title: src.title,
      author: src.author,
      year: src.year,
      sourceType: src.sourceType,
      description: src.description,
      relevance: src.relevance,
      url: src.url,
      isDuplicate: src.isDuplicate,
      document: src.document,
      origin: 'db' as const,
      downloadStatus: match.status as SourceDownloadStatus,
      researchRound: match.researchRound ?? null,
      backlogTheme: match.backlog?.theme ?? null,
      backlogPriority: match.backlog?.priority ?? null,
      backlogTargetPath: match.backlog?.targetPath ?? null,
      matchedBy: match.matchedBy ?? null,
    }
  })

  const backlogOnly = backlogOnlyRows(backlogIndex).map(({ row, round }, idx): SourceRow => {
    const filename =
      row.targetPath.split('|')[0].trim().split('/').pop() || `backlog-${round}-${idx + 1}`
    return {
      id: `bkl-${round}-${idx + 1}`,
      filename,
      title: row.title || null,
      author: row.institution || null,
      year: row.year || null,
      sourceType: mapBacklogToType(row.theme, row.docType),
      description: [row.institution, row.docType, row.country].filter(Boolean).join(' · ') || '—',
      relevance: row.nextAction ? `Neste steg: ${row.nextAction}` : '',
      url: row.url || null,
      isDuplicate: false,
      document: null,
      origin: 'backlog' as const,
      downloadStatus: row.status as SourceDownloadStatus,
      researchRound: round,
      backlogTheme: row.theme || null,
      backlogPriority: row.priority || null,
      backlogTargetPath: row.targetPath || null,
      matchedBy: null,
    }
  })

  const allSources = [...enrichedFromDb, ...backlogOnly]

  const roundOptions = BACKLOG_ROUNDS.map((r) => ({
    id: r.id,
    label: r.label,
    count: allSources.filter((s) => s.researchRound === r.id).length,
  }))

  return (
    <KilderContent
      sources={allSources}
      rounds={roundOptions}
      dbCount={enrichedFromDb.length}
      backlogOnlyCount={backlogOnly.length}
    />
  )
}
