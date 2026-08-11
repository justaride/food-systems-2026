#!/usr/bin/env node

import { createHash } from "node:crypto";
import {
  closeSync,
  constants,
  existsSync,
  fsyncSync,
  fstatSync,
  lstatSync,
  mkdirSync,
  openSync,
  readSync,
  realpathSync,
  renameSync,
  linkSync,
  unlinkSync,
  writeSync,
} from "node:fs";
import type { Stats } from "node:fs";
import { dirname, isAbsolute, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { z } from "zod";

import {
  PRIVATE_RECOVERY_ACQUISITION_APPLY_RECEIPT_PATH,
  PRIVATE_RECOVERY_ACQUISITION_BEFORE_COUNT,
  PRIVATE_RECOVERY_ACQUISITION_DEFAULT_PLAN_PATH,
  PRIVATE_RECOVERY_ACQUISITION_REGISTER_PATH,
  PRIVATE_RECOVERY_ACQUISITION_SOURCE_PLAN_PATH,
  buildPrivateRecoveryAcquisitionPlan,
  canonicalPrivateRecoveryJson,
  privateRecoveryAcquisitionOutputFiles,
  privateRecoveryAcquisitionStrongAck,
  privateRecoveryFileBinding,
  privateRecoverySha256,
  serializePrivateRecoveryJson,
  validatePrivateRecoveryAcquisitionPlan,
  validatePrivateRecoveryDatabaseAuditBinding,
  validatePrivateRecoveryRegister,
  type PrivateRecoveryAcquisitionPlan,
  type PrivateRecoveryDatabaseAuditBinding,
  type PrivateRecoveryImplementationBinding,
  type VerifiedPrivateCopyPair,
} from "../../src/lib/knowledge/private-recovery-acquisition";
import {
  SourceRegistrationControlledMutationAuditSchema,
  sourceRegistrationApplyTargetSetSha256,
  type SourceRegistrationControlledMutationAudit,
} from "../../src/lib/knowledge/source-registration-apply";
import {
  validateSourceRegistrationPlan,
  type SourceRegistrationPlan,
} from "../../src/lib/knowledge/source-registration-plan";

const O_NOFOLLOW = constants.O_NOFOLLOW ?? 0;
const JOURNAL_PATH =
  "knowledge/corpus/private-recovery-acquisition/.private-recovery-acquisition-journal.v1.json";
const LOCK_PATH =
  "knowledge/corpus/private-recovery-acquisition/.private-recovery-acquisition.lock";
const PRIMARY_ROOT_ID = "private_primary";
const REPLICA_ROOT_ID = "bigbrain_private_replica";

const IMPLEMENTATION_PATHS: Array<{
  role: PrivateRecoveryImplementationBinding["role"];
  path: string;
}> = [
  {
    role: "private_recovery_runtime",
    path: "src/lib/knowledge/private-recovery-acquisition.ts",
  },
  {
    role: "private_recovery_runner",
    path: "scripts/knowledge/manage-private-recovery-acquisition.ts",
  },
  {
    role: "private_recovery_plan_schema",
    path: "knowledge/schema/private-recovery-acquisition-plan.schema.v1.json",
  },
  {
    role: "private_recovery_apply_schema",
    path: "knowledge/schema/private-recovery-acquisition-apply-receipt.schema.v1.json",
  },
  {
    role: "private_recovery_contract",
    path: "knowledge/corpus/PRIVATE-RECOVERY-ACQUISITION-CONTRACT.md",
  },
  {
    role: "source_acquisition_runtime",
    path: "src/lib/knowledge/source-acquisition-receipt.ts",
  },
  {
    role: "source_acquisition_schema",
    path: "knowledge/schema/source-acquisition-receipt.schema.v1.json",
  },
  {
    role: "source_registration_plan_runtime",
    path: "src/lib/knowledge/source-registration-plan.ts",
  },
  {
    role: "source_registration_apply_runtime",
    path: "src/lib/knowledge/source-registration-apply.ts",
  },
  {
    role: "source_registration_apply_runner",
    path: "scripts/knowledge/apply-source-registration-plan.ts",
  },
];

const portablePathSchema = z
  .string()
  .regex(/^[a-z0-9][a-zA-Z0-9._/-]*$/)
  .refine(
    (value) =>
      !value.startsWith("/") &&
      !value.includes("\\") &&
      value.split("/").every((segment) => !["", ".", ".."].includes(segment)),
    "Expected a normalized portable relative path",
  );

const journalSchema = z
  .object({
    schemaVersion: z.literal("private-recovery-acquisition-journal-v1"),
    operationKey: z.string().startsWith("private-recovery-acquisition-v1:"),
    planSha256: z.string().regex(/^sha256:[a-f0-9]{64}$/),
    planFileSha256: z.string().regex(/^sha256:[a-f0-9]{64}$/),
    state: z.literal("in_progress"),
    outputCount: z.literal(12),
  })
  .strict();

type Journal = z.infer<typeof journalSchema>;

const lockSchema = z
  .object({
    schemaVersion: z.literal("private-recovery-acquisition-lock-v1"),
    operationKey: z.string().startsWith("private-recovery-acquisition-v1:"),
    pid: z.number().int().positive(),
  })
  .strict();

export type PrivateRecoveryAcquisitionCliOptions = {
  mode: "check" | "plan" | "apply" | "recover_stale_lock";
  projectRoot: string;
  planPath: string;
  databaseUrl?: string;
  primaryCorpusRoot?: string;
  replicaCorpusRoot?: string;
  observedAt?: string;
  acknowledgement?: string;
  expectedPlanSha256?: string;
};

function fail(message: string): never {
  throw new Error(`Private-recovery acquisition manager failed: ${message}`);
}

function valueAfterEquals(argument: string, name: string): string | undefined {
  const prefix = `${name}=`;
  return argument.startsWith(prefix)
    ? argument.slice(prefix.length)
    : undefined;
}

export function parsePrivateRecoveryAcquisitionArgs(
  argv: string[],
  defaultProjectRoot = process.cwd(),
  environment: Record<string, string | undefined> = process.env,
): PrivateRecoveryAcquisitionCliOptions {
  let mode: PrivateRecoveryAcquisitionCliOptions["mode"] = "check";
  let projectRoot = defaultProjectRoot;
  let planPath: string = PRIVATE_RECOVERY_ACQUISITION_DEFAULT_PLAN_PATH;
  const databaseUrl = environment.DATABASE_URL;
  let primaryCorpusRoot: string | undefined;
  let replicaCorpusRoot: string | undefined;
  let observedAt: string | undefined;
  let acknowledgement: string | undefined;
  let expectedPlanSha256: string | undefined;
  let explicitModes = 0;

  for (const argument of argv) {
    if (argument === "--check") {
      mode = "check";
      explicitModes += 1;
      continue;
    }
    if (argument === "--plan") {
      mode = "plan";
      explicitModes += 1;
      continue;
    }
    if (argument === "--apply") {
      mode = "apply";
      explicitModes += 1;
      continue;
    }
    if (argument === "--recover-stale-lock") {
      mode = "recover_stale_lock";
      explicitModes += 1;
      continue;
    }
    const projectRootValue = valueAfterEquals(argument, "--project-root");
    if (projectRootValue !== undefined) {
      projectRoot = projectRootValue;
      continue;
    }
    const planPathValue = valueAfterEquals(argument, "--plan-path");
    if (planPathValue !== undefined) {
      planPath = portablePathSchema.parse(planPathValue);
      continue;
    }
    const primaryValue = valueAfterEquals(argument, "--primary-corpus-root");
    if (primaryValue !== undefined) {
      primaryCorpusRoot = primaryValue;
      continue;
    }
    const replicaValue = valueAfterEquals(argument, "--replica-corpus-root");
    if (replicaValue !== undefined) {
      replicaCorpusRoot = replicaValue;
      continue;
    }
    const observedAtValue = valueAfterEquals(argument, "--observed-at");
    if (observedAtValue !== undefined) {
      observedAt = observedAtValue;
      continue;
    }
    const acknowledgementValue = valueAfterEquals(argument, "--ack");
    if (acknowledgementValue !== undefined) {
      acknowledgement = acknowledgementValue;
      continue;
    }
    const planHashValue = valueAfterEquals(argument, "--expected-plan-sha256");
    if (planHashValue !== undefined) {
      expectedPlanSha256 = planHashValue;
      continue;
    }
    fail(`unknown argument ${argument}`);
  }
  if (explicitModes > 1) fail("choose exactly one operation mode");
  if (!isAbsolute(projectRoot)) fail("--project-root must be absolute");
  if (["plan", "check", "apply"].includes(mode)) {
    if (!databaseUrl) fail(`${mode} requires DATABASE_URL in the environment`);
    if (!primaryCorpusRoot || !isAbsolute(primaryCorpusRoot)) {
      fail(`${mode} requires explicit absolute --primary-corpus-root`);
    }
    if (!replicaCorpusRoot || !isAbsolute(replicaCorpusRoot)) {
      fail(`${mode} requires explicit absolute --replica-corpus-root`);
    }
  }
  if (mode === "apply") {
    if (!acknowledgement) fail("apply requires --ack=<strong acknowledgement>");
    if (!expectedPlanSha256?.match(/^sha256:[a-f0-9]{64}$/)) {
      fail("apply requires --expected-plan-sha256=sha256:<64 lowercase hex>");
    }
  } else if (acknowledgement || expectedPlanSha256) {
    fail("apply-only authorization flags cannot be supplied in read-only mode");
  }
  return {
    mode,
    projectRoot,
    planPath,
    databaseUrl,
    primaryCorpusRoot,
    replicaCorpusRoot,
    observedAt,
    acknowledgement,
    expectedPlanSha256,
  };
}

function canonicalProjectRoot(projectRoot: string): string {
  if (!isAbsolute(projectRoot)) fail("project root must be absolute");
  const real = realpathSync(projectRoot);
  const stats = lstatSync(real);
  if (!stats.isDirectory() || stats.isSymbolicLink()) {
    fail("project root must be a real directory");
  }
  return real;
}

function assertInside(root: string, candidate: string): void {
  const relation = relative(root, candidate);
  if (
    relation === "" ||
    (!relation.startsWith(`..${sep}`) &&
      relation !== ".." &&
      !isAbsolute(relation))
  ) {
    return;
  }
  fail("path escapes its controlled root");
}

function resolveProjectPath(projectRoot: string, portablePath: string): string {
  portablePathSchema.parse(portablePath);
  const root = canonicalProjectRoot(projectRoot);
  const target = resolve(root, portablePath);
  assertInside(root, target);
  return target;
}

function assertExistingAncestorsSafe(root: string, target: string): Stats {
  assertInside(root, target);
  const rootStats = lstatSync(root);
  if (
    !rootStats.isDirectory() ||
    rootStats.isSymbolicLink() ||
    realpathSync(root) !== root
  ) {
    fail(`controlled root is no longer a canonical directory: ${root}`);
  }
  const relation = relative(root, target);
  let cursor = root;
  for (const segment of relation.split(sep).filter(Boolean)) {
    cursor = join(cursor, segment);
    if (!existsSync(cursor)) break;
    const stats = lstatSync(cursor);
    if (stats.isSymbolicLink())
      fail(`symlink path component rejected: ${cursor}`);
  }
  return rootStats;
}

function ensureSafeParentDirectory(
  projectRoot: string,
  portablePath: string,
): string {
  const root = canonicalProjectRoot(projectRoot);
  const target = resolveProjectPath(root, portablePath);
  const parent = dirname(target);
  assertInside(root, parent);
  const relation = relative(root, parent);
  let cursor = root;
  for (const segment of relation.split(sep).filter(Boolean)) {
    cursor = join(cursor, segment);
    if (!existsSync(cursor)) {
      mkdirSync(cursor, { mode: 0o755 });
      fsyncDirectory(dirname(cursor));
    }
    const stats = lstatSync(cursor);
    if (!stats.isDirectory() || stats.isSymbolicLink()) {
      fail(`unsafe output directory component: ${cursor}`);
    }
  }
  return target;
}

function fsyncDirectory(path: string): void {
  const descriptor = openSync(path, constants.O_RDONLY | O_NOFOLLOW);
  try {
    fsyncSync(descriptor);
  } finally {
    closeSync(descriptor);
  }
}

function readDescriptorFully(descriptor: number, size: number): Buffer {
  const result = Buffer.alloc(size);
  let offset = 0;
  while (offset < size) {
    const count = readSync(descriptor, result, offset, size - offset, offset);
    if (count === 0) fail("file changed while being read");
    offset += count;
  }
  return result;
}

type StableRegularFileMetadata = {
  dev: number;
  ino: number;
  mode: number;
  nlink: number;
  size: number;
  mtimeMs: number;
  ctimeMs: number;
};

function regularFileMetadata(stats: Stats): StableRegularFileMetadata {
  return {
    dev: stats.dev,
    ino: stats.ino,
    mode: stats.mode,
    nlink: stats.nlink,
    size: stats.size,
    mtimeMs: stats.mtimeMs,
    ctimeMs: stats.ctimeMs,
  };
}

function assertRegularFileMetadataUnchanged(input: {
  path: string;
  phase: string;
  expected: StableRegularFileMetadata;
  actual: Stats;
}): void {
  if (
    !input.actual.isFile() ||
    JSON.stringify(regularFileMetadata(input.actual)) !==
      JSON.stringify(input.expected)
  ) {
    fail(`file metadata changed ${input.phase}: ${input.path}`);
  }
}

function readRegularFileNoFollow(input: {
  root: string;
  path: string;
  requireSingleLink: boolean;
  requiredMode?: number;
  testOnlyAfterOpenVerificationHook?: () => void;
}): { bytes: Buffer; stats: Stats } {
  const suppliedRoot = resolve(input.root);
  const root = realpathSync(suppliedRoot);
  if (root !== suppliedRoot) {
    fail(`controlled root must not traverse a symlink: ${input.root}`);
  }
  const rootBefore = assertExistingAncestorsSafe(root, input.path);
  const before = lstatSync(input.path);
  if (!before.isFile() || before.isSymbolicLink())
    fail("expected a regular file");
  if (input.requireSingleLink && before.nlink !== 1) {
    fail(`hard-linked file rejected: ${input.path}`);
  }
  if (
    input.requiredMode !== undefined &&
    (before.mode & 0o777) !== input.requiredMode
  ) {
    fail(
      `file mode for ${input.path} must be ${input.requiredMode.toString(8).padStart(4, "0")}`,
    );
  }
  const expectedMetadata = regularFileMetadata(before);
  const descriptor = openSync(input.path, constants.O_RDONLY | O_NOFOLLOW);
  try {
    const opened = fstatSync(descriptor);
    assertRegularFileMetadataUnchanged({
      path: input.path,
      phase: "during safe open",
      expected: expectedMetadata,
      actual: opened,
    });
    input.testOnlyAfterOpenVerificationHook?.();
    const bytes = readDescriptorFully(descriptor, opened.size);
    const after = fstatSync(descriptor);
    assertRegularFileMetadataUnchanged({
      path: input.path,
      phase: "while being hashed",
      expected: expectedMetadata,
      actual: after,
    });
    const pathAfter = lstatSync(input.path);
    assertRegularFileMetadataUnchanged({
      path: input.path,
      phase: "before closing the verified path",
      expected: expectedMetadata,
      actual: pathAfter,
    });
    const rootAfter = assertExistingAncestorsSafe(root, input.path);
    if (
      rootBefore.dev !== rootAfter.dev ||
      rootBefore.ino !== rootAfter.ino ||
      (rootBefore.mode & 0o777) !== (rootAfter.mode & 0o777)
    ) {
      fail(`controlled root changed while reading: ${root}`);
    }
    return { bytes, stats: after };
  } finally {
    closeSync(descriptor);
  }
}

export function readSafeProjectFile(
  projectRoot: string,
  portablePath: string,
): Buffer {
  const root = canonicalProjectRoot(projectRoot);
  const target = resolveProjectPath(root, portablePath);
  return readRegularFileNoFollow({
    root,
    path: target,
    requireSingleLink: true,
  }).bytes;
}

type PrivateRoot = {
  path: string;
  id: string;
  storageClass: string;
  device: string;
  inode: string;
  mode: string;
  nlink: number;
  size: number;
  mtimeMs: number;
  ctimeMs: number;
};

function pathIsSameOrNested(parent: string, candidate: string): boolean {
  const relation = relative(parent, candidate);
  return (
    relation === "" ||
    (!relation.startsWith(`..${sep}`) &&
      relation !== ".." &&
      !isAbsolute(relation))
  );
}

function assertPrivateRootBoundaries(input: {
  projectRoot: string;
  primaryRoot: PrivateRoot;
  replicaRoot: PrivateRoot;
}): void {
  for (const privateRoot of [input.primaryRoot, input.replicaRoot]) {
    if (
      pathIsSameOrNested(input.projectRoot, privateRoot.path) ||
      pathIsSameOrNested(privateRoot.path, input.projectRoot)
    ) {
      fail(
        `private corpus root ${privateRoot.id} must be outside and non-overlapping with the project root`,
      );
    }
  }
  if (
    pathIsSameOrNested(input.primaryRoot.path, input.replicaRoot.path) ||
    pathIsSameOrNested(input.replicaRoot.path, input.primaryRoot.path)
  ) {
    fail("primary and replica corpus roots must not be nested");
  }
}

function assertPrivateRootUnchanged(
  before: PrivateRoot,
  after: PrivateRoot,
): void {
  if (
    before.path !== after.path ||
    before.device !== after.device ||
    before.inode !== after.inode ||
    before.mode !== after.mode ||
    before.nlink !== after.nlink ||
    before.size !== after.size ||
    before.mtimeMs !== after.mtimeMs ||
    before.ctimeMs !== after.ctimeMs
  ) {
    fail(`private corpus root ${before.id} changed during copy verification`);
  }
}

function inspectPrivateRoot(input: {
  path: string;
  id: string;
  storageClass: string;
}): PrivateRoot {
  if (!isAbsolute(input.path)) fail("private corpus roots must be absolute");
  const resolved = resolve(input.path);
  const real = realpathSync(resolved);
  if (real !== resolved) fail("private corpus root cannot traverse a symlink");
  const stats = lstatSync(real);
  if (!stats.isDirectory() || stats.isSymbolicLink()) {
    fail("private corpus root must be a real directory");
  }
  if ((stats.mode & 0o777) !== 0o700) {
    fail(`private corpus root ${input.id} must have mode 0700`);
  }
  return {
    ...input,
    path: real,
    device: String(stats.dev),
    inode: String(stats.ino),
    mode: (stats.mode & 0o777).toString(8).padStart(4, "0"),
    nlink: stats.nlink,
    size: stats.size,
    mtimeMs: stats.mtimeMs,
    ctimeMs: stats.ctimeMs,
  };
}

export type PrivateRecoveryLeafVerification = {
  contentSha256: string;
  sizeBytes: number;
  device: string;
  inode: string;
  mode: number;
  nlink: number;
  mtimeMs: number;
  ctimeMs: number;
};

export function readPrivateRecoveryLeaf(input: {
  rootPath: string;
  portablePath: string;
  expectedSha256: string;
  expectedSizeBytes: number;
  /** Unit-test fault injection used to prove the post-open metadata gate. */
  testOnlyAfterOpenVerificationHook?: () => void;
}): PrivateRecoveryLeafVerification {
  portablePathSchema.parse(input.portablePath);
  const root = realpathSync(input.rootPath);
  const target = resolve(root, input.portablePath);
  assertInside(root, target);
  const { bytes, stats } = readRegularFileNoFollow({
    root,
    path: target,
    requireSingleLink: true,
    requiredMode: 0o400,
    testOnlyAfterOpenVerificationHook: input.testOnlyAfterOpenVerificationHook,
  });
  const contentSha256 = privateRecoverySha256(bytes);
  if (
    contentSha256 !== input.expectedSha256 ||
    bytes.length !== input.expectedSizeBytes
  ) {
    fail(
      `private leaf ${input.portablePath} differs from the exact content binding`,
    );
  }
  return {
    contentSha256,
    sizeBytes: bytes.length,
    device: String(stats.dev),
    inode: String(stats.ino),
    mode: stats.mode & 0o777,
    nlink: stats.nlink,
    mtimeMs: stats.mtimeMs,
    ctimeMs: stats.ctimeMs,
  };
}

export type PrivateRecoveryLeafBatchInput = {
  leafId: string;
  rootPath: string;
  portablePath: string;
  expectedSha256: string;
  expectedSizeBytes: number;
};

export function readAndRevalidatePrivateRecoveryLeafBatch(input: {
  leaves: PrivateRecoveryLeafBatchInput[];
  /** Unit-test fault injection used to prove the collective final barrier. */
  testOnlyAfterInitialVerificationHook?: () => void;
}): Map<string, PrivateRecoveryLeafVerification> {
  if (
    input.leaves.length === 0 ||
    new Set(input.leaves.map((leaf) => leaf.leafId)).size !==
      input.leaves.length
  ) {
    fail("private leaf batch must contain unique leaf IDs");
  }
  const first = new Map(
    input.leaves.map((leaf) => [
      leaf.leafId,
      readPrivateRecoveryLeaf({
        rootPath: leaf.rootPath,
        portablePath: leaf.portablePath,
        expectedSha256: leaf.expectedSha256,
        expectedSizeBytes: leaf.expectedSizeBytes,
      }),
    ]),
  );
  input.testOnlyAfterInitialVerificationHook?.();
  for (const leaf of input.leaves) {
    const current = readPrivateRecoveryLeaf({
      rootPath: leaf.rootPath,
      portablePath: leaf.portablePath,
      expectedSha256: leaf.expectedSha256,
      expectedSizeBytes: leaf.expectedSizeBytes,
    });
    if (JSON.stringify(first.get(leaf.leafId)) !== JSON.stringify(current)) {
      fail(
        `private leaf changed before the collective barrier: ${leaf.leafId}`,
      );
    }
  }
  return first;
}

export function verifyPrivateRecoveryCopies(input: {
  projectRoot: string;
  sourceRegistrationPlan: SourceRegistrationPlan;
  primaryCorpusRoot: string;
  replicaCorpusRoot: string;
  observedAt: string;
  /** Unit-test fault injection used to prove the 20-file final barrier. */
  testOnlyAfterInitialCopyVerificationHook?: () => void;
}): VerifiedPrivateCopyPair[] {
  const projectRoot = canonicalProjectRoot(input.projectRoot);
  const plan = validateSourceRegistrationPlan(input.sourceRegistrationPlan);
  const observedAt = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/)
    .parse(input.observedAt);
  const primaryRoot = inspectPrivateRoot({
    path: input.primaryCorpusRoot,
    id: PRIMARY_ROOT_ID,
    storageClass: "private_primary",
  });
  const replicaRoot = inspectPrivateRoot({
    path: input.replicaCorpusRoot,
    id: REPLICA_ROOT_ID,
    storageClass: "bigbrain_private_archive",
  });
  assertPrivateRootBoundaries({ projectRoot, primaryRoot, replicaRoot });
  if (
    primaryRoot.device === replicaRoot.device &&
    primaryRoot.inode === replicaRoot.inode
  ) {
    fail("primary and replica corpus roots must be distinct directories");
  }
  const leafInputs = plan.targets.flatMap((target) => {
    const row = target.intendedPrivateRecoveryRow;
    const portablePath =
      target.artifactEvidence.privateVerification.rawPdfPortablePath;
    if (portablePath !== `sha256/${row.sha256}.pdf`) {
      fail(
        `${target.targetId}: source plan raw PDF path and recovery row differ`,
      );
    }
    const expectedSha256 = `sha256:${row.sha256}`;
    return [
      {
        leafId: `${target.targetId}:primary`,
        rootPath: primaryRoot.path,
        portablePath,
        expectedSha256,
        expectedSizeBytes: row.sizeBytes,
      },
      {
        leafId: `${target.targetId}:replica`,
        rootPath: replicaRoot.path,
        portablePath,
        expectedSha256,
        expectedSizeBytes: row.sizeBytes,
      },
    ];
  });
  const physicalCopies = readAndRevalidatePrivateRecoveryLeafBatch({
    leaves: leafInputs,
    testOnlyAfterInitialVerificationHook:
      input.testOnlyAfterInitialCopyVerificationHook,
  });
  const copies: VerifiedPrivateCopyPair[] = plan.targets.map((target) => {
    const row = target.intendedPrivateRecoveryRow;
    const portablePath =
      target.artifactEvidence.privateVerification.rawPdfPortablePath;
    const expectedSha256 = `sha256:${row.sha256}`;
    const primary = physicalCopies.get(`${target.targetId}:primary`)!;
    const replica = physicalCopies.get(`${target.targetId}:replica`)!;
    if (primary.device === replica.device && primary.inode === replica.inode) {
      fail(`${target.targetId}: primary and replica resolve to the same file`);
    }
    return {
      targetId: target.targetId,
      lifecycleSourceId: target.lifecycleSourceId,
      primary: {
        copyId: "primary",
        storageRootId: primaryRoot.id,
        storageClass: primaryRoot.storageClass,
        locator: `private://primary/${portablePath}`,
        portablePath,
        contentSha256: expectedSha256,
        sizeBytes: row.sizeBytes,
        fileMode: "0400",
        verifiedAt: observedAt,
      },
      replica: {
        copyId: "replica",
        storageRootId: replicaRoot.id,
        storageClass: replicaRoot.storageClass,
        locator: `private://replica/${portablePath}`,
        portablePath,
        contentSha256: expectedSha256,
        sizeBytes: row.sizeBytes,
        fileMode: "0400",
        verifiedAt: observedAt,
      },
      distinctStorageRoots: true,
      distinctFiles: true,
      contentHashesMatch: true,
      sizesMatch: true,
      rootModes: "0700",
      absoluteRootsStored: false,
    };
  });
  const primaryRootAfter = inspectPrivateRoot({
    path: input.primaryCorpusRoot,
    id: PRIMARY_ROOT_ID,
    storageClass: "private_primary",
  });
  const replicaRootAfter = inspectPrivateRoot({
    path: input.replicaCorpusRoot,
    id: REPLICA_ROOT_ID,
    storageClass: "bigbrain_private_archive",
  });
  assertPrivateRootUnchanged(primaryRoot, primaryRootAfter);
  assertPrivateRootUnchanged(replicaRoot, replicaRootAfter);
  assertPrivateRootBoundaries({
    projectRoot,
    primaryRoot: primaryRootAfter,
    replicaRoot: replicaRootAfter,
  });
  return copies;
}

