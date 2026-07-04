/**
 * Plans and optionally exports local markdown snapshots for Documents that
 * FILE-COVERAGE still classifies as missing local file coverage.
 *
 * Safety contract:
 * - dry-run is the default and writes nothing
 * - use --apply before markdown files or Document.filePath updates are written
 * - generated files are locator/coverage artifacts from existing DB content
 */

import 'dotenv/config'
import { createHash } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'
import { parseCsvRecords } from '../src/lib/csv'

export type FileCoverageRow = {
  ref: string
  problem: string
}

export type SnapshotDocument = {
  id: string
  slug: string
  title: string
  author: string | null
  year: number | null
  documentType: string | null
  category: string | null
  subcategory: string | null
  country: string | null
  url: string | null
  archivedUrl: string | null
  filePath: string | null
  content: string
  report: { provenanceType: string | null } | null
}

export type ExportPlan = {
  documentId: string
  slug: string
  title: string
  filePath: string
  absolutePath: string
  contentHash: string
  contentChars: number
}

export type ExportSkip = {
  id: string
  slug: string
  reason: string
}

const ROOT = process.cwd()

export function parseApplyMode(argv: string[] = process.argv.slice(2)): boolean {
  const apply = argv.includes('--apply')
  const dryRun = argv.includes('--dry-run')
  if (apply && dryRun) throw new Error('Use either --apply or --dry-run, not both')
  return apply
}

export function missingDocumentIdsFromRows(rows: FileCoverageRow[]): string[] {
  const ids = new Set<string>()
  for (const row of rows) {
    if (row.problem !== 'missing_file_document') continue
    const id = row.ref.split(' ')[0]?.trim()
    if (id) ids.add(id)
  }
  return [...ids]
}

function missingDocumentIds(root: string): string[] {
  const csvPath = join(root, 'research', 'FILE-COVERAGE.csv')
  const rows = parseCsvRecords(readFileSync(csvPath, 'utf-8')) as FileCoverageRow[]
  return missingDocumentIdsFromRows(rows)
}

export function safeSlugPath(slug: string): string {
  const normalized = slug.trim().replaceAll('\\', '/').replace(/^\/+/, '')
  if (!normalized || normalized.includes('..') || normalized.split('/').some(part => part === '')) {
    throw new Error(`Unsafe document slug for export: ${slug}`)
  }
  return normalized
}

export function sanitizeContent(content: string): string {
  return content.replaceAll('\u0000', '').replace(/\r\n/g, '\n').trimEnd()
}

export function contentHashFor(content: string): string {
  return createHash('sha256').update(sanitizeContent(content)).digest('hex')
}

export function markdownFor(plan: ExportPlan, doc: SnapshotDocument): string {
  const metadata = [
    ['Document ID', plan.documentId],
    ['Slug', plan.slug],
    ['Author', doc.author],
    ['Year', doc.year?.toString() ?? null],
    ['Document type', doc.documentType],
    ['Category', doc.category],
    ['Subcategory', doc.subcategory],
    ['Country', doc.country],
    ['Canonical URL', doc.url],
    ['Archived URL', doc.archivedUrl],
    ['Content SHA256', plan.contentHash],
  ]
    .filter(([, value]) => value)
    .map(([label, value]) => `- ${label}: ${value}`)
    .join('\n')

  return [
    `# ${plan.title}`,
    '',
    '> Local Document.filePath snapshot generated from existing DB `Document.content`.',
    '> This is a locator/coverage remediation artifact, not fresh source verification.',
    '> Canonical external URL remains authoritative where listed below.',
    '',
    '## Metadata',
    '',
    metadata,
    '',
    '## Source Text Snapshot',
    '',
    sanitizeContent(doc.content),
    '',
  ].join('\n')
}

