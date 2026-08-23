#!/usr/bin/env node

import { createHash } from "node:crypto";
import {
  lstatSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { isAbsolute, join, resolve, sep } from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

import type { PrismaClient } from "../../src/generated/prisma/client";

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
  extractLibraryAnalysisDerivedReport,
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
  readDatabaseDocument?: (documentId: string) => Promise<{
    summary: string | null;
    content: string;
  }>;
  readRepositoryFile?: (portablePath: string) => Promise<Buffer>;
  readDerivedReport?: (reportId: string) => Promise<unknown>;
};

export type SanitizedLibraryAnalysisAcquisitionRow = {
  sourceKey: string;
  state: "ready" | "blocked" | "failed_retryable" | "quarantined" | "not_executed";
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
    | "source_version_drift"
    | "derived_record_missing_dependencies"
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
    if (row.route === "database_document") {
      rows.push(await executeDatabaseDocumentRow(row, input.runRoot, input.adapters));
      continue;
    }
    if (row.route === "repository_csv" || row.route === "repository_pptx") {
      rows.push(await executeRepositoryRow(row, input.runRoot, input.adapters));
      continue;
    }
    if (row.route === "database_derived_record") {
      rows.push(await executeDerivedReportRow(row, input.runRoot, input.adapters));
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
  const locators = [row.locator, ...row.alternateLocators];
  let landing: ReadyFetchAttempt | null = null;
  let landingOrdinal = 0;
  for (const [locatorIndex, locator] of locators.entries()) {
    const attempt = await fetchWithRetry(
      row.sourceKey,
      locator,
      locatorIndex * 2,
      adapters,
      runRoot,
    );
    if (attempt.status === "ready") {
      landing = attempt;
      landingOrdinal = locatorIndex * 2;
      break;
    }
    if (attempt.reasonCode !== "http_not_found" || locatorIndex === locators.length - 1) {
      return failedFetchRow(row.sourceKey, attempt);
    }
  }
  if (landing === null) return blockedRow(row.sourceKey, "http_not_found");
  persistSuccessfulFetch(runRoot, landing);
  let extraction = extractLibraryAnalysisSource({
    sourceKey: row.sourceKey,
    mediaType: landing.receipt.response.contentType,
    finalLocator: landing.receipt.finalLocator,
    bytes: landing.bodyBytes,
  }, adapters.extraction);
  let rawSizeBytes = landing.bodyBytes.length;

  if (extraction.status === "ready" && landing.receipt.response.contentType === "text/html") {
    if (extraction.documentLinkCandidates.length !== 1) {
      persistExtraction(runRoot, row, extraction, rawSizeBytes, extraction.rawSha256);
      return {
        ...blockedRow(row.sourceKey, "identity_ambiguous"),
        rawSha256: extraction.rawSha256,
        normalizedTextSha256: extraction.normalizedTextSha256,
      };
    }
    const linked = await fetchWithRetry(
      row.sourceKey,
      extraction.documentLinkCandidates[0]!,
      landingOrdinal + 1,
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
    rawSizeBytes = linked.bodyBytes.length;
  }

  if (extraction.status === "blocked") {
    return blockedRow(row.sourceKey, extraction.reasonCode);
  }
  persistExtraction(runRoot, row, extraction, rawSizeBytes, extraction.rawSha256);
  return {
    sourceKey: row.sourceKey,
    state: "ready",
    reasonCode: null,
    rawSha256: extraction.rawSha256,
    normalizedTextSha256: extraction.normalizedTextSha256,
    unitCount: extraction.units.length,
  };
}

async function executeDatabaseDocumentRow(
  row: LibraryAnalysisAcquisitionPlanRow,
  runRoot: string,
  adapters: LibraryAnalysisAcquisitionExecutionAdapters,
): Promise<SanitizedLibraryAnalysisAcquisitionRow> {
  const locator = row.locator;
  const match = locator ? /^database:Document:([^:]+):content$/u.exec(locator) : null;
  if (!match || !adapters.readDatabaseDocument || row.sourceVersionHash === null) {
    return quarantinedRow(row.sourceKey, "source_version_drift");
  }
  let source: { summary: string | null; content: string };
  try {
    source = await adapters.readDatabaseDocument(match[1]!);
  } catch {
    return quarantinedRow(row.sourceKey, "source_version_drift");
  }
  const rawBytes = Buffer.from(source.content, "utf8");
  const rawSha256 = sha256(rawBytes);
  const versionBytes = Buffer.from([source.summary, source.content].filter(Boolean).join("\n\n"), "utf8");
  const sourceVersionHash = sha256(versionBytes);
  if (sourceVersionHash !== row.sourceVersionHash) {
    return quarantinedRow(row.sourceKey, "source_version_drift");
  }
  const units = [
    ...(source.summary && source.summary.length > 0 ? [{
      unitType: "database_record" as const,
      baseLocator: locator!.replace(/:content$/u, ":summary"),
      ordinal: 0,
      text: source.summary,
    }] : []),
    {
      unitType: "database_record" as const,
      baseLocator: locator!,
      ordinal: source.summary && source.summary.length > 0 ? 1 : 0,
      text: source.content,
    },
  ];
  const extraction = readyExtraction(rawSha256, units, {
    name: "library-database-document",
    version: "1.0.0",
    workflowRef: "workflow.library-analysis.database-document-extraction",
    workflowVersion: "1.0.0",
  });
  writeAndSeal(runRoot, `raw/${rawSha256}.bin`, rawBytes);
  persistExtraction(runRoot, row, extraction, rawBytes.length, sourceVersionHash);
  return readyRow(row.sourceKey, extraction);
}

async function executeRepositoryRow(
  row: LibraryAnalysisAcquisitionPlanRow,
  runRoot: string,
  adapters: LibraryAnalysisAcquisitionExecutionAdapters,
): Promise<SanitizedLibraryAnalysisAcquisitionRow> {
  const match = row.locator ? /^repository:(.+)$/u.exec(row.locator) : null;
  if (!match || !adapters.readRepositoryFile) {
    return quarantinedRow(row.sourceKey, "source_version_drift");
  }
  let bytes: Buffer;
  try {
    bytes = await adapters.readRepositoryFile(match[1]!);
  } catch {
    return quarantinedRow(row.sourceKey, "source_version_drift");
  }
  const extraction = extractLibraryAnalysisSource({
    sourceKey: row.sourceKey,
    mediaType: row.route === "repository_csv"
      ? "text/csv"
      : "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    finalLocator: row.locator!,
    bytes,
  }, adapters.extraction);
  if (extraction.status === "blocked") return blockedRow(row.sourceKey, extraction.reasonCode);
  writeAndSeal(runRoot, `raw/${extraction.rawSha256}.bin`, bytes);
  persistExtraction(runRoot, row, extraction, bytes.length, extraction.rawSha256);
  return readyRow(row.sourceKey, extraction);
}

async function executeDerivedReportRow(
  row: LibraryAnalysisAcquisitionPlanRow,
  runRoot: string,
  adapters: LibraryAnalysisAcquisitionExecutionAdapters,
): Promise<SanitizedLibraryAnalysisAcquisitionRow> {
  const match = row.locator ? /^database:Report:([^:]+)$/u.exec(row.locator) : null;
  if (!match || !adapters.readDerivedReport) {
    return blockedRow(row.sourceKey, "derived_record_missing_dependencies");
  }
  let record: unknown;
  try {
    record = await adapters.readDerivedReport(match[1]!);
  } catch {
    return blockedRow(row.sourceKey, "derived_record_missing_dependencies");
  }
  const extraction = extractLibraryAnalysisDerivedReport(record);
  if (extraction.status === "blocked") return blockedRow(row.sourceKey, extraction.reasonCode);
  const rawBytes = Buffer.from(extraction.units.map((unit) => unit.text).join("\f"), "utf8");
  if (sha256(rawBytes) !== extraction.rawSha256) {
    return quarantinedRow(row.sourceKey, "source_version_drift");
  }
  writeAndSeal(runRoot, `raw/${extraction.rawSha256}.bin`, rawBytes);
  persistExtraction(runRoot, row, extraction, rawBytes.length, extraction.rawSha256);
  return readyRow(row.sourceKey, extraction);
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
  row: LibraryAnalysisAcquisitionPlanRow,
  extraction: Extract<LibraryAnalysisSourceExtractionResult, { status: "ready" }>,
  rawSizeBytes: number,
  sourceVersionHash: string,
): void {
  const normalizedText = extraction.units.map((unit) => unit.text).join("\f");
  writeAndSeal(
    runRoot,
    `text/${extraction.normalizedTextSha256}.txt`,
    Buffer.from(normalizedText, "utf8"),
  );
  const sourceHash = candidateAnalysisSha256("library-analysis-acquisition-source", row.sourceKey);
  writePrivateManifestAtomic(
    runRoot,
    `extraction/${sourceHash}.json`,
    canonicalJsonBytes({
      schema: "library-analysis-source-extraction/v1",
      sourceKind: row.sourceKind,
      sourceKey: row.sourceKey,
      route: row.route,
      sourceVersionHash,
      rawSha256: extraction.rawSha256,
      rawSizeBytes,
      normalizedTextSha256: extraction.normalizedTextSha256,
      extractor: extraction.extractor,
      units: extraction.units,
      warnings: extraction.warnings,
    }),
  );
}

function readyExtraction(
  rawSha256: string,
  units: Extract<LibraryAnalysisSourceExtractionResult, { status: "ready" }>["units"],
  extractor: Extract<LibraryAnalysisSourceExtractionResult, { status: "ready" }>["extractor"],
): Extract<LibraryAnalysisSourceExtractionResult, { status: "ready" }> {
  const normalized = units.map((unit) => unit.text).join("\f");
  return {
    status: "ready",
    rawSha256,
    normalizedTextSha256: sha256(Buffer.from(normalized, "utf8")),
    extractor,
    units,
    documentLinkCandidates: [],
    warnings: [],
  };
}

function readyRow(
  sourceKey: string,
  extraction: Extract<LibraryAnalysisSourceExtractionResult, { status: "ready" }>,
): SanitizedLibraryAnalysisAcquisitionRow {
  return {
    sourceKey,
    state: "ready",
    reasonCode: null,
    rawSha256: extraction.rawSha256,
    normalizedTextSha256: extraction.normalizedTextSha256,
    unitCount: extraction.units.length,
  };
}

function quarantinedRow(
  sourceKey: string,
  reasonCode: "source_version_drift",
): SanitizedLibraryAnalysisAcquisitionRow {
  return {
    sourceKey,
    state: "quarantined",
    reasonCode,
    rawSha256: null,
    normalizedTextSha256: null,
    unitCount: 0,
  };
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
    headers: { "user-agent": "FoodSystems2026-LibraryAnalysis/1.0" },
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
    listZipEntries: (bytes) => runUnzip(bytes, ["-Z1"])
      .toString("utf8")
      .split(/\r?\n/u)
      .filter((entry) => entry.length > 0),
    readZipEntry: (bytes, entry) => runUnzip(bytes, ["-p"], entry),
  };
}

function runUnzip(bytes: Buffer, prefixArguments: string[], entry?: string): Buffer {
  const directory = mkdtempSync(join(tmpdir(), "library-analysis-pptx."));
  const input = join(directory, "input.pptx");
  try {
    writeFileSync(input, bytes, { mode: 0o600, flag: "wx" });
    const result = spawnSync(
      "unzip",
      [...prefixArguments, input, ...(entry === undefined ? [] : [entry])],
      { encoding: "buffer", timeout: 120_000, maxBuffer: MAXIMUM_BODY_SIZE_BYTES },
    );
    if (result.status !== 0 || !Buffer.isBuffer(result.stdout)) {
      throw new Error("library_analysis_unzip_failed");
    }
    return result.stdout;
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

async function createDefaultSourceAdapters(
  plan: LibraryAnalysisAcquisitionPlan,
  enabled: boolean,
): Promise<{
  adapters: Pick<
    LibraryAnalysisAcquisitionExecutionAdapters,
    "readDatabaseDocument" | "readDerivedReport" | "readRepositoryFile"
  >;
  close: () => Promise<void>;
}> {
  const repositoryRoot = realpathSync(process.cwd());
  const adapters: Pick<
    LibraryAnalysisAcquisitionExecutionAdapters,
    "readDatabaseDocument" | "readDerivedReport" | "readRepositoryFile"
  > = {
    readRepositoryFile: async (portablePath) => {
      const target = resolve(repositoryRoot, portablePath);
      if (!target.startsWith(`${repositoryRoot}${sep}`)) {
        throw new Error("library_analysis_repository_path_invalid");
      }
      const stat = lstatSync(target);
      if (stat.isSymbolicLink() || !stat.isFile()) {
        throw new Error("library_analysis_repository_file_invalid");
      }
      if (!realpathSync(target).startsWith(`${repositoryRoot}${sep}`)) {
        throw new Error("library_analysis_repository_path_invalid");
      }
      return readFileSync(target);
    },
  };
  const needsDatabase = enabled && plan.rows.some(
    (row) => row.route === "database_document" || row.route === "database_derived_record",
  );
  if (!needsDatabase) return { adapters, close: async () => undefined };
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("library_analysis_execution_database_url_missing");
  const [{ PrismaPg }, { PrismaClient: RuntimePrismaClient }] = await Promise.all([
    import("@prisma/adapter-pg"),
    import("../../src/generated/prisma/client"),
  ]);
  const prisma: PrismaClient = new RuntimePrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl }),
  });
  adapters.readDatabaseDocument = async (documentId) => prisma.$transaction(async (transaction) => {
    await transaction.$executeRawUnsafe("SET TRANSACTION READ ONLY");
    const document = await transaction.document.findUnique({
      where: { id: documentId },
      select: { summary: true, content: true },
    });
    if (!document) throw new Error("library_analysis_database_document_missing");
    return document;
  }, { isolationLevel: "RepeatableRead" });
  adapters.readDerivedReport = async (reportId) => prisma.$transaction(async (transaction) => {
    await transaction.$executeRawUnsafe("SET TRANSACTION READ ONLY");
    const report = await transaction.report.findUnique({
      where: { id: reportId },
      select: {
        id: true,
        title: true,
        fullTitle: true,
        author: true,
        institution: true,
        date: true,
        year: true,
        reportCategory: true,
        country: true,
        keyFindings: true,
        recommendations: true,
        relevance: true,
        tags: true,
        provenanceType: true,
        supportingSources: true,
      },
    });
    if (!report || !Array.isArray(report.supportingSources)) {
      throw new Error("library_analysis_derived_report_missing");
    }
    return report;
  }, { isolationLevel: "RepeatableRead" });
  return { adapters, close: () => prisma.$disconnect() };
}

