import 'dotenv/config'
import { canonicalPersonKey as normalizePersonKey } from '../src/lib/person-key'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import {
  boardMemberProvenanceData,
  resolveBoardMemberAnnualReportSourceLocator,
} from '../src/lib/board-member-provenance'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function loadDocumentRefs() {
  const documents = await prisma.document.findMany({ select: { id: true, slug: true } })
  return new Set(
    documents.flatMap((document) => [document.id, document.slug].filter(Boolean) as string[]),
  )
}

const NG_ORG = '819731322'

type NGCompany = {
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

const ngCompanies: NGCompany[] = [
  // ─── Retail concepts (direct subsidiaries of NG ASA) ───────────
  {
    name: 'Kiwi Norge AS',
    orgNr: '975959171',
    legalForm: 'AS',
    founded: 1995,
    naceCode: '82.990',
    naceDescription: 'Annen forretningsmessig tjenesteyting',
    hqAddress: 'Ringeriksveien 4B',
    hqCity: 'Lierstranda',
    ownershipType: 'family',
    valueChainStage: 'retail',
    revenue2024: 1739,
    operatingResult2024: 104,
    totalAssets2024: 2330,
    boardMembers: [
      { personName: 'Runar Hollevik', role: 'styreleder' },
      { personName: 'Oyvind Andersen', role: 'styremedlem' },
      { personName: 'Silje Elisabeth Hals', role: 'styremedlem' },
      { personName: 'Nina Brendsrud-Andersen', role: 'styremedlem' },
      { personName: 'Truls Fjeldstad', role: 'styremedlem' },
    ],
  },
  {
    name: 'Kiwi Minidrift AS',
    orgNr: '985131406',
    legalForm: 'AS',
    founded: 2002,
    naceCode: '82.990',
    naceDescription: 'Annen forretningsmessig tjenesteyting',
    hqAddress: 'Ringeriksveien 4B',
    hqCity: 'Lierstranda',
    employees: 165,
    ownershipType: 'family',
    valueChainStage: 'retail',
    revenue2024: 796,
    operatingResult2024: 334,
    totalAssets2024: 771,
  },
  {
    name: 'MENY AS',
    orgNr: '977066727',
    legalForm: 'AS',
    founded: 1996,
    naceCode: '82.990',
    naceDescription: 'Annen forretningsmessig tjenesteyting',
    hqAddress: 'Karenslyst alle 12',
    hqCity: 'Oslo',
    employees: 108,
    ownershipType: 'family',
    valueChainStage: 'retail',
    revenue2024: 616,
    operatingResult2024: -14,
    totalAssets2024: 405,
    boardMembers: [
      { personName: 'Runar Hollevik', role: 'styreleder' },
      { personName: 'Mette Lier', role: 'styremedlem' },
      { personName: 'Ivar Jorgen Bjoner', role: 'styremedlem' },
      { personName: 'Truls Fjeldstad', role: 'styremedlem' },
      { personName: 'Trine Groven', role: 'styremedlem' },
      { personName: 'Kristine Hartviksen', role: 'styremedlem' },
      { personName: 'Martin Gran', role: 'styremedlem' },
    ],
  },
  {
    name: 'Meny Butikkdrift AS',
    orgNr: '989578790',
    legalForm: 'AS',
    founded: 2006,
    naceCode: '47.111',
    naceDescription: 'Butikkhandel med bredt vareutvalg med hovedvekt paa naerings- og nytelsesmidler',
    hqAddress: 'Karenslyst alle 12',
    hqCity: 'Oslo',
    ownershipType: 'family',
    valueChainStage: 'retail',
    totalAssets2024: 2699,
  },
  {
    name: 'Kjopmannshuset Norge AS',
    orgNr: '977263646',
    legalForm: 'AS',
    founded: 1997,
    naceCode: '82.990',
    naceDescription: 'Annen forretningsmessig tjenesteyting',
    hqAddress: 'Karenslyst alle 12',
    hqCity: 'Oslo',
    employees: 134,
    ownershipType: 'family',
    valueChainStage: 'retail',
    revenue2024: 531,
    operatingResult2024: -22,
    totalAssets2024: 561,
    boardMembers: [
      { personName: 'Runar Hollevik', role: 'styreleder' },
      { personName: 'Rune Kvamsoey', role: 'styremedlem' },
      { personName: 'Torgeir Herlofsen', role: 'styremedlem' },
      { personName: 'Dina Thune', role: 'styremedlem' },
      { personName: 'Anita Steinseth', role: 'styremedlem' },
      { personName: 'Mai Kile', role: 'styremedlem' },
      { personName: 'Ling Ling Chen', role: 'styremedlem' },
      { personName: 'Nina Brendsrud-Andersen', role: 'styremedlem' },
      { personName: 'Truls Fjeldstad', role: 'styremedlem' },
    ],
  },
  {
    name: 'Kjopmannshuset Butikkdrift AS',
    orgNr: '995915820',
    legalForm: 'AS',
    founded: 2010,
    naceCode: '47.111',
    naceDescription: 'Butikkhandel med bredt vareutvalg med hovedvekt paa naerings- og nytelsesmidler',
    hqAddress: 'Karenslyst alle 12',
    hqCity: 'Oslo',
    ownershipType: 'family',
    valueChainStage: 'retail',
    totalAssets2024: 339,
  },

  // ─── Convenience / service retail ──────────────────────────────
  {
    name: 'NorgesGruppen Servicehandel AS',
    orgNr: '976769511',
    legalForm: 'AS',
    founded: 1996,
    naceCode: '47.300',
    naceDescription: 'Detaljhandel med drivstoff til motorvogner',
    hqAddress: 'Karenslyst alle 12',
    hqCity: 'Oslo',
    employees: 23,
    ownershipType: 'family',
    valueChainStage: 'retail',
    revenue2024: 81,
    operatingResult2024: -2,
    totalAssets2024: 267,
    boardMembers: [
      { personName: 'Runar Hollevik', role: 'styreleder' },
      { personName: 'Rune Spikseth', role: 'styremedlem' },
      { personName: 'Finn Torstein Dybvik', role: 'styremedlem' },
      { personName: 'Kristine Arvin', role: 'styremedlem' },
      { personName: 'Bodil Ragner', role: 'styremedlem' },
    ],
  },
  {
    name: 'Deli de Luca Norge AS',
    orgNr: '985402779',
    legalForm: 'AS',
    founded: 2003,
    naceCode: '52.100',
    naceDescription: 'Lagring',
    hqAddress: 'Karenslyst alle 12',
    hqCity: 'Oslo',
    employees: 21,
    ownershipType: 'family',
    valueChainStage: 'retail',
    revenue2024: 103,
    operatingResult2024: -1,
    totalAssets2024: 69,
    boardMembers: [
      { personName: 'Kristine Stranne', role: 'styreleder' },
      { personName: 'Odd Ture Wang', role: 'styremedlem' },
      { personName: 'Leif Petter Tunold', role: 'styremedlem' },
      { personName: 'Anne Dahl', role: 'styremedlem' },
      { personName: 'Stein Rommerud', role: 'styremedlem' },
    ],
  },

  // ─── Investment / detalj holding ───────────────────────────────
  {
    name: 'NorgesGruppen Detalj AS',
    orgNr: '882578402',
    legalForm: 'AS',
    founded: 2001,
    naceCode: '68.320',
    naceDescription: 'Eiendomsforvaltning',
    hqAddress: 'Karenslyst alle 12',
    hqCity: 'Oslo',
    employees: 26,
    ownershipType: 'family',
    valueChainStage: 'retail',
    revenue2024: 44,
    operatingResult2024: -5,
    totalAssets2024: 3331,
    boardMembers: [
      { personName: 'Runar Hollevik', role: 'styreleder' },
      { personName: 'Truls Fjeldstad', role: 'daglig leder' },
      { personName: 'Erik Gulbrandsen', role: 'styremedlem' },
    ],
  },

  // ─── Brand / production holding (Merkevare) ────────────────────
  {
    name: 'NorgesGruppen Merkevare AS',
    orgNr: '997732812',
    legalForm: 'AS',
    founded: 2011,
    naceCode: '47.111',
    naceDescription: 'Butikkhandel med bredt vareutvalg med hovedvekt paa naerings- og nytelsesmidler',
    hqAddress: 'Karenslyst alle 12',
    hqCity: 'Oslo',
    ownershipType: 'family',
    valueChainStage: 'processing',
    totalAssets2024: 1595,
  },
  {
    name: 'Joh. Johannson Kaffe AS',
    orgNr: '913283805',
    legalForm: 'AS',
    founded: 1960,
    naceCode: '10.830',
    naceDescription: 'Bearbeiding av te og kaffe',
    hqAddress: 'Treveien 6',
    hqCity: 'Vestby',
    employees: 39,
    ownershipType: 'family',
    valueChainStage: 'processing',
    revenue2024: 1281,
    operatingResult2024: 119,
    totalAssets2024: 829,
    boardMembers: [
      { personName: 'Johan Johannson', role: 'styreleder' },
      { personName: 'Oyvind Andersen', role: 'styremedlem' },
      { personName: 'Kristine Stranne', role: 'styremedlem' },
    ],
  },
  {
    name: 'Bakehuset AS',
    orgNr: '914183332',
    legalForm: 'AS',
    founded: 1930,
    naceCode: '10.710',
    naceDescription: 'Produksjon av broed og ferske konditorvarer',
    hqAddress: 'Eikenga 19',
    hqCity: 'Oslo',
    employees: 1004,
    ownershipType: 'family',
    valueChainStage: 'processing',
    revenue2024: 2151,
    operatingResult2024: 114,
    totalAssets2024: 1221,
    boardMembers: [
      { personName: 'Oyvind Andersen', role: 'styreleder' },
      { personName: 'Geir Alsaker', role: 'styremedlem' },
      { personName: 'Roar Bakkejord', role: 'styremedlem' },
      { personName: 'Kjell Arne Ness', role: 'styremedlem' },
      { personName: 'Heidi Dahl', role: 'styremedlem' },
      { personName: 'Kristine Stranne', role: 'styremedlem' },
      { personName: 'Finn Torstein Dybvik', role: 'styremedlem' },
      { personName: 'Ulrikke Nilsen', role: 'styremedlem' },
    ],
  },

  // ─── Shared services ───────────────────────────────────────────
  {
    name: 'NorgesGruppen Fellestjenester AS',
    orgNr: '983392970',
    legalForm: 'AS',
    founded: 2001,
    naceCode: '47.111',
    naceDescription: 'Butikkhandel med bredt vareutvalg med hovedvekt paa naerings- og nytelsesmidler',
    hqAddress: 'Karenslyst alle 12',
    hqCity: 'Oslo',
    ownershipType: 'family',
    valueChainStage: 'retail',
    totalAssets2024: 86,
  },
  {
    name: 'NorgesGruppen Data AS',
    orgNr: '971047917',
    legalForm: 'AS',
    founded: 1994,
    naceCode: '62.010',
    naceDescription: 'Programmeringstjenester',
    hqAddress: 'Bedriftsveien 9',
    hqCity: 'Oslo',
    employees: 288,
    ownershipType: 'family',
    valueChainStage: 'retail',
    revenue2024: 1413,
    operatingResult2024: 11,
    totalAssets2024: 2378,
    boardMembers: [
      { personName: 'Runar Hollevik', role: 'styreleder' },
      { personName: 'Tore Bekken', role: 'styremedlem' },
      { personName: 'Truls Fjeldstad', role: 'styremedlem' },
      { personName: 'Merete Lokse', role: 'styremedlem' },
      { personName: 'Hilde Oygarden', role: 'styremedlem' },
      { personName: 'Mette Lier', role: 'styremedlem' },
      { personName: 'Camilla Soberg', role: 'styremedlem' },
      { personName: 'Zakaria El Mansouri', role: 'styremedlem' },
    ],
  },
  {
    name: 'NorgesGruppen Regnskap AS',
    orgNr: '883743512',
    legalForm: 'AS',
    founded: 2001,
    naceCode: '69.201',
    naceDescription: 'Regnskap og bokfoering',
    hqAddress: 'Jemtlandsvegen 14',
    hqCity: 'Brumunddal',
    employees: 90,
    ownershipType: 'family',
    valueChainStage: 'retail',
    revenue2024: 116,
    operatingResult2024: 4,
    totalAssets2024: 51,
    boardMembers: [
      { personName: 'Mette Lier', role: 'styreleder' },
      { personName: 'Geir Alsaker', role: 'styremedlem' },
      { personName: 'Aleksander Jorgenrud', role: 'styremedlem' },
      { personName: 'Asne Bjorndal', role: 'styremedlem' },
      { personName: 'Katrine Nyronning', role: 'styremedlem' },
    ],
  },

  // ─── Real estate ───────────────────────────────────────────────
  {
    name: 'NorgesGruppen Eiendom Holding AS',
    orgNr: '997747054',
    legalForm: 'AS',
    founded: 2011,
    naceCode: '68.209',
    naceDescription: 'Utleie av egen eller leid fast eiendom ellers',
    hqAddress: 'Karenslyst alle 12-14',
    hqCity: 'Oslo',
    ownershipType: 'family',
    valueChainStage: 'retail',
    totalAssets2024: 4069,
  },
  {
    name: 'NorgesGruppen Eiendom AS',
    orgNr: '976542223',
    legalForm: 'AS',
    founded: 1996,
    naceCode: '68.320',
    naceDescription: 'Eiendomsforvaltning',
    hqAddress: 'Karenslyst alle 12-14',
    hqCity: 'Oslo',
    employees: 18,
    ownershipType: 'family',
    valueChainStage: 'retail',
    revenue2024: 30,
    operatingResult2024: -18,
    totalAssets2024: 37,
    boardMembers: [
      { personName: 'Stig Boerger Bratlie', role: 'styreleder' },
      { personName: 'Oistein Pjaaka', role: 'daglig leder' },
      { personName: 'Ingjald Sorhoey', role: 'styremedlem' },
    ],
  },
  {
    name: 'NorgesGruppen Eiendomskapital AS',
    orgNr: '989009001',
    legalForm: 'AS',
    founded: 2005,
    naceCode: '68.209',
    naceDescription: 'Utleie av egen eller leid fast eiendom ellers',
    hqAddress: 'Karenslyst alle 12-14',
    hqCity: 'Oslo',
    ownershipType: 'family',
    valueChainStage: 'retail',
    totalAssets2024: 1160,
  },
  {
    name: 'NorgesGruppen Eiendomsutvikling AS',
    orgNr: '995666553',
    legalForm: 'AS',
    founded: 2010,
    naceCode: '41.109',
    naceDescription: 'Utvikling og salg av egen fast eiendom ellers',
    hqAddress: 'Karenslyst alle 12-14',
    hqCity: 'Oslo',
    ownershipType: 'family',
    valueChainStage: 'retail',
    totalAssets2024: 29,
  },

  // ─── Finance ───────────────────────────────────────────────────
  {
    name: 'NorgesGruppen Finans Holding AS',
    orgNr: '920341659',
    legalForm: 'AS',
    founded: 2018,
    naceCode: '64.201',
    naceDescription: 'Finansielle holdingselskaper',
    hqAddress: 'Karenslyst alle 12',
    hqCity: 'Oslo',
    ownershipType: 'family',
    valueChainStage: 'retail',
  },
  {
    name: 'NorgesGruppen Finans AS',
    orgNr: '920428959',
    legalForm: 'AS',
    founded: 2018,
    naceCode: '64.920',
    naceDescription: 'Annen kredittgivning',
    hqAddress: 'Karenslyst alle 12',
    hqCity: 'Oslo',
    employees: 23,
    ownershipType: 'family',
    valueChainStage: 'retail',
  },
]

const ngBoard = [
  { personName: 'Johan Johannson', role: 'styreleder' },
  { personName: 'Liv Gisele Marchand', role: 'styremedlem' },
  { personName: 'Orjan Svanevik', role: 'styremedlem' },
  { personName: 'Hilde Vatne', role: 'styremedlem' },
  { personName: 'Guri Storvold', role: 'styremedlem' },
  { personName: 'Jan Magne Borgen', role: 'styremedlem' },
  { personName: 'Martine Steinsholt', role: 'styremedlem' },
  { personName: 'Filip Lorentzen', role: 'styremedlem' },
  { personName: 'Cecilie Myhre', role: 'styremedlem' },
  { personName: 'Mats Gunnar Knudsen', role: 'styremedlem' },
]

type OwnershipLink = {
  parentOrgNr: string
  childOrgNr: string
  ownershipPct: number | null
  ownershipType: string
}

const ownershipLinks: OwnershipLink[] = [
  // NG ASA -> direct subsidiaries
  { parentOrgNr: NG_ORG, childOrgNr: '975959171', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: NG_ORG, childOrgNr: '977066727', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: NG_ORG, childOrgNr: '977263646', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: NG_ORG, childOrgNr: '882578402', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: NG_ORG, childOrgNr: '976769511', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: NG_ORG, childOrgNr: '929228723', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: NG_ORG, childOrgNr: '997732812', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: NG_ORG, childOrgNr: '983392970', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: NG_ORG, childOrgNr: '997747054', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: NG_ORG, childOrgNr: '920341659', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: NG_ORG, childOrgNr: '914224314', ownershipPct: 46, ownershipType: 'minority-stake' },
  // Kiwi Norge -> Kiwi Minidrift
  { parentOrgNr: '975959171', childOrgNr: '985131406', ownershipPct: 100, ownershipType: 'subsidiary' },
  // MENY -> Meny Butikkdrift
  { parentOrgNr: '977066727', childOrgNr: '989578790', ownershipPct: 100, ownershipType: 'subsidiary' },
  // Kjopmannshuset -> Kjopmannshuset Butikkdrift
  { parentOrgNr: '977263646', childOrgNr: '995915820', ownershipPct: 100, ownershipType: 'subsidiary' },
  // Servicehandel -> Deli de Luca
  { parentOrgNr: '976769511', childOrgNr: '985402779', ownershipPct: 100, ownershipType: 'subsidiary' },
  // Merkevare -> Unil (existing), Joh Johannson Kaffe, Bakehuset
  { parentOrgNr: '997732812', childOrgNr: '885316522', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: '997732812', childOrgNr: '913283805', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: '997732812', childOrgNr: '914183332', ownershipPct: 100, ownershipType: 'subsidiary' },
  // Fellestjenester -> Data, Regnskap
  { parentOrgNr: '983392970', childOrgNr: '971047917', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: '983392970', childOrgNr: '883743512', ownershipPct: 100, ownershipType: 'subsidiary' },
  // Eiendom Holding -> Eiendom, Eiendomskapital
  { parentOrgNr: '997747054', childOrgNr: '976542223', ownershipPct: 100, ownershipType: 'subsidiary' },
  { parentOrgNr: '997747054', childOrgNr: '989009001', ownershipPct: 100, ownershipType: 'subsidiary' },
  // Eiendom -> Eiendomsutvikling
  { parentOrgNr: '976542223', childOrgNr: '995666553', ownershipPct: 100, ownershipType: 'subsidiary' },
  // Finans Holding -> Finans
  { parentOrgNr: '920341659', childOrgNr: '920428959', ownershipPct: 100, ownershipType: 'subsidiary' },
]

async function resolveCompanyId(orgNr: string): Promise<string | null> {
  const company = await prisma.company.findUnique({
    where: { orgNr },
    select: { id: true },
  })
  return company?.id ?? null
}

async function importCompanies() {
  console.log('Importing NorgesGruppen subsidiaries...\n')
  let created = 0
  const documentRefs = await loadDocumentRefs()
  const importedAt = new Date()

  for (const c of ngCompanies) {
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
      const boardMemberSourceLocator = resolveBoardMemberAnnualReportSourceLocator(
        { company: { orgNr: c.orgNr } },
        documentRefs,
      )
      for (const b of c.boardMembers) {
        await prisma.boardMember.create({
          data: {
            companyId: company.id,
            personName: b.personName,
            role: b.role,
            personKey: normalizePersonKey(b.personName),
            ...boardMemberProvenanceData(boardMemberSourceLocator, importedAt),
          },
        })
      }
    }

    const rev = c.revenue2024 ? ` — ${(c.revenue2024 / 1000).toFixed(1)}B NOK` : ''
    const emp = c.employees ? `, ${c.employees} emp` : ''
    console.log(`  ${company.name} (${c.orgNr}${emp}${rev})`)
    created++
  }

  console.log(`\n${created} NorgesGruppen companies imported`)
  return created
}

