import { z } from "zod";

import {
  CANDIDATE_ASSERTION_TYPES,
  canonicalCandidateJson,
  candidateAnalysisSha256,
  compareCandidateJsonKeysUtf8,
  type CandidateJsonValue,
} from "./candidate-analysis-contract";
import type {
  LibraryAnalysisAgentQueueJob,
  LibraryAnalysisAgentQueueSource,
  LibraryAnalysisVerifiedJob,
} from "./library-analysis-agent-queue";

const HASH = /^[a-f0-9]{64}$/u;
const hashSchema = z.string().regex(HASH);
const idSchema = z.string().regex(/^[a-z0-9][a-z0-9._:-]*$/u);
const textSchema = z.string().min(1);

export const LIBRARY_ANALYSIS_AGENT_SEGMENT_RESPONSE_SCHEMA =
  "library-analysis-agent-segment-response/v1" as const;

export const LibraryAnalysisAgentModelReceiptSchema = z.object({
  provider: z.literal("openai-codex"),
  name: z.literal("gpt-5.6-luna"),
  version: textSchema,
}).strict();
export type LibraryAnalysisAgentModelReceipt = z.infer<
  typeof LibraryAnalysisAgentModelReceiptSchema
>;

const coverageStatusSchema = z.enum([
  "claims_extracted",
  "no_material_claim",
  "blocked",
]);
const blockedReasonCodeSchema = z.enum([
  "unreadable_content",
  "ambiguous_content",
  "unsupported_content",
  "insufficient_context",
]);

export const LibraryAnalysisAgentCoverageSchema = z.object({
  contentUnitId: idSchema,
  status: coverageStatusSchema,
  reason: textSchema.optional(),
  reasonCode: blockedReasonCodeSchema.optional(),
}).strict();
export type LibraryAnalysisAgentCoverage = z.infer<typeof LibraryAnalysisAgentCoverageSchema>;
const coverageSchema = LibraryAnalysisAgentCoverageSchema;

const responseClaimSchema = z.object({
  localOrdinal: z.number().int().nonnegative(),
  assertionType: z.enum(CANDIDATE_ASSERTION_TYPES),
  contentUnitId: idSchema,
  text: textSchema,
  evidence: textSchema,
  locator: textSchema,
  confidence: z.number().min(0).max(1).nullable(),
}).strict();

const responseCoreSchema = z.object({
  schema: z.literal(LIBRARY_ANALYSIS_AGENT_SEGMENT_RESPONSE_SCHEMA),
  queueHash: hashSchema,
  jobId: idSchema,
  jobHash: hashSchema,
  attempt: z.number().int().positive(),
  inputHash: hashSchema,
  model: LibraryAnalysisAgentModelReceiptSchema,
  unitCoverage: z.array(coverageSchema),
  claims: z.array(responseClaimSchema),
}).strict();

