import { createHash } from "node:crypto";
import { TextDecoder } from "node:util";

import { z } from "zod";

import {
  hashCorpusLifecycleState,
  validateCorpusLifecycle,
  type CorpusLifecycleRecord,
} from "./corpus-processing-lifecycle";
import {
  SOURCE_ANALYSIS_INPUT_PIPELINE_VERSION,
  SOURCE_ANALYSIS_INPUT_SCHEMA_VERSION,
  SourceAnalysisInputRepositoryPathSchema,
  serializeNormalizedInput,
  verifySourceAnalysisInputManifest,
  type SourceAnalysisInputManifest,
} from "./source-analysis-input-manifest";
import {
  countUnicodeCharacters,
  countUnicodeWords,
} from "./pdf-page-extraction-qualification";
import {
  MODEL_VERSION_NOT_EXPOSED,
  requireVerifiedSourceIdentity,
  requireVerifiedSourceIdentityWithEvidenceBundle,
  sourceIdentityVerificationArtifactPath,
  type SourceIdentityVerificationEvidenceBundle,
  type SourceIdentityVerificationArtifact,
} from "./source-identity-verification";

export const SOURCE_ANALYSIS_SCHEMA_VERSION =
  "source-analysis-artifact-v1" as const;
export const SOURCE_ANALYSIS_ARTIFACT_VERSION = "1.0.0" as const;
export const SOURCE_ANALYSIS_MODEL_VERSION_NOT_EXPOSED =
  MODEL_VERSION_NOT_EXPOSED;
export const SOURCE_ANALYSIS_INPUT_ENVELOPE_VERSION =
  "source-analysis-input-envelope-v1" as const;
export const SOURCE_ANALYSIS_STAGE_PAYLOAD_VERSION =
  "source-analysis-stage-payload-v1" as const;
export const SOURCE_ANALYSIS_WORKFLOW_ID =
  "workflow.full_source_analysis.v1" as const;
export const SOURCE_ANALYSIS_WORKFLOW_VERSION = "1.0.0" as const;
export const SOURCE_ANALYSIS_WORKFLOW_PATH =
  "knowledge/corpus/workflows/source-analysis-v1.md" as const;
export const SOURCE_ANALYSIS_WORKFLOW_FILE_SHA256 =
  "sha256:9143c6ad9716cc0c71aa1b823b76129d5bd79028a4a9712daeace44cb9d57a63" as const;
export const SOURCE_ANALYSIS_PROMPT_TEMPLATE_ID =
  "prompt.full_source_analysis.v1" as const;
export const SOURCE_ANALYSIS_PROMPT_TEMPLATE_VERSION = "1.0.0" as const;
export const SOURCE_ANALYSIS_PROMPT_TEMPLATE_PATH =
  "knowledge/corpus/workflows/source-analysis-prompt-v1.md" as const;
export const SOURCE_ANALYSIS_PROMPT_TEMPLATE_FILE_SHA256 =
  "sha256:2a0e61a4d81adcb554c19a40f1e8c0bda2a4d3cf2c0917f92189f793b3c8d351" as const;
export const SOURCE_ANALYSIS_REQUIRED_STAGES = [
  "full_text_read",
  "locator_grounding",
  "structured_analysis",
  "reconciliation",
] as const;

const SOURCE_ANALYSIS_WORKFLOW_HASH_DOMAIN =
  "food-systems/source-analysis-workflow/v1\n";
const SOURCE_ANALYSIS_INPUT_ENVELOPE_HASH_DOMAIN =
  "food-systems/source-analysis-input-envelope/v1\n";
const SOURCE_ANALYSIS_STAGE_PAYLOAD_HASH_DOMAIN =
  "food-systems/source-analysis-stage-payload/v1\n";
const SOURCE_ANALYSIS_CHECKPOINT_HASH_DOMAIN =
  "food-systems/source-analysis-checkpoint/v1\n";
const SOURCE_ANALYSIS_FINAL_OUTPUT_HASH_DOMAIN =
  "food-systems/source-analysis-final-output/v1\n";

const HASH_PATTERN = /^sha256:[a-f0-9]{64}$/;
const IDENTIFIER_PATTERN = /^[a-z0-9][a-z0-9._:-]*$/;
const VERSION_PATTERN = /^\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DATE_TIME_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;

