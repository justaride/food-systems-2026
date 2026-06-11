import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

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
  it('keeps production operations behind manual dispatch and explicit confirmation', () => {
    assert.match(workflow, /workflow_dispatch:/)
    assert.match(workflow, /if:\s*\$\{\{\s*inputs\.confirm == 'IMPORT'\s*\}\}/)
    assert.match(workflow, /Type IMPORT to confirm/)
  })

  it('exposes only sanctioned prod operation targets', () => {
    assert.deepEqual(workflowTargets(), [
      'verify-only',
      'ownership',
      'registers',
      'approved-corpus',
      'full',
    ])
  })

  it('maps every target through an explicit shell allowlist', () => {
    assert.doesNotMatch(workflow, /npm run db:import:\$\{\{\s*inputs\.target\s*\}\}/)

    assert.match(workflow, /case "\$TARGET" in/)
    assert.match(workflow, /verify-only\)\s+npm run db:verify/)
    assert.match(workflow, /ownership\)\s+npm run db:import:ownership\s+npm run db:verify/)
    assert.match(workflow, /registers\)\s+npm run db:prod-sync:registers\s+npm run db:verify/)
    assert.match(workflow, /approved-corpus\)\s+npm run db:import:approved-corpus/)
    assert.match(workflow, /full\)\s+npm run db:prod-sync/)
    assert.match(workflow, /Unsupported prod data import target/)
  })

  it('keeps routed package scripts available for write targets', () => {
    for (const scriptName of [
      'db:import:ownership',
      'db:prod-sync:registers',
      'db:import:approved-corpus',
      'db:prod-sync',
    ]) {
      assert.ok(packageJson.scripts[scriptName], `${scriptName} is missing`)
    }
  })
})
