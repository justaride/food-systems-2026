import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { fallbackMeetingRecords, mergeMeetingsWithStaticAdditions } from '../../src/lib/queries/meetings'

describe('meetings query helpers', () => {
  it('appends static meetings that are not yet present in the database result', () => {
    const dbLaggingBehindStaticData = fallbackMeetingRecords().filter((meeting) => meeting.id !== 'meeting-9')

    const merged = mergeMeetingsWithStaticAdditions(dbLaggingBehindStaticData)

    assert.equal(merged.length, fallbackMeetingRecords().length)
    assert.ok(merged.some((meeting) => meeting.id === 'meeting-9'))
  })

  it('keeps database rows authoritative when a meeting id already exists', () => {
    const dbRows = fallbackMeetingRecords().map((meeting) =>
      meeting.id === 'meeting-9'
        ? { ...meeting, title: 'DB title should win' }
        : meeting,
    )

    const merged = mergeMeetingsWithStaticAdditions(dbRows)
    const meetingNine = merged.find((meeting) => meeting.id === 'meeting-9')

    assert.equal(meetingNine?.title, 'DB title should win')
    assert.equal(merged.filter((meeting) => meeting.id === 'meeting-9').length, 1)
  })
})