const sha256Schema = z.string().regex(HASH_PATTERN);
const identifierSchema = z.string().regex(IDENTIFIER_PATTERN);
const versionSchema = z.string().regex(VERSION_PATTERN);
const dateSchema = z
  .string()
  .regex(DATE_PATTERN)
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00Z`);
    return (
      Number.isFinite(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === value
    );
  }, "Expected a real calendar date");
const dateTimeSchema = z
  .string()
  .regex(DATE_TIME_PATTERN)
  .refine(
    (value) => Number.isFinite(Date.parse(value)),
    "Expected an ISO 8601 date-time with an explicit UTC offset",
  );
const shortTextSchema = z.string().min(1).max(800);
const mediumTextSchema = z.string().min(10).max(1_600);
const repositoryPathSchema = SourceAnalysisInputRepositoryPathSchema;

const continuitySchema = z
  .object({
    kind: z.enum(["initial", "revision"]),
    predecessorArtifactId: identifierSchema.nullable(),
    predecessorArtifactVersion: versionSchema.nullable(),
    predecessorArtifactSha256: sha256Schema.nullable(),
    changeSummary: z.string().min(10).max(800).nullable(),
  })
  .strict();

const sourceBindingSchema = z
  .object({
    sourceAnalysisInputManifestPath: repositoryPathSchema,
    sourceAnalysisInputManifestFileSha256: sha256Schema,
    sourceAnalysisInputManifestSchemaVersion: z.literal(
      SOURCE_ANALYSIS_INPUT_SCHEMA_VERSION,
    ),
    sourceAnalysisInputManifestPipelineVersion: z.literal(
      SOURCE_ANALYSIS_INPUT_PIPELINE_VERSION,
    ),
    sourceAnalysisInputManifestSha256: sha256Schema,
    lifecycleRecordId: identifierSchema,
    lifecycleSnapshotSha256: sha256Schema,
    lifecycleSnapshotUpdatedAt: dateTimeSchema,
    sourceId: identifierSchema,
    sourceTitle: z.string().min(1).max(500),
    sourceCanonicalIdentity: z.string().min(1).max(2_000),
    sourceIdentityStatus: z.literal("verified"),
    sourceIdentityVerificationArtifactId: identifierSchema,
    sourceIdentityVerificationArtifactVersion: versionSchema,
    sourceIdentityVerificationArtifactPath: repositoryPathSchema,
    sourceIdentityVerificationArtifactFileSha256: sha256Schema,
    sourceIdentityVerificationArtifactSha256: sha256Schema,
    sourceIdentityVerificationDecision: z.literal("verified"),
    sourceMetadataSha256: sha256Schema,
    sourceContentSha256: sha256Schema,
    rawPdfSha256: sha256Schema,
    textSha256: sha256Schema,
    textAvailabilityState: z.enum(["full_text", "structured_content"]),
    extractionArtifactId: identifierSchema,
    extractionArtifactVersion: versionSchema,
    extractionArtifactSha256: sha256Schema,
    extractionArtifactPath: repositoryPathSchema,
    extractionArtifactFileSha256: sha256Schema,
    extractionTextManifestSha256: sha256Schema,
    pageMapPath: repositoryPathSchema,
    pageMapFileSha256: sha256Schema,
    pageMapSha256: sha256Schema,
  })
  .strict();

const scopeSchema = z
  .object({
    geographyIds: z.array(identifierSchema),
    materialProfileIds: z.array(identifierSchema),
    intendedUseProfileIds: z.array(identifierSchema).min(1),
    sourceLanguageCodes: z.array(identifierSchema).min(1),
  })
  .strict();

const extractionWarningSchema = z
  .object({
    warningId: identifierSchema,
    code: identifierSchema,
    disposition: z.enum(["accepted_limitation", "resolved_before_reading"]),
    statement: mediumTextSchema,
    affectedLocatorIds: z.array(identifierSchema).min(1),
  })
  .strict();

const fullTextEligibilitySchema = z
  .object({
    state: z.literal("eligible"),
    basis: z.enum(["full_text", "structured_content"]),
    identityHashBound: z.literal(true),
    contentHashBound: z.literal(true),
    textHashBound: z.literal(true),
    expectedUnitCount: z.number().int().positive(),
    extractionWarnings: z.array(extractionWarningSchema),
    unresolvedBlockingWarningCount: z.literal(0),
    evaluatedAt: dateTimeSchema,
  })
  .strict();

const locatorSchema = z
  .object({
    locatorId: identifierSchema,
    locatorType: z.enum(["page", "section"]),
    label: z.string().min(1).max(300),
    pageStart: z.number().int().positive().nullable(),
    pageEnd: z.number().int().positive().nullable(),
    sectionPath: z.array(z.string().min(1).max(300)),
    normalizedTextSha256: sha256Schema,
  })
  .strict();

const actualFullTextReadingSchema = z
  .object({
    state: z.literal("complete"),
    scope: z.literal("entire_normalized_text"),
    runIds: z.array(identifierSchema).min(1),
    inputTextSha256: sha256Schema,
    expectedUnitCount: z.number().int().positive(),
    readUnitCount: z.number().int().positive(),
    readLocatorIds: z.array(identifierSchema).min(1),
    sequenceComplete: z.literal(true),
    completedAt: dateTimeSchema,
  })
  .strict();

const sourceAnalysisInputEnvelopeSchema = z
  .object({
    schemaVersion: z.literal(SOURCE_ANALYSIS_INPUT_ENVELOPE_VERSION),
    sourceAnalysisInputManifest: z
      .object({
        path: repositoryPathSchema,
        fileSha256: sha256Schema,
        manifestSha256: sha256Schema,
        normalizedInputSha256: sha256Schema,
      })
      .strict(),
    sourceIdentityVerificationArtifact: z
      .object({
        path: repositoryPathSchema,
        fileSha256: sha256Schema,
        artifactId: identifierSchema,
        artifactVersion: versionSchema,
        artifactSha256: sha256Schema,
      })
      .strict(),
    lifecyclePrestate: z
      .object({
        lifecycleRecordId: identifierSchema,
        lifecycleSnapshotSha256: sha256Schema,
        lifecycleSnapshotUpdatedAt: dateTimeSchema,
      })
      .strict(),
    workflowSha256: sha256Schema,
  })
  .strict();

const sourceAnalysisStageSchema = z.enum(SOURCE_ANALYSIS_REQUIRED_STAGES);

const sourceAnalysisStagePayloadSchema = z
  .object({
    schemaVersion: z.literal(SOURCE_ANALYSIS_STAGE_PAYLOAD_VERSION),
    stage: sourceAnalysisStageSchema,
    inputEnvelopeSha256: sha256Schema,
    sourceAnalysisInputManifestSha256: sha256Schema,
    orderedLocatorIds: z.array(identifierSchema).min(1),
    orderedTextUnitSha256s: z.array(sha256Schema).min(1),
    resultPayloadSha256: sha256Schema,
  })
  .strict();

const sourceAnalysisCheckpointSchema = z
  .object({
    stage: sourceAnalysisStageSchema,
    inputSha256: sha256Schema,
    predecessorCheckpointSha256: sha256Schema.nullable(),
    stagePayload: sourceAnalysisStagePayloadSchema,
    stagePayloadSha256: sha256Schema,
    outputSha256: sha256Schema,
    completedAt: dateTimeSchema,
  })
  .strict();

const aiRunCore = {
  runId: identifierSchema,
  stages: z.array(sourceAnalysisStageSchema).min(1),
  checkpoints: z.array(sourceAnalysisCheckpointSchema).min(1),
  provider: z.string().min(1).max(200),
  model: z.string().min(1).max(200),
  workflowRef: z.literal(SOURCE_ANALYSIS_WORKFLOW_ID),
  workflowVersion: z.literal(SOURCE_ANALYSIS_WORKFLOW_VERSION),
  workflowPath: z.literal(SOURCE_ANALYSIS_WORKFLOW_PATH),
  workflowFileSha256: z.literal(SOURCE_ANALYSIS_WORKFLOW_FILE_SHA256),
  promptTemplateRef: z.literal(SOURCE_ANALYSIS_PROMPT_TEMPLATE_ID),
  promptTemplateVersion: z.literal(SOURCE_ANALYSIS_PROMPT_TEMPLATE_VERSION),
  promptTemplatePath: z.literal(SOURCE_ANALYSIS_PROMPT_TEMPLATE_PATH),
  promptTemplateFileSha256: z.literal(
    SOURCE_ANALYSIS_PROMPT_TEMPLATE_FILE_SHA256,
  ),
  workflowSha256: sha256Schema,
  inputTextSha256: sha256Schema,
  inputEnvelope: sourceAnalysisInputEnvelopeSchema,
  inputEnvelopeSha256: sha256Schema,
  predecessorOutputSha256: sha256Schema.nullable(),
  outputSha256: sha256Schema,
  timeEvidence: z.enum(["provider_exact", "coordinator_observed_window"]),
  timeEvidenceExplanation: z.string().min(20).max(800),
  startedAt: dateTimeSchema,
  completedAt: dateTimeSchema,
};

const exactModelVersionAiRunSchema = z
  .object({
    ...aiRunCore,
    modelVersionState: z.literal("exact"),
    modelVersion: z
      .string()
      .min(1)
      .max(200)
      .refine(
        (value) => value !== SOURCE_ANALYSIS_MODEL_VERSION_NOT_EXPOSED,
        "Exact model version cannot use the runtime_not_exposed sentinel",
      ),
  })
  .strict();

const runtimeVersionNotExposedAiRunSchema = z
  .object({
    ...aiRunCore,
    modelVersionState: z.literal("runtime_not_exposed"),
    modelVersion: z.literal(SOURCE_ANALYSIS_MODEL_VERSION_NOT_EXPOSED),
  })
  .strict();

const aiRunSchema = z.discriminatedUnion("modelVersionState", [
  exactModelVersionAiRunSchema,
  runtimeVersionNotExposedAiRunSchema,
]);

const analysisExecutionSchema = z
  .object({
    executionMode: z.literal("ai_assisted"),
    runs: z.array(aiRunSchema).min(1),
    finalOutputSha256: sha256Schema,
  })
  .strict();

const overviewSchema = z
  .object({
    purpose: mediumTextSchema,
    summary: z.string().min(20).max(2_000),
    sourceRoleCandidate: z.enum([
      "primary_evidence",
      "internal_synthesis",
      "generated_projection",
      "operational_control",
      "unknown",
    ]),
    sourceRoleStatus: z.literal("machine_provisional"),
    systemBoundary: mediumTextSchema,
    periodStatement: mediumTextSchema,
    notAssessed: z.array(mediumTextSchema).min(1),
  })
  .strict();

const claimSchema = z
  .object({
    claimId: identifierSchema,
    claimType: identifierSchema,
    proposition: z.string().min(10).max(1_000),
    representation: z.literal("paraphrase"),
    support: z.enum(["direct", "indirect"]),
    locatorIds: z.array(identifierSchema).min(1),
    supportingTextUnitSha256s: z.array(sha256Schema).min(1),
    limitations: z.array(shortTextSchema),
    machineConfidence: z.number().min(0).max(1),
    promotionState: z.literal("candidate_only"),
  })
  .strict();

const quantitativeMeasureSchema = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("point"),
      value: z.number().finite(),
    })
    .strict(),
  z
    .object({
      kind: z.literal("range"),
      lower: z.number().finite(),
      upper: z.number().finite(),
    })
    .strict(),
  z
    .object({
      kind: z.literal("ratio"),
      numerator: z.number().finite(),
      denominator: z.number().finite().positive(),
    })
    .strict(),
]);

const quantitativeObservationSchema = z
  .object({
    observationId: identifierSchema,
    statement: z.string().min(10).max(1_000),
    representation: z.literal("paraphrase"),
    measure: quantitativeMeasureSchema,
    unit: z
      .object({
        code: identifierSchema,
        label: z.string().min(1).max(200),
        currencyCode: z
          .string()
          .regex(/^[A-Z]{3}$/)
          .nullable(),
      })
      .strict(),
    universe: z
      .object({
        description: mediumTextSchema,
        populationSize: z.number().int().positive().nullable(),
        sampleSize: z.number().int().positive().nullable(),
        geographyIds: z.array(identifierSchema),
        inclusionCriteria: mediumTextSchema,
        exclusions: z.array(shortTextSchema),
      })
      .strict(),
    period: z
      .object({
        statement: mediumTextSchema,
        startDate: dateSchema.nullable(),
        endDate: dateSchema.nullable(),
      })
      .strict(),
    method: z
      .object({
        measurementBasis: z.enum(["source_reported", "analyst_calculated"]),
        statement: mediumTextSchema,
        calculationStatement: z.string().min(10).max(800).nullable(),
      })
      .strict(),
    uncertaintyStatement: z.string().min(10).max(800),
    locatorIds: z.array(identifierSchema).min(1),
    supportingTextUnitSha256s: z.array(sha256Schema).min(1),
    promotionState: z.literal("candidate_only"),
  })
  .strict();

const actorCandidateSchema = z
  .object({
    candidateId: identifierSchema,
    name: z.string().min(1).max(300),
    actorType: identifierSchema,
    roleStatement: mediumTextSchema,
    identityState: z.enum([
      "unresolved",
      "provisional_match",
      "verified_match",
    ]),
    existingEntityId: identifierSchema.nullable(),
    locatorIds: z.array(identifierSchema).min(1),
    promotionState: z.literal("candidate_only"),
  })
  .strict();

const policyCandidateSchema = z
  .object({
    candidateId: identifierSchema,
    name: z.string().min(1).max(500),
    policyType: identifierSchema,
    jurisdictionGeographyIds: z.array(identifierSchema),
    statusStatement: mediumTextSchema,
    identityState: z.enum([
      "unresolved",
      "provisional_match",
      "verified_match",
    ]),
    existingEntityId: identifierSchema.nullable(),
    locatorIds: z.array(identifierSchema).min(1),
    promotionState: z.literal("candidate_only"),
  })
  .strict();

const relationshipCandidateSchema = z
  .object({
    relationshipId: identifierSchema,
    subjectEntityRef: identifierSchema,
    predicate: identifierSchema,
    objectEntityRef: identifierSchema,
    direction: z.enum(["directed", "bidirectional", "unclear"]),
    statement: mediumTextSchema,
    locatorIds: z.array(identifierSchema).min(1),
    machineConfidence: z.number().min(0).max(1),
    promotionState: z.literal("candidate_only"),
  })
  .strict();

const flowCandidateSchema = z
  .object({
    flowId: identifierSchema,
    flowType: z.enum(["material", "financial", "information"]),
    fromEntityRef: identifierSchema,
    toEntityRef: identifierSchema,
    direction: z.enum(["source_to_target", "bidirectional", "unclear"]),
    statement: mediumTextSchema,
    materialProfileIds: z.array(identifierSchema),
    quantitativeObservationIds: z.array(identifierSchema),
    locatorIds: z.array(identifierSchema).min(1),
    promotionState: z.literal("candidate_only"),
  })
  .strict();

const methodFindingSchema = z
  .object({
    methodId: identifierSchema,
    methodType: identifierSchema,
    statement: mediumTextSchema,
    locatorIds: z.array(identifierSchema).min(1),
  })
  .strict();

const limitationSchema = z
  .object({
    limitationId: identifierSchema,
    origin: z.enum(["source_reported", "analyst_identified"]),
    category: identifierSchema,
    statement: mediumTextSchema,
    effectOnInterpretation: mediumTextSchema,
    locatorIds: z.array(identifierSchema).min(1),
  })
  .strict();

const cannotSupportSchema = z
  .object({
    boundaryId: identifierSchema,
    statement: mediumTextSchema,
    reason: mediumTextSchema,
    locatorIds: z.array(identifierSchema).min(1),
  })
  .strict();

const conflictOfInterestSchema = z
  .object({
    state: z.enum(["reported_none", "reported_present", "not_reported"]),
    statement: mediumTextSchema,
    locatorIds: z.array(identifierSchema).min(1),
  })
  .strict();

const otherSourceEvidenceSchema = z
  .object({
    sourceId: identifierSchema,
    sourceContentSha256: sha256Schema,
    analysisArtifactId: identifierSchema,
    analysisArtifactVersion: versionSchema,
    analysisArtifactSha256: sha256Schema,
    locatorIds: z.array(identifierSchema).min(1),
  })
  .strict();

const crossSourceFindingSchema = z
  .object({
    findingId: identifierSchema,
    topic: z.string().min(1).max(300),
    statement: mediumTextSchema,
    thisSourceLocatorIds: z.array(identifierSchema).min(1),
    otherSourceEvidence: z.array(otherSourceEvidenceSchema).min(1),
    status: z.literal("open_candidate"),
  })
  .strict();

const internalInconsistencySchema = z
  .object({
    findingId: identifierSchema,
    topic: z.string().min(1).max(300),
    statement: mediumTextSchema,
    locatorIds: z.array(identifierSchema).min(2),
    supportingTextUnitSha256s: z.array(sha256Schema).min(2),
    status: z.literal("open_candidate"),
  })
  .strict();

const openQuestionSchema = z
  .object({
    questionId: identifierSchema,
    question: mediumTextSchema,
    rationale: mediumTextSchema,
    locatorIds: z.array(identifierSchema).min(1),
    followUpSourceClasses: z.array(identifierSchema).min(1),
    blocking: z.boolean(),
  })
  .strict();

const ontologyCandidateSchema = z
  .object({
    candidateId: identifierSchema,
    objectType: z.enum([
      "actor",
      "policy",
      "relationship",
      "flow",
      "material",
      "term",
      "method",
    ]),
    preferredLabel: z.string().min(1).max(300),
    proposedOntologyIds: z.array(identifierSchema),
    basis: mediumTextSchema,
    locatorIds: z.array(identifierSchema).min(1),
    status: z.literal("candidate_only"),
    automaticPromotion: z.literal(false),
  })
  .strict();

const coverageCandidateSchema = z
  .object({
    candidateId: identifierSchema,
    coverageCellId: identifierSchema,
    rationale: mediumTextSchema,
    evidenceClaimIds: z.array(identifierSchema),
    evidenceObservationIds: z.array(identifierSchema),
    locatorIds: z.array(identifierSchema).min(1),
    state: z.literal("candidate_only"),
    automaticPromotion: z.literal(false),
  })
  .strict();

const analysisSchema = z
  .object({
    overview: overviewSchema,
    claims: z.array(claimSchema),
    quantitativeObservations: z.array(quantitativeObservationSchema),
    actors: z.array(actorCandidateSchema),
    policies: z.array(policyCandidateSchema),
    relationships: z.array(relationshipCandidateSchema),
    flows: z.array(flowCandidateSchema),
    sourceAppraisal: z
      .object({
        methods: z.array(methodFindingSchema).min(1),
        limitations: z.array(limitationSchema).min(1),
        conflictOfInterest: conflictOfInterestSchema,
        cannotSupport: z.array(cannotSupportSchema).min(1),
      })
      .strict(),
    reconciliation: z
      .object({
        internalInconsistencies: z.array(internalInconsistencySchema),
        corroborations: z.array(crossSourceFindingSchema),
        contradictions: z.array(crossSourceFindingSchema),
        openQuestions: z.array(openQuestionSchema),
      })
      .strict(),
    ontologyCandidates: z.array(ontologyCandidateSchema),
    coverageCandidates: z.array(coverageCandidateSchema),
  })
  .strict();

const closedGateSchema = z
  .object({
    complete: z.literal(false),
    state: z.enum(["not_requested", "pending"]),
    receiptId: z.null(),
  })
  .strict();

const analysisGatesSchema = z
  .object({
    ownerReview: closedGateSchema,
    independentExpertValidation: closedGateSchema,
    partnerValidation: closedGateSchema,
    rightsHolderValidation: closedGateSchema,
    rightsReview: z
      .object({
        complete: z.literal(false),
        state: z.literal("pending_review"),
        receiptId: z.null(),
      })
      .strict(),
    publication: z
      .object({
        complete: z.literal(false),
        state: z.literal("internal_only"),
        receiptId: z.null(),
      })
      .strict(),
    coverage: z
      .object({
        complete: z.literal(false),
        state: z.literal("candidate"),
        receiptId: z.null(),
        automaticPromotionAllowed: z.literal(false),
      })
      .strict(),
  })
  .strict();

export const sourceAnalysisArtifactStructuralSchema = z
  .object({
    schemaVersion: z.literal(SOURCE_ANALYSIS_SCHEMA_VERSION),
    artifactType: z.literal("source_analysis"),
    artifactId: identifierSchema,
    artifactVersion: versionSchema,
    lineageId: identifierSchema,
    continuity: continuitySchema,
    binding: sourceBindingSchema,
    scope: scopeSchema,
    sourceTextPolicy: z
      .object({
        longSourceTextIncluded: z.literal(false),
        directQuotesIncluded: z.literal(false),
        policy: z.literal("paraphrases_and_locators_only"),
      })
      .strict(),
    fullTextEligibility: fullTextEligibilitySchema,
    locators: z.array(locatorSchema).min(1),
    actualFullTextReading: actualFullTextReadingSchema,
    analysisExecution: analysisExecutionSchema,
    analysis: analysisSchema,
    gates: analysisGatesSchema,
    analysisPayloadSha256: sha256Schema,
    createdAt: dateTimeSchema,
    artifactSha256: sha256Schema,
  })
  .strict();

export type SourceAnalysisArtifact = z.infer<
  typeof sourceAnalysisArtifactStructuralSchema
>;
export type SourceAnalysisBinding = SourceAnalysisArtifact["binding"];
export type SourceAnalysisPayload = Pick<
  SourceAnalysisArtifact,
  "locators" | "analysis"
>;
export type SourceAnalysisInputEnvelope = z.infer<
  typeof sourceAnalysisInputEnvelopeSchema
>;
export type SourceAnalysisStage =
  (typeof SOURCE_ANALYSIS_REQUIRED_STAGES)[number];
export type SourceAnalysisStagePayload = z.infer<
  typeof sourceAnalysisStagePayloadSchema
>;
export type SourceAnalysisCheckpoint = z.infer<
  typeof sourceAnalysisCheckpointSchema
>;

export type JsonValue =
  null | boolean | number | string | JsonValue[] | { [key: string]: JsonValue };

function fail(message: string): never {
  throw new Error(`Source-analysis artifact validation failed: ${message}`);
}

export function canonicalSourceAnalysisJson(value: JsonValue): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalSourceAnalysisJson(item)).join(",")}]`;
  }
  return `{${Object.keys(value)
    .sort()
    .map(
      (key) =>
        `${JSON.stringify(key)}:${canonicalSourceAnalysisJson(value[key] as JsonValue)}`,
    )
    .join(",")}}`;
}

