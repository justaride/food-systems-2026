import "dotenv/config";
import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";
import { Prisma, PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  REVIEWED_THESIS_BIBLIOGRAPHIC_MANIFEST_SHA256,
  REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS,
  REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIR_TARGET_COUNT,
  canonicalizeReviewedThesisBibliographicJson,
  sha256ReviewedThesisBibliographicJson,
} from "../src/lib/citations/reviewed-thesis-bibliographic-repair";
import {
  databaseRowToPortableThesisBibliography,
  normalizeReviewedThesisBibliographicDatabaseRow,
  type ReviewedThesisBibliographicDatabaseRow,
} from "./apply-reviewed-thesis-bibliographic-repair";

export const REVIEWED_THESIS_MIRROR_RECONCILIATION_VERSION =
  "2026-07-20-v1" as const;
export const REVIEWED_THESIS_MIRROR_RECONCILIATION_APPLY_ACK =
  "APPLY_REVIEWED_THESIS_BIBLIOGRAPHIC_MIRRORS_9";
export const REVIEWED_THESIS_MIRROR_RECONCILIATION_ADVISORY_LOCK_KEY =
  "foodsystems:reviewed-thesis-bibliographic-mirrors:2026-07-20:v1";
export const REVIEWED_THESIS_MIRROR_ACCESSED_AT_ISO =
  "2026-07-20T00:00:00.000Z";

export const REVIEWED_THESIS_SUMMARY_DOCUMENT_IDS = [
  "sandanger-2012",
  "granlund-lindskog-2024",
  "tallaksen-2022",
  "handlykken-2023",
] as const;

export const REVIEWED_THESIS_GENERATED_DOCUMENT_IDS = [
  "slu-house-crickets-2025",
  "van-straten-2025",
  "bueso-bordils-2021",
  "nmbu-circular-vegetables-2022",
] as const;

export const REVIEWED_THESIS_LIBRARY_ANALYSIS_MUTATION_IDS = [
  "slu-house-crickets-2025",
  "van-straten-2025",
  "bueso-bordils-2021",
] as const;

export const REVIEWED_THESIS_CITATION_REVERIFICATION_IDS = [
  "granlund-lindskog-2024",
  "nmbu-circular-vegetables-2022",
] as const;

export const REVIEWED_THESIS_CITATION_REVERIFICATION_BEFORE_EVIDENCE = {
  "granlund-lindskog-2024": {
    verificationStatus: "machine_verified",
    verifiedAt: "2026-05-26T06:38:58.913Z",
    verifiedBy: null,
    archivedUrl:
      "https://web.archive.org/web/20241114112130/https://ntnuopen.ntnu.no/ntnu-xmlui/handle/11250/3156088",
  },
  "nmbu-circular-vegetables-2022": {
    verificationStatus: "machine_verified",
    verifiedAt: "2026-05-26T06:38:30.715Z",
    verifiedBy: null,
    archivedUrl:
      "https://web.archive.org/web/20250426211644/https://agris.fao.org/search/en/providers/122576/records/6474afcaf2e6fe92b3632ace",
  },
} as const;

export const REVIEWED_THESIS_NO_DOCUMENT_IDS = ["tesdal-2013"] as const;

export const REVIEWED_THESIS_CITATION_MIRROR_MUTABLE_FIELDS = [
  "citationText",
  "title",
  "author",
  "year",
  "publisher",
  "url",
  "accessedAt",
] as const;

export const REVIEWED_THESIS_CITATION_REVERIFICATION_MUTABLE_FIELDS = [
  "verificationStatus",
  "verifiedAt",
  "verifiedBy",
  "archivedUrl",
] as const;

export const REVIEWED_THESIS_GENERATED_DOCUMENT_MUTABLE_FIELDS = [
  "title",
  "author",
  "year",
  "url",
  "accessedAt",
] as const;

export const REVIEWED_THESIS_SUMMARY_DOCUMENT_MUTABLE_FIELDS = [
  "accessedAt",
] as const;

export const REVIEWED_THESIS_SANDANGER_SUMMARY_DOCUMENT_MUTABLE_FIELDS = [
  "url",
  "accessedAt",
] as const;

export const REVIEWED_THESIS_LIBRARY_ANALYSIS_MUTABLE_FIELDS = [
  "title",
  "aiSummary",
  "aiCard.shortSummary",
] as const;

const SANDANGER_SUMMARY_URL_BEFORE =
  "https://openaccess.nhh.no/nhh-xmlui/handle/11250/166778";
const CITATION_URL_BEFORE_OVERRIDES: Readonly<Record<string, string>> = {
  "sandanger-2012":
    "https://openaccess.nhh.no/nhh-xmlui/handle/11250/166778",
  "tallaksen-2022":
    "https://uia.brage.unit.no/uia-xmlui/handle/11250/3008873",
  "handlykken-2023":
    "https://oda.oslomet.no/oda-xmlui/handle/11250/3101983",
};
const GENERATED_DOCUMENT_MARKER = "prisma/seed-data/theses.ts";

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

const documentRefSelect = {
  id: true,
  fromId: true,
  toId: true,
  refType: true,
} satisfies Prisma.DocumentRefSelect;

const insightDocumentRefSelect = {
  id: true,
  insightId: true,
  documentId: true,
  relevance: true,
} satisfies Prisma.InsightDocumentRefSelect;

const companyDocumentRefSelect = {
  id: true,
  companyId: true,
  documentId: true,
  context: true,
} satisfies Prisma.CompanyDocumentRefSelect;

const actorDocumentRefSelect = {
  id: true,
  actorId: true,
  documentId: true,
  context: true,
} satisfies Prisma.ActorDocumentRefSelect;

const sourceDocBindingSelect = {
  id: true,
  documentId: true,
} satisfies Prisma.SourceDocSelect;

const reportBindingSelect = {
  id: true,
  documentId: true,
} satisfies Prisma.ReportSelect;

const insightCitationBindingSelect = {
  id: true,
  primaryCitationId: true,
} satisfies Prisma.InsightSelect;

const producerCitationBindingSelect = {
  id: true,
  primaryCitationId: true,
} satisfies Prisma.ProducerSelect;

export type ReviewedThesisMirrorThesisRow = Prisma.ThesisGetPayload<{
  select: typeof thesisSelect;
}>;
export type ReviewedThesisMirrorDocumentRow = Prisma.DocumentGetPayload<{
  select: typeof documentSelect;
}>;
export type ReviewedThesisMirrorSourceCitationRow =
  Prisma.SourceCitationGetPayload<{ select: typeof sourceCitationSelect }>;
export type ReviewedThesisMirrorFieldCitationRow =
  Prisma.FieldCitationGetPayload<{ select: typeof fieldCitationSelect }>;
export type ReviewedThesisMirrorLibraryAnalysisRow =
  Prisma.LibraryAnalysisRecordGetPayload<{
    select: typeof libraryAnalysisRecordSelect;
  }>;
export type ReviewedThesisMirrorEvidenceAppraisalRow =
  Prisma.EvidenceAppraisalGetPayload<{ select: typeof evidenceAppraisalSelect }>;
export type ReviewedThesisMirrorDocumentRefRow = Prisma.DocumentRefGetPayload<{
  select: typeof documentRefSelect;
}>;
export type ReviewedThesisMirrorInsightDocumentRefRow =
  Prisma.InsightDocumentRefGetPayload<{ select: typeof insightDocumentRefSelect }>;
export type ReviewedThesisMirrorCompanyDocumentRefRow =
  Prisma.CompanyDocumentRefGetPayload<{ select: typeof companyDocumentRefSelect }>;
export type ReviewedThesisMirrorActorDocumentRefRow =
  Prisma.ActorDocumentRefGetPayload<{ select: typeof actorDocumentRefSelect }>;
export type ReviewedThesisMirrorSourceDocBindingRow =
  Prisma.SourceDocGetPayload<{ select: typeof sourceDocBindingSelect }>;
export type ReviewedThesisMirrorReportBindingRow = Prisma.ReportGetPayload<{
  select: typeof reportBindingSelect;
}>;
export type ReviewedThesisMirrorInsightCitationBindingRow =
  Prisma.InsightGetPayload<{ select: typeof insightCitationBindingSelect }>;
export type ReviewedThesisMirrorProducerCitationBindingRow =
  Prisma.ProducerGetPayload<{ select: typeof producerCitationBindingSelect }>;