const CONTEXT_DEPENDENT_OPENING = /^(?:derfor|dermed|følgelig|således|therefore|thus|hence|consequently)\b/iu;
const UNBOUNDED_PERIOD_REFERENCE = /(?:\b(?:during|throughout|across|in|for)\s+(?:the|this)\s+period\b|\b(?:gjennom|over|i)\s+(?:denne\s+)?perioden\b)/iu;
const UNANCHORED_RELATIVE_REFERENCE = /\b(?:i\s+økende\s+grad|de\s+siste\s+to\s+tiårene|foreløpig|currently)\b/iu;
const AUDITED_GENERIC_SUBJECT = /^(?:(?:oppgaven|studien)\s+(?:dokumenterer|finner|viser)|(?:the\s+(?:study|assignment))\s+(?:documents?|finds?|shows?))\b/iu;
const AUDITED_HERE_REFERENCE = /^(?:driftsinntekter\s+her\s+økte|revenue\s+here\s+increased)\b/iu;
const ANOTHER_FACTOR = /\b(?:en\s+annen\s+faktor|another\s+factor)\b/iu;
const PRIOR_FACTOR = /\b(?:faktor|factor)\b/iu;
const UNRESOLVED_GENERIC_REFERENCE = /\b(?:arbeidet(?!\s+(?:med|for|av)\b)|metoden(?!\s+(?:for|til|med)\b)|kartleggingen(?!\s+(?:av|for|i)\b)|kartleggingene|resultatet(?!\s+(?:av|fra|for|i)\b)|resultatene(?!\s+(?:av|fra|for|i)\b)|the\s+results?(?!\s+(?:of|from|for|in)\b))\b/iu;
const UNRESOLVED_RESULT_EVIDENCE = /\b(?:resultatet(?!\s+(?:av|fra|for|i)\b)|the\s+result(?!\s+(?:of|from|for|in)\b))\b/iu;
const UNRESOLVED_PLURAL_RESULT_EVIDENCE_OPENING = /^(?:resultatene(?!\s+(?:av|fra|for|i)\b)|the\s+results(?!\s+(?:of|from|for|in)\b))\b/iu;
const EXPLICIT_YEAR = /\b(?:19|20)\d{2}\b/u;
const MATERIAL_SCOPE_QUALIFIERS = [
  /\bi\s+denne\s+sammenhengen\b/iu,
  /\bin\s+this\s+context\b/iu,
] as const;
const REPORTED_MEASURE = /\b(?:rapporterer|reports?)\b[\s\S]{0,180}\b(?:tiltak|measures?|actions?)\b/iu;
const REPORTING_BASIS = /\b(?:kvalitativ\s+innholdsanalyse|content\s+analysis|b[\u00e6a]rekraftsrapporter|sustainability\s+reports?|based\s+on|basert\s+på)\b/iu;
const OWNERSHIP_OR_CONTROL = /\b(?:eier|eid\s+av|kontrolleres\s+av|owns?|owned\s+by|controlled\s+by)\b/iu;
const ANALYTICAL_ACTION = /\b(?:har\s+(?:beregnet|kartlagt)|(?:ble|er)\s+(?:beregnet|kartlagt)|beregner|beregnet|kartlegger|kartla|estimerer|estimerte|has\s+(?:calculated|mapped|estimated)|(?:was|were)\s+(?:calculated|mapped|estimated)|calculates?|mapped|maps?|estimates?|estimated)\b/iu;
const ANALYTICAL_OUTCOME = /\b(?:avkastning|RNOA|lønnsomhet|driftsmarginer?|operating\s+margins?|returns?|profitability)\b/iu;
const ANALYTICAL_BASIS = /\b(?:basert\s+på|med\s+utgangspunkt\s+i|på\s+grunnlag\s+av|ved\s+hjelp\s+av|regnskapstall|regnskapsdata|årsrapporter?|årsregnskap|based\s+on|using\s+(?:financial\s+statements?|accounts?|accounting\s+data|annual\s+reports?)|financial\s+statements?|annual\s+reports?)\b/iu;
const INCOMPLETE_NEGATED_ANALYSIS_EVIDENCE = /\b(?:ikke\s+har\s+analysert|did\s+not\s+analy[sz]e|has\s+not\s+analy[sz]ed)\s*$/iu;
const MATERIAL_EXCLUSION = /\b(?:not\s+included|excluded|not\s+counted|inngår\s+ikke|ikke\s+inkludert|ikke\s+medregnet)\b/iu;
const FRANCHISE_SCOPE = /\b(?:franchise[- ]owned\s+stores?|franchiseeide\s+butikker|kjøpmannseide\s+butikker)\b/iu;
const POSSESSIVE_OWNERSHIP_TARGET = /\b(?:is|was)\s+(?:(?:listed|identified|reported)\s+as\s+)?(?:the\s+)?([\p{L}\p{N}.& -]{2,80}?)'s\s+(?:largest|majority|controlling)\s+(?:owner|shareholder)\b/iu;
const NORWEGIAN_POSSESSIVE_OWNERSHIP_TARGET = /\b(?:er|var)\s+([\p{Lu}][\p{L}\p{N}.& -]{1,80}?)s\s+største\s+eier\b/u;
const CONTEXT_DEPENDENT_EVIDENCE_OPENING = /^(?:this\s+(?:survey|questionnaire|study)|denne\s+(?:undersøkelsen|studien|kartleggingen))\b/iu;
const NAMED_STUDY_IDENTITY = /\b(?:the\s+)?([A-Z][A-Z0-9&.-]{2,})\s+(?:survey|questionnaire|study)\b/u;
const NAMED_NORWEGIAN_STUDY_IDENTITY = /\b([A-ZÆØÅ][A-ZÆØÅ0-9&.-]{2,})[- ](?:undersøkelsen|studien|kartleggingen)\b/u;
const EXPLICIT_TABULAR_FIELDS = /\b(?:id|priority|status|country|coding_target|next_action)\s*[:=]/iu;
const DELIMITED_ROW = /^(?:[^,\t]*[,\t]){1,}[^,\t]*$/u;
const ENGLISH_EXCLUSION_AFTER_MARKER = /\b(?:excludes?|does\s+not\s+include|did\s+not\s+include)\s+([^.;,:]{2,120})/iu;
const NORWEGIAN_EXCLUSION_AFTER_MARKER = /\b(?:utelater|utelot|ekskluderer|ekskluderte|inkluderer\s+ikke)\s+([^.;,:]{2,120})/iu;
const ENGLISH_EXCLUSION_MARKER = /\b(?:not\s+included|excluded|not\s+counted|excludes?|does\s+not\s+include|did\s+not\s+include)\b/iu;
const NORWEGIAN_EXCLUSION_MARKER = /\b(?:inngår\s+ikke|ikke\s+inkludert|ikke\s+medregnet|utelater|utelot|ekskluderer|ekskluderte|inkluderer\s+ikke)\b/iu;
const ENGLISH_EVIDENCE_CONTEXT = /\b(?:the|figures?|stores?|companies|respondents?|data)\b/iu;
const NORWEGIAN_EVIDENCE_CONTEXT = /\b(?:tallene|butikker|selskaper|respondenter|dataene)\b/iu;
const GENERIC_EXPECTATION = /^(?:forventningen\s+er|the\s+expectation\s+is)\b/iu;
const OPERATIONAL_STATUS = /(?:\bdashboard(?:et)?\b[\s\S]{0,80}\b(?:brukes|anvendes|is\s+used)\b|\b(?:ingen|no)\b[\s\S]{0,80}\b(?:partnere?|partners?)\b[\s\S]{0,80}\b(?:kontaktet|contacted)\b)/iu;
const NAMED_SCOPE = /\bfor\s+(?!(?:prosjektet|søknaden|the\s+project|the\s+application)\b)[A-ZÆØÅ][\p{L}\p{N}-]*(?:\s+[A-ZÆØÅ][\p{L}\p{N}-]*)+/u;
const SURVEY_UNIT_CONTEXT = /\b(?:survey|questionnaire|respondents?|responses?|companies\s+indicated|could\s+you\s+rank|your\s+company)\b/iu;
const SURVEY_DEPENDENT_CLAIM = /\b(?:respondents?|respondent\s+companies|most\s+(?:of\s+the\s+)?companies|on\s+average|rank(?:ed|ing)?|total(?:\s+collective)?\s+production|forecast(?:ed)?|foreseen|projection)\b/iu;
const LOCAL_SURVEY_SCOPE = /\b(?:(?:among|from|of|sample\s+of)\s+|responses?\s+from\s+)?\d{1,4}\s+(?:(?:EU|European|Nordic|surveyed)\s+)?(?:(?:insect\s+farming|insect-food|food)\s+)?(?:companies|respondents|producers)\b/iu;
const FORECAST_CLAIM = /\b(?:forecast(?:ed)?|foreseen|projection|projected)\b/iu;
const FORECAST_BASIS = /\b(?:based\s+on|using|scenario|model(?:led|ed|ing)?|estimated?\s+from|responses?\s+from)\b/iu;
const AUTHORITY_TERMS = [
  /\bpublication[- ]ready\b/iu,
  /\bready for publication\b/iu,
  /\bexternal(?:ly)? ready\b/iu,
  /\b(?:rights|publication)[ -](?:approved|cleared)\b/iu,
  /\b(?:externally valid(?:ated)?|external validity)\b/iu,
  /\bpubliseringsklar\b/iu,
  /\bklar for publisering\b/iu,
  /\beksternt klar\b/iu,
  /\b(?:rettighets|publiserings)godkjent\b/iu,
] as const;

