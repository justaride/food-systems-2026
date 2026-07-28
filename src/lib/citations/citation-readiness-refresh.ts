import { deriveCitationReadiness } from './citation-readiness'
import { normalizeCitationReadiness, type CitationReadinessLevel } from './citation-status'
import type { SourceCitationInput } from './source-citation-contract'

export type RefreshableSourceCitation = SourceCitationInput & {
  id: string
  citationReadiness?: string | null
  notes?: string | null
}

export type CitationReadinessRefreshUpdate = {
  id: string
  fromReadiness: CitationReadinessLevel
  toReadiness: CitationReadinessLevel
  toSourceClass?: string | null
  citationText?: string | null
  sourceClass?: unknown
  verificationStatus?: unknown
  url?: string | null
  localPath?: string | null
  documentId?: string | null
  sourceDocId?: string | null
}

export type CitationReadinessRefreshPlan = {
  updates: CitationReadinessRefreshUpdate[]
  skippedUnchanged: number
  countsByTransition: Record<string, number>
}

export type CitationReadinessRefreshOptions = {
  localPathExists?: (localPath: string) => boolean
}

function transitionKey(fromReadiness: CitationReadinessLevel, toReadiness: CitationReadinessLevel) {
  return `${fromReadiness} -> ${toReadiness}`
}

function isExternallyReady(readiness: CitationReadinessLevel) {
  return readiness === 'citable_external' || readiness === 'citable_with_note'
}

function hasText(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0
}

function hasNonLocalLocator(citation: RefreshableSourceCitation) {
  return (
    hasText(citation.url) ||
    hasText(citation.archivedUrl) ||
    hasText(citation.documentId) ||
    hasText(citation.sourceDocId)
  )
}

function blockedInternalSourceClass(citation: RefreshableSourceCitation) {
  const notes = typeof citation.notes === 'string' ? citation.notes : ''
  return notes.includes('internalRef=source:blocked-unsourced/')
    ? 'internal_synthesis'
    : null
}

function needsLocalOnlyDowngrade(
  citation: RefreshableSourceCitation,
  fromReadiness: CitationReadinessLevel,
  options: CitationReadinessRefreshOptions,
) {
  return Boolean(
    isExternallyReady(fromReadiness) &&
      citation.localPath &&
      !hasNonLocalLocator(citation) &&
      options.localPathExists &&
      !options.localPathExists(citation.localPath),
  )
}

export function buildCitationReadinessRefreshPlan(
  citations: RefreshableSourceCitation[],
  options: CitationReadinessRefreshOptions = {},
): CitationReadinessRefreshPlan {
  const updates: CitationReadinessRefreshUpdate[] = []
  let skippedUnchanged = 0
  const countsByTransition: Record<string, number> = {}

  for (const citation of citations) {
    const fromReadiness = normalizeCitationReadiness(citation.citationReadiness)
    const toSourceClass = blockedInternalSourceClass(citation)
    const normalizedCitation = toSourceClass
      ? { ...citation, sourceClass: toSourceClass }
      : citation
    const localOnlyDowngrade = needsLocalOnlyDowngrade(citation, fromReadiness, options)
    const toReadiness = localOnlyDowngrade
      ? 'internal_context'
      : deriveCitationReadiness(normalizedCitation)
    const sourceClassNeedsUpdate = Boolean(
      toSourceClass && citation.sourceClass !== toSourceClass,
    )
    const readinessNeedsUpdate = fromReadiness !== toReadiness

    if (!sourceClassNeedsUpdate && !readinessNeedsUpdate) {
      skippedUnchanged += 1
      continue
    }

    updates.push({
      id: citation.id,
      fromReadiness,
      toReadiness,
      toSourceClass,
      citationText: citation.citationText,
      sourceClass: citation.sourceClass,
      verificationStatus: citation.verificationStatus,
      url: citation.url,
      localPath: citation.localPath,
      documentId: citation.documentId,
      sourceDocId: citation.sourceDocId,
    })

    const key = transitionKey(fromReadiness, toReadiness)
    countsByTransition[key] = (countsByTransition[key] ?? 0) + 1
  }

  return {
    updates,
    skippedUnchanged,
    countsByTransition,
  }
}

function escapeCsv(value: unknown) {
  const text = value == null ? '' : String(value)
  if (!/[",\n\r]/.test(text)) return text
  return `"${text.replaceAll('"', '""')}"`
}

export function formatCitationReadinessRefreshCsv(updates: CitationReadinessRefreshUpdate[]) {
  const headers: Array<keyof CitationReadinessRefreshUpdate> = [
    'id',
    'fromReadiness',
    'toReadiness',
    'toSourceClass',
    'citationText',
    'sourceClass',
    'verificationStatus',
    'url',
    'localPath',
    'documentId',
    'sourceDocId',
  ]

  return [
    headers.join(','),
    ...updates.map(update => headers.map(header => escapeCsv(update[header])).join(',')),
  ].join('\n') + '\n'
}
