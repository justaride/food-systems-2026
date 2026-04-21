import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

// Prisma JSON input doesn't accept Record<string, unknown>. Use any for metadata fields.
/* eslint-disable @typescript-eslint/no-explicit-any */

type CompanySeed = {
  name: string
  orgNr: string
  country: string
  legalForm?: string
  hqCity?: string
  founded?: number
  ownershipType?: string
  valueChainStage?: string
  employees?: number
  metadata?: any
}

type OwnershipSeed = {
  parentOrgNr: string
  childOrgNr: string
  ownershipPct?: number
  ownershipType: string
  source: string
  metadata?: any
}

type PropertySeed = {
  orgNr: string
  propertyType: string
  address?: string
  municipality?: string
  county?: string
  country?: string
  sqMeters?: number
  acquiredYear?: number
  selfLeased?: boolean
  tenantOrgNr?: string
  source?: string
  metadata?: any
}

type BusinessRelationshipSeed = {
  fromOrgNr: string
  toOrgNr: string
  relationshipType: string
  description?: string
  sector?: string
  estimatedValue?: number
  source?: string
  metadata?: any
}

// ═══════════════════════════════════════════════════════════════════
// 1. PROPERTY-ARM COMPANIES (NorgesGruppen / Reitan / Coop / naerstaaende)
// ═══════════════════════════════════════════════════════════════════

const propertyArmCompanies: CompanySeed[] = [
  // NorgesGruppen property tree
  { name: 'NorgesGruppen Eiendom AS', orgNr: 'NO-961483584-EIE', country: 'NO', legalForm: 'AS', hqCity: 'Oslo', ownershipType: 'family', valueChainStage: 'property' },
  { name: 'NorgesGruppen Eiendom Holding AS', orgNr: 'NO-961483584-EIEH', country: 'NO', legalForm: 'AS', hqCity: 'Oslo', ownershipType: 'family', valueChainStage: 'property' },
  { name: 'NG Eiendom Vestfold Telemark AS', orgNr: 'NO-961483584-VTEIE', country: 'NO', legalForm: 'AS', hqCity: 'Toensberg', ownershipType: 'family', valueChainStage: 'property' },
  { name: 'NorgesGruppen Vestfold Telemark AS', orgNr: 'NO-961483584-VT', country: 'NO', legalForm: 'AS', hqCity: 'Toensberg', ownershipType: 'family', valueChainStage: 'retail' },
  { name: 'Joh. Johannson Eiendom AS', orgNr: 'NO-JJ-EIE', country: 'NO', legalForm: 'AS', hqCity: 'Oslo', ownershipType: 'family', valueChainStage: 'property', metadata: { relatedParty: 'NorgesGruppen', family: 'Johannson' } },
  { name: 'Joh Johannson Invest AS', orgNr: 'NO-JJ-INV', country: 'NO', legalForm: 'AS', hqCity: 'Oslo', ownershipType: 'family', valueChainStage: 'holding', metadata: { family: 'Johannson' } },
  { name: 'Bokveien 112 AS', orgNr: 'NO-BOKV112', country: 'NO', legalForm: 'AS', hqCity: 'Oslo', ownershipType: 'family', valueChainStage: 'property', metadata: { relatedParty: 'NorgesGruppen', family: 'Johannson' } },
  { name: 'Alf Bjercke Eiendom AS', orgNr: 'NO-BJERCKE-EIE', country: 'NO', legalForm: 'AS', hqCity: 'Oslo', ownershipType: 'family', valueChainStage: 'property', metadata: { relatedParty: 'NorgesGruppen' } },

  // Coop property tree
  { name: 'Coop Norge Eiendom AS', orgNr: 'NO-948202063-EIE', country: 'NO', legalForm: 'AS', hqCity: 'Oslo', ownershipType: 'cooperative', valueChainStage: 'property' },
  { name: 'Coop Eiendom Soervest AS', orgNr: 'NO-COOP-SV', country: 'NO', legalForm: 'AS', hqCity: 'Stavanger', ownershipType: 'cooperative', valueChainStage: 'property' },
  { name: 'Coop Midt-Norge Eiendom AS', orgNr: 'NO-COOP-MN', country: 'NO', legalForm: 'AS', hqCity: 'Trondheim', ownershipType: 'cooperative', valueChainStage: 'property' },
  { name: 'Coop Raufoss Kjoepesenter AS', orgNr: 'NO-COOP-RAUF', country: 'NO', legalForm: 'AS', hqCity: 'Raufoss', ownershipType: 'cooperative', valueChainStage: 'property' },

  // Reitan property tree
  { name: 'Reitan Eiendom AS', orgNr: 'NO-REITAN-EIE', country: 'NO', legalForm: 'AS', hqCity: 'Trondheim', founded: 1995, ownershipType: 'family', valueChainStage: 'property' },
  { name: 'REITAN AS', orgNr: 'NO-REITAN-HOLD', country: 'NO', legalForm: 'AS', hqCity: 'Trondheim', ownershipType: 'family', valueChainStage: 'holding', metadata: { family: 'Reitan' } },
  { name: 'E C Dahls Eiendom AS', orgNr: 'NO-ECDAHLS-EIE', country: 'NO', legalForm: 'AS', hqCity: 'Trondheim', ownershipType: 'family', valueChainStage: 'property' },
  { name: 'RELOG AS', orgNr: 'NO-RELOG', country: 'NO', legalForm: 'AS', hqCity: 'Trondheim', ownershipType: 'family', valueChainStage: 'logistics' },
  { name: 'REBUS Handelseiendom AS', orgNr: 'NO-REBUS-HEIE', country: 'NO', legalForm: 'AS', hqCity: 'Trondheim', ownershipType: 'family', valueChainStage: 'property' },
  { name: 'REBUS Utvikling AS', orgNr: 'NO-REBUS-UTV', country: 'NO', legalForm: 'AS', hqCity: 'Trondheim', ownershipType: 'family', valueChainStage: 'property' },
  { name: 'Christiania Areal AS', orgNr: 'NO-CHR-AREAL', country: 'NO', legalForm: 'AS', hqCity: 'Oslo', ownershipType: 'family', valueChainStage: 'property' },

  // Other NO
  { name: 'I.K. Lykke Eiendom AS', orgNr: 'NO-IKLYKKE-EIE', country: 'NO', legalForm: 'AS', hqCity: 'Trondheim', ownershipType: 'family', valueChainStage: 'property', metadata: { relatedParty: 'Bunnpris' } },

  // Nordic real-estate (Cibus Nordic)
  { name: 'Cibus Nordic Real Estate AB', orgNr: 'SE-CIBUS-NRE', country: 'SE', legalForm: 'publ-AB', hqCity: 'Stockholm', ownershipType: 'listed', valueChainStage: 'property' },
]

