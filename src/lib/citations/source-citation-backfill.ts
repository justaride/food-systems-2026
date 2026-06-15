import { deriveCitationReadiness, deriveVerificationStatus } from './citation-readiness'
import type { CitationReadinessLevel } from './citation-status'
import { classifySourceLocator } from '../source-quality-audit'

export type SourceCitationBackfillCandidate = {
  entityType: string
  entityId: string
  fieldPath: string
  citationText: string
  locator?: string | null
  title?: string | null
  publisher?: string | null
  author?: string | null
  year?: number | null
  sourceClass?: string | null
  verificationStatus?: string | null
  accessedAt?: Date | string | null
  verifiedAt?: Date | string | null
  claimText?: string | null
  confidence?: number | null
  notes?: string | null
}

export type CitationLocatorDocumentRef = {
  id: string
  filePath?: string | null
}

export type CitationLocatorSourceDocRef = {
  id: string
  documentId?: string | null
}

export type CitationLocatorContext = {
  documentsByRef?: Map<string, CitationLocatorDocumentRef>
  sourceDocsByRef?: Map<string, CitationLocatorSourceDocRef>
}

export type ParsedCitationLocator = {
  url?: string
  localPath?: string
  documentId?: string
  sourceDocId?: string
  internalRef?: string
}

export type PlannedSourceCitation = {
  clientKey: string
  citationText: string
  sourceClass: string
  citationReadiness: CitationReadinessLevel
  verificationStatus: ReturnType<typeof deriveVerificationStatus>
  title?: string | null
  publisher?: string | null
  author?: string | null
  year?: number | null
  url?: string | null
  localPath?: string | null
  documentId?: string | null
  sourceDocId?: string | null
  accessedAt?: Date | string | null
  verifiedAt?: Date | string | null
  notes?: string | null
}

export type PlannedFieldCitation = {
  citationId?: string
  citationClientKey?: string
  entityType: string
  entityId: string
  fieldPath: string
  claimText?: string | null
  confidence?: number | null
}

export type BackfillPreviewStatus =
  | 'create'
  | 'duplicate_source_create_field'
  | 'duplicate_field'
  | 'blocked_label_only'
  | 'blocked_missing_locator'

export type BackfillPreviewRow = {
  status: BackfillPreviewStatus
  entityType: string
  entityId: string
  fieldPath: string
  citationText: string
  locator: string
  resolvedLocator: string
  citationReadiness: CitationReadinessLevel
  reason: string
}

export type ExistingCitationBackfillState = {
  existingSourceCitationIdsByKey?: Map<string, string>
  existingFieldCitationKeys?: Set<string>
}

export type CitationBackfillPlan = {
  sourceCitationsToCreate: PlannedSourceCitation[]
  fieldCitationsToCreate: PlannedFieldCitation[]
  skippedDuplicateSourceCitations: number
  skippedDuplicateFieldCitations: number
  blockedLabelOnly: number
  blockedMissingLocator: number
  previewRows: BackfillPreviewRow[]
}

function hasText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function normalizeDoi(locator: string) {
  return locator.replace(/^doi:\s*/i, '').trim()
}

function parseUrlLocator(locator: string): ParsedCitationLocator | null {
  if (/^www\.[^\s]+\.[^\s]+/i.test(locator)) {
    return { url: `https://${locator}` }
  }

  if (/^([a-z0-9-]+\.)+[a-z]{2,}(\/\S*)$/i.test(locator)) {
    return { url: `https://${locator}` }
  }

  if (/^(doi:\s*)?10\.\d{4,9}\/\S+$/i.test(locator)) {
    return { url: `https://doi.org/${normalizeDoi(locator)}` }
  }

  try {
    const url = new URL(locator)
    if (url.protocol === 'http:' || url.protocol === 'https:') return { url: locator }
  } catch {
    return null
  }

  return null
}

function looksLikeLocalPath(locator: string) {
  if (/^[A-Za-z][A-Za-z0-9+.-]*:/.test(locator)) return false

  return (
    locator.includes('\\') ||
    /^\.{1,2}\//.test(locator) ||
    /^(research|docs|public|src|content|data|scripts|prisma)\//i.test(locator) ||
    /\.(pdf|html?|md|csv|json|txt|docx?|xlsx?)$/i.test(locator)
  )
}

export function parseCitationLocator(
  locator: string | null | undefined,
  context: CitationLocatorContext = {},
): ParsedCitationLocator | null {
  const trimmed = locator?.trim()
  if (!trimmed) return null

  const urlLocator = parseUrlLocator(trimmed)
  if (urlLocator) return urlLocator

  if (trimmed.startsWith('document:')) {
    const ref = trimmed.slice('document:'.length).trim()
    const document = context.documentsByRef?.get(ref)
    if (!document) return null

    return {
      documentId: document.id,
      ...(document.filePath ? { localPath: document.filePath } : {}),
    }
  }

  if (trimmed.startsWith('sourcedoc:')) {
    const ref = trimmed.slice('sourcedoc:'.length).trim()
    const sourceDoc = context.sourceDocsByRef?.get(ref) ?? { id: ref }
    return {
      sourceDocId: sourceDoc.id,
      ...(sourceDoc.documentId ? { documentId: sourceDoc.documentId } : {}),
    }
  }

  if (trimmed.startsWith('source:')) {
    return { internalRef: trimmed }
  }

  if (looksLikeLocalPath(trimmed)) {
    return { localPath: trimmed.replaceAll('\\', '/') }
  }

  return null
}

