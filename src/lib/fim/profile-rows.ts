// Pure mapping from the sealed Food Innovation Map Norway (FIM) package to
// database rows. No Prisma or filesystem access, so tests run on synthetic
// fixtures. The real inputs live in the private data repository.

export const FIM_RELEASE_ID = 'enrichment-v009'
export const FIM_SEAL_SHA256 = '2983fae2c2133689c6348fd00c04d4def37bd9e6708b795c447f670d31642ad9'
export const FIM_PILOT_SEAL_SHA256 = '76c1334b9ed7c22426393d775fbbfb15a8b4bbeb26780b9679390ea263697551'

// JSONB does not keep key order, so the display order is fixed here.
export const FIM_FIELD_ORDER = [
  'identity', 'legal_status', 'purpose', 'scope', 'products', 'technology', 'feedstocks', 'markets', 'facilities',
  'capacity', 'stage', 'people', 'governance', 'ownership', 'finance', 'projects', 'relations', 'impact',
]

const UNDOCUMENTED_STATES = new Set(['not_structured_in_inputs', 'not_yet_documented', 'not_researched'])

type Obj = Record<string, unknown>

export type FimField = {
  label?: string
  evidence_state: string
  applicability?: string
  evidence?: unknown[]
  issues?: unknown[]
  numeric_observations?: unknown[]
} & Obj

export type FimRawProfile = {
  actor_id: string
  org_number?: string | null
  name: string
  entity_kind: string
  origin?: string | null
  fields: Record<string, FimField>
  inherited_narrative?: Obj | null
  original_open_questions?: unknown[] | null
  v009_assessment?: unknown
} & Obj

export type FimRawFinding = { finding_id: string; actor_id: string } & Obj
export type FimRawObservation = { actor_id: string } & Obj
export type FimRawPilotRecord = {
  job_id: string
  kind: string
  review_verdict?: string | null
  claims?: Obj[]
  excluded_claims?: unknown[]
  field_assessments?: Obj[]
  escalations?: Obj[]
} & Obj

export type FimInputs = {
  profiles: FimRawProfile[]
  findings: FimRawFinding[]
  observations: FimRawObservation[]
  summary: { profiles: number; new_findings: number; numeric_observations: number }
  pilotRecords: FimRawPilotRecord[]
}

export type FimPilotReview = {
  jobId: string
  kind: string
  verdict: string | null
  claims: Array<{
    claimId: string
    fields: string[]
    statement: string | null
    scope: string | null
    period: string | null
    verdict: string | null
    reason: string | null
    sources: Array<{ url: string | null; pointer: string | null; value: unknown }>
  }>
  fieldAssessments: Array<{ field: string; state: string | null; reason: string | null; remainingQuestion: string | null; verdict: string | null }>
  escalations: Array<{ field: string | null; question: string | null }>
  excludedClaimCount: number
}

export type FimProfileRow = {
  id: string
  releaseId: string
  name: string
  orgNumber: string | null
  entityKind: string
  cohort: 'core' | 'fishery'
  origin: string | null
  fields: Record<string, FimField>
  findings: FimRawFinding[]
  numericObservations: FimRawObservation[]
  narrative: Obj | null
  openQuestions: unknown[] | null
  assessment: unknown
  pilotReview: FimPilotReview | null
  documentedFieldCount: number
  conflictCount: number
  searchText: string
}

const str = (value: unknown) => (typeof value === 'string' && value.trim() ? value : null)
const objects = (value: unknown) => (Array.isArray(value) ? value.filter((v): v is Obj => Boolean(v) && typeof v === 'object') : [])

function groupByActor<T extends { actor_id: string }>(items: T[]) {
  const out = new Map<string, T[]>()
  for (const item of items) out.set(item.actor_id, [...(out.get(item.actor_id) ?? []), item])
  return out
}

