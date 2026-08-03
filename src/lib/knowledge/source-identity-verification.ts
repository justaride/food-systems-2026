import { createHash } from "node:crypto";
import { TextDecoder } from "node:util";

import { z } from "zod";

import {
  sourceAcquisitionContent,
  validateSourceAcquisitionReceipt,
  type SourceAcquisitionReceipt,
} from "./source-acquisition-receipt";

export const SOURCE_IDENTITY_VERIFICATION_SCHEMA_VERSION =
  "source-identity-verification-v1" as const;
export const SOURCE_IDENTITY_VERIFICATION_ARTIFACT_VERSION = "1.0.0" as const;
export const MODEL_VERSION_NOT_EXPOSED = "runtime_not_exposed" as const;

const HASH_PATTERN = /^sha256:[a-f0-9]{64}$/;
const IDENTIFIER_PATTERN = /^[a-z0-9][a-z0-9._:-]*$/;
const VERSION_PATTERN = /^\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DATE_TIME_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/;
const ACQUISITION_RECEIPT_PATH_PATTERN =
  /^knowledge\/corpus\/source-acquisition-receipts\/receipts\/[a-z0-9][a-z0-9._-]*\.json$/;

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
const mediumTextSchema = z.string().min(10).max(1_600);

const continuitySchema = z
  .object({
    kind: z.enum(["initial", "revision"]),
    predecessorArtifactId: identifierSchema.nullable(),
    predecessorArtifactVersion: versionSchema.nullable(),
    predecessorArtifactSha256: sha256Schema.nullable(),
    changeSummary: z.string().min(10).max(800).nullable(),
  })
  .strict();

const lifecycleBindingSchema = z
  .object({
    lifecycleRecordId: identifierSchema,
    lifecycleSnapshotSha256: sha256Schema,
    lifecycleSnapshotUpdatedAt: dateTimeSchema,
    sourceId: identifierSchema,
    sourceMetadataSha256: sha256Schema,
    sourceContentSha256: sha256Schema,
    lifecycleSourceIdentityStatus: z.literal("provisional"),
  })
  .strict();

const candidateLocatorSchema = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("official_url"),
      url: z.string().url().startsWith("https://"),
    })
    .strict(),
  z
    .object({
      kind: z.literal("controlled_private_locator"),
      locator: z.string().regex(/^private:\/\/[a-z0-9][a-z0-9._:/-]*$/),
    })
    .strict(),
]);

const candidateIdentitySchema = z
  .object({
    identityKind: z.enum([
      "url",
      "doi",
      "isbn",
      "repository_path",
      "database_record",
      "generated_artifact",
      "other",
    ]),
    canonicalIdentity: z.string().min(1).max(2_000),
    candidateLocator: candidateLocatorSchema,
    candidateTitle: z.string().min(1).max(500),
    candidatePublisher: z.string().min(1).max(500).nullable(),
    candidatePublicationDate: z.string().min(1).max(100).nullable(),
    candidateLanguageCodes: z.array(identifierSchema),
    status: z.literal("provisional"),
  })
  .strict();

const extractionBindingSchema = z
  .object({
    extractionReceiptId: identifierSchema,
    extractionReceiptVersion: versionSchema,
    extractionReceiptSha256: sha256Schema,
    pageMapId: identifierSchema,
    pageMapVersion: versionSchema,
    pageMapSha256: sha256Schema,
    rawContentSha256: sha256Schema,
    rawContentSizeBytes: z.number().int().positive(),
    extractedTextManifestSha256: sha256Schema,
    expectedPageCount: z.number().int().positive(),
    mappedPageCount: z.number().int().positive(),
    pageSequenceComplete: z.literal(true),
  })
  .strict();

const acquisitionReceiptReferenceSchema = z
  .object({
    receiptId: identifierSchema,
    receiptVersion: versionSchema,
    receiptType: z.enum([
      "controlled_https_fetch",
      "controlled_private_access",
    ]),
    receiptPath: z.string().regex(ACQUISITION_RECEIPT_PATH_PATTERN),
    receiptFileSha256: sha256Schema,
    receiptSha256: sha256Schema,
  })
  .strict();

const acquisitionProvenanceBoundarySchema = z
  .object({
    state: z.literal("receipt_reference_only"),
    combinedReceiptValidationRequired: z.literal(true),
    standaloneValidationEstablishesProvenance: z.literal(false),
  })
  .strict();

const optionalObservedTextSchema = z.discriminatedUnion("state", [
  z
    .object({
      state: z.literal("observed"),
      value: z.string().min(1).max(500),
    })
    .strict(),
  z
    .object({
      state: z.literal("not_stated"),
      value: z.null(),
    })
    .strict(),
]);

