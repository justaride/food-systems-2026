import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  renameSync,
  statSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import {
  basename,
  dirname,
  extname,
  isAbsolute,
  relative,
  resolve,
  sep,
} from "node:path";
import { pathToFileURL } from "node:url";
import { z } from "zod";

import {
  LIBRARY_ANALYSIS_RETAINED_HISTORY_CONTRACT_SHA256,
  LIBRARY_ANALYSIS_RETAINED_HISTORY_CONTRACT_VERSION,
  LIBRARY_ANALYSIS_RETAINED_HISTORY_ENTRIES,
  LIBRARY_ANALYSIS_RETAINED_HISTORY_REVIEW_CONTEXT,
} from "../../src/lib/library-analysis-retained-history-contract";
import {
  candidateLocalFilePaths,
  normalizeLocalFileLocator,
} from "../../src/lib/local-file-locator";
import {
  buildInitialCorpusLifecycle,
  deriveCorpusLifecyclePermissions,
  validateCorpusLifecycle,
  type CorpusLifecycleRecord,
  type CorpusLifecycleOpenIssue,
  type CorpusSourceRole,
} from "../../src/lib/knowledge/corpus-processing-lifecycle";

const GENERATOR_VERSION = "1.1.0";
const EXPECTED_ACTIVE_ROWS = 1555;

const LEDGER_PATH = "research/_status/library-analysis-ledger.jsonl";
const BASELINE_PATH = "knowledge/corpus/corpus-processing-baseline.v1.json";
const RETAINED_HISTORY_CONTRACT_PATH =
  "src/lib/library-analysis-retained-history-contract.ts";
const LIFECYCLE_CONTRACT_PATH =
  "src/lib/knowledge/corpus-processing-lifecycle.ts";
const PRIVATE_RECOVERY_INPUT_PATH =
  "knowledge/corpus/corpus-private-recovery-candidates.v1.json";
export const LIVE_INVENTORY_SNAPSHOT_PATH =
  "knowledge/corpus/corpus-live-inventory-snapshot.v1.json";
const GENERATOR_PATH =
  "scripts/knowledge/generate-corpus-processing-register.ts";

export const CORPUS_PROCESSING_PATHS = Object.freeze({
  register: "knowledge/corpus/corpus-processing-register.v1.jsonl",
  summary: "knowledge/corpus/corpus-processing-summary.v1.json",
  report: "knowledge/corpus/corpus-processing-report.v1.md",
  retainedHistoryBoundary:
    "knowledge/corpus/corpus-retained-history-boundary.v1.json",
  missingFilesQueue: "knowledge/corpus/corpus-missing-files-queue.v1.jsonl",
  roleClassificationQueue:
    "knowledge/corpus/corpus-role-classification-queue.v1.jsonl",
  fullTextProcessingQueue:
    "knowledge/corpus/corpus-full-text-processing-queue.v1.jsonl",
  ownerReviewQueue: "knowledge/corpus/corpus-owner-review-queue.v1.jsonl",
  normalizedPathDuplicateQueue:
    "knowledge/corpus/corpus-normalized-path-duplicate-queue.v1.jsonl",
  contentHashDuplicateQueue:
    "knowledge/corpus/corpus-content-hash-duplicate-queue.v1.jsonl",
  generationManifest:
    "knowledge/corpus/corpus-processing-generation-manifest.v1.json",
});

type JsonObject = { [key: string]: JsonValue };
type JsonValue = string | number | boolean | null | JsonObject | JsonValue[];

export type LibraryAnalysisLedgerRow = {
  sourceKind: string;
  sourceKey: string;
  title: string;
  canonicalPath: string | null;
  status: string;
  usageRule: string;
  reviewRequired: boolean;
  riskFlags: string[];
  claimCandidateCount: number;
  contentHash: string;
  currentContentHash: string | null;
  linkedDocumentId: string | null;
  linkedSourceDocId: string | null;
  linkedReportId: string | null;
  linkedThesisId: string | null;
  citationReadiness: string | null;
  externalCitationEligible: boolean;
  reviewStatus: string;
  reviewedAt: string | null;
  reviewer: string | null;
};

export type RepositoryFileState =
  | "present"
  | "missing"
  | "no_locator"
  | "ambiguous_locator"
  | "outside_repository";

export type RepositoryFileObservation = {
  state: RepositoryFileState;
  locator: string | null;
  candidateRepositoryPaths: string[];
  resolvedRepositoryPath: string | null;
  mediaType: string | null;
  extension: string | null;
  sizeBytes: number | null;
  sha256: string | null;
};

export type CorpusRoleDecision = {
  role: CorpusSourceRole;
  status: "machine_rule_provisional" | "owner_classification_required";
  ruleId: string;
  reasons: string[];
  ownerConfirmed: false;
};

export type PrivateRecoveryCandidate = {
  identityKey: string;
  canonicalPath: string;
  sha256: string;
  sizeBytes: number;
  internalLocator: string;
  replicaClass: string;
  repositoryAvailable: false;
  fullTextReviewed: false;
  rightsState: "pending_not_cleared";
  identityReview?: {
    state: "required";
    currentTitle: string;
    legacyAlias: string;
    warning: string;
    provisionalScopeDisposition:
      "contextual_pending_owner" | "likely_out_of_scope_pending_owner";
  };
};

type PrivateRecoveryRegister = {
  schemaVersion: string;
  registerId: string;
  captureRecordedOn: string;
  purpose: string;
  storageVerificationContract: {
    requiredCopies: ["private_primary", "bigbrain_private_replica"];
    bothCopiesSha256MatchCandidate: true;
    bothCopiesSizeBytesMatchCandidate: true;
    bothCopiesFileMode: "0400";
    verificationRecordedOn: string;
  };
  candidates: PrivateRecoveryCandidate[];
};

type CorpusProcessingBaseline = {
  schemaVersion: "1.0.0";
  baselineId: "whole-corpus-processing-baseline.v1";
  observedAt: string;
  ledgerObservedAt: string;
  expectedActiveRows: number;
  expectedRetainedHistoryRows: number;
  retainedHistoryNonAdditive: true;
  authoritativeInventorySnapshot: {
    path: typeof LIVE_INVENTORY_SNAPSHOT_PATH;
    snapshotId: "library-analysis-live-inventory.v1";
    observedAt: string;
    activeRows: number;
    identityContentSetSha256: string;
    sourceKindCountsSha256: string;
    ledgerSha256: string;
  };
  purpose: string;
};

export type LiveInventoryIdentityContentRow = {
  identityKey: string;
  sourceKind: string;
  contentHash: string;
};

export type LiveInventorySnapshot = {
  schemaVersion: "1.0.0";
  snapshotId: "library-analysis-live-inventory.v1";
  observedAt: string;
  inventoryLoader: "loadLibraryAnalysisInventory({requireDb:true})";
  databaseAccess: "read_only_queries_only";
  activeRows: number;
  sourceKindCounts: Record<string, number>;
  sourceKindCountsSha256: string;
  ledger: {
    path: typeof LEDGER_PATH;
    sha256: string;
    sizeBytes: number;
  };
  identityContentRows: LiveInventoryIdentityContentRow[];
  identityContentSetSha256: string;
  ledgerIdentityContentSetSha256: string;
  parity: {
    identityKeysExact: true;
    contentHashesExact: true;
    sourceKindCountsExact: true;
  };
  semantics: {
    metadataOnly: true;
    databaseMutationAllowed: false;
    completenessClaim: "exact_inventory_snapshot_not_research_completeness";
  };
};

const corpusProcessingBaselineSchema = z
  .object({
    schemaVersion: z.literal("1.0.0"),
    baselineId: z.literal("whole-corpus-processing-baseline.v1"),
    observedAt: z.string().datetime({ offset: true }),
    ledgerObservedAt: z.string().datetime({ offset: true }),
    expectedActiveRows: z.number().int().positive(),
    expectedRetainedHistoryRows: z.number().int().positive(),
    retainedHistoryNonAdditive: z.literal(true),
    authoritativeInventorySnapshot: z
      .object({
        path: z.literal(LIVE_INVENTORY_SNAPSHOT_PATH),
        snapshotId: z.literal("library-analysis-live-inventory.v1"),
        observedAt: z.string().datetime({ offset: true }),
        activeRows: z.number().int().positive(),
        identityContentSetSha256: z.string().regex(/^[a-f0-9]{64}$/),
        sourceKindCountsSha256: z.string().regex(/^[a-f0-9]{64}$/),
        ledgerSha256: z.string().regex(/^[a-f0-9]{64}$/),
      })
      .strict(),
    purpose: z.string().min(1),
  })
  .strict();

const liveInventoryIdentityContentRowSchema = z
  .object({
    identityKey: z.string().min(1),
    sourceKind: z.string().min(1),
    contentHash: z.string().regex(/^[a-f0-9]{64}$/),
  })
  .strict();

const liveInventorySnapshotSchema = z
  .object({
    schemaVersion: z.literal("1.0.0"),
    snapshotId: z.literal("library-analysis-live-inventory.v1"),
    observedAt: z.string().datetime({ offset: true }),
    inventoryLoader: z.literal(
      "loadLibraryAnalysisInventory({requireDb:true})",
    ),
    databaseAccess: z.literal("read_only_queries_only"),
    activeRows: z.number().int().positive(),
    sourceKindCounts: z.record(z.string(), z.number().int().nonnegative()),
    sourceKindCountsSha256: z.string().regex(/^[a-f0-9]{64}$/),
    ledger: z
      .object({
        path: z.literal(LEDGER_PATH),
        sha256: z.string().regex(/^[a-f0-9]{64}$/),
        sizeBytes: z.number().int().positive(),
      })
      .strict(),
    identityContentRows: z.array(liveInventoryIdentityContentRowSchema).min(1),
    identityContentSetSha256: z.string().regex(/^[a-f0-9]{64}$/),
    ledgerIdentityContentSetSha256: z.string().regex(/^[a-f0-9]{64}$/),
    parity: z
      .object({
        identityKeysExact: z.literal(true),
        contentHashesExact: z.literal(true),
        sourceKindCountsExact: z.literal(true),
      })
      .strict(),
    semantics: z
      .object({
        metadataOnly: z.literal(true),
        databaseMutationAllowed: z.literal(false),
        completenessClaim: z.literal(
          "exact_inventory_snapshot_not_research_completeness",
        ),
      })
      .strict(),
  })
  .strict();

const privateRecoveryCandidateSchema = z
  .object({
    identityKey: z.string().min(1),
    canonicalPath: z.string().min(1),
    sha256: z.string().regex(/^[a-f0-9]{64}$/),
    sizeBytes: z.number().int().positive(),
    internalLocator: z
      .string()
      .regex(/^private:\/\/corpus\/sha256\/[a-f0-9]{64}$/),
    replicaClass: z.string().min(1),
    repositoryAvailable: z.literal(false),
    fullTextReviewed: z.literal(false),
    rightsState: z.literal("pending_not_cleared"),
    identityReview: z
      .object({
        state: z.literal("required"),
        currentTitle: z.string().min(1),
        legacyAlias: z.string().min(1),
        warning: z.string().min(10),
        provisionalScopeDisposition: z.enum([
          "contextual_pending_owner",
          "likely_out_of_scope_pending_owner",
        ]),
      })
      .strict()
      .optional(),
  })
  .strict();

