#!/usr/bin/env node

import { execFileSync, spawnSync } from "node:child_process";
import {
  closeSync,
  constants,
  existsSync,
  fsyncSync,
  lstatSync,
  openSync,
  realpathSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import type { PrismaClient } from "../../src/generated/prisma/client";
import {
  buildCandidateControlSnapshot,
  type CandidateControlSnapshotInput,
} from "../../src/lib/knowledge/candidate-control-snapshot";
import type {
  CandidateAnalysisRunEventInput,
  CandidateJsonValue,
} from "../../src/lib/knowledge/candidate-analysis-contract";

const COMMIT_PATTERN = /^[a-f0-9]{40}$/;
const EMPTY_DATABASE_IDENTITY = "00000000-0000-4000-8000-000000000000";
const EXTERNAL_TARGET_PROFILE = "external-public-v1";

export type CandidateControlSnapshotCliOptions = {
  output: string | null;
  runtimeCommit: string | null;
};

export function parseCandidateControlSnapshotArgs(
  args: readonly string[],
): CandidateControlSnapshotCliOptions {
  let output: string | null = null;
  let runtimeCommit: string | null = null;

  for (const argument of args) {
    if (argument.startsWith("--output=")) {
      if (output !== null) throw new Error("duplicate_output_argument");
      const value = argument.slice("--output=".length);
      if (
        value.length === 0 ||
        /[\u0000-\u001f\u007f]/.test(value) ||
        (!isAbsolute(value) && value.split(/[\\/]/).includes(".."))
      ) {
        throw new Error("invalid_output_argument");
      }
      output = value;
      continue;
    }
    if (argument.startsWith("--runtime-commit=")) {
      if (runtimeCommit !== null) {
        throw new Error("duplicate_runtime_commit_argument");
      }
      const value = argument.slice("--runtime-commit=".length);
      if (!COMMIT_PATTERN.test(value)) {
        throw new Error("invalid_runtime_commit_argument");
      }
      runtimeCommit = value;
      continue;
    }
    throw new Error("unknown_candidate_control_snapshot_argument");
  }

  return { output, runtimeCommit };
}

export function writeCandidateControlSnapshotAtomic(
  requestedPath: string,
  serialized: string,
  hooks: { beforeRename?: () => void } = {},
): void {
  const target = isAbsolute(requestedPath)
    ? resolve(requestedPath)
    : resolve(process.cwd(), requestedPath);
  const parent = dirname(target);
  const targetName = target.slice(parent.length + 1);
  const temporary = join(parent, `.${targetName}.candidate-control.tmp`);

  const parentStat = lstatSync(parent);
  if (!parentStat.isDirectory() || parentStat.isSymbolicLink()) {
    throw new Error("candidate_control_output_parent_is_unsafe");
  }
  rejectUnsafeOutputTarget(target, parent);
  if (existsSync(temporary)) {
    throw new Error("candidate_control_temporary_path_exists");
  }

  let descriptor: number | null = null;
  try {
    descriptor = openSync(
      temporary,
      constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL,
      0o600,
    );
    writeFileSync(descriptor, serialized, { encoding: "utf8" });
    fsyncSync(descriptor);
    closeSync(descriptor);
    descriptor = null;

    hooks.beforeRename?.();
    rejectUnsafeOutputTarget(target, parent);
    renameSync(temporary, target);
    const directoryDescriptor = openSync(parent, constants.O_RDONLY);
    try {
      fsyncSync(directoryDescriptor);
    } finally {
      closeSync(directoryDescriptor);
    }
  } finally {
    if (descriptor !== null) closeSync(descriptor);
    if (existsSync(temporary)) unlinkSync(temporary);
  }
}

export async function runCandidateControlSnapshotCli(
  options: CandidateControlSnapshotCliOptions,
): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl === undefined || databaseUrl.length === 0) {
    throw new Error("candidate_control_database_url_missing");
  }

  const [{ PrismaPg }, { PrismaClient: RuntimePrismaClient }] =
    await Promise.all([
      import("@prisma/adapter-pg"),
      import("../../src/generated/prisma/client"),
    ]);
  const prisma: PrismaClient = new RuntimePrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });

  try {
    const input = await readCandidateControlSnapshotInput(
      prisma,
      options.runtimeCommit,
    );
    const snapshot = buildCandidateControlSnapshot(input);
    const serialized = `${JSON.stringify(snapshot, null, 2)}\n`;
    if (options.output === null) process.stdout.write(serialized);
    else writeCandidateControlSnapshotAtomic(options.output, serialized);
  } finally {
    await prisma.$disconnect();
  }
}