const observedPublicationDateSchema = z.discriminatedUnion("state", [
  z
    .object({
      state: z.literal("observed"),
      sourceValue: z.string().min(1).max(100),
      normalizedDate: dateSchema.nullable(),
      normalizedYear: z.number().int().min(1_000).max(3_000),
    })
    .strict(),
  z
    .object({
      state: z.literal("not_stated"),
      sourceValue: z.null(),
      normalizedDate: z.null(),
      normalizedYear: z.null(),
    })
    .strict(),
]);

const observedMetadataSchema = z
  .object({
    title: z.string().min(1).max(500),
    publisher: optionalObservedTextSchema,
    publicationDate: observedPublicationDateSchema,
    languageCodes: z.array(identifierSchema).min(1),
    languageObservationMethod: z.enum([
      "document_declared",
      "catalog_metadata",
      "deterministic_detection",
      "ai_assisted",
    ]),
  })
  .strict();

const canonicalLocatorEvidenceSchema = z.discriminatedUnion("kind", [
  z
    .object({
      kind: z.literal("official_url"),
      locatorId: identifierSchema,
      url: z.string().url().startsWith("https://"),
      accessState: z.enum(["reachable", "redirected"]),
      accessObservedAt: dateTimeSchema,
      evidenceSha256: sha256Schema,
    })
    .strict(),
  z
    .object({
      kind: z.literal("controlled_private_locator"),
      locatorId: identifierSchema,
      locator: z.string().regex(/^private:\/\/[a-z0-9][a-z0-9._:/-]*$/),
      accessClass: z.literal("controlled_private"),
      accessVerifiedAt: dateTimeSchema,
      manifestSha256: sha256Schema,
      evidenceSha256: sha256Schema,
    })
    .strict(),
]);

const evidenceAnchorSchema = z
  .object({
    anchorId: identifierSchema,
    evidenceType: z.enum([
      "pdf_metadata",
      "cover_page",
      "bibliographic_page",
      "official_landing_page",
      "repository_record",
      "private_manifest",
      "source_acquisition_receipt",
      "extraction_receipt",
      "page_map",
      "source_analysis_input_manifest",
    ]),
    locator: z.string().min(1).max(2_000),
    evidenceSha256: sha256Schema,
    observedAt: dateTimeSchema,
  })
  .strict();

export const SOURCE_IDENTITY_MATCH_DIMENSIONS = [
  "title",
  "publisher",
  "publication_date",
  "language",
  "canonical_locator",
  "content_hash",
  "extraction_binding",
] as const;

const matchDimensionSchema = z
  .object({
    dimension: z.enum(SOURCE_IDENTITY_MATCH_DIMENSIONS),
    expectedValue: z.string().min(1).max(2_000).nullable(),
    observedValue: z.string().min(1).max(2_000).nullable(),
    matchState: z.enum([
      "exact_match",
      "normalized_match",
      "source_not_stated",
      "candidate_not_stated",
      "mismatch",
    ]),
    normalizationStatement: z.string().min(10).max(800).nullable(),
    discrepancyIds: z.array(identifierSchema),
    evidenceAnchorIds: z.array(identifierSchema).min(1),
  })
  .strict();

const discrepancySchema = z
  .object({
    discrepancyId: identifierSchema,
    dimension: z.enum(SOURCE_IDENTITY_MATCH_DIMENSIONS),
    severity: z.enum(["non_blocking", "blocking"]),
    status: z.enum(["open", "accepted_for_identity"]),
    statement: mediumTextSchema,
    expectedValue: z.string().min(1).max(2_000).nullable(),
    observedValue: z.string().min(1).max(2_000).nullable(),
    evidenceAnchorIds: z.array(identifierSchema).min(1),
  })
  .strict();

const verifiedDecisionSchema = z
  .object({
    state: z.literal("verified"),
    identityPromotionAllowed: z.literal(true),
    blockingDiscrepancyCount: z.literal(0),
    reason: mediumTextSchema,
    decidedAt: dateTimeSchema,
    verifiedIdentity: z
      .object({
        sourceId: identifierSchema,
        canonicalIdentity: z.string().min(1).max(2_000),
        verifiedAt: dateTimeSchema,
      })
      .strict(),
    nextActions: z.array(z.never()).length(0),
  })
  .strict();

const provisionalDecisionSchema = z
  .object({
    state: z.literal("provisional"),
    identityPromotionAllowed: z.literal(false),
    blockingDiscrepancyCount: z.number().int().nonnegative(),
    reason: mediumTextSchema,
    decidedAt: dateTimeSchema,
    verifiedIdentity: z.null(),
    nextActions: z.array(mediumTextSchema).min(1),
  })
  .strict();

const rejectedDecisionSchema = z
  .object({
    state: z.literal("rejected"),
    identityPromotionAllowed: z.literal(false),
    blockingDiscrepancyCount: z.number().int().positive(),
    reason: mediumTextSchema,
    decidedAt: dateTimeSchema,
    verifiedIdentity: z.null(),
    nextActions: z.array(mediumTextSchema).min(1),
  })
  .strict();

