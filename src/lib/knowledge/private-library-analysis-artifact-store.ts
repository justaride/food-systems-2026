import { createHash, randomBytes } from "node:crypto";
import {
  chmodSync,
  closeSync,
  constants,
  fsyncSync,
  linkSync,
  lstatSync,
  mkdirSync,
  openSync,
  readFileSync,
  readdirSync,
  realpathSync,
  statSync,
  unlinkSync,
  writeFileSync,
  type Stats,
} from "node:fs";
import { basename, dirname, isAbsolute, join, resolve, sep } from "node:path";

export type PrivateArtifactReceipt = {
  path: string;
  sha256: string;
  sizeBytes: number;
  mode: 0o400 | 0o600;
};

export type PrivateArtifactExpectation = {
  sha256: string;
  sizeBytes: number;
  mode?: 0o400 | 0o600;
};

export type PrivateLibraryAnalysisRunAudit = {
  files: number;
  directories: number;
  totalBytes: number;
  inventoryHash: string;
};

export function openPrivateLibraryAnalysisRunRoot(
  baseRoot: string,
  runId: string,
): string {
  if (!isAbsolute(baseRoot) || !/^[a-z0-9][a-z0-9._-]*$/.test(runId)) {
    throw new Error("private_run_root_invalid");
  }
  mkdirSync(baseRoot, { recursive: true, mode: 0o700 });
  const realBase = assertPrivateDirectory(baseRoot);
  const requestedRunRoot = join(realBase, runId);
  if (lstatOrNull(requestedRunRoot) === null) {
    mkdirSync(requestedRunRoot, { mode: 0o700 });
    fsyncDirectory(realBase);
  }
  const runRoot = assertPrivateDirectory(requestedRunRoot);
  if (!runRoot.startsWith(`${realBase}${sep}`)) {
    throw new Error("private_run_root_escape");
  }
  return runRoot;
}

export function writePrivateArtifactExclusive(
  rawRoot: string,
  portablePath: string,
  bytes: Buffer,
): PrivateArtifactReceipt {
  if (!Buffer.isBuffer(bytes)) throw new Error("private_artifact_bytes_invalid");
  const root = assertPrivateDirectory(rawRoot);
  const segments = validatePortablePath(portablePath);
  const target = resolvePrivateTarget(root, segments);
  ensurePrivateParents(root, segments.slice(0, -1));
  const existing = lstatOrNull(target);
  if (existing !== null) {
    if (existing.isSymbolicLink()) {
      throw new Error("private_artifact_symlink_forbidden");
    }
    throw new Error("private_artifact_exists");
  }

  let descriptor: number | null = null;
  let created = false;
  try {
    descriptor = openSync(
      target,
      constants.O_WRONLY |
        constants.O_CREAT |
        constants.O_EXCL |
        constants.O_NOFOLLOW,
      0o600,
    );
    created = true;
    writeFileSync(descriptor, bytes);
    fsyncSync(descriptor);
  } catch (error) {
    if (isAlreadyExists(error)) throw new Error("private_artifact_exists");
    throw error;
  } finally {
    if (descriptor !== null) closeSync(descriptor);
    if (created && descriptor === null) unlinkIfPresent(target);
  }
  const stat = lstatSync(target);
  if (!stat.isFile() || stat.isSymbolicLink()) {
    unlinkIfPresent(target);
    throw new Error("private_artifact_file_invalid");
  }
  if ((stat.mode & 0o777) !== 0o600) {
    unlinkIfPresent(target);
    throw new Error("private_artifact_mode_mismatch");
  }
  return {
    path: target,
    sha256: sha256(bytes),
    sizeBytes: bytes.length,
    mode: 0o600,
  };
}

export function sealPrivateArtifact(
  root: string,
  portablePath: string,
  expected: Omit<PrivateArtifactExpectation, "mode">,
): PrivateArtifactReceipt {
  readAndVerifyPrivateArtifact(root, portablePath, {
    ...expected,
    mode: 0o600,
  });
  const target = resolveExistingPrivateTarget(root, portablePath);
  chmodSync(target, 0o400);
  readAndVerifyPrivateArtifact(root, portablePath, {
    ...expected,
    mode: 0o400,
  });
  return {
    path: target,
    sha256: expected.sha256,
    sizeBytes: expected.sizeBytes,
    mode: 0o400,
  };
}

