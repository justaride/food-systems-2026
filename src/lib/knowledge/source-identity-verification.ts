import { createHash } from "node:crypto";
import { TextDecoder } from "node:util";

import { z } from "zod";

import {
  sourceAcquisitionContent,
  validateSourceAcquisitionReceipt,
  type SourceAcquisitionReceipt,
} from "./source-acquisition-receipt";
import {
  PdfPageMapSchema,
  PdfQualificationReceiptSchema,
  verifySealedPageMap,
  verifySealedQualificationReceipt,
  type PdfPageMap,
  type PdfQualificationReceipt,
} from "./pdf-page-extraction-qualification";
import {
  verifySourceAnalysisInputManifest,
  type SourceAnalysisInputManifest,
} from "./source-analysis-input-manifest";

export const SOURCE_IDENTITY_VERIFICATION_SCHEMA_VERSION =
  "source-identity-verification-v1" as const;
export const SOURCE_IDENTITY_VERIFICATION_ARTIFACT_VERSION = "1.0.0" as const;
export const MODEL_VERSION_NOT_EXPOSED = "runtime_not_exposed" as const;
export const SOURCE_IDENTITY_WORKFLOW_ID =
  "workflow.source_identity_verification.v1" as const;
export const SOURCE_IDENTITY_WORKFLOW_VERSION = "1.0.0" as const;
export const SOURCE_IDENTITY_WORKFLOW_PATH =
  "knowledge/corpus/workflows/source-identity-verification-v1.md" as const;
export const SOURCE_IDENTITY_PROMPT_TEMPLATE_PATH =
  "knowledge/corpus/workflows/source-identity-verification-prompt-v1.md" as const;
export const SOURCE_IDENTITY_PROMPT_TEMPLATE_ID =
  "prompt.source_identity_verification.v1" as const;
export const SOURCE_IDENTITY_PROMPT_TEMPLATE_VERSION = "1.0.0" as const;
export const SOURCE_IDENTITY_VERIFICATION_ARTIFACT_DIRECTORY =
  "knowledge/corpus/source-identity-verification/artifacts" as const;
export const SOURCE_IDENTITY_VERIFICATION_ARTIFACT_FILE_SUFFIX =
  ".source-identity-verification.v1.json" as const;
export const SOURCE_IDENTITY_WORKFLOW_FILE_SHA256 =
  "sha256:3c15fc61fd6e6ece0f2539baff7e18802711dbc3ad5dfe6e2917f2af74e9c10a" as const;
export const SOURCE_IDENTITY_PROMPT_TEMPLATE_SHA256 =
  "sha256:248a09a027f401d131687214f84f4ff832b8d540bdef3e7535f251db3a018255" as const;
export const SOURCE_IDENTITY_INPUT_ENVELOPE_SCHEMA_VERSION =
  "source-identity-verification-input-envelope-v1" as const;
export const SOURCE_IDENTITY_INPUT_ENVELOPE_HASH_DOMAIN =
  "food-systems/source-identity-verification-input-envelope/v1\n" as const;

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
  workflowRef: z.literal(SOURCE_IDENTITY_WORKFLOW_ID),
  workflowVersion: z.literal(SOURCE_IDENTITY_WORKFLOW_VERSION),
  workflowFileSha256: sha256Schema,
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

export const SOURCE_IDENTITY_REQUIRED_INPUT_EVIDENCE_TYPES = [
  "source_acquisition_receipt",
  "extraction_receipt",
  "page_map",
  "source_analysis_input_manifest",
] as const;

type SourceIdentityRequiredInputEvidenceType =
  (typeof SOURCE_IDENTITY_REQUIRED_INPUT_EVIDENCE_TYPES)[number];

export type SourceIdentityVerificationInputEnvelope = Pick<
  SourceIdentityVerificationArtifact,
  "binding" | "candidateIdentity" | "acquisitionReceipt" | "extractionBinding"
> & {
  schemaVersion: typeof SOURCE_IDENTITY_INPUT_ENVELOPE_SCHEMA_VERSION;
  inputEvidenceAnchors: Array<
    Pick<
      SourceIdentityVerificationArtifact["evidenceAnchors"][number],
      "anchorId" | "evidenceType" | "locator" | "evidenceSha256" | "observedAt"
    >
  >;
  workflow: {
    workflowRef: typeof SOURCE_IDENTITY_WORKFLOW_ID;
    workflowVersion: typeof SOURCE_IDENTITY_WORKFLOW_VERSION;
    workflowFileSha256: string;
    promptTemplateSha256: string;
  };
};

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

