import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

function normalizePersonKey(name: string): string {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z ]/g, '').trim().replace(/\s+/g, '-')
}

const BAMA_ORG = '914224314'

type BamaCompany = {
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
}

const bamaCompanies: BamaCompany[] = [
  {
    name: 'BAMA Industri AS',
    orgNr: '976565967',
    legalForm: 'AS',
    founded: 1991,
    naceCode: '10.390',
    naceDescription: 'Bearbeiding og konservering av frukt og groennsaker ellers',
    hqAddress: 'Joseph Kellers vei 22',
    hqCity: 'Tranby',
    employees: 378,
    ownershipType: 'family',
    valueChainStage: 'processing',
    revenue2024: 1700,
    operatingResult2024: 85,
  },
  {
    name: 'BAMA Storkjoekken AS',
    orgNr: '995518333',
    legalForm: 'AS',
    founded: 2009,
    naceCode: '46.310',
    naceDescription: 'Engroshandel med frukt og groennsaker',
    hqCity: 'Tromsoe',
    employees: 350,
    ownershipType: 'family',
    valueChainStage: 'foodservice',
    revenue2024: 2500,
    operatingResult2024: 125,
  },
  {
    name: 'BAMA Logistikk AS',
    orgNr: '965437150',
    legalForm: 'AS',
    founded: 1992,
    naceCode: '49.410',
    naceDescription: 'Godstransport paa vei',
    hqAddress: 'Nedre Kalbakkvei 40',
    hqCity: 'Oslo',
    employees: 19,
    ownershipType: 'family',
    valueChainStage: 'logistics',
  },
  {
    name: 'BAMA Pakkerier AS',
    orgNr: '995244071',
    legalForm: 'AS',
    founded: 2010,
    naceCode: '01.630',
    naceDescription: 'Etterbehandling av vekster etter innhoesting',
    hqAddress: 'Nedre Kalbakkvei 40',
    hqCity: 'Oslo',
    ownershipType: 'family',
    valueChainStage: 'processing',
  },
  {
    name: 'BAMA International AS',
    orgNr: '959657769',
    legalForm: 'AS',
    founded: 1990,
    naceCode: '46.310',
    naceDescription: 'Engroshandel med frukt og groennsaker',
    hqAddress: 'Nedre Kalbakkvei 40',
    hqCity: 'Oslo',
    ownershipType: 'family',
    valueChainStage: 'logistics',
  },
  {
    name: 'BAMA Blomster Holding AS',
    orgNr: '981384016',
    legalForm: 'AS',
    founded: 1999,
    naceCode: '46.220',
    naceDescription: 'Engroshandel med blomster og planter',
    hqAddress: 'Joseph Kellers vei 22',
    hqCity: 'Tranby',
    ownershipType: 'family',
    valueChainStage: 'logistics',
  },
  {
    name: 'BAMA Blomster Sourcing AS',
    orgNr: '992714409',
    legalForm: 'AS',
    founded: 2008,
    naceCode: '46.220',
    naceDescription: 'Engroshandel med blomster og planter',
    hqAddress: 'Joseph Kellers vei 22',
    hqCity: 'Tranby',
    ownershipType: 'family',
    valueChainStage: 'logistics',
    revenue2024: 800,
    operatingResult2024: 8,
  },
]

const bamaBoard = [
  { personName: 'Kristian Nergaard', role: 'styreleder' },
  { personName: 'Runar Hollevik', role: 'styremedlem' },
  { personName: 'Ihsan Akram', role: 'styremedlem' },
  { personName: 'Jostein Hestoey', role: 'styremedlem' },
  { personName: 'Ole Robert Reitan', role: 'styremedlem' },
  { personName: 'Gyrid Skalleberg Ingeroe', role: 'styremedlem' },
  { personName: 'Rune Olasveengen Dalsaune', role: 'ansatterepresentant' },
  { personName: 'Kirsten Indgjerd Vaerdal', role: 'ansatterepresentant' },
]

type OwnershipLink = { parentOrgNr: string; childOrgNr: string; ownershipPct: number | null; ownershipType: string }

const ownershipLinks: OwnershipLink[] = [
  { parentOrgNr: BAMA_ORG, childOrgNr: '976565967', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: BAMA_ORG, childOrgNr: '995518333', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: BAMA_ORG, childOrgNr: '965437150', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: BAMA_ORG, childOrgNr: '995244071', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: BAMA_ORG, childOrgNr: '959657769', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: BAMA_ORG, childOrgNr: '981384016', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: '981384016', childOrgNr: '992714409', ownershipPct: 100, ownershipType: 'subsidiary' },
]

async function resolveCompanyId(orgNr: string): Promise<string | null> {
  const c = await prisma.company.findUnique({ where: { orgNr }, select: { id: true } })
  return c?.id ?? null
}

async function importCompanies() {
  console.log('Importing BAMA subsidiaries...\n')
  let created = 0
  for (const c of bamaCompanies) {
    await prisma.company.upsert({
      where: { orgNr: c.orgNr },
      update: { name: c.name, legalForm: c.legalForm, founded: c.founded, naceCode: c.naceCode, naceDescription: c.naceDescription, hqAddress: c.hqAddress, hqCity: c.hqCity, employees: c.employees, ownershipType: c.ownershipType, valueChainStage: c.valueChainStage },
      create: { name: c.name, orgNr: c.orgNr, legalForm: c.legalForm, founded: c.founded, naceCode: c.naceCode, naceDescription: c.naceDescription, hqAddress: c.hqAddress, hqCity: c.hqCity, employees: c.employees, ownershipType: c.ownershipType, valueChainStage: c.valueChainStage },
    })
    const rev = c.revenue2024 ? ` — ${(c.revenue2024 / 1000).toFixed(1)}B NOK` : ''
    console.log(`  ${c.name} (${c.orgNr}${rev})`)
    created++
  }
  console.log(`\n${created} BAMA companies imported`)
}