const privateRecoveryRegisterSchema = z
  .object({
    schemaVersion: z.literal("1.0.0"),
    registerId: z.literal("corpus-private-recovery-candidates.v1"),
    captureRecordedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    purpose: z.string().min(1),
    storageVerificationContract: z
      .object({
        requiredCopies: z.tuple([
          z.literal("private_primary"),
          z.literal("bigbrain_private_replica"),
        ]),
        bothCopiesSha256MatchCandidate: z.literal(true),
        bothCopiesSizeBytesMatchCandidate: z.literal(true),
        bothCopiesFileMode: z.literal("0400"),
        verificationRecordedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      })
      .strict(),
    candidates: z.array(privateRecoveryCandidateSchema),
  })
  .strict();

export type DuplicateQueueEntry = {
  queueId: string;
  duplicateKind: "normalized_repository_path" | "repository_file_sha256";
  duplicateValue: string;
  identityKeys: string[];
  canonicalPaths: Array<string | null>;
  resolvedRepositoryPaths: string[];
  mediaTypes: string[];
  resolutionState: "owner_review_required";
  automaticAction: "none";
};

export type CorpusProcessingRegisterRow = {
  schemaVersion: "1.0.0";
  recordId: string;
  identityKey: string;
  sourceKind: string;
  sourceKey: string;
  title: string;
  canonicalPath: string | null;
  sourceProjection: {
    status: string;
    usageRule: string;
    reviewRequired: boolean;
    reviewStatus: string;
    reviewedAt: string | null;
    reviewer: string | null;
    riskFlags: string[];
    claimCandidateCount: number;
    citationReadiness: string | null;
    externalCitationEligible: boolean;
    ledgerContentHash: string;
    currentContentHash: string | null;
    linkedDocumentId: string | null;
    linkedSourceDocId: string | null;
    linkedReportId: string | null;
    linkedThesisId: string | null;
  };
  roleClassification: CorpusRoleDecision;
  repositoryFile: RepositoryFileObservation;
  privateRecoveryCandidate: PrivateRecoveryCandidate | null;
  duplicateReview: {
    normalizedPathQueueIds: string[];
    contentHashQueueIds: string[];
    automaticDeduplicationAllowed: false;
  };
  lifecycle: CorpusLifecycleRecord;
  permissions: ReturnType<typeof deriveCorpusLifecyclePermissions>;
  promotionState: {
    fullTextComplete: false;
    ownerReviewed: false;
    internalKnowledgeReady: false;
    externalUseReady: false;
    coveragePromotionAllowed: false;
  };
  queueMemberships: {
    missingFiles: boolean;
    roleClassification: boolean;
    fullTextProcessing: true;
    ownerReview: true;
    normalizedPathDuplicate: boolean;
    contentHashDuplicate: boolean;
  };
};

type BaseRow = {
  ledger: LibraryAnalysisLedgerRow;
  identityKey: string;
  recordId: string;
  roleDecision: CorpusRoleDecision;
  file: RepositoryFileObservation;
  privateRecoveryCandidate: PrivateRecoveryCandidate | null;
};

export type CorpusProcessingArtifacts = {
  rows: CorpusProcessingRegisterRow[];
  summary: JsonObject;
  retainedHistoryBoundary: JsonObject;
  missingFilesQueue: JsonObject[];
  roleClassificationQueue: JsonObject[];
  fullTextProcessingQueue: JsonObject[];
  ownerReviewQueue: JsonObject[];
  normalizedPathDuplicateQueue: DuplicateQueueEntry[];
  contentHashDuplicateQueue: DuplicateQueueEntry[];
  bundle: Array<{ path: string; content: string }>;
};

export type BuildCorpusProcessingArtifactsOptions = {
  expectedActiveRows?: number;
};

function lexicalCompare(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function normalizedJson(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(normalizedJson);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => lexicalCompare(left, right))
        .map(([key, child]) => [key, normalizedJson(child)]),
    );
  }
  return value;
}

export function canonicalJson(value: unknown): string {
  return JSON.stringify(normalizedJson(value));
}

export function sha256(value: string | Buffer): string {
  return createHash("sha256").update(value).digest("hex");
}

function sha256File(path: string): string {
  return sha256(readFileSync(path));
}

function prettyJson(value: unknown): string {
  return JSON.stringify(value, null, 2) + "\n";
}

function jsonLines(values: unknown[]): string {
  return values.map(canonicalJson).join("\n") + (values.length > 0 ? "\n" : "");
}

function identityKey(row: Pick<LibraryAnalysisLedgerRow, "sourceKey">): string {
  return row.sourceKey;
}

function assertString(value: unknown, name: string): asserts value is string {
  assert.equal(typeof value, "string", `${name} must be a string`);
}

function assertNullableString(
  value: unknown,
  name: string,
): asserts value is string | null {
  assert(
    value === null || typeof value === "string",
    `${name} must be a string or null`,
  );
}

function parseLedgerRow(
  value: unknown,
  lineNumber: number,
): LibraryAnalysisLedgerRow {
  assert(
    value && typeof value === "object" && !Array.isArray(value),
    `Ledger line ${lineNumber} must be an object`,
  );
  const row = value as Record<string, unknown>;
  for (const field of [
    "sourceKind",
    "sourceKey",
    "title",
    "status",
    "usageRule",
    "contentHash",
    "reviewStatus",
  ]) {
    assertString(row[field], `Ledger line ${lineNumber} ${field}`);
  }
  for (const field of [
    "canonicalPath",
    "currentContentHash",
    "linkedDocumentId",
    "linkedSourceDocId",
    "linkedReportId",
    "linkedThesisId",
    "citationReadiness",
    "reviewedAt",
    "reviewer",
  ]) {
    assertNullableString(row[field], `Ledger line ${lineNumber} ${field}`);
  }
  assert.equal(
    typeof row.reviewRequired,
    "boolean",
    `Ledger line ${lineNumber} reviewRequired must be boolean`,
  );
  assert.equal(
    typeof row.externalCitationEligible,
    "boolean",
    `Ledger line ${lineNumber} externalCitationEligible must be boolean`,
  );
  assert.equal(
    typeof row.claimCandidateCount,
    "number",
    `Ledger line ${lineNumber} claimCandidateCount must be a number`,
  );
  assert(
    Array.isArray(row.riskFlags) &&
      row.riskFlags.every((flag) => typeof flag === "string"),
    `Ledger line ${lineNumber} riskFlags must be a string array`,
  );
  assert.match(
    row.contentHash as string,
    /^[a-f0-9]{64}$/,
    `Ledger line ${lineNumber} contentHash must be SHA-256`,
  );
  if (row.currentContentHash !== null) {
    assert.match(
      row.currentContentHash as string,
      /^[a-f0-9]{64}$/,
      `Ledger line ${lineNumber} currentContentHash must be SHA-256 or null`,
    );
  }
  return row as LibraryAnalysisLedgerRow;
}

export function parseLibraryAnalysisLedgerJsonl(
  content: string,
): LibraryAnalysisLedgerRow[] {
  assert(content.trim().length > 0, "Library-analysis ledger is empty");
  const rows = content
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line, index) => {
      try {
        return parseLedgerRow(JSON.parse(line), index + 1);
      } catch (error) {
        if (error instanceof SyntaxError)
          throw new Error(
            `Invalid JSON on ledger line ${index + 1}: ${error.message}`,
          );
        throw error;
      }
    });
  const seen = new Set<string>();
  for (const row of rows) {
    const key = identityKey(row);
    assert(!seen.has(key), `Duplicate active corpus identity: ${key}`);
    seen.add(key);
  }
  return rows.sort((left, right) =>
    lexicalCompare(identityKey(left), identityKey(right)),
  );
}

function inventoryIdentityContentRows(
  rows: Array<{ sourceKind: string; sourceKey: string; contentHash: string }>,
): LiveInventoryIdentityContentRow[] {
  const result = rows
    .map((row) => ({
      identityKey: row.sourceKey,
      sourceKind: row.sourceKind,
      contentHash: row.contentHash,
    }))
    .sort((left, right) => lexicalCompare(left.identityKey, right.identityKey));
  const identities = result.map((row) => row.identityKey);
  assert.equal(
    new Set(identities).size,
    identities.length,
    "Live inventory contains duplicate identity keys",
  );
  return result;
}

export function buildLiveInventorySnapshot(input: {
  liveRows: Array<{
    sourceKind: string;
    sourceKey: string;
    contentHash: string;
  }>;
  ledgerContent: string;
  observedAt: string;
}): LiveInventorySnapshot {
  assert(
    Number.isFinite(Date.parse(input.observedAt)),
    "Live inventory observedAt is invalid",
  );
  const ledgerRows = parseLibraryAnalysisLedgerJsonl(input.ledgerContent);
  const liveIdentityRows = inventoryIdentityContentRows(input.liveRows);
  const ledgerIdentityRows = inventoryIdentityContentRows(ledgerRows);
  assert.deepEqual(
    liveIdentityRows,
    ledgerIdentityRows,
    "Live inventory identity/content rows do not exactly match the tracked ledger",
  );
  const liveSourceKindCounts = countBy(
    liveIdentityRows,
    (row) => row.sourceKind,
  );
  const ledgerSourceKindCounts = countBy(
    ledgerIdentityRows,
    (row) => row.sourceKind,
  );
  assert.deepEqual(
    liveSourceKindCounts,
    ledgerSourceKindCounts,
    "Live inventory source-kind counts differ from the ledger",
  );
  const identityContentSetSha256 = sha256(canonicalJson(liveIdentityRows));
  return {
    schemaVersion: "1.0.0",
    snapshotId: "library-analysis-live-inventory.v1",
    observedAt: input.observedAt,
    inventoryLoader: "loadLibraryAnalysisInventory({requireDb:true})",
    databaseAccess: "read_only_queries_only",
    activeRows: liveIdentityRows.length,
    sourceKindCounts: liveSourceKindCounts,
    sourceKindCountsSha256: sha256(canonicalJson(liveSourceKindCounts)),
    ledger: {
      path: LEDGER_PATH,
      sha256: sha256(input.ledgerContent),
      sizeBytes: Buffer.byteLength(input.ledgerContent),
    },
    identityContentRows: liveIdentityRows,
    identityContentSetSha256,
    ledgerIdentityContentSetSha256: sha256(canonicalJson(ledgerIdentityRows)),
    parity: {
      identityKeysExact: true,
      contentHashesExact: true,
      sourceKindCountsExact: true,
    },
    semantics: {
      metadataOnly: true,
      databaseMutationAllowed: false,
      completenessClaim: "exact_inventory_snapshot_not_research_completeness",
    },
  };
}

