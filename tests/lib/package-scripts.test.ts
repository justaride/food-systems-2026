import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

describe('package scripts', () => {
  it('uses the standalone Next.js server when standalone output is enabled', () => {
    const nextConfig = readFileSync(join(process.cwd(), 'next.config.ts'), 'utf8')
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as {
      scripts: Record<string, string>
    }

    assert.match(nextConfig, /output:\s*'standalone'/)
    assert.equal(packageJson.scripts.start, 'node .next/standalone/server.js')
  })

  it('keeps source coverage gap export imports resolvable', () => {
    const scriptPath = join(process.cwd(), 'scripts/export-source-coverage-gaps.ts')
    const scriptSource = readFileSync(scriptPath, 'utf8')
    const relativeImports = [...scriptSource.matchAll(/from ['"](\.{1,2}\/[^'"]+)['"]/g)]

    for (const [, importPath] of relativeImports) {
      const absoluteImportPath = resolve(dirname(scriptPath), importPath)
      const candidates = [
        absoluteImportPath,
        `${absoluteImportPath}.ts`,
        `${absoluteImportPath}.tsx`,
        join(absoluteImportPath, 'index.ts'),
      ]

      assert.ok(
        candidates.some((candidate) => existsSync(candidate)),
        `missing import target ${importPath} in scripts/export-source-coverage-gaps.ts`,
      )
    }
  })
})
