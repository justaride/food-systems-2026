import 'dotenv/config'
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { spawnSync } from 'node:child_process'
import {
  dirname,
  extname,
  resolve,
} from 'node:path'
import { createLibraryAnalysisPrismaClient } from './library-analysis-common'
import {
  candidateLocalFilePaths,
  normalizeLocalFileLocator,
} from '../src/lib/local-file-locator'
import {
  LIBRARY_ANALYSIS_MANUAL_PDF_MATCH_REPAIR_PLAN_JSON_PATH,
  LIBRARY_ANALYSIS_MANUAL_PDF_MATCH_REPAIR_PLAN_MD_PATH,
  buildLibraryAnalysisManualPdfMatchRepairPlan,
  formatLibraryAnalysisManualPdfMatchRepairPlanMarkdown,
  type LibraryAnalysisManualPdfMatchRepairFile,
  type LibraryAnalysisManualPdfMatchRepairMapping,
  type LibraryAnalysisManualPdfMatchRepairPlan,
} from '../src/lib/library-analysis-manual-pdf-match-repair'

const BACKUP_PATH = 'research/_status/library-analysis-manual-pdf-match-backup.jsonl'
const DEFAULT_MAX_PDF_BYTES = 40 * 1024 * 1024
const LARGE_REVIEWED_PDF_BYTES = 120 * 1024 * 1024