function readLiveInventorySnapshot(
  root: string,
  ledgerContent: string,
): LiveInventorySnapshot {
  const snapshot = liveInventorySnapshotSchema.parse(
    JSON.parse(readRequiredFile(root, LIVE_INVENTORY_SNAPSHOT_PATH)),
  );
  const expected = buildLiveInventorySnapshot({
    liveRows: snapshot.identityContentRows.map((row) => ({
      sourceKind: row.sourceKind,
      sourceKey: row.identityKey,
      contentHash: row.contentHash,
    })),
    ledgerContent,
    observedAt: snapshot.observedAt,
  });
  assert.deepEqual(
    snapshot,
    expected,
    "Tracked live-inventory snapshot hashes or parity metadata are invalid",
  );
  return snapshot;
}

function validateBaselineSnapshotBinding(
  baseline: CorpusProcessingBaseline,
  snapshot: LiveInventorySnapshot,
): void {
  assert.deepEqual(
    baseline.authoritativeInventorySnapshot,
    {
      path: LIVE_INVENTORY_SNAPSHOT_PATH,
      snapshotId: snapshot.snapshotId,
      observedAt: snapshot.observedAt,
      activeRows: snapshot.activeRows,
      identityContentSetSha256: snapshot.identityContentSetSha256,
      sourceKindCountsSha256: snapshot.sourceKindCountsSha256,
      ledgerSha256: snapshot.ledger.sha256,
    },
    "Corpus baseline is not bound to the exact tracked live-inventory snapshot",
  );
}

function normalizedRolePath(path: string | null): string | null {
  return normalizeLocalFileLocator(path)?.toLowerCase() ?? null;
}

const KNOWN_IDENTITY_MISMATCHES: Record<
  string,
  {
    currentTitle: string;
    legacyAlias: string;
    provisionalScopeDisposition:
      "contextual_pending_owner" | "likely_out_of_scope_pending_owner";
  }
> = {
  "document:cmppajyvb0012njvmnphhze07": {
    currentTitle:
      "UNESCO Biosphere Reserves — A Path to Local Holistic Sustainability (Nord 2024:023)",
    legacyAlias: "karlstad-declaration-2024.pdf",
    provisionalScopeDisposition: "contextual_pending_owner",
  },
  "document:cmppajyve0013njvmw7zok4yr": {
    currentTitle:
      "Beyond Zero — Nordic Architecture on the Road Towards Renewed Practices (Nord 2025:010)",
    legacyAlias: "nordic-food-alert-2025.pdf",
    provisionalScopeDisposition: "likely_out_of_scope_pending_owner",
  },
};

export function classifyCorpusRole(
  row: LibraryAnalysisLedgerRow,
): CorpusRoleDecision {
  const path = normalizedRolePath(row.canonicalPath);
  const extension = path ? extname(path).toLowerCase() : "";
  const root = path?.split("/")[0] ?? null;
  const base = path?.split("/").at(-1) ?? "";

  const knownMismatch = KNOWN_IDENTITY_MISMATCHES[row.sourceKey];
  if (knownMismatch) {
    return roleDecision("unknown", "known_legacy_alias_identity_mismatch", [
      `currentTitle=${knownMismatch.currentTitle}`,
      `legacyAlias=${knownMismatch.legacyAlias}`,
      `provisionalScopeDisposition=${knownMismatch.provisionalScopeDisposition}`,
    ]);
  }

  if (
    row.sourceKind === "source_doc" ||
    row.sourceKind === "report" ||
    row.sourceKind === "thesis"
  ) {
    return roleDecision("primary_evidence", "source_kind_evidence_identity", [
      `sourceKind=${row.sourceKind} explicitly represents a source object`,
    ]);
  }
  if (
    path &&
    (path.startsWith("ocr-output/") ||
      path.startsWith("src/") ||
      path.startsWith("public/") ||
      path.includes("/generated/"))
  ) {
    return roleDecision("generated_projection", "generated_path", [
      `canonicalPath=${path}`,
    ]);
  }
  if (
    path &&
    (path.startsWith("evidence-pack/gap-cards/") ||
      path === "evidence-pack/adoption-track.md" ||
      path === "evidence-pack/finance-note.md")
  ) {
    return roleDecision(
      "internal_synthesis",
      "evidence_pack_internal_synthesis",
      [
        `canonicalPath=${path}`,
        "explicitly maintained project synthesis inside the evidence-pack tree",
      ],
    );
  }
  if (
    path &&
    path.startsWith("evidence-pack/") &&
    /(?:^|[-_])(manifest|queue|handoff|readme)(?:[-_.]|$)/i.test(base)
  ) {
    return roleDecision(
      "operational_control",
      "evidence_pack_control_artifact",
      [`canonicalPath=${path}`, "explicit evidence-pack control artifact"],
    );
  }
  if (
    path &&
    (path.startsWith("evidence-pack/") ||
      path.startsWith("external/") ||
      base.startsWith("external-") ||
      path.includes("/policy_governance_and_market/") ||
      path.includes("/academic_research_and_theses/") ||
      path.includes("/company_and_annual_reports/"))
  ) {
    return roleDecision("primary_evidence", "trusted_external_source_path", [
      `canonicalPath=${path}`,
      "trusted source path takes precedence over ambiguous filename tokens",
    ]);
  }
  if (path && extension === ".pdf") {
    return roleDecision("primary_evidence", "source_pdf_path", [
      `canonicalPath=${path}`,
      "source PDF takes precedence over ambiguous filename tokens",
    ]);
  }
  if (
    path &&
    (path.startsWith("_status/") ||
      path.startsWith("_plans/") ||
      path.startsWith("intake/") ||
      path.startsWith("review/") ||
      /(?:^|[-_])(status|audit|plan|queue|manifest|backlog|handoff|log|index|catalog|katalog|readme|acceptance|quality|coverage|inventory|remediation|priority)(?:[-_.]|$)/i.test(
        base,
      ))
  ) {
    return roleDecision("operational_control", "control_path_or_filename", [
      `canonicalPath=${path}`,
    ]);
  }
  if (
    path &&
    ((path.startsWith("landbrukarena_transcripts/") && extension === ".txt") ||
      path.startsWith("docs/meetings/"))
  ) {
    return roleDecision(
      "primary_evidence",
      "transcript_or_meeting_source_path",
      [`canonicalPath=${path}`],
    );
  }
  if (
    path &&
    [
      "analyse",
      "bibliotek",
      "brocode-bakgrunn",
      "data",
      "forstaelse",
      "norden",
      "norge",
      "pdf-downloads-20-04-26",
      "perpl-17-03",
      "perplexity-20-04-26",
      "regulatory",
      "v1-1",
      "v1-2",
      "whitepaper",
    ].includes(root ?? "")
  ) {
    return roleDecision("internal_synthesis", "maintained_synthesis_path", [
      `canonicalPath=${path}`,
    ]);
  }
  return roleDecision("unknown", "no_unambiguous_role_rule", [
    ...(path ? [`canonicalPath=${path}`] : ["canonicalPath is absent"]),
    `sourceKind=${row.sourceKind}`,
  ]);
}

function roleDecision(
  role: CorpusSourceRole,
  ruleId: string,
  reasons: string[],
): CorpusRoleDecision {
  return {
    role,
    status:
      role === "unknown"
        ? "owner_classification_required"
        : "machine_rule_provisional",
    ruleId,
    reasons,
    ownerConfirmed: false,
  };
}

function withinRoot(root: string, path: string): boolean {
  if (pathContainedBy(resolve(root), resolve(path))) return true;
  if (!existsSync(root) || !existsSync(path)) return false;
  return pathContainedBy(realpathSync(root), realpathSync(path));
}

function pathContainedBy(root: string, path: string): boolean {
  const rel = relative(root, path);
  return (
    rel === "" ||
    (!rel.startsWith(`..${sep}`) && rel !== ".." && !isAbsolute(rel))
  );
}

function repositoryRelative(root: string, path: string): string {
  const lexicalRoot = resolve(root);
  const lexicalPath = resolve(path);
  if (pathContainedBy(lexicalRoot, lexicalPath)) {
    return relative(lexicalRoot, lexicalPath).replaceAll("\\", "/");
  }
  return relative(realpathSync(root), realpathSync(path)).replaceAll("\\", "/");
}

function mediaTypeForPath(path: string | null): string | null {
  if (!path) return null;
  const extension = extname(path).toLowerCase();
  return (
    (
      {
        ".csv": "text/csv",
        ".json": "application/json",
        ".md": "text/markdown",
        ".pdf": "application/pdf",
        ".pptx":
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        ".ts": "text/typescript",
        ".tsv": "text/tab-separated-values",
        ".txt": "text/plain",
      } as Record<string, string>
    )[extension] ?? "application/octet-stream"
  );
}

export function inspectRepositoryFile(
  root: string,
  canonicalPath: string | null,
): RepositoryFileObservation {
  const locator = normalizeLocalFileLocator(canonicalPath);
  if (!locator) {
    return {
      state: "no_locator",
      locator: null,
      candidateRepositoryPaths: [],
      resolvedRepositoryPath: null,
      mediaType: null,
      extension: null,
      sizeBytes: null,
      sha256: null,
    };
  }

  const rawCandidates = candidateLocalFilePaths(canonicalPath, root);
  const insideCandidates = rawCandidates.filter((candidate) =>
    withinRoot(root, candidate),
  );
  const candidateRepositoryPaths = [
    ...new Set(
      insideCandidates.map((candidate) => repositoryRelative(root, candidate)),
    ),
  ].sort(lexicalCompare);
  const outsideCandidateExists = rawCandidates.some(
    (candidate) => !withinRoot(root, candidate) && existsSync(candidate),
  );
  const presentCandidates = insideCandidates.filter((candidate) => {
    if (!existsSync(candidate)) return false;
    const real = realpathSync(candidate);
    return withinRoot(root, real) && statSync(real).isFile();
  });

  if (
    outsideCandidateExists ||
    insideCandidates.some(
      (candidate) =>
        existsSync(candidate) && !withinRoot(root, realpathSync(candidate)),
    )
  ) {
    return {
      state: "outside_repository",
      locator,
      candidateRepositoryPaths,
      resolvedRepositoryPath: null,
      mediaType: mediaTypeForPath(locator),
      extension: extname(locator).toLowerCase() || null,
      sizeBytes: null,
      sha256: null,
    };
  }
  if (presentCandidates.length === 0) {
    return {
      state: "missing",
      locator,
      candidateRepositoryPaths,
      resolvedRepositoryPath: null,
      mediaType: mediaTypeForPath(locator),
      extension: extname(locator).toLowerCase() || null,
      sizeBytes: null,
      sha256: null,
    };
  }
  const uniquePresent = [
    ...new Set(presentCandidates.map((candidate) => realpathSync(candidate))),
  ];
  if (uniquePresent.length !== 1) {
    return {
      state: "ambiguous_locator",
      locator,
      candidateRepositoryPaths,
      resolvedRepositoryPath: null,
      mediaType: mediaTypeForPath(locator),
      extension: extname(locator).toLowerCase() || null,
      sizeBytes: null,
      sha256: null,
    };
  }
  const absolutePath = uniquePresent[0]!;
  const resolvedRepositoryPath = repositoryRelative(root, absolutePath);
  return {
    state: "present",
    locator,
    candidateRepositoryPaths,
    resolvedRepositoryPath,
    mediaType: mediaTypeForPath(resolvedRepositoryPath),
    extension: extname(resolvedRepositoryPath).toLowerCase() || null,
    sizeBytes: statSync(absolutePath).size,
    sha256: sha256File(absolutePath),
  };
}

