export const CLOSED_PDF_OCR_REVIEW_ACTIONS = ['archived', 'updated'] as const

export const MIN_USABLE_OCR_WORDS = 100

export type ClosedPdfOcrReviewAction = (typeof CLOSED_PDF_OCR_REVIEW_ACTIONS)[number]

export type PdfOcrReviewRow = {
  path?: string
  action?: string
  ocr_word_count?: string
  ocrWordCount?: number
}

export type PdfQualityIssueRow = {
  path: string
  classification: string
}

export type PdfOcrReview = {
  path: string
  action: string
  ocrWordCount: number
  isClosed: boolean
}

export function normalizePdfPathForReview(path: string | null | undefined): string {
  const trimmed = (path ?? '').trim()
  return trimmed.startsWith('research/') ? trimmed.slice('research/'.length) : trimmed
}

export function isClosedPdfOcrReviewAction(
  action: string | null | undefined,
): action is ClosedPdfOcrReviewAction {
  return CLOSED_PDF_OCR_REVIEW_ACTIONS.includes(
    (action ?? '').trim() as ClosedPdfOcrReviewAction,
  )
}

export function parseOcrWordCount(row: PdfOcrReviewRow): number {
  if (typeof row.ocrWordCount === 'number') return row.ocrWordCount
  return Number(row.ocr_word_count) || 0
}

export function buildPdfOcrReviewMap(
  rows: PdfOcrReviewRow[],
): Map<string, PdfOcrReview> {
  const reviews = new Map<string, PdfOcrReview>()

  for (const row of rows) {
    const path = normalizePdfPathForReview(row.path)
    if (!path) continue

    const action = (row.action ?? '').trim()
    const ocrWordCount = parseOcrWordCount(row)
    reviews.set(path, {
      path,
      action,
      ocrWordCount,
      isClosed: isClosedPdfOcrReviewAction(action) && ocrWordCount >= MIN_USABLE_OCR_WORDS,
    })
  }

  return reviews
}

export function isReviewedPdfQualityIssueOpen(
  row: PdfQualityIssueRow,
  reviews: Map<string, PdfOcrReview>,
): boolean {
  if (row.classification !== 'scanned') return true

  const review = reviews.get(normalizePdfPathForReview(row.path))
  return !review?.isClosed
}

export function summarizePdfOcrReviews(
  rows: PdfQualityIssueRow[],
  reviews: Map<string, PdfOcrReview>,
): { closedReviewedIssues: number; unappliedReviews: number } {
  const appliedReviewPaths = new Set<string>()
  let closedReviewedIssues = 0

  for (const row of rows) {
    const path = normalizePdfPathForReview(row.path)
    const review = reviews.get(path)
    if (!review?.isClosed) continue

    appliedReviewPaths.add(path)
    if (!isReviewedPdfQualityIssueOpen(row, reviews)) {
      closedReviewedIssues += 1
    }
  }

  const unappliedReviews = [...reviews.values()].filter(
    review => review.isClosed && !appliedReviewPaths.has(review.path),
  ).length

  return { closedReviewedIssues, unappliedReviews }
}
