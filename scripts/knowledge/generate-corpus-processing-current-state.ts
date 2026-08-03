import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

import {
  canonicalCorpusJson,
  type CorpusCanonicalJsonValue,
} from "../../src/lib/knowledge/corpus-processing-lifecycle";
import {
  CORPUS_EVENT_HISTORY_ANCHOR_SCHEMA_VERSION,
  sealCorpusEventHistoryAnchorRecord,
  validateCorpusEventHistoryAnchorChain,
  type VerifyTrustedCorpusEventHistoryAnchor,
} from "../../src/lib/knowledge/corpus-processing-event-history";
import {
  projectCorpusCurrentState,
  type CorpusArtifactReference,
  type CorpusProcessingCurrentState,
  type CorpusSourceContentReference,
  type ResolveCorpusArtifact,
  type ResolveCorpusNormalizedText,
  type ResolveCorpusSourceContent,
  type VerifyCorpusHumanReviewerAuthentication,
} from "../../src/lib/knowledge/corpus-processing-current-state";

export const CORPUS_CURRENT_STATE_GENERATOR_VERSION = "1.0.0" as const;
export const CORPUS_STATE_EVENT_MANIFEST_HASH_DOMAIN =
  "food-systems/corpus-processing-state-event-manifest/v1\n" as const;
export const CORPUS_STATE_EVENT_SET_HASH_DOMAIN =
  "food-systems/corpus-processing-state-event-set/v1\n" as const;

const BASELINE_PATH = "knowledge/corpus/corpus-processing-baseline.v1.json";
const BASELINE_REGISTER_PATH =
  "knowledge/corpus/corpus-processing-register.v1.jsonl";
const BASELINE_GENERATION_MANIFEST_PATH =
  "knowledge/corpus/corpus-processing-generation-manifest.v1.json";
const GENERATOR_PATH =
  "scripts/knowledge/generate-corpus-processing-current-state.ts";

export const CORPUS_CURRENT_STATE_PATHS = Object.freeze({
  events: "knowledge/corpus/corpus-processing-state-events.v1.jsonl",
  eventManifest:
    "knowledge/corpus/corpus-processing-state-event-manifest.v1.json",
  eventHistoryAnchors:
    "knowledge/corpus/corpus-processing-state-event-history-anchors.v1.jsonl",
  currentState: "knowledge/corpus/corpus-processing-current-state.v1.jsonl",
  summary: "knowledge/corpus/corpus-processing-current-state-summary.v1.json",
  conflictQueue:
    "knowledge/corpus/corpus-processing-state-conflict-queue.v1.jsonl",
  generationManifest:
    "knowledge/corpus/corpus-processing-current-state-generation-manifest.v1.json",
});

type JsonObject = { [key: string]: JsonValue };
type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];

type FileDescriptor = {
  path: string;
  sha256: string;
  sizeBytes: number;
};

export type CorpusResolvedEventEvidence = {
  trackedArtifacts: Array<{
    artifactType: CorpusArtifactReference["artifactType"];
    artifactId: string;
    artifactVersion: string;
    path: string;
    fileSha256: string;
    sizeBytes: number;
  }>;
  sourceContents: Array<{
    artifactId: string;
    artifactVersion: string;
    locator: string;
    contentSha256: string;
    sizeBytes: number;
  }>;
  normalizedTextUnits: Array<{
    locator: string;
    contentSha256: string;
    sizeBytes: number;
  }>;
  absolutePrivatePathsPersisted: false;
  sourceTextPersisted: false;
};

type Baseline = {
  schemaVersion: "1.0.0";
  baselineId: string;
  observedAt: string;
  expectedActiveRows: number;
};

type BaselineGenerationManifest = {
  schemaVersion: "1.0.0";
  inputs: FileDescriptor[];
  outputs: FileDescriptor[];
};

export type CorpusStateEventManifest = {
  schemaVersion: "1.0.0";
  manifestId: "corpus-processing-state-event-manifest.v1";
  eventLog: FileDescriptor;
  eventCount: number;
  firstEventSha256: string | null;
  lastEventSha256: string | null;
  highWatermarkOccurredAt: string | null;
  eventSetSha256: string;
  initializedAt: string;
  semantics: {
    appendOnly: true;
    oneTargetIdentityPerEvent: true;
    automaticFanOutAllowed: false;
    artifactPresenceChangesState: false;
  };
  manifestSha256: string;
};

export type GeneratedArtifact = {
  path: string;
  content: string;
};

export type CorpusCurrentStateArtifacts = {
  states: CorpusProcessingCurrentState[];
  events: unknown[];
  summary: JsonObject;
  conflictQueue: JsonObject[];
  eventHistory: ReturnType<typeof validateCorpusEventHistoryAnchorChain>;
  bundle: GeneratedArtifact[];
};

