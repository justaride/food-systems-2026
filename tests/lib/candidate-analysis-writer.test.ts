import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../../src/generated/prisma/client";
import type {
  CandidateAnalysisArtifactInput,
  CandidateAnalysisRunEventInput,
  CandidateAssertionInput,
  CandidateContentUnitInput,
  CandidateDependencyInput,
  CandidateEvidenceLevel,
  CandidateIdentityConfidence,
  CandidateAnalysisRunInput,
  CandidateReconciliationSnapshotInput,
} from "../../src/lib/knowledge/candidate-analysis-contract";
import {
  candidateAnalysisArtifactPayloadHash,
  candidateAnalysisAssertionPayloadHash,
  candidateAnalysisAssertionScopeHash,
  candidateAnalysisEvidenceLocatorHash,
  candidateAnalysisInputEnvelopeHash,
  candidateAnalysisOutputManifestHash,
  candidateAnalysisReconciliationPayloadHash,
  candidateAnalysisReconciliationScopeHash,
  candidateAnalysisRunEventHash,
  candidateAnalysisRunIdempotencyKey,
  candidateAnalysisRunScopeHash,
  CANDIDATE_PROMPT_BINDING,
  CANDIDATE_WORKFLOW_BINDING,
  type CandidateOutputManifest,
} from "../../src/lib/knowledge/candidate-analysis-contract";
import {
  type CandidateAnalysisWriter,
  CandidateAnalysisWriteConflict,
  createCandidateAnalysisWriter,
  createCandidateReconciliationWriter,
} from "../../src/lib/knowledge/candidate-analysis-writer";
import { candidateAnalysisFixture } from "../fixtures/candidate-analysis-fixture";
import { withCandidateAnalysisPostgres } from "../helpers/candidate-analysis-postgres";

const hash = (character: string) => character.repeat(64);

function candidatePrisma(adminUrl: string) {
  return new PrismaClient({
    adapter: new PrismaPg({ connectionString: adminUrl }),
  });
}

function resealRun(
  run: CandidateAnalysisRunInput,
  overrides: Partial<CandidateAnalysisRunInput>,
): CandidateAnalysisRunInput {
  const next = { ...run, ...overrides };
  const inputEnvelopeHash = candidateAnalysisInputEnvelopeHash(next.inputs);
  return {
    ...next,
    inputEnvelopeHash,
    idempotencyKey: candidateAnalysisRunIdempotencyKey({
      ...next,
      inputEnvelopeHash,
    }),
  };
}

async function withPrisma(
  adminUrl: string,
  callback: (prisma: ReturnType<typeof candidatePrisma>) => Promise<void>,
) {
  const prisma = candidatePrisma(adminUrl);
  try {
    await callback(prisma);
  } finally {
    await prisma.$disconnect();
  }
}

async function seedContentUnit(
  prisma: ReturnType<typeof candidatePrisma>,
  input: CandidateContentUnitInput,
) {
  await prisma.candidateContentUnit.create({ data: input });
}

function eventWith(
  input: CandidateAnalysisRunEventInput,
  overrides: { [key: string]: unknown },
): CandidateAnalysisRunEventInput {
  const event = { ...input, ...overrides } as CandidateAnalysisRunEventInput;
  return {
    ...event,
    eventHash: candidateAnalysisRunEventHash(event),
  } as CandidateAnalysisRunEventInput;
}

function assertionWith(
  input: CandidateAssertionInput,
  overrides: { [key: string]: unknown },
): CandidateAssertionInput {
  const rawPayload = overrides.payload ?? input.payload;
  const payload =
    typeof rawPayload === "object" &&
    rawPayload !== null &&
    "namespace" in rawPayload
      ? (rawPayload as CandidateAssertionInput["payload"])
      : {
          namespace: "candidate" as const,
          kind: "assertion" as const,
          data: rawPayload as never,
        };
  const scopeKey = (overrides.scopeKey as string | undefined) ?? input.scopeKey;
  return {
    ...input,
    ...overrides,
    payload,
    payloadHash: candidateAnalysisAssertionPayloadHash(payload),
    scopeKey,
    scopeHash: candidateAnalysisAssertionScopeHash(scopeKey),
  } as CandidateAssertionInput;
}

function dependencyInput(
  assertion: CandidateAssertionInput,
  upstream: CandidateAssertionInput,
  overrides: Partial<CandidateDependencyInput> = {},
): CandidateDependencyInput {
  return {
    id: `dependency:${assertion.id}:${upstream.id}`,
    assertionId: assertion.id,
    upstreamAssertionId: upstream.id,
    relation: "derived_from",
    inheritedLimitations: [...upstream.limitations].sort(),
    ...overrides,
  };
}

function hasCandidateWriteConflictCode(
  error: unknown,
  code: CandidateAnalysisWriteConflict["code"],
) {
  return error instanceof CandidateAnalysisWriteConflict && error.code === code;
}

function hasWriteCode(error: unknown, code: string): boolean {
  return (
    error instanceof CandidateAnalysisWriteConflict && error.code === code
  );
}

const VALID_WORKFLOW_BINDING_TEXT = `# Candidate workflow test fixture

Workflow ID: \`workflow.candidate_analysis.v1\`
Workflow version: \`1.0.0\`
Workflow repository path: \`knowledge/corpus/workflows/candidate-analysis-v1.md\`
Prompt template ID: \`prompt.candidate_analysis.v1\`
Prompt template version: \`1.0.0\`
Prompt template repository path: \`knowledge/corpus/workflows/candidate-analysis-prompt-v1.md\`
`;

const VALID_PROMPT_BINDING_TEXT = `# Candidate prompt test fixture

Prompt template ID: \`prompt.candidate_analysis.v1\`
Prompt template version: \`1.0.0\`
Prompt template repository path: \`knowledge/corpus/workflows/candidate-analysis-prompt-v1.md\`
Workflow ID: \`workflow.candidate_analysis.v1\`
Workflow version: \`1.0.0\`
Workflow repository path: \`knowledge/corpus/workflows/candidate-analysis-v1.md\`
`;

function sha256Bytes(bytes: Buffer): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function writeBindingRepository(workflowText: string, promptText: string) {
  const repositoryRoot = mkdtempSync(join(tmpdir(), "candidate-binding-bundle-"));
  const workflowPath = join(repositoryRoot, CANDIDATE_WORKFLOW_BINDING.path);
  const promptPath = join(repositoryRoot, CANDIDATE_PROMPT_BINDING.path);
  mkdirSync(dirname(workflowPath), { recursive: true });
  const workflowBytes = Buffer.from(workflowText);
  const promptBytes = Buffer.from(promptText);
  writeFileSync(workflowPath, workflowBytes);
  writeFileSync(promptPath, promptBytes);
  return { repositoryRoot, workflowPath, promptPath, workflowBytes, promptBytes };
}

function writerWithReadSeam(
  prisma: InstanceType<typeof PrismaClient>,
  options: { repositoryRoot: string; readFile?: (path: string) => Buffer },
): CandidateAnalysisWriter {
  const create = createCandidateAnalysisWriter as unknown as (
    client: InstanceType<typeof PrismaClient>,
    writerOptions: typeof options,
  ) => CandidateAnalysisWriter;
  return create(prisma, options);
}

function runBoundToBytes(
  run: CandidateAnalysisRunInput,
  workflowBytes: Buffer,
  promptBytes: Buffer,
): CandidateAnalysisRunInput {
  return resealRun(run, {
    workflowHash: sha256Bytes(workflowBytes),
    promptHash: sha256Bytes(promptBytes),
  });
}

function propositionData(
  value: string,
): CandidateAssertionInput["payload"]["data"] {
  return {
    entries: [{ role: "proposition", valueType: "text", value }],
  };
}