export type ReviewedThesisMirrorDatabaseIdentity = {
  currentDatabase: string;
  databaseIdentityUuid: string;
};

export type ReviewedThesisMirrorCollections = {
  theses: ReviewedThesisMirrorThesisRow[];
  documents: ReviewedThesisMirrorDocumentRow[];
  sourceCitations: ReviewedThesisMirrorSourceCitationRow[];
  fieldCitations: ReviewedThesisMirrorFieldCitationRow[];
  libraryAnalysisRecords: ReviewedThesisMirrorLibraryAnalysisRow[];
  evidenceAppraisals: ReviewedThesisMirrorEvidenceAppraisalRow[];
  documentRefs: ReviewedThesisMirrorDocumentRefRow[];
  insightDocumentRefs: ReviewedThesisMirrorInsightDocumentRefRow[];
  companyDocumentRefs: ReviewedThesisMirrorCompanyDocumentRefRow[];
  actorDocumentRefs: ReviewedThesisMirrorActorDocumentRefRow[];
  sourceDocBindings: ReviewedThesisMirrorSourceDocBindingRow[];
  reportBindings: ReviewedThesisMirrorReportBindingRow[];
  insightCitationBindings: ReviewedThesisMirrorInsightCitationBindingRow[];
  producerCitationBindings: ReviewedThesisMirrorProducerCitationBindingRow[];
};

export type ReviewedThesisMirrorConflict = {
  code: string;
  subject: string;
  detail: string;
};

export type ReviewedThesisMirrorAtomicState =
  | "all_before"
  | "all_after"
  | "conflict";

export type ReviewedThesisMirrorTarget = {
  thesisId: string;
  fieldCitationId: string | null;
  sourceCitationId: string | null;
  documentId: string | null;
  documentKind: "summary" | "generated" | "none";
  directLibraryAnalysisRecordId: string | null;
  citationState: "before" | "after" | "before_and_after" | "conflict";
  documentState:
    | "before"
    | "after"
    | "before_and_after"
    | "not_applicable"
    | "conflict";
  libraryAnalysisState:
    | "before"
    | "after"
    | "before_and_after"
    | "protected_noop"
    | "not_applicable"
    | "conflict";
  citationFullRowSha256: string | null;
  documentFullRowSha256: string | null;
  libraryAnalysisFullRowSha256: string | null;
};

export type ReviewedThesisMirrorDependencyCounts = {
  [K in keyof ReviewedThesisMirrorCollections]: number;
};

export type ReviewedThesisMirrorDependencyIds = {
  [K in keyof ReviewedThesisMirrorCollections]: string[];
};

export type ReviewedThesisMirrorPlan = {
  version: typeof REVIEWED_THESIS_MIRROR_RECONCILIATION_VERSION;
  contractSha256: string;
  thesisBibliographicManifestSha256: string;
  databaseIdentity: ReviewedThesisMirrorDatabaseIdentity;
  atomicState: ReviewedThesisMirrorAtomicState;
  targetStateSha256: string;
  dependencySha256: string;
  preservedDependencySha256: string;
  dependencyCounts: ReviewedThesisMirrorDependencyCounts;
  dependencyIds: ReviewedThesisMirrorDependencyIds;
  targets: ReviewedThesisMirrorTarget[];
  conflicts: ReviewedThesisMirrorConflict[];
  summary: {
    targets: number;
    citations: number;
    documents: number;
    libraryAnalysisRecords: number;
    directLibraryAnalysisRecords: number;
    pendingTargets: number;
    appliedTargets: number;
    conflicts: number;
  };
  boundary: {
    createsDoiSourceCitations: false;
    createsDoiFieldCitations: false;
    mutatesThesisRows: false;
  };
};

export type ReviewedThesisMirrorInspection = {
  plan: ReviewedThesisMirrorPlan;
  collections: ReviewedThesisMirrorCollections;
};

export type ReviewedThesisMirrorArgs = {
  apply: boolean;
  ack: string | undefined;
  expectedPlanSha256: string | undefined;
};

type ReviewedThesisMirrorClient = Pick<
  Prisma.TransactionClient,
  | "$queryRaw"
  | "thesis"
  | "document"
  | "sourceCitation"
  | "fieldCitation"
  | "libraryAnalysisRecord"
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

const collectionNames = [
  "theses",
  "documents",
  "sourceCitations",
  "fieldCitations",
  "libraryAnalysisRecords",
  "evidenceAppraisals",
  "documentRefs",
  "insightDocumentRefs",
  "companyDocumentRefs",
  "actorDocumentRefs",
  "sourceDocBindings",
  "reportBindings",
  "insightCitationBindings",
  "producerCitationBindings",
] as const satisfies readonly (keyof ReviewedThesisMirrorCollections)[];

const summaryIdSet = new Set<string>(REVIEWED_THESIS_SUMMARY_DOCUMENT_IDS);
const generatedIdSet = new Set<string>(
  REVIEWED_THESIS_GENERATED_DOCUMENT_IDS,
);
const libraryAnalysisMutationIdSet = new Set<string>(
  REVIEWED_THESIS_LIBRARY_ANALYSIS_MUTATION_IDS,
);
const citationReverificationIdSet = new Set<string>(
  REVIEWED_THESIS_CITATION_REVERIFICATION_IDS,
);
const noDocumentIdSet = new Set<string>(REVIEWED_THESIS_NO_DOCUMENT_IDS);
const repairsById = new Map(
  REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS.map((repair) => [repair.id, repair]),
);

function compareIds(left: string, right: string) {
  return left.localeCompare(right, undefined, { numeric: true });
}

function sortedUnique(values: readonly (string | null | undefined)[]) {
  return [
    ...new Set(
      values.filter((value): value is string => typeof value === "string"),
    ),
  ].sort(compareIds);
}

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

function rowId(row: unknown, collection: string) {
  const id = (row as { id?: unknown }).id;
  if (typeof id !== "string" || id.length === 0) {
    throw new Error(`${collection} dependency row has no stable string id`);
  }
  return id;
}

function normalizeCollections(
  collections: ReviewedThesisMirrorCollections,
): ReviewedThesisMirrorCollections {
  return Object.fromEntries(
    collectionNames.map((name) => [
      name,
      [...collections[name]].sort((left, right) =>
        compareIds(rowId(left, name), rowId(right, name)),
      ),
    ]),
  ) as ReviewedThesisMirrorCollections;
}

function metadataString(row: ReviewedThesisMirrorDocumentRow, key: string) {
  if (
    row.metadata === null ||
    Array.isArray(row.metadata) ||
    typeof row.metadata !== "object"
  ) {
    return null;
  }
  const value = (row.metadata as Record<string, unknown>)[key];
  return typeof value === "string" ? value : null;
}

function accessDate() {
  return new Date(REVIEWED_THESIS_MIRROR_ACCESSED_AT_ISO);
}

export function reviewedThesisCitationMirrorSnapshot(
  thesisId: string,
  state: "before" | "after",
) {
  const repair = repairsById.get(thesisId);
  if (!repair) throw new Error(`Unknown reviewed Thesis mirror id: ${thesisId}`);
  const thesis = repair[state];
  return {
    citationText: `Thesis: ${thesis.title}`,
    title: thesis.title,
    author: thesis.authors,
    year: thesis.year,
    publisher: thesis.publisher,
    url:
      state === "before"
        ? (CITATION_URL_BEFORE_OVERRIDES[thesisId] ?? thesis.url)
        : thesis.url,
    accessedAt:
      state === "before" ? null : REVIEWED_THESIS_MIRROR_ACCESSED_AT_ISO,
  };
}

export function reviewedThesisDocumentMirrorSnapshot(
  thesisId: string,
  state: "before" | "after",
) {
  const repair = repairsById.get(thesisId);
  if (!repair) throw new Error(`Unknown reviewed Thesis mirror id: ${thesisId}`);
  if (noDocumentIdSet.has(thesisId)) return null;
  if (generatedIdSet.has(thesisId)) {
    const thesis = repair[state];
    return {
      title: thesis.title,
      author: thesis.authors,
      year: thesis.year,
      url: thesis.url,
      accessedAt:
        state === "before" ? null : REVIEWED_THESIS_MIRROR_ACCESSED_AT_ISO,
    };
  }
  if (thesisId === "sandanger-2012") {
    return {
      url:
        state === "before"
          ? SANDANGER_SUMMARY_URL_BEFORE
          : repair.after.url,
      accessedAt:
        state === "before" ? null : REVIEWED_THESIS_MIRROR_ACCESSED_AT_ISO,
    };
  }
  if (summaryIdSet.has(thesisId)) {
    return {
      accessedAt:
        state === "before" ? null : REVIEWED_THESIS_MIRROR_ACCESSED_AT_ISO,
    };
  }
  throw new Error(`Reviewed Thesis document class is not declared: ${thesisId}`);
}

