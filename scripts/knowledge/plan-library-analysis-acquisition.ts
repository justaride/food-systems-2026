#!/usr/bin/env node

import { lstatSync, readFileSync, realpathSync } from "node:fs";
import { basename, dirname, extname, isAbsolute, resolve, sep } from "node:path";
import { pathToFileURL } from "node:url";

import type { PrismaClient } from "../../src/generated/prisma/client";
import {
  buildLibraryAnalysisAcquisitionPlan,
  type LibraryAnalysisAcquisitionLocator,
} from "../../src/lib/knowledge/library-analysis-acquisition-contract";
import { compareCandidateJsonKeysUtf8 } from "../../src/lib/knowledge/candidate-analysis-contract";
import {
  LibraryAnalysisPopulationSnapshotSchema,
  type LibraryAnalysisPopulationSnapshot,
} from "../../src/lib/knowledge/library-analysis-population";
import {
  openPrivateLibraryAnalysisRunRoot,
  writePrivateManifestAtomic,
} from "../../src/lib/knowledge/private-library-analysis-artifact-store";

export type LibraryAnalysisAcquisitionPlanCliOptions = {
  snapshot: string;
  output: string;
};

export function parseLibraryAnalysisAcquisitionPlanArgs(
  arguments_: readonly string[],
): LibraryAnalysisAcquisitionPlanCliOptions {
  let snapshot: string | null = null;
  let output: string | null = null;
  for (const argument of arguments_) {
    if (argument.startsWith("--snapshot=")) {
      if (snapshot !== null) throw new Error("acquisition_plan_snapshot_duplicate");
      snapshot = parsePrivateAbsolutePath(argument.slice("--snapshot=".length));
      continue;
    }
    if (argument.startsWith("--output=")) {
      if (output !== null) throw new Error("acquisition_plan_output_duplicate");
      output = parsePrivateAbsolutePath(argument.slice("--output=".length));
      continue;
    }
    throw new Error("acquisition_plan_argument_unknown");
  }
  if (snapshot === null || output === null || snapshot === output) {
    throw new Error("acquisition_plan_arguments_invalid");
  }
  return { snapshot, output };
}

export type LibraryAnalysisAcquisitionPlanningFacts = {
  sourceDocs: Array<{
    id: string;
    url: string | null;
    doi: string | null;
    archivedUrl: string | null;
  }>;
  reports: Array<{
    id: string;
    sourceUrl: string | null;
    doi: string | null;
    supportingSources: unknown;
  }>;
  theses: Array<{
    id: string;
    url: string;
    doi: string | null;
  }>;
  repositoryFiles: Array<{
    path: string;
    kind: "csv" | "pptx";
  }>;
};

export function buildLibraryAnalysisAcquisitionLocators(
  rawPopulation: LibraryAnalysisPopulationSnapshot,
  facts: LibraryAnalysisAcquisitionPlanningFacts,
): LibraryAnalysisAcquisitionLocator[] {
  const population = LibraryAnalysisPopulationSnapshotSchema.parse(rawPopulation);
  const sourceDocs = new Map(facts.sourceDocs.map((row) => [row.id, row]));
  const reports = new Map(facts.reports.map((row) => [row.id, row]));
  const theses = new Map(facts.theses.map((row) => [row.id, row]));
  const repositoryFiles = new Map(facts.repositoryFiles.map((row) => [row.path, row]));
  const locators = population.rows
    .filter((row) => row.eligibility === "blocked_input")
    .map((row): LibraryAnalysisAcquisitionLocator => {
      const id = row.sourceKey.slice(row.sourceKey.indexOf(":") + 1);
      if (row.sourceKind === "source_doc") {
        const source = sourceDocs.get(id);
        return externalLocator(row.sourceKind, row.sourceKey, source
          ? [source.url, doiLocator(source.doi), source.archivedUrl]
          : []);
      }
      if (row.sourceKind === "report") {
        const report = reports.get(id);
        const external = report
          ? normalizedHttpsLocators([report.sourceUrl, doiLocator(report.doi)])
          : [];
        if (external.length > 0) {
          return locatorFromCandidates(row.sourceKind, row.sourceKey, external);
        }
        if (report && Array.isArray(report.supportingSources) && report.supportingSources.length > 0) {
          return {
            sourceKind: row.sourceKind,
            sourceKey: row.sourceKey,
            route: "database_derived_record",
            locator: `database:Report:${report.id}`,
            alternateLocators: [],
          };
        }
        return unresolvedLocator(row.sourceKind, row.sourceKey);
      }
      if (row.sourceKind === "thesis") {
        const thesis = theses.get(id);
        return externalLocator(row.sourceKind, row.sourceKey, thesis
          ? [thesis.url, doiLocator(thesis.doi)]
          : []);
      }
      if (row.sourceKind === "library_file") {
        const file = repositoryFiles.get(id);
        if (file) {
          return {
            sourceKind: row.sourceKind,
            sourceKey: row.sourceKey,
            route: file.kind === "csv" ? "repository_csv" : "repository_pptx",
            locator: `repository:${file.path}`,
            alternateLocators: [],
          };
        }
      }
      return unresolvedLocator(row.sourceKind, row.sourceKey);
    });
  return locators.sort(compareLocatorIdentity);
}

