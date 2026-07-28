import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { describe, it } from 'node:test'
import { reports } from '../../prisma/seed-data/reports'
import { REVIEWED_PROVENANCE_MANIFEST } from '../../src/lib/citations/reviewed-provenance-batch'
import { REVIEWED_PROVENANCE_COMPLETION_MANIFEST } from '../../src/lib/citations/reviewed-provenance-completion'
import {
  PINNED_REVIEWED_REPORT_PROVENANCE_CORRECTION_MANIFEST_SHA256,
  REVIEWED_REPORT_PROVENANCE_CORRECTION_MANIFEST,
  REVIEWED_REPORT_PROVENANCE_CORRECTION_MANIFEST_SHA256,
  REVIEWED_REPORT_PROVENANCE_CORRECTION_TARGET_COUNT,
  type ReviewedReportProvenanceCorrectionManifestEntry,
  applyReviewedReportProvenanceCorrectionsToSeed,
  validateReviewedReportProvenanceCorrectionManifest,
} from '../../src/lib/citations/reviewed-report-provenance-corrections'

const EXPECTED_TARGETS = {
  'beredskap-finsk-modell-hvk': 'composite_source',
  'is-markedsstruktur-2024': 'composite_source',
  'kbh-food-strategy-madhus': 'composite_source',
  'kt-markedsundersokelser-2026': 'external_article',
  'plantefonden-projects-2023-2025': 'composite_source',
  'reitan-2024-25': 'blocked_source',
  'sodertaelje-diet-green-planet': 'composite_source',
} as const

const correctionById = new Map(
  REVIEWED_REPORT_PROVENANCE_CORRECTION_MANIFEST.map((entry) => [
    entry.id,
    entry,
  ]),
)

function reportsAtHistoricalProvenanceStage() {
  return reports.map((row) => {
    const correction = correctionById.get(row.id)
    return correction
      ? { ...row, provenanceType: correction.expectedCurrentType }
      : row
  })
}

