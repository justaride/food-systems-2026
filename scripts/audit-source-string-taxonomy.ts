import 'dotenv/config'
import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import { dirname, resolve } from 'path'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import {
  findNewActionNeededSourceRows,
  formatSourceTaxonomyCsv,
  makeSourceTaxonomyRows,
  type SourceFieldSummary,
  type SourceTaxonomyRow,
} from '../src/lib/source-taxonomy'

type SourceField = {
  model: string
  table: string
  field: string
}

type SourceLessModel = {
  model: string
  table: string
  reason: string
}

const SOURCE_FIELDS: SourceField[] = [
  { model: 'Insight', table: 'Insight', field: 'source' },
  { model: 'Meeting', table: 'Meeting', field: 'source' },
  { model: 'CompanyFinancial', table: 'CompanyFinancial', field: 'source' },
  { model: 'Subsidy', table: 'Subsidy', field: 'source' },
  { model: 'CompanyOwnership', table: 'CompanyOwnership', field: 'source' },
  { model: 'CompanyProperty', table: 'CompanyProperty', field: 'source' },
  { model: 'BusinessRelationship', table: 'BusinessRelationship', field: 'source' },
  { model: 'CountryMetric', table: 'CountryMetric', field: 'source' },
  { model: 'AquacultureSite', table: 'AquacultureSite', field: 'source' },
  { model: 'FishHealthObservation', table: 'FishHealthObservation', field: 'source' },
  { model: 'AquacultureApplication', table: 'AquacultureApplication', field: 'source' },
  { model: 'DeliveryVolume', table: 'DeliveryVolume', field: 'source' },
]

const SOURCELESS_MODELS: SourceLessModel[] = [
  {
    model: 'Company',
    table: 'Company',
    reason: 'Model has registry and identity facts but no SourceCitation/FieldCitation coverage yet',
  },
  {
    model: 'Shareholder',
    table: 'Shareholder',
    reason: 'Ownership facts have no source field or FieldCitation coverage yet',
  },
  {
    model: 'BoardMember',
    table: 'BoardMember',
    reason: 'Role facts have no source field or FieldCitation coverage yet',
  },
  {
    model: 'PersonProfile',
    table: 'PersonProfile',
    reason: 'Profile and role-array facts rely on metadata/JSON without FieldCitation coverage yet',
  },
  {
    model: 'Actor',
    table: 'Actor',
    reason: 'Actor profile facts rely on metadata/document links without FieldCitation coverage yet',
  },
]

function parseArgs(argv: string[]) {
  let output = 'research/source-string-taxonomy-baseline.csv'
  let baseline: string | undefined
  let failOnNewActionNeeded = false
  let stdout = false

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--stdout') {
      stdout = true
      continue
    }
    if (arg === '--output') {
      const next = argv[i + 1]
      if (!next) throw new Error('--output requires a path')
      output = next
      i++
      continue
    }
    if (arg === '--baseline') {
      const next = argv[i + 1]
      if (!next) throw new Error('--baseline requires a path')
      baseline = next
      i++
      continue
    }
    if (arg.startsWith('--output=')) {
      output = arg.slice('--output='.length)
      continue
    }
    if (arg.startsWith('--baseline=')) {
      baseline = arg.slice('--baseline='.length)
      continue
    }
    if (arg === '--fail-on-new-action-needed') {
      failOnNewActionNeeded = true
      continue
    }
    throw new Error(`Unknown argument: ${arg}`)
  }

  if (failOnNewActionNeeded && !baseline) {
    throw new Error('--fail-on-new-action-needed requires --baseline <path>')
  }

  return { output, baseline, failOnNewActionNeeded, stdout }
}

function quotedIdentifier(identifier: string) {
  return `"${identifier.replace(/"/g, '""')}"`
}

async function countSourceValues(prisma: PrismaClient, sourceField: SourceField): Promise<SourceFieldSummary[]> {
  const table = quotedIdentifier(sourceField.table)
  const field = quotedIdentifier(sourceField.field)
  const rows = await prisma.$queryRawUnsafe<Array<{ value: string | null; count: bigint }>>(
    `SELECT ${field}::text AS value, COUNT(*)::bigint AS count FROM ${table} GROUP BY ${field} ORDER BY COUNT(*) DESC, ${field} ASC`,
  )

  return rows.map(row => ({
    model: sourceField.model,
    field: sourceField.field,
    value: row.value,
    count: Number(row.count),
  }))
}

async function countModel(prisma: PrismaClient, model: SourceLessModel) {
  const rows = await prisma.$queryRawUnsafe<Array<{ count: bigint }>>(
    `SELECT COUNT(*)::bigint AS count FROM ${quotedIdentifier(model.table)}`,
  )
  return Number(rows[0]?.count ?? 0)
}

async function buildRows(prisma: PrismaClient): Promise<SourceTaxonomyRow[]> {
  const summaries: SourceFieldSummary[] = []

  for (const sourceField of SOURCE_FIELDS) {
    summaries.push(...await countSourceValues(prisma, sourceField))
  }

  const sourceRows = makeSourceTaxonomyRows(summaries)
  const missingModelRows: SourceTaxonomyRow[] = []

  for (const model of SOURCELESS_MODELS) {
    const count = await countModel(prisma, model)
    if (count === 0) continue
    missingModelRows.push({
      rowType: 'model_without_source_field',
      model: model.model,
      field: '',
      sourceValue: '',
      recordCount: count,
      className: 'missing',
      needsAction: 'yes',
      reason: model.reason,
    })
  }

  return [...sourceRows, ...missingModelRows]
}

async function main() {
  const { output, baseline, failOnNewActionNeeded, stdout } = parseArgs(process.argv.slice(2))
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
  const prisma = new PrismaClient({ adapter })

  try {
    const rows = await buildRows(prisma)
    const csv = formatSourceTaxonomyCsv(rows)
    const baselineCsv = baseline
      ? readFileSync(resolve(process.cwd(), baseline), 'utf8')
      : null
    const outputPath = resolve(process.cwd(), output)
    mkdirSync(dirname(outputPath), { recursive: true })
    writeFileSync(outputPath, csv, 'utf8')

    if (stdout) process.stdout.write(csv)

    const actionRows = rows.filter(row => row.needsAction === 'yes')
    const affectedRecords = actionRows.reduce((sum, row) => sum + row.recordCount, 0)
    console.log(`Wrote ${rows.length} taxonomy row(s) to ${output}`)
    console.log(`Needs action: ${actionRows.length} row(s), ${affectedRecords} affected record(s)`)

    if (baselineCsv !== null) {
      const newActionRows = findNewActionNeededSourceRows(rows, baselineCsv)
      console.log(`New action-needed rows vs baseline: ${newActionRows.length}`)
      for (const row of newActionRows.slice(0, 5)) {
        const fieldLabel = row.field || '(no source field)'
        console.log(
          `- ${row.rowType} ${row.model}.${fieldLabel} ${JSON.stringify(row.sourceValue)} `
          + `(${row.className}, ${row.recordCount} record(s))`,
        )
      }
      if (newActionRows.length > 5) {
        console.log(`...and ${newActionRows.length - 5} more`)
      }
      if (failOnNewActionNeeded && newActionRows.length > 0) {
        process.exitCode = 1
      }
    }
  } finally {
    await prisma.$disconnect()
  }
}

main().catch(error => {
  console.error('Source string taxonomy audit failed:', error)
  process.exit(1)
})
