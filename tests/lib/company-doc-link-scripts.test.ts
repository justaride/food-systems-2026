import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { describe, it } from 'node:test'

import { isCompanyDocumentEvidenceCandidate } from '../../src/lib/company-document-linking'

describe('company doc link script', () => {
  it('supports a deterministic-only mode that excludes weak content matches', () => {
    const source = readFileSync('scripts/link-tracked-company-docs.ts', 'utf8')

    assert.match(source, /DETERMINISTIC_ONLY/)
    assert.match(source, /--deterministic-only/)
    assert.match(source, /match\.strength < 3/)
  })

  it('excludes internal audit, review, and prompt artifacts from automatic company links', () => {
    assert.equal(
      isCompanyDocumentEvidenceCandidate({
        title: 'Company extraction audit',
        filePath: 'COMPANY-EXTRACTION-AUDIT.md',
      }),
      false,
    )
    assert.equal(
      isCompanyDocumentEvidenceCandidate({
        title: 'Insight → Document koblingskandidater',
        filePath: '_status/insight-doc-link-review-2026-05-11.md',
      }),
      false,
    )
    assert.equal(
      isCompanyDocumentEvidenceCandidate({
        title:
          'Jeg trenger en oversikt over hvilke nøkkelindikatorer (KPI-er) som brukes operativt for å måle sirkularitet i nordiske matsystemer',
        filePath: 'perplexity-20-04-26/kpi-sirkularitet-offentlig-privat.md',
      }),
      false,
    )
  })

  it('keeps source-like annual reports and regulatory documents eligible', () => {
    assert.equal(
      isCompanyDocumentEvidenceCandidate({
        title: 'Sammendrag: Axfood årsrapport 2024',
        filePath: 'evidence-pack/annual-reports/axfood-2024.md',
      }),
      true,
    )
    assert.equal(
      isCompanyDocumentEvidenceCandidate({
        title: 'Kartlegging av innkjopspriser 2017-2023',
        filePath: 'evidence-pack/tilsyn/innkjopspriser-2017-2023.pdf',
      }),
      true,
    )
  })
})
