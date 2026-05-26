export type ReviewDocumentRef = {
  docId: string
  docTitle: string
}

export type CurrentDocumentRef = {
  id: string
  title: string
}

export type LinkedEvidenceRef = CurrentDocumentRef & {
  documentId: string | null
}

export type InsightDocumentRefKey = {
  insightId: string
  documentId: string
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

export function insightDocumentRefKey(ref: InsightDocumentRefKey): string {
  return `${ref.insightId}::${ref.documentId}`
}

export function filterNewInsightDocumentRefs<T extends InsightDocumentRefKey>(
  planned: T[],
  existing: InsightDocumentRefKey[],
): T[] {
  const seenKeys = new Set(existing.map(insightDocumentRefKey))
  return planned.filter((ref) => {
    const key = insightDocumentRefKey(ref)
    if (seenKeys.has(key)) return false
    seenKeys.add(key)
    return true
  })
}

export function resolveReviewDocumentId(
  reviewed: ReviewDocumentRef,
  currentDocuments: CurrentDocumentRef[],
  linkedEvidenceRefs: LinkedEvidenceRef[] = [],
): string | null {
  if (currentDocuments.some((document) => document.id === reviewed.docId)) {
    return reviewed.docId
  }

  const exactEvidence = linkedEvidenceRefs.find((evidence) => evidence.id === reviewed.docId && evidence.documentId)
  if (exactEvidence?.documentId) return exactEvidence.documentId

  const reviewedTitle = normalizeTitle(reviewed.docTitle)
  if (!reviewedTitle) return null

  const matches = currentDocuments.filter((document) => normalizeTitle(document.title) === reviewedTitle)
  if (matches.length === 1) return matches[0].id

  const evidenceMatches = linkedEvidenceRefs.filter(
    (evidence) => evidence.documentId && normalizeTitle(evidence.title) === reviewedTitle,
  )
  return evidenceMatches.length === 1 ? evidenceMatches[0].documentId : null
}
