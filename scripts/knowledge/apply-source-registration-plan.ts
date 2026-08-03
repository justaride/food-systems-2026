import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  chmodSync,
  closeSync,
  constants,
  createReadStream,
  existsSync,
  fstatSync,
  lstatSync,
  mkdtempSync,
  openSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import type { Stats } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import {
  basename,
  dirname,
  isAbsolute,
  join,
  relative,
  resolve,
  sep,
} from "node:path";
import { pathToFileURL } from "node:url";

import { Prisma, PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import Ajv2020 from "ajv/dist/2020";
import addFormats from "ajv-formats";

import {
  SOURCE_REGISTRATION_APPLY_ACK,
  SOURCE_REGISTRATION_APPLY_DATABASE_ROLE,
  SOURCE_REGISTRATION_APPLY_ADVISORY_LOCK_KEY,
  SOURCE_REGISTRATION_APPLY_CONTRACT_SCOPE,
  SOURCE_REGISTRATION_APPLY_DATABASE_CATALOG_SCHEMA_VERSION,
  SOURCE_REGISTRATION_APPLY_DATABASE_CATALOG_SCOPE,
  SOURCE_REGISTRATION_APPLY_DATABASE_TARGET_SCHEMA_VERSION,
  SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_CATALOG_SHA256,
  SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_TARGET,
  SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_TARGET_SHA256,
  SOURCE_REGISTRATION_APPLY_LOCKED_BEFORE_SNAPSHOT_SHA256,
  SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_IDENTITY_UUID,
  SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_FILE_SHA256,
  SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_SHA256,
  SOURCE_REGISTRATION_APPLY_LOCKED_TARGET_SET_SHA256,
  SOURCE_REGISTRATION_APPLY_LOCKED_NODE_RUNTIME_CLOSURE_SHA256,
  SOURCE_REGISTRATION_APPLY_LOCKED_PSQL_RUNTIME_CLOSURE_SHA256,
  SOURCE_REGISTRATION_APPLY_PLAN_PATH,
  SOURCE_REGISTRATION_BACKUP_CORE_COUNT_KEYS,
  SourceRegistrationApplyCodeBindingsSchema,
  SourceRegistrationControlledMutationAuditSchema,
  SourceRegistrationReleaseAuthorizationSchema,
  SourceRegistrationReleaseEvidenceSchema,
  buildSourceRegistrationApplyMutationSummary,
  classifySourceRegistrationExistingState,
  expectedPostApplyCounts,
  sealSourceRegistrationAfterSnapshot,
  sealSourceRegistrationDatabaseCatalogAttestation,
  sealSourceRegistrationDatabaseTarget,
  sourceRegistrationApplyBareSha256,
  sourceRegistrationApplyContractSha256,
  sourceRegistrationApplyCodeBindingsSha256,
  sourceRegistrationApplyDependencyStateSha256,
  sourceRegistrationApplyOperationKey,
  sourceRegistrationApplyTargetSetSha256,
  sourceRegistrationControlledMutationAudit,
  sourceRegistrationDatabaseFingerprintSha256,
  validateLockedSourceRegistrationPlanBytes,
  validateReleaseEvidenceAgainstLockedPlan,
  validateSourceRegistrationApplyAuthorization,
  validateSourceRegistrationApplyMutationSummary,
  validateSourceRegistrationRuntimeAttestation,
  type SourceRegistrationApplyAuthorization,
  type SourceRegistrationApplyCodeBindings,
  type SourceRegistrationApplyMutationSummary,
  type SourceRegistrationBackupCoreCounts,
  type SourceRegistrationControlledMutationAudit,
  type SourceRegistrationDatabaseCatalogAttestation,
  type SourceRegistrationDatabaseTarget,
  type SourceRegistrationReleaseEvidence,
  type SourceRegistrationReleaseAuthorization,
  type SourceRegistrationRuntimeAttestation,
} from "../../src/lib/knowledge/source-registration-apply";
import {
  SOURCE_REGISTRATION_DOCUMENT_CONTENT_SERIALIZATION,
  canonicalSourceRegistrationJson,
  hashSourceRegistrationJson,
  sourceRegistrationSha256,
  type SourceRegistrationJsonValue,
  type SourceRegistrationPlan,
} from "../../src/lib/knowledge/source-registration-plan";
import {
  sealSourceRegistrationLogicalCloneRehearsalReceipt,
  sourceRegistrationLogicalCloneRehearsalOperationKey,
  validateSourceRegistrationLogicalCloneRehearsalReceipt,
  validateSourceRegistrationLogicalComparisonProof,
  type SourceRegistrationLogicalComparisonProof,
  type SourceRegistrationLogicalCloneRehearsalReceipt,
} from "../../src/lib/knowledge/source-registration-logical-clone-rehearsal";
import { computeDatabaseLogicalStateDigest } from "./database-logical-state-digest.mjs";
import { parseCanonicalLogicalRestoreCompanionReceipt } from "./logical-restore-companion-receipt.mjs";
import {
  SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_PUBLIC_KEY_SHA256,
  verifySourceRegistrationReleaseAuthorization,
} from "./source-registration-release-authorization.mjs";

function importSourceRegistrationGeneratorWithoutProjectDotenv(): typeof import("./generate-source-registration-plan") {
  const originalDirectory = process.cwd();
  const isolatedDirectory = mkdtempSync(
    join(tmpdir(), "foodsystems-source-registration-import-"),
  );
  const requireFromRunner = createRequire(
    resolve(
      originalDirectory,
      "scripts/knowledge/apply-source-registration-plan.ts",
    ),
  );
  try {
    process.chdir(isolatedDirectory);
    return requireFromRunner("./generate-source-registration-plan");
  } finally {
    process.chdir(originalDirectory);
    rmSync(isolatedDirectory, { force: true, recursive: true });
  }
}

const { SOURCE_REGISTRATION_PATHS, prepareSourceRegistrationInputs } =
  importSourceRegistrationGeneratorWithoutProjectDotenv();

export const SOURCE_REGISTRATION_APPLY_PATHS = {
  runtime: "src/lib/knowledge/source-registration-apply.ts",
  runner: "scripts/knowledge/apply-source-registration-plan.ts",
  launcher: "scripts/knowledge/launch-locked-source-registration-apply.mjs",
  runtimeLauncherTest: "tests/lib/source-registration-runtime-launcher.test.ts",
  logicalCloneRehearsalRuntime:
    "src/lib/knowledge/source-registration-logical-clone-rehearsal.ts",
  logicalCloneRehearsalJsonSchema:
    "knowledge/schema/source-registration-logical-clone-rehearsal-receipt.schema.v1.json",
  logicalCloneRehearsalTest:
    "tests/lib/source-registration-logical-clone-rehearsal.test.ts",
  logicalCloneRehearsalCommandRunner:
    "scripts/knowledge/run-source-registration-logical-clone-rehearsal.ts",
  logicalRestoreCompanionValidator:
    "scripts/knowledge/logical-restore-companion-receipt.mjs",
  logicalRestoreCompanionJsonSchema:
    "knowledge/schema/database-logical-restore-companion-receipt.schema.v1.json",
  logicalRestoreCompanionTest:
    "tests/lib/database-logical-restore-companion.test.ts",
  controlledLogicalRestoreCompanionRunner:
    "scripts/knowledge/run-controlled-logical-restore-companion.mjs",
  pdfQualificationRuntime:
    "src/lib/knowledge/pdf-page-extraction-qualification.ts",
  sourceAcquisitionRuntime: "src/lib/knowledge/source-acquisition-receipt.ts",
  sourceAnalysisInputRuntime:
    "src/lib/knowledge/source-analysis-input-manifest.ts",
  databaseLogicalStateDigest:
    "scripts/knowledge/database-logical-state-digest.mjs",
  databaseLogicalStateDigestTest:
    "tests/lib/database-logical-state-digest.test.ts",
  nodeRuntimeClosureManifest:
    "knowledge/corpus/source-registration/node-runtime-closure-darwin-arm64-2026-08-03.v1.json",
  nodeRuntimeClosureVerifier:
    "scripts/knowledge/verify-node-runtime-closure.mjs",
  nodeRuntimeClosureVerifierTest: "tests/lib/node-runtime-closure.test.ts",
  psqlRuntimeClosureManifest:
    "knowledge/corpus/source-registration/psql-runtime-closure-darwin-arm64-2026-08-03.v1.json",
  psqlRuntimeClosureVerifier:
    "scripts/knowledge/verify-psql-runtime-closure.mjs",
  psqlRuntimeClosureVerifierTest: "tests/lib/psql-runtime-closure.test.ts",
  restoreRunner: "scripts/restore-database-backup-drill.sh",
  releaseAuthorizationVerifier:
    "scripts/knowledge/source-registration-release-authorization.mjs",
  releaseAuthorizationJsonSchema:
    "knowledge/schema/source-registration-release-authorization.schema.v1.json",
  releaseAuthorizationContract:
    "knowledge/corpus/SOURCE-REGISTRATION-RELEASE-AUTHORIZATION.md",
  releaseAuthorizationPublicKey:
    "knowledge/keys/source-registration-2026-08-03-codex-operator-ed25519-v1.public.pem",
  releaseAuthorizationVerifierTest:
    "tests/lib/source-registration-release-authorization.test.ts",
  releaseAuthorizationSigner:
    "scripts/knowledge/sign-source-registration-release-authorization.mjs",
  releaseAuthorizationSignerTest:
    "tests/lib/source-registration-release-signer.test.ts",
  jsonSchema:
    "knowledge/schema/source-registration-apply-receipt.schema.v1.json",
  contractDocument: "knowledge/corpus/SOURCE-REGISTRATION-APPLY-CONTRACT.md",
  backupVerifier: "scripts/verify-database-backup.sh",
  backupContractHelper: "scripts/database-backup-contract.mjs",
  packageLock: "package-lock.json",
  prismaGeneratedClientTree: "src/generated/prisma",
} as const;

const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ISO_UTC_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;

type Mode = "plan_only" | "verify_release_evidence" | "apply";

export type SourceRegistrationApplyCliOptions = {
  mode: Mode;
  manifestPath: string;
  primaryCorpusRoot: string;
  replicaCorpusRoot: string;
  backupFile?: string;
  structuralRestoreReceipt?: string;
  logicalRestoreCompanionReceipt?: string;
  logicalCloneRehearsalReceipt?: string;
  ack?: string;
  planSha256?: string;
  planFileSha256?: string;
  beforeSnapshotSha256?: string;
  databaseIdentityUuid?: string;
  applyContractSha256?: string;
  runtimeFileSha256?: string;
  runnerFileSha256?: string;
  schemaFileSha256?: string;
  contractDocumentFileSha256?: string;
  backupVerifierFileSha256?: string;
  backupContractHelperFileSha256?: string;
  packageLockFileSha256?: string;
  prismaGeneratedClientTreeSha256?: string;
  launcherFileSha256?: string;
  runtimeLauncherTestFileSha256?: string;
  logicalCloneRehearsalRuntimeFileSha256?: string;
  logicalCloneRehearsalSchemaFileSha256?: string;
  logicalCloneRehearsalTestFileSha256?: string;
  logicalCloneRehearsalCommandRunnerFileSha256?: string;
  logicalRestoreCompanionValidatorFileSha256?: string;
  logicalRestoreCompanionSchemaFileSha256?: string;
  logicalRestoreCompanionTestFileSha256?: string;
  controlledLogicalRestoreCompanionRunnerFileSha256?: string;
  pdfQualificationRuntimeFileSha256?: string;
  sourceAcquisitionRuntimeFileSha256?: string;
  sourceAnalysisInputRuntimeFileSha256?: string;
  databaseLogicalStateDigestFileSha256?: string;
  databaseLogicalStateDigestTestFileSha256?: string;
  nodeRuntimeClosureManifestFileSha256?: string;
  nodeRuntimeClosureVerifierFileSha256?: string;
  nodeRuntimeClosureVerifierTestFileSha256?: string;
  psqlRuntimeClosureManifestFileSha256?: string;
  psqlRuntimeClosureVerifierFileSha256?: string;
  psqlRuntimeClosureVerifierTestFileSha256?: string;
  restoreRunnerFileSha256?: string;
  releaseAuthorizationVerifierFileSha256?: string;
  releaseAuthorizationSchemaFileSha256?: string;
  releaseAuthorizationContractFileSha256?: string;
  releaseAuthorizationPublicKeyFileSha256?: string;
  releaseAuthorizationVerifierTestFileSha256?: string;
  releaseAuthorizationSignerFileSha256?: string;
  releaseAuthorizationSignerTestFileSha256?: string;
  nodeBinaryFileSha256?: string;
  nodeVersion?: string;
  nodePlatform?: string;
  nodeArch?: string;
  nodeRuntimeClosureSha256?: string;
  nodeModulesTreeSha256?: string;
  runtimeLocalClosureSha256?: string;
  psqlBinaryFileSha256?: string;
  psqlVersion?: string;
  psqlRuntimeClosureSha256?: string;
  runtimeAttestationSha256?: string;
  databaseTargetSha256?: string;
  databaseCatalogSha256?: string;
  releaseAuthorization?: string;
  expectedReleaseAuthorizationSha256?: string;
  operatorId?: string;
  ownerScopeAuthorizationRef?: string;
  exactOperatorAuthorizationRef?: string;
  databaseRole?: string;
  expectedBackupSha256?: string;
  expectedBackupBytes?: number;
  expectedBackupMetadataSha256?: string;
  expectedStructuralRestoreReceiptSha256?: string;
  expectedLogicalRestoreCompanionReceiptSha256?: string;
  expectedLogicalCloneRehearsalReceiptFileSha256?: string;
  expectedLogicalCloneRehearsalReceiptSelfSha256?: string;
  expectedLogicalComparisonProofSha256?: string;
  expectedMigrationLedgerSha256?: string;
  expectedTargetFingerprintSha256?: string;
};

const valueFlags = {
  "--manifest=": "manifestPath",
  "--primary-corpus-root=": "primaryCorpusRoot",
  "--replica-corpus-root=": "replicaCorpusRoot",
  "--backup-file=": "backupFile",
  "--structural-restore-receipt=": "structuralRestoreReceipt",
  "--logical-restore-companion-receipt=": "logicalRestoreCompanionReceipt",
  "--logical-clone-rehearsal-receipt=": "logicalCloneRehearsalReceipt",
  "--ack=": "ack",
  "--plan-sha256=": "planSha256",
  "--plan-file-sha256=": "planFileSha256",
  "--before-snapshot-sha256=": "beforeSnapshotSha256",
  "--database-identity-uuid=": "databaseIdentityUuid",
  "--apply-contract-sha256=": "applyContractSha256",
  "--runtime-file-sha256=": "runtimeFileSha256",
  "--runner-file-sha256=": "runnerFileSha256",
  "--schema-file-sha256=": "schemaFileSha256",
  "--contract-document-file-sha256=": "contractDocumentFileSha256",
  "--backup-verifier-file-sha256=": "backupVerifierFileSha256",
  "--backup-contract-helper-file-sha256=": "backupContractHelperFileSha256",
  "--package-lock-file-sha256=": "packageLockFileSha256",
  "--prisma-generated-client-tree-sha256=": "prismaGeneratedClientTreeSha256",
  "--launcher-file-sha256=": "launcherFileSha256",
  "--runtime-launcher-test-file-sha256=": "runtimeLauncherTestFileSha256",
  "--logical-clone-rehearsal-runtime-file-sha256=":
    "logicalCloneRehearsalRuntimeFileSha256",
  "--logical-clone-rehearsal-schema-file-sha256=":
    "logicalCloneRehearsalSchemaFileSha256",
  "--logical-clone-rehearsal-test-file-sha256=":
    "logicalCloneRehearsalTestFileSha256",
  "--logical-clone-rehearsal-command-runner-file-sha256=":
    "logicalCloneRehearsalCommandRunnerFileSha256",
  "--logical-restore-companion-validator-file-sha256=":
    "logicalRestoreCompanionValidatorFileSha256",
  "--logical-restore-companion-schema-file-sha256=":
    "logicalRestoreCompanionSchemaFileSha256",
  "--logical-restore-companion-test-file-sha256=":
    "logicalRestoreCompanionTestFileSha256",
  "--controlled-logical-restore-companion-runner-file-sha256=":
    "controlledLogicalRestoreCompanionRunnerFileSha256",
  "--pdf-qualification-runtime-file-sha256=":
    "pdfQualificationRuntimeFileSha256",
  "--source-acquisition-runtime-file-sha256=":
    "sourceAcquisitionRuntimeFileSha256",
  "--source-analysis-input-runtime-file-sha256=":
    "sourceAnalysisInputRuntimeFileSha256",
  "--database-logical-state-digest-file-sha256=":
    "databaseLogicalStateDigestFileSha256",
  "--database-logical-state-digest-test-file-sha256=":
    "databaseLogicalStateDigestTestFileSha256",
  "--node-runtime-closure-manifest-file-sha256=":
    "nodeRuntimeClosureManifestFileSha256",
  "--node-runtime-closure-verifier-file-sha256=":
    "nodeRuntimeClosureVerifierFileSha256",
  "--node-runtime-closure-verifier-test-file-sha256=":
    "nodeRuntimeClosureVerifierTestFileSha256",
  "--psql-runtime-closure-manifest-file-sha256=":
    "psqlRuntimeClosureManifestFileSha256",
  "--psql-runtime-closure-verifier-file-sha256=":
    "psqlRuntimeClosureVerifierFileSha256",
  "--psql-runtime-closure-verifier-test-file-sha256=":
    "psqlRuntimeClosureVerifierTestFileSha256",
  "--restore-runner-file-sha256=": "restoreRunnerFileSha256",
  "--release-authorization-verifier-file-sha256=":
    "releaseAuthorizationVerifierFileSha256",
  "--release-authorization-schema-file-sha256=":
    "releaseAuthorizationSchemaFileSha256",
  "--release-authorization-contract-file-sha256=":
    "releaseAuthorizationContractFileSha256",
  "--release-authorization-public-key-file-sha256=":
    "releaseAuthorizationPublicKeyFileSha256",
  "--release-authorization-verifier-test-file-sha256=":
    "releaseAuthorizationVerifierTestFileSha256",
  "--release-authorization-signer-file-sha256=":
    "releaseAuthorizationSignerFileSha256",
  "--release-authorization-signer-test-file-sha256=":
    "releaseAuthorizationSignerTestFileSha256",
  "--node-binary-file-sha256=": "nodeBinaryFileSha256",
  "--node-version=": "nodeVersion",
  "--node-platform=": "nodePlatform",
  "--node-arch=": "nodeArch",
  "--node-runtime-closure-sha256=": "nodeRuntimeClosureSha256",
  "--node-modules-tree-sha256=": "nodeModulesTreeSha256",
  "--runtime-local-closure-sha256=": "runtimeLocalClosureSha256",
  "--psql-binary-file-sha256=": "psqlBinaryFileSha256",
  "--psql-version=": "psqlVersion",
  "--psql-runtime-closure-sha256=": "psqlRuntimeClosureSha256",
  "--runtime-attestation-sha256=": "runtimeAttestationSha256",
  "--database-target-sha256=": "databaseTargetSha256",
  "--database-catalog-sha256=": "databaseCatalogSha256",
  "--release-authorization=": "releaseAuthorization",
  "--expected-release-authorization-sha256=":
    "expectedReleaseAuthorizationSha256",
  "--operator-id=": "operatorId",
  "--owner-scope-authorization-ref=": "ownerScopeAuthorizationRef",
  "--exact-operator-authorization-ref=": "exactOperatorAuthorizationRef",
  "--database-role=": "databaseRole",
  "--expected-backup-sha256=": "expectedBackupSha256",
  "--expected-backup-bytes=": "expectedBackupBytes",
  "--expected-backup-metadata-sha256=": "expectedBackupMetadataSha256",
  "--expected-structural-restore-receipt-sha256=":
    "expectedStructuralRestoreReceiptSha256",
  "--expected-logical-restore-companion-receipt-sha256=":
    "expectedLogicalRestoreCompanionReceiptSha256",
  "--expected-logical-clone-rehearsal-receipt-file-sha256=":
    "expectedLogicalCloneRehearsalReceiptFileSha256",
  "--expected-logical-clone-rehearsal-receipt-self-sha256=":
    "expectedLogicalCloneRehearsalReceiptSelfSha256",
  "--expected-logical-comparison-proof-sha256=":
    "expectedLogicalComparisonProofSha256",
  "--expected-migration-ledger-sha256=": "expectedMigrationLedgerSha256",
  "--expected-target-fingerprint-sha256=": "expectedTargetFingerprintSha256",
} as const;

function fail(message: string): never {
  throw new Error(`Locked source-registration apply refused: ${message}`);
}

function bareHash(value: string, label: string): string {
  const bare = value.startsWith("sha256:") ? value.slice(7) : value;
  if (!SHA256_PATTERN.test(bare)) fail(`${label} must be a lowercase SHA-256`);
  return bare;
}

function requireExactSha(
  value: string | undefined,
  expected: string,
  label: string,
) {
  if (value !== expected) fail(`${label} must equal ${expected}`);
}

function requireExactValue(
  value: string | undefined,
  expected: string,
  label: string,
) {
  if (value !== expected) fail(`${label} must equal the locked runtime value`);
}

export function parseSourceRegistrationApplyArgs(
  argv: string[],
): SourceRegistrationApplyCliOptions {
  const modeFlags = [
    ["--plan-only", "plan_only"],
    ["--verify-release-evidence", "verify_release_evidence"],
    ["--apply", "apply"],
  ] as const;
  const modes = argv.flatMap((argument) =>
    modeFlags.filter(([flag]) => argument === flag).map(([, mode]) => mode),
  );
  if (modes.length > 1) fail("choose exactly one execution mode flag");
  const options: Record<string, unknown> = {
    mode: modes[0] ?? "plan_only",
    manifestPath: SOURCE_REGISTRATION_PATHS.batch,
  };
  const seen = new Set<string>();
  for (const argument of argv) {
    if (
      argument === "--plan-only" ||
      argument === "--verify-release-evidence" ||
      argument === "--apply"
    ) {
      continue;
    }
    const binding = Object.entries(valueFlags).find(([prefix]) =>
      argument.startsWith(prefix),
    );
    if (!binding) fail("unknown or malformed argument was supplied");
    const [prefix, key] = binding;
    if (seen.has(key)) fail(`duplicate ${prefix.slice(0, -1)}`);
    seen.add(key);
    const value = argument.slice(prefix.length);
    if (!value) fail(`${prefix.slice(0, -1)} cannot be empty`);
    if (key === "expectedBackupBytes") {
      if (!/^[1-9][0-9]*$/.test(value)) {
        fail("--expected-backup-bytes must be an exact positive integer");
      }
      options[key] = Number(value);
    } else {
      options[key] = value;
    }
  }
  if (
    !Number.isSafeInteger(options.expectedBackupBytes) &&
    options.expectedBackupBytes !== undefined
  ) {
    fail("--expected-backup-bytes must be a positive safe integer");
  }
  if (
    typeof options.primaryCorpusRoot !== "string" ||
    !isAbsolute(options.primaryCorpusRoot) ||
    typeof options.replicaCorpusRoot !== "string" ||
    !isAbsolute(options.replicaCorpusRoot)
  ) {
    fail(
      "explicit absolute --primary-corpus-root and --replica-corpus-root are required",
    );
  }
  return options as SourceRegistrationApplyCliOptions;
}

function assertPortableRelativePath(path: string, label: string): string {
  if (
    !path ||
    isAbsolute(path) ||
    path.includes("\\") ||
    path
      .split("/")
      .some((segment) => !segment || segment === "." || segment === "..")
  ) {
    fail(`${label} must be a normalized repository-relative path`);
  }
  return path;
}

function projectFile(projectRoot: string, path: string): string {
  assertPortableRelativePath(path, "project file path");
  const root = realpathSync(projectRoot);
  const absolute = resolve(root, path);
  if (absolute !== root && !absolute.startsWith(`${root}${sep}`)) {
    fail(`project file escaped repository root: ${path}`);
  }
  return absolute;
}

function readRegularFile(path: string, label: string): Buffer {
  const stats = lstatSync(path);
  if (!stats.isFile() || stats.isSymbolicLink()) {
    fail(`${label} must be a regular non-symlink file`);
  }
  return readFileSync(path);
}

function readPrivateRegularFile(path: string, label: string): Buffer {
  const stats = lstatSync(path);
  if (!stats.isFile() || stats.isSymbolicLink()) {
    fail(`${label} must be a regular non-symlink file`);
  }
  if ((stats.mode & 0o077) !== 0) {
    fail(`${label} must not be group- or world-accessible`);
  }
  return readFileSync(path);
}

type StablePrivateEvidenceFile = {
  bytes: Buffer;
  fileSha256: string;
  privateMode: 0o400;
  singleLink: true;
  storedOutsideProject: true;
};

function sameStableFileIdentity(left: Stats, right: Stats): boolean {
  return (
    left.dev === right.dev &&
    left.ino === right.ino &&
    left.mode === right.mode &&
    left.nlink === right.nlink &&
    left.size === right.size &&
    left.mtimeMs === right.mtimeMs &&
    left.ctimeMs === right.ctimeMs
  );
}

function sameStableDirectoryIdentity(left: Stats, right: Stats): boolean {
  return (
    left.dev === right.dev &&
    left.ino === right.ino &&
    left.mode === right.mode &&
    left.nlink === right.nlink &&
    left.uid === right.uid &&
    left.gid === right.gid
  );
}

export function readStablePrivateEvidenceFile(input: {
  path: string;
  projectRoot: string;
  label: string;
}): StablePrivateEvidenceFile {
  const { path, projectRoot, label } = input;
  if (typeof path !== "string" || !isAbsolute(path) || /[\0\r\n]/.test(path)) {
    fail(`${label} path is invalid`);
  }
  let root: string;
  let resolved: string;
  let parentResolved: string;
  let stats: Stats;
  let parentStats: Stats;
  try {
    root = realpathSync(projectRoot);
    resolved = realpathSync(path);
    parentResolved = realpathSync(dirname(path));
    stats = lstatSync(path);
    parentStats = lstatSync(dirname(path));
  } catch {
    fail(`${label} or its private parent is missing or unreadable`);
  }
  const relationship = relative(root, resolved);
  const outsideProject =
    isAbsolute(relationship) ||
    relationship === ".." ||
    relationship.startsWith(`..${sep}`);
  if (
    root !== projectRoot ||
    resolved !== path ||
    parentResolved !== dirname(path) ||
    !outsideProject
  ) {
    fail(`${label} must be canonical and outside the project`);
  }
  if (
    !parentStats.isDirectory() ||
    parentStats.isSymbolicLink() ||
    parentStats.nlink < 1 ||
    (parentStats.mode & 0o777) !== 0o700
  ) {
    fail(`${label} parent must be canonical mode-0700 private storage`);
  }
  if (
    !stats.isFile() ||
    stats.isSymbolicLink() ||
    stats.nlink !== 1 ||
    (stats.mode & 0o777) !== 0o400 ||
    stats.size <= 0 ||
    stats.size > 16 * 1_024 * 1_024
  ) {
    fail(`${label} must be an exact mode-0400 regular single-link file`);
  }
  let descriptor: number | undefined;
  try {
    descriptor = openSync(
      resolved,
      constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0),
    );
    const before = fstatSync(descriptor);
    if (!sameStableFileIdentity(stats, before)) {
      fail(`${label} changed before it was read`);
    }
    const bytes = readFileSync(descriptor);
    const after = fstatSync(descriptor);
    const pathAfter = lstatSync(resolved);
    const parentAfter = lstatSync(dirname(path));
    const parentResolvedAfter = realpathSync(dirname(path));
    if (
      !sameStableFileIdentity(stats, after) ||
      !sameStableFileIdentity(stats, pathAfter) ||
      !sameStableDirectoryIdentity(parentStats, parentAfter) ||
      parentResolvedAfter !== parentResolved ||
      bytes.length !== stats.size
    ) {
      fail(`${label} changed while it was read`);
    }
    return {
      bytes,
      fileSha256: sourceRegistrationApplyBareSha256(bytes),
      privateMode: 0o400,
      singleLink: true,
      storedOutsideProject: true,
    };
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.startsWith("Locked source-registration apply refused:")
    ) {
      throw error;
    }
    fail(`${label} could not be read safely`);
  } finally {
    if (descriptor !== undefined) closeSync(descriptor);
  }
  return fail(`${label} could not be read safely`);
}

