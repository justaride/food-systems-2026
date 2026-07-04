/**
 * Plans and optionally backfills Document.filePath for report/thesis documents
 * using seed-pdf-map, curated local maps, and direct-PDF download queue rows.
 *
 * Safety contract:
 * - dry-run is the default and writes nothing
 * - use --apply for Document.filePath updates
 * - existing filePath ownership conflicts are reported and skipped
 */

import 'dotenv/config'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/client'
import { parseCsvRecords } from '../src/lib/csv'

export type SeedMapEntry = {
  pdf?: string
  md?: string
  confidence?: string
  score?: number
}

export type SeedMap = {
  reports?: Record<string, SeedMapEntry>
  theses?: Record<string, SeedMapEntry>
}

export type DownloadQueueRow = {
  id: string
  url: string
  url_type: string
  target_path: string
}

export type Candidate = {
  kind: 'report' | 'thesis'
  seedId: string
  documentId: string
  path: string
  confidence: string
  score: number | null
  source: 'seed-pdf-map' | 'curated-local-map' | 'download-queue'
}

export type SeededRow = {
  id: string
  documentId: string | null
}

const ROOT = process.cwd()

export const CURATED_REPORT_PATHS: Record<string, string> = {
  'akademia-nhh-butikkstruktur-2024': 'research/evidence-pack/source-notes/akademia-nhh-butikkstruktur-2024.md',
  'akademia-nhh-matbors-historie': 'research/evidence-pack/source-notes/akademia-nhh-matbors-historie.md',
  'akademia-sifo-retail-media-2025': 'research/evidence-pack/source-notes/akademia-sifo-retail-media-2025.md',
  'akademia-uib-kjopermakt': 'research/evidence-pack/source-notes/akademia-uib-kjopermakt.md',
  'arla-farmahead-check-2024': 'research/evidence-pack/source-notes/arla-farmahead-check-2024.md',
  'asko-infrastruktur-2025': 'research/bibliotek/bransje/logistikk/asko-infrastruktur-2025.md',
  'beredskap-island-melmolle-2025': 'research/evidence-pack/source-notes/beredskap-island-melmolle-2025.md',
  'dagligvarerapporten-2025': 'research/bibliotek/bransje/organisasjoner/dagligvarerapporten-2025.md',
  'dlf-leverandor-2025': 'research/evidence-pack/bransje/dlf-leverandor-2025.md',
  'dk-salling-coop-decision-2025': 'research/evidence-pack/nordisk/kfst-salling-coop-2025-full.pdf',
  'etmv-toimintakertomus-2024': 'research/evidence-pack/nordisk/etmv-toimintakertomus-2024.pdf',
  'fivh-etikk-2025': 'research/bibliotek/tenketanker/fivh-etikk-2025.md',
  'is-markedsstruktur-2024': 'research/bibliotek/nordisk-konkurranse/is-markedsstruktur-2024.md',
  'juridisk-eiendomsmakt-lokal-konkurranse': 'research/evidence-pack/source-notes/juridisk-eiendomsmakt-lokal-konkurranse.md',
  'juridisk-eudr-norge-2025': 'research/bibliotek/juridisk/eudr-norge-2025.md',
  'kbh-food-strategy-madhus': 'research/evidence-pack/source-notes/kbh-food-strategy-madhus.md',
  'karlstad-declaration-2024': 'research/evidence-pack/nordisk/karlstad-declaration-2024.pdf',
  'kfst-foedevarehandelslov-evaluering-2024': 'research/evidence-pack/nordisk/kfst-foedevarehandelslov-evaluering-2024.pdf',
  'konkurrensverket-2025-5-livsmedelsutredning': 'research/evidence-pack/nordisk/konkurrensverket-2025-5-livsmedelsutredning.pdf',
  'kt-markedsundersokelser-2026': 'research/bibliotek/konkurransetilsynet/markedsundersokelser-status.md',
  'menon-emv-innovasjon': 'research/bibliotek/konsulentrapporter/menon-emv-innovasjon.md',
  'motiva-food-procurement-2026': 'research/evidence-pack/source-notes/motiva-food-procurement-2026.md',
  'nbs-systemkritikk': 'research/bibliotek/bransje/organisasjoner/nbs-systemkritikk.md',
  'norgesgruppen-halvarsrapport-h1-2025': 'research/evidence-pack/arsrapporter/norgesgruppen-halvarsrapport-2025.pdf',
  'norden-policy-2024': 'research/evidence-pack/tenketank/norden-policy-2024.pdf',
  'nordic-food-alert-2025': 'research/evidence-pack/nordisk/nordic-food-alert-2025.pdf',
  'oversikt-akademia-dyp-research': 'research/evidence-pack/source-notes/oversikt-akademia-dyp-research.md',
  'oversikt-bransje-statistikk-beredskap': 'research/evidence-pack/source-notes/oversikt-bransje-statistikk-beredskap.md',
  'plantefonden-projects-2023-2025': 'research/evidence-pack/source-notes/plantefonden-projects-2023-2025.md',
  'pubmed-szulecka-2024': 'research/evidence-pack/source-notes/pubmed-szulecka-2024.md',
  'pubmed-van-der-fels-klerx-2024': 'research/evidence-pack/source-notes/pubmed-van-der-fels-klerx-2024.md',
  'pubmed-van-leeuwen-2024': 'research/evidence-pack/source-notes/pubmed-van-leeuwen-2024.md',
  'se-konkurrensverket-2024-5': 'research/evidence-pack/nordisk/konkurrensverket-2024-4-dagligvaruhandelns-etablering.pdf',
  'sirkularitet-definisjoner-wur-emf': 'research/evidence-pack/source-notes/sirkularitet-definisjoner-wur-emf.md',
  'sirkularitet-matsvinn-2024': 'research/evidence-pack/offentlig/matsvinnutvalget-2024.pdf',
  'sodertaelje-diet-green-planet': 'research/evidence-pack/akademia/sodertaelje-diet-green-planet-2023.md',
  'van-zanten-circularity-2023': 'research/evidence-pack/source-notes/van-zanten-circularity-2023.md',
}

