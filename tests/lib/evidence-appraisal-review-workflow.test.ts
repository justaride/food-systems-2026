import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { EVIDENCE_APPRAISAL_PILOT_REVIEW_MANIFEST } from '../../research/review/evidence-appraisal-pilot-manifest'
import {
  EXCLUDED_APPRAISAL_ATTESTATION,
  PINNED_EVIDENCE_APPRAISAL_REVIEW_TARGETS_SHA256,
  REVIEWED_APPRAISAL_ATTESTATION,
  buildEvidenceAppraisalReviewPlan,
  evidenceAppraisalCreateTargets,
  evidenceAppraisalReviewPlanContract,
  evidenceAppraisalReviewTargetContract,
  sha256EvidenceAppraisalReviewJson,
  validateCompletedEvidenceAppraisalReviewManifest,
  validateEvidenceAppraisalReviewTemplate,
  type CompletedEvidenceAppraisalReviewManifest,
  type EvidenceAppraisalCitationSnapshot,
  type EvidenceAppraisalDatabaseSnapshot,
  type EvidenceAppraisalReviewManifest,
  type EvidenceAppraisalSourceDocSnapshot,
} from '../../src/lib/citations/evidence-appraisal-review-workflow'

function completedManifest(): CompletedEvidenceAppraisalReviewManifest {
  const manifest = structuredClone(
    EVIDENCE_APPRAISAL_PILOT_REVIEW_MANIFEST,
  ) as unknown as EvidenceAppraisalReviewManifest
  for (const entry of manifest.entries) {
    Object.assign(entry, {
      reviewState: 'human_review_complete',
      attestation: REVIEWED_APPRAISAL_ATTESTATION,
      status: 'reviewed',
      basis: 'grey_literature',
      studyDesign: 'descriptive_document',
      studyDesignDetails: null,
      methodologySummary: 'Named human reviewed the source methodology and analytical approach.',
      sampleOrCoverage: 'The complete publication and its stated empirical coverage.',
      applicability: 'limited',
      applicabilityContext: 'Norwegian food-system analysis and source-attributed claims.',
      applicabilityNotes: 'Applicability is limited by source role, scope, and commissioning context.',
      limitationsStatus: 'identified',
      limitations: ['The source has a bounded scope and must remain explicitly attributed.'],
      limitationsNotes: null,
      riskOfBias: 'some_concerns',
      riskOfBiasNotes: 'Source role and commissioning context create plausible reporting bias.',
      framework: 'FS2026 evidence appraisal',
      frameworkVersion: '1',
      reviewMethod: 'full_text',
      reviewedSourceHash: entry.expectedSourceHash,
      reviewedBy: 'Kari Nordmann',
      reviewedAt: '2026-07-18T12:00:00.000Z',
      notApplicableReason: null,
      notes: null,
    })
  }
  return validateCompletedEvidenceAppraisalReviewManifest(manifest)
}

function sourceSnapshots(
  manifest: CompletedEvidenceAppraisalReviewManifest,
): EvidenceAppraisalSourceDocSnapshot[] {
  return manifest.entries.map(entry => ({
    id: entry.targetId,
    filename: `${entry.targetId}.md`,
    title: `Reviewed source ${entry.targetId}`,
    author: 'Source author',
    year: '2025',
    sourceType: 'rapport',
    description: 'Complete SourceDoc snapshot used by the review plan.',
    relevance: 'Pilot appraisal target.',
    url: entry.reviewLocator,
    isDuplicate: false,
    doi: null,
    publisher: 'Publisher',
    provenanceType: 'commissioned_report',
    accessedAt: '2026-07-19T00:00:00.000Z',
    archivedUrl: null,
    documentId: `document-${entry.targetId}`,
  }))
}