// ═══════════════════════════════════════════════════════════════════
// 2. ALTERNATIVE DISTRIBUTION CHANNELS (Nordic)
// ═══════════════════════════════════════════════════════════════════

const altDistributionCompanies: CompanySeed[] = [
  { name: 'Aarstiderne A/S', orgNr: 'DK-AARSTID', country: 'DK', legalForm: 'A/S', hqCity: 'Humlebaek', ownershipType: 'family', valueChainStage: 'retail', metadata: { channel: 'subscription', households_dk: 50000, households_se: 10000, meals_weekly: 250000 } },
  { name: 'Cheffelo AB', orgNr: 'SE-CHEFFELO', country: 'SE', legalForm: 'AB', hqCity: 'Stockholm', ownershipType: 'listed', valueChainStage: 'retail', metadata: { channel: 'subscription', revenue_2025_sek: 1188000000, markets: ['NO', 'SE', 'DK', 'FI-pilot-2026'] } },
  { name: 'Linas Matkasse AB', orgNr: 'SE-LINAS', country: 'SE', legalForm: 'AB', hqCity: 'Stockholm', ownershipType: 'listed', valueChainStage: 'retail', metadata: { channel: 'subscription', revenue_2024_sek: 403100000, parent: 'Cheffelo' } },
  { name: 'RetNemt ApS', orgNr: 'DK-RETNEMT', country: 'DK', legalForm: 'ApS', hqCity: 'Copenhagen', ownershipType: 'listed', valueChainStage: 'retail', metadata: { channel: 'subscription', revenue_2024_sek_eq: 149600000, parent: 'Cheffelo' } },
  { name: 'Matsmart / Motatos AB', orgNr: 'SE-MATSMART', country: 'SE', legalForm: 'AB', hqCity: 'Stockholm', ownershipType: 'foreign', valueChainStage: 'retail', metadata: { channel: 'surplus-online', revenue_nordic_2024_sek: 756000000 } },
  { name: 'Dyrket.no AS', orgNr: 'NO-DYRKET', country: 'NO', legalForm: 'AS', hqCity: 'Oslo', ownershipType: 'family', valueChainStage: 'retail', metadata: { channel: 'local-food-platform', reach: '2M+ in Oestlandet' } },
  { name: 'Bondens Marked Norge', orgNr: 'NO-BONDENS', country: 'NO', legalForm: 'stiftelse', hqCity: 'Oslo', ownershipType: 'non-profit', valueChainStage: 'retail', metadata: { channel: 'farmers-market', revenue_2024_nok: 76400000 } },
  { name: 'Oslo Kooperativ SA', orgNr: 'NO-OSLO-KOOP', country: 'NO', legalForm: 'SA', hqCity: 'Oslo', ownershipType: 'cooperative', valueChainStage: 'retail', metadata: { channel: 'consumer-cooperative' } },
  { name: 'Ruokaboksi Oy', orgNr: 'FI-RUOKAB', country: 'FI', legalForm: 'Oy', hqCity: 'Helsinki', ownershipType: 'listed', valueChainStage: 'retail', metadata: { channel: 'subscription' } },
]

