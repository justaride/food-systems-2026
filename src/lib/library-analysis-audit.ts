import {
  LIBRARY_ANALYSIS_STATUSES,
  LIBRARY_ANALYSIS_USAGE_RULES,
  summarizeLibraryAnalysisRecords,
} from './library-analysis'

export type AuditLibraryAnalysisArtifactsInput = {
  ledgerContent: string
  summaryContent: string
  repairBacklogJsonContent?: string
  repairBacklogMarkdownContent?: string
  pdfExtractionProfileJsonContent?: string
  pdfExtractionProfileMarkdownContent?: string
  pdfTextRepairPlanJsonContent?: string
  pdfTextRepairPlanMarkdownContent?: string
  localTextRepairPlanJsonContent?: string
  localTextRepairPlanMarkdownContent?: string
  manualLocalMatchRepairPlanJsonContent?: string
  manualLocalMatchRepairPlanMarkdownContent?: string
  manualPdfMatchRepairPlanJsonContent?: string
  manualPdfMatchRepairPlanMarkdownContent?: string
  manualUrlMatchRepairPlanJsonContent?: string
  manualUrlMatchRepairPlanMarkdownContent?: string
  locatorProfileJsonContent?: string
  locatorProfileMarkdownContent?: string
  urlTextExtractionProfileJsonContent?: string
  urlTextExtractionProfileMarkdownContent?: string
  urlTextRepairPlanJsonContent?: string
  urlTextRepairPlanMarkdownContent?: string
  decisionQueueJsonContent?: string
  decisionQueueMarkdownContent?: string
  localFileExists: (path: string | null | undefined) => boolean
}

const statusSet = new Set<string>(LIBRARY_ANALYSIS_STATUSES)
const usageRuleSet = new Set<string>(LIBRARY_ANALYSIS_USAGE_RULES)

export function auditLibraryAnalysisArtifacts(input: AuditLibraryAnalysisArtifactsInput): string[] {
  const failures: string[] = []
  const rows = parseLedgerRows(input.ledgerContent, failures)
  auditLedgerRows(rows, input.localFileExists, failures)
  auditSummary(input.summaryContent, rows, failures)
  auditRepairBacklog(input.repairBacklogJsonContent, input.repairBacklogMarkdownContent, failures)
  auditPdfExtractionProfile(
    input.pdfExtractionProfileJsonContent,
    input.pdfExtractionProfileMarkdownContent,
    failures,
  )
  auditPdfTextRepairPlan(
    input.pdfTextRepairPlanJsonContent,
    input.pdfTextRepairPlanMarkdownContent,
    failures,
  )
  auditLocalTextRepairPlan(
    input.localTextRepairPlanJsonContent,
    input.localTextRepairPlanMarkdownContent,
    failures,
  )
  auditManualLocalMatchRepairPlan(
    input.manualLocalMatchRepairPlanJsonContent,
    input.manualLocalMatchRepairPlanMarkdownContent,
    failures,
  )
  auditManualPdfMatchRepairPlan(
    input.manualPdfMatchRepairPlanJsonContent,
    input.manualPdfMatchRepairPlanMarkdownContent,
    failures,
  )
  auditManualUrlMatchRepairPlan(
    input.manualUrlMatchRepairPlanJsonContent,
    input.manualUrlMatchRepairPlanMarkdownContent,
    failures,
  )
  auditLocatorProfile(
    input.locatorProfileJsonContent,
    input.locatorProfileMarkdownContent,
    failures,
  )
  auditUrlTextExtractionProfile(
    input.urlTextExtractionProfileJsonContent,
    input.urlTextExtractionProfileMarkdownContent,
    failures,
  )
  auditUrlTextRepairPlan(
    input.urlTextRepairPlanJsonContent,
    input.urlTextRepairPlanMarkdownContent,
    failures,
  )
  auditDecisionQueue(
    input.decisionQueueJsonContent,
    input.decisionQueueMarkdownContent,
    failures,
  )
  return failures
}

function parseLedgerRows(
  ledgerContent: string,
  failures: string[],
): Record<string, unknown>[] {
  const rows: Record<string, unknown>[] = []
  const lines = ledgerContent.split('\n').filter(Boolean)
  if (lines.length === 0) failures.push('ledger has no rows')

  for (const [index, line] of lines.entries()) {
    const lineNumber = index + 1
    try {
      rows.push(JSON.parse(line) as Record<string, unknown>)
    } catch {
      failures.push(`line ${lineNumber}: invalid JSON`)
    }
  }

  return rows
}

function auditLedgerRows(
  rows: Record<string, unknown>[],
  localFileExists: (path: string | null | undefined) => boolean,
  failures: string[],
) {
  const seen = new Set<string>()

  for (const [index, row] of rows.entries()) {
    const lineNumber = index + 1
    const sourceKey = stringValue(row.sourceKey)
    const status = stringValue(row.status)
    const usageRule = stringValue(row.usageRule)
    const canonicalPath = stringValue(row.canonicalPath)
    const riskFlags = stringArray(row.riskFlags)
    const claimCandidateCount = numberValue(row.claimCandidateCount)

    if (!sourceKey) failures.push(`line ${lineNumber}: missing sourceKey`)
    if (sourceKey && seen.has(sourceKey)) failures.push(`line ${lineNumber}: duplicate sourceKey ${sourceKey}`)
    if (sourceKey) seen.add(sourceKey)
    if (!statusSet.has(status)) failures.push(`line ${lineNumber}: unknown status ${status}`)
    if (!usageRuleSet.has(usageRule)) failures.push(`line ${lineNumber}: unknown usageRule ${usageRule}`)
    if (!Array.isArray(row.riskFlags)) failures.push(`line ${lineNumber}: riskFlags must be an array`)
    if (claimCandidateCount !== 0 && usageRule !== 'claim_candidate_review') {
      failures.push(`line ${lineNumber}: claim candidates must use claim_candidate_review`)
    }
    const requiresResolvedCanonicalPath =
      status === 'approved_internal' ||
      usageRule === 'safe_for_ai_context'
    if (canonicalPath && requiresResolvedCanonicalPath && !localFileExists(canonicalPath)) {
      failures.push(`line ${lineNumber}: unresolved canonicalPath ${canonicalPath}`)
    }
    if ((status === 'approved_internal' || usageRule === 'safe_for_ai_context') && riskFlags.length > 0) {
      failures.push(`line ${lineNumber}: approved internal rows must not carry risk flags`)
    }
  }
}

