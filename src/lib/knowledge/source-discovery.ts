import { createHash } from "node:crypto";

import { z } from "zod";

import {
  sourceAcquisitionContent,
  validateSourceAcquisitionReceipt,
} from "./source-acquisition-receipt";

export const SOURCE_DISCOVERY_SCHEMA_VERSION = "source-discovery-v1" as const;
export const SOURCE_DISCOVERY_UNIVERSE_VERSION = "1.0.0" as const;
export const POLITICAL_DISCOVERY_PROFILE_ID =
  "profile.canonical_political_macro" as const;
export const SAPMI_DISCOVERY_PROFILE_ID =
  "profile.canonical_sapmi_overlap_macro" as const;
export const POLITICAL_DISCOVERY_CELL_COUNT = 6_072 as const;
export const SAPMI_DISCOVERY_CELL_COUNT = 759 as const;
export const SOURCE_DISCOVERY_ONTOLOGY_ID = "fs26.nordic_food_system" as const;
export const SOURCE_DISCOVERY_ONTOLOGY_VERSION = "1.0.0" as const;
export const SOURCE_DISCOVERY_ONTOLOGY_FILE_SHA256 =
  "sha256:2ff71bffefe413e8e467be932c2212e3229182fe86fb25caee1f329d8d3b0c68" as const;
export const SOURCE_DISCOVERY_CELL_ID_SET_SHA256 =
  "sha256:5ff9fa8a261f81497cae13bfd797c26b67ebf19e20e1537d7a868a30a9cc7d6e" as const;

export const DISCOVERY_SEARCH_ROUTES = [
  "official_institution_navigation",
  "public_registry_catalogue",
  "research_repository",
  "bibliographic_database",
  "sector_and_civil_society",
  "subnational_territorial_cross_border",
  "document_reference_expansion",
  "multilingual_search",
  "rights_holder_led",
] as const;

const HASH_PATTERN = /^sha256:[a-f0-9]{64}$/;
const IDENTIFIER_PATTERN = /^[a-z0-9][a-z0-9._:-]*$/;
const VERSION_PATTERN = /^\d+\.\d+\.\d+(?:-[a-z0-9.-]+)?$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const DATE_TIME_PATTERN =
  /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/;
const CELL_ID_PATTERN =
  /^discovery\.v1\.profile=[a-z0-9._-]+\.geo=[a-z0-9._-]+\.stage=[a-z0-9._-]+\.domain=[a-z0-9._-]+$/;
const PRIVATE_LOCATOR_PATTERN = /^private:\/\/[a-z0-9][a-z0-9._:/-]*$/;
const ACQUISITION_RECEIPT_PATH_PATTERN =
  /^knowledge\/corpus\/source-acquisition-receipts\/receipts\/[a-z0-9][a-z0-9._-]*\.json$/;

const discoveryUniverseIdSchema = z.enum([
  "source-discovery.political-nordic-macro.v1",
  "source-discovery.sapmi-overlap-macro.v1",
]);

