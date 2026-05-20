import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildPdfOcrReviewMap,
  isReviewedPdfQualityIssueOpen,
  summarizePdfOcrReviews,
} from '@/lib/pdf-ocr-review'

describe('PDF OCR review ledger', () => {
  it('closes scanned PDF issues when OCR text is usable', () => {
    const reviews = buildPdfOcrReviewMap([
      {
        path: 'research/a.pdf',
        action: 'archived',
        ocr_word_count: '306',
      },
      {
        path: 'research/b.pdf',
        action: 'updated',
        ocr_word_count: '1000',
      },
    ])

    assert.equal(
      isReviewedPdfQualityIssueOpen(
        { path: 'research/a.pdf', classification: 'scanned' },
        reviews,
      ),
      false,
    )
    assert.equal(
      isReviewedPdfQualityIssueOpen(
        { path: 'research/b.pdf', classification: 'scanned' },
        reviews,
      ),
      false,
    )
    assert.equal(
      isReviewedPdfQualityIssueOpen(
        { path: 'research/a.pdf', classification: 'low-text' },
        reviews,
      ),
      true,
    )
  })

  it('keeps skipped and too-short OCR outputs open', () => {
    const reviews = buildPdfOcrReviewMap([
      {
        path: 'research/skipped.pdf',
        action: 'skipped',
        ocr_word_count: '0',
      },
      {
        path: 'research/too-short.pdf',
        action: 'archived',
        ocr_word_count: '50',
      },
    ])

    assert.equal(
      isReviewedPdfQualityIssueOpen(
        { path: 'research/skipped.pdf', classification: 'scanned' },
        reviews,
      ),
      true,
    )
    assert.equal(
      isReviewedPdfQualityIssueOpen(
        { path: 'research/too-short.pdf', classification: 'scanned' },
        reviews,
      ),
      true,
    )
  })

  it('summarizes closed and unapplied OCR reviews', () => {
    const reviews = buildPdfOcrReviewMap([
      {
        path: 'research/closed.pdf',
        action: 'archived',
        ocr_word_count: '250',
      },
      {
        path: 'research/not-in-quality.csv',
        action: 'archived',
        ocr_word_count: '250',
      },
    ])

    assert.deepEqual(
      summarizePdfOcrReviews(
        [
          { path: 'research/closed.pdf', classification: 'scanned' },
          { path: 'research/open.pdf', classification: 'scanned' },
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
