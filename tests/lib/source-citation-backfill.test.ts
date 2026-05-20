import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  buildCitationBackfillPlan,
  fieldCitationDuplicateKey,
  formatBackfillPreviewCsv,
  parseCitationLocator,
  sourceCitationDuplicateKey,
} from '../../src/lib/citations/source-citation-backfill'

describe('source citation backfill helpers', () => {
  it('parses existing locator forms without inventing new source evidence', () => {
    assert.deepEqual(parseCitationLocator('https://example.com/report.pdf'), {
      url: 'https://example.com/report.pdf',
    })
    assert.deepEqual(parseCitationLocator('www.example.com/report.pdf'), {
      url: 'https://www.example.com/report.pdf',
    })
    assert.deepEqual(parseCitationLocator('ssb.no/grensehandel'), {
      url: 'https://ssb.no/grensehandel',
    })
    assert.deepEqual(parseCitationLocator('doi:10.1000/example'), {
      url: 'https://doi.org/10.1000/example',
    })
    assert.deepEqual(parseCitationLocator('research/reports/local-report.pdf'), {
      localPath: 'research/reports/local-report.pdf',
    })
    assert.deepEqual(
      parseCitationLocator('document:nordic-report', {
        documentsByRef: new Map([
          ['nordic-report', { id: 'doc-1', filePath: 'research/report.pdf' }],
        ]),
      }),
      {
        documentId: 'doc-1',
        localPath: 'research/report.pdf',
      },
    )
    assert.deepEqual(parseCitationLocator('Landbruksdirektoratet'), null)
    assert.deepEqual(parseCitationLocator('KKV FCCA 2024 / PTY'), null)
  })

  it('uses the planned duplicate keys for source and field citations', () => {
    assert.equal(
      sourceCitationDuplicateKey({
        documentId: 'doc-1',
        localPath: 'research/report.pdf',
        url: 'https://example.com/report.pdf',
        citationText: 'Report',
      }),
      'document:doc-1|local:research/report.pdf|url:https://example.com/report.pdf|text:Report',
    )
    assert.equal(
      sourceCitationDuplicateKey({
        sourceDocId: 'src-1',
        url: 'https://example.com/source',
        citationText: 'Source doc',
      }),
      'sourcedoc:src-1|url:https://example.com/source|text:Source doc',
    )
    assert.equal(
      fieldCitationDuplicateKey({
        citationId: 'cit-1',
        entityType: 'Report',
        entityId: 'report-1',
        fieldPath: 'sourceUrl',
      }),
      'citation:cit-1|entity:Report|id:report-1|field:sourceUrl',
    )
  })

  it('plans dry-run creates, duplicate skips, and label-only blocks fail-closed', () => {
    const plan = buildCitationBackfillPlan(
      [
        {
          entityType: 'Report',
          entityId: 'report-1',
          fieldPath: 'sourceUrl',
          citationText: 'Primary report',
          locator: 'https://example.com/report.pdf',
          sourceClass: 'primary',
          accessedAt: '2026-05-20T00:00:00.000Z',
        },
        {
          entityType: 'Report',
          entityId: 'report-2',
          fieldPath: 'sourceUrl',
          citationText: 'Existing report',
          locator: 'https://example.com/existing.pdf',
          sourceClass: 'primary',
          accessedAt: '2026-05-20T00:00:00.000Z',
        },
        {
          entityType: 'Report',
          entityId: 'report-2',
          fieldPath: 'sourceUrl',
          citationText: 'Existing report',
          locator: 'https://example.com/existing.pdf',
          sourceClass: 'primary',
          accessedAt: '2026-05-20T00:00:00.000Z',
        },
        {
          entityType: 'CompanyFinancial',
          entityId: 'financial-1',
          fieldPath: 'source',
          citationText: 'Årsrapport 2024',
          locator: 'Årsrapport 2024',
          sourceClass: 'primary',
        },
      ],
      {
        existingSourceCitationIdsByKey: new Map([
          ['document:|local:|url:https://example.com/existing.pdf|text:Existing report', 'cit-existing'],
        ]),
        existingFieldCitationKeys: new Set(),
      },
    )

    assert.equal(plan.sourceCitationsToCreate.length, 1)
    assert.equal(plan.fieldCitationsToCreate.length, 2)
    assert.equal(plan.skippedDuplicateSourceCitations, 2)
    assert.equal(plan.skippedDuplicateFieldCitations, 1)
    assert.equal(plan.blockedLabelOnly, 1)
    assert.equal(plan.sourceCitationsToCreate[0].citationReadiness, 'citable_external')
    assert.deepEqual(
      plan.previewRows.map(row => row.status),
      ['create', 'duplicate_source_create_field', 'duplicate_field', 'blocked_label_only'],
    )
  })

  it('formats preview CSV with stable headers and escaped values', () => {
    const csv = formatBackfillPreviewCsv([
      {
        status: 'blocked_label_only',
        entityType: 'CompanyFinancial',
        entityId: 'financial-1',
        fieldPath: 'source',
        citationText: 'Årsrapport, 2024',
        locator: 'Årsrapport 2024',
        resolvedLocator: '',
        citationReadiness: 'blocked_unsourced',
        reason: 'label-only source has no existing locator',
      },
    ])

    assert.match(csv, /^status,entityType,entityId,fieldPath,citationText,locator,/)
    assert.match(csv, /"Årsrapport, 2024"/)
  })
})
