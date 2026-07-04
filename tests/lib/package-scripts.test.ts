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

  it('exposes the A4 post-merge platform verification gate as a single command', () => {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as {
      scripts: Record<string, string>
    }
    const statusDoc = readFileSync(
      join(process.cwd(), 'docs/project/status/STATUS-OG-ARBEIDSPLAN-2026-06-11.md'),
      'utf8',
    )
    const executionPlan = readFileSync(
      join(process.cwd(), 'docs/superpowers/plans/2026-06-11-food-tg-platform-stack-landing.md'),
      'utf8',
    )

    assert.equal(
      packageJson.scripts['verify:platform-stack-main'],
      [
        'npm run db:generate',
        'npm run lint',
        'npm test',
        'npm run build',
        'npm run db:audit',
        'npm run db:audit:strict-sources',
        'npm run audit:konsern',
        'npm run graph:audit',
        'npm run audit:citable',
      ].join(' && '),
    )
    assert.ok(
      statusDoc.includes('npm run verify:platform-stack-main'),
      'A4 status table must point to the single post-merge verification command',
    )
    assert.ok(
      executionPlan.includes('npm run verify:platform-stack-main'),
      'execution plan must point to the single post-merge verification command',
    )
  })

  it('exposes vault sync and check commands', () => {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as {
      scripts: Record<string, string>
    }

    assert.equal(packageJson.scripts['vault:sync'], 'tsx scripts/obsidian-vault/sync.ts')
    assert.equal(packageJson.scripts['vault:check'], 'tsx scripts/obsidian-vault/sync.ts --check')
    assert.equal(packageJson.scripts['vault:export-db'], 'tsx scripts/obsidian-vault/export-db.ts')
    assert.equal(packageJson.scripts['vault:review-preflight'], 'tsx scripts/obsidian-vault/review-preflight.ts')
    assert.equal(packageJson.scripts['vault:review-samples'], 'tsx scripts/obsidian-vault/review-samples.ts')
    assert.equal(packageJson.scripts['vault:review-closeout'], 'tsx scripts/obsidian-vault/review-closeout.ts')
  })

  it('runs the Obsidian vault export and sync at the end of the full DB refresh routine', () => {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as {
      scripts: Record<string, string>
    }

    assert.equal(
      packageJson.scripts['compute-metrics:full'],
      [
        'npm run compute-metrics',
        'npm run audit:konsern',
        'npm run compute-coverage',
        'npm run vault:export-db',
        'npm run vault:sync',
      ].join(' && '),
    )
  })

  it('includes the I27+ approval gate in the default vault review preflight', () => {
    const preflightSource = readFileSync(
      join(process.cwd(), 'scripts', 'obsidian-vault', 'review-preflight.ts'),
      'utf8',
    )

    assert.ok(
      preflightSource.includes('docs/project/plans/obsidian-i27-kandidatgodkjenning-2026-07-02.md'),
      'default review preflight must path-check the I27+ candidate approval gate',
    )
  })

  it('runs the masterplan related-file validator in the default vault review preflight', () => {
    const preflightSource = readFileSync(
      join(process.cwd(), 'scripts', 'obsidian-vault', 'review-preflight.ts'),
      'utf8',
    )

    assert.ok(
      preflightSource.includes('validateMasterplanFrontmatterLinks'),
      'default review preflight must validate masterplan frontmatter related files',
    )
  })

  it('runs the machine-checkable VK-5 sample validator in the default vault review preflight', () => {
    const preflightSource = readFileSync(
      join(process.cwd(), 'scripts', 'obsidian-vault', 'review-preflight.ts'),
      'utf8',
    )

    assert.ok(
      preflightSource.includes('validateReviewSamples'),
      'default review preflight must validate machine-checkable VK-5 samples',
    )
  })

  it('exposes Food Systems KB MCP commands for local coworker setup', () => {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as {
      scripts: Record<string, string>
    }

    assert.equal(packageJson.scripts['mcp:kb'], 'tsx mcp/foodsystems-kb/server.ts')
    assert.equal(packageJson.scripts['mcp:kb:test'], 'tsx mcp/foodsystems-kb/smoke.ts')
    assert.equal(
      packageJson.scripts['mcp:kb:inspect'],
      'npx @modelcontextprotocol/inspector -- npx tsx mcp/foodsystems-kb/server.ts',
    )
  })

  it('exposes VK-5 review closeout as a separate final gate', () => {
    const closeoutSource = readFileSync(
      join(process.cwd(), 'scripts', 'obsidian-vault', 'review-closeout.ts'),
      'utf8',
    )

    assert.ok(
      closeoutSource.includes('validateReviewCloseout'),
      'review closeout script must use the dedicated final closeout validator',
    )
  })
})
