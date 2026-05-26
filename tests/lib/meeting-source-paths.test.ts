import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'
import { meetings } from '../../src/lib/data/meetings'
import { sources } from '../../prisma/seed-data/sources'

describe('meeting source paths', () => {
  it('points every meeting source at a file that exists in the repo', () => {
    const missing = meetings
      .map((meeting) => ({
        id: meeting.id,
        source: meeting.source,
        fullPath: join(process.cwd(), meeting.source),
      }))
      .filter(({ fullPath }) => !existsSync(fullPath))

    assert.deepEqual(missing, [])
  })

  it('links each meeting primary source ref to the same source file', () => {
    const sourcesById = new Map(sources.map((source) => [source.id, source]))

    const mismatches = meetings.map((meeting) => {
      const primarySourceId = meeting.sources?.[0]?.sourceId
      const primarySource = primarySourceId ? sourcesById.get(primarySourceId) : undefined
      return {
        id: meeting.id,
        meetingSource: meeting.source,
        sourceId: primarySourceId,
        sourceFilename: primarySource?.filename,
      }
    }).filter(({ meetingSource, sourceFilename }) => sourceFilename !== meetingSource)

    assert.deepEqual(mismatches, [])
  })
})