async function updateNGBoard() {
  console.log('\nUpdating NorgesGruppen ASA board...\n')

  const ngId = await resolveCompanyId(NG_ORG)
  if (!ngId) {
    console.log('  SKIP: NorgesGruppen ASA not found')
    return
  }

  await prisma.boardMember.deleteMany({ where: { companyId: ngId } })
  const documentRefs = await loadDocumentRefs()
  const importedAt = new Date()
  const boardMemberSourceLocator = resolveBoardMemberAnnualReportSourceLocator(
    { company: { orgNr: NG_ORG } },
    documentRefs,
  )
  for (const b of ngBoard) {
    await prisma.boardMember.create({
      data: {
        companyId: ngId,
        personName: b.personName,
        role: b.role,
        personKey: normalizePersonKey(b.personName),
        ...boardMemberProvenanceData(boardMemberSourceLocator, importedAt),
      },
    })
    console.log(`  ${b.personName} (${b.role})`)
  }
  console.log(`\n${ngBoard.length} board members updated`)
}

async function importFinancials() {
  console.log('\nImporting NorgesGruppen 2024 financials...\n')
  let imported = 0

  const financialData = ngCompanies
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

  const ngHolding = {
    orgNr: NG_ORG,
    year: 2024,
    revenueNok: 590_000_000,
    operatingResult: -230_000_000,
    operatingMargin: undefined as number | undefined,
    groupEmployees: 150,
  }
  financialData.push(ngHolding)

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

    const name = ngCompanies.find(c => c.orgNr === f.orgNr)?.name ?? 'NorgesGruppen ASA'
    console.log(`  ${name}: ${(f.revenueNok / 1e9).toFixed(2)}B NOK`)
    imported++
  }

  console.log(`\n${imported} financial records imported`)
}

