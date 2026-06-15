import 'dotenv/config'
import { canonicalPersonKey as normalizePersonKey } from '../src/lib/person-key'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const SALMAR_ORG = '960514718'

type SalMarCompany = {
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

const salmarCompanies: SalMarCompany[] = [
  {
    name: 'SalMar Farming AS',
    orgNr: '966840528',
    legalForm: 'AS',
    founded: 1991,
    naceCode: '03.211',
    naceDescription: 'Produksjon av fisk i sjoevann og brakkvann',
    hqAddress: 'Industriveien 51',
    hqCity: 'Kverva',
    employees: 1800,
    ownershipType: 'listed',
    valueChainStage: 'seafood',
  },
  {
    name: 'SalmoNor AS',
    orgNr: '952662813',
    legalForm: 'AS',
    founded: 1989,
    naceCode: '03.211',
    naceDescription: 'Produksjon av fisk i sjoevann og brakkvann',
    hqCity: 'Roervik',
    employees: 350,
    ownershipType: 'listed',
    valueChainStage: 'seafood',
    revenue2024: 3200,
    operatingResult2024: 640,
    totalAssets2024: 4500,
  },
  {
    name: 'Kverva AS',
    orgNr: '919818824',
    legalForm: 'AS',
    founded: 2017,
    naceCode: '64.200',
    naceDescription: 'Holdingselskaper',
    hqCity: 'Kverva',
    ownershipType: 'family',
    valueChainStage: 'seafood',
  },
  {
    name: 'Kverva Industrier AS',
    orgNr: '960329856',
    legalForm: 'AS',
    founded: 1991,
    naceCode: '64.200',
    naceDescription: 'Holdingselskaper',
    hqCity: 'Kverva',
    ownershipType: 'family',
    valueChainStage: 'seafood',
  },
]

const salmarBoard = [
  { personName: 'Gustav Witzoee', role: 'styreleder' },
  { personName: 'Margrethe Hauge', role: 'styremedlem' },
  { personName: 'Leif Inge Nordhammer', role: 'styremedlem' },
  { personName: 'Arnhild Holstad', role: 'styremedlem' },
  { personName: 'Morten Loktu', role: 'styremedlem' },
  { personName: 'Ingvild Kindlihagen', role: 'ansatterepresentant' },
  { personName: 'Stig Stensen', role: 'ansatterepresentant' },
]

type OwnershipLink = { parentOrgNr: string; childOrgNr: string; ownershipPct: number | null; ownershipType: string }

const ownershipLinks: OwnershipLink[] = [
  { parentOrgNr: SALMAR_ORG, childOrgNr: '966840528', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: SALMAR_ORG, childOrgNr: '952662813', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: '919818824', childOrgNr: '960329856', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: '960329856', childOrgNr: SALMAR_ORG, ownershipPct: 44.3, ownershipType: 'minority-stake' },
]

async function resolveCompanyId(orgNr: string): Promise<string | null> {
  const c = await prisma.company.findUnique({ where: { orgNr }, select: { id: true } })
  return c?.id ?? null
}

async function importCompanies() {
  console.log('Importing SalMar subsidiaries...\n')
  let created = 0
  for (const c of salmarCompanies) {
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
  console.log(`\n${created} SalMar companies imported`)
}

async function updateSalMarBoard() {
  console.log('\nUpdating SalMar ASA board...\n')
  const id = await resolveCompanyId(SALMAR_ORG)
  if (!id) return
  await prisma.boardMember.deleteMany({ where: { companyId: id } })
  for (const b of salmarBoard) {
    await prisma.boardMember.create({ data: { companyId: id, personName: b.personName, role: b.role, personKey: normalizePersonKey(b.personName) } })
    console.log(`  ${b.personName} (${b.role})`)
  }
}

async function importFinancials() {
  console.log('\nImporting SalMar 2024 financials...\n')
  let imported = 0
  const data = salmarCompanies.filter(c => c.revenue2024).map(c => ({
    orgNr: c.orgNr, name: c.name, year: 2024,
    revenueNok: c.revenue2024! * 1_000_000,
    operatingResult: (c.operatingResult2024 ?? 0) * 1_000_000,
    operatingMargin: c.operatingResult2024 && c.revenue2024 ? Math.round((c.operatingResult2024 / c.revenue2024) * 10000) / 100 : undefined,
    groupEmployees: c.employees,
  }))
  data.push({ orgNr: SALMAR_ORG, name: 'SalMar ASA', year: 2024, revenueNok: 26_318_000_000, operatingResult: 5_235_000_000, operatingMargin: 19.89, groupEmployees: 5600 })
  for (const f of data) {
    const companyId = await resolveCompanyId(f.orgNr)
    if (!companyId) continue
    await prisma.companyFinancial.upsert({
      where: { companyId_year: { companyId, year: f.year } },
      update: { revenueNok: f.revenueNok, operatingResult: f.operatingResult, operatingMargin: f.operatingMargin, groupEmployees: f.groupEmployees, source: 'SalMar Annual Report 2024 / web research 2026-03' },
      create: { companyId, year: f.year, revenueNok: f.revenueNok, operatingResult: f.operatingResult, operatingMargin: f.operatingMargin, groupEmployees: f.groupEmployees, source: 'SalMar Annual Report 2024 / web research 2026-03' },
    })
    console.log(`  ${f.name}: ${(f.revenueNok / 1e9).toFixed(1)}B NOK`)
    imported++
  }
  console.log(`\n${imported} financial records imported`)
}

async function importOwnership() {
  console.log('\nImporting SalMar ownership tree...\n')
  let imported = 0
  for (const link of ownershipLinks) {
    const parentId = await resolveCompanyId(link.parentOrgNr)
    const childId = await resolveCompanyId(link.childOrgNr)
    if (!parentId || !childId) continue
    await prisma.companyOwnership.upsert({
      where: { parentCompanyId_childCompanyId: { parentCompanyId: parentId, childCompanyId: childId } },
      update: { ownershipPct: link.ownershipPct, ownershipType: link.ownershipType, source: 'SalMar Annual Report 2024 / Broennoysund' },
      create: { parentCompanyId: parentId, childCompanyId: childId, ownershipPct: link.ownershipPct, ownershipType: link.ownershipType, source: 'SalMar Annual Report 2024 / Broennoysund' },
    })
    console.log(`  ${link.parentOrgNr} -> ${link.childOrgNr} (${link.ownershipPct}%)`)
    imported++
  }
  console.log(`\n${imported} ownership records imported`)
}

async function importPersonProfiles() {
  console.log('\nImporting SalMar key person profiles...\n')
  const persons = [
    {
      name: 'Gustav Witzoee',
      personKey: normalizePersonKey('Gustav Witzoee'),
      biography: 'Grunnlegger og styreleder i SalMar ASA (26.3B NOK). Eier 92.5% av Kverva AS, som gjennom Kverva Industrier AS eier 44.3% av SalMar. En av Norges rikeste.',
      roles: [
        { companyName: 'SalMar ASA', role: 'Styreleder', fromYear: 2022 },
        { companyName: 'Kverva AS', role: 'Grunnlegger/Eier', fromYear: 1991 },
      ],
      tags: ['salmar', 'grunnlegger', 'styreleder', 'laks', 'kverva'],
    },
    {
      name: 'Frode Arntsen',
      personKey: normalizePersonKey('Frode Arntsen'),
      biography: 'CEO i SalMar ASA. Ledet integrasjonen av NTS, NRS og SalmoNor i 2022 som gjorde SalMar til verdens nest stoerste lakseoppdrettsselskap.',
      roles: [
        { companyName: 'SalMar ASA', role: 'CEO (Daglig leder)', fromYear: 2022 },
      ],
      tags: ['salmar', 'ceo', 'laks'],
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
  console.log('=== SalMar Corporate Tree ===\n')
  await importCompanies()
  await updateSalMarBoard()
  await importFinancials()
  await importOwnership()
  await importPersonProfiles()
  console.log('\n=== SalMar Summary ===')
  console.log('Total companies:', await prisma.company.count())
  console.log('Ownership records:', await prisma.companyOwnership.count())
}

main().catch(e => { console.error('SalMar import failed:', e); process.exit(1) }).finally(() => prisma.$disconnect())
