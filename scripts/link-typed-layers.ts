import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

function normalizeTitle(value: string | null | undefined): string {
  return (value ?? '')
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'o')
    .replace(/å/g, 'a')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function normalizeUrl(value: string | null | undefined): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null

  try {
    const url = new URL(trimmed)
    url.hash = ''
    url.pathname = url.pathname.replace(/\/+$/, '') || '/'
    return url.toString()
  } catch {
    return trimmed.replace(/#.*$/, '').replace(/\/+$/, '')
  }
}

function tokenize(normalized: string): string[] {
  return normalized.split(/\s+/).filter(Boolean)
}

function titleSimilarity(a: string, b: string): number {
  if (!a || !b) return 0
  if (a === b) return 1

  const tokensA = tokenize(a)
  const tokensB = tokenize(b)
  if (tokensA.length < 2 || tokensB.length < 2) return a === b ? 1 : 0

  const setA = new Set(tokensA)
  const setB = new Set(tokensB)
  let overlap = 0
  for (const t of setA) {
    if (setB.has(t)) overlap++
  }

  const jaccard = overlap / (setA.size + setB.size - overlap)

  if (a.includes(b) || b.includes(a)) {
    return Math.max(jaccard, 0.85)
  }

  return jaccard
}

function extractAuthorTokens(author: string | null | undefined): string[] {
  if (!author) return []
  return normalizeTitle(author)
    .split(/\s+/)
    .filter(t => t.length > 2)
}

function authorOverlap(tokensA: string[], tokensB: string[]): boolean {
  if (tokensA.length === 0 || tokensB.length === 0) return false
  const setB = new Set(tokensB)
  let matched = 0
  for (const t of tokensA) {
    if (setB.has(t)) matched++
  }
  return matched >= 1 && matched / Math.min(tokensA.length, tokensB.length) >= 0.5
}

type DocRow = {
  id: string
  slug: string
  filePath: string
  title: string
  author: string | null
  year: number | null
  url: string | null
}

type Stats = {
  url: number
  title: number
  fullTitle: number
  authorYear: number
  filename: number
  idSlug: number
  skippedAmbiguous: number
}

const stats: Stats = { url: 0, title: 0, fullTitle: 0, authorYear: 0, filename: 0, idSlug: 0, skippedAmbiguous: 0 }
const linked: string[] = []
const unmatched: string[] = []

const claimedByThesis = new Set<string>()
const claimedByReport = new Set<string>()
const claimedBySourceDoc = new Set<string>()

type LayerType = 'thesis' | 'report' | 'sourceDoc'
let currentLayerType: LayerType = 'thesis'

async function loadClaimedDocIds(): Promise<void> {
  const [theses, reports, sourceDocs] = await Promise.all([
    prisma.thesis.findMany({ where: { documentId: { not: null } }, select: { documentId: true } }),
    prisma.report.findMany({ where: { documentId: { not: null } }, select: { documentId: true } }),
    prisma.sourceDoc.findMany({ where: { documentId: { not: null } }, select: { documentId: true } }),
  ])
  for (const t of theses) if (t.documentId) claimedByThesis.add(t.documentId)
  for (const r of reports) if (r.documentId) claimedByReport.add(r.documentId)
  for (const s of sourceDocs) if (s.documentId) claimedBySourceDoc.add(s.documentId)
}

function isAvailable(doc: DocRow): boolean {
  switch (currentLayerType) {
    case 'thesis': return !claimedByThesis.has(doc.id)
    case 'report': return !claimedByReport.has(doc.id)
    case 'sourceDoc': return !claimedBySourceDoc.has(doc.id)
  }
}

function claimDoc(docId: string): void {
  switch (currentLayerType) {
    case 'thesis': claimedByThesis.add(docId); break
    case 'report': claimedByReport.add(docId); break
    case 'sourceDoc': claimedBySourceDoc.add(docId); break
  }
}

const MANUAL_REPORT_MAPPINGS: Record<string, string> = {
  'matsystemutvalget-2026': 'bibliotek/nou/matsystemutvalget-status-2026',
  'akademia-nhh-butikkstruktur-2024': 'bibliotek/akademia/nhh-food/butikkstruktur-2024',
  'akademia-nhh-foros-media-2025': 'bibliotek/akademia/nhh-food/foros-media-2025',
  'akademia-nhh-matbors-historie': 'bibliotek/akademia/nhh-food/matbors-historie',
  'beredskap-island-melmolle-2025': 'bibliotek/beredskap/is-melmolle-krise-2025',
}

