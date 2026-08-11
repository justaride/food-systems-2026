import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { reports } from '../../prisma/seed-data/reports'
import { sources } from '../../prisma/seed-data/sources'
import { REVIEWED_PROVENANCE_MANIFEST } from '../../src/lib/citations/reviewed-provenance-batch'
import {
  PINNED_REVIEWED_PROVENANCE_COMPLETION_MANIFEST_SHA256,
  REVIEWED_PROVENANCE_COMPLETION_MANIFEST,
  REVIEWED_PROVENANCE_COMPLETION_MANIFEST_SHA256,
  REVIEWED_PROVENANCE_COMPLETION_REPORT_TARGET_COUNT,
  REVIEWED_PROVENANCE_COMPLETION_SOURCE_DOC_TARGET_COUNT,
  REVIEWED_PROVENANCE_COMPLETION_TARGET_COUNT,
  type ReviewedProvenanceCompletionManifestEntry,
  applyReviewedReportProvenanceCompletionToSeed,
  applyReviewedSourceDocProvenanceCompletionToSeed,
  assertReviewedProvenanceCompletionStateIsAtomic,
  classifyReviewedProvenanceCompletionCurrent,
  sha256ReviewedProvenanceCompletionJson,
  validateReviewedProvenanceCompletionManifest,
} from '../../src/lib/citations/reviewed-provenance-completion'

const EXPECTED_REPORT_TARGETS = {
  'akademia-nhh-butikkstruktur-2024': 'internal_synthesis',
  'akademia-nhh-foros-media-2025': 'blocked_source',
  'akademia-nhh-matbors-historie': 'internal_synthesis',
  'akademia-sifo-kundeprogram-2026': 'external_report',
  'akademia-sifo-retail-media-2025': 'internal_synthesis',
  'akademia-uib-kjopermakt': 'blocked_source',
  'coop-2024': 'external_report',
  'coop-norge-2024': 'blocked_source',
  'dk-salling-coop-decision-2025': 'external_report',
  'emv-kartlegging-2023': 'external_report',
  'fivh-etikk-2025': 'internal_synthesis',
  'kfst-salling-coop-2025': 'blocked_source',
  'nbs-systemkritikk': 'composite_source',
  'soa-emv-2023': 'blocked_source',
} as const

const EXPECTED_SOURCE_DOC_TARGETS = {
  'src-7': 'internal_primary',
  'src-20': 'external_publication',
  'src-21': 'commissioned_report',
  'src-23': 'external_publication',
  'src-34': 'internal_synthesis',
  'src-51': 'internal_synthesis',
  'src-52': 'internal_synthesis',
  'src-79': 'official_primary',
  'src-81': 'official_primary',
  'src-82': 'advocacy_position',
  'src-83': 'advocacy_position',
  'src-86': 'external_publication',
  'src-90': 'external_publication',
  'src-91': 'commissioned_report',
  'src-98': 'official_primary',
  'src-99': 'official_primary',
  'src-107': 'internal_primary',
  'src-108': 'internal_primary',
  'src-136': 'internal_synthesis',
  'src-147': 'commissioned_report',
  'src-150': 'commissioned_report',
  'src-158': 'advocacy_position',
  'src-163': 'advocacy_position',
  'src-170': 'commissioned_report',
  'src-182': 'commissioned_report',
} as const

