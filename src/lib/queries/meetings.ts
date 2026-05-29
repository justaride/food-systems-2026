import { prisma } from '@/lib/db'
import { meetings as fallbackMeetings, type Meeting } from '@/lib/data/meetings'
import { isPrismaDataUnavailable } from './prisma-errors'

type MeetingSourceRefRecord = {
  id: string
  label: string
  url: string | null
  note: string | null
}

export type MeetingRecord = Omit<Meeting, 'sources'> & {
  sourceRefs: MeetingSourceRefRecord[]
}

export function fallbackMeetingRecords(): MeetingRecord[] {
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

function meetingSortKey(id: string) {
  const match = id.match(/^meeting-(\d+)$/)
  return match ? Number(match[1]) : Number.POSITIVE_INFINITY
}

export function mergeMeetingsWithStaticAdditions<T extends MeetingRecord>(dbMeetings: T[]): MeetingRecord[] {
  const existingIds = new Set(dbMeetings.map(meeting => meeting.id))
  const additions = fallbackMeetingRecords().filter(meeting => !existingIds.has(meeting.id))

  return [...dbMeetings, ...additions].sort((a, b) => {
    const numericDiff = meetingSortKey(a.id) - meetingSortKey(b.id)
    return numericDiff || a.id.localeCompare(b.id, 'nb', { numeric: true })
  })
}

export async function getMeetings() {
  try {
    const dbMeetings = await prisma.meeting.findMany({
      include: {
        sourceRefs: { select: { id: true, label: true, url: true, note: true } },
      },
      orderBy: { id: 'asc' },
    })
    return mergeMeetingsWithStaticAdditions(dbMeetings)
  } catch (error) {
    if (!isPrismaDataUnavailable(error)) throw error
    console.warn('[meetings-query] Falling back to static meeting data', error)
    return fallbackMeetingRecords()
  }
}
