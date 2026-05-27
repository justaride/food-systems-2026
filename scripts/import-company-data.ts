import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { resolveShareholderSourceLocator } from '../src/lib/row-source-locators'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

type CompanyData = {
  name: string
  orgNr: string
  country?: string
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
    source?: string
  }[]
  properties?: {
    propertyType: string
    address?: string
    municipality?: string
    county?: string
    country?: string
    lat?: number
    lng?: number
    sqMeters?: number
    acquiredYear?: number
    selfLeased?: boolean
    tenantOrgNr?: string
    source?: string
  }[]
}

const companies: CompanyData[] = [
  {
    name: 'NorgesGruppen ASA',
    orgNr: '819731322',
    legalForm: 'ASA',
    founded: 1963,
    naceCode: '47.111',
    naceDescription: 'Butikkhandel med bredt vareutvalg med hovedvekt på nærings- og nytelsesmidler',
    hqAddress: 'Karenslyst allé 12',
    hqCity: 'Oslo',
    employees: 150,
    ownershipType: 'family',
    valueChainStage: 'retail',
    financials: [
      { year: 2020, revenueNok: 101000, operatingResult: 4900, operatingMargin: 4.9, groupEmployees: 45200, source: 'Årsrapport 2020' },
      { year: 2021, revenueNok: 103000, operatingResult: 5000, operatingMargin: 4.9, groupEmployees: 43800, source: 'Årsrapport 2021' },
      { year: 2022, revenueNok: 102700, operatingResult: 3600, operatingMargin: 3.5, groupEmployees: 43500, source: 'Årsrapport 2022' },
      { year: 2023, revenueNok: 112200, operatingResult: 4400, operatingMargin: 3.9, groupEmployees: 44000, source: 'Årsrapport 2023' },
      { year: 2024, revenueNok: 118000, operatingResult: 4800, operatingMargin: 4.1, groupEmployees: 44600, source: 'Årsrapport 2024' },
    ],
    shareholders: [
      { name: 'Joh. Johannson-familien', ownershipPct: 74.4, shareholderType: 'family', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Johan Johannson', role: 'styreleder' },
      { personName: 'Runar Hollevik', role: 'CEO' },
      { personName: 'Liv Gisele Marchand', role: 'styremedlem' },
      { personName: 'Ørjan Svanevik', role: 'styremedlem' },
      { personName: 'Hilde Vatne', role: 'styremedlem' },
      { personName: 'Guri Størvold', role: 'styremedlem' },
      { personName: 'Jan Magne Borgen', role: 'styremedlem' },
      { personName: 'Martine Steinsholt', role: 'styremedlem' },
      { personName: 'Filip Lorentzen', role: 'styremedlem' },
      { personName: 'Cecilie Myhre', role: 'styremedlem' },
      { personName: 'Mats Gunnar Knudsen', role: 'styremedlem' },
    ],
    properties: [
      {
        propertyType: 'office',
        address: 'Karenslyst allé 12',
        municipality: 'Oslo',
        county: 'Oslo',
        lat: 59.9196,
        lng: 10.6773,
        source: 'Brønnøysund',
      },
    ],
  },
  {
    name: 'Coop Norge SA',
    orgNr: '936560288',
    legalForm: 'SA',
    founded: 1906,
    naceCode: '46.390',
    naceDescription: 'Engroshandel med bredt utvalg av nærings- og nytelsesmidler',
    hqAddress: 'Østre Aker vei 264',
    hqCity: 'Oslo',
    employees: 2235,
    ownershipType: 'cooperative',
    valueChainStage: 'retail',
    financials: [
      { year: 2020, revenueNok: 58600, operatingResult: 986, operatingMargin: 1.7, groupEmployees: 27000, source: 'Årsrapport 2020' },
      { year: 2021, revenueNok: 59900, operatingResult: 520, operatingMargin: 0.9, groupEmployees: 27500, source: 'Årsrapport 2021' },
      { year: 2022, revenueNok: 58300, operatingResult: 347, operatingMargin: 0.6, groupEmployees: 27800, source: 'Årsrapport 2022' },
      { year: 2023, revenueNok: 61000, operatingResult: 631, operatingMargin: 1.0, groupEmployees: 28000, source: 'Årsrapport 2023' },
      { year: 2024, revenueNok: 55000, operatingResult: 580, operatingMargin: 1.1, groupEmployees: 28000, source: 'Årsresultat 2024' },
    ],
    shareholders: [
      { name: 'Samvirkelagene (1,9 mill. medlemmer)', ownershipPct: 100, shareholderType: 'cooperative', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Runar Leite', role: 'styreleder' },
      { personName: 'Philipp Lasse Engedal', role: 'CEO' },
      { personName: 'Øystein Berg', role: 'styremedlem' },
      { personName: 'Lars Arve Jakobsen', role: 'styremedlem' },
      { personName: 'Elin Viken', role: 'styremedlem' },
      { personName: 'Gøril Johnsen', role: 'styremedlem' },
      { personName: 'Bjørn Vik-Mo', role: 'styremedlem' },
      { personName: 'Yngve Haldorsen', role: 'styremedlem' },
      { personName: 'Lise Renee Skarpås', role: 'styremedlem' },
      { personName: 'Johan Martin Andreassen', role: 'styremedlem' },
      { personName: 'Katrine Lundstrøm', role: 'styremedlem' },
      { personName: 'Stine Beate Rødberg', role: 'styremedlem' },
    ],
    properties: [
      {
        propertyType: 'office',
        address: 'Østre Aker vei 264',
        municipality: 'Oslo',
        county: 'Oslo',
        lat: 59.9394,
        lng: 10.8370,
        source: 'Brønnøysund underenheter',
      },
      {
        propertyType: 'warehouse',
        address: 'Vilbergvegen 130',
        municipality: 'Ullensaker',
        county: 'Akershus',
        lat: 60.14,
        lng: 11.17,
        source: 'Brønnøysund underenheter',
      },
      {
        propertyType: 'warehouse',
        address: 'Regnbueveien 5',
        municipality: 'Nordre Follo',
        county: 'Akershus',
        lat: 59.75,
        lng: 10.83,
        source: 'Brønnøysund underenheter',
      },
      {
        propertyType: 'warehouse',
        address: 'Lønningsflaten 22',
        municipality: 'Bergen',
        county: 'Vestland',
        lat: 60.33,
        lng: 5.27,
        source: 'Brønnøysund underenheter',
      },
      {
        propertyType: 'warehouse',
        address: 'Nesflåtveien 4',
        municipality: 'Stavanger',
        county: 'Rogaland',
        lat: 58.97,
        lng: 5.73,
        source: 'Brønnøysund underenheter',
      },
      {
        propertyType: 'warehouse',
        address: 'Ringvegen 770',
        municipality: 'Tromsø',
        county: 'Troms',
        lat: 69.65,
        lng: 18.96,
        source: 'Brønnøysund underenheter',
      },
      {
        propertyType: 'warehouse',
        address: 'Østre Rosten 108',
        municipality: 'Trondheim',
        county: 'Trøndelag',
        lat: 63.36,
        lng: 10.40,
        source: 'Brønnøysund underenheter',
      },
    ],
  },
  {
    name: 'Reitan Retail AS',
    orgNr: '914526647',
    legalForm: 'AS',
    founded: 1974,
    naceCode: '46.390',
    naceDescription: 'Engroshandel med bredt utvalg av nærings- og nytelsesmidler',
    hqAddress: 'Gladengveien 2',
    hqCity: 'Oslo',
    employees: 44,
    ownershipType: 'family',
    valueChainStage: 'retail',
    financials: [
      { year: 2020, revenueNok: 95000, operatingResult: 4400, operatingMargin: 4.6, groupEmployees: 40000, source: 'Årsrapport 2020' },
      { year: 2021, revenueNok: 104000, operatingResult: 3800, operatingMargin: 3.7, groupEmployees: 42000, source: 'Årsrapport 2021' },
      { year: 2022, revenueNok: 116000, operatingResult: 3600, operatingMargin: 3.1, groupEmployees: 43000, source: 'Årsrapport 2022' },
      { year: 2023, revenueNok: 128000, operatingResult: 3100, operatingMargin: 2.4, groupEmployees: 44000, source: 'Årsrapport 2023' },
      { year: 2024, revenueNok: 149000, operatingResult: 5100, operatingMargin: 3.4, groupEmployees: 45000, source: 'Årsrapport 2024' },
    ],
    shareholders: [
      { name: 'Reitan-familien (Odd Reitan)', ownershipPct: 100, shareholderType: 'family', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Rune Bjerke', role: 'styreleder' },
      { personName: 'Ole Robert Reitan', role: 'CEO' },
      { personName: 'Linda Cathrine Helleland', role: 'styremedlem' },
      { personName: 'Siv Elisabeth Skard', role: 'styremedlem' },
      { personName: 'Magnus Reitan', role: 'styremedlem' },
      { personName: 'Eilert Hanoa', role: 'styremedlem' },
      { personName: 'Annika Marie Sigfrid', role: 'styremedlem' },
    ],
  },
  {
    name: 'Orkla ASA',
    orgNr: '910747711',
    legalForm: 'ASA',
    founded: 1918,
    naceCode: '10.850',
    naceDescription: 'Produksjon av ferdigmat',
    hqAddress: 'Drammensveien 149A',
    hqCity: 'Oslo',
    employees: 81,
    ownershipType: 'family',
    valueChainStage: 'processing',
    financials: [
      { year: 2020, revenueNok: 50441, operatingResult: 5492, operatingMargin: 10.9, groupEmployees: 18110, source: 'Årsrapport 2020' },
      { year: 2021, revenueNok: 58391, operatingResult: 7411, operatingMargin: 12.7, groupEmployees: 21423, source: 'Årsrapport 2021' },
      { year: 2022, revenueNok: 67797, operatingResult: 6921, operatingMargin: 10.2, groupEmployees: 20471, source: 'Årsrapport 2022' },
      { year: 2023, revenueNok: 70656, operatingResult: 7956, operatingMargin: 11.3, groupEmployees: 19670, source: 'Årsrapport 2023' },
      { year: 2024, revenueNok: 71832, operatingResult: 8214, operatingMargin: 11.4, groupEmployees: 19500, source: 'Årsrapport 2024' },
    ],
    shareholders: [
      { name: 'Stein Erik Hagen (Canica)', ownershipPct: 25.1, shareholderType: 'family', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Stein Erik Hagen', role: 'styreleder' },
      { personName: 'Nils Selte', role: 'CEO' },
      { personName: 'Liselott Kilaas', role: 'styremedlem' },
      { personName: 'Terje Utstrand', role: 'styremedlem' },
      { personName: 'Roger Vangen', role: 'styremedlem' },
      { personName: 'Hans Peter Henrik Agnefjäll', role: 'styremedlem' },
      { personName: 'Christina Thérèse Hersch Fagerberg', role: 'styremedlem' },
      { personName: 'Rolv Erik Ryssdal', role: 'styremedlem' },
      { personName: 'Caroline Marie Kjos', role: 'styremedlem' },
      { personName: 'Bengt Arve Rem', role: 'styremedlem' },
      { personName: 'Ingrid Sofie Nielsen', role: 'styremedlem' },
    ],
  },
  {
    name: 'Nortura SA',
    orgNr: '938752648',
    legalForm: 'SA',
    founded: 1931,
    naceCode: '10.110',
    naceDescription: 'Bearbeiding og konservering av kjøtt',
    hqAddress: 'Schweigaards gate 15',
    hqCity: 'Oslo',
    employees: 4127,
    ownershipType: 'cooperative',
    valueChainStage: 'processing',
    financials: [
      { year: 2020, revenueNok: 24700, operatingResult: 260, operatingMargin: 1.1, groupEmployees: 5300, source: 'Årsrapport 2020' },
      { year: 2021, revenueNok: 26600, operatingResult: 310, operatingMargin: 1.2, groupEmployees: 5200, source: 'Årsrapport 2021' },
      { year: 2022, revenueNok: 28400, operatingResult: -212, operatingMargin: -0.7, groupEmployees: 5100, source: 'Årsrapport 2022' },
      { year: 2023, revenueNok: 30000, operatingResult: 258, operatingMargin: 0.9, groupEmployees: 5300, source: 'Årsrapport 2023' },
      { year: 2024, revenueNok: 30500, operatingResult: 197, operatingMargin: 0.6, groupEmployees: 5500, source: 'Årsrapport 2024' },
    ],
    shareholders: [
      { name: '17 000 bønder', ownershipPct: 100, shareholderType: 'cooperative', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Johan Narum', role: 'styreleder' },
      { personName: 'Morten Henriksen', role: 'CEO' },
      { personName: 'Merethe Sund', role: 'styremedlem' },
      { personName: 'Kenneth Rene Johansen', role: 'styremedlem' },
      { personName: 'Ken Ove Sletthaug', role: 'styremedlem' },
      { personName: 'Erlend Rønning', role: 'styremedlem' },
      { personName: 'Hans Amund Braastad', role: 'styremedlem' },
      { personName: 'Linda Myren', role: 'styremedlem' },
      { personName: 'Ole Johannes Egeland', role: 'styremedlem' },
      { personName: 'Live Major', role: 'styremedlem' },
      { personName: 'Einar Meisfjord', role: 'styremedlem' },
      { personName: 'Ann Kristin Nes', role: 'styremedlem' },
      { personName: 'Ragnhild Sjurgard', role: 'styremedlem' },
      { personName: 'Irene Åstveit', role: 'styremedlem' },
      { personName: 'Martin Mæland', role: 'styremedlem' },
    ],
    properties: [
      { propertyType: 'office', address: 'Schweigaards gate 15', municipality: 'Oslo', county: 'Oslo', lat: 59.9092, lng: 10.7622, source: 'Brønnøysund underenheter' },
      { propertyType: 'production', address: 'Leinskogen 14', municipality: 'Ringsaker', county: 'Innlandet', lat: 60.81, lng: 10.89, source: 'Brønnøysund underenheter' },
      { propertyType: 'production', address: 'Sloraveien 60', municipality: 'Indre Østfold', county: 'Østfold', lat: 59.61, lng: 11.37, source: 'Brønnøysund underenheter' },
      { propertyType: 'production', address: 'Åskollen 3', municipality: 'Tønsberg', county: 'Vestfold', lat: 59.29, lng: 10.40, source: 'Brønnøysund underenheter' },
      { propertyType: 'production', address: 'Gamle Forusveien 50', municipality: 'Stavanger', county: 'Rogaland', lat: 58.89, lng: 5.71, source: 'Brønnøysund underenheter' },
      { propertyType: 'production', address: 'Ludvig Enges vei 15', municipality: 'Sarpsborg', county: 'Østfold', lat: 59.28, lng: 11.11, source: 'Brønnøysund underenheter' },
      { propertyType: 'production', address: 'Stavsjøvegen 14', municipality: 'Malvik', county: 'Trøndelag', lat: 63.42, lng: 10.60, source: 'Brønnøysund underenheter' },
      { propertyType: 'production', address: 'Holtemyrane 6', municipality: 'Sunnfjord', county: 'Vestland', lat: 61.45, lng: 5.85, source: 'Brønnøysund underenheter' },
      { propertyType: 'production', address: 'Hamnegata 28', municipality: 'Steinkjer', county: 'Trøndelag', lat: 64.01, lng: 11.50, source: 'Brønnøysund underenheter' },
      { propertyType: 'production', address: 'Andslimoen', municipality: 'Målselv', county: 'Troms', lat: 69.06, lng: 18.52, source: 'Brønnøysund underenheter' },
      { propertyType: 'production', address: 'Strandgata 14', municipality: 'Hemnes', county: 'Nordland', lat: 66.03, lng: 14.06, source: 'Brønnøysund underenheter' },
      { propertyType: 'production', address: 'Tengsareidveien 7', municipality: 'Eigersund', county: 'Rogaland', lat: 58.45, lng: 5.99, source: 'Brønnøysund underenheter' },
      { propertyType: 'production', address: 'Gamlevegen 20', municipality: 'Gol', county: 'Buskerud', lat: 60.70, lng: 8.95, source: 'Brønnøysund underenheter' },
      { propertyType: 'production', address: 'Granden 8', municipality: 'Sogndal', county: 'Vestland', lat: 61.23, lng: 7.10, source: 'Brønnøysund underenheter' },
      { propertyType: 'production', address: 'Kautokeinoveien 6', municipality: 'Karasjok', county: 'Finnmark', lat: 69.47, lng: 25.51, source: 'Brønnøysund underenheter' },
      { propertyType: 'production', address: 'Stangnesterminalen 5', municipality: 'Harstad', county: 'Troms', lat: 68.80, lng: 16.54, source: 'Brønnøysund underenheter' },
    ],
  },
  {
    name: 'TINE SA',
    orgNr: '947942638',
    legalForm: 'SA',
    founded: 1928,
    naceCode: '10.510',
    naceDescription: 'Produksjon av meierivarer',
    hqAddress: 'Bedriftsveien 7',
    hqCity: 'Oslo',
    employees: 4588,
    ownershipType: 'cooperative',
    valueChainStage: 'processing',
    financials: [
      { year: 2020, revenueNok: 24715, operatingResult: 1992, operatingMargin: 8.1, groupEmployees: 5100, source: 'Årsrapport 2020' },
      { year: 2021, revenueNok: 24300, operatingResult: 1725, operatingMargin: 7.1, groupEmployees: 5100, source: 'Årsrapport 2021' },
      { year: 2022, revenueNok: 24900, operatingResult: 1257, operatingMargin: 5.0, groupEmployees: 5000, source: 'Årsrapport 2022' },
      { year: 2023, revenueNok: 26500, operatingResult: 1426, operatingMargin: 5.4, groupEmployees: 5100, source: 'Årsrapport 2023' },
      { year: 2024, revenueNok: 28300, operatingResult: 2084, operatingMargin: 7.4, groupEmployees: 5200, source: 'Årsrapport 2024' },
    ],
    shareholders: [
      { name: '8 600 melkebønder', ownershipPct: 100, shareholderType: 'cooperative', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Rolf Øyvind Thune', role: 'styreleder' },
      { personName: 'Ann-Beth Nina Freuchen', role: 'CEO' },
      { personName: 'Asgeir Pollestad', role: 'styremedlem' },
      { personName: 'Elin Johanne Aarvik', role: 'styremedlem' },
      { personName: 'Tor Arne Johansen', role: 'styremedlem' },
      { personName: 'Anne Berit Løset', role: 'styremedlem' },
      { personName: 'Hans Olav Minsås', role: 'styremedlem' },
      { personName: 'Ingunn Helene Ruud', role: 'styremedlem' },
      { personName: 'Lise Skreddernes', role: 'styremedlem' },
      { personName: 'Anne Polden', role: 'styremedlem' },
      { personName: 'Arthur Salte', role: 'styremedlem' },
      { personName: 'Kåre Ivar Stormoen', role: 'styremedlem' },
    ],
    properties: [
      { propertyType: 'production', address: 'Bedriftsveien 7', municipality: 'Oslo', county: 'Oslo', lat: 59.9551, lng: 10.8470, source: 'Brønnøysund underenheter' },
      { propertyType: 'production', address: 'Bromstadvegen 68', municipality: 'Trondheim', county: 'Trøndelag', lat: 63.44, lng: 10.44, source: 'Brønnøysund underenheter' },
      { propertyType: 'production', address: 'Strandsagvegen 1', municipality: 'Ringsaker', county: 'Innlandet', lat: 60.88, lng: 10.94, source: 'Brønnøysund underenheter' },
      { propertyType: 'production', address: 'Næringsvegen 21', municipality: 'Hå', county: 'Rogaland', lat: 58.67, lng: 5.65, source: 'Brønnøysund underenheter' },
      { propertyType: 'production', address: 'Fryavegen 64', municipality: 'Ringebu', county: 'Innlandet', lat: 61.53, lng: 10.07, source: 'Brønnøysund underenheter' },
      { propertyType: 'production', address: 'Espehaugen 18', municipality: 'Bergen', county: 'Vestland', lat: 60.33, lng: 5.27, source: 'Brønnøysund underenheter' },
      { propertyType: 'production', address: 'Klaus Nilsens gate 14', municipality: 'Ålesund', county: 'Møre og Romsdal', lat: 62.47, lng: 6.15, source: 'Brønnøysund underenheter' },
      { propertyType: 'production', address: 'Melkevegen 1', municipality: 'Verdal', county: 'Trøndelag', lat: 63.79, lng: 11.48, source: 'Brønnøysund underenheter' },
      { propertyType: 'production', address: 'Heggstadmyra 19', municipality: 'Trondheim', county: 'Trøndelag', lat: 63.37, lng: 10.36, source: 'Brønnøysund underenheter' },
      { propertyType: 'production', address: 'Lakkegata 23', municipality: 'Oslo', county: 'Oslo', lat: 59.9172, lng: 10.7618, source: 'Brønnøysund underenheter' },
      { propertyType: 'production', address: 'Grannessletta 112', municipality: 'Sola', county: 'Rogaland', lat: 58.88, lng: 5.60, source: 'Brønnøysund underenheter' },
      { propertyType: 'production', address: 'Skogveien 18', municipality: 'Harstad', county: 'Troms', lat: 68.80, lng: 16.54, source: 'Brønnøysund underenheter' },
      { propertyType: 'production', address: 'Meierivegen 1', municipality: 'Gloppen', county: 'Vestland', lat: 61.79, lng: 6.22, source: 'Brønnøysund underenheter' },
      { propertyType: 'production', address: 'Lalandsvegen 1', municipality: 'Klepp', county: 'Rogaland', lat: 58.77, lng: 5.60, source: 'Brønnøysund underenheter' },
      { propertyType: 'production', address: 'Hellemyrbakken 3', municipality: 'Kristiansand', county: 'Agder', lat: 58.15, lng: 8.00, source: 'Brønnøysund underenheter' },
      { propertyType: 'production', address: 'Meieriveien 21', municipality: 'Balsfjord', county: 'Troms', lat: 69.19, lng: 19.17, source: 'Brønnøysund underenheter' },
      { propertyType: 'production', address: 'Meieriveien 5', municipality: 'Alta', county: 'Finnmark', lat: 69.97, lng: 23.27, source: 'Brønnøysund underenheter' },
      { propertyType: 'production', address: 'Grenveien 9', municipality: 'Tana', county: 'Finnmark', lat: 70.01, lng: 27.00, source: 'Brønnøysund underenheter' },
    ],
  },
  {
    name: 'Felleskjøpet Agri SA',
    orgNr: '911608103',
    legalForm: 'SA',
    founded: 1896,
    naceCode: '46.210',
    naceDescription: 'Engroshandel med korn, råtobakk, såvarer og fôrvarer',
    hqAddress: 'Depotgata 22',
    hqCity: 'Lillestrøm',
    employees: 2532,
    ownershipType: 'cooperative',
    valueChainStage: 'inputs',
    financials: [
      { year: 2020, revenueNok: 17300, operatingResult: 622, operatingMargin: 3.6, groupEmployees: 4080, source: 'Årsrapport 2020' },
      { year: 2021, revenueNok: 18700, operatingResult: 554, operatingMargin: 3.0, groupEmployees: 4107, source: 'Årsrapport 2021' },
      { year: 2022, revenueNok: 20200, operatingResult: 916, operatingMargin: 4.5, groupEmployees: 4218, source: 'Årsrapport 2022' },
      { year: 2023, revenueNok: 20500, operatingResult: 823, operatingMargin: 4.0, groupEmployees: 4200, source: 'Årsrapport 2023' },
      { year: 2024, revenueNok: 21200, operatingResult: 758, operatingMargin: 3.6, groupEmployees: 4200, source: 'Årsrapport 2024' },
    ],
    shareholders: [
      { name: '42 000 bondemedlemmer', ownershipPct: 100, shareholderType: 'cooperative', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Jens Lippestad', role: 'styreleder' },
      { personName: 'Svenn Ivar Fure', role: 'CEO' },
      { personName: 'Elisabeth Holand', role: 'styremedlem' },
      { personName: 'Frank Gjøran Fandin', role: 'styremedlem' },
      { personName: 'Grim Erik Gillestad', role: 'styremedlem' },
      { personName: 'Thor Johannes Rogneby', role: 'styremedlem' },
      { personName: 'Elisabeth Nilsen', role: 'styremedlem' },
      { personName: 'Borgny Grande', role: 'styremedlem' },
      { personName: 'Erling Aune', role: 'styremedlem' },
      { personName: 'Sigbjørn Aurland', role: 'styremedlem' },
      { personName: 'Torbjørg Kylland', role: 'styremedlem' },
      { personName: 'Ann Kristin Nygaard', role: 'styremedlem' },
      { personName: 'Knut Repstad', role: 'styremedlem' },
    ],
  },
  {
    name: 'BAMA Gruppen AS',
    orgNr: '914224314',
    legalForm: 'AS',
    founded: 1914,
    naceCode: '46.310',
    naceDescription: 'Engroshandel med frukt og grønnsaker',
    hqAddress: 'Nedre Kalbakkvei 40',
    hqCity: 'Oslo',
    employees: 540,
    ownershipType: 'family',
    valueChainStage: 'logistics',
    financials: [
      { year: 2020, revenueNok: 20000, operatingResult: 450, operatingMargin: 2.3, groupEmployees: 2900, source: 'Årsrapport 2020' },
      { year: 2021, revenueNok: 20800, operatingResult: 500, operatingMargin: 2.4, groupEmployees: 2950, source: 'Årsrapport 2021' },
      { year: 2022, revenueNok: 21500, operatingResult: 420, operatingMargin: 2.0, groupEmployees: 3119, source: 'Årsrapport 2022' },
      { year: 2023, revenueNok: 23100, operatingResult: 631, operatingMargin: 2.7, groupEmployees: 3100, source: 'Årsrapport 2023' },
      { year: 2024, revenueNok: 24000, operatingResult: 550, operatingMargin: 2.3, groupEmployees: 3000, source: 'Estimat basert på bransjedata' },
    ],
    shareholders: [
      { name: 'NorgesGruppen ASA', ownershipPct: 46, shareholderType: 'institutional', isControlling: true },
      { name: 'REMA Industrier AS', ownershipPct: 20, shareholderType: 'institutional', isControlling: false },
      { name: 'AS Banan', ownershipPct: 34, shareholderType: 'family', isControlling: false },
    ],
    boardMembers: [
      { personName: 'Kristian Nergaard', role: 'styreleder' },
      { personName: 'Bent Andersen', role: 'CEO' },
      { personName: 'Runar Hollevik', role: 'styremedlem' },
      { personName: 'Ole Robert Reitan', role: 'styremedlem' },
      { personName: 'Jostein Hestøy', role: 'styremedlem' },
      { personName: 'Ihsan Akram', role: 'styremedlem' },
      { personName: 'Rune Dalsaune', role: 'styremedlem' },
      { personName: 'Kirsten Værdal', role: 'styremedlem' },
      { personName: 'Gyrid Ingerø', role: 'styremedlem' },
    ],
  },
  {
    name: 'Mowi ASA',
    orgNr: '964118191',
    legalForm: 'ASA',
    founded: 1992,
    naceCode: '03.211',
    naceDescription: 'Produksjon av matfisk og skalldyr i hav- og kystbasert fiskeoppdrett',
    hqAddress: 'Sandviksbodene 77A/B',
    hqCity: 'Bergen',
    employees: 2496,
    ownershipType: 'listed',
    valueChainStage: 'seafood',
    financials: [
      { year: 2020, revenueNok: 40200, operatingResult: 3600, operatingMargin: 9.0, groupEmployees: 14800, source: 'Årsrapport 2020 (EUR 3 760M, kurs ~10.7)' },
      { year: 2021, revenueNok: 47200, operatingResult: 6500, operatingMargin: 13.8, groupEmployees: 14000, source: 'Årsrapport 2021 (EUR 4 630M, kurs ~10.2)' },
      { year: 2022, revenueNok: 55300, operatingResult: 10800, operatingMargin: 19.5, groupEmployees: 10400, source: 'Årsrapport 2022 (EUR 5 478M, kurs ~10.1)' },
      { year: 2023, revenueNok: 62700, operatingResult: 11700, operatingMargin: 18.7, groupEmployees: 10300, source: 'Årsrapport 2023 (EUR 5 500M, kurs ~11.4)' },
      { year: 2024, revenueNok: 63900, operatingResult: 7400, operatingMargin: 11.6, groupEmployees: 11500, source: 'Årsrapport 2024 (EUR 5 599M, kurs ~11.4)' },
    ],
    shareholders: [
      { name: 'John Fredriksen', ownershipPct: 14.4, shareholderType: 'family', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Ivan Vindheim', role: 'CEO' },
      { personName: 'Leif Teksum', role: 'styremedlem' },
      { personName: 'Peder Strand', role: 'styremedlem' },
      { personName: 'Lisbet Karin Nærø', role: 'styremedlem' },
      { personName: 'Kjersti Helen Hobøl', role: 'styremedlem' },
      { personName: 'Aino Kristin Olaisen', role: 'styremedlem' },
      { personName: 'Kathrine Fredriksen', role: 'styremedlem' },
      { personName: 'Eivind Kallbekken', role: 'styremedlem' },
      { personName: 'John Olav Johansen', role: 'styremedlem' },
      { personName: 'Marit Utnes', role: 'styremedlem' },
    ],
  },
  {
    name: 'SalMar ASA',
    orgNr: '960514718',
    legalForm: 'ASA',
    founded: 1991,
    naceCode: '10.209',
    naceDescription: 'Slakting, bearbeiding og konservering av fisk og fiskevarer ellers',
    hqCity: 'Kverva',
    employees: 63,
    ownershipType: 'family',
    valueChainStage: 'seafood',
    financials: [
      { year: 2020, revenueNok: 14972, operatingResult: 3000, operatingMargin: 20.0, groupEmployees: 1600, source: 'Årsrapport 2020' },
      { year: 2021, revenueNok: 20070, operatingResult: 3455, operatingMargin: 17.2, groupEmployees: 1700, source: 'Årsrapport 2021' },
      { year: 2022, revenueNok: 28219, operatingResult: 4775, operatingMargin: 16.9, groupEmployees: 2500, source: 'Årsrapport 2022' },
      { year: 2023, revenueNok: 26318, operatingResult: 8583, operatingMargin: 32.6, groupEmployees: 5200, source: 'Årsrapport 2023' },
      { year: 2024, revenueNok: 26426, operatingResult: 5235, operatingMargin: 19.8, groupEmployees: 5500, source: 'Årsrapport 2024' },
    ],
    shareholders: [
      { name: 'Gustav Witzøe', ownershipPct: 41.3, shareholderType: 'family', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Gustav Witzøe', role: 'styreleder' },
      { personName: 'Frode Arntsen', role: 'CEO' },
      { personName: 'Margrethe Hauge', role: 'styremedlem' },
      { personName: 'Leif Inge Nordhammer', role: 'styremedlem' },
      { personName: 'Morten Loktu', role: 'styremedlem' },
      { personName: 'Arnhild Holstad', role: 'styremedlem' },
      { personName: 'Ingvild Kindlihagen', role: 'styremedlem' },
      { personName: 'Stig Arne Stensen', role: 'styremedlem' },
    ],
  },
  {
    name: 'Lerøy Seafood Group ASA',
    orgNr: '975350940',
    legalForm: 'ASA',
    founded: 1995,
    naceCode: '03.211',
    naceDescription: 'Produksjon av matfisk og skalldyr i hav- og kystbasert fiskeoppdrett',
    hqAddress: 'Thormøhlens gate 51B',
    hqCity: 'Bergen',
    employees: 238,
    ownershipType: 'listed',
    valueChainStage: 'seafood',
    financials: [
      { year: 2020, revenueNok: 23073, operatingResult: 3548, operatingMargin: 15.4, groupEmployees: 4293, source: 'Årsrapport 2020' },
      { year: 2021, revenueNok: 26641, operatingResult: 4277, operatingMargin: 16.1, groupEmployees: 4953, source: 'Årsrapport 2021' },
      { year: 2022, revenueNok: 30853, operatingResult: 3299, operatingMargin: 10.7, groupEmployees: 5092, source: 'Årsrapport 2022' },
      { year: 2023, revenueNok: 31124, operatingResult: 3027, operatingMargin: 9.7, groupEmployees: 5203, source: 'Årsrapport 2023' },
      { year: 2024, revenueNok: 34009, operatingResult: 1561, operatingMargin: 4.6, groupEmployees: 5269, source: 'Årsrapport 2024' },
    ],
    shareholders: [
      { name: 'Austevoll Seafood (Møgster-familien)', ownershipPct: 52.7, shareholderType: 'family', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Arne Møgster', role: 'styreleder' },
      { personName: 'Henning Kolbjørn Beltestad', role: 'CEO' },
      { personName: 'Britt Kathrine Drivenes', role: 'styremedlem' },
      { personName: 'Didrik Oskar Munch', role: 'styremedlem' },
      { personName: 'Karoline Møgster', role: 'styremedlem' },
      { personName: 'Are Dragesund', role: 'styremedlem' },
      { personName: 'Linda Pedersen', role: 'styremedlem' },
      { personName: 'Silje Elin Butt', role: 'styremedlem' },
      { personName: 'Bjarne Egil Kristiansen', role: 'styremedlem' },
      { personName: 'Tor-Ivar Ingebrigtsen', role: 'styremedlem' },
    ],
  },
  {
    name: 'Yara International ASA',
    orgNr: '986228608',
    legalForm: 'ASA',
    founded: 2003,
    naceCode: '20.150',
    naceDescription: 'Produksjon av gjødsel, nitrogenforbindelser og vekstjord',
    hqAddress: 'Drammensveien 131',
    hqCity: 'Oslo',
    employees: 704,
    ownershipType: 'state',
    valueChainStage: 'inputs',
    financials: [
      { year: 2020, revenueNok: 109000, operatingResult: 5500, operatingMargin: 5.0, groupEmployees: 17800, source: 'Årsrapport 2020 (USD 11.6B, kurs ~9.4)' },
      { year: 2021, revenueNok: 143000, operatingResult: 14000, operatingMargin: 9.8, groupEmployees: 17500, source: 'Årsrapport 2021 (USD 16.6B, kurs ~8.6)' },
      { year: 2022, revenueNok: 231000, operatingResult: 32000, operatingMargin: 13.9, groupEmployees: 17800, source: 'Årsrapport 2022 (USD 24.1B, kurs ~9.6)' },
      { year: 2023, revenueNok: 164000, operatingResult: 6700, operatingMargin: 4.1, groupEmployees: 18000, source: 'Årsrapport 2023 (USD 15.6B, kurs ~10.5)' },
      { year: 2024, revenueNok: 149000, operatingResult: 6900, operatingMargin: 4.6, groupEmployees: 18000, source: 'Årsrapport 2024 (USD 13.9B, kurs ~10.7)' },
    ],
    shareholders: [
      { name: 'Den norske stat', ownershipPct: 36.2, shareholderType: 'state', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Trond Berger', role: 'styreleder' },
      { personName: 'Svein Tore Holsether', role: 'CEO' },
      { personName: 'Jannicke Hilland', role: 'styremedlem' },
      { personName: 'John Gabriel Thuestad', role: 'styremedlem' },
      { personName: 'Tove Feld', role: 'styremedlem' },
      { personName: 'Jais Stampe Li Valeur', role: 'styremedlem' },
      { personName: 'Tina Elizabeth Lawton', role: 'styremedlem' },
      { personName: 'Harald Lauritz Thorstein', role: 'styremedlem' },
      { personName: 'Rune Asle Bratteberg', role: 'styremedlem' },
      { personName: 'Geir Olav Sundbø', role: 'styremedlem' },
      { personName: 'Ragnhild Høimyr', role: 'styremedlem' },
      { personName: 'Eva Safrine Aspvik', role: 'styremedlem' },
    ],
    subsidies: [
      {
        subsidyType: 'Enova teknologiportefølje',
        project: 'Grønn ammoniakk Porsgrunn',
        amountNok: 283250000,
        year: 2022,
        source:
          'https://www.mynewsdesk.com/no/enova-sf/pressreleases/yara-vil-bruke-groent-hydrogen-i-gjoedselproduksjonen-i-porsgrunn-faar-inntil-283-millioner-i-stoette-fra-enova-3151659',
      },
    ],
  },
  {
    name: 'Skretting AS',
    orgNr: '988044113',
    legalForm: 'AS',
    founded: 2005,
    naceCode: '10.910',
    naceDescription: 'Produksjon av fôrvarer til husdyrhold',
    hqAddress: 'Sjøhagen 6',
    hqCity: 'Stavanger',
    employees: 310,
    ownershipType: 'foreign',
    valueChainStage: 'inputs',
    financials: [
      { year: 2020, revenueNok: 7500, operatingResult: 350, operatingMargin: 4.7, groupEmployees: 550, source: 'Estimat basert på bransjedata' },
      { year: 2021, revenueNok: 8200, operatingResult: 400, operatingMargin: 4.9, groupEmployees: 560, source: 'Estimat basert på bransjedata' },
      { year: 2022, revenueNok: 10500, operatingResult: 500, operatingMargin: 4.8, groupEmployees: 580, source: 'Estimat basert på bransjedata' },
      { year: 2023, revenueNok: 11000, operatingResult: 550, operatingMargin: 5.0, groupEmployees: 590, source: 'Estimat basert på bransjedata' },
      { year: 2024, revenueNok: 12000, operatingResult: 600, operatingMargin: 5.0, groupEmployees: 600, source: 'Estimat basert på bransjedata' },
    ],
    shareholders: [
      { name: 'Nutreco/SHV Holdings (Nederland)', ownershipPct: 100, shareholderType: 'foreign', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Håvard Walde', role: 'styreleder' },
      { personName: 'Mads Martinsen', role: 'CEO' },
      { personName: 'May-Helen Holme', role: 'styremedlem' },
      { personName: 'Marina Iren Kvarsvik', role: 'styremedlem' },
      { personName: 'Frank Åge Enstad', role: 'styremedlem' },
      { personName: 'Hilde Kristin Roald', role: 'styremedlem' },
      { personName: 'Marius De Haas', role: 'styremedlem' },
      { personName: 'Line Andersen', role: 'styremedlem' },
    ],
  },
  {
    name: 'ASKO Norge AS',
    orgNr: '929228723',
    legalForm: 'AS',
    founded: 2022,
    naceCode: '46.390',
    naceDescription: 'Engroshandel med bredt utvalg av nærings- og nytelsesmidler',
    hqAddress: 'Nedre Kalbakkvei 22',
    hqCity: 'Oslo',
    employees: 107,
    ownershipType: 'family',
    valueChainStage: 'logistics',
    financials: [
      { year: 2020, revenueNok: 78000, operatingResult: 1200, operatingMargin: 1.5, groupEmployees: 3800, source: 'Estimat basert på ASKO-selskapene samlet' },
      { year: 2021, revenueNok: 80000, operatingResult: 1300, operatingMargin: 1.6, groupEmployees: 3900, source: 'Estimat basert på ASKO-selskapene samlet' },
      { year: 2022, revenueNok: 85000, operatingResult: 1400, operatingMargin: 1.6, groupEmployees: 4000, source: 'Estimat basert på ASKO-selskapene samlet' },
      { year: 2023, revenueNok: 90000, operatingResult: 1400, operatingMargin: 1.6, groupEmployees: 4100, source: 'Estimat basert på ASKO-selskapene samlet' },
      { year: 2024, revenueNok: 95000, operatingResult: 1500, operatingMargin: 1.6, groupEmployees: 4200, source: 'Årsrapport 2024' },
    ],
    shareholders: [
      { name: 'NorgesGruppen ASA (100%)', ownershipPct: 100, shareholderType: 'institutional', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Runar Hollevik', role: 'styreleder' },
      { personName: 'Tore Bekken', role: 'CEO' },
      { personName: 'Grete Ovanger', role: 'styremedlem' },
      { personName: 'Dina Thune', role: 'styremedlem' },
      { personName: 'Kristine Stranne', role: 'styremedlem' },
      { personName: 'Knut Hartvig Johannson', role: 'styremedlem' },
      { personName: 'Jan Paul Bjørkøy', role: 'styremedlem' },
    ],
    properties: [
      { propertyType: 'office', address: 'Nedre Kalbakkvei 22', municipality: 'Oslo', county: 'Oslo', lat: 59.9551, lng: 10.8470, source: 'Brønnøysund underenheter' },
    ],
  },
  {
    name: 'Too Good To Go Norge AS',
    orgNr: '917203261',
    legalForm: 'AS',
    founded: 2016,
    naceCode: '73.110',
    naceDescription: 'Reklamebyråer',
    hqAddress: 'Tordenskiolds gate 2',
    hqCity: 'Oslo',
    employees: 18,
    ownershipType: 'foreign',
    valueChainStage: 'circular',
    shareholders: [
      { name: 'Too Good To Go Holding ApS (Danmark)', ownershipPct: 100, shareholderType: 'foreign', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Mette Lykke Ravn', role: 'styreleder' },
      { personName: 'Ken Vanhoegaerden', role: 'CEO' },
      { personName: 'Sigve Skattebo', role: 'styremedlem' },
      { personName: 'Lucie Basch', role: 'styremedlem' },
      { personName: 'Thomas Damsgaard', role: 'styremedlem' },
    ],
  },
  {
    name: 'Oda',
    orgNr: '932256134',
    legalForm: 'AS',
    founded: 2013,
    naceCode: '47.911',
    naceDescription: 'Postordre-/Internetthandel med bredt vareutvalg',
    hqAddress: 'Kjølberggata 31',
    hqCity: 'Oslo',
    ownershipType: 'private',
    valueChainStage: 'retail',
    shareholders: [
      { name: 'AGP Advokater AS', ownershipPct: 100, shareholderType: 'institutional', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Andre Rolf Knüppel', role: 'styreleder' },
      { personName: 'Karl Munthe-Kaas', role: 'CEO' },
      { personName: 'Carl-Fredrik Bergan', role: 'styremedlem' },
      { personName: 'Sara Elisabet Manne', role: 'styremedlem' },
      { personName: 'Kristoffer Eide Hoen', role: 'styremedlem' },
      { personName: 'Lars Boilesen', role: 'styremedlem' },
      { personName: 'Nils Petter Hollekim', role: 'styremedlem' },
    ],
  },
  {
    name: 'Holdbart AS',
    orgNr: '815664582',
    legalForm: 'AS',
    founded: 2015,
    naceCode: '47.111',
    naceDescription: 'Butikkhandel med bredt vareutvalg med hovedvekt på nærings- og nytelsesmidler',
    hqAddress: 'Høgdaveien 1',
    hqCity: 'Vestby',
    employees: 307,
    ownershipType: 'private',
    valueChainStage: 'circular',
    financials: [
      { year: 2022, revenueNok: 280, operatingResult: -15, operatingMargin: -5.4, groupEmployees: 120, source: 'Proff.no 2023' },
      { year: 2023, revenueNok: 420, operatingResult: 5, operatingMargin: 1.2, groupEmployees: 200, source: 'Proff.no 2024' },
      { year: 2024, revenueNok: 579, operatingResult: 23, operatingMargin: 4.0, groupEmployees: 307, source: 'Regnskap 2024' },
    ],
    boardMembers: [
      { personName: 'Tommy Korneliussen', role: 'styreleder' },
      { personName: 'Trond Laeng', role: 'CEO' },
      { personName: 'Martin Gjølme', role: 'styremedlem' },
      { personName: 'Hannah Gunvor Jacobsen', role: 'styremedlem' },
      { personName: 'Solveig Fauske', role: 'styremedlem' },
    ],
  },
  {
    name: 'Matsentralen Norge',
    orgNr: '919702974',
    legalForm: 'FLI',
    founded: 2017,
    naceCode: '94.991',
    naceDescription: 'Aktiviteter i andre interesseorganisasjoner ikke nevnt annet sted',
    hqAddress: 'Gladengveien 17',
    hqCity: 'Oslo',
    employees: 5,
    ownershipType: 'nonprofit',
    valueChainStage: 'circular',
    boardMembers: [
      { personName: 'Dag Jakob Opedal', role: 'styreleder' },
      { personName: 'Monica Fuhr', role: 'CEO' },
      { personName: 'Jostein Hågan', role: 'styremedlem' },
      { personName: 'Cristiano Aubert', role: 'styremedlem' },
      { personName: 'Tor Jan Bredenbekk', role: 'styremedlem' },
      { personName: 'Signe Sæter', role: 'styremedlem' },
      { personName: 'Christian Førland', role: 'styremedlem' },
      { personName: 'Elin Herikstad', role: 'styremedlem' },
      { personName: 'Anne-Grete Haugen', role: 'styremedlem' },
    ],
  },
  {
    name: 'Matvett AS',
    orgNr: '997898397',
    legalForm: 'AS',
    founded: 2012,
    naceCode: '82.990',
    naceDescription: 'Annen forretningsmessig tjenesteyting ikke nevnt annet sted',
    hqAddress: 'Middelthuns gate 27',
    hqCity: 'Oslo',
    ownershipType: 'private',
    valueChainStage: 'circular',
    shareholders: [
      { name: 'NHO Mat og Drikke / Bransjeaktører', ownershipPct: 100, shareholderType: 'institutional', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Petter Ivar Brubakk', role: 'styreleder' },
      { personName: 'Anne-Grete Haugen', role: 'CEO' },
      { personName: 'Morten Karlsen', role: 'styremedlem' },
      { personName: 'Signe Sæter', role: 'styremedlem' },
      { personName: 'Anne Cathrine Berger', role: 'styremedlem' },
      { personName: 'Emma Maria Elisabeth Bjørke', role: 'styremedlem' },
    ],
  },
  {
    name: 'Nofima AS',
    orgNr: '989278835',
    legalForm: 'AS',
    founded: 2005,
    naceCode: '72.190',
    naceDescription: 'Annen forskning og annet utviklingsarbeid innen naturvitenskap og teknikk',
    hqAddress: 'Muninbakken 9-13',
    hqCity: 'Tromsø',
    employees: 393,
    ownershipType: 'state',
    valueChainStage: 'research',
    financials: [
      { year: 2020, revenueNok: 650, operatingResult: 12, operatingMargin: 1.8, groupEmployees: 380, source: 'Nofima Årsrapport 2020' },
      { year: 2021, revenueNok: 680, operatingResult: 8, operatingMargin: 1.2, groupEmployees: 385, source: 'Nofima Årsrapport 2021' },
      { year: 2022, revenueNok: 710, operatingResult: -5, operatingMargin: -0.7, groupEmployees: 390, source: 'Nofima Årsrapport 2022' },
      { year: 2023, revenueNok: 725, operatingResult: -18, operatingMargin: -2.5, groupEmployees: 392, source: 'Nofima Årsrapport 2023' },
      { year: 2024, revenueNok: 736, operatingResult: -24, operatingMargin: -3.3, groupEmployees: 393, source: 'Regnskap 2024' },
    ],
    shareholders: [
      { name: 'Nærings- og fiskeridepartementet', ownershipPct: 56.8, shareholderType: 'state', isControlling: true },
      { name: 'Stiftelsen for landbruksforskning', ownershipPct: 33.2, shareholderType: 'foundation', isControlling: false },
    ],
    boardMembers: [
      { personName: 'Thomas Henning Farstad', role: 'styreleder' },
      { personName: 'Bente Elisabeth Torstensen', role: 'CEO' },
      { personName: 'Trond Vilhelm Lund', role: 'styremedlem' },
      { personName: 'Kirsti Hjelde', role: 'styremedlem' },
      { personName: 'Pål Andreas Pedersen', role: 'styremedlem' },
      { personName: 'Kjersti Lian', role: 'styremedlem' },
      { personName: 'Marianne Emblemsvåg', role: 'styremedlem' },
      { personName: 'Catharina Lindheim', role: 'styremedlem' },
      { personName: 'Rune Rødbotten', role: 'styremedlem' },
    ],
  },
  {
    name: 'Austevoll Seafood ASA',
    orgNr: '929975200',
    legalForm: 'ASA',
    founded: 1981,
    naceCode: '03.211',
    naceDescription: 'Produksjon av matfisk, bløtdyr, krepsdyr og andre akvatiske organismer i saltvann',
    hqAddress: 'Alfabygget 1',
    hqCity: 'Storebø',
    employees: 7800,
    ownershipType: 'listed',
    valueChainStage: 'seafood',
    financials: [
      { year: 2022, revenueNok: 32400, operatingMargin: 14.2, groupEmployees: 8200, source: 'Austevoll Seafood Årsrapport 2022' },
      { year: 2023, revenueNok: 28900, operatingMargin: 10.5, groupEmployees: 7900, source: 'Austevoll Seafood Årsrapport 2023' },
      { year: 2024, revenueNok: 30600, operatingMargin: 11.8, groupEmployees: 7800, source: 'Austevoll Seafood Årsrapport 2024' },
    ],
    shareholders: [
      { name: 'Laco AS (Møgster-familien)', ownershipPct: 52.7, shareholderType: 'family', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Helge Møgster', role: 'styreleder' },
      { personName: 'Arne Møgster', role: 'CEO' },
      { personName: 'Lill Maren Møgster', role: 'styremedlem' },
    ],
  },
  {
    name: 'Kavli Holding AS',
    orgNr: '913344162',
    legalForm: 'AS',
    founded: 1893,
    naceCode: '10.510',
    naceDescription: 'Produksjon av meierivarer',
    hqAddress: 'Karenslyst Allé 2',
    hqCity: 'Oslo',
    employees: 800,
    ownershipType: 'foundation',
    valueChainStage: 'processing',
    shareholders: [
      { name: 'O. Kavli og Knut Kavlis Allmennyttige Fond', ownershipPct: 100, shareholderType: 'foundation', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Erik Volden', role: 'styreleder' },
      { personName: 'Inger Elise Mey', role: 'CEO' },
      { personName: 'Trond Mohn', role: 'styremedlem' },
    ],
  },
  {
    name: 'Unil AS',
    orgNr: '885316522',
    legalForm: 'AS',
    founded: 2004,
    naceCode: '46.390',
    naceDescription: 'Engroshandel med bredt utvalg av nærings- og nytelsesmidler',
    hqAddress: 'Karenlyst Allé 12-14',
    hqCity: 'Oslo',
    employees: 183,
    ownershipType: 'private',
    valueChainStage: 'processing',
    shareholders: [
      { name: 'NorgesGruppen ASA', ownershipPct: 100, shareholderType: 'institutional', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Runar Hollevik', role: 'styreleder' },
      { personName: 'Anne Catrine Tøftum', role: 'CEO' },
    ],
  },
  {
    name: 'REMA 1000 Norge AS',
    orgNr: '982254604',
    legalForm: 'AS',
    founded: 1979,
    naceCode: '77.400',
    naceDescription: 'Utleie av immateriell eiendom og lignende produkter, unntatt opphavsrettsbeskyttede verker',
    hqAddress: 'Gladengveien 2',
    hqCity: 'Oslo',
    employees: 543,
    ownershipType: 'family',
    valueChainStage: 'retail',
    shareholders: [
      { name: 'Reitan Retail AS', ownershipPct: 100, shareholderType: 'institutional', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Ole Robert Reitan', role: 'styreleder' },
      { personName: 'Trond Bentestuen', role: 'CEO' },
    ],
  },

  // === M&A TARGETS (Session 10) ===

  {
    name: 'NTS ASA',
    orgNr: '952587687',
    legalForm: 'ASA',
    founded: 2013,
    naceCode: '03.211',
    naceDescription: 'Produksjon av matfisk og skalldyr i hav- og kystbasert fiskeoppdrett',
    hqCity: 'Rørvik',
    ownershipType: 'listed',
    valueChainStage: 'seafood',
    shareholders: [
      { name: 'SalMar ASA (100% etter fusjon)', ownershipPct: 100, shareholderType: 'institutional', isControlling: true },
    ],
  },
  {
    name: 'Nova Sea AS',
    orgNr: '961056268',
    legalForm: 'AS',
    founded: 1991,
    naceCode: '03.211',
    naceDescription: 'Produksjon av matfisk og skalldyr i hav- og kystbasert fiskeoppdrett',
    hqCity: 'Lovund',
    employees: 358,
    ownershipType: 'private',
    valueChainStage: 'seafood',
    shareholders: [
      { name: 'Mowi ASA', ownershipPct: 95, shareholderType: 'institutional', isControlling: true },
    ],
  },
  {
    name: 'Orkla Food Ingredients AS',
    orgNr: '911161419',
    legalForm: 'AS',
    founded: 1918,
    naceCode: '10.610',
    naceDescription: 'Produksjon av kornvarer',
    hqAddress: 'Drammensveien 149A',
    hqCity: 'Oslo',
    employees: 30,
    ownershipType: 'private',
    valueChainStage: 'processing',
    shareholders: [
      { name: 'Orkla ASA', ownershipPct: 60, shareholderType: 'institutional', isControlling: true },
      { name: 'Rhône Capital', ownershipPct: 40, shareholderType: 'institutional', isControlling: false },
    ],
  },
  {
    name: 'Lilleborg AS',
    orgNr: '925745855',
    legalForm: 'AS',
    founded: 2020,
    naceCode: '46.750',
    naceDescription: 'Engroshandel med kjemiske produkter',
    hqAddress: 'Hoffsveien 21',
    hqCity: 'Oslo',
    employees: 133,
    ownershipType: 'foreign',
    valueChainStage: 'processing',
    shareholders: [
      { name: 'Solenis International LLC', ownershipPct: 100, shareholderType: 'foreign', isControlling: true },
    ],
  },
]

const nordicCompanies: CompanyData[] = [
  // === M&A TARGETS (Nordic, Session 10) ===
  {
    name: 'City Gross Sverige AB',
    orgNr: 'SE-556597-2451',
    country: 'SE',
    legalForm: 'AB',
    founded: 2000,
    hqCity: 'Hässleholm',
    hqAddress: 'Industrigatan 22',
    naceCode: '47.110',
    naceDescription: 'Detaljhandel med livsmedel',
    employees: 1871,
    ownershipType: 'listed',
    valueChainStage: 'retail',
    financials: [
      { year: 2025, revenueNok: 8898, operatingResult: -192, operatingMargin: -2.2, groupEmployees: 1871, source: 'Axfood City Gross key figures 2025. SEK 8,898M net sales; SEK -192M operating profit; 1 SEK ≈ 1.00 NOK' },
    ],
    shareholders: [
      { name: 'Axfood AB (100% etter oppkjøp)', ownershipPct: 100, shareholderType: 'institutional', isControlling: true },
    ],
  },

  // === SWEDEN ===
  {
    name: 'ICA Gruppen AB',
    orgNr: 'SE-556048-2837',
    country: 'SE',
    legalForm: 'AB',
    founded: 1938,
    hqCity: 'Solna',
    hqAddress: 'Svetsarvägen 16',
    employees: 24000,
    ownershipType: 'listed',
    valueChainStage: 'retail',
    financials: [
      { year: 2020, revenueNok: 118100, operatingMargin: 3.8, groupEmployees: 22800, source: 'ICA Gruppen Årsrapport 2020. SEK 121.7B, 1 SEK ≈ 0.97 NOK' },
      { year: 2021, revenueNok: 122000, operatingMargin: 3.9, groupEmployees: 23000, source: 'ICA Gruppen Årsrapport 2021. SEK 125.8B, 1 SEK ≈ 0.97 NOK' },
      { year: 2022, revenueNok: 135000, operatingMargin: 4.0, groupEmployees: 23500, source: 'ICA Gruppen Årsrapport 2022. SEK 137.8B, 1 SEK ≈ 0.98 NOK' },
      { year: 2023, revenueNok: 142700, operatingMargin: 4.1, groupEmployees: 24000, source: 'ICA Gruppen Årsrapport 2023. SEK 142.7B, 1 SEK ≈ 1.00 NOK' },
      { year: 2024, revenueNok: 157200, operatingMargin: 4.2, groupEmployees: 24000, source: 'ICA Gruppen Årsrapport 2024. SEK 157.2B, 1 SEK ≈ 1.00 NOK' },
    ],
    shareholders: [
      { name: 'ICA-handlarnas Förbund', ownershipPct: 87, shareholderType: 'institutional', isControlling: true },
      { name: 'AMF Pensionsförsäkring AB', ownershipPct: 13, shareholderType: 'institutional', isControlling: false },
    ],
    boardMembers: [
      { personName: 'Magnus Moberg', role: 'styrelseordförande' },
      { personName: 'Nina Jönsson', role: 'CEO' },
      { personName: 'Jan Amethier', role: 'styremedlem' },
      { personName: 'Göran Blomberg', role: 'styremedlem' },
      { personName: 'Bengt Kjell', role: 'styremedlem' },
      { personName: 'Cecilia Horne', role: 'styremedlem' },
      { personName: 'Anette Rosengren', role: 'styremedlem' },
      { personName: 'Petra Hesser', role: 'styremedlem' },
      { personName: 'Lars Idermark', role: 'styremedlem' },
      { personName: 'Fredrik Hägglund', role: 'CFO' },
    ],
  },
  {
    name: 'Axfood AB',
    orgNr: 'SE-556542-5353',
    country: 'SE',
    legalForm: 'AB',
    founded: 2000,
    hqCity: 'Stockholm',
    hqAddress: 'Norrlandsgatan 16',
    employees: 15000,
    ownershipType: 'listed',
    valueChainStage: 'retail',
    financials: [
      { year: 2020, revenueNok: 51900, operatingMargin: 4.2, groupEmployees: 12000, source: 'Axfood Årsredovisning 2020. SEK 53.5B, 1 SEK ≈ 0.97 NOK' },
      { year: 2021, revenueNok: 54100, operatingMargin: 4.3, groupEmployees: 12200, source: 'Axfood Årsredovisning 2021. SEK 55.8B, 1 SEK ≈ 0.97 NOK' },
      { year: 2022, revenueNok: 61700, operatingMargin: 4.3, groupEmployees: 12500, source: 'Axfood Årsredovisning 2022. SEK 63.0B, 1 SEK ≈ 0.98 NOK' },
      { year: 2023, revenueNok: 67400, operatingMargin: 4.4, groupEmployees: 13000, source: 'Axfood Årsredovisning 2023. SEK 67.4B, 1 SEK ≈ 1.00 NOK' },
      { year: 2024, revenueNok: 84100, operatingMargin: 4.5, groupEmployees: 15000, source: 'Axfood Year-End Report 2024. SEK 84.1B, 1 SEK ≈ 1.00 NOK' },
    ],
    shareholders: [
      { name: 'Axel Johnson AB', ownershipPct: 50.1, shareholderType: 'family', isControlling: true },
      { name: 'Swedbank Robur Fonder', ownershipPct: 5.2, shareholderType: 'institutional', isControlling: false },
      { name: 'Handelsbanken Fonder', ownershipPct: 3.1, shareholderType: 'institutional', isControlling: false },
    ],
    boardMembers: [
      { personName: 'Caroline Berg', role: 'styrelseordförande' },
      { personName: 'Simone Margulies', role: 'CEO' },
      { personName: 'Björn Annwall', role: 'styremedlem' },
      { personName: 'Mia Brunell Livfors', role: 'styremedlem' },
      { personName: 'Christian Luiga', role: 'styremedlem' },
      { personName: 'Ann Carlsson', role: 'styremedlem' },
      { personName: 'Erik Selin', role: 'styremedlem' },
      { personName: 'Caroline Sundewall', role: 'styremedlem' },
      { personName: 'Lars Olofsson', role: 'styremedlem' },
      { personName: 'Nicholas Högberg', role: 'CFO' },
    ],
  },
  {
    name: 'Coop Sverige AB',
    orgNr: 'SE-702001-3469',
    country: 'SE',
    legalForm: 'AB',
    founded: 2002,
    hqCity: 'Solna',
    hqAddress: 'Virkesvägen 10',
    employees: 22000,
    ownershipType: 'cooperative',
    valueChainStage: 'retail',
    financials: [
      { year: 2020, revenueNok: 37300, operatingMargin: 0.5, groupEmployees: 20000, source: 'Coop Sverige/KF Årsredovisning 2020. SEK 38.5B, 1 SEK ≈ 0.97 NOK' },
      { year: 2021, revenueNok: 38000, operatingMargin: 0.3, groupEmployees: 20500, source: 'Coop Sverige/KF Årsredovisning 2021. SEK 39.2B, 1 SEK ≈ 0.97 NOK' },
      { year: 2022, revenueNok: 40000, operatingMargin: -1.2, groupEmployees: 21000, source: 'Coop Sverige/KF Årsredovisning 2022. SEK 40.8B, 1 SEK ≈ 0.98 NOK' },
      { year: 2023, revenueNok: 42500, operatingMargin: -3.1, groupEmployees: 21500, source: 'Coop Sverige/KF Årsredovisning 2023. SEK 42.5B, 1 SEK ≈ 1.00 NOK' },
      { year: 2024, revenueNok: 48300, operatingMargin: -5.6, groupEmployees: 22000, source: 'Coop Sverige/KF Årsredovisning 2024. ~SEK 48.3B (combined coops), 1 SEK ≈ 1.00 NOK. SEK 2.7B operating loss.' },
    ],
    shareholders: [
      { name: 'Kooperativa Förbundet (KF) / 26 konsumentföreningar', ownershipPct: 100, shareholderType: 'cooperative', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Kerstin Maria Wallentin', role: 'styrelseordförande' },
      { personName: 'Pär Bernhard Ygge Sandström', role: 'styrelseledamot' },
      { personName: 'Barbro Kristina Viberg', role: 'styrelseledamot' },
      { personName: 'Maria Christina Söderbom', role: 'styrelseledamot' },
      { personName: 'Bo Ronnie Michael Wångdahl', role: 'styrelseledamot' },
      { personName: 'Stig Wilhelm Nilsson', role: 'styrelseledamot' },
      { personName: 'Jan Håkan Thorell', role: 'styrelseledamot' },
      { personName: 'Gunilla Astrid Henriette Asker', role: 'styrelseledamot' },
      { personName: 'Ingrid Maria Rudolphi', role: 'styrelseledamot' },
      { personName: 'Bo Jesper Mattias Josbrant', role: 'styrelseledamot' },
      { personName: 'Bo Henrik Skyttberg', role: 'styrelseledamot' },
      { personName: 'Anders Jonas Nygren', role: 'styrelseledamot' },
      { personName: 'Louise Anita Ring', role: 'styrelseledamot' },
      { personName: 'Karl Anders Torell', role: 'CEO' },
      { personName: 'Örjan Gösta Grandin', role: 'extern vice verkställande direktör' },
    ],
  },
  {
    name: 'Lidl Sverige KB',
    orgNr: 'SE-969697-6594',
    country: 'SE',
    legalForm: 'KB',
    founded: 2003,
    hqCity: 'Solna',
    employees: 2700,
    ownershipType: 'foreign',
    valueChainStage: 'retail',
    financials: [
      { year: 2020, revenueNok: 3800, groupEmployees: 2200, source: 'Estimat. ~SEK 3.9B, 1 SEK ≈ 0.97 NOK. Markedsandel ~4.5%' },
      { year: 2021, revenueNok: 4100, groupEmployees: 2300, source: 'Estimat. ~SEK 4.2B, 1 SEK ≈ 0.97 NOK. Markedsandel ~4.8%' },
      { year: 2022, revenueNok: 4800, groupEmployees: 2500, source: 'Estimat. ~SEK 4.9B, 1 SEK ≈ 0.98 NOK. Markedsandel ~5.2%' },
      { year: 2023, revenueNok: 5300, groupEmployees: 2600, source: 'Estimat. ~SEK 5.3B, 1 SEK ≈ 1.00 NOK. Markedsandel ~5.8%' },
      { year: 2024, revenueNok: 5900, groupEmployees: 2700, source: 'Estimat. ~SEK 5.9B (USD 555M), 1 SEK ≈ 1.00 NOK. Schwarz Group annual report.' },
    ],
    shareholders: [
      { name: 'Schwarz Group (Lidl Stiftung & Co. KG, Tyskland)', ownershipPct: 100, shareholderType: 'foreign', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Jakob Josefsson', role: 'styrelseordförande / Sverigechef' },
      { personName: 'Martin Kauffner', role: 'ekonomidirektör' },
      { personName: 'Helena Erlingsjö', role: 'HR direktör' },
      { personName: 'Robert Stekovic', role: 'kommersiell direktör' },
      { personName: 'Carl Balcer', role: 'fastighetsdirektör' },
      { personName: 'Georgios Tokatlis', role: 'försäljningsdirektör' },
    ],
  },

  // === DENMARK ===
  {
    name: 'Salling Group A/S',
    orgNr: 'DK-35954716',
    country: 'DK',
    legalForm: 'A/S',
    founded: 1906,
    hqCity: 'Brabrand',
    hqAddress: 'Rosbjergvej 33',
    employees: 60000,
    ownershipType: 'family',
    valueChainStage: 'retail',
    financials: [
      { year: 2020, revenueNok: 82400, operatingMargin: 3.2, groupEmployees: 55000, source: 'Salling Group Årsrapport 2020. DKK 58B, 1 DKK ≈ 1.42 NOK' },
      { year: 2021, revenueNok: 85700, operatingMargin: 3.3, groupEmployees: 56000, source: 'Salling Group Årsrapport 2021. DKK 60B, 1 DKK ≈ 1.43 NOK' },
      { year: 2022, revenueNok: 97700, operatingMargin: 3.4, groupEmployees: 58000, source: 'Salling Group Årsrapport 2022. DKK 66B, 1 DKK ≈ 1.48 NOK' },
      { year: 2023, revenueNok: 107800, operatingMargin: 3.6, groupEmployees: 59000, source: 'Salling Group Årsrapport 2023. DKK 70B, 1 DKK ≈ 1.54 NOK' },
      { year: 2024, revenueNok: 111900, operatingMargin: 3.7, groupEmployees: 60000, source: 'Salling Group Annual Report 2024. DKK 72.2B, 1 DKK ≈ 1.55 NOK' },
    ],
    shareholders: [
      { name: 'Købmand Herman Sallings Fond', ownershipPct: 100, shareholderType: 'family', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Nils Smedegaard Andersen', role: 'bestyrelsesformand' },
      { personName: 'Anders Hagh', role: 'CEO' },
      { personName: 'Bjørn Gulden', role: 'bestyrelsesmedlem' },
      { personName: 'Jens Bjerg Sørensen', role: 'næstformand' },
      { personName: 'Marianne Kirkegaard', role: 'bestyrelsesmedlem' },
      { personName: 'Per Bank', role: 'bestyrelsesmedlem' },
      { personName: 'Susanne Mørch Koch', role: 'bestyrelsesmedlem' },
      { personName: 'Lars Olsen', role: 'bestyrelsesmedlem' },
      { personName: 'Martin Bruun', role: 'bestyrelsesmedlem' },
    ],
  },
  {
    name: 'Coop Danmark A/S',
    orgNr: 'DK-26259495',
    country: 'DK',
    legalForm: 'A/S',
    founded: 1866,
    hqCity: 'Albertslund',
    hqAddress: 'Roskildevej 65',
    employees: 38500,
    ownershipType: 'cooperative',
    valueChainStage: 'retail',
    financials: [
      { year: 2020, revenueNok: 54000, operatingMargin: 0.8, groupEmployees: 35000, source: 'Coop Danmark Årsrapport 2020. DKK 38B, 1 DKK ≈ 1.42 NOK' },
      { year: 2021, revenueNok: 55700, operatingMargin: 0.9, groupEmployees: 36000, source: 'Coop Danmark Årsrapport 2021. DKK 39B, 1 DKK ≈ 1.43 NOK' },
      { year: 2022, revenueNok: 60700, operatingMargin: 1.0, groupEmployees: 37000, source: 'Coop Danmark Årsrapport 2022. DKK 41B, 1 DKK ≈ 1.48 NOK' },
      { year: 2023, revenueNok: 49300, operatingMargin: 1.1, groupEmployees: 38000, source: 'Coop Danmark Årsrapport 2023. DKK 32B, 1 DKK ≈ 1.54 NOK' },
      { year: 2024, revenueNok: 52100, operatingMargin: 1.2, groupEmployees: 38500, source: 'Coop Danmark Årsrapport 2024. DKK 33.6B, 1 DKK ≈ 1.55 NOK' },
    ],
    shareholders: [
      { name: 'Coop amba (2 mill. medlemmer)', ownershipPct: 100, shareholderType: 'cooperative', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Jeff Gravenhorst', role: 'bestyrelsesformand' },
      { personName: 'Thor Skov Jørgensen', role: 'CEO' },
      { personName: 'Rasmus Willig', role: 'bestyrelsesmedlem' },
      { personName: 'Morten Mosegaard', role: 'bestyrelsesmedlem' },
      { personName: 'Kræn Østergård Nielsen', role: 'bestyrelsesmedlem' },
      { personName: 'Jette Aaen', role: 'bestyrelsesmedlem' },
      { personName: 'Lars Nielsen', role: 'bestyrelsesmedlem' },
      { personName: 'Lasse Bolander', role: 'bestyrelsesmedlem' },
      { personName: 'Brian Falsig', role: 'bestyrelsesmedlem' },
    ],
  },
  {
    name: 'REMA 1000 A/S',
    orgNr: 'DK-14705627',
    country: 'DK',
    legalForm: 'A/S',
    founded: 1994,
    hqCity: 'Horsens',
    employees: 10000,
    ownershipType: 'foreign',
    valueChainStage: 'retail',
    financials: [
      { year: 2020, revenueNok: 28400, groupEmployees: 8000, source: 'Estimat. DKK 20B, 1 DKK ≈ 1.42 NOK. Markedsandel ~12%' },
      { year: 2021, revenueNok: 31500, groupEmployees: 8500, source: 'Estimat. DKK 22B, 1 DKK ≈ 1.43 NOK. Markedsandel ~13%' },
      { year: 2022, revenueNok: 35500, groupEmployees: 9000, source: 'Estimat. DKK 24B, 1 DKK ≈ 1.48 NOK. Markedsandel ~14%' },
      { year: 2023, revenueNok: 38500, groupEmployees: 9500, source: 'Estimat. DKK 25B, 1 DKK ≈ 1.54 NOK. Markedsandel ~14%' },
      { year: 2024, revenueNok: 40300, groupEmployees: 10000, source: 'Estimat basert på Reitan Retail årsrapport + markedsandel 14%. DKK ~26B, 1 DKK ≈ 1.55 NOK' },
    ],
    shareholders: [
      { name: 'Reitan Retail AS (Norge)', ownershipPct: 100, shareholderType: 'foreign', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Ole Robert Reitan', role: 'bestyrelsesformand' },
      { personName: 'Henrik Burkal', role: 'CEO' },
      { personName: 'Tom Kristiansen', role: 'næstformand' },
      { personName: 'Kristin Solheim Genton', role: 'bestyrelsesmedlem' },
      { personName: 'Monica Ødegaard', role: 'bestyrelsesmedlem' },
      { personName: 'Tania Klæbel', role: 'bestyrelsesmedlem' },
    ],
  },
  {
    name: 'Dagrofa A/S',
    orgNr: 'DK-38714295',
    country: 'DK',
    legalForm: 'A/S',
    founded: 2007,
    hqCity: 'Ringsted',
    employees: 16500,
    ownershipType: 'private',
    valueChainStage: 'retail',
    financials: [
      { year: 2020, revenueNok: 19900, operatingMargin: 0.4, groupEmployees: 14000, source: 'Dagrofa Årsrapport 2020. DKK 14B, 1 DKK ≈ 1.42 NOK' },
      { year: 2021, revenueNok: 21500, operatingMargin: 0.5, groupEmployees: 14500, source: 'Dagrofa Årsrapport 2021. DKK 15B, 1 DKK ≈ 1.43 NOK' },
      { year: 2022, revenueNok: 23700, operatingMargin: 0.5, groupEmployees: 15000, source: 'Dagrofa Årsrapport 2022. DKK 16B, 1 DKK ≈ 1.48 NOK' },
      { year: 2023, revenueNok: 26200, operatingMargin: 0.6, groupEmployees: 15800, source: 'Dagrofa Årsrapport 2023. DKK 17B, 1 DKK ≈ 1.54 NOK' },
      { year: 2024, revenueNok: 31000, operatingMargin: 0.6, groupEmployees: 16500, source: 'Dagrofa Corporate Presentation 2024. DKK ~20B, 1 DKK ≈ 1.55 NOK' },
    ],
    shareholders: [
      { name: 'NorgesGruppen ASA (Norge)', ownershipPct: 48.9, shareholderType: 'institutional', isControlling: true },
      { name: 'KFI Erhvervsdrivende Fond', ownershipPct: 42.5, shareholderType: 'foundation', isControlling: false },
      { name: 'Selvstændige købmænd', ownershipPct: 8.6, shareholderType: 'private', isControlling: false },
    ],
    boardMembers: [
      { personName: 'Jesper Lok', role: 'bestyrelsesformand' },
      { personName: 'Tore Bekken', role: 'næstformand' },
      { personName: 'Michael Christiansen', role: 'bestyrelsesmedlem' },
      { personName: 'Anne Bech Torgersen', role: 'bestyrelsesmedlem' },
      { personName: 'Marianne Rørslev Bock', role: 'bestyrelsesmedlem' },
      { personName: 'Søren Engberg', role: 'bestyrelsesmedlem' },
      { personName: 'Kennet Berlin', role: 'bestyrelsesmedlem' },
      { personName: 'Liza Østergren Jensen', role: 'bestyrelsesmedlem' },
      { personName: 'Søren Hansen', role: 'bestyrelsesmedlem' },
      { personName: 'Tomas Pietrangeli', role: 'administrerende direktør' },
      { personName: 'Thomas Thellersen Børner', role: 'økonomidirektør' },
    ],
  },

  // === FINLAND ===
  {
    name: 'SOK (S Group)',
    orgNr: 'FI-0116323-9',
    country: 'FI',
    legalForm: 'Osuuskunta',
    founded: 1904,
    hqCity: 'Helsinki',
    hqAddress: 'Fleminginkatu 34',
    employees: 42000,
    ownershipType: 'cooperative',
    valueChainStage: 'retail',
    financials: [
      { year: 2020, revenueNok: 131000, operatingMargin: 3.0, groupEmployees: 40000, source: 'SOK tilinpäätös 2020. EUR 12.3B, 1 EUR ≈ 10.7 NOK' },
      { year: 2021, revenueNok: 133600, operatingMargin: 3.1, groupEmployees: 40500, source: 'SOK tilinpäätös 2021. EUR 13.1B, 1 EUR ≈ 10.2 NOK' },
      { year: 2022, revenueNok: 138400, operatingMargin: 3.2, groupEmployees: 41000, source: 'SOK tilinpäätös 2022. EUR 13.7B, 1 EUR ≈ 10.1 NOK' },
      { year: 2023, revenueNok: 162500, operatingMargin: 3.4, groupEmployees: 41500, source: 'SOK tilinpäätös 2023. EUR 14.3B, 1 EUR ≈ 11.4 NOK' },
      { year: 2024, revenueNok: 164450, operatingMargin: 3.5, groupEmployees: 42000, source: 'SOK Financial Statements Bulletin 2024. EUR 14.3B (retail sales), 1 EUR ≈ 11.5 NOK' },
    ],
    shareholders: [
      { name: 'Osuuskaupat (2,7 mill. medlemmer)', ownershipPct: 100, shareholderType: 'cooperative', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Hannu Krook', role: 'CEO / Chair of SOK Executive Board' },
      { personName: 'Harri Miettinen', role: 'Vice Chair of SOK Executive Board' },
      { personName: 'Kim Biskop', role: 'SOK Executive Board member' },
      { personName: 'Nermin Hairedin', role: 'SOK Executive Board member' },
      { personName: 'Katri Harra-Salonen', role: 'SOK Executive Board member' },
      { personName: 'Antti Heikkinen', role: 'SOK Executive Board member' },
      { personName: 'Veli-Matti Liimatainen', role: 'SOK Executive Board member' },
      { personName: 'Antti Määttä', role: 'SOK Executive Board member' },
      { personName: 'Juha Riikola', role: 'SOK Executive Board member' },
    ],
  },
  {
    name: 'Kesko Oyj',
    orgNr: 'FI-0110456-8',
    country: 'FI',
    legalForm: 'Oyj',
    founded: 1940,
    hqCity: 'Helsinki',
    hqAddress: 'Satamakatu 3',
    employees: 18300,
    ownershipType: 'listed',
    valueChainStage: 'retail',
    financials: [
      { year: 2020, revenueNok: 114500, operatingMargin: 4.8, groupEmployees: 39000, source: 'Kesko vuosikertomus 2020. EUR 10.7B, 1 EUR ≈ 10.7 NOK' },
      { year: 2021, revenueNok: 115300, operatingMargin: 5.0, groupEmployees: 39500, source: 'Kesko vuosikertomus 2021. EUR 11.3B, 1 EUR ≈ 10.2 NOK' },
      { year: 2022, revenueNok: 122200, operatingMargin: 5.2, groupEmployees: 18000, source: 'Kesko vuosikertomus 2022. EUR 12.1B, 1 EUR ≈ 10.1 NOK' },
      { year: 2023, revenueNok: 130000, operatingMargin: 5.4, groupEmployees: 18200, source: 'Kesko vuosikertomus 2023. EUR 11.4B, 1 EUR ≈ 11.4 NOK' },
      { year: 2024, revenueNok: 137080, operatingMargin: 5.5, groupEmployees: 18300, source: 'Kesko Annual Report 2024. EUR 11.92B, 1 EUR ≈ 11.5 NOK' },
    ],
    shareholders: [
      { name: 'K-kauppiasliitto ry (K-Retailers\' Association)', ownershipPct: 7.5, shareholderType: 'institutional', isControlling: true },
      { name: 'Ilmarinen Mutual Pension Insurance', ownershipPct: 3.8, shareholderType: 'institutional', isControlling: false },
      { name: 'Varma Mutual Pension Insurance', ownershipPct: 2.5, shareholderType: 'institutional', isControlling: false },
    ],
    boardMembers: [
      { personName: 'Esa Kiiskinen', role: 'hallituksen puheenjohtaja' },
      { personName: 'Jorma Rauhala', role: 'CEO' },
      { personName: 'Timo Ritakallio', role: 'varapuheenjohtaja' },
      { personName: 'Jannica Fagerholm', role: 'hallituksen jäsen' },
      { personName: 'Piia Karhu', role: 'hallituksen jäsen' },
      { personName: 'Anu Nissinen', role: 'hallituksen jäsen' },
      { personName: 'Pirkko Juntti', role: 'hallituksen jäsen' },
      { personName: 'Tomi Korpisaari', role: 'hallituksen jäsen' },
      { personName: 'Peter Fagernäs', role: 'hallituksen jäsen' },
      { personName: 'Matti Niinikoski', role: 'hallituksen jäsen' },
    ],
  },
  {
    name: 'Lidl Suomi Ky',
    orgNr: 'FI-1615492-7',
    country: 'FI',
    legalForm: 'Ky',
    founded: 2002,
    hqCity: 'Vantaa',
    employees: 5600,
    ownershipType: 'foreign',
    valueChainStage: 'retail',
    financials: [
      { year: 2020, revenueNok: 17100, groupEmployees: 4800, source: 'Estimat. EUR ~1.6B, 1 EUR ≈ 10.7 NOK. Markedsandel ~8%' },
      { year: 2021, revenueNok: 17300, groupEmployees: 5000, source: 'Estimat. EUR ~1.7B, 1 EUR ≈ 10.2 NOK. Markedsandel ~8.5%' },
      { year: 2022, revenueNok: 19200, groupEmployees: 5200, source: 'Estimat. EUR ~1.9B, 1 EUR ≈ 10.1 NOK. Markedsandel ~9%' },
      { year: 2023, revenueNok: 21700, groupEmployees: 5400, source: 'Estimat. EUR ~1.9B, 1 EUR ≈ 11.4 NOK. Markedsandel ~9.2%' },
      { year: 2024, revenueNok: 22900, groupEmployees: 5600, source: 'Estimat. EUR ~1.99B, 1 EUR ≈ 11.5 NOK. Statista/Lidl Finland.' },
    ],
    shareholders: [
      { name: 'Schwarz Group (Lidl Stiftung & Co. KG, Tyskland)', ownershipPct: 100, shareholderType: 'foreign', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Conor Boyle', role: 'toimitusjohtaja' },
      { personName: 'Jochen Fries', role: 'kaupallinen johtaja' },
      { personName: 'Heli Hassinen-Biberger', role: 'henkilöstöjohtaja' },
      { personName: 'Meri Aalto', role: 'markkinointi- ja asiakkuusjohtaja' },
      { personName: 'Antonio Maselli', role: 'operatiivinen johtaja' },
      { personName: 'Sami Pyykönen', role: 'CFO' },
    ],
  },

  // === ICELAND ===
  {
    name: 'Hagar hf',
    orgNr: 'IS-670203-2120',
    country: 'IS',
    legalForm: 'hf',
    founded: 1999,
    hqCity: 'Reykjavik',
    employees: 3500,
    ownershipType: 'listed',
    valueChainStage: 'retail',
    financials: [
      { year: 2020, revenueNok: 6200, groupEmployees: 3000, source: 'Hagar hf Ársreikningur 2020. ISK ~88B, 1 ISK ≈ 0.070 NOK' },
      { year: 2021, revenueNok: 6600, groupEmployees: 3100, source: 'Hagar hf Ársreikningur 2021. ISK ~92B, 1 ISK ≈ 0.072 NOK' },
      { year: 2022, revenueNok: 7700, groupEmployees: 3200, source: 'Hagar hf Ársreikningur 2022. ISK ~105B, 1 ISK ≈ 0.073 NOK' },
      { year: 2023, revenueNok: 8900, groupEmployees: 3300, source: 'Hagar hf Ársreikningur 2023. ISK ~115B, 1 ISK ≈ 0.077 NOK' },
      { year: 2024, revenueNok: 14150, groupEmployees: 3500, source: 'Hagar hf Annual Report 2024. EUR ~1.23B, 1 EUR ≈ 11.5 NOK' },
    ],
    shareholders: [
      { name: 'Fjarfesting hf', ownershipPct: 29.9, shareholderType: 'institutional', isControlling: true },
      { name: 'Lífeyrissjóður verzlunarmanna', ownershipPct: 12, shareholderType: 'institutional', isControlling: false },
    ],
    boardMembers: [
      { personName: 'Finnur Oddsson', role: 'stjórnarformaður' },
      { personName: 'Sigurdur Helgason', role: 'forstjóri' },
      { personName: 'Gudbjörg Edda Eggertsdottir', role: 'stjórnarmaður' },
      { personName: 'Halldor Kristjansson', role: 'stjórnarmaður' },
      { personName: 'Bergros Olafsdottir', role: 'stjórnarmaður' },
      { personName: 'Jon Thorvardur Heidarsson', role: 'stjórnarmaður' },
    ],
  },
  {
    name: 'Samkaup hf',
    orgNr: 'IS-571298-3769',
    country: 'IS',
    legalForm: 'hf',
    founded: 1907,
    hqCity: 'Akureyri',
    employees: 2000,
    ownershipType: 'cooperative',
    valueChainStage: 'retail',
    financials: [
      { year: 2020, revenueNok: 2800, groupEmployees: 1600, source: 'Estimat. ISK ~40B, 1 ISK ≈ 0.070 NOK. Markedsandel ~28%' },
      { year: 2021, revenueNok: 3000, groupEmployees: 1700, source: 'Estimat. ISK ~42B, 1 ISK ≈ 0.072 NOK' },
      { year: 2022, revenueNok: 3500, groupEmployees: 1800, source: 'Estimat. ISK ~48B, 1 ISK ≈ 0.073 NOK' },
      { year: 2023, revenueNok: 3200, groupEmployees: 1900, source: 'Estimat. ISK ~42B, 1 ISK ≈ 0.077 NOK' },
      { year: 2024, revenueNok: 3400, groupEmployees: 2000, source: 'Estimat basert på markedsandel ~30%. ISK ~42.5B, 1 ISK ≈ 0.08 NOK' },
    ],
    shareholders: [
      { name: 'Drangar hf (SKEL fjárfestingafélag / Orkan)', ownershipPct: 100, shareholderType: 'institutional', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Jón Ásgeir Jóhannesson', role: 'stjórnarformaður' },
      { personName: 'Magnús Ingi Einarsson', role: 'stjórnarmaður' },
      { personName: 'Liv Bergþórsdóttir', role: 'stjórnarmaður' },
      { personName: 'Garðar Newman', role: 'stjórnarmaður' },
      { personName: 'Margrét Katrín Guðnadóttir', role: 'stjórnarmaður' },
    ],
  },
  {
    name: 'Festi hf',
    orgNr: 'IS-540206-2010',
    country: 'IS',
    legalForm: 'hf',
    founded: 1998,
    hqCity: 'Reykjavik',
    employees: 2500,
    ownershipType: 'listed',
    valueChainStage: 'retail',
    financials: [
      { year: 2020, revenueNok: 3500, groupEmployees: 1600, source: 'Estimat. ISK ~50B, 1 ISK ≈ 0.070 NOK' },
      { year: 2021, revenueNok: 3800, groupEmployees: 1700, source: 'Estimat. ISK ~53B, 1 ISK ≈ 0.072 NOK' },
      { year: 2022, revenueNok: 4300, groupEmployees: 1900, source: 'Estimat. ISK ~59B, 1 ISK ≈ 0.073 NOK' },
      { year: 2023, revenueNok: 5000, groupEmployees: 2200, source: 'Estimat. ISK ~65B, 1 ISK ≈ 0.077 NOK' },
      { year: 2024, revenueNok: 4800, groupEmployees: 2500, source: 'Estimat. ISK ~60B (inkl. Lyfja fra juli 2024), 1 ISK ≈ 0.08 NOK. Festi Q4 2024.' },
    ],
    shareholders: [
      { name: 'Lífeyrissjóður starfsmanna ríkisins', ownershipPct: 12.9, shareholderType: 'institutional', isControlling: false },
      { name: 'Lífeyrissjóður verzlunarmanna', ownershipPct: 12.5, shareholderType: 'institutional', isControlling: false },
    ],
    boardMembers: [
      { personName: 'Guðjón Karl Reynisson', role: 'stjórnarformaður' },
      { personName: 'Sigurlína Ingvarsdóttir', role: 'varaformaður stjórnar' },
      { personName: 'Guðjón Auðunsson', role: 'stjórnarmaður' },
      { personName: 'Hjörleifur Pálsson', role: 'stjórnarmaður' },
      { personName: 'Margrét Guðmundsdóttir', role: 'stjórnarmaður' },
      { personName: 'Ásta S. Fjeldsted', role: 'forstjóri' },
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

function shareholderProvenanceData(locator: string | null, verifiedAt: Date) {
  if (!locator) return {}

  if (locator.startsWith('document:')) {
    return { source: locator, verifiedAt }
  }

  return {
    source: 'Aksjonærdata: årsrapport 2024',
    sourceUrl: locator,
    verifiedAt,
  }
}

async function main() {
  console.log('Importing company data...\n')

  const documents = await prisma.document.findMany({
    select: { id: true, slug: true },
  })
  const documentRefs = new Set(
    documents.flatMap((document) => [document.id, document.slug].filter(Boolean) as string[]),
  )
  const importedAt = new Date()

  for (const c of [...companies, ...nordicCompanies]) {
    const company = await prisma.company.upsert({
      where: { orgNr: c.orgNr },
      update: {
        name: c.name,
        country: c.country ?? 'NO',
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
        country: c.country ?? 'NO',
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
        const sourceLocator = resolveShareholderSourceLocator(
          {
            name: s.name,
            ownershipPct: s.ownershipPct,
            company: { orgNr: c.orgNr },
          },
          documentRefs,
        )

        await prisma.shareholder.create({
          data: {
            companyId: company.id,
            name: s.name,
            ownershipPct: s.ownershipPct,
            shareholderType: s.shareholderType,
            isControlling: s.isControlling ?? false,
            ...shareholderProvenanceData(sourceLocator, importedAt),
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
            source: s.source,
          },
        })
      }
    }

    if (c.properties) {
      await prisma.companyProperty.deleteMany({ where: { companyId: company.id } })
      for (const p of c.properties) {
        let tenantCompanyId: string | undefined
        if (p.tenantOrgNr) {
          const tenant = await prisma.company.findUnique({
            where: { orgNr: p.tenantOrgNr },
            select: { id: true },
          })
          tenantCompanyId = tenant?.id
        }

        await prisma.companyProperty.create({
          data: {
            companyId: company.id,
            propertyType: p.propertyType,
            address: p.address,
            municipality: p.municipality,
            county: p.county,
            country: p.country ?? 'NO',
            lat: p.lat,
            lng: p.lng,
            sqMeters: p.sqMeters,
            acquiredYear: p.acquiredYear,
            selfLeased: p.selfLeased ?? false,
            tenantCompanyId,
            source: p.source,
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

  const propertyCount = await prisma.companyProperty.count()
  const totalCompanies = companies.length + nordicCompanies.length
  console.log(`\n${totalCompanies} companies imported (${companies.length} NO + ${nordicCompanies.length} Nordic) with financials, shareholders, and board members`)
  console.log(`${propertyCount} properties mapped`)
}

main()
  .catch((e) => {
    console.error('Import failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
