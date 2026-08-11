import "dotenv/config";
import { pathToFileURL } from "node:url";
import { Prisma, PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_IDS,
  REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_MANIFEST_SHA256,
  REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_VERSION,
  REVIEWED_SOURCE_DOC_IDENTITY_REPAIRS,
  canonicalizeReviewedSourceDocIdentityJson,
  sha256ReviewedSourceDocIdentityJson,
  type PortableSourceDocIdentitySnapshot,
  type ReviewedSourceDocIdentityMutableField,
  type ReviewedSourceDocIdentityRepair,
} from "../src/lib/citations/reviewed-source-doc-identity-repair";

export const REVIEWED_SOURCE_DOC_IDENTITY_DATABASE_APPLY_ACK =
  "APPLY_REVIEWED_SOURCE_DOC_IDENTITIES_3";
export const REVIEWED_SOURCE_DOC_IDENTITY_DATABASE_ADVISORY_LOCK_KEY =
  "foodsystems:reviewed-source-doc-identities:2026-07-20:v1";
export const REVIEWED_SOURCE_DOC_IDENTITY_DATABASE_PROOF_LIMITATIONS = [
  "Prisma Unsupported columns such as embedding/search_vector are outside the dependency hash",
  "static TypeScript/seed consumers outside PostgreSQL are outside the transaction",
  "bound Document and SourceCitation metadata is preserved, not synchronized",
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

export type ReviewedSourceDocIdentityDatabaseRow = Prisma.SourceDocGetPayload<{
  select: typeof sourceDocSelect;
}>;

type ReviewedSourceDocIdentityClient = Pick<
  Prisma.TransactionClient,
  | "$queryRaw"
  | "sourceDoc"
  | "document"
  | "documentRef"
  | "report"
  | "thesis"
  | "sourceCitation"
  | "fieldCitation"
  | "libraryAnalysisRecord"
  | "evidenceAppraisal"
  | "sourceRef"
  | "mediaEntry"
  | "insight"
  | "producer"
  | "opportunityEntry"
  | "insightDocumentRef"
  | "companyDocumentRef"
  | "actorDocumentRef"
>;

export type ReviewedSourceDocIdentityDatabaseIdentity = Readonly<{
  currentDatabase: string;
  key: "primary";
  identityUuid: string;
  createdAt: string;
}>;

export type ReviewedSourceDocIdentityAtomicState =
  | "all_before"
  | "all_after"
  | "conflict";

export type ReviewedSourceDocIdentityTargetBinding = Readonly<{
  sourceDocId: string;
  rowPresent: boolean;
  documentId: string | null;
}>;

type DependencyRow = Record<string, unknown>;

export type ReviewedSourceDocIdentityDependencyCollections = Readonly<{
  documents: readonly DependencyRow[];
  documentRefs: readonly DependencyRow[];
  documentSourceDocBindings: readonly DependencyRow[];
  reportDocumentConsumers: readonly DependencyRow[];
  thesisDocumentConsumers: readonly DependencyRow[];
  sourceCitations: readonly DependencyRow[];
  fieldCitations: readonly DependencyRow[];
  libraryAnalysisRecords: readonly DependencyRow[];
  evidenceAppraisals: readonly DependencyRow[];
  sourceRefs: readonly DependencyRow[];
  mediaEntries: readonly DependencyRow[];
  sourceDocInsightLinks: readonly DependencyRow[];
  insights: readonly DependencyRow[];
  producerCitationConsumers: readonly DependencyRow[];
  opportunitySourceConsumers: readonly DependencyRow[];
  insightDocumentRefs: readonly DependencyRow[];
  companyDocumentRefs: readonly DependencyRow[];
  actorDocumentRefs: readonly DependencyRow[];
}>;

const dependencyCollectionNames = [
  "documents",
  "documentRefs",
  "documentSourceDocBindings",
  "reportDocumentConsumers",
  "thesisDocumentConsumers",
  "sourceCitations",
  "fieldCitations",
  "libraryAnalysisRecords",
  "evidenceAppraisals",
  "sourceRefs",
  "mediaEntries",
  "sourceDocInsightLinks",
  "insights",
  "producerCitationConsumers",
  "opportunitySourceConsumers",
  "insightDocumentRefs",
  "companyDocumentRefs",
  "actorDocumentRefs",
] as const satisfies readonly (keyof ReviewedSourceDocIdentityDependencyCollections)[];

export type ReviewedSourceDocIdentityDependencyCounts = {
  databaseIdentity: 1;
} & Record<(typeof dependencyCollectionNames)[number], number>;

export type ReviewedSourceDocIdentityDependencyIds = Record<
  (typeof dependencyCollectionNames)[number],
  string[]
>;

export type ReviewedSourceDocIdentityDependencyInspection = Readonly<{
  snapshot: unknown;
  sha256: string;
  counts: ReviewedSourceDocIdentityDependencyCounts;
  ids: ReviewedSourceDocIdentityDependencyIds;
}>;

export type ReviewedSourceDocIdentityDatabasePlanRow = Readonly<{
  id: string;
  status: "pending" | "applied" | "conflict";
  documentId: string | null;
  mutatedFields: readonly ReviewedSourceDocIdentityMutableField[];
  beforeFullDatabaseRowSha256: string;
  currentFullDatabaseRowSha256: string | null;
  afterFullDatabaseRowSha256: string;
}>;

export type ReviewedSourceDocIdentityDatabaseConflict = Readonly<{
  id: string;
  reason: string;
}>;

export type ReviewedSourceDocIdentityDatabasePlan = Readonly<{
  version: typeof REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_VERSION;
  databaseIdentity: ReviewedSourceDocIdentityDatabaseIdentity;
  manifestSha256: string;
  atomicState: ReviewedSourceDocIdentityAtomicState;
  targetDocumentBindings: readonly ReviewedSourceDocIdentityTargetBinding[];
  targetStateSha256: string;
  dependencySha256: string;
  dependencyCounts: ReviewedSourceDocIdentityDependencyCounts;
  rows: readonly ReviewedSourceDocIdentityDatabasePlanRow[];
  conflicts: readonly ReviewedSourceDocIdentityDatabaseConflict[];
  summary: Readonly<{
    total: number;
    pending: number;
    applied: number;
    conflicts: number;
  }>;
}>;

export type ReviewedSourceDocIdentityDatabaseInspection = Readonly<{
  plan: ReviewedSourceDocIdentityDatabasePlan;
  targetRows: readonly ReviewedSourceDocIdentityDatabaseRow[];
  dependencySnapshot: unknown;
  dependencyIds: ReviewedSourceDocIdentityDependencyIds;
}>;

export type ReviewedSourceDocIdentityDatabaseArgs = Readonly<{
  apply: boolean;
  ack: string | undefined;
  expectedPlanSha256: string | undefined;
}>;

function compareIds(left: string, right: string) {
  return left.localeCompare(right, undefined, { numeric: true });
}

function sortedUnique(values: readonly (string | null | undefined)[]) {
  return [
    ...new Set(
      values.filter(
        (value): value is string => typeof value === "string" && value.length > 0,
      ),
    ),
  ].sort(compareIds);
}

function dependencyRowId(row: DependencyRow, collection: string) {
  if (typeof row.id !== "string" || row.id.length === 0) {
    throw new Error(
      `Reviewed SourceDoc identity dependency ${collection} lacks a stable id`,
    );
  }
  return row.id;
}

function asDependencyRows(rows: readonly object[]): DependencyRow[] {
  return rows as unknown as DependencyRow[];
}

/**
 * Canonicalizes every enumerated dependency row and rejects duplicate ids.
 * DatabaseIdentity is deliberately inside this snapshot as well as the plan.
 */
export function buildReviewedSourceDocIdentityDependencySnapshot(
  databaseIdentity: ReviewedSourceDocIdentityDatabaseIdentity,
  collections: ReviewedSourceDocIdentityDependencyCollections,
): ReviewedSourceDocIdentityDependencyInspection {
  const entries = dependencyCollectionNames.map((name) => {
    const rows = collections[name]
      .map((row) =>
        canonicalizeReviewedSourceDocIdentityJson(row),
      )
      .map((row) => row as DependencyRow)
      .sort((left, right) =>
        compareIds(
          dependencyRowId(left, name),
          dependencyRowId(right, name),
        ),
      );
    const ids = rows.map((row) => dependencyRowId(row, name));
    if (new Set(ids).size !== ids.length) {
      throw new Error(
        `Reviewed SourceDoc identity dependency ${name} contains duplicate ids`,
      );
    }
    return [name, rows] as const;
  });
  const normalized = Object.fromEntries(entries) as Record<
    (typeof dependencyCollectionNames)[number],
    DependencyRow[]
  >;
  const snapshot = canonicalizeReviewedSourceDocIdentityJson({
    dependencyContract: "reviewed-source-doc-identities-v1",
    databaseIdentity,
    ...normalized,
  });
  const counts = {
    databaseIdentity: 1,
    ...Object.fromEntries(
      dependencyCollectionNames.map((name) => [name, normalized[name].length]),
    ),
  } as ReviewedSourceDocIdentityDependencyCounts;
  const ids = Object.fromEntries(
    dependencyCollectionNames.map((name) => [
      name,
      normalized[name].map((row) => dependencyRowId(row, name)),
    ]),
  ) as ReviewedSourceDocIdentityDependencyIds;
  return {
    snapshot,
    sha256: sha256ReviewedSourceDocIdentityJson(snapshot),
    counts,
    ids,
  };
}

function dateOnlyToDatabaseDate(value: string | null) {
  if (value === null) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`Reviewed SourceDoc identity date is not date-only: ${value}`);
  }
  return new Date(`${value}T00:00:00.000Z`);
}