function citationSnapshots(
  manifest: CompletedEvidenceAppraisalReviewManifest,
): EvidenceAppraisalCitationSnapshot[] {
  return manifest.entries.map(entry => ({
    id: entry.reviewBasisCitationId,
    sourceClass: 'secondary',
    citationReadiness: 'citable_with_note',
    verificationStatus: 'machine_verified',
    citationText: `Citation for ${entry.targetId}`,
    title: `Reviewed source ${entry.targetId}`,
    publisher: 'Publisher',
    author: 'Source author',
    year: 2025,
    url: entry.reviewLocator,
    archivedUrl: null,
    localPath: entry.reviewArtifactPath,
    fileHash: entry.expectedSourceHash,
    contentHash: null,
    hashAlgorithm: 'sha256',
    pageRef: 'PDF p. 1',
    quote: 'Short source-bound quotation.',
    accessedAt: '2026-07-19T00:00:00.000Z',
    captureMethod: 'pdf-download-sha256+pdf-render+codex-visual-audit',
    verifiedAt: '2026-07-19T00:00:00.000Z',
    verifiedBy: 'codex-visual-pdf-audit-2026-07-19',
    confidence: 90,
    notes: 'Machine verification only.',
    documentId: null,
    sourceDocId: entry.targetId,
    createdAt: '2026-07-19T20:00:00.000Z',
    updatedAt: '2026-07-19T20:01:00.000Z',
    fieldCitations: [{
      id: `field-${entry.targetId}`,
      citationId: entry.reviewBasisCitationId,
      entityType: 'SourceDoc',
      entityId: entry.targetId,
      fieldPath: 'evidenceClaims.reviewBasis',
      claimText: 'The citation is bound to the exact SourceDoc target.',
      confidence: 0.9,
      createdAt: '2026-07-19T20:00:30.000Z',
    }],
  }))
}

function databaseAppraisals(
  manifest: CompletedEvidenceAppraisalReviewManifest,
): EvidenceAppraisalDatabaseSnapshot[] {
  return evidenceAppraisalCreateTargets(manifest).map(target => ({
    ...target,
    createdAt: '2026-07-19T21:00:00.000Z',
    updatedAt: '2026-07-19T21:00:00.000Z',
  }))
}

