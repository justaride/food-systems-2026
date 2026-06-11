import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
  scripts: Record<string, string>
}

const workflow = readFileSync('.github/workflows/prod-data-import.yml', 'utf8')

function workflowTargets() {
  const match = workflow.match(/options:\n((?:\s+- .+\n)+)/)
  assert.ok(match, 'prod-data-import workflow target options are missing')

  return match[1]
    .split('\n')
    .map((line) => line.trim().match(/^- (.+)$/)?.[1])
    .filter((value): value is string => Boolean(value))
}

describe('prod data import workflow', () => {
  it('exposes the approved full import paths used by the Phase B operator plan', () => {
    const targets = workflowTargets()

    assert.ok(targets.includes('ownership'))
    assert.ok(targets.includes('approved-corpus'))
    assert.ok(targets.includes('full'))
  })

  it('keeps every workflow target mapped to a package import script', () => {
    for (const target of workflowTargets()) {
      assert.ok(packageJson.scripts[`db:import:${target}`], `${target} has no db:import:${target} script`)
    }
  })
})
