import 'dotenv/config'
import { canonicalPersonKey as normalizePersonKey } from '../src/lib/person-key'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const COOP_ORG = '936560288'

type CoopCompany = {
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

// ─── Coop Norge SA direct subsidiaries ───────────────────────────
const coopSubsidiaries: CoopCompany[] = [
  {
    name: 'Coop Norge Eiendom AS',
    orgNr: '988445177',
    legalForm: 'AS',
    founded: 2005,
    naceCode: '41.109',
    naceDescription: 'Utvikling og salg av egen fast eiendom ellers',
    hqAddress: 'Regnbueveien 5',
    hqCity: 'Langhus',
    employees: 37,
    ownershipType: 'cooperative',
    valueChainStage: 'retail',
    revenue2024: 36,
    operatingResult2024: -48,
    totalAssets2024: 4635,
    boardMembers: [
      { personName: 'Philipp Lasse Engedal', role: 'styreleder' },
      { personName: 'Anette Thunes', role: 'styremedlem' },
      { personName: 'Lars Ove Breivik', role: 'styremedlem' },
      { personName: 'Irene Egset', role: 'styremedlem' },
      { personName: 'Anne Behring', role: 'styremedlem' },
      { personName: 'Bjorn Tore Skaug', role: 'styremedlem' },
      { personName: 'Inge Wagtskjold', role: 'styremedlem' },
    ],
  },
  {
    name: 'Norsk Butikkdrift AS',
    orgNr: '931186744',
    legalForm: 'AS',
    founded: 1980,
    naceCode: '47.111',
    naceDescription: 'Butikkhandel med bredt vareutvalg med hovedvekt paa naerings- og nytelsesmidler',
    hqAddress: 'Nydalsveien 24',
    hqCity: 'Oslo',
    employees: 2889,
    ownershipType: 'cooperative',
    valueChainStage: 'retail',
    revenue2024: 10138,
    operatingResult2024: 228,
    totalAssets2024: 3322,
    boardMembers: [
      { personName: 'Philipp Lasse Engedal', role: 'styreleder' },
      { personName: 'Linn Imen Torve', role: 'styremedlem' },
      { personName: 'Thomas Hansen', role: 'styremedlem' },
      { personName: 'Bent Aamotsmo', role: 'styremedlem' },
      { personName: 'Irene Egset', role: 'styremedlem' },
      { personName: 'Kathrine Flydal', role: 'styremedlem' },
    ],
  },
  {
    name: 'Coop Norge Kaffe AS',
    orgNr: '882722422',
    legalForm: 'AS',
    founded: 2000,
    naceCode: '68.209',
    naceDescription: 'Utleie av egen eller leid fast eiendom ellers',
    hqCity: 'Oslo',
    ownershipType: 'cooperative',
    valueChainStage: 'processing',
    revenue2024: 1,
    totalAssets2024: 49,
  },

  // ─── Coop Norge Eiendom property subs ──────────────────────────
  {
    name: 'Coop Norge Trondheim Eiendom AS',
    orgNr: '919784725',
    legalForm: 'AS',
    founded: 2017,
    naceCode: '68.209',
    naceDescription: 'Utleie av egen eller leid fast eiendom ellers',
    hqCity: 'Trondheim',
    ownershipType: 'cooperative',
    valueChainStage: 'retail',
    revenue2024: 35,
    totalAssets2024: 166,
  },
  {
    name: 'Coop Norge Langhus Eiendom AS',
    orgNr: '919784814',
    legalForm: 'AS',
    founded: 2017,
    naceCode: '68.209',
    naceDescription: 'Utleie av egen eller leid fast eiendom ellers',
    hqCity: 'Langhus',
    ownershipType: 'cooperative',
    valueChainStage: 'retail',
    revenue2024: 71,
    totalAssets2024: 313,
  },
  {
    name: 'Coop Norge Stavanger Eiendom AS',
    orgNr: '989085557',
    legalForm: 'AS',
    founded: 2005,
    naceCode: '68.209',
    naceDescription: 'Utleie av egen eller leid fast eiendom ellers',
    hqCity: 'Stavanger',
    ownershipType: 'cooperative',
    valueChainStage: 'retail',
    revenue2024: 12,
    totalAssets2024: 52,
  },
  {
    name: 'Coop Norge Tromsoe Eiendom AS',
    orgNr: '997800419',
    legalForm: 'AS',
    founded: 2011,
    naceCode: '68.209',
    naceDescription: 'Utleie av egen eller leid fast eiendom ellers',
    hqCity: 'Tromsoe',
    ownershipType: 'cooperative',
    valueChainStage: 'retail',
    revenue2024: 21,
    totalAssets2024: 57,
  },
  {
    name: 'Coop Norge Stavanger Eiendom II AS',
    orgNr: '819784922',
    legalForm: 'AS',
    founded: 2017,
    naceCode: '68.209',
    naceDescription: 'Utleie av egen eller leid fast eiendom ellers',
    hqCity: 'Stavanger',
    ownershipType: 'cooperative',
    valueChainStage: 'retail',
    revenue2024: 18,
    totalAssets2024: 35,
  },
]

// ─── Regional samvirkelag (member-owners of Coop Norge SA) ───────
const coopRegionals: CoopCompany[] = [
  {
    name: 'Coop Midt-Norge SA',
    orgNr: '938786054',
    legalForm: 'SA',
    founded: 1970,
    naceCode: '47.111',
    naceDescription: 'Butikkhandel med bredt vareutvalg med hovedvekt paa naerings- og nytelsesmidler',
    hqAddress: 'Haakon VIIs gate 9',
    hqCity: 'Trondheim',
    employees: 2650,
    ownershipType: 'cooperative',
    valueChainStage: 'retail',
    revenue2024: 9153,
    operatingResult2024: 269,
    totalAssets2024: 9560,
    boardMembers: [
      { personName: 'Toril Valla', role: 'styreleder' },
    ],
  },
  {
    name: 'Coop Oest SA',
    orgNr: '948432617',
    legalForm: 'SA',
    founded: 1970,
    naceCode: '47.111',
    naceDescription: 'Butikkhandel med bredt vareutvalg med hovedvekt paa naerings- og nytelsesmidler',
    hqAddress: 'Kolbotnveien 35',
    hqCity: 'Kolbotn',
    employees: 2659,
    ownershipType: 'cooperative',
    valueChainStage: 'retail',
    revenue2024: 9663,
    operatingResult2024: 177,
    totalAssets2024: 5113,
    boardMembers: [
      { personName: 'Kjetil Ebbesberg', role: 'styreleder' },
    ],
  },
  {
    name: 'Coop Soervest SA',
    orgNr: '966833300',
    legalForm: 'SA',
    founded: 1993,
    naceCode: '47.111',
    naceDescription: 'Butikkhandel med bredt vareutvalg med hovedvekt paa naerings- og nytelsesmidler',
    hqAddress: 'Ganddalsgata 1',
    hqCity: 'Sandnes',
    employees: 2305,
    ownershipType: 'cooperative',
    valueChainStage: 'retail',
    revenue2024: 7413,
    operatingResult2024: 151,
    totalAssets2024: 4383,
    boardMembers: [
      { personName: 'Merete Lund', role: 'styreleder' },
    ],
  },
  {
    name: 'Coop Nordvest SA',
    orgNr: '942763654',
    legalForm: 'SA',
    founded: 1966,
    naceCode: '47.111',
    naceDescription: 'Butikkhandel med bredt vareutvalg med hovedvekt paa naerings- og nytelsesmidler',
    hqAddress: 'Sandenveien 5',
    hqCity: 'Orkanger',
    employees: 2057,
    ownershipType: 'cooperative',
    valueChainStage: 'retail',
    revenue2024: 6190,
    operatingResult2024: 105,
    totalAssets2024: 3110,
    boardMembers: [
      { personName: 'Geir Arvik', role: 'styreleder' },
      { personName: 'Elin Viken', role: 'styremedlem' },
    ],
  },
  {
    name: 'Coop Nord SA',
    orgNr: '938497257',
    legalForm: 'SA',
    founded: 1926,
    naceCode: '47.111',
    naceDescription: 'Butikkhandel med bredt vareutvalg med hovedvekt paa naerings- og nytelsesmidler',
    hqAddress: 'Fr Nansens plass 6',
    hqCity: 'Tromsoe',
    employees: 1457,
    ownershipType: 'cooperative',
    valueChainStage: 'retail',
    revenue2024: 4572,
    operatingResult2024: 147,
    totalAssets2024: 3454,
    boardMembers: [
      { personName: 'Inge Olsen', role: 'styreleder' },
    ],
  },
  {
    name: 'Coop Hordaland SA',
    orgNr: '982594421',
    legalForm: 'SA',
    founded: 2000,
    naceCode: '47.111',
    naceDescription: 'Butikkhandel med bredt vareutvalg med hovedvekt paa naerings- og nytelsesmidler',
    hqAddress: 'Kokstaddalen 18',
    hqCity: 'Kokstad',
    employees: 1099,
    ownershipType: 'cooperative',
    valueChainStage: 'retail',
    revenue2024: 4261,
    operatingResult2024: 112,
    totalAssets2024: 1810,
    boardMembers: [
      { personName: 'Hilde Forland', role: 'styreleder' },
    ],
  },
  {
    name: 'Coop Nordland SA',
    orgNr: '946231819',
    legalForm: 'SA',
    founded: 1984,
    naceCode: '47.111',
    naceDescription: 'Butikkhandel med bredt vareutvalg med hovedvekt paa naerings- og nytelsesmidler',
    hqAddress: 'City Nord, Stormyra',
    hqCity: 'Bodoe',
    employees: 1130,
    ownershipType: 'cooperative',
    valueChainStage: 'retail',
    revenue2024: 3444,
    operatingResult2024: 76,
    totalAssets2024: 2312,
    boardMembers: [
      { personName: 'Ole-Henrik Hjartoy', role: 'styreleder' },
    ],
  },
  {
    name: 'Coop Innlandet SA',
    orgNr: '979419287',
    legalForm: 'SA',
    founded: 1997,
    naceCode: '47.111',
    naceDescription: 'Butikkhandel med bredt vareutvalg med hovedvekt paa naerings- og nytelsesmidler',
    hqAddress: 'Stolvstadvegen 2',
    hqCity: 'Rudshogda',
    employees: 838,
    ownershipType: 'cooperative',
    valueChainStage: 'retail',
    revenue2024: 2834,
    operatingResult2024: 14,
    totalAssets2024: 1133,
    boardMembers: [
      { personName: 'Anita Ihle', role: 'styreleder' },
    ],
  },
  {
    name: 'Coop Oekonom SA',
    orgNr: '953452626',
    legalForm: 'SA',
    founded: 1900,
    naceCode: '47.111',
    naceDescription: 'Butikkhandel med bredt vareutvalg med hovedvekt paa naerings- og nytelsesmidler',
    hqAddress: 'Langflatveien 38',
    hqCity: 'Stavanger',
    employees: 805,
    ownershipType: 'cooperative',
    valueChainStage: 'retail',
    revenue2024: 2418,
    operatingResult2024: 16,
    totalAssets2024: 1156,
    boardMembers: [
      { personName: 'Levard Olsen-Hagen', role: 'styreleder' },
    ],
  },
  {
    name: 'Coop Vestviken SA',
    orgNr: '950264799',
    legalForm: 'SA',
    founded: 1972,
    naceCode: '47.111',
    naceDescription: 'Butikkhandel med bredt vareutvalg med hovedvekt paa naerings- og nytelsesmidler',
    hqAddress: 'Gamle Ringeriksvei 39',
    hqCity: 'Bekkestua',
    employees: 444,
    ownershipType: 'cooperative',
    valueChainStage: 'retail',
    revenue2024: 1674,
    operatingResult2024: 28,
    totalAssets2024: 790,
    boardMembers: [
      { personName: 'Inge Hilde Kitterod', role: 'styreleder' },
    ],
  },
  {
    name: 'Coop Finnmark SA',
    orgNr: '981397568',
    legalForm: 'SA',
    founded: 1999,
    naceCode: '47.111',
    naceDescription: 'Butikkhandel med bredt vareutvalg med hovedvekt paa naerings- og nytelsesmidler',
    hqAddress: 'Bossekoppveien 1',
    hqCity: 'Alta',
    employees: 391,
    ownershipType: 'cooperative',
    valueChainStage: 'retail',
    revenue2024: 1515,
    operatingResult2024: 85,
    totalAssets2024: 1112,
    boardMembers: [
      { personName: 'Bjorn Roald Mikkelsen', role: 'styreleder' },
    ],
  },
]

const coopBoard = [
  { personName: 'Runar Leite', role: 'styreleder' },
  { personName: 'Oeystein Berg', role: 'styremedlem' },
  { personName: 'Lars Arve Jakobsen', role: 'styremedlem' },
  { personName: 'Elin Viken', role: 'styremedlem' },
  { personName: 'Goeril Johnsen', role: 'styremedlem' },
  { personName: 'Bjoern Vik-Mo', role: 'styremedlem' },
  { personName: 'Yngve Haldorsen', role: 'styremedlem' },
  { personName: 'Lise Renee Skarpas', role: 'styremedlem' },
  { personName: 'Johan Martin Andreassen', role: 'styremedlem' },
  { personName: 'Katrine Lundstroem', role: 'styremedlem' },
  { personName: 'Stine Beate Rodberg', role: 'styremedlem' },
]

type OwnershipLink = {
  parentOrgNr: string
  childOrgNr: string
  ownershipPct: number | null
  ownershipType: string
}

const ownershipLinks: OwnershipLink[] = [
  // Coop Norge SA -> direct subsidiaries
  { parentOrgNr: COOP_ORG, childOrgNr: '988445177', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: COOP_ORG, childOrgNr: '931186744', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: COOP_ORG, childOrgNr: '882722422', ownershipPct: 100, ownershipType: 'subsidiary' },
  // Coop Norge Eiendom -> property subs
  { parentOrgNr: '988445177', childOrgNr: '919784725', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: '988445177', childOrgNr: '919784814', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: '988445177', childOrgNr: '989085557', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: '988445177', childOrgNr: '997800419', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: '988445177', childOrgNr: '819784922', ownershipPct: 100, ownershipType: 'subsidiary' },
]

async function resolveCompanyId(orgNr: string): Promise<string | null> {
  const company = await prisma.company.findUnique({
    where: { orgNr },
    select: { id: true },
  })
  return company?.id ?? null
}

async function importCompanies() {
  console.log('Importing Coop subsidiaries...\n')
  let created = 0

  const allCompanies = [...coopSubsidiaries, ...coopRegionals]

  for (const c of allCompanies) {
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

  console.log(`\n${created} Coop companies imported`)
  return created
}

async function updateCoopBoard() {
  console.log('\nUpdating Coop Norge SA board...\n')

  const coopId = await resolveCompanyId(COOP_ORG)
  if (!coopId) {
    console.log('  SKIP: Coop Norge SA not found')
    return
  }

  await prisma.boardMember.deleteMany({ where: { companyId: coopId } })
  for (const b of coopBoard) {
    await prisma.boardMember.create({
      data: {
        companyId: coopId,
        personName: b.personName,
        role: b.role,
        personKey: normalizePersonKey(b.personName),
      },
    })
    console.log(`  ${b.personName} (${b.role})`)
  }
  console.log(`\n${coopBoard.length} board members updated`)
}

async function importFinancials() {
  console.log('\nImporting Coop 2024 financials...\n')
  let imported = 0

  const allCompanies = [...coopSubsidiaries, ...coopRegionals]
  const financialData = allCompanies
    .filter(c => c.revenue2024 && c.revenue2024 > 1)
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
    orgNr: COOP_ORG,
    name: 'Coop Norge SA',
    year: 2024,
    revenueNok: 62_245_000_000,
    operatingResult: 183_000_000,
    operatingMargin: 0.29,
    groupEmployees: 2235,
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
  console.log('\nImporting Coop ownership structure...\n')
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
        source: 'Broennoysundregistrene / Coop aarsrapport 2024',
      },
      create: {
        parentCompanyId: parentId,
        childCompanyId: childId,
        ownershipPct: link.ownershipPct,
        ownershipType: link.ownershipType,
        source: 'Broennoysundregistrene / Coop aarsrapport 2024',
      },
    })

    const allCompanies = [...coopSubsidiaries, ...coopRegionals]
    const parentName = allCompanies.find(c => c.orgNr === link.parentOrgNr)?.name ?? link.parentOrgNr
    const childName = allCompanies.find(c => c.orgNr === link.childOrgNr)?.name ?? link.childOrgNr
    console.log(`  ${parentName} -> ${childName} (${link.ownershipPct ?? '?'}%)`)
    imported++
  }

  console.log(`\n${imported} ownership records imported`)
}