function auditSummary(
  summaryContent: string,
  rows: Record<string, unknown>[],
  failures: string[],
) {
  if (!summaryContent.trim()) {
    failures.push('summary is empty')
    return
  }

  const computed = summarizeLibraryAnalysisRecords(rows.map(row => ({
    status: stringValue(row.status),
    usageRule: stringValue(row.usageRule),
    claimCandidateCount: numberValue(row.claimCandidateCount),
    riskFlags: stringArray(row.riskFlags),
  })))

  const expectedMetrics: [string, number][] = [
    ['Total sources', computed.total],
    ['Finished internal', computed.finished],
    ['Review queue', computed.reviewRequired],
    ['Blocked', computed.blocked],
    ['Type-B actor gates', computed.typeB],
    ['Type-C gaps', computed.typeC],
    ['Claim candidates', computed.claimCandidates],
    ['Missing text', computed.missingText],
  ]

  for (const [label, expected] of expectedMetrics) {
    const actual = summaryMetric(summaryContent, label)
    if (actual === null) {
      failures.push(`summary missing metric ${label}`)
    } else if (actual !== expected) {
      failures.push(`summary ${label} is ${actual} but ledger computes ${expected}`)
    }
  }
}

function auditRepairBacklog(
  repairBacklogJsonContent: string | undefined,
  repairBacklogMarkdownContent: string | undefined,
  failures: string[],
) {
  if (repairBacklogJsonContent === undefined && repairBacklogMarkdownContent === undefined) return
  if (repairBacklogJsonContent === undefined) {
    failures.push('missing repair backlog JSON')
    return
  }
  if (repairBacklogMarkdownContent === undefined) {
    failures.push('missing repair backlog markdown')
    return
  }

  const backlog = parseJsonObject(repairBacklogJsonContent, 'repair backlog JSON', failures)
  if (!backlog) return

  const rows = arrayValue(backlog.rows)
  if (!rows) {
    failures.push('repair backlog rows must be an array')
    return
  }

  const total = numberValue(backlog.total)
  if (total !== rows.length) {
    failures.push(`repair backlog total is ${total} but rows compute ${rows.length}`)
  }

  const byRepairKind = countByField(rows, 'repairKind')
  const byRepairBatch = countByField(rows, 'repairBatch')
  const summary = objectValue(backlog.summary)

  compareCountMap(
    'repair backlog byRepairKind',
    numberRecordValue(summary?.byRepairKind),
    byRepairKind,
    failures,
  )
  compareCountMap(
    'repair backlog byRepairBatch',
    numberRecordValue(summary?.byRepairBatch),
    byRepairBatch,
    failures,
  )

  const markdownTotal = summaryMetric(repairBacklogMarkdownContent, 'Total repair rows')
  if (markdownTotal === null) {
    failures.push('repair backlog markdown missing metric Total repair rows')
  } else if (markdownTotal !== rows.length) {
    failures.push(`repair backlog markdown Total repair rows is ${markdownTotal} but rows compute ${rows.length}`)
  }

  compareMarkdownCounts(
    'repair backlog markdown byRepairKind',
    repairBacklogMarkdownContent,
    byRepairKind,
    failures,
  )
  compareMarkdownCounts(
    'repair backlog markdown byRepairBatch',
    repairBacklogMarkdownContent,
    byRepairBatch,
    failures,
  )
}

function auditPdfExtractionProfile(
  pdfExtractionProfileJsonContent: string | undefined,
  pdfExtractionProfileMarkdownContent: string | undefined,
  failures: string[],
) {
  if (pdfExtractionProfileJsonContent === undefined && pdfExtractionProfileMarkdownContent === undefined) return
  if (pdfExtractionProfileJsonContent === undefined) {
    failures.push('missing PDF extraction profile JSON')
    return
  }
  if (pdfExtractionProfileMarkdownContent === undefined) {
    failures.push('missing PDF extraction profile markdown')
    return
  }

  const profile = parseJsonObject(pdfExtractionProfileJsonContent, 'PDF extraction profile JSON', failures)
  if (!profile) return

  const rows = arrayValue(profile.rows)
  if (!rows) {
    failures.push('PDF extraction profile rows must be an array')
    return
  }

  const total = numberValue(profile.total)
  if (total !== rows.length) {
    failures.push(`PDF extraction profile total is ${total} but rows compute ${rows.length}`)
  }

  const byStatus = countByField(rows, 'status')
  const extractableRows = rows.filter(row => isExtractablePdfStatus(stringValue(row.status))).length
  const mechanicalRepairCandidates = rows.filter(row => isMechanicalPdfRepairStatus(stringValue(row.status))).length
  const summary = objectValue(profile.summary)

  compareCountMap(
    'PDF extraction profile byStatus',
    numberRecordValue(summary?.byStatus),
    byStatus,
    failures,
  )
  compareScalarMetric(
    'PDF extraction profile',
    'Extractable rows',
    numberValue(summary?.extractableRows),
    extractableRows,
    failures,
  )
  compareScalarMetric(
    'PDF extraction profile',
    'Mechanical repair candidates',
    numberValue(summary?.mechanicalRepairCandidates),
    mechanicalRepairCandidates,
    failures,
  )

  const markdownTotal = summaryMetric(pdfExtractionProfileMarkdownContent, 'Total PDF repair rows')
  if (markdownTotal === null) {
    failures.push('PDF extraction profile markdown missing metric Total PDF repair rows')
  } else if (markdownTotal !== rows.length) {
    failures.push(`PDF extraction profile markdown Total PDF repair rows is ${markdownTotal} but rows compute ${rows.length}`)
  }

  compareMarkdownScalarMetric(
    'PDF extraction profile markdown',
    pdfExtractionProfileMarkdownContent,
    'Extractable rows',
    extractableRows,
    failures,
  )
  compareMarkdownScalarMetric(
    'PDF extraction profile markdown',
    pdfExtractionProfileMarkdownContent,
    'Mechanical repair candidates',
    mechanicalRepairCandidates,
    failures,
  )
  compareMarkdownCounts(
    'PDF extraction profile markdown byStatus',
    pdfExtractionProfileMarkdownContent,
    byStatus,
    failures,
  )
}

