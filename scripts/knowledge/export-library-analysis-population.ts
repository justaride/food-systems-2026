#!/usr/bin/env node

import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { Prisma, type PrismaClient } from "../../src/generated/prisma/client";
import {
  buildLibraryAnalysisPopulation,
  type LibraryAnalysisPopulationInputRow,
} from "../../src/lib/knowledge/library-analysis-population";
import { writeCandidateControlSnapshotAtomic } from "./export-candidate-control-snapshot";

export type LibraryAnalysisPopulationCliOptions = {
  output: string;
  sourceKeys: string[];
};

export function parseLibraryAnalysisPopulationArgs(
  arguments_: readonly string[],
): LibraryAnalysisPopulationCliOptions {
  let output: string | null = null;
  const sourceKeys: string[] = [];
  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index]!;
    const next = arguments_[index + 1];
    if (argument === "--output") {
      if (output !== null || next === undefined) throw new Error("invalid_output_argument");
      output = next;
      index += 1;
      continue;
    }
    if (argument.startsWith("--output=")) {
      if (output !== null) throw new Error("duplicate_output_argument");
      output = argument.slice("--output=".length);
      continue;
    }
    if (argument === "--source-key") {
      if (next === undefined) throw new Error("invalid_source_key_argument");
      sourceKeys.push(next);
      index += 1;
      continue;
    }
    if (argument.startsWith("--source-key=")) {
      sourceKeys.push(argument.slice("--source-key=".length));
      continue;
    }
    throw new Error("unknown_library_analysis_population_argument");
  }
  if (
    output === null ||
    output.length === 0 ||
    /[\u0000-\u001f\u007f]/.test(output) ||
    sourceKeys.some((key) => key.length === 0 || /[\u0000-\u001f\u007f]/.test(key)) ||
    new Set(sourceKeys).size !== sourceKeys.length
  ) {
    throw new Error("invalid_library_analysis_population_arguments");
  }
  return { output, sourceKeys: [...sourceKeys].sort() };
}

const READ_ONLY_TRANSACTION_SQL = "SET TRANSACTION READ ONLY";

export async function readLibraryAnalysisPopulationRows(
  prisma: PrismaClient,
  sourceKeys: readonly string[],
): Promise<LibraryAnalysisPopulationInputRow[]> {
  return prisma.$transaction(
    async (transaction) => {
      await transaction.$executeRawUnsafe(READ_ONLY_TRANSACTION_SQL);
      const records = await transaction.libraryAnalysisRecord.findMany({
        where: sourceKeys.length > 0 ? { sourceKey: { in: [...sourceKeys] } } : undefined,
        select: {
          sourceKind: true,
          sourceKey: true,
          status: true,
          contentHash: true,
          documentId: true,
          document: { select: { id: true, content: true } },
        },
      });
      if (sourceKeys.length > 0) {
        const found = new Set(records.map(({ sourceKey }) => sourceKey));
        if (sourceKeys.some((sourceKey) => !found.has(sourceKey))) {
          throw new Error("requested_population_source_missing");
        }
      }
      return records.map((record) => {
        const content = record.document?.content ?? "";
        const readableInput = content.length > 0;
        const computedHash = readableInput
          ? createHash("sha256").update(Buffer.from(content, "utf8")).digest("hex")
          : null;
        const exactBinding =
          record.sourceKind === "document" &&
          record.documentId !== null &&
          record.document?.id === record.documentId &&
          record.sourceKey === `document:${record.documentId}`;
        const storedHashValid =
          record.contentHash === null || record.contentHash === computedHash;
        return {
          sourceKind: record.sourceKind,
          sourceKey: record.sourceKey,
          sourceVersionHash: storedHashValid ? computedHash : null,
          inputKind: readableInput ? "database_record" : "none",
          locator: record.documentId === null
            ? null
            : `database:Document:${record.documentId}:content`,
          contentHash: storedHashValid ? computedHash : null,
          identityConfidence: exactBinding
            ? "exact"
            : record.documentId === null
              ? "unresolved"
              : "provisional",
          readableInput,
          superseded: record.status.toLowerCase() === "superseded",
        } satisfies LibraryAnalysisPopulationInputRow;
      });
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
  );
}

export async function runLibraryAnalysisPopulationCli(
  options: LibraryAnalysisPopulationCliOptions,
): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (databaseUrl === undefined || databaseUrl.length === 0) {
    throw new Error("library_analysis_population_database_url_missing");
  }
  const [{ PrismaPg }, { PrismaClient: RuntimePrismaClient }] = await Promise.all([
    import("@prisma/adapter-pg"),
    import("../../src/generated/prisma/client"),
  ]);
  const prisma: PrismaClient = new RuntimePrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });
  try {
    const rows = await readLibraryAnalysisPopulationRows(prisma, options.sourceKeys);
    const snapshot = buildLibraryAnalysisPopulation(rows);
    writeCandidateControlSnapshotAtomic(
      options.output,
      `${JSON.stringify(snapshot, null, 2)}\n`,
    );
    const counts = snapshot.rows.reduce<Record<string, number>>((result, row) => {
      result[row.eligibility] = (result[row.eligibility] ?? 0) + 1;
      return result;
    }, {});
    process.stdout.write(
      `${JSON.stringify({ snapshotId: snapshot.snapshotId, populationHash: snapshot.populationHash, populationTotal: snapshot.rows.length, counts })}\n`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : null;
if (invokedPath === import.meta.url) {
  void (async () => {
    try {
      await runLibraryAnalysisPopulationCli(
        parseLibraryAnalysisPopulationArgs(process.argv.slice(2)),
      );
    } catch {
      process.stderr.write("library_analysis_population_export_failed\n");
      process.exitCode = 1;
    }
  })();
}
