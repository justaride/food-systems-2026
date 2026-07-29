import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import {
  copyFileSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { after, before, describe, it } from 'node:test'

import {
  FIELD08_GENERATION_MANIFEST_PATH,
  FIELD08_HUMAN_REVIEW_PACKET_PATH,
  FIELD08_HUMAN_REVIEW_STATUS_PATH,
  FIELD08_HUMAN_REVIEW_TEMPLATE_PATHS,
  FIELD08_INTAKE_PATH,
  FIELD08_REVIEW_MANIFEST_PATH,
  HUMAN_REVIEW_ATTESTATION,
  HUMAN_REVIEW_RECEIPT_SCHEMA_PATH,
  HUMAN_REVIEW_STATUS_SCHEMA_PATH,
  HUMAN_REVIEW_TEMPLATE_SCHEMA_PATH,
  buildHumanReviewPacket,
  buildHumanReviewStatusProjection,
  buildPendingReviewTemplates,
  canonicalSha256,
  checkHumanReviewPacket,
  checkHumanReviewStatus,
  checkPendingReviewTemplates,
  fileSha256,
  parseHumanReviewReceiptJsonl,
  validateHumanReviewReceipt,
  validateHumanReviewReceiptLog,
  writeHumanReviewPacket,
  writeHumanReviewStatus,
  writePendingReviewTemplates,
  type HumanReviewReceipt,
  type PendingReviewTemplate,
  type TargetBinding,
} from '../../scripts/knowledge/field08-human-review'

const sourceRoot = fileURLToPath(new URL('../../', import.meta.url))
let fixtureRoot = ''

type MutableJson = Record<string, unknown>

function copyPath(path: string) {
  const target = resolve(fixtureRoot, path)
  mkdirSync(dirname(target), { recursive: true })
  copyFileSync(resolve(sourceRoot, path), target)
}

function prepareFixture() {
  fixtureRoot = mkdtempSync(resolve(tmpdir(), 'field08-human-review-'))
  for (const path of [
    FIELD08_INTAKE_PATH,
    FIELD08_GENERATION_MANIFEST_PATH,
    FIELD08_REVIEW_MANIFEST_PATH,
    HUMAN_REVIEW_RECEIPT_SCHEMA_PATH,
    HUMAN_REVIEW_TEMPLATE_SCHEMA_PATH,
    HUMAN_REVIEW_STATUS_SCHEMA_PATH,
  ]) copyPath(path)

  const intake = JSON.parse(
    readFileSync(resolve(fixtureRoot, FIELD08_INTAKE_PATH), 'utf8'),
  ) as MutableJson
  const reviewPath = resolve(fixtureRoot, FIELD08_REVIEW_MANIFEST_PATH)
  const review = JSON.parse(readFileSync(reviewPath, 'utf8')) as MutableJson
  review.appraisalDrafts = structuredClone(intake.appraisalDrafts)
  const reviewGates = structuredClone(intake.reviewGates) as Array<{ gateType: string }>
  reviewGates.sort((left, right) => left.gateType.localeCompare(right.gateType))
  review.reviewGates = reviewGates
  const { contentHash: _reviewContentHash, ...reviewPayload } = review
  review.contentHash = canonicalSha256(reviewPayload)
  writeFileSync(reviewPath, `${JSON.stringify(review, null, 2)}\n`)

  const generationPath = resolve(fixtureRoot, FIELD08_GENERATION_MANIFEST_PATH)
  const generation = JSON.parse(readFileSync(generationPath, 'utf8')) as MutableJson
  const inputSnapshots = generation.inputSnapshots as Array<{
    path: string
    entries: Array<{ path: string; sha256: string }>
  }>
  const intakeHash = fileSha256(readFileSync(resolve(fixtureRoot, FIELD08_INTAKE_PATH)))
  const intakeSnapshot = inputSnapshots.find((item) => item.path === FIELD08_INTAKE_PATH)
  const intakeEntry = intakeSnapshot?.entries.find((item) => item.path === FIELD08_INTAKE_PATH)
  assert.ok(intakeEntry)
  intakeEntry.sha256 = intakeHash

  const outputs = generation.outputs as Array<{ path: string; sha256: string }>
  const reviewOutput = outputs.find((item) => item.path === FIELD08_REVIEW_MANIFEST_PATH)
  assert.ok(reviewOutput)
  reviewOutput.sha256 = fileSha256(readFileSync(resolve(fixtureRoot, FIELD08_REVIEW_MANIFEST_PATH)))

  const { contentHash: _contentHash, ...generationPayload } = generation
  generation.contentHash = canonicalSha256(generationPayload)
  writeFileSync(generationPath, `${JSON.stringify(generation, null, 2)}\n`)
}

function commonTargetDecision(binding: TargetBinding, disposition = 'verified_as_scoped') {
  return {
    ...binding,
    disposition,
    rationale: 'The named reviewer checked this exact target against its declared scope and evidence.',
    resolution: disposition === 'resolved'
      ? 'The competing values were resolved to the exact source-supported target recorded here.'
      : null,
    amendments: disposition === 'amendments_required'
      ? ['Revise the target wording and boundary before it is used in internal analysis.']
      : [],
    newSourceRequirements: ['needs_new_source', 'deferred_insufficient_evidence'].includes(disposition)
      ? ['Obtain an authoritative source that explicitly resolves the missing evidence boundary.']
      : [],
  }
}

function receiptPayload(template: PendingReviewTemplate): Omit<HumanReviewReceipt, 'contentHash'> {
  const reviewer = {
    name: 'Kari Nordmann',
    role: template.requiredReviewerRole,
    qualifications: ['Documented domain and quantitative evidence-review experience'],
    affiliation: 'Independent food-systems review panel',
    conflictOfInterest: { status: 'none_declared' as const, details: null },
    reviewedAt: '2020-01-01T12:00:00.000Z',
    attestation: HUMAN_REVIEW_ATTESTATION as typeof HUMAN_REVIEW_ATTESTATION,
  }
  const common = {
    documentType: 'field08_human_review_receipt' as const,
    schemaVersion: '1.0.0' as const,
    receiptId: `review_receipt.field08.${template.templateId.split('.')[2]}.2020-01-01.kari-nordmann`,
    sequence: 1,
    supersedesReceiptId: null,
    previousReceiptHash: null,
    status: 'human_review_recorded' as const,
    sourceCommit: template.sourceCommit,
    evidencePackage: template.evidencePackage,
    evidencePackageHash: template.evidencePackageHash,
    reviewGateId: template.reviewGateId,
    gateType: template.gateType,
    reviewer,
    externalGatePassed: false as const,
    coveragePromotionAllowed: false as const,
  }

  if (template.gateType === 'boundary_reconciliation') {
    return {
      ...common,
      gateType: template.gateType,
      review: {
        gateType: template.gateType,
        targetDecisions: template.targetBindings.map((binding) => commonTargetDecision(binding)),
      },
    }
  }
  if (template.gateType === 'contradiction_resolution') {
    return {
      ...common,
      gateType: template.gateType,
      review: {
        gateType: template.gateType,
        targetDecisions: template.targetBindings.map((binding) => commonTargetDecision(binding, 'resolved')),
      },
    }
  }
  if (template.gateType === 'method_appraisal') {
    return {
      ...common,
      gateType: template.gateType,
      review: {
        gateType: template.gateType,
        sourceAppraisalDecisions: template.sourceAppraisalBindings.map((binding) => ({
          ...binding,
          disposition: 'verified_as_scoped',
          rationale: 'The named reviewer appraised this exact source and its paired draft as scoped.',
          amendments: [],
          newSourceRequirements: [],
          appraisal: {
            basis: 'official_primary',
            studyDesign: 'descriptive_document',
            methodologySummary: 'The review assessed the complete declared methodology and estimation approach.',
            sampleOrCoverage: 'The review covered the complete captured publication and its stated universe.',
            applicability: 'limited',
            applicabilityNotes: 'Use is limited to the declared geography, period, indicators, and system boundary.',
            limitations: ['The source remains bounded by its declared exclusions and unresolved uncertainty.'],
            riskOfBias: 'some_concerns',
            riskOfBiasNotes: 'Institutional authority does not remove measurement and reporting limitations.',
            reviewMethod: 'full_text',
          },
        })),
      },
    }
  }
  return {
    ...common,
    gateType: template.gateType,
    review: {
      gateType: template.gateType,
      targetDecisions: template.targetBindings.map((binding) => commonTargetDecision(binding)),
      locatorDecisions: template.locatorBindings.map(({ locator: _locator, ...binding }) => ({
        ...binding,
        disposition: 'verified_as_scoped',
        exactLocatorInspected: true,
        definitionPeriodUnitChecked: true,
        methodUniverseBoundaryChecked: true,
        uncertaintyLimitationsChecked: true,
        rationale: 'The named reviewer opened this exact locator and completed every required evidence check.',
        amendments: [],
        newSourceRequirements: [],
      })),
    },
  }
}

function completeReceipt(template: PendingReviewTemplate): HumanReviewReceipt {
  const payload = receiptPayload(template)
  return { ...payload, contentHash: canonicalSha256(payload) } as HumanReviewReceipt
}

function rehash(receipt: HumanReviewReceipt): HumanReviewReceipt {
  const { contentHash: _contentHash, ...payload } = receipt
  return { ...payload, contentHash: canonicalSha256(payload) } as HumanReviewReceipt
}

before(prepareFixture)
after(() => {
  if (fixtureRoot) rmSync(fixtureRoot, { recursive: true, force: true })
})

describe('Field 08 Gate 2C human-review receipts', () => {
  it('builds four hash-bound pending packets with complete gate coverage', () => {
    const templates = buildPendingReviewTemplates(fixtureRoot)
    assert.deepEqual(templates.map((item) => item.gateType), [
      'boundary_reconciliation',
      'contradiction_resolution',
      'method_appraisal',
      'ordinary_human_review',
    ])
    const boundary = templates.find((item) => item.gateType === 'boundary_reconciliation')!
    const contradictions = templates.find((item) => item.gateType === 'contradiction_resolution')!
    const method = templates.find((item) => item.gateType === 'method_appraisal')!
    const ordinary = templates.find((item) => item.gateType === 'ordinary_human_review')!
    assert.equal(boundary.targetBindings.length, 13)
    assert.equal(contradictions.targetBindings.length, 4)
    assert.equal(method.targetBindings.length, 10)
    assert.equal(method.sourceAppraisalBindings.length, 5)
    assert.equal(ordinary.targetBindings.length, 85)
    assert.equal(ordinary.locatorBindings.length, 17)
    assert.equal(new Set(ordinary.locatorBindings.map((item) => item.citationId)).size, 17)
    for (const template of templates) {
      assert.equal(template.evidencePackage.sourceBindings.length, 5)
      assert.equal(template.evidencePackage.locatorBindings.length, 17)
      assert.equal(template.externalGatePassed, false)
      assert.equal(template.coveragePromotionAllowed, false)
      assert.equal(template.contentHash, canonicalSha256((({ contentHash: _, ...rest }) => rest)(template)))
    }
  })

  it('rejects a rehashed review manifest that drops one ordinary acquisition target', () => {
    const reviewPath = resolve(fixtureRoot, FIELD08_REVIEW_MANIFEST_PATH)
    const generationPath = resolve(fixtureRoot, FIELD08_GENERATION_MANIFEST_PATH)
    const originalReview = readFileSync(reviewPath, 'utf8')
    const originalGeneration = readFileSync(generationPath, 'utf8')
    try {
      const review = JSON.parse(originalReview) as MutableJson
      const reviewGates = review.reviewGates as Array<{
        gateType: string
        targetIds: string[]
      }>
      const ordinary = reviewGates.find((gate) => gate.gateType === 'ordinary_human_review')
      assert.ok(ordinary)
      const acquisitionId = ordinary.targetIds.find((id) => id.startsWith('acq.field08.'))
      assert.ok(acquisitionId)
      ordinary.targetIds = ordinary.targetIds.filter((id) => id !== acquisitionId)
      const { contentHash: _reviewHash, ...reviewPayload } = review
      review.contentHash = canonicalSha256(reviewPayload)
      writeFileSync(reviewPath, `${JSON.stringify(review, null, 2)}\n`)

      const generation = JSON.parse(originalGeneration) as MutableJson
      const outputs = generation.outputs as Array<{ path: string; sha256: string }>
      const reviewOutput = outputs.find((item) => item.path === FIELD08_REVIEW_MANIFEST_PATH)
      assert.ok(reviewOutput)
      reviewOutput.sha256 = fileSha256(readFileSync(reviewPath))
      const { contentHash: _generationHash, ...generationPayload } = generation
      generation.contentHash = canonicalSha256(generationPayload)
      writeFileSync(generationPath, `${JSON.stringify(generation, null, 2)}\n`)

      assert.throws(
        () => buildPendingReviewTemplates(fixtureRoot),
        /review gates do not exactly match the evidence intake/,
      )
    } finally {
      writeFileSync(reviewPath, originalReview)
      writeFileSync(generationPath, originalGeneration)
    }
  })

  it('writes and checks deterministic pending templates without creating a receipt', () => {
    const written = writePendingReviewTemplates(fixtureRoot)
    assert.equal(written.length, 4)
    assert.deepEqual(checkPendingReviewTemplates(fixtureRoot), written)
    for (const path of Object.values(FIELD08_HUMAN_REVIEW_TEMPLATE_PATHS)) {
      const template = JSON.parse(readFileSync(resolve(fixtureRoot, path), 'utf8')) as PendingReviewTemplate
      assert.equal(template.status, 'pending_human_review')
      assert.equal('reviewer' in template, false)
    }
  })

  it('builds and checks one deterministic reviewer-facing packet covering every review surface', () => {
    const intake = JSON.parse(
      readFileSync(resolve(fixtureRoot, FIELD08_INTAKE_PATH), 'utf8'),
    ) as {
      sourceAcquisitions: Array<{ acquisitionId: string; sourceId: string; citationId: string }>
      claimCandidates: Array<{ claimId: string }>
      measurementCandidates: Array<{ observationId: string }>
      contradictionSets: Array<{ contradictionSetId: string }>
      appraisalDrafts: Array<{ appraisalDraftId: string }>
    }
    const packet = buildHumanReviewPacket(fixtureRoot)
    assert.equal(packet.endsWith('\n\n'), false)
    assert.equal((packet.match(/^## Source \d+ of 5:/gm) ?? []).length, 5)
    assert.match(packet, /5 sources; 17 exact locators; 34 claims; 29 observations; 4 contradiction sets; 5 appraisal drafts/)
    for (const acquisition of intake.sourceAcquisitions) {
      assert.ok(packet.includes(acquisition.acquisitionId))
      assert.ok(packet.includes(acquisition.citationId))
    }
    for (const claim of intake.claimCandidates) assert.ok(packet.includes(claim.claimId))
    for (const observation of intake.measurementCandidates) assert.ok(packet.includes(observation.observationId))
    for (const contradiction of intake.contradictionSets) {
      assert.ok(packet.includes(contradiction.contradictionSetId))
    }
    for (const appraisal of intake.appraisalDrafts) assert.ok(packet.includes(appraisal.appraisalDraftId))
    assert.equal(writeHumanReviewPacket(fixtureRoot), FIELD08_HUMAN_REVIEW_PACKET_PATH)
    assert.equal(checkHumanReviewPacket(fixtureRoot), FIELD08_HUMAN_REVIEW_PACKET_PATH)
  })

  it('accepts four complete named-human receipts but keeps all downstream promotion gates false', () => {
    const templates = buildPendingReviewTemplates(fixtureRoot)
    const receipts = templates.map(completeReceipt)
    validateHumanReviewReceiptLog(fixtureRoot, receipts, new Date('2030-01-01T00:00:00.000Z'))
    const projection = buildHumanReviewStatusProjection(
      fixtureRoot,
      receipts,
      new Date('2030-01-01T00:00:00.000Z'),
    )
    assert.equal(projection.packageStatus, 'human_review_complete_internal_only')
    assert.equal(projection.receiptCount, 4)
    assert.equal(projection.outstandingReviewGateIds.length, 0)
    assert.ok(projection.gateStatuses.every((gate) => gate.status === 'reviewed_resolved'))
    assert.equal(projection.externalGatePassed, false)
    assert.equal(projection.coveragePromotionAllowed, false)
    const deterministicProjection = buildHumanReviewStatusProjection(fixtureRoot, receipts)
    const generation = JSON.parse(
      readFileSync(resolve(fixtureRoot, FIELD08_GENERATION_MANIFEST_PATH), 'utf8'),
    ) as { generatedAt: string }
    assert.equal(
      deterministicProjection.generatedAt,
      new Date(generation.generatedAt).toISOString(),
    )
    assert.throws(
      () => buildHumanReviewStatusProjection(
        fixtureRoot,
        receipts,
        new Date('2021-01-01T00:00:00.000Z'),
      ),
      /cannot predate the bound package or any receipt/,
    )
  })

  it('projects an empty append-only log as pending', () => {
    const projection = buildHumanReviewStatusProjection(
      fixtureRoot,
      [],
      new Date('2030-01-01T00:00:00.000Z'),
    )
    assert.equal(projection.packageStatus, 'human_review_pending')
    assert.equal(projection.receiptCount, 0)
    assert.equal(projection.outstandingReviewGateIds.length, 4)
    assert.ok(projection.gateStatuses.every((gate) => gate.status === 'pending'))
  })

  it('writes and checks a deterministic persisted status projection', () => {
    assert.equal(writeHumanReviewStatus(fixtureRoot, []), FIELD08_HUMAN_REVIEW_STATUS_PATH)
    assert.equal(checkHumanReviewStatus(fixtureRoot, []), FIELD08_HUMAN_REVIEW_STATUS_PATH)
    const status = JSON.parse(
      readFileSync(resolve(fixtureRoot, FIELD08_HUMAN_REVIEW_STATUS_PATH), 'utf8'),
    ) as { generatedAt: string; packageStatus: string; contentHash: string }
    const generation = JSON.parse(
      readFileSync(resolve(fixtureRoot, FIELD08_GENERATION_MANIFEST_PATH), 'utf8'),
    ) as { generatedAt: string }
    assert.equal(status.generatedAt, new Date(generation.generatedAt).toISOString())
    assert.equal(status.packageStatus, 'human_review_pending')
    assert.match(status.contentHash, /^sha256:[a-f0-9]{64}$/)
  })

  it('rejects a missing locator, drifted target hash, automation identity, and unsafe gate flags', () => {
    const ordinaryTemplate = buildPendingReviewTemplates(fixtureRoot)
      .find((item) => item.gateType === 'ordinary_human_review')!
    const ordinary = completeReceipt(ordinaryTemplate)

    const missingLocator = structuredClone(ordinary)
    assert.equal(missingLocator.review.gateType, 'ordinary_human_review')
    if (missingLocator.review.gateType !== 'ordinary_human_review') throw new Error('unexpected gate')
    missingLocator.review.locatorDecisions.pop()
    assert.throws(
      () => validateHumanReviewReceipt(fixtureRoot, rehash(missingLocator), new Date('2030-01-01')),
      /does not exactly cover its template/,
    )

    const driftedHash = structuredClone(ordinary)
    if (driftedHash.review.gateType !== 'ordinary_human_review') throw new Error('unexpected gate')
    driftedHash.review.targetDecisions[0]!.targetSha256 = `sha256:${'0'.repeat(64)}`
    assert.throws(
      () => validateHumanReviewReceipt(fixtureRoot, rehash(driftedHash), new Date('2030-01-01')),
      /does not match its immutable binding/,
    )

    const automation = structuredClone(ordinary)
    automation.reviewer.name = 'Codex Reviewer'
    assert.throws(
      () => validateHumanReviewReceipt(fixtureRoot, rehash(automation), new Date('2030-01-01')),
      /named human, not automation/,
    )

    const wrongReceiptIdentity = structuredClone(ordinary)
    wrongReceiptIdentity.receiptId =
      'review_receipt.field08.method-appraisal.2020-01-02.kari-nordmann'
    assert.throws(
      () => validateHumanReviewReceipt(
        fixtureRoot,
        rehash(wrongReceiptIdentity),
        new Date('2030-01-01'),
      ),
      /must encode its gate type and review date/,
    )

    const unsafe = structuredClone(ordinary) as unknown as MutableJson
    unsafe.externalGatePassed = true
    const { contentHash: _contentHash, ...unsafePayload } = unsafe
    unsafe.contentHash = canonicalSha256(unsafePayload)
    assert.throws(
      () => validateHumanReviewReceipt(
        fixtureRoot,
        unsafe as unknown as HumanReviewReceipt,
        new Date('2030-01-01'),
      ),
      /schema validation failed/,
    )
  })

  it('enforces exact five-pair method appraisal and substantive deferred evidence routes', () => {
    const methodTemplate = buildPendingReviewTemplates(fixtureRoot)
      .find((item) => item.gateType === 'method_appraisal')!
    const method = completeReceipt(methodTemplate)
    if (method.review.gateType !== 'method_appraisal') throw new Error('unexpected gate')
    method.review.sourceAppraisalDecisions.pop()
    assert.throws(
      () => validateHumanReviewReceipt(fixtureRoot, rehash(method), new Date('2030-01-01')),
      /does not exactly cover its template/,
    )

    const deferred = completeReceipt(methodTemplate)
    if (deferred.review.gateType !== 'method_appraisal') throw new Error('unexpected gate')
    deferred.review.sourceAppraisalDecisions[0]!.disposition = 'deferred_insufficient_evidence'
    deferred.review.sourceAppraisalDecisions[0]!.newSourceRequirements = []
    assert.throws(
      () => validateHumanReviewReceipt(fixtureRoot, rehash(deferred), new Date('2030-01-01')),
      /newSourceRequirements must describe the missing evidence/,
    )
  })

  it('requires a linear append-only supersession chain and projects retained-open decisions', () => {
    const boundaryTemplate = buildPendingReviewTemplates(fixtureRoot)
      .find((item) => item.gateType === 'boundary_reconciliation')!
    const first = completeReceipt(boundaryTemplate)
    const second = structuredClone(first)
    second.receiptId = 'review_receipt.field08.boundary-reconciliation.2020-01-02.kari-nordmann'
    second.sequence = 2
    second.supersedesReceiptId = first.receiptId
    second.previousReceiptHash = first.contentHash
    second.reviewer.reviewedAt = '2020-01-02T12:00:00.000Z'
    if (second.review.gateType !== 'boundary_reconciliation') throw new Error('unexpected gate')
    second.review.targetDecisions[0]!.disposition = 'retain_open'
    second.review.targetDecisions[0]!.rationale =
      'The exact territorial inclusion remains unstated, so the reviewer explicitly retains it as open.'
    const secondHashed = rehash(second)
    validateHumanReviewReceiptLog(
      fixtureRoot,
      [first, secondHashed],
      new Date('2030-01-01T00:00:00.000Z'),
    )
    const projection = buildHumanReviewStatusProjection(
      fixtureRoot,
      [first, secondHashed],
      new Date('2030-01-01T00:00:00.000Z'),
    )
    assert.equal(projection.packageStatus, 'human_review_recorded_open')
    assert.equal(
      projection.gateStatuses.find((gate) => gate.gateType === 'boundary_reconciliation')!.status,
      'reviewed_open',
    )

    const actionRequired = structuredClone(first)
    if (actionRequired.review.gateType !== 'boundary_reconciliation') {
      throw new Error('unexpected gate')
    }
    actionRequired.review.targetDecisions[0]!.disposition = 'amendments_required'
    actionRequired.review.targetDecisions[0]!.amendments = [
      'Revise the boundary wording before this target is used in internal analysis.',
    ]
    const actionProjection = buildHumanReviewStatusProjection(
      fixtureRoot,
      [rehash(actionRequired)],
      new Date('2030-01-01T00:00:00.000Z'),
    )
    assert.equal(actionProjection.packageStatus, 'human_review_recorded_action_required')

    const branched = structuredClone(secondHashed)
    branched.previousReceiptHash = `sha256:${'f'.repeat(64)}`
    assert.throws(
      () => validateHumanReviewReceiptLog(
        fixtureRoot,
        [first, rehash(branched)],
        new Date('2030-01-01T00:00:00.000Z'),
      ),
      /previousReceiptHash does not bind/,
    )

    const rewrittenFirst = structuredClone(first)
    if (rewrittenFirst.review.gateType !== 'boundary_reconciliation') {
      throw new Error('unexpected gate')
    }
    rewrittenFirst.review.targetDecisions[0]!.rationale =
      'This is a different but still substantive rationale for a rewritten historical receipt.'
    assert.throws(
      () => validateHumanReviewReceiptLog(
        fixtureRoot,
        [rehash(rewrittenFirst)],
        new Date('2030-01-01T00:00:00.000Z'),
        { previousReceipts: [first] },
      ),
      /mutated prior entry 1/,
    )
  })

  it('parses append-only JSONL and reports the exact bad line', () => {
    const template = buildPendingReviewTemplates(fixtureRoot)[0]!
    const receipt = completeReceipt(template)
    assert.deepEqual(parseHumanReviewReceiptJsonl(`${JSON.stringify(receipt)}\n\n`), [receipt])
    assert.throws(() => parseHumanReviewReceiptJsonl('{}\nnot-json\n'), /line 2 is invalid JSON/)
  })

  it('exposes a generation CLI that can run against an isolated coherent package', () => {
    const script = resolve(sourceRoot, 'scripts/knowledge/field08-human-review.ts')
    const tsxLoader = resolve(sourceRoot, 'node_modules/tsx/dist/loader.mjs')
    const write = spawnSync(process.execPath, [`--import=${tsxLoader}`, script, '--write-templates'], {
      cwd: fixtureRoot,
      encoding: 'utf8',
    })
    assert.equal(write.status, 0, write.stderr)
    assert.match(write.stdout, /"written"/)
    assert.match(write.stdout, /field08-human-review-packet\.v1\.md/)

    const check = spawnSync(process.execPath, [`--import=${tsxLoader}`, script, '--check-templates'], {
      cwd: fixtureRoot,
      encoding: 'utf8',
    })
    assert.equal(check.status, 0, check.stderr)
    assert.match(check.stdout, /"checked"/)

    const writeStatus = spawnSync(process.execPath, [`--import=${tsxLoader}`, script, '--write-status'], {
      cwd: fixtureRoot,
      encoding: 'utf8',
    })
    assert.equal(writeStatus.status, 0, writeStatus.stderr)
    assert.match(writeStatus.stdout, /field08-human-review-status\.v1\.json/)

    const checkStatus = spawnSync(process.execPath, [`--import=${tsxLoader}`, script, '--check-status'], {
      cwd: fixtureRoot,
      encoding: 'utf8',
    })
    assert.equal(checkStatus.status, 0, checkStatus.stderr)
    assert.match(checkStatus.stdout, /"checked"/)

    const status = spawnSync(process.execPath, [`--import=${tsxLoader}`, script, '--status'], {
      cwd: fixtureRoot,
      encoding: 'utf8',
    })
    assert.equal(status.status, 0, status.stderr)
    assert.match(status.stdout, /"packageStatus": "human_review_pending"/)
    assert.match(status.stdout, /"externalGatePassed": false/)
  })
})
