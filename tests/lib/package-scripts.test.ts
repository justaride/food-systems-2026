import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

describe('package scripts', () => {
  it('uses the standalone Next.js server when standalone output is enabled', () => {
    const nextConfig = readFileSync(join(process.cwd(), 'next.config.ts'), 'utf8')
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as {
      scripts: Record<string, string>
    }

    assert.match(nextConfig, /output:\s*'standalone'/)
    assert.equal(packageJson.scripts.start, 'node .next/standalone/server.js')
  })
})
