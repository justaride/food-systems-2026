import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  parseLibraryAnalysisBatchPreparationArgs,
  runLibraryAnalysisBatchPreparationCli,
} from "../../scripts/knowledge/prepare-library-analysis-acquisition-batches";
import {
  mergeLibraryAnalysisAcquisitionBatchOutputs,
} from "../../scripts/knowledge/merge-library-analysis-acquisition-batches";
import {
  selectLibraryAnalysisBatchAttempt,
} from "../../scripts/knowledge/run-library-analysis-acquisition-batches";
import {
  emitLibraryAnalysisContentUnitBundle,
  type LibraryAnalysisPrivateEmitOutput,
} from "../../scripts/knowledge/emit-library-analysis-content-units";
import {
  partitionLibraryAnalysisAcquisition,
} from "../../src/lib/knowledge/library-analysis-acquisition-batches";
import {
  buildLibraryAnalysisAcquisitionPlan,
} from "../../src/lib/knowledge/library-analysis-acquisition-contract";
import {
  buildLibraryAnalysisPopulation,
  type LibraryAnalysisPopulationInputRow,
} from "../../src/lib/knowledge/library-analysis-population";

function eligibleDocument(id: string): LibraryAnalysisPopulationInputRow {
  return {
    sourceKind: "document",
    sourceKey: `document:${id}`,
    sourceVersionHash: id.padEnd(64, "1").slice(0, 64),
    inputKind: "database_record",
    locator: `database:Document:${id}:content`,
    contentHash: id.padEnd(64, "2").slice(0, 64),
    identityConfidence: "exact",
    readableInput: true,
    superseded: false,
  };
}

function blockedSource(id: string): LibraryAnalysisPopulationInputRow {
  return {
    sourceKind: "source_doc",
    sourceKey: `source_doc:${id}`,
    sourceVersionHash: null,
    inputKind: "none",
    locator: null,
    contentHash: null,
    identityConfidence: "unresolved",
    readableInput: false,
    superseded: false,
  };
}

test("batch partition keeps every identity exactly once and isolates controlled HTTPS", () => {
  const population = buildLibraryAnalysisPopulation([
    eligibleDocument("a"),
    eligibleDocument("b"),
    eligibleDocument("c"),
    blockedSource("web-a"),
    blockedSource("web-b"),
    blockedSource("web-c"),
  ]);
  const plan = buildLibraryAnalysisAcquisitionPlan(population, [
    {
      sourceKind: "source_doc",
      sourceKey: "source_doc:web-a",
      route: "controlled_https",
      locator: "https://example.test/a",
      alternateLocators: [],
    },
    {
      sourceKind: "source_doc",
      sourceKey: "source_doc:web-b",
      route: "controlled_https",
      locator: "https://example.test/b",
      alternateLocators: [],
    },
    {
      sourceKind: "source_doc",
      sourceKey: "source_doc:web-c",
      route: "controlled_https",
      locator: "https://example.test/c",
      alternateLocators: [],
    },
  ]);

  const result = partitionLibraryAnalysisAcquisition({
    snapshot: population,
    plan,
    policy: { version: "1.0.0", localBatchSize: 2, externalBatchSize: 2 },
  });

  assert.deepEqual(result.batches.map((batch) => [batch.kind, batch.plan.rows.length]), [
    ["local", 2],
    ["local", 1],
    ["controlled_https", 2],
    ["controlled_https", 1],
  ]);
  assert.ok(result.batches.slice(0, 2).every((batch) =>
    batch.plan.rows.every((row) => row.route !== "controlled_https")));
  assert.ok(result.batches.slice(2).every((batch) =>
    batch.plan.rows.every((row) => row.route === "controlled_https")));
  const identities = result.batches.flatMap((batch) =>
    batch.plan.rows.map((row) => `${row.sourceKind}\u0000${row.sourceKey}`));
  assert.equal(identities.length, plan.rows.length);
  assert.equal(new Set(identities).size, plan.rows.length);
  assert.equal(result.manifest.parentPopulationHash, population.populationHash);
  assert.equal(result.manifest.parentPlanHash, plan.planHash);
  assert.deepEqual(
    result.manifest.batches.map((batch) => batch.rowCount),
    [2, 1, 2, 1],
  );
});

