import { prisma } from '@/lib/db'
import { getLibraryAnalysisBadgesByDocumentIds } from './library-analysis'
import { isPrismaDataUnavailable } from './prisma-errors'

const sourceCitationSelect = {
  citationText: true,
  title: true,
  url: true,
  localPath: true,
  pageRef: true,
  accessedAt: true,
  verifiedAt: true,
  citationReadiness: true,
  notes: true,
} as const

export async function getDocuments(opts?: {
  category?: string
  country?: string
  documentType?: string
  limit?: number
  offset?: number
}) {
  const { category, country, documentType, limit = 50, offset = 0 } = opts ?? {}

  const where = {
    ...(category && { category }),
    ...(country && { country }),
    ...(documentType && { documentType }),
  }

  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where,
      select: {
        id: true,
        slug: true,
        title: true,
        author: true,
        year: true,
        category: true,
        subcategory: true,
        country: true,
        documentType: true,
        wordCount: true,
        tags: true,
        createdAt: true,
      },
      orderBy: { title: 'asc' },
      take: limit,
      skip: offset,
    }),
    prisma.document.count({ where }),
  ])

  return { documents, total }
}

export async function getDocumentsList() {
  const documents = await prisma.document.findMany({
    select: {
      id: true,
      slug: true,
      title: true,
      author: true,
      year: true,
      category: true,
      subcategory: true,
      country: true,
      documentType: true,
      summary: true,
      wordCount: true,
      tags: true,
    },
    orderBy: { title: 'asc' },
  })

  try {
    const badges = await getLibraryAnalysisBadgesByDocumentIds(documents.map(document => document.id))
    return documents.map(document => ({
      ...document,
      libraryAnalysis: badges.get(document.id) ?? null,
    }))
  } catch (error) {
    if (!isPrismaDataUnavailable(error)) throw error
    return documents.map(document => ({
      ...document,
      libraryAnalysis: null,
    }))
  }
}

export async function getDocumentById(id: string) {
  return prisma.document.findUnique({
    where: { id },
    include: {
      refsFrom: { include: { to: { select: { id: true, title: true, slug: true } } } },
      refsTo: { include: { from: { select: { id: true, title: true, slug: true } } } },
    },
  })
}

export async function getDocumentBySlug(slug: string) {
  return prisma.document.findUnique({
    where: { slug },
    include: {
      sourceCitations: {
        select: sourceCitationSelect,
        orderBy: { createdAt: 'asc' },
      },
      sourceDoc: {
        include: {
          sourceCitations: {
            select: sourceCitationSelect,
            orderBy: { createdAt: 'asc' },
          },
        },
      },
      thesis: true,
      report: true,
      refsFrom: { include: { to: { select: { id: true, title: true, slug: true } } } },
      refsTo: { include: { from: { select: { id: true, title: true, slug: true } } } },
      insightDocumentRefs: {
        include: {
          insight: { select: { id: true, title: true, insightType: true, tags: true } },
        },
        orderBy: { insight: { title: 'asc' } },
      },
      companyDocumentRefs: {
        include: {
          company: {
            select: {
              id: true,
              name: true,
              valueChainStage: true,
              ownershipType: true,
              actor: {
                select: { id: true, slug: true, name: true, actorType: true, themeTags: true },
              },
            },
          },
        },
        orderBy: { company: { name: 'asc' } },
      },
      actorDocumentRefs: {
        include: {
          actor: { select: { id: true, slug: true, name: true, actorType: true, themeTags: true } },
        },
        orderBy: { actor: { name: 'asc' } },
      },
    },
  })
}

/**
 * Document types that count as "policy-relevant" on /politikk.
 * Keep conservative — broad enough to surface regulatory reports and
 * white papers, narrow enough to exclude pure company annual reports
 * and transcripts.
 */
export const POLICY_DOCUMENT_TYPES = [
  'policy',
  'policy-report',
  'legal',
  'regulatory',
  'decision',
  'strategy',
  'think-tank',
] as const

/**
 * Tag fragments used as a secondary signal for policy relevance when the
 * documentType field is missing or generic ("research", "report").
 * Case-insensitive substring match.
 */
