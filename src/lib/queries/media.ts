import { prisma } from '@/lib/db'

export async function getMediaThemes() {
  return prisma.mediaTheme.findMany({ orderBy: { id: 'asc' } })
}

export async function getMediaTimeline() {
  return prisma.mediaTimelineEntry.findMany({ orderBy: { year: 'asc' } })
}

export async function getMediaCountryProfiles() {
  return prisma.mediaCountryProfile.findMany({ orderBy: { id: 'asc' } })
}

export async function getMediaOutlets() {
  return prisma.mediaOutlet.findMany({
    orderBy: [{ country: 'asc' }, { name: 'asc' }],
  })
}

export async function getMediaEntries() {
  return prisma.mediaEntry.findMany({
    include: {
      outlet: true,
      sourceDoc: true,
      codings: {
        orderBy: [{ createdAt: 'asc' }],
      },
    },
    orderBy: [
      { publishedYear: 'desc' },
      { publishedMonth: 'desc' },
      { publishedDay: 'desc' },
      { title: 'asc' },
    ],
  })
}