function auditPdfTextRepairPlan(
  pdfTextRepairPlanJsonContent: string | undefined,
  pdfTextRepairPlanMarkdownContent: string | undefined,
  failures: string[],
) {
  if (pdfTextRepairPlanJsonContent === undefined && pdfTextRepairPlanMarkdownContent === undefined) return
  if (pdfTextRepairPlanJsonContent === undefined) {
    failures.push('missing PDF text repair plan JSON')
    return
  }
  if (pdfTextRepairPlanMarkdownContent === undefined) {
    failures.push('missing PDF text repair plan markdown')
    return
  }

  const plan = parseJsonObject(pdfTextRepairPlanJsonContent, 'PDF text repair plan JSON', failures)
  if (!plan) return

  const rows = arrayValue(plan.rows)
  if (!rows) {
    failures.push('PDF text repair plan rows must be an array')
    return
  }

  const total = numberValue(plan.total)
  if (total !== rows.length) {
    failures.push(`PDF text repair plan total is ${total} but rows compute ${rows.length}`)
  }

  const byAction = countByField(rows, 'action')
  const updateRows = rows.filter(row => stringValue(row.action) === 'update').length
  const totalWordGain = rows.reduce((sum, row) => sum + numberValue(row.wordGain), 0)
  const summary = objectValue(plan.summary)

  compareCountMap(
    'PDF text repair plan byAction',
    numberRecordValue(summary?.byAction),
    byAction,
    failures,
  )
  compareScalarMetric(
    'PDF text repair plan',
    'Update rows',
    numberValue(summary?.updateRows),
    updateRows,
    failures,
  )
  compareScalarMetric(
    'PDF text repair plan',
    'Total word gain',
    numberValue(summary?.totalWordGain),
    totalWordGain,
    failures,
  )

  const markdownTotal = summaryMetric(pdfTextRepairPlanMarkdownContent, 'Total rows')
  if (markdownTotal === null) {
    failures.push('PDF text repair plan markdown missing metric Total rows')
  } else if (markdownTotal !== rows.length) {
    failures.push(`PDF text repair plan markdown Total rows is ${markdownTotal} but rows compute ${rows.length}`)
  }
  compareMarkdownScalarMetric(
    'PDF text repair plan markdown',
    pdfTextRepairPlanMarkdownContent,
    'Update rows',
    updateRows,
    failures,
  )
  compareMarkdownScalarMetric(
    'PDF text repair plan markdown',
    pdfTextRepairPlanMarkdownContent,
    'Total word gain',
    totalWordGain,
    failures,
  )
  compareMarkdownCounts(
    'PDF text repair plan markdown byAction',
    pdfTextRepairPlanMarkdownContent,
    byAction,
    failures,
  )

  for (const row of rows) {
    const nextContent = stringValue(row.nextContent)
    if (nextContent && !nextContent.startsWith('[omitted')) {
      failures.push(`PDF text repair plan row ${stringValue(row.sourceKey) || '(unknown)'} includes full nextContent`)
    }
  }
}

function auditLocalTextRepairPlan(
  localTextRepairPlanJsonContent: string | undefined,
  localTextRepairPlanMarkdownContent: string | undefined,
  failures: string[],
) {
  if (localTextRepairPlanJsonContent === undefined && localTextRepairPlanMarkdownContent === undefined) return
  if (localTextRepairPlanJsonContent === undefined) {
    failures.push('missing local text repair plan JSON')
    return
  }
  if (localTextRepairPlanMarkdownContent === undefined) {
    failures.push('missing local text repair plan markdown')
    return
  }

  const plan = parseJsonObject(localTextRepairPlanJsonContent, 'local text repair plan JSON', failures)
  if (!plan) return

  const rows = arrayValue(plan.rows)
  if (!rows) {
    failures.push('local text repair plan rows must be an array')
    return
  }

  const total = numberValue(plan.total)
  if (total !== rows.length) {
    failures.push(`local text repair plan total is ${total} but rows compute ${rows.length}`)
  }

  const byAction = countByField(rows, 'action')
  const byRepairBatch = countByField(rows, 'repairBatch')
  const updateRows = rows.filter(row => stringValue(row.action) === 'update').length
  const totalWordGain = rows.reduce((sum, row) => sum + numberValue(row.wordGain), 0)
  const clearsLowTextRows = rows.filter(row => stringValue(row.action) === 'update').length
  const summary = objectValue(plan.summary)

  compareCountMap(
    'local text repair plan byAction',
    numberRecordValue(summary?.byAction),
    byAction,
    failures,
  )
  compareCountMap(
    'local text repair plan byRepairBatch',
    numberRecordValue(summary?.byRepairBatch),
    byRepairBatch,
    failures,
  )
  compareScalarMetric(
    'local text repair plan',
    'Update rows',
    numberValue(summary?.updateRows),
    updateRows,
    failures,
  )
  compareScalarMetric(
    'local text repair plan',
    'Total word gain',
    numberValue(summary?.totalWordGain),
    totalWordGain,
    failures,
  )
  compareScalarMetric(
    'local text repair plan',
    'Clears low-text rows',
    numberValue(summary?.clearsLowTextRows),
    clearsLowTextRows,
    failures,
  )

  const markdownTotal = summaryMetric(localTextRepairPlanMarkdownContent, 'Total rows')
  if (markdownTotal === null) {
    failures.push('local text repair plan markdown missing metric Total rows')
  } else if (markdownTotal !== rows.length) {
    failures.push(`local text repair plan markdown Total rows is ${markdownTotal} but rows compute ${rows.length}`)
  }
  compareMarkdownScalarMetric(
    'local text repair plan markdown',
    localTextRepairPlanMarkdownContent,
    'Update rows',
    updateRows,
    failures,
  )
  compareMarkdownScalarMetric(
    'local text repair plan markdown',
    localTextRepairPlanMarkdownContent,
    'Total word gain',
    totalWordGain,
    failures,
  )
  compareMarkdownScalarMetric(
    'local text repair plan markdown',
    localTextRepairPlanMarkdownContent,
    'Clears low-text rows',
    clearsLowTextRows,
    failures,
  )
  compareMarkdownCounts(
    'local text repair plan markdown byAction',
    localTextRepairPlanMarkdownContent,
    byAction,
    failures,
  )
  compareMarkdownCounts(
    'local text repair plan markdown byRepairBatch',
    localTextRepairPlanMarkdownContent,
    byRepairBatch,
    failures,
  )

  for (const row of rows) {
    const nextContent = stringValue(row.nextContent)
    if (nextContent && !nextContent.startsWith('[omitted')) {
      failures.push(`local text repair plan row ${stringValue(row.sourceKey) || '(unknown)'} includes full nextContent`)
    }
  }
}

