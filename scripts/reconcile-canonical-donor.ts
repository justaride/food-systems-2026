import 'dotenv/config'
import { createHash } from 'node:crypto'
import { pathToFileURL } from 'node:url'
import { Prisma, PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const APPLY_ACK = 'APPLY_ADDITIVE_CANONICAL_DONOR_RECONCILIATION'

type Client = PrismaClient | Prisma.TransactionClient

type ReconciliationPlan = Awaited<ReturnType<typeof buildPlan>>

function parseArgs(argv: string[]) {
  const allowedFlags = new Set(['--apply', '--dry-run'])
  for (const argument of argv) {
    if (
      !allowedFlags.has(argument) &&
      !argument.startsWith('--ack=') &&
      !argument.startsWith('--plan-sha256=')
    ) {
      throw new Error(`Unknown argument: ${argument}`)
    }
  }
  if (argv.includes('--apply') && argv.includes('--dry-run')) {
    throw new Error('--apply and --dry-run are mutually exclusive')
  }
  return {
    apply: argv.includes('--apply'),
    ack: argv.find(argument => argument.startsWith('--ack='))?.slice('--ack='.length),
    expectedPlanSha256: argv
      .find(argument => argument.startsWith('--plan-sha256='))
      ?.slice('--plan-sha256='.length),
  }
}

function canonicalize(value: unknown): unknown {
  if (value instanceof Date) return value.toISOString()
  if (Array.isArray(value)) return value.map(canonicalize)
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, canonicalize(child)]),
    )
  }
  return value
}

function planSha256(plan: ReconciliationPlan) {
  return createHash('sha256')
    .update(JSON.stringify(canonicalize(plan)))
    .digest('hex')
}

function actorIdentity(country: string, name: string) {
  return `${country}\u0000${name}`
}

function boardIdentity(companyId: string, personKey: string, role: string) {
  return `${companyId}\u0000${personKey}\u0000${role}`
}

function relationIdentity(fromId: string, toId: string, relationType: string) {
  return `${fromId}\u0000${toId}\u0000${relationType}`
}

function optionalJson(value: Prisma.JsonValue | null) {
  return value === null ? undefined : value
}

function remapProfileRoles(
  roles: Prisma.JsonValue[],
  companyIdMap: Map<string, string>,
): Prisma.InputJsonValue[] {
  return roles.map((role) => {
    if (!role || typeof role !== 'object' || Array.isArray(role)) {
      return role as Prisma.InputJsonValue
    }
    const record = { ...role } as Record<string, Prisma.JsonValue>
    if (typeof record.companyId === 'string') {
      const mapped = companyIdMap.get(record.companyId)
      if (!mapped) throw new Error(`PersonProfile role references unknown donor Company ${record.companyId}`)
      record.companyId = mapped
    }
    return record as Prisma.InputJsonValue
  })
}