const identityDecisionSchema = z.discriminatedUnion("state", [
  verifiedDecisionSchema,
  provisionalDecisionSchema,
  rejectedDecisionSchema,
]);

const downstreamBoundariesSchema = z
  .object({
    sourceRoleOwnerConfirmed: z.literal(false),
    ownerReviewComplete: z.literal(false),
    independentExpertValidationComplete: z.literal(false),
    partnerValidationComplete: z.literal(false),
    rightsHolderValidationComplete: z.literal(false),
    rightsCleared: z.literal(false),
    publicationReady: z.literal(false),
    coveragePromotionAllowed: z.literal(false),
  })
  .strict();

const aiRunCore = {
  runId: identifierSchema,
  stages: z
    .array(
      z.enum([
        "metadata_observation",
        "locator_assessment",
        "identity_match",
        "decision",
      ]),
    )
    .min(1),
  provider: z.string().min(1).max(200),
  model: z.string().min(1).max(200),
  workflowRef: z.string().min(1).max(500),
  workflowVersion: versionSchema,
  promptTemplateSha256: sha256Schema,
  lifecycleSnapshotSha256: sha256Schema,
  sourceMetadataSha256: sha256Schema,
  sourceContentSha256: sha256Schema,
  acquisitionReceiptSha256: sha256Schema,
  extractionReceiptSha256: sha256Schema,
  pageMapSha256: sha256Schema,
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
        (value) => value !== MODEL_VERSION_NOT_EXPOSED,
        "Exact model version cannot use the runtime_not_exposed sentinel",
      ),
  })
  .strict();

const runtimeVersionNotExposedAiRunSchema = z
  .object({
    ...aiRunCore,
    modelVersionState: z.literal("runtime_not_exposed"),
    modelVersion: z.literal(MODEL_VERSION_NOT_EXPOSED),
  })
  .strict();

const aiRunSchema = z.discriminatedUnion("modelVersionState", [
  exactModelVersionAiRunSchema,
  runtimeVersionNotExposedAiRunSchema,
]);

const aiExecutionSchema = z
  .object({
    executionMode: z.literal("ai_assisted"),
    runs: z.array(aiRunSchema).min(1),
    finalOutputSha256: sha256Schema,
  })
  .strict();

export const sourceIdentityVerificationStructuralSchema = z
  .object({
    schemaVersion: z.literal(SOURCE_IDENTITY_VERIFICATION_SCHEMA_VERSION),
    artifactType: z.literal("source_identity_verification"),
    artifactId: identifierSchema,
    artifactVersion: versionSchema,
    lineageId: identifierSchema,
    continuity: continuitySchema,
    binding: lifecycleBindingSchema,
    candidateIdentity: candidateIdentitySchema,
    acquisitionReceipt: acquisitionReceiptReferenceSchema,
    acquisitionProvenanceBoundary: acquisitionProvenanceBoundarySchema,
    extractionBinding: extractionBindingSchema,
    observedMetadata: observedMetadataSchema,
    canonicalLocatorEvidence: canonicalLocatorEvidenceSchema,
    evidenceAnchors: z.array(evidenceAnchorSchema).min(1),
    matchDimensions: z
      .array(matchDimensionSchema)
      .length(SOURCE_IDENTITY_MATCH_DIMENSIONS.length),
    discrepancies: z.array(discrepancySchema),
    decision: identityDecisionSchema,
    downstreamBoundaries: downstreamBoundariesSchema,
    aiExecution: aiExecutionSchema,
    verificationPayloadSha256: sha256Schema,
    createdAt: dateTimeSchema,
    artifactSha256: sha256Schema,
  })
  .strict();

export type SourceIdentityVerificationArtifact = z.infer<
  typeof sourceIdentityVerificationStructuralSchema
>;
export type SourceIdentityVerificationBinding =
  SourceIdentityVerificationArtifact["binding"];
export type SourceIdentityVerificationPayload = Pick<
  SourceIdentityVerificationArtifact,
  | "observedMetadata"
  | "canonicalLocatorEvidence"
  | "evidenceAnchors"
  | "matchDimensions"
  | "discrepancies"
  | "decision"
  | "downstreamBoundaries"
>;

export type SourceIdentityJsonValue =
  | null
  | boolean
  | number
  | string
  | SourceIdentityJsonValue[]
  | { [key: string]: SourceIdentityJsonValue };

function fail(message: string): never {
  throw new Error(`Source-identity verification failed: ${message}`);
}

