import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

const workflow = readFileSync('.github/workflows/prod-data-import.yml', 'utf8')

describe('prod data import workflow', () => {
  it('keeps production operations behind manual dispatch and explicit confirmation', () => {
    assert.match(workflow, /workflow_dispatch:/)
    assert.match(workflow, /if:\s*\$\{\{\s*inputs\.confirm == 'IMPORT'\s*\}\}/)
    assert.match(workflow, /Type IMPORT to confirm/)
  })

  it('exposes only sanctioned prod operation targets', () => {
    for (const target of ['verify-only', 'ownership', 'registers', 'full']) {
      assert.match(workflow, new RegExp(`- ${target}\\b`))
    }
  })

  it('maps each target through an explicit shell allowlist instead of dynamic npm script interpolation', () => {
    assert.doesNotMatch(workflow, /npm run db:import:\$\{\{\s*inputs\.target\s*\}\}/)

    assert.match(workflow, /case "\$TARGET" in/)
    assert.match(workflow, /verify-only\)\s+npm run db:verify/)
    assert.match(workflow, /ownership\)\s+npm run db:import:ownership\s+npm run db:verify/)
    assert.match(workflow, /registers\)\s+npm run db:prod-sync:registers\s+npm run db:verify/)
    assert.match(workflow, /full\)\s+npm run db:prod-sync/)
    assert.match(workflow, /Unsupported prod data import target/)
  })
})