async function sha256File(path: string): Promise<string> {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(path)) hash.update(chunk);
  return hash.digest("hex");
}

function parseJson(bytes: Buffer | string, label: string): unknown {
  try {
    return JSON.parse(bytes.toString());
  } catch {
    fail(`${label} is not valid JSON`);
  }
}

function exactObject(
  value: unknown,
  keys: readonly string[],
  label: string,
): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    fail(`${label} must be a JSON object`);
  }
  const record = value as Record<string, unknown>;
  if (
    canonicalSourceRegistrationJson(Object.keys(record).sort()) !==
    canonicalSourceRegistrationJson([...keys].sort())
  ) {
    fail(`${label} has an unexpected schema`);
  }
  return record;
}

function recentTimestamp(value: unknown, label: string, now: Date): Date {
  if (typeof value !== "string" || !ISO_UTC_PATTERN.test(value)) {
    fail(`${label} must be a UTC timestamp`);
  }
  const date = new Date(value);
  const age = now.valueOf() - date.valueOf();
  if (!Number.isFinite(date.valueOf()) || age < -300_000 || age > 86_400_000) {
    fail(`${label} must not be future-dated or older than 24 hours`);
  }
  return date;
}

function exactCoreCounts(
  value: unknown,
  label: string,
): SourceRegistrationBackupCoreCounts {
  const record = exactObject(
    value,
    SOURCE_REGISTRATION_BACKUP_CORE_COUNT_KEYS,
    label,
  );
  const result: Record<string, number> = {};
  for (const key of SOURCE_REGISTRATION_BACKUP_CORE_COUNT_KEYS) {
    const count = record[key];
    if (!Number.isSafeInteger(count) || Number(count) < 0) {
      fail(`${label}.${key} must be a non-negative safe integer`);
    }
    result[key] = Number(count);
  }
  return result as SourceRegistrationBackupCoreCounts;
}

function validateTrackedJsonSchema(input: {
  schemaPath: string;
  schemaBindingSha256: string;
  value: unknown;
  label: string;
}): void {
  const schemaBytes = readRegularFile(
    input.schemaPath,
    `${input.label} schema`,
  );
  if (
    sourceRegistrationApplyBareSha256(schemaBytes) !== input.schemaBindingSha256
  ) {
    fail(`${input.label} schema differs from its code binding`);
  }
  const ajv = new Ajv2020({ allErrors: true, strict: true });
  addFormats(ajv);
  const validate = ajv.compile(
    parseJson(schemaBytes, `${input.label} schema`) as Parameters<
      typeof ajv.compile
    >[0],
  );
  if (!validate(input.value)) {
    fail(`${input.label} failed its locked JSON Schema`);
  }
}

function parseCanonicalLogicalCloneRehearsalReceipt(
  bytes: Buffer,
  now: Date,
): SourceRegistrationLogicalCloneRehearsalReceipt {
  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    fail("logical-clone rehearsal receipt is not valid UTF-8");
  }
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    fail("logical-clone rehearsal receipt is not JSON");
  }
  const receipt = validateSourceRegistrationLogicalCloneRehearsalReceipt(
    value,
    { now },
  );
  if (`${canonicalSourceRegistrationJson(receipt)}\n` !== text) {
    fail("logical-clone rehearsal receipt is not canonical JSON");
  }
  return receipt;
}

type VerifiedLogicalRestoreEvidence = Pick<
  SourceRegistrationReleaseEvidence,
  "logicalRestoreCompanion" | "logicalCloneRehearsal"
> & {
  companionReceiptFileSha256: string;
};

export function verifySourceRegistrationLogicalRestoreEvidence(input: {
  projectRoot: string;
  companionReceiptPath: string;
  rehearsalReceiptPath: string;
  codeBindings: SourceRegistrationApplyCodeBindings;
  now: Date;
  backup: {
    dumpSha256: string;
    dumpBytes: number;
    metadataSha256: string;
    metadataCreatedAtUtc: string;
    targetFingerprintSha256: string;
  };
  structuralRestore: {
    receiptSha256: string;
    completedAtUtc: string;
  };
  expectedCompanionReceiptFileSha256?: string;
  expectedRehearsalReceiptFileSha256?: string;
  expectedRehearsalReceiptSelfSha256?: string;
  expectedLogicalComparisonProofSha256?: string;
}): VerifiedLogicalRestoreEvidence {
  const companionFile = readStablePrivateEvidenceFile({
    path: input.companionReceiptPath,
    projectRoot: input.projectRoot,
    label: "logical-restore companion receipt",
  });
  const companion = parseCanonicalLogicalRestoreCompanionReceipt(
    companionFile.bytes,
    { now: input.now, maxReceiptAgeMs: 24 * 60 * 60 * 1_000 },
  ) as Record<string, any>;
  validateTrackedJsonSchema({
    schemaPath: projectFile(
      input.projectRoot,
      SOURCE_REGISTRATION_APPLY_PATHS.logicalRestoreCompanionJsonSchema,
    ),
    schemaBindingSha256:
      input.codeBindings.logicalRestoreCompanionJsonSchema.fileSha256,
    value: companion,
    label: "logical-restore companion receipt",
  });

  const rehearsalFile = readStablePrivateEvidenceFile({
    path: input.rehearsalReceiptPath,
    projectRoot: input.projectRoot,
    label: "logical-clone rehearsal receipt",
  });
  const rehearsal = parseCanonicalLogicalCloneRehearsalReceipt(
    rehearsalFile.bytes,
    input.now,
  );
  validateTrackedJsonSchema({
    schemaPath: projectFile(
      input.projectRoot,
      SOURCE_REGISTRATION_APPLY_PATHS.logicalCloneRehearsalJsonSchema,
    ),
    schemaBindingSha256:
      input.codeBindings.logicalCloneRehearsalJsonSchema.fileSha256,
    value: rehearsal,
    label: "logical-clone rehearsal receipt",
  });

  for (const [observed, expected, label] of [
    [
      companionFile.fileSha256,
      input.expectedCompanionReceiptFileSha256,
      "logical-restore companion receipt file SHA-256",
    ],
    [
      rehearsalFile.fileSha256,
      input.expectedRehearsalReceiptFileSha256,
      "logical-clone rehearsal receipt file SHA-256",
    ],
    [
      rehearsal.receiptSha256,
      input.expectedRehearsalReceiptSelfSha256,
      "logical-clone rehearsal receipt self SHA-256",
    ],
    [
      rehearsal.logicalComparisonProof.logicalComparisonProofSha256,
      input.expectedLogicalComparisonProofSha256,
      "logical-comparison proof SHA-256",
    ],
  ] as const) {
    if (expected !== undefined && observed !== expected) {
      fail(`${label} differs from its explicit pin`);
    }
  }

  if (
    companion.backup.dumpSha256 !== input.backup.dumpSha256 ||
    companion.backup.dumpBytes !== input.backup.dumpBytes ||
    companion.backup.metadataSha256 !== input.backup.metadataSha256 ||
    companion.backup.metadataCreatedAtUtc !==
      input.backup.metadataCreatedAtUtc ||
    companion.backup.targetDatabaseFingerprintSha256 !==
      input.backup.targetFingerprintSha256 ||
    companion.structuralRestore.receiptSha256 !==
      input.structuralRestore.receiptSha256 ||
    companion.structuralRestore.completedAtUtc !==
      input.structuralRestore.completedAtUtc
  ) {
    fail("logical-restore companion differs from backup or structural restore");
  }

  const executed = companion.tools.executedTools;
  const context = companion.tools.contextBindings;
  const runtime = input.codeBindings.runtimeEnvironment;
  const expectedToolBindings: Array<[unknown, string, string]> = [
    [
      executed.companionReceiptValidatorSha256,
      input.codeBindings.logicalRestoreCompanionValidator.fileSha256,
      "companion receipt validator",
    ],
    [
      executed.companionRunnerSha256,
      input.codeBindings.controlledLogicalRestoreCompanionRunner.fileSha256,
      "controlled companion runner",
    ],
    [
      executed.databaseLogicalDigestSha256,
      input.codeBindings.databaseLogicalStateDigest.fileSha256,
      "database logical digest",
    ],
    [
      executed.sourceRegistrationApplyRunnerSha256,
      input.codeBindings.runner.fileSha256,
      "source-registration apply runner",
    ],
    [
      executed.sourceRegistrationApplyRuntimeSha256,
      input.codeBindings.runtime.fileSha256,
      "source-registration apply runtime",
    ],
    [
      executed.sourceRegistrationLauncherSha256,
      input.codeBindings.launcher.fileSha256,
      "source-registration launcher",
    ],
    [
      executed.sourceRegistrationLogicalCloneRehearsalRuntimeSha256,
      input.codeBindings.logicalCloneRehearsalRuntime.fileSha256,
      "logical-clone rehearsal runtime",
    ],
    [
      executed.sourceRegistrationLogicalCloneRehearsalSchemaSha256,
      input.codeBindings.logicalCloneRehearsalJsonSchema.fileSha256,
      "logical-clone rehearsal schema",
    ],
    [
      executed.sourceRegistrationLogicalCloneRehearsalCommandRunnerSha256,
      input.codeBindings.logicalCloneRehearsalCommandRunner.fileSha256,
      "logical-clone rehearsal command runner",
    ],
    [
      executed.sourceRegistrationRuntimeAttestationSha256,
      runtime.runtimeAttestationSha256,
      "source-registration runtime attestation",
    ],
    [
      executed.sourceRegistrationLocalRuntimeClosureSha256,
      runtime.localClosure.closureSha256,
      "source-registration local runtime closure",
    ],
    [
      executed.sourceRegistrationNodeBinarySha256,
      runtime.node.binaryFileSha256,
      "source-registration Node binary",
    ],
    [
      executed.sourceRegistrationNodeRuntimeClosureSha256,
      runtime.node.runtimeClosureSha256,
      "source-registration Node runtime closure",
    ],
    [
      executed.sourceRegistrationNodeRuntimeManifestSha256,
      runtime.node.runtimeClosureManifestSha256,
      "source-registration Node runtime manifest",
    ],
    [
      executed.sourceRegistrationNodeRuntimeVerifierSha256,
      runtime.node.runtimeClosureVerifierFileSha256,
      "source-registration Node runtime verifier",
    ],
    [
      executed.sourceRegistrationNodeModulesTreeSha256,
      runtime.nodeModules.treeSha256,
      "source-registration node_modules tree",
    ],
    [
      executed.sourceRegistrationPrismaGeneratedClientTreeSha256,
      runtime.prismaGeneratedClient.treeSha256,
      "source-registration Prisma generated client tree",
    ],
    [executed.psqlBinarySha256, runtime.psql.binaryFileSha256, "psql binary"],
    [
      executed.psqlRuntimeClosureSha256,
      runtime.psql.runtimeClosureSha256,
      "psql runtime closure",
    ],
    [
      executed.psqlRuntimeManifestSha256,
      runtime.psql.runtimeClosureManifestSha256,
      "psql runtime manifest",
    ],
    [
      executed.psqlRuntimeVerifierSha256,
      runtime.psql.runtimeClosureVerifierFileSha256,
      "psql runtime verifier",
    ],
    [
      context.companionReceiptSchemaSha256,
      input.codeBindings.logicalRestoreCompanionJsonSchema.fileSha256,
      "companion receipt schema",
    ],
    [
      context.sourceRegistrationLogicalCloneRehearsalTestSha256,
      input.codeBindings.logicalCloneRehearsalTest.fileSha256,
      "logical-clone rehearsal test",
    ],
    [
      context.backupVerifierSha256,
      input.codeBindings.backupVerifier.fileSha256,
      "backup verifier",
    ],
    [
      context.backupContractHelperSha256,
      input.codeBindings.backupContractHelper.fileSha256,
      "backup contract helper",
    ],
    [
      context.structuralRestoreRunnerSha256,
      input.codeBindings.restoreRunner.fileSha256,
      "structural restore runner",
    ],
  ];
  for (const [observed, expected, label] of expectedToolBindings) {
    if (observed !== expected) fail(`${label} binding differs`);
  }

  const comparisonProof = rehearsal.logicalComparisonProof;
  const source = companion.comparison.source;
  const restored = companion.comparison.restored;
  if (
    comparisonProof.backupSha256 !== input.backup.dumpSha256 ||
    comparisonProof.backupMetadataSha256 !== input.backup.metadataSha256 ||
    comparisonProof.structuralRestoreReceiptSha256 !==
      input.structuralRestore.receiptSha256 ||
    comparisonProof.logicalComparisonProofSha256 !==
      companion.comparison.logicalComparisonProofSha256 ||
    comparisonProof.source.contentStateSha256 !== source.contentStateSha256 ||
    comparisonProof.source.logicalStateSha256 !== source.logicalStateSha256 ||
    comparisonProof.source.relationCount !== source.relationCount ||
    comparisonProof.source.totalRowCount !== source.totalRowCount ||
    comparisonProof.source.sequenceRowCount !== source.sequenceCount ||
    comparisonProof.restored.contentStateSha256 !==
      restored.contentStateSha256 ||
    comparisonProof.restored.logicalStateSha256 !==
      restored.logicalStateSha256 ||
    comparisonProof.restored.relationCount !== restored.relationCount ||
    comparisonProof.restored.totalRowCount !== restored.totalRowCount ||
    comparisonProof.restored.sequenceRowCount !== restored.sequenceCount
  ) {
    fail("logical-comparison proof differs across companion and rehearsal");
  }

  const rehearsalProjection = {
    applyRunnerSha256: rehearsal.applyRunnerSha256,
    artifactType: rehearsal.artifactType,
    canonicalJsonFormat: "sorted-keys-v1",
    exactProductionTargetExercised: rehearsal.exactProductionTargetExercised,
    executedRuntime: rehearsal.executedRuntime,
    firstExactMutationRemainsLive: rehearsal.firstExactMutationRemainsLive,
    logicalCloneContentStateSha256:
      rehearsal.logicalComparisonProof.restored.contentStateSha256,
    logicalComparisonProofSha256:
      rehearsal.logicalComparisonProof.logicalComparisonProofSha256,
    operationKey: rehearsal.operationKey,
    planFileSha256: rehearsal.planFileSha256,
    planSha256: rehearsal.planSha256,
    privateReceiptStoredOutsideRepo: true,
    productionAuthorizationUsed: rehearsal.productionAuthorizationUsed,
    receiptFileSha256: rehearsalFile.fileSha256,
    receiptSelfSha256: rehearsal.receiptSha256,
    rehearsalCommandRunnerSha256: rehearsal.rehearsalCommandRunnerSha256,
    rehearsalCompletedAtUtc: rehearsal.rehearsalCompletedAtUtc,
    rehearsalRuntimeSha256: rehearsal.rehearsalRuntimeSha256,
    rehearsalSchemaSha256: rehearsal.rehearsalSchemaSha256,
    rehearsalStartedAtUtc: rehearsal.rehearsalStartedAtUtc,
    rehearsalTestSha256: rehearsal.rehearsalTestSha256,
    rollback: rehearsal.rollback,
    schemaVersion: rehearsal.schemaVersion,
    runtimeAttestationSha256:
      rehearsal.executedRuntime.runtimeAttestationSha256,
    targetClass: rehearsal.targetClass,
    targetSetSha256: rehearsal.targetSetSha256,
  };
  if (
    canonicalSourceRegistrationJson(
      rehearsalProjection as unknown as SourceRegistrationJsonValue,
    ) !==
    canonicalSourceRegistrationJson(
      companion.logicalCloneRehearsal as SourceRegistrationJsonValue,
    )
  ) {
    fail("logical-clone rehearsal file differs from companion binding");
  }
  if (
    rehearsal.targetSetSha256 !==
    SOURCE_REGISTRATION_APPLY_LOCKED_TARGET_SET_SHA256
  ) {
    fail("logical-clone rehearsal target set differs from the locked plan");
  }

  return {
    companionReceiptFileSha256: companionFile.fileSha256,
    logicalRestoreCompanion: {
      receiptFileSha256: companionFile.fileSha256,
      completedAtUtc: companion.completedAtUtc,
      logicalComparisonStartedAtUtc: companion.comparison.startedAtUtc,
      logicalComparisonCompletedAtUtc: companion.comparison.completedAtUtc,
      logicalComparisonProofSha256:
        companion.comparison.logicalComparisonProofSha256,
      source: {
        contentStateSha256: source.contentStateSha256,
        logicalStateSha256: source.logicalStateSha256,
        relationCount: source.relationCount,
        totalRowCount: source.totalRowCount,
        sequenceRowCount: source.sequenceCount,
      },
      restored: {
        contentStateSha256: restored.contentStateSha256,
        logicalStateSha256: restored.logicalStateSha256,
        relationCount: restored.relationCount,
        totalRowCount: restored.totalRowCount,
        sequenceRowCount: restored.sequenceCount,
      },
      postRehearsalVerifiedAtUtc:
        companion.comparison.postRehearsalVerifiedAtUtc,
      postRehearsalCloneFullStateMatched:
        companion.comparison.postRehearsalCloneFullStateMatched,
      sourceStillMatched: companion.comparison.sourceStillMatched,
      cloneDatabaseDropped: true,
      cloneDatabaseAbsenceConfirmed: companion.cleanup.databaseAbsenceConfirmed,
    },
    logicalCloneRehearsal: {
      receiptFileSha256: rehearsalFile.fileSha256,
      receiptSelfSha256: rehearsal.receiptSha256,
      operationKey: rehearsal.operationKey,
      runtimeAttestationSha256:
        rehearsal.executedRuntime.runtimeAttestationSha256,
      rehearsalStartedAtUtc: rehearsal.rehearsalStartedAtUtc,
      rehearsalCompletedAtUtc: rehearsal.rehearsalCompletedAtUtc,
      targetSetSha256: rehearsal.targetSetSha256,
      exactProductionTargetExercised: rehearsal.exactProductionTargetExercised,
      productionAuthorizationUsed: rehearsal.productionAuthorizationUsed,
      transactionRolledBack: rehearsal.rollback.transactionRolledBack,
      rollbackAbsenceConfirmed: rehearsal.rollback.rollbackAbsenceConfirmed,
    },
  };
}

export type SourceRegistrationReleaseEvidencePins = {
  backupSha256?: string;
  backupBytes?: number;
  backupMetadataSha256?: string;
  structuralRestoreReceiptSha256?: string;
  logicalRestoreCompanionReceiptSha256?: string;
  logicalCloneRehearsalReceiptFileSha256?: string;
  logicalCloneRehearsalReceiptSelfSha256?: string;
  logicalComparisonProofSha256?: string;
  completedMigrationLedgerSha256?: string;
  targetFingerprintSha256?: string;
};

const SOURCE_REGISTRATION_BACKUP_REQUIRED_TABLES = [
  "Document",
  "DocumentRef",
  "Report",
  "Thesis",
  "SourceDoc",
  "SourceCitation",
  "FieldCitation",
  "EvidenceAppraisal",
  "LibraryAnalysisRecord",
  "InsightDocumentRef",
  "CompanyDocumentRef",
  "ActorDocumentRef",
  "SourceRef",
  "MediaEntry",
  "Insight",
  "Producer",
  "_InsightSourceDoc",
  "DatabaseIdentity",
  "ControlledMutationAudit",
  "_prisma_migrations",
].join(" ");

export function sourceRegistrationBackupVerifierEnvironment(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): Record<string, string> {
  if (typeof environment.PATH !== "string" || environment.PATH.length === 0) {
    fail("backup structural verifier requires an explicit PATH");
  }
  return {
    BACKUP_REQUIRE_METADATA_V2: "1",
    BACKUP_REQUIRED_TABLES: SOURCE_REGISTRATION_BACKUP_REQUIRED_TABLES,
    LANG: "C",
    LC_ALL: "C",
    PATH: environment.PATH,
    TMPDIR: "/tmp",
    TZ: "UTC",
  };
}

