#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { Prisma, type PrismaClient } from "../../src/generated/prisma/client";
import {
  candidateAnalysisEvidenceLocatorHash,
  candidateAnalysisSha256,
  CandidateContentUnitInputSchema,
  type CandidateContentUnitInput,
} from "../../src/lib/knowledge/candidate-analysis-contract";
import { createCandidateContentUnitIntakeWriter } from "../../src/lib/knowledge/candidate-analysis-writer";
import {
  LibraryAnalysisPopulationSnapshotSchema,
  type LibraryAnalysisPopulationSnapshot,
} from "../../src/lib/knowledge/library-analysis-population";

export type LibraryAnalysisContentIntakeCliOptions = { snapshot: string };

export type LibraryAnalysisSourceRow = {
  documentId: string;
  summary: string | null;
  content: string;
};

export type LibraryAnalysisContentIntakeReceipt = {
  schema: "library-analysis-content-intake/v1";
  snapshotId: string;
  populationHash: string;
  counts: {
    population: number;
    eligible: number;
    blocked: number;
    created: number;
    replayed: number;
  };
  contentUnits: Array<{
    sourceKey: string;
    contentUnitId: string;
    contentHash: string;
    created: boolean;
  }>;
};

export function parseLibraryAnalysisContentIntakeArgs(
  arguments_: readonly string[],
): LibraryAnalysisContentIntakeCliOptions {
  let snapshot: string | null = null;
  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index]!;
    const next = arguments_[index + 1];
    if (argument === "--snapshot") {
      if (snapshot !== null || next === undefined) {
        throw new Error("invalid_library_analysis_snapshot_argument");
      }
      snapshot = next;
      index += 1;
      continue;
    }
    if (argument.startsWith("--snapshot=")) {
      if (snapshot !== null) {
        throw new Error("duplicate_library_analysis_snapshot_argument");
      }
      snapshot = argument.slice("--snapshot=".length);
      continue;
    }
    throw new Error("unknown_library_analysis_content_intake_argument");
  }
  if (
    snapshot === null ||
    snapshot.length === 0 ||
    /[\u0000-\u001f\u007f]/.test(snapshot)
  ) {
    throw new Error("invalid_library_analysis_content_intake_arguments");
  }
  return { snapshot };
}

function eligibleDocumentId(row: LibraryAnalysisPopulationSnapshot["rows"][number]): string {
  if (
    row.inputKind !== "database_record" ||
    row.identityConfidence !== "exact" ||
    row.sourceKind !== "document" ||
    row.sourceVersionHash === null ||
    row.contentHash === null ||
    row.locator === null ||
    row.blockers.length !== 0
  ) {
    throw new Error("library_analysis_eligible_population_binding_invalid");
  }
  const match = /^database:Document:([^:]+):content$/.exec(row.locator);
  if (match === null || row.sourceKey !== `document:${match[1]}`) {
    throw new Error("library_analysis_eligible_locator_invalid");
  }
  return match[1]!;
}

export function eligibleLibraryAnalysisDocumentIds(
  snapshot: LibraryAnalysisPopulationSnapshot,
): string[] {
  return snapshot.rows
    .filter((row) => row.eligibility === "eligible")
    .map(eligibleDocumentId);
}

export function buildLibraryAnalysisContentUnits(
  rawSnapshot: LibraryAnalysisPopulationSnapshot,
  sourceRows: readonly LibraryAnalysisSourceRow[],
): CandidateContentUnitInput[] {
  const snapshot = LibraryAnalysisPopulationSnapshotSchema.parse(rawSnapshot);
  const sourceById = new Map<string, LibraryAnalysisSourceRow>();
  for (const source of sourceRows) {
    if (sourceById.has(source.documentId)) {
      throw new Error("duplicate_library_analysis_source_bytes");
    }
    sourceById.set(source.documentId, source);
  }
  return snapshot.rows
    .filter((row) => row.eligibility === "eligible")
    .map((row) => {
      const documentId = eligibleDocumentId(row);
      if (
        row.locator === null ||
        row.contentHash === null ||
        row.sourceVersionHash === null
      ) {
        throw new Error("library_analysis_eligible_population_binding_invalid");
      }
      const source = sourceById.get(documentId);
      if (source === undefined) {
        throw new Error("library_analysis_source_bytes_missing");
      }
      const { content } = source;
      const actualContentHash = createHash("sha256")
        .update(Buffer.from(content, "utf8"))
        .digest("hex");
      if (actualContentHash !== row.contentHash) {
        throw new Error("library_analysis_content_hash_mismatch");
      }
      const sourceVersionContent = [source.summary, content]
        .filter(Boolean)
        .join("\n\n");
      const actualSourceVersionHash = createHash("sha256")
        .update(Buffer.from(sourceVersionContent, "utf8"))
        .digest("hex");
      if (actualSourceVersionHash !== row.sourceVersionHash) {
        throw new Error("library_analysis_source_version_hash_mismatch");
      }
      const identityHash = candidateAnalysisSha256(
        "library-analysis-content-unit",
        {
          sourceKind: row.sourceKind,
          sourceKey: row.sourceKey,
          sourceVersionHash: row.sourceVersionHash,
          locator: row.locator,
          contentHash: row.contentHash,
        },
      );
      return CandidateContentUnitInputSchema.parse({
        id: `content:library-analysis:${identityHash}`,
        sourceKind: row.sourceKind,
        sourceKey: row.sourceKey,
        sourceVersionHash: row.sourceVersionHash,
        unitType: "database_record",
        ordinal: 0,
        locator: row.locator,
        locatorHash: candidateAnalysisEvidenceLocatorHash(row.locator),
        contentHash: row.contentHash,
        hashAlgorithm: "sha256",
        identityConfidence: row.identityConfidence,
      });
    });
}

