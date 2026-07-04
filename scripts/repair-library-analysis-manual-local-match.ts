import 'dotenv/config'
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import {
  dirname,
  extname,
  resolve,
} from 'node:path'
import { createLibraryAnalysisPrismaClient } from './library-analysis-common'
import {
  LIBRARY_ANALYSIS_MANUAL_LOCAL_MATCH_REPAIR_PLAN_JSON_PATH,
  LIBRARY_ANALYSIS_MANUAL_LOCAL_MATCH_REPAIR_PLAN_MD_PATH,
  buildLibraryAnalysisManualLocalMatchRepairPlan,
  formatLibraryAnalysisManualLocalMatchRepairPlanMarkdown,
  type LibraryAnalysisManualLocalMatchRepairFile,
  type LibraryAnalysisManualLocalMatchRepairMapping,
  type LibraryAnalysisManualLocalMatchRepairPlan,
} from '../src/lib/library-analysis-manual-local-match-repair'

const BACKUP_PATH = 'research/_status/library-analysis-manual-local-match-backup.jsonl'
const MAX_TEXT_FILE_BYTES = 2 * 1024 * 1024
const SUPPORTED_LOCAL_TEXT_EXTENSIONS = new Set(['.md', '.txt', '.json', '.csv', '.tsv'])

