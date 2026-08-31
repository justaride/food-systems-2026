import { createHash } from 'node:crypto'

export const OWNER_ATTESTATION = 'Jeg, Gabriel Freeman, har personlig gjennomgått den eksakte kildepakken og bekrefter denne beslutningen for intern bruk med de oppgitte begrensningene. AI har bare bistått med forberedelse og har ikke signert eller tatt beslutningen.' as const

export type OwnerDecision =
  | 'accepted_internal_with_limitations'
  | 'returned_for_revision'
  | 'rejected'
  | 'retained_open'

export type Field08OwnerReviewSource = {
  sourceId: string
  sourceHash: string
  title: string
  publisher: string
  geographyIds: string[]
  locatorCount: number
}

export type Field08OwnerReviewReceipt = {
  documentType: 'field08_owner_review_receipt'
  schemaVersion: '1.0.0'
  receiptId: string
  sequence: number
  supersedesReceiptId: string | null
  previousReceiptHash: string | null
  evidencePackageHash: string
  sourceId: string
  sourceHash: string
  signer: {
    personId: 'person.gabriel_freeman'
    signedAt: string
    attestation: typeof OWNER_ATTESTATION
  }
  decision: OwnerDecision
  allowedInternalUses: string[]
  limitations: string[]
  openQuestions: string[]
  aiAssistance: { used: boolean; disclosure: string }
  externalUseAllowed: false
  coveragePromotionAllowed: false
  contentHash: string
}

export type OwnerReviewValidationContext = {
  evidencePackageHash: string
  sources: Field08OwnerReviewSource[]
  now?: Date
}

type CanonicalValue = null | boolean | number | string | CanonicalValue[] | { [key: string]: CanonicalValue }

function canonicalize(value: unknown): CanonicalValue {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new Error('Canonical JSON does not permit non-finite numbers')
    return value
  }
  if (Array.isArray(value)) return value.map(canonicalize)
  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, item]) => item !== undefined)
        .sort(([left], [right]) => Buffer.compare(Buffer.from(left, 'utf8'), Buffer.from(right, 'utf8')))
        .map(([key, item]) => [key, canonicalize(item)]),
    )
  }
  throw new Error(`Unsupported canonical JSON value: ${typeof value}`)
}

export function canonicalJson(value: unknown): string {
  return JSON.stringify(canonicalize(value))
}

