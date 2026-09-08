import { Prisma } from '@/generated/prisma/client'
import { prisma } from '@/lib/db'
import { catalogPage, catalogPageInfo, catalogFilter, literalLike, type CatalogFilters } from '@/lib/catalog-pagination'
import { quarantineDocument } from '@/lib/source-quarantine'
import { getLibraryAnalysisBadgesByDocumentIds } from './library-analysis'
import { getActors } from './actors'
import { getSourceCatalog } from './source-catalog'
import type { DocumentRow } from '@/app/bibliotek/BibliotekContent'

const unique = (values: Array<string | null>) => [...new Set(values.filter((v): v is string => Boolean(v)))].sort()
const count = (values: Array<string | null>) => values.reduce<Record<string, number>>((out, key) => { if (key) out[key] = (out[key] ?? 0) + 1; return out }, {})

export async function getDocumentCatalogPage(filters: CatalogFilters = {}) {
  const query = (filters.q ?? '').trim().slice(0, 300)
  const category = catalogFilter(filters.category), type = catalogFilter(filters.type), country = catalogFilter(filters.country)
  const where = Prisma.sql`WHERE
    (${category}::text IS NULL OR category = ${category})
    AND (${type}::text IS NULL OR "documentType" = ${type})
    AND (${country}::text IS NULL OR country = ${country})
    AND (${query} = '' OR concat_ws(' ', title, slug, author, summary, array_to_string(tags, ' ')) ILIKE ${literalLike(query)})`
  const [totals, facets, sums] = await Promise.all([
    prisma.$queryRaw<Array<{ total: number }>>`SELECT COUNT(*)::int AS total FROM "Document" ${where}`,
    prisma.document.findMany({ distinct: ['documentType', 'category', 'country'], select: { documentType: true, category: true, country: true } }),
    prisma.document.aggregate({ _sum: { wordCount: true }, _count: { _all: true } }),
  ])
  const info = catalogPageInfo(totals[0].total, catalogPage(filters.page))
  const raw = await prisma.$queryRaw<Array<Omit<DocumentRow, 'libraryAnalysis'>>>`
    SELECT id, slug, title, author, year, category, subcategory, country, "documentType", summary, "wordCount", tags
    FROM "Document" ${where} ORDER BY title ASC, id ASC LIMIT ${info.pageSize} OFFSET ${(info.page - 1) * info.pageSize}`
  const docs = raw.map(quarantineDocument)
  const badges = await getLibraryAnalysisBadgesByDocumentIds(docs.map(d => d.id))
  return { ...info, rows: docs.map(d => ({ ...d, libraryAnalysis: badges.get(d.id) ?? null })),
    facets: { types: unique(facets.map(f => f.documentType)), categories: unique(facets.map(f => f.category)), countries: unique(facets.map(f => f.country)) },
    stats: { total: sums._count._all, totalWords: sums._sum.wordCount ?? 0 } }
}