export function buildExportPlans(params: {
  documents: SnapshotDocument[]
  root: string
  pathExists: (path: string) => boolean
}): { plans: ExportPlan[]; skipped: ExportSkip[] } {
  const skipped: ExportSkip[] = []
  const plans: ExportPlan[] = []

  for (const doc of params.documents) {
    if (doc.filePath) {
      skipped.push({ id: doc.id, slug: doc.slug, reason: 'document already has filePath' })
      continue
    }
    if (!doc.url && !doc.archivedUrl && doc.report?.provenanceType !== 'blocked_source') {
      skipped.push({ id: doc.id, slug: doc.slug, reason: 'no canonical or archived URL' })
      continue
    }

    const sanitized = sanitizeContent(doc.content)
    if (!sanitized.trim()) {
      skipped.push({ id: doc.id, slug: doc.slug, reason: 'empty Document.content' })
      continue
    }

    const slugPath = safeSlugPath(doc.slug)
    const filePath = `research/${slugPath}.md`
    const absolutePath = join(params.root, filePath)
    if (params.pathExists(filePath)) {
      skipped.push({ id: doc.id, slug: doc.slug, reason: `target file already exists: ${filePath}` })
      continue
    }

    plans.push({
      documentId: doc.id,
      slug: doc.slug,
      title: doc.title,
      filePath,
      absolutePath,
      contentHash: contentHashFor(doc.content),
      contentChars: sanitized.length,
    })
  }

  return { plans, skipped }
}

async function loadDocuments(prisma: PrismaClient, ids: string[]): Promise<SnapshotDocument[]> {
  return prisma.document.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      slug: true,
      title: true,
      author: true,
      year: true,
      documentType: true,
      category: true,
      subcategory: true,
      country: true,
      url: true,
      archivedUrl: true,
      filePath: true,
      content: true,
      report: { select: { provenanceType: true } },
    },
    orderBy: { slug: 'asc' },
  })
}

export async function runMissingDocumentFileSnapshotExport(argv: string[] = process.argv.slice(2)) {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required')

  const apply = parseApplyMode(argv)
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter })

  try {
    const ids = missingDocumentIds(ROOT)
    const documents = await loadDocuments(prisma, ids)
    const { plans, skipped } = buildExportPlans({
      documents,
      root: ROOT,
      pathExists: path => existsSync(join(ROOT, path)),
    })

    const collisions = await prisma.document.findMany({
      where: {
        filePath: { in: plans.map(plan => plan.filePath) },
        id: { notIn: plans.map(plan => plan.documentId) },
      },
      select: { id: true, slug: true, filePath: true },
    })

    if (collisions.length > 0) {
      throw new Error(
        `Refusing export because target filePath values are already used: ${JSON.stringify(collisions, null, 2)}`,
      )
    }

    const exportedRows: ExportPlan[] = []
    if (apply) {
      const byId = new Map(documents.map(doc => [doc.id, doc]))
      for (const plan of plans) {
        const doc = byId.get(plan.documentId)
        if (!doc) continue
        mkdirSync(dirname(plan.absolutePath), { recursive: true })
        writeFileSync(plan.absolutePath, markdownFor(plan, doc), 'utf-8')
        await prisma.document.update({
          where: { id: plan.documentId },
          data: { filePath: plan.filePath },
        })
        exportedRows.push(plan)
      }
    }

    const summary = {
      mode: apply ? 'apply' : 'dry-run',
      requested: ids.length,
      planned: plans.length,
      exported: exportedRows.length,
      skipped: skipped.length,
      totalContentChars: plans.reduce((sum, plan) => sum + plan.contentChars, 0),
      plannedRows: plans.map(plan => ({
        documentId: plan.documentId,
        slug: plan.slug,
        filePath: plan.filePath,
        contentChars: plan.contentChars,
        contentHash: plan.contentHash,
      })),
      exportedRows: exportedRows.map(plan => ({
        documentId: plan.documentId,
        slug: plan.slug,
        filePath: plan.filePath,
        contentChars: plan.contentChars,
        contentHash: plan.contentHash,
      })),
      skippedRows: skipped,
    }
    console.log(JSON.stringify(summary, null, 2))
    return summary
  } finally {
    await prisma.$disconnect()
  }
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href
if (isMain) {
  runMissingDocumentFileSnapshotExport().catch((error) => {
    console.error('[document-file-snapshot-export] failed:', error)
    process.exit(1)
  })
}