function summaryData(
  value: string,
): CandidateAnalysisArtifactInput["payload"]["data"] {
  return {
    entries: [{ role: "summary", valueType: "text", value }],
  };
}

function noContradictionsData(): CandidateReconciliationSnapshotInput["payload"]["data"] {
  return {
    entries: [{ role: "contradiction", valueType: "flag", value: false }],
  };
}

async function seedTwoAssertions(prisma: ReturnType<typeof candidatePrisma>) {
  const fixture = candidateAnalysisFixture();
  await seedContentUnit(prisma, fixture.contentUnit);
  const writer = createCandidateAnalysisWriter(prisma);
  await writer.createRun(fixture.run);
  const assertionA = assertionWith(fixture.assertion, {
    id: "assertion:cycle:a",
    payload: propositionData("Assertion A"),
    payloadHash: hash("1"),
  });
  const assertionB = assertionWith(fixture.assertion, {
    id: "assertion:cycle:b",
    payload: propositionData("Assertion B"),
    payloadHash: hash("2"),
  });
  await writer.appendAssertion(assertionA);
  await writer.appendAssertion(assertionB);
  return { writer, assertionA, assertionB };
}

async function seedAuthorityScenario(
  prisma: ReturnType<typeof candidatePrisma>,
  options: {
    upstreamIdentity?: CandidateIdentityConfidence;
    upstreamEvidence?: CandidateEvidenceLevel;
    dependentIdentity?: CandidateIdentityConfidence;
    dependentEvidence?: CandidateEvidenceLevel;
    supportingUnit?: CandidateContentUnitInput;
    supportingInputHash?: string | null;
  } = {},
) {
  const fixture = candidateAnalysisFixture({ identityConfidence: "unresolved" });
  await seedContentUnit(prisma, fixture.contentUnit);
  if (options.supportingUnit) {
    await seedContentUnit(prisma, options.supportingUnit);
  }
  const writer = createCandidateAnalysisWriter(prisma);
  const includeSupportingInput =
    options.supportingUnit && options.supportingInputHash !== null;
  await writer.createRun(resealRun(fixture.run, {
    ...fixture.run,
    inputs: [
      ...fixture.run.inputs,
      ...(includeSupportingInput
        ? [
            {
              contentUnitId: options.supportingUnit!.id,
              position: 1,
              inputHash:
                options.supportingInputHash ??
                options.supportingUnit!.contentHash,
            },
          ]
        : []),
    ],
  }));
  const unresolvedUpstream = assertionWith(fixture.assertion, {
    id: "assertion:authority:upstream",
    payload: propositionData("Unresolved upstream"),
    payloadHash: hash("3"),
    identityConfidence: options.upstreamIdentity ?? "unresolved",
    evidenceLevel: options.upstreamEvidence ?? "no_locator",
    limitations: ["identity_unresolved"],
  });
  const strongerDependent = assertionWith(fixture.assertion, {
    id: "assertion:authority:dependent",
    payload: propositionData("Stronger dependent"),
    payloadHash: hash("4"),
    identityConfidence: options.dependentIdentity ?? "exact",
    evidenceLevel: options.dependentEvidence ?? "no_locator",
    limitations: ["identity_unresolved", "machine_generated"].sort(),
  });
  await writer.appendAssertion(unresolvedUpstream);
  await writer.appendAssertion(strongerDependent);
  return { writer, fixture, strongerDependent, unresolvedUpstream };
}

function authorityContentUnit(
  fixture: ReturnType<typeof candidateAnalysisFixture>,
  overrides: Partial<CandidateContentUnitInput> = {},
): CandidateContentUnitInput {
  return {
    ...fixture.contentUnit,
    id: "content:authority:supporting",
    sourceKey: "source:authority:supporting",
    locator: "section:supporting",
    contentHash: hash("c"),
    identityConfidence: "exact",
    ...overrides,
    locatorHash: candidateAnalysisEvidenceLocatorHash(
      overrides.locator ?? "section:supporting",
    ),
  };
}

test(
  "an unresolved source can complete a candidate run without review rows",
  { timeout: 45_000 },
  async (t) => {
    await withCandidateAnalysisPostgres(t, async ({ adminUrl }) => {
      await withPrisma(adminUrl, async (prisma) => {
        const fixture = candidateAnalysisFixture({
          identityConfidence: "unresolved",
        });
        await seedContentUnit(prisma, fixture.contentUnit);
        const writer = createCandidateAnalysisWriter(prisma);
        await writer.createRun(fixture.run);
        await writer.appendRunEvent(
          fixture.events.started,
        );
        await writer.appendArtifact(fixture.artifact);
        await writer.appendAssertion(fixture.assertion);
        await writer.appendEvidenceLink(fixture.evidenceLink);
        const completed = await writer.appendRunEvent(
          eventWith(fixture.events.completed, {
            sequence: 3,
            eventHash: hash("3"),
          }),
        );

        assert.deepEqual(completed, {
          runId: fixture.run.id,
          sequence: 3,
          state: "candidate_complete",
        });
        assert.equal(await prisma.candidateHumanReviewDecision.count(), 0);
        assert.equal(await prisma.candidatePromotionDecision.count(), 0);
      });
    });
  },
);

test(
  "completion fails without an artifact and assertion",
  { timeout: 45_000 },
  async (t) => {
    await withCandidateAnalysisPostgres(t, async ({ adminUrl }) => {
      await withPrisma(adminUrl, async (prisma) => {
        const fixture = candidateAnalysisFixture();
        await seedContentUnit(prisma, fixture.contentUnit);
        const writer = createCandidateAnalysisWriter(prisma);
        await writer.createRun(fixture.run);
        await writer.appendRunEvent(
          fixture.events.started,
        );
        await assert.rejects(
          writer.appendRunEvent(
            eventWith(fixture.events.completed, {
              sequence: 3,
              eventHash: hash("3"),
            }),
          ),
          (error: unknown) =>
            hasCandidateWriteConflictCode(error, "terminal_output_missing"),
        );
        assert.equal(await prisma.candidateAnalysisRunEvent.count(), 2);
      });
    });
  },
);

test(
  "retries use a new run while an identical idempotency key is rejected",
  { timeout: 45_000 },
  async (t) => {
    await withCandidateAnalysisPostgres(t, async ({ adminUrl }) => {
      await withPrisma(adminUrl, async (prisma) => {
        const original = candidateAnalysisFixture();
        await seedContentUnit(prisma, original.contentUnit);
        const writer = createCandidateAnalysisWriter(prisma);
        await writer.createRun(original.run);
        await assert.rejects(
          writer.createRun(original.run),
          (error: unknown) =>
            hasCandidateWriteConflictCode(error, "idempotency_conflict"),
        );
        const retry = candidateAnalysisFixture({
          runId: "run:retry:2",
          attempt: 2,
          predecessorRunId: original.run.id,
        });
        assert.deepEqual(await writer.createRun(retry.run), {
          runId: retry.run.id,
          created: true,
        });
        assert.equal(await prisma.candidateAnalysisRun.count(), 2);
        assert.equal(await prisma.candidateAnalysisRunInput.count(), 2);
      });
    });
  },
);

test(
  "run creation is atomic with its immutable inputs",
  { timeout: 45_000 },
  async (t) => {
    await withCandidateAnalysisPostgres(t, async ({ adminUrl }) => {
      await withPrisma(adminUrl, async (prisma) => {
        const fixture = candidateAnalysisFixture();
        const writer = createCandidateAnalysisWriter(prisma);
        await assert.rejects(writer.createRun(fixture.run));
        assert.equal(await prisma.candidateAnalysisRun.count(), 0);
        assert.equal(await prisma.candidateAnalysisRunInput.count(), 0);
      });
    });
  },
);