export async function verifySourceRegistrationReleaseEvidence(input: {
  projectRoot: string;
  codeBindings: SourceRegistrationApplyCodeBindings;
  backupFile: string;
  structuralRestoreReceipt: string;
  logicalRestoreCompanionReceipt: string;
  logicalCloneRehearsalReceipt: string;
  pins?: SourceRegistrationReleaseEvidencePins;
  now?: Date;
  verifierPath?: string;
  backupContractHelperPath?: string;
  expectedVerifierFileSha256?: string;
  expectedBackupContractHelperFileSha256?: string;
}): Promise<SourceRegistrationReleaseEvidence> {
  if (!isAbsolute(input.backupFile) || !existsSync(input.backupFile)) {
    fail("backup file must be an existing absolute path");
  }
  if (
    !isAbsolute(input.structuralRestoreReceipt) ||
    !existsSync(input.structuralRestoreReceipt)
  ) {
    fail("structural restore receipt must be an existing absolute path");
  }
  const checksumPath = `${input.backupFile}.sha256`;
  const metadataPath = `${input.backupFile}.metadata`;
  const metadataChecksumPath = `${metadataPath}.sha256`;
  for (const path of [checksumPath, metadataPath, metadataChecksumPath]) {
    if (!existsSync(path)) fail("backup sidecars are incomplete");
  }
  const evidencePaths = [
    input.backupFile,
    checksumPath,
    metadataPath,
    metadataChecksumPath,
    input.structuralRestoreReceipt,
  ];
  for (const [index, path] of evidencePaths.entries()) {
    readPrivateRegularFile(path, `release evidence file ${index + 1}`);
  }

  const checksumRaw = readFileSync(checksumPath, "utf8");
  const checksumMatch = /^([a-f0-9]{64})  ([^/\r\n]+)\n?$/.exec(checksumRaw);
  if (!checksumMatch || checksumMatch[2] !== basename(input.backupFile)) {
    fail("backup checksum sidecar is invalid");
  }
  const dumpSha256 = await sha256File(input.backupFile);
  const dumpBytes = statSync(input.backupFile).size;
  if (dumpSha256 !== checksumMatch[1]) fail("backup dump checksum mismatch");

  const metadataBytes = readFileSync(metadataPath);
  const metadataSha256 = sourceRegistrationApplyBareSha256(metadataBytes);
  const metadataChecksumRaw = readFileSync(metadataChecksumPath, "utf8");
  if (
    !/^([a-f0-9]{64})\n?$/.test(metadataChecksumRaw) ||
    metadataChecksumRaw.trim() !== metadataSha256
  ) {
    fail("backup metadata checksum binding mismatch");
  }
  const metadata = exactObject(
    parseJson(metadataBytes, "backup metadata"),
    [
      "completedPrismaMigrationLedger",
      "coreCounts",
      "createdAtUtc",
      "databaseIdentity",
      "dump",
      "format",
      "source",
      "targetDatabaseFingerprint",
      "version",
    ],
    "backup metadata",
  );
  if (
    metadata.format !== "foodsystems-database-backup-metadata" ||
    metadata.version !== 2
  ) {
    fail("controlled registration requires backup metadata version 2");
  }
  const now = input.now ?? new Date();
  const backupCreatedAt = recentTimestamp(
    metadata.createdAtUtc,
    "backup createdAtUtc",
    now,
  );
  const dump = exactObject(
    metadata.dump,
    ["archiveFormat", "bytes", "fileName", "sha256"],
    "backup metadata dump",
  );
  if (
    dump.archiveFormat !== "postgresql-custom" ||
    dump.fileName !== basename(input.backupFile) ||
    dump.sha256 !== dumpSha256 ||
    dump.bytes !== dumpBytes
  ) {
    fail("backup metadata does not bind the exact dump");
  }
  const source = exactObject(
    metadata.source,
    ["databaseName", "serverVersion"],
    "backup source",
  );
  if (
    typeof source.databaseName !== "string" ||
    source.databaseName !==
      SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_TARGET.databaseName ||
    typeof source.serverVersion !== "string" ||
    !source.serverVersion
  ) {
    fail("backup source metadata is incomplete");
  }
  const identity = exactObject(
    metadata.databaseIdentity,
    ["key", "uuid"],
    "backup database identity",
  );
  if (
    identity.key !== "primary" ||
    typeof identity.uuid !== "string" ||
    !UUID_PATTERN.test(identity.uuid)
  ) {
    fail("backup requires exactly the primary DatabaseIdentity UUID");
  }
  const databaseIdentityUuid = identity.uuid.toLowerCase();
  const ledger = exactObject(
    metadata.completedPrismaMigrationLedger,
    ["completedCount", "sha256"],
    "backup migration ledger",
  );
  if (
    !Number.isSafeInteger(ledger.completedCount) ||
    Number(ledger.completedCount) <= 0 ||
    typeof ledger.sha256 !== "string" ||
    !SHA256_PATTERN.test(ledger.sha256)
  ) {
    fail("backup completed migration ledger is invalid");
  }
  const completedMigrationCount = Number(ledger.completedCount);
  const completedMigrationLedgerSha256 = ledger.sha256;
  const coreCounts = exactCoreCounts(metadata.coreCounts, "backup core counts");
  const fingerprint = exactObject(
    metadata.targetDatabaseFingerprint,
    ["canonicalJsonFormat", "sha256"],
    "backup target fingerprint",
  );
  if (
    fingerprint.canonicalJsonFormat !== "sorted-keys-v1" ||
    typeof fingerprint.sha256 !== "string" ||
    !SHA256_PATTERN.test(fingerprint.sha256)
  ) {
    fail("backup target fingerprint is invalid");
  }
  const targetFingerprintSha256 = fingerprint.sha256;
  const recomputedFingerprint = sourceRegistrationDatabaseFingerprintSha256({
    completedPrismaMigrationLedger: {
      completedCount: completedMigrationCount,
      sha256: completedMigrationLedgerSha256,
    },
    coreCounts,
    databaseIdentity: { key: "primary", uuid: databaseIdentityUuid },
  });
  if (recomputedFingerprint !== targetFingerprintSha256) {
    fail("backup target fingerprint payload does not self-consistently hash");
  }

  const verifier =
    input.verifierPath ??
    resolve(process.cwd(), "scripts/verify-database-backup.sh");
  const contractHelper =
    input.backupContractHelperPath ??
    resolve(dirname(verifier), "database-backup-contract.mjs");
  const verifierBytes = readRegularFile(verifier, "backup structural verifier");
  const helperBytes = readRegularFile(
    contractHelper,
    "backup structural verifier contract helper",
  );
  const verifierSha256 = sourceRegistrationApplyBareSha256(verifierBytes);
  const helperSha256 = sourceRegistrationApplyBareSha256(helperBytes);
  if (
    input.expectedVerifierFileSha256 !== undefined &&
    input.expectedVerifierFileSha256 !== verifierSha256
  ) {
    fail("backup structural verifier differs from its code binding");
  }
  if (
    input.expectedBackupContractHelperFileSha256 !== undefined &&
    input.expectedBackupContractHelperFileSha256 !== helperSha256
  ) {
    fail("backup contract helper differs from its code binding");
  }
  // Execute private, exact-byte copies so a concurrent tracked-file rewrite
  // cannot change which verifier/helper bytes actually inspect the archive.
  const verifierDirectory = mkdtempSync(
    join(tmpdir(), "foodsystems-source-registration-verifier-"),
  );
  const copiedVerifier = join(verifierDirectory, "verify-database-backup.sh");
  const copiedHelper = join(verifierDirectory, "database-backup-contract.mjs");
  let verification: ReturnType<typeof spawnSync>;
  try {
    writeFileSync(copiedVerifier, verifierBytes, { mode: 0o500 });
    writeFileSync(copiedHelper, helperBytes, { mode: 0o400 });
    chmodSync(copiedVerifier, 0o500);
    chmodSync(copiedHelper, 0o400);
    verification = spawnSync(copiedVerifier, [input.backupFile], {
      encoding: "utf8",
      env: sourceRegistrationBackupVerifierEnvironment() as NodeJS.ProcessEnv,
    });
    if (
      sourceRegistrationApplyBareSha256(readFileSync(copiedVerifier)) !==
        verifierSha256 ||
      sourceRegistrationApplyBareSha256(readFileSync(copiedHelper)) !==
        helperSha256 ||
      sourceRegistrationApplyBareSha256(readFileSync(verifier)) !==
        verifierSha256 ||
      sourceRegistrationApplyBareSha256(readFileSync(contractHelper)) !==
        helperSha256
    ) {
      fail(
        "backup verifier/helper bytes changed during structural verification",
      );
    }
  } finally {
    rmSync(verifierDirectory, { recursive: true, force: true });
  }
  if (verification.error || verification.status !== 0) {
    fail("backup structural verifier did not pass");
  }

  const receiptBytes = readFileSync(input.structuralRestoreReceipt);
  const structuralRestoreReceiptSha256 =
    sourceRegistrationApplyBareSha256(receiptBytes);
  const receipt = exactObject(
    parseJson(receiptBytes, "restore receipt"),
    [
      "backup",
      "checks",
      "cleanup",
      "completedAtUtc",
      "completedPrismaMigrationLedger",
      "coreCounts",
      "databaseIdentity",
      "format",
      "targetDatabaseFingerprint",
      "version",
    ],
    "restore receipt",
  );
  if (
    receipt.format !== "foodsystems-database-restore-receipt" ||
    receipt.version !== 1
  ) {
    fail("controlled registration requires restore receipt version 1");
  }
  const restoreCompletedAt = recentTimestamp(
    receipt.completedAtUtc,
    "restore completedAtUtc",
    now,
  );
  if (restoreCompletedAt < backupCreatedAt) fail("restore predates its backup");
  const receiptBackup = exactObject(
    receipt.backup,
    ["dumpBytes", "dumpSha256", "metadataSha256"],
    "restore receipt backup",
  );
  if (
    receiptBackup.dumpBytes !== dumpBytes ||
    receiptBackup.dumpSha256 !== dumpSha256 ||
    receiptBackup.metadataSha256 !== metadataSha256
  ) {
    fail("restore receipt does not bind the exact dump and metadata bytes");
  }
  for (const [receiptValue, metadataValue, label] of [
    [receipt.databaseIdentity, metadata.databaseIdentity, "database identity"],
    [
      receipt.completedPrismaMigrationLedger,
      metadata.completedPrismaMigrationLedger,
      "migration ledger",
    ],
    [receipt.coreCounts, metadata.coreCounts, "core counts"],
    [
      receipt.targetDatabaseFingerprint,
      metadata.targetDatabaseFingerprint,
      "target fingerprint",
    ],
  ] as const) {
    if (
      canonicalSourceRegistrationJson(
        receiptValue as unknown as SourceRegistrationJsonValue,
      ) !==
      canonicalSourceRegistrationJson(
        metadataValue as unknown as SourceRegistrationJsonValue,
      )
    ) {
      fail(`restore receipt ${label} differs from backup metadata`);
    }
  }
  const checks = exactObject(
    receipt.checks,
    [
      "archiveChecksumAndCatalog",
      "completedMigrationLedger",
      "constraintsValidated",
      "databaseIdentity",
      "exactCoreCounts",
      "indexesReady",
      "metadataV2Binding",
      "optionalOperatorExpectedCounts",
      "requiredRelationsAndNonEmptyData",
      "restoreCompleted",
      "targetDatabaseFingerprint",
    ],
    "restore receipt checks",
  );
  for (const [key, value] of Object.entries(checks)) {
    if (key === "optionalOperatorExpectedCounts") continue;
    if (value !== "pass") fail(`restore receipt check ${key} did not pass`);
  }
  const optionalCounts = exactObject(
    checks.optionalOperatorExpectedCounts,
    ["status", "supplied"],
    "restore optional expected counts",
  );
  if (optionalCounts.status !== "pass")
    fail("optional expected counts did not pass");
  if (
    !optionalCounts.supplied ||
    typeof optionalCounts.supplied !== "object" ||
    Array.isArray(optionalCounts.supplied)
  ) {
    fail("restore optional expected counts are invalid");
  }
  for (const [key, value] of Object.entries(optionalCounts.supplied)) {
    if (
      !(key in coreCounts) ||
      value !== coreCounts[key as keyof typeof coreCounts]
    ) {
      fail(`restore optional count ${key} differs from backup metadata`);
    }
  }
  const cleanup = exactObject(
    receipt.cleanup,
    ["databaseAbsenceConfirmed", "databaseName", "drop"],
    "restore cleanup",
  );
  if (
    typeof cleanup.databaseName !== "string" ||
    !/^foodsystems_restore_[a-z0-9_]+$/.test(cleanup.databaseName) ||
    cleanup.drop !== "pass" ||
    cleanup.databaseAbsenceConfirmed !== true
  ) {
    fail("restore receipt does not prove disposable database cleanup");
  }

  const pins = input.pins ?? {};
  const observedPins: Required<SourceRegistrationReleaseEvidencePins> = {
    backupSha256: dumpSha256,
    backupBytes: dumpBytes,
    backupMetadataSha256: metadataSha256,
    structuralRestoreReceiptSha256,
    logicalRestoreCompanionReceiptSha256: "",
    logicalCloneRehearsalReceiptFileSha256: "",
    logicalCloneRehearsalReceiptSelfSha256: "",
    logicalComparisonProofSha256: "",
    completedMigrationLedgerSha256,
    targetFingerprintSha256,
  };
  if (
    (await sha256File(input.backupFile)) !== dumpSha256 ||
    statSync(input.backupFile).size !== dumpBytes ||
    sourceRegistrationApplyBareSha256(readFileSync(metadataPath)) !==
      metadataSha256 ||
    sourceRegistrationApplyBareSha256(
      readFileSync(input.structuralRestoreReceipt),
    ) !== structuralRestoreReceiptSha256 ||
    readFileSync(checksumPath, "utf8") !== checksumRaw ||
    readFileSync(metadataChecksumPath, "utf8") !== metadataChecksumRaw
  ) {
    fail("release evidence changed during verification");
  }

  const logicalEvidence = verifySourceRegistrationLogicalRestoreEvidence({
    projectRoot: input.projectRoot,
    companionReceiptPath: input.logicalRestoreCompanionReceipt,
    rehearsalReceiptPath: input.logicalCloneRehearsalReceipt,
    codeBindings: input.codeBindings,
    now,
    backup: {
      dumpSha256,
      dumpBytes,
      metadataSha256,
      metadataCreatedAtUtc: backupCreatedAt.toISOString(),
      targetFingerprintSha256,
    },
    structuralRestore: {
      receiptSha256: structuralRestoreReceiptSha256,
      completedAtUtc: restoreCompletedAt.toISOString(),
    },
    expectedCompanionReceiptFileSha256:
      input.pins?.logicalRestoreCompanionReceiptSha256,
    expectedRehearsalReceiptFileSha256:
      input.pins?.logicalCloneRehearsalReceiptFileSha256,
    expectedRehearsalReceiptSelfSha256:
      input.pins?.logicalCloneRehearsalReceiptSelfSha256,
    expectedLogicalComparisonProofSha256:
      input.pins?.logicalComparisonProofSha256,
  });
  observedPins.logicalRestoreCompanionReceiptSha256 =
    logicalEvidence.companionReceiptFileSha256;
  observedPins.logicalCloneRehearsalReceiptFileSha256 =
    logicalEvidence.logicalCloneRehearsal.receiptFileSha256;
  observedPins.logicalCloneRehearsalReceiptSelfSha256 =
    logicalEvidence.logicalCloneRehearsal.receiptSelfSha256;
  observedPins.logicalComparisonProofSha256 =
    logicalEvidence.logicalRestoreCompanion.logicalComparisonProofSha256;
  for (const [key, expected] of Object.entries(pins)) {
    if (
      expected !== undefined &&
      observedPins[key as keyof typeof observedPins] !== expected
    ) {
      fail(`explicit release-evidence pin ${key} differs`);
    }
  }

  const finalCompanionFile = readStablePrivateEvidenceFile({
    path: input.logicalRestoreCompanionReceipt,
    projectRoot: input.projectRoot,
    label: "logical-restore companion receipt",
  });
  const finalRehearsalFile = readStablePrivateEvidenceFile({
    path: input.logicalCloneRehearsalReceipt,
    projectRoot: input.projectRoot,
    label: "logical-clone rehearsal receipt",
  });
  if (
    (await sha256File(input.backupFile)) !== dumpSha256 ||
    statSync(input.backupFile).size !== dumpBytes ||
    sourceRegistrationApplyBareSha256(readFileSync(metadataPath)) !==
      metadataSha256 ||
    sourceRegistrationApplyBareSha256(
      readFileSync(input.structuralRestoreReceipt),
    ) !== structuralRestoreReceiptSha256 ||
    readFileSync(checksumPath, "utf8") !== checksumRaw ||
    readFileSync(metadataChecksumPath, "utf8") !== metadataChecksumRaw ||
    finalCompanionFile.fileSha256 !==
      logicalEvidence.companionReceiptFileSha256 ||
    finalRehearsalFile.fileSha256 !==
      logicalEvidence.logicalCloneRehearsal.receiptFileSha256
  ) {
    fail("release evidence changed during logical verification");
  }

  return SourceRegistrationReleaseEvidenceSchema.parse({
    backupSha256: observedPins.backupSha256,
    backupBytes: observedPins.backupBytes,
    backupMetadataSha256: observedPins.backupMetadataSha256,
    structuralRestoreReceiptSha256: observedPins.structuralRestoreReceiptSha256,
    completedMigrationLedgerSha256: observedPins.completedMigrationLedgerSha256,
    targetFingerprintSha256: observedPins.targetFingerprintSha256,
    sourceDatabaseName: source.databaseName,
    databaseIdentityUuid,
    completedMigrationCount,
    coreCounts,
    backupCreatedAtUtc: backupCreatedAt.toISOString(),
    structuralRestoreCompletedAtUtc: restoreCompletedAt.toISOString(),
    logicalRestoreCompanion: logicalEvidence.logicalRestoreCompanion,
    logicalCloneRehearsal: logicalEvidence.logicalCloneRehearsal,
    verification: {
      metadataVersion: 2,
      structuralRestoreReceiptVersion: 1,
      logicalRestoreCompanionReceiptVersion: 1,
      logicalCloneRehearsalSchemaVersion:
        "source-registration-logical-clone-rehearsal-v1",
      structuralVerifierPassed: true,
      structuralRestoreCleanupPassed: true,
      logicalRestoreCompanionValidated: true,
      logicalCloneRehearsalValidated: true,
      logicalRestoreCleanupPassed: true,
      evidenceFilesUnchanged: true,
    },
  });
}

export function verifyExactSourceRegistrationReleaseAuthorization(input: {
  authorizationPath: string;
  authorizationEnvelopeSha256: string;
  operatorId: string;
  plan: SourceRegistrationPlan;
  codeBindings: SourceRegistrationApplyCodeBindings;
  releaseEvidence: SourceRegistrationReleaseEvidence;
  dependencyStateSha256: string;
  operationKey: string;
  now?: Date;
}): SourceRegistrationReleaseAuthorization {
  if (
    input.codeBindings.releaseAuthorizationPublicKey.fileSha256 !==
    SOURCE_REGISTRATION_RELEASE_AUTHORIZATION_PUBLIC_KEY_SHA256
  ) {
    fail("tracked release-authorization public key differs from its hard pin");
  }
  const expected = {
    authorizationEnvelopeSha256: bareHash(
      input.authorizationEnvelopeSha256,
      "release authorization envelope",
    ),
    publicKeyFileSha256:
      input.codeBindings.releaseAuthorizationPublicKey.fileSha256,
    acknowledgement: SOURCE_REGISTRATION_APPLY_ACK,
    operatorId: input.operatorId,
    databaseRole: SOURCE_REGISTRATION_APPLY_DATABASE_ROLE,
    planSha256: SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_SHA256,
    planFileSha256: SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_FILE_SHA256,
    beforeSnapshotSha256:
      SOURCE_REGISTRATION_APPLY_LOCKED_BEFORE_SNAPSHOT_SHA256,
    databaseIdentityUuid:
      SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_IDENTITY_UUID,
    sourceDatabaseName:
      SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_TARGET.databaseName,
    applyContractSha256: sourceRegistrationApplyContractSha256(),
    dependencyStateSha256: input.dependencyStateSha256,
    operationKey: input.operationKey,
    codeBindingsSha256: sourceRegistrationApplyCodeBindingsSha256(
      input.codeBindings,
    ),
    databaseTargetSha256:
      SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_TARGET_SHA256,
    databaseCatalogSha256:
      SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_CATALOG_SHA256,
    contentStateSha256:
      input.releaseEvidence.logicalRestoreCompanion.source.contentStateSha256,
    backupSha256: input.releaseEvidence.backupSha256,
    backupBytes: input.releaseEvidence.backupBytes,
    backupMetadataSha256: input.releaseEvidence.backupMetadataSha256,
    structuralRestoreReceiptSha256:
      input.releaseEvidence.structuralRestoreReceiptSha256,
    logicalRestoreCompanionReceiptSha256:
      input.releaseEvidence.logicalRestoreCompanion.receiptFileSha256,
    logicalCloneRehearsalReceiptFileSha256:
      input.releaseEvidence.logicalCloneRehearsal.receiptFileSha256,
    logicalCloneRehearsalReceiptSelfSha256:
      input.releaseEvidence.logicalCloneRehearsal.receiptSelfSha256,
    completedMigrationLedgerSha256:
      input.releaseEvidence.completedMigrationLedgerSha256,
    targetFingerprintSha256: input.releaseEvidence.targetFingerprintSha256,
    targetSetSha256: sourceRegistrationApplyTargetSetSha256(input.plan),
    structuralRestoreCompletedAtUtc:
      input.releaseEvidence.structuralRestoreCompletedAtUtc,
    logicalRestoreCompanionCompletedAtUtc:
      input.releaseEvidence.logicalRestoreCompanion.completedAtUtc,
    logicalComparisonProofSha256:
      input.releaseEvidence.logicalRestoreCompanion
        .logicalComparisonProofSha256,
    logicalCloneRehearsalOperationKey:
      input.releaseEvidence.logicalCloneRehearsal.operationKey,
    logicalCloneRehearsalRuntimeAttestationSha256:
      input.releaseEvidence.logicalCloneRehearsal.runtimeAttestationSha256,
    logicalCloneRehearsalCompletedAtUtc:
      input.releaseEvidence.logicalCloneRehearsal.rehearsalCompletedAtUtc,
    restoreRunnerSha256: input.codeBindings.restoreRunner.fileSha256,
    backupVerifierSha256: input.codeBindings.backupVerifier.fileSha256,
    backupContractHelperSha256:
      input.codeBindings.backupContractHelper.fileSha256,
    databaseLogicalDigestSha256:
      input.codeBindings.databaseLogicalStateDigest.fileSha256,
    psqlBinarySha256:
      input.codeBindings.runtimeEnvironment.psql.binaryFileSha256,
    psqlRuntimeClosureSha256:
      input.codeBindings.runtimeEnvironment.psql.runtimeClosureSha256,
    restoredDatabaseDropped:
      input.releaseEvidence.logicalRestoreCompanion.cloneDatabaseDropped,
    restoredDatabaseAbsenceConfirmed:
      input.releaseEvidence.logicalRestoreCompanion
        .cloneDatabaseAbsenceConfirmed,
    postRehearsalCloneFullStateMatched:
      input.releaseEvidence.logicalRestoreCompanion
        .postRehearsalCloneFullStateMatched,
    sourceStillMatchedAfterRehearsal:
      input.releaseEvidence.logicalRestoreCompanion.sourceStillMatched,
  };
  const verified = verifySourceRegistrationReleaseAuthorization({
    authorizationPath: input.authorizationPath,
    expected,
    now: input.now,
  });
  return SourceRegistrationReleaseAuthorizationSchema.parse(verified);
}

export function loadLockedSourceRegistrationPlan(
  projectRoot: string,
): SourceRegistrationPlan {
  const absolute = projectFile(
    projectRoot,
    SOURCE_REGISTRATION_APPLY_PLAN_PATH,
  );
  return validateLockedSourceRegistrationPlanBytes(
    readRegularFile(absolute, "locked source-registration plan"),
  );
}

function fileBinding(projectRoot: string, path: string) {
  const bytes = readRegularFile(projectFile(projectRoot, path), path);
  return { path, fileSha256: sourceRegistrationApplyBareSha256(bytes) };
}

export function sourceRegistrationRuntimeAttestation(
  projectRoot: string,
): SourceRegistrationRuntimeAttestation {
  const launcher = projectFile(
    projectRoot,
    SOURCE_REGISTRATION_APPLY_PATHS.launcher,
  );
  const result = spawnSync(process.execPath, [launcher, "--attest-only"], {
    cwd: projectRoot,
    encoding: "utf8",
    env: process.env,
    maxBuffer: 1_000_000,
  });
  if (
    result.error ||
    result.status !== 0 ||
    result.signal ||
    result.stderr.trim() ||
    !result.stdout.trim()
  ) {
    fail("builtins-only runtime attestation launcher did not pass");
  }
  const attestation = validateSourceRegistrationRuntimeAttestation(
    parseJson(result.stdout, "runtime attestation"),
  );
  const launcherBinding = fileBinding(
    projectRoot,
    SOURCE_REGISTRATION_APPLY_PATHS.launcher,
  );
  if (attestation.launcher.fileSha256 !== launcherBinding.fileSha256) {
    fail("runtime attestation did not bind the exact launcher bytes");
  }
  return attestation;
}

const SOURCE_REGISTRATION_RUNTIME_ENVELOPE_DOMAIN =
  "food-systems-2026:source-registration-runtime-envelope:v1\0";

export function readSourceRegistrationLauncherAttestation(): SourceRegistrationRuntimeAttestation {
  const fdRaw = process.env.SOURCE_REGISTRATION_LAUNCH_ATTESTATION_FD;
  const launcherPidRaw = process.env.SOURCE_REGISTRATION_LAUNCHER_PID;
  if (
    !fdRaw ||
    !/^[3-9][0-9]*$/.test(fdRaw) ||
    !launcherPidRaw ||
    !/^[1-9][0-9]*$/.test(launcherPidRaw)
  ) {
    fail("--apply must be started by the locked pre-import launcher");
  }
  const fd = Number(fdRaw);
  const launcherPid = Number(launcherPidRaw);
  if (
    !Number.isSafeInteger(fd) ||
    !Number.isSafeInteger(launcherPid) ||
    launcherPid !== process.ppid
  ) {
    fail("launcher process identity does not match the inherited attestation");
  }
  let bytes: Buffer;
  try {
    bytes = readFileSync(fd);
  } catch {
    fail("inherited launcher attestation descriptor is unreadable");
  }
  if (bytes.length === 0 || bytes.length > 100_000) {
    fail("inherited launcher attestation envelope has an unsafe size");
  }
  const envelope = exactObject(
    parseJson(bytes, "launcher runtime attestation envelope"),
    ["attestation", "envelopeSha256", "launcherPid"],
    "launcher runtime attestation envelope",
  );
  if (
    envelope.launcherPid !== launcherPid ||
    typeof envelope.envelopeSha256 !== "string" ||
    !SHA256_PATTERN.test(envelope.envelopeSha256)
  ) {
    fail("launcher runtime attestation envelope identity is invalid");
  }
  const expectedEnvelopeSha256 = sourceRegistrationApplyBareSha256(
    `${SOURCE_REGISTRATION_RUNTIME_ENVELOPE_DOMAIN}${canonicalSourceRegistrationJson(
      {
        attestation:
          envelope.attestation as unknown as SourceRegistrationJsonValue,
        launcherPid,
      },
    )}`,
  );
  if (envelope.envelopeSha256 !== expectedEnvelopeSha256) {
    fail("launcher runtime attestation envelope self-hash mismatch");
  }
  return validateSourceRegistrationRuntimeAttestation(envelope.attestation);
}