function rawSha256(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

function prefixedSha256(value: string | Buffer): string {
  return `sha256:${rawSha256(value)}`;
}

function exactEvidenceEntry<T extends JsonObject>(
  entries: Map<string, T>,
  key: string,
  value: T,
): void {
  const existing = entries.get(key);
  if (
    existing &&
    canonicalCorpusJson(existing as CorpusCanonicalJsonValue) !==
      canonicalCorpusJson(value as CorpusCanonicalJsonValue)
  ) {
    throw new Error(`Resolved event evidence changed for ${key}`);
  }
  entries.set(key, value);
}

export function createRecordingCorpusEvidenceResolvers(input: {
  resolveArtifact: ResolveCorpusArtifact;
  resolveSourceContent: ResolveCorpusSourceContent;
  resolveNormalizedText: ResolveCorpusNormalizedText;
}): {
  resolveArtifact: ResolveCorpusArtifact;
  resolveSourceContent: ResolveCorpusSourceContent;
  resolveNormalizedText: ResolveCorpusNormalizedText;
  snapshot: () => CorpusResolvedEventEvidence;
} {
  const trackedArtifacts = new Map<
    string,
    CorpusResolvedEventEvidence["trackedArtifacts"][number]
  >();
  const sourceContents = new Map<
    string,
    CorpusResolvedEventEvidence["sourceContents"][number]
  >();
  const normalizedTextUnits = new Map<
    string,
    CorpusResolvedEventEvidence["normalizedTextUnits"][number]
  >();
  return {
    resolveArtifact: (reference) => {
      const resolved = input.resolveArtifact(reference);
      const bytes = Buffer.isBuffer(resolved.bytes)
        ? resolved.bytes
        : Buffer.from(resolved.bytes, "utf8");
      exactEvidenceEntry(trackedArtifacts, reference.path, {
        artifactType: reference.artifactType,
        artifactId: reference.artifactId,
        artifactVersion: reference.artifactVersion,
        path: reference.path,
        fileSha256: prefixedSha256(bytes),
        sizeBytes: bytes.length,
      });
      return resolved;
    },
    resolveSourceContent: (reference) => {
      const bytes = input.resolveSourceContent(reference);
      exactEvidenceEntry(sourceContents, reference.locator, {
        artifactId: reference.artifactId,
        artifactVersion: reference.artifactVersion,
        locator: reference.locator,
        contentSha256: prefixedSha256(bytes),
        sizeBytes: bytes.length,
      });
      return bytes;
    },
    resolveNormalizedText: (locator) => {
      const bytes = input.resolveNormalizedText(locator);
      exactEvidenceEntry(normalizedTextUnits, locator, {
        locator,
        contentSha256: prefixedSha256(bytes),
        sizeBytes: bytes.length,
      });
      return bytes;
    },
    snapshot: () => ({
      trackedArtifacts: [...trackedArtifacts.values()].sort((a, b) =>
        a.path.localeCompare(b.path),
      ),
      sourceContents: [...sourceContents.values()].sort((a, b) =>
        a.locator.localeCompare(b.locator),
      ),
      normalizedTextUnits: [...normalizedTextUnits.values()].sort((a, b) =>
        a.locator.localeCompare(b.locator),
      ),
      absolutePrivatePathsPersisted: false,
      sourceTextPersisted: false,
    }),
  };
}

function domainHash(domain: string, value: CorpusCanonicalJsonValue): string {
  return `sha256:${rawSha256(`${domain}${canonicalCorpusJson(value)}`)}`;
}

function prettyJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function jsonLines(values: unknown[]): string {
  return values.length === 0
    ? ""
    : `${values.map((value) => JSON.stringify(value)).join("\n")}\n`;
}

function parseJson(path: string, content: string): unknown {
  try {
    return JSON.parse(content);
  } catch (error) {
    throw new Error(`Invalid JSON in ${path}: ${(error as Error).message}`);
  }
}

function parseJsonLines(path: string, content: string): unknown[] {
  if (content.length === 0) return [];
  if (!content.endsWith("\n"))
    throw new Error(`${path} must end with a newline`);
  return content
    .trimEnd()
    .split("\n")
    .map((line, index) => {
      try {
        return JSON.parse(line);
      } catch (error) {
        throw new Error(
          `Invalid JSONL in ${path}:${index + 1}: ${(error as Error).message}`,
        );
      }
    });
}

function fileDescriptor(
  root: string,
  path: string,
  overrideBytes?: Buffer,
): FileDescriptor {
  const content = overrideBytes ?? readFileSync(resolve(root, path));
  return { path, sha256: rawSha256(content), sizeBytes: content.length };
}

function generatedDescriptor(item: GeneratedArtifact): FileDescriptor {
  return {
    path: item.path,
    sha256: rawSha256(item.content),
    sizeBytes: Buffer.byteLength(item.content),
  };
}

function validateFileDescriptor(
  root: string,
  descriptor: FileDescriptor,
  label: string,
): void {
  const observed = fileDescriptor(root, descriptor.path);
  assert.deepEqual(
    observed,
    descriptor,
    `${label} descriptor is stale for ${descriptor.path}`,
  );
}

function eventSetSha256(events: unknown[]): string {
  return domainHash(
    CORPUS_STATE_EVENT_SET_HASH_DOMAIN,
    events as CorpusCanonicalJsonValue,
  );
}

function eventManifestSha256(
  manifest: Omit<CorpusStateEventManifest, "manifestSha256">,
): string {
  return domainHash(
    CORPUS_STATE_EVENT_MANIFEST_HASH_DOMAIN,
    manifest as unknown as CorpusCanonicalJsonValue,
  );
}

function validateEventManifest(
  root: string,
  value: unknown,
  events: unknown[],
  expectedInitializedAt: string,
): CorpusStateEventManifest {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Corpus state event manifest must be an object");
  }
  const manifest = value as unknown as CorpusStateEventManifest;
  const expectedKeys = [
    "eventCount",
    "eventLog",
    "eventSetSha256",
    "firstEventSha256",
    "highWatermarkOccurredAt",
    "initializedAt",
    "lastEventSha256",
    "manifestId",
    "manifestSha256",
    "schemaVersion",
    "semantics",
  ];
  assert.deepEqual(
    Object.keys(manifest).sort(),
    expectedKeys,
    "Event manifest keys differ",
  );
  assert.equal(manifest.schemaVersion, "1.0.0");
  assert.equal(
    manifest.manifestId,
    "corpus-processing-state-event-manifest.v1",
  );
  assert.equal(manifest.eventLog.path, CORPUS_CURRENT_STATE_PATHS.events);
  validateFileDescriptor(root, manifest.eventLog, "Event log");
  assert.equal(
    manifest.eventCount,
    events.length,
    "Event count differs from event log",
  );
  const first = events.at(0) as Record<string, unknown> | undefined;
  const last = events.at(-1) as Record<string, unknown> | undefined;
  assert.equal(manifest.firstEventSha256, first?.eventSha256 ?? null);
  assert.equal(manifest.lastEventSha256, last?.eventSha256 ?? null);
  assert.equal(manifest.highWatermarkOccurredAt, last?.occurredAt ?? null);
  assert.equal(manifest.eventSetSha256, eventSetSha256(events));
  assert.equal(
    manifest.initializedAt,
    expectedInitializedAt,
    "Event manifest initialization differs from the baseline observation",
  );
  assert.deepEqual(manifest.semantics, {
    appendOnly: true,
    oneTargetIdentityPerEvent: true,
    automaticFanOutAllowed: false,
    artifactPresenceChangesState: false,
  });
  const { manifestSha256, ...body } = manifest;
  assert.equal(manifestSha256, eventManifestSha256(body));
  return manifest;
}