export function reviewedThesisLibraryAnalysisMirrorSnapshot(
  thesisId: string,
  state: "before" | "after",
) {
  if (!libraryAnalysisMutationIdSet.has(thesisId)) return null;
  const repair = repairsById.get(thesisId)!;
  return { title: repair[state].title };
}

function exactOccurrenceCount(value: string, needle: string) {
  if (needle.length === 0) return 0;
  return value.split(needle).length - 1;
}

function aiCardShortSummary(row: ReviewedThesisMirrorLibraryAnalysisRow) {
  if (
    row.aiCard === null ||
    Array.isArray(row.aiCard) ||
    typeof row.aiCard !== "object"
  ) {
    return null;
  }
  const value = (row.aiCard as Record<string, unknown>).shortSummary;
  return typeof value === "string" ? value : null;
}

function libraryAnalysisProjectionState(
  row: ReviewedThesisMirrorLibraryAnalysisRow,
  thesisId: string,
) {
  const repair = repairsById.get(thesisId)!;
  const aiSummary = row.aiSummary;
  const shortSummary = aiCardShortSummary(row);
  if (aiSummary === null || shortSummary === null) return "conflict" as const;
  const before =
    row.title === repair.before.title &&
    exactOccurrenceCount(aiSummary, repair.before.title) === 1 &&
    exactOccurrenceCount(shortSummary, repair.before.title) === 1;
  const after =
    row.title === repair.after.title &&
    exactOccurrenceCount(aiSummary, repair.after.title) === 1 &&
    exactOccurrenceCount(shortSummary, repair.after.title) === 1 &&
    exactOccurrenceCount(aiSummary, repair.before.title) === 0 &&
    exactOccurrenceCount(shortSummary, repair.before.title) === 0;
  if (before && after) return "before_and_after" as const;
  if (before) return "before" as const;
  if (after) return "after" as const;
  return "conflict" as const;
}

export function reviewedThesisCitationMutableFields(thesisId: string) {
  if (!repairsById.has(thesisId)) {
    throw new Error(`Unknown reviewed Thesis mirror id: ${thesisId}`);
  }
  return citationReverificationIdSet.has(thesisId)
    ? [
        ...REVIEWED_THESIS_CITATION_MIRROR_MUTABLE_FIELDS,
        ...REVIEWED_THESIS_CITATION_REVERIFICATION_MUTABLE_FIELDS,
      ]
    : [...REVIEWED_THESIS_CITATION_MIRROR_MUTABLE_FIELDS];
}

function projection(row: unknown, fields: readonly string[]) {
  const record = row as Record<string, unknown>;
  return Object.fromEntries(
    fields.map((field) => [field, normalizedValue(record[field])]),
  );
}

function projectionState(
  row: unknown,
  before: Record<string, unknown>,
  after: Record<string, unknown>,
) {
  const fields = Object.keys(after);
  const actual = projection(row, fields);
  const actualHash = canonicalHash(actual);
  const beforeHash = canonicalHash(before);
  const afterHash = canonicalHash(after);
  if (actualHash === beforeHash && beforeHash === afterHash) {
    return "before_and_after" as const;
  }
  if (actualHash === beforeHash) return "before" as const;
  if (actualHash === afterHash) return "after" as const;
  return "conflict" as const;
}

function stateAllowsBefore(state: string) {
  return state === "before" || state === "before_and_after";
}

function stateAllowsAfter(state: string) {
  return state === "after" || state === "before_and_after";
}

function documentKind(thesisId: string) {
  if (generatedIdSet.has(thesisId)) return "generated" as const;
  if (summaryIdSet.has(thesisId)) return "summary" as const;
  return "none" as const;
}

function conflict(
  conflicts: ReviewedThesisMirrorConflict[],
  code: string,
  subject: string,
  detail: string,
) {
  conflicts.push({ code, subject, detail });
}

function targetCitationPolicyConflicts(
  row: ReviewedThesisMirrorSourceCitationRow,
  thesisId: string,
) {
  const findings: string[] = [];
  if (row.sourceClass !== "secondary") findings.push("sourceClass != secondary");
  if (row.citationReadiness !== "citable_with_note") {
    findings.push("citationReadiness != citable_with_note");
  }
  if (row.captureMethod !== "backfill-existing-locators") {
    findings.push("captureMethod != backfill-existing-locators");
  }
  if (row.hashAlgorithm !== "sha256") findings.push("hashAlgorithm != sha256");
  if (row.documentId !== null) findings.push("documentId must remain null");
  if (row.sourceDocId !== null) findings.push("sourceDocId must remain null");
  if (row.localPath !== null) findings.push("localPath must remain null");

  const needsReviewAliasIds = new Set([
    "sandanger-2012",
    "tallaksen-2022",
    "handlykken-2023",
  ]);
  if (needsReviewAliasIds.has(thesisId)) {
    if (row.verificationStatus !== "needs_review") {
      findings.push("verificationStatus != needs_review");
    }
    if (row.verifiedAt !== null) findings.push("verifiedAt must be null");
    if (row.verifiedBy !== null) findings.push("verifiedBy must be null");
    if (thesisId === "sandanger-2012" && row.archivedUrl !== null) {
      findings.push("Sandanger archivedUrl must remain null");
    }
    if (
      (thesisId === "tallaksen-2022" || thesisId === "handlykken-2023") &&
      row.archivedUrl === null
    ) {
      findings.push("same-work archive alias must remain present");
    }
  } else if (citationReverificationIdSet.has(thesisId)) {
    const expectedBefore =
      REVIEWED_THESIS_CITATION_REVERIFICATION_BEFORE_EVIDENCE[
        thesisId as keyof typeof REVIEWED_THESIS_CITATION_REVERIFICATION_BEFORE_EVIDENCE
      ];
    const beforePolicy =
      row.verificationStatus === expectedBefore.verificationStatus &&
      row.verifiedAt?.toISOString() === expectedBefore.verifiedAt &&
      row.verifiedBy === expectedBefore.verifiedBy &&
      row.archivedUrl === expectedBefore.archivedUrl;
    const afterPolicy =
      row.verificationStatus === "needs_review" &&
      row.verifiedAt === null &&
      row.verifiedBy === null &&
      row.archivedUrl === null;
    if (!beforePolicy && !afterPolicy) {
      findings.push(
        "locator-changing citation must be either machine-verified old-locator state or cleared needs-review state",
      );
    }
  } else if (row.verificationStatus !== "machine_verified") {
    findings.push("verificationStatus != machine_verified");
  }
  return findings.map((detail) => ({
    code: "citation_policy_drift",
    subject: thesisId,
    detail,
  }));
}

function citationProjectionState(
  row: ReviewedThesisMirrorSourceCitationRow,
  thesisId: string,
) {
  const before = reviewedThesisCitationMirrorSnapshot(thesisId, "before");
  const after = reviewedThesisCitationMirrorSnapshot(thesisId, "after");
  const baseState = projectionState(row, before, after);
  if (!citationReverificationIdSet.has(thesisId)) return baseState;
  if (baseState === "before") {
    const expected =
      REVIEWED_THESIS_CITATION_REVERIFICATION_BEFORE_EVIDENCE[
        thesisId as keyof typeof REVIEWED_THESIS_CITATION_REVERIFICATION_BEFORE_EVIDENCE
      ];
    return row.verificationStatus === expected.verificationStatus &&
      row.verifiedAt?.toISOString() === expected.verifiedAt &&
      row.verifiedBy === expected.verifiedBy &&
      row.archivedUrl === expected.archivedUrl
      ? "before"
      : "conflict";
  }
  if (baseState === "after") {
    return row.verificationStatus === "needs_review" &&
      row.verifiedAt === null &&
      row.verifiedBy === null &&
      row.archivedUrl === null
      ? "after"
      : "conflict";
  }
  return baseState;
}

function portableThesisMatchesReviewedAfter(row: ReviewedThesisMirrorThesisRow) {
  const repair = repairsById.get(row.id);
  if (!repair) return false;
  const normalized = normalizeReviewedThesisBibliographicDatabaseRow(
    row as ReviewedThesisBibliographicDatabaseRow,
  );
  return (
    sha256ReviewedThesisBibliographicJson(
      databaseRowToPortableThesisBibliography(normalized),
    ) === sha256ReviewedThesisBibliographicJson(repair.after)
  );
}

