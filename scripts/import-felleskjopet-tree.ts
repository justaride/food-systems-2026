import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

function normalizePersonKey(name: string): string {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z ]/g, '').trim().replace(/\s+/g, '-')
}

const FK_ORG = '911608103'

type FKCompany = {
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
  boardMembers?: { personName: string; role: string }[]
}

const fkCompanies: FKCompany[] = [
  {
    name: 'Norgesmollene AS',
    orgNr: '885719422',
    legalForm: 'AS',
    founded: 2003,
    naceCode: '10.610',
    naceDescription: 'Produksjon av kornvarer',
    hqAddress: 'C. Sundts gate 17',
    hqCity: 'Bergen',
    employees: 140,
    ownershipType: 'cooperative',
    valueChainStage: 'processing',
    revenue2024: 1299,
    operatingResult2024: 65,
    totalAssets2024: 975,
    boardMembers: [
      { personName: 'Svenn Ivar Fure', role: 'styreleder' },
      { personName: 'Line Ramstad', role: 'styremedlem' },
      { personName: 'Trine Hjellhaug', role: 'styremedlem' },
      { personName: 'Tormod Amundsen', role: 'styremedlem' },
      { personName: 'Laila Stenstadvolden', role: 'styremedlem' },
    ],
  },
  {
    name: 'Cernova AS',
    orgNr: '958457952',
    legalForm: 'AS',
    founded: 1990,
    naceCode: '10.710',
    naceDescription: 'Produksjon av broed og ferske konditorvarer',
    hqAddress: 'C. Sundts gate 17',
    hqCity: 'Bergen',
    ownershipType: 'cooperative',
    valueChainStage: 'processing',
    totalAssets2024: 499,
  },
  {
    name: 'Cernova Trading AS',
    orgNr: '912589455',
    legalForm: 'AS',
    founded: 2013,
    naceCode: '46.900',
    naceDescription: 'Uspesifisert engroshandel',
    hqAddress: 'C. Sundts gate 17',
    hqCity: 'Bergen',
    ownershipType: 'cooperative',
    valueChainStage: 'processing',
    revenue2024: 190,
    operatingResult2024: 5,
    totalAssets2024: 53,
  },
  {
    name: 'Strand Unikorn AS',
    orgNr: '916329717',
    legalForm: 'AS',
    founded: 1974,
    naceCode: '10.910',
    naceDescription: 'Produksjon av forvarer til husdyrhold',
    hqAddress: 'Strandvegen 3-5',
    hqCity: 'Moelv',
    employees: 100,
    ownershipType: 'cooperative',
    valueChainStage: 'inputs',
    revenue2024: 1199,
    operatingResult2024: 30,
    totalAssets2024: 657,
  },
  {
    name: 'Felleskjoepet Forutvikling AS',
    orgNr: '998232058',
    legalForm: 'AS',
    founded: 2012,
    naceCode: '72.190',
    naceDescription: 'Annen forskning og annet utviklingsarbeid',
    hqAddress: 'Nedre Ila 20',
    hqCity: 'Trondheim',
    employees: 11,
    ownershipType: 'cooperative',
    valueChainStage: 'research',
    revenue2024: 28,
    operatingResult2024: 3,
    totalAssets2024: 16,
  },
  {
    name: 'Norgesfor AS',
    orgNr: '975871096',
    legalForm: 'AS',
    founded: 1995,
    naceCode: '46.750',
    naceDescription: 'Engroshandel med kjemiske produkter',
    hqAddress: 'Akershusstranda 27',
    hqCity: 'Oslo',
    employees: 10,
    ownershipType: 'cooperative',
    valueChainStage: 'inputs',
    revenue2024: 752,
    operatingResult2024: 15,
    totalAssets2024: 136,
  },
  {
    name: 'Felleskjoepet Rogaland Agder SA',
    orgNr: '915442552',
    legalForm: 'SA',
    founded: 1899,
    naceCode: '10.910',
    naceDescription: 'Produksjon av forvarer til husdyrhold',
    hqAddress: 'Sandvikveien 21',
    hqCity: 'Stavanger',
    employees: 573,
    ownershipType: 'cooperative',
    valueChainStage: 'inputs',
    revenue2024: 3795,
    operatingResult2024: 111,
    totalAssets2024: 2340,
    boardMembers: [
      { personName: 'Sveinung Svebestad', role: 'styreleder' },
      { personName: 'Sten Ivar Skretting', role: 'styremedlem' },
      { personName: 'Tarald Magne Oma', role: 'styremedlem' },
      { personName: 'Line Njastad', role: 'styremedlem' },
    ],
  },
  {
    name: 'Fiskaa Molle AS',
    orgNr: '975856844',
    legalForm: 'AS',
    founded: 1995,
    naceCode: '10.910',
    naceDescription: 'Produksjon av forvarer til husdyrhold',
    hqAddress: 'Fiskavegen 1010',
    hqCity: 'Tau',
    employees: 155,
    ownershipType: 'cooperative',
    valueChainStage: 'inputs',
    revenue2024: 2088,
    operatingResult2024: 67,
    totalAssets2024: 1278,
  },
]