async function importCoopProperties() {
  console.log('\nImporting Coop warehouse properties...\n')
  let imported = 0

  const properties = [
    { companyOrgNr: COOP_ORG, propertyType: 'warehouse', address: 'Jessheim logistikksenter', municipality: 'Ullensaker', county: 'Akershus', lat: 60.16, lng: 11.17, employees: 510, source: 'Coop Norge SA — Logistikksenter Jessheim' },
    { companyOrgNr: COOP_ORG, propertyType: 'office', address: 'Oestre Aker vei 264', municipality: 'Oslo', county: 'Oslo', lat: 59.95, lng: 10.83, employees: 802, source: 'Coop Norge SA — Hovedkontor Oslo' },
    { companyOrgNr: COOP_ORG, propertyType: 'warehouse', address: 'Langhus lager', municipality: 'Nordre Follo', county: 'Akershus', lat: 59.73, lng: 10.82, employees: 336, source: 'Coop Norge SA — Lager Langhus' },
    { companyOrgNr: COOP_ORG, propertyType: 'warehouse', address: 'Tiller lager', municipality: 'Trondheim', county: 'Troendelag', lat: 63.36, lng: 10.38, employees: 215, source: 'Coop Norge SA — Lager Trondheim' },
    { companyOrgNr: COOP_ORG, propertyType: 'warehouse', address: 'Stavanger lager', municipality: 'Stavanger', county: 'Rogaland', lat: 58.97, lng: 5.73, employees: 138, source: 'Coop Norge SA — Lager Stavanger' },
    { companyOrgNr: COOP_ORG, propertyType: 'warehouse', address: 'Bergen engros', municipality: 'Bergen', county: 'Vestland', lat: 60.39, lng: 5.32, employees: 82, source: 'Coop Norge SA — Engros Bergen' },
    { companyOrgNr: COOP_ORG, propertyType: 'warehouse', address: 'Tromsoe lager', municipality: 'Tromsoe', county: 'Troms', lat: 69.65, lng: 18.96, employees: 72, source: 'Coop Norge SA — Lager Tromsoe' },
  ]

  for (const p of properties) {
    const companyId = await resolveCompanyId(p.companyOrgNr)
    if (!companyId) {
      console.log(`  SKIP: ${p.companyOrgNr} not found`)
      continue
    }

    const existing = await prisma.companyProperty.findFirst({
      where: { companyId, address: p.address },
    })

    if (!existing) {
      await prisma.companyProperty.create({
        data: {
          companyId,
          propertyType: p.propertyType,
          address: p.address,
          municipality: p.municipality,
          county: p.county,
          country: 'NO',
          lat: p.lat,
          lng: p.lng,
          selfLeased: false,
          source: p.source,
        },
      })
      imported++
      console.log(`  ${p.municipality}: ${p.source}`)
    } else {
      console.log(`  SKIP (exists): ${p.municipality}`)
    }
  }

  console.log(`\n${imported} properties imported`)
}