function readRequiredFile(root: string, path: string): string {
  const absolutePath = resolve(root, path);
  assert(
    existsSync(absolutePath),
    `Missing required corpus-processing input: ${path}`,
  );
  return readFileSync(absolutePath, "utf8");
}

function readCorpusProcessingBaseline(root: string): CorpusProcessingBaseline {
  const value = corpusProcessingBaselineSchema.parse(
    JSON.parse(readRequiredFile(root, BASELINE_PATH)),
  ) as CorpusProcessingBaseline;
  assert.equal(value.schemaVersion, "1.0.0");
  assert.equal(value.baselineId, "whole-corpus-processing-baseline.v1");
  assert(
    Number.isFinite(Date.parse(value.observedAt)),
    "Corpus processing baseline observedAt is invalid",
  );
  assert.equal(
    value.ledgerObservedAt,
    LIBRARY_ANALYSIS_RETAINED_HISTORY_REVIEW_CONTEXT.observedAt,
  );
  assert.equal(value.expectedActiveRows, EXPECTED_ACTIVE_ROWS);
  assert.equal(
    value.expectedRetainedHistoryRows,
    LIBRARY_ANALYSIS_RETAINED_HISTORY_ENTRIES.length,
  );
  assert.equal(value.retainedHistoryNonAdditive, true);
  return value;
}

function readPrivateRecoveryRegister(root: string): PrivateRecoveryRegister {
  const parsed = privateRecoveryRegisterSchema.parse(
    JSON.parse(readRequiredFile(root, PRIVATE_RECOVERY_INPUT_PATH)),
  ) as PrivateRecoveryRegister;
  assert.equal(
    parsed.schemaVersion,
    "1.0.0",
    "Unsupported private recovery register schema",
  );
  assert.equal(
    parsed.registerId,
    "corpus-private-recovery-candidates.v1",
    "Unexpected private recovery register ID",
  );
  assert.match(parsed.captureRecordedOn, /^\d{4}-\d{2}-\d{2}$/);
  assert.deepEqual(parsed.storageVerificationContract.requiredCopies, [
    "private_primary",
    "bigbrain_private_replica",
  ]);
  assert.equal(
    parsed.storageVerificationContract.bothCopiesSha256MatchCandidate,
    true,
  );
  assert.equal(
    parsed.storageVerificationContract.bothCopiesSizeBytesMatchCandidate,
    true,
  );
  assert.equal(parsed.storageVerificationContract.bothCopiesFileMode, "0400");
  assert.match(
    parsed.storageVerificationContract.verificationRecordedOn,
    /^\d{4}-\d{2}-\d{2}$/,
  );
  assert(
    Array.isArray(parsed.candidates),
    "Private recovery candidates must be an array",
  );
  const seen = new Set<string>();
  for (const candidate of parsed.candidates) {
    assertString(candidate.identityKey, "Private recovery identityKey");
    assert(
      !seen.has(candidate.identityKey),
      `Duplicate private recovery identity: ${candidate.identityKey}`,
    );
    seen.add(candidate.identityKey);
    assertString(
      candidate.canonicalPath,
      `Private recovery canonicalPath ${candidate.identityKey}`,
    );
    assert.match(
      candidate.sha256,
      /^[a-f0-9]{64}$/,
      `Private recovery sha256 ${candidate.identityKey}`,
    );
    assert(
      Number.isSafeInteger(candidate.sizeBytes) && candidate.sizeBytes > 0,
      `Private recovery sizeBytes ${candidate.identityKey}`,
    );
    assert.match(
      candidate.internalLocator,
      /^private:\/\/corpus\/sha256\/[a-f0-9]{64}$/,
    );
    assert.equal(
      candidate.internalLocator.endsWith(candidate.sha256),
      true,
      `Private recovery locator/hash mismatch ${candidate.identityKey}`,
    );
    assert.equal(
      candidate.repositoryAvailable,
      false,
      `Private recovery must not promote repository availability: ${candidate.identityKey}`,
    );
    assert.equal(
      candidate.fullTextReviewed,
      false,
      `Private recovery must not promote full-text review: ${candidate.identityKey}`,
    );
    assert.equal(
      candidate.rightsState,
      "pending_not_cleared",
      `Private recovery rights must remain pending/not cleared: ${candidate.identityKey}`,
    );
  }
  return parsed;
}

function modeString(path: string): string {
  return (lstatSync(path).mode & 0o777).toString(8).padStart(4, "0");
}

function assertPrivateDirectory(path: string): void {
  assert(existsSync(path), `Private corpus directory is missing: ${path}`);
  const observation = lstatSync(path);
  assert(
    observation.isDirectory() && !observation.isSymbolicLink(),
    `Private corpus path must be a real directory: ${path}`,
  );
  assert.equal(
    modeString(path),
    "0700",
    `Private corpus directory must use mode 0700: ${path}`,
  );
}

function verifyPrivateRecoveryCopy(
  corpusRoot: string,
  candidate: PrivateRecoveryCandidate,
): { realPath: string; device: number; inode: number } {
  assertPrivateDirectory(corpusRoot);
  const shaDirectory = resolve(corpusRoot, "sha256");
  assertPrivateDirectory(shaDirectory);
  const path = resolve(shaDirectory, `${candidate.sha256}.pdf`);
  assert(
    pathContainedBy(resolve(corpusRoot), path),
    "Resolved private recovery path escaped corpus root",
  );
  assert(
    existsSync(path),
    `Private recovery PDF is missing for ${candidate.identityKey}`,
  );
  const observation = lstatSync(path);
  assert(
    observation.isFile() && !observation.isSymbolicLink(),
    `Private recovery PDF must be a regular file: ${candidate.identityKey}`,
  );
  assert.equal(
    modeString(path),
    "0400",
    `Private recovery PDF must use mode 0400: ${candidate.identityKey}`,
  );
  assert.equal(
    observation.size,
    candidate.sizeBytes,
    `Private recovery size mismatch: ${candidate.identityKey}`,
  );
  assert.equal(
    sha256File(path),
    candidate.sha256,
    `Private recovery SHA-256 mismatch: ${candidate.identityKey}`,
  );
  return {
    realPath: realpathSync(path),
    device: observation.dev,
    inode: observation.ino,
  };
}

export function checkPrivateRecoveryCopies(input: {
  repositoryRoot: string;
  primaryCorpusRoot: string;
  replicaCorpusRoot: string;
}): JsonObject {
  const register = readPrivateRecoveryRegister(input.repositoryRoot);
  assertPrivateDirectory(input.primaryCorpusRoot);
  assertPrivateDirectory(input.replicaCorpusRoot);
  const primaryRoot = realpathSync(input.primaryCorpusRoot);
  const replicaRoot = realpathSync(input.replicaCorpusRoot);
  const primaryRootStat = statSync(primaryRoot);
  const replicaRootStat = statSync(replicaRoot);
  assert(
    primaryRoot !== replicaRoot &&
      !(
        primaryRootStat.dev === replicaRootStat.dev &&
        primaryRootStat.ino === replicaRootStat.ino
      ),
    "Primary and replica private roots must resolve to distinct directories",
  );
  for (const candidate of register.candidates) {
    const primary = verifyPrivateRecoveryCopy(
      input.primaryCorpusRoot,
      candidate,
    );
    const replica = verifyPrivateRecoveryCopy(
      input.replicaCorpusRoot,
      candidate,
    );
    assert.notEqual(
      primary.realPath,
      replica.realPath,
      `Recovery copies resolve to the same path: ${candidate.identityKey}`,
    );
    assert(
      primary.device !== replica.device || primary.inode !== replica.inode,
      `Recovery copies resolve to the same file: ${candidate.identityKey}`,
    );
  }
  return {
    mode: "private_recovery_live_verification",
    recorded: {
      candidateCount: register.candidates.length,
      captureRecordedOn: register.captureRecordedOn,
    },
    liveVerifiedThisRun: {
      performed: true,
      primaryCopiesVerified: register.candidates.length,
      replicaCopiesVerified: register.candidates.length,
      verifiedCandidateCount: register.candidates.length,
      fileMode: "0400",
      directoryMode: "0700",
    },
    semantics: {
      repositoryPresencePromoted: false,
      fullTextReviewPromoted: false,
      rightsCleared: false,
      publicationReady: false,
      trackedSummaryMutated: false,
    },
  };
}

function buildDuplicateQueue(
  baseRows: BaseRow[],
  kind: DuplicateQueueEntry["duplicateKind"],
): DuplicateQueueEntry[] {
  const groups = new Map<string, BaseRow[]>();
  for (const row of baseRows) {
    const value =
      kind === "normalized_repository_path"
        ? (row.file.resolvedRepositoryPath ?? row.file.locator)
        : row.file.sha256;
    if (!value) continue;
    const values = groups.get(value) ?? [];
    values.push(row);
    groups.set(value, values);
  }
  return [...groups.entries()]
    .filter(([, rows]) => rows.length > 1)
    .sort(([left], [right]) => lexicalCompare(left, right))
    .map(([value, rows]) => ({
      queueId: `corpus-duplicate.${kind}.${sha256(value).slice(0, 20)}`,
      duplicateKind: kind,
      duplicateValue: value,
      identityKeys: rows.map((row) => row.identityKey).sort(lexicalCompare),
      canonicalPaths: rows
        .map((row) => row.ledger.canonicalPath)
        .sort((left, right) => lexicalCompare(left ?? "", right ?? "")),
      resolvedRepositoryPaths: [
        ...new Set(
          rows
            .map((row) => row.file.resolvedRepositoryPath)
            .filter((path): path is string => Boolean(path)),
        ),
      ].sort(lexicalCompare),
      mediaTypes: [
        ...new Set(
          rows
            .map((row) => row.file.mediaType)
            .filter((mediaType): mediaType is string => Boolean(mediaType)),
        ),
      ].sort(lexicalCompare),
      resolutionState: "owner_review_required",
      automaticAction: "none",
    }));
}

function openIssuesFor(
  row: BaseRow,
  normalizedPathQueueIds: string[],
  contentHashQueueIds: string[],
  observedAt: string,
): CorpusLifecycleOpenIssue[] {
  const codes = [
    "full_text_receipt_missing",
    "owner_review_receipt_missing",
    ...(row.roleDecision.role === "unknown"
      ? ["source_role_unclassified"]
      : []),
    ...(row.roleDecision.ruleId === "known_legacy_alias_identity_mismatch"
      ? ["known_identity_alias_mismatch"]
      : []),
    ...(row.file.state !== "present"
      ? [`repository_file_${row.file.state}`]
      : []),
    ...(row.privateRecoveryCandidate
      ? ["private_capture_available_internal_processing_repository_absent"]
      : []),
    ...(normalizedPathQueueIds.length > 0
      ? ["normalized_path_duplicate_review_pending"]
      : []),
    ...(contentHashQueueIds.length > 0
      ? ["content_hash_duplicate_review_pending"]
      : []),
  ].sort(lexicalCompare);
  return codes.map((code) => ({
    issueId: `issue.${sha256(`${row.recordId}:${code}`).slice(0, 24)}`,
    category: lifecycleIssueCategory(code),
    severity: code.startsWith("private_capture_")
      ? "information"
      : code.startsWith("repository_file_") && row.privateRecoveryCandidate
        ? "warning"
        : "blocking",
    summary: code.replaceAll("_", " "),
    openedAt: observedAt,
    assignedTo: null,
    evidenceRefs: [`corpus-processing:${row.recordId}`],
  }));
}