function assertSelfContainedClaimText(claimText: string, evidence: string): void {
  const normalizedClaim = claimText.trim();
  const normalizedEvidence = evidence.trim();
  const anotherFactor = ANOTHER_FACTOR.exec(normalizedClaim);
  const unresolvedAnotherFactor = anotherFactor !== null &&
    !PRIOR_FACTOR.test(normalizedClaim.slice(0, anotherFactor.index));
  if (
    CONTEXT_DEPENDENT_OPENING.test(normalizedClaim) ||
    (UNBOUNDED_PERIOD_REFERENCE.test(normalizedClaim) && !EXPLICIT_YEAR.test(normalizedClaim)) ||
    (UNANCHORED_RELATIVE_REFERENCE.test(normalizedClaim) && !EXPLICIT_YEAR.test(normalizedClaim)) ||
    AUDITED_GENERIC_SUBJECT.test(normalizedClaim) ||
    AUDITED_HERE_REFERENCE.test(normalizedClaim) ||
    unresolvedAnotherFactor ||
    UNRESOLVED_GENERIC_REFERENCE.test(normalizedClaim)
  ) {
    throw new Error("agent_response_context_dependent_claim");
  }
  if (
    UNRESOLVED_RESULT_EVIDENCE.test(normalizedEvidence) ||
    UNRESOLVED_PLURAL_RESULT_EVIDENCE_OPENING.test(normalizedEvidence)
  ) {
    throw new Error("agent_response_evidence_context_dependent");
  }
  const namedStudyIdentity = NAMED_STUDY_IDENTITY.exec(normalizedClaim)?.[1] ??
    NAMED_NORWEGIAN_STUDY_IDENTITY.exec(normalizedClaim)?.[1];
  if (
    CONTEXT_DEPENDENT_EVIDENCE_OPENING.test(normalizedEvidence) &&
    namedStudyIdentity !== undefined &&
    !normalizedEvidence.includes(namedStudyIdentity)
  ) {
    throw new Error("agent_response_evidence_context_dependent");
  }
  if (INCOMPLETE_NEGATED_ANALYSIS_EVIDENCE.test(normalizedEvidence)) {
    throw new Error("agent_response_evidence_incomplete");
  }
  if (
    MATERIAL_EXCLUSION.test(normalizedClaim) &&
    FRANCHISE_SCOPE.test(normalizedClaim) &&
    (!MATERIAL_EXCLUSION.test(normalizedEvidence) || !FRANCHISE_SCOPE.test(normalizedEvidence))
  ) {
    throw new Error("agent_response_material_exclusion_missing");
  }
  const englishExcludedObject = ENGLISH_EXCLUSION_AFTER_MARKER.exec(normalizedClaim)?.[1]?.trim();
  const norwegianExcludedObject = NORWEGIAN_EXCLUSION_AFTER_MARKER.exec(normalizedClaim)?.[1]?.trim();
  if (
    englishExcludedObject !== undefined &&
    ENGLISH_EVIDENCE_CONTEXT.test(normalizedEvidence) &&
    (!ENGLISH_EXCLUSION_MARKER.test(normalizedEvidence) ||
      !normalizedEvidence.toLocaleLowerCase("en").includes(englishExcludedObject.toLocaleLowerCase("en")))
  ) {
    throw new Error("agent_response_material_exclusion_missing");
  }
  if (
    norwegianExcludedObject !== undefined &&
    NORWEGIAN_EVIDENCE_CONTEXT.test(normalizedEvidence) &&
    (!NORWEGIAN_EXCLUSION_MARKER.test(normalizedEvidence) ||
      !normalizedEvidence.toLocaleLowerCase("no").includes(norwegianExcludedObject.toLocaleLowerCase("no")))
  ) {
    throw new Error("agent_response_material_exclusion_missing");
  }
  for (const qualifier of MATERIAL_SCOPE_QUALIFIERS) {
    if (qualifier.test(evidence) && !qualifier.test(normalizedClaim)) {
      throw new Error("agent_response_scope_qualifier_mismatch");
    }
  }
}