function readBaseline(root: string): Baseline {
  const baseline = parseJson(
    BASELINE_PATH,
    readFileSync(resolve(root, BASELINE_PATH), "utf8"),
  ) as Baseline;
  assert.equal(baseline.schemaVersion, "1.0.0");
  assert.match(baseline.baselineId, /^[a-z0-9][a-z0-9._:-]*$/);
  assert.ok(Number.isFinite(Date.parse(baseline.observedAt)));
  assert.ok(
    Number.isInteger(baseline.expectedActiveRows) &&
      baseline.expectedActiveRows > 0,
  );
  return baseline;
}

function verifyBaselineGeneration(
  root: string,
  baseline: Baseline,
): BaselineGenerationManifest {
  const manifest = parseJson(
    BASELINE_GENERATION_MANIFEST_PATH,
    readFileSync(resolve(root, BASELINE_GENERATION_MANIFEST_PATH), "utf8"),
  ) as BaselineGenerationManifest;
  assert.equal(manifest.schemaVersion, "1.0.0");
  const baselineDescriptor = manifest.inputs.find(
    (item) => item.path === BASELINE_PATH,
  );
  const registerDescriptor = manifest.outputs.find(
    (item) => item.path === BASELINE_REGISTER_PATH,
  );
  assert.ok(
    baselineDescriptor,
    "Baseline generation manifest does not bind the baseline definition",
  );
  assert.ok(
    registerDescriptor,
    "Baseline generation manifest does not bind the baseline register",
  );
  validateFileDescriptor(root, baselineDescriptor, "Baseline input");
  validateFileDescriptor(root, registerDescriptor, "Baseline register");
  const rows = parseJsonLines(
    BASELINE_REGISTER_PATH,
    readFileSync(resolve(root, BASELINE_REGISTER_PATH), "utf8"),
  );
  assert.equal(rows.length, baseline.expectedActiveRows);
  return manifest;
}

