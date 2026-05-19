import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { join } from 'node:path'
import {
  candidateLocalFilePaths,
  normalizeLocalFileLocator,
} from '../../src/lib/local-file-locator'

describe('local file locators', () => {
  it('normalizes project-relative paths and strips fragment anchors', () => {
    assert.equal(
      normalizeLocalFileLocator('./src/lib/data/meetings.ts#meeting-1'),
      'src/lib/data/meetings.ts',
    )

    assert.equal(
      normalizeLocalFileLocator('research/external/circular-cities/SA-02-mat-og-biomasse.md'),
      'external/circular-cities/SA-02-mat-og-biomasse.md',
    )
  })

  it('keeps literal hash characters that are part of a filename', () => {
    assert.equal(
      normalizeLocalFileLocator('Natural State AS Mail - Fwd_ NCH_ application 2025 # adjusted.pdf'),
      'Natural State AS Mail - Fwd_ NCH_ application 2025 # adjusted.pdf',
    )
  })

  it('builds repo, research, and docs candidates from the normalized locator', () => {
    assert.deepEqual(
      candidateLocalFilePaths('src/lib/data/meetings.ts#meeting-1', '/repo'),
      [
        join('/repo', 'src/lib/data/meetings.ts'),
        join('/repo', 'research', 'src/lib/data/meetings.ts'),
        join('/repo', 'docs', 'src/lib/data/meetings.ts'),
      ],
    )
  })

  it('returns no candidates for missing locators', () => {
    assert.equal(normalizeLocalFileLocator(null), null)
    assert.deepEqual(candidateLocalFilePaths('', '/repo'), [])
  })
})
