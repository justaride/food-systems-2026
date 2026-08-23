#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { basename, dirname, isAbsolute, resolve } from "node:path";
import { pathToFileURL } from "node:url";

import type { PrismaClient } from "../../src/generated/prisma/client";
import {
  buildLibraryAnalysisAcquisitionPlan,
  LibraryAnalysisAcquisitionPlanSchema,
  type LibraryAnalysisAcquisitionLocator,
  type LibraryAnalysisAcquisitionPlan,
} from "../../src/lib/knowledge/library-analysis-acquisition-contract";
import {
  candidateAnalysisSha256,
  compareCandidateJsonKeysUtf8,
} from "../../src/lib/knowledge/candidate-analysis-contract";
import {
  LIBRARY_ANALYSIS_POPULATION_SCHEMA,
  LibraryAnalysisPopulationSnapshotSchema,
  libraryAnalysisPopulationHash,
  type LibraryAnalysisPopulationSnapshot,
} from "../../src/lib/knowledge/library-analysis-population";
import {
  openPrivateLibraryAnalysisRunRoot,
  writePrivateManifestAtomic,
} from "../../src/lib/knowledge/private-library-analysis-artifact-store";

export type LibraryAnalysisPilotDatabaseFact = {
  sourceKey: string;
  hasSummary: boolean;
  contentCodePoints: number;
};

export type LibraryAnalysisPilotScope = {
  schema: "library-analysis-pilot-scope/v1";
  selectionHash: string;
  sourceKeys: string[];
  snapshot: LibraryAnalysisPopulationSnapshot;
  plan: LibraryAnalysisAcquisitionPlan;
  routeCounts: Record<string, number>;
};

export function buildLibraryAnalysisPilotScope(input: {
  snapshot: LibraryAnalysisPopulationSnapshot;
  plan: LibraryAnalysisAcquisitionPlan;
  databaseDocuments: readonly LibraryAnalysisPilotDatabaseFact[];
}): LibraryAnalysisPilotScope {
  const snapshot = LibraryAnalysisPopulationSnapshotSchema.parse(input.snapshot);
  const plan = LibraryAnalysisAcquisitionPlanSchema.parse(input.plan);
  if (
    plan.populationSnapshotId !== snapshot.snapshotId ||
    plan.populationHash !== snapshot.populationHash
  ) {
    throw new Error("library_analysis_pilot_scope_binding_mismatch");
  }
  const facts = new Map<string, LibraryAnalysisPilotDatabaseFact>();
  for (const fact of input.databaseDocuments) {
    if (
      facts.has(fact.sourceKey) ||
      !Number.isSafeInteger(fact.contentCodePoints) ||
      fact.contentCodePoints < 0
    ) {
      throw new Error("library_analysis_pilot_database_fact_invalid");
    }
    facts.set(fact.sourceKey, fact);
  }
  const eligibleDocumentKeys = plan.rows
    .filter((row) => row.route === "database_document")
    .map((row) => row.sourceKey);
  if (
    facts.size !== eligibleDocumentKeys.length ||
    eligibleDocumentKeys.some((sourceKey) => !facts.has(sourceKey))
  ) {
    throw new Error("library_analysis_pilot_database_facts_incomplete");
  }
  const orderedDocuments = [...facts.values()].sort((left, right) =>
    right.contentCodePoints - left.contentCodePoints ||
    compareCandidateJsonKeysUtf8(left.sourceKey, right.sourceKey));
  const largest = orderedDocuments[0];
  const withSummary = orderedDocuments.find(
    (fact) => fact.hasSummary && fact.sourceKey !== largest?.sourceKey,
  );
  if (!largest || !withSummary) throw new Error("library_analysis_pilot_document_classes_missing");

  const routeRows = (route: LibraryAnalysisAcquisitionPlan["rows"][number]["route"]) =>
    plan.rows.filter((row) => row.route === route);
  const html = routeRows("controlled_https").find(
    (row) => row.locator !== null && !looksLikePdf(row.locator),
  );
  const pdf = routeRows("controlled_https").find(
    (row) => row.locator !== null && looksLikePdf(row.locator),
  );
  const selectedRows = [
    plan.rows.find((row) => row.sourceKey === largest.sourceKey),
    plan.rows.find((row) => row.sourceKey === withSummary.sourceKey),
    html,
    pdf,
    routeRows("repository_csv")[0],
    routeRows("repository_pptx")[0],
    routeRows("database_derived_record")[0],
    routeRows("unresolvable")[0],
  ];
  if (selectedRows.some((row) => row === undefined)) {
    throw new Error("library_analysis_pilot_route_classes_missing");
  }
  const sourceKeys = selectedRows
    .map((row) => row!.sourceKey)
    .sort(compareCandidateJsonKeysUtf8);
  if (new Set(sourceKeys).size !== 8) throw new Error("library_analysis_pilot_scope_not_unique");
  const selected = new Set(sourceKeys);
  const populationRows = snapshot.rows.filter((row) => selected.has(row.sourceKey));
  if (populationRows.length !== 8) throw new Error("library_analysis_pilot_population_incomplete");
  const populationCore = {
    schema: LIBRARY_ANALYSIS_POPULATION_SCHEMA,
    rows: populationRows,
  } as const;
  const populationHash = libraryAnalysisPopulationHash(populationCore);
  const pilotSnapshot = LibraryAnalysisPopulationSnapshotSchema.parse({
    ...populationCore,
    snapshotId: `library-analysis-population:${populationHash}`,
    populationHash,
  });
  const locatorRows: LibraryAnalysisAcquisitionLocator[] = selectedRows.flatMap((row) => {
    if (
      row!.route === "database_document" ||
      row!.route === "superseded"
    ) return [];
    return [{
      sourceKind: row!.sourceKind,
      sourceKey: row!.sourceKey,
      route: row!.route,
      locator: row!.locator,
      alternateLocators: row!.alternateLocators,
    } as LibraryAnalysisAcquisitionLocator];
  });
  const pilotPlan = buildLibraryAnalysisAcquisitionPlan(pilotSnapshot, locatorRows);
  const routeCounts: Record<string, number> = {};
  for (const row of pilotPlan.rows) routeCounts[row.route] = (routeCounts[row.route] ?? 0) + 1;
  const selectionHash = candidateAnalysisSha256("library-analysis-pilot-selection", {
    parentPopulationHash: snapshot.populationHash,
    parentPlanHash: plan.planHash,
    sourceKeys,
  });
  return {
    schema: "library-analysis-pilot-scope/v1",
    selectionHash,
    sourceKeys,
    snapshot: pilotSnapshot,
    plan: pilotPlan,
    routeCounts,
  };
}