/** Materializes the portable manifest exactly as the Prisma SourceDoc schema stores it. */
export function portableSourceDocIdentityToDatabaseRow(
  snapshot: PortableSourceDocIdentitySnapshot,
  documentId: string | null,
): ReviewedSourceDocIdentityDatabaseRow {
  return {
    id: snapshot.id,
    filename: snapshot.filename,
    title: snapshot.title,
    author: snapshot.author,
    // SourceDoc.year is String? in Prisma even though seed data accepts numbers.
    year: snapshot.year === null ? null : String(snapshot.year),
    sourceType: snapshot.sourceType,
    description: snapshot.description,
    relevance: snapshot.relevance,
    url: snapshot.url,
    isDuplicate: snapshot.isDuplicate,
    doi: snapshot.doi,
    publisher: snapshot.publisher,
    provenanceType: snapshot.provenanceType,
    // SourceDoc.accessedAt is DateTime?; the manifest is intentionally date-only.
    accessedAt: dateOnlyToDatabaseDate(snapshot.accessedAt),
    archivedUrl: snapshot.archivedUrl,
    documentId,
  };
}

export function normalizeReviewedSourceDocIdentityDatabaseRow(
  row: ReviewedSourceDocIdentityDatabaseRow,
): ReviewedSourceDocIdentityDatabaseRow {
  return {
    id: row.id,
    filename: row.filename,
    title: row.title,
    author: row.author,
    year: row.year === null ? null : String(row.year),
    sourceType: row.sourceType,
    description: row.description,
    relevance: row.relevance,
    url: row.url,
    isDuplicate: row.isDuplicate,
    doi: row.doi,
    publisher: row.publisher,
    provenanceType: row.provenanceType,
    accessedAt: row.accessedAt === null ? null : new Date(row.accessedAt),
    archivedUrl: row.archivedUrl,
    documentId: row.documentId,
  };
}