export function sourceAnalysisSha256(value: string | Buffer): string {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function domainSeparatedSourceAnalysisSha256(
  domain: string,
  value: JsonValue,
): string {
  return sourceAnalysisSha256(`${domain}${canonicalSourceAnalysisJson(value)}`);
}

export function hashSourceAnalysisPayload(
  payload: SourceAnalysisPayload,
): string {
  return sourceAnalysisSha256(
    canonicalSourceAnalysisJson(payload as JsonValue),
  );
}

export function hashSourceAnalysisWorkflow(input: {
  workflowRef: string;
  workflowVersion: string;
  workflowPath: string;
  workflowFileSha256: string;
  promptTemplateRef: string;
  promptTemplateVersion: string;
  promptTemplatePath: string;
  promptTemplateFileSha256: string;
}): string {
  return domainSeparatedSourceAnalysisSha256(
    SOURCE_ANALYSIS_WORKFLOW_HASH_DOMAIN,
    {
      ...input,
      requiredStages: [...SOURCE_ANALYSIS_REQUIRED_STAGES],
    },
  );
}

export function sourceAnalysisInputEnvelope(
  binding: SourceAnalysisBinding,
  workflowSha256: string,
): SourceAnalysisInputEnvelope {
  return {
    schemaVersion: SOURCE_ANALYSIS_INPUT_ENVELOPE_VERSION,
    sourceAnalysisInputManifest: {
      path: binding.sourceAnalysisInputManifestPath,
      fileSha256: binding.sourceAnalysisInputManifestFileSha256,
      manifestSha256: binding.sourceAnalysisInputManifestSha256,
      normalizedInputSha256: binding.textSha256,
    },
    sourceIdentityVerificationArtifact: {
      path: binding.sourceIdentityVerificationArtifactPath,
      fileSha256: binding.sourceIdentityVerificationArtifactFileSha256,
      artifactId: binding.sourceIdentityVerificationArtifactId,
      artifactVersion: binding.sourceIdentityVerificationArtifactVersion,
      artifactSha256: binding.sourceIdentityVerificationArtifactSha256,
    },
    lifecyclePrestate: {
      lifecycleRecordId: binding.lifecycleRecordId,
      lifecycleSnapshotSha256: binding.lifecycleSnapshotSha256,
      lifecycleSnapshotUpdatedAt: binding.lifecycleSnapshotUpdatedAt,
    },
    workflowSha256,
  };
}

export function hashSourceAnalysisInputEnvelope(
  envelope: SourceAnalysisInputEnvelope,
): string {
  return domainSeparatedSourceAnalysisSha256(
    SOURCE_ANALYSIS_INPUT_ENVELOPE_HASH_DOMAIN,
    envelope as JsonValue,
  );
}

export function sourceAnalysisStageResultSha256(
  stage: SourceAnalysisStage,
  artifact: Pick<
    SourceAnalysisArtifact,
    "actualFullTextReading" | "locators" | "analysis" | "analysisPayloadSha256"
  >,
): string {
  if (stage === "full_text_read") {
    return sourceAnalysisSha256(
      canonicalSourceAnalysisJson(artifact.actualFullTextReading as JsonValue),
    );
  }
  if (stage === "locator_grounding") {
    return sourceAnalysisSha256(
      canonicalSourceAnalysisJson(artifact.locators as JsonValue),
    );
  }
  if (stage === "structured_analysis") {
    const { reconciliation: _reconciliation, ...structuredAnalysis } =
      artifact.analysis;
    return sourceAnalysisSha256(
      canonicalSourceAnalysisJson(structuredAnalysis as JsonValue),
    );
  }
  return artifact.analysisPayloadSha256;
}

export function sourceAnalysisStagePayload(
  stage: SourceAnalysisStage,
  artifact: Pick<
    SourceAnalysisArtifact,
    | "binding"
    | "actualFullTextReading"
    | "locators"
    | "analysis"
    | "analysisPayloadSha256"
  >,
  inputEnvelopeSha256: string,
): SourceAnalysisStagePayload {
  return {
    schemaVersion: SOURCE_ANALYSIS_STAGE_PAYLOAD_VERSION,
    stage,
    inputEnvelopeSha256,
    sourceAnalysisInputManifestSha256:
      artifact.binding.sourceAnalysisInputManifestSha256,
    orderedLocatorIds: artifact.locators.map((locator) => locator.locatorId),
    orderedTextUnitSha256s: artifact.locators.map(
      (locator) => locator.normalizedTextSha256,
    ),
    resultPayloadSha256: sourceAnalysisStageResultSha256(stage, artifact),
  };
}

export function hashSourceAnalysisStagePayload(
  payload: SourceAnalysisStagePayload,
): string {
  return domainSeparatedSourceAnalysisSha256(
    SOURCE_ANALYSIS_STAGE_PAYLOAD_HASH_DOMAIN,
    payload as JsonValue,
  );
}

export function hashSourceAnalysisCheckpoint(input: {
  stage: SourceAnalysisStage;
  inputSha256: string;
  predecessorCheckpointSha256: string | null;
  stagePayloadSha256: string;
  completedAt: string;
}): string {
  return domainSeparatedSourceAnalysisSha256(
    SOURCE_ANALYSIS_CHECKPOINT_HASH_DOMAIN,
    input as JsonValue,
  );
}

export function hashSourceAnalysisFinalOutput(input: {
  analysisPayloadSha256: string;
  lastCheckpointOutputSha256: string;
}): string {
  return domainSeparatedSourceAnalysisSha256(
    SOURCE_ANALYSIS_FINAL_OUTPUT_HASH_DOMAIN,
    input as JsonValue,
  );
}

function assertUnique(values: string[], label: string): void {
  if (new Set(values).size !== values.length) fail(`${label} must be unique`);
}

function assertSameOrderedValues(
  actual: string[],
  expected: string[],
  label: string,
): void {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    fail(`${label} must exactly match the declared ordered sequence`);
  }
}

function assertLocatorRefs(
  locatorIds: string[],
  knownLocatorIds: Set<string>,
  label: string,
): void {
  assertUnique(locatorIds, `${label} locator IDs`);
  for (const locatorId of locatorIds) {
    if (!knownLocatorIds.has(locatorId))
      fail(`${label} references unknown locator ${locatorId}`);
  }
}

function validateContinuity(artifact: SourceAnalysisArtifact): void {
  const continuity = artifact.continuity;
  const predecessorValues = [
    continuity.predecessorArtifactId,
    continuity.predecessorArtifactVersion,
    continuity.predecessorArtifactSha256,
  ];
  if (continuity.kind === "initial") {
    if (
      predecessorValues.some((value) => value !== null) ||
      continuity.changeSummary !== null
    ) {
      fail("initial continuity cannot name a predecessor or change summary");
    }
  } else {
    if (
      predecessorValues.some((value) => value === null) ||
      continuity.changeSummary === null
    ) {
      fail(
        "revision continuity requires the exact predecessor ID, version, hash and change summary",
      );
    }
    if (continuity.predecessorArtifactVersion === artifact.artifactVersion) {
      fail(
        "revision predecessor version must differ from the current artifact version",
      );
    }
    if (continuity.predecessorArtifactSha256 === artifact.artifactSha256) {
      fail(
        "revision predecessor hash must differ from the current artifact hash",
      );
    }
  }
}

