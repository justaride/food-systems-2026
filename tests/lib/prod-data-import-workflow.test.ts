import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

const workflow = readFileSync('.github/workflows/prod-data-import.yml', 'utf8')

describe('prod data import workflow', () => {
  it('keeps production operations behind manual dispatch and explicit confirmation', () => {
    assert.match(workflow, /workflow_dispatch:/)
    assert.match(workflow, /if:\s*\$\{\{\s*inputs\.confirm == 'IMPORT'\s*\}\}/)
    assert.match(workflow, /Type IMPORT to confirm/)
    assert.match(workflow, /environment: production/)
    assert.match(workflow, /group: production-data-import/)
    assert.match(workflow, /cancel-in-progress: false/)
  })

  it('exposes only sanctioned prod operation targets', () => {
    for (const target of ['verify-only', 'ownership', 'registers', 'full']) {
      assert.match(workflow, new RegExp(`- ${target}\\b`))
    }
  })

  it('maps each target through an explicit shell allowlist instead of dynamic npm script interpolation', () => {
    assert.doesNotMatch(workflow, /npm run db:import:\$\{\{\s*inputs\.target\s*\}\}/)
    assert.doesNotMatch(workflow, /TARGET=["']?\$\{\{\s*inputs\.target\s*\}\}/)

    assert.match(
      workflow,
      /- name: Run selected prod data operation\s+env:\s+DATABASE_URL: \$\{\{ secrets\.DATABASE_URL \}\}\s+TARGET: \$\{\{ inputs\.target \}\}/,
    )
    assert.match(workflow, /case "\$TARGET" in/)
    assert.match(workflow, /verify-only\)\s+npm run db:verify/)
    assert.match(workflow, /ownership\)\s+npm run db:import:ownership\s+npm run db:verify/)
    assert.match(workflow, /registers\)\s+npm run db:prod-sync:registers\s+npm run db:verify/)
    assert.match(workflow, /full\)\s+npm run db:prod-sync/)
    assert.match(workflow, /Unsupported prod data import target/)
  })

  it('fails closed on backup, ledger, drift, and count preflights before mutation', () => {
    const backupIndex = workflow.indexOf('Require a recent successful off-node backup before mutation')
    const operationIndex = workflow.indexOf('Run selected prod data operation')
    assert.ok(backupIndex > 0 && backupIndex < operationIndex)
    assert.match(workflow, /inputs\.target != 'verify-only'/)
    assert.match(workflow, /save_s3.*is not True/)
    assert.match(workflow, /s3_uploaded.*is not True/)
    assert.match(workflow, /No recent successful off-node S3 backup; refusing production mutation/)
    assert.match(workflow, /npx prisma migrate status --schema prisma\/schema\.prisma/)
    assert.match(workflow, /scripts\/verify-database-schema-drift\.sh/)
    assert.match(workflow, /npm run db:verify/)
    assert.doesNotMatch(workflow, /psql "\$DATABASE_URL"/)
    assert.match(workflow, /TUNNEL_SERVICE_TOKEN_ID: \$\{\{ secrets\.CF_ACCESS_CLIENT_ID \}\}/)
    assert.match(workflow, /TUNNEL_SERVICE_TOKEN_SECRET: \$\{\{ secrets\.CF_ACCESS_CLIENT_SECRET \}\}/)
    assert.doesNotMatch(workflow, /--service-token-(?:id|secret)/)
  })

  it('scopes production database and Cloudflare secrets to the exact runtime steps', () => {
    for (const secret of [
      'DATABASE_URL',
      'TUNNEL_SERVICE_TOKEN_ID',
      'TUNNEL_SERVICE_TOKEN_SECRET',
    ]) {
      assert.doesNotMatch(
        workflow,
        new RegExp(`^ {6}${secret}:`, 'm'),
        `${secret} must not be configured at job scope`,
      )
    }

    assert.equal(workflow.split('DATABASE_URL: ${{ secrets.DATABASE_URL }}').length - 1, 3)
    assert.equal(
      workflow.split('TUNNEL_SERVICE_TOKEN_ID: ${{ secrets.CF_ACCESS_CLIENT_ID }}').length - 1,
      1,
    )
    assert.equal(
      workflow.split('TUNNEL_SERVICE_TOKEN_SECRET: ${{ secrets.CF_ACCESS_CLIENT_SECRET }}').length - 1,
      1,
    )
  })

  it('keeps Coolify API secrets in a private curl config, not curl argv', () => {
    assert.match(workflow, /scripts\/write-private-coolify-curl-config\.py "\$curl_config_file"/)
    assert.match(workflow, /unset COOLIFY_API_TOKEN COOLIFY_BASE_URL/)
    assert.match(workflow, /curl --config "\$curl_config_file" -fsS -m 15/)
    assert.doesNotMatch(workflow, /(?:-H|--header) "Authorization: Bearer \$TOKEN"/)
    assert.doesNotMatch(workflow, /curl[^\n]*(?:\$COOLIFY_API_TOKEN|\$COOLIFY_BASE_URL|\$TOKEN|\$BASE)/)
  })

  it('regenerates and preserves database-matched knowledge evidence', () => {
    assert.match(workflow, /verify-only\)[\s\S]*npm run research:library:ledger[\s\S]*npm run audit:library-analysis/)
    assert.match(workflow, /prod-knowledge-verification-/)
    assert.match(workflow, /library-analysis-ledger\.jsonl/)
    assert.match(workflow, /library-analysis-external-readiness\.json/)
    assert.match(workflow, /prod-knowledge-rollback-logs-/)
    assert.match(workflow, /library-analysis-prune-backup\.jsonl/)
    assert.match(workflow, /library-analysis-approval-revocation-backup\.jsonl/)
    assert.match(workflow, /retention-days: 90/)
  })
})
