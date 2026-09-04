import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'

const watcher = readFileSync('.github/workflows/coolify-db-watcher.yml', 'utf8')
const prodImport = readFileSync('.github/workflows/prod-data-import.yml', 'utf8')
const deployVerify = readFileSync('.github/workflows/coolify-deploy-verify.yml', 'utf8')
const retiredShaSync = readFileSync('scripts/coolify-sync-source-commit.sh', 'utf8')
const retiredDeployHelper = readFileSync('scripts/deploy.sh', 'utf8')

describe('Coolify database health workflows', () => {
  it('runs with read-only GitHub repository permissions', () => {
    assert.match(watcher, /permissions:\s*\n\s+contents: read/)
    assert.match(prodImport, /permissions:\s*\n\s+contents: read/)
  })

  it('fails closed on the current Coolify nested backup execution contract', () => {
    assert.match(watcher, /databases\/\$DB_UUID\/backups/)
    assert.match(watcher, /config\.get\('enabled'\) is True/)
    assert.match(watcher, /config\.get\('save_s3'\) is True/)
    assert.match(watcher, /config\.get\('executions'\) or \[\]/)
    assert.match(watcher, /execution\.get\('status'\) != 'success'/)
    assert.match(watcher, /execution\.get\('s3_uploaded'\) is not True/)
    assert.match(watcher, /execution\.get\('filename'\)/)
    assert.match(watcher, /execution\.get\('size'\)/)
    assert.match(watcher, /execution\.get\('created_at'\)/)
    assert.match(watcher, /age_hours <= max_age_hours/)
    // Backup-tellingene felte kjøringen fram til 2026-08-16. De målte Coolifys
    // egen planlegger, som er tom med vilje — basene sikres av den nattlige
    // kjeden på Mac Studio, bevist per base med sha256 og offsite-bevis. Porten
    // var rød hvert 13. minutt på fraværet av en erstattet mekanisme.
    //
    // Kontrakten nå: tellingene RAPPORTERES, de feller ikke. Begge halvdelene
    // påstås, slik at verken den ene eller den andre kan forsvinne stille.
    const failureGate = watcher.match(/- name: Fail if unhealthy or unreachable[\s\S]*?\n\s+run: \|/)?.[0] ?? ''
    assert.doesNotMatch(failureGate, /backup\.outputs\.enabled_count == '0'/)
    assert.doesNotMatch(failureGate, /backup\.outputs\.off_node_count == '0'/)
    assert.doesNotMatch(failureGate, /backup\.outputs\.recent_success_count == '0'/)
    assert.match(watcher, /- name: Report Coolify-scheduler backup posture/)
    assert.match(watcher, /::notice::Coolify-planleggerens backup/)
    assert.match(watcher, /freshness-watch/)
  })

  it('keeps operational library health separate from external human readiness', () => {
    assert.match(watcher, /data\.get\('knowledgeBaseGatesOk'\)/)
    assert.match(watcher, /data\.get\('operational'\)/)
    assert.match(watcher, /data\.get\('reviewComplete'\)/)
    assert.match(watcher, /data\.get\('externalReady'\)/)
    assert.match(watcher, /data\.get\('humanReviewed'\)/)
    assert.match(watcher, /data\.get\('externalClaimEligible'\)/)

    const failureCondition = watcher.match(/- name: Fail if unhealthy or unreachable[\s\S]*?\n\s+run: \|/)?.[0] ?? ''
    assert.match(failureCondition, /steps\.app\.outputs\.library_operational != 'true'/)
    assert.doesNotMatch(failureCondition, /library_review_complete.*!=/)
    assert.doesNotMatch(failureCondition, /library_external_ready.*!=/)
  })

  it('requires the exact healthy database state and rejects running:unhealthy', () => {
    const failureCondition = watcher.match(/- name: Fail if unhealthy or unreachable[\s\S]*?\n\s+run: \|/)?.[0] ?? ''
    assert.match(failureCondition, /steps\.db\.outputs\.status != 'running:healthy'/)
    assert.doesNotMatch(failureCondition, /contains\(steps\.db\.outputs\.status, 'healthy'\)/)
  })

  it('uses HTTP-failing Coolify status, backup, and restart calls', () => {
    assert.match(watcher, /response=\$\(curl --config "\$curl_config_file" -sS -m 10 -w/)
    assert.match(watcher, /curl --config "\$curl_config_file" -fsS -m 10/)
    assert.match(watcher, /curl --config "\$restart_config_file" -fsS -X POST/)
  })

  it('passes Coolify and Cloudflare secrets through private header files, not curl argv', () => {
    for (const source of [watcher, prodImport, deployVerify]) {
      assert.doesNotMatch(source, /(?:-H|--header) "Authorization: Bearer \$TOKEN"/)
      assert.doesNotMatch(source, /(?:-H|--header) "CF-Access-Client-(?:Id|Secret): \$CF_/)
    }

    assert.match(watcher, /scripts\/write-private-coolify-curl-config\.py "\$curl_config_file"/)
    assert.match(watcher, /--header "@\$access_header_file"/)
    assert.match(deployVerify, /curl --config "\$curl_config_file"/)
    assert.match(deployVerify, /--header "@\$access_header_file"/)

    for (const source of [watcher, deployVerify]) {
      assert.match(source, /write-private-coolify-curl-config\.py/)
      assert.doesNotMatch(
        source,
        /curl[^\n]*(?:\$COOLIFY_API_TOKEN|\$COOLIFY_BASE_URL|\$TOKEN|\$BASE|\$CF_ID|\$CF_SECRET|\$UUID)/,
      )
    }
    assert.doesNotMatch(prodImport, /COOLIFY_(?:API_TOKEN|BASE_URL)/)
    assert.doesNotMatch(prodImport, /write-private-coolify-curl-config\.py/)
    assert.match(prodImport, /scripts\/verify-estate-backup-receipt\.ts/)
    assert.match(watcher, /chmod 600 "\$access_header_file"/)
    assert.match(deployVerify, /chmod 600 "\$access_header_file"/)
  })

  it('checks out the private curl helper before any workflow invokes it', () => {
    for (const source of [watcher, deployVerify]) {
      const checkoutIndex = source.indexOf('uses: actions/checkout@v6')
      const helperIndex = source.indexOf('scripts/write-private-coolify-curl-config.py')
      assert.ok(checkoutIndex >= 0, 'workflow must check out the helper')
      assert.ok(helperIndex > checkoutIndex, 'helper must only run after checkout')
    }
  })

  it('writes a curl-parseable mode-0600 Coolify config with escaped secrets', () => {
    const directory = mkdtempSync(join(tmpdir(), 'coolify-curl-config-'))
    const configPath = join(directory, 'curl.conf')
    writeFileSync(configPath, 'placeholder', { mode: 0o644 })

    try {
      const generated = spawnSync(
        'scripts/write-private-coolify-curl-config.py',
        [configPath],
        {
          encoding: 'utf8',
          env: {
            ...process.env,
            COOLIFY_API_TOKEN: 'test"token\\part',
            COOLIFY_BASE_URL: 'https://coolify.example.test/root',
            COOLIFY_API_PATH: '/api/v1/status',
          },
        },
      )
      assert.equal(generated.status, 0, generated.stderr)
      assert.equal(statSync(configPath).mode & 0o777, 0o600)
      assert.equal(
        readFileSync(configPath, 'utf8'),
        'url = "https://coolify.example.test/root/api/v1/status"\n' +
          'header = "Authorization: Bearer test\\"token\\\\part"\n',
      )

      const curlParse = spawnSync('curl', ['--config', configPath, '--version'], {
        encoding: 'utf8',
      })
      assert.equal(curlParse.status, 0, curlParse.stderr)
    } finally {
      rmSync(directory, { recursive: true, force: true })
    }
  })

  it('verifies the deployment without writing envs or triggering its own build', () => {
    assert.match(deployVerify, /^name: Coolify Deploy Verify$/m)
    assert.match(deployVerify, /push:\s*\n\s+branches:\s*\n\s+- main/)
    assert.match(deployVerify, /permissions:\s*\n\s+contents: read/)
    assert.match(deployVerify, /COOLIFY_API_TOKEN/)

    // Kontrakten er snudd 2026-08-25. Den håndhevet før at workflowen SKREV
    // SOURCE_COMMIT og trigget sin egen deploy. Begge deler var feil:
    // en eksplisitt env-variabel skygget for commiten Coolify selv injiserer,
    // så /api/version rapporterte det workflowen sist skrev framfor det som
    // faktisk kjørte — og API-deployen doblet hver merge til to samtidige bygg.
    // Disse tre vokter at ingen av delene sniker seg inn igjen.
    assert.doesNotMatch(deployVerify, /-X (POST|PATCH|PUT|DELETE)/)
    assert.doesNotMatch(deployVerify, /api\/v1\/applications\/\$UUID\/envs/)
    assert.doesNotMatch(deployVerify, /api\/v1\/deploy\?/)

    assert.match(deployVerify, /COOLIFY_API_PATH="\/api\/v1\/deployments\/applications\/\$UUID"/)
    assert.match(deployVerify, /curl --config "\$curl_config_file" -fsS/)
    assert.match(deployVerify, /actual_sha != expected_sha/)
    assert.match(deployVerify, /api\/data-status/)
    assert.match(deployVerify, /api\/library-analysis\/status/)
    assert.match(deployVerify, /library\.get\('operational'\)/)
    assert.doesNotMatch(deployVerify, /library\.get\('ok'\) is not True/)
  })

  it('retires every local static SOURCE_COMMIT mutation and deploy helper', () => {
    for (const helper of [retiredShaSync, retiredDeployHelper]) {
      assert.match(helper, /is retired/)
      assert.match(helper, /exit 1/)
      assert.doesNotMatch(helper, /-X\s+(POST|PATCH|PUT|DELETE)/)
      assert.doesNotMatch(helper, /\/api\/v1\/(deploy|applications\/.*\/envs)/)
    }
  })
})
