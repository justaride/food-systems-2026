import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

function normalizePersonKey(name: string): string {
  return name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z ]/g, '').trim().replace(/\s+/g, '-')
}

// ============================================================
// 1. NEW COMPANIES — Nordic subsidiaries + Axel Johnson parent
// ============================================================

type NordicCompany = {
  name: string
  orgNr: string
  country: string
  legalForm: string
  hqCity: string
  ownershipType: string
  valueChainStage: string
  naceCode?: string
  naceDescription?: string
  employees?: number
}

const newCompanies: NordicCompany[] = [
  // --- Sweden: Axel Johnson (parent holding) ---
  {
    name: 'Axel Johnson AB',
    orgNr: 'SE-556223-6959',
    country: 'SE',
    legalForm: 'AB',
    hqCity: 'Stockholm',
    ownershipType: 'family',
    valueChainStage: 'retail',
    naceCode: '70.100',
    naceDescription: 'Huvudkontor',
  },
  // --- Sweden: ICA Gruppen subsidiaries ---
  {
    name: 'ICA Sverige AB',
    orgNr: 'SE-556021-0261',
    country: 'SE',
    legalForm: 'AB',
    hqCity: 'Solna',
    ownershipType: 'listed',
    valueChainStage: 'retail',
    naceCode: '46.390',
    naceDescription: 'Partihandel med livsmedel',
    employees: 6981,
  },
  {
    name: 'ICA Fastigheter AB',
    orgNr: 'SE-556033-8518',
    country: 'SE',
    legalForm: 'AB',
    hqCity: 'Vasteras',
    ownershipType: 'listed',
    valueChainStage: 'retail',
    naceCode: '68.200',
    naceDescription: 'Fastighetsforvaltning',
    employees: 114,
  },
  // --- Sweden: Axfood subsidiaries ---
  {
    name: 'Willys AB',
    orgNr: 'SE-556163-2232',
    country: 'SE',
    legalForm: 'AB',
    hqCity: 'Goteborg',
    ownershipType: 'listed',
    valueChainStage: 'retail',
    naceCode: '47.110',
    naceDescription: 'Detaljhandel med livsmedel',
    employees: 6000,
  },
  {
    name: 'Hemkop AB',
    orgNr: 'SE-556113-8826',
    country: 'SE',
    legalForm: 'AB',
    hqCity: 'Stockholm',
    ownershipType: 'listed',
    valueChainStage: 'retail',
    naceCode: '47.110',
    naceDescription: 'Detaljhandel med livsmedel',
  },
  {
    name: 'Dagab Inköp & Logistik AB',
    orgNr: 'SE-556004-7903',
    country: 'SE',
    legalForm: 'AB',
    hqCity: 'Stockholm',
    ownershipType: 'listed',
    valueChainStage: 'logistics',
    naceCode: '46.390',
    naceDescription: 'Partihandel med livsmedel',
  },
  {
    name: 'Axfood Snabbgross AB',
    orgNr: 'SE-556000-3575',
    country: 'SE',
    legalForm: 'AB',
    hqCity: 'Stockholm',
    ownershipType: 'listed',
    valueChainStage: 'foodservice',
    naceCode: '46.390',
    naceDescription: 'Partihandel med livsmedel',
    employees: 598,
  },
  // --- Finland: Kesko subsidiary ---
  {
    name: 'Kespro Oy',
    orgNr: 'FI-0777402-5',
    country: 'FI',
    legalForm: 'Oy',
    hqCity: 'Helsinki',
    ownershipType: 'listed',
    valueChainStage: 'foodservice',
    naceCode: '46.390',
    naceDescription: 'Tukkukauppa, elintarvikkeet',
  },
  // --- Iceland: Hagar subsidiaries ---
  {
    name: 'Bonus hf',
    orgNr: 'IS-450199-3389',
    country: 'IS',
    legalForm: 'hf',
    hqCity: 'Reykjavik',
    ownershipType: 'listed',
    valueChainStage: 'retail',
    naceCode: '47.110',
    naceDescription: 'Matvöruverslun',
  },
  {
    name: 'Hagkaup hf',
    orgNr: 'IS-430698-3549',
    country: 'IS',
    legalForm: 'hf',
    hqCity: 'Reykjavik',
    ownershipType: 'listed',
    valueChainStage: 'retail',
    naceCode: '47.190',
    naceDescription: 'Verslun med ýmsar vörur',
  },
  {
    name: 'Olis hf',
    orgNr: 'IS-500269-3249',
    country: 'IS',
    legalForm: 'hf',
    hqCity: 'Reykjavik',
    ownershipType: 'listed',
    valueChainStage: 'retail',
    naceCode: '47.300',
    naceDescription: 'Eldsneytissala',
  },
  // --- Iceland: Festi subsidiaries ---
  {
    name: 'Kronan hf',
    orgNr: 'IS-711298-2239',
    country: 'IS',
    legalForm: 'hf',
    hqCity: 'Reykjavik',
    ownershipType: 'listed',
    valueChainStage: 'retail',
    naceCode: '47.110',
    naceDescription: 'Matvöruverslun',
  },
  {
    name: 'N1 hf',
    orgNr: 'IS-411003-3370',
    country: 'IS',
    legalForm: 'hf',
    hqCity: 'Reykjavik',
    ownershipType: 'listed',
    valueChainStage: 'retail',
    naceCode: '47.300',
    naceDescription: 'Eldsneytissala',
  },
]

