import 'dotenv/config'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

let errorCount = 0

function header(title: string) {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`  ${title}`)
  console.log('='.repeat(60))
}

function pass(msg: string) {
  console.log(`  ✓ ${msg}`)
}

function fail(msg: string) {
  errorCount++
  console.log(`  ✗ ${msg}`)
}

async function checkOrphanOwnerships() {
  header('1. Orphan Ownership Records')
  const ownerships = await prisma.companyOwnership.findMany()
  let orphans = 0

  for (const o of ownerships) {
    const parent = await prisma.company.findUnique({ where: { id: o.parentCompanyId } })
    if (!parent) {
      fail(`CompanyOwnership ${o.id}: parentCompanyId "${o.parentCompanyId}" not found`)
      orphans++
    }
    const child = await prisma.company.findUnique({ where: { id: o.childCompanyId } })
    if (!child) {
      fail(`CompanyOwnership ${o.id}: childCompanyId "${o.childCompanyId}" not found`)
      orphans++
    }
  }

  if (orphans === 0) pass(`All ${ownerships.length} ownership records have valid references`)
}

async function checkOrphanRelationships() {
  header('2. Orphan Relationship Records')
  const relationships = await prisma.businessRelationship.findMany()
  let orphans = 0

  for (const r of relationships) {
    const from = await prisma.company.findUnique({ where: { id: r.fromCompanyId } })
    if (!from) {
      fail(`BusinessRelationship ${r.id}: fromCompanyId "${r.fromCompanyId}" not found`)
      orphans++
    }
    const to = await prisma.company.findUnique({ where: { id: r.toCompanyId } })
    if (!to) {
      fail(`BusinessRelationship ${r.id}: toCompanyId "${r.toCompanyId}" not found`)
      orphans++
    }
  }

  if (orphans === 0) pass(`All ${relationships.length} relationship records have valid references`)
}

async function checkOrphanProperties() {
  header('3. Orphan Property Records')
  const properties = await prisma.companyProperty.findMany()
  let orphans = 0

  for (const p of properties) {
    const company = await prisma.company.findUnique({ where: { id: p.companyId } })
    if (!company) {
      fail(`CompanyProperty ${p.id}: companyId "${p.companyId}" not found`)
      orphans++
    }
  }

  if (orphans === 0) pass(`All ${properties.length} property records have valid references`)
}

async function checkOrphanBoardMembers() {
  header('4. Orphan Board Member Records')
  const members = await prisma.boardMember.findMany()
  let orphans = 0

  for (const m of members) {
    const company = await prisma.company.findUnique({ where: { id: m.companyId } })
    if (!company) {
      fail(`BoardMember ${m.id} (${m.personName}): companyId "${m.companyId}" not found`)
      orphans++
    }
  }

  if (orphans === 0) pass(`All ${members.length} board member records have valid references`)
}

async function checkPersonProfileRoles() {
  header('5. PersonProfile Role Validation')
  const profiles = await prisma.personProfile.findMany()
  let orphans = 0

  for (const p of profiles) {
    for (const roleJson of p.roles) {
      const role = roleJson as Record<string, unknown>
      if (role.companyId && typeof role.companyId === 'string') {
        const company = await prisma.company.findUnique({ where: { id: role.companyId } })
        if (!company) {
          fail(`PersonProfile "${p.name}": role companyId "${role.companyId}" (${role.companyName}) not found`)
          orphans++
        }
      }
    }
  }

  if (orphans === 0) pass(`All ${profiles.length} person profiles have valid role references`)
}

function checkCountryDataFiles() {
  header('6. Country Data Files')
  const countries = ['no', 'se', 'dk', 'fi', 'is']
  const baseDir = join(process.cwd(), 'public', 'data', 'food-systems')

  for (const code of countries) {
    const storesPath = join(baseDir, code, 'stores.json')
    const metricsPath = join(baseDir, code, 'chart-metrics.json')

    if (existsSync(storesPath)) {
      pass(`${code}/stores.json exists`)
    } else {
      console.log(`  ✗ ${code}/stores.json missing`)
    }

    if (existsSync(metricsPath)) {
      pass(`${code}/chart-metrics.json exists`)
    } else {
      console.log(`  ✗ ${code}/chart-metrics.json missing`)
    }
  }
}

