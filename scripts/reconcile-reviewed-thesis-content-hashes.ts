import "dotenv/config";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { Prisma, PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PINNED_REVIEWED_THESIS_CONTENT_HASH_MANIFEST_SHA256,
  REVIEWED_THESIS_CONTENT_HASH_FILES,
  REVIEWED_THESIS_CONTENT_HASH_IDS,
  REVIEWED_THESIS_CONTENT_HASH_MANIFEST,
  REVIEWED_THESIS_CONTENT_HASH_MANIFEST_SHA256,
  REVIEWED_THESIS_CONTENT_HASH_MISSING_PDF_PATHS,
  REVIEWED_THESIS_CONTENT_HASH_VERSION,
  assertReviewedThesisContentHashManifestPinned,
  type ReviewedThesisContentFileEntry,
  type ReviewedThesisContentHashEntry,
  type ReviewedThesisContentHashId,
} from "../src/lib/citations/reviewed-thesis-content-hash-reconciliation";
import {
  REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS,
  canonicalizeReviewedThesisBibliographicJson,
  sha256ReviewedThesisBibliographicJson,
} from "../src/lib/citations/reviewed-thesis-bibliographic-repair";
import {
  databaseRowToPortableThesisBibliography,
  normalizeReviewedThesisBibliographicDatabaseRow,
  type ReviewedThesisBibliographicDatabaseRow,
} from "./apply-reviewed-thesis-bibliographic-repair";

export const REVIEWED_THESIS_CONTENT_HASH_APPLY_ACK =
  "APPLY_REVIEWED_THESIS_CONTENT_HASH_DB_5";
export const REVIEWED_THESIS_CONTENT_HASH_ADVISORY_LOCK_KEY =
  "foodsystems:reviewed-thesis-content-hash:2026-07-20:v1";
export const REVIEWED_THESIS_CONTENT_HASH_PROOF_BOUNDARY = [
  "repository files and PostgreSQL are not one transaction",
  "the runner never writes repository files or missing PDF placeholders",
  "DB apply is allowed only from exact files_after_db_before",
  "all five expected PDF targets must remain absent during this batch",
  "only Document.content/wordCount and LAR.contentHash/wordCount may change",
  "Thesis synthesis, findings, takeaways, method, all LAR analysis text, and all citations are protected",
  "files and missing-PDF guards are re-read inside the locked Serializable transaction",
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

export type ReviewedThesisContentHashDocumentRow = Prisma.DocumentGetPayload<{
  select: typeof documentSelect;
}>;
export type ReviewedThesisContentHashLibraryRow =
  Prisma.LibraryAnalysisRecordGetPayload<{
    select: typeof libraryAnalysisRecordSelect;
  }>;

type DependencyRow = Record<string, unknown>;

export type ReviewedThesisContentHashDependencyCollections = {
  theses: ReviewedThesisBibliographicDatabaseRow[];
  documents: ReviewedThesisContentHashDocumentRow[];
  libraryAnalysisRecords: ReviewedThesisContentHashLibraryRow[];
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
] as const satisfies readonly (keyof ReviewedThesisContentHashDependencyCollections)[];

export type ReviewedThesisContentHashDatabaseIdentity = Readonly<{
  currentDatabase: string;
  key: "primary";
  identityUuid: string;
  createdAt: string;
}>;

export type ReviewedThesisContentHashFileState = Readonly<{
  artifactId: string;
  thesisId: ReviewedThesisContentHashId;
  repositoryPath: string;
  state: "before" | "after" | "conflict";
  byteLength: number | null;
  sha256: string | null;
}>;

export type ReviewedThesisContentHashMissingPdfState = Readonly<{
  repositoryPath: string;
  state: "missing" | "present";
}>;

export type ReviewedThesisContentHashConflict = Readonly<{
  code: string;
  subject: string;
  detail: string;
}>;

export type ReviewedThesisContentHashTargetState = Readonly<{
  thesisId: ReviewedThesisContentHashId;
  documentId: string;
  libraryAnalysisRecordId: string;
  documentState: "before" | "after" | "conflict";
  libraryState: "before" | "after" | "conflict";
  documentFullRowSha256: string | null;
  libraryFullRowSha256: string | null;
}>;

export type ReviewedThesisContentHashPlan = Readonly<{
  version: typeof REVIEWED_THESIS_CONTENT_HASH_VERSION;
  manifestSha256: string;
  pinnedManifestSha256: string;
  contractSha256: string;
  databaseIdentity: ReviewedThesisContentHashDatabaseIdentity;
  fileAtomicState: "all_before" | "all_after" | "conflict";
  databaseAtomicState: "all_before" | "all_after" | "conflict";
  transition:
    | "all_before"
    | "files_after_db_before"
    | "all_after"
    | "conflict";
  files: readonly ReviewedThesisContentHashFileState[];
  missingPdfs: readonly ReviewedThesisContentHashMissingPdfState[];
  targets: readonly ReviewedThesisContentHashTargetState[];
  targetStateSha256: string;
  dependencySha256: string;
  preservedDependencySha256: string;
  dependencyCounts: Record<
    keyof ReviewedThesisContentHashDependencyCollections,
    number
  >;
  dependencyIds: Record<
    keyof ReviewedThesisContentHashDependencyCollections,
    string[]
  >;
  conflicts: readonly ReviewedThesisContentHashConflict[];
  summary: Readonly<{
    repositoryFiles: 3;
    protectedMissingPdfs: 5;
    documents: 5;
    libraryAnalysisRecords: 5;
    pendingDatabaseRows: number;
    appliedDatabaseRows: number;
    conflicts: number;
  }>;
  boundary: Readonly<{
    writesFiles: false;
    mutatesTheses: false;
    mutatesCitations: false;
    mutatesDocumentsOnlyContentAndWordCount: true;
    mutatesLibraryAnalysisOnlyContentHashAndWordCount: true;
    mutatesSemanticFindings: false;
    createsOrClaimsPdfCoverage: false;
  }>;
}>;

export type ReviewedThesisContentHashInspection = Readonly<{
  plan: ReviewedThesisContentHashPlan;
  collections: ReviewedThesisContentHashDependencyCollections;
}>;

export type ReviewedThesisContentHashArgs = Readonly<{
  apply: boolean;
  ack: string | undefined;
  expectedPlanSha256: string | undefined;
}>;

type ReviewedThesisContentHashClient = Pick<
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

function normalizedValue(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.map(normalizedValue);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        normalizedValue(entry),
      ]),
    );
  }
  return value;
}

