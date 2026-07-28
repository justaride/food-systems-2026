import "dotenv/config";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { Prisma, PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  REVIEWED_SANDANGER_CONTENT_HASH_MANIFEST,
  REVIEWED_SANDANGER_CONTENT_HASH_MANIFEST_SHA256,
  REVIEWED_SANDANGER_CONTENT_HASH_VERSION,
  assertReviewedSandangerContentHashManifestPinned,
  type ReviewedSandangerContentHashEntry,
} from "../src/lib/citations/reviewed-sandanger-content-hash-reconciliation";
import {
  REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS,
  canonicalizeReviewedThesisBibliographicJson,
} from "../src/lib/citations/reviewed-thesis-bibliographic-repair";
import {
  portableThesisBibliographyToDatabaseRow,
  type ReviewedThesisBibliographicDatabaseRow,
} from "./apply-reviewed-thesis-bibliographic-repair";

export const REVIEWED_SANDANGER_CONTENT_HASH_APPLY_ACK =
  "APPLY_REVIEWED_SANDANGER_CONTENT_HASH_DB_1";
export const REVIEWED_SANDANGER_CONTENT_HASH_ADVISORY_LOCK_KEY =
  "foodsystems:reviewed-sandanger-content-hash:2026-07-20:v1";
export const REVIEWED_SANDANGER_CONTENT_HASH_PROOF_BOUNDARY = [
  "repository files and PostgreSQL are not one transaction",
  "the runner never writes repository files",
  "DB apply is allowed only from exact files_after_db_before",
  "files are re-read under the locked Serializable DB transaction before and after mutation",
  "entity-type review, titles, findings, and claims remain protected",
] as const;

const thesisSelect = {
  id: true,
  authors: true,
  institution: true,
  year: true,
  title: true,
  titleNo: true,
  url: true,
  synthesis: true,
  keyFindings: true,
  tags: true,
  takeaways: true,
  method: true,
  awardWinning: true,
  degree: true,
  doi: true,
  isbn: true,
  publisher: true,
  accessDate: true,
  documentId: true,
} satisfies Prisma.ThesisSelect;

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

export type ReviewedSandangerThesisRow = Prisma.ThesisGetPayload<{
  select: typeof thesisSelect;
}>;
export type ReviewedSandangerDocumentRow = Prisma.DocumentGetPayload<{
  select: typeof documentSelect;
}>;
export type ReviewedSandangerLibraryRow =
  Prisma.LibraryAnalysisRecordGetPayload<{
    select: typeof libraryAnalysisRecordSelect;
  }>;

type DependencyRow = Record<string, unknown>;

export type ReviewedSandangerDependencyCollections = {
  theses: ReviewedSandangerThesisRow[];
  documents: ReviewedSandangerDocumentRow[];
  libraryAnalysisRecords: ReviewedSandangerLibraryRow[];
  sourceCitations: DependencyRow[];
  fieldCitations: DependencyRow[];
  evidenceAppraisals: DependencyRow[];
  documentRefs: DependencyRow[];
  insightDocumentRefs: DependencyRow[];
  companyDocumentRefs: DependencyRow[];
  actorDocumentRefs: DependencyRow[];
  sourceDocBindings: DependencyRow[];
  reportBindings: DependencyRow[];
  insightCitationConsumers: DependencyRow[];
  producerCitationConsumers: DependencyRow[];
};

const collectionNames = [
  "theses",
  "documents",
  "libraryAnalysisRecords",
  "sourceCitations",
  "fieldCitations",
  "evidenceAppraisals",
  "documentRefs",
  "insightDocumentRefs",
  "companyDocumentRefs",
  "actorDocumentRefs",
  "sourceDocBindings",
  "reportBindings",
  "insightCitationConsumers",
  "producerCitationConsumers",
] as const satisfies readonly (keyof ReviewedSandangerDependencyCollections)[];

export type ReviewedSandangerDatabaseIdentity = Readonly<{
  currentDatabase: string;
  key: "primary";
  identityUuid: string;
  createdAt: string;
}>;

export type ReviewedSandangerFileState = Readonly<{
  thesisId: typeof REVIEWED_SANDANGER_CONTENT_HASH_MANIFEST.thesisId;
  repositoryPath: string;
  state: "before" | "after" | "conflict";
  byteLength: number | null;
  sha256: string | null;
}>;

export type ReviewedSandangerConflict = Readonly<{
  code: string;
  subject: string;
  detail: string;
}>;

