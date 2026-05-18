import { createHash } from 'node:crypto'

export type RequiredSourceClass =
  | 'primary'
  | 'secondary'
  | 'synthesis'
  | 'internal_construct'
  | 'registry_snapshot'

export type VerificationStatus =
  | 'unverified'
  | 'machine_verified'
  | 'human_verified'
  | 'disputed'
  | 'rejected'

export type RequiredCitation = {
  sourceClass: RequiredSourceClass
  accessedAt: string
  citationText: string
  url?: string
  localPath?: string
  sourceDocId?: string
  documentId?: string
  verifiedAt?: string
  verifiedBy?: string
  verificationStatus?: VerificationStatus
  confidence?: number
  archivedUrl?: string
  contentHash?: string
  captureMethod?: string
  hashAlgorithm?: string
  notes?: string
}

export type NormalizedRequiredCitation = {
  sourceClass: RequiredSourceClass
  accessedAt: Date
  citationText: string
  url?: string
  localPath?: string
  sourceDocId?: string
  documentId?: string
  verifiedAt?: Date
  verifiedBy?: string
  verificationStatus: VerificationStatus
  confidence?: number
  archivedUrl?: string
  contentHash?: string
  captureMethod: string
  hashAlgorithm: string
  notes?: string
}

type CitationWriteData = Omit<NormalizedRequiredCitation, 'verifiedAt'> & {
  verifiedAt?: Date | null
}

type FieldCitationClient = {
  fieldCitation: {
    findFirst(args: {
      where: {
        citationId: string
        entityType: string
        entityId: string
        fieldPath: string | null
      }
    }): Promise<unknown | null>
    create(args: {
      data: {
        citationId: string
        entityType: string
        entityId: string
        fieldPath: string | null
      }
    }): Promise<unknown>
  }
}

type CitationClient = FieldCitationClient & {
  sourceCitation: {
    upsert(args: {
      where: { id: string }
      update: CitationWriteData
      create: CitationWriteData & { id: string }
    }): Promise<unknown>
  }
}

type TransactionalCitationClient<Client extends CitationClient> = Client & {
  $transaction<Result>(fn: (tx: Client) => Promise<Result>): Promise<Result>
}

const VALID_SOURCE_CLASSES = new Set<RequiredSourceClass>([
  'primary',
  'secondary',
  'synthesis',
  'internal_construct',
  'registry_snapshot',
])

const VALID_VERIFICATION_STATUSES = new Set<VerificationStatus>([
  'unverified',
  'machine_verified',
  'human_verified',
  'disputed',
  'rejected',
])

export function validateRequiredCitation(citation: RequiredCitation): void {
  const normalized = normalizeRequiredCitation(citation)

  if (!VALID_SOURCE_CLASSES.has(normalized.sourceClass)) {
    throw new Error(`sourceClass must be one of: ${[...VALID_SOURCE_CLASSES].join(', ')}`)
  }

  if (!VALID_VERIFICATION_STATUSES.has(normalized.verificationStatus)) {
    throw new Error(`verificationStatus must be one of: ${[...VALID_VERIFICATION_STATUSES].join(', ')}`)
  }

  if (!normalized.citationText) {
    throw new Error('citationText is required')
  }

  if (citation.confidence !== undefined && !Number.isInteger(citation.confidence)) {
    throw new Error('confidence must be an integer from 0 to 100')
  }

  if (normalized.confidence !== undefined && (normalized.confidence < 0 || normalized.confidence > 100)) {
    throw new Error('confidence must be an integer from 0 to 100')
  }

  if (normalized.sourceClass !== 'internal_construct' && !hasCanonicalLocator(normalized)) {
    throw new Error('non-internal citation requires at least one locator: url, localPath, sourceDocId, or documentId')
  }
}

export function normalizeRequiredCitation(citation: RequiredCitation): NormalizedRequiredCitation {
  const accessedAt = parseCitationDate(citation.accessedAt, 'accessedAt')
  const verifiedAt = citation.verifiedAt ? parseCitationDate(citation.verifiedAt, 'verifiedAt') : undefined

  return stripUndefined({
    sourceClass: citation.sourceClass,
    accessedAt,
    citationText: normalizeText(citation.citationText) ?? '',
    url: normalizeText(citation.url),
    localPath: normalizeText(citation.localPath),
    sourceDocId: normalizeText(citation.sourceDocId),
    documentId: normalizeText(citation.documentId),
    verifiedAt,
    verifiedBy: normalizeText(citation.verifiedBy),
    verificationStatus: citation.verificationStatus ?? 'unverified',
    confidence: citation.confidence,
    archivedUrl: normalizeText(citation.archivedUrl),
    contentHash: normalizeText(citation.contentHash),
    captureMethod: normalizeText(citation.captureMethod) ?? 'manual',
    hashAlgorithm: normalizeText(citation.hashAlgorithm) ?? 'sha256',
    notes: normalizeText(citation.notes),
  })
}