function canonicalHash(value: unknown) {
  return createHash("sha256")
    .update(
      JSON.stringify(
        canonicalizeReviewedThesisBibliographicJson(normalizedValue(value)),
      ),
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
  collections: ReviewedThesisContentHashDependencyCollections,
): ReviewedThesisContentHashDependencyCollections {
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
  ) as ReviewedThesisContentHashDependencyCollections;
}

export function classifyReviewedThesisContentHashFile(
  entry: ReviewedThesisContentFileEntry,
  bytes: Buffer | null,
): ReviewedThesisContentHashFileState {
  if (bytes === null) {
    return {
      artifactId: entry.artifactId,
      thesisId: entry.thesisId,
      repositoryPath: entry.repositoryPath,
      state: "conflict",
      byteLength: null,
      sha256: null,
    };
  }
  const before = Buffer.from(entry.beforeBytes, "utf8");
  const after = Buffer.from(entry.afterBytes, "utf8");
  return {
    artifactId: entry.artifactId,
    thesisId: entry.thesisId,
    repositoryPath: entry.repositoryPath,
    state: bytes.equals(before)
      ? "before"
      : bytes.equals(after)
        ? "after"
        : "conflict",
    byteLength: bytes.byteLength,
    sha256: byteHash(bytes),
  };
}

export function inspectReviewedThesisContentHashFiles(root = process.cwd()) {
  const files = REVIEWED_THESIS_CONTENT_HASH_FILES.map((entry) => {
    try {
      return classifyReviewedThesisContentHashFile(
        entry,
        readFileSync(`${root}/${entry.repositoryPath}`),
      );
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
      return classifyReviewedThesisContentHashFile(entry, null);
    }
  });
  const missingPdfs = REVIEWED_THESIS_CONTENT_HASH_MISSING_PDF_PATHS.map(
    (repositoryPath) => ({
      repositoryPath,
      state: existsSync(`${root}/${repositoryPath}`)
        ? ("present" as const)
        : ("missing" as const),
    }),
  );
  return { files, missingPdfs };
}

