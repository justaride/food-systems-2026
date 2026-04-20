import 'server-only'
import * as fs from 'fs'
import * as path from 'path'

export type BacklogRow = {
  priority: string
  status: 'downloaded' | 'url_only' | 'missing_metadata_only' | string
  country: string
  theme: string
  docType: string
  institution: string
  title: string
  year: string
  url: string
  urlType: string
  currentLocalStatus: string
  targetPath: string
  nextAction: string
  sourceBasis: string
}

function parseCsv(content: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false

  for (let i = 0; i < content.length; i++) {
    const char = content[i]

    if (char === '"') {
      if (inQuotes && content[i + 1] === '"') {
        field += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === ',' && !inQuotes) {
      row.push(field)
      field = ''
      continue
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && content[i + 1] === '\n') i++
      row.push(field)
      field = ''
      if (row.some((value) => value.length > 0)) rows.push(row)
      row = []
      continue
    }

    field += char
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field)
    if (row.some((value) => value.length > 0)) rows.push(row)
  }

  return rows
}

export function loadDownloadBacklog(filename: string): BacklogRow[] {
  const filePath = path.resolve(process.cwd(), 'research/evidence-pack', filename)
  if (!fs.existsSync(filePath)) return []

  const raw = fs.readFileSync(filePath, 'utf-8')
  const rows = parseCsv(raw)
  if (rows.length === 0) return []

  const [header, ...data] = rows
  const index = Object.fromEntries(header.map((name, idx) => [name.trim(), idx]))

  const result: BacklogRow[] = []
  for (const values of data) {
    const priority = (values[index['priority']] ?? '').trim()
    if (!priority || priority.startsWith('#')) continue
    result.push({
      priority,
      status: (values[index['status']] ?? '').trim(),
      country: (values[index['country']] ?? '').trim(),
      theme: (values[index['theme']] ?? '').trim(),
      docType: (values[index['doc_type']] ?? '').trim(),
      institution: (values[index['institution']] ?? '').trim(),
      title: (values[index['title']] ?? '').trim(),
      year: (values[index['year']] ?? '').trim(),
      url: (values[index['url']] ?? '').trim(),
      urlType: (values[index['url_type']] ?? '').trim(),
      currentLocalStatus: (values[index['current_local_status']] ?? '').trim(),
      targetPath: (values[index['target_path']] ?? '').trim(),
      nextAction: (values[index['next_action']] ?? '').trim(),
      sourceBasis: (values[index['source_basis']] ?? '').trim(),
    })
  }
  return result
}

export type BacklogSummary = {
  total: number
  downloaded: number
  urlOnly: number
  missingMetadata: number
  byTheme: Record<
    string,
    { total: number; downloaded: number; urlOnly: number; missingMetadata: number }
  >
  byPriority: Record<string, number>
}

export function summarizeBacklog(rows: BacklogRow[]): BacklogSummary {
  const summary: BacklogSummary = {
    total: rows.length,
    downloaded: 0,
    urlOnly: 0,
    missingMetadata: 0,
    byTheme: {},
    byPriority: {},
  }

  for (const r of rows) {
    if (r.status === 'downloaded') summary.downloaded++
    else if (r.status === 'url_only') summary.urlOnly++
    else if (r.status === 'missing_metadata_only') summary.missingMetadata++

    const theme = r.theme || 'other'
    if (!summary.byTheme[theme]) {
      summary.byTheme[theme] = { total: 0, downloaded: 0, urlOnly: 0, missingMetadata: 0 }
    }
    summary.byTheme[theme].total++
    if (r.status === 'downloaded') summary.byTheme[theme].downloaded++
    else if (r.status === 'url_only') summary.byTheme[theme].urlOnly++
    else if (r.status === 'missing_metadata_only') summary.byTheme[theme].missingMetadata++

    summary.byPriority[r.priority] = (summary.byPriority[r.priority] ?? 0) + 1
  }

  return summary
}

// ═══ Source -> Backlog matching ═══