function looksLikePdf(locator: string): boolean {
  try {
    return new URL(locator).pathname.toLowerCase().endsWith(".pdf");
  } catch {
    return false;
  }
}

export type LibraryAnalysisPilotSelectionCliOptions = {
  snapshot: string;
  plan: string;
  outputRoot: string;
};

export function parseLibraryAnalysisPilotSelectionArgs(
  arguments_: readonly string[],
): LibraryAnalysisPilotSelectionCliOptions {
  const values = new Map<string, string>();
  for (const argument of arguments_) {
    const match = /^--(snapshot|plan|output-root)=(.*)$/u.exec(argument);
    if (!match) throw new Error("library_analysis_pilot_selection_argument_unknown");
    if (values.has(match[1]!)) throw new Error("library_analysis_pilot_selection_argument_duplicate");
    const value = match[2]!;
    if (!isAbsolute(value) || /[\u0000-\u001f\u007f]/.test(value)) {
      throw new Error("library_analysis_pilot_selection_path_invalid");
    }
    values.set(match[1]!, resolve(value));
  }
  const snapshot = values.get("snapshot");
  const plan = values.get("plan");
  const outputRoot = values.get("output-root");
  if (!snapshot || !plan || !outputRoot) {
    throw new Error("library_analysis_pilot_selection_arguments_invalid");
  }
  return { snapshot, plan, outputRoot };
}

async function main(): Promise<void> {
  const options = parseLibraryAnalysisPilotSelectionArgs(process.argv.slice(2));
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("library_analysis_pilot_selection_database_url_missing");
  const snapshot = LibraryAnalysisPopulationSnapshotSchema.parse(
    JSON.parse(readFileSync(options.snapshot, "utf8")),
  );
  const plan = LibraryAnalysisAcquisitionPlanSchema.parse(
    JSON.parse(readFileSync(options.plan, "utf8")),
  );
  const ids = plan.rows
    .filter((row) => row.route === "database_document")
    .map((row) => row.sourceKey.replace(/^document:/u, ""));
  const [{ PrismaPg }, { PrismaClient: RuntimePrismaClient }] = await Promise.all([
    import("@prisma/adapter-pg"),
    import("../../src/generated/prisma/client"),
  ]);
  const prisma: PrismaClient = new RuntimePrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });
  try {
    const documents = await prisma.$transaction(async (transaction) => {
      await transaction.$executeRawUnsafe("SET TRANSACTION READ ONLY");
      return transaction.document.findMany({
        where: { id: { in: ids } },
        select: { id: true, summary: true, content: true },
      });
    }, { isolationLevel: "RepeatableRead" });
    const scope = buildLibraryAnalysisPilotScope({
      snapshot,
      plan,
      databaseDocuments: documents.map((document) => ({
        sourceKey: `document:${document.id}`,
        hasSummary: Boolean(document.summary && document.summary.length > 0),
        contentCodePoints: Array.from(document.content).length,
      })),
    });
    const outputRoot = openPrivateLibraryAnalysisRunRoot(
      dirname(options.outputRoot),
      basename(options.outputRoot),
    );
    if (outputRoot !== options.outputRoot) {
      throw new Error("library_analysis_pilot_output_root_mismatch");
    }
    writePrivateManifestAtomic(
      outputRoot,
      "pilot-selection.v1.json",
      Buffer.from(`${JSON.stringify({
        schema: scope.schema,
        selectionHash: scope.selectionHash,
        sourceKeys: scope.sourceKeys,
      }, null, 2)}\n`, "utf8"),
    );
    writePrivateManifestAtomic(
      outputRoot,
      "pilot-population.v1.json",
      Buffer.from(`${JSON.stringify(scope.snapshot, null, 2)}\n`, "utf8"),
    );
    writePrivateManifestAtomic(
      outputRoot,
      "pilot-acquisition-plan.v1.json",
      Buffer.from(`${JSON.stringify(scope.plan, null, 2)}\n`, "utf8"),
    );
    process.stdout.write(`${JSON.stringify({
      selectionHash: scope.selectionHash,
      populationHash: scope.snapshot.populationHash,
      planHash: scope.plan.planHash,
      rows: scope.snapshot.rows.length,
      routeCounts: scope.routeCounts,
    })}\n`);
  } finally {
    await prisma.$disconnect();
  }
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : null;
if (invokedPath === import.meta.url) {
  main().catch(() => {
    process.stderr.write("library_analysis_pilot_selection_failed\n");
    process.exitCode = 1;
  });
}
