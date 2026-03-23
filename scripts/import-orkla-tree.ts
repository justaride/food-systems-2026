import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

function normalizePersonKey(name: string): string {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z ]/g, '').trim().replace(/\s+/g, '-')
}

const ORKLA_ORG = '910747711'

type OrklaCompany = {
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

const orklaCompanies: OrklaCompany[] = [
  {
    name: 'Orkla Foods AS',
    orgNr: '930097705',
    legalForm: 'AS',
    founded: 2022,
    naceCode: '10.850',
    naceDescription: 'Produksjon av ferdigmat',
    hqAddress: 'Drammensveien 149A',
    hqCity: 'Oslo',
    employees: 22,
    ownershipType: 'family',
    valueChainStage: 'processing',
    revenue2024: 130,
    operatingResult2024: -134,
    totalAssets2024: 26411,
    boardMembers: [
      { personName: 'Xavier William Fernand Belison', role: 'styreleder' },
      { personName: 'Oyvind Andreas Torpp', role: 'styremedlem' },
      { personName: 'Kjersti Helen Hobol', role: 'styremedlem' },
      { personName: 'Hege Brekke', role: 'styremedlem' },
      { personName: 'Janne Toril Halvorsen', role: 'styremedlem' },
    ],
  },
  {
    name: 'Orkla Foods Norge AS',
    orgNr: '916170858',
    legalForm: 'AS',
    founded: 1962,
    naceCode: '10.850',
    naceDescription: 'Produksjon av ferdigmat',
    hqAddress: 'Drammensveien 149',
    hqCity: 'Oslo',
    employees: 1101,
    ownershipType: 'family',
    valueChainStage: 'processing',
    revenue2024: 5918,
    operatingResult2024: 878,
    totalAssets2024: 3927,
    boardMembers: [
      { personName: 'Arttu-Pekka Vikstrom', role: 'styreleder' },
      { personName: 'Jan Roar Nordby', role: 'styremedlem' },
      { personName: 'Ingrid Sofie Nielsen', role: 'styremedlem' },
      { personName: 'Robert Kollevag', role: 'styremedlem' },
      { personName: 'Renate Kaldhussaeter', role: 'styremedlem' },
    ],
  },
  {
    name: 'Orkla Snacks AS',
    orgNr: '930097748',
    legalForm: 'AS',
    founded: 2022,
    naceCode: '46.389',
    naceDescription: 'Engroshandel med nytelsesmidler',
    hqAddress: 'Drammensveien 149A',
    hqCity: 'Oslo',
    employees: 21,
    ownershipType: 'family',
    valueChainStage: 'processing',
    revenue2024: 54,
    operatingResult2024: -124,
    totalAssets2024: 19854,
  },
  {
    name: 'Orkla Snacks Norge AS',
    orgNr: '940712580',
    legalForm: 'AS',
    founded: 1986,
    naceCode: '10.820',
    naceDescription: 'Produksjon av kakao, sjokolade og sukkervarer',
    hqAddress: 'Bromstadvegen 2',
    hqCity: 'Trondheim',
    employees: 449,
    ownershipType: 'family',
    valueChainStage: 'processing',
    revenue2024: 2782,
    operatingResult2024: 458,
    totalAssets2024: 1452,
    boardMembers: [
      { personName: 'Ingvill Berg', role: 'styreleder' },
      { personName: 'Elin Wintermeyer', role: 'styremedlem' },
      { personName: 'Frank Anders Haugli', role: 'styremedlem' },
      { personName: 'Lena Bye Lilleli', role: 'styremedlem' },
    ],
  },
  {
    name: 'Orkla Food Ingredients AS',
    orgNr: '911161419',
    legalForm: 'AS',
    founded: 1918,
    naceCode: '10.610',
    naceDescription: 'Produksjon av kornvarer',
    hqAddress: 'Drammensveien 149A',
    hqCity: 'Oslo',
    employees: 30,
    ownershipType: 'family',
    valueChainStage: 'processing',
    revenue2024: 26,
    operatingResult2024: -218,
    totalAssets2024: 8628,
  },
  {
    name: 'Orkla Health Holding AS',
    orgNr: '930097683',
    legalForm: 'AS',
    founded: 2022,
    naceCode: '10.850',
    naceDescription: 'Produksjon av ferdigmat',
    hqAddress: 'Drammensveien 149A',
    hqCity: 'Oslo',
    employees: 17,
    ownershipType: 'family',
    valueChainStage: 'processing',
    revenue2024: 33,
    operatingResult2024: -54,
    totalAssets2024: 10380,
  },
  {
    name: 'Orkla Health AS',
    orgNr: '986519904',
    legalForm: 'AS',
    founded: 2004,
    naceCode: '10.411',
    naceDescription: 'Produksjon av raa fiskeoljer og fett',
    hqAddress: 'Drammensveien 149A',
    hqCity: 'Oslo',
    employees: 199,
    ownershipType: 'family',
    valueChainStage: 'processing',
    revenue2024: 1884,
    operatingResult2024: 140,
    totalAssets2024: 2678,
  },
  {
    name: 'Orkla Home and Personal Care AS',
    orgNr: '911161230',
    legalForm: 'AS',
    founded: 1912,
    naceCode: '20.410',
    naceDescription: 'Produksjon av sape og vaskemidler',
    hqAddress: 'Drammensveien 149A',
    hqCity: 'Oslo',
    employees: 197,
    ownershipType: 'family',
    valueChainStage: 'processing',
    revenue2024: 1678,
    operatingResult2024: 192,
    totalAssets2024: 2073,
  },
  {
    name: 'Orkla House Care Norge AS',
    orgNr: '996888142',
    legalForm: 'AS',
    founded: 2011,
    naceCode: '46.499',
    naceDescription: 'Engroshandel med husholdningsvarer',
    hqAddress: 'Drammensveien 149',
    hqCity: 'Oslo',
    employees: 60,
    ownershipType: 'family',
    valueChainStage: 'processing',
    revenue2024: 499,
    operatingResult2024: 138,
    totalAssets2024: 658,
  },
  {
    name: 'Pierre Robert Group AS',
    orgNr: '912692094',
    legalForm: 'AS',
    founded: 1956,
    naceCode: '46.421',
    naceDescription: 'Engroshandel med klaer',
    hqAddress: 'Drammensveien 149A',
    hqCity: 'Oslo',
    employees: 103,
    ownershipType: 'family',
    valueChainStage: 'processing',
    revenue2024: 363,
    operatingResult2024: -112,
    totalAssets2024: 259,
  },
  {
    name: 'Orkla Eiendom AS',
    orgNr: '932176076',
    legalForm: 'AS',
    founded: 1982,
    naceCode: '68.100',
    naceDescription: 'Kjoep og salg av egen fast eiendom',
    hqAddress: 'Drammensveien 149A',
    hqCity: 'Oslo',
    employees: 16,
    ownershipType: 'family',
    valueChainStage: 'processing',
    revenue2024: 35,
    operatingResult2024: -16,
    totalAssets2024: 1229,
  },
  {
    name: 'Orkla IT AS',
    orgNr: '991742255',
    legalForm: 'AS',
    founded: 2007,
    naceCode: '62.030',
    naceDescription: 'Forvaltning og drift av IT-systemer',
    hqAddress: 'Drammensveien 149',
    hqCity: 'Oslo',
    employees: 135,
    ownershipType: 'family',
    valueChainStage: 'processing',
    revenue2024: 805,
    operatingResult2024: 31,
    totalAssets2024: 340,
  },
]

const orklaBoard = [
  { personName: 'Stein Erik Hagen', role: 'styreleder' },
  { personName: 'Liselott Kilaas', role: 'styremedlem' },
  { personName: 'Terje Utstrand', role: 'styremedlem' },
  { personName: 'Roger Vangen', role: 'styremedlem' },
  { personName: 'Hans Peter Henrik Agnefjall', role: 'styremedlem' },
  { personName: 'Christina Therese Hersch Fagerberg', role: 'styremedlem' },
  { personName: 'Rolv Erik Ryssdal', role: 'styremedlem' },
  { personName: 'Caroline Marie Kjos', role: 'styremedlem' },
  { personName: 'Bengt Arve Rem', role: 'styremedlem' },
  { personName: 'Ingrid Sofie Nielsen', role: 'styremedlem' },
]

type OwnershipLink = { parentOrgNr: string; childOrgNr: string; ownershipPct: number | null; ownershipType: string }

const ownershipLinks: OwnershipLink[] = [
  { parentOrgNr: ORKLA_ORG, childOrgNr: '930097705', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: ORKLA_ORG, childOrgNr: '930097748', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: ORKLA_ORG, childOrgNr: '911161419', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: ORKLA_ORG, childOrgNr: '930097683', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: ORKLA_ORG, childOrgNr: '911161230', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: ORKLA_ORG, childOrgNr: '912692094', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: ORKLA_ORG, childOrgNr: '932176076', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: ORKLA_ORG, childOrgNr: '991742255', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: '930097705', childOrgNr: '916170858', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: '930097748', childOrgNr: '940712580', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: '930097683', childOrgNr: '986519904', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: '911161230', childOrgNr: '996888142', ownershipPct: 100, ownershipType: 'subsidiary' },
]

async function resolveCompanyId(orgNr: string): Promise<string | null> {
  const c = await prisma.company.findUnique({ where: { orgNr }, select: { id: true } })
  return c?.id ?? null
}

async function importCompanies() {
  console.log('Importing Orkla subsidiaries...\n')
  let created = 0
  for (const c of orklaCompanies) {
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
  console.log(`\n${created} Orkla companies imported`)
}

async function updateOrklaBoard() {
  console.log('\nUpdating Orkla ASA board...\n')
  const id = await resolveCompanyId(ORKLA_ORG)
  if (!id) return
  await prisma.boardMember.deleteMany({ where: { companyId: id } })
  for (const b of orklaBoard) {
    await prisma.boardMember.create({ data: { companyId: id, personName: b.personName, role: b.role, personKey: normalizePersonKey(b.personName) } })
    console.log(`  ${b.personName} (${b.role})`)
  }
}

async function importFinancials() {
  console.log('\nImporting Orkla 2024 financials...\n')
  let imported = 0
  const data = orklaCompanies.filter(c => c.revenue2024).map(c => ({
    orgNr: c.orgNr, name: c.name, year: 2024,
    revenueNok: c.revenue2024! * 1_000_000,
    operatingResult: (c.operatingResult2024 ?? 0) * 1_000_000,
    operatingMargin: c.operatingResult2024 && c.revenue2024 ? Math.round((c.operatingResult2024 / c.revenue2024) * 10000) / 100 : undefined,
    groupEmployees: c.employees,
  }))
  data.push({ orgNr: ORKLA_ORG, name: 'Orkla ASA', year: 2024, revenueNok: 292_000_000, operatingResult: -902_000_000, operatingMargin: undefined, groupEmployees: 81 })
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
  console.log('\nImporting Orkla ownership tree...\n')
  let imported = 0
  for (const link of ownershipLinks) {
    const parentId = await resolveCompanyId(link.parentOrgNr)
    const childId = await resolveCompanyId(link.childOrgNr)
    if (!parentId || !childId) continue
    await prisma.companyOwnership.upsert({
      where: { parentCompanyId_childCompanyId: { parentCompanyId: parentId, childCompanyId: childId } },
      update: { ownershipPct: link.ownershipPct, ownershipType: link.ownershipType, source: 'Broennoysundregistrene / Orkla aarsrapport 2024' },
      create: { parentCompanyId: parentId, childCompanyId: childId, ownershipPct: link.ownershipPct, ownershipType: link.ownershipType, source: 'Broennoysundregistrene / Orkla aarsrapport 2024' },
    })
    console.log(`  ${link.parentOrgNr} -> ${link.childOrgNr} (${link.ownershipPct}%)`)
    imported++
  }
  console.log(`\n${imported} ownership records imported`)
}

async function importPersonProfiles() {
  console.log('\nImporting Orkla key person profiles...\n')
  const persons = [
    {
      name: 'Stein Erik Hagen',
      personKey: normalizePersonKey('Stein Erik Hagen'),
      biography: 'Styreleder i Orkla ASA. Kontrollerer ~25.1% via Canica AS. Grunnla Rimi-kjeden (solgt til ICA). Norges tredje rikeste person. Sentral maktfigur i norsk naeringsmiddel- og dagligvareindustri.',
      roles: [
        { companyName: 'Orkla ASA', role: 'Styreleder', fromYear: 2014 },
        { companyName: 'Canica AS', role: 'Eier/kontrollerende aksjonaer', fromYear: 2000 },
      ],
      tags: ['orkla', 'styreleder', 'maktkonsentrasjon', 'milliardaer'],
    },
    {
      name: 'Nils Selte',
      personKey: normalizePersonKey('Nils Selte'),
      biography: 'CEO av Orkla ASA. Tidligere CFO. Leder konsernets transformasjon fra konglomerat til rendyrket merkevareselskap. 86B NOK i forvaltningskapital.',
      roles: [
        { companyName: 'Orkla ASA', role: 'CEO (Daglig leder)', fromYear: 2023 },
      ],
      tags: ['orkla', 'ceo'],
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
  console.log('=== Orkla Corporate Tree ===\n')
  await importCompanies()
  await updateOrklaBoard()
  await importFinancials()
  await importOwnership()
  await importPersonProfiles()
  console.log('\n=== Orkla Summary ===')
  console.log('Total companies:', await prisma.company.count())
  console.log('Ownership records:', await prisma.companyOwnership.count())
}

main().catch(e => { console.error('Orkla import failed:', e); process.exit(1) }).finally(() => prisma.$disconnect())
