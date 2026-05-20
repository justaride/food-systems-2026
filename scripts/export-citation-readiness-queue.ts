import 'dotenv/config'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import {
  buildCitationReadinessQueue,
  formatCitationReadinessQueueCsv,
  hasResolvedReportSourceUrlException,
  isMissingExternalVerificationMetadata,
  type CitationReadinessQueueInput,
} from '../src/lib/citations/citation-readiness-queue'
import { classifySourceLocator } from '../src/lib/source-quality-audit'
import {
  resolveBusinessRelationshipSourceLocator,
  resolveCompanyFinancialSourceLocator,
  resolveCountryMetricSourceLocator,
} from '../src/lib/row-source-locators'

const OUTPUT_PATH = 'research/citation-readiness-queue-2026-05-20.csv'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const EXTERNALLY_RELEVANT_ENTITIES = new Set([
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

function publicSurface(entityType: string) {
  return EXTERNALLY_RELEVANT_ENTITIES.has(entityType)
}

function labelOnlyQueueItem(input: {
  entityType: string
  entityId: string
  fieldPath: string
  source: string | null
  notes: string
}): CitationReadinessQueueInput | null {
  if (classifySourceLocator(input.source) !== 'label_only') return null

  return {
    entityType: input.entityType,
    entityId: input.entityId,
    fieldPath: input.fieldPath,
    currentReadiness: 'blocked_unsourced',
    blockingReason: 'label-only source has no direct locator',
    currentSource: input.source,
    publicSurface: true,
    usedInReport: true,
    notes: input.notes,
  }
}

async function main() {
  const [
    documents,
    reports,
    fieldCitations,
    financials,
    relationships,
    countryMetrics,
    sourceDocs,
    reportsWithoutUrl,
  ] = await Promise.all([
    prisma.document.findMany({ select: { id: true, slug: true } }),
    prisma.report.findMany({ select: { id: true, sourceUrl: true } }),
    prisma.fieldCitation.findMany({
      select: {
        id: true,
        entityType: true,
        entityId: true,
        fieldPath: true,
        claimText: true,
        citation: {
          select: {
            id: true,
            citationText: true,
            citationReadiness: true,
            verificationStatus: true,
            url: true,
            localPath: true,
            documentId: true,
            sourceDocId: true,
            accessedAt: true,
            verifiedAt: true,
          },
        },
      },
    }),
    prisma.companyFinancial.findMany({
      select: {
        id: true,
        year: true,
        source: true,
        company: { select: { name: true, orgNr: true } },
      },
    }),
    prisma.businessRelationship.findMany({
      select: {
        id: true,
        source: true,
        relationshipType: true,
        fromCompany: { select: { name: true, orgNr: true } },
        toCompany: { select: { name: true, orgNr: true } },
      },
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
    prisma.sourceDoc.findMany({
      where: { isDuplicate: false, url: null, documentId: null },
      select: { id: true, title: true, filename: true },
    }),
    prisma.report.findMany({
      where: { sourceUrl: null },
      select: { id: true, title: true, provenanceType: true, supportingSources: true },
    }),
  ])

  const documentRefs = new Set(
    documents.flatMap((document) => [document.id, document.slug].filter(Boolean) as string[]),
  )
  const reportSourceUrlById = new Map(reports.map(report => [report.id, report.sourceUrl]))
  const queueInputs: CitationReadinessQueueInput[] = []

  for (const fieldCitation of fieldCitations) {
    const citation = fieldCitation.citation
    const isPublic = publicSurface(fieldCitation.entityType)
    const blockedExternal =
      isPublic && citation.citationReadiness === 'blocked_unsourced'
    const missingVerification =
      isPublic &&
      isMissingExternalVerificationMetadata(citation)

    if (!blockedExternal && !missingVerification) continue

    queueInputs.push({
      entityType: fieldCitation.entityType,
      entityId: fieldCitation.entityId,
      fieldPath: fieldCitation.fieldPath ?? '',
      currentReadiness: citation.citationReadiness,
      blockingReason: blockedExternal
        ? 'external/public field points to blocked_unsourced citation'
        : 'external citation missing verification metadata',
      currentSource: citation.citationText,
      currentUrl: citation.url,
      localPath: citation.localPath,
      publicSurface: isPublic,
      usedInReport: fieldCitation.entityType === 'Report',
      missingVerificationMetadata: missingVerification,
      notes: fieldCitation.claimText,
    })
  }

  for (const financial of financials) {
    const resolvedLocator = resolveCompanyFinancialSourceLocator(financial, documentRefs)
    if (resolvedLocator) continue

    const item = labelOnlyQueueItem({
      entityType: 'CompanyFinancial',
      entityId: financial.id,
      fieldPath: 'source',
      source: financial.source,
      notes: `${financial.company.name} ${financial.year}`,
    })
    if (item) queueInputs.push(item)
  }

  for (const relationship of relationships) {
    const resolvedLocator = resolveBusinessRelationshipSourceLocator(
      relationship,
      documentRefs,
      reportSourceUrlById,
    )
    if (resolvedLocator) continue

    const item = labelOnlyQueueItem({
      entityType: 'BusinessRelationship',
      entityId: relationship.id,
      fieldPath: 'source',
      source: relationship.source,
      notes: `${relationship.fromCompany.name} -> ${relationship.toCompany.name} ${relationship.relationshipType}`,
    })
    if (item) queueInputs.push(item)
  }

  for (const metric of countryMetrics) {
    const resolvedLocator = resolveCountryMetricSourceLocator(metric, reportSourceUrlById)
    if (resolvedLocator) continue

    const item = labelOnlyQueueItem({
      entityType: 'CountryMetric',
      entityId: metric.id,
      fieldPath: 'source',
      source: metric.source,
      notes: `${metric.country} ${metric.metricType} ${metric.category} ${metric.year}`,
    })
    if (item) queueInputs.push(item)
  }

  for (const sourceDoc of sourceDocs) {
    queueInputs.push({
      entityType: 'SourceDoc',
      entityId: sourceDoc.id,
      fieldPath: 'url',
      currentReadiness: 'internal_context',
      blockingReason: 'active SourceDoc has neither URL nor linked Document',
      currentSource: sourceDoc.title ?? sourceDoc.filename,
      publicSurface: false,
      usedInReport: false,
    })
  }

  for (const report of reportsWithoutUrl) {
    if (
      hasResolvedReportSourceUrlException({
        provenanceType: report.provenanceType,
        supportingSourceCount: Array.isArray(report.supportingSources)
          ? report.supportingSources.length
          : 0,
      })
    ) {
      continue
    }

    const excludedFromExternalUse = report.provenanceType === 'blocked_source'
    queueInputs.push({
      entityType: 'Report',
      entityId: report.id,
      fieldPath: 'sourceUrl',
      currentReadiness:
        report.provenanceType === 'blocked_source' ? 'blocked_unsourced' : 'internal_context',
      blockingReason: 'Report has no single sourceUrl',
      currentSource: report.title,
      publicSurface: !excludedFromExternalUse,
      usedInReport: !excludedFromExternalUse,
      excludedFromExternalUse,
      notes: report.provenanceType,
    })
  }

  const queue = buildCitationReadinessQueue(queueInputs)
  mkdirSync(dirname(OUTPUT_PATH), { recursive: true })
  writeFileSync(OUTPUT_PATH, formatCitationReadinessQueueCsv(queue))

  const byPriority = queue.reduce<Record<string, number>>((counts, row) => {
    counts[row.priority] = (counts[row.priority] ?? 0) + 1
    return counts
  }, {})

  console.log(`Wrote ${OUTPUT_PATH}`)
  console.log(`Rows: ${queue.length}`)
  console.log(`P0: ${byPriority.P0 ?? 0}`)
  console.log(`P1: ${byPriority.P1 ?? 0}`)
  console.log(`P2: ${byPriority.P2 ?? 0}`)
  console.log(`P3: ${byPriority.P3 ?? 0}`)
}

main()
  .catch((error) => {
    console.error('Citation readiness queue export failed:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
