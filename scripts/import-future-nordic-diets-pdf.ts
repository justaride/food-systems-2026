import 'dotenv/config'
import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const APPLY = process.argv.includes('--apply')

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const documentFilePath = 'research/evidence-pack/nordisk/future-nordic-diets-tn2017-566.pdf'
const reportId = 'future-nordic-diets-tn2017-566'
const sourceDocId = 'src-182'

function fileExists(relativePath: string) {
  return fs.existsSync(path.join(process.cwd(), relativePath))
}

function extractPdfText(relativePath: string) {
  const absolutePath = path.join(process.cwd(), relativePath)
  return execFileSync('pdftotext', [absolutePath, '-'], {
    encoding: 'utf8',
    maxBuffer: 40 * 1024 * 1024,
  }).trim()
}

function countWords(content: string) {
  return content.split(/\s+/).filter(Boolean).length
}

async function main() {
  if (!fileExists(documentFilePath)) {
    console.log(JSON.stringify({ apply: APPLY, status: 'blocked-missing-pdf', documentFilePath }, null, 2))
    return
  }

  const [existingDocument, existingReport, existingSourceDoc] = await Promise.all([
    prisma.document.findUnique({
      where: { filePath: documentFilePath },
      select: { id: true, title: true, filePath: true, wordCount: true, report: { select: { id: true } }, sourceDoc: { select: { id: true } } },
    }),
    prisma.report.findUnique({
      where: { id: reportId },
      select: { id: true, title: true, documentId: true },
    }),
    prisma.sourceDoc.findUnique({
      where: { id: sourceDocId },
      select: { id: true, title: true, documentId: true },
    }),
  ])

  if (!existingReport) {
    console.log(JSON.stringify({ apply: APPLY, status: 'blocked-missing-report', reportId }, null, 2))
    return
  }

  if (existingDocument?.report && existingDocument.report.id !== reportId) {
    console.log(JSON.stringify({
      apply: APPLY,
      status: 'blocked-document-linked-to-other-report',
      documentId: existingDocument.id,
      existingReportId: existingDocument.report.id,
    }, null, 2))
    return
  }

  if (existingDocument?.sourceDoc && existingDocument.sourceDoc.id !== sourceDocId) {
    console.log(JSON.stringify({
      apply: APPLY,
      status: 'blocked-document-linked-to-other-sourcedoc',
      documentId: existingDocument.id,
      existingSourceDocId: existingDocument.sourceDoc.id,
    }, null, 2))
    return
  }

  if (existingReport.documentId && existingDocument && existingReport.documentId !== existingDocument.id) {
    console.log(JSON.stringify({
      apply: APPLY,
      status: 'blocked-report-linked-to-other-document',
      currentDocumentId: existingReport.documentId,
      targetDocumentId: existingDocument.id,
    }, null, 2))
    return
  }

  if (existingSourceDoc?.documentId && existingDocument && existingSourceDoc.documentId !== existingDocument.id) {
    console.log(JSON.stringify({
      apply: APPLY,
      status: 'blocked-sourcedoc-linked-to-other-document',
      currentDocumentId: existingSourceDoc.documentId,
      targetDocumentId: existingDocument.id,
    }, null, 2))
    return
  }

  const content = existingDocument ? null : extractPdfText(documentFilePath)
  const wordCount = existingDocument ? existingDocument.wordCount : countWords(content!)
  const alreadyFullyLinked =
    existingDocument &&
    existingReport.documentId === existingDocument.id &&
    existingSourceDoc?.documentId === existingDocument.id

  if (!APPLY) {
    console.log(JSON.stringify({
      apply: APPLY,
      status: alreadyFullyLinked
        ? 'already-linked'
        : existingDocument
          ? 'would-link-existing-document'
          : 'would-create-document-and-link',
      reportId,
      sourceDocId,
      documentId: existingDocument?.id ?? null,
      documentFilePath,
      wordCount,
      reportDocumentId: existingReport.documentId,
      sourceDocDocumentId: existingSourceDoc?.documentId ?? null,
    }, null, 2))
    return
  }

  const document = await prisma.document.upsert({
    where: { filePath: documentFilePath },
    update: {
      title: 'Future Nordic Diets: Exploring ways for sustainably feeding the Nordics',
      author: 'Johan Karlsson, Elin Röös m.fl.',
      year: 2017,
      documentType: 'report',
      category: 'evidence-pack',
      subcategory: 'nordisk',
      country: 'Nordic',
      url: 'https://www.norden.org/en/publication/future-nordic-diets',
      tags: ['fremtidig-kosthold', 'nordisk', 'scenario', 'selvforsyning', 'klima', 'organisk', 'kjott', 'baerekraft', 'TemaNord'],
    },
    create: {
      slug: 'evidence-pack/nordisk/future-nordic-diets-tn2017-566',
      filePath: documentFilePath,
      title: 'Future Nordic Diets: Exploring ways for sustainably feeding the Nordics',
      author: 'Johan Karlsson, Elin Röös m.fl.',
      year: 2017,
      documentType: 'report',
      category: 'evidence-pack',
      subcategory: 'nordisk',
      country: 'Nordic',
      content: content!,
      summary:
        'Scenariorapport (TemaNord 2017:566) som modellerer to fremtider for nordisk matsystem basert på organisk drift. Viser at Norden kan bli selvforsynt i 2030 med 81–90 % kjøttreduksjon og tilsvarende GHG-kutt i tråd med Parisavtalen.',
      url: 'https://www.norden.org/en/publication/future-nordic-diets',
      wordCount,
      tags: ['fremtidig-kosthold', 'nordisk', 'scenario', 'selvforsyning', 'klima', 'organisk', 'kjott', 'baerekraft', 'TemaNord'],
      metadata: {
        doi: '10.6027/TN2017-566',
        publicationNumber: 'TemaNord 2017:566',
        pdfUrl: 'https://norden.diva-portal.org/smash/get/diva2:1163192/FULLTEXT01.pdf',
        importedBy: 'scripts/import-future-nordic-diets-pdf.ts',
        importedAt: new Date().toISOString(),
      },
    },
  })

  await prisma.sourceDoc.upsert({
    where: { id: sourceDocId },
    update: {
      filename: documentFilePath,
      title: 'Future Nordic Diets: Exploring ways for sustainably feeding the Nordics',
      author: 'Johan Karlsson, Elin Röös m.fl.',
      year: '2017',
      sourceType: 'rapport',
      description: 'TemaNord 2017:566: To scenarioer (SY/EY) for nordisk matsystem med organisk drift. Kjøttreduksjon 81–90 %; GHG-kutt til 310–700 kg CO₂-ekv/person/år.',
      relevance: 'Sentral referanse for nordisk selvforsyning, scenariebasert matsystemanalyse og klimaforenlighet. Spor A og nordisk komparativ.',
      url: 'https://www.norden.org/en/publication/future-nordic-diets',
      doi: '10.6027/TN2017-566',
      publisher: 'Nordic Council of Ministers',
      documentId: document.id,
    },
    create: {
      id: sourceDocId,
      filename: documentFilePath,
      title: 'Future Nordic Diets: Exploring ways for sustainably feeding the Nordics',
      author: 'Johan Karlsson, Elin Röös m.fl.',
      year: '2017',
      sourceType: 'rapport',
      description: 'TemaNord 2017:566: To scenarioer (SY/EY) for nordisk matsystem med organisk drift. Kjøttreduksjon 81–90 %; GHG-kutt til 310–700 kg CO₂-ekv/person/år.',
      relevance: 'Sentral referanse for nordisk selvforsyning, scenariebasert matsystemanalyse og klimaforenlighet. Spor A og nordisk komparativ.',
      url: 'https://www.norden.org/en/publication/future-nordic-diets',
      doi: '10.6027/TN2017-566',
      publisher: 'Nordic Council of Ministers',
      documentId: document.id,
    },
  })

  await prisma.report.update({
    where: { id: reportId },
    data: { documentId: document.id },
  })

  console.log(JSON.stringify({
    apply: APPLY,
    status: 'imported-and-linked',
    reportId,
    sourceDocId,
    documentId: document.id,
    documentFilePath,
    wordCount,
  }, null, 2))
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
