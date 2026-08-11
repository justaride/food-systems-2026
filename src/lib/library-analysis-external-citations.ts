import { createHash } from 'node:crypto'
import {
  assessCitationUse,
  type CitationPolicyInput,
} from './citations/external-citation-policy'

export type LibraryAnalysisCitationPolicyInput = CitationPolicyInput & {
  id?: string | null
}

export type LibraryAnalysisExternalCitationPolicyState = {
  eligibleCitationIds: string[]
  policyHash: string | null
}

type JsonValue = string | number | boolean | null | JsonObject | JsonValue[]
type JsonObject = { [key: string]: JsonValue }

const APPROVAL_EVIDENCE_KEY = 'externalApprovalEvidence'

export function assessLibraryAnalysisExternalCitationPolicy(
  citations: LibraryAnalysisCitationPolicyInput[],
): LibraryAnalysisExternalCitationPolicyState {
  const eligibleCitations = citations.filter(citation => (
    assessCitationUse(citation, 'external').allowedForAnswer
  ))
  if (eligibleCitations.length === 0) {
    return { eligibleCitationIds: [], policyHash: null }
  }

  const policySnapshot = eligibleCitations
    .map(citation => ({
      id: normalizedString(citation.id),
      sourceClass: citation.sourceClass,
      citationReadiness: citation.citationReadiness,
      verificationStatus: citation.verificationStatus,
      url: normalizedString(citation.url),
      archivedUrl: normalizedString(citation.archivedUrl),
      accessedAt: normalizedDate(citation.accessedAt),
    }))
    .sort((left, right) => JSON.stringify(left).localeCompare(JSON.stringify(right)))

  return {
    eligibleCitationIds: policySnapshot
      .map(citation => citation.id)
      .filter((id): id is string => Boolean(id)),
    policyHash: createHash('sha256')
      .update(JSON.stringify(policySnapshot))
      .digest('hex'),
  }
}

export function readLibraryAnalysisExternalCitationPolicyHash(aiCard: unknown): string | null {
  const card = jsonObject(aiCard)
  const evidence = jsonObject(card?.[APPROVAL_EVIDENCE_KEY])
  const policyHash = evidence?.citationPolicyHash
  return typeof policyHash === 'string' && /^[a-f0-9]{64}$/.test(policyHash)
    ? policyHash
    : null
}

export function setLibraryAnalysisExternalApprovalEvidence(
  aiCard: unknown,
  evidence: { citationPolicyHash: string; eligibleCitationIds: string[] } | null,
): JsonObject {
  const card = { ...(jsonObject(aiCard) ?? {}) }
  if (!evidence) {
    delete card[APPROVAL_EVIDENCE_KEY]
    return card
  }

  card[APPROVAL_EVIDENCE_KEY] = {
    citationPolicyHash: evidence.citationPolicyHash,
    eligibleCitationIds: [...evidence.eligibleCitationIds].sort(),
  }
  return card
}

function normalizedString(value: string | null | undefined): string | null {
  const normalized = value?.trim()
  return normalized || null
}

function normalizedDate(value: Date | string | null): string | null {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

function jsonObject(value: unknown): JsonObject | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  return value as JsonObject
}
