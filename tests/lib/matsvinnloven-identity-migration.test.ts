import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { spawnSync } from 'node:child_process'
import { sources } from '../../prisma/seed-data/sources'
import { theses } from '../../prisma/seed-data/theses'
import {
  CANONICAL_EVIDENCE_TOTAL_AFTER_MATSVINNLOVEN_IDENTITY,
  CANONICAL_REPORT_COUNT_FOR_MATSVINNLOVEN_IDENTITY,
  CANONICAL_SOURCE_DOC_COUNT_AFTER_MATSVINNLOVEN_IDENTITY,
  CANONICAL_THESIS_COUNT_AFTER_MATSVINNLOVEN_IDENTITY,
  MATSVINNLOVEN_QUARANTINE_FILE,
  OFFICIAL_MATSVINNLOVEN_SOURCE_DOC_ID,
  OFFICIAL_MATSVINNLOVEN_URL,
  PINNED_MATSVINNLOVEN_BEFORE_SNAPSHOT_SHA256,
  PINNED_MATSVINNLOVEN_IDENTITY_CONTRACT_SHA256,
  buildMatsvinnlovenControlledMutationAudit,
  buildMatsvinnlovenIdentityMigrationPlan,
  buildOfficialMatsvinnlovenSourceTarget,
  classifyMatsvinnlovenAcademicIdentityCounts,
  classifyMatsvinnlovenAlreadyAppliedAudit,
  matsvinnlovenIdentityContractSha256,
  matsvinnlovenIdentityPlanSha256,
  matsvinnlovenIdentitySnapshotSha256,
  matsvinnlovenTargetFingerprintSha256,
  sha256MatsvinnlovenJson,
  sha256MatsvinnlovenText,
  validateMatsvinnlovenOperatorAuthority,
  type MatsvinnlovenIdentitySnapshot,
} from '../../src/lib/citations/matsvinnloven-identity-migration'
import { verifyMatsvinnlovenReleaseEvidence } from '../../scripts/migrate-matsvinnloven-identity'

function emptyDependencies() {
  return {
    documentRefsFrom: [], documentRefsTo: [], reportBindings: [], insightDocumentRefs: [],
    companyDocumentRefs: [], actorDocumentRefs: [], quarantineSourceCitations: [],
    quarantineFieldCitations: [], quarantineEvidenceAppraisals: [],
    officialSourceCitations: [], officialFieldCitations: [],
    officialEvidenceAppraisals: [], officialLibraryAnalysisRecords: [],
    sourceRefs: [], insightSourceLinks: [], mediaEntries: [],
  }
}

