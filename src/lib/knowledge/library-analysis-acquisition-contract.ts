import { z } from "zod";

import {
  CANDIDATE_CONTENT_UNIT_TYPES,
  candidateAnalysisSha256,
  compareCandidateJsonKeysUtf8,
} from "./candidate-analysis-contract";
import {
  LibraryAnalysisPopulationSnapshotSchema,
  type LibraryAnalysisPopulationSnapshot,
} from "./library-analysis-population";

const hashSchema = z.string().regex(/^[a-f0-9]{64}$/);
const nonEmptyTextSchema = z.string().min(1);

export const LIBRARY_ANALYSIS_ACQUISITION_PLAN_SCHEMA =
  "library-analysis-acquisition-plan/v1" as const;
export const LIBRARY_ANALYSIS_ACQUISITION_RESOLUTION_SCHEMA =
  "library-analysis-acquisition-resolution/v1" as const;
export const LIBRARY_ANALYSIS_ACQUISITION_POLICY_VERSION = "1.0.0" as const;

export const LIBRARY_ANALYSIS_ACQUISITION_ROUTES = [
  "database_document",
  "controlled_https",
  "repository_csv",
  "repository_pptx",
  "database_derived_record",
  "superseded",
  "unresolvable",
] as const;

export const LIBRARY_ANALYSIS_ACQUISITION_DISPOSITIONS = [
  "content_units_ready",
  "superseded",
  "blocked_input",
  "failed_retryable",
  "quarantined",
] as const;

export const LIBRARY_ANALYSIS_ACQUISITION_REASON_CODES = [
  "source_superseded",
  "missing_locator",
  "http_not_found",
  "http_forbidden",
  "transport_exhausted",
  "response_too_large",
  "unsupported_media_type",
  "corrupt_payload",
  "empty_extraction",
  "ocr_required",
  "identity_ambiguous",
  "source_version_drift",
  "derived_record_missing_dependencies",
] as const;

const routeSchema = z.enum(LIBRARY_ANALYSIS_ACQUISITION_ROUTES);
const dispositionSchema = z.enum(LIBRARY_ANALYSIS_ACQUISITION_DISPOSITIONS);
const reasonCodeSchema = z.enum(LIBRARY_ANALYSIS_ACQUISITION_REASON_CODES);

const locatorInputRouteSchema = z.enum([
  "controlled_https",
  "repository_csv",
  "repository_pptx",
  "database_derived_record",
  "unresolvable",
]);

export const LibraryAnalysisAcquisitionLocatorSchema = z
  .object({
    sourceKind: nonEmptyTextSchema,
    sourceKey: nonEmptyTextSchema,
    route: locatorInputRouteSchema,
    locator: nonEmptyTextSchema.nullable(),
    alternateLocators: z.array(nonEmptyTextSchema),
  })
  .strict()
  .superRefine((input, context) => {
    if (new Set(input.alternateLocators).size !== input.alternateLocators.length) {
      context.addIssue({ code: "custom", message: "duplicate_acquisition_alternate_locator" });
    }
    if (input.route === "unresolvable") {
      if (input.locator !== null || input.alternateLocators.length > 0) {
        context.addIssue({ code: "custom", message: "unresolvable_acquisition_has_locator" });
      }
      return;
    }
    if (input.locator === null) {
      context.addIssue({ code: "custom", message: "acquisition_route_locator_required" });
      return;
    }
    if (input.route === "controlled_https") {
      for (const locator of [input.locator, ...input.alternateLocators]) {
        let url: URL;
        try {
          url = new URL(locator);
        } catch {
          context.addIssue({ code: "custom", message: "controlled_https_locator_invalid" });
          continue;
        }
        if (
          url.protocol !== "https:" ||
          url.username.length > 0 ||
          url.password.length > 0 ||
          url.hash.length > 0
        ) {
          context.addIssue({ code: "custom", message: "controlled_https_locator_invalid" });
        }
      }
    }
  });

export type LibraryAnalysisAcquisitionLocator = z.infer<
  typeof LibraryAnalysisAcquisitionLocatorSchema
>;

