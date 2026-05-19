export type ReviewDocumentRef = {
  docId: string
  docTitle: string
}

export type CurrentDocumentRef = {
  id: string
  title: string
}

function normalizeTitle(value: string): string {
  return value
    .toLowerCase()
    .replace(/[æä]/g, 'ae')
    .replace(/[øö]/g, 'o')
    .replace(/[å]/g, 'aa')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
}

export function resolveReviewDocumentId(
  reviewed: ReviewDocumentRef,
  currentDocuments: CurrentDocumentRef[],
): string | null {
  if (currentDocuments.some((document) => document.id === reviewed.docId)) {
    return reviewed.docId
  }

  const reviewedTitle = normalizeTitle(reviewed.docTitle)
  if (!reviewedTitle) return null

  const matches = currentDocuments.filter((document) => normalizeTitle(document.title) === reviewedTitle)
  return matches.length === 1 ? matches[0].id : null
}
