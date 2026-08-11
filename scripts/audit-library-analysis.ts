import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import {
  assessLibraryAnalysisExternalReadiness,
  auditLibraryAnalysisArtifacts,
  type LibraryAnalysisExternalReadiness,
} from '../src/lib/library-analysis-audit'
import {
  LIBRARY_ANALYSIS_PDF_EXTRACTION_PROFILE_JSON_PATH,
  LIBRARY_ANALYSIS_PDF_EXTRACTION_PROFILE_MD_PATH,
} from '../src/lib/library-analysis-pdf-extraction-profile'
import {
  LIBRARY_ANALYSIS_PDF_TEXT_REPAIR_PLAN_JSON_PATH,
  LIBRARY_ANALYSIS_PDF_TEXT_REPAIR_PLAN_MD_PATH,
} from '../src/lib/library-analysis-pdf-text-repair'
import {
  LIBRARY_ANALYSIS_LOCAL_TEXT_REPAIR_PLAN_JSON_PATH,
  LIBRARY_ANALYSIS_LOCAL_TEXT_REPAIR_PLAN_MD_PATH,
} from '../src/lib/library-analysis-local-text-repair'
import {
  LIBRARY_ANALYSIS_MANUAL_LOCAL_MATCH_REPAIR_PLAN_JSON_PATH,
  LIBRARY_ANALYSIS_MANUAL_LOCAL_MATCH_REPAIR_PLAN_MD_PATH,
} from '../src/lib/library-analysis-manual-local-match-repair'
import {
  LIBRARY_ANALYSIS_MANUAL_PDF_MATCH_REPAIR_PLAN_JSON_PATH,
  LIBRARY_ANALYSIS_MANUAL_PDF_MATCH_REPAIR_PLAN_MD_PATH,
} from '../src/lib/library-analysis-manual-pdf-match-repair'
import {
  LIBRARY_ANALYSIS_MANUAL_URL_MATCH_REPAIR_PLAN_JSON_PATH,
  LIBRARY_ANALYSIS_MANUAL_URL_MATCH_REPAIR_PLAN_MD_PATH,
} from '../src/lib/library-analysis-manual-url-match-repair'
import {
  LIBRARY_ANALYSIS_LOCATOR_PROFILE_JSON_PATH,
  LIBRARY_ANALYSIS_LOCATOR_PROFILE_MD_PATH,
} from '../src/lib/library-analysis-locator-profile'
import {
  LIBRARY_ANALYSIS_URL_TEXT_EXTRACTION_PROFILE_JSON_PATH,
  LIBRARY_ANALYSIS_URL_TEXT_EXTRACTION_PROFILE_MD_PATH,
} from '../src/lib/library-analysis-url-text-extraction-profile'
import {
  LIBRARY_ANALYSIS_URL_TEXT_REPAIR_PLAN_JSON_PATH,
  LIBRARY_ANALYSIS_URL_TEXT_REPAIR_PLAN_MD_PATH,
} from '../src/lib/library-analysis-url-text-repair'
import {
  LIBRARY_ANALYSIS_REPAIR_BACKLOG_JSON_PATH,
  LIBRARY_ANALYSIS_REPAIR_BACKLOG_MD_PATH,
} from '../src/lib/library-analysis-repair-backlog'
import {
  LIBRARY_ANALYSIS_DECISION_QUEUE_JSON_PATH,
  LIBRARY_ANALYSIS_DECISION_QUEUE_MD_PATH,
} from '../src/lib/library-analysis-decision-queue'
import { candidateLocalFilePaths } from '../src/lib/local-file-locator'
import { auditLibraryAnalysisLedgerLiveParity } from '../src/lib/library-analysis-processing'
import {
  LIBRARY_ANALYSIS_LEDGER_PATH,
  LIBRARY_ANALYSIS_SUMMARY_PATH,
  loadLibraryAnalysisInventory,
} from './library-analysis-common'

export const LIBRARY_ANALYSIS_EXTERNAL_READINESS_JSON_PATH =
  'research/_status/library-analysis-external-readiness.json'
