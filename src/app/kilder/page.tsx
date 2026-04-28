import { getSourceDocumentFallbacks, getSources } from '@/lib/queries/sources'
import {
  loadDownloadBacklog,
  buildBacklogIndex,
  matchSourceToBacklog,
  backlogOnlyRows,
  BACKLOG_ROUNDS,
  normalizeSourceDownloadStatus,
  type BacklogRound,
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

type KilderPageSearchParams = Record<string, string | string[] | undefined>

export default async function KilderPage({
  searchParams,
}: {
  searchParams?: Promise<KilderPageSearchParams> | KilderPageSearchParams
}) {
  const resolvedSearchParams = await Promise.resolve(searchParams ?? {})
  const requestedRound = Array.isArray(resolvedSearchParams.round)
    ? resolvedSearchParams.round[0]
    : resolvedSearchParams.round
  const initialRoundFilter: 'all' | BacklogRound = BACKLOG_ROUNDS.some(
    (round) => round.id === requestedRound,
  )
    ? (requestedRound as BacklogRound)
    : 'all'

  const [sources, documentFallbacks] = await Promise.all([
    getSources(),
    getSourceDocumentFallbacks(),
  ])

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
      downloadStatus: match.status,
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
      downloadStatus: normalizeSourceDownloadStatus(row.status),
      researchRound: round,
      backlogTheme: row.theme || null,
      backlogPriority: row.priority || null,
      backlogTargetPath: row.targetPath || null,
      matchedBy: null,
    }
  })

  const enrichedFromDocuments: SourceRow[] = documentFallbacks.map((doc) => {
    const match = matchSourceToBacklog(
      {
        filename: doc.filename,
        url: doc.url,
        title: doc.title,
      },
      backlogIndex,
    )

    return {
      ...doc,
      origin: 'document' as const,
      downloadStatus: match.researchRound ? match.status : 'downloaded',
      researchRound: match.researchRound ?? null,
      backlogTheme: match.backlog?.theme ?? null,
      backlogPriority: match.backlog?.priority ?? null,
      backlogTargetPath: match.backlog?.targetPath ?? null,
      matchedBy: match.matchedBy ?? null,
    }
  })

  const originRank: Record<SourceRow['origin'], number> = {
    db: 0,
    document: 1,
    backlog: 2,
  }

  const parseYear = (value: string | number | null) => {
    if (typeof value === 'number') return value
    if (!value) return -1
    const match = value.toString().match(/\d{4}/)
    return match ? Number(match[0]) : -1
  }

  const allSources = [...enrichedFromDb, ...enrichedFromDocuments, ...backlogOnly].sort((a, b) => {
    const yearDiff = parseYear(b.year) - parseYear(a.year)
    if (yearDiff !== 0) return yearDiff

    const originDiff = originRank[a.origin] - originRank[b.origin]
    if (originDiff !== 0) return originDiff

    return (a.title ?? a.filename).localeCompare(b.title ?? b.filename, 'no')
  })

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
      documentCount={enrichedFromDocuments.length}
      backlogOnlyCount={backlogOnly.length}
      initialRoundFilter={initialRoundFilter}
    />
  )
}
