import assert from "node:assert/strict";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

import { sealSourceAcquisitionReceipt } from "../../src/lib/knowledge/source-acquisition-receipt";
import {
  SOURCE_DISCOVERY_PATHS,
  buildSourceDiscoveryUniverse,
  checkSourceDiscoveryArtifacts,
  generateSourceDiscoveryArtifacts,
  writeSourceDiscoveryArtifacts,
} from "../../scripts/knowledge/generate-source-discovery-universe";
import {
  DISCOVERY_SEARCH_ROUTES,
  POLITICAL_DISCOVERY_CELL_COUNT,
  POLITICAL_DISCOVERY_PROFILE_ID,
  SAPMI_DISCOVERY_CELL_COUNT,
  SAPMI_DISCOVERY_PROFILE_ID,
  SOURCE_DISCOVERY_SCHEMA_VERSION,
  SOURCE_DISCOVERY_UNIVERSE_VERSION,
  canonicalDiscoveryJson,
  discoveryCellId,
  discoverySha256,
  sealDiscoveryResultEvent,
  sealDiscoveryUniverseCell,
  sealSearchQueryEvent,
  sealSourceDiscoverySummary,
  sourceDiscoveryCounts,
  sourceDiscoveryRecordSchema,
  validateDiscoveryResultLedger,
  validateDiscoveryUniverseCell,
  validateSearchQueryLedger,
  validateSourceDiscoveryBundle,
  validateSourceDiscoveryBundleWithReceipts,
  type DiscoveryCandidateEvent,
  type DiscoveryJsonValue,
  type DiscoveryResultLedgerEvent,
  type DiscoveryUniverseCell,
  type FormalSourceReceivedEvent,
  type SearchPlanEvent,
  type SearchCompletionAssessmentEvent,
  type SearchQueryLedgerEvent,
  type SearchRunEvent,
} from "../../src/lib/knowledge/source-discovery";

const ONTOLOGY_PATH = "knowledge/schema/nordic-food-system-ontology.v1.json";
const ONTOLOGY_BYTES = readFileSync(ONTOLOGY_PATH);
const UNIVERSE = buildSourceDiscoveryUniverse({
  ontologyBytes: ONTOLOGY_BYTES,
});
const POLITICAL_CELL = UNIVERSE.find(
  (cell) => cell.profileId === POLITICAL_DISCOVERY_PROFILE_ID,
)!;
const SAPMI_CELL = UNIVERSE.find(
  (cell) => cell.profileId === SAPMI_DISCOVERY_PROFILE_ID,
)!;

const jsonSchema = JSON.parse(
  readFileSync("knowledge/schema/source-discovery.schema.v1.json", "utf8"),
) as object;
const ajv = new Ajv2020({ allErrors: true, strict: false });
addFormats(ajv);
const validateJsonSchema = ajv.compile(jsonSchema);

const HASH = Object.fromEntries(
  "abcdefghijklmnopqrstuvwxyz"
    .split("")
    .map((character) => [
      character,
      discoverySha256(`source-discovery-fixture-${character}`),
    ]),
) as Record<string, string>;

function planFixture(
  input: {
    cell?: DiscoveryUniverseCell;
    authorizationRecordedForSapmi?: boolean;
  } = {},
): SearchPlanEvent {
  const cell = input.cell ?? POLITICAL_CELL;
  const sapmi = cell.profileId === SAPMI_DISCOVERY_PROFILE_ID;
  const authorizationRecorded = input.authorizationRecordedForSapmi ?? false;
  const routes = DISCOVERY_SEARCH_ROUTES.map((routeId) => ({
    routeId,
    state:
      !sapmi && routeId === "rights_holder_led"
        ? ("not_applicable" as const)
        : ("planned" as const),
    rationale:
      !sapmi && routeId === "rights_holder_led"
        ? "This political-scope fixture has no governed Indigenous search route."
        : null,
  }));
  return sealSearchQueryEvent({
    schemaVersion: SOURCE_DISCOVERY_SCHEMA_VERSION,
    eventId: sapmi
      ? "query.event.plan.sapmi.v1"
      : "query.event.plan.political.v1",
    sequence: 0,
    predecessorEventSha256: null,
    recordedAt: "2026-08-03T10:00:00Z",
    recordType: "search_plan_registered",
    planId: sapmi ? "search.plan.sapmi.v1" : "search.plan.political.v1",
    planVersion: "1.0.0",
    universeId: cell.universeId,
    universeVersion: cell.universeVersion,
    profileId: cell.profileId,
    aggregationClass: cell.aggregationClass,
    universeCellIds: [cell.cellId],
    ontology: cell.ontology,
    sourceSystems: [
      {
        systemId: "system.official.example",
        systemClass: "official_institution",
        name: "Official example catalogue",
        locator: "https://authority.example/publications",
      },
    ],
    sourceClasses: ["government_report"],
    languageCodes: ["nb"],
    timeRange: {
      from: "2020-01-01",
      to: "2026-08-03",
      undatedIncluded: true,
    },
    updateCadence: {
      cadence: "quarterly",
      repeatNoLaterThan: "2026-11-03",
    },
    routes,
    searchObligations: routes
      .filter((route) => route.state === "planned")
      .map((route, index) => ({
        obligationId: `obligation.${sapmi ? "sapmi" : "political"}.${index + 1}.v1`,
        routeId: route.routeId,
        sourceSystemId: "system.official.example",
        sourceClass: "government_report",
        languageCode: "nb",
        universeCellId: cell.cellId,
      })),
    rules: {
      inclusion: [
        "Include official material that addresses the declared cell.",
      ],
      exclusion: [
        "Exclude material outside the declared geography and period.",
      ],
      deduplication: [
        "Group exact locators without merging distinct source identities.",
      ],
      stopping: [
        "Inspect every applicable route and all declared result pages.",
      ],
    },
    knownBarriers: [],
    rightsHolderGovernance: sapmi
      ? {
          routeAuthorityId: "rights.holder.authority.example",
          consentRequired: true,
          interpretationRouteRequired: true,
          status: authorizationRecorded
            ? "authorization_recorded_unverified"
            : "not_started",
          authorizationReceiptSha256: authorizationRecorded ? HASH.a! : null,
        }
      : null,
    executionState: "planned_not_executed",
    candidateState: "none_implied_by_plan",
    formalSourceState: "none_implied_by_plan",
    coverageClaimState: "not_assessed",
    externalUseAllowed: false,
    coveragePromotionAllowed: false,
  }) as SearchPlanEvent;
}

