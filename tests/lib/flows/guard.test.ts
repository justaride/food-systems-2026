// tests/lib/flows/guard.test.ts
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'
import { validateMaterialFlows } from '../../../src/lib/flows/validate'
import type { MaterialFlowsFile } from '../../../src/lib/flows/types'

const ROOT = process.cwd()

function readJson<T>(rel: string): T {
  return JSON.parse(readFileSync(join(ROOT, rel), 'utf8')) as T
}

describe('material-flows guard', () => {
  it('committed material-flows.json has no blocking integrity issues', () => {
    const file = readJson<MaterialFlowsFile>('public/data/food-systems/material-flows.json')
    const loopsFile = readJson<{ existing_loops: { id: string }[] }>('public/data/food-systems/circularity-loops.json')
    const knownLoopIds = new Set(loopsFile.existing_loops.map((l) => l.id))
    const blocking = validateMaterialFlows(file, knownLoopIds).filter((i) => i.severity === 'blocking')
    assert.deepEqual(blocking, [])
  })
})