test("batch partition is replay deterministic and rejects a mismatched parent binding", () => {
  const population = buildLibraryAnalysisPopulation([
    eligibleDocument("a"),
    blockedSource("web-a"),
  ]);
  const plan = buildLibraryAnalysisAcquisitionPlan(population, [{
    sourceKind: "source_doc",
    sourceKey: "source_doc:web-a",
    route: "controlled_https",
    locator: "https://example.test/a",
    alternateLocators: [],
  }]);
  const input = {
    snapshot: population,
    plan,
    policy: { version: "1.0.0" as const, localBatchSize: 1, externalBatchSize: 1 },
  };

  assert.deepEqual(
    partitionLibraryAnalysisAcquisition(input),
    partitionLibraryAnalysisAcquisition(input),
  );
  assert.throws(
    () => partitionLibraryAnalysisAcquisition({
      ...input,
      plan: { ...plan, populationHash: "f".repeat(64) },
    }),
    /acquisition_plan_hash_mismatch|batch_parent_binding_mismatch/,
  );
});

test("batch preparation writes sealed parent-bound scopes under a private root", () => {
  const temporary = mkdtempSync(join(tmpdir(), "library-analysis-batches."));
  try {
    const population = buildLibraryAnalysisPopulation([
      eligibleDocument("a"),
      blockedSource("web-a"),
    ]);
    const plan = buildLibraryAnalysisAcquisitionPlan(population, [{
      sourceKind: "source_doc",
      sourceKey: "source_doc:web-a",
      route: "controlled_https",
      locator: "https://example.test/a",
      alternateLocators: [],
    }]);
    const snapshotPath = join(temporary, "population.json");
    const planPath = join(temporary, "plan.json");
    const outputRoot = join(temporary, "private", "batch-set");
    writeFileSync(snapshotPath, JSON.stringify(population));
    writeFileSync(planPath, JSON.stringify(plan));

    const output = runLibraryAnalysisBatchPreparationCli({
      snapshot: snapshotPath,
      plan: planPath,
      outputRoot,
      localBatchSize: 1,
      externalBatchSize: 1,
    });

    assert.equal(output.manifest.rowCount, 2);
    assert.equal(statSync(outputRoot).mode & 0o777, 0o700);
    assert.equal(statSync(join(outputRoot, "batch-set.v1.json")).mode & 0o777, 0o400);
    const first = output.manifest.batches[0]!;
    const writtenPlan = JSON.parse(readFileSync(
      join(outputRoot, "batches", first.batchId, "acquisition-plan.v1.json"),
      "utf8",
    ));
    assert.equal(writtenPlan.planHash, first.planHash);
  } finally {
    rmSync(temporary, { recursive: true, force: true });
  }
});

test("batch preparation arguments are explicit and bounded", () => {
  assert.deepEqual(parseLibraryAnalysisBatchPreparationArgs([
    "--snapshot=/private/population.json",
    "--plan=/private/plan.json",
    "--output-root=/private/run",
    "--local-batch-size=200",
    "--external-batch-size=5",
  ]), {
    snapshot: "/private/population.json",
    plan: "/private/plan.json",
    outputRoot: "/private/run",
    localBatchSize: 200,
    externalBatchSize: 5,
  });
  assert.throws(
    () => parseLibraryAnalysisBatchPreparationArgs([
      "--snapshot=/private/population.json",
      "--plan=/private/plan.json",
      "--output-root=/private/run",
      "--external-batch-size=11",
    ]),
    /library_analysis_batch_preparation_arguments_invalid/,
  );
});