export const CURATED_THESIS_PATHS: Record<string, string> = {
  'desilva-2023': 'research/evidence-pack/source-notes/desilva-2023.md',
  'lund-beijer-2026': 'research/evidence-pack/akademia/lund-beijer-2026.pdf',
  'nmbu-circular-vegetables-2022': 'research/evidence-pack/source-notes/nmbu-circular-vegetables-2022.md',
  'segersven-2024': 'research/evidence-pack/source-notes/segersven-2024.md',
  'slu-house-crickets-2025': 'research/evidence-pack/source-notes/slu-house-crickets-2025.md',
}

export function parseApplyMode(argv: string[] = process.argv.slice(2)): boolean {
  const apply = argv.includes('--apply')
  const dryRun = argv.includes('--dry-run')
  if (apply && dryRun) throw new Error('Use either --apply or --dry-run, not both')
  return apply
}

export function localPathForSeedMapEntry(
  entry: SeedMapEntry | undefined,
  pathExists: (path: string) => boolean,
): string | null {
  if (!entry) return null
  const rel = entry.pdf ?? entry.md
  if (!rel) return null
  const path = `research/${rel}`
  return pathExists(path) ? path : null
}

export function downloadQueuePathByIdFromRows(
  rows: DownloadQueueRow[],
  pathExists: (path: string) => boolean,
): Map<string, string> {
  const out = new Map<string, string>()
  for (const row of rows) {
    if (!row.id || !row.target_path) continue
    const direct = row.url_type === 'direct_pdf' || /\.pdf($|\?)/i.test(row.url)
    if (!direct) continue
    if (!pathExists(row.target_path)) continue
    out.set(row.id, row.target_path)
  }
  return out
}

function downloadQueuePathById(root: string): Map<string, string> {
  const queuePath = join(root, 'research', 'download-queue.csv')
  const rows = parseCsvRecords(readFileSync(queuePath, 'utf-8')) as DownloadQueueRow[]
  return downloadQueuePathByIdFromRows(rows, (path) => existsSync(join(root, path)))
}

function addSeedMapCandidates(
  out: { applyable: Candidate[]; skipped: Candidate[] },
  rows: SeededRow[],
  kind: 'report' | 'thesis',
  seedEntries: Record<string, SeedMapEntry> | undefined,
  pathExists: (path: string) => boolean,
) {
  for (const row of rows) {
    if (!row.documentId) continue
    const entry = seedEntries?.[row.id]
    const path = localPathForSeedMapEntry(entry, pathExists)
    if (!path) continue
    const candidate: Candidate = {
      kind,
      seedId: row.id,
      documentId: row.documentId,
      path,
      confidence: entry?.confidence ?? '',
      score: entry?.score ?? null,
      source: 'seed-pdf-map',
    }
    if (candidate.confidence === 'high') out.applyable.push(candidate)
    else out.skipped.push(candidate)
  }
}

