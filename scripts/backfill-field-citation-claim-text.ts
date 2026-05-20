import 'dotenv/config'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname } from 'node:path'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { buildCompanyNaceClaimText } from '../src/lib/citations/field-citation-claim-text'

const OUTPUT_PATH = 'research/field-citation-claim-text-backfill-preview-2026-05-20.csv'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

type PlannedClaimTextUpdate = {
  fieldCitationId: string
  entityType: string
  entityId: string
  fieldPath: string
  claimText: string
}

function parseArgs(argv: string[]) {
  const allowed = new Set(['--apply'])
  for (const arg of argv) {
    if (!allowed.has(arg)) throw new Error(`Unknown argument: ${arg}`)
  }

  return { apply: argv.includes('--apply') }
}

function escapeCsv(value: unknown) {
  const text = value == null ? '' : String(value)
  if (!/[",\n\r]/.test(text)) return text
  return `"${text.replaceAll('"', '""')}"`
}

function formatPreviewCsv(rows: PlannedClaimTextUpdate[]) {
  const headers: Array<keyof PlannedClaimTextUpdate> = [
    'fieldCitationId',
    'entityType',
    'entityId',
    'fieldPath',
    'claimText',
  ]

  return [
    headers.join(','),
    ...rows.map(row => headers.map(header => escapeCsv(row[header])).join(',')),
  ].join('\n') + '\n'
}

async function main() {
  const { apply } = parseArgs(process.argv.slice(2))
  const missingCompanyNaceCitations = await prisma.fieldCitation.findMany({
    where: {
      entityType: 'Company',
      fieldPath: 'naceDescription',
      claimText: null,
    },
    select: {
      id: true,
      entityType: true,
      entityId: true,
      fieldPath: true,
    },
  })

  const companies = await prisma.company.findMany({
    where: { id: { in: missingCompanyNaceCitations.map(field => field.entityId) } },
    select: {
      id: true,
      name: true,
      naceCode: true,
      naceDescription: true,
    },
  })
  const companiesById = new Map(companies.map(company => [company.id, company]))

  const updates = missingCompanyNaceCitations.flatMap((field): PlannedClaimTextUpdate[] => {
    const company = companiesById.get(field.entityId)
    const claimText = company ? buildCompanyNaceClaimText(company) : null
    if (!claimText) return []

    return [{
      fieldCitationId: field.id,
      entityType: field.entityType,
      entityId: field.entityId,
      fieldPath: field.fieldPath ?? '',
      claimText,
    }]
  })

  mkdirSync(dirname(OUTPUT_PATH), { recursive: true })
  writeFileSync(OUTPUT_PATH, formatPreviewCsv(updates))

  if (apply) {
    for (const update of updates) {
      await prisma.fieldCitation.update({
        where: { id: update.fieldCitationId },
        data: { claimText: update.claimText },
      })
    }
  }

  console.log(`Preview path: ${OUTPUT_PATH}`)
  console.log(`Company naceDescription FieldCitation rows scanned: ${missingCompanyNaceCitations.length}`)
  console.log(`Rows to update: ${updates.length}`)
  console.log(`Skipped without source company or NACE description: ${missingCompanyNaceCitations.length - updates.length}`)
  console.log(`Applied: ${apply ? 'yes' : 'no'}`)
}

main()
  .catch((error) => {
    console.error('Field citation claim-text backfill failed:', error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
