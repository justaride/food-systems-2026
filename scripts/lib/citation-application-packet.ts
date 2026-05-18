import { parseCsvRows } from '../../src/lib/csv'

export type CitationApplicationPacketRow = {
  actionId: string
  entity: string
  entityType: string
  targetRecordIds: string[]
  fieldPaths: string[]
  documentId: string | null
  sourceLocator: string
  dbResolutionStatus: string
  applicationStatus: string
  applyAllowed: string
  recommendedDbChange: string
  citationAction: string
  blockerOrDecision: string
}

export type CitationApplicationIssue = {
  actionId: string
  message: string
}

export type CitationApplicationPreflight = {
  summary: {
    totalRows: number
    blockedRows: number
    conditionalRows: number
    registryQueueRows: number
    appliedRows: number
    acceptedConditionalRows: number
    refusedApprovalRows: number
  }
  acceptedConditional: CitationApplicationPacketRow[]
  unapprovedConditional: CitationApplicationPacketRow[]
  blocked: CitationApplicationPacketRow[]
  registryQueue: CitationApplicationPacketRow[]
  refusedApprovals: Array<{ actionId: string; reason: string }>
  validationIssues: CitationApplicationIssue[]
  hasUnsafeApproval: boolean
}

export type CitationApplicationPreflightOptions = {
  approvedActionIds?: Set<string>
}

const HEADERS = [
  'action_id',
  'entity',
  'entity_type',
  'target_record_ids',
  'field_paths',
  'document_id',
  'source_locator',
  'db_resolution_status',
  'application_status',
  'apply_allowed',
  'recommended_db_change',
  'citation_action',
  'blocker_or_decision',
] as const

const REGISTRY_QUEUE_VALUES = new Set([
  'manual_queue',
  'manual_or_api_queue',
  'manual_or_paid_queue',
])

export function parseCitationApplicationPacketCsv(text: string): CitationApplicationPacketRow[] {
  const [header, ...rows] = parseCsvRows(text)
  if (!header) return []
  assertHeaders(header)

  return rows.map(values => {
    const record = Object.fromEntries(HEADERS.map((key, index) => [key, values[index] ?? '']))

    return {
      actionId: record.action_id.trim(),
      entity: record.entity.trim(),
      entityType: record.entity_type.trim(),
      targetRecordIds: splitList(record.target_record_ids),
      fieldPaths: splitList(record.field_paths),
      documentId: normalizeOptional(record.document_id),
      sourceLocator: record.source_locator.trim(),
      dbResolutionStatus: record.db_resolution_status.trim(),
      applicationStatus: record.application_status.trim(),
      applyAllowed: record.apply_allowed.trim(),
      recommendedDbChange: record.recommended_db_change.trim(),
      citationAction: record.citation_action.trim(),
      blockerOrDecision: record.blocker_or_decision.trim(),
    }
  })
}

export function validateCitationApplicationPacketRows(
  rows: CitationApplicationPacketRow[],
): CitationApplicationIssue[] {
  const issues: CitationApplicationIssue[] = []
  const seen = new Set<string>()

  for (const row of rows) {
    const actionId = row.actionId || '<missing action_id>'
    if (!row.actionId) issues.push({ actionId, message: 'row is missing action_id' })
    if (seen.has(row.actionId)) issues.push({ actionId, message: `${actionId}: duplicate action_id` })
    seen.add(row.actionId)

    if (!row.entity) issues.push({ actionId, message: `${actionId}: row is missing entity` })
    if (!row.entityType) issues.push({ actionId, message: `${actionId}: row is missing entity_type` })
    if (!row.sourceLocator) issues.push({ actionId, message: `${actionId}: row is missing source_locator` })

    if (row.applyAllowed === 'conditional') {
      if (row.targetRecordIds.length === 0) {
        issues.push({ actionId, message: `${actionId}: conditional citation row must have target_record_ids` })
      }
      if (row.fieldPaths.length === 0) {
        issues.push({ actionId, message: `${actionId}: conditional citation row must have field_paths` })
      }
    }

    if (row.entityType === 'Registry' && !REGISTRY_QUEUE_VALUES.has(row.applyAllowed)) {
      issues.push({ actionId, message: `${actionId}: registry row must use a manual queue apply_allowed value` })
    }
  }

  return issues
}

