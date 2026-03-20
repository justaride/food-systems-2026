import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

type OwnershipRecord = {
  parentOrgNr: string
  childOrgNr: string
  ownershipPct?: number
  ownershipType: 'subsidiary' | 'joint-venture' | 'minority-stake'
  effectiveFrom?: string
  effectiveTo?: string
  source: string
  metadata?: Record<string, unknown>
}

type RelationshipRecord = {
  fromOrgNr: string
  toOrgNr: string
  relationshipType: 'supplier' | 'buyer' | 'distributor' | 'franchisor' | 'self-dealing' | 'joint-venture'
  description?: string
  sector?: string
  estimatedValue?: number
  source?: string
  metadata?: Record<string, unknown>
}

const ownershipRecords: OwnershipRecord[] = [
  { parentOrgNr: '819731322', childOrgNr: '929228723', ownershipPct: 100, ownershipType: 'subsidiary', source: 'Brønnøysund' },
  { parentOrgNr: '819731322', childOrgNr: '914224314', ownershipPct: 46, ownershipType: 'minority-stake', source: 'Brønnøysund' },

  // --- Nordic cross-border ownership (Session 4) ---
  { parentOrgNr: '819731322', childOrgNr: 'DK-25395644', ownershipPct: 48.9, ownershipType: 'minority-stake', source: 'NorgesGruppen Credit Report 2025 / Dagrofa corporate presentation', metadata: { note: 'NorgesGruppen (NO) owns 48.9% of Dagrofa (DK). Cross-border NO→DK.' } },
  { parentOrgNr: '914526647', childOrgNr: 'DK-14705627', ownershipPct: 100, ownershipType: 'subsidiary', source: 'Reitan Retail årsrapport 2024', metadata: { note: 'Reitan Retail (NO) owns REMA 1000 A/S (DK) 100%. Cross-border NO→DK.' } },

  // --- M&A 2022-2025 (Session 9) ---

  // SalMar -> NTS/NRS/SalmoNor (completed Dec 2022, NOK 15.1B)
  { parentOrgNr: '960514718', childOrgNr: 'NO-952587687', ownershipPct: 100, ownershipType: 'subsidiary', effectiveFrom: '2022-12-29', source: 'SalMar Borsmeld. 2022-12', metadata: { dealValue: 'NOK 15.1B', dealType: 'merger', target: 'NTS ASA / Norway Royal Salmon / SalmoNor', notes: 'SalMar absorbed NTS/NRS/SalmoNor via merger, became world #2 salmon producer. EU Commission approved with conditions.' } },

  // Mowi -> Nova Sea (49% -> 95%, completed Oct 2025, NOK 7.4B for 46% stake)
  { parentOrgNr: '964118191', childOrgNr: 'NO-960507828', ownershipPct: 95, ownershipType: 'subsidiary', effectiveFrom: '2025-10-21', source: 'Mowi Borsmeld. jan 2025 / GlobeNewswire', metadata: { dealValue: 'NOK 7.4B (46% stake)', totalEquityValue: 'NOK 16.0B', dealType: 'acquisition', target: 'Nova Sea AS', notes: 'Mowi held 49% since 1995, acquired Vigner Olaisen 46% (30% shares, 70% cash). Harvest ~52k tonnes. EV/EBIT 9x.' } },

  // Axfood -> City Gross Sverige (9.9% -> 100%, completed Nov 2024, SEK 2.0B)
  { parentOrgNr: 'SE-556542-5353', childOrgNr: 'SE-556448-4498', ownershipPct: 100, ownershipType: 'subsidiary', effectiveFrom: '2024-11-01', source: 'Axfood Pressrelease 2024-10-29', metadata: { dealValue: 'SEK 2.0B', dealType: 'acquisition', target: 'City Gross Sverige AB', notes: 'Axfood acquired remaining 90.1% from Bergendahl Food Holding. 42 stores, 2800 employees.' } },

  // REMA 1000 DK -> Aldi DK stores (114 stores + 3 DCs, completed Jan 2024)
  { parentOrgNr: 'DK-14705627', childOrgNr: 'DK-ALDI-STORES', ownershipPct: 100, ownershipType: 'subsidiary', effectiveFrom: '2024-01-18', source: 'Reitan Retail / Konkurrenceradet 2024', metadata: { dealType: 'asset-acquisition', target: 'Aldi Nord DK (114 stores, 3 DCs)', notes: 'REMA 1000 acquired majority of Aldi DK. Remaining 30 stores split to Salling (13), Coop, Lidl.' } },

  // Orkla -> OFI/Rhone partnership (60/40, completed Apr 2024, NOK 2.5B for 40%)
  { parentOrgNr: '910747711', childOrgNr: 'NO-OFI-928598129', ownershipPct: 60, ownershipType: 'subsidiary', effectiveFrom: '2024-04-17', source: 'Orkla Pressrelease 2024-04-17', metadata: { dealValue: 'NOK 2.5B (40% stake)', enterpriseValue: 'NOK 15.5B', dealType: 'partial-sale', target: 'Orkla Food Ingredients AS', notes: 'Orkla sold 40% to Rhone Capital. OFI rev. NOK 18.1B. Rhone option for +9% through Mar 2027.' } },

  // Orkla -> Lilleborg divestment (100% sold Jun 2024, NOK 600M)
  { parentOrgNr: '910747711', childOrgNr: 'NO-LILLEBORG-910747703', ownershipPct: 0, ownershipType: 'subsidiary', effectiveFrom: '2024-06-12', effectiveTo: '2024-06-12', source: 'Orkla Pressrelease 2024-06', metadata: { dealValue: 'NOK 600M', dealType: 'divestment', target: 'Lilleborg AS', buyer: 'Solenis International LLC', notes: 'Orkla sold 100% of Lilleborg (B2B cleaning, market leader NO) to Solenis.' } },
]