export type ReviewedSandangerTargetState = Readonly<{
  thesisId: typeof REVIEWED_SANDANGER_CONTENT_HASH_MANIFEST.thesisId;
  documentId: typeof REVIEWED_SANDANGER_CONTENT_HASH_MANIFEST.documentId;
  libraryAnalysisRecordId: typeof REVIEWED_SANDANGER_CONTENT_HASH_MANIFEST.libraryAnalysisRecordId;
  thesisIdentityState: "after" | "conflict";
  documentScalarState: "after" | "conflict";
  documentContentState: "before" | "after" | "conflict";
  libraryContentHashState: "before" | "after" | "conflict";
  openEntityReviewState: "open" | "conflict";
  thesisFullRowSha256: string | null;
  documentFullRowSha256: string | null;
  libraryFullRowSha256: string | null;
}>;

export type ReviewedSandangerPlan = Readonly<{
  version: typeof REVIEWED_SANDANGER_CONTENT_HASH_VERSION;
  manifestSha256: string;
  contractSha256: string;
  databaseIdentity: ReviewedSandangerDatabaseIdentity;
  fileAtomicState: "all_before" | "all_after" | "conflict";
  databaseAtomicState: "all_before" | "all_after" | "conflict";
  transition:
    | "all_before"
    | "files_after_db_before"
    | "all_after"
    | "conflict";
  file: ReviewedSandangerFileState;
  target: ReviewedSandangerTargetState;
  targetStateSha256: string;
  dependencySha256: string;
  preservedDependencySha256: string;
  dependencyCounts: Record<
    keyof ReviewedSandangerDependencyCollections,
    number
  >;
  dependencyIds: Record<
    keyof ReviewedSandangerDependencyCollections,
    string[]
  >;
  conflicts: readonly ReviewedSandangerConflict[];
  summary: Readonly<{
    files: 1;
    theses: 1;
    documents: 1;
    libraryAnalysisRecords: 1;
    pendingDatabaseRows: number;
    appliedDatabaseRows: number;
    conflicts: number;
  }>;
  boundary: Readonly<{
    writesFiles: false;
    mutatesTheses: false;
    mutatesDocumentsOnlyContent: true;
    mutatesLibraryAnalysisOnlyContentHash: true;
    closesEntityTypeReview: false;
  }>;
}>;

export type ReviewedSandangerInspection = Readonly<{
  plan: ReviewedSandangerPlan;
  collections: ReviewedSandangerDependencyCollections;
}>;

export type ReviewedSandangerArgs = Readonly<{
  apply: boolean;
  ack: string | undefined;
  expectedPlanSha256: string | undefined;
}>;

type ReviewedSandangerClient = Pick<
  Prisma.TransactionClient,
  | "$queryRaw"
  | "$executeRaw"
  | "thesis"
  | "document"
  | "libraryAnalysisRecord"
  | "sourceCitation"
  | "fieldCitation"
  | "evidenceAppraisal"
  | "documentRef"
  | "insightDocumentRef"
  | "companyDocumentRef"
  | "actorDocumentRef"
  | "sourceDoc"
  | "report"
  | "insight"
  | "producer"
>;

function canonicalHash(value: unknown) {
  return createHash("sha256")
    .update(
      JSON.stringify(canonicalizeReviewedThesisBibliographicJson(value)),
    )
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
  collections: ReviewedSandangerDependencyCollections,
): ReviewedSandangerDependencyCollections {
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
  ) as ReviewedSandangerDependencyCollections;
}

export function classifyReviewedSandangerFile(
  entry: ReviewedSandangerContentHashEntry,
  bytes: Buffer | null,
): ReviewedSandangerFileState {
  if (bytes === null) {
    return {
      thesisId: entry.thesisId,
      repositoryPath: entry.repositoryPath,
      state: "conflict",
      byteLength: null,
      sha256: null,
    };
  }
  const state = bytes.equals(Buffer.from(entry.beforeFileBytes, "utf8"))
    ? "before"
    : bytes.equals(Buffer.from(entry.afterFileBytes, "utf8"))
      ? "after"
      : "conflict";
  return {
    thesisId: entry.thesisId,
    repositoryPath: entry.repositoryPath,
    state,
    byteLength: bytes.byteLength,
    sha256: byteHash(bytes),
  };
}

export function inspectReviewedSandangerFile(
  root = process.cwd(),
): ReviewedSandangerFileState {
  const entry = REVIEWED_SANDANGER_CONTENT_HASH_MANIFEST;
  try {
    return classifyReviewedSandangerFile(
      entry,
      readFileSync(`${root}/${entry.repositoryPath}`),
    );
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    return classifyReviewedSandangerFile(entry, null);
  }
}