const MANUAL_THESIS_MAPPINGS: Record<string, string> = {
  'ulsaker-phd-2018': 'bibliotek/akademia/masteroppgaver/ulsaker-phd-sammendrag',
}

async function loadDocuments(): Promise<DocRow[]> {
  return prisma.document.findMany({
    select: { id: true, slug: true, filePath: true, title: true, author: true, year: true, url: true },
  })
}

function findByUrl(
  docs: DocRow[],
  url: string | null | undefined,
  normalizedDocUrls: Map<string, DocRow[]>
): DocRow | null {
  const norm = normalizeUrl(url)
  if (!norm) return null
  const matches = normalizedDocUrls.get(norm)?.filter(isAvailable)
  if (matches && matches.length === 1) return matches[0]
  return null
}

function findByTitle(
  docs: DocRow[],
  title: string | null | undefined,
  threshold = 0.7
): { doc: DocRow; score: number } | 'ambiguous' | null {
  const norm = normalizeTitle(title)
  if (!norm || tokenize(norm).length < 2) return null

  const candidates: { doc: DocRow; score: number }[] = []
  for (const doc of docs) {
    if (!isAvailable(doc)) continue
    const docNorm = normalizeTitle(doc.title)
    const score = titleSimilarity(norm, docNorm)
    if (score >= threshold) {
      candidates.push({ doc, score })
    }
  }

  if (candidates.length === 0) return null
  if (candidates.length === 1) return candidates[0]

  candidates.sort((a, b) => b.score - a.score)
  if (candidates[0].score - candidates[1].score >= 0.1) return candidates[0]

  return 'ambiguous'
}

function findByAuthorYear(
  docs: DocRow[],
  author: string | null | undefined,
  year: number | string | null | undefined
): DocRow | 'ambiguous' | null {
  const yearNum = typeof year === 'string' ? parseInt(year, 10) : year
  if (!yearNum || !author) return null

  const authorTokens = extractAuthorTokens(author)
  if (authorTokens.length === 0) return null

  const candidates: DocRow[] = []
  for (const doc of docs) {
    if (!isAvailable(doc)) continue
    if (doc.year !== yearNum) continue
    const docAuthorTokens = extractAuthorTokens(doc.author)
    if (authorOverlap(authorTokens, docAuthorTokens)) {
      candidates.push(doc)
    }
  }

  if (candidates.length === 1) return candidates[0]
  if (candidates.length > 1) return 'ambiguous'
  return null
}

function findByIdSlug(
  docs: DocRow[],
  id: string
): DocRow | 'ambiguous' | null {
  const normId = normalizeTitle(id)
  if (!normId || normId.length < 4) return null

  const variants = [normId]
  if (normId.startsWith('oversikt ')) variants.push(normId.slice('oversikt '.length))
  if (normId.startsWith('akademia ')) variants.push(normId.slice('akademia '.length))
  if (normId.startsWith('beredskap ')) variants.push(normId.slice('beredskap '.length))
  if (normId.startsWith('sirkularitet ')) variants.push(normId.slice('sirkularitet '.length))
  if (normId.startsWith('juridisk ')) variants.push(normId.slice('juridisk '.length))

  const candidates: DocRow[] = []
  for (const doc of docs) {
    if (!isAvailable(doc)) continue
    const slugNorm = normalizeTitle(doc.slug)
    const filePathNorm = normalizeTitle(doc.filePath)
    for (const variant of variants) {
      if (variant.length < 4) continue
      if (slugNorm.endsWith(variant) || filePathNorm.endsWith(variant) ||
          slugNorm.includes(variant) || filePathNorm.includes(variant)) {
        candidates.push(doc)
        break
      }
    }
  }

  if (candidates.length === 1) return candidates[0]
  if (candidates.length > 1) return 'ambiguous'
  return null
}

function findByFilename(
  docs: DocRow[],
  filename: string
): DocRow | 'ambiguous' | null {
  const normFilename = normalizeTitle(filename)
  if (!normFilename || normFilename.length < 4) return null

  const candidates: DocRow[] = []
  for (const doc of docs) {
    if (!isAvailable(doc)) continue
    const slugNorm = normalizeTitle(doc.slug)
    const filePathNorm = normalizeTitle(doc.filePath)
    if (slugNorm.includes(normFilename) || normFilename.includes(slugNorm) ||
        filePathNorm.includes(normFilename)) {
      candidates.push(doc)
    }
  }

  if (candidates.length === 1) return candidates[0]
  if (candidates.length > 1) return 'ambiguous'
  return null
}

