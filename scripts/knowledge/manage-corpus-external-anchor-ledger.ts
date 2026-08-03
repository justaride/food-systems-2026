import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { lstatSync, readFileSync, realpathSync } from "node:fs";
import {
  dirname,
  isAbsolute,
  join,
  normalize,
  parse,
  relative,
  resolve,
  sep,
} from "node:path";
import { pathToFileURL } from "node:url";

import {
  canonicalCorpusJson,
  type CorpusCanonicalJsonValue,
} from "../../src/lib/knowledge/corpus-processing-lifecycle";
import {
  validateCorpusEventHistoryAnchorChain,
  validateCorpusEventHistoryAnchorRecord,
  type CorpusEventHistoryAnchorCandidate,
  type CorpusEventHistoryAnchorRecord,
  type CorpusEventHistoryTrustedVerification,
  type VerifyTrustedCorpusEventHistoryAnchor,
} from "../../src/lib/knowledge/corpus-processing-event-history";
import {
  CORPUS_REPOSITORY_BASELINE_GENERATION_MANIFEST_PATH,
  CORPUS_REPOSITORY_BASELINE_PATH,
  CORPUS_REPOSITORY_PROCESSING_REGISTER_PATH,
  assertExternalRootOutsideRepository,
  createCorpusExternalAnchorVerifier,
  loadRootOwnedCorpusExternalAnchorLedger,
  prepareCorpusExternalAnchorAppendRequest,
  requireRequestIsLatestExternalAppend,
  validateCorpusExternalAnchorAppendRequest,
  type CorpusExternalAnchorAppendRequest,
  type CorpusExternalAnchorLedgerSnapshot,
  type CorpusExternalAnchorRepositoryBaselineInputs,
} from "../../src/lib/knowledge/corpus-event-history-external-ledger";
import {
  CORPUS_CURRENT_STATE_PATHS,
  CORPUS_STATE_EVENT_MANIFEST_HASH_DOMAIN,
  CORPUS_STATE_EVENT_SET_HASH_DOMAIN,
  buildCorpusCurrentStateArtifacts,
  writeOrCheckCorpusCurrentStateArtifacts,
} from "./generate-corpus-processing-current-state";

type JsonObject = { [key: string]: JsonValue };
type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];

export const CORPUS_EXTERNAL_ANCHOR_PRODUCTION_ROOT =
  "/private/var/db/food-systems-corpus-anchor" as const;

type RepositoryAnchorContext = {
  anchorLogBytes: Buffer;
  records: CorpusEventHistoryAnchorRecord[];
  pairs: Array<{
    candidate: CorpusEventHistoryAnchorCandidate;
    verification: CorpusEventHistoryTrustedVerification;
  }>;
  latestCandidate: CorpusEventHistoryAnchorCandidate;
  latestVerification: CorpusEventHistoryTrustedVerification | null;
  repositoryBaselineInputs: CorpusExternalAnchorRepositoryBaselineInputs;
};

export type CorpusExternalAnchorCliOptions = {
  mode: "prepare" | "check_external" | "check_request" | "verify_current_state";
  externalRoot: string;
  verifiedAt: string | null;
  requestPath: string | null;
  expectEmptyExternal: boolean;
};

function fail(message: string): never {
  throw new Error(`External corpus anchor command failed: ${message}`);
}

function rawSha256(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

function prefixedSha256(value: string | Buffer): string {
  return `sha256:${rawSha256(value)}`;
}

function domainHash(domain: string, value: CorpusCanonicalJsonValue): string {
  return `sha256:${createHash("sha256")
    .update(domain)
    .update(canonicalCorpusJson(value))
    .digest("hex")}`;
}

function parseJson(path: string, bytes: Buffer): unknown {
  try {
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes));
  } catch (error) {
    fail(`${path} is invalid JSON or UTF-8: ${(error as Error).message}`);
  }
}

function parseCanonicalJsonLines(path: string, bytes: Buffer): unknown[] {
  const text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  if (text.length === 0 || !text.endsWith("\n")) {
    fail(`${path} must be non-empty canonical JSONL ending in a newline`);
  }
  return text
    .slice(0, -1)
    .split("\n")
    .map((line, index) => {
      let value: unknown;
      try {
        value = JSON.parse(line);
      } catch (error) {
        fail(
          `${path}:${index + 1} is invalid JSON: ${(error as Error).message}`,
        );
      }
      if (line !== JSON.stringify(value)) {
        fail(`${path}:${index + 1} is not canonical JSONL`);
      }
      return value;
    });
}