export function resolveTrackedArtifact(root: string): ResolveCorpusArtifact {
  const canonicalRoot = realpathSync(root);
  return (reference: CorpusArtifactReference) => {
    const absolutePath = resolve(canonicalRoot, reference.path);
    const lexicalRelativePath = relative(canonicalRoot, absolutePath);
    if (
      lexicalRelativePath === ".." ||
      lexicalRelativePath.startsWith(`..${sep}`)
    ) {
      throw new Error(
        `Artifact path escapes repository root: ${reference.path}`,
      );
    }
    const canonicalPath = realpathSync(absolutePath);
    const canonicalRelativePath = relative(canonicalRoot, canonicalPath);
    if (
      canonicalPath !== absolutePath ||
      canonicalRelativePath === ".." ||
      canonicalRelativePath.startsWith(`..${sep}`)
    ) {
      throw new Error(
        `Artifact path traverses a symlink or escapes repository root: ${reference.path}`,
      );
    }
    const stat = lstatSync(canonicalPath);
    if (!stat.isFile() || stat.isSymbolicLink()) {
      throw new Error(
        `Artifact is not a regular tracked file: ${reference.path}`,
      );
    }
    try {
      execFileSync(
        "git",
        [
          "-C",
          canonicalRoot,
          "ls-files",
          "--error-unmatch",
          "--",
          reference.path,
        ],
        { stdio: "ignore" },
      );
    } catch {
      throw new Error(`Artifact is not Git-tracked: ${reference.path}`);
    }
    const bytes = readFileSync(canonicalPath);
    const byteOnlyArtifact =
      reference.artifactType === "source_identity_workflow" ||
      reference.artifactType === "source_identity_prompt_template" ||
      reference.artifactType === "source_analysis_workflow" ||
      reference.artifactType === "source_analysis_prompt_template";
    return {
      value: byteOnlyArtifact
        ? bytes.toString("utf8")
        : parseJson(reference.path, bytes.toString("utf8")),
      fileSha256: prefixedSha256(bytes),
      bytes,
    };
  };
}

export function resolveTrackedSourceContent(
  root: string,
): ResolveCorpusSourceContent {
  const canonicalRoot = realpathSync(root);
  return (reference: CorpusSourceContentReference) => {
    let allowedRoot = canonicalRoot;
    let absolutePath: string;
    if (reference.locator.startsWith("private://corpus/")) {
      const configuredRoot = process.env.FOOD_SYSTEMS_PRIVATE_CORPUS_ROOT;
      if (!configuredRoot) {
        throw new Error(
          "FOOD_SYSTEMS_PRIVATE_CORPUS_ROOT is required for private source events",
        );
      }
      allowedRoot = realpathSync(configuredRoot);
      absolutePath = resolve(
        allowedRoot,
        reference.locator.slice("private://corpus/".length),
      );
    } else if (reference.locator.startsWith("private://bigbrain-corpus/")) {
      const configuredRoot =
        process.env.FOOD_SYSTEMS_PRIVATE_CORPUS_REPLICA_ROOT;
      if (!configuredRoot) {
        throw new Error(
          "FOOD_SYSTEMS_PRIVATE_CORPUS_REPLICA_ROOT is required for replica source events",
        );
      }
      allowedRoot = realpathSync(configuredRoot);
      absolutePath = resolve(
        allowedRoot,
        reference.locator.slice("private://bigbrain-corpus/".length),
      );
    } else if (reference.locator.startsWith("private://")) {
      throw new Error(
        `Unsupported controlled private locator: ${reference.locator}`,
      );
    } else {
      absolutePath = resolve(canonicalRoot, reference.locator);
    }
    const lexicalRelativePath = relative(allowedRoot, absolutePath);
    if (
      lexicalRelativePath === ".." ||
      lexicalRelativePath.startsWith(`..${sep}`)
    ) {
      throw new Error(
        `Source-content path escapes its allowed root: ${reference.locator}`,
      );
    }
    const canonicalPath = realpathSync(absolutePath);
    const canonicalRelativePath = relative(allowedRoot, canonicalPath);
    if (
      canonicalPath !== absolutePath ||
      canonicalRelativePath === ".." ||
      canonicalRelativePath.startsWith(`..${sep}`)
    ) {
      throw new Error(
        `Source-content path traverses a symlink or escapes its allowed root: ${reference.locator}`,
      );
    }
    const stat = lstatSync(canonicalPath);
    if (!stat.isFile() || stat.isSymbolicLink()) {
      throw new Error(
        `Source content is not a regular tracked file: ${reference.locator}`,
      );
    }
    return readFileSync(canonicalPath);
  };
}