// ═══════════════════════════════════════════════════════════════════
// 3. HORECA / FOODSERVICE WHOLESALERS (Nordic)
// ═══════════════════════════════════════════════════════════════════

const horecaWholesalers: CompanySeed[] = [
  // Sweden
  { name: 'Martin & Servera AB', orgNr: 'SE-MARTIN-SERV', country: 'SE', legalForm: 'AB', hqCity: 'Stockholm', ownershipType: 'family', valueChainStage: 'wholesale', metadata: { segment: 'foodservice', parent: 'Axel Johnson' } },
  { name: 'Menigo Foodservice AB', orgNr: 'SE-MENIGO', country: 'SE', legalForm: 'AB', hqCity: 'Stockholm', ownershipType: 'listed', valueChainStage: 'wholesale', metadata: { segment: 'foodservice' } },
  // Finland
  { name: 'Kespro Oy', orgNr: 'FI-KESPRO', country: 'FI', legalForm: 'Oy', hqCity: 'Helsinki', ownershipType: 'listed', valueChainStage: 'wholesale', metadata: { segment: 'foodservice', parent: 'Kesko', market_share_fi_foodservice: 0.49 } },
  { name: 'Meira Nova Oy', orgNr: 'FI-MEIRA', country: 'FI', legalForm: 'Oy', hqCity: 'Helsinki', ownershipType: 'cooperative', valueChainStage: 'wholesale', metadata: { segment: 'foodservice', parent: 'S Group' } },
  { name: 'Metro-tukku (Wihuri)', orgNr: 'FI-METRO-T', country: 'FI', legalForm: 'Oy', hqCity: 'Helsinki', ownershipType: 'family', valueChainStage: 'wholesale', metadata: { segment: 'foodservice' } },
  { name: 'Valio Aimo', orgNr: 'FI-VALIO-AIMO', country: 'FI', legalForm: 'Oy', hqCity: 'Helsinki', ownershipType: 'cooperative', valueChainStage: 'wholesale', metadata: { segment: 'foodservice', parent: 'Valio' } },
  // Norway
  { name: 'Servicegrossistene AS', orgNr: 'NO-SERVICEGR', country: 'NO', legalForm: 'AS', hqCity: 'Oslo', ownershipType: 'family', valueChainStage: 'wholesale', metadata: { segment: 'foodservice' } },
  { name: 'Norengros AS', orgNr: 'NO-NORENGROS', country: 'NO', legalForm: 'AS', hqCity: 'Oslo', ownershipType: 'family', valueChainStage: 'wholesale', metadata: { segment: 'foodservice-non-food' } },
  // Denmark
  { name: 'Dagrofa A/S', orgNr: 'DK-DAGROFA', country: 'DK', legalForm: 'A/S', hqCity: 'Ringsted', ownershipType: 'family', valueChainStage: 'wholesale', metadata: { segment: 'retail-wholesale' } },
  { name: 'Hoerkram Foodservice A/S', orgNr: 'DK-HORKRAM', country: 'DK', legalForm: 'A/S', hqCity: 'Vejen', ownershipType: 'family', valueChainStage: 'wholesale', metadata: { segment: 'foodservice' } },
  { name: 'Dansk Cater A/S', orgNr: 'DK-DANSKCATER', country: 'DK', legalForm: 'A/S', hqCity: 'Horsens', ownershipType: 'listed', valueChainStage: 'wholesale', metadata: { segment: 'foodservice' } },
  { name: 'BC Catering', orgNr: 'DK-BCCATER', country: 'DK', legalForm: 'A/S', hqCity: 'Vejle', ownershipType: 'private', valueChainStage: 'wholesale', metadata: { segment: 'foodservice' } },
]

// ═══════════════════════════════════════════════════════════════════
// 4. FAILED / EXITED ENTRANTS
// ═══════════════════════════════════════════════════════════════════