describe('reviewed 39-row provenance completion', () => {
  it('pins one immutable, evidence-bound manifest with the exact reviewed mappings', () => {
    assert.equal(
      validateReviewedProvenanceCompletionManifest().length,
      REVIEWED_PROVENANCE_COMPLETION_TARGET_COUNT,
    )
    assert.equal(REVIEWED_PROVENANCE_COMPLETION_MANIFEST.length, 39)
    assert.equal(
      new Set(
        REVIEWED_PROVENANCE_COMPLETION_MANIFEST.map(
          (row) => `${row.entity}:${row.id}`,
        ),
      ).size,
      39,
    )
    assert.equal(
      REVIEWED_PROVENANCE_COMPLETION_MANIFEST_SHA256,
      PINNED_REVIEWED_PROVENANCE_COMPLETION_MANIFEST_SHA256,
    )
    assert.equal(
      REVIEWED_PROVENANCE_COMPLETION_MANIFEST_SHA256,
      'de6a42f76e16615808d93888b611199d4de22afd37c9a0d0ceee9cae332a043b',
    )
    assert.ok(Object.isFrozen(REVIEWED_PROVENANCE_COMPLETION_MANIFEST))
    assert.ok(
      REVIEWED_PROVENANCE_COMPLETION_MANIFEST.every(
        (row) => Object.isFrozen(row) && row.reviewBasis.trim().length > 0,
      ),
    )

    const reportRows = REVIEWED_PROVENANCE_COMPLETION_MANIFEST.filter(
      (row) => row.entity === 'Report',
    )
    const sourceRows = REVIEWED_PROVENANCE_COMPLETION_MANIFEST.filter(
      (row) => row.entity === 'SourceDoc',
    )
    assert.equal(
      reportRows.length,
      REVIEWED_PROVENANCE_COMPLETION_REPORT_TARGET_COUNT,
    )
    assert.equal(
      sourceRows.length,
      REVIEWED_PROVENANCE_COMPLETION_SOURCE_DOC_TARGET_COUNT,
    )
    assert.deepEqual(
      Object.fromEntries(reportRows.map((row) => [row.id, row.targetType])),
      EXPECTED_REPORT_TARGETS,
    )
    assert.deepEqual(
      Object.fromEntries(sourceRows.map((row) => [row.id, row.targetType])),
      EXPECTED_SOURCE_DOC_TARGETS,
    )

    const historicalKeys = new Set(
      REVIEWED_PROVENANCE_MANIFEST.map((row) => `${row.entity}:${row.id}`),
    )
    assert.ok(
      REVIEWED_PROVENANCE_COMPLETION_MANIFEST.every(
        (row) => !historicalKeys.has(`${row.entity}:${row.id}`),
      ),
    )
    assert.ok(
      !REVIEWED_PROVENANCE_COMPLETION_MANIFEST.some(
        (row) => row.entity === 'SourceDoc' && ['src-77', 'src-87'].includes(row.id),
      ),
    )
  })

  it('fails manifest validation closed on overlap, empty evidence, or invalid entity type', () => {
    const firstReportIndex = REVIEWED_PROVENANCE_COMPLETION_MANIFEST.findIndex(
      (row) => row.entity === 'Report',
    )

    const overlap = [...REVIEWED_PROVENANCE_COMPLETION_MANIFEST]
    overlap[firstReportIndex] = {
      entity: 'Report',
      id: 'nou-2011-4',
      targetType: 'external_report',
      reviewBasis: 'Deliberate historical overlap for validation testing.',
    }
    assert.throws(
      () => validateReviewedProvenanceCompletionManifest(overlap),
      /overlaps the historical manifest: Report:nou-2011-4/,
    )

    const emptyBasis = [...REVIEWED_PROVENANCE_COMPLETION_MANIFEST]
    emptyBasis[firstReportIndex] = {
      ...emptyBasis[firstReportIndex]!,
      reviewBasis: '   ',
    }
    assert.throws(
      () => validateReviewedProvenanceCompletionManifest(emptyBasis),
      /requires nonempty id and reviewBasis/,
    )

    const invalidTarget = [...REVIEWED_PROVENANCE_COMPLETION_MANIFEST]
    invalidTarget[firstReportIndex] = {
      ...invalidTarget[firstReportIndex]!,
      targetType: 'official_primary',
    } as unknown as ReviewedProvenanceCompletionManifestEntry
    assert.throws(
      () => validateReviewedProvenanceCompletionManifest(invalidTarget),
      /target type is invalid for Report/,
    )
  })

  it('materializes every reviewed seed target and leaves only src-77 and src-87 unresolved', () => {
    const reportById = new Map(reports.map((row) => [row.id, row]))
    const sourceById = new Map(sources.map((row) => [row.id, row]))
    for (const entry of REVIEWED_PROVENANCE_COMPLETION_MANIFEST) {
      const row =
        entry.entity === 'Report'
          ? reportById.get(entry.id)
          : sourceById.get(entry.id)
      assert.equal(
        row?.provenanceType,
        entry.targetType,
        `${entry.entity}:${entry.id}`,
      )
    }

    assert.deepEqual(
      reports.filter((row) => row.provenanceType == null).map((row) => row.id),
      [],
    )
    assert.deepEqual(
      sources
        .filter(
          (row) =>
            row.provenanceType == null || row.provenanceType === 'unknown',
        )
        .map((row) => row.id)
        .sort(),
      ['src-77', 'src-87'],
    )
  })

  it('accepts pending or target seed values and fails closed on missing, duplicate, or conflicting targets', () => {
    const pendingReport = reports.map((row) =>
      row.id === 'coop-2024' ? { ...row, provenanceType: undefined } : row,
    )
    assert.equal(
      applyReviewedReportProvenanceCompletionToSeed(pendingReport).find(
        (row) => row.id === 'coop-2024',
      )?.provenanceType,
      'external_report',
    )
    assert.throws(
      () =>
        applyReviewedReportProvenanceCompletionToSeed(
          reports.filter((row) => row.id !== 'coop-2024'),
        ),
      /Report seed rows are missing: coop-2024/,
    )
    assert.throws(
      () =>
        applyReviewedReportProvenanceCompletionToSeed([
          ...reports,
          reports.find((row) => row.id === 'coop-2024')!,
        ]),
      /Duplicate reviewed provenance completion Report seed id: coop-2024/,
    )
    assert.throws(
      () =>
        applyReviewedReportProvenanceCompletionToSeed(
          reports.map((row) =>
            row.id === 'coop-2024'
              ? { ...row, provenanceType: 'internal_register' as const }
              : row,
          ),
        ),
      /Reviewed provenance completion Report seed conflict: coop-2024/,
    )

    const pendingSource = sources.map((row) =>
      row.id === 'src-20'
        ? { ...row, provenanceType: 'unknown' as const }
        : row,
    )
    assert.equal(
      applyReviewedSourceDocProvenanceCompletionToSeed(pendingSource).find(
        (row) => row.id === 'src-20',
      )?.provenanceType,
      'external_publication',
    )
    assert.throws(
      () =>
        applyReviewedSourceDocProvenanceCompletionToSeed(
          sources.filter((row) => row.id !== 'src-20'),
        ),
      /SourceDoc seed rows are missing: src-20/,
    )
    assert.throws(
      () =>
        applyReviewedSourceDocProvenanceCompletionToSeed([
          ...sources,
          sources.find((row) => row.id === 'src-20')!,
        ]),
      /Duplicate reviewed provenance completion SourceDoc seed id: src-20/,
    )
    assert.throws(
      () =>
        applyReviewedSourceDocProvenanceCompletionToSeed(
          sources.map((row) =>
            row.id === 'src-20'
              ? { ...row, provenanceType: 'duplicate' as const }
              : row,
          ),
        ),
      /Reviewed provenance completion SourceDoc seed conflict: src-20/,
    )
  })

  it('accepts only all-pending or all-applied database states', () => {
    const pending = REVIEWED_PROVENANCE_COMPLETION_MANIFEST.map((entry) =>
      classifyReviewedProvenanceCompletionCurrent(
        entry,
        entry.entity === 'Report' ? null : 'unknown',
      ),
    )
    const applied = REVIEWED_PROVENANCE_COMPLETION_MANIFEST.map((entry) =>
      classifyReviewedProvenanceCompletionCurrent(entry, entry.targetType),
    )
    assert.deepEqual(assertReviewedProvenanceCompletionStateIsAtomic(pending), {
      pending: 39,
      applied: 0,
    })
    assert.deepEqual(assertReviewedProvenanceCompletionStateIsAtomic(applied), {
      pending: 0,
      applied: 39,
    })
    assert.throws(
      () =>
        assertReviewedProvenanceCompletionStateIsAtomic([
          'applied',
          ...pending.slice(1),
        ]),
      /mixed\/partially applied/,
    )
    assert.throws(
      () =>
        assertReviewedProvenanceCompletionStateIsAtomic([
          'conflict',
          ...pending.slice(1),
        ]),
      /contains conflicts/,
    )

    const reportEntry = REVIEWED_PROVENANCE_COMPLETION_MANIFEST.find(
      (row) => row.entity === 'Report',
    )!
    const sourceEntry = REVIEWED_PROVENANCE_COMPLETION_MANIFEST.find(
      (row) => row.entity === 'SourceDoc',
    )!
    assert.equal(
      classifyReviewedProvenanceCompletionCurrent(reportEntry, undefined),
      'conflict',
    )
    assert.equal(
      classifyReviewedProvenanceCompletionCurrent(sourceEntry, null),
      'conflict',
    )
  })

  it('canonicalizes completion hashes deterministically', () => {
    const left = {
      z: new Date('2026-07-20T00:00:00.000Z'),
      a: [{ beta: 2, alpha: 1 }],
    }
    const right = {
      a: [{ alpha: 1, beta: 2 }],
      z: '2026-07-20T00:00:00.000Z',
    }
    assert.equal(
      sha256ReviewedProvenanceCompletionJson(left),
      sha256ReviewedProvenanceCompletionJson(right),
    )
  })
})
