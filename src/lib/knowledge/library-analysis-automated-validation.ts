import { z } from "zod";

const identifierSchema = z.string().regex(/^[a-z0-9][a-z0-9._:-]*$/);
const nonEmptyTextSchema = z.string().min(1);

export const AUTOMATED_VALIDATION_ERROR_CLASSES = [
  "F1",
  "F2",
  "F3",
  "F4",
  "F5",
] as const;

export const AUTOMATED_LIBRARY_RISK_FLAGS = [
  "actor",
  "rights",
  "person",
  "health",
  "causal",
] as const;

export const AUTOMATED_VALIDATOR_SEPARATION_LEVELS = [
  "same_model",
  "separate_model",
  "separate_model_plus_deterministic",
] as const;

function uniqueValues(values: readonly string[]): boolean {
  return new Set(values).size === values.length;
}

export const AutomatedValidationFindingSchema = z
  .object({
    findingId: identifierSchema,
    assertionId: identifierSchema,
    errorClass: z.enum(AUTOMATED_VALIDATION_ERROR_CLASSES),
    severity: z.enum(["critical", "material", "advisory"]),
    affectsClaim: z.boolean(),
    contentUnitIds: z.array(identifierSchema),
    explanation: nonEmptyTextSchema,
    validatorKind: z.enum(["deterministic", "model"]),
    deterministicRuleIds: z.array(identifierSchema),
  })
  .strict()
  .superRefine((finding, context) => {
    if (!uniqueValues(finding.contentUnitIds)) {
      context.addIssue({ code: "custom", message: "duplicate_content_unit_id" });
    }
    if (!uniqueValues(finding.deterministicRuleIds)) {
      context.addIssue({ code: "custom", message: "duplicate_deterministic_rule_id" });
    }
    if (
      finding.errorClass !== "F4" &&
      finding.contentUnitIds.length === 0
    ) {
      context.addIssue({
        code: "custom",
        message: "validation_finding_content_unit_required",
      });
    }
    if (
      finding.validatorKind === "deterministic" &&
      finding.deterministicRuleIds.length === 0
    ) {
      context.addIssue({
        code: "custom",
        message: "deterministic_validation_rule_required",
      });
    }
    if (
      finding.validatorKind === "model" &&
      finding.deterministicRuleIds.length !== 0
    ) {
      context.addIssue({
        code: "custom",
        message: "model_finding_cannot_claim_deterministic_rule",
      });
    }
  });

export type AutomatedValidationFinding = z.infer<
  typeof AutomatedValidationFindingSchema
>;

export const AutomatedLibraryValidationInputSchema = z
  .object({
    candidateId: identifierSchema,
    populationEligibility: z.enum([
      "eligible",
      "blocked_input",
      "superseded",
    ]),
    analysisState: z.enum(["complete", "partial", "failed"]),
    contentHashStatus: z.enum(["current", "stale", "missing"]),
    locatorStatus: z.enum(["exact", "partial", "missing"]),
    validatorSeparation: z.enum(AUTOMATED_VALIDATOR_SEPARATION_LEVELS),
    riskFlags: z.array(z.enum(AUTOMATED_LIBRARY_RISK_FLAGS)),
    findings: z.array(AutomatedValidationFindingSchema),
  })
  .strict()
  .superRefine((input, context) => {
    if (!uniqueValues(input.riskFlags)) {
      context.addIssue({ code: "custom", message: "duplicate_risk_flag" });
    }
    if (!uniqueValues(input.findings.map((finding) => finding.findingId))) {
      context.addIssue({ code: "custom", message: "duplicate_validation_finding_id" });
    }
  });

export type AutomatedLibraryValidationInput = z.infer<
  typeof AutomatedLibraryValidationInputSchema
>;