export function buildSourceCitationId(citation: RequiredCitation): string {
  validateRequiredCitation(citation)
  const normalized = normalizeRequiredCitation(citation)
  const stablePayload = {
    sourceClass: normalized.sourceClass,
    citationText: normalized.citationText,
    url: normalized.url ?? null,
    localPath: normalized.localPath ?? null,
    sourceDocId: normalized.sourceDocId ?? null,
    documentId: normalized.documentId ?? null,
    accessedAt: normalized.accessedAt.toISOString(),
    archivedUrl: normalized.archivedUrl ?? null,
    contentHash: normalized.contentHash ?? null,
  }
  const digest = createHash('sha256').update(JSON.stringify(stablePayload)).digest('hex')

  return `cit_${digest.slice(0, 32)}`
}

export async function upsertWithCitation<T extends { id: string }, Client extends CitationClient>(
  prisma: Client,
  entityType: string,
  upsertFn: (client: Client) => Promise<T>,
  citation: RequiredCitation,
  fieldPath?: string | Array<string | null> | null,
): Promise<T> {
  validateRequiredCitation(citation)

  const citationId = buildSourceCitationId(citation)
  const citationData = toCitationWriteData(normalizeRequiredCitation(citation))
  const run = async (client: Client) => {
    const entity = await upsertFn(client)
    await client.sourceCitation.upsert({
      where: { id: citationId },
      update: citationData,
      create: {
        id: citationId,
        ...citationData,
      },
    })

    for (const normalizedFieldPath of normalizeFieldPaths(fieldPath)) {
      await ensureFieldCitation(client, citationId, entityType, entity.id, normalizedFieldPath)
    }

    return entity
  }

  if (isTransactionalCitationClient(prisma)) {
    return prisma.$transaction(tx => run(tx))
  }

  return run(prisma)
}

export async function ensureFieldCitation(
  prisma: FieldCitationClient,
  citationId: string,
  entityType: string,
  entityId: string,
  fieldPath?: string | null,
): Promise<void> {
  const normalizedFieldPath = normalizeText(fieldPath) ?? null
  const existingLink = await prisma.fieldCitation.findFirst({
    where: {
      citationId,
      entityType,
      entityId,
      fieldPath: normalizedFieldPath,
    },
  })

  if (!existingLink) {
    try {
      await prisma.fieldCitation.create({
        data: {
          citationId,
          entityType,
          entityId,
          fieldPath: normalizedFieldPath,
        },
      })
    } catch (error) {
      if (!isUniqueConstraintError(error)) throw error
    }
  }
}

function normalizeFieldPaths(fieldPath: string | Array<string | null> | null | undefined): Array<string | null> {
  const fieldPaths = Array.isArray(fieldPath) ? fieldPath : [fieldPath ?? null]
  const seen = new Set<string>()
  const normalized: Array<string | null> = []

  for (const item of fieldPaths) {
    const value = normalizeText(item) ?? null
    const key = value ?? '__record__'
    if (seen.has(key)) continue
    seen.add(key)
    normalized.push(value)
  }

  return normalized
}

function isTransactionalCitationClient<Client extends CitationClient>(prisma: Client): prisma is TransactionalCitationClient<Client> {
  return '$transaction' in prisma && typeof prisma.$transaction === 'function'
}

function isUniqueConstraintError(error: unknown): boolean {
  return typeof error === 'object'
    && error !== null
    && 'code' in error
    && error.code === 'P2002'
}

function toCitationWriteData(citation: NormalizedRequiredCitation): CitationWriteData {
  return {
    ...citation,
    verifiedAt: citation.verifiedAt ?? null,
  }
}

function hasCanonicalLocator(citation: NormalizedRequiredCitation): boolean {
  return Boolean(citation.url || citation.localPath || citation.sourceDocId || citation.documentId)
}

function parseCitationDate(value: string, fieldName: string): Date {
  const normalized = normalizeText(value)
  if (!normalized) {
    throw new Error(`${fieldName} is required`)
  }

  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${fieldName} must be a valid ISO-8601 date`)
  }

  return date
}

function normalizeText(value: string | null | undefined): string | undefined {
  const normalized = value?.trim().replace(/\s+/g, ' ')
  return normalized ? normalized : undefined
}

function stripUndefined<T extends Record<string, unknown>>(value: T): T {
  return Object.fromEntries(Object.entries(value).filter(([, item]) => item !== undefined)) as T
}
