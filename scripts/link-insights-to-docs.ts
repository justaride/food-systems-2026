import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

type Strategy = 'transitive' | 'source-match' | 'description-match' | 'tag-overlap'
type Stats = Record<Strategy, number>

const STOP_WORDS = new Set([
  'i', 'og', 'av', 'for', 'en', 'et', 'er', 'pa', 'paa', 'til', 'med', 'som',
  'den', 'det', 'de', 'har', 'fra', 'om', 'at', 'var', 'kan', 'vil', 'skal',
  'ikke', 'alle', 'over', 'under', 'bare', 'blant', 'mellom', 'viser', 'finner',
  'the', 'of', 'and', 'in', 'to', 'a', 'an', 'is', 'on', 'for', 'with', 'by',
  'that', 'this', 'are', 'was', 'be', 'or', 'but', 'at', 'from', 'it', 'its',
])

const GENERIC_WORDS = new Set([
  'norsk', 'norske', 'norge', 'nordisk', 'nordiske', 'norden',
  'rapport', 'analyse', 'kartlegging', 'sammendrag', 'faktaark',
  'mat', 'food', 'system', 'systems', 'research', 'evidence',
  'bibliotek', 'pdf', 'pack', 'thesis', 'academic', 'report',
  '2013', '2016', '2017', '2019', '2020', '2021', '2022', '2023', '2024', '2025', '2026',
  'data', 'annual', 'mrd', 'nok', 'eur', 'pct', 'mill',
  'offentlig', 'offentlige', 'statusrapport',
])