function assertAuditedScopeCompleteness(
  claimText: string,
  evidence: string,
  sourceText: string,
): void {
  if (REPORTED_MEASURE.test(claimText) && (
    !EXPLICIT_YEAR.test(claimText) ||
    !EXPLICIT_YEAR.test(evidence) ||
    !REPORTING_BASIS.test(claimText) ||
    !REPORTING_BASIS.test(evidence)
  )) {
    throw new Error("agent_response_reported_measure_context_missing");
  }
  if (OWNERSHIP_OR_CONTROL.test(claimText) && (
    !EXPLICIT_YEAR.test(claimText) || !EXPLICIT_YEAR.test(evidence)
  )) {
    throw new Error("agent_response_ownership_as_of_missing");
  }
  const possessiveOwnershipTarget = POSSESSIVE_OWNERSHIP_TARGET.exec(claimText)?.[1]?.trim();
  const norwegianPossessiveOwnershipTarget = NORWEGIAN_POSSESSIVE_OWNERSHIP_TARGET
    .exec(claimText)?.[1]?.trim();
  const ownershipTarget = possessiveOwnershipTarget ?? norwegianPossessiveOwnershipTarget;
  if (
    ownershipTarget !== undefined &&
    !evidence.toLocaleLowerCase("en").includes(ownershipTarget.toLocaleLowerCase("en"))
  ) {
    throw new Error("agent_response_ownership_scope_missing");
  }
  const analyticalClaimSegment = claimText
    .split(/[.!?]+/u)
    .find((segment) => ANALYTICAL_ACTION.test(segment) && ANALYTICAL_OUTCOME.test(segment));
  const analyticalEvidenceSegment = evidence
    .split(/[.!?]+/u)
    .find((segment) => ANALYTICAL_ACTION.test(segment) && ANALYTICAL_OUTCOME.test(segment));
  if (analyticalClaimSegment !== undefined && (
    analyticalEvidenceSegment === undefined ||
    !EXPLICIT_YEAR.test(analyticalClaimSegment) ||
    !EXPLICIT_YEAR.test(analyticalEvidenceSegment) ||
    !ANALYTICAL_BASIS.test(analyticalClaimSegment) ||
    !ANALYTICAL_BASIS.test(analyticalEvidenceSegment)
  )) {
    throw new Error("agent_response_analytical_measure_context_missing");
  }
  if (GENERIC_EXPECTATION.test(claimText)) {
    throw new Error("agent_response_expectation_actor_scope_missing");
  }
  if (OPERATIONAL_STATUS.test(claimText) && (
    !EXPLICIT_YEAR.test(claimText) ||
    !EXPLICIT_YEAR.test(evidence) ||
    !NAMED_SCOPE.test(claimText) ||
    !NAMED_SCOPE.test(evidence)
  )) {
    throw new Error("agent_response_status_scope_or_as_of_missing");
  }
  if (
    SURVEY_UNIT_CONTEXT.test(sourceText) &&
    SURVEY_DEPENDENT_CLAIM.test(claimText) &&
    !LOCAL_SURVEY_SCOPE.test(evidence)
  ) {
    throw new Error("agent_response_survey_scope_missing");
  }
  if (
    SURVEY_UNIT_CONTEXT.test(sourceText) &&
    FORECAST_CLAIM.test(claimText) &&
    !FORECAST_BASIS.test(evidence)
  ) {
    throw new Error("agent_response_forecast_basis_missing");
  }
}

function assertAuthorityLanguageIsSourceVisible(claimText: string, evidence: string): void {
  for (const term of AUTHORITY_TERMS) {
    if (term.test(claimText) && !term.test(evidence)) {
      throw new Error("agent_response_authority_overreach");
    }
  }
}

function assertTabularEvidenceContext(evidence: string, unitType: string): void {
  if (
    unitType === "sheet_range" &&
    DELIMITED_ROW.test(evidence) &&
    !evidence.includes("\n") &&
    !EXPLICIT_TABULAR_FIELDS.test(evidence)
  ) {
    throw new Error("agent_response_tabular_context_missing");
  }
}

export const LibraryAnalysisAgentSegmentResponseSchema = responseCoreSchema
  .extend({ responseHash: hashSchema })
  .superRefine((response, context) => {
    const coverageIds = response.unitCoverage.map(({ contentUnitId }) => contentUnitId);
    if (new Set(coverageIds).size !== coverageIds.length) {
      context.addIssue({ code: "custom", message: "duplicate_unit_coverage" });
    }
    const localOrdinals = response.claims.map(({ localOrdinal }) => localOrdinal);
    if (new Set(localOrdinals).size !== localOrdinals.length) {
      context.addIssue({ code: "custom", message: "duplicate_claim_local_ordinal" });
    }
    for (const coverage of response.unitCoverage) {
      if (coverage.status === "blocked" && coverage.reasonCode === undefined) {
        context.addIssue({ code: "custom", message: "blocked_reason_code_required" });
      }
      if (coverage.status !== "blocked" && (coverage.reason !== undefined || coverage.reasonCode !== undefined)) {
        context.addIssue({ code: "custom", message: "coverage_reason_not_allowed" });
      }
    }
    const claimUnitIds = new Set(response.claims.map(({ contentUnitId }) => contentUnitId));
    for (const coverage of response.unitCoverage) {
      if (coverage.status === "claims_extracted" && !claimUnitIds.has(coverage.contentUnitId)) {
        context.addIssue({ code: "custom", message: "claims_extracted_requires_claim" });
      }
    }
  });
export type LibraryAnalysisAgentSegmentResponse = z.infer<
  typeof LibraryAnalysisAgentSegmentResponseSchema
>;

export const LibraryAnalysisAcceptedClaimSchema = responseClaimSchema.extend({
  claimId: idSchema,
});
export type LibraryAnalysisAcceptedClaim = z.infer<typeof LibraryAnalysisAcceptedClaimSchema>;

export const LibraryAnalysisAcceptedSegmentSchema = responseCoreSchema
  .extend({
    segmentOrdinal: z.number().int().nonnegative().optional(),
    claims: z.array(LibraryAnalysisAcceptedClaimSchema),
    responseHash: hashSchema,
  });
export type LibraryAnalysisAcceptedSegment = z.infer<
  typeof LibraryAnalysisAcceptedSegmentSchema
>;

export const LIBRARY_ANALYSIS_AGENT_SOURCE_RESULT_SCHEMA =
  "library-analysis-source-result/v1" as const;

const terminalStateSchema = z.enum(["accepted", "partial", "failed", "quarantined"]);
export type LibraryAnalysisAgentTerminalState = z.infer<typeof terminalStateSchema>;

export function deriveLibraryAnalysisAgentTerminalState(
  segment: Pick<LibraryAnalysisTerminalSegment, "terminalState" | "status" | "unitCoverage">,
  fallback: "accepted" | "failed" = "accepted",
): LibraryAnalysisAgentTerminalState {
  if (segment.terminalState !== undefined && segment.status !== undefined && segment.terminalState !== segment.status) {
    throw new Error("source_merge_terminal_state_conflict");
  }
  return segment.terminalState ?? segment.status ?? (
    segment.unitCoverage.some((row) => row.status === "blocked") ? "partial" : fallback
  );
}

