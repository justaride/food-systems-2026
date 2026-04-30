import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const OLD_ORGNRS = [
  '911856655',
  '879469062',
  '935174627',
  '874560552',
  '956866266',
  '975320637',
  '919998919',
  '980358088',
  '929094636',
]

const args = process.argv.slice(2)
const apply = args.includes('--apply')
const requestedOrgNrs = args
  .filter(arg => arg.startsWith('--orgnr='))
  .flatMap(arg => arg.replace('--orgnr=', '').split(','))
  .map(orgNr => orgNr.trim())
  .filter(Boolean)
const targetOrgNrs = requestedOrgNrs.length > 0 ? requestedOrgNrs : OLD_ORGNRS

type DeletePlan = {
  companyDocumentRefs: number
  subsidies: number
  boardMembers: number
  shareholders: number
  financials: number
  ownedProperties: number
  ownershipRelations: number
  businessRelationships: number
  tenantPropertyRefs: number
  actor: {
    id: string
    documentRefs: number
    contacts: number
    relationships: number
  } | null
}

async function getDeletePlan(companyId: string): Promise<DeletePlan> {
  const actor = await prisma.actor.findUnique({
    where: { companyId },
    select: { id: true },
  })

  return {
    companyDocumentRefs: await prisma.companyDocumentRef.count({ where: { companyId } }),
    subsidies: await prisma.subsidy.count({ where: { companyId } }),
    boardMembers: await prisma.boardMember.count({ where: { companyId } }),
    shareholders: await prisma.shareholder.count({ where: { companyId } }),
    financials: await prisma.companyFinancial.count({ where: { companyId } }),
    ownedProperties: await prisma.companyProperty.count({ where: { companyId } }),
    ownershipRelations: await prisma.companyOwnership.count({
      where: { OR: [{ parentCompanyId: companyId }, { childCompanyId: companyId }] },
    }),
    businessRelationships: await prisma.businessRelationship.count({
      where: { OR: [{ fromCompanyId: companyId }, { toCompanyId: companyId }] },
    }),
    tenantPropertyRefs: await prisma.companyProperty.count({ where: { tenantCompanyId: companyId } }),
    actor: actor
      ? {
          id: actor.id,
          documentRefs: await prisma.actorDocumentRef.count({ where: { actorId: actor.id } }),
          contacts: await prisma.actorContact.count({ where: { actorId: actor.id } }),
          relationships: await prisma.actorRelationship.count({
            where: { OR: [{ fromActorId: actor.id }, { toActorId: actor.id }] },
          }),
        }
      : null,
  }
}

function printDeletePlan(plan: DeletePlan) {
  console.log(`    companyDocumentRefs: ${plan.companyDocumentRefs}`)
  console.log(`    subsidies: ${plan.subsidies}`)
  console.log(`    boardMembers: ${plan.boardMembers}`)
  console.log(`    shareholders: ${plan.shareholders}`)
  console.log(`    financials: ${plan.financials}`)
  console.log(`    ownedProperties: ${plan.ownedProperties}`)
  console.log(`    ownershipRelations: ${plan.ownershipRelations}`)
  console.log(`    businessRelationships: ${plan.businessRelationships}`)
  console.log(`    tenantPropertyRefs to null: ${plan.tenantPropertyRefs}`)
  if (plan.actor) {
    console.log(`    actor: ${plan.actor.id}`)
    console.log(`    actorDocumentRefs: ${plan.actor.documentRefs}`)
    console.log(`    actorContacts: ${plan.actor.contacts}`)
    console.log(`    actorRelationships: ${plan.actor.relationships}`)
  }
}

async function main() {
  console.log(`${apply ? 'APPLY' : 'DRY-RUN'} cleanup for old company records with wrong orgNrs`)
  console.log(`Targets: ${targetOrgNrs.join(', ')}`)
  if (!apply) {
    console.log('No writes will be performed. Re-run with --apply to delete.\n')
  } else {
    console.log('Writes enabled by --apply.\n')
  }

  for (const orgNr of targetOrgNrs) {
    const company = await prisma.company.findUnique({
      where: { orgNr },
      select: { id: true, name: true },
    })

    if (!company) {
      console.log(`  ${orgNr} — not found, skipping`)
      continue
    }

    console.log(`  ${orgNr} — ${company.name} (${company.id})`)
    const plan = await getDeletePlan(company.id)
    printDeletePlan(plan)

    if (!apply) {
      console.log('    dry-run only')
      continue
    }

    await prisma.companyDocumentRef.deleteMany({ where: { companyId: company.id } })
    await prisma.subsidy.deleteMany({ where: { companyId: company.id } })
    await prisma.boardMember.deleteMany({ where: { companyId: company.id } })
    await prisma.shareholder.deleteMany({ where: { companyId: company.id } })
    await prisma.companyFinancial.deleteMany({ where: { companyId: company.id } })
    await prisma.companyProperty.deleteMany({ where: { companyId: company.id } })
    await prisma.companyOwnership.deleteMany({
      where: { OR: [{ parentCompanyId: company.id }, { childCompanyId: company.id }] },
    })
    await prisma.businessRelationship.deleteMany({
      where: { OR: [{ fromCompanyId: company.id }, { toCompanyId: company.id }] },
    })
    await prisma.companyProperty.updateMany({
      where: { tenantCompanyId: company.id },
      data: { tenantCompanyId: null },
    })
    if (plan.actor) {
      await prisma.actorDocumentRef.deleteMany({ where: { actorId: plan.actor.id } })
      await prisma.actorContact.deleteMany({ where: { actorId: plan.actor.id } })
      await prisma.actorRelationship.deleteMany({
        where: { OR: [{ fromActorId: plan.actor.id }, { toActorId: plan.actor.id }] },
      })
      await prisma.actor.delete({ where: { id: plan.actor.id } })
    }
    await prisma.company.delete({ where: { id: company.id } })
    console.log(`    ✓ deleted`)
  }

  const remaining = await prisma.company.count()
  const properties = await prisma.companyProperty.count()
  const ownership = await prisma.companyOwnership.count()
  const relationships = await prisma.businessRelationship.count()
  const boardMembers = await prisma.boardMember.count()

  console.log(`\nRemaining counts:`)
  console.log(`  Companies: ${remaining}`)
  console.log(`  Properties: ${properties}`)
  console.log(`  Ownership: ${ownership}`)
  console.log(`  Relationships: ${relationships}`)
  console.log(`  Board Members: ${boardMembers}`)
}

main()
  .catch((e) => {
    console.error('Cleanup failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