function normalize(value: string | null | undefined): string {
  return (value ?? '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function contentTokens(text: string): string[] {
  return normalize(text)
    .split(/\s+/)
    .filter(t => t.length > 2 && !STOP_WORDS.has(t))
}

function distinctiveTokens(text: string): string[] {
  return contentTokens(text).filter(t => !GENERIC_WORDS.has(t))
}

function relevanceForStrategy(strategy: Strategy): string {
  switch (strategy) {
    case 'transitive':
    case 'source-match':
      return 'primary-evidence'
    case 'description-match':
      return 'supporting'
    case 'tag-overlap':
      return 'related'
  }
}

type DocRow = {
  id: string
  title: string
  slug: string
  tags: string[]
  normalizedTitle: string
  titleTokens: string[]
  distinctiveWords: Set<string>
  allWords: Set<string>
}

type InsightRow = {
  id: string
  title: string
  description: string
  source: string
  tags: string[]
  sourceDocLinks: { id: string; documentId: string | null }[]
}

type PendingRef = {
  insightId: string
  documentId: string
  relevance: string
  strategy: Strategy
  detail: string
}

async function main() {
  console.log('Link insights to document evidence\n')

  const insights = await prisma.insight.findMany({
    include: {
      sourceDocLinks: {
        select: { id: true, documentId: true },
      },
    },
  })
  console.log(`Loaded ${insights.length} insights`)

  const rawDocs = await prisma.document.findMany({
    select: { id: true, title: true, slug: true, tags: true },
  })
  console.log(`Loaded ${rawDocs.length} documents`)

  const docs: DocRow[] = rawDocs.map(d => {
    const normalizedTitle = normalize(d.title)
    const titleTokens = normalizedTitle.split(/\s+/).filter(Boolean)
    const slugTokens = d.slug.split(/[-_/]+/).filter(t => t.length > 2)
    const titleDistinctive = distinctiveTokens(d.title)
    const tagWords = d.tags.map(t => t.toLowerCase())
    return {
      ...d,
      normalizedTitle,
      titleTokens,
      distinctiveWords: new Set([...titleDistinctive, ...slugTokens.filter(t => !GENERIC_WORDS.has(t))]),
      allWords: new Set([...contentTokens(d.title), ...slugTokens, ...tagWords]),
    }
  })

  const refs: PendingRef[] = []
  const seen = new Set<string>()
  const stats: Stats = {
    'transitive': 0,
    'source-match': 0,
    'description-match': 0,
    'tag-overlap': 0,
  }

  function addRef(insightId: string, documentId: string, strategy: Strategy, detail: string): boolean {
    const key = `${insightId}:${documentId}`
    if (seen.has(key)) return false
    seen.add(key)
    refs.push({
      insightId,
      documentId,
      relevance: relevanceForStrategy(strategy),
      strategy,
      detail,
    })
    stats[strategy]++
    return true
  }

  for (const insight of insights) {
    const insightRow: InsightRow = {
      id: insight.id,
      title: insight.title,
      description: insight.description,
      source: insight.source,
      tags: insight.tags,
      sourceDocLinks: insight.sourceDocLinks,
    }

    strategyA(insightRow, addRef)
    strategyB(insightRow, docs, addRef)
    strategyC(insightRow, docs, addRef)
    strategyD(insightRow, docs, seen, addRef)
  }

  console.log('\n=== LINKED REFS ===')
  for (const r of refs) {
    console.log(`  ${r.insightId} -> ${r.documentId.slice(0, 12)}.. [${r.strategy}] ${r.detail}`)
  }

  if (refs.length === 0) {
    console.log('\nNo new InsightDocumentRef records to create.')
    return
  }

  const result = await prisma.insightDocumentRef.createMany({
    data: refs.map(r => ({
      insightId: r.insightId,
      documentId: r.documentId,
      relevance: r.relevance,
    })),
    skipDuplicates: true,
  })

  console.log(`\n=== SUMMARY ===`)
  console.log(`Insights processed: ${insights.length}`)
  console.log(`Total refs prepared: ${refs.length}`)
  console.log(`Refs created (new): ${result.count}`)
  console.log(`Breakdown by strategy:`)
  console.log(`  transitive (via SourceDoc):  ${stats['transitive']}`)
  console.log(`  source-match:                ${stats['source-match']}`)
  console.log(`  description-match:           ${stats['description-match']}`)
  console.log(`  tag-overlap:                 ${stats['tag-overlap']}`)
}

function strategyA(
  insight: InsightRow,
  addRef: (insightId: string, documentId: string, strategy: Strategy, detail: string) => boolean
) {
  for (const link of insight.sourceDocLinks) {
    if (link.documentId) {
      addRef(insight.id, link.documentId, 'transitive', `via SourceDoc ${link.id}`)
    }
  }
}

function strategyB(
  insight: InsightRow,
  docs: DocRow[],
  addRef: (insightId: string, documentId: string, strategy: Strategy, detail: string) => boolean
) {
  const normalizedSource = normalize(insight.source)
  if (!normalizedSource) return

  for (const doc of docs) {
    if (!doc.normalizedTitle || doc.titleTokens.length < 3) continue
    if (doc.normalizedTitle === 'untitled') continue
    if (normalizedSource.includes(doc.normalizedTitle)) {
      addRef(insight.id, doc.id, 'source-match', `source contains "${doc.title.slice(0, 50)}"`)
    }
  }
}

function strategyC(
  insight: InsightRow,
  docs: DocRow[],
  addRef: (insightId: string, documentId: string, strategy: Strategy, detail: string) => boolean
) {
  const normDesc = normalize(insight.description)
  const normTitle = normalize(insight.title)
  const combined = normDesc + ' ' + normTitle
  if (!combined.trim()) return

  const insightDistinctive = new Set(distinctiveTokens(insight.description + ' ' + insight.title))
  const insightAll = new Set(contentTokens(insight.description + ' ' + insight.title))

  const candidates: { doc: DocRow; score: number; distinctiveMatched: number; matchedWords: string[] }[] = []

  for (const doc of docs) {
    if (doc.normalizedTitle === 'untitled') continue

    if (doc.titleTokens.length >= 4 && combined.includes(doc.normalizedTitle)) {
      addRef(insight.id, doc.id, 'description-match', `exact title substring "${doc.title.slice(0, 50)}"`)
      continue
    }

    if (doc.distinctiveWords.size < 2) continue

    let distinctiveMatched = 0
    let allMatched = 0
    const matchedWords: string[] = []
    for (const w of doc.distinctiveWords) {
      if (insightDistinctive.has(w)) {
        distinctiveMatched++
        matchedWords.push(w)
      } else if (insightAll.has(w)) {
        allMatched++
        matchedWords.push(w)
      }
    }

    const totalMatched = distinctiveMatched + allMatched
    if (totalMatched < 2) continue

    const score = (distinctiveMatched * 2 + allMatched) / (doc.distinctiveWords.size * 2)
    if (distinctiveMatched >= 2 && score >= 0.25) {
      candidates.push({ doc, score, distinctiveMatched, matchedWords })
    } else if (totalMatched >= 3 && score >= 0.35) {
      candidates.push({ doc, score, distinctiveMatched, matchedWords })
    }
  }

  candidates.sort((a, b) => b.score - a.score || b.distinctiveMatched - a.distinctiveMatched)
  const limit = 5
  let added = 0
  for (const c of candidates) {
    if (added >= limit) break
    if (addRef(insight.id, c.doc.id, 'description-match',
      `distinctive=${c.distinctiveMatched} score=${(c.score * 100).toFixed(0)}% [${c.matchedWords.slice(0, 5).join(',')}] -> "${c.doc.title.slice(0, 40)}"`)) {
      added++
    }
  }
}

function strategyD(
  insight: InsightRow,
  docs: DocRow[],
  seen: Set<string>,
  addRef: (insightId: string, documentId: string, strategy: Strategy, detail: string) => boolean
) {
  if (insight.tags.length < 2) return

  const insightTagSet = new Set(insight.tags.map(t => t.toLowerCase()))
  const candidates: { doc: DocRow; overlap: number; shared: string[] }[] = []

  for (const doc of docs) {
    if (doc.tags.length < 2) continue
    const key = `${insight.id}:${doc.id}`
    if (seen.has(key)) continue

    const shared: string[] = []
    for (const tag of doc.tags) {
      if (insightTagSet.has(tag.toLowerCase())) shared.push(tag)
    }
    if (shared.length >= 3) {
      candidates.push({ doc, overlap: shared.length, shared })
    }
  }

  candidates.sort((a, b) => b.overlap - a.overlap)
  const limit = 3
  let added = 0
  for (const c of candidates) {
    if (added >= limit) break
    if (addRef(insight.id, c.doc.id, 'tag-overlap',
      `${c.overlap} shared tags [${c.shared.join(',')}] -> "${c.doc.title.slice(0, 40)}"`)) {
      added++
    }
  }
}

main()
  .catch((e) => {
    console.error('Link failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
