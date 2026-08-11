import { createHash, randomUUID } from "node:crypto";
import {
  closeSync,
  constants,
  fchmodSync,
  fstatSync,
  fsyncSync,
  linkSync,
  lstatSync,
  openSync,
  readFileSync,
  realpathSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import type { BigIntStats } from "node:fs";
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

import Ajv2020 from "ajv/dist/2020";

import {
  SOURCE_REGISTRATION_APPLY_PLAN_PATH,
  sourceRegistrationApplyBareSha256,
} from "../../src/lib/knowledge/source-registration-apply";
import {
  validateSourceRegistrationLogicalCloneRehearsalReceipt,
  validateSourceRegistrationLogicalComparisonProof,
} from "../../src/lib/knowledge/source-registration-logical-clone-rehearsal";
import { canonicalSourceRegistrationJson } from "../../src/lib/knowledge/source-registration-plan";
import {
  loadLockedSourceRegistrationPlan,
  readSourceRegistrationLauncherAttestation,
  reconstructLockedDocumentContents,
  runSourceRegistrationLogicalCloneRehearsal,
  verifyLockedPlanInputs,
} from "./apply-source-registration-plan";

const SHA256_PATTERN = /^[a-f0-9]{64}$/;
const BIGINT_ONE = BigInt(1);
const BIGINT_TWO = BigInt(2);
const PRIVATE_MODE_MASK = BigInt(0o777);
const PRIVATE_PARENT_MODE = BigInt(0o700);
const PRIVATE_RECEIPT_MODE = BigInt(0o400);
const BATCH_PATH =
  "knowledge/corpus/source-registration/source-registration-batch-2026-08-02.v1.json";
const REHEARSAL_PATHS = {
  applyRunner: "scripts/knowledge/apply-source-registration-plan.ts",
  runtime: "src/lib/knowledge/source-registration-logical-clone-rehearsal.ts",
  schema:
    "knowledge/schema/source-registration-logical-clone-rehearsal-receipt.schema.v1.json",
  test: "tests/lib/source-registration-logical-clone-rehearsal.test.ts",
  commandRunner:
    "scripts/knowledge/run-source-registration-logical-clone-rehearsal.ts",
} as const;
const VALUE_FLAGS = {
  "--apply-runner-sha256=": "applyRunner",
  "--rehearsal-runtime-sha256=": "runtime",
  "--rehearsal-schema-sha256=": "schema",
  "--rehearsal-test-sha256=": "test",
  "--rehearsal-command-runner-sha256=": "commandRunner",
} as const;

class ControlledRehearsalRunnerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ControlledRehearsalRunnerError";
  }
}

function fail(message: string): never {
  throw new ControlledRehearsalRunnerError(
    `Source-registration logical-clone rehearsal runner refused: ${message}`,
  );
}

function safeFailure(error: unknown, message: string): Error {
  if (error instanceof ControlledRehearsalRunnerError) return error;
  return new ControlledRehearsalRunnerError(
    `Source-registration logical-clone rehearsal runner refused: ${message}`,
  );
}

export function safeRehearsalRunnerErrorMessage(error: unknown): string {
  if (error instanceof ControlledRehearsalRunnerError) return error.message;
  return "Source-registration logical-clone rehearsal runner refused: controlled rehearsal failed";
}

function sha256File(path: string): string {
  return createHash("sha256").update(readFileSync(path)).digest("hex");
}

function parseCodePins(
  argv: string[],
): Record<keyof typeof REHEARSAL_PATHS, string> {
  const parsed = new Map<string, string>();
  for (const argument of argv) {
    const match = Object.entries(VALUE_FLAGS).find(([prefix]) =>
      argument.startsWith(prefix),
    );
    if (!match) fail("unknown or malformed argument was supplied");
    const [prefix, key] = match;
    if (parsed.has(key)) fail("duplicate code pin was supplied");
    const value = argument.slice(prefix.length);
    if (!SHA256_PATTERN.test(value)) fail("code pin is not a SHA-256");
    parsed.set(key, value);
  }
  if (parsed.size !== Object.keys(REHEARSAL_PATHS).length) {
    fail("exact rehearsal code pins are required");
  }
  return Object.fromEntries(parsed) as Record<
    keyof typeof REHEARSAL_PATHS,
    string
  >;
}

function requiredEnvironment(name: string): string {
  const value = process.env[name];
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    /[\0\r\n]/.test(value)
  ) {
    fail("controlled rehearsal environment is incomplete");
  }
  return value;
}

