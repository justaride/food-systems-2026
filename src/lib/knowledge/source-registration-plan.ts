import { createHash } from "node:crypto";

import { z } from "zod";

export const SOURCE_REGISTRATION_PLAN_SCHEMA_VERSION =
  "source-registration-plan-v1" as const;
export const SOURCE_REGISTRATION_PLAN_VERSION = "1.0.0" as const;
export const SOURCE_REGISTRATION_CONTRACT_VERSION = "1.0.0" as const;
export const SOURCE_REGISTRATION_PLAN_HASH_DOMAIN =
  "food-systems-2026:source-registration-plan:v1\0" as const;
export const SOURCE_REGISTRATION_SNAPSHOT_HASH_DOMAIN =
  "food-systems-2026:source-registration-before-snapshot:v1\0" as const;
export const SOURCE_REGISTRATION_TARGET_HASH_DOMAIN =
  "food-systems-2026:source-registration-target-data:v1\0" as const;
export const SOURCE_REGISTRATION_DOCUMENT_CONTENT_SERIALIZATION = {
  id: "normalized-pages-joined-with-page-boundary-v1",
  charset: "utf-8",
  pageOrder: "ascending_page_number",
  pageSequence: "contiguous_from_1",
  delimiterUtf8: "\n\n--food-systems-page-boundary-v1--\n\n",
} as const;

const BARE_SHA256_PATTERN = /^[a-f0-9]{64}$/;
const SHA256_PATTERN = /^sha256:[a-f0-9]{64}$/;
const IDENTIFIER_PATTERN = /^[a-z0-9][a-z0-9._:-]*$/;
const VERSION_PATTERN = /^\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PORTABLE_PATH_PATTERN = /^[a-z0-9][a-zA-Z0-9._/-]*$/;

const bareSha256Schema = z.string().regex(BARE_SHA256_PATTERN);
const sha256Schema = z.string().regex(SHA256_PATTERN);
const identifierSchema = z.string().regex(IDENTIFIER_PATTERN);
const versionSchema = z.string().regex(VERSION_PATTERN);
const dateSchema = z.string().regex(DATE_PATTERN);
const dateTimeSchema = z
  .string()
  .regex(DATE_TIME_PATTERN)
  .refine(
    (value) => Number.isFinite(Date.parse(value)),
    "Invalid UTC timestamp",
  );
const portablePathSchema = z
  .string()
  .regex(PORTABLE_PATH_PATTERN)
  .superRefine((value, context) => {
    if (
      value.startsWith("/") ||
      value.includes("\\") ||
      value
        .split("/")
        .some(
          (segment) => segment === "" || segment === "." || segment === "..",
        )
    ) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Expected a normalized repository-relative path",
      });
    }
  });
const rawPagePathTemplateSchema = z
  .string()
  .regex(
    /^pdf-page-extraction\/v1\/sha256\/[a-f0-9]{64}\/pages\/page-\{pageNumber:0000\}\.raw\.txt$/,
  );
const normalizedPagePathTemplateSchema = z
  .string()
  .regex(
    /^pdf-page-extraction\/v1\/sha256\/[a-f0-9]{64}\/pages\/page-\{pageNumber:0000\}\.normalized\.txt$/,
  );

const httpsUrlSchema = z
  .string()
  .url()
  .startsWith("https://")
  .superRefine((value, context) => {
    const url = new URL(value);
    if (url.username || url.password || url.hash) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Source URLs cannot contain credentials or fragments",
      });
    }
  });

export type SourceRegistrationJsonValue =
  | null
  | boolean
  | number
  | string
  | SourceRegistrationJsonValue[]
  | { [key: string]: SourceRegistrationJsonValue };

