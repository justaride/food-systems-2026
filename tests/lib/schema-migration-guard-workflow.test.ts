import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

const workflow = readFileSync('.github/workflows/schema-migration-guard.yml', 'utf8')

describe('schema migration guard workflow', () => {
  it('runs with read-only repository permissions and locked Node dependencies', () => {
    assert.match(workflow, /permissions:\s*\n\s+contents: read/)
    assert.match(workflow, /actions\/checkout@v6/)
    assert.match(workflow, /actions\/setup-node@v6/)
    assert.match(workflow, /node-version: 24/)
    assert.match(workflow, /run: npm ci/)
  })

  it('validates Prisma without requiring a reachable database or a secret', () => {
    assert.match(
      workflow,
      /DATABASE_URL: postgresql:\/\/ci:ci@db\.invalid:5432\/foodsystems_ci\?schema=public/,
    )
    assert.match(
      workflow,
      /prisma validate --schema prisma\/schema\.prisma/,
    )
    assert.match(
      workflow,
      /prisma generate --schema prisma\/schema\.prisma/,
    )
    assert.doesNotMatch(workflow, /DATABASE_URL:\s*\$\{\{\s*secrets\./)
    assert.doesNotMatch(workflow, /prisma migrate (?:deploy|resolve|dev)/)
  })

  it('fails closed when an operational POSIX shell script is absent, non-executable, or invalid', () => {
    const scripts = [
      'scripts/apply-prod-migrations.sh',
      'scripts/bootstrap-mcp-readonly-role.sh',
      'scripts/verify-mcp-readonly-role.sh',
      'scripts/bootstrap-candidate-analysis-roles.sh',
      'scripts/disable-candidate-analysis-writes.sh',
      'scripts/verify-candidate-analysis-roles.sh',
      'scripts/create-database-backup.sh',
      'scripts/verify-database-backup.sh',
      'scripts/restore-database-backup-drill.sh',
      'scripts/verify-database-schema-drift.sh',
      'scripts/verify-production-migration-baseline.sh',
    ]

    assert.match(workflow, /set -euo pipefail/)
    assert.match(workflow, /test -f "\$script"/)
    assert.match(workflow, /test -x "\$script"/)
    assert.match(workflow, /test "\$\(head -n 1 "\$script"\)" = '#!\/bin\/sh'/)
    assert.match(workflow, /sh -n "\$script"/)

    for (const script of scripts) {
      assert.ok(workflow.includes(script), `shell contract missing ${script}`)
    }
  })

  it('runs the DB operations, migration, workflow, and MCP contracts explicitly', () => {
    for (const test of [
      'tests/lib/db-ops-hardening.test.ts',
      'tests/lib/candidate-analysis-role-contract.test.ts',
      'tests/lib/coolify-db-watcher-workflow.test.ts',
      'tests/lib/docker-runtime-migration.test.ts',
      'tests/lib/food-tg-board-schema.test.ts',
      'tests/lib/schema-migration-guard-workflow.test.ts',
    ]) {
      assert.ok(workflow.includes(test), `CI contract missing ${test}`)
    }

    assert.match(workflow, /run: npm run mcp:kb:test/)
  })

  it('keeps validation after the schema-to-migration presence gate', () => {
    const migrationGate = workflow.indexOf('Require a migration when schema.prisma changes')
    const install = workflow.indexOf('Install locked dependencies')
    const prismaValidate = workflow.indexOf('Validate Prisma schema')
    const shellSyntax = workflow.indexOf('Validate database operations shell syntax')
    const dbContracts = workflow.indexOf('Run database operations and workflow contracts')
    const mcpContracts = workflow.indexOf('Run MCP protocol and security contracts')
    const candidateContracts = workflow.indexOf('Run autonomous candidate contracts')

    assert.ok(migrationGate >= 0)
    assert.ok(migrationGate < install)
    assert.ok(install < prismaValidate)
    assert.ok(prismaValidate < shellSyntax)
    assert.ok(shellSyntax < dbContracts)
    assert.ok(dbContracts < mcpContracts)
    assert.ok(candidateContracts > workflow.indexOf('Generate Prisma client'))
    assert.match(workflow, /run: npm run knowledge:candidate-contracts:check/)
  })
})
