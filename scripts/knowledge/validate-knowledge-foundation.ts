import { createHash } from 'node:crypto'
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { extname, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'

const ONTOLOGY_PATH = 'knowledge/schema/nordic-food-system-ontology.v1.json'
const KNOWLEDGE_OBJECT_SCHEMA_PATH = 'knowledge/schema/knowledge-object.schema.v1.json'
const COVERAGE_LEDGER_SCHEMA_PATH = 'knowledge/schema/coverage-ledger.schema.v1.json'
const COVERAGE_CELLS_PATH = 'knowledge/coverage/coverage-cells.v1.csv'
const COVERAGE_LEDGER_PATH = 'knowledge/coverage/coverage-ledger.v1.jsonl'
const COVERAGE_ASSESSMENTS_PATH = 'knowledge/coverage/coverage-assessments-baseline.v1.jsonl'
const COVERAGE_SOURCE_SNAPSHOTS_PATH = 'knowledge/coverage/coverage-source-snapshots.v1.json'
const DEFAULT_OBJECTS_PATH = 'knowledge/objects'

type JsonObject = Record<string, unknown>

type OntologyTerm = {
  id: string
  deprecated?: boolean
  aggregationClass?: string
}

type CoverageAxis = {
  dimension: string
  ids: string[]
}

type CoverageProfile = {
  id: string
  aggregationClass?: string
  geographyIds: string[]
  axes: CoverageAxis[]
}

type Ontology = {
  ontologyVersion: string
  dimensions: Record<string, OntologyTerm[]>
  statusModel: Record<string, string[]>
  coverageProfiles: CoverageProfile[]
}

export type KnowledgeValidationIssue = {
  objectId: string | null
  path: string
  code: string
  message: string
}

export type KnowledgeValidationResult = {
  valid: boolean
  issues: KnowledgeValidationIssue[]
}

export type KnowledgeValidationOptions = {
  root?: string
  knownObjectIds?: Iterable<string>
  requireResolvedReferences?: boolean
}

export type CoverageFoundationInput = {
  cells: unknown[]
  assessments: unknown[]
  sourceSnapshots: unknown
  ledgerRecords?: unknown[]
}

export type CoverageValidationResult = KnowledgeValidationResult & {
  cellCount: number
  assessmentCount: number
}

type ValidationContext = {
  ontology: Ontology
  dimensionIds: Map<string, Set<string>>
  deprecatedIds: Set<string>
  coverageCellIds: Set<string>
  knownObjectIds: Set<string>
  requireResolvedReferences: boolean
}

const FACET_DIMENSIONS: Record<string, string> = {
  geographyIds: 'geographies',
  representedGeographyIds: 'geographies',
  missingGeographyIds: 'geographies',
  notApplicableGeographyIds: 'geographies',
  stageIds: 'valueChainStages',
  domainIds: 'domains',
  outcomeIds: 'outcomes',
  actorClassIds: 'actorClasses',
  flowClassIds: 'flowClasses',
  commodityGroupIds: 'commodityGroups',
  materialGroupIds: 'materialGroups',
  circularStrategyIds: 'circularStrategies',
  ownershipFormIds: 'ownershipForms',
}

const FIVE_STATE_GEOGRAPHIES = ['geo.no', 'geo.se', 'geo.dk', 'geo.fi', 'geo.is']
const WHOLE_POLITICAL_NORDIC_GEOGRAPHIES = [...FIVE_STATE_GEOGRAPHIES, 'geo.fo', 'geo.gl', 'geo.ax']

const COVERAGE_STATUS_FIELDS: Record<string, string> = {
  workflowStage: 'workflowStages',
  scopeState: 'scopeStates',
  inventoryState: 'inventoryStates',
  knowledgeDepth: 'knowledgeDepths',
  verificationStatus: 'verificationStatuses',
  citationReadiness: 'citationReadiness',
  appraisalState: 'appraisalStates',
  freshnessState: 'freshnessStates',
  temporalDepth: 'temporalDepths',
  archiveState: 'archiveStates',
  confidence: 'confidenceStates',
  assessmentWorkflowState: 'assessmentWorkflowStates',
  evidenceBasis: 'evidenceBasis',
}

type CanonicalJsonValue = null | string | number | boolean | CanonicalJsonValue[] | { [key: string]: CanonicalJsonValue }

function canonicalize(value: unknown): CanonicalJsonValue {
  if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value
  }
  if (Array.isArray(value)) return value.map(canonicalize)
  if (!isObject(value)) throw new Error('Cannot canonicalize non-JSON value')
  const result: Record<string, CanonicalJsonValue> = {}
  for (const key of Object.keys(value).sort()) {
    const item = value[key]
    if (item !== undefined) result[key] = canonicalize(item)
  }
  return result
}

export function canonicalJson(value: unknown): string {
  return JSON.stringify(canonicalize(value))
}

export function canonicalSha256(value: unknown): string {
  return `sha256:${createHash('sha256').update(canonicalJson(value)).digest('hex')}`
}

function compactControlledId(id: string): string {
  return id.replace(/^[^.]+\./, '')
}

function dimensionToken(dimension: string): string {
  return dimension.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toLowerCase()
}