const relationshipRecords: RelationshipRecord[] = [
  { fromOrgNr: '929228723', toOrgNr: '819731322', relationshipType: 'distributor', description: 'ASKO er grossist og distribusjonsselskap for NorgesGruppen-kjeder', sector: 'dagligvare', source: 'Årsrapport 2024' },
  { fromOrgNr: '914224314', toOrgNr: '819731322', relationshipType: 'supplier', description: 'BAMA leverer frukt og grønt til NorgesGruppen-butikker', sector: 'frukt-og-grønt', source: 'Årsrapport 2024' },
  { fromOrgNr: '988044113', toOrgNr: '964118191', relationshipType: 'supplier', description: 'Skretting leverer fiskefôr til Mowi', sector: 'akvakultur-fôr', source: 'Bransjeanalyse' },
  { fromOrgNr: '988044113', toOrgNr: '960514718', relationshipType: 'supplier', description: 'Skretting leverer fiskefôr til SalMar', sector: 'akvakultur-fôr', source: 'Bransjeanalyse' },
  { fromOrgNr: '988044113', toOrgNr: '975350940', relationshipType: 'supplier', description: 'Skretting leverer fiskefôr til Lerøy', sector: 'akvakultur-fôr', source: 'Bransjeanalyse' },
  { fromOrgNr: '986228608', toOrgNr: '911608103', relationshipType: 'supplier', description: 'Yara leverer gjødsel til Felleskjøpet for videreforhandling', sector: 'innsatsmidler', source: 'Bransjeanalyse' },
  { fromOrgNr: '938752648', toOrgNr: '819731322', relationshipType: 'supplier', description: 'Nortura leverer kjøttprodukter (Gilde, Prior) til NorgesGruppen', sector: 'kjøtt', source: 'Årsrapport 2024' },
  { fromOrgNr: '938752648', toOrgNr: '936560288', relationshipType: 'supplier', description: 'Nortura leverer kjøttprodukter (Gilde, Prior) til Coop', sector: 'kjøtt', source: 'Årsrapport 2024' },
  { fromOrgNr: '947942638', toOrgNr: '819731322', relationshipType: 'supplier', description: 'TINE leverer meieriprodukter til NorgesGruppen', sector: 'meieri', source: 'Årsrapport 2024' },
  { fromOrgNr: '947942638', toOrgNr: '936560288', relationshipType: 'supplier', description: 'TINE leverer meieriprodukter til Coop', sector: 'meieri', source: 'Årsrapport 2024' },
  { fromOrgNr: '910747711', toOrgNr: '819731322', relationshipType: 'supplier', description: 'Orkla leverer merkevarer (Grandiosa, Stabburet, etc.) til NorgesGruppen', sector: 'merkevare', source: 'Årsrapport 2024' },
  { fromOrgNr: '910747711', toOrgNr: '936560288', relationshipType: 'supplier', description: 'Orkla leverer merkevarer til Coop', sector: 'merkevare', source: 'Årsrapport 2024' },
  { fromOrgNr: '910747711', toOrgNr: '914526647', relationshipType: 'supplier', description: 'Orkla leverer merkevarer til REMA 1000 via Reitan Retail', sector: 'merkevare', source: 'Årsrapport 2024' },

  // --- Circular economy relationships (Session 8) ---
  { fromOrgNr: '917203261', toOrgNr: '819731322', relationshipType: 'buyer', description: 'Too Good To Go selger overskuddsmat fra NorgesGruppen-butikker', sector: 'matsvinn', source: 'TGTG Partnerliste 2024' },
  { fromOrgNr: '917203261', toOrgNr: '936560288', relationshipType: 'buyer', description: 'Too Good To Go selger overskuddsmat fra Coop-butikker', sector: 'matsvinn', source: 'TGTG Partnerliste 2024' },
  { fromOrgNr: '917203261', toOrgNr: '914526647', relationshipType: 'buyer', description: 'Too Good To Go selger overskuddsmat fra REMA 1000/Narvesen', sector: 'matsvinn', source: 'TGTG Partnerliste 2024' },
  { fromOrgNr: '919702974', toOrgNr: '819731322', relationshipType: 'supplier', description: 'Matsentralen mottar overskuddsmat fra NorgesGruppen for redistribusjon', sector: 'matredistribusjon', source: 'Matsentralen Årsrapport 2024' },
  { fromOrgNr: '919702974', toOrgNr: '936560288', relationshipType: 'supplier', description: 'Matsentralen mottar overskuddsmat fra Coop for redistribusjon', sector: 'matredistribusjon', source: 'Matsentralen Årsrapport 2024' },
  { fromOrgNr: '919702974', toOrgNr: '938752648', relationshipType: 'supplier', description: 'Matsentralen mottar overskuddsmat fra Nortura for redistribusjon', sector: 'matredistribusjon', source: 'Matsentralen Årsrapport 2024' },
  { fromOrgNr: '997898397', toOrgNr: '819731322', relationshipType: 'joint-venture', description: 'Matvett bransjeavtale om matsvinnreduksjon med NorgesGruppen', sector: 'bransjeavtale', source: 'Bransjeavtalen 2017-2030' },
  { fromOrgNr: '997898397', toOrgNr: '936560288', relationshipType: 'joint-venture', description: 'Matvett bransjeavtale om matsvinnreduksjon med Coop', sector: 'bransjeavtale', source: 'Bransjeavtalen 2017-2030' },
  { fromOrgNr: '997898397', toOrgNr: '914224314', relationshipType: 'joint-venture', description: 'Matvett bransjeavtale om matsvinnreduksjon med BAMA', sector: 'bransjeavtale', source: 'Bransjeavtalen 2017-2030' },
  { fromOrgNr: '989278835', toOrgNr: '938752648', relationshipType: 'supplier', description: 'Nofima leverer FoU-tjenester til Nortura innen kjøttforedling og kvalitet', sector: 'forskning', source: 'Nofima Prosjektoversikt' },

  // --- Nordic cross-border relationships (Session 4) ---
  { fromOrgNr: '914526647', toOrgNr: 'DK-14705627', relationshipType: 'franchisor', description: 'Reitan Retail (NO) er franchisor for REMA 1000 (DK) med 419 butikker i Danmark', sector: 'dagligvare', source: 'Reitan Retail Årsrapport 2024' },
  { fromOrgNr: '819731322', toOrgNr: 'DK-25395644', relationshipType: 'distributor', description: 'NorgesGruppen (NO) eier 48.9% av Dagrofa (DK) og samarbeider om innkjøp og logistikk', sector: 'dagligvare', source: 'NorgesGruppen/Dagrofa samarbeidsavtale' },
  { fromOrgNr: 'SE-556542-5353', toOrgNr: 'SE-556048-2837', relationshipType: 'buyer', description: 'Axfood og ICA Gruppen er hovedkonkurrenter i det svenske dagligvaremarkedet', sector: 'dagligvare', source: 'Konkurrensverket Rapport 2024:5', metadata: { note: 'Competitor relationship, not direct buyer-supplier. ICA ~50% + Axfood ~25% = 75% market share.' } },
  { fromOrgNr: 'FI-0116323-9', toOrgNr: 'FI-0110456-8', relationshipType: 'buyer', description: 'SOK/S Group og Kesko er duopol i finsk dagligvare (~83% samlet markedsandel)', sector: 'dagligvare', source: 'KKV FCCA 2024 / PTY', metadata: { note: 'Competitor duopoly. Both deemed dominant under Section 4a (>30% threshold).' } },
  { fromOrgNr: 'DK-36471411', toOrgNr: 'DK-36004412', relationshipType: 'buyer', description: 'Salling Group kjøpte 33 butikker fra Coop Danmark (godkjent mars 2025)', sector: 'dagligvare', source: 'KFST beslutning 26. mars 2025', metadata: { note: 'Salling Group acquired 33 stores from Coop DK, approved by DCCA.' } },
]