function currentImplementationBindings(
  projectRoot: string,
): PrivateRecoveryImplementationBinding[] {
  return IMPLEMENTATION_PATHS.map(({ role, path }) => {
    const bytes = readSafeProjectFile(projectRoot, path);
    return { role, ...privateRecoveryFileBinding(path, bytes) };
  }).sort((left, right) => left.role.localeCompare(right.role));
}

function loadSourceRegistrationPlan(projectRoot: string): {
  plan: SourceRegistrationPlan;
  bytes: Buffer;
} {
  const bytes = readSafeProjectFile(
    projectRoot,
    PRIVATE_RECOVERY_ACQUISITION_SOURCE_PLAN_PATH,
  );
  return {
    bytes,
    plan: validateSourceRegistrationPlan(JSON.parse(bytes.toString("utf8"))),
  };
}

function loadRecoveryRegister(projectRoot: string) {
  const bytes = readSafeProjectFile(
    projectRoot,
    PRIVATE_RECOVERY_ACQUISITION_REGISTER_PATH,
  );
  return {
    bytes,
    register: validatePrivateRecoveryRegister(
      JSON.parse(bytes.toString("utf8")),
    ),
  };
}

function canonical(value: unknown): string {
  return canonicalPrivateRecoveryJson(value as never);
}