// ============================================================
// 2. OWNERSHIP — Nordic corporate trees + cross-border links
// ============================================================

type OwnershipLink = {
  parentOrgNr: string
  childOrgNr: string
  ownershipPct: number | null
  ownershipType: string
  source: string
}

const ownershipLinks: OwnershipLink[] = [
  // --- Sweden: ICA Gruppen -> subsidiaries ---
  { parentOrgNr: 'SE-556048-2837', childOrgNr: 'SE-556021-0261', ownershipPct: 100, ownershipType: 'subsidiary', source: 'ICA Gruppen Arsredovisning 2024' },
  { parentOrgNr: 'SE-556048-2837', childOrgNr: 'SE-556033-8518', ownershipPct: 100, ownershipType: 'subsidiary', source: 'ICA Gruppen Arsredovisning 2024' },

  // --- Sweden: Axfood -> subsidiaries ---
  { parentOrgNr: 'SE-556542-5353', childOrgNr: 'SE-556163-2232', ownershipPct: 100, ownershipType: 'subsidiary', source: 'Axfood Arsredovisning 2024' },
  { parentOrgNr: 'SE-556542-5353', childOrgNr: 'SE-556113-8826', ownershipPct: 100, ownershipType: 'subsidiary', source: 'Axfood Arsredovisning 2024' },
  { parentOrgNr: 'SE-556542-5353', childOrgNr: 'SE-556004-7903', ownershipPct: 100, ownershipType: 'subsidiary', source: 'Axfood Arsredovisning 2024' },
  { parentOrgNr: 'SE-556542-5353', childOrgNr: 'SE-556000-3575', ownershipPct: 100, ownershipType: 'subsidiary', source: 'Axfood Arsredovisning 2024' },

  // --- Cross-border: Axel Johnson -> Axfood + Martin & Servera ---
  { parentOrgNr: 'SE-556223-6959', childOrgNr: 'SE-556542-5353', ownershipPct: 50.1, ownershipType: 'subsidiary', source: 'Axel Johnson AB arsredovisning 2024. Axel Johnson har bestammande inflytande.' },
  { parentOrgNr: 'SE-556223-6959', childOrgNr: 'SE-556559-1135', ownershipPct: 100, ownershipType: 'subsidiary', source: 'Axel Johnson AB arsredovisning 2024' },

  // --- Finland: SOK -> Meira Nova (already in DB) ---
  { parentOrgNr: 'FI-0116323-9', childOrgNr: 'FI-0697627-4', ownershipPct: 100, ownershipType: 'subsidiary', source: 'SOK tilinpaatos 2024' },

  // --- Finland: Kesko -> Kespro ---
  { parentOrgNr: 'FI-0110456-8', childOrgNr: 'FI-0777402-5', ownershipPct: 100, ownershipType: 'subsidiary', source: 'Kesko vuosikertomus 2024' },

  // --- Iceland: Hagar -> subsidiaries ---
  { parentOrgNr: 'IS-670203-2120', childOrgNr: 'IS-450199-3389', ownershipPct: 100, ownershipType: 'subsidiary', source: 'Hagar hf arsreikningur 2024/25' },
  { parentOrgNr: 'IS-670203-2120', childOrgNr: 'IS-430698-3549', ownershipPct: 100, ownershipType: 'subsidiary', source: 'Hagar hf arsreikningur 2024/25' },
  { parentOrgNr: 'IS-670203-2120', childOrgNr: 'IS-500269-3249', ownershipPct: 100, ownershipType: 'subsidiary', source: 'Hagar hf arsreikningur 2024/25' },

  // --- Iceland: Festi -> subsidiaries ---
  { parentOrgNr: 'IS-540206-2010', childOrgNr: 'IS-711298-2239', ownershipPct: 100, ownershipType: 'subsidiary', source: 'Festi hf arsreikningur 2025' },
  { parentOrgNr: 'IS-540206-2010', childOrgNr: 'IS-411003-3370', ownershipPct: 100, ownershipType: 'subsidiary', source: 'Festi hf arsreikningur 2025' },

  // --- Cross-border: Schwarz Group -> Lidl SE + Lidl FI ---
  // Schwarz Group is not in DB (German company), so we use cross-border business relationships instead

  // --- Cross-border: DoorDash -> Wolt ---
  // DoorDash is not in DB (US company), so we use business relationship instead
]

