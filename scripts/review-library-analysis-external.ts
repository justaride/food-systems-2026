import 'dotenv/config'
import { randomUUID } from 'node:crypto'
import { appendFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { assessLibraryAnalysisExternalApproval } from '../src/lib/library-analysis'
import {
  assessLibraryAnalysisExternalCitationPolicy,
  readLibraryAnalysisExternalCitationPolicyHash,
  setLibraryAnalysisExternalApprovalEvidence,
} from '../src/lib/library-analysis-external-citations'
import { computeLibraryContentHash } from '../src/lib/library-analysis-inventory'
import { createLibraryAnalysisPrismaClient } from './library-analysis-common'

const REVIEW_LOG_PATH = 'research/_status/library-analysis-human-review-log.jsonl'
const APPROVE_ACK = 'I_HAVE_REVIEWED_THE_CURRENT_DOCUMENT'
const REVOKE_ACK = 'I_AM_REVOKING_EXTERNAL_APPROVAL'

type Decision = 'approve' | 'revoke'

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const apply = args.has('apply')
  const decision = requiredDecision(args.get('decision'))
  const sourceKey = requiredValue(args.get('source-key'), '--source-key')
  const reviewer = requiredValue(args.get('reviewer'), '--reviewer')
  const expectedAck = decision === 'approve' ? APPROVE_ACK : REVOKE_ACK
  const expectedContentHash = apply && decision === 'approve'
    ? requiredContentHash(args.get('expected-content-hash'))
    : null

  if (!sourceKey.startsWith('document:')) {
    throw new Error('Only exact document:<id> records can receive external review decisions')
  }
  const requestedDocumentId = sourceKey.slice('document:'.length)
  if (!requestedDocumentId) {
    throw new Error('Only exact document:<id> records can receive external review decisions')
  }
  if (apply && args.get('ack') !== expectedAck) {
    throw new Error(`--apply requires --ack=${expectedAck}`)
  }

  const prisma = createLibraryAnalysisPrismaClient()
  try {
    const baseEvent = await prisma.$transaction(async transaction => {
      // Lock the approval record, reviewed document, and its current citations
      // before reading any review state. Serializable isolation plus these row
      // locks keep the expected hash and the approval update in one DB decision.
      const lockedRecords = await transaction.$queryRaw<Array<{ id: string }>>`
        SELECT "id"
        FROM "LibraryAnalysisRecord"
        WHERE "sourceKind" = 'document' AND "sourceKey" = ${sourceKey}
        FOR UPDATE
      `
      if (lockedRecords.length !== 1) {
        throw new Error(`Library analysis record not found: ${sourceKey}`)
      }
      const lockedDocuments = await transaction.$queryRaw<Array<{ id: string }>>`
        SELECT "id"
        FROM "Document"
        WHERE "id" = ${requestedDocumentId}
        FOR SHARE
      `
      if (lockedDocuments.length !== 1) {
        throw new Error(`Document not found for external review: ${requestedDocumentId}`)
      }
      await transaction.$queryRaw<Array<{ id: string }>>`
        SELECT "id"
        FROM "SourceCitation"
        WHERE "documentId" = ${requestedDocumentId}
        FOR SHARE
      `

      const record = await transaction.libraryAnalysisRecord.findUnique({
        where: {
          sourceKind_sourceKey: { sourceKind: 'document', sourceKey },
        },
        include: {
          document: {
            include: {
              sourceCitations: true,
            },
          },
        },
      })
      if (!record) throw new Error(`Library analysis record not found: ${sourceKey}`)
      if (
        !record.document ||
        !record.documentId ||
        record.documentId !== requestedDocumentId ||
        record.sourceKind !== 'document' ||
        record.sourceKey !== `document:${record.documentId}` ||
        record.document.id !== record.documentId
      ) {
        throw new Error('External review requires an exact LibraryAnalysisRecord-to-Document binding')
      }

      const currentContentHash = computeLibraryContentHash(
        [record.document.summary, record.document.content].filter(Boolean).join('\n\n'),
      )
      if (expectedContentHash && currentContentHash !== expectedContentHash) {
        throw new Error(
          'Current document hash differs from --expected-content-hash; rerun dry-run and review the changed document',
        )
      }
      if (decision === 'approve' && record.contentHash !== currentContentHash) {
        throw new Error(
          'Library analysis is stale for the current document hash; rerun library processing before external review',
        )
      }
      const claimCandidateCount = Array.isArray(record.claimCandidates)
        ? record.claimCandidates.length
        : 0
      const externalCitationPolicy = assessLibraryAnalysisExternalCitationPolicy(
        record.document.sourceCitations,
      )

      if (decision === 'approve') {
        if (!externalCitationPolicy.policyHash) {
          throw new Error('External approval requires at least one currently eligible external citation')
        }
        const approval = assessLibraryAnalysisExternalApproval({
          sourceKind: record.sourceKind,
          sourceKey: record.sourceKey,
          documentId: record.documentId,
          status: 'validated',
          usageRule: 'safe_for_external_claims',
          reviewStatus: 'approved',
          reviewedAt: new Date(),
          reviewer,
          citationReadiness: record.citationReadiness,
          contentHash: currentContentHash,
          currentContentHash,
          externalCitationPolicyHash: externalCitationPolicy.policyHash,
          currentExternalCitationPolicyHash: externalCitationPolicy.policyHash,
          riskFlags: record.riskFlags,
          claimCandidateCount,
        })
        if (!approval.eligible) {
          throw new Error(`External approval contract failed: ${approval.blockers.join(', ')}`)
        }
      }

      const eventId = randomUUID()
      const reviewedAt = new Date()
      const previous = {
        status: record.status,
        usageRule: record.usageRule,
        reviewStatus: record.reviewStatus,
        reviewedAt: record.reviewedAt,
        reviewer: record.reviewer,
        contentHash: record.contentHash,
        externalCitationPolicyHash: readLibraryAnalysisExternalCitationPolicyHash(record.aiCard),
      }
      const safeForInternal = record.riskFlags.length === 0 &&
        claimCandidateCount === 0 &&
        ['citable_external', 'citable_with_note'].includes(record.citationReadiness ?? '')
      const update = decision === 'approve'
        ? {
            status: 'validated',
            usageRule: 'safe_for_external_claims',
            reviewStatus: 'approved',
            reviewedAt,
            reviewer,
            contentHash: currentContentHash,
            aiCard: setLibraryAnalysisExternalApprovalEvidence(record.aiCard, {
              citationPolicyHash: externalCitationPolicy.policyHash!,
              eligibleCitationIds: externalCitationPolicy.eligibleCitationIds,
            }),
          }
        : {
            status: safeForInternal ? 'approved_internal' : 'review_required',
            usageRule: safeForInternal ? 'safe_for_ai_context' : 'internal_background',
            reviewStatus: safeForInternal ? 'not_required' : 'queued',
            reviewedAt: null,
            reviewer: null,
            contentHash: currentContentHash,
            aiCard: setLibraryAnalysisExternalApprovalEvidence(record.aiCard, null),
          }

      const event = {
        eventId,
        sourceKind: record.sourceKind,
        sourceKey: record.sourceKey,
        documentId: record.documentId,
        decision,
        reviewer,
        reviewedAt: reviewedAt.toISOString(),
        contentHash: currentContentHash,
        eligibleCitationIds: externalCitationPolicy.eligibleCitationIds,
        externalCitationPolicyHash: externalCitationPolicy.policyHash,
        previous,
        next: update,
      }

      if (!apply) return event

      appendReviewEvent({ ...event, phase: 'intent' })
      await transaction.libraryAnalysisRecord.update({
        where: { id: record.id },
        data: update,
      })
      return event
    }, {
      isolationLevel: 'Serializable',
    })

    if (!apply) {
      console.log(JSON.stringify({ mode: 'dry-run', ...baseEvent }, null, 2))
      return
    }

    appendReviewEvent({ ...baseEvent, phase: 'applied' })
    console.log(`External library review ${decision} applied for ${sourceKey}`)
  } finally {
    await prisma.$disconnect()
  }
}