function runFixture(
  input: {
    plan?: SearchPlanEvent;
    candidateIds?: string[];
    resultState?: SearchRunEvent["resultState"];
    obligationIndex?: number;
    sequence?: number;
    predecessorEventSha256?: string;
  } = {},
): SearchRunEvent {
  const plan = input.plan ?? planFixture();
  const resultState = input.resultState ?? "partial";
  const obligationIndex = input.obligationIndex ?? 0;
  const obligation = plan.searchObligations[obligationIndex]!;
  const sequence = input.sequence ?? 1;
  const recordedAt = new Date(
    Date.parse("2026-08-03T10:00:00Z") + sequence * 10 * 60_000,
  ).toISOString();
  const startedAt = new Date(Date.parse(recordedAt) - 9 * 60_000).toISOString();
  const endedAt = new Date(Date.parse(recordedAt) - 5 * 60_000).toISOString();
  return sealSearchQueryEvent({
    schemaVersion: SOURCE_DISCOVERY_SCHEMA_VERSION,
    eventId: `query.event.run.${plan.profileId === SAPMI_DISCOVERY_PROFILE_ID ? "sapmi" : "political"}.${obligationIndex + 1}.v1`,
    sequence,
    predecessorEventSha256: input.predecessorEventSha256 ?? plan.eventSha256,
    recordedAt,
    recordType: "search_run_recorded",
    runId:
      plan.profileId === SAPMI_DISCOVERY_PROFILE_ID
        ? `search.run.sapmi.${obligationIndex + 1}.v1`
        : `search.run.political.${obligationIndex + 1}.v1`,
    planId: plan.planId,
    planVersion: plan.planVersion,
    planEventSha256: plan.eventSha256,
    universeId: plan.universeId,
    universeVersion: plan.universeVersion,
    profileId: plan.profileId,
    aggregationClass: plan.aggregationClass,
    universeCellIds: [obligation.universeCellId],
    obligationId: obligation.obligationId,
    sourceSystemId: obligation.sourceSystemId,
    sourceSystemLocator: plan.sourceSystems.find(
      (system) => system.systemId === obligation.sourceSystemId,
    )!.locator,
    sourceClass: obligation.sourceClass,
    executor: {
      executorType: "ai_assisted",
      executorId: "executor.codex.example",
      toolOrInterface: "Controlled read-only search interface",
      toolVersion: "1.0.0",
      authenticationBoundary: "public_unauthenticated",
    },
    startedAt,
    endedAt,
    query: {
      method: "query",
      exactQuery: "food system official report",
      requestedLocator: "https://authority.example/search",
      filters: ["published:2020-2026"],
      sortOrder: "date descending",
      languageCode: obligation.languageCode,
      pagination: {
        fromPageOrCursor: "1",
        toPageOrCursor: "1",
        completeForDeclaredRoute: resultState === "completed",
      },
    },
    routeExecutions: [
      {
        routeId: obligation.routeId,
        state: "completed" as const,
        pagesOrSegmentsInspected: 1,
        limitation: null,
      },
    ],
    observedResultCount: 1,
    inspectedResultCount: 1,
    reliableTotalExposed: true,
    landingPagesInspected: ["https://authority.example/search"],
    navigationPathsInspected: ["Publications > Reports > Search results"],
    candidateIds: input.candidateIds ?? ["candidate.official.report.v1"],
    exclusions: [],
    accessFailures: [],
    capturedResponseSha256s: [HASH.b!],
    resultState,
    limitations:
      resultState === "completed"
        ? []
        : [
            "Only one applicable search route was completed in this partial run.",
          ],
    nextActions:
      resultState === "completed"
        ? []
        : ["Execute every remaining route declared in the bound search plan."],
    repeatNoLaterThan: "2026-11-03",
    searchExecuted: true,
    formalSourceState: "none_implied_by_search",
    coverageClaimState: "not_assessed",
    externalUseAllowed: false,
    coveragePromotionAllowed: false,
  }) as SearchRunEvent;
}