const failedEntrants: CompanySeed[] = [
  { name: 'Lidl Norge AS', orgNr: 'NO-LIDL', country: 'NO', legalForm: 'AS', hqCity: 'Skedsmo', ownershipType: 'foreign', valueChainStage: 'retail', metadata: { status: 'exited', exit_year: 2008, acquirer: 'REMA 1000', stores_at_exit: 50 } },
  { name: 'ICA Norge AS', orgNr: 'NO-ICA-NO', country: 'NO', legalForm: 'AS', hqCity: 'Oslo', ownershipType: 'foreign', valueChainStage: 'retail', metadata: { status: 'acquired', exit_year: 2014, acquirer: 'Coop Norge', employees_at_exit: 3600, stores_at_exit: 553, market_share_2009: 0.157, market_share_2013: 0.111, ebit_t12m_msek: -577 } },
  { name: 'Mat.se AB', orgNr: 'SE-MATSE', country: 'SE', legalForm: 'AB', hqCity: 'Stockholm', ownershipType: 'private', valueChainStage: 'retail', metadata: { status: 'merged', year: 2021, merged_into: 'Mathem' } },
  { name: 'Mathem i Sverige AB', orgNr: 'SE-MATHEM', country: 'SE', legalForm: 'AB', hqCity: 'Stockholm', ownershipType: 'private', valueChainStage: 'retail', metadata: { status: 'business-reconstruction', reconstruction_year: 2024, online: true } },
  { name: 'Oda Sverige AB', orgNr: 'SE-ODA', country: 'SE', legalForm: 'AB', hqCity: 'Stockholm', ownershipType: 'foreign', valueChainStage: 'retail', metadata: { status: 'merged', year: 2023, merged_into: 'Mathem' } },
  { name: 'Coop.dk MAD', orgNr: 'DK-COOPDKMAD', country: 'DK', legalForm: 'division', hqCity: 'Albertslund', ownershipType: 'cooperative', valueChainStage: 'retail', metadata: { status: 'closed', closure_year: 2023, years_of_losses: 10 } },
  { name: 'Irma A/S', orgNr: 'DK-IRMA', country: 'DK', legalForm: 'A/S', hqCity: 'Copenhagen', ownershipType: 'cooperative', valueChainStage: 'retail', metadata: { status: 'discontinued', year: 2023, stores_at_closure: 65, split: '9 new Coop, 28 365discount, 11 Brugsen, 17 closed' } },
  { name: 'Foodora Finland Oy', orgNr: 'FI-FOODORA', country: 'FI', legalForm: 'Oy', hqCity: 'Helsinki', ownershipType: 'foreign', valueChainStage: 'distribution', metadata: { status: 'closing', closure_date: '2026-02-28', context: 'Wolt Supreme Court ruling on rider employment status' } },
  { name: 'Stockmann Herkku Delicatessen', orgNr: 'FI-STOCKHERKKU', country: 'FI', legalForm: 'division', hqCity: 'Helsinki', ownershipType: 'private', valueChainStage: 'retail', metadata: { status: 'acquired', year: 2017, acquirer: 'S Group (SOK)', operating_loss_2016_eur: -11000000, stores: 6 } },
]

// ═══════════════════════════════════════════════════════════════════
// 5. BENCHMARK ORGANIZATIONS + CIRCULAR INNOVATION NO
// ═══════════════════════════════════════════════════════════════════

const benchmarkAndCircular: CompanySeed[] = [
  { name: 'Too Good To Go International A/S', orgNr: 'DK-TGTG', country: 'DK', legalForm: 'A/S', hqCity: 'Copenhagen', ownershipType: 'private', valueChainStage: 'platform', metadata: { users: 120000000, partners: 180000, countries: 20, meals_rescued: 500000000, co2e_avoided_tonnes: 1350000 } },
  { name: 'PeelPioneers B.V.', orgNr: 'NL-PEELPIO', country: 'NL', legalForm: 'B.V.', hqCity: 'Den Bosch', ownershipType: 'private', valueChainStage: 'processing', metadata: { capacity_kg_per_day: 120000, invested_eur: 10000000, nl_supermarket_coverage: 0.80 } },
  { name: 'Agrain A/S', orgNr: 'DK-AGRAIN', country: 'DK', legalForm: 'A/S', hqCity: 'Copenhagen', ownershipType: 'private', valueChainStage: 'processing', metadata: { capital_raised_dkk: 26000000, feedstock: 'brewery-spent-grain' } },

  // Norwegian circular innovation (from compass_artifact)
  { name: 'Greve Biogass AS', orgNr: 'NO-GREVEBIO', country: 'NO', legalForm: 'AS', hqCity: 'Toensberg', ownershipType: 'private', valueChainStage: 'utility', metadata: { capacity_gwh_year: 120, capacity_diesel_eq_litres: 6800000, feedstock_tonnes: 120000, facility: 'Den Magiske Fabrikken' } },
  { name: 'Alginor ASA', orgNr: 'NO-ALGINOR', country: 'NO', legalForm: 'ASA', hqCity: 'Haugesund', ownershipType: 'listed', valueChainStage: 'processing', metadata: { segment: 'seaweed-biorefinery', capacity_tonnes_year: 50000, technology: 'AORTA' } },
  { name: 'Avisomo AS', orgNr: 'NO-AVISOMO', country: 'NO', legalForm: 'AS', hqCity: 'Hamar', ownershipType: 'private', valueChainStage: 'production', metadata: { segment: 'vertical-farming' } },
  { name: 'Himmelgroent AS', orgNr: 'NO-HIMMELGR', country: 'NO', legalForm: 'AS', hqCity: 'Gardermoen', founded: 2023, ownershipType: 'joint-venture', valueChainStage: 'production', metadata: { segment: 'vertical-farming', capacity_tonnes_year: 100, jv_partners: ['Avisomo', 'Coop Norge'] } },
  { name: 'Hordafor AS', orgNr: 'NO-HORDAFOR', country: 'NO', legalForm: 'AS', hqCity: 'Bergen', ownershipType: 'listed', valueChainStage: 'processing', metadata: { segment: 'fish-rest-raw', acquired_by: 'Pelagia', acquired_year: 2021, acquisition_price_nok: 477000000, feedstock_tonnes_year: 180000 } },
  { name: 'Biomega Group AS', orgNr: 'NO-BIOMEGA', country: 'NO', legalForm: 'AS', hqCity: 'Sotra', ownershipType: 'private', valueChainStage: 'processing', metadata: { segment: 'marine-ingredients' } },
  { name: 'Hofseth BioCare ASA', orgNr: 'NO-HOFSETHBC', country: 'NO', legalForm: 'ASA', hqCity: 'Aalesund', ownershipType: 'listed', valueChainStage: 'processing', metadata: { segment: 'marine-ingredients' } },
  { name: 'Cultivate Food AS', orgNr: 'NO-CULTIVATE', country: 'NO', legalForm: 'AS', hqCity: 'Oslo', ownershipType: 'private', valueChainStage: 'retail', metadata: { segment: 'plant-based-restaurants' } },
]

