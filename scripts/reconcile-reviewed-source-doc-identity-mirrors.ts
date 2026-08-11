import "dotenv/config";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
import { Prisma, PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_MANIFEST_SHA256,
  REVIEWED_SOURCE_DOC_IDENTITY_REPAIRS,
  canonicalizeReviewedSourceDocIdentityJson,
} from "../src/lib/citations/reviewed-source-doc-identity-repair";
import {
  normalizeReviewedSourceDocIdentityDatabaseRow,
  portableSourceDocIdentityToDatabaseRow,
  type ReviewedSourceDocIdentityDatabaseRow,
} from "./apply-reviewed-source-doc-identity-repair";

export const REVIEWED_SOURCE_DOC_MIRROR_VERSION = "2026-07-20-v1" as const;
export const REVIEWED_SOURCE_DOC_MIRROR_APPLY_ACK =
  "APPLY_REVIEWED_SOURCE_DOC_IDENTITY_MIRRORS_7";
export const REVIEWED_SOURCE_DOC_MIRROR_ADVISORY_LOCK_KEY =
  "foodsystems:reviewed-source-doc-identity-mirrors:2026-07-20:v1";
export const REVIEWED_SOURCE_DOC_MIRROR_ACCESSED_AT_ISO =
  "2026-07-20T00:00:00.000Z";

const OLD_SRC_143_TITLE =
  "Elintarvikemarkkinavaltuutettu toimintakertomus 2024";
const NEW_SRC_143_TITLE =
  "Elintarvikemarkkinavaltuutetun toimintakertomus 2024";
const LIVE_SRC_143_LAR_ID = "cmrs79oee007eqkvmi00wjttn";
const STALE_RETAINED_SRC_143_LAR_ID = "cmqjoex2v00wvzpvmi24d0g5n";
const SRC_24_SOURCE_REF_ID = "cmp8xyewq000avqvmwez3gwtc";
const LINKED_DOCUMENT_IDS: Readonly<Record<string, string>> = {
  "src-16": "cmp8xymgm00ezvvvmzkdpagn3",
  "src-24": "cmp8xymbg00eivvvmgqp70y4r",
};

export const REVIEWED_SOURCE_DOC_URL_CITATION_MUTABLE_FIELDS = [
  "citationText",
  "title",
  "author",
  "year",
  "publisher",
  "url",
  "accessedAt",
  "archivedUrl",
  "verificationStatus",
  "verifiedAt",
  "verifiedBy",
  "citationReadiness",
] as const;

export const REVIEWED_SOURCE_DOC_LINKED_CITATION_MUTABLE_FIELDS = [
  "citationText",
  "title",
  "author",
  "year",
  "publisher",
] as const;

export const REVIEWED_SOURCE_DOC_LAR_MUTABLE_PATHS = [
  "title",
  "aiSummary",
  "aiCard.shortSummary",
] as const;

export const REVIEWED_SOURCE_DOC_SOURCE_REF_MUTABLE_FIELDS = [
  "label",
  "url",
] as const;

export type ReviewedSourceDocMirrorBinding = Readonly<{
  sourceDocId: "src-16" | "src-24" | "src-143";
  fieldPath: "url" | "documentId";
  kind: "url" | "linked_document";
  fieldCitationId: string;
  sourceCitationId: string;
}>;

export type ReviewedSourceDocCitationMirrorSnapshot = Readonly<{
  citationText: string;
  title: string;
  author: string | null;
  year: number | null;
  publisher: string | null;
  url?: string | null;
  accessedAt?: string | null;
  archivedUrl?: string | null;
  verificationStatus?: "failed" | "needs_review";
  verifiedAt?: string | null;
  verifiedBy?: string | null;
  citationReadiness?: "blocked_unsourced";
}>;

export const REVIEWED_SOURCE_DOC_MIRROR_BINDINGS = Object.freeze([
  {
    sourceDocId: "src-16",
    fieldPath: "url",
    kind: "url",
    fieldCitationId: "cmpdafmb303a8sxvm65jwuzqg",
    sourceCitationId: "cmpdafm1f01azsxvmbqqjt0c9",
  },
  {
    sourceDocId: "src-16",
    fieldPath: "documentId",
    kind: "linked_document",
    fieldCitationId: "cmpdafmb303a9sxvm4bqtr6ry",
    sourceCitationId: "cmpdafm1f01b0sxvmg8p9r21p",
  },
  {
    sourceDocId: "src-24",
    fieldPath: "url",
    kind: "url",
    fieldCitationId: "cmpdafmb3038hsxvmfr14rmyr",
    sourceCitationId: "cmpdafm0r0198sxvmx8iqz2lj",
  },
  {
    sourceDocId: "src-24",
    fieldPath: "documentId",
    kind: "linked_document",
    fieldCitationId: "cmpdafmb3038isxvmflrxx4od",
    sourceCitationId: "cmpdafm0r0199sxvmr4zgesuf",
  },
  {
    sourceDocId: "src-143",
    fieldPath: "url",
    kind: "url",
    fieldCitationId: "cmpdafmb303dqsxvm1tt62pmu",
    sourceCitationId: "cmpdafm2l01ehsxvm6y85tbr1",
  },
] as const satisfies readonly ReviewedSourceDocMirrorBinding[]);

type UrlBeforePolicy = Readonly<{
  verificationStatus: "failed" | "needs_review";
  verifiedAt: string | null;
  archivedUrl: string | null;
}>;

const URL_BEFORE_POLICY: Readonly<Record<string, UrlBeforePolicy>> = {
  "src-16": {
    verificationStatus: "failed",
    verifiedAt: "2026-05-26T06:35:54.980Z",
    archivedUrl: null,
  },
  "src-24": {
    verificationStatus: "needs_review",
    verifiedAt: null,
    archivedUrl:
      "https://web.archive.org/web/20260513103214/https://www.kkv.fi/en/",
  },
  "src-143": {
    verificationStatus: "failed",
    verifiedAt: "2026-05-26T06:36:24.631Z",
    archivedUrl: null,
  },
};

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

