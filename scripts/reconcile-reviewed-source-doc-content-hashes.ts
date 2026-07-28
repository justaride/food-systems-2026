import "dotenv/config";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { Prisma, PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  REVIEWED_SOURCE_DOC_CONTENT_HASH_MANIFEST,
  REVIEWED_SOURCE_DOC_CONTENT_HASH_MANIFEST_SHA256,
  REVIEWED_SOURCE_DOC_CONTENT_HASH_VERSION,
  assertReviewedSourceDocContentHashManifestPinned,
  type ReviewedSourceDocContentHashEntry,
  type ReviewedSourceDocContentHashId,
} from "../src/lib/citations/reviewed-source-doc-content-hash-reconciliation";
import {
  REVIEWED_SOURCE_DOC_IDENTITY_REPAIRS,
  canonicalizeReviewedSourceDocIdentityJson,
} from "../src/lib/citations/reviewed-source-doc-identity-repair";
import {
  normalizeReviewedSourceDocIdentityDatabaseRow,
  portableSourceDocIdentityToDatabaseRow,
  type ReviewedSourceDocIdentityDatabaseRow,
} from "./apply-reviewed-source-doc-identity-repair";

export const REVIEWED_SOURCE_DOC_CONTENT_HASH_APPLY_ACK =
  "APPLY_REVIEWED_SOURCE_DOC_CONTENT_HASH_DB_2";
export const REVIEWED_SOURCE_DOC_CONTENT_HASH_ADVISORY_LOCK_KEY =
  "foodsystems:reviewed-source-doc-content-hash:2026-07-20:v1";
export const REVIEWED_SOURCE_DOC_CONTENT_HASH_PROOF_BOUNDARY = [
  "repository files and PostgreSQL are not one transaction",
  "the runner never writes repository files",
  "DB apply is allowed only from exact files_after_db_before",
  "files are re-read under the locked Serializable DB transaction before and after mutation",
] as const;

const sourceDocSelect = {
  id: true,
  filename: true,
  title: true,
  author: true,
  year: true,
  sourceType: true,
  description: true,
  relevance: true,
  url: true,
  isDuplicate: true,
  doi: true,
  publisher: true,
  provenanceType: true,
  accessedAt: true,
  archivedUrl: true,
  documentId: true,
} satisfies Prisma.SourceDocSelect;

