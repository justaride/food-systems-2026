import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

type OrgNrFix = {
  oldOrgNr: string
  newOrgNr: string
  name?: string
  legalForm?: string
}

const fixes: OrgNrFix[] = [
  // --- Denmark (verified via proff.dk / cvrapi.dk) ---
  { oldOrgNr: 'DK-36471411', newOrgNr: 'DK-35954716' },
  { oldOrgNr: 'DK-36004412', newOrgNr: 'DK-26259495' },
  { oldOrgNr: 'DK-25395644', newOrgNr: 'DK-38714295', name: 'Dagrofa ApS', legalForm: 'ApS' },
  { oldOrgNr: 'DK-29215079', newOrgNr: 'DK-29783535' },

  // --- Finland (verified via kauppalehti.fi / proff.fi / finder.fi) ---
  { oldOrgNr: 'FI-0944086-0', newOrgNr: 'FI-0697627-4' },
  { oldOrgNr: 'FI-1922768-5', newOrgNr: 'FI-2449777-9' },
  { oldOrgNr: 'FI-1804478-1', newOrgNr: 'FI-0777402-5' },

  // --- Iceland (verified via keldan.is) ---
  { oldOrgNr: 'IS-510199-2859', newOrgNr: 'IS-670203-2120' },
  { oldOrgNr: 'IS-640907-1670', newOrgNr: 'IS-571298-3769' },
  { oldOrgNr: 'IS-510298-3199', newOrgNr: 'IS-540206-2010' },
  { oldOrgNr: 'IS-620390-0229', newOrgNr: 'IS-450199-3389' },
  { oldOrgNr: 'IS-560269-4449', newOrgNr: 'IS-430698-3549' },
  { oldOrgNr: 'IS-660269-3079', newOrgNr: 'IS-500269-3249', name: 'Oliverzlun Islands ehf' },
  { oldOrgNr: 'IS-510203-1530', newOrgNr: 'IS-711298-2239' },
  { oldOrgNr: 'IS-691008-0550', newOrgNr: 'IS-411003-3370' },

  // --- Sweden (verified via allabolag.se) ---
  { oldOrgNr: 'SE-556070-3166', newOrgNr: 'SE-556004-7903', name: 'Dagab Inkop & Logistik AB' },
  { oldOrgNr: 'SE-556448-4498', newOrgNr: 'SE-556597-2451', name: 'City Gross Sverige AB' },
]

async function fixOrgNumbers() {
  console.log('=== Fixing Nordic orgNr ===\n')
  let fixed = 0
  let skipped = 0

  for (const f of fixes) {
    const company = await prisma.company.findUnique({ where: { orgNr: f.oldOrgNr } })
    if (!company) {
      console.log(`  SKIP: ${f.oldOrgNr} not found in DB`)
      skipped++
      continue
    }

    const existing = await prisma.company.findUnique({ where: { orgNr: f.newOrgNr } })
    if (existing) {
      console.log(`  CONFLICT: ${f.newOrgNr} already exists (${existing.name}). Skipping ${company.name}.`)
      skipped++
      continue
    }

    const updateData: Record<string, string> = { orgNr: f.newOrgNr }
    if (f.name) updateData.name = f.name
    if (f.legalForm) updateData.legalForm = f.legalForm

    await prisma.company.update({
      where: { orgNr: f.oldOrgNr },
      data: updateData,
    })

    const nameChange = f.name ? ` (renamed to ${f.name})` : ''
    console.log(`  ${company.name}: ${f.oldOrgNr} -> ${f.newOrgNr}${nameChange}`)
    fixed++
  }
  console.log(`\n${fixed} fixed, ${skipped} skipped`)
}