// ============================================================
// 3. PERSON PROFILES — Nordic CEOs + board chairs
// ============================================================

type PersonData = {
  name: string
  biography: string
  roles: { companyName: string; role: string; fromYear: number; toYear?: number }[]
  tags: string[]
}

const personProfiles: PersonData[] = [
  // --- Sweden ---
  {
    name: 'Nina Jonsson',
    biography: 'VD och koncernchef for ICA Gruppen AB sedan 2022. Tidigare VD for Plantagen och roller inom Axfood och Unilever.',
    roles: [
      { companyName: 'ICA Gruppen AB', role: 'CEO', fromYear: 2022 },
    ],
    tags: ['ica', 'ceo', 'sweden', 'retail'],
  },
  {
    name: 'Magnus Moberg',
    biography: 'Styrelseordforande i ICA Gruppen AB sedan april 2024. Erfaren styrelseledamot med bakgrunn i svensk naringsliv.',
    roles: [
      { companyName: 'ICA Gruppen AB', role: 'Styrelseordforande', fromYear: 2024 },
    ],
    tags: ['ica', 'styreleder', 'sweden'],
  },
  {
    name: 'Simone Margulies',
    biography: 'VD och koncernchef for Axfood AB sedan januari 2025. Eftertrader Klas Balkow som var VD 2017-2024.',
    roles: [
      { companyName: 'Axfood AB', role: 'CEO', fromYear: 2025 },
    ],
    tags: ['axfood', 'ceo', 'sweden', 'retail'],
  },
  {
    name: 'Caroline Berg',
    biography: 'Styrelseordforande i Axfood AB. Har lett styrelsen sedan 2015. Dotter av Antonia Ax:son Johnson, arving till Axel Johnson-imperiet.',
    roles: [
      { companyName: 'Axfood AB', role: 'Styrelseordforande', fromYear: 2015 },
    ],
    tags: ['axfood', 'axel-johnson', 'styreleder', 'sweden', 'interlocking-director'],
  },
  {
    name: 'Anders Torell',
    biography: 'VD for Coop Sverige AB sedan juni 2025. Var fungerende VD i seks manader for han ble fast ansatt.',
    roles: [
      { companyName: 'Coop Sverige AB', role: 'CEO', fromYear: 2025 },
    ],
    tags: ['coop', 'ceo', 'sweden', 'cooperative'],
  },
  {
    name: 'Kerstin Wallentin',
    biography: 'Styrelseordforande for KF/Coop Sverige. Enstemmigt valgt som ny ordforande for KF.',
    roles: [
      { companyName: 'Coop Sverige AB', role: 'Styrelseordforande', fromYear: 2023 },
    ],
    tags: ['coop', 'styreleder', 'sweden', 'cooperative'],
  },
  // --- Denmark ---
  {
    name: 'Anders Hagh',
    biography: 'CEO for Salling Group A/S. Tidligere CFO i Salling Group siden 2015. Overtok etter Per Bank som gikk til Loblaw (Canada).',
    roles: [
      { companyName: 'Salling Group A/S', role: 'CEO', fromYear: 2024 },
    ],
    tags: ['salling', 'ceo', 'denmark', 'retail'],
  },
  {
    name: 'Bjorn Gulden',
    biography: 'Bestyrelsesformand i Salling Group A/S. Ogsa CEO i Adidas AG. Norsk forretningsleder med bred internasjonal erfaring.',
    roles: [
      { companyName: 'Salling Group A/S', role: 'Bestyrelsesformand', fromYear: 2021 },
    ],
    tags: ['salling', 'styreleder', 'denmark', 'interlocking-director'],
  },
  {
    name: 'Thor Skov Jorgensen',
    biography: 'Administrerende direktor for Coop Danmark A/S.',
    roles: [
      { companyName: 'Coop Danmark A/S', role: 'CEO', fromYear: 2024 },
    ],
    tags: ['coop', 'ceo', 'denmark', 'cooperative'],
  },
  {
    name: 'Jeff Gravenhorst',
    biography: 'Bestyrelsesformand i Coop Danmark A/S siden oktober 2023. Tidligere CEO i ISS A/S (2010-2020). Ogsa styreformann i Ramboll.',
    roles: [
      { companyName: 'Coop Danmark A/S', role: 'Bestyrelsesformand', fromYear: 2023 },
      { companyName: 'ISS A/S', role: 'CEO', fromYear: 2010, toYear: 2020 },
    ],
    tags: ['coop', 'iss', 'styreleder', 'denmark', 'interlocking-director'],
  },
  // --- Finland ---
  {
    name: 'Hannu Krook',
    biography: 'Paajohtaja (CEO) for SOK / S-Group siden januar 2021. Leder Finlands storste detaljhandelskonsern med 2.7 millioner samvirkemedlemmer.',
    roles: [
      { companyName: 'SOK (S Group)', role: 'CEO', fromYear: 2021 },
    ],
    tags: ['s-group', 'sok', 'ceo', 'finland', 'cooperative'],
  },
  {
    name: 'Jorma Rauhala',
    biography: 'Toimitusjohtaja (CEO) for Kesko Oyj siden februar 2024. Har jobbet i Kesko siden 1992. Leder den nest storste finske detaljhandelsgruppen.',
    roles: [
      { companyName: 'Kesko Oyj', role: 'CEO', fromYear: 2024 },
    ],
    tags: ['kesko', 'ceo', 'finland', 'retail'],
  },
  {
    name: 'Esa Kiiskinen',
    biography: 'Hallituksen puheenjohtaja (styrelseordforande) for Kesko Oyj.',
    roles: [
      { companyName: 'Kesko Oyj', role: 'Hallituksen puheenjohtaja', fromYear: 2020 },
    ],
    tags: ['kesko', 'styreleder', 'finland'],
  },
  // --- Iceland ---
  {
    name: 'Finnur Oddsson',
    biography: 'Forstjori (CEO) for Hagar hf. Leder Islands storste dagligvarekonsern med Bonus, Hagkaup og Olis.',
    roles: [
      { companyName: 'Hagar hf', role: 'CEO', fromYear: 2018 },
    ],
    tags: ['hagar', 'ceo', 'iceland', 'retail'],
  },
  {
    name: 'Asta S. Fjeldsted',
    biography: 'Forstjori (CEO) for Festi hf. Leder konsernet med Kronan, N1, ELKO og Lyfja.',
    roles: [
      { companyName: 'Festi hf', role: 'CEO', fromYear: 2020 },
    ],
    tags: ['festi', 'ceo', 'iceland', 'retail'],
  },
  {
    name: 'Gunnar Egill Sigurdsson',
    biography: 'Forstjori (CEO) for Samkaup hf. Leder kooperativet med ca. 65 butikker (Netto, Kjorbudin, Krambud).',
    roles: [
      { companyName: 'Samkaup hf', role: 'CEO', fromYear: 2022 },
    ],
    tags: ['samkaup', 'ceo', 'iceland', 'cooperative'],
  },
]