async function inspectFullSourceRegistrationAfterState(input: {
  projectRoot: string;
  databaseUrl: string;
  primaryCorpusRoot: string;
  replicaCorpusRoot: string;
}) {
  const { inspectReceiptedSourceRegistrationAfterState } =
    await import("./apply-source-registration-plan");
  return inspectReceiptedSourceRegistrationAfterState(input);
}

async function inspectExactSourceRegistrationAfterStateWithoutRegisterBinding(input: {
  projectRoot: string;
  databaseUrl: string;
  primaryCorpusRoot: string;
  replicaCorpusRoot: string;
  sourceRegistrationPlan: SourceRegistrationPlan;
  auditBinding: PrivateRecoveryDatabaseAuditBinding;
}): Promise<SourceRegistrationControlledMutationAudit> {
  const [{ PrismaPg }, { PrismaClient, Prisma }] = await Promise.all([
    import("@prisma/adapter-pg"),
    import("../../src/generated/prisma/client"),
  ]);
  const {
    inspectSourceRegistrationApplyDatabaseState,
    reconstructLockedDocumentContents,
  } = await import("./apply-source-registration-plan");
  const contents = reconstructLockedDocumentContents({
    projectRoot: input.projectRoot,
    primaryCorpusRoot: input.primaryCorpusRoot,
    replicaCorpusRoot: input.replicaCorpusRoot,
    plan: input.sourceRegistrationPlan,
  });
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: input.databaseUrl }),
  });
  try {
    const state = await prisma.$transaction(
      async (transaction) => {
        await transaction.$executeRawUnsafe("SET TRANSACTION READ ONLY");
        return inspectSourceRegistrationApplyDatabaseState({
          tx: transaction,
          plan: input.sourceRegistrationPlan,
          contents,
          operationKey: input.auditBinding.operationKey,
        });
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
        maxWait: 20_000,
        timeout: 180_000,
      },
    );
    if (
      !state.transaction.readOnly ||
      state.targetStates.length !== 10 ||
      state.targetStates.some(
        (target) =>
          target.documentState !== "exact" || target.libraryState !== "exact",
      ) ||
      state.dependencyRows.length !== 0 ||
      state.audits.length !== 1
    ) {
      fail(
        "source-registration database is no longer the exact receipted 10+10 after-state",
      );
    }
    const audit = SourceRegistrationControlledMutationAuditSchema.parse(
      state.audits[0],
    );
    const after = audit.mutationSummary.afterSnapshot;
    if (
      audit.id !== input.auditBinding.auditId ||
      state.databaseIdentityUuid !== input.auditBinding.databaseIdentityUuid ||
      state.completedMigrationCount !== after.completedMigrationCount ||
      state.planStyleMigrationLedgerSha256 !==
        after.planStyleMigrationLedgerSha256 ||
      state.backupStyleMigrationLedgerSha256 !==
        after.backupStyleMigrationLedgerSha256 ||
      state.targetFingerprintSha256 !==
        after.afterApplyTargetFingerprintSha256 ||
      state.dependencyRowsSha256 !== after.dependencyRowsSha256 ||
      state.coreCounts.Document !== after.counts.documents ||
      state.coreCounts.LibraryAnalysisRecord !==
        after.counts.libraryAnalysisRecords ||
      state.coreCounts.ControlledMutationAudit !==
        after.counts.controlledMutationAuditsAfterAppend
    ) {
      fail(
        "source-registration database fingerprint or counts drifted from its exact receipt",
      );
    }
    return audit;
  } finally {
    await prisma.$disconnect();
  }
}