async function resolveCompanyId(orgNr: string): Promise<string | null> {
  const company = await prisma.company.findUnique({
    where: { orgNr },
    select: { id: true },
  })
  return company?.id ?? null
}

async function importOwnership() {
  console.log('Importing company ownership records...\n')
  let imported = 0
  let skipped = 0

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
        effectiveFrom: rec.effectiveFrom ? new Date(rec.effectiveFrom) : undefined,
        effectiveTo: rec.effectiveTo ? new Date(rec.effectiveTo) : undefined,
        source: rec.source,
        metadata: rec.metadata,
      },
      create: {
        parentCompanyId: parentId,
        childCompanyId: childId,
        ownershipPct: rec.ownershipPct,
        ownershipType: rec.ownershipType,
        effectiveFrom: rec.effectiveFrom ? new Date(rec.effectiveFrom) : undefined,
        effectiveTo: rec.effectiveTo ? new Date(rec.effectiveTo) : undefined,
        source: rec.source,
        metadata: rec.metadata,
      },
    })

    console.log(`  ${rec.parentOrgNr} → ${rec.childOrgNr} (${rec.ownershipType}${rec.ownershipPct ? `, ${rec.ownershipPct}%` : ''})`)
    imported++
  }

  console.log(`\n${imported} ownership records imported, ${skipped} skipped`)
}

async function importRelationships() {
  console.log('\nImporting business relationships...\n')
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
        estimatedValue: rec.estimatedValue,
        source: rec.source,
        metadata: rec.metadata,
      },
      create: {
        fromCompanyId: fromId,
        toCompanyId: toId,
        relationshipType: rec.relationshipType,
        description: rec.description,
        sector: rec.sector,
        estimatedValue: rec.estimatedValue,
        source: rec.source,
        metadata: rec.metadata,
      },
    })

    console.log(`  ${rec.fromOrgNr} → ${rec.toOrgNr} (${rec.relationshipType})`)
    imported++
  }

  console.log(`\n${imported} relationships imported, ${skipped} skipped`)
}

async function main() {
  await importOwnership()
  await importRelationships()
}

main()
  .catch((e) => {
    console.error('Import failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