function protectedCollections(
  collections: ReviewedThesisContentHashDependencyCollections,
) {
  const documentIds = new Set(
    REVIEWED_THESIS_CONTENT_HASH_MANIFEST.map((entry) => entry.documentId),
  );
  const libraryIds = new Set(
    REVIEWED_THESIS_CONTENT_HASH_MANIFEST.map(
      (entry) => entry.libraryAnalysisRecordId,
    ),
  );
  return {
    ...collections,
    documents: collections.documents.map((row) => {
      if (!documentIds.has(row.id)) return row;
      const copy = { ...row } as Record<string, unknown>;
      delete copy.content;
      delete copy.wordCount;
      delete copy.updatedAt;
      return copy;
    }),
    libraryAnalysisRecords: collections.libraryAnalysisRecords.map((row) => {
      if (!libraryIds.has(row.id)) return row;
      const copy = { ...row } as Record<string, unknown>;
      delete copy.contentHash;
      delete copy.wordCount;
      delete copy.updatedAt;
      return copy;
    }),
  };
}

function conflict(
  conflicts: ReviewedThesisContentHashConflict[],
  code: string,
  subject: string,
  detail: string,
) {
  conflicts.push({ code, subject, detail });
}

function exactReviewedThesisAfter(
  row: ReviewedThesisBibliographicDatabaseRow,
  entry: ReviewedThesisContentHashEntry,
) {
  const reviewed = REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS.find(
    (candidate) => candidate.id === entry.thesisId,
  );
  if (!reviewed || row.documentId !== entry.documentId) return false;
  return (
    sha256ReviewedThesisBibliographicJson(
      databaseRowToPortableThesisBibliography(
        normalizeReviewedThesisBibliographicDatabaseRow(row),
      ),
    ) === sha256ReviewedThesisBibliographicJson(reviewed.after)
  );
}

function documentStableIdentity(row: ReviewedThesisContentHashDocumentRow) {
  return {
    slug: row.slug,
    filePath: row.filePath,
    title: row.title,
    author: row.author,
    year: row.year,
    documentType: row.documentType,
    category: row.category,
    subcategory: row.subcategory,
    country: row.country,
    summary: row.summary,
    url: row.url,
    accessedAt: row.accessedAt?.toISOString() ?? null,
    archivedUrl: row.archivedUrl,
    tags: row.tags,
    metadata: row.metadata,
  };
}

function expectedLibraryStableIdentity(entry: ReviewedThesisContentHashEntry) {
  return {
    sourceKind: "document",
    sourceKey: `document:${entry.documentId}`,
    documentId: entry.documentId,
    sourceDocId: null,
    canonicalPath: entry.documentIdentity.filePath,
    title: entry.documentIdentity.title,
    status: "ai_draft",
    usageRule: "internal_background",
    reviewStatus: "not_required",
    citationReadiness: null,
    analysisTier: "triage_card",
  };
}

function libraryStableIdentity(row: ReviewedThesisContentHashLibraryRow) {
  return {
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
  };
}

export function reviewedThesisContentHashContract() {
  return {
    version: REVIEWED_THESIS_CONTENT_HASH_VERSION,
    manifestSha256: REVIEWED_THESIS_CONTENT_HASH_MANIFEST_SHA256,
    targetIds: REVIEWED_THESIS_CONTENT_HASH_IDS,
    documentIds: REVIEWED_THESIS_CONTENT_HASH_MANIFEST.map(
      (entry) => entry.documentId,
    ),
    libraryAnalysisRecordIds: REVIEWED_THESIS_CONTENT_HASH_MANIFEST.map(
      (entry) => entry.libraryAnalysisRecordId,
    ),
    repositoryFilePaths: REVIEWED_THESIS_CONTENT_HASH_FILES.map(
      (entry) => entry.repositoryPath,
    ),
    protectedMissingPdfPaths: REVIEWED_THESIS_CONTENT_HASH_MISSING_PDF_PATHS,
    applyTransition: "files_after_db_before",
    proofBoundary: REVIEWED_THESIS_CONTENT_HASH_PROOF_BOUNDARY,
    boundary: {
      writesFiles: false,
      mutatesTheses: false,
      mutatesCitations: false,
      mutatesDocumentsOnlyContentAndWordCount: true,
      mutatesLibraryAnalysisOnlyContentHashAndWordCount: true,
      mutatesSemanticFindings: false,
      createsOrClaimsPdfCoverage: false,
    },
  };
}