// ═══════════════════════════════════════════════════════════════════
// 6. OWNERSHIP + RELATIONSHIPS + PROPERTIES
// ═══════════════════════════════════════════════════════════════════

const ownerships: OwnershipSeed[] = [
  // NorgesGruppen property tree (actual parent NG ASA exists with its orgNr)
  { parentOrgNr: '987565922', childOrgNr: 'NO-961483584-EIEH', ownershipPct: 100, ownershipType: 'subsidiary', source: 'NorgesGruppen registreringsdokument 2025' },
  { parentOrgNr: 'NO-961483584-EIEH', childOrgNr: 'NO-961483584-EIE', ownershipPct: 100, ownershipType: 'subsidiary', source: 'NorgesGruppen registreringsdokument 2025' },
  { parentOrgNr: 'NO-961483584-EIE', childOrgNr: 'NO-961483584-VTEIE', ownershipPct: 100, ownershipType: 'subsidiary', source: 'NorgesGruppen registreringsdokument 2025' },
  { parentOrgNr: 'NO-JJ-INV', childOrgNr: 'NO-JJ-EIE', ownershipPct: 100, ownershipType: 'subsidiary', source: 'Johannson family holding' },
  { parentOrgNr: 'NO-JJ-INV', childOrgNr: 'NO-BOKV112', ownershipPct: 100, ownershipType: 'subsidiary', source: 'Johannson family holding' },

  // Coop property tree
  { parentOrgNr: '948202063', childOrgNr: 'NO-948202063-EIE', ownershipPct: 100, ownershipType: 'subsidiary', source: 'Coop arsrapport 2024' },

  // Reitan property tree
  { parentOrgNr: 'NO-REITAN-HOLD', childOrgNr: 'NO-REITAN-EIE', ownershipPct: 100, ownershipType: 'subsidiary', source: 'Reitan Eiendom arsrapport 2024' },
  { parentOrgNr: 'NO-REITAN-EIE', childOrgNr: 'NO-ECDAHLS-EIE', ownershipPct: 100, ownershipType: 'subsidiary', source: 'Reitan Eiendom arsrapport 2024' },
  { parentOrgNr: 'NO-REITAN-EIE', childOrgNr: 'NO-RELOG', ownershipPct: 100, ownershipType: 'subsidiary', source: 'Reitan Eiendom arsrapport 2024' },
  { parentOrgNr: 'NO-REITAN-EIE', childOrgNr: 'NO-REBUS-HEIE', ownershipPct: 100, ownershipType: 'subsidiary', source: 'Reitan Eiendom arsrapport 2024' },
  { parentOrgNr: 'NO-REITAN-EIE', childOrgNr: 'NO-CHR-AREAL', ownershipPct: 100, ownershipType: 'subsidiary', source: 'Reitan Eiendom arsrapport 2024' },
  // REBUS transfer 2023-12
  { parentOrgNr: 'NO-REBUS-HEIE', childOrgNr: 'NO-REBUS-UTV', ownershipPct: 100, ownershipType: 'subsidiary', source: 'REBUS transfer december 2023 (from REMA 1000 Norge)', metadata: { effectiveFrom: '2023-12-01' } },

  // Alt-distribution: Cheffelo parent holds Linas + RetNemt
  { parentOrgNr: 'SE-CHEFFELO', childOrgNr: 'SE-LINAS', ownershipPct: 100, ownershipType: 'subsidiary', source: 'Cheffelo Q4 2025 investor report' },
  { parentOrgNr: 'SE-CHEFFELO', childOrgNr: 'DK-RETNEMT', ownershipPct: 100, ownershipType: 'subsidiary', source: 'Cheffelo Q4 2025 investor report' },

  // HORECA: Kespro is Kesko, Meira Nova is S Group, Martin & Servera is Axel Johnson, Dagab is Axfood
  { parentOrgNr: 'FI-KESKO', childOrgNr: 'FI-KESPRO', ownershipPct: 100, ownershipType: 'subsidiary', source: 'Kesko annual report' },
  { parentOrgNr: 'SE-556223-6959', childOrgNr: 'SE-MARTIN-SERV', ownershipPct: 100, ownershipType: 'subsidiary', source: 'Axel Johnson portfolio' },

  // Failed entrants
  { parentOrgNr: 'DK-COOP-DK', childOrgNr: 'DK-IRMA', ownershipPct: 100, ownershipType: 'subsidiary', source: 'Coop Danmark arsrapport 2024', metadata: { status: 'discontinued-2023' } },

  // Benchmarks
  { parentOrgNr: 'NO-AVISOMO', childOrgNr: 'NO-HIMMELGR', ownershipPct: 50, ownershipType: 'joint-venture', source: 'Himmelgroent founding 2023' },
  { parentOrgNr: '948202063', childOrgNr: 'NO-HIMMELGR', ownershipPct: 50, ownershipType: 'joint-venture', source: 'Himmelgroent founding 2023' },
]