export function canonicalSourceRegistrationJson(
  value: SourceRegistrationJsonValue,
): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalSourceRegistrationJson(item)).join(",")}]`;
  }
  return `{${Object.keys(value)
    .sort()
    .map(
      (key) =>
        `${JSON.stringify(key)}:${canonicalSourceRegistrationJson(value[key] as SourceRegistrationJsonValue)}`,
    )
    .join(",")}}`;
}

export function sourceRegistrationSha256(value: string | Buffer): string {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

export function sourceRegistrationBareSha256(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

export function hashSourceRegistrationJson(
  domain: string,
  value: SourceRegistrationJsonValue,
): string {
  return sourceRegistrationSha256(
    `${domain}${canonicalSourceRegistrationJson(value)}`,
  );
}

export function canonicalDocumentIdentityKey(documentId: string): string {
  if (!IDENTIFIER_PATTERN.test(documentId)) {
    throw new Error("Document ID cannot form a canonical identity key");
  }
  return `document:${documentId}`;
}

export function lifecycleSourceIdForIdentity(identityKey: string): string {
  if (!identityKey.startsWith("document:")) {
    throw new Error(
      "Lifecycle source ID requires a canonical Document identity",
    );
  }
  return `source.${sourceRegistrationBareSha256(identityKey).slice(0, 24)}`;
}

export function libraryAnalysisIdForIdentity(identityKey: string): string {
  if (!identityKey.startsWith("document:")) {
    throw new Error(
      "Library-analysis ID requires a canonical Document identity",
    );
  }
  return `library-analysis.${sourceRegistrationBareSha256(identityKey).slice(0, 24)}`;
}

const fileBindingSchema = z
  .object({
    path: portablePathSchema,
    fileSha256: sha256Schema,
    sizeBytes: z.number().int().nonnegative(),
  })
  .strict();

const sealedArtifactBindingSchema = fileBindingSchema
  .extend({
    internalSealType: z.enum([
      "source_acquisition_receipt_sha256",
      "pdf_qualification_receipt_sha256",
      "pdf_page_map_sha256",
      "source_analysis_input_manifest_sha256",
    ]),
    internalSeal: sha256Schema,
  })
  .strict();

const artifactBindingsSchema = z
  .object({
    sourceRegistrationBatch: fileBindingSchema,
    sourceAcquisitionBatch: fileBindingSchema,
    pdfExtractionBatch: fileBindingSchema,
    sourceAnalysisInputGenerationManifest: fileBindingSchema,
    sourceRegistrationContract: fileBindingSchema,
    sourceRegistrationJsonSchema: fileBindingSchema,
    sourceRegistrationRuntime: fileBindingSchema,
    sourceRegistrationGenerator: fileBindingSchema,
    databaseSchema: fileBindingSchema,
  })
  .strict();

const sourceTargetSchema = z
  .object({
    targetId: identifierSchema,
    preRegistrationCandidateKey: z
      .string()
      .regex(/^candidate:source\.[a-z0-9][a-z0-9._:-]*$/),
    document: z
      .object({
        id: identifierSchema,
        slug: identifierSchema,
        filePath: portablePathSchema,
        title: z.string().min(1).max(1_000),
        author: z.string().min(1).max(1_000),
        year: z.number().int().min(1_000).max(3_000),
        documentType: identifierSchema,
        category: identifierSchema,
        country: z.string().regex(/^[A-Z]{2}$/),
        tags: z.array(identifierSchema).min(1),
      })
      .strict(),
    source: z
      .object({
        officialUrl: httpsUrlSchema,
        doi: z.string().min(1).max(500).nullable(),
        publicationDateStatement: z.string().min(1).max(1_000),
        languageCodes: z.array(identifierSchema).min(1),
        rawContentSha256: bareSha256Schema,
        rawContentSizeBytes: z.number().int().positive(),
        pageCount: z.number().int().positive(),
        acquisitionReceiptPath: portablePathSchema,
      })
      .strict(),
  })
  .strict();

const sourceRegistrationBatchSchema = z
  .object({
    schemaVersion: z.literal("1.0.0"),
    batchId: identifierSchema,
    preparedOn: dateSchema,
    purpose: z.string().min(1),
    preRegistrationBindings: z
      .object({
        sourceAcquisitionBatch: z
          .object({
            path: portablePathSchema,
            fileSha256: bareSha256Schema,
          })
          .strict(),
        pdfExtractionBatch: z
          .object({
            path: portablePathSchema,
            fileSha256: bareSha256Schema,
          })
          .strict(),
        sourceAnalysisInputGenerationManifest: z
          .object({
            path: portablePathSchema,
            fileSha256: bareSha256Schema,
          })
          .strict(),
      })
      .strict(),
    registrationPolicy: z
      .object({
        databaseModel: z.literal("Document"),
        identityStatus: z.literal("provisional"),
        sourceRoleStatus: z.literal("machine_provisional_only"),
        documentContentSource: z.literal("exact_private_normalized_pages"),
        documentContentSerialization: z.literal(
          SOURCE_REGISTRATION_DOCUMENT_CONTENT_SERIALIZATION.id,
        ),
        libraryAnalysisTier: z.literal("inventory_only"),
        libraryAnalysisStatus: z.literal("not_started"),
        ownerReviewStatus: z.literal("not_started"),
        rightsState: z.literal("pending_not_cleared"),
        publicationState: z.literal("internal_only"),
        coveragePromotionAllowed: z.literal(false),
        genericImporterAllowed: z.literal(false),
        transactionRequired: z.literal(true),
        exactDryRunPlanRequired: z.literal(true),
        verifiedBackupAndRestoreReceiptRequired: z.literal(true),
        controlledMutationAuditRequired: z.literal(true),
      })
      .strict(),
    targets: z.array(sourceTargetSchema).length(10),
  })
  .strict();

export const SourceRegistrationBatchSchema = sourceRegistrationBatchSchema;
export type SourceRegistrationBatch = z.infer<
  typeof SourceRegistrationBatchSchema
>;
export type SourceRegistrationTarget = z.infer<typeof sourceTargetSchema>;

const contentBindingSchema = z
  .object({
    source: z.literal("exact_private_normalized_pages"),
    serializationId: z.literal(
      SOURCE_REGISTRATION_DOCUMENT_CONTENT_SERIALIZATION.id,
    ),
    charset: z.literal("utf-8"),
    pageOrder: z.literal("ascending_page_number"),
    pageSequence: z.literal("contiguous_from_1"),
    delimiterUtf8: z.literal(
      SOURCE_REGISTRATION_DOCUMENT_CONTENT_SERIALIZATION.delimiterUtf8,
    ),
    sha256: sha256Schema,
    sizeBytes: z.number().int().positive(),
    characterCount: z.number().int().nonnegative(),
    wordCount: z.number().int().nonnegative(),
    pageCount: z.number().int().positive(),
    contentValueStoredInPlan: z.literal(false),
    privateAbsolutePathStoredInPlan: z.literal(false),
  })
  .strict();

const documentMetadataSchema = z
  .object({
    registration: z
      .object({
        batchId: identifierSchema,
        targetId: identifierSchema,
        identityStatus: z.literal("provisional"),
        sourceRoleStatus: z.literal("machine_provisional_only"),
        canonicalIdentityKey: z.string().startsWith("document:"),
        lifecycleSourceId: identifierSchema,
      })
      .strict(),
    source: z
      .object({
        officialUrl: httpsUrlSchema,
        doi: z.string().min(1).max(500).nullable(),
        publicationDateStatement: z.string().min(1).max(1_000),
        languageCodes: z.array(identifierSchema).min(1),
        rawContentSha256: bareSha256Schema,
        rawContentSizeBytes: z.number().int().positive(),
        pageCount: z.number().int().positive(),
      })
      .strict(),
    readiness: z
      .object({
        identityVerified: z.literal(false),
        sourceAnalysisComplete: z.literal(false),
        ownerReviewComplete: z.literal(false),
        independentExpertReviewComplete: z.literal(false),
        partnerReviewComplete: z.literal(false),
        rightsHolderReviewComplete: z.literal(false),
        rightsCleared: z.literal(false),
        publicationReady: z.literal(false),
        externalUseAllowed: z.literal(false),
        coveragePromotionAllowed: z.literal(false),
      })
      .strict(),
  })
  .strict();

const intendedDocumentRowSchema = z
  .object({
    id: identifierSchema,
    slug: identifierSchema,
    filePath: portablePathSchema,
    title: z.string().min(1).max(1_000),
    author: z.string().min(1).max(1_000),
    year: z.number().int().min(1_000).max(3_000),
    documentType: identifierSchema,
    category: identifierSchema,
    subcategory: z.null(),
    country: z.string().regex(/^[A-Z]{2}$/),
    summary: z.null(),
    url: httpsUrlSchema,
    accessedAt: dateTimeSchema,
    archivedUrl: z.null(),
    wordCount: z.number().int().nonnegative(),
    tags: z.array(identifierSchema).min(1),
    metadata: documentMetadataSchema,
    contentBinding: contentBindingSchema,
    createdAt: dateTimeSchema,
    updatedAt: dateTimeSchema,
    targetDataSha256: sha256Schema,
  })
  .strict();

const intendedLibraryRowSchema = z
  .object({
    id: identifierSchema,
    sourceKind: z.literal("document"),
    sourceKey: z.string().startsWith("document:"),
    documentId: identifierSchema,
    sourceDocId: z.null(),
    canonicalPath: portablePathSchema,
    title: z.string().min(1).max(1_000),
    status: z.literal("not_started"),
    usageRule: z.literal("internal_background"),
    reviewStatus: z.literal("not_reviewed"),
    citationReadiness: z.null(),
    analysisTier: z.literal("inventory_only"),
    aiCard: z.null(),
    aiSummary: z.null(),
    keyFindings: z.array(z.never()).length(0),
    claimCandidates: z.null(),
    projectImplications: z.array(z.never()).length(0),
    gaps: z.null(),
    controlLinks: z
      .object({
        sourceRegistrationBatch: portablePathSchema,
        acquisitionReceipt: portablePathSchema,
        extractionReceipt: portablePathSchema,
        pageMap: portablePathSchema,
        sourceAnalysisInputManifest: portablePathSchema,
      })
      .strict(),
    riskFlags: z.tuple([
      z.literal("identity_provisional"),
      z.literal("owner_review_required"),
      z.literal("rights_pending_not_cleared"),
      z.literal("source_analysis_not_started"),
    ]),
    contentHash: bareSha256Schema,
    wordCount: z.number().int().nonnegative(),
    processedAt: z.null(),
    reviewedAt: z.null(),
    reviewer: z.null(),
    createdAt: dateTimeSchema,
    updatedAt: dateTimeSchema,
    targetDataSha256: sha256Schema,
  })
  .strict();

const privateRecoveryRowSchema = z
  .object({
    identityKey: z.string().startsWith("document:"),
    canonicalPath: portablePathSchema,
    sha256: bareSha256Schema,
    sizeBytes: z.number().int().positive(),
    internalLocator: z
      .string()
      .regex(/^private:\/\/corpus\/sha256\/[a-f0-9]{64}$/),
    replicaClass: z.literal("bigbrain_private_archive"),
    repositoryAvailable: z.literal(false),
    fullTextReviewed: z.literal(false),
    rightsState: z.literal("pending_not_cleared"),
  })
  .strict();

export type IntendedDocumentRow = z.infer<typeof intendedDocumentRowSchema>;
export type IntendedLibraryRow = z.infer<typeof intendedLibraryRowSchema>;
export type PlannedPrivateRecoveryRow = z.infer<
  typeof privateRecoveryRowSchema
>;

const privateVerificationSchema = z
  .object({
    rawPdfPortablePath: portablePathSchema,
    rawPageTextPortablePathTemplate: rawPagePathTemplateSchema,
    normalizedPagePortablePathTemplate: normalizedPagePathTemplateSchema,
    pageCount: z.number().int().positive(),
    rawPageTextFileCountPerCopy: z.number().int().positive(),
    normalizedPageFileCountPerCopy: z.number().int().positive(),
    rawPdfSha256: sha256Schema,
    rawPageTextSetSha256: sha256Schema,
    normalizedPageSetSha256: sha256Schema,
    primaryCopyVerified: z.literal(true),
    replicaCopyVerified: z.literal(true),
    distinctRootsVerified: z.literal(true),
    distinctFilesVerified: z.literal(true),
    rootMode: z.literal("0700"),
    fileMode: z.literal("0400"),
    absoluteRootsStoredInPlan: z.literal(false),
  })
  .strict();

const targetArtifactEvidenceSchema = z
  .object({
    acquisitionReceipt: sealedArtifactBindingSchema.extend({
      internalSealType: z.literal("source_acquisition_receipt_sha256"),
    }),
    extractionReceipt: sealedArtifactBindingSchema.extend({
      internalSealType: z.literal("pdf_qualification_receipt_sha256"),
    }),
    pageMap: sealedArtifactBindingSchema.extend({
      internalSealType: z.literal("pdf_page_map_sha256"),
    }),
    sourceAnalysisInputManifest: sealedArtifactBindingSchema.extend({
      internalSealType: z.literal("source_analysis_input_manifest_sha256"),
    }),
    privateVerification: privateVerificationSchema,
  })
  .strict();

export type TargetArtifactEvidence = z.infer<
  typeof targetArtifactEvidenceSchema
>;

const documentSnapshotRowSchema = z
  .object({
    id: identifierSchema,
    slug: identifierSchema,
    filePath: portablePathSchema.nullable(),
    title: z.string().min(1),
    author: z.string().nullable(),
    year: z.number().int().nullable(),
    documentType: z.string().nullable(),
    category: z.string().nullable(),
    subcategory: z.string().nullable(),
    country: z.string().nullable(),
    url: z.string().nullable(),
    accessedAt: dateTimeSchema.nullable(),
    archivedUrl: z.string().nullable(),
    wordCount: z.number().int().nonnegative(),
    tags: z.array(z.string()),
    createdAt: dateTimeSchema,
    updatedAt: dateTimeSchema,
    contentSha256: sha256Schema,
    contentSizeBytes: z.number().int().nonnegative(),
    summarySha256: sha256Schema.nullable(),
    metadataSha256: sha256Schema.nullable(),
    targetDataSha256: sha256Schema,
    rowSha256: sha256Schema,
    collisionFields: z.array(z.enum(["id", "slug", "filePath", "url"])).min(1),
  })
  .strict();

const librarySnapshotRowSchema = z
  .object({
    id: identifierSchema,
    sourceKind: z.string().min(1),
    sourceKey: z.string().min(1),
    documentId: z.string().nullable(),
    sourceDocId: z.string().nullable(),
    canonicalPath: z.string().nullable(),
    title: z.string().min(1),
    status: z.string().min(1),
    usageRule: z.string().min(1),
    reviewStatus: z.string().min(1),
    citationReadiness: z.string().nullable(),
    analysisTier: z.string().min(1),
    contentHash: z.string().nullable(),
    wordCount: z.number().int().nonnegative(),
    processedAt: dateTimeSchema.nullable(),
    reviewedAt: dateTimeSchema.nullable(),
    reviewer: z.string().nullable(),
    createdAt: dateTimeSchema,
    updatedAt: dateTimeSchema,
    riskFlags: z.array(z.string()),
    aiCardSha256: sha256Schema.nullable(),
    aiSummarySha256: sha256Schema.nullable(),
    keyFindingsSha256: sha256Schema,
    claimCandidatesSha256: sha256Schema.nullable(),
    projectImplicationsSha256: sha256Schema,
    gapsSha256: sha256Schema.nullable(),
    controlLinksSha256: sha256Schema.nullable(),
    targetDataSha256: sha256Schema,
    rowSha256: sha256Schema,
    collisionFields: z
      .array(
        z.enum([
          "id",
          "sourceKey",
          "documentId",
          "canonicalPath",
          "contentHash",
        ]),
      )
      .min(1),
  })
  .strict();

export type DocumentSnapshotRow = z.infer<typeof documentSnapshotRowSchema>;
export type LibrarySnapshotRow = z.infer<typeof librarySnapshotRowSchema>;

const databaseBeforeSnapshotBodySchema = z
  .object({
    observedAt: dateTimeSchema,
    transaction: z
      .object({
        readOnly: z.literal(true),
        isolationLevel: z.literal("RepeatableRead"),
        transactionReadOnlySetting: z.literal("on"),
        databaseRole: z.string().min(1).max(500),
        serverVersion: z.string().min(1).max(500),
      })
      .strict(),
    databaseIdentity: z
      .object({
        key: z.literal("primary"),
        identityUuid: z.string().regex(UUID_PATTERN),
      })
      .strict(),
    completedMigrationLedger: z
      .object({
        count: z.number().int().positive(),
        sha256: sha256Schema,
      })
      .strict(),
    coreCounts: z
      .object({
        documents: z.number().int().nonnegative(),
        libraryAnalysisRecords: z.number().int().nonnegative(),
        controlledMutationAudits: z.number().int().nonnegative(),
      })
      .strict(),
    targetScope: z
      .object({
        documentRows: z.array(documentSnapshotRowSchema),
        libraryAnalysisRows: z.array(librarySnapshotRowSchema),
        targetScopeSha256: sha256Schema,
      })
      .strict(),
    privateRecoveryRegister: z
      .object({
        path: portablePathSchema,
        fileSha256: sha256Schema,
        candidateCount: z.number().int().nonnegative(),
        matchingRows: z.array(privateRecoveryRowSchema),
        matchingRowsSha256: sha256Schema,
      })
      .strict(),
  })
  .strict();

const databaseBeforeSnapshotSchema = databaseBeforeSnapshotBodySchema
  .extend({
    beforeSnapshotSha256: sha256Schema,
  })
  .strict();

export type DatabaseBeforeSnapshotBody = z.infer<
  typeof databaseBeforeSnapshotBodySchema
>;
export type DatabaseBeforeSnapshot = z.infer<
  typeof databaseBeforeSnapshotSchema
>;

const conflictSchema = z
  .object({
    code: z.enum([
      "document_collision",
      "library_analysis_collision",
      "partial_registration_state",
      "registered_row_drift",
      "private_recovery_collision",
    ]),
    detail: z.string().min(1).max(2_000),
    evidenceRowSha256: z.array(sha256Schema),
  })
  .strict();

const sourceRegistrationTargetPlanSchema = z
  .object({
    targetId: identifierSchema,
    preRegistrationCandidateKey: z.string().startsWith("candidate:source."),
    canonicalIdentityKey: z.string().startsWith("document:"),
    lifecycleSourceId: identifierSchema,
    state: z.enum(["pending", "already_registered", "conflict"]),
    artifactEvidence: targetArtifactEvidenceSchema,
    intendedDocumentRow: intendedDocumentRowSchema,
    intendedLibraryAnalysisRow: intendedLibraryRowSchema,
    intendedPrivateRecoveryRow: privateRecoveryRowSchema,
    observedDocumentRowSha256: z.array(sha256Schema),
    observedLibraryRowSha256: z.array(sha256Schema),
    privateRecoveryState: z.enum([
      "pending_append",
      "already_present_exact",
      "conflict",
    ]),
    conflicts: z.array(conflictSchema),
    permissions: z
      .object({
        registrationApplyAllowed: z.literal(false),
        identityVerificationComplete: z.literal(false),
        sourceAnalysisAllowed: z.literal(false),
        externalUseAllowed: z.literal(false),
        coveragePromotionAllowed: z.literal(false),
      })
      .strict(),
  })
  .strict();

export type SourceRegistrationTargetPlan = z.infer<
  typeof sourceRegistrationTargetPlanSchema
>;

const releaseGatesSchema = z
  .object({
    applyImplementation: z
      .object({
        state: z.literal("disabled_not_implemented"),
        required: z.literal(true),
        statement: z.string().min(1),
      })
      .strict(),
    ownerScopeAuthorization: z
      .object({
        state: z.literal("recorded_for_bounded_dry_run_only"),
        required: z.literal(true),
        exactPlanHashReviewed: z.literal(false),
        applyAuthorized: z.literal(false),
        statement: z.string().min(1),
      })
      .strict(),
    backupAndRestore: z
      .object({
        state: z.literal("not_bound"),
        required: z.literal(true),
        backupMetadataVersion: z.literal(2),
        restoreReceiptVersion: z.literal(1),
        exactDatabaseIdentityRequired: z.literal(true),
        exactTargetFingerprintRequired: z.literal(true),
        statement: z.string().min(1),
      })
      .strict(),
    exactPlanAuthorization: z
      .object({
        state: z.literal("not_recorded"),
        required: z.literal(true),
        exactPlanSha256Required: z.literal(true),
        operatorAuthorityRequired: z.literal(true),
        writableNonMcpRoleRequired: z.literal(true),
        statement: z.string().min(1),
      })
      .strict(),
    serializableTransaction: z
      .object({
        state: z.literal("not_executed"),
        required: z.literal(true),
        isolationLevel: z.literal("Serializable"),
        advisoryLockRequired: z.literal(true),
        beforeSnapshotCasRequired: z.literal(true),
        documentAndLibraryRowsAtomic: z.literal(true),
        controlledMutationAuditAtomic: z.literal(true),
        statement: z.string().min(1),
      })
      .strict(),
    controlledMutationAudit: z
      .object({
        state: z.literal("not_recorded"),
        required: z.literal(true),
        model: z.literal("ControlledMutationAudit"),
        appendOnly: z.literal(true),
        requiredBindings: z.tuple([
          z.literal("contractSha256"),
          z.literal("planSha256"),
          z.literal("beforeSnapshotSha256"),
          z.literal("afterSnapshotSha256"),
          z.literal("dependencyStateSha256"),
          z.literal("databaseIdentityUuid"),
          z.literal("targetFingerprintSha256"),
          z.literal("backupSha256"),
          z.literal("backupMetadataSha256"),
          z.literal("restoreReceiptSha256"),
          z.literal("operatorId"),
          z.literal("authorizationRef"),
          z.literal("databaseRole"),
        ]),
        statement: z.string().min(1),
      })
      .strict(),
    postRegistrationRecoveryAndReceipt: z
      .object({
        state: z.literal("not_started"),
        required: z.literal(true),
        exactPrivateRecoveryRowsRequired: z.literal(true),
        freshControlledPrivateAccessReceiptRequired: z.literal(true),
        receiptMustBindCanonicalLifecycleSourceId: z.literal(true),
        preRegistrationReceiptCannotSatisfyGate: z.literal(true),
        statement: z.string().min(1),
      })
      .strict(),
    rebaseline: z
      .object({
        state: z.literal("not_started"),
        required: z.literal(true),
        exactAfterSnapshotRequired: z.literal(true),
        corpusInventoryRegenerationRequired: z.literal(true),
        lifecycleInitializationRequired: z.literal(true),
        identityRemainsProvisional: z.literal(true),
        coveragePromotionAllowed: z.literal(false),
        statement: z.string().min(1),
      })
      .strict(),
  })
  .strict();

const sourceRegistrationPlanBodySchema = z
  .object({
    schemaVersion: z.literal(SOURCE_REGISTRATION_PLAN_SCHEMA_VERSION),
    artifactType: z.literal("source_registration_dry_run_plan"),
    planVersion: z.literal(SOURCE_REGISTRATION_PLAN_VERSION),
    contractVersion: z.literal(SOURCE_REGISTRATION_CONTRACT_VERSION),
    mode: z.literal("read_only_dry_run"),
    batchId: identifierSchema,
    preparedOn: dateSchema,
    observedAt: dateTimeSchema,
    contractSha256: sha256Schema,
    inputBindings: artifactBindingsSchema,
    beforeSnapshot: databaseBeforeSnapshotSchema,
    targets: z.array(sourceRegistrationTargetPlanSchema).length(10),
    summary: z
      .object({
        targetCount: z.literal(10),
        pendingCount: z.number().int().nonnegative(),
        alreadyRegisteredCount: z.number().int().nonnegative(),
        conflictCount: z.number().int().nonnegative(),
        privateRecoveryAppendCount: z.number().int().nonnegative(),
        pageCount: z.number().int().positive(),
        normalizedWordCount: z.number().int().nonnegative(),
      })
      .strict(),
    executionBoundary: z
      .object({
        networkAccessPerformed: z.literal(false),
        databaseTransactionReadOnly: z.literal(true),
        databaseMutationPerformed: z.literal(false),
        privateArchiveMutationPerformed: z.literal(false),
        privateRecoveryRegisterMutationPerformed: z.literal(false),
        corpusRegisterMutationPerformed: z.literal(false),
        lifecycleEventMutationPerformed: z.literal(false),
        sourceTextStoredInPlan: z.literal(false),
        privateAbsolutePathsStoredInPlan: z.literal(false),
        applyCliEnabled: z.literal(false),
      })
      .strict(),
    releaseGates: releaseGatesSchema,
  })
  .strict();

export const SourceRegistrationPlanSchema = sourceRegistrationPlanBodySchema
  .extend({
    planSha256: sha256Schema,
  })
  .strict();

export type SourceRegistrationPlanBody = z.infer<
  typeof sourceRegistrationPlanBodySchema
>;
export type SourceRegistrationPlan = z.infer<
  typeof SourceRegistrationPlanSchema
>;

export function parseSourceRegistrationBatch(
  value: unknown,
): SourceRegistrationBatch {
  const batch = SourceRegistrationBatchSchema.parse(value);
  const targetIds = batch.targets.map((target) => target.targetId);
  const candidateKeys = batch.targets.map(
    (target) => target.preRegistrationCandidateKey,
  );
  const documentIds = batch.targets.map((target) => target.document.id);
  const slugs = batch.targets.map((target) => target.document.slug);
  const paths = batch.targets.map((target) => target.document.filePath);
  const hashes = batch.targets.map((target) => target.source.rawContentSha256);
  const receiptPaths = batch.targets.map(
    (target) => target.source.acquisitionReceiptPath,
  );
  for (const [label, values] of [
    ["target IDs", targetIds],
    ["candidate keys", candidateKeys],
    ["Document IDs", documentIds],
    ["Document slugs", slugs],
    ["Document paths", paths],
    ["content hashes", hashes],
    ["receipt paths", receiptPaths],
  ] as const) {
    if (new Set(values).size !== values.length) {
      throw new Error(`Source-registration batch has duplicate ${label}`);
    }
  }
  for (const target of batch.targets) {
    if (target.document.id !== target.document.slug) {
      throw new Error(`${target.targetId}: Document ID and slug must match`);
    }
    const expectedSourceId = target.preRegistrationCandidateKey.replace(
      /^candidate:/,
      "",
    );
    if (!expectedSourceId.startsWith("source.")) {
      throw new Error(`${target.targetId}: invalid candidate source ID`);
    }
    if (
      target.document.tags.join("\0") !==
      [...target.document.tags].sort().join("\0")
    ) {
      throw new Error(`${target.targetId}: tags must be sorted`);
    }
  }
  return batch;
}

export function documentTargetDataContract(
  row: Omit<
    IntendedDocumentRow,
    "createdAt" | "updatedAt" | "targetDataSha256"
  >,
): SourceRegistrationJsonValue {
  return {
    id: row.id,
    slug: row.slug,
    filePath: row.filePath,
    title: row.title,
    author: row.author,
    year: row.year,
    documentType: row.documentType,
    category: row.category,
    subcategory: row.subcategory,
    country: row.country,
    contentSha256: row.contentBinding.sha256,
    contentSizeBytes: row.contentBinding.sizeBytes,
    summary: row.summary,
    url: row.url,
    accessedAt: row.accessedAt,
    archivedUrl: row.archivedUrl,
    wordCount: row.wordCount,
    tags: row.tags,
    metadata: row.metadata,
  };
}

export function libraryTargetDataContract(
  row: Omit<IntendedLibraryRow, "createdAt" | "updatedAt" | "targetDataSha256">,
): SourceRegistrationJsonValue {
  return {
    id: row.id,
    sourceKind: row.sourceKind,
    sourceKey: row.sourceKey,
    documentId: row.documentId,
    sourceDocId: row.sourceDocId,
    canonicalPath: row.canonicalPath,
    title: row.title,
    status: row.status,
    usageRule: row.usageRule,
    reviewStatus: row.reviewStatus,
    citationReadiness: row.citationReadiness,
    analysisTier: row.analysisTier,
    aiCard: row.aiCard,
    aiSummary: row.aiSummary,
    keyFindings: row.keyFindings,
    claimCandidates: row.claimCandidates,
    projectImplications: row.projectImplications,
    gaps: row.gaps,
    controlLinks: row.controlLinks,
    riskFlags: row.riskFlags,
    contentHash: row.contentHash,
    wordCount: row.wordCount,
    processedAt: row.processedAt,
    reviewedAt: row.reviewedAt,
    reviewer: row.reviewer,
  } as unknown as SourceRegistrationJsonValue;
}

export function documentTargetDataSha256(
  row: Omit<
    IntendedDocumentRow,
    "createdAt" | "updatedAt" | "targetDataSha256"
  >,
): string {
  return hashSourceRegistrationJson(
    SOURCE_REGISTRATION_TARGET_HASH_DOMAIN,
    documentTargetDataContract(row),
  );
}

export function libraryTargetDataSha256(
  row: Omit<IntendedLibraryRow, "createdAt" | "updatedAt" | "targetDataSha256">,
): string {
  return hashSourceRegistrationJson(
    SOURCE_REGISTRATION_TARGET_HASH_DOMAIN,
    libraryTargetDataContract(row),
  );
}

export function sealDatabaseBeforeSnapshot(
  body: DatabaseBeforeSnapshotBody,
): DatabaseBeforeSnapshot {
  const parsed = databaseBeforeSnapshotBodySchema.parse(body);
  return databaseBeforeSnapshotSchema.parse({
    ...parsed,
    beforeSnapshotSha256: hashSourceRegistrationJson(
      SOURCE_REGISTRATION_SNAPSHOT_HASH_DOMAIN,
      parsed as unknown as SourceRegistrationJsonValue,
    ),
  });
}

export function verifyDatabaseBeforeSnapshot(
  value: unknown,
): DatabaseBeforeSnapshot {
  const parsed = databaseBeforeSnapshotSchema.parse(value);
  const { beforeSnapshotSha256, ...body } = parsed;
  const expected = hashSourceRegistrationJson(
    SOURCE_REGISTRATION_SNAPSHOT_HASH_DOMAIN,
    body as unknown as SourceRegistrationJsonValue,
  );
  if (beforeSnapshotSha256 !== expected) {
    throw new Error("Source-registration before-snapshot self-hash mismatch");
  }
  return parsed;
}

export function sourceRegistrationContractManifest(): SourceRegistrationJsonValue {
  return {
    version: SOURCE_REGISTRATION_CONTRACT_VERSION,
    operation: "register-ten-provisional-official-document-identities",
    sourceBatchSchema: "source-registration-batch-v1",
    contentSerialization: SOURCE_REGISTRATION_DOCUMENT_CONTENT_SERIALIZATION,
    databaseModels: [
      "Document",
      "LibraryAnalysisRecord",
      "ControlledMutationAudit",
    ],
    dryRunBoundary: {
      readOnlyDatabaseTransaction: true,
      networkAccess: false,
      databaseMutation: false,
      privateArchiveMutation: false,
      privateRegisterMutation: false,
      lifecycleMutation: false,
      applyImplementation: "disabled_not_implemented",
    },
    classification: {
      pending: "no Document or LibraryAnalysisRecord collision",
      alreadyRegistered:
        "one exact Document and one exact LibraryAnalysisRecord target row",
      conflict:
        "any non-exact, duplicate, mixed, partial or private-recovery collision",
    },
    releaseRequirements: [
      "owner_scope_authorization_for_bounded_dry_run_only",
      "separate_exact_plan_operator_authorization",
      "verified_backup_metadata_v2",
      "verified_restore_receipt_v1",
      "exact_plan_hash_authorization",
      "serializable_transaction_with_snapshot_cas",
      "atomic_controlled_mutation_audit",
      "fresh_post_registration_private_acquisition_receipt",
      "exact_after_snapshot_and_corpus_rebaseline",
    ],
    promotionBoundary: {
      identityVerified: false,
      sourceAnalysisAllowed: false,
      rightsCleared: false,
      externalUseAllowed: false,
      coveragePromotionAllowed: false,
    },
  };
}

export function sourceRegistrationContractSha256(): string {
  return hashSourceRegistrationJson(
    "food-systems-2026:source-registration-contract:v1\0",
    sourceRegistrationContractManifest(),
  );
}

export function defaultSourceRegistrationReleaseGates(): z.infer<
  typeof releaseGatesSchema
> {
  return {
    applyImplementation: {
      state: "disabled_not_implemented",
      required: true,
      statement:
        "This task deliberately provides no apply path; a separately reviewed implementation is required.",
    },
    ownerScopeAuthorization: {
      state: "recorded_for_bounded_dry_run_only",
      required: true,
      exactPlanHashReviewed: false,
      applyAuthorized: false,
      statement:
        "The active project objective authorizes this bounded read-only planning work only; it does not prove review of this plan hash or authorize apply.",
    },
    backupAndRestore: {
      state: "not_bound",
      required: true,
      backupMetadataVersion: 2,
      restoreReceiptVersion: 1,
      exactDatabaseIdentityRequired: true,
      exactTargetFingerprintRequired: true,
      statement:
        "A fresh backup and independently successful restore receipt must bind the same database identity and target fingerprint.",
    },
    exactPlanAuthorization: {
      state: "not_recorded",
      required: true,
      exactPlanSha256Required: true,
      operatorAuthorityRequired: true,
      writableNonMcpRoleRequired: true,
      statement:
        "Authorization must name the exact plan hash, operator and controlled writable database role.",
    },
    serializableTransaction: {
      state: "not_executed",
      required: true,
      isolationLevel: "Serializable",
      advisoryLockRequired: true,
      beforeSnapshotCasRequired: true,
      documentAndLibraryRowsAtomic: true,
      controlledMutationAuditAtomic: true,
      statement:
        "A future writer must re-read and match the exact before snapshot under lock before any atomic insert.",
    },
    controlledMutationAudit: {
      state: "not_recorded",
      required: true,
      model: "ControlledMutationAudit",
      appendOnly: true,
      requiredBindings: [
        "contractSha256",
        "planSha256",
        "beforeSnapshotSha256",
        "afterSnapshotSha256",
        "dependencyStateSha256",
        "databaseIdentityUuid",
        "targetFingerprintSha256",
        "backupSha256",
        "backupMetadataSha256",
        "restoreReceiptSha256",
        "operatorId",
        "authorizationRef",
        "databaseRole",
      ],
      statement:
        "The append-only audit row must be written atomically with the exact Document and LibraryAnalysisRecord rows.",
    },
    postRegistrationRecoveryAndReceipt: {
      state: "not_started",
      required: true,
      exactPrivateRecoveryRowsRequired: true,
      freshControlledPrivateAccessReceiptRequired: true,
      receiptMustBindCanonicalLifecycleSourceId: true,
      preRegistrationReceiptCannotSatisfyGate: true,
      statement:
        "After registration, append the exact portable recovery rows and issue fresh controlled-private receipts bound to each new canonical lifecycle source ID.",
    },
    rebaseline: {
      state: "not_started",
      required: true,
      exactAfterSnapshotRequired: true,
      corpusInventoryRegenerationRequired: true,
      lifecycleInitializationRequired: true,
      identityRemainsProvisional: true,
      coveragePromotionAllowed: false,
      statement:
        "Rebuild the corpus inventory and initialize provisional lifecycle rows from the verified after state without promoting identity, analysis or coverage.",
    },
  };
}

export function sealSourceRegistrationPlan(
  body: SourceRegistrationPlanBody,
): SourceRegistrationPlan {
  const parsed = sourceRegistrationPlanBodySchema.parse(body);
  return SourceRegistrationPlanSchema.parse({
    ...parsed,
    planSha256: hashSourceRegistrationJson(
      SOURCE_REGISTRATION_PLAN_HASH_DOMAIN,
      parsed as unknown as SourceRegistrationJsonValue,
    ),
  });
}

function expectedSummary(plan: SourceRegistrationPlan) {
  return {
    targetCount: 10 as const,
    pendingCount: plan.targets.filter((target) => target.state === "pending")
      .length,
    alreadyRegisteredCount: plan.targets.filter(
      (target) => target.state === "already_registered",
    ).length,
    conflictCount: plan.targets.filter((target) => target.state === "conflict")
      .length,
    privateRecoveryAppendCount: plan.targets.filter(
      (target) => target.privateRecoveryState === "pending_append",
    ).length,
    pageCount: plan.targets.reduce(
      (sum, target) =>
        sum + target.intendedDocumentRow.contentBinding.pageCount,
      0,
    ),
    normalizedWordCount: plan.targets.reduce(
      (sum, target) => sum + target.intendedDocumentRow.wordCount,
      0,
    ),
  };
}

export function validateSourceRegistrationPlan(
  value: unknown,
): SourceRegistrationPlan {
  const plan = SourceRegistrationPlanSchema.parse(value);
  verifyDatabaseBeforeSnapshot(plan.beforeSnapshot);
  const { planSha256, ...body } = plan;
  const expectedPlanSha256 = hashSourceRegistrationJson(
    SOURCE_REGISTRATION_PLAN_HASH_DOMAIN,
    body as unknown as SourceRegistrationJsonValue,
  );
  if (planSha256 !== expectedPlanSha256) {
    throw new Error("Source-registration plan self-hash mismatch");
  }
  if (plan.contractSha256 !== sourceRegistrationContractSha256()) {
    throw new Error("Source-registration contract hash mismatch");
  }
  if (plan.observedAt !== plan.beforeSnapshot.observedAt) {
    throw new Error("Plan and database snapshot observation times differ");
  }
  if (
    canonicalSourceRegistrationJson(plan.summary) !==
    canonicalSourceRegistrationJson(expectedSummary(plan))
  ) {
    throw new Error("Source-registration plan summary mismatch");
  }
  const sortedTargetIds = plan.targets
    .map((target) => target.targetId)
    .sort((left, right) => left.localeCompare(right));
  if (
    plan.targets.map((target) => target.targetId).join("\0") !==
    sortedTargetIds.join("\0")
  ) {
    throw new Error("Source-registration plan targets must be sorted");
  }
  for (const target of plan.targets) {
    const expectedIdentityKey = canonicalDocumentIdentityKey(
      target.intendedDocumentRow.id,
    );
    if (
      target.canonicalIdentityKey !== expectedIdentityKey ||
      target.intendedLibraryAnalysisRow.sourceKey !== expectedIdentityKey ||
      target.intendedPrivateRecoveryRow.identityKey !== expectedIdentityKey
    ) {
      throw new Error(
        `${target.targetId}: canonical identity binding mismatch`,
      );
    }
    if (
      target.lifecycleSourceId !==
        lifecycleSourceIdForIdentity(expectedIdentityKey) ||
      target.intendedDocumentRow.metadata.registration.lifecycleSourceId !==
        target.lifecycleSourceId
    ) {
      throw new Error(`${target.targetId}: lifecycle source ID mismatch`);
    }
    const {
      createdAt: _documentCreatedAt,
      updatedAt: _documentUpdatedAt,
      targetDataSha256: _documentTargetHash,
      ...documentBody
    } = target.intendedDocumentRow;
    if (
      documentTargetDataSha256(documentBody) !==
      target.intendedDocumentRow.targetDataSha256
    ) {
      throw new Error(`${target.targetId}: Document target hash mismatch`);
    }
    const {
      createdAt: _libraryCreatedAt,
      updatedAt: _libraryUpdatedAt,
      targetDataSha256: _libraryTargetHash,
      ...libraryBody
    } = target.intendedLibraryAnalysisRow;
    if (
      libraryTargetDataSha256(libraryBody) !==
      target.intendedLibraryAnalysisRow.targetDataSha256
    ) {
      throw new Error(
        `${target.targetId}: LibraryAnalysisRecord target hash mismatch`,
      );
    }
    if (target.state === "pending" && target.conflicts.length > 0) {
      throw new Error(
        `${target.targetId}: pending target cannot have conflicts`,
      );
    }
    if (target.state === "already_registered" && target.conflicts.length > 0) {
      throw new Error(
        `${target.targetId}: exact registered target cannot have conflicts`,
      );
    }
    if (target.state === "conflict" && target.conflicts.length === 0) {
      throw new Error(`${target.targetId}: conflict target requires evidence`);
    }
  }
  return plan;
}
