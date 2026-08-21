import { createHash } from "node:crypto";
import test from "node:test";
import assert from "node:assert/strict";

import {
  buildLibraryAnalysisAgentValidationRequest,
  deriveLibraryAnalysisAgentValidationResult,
  deriveValidatorSeparation,
  validateLibraryAnalysisAgentValidationResponse,
  type LibraryAnalysisAgentValidationInput,
} from "../../src/lib/knowledge/library-analysis-agent-validation";
import {
  candidateAnalysisSha256,
  type CandidateJsonValue,
} from "../../src/lib/knowledge/candidate-analysis-contract";

const HASH = "a".repeat(64);
const MODEL = { provider: "openai-codex", name: "gpt-5.6-luna", version: "receipt-a" } as const;

function hashText(text: string): string {
  return createHash("sha256").update(Buffer.from(text, "utf8")).digest("hex");
}

function sourceValidationFixture() {
  const text = "The cooperative reported 12 percent growth in Norway.";
  const unit = {
    id: "content:unit-1",
    sourceKind: "document",
    sourceKey: "document:source-1",
    populationSourceKey: "document:source-1",
    sourceVersionHash: HASH,
    unitType: "document_section" as const,
    ordinal: 0,
    locator: "document:source-1#section-1",
    locatorHash: HASH,
    contentHash: hashText(text),
    hashAlgorithm: "sha256" as const,
    identityConfidence: "exact" as const,
    chunkPolicyHash: HASH,
    portablePath: `units/${hashText(text)}.txt`,
    sizeBytes: Buffer.byteLength(text, "utf8"),
    codePoints: [...text].length,
    text,
  };
  const claim = {
    claimId: "claim:1",
    assertionType: "claim" as const,
    contentUnitId: unit.id,
    text,
    evidence: "12 percent growth in Norway",
    locator: unit.locator,
    confidence: 0.9,
  };
  const sourceCore = {
    schema: "library-analysis-source-result/v1" as const,
    queueHash: HASH,
    sourceEnvelopeHash: HASH,
    unitCoverage: [{ contentUnitId: unit.id, status: "claims_extracted" as const }],
    claims: [{ ...claim, localOrdinal: 0 }],
    segments: [],
    analysisState: "complete" as const,
  };
  return {
    queueHash: HASH,
    sourceEnvelopeHash: HASH,
    sourceResult: {
      ...sourceCore,
      sourceResultHash: candidateAnalysisSha256("library-analysis-source-result", sourceCore as unknown as CandidateJsonValue),
    },
    units: [unit],
    analysisModels: [MODEL],
    validatorModel: { provider: "openai-codex" as const, name: "gpt-5.6-sol", version: "receipt-b" },
    candidateId: "source:document:source-1",
  };
}

function finding(errorClass: "F1" | "F2" | "F3" | "F4" | "F5", severity: "critical" | "material", affectsClaim: boolean) {
  return {
    findingId: `finding:${errorClass.toLowerCase()}`,
    assertionId: "claim:1",
    errorClass,
    severity,
    affectsClaim,
    contentUnitIds: ["content:unit-1"],
    explanation: `test ${errorClass}`,
    validatorKind: "model" as const,
    deterministicRuleIds: [],
  };
}

function validationInput(overrides: Partial<LibraryAnalysisAgentValidationInput> = {}): LibraryAnalysisAgentValidationInput {
  const fixture = sourceValidationFixture();
  return {
    candidateId: fixture.candidateId,
    sourceResult: fixture.sourceResult,
    units: fixture.units,
    analysisModels: fixture.analysisModels,
    validatorModel: fixture.validatorModel,
    populationEligibility: "eligible",
    modelFindings: [],
    riskFlags: [],
    ...overrides,
  };
}

test("validation request carries claim text evidence locator and unit binding", () => {
  const request = buildLibraryAnalysisAgentValidationRequest(sourceValidationFixture());
  assert.deepEqual(Object.keys(request.claims[0]!).sort(), [
    "assertionType", "claimId", "contentUnitId", "evidence", "locator", "payloadHash", "text",
  ]);
  assert.equal(request.claims[0]!.text, "The cooperative reported 12 percent growth in Norway.");
  assert.equal(request.claims[0]!.locator, "document:source-1#section-1");
  assert.equal(request.claims[0]!.contentUnitId, "content:unit-1");
});

test("separation is derived from receipts and never trusted from model text", () => {
  assert.equal(deriveValidatorSeparation(
    [{ provider: "openai-codex", name: "gpt-5.6-luna", version: "receipt-a" }],
    { provider: "openai-codex", name: "gpt-5.6-sol", version: "receipt-b" },
    ["evidence-substring-v1"],
  ), "separate_model_plus_deterministic");
  assert.equal(deriveValidatorSeparation(
    [{ provider: "openai-codex", name: "gpt-5.6-luna", version: "unknown" }],
    { provider: "openai-codex", name: "gpt-5.6-luna", version: "unknown" },
    ["evidence-substring-v1"],
  ), "same_model");
  assert.equal(deriveValidatorSeparation(
    [{ provider: "openai-codex", name: "gpt-5.6-luna", version: "receipt-a" }],
    { provider: "openai-codex", name: "gpt-5.6-luna", version: "receipt-b" },
    [],
  ), "separate_model");
});

for (const [candidateFinding, disposition] of [
  [finding("F1", "critical", true), "quarantined"],
  [finding("F2", "critical", true), "quarantined"],
  [finding("F3", "material", true), "quarantined"],
  [finding("F4", "material", false), "quarantined"],
  [finding("F5", "material", true), "quarantined"],
  [finding("F5", "material", false), "partial"],
] as const) {
  test(`${candidateFinding.errorClass} derives ${disposition}`, () => {
    assert.equal(deriveLibraryAnalysisAgentValidationResult(
      validationInput({ modelFindings: [candidateFinding] }),
    ).disposition, disposition);
  });
}

test("validation response cannot self-declare deterministic state or disposition", () => {
  const request = buildLibraryAnalysisAgentValidationRequest(sourceValidationFixture());
  const response = {
    schema: "library-analysis-agent-validation-response/v1",
    requestHash: request.requestHash,
    sourceResultHash: request.sourceResultHash,
    queueHash: request.queueHash,
    sourceEnvelopeHash: request.sourceEnvelopeHash,
    validatorModel: request.validatorModel,
    findings: [finding("F5", "material", false)],
    riskFlags: [],
    responseHash: "0".repeat(64),
  };
  const { responseHash: _ignored, ...core } = response;
  response.responseHash = candidateAnalysisSha256("library-analysis-agent-validation-response", core as unknown as CandidateJsonValue);
  const accepted = validateLibraryAnalysisAgentValidationResponse({ request, response });
  assert.equal(accepted.findings[0]!.validatorKind, "model");
  assert.equal("disposition" in accepted, false);
});