export function sourceRegistrationApplyCodeBindings(
  projectRoot: string,
): SourceRegistrationApplyCodeBindings {
  const runtimeEnvironment = sourceRegistrationRuntimeAttestation(projectRoot);
  const codeBindings = SourceRegistrationApplyCodeBindingsSchema.parse({
    runtime: fileBinding(projectRoot, SOURCE_REGISTRATION_APPLY_PATHS.runtime),
    runner: fileBinding(projectRoot, SOURCE_REGISTRATION_APPLY_PATHS.runner),
    launcher: fileBinding(
      projectRoot,
      SOURCE_REGISTRATION_APPLY_PATHS.launcher,
    ),
    runtimeLauncherTest: fileBinding(
      projectRoot,
      SOURCE_REGISTRATION_APPLY_PATHS.runtimeLauncherTest,
    ),
    logicalCloneRehearsalRuntime: fileBinding(
      projectRoot,
      SOURCE_REGISTRATION_APPLY_PATHS.logicalCloneRehearsalRuntime,
    ),
    logicalCloneRehearsalJsonSchema: fileBinding(
      projectRoot,
      SOURCE_REGISTRATION_APPLY_PATHS.logicalCloneRehearsalJsonSchema,
    ),
    logicalCloneRehearsalTest: fileBinding(
      projectRoot,
      SOURCE_REGISTRATION_APPLY_PATHS.logicalCloneRehearsalTest,
    ),
    logicalCloneRehearsalCommandRunner: fileBinding(
      projectRoot,
      SOURCE_REGISTRATION_APPLY_PATHS.logicalCloneRehearsalCommandRunner,
    ),
    logicalRestoreCompanionValidator: fileBinding(
      projectRoot,
      SOURCE_REGISTRATION_APPLY_PATHS.logicalRestoreCompanionValidator,
    ),
    logicalRestoreCompanionJsonSchema: fileBinding(
      projectRoot,
      SOURCE_REGISTRATION_APPLY_PATHS.logicalRestoreCompanionJsonSchema,
    ),
    logicalRestoreCompanionTest: fileBinding(
      projectRoot,
      SOURCE_REGISTRATION_APPLY_PATHS.logicalRestoreCompanionTest,
    ),
    controlledLogicalRestoreCompanionRunner: fileBinding(
      projectRoot,
      SOURCE_REGISTRATION_APPLY_PATHS.controlledLogicalRestoreCompanionRunner,
    ),
    pdfQualificationRuntime: fileBinding(
      projectRoot,
      SOURCE_REGISTRATION_APPLY_PATHS.pdfQualificationRuntime,
    ),
    sourceAcquisitionRuntime: fileBinding(
      projectRoot,
      SOURCE_REGISTRATION_APPLY_PATHS.sourceAcquisitionRuntime,
    ),
    sourceAnalysisInputRuntime: fileBinding(
      projectRoot,
      SOURCE_REGISTRATION_APPLY_PATHS.sourceAnalysisInputRuntime,
    ),
    databaseLogicalStateDigest: fileBinding(
      projectRoot,
      SOURCE_REGISTRATION_APPLY_PATHS.databaseLogicalStateDigest,
    ),
    databaseLogicalStateDigestTest: fileBinding(
      projectRoot,
      SOURCE_REGISTRATION_APPLY_PATHS.databaseLogicalStateDigestTest,
    ),
    nodeRuntimeClosureManifest: fileBinding(
      projectRoot,
      SOURCE_REGISTRATION_APPLY_PATHS.nodeRuntimeClosureManifest,
    ),
    nodeRuntimeClosureVerifier: fileBinding(
      projectRoot,
      SOURCE_REGISTRATION_APPLY_PATHS.nodeRuntimeClosureVerifier,
    ),
    nodeRuntimeClosureVerifierTest: fileBinding(
      projectRoot,
      SOURCE_REGISTRATION_APPLY_PATHS.nodeRuntimeClosureVerifierTest,
    ),
    psqlRuntimeClosureManifest: fileBinding(
      projectRoot,
      SOURCE_REGISTRATION_APPLY_PATHS.psqlRuntimeClosureManifest,
    ),
    psqlRuntimeClosureVerifier: fileBinding(
      projectRoot,
      SOURCE_REGISTRATION_APPLY_PATHS.psqlRuntimeClosureVerifier,
    ),
    psqlRuntimeClosureVerifierTest: fileBinding(
      projectRoot,
      SOURCE_REGISTRATION_APPLY_PATHS.psqlRuntimeClosureVerifierTest,
    ),
    restoreRunner: fileBinding(
      projectRoot,
      SOURCE_REGISTRATION_APPLY_PATHS.restoreRunner,
    ),
    releaseAuthorizationVerifier: fileBinding(
      projectRoot,
      SOURCE_REGISTRATION_APPLY_PATHS.releaseAuthorizationVerifier,
    ),
    releaseAuthorizationJsonSchema: fileBinding(
      projectRoot,
      SOURCE_REGISTRATION_APPLY_PATHS.releaseAuthorizationJsonSchema,
    ),
    releaseAuthorizationContract: fileBinding(
      projectRoot,
      SOURCE_REGISTRATION_APPLY_PATHS.releaseAuthorizationContract,
    ),
    releaseAuthorizationPublicKey: fileBinding(
      projectRoot,
      SOURCE_REGISTRATION_APPLY_PATHS.releaseAuthorizationPublicKey,
    ),
    releaseAuthorizationVerifierTest: fileBinding(
      projectRoot,
      SOURCE_REGISTRATION_APPLY_PATHS.releaseAuthorizationVerifierTest,
    ),
    releaseAuthorizationSigner: fileBinding(
      projectRoot,
      SOURCE_REGISTRATION_APPLY_PATHS.releaseAuthorizationSigner,
    ),
    releaseAuthorizationSignerTest: fileBinding(
      projectRoot,
      SOURCE_REGISTRATION_APPLY_PATHS.releaseAuthorizationSignerTest,
    ),
    jsonSchema: fileBinding(
      projectRoot,
      SOURCE_REGISTRATION_APPLY_PATHS.jsonSchema,
    ),
    contractDocument: fileBinding(
      projectRoot,
      SOURCE_REGISTRATION_APPLY_PATHS.contractDocument,
    ),
    backupVerifier: fileBinding(
      projectRoot,
      SOURCE_REGISTRATION_APPLY_PATHS.backupVerifier,
    ),
    backupContractHelper: fileBinding(
      projectRoot,
      SOURCE_REGISTRATION_APPLY_PATHS.backupContractHelper,
    ),
    packageLock: fileBinding(
      projectRoot,
      SOURCE_REGISTRATION_APPLY_PATHS.packageLock,
    ),
    prismaGeneratedClientTree: {
      path: SOURCE_REGISTRATION_APPLY_PATHS.prismaGeneratedClientTree,
      treeSha256: runtimeEnvironment.prismaGeneratedClient.treeSha256,
    },
    runtimeEnvironment,
  });
  if (
    codeBindings.launcher.fileSha256 !==
      runtimeEnvironment.launcher.fileSha256 ||
    codeBindings.prismaGeneratedClientTree.treeSha256 !==
      runtimeEnvironment.prismaGeneratedClient.treeSha256 ||
    codeBindings.nodeRuntimeClosureManifest.fileSha256 !==
      runtimeEnvironment.node.runtimeClosureManifestSha256 ||
    codeBindings.nodeRuntimeClosureVerifier.fileSha256 !==
      runtimeEnvironment.node.runtimeClosureVerifierFileSha256 ||
    codeBindings.psqlRuntimeClosureManifest.fileSha256 !==
      runtimeEnvironment.psql.runtimeClosureManifestSha256 ||
    codeBindings.psqlRuntimeClosureVerifier.fileSha256 !==
      runtimeEnvironment.psql.runtimeClosureVerifierFileSha256
  ) {
    fail("static code bindings differ from the pre-import runtime attestation");
  }
  return codeBindings;
}

function assertCanonicalEqual(
  left: unknown,
  right: unknown,
  label: string,
): void {
  if (
    canonicalSourceRegistrationJson(
      left as unknown as SourceRegistrationJsonValue,
    ) !==
    canonicalSourceRegistrationJson(
      right as unknown as SourceRegistrationJsonValue,
    )
  ) {
    fail(`${label} differs from the locked plan`);
  }
}

export function verifyLockedPlanInputs(input: {
  projectRoot: string;
  manifestPath: string;
  primaryCorpusRoot: string;
  replicaCorpusRoot: string;
  plan: SourceRegistrationPlan;
}) {
  const prepared = prepareSourceRegistrationInputs(input);
  assertCanonicalEqual(
    prepared.inputBindings,
    input.plan.inputBindings,
    "source-registration input bindings",
  );
  if (
    prepared.batch.batchId !== input.plan.batchId ||
    prepared.preparedTargets.length !== input.plan.targets.length
  ) {
    fail("prepared registration batch differs from locked plan");
  }
  const byTarget = new Map(
    input.plan.targets.map((target) => [target.targetId, target]),
  );
  for (const preparedTarget of prepared.preparedTargets) {
    const planned = byTarget.get(preparedTarget.target.targetId);
    if (!planned)
      fail(`unexpected prepared target ${preparedTarget.target.targetId}`);
    assertCanonicalEqual(
      preparedTarget.evidence,
      planned.artifactEvidence,
      `${planned.targetId} artifact evidence`,
    );
    assertCanonicalEqual(
      preparedTarget.contentBinding,
      planned.intendedDocumentRow.contentBinding,
      `${planned.targetId} content binding`,
    );
    if (
      preparedTarget.target.document.id !== planned.intendedDocumentRow.id ||
      preparedTarget.target.document.filePath !==
        planned.intendedDocumentRow.filePath ||
      preparedTarget.target.source.rawContentSha256 !==
        planned.intendedPrivateRecoveryRow.sha256
    ) {
      fail(`${planned.targetId} prepared identity differs from locked plan`);
    }
  }
  if (
    prepared.privateRecoveryRegisterFile.fileSha256 !==
      input.plan.beforeSnapshot.privateRecoveryRegister.fileSha256 ||
    prepared.privateRecoveryRegister.candidates.length !==
      input.plan.beforeSnapshot.privateRecoveryRegister.candidateCount
  ) {
    fail("private recovery register differs from locked plan");
  }
  return prepared;
}

function inspectPrivateRoot(path: string, label: string) {
  if (!isAbsolute(path)) fail(`${label} must be an explicit absolute path`);
  const stats = lstatSync(path);
  if (!stats.isDirectory() || stats.isSymbolicLink()) {
    fail(`${label} must be a non-symlink directory`);
  }
  if ((stats.mode & 0o777) !== 0o700) fail(`${label} must have mode 0700`);
  return {
    realPath: realpathSync(path),
    device: stats.dev,
    inode: stats.ino,
  };
}

function portablePrivatePath(locator: unknown, label: string): string {
  if (typeof locator !== "string" || !locator.startsWith("private://corpus/")) {
    fail(`${label} is not a private corpus locator`);
  }
  return assertPortableRelativePath(
    locator.slice("private://corpus/".length),
    label,
  );
}

export function readPrivateLeafInsideRoot(input: {
  rootRealPath: string;
  portablePath: string;
  label: string;
}): { bytes: Buffer; stats: NonNullable<ReturnType<typeof lstatSync>> } {
  assertPortableRelativePath(input.portablePath, `${input.label} path`);
  const expectedPath = resolve(input.rootRealPath, input.portablePath);
  if (!expectedPath.startsWith(`${input.rootRealPath}${sep}`)) {
    fail(`${input.label} escaped the private root`);
  }
  const resolvedLeaf = realpathSync(expectedPath);
  if (
    resolvedLeaf !== expectedPath ||
    !resolvedLeaf.startsWith(`${input.rootRealPath}${sep}`)
  ) {
    fail(
      `${input.label} follows a symlink or resolves outside the private root`,
    );
  }
  const stats = lstatSync(expectedPath);
  if (
    !stats.isFile() ||
    stats.isSymbolicLink() ||
    (stats.mode & 0o777) !== 0o400
  ) {
    fail(`${input.label} must be a non-symlink mode-0400 regular file`);
  }
  return { bytes: readFileSync(expectedPath), stats };
}

export function reconstructLockedDocumentContents(input: {
  projectRoot: string;
  primaryCorpusRoot: string;
  replicaCorpusRoot: string;
  plan: SourceRegistrationPlan;
}): Map<string, string> {
  const primary = inspectPrivateRoot(
    input.primaryCorpusRoot,
    "primary private corpus",
  );
  const replica = inspectPrivateRoot(
    input.replicaCorpusRoot,
    "replica private corpus",
  );
  if (
    primary.realPath === replica.realPath ||
    (primary.device === replica.device && primary.inode === replica.inode)
  ) {
    fail("primary and replica private roots must be distinct directories");
  }
  const contents = new Map<string, string>();
  for (const target of input.plan.targets) {
    const mapBinding = target.artifactEvidence.pageMap;
    const mapBytes = readRegularFile(
      projectFile(input.projectRoot, mapBinding.path),
      `${target.targetId} page map`,
    );
    if (
      sourceRegistrationSha256(mapBytes) !== mapBinding.fileSha256 ||
      mapBytes.length !== mapBinding.sizeBytes
    ) {
      fail(`${target.targetId} page-map file binding drifted`);
    }
    const pageMap = exactObject(
      parseJson(mapBytes, `${target.targetId} page map`),
      [
        "schemaVersion",
        "artifactType",
        "pipelineVersion",
        "processingUnit",
        "identityKeys",
        "identityAssociation",
        "sourceBinding",
        "expectedPageCount",
        "extractedPageCount",
        "pageSequenceComplete",
        "extractionEngine",
        "languagePolicy",
        "privateStorageOnly",
        "textIncludedInTrackedArtifact",
        "promotionState",
        "pages",
        "pageMapSha256",
      ],
      `${target.targetId} page map`,
    );
    if (!Array.isArray(pageMap.pages))
      fail(`${target.targetId} page map pages are invalid`);
    if (
      pageMap.pages.length !==
      target.intendedDocumentRow.contentBinding.pageCount
    ) {
      fail(`${target.targetId} page count differs from locked content binding`);
    }
    const parts: Buffer[] = [];
    for (const [index, value] of pageMap.pages.entries()) {
      const page = value as Record<string, unknown>;
      if (page.pageNumber !== index + 1) {
        fail(`${target.targetId} page sequence is not contiguous from 1`);
      }
      const storage = page.storage as Record<string, unknown> | undefined;
      const normalized = page.normalizedText as
        Record<string, unknown> | undefined;
      if (!storage || !normalized)
        fail(`${target.targetId} page ${index + 1} is incomplete`);
      const portable = portablePrivatePath(
        storage.normalizedTextLocator,
        `${target.targetId} normalized page locator`,
      );
      const primaryLeaf = readPrivateLeafInsideRoot({
        rootRealPath: primary.realPath,
        portablePath: portable,
        label: `${target.targetId} primary normalized page`,
      });
      const replicaLeaf = readPrivateLeafInsideRoot({
        rootRealPath: replica.realPath,
        portablePath: portable,
        label: `${target.targetId} replica normalized page`,
      });
      const primaryStats = primaryLeaf.stats;
      const replicaStats = replicaLeaf.stats;
      if (
        primaryStats.dev === replicaStats.dev &&
        primaryStats.ino === replicaStats.ino
      ) {
        fail(
          `${target.targetId} normalized page copies are not distinct files`,
        );
      }
      const primaryBytes = primaryLeaf.bytes;
      const replicaBytes = replicaLeaf.bytes;
      const expectedSize = normalized.sizeBytes;
      const expectedHash = normalized.sha256;
      if (
        typeof expectedSize !== "number" ||
        typeof expectedHash !== "string" ||
        primaryBytes.length !== expectedSize ||
        replicaBytes.length !== expectedSize ||
        sourceRegistrationApplyBareSha256(primaryBytes) !== expectedHash ||
        sourceRegistrationApplyBareSha256(replicaBytes) !== expectedHash ||
        !primaryBytes.equals(replicaBytes)
      ) {
        fail(`${target.targetId} normalized page ${index + 1} bytes drifted`);
      }
      const decoded = primaryBytes.toString("utf8");
      if (!Buffer.from(decoded, "utf8").equals(primaryBytes)) {
        fail(
          `${target.targetId} normalized page ${index + 1} is not valid UTF-8`,
        );
      }
      if (index > 0) {
        parts.push(
          Buffer.from(
            SOURCE_REGISTRATION_DOCUMENT_CONTENT_SERIALIZATION.delimiterUtf8,
            "utf8",
          ),
        );
      }
      parts.push(primaryBytes);
    }
    const bytes = Buffer.concat(parts);
    const text = bytes.toString("utf8");
    const binding = target.intendedDocumentRow.contentBinding;
    if (
      sourceRegistrationSha256(bytes) !== binding.sha256 ||
      bytes.length !== binding.sizeBytes ||
      Array.from(text).length !== binding.characterCount
    ) {
      fail(
        `${target.targetId} reconstructed Document.content differs from locked binding`,
      );
    }
    contents.set(target.intendedDocumentRow.id, text);
  }
  if (contents.size !== 10)
    fail("content reconstruction did not yield exactly 10 Documents");
  return contents;
}

const librarySelect = {
  id: true,
  sourceKind: true,
  sourceKey: true,
  documentId: true,
  sourceDocId: true,
  canonicalPath: true,
  title: true,
  status: true,
  usageRule: true,
  reviewStatus: true,
  citationReadiness: true,
  analysisTier: true,
  aiCard: true,
  aiSummary: true,
  keyFindings: true,
  claimCandidates: true,
  projectImplications: true,
  gaps: true,
  controlLinks: true,
  riskFlags: true,
  contentHash: true,
  wordCount: true,
  processedAt: true,
  reviewedAt: true,
  reviewer: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.LibraryAnalysisRecordSelect;

type DocumentRow = Record<string, SourceRegistrationJsonValue> & {
  id: string;
  slug: string;
  filePath: string | null;
  url: string | null;
};
type LibraryRow = Prisma.LibraryAnalysisRecordGetPayload<{
  select: typeof librarySelect;
}>;

function iso(value: Date | string | null): string | null {
  if (value === null) return null;
  return (value instanceof Date ? value : new Date(value)).toISOString();
}

function comparableDocument(row: DocumentRow): SourceRegistrationJsonValue {
  return {
    ...row,
    accessedAt: iso(row.accessedAt as string | null),
    createdAt: iso(row.createdAt as string),
    updatedAt: iso(row.updatedAt as string),
  } as unknown as SourceRegistrationJsonValue;
}

function comparableLibrary(row: LibraryRow): SourceRegistrationJsonValue {
  return {
    ...row,
    processedAt: iso(row.processedAt),
    reviewedAt: iso(row.reviewedAt),
    createdAt: iso(row.createdAt),
    updatedAt: iso(row.updatedAt),
    aiCard: row.aiCard as SourceRegistrationJsonValue,
    claimCandidates: row.claimCandidates as SourceRegistrationJsonValue,
    gaps: row.gaps as SourceRegistrationJsonValue,
    controlLinks: row.controlLinks as SourceRegistrationJsonValue,
  } as unknown as SourceRegistrationJsonValue;
}

function expectedDocument(
  target: SourceRegistrationPlan["targets"][number],
  contents: Map<string, string>,
  generatedSearchVectors: Map<string, string>,
): SourceRegistrationJsonValue {
  const {
    contentBinding: _binding,
    targetDataSha256: _targetHash,
    ...row
  } = target.intendedDocumentRow;
  const content = contents.get(row.id);
  if (content === undefined)
    fail(`${target.targetId} reconstructed content is missing`);
  const searchVector = generatedSearchVectors.get(row.id);
  if (searchVector === undefined) {
    fail(`${target.targetId} expected generated search vector is missing`);
  }
  return {
    ...row,
    content,
    embedding: null,
    search_vector: searchVector,
  } as unknown as SourceRegistrationJsonValue;
}

function expectedLibrary(
  target: SourceRegistrationPlan["targets"][number],
): SourceRegistrationJsonValue {
  const { targetDataSha256: _targetHash, ...row } =
    target.intendedLibraryAnalysisRow;
  return row as unknown as SourceRegistrationJsonValue;
}

type TargetStateObservation = {
  targetId: string;
  documentState: "absent" | "exact" | "conflict";
  libraryState: "absent" | "exact" | "conflict";
};

type DependencyRow = { relation: string; id: string };

const SOURCE_REGISTRATION_DOCUMENT_PHYSICAL_COLUMNS = [
  "id",
  "slug",
  "filePath",
  "title",
  "author",
  "year",
  "documentType",
  "category",
  "subcategory",
  "country",
  "content",
  "summary",
  "url",
  "wordCount",
  "tags",
  "metadata",
  "embedding",
  "createdAt",
  "updatedAt",
  "search_vector",
  "accessedAt",
  "archivedUrl",
] as const;

function validatedPhysicalDocumentRow(value: unknown): DocumentRow {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    fail("physical Document row is not a JSON object");
  }
  const row = value as Record<string, SourceRegistrationJsonValue>;
  const observedColumns = Object.keys(row).sort();
  const expectedColumns = [
    ...SOURCE_REGISTRATION_DOCUMENT_PHYSICAL_COLUMNS,
  ].sort();
  if (
    canonicalSourceRegistrationJson(observedColumns) !==
    canonicalSourceRegistrationJson(expectedColumns)
  ) {
    fail(
      "physical Document row does not contain the exact catalog-proven column set",
    );
  }
  if (
    typeof row.id !== "string" ||
    typeof row.slug !== "string" ||
    !(typeof row.filePath === "string" || row.filePath === null) ||
    !(typeof row.url === "string" || row.url === null)
  ) {
    fail("physical Document identity columns are invalid");
  }
  return row as DocumentRow;
}

async function expectedDocumentSearchVectors(input: {
  tx: Prisma.TransactionClient;
  plan: SourceRegistrationPlan;
  contents: Map<string, string>;
}): Promise<Map<string, string>> {
  const values = input.plan.targets.map((target) => ({
    id: target.intendedDocumentRow.id,
    title: target.intendedDocumentRow.title,
    summary: target.intendedDocumentRow.summary,
    tags: target.intendedDocumentRow.tags,
    content: input.contents.get(target.intendedDocumentRow.id),
  }));
  if (values.some((value) => value.content === undefined)) {
    fail(
      "expected generated search-vector input is missing reconstructed content",
    );
  }
  const rows = await input.tx.$queryRaw<
    Array<{ id: string; searchVector: string }>
  >(Prisma.sql`
    SELECT
      source_row.id,
      (
        pg_catalog.setweight(public.immutable_to_tsvector_no(source_row.title), 'A') ||
        pg_catalog.setweight(public.immutable_to_tsvector_no(source_row.summary), 'B') ||
        pg_catalog.setweight(public.immutable_to_tsvector_no(public.immutable_array_to_string(source_row.tags)), 'B') ||
        pg_catalog.setweight(public.immutable_to_tsvector_no(source_row.content), 'C')
      )::text AS "searchVector"
    FROM jsonb_to_recordset(${JSON.stringify(values)}::jsonb) AS source_row(
      id text,
      title text,
      summary text,
      tags text[],
      content text
    )
    ORDER BY source_row.id COLLATE "C"
  `);
  if (
    rows.length !== input.plan.targets.length ||
    new Set(rows.map((row) => row.id)).size !== rows.length ||
    rows.some((row) => typeof row.searchVector !== "string")
  ) {
    fail(
      "expected generated search-vector query returned an incomplete result",
    );
  }
  return new Map(rows.map((row) => [row.id, row.searchVector]));
}

const SOURCE_REGISTRATION_CATALOG_RELATIONS = [
  "ControlledMutationAudit",
  "DatabaseIdentity",
  "Document",
  "LibraryAnalysisRecord",
] as const;

const SOURCE_REGISTRATION_ALLOWED_TRIGGERS = [
  {
    relation: "ControlledMutationAudit",
    trigger: "ControlledMutationAudit_bind_database_role",
    function: "enforce_controlled_mutation_audit_database_role",
  },
  {
    relation: "ControlledMutationAudit",
    trigger: "ControlledMutationAudit_reject_truncate",
    function: "reject_controlled_mutation_history_change",
  },
  {
    relation: "ControlledMutationAudit",
    trigger: "ControlledMutationAudit_reject_update_delete",
    function: "reject_controlled_mutation_history_change",
  },
  {
    relation: "DatabaseIdentity",
    trigger: "DatabaseIdentity_reject_truncate",
    function: "reject_controlled_mutation_history_change",
  },
  {
    relation: "DatabaseIdentity",
    trigger: "DatabaseIdentity_reject_update_delete",
    function: "reject_controlled_mutation_history_change",
  },
  {
    relation: "Document",
    trigger: "Document_prevent_cited_identity_quarantine",
    function: "prevent_cited_document_quarantine",
  },
  {
    relation: "Document",
    trigger: "Document_prevent_field_citation_orphan",
    function: "prevent_field_citation_target_orphan",
  },
  {
    relation: "Document",
    trigger: "Document_prevent_field_citation_orphan_truncate",
    function: "prevent_field_citation_target_truncate",
  },
] as const;

const SOURCE_REGISTRATION_GENERATED_EXPRESSION_FUNCTIONS = [
  {
    relation: "Document",
    column: "search_vector",
    schema: "public",
    function: "immutable_array_to_string",
    identityArguments: "text[]",
  },
  {
    relation: "Document",
    column: "search_vector",
    schema: "public",
    function: "immutable_to_tsvector_no",
    identityArguments: "text",
  },
] as const;

export async function inspectSourceRegistrationDatabaseTarget(
  tx: Prisma.TransactionClient,
): Promise<SourceRegistrationDatabaseTarget> {
  const rows = await tx.$queryRaw<
    Array<{
      databaseName: string;
      systemIdentifier: string;
      serverAddressCidr: string;
      serverPort: number;
      serverVersionNum: number;
    }>
  >(Prisma.sql`
    SELECT
      current_database()::text AS "databaseName",
      (SELECT system_identifier::text FROM pg_control_system()) AS "systemIdentifier",
      (host(inet_server_addr()) || '/32')::text AS "serverAddressCidr",
      inet_server_port()::integer AS "serverPort",
      current_setting('server_version_num')::integer AS "serverVersionNum"
  `);
  if (rows.length !== 1) fail("database target query did not return one row");
  return sealSourceRegistrationDatabaseTarget({
    schemaVersion: SOURCE_REGISTRATION_APPLY_DATABASE_TARGET_SCHEMA_VERSION,
    ...rows[0]!,
  });
}

type CatalogRecord = Record<string, SourceRegistrationJsonValue>;

function catalogRecords(value: unknown, label: string): CatalogRecord[] {
  if (!Array.isArray(value)) fail(`${label} did not return an array`);
  return value as CatalogRecord[];
}