test(
  "run events remain contiguous and duplicate sequences use a stable conflict",
  { timeout: 45_000 },
  async (t) => {
    await withCandidateAnalysisPostgres(t, async ({ adminUrl }) => {
      await withPrisma(adminUrl, async (prisma) => {
        const fixture = candidateAnalysisFixture();
        await seedContentUnit(prisma, fixture.contentUnit);
        const writer = createCandidateAnalysisWriter(prisma);
        await writer.createRun(fixture.run);
        await assert.rejects(
          writer.appendRunEvent(
            eventWith(fixture.events.checkpoint1, {
              sequence: 3,
              eventHash: hash("3"),
            }),
          ),
          (error: unknown) =>
            hasCandidateWriteConflictCode(error, "event_sequence_conflict"),
        );
        await assert.rejects(
          writer.appendRunEvent(
            eventWith(fixture.events.started, {
              sequence: 1,
              eventHash: hash("2"),
            }),
          ),
          (error: unknown) =>
            hasCandidateWriteConflictCode(error, "event_sequence_conflict"),
        );
        assert.equal(await prisma.candidateAnalysisRunEvent.count(), 1);
      });
    });
  },
);

test(
  "dependency cycles are rejected without deleting either candidate",
  { timeout: 45_000 },
  async (t) => {
    await withCandidateAnalysisPostgres(t, async ({ adminUrl }) => {
      await withPrisma(adminUrl, async (prisma) => {
        const { writer, assertionA, assertionB } =
          await seedTwoAssertions(prisma);
        await writer.appendDependency(dependencyInput(assertionA, assertionB));
        await assert.rejects(
          writer.appendDependency(dependencyInput(assertionB, assertionA)),
          (error: unknown) =>
            hasCandidateWriteConflictCode(error, "dependency_cycle"),
        );
        assert.equal(await prisma.candidateAssertion.count(), 2);
        assert.equal(await prisma.candidateDependency.count(), 1);
      });
    });
  },
);

test(
  "multi-hop dependency cycles are rejected by the recursive integrity check",
  { timeout: 45_000 },
  async (t) => {
    await withCandidateAnalysisPostgres(t, async ({ adminUrl }) => {
      await withPrisma(adminUrl, async (prisma) => {
        const { writer, assertionA, assertionB } =
          await seedTwoAssertions(prisma);
        const assertionC = assertionWith(assertionA, {
          id: "assertion:cycle:c",
          payload: propositionData("Assertion C"),
          payloadHash: hash("6"),
        });
        await writer.appendAssertion(assertionC);
        await writer.appendDependency(dependencyInput(assertionA, assertionB));
        await writer.appendDependency(dependencyInput(assertionB, assertionC));

        await assert.rejects(
          writer.appendDependency(dependencyInput(assertionC, assertionA)),
          (error: unknown) =>
            hasCandidateWriteConflictCode(error, "dependency_cycle"),
        );
        assert.equal(await prisma.candidateDependency.count(), 2);
      });
    });
  },
);

test(
  "simultaneous inverse dependencies serialize to one edge and one cycle conflict",
  { timeout: 45_000 },
  async (t) => {
    await withCandidateAnalysisPostgres(t, async ({ adminUrl }) => {
      await withPrisma(adminUrl, async (prisma) => {
        const { writer, assertionA, assertionB } =
          await seedTwoAssertions(prisma);
        const outcomes = await Promise.allSettled([
          writer.appendDependency(dependencyInput(assertionA, assertionB)),
          writer.appendDependency(dependencyInput(assertionB, assertionA)),
        ]);

        assert.equal(
          outcomes.filter(({ status }) => status === "fulfilled").length,
          1,
        );
        const rejected = outcomes.find(({ status }) => status === "rejected");
        assert.ok(rejected && rejected.status === "rejected");
        assert.equal(
          hasCandidateWriteConflictCode(rejected.reason, "dependency_cycle"),
          true,
          `unexpected conflict: ${rejected.reason instanceof Error ? `${rejected.reason.name}:${rejected.reason.message}` : String(rejected.reason)}`,
        );
        assert.equal(await prisma.candidateDependency.count(), 1);
      });
    });
  },
);

test(
  "identity-only strengthening fails without qualifying direct evidence",
  { timeout: 45_000 },
  async (t) => {
    await withCandidateAnalysisPostgres(t, async ({ adminUrl }) => {
      await withPrisma(adminUrl, async (prisma) => {
        const { writer, strongerDependent, unresolvedUpstream } =
          await seedAuthorityScenario(prisma, {
            dependentIdentity: "exact",
            dependentEvidence: "no_locator",
          });
        await assert.rejects(
          writer.appendDependency(
            dependencyInput(strongerDependent, unresolvedUpstream),
          ),
          (error: unknown) =>
            hasCandidateWriteConflictCode(error, "upstream_authority_upgrade"),
        );
        assert.equal(await prisma.candidateDependency.count(), 0);
      });
    });
  },
);

test(
  "evidence-only strengthening fails without an exact bound locator",
  { timeout: 45_000 },
  async (t) => {
    await withCandidateAnalysisPostgres(t, async ({ adminUrl }) => {
      await withPrisma(adminUrl, async (prisma) => {
        const fixture = candidateAnalysisFixture({
          identityConfidence: "unresolved",
        });
        const supportingUnit = authorityContentUnit(fixture, {
          identityConfidence: "unresolved",
        });
        const { writer, strongerDependent, unresolvedUpstream } =
          await seedAuthorityScenario(prisma, {
            upstreamIdentity: "unresolved",
            dependentIdentity: "unresolved",
            upstreamEvidence: "no_locator",
            dependentEvidence: "exact_locator",
            supportingUnit,
          });
        await writer.appendEvidenceLink({
          ...fixture.evidenceLink,
          id: "evidence:authority:direct",
          assertionId: strongerDependent.id,
          contentUnitId: supportingUnit.id,
          locator: "section:not-the-bound-locator",
          locatorHash: candidateAnalysisEvidenceLocatorHash(
            "section:not-the-bound-locator",
          ),
          excerptHash: hash("5"),
        });

        await assert.rejects(
          writer.appendDependency(
            dependencyInput(strongerDependent, unresolvedUpstream),
          ),
          (error: unknown) =>
            hasCandidateWriteConflictCode(error, "upstream_authority_upgrade"),
        );
      });
    });
  },
);

test(
  "independent run-bound evidence permits identity-only strengthening",
  { timeout: 45_000 },
  async (t) => {
    await withCandidateAnalysisPostgres(t, async ({ adminUrl }) => {
      await withPrisma(adminUrl, async (prisma) => {
        const fixture = candidateAnalysisFixture({
          identityConfidence: "unresolved",
        });
        const supportingUnit = authorityContentUnit(fixture);
        const { writer, strongerDependent, unresolvedUpstream } =
          await seedAuthorityScenario(prisma, {
            upstreamIdentity: "unresolved",
            dependentIdentity: "exact",
            upstreamEvidence: "no_locator",
            dependentEvidence: "no_locator",
            supportingUnit,
          });
        await writer.appendEvidenceLink({
          ...fixture.evidenceLink,
          id: "evidence:authority:identity-only",
          assertionId: strongerDependent.id,
          contentUnitId: supportingUnit.id,
          locator: "section:identity-only-does-not-claim-locator-strength",
          locatorHash: candidateAnalysisEvidenceLocatorHash(
            "section:identity-only-does-not-claim-locator-strength",
          ),
        });

        assert.deepEqual(
          await writer.appendDependency(
            dependencyInput(strongerDependent, unresolvedUpstream),
          ),
          {
            dependencyId: `dependency:${strongerDependent.id}:${unresolvedUpstream.id}`,
          },
        );
      });
    });
  },
);

