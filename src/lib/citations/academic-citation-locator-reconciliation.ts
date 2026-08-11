export type AcademicLocatorEntityKind = 'Report' | 'SourceDoc'

export type AcademicLocatorRepairContract = {
  kind: AcademicLocatorEntityKind
  id: string
  expected: string
  alternateExpected?: readonly string[]
  replacement: string
  reviewedCitationLocators?: readonly string[]
  expectedTitle?: string
  replacementTitle?: string
  verifiedAccessDate: string
}

export type AcademicLocatorEntitySnapshot = {
  kind: AcademicLocatorEntityKind
  id: string
  title: string | null
  documentId: string | null
  locator: string | null
  accessedAt: Date | string | null
}

export type AcademicLocatorFieldBinding = {
  id: string
  entityType: string
  entityId: string
  fieldPath: string | null
}

export type AcademicLocatorCitationSnapshot = {
  id: string
  citationText: string
  title: string | null
  url: string | null
  accessedAt: Date | string | null
  updatedAt: Date | string
  sourceDocId: string | null
  documentId: string | null
  fieldCitations: readonly AcademicLocatorFieldBinding[]
}

export type AcademicCitationLocatorMutationMode =
  | 'old_to_verified'
  | 'null_to_verified'
  | 'accessed_at_only'

export type AcademicCitationLocatorAuditStatus =
  | 'pending_old_to_verified'
  | 'pending_null_to_verified'
  | 'pending_accessed_at_only'
  | 'already_applied'
  | 'reviewed_alternate_locator'
  | 'uncovered_missing_locator'
  | 'manual_unreviewed_locator'
  | 'manual_identity_mismatch'
  | 'manual_ambiguous_entity'

export type AcademicCitationLocatorMutation = {
  citationId: string
  targetKey: string
  mode: AcademicCitationLocatorMutationMode
  expectedUrl: string | null
  replacementUrl: string
  expectedAccessedAt: string | null
  replacementAccessedAt: string
  expectedUpdatedAt: string
}

export type AcademicCitationLocatorAuditRow = {
  citationId: string
  targetKeys: string[]
  fieldBoundTargetKeys: string[]
  associationSources: Array<'field_citation' | 'source_doc_fk' | 'document_fk'>
  currentUrl: string | null
  status: AcademicCitationLocatorAuditStatus
  reason: string
}

export type AcademicCitationLocatorReconciliationSummary = {
  targetEntities: number
  reportTargets: number
  sourceDocTargets: number
  auditedCitations: number
  fieldCitationBoundCitations: number
  nonNullLocatorCitations: number
  pendingOldToVerified: number
  pendingNullToVerified: number
  pendingAccessedAtOnly: number
  alreadyApplied: number
  reviewedAlternateLocator: number
  uncoveredMissingLocator: number
  manualUnreviewedLocator: number
  manualIdentityMismatch: number
  manualAmbiguousEntity: number
  targetsWithoutCitations: number
  hardConflicts: number
}

export type AcademicCitationLocatorReconciliationPlan = {
  auditRows: AcademicCitationLocatorAuditRow[]
  mutations: AcademicCitationLocatorMutation[]
  hardConflicts: string[]
  targetsWithoutCitations: string[]
  summary: AcademicCitationLocatorReconciliationSummary
}

function targetKey(kind: AcademicLocatorEntityKind, id: string) {
  return `${kind}:${id}`
}

function timestamp(value: Date | string | null): number | null {
  if (value == null) return null
  const parsed = value instanceof Date ? value : new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed.getTime()
}

function isoTimestamp(value: Date | string | null): string | null {
  const parsed = timestamp(value)
  return parsed == null ? null : new Date(parsed).toISOString()
}

function verifiedTimestamp(date: string) {
  return new Date(`${date}T00:00:00.000Z`).getTime()
}

function locatorField(kind: AcademicLocatorEntityKind) {
  return kind === 'Report' ? 'sourceUrl' : 'url'
}

function allowedTitles(
  repair: AcademicLocatorRepairContract,
  entity: AcademicLocatorEntitySnapshot,
) {
  return new Set(
    [repair.expectedTitle, repair.replacementTitle, entity.title]
      .filter((value): value is string => Boolean(value)),
  )
}

