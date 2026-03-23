import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

function normalizePersonKey(name: string): string {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z ]/g, '').trim().replace(/\s+/g, '-')
}

const LEROY_ORG = '975350940'

type LeroyCompany = {
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

const leroyCompanies: LeroyCompany[] = [
  {
    name: 'Hallvard Leroey AS',
    orgNr: '914353561',
    legalForm: 'AS',
    founded: 1939,
    naceCode: '46.381',
    naceDescription: 'Engroshandel med fisk og skalldyr',
    hqAddress: 'Bontelabo 2',
    hqCity: 'Bergen',
    employees: 1200,
    ownershipType: 'listed',
    valueChainStage: 'seafood',
    revenue2024: 18500,
    operatingResult2024: 920,
    totalAssets2024: 8200,
  },
  {
    name: 'Leroey Aurora AS',
    orgNr: '985940460',
    legalForm: 'AS',
    founded: 2001,
    naceCode: '03.211',
    naceDescription: 'Produksjon av fisk i sjoevann og brakkvann',
    hqCity: 'Tromsoe',
    employees: 650,
    ownershipType: 'listed',
    valueChainStage: 'seafood',
    revenue2024: 4800,
    operatingResult2024: 960,
    totalAssets2024: 6500,
  },
  {
    name: 'Leroey Midt AS',
    orgNr: '985848718',
    legalForm: 'AS',
    founded: 2003,
    naceCode: '03.211',
    naceDescription: 'Produksjon av fisk i sjoevann og brakkvann',
    hqCity: 'Hestvika',
    employees: 550,
    ownershipType: 'listed',
    valueChainStage: 'seafood',
    revenue2024: 3900,
    operatingResult2024: 780,
    totalAssets2024: 5800,
  },
  {
    name: 'Leroey Vest AS',
    orgNr: '886813082',
    legalForm: 'AS',
    founded: 2007,
    naceCode: '03.211',
    naceDescription: 'Produksjon av fisk i sjoevann og brakkvann',
    hqCity: 'Bergen',
    employees: 480,
    ownershipType: 'listed',
    valueChainStage: 'seafood',
    revenue2024: 3200,
    operatingResult2024: 640,
    totalAssets2024: 4900,
  },
  {
    name: 'Leroey Havfisk AS',
    orgNr: '986392858',
    legalForm: 'AS',
    founded: 2005,
    naceCode: '03.111',
    naceDescription: 'Hav- og kystfiske',
    hqCity: 'Bergen',
    employees: 350,
    ownershipType: 'listed',
    valueChainStage: 'seafood',
    revenue2024: 2100,
    operatingResult2024: 420,
    totalAssets2024: 3200,
  },
  {
    name: 'Leroey Norway Seafoods AS',
    orgNr: '995548194',
    legalForm: 'AS',
    founded: 2009,
    naceCode: '10.200',
    naceDescription: 'Bearbeiding og konservering av fisk, skalldyr og bloetdyr',
    hqCity: 'Bergen',
    employees: 800,
    ownershipType: 'listed',
    valueChainStage: 'seafood',
    revenue2024: 2800,
    operatingResult2024: 140,
    totalAssets2024: 2100,
  },
  {
    name: 'Sjoetroll AS',
    orgNr: '927894254',
    legalForm: 'AS',
    founded: 1980,
    naceCode: '03.211',
    naceDescription: 'Produksjon av fisk i sjoevann og brakkvann',
    hqCity: 'Bergen',
    employees: 180,
    ownershipType: 'listed',
    valueChainStage: 'seafood',
  },
]

const leroyBoard = [
  { personName: 'Arne Moegster', role: 'styreleder' },
  { personName: 'Didrik Munch', role: 'styremedlem' },
  { personName: 'Linda K. Pedersen', role: 'styremedlem' },
  { personName: 'Are Dragesund', role: 'styremedlem' },
  { personName: 'Bjarne Kristiansen', role: 'styremedlem' },
  { personName: 'Tor Ivar Ingebrigtsen', role: 'styremedlem' },
  { personName: 'Karoline Moegster', role: 'styremedlem' },
  { personName: 'Britt Kathrine Drivenes', role: 'ansatterepresentant' },
  { personName: 'Silje Elin Butt', role: 'ansatterepresentant' },
]

type OwnershipLink = { parentOrgNr: string; childOrgNr: string; ownershipPct: number | null; ownershipType: string }

const ownershipLinks: OwnershipLink[] = [
  { parentOrgNr: LEROY_ORG, childOrgNr: '914353561', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: LEROY_ORG, childOrgNr: '985940460', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: LEROY_ORG, childOrgNr: '985848718', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: LEROY_ORG, childOrgNr: '886813082', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: LEROY_ORG, childOrgNr: '986392858', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: LEROY_ORG, childOrgNr: '995548194', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: '886813082', childOrgNr: '927894254', ownershipPct: 100, ownershipType: 'subsidiary' },
]

async function resolveCompanyId(orgNr: string): Promise<string | null> {
  const c = await prisma.company.findUnique({ where: { orgNr }, select: { id: true } })
  return c?.id ?? null
}

async function importCompanies() {
  console.log('Importing Leroey subsidiaries...\n')
  let created = 0
  for (const c of leroyCompanies) {
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
  console.log(`\n${created} Leroey companies imported`)
}

async function updateLeroyBoard() {
  console.log('\nUpdating Leroey Seafood Group ASA board...\n')
  const id = await resolveCompanyId(LEROY_ORG)
  if (!id) return
  await prisma.boardMember.deleteMany({ where: { companyId: id } })
  for (const b of leroyBoard) {
    await prisma.boardMember.create({ data: { companyId: id, personName: b.personName, role: b.role, personKey: normalizePersonKey(b.personName) } })
    console.log(`  ${b.personName} (${b.role})`)
  }
}

async function importFinancials() {
  console.log('\nImporting Leroey 2024 financials...\n')
  let imported = 0
  const data = leroyCompanies.filter(c => c.revenue2024).map(c => ({
    orgNr: c.orgNr, name: c.name, year: 2024,
    revenueNok: c.revenue2024! * 1_000_000,
    operatingResult: (c.operatingResult2024 ?? 0) * 1_000_000,
    operatingMargin: c.operatingResult2024 && c.revenue2024 ? Math.round((c.operatingResult2024 / c.revenue2024) * 10000) / 100 : undefined,
    groupEmployees: c.employees,
  }))
  data.push({ orgNr: LEROY_ORG, name: 'Leroey Seafood Group ASA', year: 2024, revenueNok: 31_124_000_000, operatingResult: 3_027_000_000, operatingMargin: 9.73, groupEmployees: 6000 })
  for (const f of data) {
    const companyId = await resolveCompanyId(f.orgNr)
    if (!companyId) continue
    await prisma.companyFinancial.upsert({
      where: { companyId_year: { companyId, year: f.year } },
      update: { revenueNok: f.revenueNok, operatingResult: f.operatingResult, operatingMargin: f.operatingMargin, groupEmployees: f.groupEmployees, source: 'Leroey Annual Report 2024 / web research 2026-03' },
      create: { companyId, year: f.year, revenueNok: f.revenueNok, operatingResult: f.operatingResult, operatingMargin: f.operatingMargin, groupEmployees: f.groupEmployees, source: 'Leroey Annual Report 2024 / web research 2026-03' },
    })
    console.log(`  ${f.name}: ${(f.revenueNok / 1e9).toFixed(1)}B NOK`)
    imported++
  }
  console.log(`\n${imported} financial records imported`)
}

async function importOwnership() {
  console.log('\nImporting Leroey ownership tree...\n')
  let imported = 0
  for (const link of ownershipLinks) {
    const parentId = await resolveCompanyId(link.parentOrgNr)
    const childId = await resolveCompanyId(link.childOrgNr)
    if (!parentId || !childId) continue
    await prisma.companyOwnership.upsert({
      where: { parentCompanyId_childCompanyId: { parentCompanyId: parentId, childCompanyId: childId } },
      update: { ownershipPct: link.ownershipPct, ownershipType: link.ownershipType, source: 'Leroey Annual Report 2024 / Broennoysund' },
      create: { parentCompanyId: parentId, childCompanyId: childId, ownershipPct: link.ownershipPct, ownershipType: link.ownershipType, source: 'Leroey Annual Report 2024 / Broennoysund' },
    })
    console.log(`  ${link.parentOrgNr} -> ${link.childOrgNr} (${link.ownershipPct}%)`)
    imported++
  }
  console.log(`\n${imported} ownership records imported`)
}

async function importPersonProfiles() {
  console.log('\nImporting Leroey key person profiles...\n')
  const persons = [
    {
      name: 'Henning Beltestad',
      personKey: normalizePersonKey('Henning Beltestad'),
      biography: 'CEO i Leroey Seafood Group ASA (31.1B NOK) siden 2010. Begynte i Hallvard Leroey AS i 1993. Adm.dir. Hallvard Leroey AS fra 2007.',
      roles: [
        { companyName: 'Leroey Seafood Group ASA', role: 'CEO (Daglig leder)', fromYear: 2010 },
      ],
      tags: ['leroey', 'ceo', 'sjoemat'],
    },
    {
      name: 'Arne Moegster',
      personKey: normalizePersonKey('Arne Moegster'),
      biography: 'Styreleder i Leroey Seafood Group ASA og CEO i Austevoll Seafood ASA. Sentral i Moegster-familiens sjoematsimperium. Interlocking director mellom Austevoll og Leroey.',
      roles: [
        { companyName: 'Leroey Seafood Group ASA', role: 'Styreleder', fromYear: 2014 },
        { companyName: 'Austevoll Seafood ASA', role: 'CEO (Daglig leder)', fromYear: 2006 },
      ],
      tags: ['leroey', 'austevoll', 'moegster', 'interlocking-director', 'styreleder', 'ceo'],
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
  console.log('=== Leroey Seafood Corporate Tree ===\n')
  await importCompanies()
  await updateLeroyBoard()
  await importFinancials()
  await importOwnership()
  await importPersonProfiles()
  console.log('\n=== Leroey Summary ===')
  console.log('Total companies:', await prisma.company.count())
  console.log('Ownership records:', await prisma.companyOwnership.count())
}

main().catch(e => { console.error('Leroey import failed:', e); process.exit(1) }).finally(() => prisma.$disconnect())