export function readAndVerifyPrivateArtifact(
  rawRoot: string,
  portablePath: string,
  expected: PrivateArtifactExpectation,
): Buffer {
  validateExpectedArtifact(expected);
  const target = resolveExistingPrivateTarget(rawRoot, portablePath);
  const stat = lstatSync(target);
  if (!stat.isFile() || stat.isSymbolicLink()) {
    throw new Error("private_artifact_file_invalid");
  }
  const mode = stat.mode & 0o777;
  if (expected.mode !== undefined && mode !== expected.mode) {
    throw new Error("private_artifact_mode_mismatch");
  }
  if (stat.size !== expected.sizeBytes) {
    throw new Error("private_artifact_size_mismatch");
  }
  const bytes = readFileSync(target);
  if (sha256(bytes) !== expected.sha256) {
    throw new Error("private_artifact_hash_mismatch");
  }
  return bytes;
}

export function writePrivateManifestAtomic(
  rawRoot: string,
  portablePath: string,
  bytes: Buffer,
): PrivateArtifactReceipt {
  const root = assertPrivateDirectory(rawRoot);
  const segments = validatePortablePath(portablePath);
  const target = resolvePrivateTarget(root, segments);
  ensurePrivateParents(root, segments.slice(0, -1));
  if (lstatOrNull(target) !== null) throw new Error("private_artifact_exists");

  const temporaryName = `.${basename(portablePath)}.${process.pid}.${randomBytes(8).toString("hex")}.tmp`;
  const parentPortable = dirname(portablePath) === "." ? "" : dirname(portablePath);
  const temporaryPortable = parentPortable.length === 0
    ? temporaryName
    : `${parentPortable}/${temporaryName}`;
  const expected = { sha256: sha256(bytes), sizeBytes: bytes.length };
  const written = writePrivateArtifactExclusive(root, temporaryPortable, bytes);
  sealPrivateArtifact(root, temporaryPortable, expected);
  try {
    linkSync(written.path, target);
    unlinkSync(written.path);
    fsyncDirectory(dirname(target));
  } catch (error) {
    unlinkIfPresent(written.path);
    if (isAlreadyExists(error)) throw new Error("private_artifact_exists");
    throw error;
  }
  readAndVerifyPrivateArtifact(root, portablePath, { ...expected, mode: 0o400 });
  return {
    path: target,
    ...expected,
    mode: 0o400,
  };
}

export function auditPrivateLibraryAnalysisRunRoot(
  rawRoot: string,
): PrivateLibraryAnalysisRunAudit {
  const root = assertPrivateDirectory(rawRoot);
  const inventory: Array<{ portablePath: string; sha256: string; sizeBytes: number }> = [];
  let directories = 0;
  const visit = (directory: string, prefix: string): void => {
    const directoryStat = lstatSync(directory);
    if (
      directoryStat.isSymbolicLink() ||
      !directoryStat.isDirectory() ||
      (directoryStat.mode & 0o777) !== 0o700
    ) {
      throw new Error("private_run_audit_directory_invalid");
    }
    directories += 1;
    for (const name of readdirSync(directory).sort()) {
      const target = join(directory, name);
      const portablePath = prefix.length === 0 ? name : `${prefix}/${name}`;
      const stat = lstatSync(target);
      if (stat.isSymbolicLink()) throw new Error("private_artifact_symlink_forbidden");
      if (stat.isDirectory()) {
        visit(target, portablePath);
        continue;
      }
      if (!stat.isFile() || (stat.mode & 0o777) !== 0o400) {
        throw new Error("private_run_audit_file_invalid");
      }
      const bytes = readFileSync(target);
      if (bytes.length !== stat.size) throw new Error("private_run_audit_size_mismatch");
      inventory.push({ portablePath, sha256: sha256(bytes), sizeBytes: bytes.length });
    }
  };
  visit(root, "");
  const inventoryBytes = Buffer.from(
    inventory.map((entry) =>
      `${entry.portablePath}\u0000${entry.sha256}\u0000${entry.sizeBytes}\n`).join(""),
    "utf8",
  );
  return {
    files: inventory.length,
    directories,
    totalBytes: inventory.reduce((total, entry) => total + entry.sizeBytes, 0),
    inventoryHash: sha256(inventoryBytes),
  };
}