async function readCandidateControlSnapshotInput(
  prisma: PrismaClient,
  runtimeCommit: string | null,
): Promise<CandidateControlSnapshotInput> {
  const queryErrors: string[] = [];

  const identities = await queryOrDefault(
    queryErrors,
    "database_identity_query_failed",
    () =>
      prisma.databaseIdentity.findMany({
        orderBy: { key: "asc" },
        select: { key: true, identityUuid: true },
      }),
    [],
  );
  const identity =
    identities.length === 1 && identities[0]?.key === "primary"
      ? identities[0]
      : null;
  if (identity === null) queryErrors.push("database_identity_invalid");

  const runs = await queryOrDefault(
    queryErrors,
    "candidate_runs_query_failed",
    () =>
      prisma.candidateAnalysisRun.findMany({
        orderBy: { id: "asc" },
        select: {
          id: true,
          events: {
            orderBy: { sequence: "asc" },
            select: {
              id: true,
              runId: true,
              sequence: true,
              eventType: true,
              payload: true,
              eventHash: true,
            },
          },
        },
      }),
    [],
  );
  const assertions = await queryOrDefault(
    queryErrors,
    "candidate_assertions_query_failed",
    () =>
      prisma.candidateAssertion.findMany({
        orderBy: { id: "asc" },
        select: {
          id: true,
          runId: true,
          payloadHash: true,
          machineUse: true,
          identityConfidence: true,
          evidenceLevel: true,
          supersededAssertionId: true,
          createdAt: true,
        },
      }),
    [],
  );
  const reviewDecisions = await queryOrDefault(
    queryErrors,
    "candidate_review_decisions_query_failed",
    () =>
      prisma.candidateHumanReviewDecision.findMany({
        orderBy: { id: "asc" },
        select: {
          id: true,
          assertionId: true,
          decision: true,
          reviewProfile: true,
          reviewProfileHash: true,
          assertionPayloadHash: true,
          sourceContentSetHash: true,
          evidenceSetHash: true,
          supersededDecisionId: true,
          createdAt: true,
        },
      }),
    [],
  );
  const promotionDecisions = await queryOrDefault(
    queryErrors,
    "candidate_promotion_decisions_query_failed",
    () =>
      prisma.candidatePromotionDecision.findMany({
        orderBy: { id: "asc" },
        select: {
          id: true,
          assertionId: true,
          reviewDecisionId: true,
          targetProfile: true,
          state: true,
          policyVersion: true,
          preconditionsHash: true,
          supersededDecisionId: true,
          createdAt: true,
        },
      }),
    [],
  );
  const reconciliationSnapshots = await queryOrDefault(
    queryErrors,
    "candidate_reconciliation_query_failed",
    () =>
      prisma.candidateReconciliationSnapshot.findMany({
        orderBy: [{ scopeHash: "asc" }, { createdAt: "asc" }, { id: "asc" }],
        select: {
          id: true,
          scopeHash: true,
          payloadHash: true,
          conflictCount: true,
          createdAt: true,
        },
      }),
    [],
  );
  const legacyRows = await queryOrDefault(
    queryErrors,
    "legacy_library_analysis_query_failed",
    () =>
      prisma.libraryAnalysisRecord.findMany({
        orderBy: [{ sourceKind: "asc" }, { sourceKey: "asc" }],
        select: {
          sourceKind: true,
          sourceKey: true,
          documentId: true,
          sourceDocId: true,
          status: true,
          usageRule: true,
          reviewStatus: true,
          aiCard: true,
          claimCandidates: true,
          contentHash: true,
          reviewedAt: true,
          reviewer: true,
        },
      }),
    [],
  );

  let sourceCommit = "0".repeat(40);
  try {
    sourceCommit = execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: resolve(fileURLToPath(new URL("../..", import.meta.url))),
      encoding: "utf8",
      env: scrubbedGitEnvironment(),
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (!COMMIT_PATTERN.test(sourceCommit)) {
      sourceCommit = "0".repeat(40);
      queryErrors.push("source_commit_invalid");
    }
  } catch {
    queryErrors.push("source_commit_query_failed");
  }

  return {
    generatedAt: new Date().toISOString(),
    provenance: {
      sourceCommit,
      runtimeCommit,
      databaseIdentityUuid:
        identity?.identityUuid ?? EMPTY_DATABASE_IDENTITY,
      queryErrors,
    },
    externalTargetProfile: EXTERNAL_TARGET_PROFILE,
    externalBlockers: [
      "current_review_profile_registry_unavailable",
      "current_promotion_precondition_registry_unavailable",
    ],
    runs: runs.map((run) => ({
      id: run.id,
      events: run.events.map(
        (event): CandidateAnalysisRunEventInput => ({
          ...event,
          payload: event.payload as CandidateJsonValue | null,
        }),
      ),
    })),
    assertions: assertions.map((assertion) => ({
      ...assertion,
      createdAt: assertion.createdAt.toISOString(),
    })),
    currentReviewBindings: [],
    reviewDecisions: reviewDecisions.map((decision) => ({
      ...decision,
      createdAt: decision.createdAt.toISOString(),
    })),
    currentPromotionBindings: [],
    promotionDecisions: promotionDecisions.map((decision) => ({
      ...decision,
      createdAt: decision.createdAt.toISOString(),
    })),
    reconciliationSnapshots: reconciliationSnapshots.map((snapshot) => ({
      ...snapshot,
      createdAt: snapshot.createdAt.toISOString(),
    })),
    legacyRows,
  };
}