function hasPinnedIdentity(
  repair: AcademicLocatorRepairContract,
  entity: AcademicLocatorEntitySnapshot,
  citation: AcademicLocatorCitationSnapshot,
) {
  const titles = allowedTitles(repair, entity)
  if (!citation.title || !titles.has(citation.title)) return false
  return titles.has(citation.citationText.replace(`${repair.kind}: `, '')) &&
    citation.citationText.startsWith(`${repair.kind}: `)
}

function laterAccessTimestamp(
  current: Date | string | null,
  verifiedAccessDate: string,
) {
  const verified = verifiedTimestamp(verifiedAccessDate)
  const existing = timestamp(current)
  return existing != null && existing > verified ? existing : verified
}

function sameOrLaterAccessDate(
  current: Date | string | null,
  verifiedAccessDate: string,
) {
  const currentTimestamp = timestamp(current)
  return currentTimestamp != null && currentTimestamp >= verifiedTimestamp(verifiedAccessDate)
}

export function buildAcademicCitationLocatorReconciliationPlan(
  repairs: readonly AcademicLocatorRepairContract[],
  entities: readonly AcademicLocatorEntitySnapshot[],
  citations: readonly AcademicLocatorCitationSnapshot[],
): AcademicCitationLocatorReconciliationPlan {
  const hardConflicts: string[] = []
  const repairByKey = new Map<string, AcademicLocatorRepairContract>()
  for (const repair of repairs) {
    const key = targetKey(repair.kind, repair.id)
    if (repairByKey.has(key)) hardConflicts.push(`duplicate repair contract: ${key}`)
    repairByKey.set(key, repair)
  }

  const entitiesByKey = new Map<string, AcademicLocatorEntitySnapshot>()
  for (const entity of entities) {
    const key = targetKey(entity.kind, entity.id)
    if (entitiesByKey.has(key)) hardConflicts.push(`duplicate entity snapshot: ${key}`)
    entitiesByKey.set(key, entity)
  }

  for (const [key, repair] of repairByKey) {
    const entity = entitiesByKey.get(key)
    if (!entity) {
      hardConflicts.push(`missing target entity: ${key}`)
      continue
    }
    if (entity.locator !== repair.replacement) {
      hardConflicts.push(`target locator drifted from verified replacement: ${key}`)
    }
    const entityAccess = timestamp(entity.accessedAt)
    if (entityAccess == null || entityAccess < verifiedTimestamp(repair.verifiedAccessDate)) {
      hardConflicts.push(`target access metadata predates verified repair: ${key}`)
    }
  }

  const sourceTargetById = new Map<string, string>()
  const documentTargetsById = new Map<string, Set<string>>()
  for (const [key, entity] of entitiesByKey) {
    if (!repairByKey.has(key)) continue
    if (entity.kind === 'SourceDoc') sourceTargetById.set(entity.id, key)
    if (entity.documentId) {
      const keys = documentTargetsById.get(entity.documentId) ?? new Set<string>()
      keys.add(key)
      documentTargetsById.set(entity.documentId, keys)
    }
  }

  const matchingTargetKeys = new Map<string, {
    keys: Set<string>
    fieldKeys: Set<string>
    sources: Set<'field_citation' | 'source_doc_fk' | 'document_fk'>
  }>()
  const locatorFieldCitationIdsByTarget = new Map<string, Set<string>>()

  for (const citation of citations) {
    const association = {
      keys: new Set<string>(),
      fieldKeys: new Set<string>(),
      sources: new Set<'field_citation' | 'source_doc_fk' | 'document_fk'>(),
    }
    for (const field of citation.fieldCitations) {
      const key = targetKey(field.entityType as AcademicLocatorEntityKind, field.entityId)
      const repair = repairByKey.get(key)
      if (!repair || (field.entityType !== 'Report' && field.entityType !== 'SourceDoc')) continue
      association.keys.add(key)
      association.fieldKeys.add(key)
      association.sources.add('field_citation')
      if (field.fieldPath === locatorField(repair.kind)) {
        const citationIds = locatorFieldCitationIdsByTarget.get(key) ?? new Set<string>()
        citationIds.add(citation.id)
        locatorFieldCitationIdsByTarget.set(key, citationIds)
      }
    }
    if (citation.sourceDocId) {
      const key = sourceTargetById.get(citation.sourceDocId)
      if (key) {
        association.keys.add(key)
        association.sources.add('source_doc_fk')
      }
    }
    if (citation.documentId) {
      for (const key of documentTargetsById.get(citation.documentId) ?? []) {
        association.keys.add(key)
        association.sources.add('document_fk')
      }
    }
    if (association.keys.size > 0) matchingTargetKeys.set(citation.id, association)
  }

  const seenCitationIds = new Set<string>()
  const auditRows: AcademicCitationLocatorAuditRow[] = []
  const mutations: AcademicCitationLocatorMutation[] = []
  const citedTargetKeys = new Set<string>()

  for (const citation of [...citations].sort((left, right) => left.id.localeCompare(right.id))) {
    const association = matchingTargetKeys.get(citation.id)
    if (!association) continue
    if (seenCitationIds.has(citation.id)) {
      hardConflicts.push(`duplicate citation snapshot: ${citation.id}`)
      continue
    }
    seenCitationIds.add(citation.id)
    for (const key of association.keys) citedTargetKeys.add(key)

    const keys = [...association.keys].sort()
    const fieldKeys = [...association.fieldKeys].sort()
    const sources = [...association.sources].sort()
    const base = {
      citationId: citation.id,
      targetKeys: keys,
      fieldBoundTargetKeys: fieldKeys,
      associationSources: sources,
      currentUrl: citation.url,
    }

    if (keys.length !== 1) {
      auditRows.push({
        ...base,
        status: 'manual_ambiguous_entity',
        reason: `Citation is associated with ${keys.length} reviewed entities; no mutation is safe.`,
      })
      continue
    }

    const key = keys[0]!
    const repair = repairByKey.get(key)!
    const entity = entitiesByKey.get(key)!
    const expectedLocators = new Set([repair.expected, ...(repair.alternateExpected ?? [])])
    const pinnedIdentity = hasPinnedIdentity(repair, entity, citation)
    const targetLocatorBindings = citation.fieldCitations.filter(field =>
      field.entityType === repair.kind &&
      field.entityId === repair.id &&
      field.fieldPath === locatorField(repair.kind),
    )
    const uniqueLocatorCitation = locatorFieldCitationIdsByTarget.get(key)?.size === 1
    const semanticallyPinned = pinnedIdentity && targetLocatorBindings.length === 1
    const expectedUpdatedAt = isoTimestamp(citation.updatedAt)
    if (!expectedUpdatedAt) {
      hardConflicts.push(`invalid citation updatedAt snapshot: ${citation.id}`)
      continue
    }
    const expectedAccessedAt = isoTimestamp(citation.accessedAt)
    const replacementAccessedAt = new Date(
      laterAccessTimestamp(citation.accessedAt, repair.verifiedAccessDate),
    ).toISOString()

    if (citation.url != null && expectedLocators.has(citation.url)) {
      if (!semanticallyPinned) {
        auditRows.push({
          ...base,
          status: 'manual_identity_mismatch',
          reason: 'Old locator is exact, but title and locator-field identity are not uniquely pinned.',
        })
        continue
      }
      mutations.push({
        citationId: citation.id,
        targetKey: key,
        mode: 'old_to_verified',
        expectedUrl: citation.url,
        replacementUrl: repair.replacement,
        expectedAccessedAt,
        replacementAccessedAt,
        expectedUpdatedAt,
      })
      auditRows.push({
        ...base,
        status: 'pending_old_to_verified',
        reason: 'Exact pinned old locator will be replaced; all other citation metadata is preserved.',
      })
      continue
    }

    if (citation.url === repair.replacement) {
      if (sameOrLaterAccessDate(citation.accessedAt, repair.verifiedAccessDate)) {
        auditRows.push({
          ...base,
          status: 'already_applied',
          reason: 'Verified locator and same-or-later access metadata are already present.',
        })
        continue
      }
      if (!semanticallyPinned) {
        auditRows.push({
          ...base,
          status: 'manual_identity_mismatch',
          reason: 'Verified locator is present, but access metadata cannot be changed without pinned identity.',
        })
        continue
      }
      mutations.push({
        citationId: citation.id,
        targetKey: key,
        mode: 'accessed_at_only',
        expectedUrl: citation.url,
        replacementUrl: repair.replacement,
        expectedAccessedAt,
        replacementAccessedAt,
        expectedUpdatedAt,
      })
      auditRows.push({
        ...base,
        status: 'pending_accessed_at_only',
        reason: 'Verified locator is present; only missing or older access metadata will be advanced.',
      })
      continue
    }

    if (
      citation.url != null &&
      (repair.reviewedCitationLocators ?? []).includes(citation.url) &&
      sameOrLaterAccessDate(citation.accessedAt, repair.verifiedAccessDate)
    ) {
      auditRows.push({
        ...base,
        status: 'reviewed_alternate_locator',
        reason: 'Exact reviewed citation-level work locator and same-or-later access metadata are present.',
      })
      continue
    }

    if (citation.url == null || citation.url === '') {
      if (!semanticallyPinned || !uniqueLocatorCitation) {
        auditRows.push({
          ...base,
          status: 'uncovered_missing_locator',
          reason: 'Missing locator is not the sole title-matched locator-field citation for this entity.',
        })
        continue
      }
      mutations.push({
        citationId: citation.id,
        targetKey: key,
        mode: 'null_to_verified',
        expectedUrl: citation.url,
        replacementUrl: repair.replacement,
        expectedAccessedAt,
        replacementAccessedAt,
        expectedUpdatedAt,
      })
      auditRows.push({
        ...base,
        status: 'pending_null_to_verified',
        reason: 'The sole title-matched locator-field citation can inherit the verified entity locator.',
      })
      continue
    }

    auditRows.push({
      ...base,
      status: 'manual_unreviewed_locator',
      reason: 'Existing locator is neither an exact pinned old value nor the verified replacement.',
    })
  }

  const targetsWithoutCitations = [...repairByKey.keys()]
    .filter(key => !citedTargetKeys.has(key))
    .sort()
  const countStatus = (status: AcademicCitationLocatorAuditStatus) =>
    auditRows.filter(row => row.status === status).length

  return {
    auditRows,
    mutations,
    hardConflicts,
    targetsWithoutCitations,
    summary: {
      targetEntities: repairByKey.size,
      reportTargets: [...repairByKey.values()].filter(repair => repair.kind === 'Report').length,
      sourceDocTargets: [...repairByKey.values()].filter(repair => repair.kind === 'SourceDoc').length,
      auditedCitations: auditRows.length,
      fieldCitationBoundCitations: auditRows.filter(row => row.associationSources.includes('field_citation')).length,
      nonNullLocatorCitations: auditRows.filter(row => row.currentUrl != null && row.currentUrl !== '').length,
      pendingOldToVerified: countStatus('pending_old_to_verified'),
      pendingNullToVerified: countStatus('pending_null_to_verified'),
      pendingAccessedAtOnly: countStatus('pending_accessed_at_only'),
      alreadyApplied: countStatus('already_applied'),
      reviewedAlternateLocator: countStatus('reviewed_alternate_locator'),
      uncoveredMissingLocator: countStatus('uncovered_missing_locator'),
      manualUnreviewedLocator: countStatus('manual_unreviewed_locator'),
      manualIdentityMismatch: countStatus('manual_identity_mismatch'),
      manualAmbiguousEntity: countStatus('manual_ambiguous_entity'),
      targetsWithoutCitations: targetsWithoutCitations.length,
      hardConflicts: hardConflicts.length,
    },
  }
}

export function academicCitationLocatorMutationSignature(
  plan: AcademicCitationLocatorReconciliationPlan,
) {
  return JSON.stringify(
    [...plan.mutations]
      .sort((left, right) => left.citationId.localeCompare(right.citationId)),
  )
}
