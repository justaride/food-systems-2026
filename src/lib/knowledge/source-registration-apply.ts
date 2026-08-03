import { createHash } from "node:crypto";

import { z } from "zod";

import {
  canonicalSourceRegistrationJson,
  sourceRegistrationSha256,
  validateSourceRegistrationPlan,
  type SourceRegistrationJsonValue,
  type SourceRegistrationPlan,
} from "./source-registration-plan";

export const SOURCE_REGISTRATION_APPLY_SCHEMA_VERSION =
  "source-registration-apply-receipt-v1" as const;
export const SOURCE_REGISTRATION_APPLY_CONTRACT_VERSION = "1.0.0" as const;
export const SOURCE_REGISTRATION_APPLY_CONTRACT_SCOPE =
  "source-registration.new-official-2026-08-02.apply-v1" as const;
export const SOURCE_REGISTRATION_APPLY_PLAN_PATH =
  "knowledge/corpus/source-registration/source-registration-dry-run-plan-2026-08-03.v1.json" as const;
export const SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_SHA256 =
  "631fef2595bf8f9e897485c1f064654716a3bdb2591bbfb20227370d496a4e2f" as const;
export const SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_FILE_SHA256 =
  "7a8de0151ad9d0c77bb7bb47a01c3bd08922805e933a5b379aea3dd59b84def9" as const;
export const SOURCE_REGISTRATION_APPLY_LOCKED_BEFORE_SNAPSHOT_SHA256 =
  "77ac2b8fb968b573f53448522d1bf121012d9b19f3ab8f131b23e599e53d44b5" as const;
export const SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_IDENTITY_UUID =
  "90e3e24d-230f-42f7-b178-5bcd5b861e84" as const;
export const SOURCE_REGISTRATION_APPLY_TARGET_COUNT = 10 as const;
export const SOURCE_REGISTRATION_APPLY_LOCKED_TARGET_SET_SHA256 =
  "41c41a249cc54f0cad6cb4906a5b97b9d755bcd27d8830a990ed1d4eecb7264f" as const;
export const SOURCE_REGISTRATION_APPLY_ACK =
  "REGISTER_10_LOCKED_OFFICIAL_SOURCES_PLAN_631FEF2595BF" as const;
export const SOURCE_REGISTRATION_APPLY_AI_OPERATOR_ID =
  "codex-ai:food-systems-2026-local-operator" as const;
export const SOURCE_REGISTRATION_APPLY_OWNER_SCOPE_AUTHORIZATION_REF =
  "owner-scope:food-systems-2026-bounded-project-work" as const;
export const SOURCE_REGISTRATION_APPLY_DATABASE_ROLE = "foodsystems" as const;
export const SOURCE_REGISTRATION_APPLY_ADVISORY_LOCK_KEY =
  "6538086643221537792" as const;
export const SOURCE_REGISTRATION_APPLY_DATABASE_TARGET_SCHEMA_VERSION =
  "source-registration-database-target-v1" as const;
export const SOURCE_REGISTRATION_APPLY_DATABASE_CATALOG_SCHEMA_VERSION =
  "source-registration-database-catalog-v2" as const;
export const SOURCE_REGISTRATION_APPLY_RUNTIME_ATTESTATION_SCHEMA_VERSION =
  "source-registration-runtime-attestation-v1" as const;
export const SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_TARGET = {
  databaseName: "foodsystems",
  systemIdentifier: "7620055716543368057",
  serverAddressCidr: "127.0.0.1/32",
  serverPort: 5432,
  serverVersionNum: 160013,
} as const;
export const SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_TARGET_SHA256 =
  "56afe01ba2f7acafa069c55e5cef1b7f380ae7d3a6f77b01da72509ce652ee5f" as const;
export const SOURCE_REGISTRATION_APPLY_DATABASE_CATALOG_SCOPE =
  "public.Document+LibraryAnalysisRecord+ControlledMutationAudit+DatabaseIdentity" as const;
export const SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_CATALOG_SHA256 =
  "7d8bdb71153177983fbe5d191b06a1cb3d8635e5b0f91a1d0eff0a0e942f8e10" as const;
export const SOURCE_REGISTRATION_APPLY_LOCKED_POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_SHA256 =
  "2f102d12bb738a5ec935e52a76cb6b156e58d86ef8e56a2bef3711c087de7bf0" as const;
export const SOURCE_REGISTRATION_APPLY_LOCKED_POSTGRESQL_TOOLSET_RUNTIME_MANIFEST_SHA256 =
  "7d0ac827430cd0d60c3884ac98fc5769223861fee17a18dd9375b10852fd8fdb" as const;
export const SOURCE_REGISTRATION_APPLY_LOCKED_POSTGRESQL_TOOLSET_RUNTIME_VERIFIER_SHA256 =
  "f5f0fb008f87f26246d39fbc3583742da49d3b257a0658178486d78e2d7ec0c7" as const;
export const SOURCE_REGISTRATION_APPLY_LOCKED_NODE_RUNTIME_CLOSURE_SHA256 =
  "464410ef7bbe3c4da7468973f47a43442b51ef7ff3455d810dcf8f3b7ae4e434" as const;

const APPLY_CONTRACT_HASH_DOMAIN =
  "food-systems-2026:source-registration-apply-contract:v1\0";
const APPLY_OPERATION_HASH_DOMAIN =
  "food-systems-2026:source-registration-apply-operation:v1\0";
const APPLY_DEPENDENCY_HASH_DOMAIN =
  "food-systems-2026:source-registration-apply-dependency:v1\0";
const APPLY_AFTER_SNAPSHOT_HASH_DOMAIN =
  "food-systems-2026:source-registration-apply-after-snapshot:v1\0";
const APPLY_SUMMARY_HASH_DOMAIN =
  "food-systems-2026:source-registration-apply-summary:v1\0";
const APPLY_TARGET_SET_HASH_DOMAIN =
  "food-systems-2026:source-registration-apply-target-set:v1\0";
const APPLY_DATABASE_TARGET_HASH_DOMAIN =
  "food-systems-2026:source-registration-database-target:v1\0";
const APPLY_DATABASE_CATALOG_HASH_DOMAIN =
  "food-systems-2026:source-registration-database-catalog:v1\0";
const APPLY_RUNTIME_ATTESTATION_HASH_DOMAIN =
  "food-systems-2026:source-registration-runtime-attestation:v1\0";
const APPLY_CODE_BINDINGS_HASH_DOMAIN =
  "food-systems-2026:source-registration-code-bindings:v1\0";

const BARE_SHA256_PATTERN = /^[a-f0-9]{64}$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DATE_TIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;
const SAFE_CONTROL_TEXT_PATTERN = /^[^\u0000-\u001f\u007f]+$/;
const PORTABLE_PATH_PATTERN = /^[a-z0-9][a-zA-Z0-9._/-]*$/;

const bareSha256Schema = z.string().regex(BARE_SHA256_PATTERN);
const uuidSchema = z.string().regex(UUID_PATTERN);
const dateTimeSchema = z
  .string()
  .regex(DATE_TIME_PATTERN)
  .refine(
    (value) => Number.isFinite(Date.parse(value)),
    "Invalid UTC timestamp",
  );
const safeControlTextSchema = z
  .string()
  .min(1)
  .max(2_000)
  .regex(SAFE_CONTROL_TEXT_PATTERN)
  .refine((value) => value === value.trim(), "Control text must be trimmed");
const ownerScopeAuthorizationRefSchema = z.literal(
  SOURCE_REGISTRATION_APPLY_OWNER_SCOPE_AUTHORIZATION_REF,
);
const exactOperatorAuthorizationRefSchema = z
  .string()
  .max(2_000)
  .regex(
    /^exact-plan-operator:codex-ai:food-systems-2026-local-operator;plan-sha256:[a-f0-9]{64};apply-contract-sha256:[a-f0-9]{64};database-target-sha256:[a-f0-9]{64};database-catalog-sha256:[a-f0-9]{64};runtime-attestation-sha256:[a-f0-9]{64};authorization-envelope-sha256:[a-f0-9]{64}$/,
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
        message: "Expected a normalized portable relative path",
      });
    }
  });

export function sourceRegistrationApplyBareSha256(
  value: string | Buffer,
): string {
  return createHash("sha256").update(value).digest("hex");
}

export function sourceRegistrationDatabaseFingerprintSha256(input: {
  completedPrismaMigrationLedger: { completedCount: number; sha256: string };
  coreCounts: SourceRegistrationBackupCoreCounts;
  databaseIdentity: { key: "primary"; uuid: string };
}): string {
  const coreCounts = backupCoreCountsSchema.parse(input.coreCounts);
  if (
    !Number.isSafeInteger(
      input.completedPrismaMigrationLedger.completedCount,
    ) ||
    input.completedPrismaMigrationLedger.completedCount <= 0 ||
    !BARE_SHA256_PATTERN.test(input.completedPrismaMigrationLedger.sha256) ||
    input.databaseIdentity.key !== "primary" ||
    !UUID_PATTERN.test(input.databaseIdentity.uuid)
  ) {
    throw new Error("Database fingerprint payload is invalid");
  }
  return sourceRegistrationApplyBareSha256(
    canonicalSourceRegistrationJson({
      completedPrismaMigrationLedger: input.completedPrismaMigrationLedger,
      coreCounts,
      databaseIdentity: {
        key: "primary",
        uuid: input.databaseIdentity.uuid.toLowerCase(),
      },
    }),
  );
}

function domainHash(
  domain: string,
  value: SourceRegistrationJsonValue,
): string {
  return sourceRegistrationApplyBareSha256(
    `${domain}${canonicalSourceRegistrationJson(value)}`,
  );
}