const documentSelect = {
  id: true,
  slug: true,
  filePath: true,
  title: true,
  author: true,
  year: true,
  documentType: true,
  category: true,
  subcategory: true,
  country: true,
  content: true,
  summary: true,
  url: true,
  accessedAt: true,
  archivedUrl: true,
  wordCount: true,
  tags: true,
  metadata: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.DocumentSelect;

const libraryAnalysisRecordSelect = {
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

export type ReviewedSourceDocContentHashDocumentRow =
  Prisma.DocumentGetPayload<{ select: typeof documentSelect }>;
export type ReviewedSourceDocContentHashLibraryRow =
  Prisma.LibraryAnalysisRecordGetPayload<{
    select: typeof libraryAnalysisRecordSelect;
  }>;

type DependencyRow = Record<string, unknown>;

export type ReviewedSourceDocContentHashDependencyCollections = {
  sourceDocs: ReviewedSourceDocIdentityDatabaseRow[];
  documents: ReviewedSourceDocContentHashDocumentRow[];
  libraryAnalysisRecords: ReviewedSourceDocContentHashLibraryRow[];
  sourceCitations: DependencyRow[];
  fieldCitations: DependencyRow[];
  evidenceAppraisals: DependencyRow[];
  documentRefs: DependencyRow[];
  sourceRefs: DependencyRow[];
  mediaEntries: DependencyRow[];
  sourceDocInsightLinks: DependencyRow[];
  insights: DependencyRow[];
  producerCitationConsumers: DependencyRow[];
  opportunitySourceConsumers: DependencyRow[];
  reportDocumentConsumers: DependencyRow[];
  thesisDocumentConsumers: DependencyRow[];
  insightDocumentRefs: DependencyRow[];
  companyDocumentRefs: DependencyRow[];
  actorDocumentRefs: DependencyRow[];
};

const collectionNames = [
  "sourceDocs",
  "documents",
  "libraryAnalysisRecords",
  "sourceCitations",
  "fieldCitations",
  "evidenceAppraisals",
  "documentRefs",
  "sourceRefs",
  "mediaEntries",
  "sourceDocInsightLinks",
  "insights",
  "producerCitationConsumers",
  "opportunitySourceConsumers",
  "reportDocumentConsumers",
  "thesisDocumentConsumers",
  "insightDocumentRefs",
  "companyDocumentRefs",
  "actorDocumentRefs",
] as const satisfies readonly (keyof ReviewedSourceDocContentHashDependencyCollections)[];

export type ReviewedSourceDocContentHashDatabaseIdentity = Readonly<{
  currentDatabase: string;
  key: "primary";
  identityUuid: string;
  createdAt: string;
}>;

export type ReviewedSourceDocContentHashFileState = Readonly<{
  sourceDocId: ReviewedSourceDocContentHashId;
  repositoryPath: string;
  state: "before" | "after" | "conflict";
  byteLength: number | null;
  sha256: string | null;
}>;

export type ReviewedSourceDocContentHashConflict = Readonly<{
  code: string;
  subject: string;
  detail: string;
}>;

export type ReviewedSourceDocContentHashTargetState = Readonly<{
  sourceDocId: ReviewedSourceDocContentHashId;
  documentId: string;
  libraryAnalysisRecordId: string;
  documentState: "before" | "after" | "conflict";
  libraryState: "before" | "after" | "conflict";
  documentFullRowSha256: string | null;
  libraryFullRowSha256: string | null;
}>;

export type ReviewedSourceDocContentHashPlan = Readonly<{
  version: typeof REVIEWED_SOURCE_DOC_CONTENT_HASH_VERSION;
  manifestSha256: string;
  contractSha256: string;
  databaseIdentity: ReviewedSourceDocContentHashDatabaseIdentity;
  fileAtomicState: "all_before" | "all_after" | "conflict";
  databaseAtomicState: "all_before" | "all_after" | "conflict";
  transition:
    | "all_before"
    | "files_after_db_before"
    | "all_after"
    | "conflict";
  files: readonly ReviewedSourceDocContentHashFileState[];
  targets: readonly ReviewedSourceDocContentHashTargetState[];
  targetStateSha256: string;
  dependencySha256: string;
  preservedDependencySha256: string;
  dependencyCounts: Record<
    keyof ReviewedSourceDocContentHashDependencyCollections,
    number
  >;
  dependencyIds: Record<
    keyof ReviewedSourceDocContentHashDependencyCollections,
    string[]
  >;
  conflicts: readonly ReviewedSourceDocContentHashConflict[];
  summary: Readonly<{
    files: 2;
    documents: 2;
    libraryAnalysisRecords: 2;
    pendingDatabaseRows: number;
    appliedDatabaseRows: number;
    conflicts: number;
  }>;
  boundary: Readonly<{
    writesFiles: false;
    mutatesSourceDocs: false;
    mutatesDocumentsOnlyContent: true;
    mutatesLibraryAnalysisOnlyContentHash: true;
  }>;
}>;

export type ReviewedSourceDocContentHashInspection = Readonly<{
  plan: ReviewedSourceDocContentHashPlan;
  collections: ReviewedSourceDocContentHashDependencyCollections;
}>;

export type ReviewedSourceDocContentHashArgs = Readonly<{
  apply: boolean;
  ack: string | undefined;
  expectedPlanSha256: string | undefined;
}>;

type ReviewedSourceDocContentHashClient = Pick<
  Prisma.TransactionClient,
  | "$queryRaw"
  | "$executeRaw"
  | "sourceDoc"
  | "document"
  | "libraryAnalysisRecord"
  | "sourceCitation"
  | "fieldCitation"
  | "evidenceAppraisal"
  | "documentRef"
  | "sourceRef"
  | "mediaEntry"
  | "insight"
  | "producer"
  | "opportunityEntry"
  | "report"
  | "thesis"
  | "insightDocumentRef"
  | "companyDocumentRef"
  | "actorDocumentRef"
>;

function canonicalHash(value: unknown) {
  return createHash("sha256")
    .update(JSON.stringify(canonicalizeReviewedSourceDocIdentityJson(value)))
    .digest("hex");
}

function byteHash(value: Buffer | string) {
  return createHash("sha256").update(value).digest("hex");
}

function compareIds(left: string, right: string) {
  return left.localeCompare(right, undefined, { numeric: true });
}

function rowId(row: unknown, collection: string) {
  const id = (row as { id?: unknown }).id;
  if (typeof id !== "string" || id.length === 0) {
    throw new Error(`${collection} dependency row has no stable id`);
  }
  return id;
}

function normalizeCollections(
  collections: ReviewedSourceDocContentHashDependencyCollections,
): ReviewedSourceDocContentHashDependencyCollections {
  return Object.fromEntries(
    collectionNames.map((name) => {
      const rows = [...collections[name]].sort((left, right) =>
        compareIds(rowId(left, name), rowId(right, name)),
      );
      const ids = rows.map((row) => rowId(row, name));
      if (new Set(ids).size !== ids.length) {
        throw new Error(`${name} dependency collection contains duplicate ids`);
      }
      return [name, rows];
    }),
  ) as ReviewedSourceDocContentHashDependencyCollections;
}

export function classifyReviewedSourceDocContentHashFile(
  entry: ReviewedSourceDocContentHashEntry,
  bytes: Buffer | null,
): ReviewedSourceDocContentHashFileState {
  if (bytes === null) {
    return {
      sourceDocId: entry.sourceDocId,
      repositoryPath: entry.repositoryPath,
      state: "conflict",
      byteLength: null,
      sha256: null,
    };
  }
  const before = Buffer.from(entry.beforeFileBytes, "utf8");
  const after = Buffer.from(entry.afterFileBytes, "utf8");
  const state = bytes.equals(before)
    ? "before"
    : bytes.equals(after)
      ? "after"
      : "conflict";
  return {
    sourceDocId: entry.sourceDocId,
    repositoryPath: entry.repositoryPath,
    state,
    byteLength: bytes.byteLength,
    sha256: byteHash(bytes),
  };
}

export function inspectReviewedSourceDocContentHashFiles(
  root = process.cwd(),
): ReviewedSourceDocContentHashFileState[] {
  return REVIEWED_SOURCE_DOC_CONTENT_HASH_MANIFEST.map((entry) => {
    try {
      return classifyReviewedSourceDocContentHashFile(
        entry,
        readFileSync(`${root}/${entry.repositoryPath}`),
      );
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      return classifyReviewedSourceDocContentHashFile(entry, null);
    }
  });
}

function protectedCollections(
  collections: ReviewedSourceDocContentHashDependencyCollections,
) {
  const documentIds = new Set(
    REVIEWED_SOURCE_DOC_CONTENT_HASH_MANIFEST.map((entry) => entry.documentId),
  );
  const libraryIds = new Set(
    REVIEWED_SOURCE_DOC_CONTENT_HASH_MANIFEST.map(
      (entry) => entry.libraryAnalysisRecordId,
    ),
  );
  return {
    ...collections,
    documents: collections.documents.map((row) => {
      if (!documentIds.has(row.id)) return row;
      const copy = { ...row } as Record<string, unknown>;
      delete copy.content;
      delete copy.updatedAt;
      return copy;
    }),
    libraryAnalysisRecords: collections.libraryAnalysisRecords.map((row) => {
      if (!libraryIds.has(row.id)) return row;
      const copy = { ...row } as Record<string, unknown>;
      delete copy.contentHash;
      delete copy.updatedAt;
      return copy;
    }),
  };
}

function conflict(
  conflicts: ReviewedSourceDocContentHashConflict[],
  code: string,
  subject: string,
  detail: string,
) {
  conflicts.push({ code, subject, detail });
}

function exactIdentityAfter(
  row: ReviewedSourceDocIdentityDatabaseRow,
  entry: ReviewedSourceDocContentHashEntry,
) {
  const repair = REVIEWED_SOURCE_DOC_IDENTITY_REPAIRS.find(
    (candidate) => candidate.id === entry.sourceDocId,
  );
  if (!repair) return false;
  return (
    canonicalHash(normalizeReviewedSourceDocIdentityDatabaseRow(row)) ===
    canonicalHash(
      portableSourceDocIdentityToDatabaseRow(repair.after, entry.documentId),
    )
  );
}

export function reviewedSourceDocContentHashContract() {
  return {
    version: REVIEWED_SOURCE_DOC_CONTENT_HASH_VERSION,
    manifestSha256: REVIEWED_SOURCE_DOC_CONTENT_HASH_MANIFEST_SHA256,
    targetIds: REVIEWED_SOURCE_DOC_CONTENT_HASH_MANIFEST.map(
      (entry) => entry.sourceDocId,
    ),
    documentIds: REVIEWED_SOURCE_DOC_CONTENT_HASH_MANIFEST.map(
      (entry) => entry.documentId,
    ),
    libraryAnalysisRecordIds: REVIEWED_SOURCE_DOC_CONTENT_HASH_MANIFEST.map(
      (entry) => entry.libraryAnalysisRecordId,
    ),
    hashFormula: 'sha256(Document.summary + "\\n\\n" + Document.content)',
    applyTransition: "files_after_db_before",
    proofBoundary: REVIEWED_SOURCE_DOC_CONTENT_HASH_PROOF_BOUNDARY,
    boundary: {
      writesFiles: false,
      mutatesSourceDocs: false,
      mutatesDocumentsOnlyContent: true,
      mutatesLibraryAnalysisOnlyContentHash: true,
    },
  };
}

export const REVIEWED_SOURCE_DOC_CONTENT_HASH_CONTRACT_SHA256 = canonicalHash(
  reviewedSourceDocContentHashContract(),
);

export function buildReviewedSourceDocContentHashPlan(input: {
  databaseIdentity: ReviewedSourceDocContentHashDatabaseIdentity;
  files: readonly ReviewedSourceDocContentHashFileState[];
  collections: ReviewedSourceDocContentHashDependencyCollections;
}): ReviewedSourceDocContentHashInspection {
  assertReviewedSourceDocContentHashManifestPinned();
  const collections = normalizeCollections(input.collections);
  const conflicts: ReviewedSourceDocContentHashConflict[] = [];
  const fileById = new Map(input.files.map((row) => [row.sourceDocId, row]));
  const files = REVIEWED_SOURCE_DOC_CONTENT_HASH_MANIFEST.map((entry) => {
    const row = fileById.get(entry.sourceDocId);
    if (!row || row.repositoryPath !== entry.repositoryPath) {
      conflict(
        conflicts,
        "file_inventory_drift",
        entry.sourceDocId,
        "Expected one exact repository file inspection",
      );
      return {
        sourceDocId: entry.sourceDocId,
        repositoryPath: entry.repositoryPath,
        state: "conflict" as const,
        byteLength: null,
        sha256: null,
      };
    }
    if (row.state === "conflict") {
      conflict(
        conflicts,
        "file_bytes_drift",
        entry.sourceDocId,
        "File bytes match neither the exact before nor after contract",
      );
    }
    return row;
  });
  if (input.files.length !== 2) {
    conflict(
      conflicts,
      "file_inventory_drift",
      "batch",
      `Expected exactly 2 files; found ${input.files.length}`,
    );
  }

  const sourceDocById = new Map(
    collections.sourceDocs.map((row) => [row.id, row]),
  );
  const documentById = new Map(
    collections.documents.map((row) => [row.id, row]),
  );
  const libraryById = new Map(
    collections.libraryAnalysisRecords.map((row) => [row.id, row]),
  );
  const targets = REVIEWED_SOURCE_DOC_CONTENT_HASH_MANIFEST.map((entry) => {
    const sourceDoc = sourceDocById.get(entry.sourceDocId);
    if (!sourceDoc || !exactIdentityAfter(sourceDoc, entry)) {
      conflict(
        conflicts,
        "source_doc_identity_drift",
        entry.sourceDocId,
        "SourceDoc is not the exact reviewed identity with the pinned Document binding",
      );
    }
    const document = documentById.get(entry.documentId);
    let documentState: "before" | "after" | "conflict" = "conflict";
    if (
      document &&
      document.filePath === entry.documentFilePath &&
      document.summary === entry.documentSummary
    ) {
      documentState =
        document.content === entry.beforeFileBytes
          ? "before"
          : document.content === entry.afterFileBytes
            ? "after"
            : "conflict";
    }
    if (documentState === "conflict") {
      conflict(
        conflicts,
        "document_snapshot_drift",
        entry.documentId,
        "Document binding, summary, filePath, or exact content bytes drifted",
      );
    }
    const library = libraryById.get(entry.libraryAnalysisRecordId);
    let libraryState: "before" | "after" | "conflict" = "conflict";
    if (
      library &&
      library.sourceKind === "document" &&
      library.sourceKey === `document:${entry.documentId}` &&
      library.documentId === entry.documentId &&
      library.sourceDocId === entry.sourceDocId &&
      library.canonicalPath === entry.documentFilePath
    ) {
      libraryState =
        library.contentHash === entry.beforeLibraryContentHash
          ? "before"
          : library.contentHash === entry.afterLibraryContentHash
            ? "after"
            : "conflict";
    }
    if (libraryState === "conflict") {
      conflict(
        conflicts,
        "library_analysis_snapshot_drift",
        entry.libraryAnalysisRecordId,
        "LAR binding or summary+blankline+content hash drifted",
      );
    }
    return {
      sourceDocId: entry.sourceDocId,
      documentId: entry.documentId,
      libraryAnalysisRecordId: entry.libraryAnalysisRecordId,
      documentState,
      libraryState,
      documentFullRowSha256: document ? canonicalHash(document) : null,
      libraryFullRowSha256: library ? canonicalHash(library) : null,
    };
  });
  if (collections.sourceDocs.length !== 2 || collections.documents.length !== 2) {
    conflict(
      conflicts,
      "target_inventory_drift",
      "batch",
      `Expected 2 SourceDocs and 2 Documents; found ${collections.sourceDocs.length}/${collections.documents.length}`,
    );
  }
  const targetLibraryIds = new Set(
    REVIEWED_SOURCE_DOC_CONTENT_HASH_MANIFEST.map(
      (entry) => entry.libraryAnalysisRecordId,
    ),
  );
  if (
    collections.libraryAnalysisRecords.filter((row) =>
      targetLibraryIds.has(row.id),
    ).length !== 2
  ) {
    conflict(
      conflicts,
      "target_inventory_drift",
      "library-analysis",
      "Expected both exact LibraryAnalysisRecord targets",
    );
  }

  const fileAtomicState = files.every((row) => row.state === "before")
    ? "all_before"
    : files.every((row) => row.state === "after")
      ? "all_after"
      : "conflict";
  if (
    fileAtomicState === "conflict" &&
    !conflicts.some((item) => item.code.startsWith("file_"))
  ) {
    conflict(
      conflicts,
      "file_atomic_hybrid",
      "batch",
      "Repository files are a partial before/after mixture",
    );
  }
  const databaseAtomicState = targets.every(
    (target) =>
      target.documentState === "before" && target.libraryState === "before",
  )
    ? "all_before"
    : targets.every(
          (target) =>
            target.documentState === "after" && target.libraryState === "after",
        )
      ? "all_after"
      : "conflict";
  if (
    databaseAtomicState === "conflict" &&
    !conflicts.some(
      (item) =>
        item.code === "document_snapshot_drift" ||
        item.code === "library_analysis_snapshot_drift",
    )
  ) {
    conflict(
      conflicts,
      "database_atomic_hybrid",
      "batch",
      "Document/LAR rows are a partial before/after mixture",
    );
  }
  let transition: ReviewedSourceDocContentHashPlan["transition"] =
    fileAtomicState === "all_before" && databaseAtomicState === "all_before"
      ? "all_before"
      : fileAtomicState === "all_after" &&
          databaseAtomicState === "all_before"
        ? "files_after_db_before"
        : fileAtomicState === "all_after" &&
            databaseAtomicState === "all_after"
          ? "all_after"
          : "conflict";
  if (transition === "conflict" && conflicts.length === 0) {
    conflict(
      conflicts,
      "cross_boundary_hybrid",
      "batch",
      "Filesystem/DB state is not an allowed two-phase transition",
    );
  }
  if (conflicts.length > 0) transition = "conflict";

  const dependencyCounts = Object.fromEntries(
    collectionNames.map((name) => [name, collections[name].length]),
  ) as Record<keyof ReviewedSourceDocContentHashDependencyCollections, number>;
  const dependencyIds = Object.fromEntries(
    collectionNames.map((name) => [
      name,
      collections[name].map((row) => rowId(row, name)),
    ]),
  ) as Record<keyof ReviewedSourceDocContentHashDependencyCollections, string[]>;
  const pendingDatabaseRows = targets.reduce(
    (count, target) =>
      count +
      Number(target.documentState === "before") +
      Number(target.libraryState === "before"),
    0,
  );
  const appliedDatabaseRows = targets.reduce(
    (count, target) =>
      count +
      Number(target.documentState === "after") +
      Number(target.libraryState === "after"),
    0,
  );
  const plan: ReviewedSourceDocContentHashPlan = {
    version: REVIEWED_SOURCE_DOC_CONTENT_HASH_VERSION,
    manifestSha256: REVIEWED_SOURCE_DOC_CONTENT_HASH_MANIFEST_SHA256,
    contractSha256: REVIEWED_SOURCE_DOC_CONTENT_HASH_CONTRACT_SHA256,
    databaseIdentity: input.databaseIdentity,
    fileAtomicState,
    databaseAtomicState,
    transition,
    files,
    targets,
    targetStateSha256: canonicalHash({ files, targets }),
    dependencySha256: canonicalHash(collections),
    preservedDependencySha256: canonicalHash(protectedCollections(collections)),
    dependencyCounts,
    dependencyIds,
    conflicts,
    summary: {
      files: 2,
      documents: 2,
      libraryAnalysisRecords: 2,
      pendingDatabaseRows,
      appliedDatabaseRows,
      conflicts: conflicts.length,
    },
    boundary: {
      writesFiles: false,
      mutatesSourceDocs: false,
      mutatesDocumentsOnlyContent: true,
      mutatesLibraryAnalysisOnlyContentHash: true,
    },
  };
  return { plan, collections };
}

export function reviewedSourceDocContentHashPlanSha256(
  inspection: ReviewedSourceDocContentHashInspection,
) {
  return canonicalHash(inspection.plan);
}

export function parseReviewedSourceDocContentHashArgs(
  argv: readonly string[],
): ReviewedSourceDocContentHashArgs {
  let apply = false;
  let dryRun = false;
  let ack: string | undefined;
  let expectedPlanSha256: string | undefined;
  for (const argument of argv) {
    if (argument === "--apply") {
      if (apply) throw new Error("--apply must not be repeated");
      apply = true;
    } else if (argument === "--dry-run") {
      if (dryRun) throw new Error("--dry-run must not be repeated");
      dryRun = true;
    } else if (argument.startsWith("--ack=")) {
      if (ack !== undefined) throw new Error("--ack must not be repeated");
      ack = argument.slice("--ack=".length);
    } else if (argument.startsWith("--plan-sha256=")) {
      if (expectedPlanSha256 !== undefined) {
        throw new Error("--plan-sha256 must not be repeated");
      }
      expectedPlanSha256 = argument.slice("--plan-sha256=".length);
    } else {
      throw new Error(
        `Unknown reviewed SourceDoc content/hash argument: ${argument}`,
      );
    }
  }
  if (apply && dryRun) throw new Error("--apply and --dry-run are mutually exclusive");
  if (!apply && (ack !== undefined || expectedPlanSha256 !== undefined)) {
    throw new Error("--ack and --plan-sha256 are valid only with --apply");
  }
  return { apply, ack, expectedPlanSha256 };
}

export function assertReviewedSourceDocContentHashApplyable(
  inspection: ReviewedSourceDocContentHashInspection,
) {
  if (
    inspection.plan.transition !== "files_after_db_before" ||
    inspection.plan.fileAtomicState !== "all_after" ||
    inspection.plan.databaseAtomicState !== "all_before" ||
    inspection.plan.conflicts.length !== 0 ||
    inspection.plan.summary.pendingDatabaseRows !== 4
  ) {
    throw new Error(
      "DB apply requires exact recoverable files_after_db_before state",
    );
  }
}

async function inspectDatabaseIdentity(
  client: Pick<Prisma.TransactionClient, "$queryRaw">,
): Promise<ReviewedSourceDocContentHashDatabaseIdentity> {
  const tableRows = await client.$queryRaw<
    Array<{ currentDatabase: string; identityTable: string | null }>
  >(Prisma.sql`
    SELECT current_database() AS "currentDatabase",
           to_regclass('public."DatabaseIdentity"')::text AS "identityTable"
  `);
  const identityRows = await client.$queryRaw<
    Array<{ key: string; identityUuid: string; createdAt: Date }>
  >(Prisma.sql`
    SELECT "key", "identityUuid"::text AS "identityUuid", "createdAt"
    FROM "DatabaseIdentity" WHERE "key" = 'primary' ORDER BY "key"
  `);
  const row = identityRows[0];
  if (
    tableRows.length !== 1 ||
    !tableRows[0]?.currentDatabase ||
    tableRows[0].identityTable === null ||
    identityRows.length !== 1 ||
    row?.key !== "primary" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      row.identityUuid,
    ) ||
    !(row.createdAt instanceof Date)
  ) {
    throw new Error("Reviewed SourceDoc content/hash requires one valid DatabaseIdentity");
  }
  return {
    currentDatabase: tableRows[0].currentDatabase,
    key: "primary",
    identityUuid: row.identityUuid.toLowerCase(),
    createdAt: row.createdAt.toISOString(),
  };
}

function asRows(rows: readonly object[]) {
  return rows as DependencyRow[];
}

function mergeRowsById<T extends { id: string }>(...groups: readonly T[][]) {
  const rows = new Map<string, T>();
  for (const row of groups.flat()) rows.set(row.id, row);
  return [...rows.values()].sort((left, right) => compareIds(left.id, right.id));
}

export async function inspectReviewedSourceDocContentHashDatabaseState(
  client: ReviewedSourceDocContentHashClient,
  root = process.cwd(),
): Promise<ReviewedSourceDocContentHashInspection> {
  const sourceDocIds = REVIEWED_SOURCE_DOC_CONTENT_HASH_MANIFEST.map(
    (entry) => entry.sourceDocId,
  );
  const documentIds = REVIEWED_SOURCE_DOC_CONTENT_HASH_MANIFEST.map(
    (entry) => entry.documentId,
  );
  const libraryIds = REVIEWED_SOURCE_DOC_CONTENT_HASH_MANIFEST.map(
    (entry) => entry.libraryAnalysisRecordId,
  );
  const [databaseIdentity, sourceDocs, documents, directLibrary, fileStates] =
    await Promise.all([
      inspectDatabaseIdentity(client),
      client.sourceDoc.findMany({
        where: { id: { in: sourceDocIds } },
        select: sourceDocSelect,
        orderBy: { id: "asc" },
      }),
      client.document.findMany({
        where: { id: { in: documentIds } },
        select: documentSelect,
        orderBy: { id: "asc" },
      }),
      client.libraryAnalysisRecord.findMany({
        where: {
          OR: [
            { id: { in: libraryIds } },
            { documentId: { in: documentIds } },
            { sourceDocId: { in: sourceDocIds } },
          ],
        },
        select: libraryAnalysisRecordSelect,
        orderBy: { id: "asc" },
      }),
      Promise.resolve(inspectReviewedSourceDocContentHashFiles(root)),
    ]);

  const directSourceCitations = await client.sourceCitation.findMany({
    where: {
      OR: [
        { sourceDocId: { in: sourceDocIds } },
        { documentId: { in: documentIds } },
        {
          fieldCitations: {
            some: {
              OR: [
                { entityType: "SourceDoc", entityId: { in: sourceDocIds } },
                { entityType: "Document", entityId: { in: documentIds } },
              ],
            },
          },
        },
      ],
    },
    orderBy: { id: "asc" },
  });
  const citationIds = directSourceCitations.map((row) => row.id);
  const [
    fieldCitations,
    evidenceAppraisals,
    documentRefs,
    sourceRefs,
    mediaEntries,
    sourceDocInsightRows,
    insights,
    producerCitationConsumers,
    opportunitySourceConsumers,
    reportDocumentConsumers,
    thesisDocumentConsumers,
    insightDocumentRefs,
    companyDocumentRefs,
    actorDocumentRefs,
  ] = await Promise.all([
    client.fieldCitation.findMany({
      where: {
        OR: [
          { citationId: { in: citationIds } },
          { entityType: "SourceDoc", entityId: { in: sourceDocIds } },
          { entityType: "Document", entityId: { in: documentIds } },
        ],
      },
      orderBy: { id: "asc" },
    }),
    client.evidenceAppraisal.findMany({
      where: {
        OR: [
          { sourceDocId: { in: sourceDocIds } },
          { reviewBasisCitationId: { in: citationIds } },
        ],
      },
      orderBy: { id: "asc" },
    }),
    client.documentRef.findMany({
      where: {
        OR: [{ fromId: { in: documentIds } }, { toId: { in: documentIds } }],
      },
      orderBy: { id: "asc" },
    }),
    client.sourceRef.findMany({
      where: { sourceDocId: { in: sourceDocIds } },
      orderBy: { id: "asc" },
    }),
    client.mediaEntry.findMany({
      where: { sourceDocId: { in: sourceDocIds } },
      orderBy: { id: "asc" },
    }),
    client.sourceDoc.findMany({
      where: { id: { in: sourceDocIds } },
      select: {
        id: true,
        insights: { select: { id: true }, orderBy: { id: "asc" } },
      },
      orderBy: { id: "asc" },
    }),
    client.insight.findMany({
      where: {
        OR: [
          { sourceDocLinks: { some: { id: { in: sourceDocIds } } } },
          { primaryCitationId: { in: citationIds } },
        ],
      },
      orderBy: { id: "asc" },
    }),
    client.producer.findMany({
      where: { primaryCitationId: { in: citationIds } },
      orderBy: { id: "asc" },
    }),
    client.opportunityEntry.findMany({
      where: { sourceIds: { hasSome: sourceDocIds } },
      orderBy: { id: "asc" },
    }),
    client.report.findMany({
      where: { documentId: { in: documentIds } },
      orderBy: { id: "asc" },
    }),
    client.thesis.findMany({
      where: { documentId: { in: documentIds } },
      orderBy: { id: "asc" },
    }),
    client.insightDocumentRef.findMany({
      where: { documentId: { in: documentIds } },
      orderBy: { id: "asc" },
    }),
    client.companyDocumentRef.findMany({
      where: { documentId: { in: documentIds } },
      orderBy: { id: "asc" },
    }),
    client.actorDocumentRef.findMany({
      where: { documentId: { in: documentIds } },
      orderBy: { id: "asc" },
    }),
  ]);
  const sourceDocInsightLinks = sourceDocInsightRows.flatMap((sourceDoc) =>
    sourceDoc.insights.map((insight) => ({
      id: `${insight.id}->${sourceDoc.id}`,
      insightId: insight.id,
      sourceDocId: sourceDoc.id,
    })),
  );
  return buildReviewedSourceDocContentHashPlan({
    databaseIdentity,
    files: fileStates,
    collections: {
      sourceDocs: sourceDocs.map(normalizeReviewedSourceDocIdentityDatabaseRow),
      documents,
      libraryAnalysisRecords: mergeRowsById(directLibrary),
      sourceCitations: asRows(directSourceCitations),
      fieldCitations: asRows(fieldCitations),
      evidenceAppraisals: asRows(evidenceAppraisals),
      documentRefs: asRows(documentRefs),
      sourceRefs: asRows(sourceRefs),
      mediaEntries: asRows(mediaEntries),
      sourceDocInsightLinks,
      insights: asRows(insights),
      producerCitationConsumers: asRows(producerCitationConsumers),
      opportunitySourceConsumers: asRows(opportunitySourceConsumers),
      reportDocumentConsumers: asRows(reportDocumentConsumers),
      thesisDocumentConsumers: asRows(thesisDocumentConsumers),
      insightDocumentRefs: asRows(insightDocumentRefs),
      companyDocumentRefs: asRows(companyDocumentRefs),
      actorDocumentRefs: asRows(actorDocumentRefs),
    },
  });
}

function nullableJsonWhere(value: Prisma.JsonValue | null) {
  return { equals: value === null ? Prisma.DbNull : value };
}

export function fullReviewedSourceDocContentHashDocumentWhere(
  row: ReviewedSourceDocContentHashDocumentRow,
): Prisma.DocumentWhereInput {
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
    content: row.content,
    summary: row.summary,
    url: row.url,
    accessedAt: row.accessedAt,
    archivedUrl: row.archivedUrl,
    wordCount: row.wordCount,
    tags: { equals: row.tags },
    metadata: nullableJsonWhere(row.metadata),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  } as Prisma.DocumentWhereInput;
}