export const LIBRARY_ANALYSIS_EXTERNAL_READINESS_MD_PATH =
  'research/_status/library-analysis-external-readiness.md'

async function main() {
  const ledgerPath = join(process.cwd(), LIBRARY_ANALYSIS_LEDGER_PATH)
  const summaryPath = join(process.cwd(), LIBRARY_ANALYSIS_SUMMARY_PATH)
  const repairBacklogJsonPath = join(process.cwd(), LIBRARY_ANALYSIS_REPAIR_BACKLOG_JSON_PATH)
  const repairBacklogMarkdownPath = join(process.cwd(), LIBRARY_ANALYSIS_REPAIR_BACKLOG_MD_PATH)
  const pdfExtractionProfileJsonPath = join(process.cwd(), LIBRARY_ANALYSIS_PDF_EXTRACTION_PROFILE_JSON_PATH)
  const pdfExtractionProfileMarkdownPath = join(process.cwd(), LIBRARY_ANALYSIS_PDF_EXTRACTION_PROFILE_MD_PATH)
  const pdfTextRepairPlanJsonPath = join(process.cwd(), LIBRARY_ANALYSIS_PDF_TEXT_REPAIR_PLAN_JSON_PATH)
  const pdfTextRepairPlanMarkdownPath = join(process.cwd(), LIBRARY_ANALYSIS_PDF_TEXT_REPAIR_PLAN_MD_PATH)
  const localTextRepairPlanJsonPath = join(process.cwd(), LIBRARY_ANALYSIS_LOCAL_TEXT_REPAIR_PLAN_JSON_PATH)
  const localTextRepairPlanMarkdownPath = join(process.cwd(), LIBRARY_ANALYSIS_LOCAL_TEXT_REPAIR_PLAN_MD_PATH)
  const manualLocalMatchRepairPlanJsonPath = join(process.cwd(), LIBRARY_ANALYSIS_MANUAL_LOCAL_MATCH_REPAIR_PLAN_JSON_PATH)
  const manualLocalMatchRepairPlanMarkdownPath = join(process.cwd(), LIBRARY_ANALYSIS_MANUAL_LOCAL_MATCH_REPAIR_PLAN_MD_PATH)
  const manualPdfMatchRepairPlanJsonPath = join(process.cwd(), LIBRARY_ANALYSIS_MANUAL_PDF_MATCH_REPAIR_PLAN_JSON_PATH)
  const manualPdfMatchRepairPlanMarkdownPath = join(process.cwd(), LIBRARY_ANALYSIS_MANUAL_PDF_MATCH_REPAIR_PLAN_MD_PATH)
  const manualUrlMatchRepairPlanJsonPath = join(process.cwd(), LIBRARY_ANALYSIS_MANUAL_URL_MATCH_REPAIR_PLAN_JSON_PATH)
  const manualUrlMatchRepairPlanMarkdownPath = join(process.cwd(), LIBRARY_ANALYSIS_MANUAL_URL_MATCH_REPAIR_PLAN_MD_PATH)
  const locatorProfileJsonPath = join(process.cwd(), LIBRARY_ANALYSIS_LOCATOR_PROFILE_JSON_PATH)
  const locatorProfileMarkdownPath = join(process.cwd(), LIBRARY_ANALYSIS_LOCATOR_PROFILE_MD_PATH)
  const urlTextExtractionProfileJsonPath = join(process.cwd(), LIBRARY_ANALYSIS_URL_TEXT_EXTRACTION_PROFILE_JSON_PATH)
  const urlTextExtractionProfileMarkdownPath = join(process.cwd(), LIBRARY_ANALYSIS_URL_TEXT_EXTRACTION_PROFILE_MD_PATH)
  const urlTextRepairPlanJsonPath = join(process.cwd(), LIBRARY_ANALYSIS_URL_TEXT_REPAIR_PLAN_JSON_PATH)
  const urlTextRepairPlanMarkdownPath = join(process.cwd(), LIBRARY_ANALYSIS_URL_TEXT_REPAIR_PLAN_MD_PATH)
  const decisionQueueJsonPath = join(process.cwd(), LIBRARY_ANALYSIS_DECISION_QUEUE_JSON_PATH)
  const decisionQueueMarkdownPath = join(process.cwd(), LIBRARY_ANALYSIS_DECISION_QUEUE_MD_PATH)
  const failures: string[] = []
  const ledgerContent = existsSync(ledgerPath) ? readFileSync(ledgerPath, 'utf8') : null
  const externalReadiness = ledgerContent
    ? assessLibraryAnalysisExternalReadiness(ledgerContent)
    : null

  if (externalReadiness) writeExternalReadinessArtifacts(externalReadiness)

  if (!existsSync(ledgerPath)) failures.push(`missing ${LIBRARY_ANALYSIS_LEDGER_PATH}`)
  if (!existsSync(summaryPath)) failures.push(`missing ${LIBRARY_ANALYSIS_SUMMARY_PATH}`)
  if (!existsSync(repairBacklogJsonPath)) failures.push(`missing ${LIBRARY_ANALYSIS_REPAIR_BACKLOG_JSON_PATH}`)
  if (!existsSync(repairBacklogMarkdownPath)) failures.push(`missing ${LIBRARY_ANALYSIS_REPAIR_BACKLOG_MD_PATH}`)
  if (!existsSync(pdfExtractionProfileJsonPath)) failures.push(`missing ${LIBRARY_ANALYSIS_PDF_EXTRACTION_PROFILE_JSON_PATH}`)
  if (!existsSync(pdfExtractionProfileMarkdownPath)) failures.push(`missing ${LIBRARY_ANALYSIS_PDF_EXTRACTION_PROFILE_MD_PATH}`)
  if (!existsSync(pdfTextRepairPlanJsonPath)) failures.push(`missing ${LIBRARY_ANALYSIS_PDF_TEXT_REPAIR_PLAN_JSON_PATH}`)
  if (!existsSync(pdfTextRepairPlanMarkdownPath)) failures.push(`missing ${LIBRARY_ANALYSIS_PDF_TEXT_REPAIR_PLAN_MD_PATH}`)
  if (!existsSync(localTextRepairPlanJsonPath)) failures.push(`missing ${LIBRARY_ANALYSIS_LOCAL_TEXT_REPAIR_PLAN_JSON_PATH}`)
  if (!existsSync(localTextRepairPlanMarkdownPath)) failures.push(`missing ${LIBRARY_ANALYSIS_LOCAL_TEXT_REPAIR_PLAN_MD_PATH}`)
  if (!existsSync(manualLocalMatchRepairPlanJsonPath)) failures.push(`missing ${LIBRARY_ANALYSIS_MANUAL_LOCAL_MATCH_REPAIR_PLAN_JSON_PATH}`)
  if (!existsSync(manualLocalMatchRepairPlanMarkdownPath)) failures.push(`missing ${LIBRARY_ANALYSIS_MANUAL_LOCAL_MATCH_REPAIR_PLAN_MD_PATH}`)
  if (!existsSync(manualPdfMatchRepairPlanJsonPath)) failures.push(`missing ${LIBRARY_ANALYSIS_MANUAL_PDF_MATCH_REPAIR_PLAN_JSON_PATH}`)
  if (!existsSync(manualPdfMatchRepairPlanMarkdownPath)) failures.push(`missing ${LIBRARY_ANALYSIS_MANUAL_PDF_MATCH_REPAIR_PLAN_MD_PATH}`)
  if (!existsSync(manualUrlMatchRepairPlanJsonPath)) failures.push(`missing ${LIBRARY_ANALYSIS_MANUAL_URL_MATCH_REPAIR_PLAN_JSON_PATH}`)
  if (!existsSync(manualUrlMatchRepairPlanMarkdownPath)) failures.push(`missing ${LIBRARY_ANALYSIS_MANUAL_URL_MATCH_REPAIR_PLAN_MD_PATH}`)
  if (!existsSync(locatorProfileJsonPath)) failures.push(`missing ${LIBRARY_ANALYSIS_LOCATOR_PROFILE_JSON_PATH}`)
  if (!existsSync(locatorProfileMarkdownPath)) failures.push(`missing ${LIBRARY_ANALYSIS_LOCATOR_PROFILE_MD_PATH}`)
  if (!existsSync(urlTextExtractionProfileJsonPath)) failures.push(`missing ${LIBRARY_ANALYSIS_URL_TEXT_EXTRACTION_PROFILE_JSON_PATH}`)
  if (!existsSync(urlTextExtractionProfileMarkdownPath)) failures.push(`missing ${LIBRARY_ANALYSIS_URL_TEXT_EXTRACTION_PROFILE_MD_PATH}`)
  if (!existsSync(urlTextRepairPlanJsonPath)) failures.push(`missing ${LIBRARY_ANALYSIS_URL_TEXT_REPAIR_PLAN_JSON_PATH}`)
  if (!existsSync(urlTextRepairPlanMarkdownPath)) failures.push(`missing ${LIBRARY_ANALYSIS_URL_TEXT_REPAIR_PLAN_MD_PATH}`)
  if (!existsSync(decisionQueueJsonPath)) failures.push(`missing ${LIBRARY_ANALYSIS_DECISION_QUEUE_JSON_PATH}`)
  if (!existsSync(decisionQueueMarkdownPath)) failures.push(`missing ${LIBRARY_ANALYSIS_DECISION_QUEUE_MD_PATH}`)
  if (failures.length === 0) {
    failures.push(...auditLibraryAnalysisArtifacts({
      ledgerContent: ledgerContent!,
      summaryContent: readFileSync(summaryPath, 'utf8'),
      repairBacklogJsonContent: readFileSync(repairBacklogJsonPath, 'utf8'),
      repairBacklogMarkdownContent: readFileSync(repairBacklogMarkdownPath, 'utf8'),
      pdfExtractionProfileJsonContent: readFileSync(pdfExtractionProfileJsonPath, 'utf8'),
      pdfExtractionProfileMarkdownContent: readFileSync(pdfExtractionProfileMarkdownPath, 'utf8'),
      pdfTextRepairPlanJsonContent: readFileSync(pdfTextRepairPlanJsonPath, 'utf8'),
      pdfTextRepairPlanMarkdownContent: readFileSync(pdfTextRepairPlanMarkdownPath, 'utf8'),
      localTextRepairPlanJsonContent: readFileSync(localTextRepairPlanJsonPath, 'utf8'),
      localTextRepairPlanMarkdownContent: readFileSync(localTextRepairPlanMarkdownPath, 'utf8'),
      manualLocalMatchRepairPlanJsonContent: readFileSync(manualLocalMatchRepairPlanJsonPath, 'utf8'),
      manualLocalMatchRepairPlanMarkdownContent: readFileSync(manualLocalMatchRepairPlanMarkdownPath, 'utf8'),
      manualPdfMatchRepairPlanJsonContent: readFileSync(manualPdfMatchRepairPlanJsonPath, 'utf8'),
      manualPdfMatchRepairPlanMarkdownContent: readFileSync(manualPdfMatchRepairPlanMarkdownPath, 'utf8'),
      manualUrlMatchRepairPlanJsonContent: readFileSync(manualUrlMatchRepairPlanJsonPath, 'utf8'),
      manualUrlMatchRepairPlanMarkdownContent: readFileSync(manualUrlMatchRepairPlanMarkdownPath, 'utf8'),
      locatorProfileJsonContent: readFileSync(locatorProfileJsonPath, 'utf8'),
      locatorProfileMarkdownContent: readFileSync(locatorProfileMarkdownPath, 'utf8'),
      urlTextExtractionProfileJsonContent: readFileSync(urlTextExtractionProfileJsonPath, 'utf8'),
      urlTextExtractionProfileMarkdownContent: readFileSync(urlTextExtractionProfileMarkdownPath, 'utf8'),
      urlTextRepairPlanJsonContent: readFileSync(urlTextRepairPlanJsonPath, 'utf8'),
      urlTextRepairPlanMarkdownContent: readFileSync(urlTextRepairPlanMarkdownPath, 'utf8'),
      decisionQueueJsonContent: readFileSync(decisionQueueJsonPath, 'utf8'),
      decisionQueueMarkdownContent: readFileSync(decisionQueueMarkdownPath, 'utf8'),
      localFileExists,
    }))
  }

  if (process.env.DATABASE_URL) {
    console.log('Library analysis audit mode: artifacts + DB-backed live-inventory parity')
    if (failures.length === 0) {
      try {
        const liveInventory = await loadLibraryAnalysisInventory({ requireDb: true })
        failures.push(...auditLibraryAnalysisLedgerLiveParity(
          ledgerContent!,
          liveInventory,
        ).failures)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        failures.push(`DB-backed live-inventory parity unavailable: ${message}`)
      }
    }
  } else {
    console.log('Library analysis audit mode: artifact-only (DATABASE_URL not set; live parity not claimed)')
  }

  if (failures.length > 0) {
    console.error('Library analysis audit failed:')
    for (const failure of failures) console.error(`- ${failure}`)
    process.exitCode = 1
    return
  }

  console.log('Library analysis audit passed')
  if (externalReadiness) {
    console.log(`Library analysis external readiness: ${externalReadiness.status === 'ready' ? 'READY' : 'NOT READY'}`)
    console.log(`Status: ${LIBRARY_ANALYSIS_EXTERNAL_READINESS_MD_PATH}`)
    if (process.argv.includes('--require-external-ready') && externalReadiness.status !== 'ready') {
      console.error('External readiness enforcement failed: library analysis remains internal-only.')
      process.exitCode = 1
    }
  }
}