function assertRepositoryFilePath(root: string, path: string): string {
  const target = resolve(root, path);
  const relation = relative(root, target);
  if (relation === "" || relation === ".." || relation.startsWith(`..${sep}`)) {
    fail(`repository path escapes the repository: ${path}`);
  }
  let current = target;
  while (current !== root) {
    const stat = lstatSync(current);
    if (stat.isSymbolicLink())
      fail(`repository input reaches a symlink: ${path}`);
    current = dirname(current);
  }
  return target;
}

function readRepositoryFile(root: string, path: string): Buffer {
  return readFileSync(assertRepositoryFilePath(root, path));
}

function readRepositoryBaselineInputs(
  root: string,
): CorpusExternalAnchorRepositoryBaselineInputs {
  const bind = <T extends string>(path: T) => {
    const bytes = readRepositoryFile(root, path);
    if (bytes.length === 0) fail(`baseline trust input is empty: ${path}`);
    return {
      path,
      fileSha256: prefixedSha256(bytes),
      sizeBytes: bytes.length,
    };
  };
  return {
    baseline: bind(CORPUS_REPOSITORY_BASELINE_PATH),
    processingRegister: bind(CORPUS_REPOSITORY_PROCESSING_REGISTER_PATH),
    baselineGenerationManifest: bind(
      CORPUS_REPOSITORY_BASELINE_GENERATION_MANIFEST_PATH,
    ),
  };
}

function validateEventManifest(input: {
  eventLogBytes: Buffer;
  events: unknown[];
  manifestBytes: Buffer;
}): { manifestSha256: string } {
  const value = parseJson(
    CORPUS_CURRENT_STATE_PATHS.eventManifest,
    input.manifestBytes,
  );
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    fail("event manifest is not an object");
  }
  const manifest = value as JsonObject;
  const manifestSha256 = manifest.manifestSha256;
  if (typeof manifestSha256 !== "string") fail("event manifest has no seal");
  const { manifestSha256: _seal, ...body } = manifest;
  if (
    manifestSha256 !==
    domainHash(
      CORPUS_STATE_EVENT_MANIFEST_HASH_DOMAIN,
      body as CorpusCanonicalJsonValue,
    )
  ) {
    fail("event manifest self-hash mismatch");
  }
  const eventLog = manifest.eventLog;
  if (!eventLog || typeof eventLog !== "object" || Array.isArray(eventLog)) {
    fail("event manifest has no event-log binding");
  }
  const first = input.events[0] as Record<string, unknown> | undefined;
  const latest = input.events.at(-1) as Record<string, unknown> | undefined;
  assert.deepEqual(eventLog, {
    path: CORPUS_CURRENT_STATE_PATHS.events,
    sha256: rawSha256(input.eventLogBytes),
    sizeBytes: input.eventLogBytes.length,
  });
  assert.equal(manifest.eventCount, input.events.length);
  assert.equal(manifest.firstEventSha256, first?.eventSha256 ?? null);
  assert.equal(manifest.lastEventSha256, latest?.eventSha256 ?? null);
  assert.equal(
    manifest.eventSetSha256,
    domainHash(
      CORPUS_STATE_EVENT_SET_HASH_DOMAIN,
      input.events as CorpusCanonicalJsonValue,
    ),
  );
  return { manifestSha256 };
}

function anchorPairs(
  records: CorpusEventHistoryAnchorRecord[],
): RepositoryAnchorContext["pairs"] {
  const pairs: RepositoryAnchorContext["pairs"] = [];
  let pending: CorpusEventHistoryAnchorCandidate | null = null;
  for (const record of records) {
    if (record.recordType === "history_anchor_candidate") {
      pending = record;
      continue;
    }
    if (!pending) fail("repository verification has no preceding candidate");
    pairs.push({ candidate: pending, verification: record });
    pending = null;
  }
  return pairs;
}

