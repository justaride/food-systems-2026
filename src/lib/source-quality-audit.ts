export type SourceLocatorClass = 'missing' | 'direct_locator' | 'label_only'

export type SourceRow = {
  id: string
  source?: string | null
  resolvedLocator?: string | null
}

export type SourceRowsSummary = {
  label: string
  total: number
  directLocator: number
  resolvedLocator: number
  labelOnly: number
  missing: number
  examples: {
    labelOnly: string[]
    missing: string[]
  }
}

const DOI_PATTERN = /^(doi:\s*)?10\.\d{4,9}\/\S+$/i
const DIRECT_REF_PATTERN = /^(document|sourcedoc|report|thesis|source):[A-Za-z0-9._:/-]+$/i

export function classifySourceLocator(value: string | null | undefined): SourceLocatorClass {
  const source = value?.trim()
  if (!source) return 'missing'

  if (DOI_PATTERN.test(source)) return 'direct_locator'
  if (DIRECT_REF_PATTERN.test(source)) return 'direct_locator'
  if (/^www\.[^\s]+\.[^\s]+/i.test(source)) return 'direct_locator'

  try {
    const url = new URL(source)
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return 'direct_locator'
    }
  } catch {
    // Not a parseable URL; classify below.
  }

  return 'label_only'
}

function exampleFor(row: SourceRow): string {
  const source = row.source?.trim()
  return source ? `${row.id}: ${source}` : row.id
}

export function summarizeSourceRows(label: string, rows: SourceRow[], exampleLimit = 5): SourceRowsSummary {
  const summary: SourceRowsSummary = {
    label,
    total: rows.length,
    directLocator: 0,
    resolvedLocator: 0,
    labelOnly: 0,
    missing: 0,
    examples: {
      labelOnly: [],
      missing: [],
    },
  }

  for (const row of rows) {
    const classification = classifySourceLocator(row.source)
    if (classification === 'direct_locator') {
      summary.directLocator += 1
      continue
    }

    if (classification === 'label_only') {
      if (classifySourceLocator(row.resolvedLocator) === 'direct_locator') {
        summary.resolvedLocator += 1
        continue
      }

      summary.labelOnly += 1
      if (summary.examples.labelOnly.length < exampleLimit) {
        summary.examples.labelOnly.push(exampleFor(row))
      }
      continue
    }

    summary.missing += 1
    if (summary.examples.missing.length < exampleLimit) {
      summary.examples.missing.push(exampleFor(row))
    }
  }

  return summary
}

export function sourceCoveragePct(part: number, total: number): string {
  if (total === 0) return '0.0%'
  return `${((part / total) * 100).toFixed(1)}%`
}