function auditManualLocalMatchRepairPlan(
  manualLocalMatchRepairPlanJsonContent: string | undefined,
  manualLocalMatchRepairPlanMarkdownContent: string | undefined,
  failures: string[],
) {
  if (manualLocalMatchRepairPlanJsonContent === undefined && manualLocalMatchRepairPlanMarkdownContent === undefined) return
  if (manualLocalMatchRepairPlanJsonContent === undefined) {
    failures.push('missing manual local match repair plan JSON')
    return
  }
  if (manualLocalMatchRepairPlanMarkdownContent === undefined) {
    failures.push('missing manual local match repair plan markdown')
    return
  }

  const plan = parseJsonObject(
    manualLocalMatchRepairPlanJsonContent,
    'manual local match repair plan JSON',
    failures,
  )
  if (!plan) return

  const rows = arrayValue(plan.rows)
  if (!rows) {
    failures.push('manual local match repair plan rows must be an array')
    return
  }

  const total = numberValue(plan.total)
  if (total !== rows.length) {
    failures.push(`manual local match repair plan total is ${total} but rows compute ${rows.length}`)
  }

  const byAction = countByField(rows, 'action')
  const updateRows = rows.filter(row => stringValue(row.action) === 'update').length
  const totalWordGain = rows.reduce((sum, row) => sum + numberValue(row.wordGain), 0)
  const clearsLowTextRows = updateRows
  const summary = objectValue(plan.summary)

  compareCountMap(
    'manual local match repair plan byAction',
    numberRecordValue(summary?.byAction),
    byAction,
    failures,
  )
  compareScalarMetric(
    'manual local match repair plan',
    'Update rows',
    numberValue(summary?.updateRows),
    updateRows,
    failures,
  )
  compareScalarMetric(
    'manual local match repair plan',
    'Total word gain',
    numberValue(summary?.totalWordGain),
    totalWordGain,
    failures,
  )
  compareScalarMetric(
    'manual local match repair plan',
    'Clears low-text rows',
    numberValue(summary?.clearsLowTextRows),
    clearsLowTextRows,
    failures,
  )

  const markdownTotal = summaryMetric(manualLocalMatchRepairPlanMarkdownContent, 'Total rows')
  if (markdownTotal === null) {
    failures.push('manual local match repair plan markdown missing metric Total rows')
  } else if (markdownTotal !== rows.length) {
    failures.push(`manual local match repair plan markdown Total rows is ${markdownTotal} but rows compute ${rows.length}`)
  }
  compareMarkdownScalarMetric(
    'manual local match repair plan markdown',
    manualLocalMatchRepairPlanMarkdownContent,
    'Update rows',
    updateRows,
    failures,
  )
  compareMarkdownScalarMetric(
    'manual local match repair plan markdown',
    manualLocalMatchRepairPlanMarkdownContent,
    'Total word gain',
    totalWordGain,
    failures,
  )
  compareMarkdownScalarMetric(
    'manual local match repair plan markdown',
    manualLocalMatchRepairPlanMarkdownContent,
    'Clears low-text rows',
    clearsLowTextRows,
    failures,
  )
  compareMarkdownCounts(
    'manual local match repair plan markdown byAction',
    manualLocalMatchRepairPlanMarkdownContent,
    byAction,
    failures,
  )

  for (const row of rows) {
    const nextContent = stringValue(row.nextContent)
    if (nextContent && !nextContent.startsWith('[omitted')) {
      failures.push(`manual local match repair plan row ${stringValue(row.sourceKey) || '(unknown)'} includes full nextContent`)
    }
  }
}

