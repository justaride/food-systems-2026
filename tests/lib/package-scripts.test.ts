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

  it('exposes the NotebookLM export command for source-grounded briefing packs', () => {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as {
      scripts: Record<string, string>
    }

    assert.equal(packageJson.scripts['export:notebooklm'], 'tsx scripts/build-notebooklm-export.ts')
  })

  it('exposes the read-only library analysis repair backlog command', () => {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as {
      scripts: Record<string, string>
    }
    const scriptSource = readFileSync(
      join(process.cwd(), 'scripts', 'build-library-analysis-repair-backlog.ts'),
      'utf8',
    )

    assert.equal(
      packageJson.scripts['research:library:repair-backlog'],
      'tsx scripts/build-library-analysis-repair-backlog.ts',
    )
    assert.match(scriptSource, /DATABASE_URL is required/)
    assert.doesNotMatch(scriptSource, /upsert|deleteMany|updateMany|createMany/)
  })

  it('exposes the read-only library analysis locator profile command', () => {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as {
      scripts: Record<string, string>
    }
    const scriptSource = readFileSync(
      join(process.cwd(), 'scripts', 'build-library-analysis-locator-profile.ts'),
      'utf8',
    )

    assert.equal(
      packageJson.scripts['research:library:locator-profile'],
      'tsx scripts/build-library-analysis-locator-profile.ts',
    )
    assert.match(scriptSource, /LIBRARY_ANALYSIS_REPAIR_BACKLOG_JSON_PATH/)
    assert.match(scriptSource, /DATABASE_URL is required/)
    assert.doesNotMatch(scriptSource, /upsert|deleteMany|updateMany|createMany/)
  })

  it('exposes the read-only library analysis inventory and ledger commands', () => {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as {
      scripts: Record<string, string>
    }
    const inventorySource = readFileSync(
      join(process.cwd(), 'scripts', 'build-library-analysis-inventory.ts'),
      'utf8',
    )
    const ledgerSource = readFileSync(
      join(process.cwd(), 'scripts', 'export-library-analysis-ledger.ts'),
      'utf8',
    )

    assert.equal(
      packageJson.scripts['research:library:inventory'],
      'tsx scripts/build-library-analysis-inventory.ts',
    )
    assert.equal(
      packageJson.scripts['research:library:ledger'],
      'tsx scripts/export-library-analysis-ledger.ts',
    )
    assert.match(inventorySource, /loadLibraryAnalysisInventory/)
    assert.match(ledgerSource, /libraryAnalysisRecord\.findMany/)
    assert.doesNotMatch(`${inventorySource}\n${ledgerSource}`, /upsert|deleteMany|updateMany|createMany/)
  })

  it('exposes guarded library analysis processing dry-run and apply commands', () => {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as {
      scripts: Record<string, string>
    }
    const processSource = readFileSync(join(process.cwd(), 'scripts', 'process-library-analysis.ts'), 'utf8')

    assert.equal(
      packageJson.scripts['research:library:process:dry-run'],
      'tsx scripts/process-library-analysis.ts --dry-run',
    )
    assert.equal(
      packageJson.scripts['research:library:process:apply'],
      'tsx scripts/process-library-analysis.ts --apply',
    )
    assert.match(processSource, /process\.argv\.includes\('--apply'\)/)
    assert.match(processSource, /loadLibraryAnalysisInventory\(\{ requireDb: apply \}\)/)
    assert.match(processSource, /library-analysis-prune-backup\.jsonl/)
    assert.match(processSource, /appendFileSync/)
    assert.match(processSource, /libraryAnalysisRecord\.upsert/)
    assert.match(processSource, /libraryAnalysisRecord\.deleteMany/)
  })

  it('exposes guarded library analysis local text repair dry-run and apply commands', () => {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as {
      scripts: Record<string, string>
    }
    const repairSource = readFileSync(
      join(process.cwd(), 'scripts', 'repair-library-analysis-local-text.ts'),
      'utf8',
    )

    assert.equal(
      packageJson.scripts['research:library:repair-local-text:dry-run'],
      'tsx scripts/repair-library-analysis-local-text.ts --dry-run',
    )
    assert.equal(
      packageJson.scripts['research:library:repair-local-text:apply'],
      'tsx scripts/repair-library-analysis-local-text.ts --apply',
    )
    assert.match(repairSource, /process\.argv\.includes\('--apply'\)/)
    assert.match(repairSource, /LIBRARY_ANALYSIS_REPAIR_BACKLOG_JSON_PATH/)
    assert.match(repairSource, /library-analysis-local-text-repair-backup\.jsonl/)
    assert.match(repairSource, /appendFileSync/)
    assert.match(repairSource, /prisma\.document\.update/)
    assert.doesNotMatch(repairSource, /upsert|deleteMany|updateMany|createMany/)
  })

  it('exposes guarded library analysis manual local match repair dry-run and apply commands', () => {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as {
      scripts: Record<string, string>
    }
    const repairSource = readFileSync(
      join(process.cwd(), 'scripts', 'repair-library-analysis-manual-local-match.ts'),
      'utf8',
    )

    assert.equal(
      packageJson.scripts['research:library:repair-manual-local-match:dry-run'],
      'tsx scripts/repair-library-analysis-manual-local-match.ts --dry-run',
    )
    assert.equal(
      packageJson.scripts['research:library:repair-manual-local-match:apply'],
      'tsx scripts/repair-library-analysis-manual-local-match.ts --apply',
    )
    assert.match(repairSource, /process\.argv\.includes\('--apply'\)/)
    assert.match(repairSource, /REVIEWED_LOCAL_MATCHES/)
    assert.match(repairSource, /library-analysis-manual-local-match-backup\.jsonl/)
    assert.match(repairSource, /appendFileSync/)
    assert.match(repairSource, /prisma\.document\.update/)
    assert.doesNotMatch(repairSource, /upsert|deleteMany|updateMany|createMany/)
  })

  it('exposes guarded library analysis manual PDF match repair dry-run and apply commands', () => {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as {
      scripts: Record<string, string>
    }
    const repairSource = readFileSync(
      join(process.cwd(), 'scripts', 'repair-library-analysis-manual-pdf-match.ts'),
      'utf8',
    )

    assert.equal(
      packageJson.scripts['research:library:repair-manual-pdf-match:dry-run'],
      'tsx scripts/repair-library-analysis-manual-pdf-match.ts --dry-run',
    )
    assert.equal(
      packageJson.scripts['research:library:repair-manual-pdf-match:apply'],
      'tsx scripts/repair-library-analysis-manual-pdf-match.ts --apply',
    )
    assert.match(repairSource, /process\.argv\.includes\('--apply'\)/)
    assert.match(repairSource, /REVIEWED_PDF_MATCHES/)
    assert.match(repairSource, /pdftotext/)
    assert.match(repairSource, /library-analysis-manual-pdf-match-backup\.jsonl/)
    assert.match(repairSource, /appendFileSync/)
    assert.match(repairSource, /prisma\.document\.update/)
    assert.doesNotMatch(repairSource, /upsert|deleteMany|updateMany|createMany/)
  })

  it('exposes guarded library analysis PDF text repair dry-run and apply commands', () => {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as {
      scripts: Record<string, string>
    }
    const repairSource = readFileSync(
      join(process.cwd(), 'scripts', 'repair-library-analysis-pdf-text.ts'),
      'utf8',
    )

    assert.equal(
      packageJson.scripts['research:library:repair-pdf-text:dry-run'],
      'tsx scripts/repair-library-analysis-pdf-text.ts --dry-run',
    )
    assert.equal(
      packageJson.scripts['research:library:repair-pdf-text:apply'],
      'tsx scripts/repair-library-analysis-pdf-text.ts --apply',
    )
    assert.match(repairSource, /process\.argv\.includes\('--apply'\)/)
    assert.match(repairSource, /LIBRARY_ANALYSIS_PDF_EXTRACTION_PROFILE_JSON_PATH/)
    assert.match(repairSource, /LIBRARY_ANALYSIS_REPAIR_BACKLOG_JSON_PATH/)
    assert.match(repairSource, /pdftotext/)
    assert.match(repairSource, /library-analysis-pdf-text-repair-backup\.jsonl/)
    assert.match(repairSource, /appendFileSync/)
    assert.match(repairSource, /prisma\.document\.update/)
    assert.doesNotMatch(repairSource, /upsert|deleteMany|updateMany|createMany/)
  })

  it('exposes guarded library analysis URL text repair dry-run and apply commands', () => {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as {
      scripts: Record<string, string>
    }
    const repairSource = readFileSync(
      join(process.cwd(), 'scripts', 'repair-library-analysis-url-text.ts'),
      'utf8',
    )

    assert.equal(
      packageJson.scripts['research:library:repair-url-text:dry-run'],
      'tsx scripts/repair-library-analysis-url-text.ts --dry-run',
    )
    assert.equal(
      packageJson.scripts['research:library:repair-url-text:apply'],
      'tsx scripts/repair-library-analysis-url-text.ts --apply',
    )
    assert.match(repairSource, /process\.argv\.includes\('--apply'\)/)
    assert.match(repairSource, /LIBRARY_ANALYSIS_URL_TEXT_EXTRACTION_PROFILE_JSON_PATH/)
    assert.match(repairSource, /AbortSignal\.timeout\(FETCH_TIMEOUT_MS\)/)
    assert.match(repairSource, /MAX_BYTES/)
    assert.match(repairSource, /URL_TEXT_REPAIR_CONCURRENCY/)
    assert.match(repairSource, /library-analysis-url-text-repair-backup\.jsonl/)
    assert.match(repairSource, /appendFileSync/)
    assert.match(repairSource, /prisma\.document\.update/)
    assert.doesNotMatch(repairSource, /upsert|deleteMany|updateMany|createMany/)
  })

  it('exposes the read-only library analysis decision queue command', () => {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as {
      scripts: Record<string, string>
    }
    const scriptSource = readFileSync(
      join(process.cwd(), 'scripts', 'build-library-analysis-decision-queue.ts'),
      'utf8',
    )

    assert.equal(
      packageJson.scripts['research:library:decision-queue'],
      'tsx scripts/build-library-analysis-decision-queue.ts',
    )
    assert.match(scriptSource, /LIBRARY_ANALYSIS_REPAIR_BACKLOG_JSON_PATH/)
    assert.match(scriptSource, /LIBRARY_ANALYSIS_LOCAL_TEXT_REPAIR_PLAN_JSON_PATH/)
    assert.match(scriptSource, /LIBRARY_ANALYSIS_URL_TEXT_EXTRACTION_PROFILE_JSON_PATH/)
    assert.match(scriptSource, /LIBRARY_ANALYSIS_DECISION_QUEUE_JSON_PATH/)
    assert.doesNotMatch(scriptSource, /PrismaClient|createLibraryAnalysisPrismaClient/)
    assert.doesNotMatch(scriptSource, /upsert|deleteMany|updateMany|createMany|document\.update/)
  })

  it('exposes the read-only library analysis PDF extraction profile command', () => {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as {
      scripts: Record<string, string>
    }
    const scriptSource = readFileSync(
      join(process.cwd(), 'scripts', 'build-library-analysis-pdf-extraction-profile.ts'),
      'utf8',
    )

    assert.equal(
      packageJson.scripts['research:library:pdf-extraction-profile'],
      'tsx scripts/build-library-analysis-pdf-extraction-profile.ts',
    )
    assert.match(scriptSource, /LIBRARY_ANALYSIS_REPAIR_BACKLOG_JSON_PATH/)
    assert.match(scriptSource, /pdftotext/)
    assert.doesNotMatch(scriptSource, /upsert|deleteMany|updateMany|createMany/)
  })

  it('exposes the read-only library analysis URL text profile command', () => {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as {
      scripts: Record<string, string>
    }
    const scriptSource = readFileSync(
      join(process.cwd(), 'scripts', 'build-library-analysis-url-text-extraction-profile.ts'),
      'utf8',
    )

    assert.equal(
      packageJson.scripts['research:library:url-text-profile'],
      'tsx scripts/build-library-analysis-url-text-extraction-profile.ts',
    )
    assert.match(scriptSource, /LIBRARY_ANALYSIS_LOCATOR_PROFILE_JSON_PATH/)
    assert.match(scriptSource, /DATABASE_URL is required/)
    assert.doesNotMatch(scriptSource, /upsert|deleteMany|updateMany|createMany/)
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
