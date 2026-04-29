import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

type ClassificationPatch = {
  orgNr: string
  ownershipType?: string
  valueChainStage?: string
  rationale: string
}

const patches: ClassificationPatch[] = [
  {
    orgNr: '915334504',
    ownershipType: 'private',
    valueChainStage: 'inputs',
    rationale: 'BIO3 is tracked as a private mycoprotein/feed-input actor for salmon feed via the actor map and alt-protein research notes.',
  },
  {
    orgNr: '937270062',
    ownershipType: 'private',
    valueChainStage: 'circular',
    rationale: 'Norsk Gjenvinning is tracked as a private waste-management/circular-economy operator in the actor map.',
  },
  {
    orgNr: '926655779',
    ownershipType: 'private',
    valueChainStage: 'circular',
    rationale: 'Northern Lights JV is tracked as CCS infrastructure connected to Yara/food-system decarbonization; classified as circular infrastructure.',
  },
  {
    orgNr: '923456570',
    ownershipType: 'private',
    valueChainStage: 'circular',
    rationale: 'Bokashi Norge is tracked as a private decentralized food-waste fermentation and composting actor.',
  },
  {
    orgNr: '912716635',
    ownershipType: 'state',
    valueChainStage: 'circular',
    rationale: 'Greve Biogass is tracked as a municipally owned biogas operator handling food waste, manure and sludge.',
  },
  {
    orgNr: '977199611',
    ownershipType: 'nonprofit',
    valueChainStage: 'circular',
    rationale: 'Infinitum is tracked as the non-commercial Norwegian deposit-return system for beverage packaging.',
  },
  {
    orgNr: '917809755',
    ownershipType: 'private',
    valueChainStage: 'inputs',
    rationale: 'Invertapro is tracked as a private insect-protein producer converting food waste into feed inputs.',
  },
  {
    orgNr: '977213193',
    ownershipType: 'private',
    valueChainStage: 'research',
    rationale: 'Menon Economics is tracked as a private analysis/research supplier in project source and consulting-report layers.',
  },
  {
    orgNr: '916325010',
    ownershipType: 'private',
    valueChainStage: 'inputs',
    rationale: 'Norinsect is tracked as a private insect-protein/feed actor in the actor map and insect-industry notes.',
  },
  {
    orgNr: '993924741',
    ownershipType: 'private',
    valueChainStage: 'research',
    rationale: 'Oslo Economics is tracked as a private analysis/research supplier in project source and consulting-report layers.',
  },
  {
    orgNr: '926501836',
    ownershipType: 'private',
    valueChainStage: 'inputs',
    rationale: 'Pronofa is tracked as a private insect-protein/feed actor in the actor map and alt-protein research notes.',
  },
  {
    orgNr: '894625902',
    ownershipType: 'foreign',
    valueChainStage: 'circular',
    rationale: 'St1 Biokraft is tracked as a biogas/circular-economy operator under St1 ownership.',
  },
  {
    orgNr: '935948878',
    ownershipType: 'private',
    valueChainStage: 'circular',
    rationale: 'Verminord is tracked as a private vermicomposting/biorest actor in the actor map.',
  },
  {
    orgNr: '940379016',
    ownershipType: 'cooperative',
    rationale: 'HOFF SA is a potato-processing cooperative and already classified in the processing value-chain stage.',
  },
]

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return value as Record<string, unknown>
}

async function main() {
  let touched = 0

  for (const patch of patches) {
    const company = await prisma.company.findUnique({
      where: { orgNr: patch.orgNr },
      select: {
        id: true,
        name: true,
        orgNr: true,
        ownershipType: true,
        valueChainStage: true,
        metadata: true,
      },
    })

    if (!company) {
      console.log(`missing company ${patch.orgNr}`)
      continue
    }

    const data: {
      ownershipType?: string
      valueChainStage?: string
      metadata?: Record<string, unknown>
    } = {}
    const fields: Record<string, unknown> = {}

    if (!company.ownershipType && patch.ownershipType) {
      data.ownershipType = patch.ownershipType
      fields.ownershipType = patch.ownershipType
    }

    if (!company.valueChainStage && patch.valueChainStage) {
      data.valueChainStage = patch.valueChainStage
      fields.valueChainStage = patch.valueChainStage
    }

    if (Object.keys(fields).length === 0) {
      console.log(`unchanged ${company.name}`)
      continue
    }

    const metadata = asRecord(company.metadata)
    data.metadata = {
      ...metadata,
      classificationBackfill: {
        source: 'scripts/backfill-company-classifications.ts',
        appliedAt: new Date().toISOString(),
        fields,
        rationale: patch.rationale,
      },
    }

    await prisma.company.update({
      where: { id: company.id },
      data,
    })
    touched += 1
    console.log(`updated ${company.name}: ${Object.entries(fields).map(([key, value]) => `${key}=${value}`).join(', ')}`)
  }

  console.log(`Updated ${touched} company classification row(s).`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