export const REVIEWED_THESIS_CONTENT_HASH_CONTRACT_SHA256 = canonicalHash(
  reviewedThesisContentHashContract(),
);

export function buildReviewedThesisContentHashPlan(input: {
  databaseIdentity: ReviewedThesisContentHashDatabaseIdentity;
  files: readonly ReviewedThesisContentHashFileState[];
  missingPdfs: readonly ReviewedThesisContentHashMissingPdfState[];
  collections: ReviewedThesisContentHashDependencyCollections;
}): ReviewedThesisContentHashInspection {
  assertReviewedThesisContentHashManifestPinned();
  const collections = normalizeCollections(input.collections);
  const conflicts: ReviewedThesisContentHashConflict[] = [];
  const filesById = new Map(input.files.map((row) => [row.artifactId, row]));
  const files = REVIEWED_THESIS_CONTENT_HASH_FILES.map((entry) => {
    const row = filesById.get(entry.artifactId);
    if (!row || row.repositoryPath !== entry.repositoryPath) {
      conflict(
        conflicts,
        "file_inventory_drift",
        entry.artifactId,
        "Expected one exact managed repository file inspection",
      );
      return {
        artifactId: entry.artifactId,
        thesisId: entry.thesisId,
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
        entry.artifactId,
        "Repository bytes match neither exact before nor exact after",
      );
    }
    return row;
  });
  if (input.files.length !== REVIEWED_THESIS_CONTENT_HASH_FILES.length) {
    conflict(
      conflicts,
      "file_inventory_drift",
      "batch",
      `Expected 3 managed repository files; found ${input.files.length}`,
    );
  }

  const missingByPath = new Map(
    input.missingPdfs.map((row) => [row.repositoryPath, row]),
  );
  const missingPdfs = REVIEWED_THESIS_CONTENT_HASH_MISSING_PDF_PATHS.map(
    (repositoryPath) => {
      const row = missingByPath.get(repositoryPath);
      if (!row) {
        conflict(
          conflicts,
          "missing_pdf_inventory_drift",
          repositoryPath,
          "Expected one exact missing-PDF guard",
        );
        return { repositoryPath, state: "present" as const };
      }
      if (row.state !== "missing") {
        conflict(
          conflicts,
          "unexpected_pdf_bytes",
          repositoryPath,
          "PDF appeared after review; inspect and re-plan instead of claiming coverage",
        );
      }
      return row;
    },
  );
  if (input.missingPdfs.length !== 5) {
    conflict(
      conflicts,
      "missing_pdf_inventory_drift",
      "batch",
      `Expected 5 missing-PDF guards; found ${input.missingPdfs.length}`,
    );
  }

  const thesisById = new Map(collections.theses.map((row) => [row.id, row]));
  const documentById = new Map(
    collections.documents.map((row) => [row.id, row]),
  );
  const libraryById = new Map(
    collections.libraryAnalysisRecords.map((row) => [row.id, row]),
  );
  const targets = REVIEWED_THESIS_CONTENT_HASH_MANIFEST.map((entry) => {
    const thesis = thesisById.get(entry.thesisId);
    if (!thesis || !exactReviewedThesisAfter(thesis, entry)) {
      conflict(
        conflicts,
        "thesis_identity_drift",
        entry.thesisId,
        "Thesis must match the exact reviewed after identity and Document binding",
      );
    }
    const document = documentById.get(entry.documentId);
    let documentState: "before" | "after" | "conflict" = "conflict";
    if (
      document &&
      canonicalHash(documentStableIdentity(document)) ===
        canonicalHash(entry.documentIdentity)
    ) {
      const before =
        document.content === entry.beforeDocumentContent &&
        document.wordCount === entry.beforeDocumentWordCount;
      const after =
        document.content === entry.afterDocumentContent &&
        document.wordCount === entry.afterDocumentWordCount;
      documentState = before ? "before" : after ? "after" : "conflict";
    }
    if (documentState === "conflict") {
      conflict(
        conflicts,
        "document_snapshot_drift",
        entry.documentId,
        "Document stable identity, exact content bytes, or wordCount drifted",
      );
    }
    const library = libraryById.get(entry.libraryAnalysisRecordId);
    let libraryState: "before" | "after" | "conflict" = "conflict";
    if (
      library &&
      canonicalHash(libraryStableIdentity(library)) ===
        canonicalHash(expectedLibraryStableIdentity(entry))
    ) {
      const before =
        library.contentHash === entry.beforeLibraryContentHash &&
        library.wordCount === entry.beforeDocumentWordCount;
      const after =
        library.contentHash === entry.afterLibraryContentHash &&
        library.wordCount === entry.afterDocumentWordCount;
      libraryState = before ? "before" : after ? "after" : "conflict";
    }
    if (libraryState === "conflict") {
      conflict(
        conflicts,
        "library_analysis_snapshot_drift",
        entry.libraryAnalysisRecordId,
        "LAR binding, exact summary+content hash, or wordCount drifted",
      );
    }
    return {
      thesisId: entry.thesisId,
      documentId: entry.documentId,
      libraryAnalysisRecordId: entry.libraryAnalysisRecordId,
      documentState,
      libraryState,
      documentFullRowSha256: document ? canonicalHash(document) : null,
      libraryFullRowSha256: library ? canonicalHash(library) : null,
    };
  });

  const exactTargetLibraryIds = new Set(
    REVIEWED_THESIS_CONTENT_HASH_MANIFEST.map(
      (entry) => entry.libraryAnalysisRecordId,
    ),
  );
  if (
    collections.theses.length !== 5 ||
    collections.documents.length !== 5 ||
    collections.libraryAnalysisRecords.filter((row) =>
      exactTargetLibraryIds.has(row.id),
    ).length !== 5
  ) {
    conflict(
      conflicts,
      "target_inventory_drift",
      "batch",
      "Expected exactly five Thesis and Document targets and all five direct LAR targets",
    );
  }

  const managedFilesState = files.every((row) => row.state === "before")
    ? "all_before"
    : files.every((row) => row.state === "after")
      ? "all_after"
      : "conflict";
  const missingPdfState = missingPdfs.every((row) => row.state === "missing");
  const fileAtomicState = missingPdfState ? managedFilesState : "conflict";
  if (
    fileAtomicState === "conflict" &&
    !conflicts.some(
      (item) =>
        item.code.startsWith("file_") ||
        item.code.includes("pdf") ||
        item.code === "unexpected_pdf_bytes",
    )
  ) {
    conflict(
      conflicts,
      "file_atomic_hybrid",
      "batch",
      "Managed files are a partial before/after mixture",
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
  let transition: ReviewedThesisContentHashPlan["transition"] =
    fileAtomicState === "all_before" && databaseAtomicState === "all_before"
      ? "all_before"
      : fileAtomicState === "all_after" &&
          databaseAtomicState === "all_before"
        ? "files_after_db_before"
        : fileAtomicState === "all_after" && databaseAtomicState === "all_after"
          ? "all_after"
          : "conflict";
  if (transition === "conflict" && conflicts.length === 0) {
    conflict(
      conflicts,
      "cross_boundary_hybrid",
      "batch",
      "Filesystem/DB state is not an allowed recoverable transition",
    );
  }
  if (conflicts.length > 0) transition = "conflict";

  const dependencyCounts = Object.fromEntries(
    collectionNames.map((name) => [name, collections[name].length]),
  ) as Record<keyof ReviewedThesisContentHashDependencyCollections, number>;
  const dependencyIds = Object.fromEntries(
    collectionNames.map((name) => [
      name,
      collections[name].map((row) => rowId(row, name)),
    ]),
  ) as Record<keyof ReviewedThesisContentHashDependencyCollections, string[]>;
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
  const plan: ReviewedThesisContentHashPlan = {
    version: REVIEWED_THESIS_CONTENT_HASH_VERSION,
    manifestSha256: REVIEWED_THESIS_CONTENT_HASH_MANIFEST_SHA256,
    pinnedManifestSha256:
      PINNED_REVIEWED_THESIS_CONTENT_HASH_MANIFEST_SHA256,
    contractSha256: REVIEWED_THESIS_CONTENT_HASH_CONTRACT_SHA256,
    databaseIdentity: input.databaseIdentity,
    fileAtomicState,
    databaseAtomicState,
    transition,
    files,
    missingPdfs,
    targets,
    targetStateSha256: canonicalHash({ files, missingPdfs, targets }),
    dependencySha256: canonicalHash(collections),
    preservedDependencySha256: canonicalHash(protectedCollections(collections)),
    dependencyCounts,
    dependencyIds,
    conflicts,
    summary: {
      repositoryFiles: 3,
      protectedMissingPdfs: 5,
      documents: 5,
      libraryAnalysisRecords: 5,
      pendingDatabaseRows,
      appliedDatabaseRows,
      conflicts: conflicts.length,
    },
    boundary: {
      writesFiles: false,
      mutatesTheses: false,
      mutatesCitations: false,
      mutatesDocumentsOnlyContentAndWordCount: true,
      mutatesLibraryAnalysisOnlyContentHashAndWordCount: true,
      mutatesSemanticFindings: false,
      createsOrClaimsPdfCoverage: false,
    },
  };
  return { plan, collections };
}

export function reviewedThesisContentHashPlanSha256(
  inspection: ReviewedThesisContentHashInspection,
) {
  return canonicalHash(inspection.plan);
}

export function parseReviewedThesisContentHashArgs(
  argv: readonly string[],
): ReviewedThesisContentHashArgs {
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
        `Unknown reviewed Thesis content/hash argument: ${argument}`,
      );
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

export function assertReviewedThesisContentHashApplyable(
  inspection: ReviewedThesisContentHashInspection,
) {
  if (
    inspection.plan.transition !== "files_after_db_before" ||
    inspection.plan.fileAtomicState !== "all_after" ||
    inspection.plan.databaseAtomicState !== "all_before" ||
    inspection.plan.conflicts.length !== 0 ||
    inspection.plan.summary.pendingDatabaseRows !== 10 ||
    !inspection.plan.missingPdfs.every((row) => row.state === "missing")
  ) {
    throw new Error(
      "DB apply requires exact recoverable files_after_db_before state with all five PDF paths still missing",
    );
  }
}

async function inspectDatabaseIdentity(
  client: Pick<Prisma.TransactionClient, "$queryRaw">,
): Promise<ReviewedThesisContentHashDatabaseIdentity> {
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
    throw new Error(
      "Reviewed Thesis content/hash requires one valid DatabaseIdentity",
    );
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

export async function inspectReviewedThesisContentHashDatabaseState(
  client: ReviewedThesisContentHashClient,
  root = process.cwd(),
): Promise<ReviewedThesisContentHashInspection> {
  const thesisIds = [...REVIEWED_THESIS_CONTENT_HASH_IDS];
  const documentIds = REVIEWED_THESIS_CONTENT_HASH_MANIFEST.map(
    (entry) => entry.documentId,
  );
  const libraryIds = REVIEWED_THESIS_CONTENT_HASH_MANIFEST.map(
    (entry) => entry.libraryAnalysisRecordId,
  );
  const fileInspection = inspectReviewedThesisContentHashFiles(root);
  const [databaseIdentity, theses, documents, directLibrary] =
    await Promise.all([
      inspectDatabaseIdentity(client),
      client.thesis.findMany({
        where: { id: { in: thesisIds } },
        select: thesisSelect,
        orderBy: { id: "asc" },
      }),
      client.document.findMany({
        where: { id: { in: documentIds } },
        select: documentSelect,
        orderBy: { id: "asc" },
      }),
      client.libraryAnalysisRecord.findMany({
        where: {
          OR: [{ id: { in: libraryIds } }, { documentId: { in: documentIds } }],
        },
        select: libraryAnalysisRecordSelect,
        orderBy: { id: "asc" },
      }),
    ]);

  const directSourceCitations = await client.sourceCitation.findMany({
    where: {
      OR: [
        { documentId: { in: documentIds } },
        {
          fieldCitations: {
            some: {
              OR: [
                { entityType: "Thesis", entityId: { in: thesisIds } },
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
          { entityType: "Thesis", entityId: { in: thesisIds } },
          { entityType: "Document", entityId: { in: documentIds } },
        ],
      },
      orderBy: { id: "asc" },
    }),
    client.evidenceAppraisal.findMany({
      where: {
        OR: [
          { thesisId: { in: thesisIds } },
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
    client.sourceDoc.findMany({
      where: { documentId: { in: documentIds } },
      orderBy: { id: "asc" },
    }),
    client.report.findMany({
      where: { documentId: { in: documentIds } },
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
  return buildReviewedThesisContentHashPlan({
    databaseIdentity,
    files: fileInspection.files,
    missingPdfs: fileInspection.missingPdfs,
    collections: {
      theses: theses.map(normalizeReviewedThesisBibliographicDatabaseRow),
      documents,
      libraryAnalysisRecords: mergeRowsById(directLibrary),
      sourceCitations: asRows(directSourceCitations),
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

export function fullReviewedThesisContentHashDocumentWhere(
  row: ReviewedThesisContentHashDocumentRow,
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

export function fullReviewedThesisContentHashLibraryWhere(
  row: ReviewedThesisContentHashLibraryRow,
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

export function reviewedThesisContentHashDocumentUpdateData(
  entry: ReviewedThesisContentHashEntry,
) {
  return {
    content: entry.afterDocumentContent,
    wordCount: entry.afterDocumentWordCount,
  } satisfies Prisma.DocumentUpdateManyMutationInput;
}

export function reviewedThesisContentHashLibraryUpdateData(
  entry: ReviewedThesisContentHashEntry,
) {
  return {
    contentHash: entry.afterLibraryContentHash,
    wordCount: entry.afterDocumentWordCount,
  } satisfies Prisma.LibraryAnalysisRecordUpdateManyMutationInput;
}

function exactInventory(
  before: ReviewedThesisContentHashPlan,
  after: ReviewedThesisContentHashPlan,
) {
  return collectionNames.every(
    (name) =>
      before.dependencyCounts[name] === after.dependencyCounts[name] &&
      canonicalHash(before.dependencyIds[name]) ===
        canonicalHash(after.dependencyIds[name]),
  );
}

export function assertReviewedThesisContentHashPostApply(
  before: ReviewedThesisContentHashInspection,
  after: ReviewedThesisContentHashInspection,
) {
  if (
    after.plan.transition !== "all_after" ||
    after.plan.fileAtomicState !== "all_after" ||
    after.plan.databaseAtomicState !== "all_after" ||
    after.plan.summary.appliedDatabaseRows !== 10 ||
    after.plan.conflicts.length !== 0 ||
    canonicalHash(after.plan.databaseIdentity) !==
      canonicalHash(before.plan.databaseIdentity) ||
    after.plan.preservedDependencySha256 !==
      before.plan.preservedDependencySha256 ||
    !exactInventory(before.plan, after.plan) ||
    !after.plan.missingPdfs.every((row) => row.state === "missing")
  ) {
    throw new Error(
      "Post-apply all-after, missing-PDF boundary, DatabaseIdentity, protected semantic dependency, or inventory proof failed; transaction must roll back",
    );
  }
}

async function lockReviewedThesisContentHashTables(
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
  expected: ReviewedThesisContentHashDatabaseIdentity,
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
    throw new Error(
      "DatabaseIdentity changed after planning; transaction must roll back",
    );
  }
}

async function applyReviewedThesisContentHashUpdates(
  transaction: Prisma.TransactionClient,
  inspection: ReviewedThesisContentHashInspection,
) {
  assertReviewedThesisContentHashApplyable(inspection);
  const documentById = new Map(
    inspection.collections.documents.map((row) => [row.id, row]),
  );
  const libraryById = new Map(
    inspection.collections.libraryAnalysisRecords.map((row) => [row.id, row]),
  );
  let documents = 0;
  let libraryAnalysisRecords = 0;
  for (const entry of REVIEWED_THESIS_CONTENT_HASH_MANIFEST) {
    const document = documentById.get(entry.documentId);
    const library = libraryById.get(entry.libraryAnalysisRecordId);
    if (!document || !library) {
      throw new Error(`Missing locked Thesis content target: ${entry.thesisId}`);
    }
    const documentResult = await transaction.document.updateMany({
      where: fullReviewedThesisContentHashDocumentWhere(document),
      data: reviewedThesisContentHashDocumentUpdateData(entry),
    });
    if (documentResult.count !== 1) {
      throw new Error(
        `Concurrent full-row Document CAS conflict: ${entry.documentId}; transaction must roll back`,
      );
    }
    documents += 1;
    const libraryResult = await transaction.libraryAnalysisRecord.updateMany({
      where: fullReviewedThesisContentHashLibraryWhere(library),
      data: reviewedThesisContentHashLibraryUpdateData(entry),
    });
    if (libraryResult.count !== 1) {
      throw new Error(
        `Concurrent full-row LAR CAS conflict: ${entry.libraryAnalysisRecordId}; transaction must roll back`,
      );
    }
    libraryAnalysisRecords += 1;
  }
  if (documents !== 5 || libraryAnalysisRecords !== 5) {
    throw new Error(
      "Unexpected Thesis content/hash mutation counts; transaction must roll back",
    );
  }
  return { documents, libraryAnalysisRecords };
}

function printPlan(
  inspection: ReviewedThesisContentHashInspection,
  digest: string,
) {
  const plan = inspection.plan;
  console.log("Reviewed Thesis canonical content/hash reconciliation");
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
    `Proof boundary: ${REVIEWED_THESIS_CONTENT_HASH_PROOF_BOUNDARY.join("; ")}`,
  );
  for (const file of plan.files) {
    console.log(
      `${file.state} file ${file.repositoryPath}; bytes=${file.byteLength ?? "missing"}; sha256=${file.sha256 ?? "missing"}`,
    );
  }
  for (const pdf of plan.missingPdfs) {
    console.log(`${pdf.state} protected PDF ${pdf.repositoryPath}`);
  }
  for (const target of plan.targets) {
    console.log(
      `${target.thesisId}: Document=${target.documentState}; LAR=${target.libraryState}`,
    );
  }
  for (const item of plan.conflicts) {
    console.log(`Conflict ${item.code} ${item.subject}: ${item.detail}`);
  }
}

async function main() {
  const args = parseReviewedThesisContentHashArgs(process.argv.slice(2));
  if (args.apply && args.ack !== REVIEWED_THESIS_CONTENT_HASH_APPLY_ACK) {
    throw new Error(
      `--apply requires --ack=${REVIEWED_THESIS_CONTENT_HASH_APPLY_ACK}`,
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
    const inspection =
      await inspectReviewedThesisContentHashDatabaseState(prisma);
    const digest = reviewedThesisContentHashPlanSha256(inspection);
    printPlan(inspection, digest);
    if (inspection.plan.transition === "conflict") {
      throw new Error(
        `Reviewed Thesis content/hash conflicts: ${inspection.plan.conflicts
          .map((item) => `${item.subject}:${item.code}`)
          .join(", ")}`,
      );
    }
    if (!args.apply) {
      console.log(
        `Dry run only. DB apply is permitted only for files_after_db_before with --apply --ack=${REVIEWED_THESIS_CONTENT_HASH_APPLY_ACK} --plan-sha256=${digest}`,
      );
      return;
    }
    assertReviewedThesisContentHashApplyable(inspection);
    if (digest !== args.expectedPlanSha256) {
      throw new Error(
        "Current Thesis content/hash plan differs from --plan-sha256; rerun dry-run",
      );
    }
    const result = await prisma.$transaction(
      async (transaction) => {
        await lockReviewedThesisContentHashTables(transaction);
        await transaction.$executeRaw`
          SELECT pg_advisory_xact_lock(hashtext(${REVIEWED_THESIS_CONTENT_HASH_ADVISORY_LOCK_KEY}))
        `;
        await lockDatabaseIdentity(transaction, inspection.plan.databaseIdentity);
        const locked =
          await inspectReviewedThesisContentHashDatabaseState(transaction);
        assertReviewedThesisContentHashApplyable(locked);
        if (
          reviewedThesisContentHashPlanSha256(locked) !==
          args.expectedPlanSha256
        ) {
          throw new Error(
            "Locked Thesis content/hash plan changed; transaction must roll back",
          );
        }
        const counts = await applyReviewedThesisContentHashUpdates(
          transaction,
          locked,
        );
        const after =
          await inspectReviewedThesisContentHashDatabaseState(transaction);
        assertReviewedThesisContentHashPostApply(locked, after);
        return counts;
      },
      { isolationLevel: "Serializable" },
    );
    console.log(`Applied Thesis content/hash DB mirrors: ${JSON.stringify(result)}`);
  } catch (error) {
    if (args.apply) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(
        "Thesis content/hash reconciliation failed; the Serializable transaction rolled back and zero DB rows were committed. Repository files are outside the DB transaction. " +
          `Cause: ${detail}`,
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
        : "Thesis content/hash reconciliation failed",
    );
    process.exitCode = 1;
  });
}
