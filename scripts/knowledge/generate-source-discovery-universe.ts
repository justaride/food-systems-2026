import assert from "node:assert/strict";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";

import { z } from "zod";

import {
  POLITICAL_DISCOVERY_CELL_COUNT,
  POLITICAL_DISCOVERY_PROFILE_ID,
  SAPMI_DISCOVERY_CELL_COUNT,
  SAPMI_DISCOVERY_PROFILE_ID,
  SOURCE_DISCOVERY_SCHEMA_VERSION,
  SOURCE_DISCOVERY_UNIVERSE_VERSION,
  canonicalDiscoveryJson,
  discoveryCellId,
  discoverySha256,
  sealDiscoveryUniverseCell,
  sealSourceDiscoverySummary,
  sourceDiscoveryCounts,
  validateSourceDiscoveryBundleWithReceipts,
  type DiscoveryJsonValue,
  type DiscoveryResultLedgerEvent,
  type DiscoveryUniverseCell,
  type SearchQueryLedgerEvent,
  type SourceDiscoverySummary,
} from "../../src/lib/knowledge/source-discovery";

export const SOURCE_DISCOVERY_GENERATOR_VERSION = "1.0.0" as const;
export const SOURCE_DISCOVERY_PATHS = {
  root: "knowledge/corpus/source-discovery",
  universe:
    "knowledge/corpus/source-discovery/source-discovery-universe.v1.jsonl",
  queryLedger:
    "knowledge/corpus/source-discovery/source-discovery-query-ledger.v1.jsonl",
  resultLedger:
    "knowledge/corpus/source-discovery/source-discovery-result-ledger.v1.jsonl",
  summary: "knowledge/corpus/source-discovery/source-discovery-summary.v1.json",
  generationManifest:
    "knowledge/corpus/source-discovery/source-discovery-generation-manifest.v1.json",
} as const;

const ONTOLOGY_PATH = "knowledge/schema/nordic-food-system-ontology.v1.json";
const PROTOCOL_PATH = "knowledge/corpus/SOURCE-DISCOVERY-PROTOCOL.md";
const CONTRACT_PATH = "knowledge/corpus/SOURCE-DISCOVERY-CONTRACT.md";
const SCHEMA_PATH = "knowledge/schema/source-discovery.schema.v1.json";
const ACQUISITION_LIBRARY_PATH =
  "src/lib/knowledge/source-acquisition-receipt.ts";
const LIBRARY_PATH = "src/lib/knowledge/source-discovery.ts";
const GENERATOR_PATH =
  "scripts/knowledge/generate-source-discovery-universe.ts";

const identifierSchema = z.string().regex(/^[a-z0-9][a-z0-9._:-]*$/);
const profileSchema = z
  .object({
    id: z.enum([POLITICAL_DISCOVERY_PROFILE_ID, SAPMI_DISCOVERY_PROFILE_ID]),
    aggregationClass: z.enum(["political_nordic", "sapmi_overlapping"]),
    geographyIds: z.array(identifierSchema).min(1),
    axes: z
      .array(
        z
          .object({
            dimension: z.enum(["valueChainStages", "domains"]),
            ids: z.array(identifierSchema).min(1),
          })
          .passthrough(),
      )
      .length(2),
  })
  .passthrough();

const ontologySchema = z
  .object({
    ontologyId: identifierSchema,
    ontologyVersion: z.string().regex(/^\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?$/),
    dimensions: z
      .object({
        geographies: z.array(z.object({ id: identifierSchema }).passthrough()),
        valueChainStages: z.array(
          z.object({ id: identifierSchema }).passthrough(),
        ),
        domains: z.array(z.object({ id: identifierSchema }).passthrough()),
      })
      .passthrough(),
    coverageProfiles: z.array(z.unknown()),
  })
  .passthrough();

const manifestEntrySchema = z
  .object({
    path: z.string().min(1),
    sizeBytes: z.number().int().nonnegative(),
    sha256: z.string().regex(/^sha256:[a-f0-9]{64}$/),
  })
  .strict();

