import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

describe('version script wiring', () => {
  it('writes local version metadata before starting the dev server', () => {
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
      scripts?: Record<string, string>
    }

    assert.match(
      packageJson.scripts?.dev ?? '',
      /^tsx scripts\/write-version\.ts && next dev$/,
    )
  })
})
