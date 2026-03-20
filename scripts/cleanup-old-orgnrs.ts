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

async function main() {
  console.log('Cleaning up old company records with wrong orgNrs...\n')

  for (const orgNr of OLD_ORGNRS) {
    const company = await prisma.company.findUnique({
      where: { orgNr },
      select: { id: true, name: true },
    })

    if (!company) {
      console.log(`  ${orgNr} — not found, skipping`)
      continue
    }

    console.log(`  ${orgNr} — ${company.name} (${company.id})`)

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
    const actor = await prisma.actor.findUnique({ where: { companyId: company.id } })
    if (actor) {
      await prisma.actorDocumentRef.deleteMany({ where: { actorId: actor.id } })
      await prisma.actorContact.deleteMany({ where: { actorId: actor.id } })
      await prisma.actorRelationship.deleteMany({
        where: { OR: [{ fromActorId: actor.id }, { toActorId: actor.id }] },
      })
      await prisma.actor.delete({ where: { id: actor.id } })
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
