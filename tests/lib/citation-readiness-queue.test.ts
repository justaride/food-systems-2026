import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildCitationReadinessQueue,
  formatCitationReadinessQueueCsv,
  isMissingExternalVerificationMetadata,
  priorityForCitationQueueItem,
} from '../../src/lib/citations/citation-readiness-queue'

describe('citation readiness queue helpers', () => {
  it('prioritizes public blocked records as P0', () => {
    assert.equal(
      priorityForCitationQueueItem({
        entityType: 'Report',
        entityId: 'report-1',
        fieldPath: 'keyFindings[0]',
        currentReadiness: 'blocked_unsourced',
        publicSurface: true,
      }),
      'P0',
    )
  })

  it('prioritizes externally relevant records missing verification as P1', () => {
    assert.equal(
      priorityForCitationQueueItem({
        entityType: 'CountryMetric',
        entityId: 'metric-1',
        fieldPath: 'source',
        currentReadiness: 'citable_external',
        publicSurface: true,
        missingVerificationMetadata: true,
      }),
      'P1',
    )
  })

  it('does not flag legacy machine-verified external citations as missing verification metadata', () => {
    assert.equal(
      isMissingExternalVerificationMetadata({
        citationReadiness: 'citable_external',
        verificationStatus: 'machine_verified',
      }),
      false,
    )
  })

  it('flags external citations with only needs-review status as missing verification metadata', () => {
    assert.equal(
      isMissingExternalVerificationMetadata({
        citationReadiness: 'citable_external',
        verificationStatus: 'needs_review',
      }),
      true,
    )
  })

  it('keeps internal missing-locator records below external blockers', () => {
    assert.equal(
      priorityForCitationQueueItem({
        entityType: 'SourceDoc',
        entityId: 'src-1',
        fieldPath: 'url',
        currentReadiness: 'internal_context',
        blockingReason: 'missing locator',
      }),
      'P2',
    )
  })

  it('keeps explicitly excluded blocked records out of the P0 public blocker queue', () => {
    assert.equal(
      priorityForCitationQueueItem({
        entityType: 'Report',
        entityId: 'blocked-report',
        fieldPath: 'sourceUrl',
        currentReadiness: 'blocked_unsourced',
        currentSource: 'Blocked report source',
        excludedFromExternalUse: true,
      }),
      'P2',
    )
  })

  it('sorts and formats the queue with stable CSV columns', () => {
    const queue = buildCitationReadinessQueue([
      {
        entityType: 'SourceDoc',
        entityId: 'src-1',
        fieldPath: 'url',
        currentReadiness: 'internal_context',
        blockingReason: 'missing locator',
      },
      {
        entityType: 'Report',
        entityId: 'report-1',
        fieldPath: 'keyFindings[0]',
        currentReadiness: 'blocked_unsourced',
        blockingReason: 'blocked external claim',
        publicSurface: true,
      },
    ])

    assert.deepEqual(queue.map(row => row.priority), ['P0', 'P2'])
    assert.match(
      formatCitationReadinessQueueCsv(queue),
      /^priority,entityType,entityId,fieldPath,currentReadiness,blockingReason,currentSource,/,
    )
  })
})
