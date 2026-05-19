import type { Report, Thesis } from './types'

export type SourceType =
  | 'report_canonical'
  | 'report_supporting'
  | 'thesis'
  | 'sourcedoc'
  | 'document'

export type Protocol = 'http' | 'https' | 'other'

export type UrlRow = {
  url: string
  source_type: SourceType
  source_id: string
  source_priority: number | null
  domain: string
  protocol: Protocol
}

export type DbDocumentUrlRow = {
  id: string
  slug?: string | null
  url?: string | null
}

export type DbSourceDocUrlRow = {
  id: string
  url?: string | null
}

type PriorityMap = Pick<Map<string, number>, 'get'>

function priorityFor(priorityMap: PriorityMap, ...ids: Array<string | null | undefined>): number | null {
  for (const id of ids) {
    if (!id) continue
    const priority = priorityMap.get(id)
    if (typeof priority === 'number' && Number.isFinite(priority)) return priority
  }
  return null
}

export function parseInventoryUrl(raw: string | null | undefined): { domain: string; protocol: Protocol } | null {
  const trimmed = raw?.trim()
  if (!trimmed) return null

  try {
    const u = new URL(trimmed)
    const proto = u.protocol.replace(':', '').toLowerCase()
    let protocol: Protocol = 'other'
    if (proto === 'http') protocol = 'http'
    else if (proto === 'https') protocol = 'https'
    const domain = u.hostname.toLowerCase().replace(/^www\./, '')
    return { domain, protocol }
  } catch {
    return null
  }
}

export function collectTypedUrlRows(args: {
  reports: Pick<Report, 'id' | 'sourceUrl' | 'supportingSources'>[]
  theses: Pick<Thesis, 'id' | 'url'>[]
  priorityMap: PriorityMap
}): UrlRow[] {
  const rows: UrlRow[] = []

  for (const report of args.reports) {
    const parsed = parseInventoryUrl(report.sourceUrl)
    if (!parsed || !report.sourceUrl) continue
    rows.push({
      url: report.sourceUrl.trim(),
      source_type: 'report_canonical',
      source_id: report.id,
      source_priority: priorityFor(args.priorityMap, report.id),
      domain: parsed.domain,
      protocol: parsed.protocol,
    })
  }

  for (const report of args.reports) {
    for (const source of report.supportingSources ?? []) {
      const parsed = parseInventoryUrl(source.url)
      if (!parsed || !source.url) continue
      rows.push({
        url: source.url.trim(),
        source_type: 'report_supporting',
        source_id: report.id,
        source_priority: priorityFor(args.priorityMap, report.id),
        domain: parsed.domain,
        protocol: parsed.protocol,
      })
    }
  }

  for (const thesis of args.theses) {
    const parsed = parseInventoryUrl(thesis.url)
    if (!parsed || !thesis.url) continue
    rows.push({
      url: thesis.url.trim(),
      source_type: 'thesis',
      source_id: thesis.id,
      source_priority: priorityFor(args.priorityMap, thesis.id),
      domain: parsed.domain,
      protocol: parsed.protocol,
    })
  }

  return rows
}

export function collectDatabaseUrlRows(args: {
  documents: DbDocumentUrlRow[]
  sourceDocs: DbSourceDocUrlRow[]
  priorityMap: PriorityMap
}): UrlRow[] {
  const rows: UrlRow[] = []

  for (const document of args.documents) {
    const parsed = parseInventoryUrl(document.url)
    if (!parsed || !document.url) continue
    const sourceId = document.slug?.trim() || document.id
    rows.push({
      url: document.url.trim(),
      source_type: 'document',
      source_id: sourceId,
      source_priority: priorityFor(args.priorityMap, sourceId, document.id),
      domain: parsed.domain,
      protocol: parsed.protocol,
    })
  }

  for (const sourceDoc of args.sourceDocs) {
    const parsed = parseInventoryUrl(sourceDoc.url)
    if (!parsed || !sourceDoc.url) continue
    rows.push({
      url: sourceDoc.url.trim(),
      source_type: 'sourcedoc',
      source_id: sourceDoc.id,
      source_priority: priorityFor(args.priorityMap, sourceDoc.id),
      domain: parsed.domain,
      protocol: parsed.protocol,
    })
  }

  return rows
}