const properties: PropertySeed[] = [
  // NorgesGruppen-related property
  { orgNr: 'NO-JJ-EIE', propertyType: 'retail', municipality: 'Oslo', country: 'NO', selfLeased: true, tenantOrgNr: '987565922', source: 'NG registreringsdokument 2025', metadata: { annualRentNOK_2024: 120000000, tenantRelationship: 'related-party' } },
  { orgNr: 'NO-BOKV112', propertyType: 'retail', municipality: 'Oslo', country: 'NO', selfLeased: true, tenantOrgNr: '987565922', source: 'NG registreringsdokument 2025', metadata: { annualRentNOK_2024: 'included in Johannson 120m bundle' } },
  { orgNr: 'NO-BJERCKE-EIE', propertyType: 'retail', municipality: 'Oslo', country: 'NO', selfLeased: true, tenantOrgNr: '987565922', source: 'NG registreringsdokument 2025', metadata: { annualRentNOK_2024: 48000000, tenantRelationship: 'related-party-share' } },

  // Reitan Eiendom aggregate
  { orgNr: 'NO-REITAN-EIE', propertyType: 'retail', country: 'NO', sqMeters: 2077000, source: 'Reitan Eiendom arsrapport 2024', metadata: { revenue_nok_2024: 2000000000, portfolio_type: 'aggregate' } },
  { orgNr: 'NO-REBUS-HEIE', propertyType: 'retail', country: 'NO', source: 'REBUS transfer dec 2023', metadata: { wholly_owned_properties: 27, partly_owned_properties: 38, source_of_portfolio: 'REMA 1000 Norge' } },

  // Coop Midt-Norge aggregate
  { orgNr: 'NO-COOP-MN', propertyType: 'retail', country: 'NO', sqMeters: 325000, source: 'Coop Midt-Norge arsrapport 2024', metadata: { tomteareal_sqm: 925000, internal_leases: 120, external_leases: 400, portfolio_type: 'aggregate' } },

  // Himmelgroent vertical farm
  { orgNr: 'NO-HIMMELGR', propertyType: 'production', address: 'Gardermoen', municipality: 'Ullensaker', country: 'NO', acquiredYear: 2023, source: 'Himmelgroent founding', metadata: { facility_type: 'vertical-farm', capacity_tonnes_year: 100 } },

  // Den Magiske Fabrikken
  { orgNr: 'NO-GREVEBIO', propertyType: 'production', address: 'Taranrodveien 35', municipality: 'Toensberg', country: 'NO', source: 'Den Magiske Fabrikken', metadata: { facility_name: 'Den Magiske Fabrikken', capacity_gwh_year: 120 } },
]