const POLICY_TAG_FRAGMENTS = [
  'beredskap',
  'selvforsyn',
  'matsvinn',
  'co2',
  'utp',
  'policy',
  'governance',
  'konkurranse',
  'competition',
  'regulatory',
  'sirkular',
  'circular',
  'pfas',
  'emballasje',
  'packaging',
  'biogas',
  'biogass',
]

type PoliticsDocSelection = {
  id: string
  slug: string
  title: string
  author: string | null
  year: number | null
  documentType: string | null
  category: string | null
  country: string | null
  tags: string[]
}

export type PolicyDocumentsByCountry = Record<
  'no' | 'se' | 'dk' | 'fi' | 'is' | 'nordic' | 'eu',
  {
    total: number
    policyRelevant: number
    samples: PoliticsDocSelection[]
  }
>

/**
 * For the /politikk page: return counts + sample policy-relevant documents
 * per country code. Frontend keys are lowercase (no/se/dk/fi/is/nordic/eu),
 * DB-canonical values are uppercase ISO + 'Nordic' / 'Global' — normalized
 * 2026-05-11. Translation happens at this boundary.
 *
 * Filtering strategy:
 *  1. Filter by country (DB-uppercase code).
 *  2. Include a document as "policy-relevant" if EITHER
 *       - documentType ∈ POLICY_DOCUMENT_TYPES, OR
 *       - any tag contains one of POLICY_TAG_FRAGMENTS.
 *  3. Sample the most-recent N (year desc, nulls last) policy-relevant docs.
 */
const DOC_COUNTRY_DB_VALUE: Record<
  'no' | 'se' | 'dk' | 'fi' | 'is' | 'nordic' | 'eu',
  string
> = {
  no: 'NO',
  se: 'SE',
  dk: 'DK',
  fi: 'FI',
  is: 'IS',
  nordic: 'Nordic',
  eu: 'EU',
}

export async function getPolicyDocumentsByCountry(opts?: {
  samplesPerCountry?: number
}): Promise<PolicyDocumentsByCountry> {
  const samplesPerCountry = opts?.samplesPerCountry ?? 6
  const countryCodes = ['no', 'se', 'dk', 'fi', 'is', 'nordic', 'eu'] as const

  const result = {} as PolicyDocumentsByCountry
  for (const code of countryCodes) {
    const dbValue = DOC_COUNTRY_DB_VALUE[code]
    // Two parallel queries: total count and policy-relevant rows.
    const [total, rows] = await Promise.all([
      prisma.document.count({ where: { country: dbValue } }),
      prisma.document.findMany({
        where: {
          country: dbValue,
          OR: [
            { documentType: { in: [...POLICY_DOCUMENT_TYPES] } },
            { tags: { hasSome: POLICY_TAG_FRAGMENTS } },
          ],
        },
        select: {
          id: true,
          slug: true,
          title: true,
          author: true,
          year: true,
          documentType: true,
          category: true,
          country: true,
          tags: true,
        },
        // Postgres orders nulls last on DESC by default (with Prisma: nulls: 'last' not supported on all drivers),
        // so we sort manually after fetching.
        orderBy: [{ year: 'desc' }, { title: 'asc' }],
      }),
    ])

    // hasSome on tags matches a *tag equals* any of the provided strings — so it
    // matches exact tags like "beredskap" / "matsvinn" etc. For broader fuzzy
    // matching we additionally scan the returned tags client-side, but since the
    // initial OR already surfaces anything with POLICY_DOCUMENT_TYPES, the
    // substring pass is just a secondary filter to drop any false-positive.
    const filtered = rows.filter((r) => {
      const typeOk =
        r.documentType !== null &&
        POLICY_DOCUMENT_TYPES.includes(r.documentType as (typeof POLICY_DOCUMENT_TYPES)[number])
      if (typeOk) return true
      const joinedTags = r.tags.join(' ').toLowerCase()
      return POLICY_TAG_FRAGMENTS.some((frag) => joinedTags.includes(frag))
    })

    result[code] = {
      total,
      policyRelevant: filtered.length,
      samples: filtered.slice(0, samplesPerCountry),
    }
  }
  return result
}