function previousVerifier(input: {
  snapshot: CorpusExternalAnchorLedgerSnapshot | null;
  pairs: RepositoryAnchorContext["pairs"];
  externalRecordAhead: 0 | 1;
  externalLatestBinding?: {
    candidate: CorpusEventHistoryAnchorCandidate;
    verification: CorpusEventHistoryTrustedVerification;
  };
}): VerifyTrustedCorpusEventHistoryAnchor | undefined {
  const expectedExternalCount = input.pairs.length + input.externalRecordAhead;
  if (expectedExternalCount === 0) {
    if (input.snapshot)
      fail("external ledger is ahead of an unverified repository genesis");
    return undefined;
  }
  if (!input.snapshot)
    fail("repository has verifications but external ledger is absent");
  if (input.snapshot.records.length !== expectedExternalCount) {
    fail(
      "external record count differs from repository trusted-verification count",
    );
  }
  const latest = input.externalLatestBinding ?? input.pairs.at(-1);
  if (!latest) fail("external latest binding is missing");
  return createCorpusExternalAnchorVerifier({
    snapshot: input.snapshot,
    latestCandidate: latest.candidate,
    latestVerification: latest.verification,
    latestRepositoryBaselineInputs:
      input.snapshot.records.at(-1)!.repositoryBaselineInputs,
  });
}

export function readAndValidateRepositoryAnchorContext(input: {
  repositoryRoot: string;
  externalSnapshot: CorpusExternalAnchorLedgerSnapshot | null;
  allowPendingCandidate: boolean;
  externalRecordAhead?: 0 | 1;
  externalLatestBinding?: {
    candidate: CorpusEventHistoryAnchorCandidate;
    verification: CorpusEventHistoryTrustedVerification;
  };
}): RepositoryAnchorContext {
  const repositoryBaselineInputs = readRepositoryBaselineInputs(
    input.repositoryRoot,
  );
  const eventLogBytes = readRepositoryFile(
    input.repositoryRoot,
    CORPUS_CURRENT_STATE_PATHS.events,
  );
  const events =
    eventLogBytes.length === 0
      ? []
      : parseCanonicalJsonLines(
          CORPUS_CURRENT_STATE_PATHS.events,
          eventLogBytes,
        );
  const manifestBytes = readRepositoryFile(
    input.repositoryRoot,
    CORPUS_CURRENT_STATE_PATHS.eventManifest,
  );
  const manifest = validateEventManifest({
    eventLogBytes,
    events,
    manifestBytes,
  });
  const anchorLogBytes = readRepositoryFile(
    input.repositoryRoot,
    CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
  );
  const records = parseCanonicalJsonLines(
    CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
    anchorLogBytes,
  ).map(validateCorpusEventHistoryAnchorRecord);
  const pairs = anchorPairs(records);
  const verifier = previousVerifier({
    snapshot: input.externalSnapshot,
    pairs,
    externalRecordAhead: input.externalRecordAhead ?? 0,
    externalLatestBinding: input.externalLatestBinding,
  });
  const chain = validateCorpusEventHistoryAnchorChain({
    records,
    eventLogPath: CORPUS_CURRENT_STATE_PATHS.events,
    eventLogBytes,
    events,
    eventSetSha256: (eventPrefix) =>
      domainHash(
        CORPUS_STATE_EVENT_SET_HASH_DOMAIN,
        eventPrefix as CorpusCanonicalJsonValue,
      ),
    currentEventManifest: {
      path: CORPUS_CURRENT_STATE_PATHS.eventManifest,
      bytes: manifestBytes,
      manifestSha256: manifest.manifestSha256,
    },
    verifyTrustedAnchor: verifier,
    requireCurrentCheckpointTrusted: !input.allowPendingCandidate,
  });
  const latestRecord = records.at(-1)!;
  if (
    input.allowPendingCandidate &&
    latestRecord.recordType !== "history_anchor_candidate"
  ) {
    fail("prepare/check-request requires one latest unverified candidate");
  }
  if (
    !input.allowPendingCandidate &&
    latestRecord.recordType !== "history_anchor_trusted_verification"
  ) {
    fail(
      "current-state verification requires a latest trusted-verification record",
    );
  }
  return {
    anchorLogBytes,
    records,
    pairs,
    latestCandidate: chain.latestCandidate,
    latestVerification:
      latestRecord.recordType === "history_anchor_trusted_verification"
        ? latestRecord
        : null,
    repositoryBaselineInputs,
  };
}

function readPreparedRequest(path: string): CorpusExternalAnchorAppendRequest {
  if (
    !isAbsolute(path) ||
    normalize(path) !== path ||
    (path !== parse(path).root && path.endsWith(sep)) ||
    path.includes("\u0000")
  ) {
    fail("prepared request path must be absolute and normalized");
  }
  const root = parse(path).root;
  let current = root;
  for (const component of path.slice(root.length).split(sep)) {
    current = join(current, component);
    const componentStat = lstatSync(current);
    if (componentStat.isSymbolicLink()) {
      fail("prepared request path must not cross a symlink");
    }
  }
  const stat = lstatSync(path);
  if (stat.isSymbolicLink() || !stat.isFile()) {
    fail("prepared request must be a regular non-symlink file");
  }
  const bytes = readFileSync(path);
  const request = validateCorpusExternalAnchorAppendRequest(
    parseJson(path, bytes),
  );
  if (bytes.toString("utf8") !== `${JSON.stringify(request, null, 2)}\n`) {
    fail("prepared request file is not canonical pretty JSON");
  }
  return request;
}