const relationships: BusinessRelationshipSeed[] = [
  // Property self-dealing NG
  { fromOrgNr: 'NO-JJ-EIE', toOrgNr: '987565922', relationshipType: 'self-dealing', description: 'NOK 120m husleie 2024 fra NG til Joh. Johannson Eiendom + Bokveien 112 (naerstaaende)', estimatedValue: 120000000, source: 'NG registreringsdokument 2025' },
  { fromOrgNr: 'NO-BJERCKE-EIE', toOrgNr: '987565922', relationshipType: 'self-dealing', description: 'NOK 48m husleie 2024 fra NG til Alf Bjercke Eiendom (naerstaaende andel)', estimatedValue: 48000000, source: 'NG registreringsdokument 2025' },

  // Failed entrants
  { fromOrgNr: 'NO-LIDL', toOrgNr: '949556207', relationshipType: 'self-dealing', description: 'REMA 1000 kjoepte Lidl Norges 50 butikker + HK + logistikk 2008', source: 'REMA 1000 press release 2008' },
  { fromOrgNr: 'NO-ICA-NO', toOrgNr: '948202063', relationshipType: 'self-dealing', description: 'Coop Norge kjoepte ICA Norge 2014 (3600 ansatte, 553 butikker, -SEK 577m EBIT T12M)', source: 'ICA Gruppen press release 2014' },
  { fromOrgNr: 'SE-MATSE', toOrgNr: 'SE-MATHEM', relationshipType: 'self-dealing', description: 'Axfood byttet Mat.se for andel i Mathem 2021', source: 'Kinnevik press release 2021' },
  { fromOrgNr: 'SE-ODA', toOrgNr: 'SE-MATHEM', relationshipType: 'self-dealing', description: 'Oda-Mathem merger 2023', source: 'Mathem press release 2023' },
  { fromOrgNr: 'FI-STOCKHERKKU', toOrgNr: 'FI-SGROUP', relationshipType: 'self-dealing', description: 'S Group kjoepte Stockmann Delicatessen 2017 (-EUR 11m 2016, 6 butikker)', source: 'Lindex Group press release 2017' },

  // Benchmark business relationships
  { fromOrgNr: 'DK-TGTG', toOrgNr: '948202063', relationshipType: 'distributor', description: 'Too Good To Go - Coop Norge avtale 804 butikker 2021', source: 'Coop + TGTG press release 2021' },
  { fromOrgNr: 'NO-HORDAFOR', toOrgNr: 'NO-PELAGIA', relationshipType: 'self-dealing', description: 'Pelagia kjoepte Hordafor 2021 for NOK 477m', estimatedValue: 477000000, source: 'Pelagia press release 2021' },

  // Wholesaler relationships
  { fromOrgNr: 'SE-DAGAB', toOrgNr: 'SE-MATHEM', relationshipType: 'supplier', description: 'Dagab langtidsforsyningsavtale til Mathem 2021-', source: 'Axfood/Mathem press 2021' },
]

// ═══════════════════════════════════════════════════════════════════
// IMPORT LOGIC
// ═══════════════════════════════════════════════════════════════════

const allCompanies = [
  ...propertyArmCompanies,
  ...altDistributionCompanies,
  ...horecaWholesalers,
  ...failedEntrants,
  ...benchmarkAndCircular,
]

async function resolveCompanyId(orgNr: string): Promise<string | null> {
  const company = await prisma.company.findUnique({ where: { orgNr }, select: { id: true } })
  return company?.id ?? null
}

async function importCompanies() {
  console.log(`Importing ${allCompanies.length} companies...`)
  let upserted = 0
  for (const c of allCompanies) {
    await prisma.company.upsert({
      where: { orgNr: c.orgNr },
      update: {
        name: c.name,
        country: c.country,
        legalForm: c.legalForm,
        hqCity: c.hqCity,
        founded: c.founded,
        ownershipType: c.ownershipType,
        valueChainStage: c.valueChainStage,
        employees: c.employees,
        metadata: c.metadata ?? undefined,
      },
      create: {
        name: c.name,
        orgNr: c.orgNr,
        country: c.country,
        legalForm: c.legalForm,
        hqCity: c.hqCity,
        founded: c.founded,
        ownershipType: c.ownershipType,
        valueChainStage: c.valueChainStage,
        employees: c.employees,
        metadata: c.metadata ?? undefined,
      },
    })
    upserted++
  }
  console.log(`  Companies upserted: ${upserted}`)
}

async function importOwnership() {
  console.log(`Importing ${ownerships.length} ownership links...`)
  let skipped = 0
  let upserted = 0
  for (const o of ownerships) {
    const parentId = await resolveCompanyId(o.parentOrgNr)
    const childId = await resolveCompanyId(o.childOrgNr)
    if (!parentId || !childId) {
      skipped++
      continue
    }
    await prisma.companyOwnership.upsert({
      where: { parentCompanyId_childCompanyId: { parentCompanyId: parentId, childCompanyId: childId } },
      update: {
        ownershipPct: o.ownershipPct,
        ownershipType: o.ownershipType,
        source: o.source,
        metadata: o.metadata ?? undefined,
      },
      create: {
        parentCompanyId: parentId,
        childCompanyId: childId,
        ownershipPct: o.ownershipPct,
        ownershipType: o.ownershipType,
        source: o.source,
        metadata: o.metadata ?? undefined,
      },
    })
    upserted++
  }
  console.log(`  Ownership links upserted: ${upserted} (skipped ${skipped} due to missing parent/child company)`)
}

