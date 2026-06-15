import 'dotenv/config'
import { canonicalPersonKey as normalizePersonKey } from '../src/lib/person-key'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const AUSTEVOLL_ORG = '929975200'
const LEROY_ORG = '975350940'

type HoldingCompany = {
  name: string
  orgNr: string
  legalForm: string
  founded?: number
  naceCode: string
  naceDescription: string
  hqAddress?: string
  hqCity: string
  employees?: number
  ownershipType: string
  valueChainStage: string
  revenue2024?: number
  operatingResult2024?: number
  totalAssets2024?: number
}

const holdingCompanies: HoldingCompany[] = [
  {
    name: 'Laco AS',
    orgNr: '937305354',
    legalForm: 'AS',
    founded: 1981,
    naceCode: '03.211',
    naceDescription: 'Produksjon av fisk i sjoevann og brakkvann',
    hqCity: 'Storeboe',
    ownershipType: 'family',
    valueChainStage: 'seafood',
  },
]

const austevollBoard = [
  { personName: 'Helge Singelstad', role: 'styreleder' },
  { personName: 'Hege Charlotte Bakken', role: 'nestleder' },
  { personName: 'Petter Dragesund', role: 'styremedlem' },
  { personName: 'Siren Merete Groenhaug', role: 'styremedlem' },
  { personName: 'Eirik Droenen Melingen', role: 'styremedlem' },
  { personName: 'Helge Moegster', role: 'styremedlem' },
  { personName: 'Lill Maren Moegster', role: 'styremedlem' },
  { personName: 'Hege Solbakken', role: 'styremedlem' },
]

type OwnershipLink = { parentOrgNr: string; childOrgNr: string; ownershipPct: number | null; ownershipType: string }

const ownershipLinks: OwnershipLink[] = [
  { parentOrgNr: '937305354', childOrgNr: AUSTEVOLL_ORG, ownershipPct: 55.55, ownershipType: 'subsidiary' },
  { parentOrgNr: AUSTEVOLL_ORG, childOrgNr: LEROY_ORG, ownershipPct: 52.7, ownershipType: 'subsidiary' },
]

async function resolveCompanyId(orgNr: string): Promise<string | null> {
  const c = await prisma.company.findUnique({ where: { orgNr }, select: { id: true } })
  return c?.id ?? null
}

async function importCompanies() {
  console.log('Importing seafood holding companies...\n')
  let created = 0
  for (const c of holdingCompanies) {
    await prisma.company.upsert({
      where: { orgNr: c.orgNr },
      update: { name: c.name, legalForm: c.legalForm, founded: c.founded, naceCode: c.naceCode, naceDescription: c.naceDescription, hqAddress: c.hqAddress, hqCity: c.hqCity, employees: c.employees, ownershipType: c.ownershipType, valueChainStage: c.valueChainStage },
      create: { name: c.name, orgNr: c.orgNr, legalForm: c.legalForm, founded: c.founded, naceCode: c.naceCode, naceDescription: c.naceDescription, hqAddress: c.hqAddress, hqCity: c.hqCity, employees: c.employees, ownershipType: c.ownershipType, valueChainStage: c.valueChainStage },
    })
    console.log(`  ${c.name} (${c.orgNr})`)
    created++
  }
  console.log(`\n${created} holding companies imported`)
}

async function updateAustevollBoard() {
  console.log('\nUpdating Austevoll Seafood ASA board...\n')
  const id = await resolveCompanyId(AUSTEVOLL_ORG)
  if (!id) return
  await prisma.boardMember.deleteMany({ where: { companyId: id } })
  for (const b of austevollBoard) {
    await prisma.boardMember.create({ data: { companyId: id, personName: b.personName, role: b.role, personKey: normalizePersonKey(b.personName) } })
    console.log(`  ${b.personName} (${b.role})`)
  }
}

async function importFinancials() {
  console.log('\nImporting Austevoll 2024 financials...\n')
  const companyId = await resolveCompanyId(AUSTEVOLL_ORG)
  if (!companyId) return
  await prisma.companyFinancial.upsert({
    where: { companyId_year: { companyId, year: 2024 } },
    update: { revenueNok: 35_366_000_000, operatingResult: 4_200_000_000, operatingMargin: 11.88, source: 'Austevoll Seafood Annual Report 2024 / web research 2026-03' },
    create: { companyId, year: 2024, revenueNok: 35_366_000_000, operatingResult: 4_200_000_000, operatingMargin: 11.88, source: 'Austevoll Seafood Annual Report 2024 / web research 2026-03' },
  })
  console.log(`  Austevoll Seafood ASA: 35.4B NOK`)
}

