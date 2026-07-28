import "dotenv/config";
import { pathToFileURL } from "node:url";
import { Prisma, PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  REVIEWED_THESIS_BIBLIOGRAPHIC_MANIFEST_SHA256,
  REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIR_TARGET_COUNT,
  REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS,
  REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIR_VERSION,
  buildReviewedThesisBibliographicRepairPlan,
  canonicalizeReviewedThesisBibliographicJson,
  sha256ReviewedThesisBibliographicJson,
  type ReviewedThesisBibliographicRepairPlan,
  type ReviewedThesisBibliographicUpdate,
  type ThesisBibliographicPortableSnapshot,
} from "../src/lib/citations/reviewed-thesis-bibliographic-repair";

export const REVIEWED_THESIS_BIBLIOGRAPHIC_APPLY_ACK =
  "APPLY_REVIEWED_THESIS_BIBLIOGRAPHY_9";
export const REVIEWED_THESIS_BIBLIOGRAPHIC_ADVISORY_LOCK_KEY =
  "foodsystems:reviewed-thesis-bibliography:2026-07-20:v1";

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

export type ReviewedThesisBibliographicDatabaseRow = Prisma.ThesisGetPayload<{
  select: typeof thesisSelect;
}>;

type ReviewedThesisBibliographicClient = Pick<
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
>;

export type ReviewedThesisBibliographicDatabaseIdentity = {
  currentDatabase: string;
  databaseIdentityUuid: string;
};

export type ReviewedThesisBibliographicAtomicState =
  | "all_before"
  | "all_after"
  | "conflict";

export type ReviewedThesisBibliographicTargetBinding = {
  thesisId: string;
  rowPresent: boolean;
  documentId: string | null;
};

export type ReviewedThesisBibliographicDatabasePlanRow = {
  id: string;
  status: "pending" | "applied" | "conflict";
  documentId: string | null;
  mutatedFields: readonly string[];
  beforeFullDatabaseRowSha256: string | null;
  currentFullDatabaseRowSha256: string | null;
  afterFullDatabaseRowSha256: string | null;
};

export type ReviewedThesisBibliographicDatabaseConflict = {
  id: string;
  reason: string;
};

export type ReviewedThesisBibliographicDependencyCounts = {
  documents: number;
  sourceCitations: number;
  fieldCitations: number;
  libraryAnalysisRecords: number;
  evidenceAppraisals: number;
  documentRefs: number;
  insightDocumentRefs: number;
  companyDocumentRefs: number;
  actorDocumentRefs: number;
};

export type ReviewedThesisBibliographicDependencyIds = {
  documents: string[];
  sourceCitations: string[];
  fieldCitations: string[];
  libraryAnalysisRecords: string[];
  evidenceAppraisals: string[];
  documentRefs: string[];
  insightDocumentRefs: string[];
  companyDocumentRefs: string[];
  actorDocumentRefs: string[];
};

export type ReviewedThesisBibliographicDependencyCollections = {
  documents: ReadonlyArray<Record<string, unknown>>;
  sourceCitations: ReadonlyArray<Record<string, unknown>>;
  fieldCitations: ReadonlyArray<Record<string, unknown>>;
  libraryAnalysisRecords: ReadonlyArray<Record<string, unknown>>;
  evidenceAppraisals: ReadonlyArray<Record<string, unknown>>;
  documentRefs: ReadonlyArray<Record<string, unknown>>;
  insightDocumentRefs: ReadonlyArray<Record<string, unknown>>;
  companyDocumentRefs: ReadonlyArray<Record<string, unknown>>;
  actorDocumentRefs: ReadonlyArray<Record<string, unknown>>;
};

export type ReviewedThesisBibliographicDependencyInspection = {
  snapshot: unknown;
  sha256: string;
  counts: ReviewedThesisBibliographicDependencyCounts;
  ids: ReviewedThesisBibliographicDependencyIds;
};

export type ReviewedThesisBibliographicDatabasePlan = {
  version: typeof REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIR_VERSION;
  databaseIdentity: ReviewedThesisBibliographicDatabaseIdentity;
  manifestSha256: string;
  atomicState: ReviewedThesisBibliographicAtomicState;
  targetDocumentBindings: ReviewedThesisBibliographicTargetBinding[];
  targetStateSha256: string;
  dependencySha256: string;
  dependencyCounts: ReviewedThesisBibliographicDependencyCounts;
  rows: ReviewedThesisBibliographicDatabasePlanRow[];
  conflicts: ReviewedThesisBibliographicDatabaseConflict[];
  summary: {
    total: number;
    pending: number;
    applied: number;
    conflicts: number;
  };
};