export async function inspectSourceRegistrationDatabaseCatalog(
  tx: Prisma.TransactionClient,
): Promise<SourceRegistrationDatabaseCatalogAttestation> {
  const relationNames = [...SOURCE_REGISTRATION_CATALOG_RELATIONS];
  const database = await tx.$queryRaw<CatalogRecord[]>(Prisma.sql`
    SELECT
      current_database()::text AS "databaseName",
      pg_get_userbyid(d.datdba)::text AS "databaseOwner",
      COALESCE(
        ARRAY(
          SELECT acl::text
          FROM unnest(d.datacl) AS acl
          ORDER BY acl::text COLLATE "C"
        ),
        ARRAY[]::text[]
      ) AS "databaseAcl",
      d.datallowconn AS "allowConnections",
      d.datconnlimit::integer AS "connectionLimit",
      d.datistemplate AS "isTemplate"
    FROM pg_database d
    WHERE d.datname = current_database()
  `);
  const relations = await tx.$queryRaw<CatalogRecord[]>(Prisma.sql`
    SELECT
      n.nspname::text AS "schemaName",
      c.relname::text AS "relationName",
      c.relkind::text AS "relationKind",
      c.relpersistence::text AS "persistence",
      pg_get_userbyid(c.relowner)::text AS "owner",
      COALESCE(
        ARRAY(
          SELECT acl::text
          FROM unnest(c.relacl) AS acl
          ORDER BY acl::text COLLATE "C"
        ),
        ARRAY[]::text[]
      ) AS "acl",
      c.relrowsecurity AS "rowSecurityEnabled",
      c.relforcerowsecurity AS "rowSecurityForced",
      c.relreplident::text AS "replicaIdentity"
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname IN (${Prisma.join(relationNames)})
    ORDER BY c.relname COLLATE "C"
  `);
  const columns = await tx.$queryRaw<CatalogRecord[]>(Prisma.sql`
    SELECT
      c.relname::text AS "relationName",
      a.attnum::integer AS "ordinal",
      a.attname::text AS "columnName",
      format_type(a.atttypid, a.atttypmod)::text AS "dataType",
      a.attnotnull AS "notNull",
      a.attidentity::text AS "identityKind",
      a.attgenerated::text AS "generatedKind",
      pg_get_expr(ad.adbin, ad.adrelid, true)::text AS "defaultExpression",
      CASE
        WHEN a.attcollation = 0 THEN NULL
        ELSE quote_ident(coll_ns.nspname) || '.' || quote_ident(coll.collname)
      END::text AS "collation",
      COALESCE(
        ARRAY(
          SELECT acl::text
          FROM unnest(a.attacl) AS acl
          ORDER BY acl::text COLLATE "C"
        ),
        ARRAY[]::text[]
      ) AS "acl"
    FROM pg_attribute a
    JOIN pg_class c ON c.oid = a.attrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    LEFT JOIN pg_attrdef ad ON ad.adrelid = a.attrelid AND ad.adnum = a.attnum
    LEFT JOIN pg_collation coll ON coll.oid = a.attcollation
    LEFT JOIN pg_namespace coll_ns ON coll_ns.oid = coll.collnamespace
    WHERE
      n.nspname = 'public'
      AND c.relname IN (${Prisma.join(relationNames)})
      AND a.attnum > 0
      AND NOT a.attisdropped
    ORDER BY c.relname COLLATE "C", a.attnum
  `);
  const triggers = await tx.$queryRaw<CatalogRecord[]>(Prisma.sql`
    SELECT
      c.relname::text AS "relationName",
      t.tgname::text AS "triggerName",
      t.tgenabled::text AS "enabled",
      pg_get_triggerdef(t.oid, true)::text AS "triggerDefinition",
      pn.nspname::text AS "functionSchema",
      p.proname::text AS "functionName",
      pg_get_functiondef(p.oid)::text AS "functionDefinition",
      pg_get_userbyid(p.proowner)::text AS "functionOwner",
      COALESCE(
        ARRAY(
          SELECT acl::text
          FROM unnest(p.proacl) AS acl
          ORDER BY acl::text COLLATE "C"
        ),
        ARRAY[]::text[]
      ) AS "functionAcl",
      l.lanname::text AS "functionLanguage",
      p.prosecdef AS "securityDefiner",
      p.proleakproof AS "leakproof",
      p.provolatile::text AS "volatility",
      p.proparallel::text AS "parallelSafety",
      COALESCE(
        ARRAY(
          SELECT setting::text
          FROM unnest(p.proconfig) AS setting
          ORDER BY setting::text COLLATE "C"
        ),
        ARRAY[]::text[]
      ) AS "functionConfig"
    FROM pg_trigger t
    JOIN pg_class c ON c.oid = t.tgrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    JOIN pg_proc p ON p.oid = t.tgfoid
    JOIN pg_namespace pn ON pn.oid = p.pronamespace
    JOIN pg_language l ON l.oid = p.prolang
    WHERE
      n.nspname = 'public'
      AND c.relname IN (${Prisma.join(relationNames)})
      AND NOT t.tgisinternal
    ORDER BY c.relname COLLATE "C", t.tgname COLLATE "C"
  `);
  const triggerFunctions = await tx.$queryRaw<CatalogRecord[]>(Prisma.sql`
    SELECT *
    FROM (
      SELECT DISTINCT
        pn.nspname::text AS "functionSchema",
        p.proname::text AS "functionName",
        pg_get_function_identity_arguments(p.oid)::text AS "identityArguments",
        pg_get_functiondef(p.oid)::text AS "definition",
        pg_get_userbyid(p.proowner)::text AS "owner",
        COALESCE(
          ARRAY(
            SELECT acl::text
            FROM unnest(p.proacl) AS acl
            ORDER BY acl::text COLLATE "C"
          ),
          ARRAY[]::text[]
        ) AS "acl",
        l.lanname::text AS "language",
        p.prosecdef AS "securityDefiner",
        p.proleakproof AS "leakproof",
        p.provolatile::text AS "volatility",
        p.proparallel::text AS "parallelSafety",
        COALESCE(
          ARRAY(
            SELECT setting::text
            FROM unnest(p.proconfig) AS setting
            ORDER BY setting::text COLLATE "C"
          ),
          ARRAY[]::text[]
        ) AS "config"
      FROM pg_trigger t
      JOIN pg_class c ON c.oid = t.tgrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      JOIN pg_proc p ON p.oid = t.tgfoid
      JOIN pg_namespace pn ON pn.oid = p.pronamespace
      JOIN pg_language l ON l.oid = p.prolang
      WHERE
        n.nspname = 'public'
        AND c.relname IN (${Prisma.join(relationNames)})
        AND NOT t.tgisinternal
    ) AS trigger_function
    ORDER BY "functionSchema" COLLATE "C", "functionName" COLLATE "C", "identityArguments" COLLATE "C"
  `);
  const generatedExpressionFunctions = await tx.$queryRaw<CatalogRecord[]>(
    Prisma.sql`
      SELECT *
      FROM (
        SELECT DISTINCT
          c.relname::text AS "relationName",
          a.attname::text AS "columnName",
          pn.nspname::text AS "functionSchema",
          p.proname::text AS "functionName",
          pg_get_function_identity_arguments(p.oid)::text AS "identityArguments",
          pg_get_functiondef(p.oid)::text AS "definition",
          pg_get_userbyid(p.proowner)::text AS "owner",
          COALESCE(
            ARRAY(
              SELECT acl::text
              FROM unnest(p.proacl) AS acl
              ORDER BY acl::text COLLATE "C"
            ),
            ARRAY[]::text[]
          ) AS "acl",
          l.lanname::text AS "language",
          p.prosecdef AS "securityDefiner",
          p.proleakproof AS "leakproof",
          p.provolatile::text AS "volatility",
          p.proparallel::text AS "parallelSafety",
          COALESCE(
            ARRAY(
              SELECT setting::text
              FROM unnest(p.proconfig) AS setting
              ORDER BY setting::text COLLATE "C"
            ),
            ARRAY[]::text[]
          ) AS "config"
        FROM pg_attribute a
        JOIN pg_class c ON c.oid = a.attrelid
        JOIN pg_namespace n ON n.oid = c.relnamespace
        JOIN pg_attrdef ad ON ad.adrelid = a.attrelid AND ad.adnum = a.attnum
        JOIN pg_depend dependency
          ON dependency.classid = 'pg_attrdef'::regclass
          AND dependency.objid = ad.oid
          AND dependency.refclassid = 'pg_proc'::regclass
        JOIN pg_proc p ON p.oid = dependency.refobjid
        JOIN pg_namespace pn ON pn.oid = p.pronamespace
        JOIN pg_language l ON l.oid = p.prolang
        WHERE
          n.nspname = 'public'
          AND c.relname IN (${Prisma.join(relationNames)})
          AND a.attgenerated <> ''
      ) AS generated_function
      ORDER BY
        "relationName" COLLATE "C",
        "columnName" COLLATE "C",
        "functionSchema" COLLATE "C",
        "functionName" COLLATE "C",
        "identityArguments" COLLATE "C"
    `,
  );
  const rules = await tx.$queryRaw<CatalogRecord[]>(Prisma.sql`
    SELECT
      c.relname::text AS "relationName",
      r.rulename::text AS "ruleName",
      r.ev_enabled::text AS "enabled",
      pg_get_ruledef(r.oid, true)::text AS "definition"
    FROM pg_rewrite r
    JOIN pg_class c ON c.oid = r.ev_class
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE
      n.nspname = 'public'
      AND c.relname IN (${Prisma.join(relationNames)})
      AND r.rulename <> '_RETURN'
    ORDER BY c.relname COLLATE "C", r.rulename COLLATE "C"
  `);
  const constraints = await tx.$queryRaw<CatalogRecord[]>(Prisma.sql`
    SELECT
      c.relname::text AS "relationName",
      con.conname::text AS "constraintName",
      con.contype::text AS "constraintType",
      con.condeferrable AS "deferrable",
      con.condeferred AS "initiallyDeferred",
      con.convalidated AS "validated",
      con.connoinherit AS "noInherit",
      pg_get_constraintdef(con.oid, true)::text AS "definition"
    FROM pg_constraint con
    JOIN pg_class c ON c.oid = con.conrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname IN (${Prisma.join(relationNames)})
    ORDER BY c.relname COLLATE "C", con.conname COLLATE "C"
  `);
  const indexes = await tx.$queryRaw<CatalogRecord[]>(Prisma.sql`
    SELECT
      c.relname::text AS "relationName",
      idx.relname::text AS "indexName",
      i.indisunique AS "unique",
      i.indisprimary AS "primary",
      i.indisvalid AS "valid",
      i.indisready AS "ready",
      i.indislive AS "live",
      i.indisreplident AS "replicaIdentity",
      i.indisclustered AS "clustered",
      pg_get_indexdef(i.indexrelid, 0, true)::text AS "definition"
    FROM pg_index i
    JOIN pg_class c ON c.oid = i.indrelid
    JOIN pg_class idx ON idx.oid = i.indexrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname IN (${Prisma.join(relationNames)})
    ORDER BY c.relname COLLATE "C", idx.relname COLLATE "C"
  `);
  const policies = await tx.$queryRaw<CatalogRecord[]>(Prisma.sql`
    SELECT
      c.relname::text AS "relationName",
      pol.polname::text AS "policyName",
      pol.polcmd::text AS "command",
      pol.polpermissive AS "permissive",
      COALESCE(
        ARRAY(
          SELECT pg_get_userbyid(role_oid)::text
          FROM unnest(pol.polroles) AS role_oid
          ORDER BY pg_get_userbyid(role_oid)::text COLLATE "C"
        ),
        ARRAY[]::text[]
      ) AS "roles",
      pg_get_expr(pol.polqual, pol.polrelid, true)::text AS "usingExpression",
      pg_get_expr(pol.polwithcheck, pol.polrelid, true)::text AS "checkExpression"
    FROM pg_policy pol
    JOIN pg_class c ON c.oid = pol.polrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relname IN (${Prisma.join(relationNames)})
    ORDER BY c.relname COLLATE "C", pol.polname COLLATE "C"
  `);
  const extensions = await tx.$queryRaw<CatalogRecord[]>(Prisma.sql`
    SELECT
      e.extname::text AS "extensionName",
      e.extversion::text AS "version",
      n.nspname::text AS "schemaName",
      pg_get_userbyid(e.extowner)::text AS "owner",
      e.extrelocatable AS "relocatable"
    FROM pg_extension e
    JOIN pg_namespace n ON n.oid = e.extnamespace
    ORDER BY e.extname COLLATE "C"
  `);
  const roles = await tx.$queryRaw<CatalogRecord[]>(Prisma.sql`
    WITH relevant_roles AS (
      SELECT d.datdba AS role_oid
      FROM pg_database d
      WHERE d.datname = current_database()
      UNION
      SELECT c.relowner
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relname IN (${Prisma.join(relationNames)})
      UNION
      SELECT p.proowner
      FROM pg_trigger t
      JOIN pg_class c ON c.oid = t.tgrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      JOIN pg_proc p ON p.oid = t.tgfoid
      WHERE n.nspname = 'public' AND c.relname IN (${Prisma.join(relationNames)}) AND NOT t.tgisinternal
      UNION
      SELECT p.proowner
      FROM pg_attribute a
      JOIN pg_class c ON c.oid = a.attrelid
      JOIN pg_namespace n ON n.oid = c.relnamespace
      JOIN pg_attrdef ad ON ad.adrelid = a.attrelid AND ad.adnum = a.attnum
      JOIN pg_depend dependency
        ON dependency.classid = 'pg_attrdef'::regclass
        AND dependency.objid = ad.oid
        AND dependency.refclassid = 'pg_proc'::regclass
      JOIN pg_proc p ON p.oid = dependency.refobjid
      WHERE
        n.nspname = 'public'
        AND c.relname IN (${Prisma.join(relationNames)})
        AND a.attgenerated <> ''
      UNION
      SELECT e.extowner FROM pg_extension e
    )
    SELECT
      r.rolname::text AS "roleName",
      r.rolsuper AS "superuser",
      r.rolinherit AS "inherit",
      r.rolcreaterole AS "createRole",
      r.rolcreatedb AS "createDatabase",
      r.rolcanlogin AS "canLogin",
      r.rolreplication AS "replication",
      r.rolbypassrls AS "bypassRls",
      r.rolconnlimit::integer AS "connectionLimit",
      COALESCE(
        ARRAY(
          SELECT setting::text
          FROM unnest(r.rolconfig) AS setting
          ORDER BY setting::text COLLATE "C"
        ),
        ARRAY[]::text[]
      ) AS "config"
    FROM pg_roles r
    JOIN relevant_roles rr ON rr.role_oid = r.oid
    ORDER BY r.rolname COLLATE "C"
  `);

  if (database.length !== 1 || relations.length !== relationNames.length) {
    fail("reviewed database catalog relation scope is incomplete");
  }
  const observedTriggers = triggers.map((trigger) => ({
    relation: String(trigger.relationName),
    trigger: String(trigger.triggerName),
    function: String(trigger.functionName),
  }));
  const expectedTriggers = SOURCE_REGISTRATION_ALLOWED_TRIGGERS.map(
    (trigger) => ({ ...trigger }),
  );
  const observedGeneratedExpressionFunctions = generatedExpressionFunctions.map(
    (functionRow) => ({
      relation: String(functionRow.relationName),
      column: String(functionRow.columnName),
      schema: String(functionRow.functionSchema),
      function: String(functionRow.functionName),
      identityArguments: String(functionRow.identityArguments),
    }),
  );
  const expectedGeneratedExpressionFunctions =
    SOURCE_REGISTRATION_GENERATED_EXPRESSION_FUNCTIONS.map((functionRow) => ({
      ...functionRow,
    }));
  if (
    canonicalSourceRegistrationJson(
      observedGeneratedExpressionFunctions as unknown as SourceRegistrationJsonValue,
    ) !==
    canonicalSourceRegistrationJson(
      expectedGeneratedExpressionFunctions as unknown as SourceRegistrationJsonValue,
    )
  ) {
    fail(
      "generated Document expression functions differ from the exact reviewed set",
    );
  }
  const observedDocumentColumns = columns
    .filter((column) => column.relationName === "Document")
    .map((column) => String(column.columnName));
  if (
    canonicalSourceRegistrationJson(observedDocumentColumns) !==
    canonicalSourceRegistrationJson([
      ...SOURCE_REGISTRATION_DOCUMENT_PHYSICAL_COLUMNS,
    ])
  ) {
    fail("Document physical columns differ from the exact reviewed column set");
  }
  let unexpectedWriteSurfaceCount = rules.length + policies.length;
  if (
    canonicalSourceRegistrationJson(
      observedTriggers as unknown as SourceRegistrationJsonValue,
    ) !==
    canonicalSourceRegistrationJson(
      expectedTriggers as unknown as SourceRegistrationJsonValue,
    )
  ) {
    unexpectedWriteSurfaceCount += 1;
  }
  if (triggers.some((trigger) => trigger.enabled !== "O")) {
    unexpectedWriteSurfaceCount += 1;
  }
  if (unexpectedWriteSurfaceCount !== 0) {
    fail(
      "database catalog has an unexpected trigger, rule, policy or disabled trigger",
    );
  }
  const catalogSnapshot = {
    schemaVersion: SOURCE_REGISTRATION_APPLY_DATABASE_CATALOG_SCHEMA_VERSION,
    scope: SOURCE_REGISTRATION_APPLY_DATABASE_CATALOG_SCOPE,
    database: database[0]!,
    relations: catalogRecords(relations, "catalog relations"),
    columns: catalogRecords(columns, "catalog columns"),
    triggers: catalogRecords(triggers, "catalog triggers"),
    triggerFunctions: catalogRecords(
      triggerFunctions,
      "catalog trigger functions",
    ),
    generatedExpressionFunctions: catalogRecords(
      generatedExpressionFunctions,
      "catalog generated-expression functions",
    ),
    rules: catalogRecords(rules, "catalog rules"),
    constraints: catalogRecords(constraints, "catalog constraints"),
    indexes: catalogRecords(indexes, "catalog indexes"),
    policies: catalogRecords(policies, "catalog policies"),
    extensions: catalogRecords(extensions, "catalog extensions"),
    roles: catalogRecords(roles, "catalog roles"),
  } as unknown as SourceRegistrationJsonValue;
  return sealSourceRegistrationDatabaseCatalogAttestation({
    catalogSnapshot,
    relationCount: relations.length,
    nonInternalTriggerCount: triggers.length,
    generatedExpressionFunctionCount: generatedExpressionFunctions.length,
    unexpectedWriteSurfaceCount,
  });
}

export type SourceRegistrationApplyDatabaseState = {
  databaseTarget: SourceRegistrationDatabaseTarget;
  databaseCatalog: SourceRegistrationDatabaseCatalogAttestation;
  transaction: {
    isolationLevel: string;
    readOnly: boolean;
    databaseRole: string;
    serverVersion: string;
    canInsertDocument: boolean;
    canInsertLibraryAnalysisRecord: boolean;
    canInsertControlledMutationAudit: boolean;
  };
  databaseIdentityUuid: string;
  completedMigrationCount: number;
  planStyleMigrationLedgerSha256: string;
  backupStyleMigrationLedgerSha256: string;
  coreCounts: SourceRegistrationBackupCoreCounts;
  targetFingerprintSha256: string;
  targetStates: TargetStateObservation[];
  documentRows: DocumentRow[];
  libraryRows: LibraryRow[];
  dependencyRows: DependencyRow[];
  dependencyRowsSha256: string;
  audits: SourceRegistrationControlledMutationAudit[];
};

function canonicalBareHash(value: unknown): string {
  return sourceRegistrationApplyBareSha256(
    canonicalSourceRegistrationJson(
      value as unknown as SourceRegistrationJsonValue,
    ),
  );
}

export function sourceRegistrationPhysicalDocumentRowsSha256(
  rows: SourceRegistrationJsonValue[],
): string {
  return canonicalBareHash(rows);
}

function arrayState<T>(
  rows: T[],
  exact: (row: T) => boolean,
): "absent" | "exact" | "conflict" {
  if (rows.length === 0) return "absent";
  return rows.length === 1 && exact(rows[0]!) ? "exact" : "conflict";
}

async function inspectDependencies(
  tx: Prisma.TransactionClient,
  documentIds: string[],
  semanticTargetIds: string[],
): Promise<DependencyRow[]> {
  const documentRefs = await tx.documentRef.findMany({
    where: {
      OR: [{ fromId: { in: documentIds } }, { toId: { in: documentIds } }],
    },
    select: { id: true },
    orderBy: { id: "asc" },
  });
  const reports = await tx.report.findMany({
    where: { documentId: { in: documentIds } },
    select: { id: true },
    orderBy: { id: "asc" },
  });
  const theses = await tx.thesis.findMany({
    where: { documentId: { in: documentIds } },
    select: { id: true },
    orderBy: { id: "asc" },
  });
  const sourceDocs = await tx.sourceDoc.findMany({
    where: { documentId: { in: documentIds } },
    select: { id: true },
    orderBy: { id: "asc" },
  });
  const insightRefs = await tx.insightDocumentRef.findMany({
    where: { documentId: { in: documentIds } },
    select: { id: true },
    orderBy: { id: "asc" },
  });
  const companyRefs = await tx.companyDocumentRef.findMany({
    where: { documentId: { in: documentIds } },
    select: { id: true },
    orderBy: { id: "asc" },
  });
  const actorRefs = await tx.actorDocumentRef.findMany({
    where: { documentId: { in: documentIds } },
    select: { id: true },
    orderBy: { id: "asc" },
  });
  const citations = await tx.sourceCitation.findMany({
    where: { documentId: { in: documentIds } },
    select: { id: true },
    orderBy: { id: "asc" },
  });
  const citationIds = citations.map((row) => row.id);
  const fieldCitations = await tx.fieldCitation.findMany({
    where: {
      OR: [
        { entityId: { in: semanticTargetIds } },
        ...(citationIds.length > 0
          ? [{ citationId: { in: citationIds } }]
          : []),
      ],
    },
    select: { id: true },
    orderBy: { id: "asc" },
  });
  const sourceDocIds = sourceDocs.map((row) => row.id);
  const evidenceAppraisals = await tx.evidenceAppraisal.findMany({
    where: {
      OR: [
        ...(reports.length > 0
          ? [{ reportId: { in: reports.map((row) => row.id) } }]
          : []),
        ...(theses.length > 0
          ? [{ thesisId: { in: theses.map((row) => row.id) } }]
          : []),
        ...(sourceDocIds.length > 0
          ? [{ sourceDocId: { in: sourceDocIds } }]
          : []),
        ...(citationIds.length > 0
          ? [{ reviewBasisCitationId: { in: citationIds } }]
          : []),
      ],
    },
    select: { id: true },
    orderBy: { id: "asc" },
  });
  const sourceRefs = sourceDocIds.length
    ? await tx.sourceRef.findMany({
        where: { sourceDocId: { in: sourceDocIds } },
        select: { id: true },
        orderBy: { id: "asc" },
      })
    : [];
  const mediaEntries = sourceDocIds.length
    ? await tx.mediaEntry.findMany({
        where: { sourceDocId: { in: sourceDocIds } },
        select: { id: true },
        orderBy: { id: "asc" },
      })
    : [];
  const insightSourceRows = sourceDocIds.length
    ? await tx.$queryRaw<Array<{ id: string }>>(Prisma.sql`
        SELECT ("A"::text || ':' || "B"::text) AS id
        FROM "_InsightSourceDoc"
        WHERE "B" IN (${Prisma.join(sourceDocIds)})
        ORDER BY "A", "B"
      `)
    : [];
  const primaryCitationInsights = citationIds.length
    ? await tx.insight.findMany({
        where: { primaryCitationId: { in: citationIds } },
        select: { id: true },
        orderBy: { id: "asc" },
      })
    : [];
  const primaryCitationProducers = citationIds.length
    ? await tx.producer.findMany({
        where: { primaryCitationId: { in: citationIds } },
        select: { id: true },
        orderBy: { id: "asc" },
      })
    : [];
  const groups: Array<[string, Array<{ id: string }>]> = [
    ["DocumentRef", documentRefs],
    ["Report", reports],
    ["Thesis", theses],
    ["SourceDoc", sourceDocs],
    ["InsightDocumentRef", insightRefs],
    ["CompanyDocumentRef", companyRefs],
    ["ActorDocumentRef", actorRefs],
    ["SourceCitation", citations],
    ["FieldCitation", fieldCitations],
    ["EvidenceAppraisal", evidenceAppraisals],
    ["SourceRef", sourceRefs],
    ["MediaEntry", mediaEntries],
    ["_InsightSourceDoc", insightSourceRows],
    ["Insight.primaryCitation", primaryCitationInsights],
    ["Producer.primaryCitation", primaryCitationProducers],
  ];
  return groups
    .flatMap(([relation, rows]) =>
      rows.map((row) => ({ relation, id: row.id })),
    )
    .sort((left, right) =>
      `${left.relation}:${left.id}`.localeCompare(
        `${right.relation}:${right.id}`,
      ),
    );
}

export type SourceRegistrationTargetSetInspection = {
  targetStates: TargetStateObservation[];
  documentRows: DocumentRow[];
  libraryRows: LibraryRow[];
  dependencyRows: DependencyRow[];
  dependencyRowsSha256: string;
};

