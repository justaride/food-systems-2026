import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'

describe('package scripts', () => {
  it('wires the autonomous candidate contracts and manual control commands', () => {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as {
      scripts: Record<string, string>
    }
    const scripts = packageJson.scripts

    assert.equal(
      scripts['knowledge:candidate-contracts:check'],
      'node --import=tsx --test tests/lib/autonomous-analysis-contract.test.ts tests/lib/candidate-analysis-contract.test.ts tests/lib/candidate-analysis-schema.test.ts tests/lib/candidate-analysis-writer.test.ts tests/lib/candidate-analysis-role-contract.test.ts tests/lib/library-analysis-candidate-compat.test.ts tests/lib/candidate-control-snapshot.test.ts',
    )
    assert.equal(
      scripts['candidate:roles:bootstrap'],
      'scripts/bootstrap-candidate-analysis-roles.sh --apply',
    )
    assert.equal(
      scripts['candidate:roles:disable'],
      'scripts/disable-candidate-analysis-writes.sh --apply',
    )
    assert.equal(
      scripts['candidate:roles:verify'],
      'scripts/verify-candidate-analysis-roles.sh',
    )
    assert.equal(
      scripts['candidate:control:snapshot'],
      'tsx scripts/knowledge/export-candidate-control-snapshot.ts',
    )

    const knowledgeCheckSteps = scripts['knowledge:check']?.split(' && ') ?? []
    const processingIndex = knowledgeCheckSteps.indexOf(
      'npm run knowledge:processing-contracts:check',
    )
    assert.ok(processingIndex >= 0)
    assert.equal(
      knowledgeCheckSteps[processingIndex + 1],
      'npm run knowledge:candidate-contracts:check',
    )
    assert.equal(
      knowledgeCheckSteps.filter(
        (step) => step === 'npm run knowledge:candidate-contracts:check',
      ).length,
      1,
    )
  })

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
        'npm run compute-masterhjerne',
      ].join(' && '),
    )
  })

  it('keeps MVK import scripts wired to existing files and prod sync', () => {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as {
      scripts: Record<string, string>
    }
    const mvkImportScripts = Object.entries(packageJson.scripts).filter(([name]) =>
      name.startsWith('db:import:mvk-'),
    )
    const missingFileRefs: string[] = []

    for (const [name, command] of mvkImportScripts) {
      for (const match of command.matchAll(/--(?:csv|rel)=([^ ]+)/g)) {
        const relativePath = match[1]
        if (!relativePath || !existsSync(join(process.cwd(), relativePath))) {
          missingFileRefs.push(`${name} -> ${relativePath}`)
        }
      }
    }

    const prodSync = packageJson.scripts['db:prod-sync'] ?? ''
    const missingFromProdSync = mvkImportScripts
      .map(([name]) => name)
      .filter((name) => !prodSync.includes(`npm run ${name}`))

    assert.deepEqual(missingFileRefs, [])
    assert.deepEqual(missingFromProdSync, [])
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
    assert.equal(
      packageJson.scripts['mcp:kb:test'],
      'tsx mcp/foodsystems-kb/smoke.ts && node --import=tsx --test tests/mcp/*.test.ts',
    )
    assert.equal(
      packageJson.scripts['mcp:kb:inspect'],
      'npx @modelcontextprotocol/inspector -- npx tsx mcp/foodsystems-kb/server.ts',
    )
  })

  it('keeps the linked MCP presentation on the credential-safe wrapper setup', () => {
    const presentation = readFileSync(
      join(process.cwd(), 'docs/project/reference/foodsystems-kb-mcp-presentasjon.html'),
      'utf8',
    )

    assert.match(presentation, /\.local\/bin\/foodsystems-kb-mcp/)
    assert.match(presentation, /kontrollert PATH/)
    assert.match(presentation, /semantisk\/Obsidian\/proxy-miljø/)
    assert.doesNotMatch(presentation, /--env\s+(?:DATABASE_URL|OPENAI_API_KEY)/)
    assert.doesNotMatch(presentation, /npx tsx mcp\/foodsystems-kb\/server\.ts/)
  })

  it('documents a fail-closed Keychain wrapper with controlled execution environment', () => {
    const guide = readFileSync(
      join(process.cwd(), 'docs/project/reference/FOODSYSTEMS-KB-MCP.md'),
      'utf8',
    )
    const wrapper = guide.match(/```sh\n#!\/bin\/sh\n([\s\S]*?)\n```/)?.[0] ?? ''

    assert.match(wrapper, /PATH='\/opt\/homebrew\/bin:\/usr\/local\/bin:\/usr\/bin:\/bin'/)
    for (const variable of [
      'OPENAI_API_KEY',
      'FOODSYSTEMS_MCP_ENABLE_SEMANTIC',
      'FOODSYSTEMS_MCP_ENABLE_OBSIDIAN',
      'HTTP_PROXY',
      'HTTPS_PROXY',
      'ALL_PROXY',
      'NO_PROXY',
      'http_proxy',
      'https_proxy',
      'all_proxy',
      'no_proxy',
    ]) {
      assert.match(wrapper, new RegExp(`\\b${variable}\\b`), `${variable} must be cleared`)
    }
    assert.match(wrapper, /NODE_BIN=\$\(command -v node\)/)
    assert.match(wrapper, /TSX_CLI="\$REPO_ROOT\/node_modules\/tsx\/dist\/cli\.mjs"/)
    assert.match(wrapper, /exec "\$NODE_BIN" "\$TSX_CLI"/)
    assert.doesNotMatch(wrapper, /exec "\$REPO_ROOT\/node_modules\/\.bin\/tsx"/)
  })

  it('keeps backup proof separate from role and ACL proof', () => {
    const readiness = readFileSync(
      join(
        process.cwd(),
        'docs/project/status/knowledge-base-mcp-readiness-2026-07-19.md',
      ),
      'utf8',
    )

    assert.match(readiness, /`--no-owner --no-acl`/)
    assert.match(readiness, /inneholder derfor \*\*ikke\*\* login-roller, eierskap, grants eller default ACL/)
    assert.match(readiness, /MCP-rolle\/ACL er et separat bevislag/)
    assert.doesNotMatch(readiness, /inkluderer[^\n]*ACL-hardening/)
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

  it('exposes the read-only Nordic board ownership audit command', () => {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as {
      scripts: Record<string, string>
    }
    const scriptSource = readFileSync(
      join(process.cwd(), 'scripts', 'analyze-nordic-board-ownership.ts'),
      'utf8',
    )

    assert.equal(
      packageJson.scripts['audit:nordic-board-ownership'],
      'tsx scripts/analyze-nordic-board-ownership.ts',
    )
    assert.match(scriptSource, /DATABASE_URL is required/)
    assert.match(scriptSource, /computeInterlocks/)
    assert.match(scriptSource, /computeCrossHoldings/)
    assert.doesNotMatch(scriptSource, /upsert|deleteMany|updateMany|createMany/)
  })

  it('exposes guarded Nordic 2025 financial import commands', () => {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as {
      scripts: Record<string, string>
    }
    const scriptSource = readFileSync(
      join(process.cwd(), 'scripts', 'import-nordic-financials-2025.ts'),
      'utf8',
    )

    assert.equal(
      packageJson.scripts['db:import:nordic-financials-2025:dry-run'],
      'tsx scripts/import-nordic-financials-2025.ts --dry-run',
    )
    assert.equal(
      packageJson.scripts['db:import:nordic-financials-2025:apply'],
      'tsx scripts/import-nordic-financials-2025.ts --apply',
    )
    assert.match(scriptSource, /DATABASE_URL is required/)
    assert.match(scriptSource, /parseApplyMode/)
    assert.match(scriptSource, /companyFinancial\.upsert/)
  })

  it('exposes guarded country metric harmonization commands', () => {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as {
      scripts: Record<string, string>
    }
    const scriptSource = readFileSync(
      join(process.cwd(), 'scripts', 'backfill-country-metric-harmonization.ts'),
      'utf8',
    )

    assert.equal(
      packageJson.scripts['db:backfill:country-metric-harmonization:dry-run'],
      'tsx scripts/backfill-country-metric-harmonization.ts --dry-run',
    )
    assert.equal(
      packageJson.scripts['db:backfill:country-metric-harmonization:apply'],
      'tsx scripts/backfill-country-metric-harmonization.ts --apply',
    )
    assert.match(scriptSource, /DATABASE_URL is required/)
    assert.match(scriptSource, /parseApplyMode/)
    assert.match(scriptSource, /countryMetric\.upsert/)
    assert.match(scriptSource, /countryMetric\.update/)
  })

  it('exposes guarded document filePath backfill commands', () => {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as {
      scripts: Record<string, string>
    }
    const scriptSource = readFileSync(
      join(process.cwd(), 'scripts', 'backfill-document-file-paths-from-seed-map.ts'),
      'utf8',
    )

    assert.equal(
      packageJson.scripts['db:backfill:document-file-paths:dry-run'],
      'tsx scripts/backfill-document-file-paths-from-seed-map.ts --dry-run',
    )
    assert.equal(
      packageJson.scripts['db:backfill:document-file-paths:apply'],
      'tsx scripts/backfill-document-file-paths-from-seed-map.ts --apply',
    )
    assert.match(scriptSource, /DATABASE_URL is required/)
    assert.match(scriptSource, /parseApplyMode/)
    assert.match(scriptSource, /document\.update/)
  })

  it('exposes guarded missing document file snapshot export commands', () => {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as {
      scripts: Record<string, string>
    }
    const scriptSource = readFileSync(
      join(process.cwd(), 'scripts', 'export-missing-document-file-snapshots.ts'),
      'utf8',
    )

    assert.equal(
      packageJson.scripts['db:export:missing-document-files:dry-run'],
      'tsx scripts/export-missing-document-file-snapshots.ts --dry-run',
    )
    assert.equal(
      packageJson.scripts['db:export:missing-document-files:apply'],
      'tsx scripts/export-missing-document-file-snapshots.ts --apply',
    )
    assert.match(scriptSource, /DATABASE_URL is required/)
    assert.match(scriptSource, /parseApplyMode/)
    assert.match(scriptSource, /writeFileSync/)
    assert.match(scriptSource, /document\.update/)
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
    assert.equal(
      packageJson.scripts['research:library:process:create-only:dry-run'],
      'tsx scripts/process-library-analysis.ts --dry-run --create-only',
    )
    assert.equal(
      packageJson.scripts['research:library:process:create-only:apply'],
      'tsx scripts/process-library-analysis.ts --apply --create-only',
    )
    assert.match(processSource, /parseArgs\(process\.argv\.slice\(2\)\)/)
    assert.match(processSource, /buildEffectiveLibraryAnalysisSyncPlan/)
    assert.match(processSource, /skippedMaterialUpdates/)
    assert.match(processSource, /LOCK TABLE \"LibraryAnalysisRecord\" IN SHARE ROW EXCLUSIVE MODE/)
    assert.match(processSource, /loadLibraryAnalysisInventory\(\{ requireDb: true \}\)/)
    assert.match(processSource, /buildLibraryAnalysisSyncPlan/)
    assert.match(processSource, /stalePolicy/)
    assert.match(processSource, /appendFileSync/)
    assert.equal((processSource.match(/prisma\.\$transaction/g) ?? []).length, 1)
    assert.match(processSource, /isolationLevel: 'Serializable'/)
    assert.match(processSource, /libraryAnalysisRecord\.create/)
    assert.match(processSource, /libraryAnalysisRecord\.updateMany/)
    assert.match(processSource, /toLibraryAnalysisCasWhere\(action\.expectedSnapshot\)/)
    assert.match(processSource, /result\.count !== 1/)
    assert.match(processSource, /zero batch writes were committed/)
    assert.ok(
      processSource.indexOf("}, { isolationLevel: 'Serializable' })") <
        processSource.indexOf('appendBackup('),
      'approval-revocation backup must be appended only after transaction commit',
    )
    assert.doesNotMatch(processSource, /libraryAnalysisRecord\.deleteMany/)
  })

  it('exposes an explicit human external-review command with a strong acknowledgement', () => {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as {
      scripts: Record<string, string>
    }
    const reviewSource = readFileSync(
      join(process.cwd(), 'scripts', 'review-library-analysis-external.ts'),
      'utf8',
    )

    assert.equal(
      packageJson.scripts['research:library:review-external:dry-run'],
      'tsx scripts/review-library-analysis-external.ts --dry-run',
    )
    assert.equal(
      packageJson.scripts['research:library:review-external:apply'],
      'tsx scripts/review-library-analysis-external.ts --apply',
    )
    assert.match(reviewSource, /I_HAVE_REVIEWED_THE_CURRENT_DOCUMENT/)
    assert.match(reviewSource, /--expected-content-hash/)
    assert.match(reviewSource, /Current document hash differs from --expected-content-hash/)
    assert.match(reviewSource, /record\.contentHash !== currentContentHash/)
    assert.match(reviewSource, /Library analysis is stale for the current document hash/)
    assert.match(reviewSource, /prisma\.\$transaction/)
    assert.match(reviewSource, /isolationLevel: 'Serializable'/)
    assert.match(reviewSource, /FOR UPDATE/)
    assert.match(reviewSource, /FOR SHARE/)
    assert.match(reviewSource, /I_AM_REVOKING_EXTERNAL_APPROVAL/)
    assert.match(reviewSource, /sourceKey\.startsWith\('document:'\)/)
    assert.match(reviewSource, /currentContentHash/)
    assert.match(reviewSource, /!externalCitationPolicy\.policyHash/)
    assert.match(reviewSource, /setLibraryAnalysisExternalApprovalEvidence/)
    assert.match(reviewSource, /library-analysis-human-review-log\.jsonl/)
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
    assert.match(repairSource, /prisma\.\$transaction/)
    assert.match(repairSource, /transaction\.document\.updateMany/)
    assert.match(repairSource, /updatedAt: new Date\(row\.expectedUpdatedAt\)/)
    assert.match(repairSource, /wordCount: row\.existingWordCount/)
    assert.match(repairSource, /content: expectedDocument\.content/)
    assert.match(repairSource, /result\.count !== 1/)
    assert.match(repairSource, /isolationLevel: 'Serializable'/)
    assert.ok(
      repairSource.indexOf('await prisma.$transaction') <
        repairSource.indexOf('appendArtifact(BACKUP_PATH'),
      'backup must only be appended after the CAS transaction succeeds',
    )
    assert.doesNotMatch(repairSource, /upsert|deleteMany|createMany/)
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

  it('exposes guarded library analysis manual URL match repair dry-run and apply commands', () => {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as {
      scripts: Record<string, string>
    }
    const repairSource = readFileSync(
      join(process.cwd(), 'scripts', 'repair-library-analysis-manual-url-match.ts'),
      'utf8',
    )

    assert.equal(
      packageJson.scripts['research:library:repair-manual-url-match:dry-run'],
      'tsx scripts/repair-library-analysis-manual-url-match.ts --dry-run',
    )
    assert.equal(
      packageJson.scripts['research:library:repair-manual-url-match:apply'],
      'tsx scripts/repair-library-analysis-manual-url-match.ts --apply',
    )
    assert.match(repairSource, /process\.argv\.includes\('--apply'\)/)
    assert.match(repairSource, /REVIEWED_URL_MATCHES/)
    assert.match(repairSource, /AbortSignal\.timeout\(FETCH_TIMEOUT_MS\)/)
    assert.match(repairSource, /MAX_BYTES/)
    assert.match(repairSource, /library-analysis-manual-url-match-backup\.jsonl/)
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
    assert.match(repairSource, /prisma\.\$transaction/)
    assert.match(repairSource, /transaction\.document\.updateMany/)
    assert.match(repairSource, /updatedAt: new Date\(row\.expectedUpdatedAt\)/)
    assert.match(repairSource, /wordCount: row\.existingWordCount/)
    assert.match(repairSource, /content: expectedDocument\.content/)
    assert.match(repairSource, /result\.count !== 1/)
    assert.match(repairSource, /isolationLevel: 'Serializable'/)
    assert.ok(
      repairSource.indexOf('await prisma.$transaction') <
        repairSource.indexOf('appendArtifact(BACKUP_PATH'),
      'backup must only be appended after the CAS transaction succeeds',
    )
    assert.doesNotMatch(repairSource, /upsert|deleteMany|createMany/)
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
    assert.match(repairSource, /prisma\.\$transaction/)
    assert.match(repairSource, /transaction\.document\.updateMany/)
    assert.match(repairSource, /updatedAt: new Date\(row\.expectedUpdatedAt\)/)
    assert.match(repairSource, /wordCount: row\.existingWordCount/)
    assert.match(repairSource, /content: expectedDocument\.content/)
    assert.match(repairSource, /result\.count !== 1/)
    assert.match(repairSource, /isolationLevel: 'Serializable'/)
    assert.ok(
      repairSource.indexOf('await prisma.$transaction') <
        repairSource.indexOf('appendArtifact(BACKUP_PATH'),
      'backup must only be appended after the CAS transaction succeeds',
    )
    assert.doesNotMatch(repairSource, /upsert|deleteMany|createMany/)
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

  it('exposes the library analysis artifact audit command', () => {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as {
      scripts: Record<string, string>
    }
    const auditSource = readFileSync(
      join(process.cwd(), 'scripts', 'audit-library-analysis.ts'),
      'utf8',
    )

    assert.equal(
      packageJson.scripts['audit:library-analysis'],
      'tsx scripts/audit-library-analysis.ts',
    )
    assert.match(auditSource, /auditLibraryAnalysisArtifacts/)
    assert.match(auditSource, /LIBRARY_ANALYSIS_LEDGER_PATH/)
    assert.match(auditSource, /LIBRARY_ANALYSIS_DECISION_QUEUE_JSON_PATH/)
    assert.doesNotMatch(auditSource, /PrismaClient|createLibraryAnalysisPrismaClient/)
    assert.doesNotMatch(auditSource, /upsert|deleteMany|updateMany|createMany|document\.update/)
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

  it('exposes guarded academic locator and SourceDoc provenance repair commands', () => {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as {
      scripts: Record<string, string>
    }
    const locatorSource = readFileSync(
      join(process.cwd(), 'scripts', 'apply-academic-locator-repairs.ts'),
      'utf8',
    )
    const provenanceSource = readFileSync(
      join(process.cwd(), 'scripts', 'apply-source-doc-provenance.ts'),
      'utf8',
    )
    const citationLocatorSource = readFileSync(
      join(process.cwd(), 'scripts', 'reconcile-academic-citation-locators.ts'),
      'utf8',
    )
    const claimAnchorSource = readFileSync(
      join(process.cwd(), 'scripts', 'apply-academic-claim-anchor-pilot.ts'),
      'utf8',
    )

    assert.equal(
      packageJson.scripts['repair:academic-locators'],
      'tsx scripts/apply-academic-locator-repairs.ts',
    )
    assert.equal(
      packageJson.scripts['repair:source-doc-provenance'],
      'tsx scripts/apply-source-doc-provenance.ts',
    )
    assert.equal(
      packageJson.scripts['repair:academic-citation-locators'],
      'tsx scripts/reconcile-academic-citation-locators.ts',
    )
    assert.equal(
      packageJson.scripts['repair:academic-claim-anchor-pilot'],
      'tsx scripts/apply-academic-claim-anchor-pilot.ts',
    )
    assert.match(locatorSource, /APPLY_VERIFIED_ACADEMIC_LOCATORS/)
    assert.match(provenanceSource, /APPLY_REVIEWED_SOURCE_DOC_PROVENANCE/)
    assert.match(citationLocatorSource, /APPLY_VERIFIED_ACADEMIC_CITATION_LOCATORS/)
    assert.match(claimAnchorSource, /APPLY_REVIEWED_ACADEMIC_CLAIM_ANCHOR_PILOT/)
    assert.match(locatorSource, /isolationLevel: 'Serializable'/)
    assert.match(provenanceSource, /isolationLevel: 'Serializable'/)
    assert.match(citationLocatorSource, /isolationLevel: 'Serializable'/)
    assert.match(claimAnchorSource, /isolationLevel: 'Serializable'/)
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