export const AutomatedLibraryAnalysisResultSchema = z
  .object({
    schema: z.literal("automated-library-analysis-result/v1"),
    candidateId: identifierSchema,
    automatedOnly: z.literal(true),
    disposition: z.enum([
      "candidate_complete",
      "partial",
      "blocked_input",
      "quarantined",
      "failed",
      "superseded",
    ]),
    machineUse: z.enum([
      "candidate_only",
      "reusable_for_ai_context",
      "quarantined",
    ]),
    validatorSeparation: z.enum(AUTOMATED_VALIDATOR_SEPARATION_LEVELS),
    riskFlags: z.array(z.enum(AUTOMATED_LIBRARY_RISK_FLAGS)),
    findings: z.array(AutomatedValidationFindingSchema),
    limitations: z.array(nonEmptyTextSchema),
  })
  .strict();

export type AutomatedLibraryAnalysisResult = z.infer<
  typeof AutomatedLibraryAnalysisResultSchema
>;

type Disposition = AutomatedLibraryAnalysisResult["disposition"];
type MachineUse = AutomatedLibraryAnalysisResult["machineUse"];

export function deriveAutomatedDisposition(
  rawInput: AutomatedLibraryValidationInput,
): AutomatedLibraryAnalysisResult {
  const input = AutomatedLibraryValidationInputSchema.parse(rawInput);
  const limitations: string[] = [];
  let disposition: Disposition = "candidate_complete";
  let machineUse: MachineUse = "reusable_for_ai_context";
  let isQuarantined = false;

  const quarantine = (limitation: string): void => {
    limitations.push(limitation);
    disposition = "quarantined";
    machineUse = "quarantined";
    isQuarantined = true;
  };
  const partial = (limitation: string): void => {
    limitations.push(limitation);
    if (disposition === "candidate_complete") disposition = "partial";
    if (machineUse === "reusable_for_ai_context") machineUse = "candidate_only";
  };

  if (input.populationEligibility === "superseded") {
    disposition = "superseded";
    machineUse = "quarantined";
    limitations.push("source_superseded");
  } else if (input.populationEligibility === "blocked_input") {
    disposition = "blocked_input";
    machineUse = "candidate_only";
    limitations.push("source_input_blocked");
  } else if (input.analysisState === "failed") {
    disposition = "failed";
    machineUse = "quarantined";
    limitations.push("analysis_failed");
  } else if (input.contentHashStatus !== "current") {
    quarantine(`content_hash_${input.contentHashStatus}`);
  } else {
    const hasHighRisk = input.riskFlags.length > 0;
    for (const validationFinding of input.findings) {
      if (
        validationFinding.errorClass === "F1" ||
        validationFinding.errorClass === "F2"
      ) {
        quarantine(`validation_${validationFinding.errorClass.toLowerCase()}`);
      } else if (
        validationFinding.errorClass === "F3" &&
        validationFinding.affectsClaim
      ) {
        quarantine("claim_evidence_mismatch");
      } else if (validationFinding.errorClass === "F4") {
        quarantine("classification_drift");
      } else if (
        validationFinding.errorClass === "F5" &&
        validationFinding.severity === "material" &&
        (validationFinding.affectsClaim || hasHighRisk)
      ) {
        quarantine("material_high_risk_validation_gap");
      } else if (
        (validationFinding.errorClass === "F3" ||
          validationFinding.errorClass === "F5") &&
        validationFinding.severity !== "advisory"
      ) {
        partial("material_validation_gap");
      }
    }

    if (!isQuarantined) {
      if (input.analysisState === "partial") partial("analysis_incomplete");
      if (input.locatorStatus !== "exact") {
        partial(`evidence_locator_${input.locatorStatus}`);
      }
      if (hasHighRisk) partial("high_risk_requires_non_automated_authority");
      if (
        input.validatorSeparation !== "separate_model_plus_deterministic"
      ) {
        partial("validator_separation_insufficient");
      }
    }
  }

  return AutomatedLibraryAnalysisResultSchema.parse({
    schema: "automated-library-analysis-result/v1",
    candidateId: input.candidateId,
    automatedOnly: true,
    disposition,
    machineUse,
    validatorSeparation: input.validatorSeparation,
    riskFlags: input.riskFlags,
    findings: input.findings,
    limitations: [...new Set(limitations)],
  });
}