function coverageCellId(profileId: string, geographyId: string, bindings: Array<{ dimension: string; valueId: string }>): string {
  const tokens = [
    `profile=${compactControlledId(profileId)}`,
    `geography=${compactControlledId(geographyId)}`,
    ...[...bindings]
      .sort((left, right) => left.dimension.localeCompare(right.dimension))
      .map((binding) => `${dimensionToken(binding.dimension)}=${compactControlledId(binding.valueId)}`),
  ]
  return `cov.v1.${tokens.join('.')}`
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asObject(value: unknown): JsonObject {
  return isObject(value) ? value : {}
}

function asStrings(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

function readJson(root: string, relativePath: string): unknown {
  return JSON.parse(readFileSync(resolve(root, relativePath), 'utf8')) as unknown
}

function readCoverageCellIds(root: string): Set<string> {
  const lines = readFileSync(resolve(root, COVERAGE_CELLS_PATH), 'utf8').trim().split(/\r?\n/)
  const header = lines.shift()
  if (!header?.startsWith('cell_id,')) throw new Error(`Unexpected coverage-cell header in ${COVERAGE_CELLS_PATH}`)
  return new Set(lines.map((line) => line.slice(0, line.indexOf(','))).filter(Boolean))
}

function issue(
  issues: KnowledgeValidationIssue[],
  objectId: string | null,
  path: string,
  code: string,
  message: string,
) {
  issues.push({ objectId, path, code, message })
}

function setEquals(left: Set<string>, right: Set<string>): boolean {
  return left.size === right.size && [...left].every((value) => right.has(value))
}

function overlap(left: Set<string>, right: Set<string>): string[] {
  return [...left].filter((value) => right.has(value))
}

function validateControlledId(
  value: unknown,
  dimension: string,
  path: string,
  objectId: string | null,
  context: ValidationContext,
  issues: KnowledgeValidationIssue[],
) {
  if (value === null || value === undefined) return
  if (typeof value !== 'string') return
  const allowed = context.dimensionIds.get(dimension)
  if (!allowed) {
    issue(issues, objectId, path, 'ontology_dimension_missing', `Ontology dimension ${dimension} is missing`)
    return
  }
  if (context.deprecatedIds.has(value)) {
    issue(issues, objectId, path, 'deprecated_ontology_id', `${value} is deprecated`)
  } else if (!allowed.has(value)) {
    issue(issues, objectId, path, 'unknown_ontology_id', `${value} is not a current ${dimension} ID`)
  }
}

function validateControlledIds(
  value: unknown,
  dimension: string,
  path: string,
  objectId: string | null,
  context: ValidationContext,
  issues: KnowledgeValidationIssue[],
) {
  for (const [index, id] of asStrings(value).entries()) {
    validateControlledId(id, dimension, `${path}/${index}`, objectId, context, issues)
  }
}

function validateStatus(
  value: unknown,
  vocabulary: string,
  path: string,
  objectId: string | null,
  context: ValidationContext,
  issues: KnowledgeValidationIssue[],
) {
  if (typeof value !== 'string') return
  if (!context.ontology.statusModel[vocabulary]?.includes(value)) {
    issue(issues, objectId, path, 'unknown_status', `${value} is not in ontology status vocabulary ${vocabulary}`)
  }
}

function validateReference(
  targetId: unknown,
  path: string,
  objectId: string | null,
  context: ValidationContext,
  issues: KnowledgeValidationIssue[],
) {
  if (typeof targetId !== 'string' || !context.requireResolvedReferences) return
  if (!context.knownObjectIds.has(targetId)) {
    issue(issues, objectId, path, 'unresolved_reference', `${targetId} is not present in the validated object set or knownObjectIds`)
  }
}

function validateOntologyMembership(
  object: JsonObject,
  context: ValidationContext,
  issues: KnowledgeValidationIssue[],
) {
  const objectId = typeof object.id === 'string' ? object.id : null
  validateControlledId(object.objectTypeId, 'knowledgeObjectTypes', '/objectTypeId', objectId, context, issues)
  validateStatus(object.operationalRoute, 'gapRoutes', '/operationalRoute', objectId, context, issues)
  if (object.claimStatus !== undefined) validateStatus(object.claimStatus, 'claimStatuses', '/claimStatus', objectId, context, issues)

  const facets = asObject(object.facets)
  for (const [field, dimension] of Object.entries(FACET_DIMENSIONS)) {
    validateControlledIds(facets[field], dimension, `/facets/${field}`, objectId, context, issues)
  }
  validateControlledId(facets.actorEntityTypeId, 'entityTypes', '/facets/actorEntityTypeId', objectId, context, issues)

  validateControlledIds(object.legacyFieldIds, 'legacyFields', '/legacyFieldIds', objectId, context, issues)
  for (const [index, cellId] of asStrings(object.coverageCellIds).entries()) {
    if (!context.coverageCellIds.has(cellId)) {
      issue(issues, objectId, `/coverageCellIds/${index}`, 'unknown_coverage_cell', `${cellId} is not a generated coverage-cell ID`)
    }
  }

  const evidence = asObject(object.evidence)
  validateStatus(evidence.evidenceBasis, 'evidenceBasis', '/evidence/evidenceBasis', objectId, context, issues)
  validateStatus(evidence.verificationStatus, 'verificationStatuses', '/evidence/verificationStatus', objectId, context, issues)
  validateStatus(evidence.citationReadiness, 'citationReadiness', '/evidence/citationReadiness', objectId, context, issues)
  validateStatus(evidence.appraisalState, 'appraisalStates', '/evidence/appraisalState', objectId, context, issues)

  for (const [index, rawRef] of (Array.isArray(evidence.sourceRefs) ? evidence.sourceRefs : []).entries()) {
    const sourceRef = asObject(rawRef)
    validateStatus(sourceRef.sourceClass, 'sourceClasses', `/evidence/sourceRefs/${index}/sourceClass`, objectId, context, issues)
    validateStatus(sourceRef.verificationStatus, 'verificationStatuses', `/evidence/sourceRefs/${index}/verificationStatus`, objectId, context, issues)
    validateReference(sourceRef.sourceId, `/evidence/sourceRefs/${index}/sourceId`, objectId, context, issues)
  }

  const lensAssessments = asObject(object.lensAssessments)
  const lensIds = context.dimensionIds.get('crossCuttingLenses') ?? new Set<string>()
  for (const [lensId, rawAssessment] of Object.entries(lensAssessments)) {
    validateControlledId(lensId, 'crossCuttingLenses', `/lensAssessments/${lensId}`, objectId, context, issues)
    const assessment = asObject(rawAssessment)
    validateStatus(assessment.state, 'lensAssessmentStates', `/lensAssessments/${lensId}/state`, objectId, context, issues)
  }
  for (const lensId of lensIds) {
    if (!(lensId in lensAssessments)) {
      issue(issues, objectId, '/lensAssessments', 'missing_mandatory_lens', `Missing mandatory lens ${lensId}`)
    }
  }

  const caseState = asObject(object.caseState)
  if (object.caseState !== undefined) {
    validateStatus(caseState.maturityState, 'maturityStates', '/caseState/maturityState', objectId, context, issues)
    validateStatus(caseState.realizationState, 'realizationStates', '/caseState/realizationState', objectId, context, issues)
  }

  const comparisonScope = asObject(object.comparisonScope)
  validateControlledIds(comparisonScope.memberGeographyIds, 'geographies', '/comparisonScope/memberGeographyIds', objectId, context, issues)

  const physicalFlow = asObject(object.physicalFlow)
  if (object.physicalFlow !== undefined) {
    validateControlledId(physicalFlow.flowClassId, 'flowClasses', '/physicalFlow/flowClassId', objectId, context, issues)
    validateControlledId(physicalFlow.stageFromId, 'valueChainStages', '/physicalFlow/stageFromId', objectId, context, issues)
    validateControlledId(physicalFlow.stageToId, 'valueChainStages', '/physicalFlow/stageToId', objectId, context, issues)
    validateControlledId(physicalFlow.originGeographyId, 'geographies', '/physicalFlow/originGeographyId', objectId, context, issues)
    validateControlledId(physicalFlow.destinationGeographyId, 'geographies', '/physicalFlow/destinationGeographyId', objectId, context, issues)
    validateControlledId(physicalFlow.tradeDirectionId, 'tradeDirections', '/physicalFlow/tradeDirectionId', objectId, context, issues)
    validateControlledId(physicalFlow.commodityGroupId, 'commodityGroups', '/physicalFlow/commodityGroupId', objectId, context, issues)
    validateControlledId(physicalFlow.materialGroupId, 'materialGroups', '/physicalFlow/materialGroupId', objectId, context, issues)
    validateStatus(physicalFlow.realizationState, 'realizationStates', '/physicalFlow/realizationState', objectId, context, issues)
    validateReference(physicalFlow.fromEntityId, '/physicalFlow/fromEntityId', objectId, context, issues)
    validateReference(physicalFlow.toEntityId, '/physicalFlow/toEntityId', objectId, context, issues)
  }

  const relationship = asObject(object.relationship)
  if (object.relationship !== undefined) {
    validateControlledId(relationship.relationshipClassId, 'flowClasses', '/relationship/relationshipClassId', objectId, context, issues)
    validateStatus(relationship.realizationState, 'realizationStates', '/relationship/realizationState', objectId, context, issues)
    validateReference(relationship.fromId, '/relationship/fromId', objectId, context, issues)
    validateReference(relationship.toId, '/relationship/toId', objectId, context, issues)
  }

  const stock = asObject(object.stock)
  if (object.stock !== undefined) {
    validateControlledId(stock.geographyId, 'geographies', '/stock/geographyId', objectId, context, issues)
    validateControlledId(stock.stageId, 'valueChainStages', '/stock/stageId', objectId, context, issues)
    validateControlledId(stock.commodityGroupId, 'commodityGroups', '/stock/commodityGroupId', objectId, context, issues)
    validateControlledId(stock.materialGroupId, 'materialGroups', '/stock/materialGroupId', objectId, context, issues)
    validateStatus(stock.realizationState, 'realizationStates', '/stock/realizationState', objectId, context, issues)
    validateReference(stock.subjectId, '/stock/subjectId', objectId, context, issues)
  }

  const metricIndicator = asObject(object.metricIndicator)
  if (object.metricIndicator !== undefined) {
    validateControlledIds(metricIndicator.geographyIds, 'geographies', '/metricIndicator/geographyIds', objectId, context, issues)
    validateReference(metricIndicator.metricId, '/metricIndicator/metricId', objectId, context, issues)
    for (const [index, subjectId] of asStrings(metricIndicator.subjectIds).entries()) {
      validateReference(subjectId, `/metricIndicator/subjectIds/${index}`, objectId, context, issues)
    }
  }

  for (const [index, rawRelation] of (Array.isArray(object.relations) ? object.relations : []).entries()) {
    const relation = asObject(rawRelation)
    validateReference(relation.targetId, `/relations/${index}/targetId`, objectId, context, issues)
    if (relation.targetId === objectId) {
      issue(issues, objectId, `/relations/${index}/targetId`, 'self_relation', 'A knowledge object cannot relate to itself')
    }
  }
  for (const [index, supersededId] of asStrings(object.supersedesIds).entries()) {
    validateReference(supersededId, `/supersedesIds/${index}`, objectId, context, issues)
    if (supersededId === objectId) {
      issue(issues, objectId, `/supersedesIds/${index}`, 'self_supersession', 'A knowledge object cannot supersede itself')
    }
  }
}

function validateGeographyAccounting(
  object: JsonObject,
  context: ValidationContext,
  issues: KnowledgeValidationIssue[],
) {
  const objectId = typeof object.id === 'string' ? object.id : null
  const facets = asObject(object.facets)
  const geographyIds = new Set(asStrings(facets.geographyIds))
  const represented = new Set(asStrings(facets.representedGeographyIds))
  const missing = new Set(asStrings(facets.missingGeographyIds))
  const notApplicable = new Set(asStrings(facets.notApplicableGeographyIds))
  const external = asObject(object.evidence).citationReadiness === 'citable_external'
  const nordicAggregate = geographyIds.has('geo.nordic')

  if (!external && !nordicAggregate) return

  for (const [leftName, left, rightName, right] of [
    ['represented', represented, 'missing', missing],
    ['represented', represented, 'notApplicable', notApplicable],
    ['missing', missing, 'notApplicable', notApplicable],
  ] as const) {
    const duplicated = overlap(left, right)
    if (duplicated.length > 0) {
      issue(
        issues,
        objectId,
        '/facets',
        'overlapping_geography_accounting',
        `${leftName} and ${rightName} geography sets overlap: ${duplicated.join(', ')}`,
      )
    }
  }

  const comparisonScope = asObject(object.comparisonScope)
  const expected = nordicAggregate
    ? new Set(asStrings(comparisonScope.memberGeographyIds))
    : geographyIds
  const accounted = new Set([...represented, ...missing, ...notApplicable])
  if (!setEquals(expected, accounted)) {
    issue(
      issues,
      objectId,
      '/facets',
      'incomplete_geography_accounting',
      `Represented, missing and not-applicable geography sets must exactly account for: ${[...expected].sort().join(', ')}`,
    )
  }

  if (nordicAggregate) {
    if (represented.size < 2 || (represented.size === 1 && represented.has('geo.no'))) {
      issue(issues, objectId, '/facets/representedGeographyIds', 'norway_proxy_for_nordic', 'A Nordic aggregate claim must represent at least two member geographies and cannot use Norway as the Nordic proxy')
    }
    const kind = comparisonScope.kind
    const members = new Set(asStrings(comparisonScope.memberGeographyIds))
    const required = kind === 'five_state'
      ? new Set(FIVE_STATE_GEOGRAPHIES)
      : kind === 'whole_political_nordic'
        ? new Set(WHOLE_POLITICAL_NORDIC_GEOGRAPHIES)
        : null
    if (required && !setEquals(required, members)) {
      issue(issues, objectId, '/comparisonScope/memberGeographyIds', 'invalid_comparison_scope', `${kind} must use its complete declared political geography set`)
    }
  }

  for (const geographyId of expected) {
    validateControlledId(geographyId, 'geographies', '/comparisonScope/memberGeographyIds', objectId, context, issues)
  }
}

function validateFailClosedEvidence(object: JsonObject, issues: KnowledgeValidationIssue[]) {
  const objectId = typeof object.id === 'string' ? object.id : null
  const evidence = asObject(object.evidence)
  if (evidence.citationReadiness !== 'citable_external') return

  if (object.objectTypeId === 'knowledge_object.claim' && !['controlled', 'controlled_with_caveat'].includes(String(object.claimStatus))) {
    issue(issues, objectId, '/claimStatus', 'external_claim_not_controlled', 'An externally citable claim must be controlled or controlled_with_caveat')
  }
  const causal = (Array.isArray(evidence.sourceRefs) ? evidence.sourceRefs : [])
    .some((rawRef) => asObject(rawRef).evidenceRole === 'causal_claim')
  if (causal && evidence.appraisalState !== 'reviewed') {
    issue(issues, objectId, '/evidence/appraisalState', 'causal_appraisal_required', 'A causal external claim requires reviewed appraisal; not-applicable is not allowed')
  }
}

function validateTrueC(object: JsonObject, issues: KnowledgeValidationIssue[]) {
  if (object.operationalRoute !== 'true_c') return
  const objectId = typeof object.id === 'string' ? object.id : null
  const protocol = asObject(object.searchProtocol)
  if (typeof protocol.asOf === 'string' && typeof protocol.recheckAt === 'string' && protocol.recheckAt <= protocol.asOf) {
    issue(issues, objectId, '/searchProtocol/recheckAt', 'invalid_recheck_date', 'true_c recheckAt must be later than the search asOf date')
  }
}

function validatePayloadIsolation(object: JsonObject, issues: KnowledgeValidationIssue[]) {
  const objectId = typeof object.id === 'string' ? object.id : null
  const payloadFields = {
    physical_flow: 'physicalFlow',
    relationship: 'relationship',
    stock: 'stock',
    metric_indicator: 'metricIndicator',
  } as const
  const selected = typeof object.payloadKind === 'string'
    ? payloadFields[object.payloadKind as keyof typeof payloadFields]
    : undefined
  for (const field of Object.values(payloadFields)) {
    if (object[field] !== undefined && field !== selected) {
      issue(issues, objectId, `/${field}`, 'payload_kind_mismatch', `${field} is present but payloadKind is ${String(object.payloadKind)}`)
    }
  }
}

function validateSupersessionCycles(objects: JsonObject[], issues: KnowledgeValidationIssue[]) {
  const graph = new Map<string, string[]>()
  for (const object of objects) {
    if (typeof object.id !== 'string') continue
    const relationTargets = (Array.isArray(object.relations) ? object.relations : [])
      .map(asObject)
      .filter((relation) => relation.relationType === 'supersedes')
      .map((relation) => relation.targetId)
      .filter((target): target is string => typeof target === 'string')
    graph.set(object.id, [...asStrings(object.supersedesIds), ...relationTargets])
  }

  const visiting = new Set<string>()
  const visited = new Set<string>()
  function visit(id: string, path: string[]): boolean {
    if (visiting.has(id)) {
      issue(issues, id, '/supersedesIds', 'supersession_cycle', `Supersession cycle: ${[...path, id].join(' -> ')}`)
      return true
    }
    if (visited.has(id)) return false
    visiting.add(id)
    for (const target of graph.get(id) ?? []) {
      if (graph.has(target) && visit(target, [...path, id])) return true
    }
    visiting.delete(id)
    visited.add(id)
    return false
  }
  for (const id of graph.keys()) visit(id, [])
}

type CoverageProvenance = {
  artifactSnapshotIds: Set<string>
  baselineSnapshotId: string | null
  baselineId: string | null
  baseCommit: string | null
}

function validateCoverageProvenance(
  input: unknown,
  issues: KnowledgeValidationIssue[],
): CoverageProvenance {
  const empty = {
    artifactSnapshotIds: new Set<string>(),
    baselineSnapshotId: null,
    baselineId: null,
    baseCommit: null,
  }
  if (!isObject(input)) {
    issue(issues, null, '/coverage/sourceSnapshots', 'invalid_source_snapshot_set', 'Coverage source snapshots must be a JSON object')
    return empty
  }

  const sourceSet = input
  const withoutHash = { ...sourceSet }
  delete withoutHash.sourceSnapshotSetHash
  const expectedSetHash = canonicalSha256(withoutHash)
  if (sourceSet.sourceSnapshotSetHash !== expectedSetHash) {
    issue(
      issues,
      typeof sourceSet.baselineId === 'string' ? sourceSet.baselineId : null,
      '/coverage/sourceSnapshots/sourceSnapshotSetHash',
      'source_snapshot_set_hash_mismatch',
      `Expected ${expectedSetHash}`,
    )
  }

  const artifactSnapshotIds = new Set<string>()
  const snapshots = Array.isArray(sourceSet.snapshots) ? sourceSet.snapshots : []
  for (const [index, rawSnapshot] of snapshots.entries()) {
    const snapshot = asObject(rawSnapshot)
    const snapshotId = typeof snapshot.artifactSnapshotId === 'string' ? snapshot.artifactSnapshotId : null
    if (snapshotId && artifactSnapshotIds.has(snapshotId)) {
      issue(issues, snapshotId, `/coverage/sourceSnapshots/snapshots/${index}/artifactSnapshotId`, 'duplicate_artifact_snapshot_id', `Duplicate artifact snapshot ID ${snapshotId}`)
    }
    if (snapshotId) artifactSnapshotIds.add(snapshotId)

    const snapshotPayload = {
      path: snapshot.path,
      kind: snapshot.kind,
      baseCommit: snapshot.baseCommit,
      gitObjectId: snapshot.gitObjectId,
      gitObjectType: snapshot.gitObjectType,
      entries: snapshot.entries,
    }
    const expectedHash = canonicalSha256(snapshotPayload)
    const expectedId = `artifact.v1.${expectedHash.slice('sha256:'.length, 'sha256:'.length + 20)}`
    if (snapshot.sha256 !== expectedHash) {
      issue(issues, snapshotId, `/coverage/sourceSnapshots/snapshots/${index}/sha256`, 'artifact_snapshot_hash_mismatch', `Expected ${expectedHash}`)
    }
    if (snapshotId !== expectedId) {
      issue(issues, snapshotId, `/coverage/sourceSnapshots/snapshots/${index}/artifactSnapshotId`, 'artifact_snapshot_id_mismatch', `Expected ${expectedId}`)
    }
    if (snapshot.baseCommit !== sourceSet.baseCommit) {
      issue(issues, snapshotId, `/coverage/sourceSnapshots/snapshots/${index}/baseCommit`, 'artifact_snapshot_provenance_mismatch', 'Artifact and source-set base commits differ')
    }
  }

  return {
    artifactSnapshotIds,
    baselineSnapshotId: `snapshot.v1.${expectedSetHash.slice('sha256:'.length, 'sha256:'.length + 20)}`,
    baselineId: typeof sourceSet.baselineId === 'string' ? sourceSet.baselineId : null,
    baseCommit: typeof sourceSet.baseCommit === 'string' ? sourceSet.baseCommit : null,
  }
}

function validateAssessmentSupersession(
  assessments: JsonObject[],
  issues: KnowledgeValidationIssue[],
) {
  const byId = new Map<string, JsonObject>()
  for (const assessment of assessments) {
    if (typeof assessment.assessmentId === 'string') byId.set(assessment.assessmentId, assessment)
  }
  for (const [id, assessment] of byId) {
    const target = assessment.supersedesId
    if (typeof target !== 'string') continue
    if (!byId.has(target)) {
      issue(issues, id, '/supersedesId', 'unknown_supersedes_target', `${target} is not present in the assessment history`)
    } else if (target === id) {
      issue(issues, id, '/supersedesId', 'self_supersession', 'An assessment cannot supersede itself')
    }
  }

  const visiting = new Set<string>()
  const visited = new Set<string>()
  function visit(id: string, path: string[]): boolean {
    if (visiting.has(id)) {
      issue(issues, id, '/supersedesId', 'assessment_supersession_cycle', `Assessment supersession cycle: ${[...path, id].join(' -> ')}`)
      return true
    }
    if (visited.has(id)) return false
    visiting.add(id)
    const target = byId.get(id)?.supersedesId
    if (typeof target === 'string' && byId.has(target) && visit(target, [...path, id])) return true
    visiting.delete(id)
    visited.add(id)
    return false
  }
  for (const id of byId.keys()) visit(id, [])
}

function readJsonLines(root: string, relativePath: string): unknown[] {
  const content = readFileSync(resolve(root, relativePath), 'utf8')
  return content.split(/\r?\n/).flatMap((line, index) => {
    if (line.trim().length === 0) return []
    try {
      return [JSON.parse(line) as unknown]
    } catch (error) {
      const detail = error instanceof Error ? error.message : String(error)
      throw new Error(`${relativePath}:${index + 1}: ${detail}`)
    }
  })
}

export function loadGeneratedCoverageFoundation(root = process.cwd()): CoverageFoundationInput {
  const ledgerRecords = readJsonLines(root, COVERAGE_LEDGER_PATH)
  return {
    ledgerRecords,
    cells: ledgerRecords.map((record) => asObject(record).cell),
    assessments: readJsonLines(root, COVERAGE_ASSESSMENTS_PATH),
    sourceSnapshots: readJson(root, COVERAGE_SOURCE_SNAPSHOTS_PATH),
  }
}

export function createCoverageFoundationValidator(root = process.cwd()) {
  const ontology = readJson(root, ONTOLOGY_PATH) as Ontology
  const coverageSchema = readJson(root, COVERAGE_LEDGER_SCHEMA_PATH) as JsonObject
  const validateCoverageSchema = createAjv().compile(coverageSchema)
  const profiles = new Map(ontology.coverageProfiles.map((profile) => [profile.id, profile]))
  const dimensions = new Map(
    Object.entries(ontology.dimensions).map(([dimension, terms]) => [
      dimension,
      new Map(terms.map((term) => [term.id, term])),
    ]),
  )

  return function validateCoverage(input: CoverageFoundationInput): CoverageValidationResult {
    const issues: KnowledgeValidationIssue[] = []
    const provenance = validateCoverageProvenance(input.sourceSnapshots, issues)
    const cells = input.cells.filter(isObject)
    const cellIds = new Set<string>()

    for (const [index, rawCell] of input.cells.entries()) {
      if (!isObject(rawCell)) {
        issue(issues, null, `/coverage/cells/${index}`, 'coverage_cell_not_an_object', 'Coverage cell must be a JSON object')
        continue
      }
      const cell = rawCell
      const cellId = typeof cell.cellId === 'string' ? cell.cellId : null
      if (!validateCoverageSchema(cell)) {
        const first = validateCoverageSchema.errors?.[0]
        issue(
          issues,
          cellId,
          `/coverage/cells/${index}${first?.instancePath ?? ''}`,
          `coverage_schema_${first?.keyword ?? 'invalid'}`,
          first?.message ?? 'Coverage-cell schema validation failed',
        )
      }
      if (cell.taxonomyVersion !== ontology.ontologyVersion) {
        issue(issues, cellId, '/taxonomyVersion', 'coverage_taxonomy_version_mismatch', `Expected ${ontology.ontologyVersion}`)
      }
      if (cellId) {
        if (cellIds.has(cellId)) issue(issues, cellId, '/cellId', 'duplicate_coverage_cell_id', `Duplicate coverage cell ID ${cellId}`)
        cellIds.add(cellId)
      }

      const profileId = typeof cell.profileId === 'string' ? cell.profileId : ''
      const geographyId = typeof cell.geographyId === 'string' ? cell.geographyId : ''
      const profile = profiles.get(profileId)
      if (!profile) issue(issues, cellId, '/profileId', 'unknown_coverage_profile', `${profileId} is not an ontology coverage profile`)

      const geographyTerm = dimensions.get('geographies')?.get(geographyId)
      if (!geographyTerm) {
        issue(issues, cellId, '/geographyId', 'unknown_coverage_geography', `${geographyId} is not an ontology geography`)
      } else if (geographyTerm.deprecated) {
        issue(issues, cellId, '/geographyId', 'deprecated_coverage_geography', `${geographyId} is deprecated`)
      }
      if (profile && !profile.geographyIds.includes(geographyId)) {
        issue(issues, cellId, '/geographyId', 'geography_not_in_profile', `${geographyId} is not declared by ${profileId}`)
      }

      const rawBindings = Array.isArray(cell.axisBindings) ? cell.axisBindings : []
      const bindings = rawBindings.flatMap((rawBinding) => {
        const binding = asObject(rawBinding)
        return typeof binding.dimension === 'string' && typeof binding.valueId === 'string'
          ? [{ dimension: binding.dimension, valueId: binding.valueId }]
          : []
      })
      const bindingDimensions = bindings.map((binding) => binding.dimension)
      const sortedDimensions = [...bindingDimensions].sort((left, right) => left.localeCompare(right))
      if (bindingDimensions.some((dimension, bindingIndex) => dimension !== sortedDimensions[bindingIndex])) {
        issue(issues, cellId, '/axisBindings', 'unsorted_axis_bindings', 'axisBindings must be sorted by dimension')
      }
      if (new Set(bindingDimensions).size !== bindingDimensions.length) {
        issue(issues, cellId, '/axisBindings', 'duplicate_axis_binding', 'axisBindings must contain each dimension at most once')
      }

      const profileAxes = new Map((profile?.axes ?? []).map((axis) => [axis.dimension, axis]))
      for (const [bindingIndex, binding] of bindings.entries()) {
        const ontologyTerm = dimensions.get(binding.dimension)?.get(binding.valueId)
        if (!dimensions.has(binding.dimension)) {
          issue(issues, cellId, `/axisBindings/${bindingIndex}/dimension`, 'unknown_coverage_axis', `${binding.dimension} is not an ontology dimension`)
        } else if (!ontologyTerm) {
          issue(issues, cellId, `/axisBindings/${bindingIndex}/valueId`, 'unknown_coverage_axis_id', `${binding.valueId} is not in ontology dimension ${binding.dimension}`)
        } else if (ontologyTerm.deprecated) {
          issue(issues, cellId, `/axisBindings/${bindingIndex}/valueId`, 'deprecated_coverage_axis_id', `${binding.valueId} is deprecated`)
        }
        const profileAxis = profileAxes.get(binding.dimension)
        if (profile && !profileAxis) {
          issue(issues, cellId, `/axisBindings/${bindingIndex}/dimension`, 'axis_not_in_profile', `${binding.dimension} is not declared by ${profileId}`)
        } else if (profileAxis && !profileAxis.ids.includes(binding.valueId)) {
          issue(issues, cellId, `/axisBindings/${bindingIndex}/valueId`, 'axis_value_not_in_profile', `${binding.valueId} is not declared by ${profileId}.${binding.dimension}`)
        }
      }
      for (const dimension of profileAxes.keys()) {
        if (!bindingDimensions.includes(dimension)) {
          issue(issues, cellId, '/axisBindings', 'missing_profile_axis', `${profileId} requires axis ${dimension}`)
        }
      }

      if (profileId && geographyId && bindings.length > 0) {
        const expectedId = coverageCellId(profileId, geographyId, bindings)
        if (cellId !== expectedId) {
          issue(issues, cellId, '/cellId', 'coverage_cell_id_mismatch', `Expected ${expectedId}`)
        }
      }
      const valuesByDimension = new Map(bindings.map((binding) => [binding.dimension, binding.valueId]))
      for (const [dimension, field] of [
        ['valueChainStages', 'valueChainStageId'],
        ['domains', 'domainId'],
        ['legacyFields', 'legacyFieldId'],
      ] as const) {
        const expected = valuesByDimension.get(dimension) ?? null
        if (cell[field] !== expected) {
          issue(issues, cellId, `/${field}`, 'coverage_axis_projection_mismatch', `${field} must equal the ${dimension} axis binding or null`)
        }
      }

      const profileAggregationClass = profile?.aggregationClass
        ?? (profile?.geographyIds.includes('geo.sapmi') ? 'sapmi_overlapping' : 'political_nordic')
      if (profile && cell.aggregationClass !== profileAggregationClass) {
        issue(issues, cellId, '/aggregationClass', 'profile_aggregation_class_mismatch', `${profileId} requires ${profileAggregationClass}`)
      }
      const expectedGeographyClass = geographyId === 'geo.sapmi'
        ? 'sapmi_overlapping'
        : geographyTerm?.aggregationClass === 'political_nordic'
          ? 'political_nordic'
          : null
      if (expectedGeographyClass && cell.aggregationClass !== expectedGeographyClass) {
        issue(issues, cellId, '/aggregationClass', 'geography_aggregation_class_mismatch', `${geographyId} requires ${expectedGeographyClass}`)
      }
      if (cell.aggregationClass === 'sapmi_overlapping' && geographyId !== 'geo.sapmi') {
        issue(issues, cellId, '/aggregationClass', 'sapmi_aggregation_leak', 'Sápmi overlap cells must use geo.sapmi only')
      }
      if (cell.aggregationClass === 'political_nordic' && geographyId === 'geo.sapmi') {
        issue(issues, cellId, '/aggregationClass', 'political_aggregation_leak', 'Political-Nordic cells cannot absorb geo.sapmi')
      }
    }

    for (const cell of cells) {
      const cellId = typeof cell.cellId === 'string' ? cell.cellId : null
      if (typeof cell.parentCellId === 'string' && !cellIds.has(cell.parentCellId)) {
        issue(issues, cellId, '/parentCellId', 'unknown_parent_cell', `${cell.parentCellId} is not present in the generated ledger`)
      }
      for (const [index, childId] of asStrings(cell.requiredChildCellIds).entries()) {
        if (!cellIds.has(childId)) issue(issues, cellId, `/requiredChildCellIds/${index}`, 'unknown_required_child_cell', `${childId} is not present in the generated ledger`)
      }
    }

    const assessments = input.assessments.filter(isObject)
    const assessmentIds = new Set<string>()
    for (const [index, rawAssessment] of input.assessments.entries()) {
      if (!isObject(rawAssessment)) {
        issue(issues, null, `/coverage/assessments/${index}`, 'coverage_assessment_not_an_object', 'Coverage assessment must be a JSON object')
        continue
      }
      const assessment = rawAssessment
      const assessmentId = typeof assessment.assessmentId === 'string' ? assessment.assessmentId : null
      if (!validateCoverageSchema(assessment)) {
        const first = validateCoverageSchema.errors?.[0]
        issue(
          issues,
          assessmentId,
          `/coverage/assessments/${index}${first?.instancePath ?? ''}`,
          `coverage_schema_${first?.keyword ?? 'invalid'}`,
          first?.message ?? 'Coverage-assessment schema validation failed',
        )
      }
      if (assessment.taxonomyVersion !== ontology.ontologyVersion) {
        issue(issues, assessmentId, '/taxonomyVersion', 'coverage_taxonomy_version_mismatch', `Expected ${ontology.ontologyVersion}`)
      }
      if (assessmentId) {
        if (assessmentIds.has(assessmentId)) issue(issues, assessmentId, '/assessmentId', 'duplicate_assessment_id', `Duplicate assessment ID ${assessmentId}`)
        assessmentIds.add(assessmentId)
      }
      if (typeof assessment.cellId === 'string' && !cellIds.has(assessment.cellId)) {
        issue(issues, assessmentId, '/cellId', 'unknown_assessment_cell', `${assessment.cellId} is not present in the generated ledger`)
      }
      for (const [field, vocabulary] of Object.entries(COVERAGE_STATUS_FIELDS)) {
        const value = assessment[field]
        if (typeof value === 'string' && !ontology.statusModel[vocabulary]?.includes(value)) {
          issue(issues, assessmentId, `/${field}`, 'unknown_coverage_status', `${value} is not in ontology status vocabulary ${vocabulary}`)
        }
      }

      const withoutHash = { ...assessment }
      delete withoutHash.contentHash
      const expectedContentHash = canonicalSha256(withoutHash)
      if (assessment.contentHash !== expectedContentHash) {
        issue(issues, assessmentId, '/contentHash', 'assessment_content_hash_mismatch', `Expected ${expectedContentHash}`)
      }
      if (provenance.baselineSnapshotId && assessment.baselineSnapshotId !== provenance.baselineSnapshotId) {
        issue(issues, assessmentId, '/baselineSnapshotId', 'baseline_snapshot_mismatch', `Expected ${provenance.baselineSnapshotId}`)
      }
      if (provenance.baselineId && assessment.baselineId !== provenance.baselineId) {
        issue(issues, assessmentId, '/baselineId', 'baseline_provenance_mismatch', `Expected ${provenance.baselineId}`)
      }
      if (provenance.baseCommit && assessment.baseCommit !== provenance.baseCommit) {
        issue(issues, assessmentId, '/baseCommit', 'baseline_provenance_mismatch', `Expected ${provenance.baseCommit}`)
      }
      for (const [snapshotIndex, snapshotId] of asStrings(assessment.artifactSnapshotIds).entries()) {
        if (!provenance.artifactSnapshotIds.has(snapshotId)) {
          issue(issues, assessmentId, `/artifactSnapshotIds/${snapshotIndex}`, 'unknown_artifact_snapshot', `${snapshotId} is not present in the source snapshot set`)
        }
      }
    }
    validateAssessmentSupersession(assessments, issues)

    if (input.ledgerRecords) {
      const assessmentById = new Map(
        assessments
          .filter((assessment) => typeof assessment.assessmentId === 'string')
          .map((assessment) => [assessment.assessmentId as string, assessment]),
      )
      for (const [index, rawRecord] of input.ledgerRecords.entries()) {
        const record = asObject(rawRecord)
        if (record.latestAssessment === null || record.latestAssessment === undefined) continue
        const latest = asObject(record.latestAssessment)
        const latestId = typeof latest.assessmentId === 'string' ? latest.assessmentId : null
        const source = latestId ? assessmentById.get(latestId) : undefined
        if (!source) {
          issue(issues, latestId, `/coverage/ledgerRecords/${index}/latestAssessment`, 'unknown_ledger_assessment', `${latestId ?? '<missing>'} is not present in the assessment history`)
        } else if (canonicalJson(source) !== canonicalJson(latest)) {
          issue(issues, latestId, `/coverage/ledgerRecords/${index}/latestAssessment`, 'ledger_assessment_mismatch', 'Ledger assessment projection differs from the append-only assessment event')
        }
      }
    }

    return {
      valid: issues.length === 0,
      issues,
      cellCount: input.cells.length,
      assessmentCount: input.assessments.length,
    }
  }
}

export function validateCoverageFoundation(
  input: CoverageFoundationInput,
  options: { root?: string } = {},
): CoverageValidationResult {
  return createCoverageFoundationValidator(options.root ?? process.cwd())(input)
}

export function runCoverageFoundationValidation(root = process.cwd()): CoverageValidationResult {
  return validateCoverageFoundation(loadGeneratedCoverageFoundation(root), { root })
}

function collectJsonFiles(path: string): string[] {
  if (!existsSync(path)) return []
  if (statSync(path).isFile()) return extname(path) === '.json' ? [path] : []
  return readdirSync(path, { withFileTypes: true })
    .flatMap((entry) => collectJsonFiles(resolve(path, entry.name)))
}

function createAjv() {
  const ajv = new Ajv2020({
    allErrors: true,
    strict: true,
    strictRequired: false,
    strictTypes: false,
    allowUnionTypes: true,
  })
  addFormats(ajv)
  return ajv
}

export function createKnowledgeFoundationValidator(root = process.cwd()) {
  const ontology = readJson(root, ONTOLOGY_PATH) as Ontology
  const schema = readJson(root, KNOWLEDGE_OBJECT_SCHEMA_PATH) as JsonObject
  const ajv = createAjv()
  const validateSchema = ajv.compile(schema)
  const dimensionIds = new Map<string, Set<string>>()
  const deprecatedIds = new Set<string>()
  for (const [dimension, terms] of Object.entries(ontology.dimensions)) {
    dimensionIds.set(dimension, new Set(terms.map((term) => term.id)))
    for (const term of terms) if (term.deprecated) deprecatedIds.add(term.id)
  }
  const coverageCellIds = readCoverageCellIds(root)

  return function validate(
    input: unknown | unknown[],
    options: Omit<KnowledgeValidationOptions, 'root'> = {},
  ): KnowledgeValidationResult {
    const values = Array.isArray(input) ? input : [input]
    const objects = values.filter(isObject)
    const issues: KnowledgeValidationIssue[] = []
    const objectIds = objects.map((object) => object.id).filter((id): id is string => typeof id === 'string')
    const knownObjectIds = new Set([...objectIds, ...(options.knownObjectIds ?? [])])
    const context: ValidationContext = {
      ontology,
      dimensionIds,
      deprecatedIds,
      coverageCellIds,
      knownObjectIds,
      requireResolvedReferences: options.requireResolvedReferences ?? true,
    }

    for (const [index, value] of values.entries()) {
      if (!isObject(value)) {
        issue(issues, null, `/${index}`, 'not_an_object', 'Knowledge-object input must be a JSON object')
        continue
      }
      const objectId = typeof value.id === 'string' ? value.id : null
      if (!validateSchema(value)) {
        for (const error of validateSchema.errors ?? []) {
          issue(
            issues,
            objectId,
            error.instancePath || '/',
            `schema_${error.keyword}`,
            error.message ?? 'JSON Schema validation failed',
          )
        }
      }
      if (value.ontologyVersion !== ontology.ontologyVersion) {
        issue(issues, objectId, '/ontologyVersion', 'ontology_version_mismatch', `Expected ontology version ${ontology.ontologyVersion}`)
      }
      validateOntologyMembership(value, context, issues)
      validateGeographyAccounting(value, context, issues)
      validateFailClosedEvidence(value, issues)
      validateTrueC(value, issues)
      validatePayloadIsolation(value, issues)
    }

    const duplicateIds = objectIds.filter((id, index) => objectIds.indexOf(id) !== index)
    for (const id of new Set(duplicateIds)) issue(issues, id, '/id', 'duplicate_id', `Duplicate canonical ID ${id}`)
    const projectionIds = objects.map((object) => object.projectionId).filter((id): id is string => typeof id === 'string')
    for (const id of new Set(projectionIds.filter((value, index) => projectionIds.indexOf(value) !== index))) {
      issue(issues, null, '/projectionId', 'duplicate_projection_id', `Duplicate projection ID ${id}`)
    }
    validateSupersessionCycles(objects, issues)
    return { valid: issues.length === 0, issues }
  }
}

export function validateKnowledgeFoundation(
  input: unknown | unknown[],
  options: KnowledgeValidationOptions = {},
): KnowledgeValidationResult {
  const { root = process.cwd(), ...validationOptions } = options
  return createKnowledgeFoundationValidator(root)(input, validationOptions)
}

export function runKnowledgeFoundationValidation(
  root = process.cwd(),
  objectPaths: string[] = [],
): KnowledgeValidationResult {
  const effectivePaths = objectPaths.length > 0
    ? objectPaths
    : existsSync(resolve(root, DEFAULT_OBJECTS_PATH))
      ? [DEFAULT_OBJECTS_PATH]
      : []
  const resolvedPaths = effectivePaths.flatMap((path) => collectJsonFiles(resolve(root, path)))
  const objects = resolvedPaths
    .map((path) => JSON.parse(readFileSync(path, 'utf8')) as unknown)
    .flatMap((value) => Array.isArray(value) ? value : [value])
  const result = validateKnowledgeFoundation(objects, { root })
  if (!result.valid) {
    for (const item of result.issues) {
      console.error(`${item.objectId ?? '<unknown>'}${item.path}: [${item.code}] ${item.message}`)
    }
  }
  return result
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const objectPaths = process.argv.slice(2).filter((argument) => !argument.startsWith('--'))
  try {
    const coverageResult = runCoverageFoundationValidation(process.cwd())
    const objectResult = runKnowledgeFoundationValidation(process.cwd(), objectPaths)
    for (const item of coverageResult.issues) {
      console.error(`${item.objectId ?? '<unknown>'}${item.path}: [${item.code}] ${item.message}`)
    }
    const issueCount = coverageResult.issues.length + objectResult.issues.length
    const valid = coverageResult.valid && objectResult.valid
    console.log(
      `Knowledge foundation validation: ${valid ? 'passed' : 'failed'} `
      + `(${issueCount} issues; ${coverageResult.cellCount} coverage cells; ${coverageResult.assessmentCount} assessments)`,
    )
    if (!valid) process.exitCode = 1
  } catch (error) {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  }
}