export function fullReviewedSourceDocIdentitySnapshotWhere(
  row: ReviewedSourceDocIdentityDatabaseRow,
): Prisma.SourceDocWhereInput {
  return {
    id: row.id,
    filename: row.filename,
    title: row.title,
    author: row.author,
    year: row.year,
    sourceType: row.sourceType,
    description: row.description,
    relevance: row.relevance,
    url: row.url,
    isDuplicate: row.isDuplicate,
    doi: row.doi,
    publisher: row.publisher,
    provenanceType: row.provenanceType,
    accessedAt: row.accessedAt,
    archivedUrl: row.archivedUrl,
    documentId: row.documentId,
  };
}

export function reviewedSourceDocIdentityUpdateData(
  repair: ReviewedSourceDocIdentityRepair,
): Prisma.SourceDocUpdateManyMutationInput {
  const data: Prisma.SourceDocUpdateManyMutationInput = {};
  for (const field of repair.mutatedFields) {
    switch (field) {
      case "title":
        data.title = repair.after.title;
        break;
      case "author":
        data.author = repair.after.author;
        break;
      case "year":
        data.year =
          repair.after.year === null ? null : String(repair.after.year);
        break;
      case "url":
        data.url = repair.after.url;
        break;
      case "publisher":
        data.publisher = repair.after.publisher;
        break;
      case "accessedAt":
        data.accessedAt = dateOnlyToDatabaseDate(repair.after.accessedAt);
        break;
      default: {
        const exhaustive: never = field;
        throw new Error(
          `Unsupported reviewed SourceDoc identity mutation: ${exhaustive}`,
        );
      }
    }
  }
  return data;
}

function rowsEqual(
  left: ReviewedSourceDocIdentityDatabaseRow,
  right: ReviewedSourceDocIdentityDatabaseRow,
) {
  return (
    sha256ReviewedSourceDocIdentityJson(left) ===
    sha256ReviewedSourceDocIdentityJson(right)
  );
}

function mismatchReason(
  current: ReviewedSourceDocIdentityDatabaseRow,
  before: ReviewedSourceDocIdentityDatabaseRow,
  after: ReviewedSourceDocIdentityDatabaseRow,
  repair: ReviewedSourceDocIdentityRepair,
) {
  const mutable = new Set<string>(repair.mutatedFields);
  const fields = Object.keys(before) as (keyof ReviewedSourceDocIdentityDatabaseRow)[];
  if (
    fields.some(
      (field) =>
        !mutable.has(field) &&
        sha256ReviewedSourceDocIdentityJson(current[field]) !==
          sha256ReviewedSourceDocIdentityJson(before[field]),
    )
  ) {
    return "protected_field_drift";
  }
  const reviewedValuesOnly = repair.mutatedFields.every((field) => {
    const valueHash = sha256ReviewedSourceDocIdentityJson(current[field]);
    return (
      valueHash === sha256ReviewedSourceDocIdentityJson(before[field]) ||
      valueHash === sha256ReviewedSourceDocIdentityJson(after[field])
    );
  });
  const hasBefore = repair.mutatedFields.some(
    (field) =>
      sha256ReviewedSourceDocIdentityJson(current[field]) ===
      sha256ReviewedSourceDocIdentityJson(before[field]),
  );
  const hasAfter = repair.mutatedFields.some(
    (field) =>
      sha256ReviewedSourceDocIdentityJson(current[field]) ===
      sha256ReviewedSourceDocIdentityJson(after[field]),
  );
  return reviewedValuesOnly && hasBefore && hasAfter
    ? "hybrid_snapshot"
    : "identity_snapshot_drift";
}

function repairById() {
  return new Map<string, ReviewedSourceDocIdentityRepair>(
    REVIEWED_SOURCE_DOC_IDENTITY_REPAIRS.map((repair) => [repair.id, repair]),
  );
}

