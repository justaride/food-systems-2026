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
    for (const target of [
      'verify-only',
      'ownership',
      'registers',
      'full',
      'country-metric-harmonization-dry',
      'country-metric-harmonization',
      'nordic-spine-dry',
      'nordic-spine',
    ]) {
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

  it('unntar bare ikke-muterende targets fra backup-gaten', () => {
    // Gaten er den siste linjen med forsvar før en prod-mutasjon. Den forrige
    // testen sjekket bare at 'verify-only' står der, så et unntak for et
    // SKRIVENDE target ville gått rett gjennom. Denne låser retningen.
    const gate = workflow.slice(
      workflow.indexOf('Require a recent successful off-node backup before mutation'),
      workflow.indexOf('Run selected prod data operation'),
    )
    const exempted = [...gate.matchAll(/inputs\.target != '([^']+)'/g)].map(m => m[1]).sort()
    // Kun targets som beviselig ikke skriver: verify-only og tørrkjøringene.
    assert.deepEqual(exempted, [
      'board-coverage-dry',
      'country-metric-harmonization-dry',
      'leroy-duplicate-dry',
      'nordic-spine-dry',
      'verify-only',
    ])
    // De skrivende targetene skal aldri stå her.
    assert.ok(!exempted.includes('board-coverage'), 'board-coverage muterer og må kreve backup')
    assert.ok(
      !exempted.includes('country-metric-harmonization'),
      'country-metric-harmonization muterer og må kreve backup',
    )
    assert.ok(!exempted.includes('leroy-duplicate'), 'leroy-duplicate sletter en rad og må kreve backup')
    assert.ok(!exempted.includes('nordic-spine'), 'nordic-spine muterer og må kreve backup')
  })

  it('CountryMetric prerequisite keeps dry-run and protected apply separate', () => {
    const ops = workflow.slice(workflow.indexOf('Run selected prod data operation'))
    const dry = ops.slice(
      ops.indexOf('country-metric-harmonization-dry)'),
      ops.indexOf('country-metric-harmonization)'),
    )
    const apply = ops.slice(
      ops.indexOf('country-metric-harmonization)'),
      ops.indexOf('nordic-spine-dry)'),
    )

    assert.match(dry, /npm run db:backfill:country-metric-harmonization:dry-run/)
    assert.doesNotMatch(dry, /:apply/)
    assert.match(dry, /derivedMarginRowsPlanned.*9/)
    assert.match(dry, /derivedMarginRowsSkipped.*\[\]/)

    const preflight = apply.indexOf('db:backfill:country-metric-harmonization:dry-run')
    const mutation = apply.indexOf('db:backfill:country-metric-harmonization:apply')
    const postflight = apply.indexOf(
      'db:backfill:country-metric-harmonization:dry-run',
      preflight + 1,
    )
    const c1Verification = apply.indexOf('db:backfill:nordic-c1:dry-run', postflight + 1)
    const databaseVerification = apply.indexOf('db:verify', c1Verification + 1)
    assert.ok(preflight > -1, 'apply-targetet må først gjenskape tørrkjøringsplanen')
    assert.ok(mutation > preflight, 'mutasjonen må komme etter tørrkjøringsplanen')
    const applyPreflight = apply.slice(preflight, mutation)
    assert.match(applyPreflight, /derivedMarginRowsPlanned.*9/)
    assert.match(applyPreflight, /derivedMarginRowsSkipped.*\[\]/)
    assert.ok(postflight > mutation, 'planen må gjenskapes etter mutasjonen')
    assert.ok(c1Verification > postflight, 'C1-planen må verifiseres etter mutasjonen')
    const c1Gate = apply.slice(c1Verification, databaseVerification)
    assert.match(c1Gate, /plannedRows.*37/)
    assert.match(c1Gate, /withValues.*34/)
    assert.match(c1Gate, /holes.*3/)
    assert.ok(databaseVerification > c1Verification, 'DB-verifikasjon må komme til slutt')
    assert.match(workflow, /country-metric-harmonization-evidence-\$\{\{ github\.run_id \}\}/)
    assert.match(workflow, /research\/_status\/country-metric-harmonization-\*\.log/)
  })

  it('Nordic spine-targetene holder tørrkjøring, apply og idempotensbevis adskilt', () => {
    const ops = workflow.slice(workflow.indexOf('Run selected prod data operation'))
    const dry = ops.slice(ops.indexOf('nordic-spine-dry)'), ops.indexOf('nordic-spine)'))
    const apply = ops.slice(ops.indexOf('nordic-spine)'), ops.indexOf('board-coverage-dry)'))

    for (const command of [
      'db:backfill:nordic-c1:dry-run',
      'db:backfill:nordic-c2-c3:dry-run',
      'db:backfill:nordic-activity-aqua:dry-run',
    ]) {
      assert.match(dry, new RegExp(`npm run ${command}`))
    }
    assert.doesNotMatch(dry, /(?:--apply|:apply)/)

    const expectedApplyOrder = [
      'db:backfill:nordic-c1:dry-run',
      'db:backfill:nordic-c2-c3:dry-run',
      'db:backfill:nordic-activity-aqua:dry-run',
      'db:backfill:nordic-c1:apply',
      'db:backfill:nordic-c2-c3:apply',
      'db:backfill:nordic-activity-aqua:apply',
      'db:verify:nordic-spine',
      'db:backfill:nordic-c1:apply',
      'db:backfill:nordic-c2-c3:apply',
      'db:backfill:nordic-activity-aqua:apply',
      'db:verify:nordic-spine',
      'db:verify',
    ]
    let previous = -1
    for (const command of expectedApplyOrder) {
      const index = apply.indexOf(`npm run ${command}`, previous + 1)
      assert.ok(index > previous, `${command} må finnes i riktig rekkefølge`)
      previous = index
    }

    assert.match(workflow, /nordic-spine-evidence-\$\{\{ github\.run_id \}\}/)
    assert.match(workflow, /research\/_status\/nordic-spine-\*\.log/)
    assert.doesNotMatch(
      `${dry}\n${apply}`,
      /npm run db:backfill:[^\n]+\\\n\s*\| tee/,
      'backfill stderr must be retained with stdout',
    )
    assert.match(apply, /NORDIC_SPINE_FINGERPRINT=/)
    assert.match(apply, /first_fingerprint[\s\S]*second_fingerprint/)
    assert.match(apply, /Nordic spine idempotency fingerprint mismatch/)
    assert.match(
      apply,
      /npm run db:verify 2>&1 \\\s*\| tee research\/_status\/nordic-spine-postverify\.log/,
    )
  })

  it('Lerøy-targetene: tørrkjøring skriver ikke, og ekte kjøring bærer --apply', () => {
    const ops = workflow.slice(workflow.indexOf('Run selected prod data operation'))
    const dry = ops.slice(ops.indexOf('leroy-duplicate-dry)'), ops.indexOf('leroy-duplicate)'))
    // Tørrkjøringen er default i skriptet; den må IKKE bære --apply.
    assert.match(dry, /resolve-leroy-duplicate\.ts/)
    assert.doesNotMatch(dry, /--apply/)

    const apply = ops.slice(ops.indexOf('leroy-duplicate)'), ops.indexOf('*)'))
    // Den skrivende kjøringen må faktisk be om å skrive — uten --apply ville
    // targetet sett ut som en utført sletting og vært en stille no-op.
    assert.match(apply, /resolve-leroy-duplicate\.ts --apply/)
    // Og verifisere DB-en etterpå, som de andre muterende targetene.
    assert.match(apply, /npm run db:verify/)
  })

  it('AP-1-targetene: tørrkjøring skriver ikke, og ekte kjøring holder rekkefølgen', () => {
    const ops = workflow.slice(workflow.indexOf('Run selected prod data operation'))
    const dry = ops.slice(ops.indexOf('board-coverage-dry)'), ops.indexOf('board-coverage)'))
    // Tørrkjøringen må bære --dry-run, ellers er navnet en løgn som muterer prod.
    assert.match(dry, /extend-board-coverage-brreg\.ts[\s\\]*--dry-run/)
    assert.doesNotMatch(dry, /dedupe-person-keys/)

    const apply = ops.slice(ops.indexOf('board-coverage)'))
    const extend = apply.indexOf('extend-board-coverage-brreg.ts')
    const dedupe = apply.indexOf('dedupe-person-keys.ts --commit')
    const analyze = apply.indexOf('analyze-board-interlocks.ts')
    assert.ok(extend > -1 && dedupe > -1 && analyze > -1, 'alle tre stegene må finnes')
    // Rekkefølgen er ikke kosmetisk: kjøres analysen før dedupe, telles samme
    // person som flere noder på tvers av historiske og nye rader, og
    // interlock-tallene blir for høye. Skriptets egen header sier det samme.
    assert.ok(extend < dedupe, 'utvidelsen må gå før dedupe')
    assert.ok(dedupe < analyze, 'dedupe MÅ gå før interlock-analysen')
    // Ferskt uttrekk, ikke det gamle snapshotet — som ville skrevet juni-styret
    // som sittende, siden skriptet ikke markerer avgåtte medlemmer.
    assert.doesNotMatch(apply.slice(0, analyze), /--snapshot-in=/)
  })
})