const sha256Schema = z.string().regex(HASH_PATTERN);
const identifierSchema = z.string().regex(IDENTIFIER_PATTERN);
const versionSchema = z.string().regex(VERSION_PATTERN);
const cellIdSchema = z.string().regex(CELL_ID_PATTERN);
const dateSchema = z
  .string()
  .regex(DATE_PATTERN)
  .refine((value) => {
    const parsed = new Date(`${value}T00:00:00Z`);
    return (
      Number.isFinite(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === value
    );
  }, "Expected a real calendar date");
const dateTimeSchema = z
  .string()
  .regex(DATE_TIME_PATTERN)
  .refine((value) => {
    const calendarDate = value.slice(0, 10);
    const parsedCalendarDate = new Date(`${calendarDate}T00:00:00Z`);
    return (
      Number.isFinite(Date.parse(value)) &&
      Number.isFinite(parsedCalendarDate.getTime()) &&
      parsedCalendarDate.toISOString().slice(0, 10) === calendarDate
    );
  }, "Expected a real ISO 8601 date-time with an explicit UTC offset");
const httpsLocatorSchema = z.string().url().startsWith("https://");
const mediumTextSchema = z.string().min(10).max(2_000);

const ontologyBindingSchema = z
  .object({
    ontologyId: identifierSchema,
    ontologyVersion: versionSchema,
    ontologyPath: z.literal(
      "knowledge/schema/nordic-food-system-ontology.v1.json",
    ),
    ontologyFileSha256: sha256Schema,
  })
  .strict();

export const discoveryUniverseCellSchema = z
  .object({
    schemaVersion: z.literal(SOURCE_DISCOVERY_SCHEMA_VERSION),
    recordType: z.literal("discovery_universe_cell"),
    universeId: discoveryUniverseIdSchema,
    universeVersion: versionSchema,
    profileId: z.enum([
      POLITICAL_DISCOVERY_PROFILE_ID,
      SAPMI_DISCOVERY_PROFILE_ID,
    ]),
    aggregationClass: z.enum(["political_nordic", "sapmi_overlapping"]),
    nonAdditiveWithOtherProfiles: z.literal(true),
    ontology: ontologyBindingSchema,
    cellId: cellIdSchema,
    geographyId: identifierSchema,
    valueChainStageId: identifierSchema,
    analyticalDomainId: identifierSchema,
    planningState: z.literal("planned"),
    searchState: z.literal("not_executed_in_universe_record"),
    candidateState: z.literal("none_recorded_in_universe_record"),
    formalSourceState: z.literal("none_recorded_in_universe_record"),
    coverageClaimState: z.literal("not_assessed"),
    rightsHolderGovernanceRequired: z.boolean(),
    externalUseAllowed: z.literal(false),
    coveragePromotionAllowed: z.literal(false),
    cellSha256: sha256Schema,
  })
  .strict();

const chainCore = {
  schemaVersion: z.literal(SOURCE_DISCOVERY_SCHEMA_VERSION),
  eventId: identifierSchema,
  sequence: z.number().int().nonnegative(),
  predecessorEventSha256: sha256Schema.nullable(),
  recordedAt: dateTimeSchema,
  eventSha256: sha256Schema,
};

const sourceSystemSchema = z
  .object({
    systemId: identifierSchema,
    systemClass: z.enum([
      "official_institution",
      "public_registry",
      "research_repository",
      "bibliographic_database",
      "sector_or_civil_society",
      "subnational_or_cross_border",
      "search_interface",
      "rights_holder_route",
      "other_declared",
    ]),
    name: z.string().min(1).max(500),
    locator: httpsLocatorSchema.nullable(),
  })
  .strict();

const searchRoutePlanSchema = z
  .object({
    routeId: z.enum(DISCOVERY_SEARCH_ROUTES),
    state: z.enum(["planned", "not_applicable"]),
    rationale: mediumTextSchema.nullable(),
  })
  .strict();

const searchObligationSchema = z
  .object({
    obligationId: identifierSchema,
    routeId: z.enum(DISCOVERY_SEARCH_ROUTES),
    sourceSystemId: identifierSchema,
    sourceClass: identifierSchema,
    languageCode: identifierSchema,
    universeCellId: cellIdSchema,
  })
  .strict();

const rightsHolderGovernanceSchema = z
  .object({
    routeAuthorityId: identifierSchema,
    consentRequired: z.literal(true),
    interpretationRouteRequired: z.literal(true),
    status: z.enum([
      "not_started",
      "engagement_active",
      "authorization_recorded_unverified",
    ]),
    authorizationReceiptSha256: sha256Schema.nullable(),
  })
  .strict();

export const searchPlanEventSchema = z
  .object({
    ...chainCore,
    recordType: z.literal("search_plan_registered"),
    planId: identifierSchema,
    planVersion: versionSchema,
    universeId: discoveryUniverseIdSchema,
    universeVersion: versionSchema,
    profileId: z.enum([
      POLITICAL_DISCOVERY_PROFILE_ID,
      SAPMI_DISCOVERY_PROFILE_ID,
    ]),
    aggregationClass: z.enum(["political_nordic", "sapmi_overlapping"]),
    universeCellIds: z.array(cellIdSchema).min(1),
    ontology: ontologyBindingSchema,
    sourceSystems: z.array(sourceSystemSchema).min(1),
    sourceClasses: z.array(identifierSchema).min(1),
    languageCodes: z.array(identifierSchema).min(1),
    timeRange: z
      .object({
        from: dateSchema.nullable(),
        to: dateSchema.nullable(),
        undatedIncluded: z.boolean(),
      })
      .strict(),
    updateCadence: z
      .object({
        cadence: z.enum([
          "one_time",
          "monthly",
          "quarterly",
          "semiannual",
          "annual",
          "event_driven",
        ]),
        repeatNoLaterThan: dateSchema,
      })
      .strict(),
    routes: z
      .array(searchRoutePlanSchema)
      .length(DISCOVERY_SEARCH_ROUTES.length),
    searchObligations: z.array(searchObligationSchema).min(1),
    rules: z
      .object({
        inclusion: z.array(mediumTextSchema).min(1),
        exclusion: z.array(mediumTextSchema).min(1),
        deduplication: z.array(mediumTextSchema).min(1),
        stopping: z.array(mediumTextSchema).min(1),
      })
      .strict(),
    knownBarriers: z.array(
      z
        .object({
          barrierType: z.enum([
            "access",
            "rights",
            "language",
            "technical",
            "governance",
          ]),
          statement: mediumTextSchema,
        })
        .strict(),
    ),
    rightsHolderGovernance: rightsHolderGovernanceSchema.nullable(),
    executionState: z.literal("planned_not_executed"),
    candidateState: z.literal("none_implied_by_plan"),
    formalSourceState: z.literal("none_implied_by_plan"),
    coverageClaimState: z.literal("not_assessed"),
    externalUseAllowed: z.literal(false),
    coveragePromotionAllowed: z.literal(false),
  })
  .strict();

const routeExecutionSchema = z
  .object({
    routeId: z.enum(DISCOVERY_SEARCH_ROUTES),
    state: z.enum(["completed", "partial", "blocked"]),
    pagesOrSegmentsInspected: z.number().int().nonnegative(),
    limitation: mediumTextSchema.nullable(),
  })
  .strict();

const searchQuerySchema = z
  .object({
    method: z.enum([
      "query",
      "filter",
      "api",
      "catalogue_navigation",
      "manual_navigation",
      "citation_chaining",
    ]),
    exactQuery: z.string().min(1).max(4_000).nullable(),
    requestedLocator: httpsLocatorSchema.nullable(),
    filters: z.array(z.string().min(1).max(1_000)),
    sortOrder: z.string().min(1).max(500).nullable(),
    languageCode: identifierSchema.nullable(),
    pagination: z
      .object({
        fromPageOrCursor: z.string().min(1).max(500).nullable(),
        toPageOrCursor: z.string().min(1).max(500).nullable(),
        completeForDeclaredRoute: z.boolean(),
      })
      .strict(),
  })
  .strict();

const searchExecutorSchema = z
  .object({
    executorType: z.enum(["named_human", "ai_assisted", "deterministic_tool"]),
    executorId: identifierSchema,
    toolOrInterface: z.string().min(1).max(500),
    toolVersion: z.string().min(1).max(200),
    authenticationBoundary: z.enum([
      "public_unauthenticated",
      "authenticated_read_only",
      "controlled_private_read_only",
    ]),
  })
  .strict();

export const searchRunEventSchema = z
  .object({
    ...chainCore,
    recordType: z.literal("search_run_recorded"),
    runId: identifierSchema,
    planId: identifierSchema,
    planVersion: versionSchema,
    planEventSha256: sha256Schema,
    universeId: discoveryUniverseIdSchema,
    universeVersion: versionSchema,
    profileId: z.enum([
      POLITICAL_DISCOVERY_PROFILE_ID,
      SAPMI_DISCOVERY_PROFILE_ID,
    ]),
    aggregationClass: z.enum(["political_nordic", "sapmi_overlapping"]),
    universeCellIds: z.array(cellIdSchema).min(1),
    obligationId: identifierSchema,
    sourceSystemId: identifierSchema,
    sourceSystemLocator: httpsLocatorSchema.nullable(),
    sourceClass: identifierSchema,
    executor: searchExecutorSchema,
    startedAt: dateTimeSchema,
    endedAt: dateTimeSchema,
    query: searchQuerySchema,
    routeExecutions: z.array(routeExecutionSchema).length(1),
    observedResultCount: z.number().int().nonnegative(),
    inspectedResultCount: z.number().int().nonnegative(),
    reliableTotalExposed: z.boolean(),
    landingPagesInspected: z.array(httpsLocatorSchema),
    navigationPathsInspected: z.array(z.string().min(1).max(2_000)),
    candidateIds: z.array(identifierSchema),
    exclusions: z.array(
      z
        .object({
          locator: z.string().min(1).max(2_000),
          reason: z.enum([
            "duplicate",
            "out_of_scope",
            "wrong_geography",
            "wrong_period",
            "wrong_source_class",
            "inaccessible",
            "other_declared",
          ]),
          statement: mediumTextSchema,
        })
        .strict(),
    ),
    accessFailures: z.array(
      z
        .object({
          locator: z.string().min(1).max(2_000),
          failureType: z.enum([
            "access_denied",
            "robots_excluded",
            "unavailable",
            "authentication_required",
            "technical_failure",
            "applicability_unresolved",
          ]),
          statement: mediumTextSchema,
        })
        .strict(),
    ),
    capturedResponseSha256s: z.array(sha256Schema),
    resultState: z.enum(["completed", "partial", "blocked"]),
    limitations: z.array(mediumTextSchema),
    nextActions: z.array(mediumTextSchema),
    repeatNoLaterThan: dateSchema,
    searchExecuted: z.literal(true),
    formalSourceState: z.literal("none_implied_by_search"),
    coverageClaimState: z.literal("not_assessed"),
    externalUseAllowed: z.literal(false),
    coveragePromotionAllowed: z.literal(false),
  })
  .strict();

export const searchCompletionAssessmentEventSchema = z
  .object({
    ...chainCore,
    recordType: z.literal("search_completion_assessed"),
    assessmentId: identifierSchema,
    planId: identifierSchema,
    planVersion: versionSchema,
    planEventSha256: sha256Schema,
    universeId: discoveryUniverseIdSchema,
    universeVersion: versionSchema,
    profileId: z.enum([
      POLITICAL_DISCOVERY_PROFILE_ID,
      SAPMI_DISCOVERY_PROFILE_ID,
    ]),
    aggregationClass: z.enum(["political_nordic", "sapmi_overlapping"]),
    universeCellIds: z.array(cellIdSchema).min(1),
    runBindings: z
      .array(
        z
          .object({
            runId: identifierSchema,
            runEventSha256: sha256Schema,
          })
          .strict(),
      )
      .min(1),
    assessor: searchExecutorSchema,
    assessedAt: dateTimeSchema,
    resultState: z.enum(["incomplete", "stopping_rule_met"]),
    limitations: z.array(mediumTextSchema),
    nextActions: z.array(mediumTextSchema),
    executionEvidenceState: z.literal("derived_from_exact_bound_runs"),
    formalSourceState: z.literal("none_implied_by_assessment"),
    coverageClaimState: z.literal("not_assessed"),
    externalUseAllowed: z.literal(false),
    coveragePromotionAllowed: z.literal(false),
  })
  .strict();

export const searchQueryLedgerEventSchema = z.discriminatedUnion("recordType", [
  searchPlanEventSchema,
  searchRunEventSchema,
  searchCompletionAssessmentEventSchema,
]);

const resultChainCore = {
  ...chainCore,
  externalUseAllowed: z.literal(false),
  coveragePromotionAllowed: z.literal(false),
  coverageClaimState: z.literal("not_assessed"),
};

const candidateLocatorSchema = z.discriminatedUnion("kind", [
  z
    .object({ kind: z.literal("https_url"), value: httpsLocatorSchema })
    .strict(),
  z
    .object({
      kind: z.literal("doi"),
      value: z.string().regex(/^10\.\d{4,9}\/.+$/),
    })
    .strict(),
  z
    .object({
      kind: z.literal("isbn"),
      value: z.string().regex(/^(?:97[89])?[0-9X-]{10,17}$/),
    })
    .strict(),
  z
    .object({
      kind: z.literal("private_locator"),
      value: z.string().regex(PRIVATE_LOCATOR_PATTERN),
    })
    .strict(),
  z
    .object({
      kind: z.literal("repository_record"),
      value: z.string().min(1).max(2_000),
    })
    .strict(),
  z
    .object({
      kind: z.literal("other_declared"),
      value: z.string().min(1).max(2_000),
    })
    .strict(),
]);

export const discoveryCandidateEventSchema = z
  .object({
    ...resultChainCore,
    recordType: z.literal("discovery_candidate_recorded"),
    candidateId: identifierSchema,
    searchRunId: identifierSchema,
    searchRunEventSha256: sha256Schema,
    profileId: z.enum([
      POLITICAL_DISCOVERY_PROFILE_ID,
      SAPMI_DISCOVERY_PROFILE_ID,
    ]),
    aggregationClass: z.enum(["political_nordic", "sapmi_overlapping"]),
    universeCellIds: z.array(cellIdSchema).min(1),
    locator: candidateLocatorSchema,
    candidateTitle: z.string().min(1).max(1_000),
    sourceClass: identifierSchema,
    languageCodes: z.array(identifierSchema),
    searchLanguageRelation: z
      .object({
        state: z.enum([
          "includes_search_language",
          "different_language_observed",
          "language_unresolved",
        ]),
        statement: mediumTextSchema.nullable(),
      })
      .strict(),
    identifiers: z.array(
      z
        .object({
          kind: z.enum([
            "doi",
            "isbn",
            "issn",
            "catalogue_id",
            "registry_id",
            "other_declared",
          ]),
          value: z.string().min(1).max(500),
        })
        .strict(),
    ),
    discoveredAt: dateTimeSchema,
    originatingSource: z
      .object({
        sourceId: identifierSchema,
        exactLocator: z.string().min(1).max(2_000),
        reason: mediumTextSchema,
      })
      .strict()
      .nullable(),
    deduplication: z
      .object({
        state: z.enum([
          "unassessed",
          "unique_locator",
          "possible_duplicate",
          "grouped_without_merge",
        ]),
        groupingKeySha256: sha256Schema.nullable(),
        relatedCandidateIds: z.array(identifierSchema),
        automaticMergeAllowed: z.literal(false),
      })
      .strict(),
    discoveryState: z.literal("candidate_only"),
    snippetPolicy: z.literal("not_retained_as_claim"),
    acquisitionState: z.literal("not_formally_received"),
  })
  .strict();

const acquisitionReceiptReferenceSchema = z
  .object({
    receiptId: identifierSchema,
    receiptVersion: versionSchema,
    receiptType: z.enum([
      "controlled_https_fetch",
      "controlled_private_access",
    ]),
    receiptPath: z.string().regex(ACQUISITION_RECEIPT_PATH_PATTERN),
    receiptFileSha256: sha256Schema,
    receiptSha256: sha256Schema,
    rawContentSha256: sha256Schema,
    rawContentSizeBytes: z.number().int().positive(),
  })
  .strict();

export const formalSourceReceivedEventSchema = z
  .object({
    ...resultChainCore,
    recordType: z.literal("formal_source_received"),
    formalReceiptId: identifierSchema,
    candidateId: identifierSchema,
    candidateEventSha256: sha256Schema,
    candidateAcquisitionBinding: z
      .object({
        candidateLocator: candidateLocatorSchema,
        method: z.enum([
          "exact_requested_locator",
          "exact_final_locator",
          "doi_https_resolution",
        ]),
      })
      .strict(),
    receivedAt: dateTimeSchema,
    acquisitionReceipt: acquisitionReceiptReferenceSchema,
    formalSourceState: z.literal("received_not_registered"),
    databaseRegistrationState: z.literal("not_registered"),
    registeredSourceId: z.null(),
    identityVerificationState: z.literal("not_started"),
  })
  .strict();

export const discoveryResultLedgerEventSchema = z.discriminatedUnion(
  "recordType",
  [discoveryCandidateEventSchema, formalSourceReceivedEventSchema],
);

export const sourceDiscoverySummarySchema = z
  .object({
    schemaVersion: z.literal(SOURCE_DISCOVERY_SCHEMA_VERSION),
    recordType: z.literal("source_discovery_summary"),
    universeVersion: versionSchema,
    ontology: ontologyBindingSchema,
    counts: z
      .object({
        plannedPoliticalCells: z.literal(POLITICAL_DISCOVERY_CELL_COUNT),
        plannedSapmiCells: z.literal(SAPMI_DISCOVERY_CELL_COUNT),
        plannedCellTotal: z.literal(
          POLITICAL_DISCOVERY_CELL_COUNT + SAPMI_DISCOVERY_CELL_COUNT,
        ),
        registeredSearchPlans: z.number().int().nonnegative(),
        executedSearchRuns: z.number().int().nonnegative(),
        cellsReferencedByExecutedSearches: z.number().int().nonnegative(),
        discoveryCandidates: z.number().int().nonnegative(),
        formallyReceivedSources: z.number().int().nonnegative(),
        coverageClaims: z.literal(0),
      })
      .strict(),
    semantics: z
      .object({
        plannedCellsAreExecutedSearches: z.literal(false),
        executedSearchesAreCandidates: z.literal(false),
        candidatesAreFormallyReceivedSources: z.literal(false),
        formallyReceivedSourcesAreCoverage: z.literal(false),
        politicalAndSapmiAreAdditive: z.literal(false),
      })
      .strict(),
    summarySha256: sha256Schema,
  })
  .strict();

export const sourceDiscoveryRecordSchema = z.union([
  discoveryUniverseCellSchema,
  searchQueryLedgerEventSchema,
  discoveryResultLedgerEventSchema,
  sourceDiscoverySummarySchema,
]);

export type DiscoveryUniverseCell = z.infer<typeof discoveryUniverseCellSchema>;
export type SearchPlanEvent = z.infer<typeof searchPlanEventSchema>;
export type SearchRunEvent = z.infer<typeof searchRunEventSchema>;
export type SearchCompletionAssessmentEvent = z.infer<
  typeof searchCompletionAssessmentEventSchema
>;
export type SearchQueryLedgerEvent = z.infer<
  typeof searchQueryLedgerEventSchema
>;
export type DiscoveryCandidateEvent = z.infer<
  typeof discoveryCandidateEventSchema
>;
export type FormalSourceReceivedEvent = z.infer<
  typeof formalSourceReceivedEventSchema
>;
export type DiscoveryResultLedgerEvent = z.infer<
  typeof discoveryResultLedgerEventSchema
>;
export type SourceDiscoverySummary = z.infer<
  typeof sourceDiscoverySummarySchema
>;

export type DiscoveryJsonValue =
  | null
  | boolean
  | number
  | string
  | DiscoveryJsonValue[]
  | { [key: string]: DiscoveryJsonValue };

function fail(message: string): never {
  throw new Error(`Source discovery failed: ${message}`);
}

export function canonicalDiscoveryJson(value: DiscoveryJsonValue): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalDiscoveryJson(item)).join(",")}]`;
  }
  return `{${Object.keys(value)
    .sort()
    .map(
      (key) =>
        `${JSON.stringify(key)}:${canonicalDiscoveryJson(value[key] as DiscoveryJsonValue)}`,
    )
    .join(",")}}`;
}

export function discoverySha256(value: string | Buffer): string {
  return `sha256:${createHash("sha256").update(value).digest("hex")}`;
}

function domainHash(domain: string, value: DiscoveryJsonValue): string {
  return discoverySha256(
    `food-systems-2026:source-discovery:${domain}:v1\0${canonicalDiscoveryJson(value)}`,
  );
}

function unique(values: string[], label: string): void {
  if (new Set(values).size !== values.length) fail(`${label} must be unique`);
}

function equal(left: unknown, right: unknown): boolean {
  return (
    canonicalDiscoveryJson(left as DiscoveryJsonValue) ===
    canonicalDiscoveryJson(right as DiscoveryJsonValue)
  );
}

export function sealDiscoveryUniverseCell(
  value: Omit<DiscoveryUniverseCell, "cellSha256">,
): DiscoveryUniverseCell {
  return validateDiscoveryUniverseCell({
    ...value,
    cellSha256: domainHash("universe-cell", value as DiscoveryJsonValue),
  });
}

export function validateDiscoveryUniverseCell(
  value: unknown,
): DiscoveryUniverseCell {
  const parsed = discoveryUniverseCellSchema.safeParse(value);
  if (!parsed.success)
    fail(
      parsed.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; "),
    );
  const cell = parsed.data;
  if (
    cell.universeVersion !== SOURCE_DISCOVERY_UNIVERSE_VERSION ||
    cell.ontology.ontologyId !== SOURCE_DISCOVERY_ONTOLOGY_ID ||
    cell.ontology.ontologyVersion !== SOURCE_DISCOVERY_ONTOLOGY_VERSION ||
    cell.ontology.ontologyFileSha256 !== SOURCE_DISCOVERY_ONTOLOGY_FILE_SHA256
  ) {
    fail("universe cell does not bind the canonical versioned ontology bytes");
  }
  const expectedPolitical = cell.profileId === POLITICAL_DISCOVERY_PROFILE_ID;
  if (
    expectedPolitical !== (cell.aggregationClass === "political_nordic") ||
    expectedPolitical !==
      (cell.universeId === "source-discovery.political-nordic-macro.v1") ||
    expectedPolitical === cell.rightsHolderGovernanceRequired
  ) {
    fail(
      "universe profile, aggregation class and governance boundary disagree",
    );
  }
  if (expectedPolitical && cell.geographyId === "geo.sapmi") {
    fail("political universe cannot contain Sápmi geography");
  }
  if (!expectedPolitical && cell.geographyId !== "geo.sapmi") {
    fail("Sápmi universe can contain only geo.sapmi");
  }
  const expectedCellId = discoveryCellId({
    profileId: cell.profileId,
    geographyId: cell.geographyId,
    valueChainStageId: cell.valueChainStageId,
    analyticalDomainId: cell.analyticalDomainId,
  });
  if (cell.cellId !== expectedCellId)
    fail("universe cell ID does not match its exact axes");
  const { cellSha256, ...body } = cell;
  if (cellSha256 !== domainHash("universe-cell", body as DiscoveryJsonValue)) {
    fail("universe cell seal does not match its canonical body");
  }
  return cell;
}

export function discoveryCellId(input: {
  profileId: string;
  geographyId: string;
  valueChainStageId: string;
  analyticalDomainId: string;
}): string {
  return `discovery.v1.profile=${input.profileId}.geo=${input.geographyId}.stage=${input.valueChainStageId}.domain=${input.analyticalDomainId}`;
}

type UnsealedQueryEvent =
  | Omit<SearchPlanEvent, "eventSha256">
  | Omit<SearchRunEvent, "eventSha256">
  | Omit<SearchCompletionAssessmentEvent, "eventSha256">;
type UnsealedResultEvent =
  | Omit<DiscoveryCandidateEvent, "eventSha256">
  | Omit<FormalSourceReceivedEvent, "eventSha256">;

export function sealSearchQueryEvent(
  value: UnsealedQueryEvent,
): SearchQueryLedgerEvent {
  return validateSearchQueryEvent({
    ...value,
    eventSha256: domainHash("query-event", value as DiscoveryJsonValue),
  });
}

export function sealDiscoveryResultEvent(
  value: UnsealedResultEvent,
): DiscoveryResultLedgerEvent {
  return validateDiscoveryResultEvent({
    ...value,
    eventSha256: domainHash("result-event", value as DiscoveryJsonValue),
  });
}

function validateEventSeal(
  event: SearchQueryLedgerEvent | DiscoveryResultLedgerEvent,
  domain: "query-event" | "result-event",
): void {
  const { eventSha256, ...body } = event;
  if (eventSha256 !== domainHash(domain, body as DiscoveryJsonValue)) {
    fail(`${domain} seal does not match its canonical body`);
  }
}

function validatePlan(plan: SearchPlanEvent): void {
  if (plan.universeVersion !== SOURCE_DISCOVERY_UNIVERSE_VERSION) {
    fail(
      `${plan.planId} must bind discovery universe version ${SOURCE_DISCOVERY_UNIVERSE_VERSION}`,
    );
  }
  unique(plan.universeCellIds, `${plan.planId} universe cells`);
  unique(
    plan.sourceSystems.map((system) => system.systemId),
    `${plan.planId} source systems`,
  );
  unique(plan.sourceClasses, `${plan.planId} source classes`);
  unique(plan.languageCodes, `${plan.planId} language codes`);
  unique(
    plan.routes.map((route) => route.routeId),
    `${plan.planId} routes`,
  );
  unique(
    plan.searchObligations.map((obligation) => obligation.obligationId),
    `${plan.planId} search obligation IDs`,
  );
  if (
    !equal(
      plan.routes.map((route) => route.routeId).sort(),
      [...DISCOVERY_SEARCH_ROUTES].sort(),
    )
  ) {
    fail(
      `${plan.planId} must classify every required search route exactly once`,
    );
  }
  for (const route of plan.routes) {
    if ((route.state === "not_applicable") !== (route.rationale !== null)) {
      fail(
        `${plan.planId} not-applicable routes require exactly one rationale`,
      );
    }
  }
  const obligationSignature = (obligation: {
    routeId: string;
    sourceSystemId: string;
    sourceClass: string;
    languageCode: string;
    universeCellId: string;
  }) =>
    [
      obligation.routeId,
      obligation.sourceSystemId,
      obligation.sourceClass,
      obligation.languageCode,
      obligation.universeCellId,
    ].join("\u0000");
  const obligationSignatures = plan.searchObligations.map(obligationSignature);
  unique(obligationSignatures, `${plan.planId} search obligation dimensions`);
  const plannedRouteIds = plan.routes
    .filter((route) => route.state === "planned")
    .map((route) => route.routeId);
  const expectedObligationSignatures: string[] = [];
  for (const routeId of plannedRouteIds) {
    for (const sourceSystem of plan.sourceSystems) {
      for (const sourceClass of plan.sourceClasses) {
        for (const languageCode of plan.languageCodes) {
          for (const universeCellId of plan.universeCellIds) {
            expectedObligationSignatures.push(
              obligationSignature({
                routeId,
                sourceSystemId: sourceSystem.systemId,
                sourceClass,
                languageCode,
                universeCellId,
              }),
            );
          }
        }
      }
    }
  }
  if (
    !equal(
      [...obligationSignatures].sort(),
      expectedObligationSignatures.sort(),
    )
  ) {
    fail(
      `${plan.planId} must declare exactly one obligation for every planned route, source system, source class, language and cell combination`,
    );
  }
  if (
    plan.timeRange.from !== null &&
    plan.timeRange.to !== null &&
    plan.timeRange.from > plan.timeRange.to
  ) {
    fail(`${plan.planId} has an inverted source time range`);
  }
  const isSapmi = plan.profileId === SAPMI_DISCOVERY_PROFILE_ID;
  if (
    isSapmi !== (plan.aggregationClass === "sapmi_overlapping") ||
    isSapmi !== (plan.rightsHolderGovernance !== null) ||
    isSapmi !== (plan.universeId === "source-discovery.sapmi-overlap-macro.v1")
  ) {
    fail(
      `${plan.planId} profile and rights-holder governance boundary disagree`,
    );
  }
  if (
    isSapmi &&
    plan.routes.find((route) => route.routeId === "rights_holder_led")
      ?.state !== "planned"
  ) {
    fail(`${plan.planId} must plan the rights-holder-led route for Sápmi`);
  }
  if (
    plan.rightsHolderGovernance &&
    (plan.rightsHolderGovernance.status ===
      "authorization_recorded_unverified") !==
      (plan.rightsHolderGovernance.authorizationReceiptSha256 !== null)
  ) {
    fail(
      `${plan.planId} search authorization and authorization receipt disagree`,
    );
  }
}

function validateRun(run: SearchRunEvent): void {
  unique(run.universeCellIds, `${run.runId} universe cells`);
  unique(
    run.routeExecutions.map((route) => route.routeId),
    `${run.runId} route executions`,
  );
  unique(run.candidateIds, `${run.runId} candidate IDs`);
  unique(run.capturedResponseSha256s, `${run.runId} captured response hashes`);
  if (
    Date.parse(run.startedAt) > Date.parse(run.endedAt) ||
    Date.parse(run.endedAt) > Date.parse(run.recordedAt)
  ) {
    fail(`${run.runId} timestamps are not chronological`);
  }
  if (run.inspectedResultCount > run.observedResultCount) {
    fail(`${run.runId} inspected result count exceeds observed result count`);
  }
  if (
    run.query.exactQuery === null &&
    run.query.requestedLocator === null &&
    run.landingPagesInspected.length === 0 &&
    run.navigationPathsInspected.length === 0
  ) {
    fail(`${run.runId} has no exact query or navigation evidence`);
  }
  for (const route of run.routeExecutions) {
    if (
      ["partial", "blocked"].includes(route.state) !==
      (route.limitation !== null)
    ) {
      fail(
        `${run.runId} partial or blocked routes require exactly one limitation`,
      );
    }
    if (
      ["completed", "partial"].includes(route.state) &&
      route.pagesOrSegmentsInspected === 0
    ) {
      fail(
        `${run.runId} completed or partial routes require positive inspection evidence`,
      );
    }
  }
  if (run.resultState === "completed") {
    if (
      !run.query.pagination.completeForDeclaredRoute ||
      run.routeExecutions.some((route) => route.state !== "completed") ||
      run.nextActions.length !== 0 ||
      run.inspectedResultCount !== run.observedResultCount ||
      (run.capturedResponseSha256s.length === 0 && run.limitations.length === 0)
    ) {
      fail(
        `${run.runId} cannot complete its route with incomplete results, pagination, capture evidence or actions`,
      );
    }
  } else if (run.nextActions.length === 0) {
    fail(`${run.runId} partial or blocked state requires next actions`);
  }
  if (run.resultState === "blocked" && run.accessFailures.length === 0) {
    fail(
      `${run.runId} blocked state requires at least one access or applicability failure`,
    );
  }
  if (run.candidateIds.length > 0 && run.inspectedResultCount === 0) {
    fail(`${run.runId} cannot discover candidates without inspecting results`);
  }
  if (run.candidateIds.length > run.inspectedResultCount) {
    fail(`${run.runId} candidate count exceeds inspected result count`);
  }
}

function validateCompletionAssessment(
  assessment: SearchCompletionAssessmentEvent,
): void {
  unique(
    assessment.universeCellIds,
    `${assessment.assessmentId} universe cells`,
  );
  unique(
    assessment.runBindings.map((binding) => binding.runId),
    `${assessment.assessmentId} run bindings`,
  );
  if (Date.parse(assessment.assessedAt) > Date.parse(assessment.recordedAt)) {
    fail(
      `${assessment.assessmentId} cannot be recorded before it was assessed`,
    );
  }
  if (
    assessment.resultState === "stopping_rule_met" &&
    assessment.nextActions.length > 0
  ) {
    fail(
      `${assessment.assessmentId} stopping-rule state cannot have next actions`,
    );
  }
  if (
    assessment.resultState === "incomplete" &&
    assessment.nextActions.length === 0
  ) {
    fail(`${assessment.assessmentId} incomplete state requires next actions`);
  }
}

export function validateSearchQueryEvent(
  value: unknown,
): SearchQueryLedgerEvent {
  const parsed = searchQueryLedgerEventSchema.safeParse(value);
  if (!parsed.success)
    fail(
      parsed.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; "),
    );
  const event = parsed.data;
  if (event.recordType === "search_plan_registered") validatePlan(event);
  else if (event.recordType === "search_run_recorded") validateRun(event);
  else validateCompletionAssessment(event);
  validateEventSeal(event, "query-event");
  return event;
}

function validateCandidate(candidate: DiscoveryCandidateEvent): void {
  unique(candidate.universeCellIds, `${candidate.candidateId} universe cells`);
  unique(candidate.languageCodes, `${candidate.candidateId} languages`);
  unique(
    candidate.identifiers.map((item) => `${item.kind}:${item.value}`),
    `${candidate.candidateId} identifiers`,
  );
  unique(
    candidate.deduplication.relatedCandidateIds,
    `${candidate.candidateId} related candidates`,
  );
  if (
    candidate.deduplication.relatedCandidateIds.includes(candidate.candidateId)
  ) {
    fail(`${candidate.candidateId} cannot deduplicate against itself`);
  }
  const grouped = ["possible_duplicate", "grouped_without_merge"].includes(
    candidate.deduplication.state,
  );
  if (
    grouped !== (candidate.deduplication.groupingKeySha256 !== null) ||
    grouped !== candidate.deduplication.relatedCandidateIds.length > 0
  ) {
    fail(
      `${candidate.candidateId} deduplication state, key and related candidates disagree`,
    );
  }
  if (Date.parse(candidate.discoveredAt) > Date.parse(candidate.recordedAt)) {
    fail(
      `${candidate.candidateId} cannot be recorded before it was discovered`,
    );
  }
}

export function validateDiscoveryResultEvent(
  value: unknown,
): DiscoveryResultLedgerEvent {
  const parsed = discoveryResultLedgerEventSchema.safeParse(value);
  if (!parsed.success)
    fail(
      parsed.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; "),
    );
  const event = parsed.data;
  if (event.recordType === "discovery_candidate_recorded")
    validateCandidate(event);
  validateEventSeal(event, "result-event");
  return event;
}

function validateChain<
  T extends {
    eventId: string;
    sequence: number;
    predecessorEventSha256: string | null;
    recordedAt: string;
    eventSha256: string;
  },
>(events: T[], label: string): void {
  unique(
    events.map((event) => event.eventId),
    `${label} event IDs`,
  );
  let predecessor: T | null = null;
  for (const [index, event] of events.entries()) {
    if (event.sequence !== index)
      fail(`${label} sequence must start at zero and be contiguous`);
    if (event.predecessorEventSha256 !== (predecessor?.eventSha256 ?? null)) {
      fail(`${label} predecessor hash chain is broken at sequence ${index}`);
    }
    if (
      predecessor &&
      Date.parse(event.recordedAt) < Date.parse(predecessor.recordedAt)
    ) {
      fail(`${label} recordedAt values must be chronological`);
    }
    predecessor = event;
  }
}

export function validateSearchQueryLedger(
  values: unknown[],
): SearchQueryLedgerEvent[] {
  const events = values.map(validateSearchQueryEvent);
  validateChain(events, "query ledger");
  unique(
    events
      .filter((event) => event.recordType === "search_plan_registered")
      .map((event) => event.planId),
    "search plan IDs",
  );
  unique(
    events
      .filter((event) => event.recordType === "search_run_recorded")
      .map((event) => event.runId),
    "search run IDs",
  );
  unique(
    events
      .filter((event) => event.recordType === "search_completion_assessed")
      .map((event) => event.assessmentId),
    "search completion assessment IDs",
  );
  const plans = new Map<string, SearchPlanEvent>();
  const runs = new Map<string, SearchRunEvent>();
  for (const event of events) {
    if (event.recordType === "search_plan_registered") {
      plans.set(event.planId, event);
      continue;
    }
    const plan = plans.get(event.planId);
    const eventLabel =
      event.recordType === "search_run_recorded"
        ? event.runId
        : event.assessmentId;
    if (!plan) fail(`${eventLabel} references a missing or later search plan`);
    if (
      event.planVersion !== plan.planVersion ||
      event.planEventSha256 !== plan.eventSha256 ||
      event.universeId !== plan.universeId ||
      event.universeVersion !== plan.universeVersion ||
      event.profileId !== plan.profileId ||
      event.aggregationClass !== plan.aggregationClass
    ) {
      fail(`${eventLabel} does not bind the exact search plan and profile`);
    }
    const planCells = new Set(plan.universeCellIds);
    if (event.universeCellIds.some((cellId) => !planCells.has(cellId))) {
      fail(`${eventLabel} references a cell outside its search plan`);
    }
    if (event.recordType === "search_completion_assessed") {
      const boundRuns = event.runBindings.map((binding) => {
        const run = runs.get(binding.runId);
        if (
          !run ||
          run.eventSha256 !== binding.runEventSha256 ||
          run.planId !== plan.planId
        ) {
          fail(
            `${event.assessmentId} does not bind an exact earlier run from its plan`,
          );
        }
        return run;
      });
      if (event.resultState === "stopping_rule_met") {
        if (event.profileId === SAPMI_DISCOVERY_PROFILE_ID) {
          fail(
            `${event.assessmentId} cannot meet a Sápmi stopping rule until rights-holder authorization is externally verified outside discovery-v1`,
          );
        }
        if (boundRuns.some((run) => run.resultState !== "completed")) {
          fail(
            `${event.assessmentId} cannot meet its stopping rule with incomplete bound runs`,
          );
        }
        const requiredObligationIds = plan.searchObligations
          .map((obligation) => obligation.obligationId)
          .sort();
        const completedObligationIds = boundRuns
          .map((run) => run.obligationId)
          .sort();
        if (
          boundRuns.length !== requiredObligationIds.length ||
          !equal(requiredObligationIds, completedObligationIds) ||
          !equal(
            [...plan.universeCellIds].sort(),
            [...event.universeCellIds].sort(),
          )
        ) {
          fail(
            `${event.assessmentId} cannot meet its stopping rule before every exact search obligation has completed run evidence`,
          );
        }
      }
      continue;
    }
    const obligation = plan.searchObligations.find(
      (item) => item.obligationId === event.obligationId,
    );
    const sourceSystem = plan.sourceSystems.find(
      (system) => system.systemId === event.sourceSystemId,
    );
    if (
      !obligation ||
      !sourceSystem ||
      event.routeExecutions[0]?.routeId !== obligation.routeId ||
      event.sourceSystemId !== obligation.sourceSystemId ||
      event.sourceSystemLocator !== sourceSystem.locator ||
      event.sourceClass !== obligation.sourceClass ||
      event.query.languageCode !== obligation.languageCode ||
      !equal(event.universeCellIds, [obligation.universeCellId])
    ) {
      fail(`${event.runId} does not bind its exact planned search obligation`);
    }
    if (sourceSystem.locator !== null) {
      const evidenceLocators = [
        event.query.requestedLocator,
        ...event.landingPagesInspected,
      ].filter((locator): locator is string => locator !== null);
      const sourceOrigin = new URL(sourceSystem.locator).origin;
      if (
        !evidenceLocators.some(
          (locator) => new URL(locator).origin === sourceOrigin,
        )
      ) {
        fail(
          `${event.runId} has no inspected locator from its declared source system origin`,
        );
      }
    }
    runs.set(event.runId, event);
  }
  return events;
}

export function validateDiscoveryResultLedger(
  values: unknown[],
  queryEvents: SearchQueryLedgerEvent[],
): DiscoveryResultLedgerEvent[] {
  const events = values.map(validateDiscoveryResultEvent);
  validateChain(events, "result ledger");
  const runs = new Map(
    queryEvents
      .filter(
        (event): event is SearchRunEvent =>
          event.recordType === "search_run_recorded",
      )
      .map((event) => [event.runId, event]),
  );
  const candidates = new Map<string, DiscoveryCandidateEvent>();
  unique(
    events
      .filter((event) => event.recordType === "discovery_candidate_recorded")
      .map((event) => event.candidateId),
    "candidate IDs",
  );
  unique(
    events
      .filter((event) => event.recordType === "formal_source_received")
      .map((event) => event.formalReceiptId),
    "formal receipt IDs",
  );
  unique(
    events
      .filter((event) => event.recordType === "formal_source_received")
      .map((event) => event.candidateId),
    "formally received candidate IDs",
  );
  unique(
    events
      .filter((event) => event.recordType === "formal_source_received")
      .map(
        (event) =>
          `${event.acquisitionReceipt.receiptId}@${event.acquisitionReceipt.receiptVersion}`,
      ),
    "formal acquisition receipt versions",
  );
  for (const event of events) {
    if (event.recordType === "discovery_candidate_recorded") {
      const run = runs.get(event.searchRunId);
      if (!run || event.searchRunEventSha256 !== run.eventSha256) {
        fail(`${event.candidateId} does not bind an exact recorded search run`);
      }
      if (
        event.profileId !== run.profileId ||
        event.aggregationClass !== run.aggregationClass ||
        !equal(event.universeCellIds, run.universeCellIds) ||
        event.sourceClass !== run.sourceClass
      ) {
        fail(
          `${event.candidateId} profile, cells or source class drift from its search run`,
        );
      }
      const searchLanguage = run.query.languageCode!;
      const includesSearchLanguage =
        event.languageCodes.includes(searchLanguage);
      const languageRelationIsValid =
        (event.searchLanguageRelation.state === "includes_search_language" &&
          includesSearchLanguage &&
          event.searchLanguageRelation.statement === null) ||
        (event.searchLanguageRelation.state === "different_language_observed" &&
          !includesSearchLanguage &&
          event.languageCodes.length > 0 &&
          event.searchLanguageRelation.statement !== null) ||
        (event.searchLanguageRelation.state === "language_unresolved" &&
          event.languageCodes.length === 0 &&
          event.searchLanguageRelation.statement !== null);
      if (!languageRelationIsValid) {
        fail(
          `${event.candidateId} language relation does not explain its bound search language`,
        );
      }
      if (
        Date.parse(event.discoveredAt) < Date.parse(run.startedAt) ||
        Date.parse(event.discoveredAt) > Date.parse(run.endedAt)
      ) {
        fail(
          `${event.candidateId} discovery time is outside its bound search run`,
        );
      }
      candidates.set(event.candidateId, event);
      continue;
    }
    const candidate = candidates.get(event.candidateId);
    if (!candidate || event.candidateEventSha256 !== candidate.eventSha256) {
      fail(
        `${event.formalReceiptId} does not bind an earlier exact candidate event`,
      );
    }
    if (
      !equal(
        event.candidateAcquisitionBinding.candidateLocator,
        candidate.locator,
      )
    ) {
      fail(
        `${event.formalReceiptId} acquisition binding does not copy the exact candidate locator`,
      );
    }
    if (
      Date.parse(event.receivedAt) < Date.parse(candidate.discoveredAt) ||
      Date.parse(event.receivedAt) > Date.parse(event.recordedAt)
    ) {
      fail(
        `${event.formalReceiptId} receivedAt is outside its valid event interval`,
      );
    }
  }
  for (const run of runs.values()) {
    const recordedCandidateIds = events
      .filter(
        (event): event is DiscoveryCandidateEvent =>
          event.recordType === "discovery_candidate_recorded" &&
          event.searchRunId === run.runId,
      )
      .map((event) => event.candidateId);
    if (
      !equal([...recordedCandidateIds].sort(), [...run.candidateIds].sort())
    ) {
      fail(
        `${run.runId} candidate IDs do not exactly match result-ledger candidates`,
      );
    }
  }
  return events;
}

export type SourceDiscoveryBundle = {
  universeCells: DiscoveryUniverseCell[];
  queryEvents: SearchQueryLedgerEvent[];
  resultEvents: DiscoveryResultLedgerEvent[];
};

const receiptResolvedBundleFingerprints = new WeakMap<
  SourceDiscoveryBundle,
  string
>();

function sourceDiscoveryBundleFingerprint(
  bundle: SourceDiscoveryBundle,
): string {
  return domainHash(
    "receipt-resolved-bundle",
    bundle as unknown as DiscoveryJsonValue,
  );
}

export function validateSourceDiscoveryBundle(input: {
  universeCells: unknown[];
  queryEvents: unknown[];
  resultEvents: unknown[];
}): SourceDiscoveryBundle {
  const universeCells = input.universeCells.map(validateDiscoveryUniverseCell);
  unique(
    universeCells.map((cell) => cell.cellId),
    "discovery universe cell IDs",
  );
  const politicalCount = universeCells.filter(
    (cell) => cell.profileId === POLITICAL_DISCOVERY_PROFILE_ID,
  ).length;
  const sapmiCount = universeCells.filter(
    (cell) => cell.profileId === SAPMI_DISCOVERY_PROFILE_ID,
  ).length;
  if (
    politicalCount !== POLITICAL_DISCOVERY_CELL_COUNT ||
    sapmiCount !== SAPMI_DISCOVERY_CELL_COUNT
  ) {
    fail(
      `discovery universe must contain exactly ${POLITICAL_DISCOVERY_CELL_COUNT} political and ${SAPMI_DISCOVERY_CELL_COUNT} Sápmi cells`,
    );
  }
  const cellIdSetSha256 = discoverySha256(
    canonicalDiscoveryJson(
      universeCells.map((cell) => cell.cellId).sort() as DiscoveryJsonValue,
    ),
  );
  if (cellIdSetSha256 !== SOURCE_DISCOVERY_CELL_ID_SET_SHA256) {
    fail(
      "discovery universe cell IDs do not match the canonical Cartesian set",
    );
  }
  const cellMap = new Map(universeCells.map((cell) => [cell.cellId, cell]));
  const queryEvents = validateSearchQueryLedger(input.queryEvents);
  for (const plan of queryEvents.filter(
    (event): event is SearchPlanEvent =>
      event.recordType === "search_plan_registered",
  )) {
    for (const cellId of plan.universeCellIds) {
      const cell = cellMap.get(cellId);
      if (
        !cell ||
        cell.universeId !== plan.universeId ||
        cell.universeVersion !== plan.universeVersion ||
        cell.profileId !== plan.profileId ||
        cell.aggregationClass !== plan.aggregationClass ||
        !equal(cell.ontology, plan.ontology)
      ) {
        fail(
          `${plan.planId} references a missing or cross-profile universe cell`,
        );
      }
    }
  }
  const resultEvents = validateDiscoveryResultLedger(
    input.resultEvents,
    queryEvents,
  );
  return { universeCells, queryEvents, resultEvents };
}

export type ResolveDiscoveryAcquisitionReceipt = (
  receiptPath: string,
) => Buffer;

export function validateSourceDiscoveryBundleWithReceipts(
  input: {
    universeCells: unknown[];
    queryEvents: unknown[];
    resultEvents: unknown[];
  },
  resolveReceipt: ResolveDiscoveryAcquisitionReceipt,
): SourceDiscoveryBundle {
  const bundle = validateSourceDiscoveryBundle(input);
  const candidates = new Map(
    bundle.resultEvents
      .filter(
        (event): event is DiscoveryCandidateEvent =>
          event.recordType === "discovery_candidate_recorded",
      )
      .map((event) => [event.candidateId, event]),
  );
  for (const event of bundle.resultEvents) {
    if (event.recordType !== "formal_source_received") continue;
    const candidate = candidates.get(event.candidateId)!;
    const reference = event.acquisitionReceipt;
    const bytes = resolveReceipt(reference.receiptPath);
    if (!Buffer.isBuffer(bytes)) {
      fail(
        `formal source ${event.formalReceiptId} resolver did not return bytes`,
      );
    }
    if (discoverySha256(bytes) !== reference.receiptFileSha256) {
      fail(`formal source ${event.formalReceiptId} receipt file hash is stale`);
    }
    let rawReceipt: unknown;
    try {
      rawReceipt = JSON.parse(bytes.toString("utf8"));
    } catch {
      fail(`formal source ${event.formalReceiptId} receipt is not valid JSON`);
    }
    const receipt = validateSourceAcquisitionReceipt(rawReceipt);
    const content = sourceAcquisitionContent(receipt);
    if (
      receipt.receiptId !== reference.receiptId ||
      receipt.receiptVersion !== reference.receiptVersion ||
      receipt.acquisitionType !== reference.receiptType ||
      receipt.receiptSha256 !== reference.receiptSha256 ||
      content.sha256 !== reference.rawContentSha256 ||
      content.sizeBytes !== reference.rawContentSizeBytes ||
      Date.parse(receipt.completedAt) > Date.parse(event.receivedAt)
    ) {
      fail(
        `formal source ${event.formalReceiptId} does not bind the exact acquisition receipt, content and chronology`,
      );
    }
    const method = event.candidateAcquisitionBinding.method;
    const locator = candidate.locator;
    const exactLocator =
      locator.kind === "https_url" || locator.kind === "private_locator";
    const locatorMatches =
      (method === "exact_requested_locator" &&
        exactLocator &&
        locator.value === receipt.requestedLocator) ||
      (method === "exact_final_locator" &&
        exactLocator &&
        locator.value === receipt.finalLocator) ||
      (method === "doi_https_resolution" &&
        locator.kind === "doi" &&
        receipt.acquisitionType === "controlled_https_fetch" &&
        receipt.requestedLocator === `https://doi.org/${locator.value}`);
    if (!locatorMatches) {
      fail(
        `formal source ${event.formalReceiptId} receipt did not acquire its bound candidate locator`,
      );
    }
  }
  receiptResolvedBundleFingerprints.set(
    bundle,
    sourceDiscoveryBundleFingerprint(bundle),
  );
  return bundle;
}