function beforeSnapshot(): MatsvinnlovenIdentitySnapshot {
  return {
    theses: [{
      id: 'matsvinnloven-2025',
      authors: 'Forventet utgivelse / NORSUS',
      institution: 'Diverse',
      year: 2025,
      title: 'Den nye Matsvinnloven (2026) og forretningsmodeller i dagligvare',
      titleNo: null,
      url: 'https://lovdata.no/dokument/NL/lov/2025-06-20-42',
      synthesis: 'Undersøker hvordan den nye matsvinnloven (LOV-2025-06-20-42), som trer i kraft i 2026, endrer incentivene for norske dagligvarekjeder. Analyserer skiftet fra frivillige bransjeavtaler til lovpålagt donasjonsplikt og sanksjonstrusler, og hvordan dette påvirker forretningsmodeller for nedprising og veldedig utdeling.',
      keyFindings: [
        'Den nye matsvinnloven fra juni 2025 (ikrafttredelse 2026) er Nordens første obligatoriske lovverk på området',
        'Loven flytter ansvaret fra frivillig bransjeavtale (Matvett) til rettslig forpliktelse med sanksjonsmuligheter',
        'Forretningsmodeller endres: kjedene må prioritere systematisk nedprising og etablere faste donasjonsavtaler fremfor deponering',
        'Maktasymmetri: mindre leverandører bærer risikoen for overproduksjon grunnet returavtaler, noe loven bare delvis adresserer',
      ],
      tags: ['matsvinn', 'regulering', 'sirkulaer', 'makt'],
      takeaways: [
        'Bruk som primærkilde på at regulering tvinger frem sirkulær forretningsmodell-innovasjon',
        'Koble til diskusjonen om returavtaler (Brancoli 2021) og polysentrisk governance (Esposito 2022)',
        'Matsvinnloven er et viktig eksempel på nordisk lederrolle innen matavfallsregulering',
      ],
      method: 'Konseptuell og regulatorisk analyse av lovtekst og intervjuer med bransjeaktører om strategisk tilpasning',
      awardWinning: false,
      degree: 'master',
      doi: null,
      isbn: null,
      publisher: 'Norsk institutt for bærekraftsforskning / UMB',
      accessDate: null,
      documentId: 'cmppas6oi00003evmux65v0s6',
    }],
    documents: [{
      id: 'cmppas6oi00003evmux65v0s6',
      slug: 'thesis-matsvinnloven-2025',
      filePath: 'research/thesis-matsvinnloven-2025.md',
      title: 'Den nye Matsvinnloven (2026) og forretningsmodeller i dagligvare',
      author: 'Forventet utgivelse / NORSUS',
      year: 2025,
      documentType: 'thesis',
      category: 'bibliotek',
      subcategory: 'theses',
      country: 'NO',
      content: `# Den nye Matsvinnloven (2026) og forretningsmodeller i dagligvare


- **Forfatter(e):** Forventet utgivelse / NORSUS
- **Institusjon:** Diverse
- **År:** 2025
- **Grad:** Masteroppgave
- **Utgiver:** Norsk institutt for bærekraftsforskning / UMB

- **URL:** https://lovdata.no/dokument/NL/lov/2025-06-20-42

## Sammendrag / Syntese
Undersøker hvordan den nye matsvinnloven (LOV-2025-06-20-42), som trer i kraft i 2026, endrer incentivene for norske dagligvarekjeder. Analyserer skiftet fra frivillige bransjeavtaler til lovpålagt donasjonsplikt og sanksjonstrusler, og hvordan dette påvirker forretningsmodeller for nedprising og veldedig utdeling.

## Hovedfunn (Key Findings)
- Den nye matsvinnloven fra juni 2025 (ikrafttredelse 2026) er Nordens første obligatoriske lovverk på området
- Loven flytter ansvaret fra frivillig bransjeavtale (Matvett) til rettslig forpliktelse med sanksjonsmuligheter
- Forretningsmodeller endres: kjedene må prioritere systematisk nedprising og etablere faste donasjonsavtaler fremfor deponering
- Maktasymmetri: mindre leverandører bærer risikoen for overproduksjon grunnet returavtaler, noe loven bare delvis adresserer

## Actionable Takeaways
- Bruk som primærkilde på at regulering tvinger frem sirkulær forretningsmodell-innovasjon
- Koble til diskusjonen om returavtaler (Brancoli 2021) og polysentrisk governance (Esposito 2022)
- Matsvinnloven er et viktig eksempel på nordisk lederrolle innen matavfallsregulering

## Metodikk (Methodology)
Konseptuell og regulatorisk analyse av lovtekst og intervjuer med bransjeaktører om strategisk tilpasning`,
      summary: 'Undersøker hvordan den nye matsvinnloven (LOV-2025-06-20-42), som trer i kraft i 2026, endrer incentivene for norske dagligvarekjeder. Analyserer skiftet fra frivillige bransjeavtaler til lovpålagt donasjonsplikt og sanksjonstrusler, og hvordan dette påvirker forretningsmodeller for nedprising og veldedig utdeling.',
      url: 'https://lovdata.no/dokument/NL/lov/2025-06-20-42',
      accessedAt: null,
      archivedUrl: null,
      wordCount: 192,
      tags: ['matsvinn', 'regulering', 'sirkulaer', 'makt', 'thesis', 'master', 'diverse'],
      metadata: {
        degree: 'master', thesisId: 'matsvinnloven-2025', institution: 'Diverse',
        awardWinning: false, generatedFrom: 'prisma/seed-data/theses.ts',
      },
      createdAt: '2026-05-28T09:35:34.099Z',
      updatedAt: '2026-07-02T08:02:45.291Z',
    }],
    libraryAnalysisRecords: [{
      id: 'cmqjoewzd00vbzpvmkzfba3bw',
      sourceKind: 'document',
      sourceKey: 'document:cmppas6oi00003evmux65v0s6',
      documentId: 'cmppas6oi00003evmux65v0s6',
      sourceDocId: null,
      canonicalPath: 'research/thesis-matsvinnloven-2025.md',
      title: 'Den nye Matsvinnloven (2026) og forretningsmodeller i dagligvare',
      status: 'ai_draft',
      usageRule: 'internal_background',
      reviewStatus: 'not_required',
      citationReadiness: null,
      analysisTier: 'triage_card',
      aiCard: {
        gaps: [], status: 'ai_draft', riskFlags: [],
        keyFindings: ['Kilden er klar for intern AI-kontekst etter eksisterende claim/citation-gater.'],
        controlLinks: [
          { href: '/bibliotek/cmppas6oi00003evmux65v0s6', label: 'Bibliotek' },
          { href: '/research/thesis-matsvinnloven-2025.md', label: 'Repo' },
        ],
        shortSummary: 'Den nye Matsvinnloven (2026) og forretningsmodeller i dagligvare er triagert som document med 192 ord i lokalt grunnlag.',
        citationStatus: 'not_citation_checked', claimCandidates: [],
        projectImplication: 'Kilden kan brukes som intern bakgrunn etter review av status og lokator.',
        recommendedUsageRule: 'internal_background',
      },
      aiSummary: 'Den nye Matsvinnloven (2026) og forretningsmodeller i dagligvare er triagert som document med 192 ord i lokalt grunnlag.',
      keyFindings: ['Kilden er klar for intern AI-kontekst etter eksisterende claim/citation-gater.'],
      claimCandidates: [],
      projectImplications: ['Kilden kan brukes som intern bakgrunn etter review av status og lokator.'],
      gaps: [],
      controlLinks: [
        { href: '/bibliotek/cmppas6oi00003evmux65v0s6', label: 'Bibliotek' },
        { href: '/research/thesis-matsvinnloven-2025.md', label: 'Repo' },
      ],
      riskFlags: [],
      contentHash: '10a4dc139ed20c3a9907c331d6cf9a05075905b441d1e0d149471b907ef704cd',
      wordCount: 192,
      processedAt: '2026-07-19T19:39:54.849Z',
      reviewedAt: null,
      reviewer: null,
      createdAt: '2026-06-18T15:50:14.905Z',
      updatedAt: '2026-07-19T19:39:54.849Z',
    }],
    sourceDocCandidates: [],
    corpusCounts: { reports: 139, theses: 79, sourceDocs: 199, totalEvidence: 417 },
    dependencies: emptyDependencies(),
  }
}

