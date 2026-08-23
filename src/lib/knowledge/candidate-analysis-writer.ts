import { createHash } from "node:crypto";
import { readFileSync, realpathSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";

import { Prisma, type PrismaClient } from "../../generated/prisma/client";

import {
  CandidateAnalysisArtifactInputSchema,
  CandidateAnalysisRunEventInputSchema,
  CandidateAnalysisRunInputSchema,
  CandidateAssertionInputSchema,
  CandidateDependencyInputSchema,
  CandidateContentUnitInputSchema,
  CandidateEvidenceLinkInputSchema,
  CandidateReconciliationSnapshotInputSchema,
  candidateWorkflowProfile,
  type CandidateAnalysisArtifactInput,
  type CandidateAnalysisMachineState,
  type CandidateAnalysisRunEventInput,
  type CandidateAnalysisRunInput,
  type CandidateAssertionInput,
  type CandidateDependencyInput,
  type CandidateContentUnitInput,
  type CandidateEvidenceLinkInput,
  type CandidateReconciliationSnapshotInput,
} from "./candidate-analysis-contract";

export type CandidateAnalysisWriteConflictCode =
  | "idempotency_conflict"
  | "event_sequence_conflict"
  | "terminal_output_missing"
  | "terminal_output_integrity"
  | "dependency_cycle"
  | "upstream_authority_upgrade"
  | "immutable_history_conflict"
  | "integrity_mismatch"
  | "run_terminal"
  | "supersession_conflict"
  | "workflow_binding_mismatch"
  | "prompt_binding_mismatch";

export class CandidateAnalysisWriteConflict extends Error {
  readonly code: CandidateAnalysisWriteConflictCode;

  constructor(code: CandidateAnalysisWriteConflictCode) {
    super(code);
    this.name = "CandidateAnalysisWriteConflict";
    this.code = code;
  }
}

export type CandidateAnalysisWriter = {
  createRun(
    input: CandidateAnalysisRunInput,
  ): Promise<{ runId: string; created: true }>;
  appendRunEvent(input: CandidateAnalysisRunEventInput): Promise<{
    runId: string;
    sequence: number;
    state: CandidateAnalysisMachineState;
  }>;
  appendArtifact(
    input: CandidateAnalysisArtifactInput,
  ): Promise<{ artifactId: string }>;
  appendAssertion(
    input: CandidateAssertionInput,
  ): Promise<{ assertionId: string }>;
  appendEvidenceLink(
    input: CandidateEvidenceLinkInput,
  ): Promise<{ evidenceLinkId: string }>;
  appendDependency(
    input: CandidateDependencyInput,
  ): Promise<{ dependencyId: string }>;
};

export type CandidateContentUnitIntakeWriter = {
  appendContentUnit(input: CandidateContentUnitInput): Promise<{
    contentUnitId: string;
    created: boolean;
  }>;
};

export type CandidateReconciliationWriter = {
  appendSnapshot(
    input: CandidateReconciliationSnapshotInput,
  ): Promise<{ snapshotId: string }>;
};

type WriterOptions = {
  repositoryRoot?: string;
  readFile?: (path: string) => Buffer;
};

function isPrismaErrorCode(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === code
  );
}