const attemptReceiptSchema = z.object({
  attempt: z.number().int().positive(),
  inputHash: hashSchema,
  responseHash: hashSchema,
  status: terminalStateSchema.optional(),
  terminalReason: textSchema.optional(),
  model: LibraryAnalysisAgentModelReceiptSchema,
}).strict();
export type LibraryAnalysisAgentAttemptReceipt = z.infer<typeof attemptReceiptSchema>;

const terminalSegmentExtensionSchema = z.object({
  terminalState: terminalStateSchema.optional(),
  status: terminalStateSchema.optional(),
  terminalReason: textSchema.optional(),
  attempts: z.array(attemptReceiptSchema).min(1).optional(),
}).strict();

/** Task 3 accepted segments are successful terminal segments by default. */
export const LibraryAnalysisTerminalSegmentSchema =
  LibraryAnalysisAcceptedSegmentSchema.and(terminalSegmentExtensionSchema);
export type LibraryAnalysisTerminalSegment = z.infer<
  typeof LibraryAnalysisTerminalSegmentSchema
>;

export const LibraryAnalysisSourceSegmentReceiptSchema = z.object({
  jobId: idSchema,
  segmentOrdinal: z.number().int().nonnegative(),
  jobHash: hashSchema,
  terminalState: terminalStateSchema,
  attempts: z.array(attemptReceiptSchema).min(1),
  model: LibraryAnalysisAgentModelReceiptSchema,
  attempt: z.number().int().positive(),
  inputHash: hashSchema,
  responseHash: hashSchema,
  terminalReason: textSchema.optional(),
}).strict();
export type LibraryAnalysisSourceSegmentReceipt = z.infer<
  typeof LibraryAnalysisSourceSegmentReceiptSchema
>;

export const LibraryAnalysisSourceResultSchema = z.object({
  schema: z.literal(LIBRARY_ANALYSIS_AGENT_SOURCE_RESULT_SCHEMA),
  queueHash: hashSchema,
  sourceEnvelopeHash: hashSchema,
  unitCoverage: z.array(LibraryAnalysisAgentCoverageSchema),
  claims: z.array(LibraryAnalysisAcceptedClaimSchema),
  segments: z.array(LibraryAnalysisSourceSegmentReceiptSchema),
  analysisState: z.enum(["complete", "partial", "failed", "quarantined"]),
  sourceResultHash: hashSchema,
}).strict();
export type LibraryAnalysisSourceResult = z.infer<typeof LibraryAnalysisSourceResultSchema>;

export function verifyLibraryAnalysisSourceResult(raw: unknown): LibraryAnalysisSourceResult {
  const parsed = LibraryAnalysisSourceResultSchema.parse(raw);
  const { sourceResultHash: _hash, ...core } = parsed;
  if (parsed.sourceResultHash !== candidateAnalysisSha256(
    "library-analysis-source-result",
    core as unknown as CandidateJsonValue,
  )) {
    throw new Error("source_result_hash_mismatch");
  }
  return parsed;
}

const queueJobSchema = z.object({
  jobId: idSchema,
  sourceKind: idSchema,
  sourceKey: textSchema,
  segmentOrdinal: z.number().int().nonnegative(),
  unitIds: z.array(idSchema).min(1),
  unitOrdinalStart: z.number().int().nonnegative(),
  unitOrdinalEnd: z.number().int().nonnegative(),
  codePoints: z.number().int().positive(),
  bytes: z.number().int().positive(),
  inputEnvelopeHash: hashSchema,
}).strict();

const attemptUnitSchema = z.object({
  id: idSchema,
  sourceKind: idSchema,
  sourceKey: idSchema,
  populationSourceKey: textSchema,
  sourceVersionHash: hashSchema,
  unitType: z.string().min(1),
  ordinal: z.number().int().nonnegative(),
  locator: textSchema,
  locatorHash: hashSchema,
  contentHash: hashSchema,
  hashAlgorithm: z.literal("sha256"),
  identityConfidence: z.string().min(1),
  chunkPolicyHash: hashSchema,
  portablePath: textSchema,
  sizeBytes: z.number().int().positive(),
  codePoints: z.number().int().positive(),
  text: textSchema,
}).strict();

const fileBindingSchema = z.object({
  id: idSchema,
  version: textSchema,
  path: textSchema,
  hash: hashSchema,
}).strict();

export const LibraryAnalysisAgentAttemptInputSchema = z.object({
  schema: z.literal("library-analysis-agent-job-input/v1"),
  queueId: idSchema,
  queueHash: hashSchema,
  jobId: idSchema,
  attempt: z.number().int().positive(),
  expectedModel: LibraryAnalysisAgentModelReceiptSchema,
  job: queueJobSchema,
  executionPolicy: z.record(z.string(), z.unknown()),
  workflow: fileBindingSchema,
  analysisPrompt: fileBindingSchema,
  validationWorkflow: fileBindingSchema,
  validationPrompt: fileBindingSchema,
  units: z.array(attemptUnitSchema).min(1),
  inputHash: hashSchema,
}).strict();
export type LibraryAnalysisAgentAttemptInput = z.infer<
  typeof LibraryAnalysisAgentAttemptInputSchema
>;

export type LibraryAnalysisAgentSegmentResponseValidationInput = {
  queueHash: string;
  attempt: number;
  inputHash: string;
  expectedModel: LibraryAnalysisAgentModelReceipt;
  job: LibraryAnalysisVerifiedJob;
  response: unknown;
};