function validatePlanSourceAndImplementation(input: {
  projectRoot: string;
  plan: PrivateRecoveryAcquisitionPlan;
}): SourceRegistrationPlan {
  const source = loadSourceRegistrationPlan(input.projectRoot);
  const currentSourceBinding = {
    ...privateRecoveryFileBinding(
      PRIVATE_RECOVERY_ACQUISITION_SOURCE_PLAN_PATH,
      source.bytes,
    ),
    planSha256: source.plan.planSha256,
    targetSetSha256: `sha256:${sourceRegistrationApplyTargetSetSha256(
      source.plan,
    )}`,
  };
  if (
    canonical(currentSourceBinding) !==
    canonical(input.plan.inputBindings.sourceRegistrationPlan)
  ) {
    fail("source-registration plan input binding drifted");
  }
  const implementation = currentImplementationBindings(input.projectRoot);
  if (
    canonical(implementation) !==
    canonical(input.plan.inputBindings.implementation)
  ) {
    fail("implementation dependency binding drifted");
  }
  input.plan.targets.forEach((target, index) => {
    const sourceTarget = source.plan.targets[index];
    if (
      !sourceTarget ||
      sourceTarget.targetId !== target.targetId ||
      sourceTarget.lifecycleSourceId !== target.lifecycleSourceId ||
      canonical(sourceTarget.intendedPrivateRecoveryRow) !==
        canonical(target.recoveryRow)
    ) {
      fail(`${target.targetId}: source-registration target binding drifted`);
    }
  });
  return source.plan;
}