describe('EvidenceAppraisal human-review workflow', () => {
  it('pins a blank, typechecked three-target template that cannot enter DB planning', () => {
    const template = validateEvidenceAppraisalReviewTemplate(
      EVIDENCE_APPRAISAL_PILOT_REVIEW_MANIFEST,
    )
    assert.equal(
      sha256EvidenceAppraisalReviewJson(evidenceAppraisalReviewTargetContract(template)),
      PINNED_EVIDENCE_APPRAISAL_REVIEW_TARGETS_SHA256,
    )
    assert.equal(
      PINNED_EVIDENCE_APPRAISAL_REVIEW_TARGETS_SHA256,
      'b7fe6a8a5bf471b33e51551ab32e876a1d1ba07e5420123802b538db951327ee',
    )
    assert.deepEqual(template.entries.map(entry => entry.targetId), ['src-30', 'src-32', 'src-45'])
    for (const entry of template.entries) {
      assert.equal(entry.reviewState, 'pending_human_review')
      assert.equal(entry.status, null)
      assert.equal(entry.reviewedBy, null)
      assert.equal(entry.reviewedAt, null)
      assert.equal(entry.reviewedSourceHash, null)
      assert.deepEqual(entry.limitations, [])
    }
    assert.equal(
      template.entries.find(entry => entry.targetId === 'src-32')!.reviewArtifactPath,
      'research/evidence-pack/forskningsinstitutt/norsus-matsvinn-2024.pdf',
    )
    assert.throws(
      () => validateCompletedEvidenceAppraisalReviewManifest(template),
      /Human review remains pending for SourceDoc:src-30/,
    )
  })

  it('tracks all three review artifacts with hash-bound machine receipts and an honest storage boundary', () => {
    const receipt = readFileSync(
      'research/_status/evidence-appraisal-pilot-source-receipt-2026-07-19.md',
      'utf8',
    )
    const gitignore = readFileSync('.gitignore', 'utf8')
    const reviewerBrief = readFileSync(
      'research/review/evidence-appraisal-pilot-reviewer-brief-2026-07-19.md',
      'utf8',
    )

    assert.match(gitignore, /^research\/\*\*\/\*\.pdf$/m)
    assert.match(receipt, /`SourceDoc:src-30`/)
    assert.match(receipt, /`SourceDoc:src-32`/)
    assert.match(receipt, /`SourceDoc:src-45`/)
    assert.match(
      receipt,
      /research\/evidence-pack\/arsrapporter\/asko-barekraft-2024\.pdf/,
    )
    assert.match(
      receipt,
      /research\/evidence-pack\/forskningsinstitutt\/norsus-matsvinn-2024\.pdf/,
    )
    assert.match(receipt, /`1 374 879` \| 4 \|/)
    assert.match(
      receipt,
      /39523279d3afff6f0f41b5baea04590f2ce6499f2a2518a04fa82b29395c7fcf/,
    )
    assert.match(
      receipt,
      /research\/evidence-pack\/konsulentrapport\/oslo-economics-forsvar-2024\.pdf/,
    )
    assert.match(receipt, /18 646 489/)
    assert.match(receipt, /780 076/)
    assert.match(
      receipt,
      /94b68068c89e9713e968f3c5ef17ed0f4e74fa57206ea5dd383aac6b44529108/,
    )
    assert.match(
      receipt,
      /6155c0f06fea09224f3ec235453af91641aa99302493d97faad0f0c772ccc8de/,
    )
    assert.match(receipt, /Full-document rendering: \*\*PASS\*\* for all 70 pages/)
    assert.match(receipt, /existing tracked artifacts/)
    assert.match(receipt, /NORSUS\s+PDF is intentionally ignored/)
    assert.match(receipt, /not an EvidenceAppraisal/)
    assert.match(receipt, /named-human review dispositions/)
    assert.match(reviewerBrief, /Spørsmålene er reviewprompter, ikke ferdige bias- eller kvalitetsdommer/)
    assert.match(reviewerBrief, /reviewedSourceHash/)
    assert.match(reviewerBrief, /denne briefen gir ikke slik autorisasjon/)
  })

  it('checks the blank template without DB configuration and fails dry-run before DB access', () => {
    const script = 'scripts/review-evidence-appraisal-pilot.ts'
    const templateCheck = spawnSync(process.execPath, ['--import=tsx', script, '--template-check'], {
      encoding: 'utf8',
      env: { ...process.env, DATABASE_URL: '' },
    })
    assert.equal(templateCheck.status, 0, templateCheck.stderr)
    assert.match(templateCheck.stdout, /"readyForDatabaseDryRun": false/)
    assert.match(templateCheck.stdout, /SourceDoc:src-30/)

    const dryRun = spawnSync(process.execPath, ['--import=tsx', script, '--dry-run'], {
      encoding: 'utf8',
      env: { ...process.env, DATABASE_URL: '' },
    })
    assert.notEqual(dryRun.status, 0)
    assert.match(dryRun.stderr, /Human review remains pending/)
    assert.doesNotMatch(dryRun.stderr, /DATABASE_URL is required/)
  })

  it('requires substantive fields, exact hash, named human, date, and attestation', () => {
    const manifest = completedManifest()
    assert.equal(evidenceAppraisalCreateTargets(manifest).length, 3)

    const badReviewer = structuredClone(manifest) as unknown as EvidenceAppraisalReviewManifest
    badReviewer.entries[0]!.reviewedBy = 'Codex Reviewer'
    assert.throws(
      () => validateCompletedEvidenceAppraisalReviewManifest(badReviewer),
      /named human/,
    )

    const badHash = structuredClone(manifest) as unknown as EvidenceAppraisalReviewManifest
    badHash.entries[1]!.reviewedSourceHash = 'f'.repeat(64)
    assert.throws(
      () => validateCompletedEvidenceAppraisalReviewManifest(badHash),
      /does not match the pinned source/,
    )

    const blankMethod = structuredClone(manifest) as unknown as EvidenceAppraisalReviewManifest
    blankMethod.entries[2]!.methodologySummary = 'TBD'
    assert.throws(
      () => validateCompletedEvidenceAppraisalReviewManifest(blankMethod),
      /methodologySummary/,
    )

    const missingAttestation = structuredClone(manifest) as unknown as EvidenceAppraisalReviewManifest
    missingAttestation.entries[0]!.attestation = EXCLUDED_APPRAISAL_ATTESTATION
    assert.throws(
      () => validateCompletedEvidenceAppraisalReviewManifest(missingAttestation),
      /Reviewed attestation is missing/,
    )

    const futureReview = structuredClone(manifest) as unknown as EvidenceAppraisalReviewManifest
    futureReview.entries[0]!.reviewedAt = '2099-01-01T00:00:00.000Z'
    assert.throws(
      () => validateCompletedEvidenceAppraisalReviewManifest(futureReview),
      /reviewedAt cannot be in the future/,
    )

    const excluded = structuredClone(manifest) as unknown as EvidenceAppraisalReviewManifest
    Object.assign(excluded.entries[0]!, {
      attestation: EXCLUDED_APPRAISAL_ATTESTATION,
      status: 'excluded_not_applicable',
      basis: null,
      studyDesign: null,
      studyDesignDetails: null,
      methodologySummary: null,
      sampleOrCoverage: null,
      applicability: null,
      applicabilityContext: null,
      applicabilityNotes: null,
      limitationsStatus: null,
      limitations: [],
      limitationsNotes: null,
      riskOfBias: null,
      riskOfBiasNotes: null,
      framework: null,
      frameworkVersion: null,
      reviewMethod: 'metadata_only',
      notApplicableReason: 'The record is navigation-only and is not an evidence work.',
    })
    const excludedTargets = evidenceAppraisalCreateTargets(excluded)
    assert.equal(excludedTargets.find(target => target.sourceDocId === 'src-30')!.status, 'excluded_not_applicable')
  })

  it('builds a deterministic plan over full source, citation, target, hash, and timestamp snapshots', () => {
    const manifest = completedManifest()
    const sources = sourceSnapshots(manifest)
    const citations = citationSnapshots(manifest)
    const plan = buildEvidenceAppraisalReviewPlan(manifest, sources, citations, [])
    assert.deepEqual(plan.summary, {
      total: 3,
      pendingCreates: 3,
      alreadyApplied: 0,
      conflicts: 0,
    })
    for (const row of plan.rows) {
      assert.match(row.sourceSnapshotSha256!, /^[a-f0-9]{64}$/u)
      assert.match(row.citationSnapshotSha256!, /^[a-f0-9]{64}$/u)
      assert.match(row.targetRowSha256, /^[a-f0-9]{64}$/u)
      assert.equal(row.citationSnapshot!.updatedAt, '2026-07-19T20:01:00.000Z')
      assert.equal(row.citationSnapshot!.fieldCitations.length, 1)
    }

    const reversed = buildEvidenceAppraisalReviewPlan(
      { ...manifest, entries: [...manifest.entries].reverse() },
      [...sources].reverse(),
      [...citations].reverse(),
      [],
    )
    assert.deepEqual(
      evidenceAppraisalReviewPlanContract(reversed),
      evidenceAppraisalReviewPlanContract(plan),
    )
  })

  it('is create-only/idempotent and fails closed on target, citation, hash, or existing-row drift', () => {
    const manifest = completedManifest()
    const sources = sourceSnapshots(manifest)
    const citations = citationSnapshots(manifest)
    const applied = buildEvidenceAppraisalReviewPlan(
      manifest,
      sources,
      citations,
      databaseAppraisals(manifest),
    )
    assert.deepEqual(applied.summary, {
      total: 3,
      pendingCreates: 0,
      alreadyApplied: 3,
      conflicts: 0,
    })

    const wrongTarget = structuredClone(citations)
    wrongTarget[0]!.sourceDocId = 'src-99'
    const targetConflict = buildEvidenceAppraisalReviewPlan(manifest, sources, wrongTarget, [])
    assert.ok(targetConflict.conflicts[0]!.reasons.some(reason => /linked to src-99/.test(reason)))

    const wrongHash = structuredClone(citations)
    wrongHash[1]!.fileHash = 'a'.repeat(64)
    const hashConflict = buildEvidenceAppraisalReviewPlan(manifest, sources, wrongHash, [])
    assert.ok(hashConflict.conflicts.some(conflict =>
      conflict.reasons.some(reason => /does not carry the reviewed source hash/.test(reason))))

    const driftedAppraisal = databaseAppraisals(manifest)
    driftedAppraisal[2]!.reviewedBy = 'Another Human'
    const existingConflict = buildEvidenceAppraisalReviewPlan(
      manifest,
      sources,
      citations,
      driftedAppraisal,
    )
    assert.ok(existingConflict.conflicts.some(conflict =>
      conflict.reasons.includes('existing EvidenceAppraisal differs from the reviewed create target')))
  })

  it('enforces plan SHA, strong ACK, locks/CAS, Serializable create-only apply, and committed-only append logging', () => {
    const source = readFileSync('scripts/review-evidence-appraisal-pilot.ts', 'utf8')
    const packageJson = JSON.parse(readFileSync('package.json', 'utf8')) as {
      scripts?: Record<string, string>
    }
    assert.equal(
      packageJson.scripts?.['review:evidence-appraisal:template-check'],
      'tsx scripts/review-evidence-appraisal-pilot.ts --template-check',
    )
    assert.equal(
      packageJson.scripts?.['review:evidence-appraisal:dry-run'],
      'tsx scripts/review-evidence-appraisal-pilot.ts --dry-run',
    )
    assert.equal(
      packageJson.scripts?.['review:evidence-appraisal:apply'],
      'tsx scripts/review-evidence-appraisal-pilot.ts --apply',
    )
    assert.match(source, /--apply requires --ack=\$\{APPLY_ACK\}/)
    assert.match(source, /--plan-sha256=<64 lowercase hex>/)
    assert.match(source, /pg_advisory_xact_lock/)
    assert.match(source, /FROM "SourceDoc"[\s\S]*FOR SHARE/)
    assert.match(source, /FROM "SourceCitation"[\s\S]*FOR SHARE/)
    assert.match(source, /FROM "FieldCitation"[\s\S]*FOR SHARE/)
    assert.match(source, /FROM "EvidenceAppraisal"[\s\S]*FOR UPDATE/)
    assert.match(source, /client\.evidenceAppraisal\.count/)
    assert.match(source, /lockedDigest !== args\.expectedPlanSha256/)
    assert.match(source, /bytes = readFileSync\(artifactPath\)/)
    assert.match(source, /createHash\('sha256'\)\.update\(bytes\)\.digest\('hex'\)/)
    assert.match(source, /Reviewed PDF SHA-256 mismatch/)
    assert.match(source, /transaction\.evidenceAppraisal\.create/)
    assert.match(source, /afterPlan\.creates\.length > 0/)
    assert.match(source, /isolationLevel: 'Serializable'/)
    assert.match(source, /appendFileSync\([\s\S]*flag: 'a'/)
    assert.doesNotMatch(source, /writeFileSync|truncateSync/)
    assert.match(source, /phase: 'applied'/)
    assert.match(source, /committed: true/)
    assert.doesNotMatch(source, /phase: 'intent'/)
    assert.ok(
      source.indexOf('appendReviewEvent(reviewLogEvent') >
      source.indexOf("}, { isolationLevel: 'Serializable' })"),
      'filesystem audit evidence must only be appended after the DB transaction commits',
    )
    assert.ok(
      source.indexOf('validateCompletedEvidenceAppraisalReviewManifest') <
      source.indexOf("if (!process.env.DATABASE_URL)"),
      'blank review must fail before database configuration or client construction',
    )
    assert.doesNotMatch(
      source,
      /evidenceAppraisal\.(?:update|updateMany|upsert|delete|deleteMany|createMany)\s*\(/,
    )
  })
})