test("batch merge rebinds verified outputs to the full plan and copies each unit once", async () => {
  const localText = "Local database body";
  const externalText = "External source body";
  const localHash = sha256(localText);
  const population = buildLibraryAnalysisPopulation([
    {
      sourceKind: "document",
      sourceKey: "document:local",
      sourceVersionHash: localHash,
      inputKind: "database_record",
      locator: "database:Document:local:content",
      contentHash: localHash,
      identityConfidence: "exact",
      readableInput: true,
      superseded: false,
    },
    blockedSource("web"),
  ]);
  const plan = buildLibraryAnalysisAcquisitionPlan(population, [{
    sourceKind: "source_doc",
    sourceKey: "source_doc:web",
    route: "controlled_https",
    locator: "https://example.test/web",
    alternateLocators: [],
  }]);
  const partition = partitionLibraryAnalysisAcquisition({
    snapshot: population,
    plan,
    policy: { version: "1.0.0", localBatchSize: 1, externalBatchSize: 1 },
  });
  const batchPayloads: Array<Map<string, string>> = [];
  const outputs: LibraryAnalysisPrivateEmitOutput[] = [];
  for (const batch of partition.batches) {
    const text = batch.kind === "local" ? localText : externalText;
    const rawHash = sha256(text);
    const payloads = new Map<string, string>();
    batchPayloads.push(payloads);
    outputs.push(await emitLibraryAnalysisContentUnitBundle({
      snapshot: batch.snapshot,
      plan: batch.plan,
      extractions: [{
        sourceKind: batch.plan.rows[0]!.sourceKind,
        sourceKey: batch.plan.rows[0]!.sourceKey,
        route: batch.plan.rows[0]!.route as "database_document" | "controlled_https",
        sourceVersionHash: rawHash,
        rawSha256: rawHash,
        units: [{
          unitType: "document_section",
          baseLocator: batch.plan.rows[0]!.locator!,
          ordinal: 0,
          text,
        }],
      }],
      failures: [],
      writeUnit: async (portablePath, unitText) => {
        payloads.set(portablePath, unitText);
      },
    }));
  }
  const mergedPayloads = new Map<string, string>();

  const merged = await mergeLibraryAnalysisAcquisitionBatchOutputs({
    snapshot: population,
    plan,
    batchSet: partition.manifest,
    batches: partition.batches.map((batch, index) => ({
      descriptor: batch.descriptor,
      snapshot: batch.snapshot,
      plan: batch.plan,
      output: outputs[index]!,
      readUnit: async (portablePath: string) => batchPayloads[index]!.get(portablePath)!,
    })),
    writeUnit: async (portablePath, text) => {
      assert.equal(mergedPayloads.has(portablePath), false);
      mergedPayloads.set(portablePath, text);
    },
  });

  assert.equal(merged.populationTotal, 2);
  assert.equal(merged.resolution.planHash, plan.planHash);
  assert.equal(merged.contentUnitManifest.populationHash, population.populationHash);
  assert.equal(merged.resolution.rows.filter((row) =>
    row.disposition === "content_units_ready").length, 2);
  assert.equal(merged.costEnvelope.totals.sourcesReady, 2);
  assert.equal(mergedPayloads.size, 2);
  assert.deepEqual([...mergedPayloads.values()].sort(), [externalText, localText].sort());
});

function sha256(text: string): string {
  return createHash("sha256").update(text, "utf8").digest("hex");
}

test("batch resume reuses a completed attempt and never overwrites an incomplete one", () => {
  assert.deepEqual(selectLibraryAnalysisBatchAttempt([
    { attempt: 1, completed: true },
    { attempt: 2, completed: false },
  ]), { reuseAttempt: 1, nextAttempt: null });
  assert.deepEqual(selectLibraryAnalysisBatchAttempt([
    { attempt: 1, completed: false },
    { attempt: 2, completed: false },
  ]), { reuseAttempt: null, nextAttempt: 3 });
  assert.deepEqual(selectLibraryAnalysisBatchAttempt([]), {
    reuseAttempt: null,
    nextAttempt: 1,
  });
});