export function canonicalSha256(value: unknown): string {
  return `sha256:${createHash('sha256').update(canonicalJson(value)).digest('hex')}`
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

function withoutHash<T extends { contentHash: string }>(value: T): Omit<T, 'contentHash'> {
  const { contentHash: _contentHash, ...payload } = value
  return payload
}

export function validateOwnerReviewReceipt(
  receipt: Field08OwnerReviewReceipt,
  context: OwnerReviewValidationContext,
): void {
  assert(receipt.documentType === 'field08_owner_review_receipt', 'Wrong owner-review document type')
  assert(receipt.schemaVersion === '1.0.0', 'Unsupported owner-review schema version')
  assert(receipt.signer.personId === 'person.gabriel_freeman', 'Only Gabriel may sign an owner-review receipt; an AI signer is forbidden')
  assert(receipt.signer.attestation === OWNER_ATTESTATION, 'The canonical Gabriel attestation is required')
  assert(receipt.evidencePackageHash === context.evidencePackageHash, 'Receipt evidence package hash does not match')
  const source = context.sources.find((item) => item.sourceId === receipt.sourceId)
  assert(source, `Unknown Field 08 source: ${receipt.sourceId}`)
  assert(receipt.sourceHash === source.sourceHash, 'Receipt source hash does not match')
  assert(Number.isInteger(receipt.sequence) && receipt.sequence >= 1, 'Receipt sequence must be a positive integer')
  assert(['accepted_internal_with_limitations', 'returned_for_revision', 'rejected', 'retained_open'].includes(receipt.decision), 'Invalid owner-review decision')
  assert(receipt.externalUseAllowed === false, 'External use must remain false')
  assert(receipt.coveragePromotionAllowed === false, 'Coverage promotion must remain false')
  assert(receipt.allowedInternalUses.length > 0, 'At least one allowed internal use is required')
  assert(receipt.limitations.length > 0, 'At least one limitation is required')
  assert(typeof receipt.aiAssistance?.used === 'boolean', 'AI-assistance state is required')
  assert(receipt.aiAssistance.disclosure.trim().length > 0, 'AI disclosure is required')
  const signedAt = new Date(receipt.signer.signedAt)
  assert(!Number.isNaN(signedAt.getTime()), 'Invalid signed timestamp')
  assert(signedAt.getTime() <= (context.now ?? new Date()).getTime(), 'Receipt timestamp is in the future')
  assert(receipt.contentHash === canonicalSha256(withoutHash(receipt)), 'Receipt content hash does not match canonical payload')
}

export function validateOwnerReviewReceiptLog(
  receipts: Field08OwnerReviewReceipt[],
  context: OwnerReviewValidationContext,
  previousReceipts: Field08OwnerReviewReceipt[] = [],
): void {
  assert(receipts.length >= previousReceipts.length, 'Append-only receipt history was truncated')
  previousReceipts.forEach((previous, index) => {
    assert(canonicalJson(receipts[index]) === canonicalJson(previous), 'Append-only receipt history was rewritten')
  })

  const seenIds = new Set<string>()
  const latestBySource = new Map<string, Field08OwnerReviewReceipt>()
  for (const receipt of receipts) {
    validateOwnerReviewReceipt(receipt, context)
    assert(!seenIds.has(receipt.receiptId), `Duplicate receipt ID: ${receipt.receiptId}`)
    seenIds.add(receipt.receiptId)
    const previous = latestBySource.get(receipt.sourceId)
    if (!previous) {
      assert(receipt.sequence === 1, 'First receipt in a source chain must have sequence 1')
      assert(receipt.supersedesReceiptId === null && receipt.previousReceiptHash === null, 'First receipt cannot supersede another receipt')
    } else {
      assert(receipt.sequence === previous.sequence + 1, 'Superseding receipt sequence must increment by one')
      assert(receipt.supersedesReceiptId === previous.receiptId, 'Superseding receipt must bind the previous receipt ID')
      assert(receipt.previousReceiptHash === previous.contentHash, 'Superseding receipt must bind the previous receipt hash')
    }
    latestBySource.set(receipt.sourceId, receipt)
  }
}

export function latestOwnerReceipts(receipts: Field08OwnerReviewReceipt[]): Map<string, Field08OwnerReviewReceipt> {
  const latest = new Map<string, Field08OwnerReviewReceipt>()
  for (const receipt of receipts) latest.set(receipt.sourceId, receipt)
  return latest
}

export function buildOwnerReviewStatus(
  evidencePackageHash: string,
  sources: Field08OwnerReviewSource[],
  receipts: Field08OwnerReviewReceipt[],
) {
  const latest = latestOwnerReceipts(receipts)
  const terminal = new Set<OwnerDecision>([
    'accepted_internal_with_limitations',
    'returned_for_revision',
    'rejected',
    'retained_open',
  ])
  const sourceStatuses = sources.map((source) => {
    const receipt = latest.get(source.sourceId)
    return {
      ...source,
      decision: receipt?.decision ?? 'pending_owner_review',
      receiptId: receipt?.receiptId ?? null,
      receiptHash: receipt?.contentHash ?? null,
      limitations: receipt?.limitations ?? [],
      openQuestions: receipt?.openQuestions ?? [],
      externalUseAllowed: false as const,
      coveragePromotionAllowed: false as const,
    }
  })
  const complete = sourceStatuses.every((item) => terminal.has(item.decision as OwnerDecision))
  return {
    documentType: 'field08_owner_review_status' as const,
    schemaVersion: '1.0.0' as const,
    evidencePackageHash,
    packageStatus: complete ? 'owner_review_complete_internal_only' as const : 'owner_review_in_progress' as const,
    sources: sourceStatuses,
    axes: {
      ownerReview: complete ? 'complete_internal_only' as const : 'in_progress' as const,
      expertReview: 'unchanged_pending' as const,
      partnerReview: 'unchanged_pending' as const,
      rights: 'unchanged_pending' as const,
      publication: 'unchanged_blocked' as const,
      coverage: 'unchanged_blocked' as const,
    },
    externalUseAllowed: false as const,
    coveragePromotionAllowed: false as const,
  }
}

function sourceKind(sourceId: string): 'eurostat' | 'luke' | 'norway' | 'asub' | 'iceland' | 'other' {
  const id = sourceId.toLowerCase()
  if (id.includes('eurostat')) return 'eurostat'
  if (id.includes('luke')) return 'luke'
  if (id.includes('landbruksdirektoratet')) return 'norway'
  if (id.includes('asub')) return 'asub'
  if (id.includes('environment-agency')) return 'iceland'
  return 'other'
}

export function buildField08InsightRegister(
  evidencePackageHash: string,
  sources: Field08OwnerReviewSource[],
  receipts: Field08OwnerReviewReceipt[],
) {
  const latest = latestOwnerReceipts(receipts)
  const accepted = sources.filter((source) => latest.get(source.sourceId)?.decision === 'accepted_internal_with_limitations')
  const insightTemplates = {
    eurostat: {
      insightId: 'insight.field08.dk.within-source-stage-distribution.v1',
      statement: 'Danmarks 2023-tall kan brukes til å undersøke fordelingen mellom ledd innen den samme Eurostat-definisjonen; dette er ikke en nordisk rangering.',
      observationIds: [
        'fs:observation:field08.dk.eurostat-food-waste-total-2023',
        'fs:observation:field08.dk.eurostat-food-waste-primary-2023',
        'fs:observation:field08.dk.eurostat-food-waste-manufacturing-2023',
        'fs:observation:field08.dk.eurostat-food-waste-retail-2023',
        'fs:observation:field08.dk.eurostat-food-waste-foodservice-2023',
        'fs:observation:field08.dk.eurostat-food-waste-household-2023',
      ],
      calculationMethod: 'Hvert kompatibelt leddelt Danmark-tall divideres på Eurostat-totalen for Danmark i samme uttrekk.',
      denominator: '1 553 763 tonn, Danmark TOT, 2023, samme Eurostat-uttrekk',
      period: '2023',
      systemBoundary: 'Danmark; W091_092_101_FD; COL; de fem deklarerte NACE-/husholdningsleddene.',
      comparabilityClass: 'within_source_same_country_compatible',
      alternativeExplanations: ['Fordelingen kan påvirkes av nasjonal målemetode og klassifisering mellom ledd.'],
      disconfirmingEvidence: ['Eurostat-strukturen alene dokumenterer ikke harmonisert målemetode mellom land.'],
    },
    luke: {
      insightId: 'insight.field08.npk-accounting-gap.v1',
      statement: 'Luke-tallene synliggjør et kunnskapshull mellom jordbruksbalanser og dokumentert næringsstoffgjenvinning; Finland- og Åland-ratene er ikke additive.',
      observationIds: ['fs:observation:field08.fi.luke-n-balance-2024', 'fs:observation:field08.fi.luke-p-balance-2024', 'fs:observation:field08.ax.luke-n-balance-2024', 'fs:observation:field08.ax.luke-p-balance-2024'],
      calculationMethod: 'Kvalitativ gap-identifikasjon; ingen summering eller subtraksjon.',
      denominator: 'Ikke relevant; kildeverdiene er separate kg/ha-rater.',
      period: '2024',
      systemBoundary: 'Jordbruksarealets N- og P-balanser; Finland-raden inkluderer Åland.',
      comparabilityClass: 'nested_geographies_non_additive',
      alternativeExplanations: ['Balanseoverskudd kan skyldes flere innsats- og uttaksforhold enn sidestrømmer.'],
      disconfirmingEvidence: ['Kilden måler ikke faktisk substitusjon av mineralgjødsel.'],
    },
    norway: {
      insightId: 'insight.field08.no.agriculture-boundary.v1',
      statement: 'Den norske kilden kan belyse intern fordeling av matsvinn innen jordbrukssektoren, men ikke norsk total for matsystemet.',
      observationIds: [
        'fs:observation:field08.no.food-waste-total-table-2024',
        'fs:observation:field08.no.food-waste-total-prose-2024',
        'fs:observation:field08.no.food-waste-share-2024',
      ],
      calculationMethod: 'Kildeintern sammenstilling av deklarerte jordbruksledd.',
      denominator: 'Kildens total for jordbrukssektoren, ikke hele matsystemet.',
      period: '2024',
      systemBoundary: 'Norsk jordbrukssektor som definert i Rapport 45/2025.',
      comparabilityClass: 'within_source_sector_only',
      alternativeExplanations: ['Rapporteringsgrad og produktsammensetning kan drive forskjeller mellom ledd.'],
      disconfirmingEvidence: ['Kilden utelater andre deler av matsystemet.'],
    },
    asub: {
      insightId: 'insight.field08.ax.treatment-input-not-recovery.v1',
      statement: 'ÅSUB skiller mellom avfallsmengde, behandlingskode og eksport; ingen av disse dokumenterer faktisk N–P–K-substitusjon.',
      observationIds: ['fs:observation:field08.ax.animal-mixed-food-waste-2024', 'fs:observation:field08.ax.r3-animal-mixed-treatment-2024'],
      calculationMethod: 'Begreps- og grenseanalyse av deklarerte tabeller; ingen massebalanse beregnes.',
      denominator: 'Ikke etablert for næringsstoffgjenvinning.',
      period: '2024',
      systemBoundary: 'Ålands mottatte avfallsmasse, behandlingskoder og eksportposter.',
      comparabilityClass: 'treatment_input_not_outcome',
      alternativeExplanations: ['R3+-koding kan dekke ulike faktiske prosesser og utbytter.'],
      disconfirmingEvidence: ['Ingen dokumentert N-, P- eller K-mengde som erstatter jomfruelig innsats.'],
    },
    iceland: {
      insightId: 'insight.field08.is.method-conflict.v1',
      statement: 'Islands tilsynelatende totaler må leses sammen med kildekonflikter og dokumenterte målefeil; de er ikke et sikkert nordisk sammenligningspunkt.',
      observationIds: [
        'fs:observation:field08.is.food-waste-total-2022',
        'fs:observation:field08.is.abstract-manufacturing-2022',
        'fs:observation:field08.is.abstract-retail-2022',
        'fs:observation:field08.is.abstract-foodservice-2022',
        'fs:observation:field08.is.abstract-household-share-2022',
        'fs:observation:field08.is.section-household-share-2022',
      ],
      calculationMethod: 'Metodisk konfliktanalyse uten rangering.',
      denominator: 'Kildens deklarerte univers, med eksplisitte frafalls- og klassifikasjonsproblemer.',
      period: '2022',
      systemBoundary: 'Island, kildefordelte matsvinnestimater i sluttrapporten.',
      comparabilityClass: 'source_conflict_requires_caution',
      alternativeExplanations: ['Frafall, falske nuller og ulik sektoravgrensning kan forklare avvik.'],
      disconfirmingEvidence: ['Rapporten dokumenterer selv metodiske svakheter og motstridende verdier.'],
    },
  } as const

  const insights = accepted.flatMap((source) => {
    const kind = sourceKind(source.sourceId)
    if (kind === 'other') return []
    const template = insightTemplates[kind]
    const owner = latest.get(source.sourceId)!
    return [{
      ...template,
      sourceIds: [source.sourceId],
      ownerReceiptId: owner.receiptId,
      ownerReceiptHash: owner.contentHash,
      limitations: owner.limitations,
      citationReadiness: 'internal_context' as const,
      externalUseAllowed: false as const,
      coveragePromotionAllowed: false as const,
    }]
  })

  const gaps = sources
    .filter((source) => latest.get(source.sourceId)?.decision !== 'accepted_internal_with_limitations')
    .map((source) => ({
      gapId: `gap.field08.${sourceKind(source.sourceId)}.owner-review.v1`,
      sourceIds: [source.sourceId],
      note: `Ingen innsiktsfunn kan genereres: eierbeslutning er ${latest.get(source.sourceId)?.decision ?? 'pending_owner_review'}.`,
    }))

  return {
    documentType: 'field08_internal_insight_register' as const,
    schemaVersion: '1.0.0' as const,
    evidencePackageHash,
    insights,
    gaps,
    blockedComparisons: [
      { statement: 'Ingen nordisk rangering av matsvinn eller N–P–K.', reason: 'Definisjoner, perioder og systemgrenser avviker.' },
      { statement: 'Ingen Finland-verdi fra Eurostat.', reason: 'Finland–Åland-grensen er uavklart.' },
      { statement: 'Ingen summering eller subtraksjon av Luke-rater.', reason: 'Finland inkluderer Åland; Finland- og Åland-ratene er ikke additive.' },
      { statement: 'Ingen norsk matsystemtotal fra jordbruksrapporten.', reason: 'Kilden dekker bare jordbrukssektoren.' },
      { statement: 'Ingen dokumentert N–P–K-gjenvinning fra behandlingskode eller våtmasse.', reason: 'Input og kode dokumenterer ikke faktisk næringsstoffsubstitusjon.' },
    ],
    doNotSay: [
      'Danmark har mest eller minst matsvinn i Norden.',
      'Eurostat dokumenterer et sikkert Finland-tall uten avklart Åland-grense.',
      'Luke-ratene kan summeres eller trekkes fra hverandre.',
      'Landbruksdirektoratets tall er norsk total for matsystemet.',
      'R3+-kode eller mottatt våtmasse beviser N–P–K-gjenvinning.',
    ],
    externalUseAllowed: false as const,
    coveragePromotionAllowed: false as const,
  }
}