function validateCurrentCopiesAgainstPlan(input: {
  projectRoot: string;
  plan: PrivateRecoveryAcquisitionPlan;
  sourceRegistrationPlan: SourceRegistrationPlan;
  primaryCorpusRoot: string;
  replicaCorpusRoot: string;
}): void {
  const live = verifyPrivateRecoveryCopies({
    projectRoot: input.projectRoot,
    sourceRegistrationPlan: input.sourceRegistrationPlan,
    primaryCorpusRoot: input.primaryCorpusRoot,
    replicaCorpusRoot: input.replicaCorpusRoot,
    observedAt: new Date().toISOString(),
  });
  live.forEach((copies, index) => {
    const planned = input.plan.targets[index]?.privateCopies;
    if (!planned) fail("private copy plan is incomplete");
    const withoutTime = (value: VerifiedPrivateCopyPair) => ({
      ...value,
      primary: { ...value.primary, verifiedAt: "reverified" },
      replica: { ...value.replica, verifiedAt: "reverified" },
    });
    if (canonical(withoutTime(copies)) !== canonical(withoutTime(planned))) {
      fail(
        `${copies.targetId}: current private copies differ from the frozen plan`,
      );
    }
  });
}

export type FilesystemBundleState = "pending" | "resumable" | "committed";

function expectedJournal(
  plan: PrivateRecoveryAcquisitionPlan,
  planFileSha256: string,
): Journal {
  return journalSchema.parse({
    schemaVersion: "private-recovery-acquisition-journal-v1",
    operationKey: plan.operationKey,
    planSha256: plan.planSha256,
    planFileSha256,
    state: "in_progress",
    outputCount: 12,
  });
}

function readOptionalSafeProjectFile(
  projectRoot: string,
  portablePath: string,
): Buffer | null {
  const target = resolveProjectPath(projectRoot, portablePath);
  if (!existsSync(target)) return null;
  return readSafeProjectFile(projectRoot, portablePath);
}

function exactOrConflict(
  label: string,
  actual: Buffer | null,
  expected: Buffer,
): "absent" | "exact" {
  if (actual === null) return "absent";
  if (actual.equals(expected)) return "exact";
  fail(`${label} exists with conflicting bytes`);
}

function stagePathFor(outputPath: string, operationKey: string): string {
  const digest = createHash("sha256")
    .update(operationKey)
    .digest("hex")
    .slice(0, 16);
  const name = outputPath.slice(outputPath.lastIndexOf("/") + 1);
  return `${dirname(outputPath)}/.${name}.${digest}.stage`;
}

function readPossiblyLinkedStage(
  projectRoot: string,
  portablePath: string,
): Buffer | null {
  const root = canonicalProjectRoot(projectRoot);
  const target = resolveProjectPath(root, portablePath);
  if (!existsSync(target)) return null;
  assertExistingAncestorsSafe(root, target);
  const stats = lstatSync(target);
  if (!stats.isFile() || stats.isSymbolicLink() || stats.nlink > 2) {
    fail(`unsafe transaction stage ${portablePath}`);
  }
  const descriptor = openSync(target, constants.O_RDONLY | O_NOFOLLOW);
  try {
    return readDescriptorFully(descriptor, fstatSync(descriptor).size);
  } finally {
    closeSync(descriptor);
  }
}

function cleanExactTransactionStages(input: {
  projectRoot: string;
  plan: PrivateRecoveryAcquisitionPlan;
}): void {
  for (const output of privateRecoveryAcquisitionOutputFiles(input.plan)) {
    if (output.kind === "register") continue;
    const stagePath = stagePathFor(output.path, input.plan.operationKey);
    const stageBytes = readPossiblyLinkedStage(input.projectRoot, stagePath);
    if (stageBytes === null) continue;
    if (!stageBytes.equals(output.bytes)) {
      fail(`transaction stage ${stagePath} has conflicting bytes`);
    }
    const absolute = resolveProjectPath(input.projectRoot, stagePath);
    unlinkSync(absolute);
    fsyncDirectory(dirname(absolute));
  }
}