function candidateFixture(run = runFixture()): DiscoveryCandidateEvent {
  const discoveredAt = new Date(
    (Date.parse(run.startedAt) + Date.parse(run.endedAt)) / 2,
  ).toISOString();
  const recordedAt = new Date(
    Date.parse(run.recordedAt) + 60_000,
  ).toISOString();
  return sealDiscoveryResultEvent({
    schemaVersion: SOURCE_DISCOVERY_SCHEMA_VERSION,
    eventId: "result.event.candidate.official.report.v1",
    sequence: 0,
    predecessorEventSha256: null,
    recordedAt,
    externalUseAllowed: false,
    coveragePromotionAllowed: false,
    coverageClaimState: "not_assessed",
    recordType: "discovery_candidate_recorded",
    candidateId: run.candidateIds[0]!,
    searchRunId: run.runId,
    searchRunEventSha256: run.eventSha256,
    profileId: run.profileId,
    aggregationClass: run.aggregationClass,
    universeCellIds: [...run.universeCellIds],
    locator: {
      kind: "https_url",
      value: "https://authority.example/reports/food-system-report.pdf",
    },
    candidateTitle: "Official food-system report",
    sourceClass: run.sourceClass,
    languageCodes: [run.query.languageCode!],
    searchLanguageRelation: {
      state: "includes_search_language",
      statement: null,
    },
    identifiers: [{ kind: "catalogue_id", value: "official-report-2026" }],
    discoveredAt,
    originatingSource: null,
    deduplication: {
      state: "unique_locator",
      groupingKeySha256: null,
      relatedCandidateIds: [],
      automaticMergeAllowed: false,
    },
    discoveryState: "candidate_only",
    snippetPolicy: "not_retained_as_claim",
    acquisitionState: "not_formally_received",
  }) as DiscoveryCandidateEvent;
}

function formalSourceFixture(
  candidate = candidateFixture(),
  acquisitionReceipt: FormalSourceReceivedEvent["acquisitionReceipt"] = {
    receiptId: "receipt.source.acquisition.official.report",
    receiptVersion: "1.0.0",
    receiptType: "controlled_https_fetch",
    receiptPath:
      "knowledge/corpus/source-acquisition-receipts/receipts/official-report.json",
    receiptFileSha256: HASH.c!,
    receiptSha256: HASH.d!,
    rawContentSha256: HASH.e!,
    rawContentSizeBytes: 4096,
  },
): FormalSourceReceivedEvent {
  const recordedAt = new Date(
    Date.parse(candidate.recordedAt) + 2 * 60_000,
  ).toISOString();
  const receivedAt = new Date(
    Date.parse(candidate.recordedAt) + 60_000,
  ).toISOString();
  return sealDiscoveryResultEvent({
    schemaVersion: SOURCE_DISCOVERY_SCHEMA_VERSION,
    eventId: "result.event.formal.official.report.v1",
    sequence: 1,
    predecessorEventSha256: candidate.eventSha256,
    recordedAt,
    externalUseAllowed: false,
    coveragePromotionAllowed: false,
    coverageClaimState: "not_assessed",
    recordType: "formal_source_received",
    formalReceiptId: "formal.receipt.official.report.v1",
    candidateId: candidate.candidateId,
    candidateEventSha256: candidate.eventSha256,
    candidateAcquisitionBinding: {
      candidateLocator: structuredClone(candidate.locator),
      method: "exact_requested_locator",
    },
    receivedAt,
    acquisitionReceipt,
    formalSourceState: "received_not_registered",
    databaseRegistrationState: "not_registered",
    registeredSourceId: null,
    identityVerificationState: "not_started",
  }) as FormalSourceReceivedEvent;
}

function completionAssessmentFixture(input: {
  plan: SearchPlanEvent;
  runs: SearchRunEvent[];
  resultState?: SearchCompletionAssessmentEvent["resultState"];
}): SearchCompletionAssessmentEvent {
  const resultState = input.resultState ?? "stopping_rule_met";
  const predecessor = input.runs.at(-1)!;
  const sequence = predecessor.sequence + 1;
  const recordedAt = new Date(
    Date.parse(predecessor.recordedAt) + 10 * 60_000,
  ).toISOString();
  return sealSearchQueryEvent({
    schemaVersion: SOURCE_DISCOVERY_SCHEMA_VERSION,
    eventId: `query.event.assessment.${input.plan.profileId === SAPMI_DISCOVERY_PROFILE_ID ? "sapmi" : "political"}.v1`,
    sequence,
    predecessorEventSha256: predecessor.eventSha256,
    recordedAt,
    recordType: "search_completion_assessed",
    assessmentId: `search.assessment.${input.plan.profileId === SAPMI_DISCOVERY_PROFILE_ID ? "sapmi" : "political"}.v1`,
    planId: input.plan.planId,
    planVersion: input.plan.planVersion,
    planEventSha256: input.plan.eventSha256,
    universeId: input.plan.universeId,
    universeVersion: input.plan.universeVersion,
    profileId: input.plan.profileId,
    aggregationClass: input.plan.aggregationClass,
    universeCellIds: [...input.plan.universeCellIds],
    runBindings: input.runs.map((run) => ({
      runId: run.runId,
      runEventSha256: run.eventSha256,
    })),
    assessor: {
      executorType: "deterministic_tool",
      executorId: "assessor.discovery.contract",
      toolOrInterface: "Exact search-obligation assessor",
      toolVersion: "1.0.0",
      authenticationBoundary: "controlled_private_read_only",
    },
    assessedAt: new Date(Date.parse(recordedAt) - 60_000).toISOString(),
    resultState,
    limitations:
      resultState === "stopping_rule_met"
        ? []
        : ["One or more exact search obligations remain incomplete."],
    nextActions:
      resultState === "stopping_rule_met"
        ? []
        : ["Complete every missing exact search obligation."],
    executionEvidenceState: "derived_from_exact_bound_runs",
    formalSourceState: "none_implied_by_assessment",
    coverageClaimState: "not_assessed",
    externalUseAllowed: false,
    coveragePromotionAllowed: false,
  }) as SearchCompletionAssessmentEvent;
}

