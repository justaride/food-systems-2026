import {
  validateLibraryAiCard,
  type LibraryAiCard,
} from './library-analysis'
import type { LibraryAnalysisInventoryRow } from './library-analysis-inventory'

export type LibraryAnalysisUpsertPayload = {
  where: {
    sourceKind_sourceKey: {
      sourceKind: string
      sourceKey: string
    }
  }
  create: LibraryAnalysisMutationPayload
  update: LibraryAnalysisMutationPayload
}

export type LibraryAnalysisMutationPayload = {
  sourceKind: string
  sourceKey: string
  documentId: string | null
  sourceDocId: string | null
  canonicalPath: string | null
  title: string
  status: string
  usageRule: string
  reviewStatus: string
  citationReadiness: string | null
  analysisTier: string
  aiCard: LibraryAiCard
  aiSummary: string
  keyFindings: string[]
  claimCandidates: LibraryAiCard['claimCandidates']
  projectImplications: string[]
  gaps: LibraryAiCard['gaps']
  controlLinks: LibraryAiCard['controlLinks']
  riskFlags: string[]
  contentHash: string
  wordCount: number
  processedAt: Date
}

export type LibraryAnalysisRecordIdentity = {
  sourceKind: string
  sourceKey: string
}

export function findStaleLibraryAnalysisRecordIdentities(
  currentRows: LibraryAnalysisInventoryRow[],
  existingRecords: LibraryAnalysisRecordIdentity[],
): LibraryAnalysisRecordIdentity[] {
  const currentKeys = new Set(currentRows.map(row => identityKey(row)))
  return existingRecords
    .filter(record => !currentKeys.has(identityKey(record)))
    .sort((a, b) => identityKey(a).localeCompare(identityKey(b)))
}

export function buildDraftLibraryAiCard(row: LibraryAnalysisInventoryRow): LibraryAiCard {
  const card: LibraryAiCard = {
    shortSummary: `${row.title} er triagert som ${row.sourceKind} med ${row.wordCount} ord i lokalt grunnlag.`,
    keyFindings: buildKeyFindings(row),
    claimCandidates: [],
    projectImplication: buildProjectImplication(row),
    gaps: row.classification.reasons.map(reason => ({
      kind: gapKindFromReason(reason),
      note: reason,
    })),
    citationStatus: row.citationReadiness ?? 'not_citation_checked',
    recommendedUsageRule: row.classification.usageRule,
    status: row.classification.status,
    controlLinks: buildControlLinks(row),
    riskFlags: [...row.riskFlags, ...row.classification.reasons].filter((value, index, values) => values.indexOf(value) === index),
  }

  const validation = validateLibraryAiCard(card)
  if (!validation.ok) {
    throw new Error(`Invalid library AI card for ${row.sourceKey}: ${validation.issues.join(', ')}`)
  }

  return card
}

function identityKey(identity: LibraryAnalysisRecordIdentity): string {
  return `${identity.sourceKind}:${identity.sourceKey}`
}

export function toLibraryAnalysisUpsertPayload(row: LibraryAnalysisInventoryRow): LibraryAnalysisUpsertPayload {
  const card = buildDraftLibraryAiCard(row)
  const payload: LibraryAnalysisMutationPayload = {
    sourceKind: row.sourceKind,
    sourceKey: row.sourceKey,
    documentId: row.linkedDocumentId,
    sourceDocId: row.linkedSourceDocId,
    canonicalPath: row.canonicalPath,
    title: row.title,
    status: row.classification.status,
    usageRule: row.classification.usageRule,
    reviewStatus: row.classification.reviewRequired ? 'queued' : 'not_required',
    citationReadiness: row.citationReadiness,
    analysisTier: 'triage_card',
    aiCard: card,
    aiSummary: card.shortSummary,
    keyFindings: card.keyFindings,
    claimCandidates: card.claimCandidates,
    projectImplications: [card.projectImplication],
    gaps: card.gaps,
    controlLinks: card.controlLinks,
    riskFlags: card.riskFlags,
    contentHash: row.contentHash,
    wordCount: row.wordCount,
    processedAt: new Date(),
  }

  return {
    where: {
      sourceKind_sourceKey: {
        sourceKind: row.sourceKind,
        sourceKey: row.sourceKey,
      },
    },
    create: payload,
    update: payload,
  }
}

function buildKeyFindings(row: LibraryAnalysisInventoryRow): string[] {
  if (row.classification.reasons.length > 0) {
    return row.classification.reasons.map(reason => `Triage flag: ${reason}`)
  }

  return [
    'Kilden er klar for intern AI-kontekst etter eksisterende claim/citation-gater.',
  ]
}

function buildProjectImplication(row: LibraryAnalysisInventoryRow): string {
  if (row.classification.usageRule === 'claim_candidate_review') {
    return 'Mulige claims maa rutes via PCQ/claim-lock og eksisterende overclaim/citable-gater.'
  }
  if (row.classification.usageRule === 'requires_actor_gate') {
    return 'Type-B hull krever aktoravklaring for videre prosjektbruk.'
  }
  if (row.classification.usageRule === 'type_c_gap') {
    return 'Type-C hull skal markeres som ikke-lukkbart med desk research alene.'
  }
  if (row.classification.usageRule === 'do_not_use_for_claims') {
    return 'Kilden kan beholdes sokbar, men skal ikke brukes som claim-grunnlag.'
  }
  if (row.classification.usageRule === 'safe_for_ai_context') {
    return 'Kilden kan brukes som intern AI-kontekst, men ikke som ekstern claim uten ordinær gate.'
  }

  return 'Kilden kan brukes som intern bakgrunn etter review av status og lokator.'
}

function buildControlLinks(row: LibraryAnalysisInventoryRow): LibraryAiCard['controlLinks'] {
  const links: LibraryAiCard['controlLinks'] = []
  if (row.linkedDocumentId) {
    links.push({ label: 'Bibliotek', href: `/bibliotek/${row.linkedDocumentId}` })
  }
  if (row.linkedSourceDocId) {
    links.push({ label: 'Kilde', href: `/kilder#${row.linkedSourceDocId}` })
  }
  if (row.canonicalPath) {
    links.push({ label: 'Repo', href: `/${row.canonicalPath}` })
  }
  if (links.length === 0) {
    links.push({ label: 'AI-kunnskap', href: '/ai-kunnskap' })
  }
  return links
}

function gapKindFromReason(reason: string): LibraryAiCard['gaps'][number]['kind'] {
  if (reason === 'type_b_actor_gate') return 'type_b_actor_gate'
  if (reason === 'type_c_not_desk_research') return 'type_c_not_desk_research'
  if (reason === 'missing_text' || reason === 'low_text_quality') return 'needs_text_extraction'
  if (reason === 'orphan_source' || reason === 'missing_file_path') return 'unclear_source'
  return 'unclear_source'
}