export function sourceDiscoveryCounts(input: SourceDiscoveryBundle): {
  plannedPoliticalCells: typeof POLITICAL_DISCOVERY_CELL_COUNT;
  plannedSapmiCells: typeof SAPMI_DISCOVERY_CELL_COUNT;
  registeredSearchPlans: number;
  executedSearchRuns: number;
  cellsReferencedByExecutedSearches: number;
  discoveryCandidates: number;
  formallyReceivedSources: number;
  coverageClaims: 0;
} {
  const plannedPoliticalCells = input.universeCells.filter(
    (cell) => cell.profileId === POLITICAL_DISCOVERY_PROFILE_ID,
  ).length;
  const plannedSapmiCells = input.universeCells.filter(
    (cell) => cell.profileId === SAPMI_DISCOVERY_PROFILE_ID,
  ).length;
  if (
    plannedPoliticalCells !== POLITICAL_DISCOVERY_CELL_COUNT ||
    plannedSapmiCells !== SAPMI_DISCOVERY_CELL_COUNT
  ) {
    fail("cannot count a discovery bundle with an incomplete planned universe");
  }
  if (
    input.resultEvents.some(
      (event) => event.recordType === "formal_source_received",
    ) &&
    receiptResolvedBundleFingerprints.get(input) !==
      sourceDiscoveryBundleFingerprint(input)
  ) {
    fail(
      "cannot count formally received sources before resolving and verifying every acquisition receipt",
    );
  }
  return {
    plannedPoliticalCells: POLITICAL_DISCOVERY_CELL_COUNT,
    plannedSapmiCells: SAPMI_DISCOVERY_CELL_COUNT,
    registeredSearchPlans: input.queryEvents.filter(
      (event) => event.recordType === "search_plan_registered",
    ).length,
    executedSearchRuns: input.queryEvents.filter(
      (event) => event.recordType === "search_run_recorded",
    ).length,
    cellsReferencedByExecutedSearches: new Set(
      input.queryEvents
        .filter(
          (event): event is SearchRunEvent =>
            event.recordType === "search_run_recorded",
        )
        .flatMap((event) => event.universeCellIds),
    ).size,
    discoveryCandidates: input.resultEvents.filter(
      (event) => event.recordType === "discovery_candidate_recorded",
    ).length,
    formallyReceivedSources: input.resultEvents.filter(
      (event) => event.recordType === "formal_source_received",
    ).length,
    coverageClaims: 0,
  };
}