test(
  "independent run-bound exact locator permits evidence-only strengthening",
  { timeout: 45_000 },
  async (t) => {
    await withCandidateAnalysisPostgres(t, async ({ adminUrl }) => {
      await withPrisma(adminUrl, async (prisma) => {
        const fixture = candidateAnalysisFixture({
          identityConfidence: "unresolved",
        });
        const supportingUnit = authorityContentUnit(fixture, {
          identityConfidence: "unresolved",
        });
        const { writer, strongerDependent, unresolvedUpstream } =
          await seedAuthorityScenario(prisma, {
            upstreamIdentity: "unresolved",
            dependentIdentity: "unresolved",
            upstreamEvidence: "no_locator",
            dependentEvidence: "exact_locator",
            supportingUnit,
          });
        await writer.appendEvidenceLink({
          ...fixture.evidenceLink,
          id: "evidence:authority:evidence-only",
          assertionId: strongerDependent.id,
          contentUnitId: supportingUnit.id,
          locator: supportingUnit.locator,
          locatorHash: supportingUnit.locatorHash,
        });

        assert.deepEqual(
          await writer.appendDependency(
            dependencyInput(strongerDependent, unresolvedUpstream),
          ),
          {
            dependencyId: `dependency:${strongerDependent.id}:${unresolvedUpstream.id}`,
          },
        );
      });
    });
  },
);

test(
  "supporting evidence outside the dependent run input envelope is rejected",
  { timeout: 45_000 },
  async (t) => {
    await withCandidateAnalysisPostgres(t, async ({ adminUrl }) => {
      await withPrisma(adminUrl, async (prisma) => {
        const fixture = candidateAnalysisFixture({
          identityConfidence: "unresolved",
        });
        const supportingUnit = authorityContentUnit(fixture, {
          identityConfidence: "unresolved",
        });
        const { writer, strongerDependent } =
          await seedAuthorityScenario(prisma, {
            upstreamIdentity: "unresolved",
            dependentIdentity: "unresolved",
            upstreamEvidence: "no_locator",
            dependentEvidence: "exact_locator",
            supportingUnit,
            supportingInputHash: null,
          });
        await assert.rejects(
          writer.appendEvidenceLink({
            ...fixture.evidenceLink,
            id: "evidence:authority:outside-input-envelope",
            assertionId: strongerDependent.id,
            contentUnitId: supportingUnit.id,
            locator: supportingUnit.locator,
            locatorHash: supportingUnit.locatorHash,
          }),
          (error: unknown) =>
            hasCandidateWriteConflictCode(error, "integrity_mismatch"),
        );
      });
    });
  },
);

test(
  "run input hash mismatch is rejected before it can justify an identity upgrade",
  { timeout: 45_000 },
  async (t) => {
    await withCandidateAnalysisPostgres(t, async ({ adminUrl }) => {
      await withPrisma(adminUrl, async (prisma) => {
        const fixture = candidateAnalysisFixture({
          identityConfidence: "unresolved",
        });
        const supportingUnit = authorityContentUnit(fixture);
        await assert.rejects(
          seedAuthorityScenario(prisma, {
            dependentIdentity: "exact",
            dependentEvidence: "no_locator",
            supportingUnit,
            supportingInputHash: hash("f"),
          }),
          (error: unknown) =>
            hasCandidateWriteConflictCode(error, "integrity_mismatch"),
        );
      });
    });
  },
);

test(
  "machine use cannot become more permissive and inherited limitations are mandatory",
  { timeout: 45_000 },
  async (t) => {
    await withCandidateAnalysisPostgres(t, async ({ adminUrl }) => {
      await withPrisma(adminUrl, async (prisma) => {
        const fixture = candidateAnalysisFixture();
        await seedContentUnit(prisma, fixture.contentUnit);
        const writer = createCandidateAnalysisWriter(prisma);
        await writer.createRun(fixture.run);
        const quarantinedUpstream = assertionWith(fixture.assertion, {
          id: "assertion:machine-use:upstream",
          payload: propositionData("Quarantined upstream"),
          payloadHash: hash("8"),
          machineUse: "quarantined",
          limitations: ["do_not_reuse", "machine_generated"].sort(),
        });
        const dependent = assertionWith(fixture.assertion, {
          id: "assertion:machine-use:dependent",
          payload: propositionData("Candidate-only dependent"),
          payloadHash: hash("9"),
          machineUse: "candidate_only",
          limitations: ["do_not_reuse", "machine_generated"].sort(),
        });
        const sameAuthorityDependent = assertionWith(fixture.assertion, {
          id: "assertion:machine-use:same-authority",
          payload: propositionData("Quarantined dependent"),
          payloadHash: hash("0"),
          machineUse: "quarantined",
          limitations: ["do_not_reuse", "machine_generated"].sort(),
        });
        await writer.appendAssertion(quarantinedUpstream);
        await writer.appendAssertion(dependent);
        await writer.appendAssertion(sameAuthorityDependent);
        await assert.rejects(
          writer.appendDependency(
            dependencyInput(dependent, quarantinedUpstream, {
              inheritedLimitations: ["do_not_reuse", "machine_generated"],
            }),
          ),
          (error: unknown) =>
            hasCandidateWriteConflictCode(error, "upstream_authority_upgrade"),
        );
        await assert.rejects(
          writer.appendDependency(
            dependencyInput(sameAuthorityDependent, quarantinedUpstream, {
              inheritedLimitations: [],
            }),
          ),
          (error: unknown) =>
            hasCandidateWriteConflictCode(error, "upstream_authority_upgrade"),
        );
      });
    });
  },
);

test(
  "reconciler exposes only appendSnapshot and duplicate history is immutable",
  { timeout: 45_000 },
  async (t) => {
    await withCandidateAnalysisPostgres(t, async ({ adminUrl }) => {
      await withPrisma(adminUrl, async (prisma) => {
        const fixture = candidateAnalysisFixture();
        await seedContentUnit(prisma, fixture.contentUnit);
        const writer = createCandidateAnalysisWriter(prisma);
        await writer.createRun(fixture.run);
        const reconciler = createCandidateReconciliationWriter(prisma);
        assert.deepEqual(Object.keys(reconciler), ["appendSnapshot"]);
        const snapshot = {
          id: "snapshot:fixture:1",
          runId: fixture.run.id,
          scope: { assertionIds: [fixture.assertion.id] },
          scopeHash: candidateAnalysisReconciliationScopeHash({
            assertionIds: [fixture.assertion.id],
          }),
          payload: {
            namespace: "candidate" as const,
            kind: "reconciliation" as const,
            data: noContradictionsData(),
          },
          payloadHash: candidateAnalysisReconciliationPayloadHash({
            namespace: "candidate",
            kind: "reconciliation",
            data: noContradictionsData(),
          }),
          conflictCount: 0,
        };
        assert.deepEqual(await reconciler.appendSnapshot(snapshot), {
          snapshotId: snapshot.id,
        });
        await assert.rejects(
          reconciler.appendSnapshot(snapshot),
          (error: unknown) =>
            hasCandidateWriteConflictCode(error, "immutable_history_conflict"),
        );
      });
    });
  },
);