export function sourceIdentityVerificationArtifactPath(
  artifactSha256: string,
): string {
  if (!HASH_PATTERN.test(artifactSha256)) {
    fail("identity artifact path requires a prefixed SHA-256 artifact seal");
  }
  return (
    `${SOURCE_IDENTITY_VERIFICATION_ARTIFACT_DIRECTORY}/` +
    `${artifactSha256.slice("sha256:".length)}` +
    SOURCE_IDENTITY_VERIFICATION_ARTIFACT_FILE_SUFFIX
  );
}

export function hashSourceIdentityVerificationPayload(
  payload: SourceIdentityVerificationPayload,
): string {
  return sourceIdentitySha256(
    canonicalSourceIdentityJson(payload as SourceIdentityJsonValue),
  );
}

function requiredInputEvidenceAnchors(
  evidenceAnchors: SourceIdentityVerificationArtifact["evidenceAnchors"],
): SourceIdentityVerificationInputEnvelope["inputEvidenceAnchors"] {
  return SOURCE_IDENTITY_REQUIRED_INPUT_EVIDENCE_TYPES.map((evidenceType) => {
    const matches = evidenceAnchors.filter(
      (anchor) => anchor.evidenceType === evidenceType,
    );
    if (matches.length !== 1) {
      fail(`identity input requires exactly one ${evidenceType} anchor`);
    }
    const anchor = matches[0]!;
    return {
      anchorId: anchor.anchorId,
      evidenceType:
        anchor.evidenceType as SourceIdentityRequiredInputEvidenceType,
      locator: anchor.locator,
      evidenceSha256: anchor.evidenceSha256,
      observedAt: anchor.observedAt,
    };
  });
}

export function sourceIdentityVerificationInputEnvelope(
  input: Pick<
    SourceIdentityVerificationArtifact,
    | "binding"
    | "candidateIdentity"
    | "acquisitionReceipt"
    | "extractionBinding"
    | "evidenceAnchors"
  > & {
    workflow: SourceIdentityVerificationInputEnvelope["workflow"];
  },
): SourceIdentityVerificationInputEnvelope {
  return {
    schemaVersion: SOURCE_IDENTITY_INPUT_ENVELOPE_SCHEMA_VERSION,
    binding: input.binding,
    candidateIdentity: input.candidateIdentity,
    acquisitionReceipt: input.acquisitionReceipt,
    extractionBinding: input.extractionBinding,
    inputEvidenceAnchors: requiredInputEvidenceAnchors(input.evidenceAnchors),
    workflow: input.workflow,
  };
}

export function hashSourceIdentityVerificationInputEnvelope(
  input: SourceIdentityVerificationInputEnvelope,
): string {
  return sourceIdentitySha256(
    `${SOURCE_IDENTITY_INPUT_ENVELOPE_HASH_DOMAIN}${canonicalSourceIdentityJson(
      input as SourceIdentityJsonValue,
    )}`,
  );
}

export function sourceIdentityExtractionReceiptId(
  rawContentSha256: string,
): string {
  const raw = rawContentSha256.replace(/^sha256:/, "");
  if (!/^[a-f0-9]{64}$/.test(raw))
    fail("cannot derive extraction ID from invalid hash");
  return `artifact.pdf_extraction.${raw}`;
}