function protectedCollections(
  collections: ReviewedSandangerDependencyCollections,
) {
  const entry = REVIEWED_SANDANGER_CONTENT_HASH_MANIFEST;
  return {
    ...collections,
    documents: collections.documents.map((row) => {
      if (row.id !== entry.documentId) return row;
      const copy = { ...row } as Record<string, unknown>;
      delete copy.content;
      delete copy.updatedAt;
      return copy;
    }),
    libraryAnalysisRecords: collections.libraryAnalysisRecords.map((row) => {
      if (row.id !== entry.libraryAnalysisRecordId) return row;
      const copy = { ...row } as Record<string, unknown>;
      delete copy.contentHash;
      delete copy.updatedAt;
      return copy;
    }),
  };
}

function conflict(
  conflicts: ReviewedSandangerConflict[],
  code: string,
  subject: string,
  detail: string,
) {
  conflicts.push({ code, subject, detail });
}

function exactReviewedThesisAfter(row: ReviewedSandangerThesisRow) {
  const entry = REVIEWED_SANDANGER_CONTENT_HASH_MANIFEST;
  const repair = REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS.find(
    (candidate) => candidate.id === entry.thesisId,
  );
  if (!repair) return false;
  return (
    canonicalHash(row) ===
    canonicalHash(
      portableThesisBibliographyToDatabaseRow(
        repair.after,
        entry.documentId,
      ),
    )
  );
}

function exactOpenEntityReview(row: ReviewedSandangerLibraryRow) {
  const policy = REVIEWED_SANDANGER_CONTENT_HASH_MANIFEST.openEntityReview;
  return (
    row.title === policy.title &&
    row.status === policy.status &&
    row.usageRule === policy.usageRule &&
    row.reviewStatus === policy.reviewStatus &&
    row.citationReadiness === policy.citationReadiness &&
    row.analysisTier === policy.analysisTier &&
    canonicalHash(row.riskFlags) === canonicalHash(policy.riskFlags) &&
    canonicalHash(row.keyFindings) === canonicalHash(policy.keyFindings) &&
    canonicalHash(row.claimCandidates) ===
      canonicalHash(policy.claimCandidates)
  );
}

export function reviewedSandangerContentHashContract() {
  const entry = REVIEWED_SANDANGER_CONTENT_HASH_MANIFEST;
  return {
    version: REVIEWED_SANDANGER_CONTENT_HASH_VERSION,
    manifestSha256: REVIEWED_SANDANGER_CONTENT_HASH_MANIFEST_SHA256,
    thesisId: entry.thesisId,
    documentId: entry.documentId,
    libraryAnalysisRecordId: entry.libraryAnalysisRecordId,
    reviewedLocator: entry.reviewedLocator,
    hashFormula: 'sha256(Document.summary + "\\n\\n" + Document.content)',
    applyTransition: "files_after_db_before",
    proofBoundary: REVIEWED_SANDANGER_CONTENT_HASH_PROOF_BOUNDARY,
    boundary: {
      writesFiles: false,
      mutatesTheses: false,
      mutatesDocumentsOnlyContent: true,
      mutatesLibraryAnalysisOnlyContentHash: true,
      closesEntityTypeReview: false,
    },
  };
}

export const REVIEWED_SANDANGER_CONTENT_HASH_CONTRACT_SHA256 = canonicalHash(
  reviewedSandangerContentHashContract(),
);