async function inspectSourceRegistrationTargetSetImplementation(input: {
  tx: Prisma.TransactionClient;
  plan: SourceRegistrationPlan;
  contents: Map<string, string>;
}): Promise<SourceRegistrationTargetSetInspection> {
  const documentIds = input.plan.targets.map(
    (target) => target.intendedDocumentRow.id,
  );
  const slugs = input.plan.targets.map(
    (target) => target.intendedDocumentRow.slug,
  );
  const paths = input.plan.targets.map(
    (target) => target.intendedDocumentRow.filePath,
  );
  const urls = input.plan.targets.map(
    (target) => target.intendedDocumentRow.url,
  );
  const libraryIds = input.plan.targets.map(
    (target) => target.intendedLibraryAnalysisRow.id,
  );
  const sourceKeys = input.plan.targets.map(
    (target) => target.intendedLibraryAnalysisRow.sourceKey,
  );
  const contentHashes = input.plan.targets.map(
    (target) => target.intendedLibraryAnalysisRow.contentHash,
  );
  const generatedSearchVectors = await expectedDocumentSearchVectors({
    tx: input.tx,
    plan: input.plan,
    contents: input.contents,
  });
  const rawDocumentRows = await input.tx.$queryRaw<
    Array<{ physicalRow: SourceRegistrationJsonValue }>
  >(Prisma.sql`
    SELECT to_jsonb(document_row) AS "physicalRow"
    FROM public."Document" AS document_row
    WHERE
      document_row.id IN (${Prisma.join(documentIds)})
      OR document_row.slug IN (${Prisma.join(slugs)})
      OR document_row."filePath" IN (${Prisma.join(paths)})
      OR document_row.url IN (${Prisma.join(urls)})
    ORDER BY document_row.id COLLATE "C"
  `);
  const documentRows = rawDocumentRows.map((row) =>
    validatedPhysicalDocumentRow(row.physicalRow),
  );
  const libraryRows = await input.tx.libraryAnalysisRecord.findMany({
    where: {
      OR: [
        { id: { in: libraryIds } },
        { sourceKey: { in: sourceKeys } },
        { documentId: { in: documentIds } },
        { canonicalPath: { in: paths } },
        { contentHash: { in: contentHashes } },
      ],
    },
    select: librarySelect,
    orderBy: { id: "asc" },
  });
  const targetStates = input.plan.targets.map(
    (target): TargetStateObservation => {
      const documents = documentRows.filter(
        (row) =>
          row.id === target.intendedDocumentRow.id ||
          row.slug === target.intendedDocumentRow.slug ||
          row.filePath === target.intendedDocumentRow.filePath ||
          row.url === target.intendedDocumentRow.url,
      );
      const libraries = libraryRows.filter(
        (row) =>
          row.id === target.intendedLibraryAnalysisRow.id ||
          row.sourceKey === target.intendedLibraryAnalysisRow.sourceKey ||
          row.documentId === target.intendedLibraryAnalysisRow.documentId ||
          row.canonicalPath ===
            target.intendedLibraryAnalysisRow.canonicalPath ||
          row.contentHash === target.intendedLibraryAnalysisRow.contentHash,
      );
      return {
        targetId: target.targetId,
        documentState: arrayState(
          documents,
          (row) =>
            canonicalSourceRegistrationJson(comparableDocument(row)) ===
            canonicalSourceRegistrationJson(
              expectedDocument(target, input.contents, generatedSearchVectors),
            ),
        ),
        libraryState: arrayState(
          libraries,
          (row) =>
            canonicalSourceRegistrationJson(comparableLibrary(row)) ===
            canonicalSourceRegistrationJson(expectedLibrary(target)),
        ),
      };
    },
  );
  const dependencyRows = await inspectDependencies(input.tx, documentIds, [
    ...documentIds,
    ...libraryIds,
    ...sourceKeys,
  ]);
  return {
    targetStates,
    documentRows,
    libraryRows,
    dependencyRows,
    dependencyRowsSha256: canonicalBareHash(dependencyRows),
  };
}

export async function inspectSourceRegistrationTargetSet(input: {
  tx: Prisma.TransactionClient;
  plan: SourceRegistrationPlan;
  contents: Map<string, string>;
}): Promise<SourceRegistrationTargetSetInspection> {
  return inspectSourceRegistrationTargetSetImplementation(input);
}

export async function inspectSourceRegistrationApplyDatabaseState(input: {
  tx: Prisma.TransactionClient;
  plan: SourceRegistrationPlan;
  contents: Map<string, string>;
  operationKey: string;
}): Promise<SourceRegistrationApplyDatabaseState> {
  const databaseTarget = await inspectSourceRegistrationDatabaseTarget(
    input.tx,
  );
  const databaseCatalog = await inspectSourceRegistrationDatabaseCatalog(
    input.tx,
  );
  const controlRows = await input.tx.$queryRaw<
    Array<{
      isolationLevel: string;
      readOnly: string;
      databaseRole: string;
      serverVersion: string;
      canInsertDocument: boolean;
      canInsertLibraryAnalysisRecord: boolean;
      canInsertControlledMutationAudit: boolean;
    }>
  >(Prisma.sql`
    SELECT
      current_setting('transaction_isolation') AS "isolationLevel",
      current_setting('transaction_read_only') AS "readOnly",
      current_user::text AS "databaseRole",
      current_setting('server_version') AS "serverVersion",
      has_table_privilege(current_user, 'public."Document"', 'INSERT') AS "canInsertDocument",
      has_table_privilege(current_user, 'public."LibraryAnalysisRecord"', 'INSERT') AS "canInsertLibraryAnalysisRecord",
      has_table_privilege(current_user, 'public."ControlledMutationAudit"', 'INSERT') AS "canInsertControlledMutationAudit"
  `);
  const control = controlRows[0];
  if (!control) fail("database transaction control query returned no row");
  const identities = await input.tx.databaseIdentity.findMany({
    select: { key: true, identityUuid: true },
    orderBy: { key: "asc" },
  });
  if (
    identities.length !== 1 ||
    identities[0]!.key !== "primary" ||
    !UUID_PATTERN.test(identities[0]!.identityUuid)
  ) {
    fail("database must contain exactly one primary DatabaseIdentity");
  }
  const databaseIdentityUuid = identities[0]!.identityUuid.toLowerCase();
  const migrations = await input.tx.$queryRaw<
    Array<{
      id: string;
      checksum: string;
      finishedAt: Date;
      migrationName: string;
      logs: string | null;
      startedAt: Date;
      appliedStepsCount: number;
    }>
  >(Prisma.sql`
    SELECT
      id,
      checksum,
      finished_at AS "finishedAt",
      migration_name AS "migrationName",
      logs,
      started_at AS "startedAt",
      applied_steps_count AS "appliedStepsCount"
    FROM "_prisma_migrations"
    WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL
    ORDER BY migration_name, id
  `);
  if (migrations.length === 0)
    fail("completed Prisma migration ledger is empty");
  // The metadata-v2 backup contract formats the timestamp-without-time-zone
  // columns inside PostgreSQL. Do not round-trip these values through the
  // operator machine's local timezone before hashing them.
  const backupLedgerRows = await input.tx.$queryRaw<
    Array<{ ledger: SourceRegistrationJsonValue[] }>
  >(Prisma.sql`
    WITH completed_migrations AS (
      SELECT
        id,
        checksum,
        to_char(finished_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS "finishedAt",
        migration_name AS "migrationName",
        logs,
        NULL::text AS "rolledBackAt",
        to_char(started_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') AS "startedAt",
        applied_steps_count AS "appliedStepsCount"
      FROM "_prisma_migrations"
      WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL
      ORDER BY migration_name, id
    )
    SELECT jsonb_agg(
      to_jsonb(completed_migrations) ORDER BY "migrationName", id
    ) AS ledger
    FROM completed_migrations
  `);
  const backupLedger = backupLedgerRows[0]?.ledger;
  if (
    !Array.isArray(backupLedger) ||
    backupLedger.length !== migrations.length
  ) {
    fail("backup-style completed migration ledger query is inconsistent");
  }
  const planLedger = migrations
    .map((row) => ({
      migrationName: row.migrationName,
      checksum: row.checksum,
      finishedAt: iso(row.finishedAt),
      appliedStepsCount: row.appliedStepsCount,
    }))
    .sort((left, right) =>
      `${left.migrationName}:${left.finishedAt}`.localeCompare(
        `${right.migrationName}:${right.finishedAt}`,
      ),
    );
  const planStyleMigrationLedgerSha256 = bareHash(
    hashSourceRegistrationJson(
      "food-systems-2026:source-registration-db-field:v1\0",
      planLedger,
    ),
    "plan-style migration ledger",
  );
  const backupStyleMigrationLedgerSha256 = canonicalBareHash(backupLedger);

  const countPairs: Array<[keyof SourceRegistrationBackupCoreCounts, number]> =
    [
      [
        "ControlledMutationAudit",
        await input.tx.controlledMutationAudit.count(),
      ],
      ["DatabaseIdentity", identities.length],
      ["Document", await input.tx.document.count()],
      ["EvidenceAppraisal", await input.tx.evidenceAppraisal.count()],
      ["FieldCitation", await input.tx.fieldCitation.count()],
      ["LibraryAnalysisRecord", await input.tx.libraryAnalysisRecord.count()],
      ["Report", await input.tx.report.count()],
      ["SourceCitation", await input.tx.sourceCitation.count()],
      ["SourceDoc", await input.tx.sourceDoc.count()],
      ["Thesis", await input.tx.thesis.count()],
    ];
  const coreCounts = Object.fromEntries(
    countPairs,
  ) as SourceRegistrationBackupCoreCounts;
  const targetFingerprintSha256 = sourceRegistrationDatabaseFingerprintSha256({
    completedPrismaMigrationLedger: {
      completedCount: migrations.length,
      sha256: backupStyleMigrationLedgerSha256,
    },
    coreCounts,
    databaseIdentity: { key: "primary", uuid: databaseIdentityUuid },
  });

  const targetSet = await inspectSourceRegistrationTargetSet({
    tx: input.tx,
    plan: input.plan,
    contents: input.contents,
  });
  const rawAudits = await input.tx.controlledMutationAudit.findMany({
    where: {
      OR: [
        { operationKey: input.operationKey },
        { contractScope: SOURCE_REGISTRATION_APPLY_CONTRACT_SCOPE },
        { planSha256: SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_SHA256 },
      ],
    },
    orderBy: [{ recordedAt: "asc" }, { id: "asc" }],
  });
  const audits = rawAudits.map((audit) =>
    SourceRegistrationControlledMutationAuditSchema.parse({
      ...audit,
      databaseIdentityUuid: audit.databaseIdentityUuid.toLowerCase(),
      mutationSummary: audit.mutationSummary,
      recordedAt: audit.recordedAt.toISOString(),
    }),
  );
  return {
    databaseTarget,
    databaseCatalog,
    transaction: {
      isolationLevel: control.isolationLevel,
      readOnly: control.readOnly === "on",
      databaseRole: control.databaseRole,
      serverVersion: control.serverVersion,
      canInsertDocument: control.canInsertDocument,
      canInsertLibraryAnalysisRecord: control.canInsertLibraryAnalysisRecord,
      canInsertControlledMutationAudit:
        control.canInsertControlledMutationAudit,
    },
    databaseIdentityUuid,
    completedMigrationCount: migrations.length,
    planStyleMigrationLedgerSha256,
    backupStyleMigrationLedgerSha256,
    coreCounts,
    targetFingerprintSha256,
    targetStates: targetSet.targetStates,
    documentRows: targetSet.documentRows,
    libraryRows: targetSet.libraryRows,
    dependencyRows: targetSet.dependencyRows,
    dependencyRowsSha256: targetSet.dependencyRowsSha256,
    audits,
  };
}

function assertLockedIdentityAndLedger(
  state: SourceRegistrationApplyDatabaseState,
  plan: SourceRegistrationPlan,
): void {
  if (
    state.databaseIdentityUuid !==
      SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_IDENTITY_UUID ||
    state.completedMigrationCount !==
      plan.beforeSnapshot.completedMigrationLedger.count ||
    state.planStyleMigrationLedgerSha256 !==
      bareHash(
        plan.beforeSnapshot.completedMigrationLedger.sha256,
        "locked plan migration ledger",
      )
  ) {
    fail(
      "live database identity or completed migration ledger drifted from locked plan",
    );
  }
}

function assertExactPendingState(
  state: SourceRegistrationApplyDatabaseState,
  plan: SourceRegistrationPlan,
): void {
  assertLockedIdentityAndLedger(state, plan);
  if (
    state.coreCounts.Document !== plan.beforeSnapshot.coreCounts.documents ||
    state.coreCounts.LibraryAnalysisRecord !==
      plan.beforeSnapshot.coreCounts.libraryAnalysisRecords ||
    state.coreCounts.ControlledMutationAudit !==
      plan.beforeSnapshot.coreCounts.controlledMutationAudits ||
    state.targetStates.some(
      (target) =>
        target.documentState !== "absent" || target.libraryState !== "absent",
    ) ||
    state.documentRows.length !== 0 ||
    state.libraryRows.length !== 0 ||
    state.dependencyRows.length !== 0 ||
    state.audits.length !== 0
  ) {
    fail("exact locked before-state CAS failed; zero rows may be mutated");
  }
}

function assertReleaseEvidenceMatchesPendingDatabase(
  evidence: SourceRegistrationReleaseEvidence,
  state: SourceRegistrationApplyDatabaseState,
  plan: SourceRegistrationPlan,
): void {
  validateReleaseEvidenceAgainstLockedPlan(evidence, plan);
  assertLockedIdentityAndLedger(state, plan);
  if (
    evidence.sourceDatabaseName !== state.databaseTarget.databaseName ||
    evidence.databaseIdentityUuid.toLowerCase() !==
      state.databaseIdentityUuid ||
    evidence.completedMigrationCount !== state.completedMigrationCount ||
    evidence.completedMigrationLedgerSha256 !==
      state.backupStyleMigrationLedgerSha256 ||
    evidence.targetFingerprintSha256 !== state.targetFingerprintSha256
  ) {
    fail(
      "live pre-plan identity, ledger, or fingerprint differs from backup/restore evidence",
    );
  }
  assertCanonicalEqual(
    evidence.coreCounts,
    state.coreCounts,
    "backup core counts",
  );
}

function assertWriterControl(
  state: SourceRegistrationApplyDatabaseState,
  authorization: SourceRegistrationApplyAuthorization,
): void {
  if (state.transaction.isolationLevel.toLowerCase() !== "serializable") {
    fail("apply transaction did not prove Serializable isolation");
  }
  if (state.transaction.readOnly)
    fail("apply transaction is unexpectedly read-only");
  if (state.transaction.databaseRole !== authorization.databaseRole) {
    fail("current_user differs from exact authorized database role");
  }
  if (
    !state.transaction.canInsertDocument ||
    !state.transaction.canInsertLibraryAnalysisRecord ||
    !state.transaction.canInsertControlledMutationAudit
  ) {
    fail("database role lacks an exact required INSERT privilege");
  }
}

function currentAfterSnapshot(input: {
  stateBeforeAuditAppend: SourceRegistrationApplyDatabaseState;
  plan: SourceRegistrationPlan;
  releaseEvidence: SourceRegistrationReleaseEvidence;
}) {
  const state = input.stateBeforeAuditAppend;
  if (
    state.targetStates.some(
      (target) =>
        target.documentState !== "exact" || target.libraryState !== "exact",
    ) ||
    state.documentRows.length !== 10 ||
    state.libraryRows.length !== 10 ||
    state.dependencyRows.length !== 0 ||
    state.audits.length !== 0
  ) {
    fail(
      "post-create target state is not exactly 10 Document + 10 LibraryAnalysisRecord",
    );
  }
  const expectedCounts = expectedPostApplyCounts(input.plan);
  if (
    state.coreCounts.Document !== expectedCounts.documents ||
    state.coreCounts.LibraryAnalysisRecord !==
      expectedCounts.libraryAnalysisRecords ||
    state.coreCounts.ControlledMutationAudit !==
      expectedCounts.controlledMutationAuditsBeforeAppend
  ) {
    fail("post-create database counts differ before audit append");
  }
  return sealSourceRegistrationAfterSnapshot({
    databaseIdentityUuid: state.databaseIdentityUuid,
    completedMigrationCount: state.completedMigrationCount,
    planStyleMigrationLedgerSha256: state.planStyleMigrationLedgerSha256,
    backupStyleMigrationLedgerSha256: state.backupStyleMigrationLedgerSha256,
    preApplyTargetFingerprintSha256:
      input.releaseEvidence.targetFingerprintSha256,
    afterApplyTargetFingerprintSha256:
      sourceRegistrationDatabaseFingerprintSha256({
        completedPrismaMigrationLedger: {
          completedCount: state.completedMigrationCount,
          sha256: state.backupStyleMigrationLedgerSha256,
        },
        coreCounts: {
          ...state.coreCounts,
          ControlledMutationAudit:
            expectedCounts.controlledMutationAuditsAfterAppend,
        },
        databaseIdentity: {
          key: "primary",
          uuid: state.databaseIdentityUuid,
        },
      }),
    targetSetSha256: sourceRegistrationApplyTargetSetSha256(input.plan),
    documentRowsSha256: sourceRegistrationPhysicalDocumentRowsSha256(
      state.documentRows.map((row) => comparableDocument(row)),
    ),
    libraryAnalysisRowsSha256: canonicalBareHash(
      state.libraryRows.map((row) => comparableLibrary(row)),
    ),
    dependencyRowsSha256: state.dependencyRowsSha256,
    dependencyRowCount: 0,
    counts: expectedCounts,
  });
}

export async function verifyLiveDatabaseContentAgainstSignedRestore(input: {
  databaseUrl: string;
  databaseRole: string;
  releaseAuthorization: SourceRegistrationReleaseAuthorization;
  runtimeAttestation: SourceRegistrationRuntimeAttestation;
}) {
  const digest = await computeDatabaseLogicalStateDigest({
    databaseUrl: input.databaseUrl,
  });
  const target = digest.databaseTarget;
  if (
    digest.contentStateSha256 !==
      input.releaseAuthorization.contentStateSha256 ||
    digest.tool.psqlFileSha256 !==
      input.runtimeAttestation.psql.binaryFileSha256 ||
    target.databaseName !==
      SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_TARGET.databaseName ||
    target.systemIdentifier !==
      SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_TARGET.systemIdentifier ||
    target.serverAddress !== "127.0.0.1" ||
    target.serverPort !==
      SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_TARGET.serverPort ||
    Number(target.serverVersionNum) !==
      SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_TARGET.serverVersionNum ||
    target.databaseRole !== input.databaseRole ||
    target.largeObjectCount !== 0
  ) {
    fail(
      "live all-public database content or target differs from the signed restored digest",
    );
  }
  if (
    !Array.isArray(digest.relations) ||
    digest.relations.length !== digest.relationCount ||
    !digest.sequences ||
    !Number.isSafeInteger(digest.sequences.rowCount)
  ) {
    fail("live logical-state digest returned an invalid relation inventory");
  }
  const totalRowCount = digest.relations.reduce((sum, relation) => {
    if (!Number.isSafeInteger(relation.rowCount) || relation.rowCount < 0) {
      fail("live logical-state digest returned an invalid row count");
    }
    return sum + relation.rowCount;
  }, 0);
  return {
    contentStateSha256: digest.contentStateSha256,
    logicalStateSha256: digest.logicalStateSha256,
    relationCount: digest.relationCount,
    totalRowCount,
    sequenceRowCount: digest.sequences.rowCount,
    allPublicDataRelationsLocked: true as const,
    signedRestoreDigestMatched: true as const,
    checkedImmediatelyBeforeMutation: true as const,
  };
}

function receiptedNoopSummary(input: {
  state: SourceRegistrationApplyDatabaseState;
  plan: SourceRegistrationPlan;
  codeBindings: SourceRegistrationApplyCodeBindings;
  operationKey: string;
  currentReplayBindings?: SourceRegistrationCurrentReplayBindings;
}): SourceRegistrationApplyMutationSummary {
  const classification = classifySourceRegistrationExistingState({
    targets: input.state.targetStates,
    dependencyRowCount: input.state.dependencyRows.length,
    audits: input.state.audits,
  });
  if (classification.state !== "receipted_noop") {
    const codes =
      classification.state === "conflict"
        ? classification.codes.join(",")
        : classification.state;
    fail(`state is not an exact receipted no-op: ${codes}`);
  }
  const audit = classification.audit;
  const summary = validateSourceRegistrationApplyMutationSummary(
    audit.mutationSummary,
  );
  if (input.currentReplayBindings) {
    assertSourceRegistrationCurrentReplayBindings({
      summary,
      ...input.currentReplayBindings,
    });
  }
  if (
    audit.operationKey !== input.operationKey ||
    summary.operationKey !== input.operationKey ||
    canonicalSourceRegistrationJson(
      summary.codeBindings as unknown as SourceRegistrationJsonValue,
    ) !==
      canonicalSourceRegistrationJson(
        input.codeBindings as unknown as SourceRegistrationJsonValue,
      ) ||
    canonicalSourceRegistrationJson(
      summary.databaseTarget as unknown as SourceRegistrationJsonValue,
    ) !==
      canonicalSourceRegistrationJson(
        input.state.databaseTarget as unknown as SourceRegistrationJsonValue,
      ) ||
    canonicalSourceRegistrationJson(
      summary.databaseCatalog as unknown as SourceRegistrationJsonValue,
    ) !==
      canonicalSourceRegistrationJson(
        input.state.databaseCatalog as unknown as SourceRegistrationJsonValue,
      )
  ) {
    fail(
      "existing receipt is not bound to the exact current apply implementation",
    );
  }
  const expected = currentAfterSnapshot({
    stateBeforeAuditAppend: {
      ...input.state,
      coreCounts: {
        ...input.state.coreCounts,
        ControlledMutationAudit:
          summary.afterSnapshot.counts.controlledMutationAuditsBeforeAppend,
      },
      audits: [],
    },
    plan: input.plan,
    releaseEvidence: summary.releaseEvidence,
  });
  if (
    canonicalSourceRegistrationJson(
      expected as unknown as SourceRegistrationJsonValue,
    ) !==
    canonicalSourceRegistrationJson(
      summary.afterSnapshot as unknown as SourceRegistrationJsonValue,
    )
  ) {
    fail(
      "existing audit receipt after-snapshot differs from live exact target rows",
    );
  }
  if (
    input.state.coreCounts.ControlledMutationAudit !==
    summary.afterSnapshot.counts.controlledMutationAuditsAfterAppend
  ) {
    fail("live audit count differs from the exact receipted after-state");
  }
  return summary;
}

export type SourceRegistrationCurrentReplayBindings = {
  authorization: SourceRegistrationApplyAuthorization;
  releaseAuthorization: SourceRegistrationReleaseAuthorization;
  releaseEvidence: SourceRegistrationReleaseEvidence;
};

export function assertSourceRegistrationCurrentReplayBindings(
  input: SourceRegistrationCurrentReplayBindings & {
    summary: SourceRegistrationApplyMutationSummary;
  },
): void {
  assertCanonicalEqual(
    input.authorization,
    input.summary.authorization,
    "current CLI authorization and stored receipt authorization",
  );
  assertCanonicalEqual(
    input.releaseAuthorization,
    input.summary.releaseAuthorization,
    "current signed release authorization and stored receipt authorization envelope",
  );
  assertCanonicalEqual(
    input.releaseEvidence,
    input.summary.releaseEvidence,
    "current release evidence and stored receipt release evidence",
  );
}

export function assertReceiptedSourceRegistrationNoop(input: {
  state: SourceRegistrationApplyDatabaseState;
  plan: SourceRegistrationPlan;
  codeBindings: SourceRegistrationApplyCodeBindings;
  operationKey: string;
  currentReplayBindings?: SourceRegistrationCurrentReplayBindings;
}) {
  const summary = receiptedNoopSummary(input);
  return {
    summary,
    audit: input.state.audits[0]!,
    targetCounts: {
      exactDocuments: input.state.targetStates.filter(
        (target) => target.documentState === "exact",
      ).length,
      exactLibraryAnalysisRecords: input.state.targetStates.filter(
        (target) => target.libraryState === "exact",
      ).length,
    },
    dependencyRowCount: input.state.dependencyRows.length,
    dependencyRowsSha256: input.state.dependencyRowsSha256,
    coreCounts: input.state.coreCounts,
  };
}

async function lockSourceRegistrationScope(tx: Prisma.TransactionClient) {
  const advisoryLockRows = await tx.$queryRaw<Array<{ lockValue: string }>>(
    Prisma.sql`SELECT pg_advisory_xact_lock(${SOURCE_REGISTRATION_APPLY_ADVISORY_LOCK_KEY}::bigint)::text AS "lockValue"`,
  );
  if (advisoryLockRows.length !== 1) {
    fail("stable advisory transaction lock did not return exactly one row");
  }
  const relationRows = await tx.$queryRaw<Array<{ qualifiedName: string }>>(
    Prisma.sql`
      SELECT format('%I.%I', n.nspname, c.relname)::text AS "qualifiedName"
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p', 'm')
      ORDER BY c.relname COLLATE "C"
    `,
  );
  if (relationRows.length === 0)
    fail("public data-relation lock scope is empty");
  const qualifiedNames = relationRows.map((row) => row.qualifiedName);
  if (
    new Set(qualifiedNames).size !== qualifiedNames.length ||
    qualifiedNames.some(
      (name) =>
        !name.startsWith("public.") ||
        name.includes(";") ||
        name.includes("\n") ||
        name.includes("\r") ||
        name.includes("\u0000"),
    )
  ) {
    fail("public data-relation lock scope is unsafe or duplicated");
  }
  await tx.$executeRawUnsafe(
    `LOCK TABLE ${qualifiedNames.join(", ")} IN SHARE ROW EXCLUSIVE MODE`,
  );
  const afterRows = await tx.$queryRaw<Array<{ qualifiedName: string }>>(
    Prisma.sql`
      SELECT format('%I.%I', n.nspname, c.relname)::text AS "qualifiedName"
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p', 'm')
      ORDER BY c.relname COLLATE "C"
    `,
  );
  if (
    canonicalSourceRegistrationJson(
      afterRows as unknown as SourceRegistrationJsonValue,
    ) !==
    canonicalSourceRegistrationJson(
      relationRows as unknown as SourceRegistrationJsonValue,
    )
  ) {
    fail("public data-relation scope changed while acquiring table locks");
  }
  return { relationCount: relationRows.length, qualifiedNames };
}

