import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const APPLY = process.argv.includes('--apply')

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

type PathUpdate = {
  kind: 'path-update'
  documentId: string
  fromPath: string
  toPath: string
  note: string
}

type ReportLink = {
  kind: 'report-link'
  reportId: string
  documentFilePath: string
  note: string
}

type CombinedAction = {
  kind: 'path-update-and-report-link'
  reportId: string
  documentId: string
  fromPath: string
  toPath: string
  note: string
}

type CleanupAction = PathUpdate | ReportLink | CombinedAction

const actions: CleanupAction[] = [
  {
    kind: 'report-link',
    reportId: 'norden-policy-2024',
    documentFilePath:
      'research/arkiv-sortert/Food Research Process 20.04.26/07_Academic_Research_And_Theses/nord2024-007.pdf',
    note: 'Link static Report row to the already imported Nord 2024:007 PDF Document.',
  },
  {
    kind: 'path-update-and-report-link',
    reportId: 'finland-food2030',
    documentId: 'cmmxa66ng003wty0dlfdpgu2b',
    fromPath: 'evidence-pack/nordisk/finland-food2030.pdf',
    toPath: 'research/evidence-pack/nordisk/finland-food2030.pdf',
    note: 'Fix stale evidence-pack path prefix and link Finland Food2030 Report.',
  },
  {
    kind: 'path-update',
    documentId: 'cmmxa66oq003zty0dhw4emg34',
    fromPath: 'evidence-pack/nordisk/kfst-salling-coop-2025-full.pdf',
    toPath: 'research/evidence-pack/nordisk/kfst-salling-coop-2025-full.pdf',
    note: 'Fix stale path prefix for canonical KFST Salling/Coop decision Document.',
  },
  {
    kind: 'path-update',
    documentId: 'cmmxa66pi0041ty0d24w2ndou',
    fromPath: 'evidence-pack/nordisk/konkurrensverket-summary-2024.pdf',
    toPath: 'research/evidence-pack/nordisk/konkurrensverket-summary-2024.pdf',
    note: 'Fix stale path prefix for linked Konkurrensverket 2024 summary Document.',
  },
]

function existsInWorkspace(relativePath: string) {
  return fs.existsSync(path.join(process.cwd(), relativePath))
}

async function checkPathUpdate(action: PathUpdate | CombinedAction) {
  const document = await prisma.document.findUnique({
    where: { id: action.documentId },
    select: { id: true, title: true, filePath: true },
  })

  if (!document) {
    return { ...action, status: 'blocked-missing-document' }
  }

  if (document.filePath !== action.fromPath && document.filePath !== action.toPath) {
    return {
      ...action,
      status: 'blocked-unexpected-current-path',
      currentPath: document.filePath,
      documentTitle: document.title,
    }
  }

  if (!existsInWorkspace(action.toPath)) {
    return { ...action, status: 'blocked-target-file-missing', documentTitle: document.title }
  }

  const conflict = await prisma.document.findUnique({
    where: { filePath: action.toPath },
    select: { id: true, title: true },
  })

  if (conflict && conflict.id !== document.id) {
    return {
      ...action,
      status: 'blocked-target-path-owned-by-other-document',
      currentPath: document.filePath,
      conflictDocumentId: conflict.id,
      conflictTitle: conflict.title,
    }
  }

  if (document.filePath === action.toPath) {
    return {
      ...action,
      status: 'already-updated',
      documentTitle: document.title,
      exactOldPathExists: existsInWorkspace(action.fromPath),
    }
  }

  if (APPLY) {
    await prisma.document.update({
      where: { id: document.id },
      data: { filePath: action.toPath },
    })
  }

  return {
    ...action,
    status: APPLY ? 'path-updated' : 'would-update-path',
    documentTitle: document.title,
    exactOldPathExists: existsInWorkspace(action.fromPath),
  }
}