function lifecycleIssueCategory(
  code: string,
): CorpusLifecycleOpenIssue["category"] {
  if (
    code.startsWith("repository_file_") ||
    code.startsWith("private_capture_")
  )
    return "availability";
  if (code.startsWith("full_text_")) return "ai_processing";
  if (code.startsWith("owner_review_")) return "owner_review";
  if (code.startsWith("source_role_") || code.startsWith("known_identity_"))
    return "identity";
  return "other";
}

function lifecycleIdentityKind(
  base: BaseRow,
): CorpusLifecycleRecord["sourceIdentity"]["identityKind"] {
  if (base.roleDecision.role === "generated_projection")
    return "generated_artifact";
  if (base.ledger.sourceKind === "library_file") return "repository_path";
  if (
    ["document", "source_doc", "report", "thesis"].includes(
      base.ledger.sourceKind,
    )
  )
    return "database_record";
  return "unknown";
}

function countBy<T>(
  values: T[],
  key: (value: T) => string,
): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const value of values)
    counts[key(value)] = (counts[key(value)] ?? 0) + 1;
  return Object.fromEntries(
    Object.entries(counts).sort(([left], [right]) =>
      lexicalCompare(left, right),
    ),
  );
}

function buildFullTextProcessingQueue(
  rows: CorpusProcessingRegisterRow[],
): JsonObject[] {
  const groups = new Map<string, CorpusProcessingRegisterRow[]>();
  for (const row of rows) {
    const contentSha256 =
      row.repositoryFile.sha256 ?? row.privateRecoveryCandidate?.sha256 ?? null;
    const groupingKey = contentSha256
      ? `sha256:${contentSha256}`
      : `identity:${row.identityKey}`;
    const group = groups.get(groupingKey) ?? [];
    group.push(row);
    groups.set(groupingKey, group);
  }
  return [...groups.entries()]
    .sort(([left], [right]) => lexicalCompare(left, right))
    .map(([groupingKey, group]) => {
      const identityKeys = group
        .map((row) => row.identityKey)
        .sort(lexicalCompare);
      const contentSha256 = groupingKey.startsWith("sha256:")
        ? groupingKey.slice("sha256:".length)
        : null;
      const repositoryAvailable = group.some(
        (row) => row.repositoryFile.state === "present",
      );
      const privateCaptureAvailable = group.some(
        (row) => row.privateRecoveryCandidate !== null,
      );
      const sourceRoles = [
        ...new Set(group.map((row) => row.roleClassification.role)),
      ].sort(lexicalCompare);
      return {
        queueId: `corpus-full-text.${sha256(groupingKey).slice(0, 24)}`,
        processingUnitKey: groupingKey,
        contentSha256,
        identityKeys,
        titles: group.map((row) => row.title).sort(lexicalCompare),
        sourceRoles,
        repositoryFileStates: [
          ...new Set(group.map((row) => row.repositoryFile.state)),
        ].sort(lexicalCompare),
        resolvedRepositoryPaths: [
          ...new Set(
            group
              .map((row) => row.repositoryFile.resolvedRepositoryPath)
              .filter((path): path is string => Boolean(path)),
          ),
        ].sort(lexicalCompare),
        mediaTypes: [
          ...new Set(
            group
              .map((row) => row.repositoryFile.mediaType)
              .filter((mediaType): mediaType is string => Boolean(mediaType)),
          ),
        ].sort(lexicalCompare),
        processingInputState: repositoryAvailable
          ? "repository_file_available"
          : privateCaptureAvailable
            ? "private_capture_available_internal_processing"
            : "source_bytes_unavailable",
        privateCaptureAvailable,
        privateCaptureRightsCleared: false,
        processingState: "not_started",
        receiptRequired: true,
        deduplicationBasis: contentSha256
          ? repositoryAvailable
            ? "repository_file_sha256"
            : "private_capture_sha256"
          : "identity_without_content_hash",
        automaticIdentityMergeAllowed: false,
        priority:
          !repositoryAvailable && privateCaptureAvailable
            ? "p1_private_capture"
            : !repositoryAvailable
              ? "blocked_on_source_bytes"
              : sourceRoles.includes("primary_evidence")
                ? "p1"
                : sourceRoles.includes("unknown")
                  ? "p2_role_review"
                  : "p3",
        nonEvidenceSignalsIgnored: [
          "ledger word count",
          "AI triage card",
          "library analysis status",
        ],
      };
    }) as JsonObject[];
}

function validateFullTextQueueCoverage(
  rows: CorpusProcessingRegisterRow[],
  queue: JsonObject[],
) {
  const memberships = queue.flatMap((item) => item.identityKeys as string[]);
  assert.equal(
    memberships.length,
    rows.length,
    "Full-text processing queue must represent every active identity exactly once",
  );
  assert.equal(
    new Set(memberships).size,
    rows.length,
    "Full-text processing queue contains duplicate identity memberships",
  );
  assert.deepEqual(
    memberships.toSorted(lexicalCompare),
    rows.map((row) => row.identityKey).toSorted(lexicalCompare),
    "Full-text processing queue identity coverage mismatch",
  );
}

function queueIdsByIdentity(
  entries: DuplicateQueueEntry[],
): Map<string, string[]> {
  const map = new Map<string, string[]>();
  for (const entry of entries) {
    for (const key of entry.identityKeys) {
      const ids = map.get(key) ?? [];
      ids.push(entry.queueId);
      map.set(key, ids.sort(lexicalCompare));
    }
  }
  return map;
}

function validatePrivateRecoveryBindings(
  baseRows: BaseRow[],
  register: PrivateRecoveryRegister,
) {
  const byIdentity = new Map(baseRows.map((row) => [row.identityKey, row]));
  for (const candidate of register.candidates) {
    const row = byIdentity.get(candidate.identityKey);
    assert(
      row,
      `Private recovery candidate is not an active ledger identity: ${candidate.identityKey}`,
    );
    assert.equal(
      row.ledger.canonicalPath,
      candidate.canonicalPath,
      `Private recovery canonicalPath mismatch: ${candidate.identityKey}`,
    );
    assert.equal(
      row.file.state,
      "missing",
      `Private recovery candidate is stale because repository file no longer has state=missing: ${candidate.identityKey}`,
    );
    const knownMismatch = KNOWN_IDENTITY_MISMATCHES[candidate.identityKey];
    if (knownMismatch) {
      assert(
        candidate.identityReview,
        `Known identity mismatch must have explicit recovery review metadata: ${candidate.identityKey}`,
      );
      assert.equal(
        row.ledger.title,
        knownMismatch.currentTitle,
        `Known identity mismatch title drift: ${candidate.identityKey}`,
      );
      assert.equal(
        candidate.identityReview.currentTitle,
        knownMismatch.currentTitle,
      );
      assert.equal(
        candidate.identityReview.legacyAlias,
        knownMismatch.legacyAlias,
      );
      assert.equal(
        candidate.identityReview.provisionalScopeDisposition,
        knownMismatch.provisionalScopeDisposition,
      );
      assert.equal(
        row.roleDecision.ruleId,
        "known_legacy_alias_identity_mismatch",
      );
    }
  }
  for (const key of Object.keys(KNOWN_IDENTITY_MISMATCHES)) {
    if (byIdentity.has(key)) {
      assert(
        register.candidates.some((candidate) => candidate.identityKey === key),
        `Known identity mismatch is missing recovery metadata: ${key}`,
      );
    }
  }
}

