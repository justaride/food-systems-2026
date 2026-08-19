import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'
import {
  buildApprovalWrite,
  buildRejectionWrite,
  parseReviewArgs,
  type ReviewedRun,
} from '../../scripts/review-library-analysis-run'
import { toClaims, toGaps } from '../../src/lib/queries/library-analysis-runs'

const reviewedAt = new Date('2026-08-19T20:00:00.000Z')

function run(cardOverrides: Record<string, unknown> = {}): ReviewedRun {
  return {
    id: 'run-1',
    sourceKind: 'document',
    sourceKey: 'document:doc-1',
    documentId: 'doc-1',
    sourceDocId: 'src-1',
    canonicalPath: 'research/bibliotek/kilde.md',
    title: 'Kilde',
    analysisTier: 'model_analysis',
    aiCard: {
      recommendedUsageRule: 'claim_candidate_review',
      status: 'ai_draft',
      citationStatus: 'not_citation_checked',
      ...cardOverrides,
    },
    aiSummary: 'Sammendrag',
    keyFindings: ['funn'],
    claimCandidates: [{ text: 'påstand', evidence: 'sitat', sourcePath: 'research/bibliotek/kilde.md' }],
    projectImplications: ['implikasjon'],
    gaps: [{ kind: 'none', note: 'ingen' }],
    controlLinks: [{ label: 'Kilde', href: 'research/bibliotek/kilde.md' }],
    riskFlags: ['ki_generert_syntese'],
    contentHash: 'a'.repeat(64),
    wordCount: 500,
  }
}

describe('library analysis run review arguments', () => {
  it('requires a run, a decision and a named reviewer', () => {
    assert.throws(() => parseReviewArgs([]), /--run/)
    assert.throws(() => parseReviewArgs(['--run', 'run-1']), /approve or reject/)
    assert.throws(() => parseReviewArgs(['--run', 'run-1', '--decision', 'maybe']), /approve or reject/)
    assert.throws(
      () => parseReviewArgs(['--run', 'run-1', '--decision', 'approve']),
      /must name a person/,
    )
  })

  it('defaults to a dry run', () => {
    const args = parseReviewArgs(['--run', 'run-1', '--decision', 'approve', '--reviewer', 'Gabriel'])
    assert.equal(args.apply, false)
    assert.equal(args.reviewer, 'Gabriel')

    const applied = parseReviewArgs([...['--run', 'run-1', '--decision', 'reject', '--reviewer', 'Gabriel'], '--apply'])
    assert.equal(applied.apply, true)
    assert.equal(applied.decision, 'reject')
  })
})

describe('library analysis run approval', () => {
  it('points the record at the reviewed run and names the reviewer', () => {
    const write = buildApprovalWrite(run(), 'Gabriel', reviewedAt)

    assert.equal(write.currentRunId, 'run-1')
    assert.equal(write.reviewStatus, 'approved')
    assert.equal(write.reviewer, 'Gabriel')
    assert.equal(write.reviewedAt, reviewedAt)
    assert.equal(write.usageRule, 'claim_candidate_review')
    assert.deepEqual(write.claimCandidates, run().claimCandidates)
  })

  it('refuses to grant external claim authority', () => {
    assert.throws(
      () => buildApprovalWrite(run({ recommendedUsageRule: 'safe_for_external_claims' }), 'Gabriel', reviewedAt),
      /Refusing to approve/,
    )
  })

  it('falls back to internal background when the card names no usage rule', () => {
    const write = buildApprovalWrite(run({ recommendedUsageRule: undefined }), 'Gabriel', reviewedAt)
    assert.equal(write.usageRule, 'internal_background')
  })
})

describe('library analysis run rejection', () => {
  it('records the decision and blocks claim use', () => {
    const write = buildRejectionWrite(run(), 'Gabriel', reviewedAt)

    assert.equal(write.update.reviewStatus, 'rejected')
    assert.equal(write.update.usageRule, 'do_not_use_for_claims')
    assert.equal(write.update.reviewer, 'Gabriel')
    assert.equal(write.create.reviewStatus, 'rejected')
  })

  it('never points the record at the rejected run', () => {
    const write = buildRejectionWrite(run(), 'Gabriel', reviewedAt)

    assert.equal(Object.hasOwn(write.create, 'currentRunId'), false)
    assert.equal(Object.hasOwn(write.update, 'currentRunId'), false)
  })
})

describe('library analysis run review surface', () => {
  it('keeps only claims that carry text', () => {
    const claims = toClaims([
      { text: 'god', evidence: 'sitat', sourcePath: 'a.md', pageRef: 's. 1' },
      { evidence: 'uten tekst' },
      'ikke et objekt',
      null,
    ])

    assert.equal(claims.length, 1)
    assert.deepEqual(claims[0], { text: 'god', evidence: 'sitat', sourcePath: 'a.md', pageRef: 's. 1' })
  })

  it('survives malformed claim and gap payloads', () => {
    assert.deepEqual(toClaims(null), [])
    assert.deepEqual(toClaims({ text: 'ikke en liste' }), [])
    assert.deepEqual(toGaps('nope'), [])
    assert.deepEqual(toGaps([{ note: 'mangler kind' }]), [{ kind: 'none', note: 'mangler kind' }])
  })

  it('does not offer an approve control in the web surface', () => {
    const surface = readFileSync(join(process.cwd(), 'src/app/ai-kunnskap/LibraryAnalysisRuns.tsx'), 'utf8')

    // The app has no authentication. An approve control here would be an
    // unauthenticated authority action, which is exactly what the candidate
    // architecture exists to prevent.
    assert.doesNotMatch(surface, /<button/i)
    assert.doesNotMatch(surface, /<form/i)
    assert.doesNotMatch(surface, /onClick/)
    assert.doesNotMatch(surface, /'use client'/)
  })

  it('exposes the review decision commands', () => {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as {
      scripts: Record<string, string>
    }

    assert.equal(packageJson.scripts['research:library:review-run:dry-run'], 'tsx scripts/review-library-analysis-run.ts')
    assert.equal(packageJson.scripts['research:library:review-run:apply'], 'tsx scripts/review-library-analysis-run.ts --apply')
  })
})