test(
  "run creation atomically includes exactly one queued event",
  { timeout: 45_000 },
  async (t) => {
    await withCandidateAnalysisPostgres(t, async ({ adminUrl }) => {
      await withPrisma(adminUrl, async (prisma) => {
        const fixture = candidateAnalysisFixture();
        await seedContentUnit(prisma, fixture.contentUnit);
        const writer = createCandidateAnalysisWriter(prisma);

        await writer.createRun(fixture.run);

        const events = await prisma.candidateAnalysisRunEvent.findMany({
          where: { runId: fixture.run.id },
          orderBy: { sequence: "asc" },
        });
        assert.equal(events.length, 1);
        assert.equal(events[0]?.eventType, "queued");
        assert.equal(events[0]?.sequence, 1);
      });
    });
  },
);

test(
  "run input envelope is derived from unique contiguous stored content hashes",
  { timeout: 45_000 },
  async (t) => {
    await withCandidateAnalysisPostgres(t, async ({ adminUrl }) => {
      await withPrisma(adminUrl, async (prisma) => {
        const fixture = candidateAnalysisFixture();
        const second = authorityContentUnit(fixture);
        await seedContentUnit(prisma, fixture.contentUnit);
        await seedContentUnit(prisma, second);
        const writer = createCandidateAnalysisWriter(prisma);

        await assert.rejects(
          writer.createRun({
            ...fixture.run,
            inputs: [
              { ...fixture.run.inputs[0]!, position: 1 },
              {
                contentUnitId: second.id,
                position: 0,
                inputHash: hash("f"),
              },
            ],
          }),
          (error: unknown) => hasWriteCode(error, "integrity_mismatch"),
        );
        assert.equal(await prisma.candidateAnalysisRun.count(), 0);
        assert.equal(await prisma.candidateAnalysisRunEvent.count(), 0);
      });
    });
  },
);

test(
  "writer rejects altered artifact and assertion bytes behind caller supplied payload hashes",
  { timeout: 45_000 },
  async (t) => {
    await withCandidateAnalysisPostgres(t, async ({ adminUrl }) => {
      await withPrisma(adminUrl, async (prisma) => {
        const fixture = candidateAnalysisFixture();
        await seedContentUnit(prisma, fixture.contentUnit);
        const writer = createCandidateAnalysisWriter(prisma);
        await writer.createRun(fixture.run);

        await assert.rejects(
          writer.appendArtifact({
            ...fixture.artifact,
            payload: {
              namespace: "candidate",
              kind: "artifact",
              data: summaryData("Mutated bytes with the old hash."),
            },
          }),
          (error: unknown) => hasWriteCode(error, "integrity_mismatch"),
        );
        await assert.rejects(
          writer.appendAssertion({
            ...fixture.assertion,
            payload: {
              namespace: "candidate",
              kind: "assertion",
              data: propositionData("Mutated assertion with the old hash."),
            },
          }),
          (error: unknown) => hasWriteCode(error, "integrity_mismatch"),
        );
        assert.equal(await prisma.candidateAnalysisArtifact.count(), 0);
        assert.equal(await prisma.candidateAssertion.count(), 0);
      });
    });
  },
);

test(
  "writer recomputes run-event hashes before persistence",
  { timeout: 45_000 },
  async (t) => {
    await withCandidateAnalysisPostgres(t, async ({ adminUrl }) => {
      await withPrisma(adminUrl, async (prisma) => {
        const fixture = candidateAnalysisFixture();
        await seedContentUnit(prisma, fixture.contentUnit);
        const writer = createCandidateAnalysisWriter(prisma);
        await writer.createRun(fixture.run);
        await assert.rejects(
          writer.appendRunEvent({
            ...fixture.events.started,
            eventHash: hash("f"),
          }),
          (error: unknown) => hasWriteCode(error, "integrity_mismatch"),
        );
        assert.equal(await prisma.candidateAnalysisRunEvent.count(), 1);
      });
    });
  },
);

test(
  "reconciler recomputes payload and scope hashes before persistence",
  { timeout: 45_000 },
  async (t) => {
    await withCandidateAnalysisPostgres(t, async ({ adminUrl }) => {
      await withPrisma(adminUrl, async (prisma) => {
        const fixture = candidateAnalysisFixture();
        await seedContentUnit(prisma, fixture.contentUnit);
        const writer = createCandidateAnalysisWriter(prisma);
        await writer.createRun(fixture.run);
        const reconciler = createCandidateReconciliationWriter(prisma);

        await assert.rejects(
          reconciler.appendSnapshot({
            id: "snapshot:hash-mismatch",
            runId: fixture.run.id,
            scope: { assertionIds: [fixture.assertion.id] },
            scopeHash: hash("1"),
            payload: {
              namespace: "candidate",
              kind: "reconciliation",
              data: {
                entries: [
                  {
                    role: "scope_reference",
                    valueType: "reference",
                    targetType: "assertion",
                    targetId: fixture.assertion.id,
                  },
                ],
              },
            },
            payloadHash: hash("2"),
            conflictCount: 0,
          }),
          (error: unknown) => hasWriteCode(error, "integrity_mismatch"),
        );
        assert.equal(await prisma.candidateReconciliationSnapshot.count(), 0);
      });
    });
  },
);

test(
  "terminal sealing requires the complete stored evidence and identity manifest",
  { timeout: 45_000 },
  async (t) => {
    await withCandidateAnalysisPostgres(t, async ({ adminUrl }) => {
      await withPrisma(adminUrl, async (prisma) => {
        const fixture = candidateAnalysisFixture();
        await seedContentUnit(prisma, fixture.contentUnit);
        const writer = createCandidateAnalysisWriter(prisma);
        await writer.createRun(fixture.run);
        await writer.appendRunEvent(fixture.events.started);
        await writer.appendArtifact(fixture.artifact);
        await writer.appendAssertion(fixture.assertion);

        await assert.rejects(
          writer.appendRunEvent(
            eventWith(fixture.events.completed, {
              sequence: 3,
              eventHash: hash("c"),
            }),
          ),
          (error: unknown) =>
            hasWriteCode(error, "terminal_output_integrity"),
        );
        assert.equal(await prisma.candidateAnalysisRunEvent.count(), 2);
      });
    });
  },
);