function auditManualPdfMatchRepairPlan(
  manualPdfMatchRepairPlanJsonContent: string | undefined,
  manualPdfMatchRepairPlanMarkdownContent: string | undefined,
  failures: string[],
) {
  if (manualPdfMatchRepairPlanJsonContent === undefined && manualPdfMatchRepairPlanMarkdownContent === undefined) return
  if (manualPdfMatchRepairPlanJsonContent === undefined) {
    failures.push('missing manual PDF match repair plan JSON')
    return
  }
  if (manualPdfMatchRepairPlanMarkdownContent === undefined) {
    failures.push('missing manual PDF match repair plan markdown')
    return
  }

  const plan = parseJsonObject(
    manualPdfMatchRepairPlanJsonContent,
    'manual PDF match repair plan JSON',
    failures,
  )
  if (!plan) return

  const rows = arrayValue(plan.rows)
  if (!rows) {
    failures.push('manual PDF match repair plan rows must be an array')
    return
  }

  const total = numberValue(plan.total)
  if (total !== rows.length) {
    failures.push(`manual PDF match repair plan total is ${total} but rows compute ${rows.length}`)
  }

  const byAction = countByField(rows, 'action')
  const updateRows = rows.filter(row => stringValue(row.action) === 'update').length
  const totalWordGain = rows.reduce((sum, row) => sum + numberValue(row.wordGain), 0)
  const clearsLowTextRows = updateRows
  const summary = objectValue(plan.summary)

  compareCountMap(
    'manual PDF match repair plan byAction',
    numberRecordValue(summary?.byAction),
    byAction,
    failures,
  )
  compareScalarMetric(
    'manual PDF match repair plan',
    'Update rows',
    numberValue(summary?.updateRows),
    updateRows,
    failures,
  )
  compareScalarMetric(
    'manual PDF match repair plan',
    'Total word gain',
    numberValue(summary?.totalWordGain),
    totalWordGain,
    failures,
  )
  compareScalarMetric(
    'manual PDF match repair plan',
    'Clears low-text rows',
    numberValue(summary?.clearsLowTextRows),
    clearsLowTextRows,
    failures,
  )

  const markdownTotal = summaryMetric(manualPdfMatchRepairPlanMarkdownContent, 'Total rows')
  if (markdownTotal === null) {
    failures.push('manual PDF match repair plan markdown missing metric Total rows')
  } else if (markdownTotal !== rows.length) {
    failures.push(`manual PDF match repair plan markdown Total rows is ${markdownTotal} but rows compute ${rows.length}`)
  }
  compareMarkdownScalarMetric(
    'manual PDF match repair plan markdown',
    manualPdfMatchRepairPlanMarkdownContent,
    'Update rows',
    updateRows,
    failures,
  )
  compareMarkdownScalarMetric(
    'manual PDF match repair plan markdown',
    manualPdfMatchRepairPlanMarkdownContent,
    'Total word gain',
    totalWordGain,
    failures,
  )
  compareMarkdownScalarMetric(
    'manual PDF match repair plan markdown',
    manualPdfMatchRepairPlanMarkdownContent,
    'Clears low-text rows',
    clearsLowTextRows,
    failures,
  )
  compareMarkdownCounts(
    'manual PDF match repair plan markdown byAction',
    manualPdfMatchRepairPlanMarkdownContent,
    byAction,
    failures,
  )

  for (const row of rows) {
    const nextContent = stringValue(row.nextContent)
    if (nextContent && !nextContent.startsWith('[omitted')) {
      failures.push(`manual PDF match repair plan row ${stringValue(row.sourceKey) || '(unknown)'} includes full nextContent`)
    }
  }
}

function auditManualUrlMatchRepairPlan(
  manualUrlMatchRepairPlanJsonContent: string | undefined,
  manualUrlMatchRepairPlanMarkdownContent: string | undefined,
  failures: string[],
) {
  if (manualUrlMatchRepairPlanJsonContent === undefined && manualUrlMatchRepairPlanMarkdownContent === undefined) return
  if (manualUrlMatchRepairPlanJsonContent === undefined) {
    failures.push('missing manual URL match repair plan JSON')
    return
  }
  if (manualUrlMatchRepairPlanMarkdownContent === undefined) {
    failures.push('missing manual URL match repair plan markdown')
    return
  }

  const plan = parseJsonObject(
    manualUrlMatchRepairPlanJsonContent,
    'manual URL match repair plan JSON',
    failures,
  )
  if (!plan) return

  const rows = arrayValue(plan.rows)
  if (!rows) {
    failures.push('manual URL match repair plan rows must be an array')
    return
  }

  const total = numberValue(plan.total)
  if (total !== rows.length) {
    failures.push(`manual URL match repair plan total is ${total} but rows compute ${rows.length}`)
  }

  const byAction = countByField(rows, 'action')
  const updateRows = rows.filter(row => stringValue(row.action) === 'update').length
  const totalWordGain = rows.reduce((sum, row) => sum + numberValue(row.wordGain), 0)
  const clearsLowTextRows = updateRows
  const summary = objectValue(plan.summary)

  compareCountMap(
    'manual URL match repair plan byAction',
    numberRecordValue(summary?.byAction),
    byAction,
    failures,
  )
  compareScalarMetric(
    'manual URL match repair plan',
    'Update rows',
    numberValue(summary?.updateRows),
    updateRows,
    failures,
  )
  compareScalarMetric(
    'manual URL match repair plan',
    'Total word gain',
    numberValue(summary?.totalWordGain),
    totalWordGain,
    failures,
  )
  compareScalarMetric(
    'manual URL match repair plan',
    'Clears low-text rows',
    numberValue(summary?.clearsLowTextRows),
    clearsLowTextRows,
    failures,
  )

  const markdownTotal = summaryMetric(manualUrlMatchRepairPlanMarkdownContent, 'Total rows')
  if (markdownTotal === null) {
    failures.push('manual URL match repair plan markdown missing metric Total rows')
  } else if (markdownTotal !== rows.length) {
    failures.push(`manual URL match repair plan markdown Total rows is ${markdownTotal} but rows compute ${rows.length}`)
  }
  compareMarkdownScalarMetric(
    'manual URL match repair plan markdown',
    manualUrlMatchRepairPlanMarkdownContent,
    'Update rows',
    updateRows,
    failures,
  )
  compareMarkdownScalarMetric(
    'manual URL match repair plan markdown',
    manualUrlMatchRepairPlanMarkdownContent,
    'Total word gain',
    totalWordGain,
    failures,
  )
  compareMarkdownScalarMetric(
    'manual URL match repair plan markdown',
    manualUrlMatchRepairPlanMarkdownContent,
    'Clears low-text rows',
    clearsLowTextRows,
    failures,
  )
  compareMarkdownCounts(
    'manual URL match repair plan markdown byAction',
    manualUrlMatchRepairPlanMarkdownContent,
    byAction,
    failures,
  )

  for (const row of rows) {
    const nextContent = stringValue(row.nextContent)
    if (nextContent && !nextContent.startsWith('[omitted')) {
      failures.push(`manual URL match repair plan row ${stringValue(row.sourceKey) || '(unknown)'} includes full nextContent`)
    }
  }
}