function readLogicalComparisonProof() {
  const encoded = requiredEnvironment(
    "SOURCE_REGISTRATION_REHEARSAL_LOGICAL_COMPARISON_PROOF_BASE64",
  );
  if (
    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
      encoded,
    )
  ) {
    fail("logical-comparison proof encoding is invalid");
  }
  const bytes = Buffer.from(encoded, "base64");
  if (bytes.toString("base64") !== encoded || bytes.length > 16_384) {
    fail("logical-comparison proof encoding is noncanonical");
  }
  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    fail("logical-comparison proof is not valid UTF-8");
  }
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    fail("logical-comparison proof is not valid JSON");
  }
  const proof = validateSourceRegistrationLogicalComparisonProof(value);
  const canonical = Buffer.from(canonicalSourceRegistrationJson(proof), "utf8");
  if (!canonical.equals(bytes)) {
    fail("logical-comparison proof bytes are not canonical");
  }
  return proof;
}

type PrivateParentIdentity = {
  dev: bigint;
  gid: bigint;
  ino: bigint;
  mode: bigint;
  nlink: bigint;
  uid: bigint;
};

type PrivateFileIdentity = PrivateParentIdentity & {
  mtimeNs: bigint;
  size: bigint;
};

type PrivateOutput = {
  parent: string;
  parentIdentity: PrivateParentIdentity;
  path: string;
  privateReceiptStoredOutsideRepo: true;
};

function parentIdentity(stats: BigIntStats): PrivateParentIdentity {
  return {
    dev: stats.dev,
    gid: stats.gid,
    ino: stats.ino,
    mode: stats.mode,
    nlink: stats.nlink,
    uid: stats.uid,
  };
}

function fileIdentity(stats: BigIntStats): PrivateFileIdentity {
  return {
    ...parentIdentity(stats),
    mtimeNs: stats.mtimeNs,
    size: stats.size,
  };
}

function sameParentIdentity(
  left: PrivateParentIdentity,
  right: PrivateParentIdentity,
): boolean {
  return (
    left.dev === right.dev &&
    left.gid === right.gid &&
    left.ino === right.ino &&
    left.mode === right.mode &&
    left.uid === right.uid
  );
}

function sameFileIdentity(
  left: PrivateFileIdentity,
  right: PrivateFileIdentity,
): boolean {
  return (
    sameParentIdentity(left, right) &&
    left.mtimeNs === right.mtimeNs &&
    left.size === right.size
  );
}

function isOutsideProject(projectRoot: string, candidate: string): boolean {
  const relationship = relative(projectRoot, candidate);
  return (
    isAbsolute(relationship) ||
    relationship === ".." ||
    relationship.startsWith(`..${sep}`)
  );
}

function readParentIdentity(parent: string): PrivateParentIdentity {
  let resolved: string;
  let stats: BigIntStats;
  try {
    resolved = realpathSync(parent);
    stats = lstatSync(parent, { bigint: true });
  } catch (error) {
    throw safeFailure(
      error,
      "private rehearsal output parent is missing or unreadable",
    );
  }
  if (
    resolved !== parent ||
    !stats.isDirectory() ||
    stats.isSymbolicLink() ||
    stats.nlink < BIGINT_ONE ||
    (stats.mode & PRIVATE_MODE_MASK) !== PRIVATE_PARENT_MODE
  ) {
    fail("private rehearsal output parent is not canonical mode-0700 storage");
  }
  return parentIdentity(stats);
}

export function assertPrivateOutputPath(
  path: string,
  projectRoot: string,
): PrivateOutput {
  if (
    !isAbsolute(path) ||
    basename(path) === "" ||
    /[\0\r\n]/.test(path) ||
    resolve(path) !== path
  ) {
    fail("private rehearsal output path is invalid");
  }
  let canonicalProjectRoot: string;
  try {
    canonicalProjectRoot = realpathSync(projectRoot);
  } catch (error) {
    throw safeFailure(error, "project root could not be verified");
  }
  if (canonicalProjectRoot !== projectRoot) {
    fail("project root is not canonical");
  }
  const parent = dirname(path);
  const parentStats = readParentIdentity(parent);
  if (
    resolve(parent, basename(path)) !== path ||
    basename(path) !== basename(path).trim()
  ) {
    fail("private rehearsal output path is not canonical");
  }
  if (
    !isOutsideProject(canonicalProjectRoot, parent) ||
    !isOutsideProject(canonicalProjectRoot, path)
  ) {
    fail("private rehearsal output must be outside the project");
  }
  let outputExists = false;
  try {
    lstatSync(path);
    outputExists = true;
  } catch (error) {
    if (
      !(error instanceof Error) ||
      !("code" in error) ||
      (error as NodeJS.ErrnoException).code !== "ENOENT"
    ) {
      throw safeFailure(
        error,
        "private rehearsal output existence could not be checked",
      );
    }
  }
  if (outputExists) fail("private rehearsal output already exists");
  return {
    parent,
    parentIdentity: parentStats,
    path,
    privateReceiptStoredOutsideRepo: true,
  };
}