async function queryOrDefault<T>(
  queryErrors: string[],
  errorCode: string,
  query: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await query();
  } catch {
    queryErrors.push(errorCode);
    return fallback;
  }
}

function rejectUnsafeOutputTarget(target: string, parent: string): void {
  const targetExists = rejectUnsafeExistingTarget(target);
  rejectGitTrackedTarget(target, parent, targetExists);
}

function rejectUnsafeExistingTarget(target: string): boolean {
  let stat: ReturnType<typeof lstatSync>;
  try {
    stat = lstatSync(target);
  } catch (error) {
    if (isFileSystemError(error, "ENOENT")) return false;
    throw new Error("candidate_control_output_target_inspection_failed");
  }
  if (stat.isSymbolicLink()) {
    throw new Error("candidate_control_output_target_is_symlink");
  }
  if (!stat.isFile()) {
    throw new Error("candidate_control_output_target_is_not_a_file");
  }
  return true;
}

function rejectGitTrackedTarget(
  target: string,
  parent: string,
  targetExists: boolean,
): void {
  let canonicalParent: string;
  try {
    canonicalParent = realpathSync.native(parent);
  } catch {
    throw new Error("candidate_control_git_tracking_check_failed");
  }
  const repositoryControlRoot = findGitRepositoryControlRoot(canonicalParent);
  if (repositoryControlRoot === null) return;
  let canonicalTarget: string;
  try {
    canonicalTarget = targetExists
      ? realpathSync.native(target)
      : join(canonicalParent, basename(target));
  } catch {
    throw new Error("candidate_control_git_tracking_check_failed");
  }
  if (dirname(canonicalTarget) !== canonicalParent) {
    throw new Error("candidate_control_git_tracking_check_failed");
  }
  if (isSameOrDescendant(repositoryControlRoot, canonicalTarget)) {
    throw new Error("candidate_control_output_target_is_git_metadata");
  }

  const repositoryRoot = readCanonicalGitPath(
    canonicalParent,
    "--show-toplevel",
  );
  const actualGitDir = readCanonicalGitPath(
    canonicalParent,
    "--absolute-git-dir",
  );
  const commonGitDir = readCanonicalGitPath(
    canonicalParent,
    "--path-format=absolute",
    "--git-common-dir",
  );
  if (
    isSameOrDescendant(actualGitDir, canonicalTarget) ||
    isSameOrDescendant(commonGitDir, canonicalTarget)
  ) {
    throw new Error("candidate_control_output_target_is_git_metadata");
  }

  const repositoryRelative = relative(repositoryRoot, canonicalTarget);
  if (!isSameOrDescendant(repositoryRoot, canonicalTarget)) {
    throw new Error("candidate_control_git_tracking_check_failed");
  }

  const trackedResult = spawnSync(
    "git",
    [
      "--literal-pathspecs",
      "-C",
      repositoryRoot,
      "ls-files",
      "--error-unmatch",
      "--",
      repositoryRelative,
    ],
    { env: scrubbedGitEnvironment(), stdio: "ignore" },
  );
  if (trackedResult.error !== undefined) {
    throw new Error("candidate_control_git_tracking_check_failed");
  }
  if (trackedResult.status === 0) {
    throw new Error("candidate_control_output_target_is_git_tracked");
  }
  if (trackedResult.status !== 1) {
    throw new Error("candidate_control_git_tracking_check_failed");
  }
}

