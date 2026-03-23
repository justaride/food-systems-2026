import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

function normalizePersonKey(name: string): string {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z ]/g, '').trim().replace(/\s+/g, '-')
}

const MOWI_ORG = '964118191'

type MowiCompany = {
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

const mowiCompanies: MowiCompany[] = [
  {
    name: 'Mowi Seawater Norway AS',
    orgNr: '921668236',
    legalForm: 'AS',
    founded: 2018,
    naceCode: '03.211',
    naceDescription: 'Produksjon av fisk i sjoevann og brakkvann',
    hqAddress: 'Sandviksbodene 77A',
    hqCity: 'Bergen',
    employees: 2800,
    ownershipType: 'listed',
    valueChainStage: 'seafood',
  },
  {
    name: 'Mowi Markets Norway AS',
    orgNr: '916146337',
    legalForm: 'AS',
    founded: 2016,
    naceCode: '03.211',
    naceDescription: 'Produksjon av fisk i sjoevann og brakkvann',
    hqAddress: 'Sandviksbodene 77A',
    hqCity: 'Bergen',
    employees: 450,
    ownershipType: 'listed',
    valueChainStage: 'seafood',
  },
  {
    name: 'Mowi Feed AS',
    orgNr: '911610744',
    legalForm: 'AS',
    founded: 2013,
    naceCode: '10.920',
    naceDescription: 'Produksjon av forvarer til kjaeledy og fisk',
    hqAddress: 'Sandviksbodene 78A',
    hqCity: 'Bergen',
    employees: 320,
    ownershipType: 'listed',
    valueChainStage: 'inputs',
    revenue2024: 8500,
    operatingResult2024: 680,
    totalAssets2024: 5200,
  },
  {
    name: 'Mowi Norway FoU AS',
    orgNr: '919441879',
    legalForm: 'AS',
    founded: 2017,
    naceCode: '72.190',
    naceDescription: 'Annen forskning og annet utviklingsarbeid',
    hqAddress: 'Sandviksbodene 77A',
    hqCity: 'Bergen',
    employees: 45,
    ownershipType: 'listed',
    valueChainStage: 'research',
  },
]

const mowiBoard = [
  { personName: 'Oerjan Svanevik', role: 'styreleder' },
  { personName: 'Kathrine Fredriksen', role: 'styremedlem' },
  { personName: 'Peder Strand', role: 'styremedlem' },
  { personName: 'Kjersti Hoeboel', role: 'styremedlem' },
  { personName: 'Leif Teksum', role: 'styremedlem' },
  { personName: 'Kristian Mellerud', role: 'styremedlem' },
  { personName: 'Cecilie Fredriksen', role: 'styremedlem' },
]

type OwnershipLink = { parentOrgNr: string; childOrgNr: string; ownershipPct: number | null; ownershipType: string }

const ownershipLinks: OwnershipLink[] = [
  { parentOrgNr: MOWI_ORG, childOrgNr: '921668236', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: MOWI_ORG, childOrgNr: '916146337', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: MOWI_ORG, childOrgNr: '911610744', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: MOWI_ORG, childOrgNr: '919441879', ownershipPct: 100, ownershipType: 'subsidiary' },
]

async function resolveCompanyId(orgNr: string): Promise<string | null> {
  const c = await prisma.company.findUnique({ where: { orgNr }, select: { id: true } })
  return c?.id ?? null
}

async function importCompanies() {
  console.log('Importing Mowi subsidiaries...\n')
  let created = 0
  for (const c of mowiCompanies) {
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
  console.log(`\n${created} Mowi companies imported`)
}

async function updateMowiBoard() {
  console.log('\nUpdating Mowi ASA board...\n')
  const id = await resolveCompanyId(MOWI_ORG)
  if (!id) return
  await prisma.boardMember.deleteMany({ where: { companyId: id } })
  for (const b of mowiBoard) {
    await prisma.boardMember.create({ data: { companyId: id, personName: b.personName, role: b.role, personKey: normalizePersonKey(b.personName) } })
    console.log(`  ${b.personName} (${b.role})`)
  }
}

async function importFinancials() {
  console.log('\nImporting Mowi 2024 financials...\n')
  let imported = 0
  const data = mowiCompanies.filter(c => c.revenue2024).map(c => ({
    orgNr: c.orgNr, name: c.name, year: 2024,
    revenueNok: c.revenue2024! * 1_000_000,
    operatingResult: (c.operatingResult2024 ?? 0) * 1_000_000,
    operatingMargin: c.operatingResult2024 && c.revenue2024 ? Math.round((c.operatingResult2024 / c.revenue2024) * 10000) / 100 : undefined,
    groupEmployees: c.employees,
  }))
  data.push({ orgNr: MOWI_ORG, name: 'Mowi ASA', year: 2024, revenueNok: 62_900_000_000, operatingResult: 9_300_000_000, operatingMargin: 14.78, groupEmployees: 12500 })
  for (const f of data) {
    const companyId = await resolveCompanyId(f.orgNr)
    if (!companyId) continue
    await prisma.companyFinancial.upsert({
      where: { companyId_year: { companyId, year: f.year } },
      update: { revenueNok: f.revenueNok, operatingResult: f.operatingResult, operatingMargin: f.operatingMargin, groupEmployees: f.groupEmployees, source: 'Mowi Annual Report 2024 / web research 2026-03' },
      create: { companyId, year: f.year, revenueNok: f.revenueNok, operatingResult: f.operatingResult, operatingMargin: f.operatingMargin, groupEmployees: f.groupEmployees, source: 'Mowi Annual Report 2024 / web research 2026-03' },
    })
    console.log(`  ${f.name}: ${(f.revenueNok / 1e9).toFixed(1)}B NOK`)
    imported++
  }
  console.log(`\n${imported} financial records imported`)
}

async function importOwnership() {
  console.log('\nImporting Mowi ownership tree...\n')
  let imported = 0
  for (const link of ownershipLinks) {
    const parentId = await resolveCompanyId(link.parentOrgNr)
    const childId = await resolveCompanyId(link.childOrgNr)
    if (!parentId || !childId) continue
    await prisma.companyOwnership.upsert({
      where: { parentCompanyId_childCompanyId: { parentCompanyId: parentId, childCompanyId: childId } },
      update: { ownershipPct: link.ownershipPct, ownershipType: link.ownershipType, source: 'Mowi Annual Report 2024' },
      create: { parentCompanyId: parentId, childCompanyId: childId, ownershipPct: link.ownershipPct, ownershipType: link.ownershipType, source: 'Mowi Annual Report 2024' },
    })
    console.log(`  Mowi -> ${link.childOrgNr} (${link.ownershipPct}%)`)
    imported++
  }
  console.log(`\n${imported} ownership records imported`)
}

async function importPersonProfiles() {
  console.log('\nImporting Mowi key person profiles...\n')
  const persons = [
    {
      name: 'Ivan Vindheim',
      personKey: normalizePersonKey('Ivan Vindheim'),
      biography: 'CEO av Mowi ASA (62.9B NOK, verdens stoerste lakseoppdrettsselskap). Utnevnt i november 2019. Tidligere CFO i selskapet.',
      roles: [
        { companyName: 'Mowi ASA', role: 'CEO (Daglig leder)', fromYear: 2019 },
      ],
      tags: ['mowi', 'ceo', 'laks', 'sjoemat'],
    },
    {
      name: 'Oerjan Svanevik',
      personKey: normalizePersonKey('Oerjan Svanevik'),
      biography: 'Styreleder i Mowi ASA fra november 2024. Investeringsdirektør i Seatankers (Fredriksen). Tidligere CEO i Arendals Fossekompani, Head of M&A i Aker, COO i Kvaerner.',
      roles: [
        { companyName: 'Mowi ASA', role: 'Styreleder', fromYear: 2024 },
      ],
      tags: ['mowi', 'styreleder', 'fredriksen', 'seatankers'],
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
  console.log('=== Mowi Corporate Tree ===\n')
  await importCompanies()
  await updateMowiBoard()
  await importFinancials()
  await importOwnership()
  await importPersonProfiles()
  console.log('\n=== Mowi Summary ===')
  console.log('Total companies:', await prisma.company.count())
  console.log('Ownership records:', await prisma.companyOwnership.count())
}

main().catch(e => { console.error('Mowi import failed:', e); process.exit(1) }).finally(() => prisma.$disconnect())
