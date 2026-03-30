import { prisma } from '@/lib/db'
import { meetings as fallbackMeetings } from '@/lib/data/meetings'
import { isPrismaDataUnavailable } from './prisma-errors'

export async function getMeetings() {
  try {
    return await prisma.meeting.findMany({
      include: {
        sourceRefs: { select: { id: true, label: true, url: true, note: true } },
      },
      orderBy: { id: 'asc' },
    })
  } catch (error) {
    if (!isPrismaDataUnavailable(error)) throw error
    console.warn('[meetings-query] Falling back to static meeting data', error)
    return fallbackMeetings.map(meeting => ({
      ...meeting,
      sourceRefs: meeting.sources?.map(source => ({
        id: source.sourceId ?? source.label,
        label: source.label,
        url: source.url ?? null,
        note: source.note ?? null,
      })) ?? [],
    }))
  }
}