export function fullReviewedSourceDocContentHashLibraryWhere(
  row: ReviewedSourceDocContentHashLibraryRow,
): Prisma.LibraryAnalysisRecordWhereInput {
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
    aiCard: nullableJsonWhere(row.aiCard),
    aiSummary: row.aiSummary,
    keyFindings: { equals: row.keyFindings },
    claimCandidates: nullableJsonWhere(row.claimCandidates),
    projectImplications: { equals: row.projectImplications },
    gaps: nullableJsonWhere(row.gaps),
    controlLinks: nullableJsonWhere(row.controlLinks),
    riskFlags: { equals: row.riskFlags },
    contentHash: row.contentHash,
    wordCount: row.wordCount,
    processedAt: row.processedAt,
    reviewedAt: row.reviewedAt,
    reviewer: row.reviewer,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  } as Prisma.LibraryAnalysisRecordWhereInput;
}

export function reviewedSourceDocContentHashDocumentUpdateData(
  entry: ReviewedSourceDocContentHashEntry,
) {
  return {
    content: entry.afterFileBytes,
  } satisfies Prisma.DocumentUpdateManyMutationInput;
}

export function reviewedSourceDocContentHashLibraryUpdateData(
  entry: ReviewedSourceDocContentHashEntry,
) {
  return {
    contentHash: entry.afterLibraryContentHash,
  } satisfies Prisma.LibraryAnalysisRecordUpdateManyMutationInput;
}