async function importOwnership() {
  console.log('\nImporting NorgesGruppen ownership tree...\n')
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
        source: 'Broennoysundregistrene / NorgesGruppen aarsrapport 2024',
      },
      create: {
        parentCompanyId: parentId,
        childCompanyId: childId,
        ownershipPct: link.ownershipPct,
        ownershipType: link.ownershipType,
        source: 'Broennoysundregistrene / NorgesGruppen aarsrapport 2024',
      },
    })

    const parentName = ngCompanies.find(c => c.orgNr === link.parentOrgNr)?.name ?? link.parentOrgNr
    const childName = ngCompanies.find(c => c.orgNr === link.childOrgNr)?.name ?? link.childOrgNr
    console.log(`  ${parentName} -> ${childName} (${link.ownershipPct ?? '?'}%)`)
    imported++
  }

  console.log(`\n${imported} ownership records imported`)
}

async function importPersonProfiles() {
  console.log('\nImporting NorgesGruppen key person profiles...\n')

  const persons = [
    {
      name: 'Runar Hollevik',
      personKey: normalizePersonKey('Runar Hollevik'),
      biography: 'CEO av NorgesGruppen ASA (b. 1968). Styreleder i Kiwi Norge, MENY, Kjopmannshuset Norge, NorgesGruppen Detalj, NorgesGruppen Servicehandel, NorgesGruppen Data, og ASKO Norge. Sentral i NorgesGruppen-systemets operative ledelse.',
      roles: [
        { companyName: 'NorgesGruppen ASA', role: 'CEO (Daglig leder)', fromYear: 2020 },
        { companyName: 'Kiwi Norge AS', role: 'Styreleder', fromYear: 2020 },
        { companyName: 'MENY AS', role: 'Styreleder', fromYear: 2020 },
        { companyName: 'Kjopmannshuset Norge AS', role: 'Styreleder', fromYear: 2020 },
        { companyName: 'NorgesGruppen Detalj AS', role: 'Styreleder', fromYear: 2020 },
        { companyName: 'NorgesGruppen Servicehandel AS', role: 'Styreleder', fromYear: 2020 },
        { companyName: 'NorgesGruppen Data AS', role: 'Styreleder', fromYear: 2020 },
        { companyName: 'ASKO Norge AS', role: 'Styreleder', fromYear: 2020 },
      ],
      tags: ['norgesgruppen', 'ceo', 'interlocking-director', 'maktkonsentrasjon'],
    },
    {
      name: 'Johan Johannson',
      personKey: normalizePersonKey('Johan Johannson'),
      biography: 'Styreleder i NorgesGruppen ASA og Joh. Johannson Kaffe AS. Johannson-familien kontrollerer 74.4% av NorgesGruppen via Joh Johannson Handel AS (64.7%) og Joh Johannson Handel II AS (9.7%). Norges mektigste dagligvarefamilie.',
      roles: [
        { companyName: 'NorgesGruppen ASA', role: 'Styreleder', fromYear: 2015 },
        { companyName: 'Joh. Johannson Kaffe AS', role: 'Styreleder', fromYear: 2010 },
      ],
      tags: ['norgesgruppen', 'founding-family', 'styreleder', 'maktkonsentrasjon'],
    },
    {
      name: 'Truls Fjeldstad',
      personKey: normalizePersonKey('Truls Fjeldstad'),
      biography: 'CEO av NorgesGruppen Detalj AS (b. 1967). Interlocking director i Kiwi Norge, MENY, Kjopmannshuset Norge og NorgesGruppen Data. Kontrollerer investerings- og eiendomsarmen.',
      roles: [
        { companyName: 'NorgesGruppen Detalj AS', role: 'Daglig leder', fromYear: 2015 },
        { companyName: 'Kiwi Norge AS', role: 'Styremedlem', fromYear: 2015 },
        { companyName: 'MENY AS', role: 'Styremedlem', fromYear: 2015 },
        { companyName: 'Kjopmannshuset Norge AS', role: 'Styremedlem', fromYear: 2015 },
        { companyName: 'NorgesGruppen Data AS', role: 'Styremedlem', fromYear: 2015 },
      ],
      tags: ['norgesgruppen', 'interlocking-director'],
    },
    {
      name: 'Oyvind Andersen',
      personKey: normalizePersonKey('Oyvind Andersen'),
      biography: 'Styreleder i Bakehuset AS og Unil AS. Styremedlem i Kiwi Norge og Joh. Johannson Kaffe. Sentral i NorgesGruppens merkevare- og produksjonsarm.',
      roles: [
        { companyName: 'Bakehuset AS', role: 'Styreleder', fromYear: 2020 },
        { companyName: 'Unil AS', role: 'Styreleder', fromYear: 2020 },
        { companyName: 'Kiwi Norge AS', role: 'Styremedlem', fromYear: 2020 },
        { companyName: 'Joh. Johannson Kaffe AS', role: 'Styremedlem', fromYear: 2020 },
      ],
      tags: ['norgesgruppen', 'interlocking-director'],
    },
    {
      name: 'Kristine Stranne',
      personKey: normalizePersonKey('Kristine Stranne'),
      biography: 'CEO av NorgesGruppen Servicehandel AS (b. 1976). Styreleder i Deli de Luca Norge. Styremedlem i Joh. Johannson Kaffe og Bakehuset. Leder conveniencesegmentet (Deli de Luca, MIX).',
      roles: [
        { companyName: 'NorgesGruppen Servicehandel AS', role: 'CEO (Daglig leder)', fromYear: 2018 },
        { companyName: 'Deli de Luca Norge AS', role: 'Styreleder', fromYear: 2018 },
        { companyName: 'Joh. Johannson Kaffe AS', role: 'Styremedlem', fromYear: 2020 },
        { companyName: 'Bakehuset AS', role: 'Styremedlem', fromYear: 2020 },
      ],
      tags: ['norgesgruppen', 'interlocking-director'],
    },
    {
      name: 'Mette Lier',
      personKey: normalizePersonKey('Mette Lier'),
      biography: 'Styreleder i NorgesGruppen Regnskap AS. Styremedlem i MENY AS og NorgesGruppen Data AS. Tverrgaaende governance-rolle i NorgesGruppen-systemet.',
      roles: [
        { companyName: 'NorgesGruppen Regnskap AS', role: 'Styreleder', fromYear: 2020 },
        { companyName: 'MENY AS', role: 'Styremedlem', fromYear: 2020 },
        { companyName: 'NorgesGruppen Data AS', role: 'Styremedlem', fromYear: 2020 },
      ],
      tags: ['norgesgruppen', 'interlocking-director'],
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
  console.log('=== NorgesGruppen Corporate Tree: Full Subsidiary Map ===\n')

  await importCompanies()
  await updateNGBoard()
  await importFinancials()
  await importOwnership()
  await importPersonProfiles()

  console.log('\n=== NorgesGruppen Summary ===')
  console.log('Total companies:', await prisma.company.count())
  console.log('Ownership records:', await prisma.companyOwnership.count())
  console.log('Board members:', await prisma.boardMember.count())
  console.log('Person profiles:', await prisma.personProfile.count())
}

main()
  .catch((e) => {
    console.error('NorgesGruppen import failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