export type ReviewedThesisBibliographicDatabaseInspection = {
  plan: ReviewedThesisBibliographicDatabasePlan;
  dependencySnapshot: unknown;
  dependencyIds: ReviewedThesisBibliographicDependencyIds;
  thesisRows: ReviewedThesisBibliographicDatabaseRow[];
  purePlan: ReviewedThesisBibliographicRepairPlan;
};

export type ReviewedThesisBibliographicArgs = {
  apply: boolean;
  ack: string | undefined;
  expectedPlanSha256: string | undefined;
};

const dependencyCollectionNames = [
  "documents",
  "sourceCitations",
  "fieldCitations",
  "libraryAnalysisRecords",
  "evidenceAppraisals",
  "documentRefs",
  "insightDocumentRefs",
  "companyDocumentRefs",
  "actorDocumentRefs",
] as const satisfies readonly (keyof ReviewedThesisBibliographicDependencyCollections)[];

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

/** Converts database-only values (notably Date) into stable JSON values. */
export function normalizeReviewedThesisBibliographicDatabaseValue(
  value: unknown,
): unknown {
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) {
    return value.map(normalizeReviewedThesisBibliographicDatabaseValue);
  }
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, entry]) => [
        key,
        normalizeReviewedThesisBibliographicDatabaseValue(entry),
      ]),
    );
  }
  return value;
}

function rowId(row: Record<string, unknown>, collection: string) {
  if (typeof row.id !== "string" || row.id.length === 0) {
    throw new Error(
      `Reviewed Thesis bibliographic ${collection} dependency lacks a stable id`,
    );
  }
  return row.id;
}

/** Pure, deterministic dependency snapshot used by both inspection and tests. */
export function buildReviewedThesisBibliographicDependencySnapshot(
  collections: ReviewedThesisBibliographicDependencyCollections,
): ReviewedThesisBibliographicDependencyInspection {
  const normalizedEntries = dependencyCollectionNames.map((name) => {
    const rows = collections[name]
      .map((row) =>
        normalizeReviewedThesisBibliographicDatabaseValue(row),
      )
      .map((row) => row as Record<string, unknown>)
      .sort((left, right) =>
        compareIds(rowId(left, name), rowId(right, name)),
      );
    return [name, rows] as const;
  });
  const normalized = Object.fromEntries(normalizedEntries) as Record<
    (typeof dependencyCollectionNames)[number],
    Array<Record<string, unknown>>
  >;
  const snapshot = canonicalizeReviewedThesisBibliographicJson({
    dependencyContract: "reviewed-thesis-bibliography-v1",
    ...normalized,
  });
  const counts = Object.fromEntries(
    dependencyCollectionNames.map((name) => [name, normalized[name].length]),
  ) as ReviewedThesisBibliographicDependencyCounts;
  const ids = Object.fromEntries(
    dependencyCollectionNames.map((name) => [
      name,
      normalized[name].map((row) => rowId(row, name)),
    ]),
  ) as ReviewedThesisBibliographicDependencyIds;
  return {
    snapshot,
    sha256: sha256ReviewedThesisBibliographicJson(snapshot),
    counts,
    ids,
  };
}

export function classifyReviewedThesisBibliographicAtomicState(
  plan: ReviewedThesisBibliographicRepairPlan,
): ReviewedThesisBibliographicAtomicState {
  if (plan.conflicts.length > 0) return "conflict";
  if (
    plan.summary.pending === REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIR_TARGET_COUNT &&
    plan.summary.alreadyApplied === 0
  ) {
    return "all_before";
  }
  if (
    plan.summary.pending === 0 &&
    plan.summary.alreadyApplied ===
      REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIR_TARGET_COUNT
  ) {
    return "all_after";
  }
  return "conflict";
}

export function normalizeReviewedThesisBibliographicDatabaseRow(
  row: ReviewedThesisBibliographicDatabaseRow,
): ReviewedThesisBibliographicDatabaseRow {
  return {
    id: row.id,
    authors: row.authors,
    institution: row.institution,
    year: row.year,
    title: row.title,
    titleNo: row.titleNo,
    url: row.url,
    synthesis: row.synthesis,
    keyFindings: [...row.keyFindings],
    tags: [...row.tags],
    takeaways: [...row.takeaways],
    method: row.method,
    awardWinning: row.awardWinning,
    degree: row.degree,
    doi: row.doi,
    isbn: row.isbn,
    publisher: row.publisher,
    accessDate: row.accessDate,
    documentId: row.documentId,
  };
}