export function buildReviewedSourceDocIdentityDatabasePlan(
  rawRows: readonly ReviewedSourceDocIdentityDatabaseRow[],
  databaseIdentity: ReviewedSourceDocIdentityDatabaseIdentity,
  dependencies: ReviewedSourceDocIdentityDependencyInspection,
): ReviewedSourceDocIdentityDatabasePlan {
  const rows = rawRows.map(normalizeReviewedSourceDocIdentityDatabaseRow);
  const rowsById = new Map<string, ReviewedSourceDocIdentityDatabaseRow[]>();
  for (const row of rows) {
    const matches = rowsById.get(row.id) ?? [];
    matches.push(row);
    rowsById.set(row.id, matches);
  }
  const conflicts: ReviewedSourceDocIdentityDatabaseConflict[] = [];
  const planRows: ReviewedSourceDocIdentityDatabasePlanRow[] = [];
  const bindings: ReviewedSourceDocIdentityTargetBinding[] = [];
  const repairs = repairById();

  for (const id of REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_IDS) {
    const repair = repairs.get(id)!;
    const matches = rowsById.get(id) ?? [];
    const current = matches.length === 1 ? matches[0]! : null;
    const documentId = current?.documentId ?? null;
    const before = portableSourceDocIdentityToDatabaseRow(
      repair.before,
      documentId,
    );
    const after = portableSourceDocIdentityToDatabaseRow(
      repair.after,
      documentId,
    );
    bindings.push({
      sourceDocId: id,
      rowPresent: current !== null,
      documentId,
    });
    let status: ReviewedSourceDocIdentityDatabasePlanRow["status"] = "conflict";
    if (matches.length === 0) {
      conflicts.push({ id, reason: "missing_row" });
    } else if (matches.length > 1) {
      conflicts.push({ id, reason: "duplicate_row" });
    } else if (rowsEqual(current!, before)) {
      status = "pending";
    } else if (rowsEqual(current!, after)) {
      status = "applied";
    } else {
      conflicts.push({
        id,
        reason: mismatchReason(current!, before, after, repair),
      });
    }
    planRows.push({
      id,
      status,
      documentId,
      mutatedFields: repair.mutatedFields,
      beforeFullDatabaseRowSha256:
        sha256ReviewedSourceDocIdentityJson(before),
      currentFullDatabaseRowSha256: current
        ? sha256ReviewedSourceDocIdentityJson(current)
        : null,
      afterFullDatabaseRowSha256:
        sha256ReviewedSourceDocIdentityJson(after),
    });
  }

  const pending = planRows.filter((row) => row.status === "pending").length;
  const applied = planRows.filter((row) => row.status === "applied").length;
  let atomicState: ReviewedSourceDocIdentityAtomicState = "conflict";
  if (conflicts.length === 0 && pending === planRows.length) {
    atomicState = "all_before";
  } else if (conflicts.length === 0 && applied === planRows.length) {
    atomicState = "all_after";
  } else if (conflicts.length === 0) {
    conflicts.push({
      id: "Batch",
      reason:
        "atomic_hybrid: all three SourceDoc rows must be exact all-before or exact all-after",
    });
  }

  return {
    version: REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_VERSION,
    databaseIdentity,
    manifestSha256: REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_MANIFEST_SHA256,
    atomicState,
    targetDocumentBindings: bindings.sort((left, right) =>
      compareIds(left.sourceDocId, right.sourceDocId),
    ),
    targetStateSha256: sha256ReviewedSourceDocIdentityJson(
      rows.sort((left, right) => compareIds(left.id, right.id)),
    ),
    dependencySha256: dependencies.sha256,
    dependencyCounts: dependencies.counts,
    rows: planRows,
    conflicts,
    summary: {
      total: REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_IDS.length,
      pending,
      applied,
      conflicts: conflicts.length,
    },
  };
}

async function inspectDatabaseIdentity(
  client: Pick<Prisma.TransactionClient, "$queryRaw">,
): Promise<ReviewedSourceDocIdentityDatabaseIdentity> {
  const databaseRows = await client.$queryRaw<
    Array<{ currentDatabase: string; identityTable: string | null }>
  >(Prisma.sql`
    SELECT current_database() AS "currentDatabase",
           to_regclass('public."DatabaseIdentity"')::text AS "identityTable"
  `);
  if (
    databaseRows.length !== 1 ||
    !databaseRows[0]?.currentDatabase ||
    databaseRows[0].identityTable === null
  ) {
    throw new Error(
      "Reviewed SourceDoc identity repair requires DatabaseIdentity metadata",
    );
  }
  const identityRows = await client.$queryRaw<
    Array<{ key: string; identityUuid: string; createdAt: Date }>
  >(Prisma.sql`
    SELECT "key", "identityUuid"::text AS "identityUuid", "createdAt"
    FROM "DatabaseIdentity"
    ORDER BY "key"
  `);
  const row = identityRows[0];
  if (
    identityRows.length !== 1 ||
    row?.key !== "primary" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      row.identityUuid,
    ) ||
    !(row.createdAt instanceof Date) ||
    Number.isNaN(row.createdAt.valueOf())
  ) {
    throw new Error(
      "Reviewed SourceDoc identity repair requires exactly one valid primary DatabaseIdentity row",
    );
  }
  return {
    currentDatabase: databaseRows[0].currentDatabase,
    key: "primary",
    identityUuid: row.identityUuid.toLowerCase(),
    createdAt: row.createdAt.toISOString(),
  };
}