// ============================================================
// 4. BUSINESS RELATIONSHIPS — Cross-border + intra-Nordic
// ============================================================

type BizRelation = {
  fromOrgNr: string
  toOrgNr: string
  relationshipType: string
  description: string
  sector: string
  source: string
}

const businessRelationships: BizRelation[] = [
  // Axel Johnson family control: Caroline Berg links Axfood + Martin & Servera
  {
    fromOrgNr: 'SE-556223-6959',
    toOrgNr: 'SE-556424-2537',
    relationshipType: 'buyer',
    description: 'Axel Johnson AB eier Axfood (50.1%) og Martin & Servera (100%) — kontrollerer bade retail og foodservice i Sverige',
    sector: 'dagligvare/foodservice',
    source: 'Axel Johnson AB arsredovisning 2024',
  },
  // ICA intra-group logistics
  {
    fromOrgNr: 'SE-556021-0261',
    toOrgNr: 'SE-556033-8518',
    relationshipType: 'self-dealing',
    description: 'ICA Sverige leier butikklokaler av ICA Fastigheter — vertikal integrering av retail + eiendom',
    sector: 'eiendom/retail',
    source: 'ICA Gruppen Arsredovisning 2024',
  },
  // Axfood logistics: Dagab serves Willys + Hemkop
  {
    fromOrgNr: 'SE-556004-7903',
    toOrgNr: 'SE-556163-2232',
    relationshipType: 'distributor',
    description: 'Dagab er sentral innkjops- og logistikkenhet for Willys og hele Axfood-gruppen',
    sector: 'logistikk',
    source: 'Axfood Arsredovisning 2024',
  },
  // Finnish foodservice: Meira Nova serves S-Group stores
  {
    fromOrgNr: 'FI-0697627-4',
    toOrgNr: 'FI-0116323-9',
    relationshipType: 'distributor',
    description: 'Meira Nova Oy er S-Groups foodservice-grossist som leverer til restauranter, kantiner og storhusholdninger',
    sector: 'foodservice',
    source: 'SOK tilinpaatos 2024',
  },
  // Finnish foodservice: Kespro serves Kesko ecosystem
  {
    fromOrgNr: 'FI-0777402-5',
    toOrgNr: 'FI-0110456-8',
    relationshipType: 'distributor',
    description: 'Kespro Oy er Keskos foodservice-grossist og HoReCa-leverandor',
    sector: 'foodservice',
    source: 'Kesko vuosikertomus 2024',
  },
  // Cross-border: Schwarz Group -> Lidl SE + Lidl FI (no parent in DB, record as supplier)
  {
    fromOrgNr: 'SE-969697-6594',
    toOrgNr: 'FI-1615492-7',
    relationshipType: 'joint-venture',
    description: 'Lidl Sverige og Lidl Suomi er begge eid av Schwarz Group (Tyskland) — deler innkjopssystem og EMV-sortiment',
    sector: 'dagligvare',
    source: 'Schwarz Group Annual Report 2024',
  },
  // Cross-border: Menigo (Sysco) serves Swedish foodservice
  {
    fromOrgNr: 'SE-556424-2537',
    toOrgNr: 'SE-556559-1135',
    relationshipType: 'supplier',
    description: 'Menigo (Sysco) og Martin & Servera (Axel Johnson) er de to storste foodservice-grossistene i Sverige — direkte konkurrenter',
    sector: 'foodservice',
    source: 'Svensk Dagligvaruhandel marknadsrapport 2024',
  },
  // Iceland: Hagar competitive position
  {
    fromOrgNr: 'IS-670203-2120',
    toOrgNr: 'IS-540206-2010',
    relationshipType: 'buyer',
    description: 'Hagar (Bonus/Hagkaup) og Festi (Kronan/N1) er Islands to storste dagligvarekonsern — duopol-lignende markedsstruktur',
    sector: 'dagligvare',
    source: 'Icelandic Competition Authority market report 2024',
  },
  // Cross-border: Jeff Gravenhorst links ISS DK <-> Coop DK
  {
    fromOrgNr: 'DK-28316745',
    toOrgNr: 'DK-26259495',
    relationshipType: 'self-dealing',
    description: 'Jeff Gravenhorst var CEO i ISS A/S (2010-2020), na bestyrelsesformand i Coop Danmark — interlocking director',
    sector: 'governance',
    source: 'Coop Danmark / ISS arsrapporter',
  },
  // Dagrofa <-> Euro Cater: Danish foodservice ecosystem
  {
    fromOrgNr: 'DK-38714295',
    toOrgNr: 'DK-29783535',
    relationshipType: 'supplier',
    description: 'Dagrofa og Euro Cater er store danske foodservice-grossister — konkurrenter i dansk HoReCa',
    sector: 'foodservice',
    source: 'Dansk Erhverv foodservice rapport 2024',
  },
]

