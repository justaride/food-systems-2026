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
export const MAP_PATH = 'knowledge/migration/legacy-field-navigation-map.v1.json'
export const SCHEMA_PATH = 'knowledge/schema/legacy-field-navigation.schema.v1.json'
export const ONTOLOGY_PATH = 'knowledge/schema/nordic-food-system-ontology.v1.json'
export const GENERATOR_PATH = 'scripts/knowledge/generate-legacy-field-navigation.ts'
export const COVERAGE_GENERATOR_PATH = 'scripts/knowledge/generate-coverage-ledger.ts'
export const REGISTER_PATH = 'knowledge/migration/legacy-field-navigation-register.v1.json'
export const GENERATION_MANIFEST_PATH = 'knowledge/migration/legacy-field-navigation-generation-manifest.v1.json'

const POLITICAL_PROFILE_ID = 'profile.legacy_field_political'
const SAPMI_PROFILE_ID = 'profile.legacy_field_sapmi_overlap'
const POLITICAL_GEOGRAPHIES = ['geo.no', 'geo.se', 'geo.dk', 'geo.fi', 'geo.is', 'geo.fo', 'geo.gl', 'geo.ax']
const SAPMI_GEOGRAPHIES = ['geo.sapmi']

type NeutralSemantics = {
  artifactRole: 'navigation'
  coverageImplication: 'none'
  subjectMatterState: 'unassessed'
  geographyRepresentation: 'unknown'
  evidenceUse: 'not_evidence'
  coveragePromotionAllowed: false
  crossProfileAggregationAllowed: false
}

export type NavigationMap = {
  documentType: 'legacy_field_navigation_map'
  schemaVersion: '1.0.0'
  mapId: 'map.legacy_field_navigation.v1'
  status: 'proposed'
  observedAt: string
  semantics: NeutralSemantics
  navigationContexts: Array<{
    contextId: 'navigation_context.legacy_field_index' | 'navigation_context.legacy_field_atlas'
    role: 'field_map_index' | 'atlas_canvas'
    artifactPath: string
    locator: string
  }>
  fields: Array<{
    legacyFieldId: string
    sequence: number
    labelNb: string
    artifactPath: string
    artifactLocator: string
    fieldMapLinkTarget: string
    atlasNodeId: string
  }>
}

type FieldRegistration = {
  registrationId: string
  legacyFieldId: string
  sequence: number
  labelNb: string
  labelEn: string
  artifactRole: 'legacy_field_navigation'
  artifactLocator: string
  artifactSnapshot: ArtifactSnapshot
  fieldMapContextId: 'navigation_context.legacy_field_index'
  fieldMapLinkTarget: string
  atlasContextId: 'navigation_context.legacy_field_atlas'
  atlasNodeId: string
  coverageImplication: 'none'
  subjectMatterState: 'unassessed'
  geographyRepresentation: 'unknown'
  evidenceUse: 'not_evidence'
  limitations: string[]
  contentHash: string
}

type NavigationBinding = {
  bindingId: string
  registrationId: string
  cellId: string
  profileId: typeof POLITICAL_PROFILE_ID | typeof SAPMI_PROFILE_ID
  aggregationClass: 'political_nordic' | 'sapmi_overlapping'
  geographyId: string
  legacyFieldId: string
  bindingSemantics: 'navigation_route_only'
  coverageImplication: 'none'
  subjectMatterState: 'unassessed'
  geographyRepresentation: 'unknown'
  evidenceUse: 'not_evidence'
  aggregationRule: 'profile_local_only' | 'sapmi_non_additive_overlap'
  rightsHolderReviewRequired: boolean
  limitations: string[]
  contentHash: string
}