function directLibraryRecord(
  records: readonly ReviewedThesisMirrorLibraryAnalysisRow[],
  documentId: string,
) {
  return records.filter(
    (row) =>
      row.documentId === documentId &&
      row.sourceKind === "document" &&
      row.sourceKey === `document:${documentId}`,
  );
}

function protectedCollections(
  collections: ReviewedThesisMirrorCollections,
  targets: readonly ReviewedThesisMirrorTarget[],
) {
  const citationIds = new Set(
    targets
      .map((target) => target.sourceCitationId)
      .filter((id): id is string => id !== null),
  );
  const thesisIdByCitationId = new Map(
    targets
      .filter((target) => target.sourceCitationId !== null)
      .map((target) => [target.sourceCitationId!, target.thesisId]),
  );
  const thesisIdByDocumentId = new Map(
    targets
      .filter((target) => target.documentId !== null)
      .map((target) => [target.documentId!, target.thesisId]),
  );
  const mutatedLarIds = new Set(
    targets
      .filter((target) => libraryAnalysisMutationIdSet.has(target.thesisId))
      .map((target) => target.directLibraryAnalysisRecordId)
      .filter((id): id is string => id !== null),
  );

  return {
    ...collections,
    sourceCitations: collections.sourceCitations.map((row) => {
      if (!citationIds.has(row.id)) return row;
      const copy = { ...row } as Record<string, unknown>;
      const thesisId = thesisIdByCitationId.get(row.id)!;
      for (const field of reviewedThesisCitationMutableFields(thesisId)) {
        delete copy[field];
      }
      delete copy.updatedAt;
      return copy;
    }),
    documents: collections.documents.map((row) => {
      const thesisId = thesisIdByDocumentId.get(row.id);
      if (!thesisId) return row;
      const copy = { ...row } as Record<string, unknown>;
      for (const field of Object.keys(
        reviewedThesisDocumentMirrorSnapshot(thesisId, "after")!,
      )) {
        delete copy[field];
      }
      delete copy.updatedAt;
      return copy;
    }),
    libraryAnalysisRecords: collections.libraryAnalysisRecords.map((row) => {
      if (!mutatedLarIds.has(row.id)) return row;
      const copy = { ...row } as Record<string, unknown>;
      delete copy.title;
      delete copy.aiSummary;
      const card = copy.aiCard;
      if (card !== null && !Array.isArray(card) && typeof card === "object") {
        const protectedCard = { ...(card as Record<string, unknown>) };
        delete protectedCard.shortSummary;
        copy.aiCard = protectedCard;
      }
      delete copy.updatedAt;
      return copy;
    }),
  };
}

function buildDependencyState(
  collections: ReviewedThesisMirrorCollections,
  targets: readonly ReviewedThesisMirrorTarget[],
) {
  const normalized = normalizeCollections(collections);
  const counts = Object.fromEntries(
    collectionNames.map((name) => [name, normalized[name].length]),
  ) as ReviewedThesisMirrorDependencyCounts;
  const ids = Object.fromEntries(
    collectionNames.map((name) => [
      name,
      normalized[name].map((row) => rowId(row, name)),
    ]),
  ) as ReviewedThesisMirrorDependencyIds;
  return {
    normalized,
    counts,
    ids,
    sha256: canonicalHash(normalized),
    preservedSha256: canonicalHash(protectedCollections(normalized, targets)),
  };
}

export function reviewedThesisMirrorContract() {
  return {
    version: REVIEWED_THESIS_MIRROR_RECONCILIATION_VERSION,
    thesisBibliographicManifestSha256:
      REVIEWED_THESIS_BIBLIOGRAPHIC_MANIFEST_SHA256,
    targetIds: REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS.map((repair) => repair.id),
    summaryDocumentIds: REVIEWED_THESIS_SUMMARY_DOCUMENT_IDS,
    generatedDocumentIds: REVIEWED_THESIS_GENERATED_DOCUMENT_IDS,
    libraryAnalysisMutationIds:
      REVIEWED_THESIS_LIBRARY_ANALYSIS_MUTATION_IDS,
    citationReverificationIds: REVIEWED_THESIS_CITATION_REVERIFICATION_IDS,
    citationReverificationBeforeEvidence:
      REVIEWED_THESIS_CITATION_REVERIFICATION_BEFORE_EVIDENCE,
    noDocumentIds: REVIEWED_THESIS_NO_DOCUMENT_IDS,
    generatedDocumentMarker: GENERATED_DOCUMENT_MARKER,
    citationMutableFields: REVIEWED_THESIS_CITATION_MIRROR_MUTABLE_FIELDS,
    citationReverificationMutableFields:
      REVIEWED_THESIS_CITATION_REVERIFICATION_MUTABLE_FIELDS,
    citationUrlBeforeOverrides: CITATION_URL_BEFORE_OVERRIDES,
    generatedDocumentMutableFields:
      REVIEWED_THESIS_GENERATED_DOCUMENT_MUTABLE_FIELDS,
    summaryDocumentMutableFields:
      REVIEWED_THESIS_SUMMARY_DOCUMENT_MUTABLE_FIELDS,
    sandangerSummaryDocumentMutableFields:
      REVIEWED_THESIS_SANDANGER_SUMMARY_DOCUMENT_MUTABLE_FIELDS,
    libraryAnalysisMutableFields:
      REVIEWED_THESIS_LIBRARY_ANALYSIS_MUTABLE_FIELDS,
    accessedAt: REVIEWED_THESIS_MIRROR_ACCESSED_AT_ISO,
    boundary: {
      createsDoiSourceCitations: false,
      createsDoiFieldCitations: false,
      mutatesThesisRows: false,
    },
  };
}

export const REVIEWED_THESIS_MIRROR_RECONCILIATION_CONTRACT_SHA256 =
  canonicalHash(reviewedThesisMirrorContract());

