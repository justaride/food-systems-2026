import { spawnSync } from 'node:child_process'
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs'
import { basename, dirname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'

import {
  canonicalJson,
  sha256,
  snapshotArtifact,
  type ArtifactSnapshot,
  type Ontology,
} from './generate-coverage-ledger'

export const GENERATOR_VERSION = '1.0.0'
export const SOURCE_MAP_PATH = 'knowledge/pilots/field08/field08-research-source-map.v1.json'
export const SOURCE_SCHEMA_PATH = 'knowledge/schema/field08-research-source-map.schema.v1.json'
export const REGISTER_SCHEMA_PATH = 'knowledge/schema/field08-research-candidate-register.schema.v1.json'
export const ONTOLOGY_PATH = 'knowledge/schema/nordic-food-system-ontology.v1.json'
export const COVERAGE_LEDGER_PATH = 'knowledge/coverage/coverage-ledger.v1.jsonl'
export const HISTORICAL_ASSESSMENTS_PATH = 'knowledge/coverage/coverage-assessments-baseline.v1.jsonl'
export const CONSTITUTION_PATH = 'knowledge/KNOWLEDGE-CONSTITUTION.md'
export const FIELD08_README_PATH = 'knowledge/pilots/field08/README.md'
export const GENERATOR_PATH = 'scripts/knowledge/generate-field08-research-candidates.ts'
export const COVERAGE_GENERATOR_PATH = 'scripts/knowledge/generate-coverage-ledger.ts'
export const REGISTER_PATH = 'knowledge/pilots/field08/field08-research-candidate-register.v1.json'
export const REPORT_PATH = 'knowledge/pilots/field08/field08-research-candidate-report.v1.md'
export const GENERATION_MANIFEST_PATH = 'knowledge/pilots/field08/field08-research-generation-manifest.v1.json'

const FIELD_ID = 'legacy_field.f08'
const POLITICAL_PROFILE_ID = 'profile.legacy_field_political'
const SAPMI_PROFILE_ID = 'profile.legacy_field_sapmi_overlap'
const POLITICAL_GEOGRAPHIES = ['geo.no', 'geo.se', 'geo.dk', 'geo.fi', 'geo.is', 'geo.fo', 'geo.gl', 'geo.ax'] as const
const SAPMI_GEOGRAPHY = 'geo.sapmi'
const ALL_GEOGRAPHIES = [...POLITICAL_GEOGRAPHIES, SAPMI_GEOGRAPHY] as const

type GeographyId = typeof ALL_GEOGRAPHIES[number]
type ProfileId = typeof POLITICAL_PROFILE_ID | typeof SAPMI_PROFILE_ID
type AggregationClass = 'political_nordic' | 'sapmi_overlapping'
type FacetDimension = 'value_chain_stage' | 'domain' | 'outcome' | 'flow_class' | 'material_group' | 'circular_strategy'
type CandidateState =
  | 'substantive_candidate_identified'
  | 'method_candidate_identified'
  | 'context_candidate_identified'
  | 'boundary_reconciliation_required'
  | 'rights_holder_route_required'
  | 'no_candidate_identified'

type SourceCandidate = {
  sourceCandidateId: string
  title: string
  publisher: string
  publicationDate: string | null
  sourceUrl: string
  sourceType: string
  authorityClass: string
  sourceScopeLabel: string
  languages: string[]
  retrievedAt: string
  accessStatus: string
  exactLocator: Locator
  archiveStatus: 'locator_only_not_archived'
  rightsHolderInstitutionalSource: boolean
  limitations: string[]
}

type Locator = {
  locatorType: string
  value: string
  locatorStatus: 'exact_candidate_locator' | 'locator_needs_review'
}

type SourceBinding = {
  sourceBindingId: string
  sourceCandidateId: string
  geographyId: GeographyId
  cellId: string
  candidateUse:
    | 'substantive_measurement_candidate'
    | 'policy_context_candidate'
    | 'method_candidate'
    | 'regional_context_candidate'
    | 'data_gap_candidate'
    | 'boundary_reconciliation_candidate'
    | 'rights_holder_authority_route'
  boundaryFit: 'direct_candidate' | 'method_only' | 'regional_context_only' | 'requires_reconciliation' | 'rights_holder_route_only'
  targetFacetIds: string[]
  limitations: string[]
  claimPromotionAllowed: false
}

type ObservationCandidate = {
  observationCandidateId: string
  sourceCandidateId: string
  sourceBindingId: string
  geographyId: GeographyId
  observationType: string
  statement: string
  exactLocator: Locator
  subjectPeriod: {
    kind: 'snapshot' | 'interval' | 'series_window' | 'undated'
    label: string
    start: string | null
    end: string | null
  }
  quantitative: boolean
  value: number | null
  unit: string | null
  numeratorDefinition: string | null
  denominatorOrUniverse: string | null
  method: string | null
  systemBoundary: string | null
  metadataGaps: string[]
  limitations: string[]
  verificationState: 'needs_review'
  candidateStatus: 'candidate_unverified'
  externalUseAllowed: false
}

type GeographyPlan = {
  geographyId: GeographyId
  profileId: ProfileId
  aggregationClass: AggregationClass
  cellId: string
  geographyBoundaryNote: string
  sourceBoundaryState: 'unknown'
  scopeCompletenessState: 'unassessed'
  explicitUnknowns: string[]
  nextActions: string[]
  proposedOwner: string
  recheckCadence: 'monthly' | 'quarterly' | 'semiannual' | 'annual' | 'unscheduled'
  rightsHolderReviewRequired: boolean
  humanEvidenceRoute: 'ordinary_human_review_required' | 'rights_holder_authority_and_consent_unresolved'
}

export type Field08SourceMap = {
  documentType: 'field08_research_source_map'
  schemaVersion: '1.0.0'
  mapId: 'map.field08_research_candidates.v1'
  status: 'draft_candidate_only'
  observedAt: string
  legacyFieldId: 'legacy_field.f08'
  semantics: {
    artifactRole: 'research_intake'
    coverageImplication: 'none'
    subjectMatterState: 'unassessed'
    evidenceStatus: 'candidate_not_evidence'
    externalUseAllowed: false
    readinessPromotionAllowed: false
    historicalAssessmentMutationAllowed: false
    crossProfileAggregationAllowed: false
  }
  researchBoundary: {
    purpose: string
    included: string[]
    excluded: string[]
    completionStatement: string
  }
  sources: SourceCandidate[]
  bindings: SourceBinding[]
  observations: ObservationCandidate[]
  geographyPlans: GeographyPlan[]
}

type FacetDefinition = {
  facetDimension: FacetDimension
  facetId: string
}

type FacetCounts = {
  total: number
  substantiveCandidate: number
  methodCandidate: number
  contextCandidate: number
  boundaryReconciliationRequired: number
  rightsHolderRouteRequired: number
  noCandidate: number
}

type FacetInventoryRecord = {
  facetInventoryId: string
  geographyId: GeographyId
  profileId: ProfileId
  cellId: string
  facetDimension: FacetDimension
  facetId: string
  candidateState: CandidateState
  sourceBindingIds: string[]
  sourceCandidateIds: string[]
  coverageImplication: 'none'
  readinessPromotionAllowed: false
  rightsHolderReviewRequired: boolean
  contentHash: string
}

type GeographyCandidate = GeographyPlan & {
  geographyCandidateId: string
  subjectMatterState: 'unassessed'
  coverageImplication: 'none'
  readinessResult: null
  candidateSourceIds: string[]
  candidateBindingIds: string[]
  observationCandidateIds: string[]
  facetCounts: FacetCounts
  assessmentEventCreated: false
  externalUseAllowed: false
  contentHash: string
}

type ProfileSummary = {
  aggregationClass: AggregationClass
  geographyCount: number
  sourceCandidateCount: number
  bindingCount: number
  observationCandidateCount: number
  facetCounts: FacetCounts
  coveragePromotionCount: 0
  externalReadyClaimCount: 0
}

export type Field08CandidateRegister = {
  documentType: 'field08_research_candidate_register'
  schemaVersion: '1.0.0'
  registerId: 'registry.field08_research_candidates.v1'
  registryStatus: 'draft_candidate_only'
  generatedAt: string
  baseCommit: string
  generatorVersion: string
  ontologyVersion: string
  mapId: 'map.field08_research_candidates.v1'
  legacyFieldId: 'legacy_field.f08'
  semantics: Field08SourceMap['semantics']
  baselineGuard: {
    historicalAssessmentPath: typeof HISTORICAL_ASSESSMENTS_PATH
    historicalAssessmentSnapshot: ArtifactSnapshot
    historicalEventCount: 117
    field08CellCount: 9
    field08ScopeRegistrationCount: 9
    field08SubjectMatterAssessmentCount: 0
    historicalAssessmentWriteCount: 0
  }
  sourceCandidates: SourceCandidate[]
  sourceBindings: SourceBinding[]
  observationCandidates: ObservationCandidate[]
  geographyCandidates: GeographyCandidate[]
  facetInventory: FacetInventoryRecord[]
  profileSummaries: Record<ProfileId, ProfileSummary>
  recordCounts: {
    sourceCandidates: number
    sourceBindings: number
    observationCandidates: number
    geographyCandidates: 9
    politicalGeographies: 8
    sapmiGeographies: 1
    facetInventoryRows: 306
  }
  safetySummary: {
    coverageAssessmentEventsCreated: 0
    coverageCellsPromoted: 0
    readinessResultsCreated: 0
    externalReadyClaimsCreated: 0
    politicalSapmiAggregationsCreated: 0
    sapmiSubstantiveCoverageCredit: 0
    historicalCoverageFilesModified: 0
  }
  contentHash: string
}

export type Field08ResearchArtifacts = {
  baseCommit: string
  sourceMap: Field08SourceMap
  register: Field08CandidateRegister
  inputSnapshots: ArtifactSnapshot[]
  registerJson: string
  reportMarkdown: string
  generationManifestJson: string
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function readJson<T>(root: string, path: string): T {
  return JSON.parse(readFileSync(resolve(root, path), 'utf8')) as T
}

function runGit(root: string, args: string[], allowFailure = false): string {
  const result = spawnSync('git', args, {
    cwd: root,
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  if (result.status !== 0 && !allowFailure) {
    const detail = (result.stderr || result.stdout || '').trim()
    throw new Error(`git ${args.join(' ')} failed${detail ? `: ${detail}` : ''}`)
  }
  return result.status === 0 ? result.stdout.trim() : ''
}

function verifyBaseCommit(root: string, baseCommit: string) {
  assert(/^[a-f0-9]{40}$/.test(baseCommit), 'baseCommit must be a full 40-character commit SHA')
  runGit(root, ['cat-file', '-e', `${baseCommit}^{commit}`])
  const ancestor = spawnSync('git', ['merge-base', '--is-ancestor', baseCommit, 'HEAD'], { cwd: root })
  assert(ancestor.status === 0, `${baseCommit} is not an ancestor of HEAD`)
}

function validateWithSchema(root: string, schemaPath: string, value: unknown, label: string) {
  const sourceSchema = readJson<object>(root, SOURCE_SCHEMA_PATH)
  const targetSchema = schemaPath === SOURCE_SCHEMA_PATH ? sourceSchema : readJson<object>(root, schemaPath)
  const ajv = new Ajv2020({ allErrors: true, strict: false })
  addFormats(ajv)
  if (schemaPath !== SOURCE_SCHEMA_PATH) ajv.addSchema(sourceSchema)
  const validate = ajv.compile(targetSchema)
  assert(validate(value), `${label} schema validation failed: ${JSON.stringify(validate.errors)}`)
}

function unique(values: string[]): string[] {
  return [...new Set(values)].sort((left, right) => left.localeCompare(right))
}

function assertUnique(values: string[], label: string) {
  assert(new Set(values).size === values.length, `${label} must be unique`)
}

function compactId(value: string): string {
  return value.replace(/^[^.]+\./, '')
}

function expectedProfile(geographyId: GeographyId): ProfileId {
  return geographyId === SAPMI_GEOGRAPHY ? SAPMI_PROFILE_ID : POLITICAL_PROFILE_ID
}

function expectedAggregation(geographyId: GeographyId): AggregationClass {
  return geographyId === SAPMI_GEOGRAPHY ? 'sapmi_overlapping' : 'political_nordic'
}

function isRightsHolderInstitutionalSource(source: SourceCandidate): boolean {
  return source.rightsHolderInstitutionalSource
    && source.sourceType === 'rights_holder_institutional_source'
    && source.authorityClass === 'rights_holder_institution'
}

function cellId(geographyId: GeographyId): string {
  const profile = expectedProfile(geographyId)
  return `cov.v1.profile=${compactId(profile)}.geography=${compactId(geographyId)}.legacy_fields=f08`
}

function hashRecord<T extends Record<string, unknown>>(value: T): T & { contentHash: string } {
  return { ...value, contentHash: sha256(canonicalJson(value)) }
}

function field08FacetDefinitions(ontology: Ontology): FacetDefinition[] {
  const field = ontology.dimensions.legacyFields.find((candidate) => candidate.id === FIELD_ID)
  assert(field, `Missing ${FIELD_ID} from ontology`)
  const mappings = field.legacyMappings as unknown as {
    manualReviewRequired?: boolean
    facetTargets?: {
      valueChainStageIds?: string[]
      domainIds?: string[]
      outcomeIds?: string[]
      flowClassIds?: string[]
      materialGroupIds?: string[]
      circularStrategyIds?: string[]
    }
  }
  assert(mappings.manualReviewRequired === true, `${FIELD_ID} must require manual review`)
  const targets = mappings.facetTargets
  assert(targets, `${FIELD_ID} has no facet targets`)
  const definitions: FacetDefinition[] = [
    ...(targets.valueChainStageIds ?? []).map((facetId) => ({ facetDimension: 'value_chain_stage' as const, facetId })),
    ...(targets.domainIds ?? []).map((facetId) => ({ facetDimension: 'domain' as const, facetId })),
    ...(targets.outcomeIds ?? []).map((facetId) => ({ facetDimension: 'outcome' as const, facetId })),
    ...(targets.flowClassIds ?? []).map((facetId) => ({ facetDimension: 'flow_class' as const, facetId })),
    ...(targets.materialGroupIds ?? []).map((facetId) => ({ facetDimension: 'material_group' as const, facetId })),
    ...(targets.circularStrategyIds ?? []).map((facetId) => ({ facetDimension: 'circular_strategy' as const, facetId })),
  ]
  assert(definitions.length === 34, `Expected 34 Field 08 facet targets, found ${definitions.length}`)
  assertUnique(definitions.map((item) => item.facetId), 'Field 08 facet targets')

  const vocabularyByDimension: Record<FacetDimension, Set<string>> = {
    value_chain_stage: new Set(ontology.dimensions.valueChainStages.map((item) => item.id)),
    domain: new Set(ontology.dimensions.domains.map((item) => item.id)),
    outcome: new Set(ontology.dimensions.outcomes.map((item) => item.id)),
    flow_class: new Set(ontology.dimensions.flowClasses.map((item) => item.id)),
    material_group: new Set(ontology.dimensions.materialGroups.map((item) => item.id)),
    circular_strategy: new Set(ontology.dimensions.circularStrategies.map((item) => item.id)),
  }
  for (const definition of definitions) {
    assert(vocabularyByDimension[definition.facetDimension].has(definition.facetId), `${definition.facetId} is not in the ontology vocabulary`)
  }
  return definitions.sort((left, right) => {
    const dimensionOrder = left.facetDimension.localeCompare(right.facetDimension)
    return dimensionOrder || left.facetId.localeCompare(right.facetId)
  })
}

function validateProfiles(ontology: Ontology) {
  const profiles = new Map(ontology.coverageProfiles.map((profile) => [profile.id, profile]))
  const political = profiles.get(POLITICAL_PROFILE_ID)
  const sapmi = profiles.get(SAPMI_PROFILE_ID)
  assert(political, `Missing ${POLITICAL_PROFILE_ID}`)
  assert(sapmi, `Missing ${SAPMI_PROFILE_ID}`)
  assert(canonicalJson(political.geographyIds) === canonicalJson(POLITICAL_GEOGRAPHIES), 'Political Field 08 geographies changed')
  assert(canonicalJson(sapmi.geographyIds) === canonicalJson([SAPMI_GEOGRAPHY]), 'Sápmi Field 08 geography changed')
  assert(political.aggregationClass === 'political_nordic', 'Political profile aggregation class changed')
  assert(sapmi.aggregationClass === 'sapmi_overlapping', 'Sápmi profile aggregation class changed')
}

function readHistoricalState(root: string) {
  const historicalLines = readFileSync(resolve(root, HISTORICAL_ASSESSMENTS_PATH), 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
  const historicalEvents = historicalLines.map((line) => JSON.parse(line) as {
    cellId?: unknown
    eventKind?: unknown
    readinessResult?: unknown
    evidenceLinks?: unknown
  })
  assert(historicalEvents.length === 117, `Expected 117 historical assessment events, found ${historicalEvents.length}`)
  const historicalField08 = historicalEvents.filter((event) => typeof event.cellId === 'string' && event.cellId.endsWith('.legacy_fields=f08'))
  assert(historicalField08.length === 9, `Expected nine historical Field 08 scope registrations, found ${historicalField08.length}`)
  assert(historicalField08.every((event) => event.eventKind === 'scope_registration'), 'Field 08 historical events must remain scope registrations')
  assert(historicalField08.every((event) => event.readinessResult === null), 'Field 08 historical readiness must remain null')
  assert(historicalField08.every((event) => Array.isArray(event.evidenceLinks) && event.evidenceLinks.length === 0), 'Field 08 historical evidence links must remain empty')

  const ledgerLines = readFileSync(resolve(root, COVERAGE_LEDGER_PATH), 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
  const field08Ledger = ledgerLines
    .map((line) => JSON.parse(line) as {
      cell?: { cellId?: unknown }
      latestAssessment?: {
        eventKind?: unknown
        readinessResult?: unknown
        evidenceLinks?: unknown
        workflowStage?: unknown
      }
    })
    .filter((record) => typeof record.cell?.cellId === 'string' && record.cell.cellId.endsWith('.legacy_fields=f08'))
  assert(field08Ledger.length === 9, `Expected nine Field 08 ledger cells, found ${field08Ledger.length}`)
  assert(field08Ledger.every((record) => record.latestAssessment?.eventKind === 'scope_registration'), 'Every Field 08 ledger projection must remain a scope registration')
  assert(field08Ledger.every((record) => record.latestAssessment?.readinessResult === null), 'Every Field 08 ledger readiness result must remain null')
  assert(field08Ledger.every((record) => Array.isArray(record.latestAssessment?.evidenceLinks) && record.latestAssessment.evidenceLinks.length === 0), 'Every Field 08 ledger evidence-link set must remain empty')
  assert(field08Ledger.every((record) => record.latestAssessment?.workflowStage === 'unassessed'), 'Every Field 08 ledger workflow stage must remain unassessed')
  assertUnique(field08Ledger.map((record) => record.cell!.cellId as string), 'Field 08 ledger cell IDs')
  assert(canonicalJson(field08Ledger.map((record) => record.cell!.cellId).sort()) === canonicalJson(ALL_GEOGRAPHIES.map(cellId).sort()), 'Field 08 ledger cells changed')
  return { historicalEventCount: historicalEvents.length, field08CellCount: field08Ledger.length }
}

function validateObservationMetadata(observation: ObservationCandidate) {
  const hasQuantitativeType = observation.observationType === 'quantitative_measurement_candidate'
  assert(
    observation.quantitative === hasQuantitativeType,
    `${observation.observationCandidateId} observation type and quantitative flag disagree`,
  )
  if (!observation.quantitative) {
    assert(observation.value === null, `${observation.observationCandidateId} non-quantitative value must be null`)
    assert(observation.unit === null, `${observation.observationCandidateId} non-quantitative unit must be null`)
    return
  }
  assert(observation.observationType === 'quantitative_measurement_candidate', `${observation.observationCandidateId} quantitative type mismatch`)
  const expectedGaps: string[] = []
  if (observation.subjectPeriod.kind === 'undated' || !observation.subjectPeriod.start || !observation.subjectPeriod.end) expectedGaps.push('period')
  if (observation.value === null) expectedGaps.push('value')
  if (observation.unit === null) expectedGaps.push('unit')
  if (observation.numeratorDefinition === null) expectedGaps.push('numerator')
  if (observation.denominatorOrUniverse === null) expectedGaps.push('denominator_or_universe')
  if (observation.method === null) expectedGaps.push('method')
  if (observation.systemBoundary === null) expectedGaps.push('system_boundary')
  if (observation.exactLocator.locatorStatus !== 'exact_candidate_locator') expectedGaps.push('exact_locator')
  assert(canonicalJson(unique(observation.metadataGaps)) === canonicalJson(unique(expectedGaps)), `${observation.observationCandidateId} metadata gaps are not exact`)
}

function validateSourceMap(sourceMap: Field08SourceMap, ontology: Ontology, facets: FacetDefinition[]) {
  assert(sourceMap.legacyFieldId === FIELD_ID, 'Source map must target Field 08')
  assertUnique(sourceMap.sources.map((source) => source.sourceCandidateId), 'Source candidate IDs')
  assertUnique(sourceMap.bindings.map((binding) => binding.sourceBindingId), 'Source binding IDs')
  assertUnique(sourceMap.observations.map((observation) => observation.observationCandidateId), 'Observation candidate IDs')
  assertUnique(sourceMap.geographyPlans.map((plan) => plan.geographyId), 'Geography plans')
  assert(canonicalJson(sourceMap.geographyPlans.map((plan) => plan.geographyId).sort()) === canonicalJson([...ALL_GEOGRAPHIES].sort()), 'Source map must contain exactly eight political geographies and separate Sápmi')

  const sources = new Map(sourceMap.sources.map((source) => [source.sourceCandidateId, source]))
  const bindings = new Map(sourceMap.bindings.map((binding) => [binding.sourceBindingId, binding]))
  const facetIds = new Set(facets.map((facet) => facet.facetId))
  const usedSources = new Set<string>()
  const allowedFit: Record<SourceBinding['candidateUse'], SourceBinding['boundaryFit'][]> = {
    substantive_measurement_candidate: ['direct_candidate'],
    policy_context_candidate: ['direct_candidate', 'regional_context_only'],
    method_candidate: ['method_only'],
    regional_context_candidate: ['regional_context_only'],
    data_gap_candidate: ['direct_candidate'],
    boundary_reconciliation_candidate: ['requires_reconciliation'],
    rights_holder_authority_route: ['rights_holder_route_only'],
  }
  const allowedObservationTypes: Record<SourceBinding['candidateUse'], ObservationCandidate['observationType'][]> = {
    substantive_measurement_candidate: ['quantitative_measurement_candidate'],
    policy_context_candidate: ['policy_status_candidate', 'qualitative_scope_candidate'],
    method_candidate: ['method_definition_candidate'],
    regional_context_candidate: ['qualitative_scope_candidate', 'policy_status_candidate'],
    data_gap_candidate: ['documented_data_gap_candidate'],
    boundary_reconciliation_candidate: ['quantitative_measurement_candidate', 'qualitative_scope_candidate'],
    rights_holder_authority_route: ['authority_route_candidate'],
  }

  for (const source of sourceMap.sources) {
    const classificationFlags = [
      source.rightsHolderInstitutionalSource,
      source.sourceType === 'rights_holder_institutional_source',
      source.authorityClass === 'rights_holder_institution',
    ]
    assert(
      classificationFlags.every((flag) => flag === classificationFlags[0]),
      `${source.sourceCandidateId} rights-holder classification fields disagree`,
    )
  }

  for (const plan of sourceMap.geographyPlans) {
    assert(plan.profileId === expectedProfile(plan.geographyId), `${plan.geographyId} has the wrong profile`)
    assert(plan.aggregationClass === expectedAggregation(plan.geographyId), `${plan.geographyId} has the wrong aggregation class`)
    assert(plan.cellId === cellId(plan.geographyId), `${plan.geographyId} has the wrong Field 08 cell ID`)
    const isSapmi = plan.geographyId === SAPMI_GEOGRAPHY
    assert(plan.rightsHolderReviewRequired === isSapmi, `${plan.geographyId} rights-holder review flag is wrong`)
    assert(
      plan.humanEvidenceRoute === (isSapmi ? 'rights_holder_authority_and_consent_unresolved' : 'ordinary_human_review_required'),
      `${plan.geographyId} human-evidence route is wrong`,
    )
  }

  for (const binding of sourceMap.bindings) {
    const source = sources.get(binding.sourceCandidateId)
    assert(source, `${binding.sourceBindingId} references a missing source`)
    usedSources.add(binding.sourceCandidateId)
    assert(binding.cellId === cellId(binding.geographyId), `${binding.sourceBindingId} has the wrong cell ID`)
    assert(allowedFit[binding.candidateUse].includes(binding.boundaryFit), `${binding.sourceBindingId} use and boundary fit disagree`)
    assert(binding.targetFacetIds.every((facetId) => facetIds.has(facetId)), `${binding.sourceBindingId} targets a facet outside Field 08`)
    if (binding.geographyId === SAPMI_GEOGRAPHY) {
      assert(binding.candidateUse === 'rights_holder_authority_route', `${binding.sourceBindingId} gives Sápmi substantive desk-research credit`)
      assert(binding.boundaryFit === 'rights_holder_route_only', `${binding.sourceBindingId} gives Sápmi a non-authority-route fit`)
      assert(isRightsHolderInstitutionalSource(source), `${binding.sourceBindingId} must resolve to a consistently classified rights-holder institutional source`)
    } else {
      assert(binding.candidateUse !== 'rights_holder_authority_route', `${binding.sourceBindingId} mixes political and Sápmi authority routes`)
      assert(!isRightsHolderInstitutionalSource(source), `${binding.sourceBindingId} binds a rights-holder institutional source into the political profile`)
    }
  }
  assert(usedSources.size === sourceMap.sources.length, 'Every source candidate must have at least one cell binding')

  for (const observation of sourceMap.observations) {
    const source = sources.get(observation.sourceCandidateId)
    const binding = bindings.get(observation.sourceBindingId)
    assert(source, `${observation.observationCandidateId} references a missing source`)
    assert(binding, `${observation.observationCandidateId} references a missing binding`)
    assert(binding.sourceCandidateId === observation.sourceCandidateId, `${observation.observationCandidateId} source and binding disagree`)
    assert(binding.geographyId === observation.geographyId, `${observation.observationCandidateId} geography and binding disagree`)
    assert(
      allowedObservationTypes[binding.candidateUse].includes(observation.observationType),
      `${observation.observationCandidateId} type disagrees with ${binding.sourceBindingId} candidate use`,
    )
    validateObservationMetadata(observation)
    if (observation.geographyId === SAPMI_GEOGRAPHY) {
      assert(observation.observationType === 'authority_route_candidate', `${observation.observationCandidateId} gives Sápmi substantive desk-research credit`)
      assert(!observation.quantitative, `${observation.observationCandidateId} gives Sápmi a quantitative coverage claim`)
    }
  }
  const observedBindingIds = new Set(sourceMap.observations.map((observation) => observation.sourceBindingId))
  assert(
    [...bindings.keys()].every((bindingId) => observedBindingIds.has(bindingId)),
    'Every source binding must have at least one bounded observation candidate',
  )

  const profiles = new Map(ontology.coverageProfiles.map((profile) => [profile.id, profile]))
  for (const plan of sourceMap.geographyPlans) {
    const profile = profiles.get(plan.profileId)
    assert(profile?.geographyIds.includes(plan.geographyId), `${plan.geographyId} is not present in ${plan.profileId}`)
  }
}

function candidateState(bindings: SourceBinding[]): CandidateState {
  const states = new Set(bindings.map((binding) => binding.candidateUse))
  if (states.has('boundary_reconciliation_candidate')) return 'boundary_reconciliation_required'
  if (states.has('substantive_measurement_candidate')) return 'substantive_candidate_identified'
  if (states.has('method_candidate')) return 'method_candidate_identified'
  if (states.has('policy_context_candidate') || states.has('regional_context_candidate') || states.has('data_gap_candidate')) return 'context_candidate_identified'
  if (states.has('rights_holder_authority_route')) return 'rights_holder_route_required'
  return 'no_candidate_identified'
}

function countFacets(records: FacetInventoryRecord[]): FacetCounts {
  return {
    total: records.length,
    substantiveCandidate: records.filter((record) => record.candidateState === 'substantive_candidate_identified').length,
    methodCandidate: records.filter((record) => record.candidateState === 'method_candidate_identified').length,
    contextCandidate: records.filter((record) => record.candidateState === 'context_candidate_identified').length,
    boundaryReconciliationRequired: records.filter((record) => record.candidateState === 'boundary_reconciliation_required').length,
    rightsHolderRouteRequired: records.filter((record) => record.candidateState === 'rights_holder_route_required').length,
    noCandidate: records.filter((record) => record.candidateState === 'no_candidate_identified').length,
  }
}

function buildFacetInventory(sourceMap: Field08SourceMap, facets: FacetDefinition[]): FacetInventoryRecord[] {
  const records: FacetInventoryRecord[] = []
  for (const plan of sourceMap.geographyPlans) {
    for (const facet of facets) {
      const bindings = sourceMap.bindings
        .filter((binding) => binding.geographyId === plan.geographyId && binding.targetFacetIds.includes(facet.facetId))
        .sort((left, right) => left.sourceBindingId.localeCompare(right.sourceBindingId))
      const withoutHash = {
        facetInventoryId: `field08.facet_candidate.${compactId(plan.geographyId)}.${facet.facetDimension}.${facet.facetId}`,
        geographyId: plan.geographyId,
        profileId: plan.profileId,
        cellId: plan.cellId,
        facetDimension: facet.facetDimension,
        facetId: facet.facetId,
        candidateState: candidateState(bindings),
        sourceBindingIds: bindings.map((binding) => binding.sourceBindingId),
        sourceCandidateIds: unique(bindings.map((binding) => binding.sourceCandidateId)),
        coverageImplication: 'none' as const,
        readinessPromotionAllowed: false as const,
        rightsHolderReviewRequired: plan.rightsHolderReviewRequired,
      }
      records.push(hashRecord(withoutHash) as FacetInventoryRecord)
    }
  }
  records.sort((left, right) => left.facetInventoryId.localeCompare(right.facetInventoryId))
  assert(records.length === 306, `Expected 306 Field 08 facet candidate rows, found ${records.length}`)
  assertUnique(records.map((record) => record.facetInventoryId), 'Facet inventory IDs')
  return records
}

function buildGeographyCandidates(sourceMap: Field08SourceMap, facets: FacetInventoryRecord[]): GeographyCandidate[] {
  return sourceMap.geographyPlans
    .map((plan) => {
      const bindings = sourceMap.bindings.filter((binding) => binding.geographyId === plan.geographyId)
      const observations = sourceMap.observations.filter((observation) => observation.geographyId === plan.geographyId)
      const geographyFacets = facets.filter((facet) => facet.geographyId === plan.geographyId)
      const withoutHash = {
        geographyCandidateId: `field08.geography_candidate.${compactId(plan.geographyId)}`,
        ...plan,
        subjectMatterState: 'unassessed' as const,
        coverageImplication: 'none' as const,
        readinessResult: null,
        candidateSourceIds: unique(bindings.map((binding) => binding.sourceCandidateId)),
        candidateBindingIds: bindings.map((binding) => binding.sourceBindingId).sort(),
        observationCandidateIds: observations.map((observation) => observation.observationCandidateId).sort(),
        facetCounts: countFacets(geographyFacets),
        assessmentEventCreated: false as const,
        externalUseAllowed: false as const,
      }
      return hashRecord(withoutHash) as GeographyCandidate
    })
    .sort((left, right) => left.geographyId.localeCompare(right.geographyId))
}

function sumFacetCounts(records: FacetInventoryRecord[]): FacetCounts {
  return countFacets(records)
}

function buildProfileSummary(
  profileId: ProfileId,
  sourceMap: Field08SourceMap,
  geographyCandidates: GeographyCandidate[],
  facets: FacetInventoryRecord[],
): ProfileSummary {
  const geographies = new Set(geographyCandidates.filter((candidate) => candidate.profileId === profileId).map((candidate) => candidate.geographyId))
  const bindings = sourceMap.bindings.filter((binding) => geographies.has(binding.geographyId))
  const observations = sourceMap.observations.filter((observation) => geographies.has(observation.geographyId))
  const profileFacets = facets.filter((facet) => facet.profileId === profileId)
  return {
    aggregationClass: profileId === SAPMI_PROFILE_ID ? 'sapmi_overlapping' : 'political_nordic',
    geographyCount: geographies.size,
    sourceCandidateCount: new Set(bindings.map((binding) => binding.sourceCandidateId)).size,
    bindingCount: bindings.length,
    observationCandidateCount: observations.length,
    facetCounts: sumFacetCounts(profileFacets),
    coveragePromotionCount: 0,
    externalReadyClaimCount: 0,
  }
}

function renderList(items: string[]): string {
  return items.map((item) => `- ${item}`).join('\n')
}

function renderFacetGroups(records: FacetInventoryRecord[]): string {
  const states: CandidateState[] = [
    'substantive_candidate_identified',
    'method_candidate_identified',
    'context_candidate_identified',
    'boundary_reconciliation_required',
    'rights_holder_route_required',
    'no_candidate_identified',
  ]
  return states
    .map((state) => {
      const ids = records.filter((record) => record.candidateState === state).map((record) => `\`${record.facetId}\``)
      return ids.length ? `- **${state}:** ${ids.join(', ')}` : ''
    })
    .filter(Boolean)
    .join('\n')
}

function renderReport(sourceMap: Field08SourceMap, register: Field08CandidateRegister, ontology: Ontology): string {
  const geographyLabels = new Map(ontology.dimensions.geographies.map((geography) => [geography.id, geography.labelEn]))
  const lines: string[] = [
    '# Field 08 research candidate report',
    '',
    `Generated from source commit \`${register.baseCommit}\` on ${register.generatedAt}.`,
    '',
    '> Status: draft candidate intake only. A source lead, locator or facet match is not an evidence-backed assessment. This report creates zero readiness results, zero coverage promotions and zero external-ready claims.',
    '',
    '## Boundary',
    '',
    sourceMap.researchBoundary.completionStatement,
    '',
    `The pilot contains ${register.recordCounts.sourceCandidates} source candidates, ${register.recordCounts.sourceBindings} source-to-cell bindings, ${register.recordCounts.observationCandidates} observation candidates and ${register.recordCounts.facetInventoryRows} explicit geography–facet rows. The 272 political rows and 34 Sápmi rows are reported separately and are never aggregated.`,
    '',
    '## Geography summary',
    '',
    '| Geography | Sources | Observations | Substantive | Method | Context | Boundary review | Rights-holder route | No candidate | Cell state |',
    '| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |',
  ]
  for (const geography of register.geographyCandidates) {
    const counts = geography.facetCounts
    lines.push(`| ${geographyLabels.get(geography.geographyId) ?? geography.geographyId} | ${geography.candidateSourceIds.length} | ${geography.observationCandidateIds.length} | ${counts.substantiveCandidate} | ${counts.methodCandidate} | ${counts.contextCandidate} | ${counts.boundaryReconciliationRequired} | ${counts.rightsHolderRouteRequired} | ${counts.noCandidate} | unassessed |`)
  }
  lines.push('', '## Geography ledgers', '')

  const sourceById = new Map(sourceMap.sources.map((source) => [source.sourceCandidateId, source]))
  const bindingById = new Map(sourceMap.bindings.map((binding) => [binding.sourceBindingId, binding]))
  for (const geography of register.geographyCandidates) {
    const label = geographyLabels.get(geography.geographyId) ?? geography.geographyId
    const observations = sourceMap.observations.filter((observation) => observation.geographyId === geography.geographyId)
    const facets = register.facetInventory.filter((facet) => facet.geographyId === geography.geographyId)
    lines.push(`### ${label}`, '', `Cell: \`${geography.cellId}\``, '', `Boundary: ${geography.geographyBoundaryNote}`, '', '**Candidate sources**', '')
    if (geography.candidateSourceIds.length === 0) {
      lines.push('- No source candidate registered.')
    } else {
      for (const sourceId of geography.candidateSourceIds) {
        const source = sourceById.get(sourceId)!
        const date = source.publicationDate ?? 'publication date unknown'
        lines.push(`- [${source.title}](${source.sourceUrl}) — ${source.publisher}; ${date}; locator: ${source.exactLocator.value}; archive: locator only; review: pending.`)
        lines.push(`  - Source limitations: ${source.limitations.join(' ')}`)
      }
    }
    lines.push('', '**Observation candidates**', '')
    if (observations.length === 0) lines.push('- No observation candidate registered.')
    else {
      for (const observation of observations) {
        const binding = bindingById.get(observation.sourceBindingId)!
        const metadataGaps = observation.metadataGaps.length ? observation.metadataGaps.map((gap) => `\`${gap}\``).join(', ') : 'none declared at intake'
        lines.push(`- ${observation.statement}`)
        lines.push(`  - Candidate use: \`${binding.candidateUse}\`; boundary fit: \`${binding.boundaryFit}\`; status: \`${observation.candidateStatus}\`; external use: blocked.`)
        lines.push(`  - Locator: ${observation.exactLocator.value} (\`${observation.exactLocator.locatorStatus}\`); metadata gaps: ${metadataGaps}.`)
        lines.push(`  - Observation limitations: ${observation.limitations.join(' ')}`)
      }
    }
    lines.push('', '**Facet lead states**', '', renderFacetGroups(facets), '', '**Explicit unknowns**', '', renderList(geography.explicitUnknowns), '', '**Next actions**', '', renderList(geography.nextActions), '')
  }

  lines.push(
    '## Safety and interpretation',
    '',
    '- The existing 117 historical scope-registration events are unchanged; all nine Field 08 ledger cells remain scope registrations with no subject-matter assessment.',
    '- `substantive_candidate_identified` means a direct measurement lead was located. It does not mean the locator, method, boundary, archive, appraisal or completeness has passed review.',
    '- Method, context and boundary-reconciliation leads never count as subject-matter coverage.',
    '- Sápmi receives zero substantive desk-research credit. Its records identify authority, consent and rights-holder review routes only.',
    '- Unknown facets remain explicit and never render as zero or not applicable.',
    '',
  )
  return `${lines.join('\n').trimEnd()}\n`
}

export function buildField08ResearchArtifacts(
  root = process.cwd(),
  options: { baseCommit?: string } = {},
): Field08ResearchArtifacts {
  const baseCommit = options.baseCommit ?? runGit(root, ['rev-parse', 'HEAD'])
  verifyBaseCommit(root, baseCommit)
  const sourceMap = readJson<Field08SourceMap>(root, SOURCE_MAP_PATH)
  const ontology = readJson<Ontology>(root, ONTOLOGY_PATH)
  validateWithSchema(root, SOURCE_SCHEMA_PATH, sourceMap, SOURCE_MAP_PATH)
  validateProfiles(ontology)
  const facets = field08FacetDefinitions(ontology)
  validateSourceMap(sourceMap, ontology, facets)
  const historicalState = readHistoricalState(root)

  const inputPaths = [
    SOURCE_MAP_PATH,
    SOURCE_SCHEMA_PATH,
    REGISTER_SCHEMA_PATH,
    ONTOLOGY_PATH,
    COVERAGE_LEDGER_PATH,
    HISTORICAL_ASSESSMENTS_PATH,
    CONSTITUTION_PATH,
    FIELD08_README_PATH,
    GENERATOR_PATH,
    COVERAGE_GENERATOR_PATH,
  ]
  const inputSnapshots = inputPaths.map((path) => snapshotArtifact(root, path, baseCommit))
  const historicalAssessmentSnapshot = inputSnapshots.find((snapshot) => snapshot.path === HISTORICAL_ASSESSMENTS_PATH)
  assert(historicalAssessmentSnapshot, 'Historical assessment snapshot was not created')

  const facetInventory = buildFacetInventory(sourceMap, facets)
  const geographyCandidates = buildGeographyCandidates(sourceMap, facetInventory)
  const sapmiCandidate = geographyCandidates.find((candidate) => candidate.geographyId === SAPMI_GEOGRAPHY)
  assert(sapmiCandidate, 'Sápmi geography candidate is missing')
  assert(sapmiCandidate.facetCounts.substantiveCandidate === 0, 'Sápmi cannot receive substantive coverage credit from desk research')
  assert(sapmiCandidate.facetCounts.methodCandidate === 0, 'Sápmi cannot receive method coverage credit from desk research')
  assert(sapmiCandidate.facetCounts.contextCandidate === 0, 'Sápmi cannot receive context coverage credit from desk research')

  const registerWithoutHash = {
    documentType: 'field08_research_candidate_register' as const,
    schemaVersion: '1.0.0' as const,
    registerId: 'registry.field08_research_candidates.v1' as const,
    registryStatus: 'draft_candidate_only' as const,
    generatedAt: sourceMap.observedAt,
    baseCommit,
    generatorVersion: GENERATOR_VERSION,
    ontologyVersion: ontology.ontologyVersion,
    mapId: sourceMap.mapId,
    legacyFieldId: sourceMap.legacyFieldId,
    semantics: sourceMap.semantics,
    baselineGuard: {
      historicalAssessmentPath: HISTORICAL_ASSESSMENTS_PATH,
      historicalAssessmentSnapshot,
      historicalEventCount: historicalState.historicalEventCount as 117,
      field08CellCount: historicalState.field08CellCount as 9,
      field08ScopeRegistrationCount: 9 as const,
      field08SubjectMatterAssessmentCount: 0 as const,
      historicalAssessmentWriteCount: 0 as const,
    },
    sourceCandidates: [...sourceMap.sources].sort((left, right) => left.sourceCandidateId.localeCompare(right.sourceCandidateId)),
    sourceBindings: [...sourceMap.bindings].sort((left, right) => left.sourceBindingId.localeCompare(right.sourceBindingId)),
    observationCandidates: [...sourceMap.observations].sort((left, right) => left.observationCandidateId.localeCompare(right.observationCandidateId)),
    geographyCandidates,
    facetInventory,
    profileSummaries: {
      [POLITICAL_PROFILE_ID]: buildProfileSummary(POLITICAL_PROFILE_ID, sourceMap, geographyCandidates, facetInventory),
      [SAPMI_PROFILE_ID]: buildProfileSummary(SAPMI_PROFILE_ID, sourceMap, geographyCandidates, facetInventory),
    },
    recordCounts: {
      sourceCandidates: sourceMap.sources.length,
      sourceBindings: sourceMap.bindings.length,
      observationCandidates: sourceMap.observations.length,
      geographyCandidates: 9 as const,
      politicalGeographies: 8 as const,
      sapmiGeographies: 1 as const,
      facetInventoryRows: 306 as const,
    },
    safetySummary: {
      coverageAssessmentEventsCreated: 0 as const,
      coverageCellsPromoted: 0 as const,
      readinessResultsCreated: 0 as const,
      externalReadyClaimsCreated: 0 as const,
      politicalSapmiAggregationsCreated: 0 as const,
      sapmiSubstantiveCoverageCredit: 0 as const,
      historicalCoverageFilesModified: 0 as const,
    },
  }
  const register = hashRecord(registerWithoutHash) as Field08CandidateRegister
  validateWithSchema(root, REGISTER_SCHEMA_PATH, register, REGISTER_PATH)
  const registerJson = `${JSON.stringify(register, null, 2)}\n`
  const reportMarkdown = renderReport(sourceMap, register, ontology)

  const manifestWithoutHash = {
    documentType: 'field08_research_generation_manifest' as const,
    schemaVersion: '1.0.0' as const,
    generator: GENERATOR_PATH,
    generatorVersion: GENERATOR_VERSION,
    registerId: register.registerId,
    registryStatus: register.registryStatus,
    generatedAt: sourceMap.observedAt,
    baseCommit,
    commitMarkerSemantics: 'This manifest is written last. Its pinned source commit and output hashes must reproduce before the candidate register is accepted. It is not an evidence or coverage receipt.',
    inputSnapshots,
    outputs: [
      { path: REGISTER_PATH, sha256: sha256(registerJson), sizeBytes: Buffer.byteLength(registerJson) },
      { path: REPORT_PATH, sha256: sha256(reportMarkdown), sizeBytes: Buffer.byteLength(reportMarkdown) },
    ],
  }
  const generationManifest = hashRecord(manifestWithoutHash)
  validateWithSchema(root, SOURCE_SCHEMA_PATH, generationManifest, GENERATION_MANIFEST_PATH)
  const generationManifestJson = `${JSON.stringify(generationManifest, null, 2)}\n`

  return { baseCommit, sourceMap, register, inputSnapshots, registerJson, reportMarkdown, generationManifestJson }
}

function resolveBaseCommit(root: string, check: boolean, explicit?: string): string {
  if (explicit) return runGit(root, ['rev-parse', `${explicit}^{commit}`])
  if (check) {
    assert(existsSync(resolve(root, GENERATION_MANIFEST_PATH)), `Missing ${GENERATION_MANIFEST_PATH}`)
    const manifest = readJson<{ baseCommit?: unknown }>(root, GENERATION_MANIFEST_PATH)
    assert(typeof manifest.baseCommit === 'string', 'Generation manifest has no baseCommit')
    return manifest.baseCommit
  }
  return runGit(root, ['rev-parse', 'HEAD'])
}

export function writeOrCheckField08Research(
  root: string,
  artifacts: Field08ResearchArtifacts,
  check: boolean,
) {
  const bundle = [
    { path: REGISTER_PATH, content: artifacts.registerJson },
    { path: REPORT_PATH, content: artifacts.reportMarkdown },
    { path: GENERATION_MANIFEST_PATH, content: artifacts.generationManifestJson },
  ]
  if (check) {
    for (const item of bundle) {
      const target = resolve(root, item.path)
      assert(existsSync(target), `Missing generated file: ${item.path}`)
      assert(readFileSync(target, 'utf8') === item.content, `Generated file is stale: ${item.path}`)
    }
    return
  }

  const staged: Array<{ target: string; temporary: string }> = []
  try {
    for (const [index, item] of bundle.entries()) {
      const target = resolve(root, item.path)
      mkdirSync(dirname(target), { recursive: true })
      const temporary = resolve(dirname(target), `.${basename(target)}.${process.pid}.${index}.tmp`)
      if (existsSync(temporary)) unlinkSync(temporary)
      writeFileSync(temporary, item.content, { encoding: 'utf8', flag: 'wx' })
      staged.push({ target, temporary })
    }
    const manifest = staged.pop()
    assert(manifest, 'Generation manifest was not staged')
    for (const item of staged) renameSync(item.temporary, item.target)
    renameSync(manifest.temporary, manifest.target)
  } finally {
    for (const item of staged) if (existsSync(item.temporary)) unlinkSync(item.temporary)
  }
}

export function parseField08CliArgs(args: string[]): { check: boolean; baseCommit?: string } {
  let check = false
  let baseCommit: string | undefined
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]
    if (argument === '--check') {
      assert(!check, 'Duplicate --check argument')
      check = true
      continue
    }
    if (argument.startsWith('--base-commit=')) {
      assert(baseCommit === undefined, 'Duplicate --base-commit argument')
      const value = argument.slice('--base-commit='.length)
      assert(value.length > 0, '--base-commit requires a value')
      baseCommit = value
      continue
    }
    if (argument === '--base-commit') {
      assert(baseCommit === undefined, 'Duplicate --base-commit argument')
      const value = args[index + 1]
      assert(value && !value.startsWith('--'), '--base-commit requires a value')
      baseCommit = value
      index += 1
      continue
    }
    throw new Error(`Unknown argument: ${argument}`)
  }
  return { check, baseCommit }
}

export function run(root = process.cwd(), args = process.argv.slice(2)) {
  const { check, baseCommit: explicitBaseCommit } = parseField08CliArgs(args)
  const baseCommit = resolveBaseCommit(root, check, explicitBaseCommit)
  const artifacts = buildField08ResearchArtifacts(root, { baseCommit })
  writeOrCheckField08Research(root, artifacts, check)
  const political = artifacts.register.profileSummaries[POLITICAL_PROFILE_ID].facetCounts
  const sapmi = artifacts.register.profileSummaries[SAPMI_PROFILE_ID].facetCounts
  console.log(
    `Field 08 research candidates ${check ? 'verified' : 'generated'}: sources=${artifacts.register.recordCounts.sourceCandidates}; observations=${artifacts.register.recordCounts.observationCandidates}; political substantive facet leads=${political.substantiveCandidate}/272; Sápmi substantive credit=${sapmi.substantiveCandidate}; coverage promotions=0`,
  )
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    run()
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  }
}