const sourceCitationSelect = {
  id: true,
  sourceClass: true,
  citationReadiness: true,
  verificationStatus: true,
  citationText: true,
  title: true,
  publisher: true,
  author: true,
  year: true,
  url: true,
  archivedUrl: true,
  localPath: true,
  fileHash: true,
  contentHash: true,
  hashAlgorithm: true,
  pageRef: true,
  quote: true,
  accessedAt: true,
  captureMethod: true,
  verifiedAt: true,
  verifiedBy: true,
  confidence: true,
  notes: true,
  documentId: true,
  sourceDocId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.SourceCitationSelect;

const fieldCitationSelect = {
  id: true,
  citationId: true,
  entityType: true,
  entityId: true,
  fieldPath: true,
  claimText: true,
  confidence: true,
  createdAt: true,
} satisfies Prisma.FieldCitationSelect;

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

const sourceRefSelect = {
  id: true,
  sourceDocId: true,
  label: true,
  url: true,
  note: true,
  insightId: true,
  meetingId: true,
} satisfies Prisma.SourceRefSelect;

const evidenceAppraisalSelect = {
  id: true,
  reportId: true,
  thesisId: true,
  sourceDocId: true,
  status: true,
  basis: true,
  studyDesign: true,
  studyDesignDetails: true,
  methodologySummary: true,
  sampleOrCoverage: true,
  applicability: true,
  applicabilityContext: true,
  applicabilityNotes: true,
  limitationsStatus: true,
  limitations: true,
  limitationsNotes: true,
  riskOfBias: true,
  riskOfBiasNotes: true,
  framework: true,
  frameworkVersion: true,
  reviewMethod: true,
  reviewBasisCitationId: true,
  reviewedSourceHash: true,
  hashAlgorithm: true,
  reviewedBy: true,
  reviewedAt: true,
  notApplicableReason: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.EvidenceAppraisalSelect;

const insightCitationSelect = {
  id: true,
  primaryCitationId: true,
} satisfies Prisma.InsightSelect;

const producerCitationSelect = {
  id: true,
  primaryCitationId: true,
} satisfies Prisma.ProducerSelect;

export type ReviewedSourceDocMirrorSourceCitationRow =
  Prisma.SourceCitationGetPayload<{ select: typeof sourceCitationSelect }>;
export type ReviewedSourceDocMirrorFieldCitationRow =
  Prisma.FieldCitationGetPayload<{ select: typeof fieldCitationSelect }>;
export type ReviewedSourceDocMirrorLibraryAnalysisRow =
  Prisma.LibraryAnalysisRecordGetPayload<{
    select: typeof libraryAnalysisRecordSelect;
  }>;
export type ReviewedSourceDocMirrorSourceRefRow = Prisma.SourceRefGetPayload<{
  select: typeof sourceRefSelect;
}>;
type EvidenceAppraisalRow = Prisma.EvidenceAppraisalGetPayload<{
  select: typeof evidenceAppraisalSelect;
}>;
type InsightCitationRow = Prisma.InsightGetPayload<{
  select: typeof insightCitationSelect;
}>;
type ProducerCitationRow = Prisma.ProducerGetPayload<{
  select: typeof producerCitationSelect;
}>;

export type ReviewedSourceDocMirrorDatabaseIdentity = Readonly<{
  currentDatabase: string;
  key: "primary";
  identityUuid: string;
  createdAt: string;
}>;

export type ReviewedSourceDocMirrorCollections = {
  sourceDocs: ReviewedSourceDocIdentityDatabaseRow[];
  sourceCitations: ReviewedSourceDocMirrorSourceCitationRow[];
  fieldCitations: ReviewedSourceDocMirrorFieldCitationRow[];
  libraryAnalysisRecords: ReviewedSourceDocMirrorLibraryAnalysisRow[];
  sourceRefs: ReviewedSourceDocMirrorSourceRefRow[];
  evidenceAppraisals: EvidenceAppraisalRow[];
  insightCitationConsumers: InsightCitationRow[];
  producerCitationConsumers: ProducerCitationRow[];
};

const collectionNames = [
  "sourceDocs",
  "sourceCitations",
  "fieldCitations",
  "libraryAnalysisRecords",
  "sourceRefs",
  "evidenceAppraisals",
  "insightCitationConsumers",
  "producerCitationConsumers",
] as const satisfies readonly (keyof ReviewedSourceDocMirrorCollections)[];

export type ReviewedSourceDocMirrorConflict = Readonly<{
  code: string;
  subject: string;
  detail: string;
}>;

export type ReviewedSourceDocMirrorRowState =
  | "before"
  | "after"
  | "conflict";

export type ReviewedSourceDocMirrorPlan = Readonly<{
  version: typeof REVIEWED_SOURCE_DOC_MIRROR_VERSION;
  contractSha256: string;
  sourceDocIdentityManifestSha256: string;
  databaseIdentity: ReviewedSourceDocMirrorDatabaseIdentity;
  atomicState: "all_before" | "all_after" | "conflict";
  targetStateSha256: string;
  dependencySha256: string;
  preservedDependencySha256: string;
  dependencyCounts: Record<keyof ReviewedSourceDocMirrorCollections, number>;
  dependencyIds: Record<keyof ReviewedSourceDocMirrorCollections, string[]>;
  citationTargets: ReadonlyArray<
    ReviewedSourceDocMirrorBinding & {
      state: ReviewedSourceDocMirrorRowState;
      fullRowSha256: string | null;
    }
  >;
  liveLibraryAnalysisTarget: Readonly<{
    id: typeof LIVE_SRC_143_LAR_ID;
    state: ReviewedSourceDocMirrorRowState;
    fullRowSha256: string | null;
  }>;
  staleRetainedLibraryAnalysis: Readonly<{
    id: typeof STALE_RETAINED_SRC_143_LAR_ID;
    protected: true;
    fullRowSha256: string | null;
  }>;
  sourceRefTarget: Readonly<{
    id: typeof SRC_24_SOURCE_REF_ID;
    state: ReviewedSourceDocMirrorRowState;
    fullRowSha256: string | null;
  }>;
  conflicts: readonly ReviewedSourceDocMirrorConflict[];
  summary: Readonly<{
    sourceDocs: 3;
    fieldCitations: 5;
    sourceCitations: 5;
    liveLibraryAnalysisRecords: 1;
    staleRetainedLibraryAnalysisRecords: 1;
    sourceRefs: 1;
    pendingRows: number;
    appliedRows: number;
    conflicts: number;
  }>;
  boundary: Readonly<{
    mutatesSourceDocs: false;
    mutatesFieldCitations: false;
    mutatesDocuments: false;
    mutatesReports: false;
    staleRetainedLarIsImmutable: true;
  }>;
}>;

export type ReviewedSourceDocMirrorInspection = Readonly<{
  plan: ReviewedSourceDocMirrorPlan;
  collections: ReviewedSourceDocMirrorCollections;
}>;

export type ReviewedSourceDocMirrorArgs = Readonly<{
  apply: boolean;
  ack: string | undefined;
  expectedPlanSha256: string | undefined;
}>;

type ReviewedSourceDocMirrorClient = Pick<
  Prisma.TransactionClient,
  | "$queryRaw"
  | "$executeRaw"
  | "sourceDoc"
  | "sourceCitation"
  | "fieldCitation"
  | "libraryAnalysisRecord"
  | "sourceRef"
  | "evidenceAppraisal"
  | "insight"
  | "producer"
>;

function compareIds(left: string, right: string) {
  return left.localeCompare(right, undefined, { numeric: true });
}

function canonicalHash(value: unknown) {
  return createHash("sha256")
    .update(JSON.stringify(canonicalizeReviewedSourceDocIdentityJson(value)))
    .digest("hex");
}

function rowId(row: unknown, collection: string) {
  const id = (row as { id?: unknown }).id;
  if (typeof id !== "string" || id.length === 0) {
    throw new Error(`${collection} dependency row has no stable id`);
  }
  return id;
}

function normalizeCollections(
  collections: ReviewedSourceDocMirrorCollections,
): ReviewedSourceDocMirrorCollections {
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
  ) as ReviewedSourceDocMirrorCollections;
}

function exactDate(value: string | null) {
  return value === null ? null : new Date(value);
}

function repairFor(sourceDocId: string) {
  const repair = REVIEWED_SOURCE_DOC_IDENTITY_REPAIRS.find(
    (candidate) => candidate.id === sourceDocId,
  );
  if (!repair) throw new Error(`Unknown reviewed SourceDoc id: ${sourceDocId}`);
  return repair;
}

function bibliographicProjection(
  binding: ReviewedSourceDocMirrorBinding,
  state: "before" | "after",
) {
  const snapshot = repairFor(binding.sourceDocId)[state];
  const prefix =
    binding.kind === "url" ? "SourceDoc:" : "SourceDoc linked document:";
  return {
    citationText: `${prefix} ${snapshot.title ?? snapshot.filename}`,
    title: snapshot.title ?? snapshot.filename,
    author: snapshot.author,
    year: snapshot.year === null ? null : Number(snapshot.year),
    publisher: snapshot.publisher,
  };
}

export function reviewedSourceDocCitationMirrorSnapshot(
  binding: ReviewedSourceDocMirrorBinding,
  state: "before" | "after",
): ReviewedSourceDocCitationMirrorSnapshot {
  const bibliography = bibliographicProjection(binding, state);
  if (binding.kind === "linked_document") return bibliography;
  if (state === "before") {
    const repair = repairFor(binding.sourceDocId);
    const policy = URL_BEFORE_POLICY[binding.sourceDocId]!;
    return {
      ...bibliography,
      url: repair.before.url,
      accessedAt: null,
      archivedUrl: policy.archivedUrl,
      verificationStatus: policy.verificationStatus,
      verifiedAt: policy.verifiedAt,
      verifiedBy: null,
      citationReadiness: "blocked_unsourced",
    };
  }
  return {
    ...bibliography,
    url: repairFor(binding.sourceDocId).after.url,
    accessedAt: REVIEWED_SOURCE_DOC_MIRROR_ACCESSED_AT_ISO,
    archivedUrl: null,
    verificationStatus: "needs_review",
    verifiedAt: null,
    verifiedBy: null,
    citationReadiness: "blocked_unsourced",
  };
}

function occurrenceCount(value: string, needle: string) {
  return value.split(needle).length - 1;
}

function normalizeLiveLarIdentityText(value: string) {
  if (
    occurrenceCount(value, OLD_SRC_143_TITLE) === 1 &&
    occurrenceCount(value, NEW_SRC_143_TITLE) === 0
  ) {
    return value.replace(OLD_SRC_143_TITLE, "<reviewed-src-143-title>");
  }
  if (
    occurrenceCount(value, OLD_SRC_143_TITLE) === 0 &&
    occurrenceCount(value, NEW_SRC_143_TITLE) === 1
  ) {
    return value.replace(NEW_SRC_143_TITLE, "<reviewed-src-143-title>");
  }
  return value;
}

function aiCardRecord(row: ReviewedSourceDocMirrorLibraryAnalysisRow) {
  if (
    row.aiCard === null ||
    Array.isArray(row.aiCard) ||
    typeof row.aiCard !== "object"
  ) {
    return null;
  }
  return row.aiCard as Record<string, Prisma.JsonValue>;
}

export function reviewedSourceDocLiveLarSnapshot(
  row: ReviewedSourceDocMirrorLibraryAnalysisRow,
  state: "before" | "after",
) {
  const card = aiCardRecord(row);
  const shortSummary = card?.shortSummary;
  const aiSummary = row.aiSummary;
  if (typeof shortSummary !== "string" || typeof aiSummary !== "string") {
    return null;
  }
  const from = state === "before" ? OLD_SRC_143_TITLE : NEW_SRC_143_TITLE;
  const other = state === "before" ? NEW_SRC_143_TITLE : OLD_SRC_143_TITLE;
  if (
    row.title !== from ||
    occurrenceCount(aiSummary, from) !== 1 ||
    occurrenceCount(shortSummary, from) !== 1 ||
    occurrenceCount(aiSummary, other) !== 0 ||
    occurrenceCount(shortSummary, other) !== 0
  ) {
    return null;
  }
  return { title: row.title, aiSummary, shortSummary };
}

export function reviewedSourceDocLiveLarUpdateData(
  row: ReviewedSourceDocMirrorLibraryAnalysisRow,
) {
  const before = reviewedSourceDocLiveLarSnapshot(row, "before");
  const card = aiCardRecord(row);
  if (!before || !card) {
    throw new Error("Live src-143 LibraryAnalysisRecord is not exact before state");
  }
  const aiSummary = before.aiSummary.replace(
    OLD_SRC_143_TITLE,
    NEW_SRC_143_TITLE,
  );
  const shortSummary = before.shortSummary.replace(
    OLD_SRC_143_TITLE,
    NEW_SRC_143_TITLE,
  );
  return {
    title: NEW_SRC_143_TITLE,
    aiSummary,
    aiCard: { ...card, shortSummary },
  } satisfies Prisma.LibraryAnalysisRecordUpdateManyMutationInput;
}

export function reviewedSourceDocSourceRefSnapshot(
  state: "before" | "after",
) {
  return state === "before"
    ? {
        label: "Kilpailulaki § 4a",
        url: "https://www.kkv.fi/en/",
      }
    : {
        label: "Competition Act 948/2011, Section 4a",
        url: "https://www.finlex.fi/en/legislation/2011/948",
      };
}

function projectionMatches(row: unknown, expected: Record<string, unknown>) {
  const record = row as Record<string, unknown>;
  const actual = Object.fromEntries(
    Object.keys(expected).map((key) => {
      const value = record[key];
      return [key, value instanceof Date ? value.toISOString() : value];
    }),
  );
  return canonicalHash(actual) === canonicalHash(expected);
}

function citationState(
  row: ReviewedSourceDocMirrorSourceCitationRow,
  binding: ReviewedSourceDocMirrorBinding,
): ReviewedSourceDocMirrorRowState {
  if (
    row.sourceClass !== "primary" ||
    row.captureMethod !== "backfill-existing-locators" ||
    row.hashAlgorithm !== "sha256" ||
    row.localPath !== null ||
    row.fileHash !== null ||
    row.contentHash !== null ||
    row.pageRef !== null ||
    row.quote !== null ||
    row.confidence !== null ||
    row.notes !== null
  ) {
    return "conflict";
  }
  if (binding.kind === "url") {
    if (row.documentId !== null || row.sourceDocId !== null) return "conflict";
  } else if (
    row.documentId !== LINKED_DOCUMENT_IDS[binding.sourceDocId] ||
    row.sourceDocId !== binding.sourceDocId ||
    row.url !== null ||
    row.archivedUrl !== null ||
    row.accessedAt !== null ||
    row.verificationStatus !== "needs_review" ||
    row.verifiedAt !== null ||
    row.verifiedBy !== null ||
    row.citationReadiness !== "blocked_unsourced"
  ) {
    return "conflict";
  }
  if (
    projectionMatches(
      row,
      reviewedSourceDocCitationMirrorSnapshot(binding, "before"),
    )
  ) {
    return "before";
  }
  if (
    projectionMatches(
      row,
      reviewedSourceDocCitationMirrorSnapshot(binding, "after"),
    )
  ) {
    return "after";
  }
  return "conflict";
}

function sourceRefState(
  row: ReviewedSourceDocMirrorSourceRefRow,
): ReviewedSourceDocMirrorRowState {
  if (
    row.id !== SRC_24_SOURCE_REF_ID ||
    row.sourceDocId !== "src-24" ||
    row.insightId !== "ins-09" ||
    row.meetingId !== null ||
    row.note !== "Finsk dominansterskel 30 %"
  ) {
    return "conflict";
  }
  if (projectionMatches(row, reviewedSourceDocSourceRefSnapshot("before"))) {
    return "before";
  }
  if (projectionMatches(row, reviewedSourceDocSourceRefSnapshot("after"))) {
    return "after";
  }
  return "conflict";
}

function protectedCollections(
  collections: ReviewedSourceDocMirrorCollections,
) {
  const bindingByCitationId = new Map<string, ReviewedSourceDocMirrorBinding>(
    REVIEWED_SOURCE_DOC_MIRROR_BINDINGS.map((binding) => [
      binding.sourceCitationId,
      binding,
    ]),
  );
  return {
    ...collections,
    sourceCitations: collections.sourceCitations.map((row) => {
      const binding = bindingByCitationId.get(row.id);
      if (!binding) return row;
      const copy = { ...row } as Record<string, unknown>;
      const fields =
        binding.kind === "url"
          ? REVIEWED_SOURCE_DOC_URL_CITATION_MUTABLE_FIELDS
          : REVIEWED_SOURCE_DOC_LINKED_CITATION_MUTABLE_FIELDS;
      for (const field of fields) delete copy[field];
      delete copy.updatedAt;
      return copy;
    }),
    libraryAnalysisRecords: collections.libraryAnalysisRecords.map((row) => {
      if (row.id !== LIVE_SRC_143_LAR_ID) return row;
      const copy = { ...row } as Record<string, unknown>;
      delete copy.title;
      delete copy.updatedAt;
      copy.aiSummary =
        typeof row.aiSummary === "string"
          ? normalizeLiveLarIdentityText(row.aiSummary)
          : row.aiSummary;
      const card = aiCardRecord(row);
      if (card) {
        const protectedCard = { ...card };
        protectedCard.shortSummary =
          typeof card.shortSummary === "string"
            ? normalizeLiveLarIdentityText(card.shortSummary)
            : card.shortSummary;
        copy.aiCard = protectedCard;
      }
      return copy;
    }),
    sourceRefs: collections.sourceRefs.map((row) => {
      if (row.id !== SRC_24_SOURCE_REF_ID) return row;
      const copy = { ...row } as Record<string, unknown>;
      delete copy.label;
      delete copy.url;
      return copy;
    }),
  };
}

function conflict(
  conflicts: ReviewedSourceDocMirrorConflict[],
  code: string,
  subject: string,
  detail: string,
) {
  conflicts.push({ code, subject, detail });
}

export function reviewedSourceDocMirrorContract() {
  return {
    version: REVIEWED_SOURCE_DOC_MIRROR_VERSION,
    sourceDocIdentityManifestSha256:
      REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_MANIFEST_SHA256,
    bindings: REVIEWED_SOURCE_DOC_MIRROR_BINDINGS,
    urlCitationMutableFields: REVIEWED_SOURCE_DOC_URL_CITATION_MUTABLE_FIELDS,
    linkedCitationMutableFields:
      REVIEWED_SOURCE_DOC_LINKED_CITATION_MUTABLE_FIELDS,
    liveLibraryAnalysisRecordId: LIVE_SRC_143_LAR_ID,
    staleRetainedLibraryAnalysisRecord: {
      id: STALE_RETAINED_SRC_143_LAR_ID,
      sourceKind: "document",
      sourceKey: "document:cmq8rsnhl000mekvmou6qjq2j",
      documentId: null,
      sourceDocId: "src-143",
      disposition: "staleRetained",
    },
    libraryAnalysisMutablePaths: REVIEWED_SOURCE_DOC_LAR_MUTABLE_PATHS,
    sourceRef: {
      id: SRC_24_SOURCE_REF_ID,
      sourceDocId: "src-24",
      insightId: "ins-09",
      mutableFields: REVIEWED_SOURCE_DOC_SOURCE_REF_MUTABLE_FIELDS,
    },
    accessedAt: REVIEWED_SOURCE_DOC_MIRROR_ACCESSED_AT_ISO,
    urlBeforePolicy: URL_BEFORE_POLICY,
    urlAfterPolicy: {
      citationReadiness: "blocked_unsourced",
      verificationStatus: "needs_review",
      verifiedAt: null,
      verifiedBy: null,
      archivedUrl: null,
    },
    boundary: {
      mutatesSourceDocs: false,
      mutatesFieldCitations: false,
      mutatesDocuments: false,
      mutatesReports: false,
      staleRetainedLarIsImmutable: true,
    },
  };
}

export const REVIEWED_SOURCE_DOC_MIRROR_CONTRACT_SHA256 = canonicalHash(
  reviewedSourceDocMirrorContract(),
);

export function buildReviewedSourceDocMirrorPlan(input: {
  databaseIdentity: ReviewedSourceDocMirrorDatabaseIdentity;
  collections: ReviewedSourceDocMirrorCollections;
}): ReviewedSourceDocMirrorInspection {
  const collections = normalizeCollections(input.collections);
  const conflicts: ReviewedSourceDocMirrorConflict[] = [];
  const sourceDocById = new Map(collections.sourceDocs.map((row) => [row.id, row]));
  for (const repair of REVIEWED_SOURCE_DOC_IDENTITY_REPAIRS) {
    const row = sourceDocById.get(repair.id);
    const expected = row
      ? portableSourceDocIdentityToDatabaseRow(repair.after, row.documentId)
      : null;
    if (
      !row ||
      canonicalHash(normalizeReviewedSourceDocIdentityDatabaseRow(row)) !==
        canonicalHash(expected)
    ) {
      conflict(
        conflicts,
        "source_doc_not_exact_after",
        repair.id,
        "Authoritative SourceDoc must be the exact reviewed all-after identity",
      );
    }
  }
  if (collections.sourceDocs.length !== 3) {
    conflict(
      conflicts,
      "source_doc_inventory_drift",
      "batch",
      `Expected exactly 3 SourceDocs; found ${collections.sourceDocs.length}`,
    );
  }

  const fieldById = new Map(collections.fieldCitations.map((row) => [row.id, row]));
  const citationById = new Map(
    collections.sourceCitations.map((row) => [row.id, row]),
  );
  const citationTargets = REVIEWED_SOURCE_DOC_MIRROR_BINDINGS.map((binding) => {
    const field = fieldById.get(binding.fieldCitationId);
    if (
      !field ||
      field.citationId !== binding.sourceCitationId ||
      field.entityType !== "SourceDoc" ||
      field.entityId !== binding.sourceDocId ||
      field.fieldPath !== binding.fieldPath
    ) {
      conflict(
        conflicts,
        "field_citation_binding_drift",
        `${binding.sourceDocId}:${binding.fieldPath}`,
        `Expected exact FieldCitation ${binding.fieldCitationId} -> ${binding.sourceCitationId}`,
      );
    }
    const citation = citationById.get(binding.sourceCitationId);
    const state = citation ? citationState(citation, binding) : "conflict";
    if (!citation) {
      conflict(
        conflicts,
        "missing_source_citation",
        binding.sourceCitationId,
        "Pinned SourceCitation is missing",
      );
    } else if (state === "conflict") {
      conflict(
        conflicts,
        "source_citation_snapshot_drift",
        binding.sourceCitationId,
        "SourceCitation matches neither exact reviewed before nor after state",
      );
    }
    return {
      ...binding,
      state,
      fullRowSha256: citation ? canonicalHash(citation) : null,
    };
  });
  if (
    collections.fieldCitations.length !== 5 ||
    collections.sourceCitations.length !== 5
  ) {
    conflict(
      conflicts,
      "citation_inventory_drift",
      "batch",
      `Expected exactly 5 FieldCitation and 5 SourceCitation rows; found ${collections.fieldCitations.length}/${collections.sourceCitations.length}`,
    );
  }

  const larById = new Map(
    collections.libraryAnalysisRecords.map((row) => [row.id, row]),
  );
  const liveLar = larById.get(LIVE_SRC_143_LAR_ID);
  let liveLarState: ReviewedSourceDocMirrorRowState = "conflict";
  if (
    liveLar &&
    liveLar.sourceKind === "source_doc" &&
    liveLar.sourceKey === "source_doc:src-143" &&
    liveLar.documentId === null &&
    liveLar.sourceDocId === "src-143"
  ) {
    liveLarState = reviewedSourceDocLiveLarSnapshot(liveLar, "before")
      ? "before"
      : reviewedSourceDocLiveLarSnapshot(liveLar, "after")
        ? "after"
        : "conflict";
  }
  if (liveLarState === "conflict") {
    conflict(
      conflicts,
      "live_library_analysis_snapshot_drift",
      LIVE_SRC_143_LAR_ID,
      "Live SourceDoc LAR is missing, misbound, or not exact before/after",
    );
  }
  const staleLar = larById.get(STALE_RETAINED_SRC_143_LAR_ID);
  if (
    !staleLar ||
    staleLar.sourceKind !== "document" ||
    staleLar.sourceKey !== "document:cmq8rsnhl000mekvmou6qjq2j" ||
    staleLar.documentId !== null ||
    staleLar.sourceDocId !== "src-143" ||
    staleLar.title !== OLD_SRC_143_TITLE
  ) {
    conflict(
      conflicts,
      "stale_retained_library_analysis_drift",
      STALE_RETAINED_SRC_143_LAR_ID,
      "Explicit staleRetained document LAR must remain present and unchanged",
    );
  }
  if (collections.libraryAnalysisRecords.length !== 2) {
    conflict(
      conflicts,
      "library_analysis_inventory_drift",
      "src-143",
      `Expected exactly live plus staleRetained LAR; found ${collections.libraryAnalysisRecords.length}`,
    );
  }

  const sourceRef = collections.sourceRefs.find(
    (row) => row.id === SRC_24_SOURCE_REF_ID,
  );
  const refState = sourceRef ? sourceRefState(sourceRef) : "conflict";
  if (refState === "conflict") {
    conflict(
      conflicts,
      "source_ref_snapshot_drift",
      SRC_24_SOURCE_REF_ID,
      "Pinned SourceRef is missing, misbound, or not exact before/after",
    );
  }
  if (collections.sourceRefs.length !== 1) {
    conflict(
      conflicts,
      "source_ref_inventory_drift",
      "src-24",
      `Expected exactly one linked SourceRef; found ${collections.sourceRefs.length}`,
    );
  }

  const states = [
    ...citationTargets.map((target) => target.state),
    liveLarState,
    refState,
  ];
  let atomicState: "all_before" | "all_after" | "conflict" = states.every(
    (state) => state === "before",
  )
    ? "all_before"
    : states.every((state) => state === "after")
      ? "all_after"
      : "conflict";
  if (atomicState === "conflict" && conflicts.length === 0) {
    conflict(
      conflicts,
      "atomic_hybrid",
      "batch",
      "The five citations, live LAR, and SourceRef are a partial before/after mixture",
    );
  }
  if (conflicts.length > 0) atomicState = "conflict";

  const dependencyCounts = Object.fromEntries(
    collectionNames.map((name) => [name, collections[name].length]),
  ) as Record<keyof ReviewedSourceDocMirrorCollections, number>;
  const dependencyIds = Object.fromEntries(
    collectionNames.map((name) => [
      name,
      collections[name].map((row) => rowId(row, name)),
    ]),
  ) as Record<keyof ReviewedSourceDocMirrorCollections, string[]>;
  const pendingRows = states.filter((state) => state === "before").length;
  const appliedRows = states.filter((state) => state === "after").length;
  const plan: ReviewedSourceDocMirrorPlan = {
    version: REVIEWED_SOURCE_DOC_MIRROR_VERSION,
    contractSha256: REVIEWED_SOURCE_DOC_MIRROR_CONTRACT_SHA256,
    sourceDocIdentityManifestSha256:
      REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_MANIFEST_SHA256,
    databaseIdentity: input.databaseIdentity,
    atomicState,
    targetStateSha256: canonicalHash({ citationTargets, liveLarState, refState }),
    dependencySha256: canonicalHash(collections),
    preservedDependencySha256: canonicalHash(protectedCollections(collections)),
    dependencyCounts,
    dependencyIds,
    citationTargets,
    liveLibraryAnalysisTarget: {
      id: LIVE_SRC_143_LAR_ID,
      state: liveLarState,
      fullRowSha256: liveLar ? canonicalHash(liveLar) : null,
    },
    staleRetainedLibraryAnalysis: {
      id: STALE_RETAINED_SRC_143_LAR_ID,
      protected: true,
      fullRowSha256: staleLar ? canonicalHash(staleLar) : null,
    },
    sourceRefTarget: {
      id: SRC_24_SOURCE_REF_ID,
      state: refState,
      fullRowSha256: sourceRef ? canonicalHash(sourceRef) : null,
    },
    conflicts,
    summary: {
      sourceDocs: 3,
      fieldCitations: 5,
      sourceCitations: 5,
      liveLibraryAnalysisRecords: 1,
      staleRetainedLibraryAnalysisRecords: 1,
      sourceRefs: 1,
      pendingRows,
      appliedRows,
      conflicts: conflicts.length,
    },
    boundary: {
      mutatesSourceDocs: false,
      mutatesFieldCitations: false,
      mutatesDocuments: false,
      mutatesReports: false,
      staleRetainedLarIsImmutable: true,
    },
  };
  return { plan, collections };
}

export function reviewedSourceDocMirrorPlanSha256(
  inspection: ReviewedSourceDocMirrorInspection,
) {
  return canonicalHash(inspection.plan);
}

export function parseReviewedSourceDocMirrorArgs(
  argv: readonly string[],
): ReviewedSourceDocMirrorArgs {
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
      throw new Error(`Unknown reviewed SourceDoc mirror argument: ${argument}`);
    }
  }
  if (apply && dryRun) throw new Error("--apply and --dry-run are mutually exclusive");
  if (!apply && (ack !== undefined || expectedPlanSha256 !== undefined)) {
    throw new Error("--ack and --plan-sha256 are valid only with --apply");
  }
  return { apply, ack, expectedPlanSha256 };
}

