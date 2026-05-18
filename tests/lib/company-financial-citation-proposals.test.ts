import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  buildCompanyFinancialCitationProposalRows,
  formatCompanyFinancialCitationProposalCsv,
  type CompanyFinancialCitationCandidate,
} from '../../scripts/lib/company-financial-citation-proposals'

const candidates: CompanyFinancialCitationCandidate[] = [
  {
    companyName: 'NorgesGruppen ASA',
    years: [2024],
    documentPath: 'evidence-pack/arsrapporter/norgesgruppen-2024.pdf',
  },
]

describe('company financial citation proposals', () => {
  it('emits proposals only when financial row and document resolve uniquely', () => {
    const proposals = buildCompanyFinancialCitationProposalRows({
      candidates,
      documents: [
        {
          id: 'doc-ng',
          title: 'NorgesGruppen 2024',
          filePath: 'evidence-pack/arsrapporter/norgesgruppen-2024.pdf',
          url: 'https://example.test/ng.pdf',
        },
      ],
      financials: [
        {
          id: 'fin-ng',
          companyName: 'NorgesGruppen ASA',
          orgNr: '819731322',
          year: 2024,
          revenueNok: '118000',
          operatingResult: '4800',
          ebitda: null,
          source: 'Årsrapport 2024',
        },
      ],
    })

    assert.equal(proposals.length, 1)
    assert.equal(proposals[0].status, 'proposal_requires_human_value_check')
    assert.equal(proposals[0].documentId, 'doc-ng')
  })

  it('marks duplicate document matches as skipped', () => {
    const proposals = buildCompanyFinancialCitationProposalRows({
      candidates,
      documents: [
        { id: 'doc-1', title: 'A', filePath: 'evidence-pack/arsrapporter/norgesgruppen-2024.pdf', url: null },
        { id: 'doc-2', title: 'B', filePath: 'evidence-pack/arsrapporter/norgesgruppen-2024.pdf', url: null },
      ],
      financials: [],
    })

    assert.deepEqual(proposals, [
      {
        status: 'skipped_document_not_unique',
        companyName: 'NorgesGruppen ASA',
        orgNr: '',
        year: 2024,
        financialId: '',
        documentId: '',
        documentPath: 'evidence-pack/arsrapporter/norgesgruppen-2024.pdf',
        documentUrl: '',
        source: '',
        revenueNok: '',
        operatingResult: '',
        ebitda: '',
        note: 'Expected exactly one local document for candidate path; found 2',
      },
    ])
  })

  it('formats CSV with escaping', () => {
    const csv = formatCompanyFinancialCitationProposalCsv([
      {
        status: 'proposal_requires_human_value_check',
        companyName: 'A, B AS',
        orgNr: '123',
        year: 2024,
        financialId: 'fin',
        documentId: 'doc',
        documentPath: 'path.pdf',
        documentUrl: '',
        source: 'Årsrapport "2024"',
        revenueNok: '1',
        operatingResult: '',
        ebitda: '',
        note: 'Check table',
      },
    ])

    assert.equal(csv.split('\n')[1], 'proposal_requires_human_value_check,"A, B AS",123,2024,fin,doc,path.pdf,,"Årsrapport ""2024""",1,,,Check table')
  })
})