export function sourceCitationDuplicateKey(input: {
  documentId?: string | null
  localPath?: string | null
  url?: string | null
  citationText: string
  sourceDocId?: string | null
}) {
  if (hasText(input.sourceDocId)) {
    return [
      `sourcedoc:${input.sourceDocId.trim()}`,
      `url:${input.url?.trim() ?? ''}`,
      `text:${input.citationText.trim()}`,
    ].join('|')
  }

  return [
    `document:${input.documentId?.trim() ?? ''}`,
    `local:${input.localPath?.trim() ?? ''}`,
    `url:${input.url?.trim() ?? ''}`,
    `text:${input.citationText.trim()}`,
  ].join('|')
}

export function fieldCitationDuplicateKey(input: {
  citationId: string
  entityType: string
  entityId: string
  fieldPath?: string | null
}) {
  return [
    `citation:${input.citationId}`,
    `entity:${input.entityType}`,
    `id:${input.entityId}`,
    `field:${input.fieldPath?.trim() ?? ''}`,
  ].join('|')
}

function resolvedLocatorText(parsed: ParsedCitationLocator | null) {
  if (!parsed) return ''
  if (parsed.url) return parsed.url
  if (parsed.sourceDocId) return `sourcedoc:${parsed.sourceDocId}`
  if (parsed.documentId) return `document:${parsed.documentId}`
  if (parsed.localPath) return parsed.localPath
  if (parsed.internalRef) return parsed.internalRef
  return ''
}

function linkDocumentFilePathCandidate(
  candidate: SourceCitationBackfillCandidate,
  parsed: ParsedCitationLocator,
): ParsedCitationLocator {
  if (
    candidate.entityType === 'Document' &&
    candidate.fieldPath === 'filePath' &&
    parsed.localPath &&
    !parsed.documentId
  ) {
    return { ...parsed, documentId: candidate.entityId }
  }

  return parsed
}

function sourceClassFor(candidate: SourceCitationBackfillCandidate, parsed: ParsedCitationLocator) {
  if (parsed.internalRef) return 'internal_synthesis'
  if (candidate.sourceClass) return candidate.sourceClass
  return 'primary'
}

function notesFor(candidate: SourceCitationBackfillCandidate, parsed: ParsedCitationLocator) {
  const notes = [candidate.notes?.trim(), parsed.internalRef ? `internalRef=${parsed.internalRef}` : '']
    .filter(Boolean)
    .join('; ')

  return notes || null
}

function toPlannedSourceCitation(
  candidate: SourceCitationBackfillCandidate,
  parsed: ParsedCitationLocator,
  clientKey: string,
): PlannedSourceCitation {
  const sourceClass = sourceClassFor(candidate, parsed)
  const verificationStatus = deriveVerificationStatus({
    verificationStatus: candidate.verificationStatus,
    verifiedAt: candidate.verifiedAt,
  })
  const citationReadiness = deriveCitationReadiness({
    citationText: candidate.citationText,
    sourceClass,
    url: parsed.url,
    localPath: parsed.localPath,
    documentId: parsed.documentId,
    sourceDocId: parsed.sourceDocId,
    verificationStatus,
    accessedAt: candidate.accessedAt,
    verifiedAt: candidate.verifiedAt,
  })

  return {
    clientKey,
    citationText: candidate.citationText,
    sourceClass,
    citationReadiness,
    verificationStatus,
    title: candidate.title,
    publisher: candidate.publisher,
    author: candidate.author,
    year: candidate.year,
    url: parsed.url,
    localPath: parsed.localPath,
    documentId: parsed.documentId,
    sourceDocId: parsed.sourceDocId,
    accessedAt: candidate.accessedAt,
    verifiedAt: candidate.verifiedAt,
    notes: notesFor(candidate, parsed),
  }
}