export function sourceIdentityPageMapId(rawContentSha256: string): string {
  const raw = rawContentSha256.replace(/^sha256:/, "");
  if (!/^[a-f0-9]{64}$/.test(raw))
    fail("cannot derive page-map ID from invalid hash");
  return `artifact.pdf_page_map.${raw}`;
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
  if (
    artifact.extractionBinding.extractionReceiptId !==
    sourceIdentityExtractionReceiptId(artifact.binding.sourceContentSha256)
  ) {
    fail(
      "extraction receipt ID must use the deterministic raw-content convention",
    );
  }
  if (
    artifact.extractionBinding.pageMapId !==
    sourceIdentityPageMapId(artifact.binding.sourceContentSha256)
  ) {
    fail("page-map ID must use the deterministic raw-content convention");
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
      dimension.discrepancyIds.length !== 0 ||
      dimension.expectedValue === dimension.observedValue ||
      !deterministicNormalizedMatch(
        dimension.dimension,
        dimension.expectedValue,
        dimension.observedValue,
      )
    ) {
      fail(
        `${dimension.dimension} normalized match must satisfy the deterministic dimension policy`,
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

function normalizeBibliographicLabel(value: string): string {
  return value
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\p{P}\p{S}]+/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function normalizeLanguageSet(value: string): string | null {
  try {
    const parsed: unknown = JSON.parse(value);
    if (
      !Array.isArray(parsed) ||
      parsed.length === 0 ||
      parsed.some((item) => typeof item !== "string" || item.length === 0)
    ) {
      return null;
    }
    const normalized = parsed.map((item) =>
      (item as string).normalize("NFKC").toLowerCase(),
    );
    if (new Set(normalized).size !== normalized.length) return null;
    return JSON.stringify([...normalized].sort());
  } catch {
    return null;
  }
}

function normalizeOfficialUrl(value: string): string | null {
  try {
    const parsed = new URL(value);
    if (
      parsed.protocol !== "https:" ||
      parsed.username !== "" ||
      parsed.password !== "" ||
      parsed.hash !== ""
    ) {
      return null;
    }
    return parsed.href;
  } catch {
    return null;
  }
}

function deterministicNormalizedMatch(
  dimension: SourceIdentityVerificationArtifact["matchDimensions"][number]["dimension"],
  expectedValue: string,
  observedValue: string,
): boolean {
  if (dimension === "title" || dimension === "publisher") {
    const expected = normalizeBibliographicLabel(expectedValue);
    const observed = normalizeBibliographicLabel(observedValue);
    return expected.length > 0 && expected === observed;
  }
  if (dimension === "language") {
    const expected = normalizeLanguageSet(expectedValue);
    const observed = normalizeLanguageSet(observedValue);
    return expected !== null && expected === observed;
  }
  if (dimension === "canonical_locator") {
    const expected = normalizeOfficialUrl(expectedValue);
    const observed = normalizeOfficialUrl(observedValue);
    return expected !== null && expected === observed;
  }
  return false;
}

function validateEvidenceAndDimensions(
  artifact: SourceIdentityVerificationArtifact,
): void {
  const anchorIds = artifact.evidenceAnchors.map((anchor) => anchor.anchorId);
  const anchorIdSet = new Set(anchorIds);
  const anchorsById = new Map(
    artifact.evidenceAnchors.map((anchor) => [anchor.anchorId, anchor]),
  );
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
    const evidenceTypes = new Set(
      dimension.evidenceAnchorIds.map(
        (anchorId) => anchorsById.get(anchorId)!.evidenceType,
      ),
    );
    if (
      ["title", "publisher", "publication_date", "language"].includes(
        dimension.dimension,
      ) &&
      !["cover_page", "bibliographic_page"].some((evidenceType) =>
        evidenceTypes.has(evidenceType as never),
      )
    ) {
      fail(`${dimension.dimension} lacks bibliographic source evidence`);
    }
    if (
      ["canonical_locator", "content_hash"].includes(dimension.dimension) &&
      !evidenceTypes.has("source_acquisition_receipt")
    ) {
      fail(`${dimension.dimension} must cite the source acquisition receipt`);
    }
    if (
      dimension.dimension === "extraction_binding" &&
      (!evidenceTypes.has("extraction_receipt") ||
        !evidenceTypes.has("page_map"))
    ) {
      fail("extraction binding must cite both extraction receipt and page map");
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
  const observedStages = runs.flatMap((run) => run.stages);
  if (JSON.stringify(observedStages) !== JSON.stringify(requiredStages)) {
    fail("AI stages must occur exactly once in the required order");
  }
  const firstRun = runs[0]!;
  if (
    firstRun.workflowFileSha256 !== SOURCE_IDENTITY_WORKFLOW_FILE_SHA256 ||
    firstRun.promptTemplateSha256 !== SOURCE_IDENTITY_PROMPT_TEMPLATE_SHA256
  ) {
    fail("AI run does not bind the exact v1 workflow and prompt hashes");
  }
  for (const anchor of requiredInputEvidenceAnchors(artifact.evidenceAnchors)) {
    if (Date.parse(anchor.observedAt) > Date.parse(firstRun.startedAt)) {
      fail(
        `required input anchor ${anchor.anchorId} postdates the first AI run`,
      );
    }
  }
  const matchAnchorIds = new Set(
    artifact.matchDimensions.flatMap(
      (dimension) => dimension.evidenceAnchorIds,
    ),
  );
  for (const anchor of artifact.evidenceAnchors) {
    if (
      matchAnchorIds.has(anchor.anchorId) &&
      Date.parse(anchor.observedAt) > Date.parse(firstRun.startedAt)
    ) {
      fail(
        `match evidence anchor ${anchor.anchorId} postdates the first AI run`,
      );
    }
  }
  const expectedInputEnvelopeSha256 =
    hashSourceIdentityVerificationInputEnvelope(
      sourceIdentityVerificationInputEnvelope({
        binding: artifact.binding,
        candidateIdentity: artifact.candidateIdentity,
        acquisitionReceipt: artifact.acquisitionReceipt,
        extractionBinding: artifact.extractionBinding,
        evidenceAnchors: artifact.evidenceAnchors,
        workflow: {
          workflowRef: firstRun.workflowRef,
          workflowVersion: firstRun.workflowVersion,
          workflowFileSha256: firstRun.workflowFileSha256,
          promptTemplateSha256: firstRun.promptTemplateSha256,
        },
      }),
    );
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
    if (
      run.workflowRef !== firstRun.workflowRef ||
      run.workflowVersion !== firstRun.workflowVersion ||
      run.workflowFileSha256 !== firstRun.workflowFileSha256 ||
      run.promptTemplateSha256 !== firstRun.promptTemplateSha256
    ) {
      fail(`AI run ${run.runId} has drifted workflow binding`);
    }
    if (run.inputEnvelopeSha256 !== expectedInputEnvelopeSha256) {
      fail(`AI run ${run.runId} has drifted canonical input-envelope hash`);
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

export type SourceIdentityArtifactFile = {
  path: string;
  bytes: Buffer | string;
};

export type SourceIdentityVerificationEvidenceBundle = {
  acquisitionReceiptFile: SourceIdentityArtifactFile;
  rawContentBytes: Buffer;
  extractionReceiptFile: SourceIdentityArtifactFile;
  pageMapFile: SourceIdentityArtifactFile;
  sourceAnalysisInputManifestFile: SourceIdentityArtifactFile;
  workflowFile: SourceIdentityArtifactFile;
  promptTemplateFile: SourceIdentityArtifactFile;
};

export type SourceIdentityEvidenceBundleValidation =
  SourceIdentityAcquisitionValidation & {
    extractionReceipt: PdfQualificationReceipt;
    pageMap: PdfPageMap;
    sourceAnalysisInputManifest: SourceAnalysisInputManifest;
    workflowValidated: true;
    completeInputEvidenceValidated: true;
  };

function artifactFileBytes(file: SourceIdentityArtifactFile): Buffer {
  return typeof file.bytes === "string"
    ? Buffer.from(file.bytes, "utf8")
    : file.bytes;
}

function parseArtifactJson(
  file: SourceIdentityArtifactFile,
  label: string,
): unknown {
  try {
    return JSON.parse(
      new TextDecoder("utf-8", { fatal: true }).decode(artifactFileBytes(file)),
    );
  } catch {
    fail(`${label} is not valid UTF-8 JSON`);
  }
}

function inputEvidenceAnchor(
  artifact: SourceIdentityVerificationArtifact,
  evidenceType: SourceIdentityRequiredInputEvidenceType,
): SourceIdentityVerificationArtifact["evidenceAnchors"][number] {
  const matches = artifact.evidenceAnchors.filter(
    (anchor) => anchor.evidenceType === evidenceType,
  );
  if (matches.length !== 1) {
    fail(`identity input requires exactly one ${evidenceType} anchor`);
  }
  return matches[0]!;
}

function validateAnchoredArtifactFile(
  artifact: SourceIdentityVerificationArtifact,
  evidenceType: SourceIdentityRequiredInputEvidenceType,
  file: SourceIdentityArtifactFile,
): void {
  const anchor = inputEvidenceAnchor(artifact, evidenceType);
  if (anchor.locator !== file.path) {
    fail(`${evidenceType} path does not match its exact evidence anchor`);
  }
  if (anchor.evidenceSha256 !== sourceIdentitySha256(artifactFileBytes(file))) {
    fail(`${evidenceType} file hash does not match its exact evidence anchor`);
  }
}

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

export function validateSourceIdentityVerificationWithEvidenceBundle(
  identityValue: unknown,
  bundle: SourceIdentityVerificationEvidenceBundle,
): SourceIdentityEvidenceBundleValidation {
  const acquisition = validateSourceIdentityVerificationWithAcquisitionReceipt(
    identityValue,
    {
      receiptPath: bundle.acquisitionReceiptFile.path,
      receiptBytes: bundle.acquisitionReceiptFile.bytes,
      rawContentBytes: bundle.rawContentBytes,
    },
  );
  const identity = acquisition.identity;
  validateAnchoredArtifactFile(
    identity,
    "source_acquisition_receipt",
    bundle.acquisitionReceiptFile,
  );
  validateAnchoredArtifactFile(
    identity,
    "extraction_receipt",
    bundle.extractionReceiptFile,
  );
  validateAnchoredArtifactFile(identity, "page_map", bundle.pageMapFile);
  validateAnchoredArtifactFile(
    identity,
    "source_analysis_input_manifest",
    bundle.sourceAnalysisInputManifestFile,
  );

  const extractionValue = parseArtifactJson(
    bundle.extractionReceiptFile,
    "extraction receipt",
  );
  const extractionParsed =
    PdfQualificationReceiptSchema.safeParse(extractionValue);
  if (!extractionParsed.success)
    fail("extraction receipt schema validation failed");
  const extractionReceipt = extractionParsed.data;
  if (!verifySealedQualificationReceipt(extractionReceipt)) {
    fail("extraction receipt internal seal does not validate");
  }

  const pageMapValue = parseArtifactJson(bundle.pageMapFile, "page map");
  const pageMapParsed = PdfPageMapSchema.safeParse(pageMapValue);
  if (!pageMapParsed.success) fail("page-map schema validation failed");
  const pageMap = pageMapParsed.data;
  if (!verifySealedPageMap(pageMap))
    fail("page-map internal seal does not validate");

  let sourceAnalysisInputManifest: SourceAnalysisInputManifest;
  try {
    sourceAnalysisInputManifest = verifySourceAnalysisInputManifest(
      parseArtifactJson(
        bundle.sourceAnalysisInputManifestFile,
        "source-analysis input manifest",
      ),
    );
  } catch {
    fail("source-analysis input manifest does not validate");
  }

  const rawHash = identity.binding.sourceContentSha256.replace(/^sha256:/, "");
  const canonicalIdentity = identity.candidateIdentity.canonicalIdentity;
  const expectedReceiptPath = `knowledge/corpus/pdf-page-extraction/receipts/${rawHash}.receipt.v1.json`;
  const expectedPageMapPath = `knowledge/corpus/pdf-page-extraction/page-maps/${rawHash}.page-map.v1.json`;
  const expectedInputManifestPath = `knowledge/corpus/source-analysis-input-manifests/manifests/${rawHash}.source-analysis-input-manifest.v1.json`;
  if (bundle.extractionReceiptFile.path !== expectedReceiptPath) {
    fail(
      "extraction receipt does not use the deterministic content-addressed path",
    );
  }
  if (bundle.pageMapFile.path !== expectedPageMapPath) {
    fail("page map does not use the deterministic content-addressed path");
  }
  if (
    bundle.sourceAnalysisInputManifestFile.path !== expectedInputManifestPath
  ) {
    fail(
      "source-analysis input manifest does not use the deterministic content-addressed path",
    );
  }
  if (
    bundle.rawContentBytes.subarray(0, 5).toString("ascii") !== "%PDF-" ||
    extractionReceipt.sourceFile.headerMagic !== "%PDF-" ||
    extractionReceipt.sourceFile.expectedSizeBytes !==
      bundle.rawContentBytes.length ||
    extractionReceipt.sourceFile.observedSizeBytes !==
      bundle.rawContentBytes.length ||
    extractionReceipt.sourceFile.primaryCopy.sha256 !== rawHash ||
    extractionReceipt.sourceFile.replicaCopy.sha256 !== rawHash ||
    extractionReceipt.sourceFile.primaryCopy.sizeBytes !==
      bundle.rawContentBytes.length ||
    extractionReceipt.sourceFile.replicaCopy.sizeBytes !==
      bundle.rawContentBytes.length
  ) {
    fail("raw PDF bytes do not match the complete extraction copy binding");
  }

  for (const [label, processingHash] of [
    ["extraction receipt", extractionReceipt.processingUnit.rawPdfSha256],
    ["page map", pageMap.processingUnit.rawPdfSha256],
    [
      "source-analysis input manifest",
      sourceAnalysisInputManifest.processingUnit.rawPdfSha256,
    ],
  ] as const) {
    if (processingHash !== rawHash) fail(`${label} raw-content hash drifted`);
  }
  const boundIdentityKeySets = [
    ["extraction receipt", extractionReceipt.identityKeys],
    ["page map", pageMap.identityKeys],
    [
      "source-analysis input manifest",
      sourceAnalysisInputManifest.identityKeys,
    ],
  ] as const;
  const expectedIdentityKeys = JSON.stringify(
    [...extractionReceipt.identityKeys].sort(),
  );
  for (const [label, identityKeys] of boundIdentityKeySets) {
    if (
      new Set(identityKeys).size !== identityKeys.length ||
      !identityKeys.includes(canonicalIdentity) ||
      JSON.stringify([...identityKeys].sort()) !== expectedIdentityKeys
    ) {
      fail(`${label} does not bind the exact canonical identity`);
    }
  }
  const expectedIdentityAssociation = canonicalSourceIdentityJson(
    extractionReceipt.identityAssociation as SourceIdentityJsonValue,
  );
  const expectedSourceBinding = canonicalSourceIdentityJson(
    extractionReceipt.sourceBinding as SourceIdentityJsonValue,
  );
  for (const [label, identityAssociation, sourceBinding] of [
    ["page map", pageMap.identityAssociation, pageMap.sourceBinding],
    [
      "source-analysis input manifest",
      sourceAnalysisInputManifest.identityAssociation,
      sourceAnalysisInputManifest.sourceBinding,
    ],
  ] as const) {
    if (
      canonicalSourceIdentityJson(
        identityAssociation as SourceIdentityJsonValue,
      ) !== expectedIdentityAssociation ||
      canonicalSourceIdentityJson(sourceBinding as SourceIdentityJsonValue) !==
        expectedSourceBinding
    ) {
      fail(`${label} identity association or source binding drifted`);
    }
  }

  if (
    identity.extractionBinding.extractionReceiptId !==
      sourceIdentityExtractionReceiptId(identity.binding.sourceContentSha256) ||
    identity.extractionBinding.extractionReceiptVersion !==
      extractionReceipt.pipelineVersion ||
    identity.extractionBinding.extractionReceiptSha256 !==
      `sha256:${extractionReceipt.receiptSha256}`
  ) {
    fail("extraction receipt identity, version or internal seal drifted");
  }
  if (
    identity.extractionBinding.pageMapId !==
      sourceIdentityPageMapId(identity.binding.sourceContentSha256) ||
    identity.extractionBinding.pageMapVersion !== pageMap.pipelineVersion ||
    identity.extractionBinding.pageMapSha256 !==
      `sha256:${pageMap.pageMapSha256}`
  ) {
    fail("page-map identity, version or internal seal drifted");
  }
  if (
    extractionReceipt.extraction.pageMapSha256 !== pageMap.pageMapSha256 ||
    extractionReceipt.extraction.pageMapLocator !== bundle.pageMapFile.path ||
    extractionReceipt.sourceFile.observedSizeBytes !==
      identity.extractionBinding.rawContentSizeBytes ||
    extractionReceipt.sourceFile.observedSizeBytes !==
      bundle.rawContentBytes.length ||
    extractionReceipt.sourceFile.pageCount !==
      identity.extractionBinding.expectedPageCount ||
    extractionReceipt.extraction.extractedPageCount !==
      identity.extractionBinding.mappedPageCount ||
    pageMap.expectedPageCount !==
      identity.extractionBinding.expectedPageCount ||
    pageMap.extractedPageCount !== identity.extractionBinding.mappedPageCount ||
    pageMap.pages.length !== identity.extractionBinding.mappedPageCount ||
    extractionReceipt.extraction.rawTextFileCount !==
      identity.extractionBinding.mappedPageCount ||
    extractionReceipt.extraction.normalizedTextFileCount !==
      identity.extractionBinding.mappedPageCount ||
    !pageMap.pageSequenceComplete
  ) {
    fail("extraction receipt and page-map coverage bindings drifted");
  }
  for (let index = 0; index < pageMap.pages.length; index += 1) {
    const page = pageMap.pages[index]!;
    const manifestPage = sourceAnalysisInputManifest.pages[index];
    if (
      page.pageNumber !== index + 1 ||
      manifestPage?.pageNumber !== page.pageNumber ||
      manifestPage.normalizedText.sha256 !== page.normalizedText.sha256 ||
      manifestPage.normalizedText.sizeBytes !== page.normalizedText.sizeBytes ||
      manifestPage.normalizedText.characterCount !==
        page.normalizedText.characterCount ||
      manifestPage.normalizedText.wordCount !== page.normalizedText.wordCount
    ) {
      fail(`normalized page ${index + 1} drifted across extraction inputs`);
    }
  }
  if (
    extractionReceipt.totals.normalizedSizeBytes !==
      sourceAnalysisInputManifest.totals.normalizedSizeBytes ||
    extractionReceipt.totals.normalizedCharacterCount !==
      sourceAnalysisInputManifest.totals.normalizedCharacterCount ||
    extractionReceipt.totals.wordCount !==
      sourceAnalysisInputManifest.totals.wordCount
  ) {
    fail("normalized extraction totals drifted across input artifacts");
  }

  const extractionFileHash = sourceIdentitySha256(
    artifactFileBytes(bundle.extractionReceiptFile),
  ).replace(/^sha256:/, "");
  const pageMapFileHash = sourceIdentitySha256(
    artifactFileBytes(bundle.pageMapFile),
  ).replace(/^sha256:/, "");
  if (
    sourceAnalysisInputManifest.bindings.extractionReceipt.path !==
      bundle.extractionReceiptFile.path ||
    sourceAnalysisInputManifest.bindings.extractionReceipt.fileSha256 !==
      extractionFileHash ||
    sourceAnalysisInputManifest.bindings.extractionReceipt.receiptSha256 !==
      extractionReceipt.receiptSha256 ||
    sourceAnalysisInputManifest.bindings.pageMap.path !==
      bundle.pageMapFile.path ||
    sourceAnalysisInputManifest.bindings.pageMap.fileSha256 !==
      pageMapFileHash ||
    sourceAnalysisInputManifest.bindings.pageMap.pageMapSha256 !==
      pageMap.pageMapSha256
  ) {
    fail("source-analysis input manifest artifact bindings drifted");
  }
  if (
    identity.extractionBinding.extractedTextManifestSha256 !==
      `sha256:${sourceAnalysisInputManifest.normalizedInput.sha256}` ||
    sourceAnalysisInputManifest.totals.pageCount !==
      identity.extractionBinding.expectedPageCount ||
    sourceAnalysisInputManifest.identityAssociation.state !==
      "provisional_metadata_match" ||
    sourceAnalysisInputManifest.sourceBinding.corpusIdentityVerified !==
      false ||
    sourceAnalysisInputManifest.workflowEligibility.state !==
      "identity_verification_candidate" ||
    sourceAnalysisInputManifest.workflowEligibility.identityVerification
      .allowed !== true ||
    sourceAnalysisInputManifest.workflowEligibility.sourceAnalysis.allowed !==
      false
  ) {
    fail(
      "identity verification requires the exact immutable pre-verification input manifest",
    );
  }

  const boundSourceLocators = [
    ["extraction receipt", extractionReceipt.sourceBinding],
    ["page map", pageMap.sourceBinding],
    [
      "source-analysis input manifest",
      sourceAnalysisInputManifest.sourceBinding,
    ],
  ] as const;
  if (identity.candidateIdentity.candidateLocator.kind === "official_url") {
    const expectedOfficialUrl = identity.candidateIdentity.candidateLocator.url;
    for (const [label, sourceBinding] of boundSourceLocators) {
      if (
        !("officialUrl" in sourceBinding) ||
        sourceBinding.officialUrl !== expectedOfficialUrl
      ) {
        fail(
          `${label} must bind the exact official source locator from the identity candidate`,
        );
      }
    }
  } else {
    const expectedPrivateLocator =
      identity.candidateIdentity.candidateLocator.locator;
    for (const [label, sourceBinding] of boundSourceLocators) {
      if (
        !("controlledPrivateLocator" in sourceBinding) ||
        sourceBinding.controlledPrivateLocator !== expectedPrivateLocator
      ) {
        fail(
          `${label} must bind the exact controlled private locator from the identity candidate`,
        );
      }
    }
  }

  for (const anchor of identity.evidenceAnchors) {
    if (!["cover_page", "bibliographic_page"].includes(anchor.evidenceType)) {
      continue;
    }
    const match = /^page:(\d+)$/.exec(anchor.locator);
    if (!match) fail(`${anchor.evidenceType} anchor must use page:<number>`);
    const pageNumber = Number(match[1]);
    const page = sourceAnalysisInputManifest.pages.find(
      (item) => item.pageNumber === pageNumber,
    );
    if (
      !page ||
      anchor.evidenceSha256 !== `sha256:${page.normalizedText.sha256}`
    ) {
      fail(
        `${anchor.evidenceType} anchor does not bind the exact normalized page`,
      );
    }
  }

  const workflowBytes = artifactFileBytes(bundle.workflowFile);
  const workflowText = new TextDecoder("utf-8", { fatal: true }).decode(
    workflowBytes,
  );
  const firstRun = identity.aiExecution.runs[0]!;
  const promptTemplateBytes = artifactFileBytes(bundle.promptTemplateFile);
  const promptTemplateText = new TextDecoder("utf-8", { fatal: true }).decode(
    promptTemplateBytes,
  );
  if (
    bundle.workflowFile.path !== SOURCE_IDENTITY_WORKFLOW_PATH ||
    sourceIdentitySha256(workflowBytes) !== firstRun.workflowFileSha256 ||
    !workflowText.includes(`Workflow ID: \`${SOURCE_IDENTITY_WORKFLOW_ID}\``) ||
    !workflowText.includes(
      `Workflow version: \`${SOURCE_IDENTITY_WORKFLOW_VERSION}\``,
    )
  ) {
    fail("workflow bytes do not match the exact identity workflow binding");
  }
  if (
    Date.parse(acquisition.acquisitionReceipt.completedAt) >
    Date.parse(firstRun.startedAt)
  ) {
    fail("source acquisition completed after the first AI run started");
  }
  if (
    bundle.promptTemplateFile.path !== SOURCE_IDENTITY_PROMPT_TEMPLATE_PATH ||
    sourceIdentitySha256(promptTemplateBytes) !==
      firstRun.promptTemplateSha256 ||
    !promptTemplateText.includes(SOURCE_IDENTITY_WORKFLOW_ID)
  ) {
    fail(
      "prompt-template bytes do not match the exact identity prompt binding",
    );
  }

  return {
    ...acquisition,
    extractionReceipt,
    pageMap,
    sourceAnalysisInputManifest,
    workflowValidated: true,
    completeInputEvidenceValidated: true,
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

export function requireVerifiedSourceIdentityWithEvidenceBundle(
  identityValue: unknown,
  bundle: SourceIdentityVerificationEvidenceBundle,
): SourceIdentityEvidenceBundleValidation & {
  identity: SourceIdentityVerificationArtifact & {
    decision: z.infer<typeof verifiedDecisionSchema>;
  };
} {
  const validated = validateSourceIdentityVerificationWithEvidenceBundle(
    identityValue,
    bundle,
  );
  if (validated.identity.decision.state !== "verified") {
    fail(
      `identity decision ${validated.identity.decision.state} cannot establish verified identity`,
    );
  }
  return validated as SourceIdentityEvidenceBundleValidation & {
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
