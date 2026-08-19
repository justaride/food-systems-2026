import {
  validateLibraryAiCard,
  type LibraryAiCard,
  type LibraryAiCardClaimCandidate,
} from './library-analysis'
import {
  libraryAnalysisPayloadHash,
  type LibraryAnalysisRunCreatePayload,
  type LibraryAnalysisRunOptions,
} from './library-analysis-processing'

export const LIBRARY_ANALYSIS_MODEL_TIER = 'model_analysis'

// Version the instructions, not just the code. A run row records which
// instructions produced it, so two runs can be compared knowing whether the
// prompt changed between them.
export const LIBRARY_ANALYSIS_PROMPT_VERSION = 'library-analysis-v1'

export const LIBRARY_ANALYSIS_INSTRUCTIONS = [
  'Analyse each source in `requests` and return one card per source.',
  '',
  'Return JSON of the shape:',
  '{ "aiModel": "<model id>", "promptVersion": "library-analysis-v1",',
  '  "analyses": [ { "sourceKey": "<the request sourceKey>", "card": { ... } } ] }',
  '',
  'Each card must contain:',
  '- shortSummary: one paragraph, in the language of the source',
  '- keyFindings: array of short statements',
  '- claimCandidates: array, may be empty',
  '- projectImplication: what this means for the food-systems work',
  '- gaps: array of { kind, note }; kind is one of none, type_b_actor_gate,',
  '  type_c_not_desk_research, needs_text_extraction, unclear_source',
  '- citationStatus: string',
  '- recommendedUsageRule: internal_background, safe_for_ai_context,',
  '  claim_candidate_review, do_not_use_for_claims, requires_actor_gate or type_c_gap',
  '- status: ai_draft, review_required or blocked',
  '- controlLinks: at least one { label, href }',
  '- riskFlags: array of short strings',
  '',
  'Rules that will reject the analysis if broken:',
  '- recommendedUsageRule may never be safe_for_external_claims. Only a human',
  '  can grant external claim authority.',
  '- every claimCandidate needs text, evidence quoted or closely paraphrased',
  '  from the supplied source text, and a locator (pageRef, or sourcePath equal',
  '  to the request canonicalPath).',
  '- a claim may never cite a source other than the one being analysed.',
  '- a source with no documentId and no sourceDocId may carry no claims.',
  '',
  'Ground every statement in the supplied text. If the text does not support a',
  'claim, leave it out and record the gap instead.',
].join('\n')

// What a model is given in order to analyse one source. The text is the exact
// material the analysis must be grounded in; contentHash binds the run row to
// that material so a later reader can tell which bytes were analysed.
export type LibraryAnalysisRequest = {
  sourceKind: string
  sourceKey: string
  title: string
  canonicalPath: string | null
  documentId: string | null
  sourceDocId: string | null
  contentHash: string | null
  wordCount: number
  text: string
}

export type LibraryAnalysisAcceptance =
  | { accepted: true; sourceKey: string; card: LibraryAiCard }
  | { accepted: false; sourceKey: string; issues: string[] }

/**
 * Gate for model-produced analyses.
 *
 * The shared validateLibraryAiCard runs first, so a model card must clear the
 * same bar as the triage pipeline — including that a model can never award
 * itself `safe_for_external_claims`.
 *
 * On top of that this adds the grounding rules the shared validator is
 * deliberately looser about, because the triage pipeline produces no claims of
 * its own while a model does:
 *
 * - a claim needs both stated evidence and a locator, not either one;
 * - a locator may only point at the source that was actually analysed;
 * - a source with no database link cannot carry claims at all, because there
 *   is nothing for a later citation to resolve against.
 */
export function acceptLibraryAnalysisCard(
  request: LibraryAnalysisRequest,
  card: unknown,
): LibraryAnalysisAcceptance {
  const issues: string[] = []

  if (!card || typeof card !== 'object' || Array.isArray(card)) {
    return { accepted: false, sourceKey: request.sourceKey, issues: ['card_not_an_object'] }
  }

  const candidateCard = card as Partial<LibraryAiCard>
  issues.push(...validateLibraryAiCard(candidateCard).issues)

  const claims = Array.isArray(candidateCard.claimCandidates) ? candidateCard.claimCandidates : []
  if (claims.length > 0 && !request.documentId && !request.sourceDocId) {
    issues.push('claims_require_a_linked_source')
  }

  for (const [index, claim] of claims.entries()) {
    issues.push(...claimIssues(request, claim, index))
  }

  if (issues.length > 0) {
    return { accepted: false, sourceKey: request.sourceKey, issues: dedupe(issues) }
  }

  return { accepted: true, sourceKey: request.sourceKey, card: candidateCard as LibraryAiCard }
}

export function toLibraryAnalysisRunFromCard(
  request: LibraryAnalysisRequest,
  card: LibraryAiCard,
  options: LibraryAnalysisRunOptions,
): LibraryAnalysisRunCreatePayload {
  const content = {
    aiCard: card,
    aiSummary: card.shortSummary,
    keyFindings: card.keyFindings,
    claimCandidates: card.claimCandidates,
    projectImplications: [card.projectImplication],
    gaps: card.gaps,
    controlLinks: card.controlLinks,
    riskFlags: card.riskFlags,
  }

  return {
    sourceKind: request.sourceKind,
    sourceKey: request.sourceKey,
    documentId: request.documentId,
    sourceDocId: request.sourceDocId,
    canonicalPath: request.canonicalPath,
    title: request.title,
    runId: options.runId,
    aiModel: options.aiModel,
    promptVersion: options.promptVersion,
    analysisTier: LIBRARY_ANALYSIS_MODEL_TIER,
    ...content,
    contentHash: request.contentHash,
    payloadHash: libraryAnalysisPayloadHash(content),
    wordCount: request.wordCount,
  }
}

function claimIssues(
  request: LibraryAnalysisRequest,
  claim: LibraryAiCardClaimCandidate,
  index: number,
): string[] {
  const issues: string[] = []
  const at = `claim_${index}`

  if (!claim || typeof claim !== 'object') return [`${at}_not_an_object`]
  if (!claim.text?.trim()) issues.push(`${at}_missing_text`)
  if (!claim.evidence?.trim()) issues.push(`${at}_missing_evidence`)

  const locator = claim.sourcePath?.trim() || claim.pageRef?.trim()
  if (!locator) issues.push(`${at}_missing_locator`)

  const claimedPath = claim.sourcePath?.trim()
  if (claimedPath && request.canonicalPath && claimedPath !== request.canonicalPath) {
    issues.push(`${at}_locator_points_outside_source`)
  }
  if (claimedPath && !request.canonicalPath) {
    issues.push(`${at}_locator_points_outside_source`)
  }

  return issues
}

function dedupe(values: string[]): string[] {
  return values.filter((value, index) => values.indexOf(value) === index)
}
