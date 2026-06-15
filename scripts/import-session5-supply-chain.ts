import 'dotenv/config'
import { canonicalPersonKey as normalizePersonKey } from '../src/lib/person-key'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

type PropertyData = {
  companyOrgNr: string
  propertyType: string
  address?: string
  municipality?: string
  county?: string
  country?: string
  lat?: number
  lng?: number
  sqMeters?: number
  selfLeased?: boolean
  tenantOrgNr?: string
  source?: string
}

type NewCompany = {
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
  shareholders?: { name: string; ownershipPct?: number; shareholderType?: string; isControlling?: boolean }[]
  boardMembers?: { personName: string; role: string }[]
}

type OwnershipRecord = {
  parentOrgNr: string
  childOrgNr: string
  ownershipPct?: number
  ownershipType: 'subsidiary' | 'joint-venture' | 'minority-stake'
  source: string
}

type RelationshipRecord = {
  fromOrgNr: string
  toOrgNr: string
  relationshipType: 'supplier' | 'buyer' | 'distributor' | 'franchisor' | 'self-dealing' | 'joint-venture'
  description?: string
  sector?: string
  source?: string
}

// ─── New Companies ──────────────────────────────────────────────────

const newCompanies: NewCompany[] = [
  {
    name: 'REMA Distribusjon Norge AS',
    orgNr: '894759372',
    legalForm: 'AS',
    founded: 2005,
    naceCode: '46.390',
    naceDescription: 'Engroshandel næringsmidler, bredt utvalg',
    hqCity: 'Vinterbro',
    employees: 2500,
    ownershipType: 'family',
    valueChainStage: 'logistics',
    shareholders: [
      { name: 'Reitan Retail AS', ownershipPct: 100, shareholderType: 'institutional', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Lars Kristian Lindberg', role: 'styreleder' },
      { personName: 'Trond Bentestuen', role: 'CEO' },
      { personName: 'Ole Robert Reitan', role: 'styremedlem' },
      { personName: 'Magnus Reitan', role: 'styremedlem' },
    ],
  },
  {
    name: 'Norsk Kylling AS',
    orgNr: '980411133',
    legalForm: 'AS',
    founded: 1991,
    naceCode: '10.120',
    naceDescription: 'Bearbeiding og konservering av fjørfekjøtt',
    hqCity: 'Orkanger',
    employees: 500,
    ownershipType: 'family',
    valueChainStage: 'processing',
    shareholders: [
      { name: 'REMA 1000 Norge AS (Reitan)', ownershipPct: 100, shareholderType: 'institutional', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Eirik Strøm', role: 'styreleder' },
      { personName: 'Kjell Stokbakken', role: 'CEO' },
      { personName: 'Tone Skaare', role: 'styremedlem' },
    ],
  },
  {
    name: 'Gartnerhallen SA',
    orgNr: '945958405',
    legalForm: 'SA',
    founded: 1930,
    naceCode: '01.130',
    naceDescription: 'Dyrking av grønnsaker, meloner, rot- og knollvekster',
    hqCity: 'Oslo',
    employees: 30,
    ownershipType: 'cooperative',
    valueChainStage: 'inputs',
    shareholders: [
      { name: 'Over 1000 norske grøntprodusenter', ownershipPct: 100, shareholderType: 'cooperative', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Hans Edvard Torp', role: 'styreleder' },
      { personName: 'Tonje Østvang', role: 'styremedlem' },
      { personName: 'Svein Olav Thomassen', role: 'styremedlem' },
    ],
  },
  {
    name: 'Norges Sjømatråd AS',
    orgNr: '988597627',
    legalForm: 'AS',
    founded: 2005,
    naceCode: '73.300',
    naceDescription: 'PR og kommunikasjonstjenester',
    hqCity: 'Tromsø',
    employees: 73,
    ownershipType: 'state',
    valueChainStage: 'export-promotion',
    shareholders: [
      { name: 'Den norske stat v/Nærings- og fiskeridepartementet', ownershipPct: 100, shareholderType: 'state', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Inger-Marie Sperre', role: 'styreleder' },
      { personName: 'Christian Chramer', role: 'CEO' },
      { personName: 'Svein Ove Haugland', role: 'styremedlem' },
      { personName: 'Siri Pettersen Strandenes', role: 'styremedlem' },
    ],
  },
  {
    name: 'Lantmännen Cerealia AS',
    orgNr: '910629085',
    legalForm: 'AS',
    founded: 1912,
    naceCode: '10.610',
    naceDescription: 'Produksjon av kornvarer',
    hqAddress: 'Sandakerveien 62',
    hqCity: 'Oslo',
    employees: 164,
    ownershipType: 'foreign',
    valueChainStage: 'processing',
    shareholders: [
      { name: 'Lantmännen ek för', ownershipPct: 100, shareholderType: 'cooperative', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Per Olof Nyman', role: 'styreleder' },
      { personName: 'Henrik Collin', role: 'styremedlem' },
      { personName: 'Anders Holm', role: 'styremedlem' },
    ],
  },
  {
    name: 'Cermaq Norway AS',
    orgNr: '961922976',
    legalForm: 'AS',
    founded: 1995,
    naceCode: '03.211',
    naceDescription: 'Produksjon av matfisk — laks og ørret',
    hqCity: 'Nordfold',
    employees: 110,
    ownershipType: 'foreign',
    valueChainStage: 'seafood',
    shareholders: [
      { name: 'Cermaq Group AS (Mitsubishi Corp.)', ownershipPct: 100, shareholderType: 'foreign', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Geir Molvik', role: 'styreleder' },
      { personName: 'Steven Rafferty', role: 'CEO' },
      { personName: 'Knut Ellekjær', role: 'styremedlem' },
    ],
  },
  {
    name: 'BioMar AS',
    orgNr: '937843860',
    legalForm: 'AS',
    founded: 1986,
    naceCode: '10.912',
    naceDescription: 'Produksjon av fôr til akvakultur',
    hqCity: 'Trondheim',
    employees: 277,
    ownershipType: 'foreign',
    valueChainStage: 'inputs',
    shareholders: [
      { name: 'BioMar Group A/S (Schouw & Co., Danmark)', ownershipPct: 100, shareholderType: 'foreign', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Carlos Diaz', role: 'styreleder' },
      { personName: 'Henrik Aarestrup', role: 'CEO' },
      { personName: 'Paddy Campbell', role: 'styremedlem' },
    ],
  },
  {
    name: 'Grilstad AS',
    orgNr: '937070632',
    legalForm: 'AS',
    founded: 1960,
    naceCode: '10.130',
    naceDescription: 'Produksjon av kjøtt- og fjørfevarer',
    hqCity: 'Trondheim',
    employees: 450,
    ownershipType: 'family',
    valueChainStage: 'processing',
    shareholders: [
      { name: 'Grilstad Holding AS', ownershipPct: 100, shareholderType: 'holding', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Anders Grilstad', role: 'styreleder' },
      { personName: 'Jørgen Wiig', role: 'CEO' },
      { personName: 'Anne Marit Panengstuen', role: 'styremedlem' },
    ],
  },
]

// ─── Properties for existing + new companies ────────────────────────

const properties: PropertyData[] = [
  // ASKO warehouses (self-leased to NorgesGruppen)
  { companyOrgNr: '929228723', propertyType: 'warehouse', address: 'Deliveien 33', municipality: 'Vestby', county: 'Akershus', lat: 59.601, lng: 10.743, sqMeters: 80000, selfLeased: true, tenantOrgNr: '819731322', source: 'asko.no (Sentrallager)' },
  { companyOrgNr: '929228723', propertyType: 'warehouse', municipality: 'Vestby', county: 'Akershus', lat: 59.60, lng: 10.74, selfLeased: true, tenantOrgNr: '819731322', source: 'asko.no (ASKO Øst)' },
  { companyOrgNr: '929228723', propertyType: 'warehouse', address: 'Østre Rosten 104', municipality: 'Trondheim', county: 'Trøndelag', lat: 63.378, lng: 10.363, selfLeased: true, tenantOrgNr: '819731322', source: 'asko.no (ASKO Midt-Norge)' },
  { companyOrgNr: '929228723', propertyType: 'warehouse', municipality: 'Tromsø', county: 'Troms', lat: 69.599, lng: 19.120, selfLeased: true, tenantOrgNr: '819731322', source: 'asko.no (ASKO Nord)' },
  { companyOrgNr: '929228723', propertyType: 'warehouse', municipality: 'Bergen', county: 'Vestland', lat: 60.30, lng: 5.28, selfLeased: true, tenantOrgNr: '819731322', source: 'asko.no (ASKO Vest)' },
  { companyOrgNr: '929228723', propertyType: 'warehouse', municipality: 'Sandnes', county: 'Rogaland', lat: 58.85, lng: 5.73, selfLeased: true, tenantOrgNr: '819731322', source: 'asko.no (ASKO Rogaland)' },
  { companyOrgNr: '929228723', propertyType: 'warehouse', municipality: 'Lillesand', county: 'Agder', lat: 58.25, lng: 8.38, selfLeased: true, tenantOrgNr: '819731322', source: 'asko.no (ASKO Sør)' },
  { companyOrgNr: '929228723', propertyType: 'warehouse', municipality: 'Drammen', county: 'Buskerud', lat: 59.74, lng: 10.20, selfLeased: true, tenantOrgNr: '819731322', source: 'asko.no (ASKO Drammen)' },
  { companyOrgNr: '929228723', propertyType: 'warehouse', address: 'Skansvegen 5', municipality: 'Ringsaker', county: 'Innlandet', lat: 60.79, lng: 11.07, selfLeased: true, tenantOrgNr: '819731322', source: 'asko.no (ASKO Hedmark)' },
  { companyOrgNr: '929228723', propertyType: 'warehouse', address: 'Hanekleiva 76', municipality: 'Holmestrand', county: 'Vestfold', lat: 59.49, lng: 10.08, selfLeased: true, tenantOrgNr: '819731322', source: 'asko.no (ASKO Oslofjord)' },
  { companyOrgNr: '929228723', propertyType: 'warehouse', municipality: 'Ålesund', county: 'Møre og Romsdal', lat: 62.47, lng: 6.15, selfLeased: true, tenantOrgNr: '819731322', source: 'asko.no (ASKO Nordvest)' },
  { companyOrgNr: '929228723', propertyType: 'warehouse', municipality: 'Molde', county: 'Møre og Romsdal', lat: 62.74, lng: 7.16, selfLeased: true, tenantOrgNr: '819731322', source: 'asko.no (ASKO Molde)' },
  { companyOrgNr: '929228723', propertyType: 'warehouse', municipality: 'Narvik', county: 'Nordland', lat: 68.44, lng: 17.43, selfLeased: true, tenantOrgNr: '819731322', source: 'asko.no (ASKO Helgeland)' },

  // REMA Distribusjon warehouses
  { companyOrgNr: '894759372', propertyType: 'warehouse', municipality: 'Ås', county: 'Akershus', lat: 59.72, lng: 10.79, source: 'proff.no (Distribunal Østlandet, Vinterbro)' },
  { companyOrgNr: '894759372', propertyType: 'warehouse', municipality: 'Bergen', county: 'Vestland', lat: 60.45, lng: 5.36, source: 'proff.no (Distribunal Bergen, Hylkje)' },
  { companyOrgNr: '894759372', propertyType: 'warehouse', municipality: 'Sandnes', county: 'Rogaland', lat: 58.85, lng: 5.73, source: 'proff.no (Distribunal Stavanger)' },
  { companyOrgNr: '894759372', propertyType: 'warehouse', municipality: 'Trondheim', county: 'Trøndelag', lat: 63.36, lng: 10.40, source: 'proff.no (Distribunal Trondheim, Tiller)' },
  { companyOrgNr: '894759372', propertyType: 'warehouse', municipality: 'Tromsø', county: 'Troms', lat: 69.65, lng: 18.96, source: 'proff.no (Distribunal Tromsø)' },

  // Coop logistics centers
  { companyOrgNr: '936560288', propertyType: 'warehouse', address: 'Vilbergvegen 130', municipality: 'Ullensaker', county: 'Akershus', lat: 60.21, lng: 11.13, sqMeters: 52000, source: 'Brønnøysund underenheter' },
  { companyOrgNr: '936560288', propertyType: 'warehouse', address: 'Lønningsflaten 22', municipality: 'Bergen', county: 'Vestland', lat: 60.38, lng: 5.33, source: 'Brønnøysund underenheter' },
  { companyOrgNr: '936560288', propertyType: 'warehouse', address: 'Djupmyra 27A', municipality: 'Trondheim', county: 'Trøndelag', lat: 63.35, lng: 10.35, source: 'Brønnøysund underenheter' },
  { companyOrgNr: '936560288', propertyType: 'warehouse', address: 'Nesflåtveien 4', municipality: 'Stavanger', county: 'Rogaland', lat: 58.96, lng: 5.72, source: 'Brønnøysund underenheter' },
  { companyOrgNr: '936560288', propertyType: 'warehouse', address: 'Ringvegen 770', municipality: 'Tromsø', county: 'Troms', lat: 69.65, lng: 18.95, source: 'Brønnøysund underenheter' },

  // Nortura slaughterhouses/processing
  { companyOrgNr: '938752648', propertyType: 'production', address: 'Leinskogen 14', municipality: 'Ringsaker', county: 'Innlandet', lat: 60.92, lng: 10.66, source: 'Brønnøysund underenheter' },
  { companyOrgNr: '938752648', propertyType: 'production', address: 'Gamle Forusveien 50', municipality: 'Stavanger', county: 'Rogaland', lat: 58.84, lng: 5.73, source: 'Brønnøysund underenheter' },
  { companyOrgNr: '938752648', propertyType: 'production', address: 'Stavsjøvegen 14', municipality: 'Malvik', county: 'Trøndelag', lat: 63.44, lng: 10.69, source: 'Brønnøysund underenheter' },
  { companyOrgNr: '938752648', propertyType: 'production', address: 'Sloraveien 60', municipality: 'Indre Østfold', county: 'Østfold', lat: 59.58, lng: 11.38, source: 'Brønnøysund underenheter' },
  { companyOrgNr: '938752648', propertyType: 'production', address: 'Åskollen 3', municipality: 'Tønsberg', county: 'Vestfold', lat: 59.27, lng: 10.41, source: 'Brønnøysund underenheter' },
  { companyOrgNr: '938752648', propertyType: 'production', address: 'Industrigata 13', municipality: 'Elverum', county: 'Innlandet', lat: 60.88, lng: 11.56, source: 'Brønnøysund underenheter' },
  { companyOrgNr: '938752648', propertyType: 'production', address: 'Kautokeinoveien 6', municipality: 'Karasjok', county: 'Finnmark', lat: 69.47, lng: 25.51, source: 'Brønnøysund underenheter' },
  { companyOrgNr: '938752648', propertyType: 'production', address: 'Andslimoen', municipality: 'Målselv', county: 'Troms', lat: 68.99, lng: 18.38, source: 'Brønnøysund underenheter' },

  // TINE dairies
  { companyOrgNr: '947942638', propertyType: 'production', address: 'Bedriftsveien 7', municipality: 'Oslo', county: 'Oslo', lat: 59.93, lng: 10.77, source: 'Brønnøysund underenheter' },
  { companyOrgNr: '947942638', propertyType: 'production', address: 'Espehaugen 18', municipality: 'Bergen', county: 'Vestland', lat: 60.39, lng: 5.33, source: 'Brønnøysund underenheter' },
  { companyOrgNr: '947942638', propertyType: 'production', address: 'Bromstadvegen 68', municipality: 'Trondheim', county: 'Trøndelag', lat: 63.43, lng: 10.40, source: 'Brønnøysund underenheter' },
  { companyOrgNr: '947942638', propertyType: 'production', address: 'Strandsagvegen 1', municipality: 'Ringsaker', county: 'Innlandet', lat: 60.87, lng: 10.91, source: 'Brønnøysund underenheter' },
  { companyOrgNr: '947942638', propertyType: 'production', address: 'Musdalsvegen 34', municipality: 'Øyer', county: 'Innlandet', lat: 61.24, lng: 10.39, source: 'Brønnøysund underenheter' },
  { companyOrgNr: '947942638', propertyType: 'production', address: 'Alstenveien 51', municipality: 'Alstahaug', county: 'Nordland', lat: 65.86, lng: 12.38, source: 'Brønnøysund underenheter' },
  { companyOrgNr: '947942638', propertyType: 'production', address: 'Grenveien 9', municipality: 'Tana', county: 'Finnmark', lat: 70.01, lng: 27.00, source: 'Brønnøysund underenheter' },

  // Felleskjøpet feed mills
  { companyOrgNr: '911608103', propertyType: 'production', address: 'Møllebakken 50', municipality: 'Moss', county: 'Østfold', lat: 59.44, lng: 10.70, source: 'felleskjopet.no (Kambo fôrfabrikk)' },
  { companyOrgNr: '911608103', propertyType: 'production', municipality: 'Vaksdal', county: 'Vestland', lat: 60.48, lng: 5.76, source: 'felleskjopet.no (Vaksdal fôrfabrikk)' },
  { companyOrgNr: '911608103', propertyType: 'production', address: 'Hamnegata 29', municipality: 'Steinkjer', county: 'Trøndelag', lat: 64.01, lng: 11.50, source: 'felleskjopet.no (Steinkjer fôrfabrikk)' },

  // BAMA terminals
  { companyOrgNr: '914224314', propertyType: 'logistics', address: 'Terminalen 18', municipality: 'Lier', county: 'Buskerud', lat: 59.77, lng: 10.24, source: 'bama.no (Liertoppen hovedterminal)' },
  { companyOrgNr: '914224314', propertyType: 'logistics', municipality: 'Bergen', county: 'Vestland', lat: 60.39, lng: 5.33, source: 'bama.no (Regionterminal Bergen)' },
  { companyOrgNr: '914224314', propertyType: 'logistics', municipality: 'Trondheim', county: 'Trøndelag', lat: 63.43, lng: 10.40, source: 'bama.no (Regionterminal Trondheim)' },

  // Mowi processing plants
  { companyOrgNr: '964118191', propertyType: 'production', municipality: 'Herøy', county: 'Møre og Romsdal', lat: 62.33, lng: 5.63, source: 'mowi.com (Eggesbønes)' },
  { companyOrgNr: '964118191', propertyType: 'production', municipality: 'Hitra', county: 'Trøndelag', lat: 63.58, lng: 8.82, source: 'mowi.com (Ulvan)' },
  { companyOrgNr: '964118191', propertyType: 'production', municipality: 'Haugesund', county: 'Rogaland', lat: 59.41, lng: 5.27, source: 'mowi.com (Ryfisk)' },
  { companyOrgNr: '964118191', propertyType: 'office', municipality: 'Bergen', county: 'Vestland', lat: 60.39, lng: 5.33, source: 'mowi.com (Hovedkontor Bergen)' },

  // SalMar processing
  { companyOrgNr: '960514718', propertyType: 'production', municipality: 'Frøya', county: 'Trøndelag', lat: 63.73, lng: 8.66, sqMeters: 23000, source: 'salmar.no (InnovaMar)' },
  { companyOrgNr: '960514718', propertyType: 'production', municipality: 'Smøla', county: 'Møre og Romsdal', lat: 63.37, lng: 7.98, source: 'salmar.no (Vikenco)' },

  // Lerøy processing
  { companyOrgNr: '975350940', propertyType: 'production', municipality: 'Bergen', county: 'Vestland', lat: 60.39, lng: 5.33, source: 'leroy.no (Bergen prosessering)' },
  { companyOrgNr: '975350940', propertyType: 'production', municipality: 'Stord', county: 'Vestland', lat: 59.79, lng: 5.49, source: 'leroy.no (Stord prosessering)' },

  // Norsk Kylling
  { companyOrgNr: '980411133', propertyType: 'production', municipality: 'Orkland', county: 'Trøndelag', lat: 63.31, lng: 9.85, source: 'proff.no (Orkanger)' },
  { companyOrgNr: '980411133', propertyType: 'production', municipality: 'Midtre Gauldal', county: 'Trøndelag', lat: 63.04, lng: 10.28, source: 'proff.no (Støren)' },

  // BioMar feed factories
  { companyOrgNr: '937843860', propertyType: 'production', municipality: 'Karmøy', county: 'Rogaland', lat: 59.28, lng: 5.31, source: 'BioMar.com (Avaldsnes fôrfabrikk)' },
  { companyOrgNr: '937843860', propertyType: 'production', municipality: 'Øksnes', county: 'Nordland', lat: 68.80, lng: 15.14, source: 'BioMar.com (Myre fôrfabrikk)' },

  // Grilstad production
  { companyOrgNr: '937070632', propertyType: 'production', municipality: 'Trondheim', county: 'Trøndelag', lat: 63.44, lng: 10.52, source: 'grilstad.no (Ranheim)' },
  { companyOrgNr: '937070632', propertyType: 'production', municipality: 'Stranda', county: 'Møre og Romsdal', lat: 62.31, lng: 6.95, source: 'grilstad.no (Stranda)' },
  { companyOrgNr: '937070632', propertyType: 'production', municipality: 'Stavanger', county: 'Rogaland', lat: 58.97, lng: 5.73, source: 'grilstad.no (Stavanger)' },
  { companyOrgNr: '937070632', propertyType: 'production', municipality: 'Ringsaker', county: 'Innlandet', lat: 60.77, lng: 10.81, source: 'grilstad.no (Brumunddal)' },

  // Lantmännen Cerealia
  { companyOrgNr: '910629085', propertyType: 'production', municipality: 'Oslo', county: 'Oslo', lat: 59.95, lng: 10.77, source: 'proff.no (Oslo kverneri)' },
  { companyOrgNr: '910629085', propertyType: 'production', municipality: 'Moss', county: 'Østfold', lat: 59.44, lng: 10.66, source: 'proff.no (Moss fabrikk)' },

  // ═══ Nordic company headquarters ═══

  // Sweden
  { companyOrgNr: 'SE-556048-2837', propertyType: 'office', address: 'Kolonnvägen 20', municipality: 'Solna', county: 'Stockholm', country: 'SE', source: 'icagruppen.se (Huvudkontor)' },
  { companyOrgNr: 'SE-556542-5353', propertyType: 'office', address: 'Solnavägen 4', municipality: 'Stockholm', county: 'Stockholm', country: 'SE', source: 'axfood.se (Huvudkontor)' },
  { companyOrgNr: 'SE-702001-3469', propertyType: 'office', municipality: 'Solna', county: 'Stockholm', country: 'SE', lat: 59.369, lng: 18.010, source: 'coop.se (Huvudkontor)' },
  { companyOrgNr: 'SE-969697-6594', propertyType: 'office', municipality: 'Solna', county: 'Stockholm', country: 'SE', lat: 59.364, lng: 18.005, source: 'lidl.se (Svenskt huvudkontor)' },

  // Denmark
  { companyOrgNr: 'DK-35954716', propertyType: 'office', address: 'Rosbjergvej 33', municipality: 'Brabrand', county: 'Midtjylland', country: 'DK', lat: 56.155, lng: 10.097, source: 'sallinggroup.com (Hovedkontor)' },
  { companyOrgNr: 'DK-26259495', propertyType: 'office', address: 'Roskildevej 65', municipality: 'Albertslund', county: 'Hovedstaden', country: 'DK', lat: 55.656, lng: 12.356, source: 'coop.dk (Hovedkontor)' },
  { companyOrgNr: 'DK-14705627', propertyType: 'office', municipality: 'Horsens', county: 'Midtjylland', country: 'DK', lat: 55.862, lng: 9.850, source: 'rema1000.dk (Hovedkontor)' },
  { companyOrgNr: 'DK-38714295', propertyType: 'office', municipality: 'Ringsted', county: 'Sjælland', country: 'DK', lat: 55.442, lng: 11.790, source: 'dagrofa.dk (Hovedkontor)' },

  // Finland
  { companyOrgNr: 'FI-0116323-9', propertyType: 'office', address: 'Fleminginkatu 34', municipality: 'Helsinki', county: 'Uusimaa', country: 'FI', lat: 60.187, lng: 24.953, source: 's-ryhma.fi (Pääkonttori)' },
  { companyOrgNr: 'FI-0110456-8', propertyType: 'office', address: 'Työpajankatu 12', municipality: 'Helsinki', county: 'Uusimaa', country: 'FI', source: 'kesko.fi (Pääkonttori)' },
  { companyOrgNr: 'FI-1615492-7', propertyType: 'office', municipality: 'Janakkala', county: 'Kanta-Häme', country: 'FI', lat: 60.886, lng: 24.616, source: 'lidl.fi (Pääkonttori)' },

  // Iceland
  { companyOrgNr: 'IS-670203-2120', propertyType: 'office', municipality: 'Reykjavik', county: 'Höfuðborgarsvæðið', country: 'IS', lat: 64.135, lng: -21.895, source: 'hagar.is (Höfuðstöðvar)' },
  { companyOrgNr: 'IS-571298-3769', propertyType: 'office', address: 'Krossmóa 4', municipality: 'Reykjanesbær', county: 'Suðurnes', country: 'IS', source: 'samkaup.is (Höfuðstöðvar)' },
  { companyOrgNr: 'IS-540206-2010', propertyType: 'office', municipality: 'Reykjavik', county: 'Höfuðborgarsvæðið', country: 'IS', lat: 64.140, lng: -21.910, source: 'festi.is (Höfuðstöðvar)' },

  // ═══ Additional Norwegian logistics/production ═══

  // Orkla production sites
  { companyOrgNr: '910747711', propertyType: 'production', municipality: 'Rygge', county: 'Østfold', lat: 59.38, lng: 10.74, source: 'orkla.no (Stabburet Rygge)' },
  { companyOrgNr: '910747711', propertyType: 'production', municipality: 'Ørsta', county: 'Møre og Romsdal', lat: 62.20, lng: 6.13, source: 'orkla.no (Sætre Ørsta)' },
  { companyOrgNr: '910747711', propertyType: 'office', address: 'Karenslyst allé 6', municipality: 'Oslo', county: 'Oslo', lat: 59.919, lng: 10.677, source: 'orkla.no (Hovedkontor)' },

  // Yara headquarters
  { companyOrgNr: '986228608', propertyType: 'office', address: 'Drammensveien 131', municipality: 'Oslo', county: 'Oslo', lat: 59.919, lng: 10.660, source: 'yara.com (Global Headquarters)' },
  { companyOrgNr: '986228608', propertyType: 'production', municipality: 'Porsgrunn', county: 'Telemark', lat: 59.14, lng: 9.66, source: 'yara.com (Porsgrunn fabrikk)' },

  // Skretting feed factories
  { companyOrgNr: '988044113', propertyType: 'production', municipality: 'Stavanger', county: 'Rogaland', lat: 58.97, lng: 5.73, source: 'skretting.com (Stavanger fôrfabrikk)' },
  { companyOrgNr: '988044113', propertyType: 'production', municipality: 'Averøy', county: 'Møre og Romsdal', lat: 63.05, lng: 7.52, source: 'skretting.com (Averøy fôrfabrikk)' },
  { companyOrgNr: '988044113', propertyType: 'production', municipality: 'Stokmarknes', county: 'Nordland', lat: 68.56, lng: 14.92, source: 'skretting.com (Stokmarknes fôrfabrikk)' },

  // Reitan Retail headquarters
  { companyOrgNr: '914526647', propertyType: 'office', address: 'Gladengveien 2', municipality: 'Oslo', county: 'Oslo', source: 'reitanretail.no (Hovedkontor)' },
]

// ─── Ownership Records ──────────────────────────────────────────────

const ownershipRecords: OwnershipRecord[] = [
  { parentOrgNr: '819731322', childOrgNr: '914224314', ownershipPct: 46, ownershipType: 'minority-stake', source: 'Brønnøysund/Årsrapport' },
  { parentOrgNr: '982254604', childOrgNr: '894759372', ownershipPct: 100, ownershipType: 'subsidiary', source: 'https://www.rema.no/wordpress/wp-content/uploads/2024/06/REMA-Distribusjon-AS-Redegjorelse-apenhetsloven-for-2023-28.08.2024.pdf' },
  { parentOrgNr: '982254604', childOrgNr: '980411133', ownershipPct: 100, ownershipType: 'subsidiary', source: 'https://www.rema.no/egne-merkevarer/norsk-kylling/' },
  { parentOrgNr: '929975200', childOrgNr: '975350940', ownershipPct: 52.7, ownershipType: 'subsidiary', source: 'Austevoll Seafood årsrapport 2024' },
]

const staleOwnershipRecords: Array<Pick<OwnershipRecord, 'parentOrgNr' | 'childOrgNr'>> = [
  { parentOrgNr: '914526647', childOrgNr: '894759372' },
  { parentOrgNr: '914526647', childOrgNr: '980411133' },
]

// ─── Business Relationships ─────────────────────────────────────────

const relationshipRecords: RelationshipRecord[] = [
  // Distributor chains
  { fromOrgNr: '894759372', toOrgNr: '914526647', relationshipType: 'distributor', description: 'REMA Distribusjon er grossist for REMA 1000-butikker', sector: 'dagligvare', source: 'Reitan årsrapport' },
  { fromOrgNr: '914224314', toOrgNr: '819731322', relationshipType: 'distributor', description: 'BAMA distribuerer frukt og grønt til NorgesGruppen-kjeder', sector: 'frukt-grønt', source: 'BAMA/NorgesGruppen' },
  { fromOrgNr: '914224314', toOrgNr: '914526647', relationshipType: 'distributor', description: 'BAMA distribuerer frukt og grønt til REMA 1000', sector: 'frukt-grønt', source: 'BAMA' },

  // Supplier chains: producers → retailers
  { fromOrgNr: '947942638', toOrgNr: '819731322', relationshipType: 'supplier', description: 'TINE leverer meieriprodukter til NorgesGruppen', sector: 'meieri', source: 'Bransjedata' },
  { fromOrgNr: '947942638', toOrgNr: '936560288', relationshipType: 'supplier', description: 'TINE leverer meieriprodukter til Coop Norge', sector: 'meieri', source: 'Bransjedata' },
  { fromOrgNr: '947942638', toOrgNr: '914526647', relationshipType: 'supplier', description: 'TINE leverer meieriprodukter til REMA 1000', sector: 'meieri', source: 'Bransjedata' },
  { fromOrgNr: '938752648', toOrgNr: '819731322', relationshipType: 'supplier', description: 'Nortura leverer kjøttprodukter til NorgesGruppen', sector: 'kjøtt', source: 'Bransjedata' },
  { fromOrgNr: '938752648', toOrgNr: '936560288', relationshipType: 'supplier', description: 'Nortura leverer kjøttprodukter til Coop Norge', sector: 'kjøtt', source: 'Bransjedata' },
  { fromOrgNr: '938752648', toOrgNr: '914526647', relationshipType: 'supplier', description: 'Nortura leverer kjøttprodukter til REMA 1000', sector: 'kjøtt', source: 'Bransjedata' },
  { fromOrgNr: '910747711', toOrgNr: '819731322', relationshipType: 'supplier', description: 'Orkla leverer merkevarer til NorgesGruppen', sector: 'merkevarer', source: 'Bransjedata' },
  { fromOrgNr: '910747711', toOrgNr: '936560288', relationshipType: 'supplier', description: 'Orkla leverer merkevarer til Coop Norge', sector: 'merkevarer', source: 'Bransjedata' },
  { fromOrgNr: '910747711', toOrgNr: '914526647', relationshipType: 'supplier', description: 'Orkla leverer merkevarer til REMA 1000', sector: 'merkevarer', source: 'Bransjedata' },

  // Feed chains
  { fromOrgNr: '911608103', toOrgNr: '938752648', relationshipType: 'supplier', description: 'Felleskjøpet leverer fôr til Nortura-bønder', sector: 'dyrefôr', source: 'Felleskjøpet' },
  { fromOrgNr: '986228608', toOrgNr: '911608103', relationshipType: 'supplier', description: 'Yara leverer gjødsel og innsatsfaktorer til Felleskjøpet', sector: 'gjødsel', source: 'Bransjedata' },
  { fromOrgNr: '988044113', toOrgNr: '964118191', relationshipType: 'supplier', description: 'Skretting leverer fiskefôr til Mowi', sector: 'fiskefôr', source: 'Mowi Industry Handbook' },
  { fromOrgNr: '988044113', toOrgNr: '960514718', relationshipType: 'supplier', description: 'Skretting leverer fiskefôr til SalMar', sector: 'fiskefôr', source: 'Bransjedata' },
  { fromOrgNr: '988044113', toOrgNr: '975350940', relationshipType: 'supplier', description: 'Skretting leverer fiskefôr til Lerøy', sector: 'fiskefôr', source: 'Bransjedata' },
  { fromOrgNr: '988044113', toOrgNr: '961922976', relationshipType: 'supplier', description: 'Skretting leverer fiskefôr til Cermaq Norway', sector: 'fiskefôr', source: 'Bransjedata' },
  { fromOrgNr: '937843860', toOrgNr: '964118191', relationshipType: 'supplier', description: 'BioMar leverer fiskefôr til Mowi', sector: 'fiskefôr', source: 'BioMar' },
  { fromOrgNr: '937843860', toOrgNr: '960514718', relationshipType: 'supplier', description: 'BioMar leverer fiskefôr til SalMar', sector: 'fiskefôr', source: 'BioMar' },
  { fromOrgNr: '937843860', toOrgNr: '975350940', relationshipType: 'supplier', description: 'BioMar leverer fiskefôr til Lerøy', sector: 'fiskefôr', source: 'BioMar' },
  { fromOrgNr: '937843860', toOrgNr: '961922976', relationshipType: 'supplier', description: 'BioMar leverer fiskefôr til Cermaq Norway', sector: 'fiskefôr', source: 'BioMar' },

  // Primary production → wholesaler
  { fromOrgNr: '945958405', toOrgNr: '914224314', relationshipType: 'supplier', description: 'Gartnerhallen leverer norsk frukt/grønt til BAMA', sector: 'frukt-grønt', source: 'gartnerhallen.no' },

  // Grain import
  { fromOrgNr: '910629085', toOrgNr: '947942638', relationshipType: 'supplier', description: 'Lantmännen leverer importert korn/hvete til det norske markedet', sector: 'korn', source: 'Lantmannen.com' },

  // Seafood export promotion
  { fromOrgNr: '964118191', toOrgNr: '988597627', relationshipType: 'joint-venture', description: 'Mowi eksport fremmes via Norges Sjømatråd; 502k tonn 2024', sector: 'sjømat-eksport', source: 'Sjømatrådet' },
  { fromOrgNr: '960514718', toOrgNr: '988597627', relationshipType: 'joint-venture', description: 'SalMar eksport fremmes via Norges Sjømatråd; 232k tonn 2024', sector: 'sjømat-eksport', source: 'Sjømatrådet' },
  { fromOrgNr: '975350940', toOrgNr: '988597627', relationshipType: 'joint-venture', description: 'Lerøy eksport fremmes via Norges Sjømatråd; 171k tonn 2024', sector: 'sjømat-eksport', source: 'Sjømatrådet' },
  { fromOrgNr: '961922976', toOrgNr: '988597627', relationshipType: 'joint-venture', description: 'Cermaq eksport fremmes via Norges Sjømatråd', sector: 'sjømat-eksport', source: 'Sjømatrådet' },

  // Norsk Kylling → REMA
  { fromOrgNr: '980411133', toOrgNr: '914526647', relationshipType: 'supplier', description: 'Norsk Kylling leverer kyllingprodukter eksklusivt til REMA 1000', sector: 'fjørfe', source: 'Norsk Kylling/Reitan' },

  // Grilstad cooperation with Nortura
  { fromOrgNr: '937070632', toOrgNr: '938752648', relationshipType: 'buyer', description: 'Grilstad kjøper slaktetjenester fra Nortura i Trøndelag (12-års avtale)', sector: 'kjøtt', source: 'mn24.no' },
  { fromOrgNr: '937070632', toOrgNr: '819731322', relationshipType: 'supplier', description: 'Grilstad leverer spekepølse og kjøttvarer til NorgesGruppen', sector: 'kjøttvarer', source: 'Bransjedata' },
  { fromOrgNr: '937070632', toOrgNr: '936560288', relationshipType: 'supplier', description: 'Grilstad leverer spekepølse og kjøttvarer til Coop', sector: 'kjøttvarer', source: 'Bransjedata' },
  { fromOrgNr: '937070632', toOrgNr: '914526647', relationshipType: 'supplier', description: 'Grilstad leverer spekepølse og kjøttvarer til REMA 1000', sector: 'kjøttvarer', source: 'Bransjedata' },
]

// ─── Import Functions ───────────────────────────────────────────────

async function resolveCompanyId(orgNr: string): Promise<string | null> {
  const company = await prisma.company.findUnique({
    where: { orgNr },
    select: { id: true },
  })
  return company?.id ?? null
}

async function importNewCompanies() {
  console.log('Importing Session 5 new companies...\n')
  let created = 0

  for (const c of newCompanies) {
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

    console.log(`  ${company.name} (${c.orgNr})`)
    created++
  }

  console.log(`\n${created} new companies imported`)
}

async function importProperties() {
  console.log('\nImporting Session 5 properties...\n')
  let imported = 0
  let skipped = 0

  const grouped = new Map<string, PropertyData[]>()
  for (const p of properties) {
    const existing = grouped.get(p.companyOrgNr) ?? []
    existing.push(p)
    grouped.set(p.companyOrgNr, existing)
  }

  for (const [orgNr, props] of grouped) {
    const companyId = await resolveCompanyId(orgNr)
    if (!companyId) {
      console.log(`  SKIP properties for ${orgNr} (company not found)`)
      skipped += props.length
      continue
    }

    await prisma.companyProperty.deleteMany({ where: { companyId } })

    for (const p of props) {
      let tenantCompanyId: string | undefined
      if (p.tenantOrgNr) {
        tenantCompanyId = (await resolveCompanyId(p.tenantOrgNr)) ?? undefined
      }

      await prisma.companyProperty.create({
        data: {
          companyId,
          propertyType: p.propertyType,
          address: p.address,
          municipality: p.municipality,
          county: p.county,
          country: p.country ?? 'NO',
          lat: p.lat,
          lng: p.lng,
          sqMeters: p.sqMeters,
          selfLeased: p.selfLeased ?? false,
          tenantCompanyId,
          source: p.source,
        },
      })
      imported++
    }

    const company = await prisma.company.findUnique({ where: { orgNr }, select: { name: true } })
    console.log(`  ${company?.name}: ${props.length} properties`)
  }

  console.log(`\n${imported} properties imported, ${skipped} skipped`)
}

async function importOwnership() {
  console.log('\nImporting Session 5 ownership records...\n')
  let imported = 0
  let skipped = 0

  for (const rec of staleOwnershipRecords) {
    const parentId = await resolveCompanyId(rec.parentOrgNr)
    const childId = await resolveCompanyId(rec.childOrgNr)

    if (!parentId || !childId) continue

    const deleted = await prisma.companyOwnership.deleteMany({
      where: { parentCompanyId: parentId, childCompanyId: childId },
    })

    if (deleted.count > 0) {
      console.log(`  REMOVED stale ownership: ${rec.parentOrgNr} → ${rec.childOrgNr}`)
    }
  }

  for (const rec of ownershipRecords) {
    const parentId = await resolveCompanyId(rec.parentOrgNr)
    const childId = await resolveCompanyId(rec.childOrgNr)

    if (!parentId || !childId) {
      console.log(`  SKIP: ${rec.parentOrgNr} → ${rec.childOrgNr} (company not found)`)
      skipped++
      continue
    }

    await prisma.companyOwnership.upsert({
      where: {
        parentCompanyId_childCompanyId: { parentCompanyId: parentId, childCompanyId: childId },
      },
      update: {
        ownershipPct: rec.ownershipPct,
        ownershipType: rec.ownershipType,
        source: rec.source,
      },
      create: {
        parentCompanyId: parentId,
        childCompanyId: childId,
        ownershipPct: rec.ownershipPct,
        ownershipType: rec.ownershipType,
        source: rec.source,
      },
    })

    console.log(`  ${rec.parentOrgNr} → ${rec.childOrgNr} (${rec.ownershipType}${rec.ownershipPct ? `, ${rec.ownershipPct}%` : ''})`)
    imported++
  }

  console.log(`\n${imported} ownership records imported, ${skipped} skipped`)
}

async function importRelationships() {
  console.log('\nImporting Session 5 business relationships...\n')
  let imported = 0
  let skipped = 0

  for (const rec of relationshipRecords) {
    const fromId = await resolveCompanyId(rec.fromOrgNr)
    const toId = await resolveCompanyId(rec.toOrgNr)

    if (!fromId || !toId) {
      console.log(`  SKIP: ${rec.fromOrgNr} → ${rec.toOrgNr} (company not found)`)
      skipped++
      continue
    }

    await prisma.businessRelationship.upsert({
      where: {
        fromCompanyId_toCompanyId_relationshipType: {
          fromCompanyId: fromId,
          toCompanyId: toId,
          relationshipType: rec.relationshipType,
        },
      },
      update: {
        description: rec.description,
        sector: rec.sector,
        source: rec.source,
      },
      create: {
        fromCompanyId: fromId,
        toCompanyId: toId,
        relationshipType: rec.relationshipType,
        description: rec.description,
        sector: rec.sector,
        source: rec.source,
      },
    })

    console.log(`  ${rec.fromOrgNr} → ${rec.toOrgNr} (${rec.relationshipType})`)
    imported++
  }

  console.log(`\n${imported} relationships imported, ${skipped} skipped`)
}

async function main() {
  console.log('═══ Session 5: Supply Chain & Logistics Infrastructure ═══\n')

  await importNewCompanies()
  await importProperties()
  await importOwnership()
  await importRelationships()

  console.log('\n═══ Session 5 Summary ═══')
  console.log('Companies:', await prisma.company.count())
  console.log('Properties:', await prisma.companyProperty.count())
  console.log('Ownership:', await prisma.companyOwnership.count())
  console.log('Relationships:', await prisma.businessRelationship.count())
}

main()
  .catch((e) => {
    console.error('Session 5 import failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
