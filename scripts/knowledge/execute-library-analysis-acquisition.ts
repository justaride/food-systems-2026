#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { isAbsolute, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

import {
  canonicalCandidateJson,
  candidateAnalysisSha256,
  type CandidateJsonValue,
} from "../../src/lib/knowledge/candidate-analysis-contract";
import {
  LIBRARY_ANALYSIS_ACQUISITION_ROUTES,
  LibraryAnalysisAcquisitionPlanSchema,
  type LibraryAnalysisAcquisitionPlan,
  type LibraryAnalysisAcquisitionPlanRow,
} from "../../src/lib/knowledge/library-analysis-acquisition-contract";
import {
  extractLibraryAnalysisSource,
  type LibraryAnalysisExtractionAdapters,
  type LibraryAnalysisSourceExtractionResult,
} from "../../src/lib/knowledge/library-analysis-source-extraction";
import {
  readAndVerifyPrivateArtifact,
  sealPrivateArtifact,
  writePrivateArtifactExclusive,
  writePrivateManifestAtomic,
} from "../../src/lib/knowledge/private-library-analysis-artifact-store";
import {
  generateControlledHttpsFetchReceipt,
  type ControlledFetchRequest,
  type ControlledFetchResponse,
  type InjectedControlledFetch,
} from "./generate-source-acquisition-receipt";

export type LibraryAnalysisAcquisitionExecutionCliOptions = {
  plan: string;
  runRoot: string;
  mode: "check_only" | "execute_network";
};

export type LibraryAnalysisAcquisitionExecutionAdapters = {
  fetch: InjectedControlledFetch;
  extraction: LibraryAnalysisExtractionAdapters;
  wait: (milliseconds: number) => Promise<void>;
  now: () => string;
};

export type SanitizedLibraryAnalysisAcquisitionRow = {
  sourceKey: string;
  state: "ready" | "blocked" | "failed_retryable" | "not_executed";
  reasonCode:
    | "source_superseded"
    | "missing_locator"
    | "http_not_found"
    | "http_forbidden"
    | "transport_exhausted"
    | "response_too_large"
    | "unsupported_media_type"
    | "corrupt_payload"
    | "empty_extraction"
    | "ocr_required"
    | "identity_ambiguous"
    | null;
  rawSha256: string | null;
  normalizedTextSha256: string | null;
  unitCount: number;
};

export type LibraryAnalysisAcquisitionExecutionSummary = {
  mode: "check_only" | "execute_network";
  planHash: string;
  routeCounts: Partial<Record<(typeof LIBRARY_ANALYSIS_ACQUISITION_ROUTES)[number], number>>;
  rows: SanitizedLibraryAnalysisAcquisitionRow[];
};

type ExecutionInput = {
  plan: LibraryAnalysisAcquisitionPlan;
  runRoot: string;
  mode: "check_only" | "execute_network";
  adapters: LibraryAnalysisAcquisitionExecutionAdapters;
};

type ReadyFetchAttempt = {
  status: "ready";
  receipt: Awaited<ReturnType<typeof generateControlledHttpsFetchReceipt>>["receipt"];
  bodyBytes: Buffer;
};

type FailedFetchAttempt = {
  status: "blocked" | "failed_retryable";
  reasonCode: NonNullable<SanitizedLibraryAnalysisAcquisitionRow["reasonCode"]>;
  attempt: number;
};

type FetchAttempt = ReadyFetchAttempt | FailedFetchAttempt;

const MAXIMUM_ATTEMPTS = 3;
const RETRY_DELAYS_MS = [1_000, 4_000] as const;
const MAXIMUM_BODY_SIZE_BYTES = 100 * 1024 * 1024;