export type SourceDownloadStatus =
  | 'downloaded'
  | 'url_only'
  | 'missing_metadata_only'
  | 'untracked'

export type MatchedSource = {
  status: SourceDownloadStatus
  backlog?: BacklogRow
  researchRound?: '2026-03-18' | '2026-04-20'
  matchedBy?: 'url' | 'filename' | 'target-basename' | 'title'
}

function normalizeUrl(value: string | null | undefined): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  try {
    const u = new URL(trimmed)
    u.hash = ''
    u.search = ''
    u.pathname = u.pathname.replace(/\/+$/, '') || '/'
    return u.toString().toLowerCase()
  } catch {
    return trimmed.toLowerCase().replace(/#.*$/, '').replace(/\?.*$/, '').replace(/\/+$/, '')
  }
}

function basename(p: string): string {
  if (!p) return ''
  const cleaned = p.split('|')[0].trim()
  const parts = cleaned.replace(/\\/g, '/').split('/')
  return parts[parts.length - 1].toLowerCase()
}

function normalizeTitle(s: string | null | undefined): string {
  return (s ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export type BacklogIndex = {
  byUrl: Map<string, { row: BacklogRow; round: '2026-03-18' | '2026-04-20' }>
  byTargetBasename: Map<string, { row: BacklogRow; round: '2026-03-18' | '2026-04-20' }>
  byTitle: Map<string, { row: BacklogRow; round: '2026-03-18' | '2026-04-20' }>
}

export function buildBacklogIndex(
  marchRows: BacklogRow[],
  aprilRows: BacklogRow[],
): BacklogIndex {
  const byUrl = new Map<string, { row: BacklogRow; round: '2026-03-18' | '2026-04-20' }>()
  const byTargetBasename = new Map<string, { row: BacklogRow; round: '2026-03-18' | '2026-04-20' }>()
  const byTitle = new Map<string, { row: BacklogRow; round: '2026-03-18' | '2026-04-20' }>()

  const indexRound = (rows: BacklogRow[], round: '2026-03-18' | '2026-04-20') => {
    for (const row of rows) {
      const nu = normalizeUrl(row.url)
      if (nu && !byUrl.has(nu)) byUrl.set(nu, { row, round })

      for (const tp of row.targetPath.split('|').map((p) => p.trim()).filter(Boolean)) {
        const b = basename(tp)
        if (b && !byTargetBasename.has(b)) byTargetBasename.set(b, { row, round })
      }

      const nt = normalizeTitle(row.title)
      if (nt && !byTitle.has(nt)) byTitle.set(nt, { row, round })
    }
  }

  // April indexed first so its rows win for overlapping URLs
  indexRound(aprilRows, '2026-04-20')
  indexRound(marchRows, '2026-03-18')

  return { byUrl, byTargetBasename, byTitle }
}

export function matchSourceToBacklog(
  source: { filename: string; url: string | null; title?: string | null },
  index: BacklogIndex,
): MatchedSource {
  const nu = normalizeUrl(source.url)
  if (nu) {
    const hit = index.byUrl.get(nu)
    if (hit) {
      return {
        status: hit.row.status as SourceDownloadStatus,
        backlog: hit.row,
        researchRound: hit.round,
        matchedBy: 'url',
      }
    }
  }

  const fn = source.filename ? source.filename.toLowerCase() : ''
  if (fn) {
    const hit = index.byTargetBasename.get(fn)
    if (hit) {
      return {
        status: hit.row.status as SourceDownloadStatus,
        backlog: hit.row,
        researchRound: hit.round,
        matchedBy: 'filename',
      }
    }
  }

  const nt = normalizeTitle(source.title ?? null)
  if (nt) {
    const hit = index.byTitle.get(nt)
    if (hit) {
      return {
        status: hit.row.status as SourceDownloadStatus,
        backlog: hit.row,
        researchRound: hit.round,
        matchedBy: 'title',
      }
    }
  }

  return { status: 'untracked' }
}