function assertPrivateParentUnchanged(output: PrivateOutput): void {
  if (
    !sameParentIdentity(
      output.parentIdentity,
      readParentIdentity(output.parent),
    )
  ) {
    fail("private rehearsal output parent changed during publication");
  }
}

function safelyUnlinkOwnedOutput(
  output: PrivateOutput,
  expected: Pick<PrivateFileIdentity, "dev" | "ino"> | undefined,
): void {
  if (!expected) return;
  try {
    const observed = lstatSync(output.path, { bigint: true });
    if (
      observed.isFile() &&
      !observed.isSymbolicLink() &&
      expected.dev === observed.dev &&
      expected.ino === observed.ino
    ) {
      unlinkSync(output.path);
      const parentDescriptor = openSync(output.parent, constants.O_RDONLY);
      try {
        fsyncSync(parentDescriptor);
      } finally {
        closeSync(parentDescriptor);
      }
    }
  } catch {
    // A failed cleanup never replaces the original controlled failure.
  }
}

export function publishPrivateReceipt(
  path: string,
  bytes: Buffer,
  projectRoot: string,
  faultHooks: {
    afterHardLink?: () => void;
    afterOutputPathCheck?: () => void;
  } = {},
): {
  bytes: Buffer;
  privateReceiptStoredOutsideRepo: true;
} {
  const output = assertPrivateOutputPath(path, projectRoot);
  faultHooks.afterOutputPathCheck?.();
  const temporary = join(
    output.parent,
    `.${basename(output.path)}.${process.pid}.${randomUUID()}.pending`,
  );
  let descriptor: number | undefined;
  let linked = false;
  let ownedInode: Pick<PrivateFileIdentity, "dev" | "ino"> | undefined;
  let expectedFile: PrivateFileIdentity | undefined;
  try {
    descriptor = openSync(
      temporary,
      constants.O_CREAT | constants.O_EXCL | constants.O_WRONLY,
      0o600,
    );
    writeFileSync(descriptor, bytes);
    fsyncSync(descriptor);
    fchmodSync(descriptor, 0o400);
    fsyncSync(descriptor);
    const temporaryBeforeLink = fileIdentity(
      fstatSync(descriptor, { bigint: true }),
    );
    if (
      temporaryBeforeLink.nlink !== BIGINT_ONE ||
      (temporaryBeforeLink.mode & PRIVATE_MODE_MASK) !== PRIVATE_RECEIPT_MODE ||
      temporaryBeforeLink.size !== BigInt(bytes.length)
    ) {
      fail("temporary private rehearsal receipt has unsafe metadata");
    }
    assertPrivateParentUnchanged(output);
    ownedInode = {
      dev: temporaryBeforeLink.dev,
      ino: temporaryBeforeLink.ino,
    };
    linkSync(temporary, output.path);
    linked = true;
    const linkedOutput = lstatSync(output.path, { bigint: true });
    const linkedTemporary = lstatSync(temporary, { bigint: true });
    faultHooks.afterHardLink?.();
    if (
      linkedOutput.isSymbolicLink() ||
      !linkedOutput.isFile() ||
      linkedTemporary.isSymbolicLink() ||
      !linkedTemporary.isFile() ||
      linkedOutput.dev !== linkedTemporary.dev ||
      linkedOutput.ino !== linkedTemporary.ino ||
      linkedOutput.nlink !== BIGINT_TWO ||
      linkedTemporary.nlink !== BIGINT_TWO
    ) {
      fail("private rehearsal receipt hard-link publication is not exact");
    }
    unlinkSync(temporary);
    expectedFile = fileIdentity(fstatSync(descriptor, { bigint: true }));
    if (
      expectedFile.nlink !== BIGINT_ONE ||
      (expectedFile.mode & PRIVATE_MODE_MASK) !== PRIVATE_RECEIPT_MODE ||
      expectedFile.size !== BigInt(bytes.length)
    ) {
      fail("published private rehearsal receipt has unsafe metadata");
    }
    const parentDescriptor = openSync(output.parent, constants.O_RDONLY);
    try {
      const openedParent = parentIdentity(
        fstatSync(parentDescriptor, { bigint: true }),
      );
      if (!sameParentIdentity(output.parentIdentity, openedParent)) {
        fail("private rehearsal output parent changed before fsync");
      }
      fsyncSync(parentDescriptor);
    } finally {
      closeSync(parentDescriptor);
    }
    assertPrivateParentUnchanged(output);
    const publishedDescriptor = openSync(
      output.path,
      constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0),
    );
    try {
      const before = fileIdentity(
        fstatSync(publishedDescriptor, { bigint: true }),
      );
      if (!sameFileIdentity(expectedFile, before)) {
        fail("published private rehearsal receipt identity changed");
      }
      const publishedBytes = readFileSync(publishedDescriptor);
      const after = fileIdentity(
        fstatSync(publishedDescriptor, { bigint: true }),
      );
      if (
        !sameFileIdentity(expectedFile, after) ||
        !publishedBytes.equals(bytes)
      ) {
        fail("published private rehearsal receipt bytes changed");
      }
    } finally {
      closeSync(publishedDescriptor);
    }
    assertPrivateParentUnchanged(output);
    return {
      bytes,
      privateReceiptStoredOutsideRepo: output.privateReceiptStoredOutsideRepo,
    };
  } catch (error) {
    if (linked) safelyUnlinkOwnedOutput(output, ownedInode);
    throw safeFailure(
      error,
      "private rehearsal receipt could not be published safely",
    );
  } finally {
    if (descriptor !== undefined) closeSync(descriptor);
    try {
      unlinkSync(temporary);
    } catch {
      // The temporary was removed after hard-link publication or never created.
    }
  }
}

