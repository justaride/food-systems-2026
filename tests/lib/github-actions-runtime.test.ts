import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'

const workflowDir = '.github/workflows'
const workflowFiles = readdirSync(workflowDir)
  .filter((file) => file.endsWith('.yml') || file.endsWith('.yaml'))
  .map((file) => join(workflowDir, file))

describe('GitHub Actions runtime pins', () => {
  it('keeps first-party JavaScript actions on Node 24-compatible majors', () => {
    const stalePins: string[] = []

    for (const path of workflowFiles) {
      const workflow = readFileSync(path, 'utf8')

      for (const match of workflow.matchAll(/uses:\s+actions\/(checkout|setup-node)@v(\d+)/g)) {
        const [, action, major] = match

        if (Number(major) < 6) {
          stalePins.push(`${path}: actions/${action}@v${major}`)
        }
      }
    }

    assert.deepEqual(stalePins, [])
  })
})