function validateLocator(
  locator: SourceAnalysisArtifact["locators"][number],
): void {
  if (locator.locatorType === "page") {
    if (locator.pageStart === null || locator.pageStart !== locator.pageEnd) {
      fail(`page locator ${locator.locatorId} requires one exact page`);
    }
  } else if (locator.sectionPath.length === 0) {
    fail(`section locator ${locator.locatorId} requires a section path`);
  }
  if (
    locator.pageStart !== null &&
    locator.pageEnd !== null &&
    locator.pageStart > locator.pageEnd
  ) {
    fail(`locator ${locator.locatorId} has an inverted page range`);
  }
}

function validateExecution(artifact: SourceAnalysisArtifact): void {
  const runs = artifact.analysisExecution.runs;
  assertUnique(
    runs.map((run) => run.runId),
    "AI run IDs",
  );
  const observedStages = runs.flatMap((run) => run.stages);
  assertSameOrderedValues(
    observedStages,
    [...SOURCE_ANALYSIS_REQUIRED_STAGES],
    "AI execution stages",
  );

  let previousCheckpoint: SourceAnalysisCheckpoint | null = null;
  let previousRun:
    SourceAnalysisArtifact["analysisExecution"]["runs"][number] | null = null;
  let firstWorkflow: Pick<
    SourceAnalysisArtifact["analysisExecution"]["runs"][number],
    | "workflowRef"
    | "workflowVersion"
    | "workflowPath"
    | "workflowFileSha256"
    | "promptTemplateRef"
    | "promptTemplateVersion"
    | "promptTemplatePath"
    | "promptTemplateFileSha256"
    | "workflowSha256"
  > | null = null;

  runs.forEach((run) => {
    assertSameOrderedValues(
      run.checkpoints.map((checkpoint) => checkpoint.stage),
      run.stages,
      `AI run ${run.runId} checkpoint stages`,
    );
    if (run.inputTextSha256 !== artifact.binding.textSha256) {
      fail(`AI run ${run.runId} is not bound to the exact source text hash`);
    }
    const expectedWorkflowSha256 = hashSourceAnalysisWorkflow({
      workflowRef: run.workflowRef,
      workflowVersion: run.workflowVersion,
      workflowPath: run.workflowPath,
      workflowFileSha256: run.workflowFileSha256,
      promptTemplateRef: run.promptTemplateRef,
      promptTemplateVersion: run.promptTemplateVersion,
      promptTemplatePath: run.promptTemplatePath,
      promptTemplateFileSha256: run.promptTemplateFileSha256,
    });
    if (run.workflowSha256 !== expectedWorkflowSha256) {
      fail(
        `AI run ${run.runId} workflow hash does not match the canonical workflow binding`,
      );
    }
    const workflow = {
      workflowRef: run.workflowRef,
      workflowVersion: run.workflowVersion,
      workflowPath: run.workflowPath,
      workflowFileSha256: run.workflowFileSha256,
      promptTemplateRef: run.promptTemplateRef,
      promptTemplateVersion: run.promptTemplateVersion,
      promptTemplatePath: run.promptTemplatePath,
      promptTemplateFileSha256: run.promptTemplateFileSha256,
      workflowSha256: run.workflowSha256,
    };
    if (firstWorkflow === null) firstWorkflow = workflow;
    else if (
      canonicalSourceAnalysisJson(workflow as JsonValue) !==
      canonicalSourceAnalysisJson(firstWorkflow as JsonValue)
    ) {
      fail(`AI run ${run.runId} has workflow drift from the first run`);
    }

    const expectedEnvelope = sourceAnalysisInputEnvelope(
      artifact.binding,
      run.workflowSha256,
    );
    if (
      canonicalSourceAnalysisJson(run.inputEnvelope as JsonValue) !==
      canonicalSourceAnalysisJson(expectedEnvelope as JsonValue)
    ) {
      fail(
        `AI run ${run.runId} input envelope drifts from the exact bound inputs`,
      );
    }
    const expectedEnvelopeSha256 =
      hashSourceAnalysisInputEnvelope(expectedEnvelope);
    if (run.inputEnvelopeSha256 !== expectedEnvelopeSha256) {
      fail(
        `AI run ${run.runId} input-envelope hash does not match its canonical envelope`,
      );
    }
    if (Date.parse(run.startedAt) > Date.parse(run.completedAt)) {
      fail(`AI run ${run.runId} completes before it starts`);
    }
    if (previousRun === null && run.predecessorOutputSha256 !== null) {
      fail("first AI run cannot name a predecessor output");
    }
    if (previousRun) {
      if (run.predecessorOutputSha256 !== previousRun.outputSha256) {
        fail(
          `AI run ${run.runId} does not continue the exact previous output hash`,
        );
      }
      if (Date.parse(run.startedAt) < Date.parse(previousRun.completedAt)) {
        fail(`AI run ${run.runId} starts before the previous run completed`);
      }
    }

    let previousCheckpointTime = Date.parse(run.startedAt);
    for (const checkpoint of run.checkpoints) {
      const predecessorCheckpointSha256 =
        previousCheckpoint?.outputSha256 ?? null;
      if (
        checkpoint.predecessorCheckpointSha256 !== predecessorCheckpointSha256
      ) {
        fail(`checkpoint ${checkpoint.stage} has a broken predecessor chain`);
      }
      const expectedInputSha256 =
        predecessorCheckpointSha256 ?? run.inputEnvelopeSha256;
      if (checkpoint.inputSha256 !== expectedInputSha256) {
        fail(
          `checkpoint ${checkpoint.stage} does not consume the exact predecessor or envelope`,
        );
      }
      const expectedStagePayload = sourceAnalysisStagePayload(
        checkpoint.stage,
        artifact,
        run.inputEnvelopeSha256,
      );
      if (
        canonicalSourceAnalysisJson(checkpoint.stagePayload as JsonValue) !==
        canonicalSourceAnalysisJson(expectedStagePayload as JsonValue)
      ) {
        fail(
          `checkpoint ${checkpoint.stage} stage payload drifts from the exact artifact inputs`,
        );
      }
      const expectedStagePayloadSha256 =
        hashSourceAnalysisStagePayload(expectedStagePayload);
      if (checkpoint.stagePayloadSha256 !== expectedStagePayloadSha256) {
        fail(`checkpoint ${checkpoint.stage} stage-payload hash is invalid`);
      }
      const expectedCheckpointOutputSha256 = hashSourceAnalysisCheckpoint({
        stage: checkpoint.stage,
        inputSha256: checkpoint.inputSha256,
        predecessorCheckpointSha256: checkpoint.predecessorCheckpointSha256,
        stagePayloadSha256: checkpoint.stagePayloadSha256,
        completedAt: checkpoint.completedAt,
      });
      if (checkpoint.outputSha256 !== expectedCheckpointOutputSha256) {
        fail(`checkpoint ${checkpoint.stage} output seal is invalid`);
      }
      const checkpointTime = Date.parse(checkpoint.completedAt);
      if (
        checkpointTime < previousCheckpointTime ||
        checkpointTime > Date.parse(run.completedAt)
      ) {
        fail(
          `checkpoint ${checkpoint.stage} is outside its ordered run window`,
        );
      }
      previousCheckpointTime = checkpointTime;
      previousCheckpoint = checkpoint;
    }
    if (run.outputSha256 !== run.checkpoints.at(-1)!.outputSha256) {
      fail(
        `AI run ${run.runId} output does not match its final checkpoint seal`,
      );
    }
    previousRun = run;
  });

  const readingRunIds = runs
    .filter((run) => run.stages.includes("full_text_read"))
    .map((run) => run.runId);
  assertUnique(
    artifact.actualFullTextReading.runIds,
    "full-text reading run IDs",
  );
  assertSameOrderedValues(
    artifact.actualFullTextReading.runIds,
    readingRunIds,
    "full-text reading run IDs",
  );
  const fullTextCheckpoint = runs
    .flatMap((run) => run.checkpoints)
    .find((checkpoint) => checkpoint.stage === "full_text_read")!;
  if (
    artifact.actualFullTextReading.completedAt !==
    fullTextCheckpoint.completedAt
  ) {
    fail(
      "actual full-text reading completion must equal the exact reading checkpoint",
    );
  }
  const expectedFinalOutputSha256 = hashSourceAnalysisFinalOutput({
    analysisPayloadSha256: artifact.analysisPayloadSha256,
    lastCheckpointOutputSha256: previousCheckpoint!.outputSha256,
  });
  if (
    artifact.analysisExecution.finalOutputSha256 !== expectedFinalOutputSha256
  ) {
    fail(
      "final AI output seal does not bind the exact analysis payload and checkpoint chain",
    );
  }
}

function validateQuantitativeObservation(
  observation: SourceAnalysisArtifact["analysis"]["quantitativeObservations"][number],
): void {
  if (
    observation.measure.kind === "range" &&
    observation.measure.lower > observation.measure.upper
  ) {
    fail(
      `quantitative observation ${observation.observationId} has an inverted range`,
    );
  }
  const { populationSize, sampleSize } = observation.universe;
  if (
    populationSize !== null &&
    sampleSize !== null &&
    sampleSize > populationSize
  ) {
    fail(
      `quantitative observation ${observation.observationId} sample exceeds its population`,
    );
  }
  const { startDate, endDate } = observation.period;
  if (startDate !== null && endDate !== null && startDate > endDate) {
    fail(
      `quantitative observation ${observation.observationId} has an inverted period`,
    );
  }
  const { measurementBasis, calculationStatement } = observation.method;
  if (
    (measurementBasis === "analyst_calculated") !==
    (calculationStatement !== null)
  ) {
    fail(
      `quantitative observation ${observation.observationId} calculation disclosure is inconsistent`,
    );
  }
}