export type NavigationRegister = {
  documentType: 'legacy_field_navigation_register'
  schemaVersion: '1.0.0'
  registryId: 'registry.legacy_field_navigation.v1'
  registryStatus: 'proposed'
  generatedAt: string
  baseCommit: string
  generatorVersion: string
  ontologyVersion: string
  mapId: 'map.legacy_field_navigation.v1'
  semantics: NeutralSemantics
  navigationContexts: Array<{
    contextId: NavigationMap['navigationContexts'][number]['contextId']
    role: NavigationMap['navigationContexts'][number]['role']
    locator: string
    artifactSnapshot: ArtifactSnapshot
  }>
  fieldRegistrations: FieldRegistration[]
  bindings: NavigationBinding[]
  profileSummaries: Record<string, {
    aggregationClass: 'political_nordic' | 'sapmi_overlapping'
    bindingCount: number
    coveragePromotionCount: 0
    geographyRepresentationCount: 0
  }>
  recordCounts: {
    navigationContexts: 2
    fieldRegistrations: 13
    politicalBindings: 104
    sapmiBindings: 13
  }
  contentHash: string
}

export type LegacyFieldNavigationArtifacts = {
  baseCommit: string
  map: NavigationMap
  ontology: Ontology
  register: NavigationRegister
  inputSnapshots: ArtifactSnapshot[]
  registerJson: string
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

function validateWithSchema(root: string, value: unknown, label: string) {
  const schema = readJson<object>(root, SCHEMA_PATH)
  const ajv = new Ajv2020({ allErrors: true, strict: false })
  addFormats(ajv)
  const validate = ajv.compile(schema)
  assert(validate(value), `${label} schema validation failed: ${JSON.stringify(validate.errors)}`)
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function compactId(value: string): string {
  return value.replace(/^[^.]+\./, '')
}

function cellId(profileId: string, geographyId: string, legacyFieldId: string): string {
  return `cov.v1.profile=${compactId(profileId)}.geography=${compactId(geographyId)}.legacy_fields=${compactId(legacyFieldId)}`
}

function hashRecord<T extends Record<string, unknown>>(value: T): T & { contentHash: string } {
  return { ...value, contentHash: sha256(canonicalJson(value)) }
}

function validateMapAndNavigation(
  root: string,
  map: NavigationMap,
  ontology: Ontology,
) {
  validateWithSchema(root, map, MAP_PATH)
  assert(map.fields.length === 13, 'Navigation map must contain exactly thirteen fields')
  assert(new Set(map.fields.map((field) => field.legacyFieldId)).size === 13, 'Legacy field IDs must be unique')
  assert(new Set(map.fields.map((field) => field.sequence)).size === 13, 'Legacy field sequences must be unique')
  assert(new Set(map.fields.map((field) => field.artifactPath)).size === 13, 'Legacy field artifact paths must be unique')
  assert(new Set(map.fields.map((field) => field.atlasNodeId)).size === 13, 'Legacy field atlas node IDs must be unique')

  const ontologyFields = ontology.dimensions.legacyFields ?? []
  assert(ontologyFields.length === 13, 'Ontology must contain exactly thirteen legacy fields')
  const ontologyById = new Map(ontologyFields.map((field) => [field.id, field]))
  const indexContext = map.navigationContexts.find((context) => context.role === 'field_map_index')
  const atlasContext = map.navigationContexts.find((context) => context.role === 'atlas_canvas')
  assert(indexContext, 'Navigation map requires one field-map index context')
  assert(atlasContext, 'Navigation map requires one atlas-canvas context')
  assert(map.navigationContexts.filter((context) => context.role === 'field_map_index').length === 1, 'Field-map index context must be unique')
  assert(map.navigationContexts.filter((context) => context.role === 'atlas_canvas').length === 1, 'Atlas-canvas context must be unique')

  const indexSource = readFileSync(resolve(root, indexContext.artifactPath), 'utf8')
  const atlas = readJson<{ nodes?: Array<{ id?: string; type?: string; file?: string }> }>(root, atlasContext.artifactPath)
  const atlasNodes = atlas.nodes ?? []
  const mappedAtlasIds = new Set(map.fields.map((field) => field.atlasNodeId))
  const actualAtlasFieldIds = atlasNodes
    .filter((node) => typeof node.id === 'string' && /^f(0[1-9]|1[0-3])$/.test(node.id))
    .map((node) => node.id as string)
  assert(actualAtlasFieldIds.length === 13, 'Atlas must expose exactly thirteen f01-f13 file nodes')
  assert(actualAtlasFieldIds.every((id) => mappedAtlasIds.has(id)), 'Atlas contains an unmapped legacy field node')

  for (const field of [...map.fields].sort((left, right) => left.sequence - right.sequence)) {
    const expectedId = `legacy_field.f${String(field.sequence).padStart(2, '0')}`
    const expectedNodeId = `f${String(field.sequence).padStart(2, '0')}`
    assert(field.legacyFieldId === expectedId, `${field.legacyFieldId} does not match sequence ${field.sequence}`)
    assert(field.atlasNodeId === expectedNodeId, `${field.legacyFieldId} has the wrong atlas node ID`)
    const term = ontologyById.get(field.legacyFieldId)
    assert(term, `${field.legacyFieldId} is missing from the ontology`)
    assert(term.labelNb === field.labelNb, `${field.legacyFieldId} Norwegian label differs from the ontology`)
    const expectedFilename = `${String(field.sequence).padStart(2, '0')} ${field.labelNb}.md`
    assert(basename(field.artifactPath) === expectedFilename, `${field.legacyFieldId} artifact filename must be ${expectedFilename}`)
    assert(field.artifactLocator === `# ${field.labelNb}`, `${field.legacyFieldId} must use its exact H1 locator`)

    const source = readFileSync(resolve(root, field.artifactPath), 'utf8')
    assert(/^type: feltkart$/m.test(source), `${field.legacyFieldId} artifact must remain type feltkart`)
    assert(/^status: kuratert$/m.test(source), `${field.legacyFieldId} artifact must remain status kuratert`)
    assert(/^siterbarhet: intern$/m.test(source), `${field.legacyFieldId} artifact must remain internal-only`)
    assert(new RegExp(`^# ${escapeRegex(field.labelNb)}$`, 'm').test(source), `${field.legacyFieldId} H1 does not match its ontology label`)
    assert(
      indexSource.includes(`[[${field.fieldMapLinkTarget}|${field.labelNb}]]`),
      `${field.legacyFieldId} is not linked exactly from the field-map index`,
    )
    const atlasMatches = atlasNodes.filter((node) => node.id === field.atlasNodeId)
    assert(atlasMatches.length === 1, `${field.legacyFieldId} must resolve to exactly one atlas node`)
    const expectedCanvasPath = field.artifactPath.replace(/^Food Systems Obsidian\//, '')
    assert(atlasMatches[0].type === 'file' && atlasMatches[0].file === expectedCanvasPath, `${field.legacyFieldId} atlas node points to the wrong artifact`)
  }
}

function validateProfiles(ontology: Ontology) {
  const profiles = new Map(ontology.coverageProfiles.map((profile) => [profile.id, profile]))
  const political = profiles.get(POLITICAL_PROFILE_ID)
  const sapmi = profiles.get(SAPMI_PROFILE_ID)
  assert(political, `Missing ${POLITICAL_PROFILE_ID}`)
  assert(sapmi, `Missing ${SAPMI_PROFILE_ID}`)
  assert(political.aggregationClass === 'political_nordic', 'Political legacy profile has the wrong aggregation class')
  assert(sapmi.aggregationClass === 'sapmi_overlapping', 'Sápmi legacy profile has the wrong aggregation class')
  assert(canonicalJson(political.geographyIds) === canonicalJson(POLITICAL_GEOGRAPHIES), 'Political legacy geographies changed')
  assert(canonicalJson(sapmi.geographyIds) === canonicalJson(SAPMI_GEOGRAPHIES), 'Sápmi legacy geography changed')
  for (const profile of [political, sapmi]) {
    const axis = profile.axes.find((candidate) => candidate.dimension === 'legacyFields')
    assert(axis, `${profile.id} has no legacyFields axis`)
    assert(axis.ids.length === 13, `${profile.id} must include all thirteen legacy fields`)
  }
  return { political, sapmi }
}

export function buildLegacyFieldNavigationArtifacts(
  root = process.cwd(),
  options: { baseCommit?: string } = {},
): LegacyFieldNavigationArtifacts {
  const baseCommit = options.baseCommit ?? runGit(root, ['rev-parse', 'HEAD'])
  verifyBaseCommit(root, baseCommit)
  const map = readJson<NavigationMap>(root, MAP_PATH)
  const ontology = readJson<Ontology>(root, ONTOLOGY_PATH)
  validateMapAndNavigation(root, map, ontology)
  const { political, sapmi } = validateProfiles(ontology)

  const inputSnapshots = [MAP_PATH, SCHEMA_PATH, ONTOLOGY_PATH, GENERATOR_PATH, COVERAGE_GENERATOR_PATH]
    .map((path) => snapshotArtifact(root, path, baseCommit))
  const contextSnapshots = new Map(
    map.navigationContexts.map((context) => [context.contextId, snapshotArtifact(root, context.artifactPath, baseCommit)]),
  )
  const fieldSnapshots = new Map(
    map.fields.map((field) => [field.legacyFieldId, snapshotArtifact(root, field.artifactPath, baseCommit)]),
  )

  const navigationContexts = map.navigationContexts.map((context) => ({
    contextId: context.contextId,
    role: context.role,
    locator: context.locator,
    artifactSnapshot: contextSnapshots.get(context.contextId)!,
  }))
  const fieldRegistrations: FieldRegistration[] = [...map.fields]
    .sort((left, right) => left.sequence - right.sequence)
    .map((field) => {
      const term = ontology.dimensions.legacyFields.find((candidate) => candidate.id === field.legacyFieldId)!
      const withoutHash = {
        registrationId: `navigation_registration.${field.legacyFieldId}`,
        legacyFieldId: field.legacyFieldId,
        sequence: field.sequence,
        labelNb: field.labelNb,
        labelEn: term.labelEn,
        artifactRole: 'legacy_field_navigation' as const,
        artifactLocator: field.artifactLocator,
        artifactSnapshot: fieldSnapshots.get(field.legacyFieldId)!,
        fieldMapContextId: 'navigation_context.legacy_field_index' as const,
        fieldMapLinkTarget: field.fieldMapLinkTarget,
        atlasContextId: 'navigation_context.legacy_field_atlas' as const,
        atlasNodeId: field.atlasNodeId,
        coverageImplication: 'none' as const,
        subjectMatterState: 'unassessed' as const,
        geographyRepresentation: 'unknown' as const,
        evidenceUse: 'not_evidence' as const,
        limitations: [
          'The artifact is registered as a navigation surface, not as evidence of subject-matter coverage.',
          'Its internal links and note density do not establish citation readiness, verification, freshness or completeness.',
          'Geographic representation remains unknown until exact cell-specific evidence and boundaries are reviewed.',
        ],
      }
      return hashRecord(withoutHash) as FieldRegistration
    })

  const bindings: NavigationBinding[] = []
  for (const profile of [political, sapmi]) {
    const isSapmi = profile.id === SAPMI_PROFILE_ID
    for (const geographyId of profile.geographyIds) {
      for (const field of map.fields) {
        const withoutHash = {
          bindingId: `navigation_binding.${compactId(profile.id)}.${compactId(geographyId)}.${compactId(field.legacyFieldId)}`,
          registrationId: `navigation_registration.${field.legacyFieldId}`,
          cellId: cellId(profile.id, geographyId, field.legacyFieldId),
          profileId: profile.id as typeof POLITICAL_PROFILE_ID | typeof SAPMI_PROFILE_ID,
          aggregationClass: (isSapmi ? 'sapmi_overlapping' : 'political_nordic') as 'political_nordic' | 'sapmi_overlapping',
          geographyId,
          legacyFieldId: field.legacyFieldId,
          bindingSemantics: 'navigation_route_only' as const,
          coverageImplication: 'none' as const,
          subjectMatterState: 'unassessed' as const,
          geographyRepresentation: 'unknown' as const,
          evidenceUse: 'not_evidence' as const,
          aggregationRule: (isSapmi ? 'sapmi_non_additive_overlap' : 'profile_local_only') as 'profile_local_only' | 'sapmi_non_additive_overlap',
          rightsHolderReviewRequired: isSapmi,
          limitations: isSapmi
            ? [
                'This binding assigns a legacy navigation route only; it does not show that the artifact represents Sápmi.',
                'Sápmi remains a separate non-additive scope requiring a rights-holder-led evidence and review route.',
              ]
            : [
                'This binding assigns a legacy navigation route only; it does not show that the artifact represents this political geography.',
                'Political and territorial boundaries remain unknown until source-specific reconciliation is reviewed.',
              ],
        }
        bindings.push(hashRecord(withoutHash) as NavigationBinding)
      }
    }
  }
  bindings.sort((left, right) => left.cellId.localeCompare(right.cellId))
  assert(bindings.filter((binding) => binding.profileId === POLITICAL_PROFILE_ID).length === 104, 'Expected 104 political navigation bindings')
  assert(bindings.filter((binding) => binding.profileId === SAPMI_PROFILE_ID).length === 13, 'Expected 13 Sápmi navigation bindings')

  const registerWithoutHash = {
    documentType: 'legacy_field_navigation_register' as const,
    schemaVersion: '1.0.0' as const,
    registryId: 'registry.legacy_field_navigation.v1' as const,
    registryStatus: 'proposed' as const,
    generatedAt: map.observedAt,
    baseCommit,
    generatorVersion: GENERATOR_VERSION,
    ontologyVersion: ontology.ontologyVersion,
    mapId: map.mapId,
    semantics: map.semantics,
    navigationContexts,
    fieldRegistrations,
    bindings,
    profileSummaries: {
      [POLITICAL_PROFILE_ID]: {
        aggregationClass: 'political_nordic' as const,
        bindingCount: 104,
        coveragePromotionCount: 0 as const,
        geographyRepresentationCount: 0 as const,
      },
      [SAPMI_PROFILE_ID]: {
        aggregationClass: 'sapmi_overlapping' as const,
        bindingCount: 13,
        coveragePromotionCount: 0 as const,
        geographyRepresentationCount: 0 as const,
      },
    },
    recordCounts: {
      navigationContexts: 2 as const,
      fieldRegistrations: 13 as const,
      politicalBindings: 104 as const,
      sapmiBindings: 13 as const,
    },
  }
  const register = hashRecord(registerWithoutHash) as NavigationRegister
  validateWithSchema(root, register, REGISTER_PATH)
  const registerJson = `${JSON.stringify(register, null, 2)}\n`

  const manifestWithoutHash = {
    documentType: 'legacy_field_navigation_generation_manifest' as const,
    schemaVersion: '1.0.0' as const,
    generator: GENERATOR_PATH,
    generatorVersion: GENERATOR_VERSION,
    registryId: register.registryId,
    registryStatus: register.registryStatus,
    generatedAt: map.observedAt,
    baseCommit,
    commitMarkerSemantics: 'This manifest is written last. Its pinned source commit and output hash must reproduce before the navigation registry is accepted.',
    inputSnapshots,
    outputs: [{
      path: REGISTER_PATH,
      sha256: sha256(registerJson),
      sizeBytes: Buffer.byteLength(registerJson),
    }],
  }
  const generationManifest = hashRecord(manifestWithoutHash)
  validateWithSchema(root, generationManifest, GENERATION_MANIFEST_PATH)
  const generationManifestJson = `${JSON.stringify(generationManifest, null, 2)}\n`

  return { baseCommit, map, ontology, register, inputSnapshots, registerJson, generationManifestJson }
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

export function writeOrCheckLegacyFieldNavigation(
  root: string,
  artifacts: LegacyFieldNavigationArtifacts,
  check: boolean,
) {
  const bundle = [
    { path: REGISTER_PATH, content: artifacts.registerJson },
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

function cliBaseCommit(): string | undefined {
  const inline = process.argv.find((argument) => argument.startsWith('--base-commit='))
  if (inline) return inline.slice('--base-commit='.length)
  const index = process.argv.indexOf('--base-commit')
  return index >= 0 ? process.argv[index + 1] : undefined
}

export function run(root = process.cwd()) {
  const check = process.argv.includes('--check')
  const baseCommit = resolveBaseCommit(root, check, cliBaseCommit())
  const artifacts = buildLegacyFieldNavigationArtifacts(root, { baseCommit })
  writeOrCheckLegacyFieldNavigation(root, artifacts, check)
  console.log(
    `Legacy-field navigation ${check ? 'verified' : 'generated'}: fields=13; political bindings=104; Sápmi bindings=13; coverage promotions=0`,
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