function requireRequestMatchesRepository(input: {
  request: CorpusExternalAnchorAppendRequest;
  context: RepositoryAnchorContext;
}): void {
  if (
    input.request.repositoryAnchorLogPrefix.path !==
      CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors ||
    input.request.repositoryAnchorLogPrefix.fileSha256 !==
      prefixedSha256(input.context.anchorLogBytes) ||
    input.request.repositoryAnchorLogPrefix.sizeBytes !==
      input.context.anchorLogBytes.length ||
    input.request.repositoryAnchorLogPrefix.recordCount !==
      input.context.records.length ||
    input.request.repositoryAnchorLogPrefix.lastRecordSha256 !==
      input.context.latestCandidate.recordSha256 ||
    input.request.candidate.recordSha256 !==
      input.context.latestCandidate.recordSha256 ||
    canonicalCorpusJson(input.request.repositoryBaselineInputs) !==
      canonicalCorpusJson(input.context.repositoryBaselineInputs)
  ) {
    fail(
      "prepared request no longer matches the exact repository anchor prefix",
    );
  }
}

export function parseCorpusExternalAnchorCliArgs(
  args: string[],
): CorpusExternalAnchorCliOptions {
  const modeFlags = [
    ["--prepare", "prepare"],
    ["--check-external", "check_external"],
    ["--check-request", "check_request"],
    ["--verify-current-state", "verify_current_state"],
  ] as const;
  const modeArgumentCount = args.filter((arg) =>
    modeFlags.some(([flag]) => arg === flag),
  ).length;
  const selected = modeFlags.filter(([flag]) => args.includes(flag));
  if (selected.length !== 1 || modeArgumentCount !== 1)
    fail("choose exactly one command mode");
  const externalRoots = args
    .filter((arg) => arg.startsWith("--external-root="))
    .map((arg) => arg.slice("--external-root=".length));
  const verifiedAts = args
    .filter((arg) => arg.startsWith("--verified-at="))
    .map((arg) => arg.slice("--verified-at=".length));
  const requestPaths = args
    .filter((arg) => arg.startsWith("--request="))
    .map((arg) => arg.slice("--request=".length));
  const known = args.filter(
    (arg) =>
      modeFlags.some(([flag]) => arg === flag) ||
      arg.startsWith("--external-root=") ||
      arg.startsWith("--verified-at=") ||
      arg.startsWith("--request=") ||
      arg === "--expect-empty-external",
  );
  if (known.length !== args.length) fail("unknown or malformed argument");
  if (externalRoots.length !== 1 || externalRoots[0] === "") {
    fail("exactly one non-empty --external-root is required");
  }
  if (!isAbsolute(externalRoots[0]!)) fail("external root must be absolute");
  if (externalRoots[0] !== CORPUS_EXTERNAL_ANCHOR_PRODUCTION_ROOT) {
    fail(
      `external root must be the fixed production authority ${CORPUS_EXTERNAL_ANCHOR_PRODUCTION_ROOT}`,
    );
  }
  const mode = selected[0]![1];
  const expectEmptyExternal = args.includes("--expect-empty-external");
  if (args.filter((arg) => arg === "--expect-empty-external").length > 1) {
    fail("duplicate mode-specific arguments are not allowed");
  }
  if (
    (mode === "prepare") !== (verifiedAts.length === 1) ||
    (mode === "check_request") !== (requestPaths.length === 1) ||
    (expectEmptyExternal && mode !== "prepare")
  ) {
    fail("mode-specific arguments are missing or used with the wrong mode");
  }
  if (verifiedAts.length > 1 || requestPaths.length > 1) {
    fail("duplicate mode-specific arguments are not allowed");
  }
  return {
    mode,
    externalRoot: externalRoots[0]!,
    verifiedAt: verifiedAts[0] ?? null,
    requestPath: requestPaths[0] ?? null,
    expectEmptyExternal,
  };
}