const ledgerAnchorSchema = z
  .object({
    path: z.enum([
      SOURCE_DISCOVERY_PATHS.queryLedger,
      SOURCE_DISCOVERY_PATHS.resultLedger,
    ]),
    eventCount: z.number().int().nonnegative(),
    sizeBytes: z.number().int().nonnegative(),
    contentSha256: z.string().regex(/^sha256:[a-f0-9]{64}$/),
    lastEventSha256: z
      .string()
      .regex(/^sha256:[a-f0-9]{64}$/)
      .nullable(),
  })
  .strict();

const generationManifestSchema = z
  .object({
    schemaVersion: z.literal("source-discovery-generation-manifest-v1"),
    artifactType: z.literal("source_discovery_generation_manifest"),
    generatorVersion: z.literal(SOURCE_DISCOVERY_GENERATOR_VERSION),
    universeVersion: z.literal(SOURCE_DISCOVERY_UNIVERSE_VERSION),
    inputs: z.array(manifestEntrySchema),
    outputs: z.array(manifestEntrySchema),
    outputSetSha256: z.string().regex(/^sha256:[a-f0-9]{64}$/),
    appendOnlyLedgerAnchors: z
      .object({
        queryLedger: ledgerAnchorSchema,
        resultLedger: ledgerAnchorSchema,
      })
      .strict(),
    semantics: z
      .object({
        networkAccessPerformed: z.literal(false),
        databaseMutationPerformed: z.literal(false),
        plannedCellsAreExecutedSearches: z.literal(false),
        emptyLedgersImplyCoverage: z.literal(false),
        ledgersAreAppendOnlyInputs: z.literal(true),
      })
      .strict(),
    generationManifestSha256: z.string().regex(/^sha256:[a-f0-9]{64}$/),
  })
  .strict();

type GenerationManifest = z.infer<typeof generationManifestSchema>;

export type SourceDiscoveryArtifacts = {
  universeCells: DiscoveryUniverseCell[];
  queryEvents: SearchQueryLedgerEvent[];
  resultEvents: DiscoveryResultLedgerEvent[];
  summary: SourceDiscoverySummary;
  contents: Record<string, string>;
  generationManifest: GenerationManifest;
};

function fail(message: string): never {
  throw new Error(`Source-discovery generator failed: ${message}`);
}