function completedRunsForPlan(plan: SearchPlanEvent): SearchRunEvent[] {
  const runs: SearchRunEvent[] = [];
  let predecessorEventSha256 = plan.eventSha256;
  for (const [obligationIndex] of plan.searchObligations.entries()) {
    const run = runFixture({
      plan,
      obligationIndex,
      sequence: obligationIndex + 1,
      predecessorEventSha256,
      candidateIds: [],
      resultState: "completed",
    });
    runs.push(run);
    predecessorEventSha256 = run.eventSha256;
  }
  return runs;
}

function summaryFixture() {
  return sealSourceDiscoverySummary({
    schemaVersion: SOURCE_DISCOVERY_SCHEMA_VERSION,
    recordType: "source_discovery_summary",
    universeVersion: SOURCE_DISCOVERY_UNIVERSE_VERSION,
    ontology: POLITICAL_CELL.ontology,
    counts: {
      plannedPoliticalCells: POLITICAL_DISCOVERY_CELL_COUNT,
      plannedSapmiCells: SAPMI_DISCOVERY_CELL_COUNT,
      plannedCellTotal:
        POLITICAL_DISCOVERY_CELL_COUNT + SAPMI_DISCOVERY_CELL_COUNT,
      registeredSearchPlans: 0,
      executedSearchRuns: 0,
      cellsReferencedByExecutedSearches: 0,
      discoveryCandidates: 0,
      formallyReceivedSources: 0,
      coverageClaims: 0,
    },
    semantics: {
      plannedCellsAreExecutedSearches: false,
      executedSearchesAreCandidates: false,
      candidatesAreFormallyReceivedSources: false,
      formallyReceivedSourcesAreCoverage: false,
      politicalAndSapmiAreAdditive: false,
    },
  });
}

function assertStructuralParity(value: unknown, expected: boolean): void {
  assert.equal(sourceDiscoveryRecordSchema.safeParse(value).success, expected);
  assert.equal(
    Boolean(validateJsonSchema(value)),
    expected,
    JSON.stringify(validateJsonSchema.errors),
  );
}

function jsonLines(events: unknown[]): string {
  return events.length === 0
    ? ""
    : `${events.map((event) => canonicalDiscoveryJson(event as DiscoveryJsonValue)).join("\n")}\n`;
}

function unsealQuery<T extends SearchQueryLedgerEvent>(
  event: T,
): Omit<T, "eventSha256"> {
  const { eventSha256: _seal, ...body } = event;
  return body;
}

function unsealResult<T extends DiscoveryResultLedgerEvent>(
  event: T,
): Omit<T, "eventSha256"> {
  const { eventSha256: _seal, ...body } = event;
  return body;
}

test("builds the exact deterministic political and separate Sápmi universes", () => {
  const repeated = buildSourceDiscoveryUniverse({
    ontologyBytes: ONTOLOGY_BYTES,
  });
  assert.equal(UNIVERSE.length, 6831);
  assert.equal(
    UNIVERSE.filter((cell) => cell.profileId === POLITICAL_DISCOVERY_PROFILE_ID)
      .length,
    POLITICAL_DISCOVERY_CELL_COUNT,
  );
  assert.equal(
    UNIVERSE.filter((cell) => cell.profileId === SAPMI_DISCOVERY_PROFILE_ID)
      .length,
    SAPMI_DISCOVERY_CELL_COUNT,
  );
  assert.equal(
    new Set(UNIVERSE.map((cell) => cell.cellId)).size,
    UNIVERSE.length,
  );
  assert.deepEqual(
    UNIVERSE.map((cell) => cell.cellSha256),
    repeated.map((cell) => cell.cellSha256),
  );
  assert.deepEqual(
    new Set(
      UNIVERSE.filter(
        (cell) => cell.profileId === POLITICAL_DISCOVERY_PROFILE_ID,
      ).map((cell) => cell.geographyId),
    ),
    new Set([
      "geo.no",
      "geo.se",
      "geo.dk",
      "geo.fi",
      "geo.is",
      "geo.fo",
      "geo.gl",
      "geo.ax",
    ]),
  );
  assert.deepEqual(
    new Set(
      UNIVERSE.filter(
        (cell) => cell.profileId === SAPMI_DISCOVERY_PROFILE_ID,
      ).map((cell) => cell.geographyId),
    ),
    new Set(["geo.sapmi"]),
  );
  for (const cell of UNIVERSE) {
    assert.equal(cell.planningState, "planned");
    assert.equal(cell.searchState, "not_executed_in_universe_record");
    assert.equal(cell.coverageClaimState, "not_assessed");
    assert.equal(cell.coveragePromotionAllowed, false);
  }

  const empty = validateSourceDiscoveryBundle({
    universeCells: UNIVERSE,
    queryEvents: [],
    resultEvents: [],
  });
  assert.deepEqual(sourceDiscoveryCounts(empty), {
    plannedPoliticalCells: 6072,
    plannedSapmiCells: 759,
    registeredSearchPlans: 0,
    executedSearchRuns: 0,
    cellsReferencedByExecutedSearches: 0,
    discoveryCandidates: 0,
    formallyReceivedSources: 0,
    coverageClaims: 0,
  });

  const replacedCell = POLITICAL_CELL;
  const { cellSha256: _cellSeal, ...unsealedCell } = replacedCell;
  const tamperedUniverse = UNIVERSE.map((cell) =>
    cell.cellId === replacedCell.cellId
      ? sealDiscoveryUniverseCell({
          ...unsealedCell,
          geographyId: "geo.invented",
          cellId: discoveryCellId({
            profileId: replacedCell.profileId,
            geographyId: "geo.invented",
            valueChainStageId: replacedCell.valueChainStageId,
            analyticalDomainId: replacedCell.analyticalDomainId,
          }),
        })
      : cell,
  );
  assert.throws(
    () =>
      validateSourceDiscoveryBundle({
        universeCells: tamperedUniverse,
        queryEvents: [],
        resultEvents: [],
      }),
    /canonical Cartesian set/,
  );
});