function documentCreateData(
  target: SourceRegistrationPlan["targets"][number],
  content: string,
): Prisma.DocumentCreateManyInput {
  const row = target.intendedDocumentRow;
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
    content,
    summary: row.summary,
    url: row.url,
    accessedAt: new Date(row.accessedAt),
    archivedUrl: row.archivedUrl,
    wordCount: row.wordCount,
    tags: row.tags,
    metadata: row.metadata as Prisma.InputJsonValue,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  };
}

function libraryCreateData(
  target: SourceRegistrationPlan["targets"][number],
): Prisma.LibraryAnalysisRecordCreateManyInput {
  const row = target.intendedLibraryAnalysisRow;
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
    aiCard: Prisma.DbNull,
    aiSummary: row.aiSummary,
    keyFindings: row.keyFindings,
    claimCandidates: Prisma.DbNull,
    projectImplications: row.projectImplications,
    gaps: Prisma.DbNull,
    controlLinks: row.controlLinks as Prisma.InputJsonValue,
    riskFlags: row.riskFlags,
    contentHash: row.contentHash,
    wordCount: row.wordCount,
    processedAt: null,
    reviewedAt: null,
    reviewer: null,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  };
}

export async function executeSourceRegistrationMutationCore<
  AfterCreates,
  AfterAudit,
>(input: {
  tx: Prisma.TransactionClient;
  plan: SourceRegistrationPlan;
  contents: Map<string, string>;
  expectedOperationKey: string;
  inspectAfterCreates: () => Promise<AfterCreates>;
  buildAudit: (
    afterCreates: AfterCreates,
  ) => Promise<Prisma.ControlledMutationAuditUncheckedCreateInput>;
  inspectAfterAudit: () => Promise<AfterAudit>;
  validateAfterAudit: (afterAudit: AfterAudit) => Promise<void> | void;
}): Promise<{ afterCreates: AfterCreates; afterAudit: AfterAudit }> {
  if (
    input.plan.targets.length !== 10 ||
    input.plan.targets.some(
      (target) =>
        !input.contents.has(target.intendedDocumentRow.id) ||
        typeof input.contents.get(target.intendedDocumentRow.id) !== "string",
    )
  ) {
    fail("mutation core requires exact reconstructed content for 10 targets");
  }
  const documentCreates = await input.tx.document.createMany({
    data: input.plan.targets.map((target) =>
      documentCreateData(
        target,
        input.contents.get(target.intendedDocumentRow.id)!,
      ),
    ),
    skipDuplicates: false,
  });
  if (documentCreates.count !== 10) {
    fail("Document create count was not exactly 10");
  }
  const libraryCreates = await input.tx.libraryAnalysisRecord.createMany({
    data: input.plan.targets.map((target) => libraryCreateData(target)),
    skipDuplicates: false,
  });
  if (libraryCreates.count !== 10) {
    fail("LibraryAnalysisRecord create count was not exactly 10");
  }
  const afterCreates = await input.inspectAfterCreates();
  const createdAudit = await input.tx.controlledMutationAudit.create({
    data: await input.buildAudit(afterCreates),
  });
  if (createdAudit.operationKey !== input.expectedOperationKey) {
    fail("audit append did not return exact operation key");
  }
  const afterAudit = await input.inspectAfterAudit();
  await input.validateAfterAudit(afterAudit);
  return { afterCreates, afterAudit };
}

type SourceRegistrationRehearsalCounts = {
  documents: number;
  libraryAnalysisRecords: number;
  controlledMutationAudits: number;
};

type SourceRegistrationRehearsalInside = {
  isolationLevel: "Serializable";
  documentCreates: 10;
  libraryAnalysisRecordCreates: 10;
  controlledMutationAuditCreates: 1;
  exactDocumentRows: 10;
  exactLibraryAnalysisRows: 10;
  dependencyRowCount: 0;
  physicalDocumentRowsSha256: string;
  libraryAnalysisRowsSha256: string;
  rehearsalAuditSummarySha256: string;
};

class SourceRegistrationRehearsalRollback extends Error {
  constructor(readonly inside: SourceRegistrationRehearsalInside) {
    super("source-registration-logical-clone-rehearsal-forced-rollback");
  }
}

async function sourceRegistrationRehearsalCounts(
  tx: Prisma.TransactionClient,
): Promise<SourceRegistrationRehearsalCounts> {
  return {
    documents: await tx.document.count(),
    libraryAnalysisRecords: await tx.libraryAnalysisRecord.count(),
    controlledMutationAudits: await tx.controlledMutationAudit.count(),
  };
}

function exactPendingRehearsalTargetSet(
  targetSet: SourceRegistrationTargetSetInspection,
): boolean {
  return (
    targetSet.targetStates.every(
      (target) =>
        target.documentState === "absent" && target.libraryState === "absent",
    ) &&
    targetSet.documentRows.length === 0 &&
    targetSet.libraryRows.length === 0 &&
    targetSet.dependencyRows.length === 0
  );
}

export async function runSourceRegistrationLogicalCloneRehearsal(input: {
  databaseUrl: string;
  plan: SourceRegistrationPlan;
  contents: Map<string, string>;
  applyRunnerSha256: string;
  rehearsalRuntimeSha256: string;
  rehearsalSchemaSha256: string;
  rehearsalTestSha256: string;
  rehearsalCommandRunnerSha256: string;
  runtimeAttestation: SourceRegistrationRuntimeAttestation;
  logicalComparisonProof: SourceRegistrationLogicalComparisonProof;
  startedAt?: Date;
}): Promise<SourceRegistrationLogicalCloneRehearsalReceipt> {
  const applyRunnerSha256 = bareHash(
    input.applyRunnerSha256,
    "logical-clone rehearsal apply runner",
  );
  const rehearsalRuntimeSha256 = bareHash(
    input.rehearsalRuntimeSha256,
    "logical-clone rehearsal runtime",
  );
  const rehearsalSchemaSha256 = bareHash(
    input.rehearsalSchemaSha256,
    "logical-clone rehearsal schema",
  );
  const rehearsalTestSha256 = bareHash(
    input.rehearsalTestSha256,
    "logical-clone rehearsal test",
  );
  const rehearsalCommandRunnerSha256 = bareHash(
    input.rehearsalCommandRunnerSha256,
    "logical-clone rehearsal command runner",
  );
  const runtimeAttestation = validateSourceRegistrationRuntimeAttestation(
    input.runtimeAttestation,
  );
  const executedRuntime = {
    runtimeAttestationSha256: runtimeAttestation.runtimeAttestationSha256,
    launcherFileSha256: runtimeAttestation.launcher.fileSha256,
    nodeBinaryFileSha256: runtimeAttestation.node.binaryFileSha256,
    nodeRuntimeClosureSha256: runtimeAttestation.node.runtimeClosureSha256,
    nodeVersion: runtimeAttestation.node.version,
    nodePlatform: runtimeAttestation.node.platform,
    nodeArch: runtimeAttestation.node.arch,
    nodeModulesTreeSha256: runtimeAttestation.nodeModules.treeSha256,
    prismaGeneratedClientTreeSha256:
      runtimeAttestation.prismaGeneratedClient.treeSha256,
    localRuntimeClosureSha256: runtimeAttestation.localClosure.closureSha256,
  };
  const logicalComparisonProof =
    validateSourceRegistrationLogicalComparisonProof(
      input.logicalComparisonProof,
    );
  const logicalCloneContentStateSha256 = bareHash(
    logicalComparisonProof.restored.contentStateSha256,
    "logical-clone rehearsal restored content state",
  );
  const targetSetSha256 = sourceRegistrationApplyTargetSetSha256(input.plan);
  if (targetSetSha256 !== SOURCE_REGISTRATION_APPLY_LOCKED_TARGET_SET_SHA256) {
    fail("logical-clone rehearsal target set differs from the locked plan");
  }
  const operationKey = sourceRegistrationLogicalCloneRehearsalOperationKey({
    planSha256: SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_SHA256,
    targetSetSha256,
    applyRunnerSha256,
    rehearsalRuntimeSha256,
    rehearsalSchemaSha256,
    rehearsalTestSha256,
    rehearsalCommandRunnerSha256,
    runtimeAttestationSha256: runtimeAttestation.runtimeAttestationSha256,
    logicalComparisonProofSha256:
      logicalComparisonProof.logicalComparisonProofSha256,
  });
  const startedAt = input.startedAt ?? new Date();
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: input.databaseUrl }),
  });
  let beforeCounts: SourceRegistrationRehearsalCounts | null = null;
  let inside: SourceRegistrationRehearsalInside | null = null;
  try {
    try {
      await prisma.$transaction(
        async (tx) => {
          await lockSourceRegistrationScope(tx);
          const controlRows = await tx.$queryRaw<
            Array<{
              databaseName: string;
              databaseRole: string;
              isolationLevel: string;
            }>
          >(Prisma.sql`
            SELECT
              current_database()::text AS "databaseName",
              current_user::text AS "databaseRole",
              current_setting('transaction_isolation')::text AS "isolationLevel"
          `);
          const control = controlRows[0];
          if (
            !control ||
            control.databaseName ===
              SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_TARGET.databaseName ||
            control.isolationLevel !== "serializable"
          ) {
            fail(
              "logical-clone rehearsal requires a distinct surrogate database in Serializable",
            );
          }
          const identities = await tx.databaseIdentity.findMany({
            orderBy: { key: "asc" },
          });
          if (
            identities.length !== 1 ||
            identities[0]!.key !== "primary" ||
            identities[0]!.identityUuid.toLowerCase() !==
              SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_IDENTITY_UUID
          ) {
            fail("logical-clone rehearsal database identity differs");
          }
          beforeCounts = await sourceRegistrationRehearsalCounts(tx);
          const beforeTargets = await inspectSourceRegistrationTargetSet({
            tx,
            plan: input.plan,
            contents: input.contents,
          });
          const existingAuditCount = await tx.controlledMutationAudit.count({
            where: {
              OR: [
                { operationKey },
                { id: "018f6f24-742a-7c01-8f4a-4fdfbf338722" },
              ],
            },
          });
          if (
            !exactPendingRehearsalTargetSet(beforeTargets) ||
            existingAuditCount !== 0
          ) {
            fail(
              "logical-clone rehearsal did not start from exact pending state",
            );
          }

          let rehearsalAuditSummarySha256: string | null = null;
          await executeSourceRegistrationMutationCore({
            tx,
            plan: input.plan,
            contents: input.contents,
            expectedOperationKey: operationKey,
            inspectAfterCreates: () =>
              inspectSourceRegistrationTargetSet({
                tx,
                plan: input.plan,
                contents: input.contents,
              }),
            buildAudit: async (afterCreates) => {
              if (
                afterCreates.targetStates.some(
                  (target) =>
                    target.documentState !== "exact" ||
                    target.libraryState !== "exact",
                ) ||
                afterCreates.documentRows.length !== 10 ||
                afterCreates.libraryRows.length !== 10 ||
                afterCreates.dependencyRows.length !== 0
              ) {
                fail(
                  "logical-clone rehearsal target rows were not exact after creates",
                );
              }
              const physicalDocumentRowsSha256 =
                sourceRegistrationPhysicalDocumentRowsSha256(
                  afterCreates.documentRows.map((row) =>
                    comparableDocument(row),
                  ),
                );
              const libraryAnalysisRowsSha256 = canonicalBareHash(
                afterCreates.libraryRows.map((row) => comparableLibrary(row)),
              );
              const auditBody = {
                schemaVersion:
                  "source-registration-logical-clone-rehearsal-audit-v1",
                targetClass: "logical_clone_surrogate",
                exactProductionTargetExercised: false,
                transactionWillBeRolledBack: true,
                planSha256: SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_SHA256,
                targetSetSha256,
                applyRunnerSha256,
                rehearsalRuntimeSha256,
                rehearsalSchemaSha256,
                rehearsalTestSha256,
                rehearsalCommandRunnerSha256,
                executedRuntime,
                logicalComparisonProof,
                operationKey,
                physicalDocumentRowsSha256,
                libraryAnalysisRowsSha256,
                documentCreates: 10,
                libraryAnalysisRecordCreates: 10,
                controlledMutationAuditCreates: 1,
              } as const;
              rehearsalAuditSummarySha256 = sourceRegistrationApplyBareSha256(
                `food-systems-2026:source-registration-logical-clone-rehearsal-audit:v1\0${canonicalSourceRegistrationJson(
                  auditBody,
                )}`,
              );
              return {
                id: "018f6f24-742a-7c01-8f4a-4fdfbf338722",
                operationKey,
                contractScope:
                  "source_registration_logical_clone_surrogate_rehearsal_v1",
                contractSha256: applyRunnerSha256,
                planSha256: SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_SHA256,
                beforeSnapshotSha256:
                  SOURCE_REGISTRATION_APPLY_LOCKED_BEFORE_SNAPSHOT_SHA256,
                afterSnapshotSha256: rehearsalAuditSummarySha256,
                dependencyStateSha256: applyRunnerSha256,
                databaseIdentityUuid:
                  SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_IDENTITY_UUID,
                targetFingerprintSha256: logicalCloneContentStateSha256,
                backupSha256: logicalComparisonProof.backupSha256,
                backupMetadataSha256:
                  logicalComparisonProof.backupMetadataSha256,
                restoreReceiptSha256:
                  logicalComparisonProof.structuralRestoreReceiptSha256,
                operatorId: "codex-ai:food-systems-2026-local-operator",
                authorizationRef:
                  "logical-clone-surrogate-rehearsal:forced-rollback",
                databaseRole: control.databaseRole,
                mutationSummary: {
                  ...auditBody,
                  summarySha256: rehearsalAuditSummarySha256,
                } as unknown as Prisma.InputJsonValue,
              };
            },
            inspectAfterAudit: async () => ({
              targetSet: await inspectSourceRegistrationTargetSet({
                tx,
                plan: input.plan,
                contents: input.contents,
              }),
              counts: await sourceRegistrationRehearsalCounts(tx),
              auditCount: await tx.controlledMutationAudit.count({
                where: { operationKey },
              }),
            }),
            validateAfterAudit: ({ targetSet, counts, auditCount }) => {
              if (
                !beforeCounts ||
                targetSet.targetStates.some(
                  (target) =>
                    target.documentState !== "exact" ||
                    target.libraryState !== "exact",
                ) ||
                targetSet.documentRows.length !== 10 ||
                targetSet.libraryRows.length !== 10 ||
                targetSet.dependencyRows.length !== 0 ||
                counts.documents !== beforeCounts.documents + 10 ||
                counts.libraryAnalysisRecords !==
                  beforeCounts.libraryAnalysisRecords + 10 ||
                counts.controlledMutationAudits !==
                  beforeCounts.controlledMutationAudits + 1 ||
                auditCount !== 1 ||
                !rehearsalAuditSummarySha256
              ) {
                fail(
                  "logical-clone rehearsal did not prove exact inside-transaction state",
                );
              }
            },
          });
          if (!rehearsalAuditSummarySha256) {
            fail("logical-clone rehearsal audit summary was not constructed");
          }
          const finalTargets = await inspectSourceRegistrationTargetSet({
            tx,
            plan: input.plan,
            contents: input.contents,
          });
          inside = {
            isolationLevel: "Serializable",
            documentCreates: 10,
            libraryAnalysisRecordCreates: 10,
            controlledMutationAuditCreates: 1,
            exactDocumentRows: 10,
            exactLibraryAnalysisRows: 10,
            dependencyRowCount: 0,
            physicalDocumentRowsSha256:
              sourceRegistrationPhysicalDocumentRowsSha256(
                finalTargets.documentRows.map((row) => comparableDocument(row)),
              ),
            libraryAnalysisRowsSha256: canonicalBareHash(
              finalTargets.libraryRows.map((row) => comparableLibrary(row)),
            ),
            rehearsalAuditSummarySha256,
          };
          throw new SourceRegistrationRehearsalRollback(inside);
        },
        {
          isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
          maxWait: 30_000,
          timeout: 300_000,
        },
      );
      fail("logical-clone rehearsal transaction unexpectedly committed");
    } catch (error) {
      if (!(error instanceof SourceRegistrationRehearsalRollback)) throw error;
      inside = error.inside;
    }

    if (!beforeCounts || !inside) {
      fail("logical-clone rehearsal did not capture rollback evidence");
    }
    const afterRollback = await prisma.$transaction(
      async (tx) => {
        await tx.$executeRawUnsafe("SET TRANSACTION READ ONLY");
        return {
          counts: await sourceRegistrationRehearsalCounts(tx),
          targetSet: await inspectSourceRegistrationTargetSet({
            tx,
            plan: input.plan,
            contents: input.contents,
          }),
          auditCount: await tx.controlledMutationAudit.count({
            where: { operationKey },
          }),
        };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );
    if (
      canonicalSourceRegistrationJson(afterRollback.counts) !==
        canonicalSourceRegistrationJson(beforeCounts) ||
      !exactPendingRehearsalTargetSet(afterRollback.targetSet) ||
      afterRollback.auditCount !== 0
    ) {
      fail("logical-clone rehearsal rollback absence proof failed");
    }
    return sealSourceRegistrationLogicalCloneRehearsalReceipt({
      schemaVersion: "source-registration-logical-clone-rehearsal-v1",
      artifactType:
        "source_registration_logical_clone_surrogate_rehearsal_receipt",
      targetClass: "logical_clone_surrogate",
      exactProductionTargetExercised: false,
      firstExactMutationRemainsLive: true,
      productionAuthorizationUsed: false,
      planSha256: SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_SHA256,
      planFileSha256: SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_FILE_SHA256,
      targetSetSha256: SOURCE_REGISTRATION_APPLY_LOCKED_TARGET_SET_SHA256,
      applyRunnerSha256,
      rehearsalRuntimeSha256,
      rehearsalSchemaSha256,
      rehearsalTestSha256,
      rehearsalCommandRunnerSha256,
      executedRuntime,
      logicalComparisonProof,
      operationKey,
      rehearsalStartedAtUtc: startedAt.toISOString(),
      rehearsalCompletedAtUtc: new Date().toISOString(),
      beforeCounts,
      insideTransaction: inside,
      rollback: {
        forcedBySentinel: true,
        transactionRolledBack: true,
        rollbackAbsenceConfirmed: true,
        afterCountsEqualBeforeCounts: true,
        targetRowsAbsentAfterRollback: true,
        rehearsalAuditAbsentAfterRollback: true,
      },
      afterRollbackCounts: afterRollback.counts,
      cloneDatabaseNameStored: false,
      privateAbsolutePathStored: false,
      databaseCredentialStored: false,
    });
  } finally {
    await prisma.$disconnect();
  }
}

async function verifyExactReleaseEvidenceFromOptions(input: {
  projectRoot: string;
  options: SourceRegistrationApplyCliOptions;
  codeBindings: SourceRegistrationApplyCodeBindings;
}): Promise<SourceRegistrationReleaseEvidence> {
  return verifySourceRegistrationReleaseEvidence({
    projectRoot: input.projectRoot,
    codeBindings: input.codeBindings,
    backupFile: input.options.backupFile!,
    structuralRestoreReceipt: input.options.structuralRestoreReceipt!,
    logicalRestoreCompanionReceipt:
      input.options.logicalRestoreCompanionReceipt!,
    logicalCloneRehearsalReceipt: input.options.logicalCloneRehearsalReceipt!,
    verifierPath: projectFile(
      input.projectRoot,
      SOURCE_REGISTRATION_APPLY_PATHS.backupVerifier,
    ),
    backupContractHelperPath: projectFile(
      input.projectRoot,
      SOURCE_REGISTRATION_APPLY_PATHS.backupContractHelper,
    ),
    expectedVerifierFileSha256: input.codeBindings.backupVerifier.fileSha256,
    expectedBackupContractHelperFileSha256:
      input.codeBindings.backupContractHelper.fileSha256,
    pins: {
      backupSha256: input.options.expectedBackupSha256,
      backupBytes: input.options.expectedBackupBytes,
      backupMetadataSha256: input.options.expectedBackupMetadataSha256,
      structuralRestoreReceiptSha256:
        input.options.expectedStructuralRestoreReceiptSha256,
      logicalRestoreCompanionReceiptSha256:
        input.options.expectedLogicalRestoreCompanionReceiptSha256,
      logicalCloneRehearsalReceiptFileSha256:
        input.options.expectedLogicalCloneRehearsalReceiptFileSha256,
      logicalCloneRehearsalReceiptSelfSha256:
        input.options.expectedLogicalCloneRehearsalReceiptSelfSha256,
      logicalComparisonProofSha256:
        input.options.expectedLogicalComparisonProofSha256,
      completedMigrationLedgerSha256:
        input.options.expectedMigrationLedgerSha256,
      targetFingerprintSha256: input.options.expectedTargetFingerprintSha256,
    },
  });
}

