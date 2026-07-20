import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { reports } from '../../prisma/seed-data/reports'
import { buildLibraryAnalysisRepairPlan } from '../../scripts/repair-authoritative-report-identities'
import {
  AUTHORITATIVE_DOCUMENT_AFTER_CONTENT_BY_REPORT_ID,
  AUTHORITATIVE_LINKED_DOCUMENT_REPORT_IDS,
  AUTHORITATIVE_REPORT_IDENTITY_IDS,
  PINNED_AUTHORITATIVE_DOCUMENT_AFTER_SHA256,
  PINNED_AUTHORITATIVE_DOCUMENT_BEFORE_SHA256,
  PINNED_AUTHORITATIVE_IDENTITY_MANIFEST_SHA256,
  PINNED_AUTHORITATIVE_REPORT_AFTER_SHA256,
  PINNED_AUTHORITATIVE_REPORT_BEFORE_SHA256,
  authoritativeIdentitySnapshotContract,
  buildAuthoritativeIdentityRepairPlan,
  buildReviewedAuthoritativeIdentityTargets,
  type AuthoritativeDocumentDatabaseSnapshot,
  type AuthoritativeReportDatabaseSnapshot,
} from '../../src/lib/citations/authoritative-report-identity-repair'

const dependencySha = '0'.repeat(64)

function reviewedTargets() {
  return buildReviewedAuthoritativeIdentityTargets(reports)
}

function afterDatabaseRows() {
  const targets = reviewedTargets()
  const linked = new Set<string>(AUTHORITATIVE_LINKED_DOCUMENT_REPORT_IDS)
  const reportRows = targets.reportTargets.map(target => ({
    ...target.after,
    documentId: linked.has(target.id) ? `document-${target.id}` : null,
  })) as AuthoritativeReportDatabaseSnapshot[]
  const documentRows = targets.documentTargets.map(target => ({
    ...target.after,
    id: `document-${target.reportId}`,
    reportId: target.reportId,
    content: AUTHORITATIVE_DOCUMENT_AFTER_CONTENT_BY_REPORT_ID[target.reportId],
    createdAt: '2026-07-19T00:00:00.000Z',
    updatedAt: '2026-07-19T00:00:00.000Z',
  })) as AuthoritativeDocumentDatabaseSnapshot[]
  return { targets, reportRows, documentRows }
}