function exactInventory(
  before: ReviewedSourceDocContentHashPlan,
  after: ReviewedSourceDocContentHashPlan,
) {
  return collectionNames.every(
    (name) =>
      before.dependencyCounts[name] === after.dependencyCounts[name] &&
      canonicalHash(before.dependencyIds[name]) ===
        canonicalHash(after.dependencyIds[name]),
  );
}

export function assertReviewedSourceDocContentHashPostApply(
  before: ReviewedSourceDocContentHashInspection,
  after: ReviewedSourceDocContentHashInspection,
) {
  if (
    after.plan.transition !== "all_after" ||
    after.plan.fileAtomicState !== "all_after" ||
    after.plan.databaseAtomicState !== "all_after" ||
    after.plan.summary.appliedDatabaseRows !== 4 ||
    after.plan.conflicts.length !== 0 ||
    canonicalHash(after.plan.databaseIdentity) !==
      canonicalHash(before.plan.databaseIdentity) ||
    after.plan.preservedDependencySha256 !==
      before.plan.preservedDependencySha256 ||
    !exactInventory(before.plan, after.plan)
  ) {
    throw new Error(
      "Post-apply all-after, exact files, DatabaseIdentity, preserved dependency, or inventory proof failed; transaction must roll back",
    );
  }
}