export async function ingestLibraryAnalysisContentUnits(input: {
  snapshot: LibraryAnalysisPopulationSnapshot;
  sourceRows: readonly LibraryAnalysisSourceRow[];
  append: (
    unit: CandidateContentUnitInput,
  ) => Promise<{ contentUnitId: string; created: boolean }>;
}): Promise<LibraryAnalysisContentIntakeReceipt> {
  const snapshot = LibraryAnalysisPopulationSnapshotSchema.parse(input.snapshot);
  const units = buildLibraryAnalysisContentUnits(snapshot, input.sourceRows);
  const contentUnits: LibraryAnalysisContentIntakeReceipt["contentUnits"] = [];
  for (const unit of units) {
    const result = await input.append(unit);
    if (result.contentUnitId !== unit.id) {
      throw new Error("library_analysis_content_unit_identity_mismatch");
    }
    contentUnits.push({
      sourceKey: unit.sourceKey,
      contentUnitId: result.contentUnitId,
      contentHash: unit.contentHash,
      created: result.created,
    });
  }
  const created = contentUnits.filter((unit) => unit.created).length;
  return {
    schema: "library-analysis-content-intake/v1",
    snapshotId: snapshot.snapshotId,
    populationHash: snapshot.populationHash,
    counts: {
      population: snapshot.rows.length,
      eligible: units.length,
      blocked: snapshot.rows.length - units.length,
      created,
      replayed: units.length - created,
    },
    contentUnits,
  };
}

export async function readLibraryAnalysisSourceRows(
  prisma: PrismaClient,
  documentIds: readonly string[],
): Promise<LibraryAnalysisSourceRow[]> {
  return prisma.$transaction(
    async (transaction) => {
      await transaction.$executeRawUnsafe("SET TRANSACTION READ ONLY");
      const documents = await transaction.document.findMany({
        where: { id: { in: [...documentIds] } },
        select: { id: true, summary: true, content: true },
      });
      return documents.map((document) => ({
        documentId: document.id,
        summary: document.summary,
        content: document.content,
      }));
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
  );
}

export async function runLibraryAnalysisContentIntakeCli(
  options: LibraryAnalysisContentIntakeCliOptions,
): Promise<void> {
  const sourceDatabaseUrl = process.env.DATABASE_URL;
  const intakeDatabaseUrl = process.env.CANDIDATE_INTAKE_DATABASE_URL;
  if (!sourceDatabaseUrl || !intakeDatabaseUrl) {
    throw new Error("library_analysis_content_intake_database_url_missing");
  }
  const snapshot = LibraryAnalysisPopulationSnapshotSchema.parse(
    JSON.parse(readFileSync(resolve(options.snapshot), "utf8")),
  );
  const [{ PrismaPg }, { PrismaClient: RuntimePrismaClient }] = await Promise.all([
    import("@prisma/adapter-pg"),
    import("../../src/generated/prisma/client"),
  ]);
  const sourcePrisma: PrismaClient = new RuntimePrismaClient({
    adapter: new PrismaPg({ connectionString: sourceDatabaseUrl }),
  });
  const intakePrisma: PrismaClient = new RuntimePrismaClient({
    adapter: new PrismaPg({ connectionString: intakeDatabaseUrl }),
  });
  try {
    const sourceRows = await readLibraryAnalysisSourceRows(
      sourcePrisma,
      eligibleLibraryAnalysisDocumentIds(snapshot),
    );
    const writer = createCandidateContentUnitIntakeWriter(intakePrisma);
    const receipt = await ingestLibraryAnalysisContentUnits({
      snapshot,
      sourceRows,
      append: (unit) => writer.appendContentUnit(unit),
    });
    process.stdout.write(`${JSON.stringify(receipt)}\n`);
  } finally {
    await Promise.allSettled([
      sourcePrisma.$disconnect(),
      intakePrisma.$disconnect(),
    ]);
  }
}

const invokedPath = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : null;
if (invokedPath === import.meta.url) {
  void (async () => {
    try {
      await runLibraryAnalysisContentIntakeCli(
        parseLibraryAnalysisContentIntakeArgs(process.argv.slice(2)),
      );
    } catch {
      process.stderr.write("library_analysis_content_intake_failed\n");
      process.exitCode = 1;
    }
  })();
}