function databaseWriterMessage(error: unknown): string {
  if (error instanceof Error) return `${error.message}\n${JSON.stringify(error)}`;
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

function throwMappedDatabaseWriterConflict(
  error: unknown,
  fallback: CandidateAnalysisWriteConflictCode,
): never {
  if (error instanceof CandidateAnalysisWriteConflict) throw error;
  const message = databaseWriterMessage(error);
  const mappings: Array<[
    RegExp,
    CandidateAnalysisWriteConflictCode,
  ]> = [
    [/event_sequence|event_after_terminal|invalid_event_transition/i, "event_sequence_conflict"],
    [/terminal_output_missing/i, "terminal_output_missing"],
    [/terminal_output_integrity/i, "terminal_output_integrity"],
    [/dependency_cycle/i, "dependency_cycle"],
    [/upstream_authority_upgrade/i, "upstream_authority_upgrade"],
    [/run_terminal/i, "run_terminal"],
    [/supersession/i, "supersession_conflict"],
    [/workflow.*binding/i, "workflow_binding_mismatch"],
    [/prompt.*binding/i, "prompt_binding_mismatch"],
    [/integrity|binding|hash|scope|envelope/i, "integrity_mismatch"],
  ];
  for (const [pattern, code] of mappings) {
    if (pattern.test(message)) throw new CandidateAnalysisWriteConflict(code);
  }
  if (isPrismaErrorCode(error, "P2002") || isPrismaErrorCode(error, "P2003") || isPrismaErrorCode(error, "P2010")) {
    throw new CandidateAnalysisWriteConflict(fallback);
  }
  throw error;
}

async function invokeCandidateWorkerFunction<T>(
  prisma: PrismaClient,
  operation: string,
  payload: unknown,
): Promise<T> {
  const rows = await prisma.$queryRaw<Array<{ result: Prisma.JsonValue }>>`
    SELECT public.candidate_worker_append(
      ${operation},
      ${JSON.stringify(payload)}::jsonb
    ) AS result
  `;
  if (rows.length !== 1) throw new Error("candidate_worker_function_result_invalid");
  return rows[0]!.result as T;
}

async function invokeCandidateReconcilerFunction<T>(
  prisma: PrismaClient,
  payload: unknown,
): Promise<T> {
  const rows = await prisma.$queryRaw<Array<{ result: Prisma.JsonValue }>>`
    SELECT public.candidate_reconciler_append(
      ${JSON.stringify(payload)}::jsonb
    ) AS result
  `;
  if (rows.length !== 1) throw new Error("candidate_reconciler_function_result_invalid");
  return rows[0]!.result as T;
}

async function invokeCandidateContentUnitFunction<T>(
  prisma: PrismaClient,
  payload: unknown,
): Promise<T> {
  const rows = await prisma.$queryRaw<Array<{ result: Prisma.JsonValue }>>`
    SELECT public.candidate_content_unit_append(
      ${JSON.stringify(payload)}::jsonb
    ) AS result
  `;
  if (rows.length !== 1) throw new Error("candidate_content_unit_function_result_invalid");
  return rows[0]!.result as T;
}

function parseForWrite<T>(schema: { parse(input: unknown): T }, raw: unknown): T {
  try {
    return schema.parse(raw);
  } catch (error) {
    if (typeof error === "object" && error !== null && "issues" in error) {
      const messages = (error as { issues?: Array<{ message?: string }> }).issues
        ?.map(({ message }) => message ?? "")
        .join("\n");
      if (messages?.includes("self_supersession")) {
        throw new CandidateAnalysisWriteConflict("supersession_conflict");
      }
      if (messages?.includes("event_supersession_scope_mismatch")) {
        throw new CandidateAnalysisWriteConflict("supersession_conflict");
      }
      if (
        messages?.includes("hash_mismatch") ||
        messages?.includes("idempotency_mismatch") ||
        messages?.includes("inputs_not_canonical") ||
        messages?.includes("scope_mismatch")
      ) {
        throw new CandidateAnalysisWriteConflict("integrity_mismatch");
      }
    }
    throw error;
  }
}

function resolveRepositoryBindingPath(
  repositoryRoot: string,
  repositoryPath: string,
  conflict: "workflow_binding_mismatch" | "prompt_binding_mismatch",
): string {
  let root: string;
  let path: string;
  try {
    root = realpathSync(resolve(repositoryRoot));
    path = realpathSync(resolve(root, repositoryPath));
  } catch {
    throw new CandidateAnalysisWriteConflict(conflict);
  }
  const pathFromRoot = relative(root, path);
  if (
    pathFromRoot === ".." ||
    pathFromRoot.startsWith(`..${sep}`) ||
    isAbsolute(pathFromRoot)
  ) {
    throw new CandidateAnalysisWriteConflict(conflict);
  }
  return path;
}

function decodeBindingText(
  bytes: Buffer,
  conflict: "workflow_binding_mismatch" | "prompt_binding_mismatch",
): string {
  const text = bytes.toString("utf8");
  if (text.includes("\uFFFD")) {
    throw new CandidateAnalysisWriteConflict(conflict);
  }
  return text;
}

function hasExactBindingMetadata(
  text: string,
  expected: ReadonlyArray<readonly [label: string, value: string]>,
): boolean {
  const lines = text.split(/\r?\n/);
  return expected.every(([label, value]) => {
    const activeMarkers = lines.filter((line) => line.startsWith(`${label}:`));
    return (
      activeMarkers.length === 1 &&
      activeMarkers[0] === `${label}: \`${value}\``
    );
  });
}

export function verifyCandidateWorkflowPromptBundle(
  repositoryRoot: string,
  declared: CandidateAnalysisRunInput,
  readFile: (path: string) => Buffer = (path) => readFileSync(path),
): void {
  const profile = candidateWorkflowProfile(declared.outputProfile);
  const workflowPath = resolveRepositoryBindingPath(
    repositoryRoot,
    profile.workflow.path,
    "workflow_binding_mismatch",
  );
  const promptPath = resolveRepositoryBindingPath(
    repositoryRoot,
    profile.prompt.path,
    "prompt_binding_mismatch",
  );
  let workflowBytes: Buffer;
  let promptBytes: Buffer;
  try {
    workflowBytes = readFile(workflowPath);
  } catch {
    throw new CandidateAnalysisWriteConflict("workflow_binding_mismatch");
  }
  try {
    promptBytes = readFile(promptPath);
  } catch {
    throw new CandidateAnalysisWriteConflict("prompt_binding_mismatch");
  }

  const workflow = decodeBindingText(
    workflowBytes,
    "workflow_binding_mismatch",
  );
  const prompt = decodeBindingText(promptBytes, "prompt_binding_mismatch");
  const workflowMetadata = [
    ["Workflow ID", profile.workflow.id],
    ["Workflow version", profile.workflow.version],
    ["Workflow repository path", profile.workflow.path],
    ["Prompt template ID", profile.prompt.id],
    ["Prompt template version", profile.prompt.version],
    ["Prompt template repository path", profile.prompt.path],
  ] as const;
  if (
    createHash("sha256").update(workflowBytes).digest("hex") !==
      declared.workflowHash ||
    !hasExactBindingMetadata(workflow, workflowMetadata)
  ) {
    throw new CandidateAnalysisWriteConflict("workflow_binding_mismatch");
  }

  const promptMetadata = [
    ["Prompt template ID", profile.prompt.id],
    ["Prompt template version", profile.prompt.version],
    ["Prompt template repository path", profile.prompt.path],
    ["Workflow ID", profile.workflow.id],
    ["Workflow version", profile.workflow.version],
    ["Workflow repository path", profile.workflow.path],
  ] as const;
  if (
    createHash("sha256").update(promptBytes).digest("hex") !==
      declared.promptHash ||
    !hasExactBindingMetadata(prompt, promptMetadata)
  ) {
    throw new CandidateAnalysisWriteConflict("prompt_binding_mismatch");
  }
}

export function createCandidateAnalysisWriter(
  prisma: PrismaClient,
  options: WriterOptions = {},
): CandidateAnalysisWriter {
  const repositoryRoot = options.repositoryRoot ?? process.cwd();
  return {
    async createRun(rawInput) {
      const input = parseForWrite(CandidateAnalysisRunInputSchema, rawInput);
      verifyCandidateWorkflowPromptBundle(
        repositoryRoot,
        input,
        options.readFile,
      );
      try {
        return await invokeCandidateWorkerFunction<{
          runId: string;
          created: true;
        }>(prisma, "create_run", input);
      } catch (error) {
        throwMappedDatabaseWriterConflict(error, "idempotency_conflict");
      }
    },

    async appendRunEvent(rawInput) {
      const input = parseForWrite(CandidateAnalysisRunEventInputSchema, rawInput);
      try {
        return await invokeCandidateWorkerFunction<{
          runId: string;
          sequence: number;
          state: CandidateAnalysisMachineState;
        }>(prisma, "append_event", input);
      } catch (error) {
        throwMappedDatabaseWriterConflict(error, "event_sequence_conflict");
      }
    },

    async appendArtifact(rawInput) {
      const input = parseForWrite(CandidateAnalysisArtifactInputSchema, rawInput);
      try {
        return await invokeCandidateWorkerFunction<{ artifactId: string }>(
          prisma,
          "append_artifact",
          input,
        );
      } catch (error) {
        throwMappedDatabaseWriterConflict(error, "immutable_history_conflict");
      }
    },

    async appendAssertion(rawInput) {
      const input = parseForWrite(CandidateAssertionInputSchema, rawInput);
      try {
        return await invokeCandidateWorkerFunction<{ assertionId: string }>(
          prisma,
          "append_assertion",
          input,
        );
      } catch (error) {
        throwMappedDatabaseWriterConflict(error, "immutable_history_conflict");
      }
    },

    async appendEvidenceLink(rawInput) {
      const input = parseForWrite(CandidateEvidenceLinkInputSchema, rawInput);
      try {
        return await invokeCandidateWorkerFunction<{ evidenceLinkId: string }>(
          prisma,
          "append_evidence",
          input,
        );
      } catch (error) {
        throwMappedDatabaseWriterConflict(error, "immutable_history_conflict");
      }
    },

    async appendDependency(rawInput) {
      const input = parseForWrite(CandidateDependencyInputSchema, rawInput);
      try {
        return await invokeCandidateWorkerFunction<{ dependencyId: string }>(
          prisma,
          "append_dependency",
          input,
        );
      } catch (error) {
        throwMappedDatabaseWriterConflict(error, "immutable_history_conflict");
      }
    },
  };
}

export function createCandidateContentUnitIntakeWriter(
  prisma: PrismaClient,
): CandidateContentUnitIntakeWriter {
  return {
    async appendContentUnit(rawInput) {
      const input = parseForWrite(CandidateContentUnitInputSchema, rawInput);
      try {
        return await invokeCandidateContentUnitFunction<{
          contentUnitId: string;
          created: boolean;
        }>(prisma, input);
      } catch (error) {
        throwMappedDatabaseWriterConflict(error, "immutable_history_conflict");
      }
    },
  };
}

export function createCandidateReconciliationWriter(
  prisma: PrismaClient,
): CandidateReconciliationWriter {
  return {
    async appendSnapshot(rawInput) {
      const input = parseForWrite(CandidateReconciliationSnapshotInputSchema, rawInput);
      try {
        return await invokeCandidateReconcilerFunction<{ snapshotId: string }>(
          prisma,
          input,
        );
      } catch (error) {
        throwMappedDatabaseWriterConflict(error, "immutable_history_conflict");
      }
    },
  };
}