function auditLocatorProfile(
  locatorProfileJsonContent: string | undefined,
  locatorProfileMarkdownContent: string | undefined,
  failures: string[],
) {
  if (locatorProfileJsonContent === undefined && locatorProfileMarkdownContent === undefined) return
  if (locatorProfileJsonContent === undefined) {
    failures.push('missing locator profile JSON')
    return
  }
  if (locatorProfileMarkdownContent === undefined) {
    failures.push('missing locator profile markdown')
    return
  }

  const profile = parseJsonObject(locatorProfileJsonContent, 'locator profile JSON', failures)
  if (!profile) return

  const rows = arrayValue(profile.rows)
  if (!rows) {
    failures.push('locator profile rows must be an array')
    return
  }

  const total = numberValue(profile.total)
  if (total !== rows.length) {
    failures.push(`locator profile total is ${total} but rows compute ${rows.length}`)
  }

  const byLocatorStatus = countByField(rows, 'locatorStatus')
  const byRepairBatch = countByField(rows, 'repairBatch')
  const byLocatorSignal = countArrayField(rows, 'locatorSignals')
  const rowsWithExternalLocator = rows.filter(row => stringArray(row.locatorSignals).some(isExternalLocatorSignal)).length
  const localMatchCandidates = rows.filter(row => stringValue(row.locatorStatus) === 'local_match_candidate').length
  const trueLocatorGaps = rows.filter(row => stringValue(row.locatorStatus) === 'locator_missing').length
  const summary = objectValue(profile.summary)

  compareCountMap(
    'locator profile byLocatorStatus',
    numberRecordValue(summary?.byLocatorStatus),
    byLocatorStatus,
    failures,
  )
  compareCountMap(
    'locator profile byRepairBatch',
    numberRecordValue(summary?.byRepairBatch),
    byRepairBatch,
    failures,
  )
  compareCountMap(
    'locator profile byLocatorSignal',
    numberRecordValue(summary?.byLocatorSignal),
    byLocatorSignal,
    failures,
  )
  compareScalarMetric(
    'locator profile',
    'Rows with external locator',
    numberValue(summary?.rowsWithExternalLocator),
    rowsWithExternalLocator,
    failures,
  )
  compareScalarMetric(
    'locator profile',
    'Local match candidates',
    numberValue(summary?.localMatchCandidates),
    localMatchCandidates,
    failures,
  )
  compareScalarMetric(
    'locator profile',
    'True locator gaps',
    numberValue(summary?.trueLocatorGaps),
    trueLocatorGaps,
    failures,
  )

  const markdownTotal = summaryMetric(locatorProfileMarkdownContent, 'Total rows')
  if (markdownTotal === null) {
    failures.push('locator profile markdown missing metric Total rows')
  } else if (markdownTotal !== rows.length) {
    failures.push(`locator profile markdown Total rows is ${markdownTotal} but rows compute ${rows.length}`)
  }
  compareMarkdownScalarMetric(
    'locator profile markdown',
    locatorProfileMarkdownContent,
    'Rows with external locator',
    rowsWithExternalLocator,
    failures,
  )
  compareMarkdownScalarMetric(
    'locator profile markdown',
    locatorProfileMarkdownContent,
    'Local match candidates',
    localMatchCandidates,
    failures,
  )
  compareMarkdownScalarMetric(
    'locator profile markdown',
    locatorProfileMarkdownContent,
    'True locator gaps',
    trueLocatorGaps,
    failures,
  )
  compareMarkdownCounts(
    'locator profile markdown byLocatorStatus',
    locatorProfileMarkdownContent,
    byLocatorStatus,
    failures,
  )
  compareMarkdownCounts(
    'locator profile markdown byRepairBatch',
    locatorProfileMarkdownContent,
    byRepairBatch,
    failures,
  )
  compareMarkdownCounts(
    'locator profile markdown byLocatorSignal',
    locatorProfileMarkdownContent,
    byLocatorSignal,
    failures,
  )
}

function auditUrlTextExtractionProfile(
  urlTextExtractionProfileJsonContent: string | undefined,
  urlTextExtractionProfileMarkdownContent: string | undefined,
  failures: string[],
) {
  if (urlTextExtractionProfileJsonContent === undefined && urlTextExtractionProfileMarkdownContent === undefined) return
  if (urlTextExtractionProfileJsonContent === undefined) {
    failures.push('missing URL text extraction profile JSON')
    return
  }
  if (urlTextExtractionProfileMarkdownContent === undefined) {
    failures.push('missing URL text extraction profile markdown')
    return
  }

  const profile = parseJsonObject(
    urlTextExtractionProfileJsonContent,
    'URL text extraction profile JSON',
    failures,
  )
  if (!profile) return

  const rows = arrayValue(profile.rows)
  if (!rows) {
    failures.push('URL text extraction profile rows must be an array')
    return
  }

  const total = numberValue(profile.total)
  if (total !== rows.length) {
    failures.push(`URL text extraction profile total is ${total} but rows compute ${rows.length}`)
  }

  const byStatus = countByField(rows, 'status')
  const byContentKind = countByField(rows, 'contentKind')
  const byRepairBatch = countByField(rows, 'repairBatch')
  const extractableRows = rows.filter(row => isExtractableUrlTextStatus(stringValue(row.status))).length
  const mechanicalRepairCandidates = rows.filter(row => (
    isExtractableUrlTextStatus(stringValue(row.status)) && numberValue(row.wordGain) > 0
  )).length
  const totalExtractedWords = rows.reduce((sum, row) => sum + numberValue(row.extractedWordCount), 0)
  const summary = objectValue(profile.summary)

  compareCountMap(
    'URL text extraction profile byStatus',
    numberRecordValue(summary?.byStatus),
    byStatus,
    failures,
  )
  compareCountMap(
    'URL text extraction profile byContentKind',
    numberRecordValue(summary?.byContentKind),
    byContentKind,
    failures,
  )
  compareCountMap(
    'URL text extraction profile byRepairBatch',
    numberRecordValue(summary?.byRepairBatch),
    byRepairBatch,
    failures,
  )
  compareScalarMetric(
    'URL text extraction profile',
    'Extractable rows',
    numberValue(summary?.extractableRows),
    extractableRows,
    failures,
  )
  compareScalarMetric(
    'URL text extraction profile',
    'Mechanical repair candidates',
    numberValue(summary?.mechanicalRepairCandidates),
    mechanicalRepairCandidates,
    failures,
  )
  compareScalarMetric(
    'URL text extraction profile',
    'Total extracted words',
    numberValue(summary?.totalExtractedWords),
    totalExtractedWords,
    failures,
  )

  const markdownTotal = summaryMetric(urlTextExtractionProfileMarkdownContent, 'Total rows')
  if (markdownTotal === null) {
    failures.push('URL text extraction profile markdown missing metric Total rows')
  } else if (markdownTotal !== rows.length) {
    failures.push(`URL text extraction profile markdown Total rows is ${markdownTotal} but rows compute ${rows.length}`)
  }
  compareMarkdownScalarMetric(
    'URL text extraction profile markdown',
    urlTextExtractionProfileMarkdownContent,
    'Extractable rows',
    extractableRows,
    failures,
  )
  compareMarkdownScalarMetric(
    'URL text extraction profile markdown',
    urlTextExtractionProfileMarkdownContent,
    'Mechanical repair candidates',
    mechanicalRepairCandidates,
    failures,
  )
  compareMarkdownScalarMetric(
    'URL text extraction profile markdown',
    urlTextExtractionProfileMarkdownContent,
    'Total extracted words',
    totalExtractedWords,
    failures,
  )
  compareMarkdownCounts(
    'URL text extraction profile markdown byStatus',
    urlTextExtractionProfileMarkdownContent,
    byStatus,
    failures,
  )
  compareMarkdownCounts(
    'URL text extraction profile markdown byContentKind',
    urlTextExtractionProfileMarkdownContent,
    byContentKind,
    failures,
  )
  compareMarkdownCounts(
    'URL text extraction profile markdown byRepairBatch',
    urlTextExtractionProfileMarkdownContent,
    byRepairBatch,
    failures,
  )
}