test(
  "terminal sealing includes dependency and reconciliation rows in the exact manifest",
  { timeout: 45_000 },
  async (t) => {
    await withCandidateAnalysisPostgres(t, async ({ adminUrl }) => {
      await withPrisma(adminUrl, async (prisma) => {
        const fixture = candidateAnalysisFixture();
        await seedContentUnit(prisma, fixture.contentUnit);
        const writer = createCandidateAnalysisWriter(prisma);
        const reconciler = createCandidateReconciliationWriter(prisma);
        await writer.createRun(fixture.run);
        await writer.appendRunEvent(fixture.events.started);
        await writer.appendArtifact(fixture.artifact);
        await writer.appendAssertion(fixture.assertion);
        await writer.appendEvidenceLink(fixture.evidenceLink);

        const upstream = assertionWith(fixture.assertion, {
          id: "assertion:manifest:upstream",
          payload: propositionData("Upstream manifest assertion"),
          evidenceLevel: "no_locator",
          scopeKey: "claim:manifest:upstream",
        });
        await writer.appendAssertion(upstream);
        const dependency = dependencyInput(fixture.assertion, upstream, {
          id: "dependency:manifest:1",
        });
        await writer.appendDependency(dependency);
        const reconciliation = {
          id: "snapshot:manifest:1",
          runId: fixture.run.id,
          scope: { assertionIds: [fixture.assertion.id, upstream.id] },
          scopeHash: candidateAnalysisReconciliationScopeHash({
            assertionIds: [fixture.assertion.id, upstream.id],
          }),
          payload: {
            namespace: "candidate" as const,
            kind: "reconciliation" as const,
            data: noContradictionsData(),
          },
          payloadHash: candidateAnalysisReconciliationPayloadHash({
            namespace: "candidate",
            kind: "reconciliation",
            data: noContradictionsData(),
          }),
          conflictCount: 0,
        };
        await reconciler.appendSnapshot(reconciliation);

        await assert.rejects(
          writer.appendRunEvent(
            eventWith(fixture.events.completed, { sequence: 3 }),
          ),
          (error: unknown) => hasWriteCode(error, "terminal_output_integrity"),
        );

        const baseManifest = (
          fixture.events.completed.payload as {
            data: { manifest: CandidateOutputManifest };
          }
        ).data.manifest;
        const manifest: CandidateOutputManifest = {
          ...baseManifest,
          assertions: [
            ...baseManifest.assertions,
            {
              id: upstream.id,
              assertionType: upstream.assertionType,
              schemaVersion: upstream.schemaVersion,
              payloadHash: upstream.payloadHash,
              confidence: upstream.confidence,
              machineUse: upstream.machineUse,
              identityConfidence: upstream.identityConfidence,
              evidenceLevel: upstream.evidenceLevel,
              limitations: upstream.limitations,
              scopeKey: upstream.scopeKey,
              scopeHash: upstream.scopeHash,
              supersededAssertionId: upstream.supersededAssertionId,
              supersededAssertionPayloadHash:
                upstream.supersededAssertionPayloadHash,
            },
          ].sort((left, right) => left.id.localeCompare(right.id)),
          dependencies: [dependency],
          reconciliationSnapshots: [
            {
              id: reconciliation.id,
              scopeHash: reconciliation.scopeHash,
              payloadHash: reconciliation.payloadHash,
              conflictCount: reconciliation.conflictCount,
            },
          ],
        };
        const terminal = eventWith(fixture.events.completed, {
          sequence: 3,
          payload: {
            namespace: "candidate",
            kind: "run_terminal",
            data: {
              manifest,
              manifestHash: candidateAnalysisOutputManifestHash(manifest),
            },
          },
        });
        assert.equal((await writer.appendRunEvent(terminal)).state,
          "candidate_complete");
      });
    });
  },
);

test(
  "every output append API rejects writes after a terminal event",
  { timeout: 45_000 },
  async (t) => {
    await withCandidateAnalysisPostgres(t, async ({ adminUrl }) => {
      await withPrisma(adminUrl, async (prisma) => {
        const fixture = candidateAnalysisFixture();
        await seedContentUnit(prisma, fixture.contentUnit);
        const writer = createCandidateAnalysisWriter(prisma);
        const reconciler = createCandidateReconciliationWriter(prisma);
        await writer.createRun(fixture.run);
        await writer.appendRunEvent(fixture.events.started);
        await writer.appendArtifact(fixture.artifact);
        await writer.appendAssertion(fixture.assertion);
        await writer.appendEvidenceLink(fixture.evidenceLink);
        await writer.appendRunEvent(
          eventWith(fixture.events.completed, {
            sequence: 3,
            eventHash: hash("c"),
          }),
        );

        const lateAssertion = assertionWith(fixture.assertion, {
          id: "assertion:late:1",
          payload: {
            namespace: "candidate",
            kind: "assertion",
            data: propositionData("Late assertion"),
          },
          payloadHash: hash("d"),
        });
        const calls = [
          () =>
            writer.appendArtifact({
              ...fixture.artifact,
              id: "artifact:late:1",
              payload: {
                namespace: "candidate",
                kind: "artifact",
                data: summaryData("Late artifact"),
              },
              payloadHash: candidateAnalysisArtifactPayloadHash({
                namespace: "candidate",
                kind: "artifact",
                data: summaryData("Late artifact"),
              }),
            }),
          () => writer.appendAssertion(lateAssertion),
          () =>
            writer.appendEvidenceLink({
              ...fixture.evidenceLink,
              id: "evidence:late:1",
              locator: "section:late",
              locatorHash: candidateAnalysisEvidenceLocatorHash("section:late"),
            }),
          () =>
            writer.appendDependency({
              id: "dependency:late:1",
              assertionId: fixture.assertion.id,
              upstreamAssertionId: fixture.assertion.id,
              relation: "derived_from",
              inheritedLimitations: [...fixture.assertion.limitations].sort(),
            }),
          () =>
            reconciler.appendSnapshot({
              id: "snapshot:late:1",
              runId: fixture.run.id,
              scope: { assertionIds: [fixture.assertion.id] },
              scopeHash: candidateAnalysisReconciliationScopeHash({
                assertionIds: [fixture.assertion.id],
              }),
              payload: {
                namespace: "candidate",
                kind: "reconciliation",
                data: noContradictionsData(),
              },
              payloadHash: candidateAnalysisReconciliationPayloadHash({
                namespace: "candidate",
                kind: "reconciliation",
                data: noContradictionsData(),
              }),
              conflictCount: 0,
            }),
        ];

        for (const call of calls) {
          await assert.rejects(
            call,
            (error: unknown) => hasWriteCode(error, "run_terminal"),
          );
        }
      });
    });
  },
);

test(
  "writer stores run and event scope and requires complete prior event identity for supersession",
  { timeout: 45_000 },
  async (t) => {
    for (const eventType of [
      "candidate_completed",
      "partial_completed",
    ] as const) {
      await withCandidateAnalysisPostgres(t, async ({ adminUrl }) => {
        await withPrisma(adminUrl, async (prisma) => {
          const fixture = candidateAnalysisFixture();
          await seedContentUnit(prisma, fixture.contentUnit);
          const writer = createCandidateAnalysisWriter(prisma);
          await writer.createRun(fixture.run);
          const storedRun = await prisma.candidateAnalysisRun.findUniqueOrThrow({
            where: { id: fixture.run.id },
            select: { scopeHash: true },
          });
          const storedQueued = await prisma.candidateAnalysisRunEvent.findUniqueOrThrow({
            where: { id: fixture.events.queued.id },
            select: { scopeHash: true, supersededEventScopeHash: true },
          });
          assert.equal(
            storedRun.scopeHash,
            candidateAnalysisRunScopeHash(fixture.run.id),
          );
          assert.deepEqual(storedQueued, {
            scopeHash: storedRun.scopeHash,
            supersededEventScopeHash: null,
          });
          await writer.appendRunEvent(fixture.events.started);
          await writer.appendArtifact(fixture.artifact);
          await writer.appendAssertion(fixture.assertion);
          await writer.appendEvidenceLink(fixture.evidenceLink);

          const terminal = eventWith(fixture.events.completed, {
            id: `event:${eventType}:terminal`,
            sequence: 3,
            eventType,
          });
          assert.equal((await writer.appendRunEvent(terminal)).state,
            eventType === "candidate_completed" ? "candidate_complete" : "partial");

          const supersession = eventWith(terminal, {
            id: `event:${eventType}:superseded`,
            sequence: 4,
            eventType: "superseded",
            payload: {
              namespace: "candidate",
              kind: "run_supersession",
              data: { reason: "replacement run" },
            },
            supersededEventId: terminal.id,
            supersededEventHash: terminal.eventHash,
            supersededEventScopeHash: terminal.scopeHash,
          });
          const wrongPrior = eventWith(supersession, {
            supersededEventHash: hash("f"),
          });
          await assert.rejects(
            writer.appendRunEvent(wrongPrior),
            (error: unknown) => hasWriteCode(error, "supersession_conflict"),
          );
          const wrongPriorScope = eventWith(supersession, {
            supersededEventScopeHash: hash("e"),
          });
          await assert.rejects(
            writer.appendRunEvent(wrongPriorScope),
            (error: unknown) => hasWriteCode(error, "supersession_conflict"),
          );
          assert.equal(await prisma.candidateAnalysisRunEvent.count(), 3);
          assert.equal((await writer.appendRunEvent(supersession)).state, "superseded");
          const storedSupersession =
            await prisma.candidateAnalysisRunEvent.findUniqueOrThrow({
              where: { id: supersession.id },
              select: {
                runId: true,
                scopeHash: true,
                supersededEventId: true,
                supersededEventHash: true,
                supersededEventScopeHash: true,
              },
            });
          assert.deepEqual(storedSupersession, {
            runId: fixture.run.id,
            scopeHash: fixture.run.scopeHash,
            supersededEventId: terminal.id,
            supersededEventHash: terminal.eventHash,
            supersededEventScopeHash: terminal.scopeHash,
          });
        });
      });
    }
  },
);