export const LibraryAnalysisAcquisitionPlanRowSchema = z
  .object({
    sourceKind: nonEmptyTextSchema,
    sourceKey: nonEmptyTextSchema,
    populationEligibility: z.enum(["eligible", "blocked_input", "superseded"]),
    identityConfidence: z.enum(["exact", "provisional", "unresolved"]),
    sourceVersionHash: hashSchema.nullable(),
    route: routeSchema,
    locator: nonEmptyTextSchema.nullable(),
    alternateLocators: z.array(nonEmptyTextSchema),
  })
  .strict()
  .superRefine((row, context) => {
    if (row.populationEligibility === "eligible" && row.route !== "database_document") {
      context.addIssue({ code: "custom", message: "eligible_population_route_invalid" });
    }
    if (row.route === "database_document" && row.locator === null) {
      context.addIssue({ code: "custom", message: "database_document_locator_required" });
    }
    if (row.populationEligibility === "superseded" && row.route !== "superseded") {
      context.addIssue({ code: "custom", message: "superseded_population_route_invalid" });
    }
    if (row.route === "superseded" && row.populationEligibility !== "superseded") {
      context.addIssue({ code: "custom", message: "active_population_cannot_use_superseded_route" });
    }
    if (row.route === "unresolvable" && row.locator !== null) {
      context.addIssue({ code: "custom", message: "unresolvable_acquisition_has_locator" });
    }
  });

export type LibraryAnalysisAcquisitionPlanRow = z.infer<
  typeof LibraryAnalysisAcquisitionPlanRowSchema
>;

const acquisitionPlanCoreSchema = z
  .object({
    schema: z.literal(LIBRARY_ANALYSIS_ACQUISITION_PLAN_SCHEMA),
    policyVersion: z.literal(LIBRARY_ANALYSIS_ACQUISITION_POLICY_VERSION),
    populationSnapshotId: nonEmptyTextSchema,
    populationHash: hashSchema,
    rows: z.array(LibraryAnalysisAcquisitionPlanRowSchema),
  })
  .strict();

type LibraryAnalysisAcquisitionPlanCore = z.infer<typeof acquisitionPlanCoreSchema>;

export function libraryAnalysisAcquisitionPlanHash(
  input: LibraryAnalysisAcquisitionPlanCore | LibraryAnalysisAcquisitionPlan,
): string {
  return candidateAnalysisSha256("library-analysis-acquisition-plan", {
    schema: input.schema,
    policyVersion: input.policyVersion,
    populationSnapshotId: input.populationSnapshotId,
    populationHash: input.populationHash,
    rows: input.rows,
  });
}

export const LibraryAnalysisAcquisitionPlanSchema = acquisitionPlanCoreSchema
  .extend({
    planId: nonEmptyTextSchema,
    planHash: hashSchema,
  })
  .strict()
  .superRefine((plan, context) => {
    validateSortedUniqueIdentities(plan.rows, context, "acquisition_plan");
    if (plan.planHash !== libraryAnalysisAcquisitionPlanHash(plan)) {
      context.addIssue({ code: "custom", message: "acquisition_plan_hash_mismatch" });
    }
    if (plan.planId !== `library-analysis-acquisition-plan:${plan.planHash}`) {
      context.addIssue({ code: "custom", message: "acquisition_plan_id_mismatch" });
    }
    if (plan.populationSnapshotId !== `library-analysis-population:${plan.populationHash}`) {
      context.addIssue({ code: "custom", message: "acquisition_plan_population_binding_invalid" });
    }
  });

export type LibraryAnalysisAcquisitionPlan = z.infer<
  typeof LibraryAnalysisAcquisitionPlanSchema
>;

export function buildLibraryAnalysisAcquisitionPlan(
  rawPopulation: LibraryAnalysisPopulationSnapshot,
  rawLocators: readonly LibraryAnalysisAcquisitionLocator[],
): LibraryAnalysisAcquisitionPlan {
  const population = LibraryAnalysisPopulationSnapshotSchema.parse(rawPopulation);
  const populationIdentities = new Set(
    population.rows.map((row) => acquisitionIdentity(row.sourceKind, row.sourceKey)),
  );
  const locators = new Map<string, LibraryAnalysisAcquisitionLocator>();
  for (const rawLocator of rawLocators) {
    const locator = LibraryAnalysisAcquisitionLocatorSchema.parse(rawLocator);
    const identity = acquisitionIdentity(locator.sourceKind, locator.sourceKey);
    if (!populationIdentities.has(identity)) {
      throw new Error("acquisition_locator_outside_population");
    }
    if (locators.has(identity)) {
      throw new Error("duplicate_acquisition_locator_identity");
    }
    const populationRow = population.rows.find(
      (row) => acquisitionIdentity(row.sourceKind, row.sourceKey) === identity,
    );
    if (populationRow?.eligibility !== "blocked_input") {
      throw new Error("acquisition_locator_population_not_blocked");
    }
    locators.set(identity, locator);
  }

  const rows = population.rows.map((populationRow) => {
    const identity = acquisitionIdentity(populationRow.sourceKind, populationRow.sourceKey);
    const supplied = locators.get(identity);
    const route = populationRow.eligibility === "eligible"
      ? "database_document"
      : populationRow.eligibility === "superseded"
        ? "superseded"
        : supplied?.route ?? "unresolvable";
    const locator = populationRow.eligibility === "eligible"
      ? populationRow.locator
      : supplied?.locator ?? null;
    return LibraryAnalysisAcquisitionPlanRowSchema.parse({
      sourceKind: populationRow.sourceKind,
      sourceKey: populationRow.sourceKey,
      populationEligibility: populationRow.eligibility,
      identityConfidence: populationRow.identityConfidence,
      sourceVersionHash: populationRow.sourceVersionHash,
      route,
      locator,
      alternateLocators: [...(supplied?.alternateLocators ?? [])].sort(compareCandidateJsonKeysUtf8),
    });
  });
  const core = acquisitionPlanCoreSchema.parse({
    schema: LIBRARY_ANALYSIS_ACQUISITION_PLAN_SCHEMA,
    policyVersion: LIBRARY_ANALYSIS_ACQUISITION_POLICY_VERSION,
    populationSnapshotId: population.snapshotId,
    populationHash: population.populationHash,
    rows,
  });
  const planHash = libraryAnalysisAcquisitionPlanHash(core);
  return LibraryAnalysisAcquisitionPlanSchema.parse({
    ...core,
    planId: `library-analysis-acquisition-plan:${planHash}`,
    planHash,
  });
}