function validateAnalysisReferences(artifact: SourceAnalysisArtifact): void {
  const locators = new Map(
    artifact.locators.map((locator) => [locator.locatorId, locator]),
  );
  const locatorIds = new Set(locators.keys());
  const claimIdValues = artifact.analysis.claims.map((claim) => claim.claimId);
  const observationIdValues = artifact.analysis.quantitativeObservations.map(
    (observation) => observation.observationId,
  );
  const entityIdValues = [
    ...artifact.analysis.actors.map((actor) => actor.candidateId),
    ...artifact.analysis.policies.map((policy) => policy.candidateId),
  ];
  const claimIds = new Set(claimIdValues);
  const observationIds = new Set(observationIdValues);
  const entityIds = new Set(entityIdValues);

  assertUnique(claimIdValues, "claim IDs");
  assertUnique(observationIdValues, "quantitative observation IDs");
  assertUnique(entityIdValues, "actor and policy candidate IDs");
  assertUnique(
    artifact.analysis.relationships.map((item) => item.relationshipId),
    "relationship IDs",
  );
  assertUnique(
    artifact.analysis.flows.map((item) => item.flowId),
    "flow IDs",
  );
  assertUnique(
    artifact.analysis.sourceAppraisal.methods.map((item) => item.methodId),
    "method IDs",
  );
  assertUnique(
    artifact.analysis.sourceAppraisal.limitations.map(
      (item) => item.limitationId,
    ),
    "limitation IDs",
  );
  assertUnique(
    artifact.analysis.sourceAppraisal.cannotSupport.map(
      (item) => item.boundaryId,
    ),
    "cannot-support boundary IDs",
  );
  assertUnique(
    artifact.fullTextEligibility.extractionWarnings.map(
      (item) => item.warningId,
    ),
    "extraction-warning IDs",
  );
  assertUnique(
    artifact.analysis.reconciliation.internalInconsistencies.map(
      (item) => item.findingId,
    ),
    "internal-inconsistency IDs",
  );
  assertUnique(
    artifact.analysis.reconciliation.corroborations.map(
      (item) => item.findingId,
    ),
    "corroboration IDs",
  );
  assertUnique(
    artifact.analysis.reconciliation.contradictions.map(
      (item) => item.findingId,
    ),
    "contradiction IDs",
  );
  assertUnique(
    artifact.analysis.reconciliation.openQuestions.map(
      (item) => item.questionId,
    ),
    "open-question IDs",
  );
  assertUnique(
    artifact.analysis.ontologyCandidates.map((item) => item.candidateId),
    "ontology candidate IDs",
  );
  assertUnique(
    artifact.analysis.coverageCandidates.map((item) => item.candidateId),
    "coverage candidate IDs",
  );

  for (const warning of artifact.fullTextEligibility.extractionWarnings) {
    assertLocatorRefs(
      warning.affectedLocatorIds,
      locatorIds,
      `warning ${warning.warningId}`,
    );
  }
  for (const claim of artifact.analysis.claims) {
    assertLocatorRefs(claim.locatorIds, locatorIds, `claim ${claim.claimId}`);
    const expectedHashes = claim.locatorIds.map(
      (locatorId) => locators.get(locatorId)!.normalizedTextSha256,
    );
    assertSameOrderedValues(
      claim.supportingTextUnitSha256s,
      expectedHashes,
      `claim ${claim.claimId} supporting text hashes`,
    );
  }
  for (const observation of artifact.analysis.quantitativeObservations) {
    assertLocatorRefs(
      observation.locatorIds,
      locatorIds,
      `observation ${observation.observationId}`,
    );
    const expectedHashes = observation.locatorIds.map(
      (locatorId) => locators.get(locatorId)!.normalizedTextSha256,
    );
    assertSameOrderedValues(
      observation.supportingTextUnitSha256s,
      expectedHashes,
      `observation ${observation.observationId} supporting text hashes`,
    );
    validateQuantitativeObservation(observation);
  }

  const locatedCollections = [
    ...artifact.analysis.actors.map(
      (item) => [item.candidateId, item.locatorIds] as const,
    ),
    ...artifact.analysis.policies.map(
      (item) => [item.candidateId, item.locatorIds] as const,
    ),
    ...artifact.analysis.relationships.map(
      (item) => [item.relationshipId, item.locatorIds] as const,
    ),
    ...artifact.analysis.flows.map(
      (item) => [item.flowId, item.locatorIds] as const,
    ),
    ...artifact.analysis.sourceAppraisal.methods.map(
      (item) => [item.methodId, item.locatorIds] as const,
    ),
    ...artifact.analysis.sourceAppraisal.limitations.map(
      (item) => [item.limitationId, item.locatorIds] as const,
    ),
    ...artifact.analysis.sourceAppraisal.cannotSupport.map(
      (item) => [item.boundaryId, item.locatorIds] as const,
    ),
    [
      "source-conflict-of-interest",
      artifact.analysis.sourceAppraisal.conflictOfInterest.locatorIds,
    ] as const,
    ...artifact.analysis.reconciliation.internalInconsistencies.map(
      (item) => [item.findingId, item.locatorIds] as const,
    ),
    ...artifact.analysis.reconciliation.corroborations.map(
      (item) => [item.findingId, item.thisSourceLocatorIds] as const,
    ),
    ...artifact.analysis.reconciliation.contradictions.map(
      (item) => [item.findingId, item.thisSourceLocatorIds] as const,
    ),
    ...artifact.analysis.reconciliation.openQuestions.map(
      (item) => [item.questionId, item.locatorIds] as const,
    ),
    ...artifact.analysis.ontologyCandidates.map(
      (item) => [item.candidateId, item.locatorIds] as const,
    ),
    ...artifact.analysis.coverageCandidates.map(
      (item) => [item.candidateId, item.locatorIds] as const,
    ),
  ];
  for (const [id, refs] of locatedCollections)
    assertLocatorRefs(refs, locatorIds, id);

  for (const finding of artifact.analysis.reconciliation
    .internalInconsistencies) {
    const expectedHashes = finding.locatorIds.map(
      (locatorId) => locators.get(locatorId)!.normalizedTextSha256,
    );
    assertSameOrderedValues(
      finding.supportingTextUnitSha256s,
      expectedHashes,
      `internal inconsistency ${finding.findingId} supporting text hashes`,
    );
  }

  for (const candidate of [
    ...artifact.analysis.actors,
    ...artifact.analysis.policies,
  ]) {
    if (
      (candidate.identityState === "verified_match") !==
      (candidate.existingEntityId !== null)
    ) {
      fail(
        `entity candidate ${candidate.candidateId} identity binding is inconsistent`,
      );
    }
  }
  for (const relationship of artifact.analysis.relationships) {
    if (
      !entityIds.has(relationship.subjectEntityRef) ||
      !entityIds.has(relationship.objectEntityRef)
    ) {
      fail(
        `relationship ${relationship.relationshipId} references an undeclared entity candidate`,
      );
    }
  }
  for (const flow of artifact.analysis.flows) {
    if (
      !entityIds.has(flow.fromEntityRef) ||
      !entityIds.has(flow.toEntityRef)
    ) {
      fail(`flow ${flow.flowId} references an undeclared entity candidate`);
    }
    if (flow.flowType === "material" && flow.materialProfileIds.length === 0) {
      fail(
        `material flow ${flow.flowId} requires at least one material profile`,
      );
    }
    assertUnique(
      flow.quantitativeObservationIds,
      `flow ${flow.flowId} observation IDs`,
    );
    for (const observationId of flow.quantitativeObservationIds) {
      if (!observationIds.has(observationId)) {
        fail(
          `flow ${flow.flowId} references unknown observation ${observationId}`,
        );
      }
    }
  }
  for (const candidate of artifact.analysis.coverageCandidates) {
    assertUnique(
      candidate.evidenceClaimIds,
      `coverage candidate ${candidate.candidateId} claim IDs`,
    );
    assertUnique(
      candidate.evidenceObservationIds,
      `coverage candidate ${candidate.candidateId} observation IDs`,
    );
    for (const claimId of candidate.evidenceClaimIds) {
      if (!claimIds.has(claimId))
        fail(`coverage candidate references unknown claim ${claimId}`);
    }
    for (const observationId of candidate.evidenceObservationIds) {
      if (!observationIds.has(observationId)) {
        fail(
          `coverage candidate references unknown observation ${observationId}`,
        );
      }
    }
  }
  for (const finding of [
    ...artifact.analysis.reconciliation.corroborations,
    ...artifact.analysis.reconciliation.contradictions,
  ]) {
    assertUnique(
      finding.otherSourceEvidence.map((evidence) => evidence.sourceId),
      `cross-source finding ${finding.findingId} counterpart source IDs`,
    );
    for (const evidence of finding.otherSourceEvidence) {
      if (evidence.sourceId === artifact.binding.sourceId) {
        fail(
          `cross-source finding ${finding.findingId} cannot cite itself as the counterpart source`,
        );
      }
    }
  }
  assertUnique(
    [
      ...artifact.analysis.reconciliation.internalInconsistencies.map(
        (item) => item.findingId,
      ),
      ...artifact.analysis.reconciliation.corroborations.map(
        (item) => item.findingId,
      ),
      ...artifact.analysis.reconciliation.contradictions.map(
        (item) => item.findingId,
      ),
    ],
    "all reconciliation finding IDs",
  );
}

function validateReading(artifact: SourceAnalysisArtifact): void {
  const locatorIds = artifact.locators.map((locator) => locator.locatorId);
  assertUnique(locatorIds, "locator IDs");
  artifact.locators.forEach(validateLocator);
  assertUnique(artifact.scope.geographyIds, "scope geography IDs");
  assertUnique(artifact.scope.materialProfileIds, "scope material profile IDs");
  assertUnique(
    artifact.scope.intendedUseProfileIds,
    "scope intended-use profile IDs",
  );
  assertUnique(
    artifact.scope.sourceLanguageCodes,
    "scope source-language codes",
  );
  if (
    artifact.fullTextEligibility.basis !==
    artifact.binding.textAvailabilityState
  ) {
    fail(
      "full-text eligibility basis must match the bound lifecycle text state",
    );
  }
  if (
    artifact.actualFullTextReading.inputTextSha256 !==
    artifact.binding.textSha256
  ) {
    fail("actual reading must bind the exact source text hash");
  }
  const counts = [
    artifact.fullTextEligibility.expectedUnitCount,
    artifact.actualFullTextReading.expectedUnitCount,
    artifact.actualFullTextReading.readUnitCount,
    locatorIds.length,
  ];
  if (new Set(counts).size !== 1) {
    fail(
      "eligibility, locator and actual-reading unit counts must match exactly",
    );
  }
  assertSameOrderedValues(
    artifact.actualFullTextReading.readLocatorIds,
    locatorIds,
    "actual full-text reading locator IDs",
  );
  if (
    Date.parse(artifact.fullTextEligibility.evaluatedAt) >
    Date.parse(artifact.actualFullTextReading.completedAt)
  ) {
    fail("actual full-text reading cannot predate eligibility");
  }
}

function validateTimes(artifact: SourceAnalysisArtifact): void {
  const firstRun = artifact.analysisExecution.runs[0]!;
  const lastRun = artifact.analysisExecution.runs.at(-1)!;
  if (
    Date.parse(artifact.binding.lifecycleSnapshotUpdatedAt) >
    Date.parse(firstRun.startedAt)
  ) {
    fail("AI analysis cannot predate its bound lifecycle snapshot");
  }
  if (
    Date.parse(artifact.actualFullTextReading.completedAt) >
    Date.parse(lastRun.completedAt)
  ) {
    fail(
      "actual full-text reading completion cannot postdate the AI execution",
    );
  }
  if (Date.parse(artifact.createdAt) < Date.parse(lastRun.completedAt)) {
    fail("artifact creation cannot predate the final AI run");
  }
}

export function validateSourceAnalysisArtifact(
  value: unknown,
): SourceAnalysisArtifact {
  const parsed = sourceAnalysisArtifactStructuralSchema.safeParse(value);
  if (!parsed.success) {
    fail(
      parsed.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; "),
    );
  }
  const artifact = parsed.data;
  validateContinuity(artifact);
  validateReading(artifact);
  validateAnalysisReferences(artifact);
  const payloadSha256 = hashSourceAnalysisPayload({
    locators: artifact.locators,
    analysis: artifact.analysis,
  });
  if (artifact.analysisPayloadSha256 !== payloadSha256) {
    fail(
      "analysis payload hash does not match the canonical locators and analysis",
    );
  }
  validateExecution(artifact);
  validateTimes(artifact);
  const { artifactSha256, ...artifactBody } = artifact;
  const expectedArtifactSha256 = sourceAnalysisSha256(
    canonicalSourceAnalysisJson(artifactBody as JsonValue),
  );
  if (artifactSha256 !== expectedArtifactSha256) {
    fail("artifact hash does not match the canonical artifact body");
  }
  return artifact;
}

