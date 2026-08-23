import assert from "node:assert/strict";
import test from "node:test";

import {
  AutomatedLibraryAnalysisResultSchema,
  AutomatedValidationFindingSchema,
  deriveAutomatedDisposition,
  type AutomatedLibraryValidationInput,
  type AutomatedValidationFinding,
} from "../../src/lib/knowledge/library-analysis-automated-validation";

function finding(
  overrides: Partial<AutomatedValidationFinding> = {},
): AutomatedValidationFinding {
  return {
    findingId: "finding:1",
    assertionId: "assertion:1",
    errorClass: "F5",
    severity: "advisory",
    affectsClaim: false,
    contentUnitIds: ["content:1"],
    explanation: "Deterministic validation finding.",
    validatorKind: "deterministic",
    deterministicRuleIds: ["rule:1"],
    ...overrides,
  };
}

function validated(
  overrides: Partial<AutomatedLibraryValidationInput> = {},
): AutomatedLibraryValidationInput {
  return {
    candidateId: "run:library-validation:1",
    populationEligibility: "eligible",
    analysisState: "complete",
    contentHashStatus: "current",
    locatorStatus: "exact",
    validatorSeparation: "separate_model_plus_deterministic",
    riskFlags: [],
    findings: [],
    ...overrides,
  };
}

test("F1 and F2 always quarantine the candidate", () => {
  for (const errorClass of ["F1", "F2"] as const) {
    const result = deriveAutomatedDisposition(validated({
      findings: [finding({ errorClass, severity: "critical" })],
    }));
    assert.equal(result.disposition, "quarantined");
    assert.equal(result.machineUse, "quarantined");
  }
});

test("a claim-bearing F3 cannot be reusable AI context", () => {
  const result = deriveAutomatedDisposition(validated({
    findings: [finding({
      errorClass: "F3",
      severity: "material",
      affectsClaim: true,
    })],
  }));
  assert.equal(result.disposition, "quarantined");
  assert.equal(result.machineUse, "quarantined");
});

test("non-claim F3 and material low-risk F5 stay partial candidate-only", () => {
  for (const validationFinding of [
    finding({ errorClass: "F3", severity: "material", affectsClaim: false }),
    finding({ errorClass: "F5", severity: "material", affectsClaim: false }),
  ]) {
    const result = deriveAutomatedDisposition(validated({
      findings: [validationFinding],
    }));
    assert.equal(result.disposition, "partial");
    assert.equal(result.machineUse, "candidate_only");
  }
});

test("material F5 is quarantined when it affects a claim or high-risk domain", () => {
  for (const input of [
    validated({ findings: [finding({ severity: "material", affectsClaim: true })] }),
    validated({
      riskFlags: ["rights"],
      findings: [finding({ severity: "material", affectsClaim: false })],
    }),
  ]) {
    const result = deriveAutomatedDisposition(input);
    assert.equal(result.disposition, "quarantined");
    assert.equal(result.machineUse, "quarantined");
  }
});

test("classification drift never becomes reusable context", () => {
  const result = deriveAutomatedDisposition(validated({
    findings: [finding({ errorClass: "F4", severity: "material" })],
  }));
  assert.equal(result.disposition, "quarantined");
  assert.notEqual(result.machineUse, "reusable_for_ai_context");
});

test("blocked superseded failed stale and insufficient-locator inputs fail closed", () => {
  assert.equal(deriveAutomatedDisposition(validated({
    populationEligibility: "blocked_input",
  })).disposition, "blocked_input");
  assert.equal(deriveAutomatedDisposition(validated({
    populationEligibility: "superseded",
  })).disposition, "superseded");
  assert.equal(deriveAutomatedDisposition(validated({
    analysisState: "failed",
  })).disposition, "failed");
  assert.equal(deriveAutomatedDisposition(validated({
    contentHashStatus: "stale",
  })).disposition, "quarantined");
  for (const locatorStatus of ["partial", "missing"] as const) {
    const result = deriveAutomatedDisposition(validated({ locatorStatus }));
    assert.equal(result.disposition, "partial");
    assert.equal(result.machineUse, "candidate_only");
  }
});

test("high-risk actor rights person health and causal flags cannot auto-reuse", () => {
  for (const riskFlag of [
    "actor",
    "rights",
    "person",
    "health",
    "causal",
  ] as const) {
    const result = deriveAutomatedDisposition(validated({ riskFlags: [riskFlag] }));
    assert.equal(result.disposition, "partial");
    assert.equal(result.machineUse, "candidate_only");
  }
});

test("same-model or model-only validation cannot mark a candidate reusable", () => {
  for (const validatorSeparation of ["same_model", "separate_model"] as const) {
    const result = deriveAutomatedDisposition(validated({ validatorSeparation }));
    assert.equal(result.disposition, "partial");
    assert.equal(result.machineUse, "candidate_only");
  }
});

test("complete automated validation creates no human or external authority", () => {
  const result = deriveAutomatedDisposition(validated());
  assert.equal(result.disposition, "candidate_complete");
  assert.equal(result.machineUse, "reusable_for_ai_context");
  assert.equal(result.automatedOnly, true);
  assert.equal(Object.hasOwn(result, "reviewStatus"), false);
  assert.equal(Object.hasOwn(result, "externalReady"), false);
  assert.deepEqual(AutomatedLibraryAnalysisResultSchema.parse(result), result);
});

test("finding schema binds evidence and deterministic rules and rejects extras", () => {
  for (const errorClass of ["F1", "F2", "F3", "F5"] as const) {
    assert.throws(() => AutomatedValidationFindingSchema.parse(
      finding({ errorClass, contentUnitIds: [] }),
    ));
  }
  assert.throws(() => AutomatedValidationFindingSchema.parse(
    finding({ deterministicRuleIds: [] }),
  ));
  assert.throws(() => AutomatedValidationFindingSchema.parse({
    ...finding(),
    externalReady: true,
  }));
  assert.doesNotThrow(() => AutomatedValidationFindingSchema.parse(
    finding({
      validatorKind: "model",
      deterministicRuleIds: [],
      errorClass: "F4",
      contentUnitIds: [],
    }),
  ));
});
