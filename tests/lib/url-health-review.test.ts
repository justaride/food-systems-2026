import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildUrlHealthReviewMap,
  isReviewedUrlHealthIssueOpen,
  summarizeUrlHealthReviews,
} from '@/lib/url-health-review'

describe('URL health review ledger', () => {
  it('closes reviewed tool-blocked URL issues without changing unresolved rows', () => {
    const reviews = buildUrlHealthReviewMap([
      {
        url: 'https://example.org/browser-ok',
        source: 'report:browser-ok',
        decision: 'browser_verified_tool_blocked',
      },
      {
        url: 'https://example.org/mirror-ok',
        source: 'thesis:mirror-ok',
        decision: 'citable_mirror_or_local_evidence',
      },
    ])

    assert.equal(
      isReviewedUrlHealthIssueOpen(
        {
          url: 'https://example.org/browser-ok',
          source: 'report:browser-ok',
          classification: 'blocked',
        },
        reviews,
      ),
      false,
    )
    assert.equal(
      isReviewedUrlHealthIssueOpen(
        {
          url: 'https://example.org/mirror-ok',
          source: 'thesis:mirror-ok',
          classification: 'blocked',
        },
        reviews,
      ),
      false,
    )
    assert.equal(
      isReviewedUrlHealthIssueOpen(
        {
          url: 'https://example.org/browser-ok',
          source: 'report:browser-ok',
          classification: 'other',
        },
        reviews,
      ),
      false,
    )
    assert.equal(
      isReviewedUrlHealthIssueOpen(
        {
          url: 'https://example.org/browser-ok',
          source: 'report:browser-ok',
          classification: 'dead',
        },
        reviews,
      ),
      true,
    )
    assert.equal(
      isReviewedUrlHealthIssueOpen(
        {
          url: 'https://example.org/unreviewed',
          source: 'report:unreviewed',
          classification: 'blocked',
        },
        reviews,
      ),
      true,
    )
  })

  it('summarizes only applied closed reviews', () => {
    const reviews = buildUrlHealthReviewMap([
      {
        url: 'https://example.org/browser-ok',
        source: 'report:browser-ok',
        decision: 'browser_verified_tool_blocked',
      },
      {
        url: 'https://example.org/not-in-health',
        source: 'report:not-in-health',
        decision: 'browser_verified_tool_blocked',
      },
    ])

    assert.deepEqual(
      summarizeUrlHealthReviews(
        [
          {
            url: 'https://example.org/browser-ok',
            source: 'report:browser-ok',
            classification: 'blocked',
          },
          {
            url: 'https://example.org/not-closed',
            source: 'report:not-closed',
            classification: 'blocked',
          },
        ],
        reviews,
      ),
      {
        closedReviewedIssues: 1,
        unappliedReviews: 1,
      },
    )
  })
})
