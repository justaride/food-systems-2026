import { basename } from 'node:path'
import type { RequiredCitation } from './import-helpers'

export const BAREKRAFT_IMPORT_ACCESSED_AT = '2026-05-18'

export type BarekraftCitationSourceDoc = {
  id: string
  title?: string | null
  author?: string | null
  year?: string | null
  url?: string | null
}

export function buildBarekraftDocumentCitation(
  sourceDoc: BarekraftCitationSourceDoc,
  localPath: string,
): RequiredCitation {
  const title = normalizeText(sourceDoc.title) ?? basename(localPath).replace(/\.[^.]+$/, '')
  const author = normalizeText(sourceDoc.author) ?? 'Bærekraft Kartlegging Prosjekt'
  const year = normalizeText(sourceDoc.year) ?? 'u.d.'
  const url = normalizeText(sourceDoc.url)

  return {
    sourceClass: 'synthesis',
    citationText: `${author}. (${year}). ${title}.`,
    accessedAt: BAREKRAFT_IMPORT_ACCESSED_AT,
    ...(url ? { url } : {}),
    localPath,
    sourceDocId: sourceDoc.id,
    captureMethod: 'script',
    confidence: 80,
  }
}

function normalizeText(value: string | null | undefined): string | undefined {
  const normalized = value?.trim().replace(/\s+/g, ' ')
  return normalized ? normalized : undefined
}