test("keeps Zod and JSON Schema structural validation in parity", () => {
  const plan = planFixture();
  const run = runFixture({ plan });
  const completedRuns = completedRunsForPlan(plan);
  const assessment = completionAssessmentFixture({
    plan,
    runs: completedRuns,
  });
  const candidate = candidateFixture(run);
  const formal = formalSourceFixture(candidate);
  for (const record of [
    POLITICAL_CELL,
    SAPMI_CELL,
    plan,
    run,
    assessment,
    candidate,
    formal,
    summaryFixture(),
  ]) {
    assertStructuralParity(record, true);
  }

  const unknown = structuredClone(plan) as unknown as Record<string, unknown>;
  unknown.untrackedCompletion = true;
  assertStructuralParity(unknown, false);

  const falseCoverage = structuredClone(candidate) as unknown as Record<
    string,
    unknown
  >;
  falseCoverage.coveragePromotionAllowed = true;
  assertStructuralParity(falseCoverage, false);

  for (const invalidDateTime of [
    "2016-12-31T23:59:60Z",
    "2026-08-03T24:00:00Z",
    "2026-02-30T10:00:00Z",
  ]) {
    const invalid = structuredClone(plan);
    invalid.recordedAt = invalidDateTime;
    assertStructuralParity(invalid, false);
  }
});

test("separates plans, executed runs, candidates, formal receipts and coverage counts", () => {
  const plan = planFixture();
  const plannedOnly = validateSourceDiscoveryBundle({
    universeCells: UNIVERSE,
    queryEvents: [plan],
    resultEvents: [],
  });
  assert.deepEqual(sourceDiscoveryCounts(plannedOnly), {
    plannedPoliticalCells: 6072,
    plannedSapmiCells: 759,
    registeredSearchPlans: 1,
    executedSearchRuns: 0,
    cellsReferencedByExecutedSearches: 0,
    discoveryCandidates: 0,
    formallyReceivedSources: 0,
    coverageClaims: 0,
  });

  const run = runFixture({ plan });
  const candidate = candidateFixture(run);
  const formal = formalSourceFixture(candidate);
  const complete = validateSourceDiscoveryBundle({
    universeCells: UNIVERSE,
    queryEvents: [plan, run],
    resultEvents: [candidate, formal],
  });
  assert.throws(
    () => sourceDiscoveryCounts(complete),
    /before resolving and verifying every acquisition receipt/,
  );
  assert.equal(formal.databaseRegistrationState, "not_registered");
  assert.equal(formal.registeredSourceId, null);
  assert.equal(formal.identityVerificationState, "not_started");
  assert.equal(formal.coveragePromotionAllowed, false);
});

test("rejects false searched cells and broken, reordered or rewritten ledgers", () => {
  const falseSearched = structuredClone(POLITICAL_CELL) as unknown as Record<
    string,
    unknown
  >;
  falseSearched.searchState = "searched";
  assert.throws(
    () => validateDiscoveryUniverseCell(falseSearched),
    /searchState/,
  );

  const plan = planFixture();
  const run = runFixture({ plan });
  assert.doesNotThrow(() => validateSearchQueryLedger([plan, run]));
  assert.throws(
    () => validateSearchQueryLedger([run]),
    /sequence must start at zero/,
  );
  assert.throws(
    () => validateSearchQueryLedger([run, plan]),
    /sequence must start at zero/,
  );

  const rewrittenPlan = structuredClone(plan);
  rewrittenPlan.rules.inclusion = [
    "A rewritten rule that retains the stale event seal.",
  ];
  assert.throws(
    () => validateSearchQueryLedger([rewrittenPlan, run]),
    /seal does not match/,
  );
});

