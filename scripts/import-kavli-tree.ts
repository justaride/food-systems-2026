import 'dotenv/config'
import { canonicalPersonKey as normalizePersonKey } from '../src/lib/person-key'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const KAVLI_HOLDING_ORG = '913344162'

type KavliCompany = {
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

const kavliCompanies: KavliCompany[] = [
  {
    name: 'Kavli Norge AS',
    orgNr: '985461791',
    legalForm: 'AS',
    founded: 2003,
    naceCode: '10.510',
    naceDescription: 'Produksjon av meierivarer',
    hqAddress: 'Sandbrekkevegen 91',
    hqCity: 'Nesttun',
    ownershipType: 'foundation',
    valueChainStage: 'processing',
  },
  {
    name: 'O Kavli AS',
    orgNr: '971142138',
    legalForm: 'AS',
    founded: 1893,
    naceCode: '10.510',
    naceDescription: 'Produksjon av meierivarer',
    hqAddress: 'Sandbrekkevegen 91',
    hqCity: 'Nesttun',
    employees: 157,
    ownershipType: 'foundation',
    valueChainStage: 'processing',
    revenue2024: 850,
    operatingResult2024: 68,
  },
  {
    name: 'Q-Meieriene AS',
    orgNr: '982423767',
    legalForm: 'AS',
    founded: 2000,
    naceCode: '10.510',
    naceDescription: 'Produksjon av meierivarer',
    hqAddress: 'Sandbrekkevegen 91',
    hqCity: 'Nesttun',
    employees: 320,
    ownershipType: 'foundation',
    valueChainStage: 'processing',
    revenue2024: 2000,
    operatingResult2024: 160,
  },
]

const kavliBoard = [
  { personName: 'Finn Jebsen', role: 'styreleder' },
  { personName: 'Helge Leiro Baastad', role: 'styremedlem' },
  { personName: 'Ulrika Dellby', role: 'styremedlem' },
  { personName: 'Lise Hammergren', role: 'styremedlem' },
  { personName: 'Rannveig B. Krane', role: 'styremedlem' },
  { personName: 'Frank Mohn', role: 'styremedlem' },
  { personName: 'Dag J. Opedal', role: 'styremedlem' },
  { personName: 'Eli Kverneland', role: 'ansatterepresentant' },
  { personName: 'Oeyvind Ramm', role: 'ansatterepresentant' },
]

type OwnershipLink = { parentOrgNr: string; childOrgNr: string; ownershipPct: number | null; ownershipType: string }

const ownershipLinks: OwnershipLink[] = [
  { parentOrgNr: KAVLI_HOLDING_ORG, childOrgNr: '985461791', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: '985461791', childOrgNr: '971142138', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: '985461791', childOrgNr: '982423767', ownershipPct: 100, ownershipType: 'subsidiary' },
]

async function resolveCompanyId(orgNr: string): Promise<string | null> {
  const c = await prisma.company.findUnique({ where: { orgNr }, select: { id: true } })
  return c?.id ?? null
}

async function importCompanies() {
  console.log('Importing Kavli subsidiaries...\n')
  let created = 0
  for (const c of kavliCompanies) {
    await prisma.company.upsert({
      where: { orgNr: c.orgNr },
      update: { name: c.name, legalForm: c.legalForm, founded: c.founded, naceCode: c.naceCode, naceDescription: c.naceDescription, hqAddress: c.hqAddress, hqCity: c.hqCity, employees: c.employees, ownershipType: c.ownershipType, valueChainStage: c.valueChainStage },
      create: { name: c.name, orgNr: c.orgNr, legalForm: c.legalForm, founded: c.founded, naceCode: c.naceCode, naceDescription: c.naceDescription, hqAddress: c.hqAddress, hqCity: c.hqCity, employees: c.employees, ownershipType: c.ownershipType, valueChainStage: c.valueChainStage },
    })
    const rev = c.revenue2024 ? ` — ${(c.revenue2024 / 1000).toFixed(1)}B NOK` : ''
    console.log(`  ${c.name} (${c.orgNr}${rev})`)
    created++
  }
  console.log(`\n${created} Kavli companies imported`)
}

async function updateKavliBoard() {
  console.log('\nUpdating Kavli Holding AS board...\n')
  const id = await resolveCompanyId(KAVLI_HOLDING_ORG)
  if (!id) return
  await prisma.boardMember.deleteMany({ where: { companyId: id } })
  for (const b of kavliBoard) {
    await prisma.boardMember.create({ data: { companyId: id, personName: b.personName, role: b.role, personKey: normalizePersonKey(b.personName) } })
    console.log(`  ${b.personName} (${b.role})`)
  }
}

async function importFinancials() {
  console.log('\nImporting Kavli 2024 financials...\n')
  let imported = 0
  const data = kavliCompanies.filter(c => c.revenue2024).map(c => ({
    orgNr: c.orgNr, name: c.name, year: 2024,
    revenueNok: c.revenue2024! * 1_000_000,
    operatingResult: (c.operatingResult2024 ?? 0) * 1_000_000,
    operatingMargin: c.operatingResult2024 && c.revenue2024 ? Math.round((c.operatingResult2024 / c.revenue2024) * 10000) / 100 : undefined,
    groupEmployees: c.employees,
  }))
  data.push({ orgNr: KAVLI_HOLDING_ORG, name: 'Kavli Holding AS', year: 2024, revenueNok: 3_500_000_000, operatingResult: 280_000_000, operatingMargin: 8.0, groupEmployees: 489 })
  for (const f of data) {
    const companyId = await resolveCompanyId(f.orgNr)
    if (!companyId) continue
    await prisma.companyFinancial.upsert({
      where: { companyId_year: { companyId, year: f.year } },
      update: { revenueNok: f.revenueNok, operatingResult: f.operatingResult, operatingMargin: f.operatingMargin, groupEmployees: f.groupEmployees, source: 'Kavli Holding / Q-Meieriene aarsrapport 2024 / web research 2026-03' },
      create: { companyId, year: f.year, revenueNok: f.revenueNok, operatingResult: f.operatingResult, operatingMargin: f.operatingMargin, groupEmployees: f.groupEmployees, source: 'Kavli Holding / Q-Meieriene aarsrapport 2024 / web research 2026-03' },
    })
    console.log(`  ${f.name}: ${(f.revenueNok / 1e9).toFixed(1)}B NOK`)
    imported++
  }
  console.log(`\n${imported} financial records imported`)
}

async function importOwnership() {
  console.log('\nImporting Kavli ownership tree...\n')
  console.log('  O. Kavli og Knut Kavlis Fond -> Kavli Holding 100% -> Kavli Norge -> O Kavli + Q-Meieriene\n')
  let imported = 0
  for (const link of ownershipLinks) {
    const parentId = await resolveCompanyId(link.parentOrgNr)
    const childId = await resolveCompanyId(link.childOrgNr)
    if (!parentId || !childId) continue
    await prisma.companyOwnership.upsert({
      where: { parentCompanyId_childCompanyId: { parentCompanyId: parentId, childCompanyId: childId } },
      update: { ownershipPct: link.ownershipPct, ownershipType: link.ownershipType, source: 'Kavli Holding / Broennoysund 2024' },
      create: { parentCompanyId: parentId, childCompanyId: childId, ownershipPct: link.ownershipPct, ownershipType: link.ownershipType, source: 'Kavli Holding / Broennoysund 2024' },
    })
    console.log(`  ${link.parentOrgNr} -> ${link.childOrgNr} (${link.ownershipPct}%)`)
    imported++
  }
  console.log(`\n${imported} ownership records imported`)
}

async function importPersonProfiles() {
  console.log('\nImporting Kavli key person profiles...\n')
  const persons = [
    {
      name: 'Finn Jebsen',
      personKey: normalizePersonKey('Finn Jebsen'),
      biography: 'Styreleder i Kavli Holding AS. Tidligere konserndirektør i Orkla ASA (2001-2012). Erfaren industristyreleder med bred erfaring fra norsk naeringsliv.',
      roles: [
        { companyName: 'Kavli Holding AS', role: 'Styreleder', fromYear: 2015 },
      ],
      tags: ['kavli', 'styreleder', 'orkla'],
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
  console.log('=== Kavli Holding Corporate Tree ===\n')
  console.log('Owner: O. Kavli og Knut Kavlis allmennyttige fond (stiftelse)\n')
  await importCompanies()
  await updateKavliBoard()
  await importFinancials()
  await importOwnership()
  await importPersonProfiles()
  console.log('\n=== Kavli Summary ===')
  console.log('Total companies:', await prisma.company.count())
  console.log('Ownership records:', await prisma.companyOwnership.count())
}

main().catch(e => { console.error('Kavli import failed:', e); process.exit(1) }).finally(() => prisma.$disconnect())
