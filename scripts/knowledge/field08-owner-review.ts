import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  realpathSync,
  writeFileSync,
} from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import Ajv2020 from 'ajv/dist/2020'
import addFormats from 'ajv-formats'

import {
  buildField08InsightRegister,
  buildOwnerReviewStatus,
  canonicalSha256,
  validateOwnerReviewReceipt,
  validateOwnerReviewReceiptLog,
  type Field08OwnerReviewReceipt,
  type Field08OwnerReviewSource,
} from '../../src/lib/field08-owner-review'
import { buildPendingReviewTemplates } from './field08-human-review'

export const OWNER_ROOT = 'knowledge/pilots/field08/owner'
export const OWNER_RECEIPTS_PATH = `${OWNER_ROOT}/field08-owner-review-receipts.v1.jsonl`
export const OWNER_PACKETS_PATH = `${OWNER_ROOT}/field08-owner-review-packets.v1.json`
export const OWNER_STATUS_PATH = 'src/data/field08-owner-review-status.v1.json'
export const OWNER_INSIGHT_PATH = 'src/data/field08-internal-insights.v1.json'
export const EVIDENCE_INTAKE_PATH = 'knowledge/pilots/field08/gate2c/field08-evidence-intake.v1.json'
export const GENERATION_MANIFEST_PATH = 'knowledge/pilots/field08/gate2c/field08-evidence-generation-manifest.v1.json'

type Acquisition = {
  acquisitionId: string
  sourceId: string
  citationId: string
  title: string
  publisher: string
  sourceUrl: string
  citationText: string
  locator: string
  capturePath: string
  captureSha256: string
  captureStorage: 'git_tracked' | 'local_external'
  requestReceiptPath: string | null
  geographyIds: string[]
  limitations: string[]
}

type Claim = {
  claimId: string
  claimText: string
  citationIds: string[]
  limitations: string[]
  systemBoundary: { included: string[]; excluded: string[]; functionalUnit: string }
}

type Observation = {
  observationId: string
  title: string
  summary: string
  citationIds: string[]
  value: number | null
  unit: string
  denominatorOrUniverse: string
  method: string
  timeScope: { from: string; to: string; asOf: string }
  systemBoundary: { included: string[]; excluded: string[]; functionalUnit: string }
  limitations: string[]
}

type Intake = {
  sourceAcquisitions: Acquisition[]
  claimCandidates: Claim[]
  measurementCandidates: Observation[]
  contradictionSets: Array<{
    contradictionSetId: string
    description: string
    claimIds: string[]
    observationIds: string[]
    status: string
    resolution: unknown
  }>
}

type GenerationManifest = {
  generatedAt: string
  sourceCommit: string
  contentHash: string
  inputSnapshots: Array<{
    path: string
    gitObjectId: string
    entries: Array<{ path: string; sha256: string; sizeBytes: number }>
  }>
  outputs: Array<{ path: string; sha256: string; sizeBytes: number }>
}

function fail(message: string): never {
  throw new Error(message)
}

function sha256Bytes(bytes: Buffer): string {
  return `sha256:${createHash('sha256').update(bytes).digest('hex')}`
}

function json<T>(root: string, path: string): T {
  return JSON.parse(readFileSync(resolve(root, path), 'utf8')) as T
}

function receiptJsonl(root: string): Field08OwnerReviewReceipt[] {
  const path = resolve(root, OWNER_RECEIPTS_PATH)
  if (!existsSync(path)) return []
  return readFileSync(path, 'utf8')
    .split(/\r?\n/)
    .filter((line) => line.trim().length > 0)
    .map((line, index) => {
      try {
        return JSON.parse(line) as Field08OwnerReviewReceipt
      } catch {
        return fail(`${OWNER_RECEIPTS_PATH}:${index + 1} is not valid JSON`)
      }
    })
}