export function validateSourceAnalysisBinding(
  artifact: SourceAnalysisArtifact,
  expected: SourceAnalysisBinding,
): SourceAnalysisArtifact {
  const validated = validateSourceAnalysisArtifact(artifact);
  if (
    canonicalSourceAnalysisJson(validated.binding as JsonValue) !==
    canonicalSourceAnalysisJson(expected as JsonValue)
  ) {
    fail(
      "artifact binding does not match the exact expected lifecycle/source/content/text snapshot",
    );
  }
  return validated;
}

function validateSourceAnalysisIdentityReferenceFields(
  binding: SourceAnalysisBinding,
  identityArtifact: SourceIdentityVerificationArtifact,
  requireSharedLifecycleSnapshot: boolean,
): SourceAnalysisBinding {
  const identity = requireVerifiedSourceIdentity(identityArtifact);
  const verified = identity.decision.verifiedIdentity;
  const expectedReference = {
    artifactId: identity.artifactId,
    artifactVersion: identity.artifactVersion,
    artifactSha256: identity.artifactSha256,
    decision: identity.decision.state,
  };
  const actualReference = {
    artifactId: binding.sourceIdentityVerificationArtifactId,
    artifactVersion: binding.sourceIdentityVerificationArtifactVersion,
    artifactSha256: binding.sourceIdentityVerificationArtifactSha256,
    decision: binding.sourceIdentityVerificationDecision,
  };
  if (
    canonicalSourceAnalysisJson(actualReference as JsonValue) !==
    canonicalSourceAnalysisJson(expectedReference as JsonValue)
  ) {
    fail(
      "source analysis does not reference the exact verified identity artifact",
    );
  }
  if (
    (requireSharedLifecycleSnapshot &&
      (binding.lifecycleRecordId !== identity.binding.lifecycleRecordId ||
        binding.lifecycleSnapshotSha256 !==
          identity.binding.lifecycleSnapshotSha256 ||
        binding.lifecycleSnapshotUpdatedAt !==
          identity.binding.lifecycleSnapshotUpdatedAt)) ||
    binding.sourceId !== identity.binding.sourceId ||
    binding.sourceId !== verified.sourceId ||
    binding.sourceCanonicalIdentity !== verified.canonicalIdentity ||
    binding.sourceMetadataSha256 !== identity.binding.sourceMetadataSha256 ||
    binding.sourceContentSha256 !== identity.binding.sourceContentSha256 ||
    binding.rawPdfSha256 !== identity.extractionBinding.rawContentSha256
  ) {
    fail(
      "source analysis identity reference has lifecycle, identity, metadata, content or raw-PDF drift",
    );
  }
  if (
    binding.extractionArtifactId !==
      identity.extractionBinding.extractionReceiptId ||
    binding.extractionArtifactVersion !==
      identity.extractionBinding.extractionReceiptVersion ||
    binding.extractionArtifactSha256 !==
      identity.extractionBinding.extractionReceiptSha256 ||
    binding.extractionTextManifestSha256 !==
      identity.extractionBinding.extractedTextManifestSha256 ||
    binding.pageMapSha256 !== identity.extractionBinding.pageMapSha256
  ) {
    fail("source analysis identity reference has extraction-binding drift");
  }
  return binding;
}

export function validateSourceAnalysisIdentityReference(
  binding: SourceAnalysisBinding,
  identityArtifact: SourceIdentityVerificationArtifact,
): SourceAnalysisBinding {
  return validateSourceAnalysisIdentityReferenceFields(
    binding,
    identityArtifact,
    true,
  );
}

export function validateSourceAnalysisIdentityVerificationBinding(
  analysisArtifact: SourceAnalysisArtifact,
  identityArtifact: SourceIdentityVerificationArtifact,
): SourceAnalysisArtifact {
  const analysis = validateSourceAnalysisArtifact(analysisArtifact);
  validateSourceAnalysisIdentityReference(analysis.binding, identityArtifact);
  return analysis;
}

export type SourceAnalysisArtifactFile = {
  path: string;
  bytes: Buffer | string;
};

export type SourceAnalysisNormalizedPageBytes = {
  pageNumber: number;
  bytes: Buffer | string;
};

export type SourceAnalysisExecutionEvidenceInputs = {
  workflowFile: SourceAnalysisArtifactFile;
  promptTemplateFile: SourceAnalysisArtifactFile;
  normalizedPages: readonly SourceAnalysisNormalizedPageBytes[];
};

export type ValidatedSourceAnalysisInputs = {
  artifact: SourceAnalysisArtifact;
  predecessorInputManifest: SourceAnalysisInputManifest;
  inputManifest: SourceAnalysisInputManifest;
  identityArtifact: SourceIdentityVerificationArtifact & {
    decision: Extract<
      SourceIdentityVerificationArtifact["decision"],
      { state: "verified" }
    >;
  };
  identityVerificationPrestate: CorpusLifecycleRecord;
  analysisPrestate: CorpusLifecycleRecord;
  predecessorInputManifestFileSha256: string;
  inputManifestFileSha256: string;
  identityArtifactFileSha256: string;
  workflowFileSha256: string;
  promptTemplateFileSha256: string;
  normalizedInputSha256: string;
  normalizedInputSerializedSizeBytes: number;
};

export type ValidatedSourceAnalysisAuthorization =
  ValidatedSourceAnalysisInputs;

function exactFileBytes(value: Buffer | string): Buffer {
  return typeof value === "string" ? Buffer.from(value, "utf8") : value;
}

function decodeExactUtf8(bytes: Buffer, label: string): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    fail(`${label} is not valid UTF-8`);
  }
}

function parseExactJsonFile(
  file: SourceAnalysisArtifactFile,
  label: string,
): unknown {
  const text = decodeExactUtf8(exactFileBytes(file.bytes), `${label} file`);
  try {
    return JSON.parse(text);
  } catch {
    fail(`${label} file is not valid JSON`);
  }
}

function validateExactSourceAnalysisWorkflowFile(
  artifact: SourceAnalysisArtifact,
  workflowFile: SourceAnalysisArtifactFile,
): string {
  if (workflowFile.path !== SOURCE_ANALYSIS_WORKFLOW_PATH) {
    fail(
      `source-analysis workflow path must be ${SOURCE_ANALYSIS_WORKFLOW_PATH}`,
    );
  }
  const workflowBytes = exactFileBytes(workflowFile.bytes);
  decodeExactUtf8(workflowBytes, "source-analysis workflow file");
  const workflowFileSha256 = sourceAnalysisSha256(workflowBytes);
  if (workflowFileSha256 !== SOURCE_ANALYSIS_WORKFLOW_FILE_SHA256) {
    fail("source-analysis workflow file bytes do not match the pinned hash");
  }
  for (const run of artifact.analysisExecution.runs) {
    if (
      run.workflowRef !== SOURCE_ANALYSIS_WORKFLOW_ID ||
      run.workflowVersion !== SOURCE_ANALYSIS_WORKFLOW_VERSION ||
      run.workflowPath !== SOURCE_ANALYSIS_WORKFLOW_PATH ||
      run.workflowFileSha256 !== workflowFileSha256
    ) {
      fail(
        `AI run ${run.runId} does not bind the exact canonical source-analysis workflow file`,
      );
    }
  }
  return workflowFileSha256;
}

export function validateSourceAnalysisWorkflowFile(
  artifactValue: unknown,
  workflowFile: SourceAnalysisArtifactFile,
): string {
  return validateExactSourceAnalysisWorkflowFile(
    validateSourceAnalysisArtifact(artifactValue),
    workflowFile,
  );
}

function validateExactSourceAnalysisPromptTemplateFile(
  artifact: SourceAnalysisArtifact,
  promptTemplateFile: SourceAnalysisArtifactFile,
): string {
  if (promptTemplateFile.path !== SOURCE_ANALYSIS_PROMPT_TEMPLATE_PATH) {
    fail(
      `source-analysis prompt template path must be ${SOURCE_ANALYSIS_PROMPT_TEMPLATE_PATH}`,
    );
  }
  const bytes = exactFileBytes(promptTemplateFile.bytes);
  decodeExactUtf8(bytes, "source-analysis prompt template file");
  const promptTemplateFileSha256 = sourceAnalysisSha256(bytes);
  if (
    promptTemplateFileSha256 !== SOURCE_ANALYSIS_PROMPT_TEMPLATE_FILE_SHA256
  ) {
    fail(
      "source-analysis prompt template file bytes do not match the pinned hash",
    );
  }
  for (const run of artifact.analysisExecution.runs) {
    if (
      run.promptTemplateRef !== SOURCE_ANALYSIS_PROMPT_TEMPLATE_ID ||
      run.promptTemplateVersion !== SOURCE_ANALYSIS_PROMPT_TEMPLATE_VERSION ||
      run.promptTemplatePath !== SOURCE_ANALYSIS_PROMPT_TEMPLATE_PATH ||
      run.promptTemplateFileSha256 !== promptTemplateFileSha256
    ) {
      fail(
        `AI run ${run.runId} does not bind the exact canonical source-analysis prompt template file`,
      );
    }
  }
  return promptTemplateFileSha256;
}

export function validateSourceAnalysisPromptTemplateFile(
  artifactValue: unknown,
  promptTemplateFile: SourceAnalysisArtifactFile,
): string {
  return validateExactSourceAnalysisPromptTemplateFile(
    validateSourceAnalysisArtifact(artifactValue),
    promptTemplateFile,
  );
}

export function validateSourceAnalysisNormalizedPageBytes(
  manifestValue: unknown,
  normalizedPages: readonly SourceAnalysisNormalizedPageBytes[],
): {
  normalizedInputSha256: string;
  serializedSizeBytes: number;
} {
  const manifest = verifySourceAnalysisInputManifest(manifestValue);
  if (normalizedPages.length !== manifest.pages.length) {
    fail(
      "normalized page byte inputs must contain every manifest page exactly once",
    );
  }

  const orderedBytes = manifest.pages.map((page, index) => {
    const supplied = normalizedPages[index];
    if (!supplied || supplied.pageNumber !== page.pageNumber) {
      fail(
        `normalized page byte inputs are missing or out of order at page ${page.pageNumber}`,
      );
    }
    const bytes = exactFileBytes(supplied.bytes);
    const text = decodeExactUtf8(
      bytes,
      `normalized page ${page.pageNumber} bytes`,
    );
    const observedSha256 = sourceAnalysisSha256(bytes).slice("sha256:".length);
    if (
      observedSha256 !== page.normalizedText.sha256 ||
      bytes.length !== page.normalizedText.sizeBytes ||
      countUnicodeCharacters(text) !== page.normalizedText.characterCount ||
      countUnicodeWords(text) !== page.normalizedText.wordCount
    ) {
      fail(
        `normalized page ${page.pageNumber} bytes, hash, character count or word count do not match the manifest`,
      );
    }
    return bytes;
  });

  const serialized = serializeNormalizedInput({
    pages: manifest.pages,
    normalizedPageBytes: orderedBytes,
  });
  if (
    serialized.sha256 !== manifest.normalizedInput.sha256 ||
    serialized.serializedSizeBytes !==
      manifest.normalizedInput.serializedSizeBytes
  ) {
    fail(
      "serialized normalized input bytes do not match the manifest hash and byte count",
    );
  }
  return {
    normalizedInputSha256: prefixedInputHash(serialized.sha256),
    serializedSizeBytes: serialized.serializedSizeBytes,
  };
}