async function checkReportLink(reportId: string, documentFilePath: string, note: string) {
  const [report, document] = await Promise.all([
    prisma.report.findUnique({
      where: { id: reportId },
      select: { id: true, title: true, documentId: true },
    }),
    prisma.document.findUnique({
      where: { filePath: documentFilePath },
      select: {
        id: true,
        title: true,
        filePath: true,
        report: { select: { id: true, title: true } },
      },
    }),
  ])

  if (!report) {
    return { kind: 'report-link' as const, reportId, documentFilePath, note, status: 'blocked-missing-report' }
  }

  if (!document) {
    return { kind: 'report-link' as const, reportId, documentFilePath, note, status: 'blocked-missing-document' }
  }

  if (report.documentId && report.documentId !== document.id) {
    return {
      kind: 'report-link' as const,
      reportId,
      documentFilePath,
      note,
      status: 'blocked-report-already-linked-to-other-document',
      currentDocumentId: report.documentId,
      targetDocumentId: document.id,
    }
  }

  if (document.report && document.report.id !== report.id) {
    return {
      kind: 'report-link' as const,
      reportId,
      documentFilePath,
      note,
      status: 'blocked-document-already-linked-to-other-report',
      targetDocumentId: document.id,
      existingReportId: document.report.id,
      existingReportTitle: document.report.title,
    }
  }

  if (report.documentId === document.id) {
    return {
      kind: 'report-link' as const,
      reportId,
      documentFilePath,
      note,
      status: 'already-linked',
      documentId: document.id,
      reportTitle: report.title,
      documentTitle: document.title,
    }
  }

  if (APPLY) {
    await prisma.report.update({
      where: { id: report.id },
      data: { documentId: document.id },
    })
  }

  return {
    kind: 'report-link' as const,
    reportId,
    documentFilePath,
    note,
    status: APPLY ? 'linked' : 'would-link',
    documentId: document.id,
    reportTitle: report.title,
    documentTitle: document.title,
  }
}

async function checkReportLinkByDocumentId(reportId: string, documentId: string, note: string) {
  const [report, document] = await Promise.all([
    prisma.report.findUnique({
      where: { id: reportId },
      select: { id: true, title: true, documentId: true },
    }),
    prisma.document.findUnique({
      where: { id: documentId },
      select: {
        id: true,
        title: true,
        filePath: true,
        report: { select: { id: true, title: true } },
      },
    }),
  ])

  if (!report) {
    return { kind: 'report-link' as const, reportId, documentId, note, status: 'blocked-missing-report' }
  }

  if (!document) {
    return { kind: 'report-link' as const, reportId, documentId, note, status: 'blocked-missing-document' }
  }

  if (report.documentId && report.documentId !== document.id) {
    return {
      kind: 'report-link' as const,
      reportId,
      documentId,
      note,
      status: 'blocked-report-already-linked-to-other-document',
      currentDocumentId: report.documentId,
      targetDocumentId: document.id,
    }
  }

  if (document.report && document.report.id !== report.id) {
    return {
      kind: 'report-link' as const,
      reportId,
      documentId,
      note,
      status: 'blocked-document-already-linked-to-other-report',
      targetDocumentId: document.id,
      existingReportId: document.report.id,
      existingReportTitle: document.report.title,
    }
  }

  if (report.documentId === document.id) {
    return {
      kind: 'report-link' as const,
      reportId,
      documentId: document.id,
      documentFilePath: document.filePath,
      note,
      status: 'already-linked',
      reportTitle: report.title,
      documentTitle: document.title,
    }
  }

  if (APPLY) {
    await prisma.report.update({
      where: { id: report.id },
      data: { documentId: document.id },
    })
  }

  return {
    kind: 'report-link' as const,
    reportId,
    documentId: document.id,
    documentFilePath: document.filePath,
    note,
    status: APPLY ? 'linked' : 'would-link',
    reportTitle: report.title,
    documentTitle: document.title,
  }
}

async function main() {
  const results = []

  for (const action of actions) {
    if (action.kind === 'path-update') {
      results.push(await checkPathUpdate(action))
      continue
    }

    if (action.kind === 'report-link') {
      results.push(await checkReportLink(action.reportId, action.documentFilePath, action.note))
      continue
    }

    const pathResult = await checkPathUpdate(action)
    results.push(pathResult)

    if (!String(pathResult.status).startsWith('blocked')) {
      results.push(await checkReportLinkByDocumentId(action.reportId, action.documentId, action.note))
    }
  }

  console.log(JSON.stringify({ apply: APPLY, results }, null, 2))
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