export async function runLibraryAnalysisAcquisitionExecutionCli(
  options: LibraryAnalysisAcquisitionExecutionCliOptions,
): Promise<LibraryAnalysisAcquisitionExecutionSummary> {
  const plan = LibraryAnalysisAcquisitionPlanSchema.parse(
    JSON.parse(readFileSync(options.plan, "utf8")),
  );
  const defaults = await createDefaultSourceAdapters(plan, options.mode === "execute_network");
  try {
    return await executeLibraryAnalysisAcquisitionPlan({
      plan,
      runRoot: options.runRoot,
      mode: options.mode,
      adapters: {
        fetch: defaultFetch,
        extraction: defaultExtractionAdapters(),
        wait: (milliseconds) => new Promise((resolveWait) => setTimeout(resolveWait, milliseconds)),
        now: () => new Date().toISOString(),
        ...defaults.adapters,
      },
    });
  } finally {
    await defaults.close();
  }
}

async function main(): Promise<void> {
  const summary = await runLibraryAnalysisAcquisitionExecutionCli(
    parseLibraryAnalysisAcquisitionExecutionArgs(process.argv.slice(2)),
  );
  process.stdout.write(`${JSON.stringify(summary)}\n`);
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : null;
if (invokedPath === import.meta.url) {
  main().catch(() => {
    process.stderr.write("library_analysis_acquisition_execution_failed\n");
    process.exitCode = 1;
  });
}
