import { createHash } from "node:crypto";
import { readFileSync, realpathSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";

import { Prisma, type PrismaClient } from "../../generated/prisma/client";

import {
  CANDIDATE_ANALYSIS_SCHEMA_VERSION,
  CANDIDATE_PROMPT_BINDING,
  CANDIDATE_WORKFLOW_BINDING,
  CandidateAnalysisArtifactInputSchema,
  CandidateAnalysisContractError,
  CandidateAnalysisRunEventInputSchema,
  CandidateAnalysisRunInputSchema,
  CandidateAssertionInputSchema,
  CandidateDependencyInputSchema,
  CandidateEvidenceLinkInputSchema,
  CandidateReconciliationSnapshotInputSchema,
  candidateAnalysisInputEnvelopeHash,
  candidateAnalysisOutputManifestHash,
  candidateAnalysisRunIdempotencyKey,
  candidateAnalysisRunScopeHash,
  candidateAnalysisSha256,
  canonicalCandidateJson,
  deriveCandidateAnalysisMachineState,
  type CandidateAnalysisArtifactInput,
  type CandidateAnalysisMachineState,
  type CandidateAnalysisRunEventInput,
  type CandidateAnalysisRunInput,
  type CandidateAssertionInput,
  type CandidateDependencyInput,
  type CandidateEvidenceLevel,
  type CandidateEvidenceLinkInput,
  type CandidateIdentityConfidence,
  type CandidateJsonValue,
  type CandidateMachineUse,
  type CandidateOutputManifest,
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

export type CandidateReconciliationWriter = {
  appendSnapshot(
    input: CandidateReconciliationSnapshotInput,
  ): Promise<{ snapshotId: string }>;
};

type WriterOptions = {
  repositoryRoot?: string;
  readFile?: (path: string) => Buffer;
};

const identityStrength: Record<CandidateIdentityConfidence, number> = {
  unresolved: 0,
  provisional: 1,
  exact: 2,
};

const evidenceStrength: Record<CandidateEvidenceLevel, number> = {
  no_locator: 0,
  partial_locator: 1,
  exact_locator: 2,
};

const machineUsePermissiveness: Record<CandidateMachineUse, number> = {
  quarantined: 0,
  candidate_only: 1,
  reusable_for_ai_context: 2,
};

function isPrismaErrorCode(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === code
  );
}

function throwMappedConflict(
  error: unknown,
  fallback: CandidateAnalysisWriteConflictCode,
): never {
  if (error instanceof CandidateAnalysisWriteConflict) throw error;
  if (isPrismaErrorCode(error, "P2002") || isPrismaErrorCode(error, "P2003")) {
    throw new CandidateAnalysisWriteConflict(fallback);
  }
  throw error;
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

function toRequiredJson(
  value: CandidateJsonValue,
): Prisma.InputJsonValue | Prisma.JsonNullValueInput {
  return value === null ? Prisma.JsonNull : value;
}

function toNullableJson(
  value: CandidateJsonValue | null,
): Prisma.InputJsonValue | typeof Prisma.DbNull {
  return value === null ? Prisma.DbNull : value;
}

function toContractEvent(event: {
  id: string;
  runId: string;
  scopeHash: string;
  sequence: number;
  eventType: CandidateAnalysisRunEventInput["eventType"];
  payload: Prisma.JsonValue | null;
  eventHash: string;
  supersededEventId: string | null;
  supersededEventHash: string | null;
  supersededEventScopeHash: string | null;
}): CandidateAnalysisRunEventInput {
  return {
    id: event.id,
    runId: event.runId,
    scopeHash: event.scopeHash,
    sequence: event.sequence,
    eventType: event.eventType,
    payload: event.payload as CandidateJsonValue | null,
    eventHash: event.eventHash,
    supersededEventId: event.supersededEventId,
    supersededEventHash: event.supersededEventHash,
    supersededEventScopeHash: event.supersededEventScopeHash,
  } as CandidateAnalysisRunEventInput;
}

function eventData(input: CandidateAnalysisRunEventInput) {
  return {
    id: input.id,
    runId: input.runId,
    scopeHash: candidateAnalysisRunScopeHash(input.runId),
    sequence: input.sequence,
    eventType: input.eventType,
    payload: toNullableJson(input.payload),
    eventHash: input.eventHash,
    supersededEventId: input.supersededEventId ?? null,
    supersededEventHash: input.supersededEventHash ?? null,
    supersededEventScopeHash: input.supersededEventScopeHash ?? null,
  };
}

function nestedEventData(input: CandidateAnalysisRunEventInput) {
  const data = eventData(input);
  return {
    id: data.id,
    sequence: data.sequence,
    eventType: data.eventType,
    payload: data.payload,
    eventHash: data.eventHash,
    supersededEventId: data.supersededEventId,
    supersededEventHash: data.supersededEventHash,
    supersededEventScopeHash: data.supersededEventScopeHash,
  };
}

function includesEvery(values: string[], required: Set<string>): boolean {
  const available = new Set(values);
  return [...required].every((value) => available.has(value));
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
  declared: { workflowHash: string; promptHash: string },
  readFile: (path: string) => Buffer = (path) => readFileSync(path),
): void {
  const workflowPath = resolveRepositoryBindingPath(
    repositoryRoot,
    CANDIDATE_WORKFLOW_BINDING.path,
    "workflow_binding_mismatch",
  );
  const promptPath = resolveRepositoryBindingPath(
    repositoryRoot,
    CANDIDATE_PROMPT_BINDING.path,
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
    ["Workflow ID", CANDIDATE_WORKFLOW_BINDING.id],
    ["Workflow version", CANDIDATE_WORKFLOW_BINDING.version],
    ["Workflow repository path", CANDIDATE_WORKFLOW_BINDING.path],
    ["Prompt template ID", CANDIDATE_PROMPT_BINDING.id],
    ["Prompt template version", CANDIDATE_PROMPT_BINDING.version],
    ["Prompt template repository path", CANDIDATE_PROMPT_BINDING.path],
  ] as const;
  if (
    createHash("sha256").update(workflowBytes).digest("hex") !==
      declared.workflowHash ||
    !hasExactBindingMetadata(workflow, workflowMetadata)
  ) {
    throw new CandidateAnalysisWriteConflict("workflow_binding_mismatch");
  }

  const promptMetadata = [
    ["Prompt template ID", CANDIDATE_PROMPT_BINDING.id],
    ["Prompt template version", CANDIDATE_PROMPT_BINDING.version],
    ["Prompt template repository path", CANDIDATE_PROMPT_BINDING.path],
    ["Workflow ID", CANDIDATE_WORKFLOW_BINDING.id],
    ["Workflow version", CANDIDATE_WORKFLOW_BINDING.version],
    ["Workflow repository path", CANDIDATE_WORKFLOW_BINDING.path],
  ] as const;
  if (
    createHash("sha256").update(promptBytes).digest("hex") !==
      declared.promptHash ||
    !hasExactBindingMetadata(prompt, promptMetadata)
  ) {
    throw new CandidateAnalysisWriteConflict("prompt_binding_mismatch");
  }
}

type CandidateWriterLockDomain = "run" | "assertion";

function candidateWriterLockKey(
  domain: CandidateWriterLockDomain,
  identity: string,
): bigint {
  const digest = candidateAnalysisSha256(`writer-${domain}-lock`, { identity });
  return BigInt.asIntN(64, BigInt(`0x${digest.slice(0, 16)}`));
}

async function acquireCandidateWriterLock(
  transaction: Prisma.TransactionClient,
  domain: CandidateWriterLockDomain,
  identity: string,
): Promise<void> {
  const rows = await transaction.$queryRaw<Array<{ lockToken: string }>>`
    SELECT pg_advisory_xact_lock(
      ${candidateWriterLockKey(domain, identity)}
    )::text AS "lockToken"
  `;
  if (rows.length !== 1) throw new Error("candidate_writer_lock_failed");
}

async function lockedEvents(
  transaction: Prisma.TransactionClient,
  runId: string,
) {
  await acquireCandidateWriterLock(transaction, "run", runId);
  const run = await transaction.candidateAnalysisRun.findUnique({
    where: { id: runId },
    select: { id: true, scopeHash: true },
  });
  if (run === null) throw new Error("candidate_analysis_run_not_found");
  if (run.scopeHash !== candidateAnalysisRunScopeHash(runId)) {
    throw new CandidateAnalysisWriteConflict("integrity_mismatch");
  }
  return transaction.candidateAnalysisRunEvent.findMany({
    where: { runId },
    orderBy: { sequence: "asc" },
    select: {
      id: true,
      runId: true,
      scopeHash: true,
      sequence: true,
      eventType: true,
      payload: true,
      eventHash: true,
      supersededEventId: true,
      supersededEventHash: true,
      supersededEventScopeHash: true,
    },
  });
}

function stateFromStoredEvents(
  events: Awaited<ReturnType<typeof lockedEvents>>,
): CandidateAnalysisMachineState {
  try {
    return deriveCandidateAnalysisMachineState(events.map(toContractEvent));
  } catch (error) {
    if (error instanceof CandidateAnalysisContractError) {
      throw new CandidateAnalysisWriteConflict("event_sequence_conflict");
    }
    throw error;
  }
}

async function assertRunOpen(
  transaction: Prisma.TransactionClient,
  runId: string,
): Promise<void> {
  const events = await lockedEvents(transaction, runId);
  const state = stateFromStoredEvents(events);
  if (["candidate_complete", "partial", "failed", "blocked_input", "quarantined", "superseded"].includes(state)) {
    throw new CandidateAnalysisWriteConflict("run_terminal");
  }
}

async function storedOutputManifest(
  transaction: Prisma.TransactionClient,
  runId: string,
): Promise<CandidateOutputManifest> {
  const [
    inputs,
    artifacts,
    assertions,
    evidenceLinks,
    dependencies,
    reconciliationSnapshots,
  ] = await Promise.all([
    transaction.candidateAnalysisRunInput.findMany({
      where: { runId },
      orderBy: { position: "asc" },
      select: {
        contentUnitId: true,
        position: true,
        inputHash: true,
        contentUnit: {
          select: { contentHash: true, identityConfidence: true },
        },
      },
    }),
    transaction.candidateAnalysisArtifact.findMany({
      where: { runId },
      orderBy: { id: "asc" },
      select: {
        id: true,
        artifactType: true,
        schemaVersion: true,
        payloadHash: true,
      },
    }),
    transaction.candidateAssertion.findMany({
      where: { runId },
      orderBy: { id: "asc" },
      select: {
        id: true,
        assertionType: true,
        schemaVersion: true,
        payloadHash: true,
        confidence: true,
        machineUse: true,
        identityConfidence: true,
        evidenceLevel: true,
        limitations: true,
        scopeKey: true,
        scopeHash: true,
        supersededAssertionId: true,
        supersededAssertionPayloadHash: true,
      },
    }),
    transaction.candidateEvidenceLink.findMany({
      where: { assertion: { runId } },
      orderBy: { id: "asc" },
      select: {
        id: true,
        assertionId: true,
        contentUnitId: true,
        relation: true,
        locatorHash: true,
        excerptHash: true,
      },
    }),
    transaction.candidateDependency.findMany({
      where: { assertion: { runId } },
      orderBy: { id: "asc" },
      select: {
        id: true,
        assertionId: true,
        upstreamAssertionId: true,
        relation: true,
        inheritedLimitations: true,
      },
    }),
    transaction.candidateReconciliationSnapshot.findMany({
      where: { runId },
      orderBy: { id: "asc" },
      select: {
        id: true,
        scopeHash: true,
        payloadHash: true,
        conflictCount: true,
      },
    }),
  ]);
  if (
    inputs.some(({ inputHash, contentUnit }) => inputHash !== contentUnit.contentHash) ||
    artifacts.some(
      ({ schemaVersion }) => schemaVersion !== CANDIDATE_ANALYSIS_SCHEMA_VERSION,
    ) ||
    assertions.some(
      ({ schemaVersion }) => schemaVersion !== CANDIDATE_ANALYSIS_SCHEMA_VERSION,
    )
  ) {
    throw new CandidateAnalysisWriteConflict("terminal_output_integrity");
  }
  return {
    schemaVersion: "candidate-output-manifest-v1",
    inputs: inputs.map(({ contentUnitId, position, contentUnit }) => ({
      contentUnitId,
      position,
      contentHash: contentUnit.contentHash,
      identityConfidence: contentUnit.identityConfidence,
    })),
    artifacts: artifacts.map((artifact) => ({
      ...artifact,
      schemaVersion: CANDIDATE_ANALYSIS_SCHEMA_VERSION,
    })),
    assertions: assertions.map((assertion) => ({
      ...assertion,
      schemaVersion: CANDIDATE_ANALYSIS_SCHEMA_VERSION,
    })),
    evidenceLinks,
    dependencies,
    reconciliationSnapshots,
  };
}

async function verifyTerminalOutput(
  transaction: Prisma.TransactionClient,
  input: CandidateAnalysisRunEventInput,
): Promise<void> {
  if (input.eventType !== "candidate_completed" && input.eventType !== "partial_completed") return;
  const manifest = await storedOutputManifest(transaction, input.runId);
  if (manifest.artifacts.length === 0 || manifest.assertions.length === 0) {
    throw new CandidateAnalysisWriteConflict("terminal_output_missing");
  }
  const exactAssertions = new Set(
    manifest.assertions
      .filter(({ evidenceLevel }) => evidenceLevel === "exact_locator")
      .map(({ id }) => id),
  );
  if (exactAssertions.size > 0) {
    const exactEvidence = await transaction.candidateEvidenceLink.findMany({
      where: {
        assertionId: { in: [...exactAssertions] },
        relation: "supports",
      },
      select: {
        assertionId: true,
        locator: true,
        locatorHash: true,
        contentUnit: {
          select: {
            locator: true,
            locatorHash: true,
            contentHash: true,
            runInputs: {
              where: { runId: input.runId },
              select: { inputHash: true },
            },
          },
        },
      },
    });
    for (const assertionId of exactAssertions) {
      const bound = exactEvidence.some(
        ({ assertionId: candidateId, locator, locatorHash, contentUnit }) =>
          candidateId === assertionId &&
          locator === contentUnit.locator &&
          locatorHash === contentUnit.locatorHash &&
          contentUnit.runInputs.some(({ inputHash }) => inputHash === contentUnit.contentHash),
      );
      if (!bound) throw new CandidateAnalysisWriteConflict("terminal_output_integrity");
    }
  }
  const supplied = input.payload.data.manifest;
  if (
    input.payload.data.manifestHash !== candidateAnalysisOutputManifestHash(manifest) ||
    canonicalCandidateJson(supplied) !== canonicalCandidateJson(manifest)
  ) {
    throw new CandidateAnalysisWriteConflict("terminal_output_integrity");
  }
}

async function appendRunEvent(
  prisma: PrismaClient,
  rawInput: CandidateAnalysisRunEventInput,
) {
  const input = parseForWrite(CandidateAnalysisRunEventInputSchema, rawInput);
  try {
    return await prisma.$transaction(
      async (transaction) => {
        const events = await lockedEvents(transaction, input.runId);
        if (input.eventType === "superseded") {
          const prior = events.at(-1);
          if (
            prior === undefined ||
            !["candidate_completed", "partial_completed"].includes(prior.eventType) ||
            prior.id !== input.supersededEventId ||
            prior.eventHash !== input.supersededEventHash ||
            prior.runId !== input.runId ||
            prior.scopeHash !== input.supersededEventScopeHash
          ) {
            throw new CandidateAnalysisWriteConflict("supersession_conflict");
          }
        }
        let state: CandidateAnalysisMachineState;
        try {
          state = deriveCandidateAnalysisMachineState([
            ...events.map(toContractEvent),
            input,
          ]);
        } catch (error) {
          if (error instanceof CandidateAnalysisContractError) {
            throw new CandidateAnalysisWriteConflict("event_sequence_conflict");
          }
          throw error;
        }
        await verifyTerminalOutput(transaction, input);
        await transaction.candidateAnalysisRunEvent.create({ data: eventData(input) });
        return { runId: input.runId, sequence: input.sequence, state };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  } catch (error) {
    if (isPrismaErrorCode(error, "P2034")) {
      throw new CandidateAnalysisWriteConflict("event_sequence_conflict");
    }
    throwMappedConflict(error, "event_sequence_conflict");
  }
}

async function appendDependency(
  prisma: PrismaClient,
  rawInput: CandidateDependencyInput,
) {
  const input = parseForWrite(CandidateDependencyInputSchema, rawInput);
  for (let retry = 0; retry < 3; retry += 1) {
    try {
      return await prisma.$transaction(
        async (transaction) => {
          const dependentRun = await transaction.candidateAssertion.findUnique({
            where: { id: input.assertionId },
            select: { runId: true },
          });
          if (dependentRun === null) throw new Error("candidate_assertion_not_found");
          await assertRunOpen(transaction, dependentRun.runId);
          if (input.assertionId === input.upstreamAssertionId) {
            throw new CandidateAnalysisWriteConflict("dependency_cycle");
          }
          for (const assertionId of [
            input.assertionId,
            input.upstreamAssertionId,
          ].sort()) {
            await acquireCandidateWriterLock(
              transaction,
              "assertion",
              assertionId,
            );
          }
          const upstreamClosure = await transaction.$queryRaw<Array<{ id: string }>>`
            WITH RECURSIVE upstream_tree("id") AS (
              VALUES (${input.upstreamAssertionId})
              UNION
              SELECT dependency."upstreamAssertionId"
              FROM "CandidateDependency" AS dependency
              INNER JOIN upstream_tree
                ON dependency."assertionId" = upstream_tree."id"
            )
            SELECT "id" FROM upstream_tree
          `;
          const upstreamIds = upstreamClosure.map(({ id }) => id);
          if (upstreamIds.includes(input.assertionId)) {
            throw new CandidateAnalysisWriteConflict("dependency_cycle");
          }
          const dependent = await transaction.candidateAssertion.findUnique({
            where: { id: input.assertionId },
            select: {
              runId: true,
              limitations: true,
              machineUse: true,
              identityConfidence: true,
              evidenceLevel: true,
            },
          });
          if (dependent === null) throw new Error("candidate_assertion_not_found");
          const [upstreamAssertions, inheritedDependencies, evidence] = await Promise.all([
            transaction.candidateAssertion.findMany({
              where: { id: { in: upstreamIds } },
              select: {
                id: true,
                limitations: true,
                machineUse: true,
                identityConfidence: true,
                evidenceLevel: true,
              },
            }),
            transaction.candidateDependency.findMany({
              where: { assertionId: { in: upstreamIds } },
              select: { inheritedLimitations: true },
            }),
            transaction.candidateEvidenceLink.findMany({
              where: { assertionId: input.assertionId, relation: "supports" },
              select: {
                locator: true,
                locatorHash: true,
                contentUnit: {
                  select: {
                    identityConfidence: true,
                    locator: true,
                    locatorHash: true,
                    contentHash: true,
                    runInputs: {
                      where: { runId: dependent.runId },
                      select: { inputHash: true },
                    },
                  },
                },
              },
            }),
          ]);
          if (upstreamAssertions.length !== upstreamIds.length) {
            throw new Error("candidate_assertion_not_found");
          }
          const qualifyingEvidence = evidence.filter(({ contentUnit }) =>
            contentUnit.runInputs.some(({ inputHash }) => inputHash === contentUnit.contentHash),
          );
          const requiredLimitations = new Set([
            ...upstreamAssertions.flatMap(({ limitations }) => limitations),
            ...inheritedDependencies.flatMap(({ inheritedLimitations }) => inheritedLimitations),
          ]);
          if (
            !includesEvery(input.inheritedLimitations, requiredLimitations) ||
            !includesEvery(dependent.limitations, requiredLimitations)
          ) {
            throw new CandidateAnalysisWriteConflict("upstream_authority_upgrade");
          }
          const weakestMachineUse = Math.min(
            ...upstreamAssertions.map(({ machineUse }) => machineUsePermissiveness[machineUse]),
          );
          if (machineUsePermissiveness[dependent.machineUse] > weakestMachineUse) {
            throw new CandidateAnalysisWriteConflict("upstream_authority_upgrade");
          }
          const weakestIdentity = Math.min(
            ...upstreamAssertions.map(({ identityConfidence }) => identityStrength[identityConfidence]),
          );
          if (identityStrength[dependent.identityConfidence] > weakestIdentity) {
            const independentlySupported = qualifyingEvidence.some(
              ({ contentUnit }) =>
                identityStrength[contentUnit.identityConfidence] >=
                identityStrength[dependent.identityConfidence],
            );
            if (!independentlySupported) {
              throw new CandidateAnalysisWriteConflict("upstream_authority_upgrade");
            }
          }
          const weakestEvidence = Math.min(
            ...upstreamAssertions.map(({ evidenceLevel }) => evidenceStrength[evidenceLevel]),
          );
          if (evidenceStrength[dependent.evidenceLevel] > weakestEvidence) {
            const exactBoundLocator = qualifyingEvidence.some(
              ({ locator, locatorHash, contentUnit }) =>
                locator === contentUnit.locator && locatorHash === contentUnit.locatorHash,
            );
            if (!exactBoundLocator) {
              throw new CandidateAnalysisWriteConflict("upstream_authority_upgrade");
            }
          }
          await transaction.candidateDependency.create({ data: input });
          return { dependencyId: input.id };
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    } catch (error) {
      if (isPrismaErrorCode(error, "P2034") && retry < 2) continue;
      if (isPrismaErrorCode(error, "P2034")) {
        throw new CandidateAnalysisWriteConflict("immutable_history_conflict");
      }
      throwMappedConflict(error, "immutable_history_conflict");
    }
  }
  throw new CandidateAnalysisWriteConflict("immutable_history_conflict");
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
        { workflowHash: input.workflowHash, promptHash: input.promptHash },
        options.readFile,
      );
      try {
        return await prisma.$transaction(
          async (transaction) => {
            const stored = await transaction.candidateContentUnit.findMany({
              where: { id: { in: input.inputs.map(({ contentUnitId }) => contentUnitId) } },
              select: { id: true, contentHash: true },
            });
            const hashes = new Map(stored.map(({ id, contentHash }) => [id, contentHash]));
            if (
              stored.length !== input.inputs.length ||
              input.inputs.some(
                ({ contentUnitId, inputHash, position }, index) =>
                  position !== index || hashes.get(contentUnitId) !== inputHash,
              )
            ) {
              throw new CandidateAnalysisWriteConflict("integrity_mismatch");
            }
            const derivedEnvelope = candidateAnalysisInputEnvelopeHash(
              input.inputs.map(({ contentUnitId, position }) => ({
                contentUnitId,
                position,
                inputHash: hashes.get(contentUnitId)!,
              })),
            );
            if (
              derivedEnvelope !== input.inputEnvelopeHash ||
              candidateAnalysisRunIdempotencyKey({ ...input, inputEnvelopeHash: derivedEnvelope }) !==
                input.idempotencyKey
            ) {
              throw new CandidateAnalysisWriteConflict("integrity_mismatch");
            }
            await transaction.candidateAnalysisRun.create({
              data: {
                id: input.id,
                scopeHash: candidateAnalysisRunScopeHash(input.id),
                workflowId: input.workflowId,
                workflowVersion: input.workflowVersion,
                workflowPath: input.workflowPath,
                workflowHash: input.workflowHash,
                promptId: input.promptId,
                promptVersion: input.promptVersion,
                promptPath: input.promptPath,
                promptHash: input.promptHash,
                modelProvider: input.modelProvider,
                modelName: input.modelName,
                modelVersion: input.modelVersion,
                config: toRequiredJson(input.config),
                configHash: input.configHash,
                inputEnvelopeHash: input.inputEnvelopeHash,
                purpose: input.purpose,
                outputProfile: input.outputProfile,
                workerId: input.workerId,
                idempotencyKey: input.idempotencyKey,
                attempt: input.attempt,
                predecessorRun:
                  input.predecessorRunId === null
                    ? undefined
                    : { connect: { id: input.predecessorRunId } },
                inputs: {
                  create: input.inputs.map(({ contentUnitId, position, inputHash }) => ({
                    contentUnitId,
                    position,
                    inputHash,
                  })),
                },
                eventsByScope: { create: nestedEventData(input.initialEvent) },
              },
            });
            return { runId: input.id, created: true as const };
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
        );
      } catch (error) {
        throwMappedConflict(error, "idempotency_conflict");
      }
    },

    appendRunEvent(rawInput) {
      return appendRunEvent(prisma, rawInput);
    },

    async appendArtifact(rawInput) {
      const input = parseForWrite(CandidateAnalysisArtifactInputSchema, rawInput);
      try {
        return await prisma.$transaction(
          async (transaction) => {
            await assertRunOpen(transaction, input.runId);
            await transaction.candidateAnalysisArtifact.create({
              data: {
                id: input.id,
                runId: input.runId,
                artifactType: input.artifactType,
                schemaVersion: input.schemaVersion,
                payload: toRequiredJson(input.payload),
                payloadHash: input.payloadHash,
              },
            });
            return { artifactId: input.id };
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
        );
      } catch (error) {
        throwMappedConflict(error, "immutable_history_conflict");
      }
    },

    async appendAssertion(rawInput) {
      const input = parseForWrite(CandidateAssertionInputSchema, rawInput);
      try {
        return await prisma.$transaction(
          async (transaction) => {
            await assertRunOpen(transaction, input.runId);
            if (input.supersededAssertionId !== null) {
              const prior = await transaction.candidateAssertion.findUnique({
                where: { id: input.supersededAssertionId },
                select: { payloadHash: true, scopeHash: true },
              });
              if (
                prior === null ||
                prior.payloadHash !== input.supersededAssertionPayloadHash ||
                prior.scopeHash !== input.scopeHash
              ) {
                throw new CandidateAnalysisWriteConflict("supersession_conflict");
              }
            }
            await transaction.candidateAssertion.create({
              data: {
                id: input.id,
                runId: input.runId,
                assertionType: input.assertionType,
                schemaVersion: input.schemaVersion,
                payload: toRequiredJson(input.payload),
                payloadHash: input.payloadHash,
                confidence: input.confidence,
                machineUse: input.machineUse,
                identityConfidence: input.identityConfidence,
                evidenceLevel: input.evidenceLevel,
                limitations: input.limitations,
                scopeKey: input.scopeKey,
                scopeHash: input.scopeHash,
                supersededAssertionId: input.supersededAssertionId,
                supersededAssertionPayloadHash: input.supersededAssertionPayloadHash,
              },
            });
            return { assertionId: input.id };
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
        );
      } catch (error) {
        if (isPrismaErrorCode(error, "P2003")) {
          throw new CandidateAnalysisWriteConflict("supersession_conflict");
        }
        throwMappedConflict(error, "immutable_history_conflict");
      }
    },

    async appendEvidenceLink(rawInput) {
      const input = parseForWrite(CandidateEvidenceLinkInputSchema, rawInput);
      try {
        return await prisma.$transaction(
          async (transaction) => {
            const assertion = await transaction.candidateAssertion.findUnique({
              where: { id: input.assertionId },
              select: { runId: true },
            });
            if (assertion === null) throw new Error("candidate_assertion_not_found");
            await assertRunOpen(transaction, assertion.runId);
            const boundInput = await transaction.candidateAnalysisRunInput.findFirst({
              where: {
                runId: assertion.runId,
                contentUnitId: input.contentUnitId,
                contentUnit: { contentHash: { not: "" } },
              },
              select: { inputHash: true, contentUnit: { select: { contentHash: true } } },
            });
            if (boundInput === null || boundInput.inputHash !== boundInput.contentUnit.contentHash) {
              throw new CandidateAnalysisWriteConflict("integrity_mismatch");
            }
            await transaction.candidateEvidenceLink.create({ data: input });
            return { evidenceLinkId: input.id };
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
        );
      } catch (error) {
        throwMappedConflict(error, "immutable_history_conflict");
      }
    },

    appendDependency(rawInput) {
      return appendDependency(prisma, rawInput);
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
        return await prisma.$transaction(
          async (transaction) => {
            await assertRunOpen(transaction, input.runId);
            await transaction.candidateReconciliationSnapshot.create({
              data: {
                id: input.id,
                runId: input.runId,
                scope: toRequiredJson(input.scope),
                scopeHash: input.scopeHash,
                payload: toRequiredJson(input.payload),
                payloadHash: input.payloadHash,
                conflictCount: input.conflictCount,
              },
            });
            return { snapshotId: input.id };
          },
          { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
        );
      } catch (error) {
        throwMappedConflict(error, "immutable_history_conflict");
      }
    },
  };
}
