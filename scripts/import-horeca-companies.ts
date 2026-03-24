import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

type NewCompany = {
  name: string
  orgNr: string
  country?: string
  legalForm: string
  founded?: number
  naceCode?: string
  naceDescription?: string
  hqAddress?: string
  hqCity?: string
  employees?: number
  ownershipType: string
  valueChainStage: string
  revenue2024?: number
  shareholders?: { name: string; ownershipPct?: number; shareholderType?: string; isControlling?: boolean }[]
  boardMembers?: { personName: string; role: string }[]
}

type OwnershipRecord = {
  parentOrgNr: string
  childOrgNr: string
  ownershipPct?: number
  ownershipType: 'subsidiary' | 'joint-venture' | 'minority-stake'
  source: string
}

type RelationshipRecord = {
  fromOrgNr: string
  toOrgNr: string
  relationshipType: 'supplier' | 'buyer' | 'distributor' | 'franchisor' | 'self-dealing' | 'joint-venture'
  description?: string
  sector?: string
  source?: string
}

function normalizePersonKey(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z ]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

const newCompanies: NewCompany[] = [
  {
    name: 'Storcash Norge AS',
    orgNr: '930258008',
    legalForm: 'AS',
    founded: 1963,
    naceCode: '46.390',
    naceDescription: 'Engroshandel med bredt utvalg av naerings- og nytelsesmidler',
    hqAddress: 'Brobekkveien 80',
    hqCity: 'Oslo',
    employees: 204,
    ownershipType: 'family',
    valueChainStage: 'foodservice',
    revenue2024: 1952,
    shareholders: [
      { name: 'NorgesGruppen ASA', ownershipPct: 100, shareholderType: 'institutional', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Runar Hollevik', role: 'styreleder' },
    ],
  },
  {
    name: 'Compass Group Norge AS',
    orgNr: '952507729',
    legalForm: 'AS',
    founded: 1989,
    naceCode: '56.290',
    naceDescription: 'Kantiner drevet som selvstendig virksomhet',
    hqAddress: 'Drengsrudbekken 12',
    hqCity: 'Asker',
    employees: 2126,
    ownershipType: 'foreign',
    valueChainStage: 'foodservice',
    revenue2024: 2157,
    shareholders: [
      { name: 'Compass Group plc (UK)', ownershipPct: 100, shareholderType: 'foreign', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Hege Solbakken', role: 'CEO' },
    ],
  },
  {
    name: 'Sodexo AS',
    orgNr: '932144336',
    legalForm: 'AS',
    founded: 1984,
    naceCode: '56.290',
    naceDescription: 'Kantiner drevet som selvstendig virksomhet',
    hqAddress: 'Lilleakerveien 10',
    hqCity: 'Oslo',
    employees: 758,
    ownershipType: 'foreign',
    valueChainStage: 'foodservice',
    revenue2024: 708,
    shareholders: [
      { name: 'Sodexo SA (Frankrike)', ownershipPct: 100, shareholderType: 'foreign', isControlling: true },
    ],
  },
  {
    name: 'ISS Facility Services AS',
    orgNr: '914791723',
    legalForm: 'AS',
    founded: 1952,
    naceCode: '81.210',
    naceDescription: 'Rengjoring av bygninger',
    hqAddress: 'Smeltedigelen 1',
    hqCity: 'Oslo',
    employees: 7090,
    ownershipType: 'foreign',
    valueChainStage: 'foodservice',
    revenue2024: 5740,
    shareholders: [
      { name: 'ISS A/S (Danmark)', ownershipPct: 100, shareholderType: 'foreign', isControlling: true },
    ],
  },
  {
    name: '4Service Gruppen AS',
    orgNr: '897392232',
    legalForm: 'AS',
    naceCode: '56.290',
    naceDescription: 'Kantiner drevet som selvstendig virksomhet',
    hqCity: 'Oslo',
    ownershipType: 'foreign',
    valueChainStage: 'foodservice',
    shareholders: [
      { name: 'Compass Group plc (UK, oppkjopt 2024)', ownershipPct: 100, shareholderType: 'foreign', isControlling: true },
    ],
  },
  {
    name: 'Servicegrossistene AS',
    orgNr: '933444724',
    legalForm: 'AS',
    naceCode: '46.170',
    naceDescription: 'Agenturhandel med naerings- og nytelsesmidler',
    hqCity: 'Oslo',
    ownershipType: 'cooperative',
    valueChainStage: 'foodservice',
    revenue2024: 207,
    shareholders: [
      { name: '21 uavhengige medlemsbedrifter', ownershipPct: 100, shareholderType: 'cooperative', isControlling: true },
    ],
  },
  {
    name: 'Martin & Servera AB',
    orgNr: 'SE-556559-1135',
    country: 'SE',
    legalForm: 'AB',
    founded: 2001,
    hqCity: 'Stockholm',
    employees: 2800,
    ownershipType: 'family',
    valueChainStage: 'foodservice',
    shareholders: [
      { name: 'Axel Johnson AB', ownershipPct: 100, shareholderType: 'institutional', isControlling: true },
    ],
  },
  {
    name: 'Menigo Foodservice AB',
    orgNr: 'SE-556424-2537',
    country: 'SE',
    legalForm: 'AB',
    hqCity: 'Goteborg',
    employees: 1200,
    ownershipType: 'foreign',
    valueChainStage: 'foodservice',
    shareholders: [
      { name: 'Sysco Corporation (USA)', ownershipPct: 100, shareholderType: 'foreign', isControlling: true },
    ],
  },
  {
    name: 'Euro Cater A/S',
    orgNr: 'DK-29783535',
    country: 'DK',
    legalForm: 'A/S',
    hqCity: 'Aarhus',
    employees: 1800,
    ownershipType: 'family',
    valueChainStage: 'foodservice',
    shareholders: [
      { name: 'Stiftergruppen / grundlaeggereid', ownershipPct: 100, shareholderType: 'holding', isControlling: true },
    ],
  },
  {
    name: 'ISS A/S',
    orgNr: 'DK-28316745',
    country: 'DK',
    legalForm: 'A/S',
    founded: 1901,
    hqCity: 'Koebenhavn',
    employees: 350000,
    ownershipType: 'listed',
    valueChainStage: 'foodservice',
    shareholders: [
      { name: 'Nasdaq Koebenhavn (boersnotert)', ownershipPct: undefined, shareholderType: 'public', isControlling: false },
    ],
  },
  {
    name: 'Meira Nova Oy',
    orgNr: 'FI-0697627-4',
    country: 'FI',
    legalForm: 'Oy',
    hqCity: 'Helsinki',
    ownershipType: 'cooperative',
    valueChainStage: 'foodservice',
    shareholders: [
      { name: 'SOK / S-Group', ownershipPct: 100, shareholderType: 'cooperative', isControlling: true },
    ],
  },
  {
    name: 'Wolt Enterprises Oy',
    orgNr: 'FI-2646674-9',
    country: 'FI',
    legalForm: 'Oy',
    founded: 2014,
    hqCity: 'Helsinki',
    ownershipType: 'foreign',
    valueChainStage: 'foodservice',
    shareholders: [
      { name: 'DoorDash Inc. (USA, oppkjopt 2022)', ownershipPct: 100, shareholderType: 'foreign', isControlling: true },
    ],
  },
  {
    name: 'Leijona Catering Oy',
    orgNr: 'FI-2449777-9',
    country: 'FI',
    legalForm: 'Oy',
    hqCity: 'Helsinki',
    ownershipType: 'state',
    valueChainStage: 'foodservice',
    shareholders: [
      { name: 'Finska staten (Forsvaret)', ownershipPct: 100, shareholderType: 'state', isControlling: true },
    ],
  },
]

const ownershipRecords: OwnershipRecord[] = [
  { parentOrgNr: '819731322', childOrgNr: '930258008', ownershipPct: 100, ownershipType: 'subsidiary', source: 'Broennoysund / NorgesGruppen aarsrapport' },
  { parentOrgNr: '952507729', childOrgNr: '897392232', ownershipPct: 100, ownershipType: 'subsidiary', source: 'Compass Group plc pressemelding 2024 (4Service-oppkjop)' },
  { parentOrgNr: 'FI-0116323-9', childOrgNr: 'FI-0697627-4', ownershipPct: 100, ownershipType: 'subsidiary', source: 'S-Group aarsrapport' },
  { parentOrgNr: 'DK-28316745', childOrgNr: '914791723', ownershipPct: 100, ownershipType: 'subsidiary', source: 'ISS A/S aarsrapport' },
]

const relationshipRecords: RelationshipRecord[] = [
  {
    fromOrgNr: '929228723',
    toOrgNr: '952507729',
    relationshipType: 'supplier',
    description: 'ASKO Servering (NorgesGruppens foodservice-divisjon) leverer til Compass Group-kantiner',
    sector: 'storhusholdning',
    source: 'Bransjekunnskap / ASKO aarsrapport',
  },
  {
    fromOrgNr: '929228723',
    toOrgNr: '932144336',
    relationshipType: 'supplier',
    description: 'ASKO Servering leverer til Sodexo-kantiner',
    sector: 'storhusholdning',
    source: 'Bransjekunnskap',
  },
  {
    fromOrgNr: '933444724',
    toOrgNr: '952507729',
    relationshipType: 'supplier',
    description: 'Servicegrossistene leverer til Compass Group-kantiner (alternativ til ASKO)',
    sector: 'storhusholdning',
    source: 'Bransjekunnskap',
  },
  {
    fromOrgNr: '929228723',
    toOrgNr: '930258008',
    relationshipType: 'distributor',
    description: 'ASKO Norge distribuerer varer til Storcash cash & carry-butikker',
    sector: 'storhusholdning',
    source: 'NorgesGruppen aarsrapport',
  },
  {
    fromOrgNr: '952507729',
    toOrgNr: '914791723',
    relationshipType: 'supplier',
    description: 'Compass Group og ISS konkurrerer om nordiske kantinekontrakter',
    sector: 'kontraktcatering',
    source: 'Bransjekunnskap',
  },
]

async function resolveCompanyId(orgNr: string): Promise<string | null> {
  const company = await prisma.company.findUnique({
    where: { orgNr },
    select: { id: true },
  })
  return company?.id ?? null
}

async function importNewCompanies() {
  console.log('Importing HORECA companies...\n')
  let created = 0

  for (const c of newCompanies) {
    const company = await prisma.company.upsert({
      where: { orgNr: c.orgNr },
      update: {
        name: c.name,
        country: c.country ?? 'NO',
        legalForm: c.legalForm,
        founded: c.founded,
        naceCode: c.naceCode,
        naceDescription: c.naceDescription,
        hqCity: c.hqCity,
        hqAddress: c.hqAddress,
        employees: c.employees,
        ownershipType: c.ownershipType,
        valueChainStage: c.valueChainStage,
      },
      create: {
        name: c.name,
        orgNr: c.orgNr,
        country: c.country ?? 'NO',
        legalForm: c.legalForm,
        founded: c.founded,
        naceCode: c.naceCode,
        naceDescription: c.naceDescription,
        hqCity: c.hqCity,
        hqAddress: c.hqAddress,
        employees: c.employees,
        ownershipType: c.ownershipType,
        valueChainStage: c.valueChainStage,
      },
    })

    if (c.shareholders) {
      await prisma.shareholder.deleteMany({ where: { companyId: company.id } })
      for (const s of c.shareholders) {
        await prisma.shareholder.create({
          data: {
            companyId: company.id,
            name: s.name,
            ownershipPct: s.ownershipPct,
            shareholderType: s.shareholderType,
            isControlling: s.isControlling ?? false,
          },
        })
      }
    }

    if (c.boardMembers) {
      await prisma.boardMember.deleteMany({ where: { companyId: company.id } })
      for (const b of c.boardMembers) {
        await prisma.boardMember.create({
          data: {
            companyId: company.id,
            personName: b.personName,
            role: b.role,
            personKey: normalizePersonKey(b.personName),
          },
        })
      }
    }

    console.log(`  ${company.name} (${c.orgNr})${c.revenue2024 ? ` — ${c.revenue2024}M NOK` : ''}`)
    created++
  }

  console.log(`\n${created} HORECA companies imported`)
}

async function importOwnership() {
  console.log('\nImporting HORECA ownership records...\n')
  let imported = 0
  let skipped = 0

  for (const rec of ownershipRecords) {
    const parentId = await resolveCompanyId(rec.parentOrgNr)
    const childId = await resolveCompanyId(rec.childOrgNr)

    if (!parentId || !childId) {
      console.log(`  SKIP: ${rec.parentOrgNr} -> ${rec.childOrgNr} (company not found)`)
      skipped++
      continue
    }

    await prisma.companyOwnership.upsert({
      where: {
        parentCompanyId_childCompanyId: { parentCompanyId: parentId, childCompanyId: childId },
      },
      update: {
        ownershipPct: rec.ownershipPct,
        ownershipType: rec.ownershipType,
        source: rec.source,
      },
      create: {
        parentCompanyId: parentId,
        childCompanyId: childId,
        ownershipPct: rec.ownershipPct,
        ownershipType: rec.ownershipType,
        source: rec.source,
      },
    })

    console.log(`  ${rec.parentOrgNr} -> ${rec.childOrgNr} (${rec.ownershipType}${rec.ownershipPct ? `, ${rec.ownershipPct}%` : ''})`)
    imported++
  }

  console.log(`\n${imported} ownership records imported, ${skipped} skipped`)
}

async function importRelationships() {
  console.log('\nImporting HORECA business relationships...\n')
  let imported = 0
  let skipped = 0

  for (const rec of relationshipRecords) {
    const fromId = await resolveCompanyId(rec.fromOrgNr)
    const toId = await resolveCompanyId(rec.toOrgNr)

    if (!fromId || !toId) {
      console.log(`  SKIP: ${rec.fromOrgNr} -> ${rec.toOrgNr} (company not found)`)
      skipped++
      continue
    }

    await prisma.businessRelationship.upsert({
      where: {
        fromCompanyId_toCompanyId_relationshipType: {
          fromCompanyId: fromId,
          toCompanyId: toId,
          relationshipType: rec.relationshipType,
        },
      },
      update: {
        description: rec.description,
        sector: rec.sector,
        source: rec.source,
      },
      create: {
        fromCompanyId: fromId,
        toCompanyId: toId,
        relationshipType: rec.relationshipType,
        description: rec.description,
        sector: rec.sector,
        source: rec.source,
      },
    })

    console.log(`  ${rec.fromOrgNr} -> ${rec.toOrgNr} (${rec.relationshipType})`)
    imported++
  }

  console.log(`\n${imported} relationships imported, ${skipped} skipped`)
}

async function main() {
  console.log('=== HORECA: Nordisk Foodservice-kartlegging ===\n')

  await importNewCompanies()
  await importOwnership()
  await importRelationships()

  console.log('\n=== HORECA Import Summary ===')
  const foodserviceCount = await prisma.company.count({ where: { valueChainStage: 'foodservice' } })
  console.log('Foodservice companies:', foodserviceCount)
  console.log('Total companies:', await prisma.company.count())
  console.log('Ownership records:', await prisma.companyOwnership.count())
  console.log('Business relationships:', await prisma.businessRelationship.count())
}

main()
  .catch((e) => {
    console.error('HORECA import failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