function prefixedInputHash(value: string): string {
  return `sha256:${value}`;
}

function validateExactManifestLocators(
  artifact: SourceAnalysisArtifact,
  manifest: SourceAnalysisInputManifest,
): void {
  const expectedLocators: SourceAnalysisArtifact["locators"] =
    manifest.pages.map((page) => ({
      locatorId: `locator.page.${page.pageNumber}`,
      locatorType: "page",
      label: `PDF page ${page.pageNumber}`,
      pageStart: page.pageNumber,
      pageEnd: page.pageNumber,
      sectionPath: [],
      normalizedTextSha256: prefixedInputHash(page.normalizedText.sha256),
    }));
  if (
    canonicalSourceAnalysisJson(artifact.locators as JsonValue) !==
    canonicalSourceAnalysisJson(expectedLocators as JsonValue)
  ) {
    fail(
      "analysis locators do not exactly match every ordered manifest page and text-unit hash",
    );
  }
}

function stableManifestPromotionBinding(
  manifest: SourceAnalysisInputManifest,
): JsonValue {
  return {
    processingUnit: manifest.processingUnit,
    identityKeys: manifest.identityKeys,
    identityAssociation: {
      intendedLabel: manifest.identityAssociation.intendedLabel,
      observedDocumentTitle: manifest.identityAssociation.observedDocumentTitle,
    },
    sourceBinding: {
      title: manifest.sourceBinding.title,
      doi: manifest.sourceBinding.doi,
      ...("officialUrl" in manifest.sourceBinding
        ? { officialUrl: manifest.sourceBinding.officialUrl }
        : {
            controlledPrivateLocator:
              manifest.sourceBinding.controlledPrivateLocator,
          }),
      scopeDisposition: manifest.sourceBinding.scopeDisposition,
    },
    bindings: manifest.bindings,
    serialization: manifest.serialization,
    normalizedInput: manifest.normalizedInput,
    pages: manifest.pages,
    totals: manifest.totals,
    privateStorage: manifest.privateStorage,
    textIncludedInTrackedArtifact: manifest.textIncludedInTrackedArtifact,
    readiness: manifest.readiness,
  } as JsonValue;
}

function validateInputManifestPromotion(
  predecessor: SourceAnalysisInputManifest,
  promoted: SourceAnalysisInputManifest,
): void {
  if (
    predecessor.identityAssociation.state !== "provisional_metadata_match" ||
    predecessor.sourceBinding.corpusIdentityVerified !== false ||
    predecessor.workflowEligibility.state !==
      "identity_verification_candidate" ||
    predecessor.workflowEligibility.sourceAnalysis.allowed !== false
  ) {
    fail(
      "predecessor input manifest must be the exact provisional identity-verification candidate",
    );
  }
  if (
    canonicalSourceAnalysisJson(stableManifestPromotionBinding(predecessor)) !==
    canonicalSourceAnalysisJson(stableManifestPromotionBinding(promoted))
  ) {
    fail(
      "promoted input manifest changes source, content, extraction, text, scope or gate fields outside the identity transition",
    );
  }
}

function validateExactIdentityLifecycleTransition(input: {
  identityVerificationPrestate: CorpusLifecycleRecord;
  analysisPrestate: CorpusLifecycleRecord;
  identity: SourceIdentityVerificationArtifact & {
    decision: Extract<
      SourceIdentityVerificationArtifact["decision"],
      { state: "verified" }
    >;
  };
}): void {
  const { identityVerificationPrestate, analysisPrestate, identity } = input;
  if (
    identityVerificationPrestate.sourceIdentity.identityStatus !==
      "provisional" ||
    analysisPrestate.sourceIdentity.identityStatus !== "verified"
  ) {
    fail(
      "lifecycle transition must advance one provisional identity prestate to one verified analysis prestate",
    );
  }
  if (
    Date.parse(analysisPrestate.updatedAt) < Date.parse(identity.createdAt) ||
    Date.parse(analysisPrestate.updatedAt) <
      Date.parse(identityVerificationPrestate.updatedAt)
  ) {
    fail(
      "verified analysis prestate cannot predate the identity artifact or identity-verification prestate",
    );
  }

  const expectedAnalysisPrestate = structuredClone(
    identityVerificationPrestate,
  );
  expectedAnalysisPrestate.sourceIdentity.identityStatus = "verified";
  expectedAnalysisPrestate.sourceIdentity.identityKind =
    identity.candidateIdentity.identityKind;
  expectedAnalysisPrestate.sourceIdentity.canonicalIdentity =
    identity.decision.verifiedIdentity.canonicalIdentity;
  expectedAnalysisPrestate.updatedAt = analysisPrestate.updatedAt;

  if (
    canonicalSourceAnalysisJson(
      expectedAnalysisPrestate as unknown as JsonValue,
    ) !== canonicalSourceAnalysisJson(analysisPrestate as unknown as JsonValue)
  ) {
    fail(
      "analysis prestate contains changes outside the exact verified-identity lifecycle transition",
    );
  }
}

/**
 * Decision-only replay helper. This is safe only after the same complete
 * deterministic replay has already accepted the exact identity artifact
 * through an `identity_verified` event and its full evidence bundle. It does
 * not establish standalone authorization for source analysis. It still
 * validates the exact workflow file, prompt-template file and every ordered
 * normalized page byte used by the analysis execution.
 */