export function buildReviewedSandangerContentHashPlan(input: {
  databaseIdentity: ReviewedSandangerDatabaseIdentity;
  file: ReviewedSandangerFileState;
  collections: ReviewedSandangerDependencyCollections;
}): ReviewedSandangerInspection {
  assertReviewedSandangerContentHashManifestPinned();
  const entry = REVIEWED_SANDANGER_CONTENT_HASH_MANIFEST;
  const collections = normalizeCollections(input.collections);
  const conflicts: ReviewedSandangerConflict[] = [];
  let file = input.file;
  if (
    file.thesisId !== entry.thesisId ||
    file.repositoryPath !== entry.repositoryPath
  ) {
    conflict(
      conflicts,
      "file_inventory_drift",
      entry.thesisId,
      "Expected the one exact Sandanger canonical file inspection",
    );
    file = {
      thesisId: entry.thesisId,
      repositoryPath: entry.repositoryPath,
      state: "conflict",
      byteLength: null,
      sha256: null,
    };
  } else if (file.state === "conflict") {
    conflict(
      conflicts,
      "file_bytes_drift",
      entry.thesisId,
      "File bytes match neither the exact before nor after contract",
    );
  }

  const thesis = collections.theses.find((row) => row.id === entry.thesisId);
  const thesisIdentityState =
    thesis && exactReviewedThesisAfter(thesis) ? "after" : "conflict";
  if (thesisIdentityState === "conflict") {
    conflict(
      conflicts,
      "thesis_identity_drift",
      entry.thesisId,
      "Thesis is not the exact reviewed after identity and Document binding",
    );
  }

  const document = collections.documents.find(
    (row) => row.id === entry.documentId,
  );
  const documentScalarState =
    document &&
    document.filePath === entry.documentFilePath &&
    document.title === entry.documentTitle &&
    document.summary === entry.documentSummary &&
    document.url === entry.reviewedLocator
      ? "after"
      : "conflict";
  if (documentScalarState === "conflict") {
    conflict(
      conflicts,
      "document_scalar_drift",
      entry.documentId,
      "Document title, path, summary, or reviewed scalar URL drifted",
    );
  }
  const documentContentState =
    documentScalarState === "after" && document
      ? document.content === entry.beforeFileBytes
        ? "before"
        : document.content === entry.afterFileBytes
          ? "after"
          : "conflict"
      : "conflict";
  if (documentContentState === "conflict") {
    conflict(
      conflicts,
      "document_content_drift",
      entry.documentId,
      "Document content matches neither exact canonical before nor after bytes",
    );
  }

  const targetLibraries = collections.libraryAnalysisRecords.filter(
    (row) => row.id === entry.libraryAnalysisRecordId,
  );
  const library = targetLibraries.length === 1 ? targetLibraries[0]! : null;
  const libraryBindingExact =
    library !== null &&
    library.sourceKind === "document" &&
    library.sourceKey === `document:${entry.documentId}` &&
    library.documentId === entry.documentId &&
    library.sourceDocId === null &&
    library.canonicalPath === entry.documentFilePath;
  const openEntityReviewState =
    libraryBindingExact && library && exactOpenEntityReview(library)
      ? "open"
      : "conflict";
  if (openEntityReviewState === "conflict") {
    conflict(
      conflicts,
      "open_entity_review_drift",
      entry.libraryAnalysisRecordId,
      "LAR binding, open review state, title, findings, or claims drifted",
    );
  }
  const libraryContentHashState =
    openEntityReviewState === "open" && library
      ? library.contentHash === entry.beforeLibraryContentHash
        ? "before"
        : library.contentHash === entry.afterLibraryContentHash
          ? "after"
          : "conflict"
      : "conflict";
  if (libraryContentHashState === "conflict") {
    conflict(
      conflicts,
      "library_content_hash_drift",
      entry.libraryAnalysisRecordId,
      "LAR contentHash matches neither exact composite before nor after hash",
    );
  }

  if (
    collections.theses.length !== 1 ||
    collections.documents.length !== 1 ||
    targetLibraries.length !== 1
  ) {
    conflict(
      conflicts,
      "target_inventory_drift",
      entry.thesisId,
      `Expected 1 Thesis, 1 Document, and 1 target LAR; found ${collections.theses.length}/${collections.documents.length}/${targetLibraries.length}`,
    );
  }

  const fileAtomicState =
    file.state === "before"
      ? "all_before"
      : file.state === "after"
        ? "all_after"
        : "conflict";
  const databaseAtomicState =
    thesisIdentityState === "after" &&
    documentScalarState === "after" &&
    openEntityReviewState === "open" &&
    documentContentState === "before" &&
    libraryContentHashState === "before"
      ? "all_before"
      : thesisIdentityState === "after" &&
          documentScalarState === "after" &&
          openEntityReviewState === "open" &&
          documentContentState === "after" &&
          libraryContentHashState === "after"
        ? "all_after"
        : "conflict";
  if (
    databaseAtomicState === "conflict" &&
    conflicts.length === 0
  ) {
    conflict(
      conflicts,
      "database_atomic_hybrid",
      entry.thesisId,
      "Document content and LAR hash are a partial before/after mixture",
    );
  }

  let transition: ReviewedSandangerPlan["transition"] =
    fileAtomicState === "all_before" && databaseAtomicState === "all_before"
      ? "all_before"
      : fileAtomicState === "all_after" && databaseAtomicState === "all_before"
        ? "files_after_db_before"
        : fileAtomicState === "all_after" && databaseAtomicState === "all_after"
          ? "all_after"
          : "conflict";
  if (transition === "conflict" && conflicts.length === 0) {
    conflict(
      conflicts,
      "cross_boundary_hybrid",
      entry.thesisId,
      "Filesystem/DB state is not an allowed two-phase transition",
    );
  }
  if (conflicts.length > 0) transition = "conflict";

  const target: ReviewedSandangerTargetState = {
    thesisId: entry.thesisId,
    documentId: entry.documentId,
    libraryAnalysisRecordId: entry.libraryAnalysisRecordId,
    thesisIdentityState,
    documentScalarState,
    documentContentState,
    libraryContentHashState,
    openEntityReviewState,
    thesisFullRowSha256: thesis ? canonicalHash(thesis) : null,
    documentFullRowSha256: document ? canonicalHash(document) : null,
    libraryFullRowSha256: library ? canonicalHash(library) : null,
  };
  const dependencyCounts = Object.fromEntries(
    collectionNames.map((name) => [name, collections[name].length]),
  ) as Record<keyof ReviewedSandangerDependencyCollections, number>;
  const dependencyIds = Object.fromEntries(
    collectionNames.map((name) => [
      name,
      collections[name].map((row) => rowId(row, name)),
    ]),
  ) as Record<keyof ReviewedSandangerDependencyCollections, string[]>;
  const pendingDatabaseRows =
    Number(documentContentState === "before") +
    Number(libraryContentHashState === "before");
  const appliedDatabaseRows =
    Number(documentContentState === "after") +
    Number(libraryContentHashState === "after");
  const plan: ReviewedSandangerPlan = {
    version: REVIEWED_SANDANGER_CONTENT_HASH_VERSION,
    manifestSha256: REVIEWED_SANDANGER_CONTENT_HASH_MANIFEST_SHA256,
    contractSha256: REVIEWED_SANDANGER_CONTENT_HASH_CONTRACT_SHA256,
    databaseIdentity: input.databaseIdentity,
    fileAtomicState,
    databaseAtomicState,
    transition,
    file,
    target,
    targetStateSha256: canonicalHash({ file, target }),
    dependencySha256: canonicalHash(collections),
    preservedDependencySha256: canonicalHash(
      protectedCollections(collections),
    ),
    dependencyCounts,
    dependencyIds,
    conflicts,
    summary: {
      files: 1,
      theses: 1,
      documents: 1,
      libraryAnalysisRecords: 1,
      pendingDatabaseRows,
      appliedDatabaseRows,
      conflicts: conflicts.length,
    },
    boundary: {
      writesFiles: false,
      mutatesTheses: false,
      mutatesDocumentsOnlyContent: true,
      mutatesLibraryAnalysisOnlyContentHash: true,
      closesEntityTypeReview: false,
    },
  };
  return { plan, collections };
}