export function resolveControlledNormalizedText(): ResolveCorpusNormalizedText {
  return (locator: string) => {
    let rootEnvironmentVariable: string;
    let relativePath: string;
    if (locator.startsWith("private://corpus/")) {
      rootEnvironmentVariable = "FOOD_SYSTEMS_PRIVATE_CORPUS_ROOT";
      relativePath = locator.slice("private://corpus/".length);
    } else if (locator.startsWith("private://bigbrain-corpus/")) {
      rootEnvironmentVariable = "FOOD_SYSTEMS_PRIVATE_CORPUS_REPLICA_ROOT";
      relativePath = locator.slice("private://bigbrain-corpus/".length);
    } else {
      throw new Error(`Unsupported normalized-text locator: ${locator}`);
    }
    const configuredRoot = process.env[rootEnvironmentVariable];
    if (!configuredRoot) {
      throw new Error(
        `${rootEnvironmentVariable} is required for source-analysis events`,
      );
    }
    const allowedRoot = realpathSync(configuredRoot);
    const absolutePath = resolve(allowedRoot, relativePath);
    const lexicalRelativePath = relative(allowedRoot, absolutePath);
    if (
      lexicalRelativePath === ".." ||
      lexicalRelativePath.startsWith(`..${sep}`)
    ) {
      throw new Error(
        `Normalized-text path escapes its allowed root: ${locator}`,
      );
    }
    const canonicalPath = realpathSync(absolutePath);
    const canonicalRelativePath = relative(allowedRoot, canonicalPath);
    if (
      canonicalPath !== absolutePath ||
      canonicalRelativePath === ".." ||
      canonicalRelativePath.startsWith(`..${sep}`)
    ) {
      throw new Error(
        `Normalized-text path traverses a symlink or escapes its allowed root: ${locator}`,
      );
    }
    const before = lstatSync(canonicalPath);
    if (
      !before.isFile() ||
      before.isSymbolicLink() ||
      before.nlink !== 1 ||
      (before.mode & 0o777) !== 0o400
    ) {
      throw new Error(
        `Normalized text must be a private 0400 single-link regular file: ${locator}`,
      );
    }
    const bytes = readFileSync(canonicalPath);
    const after = lstatSync(canonicalPath);
    if (
      before.dev !== after.dev ||
      before.ino !== after.ino ||
      before.size !== after.size ||
      before.mtimeMs !== after.mtimeMs ||
      bytes.length !== after.size
    ) {
      throw new Error(`Normalized text changed while being read: ${locator}`);
    }
    return bytes;
  };
}

function countBy<T>(
  values: T[],
  key: (value: T) => string,
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const value of values) {
    const name = key(value);
    counts[name] = (counts[name] ?? 0) + 1;
  }
  return Object.fromEntries(
    Object.entries(counts).sort(([left], [right]) =>
      left < right ? -1 : left > right ? 1 : 0,
    ),
  );
}

function buildSummary(
  baseline: Baseline,
  eventManifest: CorpusStateEventManifest,
  events: unknown[],
  states: CorpusProcessingCurrentState[],
  eventHistory: ReturnType<typeof validateCorpusEventHistoryAnchorChain>,
): JsonObject {
  return {
    schemaVersion: "1.0.0",
    summaryId: "corpus-processing-current-state-summary.v1",
    generatorVersion: CORPUS_CURRENT_STATE_GENERATOR_VERSION,
    baseline: {
      baselineId: baseline.baselineId,
      observedAt: baseline.observedAt,
      expectedRows: baseline.expectedActiveRows,
    },
    eventLog: {
      eventCount: eventManifest.eventCount,
      eventSetSha256: eventManifest.eventSetSha256,
      highWatermarkOccurredAt: eventManifest.highWatermarkOccurredAt,
      byEventType: countBy(events, (event) =>
        String((event as Record<string, unknown>).eventType),
      ),
      historyAnchorRecordCount: eventHistory.records.length,
      currentCheckpointTrusted: eventHistory.currentCheckpointTrusted,
      nonEmptyProjectionRequiresTrustedCheckpoint: true,
    },
    projection: {
      rowCount: states.length,
      identityUnique:
        new Set(states.map((state) => state.identityKey)).size ===
        states.length,
      byStateVersion: countBy(states, (state) => String(state.stateVersion)),
      byLifecycleStage: countBy(
        states,
        (state) =>
          `${state.lifecycle.aiProcessingStatus.currentStage}:${state.lifecycle.aiProcessingStatus.state}`,
      ),
      byTextAvailability: countBy(
        states,
        (state) => state.lifecycle.textAvailability.state,
      ),
      byIdentityStatus: countBy(
        states,
        (state) => state.lifecycle.sourceIdentity.identityStatus,
      ),
      readyForOwner: states.filter(
        (state) => state.permissions.aiReadyForOwnerReview,
      ).length,
      ownerApprovedInternal: states.filter(
        (state) => state.permissions.ownerApprovedForInternalUse,
      ).length,
      externalUseAllowed: states.filter(
        (state) => state.permissions.externalUseAllowed,
      ).length,
      coveragePromotionAllowed: states.filter(
        (state) => state.permissions.coveragePromotionAllowed,
      ).length,
    },
    conflicts: {
      count: 0,
      publicationRule:
        "Any invalid, stale, forked, orphaned or duplicate event aborts projection before outputs are replaced.",
    },
    semantics: {
      baselineImmutable: true,
      currentStateDerivedOnly: true,
      artifactPresenceChangesState: false,
      separateIdentityApplicationRequired: true,
      automaticDeduplicationFanOutAllowed: false,
      noResearchCompletenessInference: true,
      reviewRightsPublicationAndCoverageRemainSeparate: true,
    },
  };
}