export function validateSourceAnalysisArtifactAfterReplayVerifiedIdentity(
  artifactValue: unknown,
  inputs: {
    predecessorInputManifestFile: SourceAnalysisArtifactFile;
    inputManifestFile: SourceAnalysisArtifactFile;
    identityArtifactFile: SourceAnalysisArtifactFile;
    identityVerificationPrestate: unknown;
    analysisPrestate: unknown;
  } & SourceAnalysisExecutionEvidenceInputs,
): ValidatedSourceAnalysisInputs {
  const artifact = validateSourceAnalysisArtifact(artifactValue);
  if (
    !repositoryPathSchema.safeParse(inputs.predecessorInputManifestFile.path)
      .success ||
    !repositoryPathSchema.safeParse(inputs.inputManifestFile.path).success ||
    !repositoryPathSchema.safeParse(inputs.identityArtifactFile.path).success
  ) {
    fail(
      "combined input file paths must be portable repository-relative paths",
    );
  }

  const predecessorManifestBytes = exactFileBytes(
    inputs.predecessorInputManifestFile.bytes,
  );
  const predecessorManifest = verifySourceAnalysisInputManifest(
    parseExactJsonFile(
      inputs.predecessorInputManifestFile,
      "predecessor source-analysis input manifest",
    ),
  );
  const predecessorManifestFileSha256 = sourceAnalysisSha256(
    predecessorManifestBytes,
  );
  const manifestBytes = exactFileBytes(inputs.inputManifestFile.bytes);
  const manifest = verifySourceAnalysisInputManifest(
    parseExactJsonFile(
      inputs.inputManifestFile,
      "source-analysis input manifest",
    ),
  );
  const manifestFileSha256 = sourceAnalysisSha256(manifestBytes);
  const identityBytes = exactFileBytes(inputs.identityArtifactFile.bytes);
  const identity = requireVerifiedSourceIdentity(
    parseExactJsonFile(
      inputs.identityArtifactFile,
      "source-identity artifact",
    ) as SourceIdentityVerificationArtifact,
  );
  const identityFileSha256 = sourceAnalysisSha256(identityBytes);
  const identityVerificationPrestate = validateCorpusLifecycle(
    inputs.identityVerificationPrestate,
  );
  const identityVerificationPrestateSha256 = hashCorpusLifecycleState(
    identityVerificationPrestate,
  );
  const analysisPrestate = validateCorpusLifecycle(inputs.analysisPrestate);
  const analysisPrestateSha256 = hashCorpusLifecycleState(analysisPrestate);

  if (
    artifact.binding.sourceAnalysisInputManifestPath !==
      inputs.inputManifestFile.path ||
    artifact.binding.sourceAnalysisInputManifestFileSha256 !==
      manifestFileSha256 ||
    artifact.binding.sourceAnalysisInputManifestSchemaVersion !==
      manifest.schemaVersion ||
    artifact.binding.sourceAnalysisInputManifestPipelineVersion !==
      manifest.pipelineVersion ||
    artifact.binding.sourceAnalysisInputManifestSha256 !==
      prefixedInputHash(manifest.manifestSha256)
  ) {
    fail(
      "source analysis does not reference the exact manifest path, file hash, version and seal",
    );
  }
  if (
    manifest.workflowEligibility.state !== "source_analysis_eligible" ||
    manifest.workflowEligibility.sourceAnalysis.allowed !== true
  ) {
    fail(
      "workflowEligibility.sourceAnalysis.allowed must be true after combined identity validation",
    );
  }
  if (
    manifest.identityAssociation.state !== "verified_identity_match" ||
    manifest.sourceBinding.corpusIdentityVerified !== true
  ) {
    fail(
      "source-analysis eligibility requires a verified identity association and source binding",
    );
  }

  const eligibility = manifest.workflowEligibility.sourceAnalysis;
  const predecessorReference = eligibility.predecessorInputManifestReference;
  if (
    inputs.predecessorInputManifestFile.path ===
      inputs.inputManifestFile.path ||
    predecessorReference.path !== inputs.predecessorInputManifestFile.path ||
    predecessorReference.fileSha256 !==
      predecessorManifestFileSha256.slice("sha256:".length) ||
    predecessorReference.schemaVersion !== predecessorManifest.schemaVersion ||
    predecessorReference.pipelineVersion !==
      predecessorManifest.pipelineVersion ||
    predecessorReference.manifestSha256 !== predecessorManifest.manifestSha256
  ) {
    fail(
      "promoted manifest does not reference the exact predecessor manifest path, file hash, version and seal",
    );
  }
  validateInputManifestPromotion(predecessorManifest, manifest);

  const identityReference = eligibility.identityArtifactReference;
  const identityFileSha256Raw = identityFileSha256.slice("sha256:".length);
  if (
    identityReference.path !== inputs.identityArtifactFile.path ||
    identityReference.fileSha256 !== identityFileSha256Raw ||
    identityReference.artifactId !== identity.artifactId ||
    identityReference.artifactVersion !== identity.artifactVersion ||
    identityReference.artifactSha256 !== identity.artifactSha256 ||
    identityReference.decision !== identity.decision.state
  ) {
    fail(
      "manifest eligibility does not reference the exact validated identity artifact file and seal",
    );
  }
  if (
    artifact.binding.sourceIdentityVerificationArtifactPath !==
      inputs.identityArtifactFile.path ||
    artifact.binding.sourceIdentityVerificationArtifactFileSha256 !==
      identityFileSha256
  ) {
    fail(
      "source analysis does not bind the exact source-identity artifact path and file hash",
    );
  }
  validateSourceAnalysisIdentityReferenceFields(
    artifact.binding,
    identity,
    false,
  );

  const identityLifecycleReference =
    eligibility.lifecycleTransition.identityVerificationPrestate;
  const analysisLifecycleReference =
    eligibility.lifecycleTransition.analysisPrestate;
  if (
    identityLifecycleReference.sourceIdentityStatus !== "provisional" ||
    identityLifecycleReference.lifecycleRecordId !==
      identityVerificationPrestate.recordId ||
    identityLifecycleReference.lifecycleSnapshotSha256 !==
      identityVerificationPrestateSha256 ||
    identityLifecycleReference.lifecycleSnapshotUpdatedAt !==
      identityVerificationPrestate.updatedAt ||
    identity.binding.lifecycleRecordId !==
      identityVerificationPrestate.recordId ||
    identity.binding.lifecycleSnapshotSha256 !==
      identityVerificationPrestateSha256 ||
    identity.binding.lifecycleSnapshotUpdatedAt !==
      identityVerificationPrestate.updatedAt
  ) {
    fail(
      "manifest and identity artifact do not bind the exact identity-verification lifecycle prestate",
    );
  }
  if (
    analysisLifecycleReference.sourceIdentityStatus !== "verified" ||
    analysisLifecycleReference.lifecycleRecordId !==
      analysisPrestate.recordId ||
    analysisLifecycleReference.lifecycleSnapshotSha256 !==
      analysisPrestateSha256 ||
    analysisLifecycleReference.lifecycleSnapshotUpdatedAt !==
      analysisPrestate.updatedAt ||
    artifact.binding.lifecycleRecordId !== analysisPrestate.recordId ||
    artifact.binding.lifecycleSnapshotSha256 !== analysisPrestateSha256 ||
    artifact.binding.lifecycleSnapshotUpdatedAt !== analysisPrestate.updatedAt
  ) {
    fail(
      "manifest and source analysis do not bind the exact verified analysis lifecycle prestate",
    );
  }
  validateExactIdentityLifecycleTransition({
    identityVerificationPrestate,
    analysisPrestate,
    identity,
  });
  if (
    canonicalSourceAnalysisJson({
      geographyIds: artifact.scope.geographyIds,
      materialProfileIds: artifact.scope.materialProfileIds,
      intendedUseProfileIds: artifact.scope.intendedUseProfileIds,
    }) !==
    canonicalSourceAnalysisJson({
      geographyIds: analysisPrestate.scope.geographyIds,
      materialProfileIds: analysisPrestate.scope.materialProfileIds,
      intendedUseProfileIds: analysisPrestate.scope.intendedUseProfileIds,
    })
  ) {
    fail(
      "source-analysis scope does not exactly match the verified analysis lifecycle prestate",
    );
  }

  const verifiedIdentity = identity.decision.verifiedIdentity;
  if (
    manifest.identityAssociation.sourceId !== identity.binding.sourceId ||
    manifest.identityAssociation.sourceId !== verifiedIdentity.sourceId ||
    manifest.identityAssociation.canonicalIdentity !==
      verifiedIdentity.canonicalIdentity ||
    !manifest.identityKeys.includes(verifiedIdentity.canonicalIdentity) ||
    manifest.identityAssociation.observedDocumentTitle !==
      identity.observedMetadata.title ||
    manifest.sourceBinding.title !==
      identity.candidateIdentity.candidateTitle ||
    artifact.binding.sourceTitle !==
      identity.candidateIdentity.candidateTitle ||
    identityVerificationPrestate.sourceIdentity.sourceId !==
      verifiedIdentity.sourceId ||
    analysisPrestate.sourceIdentity.sourceId !== verifiedIdentity.sourceId ||
    identityVerificationPrestate.sourceIdentity.canonicalIdentity !==
      verifiedIdentity.canonicalIdentity ||
    analysisPrestate.sourceIdentity.canonicalIdentity !==
      verifiedIdentity.canonicalIdentity ||
    identityVerificationPrestate.sourceIdentity.title !==
      identity.candidateIdentity.candidateTitle ||
    analysisPrestate.sourceIdentity.title !==
      identity.candidateIdentity.candidateTitle ||
    identityVerificationPrestate.sourceIdentity.metadataSha256 !==
      identity.binding.sourceMetadataSha256 ||
    analysisPrestate.sourceIdentity.metadataSha256 !==
      identity.binding.sourceMetadataSha256 ||
    identityVerificationPrestate.sourceIdentity.contentSha256 !==
      identity.binding.sourceContentSha256 ||
    analysisPrestate.sourceIdentity.contentSha256 !==
      identity.binding.sourceContentSha256
  ) {
    fail(
      "source, title, canonical identity, metadata or content drift across combined inputs",
    );
  }
  const candidateLocator = identity.candidateIdentity.candidateLocator;
  const manifestLocatorMatches =
    candidateLocator.kind === "official_url"
      ? "officialUrl" in manifest.sourceBinding &&
        candidateLocator.url === manifest.sourceBinding.officialUrl
      : "controlledPrivateLocator" in manifest.sourceBinding &&
        candidateLocator.locator ===
          manifest.sourceBinding.controlledPrivateLocator;
  if (!manifestLocatorMatches) {
    fail(
      "manifest source locator does not match the exact verified identity candidate locator",
    );
  }

  const rawPdfSha256 = prefixedInputHash(manifest.processingUnit.rawPdfSha256);
  const normalizedInputSha256 = prefixedInputHash(
    manifest.normalizedInput.sha256,
  );
  if (
    artifact.binding.rawPdfSha256 !== rawPdfSha256 ||
    artifact.binding.sourceContentSha256 !== rawPdfSha256 ||
    identity.extractionBinding.rawContentSha256 !== rawPdfSha256 ||
    artifact.binding.textSha256 !== normalizedInputSha256 ||
    artifact.binding.extractionTextManifestSha256 !== normalizedInputSha256 ||
    identity.extractionBinding.extractedTextManifestSha256 !==
      normalizedInputSha256 ||
    identityVerificationPrestate.textAvailability.textSha256 !==
      normalizedInputSha256 ||
    analysisPrestate.textAvailability.textSha256 !== normalizedInputSha256 ||
    identityVerificationPrestate.textAvailability.state !==
      artifact.binding.textAvailabilityState ||
    analysisPrestate.textAvailability.state !==
      artifact.binding.textAvailabilityState
  ) {
    fail(
      "raw PDF or normalized full-text hash drifts across manifest, identity, lifecycle and analysis",
    );
  }

  if (
    artifact.binding.extractionArtifactPath !==
      manifest.bindings.extractionReceipt.path ||
    artifact.binding.extractionArtifactFileSha256 !==
      prefixedInputHash(manifest.bindings.extractionReceipt.fileSha256) ||
    artifact.binding.extractionArtifactSha256 !==
      prefixedInputHash(manifest.bindings.extractionReceipt.receiptSha256) ||
    identity.extractionBinding.extractionReceiptSha256 !==
      prefixedInputHash(manifest.bindings.extractionReceipt.receiptSha256) ||
    artifact.binding.pageMapPath !== manifest.bindings.pageMap.path ||
    artifact.binding.pageMapFileSha256 !==
      prefixedInputHash(manifest.bindings.pageMap.fileSha256) ||
    artifact.binding.pageMapSha256 !==
      prefixedInputHash(manifest.bindings.pageMap.pageMapSha256) ||
    identity.extractionBinding.pageMapSha256 !==
      prefixedInputHash(manifest.bindings.pageMap.pageMapSha256)
  ) {
    fail(
      "extraction receipt or page-map path, file hash or internal seal drift",
    );
  }
  if (
    identity.extractionBinding.expectedPageCount !==
      manifest.totals.pageCount ||
    identity.extractionBinding.mappedPageCount !== manifest.totals.pageCount ||
    artifact.actualFullTextReading.expectedUnitCount !==
      manifest.totals.pageCount ||
    artifact.actualFullTextReading.readUnitCount !== manifest.totals.pageCount
  ) {
    fail(
      "ordered page count drifts across manifest, identity and actual reading",
    );
  }
  validateExactManifestLocators(artifact, manifest);

  if (
    Date.parse(artifact.analysisExecution.runs[0]!.startedAt) <
    Date.parse(identity.createdAt)
  ) {
    fail(
      "source analysis cannot start before its verified identity artifact exists",
    );
  }
  const workflowFileSha256 = validateExactSourceAnalysisWorkflowFile(
    artifact,
    inputs.workflowFile,
  );
  const promptTemplateFileSha256 =
    validateExactSourceAnalysisPromptTemplateFile(
      artifact,
      inputs.promptTemplateFile,
    );
  const normalizedInput = validateSourceAnalysisNormalizedPageBytes(
    manifest,
    inputs.normalizedPages,
  );
  if (normalizedInput.normalizedInputSha256 !== artifact.binding.textSha256) {
    fail("exact normalized page bytes do not match the analysis text binding");
  }
  return {
    artifact,
    predecessorInputManifest: predecessorManifest,
    inputManifest: manifest,
    identityArtifact: identity,
    identityVerificationPrestate,
    analysisPrestate,
    predecessorInputManifestFileSha256: predecessorManifestFileSha256,
    inputManifestFileSha256: manifestFileSha256,
    identityArtifactFileSha256: identityFileSha256,
    workflowFileSha256,
    promptTemplateFileSha256,
    normalizedInputSha256: normalizedInput.normalizedInputSha256,
    normalizedInputSerializedSizeBytes: normalizedInput.serializedSizeBytes,
  };
}

/**
 * Standalone authorization boundary for source analysis. It validates the
 * complete identity evidence bundle and requires that bundle to contain the
 * exact immutable predecessor manifest used by the analysis. It delegates the
 * workflow, prompt-template and normalized-page byte checks to the same replay
 * boundary used after an accepted `identity_verified` event.
 */
export function validateSourceAnalysisArtifactWithEvidenceBundle(
  artifactValue: unknown,
  inputs: {
    predecessorInputManifestFile: SourceAnalysisArtifactFile;
    inputManifestFile: SourceAnalysisArtifactFile;
    identityArtifactFile: SourceAnalysisArtifactFile;
    identityVerificationPrestate: unknown;
    analysisPrestate: unknown;
    identityEvidenceBundle: SourceIdentityVerificationEvidenceBundle;
  } & SourceAnalysisExecutionEvidenceInputs,
): ValidatedSourceAnalysisAuthorization {
  const predecessorBytes = exactFileBytes(
    inputs.predecessorInputManifestFile.bytes,
  );
  const evidenceCandidateBytes = exactFileBytes(
    inputs.identityEvidenceBundle.sourceAnalysisInputManifestFile.bytes,
  );
  if (
    inputs.identityEvidenceBundle.sourceAnalysisInputManifestFile.path !==
      inputs.predecessorInputManifestFile.path ||
    !evidenceCandidateBytes.equals(predecessorBytes)
  ) {
    fail(
      "identity evidence bundle does not contain the exact predecessor input manifest",
    );
  }
  const verifiedIdentity = requireVerifiedSourceIdentityWithEvidenceBundle(
    parseExactJsonFile(inputs.identityArtifactFile, "source-identity artifact"),
    inputs.identityEvidenceBundle,
  ).identity;
  if (
    inputs.identityArtifactFile.path !==
    sourceIdentityVerificationArtifactPath(verifiedIdentity.artifactSha256)
  ) {
    fail(
      "identity artifact file must use the content-addressed repository path derived from its validated artifact seal",
    );
  }
  return validateSourceAnalysisArtifactAfterReplayVerifiedIdentity(
    artifactValue,
    inputs,
  );
}

export function sealSourceAnalysisArtifact(
  value: Omit<SourceAnalysisArtifact, "artifactSha256">,
): SourceAnalysisArtifact {
  const artifactSha256 = sourceAnalysisSha256(
    canonicalSourceAnalysisJson(value as JsonValue),
  );
  return validateSourceAnalysisArtifact({ ...value, artifactSha256 });
}