const fkBoard = [
  { personName: 'Jens Lippestad', role: 'styreleder' },
  { personName: 'Elisabeth Holand', role: 'styremedlem' },
  { personName: 'Frank Gjoran Fandin', role: 'styremedlem' },
  { personName: 'Grim Erik Gillestad', role: 'styremedlem' },
  { personName: 'Thor Johannes Rogneby', role: 'styremedlem' },
  { personName: 'Elisabeth Nilsen', role: 'styremedlem' },
  { personName: 'Borgny Grande', role: 'styremedlem' },
  { personName: 'Erling Aune', role: 'styremedlem' },
  { personName: 'Sigbjoern Aurland', role: 'styremedlem' },
  { personName: 'Torbjorg Kylland', role: 'styremedlem' },
  { personName: 'Ann Kristin Nygaard', role: 'styremedlem' },
  { personName: 'Knut Repstad', role: 'styremedlem' },
]

type OwnershipLink = { parentOrgNr: string; childOrgNr: string; ownershipPct: number | null; ownershipType: string }

const ownershipLinks: OwnershipLink[] = [
  { parentOrgNr: FK_ORG, childOrgNr: '885719422', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: FK_ORG, childOrgNr: '958457952', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: FK_ORG, childOrgNr: '916329717', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: FK_ORG, childOrgNr: '998232058', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: FK_ORG, childOrgNr: '975871096', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: '958457952', childOrgNr: '912589455', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: '915442552', childOrgNr: '975856844', ownershipPct: 100, ownershipType: 'subsidiary' },
]

async function resolveCompanyId(orgNr: string): Promise<string | null> {
  const c = await prisma.company.findUnique({ where: { orgNr }, select: { id: true } })
  return c?.id ?? null
}

async function importCompanies() {
  console.log('Importing Felleskjoepet subsidiaries...\n')
  let created = 0
  for (const c of fkCompanies) {
    const company = await prisma.company.upsert({
      where: { orgNr: c.orgNr },
      update: { name: c.name, legalForm: c.legalForm, founded: c.founded, naceCode: c.naceCode, naceDescription: c.naceDescription, hqAddress: c.hqAddress, hqCity: c.hqCity, employees: c.employees, ownershipType: c.ownershipType, valueChainStage: c.valueChainStage },
      create: { name: c.name, orgNr: c.orgNr, legalForm: c.legalForm, founded: c.founded, naceCode: c.naceCode, naceDescription: c.naceDescription, hqAddress: c.hqAddress, hqCity: c.hqCity, employees: c.employees, ownershipType: c.ownershipType, valueChainStage: c.valueChainStage },
    })
    if (c.boardMembers) {
      await prisma.boardMember.deleteMany({ where: { companyId: company.id } })
      for (const b of c.boardMembers) {
        await prisma.boardMember.create({ data: { companyId: company.id, personName: b.personName, role: b.role, personKey: normalizePersonKey(b.personName) } })
      }
    }
    const rev = c.revenue2024 ? ` — ${(c.revenue2024 / 1000).toFixed(1)}B NOK` : ''
    console.log(`  ${company.name} (${c.orgNr}${rev})`)
    created++
  }
  console.log(`\n${created} FK companies imported`)
}

async function updateFKBoard() {
  console.log('\nUpdating Felleskjoepet Agri SA board...\n')
  const id = await resolveCompanyId(FK_ORG)
  if (!id) return
  await prisma.boardMember.deleteMany({ where: { companyId: id } })
  for (const b of fkBoard) {
    await prisma.boardMember.create({ data: { companyId: id, personName: b.personName, role: b.role, personKey: normalizePersonKey(b.personName) } })
    console.log(`  ${b.personName} (${b.role})`)
  }
}