export function validateCorpusProcessingRegister(
  rows: CorpusProcessingRegisterRow[],
): string[] {
  const issues: string[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    if (seen.has(row.identityKey))
      issues.push(`duplicate identityKey: ${row.identityKey}`);
    seen.add(row.identityKey);
    try {
      validateCorpusLifecycle(row.lifecycle);
    } catch (error) {
      issues.push(
        `${row.identityKey}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
    if (!row.queueMemberships.fullTextProcessing)
      issues.push(
        `${row.identityKey}: full-text queue membership must remain true without a receipt`,
      );
    if (!row.queueMemberships.ownerReview)
      issues.push(
        `${row.identityKey}: owner-review queue membership must remain true without a receipt`,
      );
    if (!row.queueMemberships.roleClassification)
      issues.push(
        `${row.identityKey}: role-classification queue membership must remain true without an owner role-confirmation receipt`,
      );
    if (row.roleClassification.ownerConfirmed !== false)
      issues.push(
        `${row.identityKey}: provisional role classification cannot claim owner confirmation`,
      );
    if (
      row.lifecycle.sourceRoleConfirmationStatus.state === "owner_confirmed" ||
      row.lifecycle.sourceRoleConfirmationStatus.receipt !== null
    ) {
      issues.push(
        `${row.identityKey}: generated initial lifecycle cannot contain an owner role-confirmation decision`,
      );
    }
    if (row.permissions.sourceRoleOwnerConfirmed)
      issues.push(
        `${row.identityKey}: source role owner-confirmation permission must remain false`,
      );
    if (row.permissions.aiReadyForOwnerReview)
      issues.push(
        `${row.identityKey}: AI-ready-for-owner permission must remain false before role confirmation`,
      );
    if (
      row.privateRecoveryCandidate &&
      row.repositoryFile.state === "present"
    ) {
      issues.push(
        `${row.identityKey}: private recovery metadata cannot substitute for repository presence`,
      );
    }
    if (
      row.privateRecoveryCandidate?.rightsState !== undefined &&
      row.privateRecoveryCandidate.rightsState !== "pending_not_cleared"
    ) {
      issues.push(
        `${row.identityKey}: private recovery rights must remain pending/not cleared`,
      );
    }
    if (row.permissions.externalUseAllowed)
      issues.push(
        `${row.identityKey}: lifecycle external use must remain false`,
      );
    if (row.permissions.coveragePromotionAllowed)
      issues.push(
        `${row.identityKey}: lifecycle coverage promotion must remain false`,
      );
    for (const [key, value] of Object.entries(row.promotionState)) {
      if (value !== false)
        issues.push(`${row.identityKey}: forbidden readiness promotion ${key}`);
    }
  }
  return issues;
}

function buildRetainedHistoryBoundary(): JsonObject {
  return {
    schemaVersion: "1.0.0",
    boundaryId: "library-analysis-retained-history.v1",
    contractVersion: LIBRARY_ANALYSIS_RETAINED_HISTORY_CONTRACT_VERSION,
    contractSha256: LIBRARY_ANALYSIS_RETAINED_HISTORY_CONTRACT_SHA256,
    observedAt: LIBRARY_ANALYSIS_RETAINED_HISTORY_REVIEW_CONTEXT.observedAt,
    retainedHistoryRows: LIBRARY_ANALYSIS_RETAINED_HISTORY_ENTRIES.length,
    activeCorpusRows:
      LIBRARY_ANALYSIS_RETAINED_HISTORY_REVIEW_CONTEXT.currentInventoryRows,
    nonAdditive: true,
    evidenceUseAllowed: false,
    semantics:
      "These 17 persisted analysis records are historical projections outside the active corpus. They are reported separately and are never added to active-corpus totals.",
    entries: LIBRARY_ANALYSIS_RETAINED_HISTORY_ENTRIES.map((entry) => ({
      retainedRecordId: entry.retainedRecordId,
      retainedIdentityKey: entry.retainedIdentityKey,
      liveCounterpartIdentityKey: entry.liveCounterpart.identityKey,
      retentionReasonCode: entry.retentionReasonCode,
      externalUse: entry.externalUse,
    })),
  } as JsonObject;
}

function buildReport(summary: JsonObject): string {
  const active = summary.activeCorpus as JsonObject;
  const files = summary.repositoryFiles as JsonObject;
  const roles = summary.roles as JsonObject;
  const queues = summary.queues as JsonObject;
  const retained = summary.retainedHistoryBoundary as JsonObject;
  const privateRecovery = summary.privateRecovery as JsonObject;
  const privateRecoveryRecorded = privateRecovery.recorded as JsonObject;
  const privateRecoveryLive = privateRecovery.liveVerifiedThisRun as JsonObject;
  const duplicate = summary.duplicateReview as JsonObject;
  const byState = files.byState as Record<string, number>;
  const byRole = roles.byRole as Record<string, number>;

  return (
    `# Whole-corpus processing register\n\n` +
    `Register observation: ${summary.observedAt}\n\n` +
    `Tracked ledger observation: ${summary.ledgerObservedAt}\n\n` +
    `Status: internal processing baseline; not evidence readiness, owner approval, external validation, rights clearance, or publication approval.\n\n` +
    `## Current boundary\n\n` +
    `| Boundary | Count | Treatment |\n|---|---:|---|\n` +
    `| Active corpus identities | ${active.total} | Exactly one processing row per tracked ledger identity |\n` +
    `| Retained history | ${retained.total} | Separate, non-additive historical boundary |\n\n` +
    `The retained-history rows are never summed into the active corpus. The active boundary is pinned to the exact metadata-only live-inventory snapshot recorded at ${(active.authoritativeInventorySnapshot as JsonObject).observedAt}; the portable generator verifies that snapshot and ledger hash without claiming a fresh database read.\n\n` +
    `## Repository files\n\n` +
    `| State | Count |\n|---|---:|\n` +
    Object.entries(byState)
      .map(([state, count]) => `| ${state} | ${count} |`)
      .join("\n") +
    "\n\n" +
    `The recovery register records ${privateRecoveryRecorded.candidateCount} primary/replica capture attestations. Portable generation did not re-open either private archive in this run (live verification performed: ${privateRecoveryLive.performed}); use the explicit private check to verify hashes, sizes and modes. Recorded recovery metadata does not change repository presence, prove full-text review, clear rights, or permit publication.\n\n` +
    `${files.lifecycleContentHashBound} active identities are bound to an observed repository-file hash or a recorded private-capture hash; ${files.contentHashUnavailable} identities still have no available source-byte hash. A byte hash proves identity of bytes, not that their text has been read.\n\n` +
    `## Provisional source roles\n\n` +
    `| Role | Count |\n|---|---:|\n` +
    Object.entries(byRole)
      .map(([role, count]) => `| ${role} | ${count} |`)
      .join("\n") +
    "\n\n" +
    `Machine rules provide provisional distinctions only. Every active identity remains in the role-classification queue until Gabriel signs an exact role-confirmation receipt; no concrete machine role counts as owner-confirmed.\n\n` +
    `${roles.knownIdentityAliasMismatches} known title/path alias mismatches are forced to unknown: the UNESCO Biosphere report is contextual pending owner review, while Beyond Zero architecture is likely out of scope pending owner review. Neither legacy filename may drive promotion.\n\n` +
    `## Explicit work queues\n\n` +
    `| Queue | Rows or groups |\n|---|---:|\n` +
    Object.entries(queues)
      .map(([queue, count]) => `| ${queue} | ${count} |`)
      .join("\n") +
    "\n\n" +
    `Every active identity remains represented in both the content-hash-deduplicated full-text queue and the per-identity owner-review queue. Word count, an AI triage card, internal approval, or a private capture is not a full-text receipt.\n\n` +
    `## Duplicate review\n\n` +
    `- Normalized-path groups: ${duplicate.normalizedPathGroups}\n` +
    `- Content-hash groups: ${duplicate.contentHashGroups}\n\n` +
    `Duplicate groups are review signals only. The generator never deletes, merges, supersedes, or marks them resolved.\n\n` +
    `## Promotion boundary\n\n` +
    `Full-text complete: 0. Owner reviewed: 0. Internal knowledge ready: 0. External-use ready: 0. Coverage promotion allowed: 0. These states may change only through later content-addressed processing and review receipts.\n`
  );
}

function buildGenerationManifest(
  root: string,
  outputs: Array<{ path: string; content: string }>,
  filesystemSnapshotSha256: string,
  baseline: CorpusProcessingBaseline,
  expectedActiveRows: number,
): JsonObject {
  const inputs = [
    BASELINE_PATH,
    LIVE_INVENTORY_SNAPSHOT_PATH,
    LEDGER_PATH,
    RETAINED_HISTORY_CONTRACT_PATH,
    LIFECYCLE_CONTRACT_PATH,
    PRIVATE_RECOVERY_INPUT_PATH,
    GENERATOR_PATH,
  ].map((path) => {
    const content = readRequiredFile(root, path);
    return {
      path,
      sha256: sha256(content),
      sizeBytes: Buffer.byteLength(content),
    };
  });
  return {
    schemaVersion: "1.0.0",
    generator: GENERATOR_PATH,
    generatorVersion: GENERATOR_VERSION,
    observedAt: baseline.observedAt,
    ledgerObservedAt: baseline.ledgerObservedAt,
    activeCorpusExpectedRows: expectedActiveRows,
    retainedHistoryExpectedRows:
      LIBRARY_ANALYSIS_RETAINED_HISTORY_ENTRIES.length,
    retainedHistoryNonAdditive: true,
    filesystemSnapshotSha256,
    commitMarkerSemantics:
      "The manifest is renamed last. Consumers must verify every input and output hash and must not infer review or readiness from generation.",
    inputs,
    outputs: outputs.map(({ path, content }) => ({
      path,
      sha256: sha256(content),
      sizeBytes: Buffer.byteLength(content),
    })),
  };
}

export function buildCorpusProcessingArtifacts(
  root: string,
  options: BuildCorpusProcessingArtifactsOptions = {},
): CorpusProcessingArtifacts {
  const expectedActiveRows = options.expectedActiveRows ?? EXPECTED_ACTIVE_ROWS;
  const baseline = readCorpusProcessingBaseline(root);
  const ledgerContent = readRequiredFile(root, LEDGER_PATH);
  const ledgerRows = parseLibraryAnalysisLedgerJsonl(ledgerContent);
  const liveInventorySnapshot = readLiveInventorySnapshot(root, ledgerContent);
  validateBaselineSnapshotBinding(baseline, liveInventorySnapshot);
  assert.equal(
    ledgerRows.length,
    expectedActiveRows,
    `Active corpus row count mismatch: expected ${expectedActiveRows}, got ${ledgerRows.length}`,
  );
  assert.equal(
    liveInventorySnapshot.activeRows,
    expectedActiveRows,
    `Authoritative inventory snapshot row count mismatch: expected ${expectedActiveRows}, got ${liveInventorySnapshot.activeRows}`,
  );
  const privateRecoveryRegister = readPrivateRecoveryRegister(root);
  const recoveryByIdentity = new Map(
    privateRecoveryRegister.candidates.map((candidate) => [
      candidate.identityKey,
      candidate,
    ]),
  );

  const baseRows: BaseRow[] = ledgerRows.map((ledger) => {
    const key = identityKey(ledger);
    return {
      ledger,
      identityKey: key,
      recordId: `corpus-record.${sha256(key).slice(0, 24)}`,
      roleDecision: classifyCorpusRole(ledger),
      file: inspectRepositoryFile(root, ledger.canonicalPath),
      privateRecoveryCandidate: recoveryByIdentity.get(key) ?? null,
    };
  });
  validatePrivateRecoveryBindings(baseRows, privateRecoveryRegister);

  const normalizedPathDuplicateQueue = buildDuplicateQueue(
    baseRows,
    "normalized_repository_path",
  );
  const contentHashDuplicateQueue = buildDuplicateQueue(
    baseRows,
    "repository_file_sha256",
  );
  const normalizedPathQueueIds = queueIdsByIdentity(
    normalizedPathDuplicateQueue,
  );
  const contentHashQueueIds = queueIdsByIdentity(contentHashDuplicateQueue);

  const rows: CorpusProcessingRegisterRow[] = baseRows.map((base) => {
    const pathQueueIds = normalizedPathQueueIds.get(base.identityKey) ?? [];
    const hashQueueIds = contentHashQueueIds.get(base.identityKey) ?? [];
    const lifecycle = buildInitialCorpusLifecycle({
      recordId: base.recordId,
      sourceId: `source.${sha256(base.identityKey).slice(0, 24)}`,
      title: base.ledger.title,
      sourceRole: base.roleDecision.role,
      identityKind: lifecycleIdentityKind(base),
      canonicalIdentity: base.identityKey,
      identityStatus:
        lifecycleIdentityKind(base) === "unknown" ? "unknown" : "provisional",
      metadataSha256: `sha256:${sha256(canonicalJson(base.ledger))}`,
      contentSha256: base.file.sha256
        ? `sha256:${base.file.sha256}`
        : base.privateRecoveryCandidate
          ? `sha256:${base.privateRecoveryCandidate.sha256}`
          : null,
      contentHashVerifiedAt:
        base.file.sha256 || base.privateRecoveryCandidate
          ? baseline.observedAt
          : null,
      observedAt: baseline.observedAt,
      fileAvailable: base.file.state === "present",
      fileLocator: base.file.resolvedRepositoryPath,
      mediaType: base.file.mediaType,
      fileSizeBytes: base.file.sizeBytes,
      openIssues: openIssuesFor(
        base,
        pathQueueIds,
        hashQueueIds,
        baseline.observedAt,
      ),
    });
    return {
      schemaVersion: "1.0.0",
      recordId: base.recordId,
      identityKey: base.identityKey,
      sourceKind: base.ledger.sourceKind,
      sourceKey: base.ledger.sourceKey,
      title: base.ledger.title,
      canonicalPath: base.ledger.canonicalPath,
      sourceProjection: {
        status: base.ledger.status,
        usageRule: base.ledger.usageRule,
        reviewRequired: base.ledger.reviewRequired,
        reviewStatus: base.ledger.reviewStatus,
        reviewedAt: base.ledger.reviewedAt,
        reviewer: base.ledger.reviewer,
        riskFlags: [...base.ledger.riskFlags].sort(lexicalCompare),
        claimCandidateCount: base.ledger.claimCandidateCount,
        citationReadiness: base.ledger.citationReadiness,
        externalCitationEligible: base.ledger.externalCitationEligible,
        ledgerContentHash: base.ledger.contentHash,
        currentContentHash: base.ledger.currentContentHash,
        linkedDocumentId: base.ledger.linkedDocumentId,
        linkedSourceDocId: base.ledger.linkedSourceDocId,
        linkedReportId: base.ledger.linkedReportId,
        linkedThesisId: base.ledger.linkedThesisId,
      },
      roleClassification: base.roleDecision,
      repositoryFile: base.file,
      privateRecoveryCandidate: base.privateRecoveryCandidate,
      duplicateReview: {
        normalizedPathQueueIds: pathQueueIds,
        contentHashQueueIds: hashQueueIds,
        automaticDeduplicationAllowed: false,
      },
      lifecycle,
      permissions: deriveCorpusLifecyclePermissions(lifecycle),
      promotionState: {
        fullTextComplete: false,
        ownerReviewed: false,
        internalKnowledgeReady: false,
        externalUseReady: false,
        coveragePromotionAllowed: false,
      },
      queueMemberships: {
        missingFiles: base.file.state !== "present",
        roleClassification: !base.roleDecision.ownerConfirmed,
        fullTextProcessing: true,
        ownerReview: true,
        normalizedPathDuplicate: pathQueueIds.length > 0,
        contentHashDuplicate: hashQueueIds.length > 0,
      },
    };
  });
  const validationIssues = validateCorpusProcessingRegister(rows);
  assert.deepEqual(
    validationIssues,
    [],
    `Invalid corpus-processing register:\n${validationIssues.join("\n")}`,
  );

  const missingFilesQueue = rows
    .filter((row) => row.queueMemberships.missingFiles)
    .map((row) => ({
      queueId: `corpus-missing-file.${row.recordId}`,
      identityKey: row.identityKey,
      title: row.title,
      canonicalPath: row.canonicalPath,
      repositoryFileState: row.repositoryFile.state,
      candidateRepositoryPaths: row.repositoryFile.candidateRepositoryPaths,
      privateCaptureAvailable: Boolean(row.privateRecoveryCandidate),
      privateCaptureSha256: row.privateRecoveryCandidate?.sha256 ?? null,
      privateCaptureRightsState:
        row.privateRecoveryCandidate?.rightsState ?? null,
      identityReview: row.privateRecoveryCandidate?.identityReview ?? null,
      nextAction: row.privateRecoveryCandidate
        ? "use the verified private capture in the controlled internal workflow and create a content-bound full-text receipt; decide repository restoration separately; rights remain pending/not cleared"
        : "locate or reacquire source bytes; do not infer availability from ledger text",
      resolved: false,
    })) as JsonObject[];
  const roleClassificationQueue = rows
    .filter((row) => row.queueMemberships.roleClassification)
    .map((row) => ({
      queueId: `corpus-role.${row.recordId}`,
      identityKey: row.identityKey,
      title: row.title,
      sourceKind: row.sourceKind,
      canonicalPath: row.canonicalPath,
      provisionalRole: row.roleClassification.role,
      classificationStatus: row.roleClassification.status,
      ownerConfirmed: row.roleClassification.ownerConfirmed,
      ruleId: row.roleClassification.ruleId,
      reasons: row.roleClassification.reasons,
      requiredDecision:
        row.roleClassification.role === "unknown"
          ? "assign one corpus source role and issue an owner role-classification receipt"
          : "confirm or correct the provisional corpus source role and issue an owner role-classification receipt",
      decisionReceiptRequired: true,
      resolved: false,
    })) as JsonObject[];
  const fullTextProcessingQueue = buildFullTextProcessingQueue(rows);
  validateFullTextQueueCoverage(rows, fullTextProcessingQueue);
  const ownerReviewQueue = rows.map((row) => ({
    queueId: `corpus-owner-review.${row.recordId}`,
    identityKey: row.identityKey,
    title: row.title,
    sourceRole: row.roleClassification.role,
    reviewState: "not_started",
    ownerIdentity: "project_owner",
    blockedBy: [
      "full_text_processing_receipt_missing",
      "source_role_owner_confirmation_missing",
      ...(row.repositoryFile.state !== "present" &&
      !row.privateRecoveryCandidate
        ? ["source_bytes_unavailable"]
        : []),
      ...(row.duplicateReview.normalizedPathQueueIds.length > 0 ||
      row.duplicateReview.contentHashQueueIds.length > 0
        ? ["duplicate_review_pending"]
        : []),
    ],
    decisionReceiptRequired: true,
    externalValidationSatisfied: false,
    resolved: false,
  })) as JsonObject[];

  const retainedHistoryBoundary = buildRetainedHistoryBoundary();
  const filesystemSnapshot = rows.map((row) => ({
    identityKey: row.identityKey,
    repositoryFile: row.repositoryFile,
  }));
  const filesystemSnapshotSha256 = sha256(jsonLines(filesystemSnapshot));
  const summary: JsonObject = {
    schemaVersion: "1.0.0",
    summaryId: "corpus-processing-summary.v1",
    generatorVersion: GENERATOR_VERSION,
    observedAt: baseline.observedAt,
    ledgerObservedAt: baseline.ledgerObservedAt,
    activeCorpus: {
      total: rows.length,
      expected: expectedActiveRows,
      identityUnique:
        new Set(rows.map((row) => row.identityKey)).size === rows.length,
      bySourceKind: countBy(rows, (row) => row.sourceKind),
      authoritativeInventorySnapshot: {
        path: LIVE_INVENTORY_SNAPSHOT_PATH,
        snapshotId: liveInventorySnapshot.snapshotId,
        observedAt: liveInventorySnapshot.observedAt,
        identityContentSetSha256:
          liveInventorySnapshot.identityContentSetSha256,
        sourceKindCountsSha256: liveInventorySnapshot.sourceKindCountsSha256,
        ledgerSha256: liveInventorySnapshot.ledger.sha256,
        portableSnapshotBindingVerified: true,
        liveDatabaseVerifiedThisRun: false,
      },
    },
    retainedHistoryBoundary: {
      total: LIBRARY_ANALYSIS_RETAINED_HISTORY_ENTRIES.length,
      nonAdditive: true,
      externalUseAllowed: false,
      contractSha256: LIBRARY_ANALYSIS_RETAINED_HISTORY_CONTRACT_SHA256,
    },
    repositoryFiles: {
      byState: countBy(rows, (row) => row.repositoryFile.state),
      byMediaType: countBy(
        rows,
        (row) => row.repositoryFile.mediaType ?? "unknown",
      ),
      present: rows.filter((row) => row.repositoryFile.state === "present")
        .length,
      unavailable: rows.filter((row) => row.repositoryFile.state !== "present")
        .length,
      lifecycleContentHashBound: rows.filter(
        (row) => row.lifecycle.sourceIdentity.contentSha256 !== null,
      ).length,
      repositoryContentHashesVerified: rows.filter(
        (row) => row.repositoryFile.sha256 !== null,
      ).length,
      privateCaptureContentHashesRecorded: rows.filter(
        (row) => row.privateRecoveryCandidate !== null,
      ).length,
      contentHashUnavailable: rows.filter(
        (row) => row.lifecycle.sourceIdentity.contentSha256 === null,
      ).length,
      filesystemSnapshotSha256,
    },
    privateRecovery: {
      recorded: {
        candidateCount: privateRecoveryRegister.candidates.length,
        captureRecordedOn: privateRecoveryRegister.captureRecordedOn,
        primaryHashAndSizeAttestations:
          privateRecoveryRegister.candidates.length,
        replicaHashAndSizeAttestations:
          privateRecoveryRegister.candidates.length,
        attestedCopyFileMode:
          privateRecoveryRegister.storageVerificationContract
            .bothCopiesFileMode,
        semantics:
          "Recorded metadata attestations are inputs, not live filesystem verification by the portable generator.",
      },
      liveVerifiedThisRun: {
        performed: false,
        primaryCopiesVerified: 0,
        replicaCopiesVerified: 0,
        verifiedCandidateCount: 0,
      },
      rightsPendingNotCleared: privateRecoveryRegister.candidates.length,
      rightsCleared: 0,
      repositoryPresencePromotions: 0,
      fullTextReviewPromotions: 0,
    },
    roles: {
      byRole: countBy(rows, (row) => row.roleClassification.role),
      provisionalMachineClassifications: rows.filter(
        (row) => row.roleClassification.role !== "unknown",
      ).length,
      knownIdentityAliasMismatches: rows.filter(
        (row) =>
          row.roleClassification.ruleId ===
          "known_legacy_alias_identity_mismatch",
      ).length,
      ownerConfirmed: 0,
    },
    queues: {
      missingFiles: missingFilesQueue.length,
      roleClassification: roleClassificationQueue.length,
      fullTextProcessingUnits: fullTextProcessingQueue.length,
      fullTextIdentitiesPending: rows.length,
      ownerReview: ownerReviewQueue.length,
      normalizedPathDuplicateGroups: normalizedPathDuplicateQueue.length,
      contentHashDuplicateGroups: contentHashDuplicateQueue.length,
    },
    duplicateReview: {
      normalizedPathGroups: normalizedPathDuplicateQueue.length,
      normalizedPathIdentities: new Set(
        normalizedPathDuplicateQueue.flatMap((entry) => entry.identityKeys),
      ).size,
      contentHashGroups: contentHashDuplicateQueue.length,
      contentHashIdentities: new Set(
        contentHashDuplicateQueue.flatMap((entry) => entry.identityKeys),
      ).size,
      automaticActions: 0,
    },
    readiness: {
      fullTextComplete: 0,
      ownerReviewed: 0,
      internalKnowledgeReady: 0,
      externalUseReady: 0,
      coveragePromotionAllowed: 0,
    },
    semantics: {
      noFullTextInference:
        "Word count, stored summaries and AI triage cards are not full-text processing receipts.",
      ownerReview:
        "Owner review is a separate project decision receipt and does not equal later independent expert validation.",
      retainedHistory:
        "The 17 retained-history rows are a non-additive historical boundary outside the active corpus.",
      duplicates:
        "Duplicate path or content hashes create review queues only; no identity is deleted, merged or resolved automatically.",
      privateCapture:
        "A private capture is recovery metadata, not repository presence, full-text review, rights clearance or publication readiness.",
      liveVerification:
        "Portable generation validates recorded metadata and tracked hashes only. Live private-archive verification requires the explicit --check-private mode and is never persisted as if it occurred in a portable run.",
      authoritativeInventory:
        "The active corpus is bound to an exact metadata-only live-inventory snapshot. Snapshot parity is not research completeness.",
    },
  };

  const registerContent = jsonLines(rows);
  const summaryContent = prettyJson(summary);
  const reportContent = buildReport(summary);
  const retainedContent = prettyJson(retainedHistoryBoundary);
  const generatedOutputs = [
    { path: CORPUS_PROCESSING_PATHS.register, content: registerContent },
    { path: CORPUS_PROCESSING_PATHS.summary, content: summaryContent },
    { path: CORPUS_PROCESSING_PATHS.report, content: reportContent },
    {
      path: CORPUS_PROCESSING_PATHS.retainedHistoryBoundary,
      content: retainedContent,
    },
    {
      path: CORPUS_PROCESSING_PATHS.missingFilesQueue,
      content: jsonLines(missingFilesQueue),
    },
    {
      path: CORPUS_PROCESSING_PATHS.roleClassificationQueue,
      content: jsonLines(roleClassificationQueue),
    },
    {
      path: CORPUS_PROCESSING_PATHS.fullTextProcessingQueue,
      content: jsonLines(fullTextProcessingQueue),
    },
    {
      path: CORPUS_PROCESSING_PATHS.ownerReviewQueue,
      content: jsonLines(ownerReviewQueue),
    },
    {
      path: CORPUS_PROCESSING_PATHS.normalizedPathDuplicateQueue,
      content: jsonLines(normalizedPathDuplicateQueue),
    },
    {
      path: CORPUS_PROCESSING_PATHS.contentHashDuplicateQueue,
      content: jsonLines(contentHashDuplicateQueue),
    },
  ];
  const manifest = buildGenerationManifest(
    root,
    generatedOutputs,
    filesystemSnapshotSha256,
    baseline,
    expectedActiveRows,
  );
  const bundle = [
    ...generatedOutputs,
    {
      path: CORPUS_PROCESSING_PATHS.generationManifest,
      content: prettyJson(manifest),
    },
  ];
  return {
    rows,
    summary,
    retainedHistoryBoundary,
    missingFilesQueue,
    roleClassificationQueue,
    fullTextProcessingQueue,
    ownerReviewQueue,
    normalizedPathDuplicateQueue,
    contentHashDuplicateQueue,
    bundle,
  };
}

export function writeOrCheckCorpusProcessingArtifacts(
  root: string,
  artifacts: CorpusProcessingArtifacts,
  check: boolean,
) {
  if (check) {
    for (const item of artifacts.bundle) {
      const absolutePath = resolve(root, item.path);
      assert(
        existsSync(absolutePath),
        `Missing generated corpus-processing file: ${item.path}`,
      );
      assert.equal(
        readFileSync(absolutePath, "utf8"),
        item.content,
        `Generated corpus-processing file is stale: ${item.path}`,
      );
    }
    return;
  }

  const staged: Array<{ target: string; temporary: string }> = [];
  try {
    for (const [index, item] of artifacts.bundle.entries()) {
      const target = resolve(root, item.path);
      mkdirSync(dirname(target), { recursive: true });
      const temporary = resolve(
        dirname(target),
        `.${basename(target)}.${process.pid}.${index}.tmp`,
      );
      if (existsSync(temporary)) unlinkSync(temporary);
      writeFileSync(temporary, item.content, { encoding: "utf8", flag: "wx" });
      staged.push({ target, temporary });
    }
    const manifest = staged.pop();
    assert(manifest, "Corpus-processing generation manifest was not staged");
    for (const item of staged) renameSync(item.temporary, item.target);
    renameSync(manifest.temporary, manifest.target);
  } finally {
    for (const item of staged)
      if (existsSync(item.temporary)) unlinkSync(item.temporary);
  }
}

function writeSnapshotAndBaselineAtomically(
  root: string,
  snapshot: LiveInventorySnapshot,
  baseline: CorpusProcessingBaseline,
): void {
  const entries = [
    { path: LIVE_INVENTORY_SNAPSHOT_PATH, content: prettyJson(snapshot) },
    { path: BASELINE_PATH, content: prettyJson(baseline) },
  ];
  const staged: Array<{ target: string; temporary: string }> = [];
  try {
    for (const [index, entry] of entries.entries()) {
      const target = resolve(root, entry.path);
      mkdirSync(dirname(target), { recursive: true });
      const temporary = resolve(
        dirname(target),
        `.${basename(target)}.${process.pid}.${index}.tmp`,
      );
      assert(
        !existsSync(temporary),
        `Live-inventory temporary file already exists: ${entry.path}`,
      );
      writeFileSync(temporary, entry.content, { encoding: "utf8", flag: "wx" });
      assert.equal(readFileSync(temporary, "utf8"), entry.content);
      staged.push({ target, temporary });
    }
    const baselineEntry = staged.pop();
    assert(baselineEntry, "Baseline binding file was not staged");
    for (const entry of staged) renameSync(entry.temporary, entry.target);
    renameSync(baselineEntry.temporary, baselineEntry.target);
  } finally {
    for (const entry of staged)
      if (existsSync(entry.temporary)) unlinkSync(entry.temporary);
  }
}

export async function verifyOrGenerateLiveInventorySnapshot(input: {
  root: string;
  generate: boolean;
}): Promise<JsonObject> {
  assert.equal(
    realpathSync(input.root),
    realpathSync(process.cwd()),
    "Live inventory loading must run from the repository root passed to the command",
  );
  const [
    { loadLibraryAnalysisInventory },
    { auditLibraryAnalysisLedgerLiveParity },
  ] = await Promise.all([
    import("../library-analysis-common"),
    import("../../src/lib/library-analysis-processing"),
  ]);
  const ledgerContent = readRequiredFile(input.root, LEDGER_PATH);
  const liveRows = await loadLibraryAnalysisInventory({ requireDb: true });
  const parity = auditLibraryAnalysisLedgerLiveParity(ledgerContent, liveRows);
  assert.deepEqual(
    parity.failures,
    [],
    `Live inventory parity failed:\n${parity.failures.join("\n")}`,
  );

  const existingSnapshot = existsSync(
    resolve(input.root, LIVE_INVENTORY_SNAPSHOT_PATH),
  )
    ? liveInventorySnapshotSchema.parse(
        JSON.parse(readRequiredFile(input.root, LIVE_INVENTORY_SNAPSHOT_PATH)),
      )
    : null;
  const observedAt = existingSnapshot?.observedAt ?? new Date().toISOString();
  const liveSnapshot = buildLiveInventorySnapshot({
    liveRows,
    ledgerContent,
    observedAt,
  });

  if (input.generate) {
    const baselineRaw = JSON.parse(
      readRequiredFile(input.root, BASELINE_PATH),
    ) as Record<string, unknown>;
    const baseline = corpusProcessingBaselineSchema.parse({
      ...baselineRaw,
      authoritativeInventorySnapshot: {
        path: LIVE_INVENTORY_SNAPSHOT_PATH,
        snapshotId: liveSnapshot.snapshotId,
        observedAt: liveSnapshot.observedAt,
        activeRows: liveSnapshot.activeRows,
        identityContentSetSha256: liveSnapshot.identityContentSetSha256,
        sourceKindCountsSha256: liveSnapshot.sourceKindCountsSha256,
        ledgerSha256: liveSnapshot.ledger.sha256,
      },
    });
    writeSnapshotAndBaselineAtomically(input.root, liveSnapshot, baseline);
  } else {
    assert(existingSnapshot, "Tracked live-inventory snapshot is missing");
    assert.deepEqual(
      existingSnapshot,
      liveSnapshot,
      "Tracked live-inventory snapshot differs from the current read-only DB inventory",
    );
    const baseline = readCorpusProcessingBaseline(input.root);
    validateBaselineSnapshotBinding(baseline, liveSnapshot);
  }

  return {
    mode: input.generate
      ? "live_inventory_snapshot_generated"
      : "live_inventory_snapshot_checked",
    liveDatabaseVerifiedThisRun: true,
    databaseMutationAllowed: false,
    activeRows: liveSnapshot.activeRows,
    sourceKindCounts: liveSnapshot.sourceKindCounts,
    identityContentSetSha256: liveSnapshot.identityContentSetSha256,
    ledgerSha256: liveSnapshot.ledger.sha256,
    parityFailures: 0,
  };
}

export function run(
  root = process.cwd(),
  check = process.argv.includes("--check"),
) {
  const artifacts = buildCorpusProcessingArtifacts(root);
  writeOrCheckCorpusProcessingArtifacts(root, artifacts, check);
  const summary = artifacts.summary;
  const queues = summary.queues as JsonObject;
  console.log(
    `Corpus processing ${check ? "verified" : "generated"}: active=${artifacts.rows.length}; retained-history=${LIBRARY_ANALYSIS_RETAINED_HISTORY_ENTRIES.length} non-additive; missing-files=${queues.missingFiles}; full-text-units=${queues.fullTextProcessingUnits}; owner-review=${queues.ownerReview}`,
  );
}

type CorpusProcessingCliOptions = {
  mode:
    | "generate"
    | "check"
    | "check_private"
    | "generate_live_snapshot"
    | "check_live";
  primaryCorpusRoot: string | null;
  replicaCorpusRoot: string | null;
};

export function parseCorpusProcessingCliArgs(
  args: string[],
  env: NodeJS.ProcessEnv = process.env,
): CorpusProcessingCliOptions {
  let mode: CorpusProcessingCliOptions["mode"] = "generate";
  let explicitMode = false;
  let primaryCorpusRoot = env.FOOD_SYSTEMS_PRIVATE_CORPUS_ROOT ?? "";
  let replicaCorpusRoot = env.FOOD_SYSTEMS_PRIVATE_CORPUS_REPLICA_ROOT ?? "";
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const requestedMode = {
      "--check": "check",
      "--check-private": "check_private",
      "--generate-live-snapshot": "generate_live_snapshot",
      "--check-live": "check_live",
    }[arg] as CorpusProcessingCliOptions["mode"] | undefined;
    if (requestedMode) {
      assert(
        !explicitMode,
        "Choose exactly one corpus-processing operation mode",
      );
      mode = requestedMode;
      explicitMode = true;
      continue;
    }
    if (arg === "--primary-corpus-root" || arg === "--replica-corpus-root") {
      const value = args[index + 1];
      assert(value, `${arg} requires a value`);
      if (arg === "--primary-corpus-root") primaryCorpusRoot = value;
      else replicaCorpusRoot = value;
      index += 1;
      continue;
    }
    assert.fail(`Unknown corpus-processing argument: ${arg}`);
  }
  if (mode === "check_private") {
    assert(
      primaryCorpusRoot && replicaCorpusRoot,
      "Private check requires explicit roots or both private-root environment variables",
    );
  }
  return {
    mode,
    primaryCorpusRoot: primaryCorpusRoot ? resolve(primaryCorpusRoot) : null,
    replicaCorpusRoot: replicaCorpusRoot ? resolve(replicaCorpusRoot) : null,
  };
}

async function main(): Promise<void> {
  const root = process.cwd();
  const options = parseCorpusProcessingCliArgs(process.argv.slice(2));
  if (
    options.mode === "generate_live_snapshot" ||
    options.mode === "check_live"
  ) {
    const result = await verifyOrGenerateLiveInventorySnapshot({
      root,
      generate: options.mode === "generate_live_snapshot",
    });
    run(root, options.mode === "check_live");
    console.log(JSON.stringify(result));
    return;
  }
  if (options.mode === "check_private") {
    run(root, true);
    assert(options.primaryCorpusRoot && options.replicaCorpusRoot);
    const result = checkPrivateRecoveryCopies({
      repositoryRoot: root,
      primaryCorpusRoot: options.primaryCorpusRoot,
      replicaCorpusRoot: options.replicaCorpusRoot,
    });
    console.log(JSON.stringify(result));
    return;
  }
  run(root, options.mode === "check");
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