function checkRetailerShares() {
  header('7. Retailer Share Validation')
  const countries = ['no', 'se', 'dk', 'fi', 'is']
  const baseDir = join(process.cwd(), 'public', 'data', 'food-systems')

  for (const code of countries) {
    const metricsPath = join(baseDir, code, 'chart-metrics.json')
    if (!existsSync(metricsPath)) continue

    const raw = readFileSync(metricsPath, 'utf-8')
    const metrics = JSON.parse(raw)
    const data = metrics?.parentCompany?.data as { value: number }[] | undefined

    if (!data || data.length === 0) {
      console.log(`  ✗ ${code}: no parentCompany.data found`)
      continue
    }

    const sum = data.reduce((acc, d) => acc + d.value, 0)
    if (Math.abs(sum - 100) <= 5) {
      pass(`${code}: market shares sum to ${sum.toFixed(1)}%`)
    } else {
      console.log(`  ✗ ${code}: market shares sum to ${sum.toFixed(1)}% (expected ~100%)`)
    }
  }
}

async function printRecordCounts() {
  header('8. Record Count Summary')

  const counts = await Promise.all([
    prisma.company.count(),
    prisma.companyFinancial.count(),
    prisma.actor.count(),
    prisma.document.count(),
    prisma.thesis.count(),
    prisma.report.count(),
    prisma.sourceDoc.count(),
    prisma.companyOwnership.count(),
    prisma.companyProperty.count(),
    prisma.businessRelationship.count(),
    prisma.countryMetric.count(),
    prisma.boardMember.count(),
    prisma.personProfile.count(),
    prisma.shareholder.count(),
    prisma.subsidy.count(),
  ])

  const labels = [
    'Company', 'CompanyFinancial', 'Actor', 'Document', 'Thesis',
    'Report', 'SourceDoc', 'CompanyOwnership', 'CompanyProperty',
    'BusinessRelationship', 'CountryMetric', 'BoardMember',
    'PersonProfile', 'Shareholder', 'Subsidy',
  ]

  const maxLen = Math.max(...labels.map(l => l.length))
  let total = 0

  for (let i = 0; i < labels.length; i++) {
    const padded = labels[i].padEnd(maxLen)
    console.log(`  ${padded}  ${counts[i]}`)
    total += counts[i]
  }

  console.log(`  ${'─'.repeat(maxLen + 8)}`)
  console.log(`  ${'Total'.padEnd(maxLen)}  ${total}`)
}

async function checkUnprofiledInterlocks() {
  header('9. Unprofiled Interlocking Directors')

  const members = await prisma.boardMember.findMany({
    select: { personKey: true, personName: true, companyId: true },
  })

  const byKey = new Map<string, { name: string; companyIds: Set<string> }>()

  for (const m of members) {
    const existing = byKey.get(m.personKey)
    if (existing) {
      existing.companyIds.add(m.companyId)
    } else {
      byKey.set(m.personKey, { name: m.personName, companyIds: new Set([m.companyId]) })
    }
  }

  const interlocking = [...byKey.entries()]
    .filter(([, v]) => v.companyIds.size >= 2)

  const profiles = await prisma.personProfile.findMany({
    select: { personKey: true },
  })
  const profileKeys = new Set(profiles.map(p => p.personKey))

  const unprofiled = interlocking.filter(([key]) => !profileKeys.has(key))

  if (unprofiled.length === 0) {
    pass('All interlocking directors have PersonProfile records')
  } else {
    console.log(`  Found ${unprofiled.length} unprofiled interlocking director(s):`)
    for (const [key, { name, companyIds }] of unprofiled) {
      console.log(`    - ${name} (${key}): ${companyIds.size} companies`)
    }
  }
}