export function classifyPrivateRecoveryFilesystemState(input: {
  projectRoot: string;
  plan: PrivateRecoveryAcquisitionPlan;
  planFileSha256: string;
}): FilesystemBundleState {
  const plan = validatePrivateRecoveryAcquisitionPlan(input.plan);
  const beforeBytes = serializePrivateRecoveryJson(
    plan.recoveryRegister.before.document,
  );
  const afterBytes = serializePrivateRecoveryJson(
    plan.recoveryRegister.after.document,
  );
  const registerBytes = readSafeProjectFile(
    input.projectRoot,
    PRIVATE_RECOVERY_ACQUISITION_REGISTER_PATH,
  );
  const registerState = registerBytes.equals(beforeBytes)
    ? "before"
    : registerBytes.equals(afterBytes)
      ? "after"
      : fail(
          "recovery register matches neither the exact before nor after state",
        );

  const receiptStates = plan.targets.map((target) =>
    exactOrConflict(
      target.acquisitionReceipt.file.path,
      readOptionalSafeProjectFile(
        input.projectRoot,
        target.acquisitionReceipt.file.path,
      ),
      serializePrivateRecoveryJson(target.acquisitionReceipt.receipt),
    ),
  );
  const commitState = exactOrConflict(
    PRIVATE_RECOVERY_ACQUISITION_APPLY_RECEIPT_PATH,
    readOptionalSafeProjectFile(
      input.projectRoot,
      PRIVATE_RECOVERY_ACQUISITION_APPLY_RECEIPT_PATH,
    ),
    serializePrivateRecoveryJson(plan.applyReceipt.receipt),
  );
  const expected = expectedJournal(plan, input.planFileSha256);
  const rawJournal = readOptionalSafeProjectFile(
    input.projectRoot,
    JOURNAL_PATH,
  );
  const journalState =
    rawJournal === null
      ? "absent"
      : canonical(
            journalSchema.parse(JSON.parse(rawJournal.toString("utf8"))),
          ) === canonical(expected)
        ? "exact"
        : fail("transaction journal belongs to another or drifting operation");

  const allReceiptsExact = receiptStates.every((state) => state === "exact");
  const allReceiptsAbsent = receiptStates.every((state) => state === "absent");
  if (commitState === "exact") {
    if (registerState !== "after" || !allReceiptsExact) {
      fail("commit receipt exists without the complete exact file bundle");
    }
    return "committed";
  }
  if (
    registerState === "before" &&
    allReceiptsAbsent &&
    journalState === "absent"
  ) {
    return "pending";
  }
  if (
    journalState === "exact" &&
    (registerState === "before" || registerState === "after")
  ) {
    return "resumable";
  }
  fail("partial exact outputs without their durable journal are a conflict");
}

function writeAllAndSync(descriptor: number, bytes: Buffer): void {
  let offset = 0;
  while (offset < bytes.length) {
    offset += writeSync(
      descriptor,
      bytes,
      offset,
      bytes.length - offset,
      offset,
    );
  }
  fsyncSync(descriptor);
}

function writeDurableJournal(input: {
  projectRoot: string;
  journal: Journal;
}): void {
  const bytes = serializePrivateRecoveryJson(input.journal);
  const target = ensureSafeParentDirectory(input.projectRoot, JOURNAL_PATH);
  if (existsSync(target)) {
    if (!readSafeProjectFile(input.projectRoot, JOURNAL_PATH).equals(bytes)) {
      fail("existing durable journal conflicts with this operation");
    }
    return;
  }
  const descriptor = openSync(
    target,
    constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY | O_NOFOLLOW,
    0o600,
  );
  try {
    writeAllAndSync(descriptor, bytes);
  } finally {
    closeSync(descriptor);
  }
  fsyncDirectory(dirname(target));
}

function acquireLock(input: {
  projectRoot: string;
  operationKey: string;
}): () => void {
  const target = ensureSafeParentDirectory(input.projectRoot, LOCK_PATH);
  const body = serializePrivateRecoveryJson(
    lockSchema.parse({
      schemaVersion: "private-recovery-acquisition-lock-v1",
      operationKey: input.operationKey,
      pid: process.pid,
    }),
  );
  let descriptor: number;
  try {
    descriptor = openSync(
      target,
      constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY | O_NOFOLLOW,
      0o600,
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EEXIST") {
      fail(
        "exclusive apply lock already exists; inspect it or use explicit stale-lock recovery",
      );
    }
    throw error;
  }
  try {
    writeAllAndSync(descriptor, body);
  } finally {
    closeSync(descriptor);
  }
  fsyncDirectory(dirname(target));
  return () => {
    if (existsSync(target)) {
      unlinkSync(target);
      fsyncDirectory(dirname(target));
    }
  };
}

function writeNewOutputDurably(input: {
  projectRoot: string;
  portablePath: string;
  bytes: Buffer;
  operationKey: string;
}): "created" | "exact" {
  const target = ensureSafeParentDirectory(
    input.projectRoot,
    input.portablePath,
  );
  if (existsSync(target)) {
    const existing = readSafeProjectFile(input.projectRoot, input.portablePath);
    if (!existing.equals(input.bytes)) fail(`${input.portablePath} conflicts`);
    return "exact";
  }
  const stagePortable = stagePathFor(input.portablePath, input.operationKey);
  const stage = ensureSafeParentDirectory(input.projectRoot, stagePortable);
  if (existsSync(stage))
    fail(`unexpected stage already exists: ${stagePortable}`);
  const descriptor = openSync(
    stage,
    constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY | O_NOFOLLOW,
    0o644,
  );
  try {
    writeAllAndSync(descriptor, input.bytes);
  } finally {
    closeSync(descriptor);
  }
  fsyncDirectory(dirname(stage));
  try {
    linkSync(stage, target);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
    const existing = readSafeProjectFile(input.projectRoot, input.portablePath);
    if (!existing.equals(input.bytes))
      fail(`${input.portablePath} raced with a conflict`);
  }
  fsyncDirectory(dirname(target));
  unlinkSync(stage);
  fsyncDirectory(dirname(stage));
  const finalBytes = readSafeProjectFile(input.projectRoot, input.portablePath);
  if (!finalBytes.equals(input.bytes))
    fail(`${input.portablePath} failed post-write verification`);
  return "created";
}

function replaceRegisterDurably(input: {
  projectRoot: string;
  plan: PrivateRecoveryAcquisitionPlan;
}): "created" | "exact" {
  const before = serializePrivateRecoveryJson(
    input.plan.recoveryRegister.before.document,
  );
  const after = serializePrivateRecoveryJson(
    input.plan.recoveryRegister.after.document,
  );
  const target = resolveProjectPath(
    input.projectRoot,
    PRIVATE_RECOVERY_ACQUISITION_REGISTER_PATH,
  );
  const current = readSafeProjectFile(
    input.projectRoot,
    PRIVATE_RECOVERY_ACQUISITION_REGISTER_PATH,
  );
  if (current.equals(after)) return "exact";
  if (!current.equals(before))
    fail("recovery-register compare-and-swap failed");
  const stagePortable = stagePathFor(
    PRIVATE_RECOVERY_ACQUISITION_REGISTER_PATH,
    input.plan.operationKey,
  );
  const stage = ensureSafeParentDirectory(input.projectRoot, stagePortable);
  if (existsSync(stage)) {
    const existingStage = readPossiblyLinkedStage(
      input.projectRoot,
      stagePortable,
    );
    if (!existingStage?.equals(after)) {
      fail("recovery-register transaction stage has conflicting bytes");
    }
    unlinkSync(stage);
    fsyncDirectory(dirname(stage));
  }
  const descriptor = openSync(
    stage,
    constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY | O_NOFOLLOW,
    0o644,
  );
  try {
    writeAllAndSync(descriptor, after);
  } finally {
    closeSync(descriptor);
  }
  fsyncDirectory(dirname(stage));
  const compareAgain = readSafeProjectFile(
    input.projectRoot,
    PRIVATE_RECOVERY_ACQUISITION_REGISTER_PATH,
  );
  if (!compareAgain.equals(before)) {
    unlinkSync(stage);
    fsyncDirectory(dirname(stage));
    fail("recovery-register CAS changed immediately before atomic rename");
  }
  renameSync(stage, target);
  fsyncDirectory(dirname(target));
  if (
    !readSafeProjectFile(
      input.projectRoot,
      PRIVATE_RECOVERY_ACQUISITION_REGISTER_PATH,
    ).equals(after)
  ) {
    fail("recovery-register post-rename verification failed");
  }
  return "created";
}

