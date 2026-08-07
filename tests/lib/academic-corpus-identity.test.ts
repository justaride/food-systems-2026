import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildManagedTranscriptSourceDocIds,
  loadManagedTranscriptSourceDocIds,
} from '../../src/lib/citations/academic-corpus-identity'

describe('academic corpus managed runtime identity', () => {
  it('mirrors transcript import preference and excludes unavailable/error rows', () => {
    const ids = buildManagedTranscriptSourceDocIds({
      manifest: [
        { video_id: 'main', status: 'ok', segment_count: 2, txt_file: 'main.txt' },
        { video_id: 'fallback', status: 'error', segment_count: 0, txt_file: 'missing.txt' },
        { video_id: 'empty', status: 'ok', segment_count: 0, txt_file: 'empty.txt' },
      ],
      localAsrManifest: [
        { video_id: 'fallback', status: 'ok', segment_count: 3, txt_file: 'fallback.txt' },
      ],
      transcriptFileExists: path => path === 'main.txt',
      localAsrFileExists: path => path === 'fallback.txt',
    })

    assert.deepEqual(ids, ['src-yt-fallback', 'src-yt-main'])
  })

  it('derives the 17 versioned Landbruk Arena SourceDoc identities', () => {
    const ids = loadManagedTranscriptSourceDocIds()
    assert.equal(ids.length, 17)
    assert.equal(new Set(ids).size, 17)
    assert.ok(ids.every(id => id.startsWith('src-yt-')))
  })
})