describe('authoritative Report identity repair', () => {
  it('pins seven reviewed Reports, five portable Documents and their exact seed manifest', () => {
    const contract = authoritativeIdentitySnapshotContract(reports)
    assert.equal(contract.reportBefore.length, 7)
    assert.equal(contract.documentBefore.length, 5)
    assert.equal(contract.reportBeforeSha256, PINNED_AUTHORITATIVE_REPORT_BEFORE_SHA256)
    assert.equal(contract.reportAfterSha256, PINNED_AUTHORITATIVE_REPORT_AFTER_SHA256)
    assert.equal(contract.documentBeforeSha256, PINNED_AUTHORITATIVE_DOCUMENT_BEFORE_SHA256)
    assert.equal(contract.documentAfterSha256, PINNED_AUTHORITATIVE_DOCUMENT_AFTER_SHA256)
    assert.equal(contract.manifestSha256, PINNED_AUTHORITATIVE_IDENTITY_MANIFEST_SHA256)
    assert.deepEqual(contract.reportAfter.map(row => row.id).sort(), [...AUTHORITATIVE_REPORT_IDENTITY_IDS].sort())
    assert.ok(contract.reportAfter.every(row => row.supportingSources !== null))
    assert.ok(JSON.stringify(contract.reportAfter).includes('remain unverified pending citation anchors'))
    assert.ok(!JSON.stringify(contract).includes('cmpp'))
  })

  it('keeps corrected file mirrors byte-aligned with guarded Document.content targets', () => {
    for (const [reportId, content] of Object.entries(AUTHORITATIVE_DOCUMENT_AFTER_CONTENT_BY_REPORT_ID)) {
      const file = readFileSync(join(process.cwd(), `research/report-${reportId}.md`), 'utf8')
      const snapshot = file.split('## Source Text Snapshot\n\n')[1]?.trimEnd()
      const contentSha = createHash('sha256').update(content).digest('hex')
      assert.equal(snapshot, content)
      assert.match(file, new RegExp(`Content SHA256: ${contentSha}`))
      assert.match(content, /ikke er kildeverifisert eller klar for ekstern sitering/)
    }
  })

  it('recognizes the exact post-state idempotently and rejects one-field drift', () => {
    const { targets, reportRows, documentRows } = afterDatabaseRows()
    const applied = buildAuthoritativeIdentityRepairPlan(
      reportRows,
      documentRows,
      targets.reportTargets,
      targets.documentTargets,
      dependencySha,
    )
    assert.equal(applied.conflicts.length, 0)
    assert.equal(applied.reportUpdates.length, 0)
    assert.equal(applied.documentUpdates.length, 0)
    assert.equal(applied.alreadyAppliedReportIds.length, 7)
    assert.equal(applied.alreadyAppliedDocumentReportIds.length, 5)

    const drifted = reportRows.map(row => ({ ...row }))
    drifted[0]!.publisher = 'Concurrent drift'
    const conflict = buildAuthoritativeIdentityRepairPlan(
      drifted,
      documentRows,
      targets.reportTargets,
      targets.documentTargets,
      dependencySha,
    )
    assert.equal(conflict.conflicts.length, 1)
    assert.equal(conflict.conflicts[0]?.code, 'unexpected_full_row_snapshot')
  })

  it('plans a guarded fail-closed LAR refresh, is idempotent, and refuses drift', () => {
    const targets = reviewedTargets()
    const target = targets.documentTargets[0]!
    const content = 'legacy source snapshot'
    const document = {
      ...target.before,
      id: 'document-test',
      reportId: target.reportId,
      content,
      createdAt: '2026-07-19T00:00:00.000Z',
      updatedAt: '2026-07-19T00:00:00.000Z',
    } as AuthoritativeDocumentDatabaseSnapshot
    const contentHash = createHash('sha256')
      .update([document.summary, content].filter(Boolean).join('\n\n'))
      .digest('hex')
    const lar = {
      id: 'lar-test',
      sourceKind: 'document',
      sourceKey: 'document:document-test',
      documentId: 'document-test',
      title: target.before.title,
      status: 'ai_draft',
      usageRule: 'internal_background',
      reviewStatus: 'not_required',
      citationReadiness: null,
      aiCard: {},
      aiSummary: `${target.before.title} er triagert som document med ${target.before.wordCount} ord i lokalt grunnlag.`,
      gaps: [],
      riskFlags: [],
      contentHash,
      wordCount: target.before.wordCount,
      updatedAt: '2026-07-19T00:00:00.000Z',
    }
    const pending = buildLibraryAnalysisRepairPlan([lar], [document], [target])
    assert.equal(pending.conflicts.length, 0)
    assert.equal(pending.updates.length, 1)
    assert.equal(pending.updates[0]?.after.status, 'ai_draft')
    assert.equal(pending.updates[0]?.after.usageRule, 'internal_background')
    assert.equal(pending.updates[0]?.after.reviewStatus, 'queued')
    assert.equal(pending.updates[0]?.after.citationReadiness, 'blocked_unsourced')
    assert.deepEqual(pending.updates[0]?.after.riskFlags, ['unverified_report_claims'])

    const applied = buildLibraryAnalysisRepairPlan([pending.updates[0]!.after], [document], [target])
    assert.equal(applied.updates.length, 0)
    assert.deepEqual(applied.alreadyAppliedReportIds, [target.reportId])

    const drifted = buildLibraryAnalysisRepairPlan([{ ...lar, status: 'approved_internal' }], [document], [target])
    assert.equal(drifted.updates.length, 0)
    assert.equal(drifted.conflicts.length, 1)
  })

  it('repairs only the two reviewed Report-kind LAR identities and keeps them fail-closed', () => {
    const targets = reviewedTargets()
    const beforeRows = [
      {
        reportId: 'konkurrensverket-etablering-2026',
        title: 'Etablering av dagligvarubutiker',
        wordCount: 66,
        contentHash: 'be8a34e2a244ac1bd3e71be69e8963211683d97e809ddb7e864108cf98952ee1',
      },
      {
        reportId: 'konkurrensverket-lonsamhet-2025',
        title: 'Lönsamhet i livsmedelskedjan',
        wordCount: 65,
        contentHash: '1d27c7d6b056ff6231e8c5259705e2005bfe67a444e812ee2c3994b982b2ed8e',
      },
    ].map(row => {
      const summary = `${row.title} er triagert som report med ${row.wordCount} ord i lokalt grunnlag.`
      return {
        id: `lar-${row.reportId}`,
        sourceKind: 'report',
        sourceKey: `report:${row.reportId}`,
        documentId: null,
        sourceDocId: null,
        canonicalPath: null,
        title: row.title,
        status: 'review_required',
        usageRule: 'internal_background',
        reviewStatus: 'queued',
        citationReadiness: null,
        aiCard: { shortSummary: summary, citationStatus: 'not_citation_checked' },
        aiSummary: summary,
        gaps: [
          { kind: 'needs_text_extraction', note: 'low_text_quality' },
          { kind: 'unclear_source', note: 'missing_file_path' },
        ],
        riskFlags: ['missing_file_path', 'low_text_quality'],
        contentHash: row.contentHash,
        wordCount: row.wordCount,
        updatedAt: '2026-07-19T00:00:00.000Z',
      }
    })
    const pending = buildLibraryAnalysisRepairPlan(
      beforeRows,
      [],
      [],
      targets.reportTargets,
    )
    assert.equal(pending.conflicts.length, 0)
    assert.equal(pending.updates.length, 2)
    assert.ok(pending.updates.every(update => update.after.status === 'review_required'))
    assert.ok(pending.updates.every(update => update.after.usageRule === 'internal_background'))
    assert.ok(pending.updates.every(update => update.after.citationReadiness === 'blocked_unsourced'))
    assert.ok(pending.updates.every(update =>
      Array.isArray(update.after.riskFlags) && update.after.riskFlags.includes('unverified_report_claims'),
    ))

    const applied = buildLibraryAnalysisRepairPlan(
      pending.updates.map(update => update.after),
      [],
      [],
      targets.reportTargets,
    )
    assert.equal(applied.updates.length, 0)
    assert.equal(applied.alreadyAppliedReportIds.length, 2)
  })

  it('exposes only an explicit guarded runner command', () => {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as {
      scripts: Record<string, string>
    }
    const runner = readFileSync(
      join(process.cwd(), 'scripts/repair-authoritative-report-identities.ts'),
      'utf8',
    )
    assert.equal(
      packageJson.scripts['repair:authoritative-report-identities'],
      'tsx scripts/repair-authoritative-report-identities.ts',
    )
    assert.match(runner, /APPLY_AUTHORITATIVE_REPORT_IDENTITIES/)
    assert.match(runner, /pg_advisory_xact_lock/)
    assert.match(runner, /FOR UPDATE/)
    assert.match(runner, /isolationLevel: 'Serializable'/)
    assert.match(runner, /Concurrent full-row LibraryAnalysisRecord CAS conflict/)
  })
})
