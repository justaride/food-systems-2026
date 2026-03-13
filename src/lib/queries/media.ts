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
