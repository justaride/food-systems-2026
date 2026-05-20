export const CLOSED_URL_HEALTH_REVIEW_DECISIONS = [
  'browser_verified_tool_blocked',
  'citable_mirror_or_local_evidence',
] as const

export type ClosedUrlHealthReviewDecision = (typeof CLOSED_URL_HEALTH_REVIEW_DECISIONS)[number]

export type UrlHealthReviewRow = {
  url?: string
  source?: string
  decision?: string
}

export type UrlHealthIssueRow = {
  url: string
  source?: string
  classification: string
}

export type UrlHealthReview = {
  url: string
  source: string
  decision: string
  isClosed: boolean
}

export function normalizeUrlForReview(url: string | null | undefined): string {
  return (url ?? '').trim()
}

export function isClosedUrlHealthReviewDecision(
  decision: string | null | undefined,
): decision is ClosedUrlHealthReviewDecision {
  return CLOSED_URL_HEALTH_REVIEW_DECISIONS.includes(
    (decision ?? '').trim() as ClosedUrlHealthReviewDecision,
  )
}

export function buildUrlHealthReviewMap(
  rows: UrlHealthReviewRow[],
): Map<string, UrlHealthReview> {
  const reviews = new Map<string, UrlHealthReview>()

  for (const row of rows) {
    const url = normalizeUrlForReview(row.url)
    if (!url) continue

    const decision = (row.decision ?? '').trim()
    reviews.set(url, {
      url,
      source: (row.source ?? '').trim(),
      decision,
      isClosed: isClosedUrlHealthReviewDecision(decision),
    })
  }

  return reviews
}

export function isReviewedUrlHealthIssueOpen(
  row: UrlHealthIssueRow,
  reviews: Map<string, UrlHealthReview>,
): boolean {
  if (row.classification !== 'blocked') return true

  const review = reviews.get(normalizeUrlForReview(row.url))
  return !review?.isClosed
}

export function summarizeUrlHealthReviews(
  rows: UrlHealthIssueRow[],
  reviews: Map<string, UrlHealthReview>,
): { closedReviewedIssues: number; unappliedReviews: number } {
  const appliedReviewUrls = new Set<string>()
  let closedReviewedIssues = 0

  for (const row of rows) {
    const url = normalizeUrlForReview(row.url)
    const review = reviews.get(url)
    if (!review?.isClosed) continue

    appliedReviewUrls.add(url)
    if (!isReviewedUrlHealthIssueOpen(row, reviews)) {
      closedReviewedIssues += 1
    }
  }

  const unappliedReviews = [...reviews.values()].filter(
    review => review.isClosed && !appliedReviewUrls.has(review.url),
  ).length

  return { closedReviewedIssues, unappliedReviews }
}
