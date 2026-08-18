import assert from "node:assert/strict";
import test from "node:test";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../../src/generated/prisma/client";
import type {
  CandidateAnalysisRunEventInput,
  CandidateAssertionInput,
  CandidateContentUnitInput,
  CandidateDependencyInput,
  CandidateIdentityConfidence,
} from "../../src/lib/knowledge/candidate-analysis-contract";
import {
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
  overrides: Partial<CandidateAnalysisRunEventInput>,
): CandidateAnalysisRunEventInput {
  return { ...input, ...overrides };
}

function assertionWith(
  input: CandidateAssertionInput,
  overrides: Partial<CandidateAssertionInput>,
): CandidateAssertionInput {
  return { ...input, ...overrides };
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

async function seedAuthorityMismatchAssertions(
  prisma: ReturnType<typeof candidatePrisma>,
  dependentIdentity: CandidateIdentityConfidence = "exact",
) {
  const fixture = candidateAnalysisFixture({ identityConfidence: "unresolved" });
  await seedContentUnit(prisma, fixture.contentUnit);
  const writer = createCandidateAnalysisWriter(prisma);
  await writer.createRun(fixture.run);
  const unresolvedUpstream = assertionWith(fixture.assertion, {
    id: "assertion:authority:upstream",
    payload: { proposition: "Unresolved upstream" },
    payloadHash: hash("3"),
    identityConfidence: "unresolved",
    evidenceLevel: "no_locator",
    limitations: ["identity_unresolved"],
  });
  const strongerDependent = assertionWith(fixture.assertion, {
    id: "assertion:authority:dependent",
    payload: { proposition: "Stronger dependent" },
    payloadHash: hash("4"),
    identityConfidence: dependentIdentity,
    evidenceLevel: "exact_locator",
    limitations: ["identity_unresolved", "machine_generated"].sort(),
  });
  await writer.appendAssertion(unresolvedUpstream);
  await writer.appendAssertion(strongerDependent);
  return { writer, fixture, strongerDependent, unresolvedUpstream };
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
          eventWith(fixture.events.queued, { eventHash: hash("1") }),
        );
        await writer.appendRunEvent(
          eventWith(fixture.events.started, { eventHash: hash("2") }),
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
          eventWith(fixture.events.queued, { eventHash: hash("1") }),
        );
        await writer.appendRunEvent(
          eventWith(fixture.events.started, { eventHash: hash("2") }),
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
          idempotencyKey: "candidate:retry:2",
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
        await writer.appendRunEvent(
          eventWith(fixture.events.queued, { eventHash: hash("1") }),
        );
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
  "recursive candidates cannot silently strengthen upstream authority",
  { timeout: 45_000 },
  async (t) => {
    await withCandidateAnalysisPostgres(t, async ({ adminUrl }) => {
      await withPrisma(adminUrl, async (prisma) => {
        const { writer, strongerDependent, unresolvedUpstream } =
          await seedAuthorityMismatchAssertions(prisma);
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
  "direct supporting evidence permits a precisely justified identity and locator upgrade",
  { timeout: 45_000 },
  async (t) => {
    await withCandidateAnalysisPostgres(t, async ({ adminUrl }) => {
      await withPrisma(adminUrl, async (prisma) => {
        const { writer, fixture, strongerDependent, unresolvedUpstream } =
          await seedAuthorityMismatchAssertions(prisma);
        const exactUnit = {
          ...fixture.contentUnit,
          id: "content:authority:exact",
          sourceKey: "source:authority:exact",
          identityConfidence: "exact" as const,
        };
        await seedContentUnit(prisma, exactUnit);
        await writer.appendEvidenceLink({
          ...fixture.evidenceLink,
          id: "evidence:authority:direct",
          assertionId: strongerDependent.id,
          contentUnitId: exactUnit.id,
          locator: exactUnit.locator,
          locatorHash: exactUnit.locatorHash,
          excerptHash: hash("5"),
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
          scopeHash: hash("6"),
          payload: { conflicts: [] },
          payloadHash: hash("7"),
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
