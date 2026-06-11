import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

type CoverageFile = {
  entries: Array<{
    slug: string
    metrics: { treeSize: number }
  }>
}

type TreeSizeExpectationFile = {
  roots: Array<{
    slug: string
    expectedTreeSize: number
    expectedOrgNrs: string[]
    sourceScripts: string[]
  }>
}

describe('konsern tree-size expectations', () => {
  it('matches generated konsern coverage tree sizes', () => {
    const coverage = JSON.parse(
      readFileSync(join(process.cwd(), 'data/konsern-coverage.json'), 'utf8'),
    ) as CoverageFile
    const expectations = JSON.parse(
      readFileSync(join(process.cwd(), 'data/konsern-tree-size-expectations.json'), 'utf8'),
    ) as TreeSizeExpectationFile

    const actualTreeSizeBySlug = new Map(
      coverage.entries.map(entry => [entry.slug, entry.metrics.treeSize]),
    )

    assert.equal(expectations.roots.length, 14)
    for (const expected of expectations.roots) {
      assert.equal(
        actualTreeSizeBySlug.get(expected.slug),
        expected.expectedTreeSize,
        `${expected.slug} treeSize should match static import-corpus expectation`,
      )
      assert.equal(expected.expectedOrgNrs.length, expected.expectedTreeSize)
      assert.ok(expected.sourceScripts.length > 0)
    }
  })
})
