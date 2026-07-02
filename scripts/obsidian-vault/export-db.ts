import 'dotenv/config'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../src/generated/prisma/client'
import { buildVaultExportSnapshot } from '../../src/lib/obsidian-vault-export'

if (!process.env.DATABASE_URL) {
  console.error(
    'DATABASE_URL is required for vault DB export. For local runs, set DATABASE_URL=postgresql://localhost:5432/foodsystems?schema=public',
  )
  process.exit(1)
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

async function main() {
  const generatedAt = new Date().toISOString()
  const [companies, ownershipEdges, boardMembers, businessRelationships, properties] = await Promise.all([
    prisma.company.findMany({
      select: {
        id: true,
        name: true,
        orgNr: true,
        legalForm: true,
        country: true,
        ownershipType: true,
        valueChainStage: true,
        naceCode: true,
        naceDescription: true,
        isResearchConstruct: true,
      },
    }),
    prisma.companyOwnership.findMany({
      select: {
        id: true,
        parentCompanyId: true,
        childCompanyId: true,
        ownershipPct: true,
        ownershipType: true,
        source: true,
      },
    }),
    prisma.boardMember.findMany({
      select: {
        id: true,
        companyId: true,
        personName: true,
        personKey: true,
        role: true,
        source: true,
        verificationStatus: true,
      },
    }),
    prisma.businessRelationship.findMany({
      select: {
        id: true,
        fromCompanyId: true,
        toCompanyId: true,
        relationshipType: true,
        description: true,
        sector: true,
        estimatedValue: true,
        source: true,
        verificationStatus: true,
      },
    }),
    prisma.companyProperty.findMany({
      select: {
        id: true,
        companyId: true,
        tenantCompanyId: true,
        propertyType: true,
        address: true,
        municipality: true,
        county: true,
        country: true,
        lat: true,
        lng: true,
        sqMeters: true,
        selfLeased: true,
        source: true,
      },
    }),
  ])

  const snapshot = buildVaultExportSnapshot({
    generatedAt,
    companies,
    ownershipEdges,
    boardMembers,
    businessRelationships,
    properties,
  })
  const outDir = join(process.cwd(), 'data', 'vault-export')
  mkdirSync(outDir, { recursive: true })

  writeJson(join(outDir, 'manifest.json'), snapshot.manifest)
  writeJson(join(outDir, 'companies.json'), snapshot.companies)
  writeJson(join(outDir, 'ownership-edges.json'), snapshot.ownershipEdges)
  writeJson(join(outDir, 'board-members.json'), snapshot.boardMembers)
  writeJson(join(outDir, 'business-relationships.json'), snapshot.businessRelationships)
  writeJson(join(outDir, 'properties.json'), snapshot.properties)
  writeJson(join(outDir, 'ownership-forest.json'), snapshot.ownershipForest)

  console.log(
    [
      'vault:export-db wrote data/vault-export',
      `companies=${snapshot.manifest.counts.companies}`,
      `ownershipEdges=${snapshot.manifest.counts.ownershipEdges}`,
      `boardMembers=${snapshot.manifest.counts.boardMembers}`,
      `businessRelationships=${snapshot.manifest.counts.businessRelationships}`,
      `properties=${snapshot.manifest.counts.properties}`,
    ].join(' '),
  )
}

function writeJson(path: string, data: unknown) {
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`)
}

main()
  .then(() => prisma.$disconnect())
  .catch((error) => {
    console.error(error)
    return prisma.$disconnect().finally(() => process.exit(1))
  })
