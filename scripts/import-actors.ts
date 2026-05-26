import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { actorsSeed, actorRelationshipsSeed } from '../prisma/seed-data/actors'
import { DEFAULT_ACTOR_RELATIONSHIP_SOURCE } from '../src/lib/actor-relationship-graph'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function upsertActors() {
  console.log('Importing actors...\n')

  for (const actor of actorsSeed) {
    const company = actor.companyOrgNr
      ? await prisma.company.findUnique({
          where: { orgNr: actor.companyOrgNr },
          select: { id: true, name: true },
        })
      : null

    if (actor.companyOrgNr && !company) {
      console.warn(`  Missing company for ${actor.name}: ${actor.companyOrgNr}`)
    }

    await prisma.actor.upsert({
      where: { id: actor.id },
      update: {
        slug: actor.slug,
        name: actor.name,
        actorType: actor.actorType,
        country: actor.country ?? 'NO',
        organizationType: actor.organizationType ?? null,
        roleSummary: actor.roleSummary,
        currentRelevance: actor.currentRelevance ?? null,
        website: actor.website ?? null,
        currentStance: actor.currentStance ?? null,
        desiredStance: actor.desiredStance ?? null,
        specificAsk: actor.specificAsk ?? null,
        priorityTier: actor.priorityTier ?? null,
        owner: actor.owner ?? null,
        nextStep: actor.nextStep ?? null,
        powerScore: actor.powerScore ?? null,
        interestScore: actor.interestScore ?? null,
        themeTags: actor.themeTags ?? [],
        notes: actor.notes ?? null,
        companyId: company?.id ?? null,
      },
      create: {
        id: actor.id,
        slug: actor.slug,
        name: actor.name,
        actorType: actor.actorType,
        country: actor.country ?? 'NO',
        organizationType: actor.organizationType ?? null,
        roleSummary: actor.roleSummary,
        currentRelevance: actor.currentRelevance ?? null,
        website: actor.website ?? null,
        currentStance: actor.currentStance ?? null,
        desiredStance: actor.desiredStance ?? null,
        specificAsk: actor.specificAsk ?? null,
        priorityTier: actor.priorityTier ?? null,
        owner: actor.owner ?? null,
        nextStep: actor.nextStep ?? null,
        powerScore: actor.powerScore ?? null,
        interestScore: actor.interestScore ?? null,
        themeTags: actor.themeTags ?? [],
        notes: actor.notes ?? null,
        companyId: company?.id ?? null,
      },
    })

    await prisma.actorContact.deleteMany({ where: { actorId: actor.id } })
    if (actor.contacts?.length) {
      await prisma.actorContact.createMany({
        data: actor.contacts.map(contact => ({
          actorId: actor.id,
          name: contact.name,
          role: contact.role ?? null,
          email: contact.email ?? null,
          organization: contact.organization ?? null,
          note: contact.note ?? null,
        })),
      })
    }

    await prisma.actorDocumentRef.deleteMany({ where: { actorId: actor.id } })
    if (actor.documentSlugs?.length) {
      const documents = await prisma.document.findMany({
        where: { slug: { in: actor.documentSlugs } },
        select: { id: true, slug: true },
      })
      const docMap = new Map(documents.map(doc => [doc.slug, doc.id]))

      for (const slug of actor.documentSlugs) {
        const documentId = docMap.get(slug)
        if (!documentId) {
          console.warn(`  Missing document for ${actor.name}: ${slug}`)
          continue
        }
        await prisma.actorDocumentRef.create({
          data: {
            actorId: actor.id,
            documentId,
            context: 'seeded actor map evidence',
          },
        })
      }
    }

    console.log(`  ${actor.name}`)
  }
}

async function upsertRelationships() {
  console.log('\nImporting actor relationships...\n')

  const actorIds = actorsSeed.map(actor => actor.id)
  await prisma.actorRelationship.deleteMany({
    where: {
      OR: [
        { fromActorId: { in: actorIds } },
        { toActorId: { in: actorIds } },
      ],
    },
  })

  for (const relation of actorRelationshipsSeed) {
    await prisma.actorRelationship.create({
      data: {
        fromActorId: relation.fromActorId,
        toActorId: relation.toActorId,
        relationType: relation.relationType,
        strength: relation.strength ?? null,
        note: relation.note ?? null,
        source: relation.source ?? DEFAULT_ACTOR_RELATIONSHIP_SOURCE,
        sourceUrl: relation.sourceUrl ?? null,
        metadata: relation.metadata ?? { sourceType: 'curated_actor_relationship_seed' },
        verifiedAt: relation.verifiedAt ? new Date(relation.verifiedAt) : null,
      },
    })
  }

  console.log(`  ${actorRelationshipsSeed.length} relationships imported`)
}

async function main() {
  await upsertActors()
  await upsertRelationships()
  console.log(`\nDone: ${actorsSeed.length} actors imported`)
}

main()
  .catch((error) => {
    console.error('Import failed:', error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