const REVIEWED_LOCAL_MATCHES: LibraryAnalysisManualLocalMatchRepairMapping[] = [
  {
    sourceKey: 'document:cmqgiocku00l74nvmv8w9jpuu',
    documentId: 'cmqgiocku00l74nvmv8w9jpuu',
    title: 'NORDIC NUTRITION RECOMMENDATIONS 2023',
    localPath: 'research/bibliotek/nordisk/nnr2023-nordic-nutrition-recommendations.md',
    expectedTitleIncludes: ['NORDIC NUTRITION RECOMMENDATIONS 2023'],
    expectedUrlIncludes: ['pub.norden.org/nord2023-003'],
    reviewNote: 'Exact local markdown match found in research/bibliotek during P1 decision-queue review.',
  },
  {
    sourceKey: 'document:cmppajywm001fnjvm3ugcn86r',
    documentId: 'cmppajywm001fnjvm3ugcn86r',
    title: 'NIBIO: Metode for selvforsyningsberegning',
    localPath: 'research/bibliotek/beredskap/nibio-selvforsyning-metode.md',
    expectedTitleIncludes: ['NIBIO', 'selvforsyningsberegning'],
    reviewNote: 'Strong local markdown match found in research/bibliotek during P1 decision-queue review.',
  },
  {
    sourceKey: 'document:cmppajyso000cnjvm1vx5gvhu',
    documentId: 'cmppajyso000cnjvm1vx5gvhu',
    title: 'Matsystemutvalget - Status 2026',
    localPath: 'research/bibliotek/nou/matsystemutvalget-status-2026.md',
    expectedTitleIncludes: ['Matsystemutvalget', 'Status 2026'],
    reviewNote: 'Strong local markdown match found in research/bibliotek during P1 decision-queue review.',
  },
  {
    sourceKey: 'document:cmppajyvy0018njvmtrhi7iw8',
    documentId: 'cmppajyvy0018njvmtrhi7iw8',
    title: 'Reducing food waste in the HORECA sector using AI-based waste tracking technology',
    localPath: 'research/bibliotek/akademia/pubmed/sigala-eg-2025-reducing-food-waste-in-the.md',
    expectedTitleIncludes: ['Reducing food waste in the HORECA sector'],
    expectedUrlIncludes: ['10.1016/j.wasman.2025.02.044'],
    reviewNote: 'Exact local PubMed markdown match found during remaining P1 review.',
  },
  {
    sourceKey: 'document:cmppajyys0020njvmgyo6usd7',
    documentId: 'cmppajyys0020njvmgyo6usd7',
    title: 'KKV - Konkurranseloven 4a (Dominans)',
    localPath: 'research/bibliotek/nordisk/finland-4a-dominans-haandheving.md',
    expectedTitleIncludes: ['KKV', 'Dominans'],
    expectedUrlIncludes: ['competition-act-provision-on-grocery-trade'],
    reviewNote: 'Strong local markdown match found during remaining P1 review.',
  },
  {
    sourceKey: 'document:cmppajyv60010njvmqvtgrlw9',
    documentId: 'cmppajyv60010njvmqvtgrlw9',
    title: 'Civita vs. Manifest - Matmaktdebatten',
    localPath: 'research/bibliotek/tenketanker/civita-manifest-debatt.md',
    expectedTitleIncludes: ['Civita', 'Manifest'],
    expectedUrlIncludes: ['svak-konkurranse-som-fortjent'],
    reviewNote: 'Strong local markdown match found during remaining P1 review.',
  },
  {
    sourceKey: 'document:cmppajyv3000znjvm24f56eod',
    documentId: 'cmppajyv3000znjvm24f56eod',
    title: 'Merkevarenes historie - Orkla og TINE',
    localPath: 'research/bibliotek/bransje/organisasjoner/merkevarer-historie.md',
    expectedTitleIncludes: ['Merkevarenes historie', 'Orkla', 'TINE'],
    reviewNote: 'Seeded internal synthesis points to this local historikknotat in prisma/seed-data/reports.ts.',
  },
  {
    sourceKey: 'document:cmppajyul000tnjvmlzlt7jek',
    documentId: 'cmppajyul000tnjvmlzlt7jek',
    title: 'Verdibutikkene - Normal og Europris',
    localPath: 'research/bibliotek/bransje/arsrapporter/verdibutikker-utfordrere.md',
    expectedTitleIncludes: ['Verdibutikkene', 'Normal', 'Europris'],
    reviewNote: 'Seeded composite source points to this local sammenstillingsnotat in prisma/seed-data/reports.ts.',
  },
  {
    sourceKey: 'document:cmppajywj001enjvm0m816xpe',
    documentId: 'cmppajywj001enjvm0m816xpe',
    title: 'Offentlig rapportlogg - matsektor',
    localPath: 'research/bibliotek/offentlig-rapportlogg-prioritert.md',
    expectedTitleIncludes: ['Offentlig rapportlogg', 'matsektor'],
    reviewNote: 'Seeded internal register points to this local offentlig rapportregister in prisma/seed-data/reports.ts.',
  },
  {
    sourceKey: 'document:cmppajyzt002bnjvmy46d4szp',
    documentId: 'cmppajyzt002bnjvmy46d4szp',
    title: 'Nordisk matmaktkonsentrasjon - historikk',
    localPath: 'research/bibliotek/nordisk-matmakt-historikk.md',
    expectedTitleIncludes: ['Nordisk matmaktkonsentrasjon', 'historikk'],
    reviewNote: 'Seeded internal synthesis points to this local historikknotat in prisma/seed-data/reports.ts.',
  },
  {
    sourceKey: 'document:cmppajyyf001wnjvmhfj24z4o',
    documentId: 'cmppajyyf001wnjvmhfj24z4o',
    title: 'Nordisk avhandlingsregister - matpolitikk',
    localPath: 'research/bibliotek/akademia/nordisk-avhandlingsregister.md',
    expectedTitleIncludes: ['Nordisk avhandlingsregister'],
    reviewNote: 'Seeded internal register points to this local avhandlingsregister in prisma/seed-data/reports.ts.',
  },
  {
    sourceKey: 'document:cmppajyy5001tnjvmkbpjz5j7',
    documentId: 'cmppajyy5001tnjvmkbpjz5j7',
    title: 'NOU-er og stortingsdokumenter - juridisk oversikt',
    localPath: 'research/bibliotek/nou-stortingsdok-juridisk.md',
    expectedTitleIncludes: ['NOU-er', 'stortingsdokumenter'],
    reviewNote: 'Seeded internal register points to this local juridisk register in prisma/seed-data/reports.ts.',
  },
  {
    sourceKey: 'document:cmppajyxq001qnjvmgci4vrq4',
    documentId: 'cmppajyxq001qnjvmgci4vrq4',
    title: 'Nordiske mat-tenkere og paavirkernettverk',
    localPath: 'research/bibliotek/nordisk-mat-tenkere.md',
    expectedTitleIncludes: ['Nordiske mat-tenkere'],
    reviewNote: 'Seeded internal synthesis points to this local nettverkskart in prisma/seed-data/reports.ts.',
  },
  {
    sourceKey: 'document:cmppajysy000enjvmlvxividk',
    documentId: 'cmppajysy000enjvmlvxividk',
    title: 'Tenketanker og NGO-er i nordisk matdebatt',
    localPath: 'research/bibliotek/tenketanker-ngo.md',
    expectedTitleIncludes: ['Tenketanker', 'NGO'],
    reviewNote: 'Seeded internal synthesis points to this local landskapsnotat in prisma/seed-data/reports.ts.',
  },
  {
    sourceKey: 'document:cmppajywt001hnjvmyn336uml',
    documentId: 'cmppajywt001hnjvmyn336uml',
    title: 'Sirkularitet i nordisk mat - dypanalyse',
    localPath: 'research/bibliotek/sirkularitet-dyp.md',
    expectedTitleIncludes: ['Sirkularitet', 'nordisk mat'],
    reviewNote: 'Seeded internal synthesis points to this local dypnotat in prisma/seed-data/reports.ts.',
  },
  {
    sourceKey: 'document:cmppajyuo000unjvmcl2enn4a',
    documentId: 'cmppajyuo000unjvmcl2enn4a',
    title: 'Nordisk sammenligning 2024',
    localPath: 'research/bibliotek/bransje/arsrapporter/nordisk-sammenligning-2024.md',
    expectedTitleIncludes: ['Nordisk sammenligning', '2024'],
    reviewNote: 'Seeded composite source points to this local sammenstillingsnotat in prisma/seed-data/reports.ts.',
  },
]

