import 'dotenv/config'
import { existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { reports as seedReports } from '../prisma/seed-data/reports'
import type { Report, ReportSupportingSource } from '../src/lib/types'
import { candidateLocalFilePaths } from '../src/lib/local-file-locator'
import {
  sourceCoveragePct,
  summarizeSourceRows,
  type SourceRow,
} from '../src/lib/source-quality-audit'
import {
  resolveAquacultureApplicationSourceLocator,
  resolveAquacultureSiteSourceLocator,
  resolveBusinessRelationshipSourceLocator,
  resolveCompanyFinancialSourceLocator,
  resolveCompanyOwnershipSourceLocator,
  resolveCompanyPropertySourceLocator,
  resolveCountryMetricSourceLocator,
  resolveDeliveryVolumeSourceLocator,
  resolveShareholderSourceLocator,
  resolveSubsidySourceLocator,
} from '../src/lib/row-source-locators'
import {
  auditCitationCoverage,
  formatCitationAuditSummary,
} from '../src/lib/citations/citation-audit'
import { hasDocumentLocator } from '../src/lib/document-locator-coverage'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

let errorCount = 0
const strictSourceAudit = process.argv.slice(2).includes('--strict-sources')

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

function sourceAuditIssue(msg: string) {
  if (strictSourceAudit) fail(msg)
  else warn(msg)
}

const seedReportsById = new Map(seedReports.map(report => [report.id, report]))

function supportingSourceIsResolvable(source: ReportSupportingSource) {
  if (source.url) return true

  if (source.reportId) {
    const report = seedReportsById.get(source.reportId)
    return Boolean(report?.sourceUrl)
  }

  if (source.documentPath) {
    return candidateLocalFilePaths(source.documentPath).some((path) => existsSync(path))
  }

  return false
}

function hasResolvableSupportingSource(report: Report) {
  return report.supportingSources?.some(supportingSourceIsResolvable) ?? false
}

// A report is a reviewed provenance exception (internal_synthesis / composite_source /
// internal_register / blocked_source, etc.) when it carries an explicit, non-external
// provenanceType and at least one resolvable supporting source. Shared by the report-URL
// check (#11) and the Document locator check (#13) so the two gates cannot drift: a
// Document whose linked report qualifies here is not a strict external-citation blocker.
function reportQualifiesAsProvenanceException(reportId: string | null | undefined): boolean {
  if (!reportId) return false
  const seedReport = seedReportsById.get(reportId)
  if (!seedReport) return false
  if (seedReport.sourceUrl) return false
  if (!seedReport.provenanceType) return false
  if (seedReport.provenanceType === 'external_report' || seedReport.provenanceType === 'external_article') {
    return false
  }
  return hasResolvableSupportingSource(seedReport)
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
    if (!reportQualifiesAsProvenanceException(report.id)) {
      unresolved.push(report)
      continue
    }

    classified.push({
      id: report.id,
      title: report.title,
      provenanceType: seedReportsById.get(report.id)!.provenanceType!,
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

function printSourceSummary(summary: ReturnType<typeof summarizeSourceRows>) {
  const sourced = summary.directLocator + summary.resolvedLocator + summary.labelOnly
  const locatable = summary.directLocator + summary.resolvedLocator
  pass(
    `${summary.label}: ${sourced}/${summary.total} (${sourceCoveragePct(
      sourced,
      summary.total,
    )}) have source text; ${locatable}/${summary.total} (${sourceCoveragePct(
      locatable,
      summary.total,
    )}) have direct URL/DOI/internal/resolved locator`,
  )

  if (summary.missing > 0) {
    sourceAuditIssue(
      `${summary.label}: ${summary.missing}/${summary.total} missing source value` +
        (summary.examples.missing.length > 0
          ? ` (examples: ${summary.examples.missing.join('; ')})`
          : ''),
    )
  }

  if (summary.labelOnly > 0) {
    sourceAuditIssue(
      `${summary.label}: ${summary.labelOnly}/${summary.total} source values are label-only, not direct locators` +
        (summary.examples.labelOnly.length > 0
          ? ` (examples: ${summary.examples.labelOnly.join('; ')})`
          : ''),
    )
  }
}

function printVerifiedAtSummary(
  label: string,
  rows: Array<{ id: string; verifiedAt?: Date | string | null }>,
) {
  const verified = rows.filter((row) => Boolean(row.verifiedAt)).length
  pass(
    `${label}: ${verified}/${rows.length} (${sourceCoveragePct(
      verified,
      rows.length,
    )}) have verifiedAt`,
  )

  const missing = rows.filter((row) => !row.verifiedAt)
  if (missing.length > 0) {
    sourceAuditIssue(
      `${label}: ${missing.length}/${rows.length} missing verifiedAt` +
        ` (examples: ${missing
          .slice(0, 5)
          .map((row) => row.id)
          .join('; ')})`,
    )
  }
}

function fileExistsForDocumentPath(filePath: string | null): boolean {
  return candidateLocalFilePaths(filePath).some((path) => existsSync(path))
}

async function checkSourceQualityCoverage() {
  header('13. Source Quality Coverage')

  if (strictSourceAudit) {
    warn('Strict source gate enabled: source gaps in this section count as audit failures')
  } else {
    warn('Strict source gate disabled: source gaps are reported as warnings; use --strict-sources to fail on them')
  }

  const [
    financials,
    ownerships,
    properties,
    relationships,
    subsidies,
    countryMetrics,
    aquacultureSites,
    aquacultureApplications,
    deliveryVolumes,
    documents,
    sourceDocs,
    reports,
    shareholders,
    boardMembers,
    actorRelationships,
  ] = await Promise.all([
    prisma.companyFinancial.findMany({
      select: {
        id: true,
        companyId: true,
        year: true,
        source: true,
        company: { select: { orgNr: true } },
      },
    }),
    prisma.companyOwnership.findMany({
      select: {
        id: true,
        source: true,
        parentCompany: { select: { orgNr: true } },
        childCompany: { select: { orgNr: true } },
      },
    }),
    prisma.companyProperty.findMany({
      select: {
        id: true,
        source: true,
        company: { select: { orgNr: true } },
      },
    }),
    prisma.businessRelationship.findMany({
      select: {
        id: true,
        source: true,
        fromCompany: { select: { orgNr: true } },
        toCompany: { select: { orgNr: true } },
      },
    }),
    prisma.subsidy.findMany({
      select: { id: true, source: true, subsidyType: true, year: true },
    }),
    prisma.countryMetric.findMany({
      select: {
        id: true,
        country: true,
        metricType: true,
        category: true,
        year: true,
        source: true,
        metadata: true,
      },
    }),
    prisma.aquacultureSite.findMany({ select: { id: true, localityNumber: true, source: true } }),
    prisma.aquacultureApplication.findMany({
      select: { id: true, applicantOrgNr: true, source: true },
    }),
    prisma.deliveryVolume.findMany({ select: { id: true, commodity: true, year: true, source: true } }),
    prisma.document.findMany({
      select: {
        id: true,
        slug: true,
        filePath: true,
        url: true,
        report: { select: { id: true, provenanceType: true, supportingSources: true } },
      },
    }),
    prisma.sourceDoc.findMany({
      select: { id: true, url: true, documentId: true, isDuplicate: true },
    }),
    prisma.report.findMany({ select: { id: true, sourceUrl: true } }),
    prisma.shareholder.findMany({
      select: {
        id: true,
        name: true,
        ownershipPct: true,
        source: true,
        sourceUrl: true,
        verifiedAt: true,
        company: { select: { orgNr: true } },
      },
    }),
    prisma.boardMember.findMany({
      select: { id: true, personName: true, source: true, sourceUrl: true, verifiedAt: true },
    }),
    prisma.actorRelationship.findMany({
      select: { id: true, fromActorId: true, toActorId: true, relationType: true, source: true, sourceUrl: true },
    }),
  ])

  const reportSourceUrlById = new Map(reports.map((report) => [report.id, report.sourceUrl]))
  const documentRefs = new Set(
    documents.flatMap((document) => [document.id, document.slug].filter(Boolean) as string[]),
  )

  const sourceSummaries = [
    summarizeSourceRows(
      'CompanyFinancial.source',
      financials.map((row): SourceRow => ({
        id: `${row.companyId}:${row.year}`,
        source: row.source,
        resolvedLocator: resolveCompanyFinancialSourceLocator(row, documentRefs),
      })),
    ),
    summarizeSourceRows(
      'CompanyOwnership.source',
      ownerships.map((row): SourceRow => ({
        id: row.id,
        source: row.source,
        resolvedLocator: resolveCompanyOwnershipSourceLocator(row, documentRefs),
      })),
    ),
    summarizeSourceRows(
      'CompanyProperty.source',
      properties.map((row): SourceRow => ({
        id: row.id,
        source: row.source,
        resolvedLocator: resolveCompanyPropertySourceLocator(row),
      })),
    ),
    summarizeSourceRows(
      'BusinessRelationship.source',
      relationships.map((row): SourceRow => ({
        id: row.id,
        source: row.source,
        resolvedLocator: resolveBusinessRelationshipSourceLocator(row, documentRefs, reportSourceUrlById),
      })),
    ),
    summarizeSourceRows(
      'Subsidy.source',
      subsidies.map((row): SourceRow => ({
        id: row.id,
        source: row.source,
        resolvedLocator: resolveSubsidySourceLocator(row),
      })),
    ),
    summarizeSourceRows(
      'CountryMetric.source',
      countryMetrics.map((row): SourceRow => ({
        id: row.id,
        source: row.source,
        resolvedLocator: resolveCountryMetricSourceLocator(row, reportSourceUrlById),
      })),
    ),
    summarizeSourceRows(
      'AquacultureSite.source',
      aquacultureSites.map((row): SourceRow => ({
        id: row.id,
        source: row.source,
        resolvedLocator: resolveAquacultureSiteSourceLocator(row),
      })),
    ),
    summarizeSourceRows(
      'AquacultureApplication.source',
      aquacultureApplications.map((row): SourceRow => ({
        id: row.id,
        source: row.source,
        resolvedLocator: resolveAquacultureApplicationSourceLocator(row),
      })),
    ),
    summarizeSourceRows(
      'DeliveryVolume.source',
      deliveryVolumes.map((row): SourceRow => ({
        id: row.id,
        source: row.source,
        resolvedLocator: resolveDeliveryVolumeSourceLocator(row),
      })),
    ),
    summarizeSourceRows(
      'Shareholder.source',
      shareholders.map((row): SourceRow => ({
        id: `${row.id}:${row.name}`,
        source: row.sourceUrl?.trim() || row.source,
        resolvedLocator: resolveShareholderSourceLocator(row, documentRefs),
      })),
    ),
    summarizeSourceRows(
      'BoardMember.source',
      boardMembers.map((row): SourceRow => ({
        id: `${row.id}:${row.personName}`,
        source: row.sourceUrl?.trim() || row.source,
      })),
    ),
    summarizeSourceRows(
      'ActorRelationship.source',
      actorRelationships.map((row): SourceRow => ({
        id: `${row.fromActorId}:${row.toActorId}:${row.relationType}`,
        source: row.sourceUrl?.trim() || row.source,
      })),
    ),
  ]

  for (const summary of sourceSummaries) {
    printSourceSummary(summary)
  }

  printVerifiedAtSummary(
    'Shareholder.verifiedAt',
    shareholders.map((row) => ({ id: `${row.id}:${row.name}`, verifiedAt: row.verifiedAt })),
  )
  printVerifiedAtSummary(
    'BoardMember.verifiedAt',
    boardMembers.map((row) => ({ id: `${row.id}:${row.personName}`, verifiedAt: row.verifiedAt })),
  )

  const documentsWithUrl = documents.filter((document) => Boolean(document.url?.trim())).length
  const documentsWithResolvableFile = documents.filter((document) =>
    fileExistsForDocumentPath(document.filePath),
  ).length
  const documentsWithoutLocator = documents.filter(
    (document) => !hasDocumentLocator(document, fileExistsForDocumentPath),
  )
  const documentsWithMissingFilePath = documents.filter(
    (document) => document.filePath && !fileExistsForDocumentPath(document.filePath),
  )

  pass(
    `Document locator coverage: ${documentsWithUrl}/${documents.length} have URL; ` +
      `${documentsWithResolvableFile}/${documents.length} have resolvable local filePath`,
  )

  if (documentsWithoutLocator.length > 0) {
    sourceAuditIssue(
      `Document: ${documentsWithoutLocator.length}/${documents.length} have neither URL, resolvable local filePath, nor resolved report provenance` +
        ` (examples: ${documentsWithoutLocator
          .slice(0, 5)
          .map((document) => document.slug)
          .join('; ')})`,
    )
  }

  if (documentsWithMissingFilePath.length > 0) {
    sourceAuditIssue(
      `Document: ${documentsWithMissingFilePath.length}/${documents.length} filePath values do not resolve locally` +
        ` (examples: ${documentsWithMissingFilePath
          .slice(0, 5)
          .map((document) => `${document.slug}: ${document.filePath}`)
          .join('; ')})`,
    )
  }

  const activeSourceDocs = sourceDocs.filter((sourceDoc) => !sourceDoc.isDuplicate)
  const activeSourceDocsWithUrl = activeSourceDocs.filter((sourceDoc) => Boolean(sourceDoc.url?.trim())).length
  const activeSourceDocsWithDocument = activeSourceDocs.filter((sourceDoc) => Boolean(sourceDoc.documentId)).length
  const activeSourceDocsWithoutLocator = activeSourceDocs.filter(
    (sourceDoc) => !sourceDoc.url?.trim() && !sourceDoc.documentId,
  )

  pass(
    `SourceDoc locator coverage: ${activeSourceDocsWithUrl}/${activeSourceDocs.length} active rows have URL; ` +
      `${activeSourceDocsWithDocument}/${activeSourceDocs.length} link to Document`,
  )

  if (activeSourceDocsWithoutLocator.length > 0) {
    sourceAuditIssue(
      `SourceDoc: ${activeSourceDocsWithoutLocator.length}/${activeSourceDocs.length} active rows have neither URL nor linked Document` +
        ` (examples: ${activeSourceDocsWithoutLocator
          .slice(0, 5)
          .map((sourceDoc) => sourceDoc.id)
          .join('; ')})`,
    )
  }

}

const EXTERNALLY_RELEVANT_CITATION_ENTITIES = new Set([
  'Report',
  'Thesis',
  'CountryMetric',
  'CompanyFinancial',
  'BusinessRelationship',
  'CompanyOwnership',
  'CompanyProperty',
  'BoardMember',
  'Shareholder',
])

async function checkCitationCoverage() {
  header('14. Citation Coverage')

  const [sourceCitations, fieldCitations] = await Promise.all([
    prisma.sourceCitation.findMany({
      select: {
        id: true,
        citationText: true,
        citationReadiness: true,
        verificationStatus: true,
        url: true,
        archivedUrl: true,
        localPath: true,
        documentId: true,
        sourceDocId: true,
        accessedAt: true,
        verifiedAt: true,
      },
    }),
    prisma.fieldCitation.findMany({
      select: {
        id: true,
        citationId: true,
        entityType: true,
        entityId: true,
        fieldPath: true,
        claimText: true,
        citation: { select: { citationReadiness: true } },
      },
    }),
  ])

  const summary = auditCitationCoverage(
    {
      sourceCitations,
      fieldCitations: fieldCitations.map(({ citation: _citation, ...fieldCitation }) => fieldCitation),
    },
    { localPathExists: fileExistsForDocumentPath },
  )

  for (const line of formatCitationAuditSummary(summary).split('\n')) {
    console.log(`  ${line}`)
  }

  const externalBlocked = fieldCitations.filter((fieldCitation) => {
    return (
      EXTERNALLY_RELEVANT_CITATION_ENTITIES.has(fieldCitation.entityType) &&
      fieldCitation.citation.citationReadiness === 'blocked_unsourced'
    )
  })

  if (externalBlocked.length > 0) {
    sourceAuditIssue(
      `Citation Coverage: ${externalBlocked.length}/${fieldCitations.length} externally relevant FieldCitation rows point to blocked_unsourced citations` +
        ` (examples: ${externalBlocked
          .slice(0, 5)
          .map((fieldCitation) =>
            `${fieldCitation.entityType}:${fieldCitation.entityId}:${fieldCitation.fieldPath}`,
          )
          .join('; ')})`,
    )
  }

  const blockingIssues = summary.issues.filter((issue) => issue.severity === 'blocking')
  if (blockingIssues.length > 0) {
    sourceAuditIssue(
      `Citation Coverage: ${blockingIssues.length} external blocking audit issue(s)` +
        ` (examples: ${blockingIssues
          .slice(0, 5)
          .map((issue) => `${issue.code}:${issue.citationId ?? issue.fieldCitationId ?? 'unknown'}`)
          .join('; ')})`,
    )
  } else {
    pass('Citation audit found no external-ready locator or verification blockers')
  }
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
  await checkSourceQualityCoverage()
  await checkCitationCoverage()

  header('Summary')
  if (errorCount > 0) {
    console.log(`  ${errorCount} enforced audit violation(s) found`)
  } else {
    console.log('  All enforced integrity checks passed; review warnings above')
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