async function linkTheses(docs: DocRow[], normalizedDocUrls: Map<string, DocRow[]>) {
  const unlinked = await prisma.thesis.findMany({
    where: { documentId: null },
    select: { id: true, title: true, titleNo: true, authors: true, year: true, url: true },
  })

  console.log(`\n=== THESES (${unlinked.length} unlinked) ===`)

  for (const thesis of unlinked) {
    const label = `Thesis[${thesis.id}]`

    const manualSlug = MANUAL_THESIS_MAPPINGS[thesis.id]
    if (manualSlug) {
      const manualDoc = docs.find(d => d.slug === manualSlug && isAvailable(d))
      if (manualDoc) {
        await prisma.thesis.update({ where: { id: thesis.id }, data: { documentId: manualDoc.id } })
        claimDoc(manualDoc.id)
        console.log(`  LINKED ${label} → Doc[${manualDoc.slug}] (manual)`)
        stats.idSlug++
        linked.push(label)
        continue
      }
    }

    const byUrl = findByUrl(docs, thesis.url, normalizedDocUrls)
    if (byUrl) {
      await prisma.thesis.update({ where: { id: thesis.id }, data: { documentId: byUrl.id } })
      claimDoc(byUrl.id)
      console.log(`  LINKED ${label} → Doc[${byUrl.slug}] (url)`)
      stats.url++
      linked.push(label)
      continue
    }

    const byTitle = findByTitle(docs, thesis.title)
    if (byTitle === 'ambiguous') {
      console.log(`  SKIP ${label} — ambiguous title match for "${thesis.title}"`)
      stats.skippedAmbiguous++
      unmatched.push(`${label} (ambiguous title)`)
      continue
    }
    if (byTitle) {
      await prisma.thesis.update({ where: { id: thesis.id }, data: { documentId: byTitle.doc.id } })
      claimDoc(byTitle.doc.id)
      console.log(`  LINKED ${label} → Doc[${byTitle.doc.slug}] (title, score=${byTitle.score.toFixed(2)})`)
      stats.title++
      linked.push(label)
      continue
    }

    if (thesis.titleNo) {
      const byTitleNo = findByTitle(docs, thesis.titleNo)
      if (byTitleNo === 'ambiguous') {
        console.log(`  SKIP ${label} — ambiguous titleNo match for "${thesis.titleNo}"`)
        stats.skippedAmbiguous++
        unmatched.push(`${label} (ambiguous titleNo)`)
        continue
      }
      if (byTitleNo) {
        await prisma.thesis.update({ where: { id: thesis.id }, data: { documentId: byTitleNo.doc.id } })
        claimDoc(byTitleNo.doc.id)
        console.log(`  LINKED ${label} → Doc[${byTitleNo.doc.slug}] (titleNo, score=${byTitleNo.score.toFixed(2)})`)
        stats.title++
        linked.push(label)
        continue
      }
    }

    const byAuthorYear = findByAuthorYear(docs, thesis.authors, thesis.year)
    if (byAuthorYear === 'ambiguous') {
      console.log(`  SKIP ${label} — ambiguous author+year match (${thesis.authors}, ${thesis.year})`)
      stats.skippedAmbiguous++
      unmatched.push(`${label} (ambiguous author+year)`)
      continue
    }
    if (byAuthorYear) {
      await prisma.thesis.update({ where: { id: thesis.id }, data: { documentId: byAuthorYear.id } })
      claimDoc(byAuthorYear.id)
      console.log(`  LINKED ${label} → Doc[${byAuthorYear.slug}] (author+year)`)
      stats.authorYear++
      linked.push(label)
      continue
    }

    console.log(`  UNMATCHED ${label} — "${thesis.title}" (${thesis.authors}, ${thesis.year})`)
    unmatched.push(label)
  }
}

