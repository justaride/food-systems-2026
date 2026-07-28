import 'dotenv/config'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { pathToFileURL } from 'node:url'
import { Prisma, PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import {
  ACADEMIC_CLAIM_ANCHOR_PILOT,
  classifyAcademicClaimAnchorState,
  sourceSnapshotMatchesAcademicClaimAnchor,
  validateAcademicClaimAnchorPilot,
  type AcademicClaimAnchor,
  type AcademicClaimAnchorExistingCitation,
  type AcademicClaimAnchorExistingFieldCitation,
  type AcademicClaimAnchorState,
} from '../src/lib/citations/academic-claim-anchor-pilot'

const APPLY_ACK = 'APPLY_REVIEWED_ACADEMIC_CLAIM_ANCHOR_PILOT'
const ADVISORY_LOCK_KEY = 'foodsystems:academic-claim-anchor-pilot:v1'

const sourceCitationSelect = {
  id: true,
  sourceDocId: true,
  sourceClass: true,
  citationReadiness: true,
  verificationStatus: true,
  citationText: true,
  title: true,
  publisher: true,
  author: true,
  year: true,
  url: true,
  archivedUrl: true,
  localPath: true,
  fileHash: true,
  contentHash: true,
  hashAlgorithm: true,
  pageRef: true,
  quote: true,
  accessedAt: true,
  captureMethod: true,
  verifiedAt: true,
  verifiedBy: true,
  confidence: true,
  notes: true,
  documentId: true,
} satisfies Prisma.SourceCitationSelect

const fieldCitationSelect = {
  id: true,
  citationId: true,
  entityType: true,
  entityId: true,
  fieldPath: true,
  claimText: true,
  confidence: true,
} satisfies Prisma.FieldCitationSelect

type ClaimAnchorClient = Pick<PrismaClient, 'sourceDoc' | 'sourceCitation' | 'fieldCitation'>

type InspectedAnchor = {
  anchor: AcademicClaimAnchor
  status: AcademicClaimAnchorState
  citationExists: boolean
  fieldCitationExists: boolean
  reasons: string[]
}

function sameCitationSemantics(
  anchor: AcademicClaimAnchor,
  row: AcademicClaimAnchorExistingCitation,
) {
  return (
    row.sourceDocId === anchor.citation.sourceDocId &&
    row.pageRef === anchor.citation.pageRef &&
    row.fileHash === anchor.citation.fileHash
  )
}

function sameFieldSemantics(
  anchor: AcademicClaimAnchor,
  row: AcademicClaimAnchorExistingFieldCitation,
) {
  return (
    row.entityType === anchor.fieldCitation.entityType &&
    row.entityId === anchor.fieldCitation.entityId &&
    row.fieldPath === anchor.fieldCitation.fieldPath
  )
}

async function inspectAcademicClaimAnchorPilot(
  client: ClaimAnchorClient,
  anchors: readonly AcademicClaimAnchor[],
): Promise<InspectedAnchor[]> {
  const sourceIds = [...new Set(anchors.map(anchor => anchor.source.id))]
  const citationIds = anchors.map(anchor => anchor.citation.id)
  const fieldCitationIds = anchors.map(anchor => anchor.fieldCitation.id)

  const [sourceRows, citationRows, fieldCitationRows] = await Promise.all([
    client.sourceDoc.findMany({
      where: { id: { in: sourceIds } },
      select: { id: true, title: true, url: true, provenanceType: true, accessedAt: true },
    }),
    client.sourceCitation.findMany({
      where: {
        OR: [
          { id: { in: citationIds } },
          ...anchors.map(anchor => ({
            sourceDocId: anchor.citation.sourceDocId,
            pageRef: anchor.citation.pageRef,
            fileHash: anchor.citation.fileHash,
          })),
        ],
      },
      select: sourceCitationSelect,
    }),
    client.fieldCitation.findMany({
      where: {
        OR: [
          { id: { in: fieldCitationIds } },
          ...anchors.map(anchor => ({
            entityType: anchor.fieldCitation.entityType,
            entityId: anchor.fieldCitation.entityId,
            fieldPath: anchor.fieldCitation.fieldPath,
          })),
        ],
      },
      select: fieldCitationSelect,
    }),
  ])

  const sourceById = new Map(sourceRows.map(row => [row.id, row]))
  const citationById = new Map(citationRows.map(row => [row.id, row]))
  const fieldCitationById = new Map(fieldCitationRows.map(row => [row.id, row]))
  const pinnedCitationIds = new Set(citationIds)
  const pinnedFieldCitationIds = new Set(fieldCitationIds)

  return anchors.map(anchor => {
    const currentSource = sourceById.get(anchor.source.id)
    const currentCitation = citationById.get(anchor.citation.id)
    const currentFieldCitation = fieldCitationById.get(anchor.fieldCitation.id)
    const reasons: string[] = []

    if (!currentSource) {
      reasons.push(`missing SourceDoc ${anchor.source.id}`)
    } else if (!sourceSnapshotMatchesAcademicClaimAnchor(anchor.source, currentSource)) {
      reasons.push(`SourceDoc snapshot drifted for ${anchor.source.id}`)
    }

    const semanticCitationDuplicates = citationRows.filter(row =>
      !pinnedCitationIds.has(row.id) && sameCitationSemantics(anchor, row),
    )
    if (semanticCitationDuplicates.length > 0) {
      reasons.push(`semantic SourceCitation already exists under another id: ${semanticCitationDuplicates.map(row => row.id).join(', ')}`)
    }

    const semanticFieldDuplicates = fieldCitationRows.filter(row =>
      !pinnedFieldCitationIds.has(row.id) && sameFieldSemantics(anchor, row),
    )
    if (semanticFieldDuplicates.length > 0) {
      reasons.push(`semantic FieldCitation already exists under another id: ${semanticFieldDuplicates.map(row => row.id).join(', ')}`)
    }

    const citationState = classifyAcademicClaimAnchorState(
      anchor,
      currentCitation as AcademicClaimAnchorExistingCitation | undefined,
      currentFieldCitation as AcademicClaimAnchorExistingFieldCitation | undefined,
    )
    if (citationState === 'conflict') reasons.push(`pinned citation state conflicts for ${anchor.citation.id}`)

    return {
      anchor,
      status: reasons.length > 0 ? 'conflict' : citationState,
      citationExists: Boolean(currentCitation),
      fieldCitationExists: Boolean(currentFieldCitation),
      reasons,
    }
  })
}

function summarizeInspection(rows: readonly InspectedAnchor[]) {
  const pending = rows.filter(row => row.status === 'pending')
  const applied = rows.filter(row => row.status === 'applied')
  const conflicts = rows.filter(row => row.status === 'conflict')
  console.log(`Academic claim-anchor pilot: ${pending.length} pending, ${applied.length} already applied, ${conflicts.length} conflicts`)
  return { pending, applied, conflicts }
}

function verifyPinnedAuditArtifacts(rows: readonly InspectedAnchor[]) {
  const verified = new Set<string>()
  for (const row of rows.filter(candidate => candidate.status === 'pending')) {
    const { auditArtifactPath, citation } = row.anchor
    const artifactKey = `${auditArtifactPath}:${citation.fileHash}`
    if (verified.has(artifactKey)) continue

    let actualHash: string
    try {
      actualHash = createHash('sha256').update(readFileSync(auditArtifactPath)).digest('hex')
    } catch {
      throw new Error(`Pinned PDF audit artifact is unavailable: ${auditArtifactPath}`)
    }
    if (actualHash !== citation.fileHash) {
      throw new Error(`Pinned PDF audit artifact SHA-256 mismatch: ${auditArtifactPath}`)
    }
    verified.add(artifactKey)
  }
}

function sourceCitationCreateData(anchor: AcademicClaimAnchor) {
  return {
    ...anchor.citation,
    accessedAt: new Date(anchor.citation.accessedAt),
    verifiedAt: new Date(anchor.citation.verifiedAt),
  }
}

async function main() {
  const apply = process.argv.includes('--apply')
  const ack = process.argv.find(argument => argument.startsWith('--ack='))?.slice('--ack='.length)
  if (apply && ack !== APPLY_ACK) {
    throw new Error(`--apply requires --ack=${APPLY_ACK}`)
  }
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required')

  const anchors = validateAcademicClaimAnchorPilot()
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })
  try {
    const inspection = await inspectAcademicClaimAnchorPilot(prisma, anchors)
    const summary = summarizeInspection(inspection)
    if (summary.conflicts.length > 0) {
      throw new Error(`Academic claim-anchor conflict; refusing mutation: ${summary.conflicts.flatMap(row => row.reasons).join('; ')}`)
    }
    verifyPinnedAuditArtifacts(inspection)
    if (!apply) {
      console.log(`Dry run only. Re-run with --apply --ack=${APPLY_ACK}`)
      return
    }

    const appliedCount = await prisma.$transaction(async transaction => {
      await transaction.$executeRaw`
        SELECT pg_advisory_xact_lock(hashtext(${ADVISORY_LOCK_KEY}))
      `

      for (const sourceId of [...new Set(anchors.map(anchor => anchor.source.id))]) {
        const lockedSources = await transaction.$queryRaw<Array<{ id: string }>>`
          SELECT "id" FROM "SourceDoc" WHERE "id" = ${sourceId} FOR SHARE
        `
        if (lockedSources.length !== 1) throw new Error(`SourceDoc disappeared during apply: ${sourceId}`)
      }
      for (const anchor of anchors) {
        await transaction.$queryRaw<Array<{ id: string }>>`
          SELECT "id" FROM "SourceCitation" WHERE "id" = ${anchor.citation.id} FOR UPDATE
        `
        await transaction.$queryRaw<Array<{ id: string }>>`
          SELECT "id" FROM "FieldCitation" WHERE "id" = ${anchor.fieldCitation.id} FOR UPDATE
        `
      }

      const lockedInspection = await inspectAcademicClaimAnchorPilot(transaction, anchors)
      const conflicts = lockedInspection.filter(row => row.status === 'conflict')
      if (conflicts.length > 0) {
        throw new Error(`Concurrent claim-anchor drift detected: ${conflicts.flatMap(row => row.reasons).join('; ')}`)
      }

      let created = 0
      for (const row of lockedInspection.filter(candidate => candidate.status === 'pending')) {
        if (!row.citationExists) {
          await transaction.sourceCitation.create({ data: sourceCitationCreateData(row.anchor) })
        }
        if (!row.fieldCitationExists) {
          await transaction.fieldCitation.create({ data: row.anchor.fieldCitation })
        }
        created += 1
      }
      return created
    }, { isolationLevel: 'Serializable' })

    console.log(`Academic claim-anchor pilot applied: ${appliedCount} anchor(s)`)
  } finally {
    await prisma.$disconnect()
  }
}

const isEntrypoint = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false

if (isEntrypoint) {
  main().catch(error => {
    console.error(error instanceof Error ? error.message : 'Academic claim-anchor pilot failed')
    process.exitCode = 1
  })
}
