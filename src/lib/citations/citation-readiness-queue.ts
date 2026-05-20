import {
  normalizeCitationReadiness,
  type CitationReadinessLevel,
} from './citation-status'
import { deriveVerificationStatus } from './citation-readiness'
import {
  hasVerificationMetadata,
  type SourceCitationInput,
} from './source-citation-contract'

export type CitationQueuePriority = 'P0' | 'P1' | 'P2' | 'P3'

export type CitationReadinessQueueInput = {
  entityType: string
  entityId: string
  fieldPath: string
  currentReadiness: string
  blockingReason?: string | null
  currentSource?: string | null
  currentUrl?: string | null
  localPath?: string | null
  suggestedAction?: string | null
  publicSurface?: boolean
  usedInReport?: boolean
  excludedFromExternalUse?: boolean
  notes?: string | null
  missingVerificationMetadata?: boolean
  orphanOrLowTextFile?: boolean
}

export type CitationReadinessQueueRow = {
  priority: CitationQueuePriority
  entityType: string
  entityId: string
  fieldPath: string
  currentReadiness: CitationReadinessLevel
  blockingReason: string
  currentSource: string
  currentUrl: string
  localPath: string
  suggestedAction: string
  publicSurface: string
  usedInReport: string
  notes: string
}

const RESOLVABLE_REPORT_SOURCE_URL_EXCEPTION_TYPES = new Set([
  'internal_synthesis',
  'internal_register',
  'composite_source',
])

export function hasResolvedReportSourceUrlException(input: {
  provenanceType?: string | null
  supportingSourceCount?: number | null
}) {
  return (
    typeof input.provenanceType === 'string' &&
    RESOLVABLE_REPORT_SOURCE_URL_EXCEPTION_TYPES.has(input.provenanceType) &&
    (input.supportingSourceCount ?? 0) > 0
  )
}

function booleanText(value: boolean | undefined) {
  return value ? 'yes' : 'no'
}

function defaultBlockingReason(input: CitationReadinessQueueInput) {
  const readiness = normalizeCitationReadiness(input.currentReadiness)
  if (readiness === 'blocked_unsourced') return 'blocked_unsourced'
  if (input.missingVerificationMetadata) return 'missing verification metadata'
  if (!input.currentUrl && !input.localPath) return 'missing locator'
  return ''
}

export function isMissingExternalVerificationMetadata(citation: SourceCitationInput) {
  return (
    normalizeCitationReadiness(citation.citationReadiness) === 'citable_external' &&
    (deriveVerificationStatus(citation) !== 'verified' || !hasVerificationMetadata(citation))
  )
}

export function priorityForCitationQueueItem(
  input: CitationReadinessQueueInput,
): CitationQueuePriority {
  const readiness = normalizeCitationReadiness(input.currentReadiness)

  if (input.excludedFromExternalUse) return 'P2'

  if ((input.publicSurface || input.usedInReport) && readiness === 'blocked_unsourced') {
    return 'P0'
  }

  if (input.currentSource && !input.currentUrl && !input.localPath && readiness === 'blocked_unsourced') {
    return 'P0'
  }

  if (input.missingVerificationMetadata) return 'P1'

  if (
    ['internal_context', 'blocked_unsourced'].includes(readiness) &&
    (input.entityType === 'SourceDoc' || input.entityType === 'Report')
  ) {
    return 'P2'
  }

  if (input.orphanOrLowTextFile) return 'P3'

  return 'P2'
}

function suggestedAction(input: CitationReadinessQueueInput, priority: CitationQueuePriority) {
  if (input.suggestedAction) return input.suggestedAction
  if (input.excludedFromExternalUse) return 'Keep excluded from external/public evidence use unless a direct source locator is added.'
  if (priority === 'P0') return 'Add direct source locator or block from public/external output.'
  if (priority === 'P1') return 'Verify citation metadata and add accessedAt or verifiedAt.'
  if (priority === 'P2') return 'Attach URL/local file/document link or mark internal_context explicitly.'
  return 'Review file quality and decide whether it needs citation remediation.'
}

function sortKey(row: CitationReadinessQueueRow) {
  return [
    row.priority,
    row.entityType,
    row.entityId,
    row.fieldPath,
  ].join('|')
}

export function buildCitationReadinessQueue(
  inputs: CitationReadinessQueueInput[],
): CitationReadinessQueueRow[] {
  return inputs
    .map((input): CitationReadinessQueueRow => {
      const priority = priorityForCitationQueueItem(input)
      return {
        priority,
        entityType: input.entityType,
        entityId: input.entityId,
        fieldPath: input.fieldPath,
        currentReadiness: normalizeCitationReadiness(input.currentReadiness),
        blockingReason: input.blockingReason ?? defaultBlockingReason(input),
        currentSource: input.currentSource ?? '',
        currentUrl: input.currentUrl ?? '',
        localPath: input.localPath ?? '',
        suggestedAction: suggestedAction(input, priority),
        publicSurface: booleanText(input.publicSurface),
        usedInReport: booleanText(input.usedInReport),
        notes: input.notes ?? '',
      }
    })
    .sort((a, b) => sortKey(a).localeCompare(sortKey(b)))
}

function escapeCsv(value: unknown) {
  const text = value == null ? '' : String(value)
  if (!/[",\n\r]/.test(text)) return text
  return `"${text.replaceAll('"', '""')}"`
}

export function formatCitationReadinessQueueCsv(rows: CitationReadinessQueueRow[]) {
  const headers: Array<keyof CitationReadinessQueueRow> = [
    'priority',
    'entityType',
    'entityId',
    'fieldPath',
    'currentReadiness',
    'blockingReason',
    'currentSource',
    'currentUrl',
    'localPath',
    'suggestedAction',
    'publicSurface',
    'usedInReport',
    'notes',
  ]

  return [
    headers.join(','),
    ...rows.map(row => headers.map(header => escapeCsv(row[header])).join(',')),
  ].join('\n') + '\n'
}