async function importPersonProfiles() {
  console.log('\nImporting Coop key person profiles...\n')

  const persons = [
    {
      name: 'Philipp Lasse Engedal',
      personKey: normalizePersonKey('Philipp Lasse Engedal'),
      biography: 'CEO av Coop Norge SA. Styreleder i Coop Norge Eiendom AS og Norsk Butikkdrift AS. Leder hele Coop-systemets sentrale operasjoner: grossist, logistikk, eiendom og butikkdrift.',
      roles: [
        { companyName: 'Coop Norge SA', role: 'CEO (Daglig leder)', fromYear: 2022 },
        { companyName: 'Coop Norge Eiendom AS', role: 'Styreleder', fromYear: 2022 },
        { companyName: 'Norsk Butikkdrift AS', role: 'Styreleder', fromYear: 2022 },
      ],
      tags: ['coop', 'ceo', 'interlocking-director'],
    },
    {
      name: 'Runar Leite',
      personKey: normalizePersonKey('Runar Leite'),
      biography: 'Styreleder i Coop Norge SA. Samtidig CEO av Coop Soervest SA — typisk for Coop-systemets demokratiske governance der regionale ledere styrer sentralleddet.',
      roles: [
        { companyName: 'Coop Norge SA', role: 'Styreleder', fromYear: 2020 },
        { companyName: 'Coop Soervest SA', role: 'CEO (Daglig leder)', fromYear: 2015 },
      ],
      tags: ['coop', 'cooperative-governance', 'interlocking-director'],
    },
    {
      name: 'Goeril Johnsen',
      personKey: normalizePersonKey('Goeril Johnsen'),
      biography: 'Styremedlem i Coop Norge SA. Samtidig CEO av Coop Oest SA (9.7B NOK, 2659 ansatte). Representerer den stoerste regionale kooperativen paa Oestlandet.',
      roles: [
        { companyName: 'Coop Norge SA', role: 'Styremedlem', fromYear: 2020 },
        { companyName: 'Coop Oest SA', role: 'CEO (Daglig leder)', fromYear: 2018 },
      ],
      tags: ['coop', 'cooperative-governance', 'interlocking-director'],
    },
    {
      name: 'Yngve Haldorsen',
      personKey: normalizePersonKey('Yngve Haldorsen'),
      biography: 'Styremedlem i Coop Norge SA. Samtidig CEO av Coop Nord SA (4.6B NOK, 1457 ansatte). Representerer Nord-Norge i Coop-systemets styringsstruktur.',
      roles: [
        { companyName: 'Coop Norge SA', role: 'Styremedlem', fromYear: 2020 },
        { companyName: 'Coop Nord SA', role: 'CEO (Daglig leder)', fromYear: 2015 },
      ],
      tags: ['coop', 'cooperative-governance', 'interlocking-director'],
    },
    {
      name: 'Torbjorn Skei',
      personKey: normalizePersonKey('Torbjorn Skei'),
      biography: 'CEO av Coop Midt-Norge SA (9.2B NOK, 2650 ansatte, 5.7B egenkapital). Sterkeste regionale kooperativ finansielt. Har ledet siden 1999 — langvarig lederskap som forklarer sterk markedsposisjon i Troendelag.',
      roles: [
        { companyName: 'Coop Midt-Norge SA', role: 'CEO (Daglig leder)', fromYear: 1999 },
      ],
      tags: ['coop', 'cooperative-governance', 'regional-leder'],
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
  console.log('=== Coop Norge Corporate Tree: Full System Map ===\n')

  await importCompanies()
  await updateCoopBoard()
  await importFinancials()
  await importOwnership()
  await importCoopProperties()
  await importPersonProfiles()

  const totalRevenue = coopRegionals
    .filter(c => c.revenue2024)
    .reduce((sum, c) => sum + (c.revenue2024 ?? 0), 0)

  const totalEmployees = coopRegionals
    .filter(c => c.employees)
    .reduce((sum, c) => sum + (c.employees ?? 0), 0)

  console.log('\n=== Coop System Summary ===')
  console.log(`Regional samvirkelag combined revenue: ${(totalRevenue / 1000).toFixed(1)}B NOK`)
  console.log(`Regional employees: ${totalEmployees}`)
  console.log(`Norsk Butikkdrift revenue: ${(10138 / 1000).toFixed(1)}B NOK`)
  console.log('Total companies:', await prisma.company.count())
  console.log('Ownership records:', await prisma.companyOwnership.count())
  console.log('Board members:', await prisma.boardMember.count())
  console.log('Person profiles:', await prisma.personProfile.count())
}

main()
  .catch((e) => {
    console.error('Coop import failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
