import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

const INSIGHT_LINK_SCRIPTS = [
  'scripts/apply-insight-links-v3.ts',
  'scripts/apply-reviewed-insight-slug-links.ts',
  'scripts/auto-accept-insight-doc-links.ts',
  'scripts/build-insight-doc-link-review.ts',
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

  it('loads dotenv before Prisma-backed insight link application', () => {
    const source = readFileSync('scripts/apply-insight-links-v3.ts', 'utf8')
    assert.match(source, /^import ['"]dotenv\/config['"]/m)
  })

  it('uses each resolved document id when applying insight links', () => {
    const source = readFileSync('scripts/apply-insight-links-v3.ts', 'utf8')

    assert.match(source, /data:\s*\{\s*insightId:\s*r\.insightId,\s*documentId:\s*r\.documentId,\s*relevance\s*\}/s)
  })

  it('keeps reviewed slug-link application duplicate-aware', () => {
    const source = readFileSync('scripts/apply-reviewed-insight-slug-links.ts', 'utf8')

    assert.match(source, /^import ['"]dotenv\/config['"]/m)
    assert.match(source, /filterNewInsightDocumentRefs/)
    assert.match(source, /research\/_status\/insight-slug-link-accepted-2026-05-27\.csv/)
  })

  it('keeps the HVK preparedness report link target explicit and reviewable', () => {
    const source = readFileSync('scripts/link-nordic-core-sourcedocs.ts', 'utf8')

    assert.match(source, /sourceDocId:\s*['"]src-39['"]/)
    assert.match(source, /reportId:\s*['"]beredskap-finsk-modell-hvk['"]/)
    assert.match(source, /bibliotek\/beredskap\/finsk-modell-hvk\.md/)
  })
})