export function databaseRowToPortableThesisBibliography(
  row: ReviewedThesisBibliographicDatabaseRow,
): ThesisBibliographicPortableSnapshot {
  return {
    id: row.id,
    authors: row.authors,
    institution: row.institution,
    year: row.year,
    title: row.title,
    titleNo: row.titleNo,
    url: row.url,
    synthesis: row.synthesis,
    keyFindings: [...row.keyFindings],
    tags: [...row.tags] as ThesisBibliographicPortableSnapshot["tags"],
    takeaways: [...row.takeaways],
    method: row.method,
    awardWinning: row.awardWinning,
    degree: row.degree as ThesisBibliographicPortableSnapshot["degree"],
    doi: row.doi,
    isbn: row.isbn,
    publisher: row.publisher,
    accessDate: row.accessDate,
    provenanceType: null,
  };
}

export function portableThesisBibliographyToDatabaseRow(
  row: ThesisBibliographicPortableSnapshot,
  documentId: string | null,
): ReviewedThesisBibliographicDatabaseRow {
  return {
    id: row.id,
    authors: row.authors,
    institution: row.institution,
    year: row.year,
    title: row.title,
    titleNo: row.titleNo,
    url: row.url,
    synthesis: row.synthesis,
    keyFindings: [...row.keyFindings],
    tags: [...row.tags],
    takeaways: [...row.takeaways],
    method: row.method,
    awardWinning: row.awardWinning,
    degree: row.degree,
    doi: row.doi,
    isbn: row.isbn,
    publisher: row.publisher,
    accessDate: row.accessDate,
    documentId,
  };
}

export function fullReviewedThesisBibliographicSnapshotWhere(
  row: ReviewedThesisBibliographicDatabaseRow,
): Prisma.ThesisWhereInput {
  return {
    id: row.id,
    authors: row.authors,
    institution: row.institution,
    year: row.year,
    title: row.title,
    titleNo: row.titleNo,
    url: row.url,
    synthesis: row.synthesis,
    keyFindings: { equals: row.keyFindings },
    tags: { equals: row.tags },
    takeaways: { equals: row.takeaways },
    method: row.method,
    awardWinning: row.awardWinning,
    degree: row.degree,
    doi: row.doi,
    isbn: row.isbn,
    publisher: row.publisher,
    accessDate: row.accessDate,
    documentId: row.documentId,
  };
}

export function reviewedThesisBibliographicUpdateData(
  update: ReviewedThesisBibliographicUpdate,
): Prisma.ThesisUpdateManyMutationInput {
  const data: Prisma.ThesisUpdateManyMutationInput = {};
  for (const field of update.mutatedFields) {
    switch (field) {
      case "authors":
        data.authors = update.after.authors;
        break;
      case "institution":
        data.institution = update.after.institution;
        break;
      case "year":
        data.year = update.after.year;
        break;
      case "title":
        data.title = update.after.title;
        break;
      case "url":
        data.url = update.after.url;
        break;
      case "doi":
        data.doi = update.after.doi;
        break;
      case "isbn":
        data.isbn = update.after.isbn;
        break;
      case "publisher":
        data.publisher = update.after.publisher;
        break;
      default: {
        const exhaustive: never = field;
        throw new Error(
          `Unsupported reviewed Thesis bibliographic mutation: ${exhaustive}`,
        );
      }
    }
  }
  return data;
}