function assertPrivateDirectory(path: string): string {
  const stat = lstatSync(path);
  if (stat.isSymbolicLink()) throw new Error("private_artifact_symlink_forbidden");
  if (!stat.isDirectory()) throw new Error("private_artifact_directory_invalid");
  if ((stat.mode & 0o777) !== 0o700) {
    throw new Error("private_artifact_directory_mode_invalid");
  }
  return realpathSync(path);
}

function validatePortablePath(portablePath: string): string[] {
  if (
    portablePath.length === 0 ||
    isAbsolute(portablePath) ||
    portablePath.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(portablePath)
  ) {
    throw new Error("private_artifact_path_invalid");
  }
  const segments = portablePath.split("/");
  if (segments.some((segment) => segment.length === 0 || segment === "." || segment === "..")) {
    throw new Error("private_artifact_path_invalid");
  }
  return segments;
}

function resolvePrivateTarget(root: string, segments: readonly string[]): string {
  const target = resolve(root, ...segments);
  if (!target.startsWith(`${root}${sep}`)) {
    throw new Error("private_artifact_path_invalid");
  }
  return target;
}

function resolveExistingPrivateTarget(rawRoot: string, portablePath: string): string {
  const root = assertPrivateDirectory(rawRoot);
  const segments = validatePortablePath(portablePath);
  let current = root;
  for (const segment of segments.slice(0, -1)) {
    current = join(current, segment);
    const stat = lstatSync(current);
    if (stat.isSymbolicLink()) throw new Error("private_artifact_symlink_forbidden");
    if (!stat.isDirectory()) throw new Error("private_artifact_directory_invalid");
    if ((stat.mode & 0o777) !== 0o700) {
      throw new Error("private_artifact_directory_mode_invalid");
    }
  }
  const target = resolvePrivateTarget(root, segments);
  const targetStat = lstatSync(target);
  if (targetStat.isSymbolicLink()) throw new Error("private_artifact_symlink_forbidden");
  if (!realpathSync(target).startsWith(`${root}${sep}`)) {
    throw new Error("private_artifact_path_invalid");
  }
  return target;
}

function ensurePrivateParents(root: string, segments: readonly string[]): void {
  let current = root;
  for (const segment of segments) {
    current = join(current, segment);
    const existing = lstatOrNull(current);
    if (existing === null) {
      mkdirSync(current, { mode: 0o700 });
      fsyncDirectory(dirname(current));
      continue;
    }
    if (existing.isSymbolicLink()) throw new Error("private_artifact_symlink_forbidden");
    if (!existing.isDirectory()) throw new Error("private_artifact_directory_invalid");
    if ((existing.mode & 0o777) !== 0o700) {
      throw new Error("private_artifact_directory_mode_invalid");
    }
  }
}

function validateExpectedArtifact(expected: PrivateArtifactExpectation): void {
  if (!/^[a-f0-9]{64}$/.test(expected.sha256)) {
    throw new Error("private_artifact_expected_hash_invalid");
  }
  if (!Number.isSafeInteger(expected.sizeBytes) || expected.sizeBytes < 0) {
    throw new Error("private_artifact_expected_size_invalid");
  }
  if (expected.mode !== undefined && expected.mode !== 0o400 && expected.mode !== 0o600) {
    throw new Error("private_artifact_expected_mode_invalid");
  }
}

function fsyncDirectory(path: string): void {
  const descriptor = openSync(path, constants.O_RDONLY);
  try {
    fsyncSync(descriptor);
  } finally {
    closeSync(descriptor);
  }
}

function lstatOrNull(path: string): Stats | null {
  try {
    return lstatSync(path);
  } catch (error) {
    if (isNoEntry(error)) return null;
    throw error;
  }
}

function unlinkIfPresent(path: string): void {
  try {
    unlinkSync(path);
  } catch (error) {
    if (!isNoEntry(error)) throw error;
  }
}

function isAlreadyExists(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "EEXIST";
}

function isNoEntry(error: unknown): boolean {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}

function sha256(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}