async function inspectDatabaseIdentity(
  client: Pick<Prisma.TransactionClient, "$queryRaw">,
): Promise<ReviewedSourceDocMirrorDatabaseIdentity> {
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
    FROM "DatabaseIdentity"
    WHERE "key" = 'primary'
    ORDER BY "key"
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
    throw new Error("Reviewed SourceDoc mirror requires one valid primary DatabaseIdentity");
  }
  return {
    currentDatabase: tableRows[0].currentDatabase,
    key: "primary",
    identityUuid: row.identityUuid.toLowerCase(),
    createdAt: row.createdAt.toISOString(),
  };
}

export async function inspectReviewedSourceDocMirrorDatabaseState(
  client: ReviewedSourceDocMirrorClient,
): Promise<ReviewedSourceDocMirrorInspection> {
  const targetSourceDocIds = ["src-16", "src-24", "src-143"];
  const targetCitationIds = REVIEWED_SOURCE_DOC_MIRROR_BINDINGS.map(
    (binding) => binding.sourceCitationId,
  );
  const targetFieldCitationIds = REVIEWED_SOURCE_DOC_MIRROR_BINDINGS.map(
    (binding) => binding.fieldCitationId,
  );
  const [
    databaseIdentity,
    sourceDocs,
    sourceCitations,
    fieldCitations,
    libraryAnalysisRecords,
    sourceRefs,
    evidenceAppraisals,
    insightCitationConsumers,
    producerCitationConsumers,
    nonCanonicalBindings,
  ] = await Promise.all([
    inspectDatabaseIdentity(client),
    client.sourceDoc.findMany({
      where: { id: { in: targetSourceDocIds } },
      select: sourceDocSelect,
      orderBy: { id: "asc" },
    }),
    client.sourceCitation.findMany({
      where: { id: { in: targetCitationIds } },
      select: sourceCitationSelect,
      orderBy: { id: "asc" },
    }),
    client.fieldCitation.findMany({
      where: {
        OR: [
          { id: { in: targetFieldCitationIds } },
          { citationId: { in: targetCitationIds } },
          {
            entityType: "SourceDoc",
            entityId: { in: targetSourceDocIds },
            fieldPath: { in: ["url", "documentId"] },
          },
        ],
      },
      select: fieldCitationSelect,
      orderBy: { id: "asc" },
    }),
    client.libraryAnalysisRecord.findMany({
      where: { sourceDocId: "src-143" },
      select: libraryAnalysisRecordSelect,
      orderBy: { id: "asc" },
    }),
    client.sourceRef.findMany({
      where: { sourceDocId: "src-24" },
      select: sourceRefSelect,
      orderBy: { id: "asc" },
    }),
    client.evidenceAppraisal.findMany({
      where: {
        OR: [
          { sourceDocId: { in: targetSourceDocIds } },
          { reviewBasisCitationId: { in: targetCitationIds } },
        ],
      },
      select: evidenceAppraisalSelect,
      orderBy: { id: "asc" },
    }),
    client.insight.findMany({
      where: { primaryCitationId: { in: targetCitationIds } },
      select: insightCitationSelect,
      orderBy: { id: "asc" },
    }),
    client.producer.findMany({
      where: { primaryCitationId: { in: targetCitationIds } },
      select: producerCitationSelect,
      orderBy: { id: "asc" },
    }),
    client.$queryRaw<Array<{ id: string; entityType: string; entityId: string; fieldPath: string | null }>>(
      Prisma.sql`
        SELECT "id", "entityType", "entityId", "fieldPath"
        FROM "FieldCitation"
        WHERE regexp_replace(lower(btrim("entityType")), '[^a-z0-9]+', '', 'g') = 'sourcedoc'
          AND regexp_replace(btrim("entityId"), '[[:cntrl:]]', '', 'g') IN (${Prisma.join(targetSourceDocIds)})
          AND lower(coalesce("fieldPath", '')) IN ('url', 'documentid')
          AND (
            "entityType" IS DISTINCT FROM 'SourceDoc'
            OR "entityId" IS DISTINCT FROM regexp_replace(btrim("entityId"), '[[:cntrl:]]', '', 'g')
            OR "fieldPath" NOT IN ('url', 'documentId')
          )
        ORDER BY "id"
      `,
    ),
  ]);
  if (nonCanonicalBindings.length > 0) {
    throw new Error(
      `Non-canonical SourceDoc mirror FieldCitation bindings: ${nonCanonicalBindings
        .map((row) => row.id)
        .join(", ")}`,
    );
  }
  return buildReviewedSourceDocMirrorPlan({
    databaseIdentity,
    collections: {
      sourceDocs: sourceDocs.map(normalizeReviewedSourceDocIdentityDatabaseRow),
      sourceCitations,
      fieldCitations,
      libraryAnalysisRecords,
      sourceRefs,
      evidenceAppraisals,
      insightCitationConsumers,
      producerCitationConsumers,
    },
  });
}