async function inspectDependencies(
  client: ReviewedSourceDocIdentityClient,
  identity: ReviewedSourceDocIdentityDatabaseIdentity,
  targetRows: readonly ReviewedSourceDocIdentityDatabaseRow[],
): Promise<ReviewedSourceDocIdentityDependencyInspection> {
  const sourceDocIds = [...REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_IDS];
  const documentIds = sortedUnique(targetRows.map((row) => row.documentId));
  const sourceKeys = sortedUnique([
    ...sourceDocIds.map((id) => `source_doc:${id}`),
    ...documentIds.map((id) => `document:${id}`),
  ]);

  const nonCanonicalSourceDocTargetRows = await client.$queryRaw<
    Array<{ id: string; entityType: string; entityId: string }>
  >(Prisma.sql`
    SELECT "id", "entityType", "entityId"
    FROM "FieldCitation"
    WHERE (
      regexp_replace(lower(btrim("entityType")), '[^a-z0-9]+', '', 'g') = 'sourcedoc'
      AND regexp_replace(btrim("entityId"), '[[:cntrl:]]', '', 'g') IN (${Prisma.join(sourceDocIds)})
      AND (
        "entityType" IS DISTINCT FROM 'SourceDoc'
        OR "entityId" IS DISTINCT FROM regexp_replace(btrim("entityId"), '[[:cntrl:]]', '', 'g')
      )
    )
    ORDER BY "id"
  `);
  const nonCanonicalDocumentTargetRows =
    documentIds.length === 0
      ? []
      : await client.$queryRaw<
          Array<{ id: string; entityType: string; entityId: string }>
        >(Prisma.sql`
    SELECT "id", "entityType", "entityId"
    FROM "FieldCitation"
    WHERE (
      regexp_replace(lower(btrim("entityType")), '[^a-z0-9]+', '', 'g') = 'document'
      AND regexp_replace(btrim("entityId"), '[[:cntrl:]]', '', 'g') IN (${Prisma.join(documentIds)})
      AND (
        "entityType" IS DISTINCT FROM 'Document'
        OR "entityId" IS DISTINCT FROM regexp_replace(btrim("entityId"), '[[:cntrl:]]', '', 'g')
      )
    )
    ORDER BY "id"
  `);
  const nonCanonicalTargetRows = [
    ...nonCanonicalSourceDocTargetRows,
    ...nonCanonicalDocumentTargetRows,
  ];
  if (nonCanonicalTargetRows.length > 0) {
    throw new Error(
      `Reviewed SourceDoc identity dependency closure found non-canonical FieldCitation target types: ${nonCanonicalTargetRows
        .map((row) => `${row.id}:${row.entityType}:${row.entityId}`)
        .join(", ")}`,
    );
  }

  const [
    documents,
    documentRefs,
    documentSourceDocBindings,
    reportDocumentConsumers,
    thesisDocumentConsumers,
    directSourceCitations,
    libraryAnalysisRecords,
    sourceRefs,
    mediaEntries,
    sourceDocInsightRows,
    insightDocumentRefs,
    companyDocumentRefs,
    actorDocumentRefs,
    opportunitySourceConsumers,
  ] = await Promise.all([
    client.document.findMany({
      where: { id: { in: documentIds } },
      orderBy: { id: "asc" },
    }),
    client.documentRef.findMany({
      where: {
        OR: [
          { fromId: { in: documentIds } },
          { toId: { in: documentIds } },
        ],
      },
      orderBy: { id: "asc" },
    }),
    client.sourceDoc.findMany({
      where: { documentId: { in: documentIds } },
      select: { id: true, documentId: true },
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
    client.sourceCitation.findMany({
      where: {
        OR: [
          { sourceDocId: { in: sourceDocIds } },
          { documentId: { in: documentIds } },
          {
            fieldCitations: {
              some: {
                OR: [
                  {
                    entityType: "SourceDoc",
                    entityId: { in: sourceDocIds },
                  },
                  {
                    entityType: "Document",
                    entityId: { in: documentIds },
                  },
                ],
              },
            },
          },
          {
            reviewBasisForAppraisals: {
              some: { sourceDocId: { in: sourceDocIds } },
            },
          },
        ],
      },
      orderBy: { id: "asc" },
    }),
    client.libraryAnalysisRecord.findMany({
      where: {
        OR: [
          { sourceDocId: { in: sourceDocIds } },
          { sourceKey: { in: sourceKeys } },
          { documentId: { in: documentIds } },
        ],
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
    client.opportunityEntry.findMany({
      where: { sourceIds: { hasSome: sourceDocIds } },
      orderBy: { id: "asc" },
    }),
  ]);

  const citationIds = directSourceCitations.map((row) => row.id);
  const [fieldCitations, evidenceAppraisals, insights, producerCitationConsumers] =
    await Promise.all([
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
    ]);

  const sourceDocInsightLinks = sourceDocInsightRows.flatMap((sourceDoc) =>
    sourceDoc.insights.map((insight) => ({
      id: `${insight.id}->${sourceDoc.id}`,
      insightId: insight.id,
      sourceDocId: sourceDoc.id,
    })),
  );

  return buildReviewedSourceDocIdentityDependencySnapshot(identity, {
    documents: asDependencyRows(documents),
    documentRefs: asDependencyRows(documentRefs),
    documentSourceDocBindings: asDependencyRows(documentSourceDocBindings),
    reportDocumentConsumers: asDependencyRows(reportDocumentConsumers),
    thesisDocumentConsumers: asDependencyRows(thesisDocumentConsumers),
    sourceCitations: asDependencyRows(directSourceCitations),
    fieldCitations: asDependencyRows(fieldCitations),
    libraryAnalysisRecords: asDependencyRows(libraryAnalysisRecords),
    evidenceAppraisals: asDependencyRows(evidenceAppraisals),
    sourceRefs: asDependencyRows(sourceRefs),
    mediaEntries: asDependencyRows(mediaEntries),
    sourceDocInsightLinks,
    insights: asDependencyRows(insights),
    producerCitationConsumers: asDependencyRows(producerCitationConsumers),
    opportunitySourceConsumers: asDependencyRows(opportunitySourceConsumers),
    insightDocumentRefs: asDependencyRows(insightDocumentRefs),
    companyDocumentRefs: asDependencyRows(companyDocumentRefs),
    actorDocumentRefs: asDependencyRows(actorDocumentRefs),
  });
}

export async function inspectReviewedSourceDocIdentityDatabaseState(
  client: ReviewedSourceDocIdentityClient,
): Promise<ReviewedSourceDocIdentityDatabaseInspection> {
  const targetIds = [...REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_IDS];
  const [identity, rawRows] = await Promise.all([
    inspectDatabaseIdentity(client),
    client.sourceDoc.findMany({
      where: { id: { in: targetIds } },
      select: sourceDocSelect,
      orderBy: { id: "asc" },
    }),
  ]);
  const targetRows = rawRows.map(normalizeReviewedSourceDocIdentityDatabaseRow);
  const dependencies = await inspectDependencies(client, identity, targetRows);
  return {
    plan: buildReviewedSourceDocIdentityDatabasePlan(
      targetRows,
      identity,
      dependencies,
    ),
    targetRows,
    dependencySnapshot: dependencies.snapshot,
    dependencyIds: dependencies.ids,
  };
}

export function reviewedSourceDocIdentityDatabasePlanContract(
  plan: ReviewedSourceDocIdentityDatabasePlan,
) {
  return plan;
}

export function reviewedSourceDocIdentityDatabasePlanSha256(
  plan: ReviewedSourceDocIdentityDatabasePlan,
) {
  return sha256ReviewedSourceDocIdentityJson(
    reviewedSourceDocIdentityDatabasePlanContract(plan),
  );
}

export function parseReviewedSourceDocIdentityDatabaseArgs(
  argv: readonly string[],
): ReviewedSourceDocIdentityDatabaseArgs {
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
    throw new Error(
      `Unknown reviewed SourceDoc identity argument: ${argument}`,
    );
  }
  if (apply && dryRun) {
    throw new Error("--apply and --dry-run are mutually exclusive");
  }
  if (!apply && (ack !== undefined || expectedPlanSha256 !== undefined)) {
    throw new Error("--ack and --plan-sha256 are valid only with --apply");
  }
  return { apply, ack, expectedPlanSha256 };
}

export function assertReviewedSourceDocIdentityDatabasePlanReady(
  plan: ReviewedSourceDocIdentityDatabasePlan,
) {
  if (
    plan.rows.length !== REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_IDS.length ||
    plan.conflicts.length > 0 ||
    plan.atomicState === "conflict" ||
    (plan.atomicState === "all_before" &&
      plan.summary.pending !== REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_IDS.length) ||
    (plan.atomicState === "all_after" &&
      plan.summary.applied !== REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_IDS.length)
  ) {
    throw new Error(
      `Reviewed SourceDoc identity conflicts or hybrid state detected: ${plan.conflicts
        .map((conflict) => `${conflict.id}:${conflict.reason}`)
        .join(", ")}`,
    );
  }
  return plan.atomicState;
}

function printPlan(plan: ReviewedSourceDocIdentityDatabasePlan, digest: string) {
  console.log("Reviewed three-row SourceDoc identity database repair");
  console.log(`Plan SHA-256: ${digest}`);
  console.log(`Manifest SHA-256: ${plan.manifestSha256}`);
  console.log(
    `Database: ${plan.databaseIdentity.currentDatabase}; identity UUID: ${plan.databaseIdentity.identityUuid}`,
  );
  console.log(
    `Atomic state: ${plan.atomicState}; pending: ${plan.summary.pending}; applied: ${plan.summary.applied}; conflicts: ${plan.summary.conflicts}`,
  );
  console.log(
    `Target state SHA-256: ${plan.targetStateSha256}; dependency SHA-256: ${plan.dependencySha256}`,
  );
  console.log(`Dependency counts: ${JSON.stringify(plan.dependencyCounts)}`);
  console.log(
    `Proof boundary: ${REVIEWED_SOURCE_DOC_IDENTITY_DATABASE_PROOF_LIMITATIONS.join("; ")}`,
  );
  for (const row of plan.rows) {
    console.log(
      `${row.status} SourceDoc:${row.id}; documentId=${row.documentId ?? "null"}; fields=${row.mutatedFields.join(",")}; current=${row.currentFullDatabaseRowSha256 ?? "missing"}; after=${row.afterFullDatabaseRowSha256}`,
    );
  }
  for (const conflict of plan.conflicts) {
    console.log(`Conflict ${conflict.id}: ${conflict.reason}`);
  }
}

async function findFullRowCasPreflightMismatches(
  client: ReviewedSourceDocIdentityClient,
  inspection: ReviewedSourceDocIdentityDatabaseInspection,
) {
  const currentById = new Map(
    inspection.targetRows.map((row) => [row.id, row]),
  );
  const checks = await Promise.all(
    inspection.plan.rows
      .filter((row) => row.status === "pending")
      .map(async (row) => ({
        id: row.id,
        count: currentById.has(row.id)
          ? await client.sourceDoc.count({
              where: fullReviewedSourceDocIdentitySnapshotWhere(
                currentById.get(row.id)!,
              ),
            })
          : 0,
      })),
  );
  return checks.filter((check) => check.count !== 1);
}

function exactIds(actual: readonly string[], expected: readonly string[]) {
  return (
    JSON.stringify([...actual].sort(compareIds)) ===
    JSON.stringify([...expected].sort(compareIds))
  );
}

/**
 * These table locks are intentionally broad and short-lived. They close
 * predicate/phantom races for semantic FieldCitation paths and the implicit
 * Insight↔SourceDoc join, neither of which can be protected by target-row FKs.
 */
async function lockReviewedSourceDocIdentityDependencyTables(
  transaction: Prisma.TransactionClient,
) {
  await transaction.$executeRaw`
    LOCK TABLE
      "DatabaseIdentity", "SourceDoc", "Document", "DocumentRef", "Report",
      "Thesis", "SourceCitation", "FieldCitation", "LibraryAnalysisRecord",
      "EvidenceAppraisal", "SourceRef", "MediaEntry", "Insight", "Producer",
      "OpportunityEntry", "_InsightSourceDoc", "InsightDocumentRef", "CompanyDocumentRef",
      "ActorDocumentRef"
    IN SHARE ROW EXCLUSIVE MODE
  `;
}

async function lockTargetRowsForUpdate(transaction: Prisma.TransactionClient) {
  const expected = [...REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_IDS];
  const locked = await transaction.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT "id" FROM "SourceDoc"
    WHERE "id" IN (${Prisma.join(expected)})
    ORDER BY "id" FOR UPDATE
  `);
  if (!exactIds(locked.map((row) => row.id), expected)) {
    throw new Error(
      "Reviewed SourceDoc identity target set changed after planning; no rows updated",
    );
  }
}

async function lockDatabaseIdentity(
  transaction: Prisma.TransactionClient,
  expected: ReviewedSourceDocIdentityDatabaseIdentity,
) {
  const rows = await transaction.$queryRaw<
    Array<{ key: string; identityUuid: string; createdAt: Date }>
  >(Prisma.sql`
    SELECT "key", "identityUuid"::text AS "identityUuid", "createdAt"
    FROM "DatabaseIdentity"
    ORDER BY "key" FOR SHARE
  `);
  const normalized = rows.map((row) => ({
    currentDatabase: expected.currentDatabase,
    key: row.key,
    identityUuid: row.identityUuid.toLowerCase(),
    createdAt: row.createdAt.toISOString(),
  }));
  if (
    normalized.length !== 1 ||
    sha256ReviewedSourceDocIdentityJson(normalized[0]) !==
      sha256ReviewedSourceDocIdentityJson(expected)
  ) {
    throw new Error(
      "Reviewed SourceDoc identity DatabaseIdentity changed after planning; no rows updated",
    );
  }
}

async function applyPendingRow(
  transaction: Prisma.TransactionClient,
  repair: ReviewedSourceDocIdentityRepair,
  documentId: string | null,
) {
  const before = portableSourceDocIdentityToDatabaseRow(
    repair.before,
    documentId,
  );
  const result = await transaction.sourceDoc.updateMany({
    where: fullReviewedSourceDocIdentitySnapshotWhere(before),
    data: reviewedSourceDocIdentityUpdateData(repair),
  });
  if (result.count !== 1) {
    throw new Error(
      `Concurrent full-row SourceDoc identity CAS conflict: ${repair.id}; transaction must roll back`,
    );
  }
}

function sameHash(left: unknown, right: unknown) {
  return (
    sha256ReviewedSourceDocIdentityJson(left) ===
    sha256ReviewedSourceDocIdentityJson(right)
  );
}

/** Exported so tests can exercise every rollback-triggering postcondition. */
export function assertReviewedSourceDocIdentityPostApply(
  before: ReviewedSourceDocIdentityDatabaseInspection,
  after: ReviewedSourceDocIdentityDatabaseInspection,
) {
  assertReviewedSourceDocIdentityDatabasePlanReady(after.plan);
  if (
    after.plan.atomicState !== "all_after" ||
    after.plan.summary.pending !== 0 ||
    after.plan.summary.applied !== REVIEWED_SOURCE_DOC_IDENTITY_REPAIR_IDS.length ||
    !sameHash(after.plan.databaseIdentity, before.plan.databaseIdentity) ||
    after.plan.dependencySha256 !== before.plan.dependencySha256 ||
    !sameHash(
      after.plan.targetDocumentBindings,
      before.plan.targetDocumentBindings,
    ) ||
    after.plan.rows.some(
      (row) =>
        row.currentFullDatabaseRowSha256 !== row.afterFullDatabaseRowSha256,
    )
  ) {
    throw new Error(
      "Post-apply SourceDoc idempotence, DatabaseIdentity, binding, or dependency proof failed; transaction must roll back",
    );
  }
}

function isConcurrentWriteConflict(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /P2034|serialize|serialization|deadlock|concurrent|changed after planning|roll back/i.test(
    message,
  );
}

async function main() {
  const args = parseReviewedSourceDocIdentityDatabaseArgs(
    process.argv.slice(2),
  );
  if (
    args.apply &&
    args.ack !== REVIEWED_SOURCE_DOC_IDENTITY_DATABASE_APPLY_ACK
  ) {
    throw new Error(
      `--apply requires --ack=${REVIEWED_SOURCE_DOC_IDENTITY_DATABASE_APPLY_ACK}`,
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
    const inspection = await inspectReviewedSourceDocIdentityDatabaseState(
      prisma,
    );
    assertReviewedSourceDocIdentityDatabasePlanReady(inspection.plan);
    const digest = reviewedSourceDocIdentityDatabasePlanSha256(
      inspection.plan,
    );
    printPlan(inspection.plan, digest);

    const preflightMismatches = await findFullRowCasPreflightMismatches(
      prisma,
      inspection,
    );
    if (preflightMismatches.length > 0) {
      throw new Error(
        `Reviewed SourceDoc identity full-row CAS preflight mismatch: ${preflightMismatches
          .map((row) => row.id)
          .join(", ")}`,
      );
    }
    console.log(
      `Full-row CAS preflight: ${inspection.plan.summary.pending}/${inspection.plan.summary.pending} exact pending SourceDoc snapshots matched`,
    );

    if (!args.apply) {
      console.log(
        `Dry run only. After review, re-run with --apply --ack=${REVIEWED_SOURCE_DOC_IDENTITY_DATABASE_APPLY_ACK} --plan-sha256=${digest}`,
      );
      return;
    }
    if (digest !== args.expectedPlanSha256) {
      throw new Error(
        "Current reviewed SourceDoc identity plan differs from --plan-sha256; rerun dry-run",
      );
    }

    const applied = await prisma.$transaction(
      async (transaction) => {
        // Acquire writer-blocking table locks before the first MVCC-reading
        // statement so a waiter cannot retain a pre-lock Serializable snapshot.
        await lockReviewedSourceDocIdentityDependencyTables(transaction);
        await transaction.$executeRaw`
          SELECT pg_advisory_xact_lock(hashtext(${REVIEWED_SOURCE_DOC_IDENTITY_DATABASE_ADVISORY_LOCK_KEY}))
        `;
        await lockTargetRowsForUpdate(transaction);
        await lockDatabaseIdentity(
          transaction,
          inspection.plan.databaseIdentity,
        );

        const locked =
          await inspectReviewedSourceDocIdentityDatabaseState(transaction);
        assertReviewedSourceDocIdentityDatabasePlanReady(locked.plan);
        const lockedDigest = reviewedSourceDocIdentityDatabasePlanSha256(
          locked.plan,
        );
        if (lockedDigest !== args.expectedPlanSha256) {
          throw new Error(
            "Locked reviewed SourceDoc identity plan changed after planning; no rows updated",
          );
        }

        const repairMap = repairById();
        const bindingMap = new Map(
          locked.plan.targetDocumentBindings.map((binding) => [
            binding.sourceDocId,
            binding.documentId,
          ]),
        );
        let updated = 0;
        for (const row of locked.plan.rows) {
          if (row.status !== "pending") continue;
          await applyPendingRow(
            transaction,
            repairMap.get(row.id)!,
            bindingMap.get(row.id) ?? null,
          );
          updated += 1;
        }

        const after =
          await inspectReviewedSourceDocIdentityDatabaseState(transaction);
        assertReviewedSourceDocIdentityPostApply(locked, after);
        return updated;
      },
      { isolationLevel: "Serializable" },
    );
    console.log(
      `Reviewed SourceDoc identity repair applied: ${applied} SourceDoc row(s); all dependencies and bindings unchanged`,
    );
  } catch (error) {
    if (args.apply && isConcurrentWriteConflict(error)) {
      const detail = error instanceof Error ? error.message : String(error);
      throw new Error(
        "Reviewed SourceDoc identity repair conflicted or failed a postcondition; the Serializable transaction rolled back and zero rows were committed. " +
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
        : "Reviewed SourceDoc identity repair failed",
    );
    process.exitCode = 1;
  });
}
