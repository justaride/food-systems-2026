import 'dotenv/config'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { reports as seedReports } from '../src/lib/data/reports'
import type { Report, ReportSupportingSource } from '../src/lib/types'

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

function warn(msg: string) {
  console.log(`  ! ${msg}`)
}

const seedReportsById = new Map(seedReports.map(report => [report.id, report]))

function supportingSourceIsResolvable(source: ReportSupportingSource) {
  if (source.url) return true

  if (source.reportId) {
    const report = seedReportsById.get(source.reportId)
    return Boolean(report?.sourceUrl)
  }

  if (source.documentPath) {
    return existsSync(join(process.cwd(), source.documentPath))
  }

  return false
}

function hasResolvableSupportingSource(report: Report) {
  return report.supportingSources?.some(supportingSourceIsResolvable) ?? false
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

async function checkOrphanActorRelationships() {
  header('5a. Orphan ActorRelationship Records')
  const relationships = await prisma.actorRelationship.findMany()
  let orphans = 0

  for (const r of relationships) {
    const from = await prisma.actor.findUnique({ where: { id: r.fromActorId } })
    if (!from) {
      fail(`ActorRelationship ${r.id}: fromActorId "${r.fromActorId}" not found`)
      orphans++
    }
    const to = await prisma.actor.findUnique({ where: { id: r.toActorId } })
    if (!to) {
      fail(`ActorRelationship ${r.id}: toActorId "${r.toActorId}" not found`)
      orphans++
    }
  }

  if (orphans === 0) pass(`All ${relationships.length} actor-relationship records have valid references`)
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
    prisma.actorRelationship.count(),
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
    'Company', 'CompanyFinancial', 'Actor', 'ActorRelationship', 'Document',
    'Thesis', 'Report', 'SourceDoc', 'CompanyOwnership', 'CompanyProperty',
    'BusinessRelationship', 'CountryMetric', 'BoardMember',
    'PersonProfile', 'Shareholder', 'Subsidy',
  ]

  const maxLen = Math.max(...labels.map(l => l.length))
  let total = 0
  let emptyCount = 0

  for (let i = 0; i < labels.length; i++) {
    const padded = labels[i].padEnd(maxLen)
    const count = counts[i]
    const marker = count === 0 ? '  ⚠ TOM' : ''
    if (count === 0) emptyCount++
    console.log(`  ${padded}  ${String(count).padStart(6)}${marker}`)
    total += count
  }

  console.log(`  ${'─'.repeat(maxLen + 10)}`)
  console.log(`  ${'Total'.padEnd(maxLen)}  ${String(total).padStart(6)}`)

  if (emptyCount > 0) {
    console.log(`\n  ⚠ ${emptyCount} model(s) are empty — may need import run`)
  }
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
  const reports = await prisma.report.findMany({
    where: { sourceUrl: null },
    select: { id: true, title: true },
  })

  const unresolved: typeof reports = []
  const classified: Array<{ id: string; title: string; provenanceType: string }> = []

  for (const report of reports) {
    const seedReport = seedReportsById.get(report.id)

    if (seedReport?.sourceUrl) {
      unresolved.push(report)
      continue
    }

    if (!seedReport?.provenanceType) {
      unresolved.push(report)
      continue
    }

    if (seedReport.provenanceType === 'external_report' || seedReport.provenanceType === 'external_article') {
      unresolved.push(report)
      continue
    }

    if (!hasResolvableSupportingSource(seedReport)) {
      unresolved.push(report)
      continue
    }

    classified.push({
      id: report.id,
      title: report.title,
      provenanceType: seedReport.provenanceType,
    })
  }

  if (unresolved.length === 0) {
    pass('All external reports have source URLs or explicit provenance classification')
  } else {
    fail(`${unresolved.length} reports still need a source URL or provenance classification:`)
    for (const r of unresolved) {
      console.log(`    - ${r.id} (${r.title.slice(0, 50)})`)
    }
  }

  if (classified.length > 0) {
    warn(`${classified.length} reports intentionally have no single source URL:`)
    for (const r of classified) {
      console.log(`    - ${r.id} [${r.provenanceType}] (${r.title.slice(0, 50)})`)
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
  await checkOrphanActorRelationships()
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