export function parseReviewedThesisBibliographicArgs(
  argv: readonly string[],
): ReviewedThesisBibliographicArgs {
  let apply = false;
  let dryRun = false;
  let ack: string | undefined;
  let expectedPlanSha256: string | undefined;

  for (const argument of argv) {
    if (argument === "--apply") {
      if (apply) throw new Error("--apply must not be repeated");
      apply = true;
      continue;
    }
    if (argument === "--dry-run") {
      if (dryRun) throw new Error("--dry-run must not be repeated");
      dryRun = true;
      continue;
    }
    if (argument.startsWith("--ack=")) {
      if (ack !== undefined) throw new Error("--ack must not be repeated");
      ack = argument.slice("--ack=".length);
      continue;
    }
    if (argument.startsWith("--plan-sha256=")) {
      if (expectedPlanSha256 !== undefined) {
        throw new Error("--plan-sha256 must not be repeated");
      }
      expectedPlanSha256 = argument.slice("--plan-sha256=".length);
      continue;
    }
    throw new Error(`Unknown reviewed Thesis bibliographic argument: ${argument}`);
  }

  if (apply && dryRun) {
    throw new Error("--apply and --dry-run are mutually exclusive");
  }
  if (!apply && (ack !== undefined || expectedPlanSha256 !== undefined)) {
    throw new Error("--ack and --plan-sha256 are valid only with --apply");
  }
  return { apply, ack, expectedPlanSha256 };
}

async function inspectDatabaseIdentity(
  client: Pick<Prisma.TransactionClient, "$queryRaw">,
): Promise<ReviewedThesisBibliographicDatabaseIdentity> {
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
    throw new Error(
      "Reviewed Thesis bibliographic repair requires DatabaseIdentity metadata",
    );
  }

  const identityRows = await client.$queryRaw<Array<{ identityUuid: string }>>(
    Prisma.sql`
      SELECT "identityUuid"::text AS "identityUuid"
      FROM "DatabaseIdentity"
      WHERE "key" = 'primary'
      ORDER BY "key"
    `,
  );
  const databaseIdentityUuid = identityRows[0]?.identityUuid?.toLowerCase();
  if (
    identityRows.length !== 1 ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(
      databaseIdentityUuid ?? "",
    )
  ) {
    throw new Error(
      "Reviewed Thesis bibliographic repair requires exactly one valid primary DatabaseIdentity UUID",
    );
  }
  return {
    currentDatabase: tableRows[0].currentDatabase,
    databaseIdentityUuid: databaseIdentityUuid!,
  };
}

async function inspectDependencies(
  client: ReviewedThesisBibliographicClient,
  thesisIds: readonly string[],
  documentIds: readonly string[],
): Promise<ReviewedThesisBibliographicDependencyInspection> {
  const thesisSourceKeys = thesisIds.map((id) => `thesis:${id}`);
  const [documents, sourceCitations, libraryAnalysisRecords, documentRefs, insightDocumentRefs, companyDocumentRefs, actorDocumentRefs] =
    await Promise.all([
      client.document.findMany({
        where: { id: { in: [...documentIds] } },
        select: documentSelect,
        orderBy: { id: "asc" },
      }),
      client.sourceCitation.findMany({
        where: {
          OR: [
            { documentId: { in: [...documentIds] } },
            {
              fieldCitations: {
                some: {
                  entityType: "Thesis",
                  entityId: { in: [...thesisIds] },
                },
              },
            },
          ],
        },
        select: sourceCitationSelect,
        orderBy: { id: "asc" },
      }),
      client.libraryAnalysisRecord.findMany({
        where: {
          OR: [
            { documentId: { in: [...documentIds] } },
            {
              sourceKind: "thesis",
              sourceKey: { in: thesisSourceKeys },
            },
          ],
        },
        select: libraryAnalysisRecordSelect,
        orderBy: { id: "asc" },
      }),
      client.documentRef.findMany({
        where: {
          OR: [
            { fromId: { in: [...documentIds] } },
            { toId: { in: [...documentIds] } },
          ],
        },
        select: documentRefSelect,
        orderBy: { id: "asc" },
      }),
      client.insightDocumentRef.findMany({
        where: { documentId: { in: [...documentIds] } },
        select: insightDocumentRefSelect,
        orderBy: { id: "asc" },
      }),
      client.companyDocumentRef.findMany({
        where: { documentId: { in: [...documentIds] } },
        select: companyDocumentRefSelect,
        orderBy: { id: "asc" },
      }),
      client.actorDocumentRef.findMany({
        where: { documentId: { in: [...documentIds] } },
        select: actorDocumentRefSelect,
        orderBy: { id: "asc" },
      }),
    ]);

  const citationIds = sourceCitations.map((row) => row.id);
  const [fieldCitations, evidenceAppraisals] = await Promise.all([
    client.fieldCitation.findMany({
      where: {
        OR: [
          { citationId: { in: citationIds } },
          { entityType: "Thesis", entityId: { in: [...thesisIds] } },
        ],
      },
      select: fieldCitationSelect,
      orderBy: { id: "asc" },
    }),
    client.evidenceAppraisal.findMany({
      where: {
        OR: [
          { thesisId: { in: [...thesisIds] } },
          { reviewBasisCitationId: { in: citationIds } },
        ],
      },
      select: evidenceAppraisalSelect,
      orderBy: { id: "asc" },
    }),
  ]);

  return buildReviewedThesisBibliographicDependencySnapshot({
    documents,
    sourceCitations,
    fieldCitations,
    libraryAnalysisRecords,
    evidenceAppraisals,
    documentRefs,
    insightDocumentRefs,
    companyDocumentRefs,
    actorDocumentRefs,
  });
}

