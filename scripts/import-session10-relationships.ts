import 'dotenv/config'
import { canonicalPersonKey as normalizePersonKey } from '../src/lib/person-key'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

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

type RelationshipRecord = {
  fromOrgNr: string
  toOrgNr: string
  relationshipType: 'supplier' | 'buyer' | 'distributor' | 'franchisor' | 'self-dealing' | 'joint-venture'
  description?: string
  sector?: string
  source?: string
}

// ─── Existing orgNr constants ───────────────────────────────────────
const NG = '819731322'        // NorgesGruppen ASA
const COOP = '936560288'      // Coop Norge SA
const REMA = '914526647'      // Reitan Retail / REMA 1000
const ASKO = '929228723'      // ASKO Norge AS
const NORTURA = '938752648'   // Nortura SA
const TINE = '947942638'      // TINE SA
const FK = '911608103'        // Felleskjøpet Agri SA
const YARA = '986228608'      // Yara International ASA
const LEROY = '975350940'     // Lerøy Seafood Group ASA
const MOWI = '964118191'      // Mowi ASA
const BAMA = '914224314'      // BAMA Gruppen AS
const GARTNERHALLEN = '945958405' // Gartnerhallen SA
const UNIL = '885316522'      // Unil AS
const SG = '933444724'        // Servicegrossistene AS
const REMA_DIST = '894759372' // REMA Distribusjon Norge AS

// ─── New orgNr constants ────────────────────────────────────────────
const BAKEHUSET = '914183332'
const RINGNES = '914670705'
const HANSA_BORG = '876862522'
const POSTEN_BRING = '984661185'
const ODA = '912262510'
const DENOFA = '987643935'

// ─── New Companies ──────────────────────────────────────────────────

