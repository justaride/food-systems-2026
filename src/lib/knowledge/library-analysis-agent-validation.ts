import { createHash } from "node:crypto";

import { z } from "zod";

import {
  canonicalCandidateJson,
  candidateAnalysisSha256,
  type CandidateJsonValue,
} from "./candidate-analysis-contract";
import {
  deriveAutomatedDisposition,
  AutomatedLibraryAnalysisResultSchema,
  AutomatedValidationFindingSchema,
  type AutomatedLibraryAnalysisResult,
  type AutomatedValidationFinding,
} from "./library-analysis-automated-validation";
import {
  checkEvidenceBinding,
  checkEvidenceClauseBoundary,
  checkMaterialQualifierPreservation,
  checkQuantitativeFacts,
} from "./library-analysis-evidence-gates";
import {
  LibraryAnalysisSourceResultSchema,
  type LibraryAnalysisAcceptedClaim,
  type LibraryAnalysisAgentModelReceipt,
  type LibraryAnalysisSourceResult,
} from "./library-analysis-agent-response";
import type { LibraryAnalysisAgentQueueUnit } from "./library-analysis-agent-queue";

const HASH = /^[a-f0-9]{64}$/u;
const hashSchema = z.string().regex(HASH);
const identifierSchema = z.string().regex(/^[a-z0-9][a-z0-9._:-]*$/u);
const textSchema = z.string().min(1);
const NUMERIC_TOKEN_PATTERN = /[+-]?(?:\d{1,3}(?:[ ,]\d{3})+|\d+)(?:[.,]\d+)?/gu;
const PERCENTAGE_POINT_MARKER_PATTERN = /^\s*(?:percentage[\s-]+points?|prosent[\s-]*poeng)(?![a-z])/iu;
const PERCENT_MARKER_PATTERN = /^\s*(%|percent(?:age)?|prosent)(?![a-z])/iu;
const CURRENCY_PREFIX_PATTERN = /(?:^|[\s([{])([#$€£]|NOK|USD|EUR|GBP|SEK|DKK|kr)\s*$/iu;
const CURRENCY_SUFFIX_PATTERN = /^\s*(NOK|USD|EUR|GBP|SEK|DKK|kr)(?![a-z])|^\s*([$€£])(?=\s|[.,;:!?)]|$)/iu;

export const LIBRARY_ANALYSIS_AGENT_VALIDATION_REQUEST_SCHEMA =
  "library-analysis-agent-validation-request/v1" as const;
export const LIBRARY_ANALYSIS_AGENT_VALIDATION_RESPONSE_SCHEMA =
  "library-analysis-agent-validation-response/v1" as const;
export const LIBRARY_ANALYSIS_AGENT_VALIDATION_RESULT_SCHEMA =
  "library-analysis-agent-validation-result/v1" as const;

export const LibraryAnalysisValidatorModelReceiptSchema = z.object({
  provider: z.literal("openai-codex"),
  name: textSchema,
  version: textSchema,
}).strict();
export type LibraryAnalysisValidatorModelReceipt = z.infer<
  typeof LibraryAnalysisValidatorModelReceiptSchema
>;
export type AgentModelReceipt = LibraryAnalysisAgentModelReceipt | LibraryAnalysisValidatorModelReceipt;
export type AutomatedValidatorSeparationLevel = "same_model" | "separate_model" | "separate_model_plus_deterministic";

const claimPayloadCoreSchema = z.object({
  assertionType: z.string().min(1),
  claimId: identifierSchema,
  contentUnitId: identifierSchema,
  evidence: textSchema,
  locator: textSchema,
  text: textSchema,
}).strict();
const validationClaimSchema = claimPayloadCoreSchema.extend({ payloadHash: hashSchema }).strict();
type ValidationClaim = z.infer<typeof validationClaimSchema>;

const validationUnitSchema = z.object({
  contentUnitId: identifierSchema,
  locator: textSchema,
  contentHash: hashSchema,
  text: textSchema,
}).strict();
type ValidationUnit = z.infer<typeof validationUnitSchema>;

export const LibraryAnalysisAgentValidationRequestSchema = z.object({
  schema: z.literal(LIBRARY_ANALYSIS_AGENT_VALIDATION_REQUEST_SCHEMA),
  queueHash: hashSchema,
  sourceEnvelopeHash: hashSchema,
  sourceResultHash: hashSchema,
  validatorModel: LibraryAnalysisValidatorModelReceiptSchema,
  claims: z.array(validationClaimSchema),
  units: z.array(validationUnitSchema).min(1),
  requestHash: hashSchema,
}).strict();
export type LibraryAnalysisAgentValidationRequest = z.infer<
  typeof LibraryAnalysisAgentValidationRequestSchema
>;

const responseFindingSchema = AutomatedValidationFindingSchema.refine(
  (finding) => finding.validatorKind === "model" && finding.deterministicRuleIds.length === 0,
  "model_findings_must_not_claim_deterministic_rules",
);
export const LibraryAnalysisAgentValidationResponseSchema = z.object({
  schema: z.literal(LIBRARY_ANALYSIS_AGENT_VALIDATION_RESPONSE_SCHEMA),
  requestHash: hashSchema,
  sourceResultHash: hashSchema,
  queueHash: hashSchema,
  sourceEnvelopeHash: hashSchema,
  validatorModel: LibraryAnalysisValidatorModelReceiptSchema,
  findings: z.array(responseFindingSchema),
  riskFlags: z.array(z.enum(["actor", "rights", "person", "health", "causal"])),
  responseHash: hashSchema,
}).strict().superRefine((response, context) => {
  if (new Set(response.findings.map((finding) => finding.findingId)).size !== response.findings.length) {
    context.addIssue({ code: "custom", message: "duplicate_validation_finding_id" });
  }
  if (new Set(response.riskFlags).size !== response.riskFlags.length) {
    context.addIssue({ code: "custom", message: "duplicate_risk_flag" });
  }
});
export type LibraryAnalysisAgentValidationResponse = z.infer<
  typeof LibraryAnalysisAgentValidationResponseSchema
>;

const governanceSchema = z.object({
  automatedOnly: z.literal(true),
  externalReady: z.literal(false),
  externalApiUsed: z.literal(false),
  candidateDatabaseWritten: z.literal(false),
  productionDataMutated: z.literal(false),
  humanSourceReviewRequired: z.literal(false),
}).strict();

export const LibraryAnalysisAgentValidationResultSchema = AutomatedLibraryAnalysisResultSchema
  .omit({ schema: true })
  .extend({
    schema: z.literal(LIBRARY_ANALYSIS_AGENT_VALIDATION_RESULT_SCHEMA),
    queueHash: hashSchema,
    sourceEnvelopeHash: hashSchema,
    sourceResultHash: hashSchema,
    requestHash: hashSchema,
    responseHash: hashSchema.optional(),
    analysisState: z.enum(["complete", "partial", "failed", "quarantined"]),
    contentHashStatus: z.enum(["current", "stale", "missing"]),
    locatorStatus: z.enum(["exact", "partial", "missing"]),
    ...governanceSchema.shape,
    resultHash: hashSchema,
  }).strict();
export type LibraryAnalysisAgentValidationResult = z.infer<
  typeof LibraryAnalysisAgentValidationResultSchema
>;

export type LibraryAnalysisVerifiedSourceUnit = LibraryAnalysisAgentQueueUnit & { text: string };
export type LibraryAnalysisVerifiedSourceUnitInput =
  | LibraryAnalysisVerifiedSourceUnit
  | { descriptor: LibraryAnalysisAgentQueueUnit; text: string };
export type AutomatedLibraryRiskFlag = "actor" | "rights" | "person" | "health" | "causal";

export type BuildLibraryAnalysisAgentValidationRequestInput = {
  queueHash: string;
  sourceEnvelopeHash: string;
  sourceResult: LibraryAnalysisSourceResult;
  units: readonly LibraryAnalysisVerifiedSourceUnitInput[];
  validatorModel?: AgentModelReceipt;
  analysisModels?: readonly AgentModelReceipt[];
  candidateId?: string;
};

export type LibraryAnalysisAgentValidationInput = {
  candidateId: string;
  sourceResult: LibraryAnalysisSourceResult;
  units: readonly LibraryAnalysisVerifiedSourceUnitInput[];
  analysisModels: readonly AgentModelReceipt[];
  validatorModel: AgentModelReceipt;
  populationEligibility: "eligible" | "blocked_input" | "superseded";
  modelFindings?: readonly AutomatedValidationFinding[];
  riskFlags?: readonly AutomatedLibraryRiskFlag[];
  request?: LibraryAnalysisAgentValidationRequest;
  response?: LibraryAnalysisAgentValidationResponse;
};

function sha256Text(value: string): string {
  return createHash("sha256").update(Buffer.from(value, "utf8")).digest("hex");
}

function modelReceipt(model: AgentModelReceipt): LibraryAnalysisValidatorModelReceipt {
  return LibraryAnalysisValidatorModelReceiptSchema.parse(model);
}

function sameModel(left: AgentModelReceipt, right: AgentModelReceipt): boolean {
  return left.provider === right.provider && left.name === right.name && left.version === right.version;
}

export function deriveValidatorSeparation(
  analysisModels: readonly AgentModelReceipt[],
  validatorModel: AgentModelReceipt,
  deterministicRuleIds: readonly string[],
): AutomatedValidatorSeparationLevel {
  const analysis = analysisModels.map((model) => modelReceipt(model));
  const validator = modelReceipt(validatorModel);
  const identityProven = analysis.length > 0 && [...analysis, validator].every((model) => model.version !== "unknown");
  if (!identityProven || analysis.some((model) => sameModel(model, validator))) return "same_model";
  return deterministicRuleIds.length > 0 ? "separate_model_plus_deterministic" : "separate_model";
}

function payloadHash(claim: Pick<ValidationClaim, keyof Omit<ValidationClaim, "payloadHash">>): string {
  return candidateAnalysisSha256("library-analysis-agent-validation-claim-payload", claim as unknown as CandidateJsonValue);
}

function requestHash(request: Omit<LibraryAnalysisAgentValidationRequest, "requestHash">): string {
  return candidateAnalysisSha256("library-analysis-agent-validation-request", request as unknown as CandidateJsonValue);
}

function responseHash(response: Omit<LibraryAnalysisAgentValidationResponse, "responseHash">): string {
  return candidateAnalysisSha256("library-analysis-agent-validation-response", response as unknown as CandidateJsonValue);
}

function resultHash(result: Omit<LibraryAnalysisAgentValidationResult, "resultHash">): string {
  return candidateAnalysisSha256("library-analysis-agent-validation-result", result as unknown as CandidateJsonValue);
}

export function verifyLibraryAnalysisAgentValidationResult(raw: unknown): LibraryAnalysisAgentValidationResult {
  const parsed = LibraryAnalysisAgentValidationResultSchema.parse(raw);
  const { resultHash: _hash, ...core } = parsed;
  if (parsed.resultHash !== resultHash(core)) {
    throw new Error("validation_result_hash_mismatch");
  }
  return parsed;
}

function normalizeUnit(input: LibraryAnalysisVerifiedSourceUnitInput): LibraryAnalysisVerifiedSourceUnit {
  if ("descriptor" in input) return { ...input.descriptor, text: input.text };
  return input;
}

function unitMap(units: readonly LibraryAnalysisVerifiedSourceUnitInput[]): Map<string, LibraryAnalysisVerifiedSourceUnit> {
  const map = new Map<string, LibraryAnalysisVerifiedSourceUnit>();
  for (const rawUnit of units) {
    const unit = normalizeUnit(rawUnit);
    if (map.has(unit.id)) throw new Error("validation_unit_duplicate");
    map.set(unit.id, unit);
  }
  return map;
}

function parseAndVerifySourceResult(sourceResult: LibraryAnalysisSourceResult): LibraryAnalysisSourceResult {
  const parsed = LibraryAnalysisSourceResultSchema.parse(sourceResult);
  const { sourceResultHash: _hash, ...core } = parsed;
  if (parsed.sourceResultHash !== candidateAnalysisSha256("library-analysis-source-result", core as unknown as CandidateJsonValue)) {
    throw new Error("validation_source_result_hash_mismatch");
  }
  return parsed;
}

export function buildLibraryAnalysisAgentValidationRequest(
  rawInput: BuildLibraryAnalysisAgentValidationRequestInput,
): LibraryAnalysisAgentValidationRequest {
  if (!HASH.test(rawInput.queueHash) || !HASH.test(rawInput.sourceEnvelopeHash)) throw new Error("validation_source_binding_invalid");
  const sourceResult = parseAndVerifySourceResult(rawInput.sourceResult);
  if (sourceResult.queueHash !== rawInput.queueHash || sourceResult.sourceEnvelopeHash !== rawInput.sourceEnvelopeHash) {
    throw new Error("validation_source_binding_mismatch");
  }
  const units = unitMap(rawInput.units);
  const coveredUnitIds = new Set(sourceResult.unitCoverage.map((coverage) => coverage.contentUnitId));
  if (units.size !== coveredUnitIds.size || [...coveredUnitIds].some((id) => !units.has(id))) {
    throw new Error("validation_source_unit_coverage_mismatch");
  }
  const requestUnits: ValidationUnit[] = [];
  for (const rawUnit of rawInput.units) {
    const unit = normalizeUnit(rawUnit);
    if (sha256Text(unit.text) !== unit.contentHash) throw new Error("validation_content_hash_mismatch");
    requestUnits.push({ contentUnitId: unit.id, locator: unit.locator, contentHash: unit.contentHash, text: unit.text });
  }
  const claims: ValidationClaim[] = sourceResult.claims.map((rawClaim) => {
    const claim = rawClaim as LibraryAnalysisAcceptedClaim;
    const unit = units.get(claim.contentUnitId);
    if (unit === undefined) throw new Error("validation_claim_unit_missing");
    if (claim.locator !== unit.locator) throw new Error("validation_locator_ownership_mismatch");
    const core = {
      assertionType: claim.assertionType,
      claimId: claim.claimId,
      contentUnitId: claim.contentUnitId,
      evidence: claim.evidence,
      locator: claim.locator,
      text: claim.text,
    };
    return { ...core, payloadHash: payloadHash(core) };
  });
  const core = {
    schema: LIBRARY_ANALYSIS_AGENT_VALIDATION_REQUEST_SCHEMA,
    queueHash: rawInput.queueHash,
    sourceEnvelopeHash: rawInput.sourceEnvelopeHash,
    sourceResultHash: sourceResult.sourceResultHash,
    validatorModel: modelReceipt(rawInput.validatorModel ?? { provider: "openai-codex", name: "gpt-5.6-sol", version: "unknown" }),
    claims,
    units: requestUnits,
  } satisfies Omit<LibraryAnalysisAgentValidationRequest, "requestHash">;
  return LibraryAnalysisAgentValidationRequestSchema.parse({ ...core, requestHash: requestHash(core) });
}

export function validateLibraryAnalysisAgentValidationResponse(input: {
  request: LibraryAnalysisAgentValidationRequest;
  response: unknown;
}): LibraryAnalysisAgentValidationResponse {
  const request = LibraryAnalysisAgentValidationRequestSchema.parse(input.request);
  const response = LibraryAnalysisAgentValidationResponseSchema.parse(input.response);
  const { requestHash: _requestHash, ...requestCore } = request;
  if (request.requestHash !== requestHash(requestCore)) throw new Error("validation_request_hash_mismatch");
  const { responseHash: _responseHash, ...responseCore } = response;
  if (response.responseHash !== responseHash(responseCore)) throw new Error("validation_response_hash_mismatch");
  if (
    response.requestHash !== request.requestHash ||
    response.sourceResultHash !== request.sourceResultHash ||
    response.queueHash !== request.queueHash ||
    response.sourceEnvelopeHash !== request.sourceEnvelopeHash ||
    canonicalCandidateJson(response.validatorModel as unknown as CandidateJsonValue) !== canonicalCandidateJson(request.validatorModel as unknown as CandidateJsonValue)
  ) throw new Error("validation_response_binding_mismatch");
  const claimIds = new Set(request.claims.map((claim) => claim.claimId));
  const unitIds = new Set(request.units.map((unit) => unit.contentUnitId));
  for (const finding of response.findings) {
    if (finding.assertionId !== "assertion:deterministic-gate" && !claimIds.has(finding.assertionId)) throw new Error("validation_response_assertion_binding_mismatch");
    if (finding.contentUnitIds.some((id) => !unitIds.has(id))) throw new Error("validation_response_unit_binding_mismatch");
  }
  return response;
}

function deterministicFinding(input: {
  errorClass: "F1" | "F2" | "F3";
  severity: "critical" | "material";
  ruleId: string;
  contentUnitId: string;
  assertionId?: string;
  explanation: string;
}): AutomatedValidationFinding {
  const core = {
    errorClass: input.errorClass,
    ruleId: input.ruleId,
    contentUnitId: input.contentUnitId,
    assertionId: input.assertionId ?? "assertion:deterministic-gate",
    explanation: input.explanation,
  };
  return AutomatedValidationFindingSchema.parse({
    findingId: `finding:deterministic:${sha256Text(canonicalCandidateJson(core as unknown as CandidateJsonValue))}`,
    assertionId: core.assertionId,
    errorClass: input.errorClass,
    severity: input.severity,
    affectsClaim: true,
    contentUnitIds: [input.contentUnitId],
    explanation: input.explanation,
    validatorKind: "deterministic",
    deterministicRuleIds: [input.ruleId],
  });
}

type AuthoritativeNumericToken = {
  value: string;
  sign: "" | "+" | "-";
  kind: "number" | "percent" | "percentage_point" | "currency";
  currency: string | null;
  currencyPosition: "prefix" | "suffix" | null;
};

function normalizeNumericValue(raw: string): string {
  const compact = raw.replaceAll(" ", "");
  if (/^[+-]?\d{1,3}(?:,\d{3})+$/u.test(compact)) return compact.replaceAll(",", "").replace(/^\+/, "");
  return compact.replace(",", ".").replace(/^\+/, "");
}

function normalizeCurrencyMarker(raw: string): string {
  const marker = raw.toLowerCase();
  if (marker === "kr") return "nok";
  if (marker === "$") return "usd";
  if (marker === "€") return "eur";
  if (marker === "£") return "gbp";
  return marker;
}

function authoritativeNumericTokens(text: string): AuthoritativeNumericToken[] {
  const tokens: AuthoritativeNumericToken[] = [];
  for (const match of text.matchAll(NUMERIC_TOKEN_PATTERN)) {
    const raw = match[0]!;
    const start = match.index ?? 0;
    const end = start + raw.length;
    const sign = raw.startsWith("+") || raw.startsWith("-") ? raw[0] as "+" | "-" : "";
    const before = text.slice(0, start);
    const after = text.slice(end);
    const prefix = CURRENCY_PREFIX_PATTERN.exec(before);
    const suffix = CURRENCY_SUFFIX_PATTERN.exec(after);
    const percentagePoint = PERCENTAGE_POINT_MARKER_PATTERN.exec(after);
    const percent = PERCENT_MARKER_PATTERN.exec(after);
    const currencyMarker = prefix?.[1] ?? suffix?.[1] ?? suffix?.[2] ?? null;
    tokens.push({
      value: normalizeNumericValue(raw),
      sign,
      kind: currencyMarker === null
        ? (percentagePoint !== null ? "percentage_point" : percent === null ? "number" : "percent")
        : "currency",
      currency: currencyMarker === null ? null : normalizeCurrencyMarker(currencyMarker),
      currencyPosition: currencyMarker === null ? null : prefix !== null ? "prefix" : "suffix",
    });
  }
  return tokens;
}

function numericTokenMismatchRule(
  claim: AuthoritativeNumericToken,
  evidenceTokens: readonly AuthoritativeNumericToken[],
): { ruleId: string; explanation: string } {
  const sameValue = evidenceTokens.find((token) => token.value === claim.value);
  if (sameValue !== undefined && sameValue.sign !== claim.sign) {
    return { ruleId: "rule:quantitative:sign", explanation: `Evidence does not preserve the numeric sign for ${claim.sign || "unsigned"}${claim.value}.` };
  }
  const sameSignedValue = evidenceTokens.find((token) => token.value === claim.value && token.sign === claim.sign);
  if (sameSignedValue !== undefined && sameSignedValue.kind !== claim.kind) {
    return { ruleId: "rule:quantitative:percent-marker", explanation: "Evidence changes a percentage marker into a plain number or vice versa." };
  }
  if (
    sameSignedValue !== undefined &&
    claim.kind === "currency" &&
    (sameSignedValue.currency !== claim.currency || sameSignedValue.currencyPosition !== claim.currencyPosition)
  ) {
    return { ruleId: "rule:quantitative:currency", explanation: "Evidence changes the currency identity or currency marker position." };
  }
  return { ruleId: "rule:quantitative:value", explanation: `Evidence does not contain the exact numeric value ${claim.sign}${claim.value}.` };
}

function checkAuthoritativeNumericFacts(input: {
  claim: string;
  evidence: string;
  contentUnitId: string;
  assertionId: string;
}): { findings: AutomatedValidationFinding[]; ruleIds: string[] } {
  const claimTokens = authoritativeNumericTokens(input.claim);
  const remainingEvidence = authoritativeNumericTokens(input.evidence);
  const findings: AutomatedValidationFinding[] = [];
  const ruleIds: string[] = [];
  for (const claimToken of claimTokens) {
    const exactIndex = remainingEvidence.findIndex((evidenceToken) =>
      evidenceToken.value === claimToken.value &&
      evidenceToken.sign === claimToken.sign &&
      evidenceToken.kind === claimToken.kind &&
      (claimToken.kind !== "currency" || (
        evidenceToken.currency === claimToken.currency &&
        evidenceToken.currencyPosition === claimToken.currencyPosition
      )));
    if (exactIndex >= 0) {
      remainingEvidence.splice(exactIndex, 1);
      continue;
    }
    const mismatch = numericTokenMismatchRule(claimToken, remainingEvidence);
    findings.push(deterministicFinding({
      errorClass: "F3",
      severity: "material",
      ruleId: mismatch.ruleId,
      contentUnitId: input.contentUnitId,
      assertionId: input.assertionId,
      explanation: mismatch.explanation,
    }));
    ruleIds.push(mismatch.ruleId);
  }
  return { findings, ruleIds };
}

function deterministicFindings(
  sourceResult: LibraryAnalysisSourceResult,
  units: readonly LibraryAnalysisVerifiedSourceUnitInput[],
): { findings: AutomatedValidationFinding[]; contentHashStatus: "current" | "stale" | "missing"; locatorStatus: "exact" | "partial" | "missing"; ruleIds: string[] } {
  const byId = unitMap(units);
  const findings: AutomatedValidationFinding[] = [];
  const ruleIds: string[] = [];
  let missingHash = units.length === 0;
  let staleHash = false;
  let missingLocator = false;
  let staleLocator = false;
  for (const rawUnit of units) {
    const unit = normalizeUnit(rawUnit);
    if (!unit.contentHash || !HASH.test(unit.contentHash)) missingHash = true;
    else if (sha256Text(unit.text) !== unit.contentHash) staleHash = true;
  }
  for (const claim of sourceResult.claims) {
    const unit = byId.get(claim.contentUnitId);
    if (unit === undefined) {
      missingHash = true;
      findings.push(deterministicFinding({ errorClass: "F1", severity: "critical", ruleId: "rule:source:unit-binding", contentUnitId: claim.contentUnitId, assertionId: claim.claimId, explanation: "Claim references a source unit outside the verified source envelope." }));
      ruleIds.push("rule:source:unit-binding");
      continue;
    }
    if (sha256Text(unit.text) !== unit.contentHash) {
      findings.push(deterministicFinding({ errorClass: "F1", severity: "critical", ruleId: "rule:source:content-hash", contentUnitId: unit.id, assertionId: claim.claimId, explanation: "Verified unit bytes do not match the expected content hash." }));
      ruleIds.push("rule:source:content-hash");
    }
    if (claim.locator !== unit.locator) {
      staleLocator = true;
      findings.push(deterministicFinding({ errorClass: "F2", severity: "critical", ruleId: "rule:evidence:locator-ownership", contentUnitId: unit.id, assertionId: claim.claimId, explanation: "Claim locator is not owned by the referenced source unit." }));
      ruleIds.push("rule:evidence:locator-ownership");
    }
    const evidenceFindings = checkEvidenceBinding({ evidence: claim.evidence, sourceText: unit.text, locator: claim.locator, contentUnitId: unit.id, assertionId: claim.claimId });
    const qualifierFindings = checkMaterialQualifierPreservation({ claim: claim.text, evidence: claim.evidence, contentUnitId: unit.id, assertionId: claim.claimId });
    const clauseBoundaryFindings = checkEvidenceClauseBoundary({ claim: claim.text, evidence: claim.evidence, sourceText: unit.text, locator: claim.locator, contentUnitId: unit.id, assertionId: claim.claimId });
    const quantitativeFindings = checkQuantitativeFacts({ claim: claim.text, evidence: claim.evidence, contentUnitId: unit.id, assertionId: claim.claimId })
      .filter((finding) => finding.deterministicRuleIds.every((ruleId) => !/^rule:quantitative:(number|percentage|percentage_point|currency|year)$/u.test(ruleId)));
    const authoritativeNumeric = checkAuthoritativeNumericFacts({ claim: claim.text, evidence: claim.evidence, contentUnitId: unit.id, assertionId: claim.claimId });
    findings.push(...evidenceFindings, ...qualifierFindings, ...clauseBoundaryFindings, ...quantitativeFindings, ...authoritativeNumeric.findings);
    for (const finding of [...evidenceFindings, ...qualifierFindings, ...clauseBoundaryFindings, ...quantitativeFindings]) ruleIds.push(...finding.deterministicRuleIds);
    ruleIds.push(...authoritativeNumeric.ruleIds);
    if (claim.locator.trim().length === 0) missingLocator = true;
  }
  const contentHashStatus = missingHash ? "missing" : staleHash || findings.some((finding) => finding.deterministicRuleIds.includes("rule:source:content-hash")) ? "stale" : "current";
  const locatorStatus = missingLocator ? "missing" : staleLocator || findings.some((finding) => finding.errorClass === "F2") ? "partial" : "exact";
  return { findings, contentHashStatus, locatorStatus, ruleIds: [...new Set(ruleIds)] };
}

export function deriveLibraryAnalysisAgentValidationResult(
  rawInput: LibraryAnalysisAgentValidationInput,
): LibraryAnalysisAgentValidationResult {
  const input = rawInput;
  const sourceResult = parseAndVerifySourceResult(input.sourceResult);
  const deterministic = deterministicFindings(sourceResult, input.units);
  let responseFindings: readonly AutomatedValidationFinding[] = [];
  let responseRiskFlags: readonly AutomatedLibraryRiskFlag[] = [];
  let validatorModel = input.validatorModel;
  if (input.response !== undefined) {
    if (input.request === undefined) throw new Error("validation_response_request_required");
    const acceptedResponse = validateLibraryAnalysisAgentValidationResponse({ request: input.request, response: input.response });
    responseFindings = acceptedResponse.findings;
    responseRiskFlags = acceptedResponse.riskFlags;
    validatorModel = acceptedResponse.validatorModel;
  }
  const suppliedFindings = input.response === undefined
    ? (input.modelFindings ?? [])
    : responseFindings;
  const providedFindings = [...suppliedFindings].map((finding) => AutomatedValidationFindingSchema.parse(finding));
  if (providedFindings.some((finding) => finding.validatorKind !== "model" || finding.deterministicRuleIds.length !== 0)) {
    throw new Error("validation_model_finding_deterministic_claim");
  }
  const findings = [...deterministic.findings, ...providedFindings];
  if (new Set(findings.map((finding) => finding.findingId)).size !== findings.length) throw new Error("validation_finding_duplicate");
  const validatorSeparation = deriveValidatorSeparation(input.analysisModels, validatorModel, deterministic.ruleIds);
  const disposition = deriveAutomatedDisposition({
    candidateId: input.candidateId,
    populationEligibility: input.populationEligibility,
    analysisState: sourceResult.analysisState === "complete" || sourceResult.analysisState === "partial" ? sourceResult.analysisState : "failed",
    contentHashStatus: deterministic.contentHashStatus,
    locatorStatus: deterministic.locatorStatus,
    validatorSeparation,
    riskFlags: [...new Set(input.response === undefined ? (input.riskFlags ?? []) : responseRiskFlags)],
    findings,
  });
  const core = {
    ...disposition,
    schema: LIBRARY_ANALYSIS_AGENT_VALIDATION_RESULT_SCHEMA,
    queueHash: sourceResult.queueHash,
    sourceEnvelopeHash: sourceResult.sourceEnvelopeHash,
    sourceResultHash: sourceResult.sourceResultHash,
    requestHash: input.request?.requestHash ?? candidateAnalysisSha256("library-analysis-agent-validation-request", { sourceResultHash: sourceResult.sourceResultHash } as unknown as CandidateJsonValue),
    ...(input.response?.responseHash === undefined ? {} : { responseHash: input.response.responseHash }),
    analysisState: sourceResult.analysisState,
    contentHashStatus: deterministic.contentHashStatus,
    locatorStatus: deterministic.locatorStatus,
    automatedOnly: true as const,
    externalReady: false as const,
    externalApiUsed: false as const,
    candidateDatabaseWritten: false as const,
    productionDataMutated: false as const,
    humanSourceReviewRequired: false as const,
  };
  return LibraryAnalysisAgentValidationResultSchema.parse({ ...core, resultHash: resultHash(core) });
}