function parseArgs(argv: string[]): Map<string, string> {
  const args = new Map<string, string>()
  for (const argument of argv) {
    if (argument === '--apply') {
      args.set('apply', 'true')
      continue
    }
    if (argument === '--dry-run') continue
    const match = argument.match(/^--([a-z-]+)=(.*)$/)
    if (!match) throw new Error(`Unknown argument: ${argument}`)
    args.set(match[1]!, match[2]!)
  }
  return args
}

function requiredDecision(value: string | undefined): Decision {
  if (value === 'approve' || value === 'revoke') return value
  throw new Error('--decision must be approve or revoke')
}

function requiredValue(value: string | undefined, flag: string): string {
  const normalized = value?.trim()
  if (!normalized) throw new Error(`${flag} is required`)
  return normalized
}

function requiredContentHash(value: string | undefined): string {
  const normalized = requiredValue(value, '--expected-content-hash').toLowerCase()
  if (!/^[a-f0-9]{64}$/.test(normalized)) {
    throw new Error('--expected-content-hash must be a 64-character SHA-256 hex digest')
  }
  return normalized
}

function appendReviewEvent(event: Record<string, unknown>) {
  const path = resolve(process.cwd(), REVIEW_LOG_PATH)
  mkdirSync(dirname(path), { recursive: true })
  appendFileSync(path, `${JSON.stringify(event)}\n`, 'utf8')
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : 'External library review failed')
  process.exitCode = 1
})