export const LibraryAnalysisResolvedContentUnitSchema = z
  .object({
    contentUnitId: nonEmptyTextSchema,
    sourceVersionHash: hashSchema,
    unitType: z.enum(CANDIDATE_CONTENT_UNIT_TYPES),
    ordinal: z.number().int().nonnegative(),
    locator: nonEmptyTextSchema,
    contentHash: hashSchema,
  })
  .strict();

export const LibraryAnalysisAcquisitionResolutionRowSchema = z
  .object({
    sourceKind: nonEmptyTextSchema,
    sourceKey: nonEmptyTextSchema,
    disposition: dispositionSchema,
    reasonCode: reasonCodeSchema.nullable(),
    contentUnits: z.array(LibraryAnalysisResolvedContentUnitSchema),
    attempt: z.number().int().min(1).max(3).nullable().default(null),
    maximumAttempts: z.number().int().min(1).max(3).nullable().default(null),
  })
  .strict()
  .superRefine((row, context) => {
    if (row.disposition === "content_units_ready") {
      if (row.contentUnits.length === 0) {
        context.addIssue({ code: "custom", message: "resolution_content_units_required" });
      }
      if (row.reasonCode !== null) {
        context.addIssue({ code: "custom", message: "ready_resolution_cannot_have_reason" });
      }
    } else {
      if (row.contentUnits.length > 0) {
        context.addIssue({ code: "custom", message: "non_ready_resolution_cannot_have_units" });
      }
      if (row.reasonCode === null) {
        context.addIssue({ code: "custom", message: "resolution_blocker_reason_required" });
      }
    }
    if (row.disposition === "superseded" && row.reasonCode !== "source_superseded") {
      context.addIssue({ code: "custom", message: "resolution_superseded_reason_invalid" });
    }
    if (row.disposition === "failed_retryable") {
      if (
        row.attempt === null ||
        row.maximumAttempts === null ||
        row.attempt > row.maximumAttempts
      ) {
        context.addIssue({ code: "custom", message: "retryable_resolution_attempt_invalid" });
      }
    } else if (row.attempt !== null || row.maximumAttempts !== null) {
      context.addIssue({ code: "custom", message: "non_retryable_resolution_has_attempt" });
    }
  });

export type LibraryAnalysisAcquisitionResolutionRowInput = z.input<
  typeof LibraryAnalysisAcquisitionResolutionRowSchema
>;
export type LibraryAnalysisAcquisitionResolutionRow = z.output<
  typeof LibraryAnalysisAcquisitionResolutionRowSchema
>;

const acquisitionResolutionCoreSchema = z
  .object({
    schema: z.literal(LIBRARY_ANALYSIS_ACQUISITION_RESOLUTION_SCHEMA),
    policyVersion: z.literal(LIBRARY_ANALYSIS_ACQUISITION_POLICY_VERSION),
    populationSnapshotId: nonEmptyTextSchema,
    populationHash: hashSchema,
    planId: nonEmptyTextSchema,
    planHash: hashSchema,
    rows: z.array(LibraryAnalysisAcquisitionResolutionRowSchema),
  })
  .strict();

type LibraryAnalysisAcquisitionResolutionCore = z.infer<
  typeof acquisitionResolutionCoreSchema
>;

export function libraryAnalysisAcquisitionResolutionHash(
  input: LibraryAnalysisAcquisitionResolutionCore | LibraryAnalysisAcquisitionResolution,
): string {
  return candidateAnalysisSha256("library-analysis-acquisition-resolution", {
    schema: input.schema,
    policyVersion: input.policyVersion,
    populationSnapshotId: input.populationSnapshotId,
    populationHash: input.populationHash,
    planId: input.planId,
    planHash: input.planHash,
    rows: input.rows,
  });
}