export function buildCitationApplicationPreflight(
  rows: CitationApplicationPacketRow[],
  options: CitationApplicationPreflightOptions = {},
): CitationApplicationPreflight {
  const approvedActionIds = options.approvedActionIds ?? new Set<string>()
  const validationIssues = validateCitationApplicationPacketRows(rows)
  const issuesByActionId = groupIssuesByActionId(validationIssues)
  const rowsByActionId = new Map(rows.map(row => [row.actionId, row]))

  const blocked = rows.filter(row => row.applyAllowed === 'no')
  const registryQueue = rows.filter(row => REGISTRY_QUEUE_VALUES.has(row.applyAllowed))
  const conditional = rows.filter(row => row.applyAllowed === 'conditional')
  const applied = rows.filter(row => row.applyAllowed === 'applied')
  const acceptedConditional = conditional.filter(row =>
    approvedActionIds.has(row.actionId) && !issuesByActionId.has(row.actionId),
  )
  const unapprovedConditional = conditional.filter(row => !approvedActionIds.has(row.actionId))
  const refusedApprovals: Array<{ actionId: string; reason: string }> = []

  for (const actionId of approvedActionIds) {
    const row = rowsByActionId.get(actionId)
    if (!row) {
      refusedApprovals.push({ actionId, reason: 'action_id not found in packet' })
      continue
    }
    if (row.applyAllowed !== 'conditional') {
      refusedApprovals.push({
        actionId,
        reason: `row is not conditionally applyable (apply_allowed=${row.applyAllowed})`,
      })
      continue
    }
    if (issuesByActionId.has(actionId)) {
      refusedApprovals.push({
        actionId,
        reason: issuesByActionId.get(actionId)!.map(issue => issue.message).join('; '),
      })
    }
  }

  return {
    summary: {
      totalRows: rows.length,
      blockedRows: blocked.length,
      conditionalRows: conditional.length,
      registryQueueRows: registryQueue.length,
      appliedRows: applied.length,
      acceptedConditionalRows: acceptedConditional.length,
      refusedApprovalRows: refusedApprovals.length,
    },
    acceptedConditional,
    unapprovedConditional,
    blocked,
    registryQueue,
    refusedApprovals,
    validationIssues,
    hasUnsafeApproval: refusedApprovals.length > 0,
  }
}

export function formatCitationApplicationPreflightReport(preflight: CitationApplicationPreflight): string {
  const lines = [
    'Citation application preflight',
    `Total rows: ${preflight.summary.totalRows}`,
    `Blocked rows: ${preflight.summary.blockedRows}`,
    `Conditional rows: ${preflight.summary.conditionalRows}`,
    `Applied rows: ${preflight.summary.appliedRows}`,
    `Accepted conditional rows: ${preflight.summary.acceptedConditionalRows}`,
    `Registry queue rows: ${preflight.summary.registryQueueRows}`,
    `Refused approvals: ${preflight.summary.refusedApprovalRows}`,
  ]

  if (preflight.validationIssues.length > 0) {
    lines.push('', 'Validation issues:')
    for (const issue of preflight.validationIssues) lines.push(`- ${issue.message}`)
  }

  if (preflight.refusedApprovals.length > 0) {
    lines.push('', 'Refused approvals:')
    for (const item of preflight.refusedApprovals) lines.push(`- ${item.actionId}: ${item.reason}`)
  }

  if (preflight.acceptedConditional.length > 0) {
    lines.push('', 'Accepted conditional rows:')
    for (const row of preflight.acceptedConditional) {
      lines.push(`- ${row.actionId}: ${row.entity} (${row.fieldPaths.join('; ')})`)
    }
  }

  return `${lines.join('\n')}\n`
}

function assertHeaders(header: string[]): void {
  const normalized = header.map(value => value.trim())
  const expected = [...HEADERS]
  if (normalized.length !== expected.length || normalized.some((value, index) => value !== expected[index])) {
    throw new Error(`Unexpected citation application packet headers: ${normalized.join(', ')}`)
  }
}

function splitList(value: string): string[] {
  return value
    .split(';')
    .map(item => item.trim())
    .filter(Boolean)
}

function normalizeOptional(value: string): string | null {
  const normalized = value.trim()
  return normalized ? normalized : null
}

function groupIssuesByActionId(issues: CitationApplicationIssue[]): Map<string, CitationApplicationIssue[]> {
  const grouped = new Map<string, CitationApplicationIssue[]>()
  for (const issue of issues) {
    const existing = grouped.get(issue.actionId) ?? []
    existing.push(issue)
    grouped.set(issue.actionId, existing)
  }
  return grouped
}