function addCuratedCandidates(
  out: Candidate[],
  rows: SeededRow[],
  kind: 'report' | 'thesis',
  curatedPaths: Record<string, string>,
  pathExists: (path: string) => boolean,
) {
  for (const row of rows) {
    if (!row.documentId) continue
    const path = curatedPaths[row.id]
    if (!path || !pathExists(path)) continue
    out.push({
      kind,
      seedId: row.id,
      documentId: row.documentId,
      path,
      confidence: 'curated',
      score: null,
      source: 'curated-local-map',
    })
  }
}

function addDownloadQueueCandidates(
  out: Candidate[],
  rows: SeededRow[],
  kind: 'report' | 'thesis',
  downloadQueuePaths: Map<string, string>,
) {
  for (const row of rows) {
    if (!row.documentId) continue
    const path = downloadQueuePaths.get(row.id)
    if (!path) continue
    out.push({
      kind,
      seedId: row.id,
      documentId: row.documentId,
      path,
      confidence: 'queue-direct-pdf',
      score: null,
      source: 'download-queue',
    })
  }
}

export function dedupeCandidates(candidates: Candidate[]): Candidate[] {
  const byDocumentId = new Map<string, Candidate>()
  for (const candidate of candidates) {
    const existing = byDocumentId.get(candidate.documentId)
    if (!existing) {
      byDocumentId.set(candidate.documentId, candidate)
      continue
    }
    if (existing.source === 'seed-pdf-map') continue
    byDocumentId.set(candidate.documentId, candidate)
  }
  return [...byDocumentId.values()]
}

export function collectCandidatesFromSeedRows(params: {
  seedMap: SeedMap
  reports: SeededRow[]
  theses: SeededRow[]
  downloadQueuePaths: Map<string, string>
  pathExists: (path: string) => boolean
}): { applyable: Candidate[]; skipped: Candidate[] } {
  const out: { applyable: Candidate[]; skipped: Candidate[] } = { applyable: [], skipped: [] }

  addSeedMapCandidates(out, params.reports, 'report', params.seedMap.reports, params.pathExists)
  addCuratedCandidates(out.applyable, params.reports, 'report', CURATED_REPORT_PATHS, params.pathExists)
  addDownloadQueueCandidates(out.applyable, params.reports, 'report', params.downloadQueuePaths)

  addSeedMapCandidates(out, params.theses, 'thesis', params.seedMap.theses, params.pathExists)
  addCuratedCandidates(out.applyable, params.theses, 'thesis', CURATED_THESIS_PATHS, params.pathExists)
  addDownloadQueueCandidates(out.applyable, params.theses, 'thesis', params.downloadQueuePaths)

  return { applyable: dedupeCandidates(out.applyable), skipped: out.skipped }
}

async function collectCandidates(
  prisma: PrismaClient,
  root: string,
): Promise<{ applyable: Candidate[]; skipped: Candidate[] }> {
  const seedMap = JSON.parse(
    readFileSync(join(root, 'research', 'seed-pdf-map.json'), 'utf-8'),
  ) as SeedMap
  const downloadQueuePaths = downloadQueuePathById(root)
  const pathExists = (path: string) => existsSync(join(root, path))

  const reports = await prisma.report.findMany({
    where: { document: { is: { filePath: null } } },
    select: { id: true, documentId: true },
  })
  const theses = await prisma.thesis.findMany({
    where: { document: { is: { filePath: null } } },
    select: { id: true, documentId: true },
  })

  return collectCandidatesFromSeedRows({ seedMap, reports, theses, downloadQueuePaths, pathExists })
}

export async function runDocumentFilePathBackfill(argv: string[] = process.argv.slice(2)) {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required')

  const apply = parseApplyMode(argv)
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  const prisma = new PrismaClient({ adapter })

  try {
    const { applyable, skipped } = await collectCandidates(prisma, ROOT)
    const planned: Candidate[] = []
    const applied: Candidate[] = []
    const conflicts: Candidate[] = []

    for (const candidate of applyable) {
      const existing = await prisma.document.findUnique({
        where: { filePath: candidate.path },
        select: { id: true },
      })
      if (existing && existing.id !== candidate.documentId) {
        conflicts.push(candidate)
        continue
      }
      planned.push(candidate)
      if (apply) {
        await prisma.document.update({
          where: { id: candidate.documentId },
          data: { filePath: candidate.path },
        })
        applied.push(candidate)
      }
    }

    const summary = {
      mode: apply ? 'apply' : 'dry-run',
      planned: planned.length,
      applied: applied.length,
      conflicts: conflicts.length,
      skippedNonHighConfidence: skipped.length,
      plannedRows: planned,
      appliedRows: applied,
      conflictRows: conflicts,
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
  runDocumentFilePathBackfill().catch((error) => {
    console.error('[document-file-path-backfill] failed:', error)
    process.exit(1)
  })
}