const REVIEWED_PDF_MATCHES: LibraryAnalysisManualPdfMatchRepairMapping[] = [
  {
    sourceKey: 'document:cmq8rsnhu000sekvmh125najl',
    documentId: 'cmq8rsnhu000sekvmh125najl',
    title: 'Konkurrensverket rapport 2025:5 - livsmedelsutredningen',
    sourceUrl: 'https://www.konkurrensverket.se/globalassets/dokument/informationsmaterial/rapporter-och-broschyrer/rapportserie/rapport_2025-5.pdf',
    localPath: 'research/evidence-pack/nordisk/konkurrensverket-2025-5-livsmedelsutredningen.pdf',
    expectedTitleIncludes: ['Konkurrensverket', '2025:5'],
    expectedExistingUrlIncludes: ['konkurrensverket.se'],
    reviewNote: 'Official Konkurrensverket PDF resolved from the 2025:5 publication during P1 source repair.',
  },
  {
    sourceKey: 'document:cmq8rsnhv000tekvm8plly1pt',
    documentId: 'cmq8rsnhv000tekvm8plly1pt',
    title: 'KFST Evaluering af foedevarehandelsloven 2024',
    sourceUrl: 'https://kfst.dk/media/3wxbfqqe/20241120-evaluering-af-foedevarehandelsloven-2024.pdf',
    localPath: 'research/evidence-pack/nordisk/kfst-foedevarehandelsloven-evaluering-2024.pdf',
    expectedTitleIncludes: ['KFST', 'foedevarehandelsloven'],
    expectedExistingUrlIncludes: ['kfst.dk'],
    reviewNote: 'Official KFST PDF resolved from the stale media locator during P1 source repair.',
  },
  {
    sourceKey: 'document:cmq8rsnhl000mekvmou6qjq2j',
    documentId: 'cmq8rsnhl000mekvmou6qjq2j',
    title: 'Elintarvikemarkkinavaltuutettu toimintakertomus 2024',
    sourceUrl: 'https://www.ruokavirasto.fi/globalassets/etmv/etmv-toimintakertomus-2024.pdf',
    localPath: 'research/evidence-pack/nordisk/ruokavirasto-etmv-toimintakertomus-2024.pdf',
    expectedTitleIncludes: ['Elintarvikemarkkinavaltuutettu', 'toimintakertomus'],
    expectedExistingUrlIncludes: ['ruokavirasto.fi'],
    reviewNote: 'Official Ruokavirasto ETMV PDF resolved from the stale directory locator during P1 source repair.',
  },
  {
    sourceKey: 'document:cmq8rsnhi000kekvm8th1u208',
    documentId: 'cmq8rsnhi000kekvm8th1u208',
    title: 'Beyond FLW Reduction Targets: Measuring and Valuing Food Loss and Waste',
    sourceUrl: 'https://www.oecd.org/content/dam/oecd/en/publications/reports/2025/01/beyond-food-loss-and-waste-reduction-targets_af587d11/59cf6c95-en.pdf',
    localPath: 'research/evidence-pack/internasjonal/oecd-beyond-food-loss-waste-reduction-targets-2025.pdf',
    expectedTitleIncludes: ['Beyond FLW Reduction Targets'],
    expectedExistingUrlIncludes: ['10.1787/59cf6c95-en'],
    reviewNote: 'Official OECD PDF resolved from the publication page during P1 source repair.',
  },
  {
    sourceKey: 'document:cmq8rsnhj000lekvm5l5vhigm',
    documentId: 'cmq8rsnhj000lekvm5l5vhigm',
    title: 'Feeding a Monster: Vest-afrikansk fiskemel i norsk laksefor',
    sourceUrl: 'https://www.greenpeace.org/static/planet4-africa-stateless/2021/05/47227297-feeding-a-monster-en-final-small.pdf',
    localPath: 'evidence-pack/internasjonal/greenpeace-feeding-a-monster-2021.pdf',
    expectedTitleIncludes: ['Feeding a Monster'],
    expectedExistingUrlIncludes: ['greenpeace.org'],
    reviewNote: 'Official Greenpeace Africa / Changing Markets PDF resolved from the report locator during P1 source repair.',
  },
  {
    sourceKey: 'document:cmq8rsni70011ekvmnamdezrv',
    documentId: 'cmq8rsni70011ekvmnamdezrv',
    title: 'Managing a Circular Food System in Sustainable Urban Farming. Experimental Research at the Turku University Campus (Finland)',
    sourceUrl: 'https://www.utupub.fi/bitstreams/fd0cc93c-b729-41a3-b9df-85f469877b86/download',
    localPath: 'evidence-pack/akademia/turku-circular-food-system-2021.pdf',
    expectedTitleIncludes: ['Managing a Circular Food System', 'Turku University Campus'],
    expectedExistingUrlIncludes: ['mdpi.com/2071-1050/13/11/6231'],
    reviewNote: 'Publisher PDF for the MDPI article resolved from University of Turku UTUPub during P1 source repair.',
  },
  {
    sourceKey: 'document:cmq8rsnh7000fekvmb9a3gc61',
    documentId: 'cmq8rsnh7000fekvmb9a3gc61',
    title: 'Reitan Eiendom aarsrapport 2024',
    sourceUrl: 'https://cdn.sanity.io/files/7yhwg9yx/production/fa664bce85d2b931380a947c8b4af79298f1f321.pdf?dl',
    localPath: 'evidence-pack/nordisk/reitan-eiendom/reitan-eiendom-aarsrapport-2024.pdf',
    expectedTitleIncludes: ['Reitan Eiendom', '2024'],
    expectedExistingUrlIncludes: ['2024.reitaneiendom.no'],
    maxPdfBytes: LARGE_REVIEWED_PDF_BYTES,
    reviewNote: 'Official Reitan Eiendom full annual-report PDF resolved from the 2024 annual-report download section during P1 source repair.',
  },
  {
    sourceKey: 'document:cmq8rsnie0015ekvmp52qy9il',
    documentId: 'cmq8rsnie0015ekvmp52qy9il',
    title: 'Nested circularity in food systems: A Nordic case study on connecting biomass, nutrient and energy flows from field scale to continent',
    sourceUrl: 'https://helda.helsinki.fi/server/api/core/bitstreams/4b43d75c-f89e-4ac9-8734-42481013846d/content',
    localPath: 'evidence-pack/akademia/nested-circularity-food-systems-2021.pdf',
    expectedTitleIncludes: ['Nested circularity', 'food systems'],
    expectedExistingUrlIncludes: ['ui.adsabs.harvard.edu/abs/2021RCR'],
    reviewNote: 'Open-access Elsevier PDF resolved from the University of Helsinki Helda repository API during P1 source repair.',
  },
  {
    sourceKey: 'document:cmppajyof0000njvmdjrv2blv',
    documentId: 'cmppajyof0000njvmdjrv2blv',
    title: 'Nokkelhull pa matvarer — private aktorers okonomiske interesser og konsekvensene for myndighetenes merkeordning',
    sourceUrl: 'https://nva.sikt.no/registration/019c95276ac1-6b96ca8d-628e-4298-8215-1ec6f6b38579',
    localPath: 'evidence-pack/akademia/tesdal-nokkelhull-matvarer-2012.pdf',
    expectedTitleIncludes: ['Nokkelhull', 'matvarer'],
    expectedExistingUrlIncludes: ['duo.uio.no/handle/10852/34009'],
    reviewNote: 'NVA OpenFile Tesdal_Master.pdf resolved through public NVA publication metadata and filelink during P1 source repair.',
  },
  {
    sourceKey: 'document:cmq8rsni1000yekvmtkitik13',
    documentId: 'cmq8rsni1000yekvmtkitik13',
    title: 'Handlingsplan for en sirkulaer okonomi 2024-2025',
    sourceUrl: 'https://www.regjeringen.no/contentassets/0173313ba73941c6b5072c5a0ee27434/no/pdfs/handlingsplan-sirkulaer-okonomi.pdf',
    localPath: 'research/evidence-pack/offentlig/handlingsplan-sirkulaer-okonomi-2024-2025.pdf',
    expectedTitleIncludes: ['Handlingsplan', 'sirkulaer okonomi'],
    expectedExistingUrlIncludes: ['regjeringen.no'],
    reviewNote: 'Official Regjeringen PDF resolved from the circular economy action-plan page during P1 source repair.',
  },
  {
    sourceKey: 'document:cmppgez6p0000f5vm780lxspg',
    documentId: 'cmppgez6p0000f5vm780lxspg',
    title: 'Lönsamhet i livsmedelskedjan',
    sourceUrl: 'https://www.konkurrensverket.se/globalassets/dokument/informationsmaterial/rapporter-och-broschyrer/rapportserie/rapport_2025-3.pdf',
    localPath: 'research/evidence-pack/nordisk/konkurrensverket-2025-3-lonsamhet-livsmedelskedjan.pdf',
    expectedTitleIncludes: ['Lönsamhet'],
    expectedExistingUrlIncludes: ['konkurrensverket.se'],
    reviewNote: 'Official Konkurrensverket 2025:3 PDF resolved from the publication listing during P1 source repair.',
  },
  {
    sourceKey: 'document:cmppajyv80011njvmgpvgesxt',
    documentId: 'cmppajyv80011njvmgpvgesxt',
    title: 'Solutions Menu',
    sourceUrl: 'https://norden.diva-portal.org/smash/get/diva2%3A1214792/FULLTEXT01.pdf',
    localPath: 'research/evidence-pack/nordisk/solutions-menu-nordic-guide-sustainable-food-policy.pdf',
    expectedTitleIncludes: ['Solutions Menu'],
    expectedExistingUrlIncludes: ['norden.org'],
    reviewNote: 'Official Nordic Council / DiVA PDF resolved from the Solutions Menu publication page during P1 source repair.',
  },
  {
    sourceKey: 'document:cmq8rsnhr000qekvmzurbh35d',
    documentId: 'cmq8rsnhr000qekvmzurbh35d',
    title: 'Naermaste konkurrent-analys: 290 kommuner',
    sourceUrl: 'https://www.konkurrensverket.se/globalassets/dokument/informationsmaterial/rapporter-och-broschyrer/rapportserie/rapport_2024-4.pdf',
    localPath: 'evidence-pack/nordisk/konkurrensverket-2024-4-naermaste-konkurrent-analys.pdf',
    expectedTitleIncludes: ['Naermaste konkurrent'],
    expectedExistingUrlIncludes: ['konkurrensverket.se'],
    sharedPathOwnerDocumentId: 'cmp8xyoap00jzvvvmb0m3gejj',
    reviewNote: 'Reviewed alias/subtopic of canonical Konkurrensverket 2024:4; direct official PDF is shared with the canonical report document.',
  },
  {
    sourceKey: 'document:cmppgez710001f5vmu3vx72b4',
    documentId: 'cmppgez710001f5vmu3vx72b4',
    title: 'Etablering av dagligvarubutiker',
    sourceUrl: 'https://www.konkurrensverket.se/globalassets/dokument/informationsmaterial/rapporter-och-broschyrer/rapportserie/rapport_2026-4.pdf',
    localPath: 'evidence-pack/nordisk/konkurrensverket-2026-4-etablering-dagligvarubutiker.pdf',
    expectedTitleIncludes: ['Etablering', 'dagligvarubutiker'],
    expectedExistingUrlIncludes: ['konkurrensverket.se'],
    reviewNote: 'Official Konkurrensverket 2026:4 PDF resolved from the reportserie locator during P1 source repair.',
  },
]