test("requires exact plan, run, candidate and formal-receipt bindings", () => {
  const plan = planFixture();
  const run = runFixture({ plan });
  const candidate = candidateFixture(run);
  const formal = formalSourceFixture(candidate);

  assert.throws(
    () => validateSearchQueryLedger([run]),
    /sequence must start at zero/,
  );
  assert.throws(
    () => validateDiscoveryResultLedger([candidate], []),
    /does not bind an exact recorded search run/,
  );
  assert.throws(
    () => validateDiscoveryResultLedger([formal], [plan, run]),
    /sequence must start at zero/,
  );
  assert.throws(
    () =>
      validateSourceDiscoveryBundle({
        universeCells: UNIVERSE,
        queryEvents: [plan, run],
        resultEvents: [],
      }),
    /candidate IDs do not exactly match/,
  );

  const wrongObligationRun = sealSearchQueryEvent({
    ...unsealQuery(run),
    sourceSystemLocator: "https://unrelated.example/search",
  }) as SearchRunEvent;
  assert.throws(
    () => validateSearchQueryLedger([plan, wrongObligationRun]),
    /does not bind its exact planned search obligation/,
  );
  assert.throws(
    () =>
      sealSearchQueryEvent({
        ...unsealQuery(run),
        candidateIds: ["candidate.one", "candidate.two"],
      }),
    /candidate count exceeds inspected result count/,
  );

  const wrongClassCandidate = sealDiscoveryResultEvent({
    ...unsealResult(candidate),
    sourceClass: "journal_article",
  }) as DiscoveryCandidateEvent;
  assert.throws(
    () => validateDiscoveryResultLedger([wrongClassCandidate], [plan, run]),
    /source class drift/,
  );

  const unexplainedLanguageCandidate = sealDiscoveryResultEvent({
    ...unsealResult(candidate),
    languageCodes: ["sv"],
  }) as DiscoveryCandidateEvent;
  assert.throws(
    () =>
      validateDiscoveryResultLedger(
        [unexplainedLanguageCandidate],
        [plan, run],
      ),
    /language relation does not explain/,
  );

  const secondFormal = sealDiscoveryResultEvent({
    ...unsealResult(formal),
    eventId: "result.event.formal.official.report.v2",
    sequence: 2,
    predecessorEventSha256: formal.eventSha256,
    recordedAt: "2026-08-03T10:14:00Z",
    formalReceiptId: "formal.receipt.official.report.v2",
    acquisitionReceipt: {
      ...formal.acquisitionReceipt,
      receiptId: "receipt.source.acquisition.official.report.v2",
      receiptVersion: "2.0.0",
      receiptFileSha256: HASH.f!,
      receiptSha256: HASH.g!,
    },
  }) as FormalSourceReceivedEvent;
  assert.throws(
    () =>
      validateDiscoveryResultLedger(
        [candidate, formal, secondFormal],
        [plan, run],
      ),
    /formally received candidate IDs must be unique/,
  );
});

test("requires every exact obligation and external Sápmi authorization before stopping", () => {
  const politicalPlan = planFixture();
  const politicalRuns = completedRunsForPlan(politicalPlan);
  const incompleteRuns = politicalRuns.slice(0, -1);
  const incompleteAssessment = completionAssessmentFixture({
    plan: politicalPlan,
    runs: incompleteRuns,
  });
  assert.throws(
    () =>
      validateSourceDiscoveryBundle({
        universeCells: UNIVERSE,
        queryEvents: [politicalPlan, ...incompleteRuns, incompleteAssessment],
        resultEvents: [],
      }),
    /before every exact search obligation/,
  );

  const completeAssessment = completionAssessmentFixture({
    plan: politicalPlan,
    runs: politicalRuns,
  });
  assert.doesNotThrow(() =>
    validateSourceDiscoveryBundle({
      universeCells: UNIVERSE,
      queryEvents: [politicalPlan, ...politicalRuns, completeAssessment],
      resultEvents: [],
    }),
  );

  const sapmiPlan = planFixture({
    cell: SAPMI_CELL,
    authorizationRecordedForSapmi: true,
  });
  const sapmiRuns = completedRunsForPlan(sapmiPlan);
  const sapmiAssessment = completionAssessmentFixture({
    plan: sapmiPlan,
    runs: sapmiRuns,
  });
  assert.throws(
    () =>
      validateSourceDiscoveryBundle({
        universeCells: UNIVERSE,
        queryEvents: [sapmiPlan, ...sapmiRuns, sapmiAssessment],
        resultEvents: [],
      }),
    /rights-holder authorization is externally verified/,
  );
});

const GENERATOR_INPUTS = [
  ONTOLOGY_PATH,
  "knowledge/corpus/SOURCE-DISCOVERY-PROTOCOL.md",
  "knowledge/corpus/SOURCE-DISCOVERY-CONTRACT.md",
  "knowledge/schema/source-discovery.schema.v1.json",
  "src/lib/knowledge/source-acquisition-receipt.ts",
  "src/lib/knowledge/source-discovery.ts",
  "scripts/knowledge/generate-source-discovery-universe.ts",
];

function generatorFixtureRoot(t: test.TestContext): string {
  const root = mkdtempSync(join(tmpdir(), "source-discovery-generator-"));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  for (const path of GENERATOR_INPUTS) {
    const target = join(root, path);
    mkdirSync(dirname(target), { recursive: true });
    cpSync(path, target);
  }
  return root;
}