export type ApplyPreparedPrivateRecoveryInput = {
  projectRoot: string;
  plan: PrivateRecoveryAcquisitionPlan;
  planBytes: Buffer;
  reverifyInputs: (state: FilesystemBundleState) => Promise<void>;
  faultAfterStep?: number;
};

export async function applyPreparedPrivateRecoveryAcquisitionPlan(
  input: ApplyPreparedPrivateRecoveryInput,
): Promise<{
  state: "applied" | "resumed" | "receipted_noop";
  filesCreated: number;
}> {
  const plan = validatePrivateRecoveryAcquisitionPlan(input.plan);
  const parsedPlanBytes = validatePrivateRecoveryAcquisitionPlan(
    JSON.parse(input.planBytes.toString("utf8")),
  );
  if (canonical(parsedPlanBytes) !== canonical(plan)) {
    fail("plan bytes and supplied plan differ");
  }
  if (!input.planBytes.equals(serializePrivateRecoveryJson(plan))) {
    fail("plan file does not use the controlled exact serialization");
  }
  const planFileSha256 = privateRecoverySha256(input.planBytes);
  const releaseLock = acquireLock({
    projectRoot: input.projectRoot,
    operationKey: plan.operationKey,
  });
  let filesCreated = 0;
  let step = 0;
  const maybeFault = () => {
    step += 1;
    if (input.faultAfterStep === step) {
      throw new Error(`Injected crash after durable step ${step}`);
    }
  };
  try {
    const journal = expectedJournal(plan, planFileSha256);
    const journalBytes = readOptionalSafeProjectFile(
      input.projectRoot,
      JOURNAL_PATH,
    );
    if (journalBytes !== null) {
      const parsedJournal = journalSchema.parse(
        JSON.parse(journalBytes.toString("utf8")),
      );
      if (canonical(parsedJournal) !== canonical(journal)) {
        fail("existing journal does not bind the exact plan file");
      }
      cleanExactTransactionStages({ projectRoot: input.projectRoot, plan });
    }
    const initialState = classifyPrivateRecoveryFilesystemState({
      projectRoot: input.projectRoot,
      plan,
      planFileSha256,
    });
    await input.reverifyInputs(initialState);
    if (initialState === "committed") {
      if (existsSync(resolveProjectPath(input.projectRoot, JOURNAL_PATH))) {
        unlinkSync(resolveProjectPath(input.projectRoot, JOURNAL_PATH));
        fsyncDirectory(
          dirname(resolveProjectPath(input.projectRoot, JOURNAL_PATH)),
        );
      }
      return { state: "receipted_noop", filesCreated: 0 };
    }
    writeDurableJournal({ projectRoot: input.projectRoot, journal });
    maybeFault();
    for (const target of plan.targets) {
      const state = writeNewOutputDurably({
        projectRoot: input.projectRoot,
        portablePath: target.acquisitionReceipt.file.path,
        bytes: serializePrivateRecoveryJson(target.acquisitionReceipt.receipt),
        operationKey: plan.operationKey,
      });
      if (state === "created") filesCreated += 1;
      maybeFault();
    }
    if (
      replaceRegisterDurably({ projectRoot: input.projectRoot, plan }) ===
      "created"
    ) {
      filesCreated += 1;
    }
    maybeFault();
    if (
      writeNewOutputDurably({
        projectRoot: input.projectRoot,
        portablePath: plan.applyReceipt.file.path,
        bytes: serializePrivateRecoveryJson(plan.applyReceipt.receipt),
        operationKey: plan.operationKey,
      }) === "created"
    ) {
      filesCreated += 1;
    }
    maybeFault();
    const finalState = classifyPrivateRecoveryFilesystemState({
      projectRoot: input.projectRoot,
      plan,
      planFileSha256,
    });
    if (finalState !== "committed") fail("post-apply bundle is not committed");
    const journalPath = resolveProjectPath(input.projectRoot, JOURNAL_PATH);
    unlinkSync(journalPath);
    fsyncDirectory(dirname(journalPath));
    return {
      state: initialState === "pending" ? "applied" : "resumed",
      filesCreated,
    };
  } finally {
    releaseLock();
  }
}

function writePlanExact(input: {
  projectRoot: string;
  planPath: string;
  bytes: Buffer;
  operationKey: string;
}): "created" | "exact" {
  const stagePath = stagePathFor(input.planPath, input.operationKey);
  const staged = readPossiblyLinkedStage(input.projectRoot, stagePath);
  if (staged !== null) {
    if (!staged.equals(input.bytes)) {
      fail("plan transaction stage contains different bytes");
    }
    const stageAbsolute = resolveProjectPath(input.projectRoot, stagePath);
    unlinkSync(stageAbsolute);
    fsyncDirectory(dirname(stageAbsolute));
  }
  return writeNewOutputDurably({
    projectRoot: input.projectRoot,
    portablePath: input.planPath,
    bytes: input.bytes,
    operationKey: input.operationKey,
  });
}

function loadAcquisitionPlan(
  projectRoot: string,
  planPath: string,
): {
  plan: PrivateRecoveryAcquisitionPlan;
  bytes: Buffer;
} {
  const bytes = readSafeProjectFile(projectRoot, planPath);
  const plan = validatePrivateRecoveryAcquisitionPlan(
    JSON.parse(bytes.toString("utf8")),
  );
  if (!bytes.equals(serializePrivateRecoveryJson(plan))) {
    fail("plan file does not use the controlled exact serialization");
  }
  return {
    bytes,
    plan,
  };
}

async function verifyLivePlanInputs(input: {
  projectRoot: string;
  plan: PrivateRecoveryAcquisitionPlan;
  databaseUrl: string;
  primaryCorpusRoot: string;
  replicaCorpusRoot: string;
  filesystemState: FilesystemBundleState;
}): Promise<void> {
  const sourcePlan = validatePlanSourceAndImplementation({
    projectRoot: input.projectRoot,
    plan: input.plan,
  });
  validateCurrentCopiesAgainstPlan({
    projectRoot: input.projectRoot,
    plan: input.plan,
    sourceRegistrationPlan: sourcePlan,
    primaryCorpusRoot: input.primaryCorpusRoot,
    replicaCorpusRoot: input.replicaCorpusRoot,
  });
  let audit: SourceRegistrationControlledMutationAudit;
  if (input.filesystemState === "pending") {
    const observation = await inspectFullSourceRegistrationAfterState({
      projectRoot: input.projectRoot,
      databaseUrl: input.databaseUrl,
      primaryCorpusRoot: input.primaryCorpusRoot,
      replicaCorpusRoot: input.replicaCorpusRoot,
    });
    audit = observation.audit;
  } else {
    audit =
      await inspectExactSourceRegistrationAfterStateWithoutRegisterBinding({
        projectRoot: input.projectRoot,
        databaseUrl: input.databaseUrl,
        primaryCorpusRoot: input.primaryCorpusRoot,
        replicaCorpusRoot: input.replicaCorpusRoot,
        sourceRegistrationPlan: sourcePlan,
        auditBinding: input.plan.inputBindings.sourceRegistrationApplyAudit,
      });
  }
  validatePrivateRecoveryDatabaseAuditBinding({
    binding: input.plan.inputBindings.sourceRegistrationApplyAudit,
    audit,
    sourceRegistrationPlan: sourcePlan,
  });
}