export function buildReviewedThesisMirrorPlan(input: {
  databaseIdentity: ReviewedThesisMirrorDatabaseIdentity;
  collections: ReviewedThesisMirrorCollections;
}): ReviewedThesisMirrorInspection {
  const collections = normalizeCollections(input.collections);
  const conflicts: ReviewedThesisMirrorConflict[] = [];
  const targetIds = REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS.map(
    (repair) => repair.id,
  );
  const thesisRowsById = new Map<string, ReviewedThesisMirrorThesisRow[]>();
  for (const row of collections.theses) {
    const rows = thesisRowsById.get(row.id) ?? [];
    rows.push(row);
    thesisRowsById.set(row.id, rows);
  }

  for (const id of targetIds) {
    const rows = thesisRowsById.get(id) ?? [];
    if (rows.length !== 1) {
      conflict(
        conflicts,
        rows.length === 0 ? "missing_thesis" : "duplicate_thesis",
        id,
        `Expected exactly one reviewed Thesis row; found ${rows.length}`,
      );
    } else if (!portableThesisMatchesReviewedAfter(rows[0]!)) {
      conflict(
        conflicts,
        "thesis_not_reviewed_after",
        id,
        "The authoritative Thesis row is not the exact reviewed after-snapshot",
      );
    }
  }
  for (const id of thesisRowsById.keys()) {
    if (!repairsById.has(id)) {
      conflict(
        conflicts,
        "unexpected_thesis",
        id,
        "Thesis dependency collection contains a non-target row",
      );
    }
  }

  const documentRowsById = new Map<string, ReviewedThesisMirrorDocumentRow[]>();
  for (const row of collections.documents) {
    const rows = documentRowsById.get(row.id) ?? [];
    rows.push(row);
    documentRowsById.set(row.id, rows);
  }
  const sourceRowsById = new Map<
    string,
    ReviewedThesisMirrorSourceCitationRow[]
  >();
  for (const row of collections.sourceCitations) {
    const rows = sourceRowsById.get(row.id) ?? [];
    rows.push(row);
    sourceRowsById.set(row.id, rows);
  }

  const targets = targetIds.map((thesisId) => {
    const thesisRows = thesisRowsById.get(thesisId) ?? [];
    const thesisRow = thesisRows.length === 1 ? thesisRows[0]! : null;
    const kind = documentKind(thesisId);
    const documentId = thesisRow?.documentId ?? null;

    if (kind === "none" && documentId !== null) {
      conflict(
        conflicts,
        "unexpected_document_binding",
        thesisId,
        `Expected no Document binding; found ${documentId}`,
      );
    }
    if (kind !== "none" && documentId === null) {
      conflict(
        conflicts,
        "missing_document_binding",
        thesisId,
        `Expected one ${kind} Document binding`,
      );
    }

    const documentRows = documentId
      ? documentRowsById.get(documentId) ?? []
      : [];
    if (documentId && documentRows.length !== 1) {
      conflict(
        conflicts,
        documentRows.length === 0 ? "missing_document" : "duplicate_document",
        thesisId,
        `Bound Document ${documentId} resolved to ${documentRows.length} rows`,
      );
    }
    const document = documentRows.length === 1 ? documentRows[0]! : null;
    if (
      document &&
      kind === "generated" &&
      metadataString(document, "generatedFrom") !== GENERATED_DOCUMENT_MARKER
    ) {
      conflict(
        conflicts,
        "generated_document_marker_drift",
        thesisId,
        `Document ${document.id} is not marked generatedFrom=${GENERATED_DOCUMENT_MARKER}`,
      );
    }
    if (
      document &&
      kind === "summary" &&
      metadataString(document, "generatedFrom") === GENERATED_DOCUMENT_MARKER
    ) {
      conflict(
        conflicts,
        "summary_document_marker_drift",
        thesisId,
        `Curated summary Document ${document.id} is marked as a generated Thesis mirror`,
      );
    }

    const urlFieldCitations = collections.fieldCitations.filter(
      (row) =>
        row.entityType === "Thesis" &&
        row.entityId === thesisId &&
        row.fieldPath === "url",
    );
    if (urlFieldCitations.length !== 1) {
      conflict(
        conflicts,
        urlFieldCitations.length === 0
          ? "missing_url_field_citation"
          : "duplicate_url_field_citation",
        thesisId,
        `Expected exactly one Thesis url FieldCitation; found ${urlFieldCitations.length}`,
      );
    }
    const fieldCitation =
      urlFieldCitations.length === 1 ? urlFieldCitations[0]! : null;
    const sourceRows = fieldCitation
      ? sourceRowsById.get(fieldCitation.citationId) ?? []
      : [];
    if (fieldCitation && sourceRows.length !== 1) {
      conflict(
        conflicts,
        sourceRows.length === 0
          ? "missing_source_citation"
          : "duplicate_source_citation",
        thesisId,
        `URL FieldCitation ${fieldCitation.id} resolved to ${sourceRows.length} SourceCitation rows`,
      );
    }
    const sourceCitation = sourceRows.length === 1 ? sourceRows[0]! : null;
    if (sourceCitation) {
      conflicts.push(...targetCitationPolicyConflicts(sourceCitation, thesisId));
    }

    const directRecords = documentId
      ? directLibraryRecord(collections.libraryAnalysisRecords, documentId)
      : [];
    if (documentId && directRecords.length !== 1) {
      conflict(
        conflicts,
        directRecords.length === 0
          ? "missing_direct_library_analysis"
          : "duplicate_direct_library_analysis",
        thesisId,
        `Expected exactly one direct Document LibraryAnalysisRecord; found ${directRecords.length}`,
      );
    }
    const directRecord = directRecords.length === 1 ? directRecords[0]! : null;

    const citationState = sourceCitation
      ? citationProjectionState(sourceCitation, thesisId)
      : "conflict";
    if (sourceCitation && citationState === "conflict") {
      conflict(
        conflicts,
        "citation_projection_drift",
        thesisId,
        `SourceCitation ${sourceCitation.id} is neither the exact before nor after mirror projection`,
      );
    }

    const documentBefore = reviewedThesisDocumentMirrorSnapshot(
      thesisId,
      "before",
    );
    const documentAfter = reviewedThesisDocumentMirrorSnapshot(
      thesisId,
      "after",
    );
    const documentState =
      kind === "none"
        ? "not_applicable"
        : document && documentBefore && documentAfter
          ? projectionState(document, documentBefore, documentAfter)
          : "conflict";
    if (document && documentState === "conflict") {
      conflict(
        conflicts,
        "document_projection_drift",
        thesisId,
        `Document ${document.id} is neither the exact before nor after mirror projection`,
      );
    }

    const libraryBefore = reviewedThesisLibraryAnalysisMirrorSnapshot(thesisId, "before");
    const libraryAfter = reviewedThesisLibraryAnalysisMirrorSnapshot(thesisId, "after");
    const libraryAnalysisState =
      kind !== "generated"
        ? "not_applicable"
        : !libraryAnalysisMutationIdSet.has(thesisId)
          ? "protected_noop"
        : directRecord && libraryBefore && libraryAfter
          ? libraryAnalysisProjectionState(directRecord, thesisId)
          : "conflict";
    if (directRecord && libraryAnalysisState === "conflict") {
      conflict(
        conflicts,
        "library_analysis_projection_drift",
        thesisId,
        `LibraryAnalysisRecord ${directRecord.id} is neither the exact before nor after title projection`,
      );
    }

    return {
      thesisId,
      fieldCitationId: fieldCitation?.id ?? null,
      sourceCitationId: sourceCitation?.id ?? null,
      documentId,
      documentKind: kind,
      directLibraryAnalysisRecordId: directRecord?.id ?? null,
      citationState,
      documentState,
      libraryAnalysisState,
      citationFullRowSha256: sourceCitation
        ? canonicalHash(sourceCitation)
        : null,
      documentFullRowSha256: document ? canonicalHash(document) : null,
      libraryAnalysisFullRowSha256: directRecord
        ? canonicalHash(directRecord)
        : null,
    } satisfies ReviewedThesisMirrorTarget;
  });

  const boundDocumentIds = targets
    .map((target) => target.documentId)
    .filter((id): id is string => id !== null);
  if (new Set(boundDocumentIds).size !== boundDocumentIds.length) {
    conflict(
      conflicts,
      "duplicate_document_binding",
      "Batch",
      "Two reviewed Thesis targets share one bound Document",
    );
  }
  if (documentRowsById.size !== new Set(boundDocumentIds).size) {
    conflict(
      conflicts,
      "document_inventory_drift",
      "Batch",
      `Expected exactly ${new Set(boundDocumentIds).size} bound Documents; found ${documentRowsById.size}`,
    );
  }
  const targetCitationIds = targets
    .map((target) => target.sourceCitationId)
    .filter((id): id is string => id !== null);
  if (new Set(targetCitationIds).size !== targetCitationIds.length) {
    conflict(
      conflicts,
      "shared_url_source_citation",
      "Batch",
      "Two reviewed Thesis URL fields share one SourceCitation",
    );
  }

  const before = targets.every(
    (target) =>
      stateAllowsBefore(target.citationState) &&
      (stateAllowsBefore(target.documentState) ||
        target.documentState === "not_applicable") &&
      (stateAllowsBefore(target.libraryAnalysisState) ||
        target.libraryAnalysisState === "protected_noop" ||
        target.libraryAnalysisState === "not_applicable"),
  );
  const after = targets.every(
    (target) =>
      stateAllowsAfter(target.citationState) &&
      (stateAllowsAfter(target.documentState) ||
        target.documentState === "not_applicable") &&
      (stateAllowsAfter(target.libraryAnalysisState) ||
        target.libraryAnalysisState === "protected_noop" ||
        target.libraryAnalysisState === "not_applicable"),
  );
  let atomicState: ReviewedThesisMirrorAtomicState = before
    ? "all_before"
    : after
      ? "all_after"
      : "conflict";
  if (atomicState === "conflict" && conflicts.length === 0) {
    conflict(
      conflicts,
      "atomic_hybrid",
      "Batch",
      "Citation, Document, and LibraryAnalysisRecord mirrors are a partial before/after mixture",
    );
  }
  if (conflicts.length > 0) atomicState = "conflict";

  const dependencies = buildDependencyState(collections, targets);
  const pendingTargets = targets.filter(
    (target) =>
      stateAllowsBefore(target.citationState) &&
      (stateAllowsBefore(target.documentState) ||
        target.documentState === "not_applicable") &&
      (stateAllowsBefore(target.libraryAnalysisState) ||
        target.libraryAnalysisState === "protected_noop" ||
        target.libraryAnalysisState === "not_applicable"),
  ).length;
  const appliedTargets = targets.filter(
    (target) =>
      stateAllowsAfter(target.citationState) &&
      (stateAllowsAfter(target.documentState) ||
        target.documentState === "not_applicable") &&
      (stateAllowsAfter(target.libraryAnalysisState) ||
        target.libraryAnalysisState === "protected_noop" ||
        target.libraryAnalysisState === "not_applicable"),
  ).length;
  const plan: ReviewedThesisMirrorPlan = {
    version: REVIEWED_THESIS_MIRROR_RECONCILIATION_VERSION,
    contractSha256: REVIEWED_THESIS_MIRROR_RECONCILIATION_CONTRACT_SHA256,
    thesisBibliographicManifestSha256:
      REVIEWED_THESIS_BIBLIOGRAPHIC_MANIFEST_SHA256,
    databaseIdentity: input.databaseIdentity,
    atomicState,
    targetStateSha256: canonicalHash(targets),
    dependencySha256: dependencies.sha256,
    preservedDependencySha256: dependencies.preservedSha256,
    dependencyCounts: dependencies.counts,
    dependencyIds: dependencies.ids,
    targets,
    conflicts,
    summary: {
      targets: REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIR_TARGET_COUNT,
      citations: targets.filter((target) => target.sourceCitationId !== null)
        .length,
      documents: targets.filter((target) => target.documentId !== null).length,
      libraryAnalysisRecords: targets.filter((target) =>
        libraryAnalysisMutationIdSet.has(target.thesisId),
      ).length,
      directLibraryAnalysisRecords: targets.filter(
        (target) => target.directLibraryAnalysisRecordId !== null,
      ).length,
      pendingTargets,
      appliedTargets,
      conflicts: conflicts.length,
    },
    boundary: {
      createsDoiSourceCitations: false,
      createsDoiFieldCitations: false,
      mutatesThesisRows: false,
    },
  };
  return { plan, collections: dependencies.normalized };
}

