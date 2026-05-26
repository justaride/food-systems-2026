import 'dotenv/config'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import {
  buildCitationBackfillPlan,
  fieldCitationDuplicateKey,
  formatBackfillPreviewCsv,
  sourceCitationDuplicateKey,
  type CitationLocatorContext,
  type PlannedSourceCitation,
  type SourceCitationBackfillCandidate,
} from '../src/lib/citations/source-citation-backfill'
import { normalizeLocalFileLocator } from '../src/lib/local-file-locator'
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

const PREVIEW_PATH = 'research/citation-backfill-preview-2026-05-20.csv'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

function parseArgs(argv: string[]) {
  const allowed = new Set(['--apply'])
  for (const arg of argv) {
    if (!allowed.has(arg)) throw new Error(`Unknown argument: ${arg}`)
  }

  return { apply: argv.includes('--apply') }
}

function text(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function numberYear(value: unknown) {
  if (typeof value === 'number' && Number.isInteger(value)) return value
  if (typeof value === 'string') {
    const match = value.match(/\b(20\d{2})\b/)
    if (match) return Number(match[1])
  }
  return null
}

function doiLocator(value: string | null | undefined) {
  const doi = text(value)
  if (!doi) return null
  return doi.toLowerCase().startsWith('doi:') ? doi : `doi:${doi}`
}

function addCandidate(
  candidates: SourceCitationBackfillCandidate[],
  candidate: SourceCitationBackfillCandidate,
) {
  if (!candidate.entityType || !candidate.entityId || !candidate.fieldPath) return
  candidates.push(candidate)
}

function parseSupportingSources(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value)
    ? value.filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
    : []
}

function sourceCitationCreateData(source: PlannedSourceCitation) {
  return {
    citationText: source.citationText,
    sourceClass: source.sourceClass as never,
    citationReadiness: source.citationReadiness as never,
    verificationStatus: source.verificationStatus as never,
    title: source.title,
    publisher: source.publisher,
    author: source.author,
    year: source.year,
    url: source.url,
    localPath: source.localPath,
    documentId: source.documentId,
    sourceDocId: source.sourceDocId,
    accessedAt: source.accessedAt ? new Date(source.accessedAt) : undefined,
    verifiedAt: source.verifiedAt ? new Date(source.verifiedAt) : undefined,
    notes: source.notes,
    captureMethod: 'backfill-existing-locators',
  }
}

async function applyPlan(plan: ReturnType<typeof buildCitationBackfillPlan>) {
  const createdCitationIdsByClientKey = new Map<string, string>()

  for (const source of plan.sourceCitationsToCreate) {
    const created = await prisma.sourceCitation.create({
      data: sourceCitationCreateData(source),
      select: { id: true },
    })
    createdCitationIdsByClientKey.set(source.clientKey, created.id)
  }

  const fieldRows = plan.fieldCitationsToCreate.map((field) => {
    const citationId =
      field.citationId ??
      (field.citationClientKey ? createdCitationIdsByClientKey.get(field.citationClientKey) : null)

    if (!citationId) {
      throw new Error(
        `Cannot create FieldCitation for ${field.entityType}:${field.entityId}:${field.fieldPath}; missing citation id`,
      )
    }

    return {
      citationId,
      entityType: field.entityType,
      entityId: field.entityId,
      fieldPath: field.fieldPath,
      claimText: field.claimText,
      confidence: field.confidence,
    }
  })

  for (let index = 0; index < fieldRows.length; index += 1000) {
    await prisma.fieldCitation.createMany({
      data: fieldRows.slice(index, index + 1000),
    })
  }
}