export function parseLibraryAnalysisAcquisitionExecutionArgs(
  arguments_: readonly string[],
): LibraryAnalysisAcquisitionExecutionCliOptions {
  let plan: string | null = null;
  let runRoot: string | null = null;
  let checkOnly = false;
  let executeNetwork = false;
  for (const argument of arguments_) {
    if (argument.startsWith("--plan=")) {
      if (plan !== null) throw new Error("acquisition_execution_plan_duplicate");
      plan = parsePrivateAbsolutePath(argument.slice("--plan=".length));
      continue;
    }
    if (argument.startsWith("--run-root=")) {
      if (runRoot !== null) throw new Error("acquisition_execution_root_duplicate");
      runRoot = parsePrivateAbsolutePath(argument.slice("--run-root=".length));
      continue;
    }
    if (argument === "--check-only") {
      if (checkOnly) throw new Error("acquisition_execution_mode_duplicate");
      checkOnly = true;
      continue;
    }
    if (argument === "--execute-network") {
      if (executeNetwork) throw new Error("acquisition_execution_mode_duplicate");
      executeNetwork = true;
      continue;
    }
    throw new Error("acquisition_execution_argument_unknown");
  }
  if (checkOnly && executeNetwork) {
    throw new Error("execution_modes_mutually_exclusive");
  }
  if (!checkOnly && !executeNetwork) {
    throw new Error("explicit_execution_mode_required");
  }
  if (plan === null || runRoot === null || plan === runRoot) {
    throw new Error("acquisition_execution_arguments_invalid");
  }
  return {
    plan,
    runRoot,
    mode: checkOnly ? "check_only" : "execute_network",
  };
}

export async function executeLibraryAnalysisAcquisitionPlan(
  input: ExecutionInput,
): Promise<LibraryAnalysisAcquisitionExecutionSummary> {
  const plan = LibraryAnalysisAcquisitionPlanSchema.parse(input.plan);
  const routeCounts = countRoutes(plan.rows);
  if (input.mode === "check_only") {
    return { mode: input.mode, planHash: plan.planHash, routeCounts, rows: [] };
  }

  const rows: SanitizedLibraryAnalysisAcquisitionRow[] = [];
  for (const row of plan.rows) {
    if (row.route === "controlled_https") {
      rows.push(await executeControlledHttpsRow(row, input.runRoot, input.adapters));
      continue;
    }
    rows.push(nonNetworkRow(row));
  }
  const summary: LibraryAnalysisAcquisitionExecutionSummary = {
    mode: input.mode,
    planHash: plan.planHash,
    routeCounts,
    rows,
  };
  writePrivateManifestAtomic(
    input.runRoot,
    `checkpoints/acquisition-execution-${plan.planHash}.json`,
    canonicalJsonBytes(summary),
  );
  return summary;
}

async function executeControlledHttpsRow(
  row: LibraryAnalysisAcquisitionPlanRow,
  runRoot: string,
  adapters: LibraryAnalysisAcquisitionExecutionAdapters,
): Promise<SanitizedLibraryAnalysisAcquisitionRow> {
  if (row.locator === null) return blockedRow(row.sourceKey, "missing_locator");
  const landing = await fetchWithRetry(row.sourceKey, row.locator, 0, adapters, runRoot);
  if (landing.status !== "ready") return failedFetchRow(row.sourceKey, landing);
  persistSuccessfulFetch(runRoot, landing);
  let extraction = extractLibraryAnalysisSource({
    sourceKey: row.sourceKey,
    mediaType: landing.receipt.response.contentType,
    finalLocator: landing.receipt.finalLocator,
    bytes: landing.bodyBytes,
  }, adapters.extraction);

  if (extraction.status === "ready" && landing.receipt.response.contentType === "text/html") {
    if (extraction.documentLinkCandidates.length !== 1) {
      persistExtraction(runRoot, row.sourceKey, extraction);
      return {
        ...blockedRow(row.sourceKey, "identity_ambiguous"),
        rawSha256: extraction.rawSha256,
        normalizedTextSha256: extraction.normalizedTextSha256,
      };
    }
    const linked = await fetchWithRetry(
      row.sourceKey,
      extraction.documentLinkCandidates[0]!,
      1,
      adapters,
      runRoot,
    );
    if (linked.status !== "ready") return failedFetchRow(row.sourceKey, linked);
    persistSuccessfulFetch(runRoot, linked);
    extraction = extractLibraryAnalysisSource({
      sourceKey: row.sourceKey,
      mediaType: linked.receipt.response.contentType,
      finalLocator: linked.receipt.finalLocator,
      bytes: linked.bodyBytes,
    }, adapters.extraction);
  }

  if (extraction.status === "blocked") {
    return blockedRow(row.sourceKey, extraction.reasonCode);
  }
  persistExtraction(runRoot, row.sourceKey, extraction);
  return {
    sourceKey: row.sourceKey,
    state: "ready",
    reasonCode: null,
    rawSha256: extraction.rawSha256,
    normalizedTextSha256: extraction.normalizedTextSha256,
    unitCount: extraction.units.length,
  };
}