async function buildPlan(target: Client, donor: PrismaClient) {
  const [
    donorCompanies,
    targetCompanies,
    donorDocuments,
    targetDocuments,
    donorBoards,
    targetBoards,
    donorProfiles,
    targetProfiles,
    donorOwnerships,
    targetOwnerships,
    donorCompanyDocumentRefs,
    targetCompanyDocumentRefs,
    donorActors,
    targetActors,
    donorActorDocumentRefs,
    targetActorDocumentRefs,
    donorActorRelationships,
    targetActorRelationships,
  ] = await Promise.all([
    donor.company.findMany({ orderBy: { orgNr: 'asc' } }),
    target.company.findMany({ orderBy: { orgNr: 'asc' } }),
    donor.document.findMany({
      select: {
        id: true,
        slug: true,
        filePath: true,
        title: true,
        author: true,
        year: true,
        documentType: true,
        category: true,
        subcategory: true,
        country: true,
        content: true,
        summary: true,
        url: true,
        accessedAt: true,
        archivedUrl: true,
        wordCount: true,
        tags: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { slug: 'asc' },
    }),
    target.document.findMany({
      select: { id: true, slug: true, filePath: true },
      orderBy: { slug: 'asc' },
    }),
    donor.boardMember.findMany({ orderBy: { id: 'asc' } }),
    target.boardMember.findMany({ orderBy: { id: 'asc' } }),
    donor.personProfile.findMany({ orderBy: { personKey: 'asc' } }),
    target.personProfile.findMany({ select: { id: true, personKey: true }, orderBy: { personKey: 'asc' } }),
    donor.companyOwnership.findMany({ orderBy: { id: 'asc' } }),
    target.companyOwnership.findMany({ orderBy: { id: 'asc' } }),
    donor.companyDocumentRef.findMany({ orderBy: { id: 'asc' } }),
    target.companyDocumentRef.findMany({ orderBy: { id: 'asc' } }),
    donor.actor.findMany({ orderBy: { id: 'asc' } }),
    target.actor.findMany({ orderBy: { id: 'asc' } }),
    donor.actorDocumentRef.findMany({ orderBy: { id: 'asc' } }),
    target.actorDocumentRef.findMany({ orderBy: { id: 'asc' } }),
    donor.actorRelationship.findMany({ orderBy: { id: 'asc' } }),
    target.actorRelationship.findMany({ orderBy: { id: 'asc' } }),
  ])

  const conflicts: string[] = []
  const targetIds = {
    companies: new Set(targetCompanies.map(row => row.id)),
    documents: new Set(targetDocuments.map(row => row.id)),
    boards: new Set(targetBoards.map(row => row.id)),
    profiles: new Set(targetProfiles.map(row => row.id)),
    ownerships: new Set(targetOwnerships.map(row => row.id)),
    companyDocumentRefs: new Set(targetCompanyDocumentRefs.map(row => row.id)),
    actors: new Set(targetActors.map(row => row.id)),
    actorDocumentRefs: new Set(targetActorDocumentRefs.map(row => row.id)),
    actorRelationships: new Set(targetActorRelationships.map(row => row.id)),
  }

  const targetCompanyByOrgNr = new Map(targetCompanies.map(row => [row.orgNr, row]))
  const companyIdMap = new Map<string, string>()
  const companies = donorCompanies.flatMap((row) => {
    const existing = targetCompanyByOrgNr.get(row.orgNr)
    if (existing) {
      companyIdMap.set(row.id, existing.id)
      return []
    }
    if (targetIds.companies.has(row.id)) {
      conflicts.push(`Company id collision: ${row.id} (${row.orgNr})`)
      return []
    }
    companyIdMap.set(row.id, row.id)
    return [{
      ...row,
      metadata: optionalJson(row.metadata),
    }]
  })

  const targetDocumentBySlug = new Map(targetDocuments.map(row => [row.slug, row]))
  const targetDocumentByFilePath = new Map(
    targetDocuments.filter(row => row.filePath).map(row => [row.filePath!, row]),
  )
  const documentIdMap = new Map<string, string>()
  const documents = donorDocuments.flatMap((row) => {
    const existing = targetDocumentBySlug.get(row.slug) ??
      (row.filePath ? targetDocumentByFilePath.get(row.filePath) : undefined)
    if (existing) {
      documentIdMap.set(row.id, existing.id)
      return []
    }
    if (targetIds.documents.has(row.id)) {
      conflicts.push(`Document id collision: ${row.id} (${row.slug})`)
      return []
    }
    documentIdMap.set(row.id, row.id)
    return [{
      ...row,
      metadata: optionalJson(row.metadata),
    }]
  })

  const targetBoardKeys = new Set(targetBoards.map(row =>
    boardIdentity(row.companyId, row.personKey, row.role),
  ))
  const boards = donorBoards.flatMap((row) => {
    const companyId = companyIdMap.get(row.companyId)
    if (!companyId) {
      conflicts.push(`BoardMember ${row.id} references unknown donor Company ${row.companyId}`)
      return []
    }
    if (targetBoardKeys.has(boardIdentity(companyId, row.personKey, row.role))) return []
    return [{
      ...row,
      id: targetIds.boards.has(row.id) ? undefined : row.id,
      companyId,
    }]
  })

  const targetProfileKeys = new Set(targetProfiles.map(row => row.personKey))
  const profiles = donorProfiles.flatMap((row) => {
    if (targetProfileKeys.has(row.personKey)) return []
    return [{
      ...row,
      id: targetIds.profiles.has(row.id) ? undefined : row.id,
      roles: remapProfileRoles(row.roles, companyIdMap),
      metadata: optionalJson(row.metadata),
    }]
  })

  const targetOwnershipKeys = new Set(targetOwnerships.map(row =>
    `${row.parentCompanyId}\u0000${row.childCompanyId}`,
  ))
  const ownerships = donorOwnerships.flatMap((row) => {
    const parentCompanyId = companyIdMap.get(row.parentCompanyId)
    const childCompanyId = companyIdMap.get(row.childCompanyId)
    if (!parentCompanyId || !childCompanyId) {
      conflicts.push(`CompanyOwnership ${row.id} has an unmapped Company endpoint`)
      return []
    }
    if (targetOwnershipKeys.has(`${parentCompanyId}\u0000${childCompanyId}`)) return []
    return [{
      ...row,
      id: targetIds.ownerships.has(row.id) ? undefined : row.id,
      parentCompanyId,
      childCompanyId,
      metadata: optionalJson(row.metadata),
    }]
  })

  const targetCompanyDocumentKeys = new Set(targetCompanyDocumentRefs.map(row =>
    `${row.companyId}\u0000${row.documentId}`,
  ))
  const companyDocumentRefs = donorCompanyDocumentRefs.flatMap((row) => {
    const companyId = companyIdMap.get(row.companyId)
    const documentId = documentIdMap.get(row.documentId)
    if (!companyId || !documentId) {
      conflicts.push(`CompanyDocumentRef ${row.id} has an unmapped endpoint`)
      return []
    }
    if (targetCompanyDocumentKeys.has(`${companyId}\u0000${documentId}`)) return []
    return [{
      ...row,
      id: targetIds.companyDocumentRefs.has(row.id) ? undefined : row.id,
      companyId,
      documentId,
    }]
  })

  const targetActorByIdentity = new Map(targetActors.map(row => [actorIdentity(row.country, row.name), row]))
  const targetActorBySlug = new Map(targetActors.map(row => [row.slug, row]))
  const targetActorByCompanyId = new Map(
    targetActors.filter(row => row.companyId).map(row => [row.companyId!, row]),
  )
  const actorIdMap = new Map<string, string>()
  const actors = donorActors.flatMap((row) => {
    const companyId = row.companyId ? companyIdMap.get(row.companyId) : undefined
    if (row.companyId && !companyId) {
      conflicts.push(`Actor ${row.id} references unknown donor Company ${row.companyId}`)
      return []
    }
    const existing = targetActorByIdentity.get(actorIdentity(row.country, row.name)) ??
      targetActorBySlug.get(row.slug) ??
      (companyId ? targetActorByCompanyId.get(companyId) : undefined)
    if (existing) {
      actorIdMap.set(row.id, existing.id)
      return []
    }
    if (targetIds.actors.has(row.id)) {
      conflicts.push(`Actor id collision: ${row.id} (${row.slug})`)
      return []
    }
    actorIdMap.set(row.id, row.id)
    return [{
      ...row,
      companyId: companyId ?? null,
      metadata: optionalJson(row.metadata),
    }]
  })

  const targetActorDocumentKeys = new Set(targetActorDocumentRefs.map(row =>
    `${row.actorId}\u0000${row.documentId}`,
  ))
  const actorDocumentRefs = donorActorDocumentRefs.flatMap((row) => {
    const actorId = actorIdMap.get(row.actorId)
    const documentId = documentIdMap.get(row.documentId)
    if (!actorId || !documentId) {
      conflicts.push(`ActorDocumentRef ${row.id} has an unmapped endpoint`)
      return []
    }
    if (targetActorDocumentKeys.has(`${actorId}\u0000${documentId}`)) return []
    return [{
      ...row,
      id: targetIds.actorDocumentRefs.has(row.id) ? undefined : row.id,
      actorId,
      documentId,
    }]
  })

  const targetActorRelationshipKeys = new Set(targetActorRelationships.map(row =>
    relationIdentity(row.fromActorId, row.toActorId, row.relationType),
  ))
  const actorRelationships = donorActorRelationships.flatMap((row) => {
    const fromActorId = actorIdMap.get(row.fromActorId)
    const toActorId = actorIdMap.get(row.toActorId)
    if (!fromActorId || !toActorId) {
      conflicts.push(`ActorRelationship ${row.id} has an unmapped endpoint`)
      return []
    }
    if (targetActorRelationshipKeys.has(relationIdentity(fromActorId, toActorId, row.relationType))) return []
    return [{
      ...row,
      id: targetIds.actorRelationships.has(row.id) ? undefined : row.id,
      fromActorId,
      toActorId,
      metadata: optionalJson(row.metadata),
    }]
  })

  return {
    version: 1,
    mode: 'additive-only' as const,
    conflicts: conflicts.sort(),
    companies,
    documents,
    boards,
    profiles,
    ownerships,
    companyDocumentRefs,
    actors,
    actorDocumentRefs,
    actorRelationships,
  }
}

function summarize(plan: ReconciliationPlan) {
  return {
    conflicts: plan.conflicts.length,
    companies: plan.companies.length,
    documents: plan.documents.length,
    boards: plan.boards.length,
    profiles: plan.profiles.length,
    ownerships: plan.ownerships.length,
    companyDocumentRefs: plan.companyDocumentRefs.length,
    actors: plan.actors.length,
    actorDocumentRefs: plan.actorDocumentRefs.length,
    actorRelationships: plan.actorRelationships.length,
  }
}

async function applyPlan(transaction: Prisma.TransactionClient, plan: ReconciliationPlan) {
  for (const row of plan.companies) await transaction.company.create({ data: row })
  for (const row of plan.documents) await transaction.document.create({ data: row })
  for (const row of plan.boards) await transaction.boardMember.create({ data: row })
  for (const row of plan.profiles) await transaction.personProfile.create({ data: row })
  for (const row of plan.ownerships) await transaction.companyOwnership.create({ data: row })
  for (const row of plan.companyDocumentRefs) await transaction.companyDocumentRef.create({ data: row })
  for (const row of plan.actors) await transaction.actor.create({ data: row })
  for (const row of plan.actorDocumentRefs) await transaction.actorDocumentRef.create({ data: row })
  for (const row of plan.actorRelationships) await transaction.actorRelationship.create({ data: row })
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required')
  if (!process.env.CANONICAL_DONOR_DATABASE_URL) {
    throw new Error('CANONICAL_DONOR_DATABASE_URL is required')
  }
  if (args.apply && args.ack !== APPLY_ACK) {
    throw new Error(`--apply requires --ack=${APPLY_ACK}`)
  }
  if (args.apply && !/^[a-f0-9]{64}$/.test(args.expectedPlanSha256 ?? '')) {
    throw new Error('--apply requires --plan-sha256=<64 lowercase hex> from the reviewed dry run')
  }

  const target = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })
  const donor = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.CANONICAL_DONOR_DATABASE_URL }),
  })
  try {
    const plan = await buildPlan(target, donor)
    const digest = planSha256(plan)
    console.log('Additive canonical donor reconciliation')
    console.log(`Plan SHA-256: ${digest}`)
    console.log(JSON.stringify(summarize(plan), null, 2))
    for (const conflict of plan.conflicts) console.log(`CONFLICT ${conflict}`)
    if (plan.conflicts.length > 0) throw new Error('Reconciliation conflicts detected; refusing mutation')
    if (!args.apply) {
      console.log(
        `Dry run only. Apply after review with --apply --ack=${APPLY_ACK} --plan-sha256=${digest}`,
      )
      return
    }
    if (digest !== args.expectedPlanSha256) {
      throw new Error('Current plan differs from --plan-sha256; rerun and review')
    }

    await target.$transaction(async (transaction) => {
      await transaction.$executeRawUnsafe(
        'LOCK TABLE "Company", "Document", "BoardMember", "PersonProfile", ' +
        '"CompanyOwnership", "CompanyDocumentRef", "Actor", "ActorDocumentRef", ' +
        '"ActorRelationship" IN SHARE ROW EXCLUSIVE MODE',
      )
      const lockedPlan = await buildPlan(transaction, donor)
      if (lockedPlan.conflicts.length > 0 || planSha256(lockedPlan) !== args.expectedPlanSha256) {
        throw new Error('Target changed after plan review; no rows were created')
      }
      await applyPlan(transaction, lockedPlan)
      const afterPlan = await buildPlan(transaction, donor)
      const remaining = summarize(afterPlan)
      if (afterPlan.conflicts.length > 0 || Object.entries(remaining).some(([key, value]) => key !== 'conflicts' && value !== 0)) {
        throw new Error(`Post-apply reconciliation is incomplete: ${JSON.stringify(remaining)}`)
      }
    }, { isolationLevel: 'Serializable', timeout: 120_000 })

    console.log('Additive canonical donor reconciliation applied and verified')
  } finally {
    await Promise.all([target.$disconnect(), donor.$disconnect()])
  }
}

const isEntrypoint = process.argv[1]
  ? import.meta.url === pathToFileURL(process.argv[1]).href
  : false

if (isEntrypoint) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error))
    process.exitCode = 1
  })
}