export async function getActorCatalogPage(filters: CatalogFilters = {}) {
  const q = (filters.q ?? '').trim().slice(0, 300), type = catalogFilter(filters.type), priority = catalogFilter(filters.priority), stance = catalogFilter(filters.stance), theme = catalogFilter(filters.theme)
  const where = Prisma.sql`WHERE (${type}::text IS NULL OR a."actorType" = ${type})
    AND (${priority}::text IS NULL OR a."priorityTier" = ${priority})
    AND (${stance}::text IS NULL OR a."currentStance" = ${stance})
    AND (${theme}::text IS NULL OR ${theme} = ANY(a."themeTags"))
    AND (${q} = '' OR concat_ws(' ', a.name, a."roleSummary", a."currentRelevance", a."specificAsk", a."nextStep", c.name, array_to_string(a."themeTags", ' ')) ILIKE ${literalLike(q)})`
  const [totals, meta] = await Promise.all([
    prisma.$queryRaw<Array<{ total: number }>>`SELECT COUNT(*)::int total FROM "Actor" a LEFT JOIN "Company" c ON c.id = a."companyId" ${where}`,
    // Only aggregate inputs reach this server. Contacts and narrative payloads are loaded for one page.
    prisma.actor.findMany({ select: { id: true, slug: true, name: true, actorType: true, priorityTier: true, currentStance: true, themeTags: true, powerScore: true, interestScore: true, specificAsk: true } }),
  ])
  const info = catalogPageInfo(totals[0].total, catalogPage(filters.page))
  const ids = await prisma.$queryRaw<Array<{ id: string }>>`SELECT a.id FROM "Actor" a LEFT JOIN "Company" c ON c.id = a."companyId" ${where}
    ORDER BY CASE a."priorityTier" WHEN 'p1' THEN 0 WHEN 'p2' THEN 1 WHEN 'p3' THEN 2 ELSE 99 END,
    a."powerScore" DESC NULLS LAST, a.name ASC, a.id ASC LIMIT ${info.pageSize} OFFSET ${(info.page - 1) * info.pageSize}`
  const selected = new Map((await getActors({ ids: ids.map(r => r.id) })).map(a => [a.id, a]))
  const isKey = (a: typeof meta[number]) => (a.powerScore ?? 0) >= 4 && (a.interestScore ?? 0) >= 4
  const pool = theme ? meta.filter(a => a.themeTags.includes(theme)) : meta
  return { ...info, rows: ids.map(r => selected.get(r.id)!),
    facets: { types: unique(meta.map(a => a.actorType)), stances: unique(meta.map(a => a.currentStance)), themes: unique(meta.flatMap(a => a.themeTags)) },
    stats: { total: meta.length, p1: meta.filter(a => a.priorityTier === 'p1').length, keyPlayers: meta.filter(isKey).length, withAsks: meta.filter(a => Boolean(a.specificAsk)).length },
    quadrants: { keyPlayers: meta.filter(isKey).length,
      keepSatisfied: meta.filter(a => (a.powerScore ?? 0) >= 4 && (a.interestScore ?? 0) < 4).length,
      keepInformed: meta.filter(a => (a.powerScore ?? 0) < 4 && (a.interestScore ?? 0) >= 4).length,
      monitor: meta.filter(a => (a.powerScore ?? 0) < 4 && (a.interestScore ?? 0) < 4).length },
    topKeyPlayersPoolCount: pool.length,
    topKeyPlayers: pool.map(a => ({ actor: { id: a.id, slug: a.slug, name: a.name, powerScore: a.powerScore, interestScore: a.interestScore, themeTags: a.themeTags }, score: (a.powerScore ?? 0) * (a.interestScore ?? 0) }))
      .filter(a => a.score > 0).sort((a, b) => b.score - a.score || a.actor.name.localeCompare(b.actor.name, 'no')).slice(0, 10),
  }
}

export async function getSourceCatalogPage(filters: CatalogFilters = {}) {
  // Sources merge database rows, fallback documents and checked-in download backlogs.
  // Compose and filter on the server so browser payloads remain bounded without breaking that union.
  const { sources, ...metadata } = await getSourceCatalog()
  const q = (filters.q ?? '').trim().slice(0, 300).toLowerCase()
  const type = catalogFilter(filters.type), status = catalogFilter(filters.status), round = catalogFilter(filters.round), origin = catalogFilter(filters.origin)
  const matches = sources.filter(s => (!type || s.sourceType === type) && (!status || s.downloadStatus === status)
    && (!round || s.researchRound === round) && (!origin || s.origin === origin)
    && (!q || [s.title, s.filename, s.author, s.description, s.backlogTheme].some(v => v?.toLowerCase().includes(q))))
  const info = catalogPageInfo(matches.length, catalogPage(filters.page))
  const typeCounts = count(sources.map(s => s.sourceType))
  return { ...metadata, ...info, rows: matches.slice((info.page - 1) * info.pageSize, info.page * info.pageSize),
    statusStats: count(sources.map(s => s.downloadStatus)), typeCounts, roundCount: sources.filter(s => s.researchRound !== null).length,
    stats: { total: sources.length, nou: typeCounts.nou ?? 0, rapport: typeCounts.rapport ?? 0, analyse: typeCounts.analyse ?? 0, lovverk: typeCounts.lovverk ?? 0 } }
}