async function fetchWithRetry(
  sourceKey: string,
  locator: string,
  linkOrdinal: number,
  adapters: LibraryAnalysisAcquisitionExecutionAdapters,
  runRoot: string,
): Promise<FetchAttempt> {
  const sourceHash = candidateAnalysisSha256("library-analysis-acquisition-source", sourceKey);
  for (let attempt = 1; attempt <= MAXIMUM_ATTEMPTS; attempt += 1) {
    let finalStatus: number | null = null;
    let retryAfter: string | null = null;
    const observedFetch: InjectedControlledFetch = async (request) => {
      const response = await adapters.fetch(request);
      finalStatus = response.status;
      retryAfter = responseHeader(response.headers, "retry-after");
      return response;
    };
    try {
      const result = await generateControlledHttpsFetchReceipt({
        receiptId: `library-analysis-fetch-${sourceHash.slice(0, 20)}-${linkOrdinal}-${attempt}`,
        sourceId: `library-analysis-source-${sourceHash.slice(0, 24)}`,
        requestedLocator: locator,
        tool: {
          name: "library-analysis-controlled-fetch",
          version: "1.0.0",
          workflowRef: "workflow.library-analysis.controlled-https-acquisition",
          workflowVersion: "1.0.0",
        },
        startedAt: adapters.now(),
        maximumRedirects: 5,
        maximumBodySizeBytes: MAXIMUM_BODY_SIZE_BYTES,
        fetch: observedFetch,
        completedAt: adapters.now,
      });
      return { status: "ready", ...result };
    } catch (error) {
      const classification = classifyFetchFailure(finalStatus, error);
      writePrivateManifestAtomic(
        runRoot,
        `attempts/${sourceHash}-${linkOrdinal}-${attempt}.json`,
        canonicalJsonBytes({
          schema: "library-analysis-acquisition-attempt/v1",
          sourceKey,
          linkOrdinal,
          attempt,
          maximumAttempts: MAXIMUM_ATTEMPTS,
          outcome: classification.status,
          reasonCode: classification.reasonCode,
          observedAt: adapters.now(),
        }),
      );
      if (classification.status === "blocked") return { ...classification, attempt };
      if (attempt === MAXIMUM_ATTEMPTS) {
        return { status: "failed_retryable", reasonCode: "transport_exhausted", attempt };
      }
      await adapters.wait(retryDelayMilliseconds(attempt, retryAfter));
    }
  }
  return {
    status: "failed_retryable",
    reasonCode: "transport_exhausted",
    attempt: MAXIMUM_ATTEMPTS,
  };
}

function classifyFetchFailure(
  status: number | null,
  error: unknown,
): Pick<FailedFetchAttempt, "status" | "reasonCode"> {
  if (status === 401 || status === 403) {
    return { status: "blocked", reasonCode: "http_forbidden" };
  }
  if (status === 404 || status === 410) {
    return { status: "blocked", reasonCode: "http_not_found" };
  }
  if (status === 429 || (status !== null && status >= 500 && status <= 599)) {
    return { status: "failed_retryable", reasonCode: "transport_exhausted" };
  }
  if (
    error instanceof Error &&
    (error.message.includes("exceeds maximumBodySizeBytes") ||
      error.message.includes("controlled_fetch_response_too_large"))
  ) {
    return { status: "blocked", reasonCode: "response_too_large" };
  }
  if (status !== null && status >= 400 && status <= 499) {
    return { status: "blocked", reasonCode: "http_forbidden" };
  }
  return { status: "failed_retryable", reasonCode: "transport_exhausted" };
}

function persistSuccessfulFetch(runRoot: string, attempt: ReadyFetchAttempt): void {
  const rawSha256 = withoutHashPrefix(attempt.receipt.response.bodySha256);
  writeAndSeal(runRoot, `raw/${rawSha256}.bin`, attempt.bodyBytes);
  const receiptSha256 = withoutHashPrefix(attempt.receipt.receiptSha256);
  writeAndSeal(runRoot, `receipts/${receiptSha256}.json`, canonicalJsonBytes(attempt.receipt));
}