export function canonicalSourceIdentityJson(
  value: SourceIdentityJsonValue,
): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalSourceIdentityJson(item)).join(",")}]`;
  }
  return `{${Object.keys(value)
    .sort()
    .map(
      (key) =>
        `${JSON.stringify(key)}:${canonicalSourceIdentityJson(value[key] as SourceIdentityJsonValue)}`,
    )
    .join(",")}}`;
}

export function sourceIdentitySha256(value: string | Buffer): string {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

export function hashSourceIdentityVerificationPayload(
  payload: SourceIdentityVerificationPayload,
): string {
  return sourceIdentitySha256(
    canonicalSourceIdentityJson(payload as SourceIdentityJsonValue),
  );
}

function assertUnique(values: string[], label: string): void {
  if (new Set(values).size !== values.length) fail(`${label} must be unique`);
}

function validateContinuity(
  artifact: SourceIdentityVerificationArtifact,
): void {
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
      fail("initial artifact cannot name a predecessor or change summary");
    }
    return;
  }
  if (
    predecessorValues.some((value) => value === null) ||
    continuity.changeSummary === null
  ) {
    fail(
      "revision requires exact predecessor ID, version, hash and change summary",
    );
  }
  if (continuity.predecessorArtifactVersion === artifact.artifactVersion) {
    fail("revision predecessor version must differ from the current version");
  }
}

function validateBindings(artifact: SourceIdentityVerificationArtifact): void {
  if (
    artifact.extractionBinding.rawContentSha256 !==
    artifact.binding.sourceContentSha256
  ) {
    fail(
      "extraction raw-content hash must match the exact lifecycle source-content hash",
    );
  }
  if (
    artifact.extractionBinding.expectedPageCount !==
    artifact.extractionBinding.mappedPageCount
  ) {
    fail("page map must represent every expected page");
  }
  const expectedReceiptType =
    artifact.candidateIdentity.candidateLocator.kind === "official_url"
      ? "controlled_https_fetch"
      : "controlled_private_access";
  if (artifact.acquisitionReceipt.receiptType !== expectedReceiptType) {
    fail("acquisition receipt type must match the candidate locator type");
  }
  if (
    artifact.candidateIdentity.candidateLocator.kind !==
    artifact.canonicalLocatorEvidence.kind
  ) {
    fail(
      "candidate and observed locator evidence must use the same locator type",
    );
  }
  if (
    artifact.canonicalLocatorEvidence.evidenceSha256 !==
    artifact.acquisitionReceipt.receiptSha256
  ) {
    fail(
      "canonical locator evidence must bind the referenced acquisition receipt seal",
    );
  }
  assertUnique(
    artifact.candidateIdentity.candidateLanguageCodes,
    "candidate language codes",
  );
  assertUnique(
    artifact.observedMetadata.languageCodes,
    "observed language codes",
  );
}

function validateMatchDimension(
  dimension: SourceIdentityVerificationArtifact["matchDimensions"][number],
): void {
  assertUnique(
    dimension.discrepancyIds,
    `${dimension.dimension} discrepancy IDs`,
  );
  assertUnique(
    dimension.evidenceAnchorIds,
    `${dimension.dimension} evidence-anchor IDs`,
  );
  if (dimension.matchState === "exact_match") {
    if (
      dimension.expectedValue === null ||
      dimension.observedValue === null ||
      dimension.expectedValue !== dimension.observedValue ||
      dimension.normalizationStatement !== null ||
      dimension.discrepancyIds.length !== 0
    ) {
      fail(
        `${dimension.dimension} exact match must bind identical non-null values without drift`,
      );
    }
  } else if (dimension.matchState === "normalized_match") {
    if (
      dimension.expectedValue === null ||
      dimension.observedValue === null ||
      dimension.normalizationStatement === null ||
      dimension.discrepancyIds.length !== 0
    ) {
      fail(
        `${dimension.dimension} normalized match requires both values and normalization disclosure`,
      );
    }
  } else if (dimension.matchState === "source_not_stated") {
    if (
      dimension.observedValue !== null ||
      dimension.normalizationStatement !== null ||
      dimension.discrepancyIds.length === 0
    ) {
      fail(
        `${dimension.dimension} source-not-stated result requires an explicit discrepancy`,
      );
    }
  } else if (dimension.matchState === "candidate_not_stated") {
    if (
      dimension.expectedValue !== null ||
      dimension.observedValue === null ||
      dimension.normalizationStatement !== null ||
      dimension.discrepancyIds.length === 0
    ) {
      fail(
        `${dimension.dimension} candidate-not-stated result requires observed evidence and a discrepancy`,
      );
    }
  } else if (dimension.discrepancyIds.length === 0) {
    fail(`${dimension.dimension} mismatch requires an explicit discrepancy`);
  }
}

function validateEvidenceAndDimensions(
  artifact: SourceIdentityVerificationArtifact,
): void {
  const anchorIds = artifact.evidenceAnchors.map((anchor) => anchor.anchorId);
  const anchorIdSet = new Set(anchorIds);
  assertUnique(anchorIds, "evidence-anchor IDs");
  const dimensions = artifact.matchDimensions.map((item) => item.dimension);
  assertUnique(dimensions, "identity-match dimensions");
  if (
    JSON.stringify([...dimensions].sort()) !==
    JSON.stringify([...SOURCE_IDENTITY_MATCH_DIMENSIONS].sort())
  ) {
    fail("match dimensions must contain every required dimension exactly once");
  }
  const discrepancyIds = artifact.discrepancies.map(
    (item) => item.discrepancyId,
  );
  const discrepanciesById = new Map(
    artifact.discrepancies.map((item) => [item.discrepancyId, item]),
  );
  assertUnique(discrepancyIds, "discrepancy IDs");

  const observedPublicationDate =
    artifact.observedMetadata.publicationDate.state === "observed"
      ? (artifact.observedMetadata.publicationDate.normalizedDate ??
        String(artifact.observedMetadata.publicationDate.normalizedYear))
      : null;
  const observedCanonicalLocator =
    artifact.canonicalLocatorEvidence.kind === "official_url"
      ? artifact.canonicalLocatorEvidence.url
      : artifact.canonicalLocatorEvidence.locator;
  const expectedCanonicalLocator =
    artifact.candidateIdentity.candidateLocator.kind === "official_url"
      ? artifact.candidateIdentity.candidateLocator.url
      : artifact.candidateIdentity.candidateLocator.locator;
  const expectedValues: Record<
    (typeof SOURCE_IDENTITY_MATCH_DIMENSIONS)[number],
    string | null
  > = {
    title: artifact.candidateIdentity.candidateTitle,
    publisher: artifact.candidateIdentity.candidatePublisher,
    publication_date: artifact.candidateIdentity.candidatePublicationDate,
    language: JSON.stringify(artifact.candidateIdentity.candidateLanguageCodes),
    canonical_locator: expectedCanonicalLocator,
    content_hash: artifact.binding.sourceContentSha256,
    extraction_binding: [
      artifact.extractionBinding.extractionReceiptSha256,
      artifact.extractionBinding.pageMapSha256,
    ].join("|"),
  };
  const observedValues: Record<
    (typeof SOURCE_IDENTITY_MATCH_DIMENSIONS)[number],
    string | null
  > = {
    title: artifact.observedMetadata.title,
    publisher: artifact.observedMetadata.publisher.value,
    publication_date: observedPublicationDate,
    language: JSON.stringify(artifact.observedMetadata.languageCodes),
    canonical_locator: observedCanonicalLocator,
    content_hash: artifact.extractionBinding.rawContentSha256,
    extraction_binding: [
      artifact.extractionBinding.extractionReceiptSha256,
      artifact.extractionBinding.pageMapSha256,
    ].join("|"),
  };

  for (const dimension of artifact.matchDimensions) {
    validateMatchDimension(dimension);
    if (
      dimension.expectedValue !== expectedValues[dimension.dimension] ||
      dimension.observedValue !== observedValues[dimension.dimension]
    ) {
      fail(
        `${dimension.dimension} values drift from the bound candidate or observed evidence`,
      );
    }
    for (const anchorId of dimension.evidenceAnchorIds) {
      if (!anchorIdSet.has(anchorId)) {
        fail(
          `${dimension.dimension} references unknown evidence anchor ${anchorId}`,
        );
      }
    }
    for (const discrepancyId of dimension.discrepancyIds) {
      const discrepancy = discrepanciesById.get(discrepancyId);
      if (!discrepancy)
        fail(
          `${dimension.dimension} references unknown discrepancy ${discrepancyId}`,
        );
      if (discrepancy.dimension !== dimension.dimension) {
        fail(
          `discrepancy ${discrepancyId} is bound to the wrong match dimension`,
        );
      }
      if (
        discrepancy.expectedValue !== dimension.expectedValue ||
        discrepancy.observedValue !== dimension.observedValue
      ) {
        fail(
          `discrepancy ${discrepancyId} values do not bind its exact match dimension`,
        );
      }
    }
  }
  for (const discrepancy of artifact.discrepancies) {
    for (const anchorId of discrepancy.evidenceAnchorIds) {
      if (!anchorIdSet.has(anchorId)) {
        fail(
          `discrepancy ${discrepancy.discrepancyId} references unknown evidence anchor`,
        );
      }
    }
    const dimension = artifact.matchDimensions.find(
      (item) => item.dimension === discrepancy.dimension,
    )!;
    if (!dimension.discrepancyIds.includes(discrepancy.discrepancyId)) {
      fail(
        `discrepancy ${discrepancy.discrepancyId} is not linked back from its dimension`,
      );
    }
  }
}

function validateDecision(artifact: SourceIdentityVerificationArtifact): void {
  const blockingDiscrepancies = artifact.discrepancies.filter(
    (item) => item.severity === "blocking" && item.status === "open",
  );
  if (
    artifact.decision.blockingDiscrepancyCount !== blockingDiscrepancies.length
  ) {
    fail(
      "decision blocking-discrepancy count must match the exact open blocker set",
    );
  }
  if (artifact.decision.state !== "verified") return;

  for (const dimension of artifact.matchDimensions) {
    const allowedSourceNotStated = ["publisher", "publication_date"].includes(
      dimension.dimension,
    );
    if (
      dimension.matchState === "mismatch" ||
      (["source_not_stated", "candidate_not_stated"].includes(
        dimension.matchState,
      ) &&
        !allowedSourceNotStated)
    ) {
      fail(
        `verified identity cannot accept ${dimension.dimension} match state ${dimension.matchState}`,
      );
    }
    if (
      ["content_hash", "extraction_binding"].includes(dimension.dimension) &&
      dimension.matchState !== "exact_match"
    ) {
      fail(`verified identity requires exact ${dimension.dimension}`);
    }
  }
  for (const discrepancy of artifact.discrepancies) {
    if (
      discrepancy.severity !== "non_blocking" ||
      discrepancy.status !== "accepted_for_identity"
    ) {
      fail(
        "verified identity may retain only accepted non-blocking discrepancies",
      );
    }
  }
  const verified = artifact.decision.verifiedIdentity;
  if (
    verified.sourceId !== artifact.binding.sourceId ||
    verified.canonicalIdentity !==
      artifact.candidateIdentity.canonicalIdentity ||
    verified.verifiedAt !== artifact.decision.decidedAt
  ) {
    fail(
      "verified identity must bind the exact source, canonical identity and decision time",
    );
  }
}

function validateAiExecution(
  artifact: SourceIdentityVerificationArtifact,
): void {
  const runs = artifact.aiExecution.runs;
  assertUnique(
    runs.map((run) => run.runId),
    "AI run IDs",
  );
  const requiredStages = [
    "metadata_observation",
    "locator_assessment",
    "identity_match",
    "decision",
  ];
  const observedStages = new Set(runs.flatMap((run) => run.stages));
  for (const stage of requiredStages) {
    if (!observedStages.has(stage as never))
      fail(`AI execution is missing stage ${stage}`);
  }
  runs.forEach((run, index) => {
    assertUnique(run.stages, `AI run ${run.runId} stages`);
    for (const [label, actual, expected] of [
      [
        "lifecycle snapshot",
        run.lifecycleSnapshotSha256,
        artifact.binding.lifecycleSnapshotSha256,
      ],
      [
        "source metadata",
        run.sourceMetadataSha256,
        artifact.binding.sourceMetadataSha256,
      ],
      [
        "source content",
        run.sourceContentSha256,
        artifact.binding.sourceContentSha256,
      ],
      [
        "acquisition receipt",
        run.acquisitionReceiptSha256,
        artifact.acquisitionReceipt.receiptSha256,
      ],
      [
        "extraction receipt",
        run.extractionReceiptSha256,
        artifact.extractionBinding.extractionReceiptSha256,
      ],
      ["page map", run.pageMapSha256, artifact.extractionBinding.pageMapSha256],
    ] as const) {
      if (actual !== expected)
        fail(`AI run ${run.runId} has drifted ${label} hash`);
    }
    if (Date.parse(run.startedAt) > Date.parse(run.completedAt)) {
      fail(`AI run ${run.runId} completes before it starts`);
    }
    const previous = runs[index - 1];
    if (index === 0 && run.predecessorOutputSha256 !== null) {
      fail("first AI run cannot name a predecessor output");
    }
    if (previous) {
      if (run.predecessorOutputSha256 !== previous.outputSha256) {
        fail(`AI run ${run.runId} does not continue the exact previous output`);
      }
      if (Date.parse(run.startedAt) < Date.parse(previous.completedAt)) {
        fail(`AI run ${run.runId} starts before the previous run completed`);
      }
    }
  });
  const lastRun = runs.at(-1)!;
  if (
    artifact.aiExecution.finalOutputSha256 !== lastRun.outputSha256 ||
    lastRun.outputSha256 !== artifact.verificationPayloadSha256
  ) {
    fail("final AI output must bind the exact verification payload hash");
  }
}

function validateTimes(artifact: SourceIdentityVerificationArtifact): void {
  const firstRun = artifact.aiExecution.runs[0]!;
  const lastRun = artifact.aiExecution.runs.at(-1)!;
  if (
    Date.parse(artifact.binding.lifecycleSnapshotUpdatedAt) >
    Date.parse(firstRun.startedAt)
  ) {
    fail("AI verification cannot predate its lifecycle snapshot");
  }
  if (
    Date.parse(artifact.decision.decidedAt) < Date.parse(firstRun.startedAt) ||
    Date.parse(artifact.decision.decidedAt) > Date.parse(lastRun.completedAt)
  ) {
    fail("identity decision time must fall inside the AI execution window");
  }
  if (Date.parse(artifact.createdAt) < Date.parse(lastRun.completedAt)) {
    fail("artifact creation cannot predate the final AI run");
  }
}

export function sourceIdentityVerificationPayload(
  artifact: Pick<
    SourceIdentityVerificationArtifact,
    | "observedMetadata"
    | "canonicalLocatorEvidence"
    | "evidenceAnchors"
    | "matchDimensions"
    | "discrepancies"
    | "decision"
    | "downstreamBoundaries"
  >,
): SourceIdentityVerificationPayload {
  return {
    observedMetadata: artifact.observedMetadata,
    canonicalLocatorEvidence: artifact.canonicalLocatorEvidence,
    evidenceAnchors: artifact.evidenceAnchors,
    matchDimensions: artifact.matchDimensions,
    discrepancies: artifact.discrepancies,
    decision: artifact.decision,
    downstreamBoundaries: artifact.downstreamBoundaries,
  };
}

export function validateSourceIdentityVerificationArtifact(
  value: unknown,
): SourceIdentityVerificationArtifact {
  const parsed = sourceIdentityVerificationStructuralSchema.safeParse(value);
  if (!parsed.success) {
    fail(
      parsed.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; "),
    );
  }
  const artifact = parsed.data;
  validateContinuity(artifact);
  validateBindings(artifact);
  validateEvidenceAndDimensions(artifact);
  validateDecision(artifact);
  validateAiExecution(artifact);
  validateTimes(artifact);

  const expectedPayloadSha256 = hashSourceIdentityVerificationPayload(
    sourceIdentityVerificationPayload(artifact),
  );
  if (artifact.verificationPayloadSha256 !== expectedPayloadSha256) {
    fail("verification payload hash does not match its canonical fields");
  }
  const { artifactSha256, ...body } = artifact;
  const expectedArtifactSha256 = sourceIdentitySha256(
    canonicalSourceIdentityJson(body as SourceIdentityJsonValue),
  );
  if (artifactSha256 !== expectedArtifactSha256) {
    fail("artifact hash does not match the canonical artifact body");
  }
  return artifact;
}

export function validateSourceIdentityVerificationBinding(
  artifact: SourceIdentityVerificationArtifact,
  expected: SourceIdentityVerificationBinding,
): SourceIdentityVerificationArtifact {
  const validated = validateSourceIdentityVerificationArtifact(artifact);
  if (
    canonicalSourceIdentityJson(
      validated.binding as SourceIdentityJsonValue,
    ) !== canonicalSourceIdentityJson(expected as SourceIdentityJsonValue)
  ) {
    fail(
      "artifact does not match the exact expected lifecycle/source hash binding",
    );
  }
  return validated;
}

export type SourceIdentityAcquisitionValidation = {
  identity: SourceIdentityVerificationArtifact;
  acquisitionReceipt: SourceAcquisitionReceipt;
  acquisitionProvenanceValidated: true;
};

export function validateSourceIdentityVerificationWithAcquisitionReceipt(
  identityValue: unknown,
  receiptFile: {
    receiptPath: string;
    receiptBytes: Buffer | string;
    rawContentBytes: Buffer;
  },
): SourceIdentityAcquisitionValidation {
  const identity = validateSourceIdentityVerificationArtifact(identityValue);
  if (receiptFile.receiptPath !== identity.acquisitionReceipt.receiptPath) {
    fail(
      "acquisition receipt path does not match the exact identity reference",
    );
  }
  const receiptBytes =
    typeof receiptFile.receiptBytes === "string"
      ? Buffer.from(receiptFile.receiptBytes, "utf8")
      : receiptFile.receiptBytes;
  if (
    sourceIdentitySha256(receiptBytes) !==
    identity.acquisitionReceipt.receiptFileSha256
  ) {
    fail(
      "acquisition receipt file hash does not match the exact identity reference",
    );
  }
  let receiptValue: unknown;
  try {
    receiptValue = JSON.parse(
      new TextDecoder("utf-8", { fatal: true }).decode(receiptBytes),
    );
  } catch {
    fail("acquisition receipt file is not valid UTF-8 JSON");
  }
  const receipt = validateSourceAcquisitionReceipt(receiptValue);
  if (
    receipt.receiptId !== identity.acquisitionReceipt.receiptId ||
    receipt.receiptVersion !== identity.acquisitionReceipt.receiptVersion ||
    receipt.acquisitionType !== identity.acquisitionReceipt.receiptType ||
    receipt.receiptSha256 !== identity.acquisitionReceipt.receiptSha256
  ) {
    fail(
      "acquisition receipt identity, version, type or internal seal does not match",
    );
  }
  if (receipt.sourceId !== identity.binding.sourceId) {
    fail("acquisition receipt source ID does not match the identity artifact");
  }
  const acquiredContent = sourceAcquisitionContent(receipt);
  if (
    acquiredContent.sha256 !== identity.binding.sourceContentSha256 ||
    acquiredContent.sha256 !== identity.extractionBinding.rawContentSha256 ||
    acquiredContent.sizeBytes !==
      identity.extractionBinding.rawContentSizeBytes ||
    sourceIdentitySha256(receiptFile.rawContentBytes) !==
      acquiredContent.sha256 ||
    receiptFile.rawContentBytes.length !== acquiredContent.sizeBytes
  ) {
    fail(
      "acquisition receipt does not bind the exact raw-content hash and size",
    );
  }

  const candidateLocator = identity.candidateIdentity.candidateLocator;
  const observedLocator = identity.canonicalLocatorEvidence;
  if (receipt.acquisitionType === "controlled_https_fetch") {
    if (
      candidateLocator.kind !== "official_url" ||
      observedLocator.kind !== "official_url" ||
      candidateLocator.url !== receipt.requestedLocator ||
      observedLocator.url !== receipt.finalLocator
    ) {
      fail(
        "HTTPS acquisition receipt does not bind the requested and final identity locators",
      );
    }
    const expectedAccessState =
      receipt.redirectChain.length === 0 ? "reachable" : "redirected";
    if (
      observedLocator.accessState !== expectedAccessState ||
      observedLocator.accessObservedAt !== receipt.response.observedAt ||
      observedLocator.evidenceSha256 !== receipt.receiptSha256
    ) {
      fail(
        "HTTPS locator evidence does not bind the exact acquisition observation",
      );
    }
  } else {
    if (
      candidateLocator.kind !== "controlled_private_locator" ||
      observedLocator.kind !== "controlled_private_locator" ||
      candidateLocator.locator !== receipt.requestedLocator ||
      observedLocator.locator !== receipt.finalLocator
    ) {
      fail(
        "private acquisition receipt does not bind the requested and final identity locators",
      );
    }
    if (
      observedLocator.accessVerifiedAt !== receipt.completedAt ||
      observedLocator.manifestSha256 !==
        receipt.recoveryManifest.manifestReceiptSha256 ||
      observedLocator.evidenceSha256 !== receipt.receiptSha256
    ) {
      fail(
        "private locator evidence does not bind the exact acquisition and recovery manifest",
      );
    }
  }
  return {
    identity,
    acquisitionReceipt: receipt,
    acquisitionProvenanceValidated: true,
  };
}

export function requireVerifiedSourceIdentityWithAcquisitionReceipt(
  identityValue: unknown,
  receiptFile: {
    receiptPath: string;
    receiptBytes: Buffer | string;
    rawContentBytes: Buffer;
  },
): SourceIdentityAcquisitionValidation & {
  identity: SourceIdentityVerificationArtifact & {
    decision: z.infer<typeof verifiedDecisionSchema>;
  };
} {
  const validated = validateSourceIdentityVerificationWithAcquisitionReceipt(
    identityValue,
    receiptFile,
  );
  if (validated.identity.decision.state !== "verified") {
    fail(
      `identity decision ${validated.identity.decision.state} cannot establish verified identity`,
    );
  }
  return validated as SourceIdentityAcquisitionValidation & {
    identity: SourceIdentityVerificationArtifact & {
      decision: z.infer<typeof verifiedDecisionSchema>;
    };
  };
}

/**
 * Checks the sealed identity decision only. This standalone function does not
 * establish acquisition provenance; callers needing provenance must use the
 * combined acquisition-receipt validator above.
 */
export function requireVerifiedSourceIdentity(
  artifact: SourceIdentityVerificationArtifact,
): SourceIdentityVerificationArtifact & {
  decision: z.infer<typeof verifiedDecisionSchema>;
} {
  const validated = validateSourceIdentityVerificationArtifact(artifact);
  if (validated.decision.state !== "verified") {
    fail(
      `identity decision ${validated.decision.state} cannot establish verified identity`,
    );
  }
  return validated as SourceIdentityVerificationArtifact & {
    decision: z.infer<typeof verifiedDecisionSchema>;
  };
}

export function sealSourceIdentityVerificationArtifact(
  value: Omit<SourceIdentityVerificationArtifact, "artifactSha256">,
): SourceIdentityVerificationArtifact {
  const artifactSha256 = sourceIdentitySha256(
    canonicalSourceIdentityJson(value as SourceIdentityJsonValue),
  );
  return validateSourceIdentityVerificationArtifact({
    ...value,
    artifactSha256,
  });
}
