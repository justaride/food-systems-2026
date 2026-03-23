import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

function normalizePersonKey(name: string): string {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z ]/g, '').trim().replace(/\s+/g, '-')
}

const TINE_ORG = '947942638'

type TineCompany = {
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

const tineCompanies: TineCompany[] = [
  {
    name: 'Diplom-Is AS',
    orgNr: '984460198',
    legalForm: 'AS',
    founded: 2002,
    naceCode: '10.520',
    naceDescription: 'Produksjon av iskrem',
    hqAddress: 'Brennaveien 10',
    hqCity: 'Hagan',
    employees: 538,
    ownershipType: 'cooperative',
    valueChainStage: 'processing',
    revenue2024: 1272,
    operatingResult2024: -13,
    totalAssets2024: 887,
    boardMembers: [
      { personName: 'Kristin Moeller', role: 'styreleder' },
      { personName: 'Terje Kristoffersen', role: 'styremedlem' },
      { personName: 'Tone Margrethe Haakedal', role: 'styremedlem' },
      { personName: 'Marte Grotan', role: 'styremedlem' },
      { personName: 'Julien Jose Kerob', role: 'styremedlem' },
    ],
  },
  {
    name: 'Mimiro Holding AS',
    orgNr: '821186382',
    legalForm: 'AS',
    founded: 2018,
    naceCode: '63.110',
    naceDescription: 'Databehandling, datalagring og tilknyttede tjenester',
    hqAddress: 'Raveien 2',
    hqCity: 'Aas',
    ownershipType: 'cooperative',
    valueChainStage: 'inputs',
    revenue2024: 10,
    operatingResult2024: 10,
    totalAssets2024: 209,
  },
  {
    name: 'Kukraft AS',
    orgNr: '921761929',
    legalForm: 'AS',
    founded: 2018,
    naceCode: '35.113',
    naceDescription: 'Produksjon av elektrisitet fra biobrensel',
    hqAddress: 'Lakkegata 23',
    hqCity: 'Oslo',
    ownershipType: 'cooperative',
    valueChainStage: 'inputs',
  },
]

const tineBoard = [
  { personName: 'Rolf Oeyvind Thune', role: 'styreleder' },
  { personName: 'Asgeir Pollestad', role: 'styremedlem' },
  { personName: 'Elin Johanne Aarvik', role: 'styremedlem' },
  { personName: 'Tor Arne Johansen', role: 'styremedlem' },
  { personName: 'Anne Berit Loeset', role: 'styremedlem' },
  { personName: 'Hans Olav Minsaas', role: 'styremedlem' },
  { personName: 'Ingunn Helene Ruud', role: 'styremedlem' },
  { personName: 'Lise Skreddernes', role: 'styremedlem' },
  { personName: 'Anne Polden', role: 'styremedlem' },
  { personName: 'Arthur Salte', role: 'styremedlem' },
  { personName: 'Kaare Ivar Stormoen', role: 'styremedlem' },
]

type OwnershipLink = { parentOrgNr: string; childOrgNr: string; ownershipPct: number | null; ownershipType: string }

const ownershipLinks: OwnershipLink[] = [
  { parentOrgNr: TINE_ORG, childOrgNr: '984460198', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: TINE_ORG, childOrgNr: '921761929', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: TINE_ORG, childOrgNr: '821186382', ownershipPct: 56.6, ownershipType: 'subsidiary' },
  { parentOrgNr: TINE_ORG, childOrgNr: '936661386', ownershipPct: 51.1, ownershipType: 'subsidiary' },
]

async function resolveCompanyId(orgNr: string): Promise<string | null> {
  const c = await prisma.company.findUnique({ where: { orgNr }, select: { id: true } })
  return c?.id ?? null
}

async function importCompanies() {
  console.log('Importing TINE subsidiaries...\n')
  let created = 0
  for (const c of tineCompanies) {
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
  console.log(`\n${created} TINE companies imported`)
}

async function updateTineBoard() {
  console.log('\nUpdating TINE SA board...\n')
  const id = await resolveCompanyId(TINE_ORG)
  if (!id) return
  await prisma.boardMember.deleteMany({ where: { companyId: id } })
  for (const b of tineBoard) {
    await prisma.boardMember.create({ data: { companyId: id, personName: b.personName, role: b.role, personKey: normalizePersonKey(b.personName) } })
    console.log(`  ${b.personName} (${b.role})`)
  }
}

async function importFinancials() {
  console.log('\nImporting TINE 2024 financials...\n')
  let imported = 0
  const data = tineCompanies.filter(c => c.revenue2024 && c.revenue2024 > 5).map(c => ({
    orgNr: c.orgNr, name: c.name, year: 2024,
    revenueNok: c.revenue2024! * 1_000_000,
    operatingResult: (c.operatingResult2024 ?? 0) * 1_000_000,
    operatingMargin: c.operatingResult2024 && c.revenue2024 ? Math.round((c.operatingResult2024 / c.revenue2024) * 10000) / 100 : undefined,
    groupEmployees: c.employees,
  }))
  data.push({ orgNr: TINE_ORG, name: 'TINE SA', year: 2024, revenueNok: 22_642_000_000, operatingResult: 1_908_000_000, operatingMargin: 8.43, groupEmployees: 4588 })
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
  console.log('\nImporting TINE ownership tree...\n')
  let imported = 0
  for (const link of ownershipLinks) {
    const parentId = await resolveCompanyId(link.parentOrgNr)
    const childId = await resolveCompanyId(link.childOrgNr)
    if (!parentId || !childId) continue
    await prisma.companyOwnership.upsert({
      where: { parentCompanyId_childCompanyId: { parentCompanyId: parentId, childCompanyId: childId } },
      update: { ownershipPct: link.ownershipPct, ownershipType: link.ownershipType, source: 'Broennoysundregistrene / TINE aarsrapport 2024' },
      create: { parentCompanyId: parentId, childCompanyId: childId, ownershipPct: link.ownershipPct, ownershipType: link.ownershipType, source: 'Broennoysundregistrene / TINE aarsrapport 2024' },
    })
    console.log(`  TINE -> ${link.childOrgNr} (${link.ownershipPct}%)`)
    imported++
  }
  console.log(`\n${imported} ownership records imported`)
}

async function main() {
  console.log('=== TINE Corporate Tree ===\n')
  await importCompanies()
  await updateTineBoard()
  await importFinancials()
  await importOwnership()
  console.log('\n=== TINE Summary ===')
  console.log('Total companies:', await prisma.company.count())
  console.log('Ownership records:', await prisma.companyOwnership.count())
}

main().catch(e => { console.error('TINE import failed:', e); process.exit(1) }).finally(() => prisma.$disconnect())
