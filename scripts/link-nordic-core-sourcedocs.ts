import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const APPLY = process.argv.includes('--apply')

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

type LinkTarget = {
  sourceDocId: string
  reportId?: string
  documentFilePath: string
  note: string
}

const targets: LinkTarget[] = [
  {
    sourceDocId: 'src-food-17957bbc99a8',
    documentFilePath:
      'research/arkiv-sortert/Food Research Process 20.04.26/04_Food_Waste_And_Circularity/Policy commitment_ Reducing food waste for a green Nordic Region _ Nordic cooperation.pdf',
    note: 'Nordic cooperation policy commitment on food waste',
  },
  {
    sourceDocId: 'src-food-559ac48dbd62',
    documentFilePath:
      'research/arkiv-sortert/Food Research Process 20.04.26/05_Foodtech_Alt_Protein_And_Innovation/The Nordic alternative protein research ecosystem - GFI Europe.pdf',
    note: 'GFI Europe Nordic alternative protein ecosystem',
  },
  {
    sourceDocId: 'src-food-d760f6d96053',
    reportId: 'norden-policy-2024',
    documentFilePath:
      'research/arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/nord2024-007.pdf',
    note: 'Nordic policy tools for sustainable and healthy eating',
  },
  {
    sourceDocId: 'src-food-8047a53676d7',
    reportId: 'sirkularitet-matsvinn-2024',
    documentFilePath:
      'research/arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/nord2024-034.pdf',
    note: 'Nordic food waste solutions / Breaking Barriers',
  },
  {
    sourceDocId: 'src-food-dc5f1fd3d327',
    documentFilePath: 'research/evidence-pack/tenketank/stockholm-resilience-2019.pdf',
    note: 'Stockholm Resilience Centre Nordic food systems report',
  },
]

async function linkReport(target: LinkTarget, documentId: string) {
  if (!target.reportId) return undefined

  const report = await prisma.report.findUnique({
    where: { id: target.reportId },
    select: { id: true, title: true, documentId: true },
  })

  if (!report) return { reportId: target.reportId, status: 'missing-report' }
  if (report.documentId === documentId) return { reportId: report.id, status: 'already-linked' }

  if (APPLY) {
    await prisma.report.update({
      where: { id: report.id },
      data: { documentId },
    })
  }

  return {
    reportId: report.id,
    status: APPLY ? 'linked' : 'would-link',
    previousDocumentId: report.documentId,
    documentId,
  }
}

async function main() {
  const results: Array<Record<string, unknown>> = []

  for (const target of targets) {
    const [sourceDoc, document] = await Promise.all([
      prisma.sourceDoc.findUnique({
        where: { id: target.sourceDocId },
        select: { id: true, title: true, documentId: true },
      }),
      prisma.document.findUnique({
        where: { filePath: target.documentFilePath },
        select: { id: true, title: true, filePath: true },
      }),
    ])

    if (!sourceDoc) {
      results.push({ ...target, status: 'missing-sourcedoc' })
      continue
    }

    if (!document) {
      results.push({ ...target, status: 'missing-document' })
      continue
    }

    if (sourceDoc.documentId && sourceDoc.documentId !== document.id) {
      results.push({
        ...target,
        status: 'blocked-already-linked-to-other-document',
        currentDocumentId: sourceDoc.documentId,
        targetDocumentId: document.id,
      })
      continue
    }

    const reportStatus = await linkReport(target, document.id)

    if (sourceDoc.documentId === document.id) {
      results.push({
        ...target,
        status: 'already-linked',
        documentId: document.id,
        reportStatus,
      })
      continue
    }

    if (APPLY) {
      await prisma.sourceDoc.update({
        where: { id: sourceDoc.id },
        data: { documentId: document.id },
      })
    }

    results.push({
      ...target,
      status: APPLY ? 'linked' : 'would-link',
      documentId: document.id,
      sourceTitle: sourceDoc.title,
      documentTitle: document.title,
      reportStatus,
    })
  }

  console.log(JSON.stringify({ apply: APPLY, results }, null, 2))
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
