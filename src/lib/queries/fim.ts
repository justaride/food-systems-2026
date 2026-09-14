import { prisma } from '@/lib/db'
import { isMissingPrismaTable } from './prisma-errors'

// FIM data is read only by the /innovasjonskart server components. /api/* bypasses
// Cloudflare Access, so never expose these queries through an API route
// (tests/lib/fim-data-isolation.test.ts enforces this).

export const FIM_PAGE_SIZE = 50

export async function getFimProfilePage(opts: { q?: string; cohort?: string; kind?: string; page: number }) {
  const q = (opts.q ?? '').trim().slice(0, 200)
  const where = {
    ...(opts.cohort && { cohort: opts.cohort }),
    ...(opts.kind && { entityKind: opts.kind }),
    ...(q && {
      OR: [
        { name: { contains: q, mode: 'insensitive' as const } },
        { orgNumber: { contains: q } },
        { searchText: { contains: q, mode: 'insensitive' as const } },
      ],
    }),
  }

  try {
    const [release, matches, cohorts, kinds] = await Promise.all([
      prisma.fimRelease.findFirst({ orderBy: { importedAt: 'desc' } }),
      prisma.fimProfile.count({ where }),
      prisma.fimProfile.groupBy({ by: ['cohort'], _count: { _all: true } }),
      prisma.fimProfile.groupBy({ by: ['entityKind'], _count: { _all: true }, orderBy: { entityKind: 'asc' } }),
    ])
    const lastPage = Math.max(1, Math.ceil(matches / FIM_PAGE_SIZE))
    const page = Math.min(Math.max(1, opts.page), lastPage)
    const rows = await prisma.fimProfile.findMany({
      where,
      orderBy: [{ name: 'asc' }, { id: 'asc' }],
      skip: (page - 1) * FIM_PAGE_SIZE,
      take: FIM_PAGE_SIZE,
      select: { id: true, name: true, orgNumber: true, entityKind: true, cohort: true, documentedFieldCount: true, conflictCount: true },
    })
    return {
      available: true,
      release,
      matches,
      page,
      lastPage,
      rows,
      cohorts: Object.fromEntries(cohorts.map(c => [c.cohort, c._count._all])) as Record<string, number>,
      kinds: kinds.map(k => ({ kind: k.entityKind, count: k._count._all })),
    }
  } catch (error) {
    if (!isMissingPrismaTable(error, 'Fim')) throw error
    return { available: false, release: null, matches: 0, page: 1, lastPage: 1, rows: [], cohorts: {} as Record<string, number>, kinds: [] }
  }
}

export async function getFimProfile(id: string) {
  try {
    const profile = await prisma.fimProfile.findUnique({ where: { id }, include: { release: true } })
    if (!profile) return null
    const company = profile.companyId
      ? await prisma.company.findUnique({ where: { id: profile.companyId }, select: { id: true, name: true } })
      : null
    return { ...profile, company }
  } catch (error) {
    if (isMissingPrismaTable(error, 'Fim')) return null
    throw error
  }
}
