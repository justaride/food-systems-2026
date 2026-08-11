import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import fs from "node:fs";
import { syncBuiltinESMExports } from "node:module";
import { resolve } from "node:path";

import {
  canonicalCorpusJson,
  type CorpusCanonicalJsonValue,
} from "../../src/lib/knowledge/corpus-processing-lifecycle";
import {
  CORPUS_EVENT_HISTORY_ANCHOR_SCHEMA_VERSION,
  sealCorpusEventHistoryAnchorRecord,
} from "../../src/lib/knowledge/corpus-processing-event-history";
import {
  CORPUS_CURRENT_STATE_GENERATOR_VERSION,
  CORPUS_CURRENT_STATE_PATHS,
  CORPUS_STATE_EVENT_MANIFEST_HASH_DOMAIN,
  CORPUS_STATE_EVENT_SET_HASH_DOMAIN,
  buildCorpusCurrentStateArtifacts,
  type CorpusCurrentStateArtifacts,
  type CorpusStateEventManifest,
  type GeneratedArtifact,
} from "./generate-corpus-processing-current-state";
import {
  CORPUS_PROCESSING_PATHS,
  buildCorpusProcessingArtifacts,
  type CorpusProcessingArtifacts,
} from "./generate-corpus-processing-register";

export const CORPUS_PRE_LIVE_REBASELINE_OVERLAY_PATH =
  "scripts/knowledge/build-corpus-pre-live-rebaseline-overlays.ts" as const;
export const CORPUS_PROCESSING_BASELINE_PATH =
  "knowledge/corpus/corpus-processing-baseline.v1.json" as const;
export const CORPUS_PROCESSING_LEDGER_PATH =
  "research/_status/library-analysis-ledger.jsonl" as const;
export const CORPUS_PROCESSING_LIVE_SNAPSHOT_PATH =
  "knowledge/corpus/corpus-live-inventory-snapshot.v1.json" as const;

const LEGACY_GENERATOR_BASELINE_ROWS = 1555;
const POST_REGISTRATION_ACTIVE_ROWS = 1565;
const originalReadFileSync = fs.readFileSync.bind(fs);

type JsonObject = Record<string, unknown>;
type FileDescriptor = { path: string; sha256: string; sizeBytes: number };

export type CorpusPreLiveRebaselineBaseline = {
  schemaVersion: "1.0.0";
  baselineId: "whole-corpus-processing-baseline.v1";
  observedAt: string;
  ledgerObservedAt: string;
  expectedActiveRows: number;
  expectedRetainedHistoryRows: number;
  retainedHistoryNonAdditive: true;
  authoritativeInventorySnapshot: {
    path: typeof CORPUS_PROCESSING_LIVE_SNAPSHOT_PATH;
    snapshotId: "library-analysis-live-inventory.v1";
    observedAt: string;
    activeRows: number;
    identityContentSetSha256: string;
    sourceKindCountsSha256: string;
    ledgerSha256: string;
  };
  purpose: string;
};

export type EmptyCorpusStateBootstrapArtifacts = {
  observedAt: string;
  manifest: CorpusStateEventManifest;
  bundle: GeneratedArtifact[];
};