const quarantineContent = readFileSync(
  join(process.cwd(), MATSVINNLOVEN_QUARANTINE_FILE),
  'utf8',
)

describe('Matsvinnloven synthetic Thesis identity migration', () => {
  it('pins the complete reviewed before snapshot and creates a fail-closed plan', () => {
    const before = beforeSnapshot()
    assert.equal(
      matsvinnlovenIdentitySnapshotSha256(before),
      PINNED_MATSVINNLOVEN_BEFORE_SNAPSHOT_SHA256,
    )
    const sourceTarget = buildOfficialMatsvinnlovenSourceTarget(sources)
    const plan = buildMatsvinnlovenIdentityMigrationPlan(before, sourceTarget, quarantineContent)
    assert.equal(plan.state, 'pending', JSON.stringify(plan.conflicts))
    assert.deepEqual(plan.summary, {
      thesisDeletes: 1,
      sourceDocCreates: 1,
      documentQuarantines: 1,
      libraryBlocks: 1,
      citationCreates: 0,
      appraisalCreates: 0,
      sourceDocumentLinks: 0,
    })
    assert.equal(plan.sourceTarget.documentId, null)
    assert.equal(plan.libraryTarget?.status, 'blocked')
    assert.equal(plan.libraryTarget?.usageRule, 'do_not_use_for_claims')
  })

  it('recognizes the exact post-state as idempotently applied', () => {
    const before = beforeSnapshot()
    const sourceTarget = buildOfficialMatsvinnlovenSourceTarget(sources)
    const pending = buildMatsvinnlovenIdentityMigrationPlan(before, sourceTarget, quarantineContent)
    assert.ok(pending.documentTarget && pending.libraryTarget)
    const after: MatsvinnlovenIdentitySnapshot = {
      theses: [],
      documents: [{
        ...pending.documentTarget,
        accessedAt: null,
        createdAt: before.documents[0].createdAt,
        updatedAt: '2026-07-20T00:00:00.000Z',
      }],
      libraryAnalysisRecords: [{
        ...pending.libraryTarget,
        processedAt: null,
        reviewedAt: null,
        createdAt: before.libraryAnalysisRecords[0].createdAt,
        updatedAt: '2026-07-20T00:00:00.000Z',
      }],
      sourceDocCandidates: [sourceTarget],
      corpusCounts: { reports: 139, theses: 78, sourceDocs: 200, totalEvidence: 417 },
      dependencies: emptyDependencies(),
    }
    assert.equal(
      buildMatsvinnlovenIdentityMigrationPlan(after, sourceTarget, quarantineContent).state,
      'already_applied',
    )
  })

  it('refuses any citation/appraisal/reference dependency', () => {
    const before = beforeSnapshot()
    before.dependencies.quarantineSourceCitations = [{ id: 'unexpected-citation' }]
    const plan = buildMatsvinnlovenIdentityMigrationPlan(
      before,
      buildOfficialMatsvinnlovenSourceTarget(sources),
      quarantineContent,
    )
    assert.equal(plan.state, 'conflict')
    assert.ok(plan.conflicts.some(conflict => conflict.code === 'dependency_present'))
  })

  it('accepts the exact official SourceDoc as an already-seeded pending variant', () => {
    const before = beforeSnapshot()
    const sourceTarget = buildOfficialMatsvinnlovenSourceTarget(sources)
    before.sourceDocCandidates = [sourceTarget]
    before.corpusCounts = { reports: 139, theses: 79, sourceDocs: 200, totalEvidence: 418 }
    const plan = buildMatsvinnlovenIdentityMigrationPlan(before, sourceTarget, quarantineContent)
    assert.equal(plan.state, 'pending', JSON.stringify(plan.conflicts))
    assert.equal(plan.pendingState, 'source_seeded')
    assert.equal(plan.summary.sourceDocCreates, 0)
  })

  it('rejects duplicate Lovdata aliases instead of hiding URL variants', () => {
    const before = beforeSnapshot()
    const sourceTarget = buildOfficialMatsvinnlovenSourceTarget(sources)
    before.sourceDocCandidates = [
      sourceTarget,
      { ...sourceTarget, id: 'src-law-alias', url: `${OFFICIAL_MATSVINNLOVEN_URL}/?view=all` },
    ]
    before.corpusCounts = { reports: 139, theses: 79, sourceDocs: 201, totalEvidence: 419 }
    const plan = buildMatsvinnlovenIdentityMigrationPlan(before, sourceTarget, quarantineContent)
    assert.equal(plan.state, 'conflict')
    assert.ok(plan.conflicts.some(conflict => conflict.code === 'mixed_or_partial_state'))
  })

  it('allows legitimate downstream dependencies on the official SourceDoc after apply', () => {
    const before = beforeSnapshot()
    const sourceTarget = buildOfficialMatsvinnlovenSourceTarget(sources)
    const pending = buildMatsvinnlovenIdentityMigrationPlan(before, sourceTarget, quarantineContent)
    assert.ok(pending.documentTarget && pending.libraryTarget)
    const after: MatsvinnlovenIdentitySnapshot = {
      theses: [],
      documents: [{
        ...pending.documentTarget,
        createdAt: before.documents[0].createdAt,
        updatedAt: '2026-07-20T00:00:00.000Z',
      }],
      libraryAnalysisRecords: [{
        ...pending.libraryTarget,
        createdAt: before.libraryAnalysisRecords[0].createdAt,
        updatedAt: '2026-07-20T00:00:00.000Z',
      }],
      sourceDocCandidates: [sourceTarget],
      corpusCounts: { reports: 139, theses: 78, sourceDocs: 200, totalEvidence: 417 },
      dependencies: {
        ...emptyDependencies(),
        officialSourceCitations: [{ id: 'official-citation' }],
        officialFieldCitations: [{ id: 'official-field-citation' }],
        sourceRefs: [{ id: 'official-source-ref' }],
        insightSourceLinks: [{ id: 'official-insight-link' }],
      },
    }
    assert.equal(
      buildMatsvinnlovenIdentityMigrationPlan(after, sourceTarget, quarantineContent).state,
      'already_applied',
    )
  })

  it('stores a compact deterministic tombstone and canonicalizes Prisma Date/JSON roundtrips', () => {
    const before = beforeSnapshot()
    const plan = buildMatsvinnlovenIdentityMigrationPlan(
      before,
      buildOfficialMatsvinnlovenSourceTarget(sources),
      quarantineContent,
    )
    assert.ok(plan.documentTarget)
    const metadata = plan.documentTarget.metadata as Record<string, unknown>
    assert.ok(JSON.stringify(metadata).length < 1500)
    assert.doesNotMatch(JSON.stringify(metadata), /originalState|keyFindings|takeaways/)

    const dateValue = { accessedAt: new Date('2026-07-19T00:00:00.000Z'), metadata }
    const prismaJsonRoundtrip = JSON.parse(JSON.stringify(dateValue))
    assert.equal(sha256MatsvinnlovenJson(dateValue), sha256MatsvinnlovenJson(prismaJsonRoundtrip))
  })

  it('accepts only the exact reviewed pre/post evidence identities', () => {
    assert.equal(classifyMatsvinnlovenAcademicIdentityCounts({
      reports: CANONICAL_REPORT_COUNT_FOR_MATSVINNLOVEN_IDENTITY,
      theses: CANONICAL_THESIS_COUNT_AFTER_MATSVINNLOVEN_IDENTITY + 1,
      sourceDocs: CANONICAL_SOURCE_DOC_COUNT_AFTER_MATSVINNLOVEN_IDENTITY - 1,
      totalEvidence: CANONICAL_EVIDENCE_TOTAL_AFTER_MATSVINNLOVEN_IDENTITY,
    }), 'pre_migration')
    assert.equal(classifyMatsvinnlovenAcademicIdentityCounts({
      reports: CANONICAL_REPORT_COUNT_FOR_MATSVINNLOVEN_IDENTITY,
      theses: CANONICAL_THESIS_COUNT_AFTER_MATSVINNLOVEN_IDENTITY,
      sourceDocs: CANONICAL_SOURCE_DOC_COUNT_AFTER_MATSVINNLOVEN_IDENTITY,
      totalEvidence: CANONICAL_EVIDENCE_TOTAL_AFTER_MATSVINNLOVEN_IDENTITY,
    }), 'post_migration')
    assert.equal(classifyMatsvinnlovenAcademicIdentityCounts({
      reports: CANONICAL_REPORT_COUNT_FOR_MATSVINNLOVEN_IDENTITY,
      theses: 79,
      sourceDocs: 200,
      totalEvidence: 418,
    }), 'invalid')
  })

  it('requires exact metadata-v2 and disposable-restore receipt bindings', async () => {
    const directory = mkdtempSync(join(tmpdir(), 'matsvinnloven-backup-test-'))
    try {
      const backup = join(directory, 'foodsystems-20260719T120000Z.dump')
      const restoreReceipt = join(directory, 'foodsystems-restore-receipt.json')
      const body = 'test custom archive bytes'
      const digest = sha256MatsvinnlovenText(body)
      const databaseIdentityUuid = '123e4567-e89b-42d3-a456-426614174000'
      const completedPrismaMigrationLedger = {
        completedCount: 12,
        sha256: 'a'.repeat(64),
      }
      const coreCounts = {
        ControlledMutationAudit: 0,
        DatabaseIdentity: 1,
        Document: 248,
        EvidenceAppraisal: 1,
        FieldCitation: 100,
        LibraryAnalysisRecord: 210,
        Report: 139,
        SourceCitation: 200,
        SourceDoc: 199,
        Thesis: 79,
      }
      const targetFingerprintSha256 = matsvinnlovenTargetFingerprintSha256({
        completedPrismaMigrationLedger,
        coreCounts,
        databaseIdentity: { key: 'primary', uuid: databaseIdentityUuid },
      })
      const metadata = {
        format: 'foodsystems-database-backup-metadata',
        version: 2,
        createdAtUtc: '2026-07-19T12:00:00.000Z',
        source: { databaseName: 'foodsystems', serverVersion: '17.5' },
        dump: {
          archiveFormat: 'postgresql-custom',
          fileName: 'foodsystems-20260719T120000Z.dump',
          sha256: digest,
          bytes: Buffer.byteLength(body),
        },
        databaseIdentity: { key: 'primary', uuid: databaseIdentityUuid },
        completedPrismaMigrationLedger,
        coreCounts,
        targetDatabaseFingerprint: {
          canonicalJsonFormat: 'sorted-keys-v1',
          sha256: targetFingerprintSha256,
        },
      }
      const metadataRaw = `${JSON.stringify(metadata)}\n`
      const metadataSha256 = sha256MatsvinnlovenText(metadataRaw)
      const receipt = {
        format: 'foodsystems-database-restore-receipt',
        version: 1,
        completedAtUtc: '2026-07-19T12:30:00.000Z',
        backup: {
          dumpBytes: Buffer.byteLength(body),
          dumpSha256: digest,
          metadataSha256,
        },
        databaseIdentity: metadata.databaseIdentity,
        completedPrismaMigrationLedger,
        coreCounts,
        targetDatabaseFingerprint: metadata.targetDatabaseFingerprint,
        checks: {
          archiveChecksumAndCatalog: 'pass',
          restoreCompleted: 'pass',
          requiredRelationsAndNonEmptyData: 'pass',
          constraintsValidated: 'pass',
          indexesReady: 'pass',
          metadataV2Binding: 'pass',
          exactCoreCounts: 'pass',
          databaseIdentity: 'pass',
          completedMigrationLedger: 'pass',
          targetDatabaseFingerprint: 'pass',
          optionalOperatorExpectedCounts: { status: 'pass', supplied: {} },
        },
        cleanup: {
          databaseName: 'foodsystems_restore_test_20260719',
          drop: 'pass',
          databaseAbsenceConfirmed: true,
        },
      }
      const privateWrite = (path: string, contents: string) => writeFileSync(path, contents, { mode: 0o600 })
      privateWrite(backup, body)
      privateWrite(`${backup}.sha256`, `${digest}  foodsystems-20260719T120000Z.dump\n`)
      privateWrite(`${backup}.metadata`, metadataRaw)
      privateWrite(`${backup}.metadata.sha256`, `${metadataSha256}\n`)
      privateWrite(restoreReceipt, `${JSON.stringify(receipt)}\n`)

      const evidence = await verifyMatsvinnlovenReleaseEvidence(backup, restoreReceipt, {
        now: new Date('2026-07-19T13:00:00.000Z'),
        verifierPath: '/usr/bin/true',
      })
      assert.equal(evidence.backupSha256, digest)
      assert.equal(evidence.backupMetadataSha256, metadataSha256)
      assert.equal(evidence.databaseIdentityUuid, databaseIdentityUuid)
      assert.equal(evidence.targetFingerprintSha256, targetFingerprintSha256)

      const badReceipt = {
        ...receipt,
        targetDatabaseFingerprint: {
          ...receipt.targetDatabaseFingerprint,
          sha256: 'f'.repeat(64),
        },
      }
      privateWrite(join(directory, 'bad-receipt.json'), `${JSON.stringify(badReceipt)}\n`)
      await assert.rejects(
        verifyMatsvinnlovenReleaseEvidence(backup, join(directory, 'bad-receipt.json'), {
          now: new Date('2026-07-19T13:00:00.000Z'),
          verifierPath: '/usr/bin/true',
        }),
        /target fingerprint differs/,
      )
    } finally {
      rmSync(directory, { recursive: true, force: true })
    }
  })

  it('binds contract, plan, before/after/dependency and release hashes into one audit input', () => {
    const before = beforeSnapshot()
    const sourceTarget = buildOfficialMatsvinnlovenSourceTarget(sources)
    const pendingPlan = buildMatsvinnlovenIdentityMigrationPlan(before, sourceTarget, quarantineContent)
    assert.ok(pendingPlan.documentTarget && pendingPlan.libraryTarget)
    const afterSnapshot: MatsvinnlovenIdentitySnapshot = {
      theses: [],
      documents: [{
        ...pendingPlan.documentTarget,
        createdAt: before.documents[0].createdAt,
        updatedAt: '2026-07-20T00:00:00.000Z',
      }],
      libraryAnalysisRecords: [{
        ...pendingPlan.libraryTarget,
        createdAt: before.libraryAnalysisRecords[0].createdAt,
        updatedAt: '2026-07-20T00:00:00.000Z',
      }],
      sourceDocCandidates: [sourceTarget],
      corpusCounts: { reports: 139, theses: 78, sourceDocs: 200, totalEvidence: 417 },
      dependencies: emptyDependencies(),
    }
    const afterPlan = buildMatsvinnlovenIdentityMigrationPlan(afterSnapshot, sourceTarget, quarantineContent)
    const contractSha256 = matsvinnlovenIdentityContractSha256()
    assert.equal(contractSha256, PINNED_MATSVINNLOVEN_IDENTITY_CONTRACT_SHA256)
    const planSha256 = matsvinnlovenIdentityPlanSha256(pendingPlan)
    const releaseEvidence = {
      backupSha256: '1'.repeat(64),
      backupBytes: 123,
      backupMetadataSha256: '2'.repeat(64),
      restoreReceiptSha256: '3'.repeat(64),
      databaseIdentityUuid: '123e4567-e89b-42d3-a456-426614174000',
      completedMigrationCount: 12,
      completedMigrationLedgerSha256: '4'.repeat(64),
      targetFingerprintSha256: '5'.repeat(64),
      backupCreatedAtUtc: '2026-07-20T08:00:00.000Z',
      restoreCompletedAtUtc: '2026-07-20T08:30:00.000Z',
    }
    const audit = buildMatsvinnlovenControlledMutationAudit({
      pendingPlan,
      afterPlan,
      contractSha256,
      planSha256,
      releaseEvidence,
      authority: {
        operatorId: 'operator@example.test',
        authorizationRef: 'change-ticket-123',
        databaseRole: 'foodsystems_controlled_writer',
      },
    })
    assert.equal(audit.contractSha256, contractSha256)
    assert.equal(audit.planSha256, planSha256)
    assert.equal(audit.beforeSnapshotSha256, pendingPlan.beforeSnapshotSha256)
    assert.equal(audit.afterSnapshotSha256, afterPlan.beforeSnapshotSha256)
    assert.equal(audit.dependencyStateSha256, pendingPlan.officialDependencyStateSha256)
    assert.equal(audit.backupSha256, releaseEvidence.backupSha256)
    assert.equal(audit.backupMetadataSha256, releaseEvidence.backupMetadataSha256)
    assert.equal(audit.restoreReceiptSha256, releaseEvidence.restoreReceiptSha256)
    assert.match(audit.operationKey, /^quarantine-synthetic-matsvinnloven-thesis-identity:[0-9a-f]{64}$/)

    assert.deepEqual(
      classifyMatsvinnlovenAlreadyAppliedAudit({
        afterPlan,
        expectedContractSha256: contractSha256,
        expectedPlanSha256: planSha256,
        databaseIdentityUuid: releaseEvidence.databaseIdentityUuid,
        candidates: [audit],
      }),
      { state: 'receipted_noop', operationKey: audit.operationKey },
    )
    const missingReceipt = classifyMatsvinnlovenAlreadyAppliedAudit({
      afterPlan,
      expectedContractSha256: contractSha256,
      expectedPlanSha256: planSha256,
      databaseIdentityUuid: releaseEvidence.databaseIdentityUuid,
      candidates: [],
    })
    assert.equal(missingReceipt.state, 'unreceipted_after_state')
    const mismatchedReceipt = classifyMatsvinnlovenAlreadyAppliedAudit({
      afterPlan,
      expectedContractSha256: contractSha256,
      expectedPlanSha256: planSha256,
      databaseIdentityUuid: releaseEvidence.databaseIdentityUuid,
      candidates: [{ ...audit, afterSnapshotSha256: '9'.repeat(64) }],
    })
    assert.equal(mismatchedReceipt.state, 'unreceipted_after_state')
    if (mismatchedReceipt.state === 'unreceipted_after_state') {
      assert.ok(mismatchedReceipt.conflicts.some(conflict => /after snapshot/.test(conflict)))
    }

    assert.throws(
      () => validateMatsvinnlovenOperatorAuthority({
        operatorId: 'operator', authorizationRef: 'ticket', databaseRole: 'foodsystems_mcp_ro',
      }),
      /must not be an MCP or read-only role/,
    )
    assert.throws(
      () => buildMatsvinnlovenControlledMutationAudit({
        pendingPlan: afterPlan,
        afterPlan,
        contractSha256,
        planSha256,
        releaseEvidence,
        authority: { operatorId: 'operator', authorizationRef: 'ticket', databaseRole: 'postgres' },
      }),
      /exact pending plan/,
    )
  })

  it('keeps --apply hard-disabled before DATABASE_URL, evidence, or database access', () => {
    const result = spawnSync(process.execPath, [
      '--import=tsx',
      join(process.cwd(), 'scripts/migrate-matsvinnloven-identity.ts'),
      '--apply',
    ], {
      cwd: process.cwd(),
      encoding: 'utf8',
      env: { NODE_ENV: 'test', PATH: process.env.PATH ?? '' },
    })
    assert.notEqual(result.status, 0)
    assert.match(result.stderr, /--apply is intentionally disabled/)
    assert.doesNotMatch(result.stderr, /DATABASE_URL|backup-file|restore-receipt/)
  })

  it('keeps seed/import truth from recreating or mislinking the false Thesis', () => {
    const official = sources.find(source => source.id === OFFICIAL_MATSVINNLOVEN_SOURCE_DOC_ID)
    assert.ok(official)
    assert.equal(official?.url, OFFICIAL_MATSVINNLOVEN_URL)
    assert.equal(official?.provenanceType, 'official_primary')
    assert.equal(theses.some(thesis => thesis.id === 'matsvinnloven-2025'), false)

    const importer = readFileSync(join(process.cwd(), 'scripts/import-research-docs.ts'), 'utf8')
    assert.match(importer, /'thesis-matsvinnloven-2025\.md'/)
    assert.match(importer, /never relink it to the real law/)
  })

  it('removes the wrong law id from active repository source surfaces', () => {
    const registry = readFileSync(join(process.cwd(), 'research/bibliotek/KILDEREGISTER.md'), 'utf8')
    const backlog = readFileSync(join(process.cwd(), 'research/bibliotek/MASTER-PHD-BACKLOG-2026.md'), 'utf8')
    assert.doesNotMatch(registry, /2025-06-20-42/)
    assert.match(registry, /LOV-2025-06-20-103/)
    assert.match(backlog, /Avvist syntetisk identitet/)
    assert.match(backlog, /LOV-2025-06-20-103/)
  })
})