// ============================================================
// IMPORT FUNCTIONS
// ============================================================

async function resolveCompanyId(orgNr: string): Promise<string | null> {
  const c = await prisma.company.findUnique({ where: { orgNr }, select: { id: true } })
  return c?.id ?? null
}

async function importCompanies() {
  console.log('=== Importing Nordic subsidiary companies ===\n')
  let created = 0
  for (const c of newCompanies) {
    await prisma.company.upsert({
      where: { orgNr: c.orgNr },
      update: { name: c.name, country: c.country, legalForm: c.legalForm, hqCity: c.hqCity, ownershipType: c.ownershipType, valueChainStage: c.valueChainStage, naceCode: c.naceCode, naceDescription: c.naceDescription, employees: c.employees },
      create: { name: c.name, orgNr: c.orgNr, country: c.country, legalForm: c.legalForm, hqCity: c.hqCity, ownershipType: c.ownershipType, valueChainStage: c.valueChainStage, naceCode: c.naceCode, naceDescription: c.naceDescription, employees: c.employees },
    })
    console.log(`  [${c.country}] ${c.name} (${c.orgNr})`)
    created++
  }
  console.log(`\n${created} Nordic companies imported`)
}

async function importOwnership() {
  console.log('\n=== Importing Nordic ownership tree ===\n')
  let imported = 0
  for (const link of ownershipLinks) {
    const parentId = await resolveCompanyId(link.parentOrgNr)
    const childId = await resolveCompanyId(link.childOrgNr)
    if (!parentId || !childId) {
      console.log(`  SKIP: ${link.parentOrgNr} -> ${link.childOrgNr} (missing company)`)
      continue
    }
    await prisma.companyOwnership.upsert({
      where: { parentCompanyId_childCompanyId: { parentCompanyId: parentId, childCompanyId: childId } },
      update: { ownershipPct: link.ownershipPct, ownershipType: link.ownershipType, source: link.source },
      create: { parentCompanyId: parentId, childCompanyId: childId, ownershipPct: link.ownershipPct, ownershipType: link.ownershipType, source: link.source },
    })
    console.log(`  ${link.parentOrgNr} -> ${link.childOrgNr} (${link.ownershipPct ?? '?'}%)`)
    imported++
  }
  console.log(`\n${imported} ownership records imported`)
}