function findGitRepositoryControlRoot(start: string): string | null {
  let current = start;
  while (true) {
    const marker = join(current, ".git");
    const stat = lstatIfExists(marker);
    if (stat !== null) {
      if (!stat.isDirectory() && !stat.isFile()) {
        throw new Error("candidate_control_git_tracking_check_failed");
      }
      return marker;
    }
    if (isGitDirectoryRoot(current)) return current;

    const next = dirname(current);
    if (next === current) return null;
    current = next;
  }
}

function isGitDirectoryRoot(path: string): boolean {
  const head = lstatIfExists(join(path, "HEAD"));
  if (head === null) return false;
  const objects = lstatIfExists(join(path, "objects"));
  const refs = lstatIfExists(join(path, "refs"));
  if (objects === null || refs === null) return false;
  if (!head.isFile() || !objects.isDirectory() || !refs.isDirectory()) {
    throw new Error("candidate_control_git_tracking_check_failed");
  }
  return true;
}

function lstatIfExists(
  path: string,
): NonNullable<ReturnType<typeof lstatSync>> | null {
  try {
    return lstatSync(path);
  } catch (error) {
    if (isFileSystemError(error, "ENOENT")) return null;
    throw new Error("candidate_control_git_tracking_check_failed");
  }
}

function readCanonicalGitPath(
  cwd: string,
  ...revParseArguments: string[]
): string {
  const result = spawnSync(
    "git",
    ["-C", cwd, "rev-parse", ...revParseArguments],
    {
      encoding: "utf8",
      env: scrubbedGitEnvironment(),
      stdio: ["ignore", "pipe", "ignore"],
    },
  );
  if (result.error !== undefined || result.status !== 0) {
    throw new Error("candidate_control_git_tracking_check_failed");
  }
  const output = result.stdout.replace(/\r?\n$/, "");
  if (output.length === 0 || /[\r\n]/.test(output) || !isAbsolute(output)) {
    throw new Error("candidate_control_git_tracking_check_failed");
  }
  try {
    return realpathSync.native(output);
  } catch {
    throw new Error("candidate_control_git_tracking_check_failed");
  }
}

function isSameOrDescendant(parent: string, candidate: string): boolean {
  const candidateRelative = relative(parent, candidate);
  return (
    candidateRelative.length === 0 ||
    (candidateRelative !== ".." &&
      !candidateRelative.startsWith(
        `..${process.platform === "win32" ? "\\" : "/"}`,
      ) &&
      !isAbsolute(candidateRelative))
  );
}

function scrubbedGitEnvironment(): NodeJS.ProcessEnv {
  const environment: NodeJS.ProcessEnv = { ...process.env };
  for (const name of Object.keys(environment)) {
    if (name.toUpperCase().startsWith("GIT_")) delete environment[name];
  }
  return environment;
}

function isFileSystemError(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === code
  );
}

const invokedPath = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : null;
if (invokedPath === import.meta.url) {
  void runInvokedCandidateControlSnapshotCli();
}

async function runInvokedCandidateControlSnapshotCli(): Promise<void> {
  try {
    const options = parseCandidateControlSnapshotArgs(process.argv.slice(2));
    await runCandidateControlSnapshotCli(options);
  } catch {
    process.stderr.write("candidate_control_snapshot_export_failed\n");
    process.exitCode = 1;
  }
}