describe('reviewed 7-row Report provenance seed corrections', () => {
  it('pins the exact immutable evidence-bound correction manifest', () => {
    assert.equal(
      validateReviewedReportProvenanceCorrectionManifest().length,
      REVIEWED_REPORT_PROVENANCE_CORRECTION_TARGET_COUNT,
    )
    assert.equal(REVIEWED_REPORT_PROVENANCE_CORRECTION_MANIFEST.length, 7)
    assert.deepEqual(
      Object.fromEntries(
        REVIEWED_REPORT_PROVENANCE_CORRECTION_MANIFEST.map((entry) => [
          entry.id,
          entry.targetType,
        ]),
      ),
      EXPECTED_TARGETS,
    )
    assert.equal(
      REVIEWED_REPORT_PROVENANCE_CORRECTION_MANIFEST_SHA256,
      PINNED_REVIEWED_REPORT_PROVENANCE_CORRECTION_MANIFEST_SHA256,
    )
    assert.equal(
      REVIEWED_REPORT_PROVENANCE_CORRECTION_MANIFEST_SHA256,
      '50439ce9a76fbcbd842abd7a8d101c509ad5eb1fc9a20b8ac12075b8f7326d8d',
    )
    assert.ok(Object.isFrozen(REVIEWED_REPORT_PROVENANCE_CORRECTION_MANIFEST))
    for (const entry of REVIEWED_REPORT_PROVENANCE_CORRECTION_MANIFEST) {
      assert.ok(Object.isFrozen(entry), entry.id)
      assert.ok(Object.isFrozen(entry.evidenceRefs), entry.id)
      assert.equal(entry.expectedCurrentType, 'external_report', entry.id)
      assert.ok(entry.reviewBasis.trim().length > 0, entry.id)
      assert.ok(entry.evidenceRefs.length > 0, entry.id)
      for (const evidenceRef of entry.evidenceRefs) {
        assert.ok(existsSync(evidenceRef), `${entry.id}: ${evidenceRef}`)
      }
    }
  })

  it('supersedes exactly seven historical Report rows and never overlaps completion', () => {
    const historicalReportTargets = new Map(
      REVIEWED_PROVENANCE_MANIFEST.filter(
        (entry) => entry.entity === 'Report',
      ).map((entry) => [entry.id, entry.targetType]),
    )
    const completionReportIds = new Set(
      REVIEWED_PROVENANCE_COMPLETION_MANIFEST.filter(
        (entry) => entry.entity === 'Report',
      ).map((entry) => entry.id),
    )
    for (const entry of REVIEWED_REPORT_PROVENANCE_CORRECTION_MANIFEST) {
      assert.equal(
        historicalReportTargets.get(entry.id),
        entry.expectedCurrentType,
        entry.id,
      )
      assert.equal(completionReportIds.has(entry.id), false, entry.id)
      assert.notEqual(entry.expectedCurrentType, entry.targetType, entry.id)
    }
  })

  it('fails manifest validation closed on set, evidence, entity, or transition drift', () => {
    const duplicate = [...REVIEWED_REPORT_PROVENANCE_CORRECTION_MANIFEST]
    duplicate[0] = duplicate[1]!
    assert.throws(
      () => validateReviewedReportProvenanceCorrectionManifest(duplicate),
      /must contain the exact 7 approved ids/,
    )

    const emptyEvidence = [...REVIEWED_REPORT_PROVENANCE_CORRECTION_MANIFEST]
    emptyEvidence[0] = { ...emptyEvidence[0]!, evidenceRefs: [] }
    assert.throws(
      () => validateReviewedReportProvenanceCorrectionManifest(emptyEvidence),
      /evidence contract is invalid/,
    )

    const invalidEntity = [...REVIEWED_REPORT_PROVENANCE_CORRECTION_MANIFEST]
    invalidEntity[0] = {
      ...invalidEntity[0]!,
      entity: 'SourceDoc',
    } as unknown as ReviewedReportProvenanceCorrectionManifestEntry
    assert.throws(
      () => validateReviewedReportProvenanceCorrectionManifest(invalidEntity),
      /entity is invalid/,
    )

    const noOp = [...REVIEWED_REPORT_PROVENANCE_CORRECTION_MANIFEST]
    noOp[0] = {
      ...noOp[0]!,
      targetType: noOp[0]!.expectedCurrentType,
    }
    assert.throws(
      () => validateReviewedReportProvenanceCorrectionManifest(noOp),
      /type transition is invalid/,
    )

    const historicalDrift = [
      ...REVIEWED_REPORT_PROVENANCE_CORRECTION_MANIFEST,
    ]
    historicalDrift[0] = {
      ...historicalDrift[0]!,
      expectedCurrentType: 'external_article',
    }
    assert.throws(
      () =>
        validateReviewedReportProvenanceCorrectionManifest(historicalDrift),
      /historical contract drifted/,
    )
  })

  it('materializes the corrections through the outer seed wrapper', () => {
    const reportById = new Map(reports.map((row) => [row.id, row]))
    for (const [id, targetType] of Object.entries(EXPECTED_TARGETS)) {
      assert.equal(reportById.get(id)?.provenanceType, targetType, id)
    }

    const seedSource = readFileSync('prisma/seed-data/reports.ts', 'utf8')
    assert.match(
      seedSource,
      /export const reports: Report\[\] = applyReviewedEtmvReportTitleRepairToSeed\(applyReviewedReportProvenanceCorrectionsToSeed\(applyReviewedReportProvenanceCompletionToSeed\(applyReviewedReportAccessDateBatchToSeed\(applyReviewedReportProvenanceToSeed\(\[/,
    )
  })

  it('is idempotent and changes only target provenance fields', () => {
    const historicalRows = reportsAtHistoricalProvenanceStage()
    const untouchedBefore = historicalRows.find(
      (row) => row.id === 'nou-2011-4',
    )!
    const targetBefore = historicalRows.find(
      (row) => row.id === 'beredskap-finsk-modell-hvk',
    )!
    const corrected = applyReviewedReportProvenanceCorrectionsToSeed(
      historicalRows,
    )
    assert.strictEqual(
      corrected.find((row) => row.id === 'nou-2011-4'),
      untouchedBefore,
    )
    const targetAfter = corrected.find(
      (row) => row.id === 'beredskap-finsk-modell-hvk',
    )!
    const { provenanceType: beforeType, ...beforeRest } = targetBefore
    const { provenanceType: afterType, ...afterRest } = targetAfter
    assert.equal(beforeType, 'external_report')
    assert.equal(afterType, 'composite_source')
    assert.deepEqual(afterRest, beforeRest)

    const secondPass = applyReviewedReportProvenanceCorrectionsToSeed(corrected)
    assert.deepEqual(secondPass, corrected)
    assert.ok(secondPass.every((row, index) => row === corrected[index]))
  })

  it('fails seed correction closed on missing, duplicate, or unexpected provenance', () => {
    const historicalRows = reportsAtHistoricalProvenanceStage()
    assert.throws(
      () =>
        applyReviewedReportProvenanceCorrectionsToSeed(
          historicalRows.filter(
            (row) => row.id !== 'beredskap-finsk-modell-hvk',
          ),
        ),
      /seed rows are missing: beredskap-finsk-modell-hvk/,
    )
    assert.throws(
      () =>
        applyReviewedReportProvenanceCorrectionsToSeed([
          ...historicalRows,
          historicalRows.find(
            (row) => row.id === 'beredskap-finsk-modell-hvk',
          )!,
        ]),
      /Duplicate reviewed Report provenance correction seed id: beredskap-finsk-modell-hvk/,
    )
    assert.throws(
      () =>
        applyReviewedReportProvenanceCorrectionsToSeed(
          historicalRows.map((row) =>
            row.id === 'beredskap-finsk-modell-hvk'
              ? { ...row, provenanceType: 'internal_register' as const }
              : row,
          ),
        ),
      /seed conflict: beredskap-finsk-modell-hvk/,
    )
  })
})
