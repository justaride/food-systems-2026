import { createHash } from "node:crypto";

import { z } from "zod";

export const CORPUS_BASELINE_ROW_HASH_DOMAIN =
  "food-systems/corpus-baseline-row/v1\n" as const;
export const CORPUS_LIFECYCLE_STATE_HASH_DOMAIN =
  "food-systems/corpus-lifecycle-state/v1\n" as const;
export const CORPUS_LIFECYCLE_RECEIPT_HASH_DOMAIN =
  "food-systems/corpus-lifecycle-receipt/v1\n" as const;

export type CorpusCanonicalJsonValue =
  | null
  | boolean
  | number
  | string
  | CorpusCanonicalJsonValue[]
  | { [key: string]: CorpusCanonicalJsonValue };

export function canonicalCorpusJson(value: CorpusCanonicalJsonValue): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalCorpusJson(item)).join(",")}]`;
  }
  return `{${Object.keys(value)
    .sort()
    .map(
      (key) =>
        `${JSON.stringify(key)}:${canonicalCorpusJson(value[key] as CorpusCanonicalJsonValue)}`,
    )
    .join(",")}}`;
}

function domainSeparatedCorpusSha256(
  domain: string,
  value: CorpusCanonicalJsonValue,
): string {
  return `sha256:${createHash("sha256")
    .update(domain)
    .update(canonicalCorpusJson(value))
    .digest("hex")}`;
}

export function hashCorpusBaselineRow(value: CorpusCanonicalJsonValue): string {
  return domainSeparatedCorpusSha256(CORPUS_BASELINE_ROW_HASH_DOMAIN, value);
}

export const CORPUS_SOURCE_ROLES = [
  "primary_evidence",
  "internal_synthesis",
  "generated_projection",
  "operational_control",
  "unknown",
] as const;

export const CORPUS_PROJECT_OWNER = {
  reviewerId: "person.gabriel_freeman",
  name: "Gabriel Freeman",
} as const;

export const CORPUS_AI_PROCESSING_STAGES = [
  "inventory",
  "triage",
  "full_text",
  "locator",
  "claims",
  "cross_check",
  "ready_for_owner",
] as const;

export const CORPUS_AI_MODEL_VERSION_NOT_EXPOSED =
  "runtime_not_exposed" as const;

export const CORPUS_OWNER_REVIEW_STATES = [
  "not_requested",
  "pending",
  "approved_internal",
  "changes_requested",
  "rejected",
] as const;

export const CORPUS_INDEPENDENT_VALIDATION_STATES = [
  "not_requested",
  "pending",
  "not_applicable",
  "validated",
  "validated_with_conditions",
  "changes_requested",
  "rejected",
] as const;

export const CORPUS_PARTNER_VALIDATION_STATES = [
  "not_requested",
  "pending",
  "not_applicable",
  "validated",
  "validated_with_conditions",
  "changes_requested",
  "rejected",
] as const;

export const CORPUS_RIGHTS_HOLDER_VALIDATION_STATES = [
  "not_requested",
  "pending",
  "not_applicable",
  "validated",
  "validated_with_conditions",
  "changes_requested",
  "rejected",
] as const;

export const CORPUS_RIGHTS_STATES = [
  "unknown",
  "pending_review",
  "restricted",
  "cleared_internal_use",
  "cleared_external_publication",
  "public_domain",
] as const;

export const CORPUS_PUBLICATION_STATES = [
  "internal_only",
  "external_candidate",
  "publishable",
  "published",
] as const;

export const CORPUS_COVERAGE_STATES = [
  "not_assessed",
  "candidate",
  "approved_for_promotion",
  "promoted",
] as const;

const sha256Schema = z.string().regex(/^sha256:[a-f0-9]{64}$/);
const identifierSchema = z.string().regex(/^[a-z0-9][a-z0-9._:-]*$/);
const dateTimeSchema = z
  .string()
  .refine(
    (value) =>
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(
        value,
      ) && Number.isFinite(Date.parse(value)),
    "Expected an ISO 8601 date-time with an explicit UTC offset",
  );
const sourceRoleSchema = z.enum(CORPUS_SOURCE_ROLES);
const aiStageSchema = z.enum(CORPUS_AI_PROCESSING_STAGES);

const corpusScopeSchema = z
  .object({
    geographyIds: z.array(identifierSchema),
    materialProfileIds: z.array(identifierSchema),
    intendedUseProfileIds: z.array(identifierSchema).min(1),
  })
  .strict();

const sourceIdentitySchema = z
  .object({
    sourceId: identifierSchema,
    title: z.string().min(1),
    sourceRole: sourceRoleSchema,
    identityKind: z.enum([
      "url",
      "doi",
      "isbn",
      "repository_path",
      "database_record",
      "generated_artifact",
      "other",
      "unknown",
    ]),
    canonicalIdentity: z.string().min(1),
    identityStatus: z.enum(["unknown", "provisional", "verified"]),
    metadataSha256: sha256Schema,
    contentSha256: sha256Schema.nullable(),
    contentHashEvidenceState: z.enum([
      "repository_file_verified",
      "private_capture_attestation_recorded",
      "private_live_verified",
      "unavailable",
    ]),
    contentHashVerifiedAt: dateTimeSchema.nullable(),
  })
  .strict();

const fileAvailabilitySchema = z
  .object({
    state: z.enum([
      "available",
      "remote_only",
      "missing",
      "blocked",
      "not_applicable",
    ]),
    locator: z.string().min(1).nullable(),
    mediaType: z.string().min(1).nullable(),
    sizeBytes: z.number().int().positive().nullable(),
    observedAt: dateTimeSchema,
  })
  .strict();

const textAvailabilitySchema = z
  .object({
    state: z.enum([
      "unavailable",
      "metadata_only",
      "partial_text",
      "full_text",
      "structured_content",
      "blocked",
      "not_applicable",
    ]),
    textSha256: sha256Schema.nullable(),
    characterCount: z.number().int().positive().nullable(),
    extractionMethod: z
      .enum(["born_digital", "ocr", "api", "manual", "generated"])
      .nullable(),
    observedAt: dateTimeSchema,
  })
  .strict();

const aiRunCheckpointSchema = z
  .object({
    stage: aiStageSchema,
    inputSha256: sha256Schema,
    outputSha256: sha256Schema,
    completedAt: dateTimeSchema,
  })
  .strict();

export const corpusAiRunSchema = z
  .object({
    runId: identifierSchema,
    provider: z.string().min(1),
    model: z.string().min(1),
    modelVersionState: z.enum(["exact", "runtime_not_exposed"]),
    modelVersion: z.string().min(1),
    workflowRef: z.string().min(1),
    stages: z.array(aiStageSchema).min(1),
    checkpoints: z.array(aiRunCheckpointSchema).min(1),
    inputSha256: sha256Schema,
    outputSha256: sha256Schema,
    timeEvidence: z.enum(["provider_exact", "coordinator_observed_window"]),
    timeEvidenceExplanation: z.string().min(20),
    startedAt: dateTimeSchema,
    completedAt: dateTimeSchema,
  })
  .strict()
  .superRefine((run, context) => {
    const usesSentinel =
      run.modelVersion === CORPUS_AI_MODEL_VERSION_NOT_EXPOSED;
    if (run.modelVersionState === "runtime_not_exposed" && !usesSentinel) {
      context.addIssue({
        code: "custom",
        path: ["modelVersion"],
        message: `runtime_not_exposed model version state requires ${CORPUS_AI_MODEL_VERSION_NOT_EXPOSED} sentinel`,
      });
    }
    if (run.modelVersionState === "exact" && usesSentinel) {
      context.addIssue({
        code: "custom",
        path: ["modelVersion"],
        message: `exact model version state cannot use ${CORPUS_AI_MODEL_VERSION_NOT_EXPOSED} sentinel`,
      });
    }
  });

const aiAssistanceProvenanceSchema = z
  .object({
    used: z.boolean(),
    runs: z.array(corpusAiRunSchema),
  })
  .strict();

export const corpusStageEvidenceSchema = z
  .object({
    stage: aiStageSchema,
    method: z.enum(["deterministic_inventory", "ai_assisted"]),
    runId: identifierSchema.nullable(),
    checkpointIndex: z.number().int().nonnegative().nullable(),
    artifactId: identifierSchema,
    artifactVersion: z.string().min(1),
    outputSha256: sha256Schema,
    completedAt: dateTimeSchema,
  })
  .strict();

const aiProcessingStatusSchema = z
  .object({
    currentStage: aiStageSchema,
    state: z.enum(["not_started", "in_progress", "blocked", "complete"]),
    completedStages: z.array(aiStageSchema),
    stageEvidence: z.array(corpusStageEvidenceSchema),
    updatedAt: dateTimeSchema,
  })
  .strict();

const humanAttestationAuthenticationSchema = z.discriminatedUnion("state", [
  z
    .object({
      state: z.literal("verified"),
      method: z.enum([
        "controlled_project_identity",
        "cryptographic_signature",
        "verified_external_identity",
      ]),
      evidenceSha256: sha256Schema,
      authenticatedAt: dateTimeSchema,
    })
    .strict(),
  z
    .object({
      state: z.literal("self_asserted_unverified"),
      method: z.literal("self_asserted"),
      evidenceSha256: z.null(),
      authenticatedAt: z.null(),
    })
    .strict(),
]);

export const corpusNamedReviewerSchema = z
  .object({
    reviewerType: z.literal("named_human"),
    reviewerId: identifierSchema,
    name: z.string().min(2),
    role: z.enum([
      "project_owner",
      "independent_subject_matter_expert",
      "independent_method_reviewer",
      "validation_scope_authority",
      "partner_representative",
      "rights_holder_representative",
      "rights_reviewer",
      "publication_authority",
      "privacy_reviewer",
      "safety_reviewer",
      "legal_reviewer",
      "coverage_steward",
    ]),
    organization: z.string().min(1).nullable(),
    authentication: humanAttestationAuthenticationSchema,
  })
  .strict();

const coverageAssessorSchema = z.discriminatedUnion("assessorType", [
  z
    .object({
      assessorType: z.literal("named_human"),
      assessorId: identifierSchema,
      name: z.string().min(2),
      role: z.literal("coverage_steward"),
      organization: z.string().min(1).nullable(),
      authentication: humanAttestationAuthenticationSchema,
    })
    .strict(),
  z
    .object({
      assessorType: z.literal("machine_assessor"),
      assessorId: identifierSchema,
      executionMode: z.enum(["deterministic", "ai_assisted"]),
      workflowRef: z.string().min(1),
      workflowVersion: z.string().min(1),
      outputSha256: sha256Schema,
    })
    .strict(),
]);

const coverageAssessorAuthorizationSchema = z
  .object({
    readinessProfileId: identifierSchema,
    assessorType: z.enum(["named_human", "machine_assessor"]),
    assessorId: identifierSchema,
    authorizationSha256: sha256Schema,
  })
  .strict();

const receiptBindingSchema = z
  .object({
    lifecycleRecordId: identifierSchema,
    sourceId: identifierSchema,
    sourceMetadataSha256: sha256Schema,
    sourceContentSha256: sha256Schema.nullable(),
    artifactId: identifierSchema,
    artifactVersion: z.string().min(1),
    artifactSha256: sha256Schema,
    geographyIds: z.array(identifierSchema),
    materialProfileIds: z.array(identifierSchema),
    intendedUseProfileIds: z.array(identifierSchema).min(1),
  })
  .strict();

const receiptEvidenceCore = {
  receiptId: identifierSchema,
  receiptSha256: sha256Schema,
  reviewedAt: dateTimeSchema,
  binding: receiptBindingSchema,
  limitations: z.array(z.string().min(1)),
};

const receiptCore = {
  ...receiptEvidenceCore,
  reviewer: corpusNamedReviewerSchema,
};

const ownerReviewReceiptSchema = z
  .object({
    ...receiptCore,
    decision: z.enum(["approved_internal", "changes_requested", "rejected"]),
    aiAssistanceDisclosure: z
      .object({
        used: z.boolean(),
        runIds: z.array(identifierSchema),
        statement: z.string().min(10),
      })
      .strict(),
  })
  .strict();

export const corpusSourceRoleConfirmationReceiptSchema = z
  .object({
    ...receiptCore,
    decision: z.literal("confirmed_source_role"),
    confirmedRole: sourceRoleSchema.exclude(["unknown"]),
    classificationBasis: z.string().min(10),
  })
  .strict();

const independentValidationReceiptSchema = z
  .object({
    ...receiptCore,
    decision: z.enum([
      "validated",
      "validated_with_conditions",
      "changes_requested",
      "rejected",
    ]),
    independenceStatement: z.string().min(10),
    qualifications: z
      .array(
        z
          .object({
            qualificationId: identifierSchema,
            title: z.string().min(2),
            issuingBody: z.string().min(2),
            scopeStatement: z.string().min(10),
            evidenceSha256: sha256Schema,
          })
          .strict(),
      )
      .min(1),
    conflictOfInterest: z.enum(["none_declared", "declared_managed"]),
    conflictNote: z.string().min(1).nullable(),
  })
  .strict();

const validationRequirementReceiptSchema = z
  .object({
    ...receiptCore,
    decision: z.literal("independent_validation_not_required"),
    requirementProfileId: identifierSchema,
    rationale: z.string().min(10),
  })
  .strict();

const partnerRequirementReceiptSchema = z
  .object({
    ...receiptCore,
    decision: z.literal("partner_validation_not_required"),
    requirementProfileId: identifierSchema,
    rationale: z.string().min(10),
  })
  .strict();

const rightsHolderRequirementReceiptSchema = z
  .object({
    ...receiptCore,
    decision: z.literal("rights_holder_validation_not_required"),
    requirementProfileId: identifierSchema,
    rationale: z.string().min(10),
  })
  .strict();

const partnerValidationReceiptSchema = z
  .object({
    ...receiptCore,
    decision: z.enum([
      "validated",
      "validated_with_conditions",
      "changes_requested",
      "rejected",
    ]),
    partnerId: identifierSchema,
    scopeStatement: z.string().min(10),
    authorityStatement: z.string().min(10),
  })
  .strict();

const rightsHolderValidationReceiptSchema = z
  .object({
    ...receiptCore,
    decision: z.enum([
      "validated",
      "validated_with_conditions",
      "changes_requested",
      "rejected",
    ]),
    rightsHolderId: identifierSchema,
    scopeStatement: z.string().min(10),
    authority: z
      .object({
        basis: z.enum(["rights_holder_self_authority", "delegated_mandate"]),
        statement: z.string().min(10),
        mandateEvidenceSha256: sha256Schema.nullable(),
      })
      .strict(),
    consentBasis: z.string().min(10),
    dataGovernanceBasis: z.string().min(10),
  })
  .strict();

const rightsReviewReceiptSchema = z
  .object({
    ...receiptCore,
    decision: z.enum([
      "restricted",
      "cleared_internal_use",
      "cleared_external_publication",
      "public_domain",
    ]),
    authority: z
      .object({
        basis: z.enum([
          "license",
          "permission",
          "statutory_internal_use",
          "public_domain_determination",
          "restriction_notice",
        ]),
        name: z.string().min(2),
        locator: z.string().min(1),
        jurisdiction: z.string().min(2).nullable(),
        evidenceSha256: sha256Schema,
      })
      .strict(),
  })
  .strict();

const publicationApprovalReceiptSchema = z
  .object({
    ...receiptCore,
    decision: z.literal("approved_for_external_publication"),
    audience: z.string().min(2),
    channel: z.string().min(2),
  })
  .strict();

const publicationIndependentGateReceiptSchema = z
  .object({
    ...receiptCore,
    gateId: z.enum(["privacy", "safety", "legal"]),
    decision: z.enum([
      "approved",
      "approved_with_conditions",
      "blocked",
      "not_required",
    ]),
    requirementProfileId: identifierSchema,
    rationale: z.string().min(10),
  })
  .strict();

const coverageApprovalReceiptSchema = z
  .object({
    ...receiptEvidenceCore,
    assessor: coverageAssessorSchema,
    assessorAuthorization: coverageAssessorAuthorizationSchema,
    decision: z.literal("approved_for_coverage_promotion"),
    coverageCellIds: z.array(identifierSchema).min(1),
    readinessProfileId: identifierSchema,
    evidenceSnapshotSha256: sha256Schema,
    assessmentId: identifierSchema,
    assessmentVersion: z.string().min(1),
    assessmentSha256: sha256Schema,
    applicableReviewReceiptIds: z.array(identifierSchema).min(1),
  })
  .strict();

const ownerReviewStatusSchema = z
  .object({
    state: z.enum(CORPUS_OWNER_REVIEW_STATES),
    receipt: ownerReviewReceiptSchema.nullable(),
    updatedAt: dateTimeSchema,
  })
  .strict();

const sourceRoleConfirmationStatusSchema = z
  .object({
    state: z.enum(["unknown", "machine_provisional", "owner_confirmed"]),
    receipt: corpusSourceRoleConfirmationReceiptSchema.nullable(),
    updatedAt: dateTimeSchema,
  })
  .strict();

const independentValidationStatusSchema = z
  .object({
    requirement: z.enum(["undetermined", "required", "not_required"]),
    requirementProfileId: identifierSchema.nullable(),
    requirementRationale: z.string().min(10).nullable(),
    requirementReceipt: validationRequirementReceiptSchema.nullable(),
    state: z.enum(CORPUS_INDEPENDENT_VALIDATION_STATES),
    receipt: independentValidationReceiptSchema.nullable(),
    updatedAt: dateTimeSchema,
  })
  .strict();

const partnerValidationStatusSchema = z
  .object({
    requirement: z.enum(["undetermined", "required", "not_required"]),
    requirementProfileId: identifierSchema.nullable(),
    requirementRationale: z.string().min(10).nullable(),
    requirementReceipt: partnerRequirementReceiptSchema.nullable(),
    state: z.enum(CORPUS_PARTNER_VALIDATION_STATES),
    receipt: partnerValidationReceiptSchema.nullable(),
    updatedAt: dateTimeSchema,
  })
  .strict();

const rightsHolderValidationStatusSchema = z
  .object({
    requirement: z.enum(["undetermined", "required", "not_required"]),
    requirementProfileId: identifierSchema.nullable(),
    requirementRationale: z.string().min(10).nullable(),
    requirementReceipt: rightsHolderRequirementReceiptSchema.nullable(),
    state: z.enum(CORPUS_RIGHTS_HOLDER_VALIDATION_STATES),
    receipt: rightsHolderValidationReceiptSchema.nullable(),
    updatedAt: dateTimeSchema,
  })
  .strict();

const rightsStatusSchema = z
  .object({
    state: z.enum(CORPUS_RIGHTS_STATES),
    receipt: rightsReviewReceiptSchema.nullable(),
    updatedAt: dateTimeSchema,
  })
  .strict();

const publicationIndependentGateStatusSchema = z
  .object({
    requirement: z.enum(["undetermined", "required", "not_required"]),
    requirementProfileId: identifierSchema.nullable(),
    requirementRationale: z.string().min(10).nullable(),
    state: z.enum([
      "not_requested",
      "pending",
      "approved",
      "approved_with_conditions",
      "not_applicable",
      "blocked",
    ]),
    receipt: publicationIndependentGateReceiptSchema.nullable(),
    updatedAt: dateTimeSchema,
  })
  .strict();

const publicationStatusSchema = z
  .object({
    state: z.enum(CORPUS_PUBLICATION_STATES),
    externalUseAllowed: z.boolean(),
    independentGates: z
      .object({
        privacy: publicationIndependentGateStatusSchema,
        safety: publicationIndependentGateStatusSchema,
        legal: publicationIndependentGateStatusSchema,
      })
      .strict(),
    approvalReceipt: publicationApprovalReceiptSchema.nullable(),
    publicLocator: z.string().min(1).nullable(),
    publishedAt: dateTimeSchema.nullable(),
    updatedAt: dateTimeSchema,
  })
  .strict();

const coverageStatusSchema = z
  .object({
    state: z.enum(CORPUS_COVERAGE_STATES),
    coveragePromotionAllowed: z.boolean(),
    approvalReceipt: coverageApprovalReceiptSchema.nullable(),
    coverageCellIds: z.array(identifierSchema),
    promotedAt: dateTimeSchema.nullable(),
    updatedAt: dateTimeSchema,
  })
  .strict();

const openIssueSchema = z
  .object({
    issueId: identifierSchema,
    category: z.enum([
      "identity",
      "availability",
      "ai_processing",
      "owner_review",
      "independent_validation",
      "rights",
      "publication",
      "coverage",
      "method",
      "boundary",
      "contradiction",
      "other",
    ]),
    severity: z.enum(["information", "warning", "blocking"]),
    summary: z.string().min(1),
    openedAt: dateTimeSchema,
    assignedTo: corpusNamedReviewerSchema.nullable(),
    evidenceRefs: z.array(z.string().min(1)),
  })
  .strict();

export const corpusLifecycleRecordSchema = z
  .object({
    schemaVersion: z.literal("corpus-processing-lifecycle-v1"),
    recordId: identifierSchema,
    scope: corpusScopeSchema,
    sourceIdentity: sourceIdentitySchema,
    fileAvailability: fileAvailabilitySchema,
    textAvailability: textAvailabilitySchema,
    aiAssistanceProvenance: aiAssistanceProvenanceSchema,
    aiProcessingStatus: aiProcessingStatusSchema,
    sourceRoleConfirmationStatus: sourceRoleConfirmationStatusSchema,
    ownerReviewStatus: ownerReviewStatusSchema,
    independentValidationStatus: independentValidationStatusSchema,
    partnerValidationStatus: partnerValidationStatusSchema,
    rightsHolderValidationStatus: rightsHolderValidationStatusSchema,
    rightsStatus: rightsStatusSchema,
    publicationStatus: publicationStatusSchema,
    coverageStatus: coverageStatusSchema,
    openIssues: z.array(openIssueSchema),
    createdAt: dateTimeSchema,
    updatedAt: dateTimeSchema,
  })
  .strict();

export type CorpusSourceRole = (typeof CORPUS_SOURCE_ROLES)[number];
export type CorpusAiProcessingStage =
  (typeof CORPUS_AI_PROCESSING_STAGES)[number];
export type CorpusLifecycleRecord = z.infer<typeof corpusLifecycleRecordSchema>;
export type CorpusLifecycleOpenIssue =
  CorpusLifecycleRecord["openIssues"][number];
export type CorpusNamedReviewer = z.infer<typeof corpusNamedReviewerSchema>;

export function hashCorpusLifecycleState(
  record: CorpusLifecycleRecord,
): string {
  return domainSeparatedCorpusSha256(
    CORPUS_LIFECYCLE_STATE_HASH_DOMAIN,
    record as unknown as CorpusCanonicalJsonValue,
  );
}

export function hashCorpusLifecycleReceipt(
  receipt: Record<string, unknown>,
): string {
  const { receiptSha256: _receiptSha256, ...body } = receipt;
  return domainSeparatedCorpusSha256(
    CORPUS_LIFECYCLE_RECEIPT_HASH_DOMAIN,
    body as CorpusCanonicalJsonValue,
  );
}

export function sealCorpusLifecycleReceipt<T extends Record<string, unknown>>(
  body: T,
): T & { receiptSha256: string } {
  const { receiptSha256: _receiptSha256, ...unsealed } = body;
  return {
    ...unsealed,
    receiptSha256: domainSeparatedCorpusSha256(
      CORPUS_LIFECYCLE_RECEIPT_HASH_DOMAIN,
      unsealed as CorpusCanonicalJsonValue,
    ),
  } as T & { receiptSha256: string };
}

export type BuildInitialCorpusLifecycleInput = {
  recordId: string;
  sourceId: string;
  title: string;
  sourceRole: CorpusSourceRole;
  identityKind: CorpusLifecycleRecord["sourceIdentity"]["identityKind"];
  canonicalIdentity: string;
  identityStatus?: CorpusLifecycleRecord["sourceIdentity"]["identityStatus"];
  metadataSha256: string;
  contentSha256?: string | null;
  contentHashEvidenceState?: CorpusLifecycleRecord["sourceIdentity"]["contentHashEvidenceState"];
  contentHashVerifiedAt?: string | null;
  observedAt: string;
  geographyIds?: string[];
  materialProfileIds?: string[];
  intendedUseProfileIds?: string[];
  fileAvailable: boolean;
  fileLocator?: string | null;
  mediaType?: string | null;
  fileSizeBytes?: number | null;
  openIssues?: CorpusLifecycleOpenIssue[];
};

export type CorpusLifecyclePermissions = {
  aiReadyForOwnerReview: boolean;
  sourceRoleOwnerConfirmed: boolean;
  ownerApprovedForInternalUse: boolean;
  independentlyValidated: boolean;
  independentValidationRequirementSatisfied: boolean;
  partnerValidated: boolean;
  partnerValidationRequirementSatisfied: boolean;
  rightsHolderValidated: boolean;
  rightsHolderValidationRequirementSatisfied: boolean;
  rightsClearedForInternalUse: boolean;
  rightsClearedForExternalPublication: boolean;
  publicationIndependentGatesSatisfied: boolean;
  externalUseAllowed: boolean;
  coveragePromotionAllowed: boolean;
  blockers: string[];
};

function fail(message: string): never {
  throw new Error(`Corpus processing lifecycle invalid: ${message}`);
}

function timestamp(value: string, label: string): number {
  const parsed = Date.parse(value);
  if (!Number.isFinite(parsed)) fail(`${label} is not a valid date-time`);
  return parsed;
}

function assertUnique(values: readonly string[], label: string) {
  if (new Set(values).size !== values.length) fail(`${label} must be unique`);
}

function reviewerRole(
  receipt: { reviewer: CorpusNamedReviewer },
  allowedRoles: readonly CorpusNamedReviewer["role"][],
  label: string,
) {
  if (receipt.reviewer.authentication.state !== "verified") {
    fail(`${label} reviewer identity is self-asserted and not authenticated`);
  }
  if (!allowedRoles.includes(receipt.reviewer.role)) {
    fail(
      `${label} must bind a named reviewer with role ${allowedRoles.join(" or ")}`,
    );
  }
}

type ReceiptBinding = z.infer<typeof receiptBindingSchema>;

function validateReceiptBinding(
  record: CorpusLifecycleRecord,
  receipt: {
    binding: ReceiptBinding;
    limitations: string[];
    receiptSha256: string;
    [key: string]: unknown;
  },
  label: string,
) {
  const { binding } = receipt;
  assertUnique(receipt.limitations, `${label} limitations`);
  if (
    binding.lifecycleRecordId !== record.recordId ||
    binding.sourceId !== record.sourceIdentity.sourceId ||
    binding.sourceMetadataSha256 !== record.sourceIdentity.metadataSha256 ||
    binding.sourceContentSha256 !== record.sourceIdentity.contentSha256
  ) {
    fail(`${label} does not bind the exact lifecycle record and source hashes`);
  }
  for (const [scopeLabel, actual, expected] of [
    ["geographyIds", binding.geographyIds, record.scope.geographyIds],
    [
      "materialProfileIds",
      binding.materialProfileIds,
      record.scope.materialProfileIds,
    ],
    [
      "intendedUseProfileIds",
      binding.intendedUseProfileIds,
      record.scope.intendedUseProfileIds,
    ],
  ] as const) {
    assertUnique(actual, `${label} ${scopeLabel}`);
    if (JSON.stringify(actual) !== JSON.stringify(expected)) {
      fail(`${label} does not bind the exact ${scopeLabel}`);
    }
  }
}

function validateReceiptSeals(record: CorpusLifecycleRecord): void {
  for (const [label, receipt] of [
    ["source-role confirmation", record.sourceRoleConfirmationStatus.receipt],
    ["owner review", record.ownerReviewStatus.receipt],
    [
      "independent-validation requirement",
      record.independentValidationStatus.requirementReceipt,
    ],
    ["independent validation", record.independentValidationStatus.receipt],
    [
      "partner-validation requirement",
      record.partnerValidationStatus.requirementReceipt,
    ],
    ["partner validation", record.partnerValidationStatus.receipt],
    [
      "rights-holder-validation requirement",
      record.rightsHolderValidationStatus.requirementReceipt,
    ],
    ["rights-holder validation", record.rightsHolderValidationStatus.receipt],
    ["rights clearance", record.rightsStatus.receipt],
    [
      "privacy publication gate",
      record.publicationStatus.independentGates.privacy.receipt,
    ],
    [
      "safety publication gate",
      record.publicationStatus.independentGates.safety.receipt,
    ],
    [
      "legal publication gate",
      record.publicationStatus.independentGates.legal.receipt,
    ],
    ["publication approval", record.publicationStatus.approvalReceipt],
    ["coverage approval", record.coverageStatus.approvalReceipt],
  ] as const) {
    if (!receipt) continue;
    if (
      receipt.receiptSha256 !==
      hashCorpusLifecycleReceipt(receipt as unknown as Record<string, unknown>)
    ) {
      fail(
        `${label} receiptSha256 does not seal its exact canonical receipt body`,
      );
    }
  }
}

function validateAvailability(record: CorpusLifecycleRecord) {
  const {
    fileAvailability: file,
    textAvailability: text,
    sourceIdentity: source,
  } = record;

  if (
    file.state === "available" &&
    (file.locator === null || file.mediaType === null)
  ) {
    fail("available file must have a locator and media type");
  }
  if (file.state === "remote_only" && file.locator === null) {
    fail("remote-only file must have a locator");
  }
  if (
    ["unavailable", "blocked", "not_applicable"].includes(text.state) &&
    (text.textSha256 !== null ||
      text.characterCount !== null ||
      text.extractionMethod !== null)
  ) {
    fail(`${text.state} text must not carry extracted-text evidence`);
  }
  if (
    ["partial_text", "full_text", "structured_content"].includes(text.state) &&
    (text.textSha256 === null ||
      text.characterCount === null ||
      text.extractionMethod === null)
  ) {
    fail(
      `${text.state} must bind a text hash, character count, and extraction method`,
    );
  }
  if (
    (source.contentSha256 === null) !==
    (source.contentHashVerifiedAt === null)
  ) {
    fail(
      "source content hash and verification timestamp must be present together",
    );
  }
  if (
    source.contentSha256 === null &&
    source.contentHashEvidenceState !== "unavailable"
  ) {
    fail(
      "source bytes without a content hash must use unavailable content-hash evidence state",
    );
  }
  if (
    source.contentSha256 !== null &&
    source.contentHashEvidenceState === "unavailable"
  ) {
    fail("available content hash must name its exact evidence state");
  }
  if (
    source.contentHashEvidenceState === "repository_file_verified" &&
    file.state !== "available"
  ) {
    fail(
      "repository-file-verified content hash requires an available repository file",
    );
  }
  if (
    ["private_capture_attestation_recorded", "private_live_verified"].includes(
      source.contentHashEvidenceState,
    ) &&
    file.state === "available"
  ) {
    fail(
      "private content-hash evidence state cannot masquerade as repository-file verification",
    );
  }
  if (
    source.identityKind === "unknown" &&
    source.identityStatus !== "unknown"
  ) {
    fail("unknown identity kind cannot be provisional or verified");
  }
}

function validateAiLifecycle(record: CorpusLifecycleRecord) {
  const { aiAssistanceProvenance: provenance, aiProcessingStatus: status } =
    record;
  assertUnique(
    provenance.runs.map((run) => run.runId),
    "AI run IDs",
  );
  assertUnique(status.completedStages, "completed AI stages");
  assertUnique(
    status.stageEvidence.map((item) => item.stage),
    "AI stage evidence",
  );

  if (provenance.used !== provenance.runs.length > 0) {
    fail(
      "AI assistance used flag must exactly match whether AI runs are recorded",
    );
  }

  let previousRunCompletedAt: number | null = null;
  for (const run of provenance.runs) {
    assertUnique(run.stages, `${run.runId} stages`);
    const runStartedAt = timestamp(run.startedAt, `${run.runId}.startedAt`);
    const runCompletedAt = timestamp(
      run.completedAt,
      `${run.runId}.completedAt`,
    );
    if (runStartedAt > runCompletedAt) {
      fail(`${run.runId} completed before it started`);
    }
    if (
      previousRunCompletedAt !== null &&
      runStartedAt < previousRunCompletedAt
    ) {
      fail("AI runs must be chronological and non-overlapping");
    }
    const checkpointStages = run.checkpoints.map(
      (checkpoint) => checkpoint.stage,
    );
    if (JSON.stringify(run.stages) !== JSON.stringify(checkpointStages)) {
      fail(`${run.runId} stages must exactly match its ordered checkpoints`);
    }
    const stageIndexes = run.stages.map((stage) =>
      CORPUS_AI_PROCESSING_STAGES.indexOf(stage),
    );
    if (
      stageIndexes[0] === 0 ||
      stageIndexes.some(
        (stageIndex, index) =>
          index > 0 && stageIndex !== stageIndexes[index - 1] + 1,
      )
    ) {
      fail(
        `${run.runId} checkpoints must cover one contiguous non-inventory stage range`,
      );
    }
    if (
      run.inputSha256 !== run.checkpoints[0]?.inputSha256 ||
      run.outputSha256 !== run.checkpoints.at(-1)?.outputSha256
    ) {
      fail(
        `${run.runId} input and output hashes must bind its first and last checkpoints`,
      );
    }
    let checkpointInputSha256 = run.inputSha256;
    let previousCheckpointCompletedAt = runStartedAt;
    for (const [checkpointIndex, checkpoint] of run.checkpoints.entries()) {
      if (checkpoint.inputSha256 !== checkpointInputSha256) {
        fail(
          `${run.runId} checkpoint ${checkpointIndex} breaks the internal hash chain`,
        );
      }
      const checkpointCompletedAt = timestamp(
        checkpoint.completedAt,
        `${run.runId}.checkpoints.${checkpointIndex}.completedAt`,
      );
      if (
        checkpointCompletedAt < previousCheckpointCompletedAt ||
        checkpointCompletedAt > runCompletedAt
      ) {
        fail(
          `${run.runId} checkpoint times must be ordered inside the declared run window`,
        );
      }
      checkpointInputSha256 = checkpoint.outputSha256;
      previousCheckpointCompletedAt = checkpointCompletedAt;
    }
    previousRunCompletedAt = runCompletedAt;
  }

  const currentIndex = CORPUS_AI_PROCESSING_STAGES.indexOf(status.currentStage);
  const expectedCompletedLength =
    status.state === "complete" ? currentIndex + 1 : currentIndex;
  const expectedCompleted = CORPUS_AI_PROCESSING_STAGES.slice(
    0,
    expectedCompletedLength,
  );
  if (
    JSON.stringify(status.completedStages) !== JSON.stringify(expectedCompleted)
  ) {
    fail(
      "completed AI stages must be the exact contiguous prefix implied by current stage and state",
    );
  }
  if (
    status.state === "not_started" &&
    (status.currentStage !== "inventory" || status.completedStages.length !== 0)
  ) {
    fail(
      "not-started AI processing must begin at inventory with no completed stages",
    );
  }
  if (
    status.stageEvidence.length !== status.completedStages.length ||
    status.stageEvidence.some(
      (item, index) => item.stage !== status.completedStages[index],
    )
  ) {
    fail("stage evidence must bind every completed AI stage in order");
  }

  const completedAiStages = status.completedStages.filter(
    (stage) => stage !== "inventory",
  );
  const runStages = provenance.runs.flatMap((run) => run.stages);
  if (JSON.stringify(runStages) !== JSON.stringify(completedAiStages)) {
    fail(
      "AI runs must exactly partition the completed non-inventory stages in order",
    );
  }

  const runsById = new Map(provenance.runs.map((run) => [run.runId, run]));
  const referencedRunIds = new Set(
    status.stageEvidence
      .map((evidence) => evidence.runId)
      .filter((runId): runId is string => runId !== null),
  );
  for (const run of provenance.runs) {
    if (!referencedRunIds.has(run.runId))
      fail(`${run.runId} is not referenced by completed stage evidence`);
  }
  let expectedInputSha256 = record.sourceIdentity.contentSha256;
  for (const evidence of status.stageEvidence) {
    if (evidence.stage === "inventory") {
      if (
        evidence.method !== "deterministic_inventory" ||
        evidence.runId !== null ||
        evidence.checkpointIndex !== null
      ) {
        fail(
          "inventory evidence must be deterministic and must not masquerade as an AI run",
        );
      }
      if (evidence.outputSha256 !== record.sourceIdentity.metadataSha256) {
        fail("inventory evidence must bind the source metadata hash");
      }
      continue;
    }
    if (
      evidence.method !== "ai_assisted" ||
      evidence.runId === null ||
      evidence.checkpointIndex === null
    ) {
      fail(
        `${evidence.stage} evidence must bind an AI-assisted run checkpoint`,
      );
    }
    const run = runsById.get(evidence.runId);
    const checkpoint = run?.checkpoints[evidence.checkpointIndex];
    if (
      !run ||
      !checkpoint ||
      checkpoint.stage !== evidence.stage ||
      checkpoint.outputSha256 !== evidence.outputSha256 ||
      checkpoint.completedAt !== evidence.completedAt
    ) {
      fail(
        `${evidence.stage} evidence does not bind its exact AI run checkpoint`,
      );
    }
    if (
      expectedInputSha256 === null ||
      checkpoint.inputSha256 !== expectedInputSha256
    ) {
      fail(
        `${evidence.stage} checkpoint input must bind the source or previous stage output hash`,
      );
    }
    if (
      evidence.stage === "full_text" &&
      evidence.outputSha256 !== record.textAvailability.textSha256
    ) {
      fail("full-text stage output must bind the exact extracted-text hash");
    }
    expectedInputSha256 = checkpoint.outputSha256;
  }

  if (
    status.completedStages.includes("full_text") &&
    !["full_text", "structured_content"].includes(record.textAvailability.state)
  ) {
    fail(
      "full-text stage cannot complete without full text or structured content",
    );
  }
  if (
    status.currentStage === "ready_for_owner" &&
    status.state === "complete"
  ) {
    if (
      record.sourceIdentity.identityStatus !== "verified" ||
      record.sourceIdentity.sourceRole === "unknown" ||
      record.sourceRoleConfirmationStatus.state !== "owner_confirmed" ||
      record.sourceIdentity.contentSha256 === null
    ) {
      fail(
        "ready-for-owner status requires verified source identity, owner-confirmed role, and content hash",
      );
    }
  }
}

type ScopedRequirementReceipt = {
  receiptId: string;
  reviewer: CorpusNamedReviewer;
  decision: string;
  requirementProfileId: string;
  rationale: string;
};

type ScopedValidationReceipt = {
  receiptId: string;
  reviewer: CorpusNamedReviewer;
  decision: string;
  limitations: string[];
};

type ScopedValidationStatus = {
  requirement: "undetermined" | "required" | "not_required";
  requirementProfileId: string | null;
  requirementRationale: string | null;
  requirementReceipt: ScopedRequirementReceipt | null;
  state: string;
  receipt: ScopedValidationReceipt | null;
};

type PublicationGateId =
  keyof CorpusLifecycleRecord["publicationStatus"]["independentGates"];

function publicationGateRequirementSatisfied(
  status: CorpusLifecycleRecord["publicationStatus"]["independentGates"][PublicationGateId],
): boolean {
  return (
    (status.requirement === "required" &&
      status.state === "approved" &&
      status.receipt?.decision === "approved") ||
    (status.requirement === "not_required" &&
      status.state === "not_applicable" &&
      status.receipt?.decision === "not_required")
  );
}

function validatePublicationIndependentGate(
  gateId: PublicationGateId,
  status: CorpusLifecycleRecord["publicationStatus"]["independentGates"][PublicationGateId],
) {
  const decisionByState = {
    approved: "approved",
    approved_with_conditions: "approved_with_conditions",
    blocked: "blocked",
    not_applicable: "not_required",
  } as const;
  const expectedDecision =
    decisionByState[status.state as keyof typeof decisionByState];
  if ((expectedDecision !== undefined) !== (status.receipt !== null)) {
    fail(`${gateId} publication-gate decisions require exactly one receipt`);
  }
  if (status.receipt) {
    if (
      status.receipt.gateId !== gateId ||
      status.receipt.decision !== expectedDecision
    ) {
      fail(
        `${gateId} publication-gate receipt must bind the exact gate and decision`,
      );
    }
    const requiredReviewerRole =
      `${gateId}_reviewer` as CorpusNamedReviewer["role"];
    reviewerRole(
      status.receipt,
      status.receipt.decision === "not_required"
        ? ["validation_scope_authority"]
        : [requiredReviewerRole],
      `${gateId} publication-gate receipt`,
    );
    if (
      status.receipt.requirementProfileId !== status.requirementProfileId ||
      status.receipt.rationale !== status.requirementRationale
    ) {
      fail(
        `${gateId} publication-gate receipt must bind the exact profile and rationale`,
      );
    }
    if (
      status.receipt.decision === "approved_with_conditions" &&
      status.receipt.limitations.length === 0
    ) {
      fail(
        `${gateId} approved-with-conditions receipt must record its limitations`,
      );
    }
  }

  if (status.requirement === "undetermined") {
    if (
      status.requirementProfileId !== null ||
      status.requirementRationale !== null ||
      status.state !== "not_requested" ||
      status.receipt !== null
    ) {
      fail(
        `undetermined ${gateId} publication gate must remain unreviewed and unreceipted`,
      );
    }
  } else if (status.requirement === "required") {
    if (
      status.requirementProfileId === null ||
      status.requirementRationale === null ||
      status.state === "not_applicable"
    ) {
      fail(
        `required ${gateId} publication gate must bind a profile, rationale and applicable state`,
      );
    }
  } else if (
    status.requirementProfileId === null ||
    status.requirementRationale === null ||
    status.state !== "not_applicable" ||
    status.receipt === null
  ) {
    fail(`not-required ${gateId} publication gate needs a named scope receipt`);
  }
}

function artifactBindingMatches(
  left: ReceiptBinding,
  right: Pick<
    ReceiptBinding,
    "artifactId" | "artifactVersion" | "artifactSha256"
  >,
): boolean {
  return (
    left.artifactId === right.artifactId &&
    left.artifactVersion === right.artifactVersion &&
    left.artifactSha256 === right.artifactSha256
  );
}

function applicableCoverageReviewReceiptIds(
  record: CorpusLifecycleRecord,
): string[] {
  return [
    record.sourceRoleConfirmationStatus.receipt?.receiptId,
    record.ownerReviewStatus.receipt?.receiptId,
    record.independentValidationStatus.requirementReceipt?.receiptId,
    record.independentValidationStatus.receipt?.receiptId,
    record.partnerValidationStatus.requirementReceipt?.receiptId,
    record.partnerValidationStatus.receipt?.receiptId,
    record.rightsHolderValidationStatus.requirementReceipt?.receiptId,
    record.rightsHolderValidationStatus.receipt?.receiptId,
    record.rightsStatus.receipt?.receiptId,
  ].filter((receiptId): receiptId is string => receiptId !== undefined);
}

function validateScopedValidationAxis(input: {
  label: string;
  status: ScopedValidationStatus;
  requirementReceiptDecision: string;
  reviewerRoles: readonly CorpusNamedReviewer["role"][];
}) {
  const { label, status } = input;
  const decisionStates = [
    "validated",
    "validated_with_conditions",
    "changes_requested",
    "rejected",
  ];
  if (decisionStates.includes(status.state) !== (status.receipt !== null)) {
    fail(
      `${label} decisions require exactly one named receipt; pending states require none`,
    );
  }
  if (status.receipt) {
    reviewerRole(status.receipt, input.reviewerRoles, `${label} receipt`);
    if (status.receipt.decision !== status.state) {
      fail(`${label} receipt decision must match its status`);
    }
    if (
      status.receipt.decision === "validated_with_conditions" &&
      status.receipt.limitations.length === 0
    ) {
      fail(
        `${label} validated-with-conditions receipt must record its limitations`,
      );
    }
  }

  if (status.requirement === "undetermined") {
    if (
      status.requirementProfileId !== null ||
      status.requirementRationale !== null ||
      status.requirementReceipt !== null ||
      status.state !== "not_requested"
    ) {
      fail(
        `undetermined ${label} requirement must remain unreviewed and unreceipted`,
      );
    }
  } else if (status.requirement === "required") {
    if (
      status.requirementProfileId === null &&
      status.requirementRationale === null
    ) {
      fail(`required ${label} must name a requirement profile or rationale`);
    }
    if (
      status.requirementReceipt !== null ||
      status.state === "not_applicable"
    ) {
      fail(`required ${label} cannot use a not-required receipt or state`);
    }
  } else {
    if (
      status.requirementProfileId === null ||
      status.requirementRationale === null ||
      status.requirementReceipt === null ||
      status.state !== "not_applicable" ||
      status.receipt !== null
    ) {
      fail(
        `not-required ${label} needs a named scope receipt and not-applicable state`,
      );
    }
    reviewerRole(
      status.requirementReceipt,
      ["validation_scope_authority"],
      `${label} requirement receipt`,
    );
    if (
      status.requirementReceipt.decision !== input.requirementReceiptDecision ||
      status.requirementReceipt.requirementProfileId !==
        status.requirementProfileId ||
      status.requirementReceipt.rationale !== status.requirementRationale
    ) {
      fail(
        `${label} not-required receipt must bind the exact decision, profile, and rationale`,
      );
    }
  }
}

function validateDecisionReceipts(record: CorpusLifecycleRecord) {
  const roleConfirmation = record.sourceRoleConfirmationStatus;
  if (record.sourceIdentity.sourceRole === "unknown") {
    if (
      roleConfirmation.state !== "unknown" ||
      roleConfirmation.receipt !== null
    ) {
      fail("unknown source role must remain unconfirmed and unreceipted");
    }
  } else if (roleConfirmation.state === "owner_confirmed") {
    if (roleConfirmation.receipt === null)
      fail("owner-confirmed source role requires a receipt");
    reviewerRole(
      roleConfirmation.receipt,
      ["project_owner"],
      "source-role confirmation receipt",
    );
    if (
      roleConfirmation.receipt.reviewer.reviewerId !==
        CORPUS_PROJECT_OWNER.reviewerId ||
      roleConfirmation.receipt.reviewer.name !== CORPUS_PROJECT_OWNER.name ||
      roleConfirmation.receipt.confirmedRole !==
        record.sourceIdentity.sourceRole
    ) {
      fail(
        "source-role confirmation must bind Gabriel and the exact non-unknown role",
      );
    }
  } else if (
    roleConfirmation.state !== "machine_provisional" ||
    roleConfirmation.receipt !== null
  ) {
    fail(
      "known but unconfirmed source role must remain machine-provisional and unreceipted",
    );
  }

  const owner = record.ownerReviewStatus;
  const ownerDecision = [
    "approved_internal",
    "changes_requested",
    "rejected",
  ].includes(owner.state);
  if (ownerDecision !== (owner.receipt !== null)) {
    fail(
      "owner review decisions require exactly one named receipt; pending states require none",
    );
  }
  if (owner.receipt) {
    reviewerRole(owner.receipt, ["project_owner"], "owner review receipt");
    if (
      owner.receipt.reviewer.reviewerId !== CORPUS_PROJECT_OWNER.reviewerId ||
      owner.receipt.reviewer.name !== CORPUS_PROJECT_OWNER.name
    ) {
      fail("owner review receipt must bind the canonical named project owner");
    }
    if (owner.receipt.decision !== owner.state)
      fail("owner receipt decision must match owner status");
    const expectedRunIds = record.aiAssistanceProvenance.runs.map(
      (run) => run.runId,
    );
    if (
      owner.receipt.aiAssistanceDisclosure.used !==
        record.aiAssistanceProvenance.used ||
      JSON.stringify(owner.receipt.aiAssistanceDisclosure.runIds) !==
        JSON.stringify(expectedRunIds)
    ) {
      fail(
        "owner receipt AI-assistance disclosure must bind the exact recorded AI runs",
      );
    }
  }

  const independent = record.independentValidationStatus;
  const independentDecision = [
    "validated",
    "validated_with_conditions",
    "changes_requested",
    "rejected",
  ].includes(independent.state);
  if (independentDecision !== (independent.receipt !== null)) {
    fail(
      "independent validation decisions require exactly one named receipt; pending states require none",
    );
  }
  if (independent.receipt) {
    reviewerRole(
      independent.receipt,
      ["independent_subject_matter_expert", "independent_method_reviewer"],
      "independent validation receipt",
    );
    if (independent.receipt.decision !== independent.state) {
      fail(
        "independent receipt decision must match independent validation status",
      );
    }
    if (
      independent.receipt.decision === "validated_with_conditions" &&
      independent.receipt.limitations.length === 0
    ) {
      fail(
        "independent validated-with-conditions receipt must record its limitations",
      );
    }
    if (
      independent.receipt.conflictOfInterest === "declared_managed" &&
      independent.receipt.conflictNote === null
    ) {
      fail("managed independent-review conflict must include a conflict note");
    }
    if (
      independent.receipt.conflictOfInterest === "none_declared" &&
      independent.receipt.conflictNote !== null
    ) {
      fail(
        "no declared independent-review conflict must not carry a conflict note",
      );
    }
    assertUnique(
      independent.receipt.qualifications.map((item) => item.qualificationId),
      "independent reviewer qualification IDs",
    );
  }

  if (independent.requirement === "undetermined") {
    if (
      independent.requirementProfileId !== null ||
      independent.requirementRationale !== null ||
      independent.requirementReceipt !== null ||
      independent.state !== "not_requested"
    ) {
      fail(
        "undetermined independent-validation requirement must remain unreviewed and unreceipted",
      );
    }
  } else if (independent.requirement === "required") {
    if (
      independent.requirementProfileId === null &&
      independent.requirementRationale === null
    ) {
      fail(
        "required independent validation must name a requirement profile or rationale",
      );
    }
    if (
      independent.requirementReceipt !== null ||
      independent.state === "not_applicable"
    ) {
      fail(
        "required independent validation cannot use a not-required receipt or state",
      );
    }
  } else {
    if (
      independent.requirementProfileId === null ||
      independent.requirementRationale === null ||
      independent.requirementReceipt === null ||
      independent.state !== "not_applicable" ||
      independent.receipt !== null
    ) {
      fail(
        "not-required independent validation needs a named scope receipt and not-applicable state",
      );
    }
    reviewerRole(
      independent.requirementReceipt,
      ["validation_scope_authority"],
      "independent-validation requirement receipt",
    );
    if (
      independent.requirementReceipt.requirementProfileId !==
        independent.requirementProfileId ||
      independent.requirementReceipt.rationale !==
        independent.requirementRationale
    ) {
      fail(
        "not-required receipt must bind the exact requirement profile and rationale",
      );
    }
  }

  const partner = record.partnerValidationStatus;
  validateScopedValidationAxis({
    label: "partner validation",
    status: partner,
    requirementReceiptDecision: "partner_validation_not_required",
    reviewerRoles: ["partner_representative"],
  });

  const rightsHolder = record.rightsHolderValidationStatus;
  validateScopedValidationAxis({
    label: "rights-holder validation",
    status: rightsHolder,
    requirementReceiptDecision: "rights_holder_validation_not_required",
    reviewerRoles: ["rights_holder_representative"],
  });
  if (
    record.scope.geographyIds.includes("geo.sapmi") &&
    rightsHolder.requirement === "not_required"
  ) {
    fail("Sápmi scope cannot waive rights-holder validation");
  }
  if (rightsHolder.receipt) {
    const delegated =
      rightsHolder.receipt.authority.basis === "delegated_mandate";
    if (
      delegated !==
      (rightsHolder.receipt.authority.mandateEvidenceSha256 !== null)
    ) {
      fail(
        "delegated rights-holder authority must bind mandate evidence; self-authority must not",
      );
    }
  }
  if (
    owner.receipt &&
    independent.receipt &&
    owner.receipt.reviewer.reviewerId ===
      independent.receipt.reviewer.reviewerId
  ) {
    fail("project owner cannot self-assert independent expert validation");
  }

  const rights = record.rightsStatus;
  const rightsDecision = [
    "restricted",
    "cleared_internal_use",
    "cleared_external_publication",
    "public_domain",
  ].includes(rights.state);
  if (rightsDecision !== (rights.receipt !== null)) {
    fail(
      "rights decisions require exactly one named receipt; unknown or pending rights require none",
    );
  }
  if (rights.receipt) {
    reviewerRole(rights.receipt, ["rights_reviewer"], "rights review receipt");
    if (rights.receipt.decision !== rights.state)
      fail("rights receipt decision must match rights status");
    if (
      rights.receipt.decision === "restricted" &&
      rights.receipt.limitations.length === 0
    ) {
      fail("restricted rights receipt must record its limitations");
    }
    const basesByDecision = {
      restricted: ["restriction_notice"],
      cleared_internal_use: ["license", "permission", "statutory_internal_use"],
      cleared_external_publication: ["license", "permission"],
      public_domain: ["public_domain_determination"],
    } as const;
    if (
      !(basesByDecision[rights.receipt.decision] as readonly string[]).includes(
        rights.receipt.authority.basis,
      )
    ) {
      fail(`rights authority basis is invalid for ${rights.receipt.decision}`);
    }
  }

  for (const [gateId, status] of [
    ["privacy", record.publicationStatus.independentGates.privacy],
    ["safety", record.publicationStatus.independentGates.safety],
    ["legal", record.publicationStatus.independentGates.legal],
  ] as const) {
    validatePublicationIndependentGate(gateId, status);
  }

  if (
    owner.state === "approved_internal" &&
    !(
      record.aiProcessingStatus.currentStage === "ready_for_owner" &&
      record.aiProcessingStatus.state === "complete"
    )
  ) {
    fail("owner approval requires complete ready-for-owner AI processing");
  }

  const receiptIds = [
    roleConfirmation.receipt?.receiptId,
    owner.receipt?.receiptId,
    independent.requirementReceipt?.receiptId,
    independent.receipt?.receiptId,
    partner.requirementReceipt?.receiptId,
    partner.receipt?.receiptId,
    rightsHolder.requirementReceipt?.receiptId,
    rightsHolder.receipt?.receiptId,
    rights.receipt?.receiptId,
    record.publicationStatus.independentGates.privacy.receipt?.receiptId,
    record.publicationStatus.independentGates.safety.receipt?.receiptId,
    record.publicationStatus.independentGates.legal.receipt?.receiptId,
    record.publicationStatus.approvalReceipt?.receiptId,
    record.coverageStatus.approvalReceipt?.receiptId,
  ].filter((value): value is string => value !== undefined);
  assertUnique(receiptIds, "cross-layer receipt IDs");

  for (const [label, receipt] of [
    ["source-role confirmation receipt", roleConfirmation.receipt],
    ["owner review receipt", owner.receipt],
    [
      "independent-validation requirement receipt",
      independent.requirementReceipt,
    ],
    ["independent validation receipt", independent.receipt],
    ["partner-validation requirement receipt", partner.requirementReceipt],
    ["partner validation receipt", partner.receipt],
    [
      "rights-holder-validation requirement receipt",
      rightsHolder.requirementReceipt,
    ],
    ["rights-holder validation receipt", rightsHolder.receipt],
    ["rights-clearance receipt", rights.receipt],
    [
      "privacy publication-gate receipt",
      record.publicationStatus.independentGates.privacy.receipt,
    ],
    [
      "safety publication-gate receipt",
      record.publicationStatus.independentGates.safety.receipt,
    ],
    [
      "legal publication-gate receipt",
      record.publicationStatus.independentGates.legal.receipt,
    ],
    ["publication receipt", record.publicationStatus.approvalReceipt],
    ["coverage receipt", record.coverageStatus.approvalReceipt],
  ] as const) {
    if (receipt) validateReceiptBinding(record, receipt, label);
  }

  const readyArtifact = record.aiProcessingStatus.stageEvidence.find(
    (evidence) => evidence.stage === "ready_for_owner",
  );
  const readyArtifactBinding = readyArtifact
    ? {
        artifactId: readyArtifact.artifactId,
        artifactVersion: readyArtifact.artifactVersion,
        artifactSha256: readyArtifact.outputSha256,
      }
    : null;
  for (const [label, receipt] of [
    ["owner review receipt", owner.receipt],
    [
      "independent-validation requirement receipt",
      independent.requirementReceipt,
    ],
    ["independent validation receipt", independent.receipt],
    ["partner-validation requirement receipt", partner.requirementReceipt],
    ["partner validation receipt", partner.receipt],
    [
      "rights-holder-validation requirement receipt",
      rightsHolder.requirementReceipt,
    ],
    ["rights-holder validation receipt", rightsHolder.receipt],
    ["rights-clearance receipt", rights.receipt],
    [
      "privacy publication-gate receipt",
      record.publicationStatus.independentGates.privacy.receipt,
    ],
    [
      "safety publication-gate receipt",
      record.publicationStatus.independentGates.safety.receipt,
    ],
    [
      "legal publication-gate receipt",
      record.publicationStatus.independentGates.legal.receipt,
    ],
    ["publication receipt", record.publicationStatus.approvalReceipt],
  ] as const) {
    if (!receipt) continue;
    if (
      !readyArtifactBinding ||
      !artifactBindingMatches(receipt.binding, readyArtifactBinding)
    ) {
      fail(
        `${label} must bind the exact ready-for-owner artifact ID, version and hash`,
      );
    }
  }
}

function validateReceiptTimes(record: CorpusLifecycleRecord) {
  const topUpdated = timestamp(record.updatedAt, "updatedAt");
  if (timestamp(record.createdAt, "createdAt") > topUpdated)
    fail("record updated before it was created");

  const datedValues: Array<[string, string]> = [
    ["fileAvailability.observedAt", record.fileAvailability.observedAt],
    ["textAvailability.observedAt", record.textAvailability.observedAt],
    ["aiProcessingStatus.updatedAt", record.aiProcessingStatus.updatedAt],
    [
      "sourceRoleConfirmationStatus.updatedAt",
      record.sourceRoleConfirmationStatus.updatedAt,
    ],
    ["ownerReviewStatus.updatedAt", record.ownerReviewStatus.updatedAt],
    [
      "independentValidationStatus.updatedAt",
      record.independentValidationStatus.updatedAt,
    ],
    [
      "partnerValidationStatus.updatedAt",
      record.partnerValidationStatus.updatedAt,
    ],
    [
      "rightsHolderValidationStatus.updatedAt",
      record.rightsHolderValidationStatus.updatedAt,
    ],
    ["rightsStatus.updatedAt", record.rightsStatus.updatedAt],
    ["publicationStatus.updatedAt", record.publicationStatus.updatedAt],
    [
      "publicationStatus.independentGates.privacy.updatedAt",
      record.publicationStatus.independentGates.privacy.updatedAt,
    ],
    [
      "publicationStatus.independentGates.safety.updatedAt",
      record.publicationStatus.independentGates.safety.updatedAt,
    ],
    [
      "publicationStatus.independentGates.legal.updatedAt",
      record.publicationStatus.independentGates.legal.updatedAt,
    ],
    ["coverageStatus.updatedAt", record.coverageStatus.updatedAt],
    ...record.openIssues.map(
      (issue) =>
        [`openIssues.${issue.issueId}.openedAt`, issue.openedAt] as [
          string,
          string,
        ],
    ),
  ];
  if (record.sourceIdentity.contentHashVerifiedAt) {
    datedValues.push([
      "sourceIdentity.contentHashVerifiedAt",
      record.sourceIdentity.contentHashVerifiedAt,
    ]);
  }
  for (const run of record.aiAssistanceProvenance.runs) {
    datedValues.push([`aiRun.${run.runId}.startedAt`, run.startedAt]);
    datedValues.push([`aiRun.${run.runId}.completedAt`, run.completedAt]);
    for (const [checkpointIndex, checkpoint] of run.checkpoints.entries()) {
      datedValues.push([
        `aiRun.${run.runId}.checkpoints.${checkpointIndex}.completedAt`,
        checkpoint.completedAt,
      ]);
    }
  }
  for (const evidence of record.aiProcessingStatus.stageEvidence) {
    datedValues.push([
      `stageEvidence.${evidence.stage}.completedAt`,
      evidence.completedAt,
    ]);
  }
  for (const [label, receipt, statusUpdatedAt] of [
    [
      "sourceRoleConfirmation",
      record.sourceRoleConfirmationStatus.receipt,
      record.sourceRoleConfirmationStatus.updatedAt,
    ],
    [
      "owner",
      record.ownerReviewStatus.receipt,
      record.ownerReviewStatus.updatedAt,
    ],
    [
      "independent",
      record.independentValidationStatus.receipt,
      record.independentValidationStatus.updatedAt,
    ],
    [
      "validationRequirement",
      record.independentValidationStatus.requirementReceipt,
      record.independentValidationStatus.updatedAt,
    ],
    [
      "partner",
      record.partnerValidationStatus.receipt,
      record.partnerValidationStatus.updatedAt,
    ],
    [
      "partnerRequirement",
      record.partnerValidationStatus.requirementReceipt,
      record.partnerValidationStatus.updatedAt,
    ],
    [
      "rightsHolder",
      record.rightsHolderValidationStatus.receipt,
      record.rightsHolderValidationStatus.updatedAt,
    ],
    [
      "rightsHolderRequirement",
      record.rightsHolderValidationStatus.requirementReceipt,
      record.rightsHolderValidationStatus.updatedAt,
    ],
    ["rights", record.rightsStatus.receipt, record.rightsStatus.updatedAt],
    [
      "privacyGate",
      record.publicationStatus.independentGates.privacy.receipt,
      record.publicationStatus.independentGates.privacy.updatedAt,
    ],
    [
      "safetyGate",
      record.publicationStatus.independentGates.safety.receipt,
      record.publicationStatus.independentGates.safety.updatedAt,
    ],
    [
      "legalGate",
      record.publicationStatus.independentGates.legal.receipt,
      record.publicationStatus.independentGates.legal.updatedAt,
    ],
    [
      "publication",
      record.publicationStatus.approvalReceipt,
      record.publicationStatus.updatedAt,
    ],
    [
      "coverage",
      record.coverageStatus.approvalReceipt,
      record.coverageStatus.updatedAt,
    ],
  ] as const) {
    if (!receipt) continue;
    datedValues.push([`${label}Receipt.reviewedAt`, receipt.reviewedAt]);
    if (
      timestamp(receipt.reviewedAt, `${label}Receipt.reviewedAt`) >
      timestamp(statusUpdatedAt, `${label}Status.updatedAt`)
    ) {
      fail(`${label} receipt cannot be newer than its status`);
    }
  }
  let previousStageCompletedAt = timestamp(record.createdAt, "createdAt");
  const runsById = new Map(
    record.aiAssistanceProvenance.runs.map((run) => [run.runId, run]),
  );
  for (const evidence of record.aiProcessingStatus.stageEvidence) {
    const evidenceCompletedAt = timestamp(
      evidence.completedAt,
      `stageEvidence.${evidence.stage}.completedAt`,
    );
    if (evidenceCompletedAt < previousStageCompletedAt) {
      fail("AI stage evidence must be chronological");
    }
    if (
      evidenceCompletedAt >
      timestamp(
        record.aiProcessingStatus.updatedAt,
        "aiProcessingStatus.updatedAt",
      )
    ) {
      fail("AI stage evidence cannot be newer than AI processing status");
    }
    if (evidence.runId) {
      const run = runsById.get(evidence.runId);
      if (!run)
        fail(`${evidence.stage} stage evidence references a missing AI run`);
      if (
        evidence.checkpointIndex === 0 &&
        timestamp(run.startedAt, `${run.runId}.startedAt`) <
          previousStageCompletedAt
      ) {
        fail(
          `${evidence.stage} AI run cannot start before the previous stage completed`,
        );
      }
    }
    previousStageCompletedAt = evidenceCompletedAt;
  }

  const readyEvidence = record.aiProcessingStatus.stageEvidence.find(
    (evidence) => evidence.stage === "ready_for_owner",
  );
  if (
    readyEvidence &&
    record.ownerReviewStatus.receipt &&
    timestamp(
      record.ownerReviewStatus.receipt.reviewedAt,
      "ownerReceipt.reviewedAt",
    ) < timestamp(readyEvidence.completedAt, "readyForOwner.completedAt")
  ) {
    fail("owner review receipt cannot predate the ready-for-owner artifact");
  }

  const publicationPrerequisiteReceipts = [
    record.sourceRoleConfirmationStatus.receipt,
    record.ownerReviewStatus.receipt,
    record.independentValidationStatus.requirementReceipt,
    record.independentValidationStatus.receipt,
    record.partnerValidationStatus.requirementReceipt,
    record.partnerValidationStatus.receipt,
    record.rightsHolderValidationStatus.requirementReceipt,
    record.rightsHolderValidationStatus.receipt,
    record.rightsStatus.receipt,
    record.publicationStatus.independentGates.privacy.receipt,
    record.publicationStatus.independentGates.safety.receipt,
    record.publicationStatus.independentGates.legal.receipt,
  ].filter((receipt) => receipt !== null);
  if (record.publicationStatus.approvalReceipt) {
    const publicationReviewedAt = timestamp(
      record.publicationStatus.approvalReceipt.reviewedAt,
      "publicationReceipt.reviewedAt",
    );
    if (
      publicationPrerequisiteReceipts.some(
        (receipt) =>
          timestamp(receipt.reviewedAt, "publicationPrerequisite.reviewedAt") >
          publicationReviewedAt,
      )
    ) {
      fail(
        "publication receipt cannot predate any applicable prerequisite receipt",
      );
    }
  }

  const coveragePrerequisiteReceiptIds = new Set(
    applicableCoverageReviewReceiptIds(record),
  );
  const coveragePrerequisiteReceipts = publicationPrerequisiteReceipts.filter(
    (receipt) => coveragePrerequisiteReceiptIds.has(receipt.receiptId),
  );
  if (record.coverageStatus.approvalReceipt) {
    const coverageReviewedAt = timestamp(
      record.coverageStatus.approvalReceipt.reviewedAt,
      "coverageReceipt.reviewedAt",
    );
    if (
      coveragePrerequisiteReceipts.some(
        (receipt) =>
          timestamp(receipt.reviewedAt, "coveragePrerequisite.reviewedAt") >
          coverageReviewedAt,
      )
    ) {
      fail("coverage receipt cannot predate any applicable review receipt");
    }
  }
  if (record.publicationStatus.publishedAt) {
    datedValues.push([
      "publicationStatus.publishedAt",
      record.publicationStatus.publishedAt,
    ]);
    if (
      record.publicationStatus.approvalReceipt &&
      timestamp(
        record.publicationStatus.publishedAt,
        "publicationStatus.publishedAt",
      ) <
        timestamp(
          record.publicationStatus.approvalReceipt.reviewedAt,
          "publicationReceipt.reviewedAt",
        )
    ) {
      fail("publishedAt cannot predate the publication receipt");
    }
  }
  if (record.coverageStatus.promotedAt) {
    datedValues.push([
      "coverageStatus.promotedAt",
      record.coverageStatus.promotedAt,
    ]);
    if (
      record.coverageStatus.approvalReceipt &&
      timestamp(record.coverageStatus.promotedAt, "coverageStatus.promotedAt") <
        timestamp(
          record.coverageStatus.approvalReceipt.reviewedAt,
          "coverageReceipt.reviewedAt",
        )
    ) {
      fail("promotedAt cannot predate the coverage receipt");
    }
  }
  for (const [label, value] of datedValues) {
    if (timestamp(value, label) > topUpdated)
      fail(`${label} cannot be newer than record.updatedAt`);
  }
}

export function deriveCorpusLifecyclePermissions(
  record: CorpusLifecycleRecord,
): CorpusLifecyclePermissions {
  const sourceRoleOwnerConfirmed =
    record.sourceIdentity.sourceRole !== "unknown" &&
    record.sourceRoleConfirmationStatus.state === "owner_confirmed" &&
    record.sourceRoleConfirmationStatus.receipt !== null;
  const aiReadyForOwnerReview =
    record.aiProcessingStatus.currentStage === "ready_for_owner" &&
    record.aiProcessingStatus.state === "complete" &&
    record.sourceIdentity.identityStatus === "verified" &&
    sourceRoleOwnerConfirmed &&
    record.sourceIdentity.contentSha256 !== null;
  const ownerApprovedForInternalUse =
    aiReadyForOwnerReview &&
    record.ownerReviewStatus.state === "approved_internal" &&
    record.ownerReviewStatus.receipt !== null;
  const independentlyValidated =
    record.independentValidationStatus.state === "validated" &&
    record.independentValidationStatus.receipt !== null;
  const independentValidationRequirementSatisfied =
    (record.independentValidationStatus.requirement === "required" &&
      independentlyValidated) ||
    (record.independentValidationStatus.requirement === "not_required" &&
      record.independentValidationStatus.state === "not_applicable" &&
      record.independentValidationStatus.requirementReceipt !== null);
  const partnerValidated =
    record.partnerValidationStatus.state === "validated" &&
    record.partnerValidationStatus.receipt !== null;
  const partnerValidationRequirementSatisfied =
    (record.partnerValidationStatus.requirement === "required" &&
      partnerValidated) ||
    (record.partnerValidationStatus.requirement === "not_required" &&
      record.partnerValidationStatus.state === "not_applicable" &&
      record.partnerValidationStatus.requirementReceipt !== null);
  const rightsHolderValidated =
    record.rightsHolderValidationStatus.state === "validated" &&
    record.rightsHolderValidationStatus.receipt !== null;
  const rightsHolderValidationRequirementSatisfied =
    (record.rightsHolderValidationStatus.requirement === "required" &&
      rightsHolderValidated) ||
    (record.rightsHolderValidationStatus.requirement === "not_required" &&
      record.rightsHolderValidationStatus.state === "not_applicable" &&
      record.rightsHolderValidationStatus.requirementReceipt !== null &&
      !record.scope.geographyIds.includes("geo.sapmi"));
  const rightsClearedForInternalUse =
    [
      "cleared_internal_use",
      "cleared_external_publication",
      "public_domain",
    ].includes(record.rightsStatus.state) &&
    record.rightsStatus.receipt !== null;
  const rightsClearedForExternalPublication =
    ["cleared_external_publication", "public_domain"].includes(
      record.rightsStatus.state,
    ) && record.rightsStatus.receipt !== null;
  const publicationIndependentGatesSatisfied = Object.values(
    record.publicationStatus.independentGates,
  ).every(publicationGateRequirementSatisfied);
  const noBlockingIssues = record.openIssues.every(
    (issue) => issue.severity !== "blocking",
  );
  const publicationGate =
    ownerApprovedForInternalUse &&
    independentValidationRequirementSatisfied &&
    partnerValidationRequirementSatisfied &&
    rightsHolderValidationRequirementSatisfied &&
    rightsClearedForExternalPublication &&
    publicationIndependentGatesSatisfied &&
    noBlockingIssues &&
    record.sourceIdentity.sourceRole !== "unknown";
  const coverageGate =
    ownerApprovedForInternalUse &&
    independentValidationRequirementSatisfied &&
    partnerValidationRequirementSatisfied &&
    rightsHolderValidationRequirementSatisfied &&
    rightsClearedForInternalUse &&
    noBlockingIssues &&
    record.sourceIdentity.sourceRole === "primary_evidence";

  const blockers: string[] = [];
  if (!aiReadyForOwnerReview)
    blockers.push("ai_processing_not_ready_for_owner");
  if (!sourceRoleOwnerConfirmed)
    blockers.push("source_role_owner_confirmation_missing");
  if (!ownerApprovedForInternalUse) blockers.push("owner_approval_missing");
  if (record.independentValidationStatus.requirement === "undetermined") {
    blockers.push("independent_validation_requirement_unresolved");
  } else if (
    record.independentValidationStatus.requirement === "required" &&
    record.independentValidationStatus.state === "validated_with_conditions"
  ) {
    blockers.push("independent_validation_conditions_open");
  } else if (
    record.independentValidationStatus.requirement === "required" &&
    !independentlyValidated
  ) {
    blockers.push("independent_validation_missing");
  } else if (!independentValidationRequirementSatisfied) {
    blockers.push("independent_validation_requirement_unsatisfied");
  }
  for (const [axis, status, validated, requirementSatisfied] of [
    [
      "partner_validation",
      record.partnerValidationStatus,
      partnerValidated,
      partnerValidationRequirementSatisfied,
    ],
    [
      "rights_holder_validation",
      record.rightsHolderValidationStatus,
      rightsHolderValidated,
      rightsHolderValidationRequirementSatisfied,
    ],
  ] as const) {
    if (status.requirement === "undetermined")
      blockers.push(`${axis}_requirement_unresolved`);
    else if (
      status.requirement === "required" &&
      status.state === "validated_with_conditions"
    ) {
      blockers.push(`${axis}_conditions_open`);
    } else if (status.requirement === "required" && !validated)
      blockers.push(`${axis}_missing`);
    else if (!requirementSatisfied)
      blockers.push(`${axis}_requirement_unsatisfied`);
  }
  if (!rightsClearedForInternalUse)
    blockers.push("internal_rights_clearance_missing");
  if (!rightsClearedForExternalPublication)
    blockers.push("external_rights_clearance_missing");
  for (const [gateId, status] of Object.entries(
    record.publicationStatus.independentGates,
  )) {
    if (!publicationGateRequirementSatisfied(status)) {
      blockers.push(`publication_${gateId}_gate_unsatisfied`);
    }
  }
  if (!noBlockingIssues) blockers.push("blocking_issues_open");
  if (record.sourceIdentity.sourceRole !== "primary_evidence") {
    blockers.push("source_role_not_primary_evidence");
  }

  return {
    aiReadyForOwnerReview,
    sourceRoleOwnerConfirmed,
    ownerApprovedForInternalUse,
    independentlyValidated,
    independentValidationRequirementSatisfied,
    partnerValidated,
    partnerValidationRequirementSatisfied,
    rightsHolderValidated,
    rightsHolderValidationRequirementSatisfied,
    rightsClearedForInternalUse,
    rightsClearedForExternalPublication,
    publicationIndependentGatesSatisfied,
    externalUseAllowed:
      publicationGate && record.publicationStatus.approvalReceipt !== null,
    coveragePromotionAllowed:
      coverageGate && record.coverageStatus.approvalReceipt !== null,
    blockers,
  };
}

function validatePromotionBoundaries(record: CorpusLifecycleRecord) {
  const permissions = deriveCorpusLifecyclePermissions(record);
  const publication = record.publicationStatus;
  const publicationApproved = ["publishable", "published"].includes(
    publication.state,
  );
  if (publicationApproved !== (publication.approvalReceipt !== null)) {
    fail(
      "publishable or published state requires exactly one named publication receipt",
    );
  }
  if (publication.approvalReceipt) {
    reviewerRole(
      publication.approvalReceipt,
      ["publication_authority"],
      "publication receipt",
    );
  }
  if (
    publication.externalUseAllowed !==
    (publicationApproved && permissions.externalUseAllowed)
  ) {
    fail(
      "external-use flag must exactly match independent validation, rights, and publication gates",
    );
  }
  if (publication.state === "published") {
    if (
      publication.publicLocator === null ||
      publication.publishedAt === null
    ) {
      fail(
        "published state requires a public locator and publication timestamp",
      );
    }
  } else if (
    publication.publicLocator !== null ||
    publication.publishedAt !== null
  ) {
    fail(
      "only published state may carry a public locator or publication timestamp",
    );
  }

  const coverage = record.coverageStatus;
  const coverageApproved = ["approved_for_promotion", "promoted"].includes(
    coverage.state,
  );
  if (coverageApproved !== (coverage.approvalReceipt !== null)) {
    fail(
      "coverage approval or promotion requires exactly one assessor receipt",
    );
  }
  if (coverage.approvalReceipt) {
    const { assessor, assessorAuthorization } = coverage.approvalReceipt;
    if (
      assessor.assessorType === "named_human" &&
      assessor.authentication.state !== "verified"
    ) {
      fail("coverage assessor identity is self-asserted and not authenticated");
    }
    if (
      assessorAuthorization.readinessProfileId !==
        coverage.approvalReceipt.readinessProfileId ||
      assessorAuthorization.assessorType !== assessor.assessorType ||
      assessorAuthorization.assessorId !== assessor.assessorId
    ) {
      fail(
        "coverage assessor authorization must bind the exact readiness profile and assessor",
      );
    }
    if (
      assessor.assessorType === "machine_assessor" &&
      assessor.outputSha256 !== coverage.approvalReceipt.assessmentSha256
    ) {
      fail(
        "machine coverage assessor output hash must bind the exact coverage assessment",
      );
    }
    if (
      coverage.approvalReceipt.binding.artifactId !==
        coverage.approvalReceipt.assessmentId ||
      coverage.approvalReceipt.binding.artifactVersion !==
        coverage.approvalReceipt.assessmentVersion ||
      coverage.approvalReceipt.binding.artifactSha256 !==
        coverage.approvalReceipt.assessmentSha256
    ) {
      fail(
        "coverage receipt artifact binding must identify the exact assessment ID, version and hash",
      );
    }
    if (
      coverage.approvalReceipt.evidenceSnapshotSha256 !==
      record.ownerReviewStatus.receipt?.binding.artifactSha256
    ) {
      fail(
        "coverage evidence snapshot must bind the exact owner-reviewed artifact hash",
      );
    }
    assertUnique(
      coverage.approvalReceipt.applicableReviewReceiptIds,
      "coverage applicable review receipt IDs",
    );
    if (
      JSON.stringify(coverage.approvalReceipt.applicableReviewReceiptIds) !==
      JSON.stringify(applicableCoverageReviewReceiptIds(record))
    ) {
      fail(
        "coverage receipt must bind the exact applicable review receipt IDs",
      );
    }
    if (
      JSON.stringify(coverage.approvalReceipt.coverageCellIds) !==
      JSON.stringify(coverage.coverageCellIds)
    ) {
      fail(
        "coverage receipt cell IDs must exactly bind the lifecycle coverage cells",
      );
    }
  }
  assertUnique(coverage.coverageCellIds, "coverage cell IDs");
  if (
    coverage.coveragePromotionAllowed !==
    (coverageApproved && permissions.coveragePromotionAllowed)
  ) {
    fail(
      "coverage-promotion flag must exactly match independent validation and coverage gates",
    );
  }
  if (coverageApproved && coverage.coverageCellIds.length === 0) {
    fail("coverage approval must name at least one coverage cell");
  }
  if (coverage.state === "promoted") {
    if (coverage.promotedAt === null)
      fail("promoted coverage requires a promotion timestamp");
  } else if (coverage.promotedAt !== null) {
    fail("only promoted coverage may carry a promotion timestamp");
  }
}

export function validateCorpusLifecycle(value: unknown): CorpusLifecycleRecord {
  const parsed = corpusLifecycleRecordSchema.safeParse(value);
  if (!parsed.success)
    fail(
      parsed.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; "),
    );
  const record = parsed.data;
  assertUnique(record.scope.geographyIds, "scope geography IDs");
  assertUnique(record.scope.materialProfileIds, "scope material profile IDs");
  assertUnique(
    record.scope.intendedUseProfileIds,
    "scope intended-use profile IDs",
  );
  assertUnique(
    record.openIssues.map((issue) => issue.issueId),
    "open issue IDs",
  );
  validateAvailability(record);
  validateAiLifecycle(record);
  validateDecisionReceipts(record);
  validateReceiptTimes(record);
  validatePromotionBoundaries(record);
  validateReceiptSeals(record);
  return record;
}

export function buildInitialCorpusLifecycle(
  input: BuildInitialCorpusLifecycleInput,
): CorpusLifecycleRecord {
  if (input.fileAvailable && !input.fileLocator) {
    fail("initial available file requires fileLocator");
  }
  const observedAt = input.observedAt;
  const contentSha256 = input.contentSha256 ?? null;
  const contentHashEvidenceState =
    input.contentHashEvidenceState ??
    (contentSha256 === null
      ? "unavailable"
      : input.fileAvailable
        ? "repository_file_verified"
        : "private_capture_attestation_recorded");
  return validateCorpusLifecycle({
    schemaVersion: "corpus-processing-lifecycle-v1",
    recordId: input.recordId,
    scope: {
      geographyIds: input.geographyIds ?? [],
      materialProfileIds: input.materialProfileIds ?? [],
      intendedUseProfileIds: input.intendedUseProfileIds ?? [
        "use.internal_research",
      ],
    },
    sourceIdentity: {
      sourceId: input.sourceId,
      title: input.title,
      sourceRole: input.sourceRole,
      identityKind: input.identityKind,
      canonicalIdentity: input.canonicalIdentity,
      identityStatus:
        input.identityStatus ??
        (input.identityKind === "unknown" ? "unknown" : "provisional"),
      metadataSha256: input.metadataSha256,
      contentSha256,
      contentHashEvidenceState,
      contentHashVerifiedAt: input.contentHashVerifiedAt ?? null,
    },
    fileAvailability: {
      state: input.fileAvailable ? "available" : "missing",
      locator: input.fileLocator ?? null,
      mediaType: input.mediaType ?? null,
      sizeBytes: input.fileSizeBytes ?? null,
      observedAt,
    },
    textAvailability: {
      state: "unavailable",
      textSha256: null,
      characterCount: null,
      extractionMethod: null,
      observedAt,
    },
    aiAssistanceProvenance: {
      used: false,
      runs: [],
    },
    aiProcessingStatus: {
      currentStage: "inventory",
      state: "complete",
      completedStages: ["inventory"],
      stageEvidence: [
        {
          stage: "inventory",
          method: "deterministic_inventory",
          runId: null,
          checkpointIndex: null,
          artifactId: `artifact.inventory.${input.recordId}`,
          artifactVersion: "1.0.0",
          outputSha256: input.metadataSha256,
          completedAt: observedAt,
        },
      ],
      updatedAt: observedAt,
    },
    sourceRoleConfirmationStatus: {
      state: input.sourceRole === "unknown" ? "unknown" : "machine_provisional",
      receipt: null,
      updatedAt: observedAt,
    },
    ownerReviewStatus: {
      state: "not_requested",
      receipt: null,
      updatedAt: observedAt,
    },
    independentValidationStatus: {
      requirement: "undetermined",
      requirementProfileId: null,
      requirementRationale: null,
      requirementReceipt: null,
      state: "not_requested",
      receipt: null,
      updatedAt: observedAt,
    },
    partnerValidationStatus: {
      requirement: "undetermined",
      requirementProfileId: null,
      requirementRationale: null,
      requirementReceipt: null,
      state: "not_requested",
      receipt: null,
      updatedAt: observedAt,
    },
    rightsHolderValidationStatus: {
      requirement: "undetermined",
      requirementProfileId: null,
      requirementRationale: null,
      requirementReceipt: null,
      state: "not_requested",
      receipt: null,
      updatedAt: observedAt,
    },
    rightsStatus: {
      state: "unknown",
      receipt: null,
      updatedAt: observedAt,
    },
    publicationStatus: {
      state: "internal_only",
      externalUseAllowed: false,
      independentGates: {
        privacy: {
          requirement: "undetermined",
          requirementProfileId: null,
          requirementRationale: null,
          state: "not_requested",
          receipt: null,
          updatedAt: observedAt,
        },
        safety: {
          requirement: "undetermined",
          requirementProfileId: null,
          requirementRationale: null,
          state: "not_requested",
          receipt: null,
          updatedAt: observedAt,
        },
        legal: {
          requirement: "undetermined",
          requirementProfileId: null,
          requirementRationale: null,
          state: "not_requested",
          receipt: null,
          updatedAt: observedAt,
        },
      },
      approvalReceipt: null,
      publicLocator: null,
      publishedAt: null,
      updatedAt: observedAt,
    },
    coverageStatus: {
      state: "not_assessed",
      coveragePromotionAllowed: false,
      approvalReceipt: null,
      coverageCellIds: [],
      promotedAt: null,
      updatedAt: observedAt,
    },
    openIssues: input.openIssues ?? [],
    createdAt: observedAt,
    updatedAt: observedAt,
  });
}