function rawSha256(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

function prefixedSha256(value: string | Buffer): string {
  return `sha256:${rawSha256(value)}`;
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

function descriptor(path: string, content: string | Buffer): FileDescriptor {
  const bytes = Buffer.isBuffer(content)
    ? content
    : Buffer.from(content, "utf8");
  return { path, sha256: rawSha256(bytes), sizeBytes: bytes.length };
}

function actualDescriptor(root: string, path: string): FileDescriptor {
  return descriptor(path, originalReadFileSync(resolve(root, path)));
}

function returnOverride(
  content: string,
  options?: BufferEncoding | { encoding?: BufferEncoding | null } | null,
): string | Buffer {
  const encoding =
    typeof options === "string" ? options : (options?.encoding ?? null);
  return encoding === null
    ? Buffer.from(content, "utf8")
    : Buffer.from(content, "utf8").toString(encoding);
}

function withReadFileOverlays<T>(
  root: string,
  overlays: ReadonlyMap<string, string>,
  operation: () => T,
): T {
  const absolute = new Map(
    [...overlays].map(([path, content]) => [resolve(root, path), content]),
  );
  const previous = fs.readFileSync;
  fs.readFileSync = ((path: fs.PathOrFileDescriptor, options?: unknown) => {
    if (typeof path === "string") {
      const content = absolute.get(resolve(path));
      if (content !== undefined) {
        return returnOverride(
          content,
          options as
            | BufferEncoding
            | { encoding?: BufferEncoding | null }
            | null
            | undefined,
        );
      }
    }
    return originalReadFileSync(path, options as never);
  }) as typeof fs.readFileSync;
  syncBuiltinESMExports();
  try {
    return operation();
  } finally {
    fs.readFileSync = previous;
    syncBuiltinESMExports();
  }
}

function replaceBundleArtifact(
  bundle: GeneratedArtifact[],
  path: string,
  content: string,
): GeneratedArtifact[] {
  const matches = bundle.filter((item) => item.path === path);
  assert.equal(matches.length, 1, `Expected one generated ${path}`);
  return bundle.map((item) => (item.path === path ? { path, content } : item));
}

function addOverlayProvenance(input: {
  root: string;
  manifestContent: string;
  trueBaselineContent?: string;
  purpose: "corpus_register" | "current_state";
  overlaidPaths: string[];
}): string {
  const manifest = JSON.parse(input.manifestContent) as JsonObject & {
    inputs: FileDescriptor[];
  };
  assert.ok(Array.isArray(manifest.inputs));
  if (input.trueBaselineContent !== undefined) {
    const index = manifest.inputs.findIndex(
      (item) => item.path === CORPUS_PROCESSING_BASELINE_PATH,
    );
    assert.notEqual(index, -1, "Generated manifest does not bind its baseline");
    manifest.inputs[index] = descriptor(
      CORPUS_PROCESSING_BASELINE_PATH,
      input.trueBaselineContent,
    );
  }
  assert.equal(
    manifest.inputs.some(
      (item) => item.path === CORPUS_PRE_LIVE_REBASELINE_OVERLAY_PATH,
    ),
    false,
  );
  const overlay = actualDescriptor(
    input.root,
    CORPUS_PRE_LIVE_REBASELINE_OVERLAY_PATH,
  );
  manifest.inputs.push(overlay);
  manifest.rebaselineOverlay = {
    path: overlay.path,
    sha256: overlay.sha256,
    sizeBytes: overlay.sizeBytes,
    purpose: input.purpose,
    overlaidPaths: [...input.overlaidPaths].sort(),
    compatibilityRule:
      input.purpose === "corpus_register"
        ? "legacy_generator_expectedActiveRows_assertion_only_uses_1555_while_all_generated_counts_and_true_baseline_bind_1565"
        : "read_only_in_memory_input_overlay_no_tracked_write",
    noReadinessOrCoveragePromotion: true,
  };
  return prettyJson(manifest);
}

export function buildCorpusProcessingRebaselineArtifacts(input: {
  root: string;
  baselineContent: string;
  liveSnapshotContent: string;
  ledgerContent: string;
}): CorpusProcessingArtifacts {
  const trueBaseline = JSON.parse(
    input.baselineContent,
  ) as CorpusPreLiveRebaselineBaseline;
  assert.equal(trueBaseline.expectedActiveRows, POST_REGISTRATION_ACTIVE_ROWS);
  assert.equal(
    trueBaseline.authoritativeInventorySnapshot.activeRows,
    POST_REGISTRATION_ACTIVE_ROWS,
  );
  const compatibilityBaseline = {
    ...trueBaseline,
    expectedActiveRows: LEGACY_GENERATOR_BASELINE_ROWS,
  };
  const compatibilityContent = prettyJson(compatibilityBaseline);
  const artifacts = withReadFileOverlays(
    input.root,
    new Map([
      [CORPUS_PROCESSING_BASELINE_PATH, compatibilityContent],
      [CORPUS_PROCESSING_LIVE_SNAPSHOT_PATH, input.liveSnapshotContent],
      [CORPUS_PROCESSING_LEDGER_PATH, input.ledgerContent],
    ]),
    () =>
      buildCorpusProcessingArtifacts(input.root, {
        expectedActiveRows: POST_REGISTRATION_ACTIVE_ROWS,
      }),
  );
  assert.equal(artifacts.rows.length, POST_REGISTRATION_ACTIVE_ROWS);
  const manifestArtifact = artifacts.bundle.find(
    (item) => item.path === CORPUS_PROCESSING_PATHS.generationManifest,
  );
  assert.ok(
    manifestArtifact,
    "Corpus rebaseline generation manifest is missing",
  );
  const manifestContent = addOverlayProvenance({
    root: input.root,
    manifestContent: manifestArtifact.content,
    trueBaselineContent: input.baselineContent,
    purpose: "corpus_register",
    overlaidPaths: [
      CORPUS_PROCESSING_BASELINE_PATH,
      CORPUS_PROCESSING_LIVE_SNAPSHOT_PATH,
      CORPUS_PROCESSING_LEDGER_PATH,
    ],
  });
  return {
    ...artifacts,
    bundle: replaceBundleArtifact(
      artifacts.bundle,
      CORPUS_PROCESSING_PATHS.generationManifest,
      manifestContent,
    ),
  };
}

export function buildEmptyCorpusStateRebaselineBootstrap(
  observedAt: string,
): EmptyCorpusStateBootstrapArtifacts {
  assert.ok(
    Number.isFinite(Date.parse(observedAt)) && observedAt.endsWith("Z"),
    "Empty corpus-state bootstrap observedAt must be UTC",
  );
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
    eventSetSha256: domainHash(
      CORPUS_STATE_EVENT_SET_HASH_DOMAIN,
      [] as CorpusCanonicalJsonValue,
    ),
    initializedAt: observedAt,
    semantics: {
      appendOnly: true,
      oneTargetIdentityPerEvent: true,
      automaticFanOutAllowed: false,
      artifactPresenceChangesState: false,
    },
  };
  const manifest: CorpusStateEventManifest = {
    ...body,
    manifestSha256: domainHash(
      CORPUS_STATE_EVENT_MANIFEST_HASH_DOMAIN,
      body as unknown as CorpusCanonicalJsonValue,
    ),
  };
  const manifestContent = prettyJson(manifest);
  const candidate = sealCorpusEventHistoryAnchorRecord({
    schemaVersion: CORPUS_EVENT_HISTORY_ANCHOR_SCHEMA_VERSION,
    recordType: "history_anchor_candidate" as const,
    anchorId: `anchor.event-history.genesis.${manifest.manifestSha256.slice("sha256:".length)}`,
    sequence: 1,
    predecessorRecordSha256: null,
    eventLogPrefix: {
      path: CORPUS_CURRENT_STATE_PATHS.events,
      fileSha256: prefixedSha256(eventContent),
      sizeBytes: 0,
    },
    eventCount: 0,
    firstEventSha256: null,
    lastEventSha256: null,
    eventSetSha256: body.eventSetSha256,
    eventManifest: {
      path: CORPUS_CURRENT_STATE_PATHS.eventManifest,
      fileSha256: prefixedSha256(manifestContent),
      sizeBytes: Buffer.byteLength(manifestContent),
      manifestSha256: manifest.manifestSha256,
    },
    createdAt: observedAt,
  });
  return {
    observedAt,
    manifest,
    bundle: [
      { path: CORPUS_CURRENT_STATE_PATHS.events, content: eventContent },
      {
        path: CORPUS_CURRENT_STATE_PATHS.eventManifest,
        content: manifestContent,
      },
      {
        path: CORPUS_CURRENT_STATE_PATHS.eventHistoryAnchors,
        content: jsonLines([candidate]),
      },
    ],
  };
}

export function buildCorpusCurrentStateRebaselineArtifacts(input: {
  root: string;
  overlays: ReadonlyMap<string, string>;
}): CorpusCurrentStateArtifacts {
  const artifacts = withReadFileOverlays(input.root, input.overlays, () =>
    buildCorpusCurrentStateArtifacts(input.root),
  );
  const manifestArtifact = artifacts.bundle.find(
    (item) => item.path === CORPUS_CURRENT_STATE_PATHS.generationManifest,
  );
  assert.ok(
    manifestArtifact,
    "Current-state rebaseline generation manifest is missing",
  );
  const manifestContent = addOverlayProvenance({
    root: input.root,
    manifestContent: manifestArtifact.content,
    purpose: "current_state",
    overlaidPaths: [...input.overlays.keys()],
  });
  return {
    ...artifacts,
    bundle: replaceBundleArtifact(
      artifacts.bundle,
      CORPUS_CURRENT_STATE_PATHS.generationManifest,
      manifestContent,
    ),
  };
}

export const CORPUS_PRE_LIVE_REBASELINE_OVERLAY_VERSION =
  `${CORPUS_CURRENT_STATE_GENERATOR_VERSION}+pre-live-rebaseline-overlay.1` as const;