function repairById() {
  return new Map(
    REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS.map((repair) => [repair.id, repair]),
  );
}

export async function inspectReviewedThesisBibliographicDatabaseState(
  client: ReviewedThesisBibliographicClient,
): Promise<ReviewedThesisBibliographicDatabaseInspection> {
  const targetIds = REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS.map(
    (repair) => repair.id,
  );
  const [databaseIdentity, rawRows] = await Promise.all([
    inspectDatabaseIdentity(client),
    client.thesis.findMany({
      where: { id: { in: targetIds } },
      select: thesisSelect,
      orderBy: { id: "asc" },
    }),
  ]);
  const thesisRows = rawRows.map(normalizeReviewedThesisBibliographicDatabaseRow);
  const rowsById = new Map(thesisRows.map((row) => [row.id, row]));
  const purePlan = buildReviewedThesisBibliographicRepairPlan(
    thesisRows.map(databaseRowToPortableThesisBibliography),
  );
  const atomicState = classifyReviewedThesisBibliographicAtomicState(purePlan);
  const targetDocumentBindings = [...targetIds]
    .sort(compareIds)
    .map((thesisId) => ({
      thesisId,
      rowPresent: rowsById.has(thesisId),
      documentId: rowsById.get(thesisId)?.documentId ?? null,
    }));
  const documentIds = sortedUnique(
    targetDocumentBindings.map((binding) => binding.documentId),
  );
  const dependencies = await inspectDependencies(client, targetIds, documentIds);
  const pureUpdatesById = new Map(
    purePlan.updates.map((update) => [update.id, update]),
  );
  const appliedIds = new Set(purePlan.alreadyAppliedIds);
  const conflicts: ReviewedThesisBibliographicDatabaseConflict[] =
    purePlan.conflicts.map((conflict) => ({
      id: conflict.id,
      reason: `${conflict.code}:${conflict.detail}`,
    }));
  if (atomicState === "conflict" && purePlan.conflicts.length === 0) {
    conflicts.push({
      id: "Batch",
      reason:
        "atomic_hybrid: the nine reviewed Thesis rows must be all-before or all-after, never a partial mixture",
    });
  }

  const repairsById = repairById();
  const planRows = [...targetIds].sort(compareIds).map((id) => {
    const repair = repairsById.get(id)!;
    const current = rowsById.get(id);
    const documentId = current?.documentId ?? null;
    const before = current
      ? portableThesisBibliographyToDatabaseRow(repair.before, documentId)
      : null;
    const after = current
      ? portableThesisBibliographyToDatabaseRow(repair.after, documentId)
      : null;
    const status = pureUpdatesById.has(id)
      ? "pending"
      : appliedIds.has(id)
        ? "applied"
        : "conflict";
    return {
      id,
      status,
      documentId,
      mutatedFields: repair.mutatedFields,
      beforeFullDatabaseRowSha256: before
        ? sha256ReviewedThesisBibliographicJson(before)
        : null,
      currentFullDatabaseRowSha256: current
        ? sha256ReviewedThesisBibliographicJson(current)
        : null,
      afterFullDatabaseRowSha256: after
        ? sha256ReviewedThesisBibliographicJson(after)
        : null,
    } satisfies ReviewedThesisBibliographicDatabasePlanRow;
  });
  const targetStateSha256 = sha256ReviewedThesisBibliographicJson(thesisRows);
  const plan: ReviewedThesisBibliographicDatabasePlan = {
    version: REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIR_VERSION,
    databaseIdentity,
    manifestSha256: REVIEWED_THESIS_BIBLIOGRAPHIC_MANIFEST_SHA256,
    atomicState,
    targetDocumentBindings,
    targetStateSha256,
    dependencySha256: dependencies.sha256,
    dependencyCounts: dependencies.counts,
    rows: planRows,
    conflicts,
    summary: {
      total: REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIR_TARGET_COUNT,
      pending: purePlan.summary.pending,
      applied: purePlan.summary.alreadyApplied,
      conflicts: conflicts.length,
    },
  };
  return {
    plan,
    dependencySnapshot: dependencies.snapshot,
    dependencyIds: dependencies.ids,
    thesisRows,
    purePlan,
  };
}