test("writes deterministic artifacts while preserving append-only ledger bytes", (t) => {
  const root = generatorFixtureRoot(t);
  const first = writeSourceDiscoveryArtifacts(root);
  assert.equal(first.summary.counts.plannedPoliticalCells, 6072);
  assert.equal(first.summary.counts.plannedSapmiCells, 759);
  assert.equal(first.summary.counts.executedSearchRuns, 0);
  assert.equal(first.summary.counts.coverageClaims, 0);
  assert.equal(
    readFileSync(join(root, SOURCE_DISCOVERY_PATHS.queryLedger), "utf8"),
    "",
  );
  assert.equal(
    readFileSync(join(root, SOURCE_DISCOVERY_PATHS.resultLedger), "utf8"),
    "",
  );
  assert.deepEqual(
    readdirSync(join(root, SOURCE_DISCOVERY_PATHS.root)).sort(),
    [
      SOURCE_DISCOVERY_PATHS.generationManifest,
      SOURCE_DISCOVERY_PATHS.queryLedger,
      SOURCE_DISCOVERY_PATHS.resultLedger,
      SOURCE_DISCOVERY_PATHS.summary,
      SOURCE_DISCOVERY_PATHS.universe,
    ]
      .map((path) => path.split("/").at(-1)!)
      .sort(),
  );
  assert.doesNotThrow(() => checkSourceDiscoveryArtifacts(root));

  const plan = planFixture();
  const planBytes = jsonLines([plan]);
  writeFileSync(join(root, SOURCE_DISCOVERY_PATHS.queryLedger), planBytes);
  const planned = writeSourceDiscoveryArtifacts(root);
  assert.equal(
    readFileSync(join(root, SOURCE_DISCOVERY_PATHS.queryLedger), "utf8"),
    planBytes,
  );
  assert.equal(planned.summary.counts.registeredSearchPlans, 1);
  assert.equal(planned.summary.counts.executedSearchRuns, 0);
  assert.equal(planned.summary.counts.cellsReferencedByExecutedSearches, 0);

  const run = runFixture({ plan, candidateIds: [] });
  const executedBytes = jsonLines([plan, run]);
  writeFileSync(join(root, SOURCE_DISCOVERY_PATHS.queryLedger), executedBytes);
  const executed = writeSourceDiscoveryArtifacts(root);
  assert.equal(
    readFileSync(join(root, SOURCE_DISCOVERY_PATHS.queryLedger), "utf8"),
    executedBytes,
  );
  assert.equal(executed.summary.counts.executedSearchRuns, 1);
  assert.equal(executed.summary.counts.cellsReferencedByExecutedSearches, 1);
  assert.equal(executed.summary.counts.discoveryCandidates, 0);
  assert.equal(executed.summary.counts.coverageClaims, 0);
  assert.doesNotThrow(() => checkSourceDiscoveryArtifacts(root));

  writeFileSync(join(root, SOURCE_DISCOVERY_PATHS.queryLedger), planBytes);
  assert.throws(
    () => writeSourceDiscoveryArtifacts(root),
    /truncated instead of appended/,
  );

  const rewrittenPlan = sealSearchQueryEvent({
    ...unsealQuery(plan),
    rules: {
      ...plan.rules,
      inclusion: [
        "A different valid inclusion rule that changes anchored history.",
      ],
    },
  }) as SearchPlanEvent;
  const rewrittenRun = runFixture({ plan: rewrittenPlan, candidateIds: [] });
  writeFileSync(
    join(root, SOURCE_DISCOVERY_PATHS.queryLedger),
    jsonLines([rewrittenPlan, rewrittenRun]),
  );
  assert.throws(
    () => writeSourceDiscoveryArtifacts(root),
    /rewrote bytes before the append boundary/,
  );

  unlinkSync(join(root, SOURCE_DISCOVERY_PATHS.generationManifest));
  assert.throws(
    () => writeSourceDiscoveryArtifacts(root),
    /cannot adopt non-empty append-only ledgers without a prior generation manifest anchor/,
  );
});