function auditUrlTextRepairPlan(
  urlTextRepairPlanJsonContent: string | undefined,
  urlTextRepairPlanMarkdownContent: string | undefined,
  failures: string[],
) {
  if (urlTextRepairPlanJsonContent === undefined && urlTextRepairPlanMarkdownContent === undefined) return
  if (urlTextRepairPlanJsonContent === undefined) {
    failures.push('missing URL text repair plan JSON')
    return
  }
  if (urlTextRepairPlanMarkdownContent === undefined) {
    failures.push('missing URL text repair plan markdown')
    return
  }

  const plan = parseJsonObject(urlTextRepairPlanJsonContent, 'URL text repair plan JSON', failures)
  if (!plan) return

  const rows = arrayValue(plan.rows)
  if (!rows) {
    failures.push('URL text repair plan rows must be an array')
    return
  }

  const total = numberValue(plan.total)
  if (total !== rows.length) {
    failures.push(`URL text repair plan total is ${total} but rows compute ${rows.length}`)
  }

  const byAction = countByField(rows, 'action')
  const byContentKind = countByField(rows, 'contentKind')
  const byRepairBatch = countByField(rows, 'repairBatch')
  const updateRows = rows.filter(row => stringValue(row.action) === 'update').length
  const totalWordGain = rows.reduce((sum, row) => sum + numberValue(row.wordGain), 0)
  const clearsLowTextRows = rows.filter(row => stringValue(row.action) === 'update').length
  const summary = objectValue(plan.summary)

  compareCountMap(
    'URL text repair plan byAction',
    numberRecordValue(summary?.byAction),
    byAction,
    failures,
  )
  compareCountMap(
    'URL text repair plan byContentKind',
    numberRecordValue(summary?.byContentKind),
    byContentKind,
    failures,
  )
  compareCountMap(
    'URL text repair plan byRepairBatch',
    numberRecordValue(summary?.byRepairBatch),
    byRepairBatch,
    failures,
  )
  compareScalarMetric(
    'URL text repair plan',
    'Update rows',
    numberValue(summary?.updateRows),
    updateRows,
    failures,
  )
  compareScalarMetric(
    'URL text repair plan',
    'Total word gain',
    numberValue(summary?.totalWordGain),
    totalWordGain,
    failures,
  )
  compareScalarMetric(
    'URL text repair plan',
    'Clears low-text rows',
    numberValue(summary?.clearsLowTextRows),
    clearsLowTextRows,
    failures,
  )

  const markdownTotal = summaryMetric(urlTextRepairPlanMarkdownContent, 'Total rows')
  if (markdownTotal === null) {
    failures.push('URL text repair plan markdown missing metric Total rows')
  } else if (markdownTotal !== rows.length) {
    failures.push(`URL text repair plan markdown Total rows is ${markdownTotal} but rows compute ${rows.length}`)
  }
  compareMarkdownScalarMetric(
    'URL text repair plan markdown',
    urlTextRepairPlanMarkdownContent,
    'Update rows',
    updateRows,
    failures,
  )
  compareMarkdownScalarMetric(
    'URL text repair plan markdown',
    urlTextRepairPlanMarkdownContent,
    'Total word gain',
    totalWordGain,
    failures,
  )
  compareMarkdownScalarMetric(
    'URL text repair plan markdown',
    urlTextRepairPlanMarkdownContent,
    'Clears low-text rows',
    clearsLowTextRows,
    failures,
  )
  compareMarkdownCounts(
    'URL text repair plan markdown byAction',
    urlTextRepairPlanMarkdownContent,
    byAction,
    failures,
  )
  compareMarkdownCounts(
    'URL text repair plan markdown byContentKind',
    urlTextRepairPlanMarkdownContent,
    byContentKind,
    failures,
  )
  compareMarkdownCounts(
    'URL text repair plan markdown byRepairBatch',
    urlTextRepairPlanMarkdownContent,
    byRepairBatch,
    failures,
  )

  for (const row of rows) {
    const nextContent = stringValue(row.nextContent)
    if (nextContent && !nextContent.startsWith('[omitted')) {
      failures.push(`URL text repair plan row ${stringValue(row.sourceKey) || '(unknown)'} includes full nextContent`)
    }
  }
}