async function lockReviewedSourceDocContentHashTables(
  transaction: Prisma.TransactionClient,
) {
  await transaction.$executeRaw`
    LOCK TABLE "DatabaseIdentity", "SourceDoc", "Document",
      "LibraryAnalysisRecord", "SourceCitation", "FieldCitation",
      "EvidenceAppraisal", "DocumentRef", "SourceRef", "MediaEntry",
      "Insight", "Producer", "OpportunityEntry", "Report", "Thesis",
      "InsightDocumentRef", "CompanyDocumentRef", "ActorDocumentRef",
      "_InsightSourceDoc"
    IN SHARE ROW EXCLUSIVE MODE
  `;
}

async function lockDatabaseIdentity(
  transaction: Prisma.TransactionClient,
  expected: ReviewedSourceDocContentHashDatabaseIdentity,
) {
  const rows = await transaction.$queryRaw<
    Array<{ identityUuid: string; createdAt: Date }>
  >(Prisma.sql`
    SELECT "identityUuid"::text AS "identityUuid", "createdAt"
    FROM "DatabaseIdentity" WHERE "key" = 'primary' FOR SHARE
  `);
  if (
    rows.length !== 1 ||
    rows[0]!.identityUuid.toLowerCase() !== expected.identityUuid ||
    rows[0]!.createdAt.toISOString() !== expected.createdAt
  ) {
    throw new Error("DatabaseIdentity changed after planning; transaction must roll back");
  }
}