function buildGenerationManifest(
  root: string,
  baseline: Baseline,
  eventManifest: CorpusStateEventManifest,
  resolvedEventEvidence: CorpusResolvedEventEvidence,
  outputs: GeneratedArtifact[],
  eventHistoryAnchorBytes?: Buffer,
): JsonObject {
  const inputPaths = [
    BASELINE_PATH,
    BASELINE_GENERATION_MANIFEST_PATH,
    BASELINE_REGISTER_PATH,
    "src/lib/knowledge/corpus-processing-lifecycle.ts",
    "src/lib/knowledge/corpus-processing-event-history.ts",
    "src/lib/knowledge/corpus-processing-current-state.ts",
    "src/lib/knowledge/pdf-page-extraction-qualification.ts",
    "src/lib/knowledge/source-analysis-input-manifest.ts",
    "src/lib/knowledge/source-acquisition-receipt.ts",
    "src/lib/knowledge/source-identity-verification.ts",
    "src/lib/knowledge/source-analysis-artifact.ts",
    "knowledge/schema/corpus-processing-lifecycle.schema.v1.json",
    "knowledge/schema/corpus-processing-event-history-anchor.schema.v1.json",
    "knowledge/schema/corpus-processing-state-event.schema.v1.json",
    "knowledge/schema/corpus-processing-current-state.schema.v1.json",
    "knowledge/schema/corpus-ready-for-owner-package.schema.v1.json",
    "knowledge/schema/source-acquisition-receipt.schema.v1.json",
    CORPUS_CURRENT_STATE_PATHS.events,
    CORPUS_CURRENT_STATE_PATHS.eventManifest,
    CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
    GENERATOR_PATH,
  ];
  return {
    schemaVersion: "1.0.0",
    manifestId: "corpus-processing-current-state-generation-manifest.v1",
    generator: GENERATOR_PATH,
    generatorVersion: CORPUS_CURRENT_STATE_GENERATOR_VERSION,
    baselineId: baseline.baselineId,
    baselineObservedAt: baseline.observedAt,
    eventHighWatermarkOccurredAt: eventManifest.highWatermarkOccurredAt,
    commitMarkerSemantics:
      "The generation manifest is renamed last. Consumers must verify every listed input and output before using the projection.",
    inputs: inputPaths.map((path) =>
      fileDescriptor(
        root,
        path,
        path === CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors
          ? eventHistoryAnchorBytes
          : undefined,
      ),
    ),
    resolvedEventEvidence,
    outputs: outputs.map(generatedDescriptor),
  };
}

export function buildCorpusCurrentStateArtifacts(
  root: string,
  options: {
    verifyTrustedEventHistoryAnchor?: VerifyTrustedCorpusEventHistoryAnchor;
    verifyHumanReviewerAuthentication?: VerifyCorpusHumanReviewerAuthentication;
    /**
     * Proposed canonical anchor-log bytes used only for validation and output
     * construction. This lets a transactional writer build the exact derived
     * bundle before it changes the repository anchor file.
     */
    eventHistoryAnchorBytes?: Buffer;
  } = {},
): CorpusCurrentStateArtifacts {
  const baseline = readBaseline(root);
  verifyBaselineGeneration(root, baseline);
  const baselineRegisterContent = readFileSync(
    resolve(root, BASELINE_REGISTER_PATH),
    "utf8",
  );
  const baselineRows = parseJsonLines(
    BASELINE_REGISTER_PATH,
    baselineRegisterContent,
  );
  const eventContent = readFileSync(
    resolve(root, CORPUS_CURRENT_STATE_PATHS.events),
    "utf8",
  );
  const events = parseJsonLines(
    CORPUS_CURRENT_STATE_PATHS.events,
    eventContent,
  );
  const eventManifestContent = readFileSync(
    resolve(root, CORPUS_CURRENT_STATE_PATHS.eventManifest),
  );
  const eventManifest = validateEventManifest(
    root,
    parseJson(
      CORPUS_CURRENT_STATE_PATHS.eventManifest,
      eventManifestContent.toString("utf8"),
    ),
    events,
    baseline.observedAt,
  );
  const eventHistoryAnchorBytes = options.eventHistoryAnchorBytes
    ? Buffer.from(options.eventHistoryAnchorBytes)
    : readFileSync(
        resolve(root, CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors),
      );
  const eventHistory = validateCorpusEventHistoryAnchorChain({
    records: parseJsonLines(
      CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
      eventHistoryAnchorBytes.toString("utf8"),
    ),
    eventLogPath: CORPUS_CURRENT_STATE_PATHS.events,
    eventLogBytes: Buffer.from(eventContent, "utf8"),
    events,
    eventSetSha256,
    currentEventManifest: {
      path: CORPUS_CURRENT_STATE_PATHS.eventManifest,
      bytes: eventManifestContent,
      manifestSha256: eventManifest.manifestSha256,
    },
    verifyTrustedAnchor: options.verifyTrustedEventHistoryAnchor,
    requireCurrentCheckpointTrusted: events.length > 0,
  });
  const evidenceResolvers = createRecordingCorpusEvidenceResolvers({
    resolveArtifact: resolveTrackedArtifact(root),
    resolveSourceContent: resolveTrackedSourceContent(root),
    resolveNormalizedText: resolveControlledNormalizedText(),
  });
  const states = projectCorpusCurrentState({
    baselineId: baseline.baselineId,
    baselineManifestSha256: prefixedSha256(
      readFileSync(resolve(root, BASELINE_GENERATION_MANIFEST_PATH)),
    ),
    baselineRegisterSha256: prefixedSha256(baselineRegisterContent),
    baselineRows,
    events,
    resolveArtifact: evidenceResolvers.resolveArtifact,
    resolveSourceContent: evidenceResolvers.resolveSourceContent,
    resolveNormalizedText: evidenceResolvers.resolveNormalizedText,
    verifyHumanReviewerAuthentication:
      options.verifyHumanReviewerAuthentication,
  });
  assert.equal(states.length, baseline.expectedActiveRows);
  const summary = buildSummary(
    baseline,
    eventManifest,
    events,
    states,
    eventHistory,
  );
  const conflictQueue: JsonObject[] = [];
  const outputs: GeneratedArtifact[] = [
    {
      path: CORPUS_CURRENT_STATE_PATHS.currentState,
      content: jsonLines(states),
    },
    {
      path: CORPUS_CURRENT_STATE_PATHS.summary,
      content: prettyJson(summary),
    },
    {
      path: CORPUS_CURRENT_STATE_PATHS.conflictQueue,
      content: jsonLines(conflictQueue),
    },
  ];
  const generationManifest = buildGenerationManifest(
    root,
    baseline,
    eventManifest,
    evidenceResolvers.snapshot(),
    outputs,
    eventHistoryAnchorBytes,
  );
  return {
    states,
    events,
    summary,
    conflictQueue,
    eventHistory,
    bundle: [
      ...outputs,
      {
        path: CORPUS_CURRENT_STATE_PATHS.generationManifest,
        content: prettyJson(generationManifest),
      },
    ],
  };
}