async function removeNettoIceland() {
  console.log('\n=== Removing Netto Iceland (not a separate entity) ===\n')
  const netto = await prisma.company.findUnique({ where: { orgNr: 'IS-530189-0349' } })
  if (!netto) {
    console.log('  Netto Iceland not found — already removed or ID already fixed')
    return
  }

  await prisma.companyOwnership.deleteMany({ where: { OR: [{ parentCompanyId: netto.id }, { childCompanyId: netto.id }] } })
  await prisma.businessRelationship.deleteMany({ where: { OR: [{ fromCompanyId: netto.id }, { toCompanyId: netto.id }] } })
  await prisma.company.delete({ where: { orgNr: 'IS-530189-0349' } })
  console.log('  Deleted Netto Iceland ehf (brand under Samkaup, not separate entity)')
}

async function addCityGross() {
  console.log('\n=== Adding City Gross Sverige AB ===\n')
  const cityGross = await prisma.company.upsert({
    where: { orgNr: 'SE-556597-2451' },
    update: {
      name: 'City Gross Sverige AB',
      country: 'SE',
      legalForm: 'AB',
      founded: 2000,
      hqCity: 'Hässleholm',
      hqAddress: 'Industrigatan 22',
      employees: 1871,
      ownershipType: 'listed',
      valueChainStage: 'retail',
      naceCode: '47.110',
      naceDescription: 'Detaljhandel med livsmedel',
    },
    create: {
      name: 'City Gross Sverige AB',
      orgNr: 'SE-556597-2451',
      country: 'SE',
      legalForm: 'AB',
      founded: 2000,
      hqCity: 'Hässleholm',
      hqAddress: 'Industrigatan 22',
      employees: 1871,
      ownershipType: 'listed',
      valueChainStage: 'retail',
      naceCode: '47.110',
      naceDescription: 'Detaljhandel med livsmedel',
    },
  })
  console.log(`  City Gross Sverige AB (SE-556597-2451)`)

  await prisma.companyFinancial.upsert({
    where: { companyId_year: { companyId: cityGross.id, year: 2025 } },
    update: {
      revenueNok: 8898,
      operatingResult: -192,
      operatingMargin: -2.2,
      groupEmployees: 1871,
      source: 'Axfood City Gross key figures 2025. SEK 8,898M net sales; SEK -192M operating profit; 1 SEK ≈ 1.00 NOK',
    },
    create: {
      companyId: cityGross.id,
      year: 2025,
      revenueNok: 8898,
      operatingResult: -192,
      operatingMargin: -2.2,
      groupEmployees: 1871,
      source: 'Axfood City Gross key figures 2025. SEK 8,898M net sales; SEK -192M operating profit; 1 SEK ≈ 1.00 NOK',
    },
  })
  console.log('  2025 key figures')

  const axfood = await prisma.company.findUnique({ where: { orgNr: 'SE-556542-5353' }, select: { id: true } })
  if (axfood) {
    await prisma.companyOwnership.upsert({
      where: { parentCompanyId_childCompanyId: { parentCompanyId: axfood.id, childCompanyId: cityGross.id } },
      update: { ownershipPct: 100, ownershipType: 'subsidiary', source: 'Axfood forvarvade City Gross nov 2024, godkant av EU-kommissionen' },
      create: { parentCompanyId: axfood.id, childCompanyId: cityGross.id, ownershipPct: 100, ownershipType: 'subsidiary', source: 'Axfood forvarvade City Gross nov 2024, godkant av EU-kommissionen' },
    })
    console.log('  Axfood -> City Gross (100%)')
  }
}

async function main() {
  console.log('==========================================')
  console.log('  Nordic orgNr correction migration')
  console.log('  17 ID fixes + 1 removal + 1 addition')
  console.log('==========================================\n')

  await fixOrgNumbers()
  await removeNettoIceland()
  await addCityGross()

  console.log('\n========== POST-MIGRATION COUNTS ==========')
  console.log('Companies:', await prisma.company.count())
  console.log('CompanyOwnership:', await prisma.companyOwnership.count())
  console.log('BusinessRelationship:', await prisma.businessRelationship.count())
  console.log('============================================')
}

main().catch(e => { console.error('Migration failed:', e); process.exit(1) }).finally(() => prisma.$disconnect())
