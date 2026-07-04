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

  it('closes scanned PDF issues when a reviewed local text replacement is available', () => {
    const reviews = buildPdfOcrReviewMap([
      {
        path: 'research/empty-browser-print.pdf',
        action: 'replaced_by_local_text',
        replacement_word_count: '612',
        replacement_path: 'research/evidence-pack/source.md',
      },
    ])

    assert.equal(
      isReviewedPdfQualityIssueOpen(
        { path: 'research/empty-browser-print.pdf', classification: 'scanned' },
        reviews,
      ),
      false,
    )
  })

  it('closes low-text PDF issues only after explicit text-sufficient review', () => {
    const reviews = buildPdfOcrReviewMap([
      {
        path: 'research/sufficient-browser-print.pdf',
        action: 'confirmed_text_sufficient',
        ocr_word_count: '612',
      },
      {
        path: 'research/generic-ocr-archive.pdf',
        action: 'archived',
        ocr_word_count: '612',
      },
    ])

    assert.equal(
      isReviewedPdfQualityIssueOpen(
        { path: 'research/sufficient-browser-print.pdf', classification: 'low-text' },
        reviews,
      ),
      false,
    )
    assert.equal(
      isReviewedPdfQualityIssueOpen(
        { path: 'research/generic-ocr-archive.pdf', classification: 'low-text' },
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
      {
        path: 'research/low-text-closed.pdf',
        action: 'confirmed_text_sufficient',
        ocr_word_count: '612',
      },
    ])

    assert.deepEqual(
      summarizePdfOcrReviews(
        [
          { path: 'research/closed.pdf', classification: 'scanned' },
          { path: 'research/low-text-closed.pdf', classification: 'low-text' },
          { path: 'research/open.pdf', classification: 'scanned' },
        ],
        reviews,
      ),
      {
        closedReviewedIssues: 2,
        unappliedReviews: 1,
      },
    )
  })
})