// Messages carry counts only: production logs are public and ids can embed
// organisation numbers of sole proprietorships.
export function validateFimInputs(inputs: FimInputs): string[] {
  const errors: string[] = []
  const { profiles, findings, observations, summary } = inputs
  if (profiles.length !== summary.profiles) errors.push(`profiles: expected ${summary.profiles}, got ${profiles.length}`)
  if (findings.length !== summary.new_findings) errors.push(`findings: expected ${summary.new_findings}, got ${findings.length}`)
  if (observations.length !== summary.numeric_observations) {
    errors.push(`numeric observations: expected ${summary.numeric_observations}, got ${observations.length}`)
  }
  const ids = new Set(profiles.map(p => p.actor_id))
  if (ids.size !== profiles.length) errors.push(`duplicate profile ids: ${profiles.length - ids.size}`)
  const malformed = profiles.filter(p => !str(p.actor_id) || !str(p.name) || !str(p.entity_kind) || !p.fields || typeof p.fields !== 'object').length
  if (malformed) errors.push(`malformed profiles: ${malformed}`)
  const orphanFindings = findings.filter(f => !ids.has(f.actor_id)).length
  if (orphanFindings) errors.push(`findings without profile: ${orphanFindings}`)
  const orphanObservations = observations.filter(o => !ids.has(o.actor_id)).length
  if (orphanObservations) errors.push(`numeric observations without profile: ${orphanObservations}`)
  return errors
}

function summarizePilotRecord(record: FimRawPilotRecord): FimPilotReview {
  return {
    jobId: record.job_id,
    kind: record.kind,
    verdict: str(record.review_verdict),
    // Source refs keep only public locators; the local reviewer paths are dropped.
    claims: objects(record.claims).map(claim => {
      const review = (claim.automated_review ?? {}) as Obj
      return {
        claimId: String(claim.claim_id ?? ''),
        fields: Array.isArray(claim.fields) ? claim.fields.map(String) : [],
        statement: str(claim.statement),
        scope: str(claim.scope),
        period: str(claim.period),
        verdict: str(review.verdict),
        reason: str(review.reason),
        sources: objects(claim.source_refs).map(ref => ({ url: str(ref.url), pointer: str(ref.json_pointer), value: ref.source_value ?? null })),
      }
    }),
    fieldAssessments: objects(record.field_assessments).map(assessment => ({
      field: String(assessment.field ?? ''),
      state: str(assessment.state),
      reason: str(assessment.reason),
      remainingQuestion: str(assessment.remaining_question),
      verdict: str(((assessment.automated_review ?? {}) as Obj).verdict),
    })),
    escalations: objects(record.escalations).map(escalation => ({ field: str(escalation.field), question: str(escalation.question) })),
    excludedClaimCount: Array.isArray(record.excluded_claims) ? record.excluded_claims.length : 0,
  }
}

export function buildFimProfileRows(inputs: FimInputs, releaseId = FIM_RELEASE_ID): FimProfileRow[] {
  const findingsByActor = groupByActor(inputs.findings)
  const observationsByActor = groupByActor(inputs.observations)
  const pilotByJob = new Map(inputs.pilotRecords.map(record => [record.job_id, record]))

  return inputs.profiles.map(profile => {
    const fields = Object.entries(profile.fields)
    const findings = findingsByActor.get(profile.actor_id) ?? []
    // v009 left field evidence empty for the fishery cohort and put its content in
    // findings, so a field with a finding counts as documented.
    const fieldsWithFindings = new Set(findings.flatMap(finding => (Array.isArray(finding.fields) ? finding.fields.map(String) : [])))
    const pilot = pilotByJob.get(`actor-${profile.actor_id}`)
    const narrative = profile.inherited_narrative ?? null
    return {
      id: profile.actor_id,
      releaseId,
      name: profile.name,
      orgNumber: str(profile.org_number),
      entityKind: profile.entity_kind,
      // The 662 profiles carrying an origin came from the fishery approval crosswalk.
      cohort: str(profile.origin) ? 'fishery' : 'core',
      origin: str(profile.origin),
      fields: profile.fields,
      findings,
      numericObservations: observationsByActor.get(profile.actor_id) ?? [],
      narrative,
      openQuestions: profile.original_open_questions ?? null,
      assessment: profile.v009_assessment ?? null,
      pilotReview: pilot ? summarizePilotRecord(pilot) : null,
      documentedFieldCount: fields.filter(([key, field]) => !UNDOCUMENTED_STATES.has(field.evidence_state) || fieldsWithFindings.has(key)).length,
      conflictCount: fields.filter(([, field]) => field.evidence_state === 'conflict_open').length,
      searchText: [profile.name, profile.org_number, profile.entity_kind, str(narrative?.text)].filter(Boolean).join(' '),
    }
  })
}
