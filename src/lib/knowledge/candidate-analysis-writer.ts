import { Prisma, type PrismaClient } from "../../generated/prisma/client";

import {
  CandidateAnalysisArtifactInputSchema,
  CandidateAnalysisContractError,
  CandidateAnalysisRunEventInputSchema,
  CandidateAnalysisRunInputSchema,
  CandidateAssertionInputSchema,
  CandidateDependencyInputSchema,
  CandidateEvidenceLinkInputSchema,
  CandidateReconciliationSnapshotInputSchema,
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
  type CandidateReconciliationSnapshotInput,
} from "./candidate-analysis-contract";

export type CandidateAnalysisWriteConflictCode =
  | "idempotency_conflict"
  | "event_sequence_conflict"
  | "terminal_output_missing"
  | "dependency_cycle"
  | "upstream_authority_upgrade"
  | "immutable_history_conflict";

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

function throwMappedUniqueConflict(
  error: unknown,
  code: CandidateAnalysisWriteConflictCode,
): never {
  if (error instanceof CandidateAnalysisWriteConflict) throw error;
  if (isPrismaErrorCode(error, "P2002")) {
    throw new CandidateAnalysisWriteConflict(code);
  }
  throw error;
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
  sequence: number;
  eventType: CandidateAnalysisRunEventInput["eventType"];
  payload: Prisma.JsonValue | null;
  eventHash: string;
}): CandidateAnalysisRunEventInput {
  return {
    id: event.id,
    runId: event.runId,
    sequence: event.sequence,
    eventType: event.eventType,
    payload: event.payload as CandidateJsonValue | null,
    eventHash: event.eventHash,
  };
}

function includesEvery(values: string[], required: Set<string>): boolean {
  const available = new Set(values);
  return [...required].every((value) => available.has(value));
}