export function fullReviewedSourceDocMirrorSourceCitationWhere(
  row: ReviewedSourceDocMirrorSourceCitationRow,
): Prisma.SourceCitationWhereInput {
  return { ...row };
}

function nullableJsonWhere(value: Prisma.JsonValue | null) {
  return { equals: value === null ? Prisma.DbNull : value };
}

export function fullReviewedSourceDocMirrorLibraryAnalysisWhere(
  row: ReviewedSourceDocMirrorLibraryAnalysisRow,
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

export function fullReviewedSourceDocMirrorSourceRefWhere(
  row: ReviewedSourceDocMirrorSourceRefRow,
): Prisma.SourceRefWhereInput {
  return { ...row };
}

export function reviewedSourceDocCitationMirrorUpdateData(
  binding: ReviewedSourceDocMirrorBinding,
) {
  const after = reviewedSourceDocCitationMirrorSnapshot(binding, "after");
  return Object.fromEntries(
    Object.entries(after).map(([key, value]) => [
      key,
      key === "accessedAt" || key === "verifiedAt" ? exactDate(value as string | null) : value,
    ]),
  ) as Prisma.SourceCitationUpdateManyMutationInput;
}

export function reviewedSourceDocSourceRefUpdateData() {
  return reviewedSourceDocSourceRefSnapshot(
    "after",
  ) satisfies Prisma.SourceRefUpdateManyMutationInput;
}

function exactInventory(
  left: ReviewedSourceDocMirrorPlan,
  right: ReviewedSourceDocMirrorPlan,
) {
  return collectionNames.every(
    (name) =>
      left.dependencyCounts[name] === right.dependencyCounts[name] &&
      canonicalHash(left.dependencyIds[name]) ===
        canonicalHash(right.dependencyIds[name]),
  );
}

export function assertReviewedSourceDocMirrorPostApply(
  before: ReviewedSourceDocMirrorInspection,
  after: ReviewedSourceDocMirrorInspection,
) {
  if (
    after.plan.atomicState !== "all_after" ||
    after.plan.conflicts.length !== 0 ||
    after.plan.summary.appliedRows !== 7 ||
    canonicalHash(after.plan.databaseIdentity) !==
      canonicalHash(before.plan.databaseIdentity) ||
    after.plan.preservedDependencySha256 !==
      before.plan.preservedDependencySha256 ||
    !exactInventory(before.plan, after.plan) ||
    after.plan.staleRetainedLibraryAnalysis.fullRowSha256 !==
      before.plan.staleRetainedLibraryAnalysis.fullRowSha256
  ) {
    throw new Error(
      "Post-apply all-after, DatabaseIdentity, preserved dependency, staleRetained, or inventory proof failed; transaction must roll back",
    );
  }
}

async function lockReviewedSourceDocMirrorTables(
  transaction: Prisma.TransactionClient,
) {
  await transaction.$executeRaw`
    LOCK TABLE "DatabaseIdentity", "SourceDoc", "SourceCitation",
      "FieldCitation", "LibraryAnalysisRecord", "SourceRef",
      "EvidenceAppraisal", "Insight", "Producer"
    IN SHARE ROW EXCLUSIVE MODE
  `;
}

async function lockIds(
  transaction: Prisma.TransactionClient,
  table: "SourceDoc" | "SourceCitation" | "FieldCitation" | "LibraryAnalysisRecord" | "SourceRef" | "EvidenceAppraisal" | "Insight" | "Producer",
  ids: readonly string[],
  mode: "UPDATE" | "SHARE",
) {
  if (ids.length === 0) return;
  const rows = await transaction.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT "id" FROM ${Prisma.raw(`"${table}"`)}
    WHERE "id" IN (${Prisma.join([...ids])})
    ORDER BY "id" FOR ${Prisma.raw(mode)}
  `);
  if (canonicalHash(rows.map((row) => row.id).sort(compareIds)) !== canonicalHash([...ids].sort(compareIds))) {
    throw new Error(`${table} mirror dependency changed after planning; transaction must roll back`);
  }
}

async function lockReviewedSourceDocMirrorRows(
  transaction: Prisma.TransactionClient,
  inspection: ReviewedSourceDocMirrorInspection,
) {
  const identity = await transaction.$queryRaw<
    Array<{ identityUuid: string; createdAt: Date }>
  >(Prisma.sql`
    SELECT "identityUuid"::text AS "identityUuid", "createdAt"
    FROM "DatabaseIdentity" WHERE "key" = 'primary' FOR SHARE
  `);
  if (
    identity.length !== 1 ||
    identity[0]!.identityUuid.toLowerCase() !==
      inspection.plan.databaseIdentity.identityUuid ||
    identity[0]!.createdAt.toISOString() !==
      inspection.plan.databaseIdentity.createdAt
  ) {
    throw new Error("DatabaseIdentity changed after planning; transaction must roll back");
  }
  const ids = inspection.plan.dependencyIds;
  await lockIds(transaction, "SourceDoc", ids.sourceDocs, "SHARE");
  await lockIds(transaction, "SourceCitation", ids.sourceCitations, "UPDATE");
  await lockIds(transaction, "FieldCitation", ids.fieldCitations, "SHARE");
  await lockIds(transaction, "LibraryAnalysisRecord", ids.libraryAnalysisRecords, "UPDATE");
  await lockIds(transaction, "SourceRef", ids.sourceRefs, "UPDATE");
  await lockIds(transaction, "EvidenceAppraisal", ids.evidenceAppraisals, "SHARE");
  await lockIds(transaction, "Insight", ids.insightCitationConsumers, "SHARE");
  await lockIds(transaction, "Producer", ids.producerCitationConsumers, "SHARE");
}

async function applyReviewedSourceDocMirrorUpdates(
  transaction: Prisma.TransactionClient,
  inspection: ReviewedSourceDocMirrorInspection,
) {
  const citationById = new Map(
    inspection.collections.sourceCitations.map((row) => [row.id, row]),
  );
  let citations = 0;
  for (const target of inspection.plan.citationTargets) {
    if (target.state !== "before") continue;
    const row = citationById.get(target.sourceCitationId);
    if (!row) throw new Error(`Missing SourceCitation ${target.sourceCitationId}`);
    const result = await transaction.sourceCitation.updateMany({
      where: fullReviewedSourceDocMirrorSourceCitationWhere(row),
      data: reviewedSourceDocCitationMirrorUpdateData(target),
    });
    if (result.count !== 1) {
      throw new Error(`Concurrent full-row SourceCitation CAS conflict: ${row.id}; transaction must roll back`);
    }
    citations += 1;
  }
  let libraryAnalysisRecords = 0;
  if (inspection.plan.liveLibraryAnalysisTarget.state === "before") {
    const row = inspection.collections.libraryAnalysisRecords.find(
      (candidate) => candidate.id === LIVE_SRC_143_LAR_ID,
    );
    if (!row) throw new Error("Missing live src-143 LibraryAnalysisRecord");
    const result = await transaction.libraryAnalysisRecord.updateMany({
      where: fullReviewedSourceDocMirrorLibraryAnalysisWhere(row),
      data: reviewedSourceDocLiveLarUpdateData(row),
    });
    if (result.count !== 1) {
      throw new Error("Concurrent full-row live LAR CAS conflict; transaction must roll back");
    }
    libraryAnalysisRecords = 1;
  }
  let sourceRefs = 0;
  if (inspection.plan.sourceRefTarget.state === "before") {
    const row = inspection.collections.sourceRefs.find(
      (candidate) => candidate.id === SRC_24_SOURCE_REF_ID,
    );
    if (!row) throw new Error("Missing src-24 SourceRef");
    const result = await transaction.sourceRef.updateMany({
      where: fullReviewedSourceDocMirrorSourceRefWhere(row),
      data: reviewedSourceDocSourceRefUpdateData(),
    });
    if (result.count !== 1) {
      throw new Error("Concurrent full-row SourceRef CAS conflict; transaction must roll back");
    }
    sourceRefs = 1;
  }
  const expected = inspection.plan.atomicState === "all_before" ? [5, 1, 1] : [0, 0, 0];
  if (canonicalHash([citations, libraryAnalysisRecords, sourceRefs]) !== canonicalHash(expected)) {
    throw new Error("Unexpected SourceDoc mirror mutation counts; transaction must roll back");
  }
  return { citations, libraryAnalysisRecords, sourceRefs };
}

function printPlan(inspection: ReviewedSourceDocMirrorInspection, digest: string) {
  const plan = inspection.plan;
  console.log("Reviewed SourceDoc identity mirror reconciliation");
  console.log(`Plan SHA-256: ${digest}`);
  console.log(`Contract SHA-256: ${plan.contractSha256}`);
  console.log(`Database: ${plan.databaseIdentity.currentDatabase}; identity UUID: ${plan.databaseIdentity.identityUuid}`);
  console.log(`Atomic state: ${plan.atomicState}; pending=${plan.summary.pendingRows}; applied=${plan.summary.appliedRows}; conflicts=${plan.summary.conflicts}`);
  console.log(`Dependency SHA-256: ${plan.dependencySha256}; preserved=${plan.preservedDependencySha256}`);
  for (const target of plan.citationTargets) {
    console.log(`${target.state} ${target.sourceDocId}:${target.fieldPath} FieldCitation=${target.fieldCitationId} SourceCitation=${target.sourceCitationId}`);
  }
  console.log(`${plan.liveLibraryAnalysisTarget.state} live LAR=${LIVE_SRC_143_LAR_ID}; protected staleRetained LAR=${STALE_RETAINED_SRC_143_LAR_ID}`);
  console.log(`${plan.sourceRefTarget.state} SourceRef=${SRC_24_SOURCE_REF_ID}`);
  for (const item of plan.conflicts) console.log(`Conflict ${item.code} ${item.subject}: ${item.detail}`);
}

async function main() {
  const args = parseReviewedSourceDocMirrorArgs(process.argv.slice(2));
  if (args.apply && args.ack !== REVIEWED_SOURCE_DOC_MIRROR_APPLY_ACK) {
    throw new Error(`--apply requires --ack=${REVIEWED_SOURCE_DOC_MIRROR_APPLY_ACK}`);
  }
  if (args.apply && !/^[a-f0-9]{64}$/.test(args.expectedPlanSha256 ?? "")) {
    throw new Error("--apply requires exact --plan-sha256=<64 lowercase hex>");
  }
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
  try {
    const inspection = await inspectReviewedSourceDocMirrorDatabaseState(prisma);
    if (inspection.plan.atomicState === "conflict") {
      throw new Error(`Reviewed SourceDoc mirror conflicts: ${inspection.plan.conflicts.map((item) => `${item.subject}:${item.code}`).join(", ")}`);
    }
    const digest = reviewedSourceDocMirrorPlanSha256(inspection);
    printPlan(inspection, digest);
    if (!args.apply) {
      console.log(`Dry run only. Apply with --apply --ack=${REVIEWED_SOURCE_DOC_MIRROR_APPLY_ACK} --plan-sha256=${digest}`);
      return;
    }
    if (digest !== args.expectedPlanSha256) {
      throw new Error("Current plan differs from --plan-sha256; rerun dry-run");
    }
    const result = await prisma.$transaction(
      async (transaction) => {
        await lockReviewedSourceDocMirrorTables(transaction);
        await transaction.$executeRaw`
          SELECT pg_advisory_xact_lock(hashtext(${REVIEWED_SOURCE_DOC_MIRROR_ADVISORY_LOCK_KEY}))
        `;
        await lockReviewedSourceDocMirrorRows(transaction, inspection);
        const locked = await inspectReviewedSourceDocMirrorDatabaseState(transaction);
        if (
          locked.plan.atomicState === "conflict" ||
          reviewedSourceDocMirrorPlanSha256(locked) !== args.expectedPlanSha256
        ) {
          throw new Error("Locked SourceDoc mirror plan changed; transaction must roll back");
        }
        const counts = await applyReviewedSourceDocMirrorUpdates(transaction, locked);
        const after = await inspectReviewedSourceDocMirrorDatabaseState(transaction);
        assertReviewedSourceDocMirrorPostApply(locked, after);
        return counts;
      },
      { isolationLevel: "Serializable" },
    );
    console.log(`Applied SourceDoc mirrors: ${JSON.stringify(result)}`);
  } catch (error) {
    if (args.apply) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(`SourceDoc mirror reconciliation failed; the Serializable transaction rolled back and zero rows were committed. Cause: ${detail}`, { cause: error });
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
    console.error(error instanceof Error ? error.message : "SourceDoc mirror reconciliation failed");
    process.exitCode = 1;
  });
}