export function validateExactApplyOptions(input: {
  options: SourceRegistrationApplyCliOptions;
  codeBindings: SourceRegistrationApplyCodeBindings;
}): SourceRegistrationApplyAuthorization {
  const { options, codeBindings } = input;
  if (options.ack !== SOURCE_REGISTRATION_APPLY_ACK) {
    fail(`--apply requires --ack=${SOURCE_REGISTRATION_APPLY_ACK}`);
  }
  requireExactSha(
    options.planSha256,
    SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_SHA256,
    "--plan-sha256",
  );
  requireExactSha(
    options.planFileSha256,
    SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_FILE_SHA256,
    "--plan-file-sha256",
  );
  requireExactSha(
    options.beforeSnapshotSha256,
    SOURCE_REGISTRATION_APPLY_LOCKED_BEFORE_SNAPSHOT_SHA256,
    "--before-snapshot-sha256",
  );
  if (
    options.databaseIdentityUuid?.toLowerCase() !==
    SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_IDENTITY_UUID
  ) {
    fail("--database-identity-uuid differs from locked plan");
  }
  requireExactSha(
    options.applyContractSha256,
    sourceRegistrationApplyContractSha256(),
    "--apply-contract-sha256",
  );
  requireExactSha(
    options.runtimeFileSha256,
    codeBindings.runtime.fileSha256,
    "--runtime-file-sha256",
  );
  requireExactSha(
    options.runnerFileSha256,
    codeBindings.runner.fileSha256,
    "--runner-file-sha256",
  );
  requireExactSha(
    options.launcherFileSha256,
    codeBindings.launcher.fileSha256,
    "--launcher-file-sha256",
  );
  requireExactSha(
    options.runtimeLauncherTestFileSha256,
    codeBindings.runtimeLauncherTest.fileSha256,
    "--runtime-launcher-test-file-sha256",
  );
  requireExactSha(
    options.logicalCloneRehearsalRuntimeFileSha256,
    codeBindings.logicalCloneRehearsalRuntime.fileSha256,
    "--logical-clone-rehearsal-runtime-file-sha256",
  );
  requireExactSha(
    options.logicalCloneRehearsalSchemaFileSha256,
    codeBindings.logicalCloneRehearsalJsonSchema.fileSha256,
    "--logical-clone-rehearsal-schema-file-sha256",
  );
  requireExactSha(
    options.logicalCloneRehearsalTestFileSha256,
    codeBindings.logicalCloneRehearsalTest.fileSha256,
    "--logical-clone-rehearsal-test-file-sha256",
  );
  requireExactSha(
    options.logicalCloneRehearsalCommandRunnerFileSha256,
    codeBindings.logicalCloneRehearsalCommandRunner.fileSha256,
    "--logical-clone-rehearsal-command-runner-file-sha256",
  );
  requireExactSha(
    options.logicalRestoreCompanionValidatorFileSha256,
    codeBindings.logicalRestoreCompanionValidator.fileSha256,
    "--logical-restore-companion-validator-file-sha256",
  );
  requireExactSha(
    options.logicalRestoreCompanionSchemaFileSha256,
    codeBindings.logicalRestoreCompanionJsonSchema.fileSha256,
    "--logical-restore-companion-schema-file-sha256",
  );
  requireExactSha(
    options.logicalRestoreCompanionTestFileSha256,
    codeBindings.logicalRestoreCompanionTest.fileSha256,
    "--logical-restore-companion-test-file-sha256",
  );
  requireExactSha(
    options.controlledLogicalRestoreCompanionRunnerFileSha256,
    codeBindings.controlledLogicalRestoreCompanionRunner.fileSha256,
    "--controlled-logical-restore-companion-runner-file-sha256",
  );
  requireExactSha(
    options.pdfQualificationRuntimeFileSha256,
    codeBindings.pdfQualificationRuntime.fileSha256,
    "--pdf-qualification-runtime-file-sha256",
  );
  requireExactSha(
    options.sourceAcquisitionRuntimeFileSha256,
    codeBindings.sourceAcquisitionRuntime.fileSha256,
    "--source-acquisition-runtime-file-sha256",
  );
  requireExactSha(
    options.sourceAnalysisInputRuntimeFileSha256,
    codeBindings.sourceAnalysisInputRuntime.fileSha256,
    "--source-analysis-input-runtime-file-sha256",
  );
  requireExactSha(
    options.databaseLogicalStateDigestFileSha256,
    codeBindings.databaseLogicalStateDigest.fileSha256,
    "--database-logical-state-digest-file-sha256",
  );
  requireExactSha(
    options.databaseLogicalStateDigestTestFileSha256,
    codeBindings.databaseLogicalStateDigestTest.fileSha256,
    "--database-logical-state-digest-test-file-sha256",
  );
  requireExactSha(
    options.nodeRuntimeClosureManifestFileSha256,
    codeBindings.nodeRuntimeClosureManifest.fileSha256,
    "--node-runtime-closure-manifest-file-sha256",
  );
  requireExactSha(
    options.nodeRuntimeClosureVerifierFileSha256,
    codeBindings.nodeRuntimeClosureVerifier.fileSha256,
    "--node-runtime-closure-verifier-file-sha256",
  );
  requireExactSha(
    options.nodeRuntimeClosureVerifierTestFileSha256,
    codeBindings.nodeRuntimeClosureVerifierTest.fileSha256,
    "--node-runtime-closure-verifier-test-file-sha256",
  );
  requireExactSha(
    options.psqlRuntimeClosureManifestFileSha256,
    codeBindings.psqlRuntimeClosureManifest.fileSha256,
    "--psql-runtime-closure-manifest-file-sha256",
  );
  requireExactSha(
    options.psqlRuntimeClosureVerifierFileSha256,
    codeBindings.psqlRuntimeClosureVerifier.fileSha256,
    "--psql-runtime-closure-verifier-file-sha256",
  );
  requireExactSha(
    options.psqlRuntimeClosureVerifierTestFileSha256,
    codeBindings.psqlRuntimeClosureVerifierTest.fileSha256,
    "--psql-runtime-closure-verifier-test-file-sha256",
  );
  requireExactSha(
    options.restoreRunnerFileSha256,
    codeBindings.restoreRunner.fileSha256,
    "--restore-runner-file-sha256",
  );
  requireExactSha(
    options.releaseAuthorizationVerifierFileSha256,
    codeBindings.releaseAuthorizationVerifier.fileSha256,
    "--release-authorization-verifier-file-sha256",
  );
  requireExactSha(
    options.releaseAuthorizationSchemaFileSha256,
    codeBindings.releaseAuthorizationJsonSchema.fileSha256,
    "--release-authorization-schema-file-sha256",
  );
  requireExactSha(
    options.releaseAuthorizationContractFileSha256,
    codeBindings.releaseAuthorizationContract.fileSha256,
    "--release-authorization-contract-file-sha256",
  );
  requireExactSha(
    options.releaseAuthorizationPublicKeyFileSha256,
    codeBindings.releaseAuthorizationPublicKey.fileSha256,
    "--release-authorization-public-key-file-sha256",
  );
  requireExactSha(
    options.releaseAuthorizationVerifierTestFileSha256,
    codeBindings.releaseAuthorizationVerifierTest.fileSha256,
    "--release-authorization-verifier-test-file-sha256",
  );
  requireExactSha(
    options.releaseAuthorizationSignerFileSha256,
    codeBindings.releaseAuthorizationSigner.fileSha256,
    "--release-authorization-signer-file-sha256",
  );
  requireExactSha(
    options.releaseAuthorizationSignerTestFileSha256,
    codeBindings.releaseAuthorizationSignerTest.fileSha256,
    "--release-authorization-signer-test-file-sha256",
  );
  requireExactSha(
    options.schemaFileSha256,
    codeBindings.jsonSchema.fileSha256,
    "--schema-file-sha256",
  );
  requireExactSha(
    options.contractDocumentFileSha256,
    codeBindings.contractDocument.fileSha256,
    "--contract-document-file-sha256",
  );
  requireExactSha(
    options.backupVerifierFileSha256,
    codeBindings.backupVerifier.fileSha256,
    "--backup-verifier-file-sha256",
  );
  requireExactSha(
    options.backupContractHelperFileSha256,
    codeBindings.backupContractHelper.fileSha256,
    "--backup-contract-helper-file-sha256",
  );
  requireExactSha(
    options.packageLockFileSha256,
    codeBindings.packageLock.fileSha256,
    "--package-lock-file-sha256",
  );
  requireExactSha(
    options.prismaGeneratedClientTreeSha256,
    codeBindings.prismaGeneratedClientTree.treeSha256,
    "--prisma-generated-client-tree-sha256",
  );
  const runtime = codeBindings.runtimeEnvironment;
  requireExactSha(
    options.nodeBinaryFileSha256,
    runtime.node.binaryFileSha256,
    "--node-binary-file-sha256",
  );
  requireExactValue(
    options.nodeVersion,
    runtime.node.version,
    "--node-version",
  );
  requireExactValue(
    options.nodePlatform,
    runtime.node.platform,
    "--node-platform",
  );
  requireExactValue(options.nodeArch, runtime.node.arch, "--node-arch");
  requireExactSha(
    options.nodeRuntimeClosureSha256,
    runtime.node.runtimeClosureSha256,
    "--node-runtime-closure-sha256",
  );
  if (
    runtime.node.runtimeClosureSha256 !==
    SOURCE_REGISTRATION_APPLY_LOCKED_NODE_RUNTIME_CLOSURE_SHA256
  ) {
    fail("Node runtime closure differs from the reviewed closure");
  }
  requireExactSha(
    options.nodeModulesTreeSha256,
    runtime.nodeModules.treeSha256,
    "--node-modules-tree-sha256",
  );
  requireExactSha(
    options.runtimeLocalClosureSha256,
    runtime.localClosure.closureSha256,
    "--runtime-local-closure-sha256",
  );
  requireExactSha(
    options.psqlBinaryFileSha256,
    runtime.psql.binaryFileSha256,
    "--psql-binary-file-sha256",
  );
  requireExactValue(
    options.psqlVersion,
    runtime.psql.version,
    "--psql-version",
  );
  requireExactSha(
    options.psqlRuntimeClosureSha256,
    runtime.psql.runtimeClosureSha256,
    "--psql-runtime-closure-sha256",
  );
  if (
    runtime.psql.runtimeClosureSha256 !==
    SOURCE_REGISTRATION_APPLY_LOCKED_PSQL_RUNTIME_CLOSURE_SHA256
  ) {
    fail("psql runtime closure differs from the reviewed closure");
  }
  requireExactSha(
    options.runtimeAttestationSha256,
    runtime.runtimeAttestationSha256,
    "--runtime-attestation-sha256",
  );
  requireExactSha(
    options.databaseTargetSha256,
    SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_TARGET_SHA256,
    "--database-target-sha256",
  );
  requireExactSha(
    options.databaseCatalogSha256,
    SOURCE_REGISTRATION_APPLY_LOCKED_DATABASE_CATALOG_SHA256,
    "--database-catalog-sha256",
  );
  for (const [value, label] of [
    [options.backupFile, "--backup-file"],
    [options.structuralRestoreReceipt, "--structural-restore-receipt"],
    [
      options.logicalRestoreCompanionReceipt,
      "--logical-restore-companion-receipt",
    ],
    [options.logicalCloneRehearsalReceipt, "--logical-clone-rehearsal-receipt"],
    [options.releaseAuthorization, "--release-authorization"],
    [
      options.expectedReleaseAuthorizationSha256,
      "--expected-release-authorization-sha256",
    ],
    [options.expectedBackupSha256, "--expected-backup-sha256"],
    [options.expectedBackupMetadataSha256, "--expected-backup-metadata-sha256"],
    [
      options.expectedStructuralRestoreReceiptSha256,
      "--expected-structural-restore-receipt-sha256",
    ],
    [
      options.expectedLogicalRestoreCompanionReceiptSha256,
      "--expected-logical-restore-companion-receipt-sha256",
    ],
    [
      options.expectedLogicalCloneRehearsalReceiptFileSha256,
      "--expected-logical-clone-rehearsal-receipt-file-sha256",
    ],
    [
      options.expectedLogicalCloneRehearsalReceiptSelfSha256,
      "--expected-logical-clone-rehearsal-receipt-self-sha256",
    ],
    [
      options.expectedLogicalComparisonProofSha256,
      "--expected-logical-comparison-proof-sha256",
    ],
    [
      options.expectedMigrationLedgerSha256,
      "--expected-migration-ledger-sha256",
    ],
    [
      options.expectedTargetFingerprintSha256,
      "--expected-target-fingerprint-sha256",
    ],
    [options.operatorId, "--operator-id"],
    [options.ownerScopeAuthorizationRef, "--owner-scope-authorization-ref"],
    [
      options.exactOperatorAuthorizationRef,
      "--exact-operator-authorization-ref",
    ],
    [options.databaseRole, "--database-role"],
  ] as const) {
    if (!value) fail(`--apply requires ${label}`);
  }
  for (const [value, label] of [
    [options.expectedBackupSha256!, "--expected-backup-sha256"],
    [
      options.expectedBackupMetadataSha256!,
      "--expected-backup-metadata-sha256",
    ],
    [
      options.expectedStructuralRestoreReceiptSha256!,
      "--expected-structural-restore-receipt-sha256",
    ],
    [
      options.expectedLogicalRestoreCompanionReceiptSha256!,
      "--expected-logical-restore-companion-receipt-sha256",
    ],
    [
      options.expectedLogicalCloneRehearsalReceiptFileSha256!,
      "--expected-logical-clone-rehearsal-receipt-file-sha256",
    ],
    [
      options.expectedLogicalCloneRehearsalReceiptSelfSha256!,
      "--expected-logical-clone-rehearsal-receipt-self-sha256",
    ],
    [
      options.expectedLogicalComparisonProofSha256!,
      "--expected-logical-comparison-proof-sha256",
    ],
    [
      options.expectedMigrationLedgerSha256!,
      "--expected-migration-ledger-sha256",
    ],
    [
      options.expectedTargetFingerprintSha256!,
      "--expected-target-fingerprint-sha256",
    ],
  ] as const) {
    bareHash(value, label);
  }
  if (
    !Number.isSafeInteger(options.expectedBackupBytes) ||
    options.expectedBackupBytes! <= 0
  ) {
    fail("--apply requires --expected-backup-bytes=<positive integer>");
  }
  bareHash(
    options.expectedReleaseAuthorizationSha256!,
    "--expected-release-authorization-sha256",
  );
  return validateSourceRegistrationApplyAuthorization({
    operatorId: options.operatorId!,
    ownerScopeAuthorizationRef: options.ownerScopeAuthorizationRef!,
    exactOperatorAuthorizationRef: options.exactOperatorAuthorizationRef!,
    databaseRole: options.databaseRole!,
    runtimeAttestationSha256: runtime.runtimeAttestationSha256,
    authorizationEnvelopeSha256: options.expectedReleaseAuthorizationSha256!,
  });
}

async function readOnlyObservation(input: {
  prisma: PrismaClient;
  plan: SourceRegistrationPlan;
  contents: Map<string, string>;
  operationKey: string;
}) {
  return input.prisma.$transaction(
    async (tx) => {
      await tx.$executeRawUnsafe("SET TRANSACTION READ ONLY");
      return inspectSourceRegistrationApplyDatabaseState({
        tx,
        plan: input.plan,
        contents: input.contents,
        operationKey: input.operationKey,
      });
    },
    {
      isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
      maxWait: 20_000,
      timeout: 180_000,
    },
  );
}

export async function inspectReceiptedSourceRegistrationAfterState(input: {
  projectRoot: string;
  databaseUrl: string;
  manifestPath?: string;
  primaryCorpusRoot: string;
  replicaCorpusRoot: string;
}) {
  const plan = loadLockedSourceRegistrationPlan(input.projectRoot);
  const codeBindings = sourceRegistrationApplyCodeBindings(input.projectRoot);
  const dependencyStateSha256 = sourceRegistrationApplyDependencyStateSha256({
    plan,
    codeBindings,
  });
  const operationKey = sourceRegistrationApplyOperationKey({
    contractSha256: sourceRegistrationApplyContractSha256(),
    dependencyStateSha256,
  });
  verifyLockedPlanInputs({
    projectRoot: input.projectRoot,
    manifestPath: input.manifestPath ?? SOURCE_REGISTRATION_PATHS.batch,
    primaryCorpusRoot: input.primaryCorpusRoot,
    replicaCorpusRoot: input.replicaCorpusRoot,
    plan,
  });
  const contents = reconstructLockedDocumentContents({
    projectRoot: input.projectRoot,
    primaryCorpusRoot: input.primaryCorpusRoot,
    replicaCorpusRoot: input.replicaCorpusRoot,
    plan,
  });
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: input.databaseUrl }),
  });
  try {
    const state = await readOnlyObservation({
      prisma,
      plan,
      contents,
      operationKey,
    });
    if (!state.transaction.readOnly) {
      fail(
        "post-apply receipt inspection did not prove a read-only transaction",
      );
    }
    const receipted = assertReceiptedSourceRegistrationNoop({
      state,
      plan,
      codeBindings,
      operationKey,
    });
    return {
      state: "receipted_noop" as const,
      operationKey,
      summary: receipted.summary,
      audit: receipted.audit,
      coreCounts: receipted.coreCounts,
      targetCounts: receipted.targetCounts,
      dependencyRowCount: receipted.dependencyRowCount,
      dependencyRowsSha256: receipted.dependencyRowsSha256,
      transaction: state.transaction,
    };
  } finally {
    await prisma.$disconnect();
  }
}

export async function runSourceRegistrationApply(input: {
  projectRoot: string;
  databaseUrl: string;
  options: SourceRegistrationApplyCliOptions;
}) {
  const plan = loadLockedSourceRegistrationPlan(input.projectRoot);
  const codeBindings = sourceRegistrationApplyCodeBindings(input.projectRoot);
  const launcherAttestation =
    input.options.mode === "apply"
      ? readSourceRegistrationLauncherAttestation()
      : null;
  if (launcherAttestation) {
    assertCanonicalEqual(
      launcherAttestation,
      codeBindings.runtimeEnvironment,
      "pre-import launcher runtime attestation",
    );
  }
  const dependencyStateSha256 = sourceRegistrationApplyDependencyStateSha256({
    plan,
    codeBindings,
  });
  const operationKey = sourceRegistrationApplyOperationKey({
    contractSha256: sourceRegistrationApplyContractSha256(),
    dependencyStateSha256,
  });
  const exactApplyAuthorization =
    input.options.mode === "apply"
      ? validateExactApplyOptions({ options: input.options, codeBindings })
      : null;
  verifyLockedPlanInputs({
    projectRoot: input.projectRoot,
    manifestPath: input.options.manifestPath,
    primaryCorpusRoot: input.options.primaryCorpusRoot,
    replicaCorpusRoot: input.options.replicaCorpusRoot,
    plan,
  });
  const contents = reconstructLockedDocumentContents({
    projectRoot: input.projectRoot,
    primaryCorpusRoot: input.options.primaryCorpusRoot,
    replicaCorpusRoot: input.options.replicaCorpusRoot,
    plan,
  });
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: input.databaseUrl }),
  });
  try {
    if (input.options.mode !== "apply") {
      let releaseEvidence: SourceRegistrationReleaseEvidence | undefined;
      if (input.options.mode === "verify_release_evidence") {
        if (
          !input.options.backupFile ||
          !input.options.structuralRestoreReceipt ||
          !input.options.logicalRestoreCompanionReceipt ||
          !input.options.logicalCloneRehearsalReceipt
        ) {
          fail(
            "release-evidence mode requires backup, structural restore, companion, and rehearsal receipts",
          );
        }
        releaseEvidence = validateReleaseEvidenceAgainstLockedPlan(
          await verifyExactReleaseEvidenceFromOptions({
            projectRoot: input.projectRoot,
            options: input.options,
            codeBindings,
          }),
          plan,
        );
      }
      const state = await readOnlyObservation({
        prisma,
        plan,
        contents,
        operationKey,
      });
      assertExactPendingState(state, plan);
      if (releaseEvidence) {
        assertReleaseEvidenceMatchesPendingDatabase(
          releaseEvidence,
          state,
          plan,
        );
      }
      return {
        mode: input.options.mode,
        state: "pending_exact_before_state" as const,
        planSha256: SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_SHA256,
        beforeSnapshotSha256:
          SOURCE_REGISTRATION_APPLY_LOCKED_BEFORE_SNAPSHOT_SHA256,
        applyContractSha256: sourceRegistrationApplyContractSha256(),
        databaseTargetSha256: state.databaseTarget.databaseTargetSha256,
        databaseCatalogSha256: state.databaseCatalog.catalogSha256,
        runtimeAttestationSha256:
          codeBindings.runtimeEnvironment.runtimeAttestationSha256,
        dependencyStateSha256,
        operationKey,
        targetCount: 10,
        reconstructedPageCount: plan.summary.pageCount,
        reconstructedWordCount: plan.summary.normalizedWordCount,
        releaseEvidenceVerified: Boolean(releaseEvidence),
        databaseTransactionReadOnly: true,
        databaseMutationPerformed: false,
        privateArchiveMutationPerformed: false,
      };
    }

    const authorization = exactApplyAuthorization!;
    const releaseEvidence = validateReleaseEvidenceAgainstLockedPlan(
      await verifyExactReleaseEvidenceFromOptions({
        projectRoot: input.projectRoot,
        options: input.options,
        codeBindings,
      }),
      plan,
    );
    const releaseAuthorization =
      verifyExactSourceRegistrationReleaseAuthorization({
        authorizationPath: input.options.releaseAuthorization!,
        authorizationEnvelopeSha256:
          input.options.expectedReleaseAuthorizationSha256!,
        operatorId: input.options.operatorId!,
        plan,
        codeBindings,
        releaseEvidence,
        dependencyStateSha256,
        operationKey,
      });

    const transactionResult = await prisma.$transaction(
      async (tx) => {
        await lockSourceRegistrationScope(tx);
        assertCanonicalEqual(
          sourceRegistrationApplyCodeBindings(input.projectRoot),
          codeBindings,
          "apply implementation bindings under lock",
        );
        verifyLockedPlanInputs({
          projectRoot: input.projectRoot,
          manifestPath: input.options.manifestPath,
          primaryCorpusRoot: input.options.primaryCorpusRoot,
          replicaCorpusRoot: input.options.replicaCorpusRoot,
          plan,
        });
        const lockedContents = reconstructLockedDocumentContents({
          projectRoot: input.projectRoot,
          primaryCorpusRoot: input.options.primaryCorpusRoot,
          replicaCorpusRoot: input.options.replicaCorpusRoot,
          plan,
        });
        const lockedReleaseEvidence =
          await verifyExactReleaseEvidenceFromOptions({
            projectRoot: input.projectRoot,
            options: input.options,
            codeBindings,
          });
        assertCanonicalEqual(
          lockedReleaseEvidence,
          releaseEvidence,
          "release evidence under lock",
        );
        const before = await inspectSourceRegistrationApplyDatabaseState({
          tx,
          plan,
          contents: lockedContents,
          operationKey,
        });
        assertWriterControl(before, authorization);
        const lockedReleaseAuthorization =
          verifyExactSourceRegistrationReleaseAuthorization({
            authorizationPath: input.options.releaseAuthorization!,
            authorizationEnvelopeSha256:
              input.options.expectedReleaseAuthorizationSha256!,
            operatorId: input.options.operatorId!,
            plan,
            codeBindings,
            releaseEvidence: lockedReleaseEvidence,
            dependencyStateSha256,
            operationKey,
          });
        assertCanonicalEqual(
          lockedReleaseAuthorization,
          releaseAuthorization,
          "signed release authorization under lock",
        );
        const existing = classifySourceRegistrationExistingState({
          targets: before.targetStates,
          dependencyRowCount: before.dependencyRows.length,
          audits: before.audits,
        });
        if (existing.state === "receipted_noop") {
          return {
            state: "receipted_noop" as const,
            summary: assertReceiptedSourceRegistrationNoop({
              state: before,
              plan,
              codeBindings,
              operationKey,
              currentReplayBindings: {
                authorization,
                releaseAuthorization: lockedReleaseAuthorization,
                releaseEvidence,
              },
            }).summary,
          };
        }
        if (existing.state !== "pending") {
          fail(
            `partial/conflict/drift/replay state refused: ${existing.codes.join(",")}`,
          );
        }
        assertExactPendingState(before, plan);
        assertReleaseEvidenceMatchesPendingDatabase(
          releaseEvidence,
          before,
          plan,
        );

        const liveContentState =
          await verifyLiveDatabaseContentAgainstSignedRestore({
            databaseUrl: input.databaseUrl,
            databaseRole: authorization.databaseRole,
            releaseAuthorization: lockedReleaseAuthorization,
            runtimeAttestation: codeBindings.runtimeEnvironment,
          });
        const immediatelyBeforeMutation =
          await inspectSourceRegistrationApplyDatabaseState({
            tx,
            plan,
            contents: lockedContents,
            operationKey,
          });
        assertWriterControl(immediatelyBeforeMutation, authorization);
        assertExactPendingState(immediatelyBeforeMutation, plan);
        assertReleaseEvidenceMatchesPendingDatabase(
          releaseEvidence,
          immediatelyBeforeMutation,
          plan,
        );

        let exactSummary: SourceRegistrationApplyMutationSummary | null = null;
        await executeSourceRegistrationMutationCore({
          tx,
          plan,
          contents: lockedContents,
          expectedOperationKey: operationKey,
          inspectAfterCreates: () =>
            inspectSourceRegistrationApplyDatabaseState({
              tx,
              plan,
              contents: lockedContents,
              operationKey,
            }),
          buildAudit: async (afterCreates) => {
            const afterSnapshot = currentAfterSnapshot({
              stateBeforeAuditAppend: afterCreates,
              plan,
              releaseEvidence,
            });
            const summary = buildSourceRegistrationApplyMutationSummary({
              plan,
              codeBindings,
              authorization,
              releaseAuthorization: lockedReleaseAuthorization,
              releaseEvidence,
              liveContentState,
              databaseTarget: afterCreates.databaseTarget,
              databaseCatalog: afterCreates.databaseCatalog,
              dependencyStateSha256,
              operationKey,
              afterSnapshot,
            });
            exactSummary = summary;
            const audit = sourceRegistrationControlledMutationAudit({
              summary,
            });
            return {
              id: audit.id,
              operationKey: audit.operationKey,
              contractScope: audit.contractScope,
              contractSha256: audit.contractSha256,
              planSha256: audit.planSha256,
              beforeSnapshotSha256: audit.beforeSnapshotSha256,
              afterSnapshotSha256: audit.afterSnapshotSha256,
              dependencyStateSha256: audit.dependencyStateSha256,
              databaseIdentityUuid: audit.databaseIdentityUuid,
              targetFingerprintSha256: audit.targetFingerprintSha256,
              backupSha256: audit.backupSha256,
              backupMetadataSha256: audit.backupMetadataSha256,
              restoreReceiptSha256: audit.restoreReceiptSha256,
              operatorId: audit.operatorId,
              authorizationRef: audit.authorizationRef,
              databaseRole: audit.databaseRole,
              mutationSummary: summary as unknown as Prisma.InputJsonValue,
            };
          },
          inspectAfterAudit: () =>
            inspectSourceRegistrationApplyDatabaseState({
              tx,
              plan,
              contents: lockedContents,
              operationKey,
            }),
          validateAfterAudit: (afterAudit) => {
            assertReceiptedSourceRegistrationNoop({
              state: afterAudit,
              plan,
              codeBindings,
              operationKey,
              currentReplayBindings: {
                authorization,
                releaseAuthorization: lockedReleaseAuthorization,
                releaseEvidence,
              },
            });
          },
        });
        if (!exactSummary) {
          fail("exact apply mutation core did not construct its receipt");
        }
        return {
          state: "exact_apply_committed" as const,
          summary: exactSummary,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 30_000,
        timeout: 300_000,
      },
    );

    assertCanonicalEqual(
      sourceRegistrationRuntimeAttestation(input.projectRoot),
      launcherAttestation!,
      "post-transaction runtime attestation",
    );

    const postCommit = await readOnlyObservation({
      prisma,
      plan,
      contents,
      operationKey,
    });
    const postCommitReleaseEvidence =
      await verifyExactReleaseEvidenceFromOptions({
        projectRoot: input.projectRoot,
        options: input.options,
        codeBindings,
      });
    assertCanonicalEqual(
      postCommitReleaseEvidence,
      releaseEvidence,
      "post-commit release evidence",
    );
    const verifiedSummary = assertReceiptedSourceRegistrationNoop({
      state: postCommit,
      plan,
      codeBindings,
      operationKey,
      currentReplayBindings: {
        authorization,
        releaseAuthorization,
        releaseEvidence: postCommitReleaseEvidence,
      },
    }).summary;
    if (
      verifiedSummary.summarySha256 !== transactionResult.summary.summarySha256
    ) {
      fail("post-commit receipt differs from transaction result");
    }
    return {
      mode: "apply" as const,
      state: transactionResult.state,
      operationKey,
      planSha256: SOURCE_REGISTRATION_APPLY_LOCKED_PLAN_SHA256,
      beforeSnapshotSha256:
        SOURCE_REGISTRATION_APPLY_LOCKED_BEFORE_SNAPSHOT_SHA256,
      afterSnapshotSha256: verifiedSummary.afterSnapshot.afterSnapshotSha256,
      summarySha256: verifiedSummary.summarySha256,
      documentCreates:
        transactionResult.state === "exact_apply_committed" ? 10 : 0,
      libraryAnalysisRecordCreates:
        transactionResult.state === "exact_apply_committed" ? 10 : 0,
      controlledMutationAuditCreates:
        transactionResult.state === "exact_apply_committed" ? 1 : 0,
      privateRecoveryRegisterWrites: 0,
      corpusRegisterWrites: 0,
      lifecycleEventWrites: 0,
    };
  } finally {
    await prisma.$disconnect();
  }
}

async function main() {
  const options = parseSourceRegistrationApplyArgs(process.argv.slice(2));
  if (!process.env.DATABASE_URL) fail("DATABASE_URL is required");
  const result = await runSourceRegistrationApply({
    projectRoot: process.cwd(),
    databaseUrl: process.env.DATABASE_URL,
    options,
  });
  process.stdout.write(`${JSON.stringify(result)}\n`);
}

const invokedPath = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : null;
if (invokedPath === import.meta.url) {
  main().catch((error) => {
    process.stderr.write(
      `${error instanceof Error ? error.message : String(error)}\n`,
    );
    process.exitCode = 1;
  });
}
