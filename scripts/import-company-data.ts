import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

type CompanyData = {
  name: string
  orgNr: string
  legalForm: string
  founded?: number
  naceCode?: string
  naceDescription?: string
  hqAddress?: string
  hqCity?: string
  employees?: number
  ownershipType: string
  valueChainStage: string
  financials?: {
    year: number
    revenueNok?: number
    operatingResult?: number
    operatingMargin?: number
    groupEmployees?: number
    source?: string
  }[]
  shareholders?: {
    name: string
    ownershipPct?: number
    shareholderType?: string
    isControlling?: boolean
  }[]
  boardMembers?: {
    personName: string
    role: string
  }[]
  subsidies?: {
    subsidyType: string
    project?: string
    amountNok?: number
    year?: number
  }[]
}

const companies: CompanyData[] = [
  {
    name: 'NorgesGruppen ASA',
    orgNr: '911856655',
    legalForm: 'ASA',
    founded: 1994,
    naceCode: '47.110',
    naceDescription: 'Detaljhandel næringsmidler',
    hqCity: 'Oslo',
    employees: 5600,
    ownershipType: 'family',
    valueChainStage: 'retail',
    financials: [
      { year: 2024, revenueNok: 118000, operatingResult: 5500, operatingMargin: 3.3, groupEmployees: 44600, source: 'Årsrapport 2024' },
    ],
    shareholders: [
      { name: 'Joh. Johannson-familien', ownershipPct: 74.4, shareholderType: 'family', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Knut Hartvig Johannson', role: 'styreleder' },
      { personName: 'Runar Hollevik', role: 'CEO' },
    ],
  },
  {
    name: 'Coop Norge SA',
    orgNr: '879469062',
    legalForm: 'SA',
    founded: 1906,
    naceCode: '47.110',
    naceDescription: 'Detaljhandel næringsmidler',
    hqCity: 'Oslo',
    employees: 2500,
    ownershipType: 'cooperative',
    valueChainStage: 'retail',
    financials: [
      { year: 2024, revenueNok: 55000, operatingResult: 580, operatingMargin: 1.0, groupEmployees: 28000, source: 'Årsresultat 2024' },
    ],
    shareholders: [
      { name: 'Samvirkelagene (1,9 mill. medlemmer)', ownershipPct: 100, shareholderType: 'cooperative', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Tore Tjomsland', role: 'styreleder' },
      { personName: 'Geir Inge Stokke', role: 'CEO' },
    ],
  },
  {
    name: 'Reitan Retail AS',
    orgNr: '935174627',
    legalForm: 'AS',
    founded: 1972,
    naceCode: '47.110',
    naceDescription: 'Detaljhandel næringsmidler',
    hqCity: 'Oslo',
    employees: 800,
    ownershipType: 'family',
    valueChainStage: 'retail',
    financials: [
      { year: 2024, revenueNok: 105000, operatingResult: 4000, operatingMargin: 3.85, groupEmployees: 45000, source: 'Årsrapport 2024' },
    ],
    shareholders: [
      { name: 'Reitan-familien (Odd Reitan)', ownershipPct: 100, shareholderType: 'family', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Odd Reitan', role: 'styreleder' },
      { personName: 'Ole Robert Reitan', role: 'CEO' },
    ],
  },
  {
    name: 'Orkla ASA',
    orgNr: '910747711',
    legalForm: 'ASA',
    founded: 1654,
    naceCode: '10.890',
    naceDescription: 'Produksjon av næringsmidler',
    hqCity: 'Oslo',
    employees: 2800,
    ownershipType: 'family',
    valueChainStage: 'processing',
    financials: [
      { year: 2024, revenueNok: 70700, operatingResult: 7800, operatingMargin: 11.0, groupEmployees: 21800, source: 'Årsrapport 2024' },
    ],
    shareholders: [
      { name: 'Stein Erik Hagen (Canica)', ownershipPct: 25.1, shareholderType: 'family', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Stein Erik Hagen', role: 'styreleder' },
      { personName: 'Nils K. Selte', role: 'CEO' },
    ],
  },
  {
    name: 'Nortura SA',
    orgNr: '938752648',
    legalForm: 'SA',
    founded: 2006,
    naceCode: '10.110',
    naceDescription: 'Bearbeiding og konservering av kjøtt',
    hqCity: 'Oslo',
    employees: 5500,
    ownershipType: 'cooperative',
    valueChainStage: 'processing',
    financials: [
      { year: 2024, revenueNok: 30000, operatingResult: 400, operatingMargin: 1.3, groupEmployees: 5500, source: 'Årsrapport 2024' },
    ],
    shareholders: [
      { name: '17 000 bønder', ownershipPct: 100, shareholderType: 'cooperative', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Trine Hasvang Vaag', role: 'styreleder' },
    ],
  },
  {
    name: 'TINE SA',
    orgNr: '874560552',
    legalForm: 'SA',
    founded: 1928,
    naceCode: '10.510',
    naceDescription: 'Meieriproduksjon',
    hqCity: 'Oslo',
    employees: 5200,
    ownershipType: 'cooperative',
    valueChainStage: 'processing',
    financials: [
      { year: 2024, revenueNok: 25500, operatingResult: 1400, operatingMargin: 5.5, groupEmployees: 5200, source: 'Årsrapport 2024' },
    ],
    shareholders: [
      { name: '8 600 melkebønder', ownershipPct: 100, shareholderType: 'cooperative', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Marit Haugen', role: 'styreleder' },
    ],
  },
  {
    name: 'Felleskjøpet Agri SA',
    orgNr: '947942638',
    legalForm: 'SA',
    founded: 1896,
    naceCode: '46.210',
    naceDescription: 'Engroshandel korn, råtobakk, frø og fôrvarer',
    hqCity: 'Lillestrøm',
    employees: 4600,
    ownershipType: 'cooperative',
    valueChainStage: 'inputs',
    financials: [
      { year: 2024, revenueNok: 22000, operatingResult: 1200, operatingMargin: 5.5, groupEmployees: 4600, source: 'Årsrapport 2024' },
    ],
    shareholders: [
      { name: '42 000 bondemedlemmer', ownershipPct: 100, shareholderType: 'cooperative', isControlling: true },
    ],
  },
  {
    name: 'BAMA Gruppen AS',
    orgNr: '819731322',
    legalForm: 'AS',
    founded: 1886,
    naceCode: '46.310',
    naceDescription: 'Engroshandel frukt og grønnsaker',
    hqCity: 'Oslo',
    employees: 3000,
    ownershipType: 'family',
    valueChainStage: 'logistics',
    financials: [
      { year: 2024, revenueNok: 18000, operatingResult: 500, operatingMargin: 2.8, groupEmployees: 3000, source: 'Årsrapport 2024' },
    ],
    shareholders: [
      { name: 'NorgesGruppen', ownershipPct: 46, shareholderType: 'institutional', isControlling: true },
      { name: 'REMA 1000', ownershipPct: 20, shareholderType: 'institutional', isControlling: false },
      { name: 'Bama-familien', ownershipPct: 34, shareholderType: 'family', isControlling: false },
    ],
    boardMembers: [
      { personName: 'Runar Hollevik', role: 'styremedlem' },
      { personName: 'Ole Robert Reitan', role: 'styremedlem' },
    ],
  },
  {
    name: 'Mowi ASA',
    orgNr: '964118191',
    legalForm: 'ASA',
    founded: 1964,
    naceCode: '03.210',
    naceDescription: 'Akvakultur sjø og brakkvann',
    hqCity: 'Bergen',
    employees: 2500,
    ownershipType: 'listed',
    valueChainStage: 'seafood',
    financials: [
      { year: 2024, revenueNok: 60000, operatingResult: 10000, operatingMargin: 16.7, groupEmployees: 14000, source: 'Årsrapport 2024' },
    ],
    shareholders: [
      { name: 'John Fredriksen', ownershipPct: 14.4, shareholderType: 'family', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Ola Snøve', role: 'styreleder' },
      { personName: 'Ivan Vindheim', role: 'CEO' },
    ],
  },
  {
    name: 'SalMar ASA',
    orgNr: '956866266',
    legalForm: 'ASA',
    founded: 1991,
    naceCode: '03.210',
    naceDescription: 'Akvakultur sjø og brakkvann',
    hqCity: 'Frøya',
    employees: 1000,
    ownershipType: 'family',
    valueChainStage: 'seafood',
    financials: [
      { year: 2024, revenueNok: 25000, operatingResult: 5000, operatingMargin: 20.0, groupEmployees: 5500, source: 'Årsrapport 2024' },
    ],
    shareholders: [
      { name: 'Gustav Magnar Witzøe', ownershipPct: 41.3, shareholderType: 'family', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Gustav Magnar Witzøe', role: 'styreleder' },
    ],
  },
  {
    name: 'Lerøy Seafood Group ASA',
    orgNr: '975320637',
    legalForm: 'ASA',
    founded: 1899,
    naceCode: '03.210',
    naceDescription: 'Akvakultur sjø og brakkvann',
    hqCity: 'Bergen',
    employees: 1500,
    ownershipType: 'listed',
    valueChainStage: 'seafood',
    financials: [
      { year: 2024, revenueNok: 30000, operatingResult: 3500, operatingMargin: 11.7, groupEmployees: 6000, source: 'Årsrapport 2024' },
    ],
    shareholders: [
      { name: 'Austevoll Seafood (Møgster-familien)', ownershipPct: 52.7, shareholderType: 'family', isControlling: true },
    ],
  },
  {
    name: 'Yara International ASA',
    orgNr: '919998919',
    legalForm: 'ASA',
    founded: 2004,
    naceCode: '20.150',
    naceDescription: 'Produksjon av gjødsel og nitrogenfor.',
    hqCity: 'Oslo',
    employees: 3000,
    ownershipType: 'state',
    valueChainStage: 'inputs',
    financials: [
      { year: 2024, revenueNok: 150000, operatingResult: 8000, operatingMargin: 5.3, groupEmployees: 18000, source: 'Årsrapport 2024' },
    ],
    shareholders: [
      { name: 'Den norske stat', ownershipPct: 36.2, shareholderType: 'state', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Trond Berger', role: 'styreleder' },
      { personName: 'Svein Tore Holsether', role: 'CEO' },
    ],
    subsidies: [
      { subsidyType: 'Grønn plattform', project: 'Grønn ammoniakk Porsgrunn', amountNok: 283000000, year: 2022 },
    ],
  },
  {
    name: 'Skretting Norge AS',
    orgNr: '980358088',
    legalForm: 'AS',
    founded: 1899,
    naceCode: '10.910',
    naceDescription: 'Produksjon av fôrvarer til husdyr',
    hqCity: 'Stavanger',
    employees: 600,
    ownershipType: 'foreign',
    valueChainStage: 'inputs',
    financials: [
      { year: 2024, revenueNok: 12000, operatingResult: 600, operatingMargin: 5.0, groupEmployees: 600, source: 'Estimat' },
    ],
    shareholders: [
      { name: 'Nutreco/SHV Holdings (Nederland)', ownershipPct: 100, shareholderType: 'foreign', isControlling: true },
    ],
  },
  {
    name: 'ASKO Norge AS',
    orgNr: '929094636',
    legalForm: 'AS',
    founded: 1895,
    naceCode: '46.390',
    naceDescription: 'Engroshandel næringsmidler, bredt utvalg',
    hqCity: 'Oslo',
    employees: 4200,
    ownershipType: 'family',
    valueChainStage: 'logistics',
    financials: [
      { year: 2024, revenueNok: 95000, operatingResult: 1500, operatingMargin: 1.6, groupEmployees: 4200, source: 'Årsrapport 2024' },
    ],
    shareholders: [
      { name: 'NorgesGruppen ASA (100%)', ownershipPct: 100, shareholderType: 'institutional', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Runar Hollevik', role: 'styreleder' },
    ],
  },
]

function normalizePersonKey(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z ]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

async function main() {
  console.log('Importing company data...\n')

  for (const c of companies) {
    const company = await prisma.company.upsert({
      where: { orgNr: c.orgNr },
      update: {
        name: c.name,
        legalForm: c.legalForm,
        founded: c.founded,
        naceCode: c.naceCode,
        naceDescription: c.naceDescription,
        hqCity: c.hqCity,
        hqAddress: c.hqAddress,
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
        hqCity: c.hqCity,
        hqAddress: c.hqAddress,
        employees: c.employees,
        ownershipType: c.ownershipType,
        valueChainStage: c.valueChainStage,
      },
    })

    console.log(`  ${company.name} (${c.orgNr})`)

    if (c.financials) {
      for (const f of c.financials) {
        await prisma.companyFinancial.upsert({
          where: { companyId_year: { companyId: company.id, year: f.year } },
          update: {
            revenueNok: f.revenueNok,
            operatingResult: f.operatingResult,
            operatingMargin: f.operatingMargin,
            groupEmployees: f.groupEmployees,
            source: f.source,
          },
          create: {
            companyId: company.id,
            year: f.year,
            revenueNok: f.revenueNok,
            operatingResult: f.operatingResult,
            operatingMargin: f.operatingMargin,
            groupEmployees: f.groupEmployees,
            source: f.source,
          },
        })
      }
    }

    if (c.shareholders) {
      await prisma.shareholder.deleteMany({ where: { companyId: company.id } })
      for (const s of c.shareholders) {
        await prisma.shareholder.create({
          data: {
            companyId: company.id,
            name: s.name,
            ownershipPct: s.ownershipPct,
            shareholderType: s.shareholderType,
            isControlling: s.isControlling ?? false,
          },
        })
      }
    }

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

    if (c.subsidies) {
      await prisma.subsidy.deleteMany({ where: { companyId: company.id } })
      for (const s of c.subsidies) {
        await prisma.subsidy.create({
          data: {
            companyId: company.id,
            subsidyType: s.subsidyType,
            project: s.project,
            amountNok: s.amountNok,
            year: s.year,
          },
        })
      }
    }
  }

  const interlocks = await prisma.boardMember.groupBy({
    by: ['personKey'],
    _count: true,
    having: { personKey: { _count: { gt: 1 } } },
  })

  if (interlocks.length > 0) {
    console.log('\nInterlocking directorates detected:')
    for (const il of interlocks) {
      const members = await prisma.boardMember.findMany({
        where: { personKey: il.personKey },
        include: { company: { select: { name: true } } },
      })
      console.log(`  ${members[0].personName}: ${members.map((m) => `${m.company.name} (${m.role})`).join(', ')}`)
    }
  }

  console.log(`\n${companies.length} companies imported with financials, shareholders, and board members`)
}

main()
  .catch((e) => {
    console.error('Import failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
