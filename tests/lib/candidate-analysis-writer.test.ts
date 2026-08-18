import assert from "node:assert/strict";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../../src/generated/prisma/client";
import type {
  CandidateAnalysisRunEventInput,
  CandidateAssertionInput,
  CandidateContentUnitInput,
  CandidateDependencyInput,
  CandidateEvidenceLevel,
  CandidateIdentityConfidence,
  CandidateAnalysisRunInput,
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

async function seedTwoAssertions(prisma: ReturnType<typeof candidatePrisma>) {
  const fixture = candidateAnalysisFixture();
  await seedContentUnit(prisma, fixture.contentUnit);
  const writer = createCandidateAnalysisWriter(prisma);
  await writer.createRun(fixture.run);
  const assertionA = assertionWith(fixture.assertion, {
    id: "assertion:cycle:a",
    payload: { proposition: "Assertion A" },
    payloadHash: hash("1"),
  });
  const assertionB = assertionWith(fixture.assertion, {
    id: "assertion:cycle:b",
    payload: { proposition: "Assertion B" },
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
    payload: { proposition: "Unresolved upstream" },
    payloadHash: hash("3"),
    identityConfidence: options.upstreamIdentity ?? "unresolved",
    evidenceLevel: options.upstreamEvidence ?? "no_locator",
    limitations: ["identity_unresolved"],
  });
  const strongerDependent = assertionWith(fixture.assertion, {
    id: "assertion:authority:dependent",
    payload: { proposition: "Stronger dependent" },
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
          payload: { proposition: "Assertion C" },
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
          payload: { proposition: "Quarantined upstream" },
          payloadHash: hash("8"),
          machineUse: "quarantined",
          limitations: ["do_not_reuse", "machine_generated"].sort(),
        });
        const dependent = assertionWith(fixture.assertion, {
          id: "assertion:machine-use:dependent",
          payload: { proposition: "Candidate-only dependent" },
          payloadHash: hash("9"),
          machineUse: "candidate_only",
          limitations: ["do_not_reuse", "machine_generated"].sort(),
        });
        const sameAuthorityDependent = assertionWith(fixture.assertion, {
          id: "assertion:machine-use:same-authority",
          payload: { proposition: "Quarantined dependent" },
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
            data: { conflicts: [] },
          },
          payloadHash: candidateAnalysisReconciliationPayloadHash({
            namespace: "candidate",
            kind: "reconciliation",
            data: { conflicts: [] },
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
              data: { summary: "Mutated bytes with the old hash." },
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
              data: { proposition: "Mutated assertion with the old hash." },
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
              data: { scope: { assertionIds: [fixture.assertion.id] } },
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
          payload: { proposition: "Upstream manifest assertion" },
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
            data: { conflicts: [] },
          },
          payloadHash: candidateAnalysisReconciliationPayloadHash({
            namespace: "candidate",
            kind: "reconciliation",
            data: { conflicts: [] },
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
            data: { proposition: "Late assertion" },
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
                data: { summary: "Late artifact" },
              },
              payloadHash: candidateAnalysisArtifactPayloadHash({
                namespace: "candidate",
                kind: "artifact",
                data: { summary: "Late artifact" },
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
                data: { conflicts: [] },
              },
              payloadHash: candidateAnalysisReconciliationPayloadHash({
                namespace: "candidate",
                kind: "reconciliation",
                data: { conflicts: [] },
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
  "complete and partial runs accept only an exact hash-bound terminal supersession",
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
            supersessionScopeHash: candidateAnalysisRunScopeHash(fixture.run.id),
          });
          const wrongPrior = eventWith(supersession, {
            supersededEventHash: hash("f"),
          });
          await assert.rejects(
            writer.appendRunEvent(wrongPrior),
            (error: unknown) => hasWriteCode(error, "supersession_conflict"),
          );
          assert.equal(await prisma.candidateAnalysisRunEvent.count(), 3);
          assert.equal((await writer.appendRunEvent(supersession)).state, "superseded");
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