async function updateBamaBoard() {
  console.log('\nUpdating BAMA Gruppen AS board...\n')
  const id = await resolveCompanyId(BAMA_ORG)
  if (!id) return
  await prisma.boardMember.deleteMany({ where: { companyId: id } })
  for (const b of bamaBoard) {
    await prisma.boardMember.create({ data: { companyId: id, personName: b.personName, role: b.role, personKey: normalizePersonKey(b.personName) } })
    console.log(`  ${b.personName} (${b.role})`)
  }
}

async function importFinancials() {
  console.log('\nImporting BAMA 2024 financials...\n')
  let imported = 0
  const data = bamaCompanies.filter(c => c.revenue2024).map(c => ({
    orgNr: c.orgNr, name: c.name, year: 2024,
    revenueNok: c.revenue2024! * 1_000_000,
    operatingResult: (c.operatingResult2024 ?? 0) * 1_000_000,
    operatingMargin: c.operatingResult2024 && c.revenue2024 ? Math.round((c.operatingResult2024 / c.revenue2024) * 10000) / 100 : undefined,
    groupEmployees: c.employees,
  }))
  data.push({ orgNr: BAMA_ORG, name: 'BAMA Gruppen AS', year: 2024, revenueNok: 24_200_000_000, operatingResult: 1_278_000_000, operatingMargin: 5.28, groupEmployees: 3273 })
  for (const f of data) {
    const companyId = await resolveCompanyId(f.orgNr)
    if (!companyId) continue
    await prisma.companyFinancial.upsert({
      where: { companyId_year: { companyId, year: f.year } },
      update: { revenueNok: f.revenueNok, operatingResult: f.operatingResult, operatingMargin: f.operatingMargin, groupEmployees: f.groupEmployees, source: 'BAMA Gruppen Aarsrapport 2024 / web research 2026-03' },
      create: { companyId, year: f.year, revenueNok: f.revenueNok, operatingResult: f.operatingResult, operatingMargin: f.operatingMargin, groupEmployees: f.groupEmployees, source: 'BAMA Gruppen Aarsrapport 2024 / web research 2026-03' },
    })
    console.log(`  ${f.name}: ${(f.revenueNok / 1e9).toFixed(1)}B NOK`)
    imported++
  }
  console.log(`\n${imported} financial records imported`)
}

async function importOwnership() {
  console.log('\nImporting BAMA ownership tree...\n')
  let imported = 0
  for (const link of ownershipLinks) {
    const parentId = await resolveCompanyId(link.parentOrgNr)
    const childId = await resolveCompanyId(link.childOrgNr)
    if (!parentId || !childId) continue
    await prisma.companyOwnership.upsert({
      where: { parentCompanyId_childCompanyId: { parentCompanyId: parentId, childCompanyId: childId } },
      update: { ownershipPct: link.ownershipPct, ownershipType: link.ownershipType, source: 'BAMA Gruppen / Broennoysund 2024' },
      create: { parentCompanyId: parentId, childCompanyId: childId, ownershipPct: link.ownershipPct, ownershipType: link.ownershipType, source: 'BAMA Gruppen / Broennoysund 2024' },
    })
    console.log(`  ${link.parentOrgNr} -> ${link.childOrgNr} (${link.ownershipPct}%)`)
    imported++
  }
  console.log(`\n${imported} ownership records imported`)
}

async function importPersonProfiles() {
  console.log('\nImporting BAMA key person profiles...\n')
  const persons = [
    {
      name: 'Bent Andersen',
      personKey: normalizePersonKey('Bent Andersen'),
      biography: 'CEO i BAMA Gruppen AS (24.2B NOK) fra mai 2024. Tidligere konserndirektoer i BAMA. Etterfulgte Petra Axdorff som sluttet i 2023.',
      roles: [
        { companyName: 'BAMA Gruppen AS', role: 'CEO (Daglig leder)', fromYear: 2024 },
      ],
      tags: ['bama', 'ceo', 'frukt', 'groennsaker'],
    },
    {
      name: 'Kristian Nergaard',
      personKey: normalizePersonKey('Kristian Nergaard'),
      biography: 'Styreleder i BAMA Gruppen AS. Eier 61% av Halfdan Holme, og gjennom familieselskapet AS Banan (Banan II) kontrollerer Nergaard-soestrene 34% av BAMA Gruppen. Sentral i Bama-familiens eierskap siden grunnleggelsen.',
      roles: [
        { companyName: 'BAMA Gruppen AS', role: 'Styreleder', fromYear: 2010 },
      ],
      tags: ['bama', 'styreleder', 'nergaard', 'grunnlegger-familie'],
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
  console.log('=== BAMA Gruppen Corporate Tree ===\n')
  console.log('Ownership: NorgesGruppen 46% + AS Banan (Nergaard) 34% + Rema Industrier 20%\n')
  await importCompanies()
  await updateBamaBoard()
  await importFinancials()
  await importOwnership()
  await importPersonProfiles()
  console.log('\n=== BAMA Summary ===')
  console.log('Total companies:', await prisma.company.count())
  console.log('Ownership records:', await prisma.companyOwnership.count())
}

main().catch(e => { console.error('BAMA import failed:', e); process.exit(1) }).finally(() => prisma.$disconnect())
