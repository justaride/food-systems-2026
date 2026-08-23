#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";
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
  LibraryAnalysisAcquisitionPlanSchema,
  LibraryAnalysisAcquisitionResolutionSchema,
  type LibraryAnalysisAcquisitionPlan,
  type LibraryAnalysisAcquisitionResolution,
} from "../../src/lib/knowledge/library-analysis-acquisition-contract";
import {
  LibraryAnalysisPopulationSnapshotSchema,
  type LibraryAnalysisPopulationSnapshot,
} from "../../src/lib/knowledge/library-analysis-population";
import { readAndVerifyPrivateArtifact } from "../../src/lib/knowledge/private-library-analysis-artifact-store";
import {
  verifyLibraryAnalysisContentUnitManifest,
  verifyPrivateUnitText,
  type LibraryAnalysisContentUnitManifest,
} from "./emit-library-analysis-content-units";

export type LibraryAnalysisContentIntakeCliOptions = {
  snapshot: string;
  plan: string;
  resolution: string;
  contentUnits: string;
  runRoot: string;
};

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

export type ResolvedLibraryAnalysisContentIntakeReceipt =
  LibraryAnalysisContentIntakeReceipt & {
    resolutionHash: string;
    contentUnitManifestHash: string;
  };

export function parseLibraryAnalysisContentIntakeArgs(
  arguments_: readonly string[],
): LibraryAnalysisContentIntakeCliOptions {
  const values = new Map<string, string>();
  for (const argument of arguments_) {
    const match = /^--(snapshot|plan|resolution|content-units|run-root)=(.*)$/u.exec(argument);
    if (!match) throw new Error("unknown_library_analysis_content_intake_argument");
    const key = match[1]!;
    if (values.has(key)) throw new Error("duplicate_library_analysis_content_intake_argument");
    const value = match[2]!;
    if (value.length === 0 || !isAbsolute(value) || /[\u0000-\u001f\u007f]/.test(value)) {
      throw new Error("invalid_library_analysis_content_intake_path");
    }
    values.set(key, resolve(value));
  }
  const snapshot = values.get("snapshot");
  const plan = values.get("plan");
  const resolution = values.get("resolution");
  const contentUnits = values.get("content-units");
  const runRoot = values.get("run-root");
  if (!snapshot || !plan || !resolution || !contentUnits || !runRoot) {
    throw new Error("invalid_library_analysis_content_intake_arguments");
  }
  return { snapshot, plan, resolution, contentUnits, runRoot };
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

export async function ingestResolvedLibraryAnalysisContentUnits(input: {
  snapshot: LibraryAnalysisPopulationSnapshot;
  plan: LibraryAnalysisAcquisitionPlan;
  resolution: LibraryAnalysisAcquisitionResolution;
  contentUnitManifest: LibraryAnalysisContentUnitManifest;
  readUnit: (portablePath: string) => Promise<Buffer>;
  append: (
    unit: CandidateContentUnitInput,
  ) => Promise<{ contentUnitId: string; created: boolean }>;
}): Promise<ResolvedLibraryAnalysisContentIntakeReceipt> {
  const snapshot = LibraryAnalysisPopulationSnapshotSchema.parse(input.snapshot);
  const plan = LibraryAnalysisAcquisitionPlanSchema.parse(input.plan);
  const resolution = LibraryAnalysisAcquisitionResolutionSchema.parse(input.resolution);
  const manifest = verifyLibraryAnalysisContentUnitManifest(input.contentUnitManifest);
  if (
    plan.populationSnapshotId !== snapshot.snapshotId ||
    plan.populationHash !== snapshot.populationHash ||
    resolution.populationSnapshotId !== snapshot.snapshotId ||
    resolution.populationHash !== snapshot.populationHash ||
    resolution.planId !== plan.planId ||
    resolution.planHash !== plan.planHash ||
    manifest.populationSnapshotId !== snapshot.snapshotId ||
    manifest.populationHash !== snapshot.populationHash ||
    manifest.planId !== plan.planId ||
    manifest.planHash !== plan.planHash ||
    manifest.resolutionId !== resolution.resolutionId ||
    manifest.resolutionHash !== resolution.resolutionHash
  ) {
    throw new Error("library_analysis_resolved_intake_binding_mismatch");
  }

  const resolutionUnits = new Map(
    resolution.rows.flatMap((row) => row.contentUnits.map((unit) => [
      unit.contentUnitId,
      { unit, sourceKind: row.sourceKind, populationSourceKey: row.sourceKey },
    ] as const)),
  );
  if (resolutionUnits.size !== manifest.units.length) {
    throw new Error("library_analysis_resolved_intake_unit_count_mismatch");
  }
  const verified: CandidateContentUnitInput[] = [];
  for (const unit of manifest.units) {
    const resolvedEntry = resolutionUnits.get(unit.id);
    if (
      resolvedEntry === undefined ||
      resolvedEntry.sourceKind !== unit.sourceKind ||
      resolvedEntry.populationSourceKey !== unit.populationSourceKey ||
      resolvedEntry.unit.sourceVersionHash !== unit.sourceVersionHash ||
      resolvedEntry.unit.unitType !== unit.unitType ||
      resolvedEntry.unit.ordinal !== unit.ordinal ||
      resolvedEntry.unit.locator !== unit.locator ||
      resolvedEntry.unit.contentHash !== unit.contentHash
    ) {
      throw new Error("library_analysis_resolved_intake_unit_binding_mismatch");
    }
    const bytes = await input.readUnit(unit.privateArtifact.portablePath);
    let text: string;
    try {
      text = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    } catch {
      throw new Error("library_analysis_private_unit_utf8_invalid");
    }
    verifyPrivateUnitText(unit, text);
    verified.push(CandidateContentUnitInputSchema.parse({
      id: unit.id,
      sourceKind: unit.sourceKind,
      sourceKey: unit.sourceKey,
      sourceVersionHash: unit.sourceVersionHash,
      unitType: unit.unitType,
      ordinal: unit.ordinal,
      locator: unit.locator,
      locatorHash: unit.locatorHash,
      contentHash: unit.contentHash,
      hashAlgorithm: unit.hashAlgorithm,
      identityConfidence: unit.identityConfidence,
    }));
  }

  const contentUnits: LibraryAnalysisContentIntakeReceipt["contentUnits"] = [];
  for (const unit of verified) {
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
  const readySources = resolution.rows.filter(
    (row) => row.disposition === "content_units_ready",
  ).length;
  return {
    schema: "library-analysis-content-intake/v1",
    snapshotId: snapshot.snapshotId,
    populationHash: snapshot.populationHash,
    resolutionHash: resolution.resolutionHash,
    contentUnitManifestHash: manifest.manifestHash,
    counts: {
      population: snapshot.rows.length,
      eligible: contentUnits.length,
      blocked: snapshot.rows.length - readySources,
      created,
      replayed: contentUnits.length - created,
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
  const intakeDatabaseUrl = process.env.CANDIDATE_INTAKE_DATABASE_URL;
  if (!intakeDatabaseUrl) {
    throw new Error("library_analysis_content_intake_database_url_missing");
  }
  const snapshot = LibraryAnalysisPopulationSnapshotSchema.parse(
    JSON.parse(readFileSync(resolve(options.snapshot), "utf8")),
  );
  const plan = LibraryAnalysisAcquisitionPlanSchema.parse(
    JSON.parse(readFileSync(resolve(options.plan), "utf8")),
  );
  const resolution = LibraryAnalysisAcquisitionResolutionSchema.parse(
    JSON.parse(readFileSync(resolve(options.resolution), "utf8")),
  );
  const contentUnitManifest = verifyLibraryAnalysisContentUnitManifest(
    JSON.parse(readFileSync(resolve(options.contentUnits), "utf8")) as LibraryAnalysisContentUnitManifest,
  );
  const privateUnits = new Map(
    contentUnitManifest.units.map((unit) => [unit.privateArtifact.portablePath, unit]),
  );
  const [{ PrismaPg }, { PrismaClient: RuntimePrismaClient }] = await Promise.all([
    import("@prisma/adapter-pg"),
    import("../../src/generated/prisma/client"),
  ]);
  const intakePrisma: PrismaClient = new RuntimePrismaClient({
    adapter: new PrismaPg({ connectionString: intakeDatabaseUrl }),
  });
  try {
    const writer = createCandidateContentUnitIntakeWriter(intakePrisma);
    const receipt = await ingestResolvedLibraryAnalysisContentUnits({
      snapshot,
      plan,
      resolution,
      contentUnitManifest,
      readUnit: async (portablePath) => {
        const unit = privateUnits.get(portablePath);
        if (!unit) throw new Error("library_analysis_private_unit_descriptor_missing");
        return readAndVerifyPrivateArtifact(options.runRoot, portablePath, {
          sha256: unit.privateArtifact.sha256,
          sizeBytes: unit.privateArtifact.sizeBytes,
          mode: 0o400,
        });
      },
      append: (unit) => writer.appendContentUnit(unit),
    });
    process.stdout.write(`${JSON.stringify(receipt)}\n`);
  } finally {
    await intakePrisma.$disconnect();
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