test(
  "assertion self-supersession is rejected by the public writer",
  { timeout: 45_000 },
  async (t) => {
    await withCandidateAnalysisPostgres(t, async ({ adminUrl }) => {
      await withPrisma(adminUrl, async (prisma) => {
        const fixture = candidateAnalysisFixture();
        await seedContentUnit(prisma, fixture.contentUnit);
        const writer = createCandidateAnalysisWriter(prisma);
        await writer.createRun(fixture.run);

        await assert.rejects(
          writer.appendAssertion({
            ...fixture.assertion,
            supersededAssertionId: fixture.assertion.id,
          }),
          (error: unknown) => hasWriteCode(error, "supersession_conflict"),
        );
        assert.equal(await prisma.candidateAssertion.count(), 0);
      });
    });
  },
);

test(
  "workflow bundle rejects an in-repository symlink targeting an external file",
  async () => {
    const repository = writeBindingRepository(
      VALID_WORKFLOW_BINDING_TEXT,
      VALID_PROMPT_BINDING_TEXT,
    );
    const externalRoot = mkdtempSync(join(tmpdir(), "candidate-binding-external-"));
    const externalWorkflowPath = join(externalRoot, "candidate-analysis-v1.md");
    writeFileSync(externalWorkflowPath, repository.workflowBytes);
    rmSync(repository.workflowPath);
    symlinkSync(externalWorkflowPath, repository.workflowPath);

    try {
      const noDatabaseAccess = new Proxy(
        {},
        {
          get() {
            throw new Error("unexpected database access");
          },
        },
      ) as InstanceType<typeof PrismaClient>;
      const writer = writerWithReadSeam(noDatabaseAccess, {
        repositoryRoot: repository.repositoryRoot,
      });
      const fixture = candidateAnalysisFixture();

      await assert.rejects(
        writer.createRun(
          runBoundToBytes(
            fixture.run,
            repository.workflowBytes,
            repository.promptBytes,
          ),
        ),
        (error: unknown) => hasWriteCode(error, "workflow_binding_mismatch"),
      );
    } finally {
      rmSync(repository.repositoryRoot, { recursive: true, force: true });
      rmSync(externalRoot, { recursive: true, force: true });
    }
  },
);

test(
  "workflow and prompt reject conflicting duplicate metadata markers",
  async () => {
    for (const candidate of [
      {
        workflowText: `${VALID_WORKFLOW_BINDING_TEXT}\nPrompt template ID: \`prompt.detached.v1\`\n`,
        promptText: VALID_PROMPT_BINDING_TEXT,
        conflict: "workflow_binding_mismatch",
      },
      {
        workflowText: VALID_WORKFLOW_BINDING_TEXT,
        promptText: `${VALID_PROMPT_BINDING_TEXT}\nWorkflow ID: \`workflow.detached.v1\`\n`,
        conflict: "prompt_binding_mismatch",
      },
    ] as const) {
      const repository = writeBindingRepository(
        candidate.workflowText,
        candidate.promptText,
      );
      try {
        const noDatabaseAccess = new Proxy(
          {},
          {
            get() {
              throw new Error("unexpected database access");
            },
          },
        ) as InstanceType<typeof PrismaClient>;
        const writer = writerWithReadSeam(noDatabaseAccess, {
          repositoryRoot: repository.repositoryRoot,
        });
        const fixture = candidateAnalysisFixture();

        await assert.rejects(
          writer.createRun(
            runBoundToBytes(
              fixture.run,
              repository.workflowBytes,
              repository.promptBytes,
            ),
          ),
          (error: unknown) => hasWriteCode(error, candidate.conflict),
        );
      } finally {
        rmSync(repository.repositoryRoot, { recursive: true, force: true });
      }
    }
  },
);

test(
  "workflow rejects a detached prompt ID version or repository path",
  async () => {
    for (const workflowText of [
      VALID_WORKFLOW_BINDING_TEXT.replace(
        "Prompt template ID: `prompt.candidate_analysis.v1`",
        "Prompt template ID: `prompt.detached.v1`",
      ),
      VALID_WORKFLOW_BINDING_TEXT.replace(
        "Prompt template version: `1.0.0`",
        "Prompt template version: `1.0.1`",
      ),
      VALID_WORKFLOW_BINDING_TEXT.replace(
        CANDIDATE_PROMPT_BINDING.path,
        "knowledge/corpus/workflows/detached-prompt-v1.md",
      ),
    ]) {
      const repository = writeBindingRepository(
        workflowText,
        VALID_PROMPT_BINDING_TEXT,
      );
      try {
        const noDatabaseAccess = new Proxy(
          {},
          {
            get() {
              throw new Error("unexpected database access");
            },
          },
        ) as InstanceType<typeof PrismaClient>;
        const writer = writerWithReadSeam(noDatabaseAccess, {
          repositoryRoot: repository.repositoryRoot,
        });
        const fixture = candidateAnalysisFixture();
        await assert.rejects(
          writer.createRun(
            runBoundToBytes(
              fixture.run,
              repository.workflowBytes,
              repository.promptBytes,
            ),
          ),
          (error: unknown) => hasWriteCode(error, "workflow_binding_mismatch"),
        );
      } finally {
        rmSync(repository.repositoryRoot, { recursive: true, force: true });
      }
    }
  },
);

test(
  "prompt rejects a detached workflow ID version or repository path",
  async () => {
    for (const promptText of [
      VALID_PROMPT_BINDING_TEXT.replace(
        "Workflow ID: `workflow.candidate_analysis.v1`",
        "Workflow ID: `workflow.detached.v1`",
      ),
      VALID_PROMPT_BINDING_TEXT.replace(
        "Workflow version: `1.0.0`",
        "Workflow version: `1.0.1`",
      ),
      VALID_PROMPT_BINDING_TEXT.replace(
        CANDIDATE_WORKFLOW_BINDING.path,
        "knowledge/corpus/workflows/detached-workflow-v1.md",
      ),
    ]) {
      const repository = writeBindingRepository(
        VALID_WORKFLOW_BINDING_TEXT,
        promptText,
      );
      try {
        const noDatabaseAccess = new Proxy(
          {},
          {
            get() {
              throw new Error("unexpected database access");
            },
          },
        ) as InstanceType<typeof PrismaClient>;
        const writer = writerWithReadSeam(noDatabaseAccess, {
          repositoryRoot: repository.repositoryRoot,
        });
        const fixture = candidateAnalysisFixture();
        await assert.rejects(
          writer.createRun(
            runBoundToBytes(
              fixture.run,
              repository.workflowBytes,
              repository.promptBytes,
            ),
          ),
          (error: unknown) => hasWriteCode(error, "prompt_binding_mismatch"),
        );
      } finally {
        rmSync(repository.repositoryRoot, { recursive: true, force: true });
      }
    }
  },
);