export function buildCitationBackfillPlan(
  candidates: SourceCitationBackfillCandidate[],
  existing: ExistingCitationBackfillState = {},
  context: CitationLocatorContext = {},
): CitationBackfillPlan {
  const existingSourceCitationIdsByKey = existing.existingSourceCitationIdsByKey ?? new Map()
  const existingFieldCitationKeys = existing.existingFieldCitationKeys ?? new Set()
  const plannedSourceIdsByKey = new Map<string, string>()
  const plannedFieldKeys = new Set<string>()
  const plan: CitationBackfillPlan = {
    sourceCitationsToCreate: [],
    fieldCitationsToCreate: [],
    skippedDuplicateSourceCitations: 0,
    skippedDuplicateFieldCitations: 0,
    blockedLabelOnly: 0,
    blockedMissingLocator: 0,
    previewRows: [],
  }

  for (const candidate of candidates) {
    const locator = candidate.locator?.trim() ?? ''
    const parsed = parseCitationLocator(locator, context)
    const locatorClass = classifySourceLocator(locator)

    if (!parsed) {
      const isLabelOnly = locatorClass === 'label_only'
      if (isLabelOnly) plan.blockedLabelOnly += 1
      else plan.blockedMissingLocator += 1

      plan.previewRows.push({
        status: isLabelOnly ? 'blocked_label_only' : 'blocked_missing_locator',
        entityType: candidate.entityType,
        entityId: candidate.entityId,
        fieldPath: candidate.fieldPath,
        citationText: candidate.citationText,
        locator,
        resolvedLocator: '',
        citationReadiness: 'blocked_unsourced',
        reason: isLabelOnly
          ? 'label-only source has no existing locator'
          : 'missing source locator',
      })
      continue
    }

    const linkedParsed = linkDocumentFilePathCandidate(candidate, parsed)
    const sourceKey = sourceCitationDuplicateKey({
      documentId: linkedParsed.documentId,
      localPath: linkedParsed.localPath,
      url: linkedParsed.url,
      sourceDocId: linkedParsed.sourceDocId,
      citationText: candidate.citationText,
    })
    const existingCitationId = existingSourceCitationIdsByKey.get(sourceKey)
    const plannedCitationClientKey = plannedSourceIdsByKey.get(sourceKey)

    let citationId = existingCitationId
    let citationClientKey = plannedCitationClientKey
    let status: BackfillPreviewStatus = 'create'
    let sourceCitation = plan.sourceCitationsToCreate.find(
      planned => planned.clientKey === plannedCitationClientKey,
    )

    if (existingCitationId) {
      plan.skippedDuplicateSourceCitations += 1
      status = 'duplicate_source_create_field'
    } else if (plannedCitationClientKey) {
      plan.skippedDuplicateSourceCitations += 1
      status = 'duplicate_source_create_field'
    } else {
      citationClientKey = `source-${plan.sourceCitationsToCreate.length + 1}`
      sourceCitation = toPlannedSourceCitation(candidate, linkedParsed, citationClientKey)
      plan.sourceCitationsToCreate.push(sourceCitation)
      plannedSourceIdsByKey.set(sourceKey, citationClientKey)
    }

    if (!sourceCitation && citationClientKey) {
      sourceCitation = plan.sourceCitationsToCreate.find(
        planned => planned.clientKey === citationClientKey,
      )
    }

    const fieldKey = fieldCitationDuplicateKey({
      citationId: citationId ?? citationClientKey ?? sourceKey,
      entityType: candidate.entityType,
      entityId: candidate.entityId,
      fieldPath: candidate.fieldPath,
    })

    if (existingFieldCitationKeys.has(fieldKey) || plannedFieldKeys.has(fieldKey)) {
      plan.skippedDuplicateFieldCitations += 1
      status = 'duplicate_field'
    } else {
      plan.fieldCitationsToCreate.push({
        citationId,
        citationClientKey: citationId ? undefined : citationClientKey,
        entityType: candidate.entityType,
        entityId: candidate.entityId,
        fieldPath: candidate.fieldPath,
        claimText: candidate.claimText,
        confidence: candidate.confidence,
      })
      plannedFieldKeys.add(fieldKey)
    }

    plan.previewRows.push({
      status,
      entityType: candidate.entityType,
      entityId: candidate.entityId,
      fieldPath: candidate.fieldPath,
      citationText: candidate.citationText,
      locator,
      resolvedLocator: resolvedLocatorText(linkedParsed),
      citationReadiness: sourceCitation?.citationReadiness ?? 'blocked_unsourced',
      reason:
        status === 'create'
          ? 'will create source and field citation'
          : status === 'duplicate_source_create_field'
            ? 'source citation already exists; field citation will be created'
            : 'field citation already exists',
    })
  }

  return plan
}

function escapeCsv(value: unknown) {
  const text = value == null ? '' : String(value)
  if (!/[",\n\r]/.test(text)) return text
  return `"${text.replaceAll('"', '""')}"`
}

export function formatBackfillPreviewCsv(rows: BackfillPreviewRow[]) {
  const headers: Array<keyof BackfillPreviewRow> = [
    'status',
    'entityType',
    'entityId',
    'fieldPath',
    'citationText',
    'locator',
    'resolvedLocator',
    'citationReadiness',
    'reason',
  ]

  return [
    headers.join(','),
    ...rows.map(row => headers.map(header => escapeCsv(row[header])).join(',')),
  ].join('\n') + '\n'
}