export function reviewedThesisMirrorPlanSha256(
  inspection: ReviewedThesisMirrorInspection,
) {
  return canonicalHash(inspection.plan);
}

export function parseReviewedThesisMirrorArgs(
  argv: readonly string[],
): ReviewedThesisMirrorArgs {
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
      throw new Error(`Unknown reviewed Thesis mirror argument: ${argument}`);
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
): Promise<ReviewedThesisMirrorDatabaseIdentity> {
  const tableRows = await client.$queryRaw<
    Array<{ currentDatabase: string; identityTable: string | null }>
  >(Prisma.sql`
    SELECT current_database() AS "currentDatabase",
           to_regclass('public."DatabaseIdentity"')::text AS "identityTable"
  `);
  if (
    tableRows.length !== 1 ||
    !tableRows[0]?.currentDatabase ||
    tableRows[0].identityTable === null
  ) {
    throw new Error("Reviewed Thesis mirror reconciliation requires DatabaseIdentity metadata");
  }
  const identityRows = await client.$queryRaw<Array<{ identityUuid: string }>>(
    Prisma.sql`
      SELECT "identityUuid"::text AS "identityUuid"
      FROM "DatabaseIdentity"
      WHERE "key" = 'primary'
      ORDER BY "key"
    `,
  );
  const uuid = identityRows[0]?.identityUuid?.toLowerCase();
  if (
    identityRows.length !== 1 ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
      uuid ?? "",
    )
  ) {
    throw new Error("Reviewed Thesis mirror reconciliation requires one valid primary DatabaseIdentity UUID");
  }
  return {
    currentDatabase: tableRows[0].currentDatabase,
    databaseIdentityUuid: uuid!,
  };
}

function mergeRowsById<T extends { id: string }>(...groups: readonly T[][]) {
  const byId = new Map<string, T>();
  for (const row of groups.flat()) byId.set(row.id, row);
  return [...byId.values()].sort((left, right) => compareIds(left.id, right.id));
}

export async function inspectReviewedThesisMirrorDatabaseState(
  client: ReviewedThesisMirrorClient,
): Promise<ReviewedThesisMirrorInspection> {
  const targetIds = REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS.map(
    (repair) => repair.id,
  );
  const [databaseIdentity, theses, targetFieldCitations] = await Promise.all([
    inspectDatabaseIdentity(client),
    client.thesis.findMany({
      where: { id: { in: targetIds } },
      select: thesisSelect,
      orderBy: { id: "asc" },
    }),
    client.fieldCitation.findMany({
      where: { entityType: "Thesis", entityId: { in: targetIds } },
      select: fieldCitationSelect,
      orderBy: { id: "asc" },
    }),
  ]);
  const documentIds = sortedUnique(theses.map((row) => row.documentId));
  const targetCitationIds = sortedUnique(
    targetFieldCitations.map((row) => row.citationId),
  );
  const [documents, sourceCitations] = await Promise.all([
    client.document.findMany({
      where: { id: { in: documentIds } },
      select: documentSelect,
      orderBy: { id: "asc" },
    }),
    client.sourceCitation.findMany({
      where: {
        OR: [
          { id: { in: targetCitationIds } },
          { documentId: { in: documentIds } },
        ],
      },
      select: sourceCitationSelect,
      orderBy: { id: "asc" },
    }),
  ]);
  const allCitationIds = sortedUnique(sourceCitations.map((row) => row.id));
  const [citationFieldCitations, libraryAnalysisRecords] = await Promise.all([
    client.fieldCitation.findMany({
      where: { citationId: { in: allCitationIds } },
      select: fieldCitationSelect,
      orderBy: { id: "asc" },
    }),
    client.libraryAnalysisRecord.findMany({
      where: {
        OR: [
          { documentId: { in: documentIds } },
          {
            sourceKind: "thesis",
            sourceKey: { in: targetIds.map((id) => `thesis:${id}`) },
          },
        ],
      },
      select: libraryAnalysisRecordSelect,
      orderBy: { id: "asc" },
    }),
  ]);
  const fieldCitations = mergeRowsById(
    targetFieldCitations,
    citationFieldCitations,
  );
  const [
    evidenceAppraisals,
    documentRefs,
    insightDocumentRefs,
    companyDocumentRefs,
    actorDocumentRefs,
    sourceDocBindings,
    reportBindings,
    insightCitationBindings,
    producerCitationBindings,
  ] = await Promise.all([
    client.evidenceAppraisal.findMany({
      where: {
        OR: [
          { thesisId: { in: targetIds } },
          { reviewBasisCitationId: { in: allCitationIds } },
        ],
      },
      select: evidenceAppraisalSelect,
      orderBy: { id: "asc" },
    }),
    client.documentRef.findMany({
      where: {
        OR: [
          { fromId: { in: documentIds } },
          { toId: { in: documentIds } },
        ],
      },
      select: documentRefSelect,
      orderBy: { id: "asc" },
    }),
    client.insightDocumentRef.findMany({
      where: { documentId: { in: documentIds } },
      select: insightDocumentRefSelect,
      orderBy: { id: "asc" },
    }),
    client.companyDocumentRef.findMany({
      where: { documentId: { in: documentIds } },
      select: companyDocumentRefSelect,
      orderBy: { id: "asc" },
    }),
    client.actorDocumentRef.findMany({
      where: { documentId: { in: documentIds } },
      select: actorDocumentRefSelect,
      orderBy: { id: "asc" },
    }),
    client.sourceDoc.findMany({
      where: { documentId: { in: documentIds } },
      select: sourceDocBindingSelect,
      orderBy: { id: "asc" },
    }),
    client.report.findMany({
      where: { documentId: { in: documentIds } },
      select: reportBindingSelect,
      orderBy: { id: "asc" },
    }),
    client.insight.findMany({
      where: { primaryCitationId: { in: allCitationIds } },
      select: insightCitationBindingSelect,
      orderBy: { id: "asc" },
    }),
    client.producer.findMany({
      where: { primaryCitationId: { in: allCitationIds } },
      select: producerCitationBindingSelect,
      orderBy: { id: "asc" },
    }),
  ]);
  return buildReviewedThesisMirrorPlan({
    databaseIdentity,
    collections: {
      theses,
      documents,
      sourceCitations,
      fieldCitations,
      libraryAnalysisRecords,
      evidenceAppraisals,
      documentRefs,
      insightDocumentRefs,
      companyDocumentRefs,
      actorDocumentRefs,
      sourceDocBindings,
      reportBindings,
      insightCitationBindings,
      producerCitationBindings,
    },
  });
}

function nullableJsonWhere(value: Prisma.JsonValue | null) {
  return { equals: value === null ? Prisma.DbNull : value };
}

