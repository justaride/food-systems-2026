import { hasResolvedReportSourceUrlException } from './citations/citation-readiness-queue'

export type DocumentLocatorRow = {
  url?: string | null
  filePath?: string | null
  report?: {
    provenanceType?: string | null
    supportingSources?: unknown
  } | null
}

function supportingSourceCount(value: unknown): number {
  return Array.isArray(value) ? value.length : 0
}

function hasExplicitNonEvidenceReportProvenance(document: DocumentLocatorRow): boolean {
  return (
    document.report?.provenanceType === 'blocked_source' &&
    supportingSourceCount(document.report.supportingSources) > 0
  )
}

export function hasDocumentLocator(
  document: DocumentLocatorRow,
  localFileExists: (filePath: string | null | undefined) => boolean,
): boolean {
  if (document.url?.trim()) return true
  if (localFileExists(document.filePath)) return true
  if (hasExplicitNonEvidenceReportProvenance(document)) return true

  return hasResolvedReportSourceUrlException({
    provenanceType: document.report?.provenanceType,
    supportingSourceCount: supportingSourceCount(document.report?.supportingSources),
  })
}