async function importPersonProfiles() {
  console.log('\n=== Importing Nordic person profiles ===\n')
  let imported = 0
  for (const p of personProfiles) {
    await prisma.personProfile.upsert({
      where: { personKey: normalizePersonKey(p.name) },
      update: { name: p.name, biography: p.biography, roles: p.roles, tags: p.tags },
      create: { name: p.name, personKey: normalizePersonKey(p.name), biography: p.biography, roles: p.roles, tags: p.tags },
    })
    console.log(`  ${p.name} (${p.tags.filter(t => ['sweden', 'denmark', 'finland', 'iceland'].includes(t))[0] ?? 'nordic'})`)
    imported++
  }
  console.log(`\n${imported} person profiles imported`)
}

async function importBusinessRelationships() {
  console.log('\n=== Importing Nordic business relationships ===\n')
  let imported = 0
  for (const r of businessRelationships) {
    const fromId = await resolveCompanyId(r.fromOrgNr)
    const toId = await resolveCompanyId(r.toOrgNr)
    if (!fromId || !toId) {
      console.log(`  SKIP: ${r.fromOrgNr} -> ${r.toOrgNr} (missing company)`)
      continue
    }
    await prisma.businessRelationship.upsert({
      where: { fromCompanyId_toCompanyId_relationshipType: { fromCompanyId: fromId, toCompanyId: toId, relationshipType: r.relationshipType } },
      update: { description: r.description, sector: r.sector, source: r.source },
      create: { fromCompanyId: fromId, toCompanyId: toId, relationshipType: r.relationshipType, description: r.description, sector: r.sector, source: r.source },
    })
    console.log(`  ${r.fromOrgNr} -> ${r.toOrgNr} (${r.relationshipType})`)
    imported++
  }
  console.log(`\n${imported} business relationships imported`)
}

async function main() {
  console.log('========================================')
  console.log('  Sprint 5: Nordic Deepening')
  console.log('  SE: ICA, Axfood, Coop, Axel Johnson')
  console.log('  DK: Salling, Coop DK')
  console.log('  FI: SOK/S-Group, Kesko')
  console.log('  IS: Hagar, Festi, Samkaup')
  console.log('========================================\n')

  await importCompanies()
  await importOwnership()
  await importPersonProfiles()
  await importBusinessRelationships()

  console.log('\n========== SUMMARY ==========')
  console.log('Companies:', await prisma.company.count())
  console.log('CompanyOwnership:', await prisma.companyOwnership.count())
  console.log('PersonProfile:', await prisma.personProfile.count())
  console.log('BusinessRelationship:', await prisma.businessRelationship.count())
  console.log('=============================')
}

main().catch(e => { console.error('Nordic deepening import failed:', e); process.exit(1) }).finally(() => prisma.$disconnect())
