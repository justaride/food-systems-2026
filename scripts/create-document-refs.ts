import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

type RefData = { fromId: string; toId: string; refType: string }

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function evidencePackSubdir(filePath: string): string | null {
  const match = filePath.match(/^evidence-pack\/([^/]+)\//)
  return match ? match[1] : null
}

async function ruleCofiled(): Promise<RefData[]> {
  const docs = await prisma.document.findMany({
    where: { filePath: { startsWith: 'evidence-pack/' } },
    select: { id: true, filePath: true },
  })

  const bySubdir = new Map<string, string[]>()
  for (const doc of docs) {
    const sub = evidencePackSubdir(doc.filePath)
    if (!sub) continue
    const existing = bySubdir.get(sub) ?? []
    existing.push(doc.id)
    bySubdir.set(sub, existing)
  }

  const refs: RefData[] = []
  for (const ids of bySubdir.values()) {
    if (ids.length < 2) continue
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const [a, b] = ids[i] < ids[j] ? [ids[i], ids[j]] : [ids[j], ids[i]]
        refs.push({ fromId: a, toId: b, refType: 'co-filed' })
      }
    }
  }
  return refs
}

async function ruleSeries(): Promise<RefData[]> {
  const reports = await prisma.report.findMany({
    where: {
      documentId: { not: null },
      year: { not: null },
    },
    select: {
      id: true,
      institution: true,
      reportCategory: true,
      year: true,
      documentId: true,
    },
  })

  const groups = new Map<string, { docId: string; year: number }[]>()
  for (const r of reports) {
    if (!r.documentId || !r.year || !r.institution) continue
    const key = `${normalizeText(r.institution)}::${r.reportCategory}`
    const existing = groups.get(key) ?? []
    existing.push({ docId: r.documentId, year: r.year })
    groups.set(key, existing)
  }

  const refs: RefData[] = []
  for (const entries of groups.values()) {
    if (entries.length < 2) continue
    entries.sort((a, b) => a.year - b.year)
    for (let i = 0; i < entries.length - 1; i++) {
      if (entries[i].docId === entries[i + 1].docId) continue
      refs.push({
        fromId: entries[i].docId,
        toId: entries[i + 1].docId,
        refType: 'series',
      })
    }
  }
  return refs
}

async function ruleAnnualSeries(): Promise<RefData[]> {
  const docs = await prisma.document.findMany({
    where: {
      documentType: 'annual-report',
      year: { not: null },
    },
    select: { id: true, author: true, title: true, year: true, filePath: true },
  })

  const groups = new Map<string, { id: string; year: number }[]>()
  for (const doc of docs) {
    if (!doc.year) continue
    const authorKey = doc.author
      ? normalizeText(doc.author)
      : normalizeText(doc.filePath.replace(/[-_]?\d{4}.*$/, ''))
    if (!authorKey || authorKey.length < 3) continue

    const existing = groups.get(authorKey) ?? []
    existing.push({ id: doc.id, year: doc.year })
    groups.set(authorKey, existing)
  }

  const refs: RefData[] = []
  for (const entries of groups.values()) {
    const deduped = entries.filter(
      (entry, idx, arr) => arr.findIndex(e => e.id === entry.id) === idx
    )
    if (deduped.length < 2) continue
    deduped.sort((a, b) => a.year - b.year)
    for (let i = 0; i < deduped.length - 1; i++) {
      if (deduped[i].id === deduped[i + 1].id) continue
      refs.push({
        fromId: deduped[i].id,
        toId: deduped[i + 1].id,
        refType: 'annual-series',
      })
    }
  }
  return refs
}

async function ruleCites(): Promise<RefData[]> {
  const docs = await prisma.document.findMany({
    select: { id: true, title: true, content: true },
  })

  const titlesWithIds: { id: string; normalized: string; wordCount: number }[] = []
  for (const doc of docs) {
    const normalized = normalizeText(doc.title)
    const wordCount = normalized.split(/\s+/).filter(Boolean).length
    if (wordCount >= 4) {
      titlesWithIds.push({ id: doc.id, normalized, wordCount })
    }
  }

  const refs: RefData[] = []
  const seen = new Set<string>()

  for (const doc of docs) {
    const normalizedContent = normalizeText(doc.content)
    for (const target of titlesWithIds) {
      if (target.id === doc.id) continue
      const key = `${doc.id}::${target.id}`
      if (seen.has(key)) continue
      if (normalizedContent.includes(target.normalized)) {
        refs.push({ fromId: doc.id, toId: target.id, refType: 'cites' })
        seen.add(key)
      }
    }
  }
  return refs
}

async function ruleFulltextOf(): Promise<RefData[]> {
  const docs = await prisma.document.findMany({
    where: {
      metadata: { not: null },
    },
    select: { id: true, filePath: true, metadata: true },
  })

  const thesesWithDocs = await prisma.thesis.findMany({
    where: { documentId: { not: null } },
    select: { id: true, documentId: true },
  })
  const reportsWithDocs = await prisma.report.findMany({
    where: { documentId: { not: null } },
    select: { id: true, documentId: true },
  })

  const thesisDocMap = new Map(thesesWithDocs.map(t => [t.id, t.documentId!]))
  const reportDocMap = new Map(reportsWithDocs.map(r => [r.id, r.documentId!]))

  const refs: RefData[] = []
  const seen = new Set<string>()

  for (const doc of docs) {
    const meta = doc.metadata as Record<string, unknown> | null
    if (!meta?.structuredSource) continue

    const src = meta.structuredSource as {
      thesisId?: string | null
      reportId?: string | null
      sourceDocId?: string | null
    }

    let structuredDocId: string | null = null
    if (src.thesisId) {
      structuredDocId = thesisDocMap.get(src.thesisId) ?? null
    }
    if (!structuredDocId && src.reportId) {
      structuredDocId = reportDocMap.get(src.reportId) ?? null
    }

    if (!structuredDocId || structuredDocId === doc.id) continue

    const key = `${doc.id}::${structuredDocId}`
    if (seen.has(key)) continue
    seen.add(key)

    refs.push({ fromId: doc.id, toId: structuredDocId, refType: 'fulltext-of' })
  }
  return refs
}

async function main() {
  console.log('Creating rule-based DocumentRef edges...\n')

  const rules: { name: string; fn: () => Promise<RefData[]> }[] = [
    { name: 'co-filed', fn: ruleCofiled },
    { name: 'series', fn: ruleSeries },
    { name: 'annual-series', fn: ruleAnnualSeries },
    { name: 'cites', fn: ruleCites },
    { name: 'fulltext-of', fn: ruleFulltextOf },
  ]

  let totalCreated = 0

  for (const rule of rules) {
    const refs = await rule.fn()
    if (refs.length === 0) {
      console.log(`Rule ${rule.name}: 0 candidates, 0 created`)
      continue
    }

    const result = await prisma.documentRef.createMany({
      data: refs,
      skipDuplicates: true,
    })

    console.log(`Rule ${rule.name}: ${refs.length} candidates, ${result.count} created`)
    totalCreated += result.count
  }

  console.log(`\nDone. ${totalCreated} total DocumentRef edges created.`)
}

main()
  .catch((e) => {
    console.error('DocumentRef creation failed:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