function prettyJson(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function jsonLines(values: unknown[]): string {
  return values.length === 0
    ? ""
    : `${values.map((value) => canonicalDiscoveryJson(value as DiscoveryJsonValue)).join("\n")}\n`;
}

function readRequired(root: string, path: string): Buffer {
  const absolute = join(root, path);
  if (!existsSync(absolute)) fail(`required input is missing: ${path}`);
  return readFileSync(absolute);
}

function parseCanonicalJsonLines(content: string, label: string): unknown[] {
  if (content === "") return [];
  if (!content.endsWith("\n")) fail(`${label} must end with LF`);
  return content
    .trimEnd()
    .split("\n")
    .map((line, index) => {
      let value: unknown;
      try {
        value = JSON.parse(line);
      } catch {
        fail(`${label} line ${index + 1} is not JSON`);
      }
      if (canonicalDiscoveryJson(value as DiscoveryJsonValue) !== line) {
        fail(`${label} line ${index + 1} is not canonical JSON`);
      }
      return value;
    });
}

function exactProfile(
  ontology: z.infer<typeof ontologySchema>,
  profileId:
    typeof POLITICAL_DISCOVERY_PROFILE_ID | typeof SAPMI_DISCOVERY_PROFILE_ID,
): z.infer<typeof profileSchema> {
  const candidates = ontology.coverageProfiles
    .map((profile) => profileSchema.safeParse(profile))
    .filter((result) => result.success && result.data.id === profileId)
    .map((result) => result.data);
  if (candidates.length !== 1)
    fail(`ontology must contain exactly one ${profileId}`);
  return candidates[0]!;
}

function dimensionIds(
  profile: z.infer<typeof profileSchema>,
  dimension: "valueChainStages" | "domains",
): string[] {
  const axes = profile.axes.filter((axis) => axis.dimension === dimension);
  if (axes.length !== 1)
    fail(`${profile.id} must contain exactly one ${dimension} axis`);
  return axes[0]!.ids;
}

export function buildSourceDiscoveryUniverse(input: {
  ontologyBytes: Buffer;
}): DiscoveryUniverseCell[] {
  let rawOntology: unknown;
  try {
    rawOntology = JSON.parse(input.ontologyBytes.toString("utf8"));
  } catch {
    fail("ontology is not valid UTF-8 JSON");
  }
  const parsed = ontologySchema.safeParse(rawOntology);
  if (!parsed.success)
    fail(`ontology shape is invalid: ${parsed.error.message}`);
  const ontology = parsed.data;
  const ontologyBinding: DiscoveryUniverseCell["ontology"] = {
    ontologyId: ontology.ontologyId,
    ontologyVersion: ontology.ontologyVersion,
    ontologyPath: ONTOLOGY_PATH,
    ontologyFileSha256: discoverySha256(input.ontologyBytes),
  };
  const knownGeographies = new Set(
    ontology.dimensions.geographies.map((term) => term.id),
  );
  const knownStages = new Set(
    ontology.dimensions.valueChainStages.map((term) => term.id),
  );
  const knownDomains = new Set(
    ontology.dimensions.domains.map((term) => term.id),
  );

  const cells: DiscoveryUniverseCell[] = [];
  for (const profileId of [
    POLITICAL_DISCOVERY_PROFILE_ID,
    SAPMI_DISCOVERY_PROFILE_ID,
  ] as const) {
    const profile = exactProfile(ontology, profileId);
    const stageIds = dimensionIds(profile, "valueChainStages");
    const domainIds = dimensionIds(profile, "domains");
    const political = profileId === POLITICAL_DISCOVERY_PROFILE_ID;
    if (
      profile.geographyIds.length !== (political ? 8 : 1) ||
      stageIds.length !== 33 ||
      domainIds.length !== 23 ||
      profile.aggregationClass !==
        (political ? "political_nordic" : "sapmi_overlapping")
    ) {
      fail(`${profileId} does not match the declared 8/1 x 33 x 23 universe`);
    }
    const allKnown =
      profile.geographyIds.every((id) => knownGeographies.has(id)) &&
      stageIds.every((id) => knownStages.has(id)) &&
      domainIds.every((id) => knownDomains.has(id));
    if (!allKnown) fail(`${profileId} references an unknown ontology term`);
    for (const geographyId of profile.geographyIds) {
      for (const valueChainStageId of stageIds) {
        for (const analyticalDomainId of domainIds) {
          const cellId = discoveryCellId({
            profileId,
            geographyId,
            valueChainStageId,
            analyticalDomainId,
          });
          cells.push(
            sealDiscoveryUniverseCell({
              schemaVersion: SOURCE_DISCOVERY_SCHEMA_VERSION,
              recordType: "discovery_universe_cell",
              universeId: political
                ? "source-discovery.political-nordic-macro.v1"
                : "source-discovery.sapmi-overlap-macro.v1",
              universeVersion: SOURCE_DISCOVERY_UNIVERSE_VERSION,
              profileId,
              aggregationClass: political
                ? "political_nordic"
                : "sapmi_overlapping",
              nonAdditiveWithOtherProfiles: true,
              ontology: ontologyBinding,
              cellId,
              geographyId,
              valueChainStageId,
              analyticalDomainId,
              planningState: "planned",
              searchState: "not_executed_in_universe_record",
              candidateState: "none_recorded_in_universe_record",
              formalSourceState: "none_recorded_in_universe_record",
              coverageClaimState: "not_assessed",
              rightsHolderGovernanceRequired: !political,
              externalUseAllowed: false,
              coveragePromotionAllowed: false,
            }),
          );
        }
      }
    }
  }
  cells.sort((left, right) => left.cellId.localeCompare(right.cellId));
  assert.equal(
    cells.filter((cell) => cell.profileId === POLITICAL_DISCOVERY_PROFILE_ID)
      .length,
    POLITICAL_DISCOVERY_CELL_COUNT,
  );
  assert.equal(
    cells.filter((cell) => cell.profileId === SAPMI_DISCOVERY_PROFILE_ID)
      .length,
    SAPMI_DISCOVERY_CELL_COUNT,
  );
  return cells;
}

function entry(
  path: string,
  content: string | Buffer,
): {
  path: string;
  sizeBytes: number;
  sha256: string;
} {
  const bytes =
    typeof content === "string" ? Buffer.from(content, "utf8") : content;
  return { path, sizeBytes: bytes.length, sha256: discoverySha256(bytes) };
}

function ledgerAnchor(
  path:
    | typeof SOURCE_DISCOVERY_PATHS.queryLedger
    | typeof SOURCE_DISCOVERY_PATHS.resultLedger,
  content: string,
  events: Array<{ eventSha256: string }>,
): z.infer<typeof ledgerAnchorSchema> {
  const bytes = Buffer.from(content, "utf8");
  return ledgerAnchorSchema.parse({
    path,
    eventCount: events.length,
    sizeBytes: bytes.length,
    contentSha256: discoverySha256(bytes),
    lastEventSha256: events.at(-1)?.eventSha256 ?? null,
  });
}

function validateGenerationManifest(value: unknown): GenerationManifest {
  const parsed = generationManifestSchema.safeParse(value);
  if (!parsed.success)
    fail(`generation manifest is invalid: ${parsed.error.message}`);
  const manifest = parsed.data;
  const { generationManifestSha256, ...body } = manifest;
  const expectedSeal = discoverySha256(
    `food-systems-2026:source-discovery:generation-manifest:v1\0${canonicalDiscoveryJson(body as unknown as DiscoveryJsonValue)}`,
  );
  if (generationManifestSha256 !== expectedSeal) {
    fail("generation manifest self-seal is invalid");
  }
  const expectedOutputSet = discoverySha256(
    canonicalDiscoveryJson(manifest.outputs as unknown as DiscoveryJsonValue),
  );
  if (manifest.outputSetSha256 !== expectedOutputSet) {
    fail("generation manifest output-set seal is invalid");
  }
  const outputByPath = new Map(
    manifest.outputs.map((output) => [output.path, output]),
  );
  for (const anchor of Object.values(manifest.appendOnlyLedgerAnchors)) {
    const output = outputByPath.get(anchor.path);
    if (
      !output ||
      output.sizeBytes !== anchor.sizeBytes ||
      output.sha256 !== anchor.contentSha256 ||
      (anchor.eventCount === 0) !== (anchor.lastEventSha256 === null)
    ) {
      fail(`generation manifest ledger anchor disagrees with ${anchor.path}`);
    }
  }
  return manifest;
}

function assertLedgerExtendsAnchor(input: {
  label: string;
  content: string;
  events: Array<{ eventSha256: string }>;
  anchor: z.infer<typeof ledgerAnchorSchema>;
}): void {
  const currentBytes = Buffer.from(input.content, "utf8");
  if (
    currentBytes.length < input.anchor.sizeBytes ||
    input.events.length < input.anchor.eventCount
  ) {
    fail(`${input.label} was truncated instead of appended`);
  }
  const previousPrefix = currentBytes.subarray(0, input.anchor.sizeBytes);
  if (discoverySha256(previousPrefix) !== input.anchor.contentSha256) {
    fail(`${input.label} rewrote bytes before the append boundary`);
  }
  const anchoredHead =
    input.anchor.eventCount === 0
      ? null
      : (input.events[input.anchor.eventCount - 1]?.eventSha256 ?? null);
  if (anchoredHead !== input.anchor.lastEventSha256) {
    fail(`${input.label} does not retain the anchored event head`);
  }
}

function buildManifest(input: {
  repositoryRoot: string;
  contents: Record<string, string>;
  queryEvents: SearchQueryLedgerEvent[];
  resultEvents: DiscoveryResultLedgerEvent[];
}): GenerationManifest {
  const inputPaths = [
    ONTOLOGY_PATH,
    PROTOCOL_PATH,
    CONTRACT_PATH,
    SCHEMA_PATH,
    ACQUISITION_LIBRARY_PATH,
    LIBRARY_PATH,
    GENERATOR_PATH,
  ].sort();
  const inputs = inputPaths.map((path) =>
    entry(path, readRequired(input.repositoryRoot, path)),
  );
  const outputPaths = [
    SOURCE_DISCOVERY_PATHS.universe,
    SOURCE_DISCOVERY_PATHS.queryLedger,
    SOURCE_DISCOVERY_PATHS.resultLedger,
    SOURCE_DISCOVERY_PATHS.summary,
  ].sort();
  const outputs = outputPaths.map((path) => entry(path, input.contents[path]!));
  const body = {
    schemaVersion: "source-discovery-generation-manifest-v1" as const,
    artifactType: "source_discovery_generation_manifest" as const,
    generatorVersion: SOURCE_DISCOVERY_GENERATOR_VERSION,
    universeVersion: SOURCE_DISCOVERY_UNIVERSE_VERSION,
    inputs,
    outputs,
    outputSetSha256: discoverySha256(
      canonicalDiscoveryJson(outputs as unknown as DiscoveryJsonValue),
    ),
    appendOnlyLedgerAnchors: {
      queryLedger: ledgerAnchor(
        SOURCE_DISCOVERY_PATHS.queryLedger,
        input.contents[SOURCE_DISCOVERY_PATHS.queryLedger]!,
        input.queryEvents,
      ),
      resultLedger: ledgerAnchor(
        SOURCE_DISCOVERY_PATHS.resultLedger,
        input.contents[SOURCE_DISCOVERY_PATHS.resultLedger]!,
        input.resultEvents,
      ),
    },
    semantics: {
      networkAccessPerformed: false as const,
      databaseMutationPerformed: false as const,
      plannedCellsAreExecutedSearches: false as const,
      emptyLedgersImplyCoverage: false as const,
      ledgersAreAppendOnlyInputs: true as const,
    },
  };
  return generationManifestSchema.parse({
    ...body,
    generationManifestSha256: discoverySha256(
      `food-systems-2026:source-discovery:generation-manifest:v1\0${canonicalDiscoveryJson(body as unknown as DiscoveryJsonValue)}`,
    ),
  });
}

export function generateSourceDiscoveryArtifacts(input: {
  repositoryRoot: string;
  queryLedgerContent?: string;
  resultLedgerContent?: string;
}): SourceDiscoveryArtifacts {
  const ontologyBytes = readRequired(input.repositoryRoot, ONTOLOGY_PATH);
  const universeCells = buildSourceDiscoveryUniverse({ ontologyBytes });
  const queryLedgerContent = input.queryLedgerContent ?? "";
  const resultLedgerContent = input.resultLedgerContent ?? "";
  const queryValues = parseCanonicalJsonLines(
    queryLedgerContent,
    "query ledger",
  );
  const resultValues = parseCanonicalJsonLines(
    resultLedgerContent,
    "result ledger",
  );
  const validated = validateSourceDiscoveryBundleWithReceipts(
    {
      universeCells,
      queryEvents: queryValues,
      resultEvents: resultValues,
    },
    (receiptPath) => readRequired(input.repositoryRoot, receiptPath),
  );
  const counts = sourceDiscoveryCounts(validated);
  const summary = sealSourceDiscoverySummary({
    schemaVersion: SOURCE_DISCOVERY_SCHEMA_VERSION,
    recordType: "source_discovery_summary",
    universeVersion: SOURCE_DISCOVERY_UNIVERSE_VERSION,
    ontology: universeCells[0]!.ontology,
    counts: {
      ...counts,
      plannedCellTotal:
        POLITICAL_DISCOVERY_CELL_COUNT + SAPMI_DISCOVERY_CELL_COUNT,
    },
    semantics: {
      plannedCellsAreExecutedSearches: false,
      executedSearchesAreCandidates: false,
      candidatesAreFormallyReceivedSources: false,
      formallyReceivedSourcesAreCoverage: false,
      politicalAndSapmiAreAdditive: false,
    },
  });
  const contents: Record<string, string> = {
    [SOURCE_DISCOVERY_PATHS.universe]: jsonLines(universeCells),
    [SOURCE_DISCOVERY_PATHS.queryLedger]: queryLedgerContent,
    [SOURCE_DISCOVERY_PATHS.resultLedger]: resultLedgerContent,
    [SOURCE_DISCOVERY_PATHS.summary]: prettyJson(summary),
  };
  const generationManifest = buildManifest({
    repositoryRoot: input.repositoryRoot,
    contents,
    queryEvents: validated.queryEvents,
    resultEvents: validated.resultEvents,
  });
  return {
    universeCells,
    queryEvents: validated.queryEvents,
    resultEvents: validated.resultEvents,
    summary,
    contents,
    generationManifest,
  };
}

function writeAtomically(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  const temporary = `${path}.${process.pid}.tmp`;
  if (existsSync(temporary))
    fail(`temporary output already exists: ${temporary}`);
  try {
    writeFileSync(temporary, content, { flag: "wx", encoding: "utf8" });
    if (readFileSync(temporary, "utf8") !== content)
      fail(`temporary output verification failed: ${path}`);
    renameSync(temporary, path);
  } finally {
    if (existsSync(temporary)) unlinkSync(temporary);
  }
}

export function writeSourceDiscoveryArtifacts(
  repositoryRoot: string,
): SourceDiscoveryArtifacts {
  const queryPath = join(repositoryRoot, SOURCE_DISCOVERY_PATHS.queryLedger);
  const resultPath = join(repositoryRoot, SOURCE_DISCOVERY_PATHS.resultLedger);
  const queryExists = existsSync(queryPath);
  const resultExists = existsSync(resultPath);
  const manifestPath = join(
    repositoryRoot,
    SOURCE_DISCOVERY_PATHS.generationManifest,
  );
  const queryLedgerContent = queryExists ? readFileSync(queryPath, "utf8") : "";
  const resultLedgerContent = resultExists
    ? readFileSync(resultPath, "utf8")
    : "";
  const generated = generateSourceDiscoveryArtifacts({
    repositoryRoot,
    queryLedgerContent,
    resultLedgerContent,
  });
  const manifestExists = existsSync(manifestPath);
  if (
    !manifestExists &&
    (queryLedgerContent !== "" || resultLedgerContent !== "")
  ) {
    fail(
      "cannot adopt non-empty append-only ledgers without a prior generation manifest anchor",
    );
  }
  if (manifestExists) {
    const previousManifest = validateGenerationManifest(
      JSON.parse(readFileSync(manifestPath, "utf8")),
    );
    assertLedgerExtendsAnchor({
      label: "query ledger",
      content: queryLedgerContent,
      events: generated.queryEvents,
      anchor: previousManifest.appendOnlyLedgerAnchors.queryLedger,
    });
    assertLedgerExtendsAnchor({
      label: "result ledger",
      content: resultLedgerContent,
      events: generated.resultEvents,
      anchor: previousManifest.appendOnlyLedgerAnchors.resultLedger,
    });
  }
  const assertLedgersUnchangedDuringGeneration = () => {
    const currentQueryLedgerContent = existsSync(queryPath)
      ? readFileSync(queryPath, "utf8")
      : "";
    const currentResultLedgerContent = existsSync(resultPath)
      ? readFileSync(resultPath, "utf8")
      : "";
    if (
      currentQueryLedgerContent !== queryLedgerContent ||
      currentResultLedgerContent !== resultLedgerContent
    ) {
      fail("append-only ledger bytes changed during generation");
    }
  };
  assertLedgersUnchangedDuringGeneration();
  if (!queryExists) writeAtomically(queryPath, queryLedgerContent);
  if (!resultExists) writeAtomically(resultPath, resultLedgerContent);
  writeAtomically(
    join(repositoryRoot, SOURCE_DISCOVERY_PATHS.universe),
    generated.contents[SOURCE_DISCOVERY_PATHS.universe]!,
  );
  writeAtomically(
    join(repositoryRoot, SOURCE_DISCOVERY_PATHS.summary),
    generated.contents[SOURCE_DISCOVERY_PATHS.summary]!,
  );
  assertLedgersUnchangedDuringGeneration();
  writeAtomically(manifestPath, prettyJson(generated.generationManifest));
  return generated;
}

export function checkSourceDiscoveryArtifacts(
  repositoryRoot: string,
): SourceDiscoveryArtifacts {
  const queryLedgerContent = readFileSync(
    join(repositoryRoot, SOURCE_DISCOVERY_PATHS.queryLedger),
    "utf8",
  );
  const resultLedgerContent = readFileSync(
    join(repositoryRoot, SOURCE_DISCOVERY_PATHS.resultLedger),
    "utf8",
  );
  const generated = generateSourceDiscoveryArtifacts({
    repositoryRoot,
    queryLedgerContent,
    resultLedgerContent,
  });
  for (const [path, expected] of Object.entries(generated.contents)) {
    const observed = readFileSync(join(repositoryRoot, path), "utf8");
    if (observed !== expected) fail(`tracked artifact is stale: ${path}`);
  }
  const manifestPath = join(
    repositoryRoot,
    SOURCE_DISCOVERY_PATHS.generationManifest,
  );
  const observedManifest = validateGenerationManifest(
    JSON.parse(readFileSync(manifestPath, "utf8")),
  );
  if (
    canonicalDiscoveryJson(
      observedManifest as unknown as DiscoveryJsonValue,
    ) !==
    canonicalDiscoveryJson(
      generated.generationManifest as unknown as DiscoveryJsonValue,
    )
  ) {
    fail("tracked generation manifest is stale");
  }
  const expectedNames = [
    SOURCE_DISCOVERY_PATHS.universe,
    SOURCE_DISCOVERY_PATHS.queryLedger,
    SOURCE_DISCOVERY_PATHS.resultLedger,
    SOURCE_DISCOVERY_PATHS.summary,
    SOURCE_DISCOVERY_PATHS.generationManifest,
  ]
    .map((path) => path.split("/").at(-1)!)
    .sort();
  const actualNames = readdirSync(
    join(repositoryRoot, SOURCE_DISCOVERY_PATHS.root),
  ).sort();
  if (JSON.stringify(actualNames) !== JSON.stringify(expectedNames)) {
    fail(
      "source-discovery output directory contains unexpected or missing files",
    );
  }
  return generated;
}

function main(): void {
  const args = process.argv.slice(2);
  if (args.length !== 1 || !["--write", "--check"].includes(args[0]!)) {
    fail("choose exactly one mode: --write or --check");
  }
  const result =
    args[0] === "--write"
      ? writeSourceDiscoveryArtifacts(process.cwd())
      : checkSourceDiscoveryArtifacts(process.cwd());
  process.stdout.write(
    `Source discovery ${args[0]!.slice(2)} passed: ${result.summary.counts.plannedPoliticalCells} political cells, ${result.summary.counts.plannedSapmiCells} Sápmi cells, ${result.summary.counts.executedSearchRuns} executed searches.\n`,
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  main();
