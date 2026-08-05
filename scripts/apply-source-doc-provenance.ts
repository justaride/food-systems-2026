import 'dotenv/config'
import { pathToFileURL } from 'node:url'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { sources } from '../prisma/seed-data/sources'
import type { SourceDocProvenanceType } from '../src/lib/types'

const APPLY_ACK = 'APPLY_REVIEWED_SOURCE_DOC_PROVENANCE'

const PINNED_PROVENANCE_IDS: Readonly<Record<Exclude<SourceDocProvenanceType, 'unknown'>, readonly string[]>> = {
  official_primary: ['src-25', 'src-27', 'src-31', 'src-33', 'src-36', 'src-39', 'src-42', 'src-43', 'src-44', 'src-47', 'src-49', 'src-78', 'src-141'],
  peer_reviewed: ['src-38'],
  corporate_self_report: ['src-30'],
  commissioned_report: ['src-28', 'src-29', 'src-32', 'src-37', 'src-45'],
  external_publication: ['src-19', 'src-22', 'src-88', 'src-89'],
  advocacy_position: ['src-35', 'src-40', 'src-48'],
  internal_primary: ['src-1', 'src-2', 'src-4', 'src-5', 'src-9', 'src-10', 'src-100', 'src-103', 'src-177', 'src-178', 'src-179', 'src-180'],
  internal_synthesis: ['src-8', 'src-101', 'src-109'],
  duplicate: ['src-6', 'src-11'],
}

export type SourceDocProvenanceRepair = {
  id: string
  provenanceType: Exclude<SourceDocProvenanceType, 'unknown'>
  filename: string
  title: string | null
  sourceType: string
  isDuplicate: boolean
  acceptedPriorProvenanceTypes: string[]
}

const REVIEWED_PRIOR_PROVENANCE_BY_ID: Readonly<Record<string, readonly string[]>> = {
  // The first local batch overclassified this commissioned NFD report as an
  // official primary source. Allow that exact reviewed correction only.
  'src-28': ['official_primary'],
}

export function buildSourceDocProvenanceRepairs(): SourceDocProvenanceRepair[] {
  const seedById = new Map(sources.map(source => [source.id, source]))
  const repairs = Object.entries(PINNED_PROVENANCE_IDS)
    .flatMap(([provenanceType, ids]) => ids.map(id => {
      const seedRow = seedById.get(id)
      if (!seedRow) throw new Error(`Pinned SourceDoc provenance row is missing from seed: ${id}`)
      return {
        id,
        provenanceType: provenanceType as SourceDocProvenanceRepair['provenanceType'],
        filename: seedRow.filename,
        title: seedRow.title ?? null,
        sourceType: seedRow.type,
        isDuplicate: seedRow.isDuplicate ?? false,
        acceptedPriorProvenanceTypes: [...(REVIEWED_PRIOR_PROVENANCE_BY_ID[id] ?? [])],
      }
    }))
    .sort((left, right) => left.id.localeCompare(right.id, undefined, { numeric: true }))

  if (repairs.length !== 44 || new Set(repairs.map(repair => repair.id)).size !== repairs.length) {
    throw new Error('Pinned SourceDoc provenance repair contract must contain 44 unique rows')
  }
  for (const repair of repairs) {
    const seedRow = seedById.get(repair.id)
    if (!seedRow || seedRow.provenanceType !== repair.provenanceType) {
      throw new Error(`Seed provenance drifted from pinned repair contract: ${repair.id}`)
    }
  }
  return repairs
}

export function classifySourceDocProvenanceRepair(
  repair: SourceDocProvenanceRepair,
  current: string | null | undefined,
): 'pending' | 'applied' | 'conflict' {
  if (current === repair.provenanceType) return 'applied'
  if (
    current == null ||
    current === 'unknown' ||
    repair.acceptedPriorProvenanceTypes.includes(current)
  ) return 'pending'
  return 'conflict'
}

export function sourceDocProvenanceSnapshotMatches(
  repair: SourceDocProvenanceRepair,
  current: {
    filename: string
    title: string | null
    sourceType: string
    isDuplicate: boolean
  },
): boolean {
  return current.filename === repair.filename &&
    current.title === repair.title &&
    current.sourceType === repair.sourceType &&
    current.isDuplicate === repair.isDuplicate
}

async function main() {
  const apply = process.argv.includes('--apply')
  const ack = process.argv.find(argument => argument.startsWith('--ack='))?.slice('--ack='.length)
  if (apply && ack !== APPLY_ACK) {
    throw new Error(`--apply requires --ack=${APPLY_ACK}`)
  }
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required')

  const repairs = buildSourceDocProvenanceRepairs()
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) })
  try {
    const databaseRows = await prisma.sourceDoc.findMany({
      where: { id: { in: repairs.map(repair => repair.id) } },
      select: {
        id: true,
        provenanceType: true,
        filename: true,
        title: true,
        sourceType: true,
        isDuplicate: true,
      },
    })
    const currentById = new Map(databaseRows.map(row => [row.id, row.provenanceType]))
    const classified = repairs.map(repair => ({
      repair,
      status: currentById.has(repair.id)
        ? classifySourceDocProvenanceRepair(repair, currentById.get(repair.id))
        : 'conflict' as const,
    }))
    const conflicts = classified.filter(row => row.status === 'conflict')
    const snapshotConflicts = repairs.filter(repair => {
      const current = databaseRows.find(row => row.id === repair.id)
      return current ? !sourceDocProvenanceSnapshotMatches(repair, current) : true
    })
    if (conflicts.length > 0 || snapshotConflicts.length > 0) {
      const ids = [...new Set([
        ...conflicts.map(row => row.repair.id),
        ...snapshotConflicts.map(row => row.id),
      ])]
      throw new Error(`SourceDoc provenance identity/provenance conflict; refusing mutation: ${ids.join(', ')}`)
    }
    const pending = classified.filter(row => row.status === 'pending').map(row => row.repair)
    console.log(`SourceDoc provenance repair: ${pending.length} pending, ${repairs.length - pending.length} already applied, ${conflicts.length} conflicts`)
    if (!apply) {
      console.log(`Dry run only. Re-run with --apply --ack=${APPLY_ACK}`)
      return
    }

    await prisma.$transaction(async transaction => {
      for (const repair of pending) {
        const result = await transaction.sourceDoc.updateMany({
          where: {
            id: repair.id,
            filename: repair.filename,
            title: repair.title,
            sourceType: repair.sourceType,
            isDuplicate: repair.isDuplicate,
            provenanceType: {
              in: ['unknown', repair.provenanceType, ...repair.acceptedPriorProvenanceTypes],
            },
          },
          data: { provenanceType: repair.provenanceType },
        })
        if (result.count !== 1) throw new Error(`Concurrent provenance change detected: ${repair.id}`)
      }
    }, { isolationLevel: 'Serializable' })

    console.log(`SourceDoc provenance repair applied: ${pending.length} row(s)`)
  } finally {
    await prisma.$disconnect()
  }
}

const isEntrypoint = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false

if (isEntrypoint) {
  main().catch(error => {
    console.error(error instanceof Error ? error.message : 'SourceDoc provenance repair failed')
    process.exitCode = 1
  })
}
