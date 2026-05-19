import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

type ShareholderCorrection = {
  companyOrgNr: string
  fromName: string
  fromOwnershipPct: number
  toName: string
  toOwnershipPct: number
  toShareholderType: string
  toIsControlling: boolean
}

const corrections: ShareholderCorrection[] = [
  {
    companyOrgNr: 'DK-38714295',
    fromName: 'KFI Erhvervsdrivende Fond',
    fromOwnershipPct: 42,
    toName: 'KFI Erhvervsdrivende Fond',
    toOwnershipPct: 42.5,
    toShareholderType: 'foundation',
    toIsControlling: false,
  },
  {
    companyOrgNr: 'DK-38714295',
    fromName: 'Selvstændige købmænd',
    fromOwnershipPct: 9.1,
    toName: 'Selvstændige købmænd',
    toOwnershipPct: 8.6,
    toShareholderType: 'private',
    toIsControlling: false,
  },
  {
    companyOrgNr: '945958405',
    fromName: '1 200 frukt- og grøntprodusenter',
    fromOwnershipPct: 100,
    toName: 'Over 1000 norske grøntprodusenter',
    toOwnershipPct: 100,
    toShareholderType: 'cooperative',
    toIsControlling: true,
  },
  {
    companyOrgNr: '910629085',
    fromName: 'Lantmännen Cerealia AB (Sverige)',
    fromOwnershipPct: 100,
    toName: 'Lantmännen ek för',
    toOwnershipPct: 100,
    toShareholderType: 'cooperative',
    toIsControlling: true,
  },
  {
    companyOrgNr: '917203261',
    fromName: 'Too Good To Go ApS (Danmark)',
    fromOwnershipPct: 100,
    toName: 'Too Good To Go Holding ApS (Danmark)',
    toOwnershipPct: 100,
    toShareholderType: 'foreign',
    toIsControlling: true,
  },
  {
    companyOrgNr: '932256134',
    fromName: 'Oda Midco AS / Softbank, Kinnevik m.fl.',
    fromOwnershipPct: 100,
    toName: 'AGP Advokater AS',
    toOwnershipPct: 100,
    toShareholderType: 'institutional',
    toIsControlling: true,
  },
  {
    companyOrgNr: 'IS-540206-2010',
    fromName: 'Eignarhaldsfélagið Fasteign hf',
    fromOwnershipPct: 34,
    toName: 'Lífeyrissjóður starfsmanna ríkisins',
    toOwnershipPct: 12.9,
    toShareholderType: 'institutional',
    toIsControlling: false,
  },
  {
    companyOrgNr: 'IS-540206-2010',
    fromName: 'Lífeyrissjóður starfsmanna ríkisins',
    fromOwnershipPct: 8,
    toName: 'Lífeyrissjóður verzlunarmanna',
    toOwnershipPct: 12.5,
    toShareholderType: 'institutional',
    toIsControlling: false,
  },
]

function numberFromDecimal(value: unknown): number | null {
  if (value === null || value === undefined) return null
  const parsed = Number(value.toString())
  return Number.isFinite(parsed) ? parsed : null
}

function ownershipMatches(value: unknown, expected: number): boolean {
  const parsed = numberFromDecimal(value)
  return parsed !== null && Math.abs(parsed - expected) < 0.01
}

async function main() {
  console.log('Correcting checked shareholder source data')

  let updated = 0
  let alreadyCurrent = 0
  let skipped = 0

  for (const correction of corrections) {
    const company = await prisma.company.findUnique({
      where: { orgNr: correction.companyOrgNr },
      select: {
        id: true,
        name: true,
        shareholders: {
          select: {
            id: true,
            name: true,
            ownershipPct: true,
          },
        },
      },
    })

    if (!company) {
      console.log(`  skip ${correction.companyOrgNr}: company not found`)
      skipped += 1
      continue
    }

    const current = company.shareholders.find(
      (shareholder) =>
        shareholder.name === correction.toName &&
        ownershipMatches(shareholder.ownershipPct, correction.toOwnershipPct),
    )
    if (current) {
      console.log(`  current ${company.name}: ${correction.toName}`)
      alreadyCurrent += 1
      continue
    }

    const stale = company.shareholders.find(
      (shareholder) =>
        shareholder.name === correction.fromName &&
        ownershipMatches(shareholder.ownershipPct, correction.fromOwnershipPct),
    )
    if (!stale) {
      console.log(`  skip ${company.name}: stale row not found (${correction.fromName})`)
      skipped += 1
      continue
    }

    await prisma.shareholder.update({
      where: { id: stale.id },
      data: {
        name: correction.toName,
        ownershipPct: correction.toOwnershipPct,
        shareholderType: correction.toShareholderType,
        isControlling: correction.toIsControlling,
        source: null,
        sourceUrl: null,
        verifiedAt: null,
      },
    })
    console.log(`  updated ${company.name}: ${correction.fromName} -> ${correction.toName}`)
    updated += 1
  }

  console.log(
    `Shareholder data correction complete: ${updated} updated, ` +
      `${alreadyCurrent} already current, ${skipped} skipped`,
  )
}

main()
  .catch((error) => {
    console.error('Shareholder data correction failed:', error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
