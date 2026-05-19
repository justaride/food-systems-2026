import { classifySourceLocator, type SourceRow } from './source-quality-audit'

export type SourceGapQueueInput = {
  label: string
  rows: SourceRow[]
}

export type SourceGapQueueIssue = 'label_only' | 'missing_source'

export type SourceGapQueueItem = {
  label: string
  issue: SourceGapQueueIssue
  source: string | null
  count: number
  examples: string[]
}

const MAX_EXAMPLES_PER_ITEM = 10

function queueKey(label: string, issue: SourceGapQueueIssue, source: string | null): string {
  return `${label}\u0000${issue}\u0000${source ?? ''}`
}

export function buildSourceGapQueue(inputs: SourceGapQueueInput[]): SourceGapQueueItem[] {
  const byKey = new Map<string, SourceGapQueueItem>()

  for (const input of inputs) {
    for (const row of input.rows) {
      const source = row.source?.trim() || null
      const sourceClass = classifySourceLocator(source)

      let issue: SourceGapQueueIssue | null = null
      if (sourceClass === 'missing') {
        issue = 'missing_source'
      } else if (
        sourceClass === 'label_only' &&
        classifySourceLocator(row.resolvedLocator) !== 'direct_locator'
      ) {
        issue = 'label_only'
      }

      if (!issue) continue

      const key = queueKey(input.label, issue, source)
      const item =
        byKey.get(key) ??
        ({
          label: input.label,
          issue,
          source,
          count: 0,
          examples: [],
        } satisfies SourceGapQueueItem)

      item.count += 1
      if (item.examples.length < MAX_EXAMPLES_PER_ITEM) item.examples.push(row.id)
      byKey.set(key, item)
    }
  }

  return [...byKey.values()].sort((a, b) => {
    const byCount = b.count - a.count
    if (byCount !== 0) return byCount

    const byLabel = a.label.localeCompare(b.label)
    if (byLabel !== 0) return byLabel

    const byIssue = a.issue.localeCompare(b.issue)
    if (byIssue !== 0) return byIssue

    return (a.source ?? '').localeCompare(b.source ?? '')
  })
}