async function importOwnership() {
  console.log('\nImporting seafood ownership chain...\n')
  console.log('  Chain: Laco AS (Moegster family) -> Austevoll Seafood 55.55% -> Leroey Seafood 52.7%\n')
  let imported = 0
  for (const link of ownershipLinks) {
    const parentId = await resolveCompanyId(link.parentOrgNr)
    const childId = await resolveCompanyId(link.childOrgNr)
    if (!parentId || !childId) {
      console.log(`  SKIPPED: ${link.parentOrgNr} -> ${link.childOrgNr} (missing company)`)
      continue
    }
    await prisma.companyOwnership.upsert({
      where: { parentCompanyId_childCompanyId: { parentCompanyId: parentId, childCompanyId: childId } },
      update: { ownershipPct: link.ownershipPct, ownershipType: link.ownershipType, source: 'Austevoll Seafood / Broennoysund aksjeeierboken 2024' },
      create: { parentCompanyId: parentId, childCompanyId: childId, ownershipPct: link.ownershipPct, ownershipType: link.ownershipType, source: 'Austevoll Seafood / Broennoysund aksjeeierboken 2024' },
    })
    console.log(`  ${link.parentOrgNr} -> ${link.childOrgNr} (${link.ownershipPct}%)`)
    imported++
  }
  console.log(`\n${imported} ownership records imported`)
}

async function importPersonProfiles() {
  console.log('\nImporting seafood holding key person profiles...\n')
  const persons = [
    {
      name: 'Helge Moegster',
      personKey: normalizePersonKey('Helge Moegster'),
      biography: 'Grunnlegger av Austevoll Seafood (1981) og Laco AS. Styremedlem i Austevoll Seafood siden stiftelsen. Gjennom Laco AS kontrollerer familien 55.55% av Austevoll Seafood, som igjen eier 52.7% av Leroey Seafood. Effektivt kontrollerer Moegster-familien Norges to stoerste sjoematsselskaper.',
      roles: [
        { companyName: 'Austevoll Seafood ASA', role: 'Styremedlem / Grunnlegger', fromYear: 1981 },
        { companyName: 'Laco AS', role: 'Grunnlegger / Eier', fromYear: 1981 },
      ],
      tags: ['austevoll', 'laco', 'moegster', 'grunnlegger', 'sjoemat', 'leroey'],
    },
    {
      name: 'Helge Singelstad',
      personKey: normalizePersonKey('Helge Singelstad'),
      biography: 'Styreleder i Austevoll Seafood ASA (35.4B NOK) og CEO i Laco AS. Interlocking director som binder Moegster-familiens holding til det boersnoterte selskapet.',
      roles: [
        { companyName: 'Austevoll Seafood ASA', role: 'Styreleder', fromYear: 2010 },
        { companyName: 'Laco AS', role: 'CEO (Daglig leder)', fromYear: 2006 },
      ],
      tags: ['austevoll', 'laco', 'styreleder', 'interlocking-director'],
    },
  ]
  for (const p of persons) {
    await prisma.personProfile.upsert({
      where: { personKey: p.personKey },
      update: { name: p.name, biography: p.biography, roles: p.roles, tags: p.tags },
      create: { name: p.name, personKey: p.personKey, biography: p.biography, roles: p.roles, tags: p.tags },
    })
    console.log(`  ${p.name}`)
  }
}

async function main() {
  console.log('=== Seafood Holdings Tree ===\n')
  console.log('Moegster family control chain:')
  console.log('  Laco AS (family) -> Austevoll Seafood ASA 55.55% -> Leroey Seafood Group ASA 52.7%\n')
  await importCompanies()
  await updateAustevollBoard()
  await importFinancials()
  await importOwnership()
  await importPersonProfiles()
  console.log('\n=== Seafood Holdings Summary ===')
  console.log('Total companies:', await prisma.company.count())
  console.log('Ownership records:', await prisma.companyOwnership.count())
}

main().catch(e => { console.error('Seafood holdings import failed:', e); process.exit(1) }).finally(() => prisma.$disconnect())