function writeExternalReadinessArtifacts(status: LibraryAnalysisExternalReadiness) {
  const generatedAt = new Date().toISOString()
  writeArtifact(
    LIBRARY_ANALYSIS_EXTERNAL_READINESS_JSON_PATH,
    `${JSON.stringify({ generatedAt, ...status }, null, 2)}\n`,
  )
  writeArtifact(
    LIBRARY_ANALYSIS_EXTERNAL_READINESS_MD_PATH,
    formatExternalReadinessMarkdown(status, generatedAt),
  )
}

function formatExternalReadinessMarkdown(
  status: LibraryAnalysisExternalReadiness,
  generatedAt: string,
): string {
  const lines = [
    '# Library Analysis External Readiness',
    '',
    `Generated: ${generatedAt}`,
    '',
    `- Structural artifact audit: **${status.ledgerValid ? 'PASS' : 'FAIL'}**`,
    `- External claim readiness: **${status.status === 'ready' ? 'READY' : 'NOT READY'}**`,
    `- Total records: ${status.total}`,
    `- Safe for internal AI context: ${status.safeForAiContextRows}`,
    `- AI drafts: ${status.aiDraftRows}`,
    `- Blocked: ${status.blockedRows}`,
    `- Dated and named human reviews in ledger: ${status.humanReviewedRows}`,
    `- Explicitly external-claim eligible: ${status.externalClaimEligibleRows}`,
    `- Invalid external approval markers: ${status.invalidExternalApprovalRows}`,
    '',
    '## Boundary',
    '',
    '`safe_for_ai_context` means internal AI context. It is not an external citation or publication permission.',
    '',
    '## Blockers',
    '',
    ...status.blockers.map(blocker => `- ${blocker}`),
    '',
  ]
  return lines.join('\n')
}

function writeArtifact(path: string, content: string) {
  const absolutePath = join(process.cwd(), path)
  mkdirSync(dirname(absolutePath), { recursive: true })
  writeFileSync(absolutePath, content, 'utf8')
}

function localFileExists(path: string | null | undefined): boolean {
  return candidateLocalFilePaths(path).some(candidate => existsSync(candidate))
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