async function main() {
  const { apply } = parseArgs(process.argv.slice(2))
  console.log(`Backfilling source citations from existing locators${apply ? '' : ' (dry run)'}`)

  const [
    documents,
    sourceDocs,
    reports,
    theses,
    boardMembers,
    shareholders,
    companyOwnerships,
    companyProperties,
    companyFinancials,
    businessRelationships,
    countryMetrics,
    subsidies,
    deliveryVolumes,
    aquacultureSites,
    aquacultureApplications,
    existingSourceCitations,
    existingFieldCitations,
  ] = await Promise.all([
    prisma.document.findMany({
      select: {
        id: true,
        slug: true,
        filePath: true,
        title: true,
        author: true,
        year: true,
        url: true,
      },
    }),
    prisma.sourceDoc.findMany({
      select: {
        id: true,
        filename: true,
        title: true,
        author: true,
        year: true,
        url: true,
        publisher: true,
        documentId: true,
      },
    }),
    prisma.report.findMany({
      select: {
        id: true,
        title: true,
        author: true,
        year: true,
        sourceUrl: true,
        publisher: true,
        documentId: true,
        supportingSources: true,
      },
    }),
    prisma.thesis.findMany({
      select: {
        id: true,
        title: true,
        authors: true,
        year: true,
        url: true,
        doi: true,
        publisher: true,
        documentId: true,
      },
    }),
    prisma.boardMember.findMany({
      select: {
        id: true,
        personName: true,
        role: true,
        source: true,
        sourceUrl: true,
        verifiedAt: true,
        company: { select: { name: true, orgNr: true } },
      },
    }),
    prisma.shareholder.findMany({
      select: {
        id: true,
        name: true,
        ownershipPct: true,
        source: true,
        sourceUrl: true,
        verifiedAt: true,
        company: { select: { name: true, orgNr: true } },
      },
    }),
    prisma.companyOwnership.findMany({
      select: {
        id: true,
        source: true,
        parentCompany: { select: { name: true, orgNr: true } },
        childCompany: { select: { name: true, orgNr: true } },
      },
    }),
    prisma.companyProperty.findMany({
      select: {
        id: true,
        source: true,
        propertyType: true,
        municipality: true,
        company: { select: { name: true, orgNr: true } },
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
    prisma.subsidy.findMany({
      select: {
        id: true,
        subsidyType: true,
        year: true,
        source: true,
        company: { select: { name: true, orgNr: true } },
      },
    }),
    prisma.deliveryVolume.findMany({
      select: {
        id: true,
        commodity: true,
        year: true,
        source: true,
        supplier: { select: { name: true, orgNr: true } },
      },
    }),
    prisma.aquacultureSite.findMany({
      select: {
        id: true,
        localityNumber: true,
        siteName: true,
        source: true,
        company: { select: { name: true, orgNr: true } },
      },
    }),
    prisma.aquacultureApplication.findMany({
      select: {
        id: true,
        applicationNo: true,
        applicantOrgNr: true,
        applicantName: true,
        source: true,
      },
    }),
    prisma.sourceCitation.findMany({
      select: {
        id: true,
        citationText: true,
        documentId: true,
        localPath: true,
        url: true,
        sourceDocId: true,
      },
    }),
    prisma.fieldCitation.findMany({
      select: {
        citationId: true,
        entityType: true,
        entityId: true,
        fieldPath: true,
      },
    }),
  ])

  const documentRefs = new Set(
    documents.flatMap((document) => [document.id, document.slug].filter(Boolean) as string[]),
  )
  const documentsByRef = new Map(
    documents.flatMap((document) => [
      [document.id, { id: document.id, filePath: document.filePath }],
      [document.slug, { id: document.id, filePath: document.filePath }],
    ]),
  )
  const sourceDocsByRef = new Map(
    sourceDocs.map(sourceDoc => [sourceDoc.id, { id: sourceDoc.id, documentId: sourceDoc.documentId }]),
  )
  const locatorContext: CitationLocatorContext = { documentsByRef, sourceDocsByRef }
  const reportSourceUrlById = new Map(reports.map(report => [report.id, report.sourceUrl]))
  const candidates: SourceCitationBackfillCandidate[] = []

  for (const document of documents) {
    if (text(document.url)) {
      addCandidate(candidates, {
        entityType: 'Document',
        entityId: document.id,
        fieldPath: 'url',
        citationText: `Document: ${document.title}`,
        locator: document.url,
        title: document.title,
        author: document.author,
        year: document.year,
        sourceClass: 'primary',
      })
    }

    if (text(document.filePath)) {
      addCandidate(candidates, {
        entityType: 'Document',
        entityId: document.id,
        fieldPath: 'filePath',
        citationText: `Document local file: ${document.title}`,
        locator: document.filePath,
        title: document.title,
        author: document.author,
        year: document.year,
        sourceClass: 'primary',
      })
    }
  }

  for (const sourceDoc of sourceDocs) {
    if (text(sourceDoc.url)) {
      addCandidate(candidates, {
        entityType: 'SourceDoc',
        entityId: sourceDoc.id,
        fieldPath: 'url',
        citationText: `SourceDoc: ${sourceDoc.title ?? sourceDoc.filename}`,
        locator: sourceDoc.url,
        title: sourceDoc.title ?? sourceDoc.filename,
        author: sourceDoc.author,
        year: numberYear(sourceDoc.year),
        publisher: sourceDoc.publisher,
        sourceClass: 'primary',
      })
    }

    if (text(sourceDoc.documentId)) {
      addCandidate(candidates, {
        entityType: 'SourceDoc',
        entityId: sourceDoc.id,
        fieldPath: 'documentId',
        citationText: `SourceDoc linked document: ${sourceDoc.title ?? sourceDoc.filename}`,
        locator: `sourcedoc:${sourceDoc.id}`,
        title: sourceDoc.title ?? sourceDoc.filename,
        author: sourceDoc.author,
        year: numberYear(sourceDoc.year),
        publisher: sourceDoc.publisher,
        sourceClass: 'primary',
      })
    }
  }

  for (const report of reports) {
    if (text(report.sourceUrl)) {
      addCandidate(candidates, {
        entityType: 'Report',
        entityId: report.id,
        fieldPath: 'sourceUrl',
        citationText: `Report: ${report.title}`,
        locator: report.sourceUrl,
        title: report.title,
        author: report.author,
        year: report.year,
        publisher: report.publisher,
        sourceClass: 'secondary',
      })
    }

    parseSupportingSources(report.supportingSources).forEach((source, index) => {
      const label = text(source.label) ?? `supporting source ${index + 1}`
      const reportId = text(source.reportId)
      const sourceDocumentPath = normalizeLocalFileLocator(text(source.documentPath))
      const locator =
        text(source.url) ??
        (reportId ? text(reportSourceUrlById.get(reportId)) : null) ??
        sourceDocumentPath

      addCandidate(candidates, {
        entityType: 'Report',
        entityId: report.id,
        fieldPath: `supportingSources[${index}]`,
        citationText: `Report supporting source: ${label}`,
        locator,
        title: label,
        sourceClass: 'secondary',
        notes: text(source.note),
      })
    })
  }

  for (const thesis of theses) {
    if (text(thesis.url)) {
      addCandidate(candidates, {
        entityType: 'Thesis',
        entityId: thesis.id,
        fieldPath: 'url',
        citationText: `Thesis: ${thesis.title}`,
        locator: thesis.url,
        title: thesis.title,
        author: thesis.authors,
        year: thesis.year,
        publisher: thesis.publisher,
        sourceClass: 'secondary',
      })
    }

    if (doiLocator(thesis.doi)) {
      addCandidate(candidates, {
        entityType: 'Thesis',
        entityId: thesis.id,
        fieldPath: 'doi',
        citationText: `Thesis DOI: ${thesis.title}`,
        locator: doiLocator(thesis.doi),
        title: thesis.title,
        author: thesis.authors,
        year: thesis.year,
        publisher: thesis.publisher,
        sourceClass: 'secondary',
      })
    }
  }

  for (const boardMember of boardMembers) {
    const locator = text(boardMember.sourceUrl) ?? text(boardMember.source)
    addCandidate(candidates, {
      entityType: 'BoardMember',
      entityId: boardMember.id,
      fieldPath: boardMember.sourceUrl ? 'sourceUrl' : 'source',
      citationText: `Board member source: ${boardMember.company?.name ?? '(unknown company)'}`,
      locator,
      sourceClass: 'primary',
      verifiedAt: boardMember.verifiedAt,
      verificationStatus: boardMember.verifiedAt ? 'verified' : null,
      claimText: `${boardMember.personName} (${boardMember.role})`,
    })
  }

  for (const shareholder of shareholders) {
    const resolvedLocator = resolveShareholderSourceLocator(shareholder, documentRefs)
    const locator = text(shareholder.sourceUrl) ?? resolvedLocator ?? text(shareholder.source)
    addCandidate(candidates, {
      entityType: 'Shareholder',
      entityId: shareholder.id,
      fieldPath: shareholder.sourceUrl ? 'sourceUrl' : 'source',
      citationText: `Shareholder source: ${shareholder.company?.name ?? '(unknown company)'}`,
      locator,
      sourceClass: 'primary',
      verifiedAt: shareholder.verifiedAt,
      verificationStatus: shareholder.verifiedAt ? 'verified' : null,
      claimText: shareholder.name,
    })
  }

  for (const ownership of companyOwnerships) {
    const resolvedLocator = resolveCompanyOwnershipSourceLocator(ownership, documentRefs)
    addCandidate(candidates, {
      entityType: 'CompanyOwnership',
      entityId: ownership.id,
      fieldPath: 'source',
      citationText: `Company ownership source: ${ownership.source}`,
      locator: resolvedLocator ?? ownership.source,
      sourceClass: 'primary',
      claimText: `${ownership.parentCompany?.name ?? '(unknown parent)'} -> ${ownership.childCompany?.name ?? '(unknown child)'}`,
    })
  }

  for (const property of companyProperties) {
    const resolvedLocator = resolveCompanyPropertySourceLocator(property)
    addCandidate(candidates, {
      entityType: 'CompanyProperty',
      entityId: property.id,
      fieldPath: 'source',
      citationText: `Company property source: ${property.source}`,
      locator: resolvedLocator ?? property.source,
      sourceClass: 'primary',
      claimText: `${property.company?.name ?? '(unknown company)'} ${property.propertyType}${property.municipality ? ` ${property.municipality}` : ''}`,
    })
  }

  for (const financial of companyFinancials) {
    const resolvedLocator = resolveCompanyFinancialSourceLocator(financial, documentRefs)
    addCandidate(candidates, {
      entityType: 'CompanyFinancial',
      entityId: financial.id,
      fieldPath: 'source',
      citationText: `Company financial source: ${financial.source}`,
      locator: resolvedLocator ?? financial.source,
      sourceClass: 'primary',
      claimText: `${financial.company?.name ?? '(unknown company)'} ${financial.year}`,
    })
  }

  for (const relationship of businessRelationships) {
    const resolvedLocator = resolveBusinessRelationshipSourceLocator(
      relationship,
      documentRefs,
      reportSourceUrlById,
    )
    addCandidate(candidates, {
      entityType: 'BusinessRelationship',
      entityId: relationship.id,
      fieldPath: 'source',
      citationText: `Business relationship source: ${relationship.source}`,
      locator: resolvedLocator ?? relationship.source,
      sourceClass: 'primary',
      claimText: `${relationship.fromCompany?.name ?? '(unknown from)'} -> ${relationship.toCompany?.name ?? '(unknown to)'} ${relationship.relationshipType}`,
    })
  }

  for (const metric of countryMetrics) {
    const resolvedLocator = resolveCountryMetricSourceLocator(metric, reportSourceUrlById)
    addCandidate(candidates, {
      entityType: 'CountryMetric',
      entityId: metric.id,
      fieldPath: 'source',
      citationText: `Country metric source: ${metric.source}`,
      locator: resolvedLocator ?? metric.source,
      sourceClass: resolvedLocator?.startsWith('source:') ? 'internal_synthesis' : 'primary',
      claimText: `${metric.country} ${metric.metricType} ${metric.category} ${metric.year}`,
    })
  }

  for (const subsidy of subsidies) {
    const resolvedLocator = resolveSubsidySourceLocator(subsidy)
    addCandidate(candidates, {
      entityType: 'Subsidy',
      entityId: subsidy.id,
      fieldPath: 'source',
      citationText: `Subsidy source: ${subsidy.source} ${subsidy.subsidyType} ${subsidy.year}`,
      locator: resolvedLocator ?? subsidy.source,
      sourceClass: 'dataset',
      claimText: `${subsidy.company?.name ?? '(unknown company)'} ${subsidy.subsidyType} ${subsidy.year}`,
    })
  }

  for (const delivery of deliveryVolumes) {
    const resolvedLocator = resolveDeliveryVolumeSourceLocator(delivery)
    addCandidate(candidates, {
      entityType: 'DeliveryVolume',
      entityId: delivery.id,
      fieldPath: 'source',
      citationText: `Delivery volume source: ${delivery.source} ${delivery.commodity} ${delivery.year}`,
      locator: resolvedLocator ?? delivery.source,
      sourceClass: 'dataset',
      claimText: `${delivery.supplier?.name ?? '(unknown supplier)'} ${delivery.commodity} ${delivery.year}`,
    })
  }

  for (const site of aquacultureSites) {
    const resolvedLocator = resolveAquacultureSiteSourceLocator(site)
    addCandidate(candidates, {
      entityType: 'AquacultureSite',
      entityId: site.id,
      fieldPath: 'source',
      citationText: `Aquaculture site source: ${site.source}`,
      locator: resolvedLocator ?? site.source,
      sourceClass: 'dataset',
      claimText: site.siteName ?? site.localityNumber,
    })
  }

  for (const application of aquacultureApplications) {
    const resolvedLocator = resolveAquacultureApplicationSourceLocator(application)
    addCandidate(candidates, {
      entityType: 'AquacultureApplication',
      entityId: application.id,
      fieldPath: 'source',
      citationText: `Aquaculture application source: ${application.source} ${application.applicantOrgNr}`,
      locator: resolvedLocator ?? application.source,
      sourceClass: 'dataset',
      claimText: application.applicationNo,
    })
  }

  const existingSourceCitationIdsByKey = new Map(
    existingSourceCitations.map(citation => [
      sourceCitationDuplicateKey({
        documentId: citation.documentId,
        localPath: citation.localPath,
        url: citation.url,
        sourceDocId: citation.sourceDocId,
        citationText: citation.citationText,
      }),
      citation.id,
    ]),
  )
  const existingFieldCitationKeys = new Set(
    existingFieldCitations.map(citation =>
      fieldCitationDuplicateKey({
        citationId: citation.citationId,
        entityType: citation.entityType,
        entityId: citation.entityId,
        fieldPath: citation.fieldPath,
      }),
    ),
  )

  const plan = buildCitationBackfillPlan(
    candidates,
    { existingSourceCitationIdsByKey, existingFieldCitationKeys },
    locatorContext,
  )

  mkdirSync(dirname(PREVIEW_PATH), { recursive: true })
  writeFileSync(PREVIEW_PATH, formatBackfillPreviewCsv(plan.previewRows))

  if (apply) {
    await applyPlan(plan)
  }

  console.log(`Preview path: ${PREVIEW_PATH}`)
  console.log(`Candidate rows: ${candidates.length}`)
  console.log(`Source citations to create: ${plan.sourceCitationsToCreate.length}`)
  console.log(`Field citations to create: ${plan.fieldCitationsToCreate.length}`)
  console.log(`Skipped duplicate source citations: ${plan.skippedDuplicateSourceCitations}`)
  console.log(`Skipped duplicate field citations: ${plan.skippedDuplicateFieldCitations}`)
  console.log(`Blocked label-only sources: ${plan.blockedLabelOnly}`)
  console.log(`Blocked missing locators: ${plan.blockedMissingLocator}`)
}

main()
  .catch((error) => {
    console.error('Source citation backfill failed:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