test("resolves and verifies the exact acquisition receipt behind a formal source", (t) => {
  const root = generatorFixtureRoot(t);
  const plan = planFixture();
  const run = runFixture({ plan });
  const candidate = candidateFixture(run);
  const receipt = sealSourceAcquisitionReceipt({
    schemaVersion: "source-acquisition-receipt-v1",
    artifactType: "source_acquisition_receipt",
    receiptId: "receipt.source.acquisition.official.report",
    receiptVersion: "1.0.0",
    sourceId: "source.official.report",
    acquisitionType: "controlled_https_fetch",
    requestedLocator:
      "https://authority.example/reports/food-system-report.pdf",
    finalLocator: "https://authority.example/reports/food-system-report.pdf",
    request: {
      method: "GET",
      redirectMode: "manual",
      credentialsMode: "omit",
      maximumRedirects: 5,
    },
    redirectChain: [],
    response: {
      status: 200,
      contentType: "application/pdf",
      contentLengthBytes: 4096,
      bodySizeBytes: 4096,
      bodySha256: HASH.e!,
      observedAt: "2026-08-03T10:12:00Z",
    },
    tool: {
      name: "controlled-source-fetch",
      version: "1.0.0",
      workflowRef: "workflow.source.acquisition.https",
      workflowVersion: "1.0.0",
    },
    startedAt: "2026-08-03T10:11:00Z",
    completedAt: "2026-08-03T10:12:00Z",
  });
  const receiptPath =
    "knowledge/corpus/source-acquisition-receipts/receipts/official-report.json";
  const receiptContent = `${JSON.stringify(receipt, null, 2)}\n`;
  if (receipt.acquisitionType !== "controlled_https_fetch") {
    throw new Error(
      "HTTPS acquisition fixture returned the wrong receipt type",
    );
  }
  const receiptTarget = join(root, receiptPath);
  mkdirSync(dirname(receiptTarget), { recursive: true });
  writeFileSync(receiptTarget, receiptContent);
  const formal = formalSourceFixture(candidate, {
    receiptId: receipt.receiptId,
    receiptVersion: receipt.receiptVersion,
    receiptType: receipt.acquisitionType,
    receiptPath,
    receiptFileSha256: discoverySha256(receiptContent),
    receiptSha256: receipt.receiptSha256,
    rawContentSha256: receipt.response.bodySha256,
    rawContentSizeBytes: receipt.response.bodySizeBytes,
  });
  const queryLedgerContent = jsonLines([plan, run]);
  const resultLedgerContent = jsonLines([candidate, formal]);

  const generated = generateSourceDiscoveryArtifacts({
    repositoryRoot: root,
    queryLedgerContent,
    resultLedgerContent,
  });
  assert.equal(generated.summary.counts.formallyReceivedSources, 1);
  assert.equal(generated.summary.counts.coverageClaims, 0);

  const verifiedBundle = validateSourceDiscoveryBundleWithReceipts(
    {
      universeCells: UNIVERSE,
      queryEvents: [plan, run],
      resultEvents: [candidate, formal],
    },
    (path) => {
      assert.equal(path, receiptPath);
      return Buffer.from(receiptContent, "utf8");
    },
  );
  assert.equal(
    sourceDiscoveryCounts(verifiedBundle).formallyReceivedSources,
    1,
  );
  verifiedBundle.resultEvents.push(formal);
  assert.throws(
    () => sourceDiscoveryCounts(verifiedBundle),
    /before resolving and verifying every acquisition receipt/,
  );

  const { receiptSha256: _receiptSeal, ...unsealedReceipt } = receipt;
  const unrelatedReceipt = sealSourceAcquisitionReceipt({
    ...unsealedReceipt,
    requestedLocator: "https://unrelated.example/unrelated.pdf",
    finalLocator: "https://unrelated.example/unrelated.pdf",
  });
  if (unrelatedReceipt.acquisitionType !== "controlled_https_fetch") {
    throw new Error("Unrelated HTTPS fixture returned the wrong receipt type");
  }
  const unrelatedReceiptContent = `${JSON.stringify(unrelatedReceipt, null, 2)}\n`;
  const unrelatedFormal = formalSourceFixture(candidate, {
    receiptId: unrelatedReceipt.receiptId,
    receiptVersion: unrelatedReceipt.receiptVersion,
    receiptType: unrelatedReceipt.acquisitionType,
    receiptPath,
    receiptFileSha256: discoverySha256(unrelatedReceiptContent),
    receiptSha256: unrelatedReceipt.receiptSha256,
    rawContentSha256: unrelatedReceipt.response.bodySha256,
    rawContentSizeBytes: unrelatedReceipt.response.bodySizeBytes,
  });
  assert.throws(
    () =>
      validateSourceDiscoveryBundleWithReceipts(
        {
          universeCells: UNIVERSE,
          queryEvents: [plan, run],
          resultEvents: [candidate, unrelatedFormal],
        },
        () => Buffer.from(unrelatedReceiptContent, "utf8"),
      ),
    /did not acquire its bound candidate locator/,
  );

  writeFileSync(receiptTarget, `${receiptContent}\n`);
  assert.throws(
    () =>
      generateSourceDiscoveryArtifacts({
        repositoryRoot: root,
        queryLedgerContent,
        resultLedgerContent,
      }),
    /receipt file hash is stale/,
  );

  const receiptWithStaleSeal = structuredClone(receipt);
  receiptWithStaleSeal.completedAt = "2026-08-03T10:13:00Z";
  const staleSealContent = `${JSON.stringify(receiptWithStaleSeal, null, 2)}\n`;
  writeFileSync(receiptTarget, staleSealContent);
  const staleFormal = formalSourceFixture(candidate, {
    ...formal.acquisitionReceipt,
    receiptFileSha256: discoverySha256(staleSealContent),
  });
  assert.throws(
    () =>
      generateSourceDiscoveryArtifacts({
        repositoryRoot: root,
        queryLedgerContent,
        resultLedgerContent: jsonLines([candidate, staleFormal]),
      }),
    /receipt hash does not match/,
  );
});

test("generator output is byte-deterministic and declares no network or DB work", () => {
  const first = generateSourceDiscoveryArtifacts({
    repositoryRoot: process.cwd(),
    queryLedgerContent: "",
    resultLedgerContent: "",
  });
  const second = generateSourceDiscoveryArtifacts({
    repositoryRoot: process.cwd(),
    queryLedgerContent: "",
    resultLedgerContent: "",
  });
  assert.deepEqual(first.contents, second.contents);
  assert.deepEqual(first.generationManifest, second.generationManifest);
  assert.deepEqual(first.generationManifest.semantics, {
    networkAccessPerformed: false,
    databaseMutationPerformed: false,
    plannedCellsAreExecutedSearches: false,
    emptyLedgersImplyCoverage: false,
    ledgersAreAppendOnlyInputs: true,
  });
});