async function applyReviewedSourceDocContentHashUpdates(
  transaction: Prisma.TransactionClient,
  inspection: ReviewedSourceDocContentHashInspection,
) {
  assertReviewedSourceDocContentHashApplyable(inspection);
  const documentById = new Map(
    inspection.collections.documents.map((row) => [row.id, row]),
  );
  const libraryById = new Map(
    inspection.collections.libraryAnalysisRecords.map((row) => [row.id, row]),
  );
  let documents = 0;
  let libraryAnalysisRecords = 0;
  for (const entry of REVIEWED_SOURCE_DOC_CONTENT_HASH_MANIFEST) {
    const document = documentById.get(entry.documentId);
    const library = libraryById.get(entry.libraryAnalysisRecordId);
    if (!document || !library) {
      throw new Error(`Missing locked content/hash target: ${entry.sourceDocId}`);
    }
    const documentResult = await transaction.document.updateMany({
      where: fullReviewedSourceDocContentHashDocumentWhere(document),
      data: reviewedSourceDocContentHashDocumentUpdateData(entry),
    });
    if (documentResult.count !== 1) {
      throw new Error(
        `Concurrent full-row Document CAS conflict: ${entry.documentId}; transaction must roll back`,
      );
    }
    documents += 1;
    const libraryResult = await transaction.libraryAnalysisRecord.updateMany({
      where: fullReviewedSourceDocContentHashLibraryWhere(library),
      data: reviewedSourceDocContentHashLibraryUpdateData(entry),
    });
    if (libraryResult.count !== 1) {
      throw new Error(
        `Concurrent full-row LAR CAS conflict: ${entry.libraryAnalysisRecordId}; transaction must roll back`,
      );
    }
    libraryAnalysisRecords += 1;
  }
  if (documents !== 2 || libraryAnalysisRecords !== 2) {
    throw new Error("Unexpected content/hash mutation counts; transaction must roll back");
  }
  return { documents, libraryAnalysisRecords };
}