export function libraryAnalysisAgentSegmentResponseHash(response: unknown): string {
  if (response === null || typeof response !== "object" || Array.isArray(response)) {
    throw new Error("agent_response_shape_invalid");
  }
  const { responseHash: _responseHash, ...core } = response as Record<string, unknown>;
  return candidateAnalysisSha256(
    "library-analysis-agent-segment-response",
    core as CandidateJsonValue,
  );
}

export function validateLibraryAnalysisAgentSegmentResponse(
  input: LibraryAnalysisAgentSegmentResponseValidationInput,
): LibraryAnalysisAcceptedSegment {
  const expectedModel = LibraryAnalysisAgentModelReceiptSchema.parse(input.expectedModel);
  if (!HASH.test(input.queueHash)) throw new Error("agent_response_queue_hash_invalid");
  if (!Number.isInteger(input.attempt) || input.attempt < 1) throw new Error("agent_response_attempt_invalid");
  if (!HASH.test(input.inputHash)) throw new Error("agent_response_input_hash_invalid");
  const response = LibraryAnalysisAgentSegmentResponseSchema.parse(input.response);
  if (response.responseHash !== libraryAnalysisAgentSegmentResponseHash(response)) {
    throw new Error("agent_response_response_hash_mismatch");
  }
  if (
    response.queueHash !== input.queueHash ||
    response.jobId !== input.job.job.jobId ||
    response.jobHash !== input.job.job.inputEnvelopeHash ||
    response.attempt !== input.attempt ||
    response.inputHash !== input.inputHash
  ) {
    throw new Error("agent_response_job_binding_mismatch");
  }
  if (
    response.model.provider !== expectedModel.provider ||
    response.model.name !== expectedModel.name ||
    response.model.version !== expectedModel.version
  ) {
    throw new Error("agent_response_model_receipt_mismatch");
  }
  assertExactCoverage(input.job, response.unitCoverage);
  const coverageByUnit = new Map(response.unitCoverage.map((coverage) => [coverage.contentUnitId, coverage]));
  const claims = response.claims.map((claim) => {
    const unit = ownedUnit(input.job, claim.contentUnitId);
    const coverage = coverageByUnit.get(claim.contentUnitId);
    if (coverage?.status !== "claims_extracted") {
      throw new Error("agent_response_claim_coverage_mismatch");
    }
    if (claim.locator !== unit.descriptor.locator) {
      throw new Error("agent_response_locator_ownership_mismatch");
    }
    if (!unit.text.includes(claim.evidence)) {
      throw new Error("agent_response_evidence_not_contained");
    }
    assertSelfContainedClaimText(claim.text, claim.evidence);
    assertAuditedScopeCompleteness(claim.text, claim.evidence, unit.text);
    assertTabularEvidenceContext(claim.evidence, unit.descriptor.unitType);
    assertAuthorityLanguageIsSourceVisible(claim.text, claim.evidence);
    assertNumericTokens(claim.text, claim.evidence);
    return {
      ...claim,
      claimId: deterministicLibraryAnalysisAgentClaimId(input.job.job, claim),
    };
  });
  return LibraryAnalysisAcceptedSegmentSchema.parse({
    ...response,
    segmentOrdinal: input.job.job.segmentOrdinal,
    claims,
  });
}