export function reviewedThesisBibliographicDatabasePlanContract(
  plan: ReviewedThesisBibliographicDatabasePlan,
) {
  return {
    version: plan.version,
    databaseIdentity: plan.databaseIdentity,
    manifestSha256: plan.manifestSha256,
    atomicState: plan.atomicState,
    targetDocumentBindings: plan.targetDocumentBindings,
    targetStateSha256: plan.targetStateSha256,
    dependencySha256: plan.dependencySha256,
    dependencyCounts: plan.dependencyCounts,
    rows: plan.rows,
    conflicts: plan.conflicts,
    summary: plan.summary,
  };
}

export function reviewedThesisBibliographicDatabasePlanSha256(
  plan: ReviewedThesisBibliographicDatabasePlan,
) {
  return sha256ReviewedThesisBibliographicJson(
    reviewedThesisBibliographicDatabasePlanContract(plan),
  );
}

function printPlan(
  plan: ReviewedThesisBibliographicDatabasePlan,
  digest: string,
) {
  console.log("Reviewed Thesis bibliographic database repair plan");
  console.log(`Plan SHA-256: ${digest}`);
  console.log(`Manifest SHA-256: ${plan.manifestSha256}`);
  console.log(
    `Database: ${plan.databaseIdentity.currentDatabase}; identity UUID: ${plan.databaseIdentity.databaseIdentityUuid}`,
  );
  console.log(
    `Atomic state: ${plan.atomicState}; rows: ${plan.summary.total}; pending: ${plan.summary.pending}; applied: ${plan.summary.applied}; conflicts: ${plan.summary.conflicts}`,
  );
  console.log(
    `Target state SHA-256: ${plan.targetStateSha256}; dependency SHA-256: ${plan.dependencySha256}`,
  );
  console.log(`Dependency counts: ${JSON.stringify(plan.dependencyCounts)}`);
  for (const row of plan.rows) {
    console.log(
      `${row.status} Thesis:${row.id}; documentId=${row.documentId ?? "null"}; fields=${row.mutatedFields.join(",")}; current=${row.currentFullDatabaseRowSha256 ?? "missing"}; target=${row.afterFullDatabaseRowSha256 ?? "missing"}`,
    );
  }
  for (const conflict of plan.conflicts) {
    console.log(`Conflict ${conflict.id}: ${conflict.reason}`);
  }
}

async function findCasPreflightMismatches(
  client: ReviewedThesisBibliographicClient,
  inspection: ReviewedThesisBibliographicDatabaseInspection,
) {
  const rowsById = new Map(inspection.thesisRows.map((row) => [row.id, row]));
  const checks = await Promise.all(
    inspection.purePlan.updates.map(async (update) => {
      const row = rowsById.get(update.id);
      return {
        id: update.id,
        count: row
          ? await client.thesis.count({
              where: fullReviewedThesisBibliographicSnapshotWhere(row),
            })
          : 0,
      };
    }),
  );
  return checks.filter((check) => check.count !== 1);
}

function exactIds(actual: readonly string[], expected: readonly string[]) {
  return (
    JSON.stringify([...actual].sort(compareIds)) ===
    JSON.stringify([...expected].sort(compareIds))
  );
}

