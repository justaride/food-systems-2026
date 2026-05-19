import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

const INSIGHT_LINK_SCRIPTS = [
  'scripts/apply-insight-doc-links.ts',
  'scripts/apply-insight-links-v2.ts',
  'scripts/apply-insight-links-v3.ts',
  'scripts/auto-accept-insight-doc-links.ts',
  'scripts/build-insight-doc-link-review.ts',
  'scripts/curate-insight-doc-links.ts',
  'scripts/curate-insight-links-v2.ts',
  'scripts/curate-insight-links-v3.ts',
]

describe('insight link review scripts', () => {
  it('resolve review CSVs from the active checkout instead of a hardcoded user path', () => {
    for (const scriptPath of INSIGHT_LINK_SCRIPTS) {
      const source = readFileSync(scriptPath, 'utf8')
      assert.doesNotMatch(source, /\/Users\/gabrielboen\//, scriptPath)
      assert.match(source, /process\.cwd\(\)/, scriptPath)
    }
  })
})