export function mergeLibraryAnalysisSourceSegments(input: {
  queueHash: string;
  source: LibraryAnalysisAgentQueueSource;
  segments: readonly LibraryAnalysisTerminalSegment[];
  expectedJobs?: readonly LibraryAnalysisAgentQueueJob[];
  jobs?: readonly LibraryAnalysisAgentQueueJob[];
}): LibraryAnalysisSourceResult {
  if (!HASH.test(input.queueHash)) throw new Error("source_merge_queue_hash_invalid");
  if (!HASH.test(input.source.sourceEnvelopeHash)) throw new Error("source_merge_source_hash_invalid");
  const sourceUnitIds = input.source.unitIds;
  const sourceCore = {
    sourceKind: input.source.sourceKind,
    sourceKey: input.source.sourceKey,
    sourceVersionHash: input.source.sourceVersionHash,
    unitIds: input.source.unitIds,
    unitCount: input.source.unitCount,
    codePoints: input.source.codePoints,
    bytes: input.source.bytes,
  };
  if (input.source.sourceEnvelopeHash !== candidateAnalysisSha256("library-analysis-agent-source", sourceCore)) {
    throw new Error("source_merge_source_hash_mismatch");
  }
  if (
    sourceUnitIds.length !== input.source.unitCount ||
    new Set(sourceUnitIds).size !== sourceUnitIds.length ||
    input.segments.length === 0
  ) {
    throw new Error("source_merge_coverage_mismatch");
  }
  const expectedJobs = [...(input.expectedJobs ?? input.jobs ?? [])];
  if (expectedJobs.length === 0 || new Set(expectedJobs.map((job) => job.jobId)).size !== expectedJobs.length) {
    throw new Error("source_merge_job_set_mismatch");
  }
  const expectedById = new Map(expectedJobs.map((job) => [job.jobId, job]));
  const expectedUnitIds = new Set(expectedJobs.flatMap((job) => job.unitIds));
  if (
    expectedUnitIds.size !== sourceUnitIds.length ||
    sourceUnitIds.some((id) => !expectedUnitIds.has(id)) ||
    expectedJobs.some((job) =>
      job.sourceKind !== input.source.sourceKind ||
      job.sourceKey !== input.source.sourceKey ||
      job.unitIds.some((id) => !sourceUnitIds.includes(id)))
  ) {
    throw new Error("source_merge_job_set_mismatch");
  }

  const segments = input.segments.map((raw) => LibraryAnalysisTerminalSegmentSchema.parse(raw));
  if (
    segments.length !== expectedJobs.length ||
    new Set(segments.map((segment) => segment.jobId)).size !== segments.length
  ) {
    throw new Error("source_merge_job_set_mismatch");
  }
  const covered = new Set<string>();
  const coverageRows: LibraryAnalysisAgentCoverage[] = [];
  for (const segment of segments) {
    const expectedJob = expectedById.get(segment.jobId);
    if (
      expectedJob === undefined ||
      segment.segmentOrdinal !== expectedJob.segmentOrdinal ||
      segment.jobHash !== expectedJob.inputEnvelopeHash
    ) {
      throw new Error("source_merge_job_set_mismatch");
    }
    if (segment.queueHash !== input.queueHash) throw new Error("source_merge_queue_hash_mismatch");
    const coverageIds = segment.unitCoverage.map((coverage) => coverage.contentUnitId);
    if (
      coverageIds.length !== expectedJob.unitIds.length ||
      coverageIds.some((id, index) => id !== expectedJob.unitIds[index])
    ) {
      throw new Error("source_merge_job_unit_coverage_mismatch");
    }
    assertUniqueAttemptReceipts(segment);
    for (const coverage of segment.unitCoverage) {
      if (!sourceUnitIds.includes(coverage.contentUnitId) || covered.has(coverage.contentUnitId)) {
        throw new Error("source_merge_coverage_mismatch");
      }
      covered.add(coverage.contentUnitId);
      coverageRows.push(coverage);
    }
    for (const claim of segment.claims) {
      const coverage = segment.unitCoverage.find((row) => row.contentUnitId === claim.contentUnitId);
      if (coverage?.status !== "claims_extracted") {
        throw new Error("source_merge_claim_coverage_mismatch");
      }
    }
    for (const coverage of segment.unitCoverage) {
      if (
        coverage.status === "claims_extracted" &&
        !segment.claims.some((claim) => claim.contentUnitId === coverage.contentUnitId)
      ) {
        throw new Error("source_merge_claim_coverage_mismatch");
      }
    }
  }
  if (covered.size !== sourceUnitIds.length || sourceUnitIds.some((id) => !covered.has(id))) {
    throw new Error("source_merge_coverage_mismatch");
  }

  const sortedSegments = [...segments].sort(compareSegments);
  const sortedCoverage = sourceUnitIds.map((id) => {
    const row = coverageRows.find((candidate) => candidate.contentUnitId === id);
    if (row === undefined) throw new Error("source_merge_coverage_mismatch");
    return row;
  });
  const claims = deduplicateAcceptedClaims(sortedSegments.flatMap((segment) => segment.claims));
  const segmentReceipts = sortedSegments.map(segmentReceipt);
  const analysisState = deriveSourceAnalysisState(sortedSegments);
  const core = {
    schema: LIBRARY_ANALYSIS_AGENT_SOURCE_RESULT_SCHEMA,
    queueHash: input.queueHash,
    sourceEnvelopeHash: input.source.sourceEnvelopeHash,
    unitCoverage: sortedCoverage,
    claims,
    segments: segmentReceipts,
    analysisState,
  } satisfies Omit<LibraryAnalysisSourceResult, "sourceResultHash">;
  return LibraryAnalysisSourceResultSchema.parse({
    ...core,
    sourceResultHash: candidateAnalysisSha256(
      "library-analysis-source-result",
      core as unknown as CandidateJsonValue,
    ),
  });
}

function compareSegments(
  left: LibraryAnalysisTerminalSegment,
  right: LibraryAnalysisTerminalSegment,
): number {
  return (left.segmentOrdinal ?? Number.MAX_SAFE_INTEGER) -
    (right.segmentOrdinal ?? Number.MAX_SAFE_INTEGER) ||
    compareCandidateJsonKeysUtf8(left.jobId, right.jobId);
}

function segmentReceipt(
  segment: LibraryAnalysisTerminalSegment,
): LibraryAnalysisSourceSegmentReceipt {
  const defaultAttempt: LibraryAnalysisAgentAttemptReceipt = {
    attempt: segment.attempt,
    inputHash: segment.inputHash,
    responseHash: segment.responseHash,
    model: segment.model,
  };
  const terminalState = deriveLibraryAnalysisAgentTerminalState(segment);
  defaultAttempt.status = terminalState;
  if (segment.terminalReason !== undefined) defaultAttempt.terminalReason = segment.terminalReason;
  const attempts = segment.attempts ?? [defaultAttempt];
  const normalizedAttempts = [...attempts]
    .map((attempt) => attempt.terminalReason === undefined && attempt.status === undefined
      ? {
        attempt: attempt.attempt,
        inputHash: attempt.inputHash,
        responseHash: attempt.responseHash,
        model: attempt.model,
      }
      : {
        ...attempt,
        ...(attempt.status === undefined ? {} : { status: attempt.status }),
        ...(attempt.terminalReason === undefined ? {} : { terminalReason: attempt.terminalReason }),
      })
    .sort((left, right) => left.attempt - right.attempt);
  return LibraryAnalysisSourceSegmentReceiptSchema.parse({
    jobId: segment.jobId,
    segmentOrdinal: segment.segmentOrdinal ?? 0,
    jobHash: segment.jobHash,
    terminalState,
    attempts: normalizedAttempts,
    model: segment.model,
    attempt: segment.attempt,
    inputHash: segment.inputHash,
    responseHash: segment.responseHash,
    ...(segment.terminalReason === undefined ? {} : { terminalReason: segment.terminalReason }),
  });
}

function assertUniqueAttemptReceipts(segment: LibraryAnalysisTerminalSegment): void {
  const attempts = segment.attempts ?? [{
    attempt: segment.attempt,
    inputHash: segment.inputHash,
    responseHash: segment.responseHash,
    model: segment.model,
  }];
  if (new Set(attempts.map((receipt) => receipt.attempt)).size !== attempts.length) {
    throw new Error("source_merge_attempt_duplicate");
  }
}