function persistExtraction(
  runRoot: string,
  sourceKey: string,
  extraction: Extract<LibraryAnalysisSourceExtractionResult, { status: "ready" }>,
): void {
  const normalizedText = extraction.units.map((unit) => unit.text).join("\f");
  writeAndSeal(
    runRoot,
    `text/${extraction.normalizedTextSha256}.txt`,
    Buffer.from(normalizedText, "utf8"),
  );
  const sourceHash = candidateAnalysisSha256("library-analysis-acquisition-source", sourceKey);
  writePrivateManifestAtomic(
    runRoot,
    `extraction/${sourceHash}.json`,
    canonicalJsonBytes({
      schema: "library-analysis-source-extraction/v1",
      sourceKey,
      rawSha256: extraction.rawSha256,
      normalizedTextSha256: extraction.normalizedTextSha256,
      extractor: extraction.extractor,
      units: extraction.units,
      warnings: extraction.warnings,
    }),
  );
}

function writeAndSeal(runRoot: string, portablePath: string, bytes: Buffer): void {
  try {
    const written = writePrivateArtifactExclusive(runRoot, portablePath, bytes);
    sealPrivateArtifact(runRoot, portablePath, {
      sha256: written.sha256,
      sizeBytes: written.sizeBytes,
    });
  } catch (error) {
    if (!(error instanceof Error) || error.message !== "private_artifact_exists") throw error;
    readAndVerifyPrivateArtifact(runRoot, portablePath, {
      sha256: sha256(bytes),
      sizeBytes: bytes.length,
      mode: 0o400,
    });
  }
}

function nonNetworkRow(row: LibraryAnalysisAcquisitionPlanRow): SanitizedLibraryAnalysisAcquisitionRow {
  if (row.route === "superseded") return blockedRow(row.sourceKey, "source_superseded");
  if (row.route === "unresolvable") return blockedRow(row.sourceKey, "missing_locator");
  return {
    sourceKey: row.sourceKey,
    state: "not_executed",
    reasonCode: null,
    rawSha256: null,
    normalizedTextSha256: null,
    unitCount: 0,
  };
}

function failedFetchRow(
  sourceKey: string,
  failure: FailedFetchAttempt,
): SanitizedLibraryAnalysisAcquisitionRow {
  return {
    sourceKey,
    state: failure.status,
    reasonCode: failure.reasonCode,
    rawSha256: null,
    normalizedTextSha256: null,
    unitCount: 0,
  };
}

function blockedRow(
  sourceKey: string,
  reasonCode: NonNullable<SanitizedLibraryAnalysisAcquisitionRow["reasonCode"]>,
): SanitizedLibraryAnalysisAcquisitionRow {
  return {
    sourceKey,
    state: "blocked",
    reasonCode,
    rawSha256: null,
    normalizedTextSha256: null,
    unitCount: 0,
  };
}

function countRoutes(
  rows: readonly LibraryAnalysisAcquisitionPlanRow[],
): LibraryAnalysisAcquisitionExecutionSummary["routeCounts"] {
  const counts: LibraryAnalysisAcquisitionExecutionSummary["routeCounts"] = {};
  for (const row of rows) counts[row.route] = (counts[row.route] ?? 0) + 1;
  return counts;
}

function retryDelayMilliseconds(attempt: number, retryAfter: string | null): number {
  if (retryAfter !== null && /^\d+$/.test(retryAfter)) {
    return Math.min(Number(retryAfter), 30) * 1_000;
  }
  return RETRY_DELAYS_MS[attempt - 1] ?? RETRY_DELAYS_MS.at(-1)!;
}

function responseHeader(
  headers: Readonly<Record<string, string | undefined>>,
  name: string,
): string | null {
  const entry = Object.entries(headers).find(([key]) => key.toLowerCase() === name);
  return entry?.[1]?.trim() ?? null;
}

function withoutHashPrefix(value: string): string {
  if (!/^sha256:[a-f0-9]{64}$/.test(value)) throw new Error("acquisition_hash_invalid");
  return value.slice("sha256:".length);
}