export async function readLibraryAnalysisAcquisitionPlanningFacts(
  prisma: PrismaClient,
  rawPopulation: LibraryAnalysisPopulationSnapshot,
  repositoryRoot: string,
): Promise<LibraryAnalysisAcquisitionPlanningFacts> {
  const population = LibraryAnalysisPopulationSnapshotSchema.parse(rawPopulation);
  const ids = (sourceKind: string) => population.rows
    .filter((row) => row.eligibility === "blocked_input" && row.sourceKind === sourceKind)
    .map((row) => row.sourceKey.slice(row.sourceKey.indexOf(":") + 1));
  const databaseFacts = await prisma.$transaction(async (transaction) => {
    await transaction.$executeRawUnsafe("SET TRANSACTION READ ONLY");
    const [sourceDocs, reports, theses] = await Promise.all([
      transaction.sourceDoc.findMany({
        where: { id: { in: ids("source_doc") } },
        select: { id: true, url: true, doi: true, archivedUrl: true },
      }),
      transaction.report.findMany({
        where: { id: { in: ids("report") } },
        select: { id: true, sourceUrl: true, doi: true, supportingSources: true },
      }),
      transaction.thesis.findMany({
        where: { id: { in: ids("thesis") } },
        select: { id: true, url: true, doi: true },
      }),
    ]);
    return { sourceDocs, reports, theses };
  }, { isolationLevel: "RepeatableRead" });
  const repositoryFiles: LibraryAnalysisAcquisitionPlanningFacts["repositoryFiles"] =
    ids("library_file").flatMap((path) => {
    const kind = extname(path).toLowerCase() === ".csv"
      ? "csv"
      : extname(path).toLowerCase() === ".pptx"
        ? "pptx"
        : null;
    if (kind === null || !isSafeRepositoryFile(repositoryRoot, path)) return [];
      return [{ path, kind }];
    });
  return { ...databaseFacts, repositoryFiles };
}