function deriveSourceAnalysisState(
  segments: readonly LibraryAnalysisTerminalSegment[],
): LibraryAnalysisSourceResult["analysisState"] {
  const states = segments.map((segment) => deriveLibraryAnalysisAgentTerminalState(segment));
  if (states.includes("quarantined")) return "quarantined";
  if (states.includes("failed")) return "failed";
  if (states.includes("partial")) return "partial";
  return "complete";
}

function deduplicateAcceptedClaims(
  claims: readonly LibraryAnalysisAcceptedClaim[],
): LibraryAnalysisAcceptedClaim[] {
  const sorted = [...claims].sort((left, right) => {
    const leftTuple = claimTuple(left);
    const rightTuple = claimTuple(right);
    return compareCandidateJsonKeysUtf8(leftTuple, rightTuple) ||
      compareCandidateJsonKeysUtf8(left.claimId, right.claimId);
  });
  const seen = new Set<string>();
  const result: LibraryAnalysisAcceptedClaim[] = [];
  for (const claim of sorted) {
    const tuple = claimTuple(claim);
    if (seen.has(tuple)) continue;
    seen.add(tuple);
    result.push(claim);
  }
  return result;
}

function claimTuple(claim: LibraryAnalysisAcceptedClaim): string {
  const { claimId: _claimId, ...tuple } = claim;
  return canonicalCandidateJson(tuple as unknown as CandidateJsonValue);
}

export function deterministicLibraryAnalysisAgentClaimId(
  job: LibraryAnalysisAgentQueueJob,
  claim: { contentUnitId: string; localOrdinal: number },
): string {
  const digest = candidateAnalysisSha256("library-analysis-agent-claim", {
    jobId: job.jobId,
    jobHash: job.inputEnvelopeHash,
    sourceKind: job.sourceKind,
    sourceKey: job.sourceKey,
    contentUnitId: claim.contentUnitId,
    localOrdinal: claim.localOrdinal,
  });
  return `claim:library-agent:${digest}`;
}

export const deterministicClaimId = deterministicLibraryAnalysisAgentClaimId;

function assertExactCoverage(
  job: LibraryAnalysisVerifiedJob,
  coverage: readonly z.infer<typeof coverageSchema>[],
): void {
  const expected = job.units.map(({ descriptor }) => descriptor.id);
  const actual = coverage.map(({ contentUnitId }) => contentUnitId);
  if (
    actual.length !== expected.length ||
    new Set(actual).size !== actual.length ||
    expected.some((id) => !actual.includes(id))
  ) {
    throw new Error("agent_response_unit_coverage_mismatch");
  }
}

function ownedUnit(
  job: LibraryAnalysisVerifiedJob,
  contentUnitId: string,
): LibraryAnalysisVerifiedJob["units"][number] {
  const unit = job.units.find(({ descriptor }) => descriptor.id === contentUnitId);
  if (unit === undefined) throw new Error("agent_response_content_unit_ownership_mismatch");
  return unit;
}

type NumericToken = {
  value: string;
  sign: "negative" | "positive" | "unsigned";
  marker: string;
};

function assertNumericTokens(claimText: string, evidence: string): void {
  const claimed = numericTokens(claimText);
  const available = numericTokens(evidence);
  const remaining = [...available];
  for (const token of claimed) {
    const index = remaining.findIndex((candidate) =>
      candidate.value === token.value &&
      candidate.sign === token.sign &&
      candidate.marker === token.marker);
    if (index < 0) throw new Error("agent_response_numeric_token_mismatch");
    remaining.splice(index, 1);
  }
}

function numericTokens(text: string): NumericToken[] {
  const tokens: NumericToken[] = [];
  const pattern = /[+\-−]?(?:\d{1,3}(?:[\s,]\d{3})+|\d+)(?:[.,]\d+)?/gu;
  for (const match of text.matchAll(pattern)) {
    const raw = match[0]!;
    const start = match.index ?? 0;
    const before = text.slice(Math.max(0, start - 8), start);
    const after = text.slice(start + raw.length, Math.min(text.length, start + raw.length + 12));
    const sign = raw.startsWith("-") || raw.startsWith("−")
      ? "negative"
      : raw.startsWith("+") ? "positive" : "unsigned";
    const marker = /^(?:\s*)(?:%|percent(?:age)?|prosent)\b/iu.test(after) ||
      /^(?:%)/u.test(after)
      ? "percent"
      : currencyMarker(before, after) ?? "none";
    tokens.push({ value: normalizeNumber(raw), sign, marker });
  }
  return tokens;
}

function currencyMarker(before: string, after: string): string | null {
  const prefix = /(?:[$€£]|kr|nok|usd|eur|gbp)\s*$/iu.exec(before)?.[0];
  if (prefix !== undefined) return normalizeCurrencyMarker(prefix);
  const suffix = /^\s*(?:kr|nok|usd|eur|gbp)\b/iu.exec(after)?.[0];
  return suffix === undefined ? null : normalizeCurrencyMarker(suffix);
}

function normalizeCurrencyMarker(raw: string): string {
  const normalized = raw.trim().toUpperCase();
  if (normalized === "€") return "currency:EUR";
  if (normalized === "$") return "currency:USD";
  if (normalized === "£") return "currency:GBP";
  if (normalized === "KR") return "currency:KR";
  return `currency:${normalized}`;
}

function normalizeNumber(raw: string): string {
  const unsigned = raw.replace(/^[+\-−]/u, "").replaceAll(" ", "");
  if (unsigned.includes(",") && unsigned.includes(".")) {
    return unsigned.replaceAll(",", "");
  }
  if (unsigned.includes(",")) {
    const [whole, fraction] = unsigned.split(",");
    return fraction !== undefined && fraction.length === 3
      ? `${whole}${fraction}`
      : `${whole}.${fraction ?? ""}`;
  }
  return unsigned;
}

export function canonicalLibraryAnalysisAgentSegmentResponse(
  response: LibraryAnalysisAgentSegmentResponse,
): string {
  return canonicalCandidateJson(response as unknown as CandidateJsonValue);
}