export function fullReviewedThesisMirrorSourceCitationWhere(
  row: ReviewedThesisMirrorSourceCitationRow,
): Prisma.SourceCitationWhereInput {
  return {
    id: row.id,
    sourceClass: row.sourceClass,
    citationReadiness: row.citationReadiness,
    verificationStatus: row.verificationStatus,
    citationText: row.citationText,
    title: row.title,
    publisher: row.publisher,
    author: row.author,
    year: row.year,
    url: row.url,
    archivedUrl: row.archivedUrl,
    localPath: row.localPath,
    fileHash: row.fileHash,
    contentHash: row.contentHash,
    hashAlgorithm: row.hashAlgorithm,
    pageRef: row.pageRef,
    quote: row.quote,
    accessedAt: row.accessedAt,
    captureMethod: row.captureMethod,
    verifiedAt: row.verifiedAt,
    verifiedBy: row.verifiedBy,
    confidence: row.confidence,
    notes: row.notes,
    documentId: row.documentId,
    sourceDocId: row.sourceDocId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function fullReviewedThesisMirrorDocumentWhere(
  row: ReviewedThesisMirrorDocumentRow,
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

export function fullReviewedThesisMirrorLibraryAnalysisWhere(
  row: ReviewedThesisMirrorLibraryAnalysisRow,
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

export function reviewedThesisCitationMirrorUpdateData(thesisId: string) {
  const after = reviewedThesisCitationMirrorSnapshot(thesisId, "after");
  return {
    citationText: after.citationText,
    title: after.title,
    author: after.author,
    year: after.year,
    publisher: after.publisher,
    url: after.url,
    accessedAt: accessDate(),
    ...(citationReverificationIdSet.has(thesisId)
      ? {
          verificationStatus: "needs_review" as const,
          verifiedAt: null,
          verifiedBy: null,
          archivedUrl: null,
        }
      : {}),
  } satisfies Prisma.SourceCitationUpdateManyMutationInput;
}

export function reviewedThesisDocumentMirrorUpdateData(thesisId: string) {
  const after = reviewedThesisDocumentMirrorSnapshot(thesisId, "after");
  if (!after) throw new Error(`${thesisId} has no Document mirror`);
  return Object.fromEntries(
    Object.entries(after).map(([key, value]) => [
      key,
      key === "accessedAt" ? accessDate() : value,
    ]),
  ) as Prisma.DocumentUpdateManyMutationInput;
}

function replaceExactOnce(value: string, before: string, after: string, label: string) {
  if (exactOccurrenceCount(value, before) !== 1) {
    throw new Error(`${label} must contain the old reviewed title exactly once`);
  }
  return value.replace(before, after);
}

export function reviewedThesisLibraryAnalysisUpdateData(
  thesisId: string,
  row: ReviewedThesisMirrorLibraryAnalysisRow,
) {
  const after = reviewedThesisLibraryAnalysisMirrorSnapshot(thesisId, "after");
  if (!after) {
    throw new Error(`${thesisId} has no mutable LibraryAnalysisRecord mirror`);
  }
  const repair = repairsById.get(thesisId)!;
  if (row.aiSummary === null) {
    throw new Error(`${thesisId} LibraryAnalysisRecord.aiSummary must be present`);
  }
  if (
    row.aiCard === null ||
    Array.isArray(row.aiCard) ||
    typeof row.aiCard !== "object"
  ) {
    throw new Error(`${thesisId} LibraryAnalysisRecord.aiCard must be an object`);
  }
  const aiCard = { ...(row.aiCard as Record<string, Prisma.JsonValue>) };
  if (typeof aiCard.shortSummary !== "string") {
    throw new Error(`${thesisId} LibraryAnalysisRecord.aiCard.shortSummary must be a string`);
  }
  aiCard.shortSummary = replaceExactOnce(
    aiCard.shortSummary,
    repair.before.title,
    repair.after.title,
    `${thesisId} aiCard.shortSummary`,
  );
  return {
    title: after.title,
    aiSummary: replaceExactOnce(
      row.aiSummary,
      repair.before.title,
      repair.after.title,
      `${thesisId} aiSummary`,
    ),
    aiCard: aiCard as Prisma.InputJsonValue,
  } satisfies Prisma.LibraryAnalysisRecordUpdateManyMutationInput;
}

function exactStringArrays(left: readonly string[], right: readonly string[]) {
  return canonicalHash([...left].sort(compareIds)) === canonicalHash([...right].sort(compareIds));
}

function exactDependencyInventory(
  left: ReviewedThesisMirrorPlan,
  right: ReviewedThesisMirrorPlan,
) {
  return collectionNames.every(
    (name) =>
      left.dependencyCounts[name] === right.dependencyCounts[name] &&
      exactStringArrays(left.dependencyIds[name], right.dependencyIds[name]),
  );
}

export function assertReviewedThesisMirrorPostApply(
  before: ReviewedThesisMirrorInspection,
  after: ReviewedThesisMirrorInspection,
) {
  if (
    after.plan.atomicState !== "all_after" ||
    after.plan.conflicts.length !== 0 ||
    after.plan.summary.appliedTargets !==
      REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIR_TARGET_COUNT ||
    before.plan.databaseIdentity.currentDatabase !==
      after.plan.databaseIdentity.currentDatabase ||
    before.plan.databaseIdentity.databaseIdentityUuid !==
      after.plan.databaseIdentity.databaseIdentityUuid ||
    before.plan.preservedDependencySha256 !==
      after.plan.preservedDependencySha256 ||
    !exactDependencyInventory(before.plan, after.plan)
  ) {
    throw new Error(
      "Post-apply all-after, DatabaseIdentity, preserved dependency, or direct inventory proof failed; no rows updated",
    );
  }
}

type LockTable =
  | "Thesis"
  | "Document"
  | "SourceCitation"
  | "FieldCitation"
  | "LibraryAnalysisRecord"
  | "EvidenceAppraisal"
  | "DocumentRef"
  | "InsightDocumentRef"
  | "CompanyDocumentRef"
  | "ActorDocumentRef"
  | "SourceDoc"
  | "Report"
  | "Insight"
  | "Producer";

async function lockIds(
  transaction: Prisma.TransactionClient,
  table: LockTable,
  ids: readonly string[],
  mode: "UPDATE" | "SHARE",
) {
  if (ids.length === 0) return;
  const locked = await transaction.$queryRaw<Array<{ id: string }>>(
    Prisma.sql`
      SELECT "id" FROM ${Prisma.raw(`"${table}"`)}
      WHERE "id" IN (${Prisma.join([...ids])})
      ORDER BY "id" FOR ${Prisma.raw(mode)}
    `,
  );
  if (!exactStringArrays(locked.map((row) => row.id), ids)) {
    throw new Error(`Reviewed Thesis mirror ${table} dependency changed after planning; no rows updated`);
  }
}

async function lockReviewedThesisMirrorState(
  transaction: Prisma.TransactionClient,
  inspection: ReviewedThesisMirrorInspection,
) {
  const identity = await transaction.$queryRaw<Array<{ identityUuid: string }>>(
    Prisma.sql`
      SELECT "identityUuid"::text AS "identityUuid"
      FROM "DatabaseIdentity"
      WHERE "key" = 'primary'
      ORDER BY "key" FOR SHARE
    `,
  );
  if (
    identity.length !== 1 ||
    identity[0]?.identityUuid.toLowerCase() !==
      inspection.plan.databaseIdentity.databaseIdentityUuid
  ) {
    throw new Error("Reviewed Thesis mirror DatabaseIdentity changed after planning; no rows updated");
  }
  const ids = inspection.plan.dependencyIds;
  await lockIds(transaction, "Thesis", ids.theses, "SHARE");
  await lockIds(transaction, "Document", ids.documents, "UPDATE");
  await lockIds(transaction, "SourceCitation", ids.sourceCitations, "UPDATE");
  await lockIds(transaction, "FieldCitation", ids.fieldCitations, "SHARE");
  await lockIds(
    transaction,
    "LibraryAnalysisRecord",
    ids.libraryAnalysisRecords,
    "UPDATE",
  );
  await lockIds(transaction, "EvidenceAppraisal", ids.evidenceAppraisals, "SHARE");
  await lockIds(transaction, "DocumentRef", ids.documentRefs, "SHARE");
  await lockIds(transaction, "InsightDocumentRef", ids.insightDocumentRefs, "SHARE");
  await lockIds(transaction, "CompanyDocumentRef", ids.companyDocumentRefs, "SHARE");
  await lockIds(transaction, "ActorDocumentRef", ids.actorDocumentRefs, "SHARE");
  await lockIds(transaction, "SourceDoc", ids.sourceDocBindings, "SHARE");
  await lockIds(transaction, "Report", ids.reportBindings, "SHARE");
  await lockIds(transaction, "Insight", ids.insightCitationBindings, "SHARE");
  await lockIds(transaction, "Producer", ids.producerCitationBindings, "SHARE");
}

async function applyReviewedThesisMirrorUpdates(
  transaction: Prisma.TransactionClient,
  inspection: ReviewedThesisMirrorInspection,
) {
  const citationsById = new Map(
    inspection.collections.sourceCitations.map((row) => [row.id, row]),
  );
  const documentsById = new Map(
    inspection.collections.documents.map((row) => [row.id, row]),
  );
  const libraryById = new Map(
    inspection.collections.libraryAnalysisRecords.map((row) => [row.id, row]),
  );
  let citations = 0;
  let documents = 0;
  let libraryAnalysisRecords = 0;
  for (const target of inspection.plan.targets) {
    const citation = citationsById.get(target.sourceCitationId ?? "");
    if (!citation) throw new Error(`Missing locked SourceCitation for ${target.thesisId}`);
    const citationResult = await transaction.sourceCitation.updateMany({
      where: fullReviewedThesisMirrorSourceCitationWhere(citation),
      data: reviewedThesisCitationMirrorUpdateData(target.thesisId),
    });
    if (citationResult.count !== 1) {
      throw new Error(`Concurrent full-row SourceCitation CAS conflict: ${target.thesisId}; no rows updated`);
    }
    citations += 1;

    if (target.documentId) {
      const document = documentsById.get(target.documentId);
      if (!document) throw new Error(`Missing locked Document for ${target.thesisId}`);
      const documentResult = await transaction.document.updateMany({
        where: fullReviewedThesisMirrorDocumentWhere(document),
        data: reviewedThesisDocumentMirrorUpdateData(target.thesisId),
      });
      if (documentResult.count !== 1) {
        throw new Error(`Concurrent full-row Document CAS conflict: ${target.thesisId}; no rows updated`);
      }
      documents += 1;
    }

    if (libraryAnalysisMutationIdSet.has(target.thesisId)) {
      const library = libraryById.get(
        target.directLibraryAnalysisRecordId ?? "",
      );
      if (!library) throw new Error(`Missing locked LibraryAnalysisRecord for ${target.thesisId}`);
      const libraryResult = await transaction.libraryAnalysisRecord.updateMany({
        where: fullReviewedThesisMirrorLibraryAnalysisWhere(library),
        data: reviewedThesisLibraryAnalysisUpdateData(target.thesisId, library),
      });
      if (libraryResult.count !== 1) {
        throw new Error(`Concurrent full-row LibraryAnalysisRecord CAS conflict: ${target.thesisId}; no rows updated`);
      }
      libraryAnalysisRecords += 1;
    }
  }
  if (citations !== 9 || documents !== 8 || libraryAnalysisRecords !== 3) {
    throw new Error(
      `Unexpected mirror mutation counts ${citations}/${documents}/${libraryAnalysisRecords}; no rows updated`,
    );
  }
  return { citations, documents, libraryAnalysisRecords };
}

function printPlan(inspection: ReviewedThesisMirrorInspection, digest: string) {
  const plan = inspection.plan;
  console.log("Reviewed Thesis bibliographic mirror reconciliation plan");
  console.log(`Plan SHA-256: ${digest}`);
  console.log(`Contract SHA-256: ${plan.contractSha256}`);
  console.log(`Thesis manifest SHA-256: ${plan.thesisBibliographicManifestSha256}`);
  console.log(
    `Database: ${plan.databaseIdentity.currentDatabase}; identity UUID: ${plan.databaseIdentity.databaseIdentityUuid}`,
  );
  console.log(
    `Atomic state: ${plan.atomicState}; targets=${plan.summary.targets}; citations=${plan.summary.citations}; documents=${plan.summary.documents}; LAR mutations=${plan.summary.libraryAnalysisRecords}; direct LAR inventory=${plan.summary.directLibraryAnalysisRecords}; pending=${plan.summary.pendingTargets}; applied=${plan.summary.appliedTargets}; conflicts=${plan.summary.conflicts}`,
  );
  console.log(
    `Dependency SHA-256: ${plan.dependencySha256}; preserved dependency SHA-256: ${plan.preservedDependencySha256}`,
  );
  console.log(`Dependency counts: ${JSON.stringify(plan.dependencyCounts)}`);
  console.log(
    "Boundary: no DOI SourceCitation/FieldCitation creation and no Thesis mutation in this batch",
  );
  for (const target of plan.targets) {
    console.log(
      `${target.thesisId}: citation=${target.citationState}; document=${target.documentState}; library=${target.libraryAnalysisState}; citationId=${target.sourceCitationId ?? "missing"}; documentId=${target.documentId ?? "null"}`,
    );
  }
  for (const item of plan.conflicts) {
    console.log(`Conflict ${item.code} ${item.subject}: ${item.detail}`);
  }
}

function isConcurrentWriteConflict(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /P2034|serialize|serialization|deadlock|concurrent|changed after planning/i.test(
    message,
  );
}

async function main() {
  const args = parseReviewedThesisMirrorArgs(process.argv.slice(2));
  if (
    args.apply &&
    args.ack !== REVIEWED_THESIS_MIRROR_RECONCILIATION_APPLY_ACK
  ) {
    throw new Error(
      `--apply requires --ack=${REVIEWED_THESIS_MIRROR_RECONCILIATION_APPLY_ACK}`,
    );
  }
  if (args.apply && !/^[a-f0-9]{64}$/.test(args.expectedPlanSha256 ?? "")) {
    throw new Error("--apply requires the exact --plan-sha256=<64 lowercase hex> from a reviewed dry run");
  }
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
  try {
    const inspection = await inspectReviewedThesisMirrorDatabaseState(prisma);
    const digest = reviewedThesisMirrorPlanSha256(inspection);
    printPlan(inspection, digest);
    if (inspection.plan.atomicState === "conflict") {
      throw new Error("Reviewed Thesis mirror conflicts or hybrid state detected; refusing mutation");
    }
    if (!args.apply) {
      console.log(
        `Dry run only. After review, re-run with --apply --ack=${REVIEWED_THESIS_MIRROR_RECONCILIATION_APPLY_ACK} --plan-sha256=${digest}`,
      );
      return;
    }
    if (digest !== args.expectedPlanSha256) {
      throw new Error("Current reviewed Thesis mirror plan differs from --plan-sha256; rerun dry-run");
    }
    const result = await prisma.$transaction(
      async (transaction) => {
        await transaction.$executeRaw`
          SELECT pg_advisory_xact_lock(hashtext(${REVIEWED_THESIS_MIRROR_RECONCILIATION_ADVISORY_LOCK_KEY}))
        `;
        await lockReviewedThesisMirrorState(transaction, inspection);
        const locked = await inspectReviewedThesisMirrorDatabaseState(transaction);
        const lockedDigest = reviewedThesisMirrorPlanSha256(locked);
        if (
          locked.plan.atomicState === "conflict" ||
          lockedDigest !== args.expectedPlanSha256
        ) {
          throw new Error("Locked reviewed Thesis mirror plan changed after planning; no rows updated");
        }
        const mutationCounts =
          locked.plan.atomicState === "all_before"
            ? await applyReviewedThesisMirrorUpdates(transaction, locked)
            : { citations: 0, documents: 0, libraryAnalysisRecords: 0 };
        const after = await inspectReviewedThesisMirrorDatabaseState(transaction);
        assertReviewedThesisMirrorPostApply(locked, after);
        return mutationCounts;
      },
      { isolationLevel: "Serializable" },
    );
    console.log(
      `Reviewed Thesis mirrors reconciled: ${result.citations} SourceCitation, ${result.documents} Document, ${result.libraryAnalysisRecords} LibraryAnalysisRecord row(s)`,
    );
  } catch (error) {
    if (args.apply && isConcurrentWriteConflict(error)) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(
        "Reviewed Thesis mirror reconciliation conflicted with a concurrent write; the Serializable transaction rolled back and zero rows were committed. " +
          `Cause: ${detail}. Rerun dry-run.`,
        { cause: error },
      );
    }
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  void main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
