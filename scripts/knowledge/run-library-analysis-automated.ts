#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

import { z } from "zod";

import type { PrismaClient } from "../../src/generated/prisma/client";
import {
  LibraryAnalysisRequestBatchSchema,
  LibraryAnalysisRequestSchema,
  LibraryAnalysisResponseSchema,
  LibraryValidationRequestSchema,
  LibraryValidationResponseSchema,
  buildLibraryAnalysisCandidatePlan,
  buildLibraryAnalysisRequestBatch,
  buildLibraryValidationCandidatePlan,
  buildLibraryValidationRequest,
  ingestAnalysisResponsesAtomically,
  ingestValidationResponsesAtomically,
  parseLibraryAnalysisAutomatedArgs,
  persistLibraryAnalysisCandidatePlan,
  persistLibraryValidationCandidatePlan,
  writeLibraryAnalysisPrivateArtifact,
  type LibraryAnalysisAutomatedCliOptions,
} from "../../src/lib/knowledge/library-analysis-automated-runner";
import { createCandidateAnalysisWriter } from "../../src/lib/knowledge/candidate-analysis-writer";
import { LibraryAnalysisPopulationSnapshotSchema } from "../../src/lib/knowledge/library-analysis-population";

const hashSchema = z.string().regex(/^[a-f0-9]{64}$/);
const identifierSchema = z.string().regex(/^[a-z0-9][a-z0-9._:-]*$/);

const EmissionContentSchema = z.object({
  schema: z.literal("library-analysis-emission-content/v1"),
  contentUnits: z.array(z.object({
    sourceKey: identifierSchema,
    id: identifierSchema,
    locator: z.string().min(1),
    contentHash: hashSchema,
    text: z.string().min(1),
  }).strict()),
}).strict();

const AnalysisIngestBatchSchema = z.object({
  schema: z.literal("library-analysis-ingest-batch/v1"),
  requests: z.array(LibraryAnalysisRequestSchema).min(1),
  responses: z.array(LibraryAnalysisResponseSchema).min(1),
}).strict();

const ValidationEmissionSchema = z.object({
  schema: z.literal("library-validation-emission/v1"),
  analyses: z.array(z.object({
    analysisRequest: LibraryAnalysisRequestSchema,
    analysisRunId: identifierSchema,
    analysisOutputManifestHash: hashSchema,
    assertions: z.array(z.object({
      assertionId: identifierSchema,
      payloadHash: hashSchema,
    }).strict()).min(1),
  }).strict()).min(1),
}).strict();

const ValidationIngestBatchSchema = z.object({
  schema: z.literal("library-validation-ingest-batch/v1"),
  requests: z.array(LibraryValidationRequestSchema).min(1),
  responses: z.array(LibraryValidationResponseSchema).min(1),
}).strict();

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(resolve(path), "utf8"));
}

async function workerPrisma(): Promise<PrismaClient> {
  const databaseUrl = process.env.CANDIDATE_WORKER_DATABASE_URL;
  if (!databaseUrl) throw new Error("candidate_worker_database_url_missing");
  const [{ PrismaPg }, { PrismaClient: RuntimePrismaClient }] = await Promise.all([
    import("@prisma/adapter-pg"),
    import("../../src/generated/prisma/client"),
  ]);
  return new RuntimePrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });
}

async function runEmitAnalysis(
  options: LibraryAnalysisAutomatedCliOptions & { population: string },
): Promise<{ requestTotal: number; populationHash: string }> {
  const snapshot = LibraryAnalysisPopulationSnapshotSchema.parse(
    readJson(options.population),
  );
  const emission = EmissionContentSchema.parse(readJson(options.input));
  const batch = buildLibraryAnalysisRequestBatch({
    snapshot,
    contentUnits: emission.contentUnits,
    repositoryRoot: process.cwd(),
  });
  writeLibraryAnalysisPrivateArtifact(options.output, batch);
  return { requestTotal: batch.requests.length, populationHash: batch.populationHash };
}

async function runIngestAnalysis(
  options: LibraryAnalysisAutomatedCliOptions,
): Promise<{ runTotal: number }> {
  const batch = AnalysisIngestBatchSchema.parse(readJson(options.input));
  const prisma = await workerPrisma();
  const receipts: Array<{
    requestHash: string;
    analysisRunId: string;
    analysisOutputManifestHash: string;
    assertions: Array<{ assertionId: string; payloadHash: string }>;
  }> = [];
  try {
    await ingestAnalysisResponsesAtomically({
      requests: batch.requests,
      responses: batch.responses,
      transaction: async (accepted) => {
        await prisma.$transaction(async (transaction) => {
          const writer = createCandidateAnalysisWriter(
            transaction as unknown as PrismaClient,
          );
          for (const pair of accepted) {
            const plan = buildLibraryAnalysisCandidatePlan(pair);
            await persistLibraryAnalysisCandidatePlan(writer, plan);
            receipts.push({
              requestHash: pair.response.requestHash,
              analysisRunId: plan.run.id,
              analysisOutputManifestHash: plan.outputManifestHash,
              assertions: plan.assertions.map((assertion) => ({
                assertionId: assertion.id,
                payloadHash: assertion.payloadHash,
              })),
            });
          }
        }, { maxWait: 5_000, timeout: 60_000 });
      },
    });
    writeLibraryAnalysisPrivateArtifact(options.output, {
      schema: "library-analysis-ingest-receipt/v1",
      analyses: receipts,
    });
    return { runTotal: receipts.length };
  } finally {
    await prisma.$disconnect();
  }
}

