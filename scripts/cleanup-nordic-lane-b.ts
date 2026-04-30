import 'dotenv/config'
import fs from 'node:fs'
import path from 'node:path'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const APPLY = process.argv.includes('--apply')

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

type AttachFileAndLinkReport = {
  kind: 'attach-file-and-link-report'
  reportId: string
  documentId: string
  targetFilePath: string
  note: string
}

type MoveReportLink = {
  kind: 'move-report-link'
  reportId: string
  fromDocumentId: string
  toDocumentId: string
  note: string
}

type LaneBAction = AttachFileAndLinkReport | MoveReportLink

const actions: LaneBAction[] = [
  {
    kind: 'attach-file-and-link-report',
    reportId: 'konkurrensverket-2025-5-livsmedelsutredning',
    documentId: 'cmoh0jq8j001gvw0dq305lmb4',
    targetFilePath:
      'research/arkiv-sortert/Food Research Process 20.04.26/03_Policy_Governance_And_Market/Konkurrensverket - rapport 2025 5 (2024).pdf',
    note: 'Attach local PDF to existing SourceDoc-backed placeholder Document and link static Report.',
  },
  {
    kind: 'move-report-link',
    reportId: 'stockholm-resilience-2019',
    fromDocumentId: 'cmnyng39z00egd50dtdgv6gpt',
    toDocumentId: 'cmoh2g8s10046n60d1rikrioz',
    note: 'Move Report link from stale evidence-pack path to SourceDoc-backed research/evidence-pack Document.',
  },
]

function existsInWorkspace(relativePath: string) {
  return fs.existsSync(path.join(process.cwd(), relativePath))
}

async function attachFileAndLinkReport(action: AttachFileAndLinkReport) {
  const [report, document, conflict] = await Promise.all([
    prisma.report.findUnique({
      where: { id: action.reportId },
      select: { id: true, title: true, documentId: true },
    }),
    prisma.document.findUnique({
      where: { id: action.documentId },
      select: {
        id: true,
        title: true,
        filePath: true,
        sourceDoc: { select: { id: true, title: true } },
        report: { select: { id: true, title: true } },
      },
    }),
    prisma.document.findUnique({
      where: { filePath: action.targetFilePath },
      select: { id: true, title: true },
    }),
  ])

  if (!report) {
    return { ...action, status: 'blocked-missing-report' }
  }

  if (!document) {
    return { ...action, status: 'blocked-missing-document' }
  }

  if (!existsInWorkspace(action.targetFilePath)) {
    return { ...action, status: 'blocked-target-file-missing', documentTitle: document.title }
  }

  if (conflict && conflict.id !== document.id) {
    return {
      ...action,
      status: 'blocked-target-path-owned-by-other-document',
      conflictDocumentId: conflict.id,
      conflictTitle: conflict.title,
    }
  }

  if (document.report && document.report.id !== report.id) {
    return {
      ...action,
      status: 'blocked-document-already-linked-to-other-report',
      existingReportId: document.report.id,
      existingReportTitle: document.report.title,
    }
  }

  if (report.documentId && report.documentId !== document.id) {
    return {
      ...action,
      status: 'blocked-report-already-linked-to-other-document',
      currentDocumentId: report.documentId,
    }
  }

  if (document.filePath && document.filePath !== action.targetFilePath) {
    return {
      ...action,
      status: 'blocked-unexpected-current-path',
      currentFilePath: document.filePath,
      documentTitle: document.title,
    }
  }

  const pathStatus = document.filePath === action.targetFilePath ? 'already-has-file' : APPLY ? 'file-attached' : 'would-attach-file'
  const linkStatus = report.documentId === document.id ? 'already-linked' : APPLY ? 'linked' : 'would-link'

  if (APPLY) {
    if (document.filePath !== action.targetFilePath) {
      await prisma.document.update({
        where: { id: document.id },
        data: { filePath: action.targetFilePath },
      })
    }

    if (report.documentId !== document.id) {
      await prisma.report.update({
        where: { id: report.id },
        data: { documentId: document.id },
      })
    }
  }

  return {
    ...action,
    status: `${pathStatus}+${linkStatus}`,
    reportTitle: report.title,
    documentTitle: document.title,
    sourceDocId: document.sourceDoc?.id ?? null,
  }
}

async function moveReportLink(action: MoveReportLink) {
  const [report, fromDocument, toDocument] = await Promise.all([
    prisma.report.findUnique({
      where: { id: action.reportId },
      select: { id: true, title: true, documentId: true },
    }),
    prisma.document.findUnique({
      where: { id: action.fromDocumentId },
      select: { id: true, title: true, filePath: true },
    }),
    prisma.document.findUnique({
      where: { id: action.toDocumentId },
      select: {
        id: true,
        title: true,
        filePath: true,
        report: { select: { id: true, title: true } },
        sourceDoc: { select: { id: true, title: true } },
      },
    }),
  ])

  if (!report) {
    return { ...action, status: 'blocked-missing-report' }
  }

  if (!fromDocument) {
    return { ...action, status: 'blocked-missing-from-document' }
  }

  if (!toDocument) {
    return { ...action, status: 'blocked-missing-target-document' }
  }

  if (report.documentId && report.documentId !== action.fromDocumentId && report.documentId !== action.toDocumentId) {
    return {
      ...action,
      status: 'blocked-report-linked-to-unexpected-document',
      currentDocumentId: report.documentId,
    }
  }

  if (toDocument.report && toDocument.report.id !== report.id) {
    return {
      ...action,
      status: 'blocked-target-document-linked-to-other-report',
      existingReportId: toDocument.report.id,
      existingReportTitle: toDocument.report.title,
    }
  }

  if (!toDocument.filePath || !existsInWorkspace(toDocument.filePath)) {
    return {
      ...action,
      status: 'blocked-target-file-missing',
      targetFilePath: toDocument.filePath,
      targetDocumentTitle: toDocument.title,
    }
  }

  if (report.documentId === action.toDocumentId) {
    return {
      ...action,
      status: 'already-moved',
      reportTitle: report.title,
      fromDocumentTitle: fromDocument.title,
      toDocumentTitle: toDocument.title,
      targetFilePath: toDocument.filePath,
      sourceDocId: toDocument.sourceDoc?.id ?? null,
    }
  }

  if (APPLY) {
    await prisma.report.update({
      where: { id: report.id },
      data: { documentId: toDocument.id },
    })
  }

  return {
    ...action,
    status: APPLY ? 'moved' : 'would-move',
    reportTitle: report.title,
    fromDocumentTitle: fromDocument.title,
    fromDocumentFilePath: fromDocument.filePath,
    toDocumentTitle: toDocument.title,
    targetFilePath: toDocument.filePath,
    sourceDocId: toDocument.sourceDoc?.id ?? null,
  }
}

async function main() {
  const results = []

  for (const action of actions) {
    if (action.kind === 'attach-file-and-link-report') {
      results.push(await attachFileAndLinkReport(action))
      continue
    }

    results.push(await moveReportLink(action))
  }

  console.log(JSON.stringify({ apply: APPLY, results }, null, 2))
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