function main(): void {
  const repositoryRoot = realpathSync(process.cwd());
  const options = parseCorpusExternalAnchorCliArgs(process.argv.slice(2));
  assertExternalRootOutsideRepository({
    repositoryRoot,
    externalRoot: options.externalRoot,
  });
  if (options.mode === "check_external") {
    const snapshot = loadRootOwnedCorpusExternalAnchorLedger(
      options.externalRoot,
    );
    assert.ok(snapshot);
    process.stdout.write(
      `${JSON.stringify(
        {
          status: "root_controlled_external_ledger_verified",
          recordCount: snapshot.head.recordCount,
          latestRecordSha256: snapshot.head.latestRecordSha256,
          latestCandidateRecordSha256:
            snapshot.head.latestCandidateRecordSha256,
          latestVerificationRecordSha256:
            snapshot.head.latestVerificationRecordSha256,
          humanContentValidationClaimed: false,
          independentExternalNotarizationClaimed: false,
        },
        null,
        2,
      )}\n`,
    );
    return;
  }
  if (options.mode === "prepare") {
    const snapshot = loadRootOwnedCorpusExternalAnchorLedger(
      options.externalRoot,
      { allowEmpty: options.expectEmptyExternal },
    );
    if (options.expectEmptyExternal && snapshot) {
      fail("--expect-empty-external was set but the ledger already exists");
    }
    const context = readAndValidateRepositoryAnchorContext({
      repositoryRoot,
      externalSnapshot: snapshot,
      allowPendingCandidate: true,
    });
    const request = prepareCorpusExternalAnchorAppendRequest({
      repositoryAnchorLogPath: CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
      repositoryAnchorLogBytes: context.anchorLogBytes,
      repositoryBaselineInputs: context.repositoryBaselineInputs,
      candidate: context.latestCandidate,
      externalSnapshot: snapshot,
      verifiedAt: options.verifiedAt!,
    });
    process.stdout.write(`${JSON.stringify(request, null, 2)}\n`);
    return;
  }
  if (options.mode === "check_request") {
    const request = readPreparedRequest(options.requestPath!);
    const snapshot = loadRootOwnedCorpusExternalAnchorLedger(
      options.externalRoot,
    );
    assert.ok(snapshot);
    const context = readAndValidateRepositoryAnchorContext({
      repositoryRoot,
      externalSnapshot: snapshot,
      allowPendingCandidate: true,
      externalRecordAhead: 1,
      externalLatestBinding: {
        candidate: request.candidate,
        verification: request.verification,
      },
    });
    requireRequestMatchesRepository({ request, context });
    const verification = requireRequestIsLatestExternalAppend({
      request,
      snapshot,
    });
    if (snapshot.records.length !== context.pairs.length + 1) {
      fail(
        "latest request is not exactly one external append beyond repository history",
      );
    }
    process.stdout.write(
      `${JSON.stringify(
        {
          status: "prepared_request_is_latest_external_append",
          requestSha256: request.requestSha256,
          externalRecordSha256: snapshot.head.latestRecordSha256,
          verificationRecord: verification,
          repositoryVerificationAppended: false,
          humanContentValidationClaimed: false,
          independentExternalNotarizationClaimed: false,
        },
        null,
        2,
      )}\n`,
    );
    return;
  }
  const snapshot = loadRootOwnedCorpusExternalAnchorLedger(
    options.externalRoot,
  );
  assert.ok(snapshot);
  const context = readAndValidateRepositoryAnchorContext({
    repositoryRoot,
    externalSnapshot: snapshot,
    allowPendingCandidate: false,
  });
  assert.ok(context.latestVerification);
  const verifier = createCorpusExternalAnchorVerifier({
    snapshot,
    latestCandidate: context.latestCandidate,
    latestVerification: context.latestVerification,
    latestRepositoryBaselineInputs: context.repositoryBaselineInputs,
  });
  const artifacts = buildCorpusCurrentStateArtifacts(repositoryRoot, {
    verifyTrustedEventHistoryAnchor: verifier,
  });
  writeOrCheckCorpusCurrentStateArtifacts(repositoryRoot, artifacts, true);
  process.stdout.write(
    `${JSON.stringify(
      {
        status: "current_state_verified_with_root_controlled_external_ledger",
        projectedStates: artifacts.states.length,
        projectedEvents: artifacts.events.length,
        externalRecordCount: snapshot.head.recordCount,
        latestExternalRecordSha256: snapshot.head.latestRecordSha256,
        humanContentValidationClaimed: false,
        independentExternalNotarizationClaimed: false,
      },
      null,
      2,
    )}\n`,
  );
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main();