async function runEmitValidation(
  options: LibraryAnalysisAutomatedCliOptions,
): Promise<{ requestTotal: number }> {
  const emission = ValidationEmissionSchema.parse(readJson(options.input));
  const requests = emission.analyses.map((analysis) =>
    buildLibraryValidationRequest({
      ...analysis,
      repositoryRoot: process.cwd(),
    })
  );
  writeLibraryAnalysisPrivateArtifact(options.output, {
    schema: "library-validation-request-batch/v1",
    requests,
  });
  return { requestTotal: requests.length };
}

async function runIngestValidation(
  options: LibraryAnalysisAutomatedCliOptions,
): Promise<{ runTotal: number }> {
  const batch = ValidationIngestBatchSchema.parse(readJson(options.input));
  const prisma = await workerPrisma();
  const receipts: Array<{
    requestHash: string;
    validationRunId: string;
    outputManifestHash: string | null;
    disposition: string;
    machineUse: string;
    automatedOnly: true;
  }> = [];
  try {
    await ingestValidationResponsesAtomically({
      requests: batch.requests,
      responses: batch.responses,
      transaction: async (accepted) => {
        await prisma.$transaction(async (transaction) => {
          const writer = createCandidateAnalysisWriter(
            transaction as unknown as PrismaClient,
          );
          for (const pair of accepted) {
            const plan = buildLibraryValidationCandidatePlan(pair);
            await persistLibraryValidationCandidatePlan(writer, plan);
            receipts.push({
              requestHash: pair.response.requestHash,
              validationRunId: plan.run.id,
              outputManifestHash: plan.outputManifestHash,
              disposition: plan.result.disposition,
              machineUse: plan.result.machineUse,
              automatedOnly: true,
            });
          }
        }, { maxWait: 5_000, timeout: 60_000 });
      },
    });
    writeLibraryAnalysisPrivateArtifact(options.output, {
      schema: "library-validation-ingest-receipt/v1",
      validations: receipts,
    });
    return { runTotal: receipts.length };
  } finally {
    await prisma.$disconnect();
  }
}

async function runStatus(
  options: LibraryAnalysisAutomatedCliOptions,
): Promise<{ recordTotal: number }> {
  const input = z.object({
    schema: z.string().min(1),
    validations: z.array(z.object({
      disposition: z.string().min(1),
      machineUse: z.string().min(1),
      automatedOnly: z.literal(true),
    }).passthrough()),
  }).passthrough().parse(readJson(options.input));
  const dispositions = Object.fromEntries(
    [...new Set(input.validations.map(({ disposition }) => disposition))]
      .sort()
      .map((disposition) => [
        disposition,
        input.validations.filter((value) => value.disposition === disposition).length,
      ]),
  );
  writeLibraryAnalysisPrivateArtifact(options.output, {
    schema: "library-analysis-automated-runner-status/v1",
    automatedOnly: true,
    recordTotal: input.validations.length,
    dispositions,
    externalReady: false,
  });
  return { recordTotal: input.validations.length };
}

export async function runLibraryAnalysisAutomatedCli(
  options: LibraryAnalysisAutomatedCliOptions,
): Promise<void> {
  const summary = options.mode === "emit-analysis"
    ? await runEmitAnalysis(options as LibraryAnalysisAutomatedCliOptions & { population: string })
    : options.mode === "ingest-analysis"
      ? await runIngestAnalysis(options)
      : options.mode === "emit-validation"
        ? await runEmitValidation(options)
        : options.mode === "ingest-validation"
          ? await runIngestValidation(options)
          : await runStatus(options);
  process.stdout.write(`${JSON.stringify(summary)}\n`);
}

const invokedPath = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : null;
if (invokedPath === import.meta.url) {
  void (async () => {
    try {
      await runLibraryAnalysisAutomatedCli(
        parseLibraryAnalysisAutomatedArgs(process.argv.slice(2)),
      );
    } catch {
      process.stderr.write("library_analysis_automated_runner_failed\n");
      process.exitCode = 1;
    }
  })();
}
