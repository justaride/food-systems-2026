import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

function modelBlock(schema: string, modelName: string): string {
  const match = schema.match(new RegExp(`model ${modelName} \\{([\\s\\S]*?)\\n\\}`))
  assert.ok(match, `Missing ${modelName} model`)
  return match[1]
}

describe('provenance schema coverage', () => {
  const schema = readFileSync('prisma/schema.prisma', 'utf8')

  for (const modelName of ['Shareholder', 'BoardMember']) {
    it(`${modelName} has row-level source and verification fields`, () => {
      const block = modelBlock(schema, modelName)

      assert.match(block, /\n\s+source\s+String\?/)
      assert.match(block, /\n\s+sourceUrl\s+String\?/)
      assert.match(block, /\n\s+verifiedAt\s+DateTime\?/)
    })
  }
})