function canonicalJsonBytes(value: CandidateJsonValue): Buffer {
  return Buffer.from(`${canonicalCandidateJson(value)}\n`, "utf8");
}

function sha256(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function parsePrivateAbsolutePath(value: string): string {
  if (value.length === 0 || !isAbsolute(value) || /[\u0000-\u001f\u007f]/.test(value)) {
    throw new Error("acquisition_execution_path_invalid");
  }
  return resolve(value);
}

async function defaultFetch(request: ControlledFetchRequest): Promise<ControlledFetchResponse> {
  const response = await fetch(request.url, {
    method: request.method,
    redirect: request.redirect,
    credentials: request.credentials,
    signal: AbortSignal.timeout(60_000),
  });
  const contentLength = response.headers.get("content-length");
  if (contentLength !== null && Number(contentLength) > MAXIMUM_BODY_SIZE_BYTES) {
    throw new Error("controlled_fetch_response_too_large");
  }
  const bytes = await readControlledFetchBody(response.body, MAXIMUM_BODY_SIZE_BYTES);
  return {
    status: response.status,
    headers: Object.fromEntries(response.headers.entries()),
    body: bytes,
    observedAt: new Date().toISOString(),
  };
}

export async function readControlledFetchBody(
  body: ReadableStream<Uint8Array> | null,
  maximumBodySizeBytes: number,
): Promise<Buffer> {
  if (!Number.isSafeInteger(maximumBodySizeBytes) || maximumBodySizeBytes < 1) {
    throw new Error("controlled_fetch_body_limit_invalid");
  }
  if (body === null) return Buffer.alloc(0);
  const chunks: Buffer[] = [];
  let sizeBytes = 0;
  const reader = body.getReader();
  try {
    while (true) {
      const next = await reader.read();
      if (next.done) break;
      const chunk = Buffer.from(next.value);
      sizeBytes += chunk.length;
      if (sizeBytes > maximumBodySizeBytes) {
        await reader.cancel("controlled_fetch_response_too_large");
        throw new Error("controlled_fetch_response_too_large");
      }
      chunks.push(chunk);
    }
  } finally {
    reader.releaseLock();
  }
  return Buffer.concat(chunks, sizeBytes);
}

function defaultExtractionAdapters(): LibraryAnalysisExtractionAdapters {
  return {
    runPdfText: (bytes) => {
      const directory = mkdtempSync(join(tmpdir(), "library-analysis-pdf."));
      const input = join(directory, "input.pdf");
      const output = join(directory, "output.txt");
      try {
        writeFileSync(input, bytes, { mode: 0o600, flag: "wx" });
        const version = spawnSync("pdftotext", ["-v"], { encoding: "utf8" });
        const probe = spawnSync("pdftotext", ["-layout", input, output], {
          encoding: "utf8",
          timeout: 120_000,
        });
        return {
          exitCode: probe.status ?? 1,
          stdout: probe.status === 0 ? readFileSync(output, "utf8") : "",
          stderr: "",
          toolVersion: `${version.stderr}${version.stdout}`.trim() || "pdftotext-unknown",
        };
      } finally {
        rmSync(directory, { recursive: true, force: true });
      }
    },
  };
}

async function main(): Promise<void> {
  const options = parseLibraryAnalysisAcquisitionExecutionArgs(process.argv.slice(2));
  const plan = LibraryAnalysisAcquisitionPlanSchema.parse(
    JSON.parse(readFileSync(options.plan, "utf8")),
  );
  const summary = await executeLibraryAnalysisAcquisitionPlan({
    plan,
    runRoot: options.runRoot,
    mode: options.mode,
    adapters: {
      fetch: defaultFetch,
      extraction: defaultExtractionAdapters(),
      wait: (milliseconds) => new Promise((resolveWait) => setTimeout(resolveWait, milliseconds)),
      now: () => new Date().toISOString(),
    },
  });
  process.stdout.write(`${JSON.stringify(summary)}\n`);
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : null;
if (invokedPath === import.meta.url) {
  main().catch(() => {
    process.stderr.write("library_analysis_acquisition_execution_failed\n");
    process.exitCode = 1;
  });
}