test(
  "workflow and prompt binding rejects a recomputed hash after cross-reference removal",
  async () => {
    const workflowText = VALID_WORKFLOW_BINDING_TEXT.replace(
      "Prompt template ID: `prompt.candidate_analysis.v1`\n",
      "",
    );
    const repository = writeBindingRepository(
      workflowText,
      VALID_PROMPT_BINDING_TEXT,
    );
    try {
      const noDatabaseAccess = new Proxy(
        {},
        {
          get() {
            throw new Error("unexpected database access");
          },
        },
      ) as InstanceType<typeof PrismaClient>;
      const writer = writerWithReadSeam(noDatabaseAccess, {
        repositoryRoot: repository.repositoryRoot,
      });
      const fixture = candidateAnalysisFixture();
      await assert.rejects(
        writer.createRun(
          runBoundToBytes(
            fixture.run,
            repository.workflowBytes,
            repository.promptBytes,
          ),
        ),
        (error: unknown) => hasWriteCode(error, "workflow_binding_mismatch"),
      );
    } finally {
      rmSync(repository.repositoryRoot, { recursive: true, force: true });
    }
  },
);

test("single read workflow prompt bundle uses the same bytes for validation and hashing", async () => {
  const repository = writeBindingRepository(
    VALID_WORKFLOW_BINDING_TEXT,
    VALID_PROMPT_BINDING_TEXT,
  );
  try {
    const fixture = candidateAnalysisFixture();
    const transaction = {
      candidateContentUnit: {
        findMany: async () =>
          fixture.run.inputs.map(({ contentUnitId }) => ({
            id: contentUnitId,
            contentHash: fixture.contentUnit.contentHash,
          })),
      },
      candidateAnalysisRun: { create: async () => undefined },
    };
    const prisma = {
      $transaction: async (callback: (value: typeof transaction) => unknown) =>
        callback(transaction),
    } as unknown as InstanceType<typeof PrismaClient>;
    const readCounts = new Map<string, number>();
    const workflowReadPath = realpathSync(repository.workflowPath);
    const promptReadPath = realpathSync(repository.promptPath);
    const validBytes = new Map([
      [workflowReadPath, repository.workflowBytes],
      [promptReadPath, repository.promptBytes],
    ]);
    const readFile = (path: string) => {
      const count = (readCounts.get(path) ?? 0) + 1;
      readCounts.set(path, count);
      const bytes = validBytes.get(path);
      if (bytes === undefined) throw new Error("unexpected path");
      return count === 1 ? bytes : Buffer.from("changed bytes");
    };
    const writer = writerWithReadSeam(prisma, {
      repositoryRoot: repository.repositoryRoot,
      readFile,
    });

    await writer.createRun(
      runBoundToBytes(
        fixture.run,
        repository.workflowBytes,
        repository.promptBytes,
      ),
    );

    assert.equal(readCounts.get(workflowReadPath), 1);
    assert.equal(readCounts.get(promptReadPath), 1);
  } finally {
    rmSync(repository.repositoryRoot, { recursive: true, force: true });
  }
});

test(
  "writer rejects independent workflow and prompt byte or declared hash drift",
  { timeout: 45_000 },
  async (t) => {
    await withCandidateAnalysisPostgres(t, async ({ adminUrl }) => {
      await withPrisma(adminUrl, async (prisma) => {
        const repositoryRoot = mkdtempSync(join(tmpdir(), "candidate-binding-"));
        const workflowTarget = join(
          repositoryRoot,
          CANDIDATE_WORKFLOW_BINDING.path,
        );
        const promptTarget = join(repositoryRoot, CANDIDATE_PROMPT_BINDING.path);
        mkdirSync(dirname(workflowTarget), { recursive: true });
        writeFileSync(
          workflowTarget,
          readFileSync(CANDIDATE_WORKFLOW_BINDING.path),
        );
        writeFileSync(promptTarget, readFileSync(CANDIDATE_PROMPT_BINDING.path));

        try {
          const createWithRepository = createCandidateAnalysisWriter as unknown as (
            client: ReturnType<typeof candidatePrisma>,
            options: { repositoryRoot: string },
          ) => CandidateAnalysisWriter;
          const writer = createWithRepository(prisma, { repositoryRoot });

          const byteDrift = candidateAnalysisFixture({ runId: "run:binding:bytes" });
          await seedContentUnit(prisma, byteDrift.contentUnit);
          writeFileSync(
            workflowTarget,
            `${readFileSync(workflowTarget, "utf8")}\nmutated workflow bytes\n`,
          );
          await assert.rejects(
            writer.createRun(byteDrift.run),
            (error: unknown) => hasWriteCode(error, "workflow_binding_mismatch"),
          );

          writeFileSync(
            workflowTarget,
            readFileSync(CANDIDATE_WORKFLOW_BINDING.path),
          );
          const promptDrift = candidateAnalysisFixture({
            runId: "run:binding:prompt-bytes",
          });
          writeFileSync(
            promptTarget,
            `${readFileSync(promptTarget, "utf8")}\nmutated prompt bytes\n`,
          );
          await assert.rejects(
            writer.createRun(promptDrift.run),
            (error: unknown) => hasWriteCode(error, "prompt_binding_mismatch"),
          );

          writeFileSync(promptTarget, readFileSync(CANDIDATE_PROMPT_BINDING.path));
          const workflowHashDrift = candidateAnalysisFixture({
            runId: "run:binding:workflow-hash",
          });
          await assert.rejects(
            writer.createRun(
              resealRun(workflowHashDrift.run, {
                workflowHash: hash("f"),
              }),
            ),
            (error: unknown) => hasWriteCode(error, "workflow_binding_mismatch"),
          );

          const promptHashDrift = candidateAnalysisFixture({
            runId: "run:binding:prompt-hash",
          });
          await assert.rejects(
            writer.createRun(
              resealRun(promptHashDrift.run, { promptHash: hash("e") }),
            ),
            (error: unknown) => hasWriteCode(error, "prompt_binding_mismatch"),
          );
          assert.equal(await prisma.candidateAnalysisRun.count(), 0);
        } finally {
          rmSync(repositoryRoot, { recursive: true, force: true });
        }
      });
    });
  },
);

test("writer objects expose only the bounded append APIs", () => {
  const noDatabaseAccess = new Proxy(
    {},
    {
      get() {
        throw new Error("unexpected database access");
      },
    },
  ) as InstanceType<typeof PrismaClient>;
  assert.deepEqual(Object.keys(createCandidateAnalysisWriter(noDatabaseAccess)), [
    "createRun",
    "appendRunEvent",
    "appendArtifact",
    "appendAssertion",
    "appendEvidenceLink",
    "appendDependency",
  ]);
  assert.deepEqual(
    Object.keys(createCandidateReconciliationWriter(noDatabaseAccess)),
    ["appendSnapshot"],
  );
});

test("every public method strictly parses before database access", async () => {
  let databaseAccessed = false;
  const noDatabaseAccess = new Proxy(
    {},
    {
      get() {
        databaseAccessed = true;
        throw new Error("unexpected database access");
      },
    },
  ) as InstanceType<typeof PrismaClient>;
  const writer = createCandidateAnalysisWriter(noDatabaseAccess);
  const reconciler = createCandidateReconciliationWriter(noDatabaseAccess);
  const invalid = { id: "UPPERCASE IS NOT A VALID IDENTIFIER" };
  const calls = [
    () => writer.createRun(invalid as never),
    () => writer.appendRunEvent(invalid as never),
    () => writer.appendArtifact(invalid as never),
    () => writer.appendAssertion(invalid as never),
    () => writer.appendEvidenceLink(invalid as never),
    () => writer.appendDependency(invalid as never),
    () => reconciler.appendSnapshot(invalid as never),
  ];

  for (const call of calls) {
    await assert.rejects(call, (error: unknown) => {
      return error instanceof Error && error.name === "ZodError";
    });
  }
  assert.equal(databaseAccessed, false);
});