export const LibraryAnalysisAcquisitionResolutionSchema = acquisitionResolutionCoreSchema
  .extend({
    resolutionId: nonEmptyTextSchema,
    resolutionHash: hashSchema,
  })
  .strict()
  .superRefine((resolution, context) => {
    validateSortedUniqueIdentities(resolution.rows, context, "resolution");
    if (resolution.resolutionHash !== libraryAnalysisAcquisitionResolutionHash(resolution)) {
      context.addIssue({ code: "custom", message: "acquisition_resolution_hash_mismatch" });
    }
    if (
      resolution.resolutionId !==
      `library-analysis-acquisition-resolution:${resolution.resolutionHash}`
    ) {
      context.addIssue({ code: "custom", message: "acquisition_resolution_id_mismatch" });
    }
  });

export type LibraryAnalysisAcquisitionResolution = z.infer<
  typeof LibraryAnalysisAcquisitionResolutionSchema
>;

export function sealLibraryAnalysisResolution(
  rawPlan: LibraryAnalysisAcquisitionPlan,
  rawRows: readonly LibraryAnalysisAcquisitionResolutionRowInput[],
): LibraryAnalysisAcquisitionResolution {
  const plan = LibraryAnalysisAcquisitionPlanSchema.parse(rawPlan);
  const rows = rawRows
    .map((row) => LibraryAnalysisAcquisitionResolutionRowSchema.parse(row))
    .sort(compareAcquisitionIdentities);
  const planByIdentity = new Map(
    plan.rows.map((row) => [acquisitionIdentity(row.sourceKind, row.sourceKey), row]),
  );
  const seen = new Set<string>();
  for (const row of rows) {
    const identity = acquisitionIdentity(row.sourceKind, row.sourceKey);
    if (seen.has(identity)) throw new Error("duplicate_resolution_identity");
    seen.add(identity);
    const planRow = planByIdentity.get(identity);
    if (planRow === undefined) throw new Error("resolution_identity_outside_plan");
    if (planRow.route === "superseded" && row.disposition !== "superseded") {
      throw new Error("resolution_superseded_disposition_required");
    }
    if (planRow.route !== "superseded" && row.disposition === "superseded") {
      throw new Error("resolution_active_source_cannot_be_superseded");
    }
    if (planRow.route === "unresolvable" && row.disposition === "content_units_ready") {
      throw new Error("unresolvable_route_cannot_be_ready");
    }
  }
  if (rows.length !== plan.rows.length || seen.size !== plan.rows.length) {
    throw new Error("resolution_population_incomplete");
  }
  const core = acquisitionResolutionCoreSchema.parse({
    schema: LIBRARY_ANALYSIS_ACQUISITION_RESOLUTION_SCHEMA,
    policyVersion: LIBRARY_ANALYSIS_ACQUISITION_POLICY_VERSION,
    populationSnapshotId: plan.populationSnapshotId,
    populationHash: plan.populationHash,
    planId: plan.planId,
    planHash: plan.planHash,
    rows,
  });
  const resolutionHash = libraryAnalysisAcquisitionResolutionHash(core);
  return LibraryAnalysisAcquisitionResolutionSchema.parse({
    ...core,
    resolutionId: `library-analysis-acquisition-resolution:${resolutionHash}`,
    resolutionHash,
  });
}

function acquisitionIdentity(sourceKind: string, sourceKey: string): string {
  return `${sourceKind}\u0000${sourceKey}`;
}

function compareAcquisitionIdentities(
  left: { sourceKind: string; sourceKey: string },
  right: { sourceKind: string; sourceKey: string },
): number {
  const kind = compareCandidateJsonKeysUtf8(left.sourceKind, right.sourceKind);
  return kind === 0
    ? compareCandidateJsonKeysUtf8(left.sourceKey, right.sourceKey)
    : kind;
}

function validateSortedUniqueIdentities(
  rows: readonly { sourceKind: string; sourceKey: string }[],
  context: z.RefinementCtx,
  label: string,
): void {
  const seen = new Set<string>();
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index]!;
    const identity = acquisitionIdentity(row.sourceKind, row.sourceKey);
    if (seen.has(identity)) {
      context.addIssue({ code: "custom", message: `${label}_identity_duplicate` });
    }
    seen.add(identity);
    if (index > 0 && compareAcquisitionIdentities(rows[index - 1]!, row) >= 0) {
      context.addIssue({ code: "custom", message: `${label}_rows_not_canonical` });
    }
  }
}