async function importProperties() {
  console.log(`Importing ${properties.length} property records...`)
  let skipped = 0
  let upserted = 0
  for (const p of properties) {
    const companyId = await resolveCompanyId(p.orgNr)
    if (!companyId) {
      skipped++
      continue
    }
    const tenantId = p.tenantOrgNr ? await resolveCompanyId(p.tenantOrgNr) : null
    // Use a metadata-based synthetic key by checking existing property rows for this company
    const existing = await prisma.companyProperty.findFirst({
      where: {
        companyId,
        propertyType: p.propertyType,
        address: p.address ?? null,
        municipality: p.municipality ?? null,
      },
    })
    if (existing) {
      await prisma.companyProperty.update({
        where: { id: existing.id },
        data: {
          county: p.county,
          country: p.country ?? 'NO',
          sqMeters: p.sqMeters,
          acquiredYear: p.acquiredYear,
          selfLeased: p.selfLeased ?? false,
          tenantCompanyId: tenantId,
          source: p.source,
          metadata: p.metadata ?? undefined,
        },
      })
    } else {
      await prisma.companyProperty.create({
        data: {
          companyId,
          propertyType: p.propertyType,
          address: p.address,
          municipality: p.municipality,
          county: p.county,
          country: p.country ?? 'NO',
          sqMeters: p.sqMeters,
          acquiredYear: p.acquiredYear,
          selfLeased: p.selfLeased ?? false,
          tenantCompanyId: tenantId,
          source: p.source,
          metadata: p.metadata ?? undefined,
        },
      })
    }
    upserted++
  }
  console.log(`  Property records upserted: ${upserted} (skipped ${skipped} due to missing company)`)
}

async function importRelationships() {
  console.log(`Importing ${relationships.length} business relationships...`)
  let skipped = 0
  let upserted = 0
  for (const r of relationships) {
    const fromId = await resolveCompanyId(r.fromOrgNr)
    const toId = await resolveCompanyId(r.toOrgNr)
    if (!fromId || !toId) {
      skipped++
      continue
    }
    await prisma.businessRelationship.upsert({
      where: { fromCompanyId_toCompanyId_relationshipType: { fromCompanyId: fromId, toCompanyId: toId, relationshipType: r.relationshipType } },
      update: {
        description: r.description,
        sector: r.sector,
        estimatedValue: r.estimatedValue,
        source: r.source,
        metadata: r.metadata ?? undefined,
      },
      create: {
        fromCompanyId: fromId,
        toCompanyId: toId,
        relationshipType: r.relationshipType,
        description: r.description,
        sector: r.sector,
        estimatedValue: r.estimatedValue,
        source: r.source,
        metadata: r.metadata ?? undefined,
      },
    })
    upserted++
  }
  console.log(`  Business relationships upserted: ${upserted} (skipped ${skipped} due to missing from/to company)`)
}

// Thomas Snellman (REKO founder) as a PersonProfile
async function importPersonProfiles() {
  console.log('Importing person profiles for research round...')
  const snellmanKey = 'thomas-snellman'
  await prisma.personProfile.upsert({
    where: { personKey: snellmanKey },
    update: {
      name: 'Thomas Snellman',
      biography: 'Finsk oekologisk bonde fra Oesterbotten. Grunnla REKO (Rejaelt Konsumtion) distribusjonsringer i 2013, som har spredt seg til Sverige, Norge og Danmark. Inspirator for lokal kortkjede-distribusjon i Norden.',
      roles: [
        { companyId: null, companyName: 'REKO (Finland origin)', role: 'founder', fromYear: 2013, toYear: null },
      ],
      affiliations: ['REKO', 'Lokalmat-bevegelsen'],
      tags: ['REKO', 'founder', 'alternative-distribusjon', 'Finland', 'forskningsrunde-2026-04-20'],
      metadata: { country: 'FI', region: 'Oesterbotten' },
    },
    create: {
      name: 'Thomas Snellman',
      personKey: snellmanKey,
      biography: 'Finsk oekologisk bonde fra Oesterbotten. Grunnla REKO (Rejaelt Konsumtion) distribusjonsringer i 2013.',
      roles: [
        { companyId: null, companyName: 'REKO (Finland origin)', role: 'founder', fromYear: 2013, toYear: null },
      ],
      affiliations: ['REKO', 'Lokalmat-bevegelsen'],
      tags: ['REKO', 'founder', 'alternative-distribusjon', 'Finland', 'forskningsrunde-2026-04-20'],
      metadata: { country: 'FI', region: 'Oesterbotten' },
    },
  })
  console.log('  Thomas Snellman upserted')
}

async function main() {
  console.log('\n═══════════════════════════════════════════════════════════')
  console.log('Food Systems 2026 — Forskningsrunde 2026-04-20 Import')
  console.log('═══════════════════════════════════════════════════════════\n')

  await importCompanies()
  await importOwnership()
  await importProperties()
  await importRelationships()
  await importPersonProfiles()

  console.log('\nImport complete.')
}

main()
  .catch((e) => {
    console.error('Import failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
