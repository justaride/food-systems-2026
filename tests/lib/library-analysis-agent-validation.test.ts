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

function sourceValidationFixture(
  sourceText = "The cooperative reported 12 percent growth in Norway.",
  claimText = sourceText,
  evidence = "12 percent growth in Norway",
) {
  const text = sourceText;
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
    text: claimText,
    evidence,
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

function itemCoverageResponse(
  request: ReturnType<typeof buildLibraryAnalysisAgentValidationRequest>,
  itemReviews: unknown[],
  findings: unknown[] = [],
) {
  const response = {
    schema: "library-analysis-agent-validation-response/v1" as const,
    requestHash: request.requestHash,
    sourceResultHash: request.sourceResultHash,
    queueHash: request.queueHash,
    sourceEnvelopeHash: request.sourceEnvelopeHash,
    validatorModel: request.validatorModel,
    findings,
    itemReviews,
    riskFlags: [],
    responseHash: "0".repeat(64),
  };
  const { responseHash: _ignored, ...core } = response;
  response.responseHash = candidateAnalysisSha256(
    "library-analysis-agent-validation-response",
    core as unknown as CandidateJsonValue,
  );
  return response;
}

function rehashRequest(request: ReturnType<typeof buildLibraryAnalysisAgentValidationRequest>) {
  const { requestHash: _ignored, ...core } = request;
  return {
    ...request,
    requestHash: candidateAnalysisSha256(
      "library-analysis-agent-validation-request",
      core as unknown as CandidateJsonValue,
    ),
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

test("item coverage binds every packet item to supported or structural review", () => {
  const fixture = sourceValidationFixture();
  const request = buildLibraryAnalysisAgentValidationRequest({ ...fixture, requireItemCoverage: true });
  assert.ok(request.workPacket);
  const reviews = request.workPacket.items.map((item) => item.kind === "content"
    ? { itemId: item.itemId, disposition: "supported" as const, claimIds: ["claim:1"], findingIds: [], reason: "claim evidence covers this content" }
    : { itemId: item.itemId, disposition: "structural" as const, claimIds: [], findingIds: [], reason: "heading only" });
  const response = {
    schema: "library-analysis-agent-validation-response/v1" as const,
    requestHash: request.requestHash,
    sourceResultHash: request.sourceResultHash,
    queueHash: request.queueHash,
    sourceEnvelopeHash: request.sourceEnvelopeHash,
    validatorModel: request.validatorModel,
    findings: [],
    itemReviews: reviews,
    riskFlags: [],
    responseHash: "0".repeat(64),
  };
  const { responseHash: _ignored, ...core } = response;
  response.responseHash = candidateAnalysisSha256(
    "library-analysis-agent-validation-response",
    core as unknown as CandidateJsonValue,
  );
  const accepted = validateLibraryAnalysisAgentValidationResponse({ request, response });
  assert.equal(accepted.itemReviews?.length, request.workPacket.items.length);
});

test("item coverage is required when requested and unsolicited reviews remain invalid", () => {
  const fixture = sourceValidationFixture();
  const requiredRequest = buildLibraryAnalysisAgentValidationRequest({ ...fixture, requireItemCoverage: true });
  const missingReviews = {
    schema: "library-analysis-agent-validation-response/v1" as const,
    requestHash: requiredRequest.requestHash,
    sourceResultHash: requiredRequest.sourceResultHash,
    queueHash: requiredRequest.queueHash,
    sourceEnvelopeHash: requiredRequest.sourceEnvelopeHash,
    validatorModel: requiredRequest.validatorModel,
    findings: [],
    riskFlags: [],
    responseHash: "0".repeat(64),
  };
  const { responseHash: _missingHash, ...missingCore } = missingReviews;
  missingReviews.responseHash = candidateAnalysisSha256(
    "library-analysis-agent-validation-response",
    missingCore as unknown as CandidateJsonValue,
  );
  assert.throws(() => validateLibraryAnalysisAgentValidationResponse({ request: requiredRequest, response: missingReviews }), /item_reviews_missing/u);

  const legacyRequest = buildLibraryAnalysisAgentValidationRequest(fixture);
  const unsolicited = {
    ...missingReviews,
    requestHash: legacyRequest.requestHash,
    sourceResultHash: legacyRequest.sourceResultHash,
    queueHash: legacyRequest.queueHash,
    sourceEnvelopeHash: legacyRequest.sourceEnvelopeHash,
    validatorModel: legacyRequest.validatorModel,
    itemReviews: [],
  };
  const { responseHash: _unsolicitedHash, ...unsolicitedCore } = unsolicited;
  unsolicited.responseHash = candidateAnalysisSha256(
    "library-analysis-agent-validation-response",
    unsolicitedCore as unknown as CandidateJsonValue,
  );
  assert.throws(() => validateLibraryAnalysisAgentValidationResponse({ request: legacyRequest, response: unsolicited }), /item_reviews_without_packet/u);
});

test("one repeated claim may cover multiple packet items", () => {
  const fixture = sourceValidationFixture(
    "Shared finding\nShared finding",
    "The report repeats the shared finding.",
    "Shared finding",
  );
  const request = buildLibraryAnalysisAgentValidationRequest({ ...fixture, requireItemCoverage: true });
  const reviews = request.workPacket!.items.map((item) => ({
    itemId: item.itemId,
    disposition: "supported" as const,
    claimIds: ["claim:1"],
    findingIds: [],
    reason: "same evidence occurrence on this line",
  }));
  assert.doesNotThrow(() => validateLibraryAnalysisAgentValidationResponse({
    request,
    response: itemCoverageResponse(request, reviews),
  }));
});

test("item coverage rejects forged packets and malformed item sets", () => {
  const fixture = sourceValidationFixture();
  const request = buildLibraryAnalysisAgentValidationRequest({ ...fixture, requireItemCoverage: true });
  const forgedPacket = structuredClone(request);
  forgedPacket.workPacket!.items[0]!.text = "forged packet text";
  const forgedRequest = rehashRequest(forgedPacket);
  assert.throws(() => validateLibraryAnalysisAgentValidationResponse({
    request: forgedRequest,
    response: itemCoverageResponse(forgedRequest, [{
      itemId: forgedRequest.workPacket!.items[0]!.itemId,
      disposition: "supported",
      claimIds: ["claim:1"],
      findingIds: [],
      reason: "forged",
    }]),
  }), /work_packet_mismatch/u);

  const validReview = {
    itemId: request.workPacket!.items[0]!.itemId,
    disposition: "supported" as const,
    claimIds: ["claim:1"],
    findingIds: [],
    reason: "evidence covers item",
  };
  assert.throws(() => validateLibraryAnalysisAgentValidationResponse({
    request,
    response: itemCoverageResponse(request, []),
  }), /item_review_itemset_mismatch/u);
  assert.throws(() => validateLibraryAnalysisAgentValidationResponse({
    request,
    response: itemCoverageResponse(request, [validReview, validReview]),
  }), /item_review_itemset_mismatch/u);
  assert.throws(() => validateLibraryAnalysisAgentValidationResponse({
    request,
    response: itemCoverageResponse(request, [{ ...validReview, itemId: "item:foreign" }]),
  }), /item_review_itemset_mismatch/u);
});

test("item coverage rejects wrong same-unit evidence, unbound findings, and unmapped claims", () => {
  const twoLine = sourceValidationFixture(
    "First evidence\nSecond line",
    "The source contains first evidence.",
    "First evidence",
  );
  const twoLineRequest = buildLibraryAnalysisAgentValidationRequest({ ...twoLine, requireItemCoverage: true });
  const [firstItem, secondItem] = twoLineRequest.workPacket!.items;
  assert.ok(firstItem && secondItem);
  assert.throws(() => validateLibraryAnalysisAgentValidationResponse({
    request: twoLineRequest,
    response: itemCoverageResponse(twoLineRequest, [
      { itemId: firstItem.itemId, disposition: "source_limited", claimIds: [], findingIds: [], reason: "manual review" },
      { itemId: secondItem.itemId, disposition: "supported", claimIds: ["claim:1"], findingIds: [], reason: "wrong line" },
    ]),
  }), /supported_item_claim_mismatch/u);

  const oneLine = buildLibraryAnalysisAgentValidationRequest({ ...sourceValidationFixture(), requireItemCoverage: true });
  const item = oneLine.workPacket!.items[0]!;
  const deterministicGateFinding = {
    ...finding("F5", "material", true),
    findingId: "finding:deterministic:test",
    assertionId: "assertion:deterministic-gate",
  };
  assert.throws(() => validateLibraryAnalysisAgentValidationResponse({
    request: oneLine,
    response: itemCoverageResponse(oneLine, [{
      itemId: item.itemId,
      disposition: "issue",
      claimIds: ["claim:1"],
      findingIds: ["finding:deterministic:test"],
      reason: "source issue",
    }], [deterministicGateFinding]),
  }), /issue_item_claim_finding_mismatch/u);

  assert.throws(() => validateLibraryAnalysisAgentValidationResponse({
    request: oneLine,
    response: itemCoverageResponse(oneLine, [{
      itemId: item.itemId,
      disposition: "source_limited",
      claimIds: [],
      findingIds: [],
      reason: "claim intentionally omitted",
    }]),
  }), /claim_item_review_missing/u);
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

test("Pilot09 semantic figure-qualifier and source-conflict findings quarantine affected claims", () => {
  const figure = sourceValidationFixture(
    "Figure 7 shows an index for first-stage domestic electricity transactions, excluding electricity support. Monthly electricity prices were five times higher in 2022 than in 2015.",
    "Monthly electricity prices were five times higher in 2022 than in 2015.",
    "Monthly electricity prices were five times higher in 2022 than in 2015.",
  );
  const figureFinding = {
    ...finding("F3", "material", true),
    explanation: "The excerpt omits the source-visible transaction stage and subsidy treatment.",
  };
  assert.equal(deriveLibraryAnalysisAgentValidationResult({
    candidateId: figure.candidateId,
    sourceResult: figure.sourceResult,
    units: figure.units,
    analysisModels: figure.analysisModels,
    validatorModel: figure.validatorModel,
    populationEligibility: "eligible",
    modelFindings: [figureFinding],
    riskFlags: [],
  }).disposition, "quarantined");

  const conflicting = sourceValidationFixture(
    "The chart reports 33.3% for house cricket. The prose reports 33.4% for house cricket.",
    "House cricket accounts for 33.4%.",
    "The prose reports 33.4% for house cricket.",
  );
  const conflictFinding = {
    ...finding("F5", "material", true),
    explanation: "The claim silently selects 33.4% although the same source unit also reports 33.3%.",
  };
  assert.equal(deriveLibraryAnalysisAgentValidationResult({
    candidateId: conflicting.candidateId,
    sourceResult: conflicting.sourceResult,
    units: conflicting.units,
    analysisModels: conflicting.analysisModels,
    validatorModel: conflicting.validatorModel,
    populationEligibility: "eligible",
    modelFindings: [conflictFinding],
    riskFlags: [],
  }).disposition, "quarantined");
});

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

test("external findings cannot bypass the model-only response boundary", () => {
  const fixture = sourceValidationFixture();
  assert.throws(() => deriveLibraryAnalysisAgentValidationResult({
    candidateId: fixture.candidateId,
    sourceResult: fixture.sourceResult,
    units: fixture.units,
    analysisModels: fixture.analysisModels,
    validatorModel: fixture.validatorModel,
    populationEligibility: "eligible",
    modelFindings: [{
      ...finding("F5", "material", false),
      validatorKind: "deterministic",
      deterministicRuleIds: ["rule:forged"],
    }],
  }), /validation_model_finding_deterministic_claim/u);
});

function validationResult(claimText: string, evidence: string, sourceText = evidence) {
  const fixture = sourceValidationFixture(sourceText, claimText, evidence);
  return deriveLibraryAnalysisAgentValidationResult({
    candidateId: fixture.candidateId,
    sourceResult: fixture.sourceResult,
    units: fixture.units,
    analysisModels: fixture.analysisModels,
    validatorModel: fixture.validatorModel,
    populationEligibility: "eligible",
  });
}

function numericValidation(claimText: string, evidence: string, sourceText = evidence) {
  return validationResult(claimText, evidence, sourceText);
}

test("deterministic validation rejects a dropped context qualifier in English and Norwegian", () => {
  for (const [claim, evidence] of [
    ["The method worked.", "The method worked in this context."],
    ["Metoden fungerte.", "Metoden fungerte i denne sammenhengen."],
  ] as const) {
    const omittedQualifier = validationResult(claim, evidence);
    assert.ok(
      omittedQualifier.findings.some((finding) =>
        finding.errorClass === "F3" && finding.validatorKind === "deterministic"
      ),
      `expected a deterministic F3 for dropped qualifier: ${claim}`,
    );

    const preservedQualifier = validationResult(evidence, evidence);
    assert.equal(
      preservedQualifier.findings.some((finding) => finding.errorClass === "F3"),
      false,
      `preserving qualifier should pass: ${evidence}`,
    );
  }
});

test("deterministic validation rejects quantitative evidence ending on a dangling continuation token", () => {
  const source = "The survey covered 80% of suppliers in the stated sample.";
  const danglingEvidence = "The survey covered 80% of suppliers in";
  const omittedContinuation = validationResult(source, danglingEvidence, source);
  assert.ok(
    omittedContinuation.findings.some((finding) =>
      finding.errorClass === "F3" && finding.validatorKind === "deterministic"
    ),
    "expected a deterministic F3 for truncated quantitative evidence",
  );

  const completeEvidence = validationResult(source, source, source);
  assert.equal(
    completeEvidence.findings.some((finding) => finding.errorClass === "F3"),
    false,
    "complete quantitative evidence should pass",
  );
});

test("Pilot25 deterministic validation keeps EU geography bound to the exact evidence excerpt", () => {
  const claim = "The 2023 survey covered 19 EU insect farming companies.";
  const omittedEu = validationResult(
    claim,
    "The 2023 survey covered 19 insect farming companies.",
    "The 2023 survey covered 19 EU insect farming companies.",
  );
  const geographyFinding = omittedEu.findings.find((finding) =>
    finding.errorClass === "F3" && finding.validatorKind === "deterministic" &&
    finding.deterministicRuleIds.includes("rule:quantitative:geography")
  );
  assert.ok(geographyFinding, "expected the exact EU geography rule to quarantine the claim");

  const preservedEu = validationResult(claim, claim, claim);
  assert.equal(
    preservedEu.findings.some((finding) => finding.errorClass === "F3" && finding.validatorKind === "deterministic"),
    false,
  );
});

test("authoritative numeric gates reject explicit positive-sign drift", () => {
  const result = numericValidation("The report says +12% growth.", "12% growth.");
  assert.ok(result.findings.some((finding) => finding.errorClass === "F3" && finding.validatorKind === "deterministic"));
  assert.equal(result.disposition, "quarantined");
});

test("authoritative numeric gates accept documented percent word equivalence", () => {
  for (const evidence of ["12% growth.", "12 percent growth.", "12 prosent growth."]) {
    const result = numericValidation("The report says 12% growth.", evidence);
    assert.equal(result.findings.some((finding) => finding.errorClass === "F3"), false, evidence);
  }
});

test("authoritative numeric gates distinguish percentages from percentage points", () => {
  for (const [claim, evidence] of [
    ["The result was 12 percent.", "The result was 12 percentage points."],
    ["The result was 12 percentage points.", "The result was 12 percent."],
    ["Resultatet var 12 prosent.", "Resultatet var 12 prosentpoeng."],
    ["Resultatet var 12 prosentpoeng.", "Resultatet var 12 prosent."],
  ] as const) {
    const result = numericValidation(claim, evidence);
    assert.ok(result.findings.some((finding) => finding.errorClass === "F3" && finding.validatorKind === "deterministic"), `${claim} vs ${evidence}`);
    assert.equal(result.disposition, "quarantined");
  }
});

test("percentage-point markers are equivalent across English and Norwegian forms", () => {
  for (const evidence of [
    "The result was 12 percentage points.",
    "The result was 12 percentage-point.",
    "Resultatet var 12 prosentpoeng.",
    "Resultatet var 12 prosent-poeng.",
    "Resultatet var 12 prosent poeng.",
  ]) {
    const result = numericValidation("The result was 12 percentage points.", evidence);
    assert.equal(result.findings.some((finding) => finding.errorClass === "F3"), false, evidence);
  }
});

test("authoritative numeric gates reject sign, currency, and nearby-number drift", () => {
  for (const [claim, evidence] of [
    ["The result was -12%.", "The result was 12%."],
    ["The result was NOK 12.", "The result was USD 12."],
    ["The result was NOK 12.", "The result was 12 NOK."],
    ["The result was 12%.", "The result was 13%."],
  ] as const) {
    const result = numericValidation(claim, evidence);
    assert.ok(result.findings.some((finding) => finding.errorClass === "F3" && finding.validatorKind === "deterministic"), `${claim} vs ${evidence}`);
    assert.equal(result.disposition, "quarantined");
  }
});
