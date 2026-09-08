// Negative authority only: known invalid identities remain blocked even when
// an older database snapshot still carries permissive classification fields.
export const SYNTHETIC_MATSVINN_DOCUMENT_ID = 'cmppas6oi00003evmux65v0s6'
export const SOURCE_QUARANTINE_MESSAGE = 'Syntetisk oppgaveplassholder. Ingen verifiserbar oppgave er dokumentert. Skal ikke brukes som kilde, AI-kontekst eller grunnlag for påstander.'

export type SourceIdentity = {
  id?: string | null; documentId?: string | null; sourceKey?: string | null;
  slug?: string | null; filePath?: string | null; canonicalPath?: string | null;
  documentType?: string | null; riskFlags?: readonly string[]
}

export function isQuarantinedSource(source: SourceIdentity): boolean {
  const identities = [source.id, source.documentId, source.sourceKey, source.slug, source.filePath, source.canonicalPath]
  return source.documentType === 'quarantined_synthetic' ||
    Boolean(source.riskFlags?.includes('synthetic_identity')) || identities.some(value =>
      value === SYNTHETIC_MATSVINN_DOCUMENT_ID ||
      value === `document:${SYNTHETIC_MATSVINN_DOCUMENT_ID}` ||
      value === 'cmqjoewzd00vbzpvmkzfba3bw' ||
      value === 'matsvinnloven-2025' || value === 'thesis-matsvinnloven-2025' ||
      value === 'research/thesis-matsvinnloven-2025.md',
    )
}

export function quarantineLibraryRecord<T extends SourceIdentity & { status: string; usageRule: string; riskFlags: string[] }>(record: T): T {
  if (!isQuarantinedSource(record)) return record
  return {
    ...record,
    status: 'blocked',
    usageRule: 'do_not_use_for_claims',
    citationReadiness: 'blocked_unsourced',
    riskFlags: [...new Set([...record.riskFlags, 'synthetic_identity', 'not_citable'])],
  }
}

export function quarantineDocument<T extends SourceIdentity>(document: T): T {
  if (!isQuarantinedSource(document)) return document
  return {
    ...document,
    title: 'Karantene: syntetisk oppgaveplassholder',
    author: null, year: null, wordCount: 0,
    documentType: 'quarantined_synthetic',
    summary: SOURCE_QUARANTINE_MESSAGE,
    content: SOURCE_QUARANTINE_MESSAGE,
    url: null,
    tags: ['synthetic_identity', 'not_citable'],
    thesis: null, sourceCitations: [], sourceDoc: null,
  }
}