async function appendRunEvent(
  prisma: PrismaClient,
  rawInput: CandidateAnalysisRunEventInput,
) {
  const input = CandidateAnalysisRunEventInputSchema.parse(rawInput);
  try {
    return await prisma.$transaction(
      async (transaction) => {
        await transaction.$queryRaw<Array<{ id: string }>>`
          SELECT "id"
          FROM "CandidateAnalysisRun"
          WHERE "id" = ${input.runId}
          FOR UPDATE
        `;
        const events = await transaction.candidateAnalysisRunEvent.findMany({
          where: { runId: input.runId },
          orderBy: { sequence: "asc" },
          select: {
            id: true,
            runId: true,
            sequence: true,
            eventType: true,
            payload: true,
            eventHash: true,
          },
        });

        let state: CandidateAnalysisMachineState;
        try {
          state = deriveCandidateAnalysisMachineState([
            ...events.map(toContractEvent),
            input,
          ]);
        } catch (error) {
          if (error instanceof CandidateAnalysisContractError) {
            throw new CandidateAnalysisWriteConflict(
              "event_sequence_conflict",
            );
          }
          throw error;
        }

        if (state === "candidate_complete" || state === "partial") {
          const [artifacts, assertions] = await Promise.all([
            transaction.candidateAnalysisArtifact.count({
              where: { runId: input.runId },
            }),
            transaction.candidateAssertion.count({
              where: { runId: input.runId },
            }),
          ]);
          if (artifacts === 0 || assertions === 0) {
            throw new CandidateAnalysisWriteConflict(
              "terminal_output_missing",
            );
          }
        }

        await transaction.candidateAnalysisRunEvent.create({
          data: {
            id: input.id,
            runId: input.runId,
            sequence: input.sequence,
            eventType: input.eventType,
            payload: toNullableJson(input.payload),
            eventHash: input.eventHash,
          },
        });
        return { runId: input.runId, sequence: input.sequence, state };
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
    );
  } catch (error) {
    if (isPrismaErrorCode(error, "P2034")) {
      throw new CandidateAnalysisWriteConflict("event_sequence_conflict");
    }
    throwMappedUniqueConflict(error, "event_sequence_conflict");
  }
}

async function appendDependency(
  prisma: PrismaClient,
  rawInput: CandidateDependencyInput,
) {
  const input = CandidateDependencyInputSchema.parse(rawInput);
  for (let retry = 0; retry < 3; retry += 1) {
    try {
      return await prisma.$transaction(
      async (transaction) => {
        await transaction.$queryRaw<Array<{ id: string }>>`
          SELECT "id"
          FROM "CandidateAssertion"
          WHERE "id" IN (${input.assertionId}, ${input.upstreamAssertionId})
          ORDER BY "id"
          FOR UPDATE
        `;

        if (input.assertionId === input.upstreamAssertionId) {
          throw new CandidateAnalysisWriteConflict("dependency_cycle");
        }

        const upstreamClosure = await transaction.$queryRaw<
          Array<{ id: string }>
        >`
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
        if (dependent === null) {
          throw new Error("candidate_assertion_not_found");
        }

        const [upstreamAssertions, inheritedDependencies, evidence] =
          await Promise.all([
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
              where: {
                assertionId: input.assertionId,
                relation: "supports",
              },
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
          contentUnit.runInputs.some(
            ({ inputHash }) => inputHash === contentUnit.contentHash,
          ),
        );

        const requiredLimitations = new Set([
          ...upstreamAssertions.flatMap(({ limitations }) => limitations),
          ...inheritedDependencies.flatMap(
            ({ inheritedLimitations }) => inheritedLimitations,
          ),
        ]);
        if (
          !includesEvery(input.inheritedLimitations, requiredLimitations) ||
          !includesEvery(dependent.limitations, requiredLimitations)
        ) {
          throw new CandidateAnalysisWriteConflict(
            "upstream_authority_upgrade",
          );
        }

        const weakestMachineUse = Math.min(
          ...upstreamAssertions.map(
            ({ machineUse }) => machineUsePermissiveness[machineUse],
          ),
        );
        if (
          machineUsePermissiveness[dependent.machineUse] > weakestMachineUse
        ) {
          throw new CandidateAnalysisWriteConflict(
            "upstream_authority_upgrade",
          );
        }

        const weakestIdentity = Math.min(
          ...upstreamAssertions.map(
            ({ identityConfidence }) => identityStrength[identityConfidence],
          ),
        );
        if (identityStrength[dependent.identityConfidence] > weakestIdentity) {
          const independentlySupported = qualifyingEvidence.some(
            ({ contentUnit }) =>
              identityStrength[contentUnit.identityConfidence] >=
              identityStrength[dependent.identityConfidence],
          );
          if (!independentlySupported) {
            throw new CandidateAnalysisWriteConflict(
              "upstream_authority_upgrade",
            );
          }
        }

        const weakestEvidence = Math.min(
          ...upstreamAssertions.map(
            ({ evidenceLevel }) => evidenceStrength[evidenceLevel],
          ),
        );
        if (evidenceStrength[dependent.evidenceLevel] > weakestEvidence) {
          const exactBoundLocator = qualifyingEvidence.some(
            ({ locator, locatorHash, contentUnit }) =>
              locator === contentUnit.locator &&
              locatorHash === contentUnit.locatorHash,
          );
          if (!exactBoundLocator) {
            throw new CandidateAnalysisWriteConflict(
              "upstream_authority_upgrade",
            );
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
      throwMappedUniqueConflict(error, "immutable_history_conflict");
    }
  }
  throw new CandidateAnalysisWriteConflict("immutable_history_conflict");
}

export function createCandidateAnalysisWriter(
  prisma: PrismaClient,
): CandidateAnalysisWriter {
  return {
    async createRun(rawInput) {
      const input = CandidateAnalysisRunInputSchema.parse(rawInput);
      try {
        await prisma.candidateAnalysisRun.create({
          data: {
            id: input.id,
            workflowId: input.workflowId,
            workflowVersion: input.workflowVersion,
            modelProvider: input.modelProvider,
            modelName: input.modelName,
            modelVersion: input.modelVersion,
            promptHash: input.promptHash,
            configHash: input.configHash,
            inputEnvelopeHash: input.inputEnvelopeHash,
            purpose: input.purpose,
            outputProfile: input.outputProfile,
            workerId: input.workerId,
            idempotencyKey: input.idempotencyKey,
            attempt: input.attempt,
            predecessorRunId: input.predecessorRunId,
            inputs: {
              create: input.inputs.map((runInput) => ({
                contentUnitId: runInput.contentUnitId,
                position: runInput.position,
                inputHash: runInput.inputHash,
              })),
            },
          },
        });
        return { runId: input.id, created: true };
      } catch (error) {
        throwMappedUniqueConflict(error, "idempotency_conflict");
      }
    },

    appendRunEvent(rawInput) {
      return appendRunEvent(prisma, rawInput);
    },

    async appendArtifact(rawInput) {
      const input = CandidateAnalysisArtifactInputSchema.parse(rawInput);
      try {
        await prisma.candidateAnalysisArtifact.create({
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
      } catch (error) {
        throwMappedUniqueConflict(error, "immutable_history_conflict");
      }
    },

    async appendAssertion(rawInput) {
      const input = CandidateAssertionInputSchema.parse(rawInput);
      try {
        await prisma.candidateAssertion.create({
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
            supersededAssertionId: input.supersededAssertionId,
          },
        });
        return { assertionId: input.id };
      } catch (error) {
        throwMappedUniqueConflict(error, "immutable_history_conflict");
      }
    },

    async appendEvidenceLink(rawInput) {
      const input = CandidateEvidenceLinkInputSchema.parse(rawInput);
      try {
        await prisma.candidateEvidenceLink.create({ data: input });
        return { evidenceLinkId: input.id };
      } catch (error) {
        throwMappedUniqueConflict(error, "immutable_history_conflict");
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
      const input = CandidateReconciliationSnapshotInputSchema.parse(rawInput);
      try {
        await prisma.candidateReconciliationSnapshot.create({
          data: {
            id: input.id,
            runId: input.runId,
            scopeHash: input.scopeHash,
            payload: toRequiredJson(input.payload),
            payloadHash: input.payloadHash,
            conflictCount: input.conflictCount,
          },
        });
        return { snapshotId: input.id };
      } catch (error) {
        throwMappedUniqueConflict(error, "immutable_history_conflict");
      }
    },
  };
}