function atomicWriteBundle(root: string, bundle: GeneratedArtifact[]): void {
  const staged: Array<{ target: string; temporary: string }> = [];
  try {
    for (const [index, item] of bundle.entries()) {
      const target = resolve(root, item.path);
      mkdirSync(dirname(target), { recursive: true });
      const temporary = resolve(
        dirname(target),
        `.${process.pid}.${index}.${Date.now()}.tmp`,
      );
      writeFileSync(temporary, item.content, { encoding: "utf8", flag: "wx" });
      staged.push({ target, temporary });
    }
    for (const item of staged) renameSync(item.temporary, item.target);
  } finally {
    for (const item of staged) {
      if (existsSync(item.temporary)) unlinkSync(item.temporary);
    }
  }
}

export function writeOrCheckCorpusCurrentStateArtifacts(
  root: string,
  artifacts: CorpusCurrentStateArtifacts,
  check: boolean,
): void {
  if (check) {
    for (const item of artifacts.bundle) {
      const target = resolve(root, item.path);
      assert.ok(
        existsSync(target),
        `Missing generated current-state file: ${item.path}`,
      );
      assert.equal(
        readFileSync(target, "utf8"),
        item.content,
        `Generated current-state file is stale: ${item.path}`,
      );
    }
    return;
  }
  atomicWriteBundle(root, artifacts.bundle);
}

function genesisEventHistoryAnchorContent(input: {
  eventContent: string;
  manifestContent: string;
  manifest: CorpusStateEventManifest;
  createdAt: string;
}): string {
  assert.equal(input.eventContent, "", "Genesis event log must be empty");
  assert.equal(input.manifest.eventCount, 0, "Genesis manifest must be empty");
  const candidate = sealCorpusEventHistoryAnchorRecord({
    schemaVersion: CORPUS_EVENT_HISTORY_ANCHOR_SCHEMA_VERSION,
    recordType: "history_anchor_candidate" as const,
    anchorId: `anchor.event-history.genesis.${input.manifest.manifestSha256.slice("sha256:".length)}`,
    sequence: 1,
    predecessorRecordSha256: null,
    eventLogPrefix: {
      path: CORPUS_CURRENT_STATE_PATHS.events,
      fileSha256: prefixedSha256(input.eventContent),
      sizeBytes: 0,
    },
    eventCount: 0,
    firstEventSha256: null,
    lastEventSha256: null,
    eventSetSha256: eventSetSha256([]),
    eventManifest: {
      path: CORPUS_CURRENT_STATE_PATHS.eventManifest,
      fileSha256: prefixedSha256(input.manifestContent),
      sizeBytes: Buffer.byteLength(input.manifestContent),
      manifestSha256: input.manifest.manifestSha256,
    },
    createdAt: input.createdAt,
  });
  return jsonLines([candidate]);
}

