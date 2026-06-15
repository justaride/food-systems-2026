import 'dotenv/config'
import { canonicalPersonKey as normalizePersonKey } from '../src/lib/person-key'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const NORTURA_ORG = '938752648'

type NorturaCompany = {
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

const norturaCompanies: NorturaCompany[] = [
  {
    name: 'Norilia AS',
    orgNr: '995643316',
    legalForm: 'AS',
    founded: 2010,
    naceCode: '10.110',
    naceDescription: 'Bearbeiding og konservering av kjoett',
    hqAddress: 'Schweigaards gate 15',
    hqCity: 'Oslo',
    employees: 56,
    ownershipType: 'cooperative',
    valueChainStage: 'processing',
    revenue2024: 403,
    operatingResult2024: 23,
    totalAssets2024: 162,
  },
  {
    name: 'Norfersk AS',
    orgNr: '997754123',
    legalForm: 'AS',
    founded: 2011,
    naceCode: '10.130',
    naceDescription: 'Produksjon av kjoett- og fjoerfevarer',
    hqAddress: 'Sloraveien 60',
    hqCity: 'Haerland',
    employees: 115,
    ownershipType: 'cooperative',
    valueChainStage: 'processing',
    revenue2024: 2125,
    operatingResult2024: 51,
    totalAssets2024: 278,
  },
  {
    name: 'Prima Slakt AS',
    orgNr: '885209432',
    legalForm: 'AS',
    founded: 2002,
    naceCode: '10.110',
    naceDescription: 'Bearbeiding og konservering av kjoett',
    hqAddress: 'Naeringsvegen 27',
    hqCity: 'Naerbo',
    employees: 5,
    ownershipType: 'cooperative',
    valueChainStage: 'processing',
    revenue2024: 689,
    operatingResult2024: 18,
    totalAssets2024: 56,
  },
  {
    name: 'Norsk Dyremat AS',
    orgNr: '962977006',
    legalForm: 'AS',
    founded: 1991,
    naceCode: '10.920',
    naceDescription: 'Produksjon av forvarer til kjaeledyr',
    hqAddress: 'Nylund 30',
    hqCity: 'Sirevag',
    employees: 69,
    ownershipType: 'cooperative',
    valueChainStage: 'processing',
    revenue2024: 401,
    operatingResult2024: 30,
    totalAssets2024: 105,
  },
  {
    name: 'Biosirk Norge AS',
    orgNr: '921042434',
    legalForm: 'AS',
    founded: 1968,
    naceCode: '10.910',
    naceDescription: 'Produksjon av forvarer til husdyrhold',
    hqAddress: 'Smiuhagan 25',
    hqCity: 'Hamar',
    employees: 88,
    ownershipType: 'cooperative',
    valueChainStage: 'processing',
    revenue2024: 539,
    operatingResult2024: 34,
    totalAssets2024: 260,
  },
  {
    name: 'Fjordkjoekken AS',
    orgNr: '976502744',
    legalForm: 'AS',
    founded: 1996,
    naceCode: '10.850',
    naceDescription: 'Produksjon av ferdigmat',
    hqAddress: 'Djuphodl 2',
    hqCity: 'Varhaug',
    employees: 188,
    ownershipType: 'cooperative',
    valueChainStage: 'processing',
    revenue2024: 672,
    operatingResult2024: 32,
    totalAssets2024: 327,
  },
  {
    name: 'Animalia AS',
    orgNr: '919117060',
    legalForm: 'AS',
    founded: 2017,
    naceCode: '01.620',
    naceDescription: 'Tjenester tilknyttet husdyrhold',
    hqAddress: 'Lorenveien 38',
    hqCity: 'Oslo',
    employees: 90,
    ownershipType: 'cooperative',
    valueChainStage: 'research',
    revenue2024: 185,
    operatingResult2024: 2,
    totalAssets2024: 52,
  },
  {
    name: 'Noridane Foods AS',
    orgNr: '992318899',
    legalForm: 'AS',
    founded: 2008,
    naceCode: '46.320',
    naceDescription: 'Engroshandel med kjoett og kjoettvarer',
    hqAddress: 'Schweigaards gate 15',
    hqCity: 'Oslo',
    employees: 6,
    ownershipType: 'cooperative',
    valueChainStage: 'processing',
    revenue2024: 462,
    operatingResult2024: 22,
    totalAssets2024: 188,
  },
  {
    name: 'Fjordland AS',
    orgNr: '936661386',
    legalForm: 'AS',
    founded: 1984,
    naceCode: '46.390',
    naceDescription: 'Engroshandel med bredt utvalg av naerings- og nytelsesmidler',
    hqAddress: 'Brynsengveien 10',
    hqCity: 'Oslo',
    employees: 76,
    ownershipType: 'cooperative',
    valueChainStage: 'processing',
    revenue2024: 2084,
    operatingResult2024: 114,
    totalAssets2024: 526,
    boardMembers: [
      { personName: 'Merete Simonsen', role: 'styreleder' },
      { personName: 'Ken Are Ostlid', role: 'styremedlem' },
      { personName: 'Inger-Lene Saetra', role: 'styremedlem' },
      { personName: 'Mathilde Lyngvaer', role: 'styremedlem' },
      { personName: 'Siri Bjorkum', role: 'styremedlem' },
    ],
  },
  {
    name: 'Telespor AS',
    orgNr: '987390689',
    legalForm: 'AS',
    founded: 2004,
    naceCode: '46.610',
    naceDescription: 'Engroshandel med maskiner/utstyr til jordbruk',
    hqAddress: 'Bleikerveien 17',
    hqCity: 'Asker',
    employees: 9,
    ownershipType: 'cooperative',
    valueChainStage: 'inputs',
    revenue2024: 45,
    operatingResult2024: 4,
    totalAssets2024: 12,
  },
  {
    name: 'NorPri AS',
    orgNr: '913755855',
    legalForm: 'AS',
    founded: 2014,
    naceCode: '10.110',
    naceDescription: 'Bearbeiding og konservering av kjoett',
    hqAddress: 'Naeringsvegen 27',
    hqCity: 'Naerbo',
    employees: 69,
    ownershipType: 'cooperative',
    valueChainStage: 'processing',
    revenue2024: 180,
    operatingResult2024: 11,
    totalAssets2024: 55,
  },
]

const norturaBoard = [
  { personName: 'Johan Narum', role: 'styreleder' },
  { personName: 'Merethe Sund', role: 'styremedlem' },
  { personName: 'Kenneth Rene Johansen', role: 'styremedlem' },
  { personName: 'Ken Ove Sletthaug', role: 'styremedlem' },
  { personName: 'Erlend Ronning', role: 'styremedlem' },
  { personName: 'Hans Amund Braastad', role: 'styremedlem' },
  { personName: 'Linda Myren', role: 'styremedlem' },
  { personName: 'Ole Johannes Egeland', role: 'styremedlem' },
  { personName: 'Live Major', role: 'styremedlem' },
  { personName: 'Einar Meisfjord', role: 'styremedlem' },
  { personName: 'Ann Kristin Nes', role: 'styremedlem' },
  { personName: 'Ragnhild Sjurgard', role: 'styremedlem' },
  { personName: 'Irene Aastveit', role: 'styremedlem' },
  { personName: 'Martin Maeland', role: 'styremedlem' },
]

type OwnershipLink = { parentOrgNr: string; childOrgNr: string; ownershipPct: number | null; ownershipType: string }

const ownershipLinks: OwnershipLink[] = [
  { parentOrgNr: NORTURA_ORG, childOrgNr: '995643316', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: NORTURA_ORG, childOrgNr: '997754123', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: NORTURA_ORG, childOrgNr: '885209432', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: NORTURA_ORG, childOrgNr: '962977006', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: NORTURA_ORG, childOrgNr: '987390689', ownershipPct: 99.7, ownershipType: 'subsidiary' },
  { parentOrgNr: NORTURA_ORG, childOrgNr: '921042434', ownershipPct: 67, ownershipType: 'subsidiary' },
  { parentOrgNr: NORTURA_ORG, childOrgNr: '919117060', ownershipPct: 66, ownershipType: 'subsidiary' },
  { parentOrgNr: NORTURA_ORG, childOrgNr: '992318899', ownershipPct: 65, ownershipType: 'subsidiary' },
  { parentOrgNr: NORTURA_ORG, childOrgNr: '976502744', ownershipPct: 56.5, ownershipType: 'subsidiary' },
  { parentOrgNr: NORTURA_ORG, childOrgNr: '913755855', ownershipPct: 49, ownershipType: 'minority-stake' },
  { parentOrgNr: NORTURA_ORG, childOrgNr: '936661386', ownershipPct: 38.9, ownershipType: 'minority-stake' },
]

async function resolveCompanyId(orgNr: string): Promise<string | null> {
  const c = await prisma.company.findUnique({ where: { orgNr }, select: { id: true } })
  return c?.id ?? null
}

async function importCompanies() {
  console.log('Importing Nortura subsidiaries...\n')
  let created = 0
  for (const c of norturaCompanies) {
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
  console.log(`\n${created} Nortura companies imported`)
}

async function updateNorturaBoard() {
  console.log('\nUpdating Nortura SA board...\n')
  const id = await resolveCompanyId(NORTURA_ORG)
  if (!id) return
  await prisma.boardMember.deleteMany({ where: { companyId: id } })
  for (const b of norturaBoard) {
    await prisma.boardMember.create({ data: { companyId: id, personName: b.personName, role: b.role, personKey: normalizePersonKey(b.personName) } })
    console.log(`  ${b.personName} (${b.role})`)
  }
}

async function importFinancials() {
  console.log('\nImporting Nortura 2024 financials...\n')
  let imported = 0
  const data = norturaCompanies.filter(c => c.revenue2024).map(c => ({
    orgNr: c.orgNr, name: c.name, year: 2024,
    revenueNok: c.revenue2024! * 1_000_000,
    operatingResult: (c.operatingResult2024 ?? 0) * 1_000_000,
    operatingMargin: c.operatingResult2024 && c.revenue2024 ? Math.round((c.operatingResult2024 / c.revenue2024) * 10000) / 100 : undefined,
    groupEmployees: c.employees,
  }))
  data.push({ orgNr: NORTURA_ORG, name: 'Nortura SA', year: 2024, revenueNok: 23_881_000_000, operatingResult: -101_000_000, operatingMargin: -0.42, groupEmployees: 4127 })
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
  console.log('\nImporting Nortura ownership tree...\n')
  let imported = 0
  for (const link of ownershipLinks) {
    const parentId = await resolveCompanyId(link.parentOrgNr)
    const childId = await resolveCompanyId(link.childOrgNr)
    if (!parentId || !childId) continue
    await prisma.companyOwnership.upsert({
      where: { parentCompanyId_childCompanyId: { parentCompanyId: parentId, childCompanyId: childId } },
      update: { ownershipPct: link.ownershipPct, ownershipType: link.ownershipType, source: 'Broennoysundregistrene / Nortura aarsrapport 2024' },
      create: { parentCompanyId: parentId, childCompanyId: childId, ownershipPct: link.ownershipPct, ownershipType: link.ownershipType, source: 'Broennoysundregistrene / Nortura aarsrapport 2024' },
    })
    console.log(`  Nortura -> ${link.childOrgNr} (${link.ownershipPct}%)`)
    imported++
  }
  console.log(`\n${imported} ownership records imported`)
}

async function main() {
  console.log('=== Nortura Corporate Tree ===\n')
  await importCompanies()
  await updateNorturaBoard()
  await importFinancials()
  await importOwnership()
  console.log('\n=== Nortura Summary ===')
  console.log('Total companies:', await prisma.company.count())
  console.log('Ownership records:', await prisma.companyOwnership.count())
}

main().catch(e => { console.error('Nortura import failed:', e); process.exit(1) }).finally(() => prisma.$disconnect())