async function linkReports(docs: DocRow[], normalizedDocUrls: Map<string, DocRow[]>) {
  const unlinked = await prisma.report.findMany({
    where: { documentId: null },
    select: { id: true, title: true, fullTitle: true, author: true, institution: true, year: true, sourceUrl: true },
  })

  console.log(`\n=== REPORTS (${unlinked.length} unlinked) ===`)

  for (const report of unlinked) {
    const label = `Report[${report.id}]`

    const manualSlug = MANUAL_REPORT_MAPPINGS[report.id]
    if (manualSlug) {
      const manualDoc = docs.find(d => d.slug === manualSlug && isAvailable(d))
      if (manualDoc) {
        await prisma.report.update({ where: { id: report.id }, data: { documentId: manualDoc.id } })
        claimDoc(manualDoc.id)
        console.log(`  LINKED ${label} → Doc[${manualDoc.slug}] (manual)`)
        stats.idSlug++
        linked.push(label)
        continue
      }
    }

    const byUrl = findByUrl(docs, report.sourceUrl, normalizedDocUrls)
    if (byUrl) {
      await prisma.report.update({ where: { id: report.id }, data: { documentId: byUrl.id } })
      claimDoc(byUrl.id)
      console.log(`  LINKED ${label} → Doc[${byUrl.slug}] (url)`)
      stats.url++
      linked.push(label)
      continue
    }

    const byFullTitle = report.fullTitle ? findByTitle(docs, report.fullTitle) : null
    if (byFullTitle === 'ambiguous') {
      console.log(`  SKIP ${label} — ambiguous fullTitle match for "${report.fullTitle}"`)
      stats.skippedAmbiguous++
      unmatched.push(`${label} (ambiguous fullTitle)`)
      continue
    }
    if (byFullTitle) {
      await prisma.report.update({ where: { id: report.id }, data: { documentId: byFullTitle.doc.id } })
      claimDoc(byFullTitle.doc.id)
      console.log(`  LINKED ${label} → Doc[${byFullTitle.doc.slug}] (fullTitle, score=${byFullTitle.score.toFixed(2)})`)
      stats.fullTitle++
      linked.push(label)
      continue
    }

    const byTitle = findByTitle(docs, report.title)
    if (byTitle === 'ambiguous') {
      console.log(`  SKIP ${label} — ambiguous title match for "${report.title}"`)
      stats.skippedAmbiguous++
      unmatched.push(`${label} (ambiguous title)`)
      continue
    }
    if (byTitle) {
      await prisma.report.update({ where: { id: report.id }, data: { documentId: byTitle.doc.id } })
      claimDoc(byTitle.doc.id)
      console.log(`  LINKED ${label} → Doc[${byTitle.doc.slug}] (title, score=${byTitle.score.toFixed(2)})`)
      stats.title++
      linked.push(label)
      continue
    }

    const byIdSlug = findByIdSlug(docs, report.id)
    if (byIdSlug === 'ambiguous') {
      console.log(`  SKIP ${label} — ambiguous id-slug match for "${report.id}"`)
      stats.skippedAmbiguous++
      unmatched.push(`${label} (ambiguous id-slug)`)
      continue
    }
    if (byIdSlug) {
      await prisma.report.update({ where: { id: report.id }, data: { documentId: byIdSlug.id } })
      claimDoc(byIdSlug.id)
      console.log(`  LINKED ${label} → Doc[${byIdSlug.slug}] (id-slug)`)
      stats.idSlug++
      linked.push(label)
      continue
    }

    const authorStr = report.author ?? report.institution
    const byAuthorYear = findByAuthorYear(docs, authorStr, report.year)
    if (byAuthorYear === 'ambiguous') {
      console.log(`  SKIP ${label} — ambiguous author+year match (${authorStr}, ${report.year})`)
      stats.skippedAmbiguous++
      unmatched.push(`${label} (ambiguous author+year)`)
      continue
    }
    if (byAuthorYear) {
      await prisma.report.update({ where: { id: report.id }, data: { documentId: byAuthorYear.id } })
      claimDoc(byAuthorYear.id)
      console.log(`  LINKED ${label} → Doc[${byAuthorYear.slug}] (author+year)`)
      stats.authorYear++
      linked.push(label)
      continue
    }

    console.log(`  UNMATCHED ${label} — "${report.title}" (${authorStr}, ${report.year})`)
    unmatched.push(label)
  }
}

