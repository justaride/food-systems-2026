import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

function normalizePersonKey(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z ]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

const REITAN_RETAIL_ORG = '914526647'
const REMA_NORGE_ORG = '982254604'

type ReitanCompany = {
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

const reitanCompanies: ReitanCompany[] = [
  // ─── Apex holding ──────────────────────────────────────────────
  {
    name: 'Reitan AS',
    orgNr: '912609987',
    legalForm: 'AS',
    founded: 2013,
    naceCode: '46.390',
    naceDescription: 'Engroshandel med bredt utvalg av naerings- og nytelsesmidler',
    hqAddress: 'Lade Gaard, Lade alle 40',
    hqCity: 'Trondheim',
    employees: 27,
    ownershipType: 'family',
    valueChainStage: 'retail',
    revenue2024: 4138,
    operatingResult2024: 3884,
    totalAssets2024: 24560,
    boardMembers: [
      { personName: 'Odd Reitan', role: 'styreleder' },
      { personName: 'Ole Robert Reitan', role: 'styremedlem' },
      { personName: 'Magnus Reitan', role: 'styremedlem' },
      { personName: 'Kristin Genton', role: 'styremedlem' },
      { personName: 'Sunniva Reitan', role: 'styremedlem' },
    ],
  },

  // ─── Grocery / REMA ────────────────────────────────────────────
  {
    name: 'REMA 1000 AS',
    orgNr: '883409442',
    legalForm: 'AS',
    founded: 2001,
    naceCode: '77.400',
    naceDescription: 'Utleie av immateriell eiendom og lignende produkter, unntatt opphavsrettslig beskyttede verker',
    hqAddress: 'Gladengveien 2',
    hqCity: 'Oslo',
    ownershipType: 'family',
    valueChainStage: 'retail',
    revenue2024: 1889,
    operatingResult2024: 1885,
    totalAssets2024: 7156,
    boardMembers: [
      { personName: 'Kristin Genton', role: 'styreleder' },
      { personName: 'Ole Robert Reitan', role: 'daglig leder' },
    ],
  },

  // ─── Convenience (Narvesen, 7-Eleven) ──────────────────────────
  {
    name: 'Reitan Convenience AS',
    orgNr: '983415652',
    legalForm: 'AS',
    founded: 2001,
    naceCode: '77.400',
    naceDescription: 'Utleie av immateriell eiendom og lignende produkter, unntatt opphavsrettslig beskyttede verker',
    hqAddress: 'Gladengveien 2',
    hqCity: 'Oslo',
    ownershipType: 'family',
    valueChainStage: 'retail',
    revenue2024: 309,
    operatingResult2024: -236,
    totalAssets2024: 2887,
    boardMembers: [
      { personName: 'Ole Robert Reitan', role: 'styreleder' },
      { personName: 'Anna Mariette Kristensson', role: 'daglig leder' },
      { personName: 'Magnus Reitan', role: 'styremedlem' },
      { personName: 'Kristin Genton', role: 'styremedlem' },
      { personName: 'Monica Odegaard', role: 'styremedlem' },
    ],
  },
  {
    name: 'Reitan Convenience Norway AS',
    orgNr: '983415660',
    legalForm: 'AS',
    founded: 2001,
    naceCode: '77.400',
    naceDescription: 'Utleie av immateriell eiendom og lignende produkter, unntatt opphavsrettslig beskyttede verker',
    hqAddress: 'Gladengveien 2',
    hqCity: 'Oslo',
    employees: 98,
    ownershipType: 'family',
    valueChainStage: 'retail',
    revenue2024: 789,
    operatingResult2024: -54,
    totalAssets2024: 677,
    boardMembers: [
      { personName: 'Anna Mariette Kristensson', role: 'styreleder' },
      { personName: 'Anna-Maria Linnea Carnemark', role: 'daglig leder' },
      { personName: 'Rita Forsberg', role: 'styremedlem' },
      { personName: 'Jesper Jensen', role: 'styremedlem' },
      { personName: 'Anna Eva Elisabeth Wallenberg', role: 'styremedlem' },
      { personName: 'Helene Thomsgard', role: 'styremedlem' },
      { personName: 'Inge Sleire', role: 'styremedlem' },
      { personName: 'Niklas Paul Patrik Lilius', role: 'styremedlem' },
    ],
  },

  // ─── Fuel / Energy (Uno-X) ─────────────────────────────────────
  {
    name: 'Uno-X Mobility AS',
    orgNr: '988247111',
    legalForm: 'AS',
    founded: 2005,
    naceCode: '46.710',
    naceDescription: 'Engroshandel med drivstoff og brensel',
    hqAddress: 'Gladengveien 2',
    hqCity: 'Oslo',
    ownershipType: 'family',
    valueChainStage: 'retail',
    revenue2024: 429,
    operatingResult2024: 414,
    totalAssets2024: 4857,
    boardMembers: [
      { personName: 'Ole Robert Reitan', role: 'styreleder' },
      { personName: 'Vegar Normann Kulset', role: 'daglig leder' },
      { personName: 'Kristin Genton', role: 'styremedlem' },
      { personName: 'Monica Odegaard', role: 'styremedlem' },
    ],
  },
  {
    name: 'Uno-X Mobility Norge AS',
    orgNr: '921757131',
    legalForm: 'AS',
    founded: 1932,
    naceCode: '47.300',
    naceDescription: 'Detaljhandel med drivstoff til motorvogner',
    hqAddress: 'Gladengveien 2',
    hqCity: 'Oslo',
    employees: 79,
    ownershipType: 'family',
    valueChainStage: 'retail',
    revenue2024: 17073,
    operatingResult2024: -65,
    totalAssets2024: 4451,
    boardMembers: [
      { personName: 'Vegar Normann Kulset', role: 'styreleder' },
      { personName: 'Thor Kristian Korsvold', role: 'daglig leder' },
      { personName: 'Thomas Kristian Bakke', role: 'styremedlem' },
      { personName: 'Torild Olaug Brathen', role: 'styremedlem' },
      { personName: 'Halvor Dalen', role: 'styremedlem' },
      { personName: 'Erik Glimsjo-Tvinnereim', role: 'styremedlem' },
    ],
  },
  {
    name: 'Uno-X E-Mobility Norge AS',
    orgNr: '928211398',
    legalForm: 'AS',
    founded: 2021,
    naceCode: '71.129',
    naceDescription: 'Annen teknisk konsulentvirksomhet',
    hqAddress: 'Gladengveien 2',
    hqCity: 'Oslo',
    employees: 5,
    ownershipType: 'family',
    valueChainStage: 'retail',
  },

  // ─── Investment arm ────────────────────────────────────────────
  {
    name: 'Reitan Kapital AS',
    orgNr: '917114684',
    legalForm: 'AS',
    founded: 2016,
    naceCode: '64.308',
    naceDescription: 'Investeringsselskaper og lignende',
    hqAddress: 'Uranienborgveien 6',
    hqCity: 'Oslo',
    employees: 5,
    ownershipType: 'family',
    valueChainStage: 'retail',
    revenue2024: 1380,
    operatingResult2024: 1335,
    totalAssets2024: 8533,
    boardMembers: [
      { personName: 'Trond Fredrik Mellingsaeter', role: 'styreleder' },
      { personName: 'Magnus Reitan', role: 'daglig leder' },
      { personName: 'Ole Robert Reitan', role: 'styremedlem' },
      { personName: 'Kristin Genton', role: 'styremedlem' },
    ],
  },

  // ─── Real estate ───────────────────────────────────────────────
  {
    name: 'Reitan Eiendom AS',
    orgNr: '915994415',
    legalForm: 'AS',
    founded: 2015,
    naceCode: '68.209',
    naceDescription: 'Utleie av egen eller leid fast eiendom ellers',
    hqAddress: 'Lade Gaard, Lade alle 40',
    hqCity: 'Trondheim',
    employees: 36,
    ownershipType: 'family',
    valueChainStage: 'retail',
    revenue2024: 24,
    operatingResult2024: -57,
    totalAssets2024: 15980,
    boardMembers: [
      { personName: 'Odd Reitan', role: 'styreleder' },
      { personName: 'Trond Fredrik Mellingsaeter', role: 'daglig leder' },
      { personName: 'Kristin Genton', role: 'styremedlem' },
      { personName: 'Kari Elisabeth Moen', role: 'styremedlem' },
      { personName: 'Finn Haugan', role: 'styremedlem' },
    ],
  },

  // ─── Family holding vehicles ───────────────────────────────────
  {
    name: 'Odd Reitan Private Holding AS',
    orgNr: '915990487',
    legalForm: 'AS',
    founded: 2015,
    naceCode: '68.209',
    naceDescription: 'Utleie av egen eller leid fast eiendom ellers',
    hqAddress: 'Lade Gaard, Lade alle 40',
    hqCity: 'Trondheim',
    ownershipType: 'family',
    valueChainStage: 'retail',
    revenue2024: 7,
    operatingResult2024: 3,
    totalAssets2024: 3779,
    boardMembers: [
      { personName: 'Odd Reitan', role: 'styreleder' },
    ],
  },
]

const reitanRetailBoard = [
  { personName: 'Rune Bjerke', role: 'styreleder' },
  { personName: 'Linda Cathrine Helleland', role: 'styremedlem' },
  { personName: 'Siv Elisabeth Skard', role: 'styremedlem' },
  { personName: 'Magnus Reitan', role: 'styremedlem' },
  { personName: 'Eilert Hanoa', role: 'styremedlem' },
  { personName: 'Annika Marie Sigfrid', role: 'styremedlem' },
]

type OwnershipLink = {
  parentOrgNr: string
  childOrgNr: string
  ownershipPct: number | null
  ownershipType: string
}

const ownershipLinks: OwnershipLink[] = [
  // Reitan AS -> direct subsidiaries
  { parentOrgNr: '912609987', childOrgNr: REITAN_RETAIL_ORG, ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: '912609987', childOrgNr: '917114684', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: '912609987', childOrgNr: '915994415', ownershipPct: 72.23, ownershipType: 'subsidiary' },
  // Odd Reitan Private Holding -> Reitan AS (33.33% A-shares, controlling)
  { parentOrgNr: '915990487', childOrgNr: '912609987', ownershipPct: 33.33, ownershipType: 'minority-stake' },
  // Odd Reitan Private Holding -> Reitan Eiendom (27.76%)
  { parentOrgNr: '915990487', childOrgNr: '915994415', ownershipPct: 27.76, ownershipType: 'minority-stake' },
  // Reitan Retail -> operating subs
  { parentOrgNr: REITAN_RETAIL_ORG, childOrgNr: '883409442', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: REITAN_RETAIL_ORG, childOrgNr: '983415652', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: REITAN_RETAIL_ORG, childOrgNr: '988247111', ownershipPct: 100, ownershipType: 'subsidiary' },
  // REMA 1000 AS -> REMA 1000 Norge AS (existing)
  { parentOrgNr: '883409442', childOrgNr: REMA_NORGE_ORG, ownershipPct: 100, ownershipType: 'subsidiary' },
  // Reitan Convenience -> Norway operations
  { parentOrgNr: '983415652', childOrgNr: '983415660', ownershipPct: 100, ownershipType: 'subsidiary' },
  // Uno-X Mobility -> Norwegian operations
  { parentOrgNr: '988247111', childOrgNr: '921757131', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: '988247111', childOrgNr: '928211398', ownershipPct: 100, ownershipType: 'subsidiary' },
]

async function resolveCompanyId(orgNr: string): Promise<string | null> {
  const company = await prisma.company.findUnique({
    where: { orgNr },
    select: { id: true },
  })
  return company?.id ?? null
}

async function importCompanies() {
  console.log('Importing Reitan group companies...\n')
  let created = 0

  for (const c of reitanCompanies) {
    const company = await prisma.company.upsert({
      where: { orgNr: c.orgNr },
      update: {
        name: c.name,
        legalForm: c.legalForm,
        founded: c.founded,
        naceCode: c.naceCode,
        naceDescription: c.naceDescription,
        hqAddress: c.hqAddress,
        hqCity: c.hqCity,
        employees: c.employees,
        ownershipType: c.ownershipType,
        valueChainStage: c.valueChainStage,
      },
      create: {
        name: c.name,
        orgNr: c.orgNr,
        legalForm: c.legalForm,
        founded: c.founded,
        naceCode: c.naceCode,
        naceDescription: c.naceDescription,
        hqAddress: c.hqAddress,
        hqCity: c.hqCity,
        employees: c.employees,
        ownershipType: c.ownershipType,
        valueChainStage: c.valueChainStage,
      },
    })

    if (c.boardMembers) {
      await prisma.boardMember.deleteMany({ where: { companyId: company.id } })
      for (const b of c.boardMembers) {
        await prisma.boardMember.create({
          data: {
            companyId: company.id,
            personName: b.personName,
            role: b.role,
            personKey: normalizePersonKey(b.personName),
          },
        })
      }
    }

    const rev = c.revenue2024 ? ` — ${(c.revenue2024 / 1000).toFixed(1)}B NOK` : ''
    const emp = c.employees ? `, ${c.employees} emp` : ''
    console.log(`  ${company.name} (${c.orgNr}${emp}${rev})`)
    created++
  }

  console.log(`\n${created} Reitan companies imported`)
  return created
}

async function updateReitanRetailBoard() {
  console.log('\nUpdating Reitan Retail AS board...\n')

  const rrId = await resolveCompanyId(REITAN_RETAIL_ORG)
  if (!rrId) {
    console.log('  SKIP: Reitan Retail AS not found')
    return
  }

  await prisma.boardMember.deleteMany({ where: { companyId: rrId } })
  for (const b of reitanRetailBoard) {
    await prisma.boardMember.create({
      data: {
        companyId: rrId,
        personName: b.personName,
        role: b.role,
        personKey: normalizePersonKey(b.personName),
      },
    })
    console.log(`  ${b.personName} (${b.role})`)
  }
  console.log(`\n${reitanRetailBoard.length} board members updated`)
}

async function importFinancials() {
  console.log('\nImporting Reitan 2024 financials...\n')
  let imported = 0

  const financialData = reitanCompanies
    .filter(c => c.revenue2024 && c.revenue2024 > 5)
    .map(c => ({
      orgNr: c.orgNr,
      name: c.name,
      year: 2024,
      revenueNok: c.revenue2024! * 1_000_000,
      operatingResult: (c.operatingResult2024 ?? 0) * 1_000_000,
      operatingMargin: c.operatingResult2024 && c.revenue2024
        ? Math.round((c.operatingResult2024 / c.revenue2024) * 10000) / 100
        : undefined,
      groupEmployees: c.employees,
    }))

  financialData.push({
    orgNr: REITAN_RETAIL_ORG,
    name: 'Reitan Retail AS',
    year: 2024,
    revenueNok: 1_820_000_000,
    operatingResult: 1_538_000_000,
    operatingMargin: 84.51,
    groupEmployees: 44,
  })

  for (const f of financialData) {
    const companyId = await resolveCompanyId(f.orgNr)
    if (!companyId) {
      console.log(`  SKIP financials for ${f.orgNr} (not found)`)
      continue
    }

    await prisma.companyFinancial.upsert({
      where: { companyId_year: { companyId, year: f.year } },
      update: {
        revenueNok: f.revenueNok,
        operatingResult: f.operatingResult,
        operatingMargin: f.operatingMargin,
        groupEmployees: f.groupEmployees,
        source: 'Broennoysund / offentligdata MCP 2026-03',
      },
      create: {
        companyId,
        year: f.year,
        revenueNok: f.revenueNok,
        operatingResult: f.operatingResult,
        operatingMargin: f.operatingMargin,
        groupEmployees: f.groupEmployees,
        source: 'Broennoysund / offentligdata MCP 2026-03',
      },
    })

    console.log(`  ${f.name}: ${(f.revenueNok / 1e9).toFixed(1)}B NOK`)
    imported++
  }

  console.log(`\n${imported} financial records imported`)
}

async function importOwnership() {
  console.log('\nImporting Reitan ownership tree...\n')
  let imported = 0

  for (const link of ownershipLinks) {
    const parentId = await resolveCompanyId(link.parentOrgNr)
    const childId = await resolveCompanyId(link.childOrgNr)
    if (!parentId || !childId) {
      console.log(`  SKIP: ${link.parentOrgNr} -> ${link.childOrgNr} (not found)`)
      continue
    }

    await prisma.companyOwnership.upsert({
      where: {
        parentCompanyId_childCompanyId: { parentCompanyId: parentId, childCompanyId: childId },
      },
      update: {
        ownershipPct: link.ownershipPct,
        ownershipType: link.ownershipType,
        source: 'Broennoysundregistrene / Reitan aarsrapport 2024',
      },
      create: {
        parentCompanyId: parentId,
        childCompanyId: childId,
        ownershipPct: link.ownershipPct,
        ownershipType: link.ownershipType,
        source: 'Broennoysundregistrene / Reitan aarsrapport 2024',
      },
    })

    const parentName = reitanCompanies.find(c => c.orgNr === link.parentOrgNr)?.name ?? link.parentOrgNr
    const childName = reitanCompanies.find(c => c.orgNr === link.childOrgNr)?.name ?? link.childOrgNr
    console.log(`  ${parentName} -> ${childName} (${link.ownershipPct ?? '?'}%)`)
    imported++
  }

  console.log(`\n${imported} ownership records imported`)
}

async function importPersonProfiles() {
  console.log('\nImporting Reitan key person profiles...\n')

  const persons = [
    {
      name: 'Odd Reitan',
      personKey: normalizePersonKey('Odd Reitan'),
      biography: 'Grunnlegger og patriark i Reitangruppen (f. 1951). Styreleder og daglig leder i Reitan AS. Styreleder i Reitan Eiendom AS og Odd Reitan Private Holding AS. Kontrollerer 33.33% av Reitan AS via A-aksjer (stemmeflertall) og 27.76% av Reitan Eiendom direkte. Startet REMA 1000 i 1979.',
      roles: [
        { companyName: 'Reitan AS', role: 'Styreleder + Daglig leder', fromYear: 2013 },
        { companyName: 'Reitan Eiendom AS', role: 'Styreleder', fromYear: 2015 },
        { companyName: 'Odd Reitan Private Holding AS', role: 'Styreleder (enestyre)', fromYear: 2015 },
      ],
      tags: ['reitan', 'grunnlegger', 'patriarch', 'maktkonsentrasjon'],
    },
    {
      name: 'Ole Robert Reitan',
      personKey: normalizePersonKey('Ole Robert Reitan'),
      biography: 'Soenn av Odd Reitan (f. 1971). Daglig leder i Reitan Retail AS og REMA 1000 AS. Styreleder i Reitan Convenience AS og Uno-X Mobility AS. Kontrollerer 33.34% av Reitan AS via ORR Invest AS. Leder den operative dagligvaredriften — Norges mest synlige dagligvareleder.',
      roles: [
        { companyName: 'Reitan Retail AS', role: 'Daglig leder (CEO)', fromYear: 2015 },
        { companyName: 'REMA 1000 AS', role: 'Daglig leder', fromYear: 2015 },
        { companyName: 'Reitan Convenience AS', role: 'Styreleder', fromYear: 2015 },
        { companyName: 'Uno-X Mobility AS', role: 'Styreleder', fromYear: 2015 },
        { companyName: 'Reitan AS', role: 'Styremedlem', fromYear: 2013 },
        { companyName: 'Reitan Kapital AS', role: 'Styremedlem', fromYear: 2016 },
      ],
      tags: ['reitan', 'ceo', 'interlocking-director', 'maktkonsentrasjon'],
    },
    {
      name: 'Magnus Reitan',
      personKey: normalizePersonKey('Magnus Reitan'),
      biography: 'Soenn av Odd Reitan (f. 1975). Daglig leder i Reitan Kapital AS (8.5B NOK investert kapital). Kontrollerer 33.34% av Reitan AS via MVK Capital AS. Leder investeringsarmen — venture, eiendom og eksterne plasseringer.',
      roles: [
        { companyName: 'Reitan Kapital AS', role: 'Daglig leder (CEO)', fromYear: 2016 },
        { companyName: 'Reitan AS', role: 'Styremedlem', fromYear: 2013 },
        { companyName: 'Reitan Retail AS', role: 'Styremedlem', fromYear: 2015 },
        { companyName: 'Reitan Convenience AS', role: 'Styremedlem', fromYear: 2015 },
      ],
      tags: ['reitan', 'investment', 'interlocking-director'],
    },
    {
      name: 'Kristin Genton',
      personKey: normalizePersonKey('Kristin Genton'),
      biography: 'Styreleder i REMA 1000 AS. Styremedlem i Reitan AS, Reitan Eiendom, Reitan Convenience, Reitan Kapital og Uno-X Mobility. Sentral governance-figur paa tvers av hele Reitan-systemet — sitter i 6 styrer.',
      roles: [
        { companyName: 'REMA 1000 AS', role: 'Styreleder', fromYear: 2020 },
        { companyName: 'Reitan AS', role: 'Styremedlem', fromYear: 2020 },
        { companyName: 'Reitan Eiendom AS', role: 'Styremedlem', fromYear: 2020 },
        { companyName: 'Reitan Convenience AS', role: 'Styremedlem', fromYear: 2020 },
        { companyName: 'Reitan Kapital AS', role: 'Styremedlem', fromYear: 2020 },
        { companyName: 'Uno-X Mobility AS', role: 'Styremedlem', fromYear: 2020 },
      ],
      tags: ['reitan', 'interlocking-director', 'governance'],
    },
  ]

  for (const p of persons) {
    await prisma.personProfile.upsert({
      where: { personKey: p.personKey },
      update: {
        name: p.name,
        biography: p.biography,
        roles: p.roles,
        tags: p.tags,
      },
      create: {
        name: p.name,
        personKey: p.personKey,
        biography: p.biography,
        roles: p.roles,
        tags: p.tags,
      },
    })
    console.log(`  ${p.name} (${p.personKey})`)
  }

  console.log(`\n${persons.length} person profiles imported`)
}

async function main() {
  console.log('=== Reitan Corporate Tree: Full Subsidiary Map ===\n')

  await importCompanies()
  await updateReitanRetailBoard()
  await importFinancials()
  await importOwnership()
  await importPersonProfiles()

  console.log('\n=== Reitan System Summary ===')
  console.log('Reitan AS total assets: 24.6B NOK')
  console.log('Reitan Eiendom portfolio: 16.0B NOK (self-leasing vehicle)')
  console.log('REMA 1000 AS net profit: 1.6B NOK (IP licensing cash cow)')
  console.log('Uno-X Mobility Norge: 17.1B NOK revenue (fuel retail)')
  console.log('Reitan Convenience: -320M NOK loss (struggling segment)')
  console.log('Total companies:', await prisma.company.count())
  console.log('Ownership records:', await prisma.companyOwnership.count())
  console.log('Board members:', await prisma.boardMember.count())
  console.log('Person profiles:', await prisma.personProfile.count())
}

main()
  .catch((e) => {
    console.error('Reitan import failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