function printPlan(inspection: ReviewedSourceDocContentHashInspection, digest: string) {
  const plan = inspection.plan;
  console.log("Reviewed SourceDoc canonical content/hash reconciliation");
  console.log(`Plan SHA-256: ${digest}`);
  console.log(`Manifest SHA-256: ${plan.manifestSha256}`);
  console.log(`Contract SHA-256: ${plan.contractSha256}`);
  console.log(`Database: ${plan.databaseIdentity.currentDatabase}; identity UUID: ${plan.databaseIdentity.identityUuid}`);
  console.log(`File state: ${plan.fileAtomicState}; DB state: ${plan.databaseAtomicState}; transition: ${plan.transition}`);
  console.log(`Dependency SHA-256: ${plan.dependencySha256}; preserved=${plan.preservedDependencySha256}`);
  console.log(`Proof boundary: ${REVIEWED_SOURCE_DOC_CONTENT_HASH_PROOF_BOUNDARY.join("; ")}`);
  for (const file of plan.files) {
    console.log(`${file.state} file ${file.repositoryPath}; bytes=${file.byteLength ?? "missing"}; sha256=${file.sha256 ?? "missing"}`);
  }
  for (const target of plan.targets) {
    console.log(`${target.sourceDocId}: Document=${target.documentState}; LAR=${target.libraryState}`);
  }
  for (const item of plan.conflicts) console.log(`Conflict ${item.code} ${item.subject}: ${item.detail}`);
}

