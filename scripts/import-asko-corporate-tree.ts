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

type AskoCompany = {
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

const ASKO_PARENT_ORG = '929228723'
const NG_ORG = '819731322'

const askoCompanies: AskoCompany[] = [
  // ─── Regional wholesale companies (core operations) ───────────
  {
    name: 'ASKO Oslofjord AS',
    orgNr: '930622974',
    legalForm: 'AS',
    founded: 1970,
    naceCode: '46.390',
    naceDescription: 'Engroshandel med bredt utvalg av naerings- og nytelsesmidler',
    hqAddress: 'Hanekleiva 76',
    hqCity: 'Holmestrand',
    employees: 416,
    ownershipType: 'family',
    valueChainStage: 'logistics',
    revenue2024: 17270,
    operatingResult2024: 117,
    totalAssets2024: 4830,
  },
  {
    name: 'ASKO Vest AS',
    orgNr: '979487916',
    legalForm: 'AS',
    founded: 1997,
    naceCode: '46.390',
    naceDescription: 'Engroshandel med bredt utvalg av naerings- og nytelsesmidler',
    hqAddress: 'Magnusvegen 10',
    hqCity: 'Bergen',
    employees: 507,
    ownershipType: 'family',
    valueChainStage: 'logistics',
    revenue2024: 12382,
    operatingResult2024: 185,
    totalAssets2024: 1601,
  },
  {
    name: 'ASKO Hedmark AS',
    orgNr: '918710507',
    legalForm: 'AS',
    founded: 1968,
    naceCode: '46.390',
    naceDescription: 'Engroshandel med bredt utvalg av naerings- og nytelsesmidler',
    hqAddress: 'Skansvegen 5',
    hqCity: 'Brumunddal',
    employees: 327,
    ownershipType: 'family',
    valueChainStage: 'logistics',
    revenue2024: 8689,
    operatingResult2024: 143,
    totalAssets2024: 1271,
  },
  {
    name: 'ASKO Rogaland AS',
    orgNr: '923622845',
    legalForm: 'AS',
    founded: 1972,
    naceCode: '46.390',
    naceDescription: 'Engroshandel med bredt utvalg av naerings- og nytelsesmidler',
    hqAddress: 'Skurvemarka 21',
    hqCity: 'Aalgaard',
    employees: 342,
    ownershipType: 'family',
    valueChainStage: 'logistics',
    revenue2024: 7827,
    operatingResult2024: 96,
    totalAssets2024: 1177,
  },
  {
    name: 'ASKO Midt-Norge AS',
    orgNr: '979334109',
    legalForm: 'AS',
    founded: 1997,
    naceCode: '46.390',
    naceDescription: 'Engroshandel med bredt utvalg av naerings- og nytelsesmidler',
    hqAddress: 'Oestre Rosten 104',
    hqCity: 'Trondheim',
    employees: 371,
    ownershipType: 'family',
    valueChainStage: 'logistics',
    revenue2024: 7469,
    operatingResult2024: 27,
    totalAssets2024: 1428,
    boardMembers: [
      { personName: 'Tore Bekken', role: 'styreleder' },
      { personName: 'Grete Ovanger', role: 'styremedlem' },
      { personName: 'Stian Kvalvaag', role: 'styremedlem' },
      { personName: 'Bjoern Strand', role: 'styremedlem' },
      { personName: 'Tina Cecilie Johansen', role: 'styremedlem' },
    ],
  },
  {
    name: 'ASKO Agder AS',
    orgNr: '913117883',
    legalForm: 'AS',
    founded: 1976,
    naceCode: '46.390',
    naceDescription: 'Engroshandel med bredt utvalg av naerings- og nytelsesmidler',
    hqAddress: 'Vestre kystvei 191',
    hqCity: 'Lillesand',
    employees: 295,
    ownershipType: 'family',
    valueChainStage: 'logistics',
    revenue2024: 6571,
    operatingResult2024: 86,
    totalAssets2024: 853,
  },
  {
    name: 'ASKO Vestfold Telemark AS',
    orgNr: '933129950',
    legalForm: 'AS',
    founded: 1974,
    naceCode: '46.390',
    naceDescription: 'Engroshandel med bredt utvalg av naerings- og nytelsesmidler',
    hqAddress: 'Hegdalveien 87',
    hqCity: 'Larvik',
    employees: 171,
    ownershipType: 'family',
    valueChainStage: 'logistics',
    revenue2024: 6467,
    operatingResult2024: 86,
    totalAssets2024: 792,
  },
  {
    name: 'ASKO Oest AS',
    orgNr: '912015238',
    legalForm: 'AS',
    founded: 1962,
    naceCode: '46.390',
    naceDescription: 'Engroshandel med bredt utvalg av naerings- og nytelsesmidler',
    hqAddress: 'Delitoppen 4',
    hqCity: 'Vestby',
    employees: 300,
    ownershipType: 'family',
    valueChainStage: 'logistics',
    revenue2024: 6315,
    operatingResult2024: 31,
    totalAssets2024: 984,
  },
  {
    name: 'ASKO Nord AS',
    orgNr: '979655215',
    legalForm: 'AS',
    founded: 1998,
    naceCode: '46.390',
    naceDescription: 'Engroshandel med bredt utvalg av naerings- og nytelsesmidler',
    hqAddress: 'Kjoselvmoen 84',
    hqCity: 'Tromsoe',
    employees: 257,
    ownershipType: 'family',
    valueChainStage: 'logistics',
    revenue2024: 5879,
    operatingResult2024: 48,
    totalAssets2024: 914,
  },
  {
    name: 'ASKO Molde AS',
    orgNr: '813612992',
    legalForm: 'AS',
    founded: 1971,
    naceCode: '46.390',
    naceDescription: 'Engroshandel med bredt utvalg av naerings- og nytelsesmidler',
    hqAddress: 'Aarosetervegen 20',
    hqCity: 'Molde',
    employees: 108,
    ownershipType: 'family',
    valueChainStage: 'logistics',
    revenue2024: 2870,
    operatingResult2024: 53,
    totalAssets2024: 409,
  },

  // ─── Functional subsidiaries ──────────────────────────────────
  {
    name: 'ASKO Transport AS',
    orgNr: '999320600',
    legalForm: 'AS',
    founded: 2012,
    naceCode: '52.291',
    naceDescription: 'Spedisjon',
    hqAddress: 'Deliveien 33',
    hqCity: 'Vestby',
    employees: 92,
    ownershipType: 'family',
    valueChainStage: 'logistics',
  },
  {
    name: 'ASKO Maritime AS',
    orgNr: '925216534',
    legalForm: 'AS',
    founded: 2020,
    naceCode: '52.291',
    naceDescription: 'Spedisjon',
    hqAddress: 'Tollbugata 1',
    hqCity: 'Horten',
    employees: 6,
    ownershipType: 'family',
    valueChainStage: 'logistics',
  },
  {
    name: 'ASKO Fornybar AS',
    orgNr: '916286074',
    legalForm: 'AS',
    founded: 2015,
    naceCode: '35.112',
    naceDescription: 'Produksjon av elektrisitet fra vindkraft',
    hqAddress: 'Skurvemarka 21',
    hqCity: 'Aalgaard',
    ownershipType: 'family',
    valueChainStage: 'logistics',
  },
  {
    name: 'ASKO Mat AS',
    orgNr: '925109185',
    legalForm: 'AS',
    founded: 2020,
    naceCode: '56.210',
    naceDescription: 'Cateringvirksomhet',
    hqAddress: 'Haakonsgata 16A',
    hqCity: 'Oersta',
    employees: 7,
    ownershipType: 'family',
    valueChainStage: 'foodservice',
  },
  {
    name: 'ASKO Bygg Vestby AS',
    orgNr: '884133572',
    legalForm: 'AS',
    founded: 2002,
    naceCode: '68.209',
    naceDescription: 'Utleie av egen eller leid fast eiendom ellers',
    hqAddress: 'Delitoppen 4',
    hqCity: 'Vestby',
    employees: 7,
    ownershipType: 'family',
    valueChainStage: 'logistics',
  },
]

type PropertyData = {
  companyOrgNr: string
  propertyType: string
  address?: string
  municipality: string
  county: string
  lat?: number
  lng?: number
  sqMeters?: number
  selfLeased?: boolean
  tenantOrgNr?: string
  source: string
}

const properties: PropertyData[] = [
  { companyOrgNr: '930622974', propertyType: 'warehouse', address: 'Hanekleiva 76', municipality: 'Holmestrand', county: 'Vestfold og Telemark', lat: 59.49, lng: 10.08, source: 'Broennoysund — ASKO Oslofjord HQ/lager' },
  { companyOrgNr: '912015238', propertyType: 'warehouse', address: 'Delitoppen 4', municipality: 'Vestby', county: 'Akershus', lat: 59.601, lng: 10.743, sqMeters: 80000, source: 'asko.no — Sentrallager Vestby', selfLeased: true, tenantOrgNr: NG_ORG },
  { companyOrgNr: '979487916', propertyType: 'warehouse', address: 'Magnusvegen 10', municipality: 'Bergen', county: 'Vestland', lat: 60.30, lng: 5.28, source: 'Broennoysund — ASKO Vest' },
  { companyOrgNr: '979334109', propertyType: 'warehouse', address: 'Oestre Rosten 104', municipality: 'Trondheim', county: 'Troendelag', lat: 63.378, lng: 10.363, source: 'Broennoysund — ASKO Midt-Norge' },
  { companyOrgNr: '979655215', propertyType: 'warehouse', address: 'Kjoselvmoen 84', municipality: 'Tromsoe', county: 'Troms', lat: 69.599, lng: 19.120, source: 'Broennoysund — ASKO Nord' },
  { companyOrgNr: '923622845', propertyType: 'warehouse', address: 'Skurvemarka 21', municipality: 'Gjesdal', county: 'Rogaland', lat: 58.85, lng: 5.73, source: 'Broennoysund — ASKO Rogaland' },
  { companyOrgNr: '913117883', propertyType: 'warehouse', address: 'Vestre kystvei 191', municipality: 'Lillesand', county: 'Agder', lat: 58.25, lng: 8.38, source: 'Broennoysund — ASKO Agder' },
  { companyOrgNr: '918710507', propertyType: 'warehouse', address: 'Skansvegen 5', municipality: 'Ringsaker', county: 'Innlandet', lat: 60.79, lng: 11.07, source: 'Broennoysund — ASKO Hedmark' },
  { companyOrgNr: '933129950', propertyType: 'warehouse', address: 'Hegdalveien 87', municipality: 'Larvik', county: 'Vestfold og Telemark', lat: 59.05, lng: 10.03, source: 'Broennoysund — ASKO Vestfold Telemark' },
  { companyOrgNr: '813612992', propertyType: 'warehouse', address: 'Aarosetervegen 20', municipality: 'Molde', county: 'Moere og Romsdal', lat: 62.74, lng: 7.16, source: 'Broennoysund — ASKO Molde' },
]

const askoHoldingBoard = [
  { personName: 'Runar Hollevik', role: 'styreleder' },
  { personName: 'Tore Bekken', role: 'daglig leder' },
  { personName: 'Grete Ovanger', role: 'styremedlem' },
  { personName: 'Dina Thune', role: 'styremedlem' },
  { personName: 'Kristine Stranne', role: 'styremedlem' },
  { personName: 'Knut Hartvig Johannson', role: 'styremedlem' },
  { personName: 'Jan Paul Bjoerkoey', role: 'styremedlem' },
]

async function resolveCompanyId(orgNr: string): Promise<string | null> {
  const company = await prisma.company.findUnique({
    where: { orgNr },
    select: { id: true },
  })
  return company?.id ?? null
}

async function importAskoCompanies() {
  console.log('Importing ASKO regional companies...\n')
  let created = 0

  for (const c of askoCompanies) {
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

  console.log(`\n${created} ASKO companies imported`)
  return created
}

async function updateAskoHoldingBoard() {
  console.log('\nUpdating ASKO Norge AS board from Broennoysund...\n')

  const holdingId = await resolveCompanyId(ASKO_PARENT_ORG)
  if (!holdingId) {
    console.log('  SKIP: ASKO Norge AS not found')
    return
  }

  await prisma.boardMember.deleteMany({ where: { companyId: holdingId } })
  for (const b of askoHoldingBoard) {
    await prisma.boardMember.create({
      data: {
        companyId: holdingId,
        personName: b.personName,
        role: b.role,
        personKey: normalizePersonKey(b.personName),
      },
    })
    console.log(`  ${b.personName} (${b.role})`)
  }
  console.log(`\n${askoHoldingBoard.length} board members updated`)
}

async function importFinancials() {
  console.log('\nImporting ASKO 2024 financials...\n')
  let imported = 0

  const financialData = askoCompanies
    .filter(c => c.revenue2024)
    .map(c => ({
      orgNr: c.orgNr,
      year: 2024,
      revenueNok: c.revenue2024! * 1_000_000,
      operatingResult: (c.operatingResult2024 ?? 0) * 1_000_000,
      operatingMargin: c.operatingResult2024 && c.revenue2024
        ? Math.round((c.operatingResult2024 / c.revenue2024) * 10000) / 100
        : undefined,
      groupEmployees: c.employees,
    }))

  const holdingFinancials = {
    orgNr: ASKO_PARENT_ORG,
    year: 2024,
    revenueNok: 524_000_000,
    operatingResult: 21_000_000,
    operatingMargin: undefined as number | undefined,
    groupEmployees: 107,
  }
  financialData.push(holdingFinancials)

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
        source: 'Brønnøysund / offentligdata MCP 2026-03',
      },
      create: {
        companyId,
        year: f.year,
        revenueNok: f.revenueNok,
        operatingResult: f.operatingResult,
        operatingMargin: f.operatingMargin,
        groupEmployees: f.groupEmployees,
        source: 'Brønnøysund / offentligdata MCP 2026-03',
      },
    })

    const name = askoCompanies.find(c => c.orgNr === f.orgNr)?.name ?? 'ASKO Norge AS'
    console.log(`  ${name}: ${(f.revenueNok / 1e9).toFixed(1)}B NOK`)
    imported++
  }

  console.log(`\n${imported} financial records imported`)
}