async function lockTargetThesesForUpdate(
  transaction: Prisma.TransactionClient,
) {
  const ids = REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIRS.map(
    (repair) => repair.id,
  );
  const locked = await transaction.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT "id" FROM "Thesis"
    WHERE "id" IN (${Prisma.join(ids)})
    ORDER BY "id" FOR UPDATE
  `);
  if (!exactIds(locked.map((row) => row.id), ids)) {
    throw new Error(
      "Reviewed Thesis bibliographic targets changed after planning; no rows updated",
    );
  }
}

type DependencyTable =
  | "Document"
  | "SourceCitation"
  | "FieldCitation"
  | "LibraryAnalysisRecord"
  | "EvidenceAppraisal"
  | "DocumentRef"
  | "InsightDocumentRef"
  | "CompanyDocumentRef"
  | "ActorDocumentRef";

async function lockDependencyIdsForShare(
  transaction: Prisma.TransactionClient,
  table: DependencyTable,
  ids: readonly string[],
) {
  if (ids.length === 0) return;
  const locked = await transaction.$queryRaw<Array<{ id: string }>>(
    Prisma.sql`
      SELECT "id" FROM ${Prisma.raw(`"${table}"`)}
      WHERE "id" IN (${Prisma.join([...ids])})
      ORDER BY "id" FOR SHARE
    `,
  );
  if (!exactIds(locked.map((row) => row.id), ids)) {
    throw new Error(
      `Reviewed Thesis bibliographic dependency ${table} changed after planning; no rows updated`,
    );
  }
}

async function lockDependenciesForShare(
  transaction: Prisma.TransactionClient,
  inspection: ReviewedThesisBibliographicDatabaseInspection,
) {
  const identity = await transaction.$queryRaw<
    Array<{ identityUuid: string }>
  >(Prisma.sql`
    SELECT "identityUuid"::text AS "identityUuid"
    FROM "DatabaseIdentity"
    WHERE "key" = 'primary'
    ORDER BY "key" FOR SHARE
  `);
  if (
    identity.length !== 1 ||
    identity[0]?.identityUuid.toLowerCase() !==
      inspection.plan.databaseIdentity.databaseIdentityUuid
  ) {
    throw new Error(
      "Reviewed Thesis bibliographic DatabaseIdentity changed after planning; no rows updated",
    );
  }

  const ids = inspection.dependencyIds;
  await lockDependencyIdsForShare(transaction, "Document", ids.documents);
  await lockDependencyIdsForShare(
    transaction,
    "SourceCitation",
    ids.sourceCitations,
  );
  await lockDependencyIdsForShare(
    transaction,
    "FieldCitation",
    ids.fieldCitations,
  );
  await lockDependencyIdsForShare(
    transaction,
    "LibraryAnalysisRecord",
    ids.libraryAnalysisRecords,
  );
  await lockDependencyIdsForShare(
    transaction,
    "EvidenceAppraisal",
    ids.evidenceAppraisals,
  );
  await lockDependencyIdsForShare(transaction, "DocumentRef", ids.documentRefs);
  await lockDependencyIdsForShare(
    transaction,
    "InsightDocumentRef",
    ids.insightDocumentRefs,
  );
  await lockDependencyIdsForShare(
    transaction,
    "CompanyDocumentRef",
    ids.companyDocumentRefs,
  );
  await lockDependencyIdsForShare(
    transaction,
    "ActorDocumentRef",
    ids.actorDocumentRefs,
  );
}

async function applyUpdate(
  transaction: Prisma.TransactionClient,
  update: ReviewedThesisBibliographicUpdate,
  documentId: string | null,
) {
  const before = portableThesisBibliographyToDatabaseRow(
    update.before,
    documentId,
  );
  const result = await transaction.thesis.updateMany({
    where: fullReviewedThesisBibliographicSnapshotWhere(before),
    data: reviewedThesisBibliographicUpdateData(update),
  });
  if (result.count !== 1) {
    throw new Error(
      `Concurrent full-row Thesis bibliographic CAS conflict: ${update.id}; no rows updated`,
    );
  }
}

function bindingsEqual(
  left: readonly ReviewedThesisBibliographicTargetBinding[],
  right: readonly ReviewedThesisBibliographicTargetBinding[],
) {
  return (
    sha256ReviewedThesisBibliographicJson(left) ===
    sha256ReviewedThesisBibliographicJson(right)
  );
}

function isConcurrentWriteConflict(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /P2034|serialize|serialization|deadlock|concurrent|changed after planning/i.test(
    message,
  );
}

async function main() {
  const args = parseReviewedThesisBibliographicArgs(process.argv.slice(2));
  if (args.apply && args.ack !== REVIEWED_THESIS_BIBLIOGRAPHIC_APPLY_ACK) {
    throw new Error(
      `--apply requires --ack=${REVIEWED_THESIS_BIBLIOGRAPHIC_APPLY_ACK}`,
    );
  }
  if (
    args.apply &&
    !/^[a-f0-9]{64}$/.test(args.expectedPlanSha256 ?? "")
  ) {
    throw new Error(
      "--apply requires the exact --plan-sha256=<64 lowercase hex> emitted by a reviewed dry run",
    );
  }
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  });
  try {
    const inspection = await inspectReviewedThesisBibliographicDatabaseState(
      prisma,
    );
    const digest = reviewedThesisBibliographicDatabasePlanSha256(
      inspection.plan,
    );
    printPlan(inspection.plan, digest);
    if (
      inspection.plan.atomicState === "conflict" ||
      inspection.plan.conflicts.length > 0
    ) {
      throw new Error(
        "Reviewed Thesis bibliographic conflicts or hybrid state detected; refusing mutation",
      );
    }

    const preflightMismatches = await findCasPreflightMismatches(
      prisma,
      inspection,
    );
    if (preflightMismatches.length > 0) {
      throw new Error(
        `Reviewed Thesis bibliographic full-row CAS preflight mismatch: ${preflightMismatches
          .map((row) => row.id)
          .join(", ")}`,
      );
    }
    console.log(
      `Full-row CAS preflight: ${inspection.purePlan.updates.length}/${inspection.purePlan.updates.length} exact pending Thesis snapshots matched`,
    );

    if (!args.apply) {
      console.log(
        `Dry run only. After review, re-run with --apply --ack=${REVIEWED_THESIS_BIBLIOGRAPHIC_APPLY_ACK} --plan-sha256=${digest}`,
      );
      return;
    }
    if (digest !== args.expectedPlanSha256) {
      throw new Error(
        "Current reviewed Thesis bibliographic plan differs from --plan-sha256; rerun dry-run",
      );
    }

    const applied = await prisma.$transaction(
      async (transaction) => {
        await transaction.$executeRaw`
          SELECT pg_advisory_xact_lock(hashtext(${REVIEWED_THESIS_BIBLIOGRAPHIC_ADVISORY_LOCK_KEY}))
        `;
        await lockTargetThesesForUpdate(transaction);
        await lockDependenciesForShare(transaction, inspection);

        const locked =
          await inspectReviewedThesisBibliographicDatabaseState(transaction);
        const lockedDigest = reviewedThesisBibliographicDatabasePlanSha256(
          locked.plan,
        );
        if (
          locked.plan.atomicState === "conflict" ||
          locked.plan.conflicts.length > 0 ||
          lockedDigest !== args.expectedPlanSha256
        ) {
          throw new Error(
            "Locked reviewed Thesis bibliographic plan changed after planning; no rows updated",
          );
        }

        const bindingById = new Map(
          locked.plan.targetDocumentBindings.map((binding) => [
            binding.thesisId,
            binding.documentId,
          ]),
        );
        for (const update of locked.purePlan.updates) {
          await applyUpdate(
            transaction,
            update,
            bindingById.get(update.id) ?? null,
          );
        }

        const after =
          await inspectReviewedThesisBibliographicDatabaseState(transaction);
        if (
          after.plan.atomicState !== "all_after" ||
          after.plan.conflicts.length > 0 ||
          after.plan.summary.pending !== 0 ||
          after.plan.summary.applied !==
            REVIEWED_THESIS_BIBLIOGRAPHIC_REPAIR_TARGET_COUNT ||
          after.plan.databaseIdentity.databaseIdentityUuid !==
            locked.plan.databaseIdentity.databaseIdentityUuid ||
          after.plan.databaseIdentity.currentDatabase !==
            locked.plan.databaseIdentity.currentDatabase ||
          after.plan.dependencySha256 !== locked.plan.dependencySha256 ||
          !bindingsEqual(
            after.plan.targetDocumentBindings,
            locked.plan.targetDocumentBindings,
          )
        ) {
          throw new Error(
            "Post-apply idempotence, identity, binding, or dependency check failed; no rows updated",
          );
        }
        return locked.purePlan.updates.length;
      },
      { isolationLevel: "Serializable" },
    );
    console.log(
      `Reviewed Thesis bibliographic repair applied: ${applied} Thesis row(s); dependency hash unchanged`,
    );
  } catch (error) {
    if (args.apply && isConcurrentWriteConflict(error)) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(
        "Reviewed Thesis bibliographic repair conflicted with a concurrent write; the Serializable transaction rolled back and zero rows were committed. " +
          `Cause: ${detail}. Rerun dry-run.`,
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
        : "Reviewed Thesis bibliographic repair failed",
    );
    process.exitCode = 1;
  });
}