async function checkThesisMissingUrls() {
  header('10. Thesis Missing URLs')
  const theses = await prisma.thesis.findMany({ where: { url: '' } })
  if (theses.length === 0) {
    pass('All theses have URLs')
  } else {
    fail(`${theses.length} theses have empty URLs:`)
    for (const t of theses) {
      console.log(`    - ${t.id} (${t.authors}, ${t.year})`)
    }
  }
}

async function checkReportMissingUrls() {
  header('11. Report Missing URLs')
  const reports = await prisma.report.findMany({ where: { sourceUrl: null } })
  if (reports.length === 0) {
    pass('All reports have source URLs')
  } else {
    fail(`${reports.length} reports have no source URL:`)
    for (const r of reports) {
      console.log(`    - ${r.id} (${r.title.slice(0, 50)})`)
    }
  }
}

async function checkDOICoverage() {
  header('12. Citation DOI Coverage')
  const totalTheses = await prisma.thesis.count()
  const thesesWithDoi = await prisma.thesis.count({ where: { doi: { not: null } } })
  const totalReports = await prisma.report.count()
  const reportsWithDoi = await prisma.report.count({ where: { doi: { not: null } } })
  const totalSources = await prisma.sourceDoc.count({ where: { isDuplicate: false } })
  const sourcesWithDoi = await prisma.sourceDoc.count({ where: { doi: { not: null }, isDuplicate: false } })

  const thesisPct = totalTheses ? ((thesesWithDoi / totalTheses) * 100).toFixed(1) : '0'
  const reportPct = totalReports ? ((reportsWithDoi / totalReports) * 100).toFixed(1) : '0'
  const sourcePct = totalSources ? ((sourcesWithDoi / totalSources) * 100).toFixed(1) : '0'

  pass(`Theses: ${thesesWithDoi}/${totalTheses} (${thesisPct}%) have DOI/persistent ID`)
  pass(`Reports: ${reportsWithDoi}/${totalReports} (${reportPct}%) have DOI`)
  pass(`Sources: ${sourcesWithDoi}/${totalSources} (${sourcePct}%) have DOI`)

  const thesesWithPub = await prisma.thesis.count({ where: { publisher: { not: null } } })
  const reportsWithPub = await prisma.report.count({ where: { publisher: { not: null } } })
  const thPubPct = totalTheses ? ((thesesWithPub / totalTheses) * 100).toFixed(1) : '0'
  const rPubPct = totalReports ? ((reportsWithPub / totalReports) * 100).toFixed(1) : '0'
  pass(`Theses: ${thesesWithPub}/${totalTheses} (${thPubPct}%) have publisher`)
  pass(`Reports: ${reportsWithPub}/${totalReports} (${rPubPct}%) have publisher`)
}

async function main() {
  console.log('Food Systems 2026 — Data Integrity Check')
  console.log(`Run at: ${new Date().toISOString()}`)

  await checkOrphanOwnerships()
  await checkOrphanRelationships()
  await checkOrphanProperties()
  await checkOrphanBoardMembers()
  await checkPersonProfileRoles()
  checkCountryDataFiles()
  checkRetailerShares()
  await printRecordCounts()
  await checkUnprofiledInterlocks()
  await checkThesisMissingUrls()
  await checkReportMissingUrls()
  await checkDOICoverage()

  header('Summary')
  if (errorCount > 0) {
    console.log(`  ${errorCount} referential integrity violation(s) found`)
  } else {
    console.log('  All referential integrity checks passed')
  }

  return errorCount
}

main()
  .then(errors => {
    prisma.$disconnect()
    process.exit(errors > 0 ? 1 : 0)
  })
  .catch(e => {
    console.error('Verification failed:', e)
    prisma.$disconnect()
    process.exit(1)
  })