function auditDecisionQueue(
  decisionQueueJsonContent: string | undefined,
  decisionQueueMarkdownContent: string | undefined,
  failures: string[],
) {
  if (decisionQueueJsonContent === undefined && decisionQueueMarkdownContent === undefined) return
  if (decisionQueueJsonContent === undefined) {
    failures.push('missing decision queue JSON')
    return
  }
  if (decisionQueueMarkdownContent === undefined) {
    failures.push('missing decision queue markdown')
    return
  }

  const queue = parseJsonObject(decisionQueueJsonContent, 'decision queue JSON', failures)
  if (!queue) return

  const rows = arrayValue(queue.rows)
  if (!rows) {
    failures.push('decision queue rows must be an array')
    return
  }

  const total = numberValue(queue.total)
  if (total !== rows.length) {
    failures.push(`decision queue total is ${total} but rows compute ${rows.length}`)
  }

  const byDecisionKind = countByField(rows, 'decisionKind')
  const byDecisionLane = countByField(rows, 'decisionLane')
  const mechanicalUpdateCandidates = rows
    .filter(row => row.mechanicalUpdateCandidate === true)
    .length
  const summary = objectValue(queue.summary)

  compareCountMap(
    'decision queue byDecisionKind',
    numberRecordValue(summary?.byDecisionKind),
    byDecisionKind,
    failures,
  )
  compareCountMap(
    'decision queue byDecisionLane',
    numberRecordValue(summary?.byDecisionLane),
    byDecisionLane,
    failures,
  )
  compareScalarMetric(
    'decision queue',
    'Mechanical update candidates',
    numberValue(summary?.mechanicalUpdateCandidates),
    mechanicalUpdateCandidates,
    failures,
  )

  const markdownTotal = summaryMetric(decisionQueueMarkdownContent, 'Total decision rows')
  if (markdownTotal === null) {
    failures.push('decision queue markdown missing metric Total decision rows')
  } else if (markdownTotal !== rows.length) {
    failures.push(`decision queue markdown Total decision rows is ${markdownTotal} but rows compute ${rows.length}`)
  }
  compareMarkdownScalarMetric(
    'decision queue markdown',
    decisionQueueMarkdownContent,
    'Mechanical update candidates',
    mechanicalUpdateCandidates,
    failures,
  )
  compareMarkdownCounts(
    'decision queue markdown byDecisionKind',
    decisionQueueMarkdownContent,
    byDecisionKind,
    failures,
  )
  compareMarkdownCounts(
    'decision queue markdown byDecisionLane',
    decisionQueueMarkdownContent,
    byDecisionLane,
    failures,
  )
}

function summaryMetric(summaryContent: string, label: string): number | null {
  const escapedLabel = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const match = summaryContent.match(new RegExp(`\\|\\s*${escapedLabel}\\s*\\|\\s*(\\d+)\\s*\\|`))
  return match ? Number(match[1]) : null
}

function parseJsonObject(
  content: string,
  label: string,
  failures: string[],
): Record<string, unknown> | null {
  try {
    const parsed = JSON.parse(content) as unknown
    if (!isRecord(parsed)) {
      failures.push(`${label} must be a JSON object`)
      return null
    }
    return parsed
  } catch {
    failures.push(`${label} is invalid JSON`)
    return null
  }
}

function compareMarkdownCounts(
  label: string,
  markdownContent: string,
  expected: Record<string, number>,
  failures: string[],
) {
  const actual: Record<string, number> = {}
  for (const key of Object.keys(expected)) {
    const value = summaryMetric(markdownContent, key)
    if (value !== null) actual[key] = value
  }
  compareCountMap(label, actual, expected, failures)
}

function compareMarkdownScalarMetric(
  label: string,
  markdownContent: string,
  metric: string,
  expected: number,
  failures: string[],
) {
  const actual = summaryMetric(markdownContent, metric)
  if (actual === null) {
    failures.push(`${label} missing metric ${metric}`)
  } else {
    compareScalarMetric(label, metric, actual, expected, failures)
  }
}

function compareScalarMetric(
  label: string,
  metric: string,
  actual: number,
  expected: number,
  failures: string[],
) {
  if (actual !== expected) {
    failures.push(`${label} ${metric} is ${actual} but rows compute ${expected}`)
  }
}

function compareCountMap(
  label: string,
  actual: Record<string, number>,
  expected: Record<string, number>,
  failures: string[],
) {
  const keys = new Set([...Object.keys(actual), ...Object.keys(expected)])
  for (const key of [...keys].sort()) {
    const actualCount = actual[key]
    const expectedCount = expected[key] ?? 0
    if (actualCount === undefined) {
      failures.push(`${label} ${key} is missing but rows compute ${expectedCount}`)
    } else if (actualCount !== expectedCount) {
      failures.push(`${label} ${key} is ${actualCount} but rows compute ${expectedCount}`)
    }
  }
}

function isExtractablePdfStatus(status: string): boolean {
  return status === 'extractable_150_499' || status === 'extractable_500_plus'
}

function isMechanicalPdfRepairStatus(status: string): boolean {
  return isExtractablePdfStatus(status) || status === 'small_gain'
}

function isExtractableUrlTextStatus(status: string): boolean {
  return status === 'extractable_150_499' || status === 'extractable_500_plus'
}

function countByField(rows: Record<string, unknown>[], field: string): Record<string, number> {
  const counts = new Map<string, number>()
  for (const row of rows) {
    const value = stringValue(row[field])
    if (!value) continue
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }
  return Object.fromEntries([...counts.entries()].sort(([a], [b]) => a.localeCompare(b)))
}

function countArrayField(rows: Record<string, unknown>[], field: string): Record<string, number> {
  const counts = new Map<string, number>()
  for (const row of rows) {
    for (const value of stringArray(row[field])) {
      counts.set(value, (counts.get(value) ?? 0) + 1)
    }
  }
  return Object.fromEntries([...counts.entries()].sort(([a], [b]) => a.localeCompare(b)))
}

function isExternalLocatorSignal(signal: string): boolean {
  return signal === 'document_url' ||
    signal === 'document_archived_url' ||
    signal === 'source_doc_url' ||
    signal === 'source_doc_doi' ||
    signal === 'source_doc_archived_url' ||
    signal === 'citation_url'
}

function numberRecordValue(value: unknown): Record<string, number> {
  if (!isRecord(value)) return {}
  return Object.fromEntries(Object.entries(value).filter((entry): entry is [string, number] => typeof entry[1] === 'number'))
}

function objectValue(value: unknown): Record<string, unknown> | null {
  return isRecord(value) ? value : null
}

function arrayValue(value: unknown): Record<string, unknown>[] | null {
  if (!Array.isArray(value)) return null
  return value.filter(isRecord)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function stringValue(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function numberValue(value: unknown): number {
  return typeof value === 'number' ? value : 0
}

function stringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}