async function main() {
  const apply = process.argv.includes('--apply')
  const dryRun = process.argv.includes('--dry-run') || !apply
  const generatedAt = new Date().toISOString()
  const prisma = createLibraryAnalysisPrismaClient()
  try {
    const documentIds = uniqueStrings([
      ...REVIEWED_PDF_MATCHES.map(mapping => mapping.documentId),
      ...REVIEWED_PDF_MATCHES.flatMap(mapping =>
        mapping.sharedPathOwnerDocumentId ? [mapping.sharedPathOwnerDocumentId] : []
      ),
    ])
    const localPaths = REVIEWED_PDF_MATCHES.map(mapping => mapping.localPath)
    const localPathVariants = uniqueStrings(localPaths.flatMap(localPathVariantsForDb))
    const documents = await prisma.document.findMany({
      where: {
        OR: [
          { id: { in: documentIds } },
          { filePath: { in: localPathVariants } },
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
    const files = REVIEWED_PDF_MATCHES.map(mapping =>
      readLocalPdfText(mapping.localPath, mapping.maxPdfBytes)
    )
    const plan = buildLibraryAnalysisManualPdfMatchRepairPlan({
      mappings: REVIEWED_PDF_MATCHES,
      documents,
      files,
      generatedAt,
    })

    writeArtifact(
      LIBRARY_ANALYSIS_MANUAL_PDF_MATCH_REPAIR_PLAN_MD_PATH,
      formatLibraryAnalysisManualPdfMatchRepairPlanMarkdown(plan, {
        jsonPath: LIBRARY_ANALYSIS_MANUAL_PDF_MATCH_REPAIR_PLAN_JSON_PATH,
      }),
    )
    writeArtifact(
      LIBRARY_ANALYSIS_MANUAL_PDF_MATCH_REPAIR_PLAN_JSON_PATH,
      JSON.stringify(toPlanHandoff(plan), null, 2) + '\n',
    )

    if (apply) {
      const documentById = new Map(documents.map(document => [document.id, document]))
      const updateRows = plan.rows.filter(row =>
        row.action === 'update' &&
        row.nextContent &&
        row.newFilePath &&
        row.newUrl
      )
      const backupContent = updateRows.map(row => {
        const document = documentById.get(row.documentId)
        return JSON.stringify({
          sourceKey: row.sourceKey,
          documentId: row.documentId,
          previousUrl: document?.url ?? null,
          previousFilePath: document?.filePath ?? null,
          previousWordCount: document?.wordCount ?? 0,
          previousContent: document?.content ?? '',
          nextUrl: row.newUrl,
          nextFilePath: row.newFilePath,
          contentHashBefore: row.contentHashBefore,
          generatedAt,
        })
      }).join('\n')
      await prisma.$transaction(updateRows.map(row =>
        prisma.document.update({
          where: { id: row.documentId },
          data: {
            url: row.newUrl,
            filePath: row.newFilePath,
            content: row.nextContent!,
            wordCount: row.newWordCount,
          },
        })
      ))
      appendArtifact(BACKUP_PATH, backupContent ? `${backupContent}\n` : '')
      console.log(`Library manual PDF match repair applied: ${updateRows.length} Document rows updated`)
      console.log(`Backup: ${BACKUP_PATH}`)
    } else if (dryRun) {
      console.log(`Library manual PDF match repair dry-run: ${plan.summary.updateRows} Document rows would update`)
    }

    console.log(`Total rows: ${plan.total}`)
    for (const [action, count] of Object.entries(plan.summary.byAction)) {
      console.log(`  ${action}: ${count}`)
    }
    console.log(`Markdown: ${LIBRARY_ANALYSIS_MANUAL_PDF_MATCH_REPAIR_PLAN_MD_PATH}`)
    console.log(`JSON: ${LIBRARY_ANALYSIS_MANUAL_PDF_MATCH_REPAIR_PLAN_JSON_PATH}`)
  } finally {
    await prisma.$disconnect()
  }
}

function readLocalPdfText(
  path: string,
  maxPdfBytes = DEFAULT_MAX_PDF_BYTES,
): LibraryAnalysisManualPdfMatchRepairFile {
  if (extname(path).toLowerCase() !== '.pdf') {
    return { path, text: '', wordCount: 0 }
  }
  const absolutePath = candidateLocalFilePaths(path).find(candidate => existsSync(candidate))
  if (!absolutePath) {
    return { path, text: '', wordCount: 0 }
  }
  if (statSync(absolutePath).size > maxPdfBytes) {
    return { path, text: '', wordCount: 0 }
  }
  const result = spawnSync('pdftotext', ['-layout', absolutePath, '-'], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  })
  const text = result.status === 0 ? result.stdout ?? '' : ''
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

function toPlanHandoff(plan: LibraryAnalysisManualPdfMatchRepairPlan) {
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

function localPathVariantsForDb(path: string): string[] {
  const normalizedPath = normalizeLocalFileLocator(path)
  if (!normalizedPath) return [path]
  return [
    path,
    normalizedPath,
    `research/${normalizedPath}`,
    `docs/${normalizedPath}`,
  ]
}

function uniqueStrings(values: string[]): string[] {
  return [...new Set(values)]
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