export function reviewedSandangerContentHashPlanSha256(
  inspection: ReviewedSandangerInspection,
) {
  return canonicalHash(inspection.plan);
}

export function parseReviewedSandangerContentHashArgs(
  argv: readonly string[],
): ReviewedSandangerArgs {
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
      throw new Error(`Unknown reviewed Sandanger content/hash argument: ${argument}`);
    }
  }
  if (apply && dryRun) {
    throw new Error("--apply and --dry-run are mutually exclusive");
  }
  if (!apply && (ack !== undefined || expectedPlanSha256 !== undefined)) {
    throw new Error("--ack and --plan-sha256 are valid only with --apply");
  }
  return { apply, ack, expectedPlanSha256 };
}

export function assertReviewedSandangerContentHashApplyable(
  inspection: ReviewedSandangerInspection,
) {
  if (
    inspection.plan.transition !== "files_after_db_before" ||
    inspection.plan.fileAtomicState !== "all_after" ||
    inspection.plan.databaseAtomicState !== "all_before" ||
    inspection.plan.target.openEntityReviewState !== "open" ||
    inspection.plan.conflicts.length !== 0 ||
    inspection.plan.summary.pendingDatabaseRows !== 2
  ) {
    throw new Error(
      "DB apply requires exact recoverable files_after_db_before with entity review still open",
    );
  }
}