async function generatePlan(options: PrivateRecoveryAcquisitionCliOptions) {
  const projectRoot = canonicalProjectRoot(options.projectRoot);
  const observedAt = options.observedAt ?? new Date().toISOString();
  const observedTime = Date.parse(observedAt);
  if (
    !Number.isFinite(observedTime) ||
    Math.abs(Date.now() - observedTime) > 5 * 60 * 1_000
  ) {
    fail(
      "--observed-at must be a truthful UTC time within five minutes of now",
    );
  }
  const source = loadSourceRegistrationPlan(projectRoot);
  const before = loadRecoveryRegister(projectRoot);
  if (
    before.register.candidates.length !==
    PRIVATE_RECOVERY_ACQUISITION_BEFORE_COUNT
  ) {
    fail("plan generation requires the exact 11-row recovery baseline");
  }
  const copies = verifyPrivateRecoveryCopies({
    projectRoot,
    sourceRegistrationPlan: source.plan,
    primaryCorpusRoot: options.primaryCorpusRoot!,
    replicaCorpusRoot: options.replicaCorpusRoot!,
    observedAt,
  });
  const observation = await inspectFullSourceRegistrationAfterState({
    projectRoot,
    databaseUrl: options.databaseUrl!,
    primaryCorpusRoot: options.primaryCorpusRoot!,
    replicaCorpusRoot: options.replicaCorpusRoot!,
  });
  const plan = buildPrivateRecoveryAcquisitionPlan({
    preparedAt: observedAt,
    sourceRegistrationPlan: source.plan,
    sourceRegistrationPlanBytes: source.bytes,
    sourceRegistrationAudit: observation.audit,
    beforeRegister: before.register,
    beforeRegisterBytes: before.bytes,
    privateCopies: copies,
    implementationBindings: currentImplementationBindings(projectRoot),
  });
  const bytes = serializePrivateRecoveryJson(plan);
  const writeState = writePlanExact({
    projectRoot,
    planPath: options.planPath,
    bytes,
    operationKey: plan.operationKey,
  });
  return {
    mode: "plan" as const,
    writeState,
    planPath: options.planPath,
    planSha256: plan.planSha256,
    planFileSha256: privateRecoverySha256(bytes),
    operationKey: plan.operationKey,
    targetCount: plan.summary.targetCount,
    beforeCandidateCount: plan.summary.beforeCandidateCount,
    afterCandidateCount: plan.summary.afterCandidateCount,
    applyAcknowledgement: privateRecoveryAcquisitionStrongAck(plan),
  };
}

async function checkPlan(options: PrivateRecoveryAcquisitionCliOptions) {
  const projectRoot = canonicalProjectRoot(options.projectRoot);
  const loaded = loadAcquisitionPlan(projectRoot, options.planPath);
  const state = classifyPrivateRecoveryFilesystemState({
    projectRoot,
    plan: loaded.plan,
    planFileSha256: privateRecoverySha256(loaded.bytes),
  });
  await verifyLivePlanInputs({
    projectRoot,
    plan: loaded.plan,
    databaseUrl: options.databaseUrl!,
    primaryCorpusRoot: options.primaryCorpusRoot!,
    replicaCorpusRoot: options.replicaCorpusRoot!,
    filesystemState: state,
  });
  return {
    mode: "check" as const,
    state,
    planPath: options.planPath,
    planSha256: loaded.plan.planSha256,
    planFileSha256: privateRecoverySha256(loaded.bytes),
    operationKey: loaded.plan.operationKey,
    databaseWrites: 0,
    rebaselineRuns: 0,
    applyAcknowledgement: privateRecoveryAcquisitionStrongAck(loaded.plan),
  };
}

async function applyPlan(options: PrivateRecoveryAcquisitionCliOptions) {
  const projectRoot = canonicalProjectRoot(options.projectRoot);
  const loaded = loadAcquisitionPlan(projectRoot, options.planPath);
  if (options.expectedPlanSha256 !== loaded.plan.planSha256) {
    fail("--expected-plan-sha256 differs from the exact plan self-hash");
  }
  if (
    options.acknowledgement !== privateRecoveryAcquisitionStrongAck(loaded.plan)
  ) {
    fail("strong apply acknowledgement differs from the exact plan");
  }
  const result = await applyPreparedPrivateRecoveryAcquisitionPlan({
    projectRoot,
    plan: loaded.plan,
    planBytes: loaded.bytes,
    reverifyInputs: async (filesystemState) =>
      verifyLivePlanInputs({
        projectRoot,
        plan: loaded.plan,
        databaseUrl: options.databaseUrl!,
        primaryCorpusRoot: options.primaryCorpusRoot!,
        replicaCorpusRoot: options.replicaCorpusRoot!,
        filesystemState,
      }),
  });
  return {
    mode: "apply" as const,
    ...result,
    planSha256: loaded.plan.planSha256,
    operationKey: loaded.plan.operationKey,
    databaseWrites: 0,
    rebaselineRuns: 0,
  };
}

function processExists(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return (error as NodeJS.ErrnoException).code === "EPERM";
  }
}

function recoverStaleLock(options: PrivateRecoveryAcquisitionCliOptions) {
  const projectRoot = canonicalProjectRoot(options.projectRoot);
  const loaded = loadAcquisitionPlan(projectRoot, options.planPath);
  const bytes = readSafeProjectFile(projectRoot, LOCK_PATH);
  const lock = lockSchema.parse(JSON.parse(bytes.toString("utf8")));
  if (lock.operationKey !== loaded.plan.operationKey) {
    fail("lock belongs to another operation");
  }
  if (processExists(lock.pid)) fail("lock owner process is still alive");
  const absolute = resolveProjectPath(projectRoot, LOCK_PATH);
  unlinkSync(absolute);
  fsyncDirectory(dirname(absolute));
  return {
    mode: "recover_stale_lock" as const,
    recovered: true,
    operationKey: lock.operationKey,
    pid: lock.pid,
  };
}

export async function runPrivateRecoveryAcquisitionManager(
  options: PrivateRecoveryAcquisitionCliOptions,
) {
  if (options.mode === "plan") return generatePlan(options);
  if (options.mode === "check") return checkPlan(options);
  if (options.mode === "apply") return applyPlan(options);
  return recoverStaleLock(options);
}

const isDirectExecution =
  process.argv[1] !== undefined &&
  resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url));

if (isDirectExecution) {
  runPrivateRecoveryAcquisitionManager(
    parsePrivateRecoveryAcquisitionArgs(process.argv.slice(2)),
  )
    .then((result) => {
      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    })
    .catch((error: unknown) => {
      process.stderr.write(
        `${error instanceof Error ? error.message : String(error)}\n`,
      );
      process.exitCode = 1;
    });
}
