import 'dotenv/config'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { buildSourceGapQueue, type SourceGapQueueInput } from '../src/lib/source-gap-queue'
import {
  resolveBusinessRelationshipSourceLocator,
  resolveCompanyFinancialSourceLocator,
  resolveCompanyOwnershipSourceLocator,
  resolveCompanyPropertySourceLocator,
  resolveCountryMetricSourceLocator,
  resolveShareholderSourceLocator,
} from '../src/lib/row-source-locators'
import type { SourceRow } from '../src/lib/source-quality-audit'

const OUTPUT_PATH = 'research/_status/strict-source-gap-queue.json'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const [
    documents,
    reports,
    financials,
    ownerships,
    properties,
    relationships,
    countryMetrics,
    shareholders,
    boardMembers,
  ] = await Promise.all([
    prisma.document.findMany({ select: { id: true, slug: true } }),
    prisma.report.findMany({ select: { id: true, sourceUrl: true } }),
    prisma.companyFinancial.findMany({
      select: {
        companyId: true,
        year: true,
        source: true,
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
      select: { id: true, country: true, metricType: true, category: true, year: true, source: true, metadata: true },
    }),
    prisma.shareholder.findMany({
      select: {
        id: true,
        name: true,
        ownershipPct: true,
        source: true,
        sourceUrl: true,
        company: { select: { name: true, orgNr: true } },
      },
    }),
    prisma.boardMember.findMany({
      select: { id: true, personName: true, role: true, source: true, sourceUrl: true },
    }),
  ])

  const documentRefs = new Set(
    documents.flatMap((document) => [document.id, document.slug].filter(Boolean) as string[]),
  )
  const reportSourceUrlById = new Map(reports.map((report) => [report.id, report.sourceUrl]))

  const inputs: SourceGapQueueInput[] = [
    {
      label: 'CompanyFinancial.source',
      rows: financials.map(
        (row): SourceRow => ({
          id: `${row.company.name} (${row.company.orgNr ?? 'no-org'}) ${row.year}`,
          source: row.source,
          resolvedLocator: resolveCompanyFinancialSourceLocator(row, documentRefs),
        }),
      ),
    },
    {
      label: 'CompanyOwnership.source',
      rows: ownerships.map(
        (row): SourceRow => ({
          id: `${row.parentCompany.name} -> ${row.childCompany.name}`,
          source: row.source,
          resolvedLocator: resolveCompanyOwnershipSourceLocator(row, documentRefs),
        }),
      ),
    },
    {
      label: 'CompanyProperty.source',
      rows: properties.map(
        (row): SourceRow => ({
          id: `${row.company.name} ${row.propertyType}${row.municipality ? ` ${row.municipality}` : ''}`,
          source: row.source,
          resolvedLocator: resolveCompanyPropertySourceLocator(row),
        }),
      ),
    },
    {
      label: 'BusinessRelationship.source',
      rows: relationships.map(
        (row): SourceRow => ({
          id: `${row.fromCompany.name} -> ${row.toCompany.name} ${row.relationshipType}`,
          source: row.source,
          resolvedLocator: resolveBusinessRelationshipSourceLocator(
            row,
            documentRefs,
            reportSourceUrlById,
          ),
        }),
      ),
    },
    {
      label: 'CountryMetric.source',
      rows: countryMetrics.map(
        (row): SourceRow => ({
          id: `${row.country} ${row.metricType} ${row.category ?? 'no-category'} ${row.year ?? 'no-year'}`,
          source: row.source,
          resolvedLocator: resolveCountryMetricSourceLocator(row, reportSourceUrlById),
        }),
      ),
    },
    {
      label: 'Shareholder.source',
      rows: shareholders.map(
        (row): SourceRow => ({
          id: `${row.company.name}: ${row.name}`,
          source: row.sourceUrl?.trim() || row.source,
          resolvedLocator: resolveShareholderSourceLocator(row, documentRefs),
        }),
      ),
    },
    {
      label: 'BoardMember.source',
      rows: boardMembers.map(
        (row): SourceRow => ({
          id: `${row.personName}${row.role ? ` (${row.role})` : ''}`,
          source: row.sourceUrl?.trim() || row.source,
        }),
      ),
    },
  ]

  const items = buildSourceGapQueue(inputs)
  const output = {
    generatedAt: new Date().toISOString(),
    totalGroups: items.length,
    totalRows: items.reduce((sum, item) => sum + item.count, 0),
    items,
  }

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true })
  writeFileSync(`${OUTPUT_PATH}`, `${JSON.stringify(output, null, 2)}\n`)

  console.log(`Wrote ${OUTPUT_PATH}`)
  console.log(`Groups: ${output.totalGroups}`)
  console.log(`Rows: ${output.totalRows}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