export async function runLibraryAnalysisAcquisitionPlanCli(
  options: LibraryAnalysisAcquisitionPlanCliOptions,
): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("library_analysis_acquisition_database_url_missing");
  const population = LibraryAnalysisPopulationSnapshotSchema.parse(
    JSON.parse(readFileSync(options.snapshot, "utf8")),
  );
  const [{ PrismaPg }, { PrismaClient: RuntimePrismaClient }] = await Promise.all([
    import("@prisma/adapter-pg"),
    import("../../src/generated/prisma/client"),
  ]);
  const prisma: PrismaClient = new RuntimePrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });
  try {
    const facts = await readLibraryAnalysisAcquisitionPlanningFacts(
      prisma,
      population,
      process.cwd(),
    );
    const plan = buildLibraryAnalysisAcquisitionPlan(
      population,
      buildLibraryAnalysisAcquisitionLocators(population, facts),
    );
    const outputRoot = openPrivateLibraryAnalysisRunRoot(
      dirname(dirname(options.output)),
      basename(dirname(options.output)),
    );
    if (resolve(outputRoot) !== resolve(dirname(options.output))) {
      throw new Error("acquisition_plan_output_root_mismatch");
    }
    writePrivateManifestAtomic(
      outputRoot,
      basename(options.output),
      Buffer.from(`${JSON.stringify(plan, null, 2)}\n`, "utf8"),
    );
    process.stdout.write(`${JSON.stringify({
      planId: plan.planId,
      planHash: plan.planHash,
      populationHash: plan.populationHash,
      rows: plan.rows.length,
    })}\n`);
  } finally {
    await prisma.$disconnect();
  }
}

function parsePrivateAbsolutePath(value: string): string {
  if (
    value.length === 0 ||
    !isAbsolute(value) ||
    /[\u0000-\u001f\u007f]/.test(value)
  ) {
    throw new Error("acquisition_plan_path_invalid");
  }
  return resolve(value);
}

function externalLocator(
  sourceKind: string,
  sourceKey: string,
  candidates: Array<string | null>,
): LibraryAnalysisAcquisitionLocator {
  const normalized = normalizedHttpsLocators(candidates);
  return normalized.length > 0
    ? locatorFromCandidates(sourceKind, sourceKey, normalized)
    : unresolvedLocator(sourceKind, sourceKey);
}

function locatorFromCandidates(
  sourceKind: string,
  sourceKey: string,
  candidates: string[],
): LibraryAnalysisAcquisitionLocator {
  return {
    sourceKind,
    sourceKey,
    route: "controlled_https",
    locator: candidates[0]!,
    alternateLocators: candidates.slice(1),
  };
}

function unresolvedLocator(sourceKind: string, sourceKey: string): LibraryAnalysisAcquisitionLocator {
  return { sourceKind, sourceKey, route: "unresolvable", locator: null, alternateLocators: [] };
}

function doiLocator(doi: string | null): string | null {
  if (!doi) return null;
  return `https://doi.org/${doi.replace(/^https?:\/\/(?:dx\.)?doi\.org\//iu, "")}`;
}

function normalizedHttpsLocators(values: Array<string | null>): string[] {
  const locators = new Set<string>();
  for (const value of values) {
    if (!value) continue;
    try {
      const url = new URL(value);
      if (
        url.protocol === "https:" &&
        !url.username &&
        !url.password &&
        !url.hash
      ) locators.add(url.href);
    } catch {
      continue;
    }
  }
  return [...locators];
}

function compareLocatorIdentity(
  left: LibraryAnalysisAcquisitionLocator,
  right: LibraryAnalysisAcquisitionLocator,
): number {
  const kind = compareCandidateJsonKeysUtf8(left.sourceKind, right.sourceKind);
  return kind === 0
    ? compareCandidateJsonKeysUtf8(left.sourceKey, right.sourceKey)
    : kind;
}

function isSafeRepositoryFile(repositoryRoot: string, path: string): boolean {
  if (
    path.length === 0 ||
    isAbsolute(path) ||
    path.includes("\\") ||
    path.split("/").some((segment) => segment.length === 0 || segment === "." || segment === "..")
  ) return false;
  const root = realpathSync(repositoryRoot);
  const target = resolve(root, path);
  if (!target.startsWith(`${root}${sep}`)) return false;
  try {
    const stat = lstatSync(target);
    return stat.isFile() && !stat.isSymbolicLink() && realpathSync(target) === target;
  } catch {
    return false;
  }
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : null;
if (invokedPath === import.meta.url) {
  void runLibraryAnalysisAcquisitionPlanCli(
    parseLibraryAnalysisAcquisitionPlanArgs(process.argv.slice(2)),
  ).catch(() => {
    process.stderr.write("library_analysis_acquisition_plan_failed\n");
    process.exitCode = 1;
  });
}