async function main() {
  const apply = process.argv.includes('--apply')
  const dryRun = process.argv.includes('--dry-run') || !apply
  const generatedAt = new Date().toISOString()
  const prisma = createLibraryAnalysisPrismaClient()
  try {
    const documentIds = REVIEWED_LOCAL_MATCHES.map(mapping => mapping.documentId)
    const localPaths = REVIEWED_LOCAL_MATCHES.map(mapping => mapping.localPath)
    const documents = await prisma.document.findMany({
      where: {
        OR: [
          { id: { in: documentIds } },
          { filePath: { in: localPaths } },
        ],
      },
      select: {
        id: true,
        title: true,
        url: true,
        filePath: true,
        content: true,
        wordCount: true,
      },
    })
    const files = localPaths.map(path => readLocalTextFile(path))
    const plan = buildLibraryAnalysisManualLocalMatchRepairPlan({
      mappings: REVIEWED_LOCAL_MATCHES,
      documents,
      files,
      generatedAt,
    })

    writeArtifact(
      LIBRARY_ANALYSIS_MANUAL_LOCAL_MATCH_REPAIR_PLAN_MD_PATH,
      formatLibraryAnalysisManualLocalMatchRepairPlanMarkdown(plan, {
        jsonPath: LIBRARY_ANALYSIS_MANUAL_LOCAL_MATCH_REPAIR_PLAN_JSON_PATH,
      }),
    )
    writeArtifact(
      LIBRARY_ANALYSIS_MANUAL_LOCAL_MATCH_REPAIR_PLAN_JSON_PATH,
      JSON.stringify(toPlanHandoff(plan), null, 2) + '\n',
    )

    if (apply) {
      const documentById = new Map(documents.map(document => [document.id, document]))
      const updateRows = plan.rows.filter(row =>
        row.action === 'update' &&
        row.nextContent &&
        row.newFilePath
      )
      const backupContent = updateRows.map(row => {
        const document = documentById.get(row.documentId)
        return JSON.stringify({
          sourceKey: row.sourceKey,
          documentId: row.documentId,
          previousFilePath: document?.filePath ?? null,
          previousWordCount: document?.wordCount ?? 0,
          previousContent: document?.content ?? '',
          nextFilePath: row.newFilePath,
          contentHashBefore: row.contentHashBefore,
          generatedAt,
        })
      }).join('\n')
      await prisma.$transaction(updateRows.map(row =>
        prisma.document.update({
          where: { id: row.documentId },
          data: {
            filePath: row.newFilePath,
            content: row.nextContent!,
            wordCount: row.newWordCount,
          },
        }),
      ))
      appendArtifact(BACKUP_PATH, backupContent ? `${backupContent}\n` : '')
      console.log(`Library manual local match repair applied: ${updateRows.length} Document rows updated`)
      console.log(`Backup: ${BACKUP_PATH}`)
    } else if (dryRun) {
      console.log(`Library manual local match repair dry-run: ${plan.summary.updateRows} Document rows would update`)
    }

    console.log(`Total rows: ${plan.total}`)
    for (const [action, count] of Object.entries(plan.summary.byAction)) {
      console.log(`  ${action}: ${count}`)
    }
    console.log(`Markdown: ${LIBRARY_ANALYSIS_MANUAL_LOCAL_MATCH_REPAIR_PLAN_MD_PATH}`)
    console.log(`JSON: ${LIBRARY_ANALYSIS_MANUAL_LOCAL_MATCH_REPAIR_PLAN_JSON_PATH}`)
  } finally {
    await prisma.$disconnect()
  }
}

function readLocalTextFile(path: string): LibraryAnalysisManualLocalMatchRepairFile {
  const absolutePath = resolve(process.cwd(), path)
  if (!SUPPORTED_LOCAL_TEXT_EXTENSIONS.has(extname(path).toLowerCase())) {
    return { path, text: '', wordCount: 0 }
  }
  if (!existsSync(absolutePath)) {
    return { path, text: '', wordCount: 0 }
  }
  if (statSync(absolutePath).size > MAX_TEXT_FILE_BYTES) {
    return { path, text: '', wordCount: 0 }
  }
  const text = readFileSync(absolutePath, 'utf8')
  return {
    path,
    text,
    wordCount: countWords(text),
  }
}

function writeArtifact(path: string, content: string) {
  const absolutePath = resolve(process.cwd(), path)
  mkdirSync(dirname(absolutePath), { recursive: true })
  writeFileSync(absolutePath, content, 'utf8')
}

function appendArtifact(path: string, content: string) {
  if (!content) return
  const absolutePath = resolve(process.cwd(), path)
  mkdirSync(dirname(absolutePath), { recursive: true })
  appendFileSync(absolutePath, content, 'utf8')
}

function toPlanHandoff(plan: LibraryAnalysisManualLocalMatchRepairPlan) {
  return {
    ...plan,
    rows: plan.rows.map(row => ({
      ...row,
      nextContent: row.nextContent ? '[omitted from handoff; generated in-memory during repair]' : null,
    })),
  }
}

function countWords(value: string): number {
  return value.match(/[\p{L}\p{N}][\p{L}\p{N}-]*/gu)?.length ?? 0
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