async function inspectDatabaseIdentity(
  client: Pick<Prisma.TransactionClient, "$queryRaw">,
): Promise<ReviewedSandangerDatabaseIdentity> {
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
    throw new Error("Reviewed Sandanger reconciliation requires one valid DatabaseIdentity");
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

export async function inspectReviewedSandangerDatabaseState(
  client: ReviewedSandangerClient,
  root = process.cwd(),
): Promise<ReviewedSandangerInspection> {
  const entry = REVIEWED_SANDANGER_CONTENT_HASH_MANIFEST;
  const [databaseIdentity, theses, documents, libraryAnalysisRecords, sourceCitations, file] =
    await Promise.all([
      inspectDatabaseIdentity(client),
      client.thesis.findMany({
        where: { id: entry.thesisId },
        select: thesisSelect,
        orderBy: { id: "asc" },
      }),
      client.document.findMany({
        where: { id: entry.documentId },
        select: documentSelect,
        orderBy: { id: "asc" },
      }),
      client.libraryAnalysisRecord.findMany({
        where: {
          OR: [
            { id: entry.libraryAnalysisRecordId },
            { documentId: entry.documentId },
            { sourceKind: "thesis", sourceKey: `thesis:${entry.thesisId}` },
          ],
        },
        select: libraryAnalysisRecordSelect,
        orderBy: { id: "asc" },
      }),
      client.sourceCitation.findMany({
        where: {
          OR: [
            { documentId: entry.documentId },
            {
              fieldCitations: {
                some: {
                  OR: [
                    { entityType: "Thesis", entityId: entry.thesisId },
                    { entityType: "Document", entityId: entry.documentId },
                  ],
                },
              },
            },
          ],
        },
        orderBy: { id: "asc" },
      }),
      Promise.resolve(inspectReviewedSandangerFile(root)),
    ]);
  const citationIds = sourceCitations.map((row) => row.id);
  const [
    fieldCitations,
    evidenceAppraisals,
    documentRefs,
    insightDocumentRefs,
    companyDocumentRefs,
    actorDocumentRefs,
    sourceDocBindings,
    reportBindings,
    insightCitationConsumers,
    producerCitationConsumers,
  ] = await Promise.all([
    client.fieldCitation.findMany({
      where: {
        OR: [
          { citationId: { in: citationIds } },
          { entityType: "Thesis", entityId: entry.thesisId },
          { entityType: "Document", entityId: entry.documentId },
        ],
      },
      orderBy: { id: "asc" },
    }),
    client.evidenceAppraisal.findMany({
      where: {
        OR: [
          { thesisId: entry.thesisId },
          { reviewBasisCitationId: { in: citationIds } },
        ],
      },
      orderBy: { id: "asc" },
    }),
    client.documentRef.findMany({
      where: {
        OR: [{ fromId: entry.documentId }, { toId: entry.documentId }],
      },
      orderBy: { id: "asc" },
    }),
    client.insightDocumentRef.findMany({
      where: { documentId: entry.documentId },
      orderBy: { id: "asc" },
    }),
    client.companyDocumentRef.findMany({
      where: { documentId: entry.documentId },
      orderBy: { id: "asc" },
    }),
    client.actorDocumentRef.findMany({
      where: { documentId: entry.documentId },
      orderBy: { id: "asc" },
    }),
    client.sourceDoc.findMany({
      where: { documentId: entry.documentId },
      orderBy: { id: "asc" },
    }),
    client.report.findMany({
      where: { documentId: entry.documentId },
      orderBy: { id: "asc" },
    }),
    client.insight.findMany({
      where: { primaryCitationId: { in: citationIds } },
      orderBy: { id: "asc" },
    }),
    client.producer.findMany({
      where: { primaryCitationId: { in: citationIds } },
      orderBy: { id: "asc" },
    }),
  ]);
  return buildReviewedSandangerContentHashPlan({
    databaseIdentity,
    file,
    collections: {
      theses,
      documents,
      libraryAnalysisRecords,
      sourceCitations: asRows(sourceCitations),
      fieldCitations: asRows(fieldCitations),
      evidenceAppraisals: asRows(evidenceAppraisals),
      documentRefs: asRows(documentRefs),
      insightDocumentRefs: asRows(insightDocumentRefs),
      companyDocumentRefs: asRows(companyDocumentRefs),
      actorDocumentRefs: asRows(actorDocumentRefs),
      sourceDocBindings: asRows(sourceDocBindings),
      reportBindings: asRows(reportBindings),
      insightCitationConsumers: asRows(insightCitationConsumers),
      producerCitationConsumers: asRows(producerCitationConsumers),
    },
  });
}

function nullableJsonWhere(value: Prisma.JsonValue | null) {
  return { equals: value === null ? Prisma.DbNull : value };
}

export function fullReviewedSandangerDocumentWhere(
  row: ReviewedSandangerDocumentRow,
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

export function fullReviewedSandangerLibraryWhere(
  row: ReviewedSandangerLibraryRow,
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

export function reviewedSandangerDocumentUpdateData(
  entry: ReviewedSandangerContentHashEntry,
) {
  return {
    content: entry.afterFileBytes,
  } satisfies Prisma.DocumentUpdateManyMutationInput;
}

export function reviewedSandangerLibraryUpdateData(
  entry: ReviewedSandangerContentHashEntry,
) {
  return {
    contentHash: entry.afterLibraryContentHash,
  } satisfies Prisma.LibraryAnalysisRecordUpdateManyMutationInput;
}

function exactInventory(
  before: ReviewedSandangerPlan,
  after: ReviewedSandangerPlan,
) {
  return collectionNames.every(
    (name) =>
      before.dependencyCounts[name] === after.dependencyCounts[name] &&
      canonicalHash(before.dependencyIds[name]) ===
        canonicalHash(after.dependencyIds[name]),
  );
}

export function assertReviewedSandangerContentHashPostApply(
  before: ReviewedSandangerInspection,
  after: ReviewedSandangerInspection,
) {
  assertReviewedSandangerContentHashApplyable(before);
  if (
    after.plan.transition !== "all_after" ||
    after.plan.fileAtomicState !== "all_after" ||
    after.plan.databaseAtomicState !== "all_after" ||
    after.plan.target.openEntityReviewState !== "open" ||
    after.plan.summary.appliedDatabaseRows !== 2 ||
    after.plan.conflicts.length !== 0 ||
    canonicalHash(after.plan.databaseIdentity) !==
      canonicalHash(before.plan.databaseIdentity) ||
    after.plan.preservedDependencySha256 !==
      before.plan.preservedDependencySha256 ||
    !exactInventory(before.plan, after.plan)
  ) {
    throw new Error(
      "Post-apply all-after, exact file, open entity review, DatabaseIdentity, protected title/findings/claims, dependency, or inventory proof failed; transaction must roll back",
    );
  }
}

async function lockReviewedSandangerTables(
  transaction: Prisma.TransactionClient,
) {
  await transaction.$executeRaw`
    LOCK TABLE "DatabaseIdentity", "Thesis", "Document",
      "LibraryAnalysisRecord", "SourceCitation", "FieldCitation",
      "EvidenceAppraisal", "DocumentRef", "InsightDocumentRef",
      "CompanyDocumentRef", "ActorDocumentRef", "SourceDoc", "Report",
      "Insight", "Producer"
    IN SHARE ROW EXCLUSIVE MODE
  `;
}

async function lockDatabaseIdentity(
  transaction: Prisma.TransactionClient,
  expected: ReviewedSandangerDatabaseIdentity,
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

async function applyReviewedSandangerUpdates(
  transaction: Prisma.TransactionClient,
  inspection: ReviewedSandangerInspection,
) {
  assertReviewedSandangerContentHashApplyable(inspection);
  const entry = REVIEWED_SANDANGER_CONTENT_HASH_MANIFEST;
  const document = inspection.collections.documents.find(
    (row) => row.id === entry.documentId,
  );
  const library = inspection.collections.libraryAnalysisRecords.find(
    (row) => row.id === entry.libraryAnalysisRecordId,
  );
  if (!document || !library) {
    throw new Error("Missing locked Sandanger content/hash target");
  }
  const documentResult = await transaction.document.updateMany({
    where: fullReviewedSandangerDocumentWhere(document),
    data: reviewedSandangerDocumentUpdateData(entry),
  });
  if (documentResult.count !== 1) {
    throw new Error(
      `Concurrent full-row Document CAS conflict: ${entry.documentId}; transaction must roll back`,
    );
  }
  const libraryResult = await transaction.libraryAnalysisRecord.updateMany({
    where: fullReviewedSandangerLibraryWhere(library),
    data: reviewedSandangerLibraryUpdateData(entry),
  });
  if (libraryResult.count !== 1) {
    throw new Error(
      `Concurrent full-row LAR CAS conflict: ${entry.libraryAnalysisRecordId}; transaction must roll back`,
    );
  }
  return { documents: 1, libraryAnalysisRecords: 1 } as const;
}

function printPlan(inspection: ReviewedSandangerInspection, digest: string) {
  const plan = inspection.plan;
  console.log("Reviewed Sandanger canonical content/hash reconciliation");
  console.log(`Plan SHA-256: ${digest}`);
  console.log(`Manifest SHA-256: ${plan.manifestSha256}`);
  console.log(`Contract SHA-256: ${plan.contractSha256}`);
  console.log(
    `Database: ${plan.databaseIdentity.currentDatabase}; identity UUID: ${plan.databaseIdentity.identityUuid}`,
  );
  console.log(
    `File state: ${plan.fileAtomicState}; DB state: ${plan.databaseAtomicState}; transition: ${plan.transition}`,
  );
  console.log(
    `Dependency SHA-256: ${plan.dependencySha256}; preserved=${plan.preservedDependencySha256}`,
  );
  console.log(
    `Proof boundary: ${REVIEWED_SANDANGER_CONTENT_HASH_PROOF_BOUNDARY.join("; ")}`,
  );
  console.log(
    `${plan.file.state} file ${plan.file.repositoryPath}; bytes=${plan.file.byteLength ?? "missing"}; sha256=${plan.file.sha256 ?? "missing"}`,
  );
  console.log(
    `${plan.target.thesisId}: Thesis=${plan.target.thesisIdentityState}; Document scalar=${plan.target.documentScalarState}; content=${plan.target.documentContentState}; LAR=${plan.target.libraryContentHashState}; entity review=${plan.target.openEntityReviewState}`,
  );
  for (const item of plan.conflicts) {
    console.log(`Conflict ${item.code} ${item.subject}: ${item.detail}`);
  }
}

async function main() {
  const args = parseReviewedSandangerContentHashArgs(process.argv.slice(2));
  if (args.apply && args.ack !== REVIEWED_SANDANGER_CONTENT_HASH_APPLY_ACK) {
    throw new Error(
      `--apply requires --ack=${REVIEWED_SANDANGER_CONTENT_HASH_APPLY_ACK}`,
    );
  }
  if (args.apply && !/^[a-f0-9]{64}$/.test(args.expectedPlanSha256 ?? "")) {
    throw new Error("--apply requires exact --plan-sha256=<64 lowercase hex>");
  }
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
  try {
    const inspection = await inspectReviewedSandangerDatabaseState(prisma);
    const digest = reviewedSandangerContentHashPlanSha256(inspection);
    printPlan(inspection, digest);
    if (inspection.plan.transition === "conflict") {
      throw new Error(
        `Reviewed Sandanger content/hash conflicts: ${inspection.plan.conflicts
          .map((item) => `${item.subject}:${item.code}`)
          .join(", ")}`,
      );
    }
    if (!args.apply) {
      console.log(
        `Dry run only. DB apply is permitted only for files_after_db_before with --apply --ack=${REVIEWED_SANDANGER_CONTENT_HASH_APPLY_ACK} --plan-sha256=${digest}`,
      );
      return;
    }
    assertReviewedSandangerContentHashApplyable(inspection);
    if (digest !== args.expectedPlanSha256) {
      throw new Error(
        "Current Sandanger content/hash plan differs from --plan-sha256; rerun dry-run",
      );
    }
    const result = await prisma.$transaction(
      async (transaction) => {
        await lockReviewedSandangerTables(transaction);
        await transaction.$executeRaw`
          SELECT pg_advisory_xact_lock(hashtext(${REVIEWED_SANDANGER_CONTENT_HASH_ADVISORY_LOCK_KEY}))
        `;
        await lockDatabaseIdentity(transaction, inspection.plan.databaseIdentity);
        const locked = await inspectReviewedSandangerDatabaseState(transaction);
        assertReviewedSandangerContentHashApplyable(locked);
        if (
          reviewedSandangerContentHashPlanSha256(locked) !==
          args.expectedPlanSha256
        ) {
          throw new Error(
            "Locked Sandanger content/hash plan changed; transaction must roll back",
          );
        }
        const counts = await applyReviewedSandangerUpdates(transaction, locked);
        const after = await inspectReviewedSandangerDatabaseState(transaction);
        assertReviewedSandangerContentHashPostApply(locked, after);
        return counts;
      },
      { isolationLevel: "Serializable" },
    );
    console.log(`Applied Sandanger content/hash DB mirrors: ${JSON.stringify(result)}`);
  } catch (error) {
    if (args.apply) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(
        `Sandanger content/hash reconciliation failed; the Serializable transaction rolled back and zero DB rows were committed. Repository files are outside the DB transaction. Cause: ${detail}`,
        { cause: error },
      );
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
    console.error(
      error instanceof Error
        ? error.message
        : "Sandanger content/hash reconciliation failed",
    );
    process.exitCode = 1;
  });
}