export function initializeEmptyCorpusStateEventLog(root: string): void {
  const eventPath = resolve(root, CORPUS_CURRENT_STATE_PATHS.events);
  const manifestPath = resolve(root, CORPUS_CURRENT_STATE_PATHS.eventManifest);
  const anchorPath = resolve(
    root,
    CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
  );
  if (
    existsSync(eventPath) ||
    existsSync(manifestPath) ||
    existsSync(anchorPath)
  ) {
    throw new Error(
      "Refusing to initialize over an existing event log, manifest or history-anchor log",
    );
  }
  const baseline = readBaseline(root);
  const eventContent = "";
  const body: Omit<CorpusStateEventManifest, "manifestSha256"> = {
    schemaVersion: "1.0.0",
    manifestId: "corpus-processing-state-event-manifest.v1",
    eventLog: {
      path: CORPUS_CURRENT_STATE_PATHS.events,
      sha256: rawSha256(eventContent),
      sizeBytes: 0,
    },
    eventCount: 0,
    firstEventSha256: null,
    lastEventSha256: null,
    highWatermarkOccurredAt: null,
    eventSetSha256: eventSetSha256([]),
    initializedAt: baseline.observedAt,
    semantics: {
      appendOnly: true,
      oneTargetIdentityPerEvent: true,
      automaticFanOutAllowed: false,
      artifactPresenceChangesState: false,
    },
  };
  const manifest: CorpusStateEventManifest = {
    ...body,
    manifestSha256: eventManifestSha256(body),
  };
  const manifestContent = prettyJson(manifest);
  atomicWriteBundle(root, [
    { path: CORPUS_CURRENT_STATE_PATHS.events, content: eventContent },
    {
      path: CORPUS_CURRENT_STATE_PATHS.eventManifest,
      content: manifestContent,
    },
    {
      path: CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
      content: genesisEventHistoryAnchorContent({
        eventContent,
        manifestContent,
        manifest,
        createdAt: baseline.observedAt,
      }),
    },
  ]);
}

export function initializeGenesisCorpusEventHistoryAnchor(root: string): void {
  const anchorPath = resolve(
    root,
    CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
  );
  if (existsSync(anchorPath)) {
    throw new Error(
      "Refusing to overwrite an existing event history-anchor log",
    );
  }
  const baseline = readBaseline(root);
  const eventContent = readFileSync(
    resolve(root, CORPUS_CURRENT_STATE_PATHS.events),
    "utf8",
  );
  const events = parseJsonLines(
    CORPUS_CURRENT_STATE_PATHS.events,
    eventContent,
  );
  assert.equal(events.length, 0, "Genesis anchor requires an empty event log");
  const manifestContent = readFileSync(
    resolve(root, CORPUS_CURRENT_STATE_PATHS.eventManifest),
    "utf8",
  );
  const manifest = validateEventManifest(
    root,
    parseJson(CORPUS_CURRENT_STATE_PATHS.eventManifest, manifestContent),
    events,
    baseline.observedAt,
  );
  atomicWriteBundle(root, [
    {
      path: CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
      content: genesisEventHistoryAnchorContent({
        eventContent,
        manifestContent,
        manifest,
        createdAt: baseline.observedAt,
      }),
    },
  ]);
}

export type CorpusCurrentStateCliOptions = {
  check: boolean;
  initializeEvents: boolean;
  initializeHistoryAnchor: boolean;
};

export function parseCorpusCurrentStateCliArgs(
  args: string[],
): CorpusCurrentStateCliOptions {
  const unknown = args.filter(
    (arg) =>
      ![
        "--check",
        "--initialize-events",
        "--initialize-history-anchor",
      ].includes(arg),
  );
  if (unknown.length > 0)
    throw new Error(`Unknown arguments: ${unknown.join(", ")}`);
  const selectedModes = [
    args.includes("--check"),
    args.includes("--initialize-events"),
    args.includes("--initialize-history-anchor"),
  ].filter(Boolean).length;
  if (selectedModes > 1) {
    throw new Error("Choose only one current-state execution mode");
  }
  return {
    check: args.includes("--check"),
    initializeEvents: args.includes("--initialize-events"),
    initializeHistoryAnchor: args.includes("--initialize-history-anchor"),
  };
}

function main(): void {
  const root = process.cwd();
  const options = parseCorpusCurrentStateCliArgs(process.argv.slice(2));
  if (options.initializeEvents) {
    initializeEmptyCorpusStateEventLog(root);
    process.stdout.write(
      "Initialized empty corpus state event log and sealed manifest.\n",
    );
    return;
  }
  if (options.initializeHistoryAnchor) {
    initializeGenesisCorpusEventHistoryAnchor(root);
    process.stdout.write(
      "Initialized unverified genesis event-history anchor candidate.\n",
    );
    return;
  }
  const artifacts = buildCorpusCurrentStateArtifacts(root);
  writeOrCheckCorpusCurrentStateArtifacts(root, artifacts, options.check);
  process.stdout.write(
    `${options.check ? "Verified" : "Generated"} ${artifacts.states.length} projected corpus states from ${artifacts.events.length} events.\n`,
  );
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main();