async function importFinancials() {
  console.log('\nImporting FK 2024 financials...\n')
  let imported = 0
  const data = fkCompanies.filter(c => c.revenue2024).map(c => ({
    orgNr: c.orgNr, name: c.name, year: 2024,
    revenueNok: c.revenue2024! * 1_000_000,
    operatingResult: (c.operatingResult2024 ?? 0) * 1_000_000,
    operatingMargin: c.operatingResult2024 && c.revenue2024 ? Math.round((c.operatingResult2024 / c.revenue2024) * 10000) / 100 : undefined,
    groupEmployees: c.employees,
  }))
  data.push({ orgNr: FK_ORG, name: 'Felleskjoepet Agri SA', year: 2024, revenueNok: 14_800_000_000, operatingResult: 146_000_000, operatingMargin: 0.99, groupEmployees: 2532 })
  for (const f of data) {
    const companyId = await resolveCompanyId(f.orgNr)
    if (!companyId) continue
    await prisma.companyFinancial.upsert({
      where: { companyId_year: { companyId, year: f.year } },
      update: { revenueNok: f.revenueNok, operatingResult: f.operatingResult, operatingMargin: f.operatingMargin, groupEmployees: f.groupEmployees, source: 'Broennoysund / offentligdata MCP 2026-03' },
      create: { companyId, year: f.year, revenueNok: f.revenueNok, operatingResult: f.operatingResult, operatingMargin: f.operatingMargin, groupEmployees: f.groupEmployees, source: 'Broennoysund / offentligdata MCP 2026-03' },
    })
    console.log(`  ${f.name}: ${(f.revenueNok / 1e9).toFixed(1)}B NOK`)
    imported++
  }
  console.log(`\n${imported} financial records imported`)
}

async function importOwnership() {
  console.log('\nImporting FK ownership tree...\n')
  let imported = 0
  for (const link of ownershipLinks) {
    const parentId = await resolveCompanyId(link.parentOrgNr)
    const childId = await resolveCompanyId(link.childOrgNr)
    if (!parentId || !childId) continue
    await prisma.companyOwnership.upsert({
      where: { parentCompanyId_childCompanyId: { parentCompanyId: parentId, childCompanyId: childId } },
      update: { ownershipPct: link.ownershipPct, ownershipType: link.ownershipType, source: 'Broennoysundregistrene / FK aarsrapport 2024' },
      create: { parentCompanyId: parentId, childCompanyId: childId, ownershipPct: link.ownershipPct, ownershipType: link.ownershipType, source: 'Broennoysundregistrene / FK aarsrapport 2024' },
    })
    console.log(`  ${link.parentOrgNr} -> ${link.childOrgNr} (${link.ownershipPct}%)`)
    imported++
  }
  console.log(`\n${imported} ownership records imported`)
}

async function importPersonProfiles() {
  console.log('\nImporting FK key person profiles...\n')
  const persons = [
    {
      name: 'Svenn Ivar Fure',
      personKey: normalizePersonKey('Svenn Ivar Fure'),
      biography: 'CEO av Felleskjoepet Agri SA (14.8B NOK). Samtidig styreleder i Norgesmollene AS. Interlocking director som binder korn-verdikjeden fra bondekooperativ til moelledrift.',
      roles: [
        { companyName: 'Felleskjoepet Agri SA', role: 'CEO (Daglig leder)', fromYear: 2020 },
        { companyName: 'Norgesmollene AS', role: 'Styreleder', fromYear: 2020 },
      ],
      tags: ['felleskjopet', 'ceo', 'interlocking-director', 'korn-verdikjede'],
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
  console.log('=== Felleskjoepet Corporate Tree ===\n')
  await importCompanies()
  await updateFKBoard()
  await importFinancials()
  await importOwnership()
  await importPersonProfiles()
  console.log('\n=== FK Summary ===')
  console.log('Total companies:', await prisma.company.count())
  console.log('Ownership records:', await prisma.companyOwnership.count())
}

main().catch(e => { console.error('FK import failed:', e); process.exit(1) }).finally(() => prisma.$disconnect())