const newCompanies: NewCompany[] = [
  {
    name: 'Bakehuset AS',
    orgNr: BAKEHUSET,
    legalForm: 'AS',
    founded: 1930,
    naceCode: '10.710',
    naceDescription: 'Produksjon av brød og ferske konditorvarer',
    hqAddress: 'Eikenga 19',
    hqCity: 'Oslo',
    employees: 1004,
    ownershipType: 'foreign',
    valueChainStage: 'processing',
    shareholders: [
      { name: 'Lantmännen Unibake (Sverige)', ownershipPct: 100, shareholderType: 'foreign', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Øyvind Andersen', role: 'styreleder' },
      { personName: 'Øystein Halvorsen', role: 'CEO' },
      { personName: 'Geir Alsaker', role: 'styremedlem' },
      { personName: 'Roar Bakkejord', role: 'styremedlem' },
    ],
  },
  {
    name: 'Ringnes AS',
    orgNr: RINGNES,
    legalForm: 'AS',
    founded: 1918,
    naceCode: '11.050',
    naceDescription: 'Produksjon av øl',
    hqAddress: 'Thorvald Meyers gate 2',
    hqCity: 'Oslo',
    employees: 318,
    ownershipType: 'foreign',
    valueChainStage: 'processing',
    shareholders: [
      { name: 'Carlsberg Breweries A/S (Danmark)', ownershipPct: 100, shareholderType: 'foreign', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Søren Brinck', role: 'styreleder' },
      { personName: 'Marianne Ribe', role: 'CEO' },
      { personName: 'Christian Hay', role: 'styremedlem' },
      { personName: 'Anna Cecilia Lundgren', role: 'styremedlem' },
    ],
  },
  {
    name: 'Hansa Borg AS',
    orgNr: HANSA_BORG,
    legalForm: 'AS',
    founded: 1996,
    naceCode: '11.050',
    naceDescription: 'Produksjon av øl',
    hqAddress: 'Kokstaddalen 3',
    hqCity: 'Bergen',
    employees: 330,
    ownershipType: 'foreign',
    valueChainStage: 'processing',
    shareholders: [
      { name: 'Royal Unibrew A/S (Danmark)', ownershipPct: 100, shareholderType: 'foreign', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Kalle Oskari Järvinen', role: 'styreleder' },
      { personName: 'Jeanette Fladby', role: 'CEO' },
      { personName: 'Helge Einar Gjøen', role: 'styremedlem' },
      { personName: 'Einar Schmidt', role: 'styremedlem' },
    ],
  },
  {
    name: 'Posten Bring AS',
    orgNr: POSTEN_BRING,
    legalForm: 'AS',
    founded: 2002,
    naceCode: '53.100',
    naceDescription: 'Landsdekkende posttjenester',
    hqAddress: 'Biskop Gunnerus gate 14A',
    hqCity: 'Oslo',
    employees: 10407,
    ownershipType: 'state',
    valueChainStage: 'logistics',
    shareholders: [
      { name: 'Posten Norge AS (staten)', ownershipPct: 100, shareholderType: 'state', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Pål Wibe', role: 'styreleder' },
      { personName: 'Petter-Børre Furberg', role: 'CEO' },
      { personName: 'Ann Elisabeth Wirgeness', role: 'styremedlem' },
      { personName: 'Finn Kinserdal', role: 'styremedlem' },
    ],
  },
  {
    name: 'Oda Norway AS',
    orgNr: ODA,
    legalForm: 'AS',
    founded: 2013,
    naceCode: '47.911',
    naceDescription: 'Postordre-/Internetthandel med bredt vareutvalg',
    hqAddress: 'Kjølberggata 31',
    hqCity: 'Oslo',
    employees: 1098,
    ownershipType: 'listed',
    valueChainStage: 'retail',
    shareholders: [
      { name: 'SoftBank Vision Fund m.fl.', ownershipPct: undefined, shareholderType: 'institutional', isControlling: false },
      { name: 'Kinnevik AB', ownershipPct: undefined, shareholderType: 'institutional', isControlling: false },
    ],
    boardMembers: [
      { personName: 'Andre Rolf Knüppel', role: 'styreleder' },
      { personName: 'Carl-Fredrik Bergan', role: 'styremedlem' },
      { personName: 'Sara Elisabet Manne', role: 'styremedlem' },
    ],
  },
  {
    name: 'Denofa AS',
    orgNr: DENOFA,
    legalForm: 'AS',
    founded: 2004,
    naceCode: '10.412',
    naceDescription: 'Produksjon av andre uraffinerte oljer og fett',
    hqAddress: 'Øraveien 15B',
    hqCity: 'Fredrikstad',
    employees: 82,
    ownershipType: 'foreign',
    valueChainStage: 'processing',
    shareholders: [
      { name: 'AMAGGI Importação e Exportação Ltda (Brasil)', ownershipPct: 100, shareholderType: 'foreign', isControlling: true },
    ],
    boardMembers: [
      { personName: 'Judiney Carvalho De Souza', role: 'styreleder' },
      { personName: 'Hans Petter Olsen', role: 'CEO' },
      { personName: 'Dante Pozzi', role: 'styremedlem' },
      { personName: 'Per Cato Jansen', role: 'styremedlem' },
    ],
  },
]

// ─── Business Relationships ─────────────────────────────────────────

const relationshipRecords: RelationshipRecord[] = [
  // ─── 1. ASKO distribution (NorgesGruppen wholesaler → chain) ──────
  { fromOrgNr: ASKO, toOrgNr: NG, relationshipType: 'distributor', description: 'ASKO Norge er grossist og distribuerer til NorgesGruppen-kjeder', sector: 'dagligvare', source: 'asko.no' },

  // ─── 2. Coop logistics (self-dealing within Coop system) ──────────
  { fromOrgNr: COOP, toOrgNr: COOP, relationshipType: 'self-dealing', description: 'Coop Norge Handel (del av Coop SA) distribuerer varer til Coop-samvirkelagene', sector: 'dagligvare-logistikk', source: 'coop.no' },

  // ─── 3. Bakery suppliers ──────────────────────────────────────────
  { fromOrgNr: BAKEHUSET, toOrgNr: NG, relationshipType: 'supplier', description: 'Bakehuset leverer brød og bakerivarer til NorgesGruppen', sector: 'bakeri', source: 'Bransjedata' },
  { fromOrgNr: BAKEHUSET, toOrgNr: COOP, relationshipType: 'supplier', description: 'Bakehuset leverer brød og bakerivarer til Coop Norge', sector: 'bakeri', source: 'Bransjedata' },
  { fromOrgNr: BAKEHUSET, toOrgNr: REMA, relationshipType: 'supplier', description: 'Bakehuset leverer brød og bakerivarer til REMA 1000', sector: 'bakeri', source: 'Bransjedata' },

  // ─── 4. Beverage suppliers — Ringnes ──────────────────────────────
  { fromOrgNr: RINGNES, toOrgNr: NG, relationshipType: 'supplier', description: 'Ringnes leverer øl, brus og mineralvann til NorgesGruppen', sector: 'bryggeri', source: 'Bransjedata' },
  { fromOrgNr: RINGNES, toOrgNr: COOP, relationshipType: 'supplier', description: 'Ringnes leverer øl, brus og mineralvann til Coop Norge', sector: 'bryggeri', source: 'Bransjedata' },
  { fromOrgNr: RINGNES, toOrgNr: REMA, relationshipType: 'supplier', description: 'Ringnes leverer øl, brus og mineralvann til REMA 1000', sector: 'bryggeri', source: 'Bransjedata' },

  // ─── 4b. Beverage suppliers — Hansa Borg ──────────────────────────
  { fromOrgNr: HANSA_BORG, toOrgNr: NG, relationshipType: 'supplier', description: 'Hansa Borg leverer øl, brus og vann til NorgesGruppen', sector: 'bryggeri', source: 'Bransjedata' },
  { fromOrgNr: HANSA_BORG, toOrgNr: COOP, relationshipType: 'supplier', description: 'Hansa Borg leverer øl, brus og vann til Coop Norge', sector: 'bryggeri', source: 'Bransjedata' },
  { fromOrgNr: HANSA_BORG, toOrgNr: REMA, relationshipType: 'supplier', description: 'Hansa Borg leverer øl, brus og vann til REMA 1000', sector: 'bryggeri', source: 'Bransjedata' },

  // ─── 5. Private label / EMV manufacturing ─────────────────────────
  { fromOrgNr: NORTURA, toOrgNr: NG, relationshipType: 'self-dealing', description: 'Nortura produserer EMV kjøttvarer (Jacobs Utvalgte) for NorgesGruppen', sector: 'EMV-kjøtt', source: 'Dagligvaretilsynet / Bransjedata' },
  { fromOrgNr: TINE, toOrgNr: COOP, relationshipType: 'self-dealing', description: 'TINE produserer EMV meieriprodukter for Coop Norge', sector: 'EMV-meieri', source: 'Dagligvaretilsynet / Bransjedata' },

  // ─── 6. Seafood domestic supply ───────────────────────────────────
  { fromOrgNr: LEROY, toOrgNr: NG, relationshipType: 'supplier', description: 'Lerøy leverer sjømat til NorgesGruppen (NorgesGruppen eier 50% av Lerøy-distribusjonen)', sector: 'sjømat', source: 'Lerøy årsrapport' },
  { fromOrgNr: LEROY, toOrgNr: COOP, relationshipType: 'supplier', description: 'Lerøy leverer sjømat til Coop Norge', sector: 'sjømat', source: 'Bransjedata' },
  { fromOrgNr: MOWI, toOrgNr: NG, relationshipType: 'supplier', description: 'Mowi leverer laks og sjømat til NorgesGruppen', sector: 'sjømat', source: 'Bransjedata' },
  { fromOrgNr: MOWI, toOrgNr: COOP, relationshipType: 'supplier', description: 'Mowi leverer laks og sjømat til Coop Norge', sector: 'sjømat', source: 'Bransjedata' },

  // ─── 7. HORECA / Foodservice wholesale ────────────────────────────
  { fromOrgNr: SG, toOrgNr: NG, relationshipType: 'distributor', description: 'Servicegrossistene distribuerer til storhusholdning, NorgesGruppen-eid', sector: 'foodservice', source: 'servicegrossistene.no' },
  { fromOrgNr: ASKO, toOrgNr: SG, relationshipType: 'distributor', description: 'ASKO Storkjøkken (del av ASKO) leverer til foodservice-kunder', sector: 'foodservice', source: 'asko.no' },

  // ─── 8. Import chains ─────────────────────────────────────────────
  { fromOrgNr: UNIL, toOrgNr: NG, relationshipType: 'self-dealing', description: 'Unil er NorgesGruppens importselskap for egne merkevarer og internasjonale varer', sector: 'import-EMV', source: 'unil.no / NorgesGruppen årsrapport' },
  { fromOrgNr: COOP, toOrgNr: COOP, relationshipType: 'self-dealing', description: 'Coop Norge Handel importerer internasjonale varer og EMV for Coop-systemet', sector: 'import-EMV', source: 'coop.no' },

  // ─── 9. Logistics subcontracting ──────────────────────────────────
  { fromOrgNr: REMA_DIST, toOrgNr: POSTEN_BRING, relationshipType: 'buyer', description: 'REMA Distribusjon bruker Bring for siste-mil-levering i grisgrendte strøk', sector: 'logistikk', source: 'Bransjedata' },
  { fromOrgNr: POSTEN_BRING, toOrgNr: REMA_DIST, relationshipType: 'supplier', description: 'Bring leverer logistikktjenester til REMA Distribusjon', sector: 'logistikk', source: 'Bransjedata' },

  // ─── 10. Technology/digital retail ────────────────────────────────
  { fromOrgNr: TINE, toOrgNr: ODA, relationshipType: 'supplier', description: 'TINE leverer meieriprodukter til Oda Norway', sector: 'meieri', source: 'Bransjedata' },
  { fromOrgNr: NORTURA, toOrgNr: ODA, relationshipType: 'supplier', description: 'Nortura leverer kjøttprodukter til Oda Norway', sector: 'kjøtt', source: 'Bransjedata' },
  { fromOrgNr: RINGNES, toOrgNr: ODA, relationshipType: 'supplier', description: 'Ringnes leverer drikkevarer til Oda Norway', sector: 'bryggeri', source: 'Bransjedata' },
  { fromOrgNr: BAKEHUSET, toOrgNr: ODA, relationshipType: 'supplier', description: 'Bakehuset leverer bakerivarer til Oda Norway', sector: 'bakeri', source: 'Bransjedata' },

  // ─── 11. Agricultural inputs ──────────────────────────────────────
  { fromOrgNr: FK, toOrgNr: TINE, relationshipType: 'supplier', description: 'Felleskjøpet leverer kraftfôr til TINE-bønder (melkeprodusenter)', sector: 'kraftfôr', source: 'Felleskjøpet / TINE' },
  { fromOrgNr: YARA, toOrgNr: GARTNERHALLEN, relationshipType: 'supplier', description: 'Yara leverer gjødsel til Gartnerhallen-produsenters grønnsakdyrking', sector: 'gjødsel', source: 'Bransjedata' },

  // ─── 12. Denofa soya chain ────────────────────────────────────────
  { fromOrgNr: DENOFA, toOrgNr: FK, relationshipType: 'supplier', description: 'Denofa leverer soyamel til Felleskjøpets fôrproduksjon', sector: 'soyamel-fôr', source: 'Denofa/Felleskjøpet' },
  { fromOrgNr: DENOFA, toOrgNr: NORTURA, relationshipType: 'supplier', description: 'Denofa leverer soyamel indirekte til Nortura via fôrkjeden', sector: 'soyamel-fôr', source: 'Bransjedata' },

  // ─── 13. Cross-chain beverage distribution ────────────────────────
  { fromOrgNr: RINGNES, toOrgNr: SG, relationshipType: 'supplier', description: 'Ringnes leverer drikkevarer til Servicegrossistene (foodservice)', sector: 'bryggeri-foodservice', source: 'Bransjedata' },
  { fromOrgNr: HANSA_BORG, toOrgNr: SG, relationshipType: 'supplier', description: 'Hansa Borg leverer drikkevarer til Servicegrossistene (foodservice)', sector: 'bryggeri-foodservice', source: 'Bransjedata' },

  // ─── 14. BAMA → Oda (fresh produce to digital retail) ─────────────
  { fromOrgNr: BAMA, toOrgNr: ODA, relationshipType: 'distributor', description: 'BAMA distribuerer frukt og grønt til Oda Norway', sector: 'frukt-grønt', source: 'Bransjedata' },

  // ─── 15. Posten Bring → ASKO (logistics partnership) ──────────────
  { fromOrgNr: POSTEN_BRING, toOrgNr: ASKO, relationshipType: 'supplier', description: 'Bring leverer transporttjenester til ASKOs distribusjon', sector: 'logistikk', source: 'Bransjedata' },

  // ─── 16. Oda sourcing from Unil ───────────────────────────────────
  { fromOrgNr: UNIL, toOrgNr: ODA, relationshipType: 'supplier', description: 'Unil leverer utvalgte EMV-produkter til Oda Norway', sector: 'import-EMV', source: 'Bransjedata' },

  // ─── 17. Denofa → BAMA (vegetable oils for processing) ────────────
  { fromOrgNr: DENOFA, toOrgNr: BAMA, relationshipType: 'supplier', description: 'Denofa leverer vegetabilsk olje til BAMAs foredlingsledd', sector: 'vegetabilsk-olje', source: 'Bransjedata' },

  // ─── 18. Gartnerhallen → Coop (fresh produce) ─────────────────────
  { fromOrgNr: GARTNERHALLEN, toOrgNr: COOP, relationshipType: 'supplier', description: 'Gartnerhallen leverer norsk frukt og grønt til Coop via BAMA', sector: 'frukt-grønt', source: 'gartnerhallen.no' },

  // ─── 19. Gartnerhallen → REMA (fresh produce) ─────────────────────
  { fromOrgNr: GARTNERHALLEN, toOrgNr: REMA, relationshipType: 'supplier', description: 'Gartnerhallen leverer norsk frukt og grønt til REMA 1000 via BAMA', sector: 'frukt-grønt', source: 'gartnerhallen.no' },

  // ─── 20. Bakehuset to foodservice ─────────────────────────────────
  { fromOrgNr: BAKEHUSET, toOrgNr: SG, relationshipType: 'supplier', description: 'Bakehuset leverer bakerivarer til Servicegrossistene (storhusholdning)', sector: 'bakeri-foodservice', source: 'Bransjedata' },
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
  console.log('Importing Session 10 new companies...\n')
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

async function importRelationships() {
  console.log('\nImporting Session 10 business relationships...\n')
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
  console.log('═══ Session 10: Extended Business Relationships ═══\n')

  await importNewCompanies()
  await importRelationships()

  console.log('\n═══ Session 10 Summary ═══')
  console.log('Companies:', await prisma.company.count())
  console.log('Relationships:', await prisma.businessRelationship.count())
}

main()
  .catch((e) => {
    console.error('Session 10 import failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