export function sealSourceDiscoverySummary(
  value: Omit<SourceDiscoverySummary, "summarySha256">,
): SourceDiscoverySummary {
  return validateSourceDiscoverySummary({
    ...value,
    summarySha256: domainHash("summary", value as DiscoveryJsonValue),
  });
}

export function validateSourceDiscoverySummary(
  value: unknown,
): SourceDiscoverySummary {
  const parsed = sourceDiscoverySummarySchema.safeParse(value);
  if (!parsed.success)
    fail(
      parsed.error.issues
        .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
        .join("; "),
    );
  const summary = parsed.data;
  if (
    summary.universeVersion !== SOURCE_DISCOVERY_UNIVERSE_VERSION ||
    summary.ontology.ontologyId !== SOURCE_DISCOVERY_ONTOLOGY_ID ||
    summary.ontology.ontologyVersion !== SOURCE_DISCOVERY_ONTOLOGY_VERSION ||
    summary.ontology.ontologyFileSha256 !==
      SOURCE_DISCOVERY_ONTOLOGY_FILE_SHA256
  ) {
    fail(
      "source-discovery summary does not bind the canonical universe ontology",
    );
  }
  const { summarySha256, ...body } = summary;
  if (summarySha256 !== domainHash("summary", body as DiscoveryJsonValue)) {
    fail("source-discovery summary seal does not match its canonical body");
  }
  if (
    summary.counts.cellsReferencedByExecutedSearches >
    summary.counts.plannedCellTotal
  ) {
    fail("executed-search cell count exceeds the planned universe");
  }
  return summary;
}
