import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'
import { buildEffectiveLibraryAnalysisSyncPlan } from '../../scripts/process-library-analysis'
import type { LibraryAnalysisSyncPlan } from '../../src/lib/library-analysis-processing'

describe('library analysis package scripts', () => {
  it('allows the atomic library batch to complete over a remote production connection', () => {
    const script = readFileSync(join(process.cwd(), 'scripts/process-library-analysis.ts'), 'utf8')
    assert.match(script, /isolationLevel: 'Serializable', timeout: 120_000/)
  })

  it('exposes the expected research and audit commands', () => {
    const packageJson = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as {
      scripts: Record<string, string>
    }

    assert.equal(packageJson.scripts['research:library:inventory'], 'tsx scripts/build-library-analysis-inventory.ts')
    assert.equal(packageJson.scripts['research:library:process:dry-run'], 'tsx scripts/process-library-analysis.ts --dry-run')
    assert.equal(packageJson.scripts['research:library:process:apply'], 'tsx scripts/process-library-analysis.ts --apply')
    assert.equal(
      packageJson.scripts['research:library:process:create-only:dry-run'],
      'tsx scripts/process-library-analysis.ts --dry-run --create-only',
    )
    assert.equal(
      packageJson.scripts['research:library:process:create-only:apply'],
      'tsx scripts/process-library-analysis.ts --apply --create-only',
    )
    assert.equal(packageJson.scripts['research:library:ledger'], 'tsx scripts/export-library-analysis-ledger.ts')
    assert.equal(packageJson.scripts['research:library:repair-backlog'], 'tsx scripts/build-library-analysis-repair-backlog.ts')
    assert.equal(packageJson.scripts['research:library:pdf-extraction-profile'], 'tsx scripts/build-library-analysis-pdf-extraction-profile.ts')
    assert.equal(packageJson.scripts['research:library:repair-pdf-text:dry-run'], 'tsx scripts/repair-library-analysis-pdf-text.ts --dry-run')
    assert.equal(packageJson.scripts['research:library:repair-pdf-text:apply'], 'tsx scripts/repair-library-analysis-pdf-text.ts --apply')
    assert.equal(packageJson.scripts['research:library:repair-local-text:dry-run'], 'tsx scripts/repair-library-analysis-local-text.ts --dry-run')
    assert.equal(packageJson.scripts['research:library:repair-local-text:apply'], 'tsx scripts/repair-library-analysis-local-text.ts --apply')
    assert.equal(packageJson.scripts['research:library:repair-manual-local-match:dry-run'], 'tsx scripts/repair-library-analysis-manual-local-match.ts --dry-run')
    assert.equal(packageJson.scripts['research:library:repair-manual-local-match:apply'], 'tsx scripts/repair-library-analysis-manual-local-match.ts --apply')
    assert.equal(packageJson.scripts['research:library:repair-manual-pdf-match:dry-run'], 'tsx scripts/repair-library-analysis-manual-pdf-match.ts --dry-run')
    assert.equal(packageJson.scripts['research:library:repair-manual-pdf-match:apply'], 'tsx scripts/repair-library-analysis-manual-pdf-match.ts --apply')
    assert.equal(packageJson.scripts['research:library:repair-manual-url-match:dry-run'], 'tsx scripts/repair-library-analysis-manual-url-match.ts --dry-run')
    assert.equal(packageJson.scripts['research:library:repair-manual-url-match:apply'], 'tsx scripts/repair-library-analysis-manual-url-match.ts --apply')
    assert.equal(packageJson.scripts['research:library:locator-profile'], 'tsx scripts/build-library-analysis-locator-profile.ts')
    assert.equal(packageJson.scripts['research:library:url-text-profile'], 'tsx scripts/build-library-analysis-url-text-extraction-profile.ts')
    assert.equal(packageJson.scripts['research:library:repair-url-text:dry-run'], 'tsx scripts/repair-library-analysis-url-text.ts --dry-run')
    assert.equal(packageJson.scripts['research:library:repair-url-text:apply'], 'tsx scripts/repair-library-analysis-url-text.ts --apply')
    assert.equal(packageJson.scripts['research:library:decision-queue'], 'tsx scripts/build-library-analysis-decision-queue.ts')
    assert.equal(packageJson.scripts['audit:library-analysis'], 'tsx scripts/audit-library-analysis.ts')
  })

  it('ships each library analysis script entrypoint', () => {
    for (const script of [
      'build-library-analysis-inventory.ts',
      'process-library-analysis.ts',
      'export-library-analysis-ledger.ts',
      'build-library-analysis-repair-backlog.ts',
      'build-library-analysis-pdf-extraction-profile.ts',
      'repair-library-analysis-pdf-text.ts',
      'repair-library-analysis-local-text.ts',
      'repair-library-analysis-manual-local-match.ts',
      'repair-library-analysis-manual-pdf-match.ts',
      'repair-library-analysis-manual-url-match.ts',
      'build-library-analysis-locator-profile.ts',
      'build-library-analysis-url-text-extraction-profile.ts',
      'repair-library-analysis-url-text.ts',
      'build-library-analysis-decision-queue.ts',
      'audit-library-analysis.ts',
    ]) {
      assert.ok(existsSync(join(process.cwd(), 'scripts', script)), `missing ${script}`)
    }
  })

  it('fails external approval before database access when the reviewed content hash is missing', () => {
    const result = spawnSync(
      join(process.cwd(), 'node_modules', '.bin', 'tsx'),
      [
        'scripts/review-library-analysis-external.ts',
        '--apply',
        '--decision=approve',
        '--source-key=document:test',
        '--reviewer=Test Reviewer',
        '--ack=I_HAVE_REVIEWED_THE_CURRENT_DOCUMENT',
      ],
      {
        cwd: process.cwd(),
        encoding: 'utf8',
        env: { ...process.env, DATABASE_URL: '' },
      },
    )

    assert.equal(result.status, 1)
    assert.match(result.stderr, /--expected-content-hash is required/)
  })

  it('wires the audit command to the repair backlog artifacts', () => {
    const auditScript = readFileSync(join(process.cwd(), 'scripts/audit-library-analysis.ts'), 'utf8')

    assert.match(auditScript, /LIBRARY_ANALYSIS_REPAIR_BACKLOG_JSON_PATH/)
    assert.match(auditScript, /LIBRARY_ANALYSIS_REPAIR_BACKLOG_MD_PATH/)
    assert.match(auditScript, /LIBRARY_ANALYSIS_PDF_EXTRACTION_PROFILE_JSON_PATH/)
    assert.match(auditScript, /LIBRARY_ANALYSIS_PDF_EXTRACTION_PROFILE_MD_PATH/)
    assert.match(auditScript, /LIBRARY_ANALYSIS_PDF_TEXT_REPAIR_PLAN_JSON_PATH/)
    assert.match(auditScript, /LIBRARY_ANALYSIS_PDF_TEXT_REPAIR_PLAN_MD_PATH/)
    assert.match(auditScript, /LIBRARY_ANALYSIS_LOCAL_TEXT_REPAIR_PLAN_JSON_PATH/)
    assert.match(auditScript, /LIBRARY_ANALYSIS_LOCAL_TEXT_REPAIR_PLAN_MD_PATH/)
    assert.match(auditScript, /LIBRARY_ANALYSIS_MANUAL_LOCAL_MATCH_REPAIR_PLAN_JSON_PATH/)
    assert.match(auditScript, /LIBRARY_ANALYSIS_MANUAL_LOCAL_MATCH_REPAIR_PLAN_MD_PATH/)
    assert.match(auditScript, /LIBRARY_ANALYSIS_MANUAL_PDF_MATCH_REPAIR_PLAN_JSON_PATH/)
    assert.match(auditScript, /LIBRARY_ANALYSIS_MANUAL_PDF_MATCH_REPAIR_PLAN_MD_PATH/)
    assert.match(auditScript, /LIBRARY_ANALYSIS_MANUAL_URL_MATCH_REPAIR_PLAN_JSON_PATH/)
    assert.match(auditScript, /LIBRARY_ANALYSIS_MANUAL_URL_MATCH_REPAIR_PLAN_MD_PATH/)
    assert.match(auditScript, /LIBRARY_ANALYSIS_LOCATOR_PROFILE_JSON_PATH/)
    assert.match(auditScript, /LIBRARY_ANALYSIS_LOCATOR_PROFILE_MD_PATH/)
    assert.match(auditScript, /LIBRARY_ANALYSIS_URL_TEXT_EXTRACTION_PROFILE_JSON_PATH/)
    assert.match(auditScript, /LIBRARY_ANALYSIS_URL_TEXT_EXTRACTION_PROFILE_MD_PATH/)
    assert.match(auditScript, /LIBRARY_ANALYSIS_URL_TEXT_REPAIR_PLAN_JSON_PATH/)
    assert.match(auditScript, /LIBRARY_ANALYSIS_URL_TEXT_REPAIR_PLAN_MD_PATH/)
    assert.match(auditScript, /LIBRARY_ANALYSIS_DECISION_QUEUE_JSON_PATH/)
    assert.match(auditScript, /LIBRARY_ANALYSIS_DECISION_QUEUE_MD_PATH/)
    assert.match(auditScript, /repairBacklogJsonContent/)
    assert.match(auditScript, /repairBacklogMarkdownContent/)
    assert.match(auditScript, /pdfExtractionProfileJsonContent/)
    assert.match(auditScript, /pdfExtractionProfileMarkdownContent/)
    assert.match(auditScript, /pdfTextRepairPlanJsonContent/)
    assert.match(auditScript, /pdfTextRepairPlanMarkdownContent/)
    assert.match(auditScript, /localTextRepairPlanJsonContent/)
    assert.match(auditScript, /localTextRepairPlanMarkdownContent/)
    assert.match(auditScript, /manualLocalMatchRepairPlanJsonContent/)
    assert.match(auditScript, /manualLocalMatchRepairPlanMarkdownContent/)
    assert.match(auditScript, /manualPdfMatchRepairPlanJsonContent/)
    assert.match(auditScript, /manualPdfMatchRepairPlanMarkdownContent/)
    assert.match(auditScript, /manualUrlMatchRepairPlanJsonContent/)
    assert.match(auditScript, /manualUrlMatchRepairPlanMarkdownContent/)
    assert.match(auditScript, /locatorProfileJsonContent/)
    assert.match(auditScript, /locatorProfileMarkdownContent/)
    assert.match(auditScript, /urlTextExtractionProfileJsonContent/)
    assert.match(auditScript, /urlTextExtractionProfileMarkdownContent/)
    assert.match(auditScript, /urlTextRepairPlanJsonContent/)
    assert.match(auditScript, /urlTextRepairPlanMarkdownContent/)
    assert.match(auditScript, /decisionQueueJsonContent/)
    assert.match(auditScript, /decisionQueueMarkdownContent/)
    assert.match(auditScript, /auditLibraryAnalysisLedgerLiveParity/)
    assert.match(auditScript, /loadLibraryAnalysisInventory\(\{ requireDb: true \}\)/)
    assert.match(auditScript, /artifact-only \(DATABASE_URL not set; live parity not claimed\)/)
  })

  it('exports only current inventory identities while reporting retained history separately', () => {
    const script = readFileSync(join(process.cwd(), 'scripts/export-library-analysis-ledger.ts'), 'utf8')

    assert.match(script, /partitionLibraryAnalysisRecordsForLiveLedger/)
    assert.match(script, /libraryAnalysisIdentityKey/)
    assert.match(script, /Stale retained outside live ledger/)
    assert.doesNotMatch(script, /currentBySourceKey/)
  })

  it('keeps URL text extraction profiling bounded but parallel', () => {
    const script = readFileSync(
      join(process.cwd(), 'scripts/build-library-analysis-url-text-extraction-profile.ts'),
      'utf8',
    )

    assert.match(script, /URL_TEXT_PROFILE_CONCURRENCY/)
    assert.match(script, /runWithConcurrency/)
    assert.match(script, /FETCH_TIMEOUT_MS/)
    assert.match(script, /response\.body\?\.cancel/)
    assert.match(script, /LIBRARY_ANALYSIS_REPAIR_BACKLOG_JSON_PATH/)
    assert.match(script, /buildLibraryAnalysisUrlTextExtractionTargets/)
  })

  it('feeds locator profiling from all no-path repair batches', () => {
    const script = readFileSync(join(process.cwd(), 'scripts/build-library-analysis-locator-profile.ts'), 'utf8')

    assert.match(script, /LOCATOR_PROFILE_REPAIR_KINDS/)
    assert.match(script, /missing_document_locator/)
    assert.match(script, /url_backed_low_text/)
    assert.match(script, /seeded_report_stub/)
  })

  it('keeps URL profile and repair fetch size caps aligned for medium public PDFs', () => {
    for (const scriptName of [
      'build-library-analysis-url-text-extraction-profile.ts',
      'repair-library-analysis-url-text.ts',
    ]) {
      const script = readFileSync(join(process.cwd(), 'scripts', scriptName), 'utf8')

      assert.match(script, /const MAX_BYTES = 20 \* 1024 \* 1024/, `${scriptName} should allow bounded 20 MiB URL PDFs`)
    }
  })

  it('keeps URL text repair bounded, parallel, and backed up', () => {
    const script = readFileSync(
      join(process.cwd(), 'scripts/repair-library-analysis-url-text.ts'),
      'utf8',
    )

    assert.match(script, /URL_TEXT_REPAIR_CONCURRENCY/)
    assert.match(script, /runWithConcurrency/)
    assert.match(script, /FETCH_TIMEOUT_MS/)
    assert.match(script, /response\.body\?\.cancel/)
    assert.match(script, /BACKUP_PATH/)
    assert.match(script, /appendFileSync/)
    assert.match(script, /toPlanHandoff/)
  })

  it('keeps manually reviewed local match mappings explicit in the repair script', () => {
    const script = readFileSync(
      join(process.cwd(), 'scripts/repair-library-analysis-manual-local-match.ts'),
      'utf8',
    )

    assert.match(script, /cmqgiocku00l74nvmv8w9jpuu/)
    assert.match(script, /cmppajywm001fnjvm3ugcn86r/)
    assert.match(script, /cmppajyso000cnjvm1vx5gvhu/)
    assert.match(script, /cmppajyvy0018njvmtrhi7iw8/)
    assert.match(script, /cmppajyys0020njvmgyo6usd7/)
    assert.match(script, /cmppajyv60010njvmqvtgrlw9/)
    assert.match(script, /cmppajyv3000znjvm24f56eod/)
    assert.match(script, /merkevarer-historie\.md/)
    assert.match(script, /cmppajyul000tnjvmlzlt7jek/)
    assert.match(script, /verdibutikker-utfordrere\.md/)
    assert.match(script, /cmppajywj001enjvm0m816xpe/)
    assert.match(script, /offentlig-rapportlogg-prioritert\.md/)
    assert.match(script, /cmppajyzt002bnjvmy46d4szp/)
    assert.match(script, /nordisk-matmakt-historikk\.md/)
    assert.match(script, /cmppajyyf001wnjvmhfj24z4o/)
    assert.match(script, /nordisk-avhandlingsregister\.md/)
    assert.match(script, /cmppajyy5001tnjvmkbpjz5j7/)
    assert.match(script, /nou-stortingsdok-juridisk\.md/)
    assert.match(script, /cmppajyxq001qnjvmgci4vrq4/)
    assert.match(script, /nordisk-mat-tenkere\.md/)
    assert.match(script, /cmppajysy000enjvmlvxividk/)
    assert.match(script, /tenketanker-ngo\.md/)
    assert.match(script, /cmppajywt001hnjvmyn336uml/)
    assert.match(script, /sirkularitet-dyp\.md/)
    assert.match(script, /cmppajyuo000unjvmcl2enn4a/)
    assert.match(script, /nordisk-sammenligning-2024\.md/)
  })

  it('keeps manually reviewed PDF match mappings explicit in the repair script', () => {
    const script = readFileSync(
      join(process.cwd(), 'scripts/repair-library-analysis-manual-pdf-match.ts'),
      'utf8',
    )

    assert.match(script, /candidateLocalFilePaths/)
    assert.match(script, /cmq8rsnhu000sekvmh125najl/)
    assert.match(script, /cmq8rsnhv000tekvm8plly1pt/)
    assert.match(script, /cmq8rsnhl000mekvmou6qjq2j/)
    assert.match(script, /cmq8rsnhi000kekvm8th1u208/)
    assert.match(script, /10\.1787\/59cf6c95-en/)
    assert.match(script, /cmq8rsni1000yekvmtkitik13/)
    assert.match(script, /cmppgez6p0000f5vm780lxspg/)
    assert.match(script, /cmppajyv80011njvmgpvgesxt/)
    assert.match(script, /cmq8rsnhr000qekvmzurbh35d/)
    assert.match(script, /sharedPathOwnerDocumentId: 'cmp8xyoap00jzvvvmb0m3gejj'/)
    assert.match(script, /cmppgez710001f5vmu3vx72b4/)
    assert.match(script, /rapport_2026-4\.pdf/)
    assert.match(script, /cmq8rsnhj000lekvm5l5vhigm/)
    assert.match(script, /greenpeace-feeding-a-monster-2021\.pdf/)
    assert.match(script, /cmq8rsni70011ekvmnamdezrv/)
    assert.match(script, /turku-circular-food-system-2021\.pdf/)
    assert.match(script, /cmq8rsnh7000fekvmb9a3gc61/)
    assert.match(script, /reitan-eiendom-aarsrapport-2024\.pdf/)
    assert.match(script, /const DEFAULT_MAX_PDF_BYTES = 40 \* 1024 \* 1024/)
    assert.match(script, /const LARGE_REVIEWED_PDF_BYTES = 120 \* 1024 \* 1024/)
    assert.match(script, /maxPdfBytes: LARGE_REVIEWED_PDF_BYTES/)
    assert.match(script, /cmq8rsnie0015ekvmp52qy9il/)
    assert.match(script, /nested-circularity-food-systems-2021\.pdf/)
    assert.match(script, /cmppajyof0000njvmdjrv2blv/)
    assert.match(script, /tesdal-nokkelhull-matvarer-2012\.pdf/)
    assert.match(script, /duo\.uio\.no\/handle\/10852\/34009/)
  })

  it('keeps manually reviewed URL match mappings explicit in the repair script', () => {
    const script = readFileSync(
      join(process.cwd(), 'scripts/repair-library-analysis-manual-url-match.ts'),
      'utf8',
    )

    assert.match(script, /cmp8xyo4900jlvvvmghld2kdi/)
    assert.match(script, /presscloud\.com\/csp\/vocast\/message\.csp/)
    assert.match(script, /cmp8xypc500luvvvme9ehlnlr/)
    assert.match(script, /4146365\/3432515\.pdf/)
    assert.match(script, /cmp8xyph300mavvvmk4wxt3ry/)
    assert.match(script, /hitta\.se\/f%C3%B6retagsinformation\/ljusg%C3%A5rda/)
    assert.match(script, /cmp8xypko00mmvvvmaztul3oz/)
    assert.match(script, /noquo%2Bfoods%2Bab\/5591897193/)
    assert.match(script, /cmp8xypew00m2vvvm5l8kh29p/)
    assert.match(script, /krafman\.se\/hooked-foods-ab\/5591619944/)
    assert.match(script, /cmp8xypkg00mlvvvmy7dbtr2i/)
    assert.match(script, /gausta\.com\/en-US\/jimmy-oien/)
  })

  it('appends repair backups instead of overwriting previous apply batches', () => {
    for (const scriptName of [
      'repair-library-analysis-pdf-text.ts',
      'repair-library-analysis-local-text.ts',
      'repair-library-analysis-manual-local-match.ts',
      'repair-library-analysis-manual-pdf-match.ts',
      'repair-library-analysis-manual-url-match.ts',
      'repair-library-analysis-url-text.ts',
    ]) {
      const script = readFileSync(join(process.cwd(), 'scripts', scriptName), 'utf8')

      assert.match(script, /appendFileSync/, `${scriptName} should append backup rows`)
    }
  })

  it('applies manual PDF match updates transactionally before appending backups', () => {
    const script = readFileSync(
      join(process.cwd(), 'scripts/repair-library-analysis-manual-pdf-match.ts'),
      'utf8',
    )

    assert.match(script, /await prisma\.\$transaction/)
    assert.match(script, /appendArtifact\(BACKUP_PATH/)
  })

  it('applies manual URL match updates transactionally before appending backups', () => {
    const script = readFileSync(
      join(process.cwd(), 'scripts/repair-library-analysis-manual-url-match.ts'),
      'utf8',
    )

    assert.match(script, /await prisma\.\$transaction/)
    assert.match(script, /appendArtifact\(BACKUP_PATH/)
  })

  it('applies manual local match updates transactionally before appending backups', () => {
    const script = readFileSync(
      join(process.cwd(), 'scripts/repair-library-analysis-manual-local-match.ts'),
      'utf8',
    )

    assert.match(script, /await prisma\.\$transaction/)
    assert.match(script, /appendArtifact\(BACKUP_PATH/)
  })

  it('plans exact writes and retains stale projection rows by policy', () => {
    const script = readFileSync(join(process.cwd(), 'scripts/process-library-analysis.ts'), 'utf8')

    assert.match(script, /buildLibraryAnalysisSyncPlan/)
    assert.match(script, /stalePolicy/)
    assert.match(script, /library-analysis-approval-revocation-backup\.jsonl/)
    assert.match(script, /appendFileSync/)
    assert.equal((script.match(/prisma\.\$transaction/g) ?? []).length, 1)
    assert.match(script, /isolationLevel: 'Serializable'/)
    assert.match(script, /libraryAnalysisRecord\.create/)
    assert.match(script, /libraryAnalysisRecord\.updateMany/)
    assert.match(script, /toLibraryAnalysisCasWhere\(action\.expectedSnapshot\)/)
    assert.match(script, /result\.count !== 1/)
    assert.match(script, /code === 'P2002' \|\| code === 'P2034'/)
    assert.ok(
      script.indexOf("}, { isolationLevel: 'Serializable' })") <
        script.indexOf('appendBackup('),
      'approval-revocation backup must be appended only after transaction commit',
    )
    assert.doesNotMatch(script, /deleteMany/)
  })

  it('reduces create-only execution to creates while exposing every skipped update and approval action', () => {
    const action = (
      classification: 'create' | 'material_update' | 'noop' | 'stale',
      key: string,
      approvalAction: 'none' | 'preserved' | 'revoked' = 'none',
    ) => ({
      classification,
      key,
      identity: { sourceKind: 'document', sourceKey: key },
      row: null,
      existing: null,
      changedFields: [],
      approvalAction,
      approvalReasons: [],
      expectedSnapshot: null,
    })
    const actions = [
      action('create', 'document:new-a'),
      action('create', 'document:new-b'),
      action('material_update', 'document:tailored', 'preserved'),
      action('material_update', 'document:review', 'revoked'),
      action('noop', 'document:stable'),
      action('stale', 'document:stale'),
    ] satisfies LibraryAnalysisSyncPlan['actions']
    const plan: LibraryAnalysisSyncPlan = {
      actions,
      counts: { create: 2, material_update: 2, noop: 1, stale: 1 },
      keys: {
        create: ['document:new-a', 'document:new-b'],
        material_update: ['document:tailored', 'document:review'],
        noop: ['document:stable'],
        stale: ['document:stale'],
      },
      stalePolicy: 'retain',
    }

    const effective = buildEffectiveLibraryAnalysisSyncPlan(plan, 'create-only')
    assert.deepEqual(effective.keys.create, ['document:new-a', 'document:new-b'])
    assert.deepEqual(effective.counts, { create: 2, material_update: 0, noop: 0, stale: 0 })
    assert.equal(effective.skippedMaterialUpdates, 2)
    assert.deepEqual(effective.skippedApprovalActions, {
      preserved: ['document:tailored'],
      revoked: ['document:review'],
    })
    assert.ok(effective.actions.every(item => item.classification === 'create'))
  })
})