async function main() {
  const args = parseReviewedSourceDocContentHashArgs(process.argv.slice(2));
  if (args.apply && args.ack !== REVIEWED_SOURCE_DOC_CONTENT_HASH_APPLY_ACK) {
    throw new Error(`--apply requires --ack=${REVIEWED_SOURCE_DOC_CONTENT_HASH_APPLY_ACK}`);
  }
  if (args.apply && !/^[a-f0-9]{64}$/.test(args.expectedPlanSha256 ?? "")) {
    throw new Error("--apply requires exact --plan-sha256=<64 lowercase hex>");
  }
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
  try {
    const inspection = await inspectReviewedSourceDocContentHashDatabaseState(prisma);
    const digest = reviewedSourceDocContentHashPlanSha256(inspection);
    printPlan(inspection, digest);
    if (inspection.plan.transition === "conflict") {
      throw new Error(`Reviewed SourceDoc content/hash conflicts: ${inspection.plan.conflicts.map((item) => `${item.subject}:${item.code}`).join(", ")}`);
    }
    if (!args.apply) {
      console.log(`Dry run only. DB apply is permitted only for files_after_db_before with --apply --ack=${REVIEWED_SOURCE_DOC_CONTENT_HASH_APPLY_ACK} --plan-sha256=${digest}`);
      return;
    }
    assertReviewedSourceDocContentHashApplyable(inspection);
    if (digest !== args.expectedPlanSha256) {
      throw new Error("Current content/hash plan differs from --plan-sha256; rerun dry-run");
    }
    const result = await prisma.$transaction(
      async (transaction) => {
        await lockReviewedSourceDocContentHashTables(transaction);
        await transaction.$executeRaw`
          SELECT pg_advisory_xact_lock(hashtext(${REVIEWED_SOURCE_DOC_CONTENT_HASH_ADVISORY_LOCK_KEY}))
        `;
        await lockDatabaseIdentity(transaction, inspection.plan.databaseIdentity);
        const locked = await inspectReviewedSourceDocContentHashDatabaseState(transaction);
        assertReviewedSourceDocContentHashApplyable(locked);
        if (reviewedSourceDocContentHashPlanSha256(locked) !== args.expectedPlanSha256) {
          throw new Error("Locked content/hash plan changed; transaction must roll back");
        }
        const counts = await applyReviewedSourceDocContentHashUpdates(transaction, locked);
        const after = await inspectReviewedSourceDocContentHashDatabaseState(transaction);
        assertReviewedSourceDocContentHashPostApply(locked, after);
        return counts;
      },
      { isolationLevel: "Serializable" },
    );
    console.log(`Applied SourceDoc content/hash DB mirrors: ${JSON.stringify(result)}`);
  } catch (error) {
    if (args.apply) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(`SourceDoc content/hash reconciliation failed; the Serializable transaction rolled back and zero DB rows were committed. Repository files are outside the DB transaction. Cause: ${detail}`, { cause: error });
    }
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

const isEntrypoint = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false;
if (isEntrypoint) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : "SourceDoc content/hash reconciliation failed");
    process.exitCode = 1;
  });
}