function pretty(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`
}

function validateJsonSchema(root: string, schemaPath: string, value: unknown, label: string) {
  const ajv = new Ajv2020({ allErrors: true, strict: false })
  addFormats(ajv)
  const validate = ajv.compile(json(root, schemaPath))
  if (!validate(value)) fail(`${label} violates ${schemaPath}: ${ajv.errorsText(validate.errors)}`)
}

export function verifyHistoricalEvidencePackage(root: string) {
  const manifest = json<GenerationManifest>(root, GENERATION_MANIFEST_PATH)
  const { contentHash: _contentHash, ...payload } = manifest
  if (canonicalSha256(payload) !== manifest.contentHash) fail('Generation manifest canonical content hash mismatch')
  if (!/^[a-f0-9]{40}$/.test(manifest.sourceCommit)) fail('Generation manifest sourceCommit is not a full SHA')

  for (const snapshot of manifest.inputSnapshots) {
    const objectId = execFileSync('git', ['rev-parse', `${manifest.sourceCommit}:${snapshot.path}`], {
      cwd: root,
      encoding: 'utf8',
    }).trim()
    if (objectId !== snapshot.gitObjectId) fail(`Pinned Git object mismatch for ${snapshot.path}`)
    for (const entry of snapshot.entries) {
      const bytes = execFileSync('git', ['show', `${manifest.sourceCommit}:${entry.path}`], {
        cwd: root,
        encoding: 'buffer',
        maxBuffer: 64 * 1024 * 1024,
      })
      if (bytes.length !== entry.sizeBytes) fail(`Pinned input size mismatch for ${entry.path}`)
      if (sha256Bytes(bytes) !== entry.sha256) fail(`Pinned input hash mismatch for ${entry.path}`)
    }
  }

  for (const output of manifest.outputs) {
    const bytes = readFileSync(resolve(root, output.path))
    if (bytes.length !== output.sizeBytes) fail(`Immutable output size mismatch for ${output.path}`)
    if (sha256Bytes(bytes) !== output.sha256) fail(`Immutable output hash mismatch for ${output.path}`)
  }

  const templates = buildPendingReviewTemplates(root)
  const hashes = new Set(templates.map((template) => template.evidencePackageHash))
  if (hashes.size !== 1) fail('Gate 2C review templates do not bind one evidence package hash')
  return {
    sourceCommit: manifest.sourceCommit,
    generatedAt: manifest.generatedAt,
    evidencePackageHash: [...hashes][0],
    inputSnapshotCount: manifest.inputSnapshots.length,
    outputCount: manifest.outputs.length,
  }
}

const packetGuidance: Record<string, {
  proposedInternalUse: string
  whatItMeasures: string
  whatItDoesNotMeasure: string
  alternativeExplanations: string[]
  requiredLimitations: string[]
}> = {
  eurostat: {
    proposedInternalUse: 'Analyser fordelingen mellom danske ledd innen samme 2023-uttrekk; behold Finland blokkert.',
    whatItMeasures: 'Kilde-definert matsvinn i tonn for de valgte Eurostat-cellene og NACE-/husholdningsleddene.',
    whatItDoesNotMeasure: 'Et harmonisert nordisk ranggrunnlag, sidestrømmer, behandlingsutfall eller næringsstoffgjenvinning.',
    alternativeExplanations: ['Nasjonale målemetoder og klassifisering mellom ledd kan forklare forskjeller.', 'Finland-cellen kan ikke tolkes før Finland–Åland-grensen er avklart.'],
    requiredLimitations: ['Ingen nordisk rangering.', 'Ingen Finland-verdi fra dette uttrekket før grensen mot Åland er løst.'],
  },
  luke: {
    proposedInternalUse: 'Bruk de separate N- og P-ratene til å beskrive et regnskaps- og datagap, uten aritmetikk mellom Finland og Åland.',
    whatItMeasures: 'Jordbruksbalanse i kg/ha for N og P for hele Finland og separat Åland-rad.',
    whatItDoesNotMeasure: 'Faktisk N–P–K-gjenvinning, utslipp, substitusjon eller en additiv nasjonal/regional massebalanse.',
    alternativeExplanations: ['Balanser drives av flere innsats- og uttaksforhold enn sidestrømmer.', 'Finland-raden inkluderer Åland.'],
    requiredLimitations: ['Finland- og Åland-ratene må aldri summeres eller trekkes fra hverandre.', 'K er ikke dekket.'],
  },
  norway: {
    proposedInternalUse: 'Analyser fordelingen av matsvinn mellom ledd innen den norske jordbrukssektoren.',
    whatItMeasures: 'Rapportert og estimert matsvinn i jordbrukssektoren innen rapportens egen avgrensning.',
    whatItDoesNotMeasure: 'Norsk total for matsystemet eller et fullstendig sidestrøms-/næringsstoffregnskap.',
    alternativeExplanations: ['Rapporteringsgrad, produksjonsvolum og produktsammensetning kan drive leddforskjeller.'],
    requiredLimitations: ['Omtal aldri jordbrukssektoren som hele det norske matsystemet.'],
  },
  asub: {
    proposedInternalUse: 'Skill mellom mottatt avfallsmasse, behandlingskode og eksport, og identifiser manglende utfallsdata.',
    whatItMeasures: 'Ålands avfallsmengder, behandlingskoder og eksportposter slik tabellene definerer dem.',
    whatItDoesNotMeasure: 'Faktisk N-, P- eller K-utbytte eller dokumentert substitusjon av jomfruelige innsatsfaktorer.',
    alternativeExplanations: ['R3+-kode kan dekke ulike faktiske prosesser og utbytter.', 'Våtmasse kan avvike sterkt i næringsinnhold.'],
    requiredLimitations: ['Behandlingskode og våtmasse er ikke dokumentasjon på N–P–K-gjenvinning.', 'Eksporttabellene inneholder motstridende totaler.'],
  },
  iceland: {
    proposedInternalUse: 'Bruk rapporten til å dokumentere metodeforskjeller og kildekonflikter, ikke til nordisk rangering.',
    whatItMeasures: 'Islandske matsvinnestimater innen rapportens sektor- og metodeavgrensninger.',
    whatItDoesNotMeasure: 'Et konfliktfritt nasjonalt referansetall eller et harmonisert nordisk sammenligningsgrunnlag.',
    alternativeExplanations: ['Frafall, falske nuller og ulik sektoravgrensning kan forklare avvik.', 'Sammendrags- og tabellverdier kan bygge på ulike univers.'],
    requiredLimitations: ['Alle dokumenterte kildekonflikter må følge eventuell intern bruk.', 'Ingen nordisk rangering.'],
  },
}

function kind(sourceId: string): keyof typeof packetGuidance {
  if (sourceId.includes('eurostat')) return 'eurostat'
  if (sourceId.includes('luke')) return 'luke'
  if (sourceId.includes('landbruksdirektoratet')) return 'norway'
  if (sourceId.includes('asub')) return 'asub'
  if (sourceId.includes('environment-agency')) return 'iceland'
  return fail(`No owner-review packet guidance for ${sourceId}`)
}

export function buildOwnerReviewArtifacts(root: string, receipts = receiptJsonl(root)) {
  const integrity = verifyHistoricalEvidencePackage(root)
  const intake = json<Intake>(root, EVIDENCE_INTAKE_PATH)
  const ordinaryTemplate = buildPendingReviewTemplates(root).find((template) => template.gateType === 'ordinary_human_review')
    ?? fail('Ordinary human-review template is missing')
  const sourceBindings = ordinaryTemplate.targetBindings.filter((binding) => binding.targetKind === 'source')

  const sources: Field08OwnerReviewSource[] = sourceBindings.map((binding) => {
    const acquisitions = intake.sourceAcquisitions.filter((item) => item.sourceId === binding.targetId)
    if (acquisitions.length === 0) return fail(`Source binding ${binding.targetId} has no acquisitions`)
    return {
      sourceId: binding.targetId,
      sourceHash: binding.targetSha256,
      title: acquisitions[0].title,
      publisher: acquisitions[0].publisher,
      geographyIds: [...new Set(acquisitions.flatMap((item) => item.geographyIds))].sort(),
      locatorCount: acquisitions.length,
    }
  })

  for (const receipt of receipts) {
    validateJsonSchema(
      root,
      'knowledge/schema/field08-owner-review-receipt.schema.v1.json',
      receipt,
      `Owner receipt ${receipt.receiptId ?? '(missing receiptId)'}`,
    )
  }
  validateOwnerReviewReceiptLog(receipts, {
    evidencePackageHash: integrity.evidencePackageHash,
    sources,
  })

  const sourcePackets = sources.map((source) => {
    const acquisitions = intake.sourceAcquisitions.filter((item) => item.sourceId === source.sourceId)
    const citationIds = new Set(acquisitions.map((item) => item.citationId))
    const claims = intake.claimCandidates
      .filter((item) => item.citationIds.some((id) => citationIds.has(id)))
      .map((item) => ({ claimId: item.claimId, claimText: item.claimText, systemBoundary: item.systemBoundary, limitations: item.limitations }))
    const observations = intake.measurementCandidates
      .filter((item) => item.citationIds.some((id) => citationIds.has(id)))
      .map((item) => ({
        observationId: item.observationId,
        title: item.title,
        value: item.value,
        unit: item.unit,
        period: item.timeScope,
        denominatorOrUniverse: item.denominatorOrUniverse,
        method: item.method,
        systemBoundary: item.systemBoundary,
        limitations: item.limitations,
      }))
    const targetIds = new Set([...claims.map((item) => item.claimId), ...observations.map((item) => item.observationId)])
    const contradictions = intake.contradictionSets.filter((item) =>
      [...item.claimIds, ...item.observationIds].some((id) => targetIds.has(id)),
    )
    return {
      packetId: `owner_packet.field08.${kind(source.sourceId)}.v1`,
      evidencePackageHash: integrity.evidencePackageHash,
      source,
      locators: acquisitions.map((item) => ({
        acquisitionId: item.acquisitionId,
        citationId: item.citationId,
        citationText: item.citationText,
        sourceUrl: item.sourceUrl,
        locator: item.locator,
        captureSha256: item.captureSha256,
      })),
      claims,
      observations,
      contradictions,
      ...packetGuidance[kind(source.sourceId)],
      reviewInstruction: 'Gabriel må åpne den private PDF-lenken eller det replayede API-uttrekket, velge beslutning og bekrefte den kanoniske attestasjonsformuleringen før en kvittering appendes.',
      privateReviewLinkIncludedInDeployableArtifact: false as const,
      externalUseAllowed: false as const,
      coveragePromotionAllowed: false as const,
    }
  })

  const packets = {
    documentType: 'field08_owner_review_packet_set' as const,
    schemaVersion: '1.0.0' as const,
    packageId: 'owner_packets.field08.v1' as const,
    generatedFrom: integrity,
    sources: sourcePackets,
    externalUseAllowed: false as const,
    coveragePromotionAllowed: false as const,
  }
  const status = {
    ...buildOwnerReviewStatus(integrity.evidencePackageHash, sources, receipts),
    packageGeneratedAt: integrity.generatedAt,
    sourceCommit: integrity.sourceCommit,
  }
  validateJsonSchema(
    root,
    'knowledge/schema/field08-owner-review-status.schema.v1.json',
    status,
    'Field 08 owner status',
  )
  const insights = {
    ...buildField08InsightRegister(integrity.evidencePackageHash, sources, receipts),
    packageGeneratedAt: integrity.generatedAt,
    sourceCommit: integrity.sourceCommit,
    nextDataNeeds: [
      'Avklar Finland–Åland-grensen i Eurostat-uttrekket før Finland-verdi brukes.',
      'Koble avfallsinput til målte N-, P- og K-utbytter og faktisk substitusjon.',
      'Skaff sammenlignbare definisjoner, perioder og systemgrenser før landanalyse.',
    ],
    laterExpertGates: [
      'Uavhengig metodevurdering av hver kilde.',
      'Partner- og rettighetsvurdering før videre deling.',
      'Separat publiserings- og coverage-beslutning; denne piloten åpner ingen av delene.',
    ],
  }
  return { packets, status, insights, sources, receipts }
}

function checkOrWrite(root: string, path: string, content: string, check: boolean) {
  const absolute = resolve(root, path)
  if (check) {
    if (!existsSync(absolute)) fail(`Missing generated artifact: ${path}`)
    if (readFileSync(absolute, 'utf8') !== content) fail(`Generated artifact is stale: ${path}`)
    return
  }
  mkdirSync(dirname(absolute), { recursive: true })
  writeFileSync(absolute, content)
}

export function writeOrCheckOwnerReviewArtifacts(root: string, check: boolean) {
  const artifacts = buildOwnerReviewArtifacts(root)
  checkOrWrite(root, OWNER_PACKETS_PATH, pretty(artifacts.packets), check)
  checkOrWrite(root, OWNER_STATUS_PATH, pretty(artifacts.status), check)
  checkOrWrite(root, OWNER_INSIGHT_PATH, pretty(artifacts.insights), check)
  const receiptsPath = resolve(root, OWNER_RECEIPTS_PATH)
  if (!existsSync(receiptsPath) && !check) {
    mkdirSync(dirname(receiptsPath), { recursive: true })
    writeFileSync(receiptsPath, '')
  }
  if (check && !existsSync(receiptsPath)) fail(`Missing append-only receipt log: ${OWNER_RECEIPTS_PATH}`)
  return artifacts
}

export function verifyPrivateCopies(root: string) {
  const intake = json<Intake>(root, EVIDENCE_INTAKE_PATH)
  const captures = [...new Map(
    intake.sourceAcquisitions
      .filter((item) => item.captureStorage === 'local_external')
      .map((item) => [item.captureSha256, item]),
  ).values()]
  const localCandidates = [
    process.env.FIELD08_PRIVATE_ARCHIVE_ROOT,
    resolve(root, '.private-archive/field08/sha256'),
    resolve(root, '../../.private-archive/field08/sha256'),
  ].filter((item): item is string => Boolean(item))
  const localRoot = localCandidates.find(existsSync) ?? fail('Field 08 local private archive root was not found')
  const bigBrainRoot = process.env.FIELD08_BIGBRAIN_ARCHIVE_ROOT
    ?? '/Volumes/BigBrain_StorageBox1TB/Food Systems 2026 Private Archive/field08/sha256'
  for (const capture of captures) {
    const basename = `${capture.captureSha256.replace('sha256:', '')}.pdf`
    for (const archiveRoot of [localRoot, bigBrainRoot]) {
      const path = resolve(archiveRoot, basename)
      if (!existsSync(path)) fail(`Missing private PDF copy: ${path}`)
      if (sha256Bytes(readFileSync(path)) !== capture.captureSha256) fail(`Private PDF hash mismatch: ${path}`)
    }
  }
  return captures.map((capture) => ({ sourceId: capture.sourceId, captureSha256: capture.captureSha256, localPath: realpathSync(resolve(localRoot, `${capture.captureSha256.replace('sha256:', '')}.pdf`)) }))
}

export async function replayStoredApiRequests(root: string) {
  const intake = json<Intake>(root, EVIDENCE_INTAKE_PATH)
  const receiptPaths = [...new Set(intake.sourceAcquisitions.map((item) => item.requestReceiptPath).filter((item): item is string => Boolean(item)))]
  const results: Array<{ requestId: string; responsePath: string; sha256: string }> = []
  for (const receiptPath of receiptPaths) {
    const receipt = json<{ requests: Array<{ requestId: string; method: string; url: string; headers: Record<string, string>; body: unknown; responsePath: string }> }>(root, receiptPath)
    for (const request of receipt.requests) {
      const expected = readFileSync(resolve(root, request.responsePath))
      const response = await fetch(request.url, {
        method: request.method,
        headers: request.headers,
        body: request.body === null ? undefined : JSON.stringify(request.body),
      })
      if (!response.ok) fail(`${request.requestId} replay returned HTTP ${response.status}`)
      const actual = Buffer.from(await response.arrayBuffer())
      if (sha256Bytes(actual) !== sha256Bytes(expected)) fail(`${request.requestId} replay bytes differ from the stored response`)
      results.push({ requestId: request.requestId, responsePath: request.responsePath, sha256: sha256Bytes(actual) })
    }
  }
  return results
}

function appendReceipt(root: string, receiptPath: string) {
  const artifacts = buildOwnerReviewArtifacts(root)
  const candidate = json<Field08OwnerReviewReceipt>(root, receiptPath)
  validateOwnerReviewReceipt(candidate, {
    evidencePackageHash: artifacts.status.evidencePackageHash,
    sources: artifacts.sources,
  })
  validateOwnerReviewReceiptLog([...artifacts.receipts, candidate], {
    evidencePackageHash: artifacts.status.evidencePackageHash,
    sources: artifacts.sources,
  }, artifacts.receipts)
  appendFileSync(resolve(root, OWNER_RECEIPTS_PATH), `${JSON.stringify(candidate)}\n`)
  writeOrCheckOwnerReviewArtifacts(root, false)
}

async function main() {
  const root = process.cwd()
  const args = process.argv.slice(2)
  if (args.includes('--verify-private') || args.includes('--show-review-links')) {
    const verified = verifyPrivateCopies(root)
    console.log(`Field 08 private copies verified: ${verified.length} sources, two copies each.`)
    if (args.includes('--show-review-links')) {
      for (const item of verified) {
        console.log(`${item.sourceId}: ${pathToFileURL(item.localPath).href}`)
      }
    }
  }
  if (args.includes('--replay-api')) {
    const replayed = await replayStoredApiRequests(root)
    console.log(`Field 08 API requests replayed byte-for-byte: ${replayed.length}.`)
  }
  const appendIndex = args.indexOf('--append-receipt')
  if (appendIndex >= 0) {
    const path = args[appendIndex + 1] ?? fail('--append-receipt requires a JSON path')
    appendReceipt(root, path)
    console.log('Owner-review receipt appended and projections regenerated.')
    return
  }
  const check = args.includes('--check') || args.includes('--validate-receipts')
  const artifacts = writeOrCheckOwnerReviewArtifacts(root, check)
  console.log(`Field 08 owner review ${check ? 'verified' : 'generated'}: ${artifacts.sources.length} sources; ${artifacts.receipts.length} receipts; ${artifacts.insights.insights.length} insights.`)
}

if (process.argv[1] && realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
}