async function importOwnership() {
  console.log('\nImporting ASKO ownership tree...\n')
  let imported = 0

  const parentId = await resolveCompanyId(ASKO_PARENT_ORG)
  if (!parentId) {
    console.log('  SKIP: ASKO Norge AS not found')
    return
  }

  for (const c of askoCompanies) {
    const childId = await resolveCompanyId(c.orgNr)
    if (!childId) {
      console.log(`  SKIP: ${c.orgNr} not found`)
      continue
    }

    await prisma.companyOwnership.upsert({
      where: {
        parentCompanyId_childCompanyId: { parentCompanyId: parentId, childCompanyId: childId },
      },
      update: {
        ownershipPct: 100,
        ownershipType: 'subsidiary',
        source: 'Broennoysundregistrene / NorgesGruppen aarsrapport 2024',
      },
      create: {
        parentCompanyId: parentId,
        childCompanyId: childId,
        ownershipPct: 100,
        ownershipType: 'subsidiary',
        source: 'Broennoysundregistrene / NorgesGruppen aarsrapport 2024',
      },
    })

    console.log(`  ASKO Norge -> ${c.name} (100%)`)
    imported++
  }

  console.log(`\n${imported} ownership records imported`)
}

async function importProperties() {
  console.log('\nImporting ASKO warehouse properties...\n')
  let imported = 0

  for (const p of properties) {
    const companyId = await resolveCompanyId(p.companyOrgNr)
    if (!companyId) {
      console.log(`  SKIP: ${p.companyOrgNr} not found`)
      continue
    }

    let tenantCompanyId: string | undefined
    if (p.tenantOrgNr) {
      tenantCompanyId = (await resolveCompanyId(p.tenantOrgNr)) ?? undefined
    }

    const existing = await prisma.companyProperty.findFirst({
      where: { companyId, address: p.address ?? p.municipality },
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
          sqMeters: p.sqMeters,
          selfLeased: p.selfLeased ?? false,
          tenantCompanyId,
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
  console.log('\nImporting ASKO key person profiles...\n')

  const persons = [
    {
      name: 'Tore Bekken',
      personKey: normalizePersonKey('Tore Bekken'),
      biography: 'CEO av ASKO Norge AS. Styreleder i ASKO Midt-Norge AS. Sentral i NorgesGruppens logistikkstrategi og groen omstilling (200+ el-lastebiler, ASKO Fornybar). Foer 1966.',
      roles: [
        { companyName: 'ASKO Norge AS', role: 'Daglig leder (CEO)', fromYear: 2023 },
        { companyName: 'ASKO Midt-Norge AS', role: 'Styreleder', fromYear: 2023 },
      ],
      tags: ['asko', 'logistics', 'ceo', 'sustainability'],
    },
    {
      name: 'Grete Ovanger',
      personKey: normalizePersonKey('Grete Ovanger'),
      biography: 'Styremedlem i baade ASKO Norge AS og ASKO Midt-Norge AS. Interlocking director paa tvers av ASKO-systemet.',
      roles: [
        { companyName: 'ASKO Norge AS', role: 'Styremedlem', fromYear: 2023 },
        { companyName: 'ASKO Midt-Norge AS', role: 'Styremedlem', fromYear: 2023 },
      ],
      tags: ['asko', 'interlocking-director'],
    },
    {
      name: 'Knut Hartvig Johannson',
      personKey: normalizePersonKey('Knut Hartvig Johannson'),
      biography: 'Grunnleggerfamilien Johannson. Styremedlem i ASKO Norge AS. Foer 1937. Familien kontrollerer 74.4% av NorgesGruppen ASA. Norges mektigste dagligvarefamilie.',
      roles: [
        { companyName: 'ASKO Norge AS', role: 'Styremedlem', fromYear: 2020 },
        { companyName: 'NorgesGruppen ASA', role: 'Storaksjonaer (74.4% via familie)', fromYear: 1990 },
      ],
      tags: ['asko', 'norgesgruppen', 'founding-family', 'maktkonsentrasjon'],
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
  console.log('=== ASKO Corporate Tree: Full Subsidiary Map ===\n')

  await importAskoCompanies()
  await updateAskoHoldingBoard()
  await importFinancials()
  await importOwnership()
  await importProperties()
  await importPersonProfiles()

  const askoCount = await prisma.company.count({
    where: { orgNr: { startsWith: '9' }, name: { contains: 'ASKO' } },
  })

  const totalRevenue = askoCompanies
    .filter(c => c.revenue2024)
    .reduce((sum, c) => sum + (c.revenue2024 ?? 0), 0)

  const totalEmployees = askoCompanies
    .filter(c => c.employees)
    .reduce((sum, c) => sum + (c.employees ?? 0), 0)

  console.log('\n=== ASKO System Summary ===')
  console.log(`Regional wholesale revenue: ${(totalRevenue / 1000).toFixed(1)}B NOK`)
  console.log(`Total employees (subsidiaries): ${totalEmployees}`)
  console.log('Total companies:', await prisma.company.count())
  console.log('Ownership records:', await prisma.companyOwnership.count())
  console.log('Board members:', await prisma.boardMember.count())
  console.log('Person profiles:', await prisma.personProfile.count())
}

main()
  .catch((e) => {
    console.error('ASKO import failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
