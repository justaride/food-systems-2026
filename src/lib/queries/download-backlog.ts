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

export type BacklogRound =
  | '2026-03-18'
  | '2026-04-20'
  | 'perplexity-2026-04-20'
  | 'sirkular-konkurser-2026-04-20'
  | 'exa-2026-04-21'
  | 'matsvinn-2026-04-21'

export const BACKLOG_ROUNDS: Array<{ id: BacklogRound; file: string; label: string }> = [
  { id: '2026-03-18', file: 'download-backlog-2026-03-18.csv', label: 'Runde mars 2026' },
  { id: '2026-04-20', file: 'download-backlog-2026-04-20.csv', label: 'Runde april 2026' },
  {
    id: 'perplexity-2026-04-20',
    file: 'download-backlog-perplexity-kilder-2026-04-20.csv',
    label: 'Perplexity-runde april 2026',
  },
  {
    id: 'sirkular-konkurser-2026-04-20',
    file: 'download-backlog-sirkular-konkurser-2026-04-20.csv',
    label: 'Sirkulære konkurser april 2026',
  },
  { id: 'exa-2026-04-21', file: 'download-backlog-exa-2026-04-21.csv', label: 'Exa-runde april 2026' },
  {
    id: 'matsvinn-2026-04-21',
    file: 'download-backlog-matsvinn-kilder-2026-04-21.csv',
    label: 'Matsvinn-runde april 2026',
  },
]

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

export type BacklogRowWithRound = BacklogRow & { round: BacklogRound }

export function loadAllBacklogs(): BacklogRowWithRound[] {
  const out: BacklogRowWithRound[] = []
  for (const r of BACKLOG_ROUNDS) {
    for (const row of loadDownloadBacklog(r.file)) {
      out.push({ ...row, round: r.id })
    }
  }
  return out
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
  researchRound?: BacklogRound
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
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export type BacklogIndex = {
  byUrl: Map<string, { row: BacklogRow; round: BacklogRound }>
  byTargetBasename: Map<string, { row: BacklogRow; round: BacklogRound }>
  byTitle: Map<string, { row: BacklogRow; round: BacklogRound }>
  /** Track which entries have already been matched to a DB source (by URL). */
  matchedUrls: Set<string>
  matchedTitles: Set<string>
  /** All loaded backlog rows, with round. */
  allRows: Array<{ row: BacklogRow; round: BacklogRound }>
}

export function buildBacklogIndex(...rounds: Array<{ rows: BacklogRow[]; round: BacklogRound }>): BacklogIndex {
  const byUrl = new Map<string, { row: BacklogRow; round: BacklogRound }>()
  const byTargetBasename = new Map<string, { row: BacklogRow; round: BacklogRound }>()
  const byTitle = new Map<string, { row: BacklogRow; round: BacklogRound }>()
  const allRows: Array<{ row: BacklogRow; round: BacklogRound }> = []

  const ROUND_PRIORITY: BacklogRound[] = [
    '2026-04-20',
    'perplexity-2026-04-20',
    'matsvinn-2026-04-21',
    'sirkular-konkurser-2026-04-20',
    'exa-2026-04-21',
    '2026-03-18',
  ]
  const sorted = [...rounds].sort(
    (a, b) => ROUND_PRIORITY.indexOf(a.round) - ROUND_PRIORITY.indexOf(b.round),
  )

  for (const { rows, round } of sorted) {
    for (const row of rows) {
      allRows.push({ row, round })
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

  return {
    byUrl,
    byTargetBasename,
    byTitle,
    matchedUrls: new Set<string>(),
    matchedTitles: new Set<string>(),
    allRows,
  }
}

export function matchSourceToBacklog(
  source: { filename: string; url: string | null; title?: string | null },
  index: BacklogIndex,
): MatchedSource {
  const nu = normalizeUrl(source.url)
  if (nu) {
    const hit = index.byUrl.get(nu)
    if (hit) {
      index.matchedUrls.add(nu)
      const nt = normalizeTitle(hit.row.title)
      if (nt) index.matchedTitles.add(nt)
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
      const hu = normalizeUrl(hit.row.url)
      if (hu) index.matchedUrls.add(hu)
      const nt = normalizeTitle(hit.row.title)
      if (nt) index.matchedTitles.add(nt)
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
      index.matchedTitles.add(nt)
      const hu = normalizeUrl(hit.row.url)
      if (hu) index.matchedUrls.add(hu)
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

/**
 * Return every backlog row that was NOT matched against a DB source. These
 * represent evidence that exists in the research/ tree but is not yet
 * registered in sources.ts / the database.
 */
export function backlogOnlyRows(
  index: BacklogIndex,
): Array<{ row: BacklogRow; round: BacklogRound }> {
  const seen = new Set<string>()
  const out: Array<{ row: BacklogRow; round: BacklogRound }> = []
  for (const entry of index.allRows) {
    const nu = normalizeUrl(entry.row.url)
    const nt = normalizeTitle(entry.row.title)
    if (nu && index.matchedUrls.has(nu)) continue
    if (!nu && nt && index.matchedTitles.has(nt)) continue
    const dedup = nu || nt || entry.row.targetPath
    if (seen.has(dedup)) continue
    seen.add(dedup)
    out.push(entry)
  }
  return out
}