const PRIVATE_ABSOLUTE_PATH_PATTERNS = [
  /(?:^|[\s:("'=])\/(?!\/)/,
  /^~\//,
  /file:\/\//i,
  /(?:^|[\s("'=])[A-Za-z]:[\\/]/,
  /(?:^|[\s:("'=])\\\\[^\\\s]+\\/,
] as const;
const CREDENTIAL_BEARING_TEXT_PATTERNS = [
  /postgres(?:ql)?:\/\//i,
  /\b[a-z][a-z0-9+.-]*:\/\/[^/@\s:]+:[^/@\s]+@/i,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/,
  /(?:^|[?&;\s])(password|passwd|secret|token|api[_-]?key)=/i,
  /authorization:\s*bearer\s+/i,
] as const;
const SOURCE_TEXT_FIELD_NAMES = new Set([
  "content",
  "normalizedText",
  "sourceText",
]);

export function sourceRegistrationAuditLeakFacts(value: unknown): {
  credentialBearingTextStoredInAudit: boolean;
  privateAbsolutePathsStoredInAudit: boolean;
  sourceTextStoredInAudit: boolean;
} {
  const facts = {
    credentialBearingTextStoredInAudit: false,
    privateAbsolutePathsStoredInAudit: false,
    sourceTextStoredInAudit: false,
  };
  const visit = (current: unknown, key?: string): void => {
    if (typeof current === "string") {
      if (
        PRIVATE_ABSOLUTE_PATH_PATTERNS.some((pattern) => pattern.test(current))
      ) {
        facts.privateAbsolutePathsStoredInAudit = true;
      }
      if (
        CREDENTIAL_BEARING_TEXT_PATTERNS.some((pattern) =>
          pattern.test(current),
        )
      ) {
        facts.credentialBearingTextStoredInAudit = true;
      }
      if (key && SOURCE_TEXT_FIELD_NAMES.has(key) && current.length > 0) {
        facts.sourceTextStoredInAudit = true;
      }
      return;
    }
    if (Array.isArray(current)) {
      for (const item of current) visit(item);
      return;
    }
    if (current && typeof current === "object") {
      for (const [childKey, childValue] of Object.entries(current)) {
        visit(childValue, childKey);
      }
    }
  };
  visit(value);
  return facts;
}

export function validateSourceRegistrationRuntimeAttestation(
  value: unknown,
): SourceRegistrationRuntimeAttestation {
  const attestation = SourceRegistrationRuntimeAttestationSchema.parse(value);
  const { runtimeAttestationSha256, ...body } = attestation;
  const expected = domainHash(
    APPLY_RUNTIME_ATTESTATION_HASH_DOMAIN,
    body as unknown as SourceRegistrationJsonValue,
  );
  if (runtimeAttestationSha256 !== expected) {
    throw new Error(
      "Source-registration runtime attestation self-hash mismatch",
    );
  }
  return attestation;
}

export function sealSourceRegistrationDatabaseTarget(value: {
  schemaVersion: typeof SOURCE_REGISTRATION_APPLY_DATABASE_TARGET_SCHEMA_VERSION;
  databaseName: string;
  systemIdentifier: string;
  serverAddressCidr: string;
  serverPort: number;
  serverVersionNum: number;
}): SourceRegistrationDatabaseTarget {
  const body = databaseTargetBodySchema.parse(value);
  const databaseTargetSha256 = domainHash(
    APPLY_DATABASE_TARGET_HASH_DOMAIN,
    body as unknown as SourceRegistrationJsonValue,
  );
  if (
    databaseTargetSha256 !==
    SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_TARGET_SHA256
  ) {
    throw new Error("Source-registration database target hash drift");
  }
  return SourceRegistrationDatabaseTargetSchema.parse({
    ...body,
    databaseTargetSha256,
  });
}

export function sourceRegistrationDatabaseCatalogSha256(
  catalogSnapshot: SourceRegistrationJsonValue,
): string {
  return domainHash(APPLY_DATABASE_CATALOG_HASH_DOMAIN, catalogSnapshot);
}

export function sealSourceRegistrationDatabaseCatalogAttestation(input: {
  catalogSnapshot: SourceRegistrationJsonValue;
  relationCount: number;
  nonInternalTriggerCount: number;
  generatedExpressionFunctionCount: number;
  unexpectedWriteSurfaceCount: number;
}): SourceRegistrationDatabaseCatalogAttestation {
  const catalogSha256 = sourceRegistrationDatabaseCatalogSha256(
    input.catalogSnapshot,
  );
  if (
    catalogSha256 !== SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_CATALOG_SHA256
  ) {
    throw new Error(
      `Source-registration database catalog drift: ${catalogSha256}`,
    );
  }
  return SourceRegistrationDatabaseCatalogAttestationSchema.parse({
    schemaVersion: SOURCE_REGISTRATION_APPLY_DATABASE_CATALOG_SCHEMA_VERSION,
    scope: SOURCE_REGISTRATION_APPLY_DATABASE_CATALOG_SCOPE,
    catalogSha256,
    relationCount: input.relationCount,
    nonInternalTriggerCount: input.nonInternalTriggerCount,
    generatedExpressionFunctionCount: input.generatedExpressionFunctionCount,
    unexpectedWriteSurfaceCount: input.unexpectedWriteSurfaceCount,
  });
}

export const SOURCE_REGISTRATION_BACKUP_CORE_COUNT_KEYS = [
  "ControlledMutationAudit",
  "DatabaseIdentity",
  "Document",
  "EvidenceAppraisal",
  "FieldCitation",
  "LibraryAnalysisRecord",
  "Report",
  "SourceCitation",
  "SourceDoc",
  "Thesis",
] as const;

const backupCoreCountsSchema = z
  .object({
    ControlledMutationAudit: z.number().int().nonnegative(),
    DatabaseIdentity: z.literal(1),
    Document: z.number().int().nonnegative(),
    EvidenceAppraisal: z.number().int().nonnegative(),
    FieldCitation: z.number().int().nonnegative(),
    LibraryAnalysisRecord: z.number().int().nonnegative(),
    Report: z.number().int().nonnegative(),
    SourceCitation: z.number().int().nonnegative(),
    SourceDoc: z.number().int().nonnegative(),
    Thesis: z.number().int().nonnegative(),
  })
  .strict();

export type SourceRegistrationBackupCoreCounts = z.infer<
  typeof backupCoreCountsSchema
>;

export const SourceRegistrationReleaseEvidenceSchema = z
  .object({
    sourceDatabaseName: z.literal(
      SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_TARGET.databaseName,
    ),
    backupSha256: bareSha256Schema,
    backupBytes: z.number().int().positive(),
    backupMetadataSha256: bareSha256Schema,
    structuralRestoreReceiptSha256: bareSha256Schema,
    databaseIdentityUuid: uuidSchema,
    completedMigrationCount: z.number().int().positive(),
    completedMigrationLedgerSha256: bareSha256Schema,
    targetFingerprintSha256: bareSha256Schema,
    coreCounts: backupCoreCountsSchema,
    backupCreatedAtUtc: dateTimeSchema,
    structuralRestoreCompletedAtUtc: dateTimeSchema,
    logicalRestoreCompanion: z
      .object({
        receiptFileSha256: bareSha256Schema,
        completedAtUtc: dateTimeSchema,
        logicalComparisonStartedAtUtc: dateTimeSchema,
        logicalComparisonCompletedAtUtc: dateTimeSchema,
        logicalComparisonProofSha256: bareSha256Schema,
        source: z
          .object({
            contentStateSha256: bareSha256Schema,
            logicalStateSha256: bareSha256Schema,
            relationCount: z.number().int().positive(),
            totalRowCount: z.number().int().positive(),
            sequenceRowCount: z.number().int().nonnegative(),
          })
          .strict(),
        restored: z
          .object({
            contentStateSha256: bareSha256Schema,
            logicalStateSha256: bareSha256Schema,
            relationCount: z.number().int().positive(),
            totalRowCount: z.number().int().positive(),
            sequenceRowCount: z.number().int().nonnegative(),
          })
          .strict(),
        postRehearsalVerifiedAtUtc: dateTimeSchema,
        postRehearsalCloneFullStateMatched: z.literal(true),
        sourceStillMatched: z.literal(true),
        cloneDatabaseDropped: z.literal(true),
        cloneDatabaseAbsenceConfirmed: z.literal(true),
      })
      .strict(),
    logicalCloneRehearsal: z
      .object({
        receiptFileSha256: bareSha256Schema,
        receiptSelfSha256: bareSha256Schema,
        operationKey: safeControlTextSchema,
        runtimeAttestationSha256: bareSha256Schema,
        rehearsalStartedAtUtc: dateTimeSchema,
        rehearsalCompletedAtUtc: dateTimeSchema,
        targetSetSha256: z.literal(
          SOURCE_REGISTRATION_APPLY_LOCKED_TARGET_SET_SHA256,
        ),
        exactProductionTargetExercised: z.literal(false),
        productionAuthorizationUsed: z.literal(false),
        transactionRolledBack: z.literal(true),
        rollbackAbsenceConfirmed: z.literal(true),
      })
      .strict(),
    verification: z
      .object({
        metadataVersion: z.literal(2),
        structuralRestoreReceiptVersion: z.literal(1),
        logicalRestoreCompanionReceiptVersion: z.literal(1),
        logicalCloneRehearsalSchemaVersion: z.literal(
          "source-registration-logical-clone-rehearsal-v1",
        ),
        structuralVerifierPassed: z.literal(true),
        structuralRestoreCleanupPassed: z.literal(true),
        logicalRestoreCompanionValidated: z.literal(true),
        logicalCloneRehearsalValidated: z.literal(true),
        logicalRestoreCleanupPassed: z.literal(true),
        evidenceFilesUnchanged: z.literal(true),
      })
      .strict(),
  })
  .strict();

export type SourceRegistrationReleaseEvidence = z.infer<
  typeof SourceRegistrationReleaseEvidenceSchema
>;

export const SourceRegistrationApplyAuthorizationSchema = z
  .object({
    operatorId: z.literal(SOURCE_REGISTRATION_APPLY_AI_OPERATOR_ID),
    ownerScopeAuthorizationRef: ownerScopeAuthorizationRefSchema,
    exactOperatorAuthorizationRef: exactOperatorAuthorizationRefSchema,
    databaseRole: z.literal(SOURCE_REGISTRATION_APPLY_DATABASE_ROLE),
    ownerScopeMeaning: z.literal("bounded_project_scope_only"),
    ownerScopeExactPlanHashReviewed: z.literal(false),
    ownerScopeApplyAuthorized: z.literal(false),
    exactOperatorMeaning: z.literal("descriptive_cli_label_only"),
    exactOperatorApplyAuthorized: z.literal(false),
    signedReleaseAuthorizationMeaning: z.literal(
      "ed25519_exact_apply_authorization_controls_mutation",
    ),
    signedReleaseAuthorizationRequired: z.literal(true),
  })
  .strict();

export type SourceRegistrationApplyAuthorization = z.infer<
  typeof SourceRegistrationApplyAuthorizationSchema
>;

const resolvedTreeBindingSchema = z
  .object({
    entryCount: z.number().int().positive(),
    fileCount: z.number().int().positive(),
    path: portablePathSchema,
    rootKind: z.literal("resolved_external_symlink"),
    symlinkCount: z.number().int().nonnegative(),
    totalFileBytes: z.number().int().positive(),
    treeSha256: bareSha256Schema,
  })
  .strict();

const runtimeAttestationBodySchema = z
  .object({
    schemaVersion: z.literal(
      SOURCE_REGISTRATION_APPLY_RUNTIME_ATTESTATION_SCHEMA_VERSION,
    ),
    launcher: z
      .object({
        path: z.literal(
          "scripts/knowledge/launch-locked-source-registration-apply.mjs",
        ),
        fileSha256: bareSha256Schema,
      })
      .strict(),
    localClosure: z
      .object({
        closureSha256: bareSha256Schema,
        entryCount: z.number().int().positive(),
        roots: z.tuple([
          z.literal("package.json"),
          z.literal("knowledge/runtime/source-registration-tsx.runtime.json"),
          z.literal("scripts/knowledge/apply-source-registration-plan.ts"),
          z.literal(
            "scripts/knowledge/run-source-registration-logical-clone-rehearsal.ts",
          ),
          z.literal(
            "scripts/knowledge/run-controlled-logical-restore-companion.mjs",
          ),
          z.literal(
            "scripts/knowledge/logical-restore-receipt-pair-journal.mjs",
          ),
          z.literal(
            "scripts/knowledge/launch-locked-source-registration-apply.mjs",
          ),
          z.literal("scripts/knowledge/database-logical-state-digest.mjs"),
          z.literal("scripts/knowledge/verify-psql-runtime-closure.mjs"),
          z.literal("scripts/knowledge/verify-node-runtime-closure.mjs"),
          z.literal("scripts/knowledge/generate-source-registration-plan.ts"),
        ]),
        totalFileBytes: z.number().int().positive(),
      })
      .strict(),
    node: z
      .object({
        arch: safeControlTextSchema,
        binaryFileSha256: bareSha256Schema,
        platform: safeControlTextSchema,
        runtimeClosureManifestSha256: bareSha256Schema,
        runtimeClosureSha256: z.literal(
          SOURCE_REGISTRATION_APPLY_LOCKED_NODE_RUNTIME_CLOSURE_SHA256,
        ),
        runtimeClosureVerifierFileSha256: bareSha256Schema,
        version: safeControlTextSchema,
      })
      .strict(),
    nodeModules: resolvedTreeBindingSchema.extend({
      path: z.literal("node_modules"),
    }),
    prismaGeneratedClient: resolvedTreeBindingSchema.extend({
      path: z.literal("src/generated/prisma"),
    }),
    postgresqlToolset: z
      .object({
        closureSha256: z.literal(
          SOURCE_REGISTRATION_APPLY_LOCKED_POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_SHA256,
        ),
        manifestSha256: z.literal(
          SOURCE_REGISTRATION_APPLY_LOCKED_POSTGRESQL_TOOLSET_RUNTIME_MANIFEST_SHA256,
        ),
        psqlVersion: safeControlTextSchema,
        toolFileSha256: z
          .object({
            createdb: bareSha256Schema,
            dropdb: bareSha256Schema,
            pgRestore: bareSha256Schema,
            psql: bareSha256Schema,
          })
          .strict(),
        verifierFileSha256: z.literal(
          SOURCE_REGISTRATION_APPLY_LOCKED_POSTGRESQL_TOOLSET_RUNTIME_VERIFIER_SHA256,
        ),
      })
      .strict(),
  })
  .strict();

export const SourceRegistrationRuntimeAttestationSchema =
  runtimeAttestationBodySchema
    .extend({ runtimeAttestationSha256: bareSha256Schema })
    .strict();
export type SourceRegistrationRuntimeAttestation = z.infer<
  typeof SourceRegistrationRuntimeAttestationSchema
>;

const databaseTargetBodySchema = z
  .object({
    schemaVersion: z.literal(
      SOURCE_REGISTRATION_APPLY_DATABASE_TARGET_SCHEMA_VERSION,
    ),
    databaseName: z.literal(
      SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_TARGET.databaseName,
    ),
    systemIdentifier: z.literal(
      SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_TARGET.systemIdentifier,
    ),
    serverAddressCidr: z.literal(
      SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_TARGET.serverAddressCidr,
    ),
    serverPort: z.literal(
      SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_TARGET.serverPort,
    ),
    serverVersionNum: z.literal(
      SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_TARGET.serverVersionNum,
    ),
  })
  .strict();

export const SourceRegistrationDatabaseTargetSchema = databaseTargetBodySchema
  .extend({
    databaseTargetSha256: z.literal(
      SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_TARGET_SHA256,
    ),
  })
  .strict();
export type SourceRegistrationDatabaseTarget = z.infer<
  typeof SourceRegistrationDatabaseTargetSchema
>;

export const SourceRegistrationDatabaseCatalogAttestationSchema = z
  .object({
    schemaVersion: z.literal(
      SOURCE_REGISTRATION_APPLY_DATABASE_CATALOG_SCHEMA_VERSION,
    ),
    scope: z.literal(SOURCE_REGISTRATION_APPLY_DATABASE_CATALOG_SCOPE),
    catalogSha256: z.literal(
      SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_CATALOG_SHA256,
    ),
    relationCount: z.literal(4),
    nonInternalTriggerCount: z.literal(8),
    generatedExpressionFunctionCount: z.literal(2),
    unexpectedWriteSurfaceCount: z.literal(0),
  })
  .strict();
export type SourceRegistrationDatabaseCatalogAttestation = z.infer<
  typeof SourceRegistrationDatabaseCatalogAttestationSchema
>;

export const SourceRegistrationAuditDurabilitySchema = z
  .object({
    state: z.literal("trigger_protected_append_only_current_state"),
    independentlyImmutable: z.literal(false),
    ownerTamperable: z.literal(true),
    externalRootAnchorRequired: z.literal(true),
    externalRootAnchorState: z.literal("pending"),
  })
  .strict();
export type SourceRegistrationAuditDurability = z.infer<
  typeof SourceRegistrationAuditDurabilitySchema
>;

export const SourceRegistrationReleaseAuthorizationSchema = z
  .object({
    envelopeSha256: bareSha256Schema,
    keyId: safeControlTextSchema,
    algorithm: z.literal("Ed25519"),
    authorizationId: uuidSchema,
    authorizationScope: z.literal(
      "source-registration.new-official-2026-08-02.exact-apply",
    ),
    acknowledgement: z.literal(SOURCE_REGISTRATION_APPLY_ACK),
    operatorId: z.literal(SOURCE_REGISTRATION_APPLY_AI_OPERATOR_ID),
    databaseRole: z.literal(SOURCE_REGISTRATION_APPLY_DATABASE_ROLE),
    operatorAuthorityClass: z.literal(
      "codex_ai_local_operator_pre_human_validation",
    ),
    humanApprovalClaimed: z.literal(false),
    ownerExactHashReviewClaimed: z.literal(false),
    expertValidationClaimed: z.literal(false),
    rightsHolderApprovalClaimed: z.literal(false),
    authorizedAtUtc: dateTimeSchema,
    notBeforeUtc: dateTimeSchema,
    expiresAtUtc: dateTimeSchema,
    nonceSha256: bareSha256Schema,
    planSha256: z.literal(SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_SHA256),
    planFileSha256: z.literal(
      SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_FILE_SHA256,
    ),
    beforeSnapshotSha256: z.literal(
      SOURCE_REGISTRATION_APPLY_LOCKED_BEFORE_SNAPSHOT_SHA256,
    ),
    databaseIdentityUuid: z.literal(
      SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_IDENTITY_UUID,
    ),
    sourceDatabaseName: z.literal(
      SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_TARGET.databaseName,
    ),
    applyContractSha256: bareSha256Schema,
    dependencyStateSha256: bareSha256Schema,
    operationKey: safeControlTextSchema,
    codeBindingsSha256: bareSha256Schema,
    databaseTargetSha256: z.literal(
      SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_TARGET_SHA256,
    ),
    databaseCatalogSha256: z.literal(
      SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_CATALOG_SHA256,
    ),
    contentStateSha256: bareSha256Schema,
    backupSha256: bareSha256Schema,
    backupBytes: z.number().int().positive(),
    backupMetadataSha256: bareSha256Schema,
    structuralRestoreReceiptSha256: bareSha256Schema,
    logicalRestoreCompanionReceiptSha256: bareSha256Schema,
    logicalCloneRehearsalReceiptFileSha256: bareSha256Schema,
    logicalCloneRehearsalReceiptSelfSha256: bareSha256Schema,
    completedMigrationLedgerSha256: bareSha256Schema,
    targetFingerprintSha256: bareSha256Schema,
    targetSetSha256: bareSha256Schema,
    structuralRestoreCompletedAtUtc: dateTimeSchema,
    logicalRestoreCompanionCompletedAtUtc: dateTimeSchema,
    logicalComparisonProofSha256: bareSha256Schema,
    logicalCloneRehearsalOperationKey: safeControlTextSchema,
    logicalCloneRehearsalRuntimeAttestationSha256: bareSha256Schema,
    logicalCloneRehearsalCompletedAtUtc: dateTimeSchema,
    restoreRunnerSha256: bareSha256Schema,
    backupVerifierSha256: bareSha256Schema,
    backupContractHelperSha256: bareSha256Schema,
    databaseLogicalDigestSha256: bareSha256Schema,
    psqlBinarySha256: bareSha256Schema,
    // Compatibility field name from release-authorization v1; value is the
    // complete PostgreSQL toolset closure, not a psql-only closure.
    psqlRuntimeClosureSha256: z.literal(
      SOURCE_REGISTRATION_APPLY_LOCKED_POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_SHA256,
    ),
    restoredDatabaseDropped: z.literal(true),
    restoredDatabaseAbsenceConfirmed: z.literal(true),
    postRehearsalCloneFullStateMatched: z.literal(true),
    sourceStillMatchedAfterRehearsal: z.literal(true),
    documentCreatesMax: z.literal(10),
    libraryAnalysisRecordCreatesMax: z.literal(10),
    controlledMutationAuditCreatesMax: z.literal(1),
    otherDatabaseWritesAuthorized: z.literal(false),
    lifecyclePromotionAuthorized: z.literal(false),
    sourceAnalysisPromotionAuthorized: z.literal(false),
    externalUseAuthorized: z.literal(false),
  })
  .strict();
export type SourceRegistrationReleaseAuthorization = z.infer<
  typeof SourceRegistrationReleaseAuthorizationSchema
>;

export const SourceRegistrationLiveContentStateSchema = z
  .object({
    contentStateSha256: bareSha256Schema,
    logicalStateSha256: bareSha256Schema,
    relationCount: z.number().int().positive(),
    totalRowCount: z.number().int().nonnegative(),
    sequenceRowCount: z.number().int().nonnegative(),
    allPublicDataRelationsLocked: z.literal(true),
    signedRestoreDigestMatched: z.literal(true),
    checkedImmediatelyBeforeMutation: z.literal(true),
  })
  .strict();
export type SourceRegistrationLiveContentState = z.infer<
  typeof SourceRegistrationLiveContentStateSchema
>;

export const SourceRegistrationApplyCodeBindingsSchema = z
  .object({
    runtime: z
      .object({ path: portablePathSchema, fileSha256: bareSha256Schema })
      .strict(),
    runner: z
      .object({ path: portablePathSchema, fileSha256: bareSha256Schema })
      .strict(),
    launcher: z
      .object({ path: portablePathSchema, fileSha256: bareSha256Schema })
      .strict(),
    runtimeLauncherTest: z
      .object({ path: portablePathSchema, fileSha256: bareSha256Schema })
      .strict(),
    logicalCloneRehearsalRuntime: z
      .object({ path: portablePathSchema, fileSha256: bareSha256Schema })
      .strict(),
    logicalCloneRehearsalJsonSchema: z
      .object({ path: portablePathSchema, fileSha256: bareSha256Schema })
      .strict(),
    logicalCloneRehearsalTest: z
      .object({ path: portablePathSchema, fileSha256: bareSha256Schema })
      .strict(),
    logicalCloneRehearsalCommandRunner: z
      .object({ path: portablePathSchema, fileSha256: bareSha256Schema })
      .strict(),
    logicalRestoreCompanionValidator: z
      .object({ path: portablePathSchema, fileSha256: bareSha256Schema })
      .strict(),
    logicalRestoreCompanionJsonSchema: z
      .object({ path: portablePathSchema, fileSha256: bareSha256Schema })
      .strict(),
    logicalRestoreCompanionTest: z
      .object({ path: portablePathSchema, fileSha256: bareSha256Schema })
      .strict(),
    controlledLogicalRestoreCompanionRunner: z
      .object({ path: portablePathSchema, fileSha256: bareSha256Schema })
      .strict(),
    pdfQualificationRuntime: z
      .object({ path: portablePathSchema, fileSha256: bareSha256Schema })
      .strict(),
    sourceAcquisitionRuntime: z
      .object({ path: portablePathSchema, fileSha256: bareSha256Schema })
      .strict(),
    sourceAnalysisInputRuntime: z
      .object({ path: portablePathSchema, fileSha256: bareSha256Schema })
      .strict(),
    databaseLogicalStateDigest: z
      .object({ path: portablePathSchema, fileSha256: bareSha256Schema })
      .strict(),
    databaseLogicalStateDigestTest: z
      .object({ path: portablePathSchema, fileSha256: bareSha256Schema })
      .strict(),
    nodeRuntimeClosureManifest: z
      .object({ path: portablePathSchema, fileSha256: bareSha256Schema })
      .strict(),
    nodeRuntimeClosureVerifier: z
      .object({ path: portablePathSchema, fileSha256: bareSha256Schema })
      .strict(),
    nodeRuntimeClosureVerifierTest: z
      .object({ path: portablePathSchema, fileSha256: bareSha256Schema })
      .strict(),
    postgresqlToolsetRuntimeClosureManifest: z
      .object({ path: portablePathSchema, fileSha256: bareSha256Schema })
      .strict(),
    postgresqlToolsetRuntimeClosureVerifier: z
      .object({ path: portablePathSchema, fileSha256: bareSha256Schema })
      .strict(),
    postgresqlToolsetRuntimeClosureVerifierTest: z
      .object({ path: portablePathSchema, fileSha256: bareSha256Schema })
      .strict(),
    restoreRunner: z
      .object({ path: portablePathSchema, fileSha256: bareSha256Schema })
      .strict(),
    releaseAuthorizationVerifier: z
      .object({ path: portablePathSchema, fileSha256: bareSha256Schema })
      .strict(),
    releaseAuthorizationJsonSchema: z
      .object({ path: portablePathSchema, fileSha256: bareSha256Schema })
      .strict(),
    releaseAuthorizationContract: z
      .object({ path: portablePathSchema, fileSha256: bareSha256Schema })
      .strict(),
    releaseAuthorizationPublicKey: z
      .object({ path: portablePathSchema, fileSha256: bareSha256Schema })
      .strict(),
    releaseAuthorizationVerifierTest: z
      .object({ path: portablePathSchema, fileSha256: bareSha256Schema })
      .strict(),
    releaseAuthorizationSigner: z
      .object({ path: portablePathSchema, fileSha256: bareSha256Schema })
      .strict(),
    releaseAuthorizationSignerTest: z
      .object({ path: portablePathSchema, fileSha256: bareSha256Schema })
      .strict(),
    jsonSchema: z
      .object({ path: portablePathSchema, fileSha256: bareSha256Schema })
      .strict(),
    contractDocument: z
      .object({ path: portablePathSchema, fileSha256: bareSha256Schema })
      .strict(),
    backupVerifier: z
      .object({ path: portablePathSchema, fileSha256: bareSha256Schema })
      .strict(),
    backupContractHelper: z
      .object({ path: portablePathSchema, fileSha256: bareSha256Schema })
      .strict(),
    packageLock: z
      .object({ path: portablePathSchema, fileSha256: bareSha256Schema })
      .strict(),
    prismaGeneratedClientTree: z
      .object({ path: portablePathSchema, treeSha256: bareSha256Schema })
      .strict(),
    runtimeEnvironment: SourceRegistrationRuntimeAttestationSchema,
  })
  .strict();

export type SourceRegistrationApplyCodeBindings = z.infer<
  typeof SourceRegistrationApplyCodeBindingsSchema
>;

const postApplyCountsSchema = z
  .object({
    documents: z.number().int().nonnegative(),
    libraryAnalysisRecords: z.number().int().nonnegative(),
    controlledMutationAuditsBeforeAppend: z.number().int().nonnegative(),
    controlledMutationAuditsAfterAppend: z.number().int().nonnegative(),
  })
  .strict();

export const SourceRegistrationAfterSnapshotSchema = z
  .object({
    databaseIdentityUuid: uuidSchema,
    completedMigrationCount: z.number().int().positive(),
    planStyleMigrationLedgerSha256: bareSha256Schema,
    backupStyleMigrationLedgerSha256: bareSha256Schema,
    preApplyTargetFingerprintSha256: bareSha256Schema,
    afterApplyTargetFingerprintSha256: bareSha256Schema,
    targetSetSha256: bareSha256Schema,
    documentRowsSha256: bareSha256Schema,
    libraryAnalysisRowsSha256: bareSha256Schema,
    dependencyRowsSha256: bareSha256Schema,
    dependencyRowCount: z.literal(0),
    counts: postApplyCountsSchema,
    afterSnapshotSha256: bareSha256Schema,
  })
  .strict();

export type SourceRegistrationAfterSnapshot = z.infer<
  typeof SourceRegistrationAfterSnapshotSchema
>;

const mutationSummaryBodySchema = z
  .object({
    schemaVersion: z.literal(SOURCE_REGISTRATION_APPLY_SCHEMA_VERSION),
    artifactType: z.literal("source_registration_apply_receipt"),
    receiptState: z.literal("exact_apply_committed"),
    contractScope: z.literal(SOURCE_REGISTRATION_APPLY_CONTRACT_SCOPE),
    contractVersion: z.literal(SOURCE_REGISTRATION_APPLY_CONTRACT_VERSION),
    contractSha256: bareSha256Schema,
    operationKey: safeControlTextSchema,
    plan: z
      .object({
        path: z.literal(SOURCE_REGISTRATION_APPLY_PLAN_PATH),
        fileSha256: z.literal(
          SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_FILE_SHA256,
        ),
        planSha256: z.literal(SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_SHA256),
        beforeSnapshotSha256: z.literal(
          SOURCE_REGISTRATION_APPLY_LOCKED_BEFORE_SNAPSHOT_SHA256,
        ),
      })
      .strict(),
    codeBindings: SourceRegistrationApplyCodeBindingsSchema,
    authorization: SourceRegistrationApplyAuthorizationSchema,
    releaseAuthorization: SourceRegistrationReleaseAuthorizationSchema,
    liveContentState: SourceRegistrationLiveContentStateSchema,
    releaseEvidence: SourceRegistrationReleaseEvidenceSchema,
    databaseTarget: SourceRegistrationDatabaseTargetSchema,
    databaseCatalog: SourceRegistrationDatabaseCatalogAttestationSchema,
    auditDurability: SourceRegistrationAuditDurabilitySchema,
    dependencyStateSha256: bareSha256Schema,
    targetSetSha256: bareSha256Schema,
    afterSnapshot: SourceRegistrationAfterSnapshotSchema,
    rows: z
      .object({
        documentCreates: z.literal(10),
        libraryAnalysisRecordCreates: z.literal(10),
        controlledMutationAuditCreates: z.literal(1),
        privateRecoveryRegisterWrites: z.literal(0),
        corpusRegisterWrites: z.literal(0),
        lifecycleEventWrites: z.literal(0),
        citationCreates: z.literal(0),
        appraisalCreates: z.literal(0),
      })
      .strict(),
    readiness: z
      .object({
        identityVerified: z.literal(false),
        sourceAnalysisAllowed: z.literal(false),
        ownerReviewComplete: z.literal(false),
        rightsCleared: z.literal(false),
        externalUseAllowed: z.literal(false),
        coveragePromotionAllowed: z.literal(false),
      })
      .strict(),
    contentBoundary: z
      .object({
        sourceTextStoredInAudit: z.literal(false),
        privateAbsolutePathsStoredInAudit: z.literal(false),
        credentialBearingTextStoredInAudit: z.literal(false),
        documentContentReconstructedFromExactPrivateNormalizedPages:
          z.literal(true),
        bothPrivateCopiesReverifiedUnderLock: z.literal(true),
      })
      .strict(),
  })
  .strict();

export const SourceRegistrationApplyMutationSummarySchema =
  mutationSummaryBodySchema
    .extend({
      summarySha256: bareSha256Schema,
    })
    .strict();

export type SourceRegistrationApplyMutationSummaryBody = z.infer<
  typeof mutationSummaryBodySchema
>;
export type SourceRegistrationApplyMutationSummary = z.infer<
  typeof SourceRegistrationApplyMutationSummarySchema
>;

export const SourceRegistrationControlledMutationAuditSchema = z
  .object({
    id: safeControlTextSchema,
    operationKey: safeControlTextSchema,
    contractScope: z.literal(SOURCE_REGISTRATION_APPLY_CONTRACT_SCOPE),
    contractSha256: bareSha256Schema,
    planSha256: z.literal(SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_SHA256),
    beforeSnapshotSha256: z.literal(
      SOURCE_REGISTRATION_APPLY_LOCKED_BEFORE_SNAPSHOT_SHA256,
    ),
    afterSnapshotSha256: bareSha256Schema,
    dependencyStateSha256: bareSha256Schema,
    databaseIdentityUuid: uuidSchema,
    targetFingerprintSha256: bareSha256Schema,
    backupSha256: bareSha256Schema,
    backupMetadataSha256: bareSha256Schema,
    restoreReceiptSha256: bareSha256Schema,
    operatorId: safeControlTextSchema,
    authorizationRef: safeControlTextSchema,
    databaseRole: safeControlTextSchema,
    mutationSummary: SourceRegistrationApplyMutationSummarySchema,
    recordedAt: dateTimeSchema.optional(),
  })
  .strict();

export type SourceRegistrationControlledMutationAudit = z.infer<
  typeof SourceRegistrationControlledMutationAuditSchema
>;

export type SourceRegistrationTargetStateObservation = {
  targetId: string;
  documentState: "absent" | "exact" | "conflict";
  libraryState: "absent" | "exact" | "conflict";
};

export type SourceRegistrationExistingState =
  | { state: "pending" }
  | {
      state: "receipted_noop";
      audit: SourceRegistrationControlledMutationAudit;
    }
  | {
      state: "conflict";
      codes: Array<
        | "partial_or_drifting_target_state"
        | "unexpected_dependency_rows"
        | "unreceipted_after_state"
        | "audit_without_exact_after_state"
        | "duplicate_or_conflicting_audit"
      >;
    };

export function sourceRegistrationApplyContractManifest(): SourceRegistrationJsonValue {
  return {
    version: SOURCE_REGISTRATION_APPLY_CONTRACT_VERSION,
    contractScope: SOURCE_REGISTRATION_APPLY_CONTRACT_SCOPE,
    lockedPlan: {
      path: SOURCE_REGISTRATION_APPLY_PLAN_PATH,
      planSha256: SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_SHA256,
      fileSha256: SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_FILE_SHA256,
      beforeSnapshotSha256:
        SOURCE_REGISTRATION_APPLY_LOCKED_BEFORE_SNAPSHOT_SHA256,
      databaseIdentityUuid:
        SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_IDENTITY_UUID,
      targetSetSha256: SOURCE_REGISTRATION_APPLY_LOCKED_TARGET_SET_SHA256,
      targetCount: SOURCE_REGISTRATION_APPLY_TARGET_COUNT,
      requiredState: "all_pending_zero_conflicts",
    },
    defaultMode: "plan_only_read_only",
    lockedDatabaseTarget: {
      ...SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_TARGET,
      databaseTargetSha256:
        SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_TARGET_SHA256,
    },
    lockedDatabaseCatalog: {
      schemaVersion: SOURCE_REGISTRATION_APPLY_DATABASE_CATALOG_SCHEMA_VERSION,
      scope: SOURCE_REGISTRATION_APPLY_DATABASE_CATALOG_SCOPE,
      catalogSha256: SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_CATALOG_SHA256,
      requiredRelationCount: 4,
      requiredNonInternalTriggerCount: 8,
      requiredGeneratedExpressionFunctionCount: 2,
      unexpectedWriteSurfaceCount: 0,
    },
    lockedPostgresqlToolsetRuntimeClosureSha256:
      SOURCE_REGISTRATION_APPLY_LOCKED_POSTGRESQL_TOOLSET_RUNTIME_CLOSURE_SHA256,
    lockedPostgresqlToolsetRuntimeManifestSha256:
      SOURCE_REGISTRATION_APPLY_LOCKED_POSTGRESQL_TOOLSET_RUNTIME_MANIFEST_SHA256,
    lockedPostgresqlToolsetRuntimeVerifierSha256:
      SOURCE_REGISTRATION_APPLY_LOCKED_POSTGRESQL_TOOLSET_RUNTIME_VERIFIER_SHA256,
    lockedNodeRuntimeClosureSha256:
      SOURCE_REGISTRATION_APPLY_LOCKED_NODE_RUNTIME_CLOSURE_SHA256,
    apply: {
      explicitFlag: true,
      strongAcknowledgement: SOURCE_REGISTRATION_APPLY_ACK,
      exactPlanAndCodeHashFlags: true,
      freshBackupMetadataVersion: 2,
      successfulStructuralRestoreReceiptVersion: 1,
      successfulLogicalRestoreCompanionReceiptVersion: 1,
      logicalCloneRehearsalReceiptSchemaVersion:
        "source-registration-logical-clone-rehearsal-v1",
      logicalRestoreEvidence: {
        exactPinsRequired: [
          "structural_restore_receipt_file_sha256",
          "logical_restore_companion_file_sha256",
          "logical_clone_rehearsal_file_sha256",
          "logical_clone_rehearsal_self_sha256",
          "logical_comparison_proof_sha256",
        ],
        privateEvidenceStorage:
          "canonical_outside_project_mode_0400_regular_single_link",
        stableRevalidationPhases: [
          "preflight",
          "under_transaction_lock",
          "post_commit",
        ],
        sourceAndRestoredContentStateMustMatch: true,
        postRehearsalCloneFullStateMustMatch: true,
        sourceMustStillMatchAfterRehearsal: true,
        cloneDropAndAbsenceRequired: true,
        exactProductionTargetExercisedInRehearsal: false,
        productionAuthorizationUsedInRehearsal: false,
        rehearsalTransactionRollbackRequired: true,
      },
      serializableTransaction: true,
      stableAdvisoryLockKey:
        SOURCE_REGISTRATION_APPLY_ADVISORY_LOCK_KEY.toString(),
      exactBeforeSnapshotCasUnderLock: true,
      contentReconstructionUnderLock: true,
      preImportRuntimeAttestation: true,
      allPublicDataRelationsLockedBeforeContentDigest: true,
      signedRestoreContentDigestMustMatchLiveBeforeMutation: true,
      exactDatabaseTargetAndCatalogReverifiedUnderLock: true,
      atomicCreates: {
        Document: 10,
        LibraryAnalysisRecord: 10,
        ControlledMutationAudit: 1,
      },
      replayPolicy: "exact_receipted_noop_only",
    },
    codeBindings: [
      "apply_runtime",
      "apply_runner",
      "builtins_only_locked_launcher",
      "builtins_only_locked_launcher_integration_test",
      "logical_clone_rehearsal_runtime",
      "logical_clone_rehearsal_json_schema",
      "logical_clone_rehearsal_test",
      "logical_clone_rehearsal_command_runner",
      "logical_restore_companion_validator",
      "logical_restore_companion_json_schema",
      "logical_restore_companion_test",
      "controlled_logical_restore_companion_runner",
      "pdf_qualification_runtime",
      "source_acquisition_runtime",
      "source_analysis_input_runtime",
      "database_logical_state_digest",
      "database_logical_state_digest_test",
      "node_runtime_closure_manifest",
      "node_runtime_closure_verifier",
      "node_runtime_closure_verifier_test",
      "postgresql_toolset_runtime_closure_manifest",
      "postgresql_toolset_runtime_closure_verifier",
      "postgresql_toolset_runtime_closure_verifier_test",
      "restore_runner",
      "ed25519_release_authorization_verifier",
      "ed25519_release_authorization_schema",
      "ed25519_release_authorization_contract",
      "ed25519_release_authorization_public_key",
      "ed25519_release_authorization_verifier_test",
      "offline_release_authorization_signer",
      "offline_release_authorization_signer_test",
      "receipt_json_schema",
      "apply_contract_document",
      "backup_structural_verifier",
      "backup_contract_helper",
      "package_lock",
      "generated_prisma_client_tree",
      "node_binary_recursive_runtime_and_installed_node_modules_tree",
      "postgresql_toolset_four_binaries_and_psql_version",
    ],
    transitiveLockedPlanBindings:
      "registration plan runtime, generator, database schema and all source inputs are sealed by the locked plan and dependency-state hash",
    authorization: {
      aiOperatorId: SOURCE_REGISTRATION_APPLY_AI_OPERATOR_ID,
      databaseRole: SOURCE_REGISTRATION_APPLY_DATABASE_ROLE,
      signedAcknowledgement: SOURCE_REGISTRATION_APPLY_ACK,
      ownerScopeAuthorization:
        "bounded scope only; does not prove exact-plan review or authorize apply",
      exactOperatorAuthorization:
        "descriptive CLI label only; it has no mutation authority",
      signedReleaseAuthorization:
        "a verified Ed25519 envelope must bind the exact plan, implementation, database, structural restore receipt, logical-restore companion file and completion, nested logical-clone rehearsal file/self hashes, operation key, runtime attestation, completion, logical-comparison proof, post-rehearsal source/clone match and maximum 10 + 10 + 1 mutation",
      databaseRoleRequirement:
        "exact current_user with INSERT and non-MCP writable semantics",
      authorizationReplay:
        "exact current-database receipted no-op only; no global consumption claim before external anchor",
    },
    localRuntimeThreatBoundary:
      "drift and fail-closed control for a non-compromised workstation; no hardware-backed same-UID isolation",
    forbiddenWrites: [
      "private_recovery_register",
      "corpus_register",
      "lifecycle_event_log",
      "citation",
      "appraisal",
    ],
    auditDurability: {
      state: "trigger_protected_append_only_current_state",
      independentlyImmutable: false,
      ownerTamperable: true,
      externalRootAnchorRequired: true,
      externalRootAnchorState: "pending",
    },
    promotionBoundary: {
      identityVerified: false,
      sourceAnalysisAllowed: false,
      rightsCleared: false,
      externalUseAllowed: false,
      coveragePromotionAllowed: false,
    },
  };
}

export function sourceRegistrationApplyContractSha256(): string {
  return domainHash(
    APPLY_CONTRACT_HASH_DOMAIN,
    sourceRegistrationApplyContractManifest(),
  );
}

function bareHash(value: string, label: string): string {
  const bare = value.startsWith("sha256:") ? value.slice(7) : value;
  if (!BARE_SHA256_PATTERN.test(bare))
    throw new Error(`${label} is not SHA-256`);
  return bare;
}

export function validateLockedSourceRegistrationPlanBytes(
  bytes: Buffer,
): SourceRegistrationPlan {
  const fileSha256 = sourceRegistrationApplyBareSha256(bytes);
  if (fileSha256 !== SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_FILE_SHA256) {
    throw new Error(
      `Locked source-registration plan file drifted: ${fileSha256}`,
    );
  }
  let value: unknown;
  try {
    value = JSON.parse(bytes.toString("utf8"));
  } catch {
    throw new Error("Locked source-registration plan is not JSON");
  }
  const plan = validateSourceRegistrationPlan(value);
  if (
    bareHash(plan.planSha256, "plan self-hash") !==
      SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_SHA256 ||
    bareHash(plan.beforeSnapshot.beforeSnapshotSha256, "before snapshot") !==
      SOURCE_REGISTRATION_APPLY_LOCKED_BEFORE_SNAPSHOT_SHA256 ||
    plan.beforeSnapshot.databaseIdentity.identityUuid.toLowerCase() !==
      SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_IDENTITY_UUID ||
    plan.targets.length !== SOURCE_REGISTRATION_APPLY_TARGET_COUNT ||
    plan.summary.pendingCount !== SOURCE_REGISTRATION_APPLY_TARGET_COUNT ||
    plan.summary.alreadyRegisteredCount !== 0 ||
    plan.summary.conflictCount !== 0 ||
    plan.targets.some(
      (target) => target.state !== "pending" || target.conflicts.length !== 0,
    )
  ) {
    throw new Error(
      "Locked source-registration plan is not the exact pending plan",
    );
  }
  const serialized = JSON.stringify(plan);
  if (serialized.includes('\":\"/')) {
    throw new Error(
      "Locked source-registration plan contains a private absolute path",
    );
  }
  return plan;
}

function forbiddenDatabaseRole(role: string): boolean {
  const normalized = role.toLowerCase();
  return (
    normalized.includes("mcp") ||
    normalized.includes("readonly") ||
    normalized.includes("read_only") ||
    normalized.includes("read-only") ||
    /(?:^|[_-])ro(?:$|[_-])/.test(normalized)
  );
}

export function sourceRegistrationExactOperatorAuthorizationRef(input: {
  runtimeAttestationSha256: string;
  authorizationEnvelopeSha256: string;
}): string {
  const runtimeAttestationSha256 = bareHash(
    input.runtimeAttestationSha256,
    "runtime attestation",
  );
  const authorizationEnvelopeSha256 = bareHash(
    input.authorizationEnvelopeSha256,
    "authorization envelope",
  );
  return (
    `exact-plan-operator:${SOURCE_REGISTRATION_APPLY_AI_OPERATOR_ID};` +
    `plan-sha256:${SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_SHA256};` +
    `apply-contract-sha256:${sourceRegistrationApplyContractSha256()};` +
    `database-target-sha256:${SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_TARGET_SHA256};` +
    `database-catalog-sha256:${SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_CATALOG_SHA256};` +
    `runtime-attestation-sha256:${runtimeAttestationSha256};` +
    `authorization-envelope-sha256:${authorizationEnvelopeSha256}`
  );
}

export function validateSourceRegistrationApplyAuthorization(input: {
  operatorId: string;
  ownerScopeAuthorizationRef: string;
  exactOperatorAuthorizationRef: string;
  databaseRole: string;
  runtimeAttestationSha256: string;
  authorizationEnvelopeSha256: string;
}): SourceRegistrationApplyAuthorization {
  if (input.operatorId !== SOURCE_REGISTRATION_APPLY_AI_OPERATOR_ID) {
    throw new Error("Operator ID must be the pinned Codex AI operator");
  }
  if (input.databaseRole !== SOURCE_REGISTRATION_APPLY_DATABASE_ROLE) {
    throw new Error("Database role must be exactly foodsystems");
  }
  const runtimeAttestationSha256 = bareHash(
    input.runtimeAttestationSha256,
    "runtime attestation",
  );
  const authorizationEnvelopeSha256 = bareHash(
    input.authorizationEnvelopeSha256,
    "authorization envelope",
  );
  const expectedExactOperatorAuthorizationRef =
    sourceRegistrationExactOperatorAuthorizationRef({
      runtimeAttestationSha256,
      authorizationEnvelopeSha256,
    });
  const authorization = SourceRegistrationApplyAuthorizationSchema.parse({
    operatorId: input.operatorId,
    ownerScopeAuthorizationRef: input.ownerScopeAuthorizationRef,
    exactOperatorAuthorizationRef: input.exactOperatorAuthorizationRef,
    databaseRole: input.databaseRole,
    ownerScopeMeaning: "bounded_project_scope_only",
    ownerScopeExactPlanHashReviewed: false,
    ownerScopeApplyAuthorized: false,
    exactOperatorMeaning: "descriptive_cli_label_only",
    exactOperatorApplyAuthorized: false,
    signedReleaseAuthorizationMeaning:
      "ed25519_exact_apply_authorization_controls_mutation",
    signedReleaseAuthorizationRequired: true,
  });
  if (
    authorization.ownerScopeAuthorizationRef ===
    authorization.exactOperatorAuthorizationRef
  ) {
    throw new Error(
      "Owner scope authorization cannot substitute for exact operator authorization",
    );
  }
  if (
    authorization.exactOperatorAuthorizationRef !==
    expectedExactOperatorAuthorizationRef
  ) {
    throw new Error(
      "Descriptive operator label must exactly equal the derived path-free locked reference",
    );
  }
  if (forbiddenDatabaseRole(authorization.databaseRole)) {
    throw new Error("Database role must be a controlled non-MCP writable role");
  }
  return authorization;
}

export function sourceRegistrationApplyAuthorizationRef(
  authorization: SourceRegistrationApplyAuthorization,
): string {
  return canonicalSourceRegistrationJson({
    ownerScopeAuthorizationRef: authorization.ownerScopeAuthorizationRef,
    ownerScopeMeaning: authorization.ownerScopeMeaning,
    ownerScopeExactPlanHashReviewed:
      authorization.ownerScopeExactPlanHashReviewed,
    ownerScopeApplyAuthorized: authorization.ownerScopeApplyAuthorized,
    exactOperatorAuthorizationRef: authorization.exactOperatorAuthorizationRef,
    exactOperatorMeaning: authorization.exactOperatorMeaning,
    exactOperatorApplyAuthorized: authorization.exactOperatorApplyAuthorized,
    signedReleaseAuthorizationMeaning:
      authorization.signedReleaseAuthorizationMeaning,
    signedReleaseAuthorizationRequired:
      authorization.signedReleaseAuthorizationRequired,
  });
}

export function sourceRegistrationApplyTargetSetSha256(
  plan: SourceRegistrationPlan,
): string {
  return domainHash(
    APPLY_TARGET_SET_HASH_DOMAIN,
    plan.targets.map((target) => ({
      targetId: target.targetId,
      canonicalIdentityKey: target.canonicalIdentityKey,
      lifecycleSourceId: target.lifecycleSourceId,
      documentTargetDataSha256: bareHash(
        target.intendedDocumentRow.targetDataSha256,
        "Document target",
      ),
      libraryTargetDataSha256: bareHash(
        target.intendedLibraryAnalysisRow.targetDataSha256,
        "Library target",
      ),
      rawContentSha256: target.intendedPrivateRecoveryRow.sha256,
      normalizedContentSha256: bareHash(
        target.intendedDocumentRow.contentBinding.sha256,
        "normalized Document content",
      ),
    })) as unknown as SourceRegistrationJsonValue,
  );
}

export function sourceRegistrationApplyCodeBindingsSha256(
  codeBindings: SourceRegistrationApplyCodeBindings,
): string {
  return domainHash(
    APPLY_CODE_BINDINGS_HASH_DOMAIN,
    SourceRegistrationApplyCodeBindingsSchema.parse(
      codeBindings,
    ) as unknown as SourceRegistrationJsonValue,
  );
}

export function sourceRegistrationApplyDependencyStateSha256(input: {
  plan: SourceRegistrationPlan;
  codeBindings: SourceRegistrationApplyCodeBindings;
}): string {
  const codeBindings = SourceRegistrationApplyCodeBindingsSchema.parse(
    input.codeBindings,
  );
  return domainHash(APPLY_DEPENDENCY_HASH_DOMAIN, {
    contractSha256: sourceRegistrationApplyContractSha256(),
    codeBindings,
    databaseTargetSha256:
      SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_TARGET_SHA256,
    databaseCatalogSha256:
      SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_CATALOG_SHA256,
    lockedPlan: {
      fileSha256: SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_FILE_SHA256,
      planSha256: SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_SHA256,
      beforeSnapshotSha256:
        SOURCE_REGISTRATION_APPLY_LOCKED_BEFORE_SNAPSHOT_SHA256,
      inputBindings: input.plan.inputBindings,
      privateRecoveryRegister:
        input.plan.beforeSnapshot.privateRecoveryRegister,
      targetSetSha256: sourceRegistrationApplyTargetSetSha256(input.plan),
    },
  } as unknown as SourceRegistrationJsonValue);
}

export function sourceRegistrationApplyOperationKey(input: {
  contractSha256: string;
  dependencyStateSha256: string;
}): string {
  const digest = domainHash(APPLY_OPERATION_HASH_DOMAIN, {
    contractScope: SOURCE_REGISTRATION_APPLY_CONTRACT_SCOPE,
    contractSha256: bareHash(input.contractSha256, "apply contract"),
    planSha256: SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_SHA256,
    planFileSha256: SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_FILE_SHA256,
    beforeSnapshotSha256:
      SOURCE_REGISTRATION_APPLY_LOCKED_BEFORE_SNAPSHOT_SHA256,
    databaseIdentityUuid:
      SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_IDENTITY_UUID,
    databaseTargetSha256:
      SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_TARGET_SHA256,
    databaseCatalogSha256:
      SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_CATALOG_SHA256,
    dependencyStateSha256: bareHash(
      input.dependencyStateSha256,
      "dependency state",
    ),
  });
  return `source-registration-new-official-v1:${digest}`;
}

export function sealSourceRegistrationAfterSnapshot(
  body: Omit<SourceRegistrationAfterSnapshot, "afterSnapshotSha256">,
): SourceRegistrationAfterSnapshot {
  const parsed = SourceRegistrationAfterSnapshotSchema.omit({
    afterSnapshotSha256: true,
  }).parse(body);
  return SourceRegistrationAfterSnapshotSchema.parse({
    ...parsed,
    afterSnapshotSha256: domainHash(
      APPLY_AFTER_SNAPSHOT_HASH_DOMAIN,
      parsed as unknown as SourceRegistrationJsonValue,
    ),
  });
}

export function validateSourceRegistrationAfterSnapshot(
  value: unknown,
): SourceRegistrationAfterSnapshot {
  const snapshot = SourceRegistrationAfterSnapshotSchema.parse(value);
  const { afterSnapshotSha256, ...body } = snapshot;
  const expected = domainHash(
    APPLY_AFTER_SNAPSHOT_HASH_DOMAIN,
    body as unknown as SourceRegistrationJsonValue,
  );
  if (afterSnapshotSha256 !== expected) {
    throw new Error("Source-registration after-snapshot self-hash mismatch");
  }
  return snapshot;
}

export function sealSourceRegistrationApplyMutationSummary(
  body: SourceRegistrationApplyMutationSummaryBody,
): SourceRegistrationApplyMutationSummary {
  const parsed = mutationSummaryBodySchema.parse(body);
  return SourceRegistrationApplyMutationSummarySchema.parse({
    ...parsed,
    summarySha256: domainHash(
      APPLY_SUMMARY_HASH_DOMAIN,
      parsed as unknown as SourceRegistrationJsonValue,
    ),
  });
}

export function validateSourceRegistrationApplyMutationSummary(
  value: unknown,
): SourceRegistrationApplyMutationSummary {
  const summary = SourceRegistrationApplyMutationSummarySchema.parse(value);
  const { summarySha256, ...body } = summary;
  const expected = domainHash(
    APPLY_SUMMARY_HASH_DOMAIN,
    body as unknown as SourceRegistrationJsonValue,
  );
  if (summarySha256 !== expected) {
    throw new Error("Source-registration apply summary self-hash mismatch");
  }
  if (summary.contractSha256 !== sourceRegistrationApplyContractSha256()) {
    throw new Error("Source-registration apply summary contract drift");
  }
  const { contentBoundary: _contentBoundary, ...leakCheckedBody } = body;
  const leakFacts = sourceRegistrationAuditLeakFacts(leakCheckedBody);
  if (
    summary.contentBoundary.sourceTextStoredInAudit !==
      leakFacts.sourceTextStoredInAudit ||
    summary.contentBoundary.privateAbsolutePathsStoredInAudit !==
      leakFacts.privateAbsolutePathsStoredInAudit ||
    summary.contentBoundary.credentialBearingTextStoredInAudit !==
      leakFacts.credentialBearingTextStoredInAudit
  ) {
    throw new Error(
      "Source-registration audit content-boundary claims are not derived from the exact receipt body",
    );
  }
  if (
    summary.authorization.ownerScopeAuthorizationRef !==
      SOURCE_REGISTRATION_APPLY_OWNER_SCOPE_AUTHORIZATION_REF ||
    summary.authorization.exactOperatorAuthorizationRef !==
      sourceRegistrationExactOperatorAuthorizationRef({
        runtimeAttestationSha256:
          summary.codeBindings.runtimeEnvironment.runtimeAttestationSha256,
        authorizationEnvelopeSha256:
          summary.releaseAuthorization.envelopeSha256,
      })
  ) {
    throw new Error(
      "Source-registration audit authorization references are not the exact derived path-free values",
    );
  }
  validateSourceRegistrationAfterSnapshot(summary.afterSnapshot);
  const counts = summary.afterSnapshot.counts;
  const evidence = summary.releaseEvidence;
  const releaseAuthorization = summary.releaseAuthorization;
  if (
    releaseAuthorization.acknowledgement !== SOURCE_REGISTRATION_APPLY_ACK ||
    releaseAuthorization.databaseRole !== summary.authorization.databaseRole ||
    releaseAuthorization.operatorId !== summary.authorization.operatorId ||
    releaseAuthorization.planSha256 !== summary.plan.planSha256 ||
    releaseAuthorization.planFileSha256 !== summary.plan.fileSha256 ||
    releaseAuthorization.beforeSnapshotSha256 !==
      summary.plan.beforeSnapshotSha256 ||
    releaseAuthorization.databaseIdentityUuid !==
      evidence.databaseIdentityUuid ||
    releaseAuthorization.sourceDatabaseName !== evidence.sourceDatabaseName ||
    releaseAuthorization.applyContractSha256 !== summary.contractSha256 ||
    releaseAuthorization.dependencyStateSha256 !==
      summary.dependencyStateSha256 ||
    releaseAuthorization.operationKey !== summary.operationKey ||
    releaseAuthorization.codeBindingsSha256 !==
      sourceRegistrationApplyCodeBindingsSha256(summary.codeBindings) ||
    releaseAuthorization.databaseTargetSha256 !==
      summary.databaseTarget.databaseTargetSha256 ||
    releaseAuthorization.databaseCatalogSha256 !==
      summary.databaseCatalog.catalogSha256 ||
    releaseAuthorization.backupSha256 !== evidence.backupSha256 ||
    releaseAuthorization.backupBytes !== evidence.backupBytes ||
    releaseAuthorization.backupMetadataSha256 !==
      evidence.backupMetadataSha256 ||
    releaseAuthorization.structuralRestoreReceiptSha256 !==
      evidence.structuralRestoreReceiptSha256 ||
    releaseAuthorization.logicalRestoreCompanionReceiptSha256 !==
      evidence.logicalRestoreCompanion.receiptFileSha256 ||
    releaseAuthorization.logicalCloneRehearsalReceiptFileSha256 !==
      evidence.logicalCloneRehearsal.receiptFileSha256 ||
    releaseAuthorization.logicalCloneRehearsalReceiptSelfSha256 !==
      evidence.logicalCloneRehearsal.receiptSelfSha256 ||
    releaseAuthorization.completedMigrationLedgerSha256 !==
      evidence.completedMigrationLedgerSha256 ||
    releaseAuthorization.targetFingerprintSha256 !==
      evidence.targetFingerprintSha256 ||
    releaseAuthorization.targetSetSha256 !== summary.targetSetSha256 ||
    releaseAuthorization.structuralRestoreCompletedAtUtc !==
      evidence.structuralRestoreCompletedAtUtc ||
    releaseAuthorization.logicalRestoreCompanionCompletedAtUtc !==
      evidence.logicalRestoreCompanion.completedAtUtc ||
    releaseAuthorization.logicalComparisonProofSha256 !==
      evidence.logicalRestoreCompanion.logicalComparisonProofSha256 ||
    releaseAuthorization.logicalCloneRehearsalOperationKey !==
      evidence.logicalCloneRehearsal.operationKey ||
    releaseAuthorization.logicalCloneRehearsalRuntimeAttestationSha256 !==
      evidence.logicalCloneRehearsal.runtimeAttestationSha256 ||
    releaseAuthorization.logicalCloneRehearsalCompletedAtUtc !==
      evidence.logicalCloneRehearsal.rehearsalCompletedAtUtc ||
    releaseAuthorization.restoreRunnerSha256 !==
      summary.codeBindings.restoreRunner.fileSha256 ||
    releaseAuthorization.backupVerifierSha256 !==
      summary.codeBindings.backupVerifier.fileSha256 ||
    releaseAuthorization.backupContractHelperSha256 !==
      summary.codeBindings.backupContractHelper.fileSha256 ||
    releaseAuthorization.databaseLogicalDigestSha256 !==
      summary.codeBindings.databaseLogicalStateDigest.fileSha256 ||
    releaseAuthorization.psqlBinarySha256 !==
      summary.codeBindings.runtimeEnvironment.postgresqlToolset.toolFileSha256
        .psql ||
    releaseAuthorization.psqlRuntimeClosureSha256 !==
      summary.codeBindings.runtimeEnvironment.postgresqlToolset.closureSha256 ||
    releaseAuthorization.restoredDatabaseDropped !==
      evidence.logicalRestoreCompanion.cloneDatabaseDropped ||
    releaseAuthorization.restoredDatabaseAbsenceConfirmed !==
      evidence.logicalRestoreCompanion.cloneDatabaseAbsenceConfirmed ||
    releaseAuthorization.postRehearsalCloneFullStateMatched !==
      evidence.logicalRestoreCompanion.postRehearsalCloneFullStateMatched ||
    releaseAuthorization.sourceStillMatchedAfterRehearsal !==
      evidence.logicalRestoreCompanion.sourceStillMatched ||
    summary.liveContentState.contentStateSha256 !==
      releaseAuthorization.contentStateSha256 ||
    evidence.logicalRestoreCompanion.source.contentStateSha256 !==
      releaseAuthorization.contentStateSha256 ||
    evidence.logicalRestoreCompanion.restored.contentStateSha256 !==
      releaseAuthorization.contentStateSha256
  ) {
    throw new Error(
      "Source-registration signed release authorization differs from the exact receipt bindings",
    );
  }
  if (
    counts.documents !== evidence.coreCounts.Document + 10 ||
    counts.libraryAnalysisRecords !==
      evidence.coreCounts.LibraryAnalysisRecord + 10 ||
    counts.controlledMutationAuditsBeforeAppend !==
      evidence.coreCounts.ControlledMutationAudit ||
    counts.controlledMutationAuditsAfterAppend !==
      evidence.coreCounts.ControlledMutationAudit + 1 ||
    summary.afterSnapshot.preApplyTargetFingerprintSha256 !==
      evidence.targetFingerprintSha256
  ) {
    throw new Error(
      "Source-registration receipt confuses pre-apply evidence with after-state counts",
    );
  }
  const expectedAfterFingerprint = sourceRegistrationDatabaseFingerprintSha256({
    completedPrismaMigrationLedger: {
      completedCount: evidence.completedMigrationCount,
      sha256: evidence.completedMigrationLedgerSha256,
    },
    coreCounts: {
      ...evidence.coreCounts,
      ControlledMutationAudit: counts.controlledMutationAuditsAfterAppend,
      Document: counts.documents,
      LibraryAnalysisRecord: counts.libraryAnalysisRecords,
    },
    databaseIdentity: {
      key: "primary",
      uuid: evidence.databaseIdentityUuid,
    },
  });
  if (
    summary.afterSnapshot.afterApplyTargetFingerprintSha256 !==
    expectedAfterFingerprint
  ) {
    throw new Error("Source-registration after-state fingerprint mismatch");
  }
  return summary;
}

export function buildSourceRegistrationApplyMutationSummary(input: {
  plan: SourceRegistrationPlan;
  codeBindings: SourceRegistrationApplyCodeBindings;
  authorization: SourceRegistrationApplyAuthorization;
  releaseAuthorization: SourceRegistrationReleaseAuthorization;
  liveContentState: SourceRegistrationLiveContentState;
  releaseEvidence: SourceRegistrationReleaseEvidence;
  databaseTarget: SourceRegistrationDatabaseTarget;
  databaseCatalog: SourceRegistrationDatabaseCatalogAttestation;
  dependencyStateSha256: string;
  operationKey: string;
  afterSnapshot: SourceRegistrationAfterSnapshot;
}): SourceRegistrationApplyMutationSummary {
  const releaseEvidence = SourceRegistrationReleaseEvidenceSchema.parse(
    input.releaseEvidence,
  );
  const afterSnapshot = validateSourceRegistrationAfterSnapshot(
    input.afterSnapshot,
  );
  const targetSetSha256 = sourceRegistrationApplyTargetSetSha256(input.plan);
  if (afterSnapshot.targetSetSha256 !== targetSetSha256) {
    throw new Error("After snapshot target set differs from locked plan");
  }
  const bodyWithoutContentBoundary: Omit<
    SourceRegistrationApplyMutationSummaryBody,
    "contentBoundary"
  > = {
    schemaVersion: SOURCE_REGISTRATION_APPLY_SCHEMA_VERSION,
    artifactType: "source_registration_apply_receipt",
    receiptState: "exact_apply_committed",
    contractScope: SOURCE_REGISTRATION_APPLY_CONTRACT_SCOPE,
    contractVersion: SOURCE_REGISTRATION_APPLY_CONTRACT_VERSION,
    contractSha256: sourceRegistrationApplyContractSha256(),
    operationKey: input.operationKey,
    plan: {
      path: SOURCE_REGISTRATION_APPLY_PLAN_PATH,
      fileSha256: SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_FILE_SHA256,
      planSha256: SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_SHA256,
      beforeSnapshotSha256:
        SOURCE_REGISTRATION_APPLY_LOCKED_BEFORE_SNAPSHOT_SHA256,
    },
    codeBindings: SourceRegistrationApplyCodeBindingsSchema.parse(
      input.codeBindings,
    ),
    authorization: SourceRegistrationApplyAuthorizationSchema.parse(
      input.authorization,
    ),
    releaseAuthorization: SourceRegistrationReleaseAuthorizationSchema.parse(
      input.releaseAuthorization,
    ),
    liveContentState: SourceRegistrationLiveContentStateSchema.parse(
      input.liveContentState,
    ),
    releaseEvidence,
    databaseTarget: SourceRegistrationDatabaseTargetSchema.parse(
      input.databaseTarget,
    ),
    databaseCatalog: SourceRegistrationDatabaseCatalogAttestationSchema.parse(
      input.databaseCatalog,
    ),
    auditDurability: SourceRegistrationAuditDurabilitySchema.parse({
      state: "trigger_protected_append_only_current_state",
      independentlyImmutable: false,
      ownerTamperable: true,
      externalRootAnchorRequired: true,
      externalRootAnchorState: "pending",
    }),
    dependencyStateSha256: bareHash(
      input.dependencyStateSha256,
      "dependency state",
    ),
    targetSetSha256,
    afterSnapshot,
    rows: {
      documentCreates: 10,
      libraryAnalysisRecordCreates: 10,
      controlledMutationAuditCreates: 1,
      privateRecoveryRegisterWrites: 0,
      corpusRegisterWrites: 0,
      lifecycleEventWrites: 0,
      citationCreates: 0,
      appraisalCreates: 0,
    },
    readiness: {
      identityVerified: false,
      sourceAnalysisAllowed: false,
      ownerReviewComplete: false,
      rightsCleared: false,
      externalUseAllowed: false,
      coveragePromotionAllowed: false,
    },
  };
  const leakFacts = sourceRegistrationAuditLeakFacts(
    bodyWithoutContentBoundary,
  );
  if (
    leakFacts.sourceTextStoredInAudit ||
    leakFacts.privateAbsolutePathsStoredInAudit ||
    leakFacts.credentialBearingTextStoredInAudit
  ) {
    throw new Error(
      "Source-registration apply receipt body contains forbidden source text, private paths, or credentials",
    );
  }
  return sealSourceRegistrationApplyMutationSummary({
    ...bodyWithoutContentBoundary,
    contentBoundary: {
      sourceTextStoredInAudit: false,
      privateAbsolutePathsStoredInAudit: false,
      credentialBearingTextStoredInAudit: false,
      documentContentReconstructedFromExactPrivateNormalizedPages: true,
      bothPrivateCopiesReverifiedUnderLock: true,
    },
  });
}

export function sourceRegistrationControlledMutationAudit(input: {
  summary: SourceRegistrationApplyMutationSummary;
}): SourceRegistrationControlledMutationAudit {
  const summary = validateSourceRegistrationApplyMutationSummary(input.summary);
  const evidence = summary.releaseEvidence;
  const authorization = summary.authorization;
  return SourceRegistrationControlledMutationAuditSchema.parse({
    id: `controlled-mutation.source-registration.${sourceRegistrationApplyBareSha256(summary.operationKey).slice(0, 24)}`,
    operationKey: summary.operationKey,
    contractScope: SOURCE_REGISTRATION_APPLY_CONTRACT_SCOPE,
    contractSha256: summary.contractSha256,
    planSha256: SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_SHA256,
    beforeSnapshotSha256:
      SOURCE_REGISTRATION_APPLY_LOCKED_BEFORE_SNAPSHOT_SHA256,
    afterSnapshotSha256: summary.afterSnapshot.afterSnapshotSha256,
    dependencyStateSha256: summary.dependencyStateSha256,
    databaseIdentityUuid: evidence.databaseIdentityUuid,
    targetFingerprintSha256: evidence.targetFingerprintSha256,
    backupSha256: evidence.backupSha256,
    backupMetadataSha256: evidence.backupMetadataSha256,
    // Preserve the established structural-restore meaning of the legacy
    // database column. Companion and rehearsal evidence remain fully durable
    // in mutationSummary.releaseEvidence.
    restoreReceiptSha256: evidence.structuralRestoreReceiptSha256,
    operatorId: authorization.operatorId,
    authorizationRef: sourceRegistrationApplyAuthorizationRef(authorization),
    databaseRole: authorization.databaseRole,
    mutationSummary: summary,
  });
}

function auditSelfConsistent(
  audit: SourceRegistrationControlledMutationAudit,
): boolean {
  try {
    const parsed = SourceRegistrationControlledMutationAuditSchema.parse(audit);
    const summary = validateSourceRegistrationApplyMutationSummary(
      parsed.mutationSummary,
    );
    const expected = sourceRegistrationControlledMutationAudit({ summary });
    const { recordedAt: _recordedAt, ...withoutRecordedAt } = parsed;
    return (
      canonicalSourceRegistrationJson(
        withoutRecordedAt as unknown as SourceRegistrationJsonValue,
      ) ===
      canonicalSourceRegistrationJson(
        expected as unknown as SourceRegistrationJsonValue,
      )
    );
  } catch {
    return false;
  }
}

export function classifySourceRegistrationExistingState(input: {
  targets: SourceRegistrationTargetStateObservation[];
  dependencyRowCount: number;
  audits: SourceRegistrationControlledMutationAudit[];
}): SourceRegistrationExistingState {
  if (input.targets.length !== SOURCE_REGISTRATION_APPLY_TARGET_COUNT) {
    return { state: "conflict", codes: ["partial_or_drifting_target_state"] };
  }
  const allAbsent = input.targets.every(
    (target) =>
      target.documentState === "absent" && target.libraryState === "absent",
  );
  const allExact = input.targets.every(
    (target) =>
      target.documentState === "exact" && target.libraryState === "exact",
  );
  if (input.dependencyRowCount !== 0) {
    return { state: "conflict", codes: ["unexpected_dependency_rows"] };
  }
  if (allAbsent && input.audits.length === 0) return { state: "pending" };
  if (allExact && input.audits.length === 0) {
    return { state: "conflict", codes: ["unreceipted_after_state"] };
  }
  if (allExact && input.audits.length === 1) {
    const audit = input.audits[0]!;
    if (auditSelfConsistent(audit)) return { state: "receipted_noop", audit };
    return { state: "conflict", codes: ["duplicate_or_conflicting_audit"] };
  }
  if (allAbsent && input.audits.length > 0) {
    return { state: "conflict", codes: ["audit_without_exact_after_state"] };
  }
  return {
    state: "conflict",
    codes: [
      input.audits.length > 1
        ? "duplicate_or_conflicting_audit"
        : "partial_or_drifting_target_state",
    ],
  };
}

export function expectedPostApplyCounts(
  plan: SourceRegistrationPlan,
): SourceRegistrationAfterSnapshot["counts"] {
  return {
    documents: plan.beforeSnapshot.coreCounts.documents + 10,
    libraryAnalysisRecords:
      plan.beforeSnapshot.coreCounts.libraryAnalysisRecords + 10,
    controlledMutationAuditsBeforeAppend:
      plan.beforeSnapshot.coreCounts.controlledMutationAudits,
    controlledMutationAuditsAfterAppend:
      plan.beforeSnapshot.coreCounts.controlledMutationAudits + 1,
  };
}

export function validateReleaseEvidenceAgainstLockedPlan(
  evidence: SourceRegistrationReleaseEvidence,
  plan: SourceRegistrationPlan,
): SourceRegistrationReleaseEvidence {
  const parsed = SourceRegistrationReleaseEvidenceSchema.parse(evidence);
  if (
    parsed.databaseIdentityUuid.toLowerCase() !==
      SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_IDENTITY_UUID ||
    parsed.logicalCloneRehearsal.targetSetSha256 !==
      SOURCE_REGISTRATION_APPLY_LOCKED_TARGET_SET_SHA256 ||
    parsed.completedMigrationCount !==
      plan.beforeSnapshot.completedMigrationLedger.count ||
    parsed.coreCounts.Document !== plan.beforeSnapshot.coreCounts.documents ||
    parsed.coreCounts.LibraryAnalysisRecord !==
      plan.beforeSnapshot.coreCounts.libraryAnalysisRecords ||
    parsed.coreCounts.ControlledMutationAudit !==
      plan.beforeSnapshot.coreCounts.controlledMutationAudits
  ) {
    throw new Error(
      "Backup/restore evidence does not match the locked pre-registration state",
    );
  }
  return parsed;
}

export function prefixedSourceRegistrationApplyHash(value: string): string {
  return sourceRegistrationSha256(value);
}
