import { getSources } from '@/lib/queries/sources'
import {
  loadDownloadBacklog,
  buildBacklogIndex,
  matchSourceToBacklog,
  type SourceDownloadStatus,
} from '@/lib/queries/download-backlog'
import { KilderContent } from './KilderContent'

export default async function KilderPage() {
  const sources = await getSources()
  const marchBacklog = loadDownloadBacklog('download-backlog-2026-03-18.csv')
  const aprilBacklog = loadDownloadBacklog('download-backlog-2026-04-20.csv')
  const backlogIndex = buildBacklogIndex(marchBacklog, aprilBacklog)

  const enrichedSources = sources.map((src) => {
    const match = matchSourceToBacklog(
      {
        filename: src.filename,
        url: src.url,
        title: src.title,
      },
      backlogIndex,
    )
    return {
      ...src,
      downloadStatus: match.status as SourceDownloadStatus,
      researchRound: match.researchRound ?? null,
      backlogTheme: match.backlog?.theme ?? null,
      backlogPriority: match.backlog?.priority ?? null,
      backlogTargetPath: match.backlog?.targetPath ?? null,
      matchedBy: match.matchedBy ?? null,
    }
  })

  return <KilderContent sources={enrichedSources} />
}