async function linkSourceDocs(docs: DocRow[], normalizedDocUrls: Map<string, DocRow[]>) {
  const unlinked = await prisma.sourceDoc.findMany({
    where: { documentId: null },
    select: { id: true, filename: true, title: true, author: true, year: true, url: true },
  })

  console.log(`\n=== SOURCE DOCS (${unlinked.length} unlinked) ===`)

  for (const src of unlinked) {
    const label = `SourceDoc[${src.id}]`

    const byUrl = findByUrl(docs, src.url, normalizedDocUrls)
    if (byUrl) {
      await prisma.sourceDoc.update({ where: { id: src.id }, data: { documentId: byUrl.id } })
      claimDoc(byUrl.id)
      console.log(`  LINKED ${label} → Doc[${byUrl.slug}] (url)`)
      stats.url++
      linked.push(label)
      continue
    }

    const byTitle = findByTitle(docs, src.title)
    if (byTitle === 'ambiguous') {
      console.log(`  SKIP ${label} — ambiguous title match for "${src.title}"`)
      stats.skippedAmbiguous++
      unmatched.push(`${label} (ambiguous title)`)
      continue
    }
    if (byTitle) {
      await prisma.sourceDoc.update({ where: { id: src.id }, data: { documentId: byTitle.doc.id } })
      claimDoc(byTitle.doc.id)
      console.log(`  LINKED ${label} → Doc[${byTitle.doc.slug}] (title, score=${byTitle.score.toFixed(2)})`)
      stats.title++
      linked.push(label)
      continue
    }

    const filenameBase = src.filename.replace(/\.(md|pdf)$/, '')
    const byFilename = findByFilename(docs, filenameBase)
    if (byFilename === 'ambiguous') {
      console.log(`  SKIP ${label} — ambiguous filename match for "${src.filename}"`)
      stats.skippedAmbiguous++
      unmatched.push(`${label} (ambiguous filename)`)
      continue
    }
    if (byFilename) {
      await prisma.sourceDoc.update({ where: { id: src.id }, data: { documentId: byFilename.id } })
      claimDoc(byFilename.id)
      console.log(`  LINKED ${label} → Doc[${byFilename.slug}] (filename)`)
      stats.filename++
      linked.push(label)
      continue
    }

    const byFilePathExact = docs.find(d => isAvailable(d) && d.filePath === src.filename)
    if (byFilePathExact) {
      await prisma.sourceDoc.update({ where: { id: src.id }, data: { documentId: byFilePathExact.id } })
      claimDoc(byFilePathExact.id)
      console.log(`  LINKED ${label} → Doc[${byFilePathExact.slug}] (filePath-exact)`)
      stats.filename++
      linked.push(label)
      continue
    }

    const yearNum = typeof src.year === 'string' ? parseInt(src.year, 10) : (src.year ?? undefined)
    const byAuthorYear = findByAuthorYear(docs, src.author, yearNum)
    if (byAuthorYear === 'ambiguous') {
      console.log(`  SKIP ${label} — ambiguous author+year match (${src.author}, ${src.year})`)
      stats.skippedAmbiguous++
      unmatched.push(`${label} (ambiguous author+year)`)
      continue
    }
    if (byAuthorYear) {
      await prisma.sourceDoc.update({ where: { id: src.id }, data: { documentId: byAuthorYear.id } })
      claimDoc(byAuthorYear.id)
      console.log(`  LINKED ${label} → Doc[${byAuthorYear.slug}] (author+year)`)
      stats.authorYear++
      linked.push(label)
      continue
    }

    console.log(`  UNMATCHED ${label} — "${src.title ?? src.filename}" (${src.author ?? '?'}, ${src.year ?? '?'})`)
    unmatched.push(label)
  }
}

async function main() {
  console.log('Link typed layers → Document records\n')

  const docs = await loadDocuments()
  console.log(`Loaded ${docs.length} documents from database`)

  await loadClaimedDocIds()
  const totalClaimed = new Set([...claimedByThesis, ...claimedByReport, ...claimedBySourceDoc]).size
  console.log(`${totalClaimed} unique documents already claimed (${claimedByThesis.size} thesis, ${claimedByReport.size} report, ${claimedBySourceDoc.size} sourceDoc)`)

  const normalizedDocUrls = new Map<string, DocRow[]>()
  for (const doc of docs) {
    const norm = normalizeUrl(doc.url)
    if (!norm) continue
    const existing = normalizedDocUrls.get(norm) ?? []
    existing.push(doc)
    normalizedDocUrls.set(norm, existing)
  }

  currentLayerType = 'thesis'
  await linkTheses(docs, normalizedDocUrls)
  currentLayerType = 'report'
  await linkReports(docs, normalizedDocUrls)
  currentLayerType = 'sourceDoc'
  await linkSourceDocs(docs, normalizedDocUrls)

  console.log('\n=== SUMMARY ===')
  console.log(`Total linked: ${linked.length}`)
  console.log(`  by URL:         ${stats.url}`)
  console.log(`  by title:       ${stats.title}`)
  console.log(`  by fullTitle:   ${stats.fullTitle}`)
  console.log(`  by id-slug:     ${stats.idSlug}`)
  console.log(`  by author+year: ${stats.authorYear}`)
  console.log(`  by filename:    ${stats.filename}`)
  console.log(`Skipped (ambiguous): ${stats.skippedAmbiguous}`)
  console.log(`Unmatched: ${unmatched.length}`)

  if (unmatched.length > 0) {
    console.log('\nUnmatched records:')
    for (const u of unmatched) {
      console.log(`  - ${u}`)
    }
  }
}

main()
  .catch((e) => {
    console.error('Link failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