async function main() {
  const projectRoot = realpathSync(process.cwd());
  const pins = parseCodePins(process.argv.slice(2));
  for (const [key, path] of Object.entries(REHEARSAL_PATHS)) {
    const observed = sha256File(realpathSync(resolve(projectRoot, path)));
    if (pins[key as keyof typeof REHEARSAL_PATHS] !== observed) {
      fail("rehearsal code pin differs from exact tracked bytes");
    }
  }
  const runtimeAttestation = readSourceRegistrationLauncherAttestation();
  const databaseUrl = requiredEnvironment("DATABASE_URL");
  const primaryCorpusRoot = requiredEnvironment(
    "SOURCE_REGISTRATION_REHEARSAL_PRIMARY_CORPUS_ROOT",
  );
  const replicaCorpusRoot = requiredEnvironment(
    "SOURCE_REGISTRATION_REHEARSAL_REPLICA_CORPUS_ROOT",
  );
  const outputFile = requiredEnvironment(
    "SOURCE_REGISTRATION_REHEARSAL_OUTPUT_FILE",
  );
  const logicalComparisonProof = readLogicalComparisonProof();
  const plan = loadLockedSourceRegistrationPlan(projectRoot);
  verifyLockedPlanInputs({
    projectRoot,
    manifestPath: BATCH_PATH,
    primaryCorpusRoot,
    replicaCorpusRoot,
    plan,
  });
  const contents = reconstructLockedDocumentContents({
    projectRoot,
    primaryCorpusRoot,
    replicaCorpusRoot,
    plan,
  });
  const receipt = await runSourceRegistrationLogicalCloneRehearsal({
    databaseUrl,
    plan,
    contents,
    applyRunnerSha256: pins.applyRunner,
    rehearsalRuntimeSha256: pins.runtime,
    rehearsalSchemaSha256: pins.schema,
    rehearsalTestSha256: pins.test,
    rehearsalCommandRunnerSha256: pins.commandRunner,
    runtimeAttestation,
    logicalComparisonProof,
  });
  validateSourceRegistrationLogicalCloneRehearsalReceipt(receipt, {
    now: new Date(),
  });
  const schema = JSON.parse(
    readFileSync(resolve(projectRoot, REHEARSAL_PATHS.schema), "utf8"),
  );
  const validateSchema = new Ajv2020({ allErrors: true, strict: true }).compile(
    schema,
  );
  if (!validateSchema(receipt)) {
    fail("logical-clone rehearsal receipt failed its locked JSON Schema");
  }
  const receiptBytes = Buffer.from(
    `${canonicalSourceRegistrationJson(receipt)}\n`,
    "utf8",
  );
  const publication = publishPrivateReceipt(
    outputFile,
    receiptBytes,
    projectRoot,
  );
  process.stdout.write(
    `${JSON.stringify({
      artifactType: receipt.artifactType,
      exactProductionTargetExercised: false,
      fileSha256: sourceRegistrationApplyBareSha256(publication.bytes),
      firstExactMutationRemainsLive: true,
      logicalComparisonProofSha256:
        receipt.logicalComparisonProof.logicalComparisonProofSha256,
      privateReceiptStoredOutsideRepo:
        publication.privateReceiptStoredOutsideRepo,
      receiptSha256: receipt.receiptSha256,
      runtimeAttestationSha256:
        receipt.executedRuntime.runtimeAttestationSha256,
      targetClass: receipt.targetClass,
      transactionRolledBack: true,
    })}\n`,
  );
}

const invoked = process.argv[1]
  ? pathToFileURL(realpathSync(process.argv[1])).href
  : null;
if (invoked === import.meta.url) {
  main().catch((error) => {
    process.stderr.write(`${safeRehearsalRunnerErrorMessage(error)}\n`);
    process.exitCode = 1;
  });
}
